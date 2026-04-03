import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
const CATS = ['Business','Creative','Coding','Marketing','Research','Education','Sales','Design']
export default function Generate() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [category, setCategory] = useState('Business')
  const [model, setModel] = useState('ChatGPT / GPT-4o')
  const [goal, setGoal] = useState('')
  const [style, setStyle] = useState('Professional & Detailed')
  const [generating, setGenerating] = useState(false)
  const [output, setOutput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('7.99')
  const [listing, setListing] = useState(false)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setUser(session?.user ?? null) })
  }, [])
  async function generate() {
    if (!user) return router.push('/auth/signup')
    if (!goal.trim()) return alert('Describe what your prompt should do')
    setGenerating(true); setOutput('')
    try {
      const res = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`}, body:JSON.stringify({ category, targetModel:model, goal, style }) })
      const data = await res.json()
      if (!res.ok) return alert(data.error || 'Generation failed')
      let i = 0; const text = data.prompt
      const tick = () => { if (i < text.length) { setOutput(text.slice(0,i)); i+=3; setTimeout(tick,12) } else { setOutput(text) } }
      tick()
    } catch { alert('Something went wrong') } finally { setGenerating(false) }
  }
  async function listForSale() {
    if (!title.trim()) return alert('Give your prompt a title')
    setListing(true)
    try {
      const res = await fetch('/api/prompts/create', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`}, body:JSON.stringify({ title, category, targetModel:model, preview:output.slice(0,140)+'...', fullContent:output, price:parseFloat(price) }) })
      const data = await res.json()
      if (!res.ok) return alert(data.error || 'Failed to list')
      alert(`Listed for $${price}! Live in marketplace ✦`); setShowModal(false); router.push('/marketplace')
    } catch { alert('Failed to list') } finally { setListing(false) }
  }
  const inp = {width:'100%',background:'#0d0d18',border:'1px solid #23233a',borderRadius:8,padding:'10px 14px',color:'#ececf4',fontFamily:'monospace',fontSize:13,outline:'none',marginBottom:12}
  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 24px 80px'}}>
      <div style={{marginBottom:28}}>
        <div style={{fontSize:11,fontFamily:'monospace',color:'#9333ea',letterSpacing:2,marginBottom:6}}>✦ PROMPT GENERATOR</div>
        <h1 style={{fontSize:28,fontWeight:800}}>Generate a Premium Prompt</h1>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'360px 1fr',gap:24,alignItems:'start'}}>
        <div style={{background:'#111120',border:'1px solid #23233a',borderRadius:16,padding:24}}>
          <div style={{fontSize:11,fontFamily:'monospace',color:'#5a5a72',letterSpacing:1,marginBottom:10}}>CATEGORY</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:16}}>
            {CATS.map(c=>(
              <button key={c} onClick={()=>setCategory(c)} style={{padding:'8px 4px',background:category===c?'rgba(109,40,217,0.15)':'#0d0d18',border:`1px solid ${category===c?'#6d28d9':'#23233a'}`,borderRadius:8,color:category===c?'#c084fc':'#5a5a72',fontSize:10,fontFamily:'monospace',cursor:'pointer'}}>{c}</button>
            ))}
          </div>
          <div style={{fontSize:11,fontFamily:'monospace',color:'#5a5a72',marginBottom:6}}>TARGET MODEL</div>
          <select style={inp} value={model} onChange={e=>setModel(e.target.value)}>
            <option>ChatGPT / GPT-4o</option><option>Claude (Anthropic)</option><option>Gemini Pro</option><option>Midjourney v6</option><option>Universal</option>
          </select>
          <div style={{fontSize:11,fontFamily:'monospace',color:'#5a5a72',marginBottom:6}}>WHAT SHOULD IT DO?</div>
          <textarea style={{...inp,resize:'none',height:90,lineHeight:1.7}} placeholder="e.g. Write a viral LinkedIn post for a SaaS launch..." value={goal} onChange={e=>setGoal(e.target.value)} />
          <div style={{fontSize:11,fontFamily:'monospace',color:'#5a5a72',marginBottom:6}}>OUTPUT STYLE</div>
          <select style={inp} value={style} onChange={e=>setStyle(e.target.value)}>
            <option>Professional & Detailed</option><option>Concise & Punchy</option><option>Creative & Expressive</option><option>Technical & Precise</option>
          </select>
          <button onClick={generate} disabled={generating} style={{width:'100%',padding:16,background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:'0 0 28px rgba(109,40,217,0.35)'}}>
            {generating?'Generating...':'✦ Generate Premium Prompt'}
          </button>
          <p style={{textAlign:'center',fontSize:11,fontFamily:'monospace',color:'#3a3a52',marginTop:8}}>Uses 10 credits per generation</p>
        </div>
        <div style={{background:'#111120',border:'1px solid #23233a',borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column',minHeight:500}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid #23233a',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:output?'#10b981':generating?'#f59e0b':'#3a3a52'}} />
              <span style={{fontSize:13,fontFamily:'monospace',color:'#5a5a72'}}>{generating?'Generating...':output?'Ready to sell':'Waiting'}</span>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>navigator.clipboard.writeText(output)} disabled={!output} style={{padding:'6px 14px',background:'#171728',border:'1px solid #2e2e4a',borderRadius:7,color:'#a0a0b8',fontSize:12,fontWeight:600,cursor:'pointer'}}>Copy</button>
              <button onClick={()=>{setTitle(goal.slice(0,60));setShowModal(true)}} disabled={!output} style={{padding:'6px 14px',background:'linear-gradient(135deg,#6d28d9,#9333ea)',border:'none',borderRadius:7,color:'white',fontSize:12,fontWeight:600,cursor:'pointer'}}>💰 Sell It</button>
            </div>
          </div>
          <div style={{padding:24,flex:1}}>
            {output ? <div style={{fontFamily:'monospace',fontSize:13,lineHeight:1.85,color:'#d0d0e8',whiteSpace:'pre-wrap'}}>{output}</div> : (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:340,gap:10,textAlign:'center'}}>
                <div style={{fontSize:44,color:'#23233a'}}>✦</div>
                <div style={{fontSize:15,fontWeight:700,color:'#3a3a52'}}>Your prompt will appear here</div>
                <div style={{fontSize:12,fontFamily:'monospace',color:'#2e2e4a'}}>Fill in the form and hit Generate</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={{background:'#111120',border:'1px solid #2e2e4a',borderRadius:20,width:'100%',maxWidth:480,padding:'32px 28px'}}>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:20}}>List in Marketplace</h2>
            <div style={{fontSize:11,fontFamily:'monospace',color:'#5a5a72',marginBottom:6}}>TITLE</div>
            <input style={inp} placeholder="e.g. Viral LinkedIn Hook Generator" value={title} onChange={e=>setTitle(e.target.value)} maxLength={80} />
            <div style={{fontSize:11,fontFamily:'monospace',color:'#5a5a72',marginBottom:6}}>PRICE (USD)</div>
            <input style={{...inp,maxWidth:120,fontSize:20,fontWeight:700}} type="number" min="1" max="99" value={price} onChange={e=>setPrice(e.target.value)} />
            <div style={{fontSize:12,fontFamily:'monospace',color:'#10b981',marginBottom:20}}>You earn ${(parseFloat(price||0)*0.8).toFixed(2)} per sale</div>
            <button onClick={listForSale} disabled={listing} style={{width:'100%',padding:15,background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:800,cursor:'pointer'}}>
              {listing?'Publishing...':'✦ Publish to Marketplace'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
