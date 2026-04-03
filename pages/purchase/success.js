import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
export default function Success() {
  const router = useRouter()
  const { session_id } = router.query
  const [count, setCount] = useState(5)
  useEffect(() => {
    const t = setInterval(() => setCount(c => { if (c<=1) { clearInterval(t); router.push('/marketplace'); return 0 } return c-1 }), 1000)
    return () => clearInterval(t)
  }, [session_id])
  return (
    <div style={{minHeight:'calc(100vh - 64px)',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:20}}>
      <div>
        <div style={{fontSize:80,marginBottom:24}}>✦</div>
        <h1 style={{fontSize:36,fontWeight:900,color:'#10b981',marginBottom:12}}>Payment Successful!</h1>
        <p style={{fontSize:18,color:'#a0a0b8',marginBottom:8}}>Your prompt is on its way to your inbox.</p>
        <p style={{fontSize:14,color:'#5a5a72',fontFamily:'monospace',marginBottom:40}}>Check your email — delivery is instant ⚡</p>
        <p style={{color:'#5a5a72',fontSize:13,fontFamily:'monospace',marginBottom:16}}>Returning to marketplace in {count}s...</p>
        <button onClick={()=>router.push('/marketplace')} style={{padding:'12px 28px',background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white',border:'none',borderRadius:10,fontWeight:700,fontSize:15,cursor:'pointer'}}>Browse More Prompts →</button>
      </div>
    </div>
  )
}
