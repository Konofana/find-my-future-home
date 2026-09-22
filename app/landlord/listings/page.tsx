'use client'
import { FormEvent,useEffect,useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
type Listing={id:string;title:string;status:string;monthly_rent:number;currency:string;city:string}
export default function Listings(){
 const s=createClient(); const [items,setItems]=useState<Listing[]>([]),[message,setMessage]=useState('')
 async function load(){const {data:{user}}=await s.auth.getUser();if(!user){setMessage('Log in first to manage landlord listings.');return}
 const {data,error}=await s.from('fmfh_properties').select('id,title,status,monthly_rent,currency,city').eq('owner_id',user.id).order('created_at',{ascending:false});if(error){setMessage(error.message);return}setItems((data||[]) as Listing[])}
 useEffect(()=>{load()},[])
 async function add(e:FormEvent<HTMLFormElement>){e.preventDefault();const fd=new FormData(e.currentTarget);const {data:{user}}=await s.auth.getUser();if(!user){setMessage('Log in first.');return}
 const {error}=await s.from('fmfh_properties').insert({owner_id:user.id,title:String(fd.get('title')),property_type:String(fd.get('type')),monthly_rent:Number(fd.get('rent')),city:String(fd.get('city')),region:String(fd.get('region')||''),description:String(fd.get('description')||''),status:'draft'})
 if(error){setMessage(error.message);return} e.currentTarget.reset();setMessage('Draft listing created.');await load()}
 return <main className="hero"><div className="eyebrow">LANDLORD</div><h1>Your listings.</h1><form onSubmit={add} style={{display:'grid',gap:10,maxWidth:560}}>
 <input name="title" placeholder="Listing title" required/><select name="type" defaultValue="apartment"><option value="apartment">Apartment</option><option value="house">House</option><option value="room">Room</option><option value="office">Office</option><option value="retail">Retail</option><option value="warehouse">Warehouse</option><option value="industrial">Industrial</option><option value="land">Land</option></select><input name="rent" type="number" min="0" step="0.01" placeholder="Monthly rent" required/><input name="city" placeholder="City" required/><input name="region" placeholder="State / region"/><textarea name="description" placeholder="Description"/><button className="cta" type="submit">Create draft listing</button></form>
 {message&&<p>{message}</p>}<div style={{display:'grid',gap:14,marginTop:24}}>{items.map(x=><article className="card" key={x.id}><div className="eyebrow">{x.status}</div><h2>{x.title}</h2><p>{x.city}</p><strong>{x.currency} {Number(x.monthly_rent).toLocaleString()}/month</strong></article>)}</div></main>
}