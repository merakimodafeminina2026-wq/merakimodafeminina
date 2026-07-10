import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, amount, customer_name, customer_email, items, handle } = await req.json()

    // 1. Build the payload matching the InfinitePay schema
    const payload = {
      handle: handle || "nicolly_gomes",
      redirect_url: `https://merakimodafeminina.com.br/order-success/${order_id}`,
      webhook_url: "https://twlggjdthygqpgfxfhcv.supabase.co/functions/v1/infinitepay-webhook",
      order_nsu: order_id,
      items: items.map((item: any) => ({
        description: item.name || item.description || "Produto",
        price: Math.round(parseFloat(item.price) * 100), // Price in cents (ex: 1000 = R$ 10.00)
        quantity: parseInt(item.quantity) || 1
      }))
    }

    console.log("Sending payload to InfinitePay API:", payload)

    // 2. Call InfinitePay Links API
    const response = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization token if required, otherwise public endpoint
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    console.log("InfinitePay response data:", data)

    if (data.url || data.payment_url) {
      return new Response(JSON.stringify({ payment_url: data.url || data.payment_url }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    throw new Error(data.message || "Failed to create InfinitePay payment link.")
  } catch (err) {
    console.error("Error creating InfinitePay link:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
