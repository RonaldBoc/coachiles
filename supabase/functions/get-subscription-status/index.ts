// Edge Function: get-subscription-status (Stripe REST, no Node SDK)
// Minimal ambient declarations for TypeScript in build environment.

declare const Deno: { env: { get(k: string): string | undefined } }
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
// NOTE: Removed Stripe Node SDK import (was causing Deno.core.runMicrotasks errors on Edge runtime)

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
// Basic validation of env vars
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase service environment variables')
}
if (!STRIPE_SECRET_KEY) {
  console.error('❌ Missing STRIPE_SECRET_KEY environment variable')
}

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
    if (!sub.stripe_subscription_id || !sub.stripe_customer_id) {
      // Attempt fallback: find most recent cancelled subscription with Stripe IDs
      const { data: fallback, error: fbErr } = await supabase
        .from('subscriptions')
        .select(
          'stripe_subscription_id, stripe_customer_id, current_period_end, current_period_start, status',
        )
        .eq('coach_id', coachId)
        .not('stripe_subscription_id', 'is', null)
        .not('stripe_customer_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fallback && !fbErr) {
        // Use fallback Stripe identifiers (historical) to show payment method; mark as needs_stripe_link
        sub.stripe_subscription_id = fallback.stripe_subscription_id
        sub.stripe_customer_id = fallback.stripe_customer_id
        // Continue normal Stripe fetch below, but return flag indicating manual current active record
      } else {
        // No Stripe linkage available at all; return manual status so UI can prompt to start checkout
        return json({
          subscription: {
            status: 'manual_active_no_stripe',
            cancel_at_period_end: false,
            current_period_start: null,
            current_period_end: null,
          },
          defaultPaymentMethod: null,
          upcomingInvoice: null,
          needs_stripe_link: true,
          source: 'manual',
        })
      }
    }

    // Helper to call Stripe REST API (JSON or form encoded depending on endpoint)
    async function stripeRequest<T>(
      path: string,
      options: {
        method?: string
        body?: URLSearchParams | undefined
        query?: Record<string, string | string[]>
      } = {},
    ): Promise<T> {
      if (!STRIPE_SECRET_KEY) throw new Error('Stripe not configured')
      const qs = options.query
        ? '?' +
          Object.entries(options.query)
            .flatMap(([k, v]) =>
              Array.isArray(v)
                ? v.map((vv) => `${encodeURIComponent(k)}=${encodeURIComponent(vv)}`)
                : [`${encodeURIComponent(k)}=${encodeURIComponent(v)}`],
            )
            .join('&')
        : ''
      const res = await fetch(`https://api.stripe.com/v1${path}${qs}`, {
        method: options.method || 'GET',
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': options.body
            ? 'application/x-www-form-urlencoded'
            : 'application/x-www-form-urlencoded',
        },
        body: options.body,
      })
      if (!res.ok) {
        const text = await res.text()
        console.error('❌ Stripe API error', path, res.status, text)
        throw new Error(`Stripe API ${res.status}`)
      }
      return (await res.json()) as T
    }

    // Retrieve subscription with expansions
    type StripeSub = {
      id: string
      status: string
      cancel_at_period_end: boolean
      current_period_start: number
      current_period_end: number
      default_payment_method: null | {
        id: string
        type: string
        card?: { brand: string; last4: string; exp_month: number; exp_year: number }
      }
      customer:
        | {
            id: string
            invoice_settings?: {
              default_payment_method: null | {
                id: string
                type: string
                card?: { brand: string; last4: string; exp_month: number; exp_year: number }
              }
            }
          }
        | string
    }

    const stripeSub = await stripeRequest<StripeSub>(
      `/subscriptions/${sub.stripe_subscription_id}`,
      {
        query: {
          'expand[]': [
            'default_payment_method',
            'customer.invoice_settings.default_payment_method',
          ],
        },
      },
    )

    // Helper to safely convert unix seconds to ISO or null
    function iso(unixSeconds: unknown): string | null {
      if (typeof unixSeconds === 'number' && isFinite(unixSeconds) && unixSeconds > 0) {
        try {
          const d = new Date(unixSeconds * 1000)
          if (!isNaN(d.getTime())) return d.toISOString()
        } catch {
          // ignore
        }
      }
      return null
    }

    // Extract card info
    function extractCard(pm: unknown) {
      if (!pm || typeof pm !== 'object') return null
      const obj = pm as {
        id?: string
        type?: string
        card?: { brand: string; last4: string; exp_month: number; exp_year: number }
      }
      if (obj.type === 'card' && obj.card) {
        return {
          id: obj.id || '',
          brand: obj.card.brand,
          last4: obj.card.last4,
          exp_month: obj.card.exp_month,
          exp_year: obj.card.exp_year,
        }
      }
      return null
    }

    let defaultPaymentMethod = extractCard(
      (stripeSub as unknown as { default_payment_method?: unknown }).default_payment_method,
    )
    if (!defaultPaymentMethod) {
      const customerObj = typeof stripeSub.customer === 'string' ? null : stripeSub.customer
      defaultPaymentMethod = extractCard(customerObj?.invoice_settings?.default_payment_method)
    }
    if (!defaultPaymentMethod) {
      // Fallback list
      type ListPMResp = { data: unknown[] }
      try {
        const list = await stripeRequest<ListPMResp>('/payment_methods', {
          query: { customer: sub.stripe_customer_id, type: 'card', limit: '1' },
        })
        defaultPaymentMethod = extractCard(list.data[0])
      } catch (e) {
        console.warn('⚠️ Unable to list payment methods', e)
      }
    }

    // Upcoming invoice
    let upcoming: { amount: number; date: string } | null = null
    try {
      type UpcomingInvoice = {
        amount_due: number
        next_payment_attempt: number | null
      }
      const inv = await stripeRequest<UpcomingInvoice>('/invoices/upcoming', {
        query: {
          customer: sub.stripe_customer_id,
          subscription: sub.stripe_subscription_id,
        },
      })
      const amount = (inv.amount_due || 0) / 100
      const date = inv.next_payment_attempt
        ? new Date(inv.next_payment_attempt * 1000).toISOString()
        : new Date(stripeSub.current_period_end * 1000).toISOString()
      upcoming = { amount, date }
    } catch (e) {
      // Not critical
      console.warn('⚠️ Could not retrieve upcoming invoice', e)
    }

    const currentPeriodStartIso = iso(stripeSub.current_period_start)
    const currentPeriodEndIso = iso(stripeSub.current_period_end)
    if (!currentPeriodStartIso || !currentPeriodEndIso) {
      console.warn('⚠️ Missing or invalid period timestamps on Stripe sub', {
        id: stripeSub.id,
        current_period_start: stripeSub.current_period_start,
        current_period_end: stripeSub.current_period_end,
      })
    }

    return json({
      subscription: {
        status: stripeSub.status,
        cancel_at_period_end: stripeSub.cancel_at_period_end,
        current_period_start: currentPeriodStartIso,
        current_period_end: currentPeriodEndIso,
      },
      defaultPaymentMethod,
      upcomingInvoice: upcoming,
      needs_stripe_link: false,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('❌ get-subscription-status failed', message, e)
    return json({ error: message }, 500)
  }
})
