import { buffer } from 'micro'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendPromptDelivery, sendSellerNotification } from '../../../lib/email'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
export const config = { api: { bodyParser: false } }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const rawBody = await buffer(req)
  const sig = req.headers['stripe-signature']
  let event
  try { event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET) }
  catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`) }
  if (event.type !== 'checkout.session.completed') return res.json({ received: true })
  const session = event.data.object
  const { prompt_id, buyer_id, seller_id } = session.metadata
  try {
    await supabaseAdmin.from('purchases').update({ status: 'completed', stripe_payment_intent: session.payment_intent }).eq('stripe_session_id', session.id)
    const { data: prompt } = await supabaseAdmin.from('prompts').select('*').eq('id', prompt_id).single()
    await supabaseAdmin.from('prompts').update({ sales_count: (prompt.sales_count||0) + 1 }).eq('id', prompt_id)
    const sellerEarnings = parseFloat((session.amount_total / 100 * 0.8).toFixed(2))
    const { data: seller } = await supabaseAdmin.from('profiles').select('revenue,email,display_name').eq('id', seller_id).single()
    await supabaseAdmin.from('profiles').update({ revenue: (seller?.revenue||0) + sellerEarnings }).eq('id', seller_id)
    const buyerEmail = session.customer_details?.email
    const { data: buyer } = await supabaseAdmin.from('profiles').select('display_name').eq('id', buyer_id).single()
    if (buyerEmail) await sendPromptDelivery({ buyerEmail, buyerName: buyer?.display_name, prompt, purchaseId: session.id })
    if (seller?.email) await sendSellerNotification({ sellerEmail: seller.email, prompt, amount: session.amount_total / 100 })
    res.json({ received: true })
  } catch (err) {
    console.error(err)
    res.json({ received: true, error: err.message })
  }
}
