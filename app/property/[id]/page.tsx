import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SaveButton from '../../search/save-button'
import InquiryForm from './inquiry-form'
import { propertyPhotoUrl } from '../../../lib/property-photo'

type Property={id:string;owner_id:string;title:string;description:string|null;property_type:string;monthly_rent:number;currency:string;bedrooms:number|null;bathrooms:number|null;city:string;region:string|null;country_code:string;furnished:boolean;parking:boolean;available_from:string|null}

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params
 if(!/^[0-9a-f-]{36}$/i.test(id))return {title:'Rental not found'}
 const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
 const {data}=await supabase.from('fmfh_public_properties').select('title,city,description').eq('id',id).maybeSingle()
 if(!data)return {title:'Rental not found'}
 const title=`${data.title} in ${data.city} | FMFH`
 const description=(data.description||`View this rental in ${data.city} on Find My Future Home.`).slice(0,160)
 return {title,description,alternates:{canonical:`/property/${id}`},openGraph:{title,description,url:`/property/${id}`}}
}

export default async function PropertyPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))notFound()
 const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
 const {data,error}=await supabase.from('fmfh_public_properties').select('id,owner_id,title,description,property_type,monthly_rent,currency,bedrooms,bathrooms,city,region,country_code,furnished,parking,available_from').eq('id',id).maybeSingle()
 if(error||!data)notFound()
 const property=data as Property
 const {data:photos}=await supabase.from('fmfh_property_photos').select('id,storage_path').eq('property_id',id).order('created_at',{ascending:true}).limit(5)
 const {data:nearby}=await supabase.from('fmfh_public_properties').select('id,title,monthly_rent,currency').eq('city',property.city).neq('id',id).limit(3)
 return <main className="hero"><a href="/search">← Back to search</a><div className="eyebrow" style={{marginTop:32}}>{property.property_type}</div><h1>{property.title}</h1>{photos&&photos.length>0&&<div className="photo-gallery">{photos.map((photo,i)=><img key={photo.id} src={propertyPhotoUrl(photo.storage_path)} alt={`${property.title}, photo ${i+1}`} loading={i===0?'eager':'lazy'}/>)}</div>}<p>{property.city}{property.region?`, ${property.region}`:''}, {property.country_code}</p><p><strong>{property.currency} {Number(property.monthly_rent).toLocaleString()}/month</strong></p><p>{property.bedrooms??'—'} bedrooms · {property.bathrooms??'—'} bathrooms{property.furnished?' · Furnished':''}{property.parking?' · Parking':''}</p>{property.available_from&&<p>Available from {property.available_from}</p>}{property.description&&<p>{property.description}</p>}<SaveButton propertyId={property.id}/><InquiryForm propertyId={property.id} ownerId={property.owner_id}/>{nearby&&nearby.length>0&&<section><h2>More places in {property.city}</h2><div className="grid" style={{padding:0}}>{nearby.map(x=><article className="card" key={x.id}><h3><a href={`/property/${x.id}`}>{x.title}</a></h3><p>{x.currency} {Number(x.monthly_rent).toLocaleString()}/month</p></article>)}</div></section>}</main>
}
