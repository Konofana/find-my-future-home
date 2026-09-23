import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import SaveButton from '../../search/save-button'

type Property={id:string;title:string;description:string|null;property_type:string;monthly_rent:number;currency:string;bedrooms:number|null;bathrooms:number|null;city:string;region:string|null;country_code:string;furnished:boolean;parking:boolean;available_from:string|null}

export default async function PropertyPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))notFound()
 const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
 const {data,error}=await supabase.from('fmfh_public_properties').select('id,title,description,property_type,monthly_rent,currency,bedrooms,bathrooms,city,region,country_code,furnished,parking,available_from').eq('id',id).maybeSingle()
 if(error||!data)notFound()
 const property=data as Property
 const {data:nearby}=await supabase.from('fmfh_public_properties').select('id,title,monthly_rent,currency').eq('city',property.city).neq('id',id).limit(3)
 return <main className="hero"><a href="/search">← Back to search</a><div className="eyebrow" style={{marginTop:32}}>{property.property_type}</div><h1>{property.title}</h1><p>{property.city}{property.region?`, ${property.region}`:''}, {property.country_code}</p><p><strong>{property.currency} {Number(property.monthly_rent).toLocaleString()}/month</strong></p><p>{property.bedrooms??'—'} bedrooms · {property.bathrooms??'—'} bathrooms{property.furnished?' · Furnished':''}{property.parking?' · Parking':''}</p>{property.available_from&&<p>Available from {property.available_from}</p>}{property.description&&<p>{property.description}</p>}<SaveButton propertyId={property.id}/>{nearby&&nearby.length>0&&<section><h2>More places in {property.city}</h2><div className="grid" style={{padding:0}}>{nearby.map(x=><article className="card" key={x.id}><h3><a href={`/property/${x.id}`}>{x.title}</a></h3><p>{x.currency} {Number(x.monthly_rent).toLocaleString()}/month</p></article>)}</div></section>}</main>
}
