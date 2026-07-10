// Supabase Edge Function to handle InfinitePay payment webhooks
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify secret token from query param
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const expectedToken = Deno.env.get('WEBHOOK_SECRET') || 'default_secret_token_12345'
    if (!token || token !== expectedToken) {
      console.warn("Unauthorized webhook request attempt.")
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const payload = await req.json()
    console.log("Received InfinitePay webhook payload:", payload)

    // InfinitePay payload usually contains metadata or reference ID
    // We expect the checkout metadata to contain the order_id
    const orderId = payload.metadata?.order_id || payload.reference_id || payload.order_id

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing order_id reference in webhook payload." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // Initialize Supabase Admin client using internal env keys
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update order status to 'Pago' (Paid)
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'Pago' })
      .eq('id', orderId)
      .select()

    if (error) throw error

    console.log(`Successfully updated order ${orderId} status to Pago:`, data)

    return new Response(JSON.stringify({ success: true, message: `Order ${orderId} updated to Pago.` }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  } catch (err) {
    console.error("Error processing InfinitePay webhook:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
