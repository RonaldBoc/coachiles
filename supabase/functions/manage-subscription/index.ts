import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

// CORS headers used for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-authorization',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
      },
      status: 204,
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { coachId, action } = await req.json()
    if (!coachId || !action) {
      return new Response(JSON.stringify({ error: 'Missing coachId or action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!['cancel_at_period_end', 'reactivate'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Find active subscription for coach to get Stripe subscription id
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('coach_id', coachId)
      .eq('is_active', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (subError || !sub) {
      return new Response(
        JSON.stringify({ error: 'Active subscription not found for coach', details: subError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        },
      )
    }

    if (!sub.stripe_subscription_id) {
      return new Response(
        JSON.stringify({ error: 'Stripe subscription id not set yet. Try again shortly.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409,
        },
      )
    }

    // Update Stripe subscription
    const cancelAtPeriodEnd = action === 'cancel_at_period_end'
    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: cancelAtPeriodEnd,
    })

    // Reflect in DB using secure RPCs
    const rpcName = cancelAtPeriodEnd
      ? 'cancel_subscription_at_period_end'
      : 'reactivate_subscription'

    const { data: rpcResult, error: rpcError } = await supabase.rpc(rpcName, {
      coach_id_param: coachId,
    })

    if (rpcError) {
      console.error('RPC error while syncing DB:', rpcError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        stripe: {
          id: updated.id,
          status: updated.status,
          cancel_at_period_end: updated.cancel_at_period_end,
        },
        rpc: rpcResult,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
