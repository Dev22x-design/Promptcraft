import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = req.headers.authorization?.replace('Bearer ','')
  if (!token) return res.status(401).json({ error: 'Please log in to purchase' })
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' })
  const { promptId } = req.body
  const { data: prompt } = await supabaseAdmin.from('prompts').select('*').eq('id', promptId).eq('is_active', true).single()
  if (!prompt) return res.status(404).json({ error: 'Prompt not found' })
  if (prompt.seller_id === user.id) return res.status(400).json({ error: "You can't buy your own prompt" })
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [{ price_data: { currency: 'usd', unit_amount: Math.round(prompt.price * 100), product_data: { name: prompt.title, description: `PromptCraft Studio — ${prompt.category}` } }, quantity: 1 }],
      metadata: { prompt_id: prompt.id, buyer_id: user.id, seller_id: prompt.seller_id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace`,
    })
    await supabaseAdmin.from('purchases').insert({ buyer_id: user.id, prompt_id: promptId, seller_id: prompt.seller_id, amount: prompt.price, stripe_session_id: session.id, status: 'pending' })
    res.json({ url: session.url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create checkout' })
  }
}
