'use client';
import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import {translate,localeFor,type Language} from '../../lib/i18n';
const STORAGE='family-ledger-language';
const LanguageContext=createContext({language:'en' as Language,locale:'en-GB',setLanguage:(_language:Language)=>{},t:(text:string)=>text});
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setLanguage]=useState<Language>('en');
 useEffect(()=>{try{const saved=localStorage.getItem(STORAGE);if(saved==='en'||saved==='sq')setLanguage(saved);}catch{}},[]);
 useEffect(()=>{
  document.documentElement.lang=language;
  document.title=language==='sq'?'Family Ledger — Shpenzimet e familjes':'Family Ledger — Family expenses';
  const manifest=document.querySelector<HTMLLinkElement>('link[rel="manifest"]');if(manifest)manifest.href=language==='sq'?'/manifest-sq.webmanifest':'/manifest.webmanifest';
 },[language]);
 const change=useCallback((next:Language)=>{setLanguage(next);try{localStorage.setItem(STORAGE,next);}catch{}},[]);
 const t=useCallback((text:string)=>translate(language,text),[language]);
 return <LanguageContext.Provider value={{language,locale:localeFor(language),setLanguage:change,t}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){return useContext(LanguageContext);}
export function LanguageSwitch(){const {language,setLanguage}=useLanguage();return <label className="language-switch"><span className="sr-only">Language / Gjuha</span><select aria-label="Language / Gjuha" value={language} onChange={e=>setLanguage(e.target.value as Language)}><option value="en" lang="en">English</option><option value="sq" lang="sq">Shqip</option></select></label>;}
