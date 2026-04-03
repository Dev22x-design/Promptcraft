import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
export async function sendPromptDelivery({ buyerEmail, buyerName, prompt, purchaseId }) {
  await resend.emails.send({
    from: `PromptCraft Studio <${process.env.RESEND_FROM_EMAIL}>`,
    to: buyerEmail,
    subject: `✦ Your prompt is ready: "${prompt.title}"`,
    html: `<div style="font-family:sans-serif;background:#0a0a0f;color:#e8e8f0;padding:40px 20px;max-width:600px;margin:0 auto">
      <h1 style="color:#a855f7">✦ PromptCraft Studio</h1>
      <p>Hey ${buyerName || 'there'} 👋 Your prompt is ready!</p>
      <div style="background:#111118;border:1px solid #2a2a3a;border-radius:12px;padding:24px;margin:24px 0">
        <div style="font-size:11px;color:#a855f7;margin-bottom:8px">${prompt.category}</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:16px">${prompt.title}</div>
        <div style="font-family:monospace;font-size:13px;line-height:1.8;white-space:pre-wrap">${prompt.full_content}</div>
      </div>
      <p style="color:#6b6b80;font-size:12px">Purchase ID: ${purchaseId}</p>
    </div>`
  })
}
export async function sendSellerNotification({ sellerEmail, prompt, amount }) {
  await resend.emails.send({
    from: `PromptCraft Studio <${process.env.RESEND_FROM_EMAIL}>`,
    to: sellerEmail,
    subject: `💸 You just made $${amount.toFixed(2)}!`,
    html: `<div style="font-family:sans-serif;background:#0a0a0f;color:#e8e8f0;padding:40px 20px;max-width:500px;margin:0 auto">
      <h1 style="color:#10b981">💸 You made a sale!</h1>
      <p style="font-size:36px;font-weight:900;color:#10b981">+$${(amount * 0.8).toFixed(2)}</p>
      <p style="color:#6b6b80">${prompt.title} was just purchased!</p>
    </div>`
  })
}
