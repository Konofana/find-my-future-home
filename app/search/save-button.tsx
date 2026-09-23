'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'

export default function SaveButton({propertyId}:{propertyId:string}) {
  const [message,setMessage]=useState('')
  const [saved,setSaved]=useState(false)

  async function save() {
    const supabase=createClient()
    const {data:{user},error:authError}=await supabase.auth.getUser()
    if(authError||!user){setMessage('Log in to save this place.');return}
    const {error}=await supabase.from('fmfh_favorites').upsert({user_id:user.id,property_id:propertyId},{onConflict:'user_id,property_id'})
    if(error){setMessage('Could not save this place. Please try again.');return}
    setSaved(true);setMessage('Saved to your properties.')
  }

  return <div><button className="cta" type="button" onClick={save} disabled={saved}>{saved?'Saved':'Save property'}</button>{message&&<p role="status">{message} {message.startsWith('Log in')&&<a href="/account">Account</a>}</p>}</div>
}
