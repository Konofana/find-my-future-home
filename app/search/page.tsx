import { createClient } from '@supabase/supabase-js'
import SaveButton from './save-button'
import { propertyPhotoUrl } from '../../lib/property-photo'

type Property={id:string,title:string;property_type:string;monthly_rent:number;currency:string;bedrooms:number|null;bathrooms:number|null;city:string;region:string|null;furnished:boolean;parking:boolean}

const types=['house','apartment','room','condo','townhouse','office','retail','restaurant','warehouse','industrial','land','other']

export default async function Search({searchParams}:{searchParams:Promise<{q?:string;type?:string;max?:string}>}){
 const p=await searchParams; const q=(p.q||'').trim().slice(0,80).replace(/[^\p{L}\p{N}\s-]/gu,'')
 const type=types.includes(p.type||'')?p.type||'':''
 const max=Number(p.max);const maxRent=p.max&&Number.isFinite(max)&&max>0?max:null
 const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
 let query=supabase.from('fmfh_public_properties').select('id,title,property_type,monthly_rent,currency,bedrooms,bathrooms,city,region,furnished,parking').order('published_at',{ascending:false}).limit(30)
 if(q) query=query.or(`title.ilike.%${q}%,city.ilike.%${q}%,region.ilike.%${q}%`)
 if(type)query=query.eq('property_type',type)
 if(maxRent!==null)query=query.lte('monthly_rent',maxRent)
 const {data,error}=await query
 const properties=(data||[]) as Property[]
 const {data:photos}=properties.length?await supabase.from('fmfh_property_photos').select('property_id,storage_path').in('property_id',properties.map(x=>x.id)).order('created_at',{ascending:true}):{data:[] as {property_id:string;storage_path:string}[]}
 const covers=new Map<string,string>()
 for(const photo of photos||[])if(!covers.has(photo.property_id))covers.set(photo.property_id,photo.storage_path)
 return <main className="hero"><div className="eyebrow">FMFH SEARCH</div><h1>Find the right place.</h1>
 <form action="/search" style={{display:'flex',gap:10,flexWrap:'wrap'}}><input name="q" aria-label="City, region or property" defaultValue={q} placeholder="City, region or property" /><select name="type" aria-label="Property type" defaultValue={type}><option value="">All property types</option>{types.map(t=><option key={t} value={t}>{t[0].toUpperCase()+t.slice(1)}</option>)}</select><input name="max" aria-label="Maximum monthly rent" type="number" min="1" step="1" defaultValue={maxRent??''} placeholder="Maximum rent"/><button className="cta" type="submit">Search rentals</button></form>
 {error?<p>Search is temporarily unavailable.</p>:properties.length===0?<p>No matching live listings yet. FMFH will never fabricate properties.</p>:
 <div style={{display:'grid',gap:14,marginTop:24}}>{properties.map(x=><article className="card" key={x.id}>{covers.has(x.id)&&<a href={`/property/${x.id}`}><img src={propertyPhotoUrl(covers.get(x.id)!)} alt={x.title} className="search-photo" loading="lazy"/></a>}<div className="eyebrow">{x.property_type}</div><h2><a href={`/property/${x.id}`}>{x.title}</a></h2><p>{x.city}{x.region?', '+x.region:''}</p><strong>{x.currency} {Number(x.monthly_rent).toLocaleString()}/month</strong><p>{x.bedrooms??'—'} bd · {x.bathrooms??'—'} ba{x.furnished?' · Furnished':''}{x.parking?' · Parking':''}</p><SaveButton propertyId={x.id}/></article>)}</div>}
 </main>
}
