import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from './components/language';
export const metadata: Metadata = {title:'Family Ledger — Family expenses',description:'A little clarity for everyday family spending. Private family spaces, monthly budgets, and dreams you save for together.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,statusBarStyle:'default',title:'Family Ledger'},icons:{icon:'/favicon.svg',apple:'/icon-192.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#31573e'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {return <html lang="en"><body><LanguageProvider>{children}</LanguageProvider></body></html>;}
