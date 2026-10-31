import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Hearth — Your family, on the same page',description:'A little clarity for everyday family spending. Private family spaces, monthly budgets, and dreams you save for together.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,statusBarStyle:'default',title:'Hearth'},icons:{icon:'/favicon.svg',apple:'/icon-192.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#31573e'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>;}
