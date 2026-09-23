import { createClient } from '@supabase/supabase-js'
import RentalMap from './rental-map'

export const dynamic='force-dynamic'

export default async function MapPage(){
 const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
 const {data,error}=await supabase.from('fmfh_public_properties').select('id,title,city,monthly_rent,currency,map_lat,map_lng').not('map_lat','is',null).not('map_lng','is',null).limit(200)
 const pins=(data||[]).filter(p=>p.map_lat!==null&&p.map_lng!==null) as {id:string;title:string;city:string;monthly_rent:number;currency:string;map_lat:number;map_lng:number}[]
 return <main className="hero"><a href="/">← Home</a><div className="eyebrow" style={{marginTop:28}}>RENTAL MAP</div><h1>Explore rentals on a map.</h1><p>Map points show approximate locations chosen by landlords. Private addresses are never shown.</p>{error&&<p>Map listings are temporarily unavailable.</p>}<RentalMap pins={pins}/>{!error&&pins.length===0&&<p>No published listings have map points yet. <a href="/search">Browse all listings</a>.</p>}<p><a href="/search">Search all rentals</a></p></main>
}
