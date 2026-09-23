'use client'
import { useEffect,useState } from 'react'
import { createClient } from '../../lib/supabase/client'
type Saved={property_id:string;fmfh_properties:{title:string;monthly_rent:number;currency:string;city:string}|null}
export default function Saved(){
 const [items,setItems]=useState<Saved[]>([]),[message,setMessage]=useState('Loading…')
 useEffect(()=>{(async()=>{const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user){setMessage('Log in to see your saved properties.');return}
 const {data,error}=await s.from('fmfh_favorites').select('property_id,fmfh_properties(title,monthly_rent,currency,city)').order('created_at',{ascending:false})
 if(error){setMessage('Saved properties are temporarily unavailable.');return} setItems((data||[]) as unknown as Saved[]);setMessage(data?.length?'':'You have no saved properties yet.')})()},[])
 async function remove(propertyId:string){const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user){setMessage('Log in to manage saved properties.');return}
 const {error}=await s.from('fmfh_favorites').delete().eq('user_id',user.id).eq('property_id',propertyId)
 if(error){setMessage('Could not remove this property. Please try again.');return}setItems(current=>current.filter(x=>x.property_id!==propertyId));setMessage('Property removed from saved.')}
 return <main className="hero"><div className="eyebrow">SAVED</div><h1>Your saved properties.</h1>{message&&<p role="status">{message} {message.includes('Log in')&&<a href="/account">Account</a>}</p>}
 <div style={{display:'grid',gap:14}}>{items.map(x=><article className="card" key={x.property_id}><h2><a href={`/property/${x.property_id}`}>{x.fmfh_properties?.title}</a></h2><p>{x.fmfh_properties?.city}</p><strong>{x.fmfh_properties?.currency} {Number(x.fmfh_properties?.monthly_rent||0).toLocaleString()}/month</strong><p><button type="button" onClick={()=>remove(x.property_id)}>Remove from saved</button></p></article>)}</div><p><a className="cta" href="/search">Search properties</a></p></main>
}
