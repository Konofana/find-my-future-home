import "./globals.css";
import "leaflet/dist/leaflet.css";
export const metadata={title:"FMFH — Find My Future Home",description:"One search. More possibilities."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
