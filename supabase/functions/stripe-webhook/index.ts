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

    // If subscription id is missing, still try to record a payment row using payment_intent
    if (!stripeSubscriptionId) {
      try {
        const txId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : typeof session.invoice === 'string'
              ? session.invoice
              : null
        if (!txId) {
          console.log(
            'ℹ️ Skipping payment insert (branch: no subscription id) – no payment_intent or invoice id yet',
            {
              sessionId: session.id,
              payment_intent: session.payment_intent,
              invoice: session.invoice,
            },
          )
        }
        if (txId && coachId) {
          const { data: existing, error: exErr } = await supabase
            .from('payments')
            .select('id')
            .eq('transaction_id', txId)
            .limit(1)
            .maybeSingle()
          if (!existing) {
            const amount = Math.max(0, session.amount_total || 0) / 100
            const currency = (session.currency || 'EUR').toUpperCase()
            const { error: insErr } = await supabase.from('payments').insert({
              coach_id: coachId,
              amount,
              currency,
              payment_method: 'stripe',
              transaction_id: txId,
              status: 'completed',
              payment_type: 'subscription',
              processed_at: new Date().toISOString(),
              description: `Stripe checkout session ${session.id}`,
              platform_fee: 0,
              payment_processor_fee: 0,
              coach_earnings: amount,
              metadata: { stripeCheckoutSessionId: session.id } as Record<string, unknown>,
            })
            if (insErr) console.error('❌ Failed to insert payment on checkout.session:', insErr)
            else console.log('✅ Recorded payment from checkout.session for coach', coachId)
          } else if (exErr) {
            console.error('⚠️ Payment existence check failed on checkout.session:', exErr)
          } else {
            console.log('ℹ️ Payment already exists for checkout.session tx', txId)
          }
        }
      } catch (e) {
        console.error('⚠️ Failed to record payment from checkout.session:', e)
      }
      console.warn(
        '⚠️ No stripeSubscriptionId on session; skipping subscription creation. Will rely on later events.',
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

      // Also record a payment row from checkout.session
      try {
        const txId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : typeof session.invoice === 'string'
              ? session.invoice
              : null
        if (!txId) {
          console.log(
            'ℹ️ Skipping payment insert (branch: existingByStripe) – no payment_intent or invoice id yet',
            {
              sessionId: session.id,
              payment_intent: session.payment_intent,
              invoice: session.invoice,
            },
          )
        }
        if (txId && coachId) {
          const { data: existing, error: exErr } = await supabase
            .from('payments')
            .select('id')
            .eq('transaction_id', txId)
            .limit(1)
            .maybeSingle()
          if (!existing) {
            const amount = Math.max(0, session.amount_total || 0) / 100
            const currency = (session.currency || 'EUR').toUpperCase()
            const { error: insErr } = await supabase.from('payments').insert({
              coach_id: coachId,
              amount,
              currency,
              payment_method: 'stripe',
              transaction_id: txId,
              status: 'completed',
              payment_type: 'subscription',
              processed_at: new Date().toISOString(),
              description: `Stripe checkout session ${session.id}`,
              platform_fee: 0,
              payment_processor_fee: 0,
              coach_earnings: amount,
              metadata: { stripeCheckoutSessionId: session.id } as Record<string, unknown>,
            })
            if (insErr) console.error('❌ Failed to insert payment on checkout.session:', insErr)
            else console.log('✅ Recorded payment from checkout.session for coach', coachId)
          } else if (exErr) {
            console.error('⚠️ Payment existence check failed on checkout.session:', exErr)
          } else {
            console.log('ℹ️ Payment already exists for checkout.session tx', txId)
          }
        }
      } catch (e) {
        console.error('⚠️ Failed to record payment from checkout.session:', e)
      }
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

      // Also record a payment row from checkout.session
      try {
        const txId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : typeof session.invoice === 'string'
              ? session.invoice
              : null
        if (!txId) {
          console.log(
            'ℹ️ Skipping payment insert (branch: latestActiveNoStripe) – no payment_intent or invoice id yet',
            {
              sessionId: session.id,
              payment_intent: session.payment_intent,
              invoice: session.invoice,
            },
          )
        }
        if (txId && coachId) {
          const { data: existing, error: exErr } = await supabase
            .from('payments')
            .select('id')
            .eq('transaction_id', txId)
            .limit(1)
            .maybeSingle()
          if (!existing) {
            const amount = Math.max(0, session.amount_total || 0) / 100
            const currency = (session.currency || 'EUR').toUpperCase()
            const { error: insErr } = await supabase.from('payments').insert({
              coach_id: coachId,
              amount,
              currency,
              payment_method: 'stripe',
              transaction_id: txId,
              status: 'completed',
              payment_type: 'subscription',
              processed_at: new Date().toISOString(),
              description: `Stripe checkout session ${session.id}`,
              platform_fee: 0,
              payment_processor_fee: 0,
              coach_earnings: amount,
              metadata: { stripeCheckoutSessionId: session.id } as Record<string, unknown>,
            })
            if (insErr) console.error('❌ Failed to insert payment on checkout.session:', insErr)
            else console.log('✅ Recorded payment from checkout.session for coach', coachId)
          } else if (exErr) {
            console.error('⚠️ Payment existence check failed on checkout.session:', exErr)
          } else {
            console.log('ℹ️ Payment already exists for checkout.session tx', txId)
          }
        }
      } catch (e) {
        console.error('⚠️ Failed to record payment from checkout.session:', e)
      }
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

    // Also record a payment row from checkout.session
    try {
      const txId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : typeof session.invoice === 'string'
            ? session.invoice
            : null
      if (!txId) {
        console.log(
          'ℹ️ Skipping payment insert (branch: create new sub) – no payment_intent or invoice id yet',
          {
            sessionId: session.id,
            payment_intent: session.payment_intent,
            invoice: session.invoice,
          },
        )
      }
      if (txId && coachId) {
        const { data: existing, error: exErr } = await supabase
          .from('payments')
          .select('id')
          .eq('transaction_id', txId)
          .limit(1)
          .maybeSingle()
        if (!existing) {
          const amount = Math.max(0, session.amount_total || 0) / 100
          const currency = (session.currency || 'EUR').toUpperCase()
          const { error: insErr } = await supabase.from('payments').insert({
            coach_id: coachId,
            amount,
            currency,
            payment_method: 'stripe',
            transaction_id: txId,
            status: 'completed',
            payment_type: 'subscription',
            processed_at: new Date().toISOString(),
            description: `Stripe checkout session ${session.id}`,
            platform_fee: 0,
            payment_processor_fee: 0,
            coach_earnings: amount,
            metadata: { stripeCheckoutSessionId: session.id } as Record<string, unknown>,
          })
          if (insErr) console.error('❌ Failed to insert payment on checkout.session:', insErr)
          else console.log('✅ Recorded payment from checkout.session for coach', coachId)
        } else if (exErr) {
          console.error('⚠️ Payment existence check failed on checkout.session:', exErr)
        } else {
          console.log('ℹ️ Payment already exists for checkout.session tx', txId)
        }
      }
    } catch (e) {
      console.error('⚠️ Failed to record payment from checkout.session:', e)
    }
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
    const stripeCustomerId =
      typeof invoice.customer === 'string'
        ? (invoice.customer as string)
        : (invoice.customer as Stripe.Customer | null)?.id || null
    console.log('🔎 invoice.payment_succeeded received', {
      invoiceId: invoice.id,
      stripeSubId,
      coachMeta: invoice.lines?.data?.[0]?.metadata?.coachId,
      amount_paid: invoice.amount_paid,
      payment_intent: invoice.payment_intent,
    })
    if (stripeSubId) {
      const paidAtSec = invoice.status_transitions?.paid_at
      const paidAt = paidAtSec ? new Date(paidAtSec * 1000).toISOString() : new Date().toISOString()
      const { data: updatedSubs, error: updErr } = await supabase
        .from('subscriptions')
        .update({
          last_payment_at: paidAt,
          status: 'active',
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', stripeSubId)
        .select('id, coach_id')
        .limit(1)

      if (updErr) console.error('❌ Failed to sync invoice.payment_succeeded:', updErr)
      else console.log('✅ Synced invoice.payment_succeeded for', stripeSubId)

      // Upsert structured invoice record (subscription_invoices table)
      try {
        // Resolve coach + internal subscription UUID
        const internalSubId: string | null = updatedSubs?.[0]?.id ?? null
        let coachIdForInvoice: string | null = updatedSubs?.[0]?.coach_id ?? null
        if (!coachIdForInvoice) {
          const { data: subRow, error: subErr } = await supabase
            .from('subscriptions')
            .select('id, coach_id')
            .eq('stripe_subscription_id', stripeSubId)
            .limit(1)
            .maybeSingle()
          if (subErr) console.error('⚠️ Failed subscription lookup for invoice upsert:', subErr)
          coachIdForInvoice = (subRow?.coach_id as string | undefined) || null
        }
        if (coachIdForInvoice) {
          const line = invoice.lines?.data?.[0]
          const periodStartSec = line?.period?.start || invoice.period_start || null
          const periodEndSec = line?.period?.end || invoice.period_end || null
          const periodStart = periodStartSec ? new Date(periodStartSec * 1000).toISOString() : null
          const periodEnd = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null
          const amountCents = invoice.amount_paid ?? invoice.total ?? 0
          const description =
            line?.description || invoice.number || `Stripe subscription invoice ${invoice.id}`
          const status = invoice.status || 'paid'
          const metadata: Record<string, unknown> = {
            ...(invoice.metadata || {}),
            line_metadata: line?.metadata || {},
            subscription_item_ids: invoice.lines?.data?.map((l) => l.id) || [],
          }
          const { error: upsertErr } = await supabase.rpc('upsert_subscription_invoice', {
            p_coach_id: coachIdForInvoice,
            p_subscription_id: internalSubId,
            p_stripe_invoice_id: invoice.id,
            p_stripe_customer_id: stripeCustomerId,
            p_hosted_invoice_url: invoice.hosted_invoice_url || null,
            p_pdf_url: invoice.invoice_pdf || null,
            p_amount: amountCents,
            p_currency: invoice.currency || 'eur',
            p_status: status,
            p_period_start: periodStart,
            p_period_end: periodEnd,
            p_description: description,
            p_metadata: metadata,
          })
          if (upsertErr) console.error('❌ Failed upsert_subscription_invoice:', upsertErr)
          else console.log('✅ Upserted subscription invoice', invoice.id)
        } else {
          console.warn('⚠️ Unable to resolve coach to upsert invoice', invoice.id)
        }
      } catch (e) {
        console.error('⚠️ Unexpected error during invoice upsert:', e)
      }

      // Also record a payment row for this successful subscription invoice
      try {
        // Prefer the coach_id from the just-updated row, else lookup by sub/customer id
        let coachIdForPayment: string | null = updatedSubs?.[0]?.coach_id ?? null
        if (!coachIdForPayment) {
          const { data: subRow, error: subErr } = await supabase
            .from('subscriptions')
            .select('coach_id')
            .or(
              [
                stripeSubId ? `stripe_subscription_id.eq.${stripeSubId}` : '',
                stripeCustomerId ? `stripe_customer_id.eq.${stripeCustomerId}` : '',
              ]
                .filter(Boolean)
                .join(',') || 'id.eq.00000000-0000-0000-0000-000000000000',
            )
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (subErr) {
            console.error('⚠️ Failed to lookup subscription -> coach for payment record:', subErr)
          }
          coachIdForPayment = (subRow?.coach_id as string | undefined) ?? null
        }

        if (coachIdForPayment) {
          console.log('🧮 Preparing to insert payment row', {
            coachId: coachIdForPayment,
            invoiceId: invoice.id,
            subscriptionId: stripeSubId,
          })
          // Determine unique transaction id to ensure idempotency
          const transactionId =
            typeof invoice.payment_intent === 'string'
              ? (invoice.payment_intent as string)
              : invoice.id

          // Skip if we already recorded this transaction id
          const { data: existingPayment, error: existingErr } = await supabase
            .from('payments')
            .select('id')
            .eq('transaction_id', transactionId)
            .limit(1)
            .maybeSingle()

          if (existingErr) {
            console.error('⚠️ Failed to check existing payment by transaction_id:', existingErr)
          }

          if (!existingPayment) {
            const amountCents = invoice.amount_paid ?? invoice.total ?? 0
            const amount = Math.max(0, amountCents) / 100
            const currency = (invoice.currency || 'EUR').toUpperCase()
            const lineDesc = invoice.lines?.data?.[0]?.description
            const description =
              lineDesc || invoice.number || `Stripe subscription invoice ${invoice.id}`

            const insertPayload = {
              coach_id: coachIdForPayment,
              amount,
              currency,
              payment_method: 'stripe',
              transaction_id: transactionId,
              status: 'completed',
              payment_type: 'subscription',
              processed_at: new Date().toISOString(),
              description,
              platform_fee: 0,
              payment_processor_fee: 0,
              coach_earnings: amount, // Adjust later if platform fees/commission apply
              metadata: {
                stripeInvoiceId: invoice.id,
                stripeSubscriptionId: stripeSubId,
                hostedInvoiceUrl: invoice.hosted_invoice_url || null,
              } as Record<string, unknown>,
            }

            const { error: insErr } = await supabase.from('payments').insert(insertPayload)
            if (insErr) console.error('❌ Failed to insert payment record:', insErr)
            else console.log('✅ Recorded subscription payment for coach', coachIdForPayment)
          } else {
            console.log('ℹ️ Payment already recorded for transaction_id', transactionId)
          }
        } else {
          console.warn('⚠️ Could not resolve coach_id to record payment for invoice', invoice.id)
        }
      } catch (e) {
        console.error('⚠️ Unexpected error while recording payment:', e)
      }
    }
  }

  // Some Stripe accounts emit 'invoice.paid' (in addition or instead). Upsert invoice here too.
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    const stripeSubId = typeof invoice.subscription === 'string' ? invoice.subscription : null
    const stripeCustomerId =
      typeof invoice.customer === 'string'
        ? (invoice.customer as string)
        : (invoice.customer as Stripe.Customer | null)?.id || null
    try {
      if (stripeSubId) {
        // Lookup subscription once for coach + internal id
        const { data: subRow, error: subErr } = await supabase
          .from('subscriptions')
          .select('id, coach_id')
          .eq('stripe_subscription_id', stripeSubId)
          .limit(1)
          .maybeSingle()
        if (subErr) console.error('⚠️ invoice.paid subscription lookup error:', subErr)
        const coachIdForInvoice = (subRow?.coach_id as string | undefined) || null
        const internalSubId: string | null = subRow?.id || null
        if (coachIdForInvoice) {
          const line = invoice.lines?.data?.[0]
          const periodStartSec = line?.period?.start || invoice.period_start || null
          const periodEndSec = line?.period?.end || invoice.period_end || null
          const periodStart = periodStartSec ? new Date(periodStartSec * 1000).toISOString() : null
          const periodEnd = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null
          const amountCents = invoice.amount_paid ?? invoice.total ?? 0
          const description =
            line?.description || invoice.number || `Stripe subscription invoice ${invoice.id}`
          const status = invoice.status || 'paid'
          const metadata: Record<string, unknown> = {
            ...(invoice.metadata || {}),
            line_metadata: line?.metadata || {},
            subscription_item_ids: invoice.lines?.data?.map((l) => l.id) || [],
          }
          const { error: upsertErr } = await supabase.rpc('upsert_subscription_invoice', {
            p_coach_id: coachIdForInvoice,
            p_subscription_id: internalSubId,
            p_stripe_invoice_id: invoice.id,
            p_stripe_customer_id: stripeCustomerId,
            p_hosted_invoice_url: invoice.hosted_invoice_url || null,
            p_pdf_url: invoice.invoice_pdf || null,
            p_amount: amountCents,
            p_currency: invoice.currency || 'eur',
            p_status: status,
            p_period_start: periodStart,
            p_period_end: periodEnd,
            p_description: description,
            p_metadata: metadata,
          })
          if (upsertErr)
            console.error('❌ Failed upsert_subscription_invoice (invoice.paid):', upsertErr)
          else console.log('✅ Upserted subscription invoice (invoice.paid)', invoice.id)
        } else {
          console.warn('⚠️ invoice.paid could not resolve coach to upsert invoice', invoice.id)
        }
      }
    } catch (e) {
      console.error('⚠️ Unexpected error in invoice.paid handler:', e)
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

  // As a safety net, record successful payment intents (e.g., from Checkout) using metadata.coachId
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const txId = pi.id
    const coachId = (pi.metadata?.coachId as string | undefined) || null
    if (coachId) {
      try {
        const { data: existing, error: exErr } = await supabase
          .from('payments')
          .select('id')
          .eq('transaction_id', txId)
          .limit(1)
          .maybeSingle()
        if (!existing) {
          const amount = Math.max(0, pi.amount_received ?? pi.amount ?? 0) / 100
          const currency = (pi.currency || 'EUR').toUpperCase()
          const { error: insErr } = await supabase.from('payments').insert({
            coach_id: coachId,
            amount,
            currency,
            payment_method: 'stripe',
            transaction_id: txId,
            status: 'completed',
            payment_type: 'subscription',
            processed_at: new Date().toISOString(),
            description: `Stripe payment intent ${pi.id}`,
            platform_fee: 0,
            payment_processor_fee: 0,
            coach_earnings: amount,
            metadata: { stripePaymentIntentId: pi.id } as Record<string, unknown>,
          })
          if (insErr) console.error('❌ Failed to insert payment on payment_intent:', insErr)
          else console.log('✅ Recorded payment from payment_intent for coach', coachId)
        } else if (exErr) {
          console.error('⚠️ Payment existence check failed on payment_intent:', exErr)
        } else {
          console.log('ℹ️ Payment already exists for payment_intent', txId)
        }
      } catch (e) {
        console.error('⚠️ Failed to record payment from payment_intent:', e)
      }
    }
  }

  return new Response('Webhook received', { status: 200 })
})
