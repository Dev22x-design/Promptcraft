import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
const FILTERS = ['All','Business','Marketing','Coding','Creative','Research','Education','Sales','Design']
export default function Marketplace() {
  const router = useRouter()
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [buying, setBuying] = useState(false)
  const [session, setSession] = useState(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    fetchPrompts()
  }, [filter])
  async function fetchPrompts() {
    setLoading(true)
    let q = supabase.from('prompts').select('*').eq('is_active',true).order('sales_count',{ascending:false}).limit(48)
    if (filter!=='All') q = q.eq('category',filter)
    const { data } = await q
    setPrompts(data||[]); setLoading(false)
  }
  async function buyPrompt() {
    if (!session) return router.push('/auth/signup')
    if (!selected) return
    setBuying(true)
    try {
      const res = await fetch('/api/checkout', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`}, body:JSON.stringify({ promptId:selected.id }) })
      const data = await res.json()
      if (!res.ok) return alert(data.error)
      window.location.href = data.url
    } catch { alert('Checkout failed') } finally { setBuying(false) }
  }
  return (
    <div style={{maxWidth:1280,margin:'0 auto',padding:'32px 24px 80px'}}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,fontFamily:'monospace',color:'#9333ea',letterSpacing:2,marginBottom:6}}>✦ MARKETPLACE</div>
        <h1 style={{fontSize:28,fontWeight:800}}>Premium AI Prompts</h1>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}}>
        {FILTERS.map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'6px 14px',borderRadius:20,border:`1px solid ${filter===f?'#6d28d9':'#23233a'}`,background:filter===f?'rgba(109,40,217,0.1)':'transparent',color:filter===f?'#c084fc':'#5a5a72',fontSize:12,fontFamily:'monospace',cursor:'pointer'}}>{f}</button>
        ))}
      </div>
      {loading ? <div style={{textAlign:'center',padding:80,color:'#5a5a72',fontFamily:'monospace'}}>Loading prompts...</div>
      : prompts.length===0 ? (
        <div style={{textAlign:'center',padding:80}}>
          <div style={{fontSize:48,marginBottom:16}}>📭</div>
          <div style={{color:'#5a5a72',fontFamily:'monospace',marginBottom:16}}>No prompts yet — be the first!</div>
          <button onClick={()=>router.push('/generate')} style={{padding:'12px 24px',background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}}>Generate a Prompt →</button>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:18}}>
          {prompts.map(p=>(
            <div key={p.id} onClick={()=>setSelected(p)} style={{background:'#111120',border:'1px solid #23233a',borderRadius:16,overflow:'hidden',cursor:'pointer',transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='rgba(109,40,217,0.4)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='#23233a'}}>
              <div style={{padding:'18px 20px',background:'linear-gradient(160deg,#171728,#111120)',borderBottom:'1px solid #1a1a28'}}>
                <div style={{fontSize:11,fontFamily:'monospace',color:'#9333ea',marginBottom:8}}>{p.category} · {p.target_model}</div>
                <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>{p.title}</div>
                <div style={{fontSize:12,fontFamily:'monospace',color:'#5a5a72',lineHeight:1.65,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.preview}</div>
              </div>
              <div style={{padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',gap:10}}><span style={{color:'#f59e0b',fontSize:12}}>★ {parseFloat(p.rating).toFixed(1)}</span><span style={{color:'#3a3a52',fontSize:11,fontFamily:'monospace'}}>{p.sales_count} sold</span></div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:17,fontWeight:800,color:'#10b981'}}>${parseFloat(p.price).toFixed(2)}</span>
                  <button onClick={e=>{e.stopPropagation();setSelected(p)}} style={{padding:'7px 16px',background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white',border:'none',borderRadius:7,fontSize:12,fontWeight:700,cursor:'pointer'}}>Buy</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(12px)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div style={{background:'#111120',border:'1px solid #2e2e4a',borderRadius:20,width:'100%',maxWidth:560,maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{padding:'24px 24px 0',display:'flex',justifyContent:'space-between',gap:16}}>
              <div>
                <div style={{fontSize:11,fontFamily:'monospace',color:'#9333ea',marginBottom:8}}>{selected.category}</div>
                <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>{selected.title}</h2>
                <div style={{display:'flex',gap:12}}><span style={{color:'#f59e0b'}}>★★★★★ {parseFloat(selected.rating).toFixed(1)}</span><span style={{fontSize:12,fontFamily:'monospace',color:'#5a5a72'}}>{selected.sales_count} purchases</span></div>
              </div>
              <button onClick={()=>setSelected(null)} style={{width:32,height:32,borderRadius:8,background:'#171728',border:'1px solid #2e2e4a',color:'#5a5a72',cursor:'pointer',fontSize:14,flexShrink:0}}>✕</button>
            </div>
            <div style={{padding:'20px 24px 28px'}}>
              <div style={{background:'#0d0d18',border:'1px solid #23233a',borderRadius:12,padding:20,fontFamily:'monospace',fontSize:13,lineHeight:1.8,color:'#c0c0d4',maxHeight:160,overflow:'hidden',position:'relative',marginBottom:12}}>
                {selected.preview}
                <div style={{position:'absolute',bottom:0,left:0,right:0,height:60,background:'linear-gradient(transparent,#0d0d18)'}} />
              </div>
              <div style={{textAlign:'center',fontSize:12,fontFamily:'monospace',color:'#5a5a72',marginBottom:20,padding:10,background:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:8}}>🔒 Full prompt delivered instantly to your email</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
                <div style={{fontSize:32,fontWeight:800,color:'#10b981'}}>${parseFloat(selected.price).toFixed(2)}</div>
                <button onClick={buyPrompt} disabled={buying} style={{flex:1,padding:'15px 24px',background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:800,cursor:'pointer'}}>
                  {buying?'Processing...':'Buy Now — Instant Access ✦'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
