'use client'

import { useEffect, useRef } from 'react'

type Pin={id:string;title:string;city:string;monthly_rent:number;currency:string;map_lat:number;map_lng:number}
const tiles=process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export default function RentalMap({pins,onChoose}:{pins?:Pin[];onChoose?:(lat:number,lng:number)=>void}){
 const el=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  if(!el.current)return
  let disposed=false
  let cleanup=()=>{}
  import('leaflet').then(L=>{
   if(disposed||!el.current)return
   const map=L.map(el.current,{scrollWheelZoom:false}).setView([-29,24],5)
   L.tileLayer(tiles,{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(map)
   const points:import('leaflet').LatLngExpression[]=[]
   for(const pin of pins||[]){
    if(!Number.isFinite(pin.map_lat)||!Number.isFinite(pin.map_lng))continue
    const point:import('leaflet').LatLngExpression=[pin.map_lat,pin.map_lng]
    points.push(point)
    const link=document.createElement('a');link.href=`/property/${encodeURIComponent(pin.id)}`;link.textContent=`${pin.title} — ${pin.currency} ${Number(pin.monthly_rent).toLocaleString()}/month`
    const label=document.createElement('div');label.append(link,document.createElement('br'),document.createTextNode(pin.city))
    L.circleMarker(point,{radius:9,color:'#D6AD4B',fillColor:'#D6AD4B',fillOpacity:.85}).addTo(map).bindPopup(label)
   }
   if(points.length)map.fitBounds(L.latLngBounds(points),{padding:[35,35],maxZoom:11})
   let selection:import('leaflet').CircleMarker|undefined
   if(onChoose)map.on('click',e=>{
    if(selection)selection.remove()
    selection=L.circleMarker(e.latlng,{radius:10,color:'#D6AD4B',fillColor:'#D6AD4B',fillOpacity:.8}).addTo(map)
    onChoose(Number(e.latlng.lat.toFixed(4)),Number(e.latlng.lng.toFixed(4)))
   })
   cleanup=()=>map.remove()
  })
  return()=>{disposed=true;cleanup()}
 },[pins,onChoose])
 return <div ref={el} role="application" aria-label={onChoose?'Choose an approximate map location':'Map of rental listings'} style={{height:420,width:'100%',borderRadius:16,background:'#1b1b1b'}}/>
}
