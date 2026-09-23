'use client'

import { useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { propertyPhotoUrl } from '../../../lib/property-photo'

export type Photo = {id:string;property_id:string;storage_path:string}
const extensions:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}

export default function PhotoManager({propertyId,photos,onChange}:{propertyId:string;photos:Photo[];onChange:()=>Promise<void>}){
 const [busy,setBusy]=useState(false)
 const [feedback,setFeedback]=useState('')
 async function upload(file:File){
  const ext=extensions[file.type]
  if(!ext||file.size>5*1024*1024){setFeedback('Choose a JPG, PNG or WebP image under 5 MB.');return}
  if(photos.length>=5){setFeedback('You can add up to five photos.');return}
  setBusy(true);setFeedback('Uploading photo…')
  const s=createClient()
  const {data:{user}}=await s.auth.getUser()
  if(!user){setFeedback('Log in to add photos.');setBusy(false);return}
  const path=`${user.id}/${propertyId}/${crypto.randomUUID()}.${ext}`
  const {error:uploadError}=await s.storage.from('fmfh-property-photos').upload(path,file,{contentType:file.type,upsert:false})
  if(uploadError){setFeedback(uploadError.message);setBusy(false);return}
  const {error}=await s.from('fmfh_property_photos').insert({property_id:propertyId,storage_path:path})
  if(error){await s.storage.from('fmfh-property-photos').remove([path]);setFeedback(error.message);setBusy(false);return}
  await onChange();setFeedback('Photo added.');setBusy(false)
 }
 async function remove(photo:Photo){
  setBusy(true)
  const s=createClient()
  const {error}=await s.storage.from('fmfh-property-photos').remove([photo.storage_path])
  if(error){setFeedback(error.message);setBusy(false);return}
  const {error:rowError}=await s.from('fmfh_property_photos').delete().eq('id',photo.id)
  if(rowError){setFeedback(rowError.message);setBusy(false);return}
  await onChange();setFeedback('Photo removed.');setBusy(false)
 }
 return <section style={{marginTop:18}}><h4>Photos ({photos.length}/5)</h4>
  {photos.length>0&&<div style={{display:'flex',gap:12,flexWrap:'wrap'}}>{photos.map((photo,i)=><div key={photo.id}>
   <img src={propertyPhotoUrl(photo.storage_path)} alt={`Photo ${i+1} of this rental`} style={{width:150,height:110,objectFit:'cover',borderRadius:10}}/>
   <div><button type="button" disabled={busy} onClick={()=>remove(photo)}>Remove photo</button></div>
  </div>)}</div>}
  {photos.length<5&&<label>Add a photo (JPG, PNG or WebP, up to 5 MB)
   <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void upload(file);e.currentTarget.value=''}}/>
  </label>}
  {feedback&&<p role="status">{feedback}</p>}
 </section>
}
