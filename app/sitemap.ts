import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const origin='https://find-my-future-home-6228.vercel.app'
export const revalidate=3600

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const pages:MetadataRoute.Sitemap=[
  {url:origin,lastModified:new Date(),changeFrequency:'weekly',priority:1},
  {url:`${origin}/search`,lastModified:new Date(),changeFrequency:'daily',priority:.8},
  {url:`${origin}/map`,lastModified:new Date(),changeFrequency:'daily',priority:.6},
  {url:`${origin}/list-your-property`,lastModified:new Date(),changeFrequency:'monthly',priority:.6}
 ]
 const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
 const {data}=await supabase.from('fmfh_public_properties').select('id,created_at').order('created_at',{ascending:false}).limit(1000)
 return [...pages,...(data||[]).map(p=>({url:`${origin}/property/${p.id}`,lastModified:p.created_at?new Date(p.created_at):new Date(),changeFrequency:'weekly' as const,priority:.7}))]
}
