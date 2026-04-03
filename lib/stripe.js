import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
export async function createCheckoutSession({ prompt, buyerId, buyerEmail }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: buyerEmail,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(prompt.price * 100),
        product_data: { name: prompt.title, description: `PromptCraft Studio — ${prompt.category} prompt` },
      },
      quantity: 1,
    }],
    metadata: { prompt_id: prompt.id, buyer_id: buyerId, seller_id: prompt.seller_id, prompt_title: prompt.title },
    success_url: `${appUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/marketplace`,
  })
}
