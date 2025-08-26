import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
      },
      status: 204,
    })
  }
  try {
    const { coachId } = await req.json()

    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
    const priceId = Deno.env.get('STRIPE_PRICE_ID')
    const frontendUrl = Deno.env.get('FRONTEND_URL')

    if (!stripeSecret || !priceId || !frontendUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing Stripe or frontend environment variables.' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 500,
        },
      )
    }

    if (!coachId) {
      return new Response(JSON.stringify({ error: 'Missing coachId in request body.' }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      })
    }

    const params = new URLSearchParams({
      'payment_method_types[]': 'card',
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cancel`,
      'metadata[coachId]': coachId,
      // Ensure metadata is copied to underlying objects
      'subscription_data[metadata][coachId]': coachId,
    })

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    const session = await response.json()

    if (!response.ok) {
      // Debug info: return Stripe error, env variables (except secret)
      return new Response(
        JSON.stringify({
          error: session.error?.message || 'Stripe error',
          debug: {
            priceId,
            frontendUrl,
            coachId,
            stripeStatus: response.status,
            stripeResponse: session,
          },
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 500,
        },
      )
    }

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    })
  } catch (e) {
    let message = 'Unknown error'
    if (typeof e === 'object' && e && 'message' in e) {
      message = (e as { message?: string }).message || message
    } else if (typeof e === 'string') {
      message = e
    }
    return new Response(JSON.stringify({ error: message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500,
    })
  }
})
