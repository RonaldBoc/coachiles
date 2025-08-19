import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Stripe recommends using their official library for signature verification
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

function mapIsActive(status: string | null | undefined): boolean {
  // Treat active, trialing, past_due as active; canceled/unpaid/incomplete as inactive
  if (!status) return false
  return status === 'active' || status === 'trialing' || status === 'past_due'
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    console.error('❌ Missing stripe-signature header')
    return new Response('Missing signature', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    // Use async verification for Deno Edge/Web Crypto environments
    event = await stripe.webhooks.constructEventAsync(body, sig, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err)
    return new Response('Webhook Error: Invalid signature', { status: 400 })
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const coachId = session.metadata?.coachId

    console.log('➡️ checkout.session.completed', {
      session_id: session.id,
      coachId,
      customer: session.customer,
      subscription: session.subscription,
    })

    if (!coachId) {
      console.error('❌ Missing coachId in Stripe session metadata')
      return new Response('Missing coachId', { status: 400 })
    }

    // Extract Stripe IDs first
    const stripeCustomerId =
      typeof session.customer === 'string'
        ? session.customer
        : (session.customer as Stripe.Customer | null)?.id || null

    const stripeSubscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as Stripe.Subscription | null)?.id || null

    if (!stripeSubscriptionId) {
      console.warn(
        '⚠️ No stripeSubscriptionId on session; skipping create. Will rely on later events.',
      )
      return new Response('OK', { status: 200 })
    }

    // Fetch subscription from Stripe for accurate dates
    let stripeSub: Stripe.Subscription | null = null
    try {
      stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    } catch (e) {
      console.error('⚠️ Failed to retrieve Stripe subscription:', e)
    }

    // 1) If we already have a row for this Stripe subscription, just update it (idempotent)
    const { data: existingByStripe, error: existingStripeErr } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .limit(1)
      .maybeSingle()

    if (existingByStripe && !existingStripeErr) {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }
      if (stripeCustomerId) payload['stripe_customer_id'] = stripeCustomerId
      if (stripeSub?.current_period_start)
        payload['current_period_start'] = new Date(
          stripeSub.current_period_start * 1000,
        ).toISOString()
      if (stripeSub?.current_period_end)
        payload['current_period_end'] = new Date(stripeSub.current_period_end * 1000).toISOString()
      if (typeof stripeSub?.cancel_at_period_end === 'boolean')
        payload['auto_renew'] = !stripeSub.cancel_at_period_end
      if (stripeSub?.current_period_end)
        payload['next_payment_at'] = new Date(stripeSub.current_period_end * 1000).toISOString()

      const { error: updErr } = await supabase
        .from('subscriptions')
        .update(payload)
        .eq('id', existingByStripe.id)

      if (updErr) console.error('❌ Failed to idempotently update existing Stripe sub row:', updErr)
      else console.log('✅ Idempotent update applied to row', existingByStripe.id)

      return new Response('OK', { status: 200 })
    }

    // 2) If coach has a recent active row without Stripe IDs, attach IDs to that row (no new insert)
    const { data: latestActiveNoStripe, error: latestNoStripeErr } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('coach_id', coachId)
      .eq('is_active', true)
      .is('stripe_subscription_id', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestActiveNoStripe && !latestNoStripeErr) {
      const updatePayload: Record<string, unknown> = {
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: new Date().toISOString(),
      }
      if (stripeCustomerId) updatePayload['stripe_customer_id'] = stripeCustomerId
      if (stripeSub?.current_period_start)
        updatePayload['current_period_start'] = new Date(
          stripeSub.current_period_start * 1000,
        ).toISOString()
      if (stripeSub?.current_period_end)
        updatePayload['current_period_end'] = new Date(
          stripeSub.current_period_end * 1000,
        ).toISOString()
      if (typeof stripeSub?.cancel_at_period_end === 'boolean')
        updatePayload['auto_renew'] = !stripeSub.cancel_at_period_end
      if (stripeSub?.current_period_end)
        updatePayload['next_payment_at'] = new Date(
          stripeSub.current_period_end * 1000,
        ).toISOString()

      const { error: updErr } = await supabase
        .from('subscriptions')
        .update(updatePayload)
        .eq('id', latestActiveNoStripe.id)

      if (updErr) console.error('❌ Failed to attach Stripe IDs to latest active row:', updErr)
      else console.log('✅ Attached Stripe IDs to latest active row', latestActiveNoStripe.id)

      return new Response('OK', { status: 200 })
    }

    // 3) No existing rows map to this Stripe subscription → create a new subscription via RPC once
    const { data, error } = await supabase.rpc('create_coach_subscription', {
      coach_id_param: coachId,
      plan_type_param: 'premium',
    })

    if (error) {
      console.error('❌ Failed to create coach subscription via RPC:', error)
      return new Response('Failed to create subscription', { status: 500 })
    }

    const result = data as unknown as { success?: boolean; subscription_id?: string } | null
    if (!result || result.success !== true || !result.subscription_id) {
      console.error('❌ RPC returned unsuccessful result:', result)
      return new Response('Subscription RPC failed', { status: 500 })
    }

    console.log('✅ Subscription created for coach:', coachId, 'id:', result.subscription_id)

    const updatePayload: Record<string, unknown> = {
      stripe_subscription_id: stripeSubscriptionId,
      updated_at: new Date().toISOString(),
    }
    if (stripeCustomerId) updatePayload['stripe_customer_id'] = stripeCustomerId
    if (stripeSub?.current_period_start)
      updatePayload['current_period_start'] = new Date(
        stripeSub.current_period_start * 1000,
      ).toISOString()
    if (stripeSub?.current_period_end)
      updatePayload['current_period_end'] = new Date(
        stripeSub.current_period_end * 1000,
      ).toISOString()
    if (typeof stripeSub?.cancel_at_period_end === 'boolean')
      updatePayload['auto_renew'] = !stripeSub.cancel_at_period_end
    if (stripeSub?.current_period_end)
      updatePayload['next_payment_at'] = new Date(stripeSub.current_period_end * 1000).toISOString()

    const { error: updErr } = await supabase
      .from('subscriptions')
      .update(updatePayload)
      .eq('id', result.subscription_id)

    if (updErr) console.error('❌ Failed to update new subscription with Stripe IDs:', updErr)
    else console.log('✅ Saved Stripe IDs on new subscription', result.subscription_id)

    return new Response('OK', { status: 200 })
  }

  // Sync subscription updates from Stripe
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const stripeSubId = sub.id
    const status = sub.status
    const cancelAtPeriodEnd = sub.cancel_at_period_end
    const currentStart = sub.current_period_start
    const currentEnd = sub.current_period_end

    const updatePayload: Record<string, unknown> = {
      status,
      is_active: mapIsActive(status),
      auto_renew: !cancelAtPeriodEnd,
      updated_at: new Date().toISOString(),
    }
    if (currentStart)
      updatePayload['current_period_start'] = new Date(currentStart * 1000).toISOString()
    if (currentEnd) {
      updatePayload['current_period_end'] = new Date(currentEnd * 1000).toISOString()
      updatePayload['next_payment_at'] = new Date(currentEnd * 1000).toISOString()
    }

    const { error: updErr } = await supabase
      .from('subscriptions')
      .update(updatePayload)
      .eq('stripe_subscription_id', stripeSubId)

    if (updErr) console.error('❌ Failed to sync customer.subscription.updated:', updErr)
    else console.log('✅ Synced customer.subscription.updated for', stripeSubId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const stripeSubId = sub.id
    const { error: updErr } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        is_active: false,
        auto_renew: false,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubId)

    if (updErr) console.error('❌ Failed to sync customer.subscription.deleted:', updErr)
    else console.log('✅ Synced customer.subscription.deleted for', stripeSubId)
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const stripeSubId = typeof invoice.subscription === 'string' ? invoice.subscription : null
    if (stripeSubId) {
      const paidAtSec = invoice.status_transitions?.paid_at
      const paidAt = paidAtSec ? new Date(paidAtSec * 1000).toISOString() : new Date().toISOString()
      const { error: updErr } = await supabase
        .from('subscriptions')
        .update({
          last_payment_at: paidAt,
          status: 'active',
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', stripeSubId)

      if (updErr) console.error('❌ Failed to sync invoice.payment_succeeded:', updErr)
      else console.log('✅ Synced invoice.payment_succeeded for', stripeSubId)
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const stripeSubId = typeof invoice.subscription === 'string' ? invoice.subscription : null
    if (stripeSubId) {
      const { error: updErr } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', stripeSubId)

      if (updErr) console.error('❌ Failed to sync invoice.payment_failed:', updErr)
      else console.log('✅ Synced invoice.payment_failed for', stripeSubId)
    }
  }

  return new Response('Webhook received', { status: 200 })
})
