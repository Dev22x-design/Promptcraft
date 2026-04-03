import { createClient } from '@supabase/supabase-js'
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = req.headers.authorization?.replace('Bearer ','')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })
  const { title, category, targetModel, preview, fullContent, price } = req.body
  if (!title || !fullContent || !price) return res.status(400).json({ error: 'Missing required fields' })
  if (price < 1 || price > 99) return res.status(400).json({ error: 'Price must be $1-$99' })
  const { data, error: insertError } = await supabaseAdmin.from('prompts').insert({ seller_id: user.id, title, category, target_model: targetModel, preview: preview || fullContent.slice(0,120)+'...', full_content: fullContent, price }).select().single()
  if (insertError) return res.status(500).json({ error: 'Failed to list prompt' })
  res.status(201).json({ prompt: data })
}
