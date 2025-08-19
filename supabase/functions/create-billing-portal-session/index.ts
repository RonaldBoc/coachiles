import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const FRONTEND_URL = Deno.env.get('FRONTEND_URL')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-authorization',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  try {
    const { coachId, returnUrl } = await req.json()
    if (!coachId) return json({ error: 'Missing coachId' }, 400)

    // Lookup Stripe Customer for this coach
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('coach_id', coachId)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !sub?.stripe_customer_id) {
      return json({ error: 'Stripe customer not found for coach' }, 404)
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: returnUrl || FRONTEND_URL || 'https://example.com',
    })

    return json({ url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return json({ error: message }, 500)
  }
})
