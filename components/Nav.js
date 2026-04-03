import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
export default function Nav() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('credits').eq('id', session.user.id).single()
          .then(({ data }) => { if (data) setCredits(data.credits) })
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])
  return (
    <nav style={{position:'sticky',top:0,zIndex:200,background:'rgba(8,8,16,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid #23233a',height:64,display:'flex',alignItems:'center',padding:'0 24px'}}>
      <div style={{maxWidth:1280,margin:'0 auto',width:'100%',display:'flex',alignItems:'center',gap:24}}>
        <Link href="/" style={{fontWeight:900,fontSize:18,display:'flex',alignItems:'center',gap:8}}>
          <span style={{background:'linear-gradient(135deg,#6d28d9,#9333ea)',borderRadius:8,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'white'}}>✦</span>
          PromptCraft <span style={{color:'#9333ea'}}>Studio</span>
        </Link>
        <div style={{display:'flex',gap:4,flex:1}}>
          {[{href:'/marketplace',label:'Marketplace'},{href:'/generate',label:'Generate'},{href:'/dashboard',label:'Dashboard'}].map(l => (
            <Link key={l.href} href={l.href} style={{padding:'7px 14px',borderRadius:8,fontSize:14,fontWeight:600,color:router.pathname===l.href?'#c084fc':'#5a5a72',background:router.pathname===l.href?'rgba(109,40,217,0.12)':'transparent'}}>
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12,marginLeft:'auto'}}>
          {user ? (
            <div style={{background:'#171728',border:'1px solid #23233a',borderRadius:20,padding:'5px 14px',fontFamily:'monospace',fontSize:13,color:'#f59e0b'}}>⚡ {credits} credits</div>
          ) : (
            <>
              <Link href="/auth/login" style={{padding:'8px 16px',borderRadius:8,fontSize:13,fontWeight:700,border:'1px solid #23233a',color:'#a0a0b8'}}>Sign In</Link>
              <Link href="/auth/signup" style={{padding:'8px 18px',borderRadius:8,fontSize:13,fontWeight:700,background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white'}}>Get Started ✦</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
