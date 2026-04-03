import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Please fill in all fields')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setError(error.message)
    router.push('/dashboard')
  }
  const inp = {width:'100%',background:'#0d0d18',border:'1px solid #23233a',borderRadius:8,padding:'12px 14px',color:'#ececf4',fontFamily:'monospace',fontSize:14,outline:'none',marginBottom:12}
  return (
    <div style={{minHeight:'calc(100vh - 64px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#111120',border:'1px solid #23233a',borderRadius:20,padding:'40px 36px',width:'100%',maxWidth:420}}>
        <div style={{width:44,height:44,background:'linear-gradient(135deg,#6d28d9,#9333ea)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:20}}>✦</div>
        <h1 style={{fontSize:26,fontWeight:800,marginBottom:8}}>Welcome back</h1>
        <p style={{fontSize:13,color:'#5a5a72',fontFamily:'monospace',marginBottom:28}}>Sign in to your PromptCraft account</p>
        {error && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#ef4444',marginBottom:16,fontFamily:'monospace'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={inp} type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} />
          <input style={inp} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button type="submit" disabled={loading} style={{width:'100%',padding:14,background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:800,cursor:'pointer'}}>
            {loading?'Signing in...':'Sign In ✦'}
          </button>
        </form>
        <p style={{textAlign:'center',fontSize:13,fontFamily:'monospace',color:'#5a5a72',marginTop:20}}>
          No account? <Link href="/auth/signup" style={{color:'#9333ea'}}>Sign up free →</Link>
        </p>
      </div>
    </div>
  )
}
