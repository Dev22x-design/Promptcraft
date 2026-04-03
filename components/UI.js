import { useState, useEffect } from 'react'
export function ToastContainer() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    window.__toast = (msg, type) => {
      const id = Date.now()
      setToasts(t => [...t, { id, msg, type }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
    }
  }, [])
  return (
    <div style={{position:'fixed',bottom:24,right:24,zIndex:9999,display:'flex',flexDirection:'column',gap:8}}>
      {toasts.map(t => (
        <div key={t.id} style={{background:'#171728',border:'1px solid #2e2e4a',borderRadius:12,padding:'12px 20px',fontSize:13,fontFamily:'monospace',color:'#ececf4',display:'flex',gap:10,minWidth:260}}>
          <span style={{color:t.type==='error'?'#ef4444':'#10b981'}}>{t.type==='error'?'✕':'✦'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
export function toast(msg, type='success') {
  if (typeof window !== 'undefined' && window.__toast) window.__toast(msg, type)
}
