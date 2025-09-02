// Notifications Worker Edge Function
// Processes pending notification_events and sends emails via Postmark
// Supports DRY RUN & dev recipient override

// deno-lint-ignore-file no-explicit-any
// Declare Deno global for TypeScript without bundling full types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any
// @ts-expect-error Deno provide import resolution at runtime
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationEventRow {
  id: number
  type: 'NEW_LEAD' | 'NEW_REVIEW'
  target_user_id: string
  entity_type: string
  entity_id: string
  payload: Record<string, unknown>
}

// Map event type -> template secret env variable
const templateEnvMap: Record<string, string> = {
  NEW_LEAD: 'POSTMARK_TEMPLATE_NEW_LEAD',
  NEW_REVIEW: 'POSTMARK_TEMPLATE_NEW_REVIEW',
}

const BATCH_SIZE = 25

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  // Optional shared-secret protection for external cron callers
  const cronSecret = Deno.env.get('NOTIF_CRON_SECRET')
  if (cronSecret) {
    const headerSecret =
      req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('secret')
    if (headerSecret !== cronSecret) {
      return new Response('Forbidden', { status: 403 })
    }
  }

  // Currently we ignore request body; reserved for future manual triggers

  const serverToken = Deno.env.get('POSTMARK_SERVER_TOKEN')
  const appBaseUrl =
    Deno.env.get('APP_DASHBOARD_BASE_URL') || 'http://localhost:5173/coach/dashboard'
  const emailFrom = Deno.env.get('EMAIL_FROM') || 'dev@example.com'
  const emailMode = Deno.env.get('EMAIL_MODE') || 'dev'
  const dryRun = (Deno.env.get('EMAIL_DRY_RUN') || 'true').toLowerCase() === 'true'
  const devRecipient = Deno.env.get('EMAIL_DEV_RECIPIENT') || ''

  if (!serverToken) {
    return json({ error: 'Missing POSTMARK_SERVER_TOKEN' }, 500)
  }

  try {
    // Use service role key to query (supabase supplies via env SUPABASE_SERVICE_ROLE_KEY)
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (!serviceKey || !supabaseUrl) {
      return json({ error: 'Missing SUPABASE service environment variables' }, 500)
    }

    // Fetch pending events via SQL RPC (we'll call the rest endpoint directly)
    // Using fetch to the rest/sql endpoint with service key
    const selectSql = `
      WITH cte AS (
        SELECT id, type, target_user_id, entity_type, entity_id, payload
        FROM public.notification_events
        WHERE status='PENDING' AND next_attempt_at <= now()
        ORDER BY created_at ASC
        LIMIT ${BATCH_SIZE}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE public.notification_events e
      SET status = 'PROCESSING'
      FROM cte
      WHERE e.id = cte.id
      RETURNING e.id, e.type, e.target_user_id, e.entity_type, e.entity_id, e.payload;`

    const events: NotificationEventRow[] = await sql(selectSql)

    if (!events.length) {
      return json({ ok: true, processed: 0, dryRun, emailMode })
    }

    const results: Array<Record<string, unknown>> = []

    for (const ev of events) {
      const start = performance.now()
      const templateId = Deno.env.get(templateEnvMap[ev.type])
      if (!templateId) {
        await markError(ev.id, `Missing template env var for type ${ev.type}`)
        results.push({ id: ev.id, status: 'ERROR', reason: 'missing_template' })
        continue
      }

      // Get recipient email -> assume coaches.id == auth.users.id
      const userEmail = await getUserEmail(ev.target_user_id)
      if (!userEmail) {
        await markSkip(ev.id, 'user_email_not_found')
        results.push({ id: ev.id, status: 'SKIP', reason: 'user_email_not_found' })
        continue
      }

      const to = emailMode === 'dev' && devRecipient ? devRecipient : userEmail

      const model = buildTemplateModel(ev, appBaseUrl)

      if (dryRun) {
        await markSent(ev.id, true)
        results.push({ id: ev.id, status: 'SENT', dryRun: true, to })
      } else {
        const sendRes = await sendPostmark(serverToken, {
          From: emailFrom,
          To: to,
          TemplateId: Number(templateId),
          TemplateModel: model,
          Headers:
            emailMode === 'dev' && devRecipient
              ? [
                  { Name: 'X-Original-Recipient', Value: userEmail },
                  { Name: 'X-Dry-Run', Value: 'false' },
                ]
              : [{ Name: 'X-Dry-Run', Value: 'false' }],
        })

        if (sendRes.ok) {
          await markSent(ev.id, false)
          results.push({ id: ev.id, status: 'SENT', to, ms: Math.round(performance.now() - start) })
        } else {
          const { status, body } = sendRes
          await markError(ev.id, `Postmark ${status}: ${body}`)
          results.push({ id: ev.id, status: 'ERROR', to, error: body })
        }
      }
    }

    return json({ ok: true, processed: events.length, results, dryRun, emailMode })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }

  // Utility: perform SQL returning JSON array
  async function sql<T = Record<string, unknown>>(query: string): Promise<T[]> {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ query }),
    })
    if (!resp.ok) {
      throw new Error(`SQL error ${resp.status}: ${await resp.text()}`)
    }
    return await resp.json()
  }

  async function exec(query: string) {
    await sql(query)
  }

  function esc(str: string) {
    return str.replace(/'/g, "''")
  }

  async function markSent(id: number, dry: boolean) {
    await exec(
      `UPDATE public.notification_events SET status='SENT', processed_at=now()${dry ? ", error_message='DRY_RUN'" : ''} WHERE id=${id}`,
    )
  }
  async function markSkip(id: number, reason: string) {
    await exec(
      `UPDATE public.notification_events SET status='SKIP', processed_at=now(), error_message='${esc(reason)}' WHERE id=${id}`,
    )
  }
  async function markError(id: number, err: string) {
    // increment retry_count & schedule backoff (min 2^retry minutes up to 60m)
    await exec(`UPDATE public.notification_events
      SET status='PENDING', retry_count=retry_count+1,
          next_attempt_at = now() + LEAST( (interval '1 minute' * power(2, retry_count+1)), interval '60 minutes'),
          error_message='${esc(err).slice(0, 500)}'
      WHERE id=${id} AND retry_count < 5`)
    // If exceeded retries set final ERROR
    await exec(`UPDATE public.notification_events
      SET status='ERROR', processed_at=now()
      WHERE id=${id} AND retry_count >= 5 AND status='PENDING'`)
  }

  async function getUserEmail(userId: string): Promise<string | null> {
    // Try coaches first
    const coachSql = `SELECT email FROM public.coaches WHERE id='${esc(userId)}' LIMIT 1`
    const rows = await sql<{ email?: string }>(coachSql)
    if (rows.length && typeof rows[0].email === 'string') return rows[0].email
    // Fallback auth.users via RPC not accessible; you could create a secure function if needed
    return null
  }

  function buildTemplateModel(ev: NotificationEventRow, baseUrl: string) {
    const payload = ev.payload || {}
    const common = { dashboard_url: baseUrl }
    if (ev.type === 'NEW_LEAD') {
      return {
        ...common,
        lead_id: ev.entity_id,
        client_name: payload['client_name'],
        goals: payload['goals'],
        lead_url: `${baseUrl}/leads/${ev.entity_id}`,
      }
    } else if (ev.type === 'NEW_REVIEW') {
      return {
        ...common,
        review_id: ev.entity_id,
        review_rating: payload['rating'],
        review_comment: payload['comment'],
        review_url: `${baseUrl}/reviews/${ev.entity_id}`,
      }
    }
    return { ...common }
  }

  interface PostmarkMail {
    From: string
    To: string
    TemplateId: number
    TemplateModel: Record<string, unknown>
    Headers?: Array<{ Name: string; Value: string }>
  }
  async function sendPostmark(token: string, mail: PostmarkMail) {
    const res = await fetch('https://api.postmarkapp.com/email/withTemplate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': token,
      },
      body: JSON.stringify(mail),
    })
    const text = await res.text()
    return { ok: res.ok, status: res.status, body: text }
  }

  function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    })
  }
})
