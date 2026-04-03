import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [myPrompts, setMyPrompts] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push('/auth/login')
      fetchAll(session.user.id)
    })
  }, [])
  async function fetchAll(userId) {
    const [p,pr,pu] = await Promise.all([
      supabase.from('profiles').select('*').eq('id',userId).single(),
      supabase.from('prompts').select('*').eq('seller_id',userId).order('created_at',{ascending:false}),
      supabase.from('purchases').select('*,prompts(title,category,price)').eq('buyer_id',userId).eq('status','completed').order('created_at',{ascending:false}).limit(20),
    ])
    if (p.data) setProfile(p.data)
    if (pr.data) setMyPrompts(pr.data)
    if (pu.data) setPurchases(pu.data)
    setLoading(false)
  }
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'calc(100vh - 64px)',flexDirection:'column',gap:16}}>
      <div style={{width:36,height:36,border:'3px solid #23233a',borderTopColor:'#9333ea',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontFamily:'monospace',color:'#5a5a72'}}>Loading...</div>
    </div>
  )
  const totalSales = myPrompts.reduce((s,p)=>s+(p.sales_count||0),0)
  return (
    <div style={{maxWidth:1280,margin:'0 auto',padding:'32px 24px 80px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontSize:11,fontFamily:'monospace',color:'#9333ea',letterSpacing:2,marginBottom:6}}>✦ DASHBOARD</div>
          <h1 style={{fontSize:26,fontWeight:800}}>Welcome back, {profile?.display_name||'Creator'} 👋</h1>
        </div>
        <button onClick={()=>router.push('/generate')} style={{padding:'10px 22px',background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>✦ Generate New Prompt</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
        {[{icon:'💰',val:`$${(profile?.revenue||0).toFixed(2)}`,label:'Total Earnings',color:'#10b981'},{icon:'📦',val:totalSales,label:'Prompts Sold',color:'#f59e0b'},{icon:'🏪',val:myPrompts.filter(p=>p.is_active).length,label:'Active Listings',color:'#c084fc'},{icon:'⚡',val:profile?.credits||0,label:'Credits',color:'#ececf4'}].map((m,i)=>(
          <div key={i} style={{background:'#111120',border:'1px solid #23233a',borderRadius:14,padding:24}}>
            <div style={{fontSize:22,marginBottom:10}}>{m.icon}</div>
            <div style={{fontSize:30,fontWeight:800,color:m.color,letterSpacing:'-1px',marginBottom:4}}>{m.val}</div>
            <div style={{fontSize:13,color:'#a0a0b8'}}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:4,marginBottom:20,background:'#111120',border:'1px solid #23233a',borderRadius:12,padding:4,width:'fit-content'}}>
        {['overview','listings','purchases'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'9px 20px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:tab===t?'linear-gradient(135deg,#6d28d9,#9333ea)':'transparent',color:tab===t?'white':'#5a5a72'}}>
            {t==='overview'?'📊 Overview':t==='listings'?'📦 My Listings':'🧾 Purchases'}
          </button>
        ))}
      </div>
      {tab==='overview' && (
        <div style={{background:'#111120',border:'1px solid #23233a',borderRadius:16,padding:28}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:20}}>🤖 Your Business on Autopilot</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
            {[{icon:'✦',t:'You Generate',d:'AI creates premium prompts from your ideas'},{icon:'🛒',t:'Buyer Pays',d:'Stripe processes payment 24/7'},{icon:'📧',t:'Auto-Delivered',d:"Prompt lands in buyer's inbox instantly"},{icon:'💸',t:'You Earn',d:'80% credited to your account automatically'}].map((s,i)=>(
              <div key={i} style={{background:'#0d0d18',border:'1px solid #23233a',borderRadius:12,padding:20}}>
                <div style={{width:32,height:32,background:'rgba(109,40,217,0.12)',border:'1px solid rgba(109,40,217,0.25)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,color:'#c084fc'}}>{s.icon}</div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{s.t}</div>
                <div style={{fontSize:12,fontFamily:'monospace',color:'#5a5a72',lineHeight:1.5}}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='listings' && (
        <div style={{background:'#111120',border:'1px solid #23233a',borderRadius:16,overflow:'hidden'}}>
          <div style={{padding:'18px 22px',borderBottom:'1px solid #23233a',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontWeight:700}}>My Prompt Listings</span>
            <button onClick={()=>router.push('/generate')} style={{padding:'7px 16px',background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white',border:'none',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer'}}>+ New Prompt</button>
          </div>
          {myPrompts.length===0 ? (
            <div style={{textAlign:'center',padding:60}}>
              <div style={{fontSize:44,marginBottom:12}}>📭</div>
              <div style={{color:'#5a5a72',fontFamily:'monospace'}}>No listings yet</div>
            </div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Title','Category','Price','Sales','Revenue','Status'].map(h=><th key={h} style={{padding:'10px 20px',fontSize:10,fontFamily:'monospace',color:'#3a3a52',letterSpacing:1,textTransform:'uppercase',textAlign:'left',borderBottom:'1px solid #23233a',fontWeight:400}}>{h}</th>)}</tr></thead>
              <tbody>
                {myPrompts.map(p=>(
                  <tr key={p.id}>
                    <td style={{padding:'13px 20px',fontSize:13,fontWeight:600,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</td>
                    <td style={{padding:'13px 20px'}}><span style={{padding:'3px 10px',background:'rgba(109,40,217,0.1)',border:'1px solid rgba(109,40,217,0.25)',borderRadius:20,fontSize:11,fontFamily:'monospace',color:'#9333ea'}}>{p.category}</span></td>
                    <td style={{padding:'13px 20px',color:'#10b981',fontWeight:700,fontFamily:'monospace'}}>${parseFloat(p.price).toFixed(2)}</td>
                    <td style={{padding:'13px 20px',color:'#a0a0b8'}}>{p.sales_count||0}</td>
                    <td style={{padding:'13px 20px',color:'#10b981',fontFamily:'monospace'}}>${((p.sales_count||0)*p.price*0.8).toFixed(2)}</td>
                    <td style={{padding:'13px 20px',fontSize:11,fontFamily:'monospace',color:p.is_active?'#10b981':'#3a3a52'}}>{p.is_active?'● Live':'○ Paused'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {tab==='purchases' && (
        <div style={{background:'#111120',border:'1px solid #23233a',borderRadius:16,overflow:'hidden'}}>
          <div style={{padding:'18px 22px',borderBottom:'1px solid #23233a',fontWeight:700}}>Prompts I've Purchased</div>
          {purchases.length===0 ? (
            <div style={{textAlign:'center',padding:60}}>
              <div style={{fontSize:44,marginBottom:12}}>🛒</div>
              <div style={{color:'#5a5a72',fontFamily:'monospace'}}>No purchases yet</div>
            </div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Prompt','Category','Paid','Date'].map(h=><th key={h} style={{padding:'10px 20px',fontSize:10,fontFamily:'monospace',color:'#3a3a52',letterSpacing:1,textTransform:'uppercase',textAlign:'left',borderBottom:'1px solid #23233a',fontWeight:400}}>{h}</th>)}</tr></thead>
              <tbody>
                {purchases.map(p=>(
                  <tr key={p.id}>
                    <td style={{padding:'13px 20px',fontSize:13,fontWeight:600}}>{p.prompts?.title||'Prompt'}</td>
                    <td style={{padding:'13px 20px'}}><span style={{padding:'3px 10px',background:'rgba(109,40,217,0.1)',border:'1px solid rgba(109,40,217,0.25)',borderRadius:20,fontSize:11,fontFamily:'monospace',color:'#9333ea'}}>{p.prompts?.category}</span></td>
                    <td style={{padding:'13px 20px',color:'#10b981',fontWeight:700,fontFamily:'monospace'}}>${parseFloat(p.amount).toFixed(2)}</td>
                    <td style={{padding:'13px 20px',fontSize:12,fontFamily:'monospace',color:'#5a5a72'}}>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
