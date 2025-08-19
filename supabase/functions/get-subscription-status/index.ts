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

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    status,
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
      },
      status: 204,
    })
  }

  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  try {
    const { coachId } = await req.json()
    if (!coachId) return json({ error: 'Missing coachId' }, 400)

    // Find latest active subscription for coach
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id, stripe_customer_id, status')
      .eq('coach_id', coachId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !sub) return json({ error: 'Active subscription not found' }, 404)
    if (!sub.stripe_subscription_id || !sub.stripe_customer_id)
      return json({ error: 'Stripe identifiers missing' }, 409)

    const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id, {
      expand: ['default_payment_method', 'customer.invoice_settings.default_payment_method'],
    })

    // Determine default payment method
    let pm: Stripe.PaymentMethod | null = null
    const subPM = stripeSub.default_payment_method as Stripe.PaymentMethod | null
    const customer = (stripeSub.customer as Stripe.Customer) || null
    const custPM = (customer?.invoice_settings?.default_payment_method ||
      null) as Stripe.PaymentMethod | null

    if (subPM && subPM.type === 'card') pm = subPM
    else if (custPM && custPM.type === 'card') pm = custPM
    else {
      // Fallback: list customer card payment methods
      const list = await stripe.paymentMethods.list({
        customer: sub.stripe_customer_id,
        type: 'card',
        limit: 1,
      })
      pm = list.data[0] || null
    }

    const defaultPaymentMethod =
      pm && pm.card
        ? {
            id: pm.id,
            brand: pm.card.brand,
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
          }
        : null

    // Upcoming invoice info
    let upcoming: { amount: number; date: string } | null = null
    try {
      const inv = await stripe.invoices.retrieveUpcoming({
        customer: sub.stripe_customer_id,
        subscription: sub.stripe_subscription_id,
      })
      if (inv) {
        const amount = (inv.amount_due ?? 0) / 100
        const date = inv.next_payment_attempt
          ? new Date(inv.next_payment_attempt * 1000).toISOString()
          : stripeSub.current_period_end
            ? new Date(stripeSub.current_period_end * 1000).toISOString()
            : null
        if (date) upcoming = { amount, date }
      }
    } catch {
      // Not critical; ignore
    }

    const payload = {
      subscription: {
        status: stripeSub.status,
        cancel_at_period_end: stripeSub.cancel_at_period_end,
        current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
      },
      defaultPaymentMethod,
      upcomingInvoice: upcoming,
    }

    return json(payload)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return json({ error: message }, 500)
  }
})
