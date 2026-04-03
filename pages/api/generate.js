import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = req.headers.authorization?.replace('Bearer ','')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })
  const { data: profile } = await supabaseAdmin.from('profiles').select('credits').eq('id', user.id).single()
  if (!profile || profile.credits < 10) return res.status(402).json({ error: 'Not enough credits' })
  const { category, targetModel, goal, style } = req.body
  if (!goal) return res.status(400).json({ error: 'Goal is required' })
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are PromptCraft Studio's expert prompt engineer. Create world-class, production-ready AI prompts. Write ONLY the prompt itself — no intro, no commentary. 150-300 words. Start with role-setting. Use [PLACEHOLDER] for customizable parts. End with output format instruction.`,
      messages: [{ role: 'user', content: `Create a premium AI prompt:\nCategory: ${category}\nTarget AI: ${targetModel}\nGoal: ${goal}\nStyle: ${style}` }]
    })
    await supabaseAdmin.from('profiles').update({ credits: profile.credits - 10 }).eq('id', user.id)
    res.json({ prompt: message.content[0].text, creditsRemaining: profile.credits - 10 })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Generation failed' })
  }
}
