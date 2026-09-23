'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'

export default function Account() {
  const supabase = createClient()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [message,setMessage]=useState('')
  const [userEmail,setUserEmail]=useState<string|null>(null)
  const [checking,setChecking]=useState(true)
  const [working,setWorking]=useState(false)

  useEffect(()=>{supabase.auth.getUser().then(({data})=>{setUserEmail(data.user?.email ?? null);setChecking(false)})},[])

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    const mode=(e.nativeEvent as SubmitEvent).submitter?.getAttribute('value')==='signup'?'signup':'login'
    setWorking(true);setMessage('Working…')
    const result=mode==='signup'
      ? await supabase.auth.signUp({email,password})
      : await supabase.auth.signInWithPassword({email,password})
    setWorking(false)
    if(result.error){setMessage(result.error.message);return}
    if(!result.data.session){setMessage('Check your email for a confirmation link. After confirming, come back and log in to list your property.');return}
    setUserEmail(result.data.user?.email ?? email)
    setMessage(mode==='signup'?'Account created. You are signed in.':'Signed in successfully.')
  }

  async function logout(){await supabase.auth.signOut();setUserEmail(null);setMessage('Signed out.')}

  return <main className="hero"><div className="eyebrow">ACCOUNT</div><h1>{userEmail?'Welcome back.':'Welcome to FMFH.'}</h1>
    {checking?<p>Checking your account…</p>:<>
    {userEmail ? <><p>Signed in as <strong>{userEmail}</strong></p><button className="cta" onClick={logout}>Sign out</button></> :
    <form onSubmit={submit} style={{display:'grid',gap:12,maxWidth:460}}>
      <input aria-label="Email" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input aria-label="Password" type="password" placeholder="Password (6+ characters)" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required />
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <button className="cta" type="submit" name="mode" value="login" disabled={working}>Log in</button>
        <button className="cta" type="submit" name="mode" value="signup" disabled={working}>Create account</button>
      </div>
    </form>}
    {message&&<p role="status">{message}</p>}</>}
    <p><a href="/landlord/listings">List your rental property</a> · <a href="/">Home</a></p></main>
}
