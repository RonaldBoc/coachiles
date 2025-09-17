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
  type: 'NEW_LEAD' | 'NEW_REVIEW' | 'LEAD_CLIENT_CONFIRMATION'
  target_user_id: string | null
  entity_type: string
  entity_id: string
  payload: Record<string, unknown>
  recipient_type: 'COACH' | 'USER' | 'EXTERNAL'
  recipient_coach_id: string | null
  recipient_user_id: string | null
  recipient_email: string | null
}

// Map event type -> template secret env variable
const templateEnvMap: Record<string, string> = {
  NEW_LEAD: 'POSTMARK_TEMPLATE_NEW_LEAD',
  NEW_REVIEW: 'POSTMARK_TEMPLATE_NEW_REVIEW',
  LEAD_CLIENT_CONFIRMATION: 'POSTMARK_TEMPLATE_LEAD_CLIENT_CONFIRMATION',
}

const BATCH_SIZE = 25

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  // Optional shared-secret protection for external cron callers; bypass if internal schedule header present
  const cronSecret = Deno.env.get('NOTIF_CRON_SECRET')
  const scheduleHeader =
    req.headers.get('x-supabase-schedule') || req.headers.get('x-supabase-schedule-id')
  if (cronSecret && !scheduleHeader) {
    const headerSecret =
      req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('secret')
    if (headerSecret !== cronSecret) return new Response('Forbidden', { status: 403 })
  }

  // Currently we ignore request body; reserved for future manual triggers

  const serverToken = Deno.env.get('POSTMARK_SERVER_TOKEN')
  const appBaseUrl = (
    Deno.env.get('APP_DASHBOARD_BASE_URL') || 'http://localhost:5173/coach/dashboard'
  ).trim()
  const emailFrom = (Deno.env.get('EMAIL_FROM') || 'dev@example.com').trim()
  const emailMode = (Deno.env.get('EMAIL_MODE') || 'dev').trim().toLowerCase()
  const dryRun = (Deno.env.get('EMAIL_DRY_RUN') || 'true').toLowerCase() === 'true'
  // In dev mode, default to sending to the FROM address if a separate dev recipient isn't set
  const devRecipient = (Deno.env.get('EMAIL_DEV_RECIPIENT') || emailFrom).trim()

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
    // Atomically claim events (PENDING -> PROCESSING) via new RPC function
    const events: NotificationEventRow[] = await rpcClaim(BATCH_SIZE)

    if (!events.length) {
      return json({ ok: true, processed: 0, dryRun, emailMode })
    }

    const results: Array<Record<string, unknown>> = []

    for (const ev of events) {
      const start = performance.now()
      const rawTemplate = Deno.env.get(templateEnvMap[ev.type])
      if (!rawTemplate) {
        await markError(ev.id, `Missing template env var for type ${ev.type}`)
        results.push({ id: ev.id, status: 'ERROR', reason: 'missing_template' })
        continue
      }
      const numericTemplateId = Number(rawTemplate)
      const useAlias = Number.isNaN(numericTemplateId) || numericTemplateId <= 0

      // Resolve recipient email based on recipient_type
      const resolved = await resolveRecipientEmail(ev)
      if (!resolved) {
        await markSkip(ev.id, 'recipient_email_not_found')
        results.push({ id: ev.id, status: 'SKIP', reason: 'recipient_email_not_found' })
        continue
      }

      const to = emailMode === 'dev' && devRecipient ? devRecipient : resolved

      const model = buildTemplateModel(ev, appBaseUrl)

      if (dryRun) {
        await markSent(ev.id, true)
        results.push({ id: ev.id, status: 'SENT', dryRun: true, to })
      } else {
        const mail: PostmarkMail = {
          From: emailFrom,
          To: to,
          TemplateModel: model,
          Headers:
            emailMode === 'dev' && devRecipient
              ? [
                  { Name: 'X-Original-Recipient', Value: resolved },
                  { Name: 'X-Dry-Run', Value: 'false' },
                ]
              : [{ Name: 'X-Dry-Run', Value: 'false' }],
        }
        if (useAlias) {
          mail.TemplateAlias = rawTemplate.trim()
        } else {
          mail.TemplateId = numericTemplateId
        }
        const sendRes = await sendPostmark(serverToken, mail)

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
  function sanitize(q: string) {
    return q.trim().replace(/;\s*$/, '')
  }

  // URL helpers: ensure absolute URLs regardless of provided base path
  function getOrigin(u: string) {
    try {
      return new URL(u).origin
    } catch {
      return u.replace(/\/+$/, '')
    }
  }
  function abs(origin: string, path: string) {
    // path should start with '/'; new URL will resolve against origin
    return new URL(path, origin).toString()
  }

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
      body: JSON.stringify({ query: sanitize(query) }),
    })
    if (!resp.ok) {
      throw new Error(`SQL error ${resp.status}: ${await resp.text()}`)
    }
    return await resp.json()
  }

  async function rpcClaim(batch: number) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/claim_notification_events`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ p_batch: batch, p_ignore_schedule: true }),
    })
    if (!resp.ok) {
      throw new Error(`Claim error ${resp.status}: ${await resp.text()}`)
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

  async function resolveRecipientEmail(ev: NotificationEventRow): Promise<string | null> {
    if (ev.recipient_type === 'EXTERNAL') return ev.recipient_email
    if (ev.recipient_type === 'COACH' && ev.recipient_coach_id) {
      // Wrap coach lookup with a harmless reference to notification_events for execute_sql guard
      const coachSql = `WITH ref AS (SELECT id FROM public.notification_events WHERE id=${ev.id})
        SELECT email FROM public.coaches WHERE id='${esc(ev.recipient_coach_id)}' LIMIT 1`
      const rows = await sql<{ email?: string }>(coachSql)
      if (rows.length && rows[0].email) return rows[0].email
      return null
    }
    if (ev.recipient_type === 'USER' && ev.recipient_user_id) {
      // Optionally implement lookup to auth.users via a secure RPC; placeholder returns null
      return null
    }
    // Legacy fallback
    if (ev.target_user_id) {
      const coachSql = `WITH ref AS (SELECT id FROM public.notification_events WHERE id=${ev.id})
        SELECT email FROM public.coaches WHERE id='${esc(ev.target_user_id)}' LIMIT 1`
      const rows = await sql<{ email?: string }>(coachSql)
      if (rows.length && rows[0].email) return rows[0].email
    }
    return null
  }

  function buildTemplateModel(ev: NotificationEventRow, baseUrl: string) {
    const payload = ev.payload || {}
    const origin = getOrigin(baseUrl)
    const common = { dashboard_url: abs(origin, '/coach/dashboard') }
    if (ev.type === 'NEW_LEAD') {
      return {
        ...common,
        // Minimal, non-sensitive model: just link to the leads page (absolute)
        lead_url: abs(origin, '/coach/leads'),
        demande_url: abs(origin, '/coach/leads'),
      }
    } else if (ev.type === 'NEW_REVIEW') {
      return {
        ...common,
        review_id: ev.entity_id,
        review_rating: payload['rating'],
        review_comment: payload['comment'],
        review_title: payload['title'],
        reviewer_name: payload['reviewer_name'],
        review_url: abs(origin, '/coach/dashboard'),
        // Back-compat aliases for legacy templates
        comment: payload['comment'],
        commenter_name: payload['reviewer_name'],
        action_url: abs(origin, '/coach/dashboard'),
      }
    } else if (ev.type === 'LEAD_CLIENT_CONFIRMATION') {
      return {
        lead_id: ev.entity_id,
        client_name: payload['client_name'],
        goals: payload['goals'],
        coach_assigned: payload['coach_assigned'],
        status: payload['status'],
        // Public landing for client
        portal_url: abs(origin, '/'),
      }
    }
    return { ...common }
  }

  interface PostmarkMail {
    From: string
    To: string
    TemplateModel: Record<string, unknown>
    TemplateId?: number
    TemplateAlias?: string
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
