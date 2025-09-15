import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-authorization',
}

// Helpers
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const RECAPTCHA_SECRET = Deno.env.get('RECAPTCHA_SECRET') // Add to project env

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase env vars')
}

const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!)

interface IncomingBody {
  token?: string
  coachId?: string
  serviceId?: string
  clientName?: string
  clientEmail?: string
  rating?: number
  comment?: string
  title?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders, status: 204 })
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  try {
    const body: IncomingBody = await req.json()

    const { token, coachId, serviceId, clientName, clientEmail, rating, comment, title } = body

    if (!coachId || !clientName || !clientEmail || !rating) {
      return json({ error: 'Missing required fields' }, 400)
    }

    if (!RECAPTCHA_SECRET) {
      console.warn('RECAPTCHA_SECRET not set – continuing WITHOUT verification (unsafe)')
    } else {
      if (!token) return json({ error: 'Missing captcha token' }, 400)

      // Verify with Google reCAPTCHA v2/v3 endpoint
      const params = new URLSearchParams({ secret: RECAPTCHA_SECRET, response: token })
      const verifyResp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: params,
      })
      const verifyData = (await verifyResp.json()) as {
        success: boolean
        score?: number
        action?: string
        'error-codes'?: string[]
      }
      if (!verifyData.success) {
        return json(
          { error: 'Captcha verification failed', details: verifyData['error-codes'] },
          400,
        )
      }
      // (Optional) enforce minimum score for v3
      if (typeof verifyData.score === 'number' && verifyData.score < 0.4) {
        return json({ error: 'Captcha score too low' }, 400)
      }
    }

    // Insert review (unpublished/pending) - mimic logic in supabaseReviewApi
    const now = new Date().toISOString()
    const { error } = await supabase.from('reviews').insert({
      coach_id: coachId,
      service_id: serviceId,
      client_name: clientName.substring(0, 50),
      client_email: clientEmail.substring(0, 120),
      rating,
      title: title?.substring(0, 120),
      comment: comment?.substring(0, 1000),
      is_anonymous: false,
      is_verified: false,
      is_published: false,
      moderation_status: 'pending',
      created_at: now,
      updated_at: now,
    })
    if (error) {
      console.error('Insert error', error)
      return json({ error: 'Database insert failed' }, 500)
    }

    return json({ status: 'ok' }, 201)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return json({ error: message }, 500)
  }
})
