import "./globals.css";
import "leaflet/dist/leaflet.css";
export const metadata={metadataBase:new URL('https://find-my-future-home-6228.vercel.app'),title:"FMFH — Find My Future Home",description:"Search real homes, apartments, offices and commercial rentals on Find My Future Home.",openGraph:{title:'FMFH — Find My Future Home',description:'Search real homes, apartments, offices and commercial rentals.',url:'/',type:'website'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
