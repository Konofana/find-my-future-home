import { createClient } from '@supabase/supabase-js'
import SaveButton from './save-button'

type Property={id:string,title:string;property_type:string;monthly_rent:number;currency:string;bedrooms:number|null;bathrooms:number|null;city:string;region:string|null;furnished:boolean;parking:boolean}

export default async function Search({searchParams}:{searchParams:Promise<{q?:string}>}){
 const p=await searchParams; const q=(p.q||'').trim()
 const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
 let query=supabase.from('fmfh_public_properties').select('id,title,property_type,monthly_rent,currency,bedrooms,bathrooms,city,region,furnished,parking').order('published_at',{ascending:false}).limit(30)
 if(q) query=query.or(`title.ilike.%${q}%,city.ilike.%${q}%,region.ilike.%${q}%`)
 const {data,error}=await query
 const properties=(data||[]) as Property[]
 return <main className="hero"><div className="eyebrow">FMFH SEARCH</div><h1>Find the right place.</h1>
 <form action="/search"><input name="q" defaultValue={q} placeholder="City, region or property" /><button className="cta" type="submit">Search FMFH</button></form>
 {error?<p>Search is temporarily unavailable.</p>:properties.length===0?<p>No matching live listings yet. FMFH will never fabricate properties.</p>:
 <div style={{display:'grid',gap:14,marginTop:24}}>{properties.map(x=><article className="card" key={x.id}><div className="eyebrow">{x.property_type}</div><h2>{x.title}</h2><p>{x.city}{x.region?', '+x.region:''}</p><strong>{x.currency} {Number(x.monthly_rent).toLocaleString()}/month</strong><p>{x.bedrooms??'—'} bd · {x.bathrooms??'—'} ba{x.furnished?' · Furnished':''}{x.parking?' · Parking':''}</p><SaveButton propertyId={x.id}/></article>)}</div>}
 </main>
}
