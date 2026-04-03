import Link from 'next/link'
export default function Home() {
  return (
    <div style={{fontFamily:'sans-serif',background:'#080810',minHeight:'100vh',color:'#ececf4'}}>
      <div style={{maxWidth:700,margin:'0 auto',padding:'80px 24px',textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:24}}>✦</div>
        <h1 style={{fontSize:52,fontWeight:900,letterSpacing:'-2px',marginBottom:16}}>PromptCraft <span style={{color:'#9333ea'}}>Studio</span></h1>
        <p style={{fontSize:18,color:'#6b6b84',marginBottom:40,lineHeight:1.7,fontFamily:'monospace'}}>Generate premium AI prompts and sell them automatically. Zero fulfillment. Pure passive income.</p>
        <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',marginBottom:64}}>
          <Link href="/auth/signup" style={{padding:'16px 36px',background:'linear-gradient(135deg,#6d28d9,#9333ea)',color:'white',borderRadius:12,fontWeight:800,fontSize:16,boxShadow:'0 0 40px rgba(109,40,217,0.4)'}}>Start Selling Free ✦</Link>
          <Link href="/marketplace" style={{padding:'16px 28px',background:'transparent',color:'#a0a0b8',border:'1px solid #23233a',borderRadius:12,fontWeight:700,fontSize:16}}>Browse Marketplace →</Link>
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:40,flexWrap:'wrap',background:'#111120',border:'1px solid #23233a',borderRadius:16,padding:'20px 32px'}}>
          {[['12,847','Prompts Sold'],['$48,291','Creator Earnings'],['2,341','Active Sellers'],['4.9★','Avg Rating']].map(([num,label])=>(
            <div key={label} style={{textAlign:'center'}}>
              <div style={{fontSize:26,fontWeight:800,color:'#c084fc'}}>{num}</div>
              <div style={{fontSize:11,color:'#5a5a72',fontFamily:'monospace',marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
