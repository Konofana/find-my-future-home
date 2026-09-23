'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import RentalMap from '../../map/rental-map'

type Listing={id:string;title:string;description:string|null;status:string;property_type:string;monthly_rent:number;currency:string;city:string;region:string|null;country_code:string;map_lat:number|null;map_lng:number|null}
type Inquiry={id:string;contact_email:string;message:string;created_at:string;fmfh_properties:{title:string}|null}

export default function Listings(){
 const [items,setItems]=useState<Listing[]>([])
 const [inquiries,setInquiries]=useState<Inquiry[]>([])
 const [message,setMessage]=useState('')
 const [point,setPoint]=useState<{lat:number;lng:number}|null>(null)
 const [editing,setEditing]=useState<string|null>(null)
 const [editPoint,setEditPoint]=useState<{lat:number;lng:number}|null>(null)
 const choose=useCallback((lat:number,lng:number)=>setPoint({lat,lng}),[])
 const chooseEdit=useCallback((lat:number,lng:number)=>setEditPoint({lat,lng}),[])

 async function load(){
  const s=createClient()
  const {data:{user}}=await s.auth.getUser()
  if(!user){setMessage('Log in first to manage landlord listings.');return}
  const [{data,error},{data:messages,error:inquiryError}]=await Promise.all([
   s.from('fmfh_properties').select('id,title,description,status,property_type,monthly_rent,currency,city,region,country_code,map_lat,map_lng').eq('owner_id',user.id).order('created_at',{ascending:false}),
   s.from('fmfh_inquiries').select('id,contact_email,message,created_at,fmfh_properties(title)').eq('owner_id',user.id).order('created_at',{ascending:false}).limit(50)
  ])
  if(error){setMessage('Could not load listings.');return}
  setItems((data||[]) as Listing[])
  if(!inquiryError)setInquiries((messages||[]) as unknown as Inquiry[])
 }
 useEffect(()=>{void load()},[])

 async function add(event:FormEvent<HTMLFormElement>){
  event.preventDefault()
  const form=event.currentTarget
  const fd=new FormData(form)
  const s=createClient()
  const {data:{user}}=await s.auth.getUser()
  if(!user){setMessage('Log in first.');return}
  const {error}=await s.from('fmfh_properties').insert({
   owner_id:user.id,title:String(fd.get('title')).trim(),property_type:String(fd.get('type')),
   monthly_rent:Number(fd.get('rent')),currency:String(fd.get('currency')).toUpperCase(),
   city:String(fd.get('city')).trim(),region:String(fd.get('region')||'').trim(),
   country_code:String(fd.get('country')).toUpperCase(),description:String(fd.get('description')||'').trim(),
   status:'draft',map_lat:point?.lat??null,map_lng:point?.lng??null
  })
  if(error){setMessage(error.message);return}
  form.reset();setPoint(null);setMessage('Draft listing created. Review it below, then publish.');await load()
 }
 async function changeStatus(id:string,status:'published'|'rented'){
  const s=createClient()
  const {data:{user}}=await s.auth.getUser()
  if(!user){setMessage('Log in first.');return}
  const {error}=await s.from('fmfh_properties').update({status,...(status==='published'?{published_at:new Date().toISOString()}:{})}).eq('id',id).eq('owner_id',user.id)
  if(error){setMessage(error.message);return}
  setMessage(status==='published'?'Listing published.':'Listing marked as rented.');await load()
 }
 async function save(event:FormEvent<HTMLFormElement>,id:string){
  event.preventDefault()
  const fd=new FormData(event.currentTarget)
  const s=createClient()
  const {data:{user}}=await s.auth.getUser()
  if(!user){setMessage('Log in first.');return}
  const {error}=await s.from('fmfh_properties').update({
   title:String(fd.get('title')).trim(),description:String(fd.get('description')||'').trim(),
   monthly_rent:Number(fd.get('rent')),currency:String(fd.get('currency')).toUpperCase(),
   city:String(fd.get('city')).trim(),region:String(fd.get('region')||'').trim(),
   country_code:String(fd.get('country')).toUpperCase(),map_lat:editPoint?.lat??null,map_lng:editPoint?.lng??null
  }).eq('id',id).eq('owner_id',user.id)
  if(error){setMessage(error.message);return}
  setEditing(null);setMessage('Listing updated.');await load()
 }
 return <main className="hero"><a href="/">← Home</a><div className="eyebrow" style={{marginTop:28}}>LANDLORD</div><h1>Your listings.</h1>
  <h2>Create a rental listing</h2><form onSubmit={add} style={{display:'grid',gap:12,maxWidth:650}}>
   <input name="title" aria-label="Listing title" placeholder="Listing title" required maxLength={120}/>
   <select name="type" aria-label="Property type" defaultValue="apartment"><option value="apartment">Apartment</option><option value="house">House</option><option value="room">Room</option><option value="condo">Condo</option><option value="townhouse">Townhouse</option><option value="office">Office</option><option value="retail">Retail</option><option value="restaurant">Restaurant</option><option value="warehouse">Warehouse</option><option value="industrial">Industrial</option><option value="land">Land</option><option value="other">Other</option></select>
   <input name="rent" aria-label="Monthly rent" type="number" min="0" step="0.01" placeholder="Monthly rent" required/>
   <input name="currency" aria-label="Currency code" defaultValue="USD" pattern="[A-Za-z]{3}" maxLength={3} title="Three-letter currency code, such as USD or ZAR" required/>
   <input name="city" aria-label="City" placeholder="City" required/>
   <input name="region" aria-label="State or region" placeholder="State or region"/>
   <input name="country" aria-label="Two-letter country code" defaultValue="US" pattern="[A-Za-z]{2}" maxLength={2} title="Two-letter country code, such as US or ZA" required/>
   <textarea name="description" aria-label="Property description" placeholder="Description" rows={4}/>
   <label>Optional: tap the map to show an approximate location to renters. Do not select your exact private address.</label>
   <RentalMap onChoose={choose}/>
   <span role="status">{point?`Map point: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`:'No map point selected.'}</span>
   {point&&<button type="button" onClick={()=>setPoint(null)}>Remove map point</button>}
   <button className="cta" type="submit">Create draft listing</button>
  </form>
  {message&&<p role="status">{message} {message.includes('Log in')&&<a href="/account">Go to account</a>}</p>}
  <section style={{display:'grid',gap:14,marginTop:32}}><h2>Your properties</h2>{items.length===0&&<p>No listings yet.</p>}{items.map(x=><article className="card" key={x.id}>
   <div className="eyebrow">{x.status}</div><h3>{x.title}</h3><p>{x.city}</p><strong>{x.currency} {Number(x.monthly_rent).toLocaleString()}/month</strong>
   {editing===x.id?<form onSubmit={e=>save(e,x.id)} style={{display:'grid',gap:10,maxWidth:620,marginTop:20}}>
    <input name="title" aria-label="Edit listing title" defaultValue={x.title} required maxLength={120}/>
    <textarea name="description" aria-label="Edit description" defaultValue={x.description||''} rows={4}/>
    <input name="rent" aria-label="Edit monthly rent" type="number" min="0" step="0.01" defaultValue={x.monthly_rent} required/>
    <input name="currency" aria-label="Edit currency" defaultValue={x.currency} pattern="[A-Za-z]{3}" maxLength={3} required/>
    <input name="city" aria-label="Edit city" defaultValue={x.city} required/>
    <input name="region" aria-label="Edit region" defaultValue={x.region||''}/>
    <input name="country" aria-label="Edit country code" defaultValue={x.country_code} pattern="[A-Za-z]{2}" maxLength={2} required/>
    <label>Tap the map to change the approximate public point.</label><RentalMap onChoose={chooseEdit}/>
    <span role="status">{editPoint?`Map point: ${editPoint.lat.toFixed(4)}, ${editPoint.lng.toFixed(4)}`:'No map point selected.'}</span>
    {editPoint&&<button type="button" onClick={()=>setEditPoint(null)}>Remove map point</button>}
    <button className="cta" type="submit">Save listing</button><button type="button" onClick={()=>setEditing(null)}>Cancel</button>
   </form>:<p><button type="button" onClick={()=>{setEditing(x.id);setEditPoint(x.map_lat!==null&&x.map_lng!==null?{lat:x.map_lat,lng:x.map_lng}:null)}}>Edit listing</button></p>}
   {x.status==='draft'&&<p><button className="cta" type="button" onClick={()=>changeStatus(x.id,'published')}>Publish listing</button></p>}
   {x.status==='published'&&<p><a href={`/property/${x.id}`}>View public page</a> · <button type="button" onClick={()=>changeStatus(x.id,'rented')}>Mark as rented</button></p>}
  </article>)}</section>
  <section style={{marginTop:48}}><h2>Renter inquiries</h2>{inquiries.length===0?<p>No inquiries yet.</p>:<div style={{display:'grid',gap:14}}>{inquiries.map(x=><article className="card" key={x.id}><h3>{x.fmfh_properties?.title||'Rental inquiry'}</h3><p>{x.message}</p><p>Reply to <a href={`mailto:${encodeURIComponent(x.contact_email)}`}>{x.contact_email}</a></p><small>{new Date(x.created_at).toLocaleDateString()}</small></article>)}</div>}</section>
 </main>
}
