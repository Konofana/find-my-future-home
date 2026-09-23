'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'

export default function Account() {
  const supabase = createClient()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [message,setMessage]=useState('')
  const [userEmail,setUserEmail]=useState<string|null>(null)

  useEffect(()=>{supabase.auth.getUser().then(({data})=>setUserEmail(data.user?.email ?? null))},[])

  async function submit(e:FormEvent<HTMLFormElement>, mode:'signup'|'login'){
    e.preventDefault(); setMessage('Working…')
    const result=mode==='signup'
      ? await supabase.auth.signUp({email,password})
      : await supabase.auth.signInWithPassword({email,password})
    if(result.error){setMessage(result.error.message);return}
    setUserEmail(result.data.user?.email ?? email)
    setMessage(mode==='signup'?'Account created. Check your email if confirmation is required.':'Signed in successfully.')
  }

  async function logout(){await supabase.auth.signOut();setUserEmail(null);setMessage('Signed out.')}

  return <main className="hero"><div className="eyebrow">ACCOUNT</div><h1>{userEmail?'Welcome back.':'Welcome to FMFH.'}</h1>
    {userEmail ? <><p>Signed in as <strong>{userEmail}</strong></p><button className="cta" onClick={logout}>Sign out</button></> :
    <form style={{display:'grid',gap:12,maxWidth:460}}>
      <input aria-label="Email" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input aria-label="Password" type="password" placeholder="Password (6+ characters)" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required />
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <button className="cta" onClick={e=>submit(e as any,'login')}>Log in</button>
        <button className="cta" onClick={e=>submit(e as any,'signup')}>Create account</button>
      </div>
    </form>}
    {message&&<p>{message}</p>}<p><a href="/landlord/listings">List your rental property</a> · <a href="/">Home</a></p></main>
}
