'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

export default function InquiryForm({propertyId,ownerId}:{propertyId:string;ownerId:string}){
 const [message,setMessage]=useState('')
 const [feedback,setFeedback]=useState('')
 const [sent,setSent]=useState(false)
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setFeedback('Sending…')
  const supabase=createClient()
  const {data:{user},error:authError}=await supabase.auth.getUser()
  if(authError||!user?.email){setFeedback('Log in to contact the landlord.');return}
  const {error}=await supabase.from('fmfh_inquiries').insert({property_id:propertyId,owner_id:ownerId,sender_id:user.id,contact_email:user.email,message:message.trim()})
  if(error){setFeedback('Message could not be sent. Please try again.');return}
  setSent(true);setFeedback('Your message was sent to the landlord.')
 }
 return <section className="card" style={{marginTop:32}}><h2>Ask about this place</h2><p>Your signed-in email address and message will be shared with this listing’s landlord so they can reply.</p><form onSubmit={submit} style={{display:'grid',gap:12,maxWidth:600}}><label htmlFor="inquiry-message">Message to the landlord</label><textarea id="inquiry-message" value={message} onChange={e=>setMessage(e.target.value)} minLength={10} maxLength={2000} rows={4} required placeholder="Is this place still available?"/><button className="cta" type="submit" disabled={sent}>Send message</button></form>{feedback&&<p role="status">{feedback} {feedback.startsWith('Log in')&&<a href="/account">Go to account</a>}</p>}</section>
}
