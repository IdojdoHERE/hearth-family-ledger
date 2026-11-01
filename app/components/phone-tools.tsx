'use client';
import { useLanguage } from './language';
import { useEffect, useRef, useState } from 'react';
import { Download, RefreshCw, WifiOff, X, ShieldCheck, Smartphone } from 'lucide-react';
import { readQueue, writeQueue, sendExpense } from '../../lib/expense-input';
export function SyncStatus({ member, onSynced }: {
    member: string;
    onSynced: () => void;
}) {
 const { t, locale } = useLanguage();

    const [count, setCount] = useState(0), [online, setOnline] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const lock = useRef(false), callback = useRef(onSynced);
    callback.current = onSynced;
    useEffect(() => { const update = () => setCount(readQueue(member).length); const net = () => { setOnline(navigator.onLine); update(); }; update(); net(); window.addEventListener('hearth:queue', update); window.addEventListener('storage', update); window.addEventListener('online', net); window.addEventListener('offline', net); return () => { window.removeEventListener('hearth:queue', update); window.removeEventListener('storage', update); window.removeEventListener('online', net); window.removeEventListener('offline', net); }; }, [member]);
    async function sync() { if (lock.current || !navigator.onLine)
        return; lock.current = true; setBusy(true); setError(''); let sent = 0; try {
        for (const item of readQueue(member)) {
            await sendExpense(item);
            writeQueue(member, readQueue(member).filter(x => x.clientId !== item.clientId));
            sent++;
        }
    }
    catch (e: any) {
        setError(e.status === 401 ? 'Sign in again to sync your saved expenses.' : e.status ? e.message : 'Connection interrupted. Your expenses are still on this phone.');
    }
    finally {
        if (sent)
            callback.current();
        setBusy(false);
        lock.current = false;
    } }
    useEffect(() => { if (online && count > 0) {
        const t = setTimeout(sync, 1200);
        return () => clearTimeout(t);
    } }, [online, count, member]);
    if (!count && online)
        return <span className="sync-ok"><ShieldCheck size={14}/>{t("Shared with your family")}</span>;
    return <div className="sync-status" role="status"><WifiOff size={18}/><div><strong>{count ? t(`${count} expense${count === 1 ? '' : 's'} waiting to sync`) : t('You’re offline')}</strong><p>{t(error) || t('Keep this phone’s browser data until everything is synced.')}</p></div>{count > 0 && <button onClick={sync} disabled={busy || !online}><RefreshCw size={16}/>{busy ? t('Syncing…') : t('Sync now')}</button>}</div>;
}
export function InstallHelp() {
 const { t, locale } = useLanguage();

    const [open, setOpen] = useState(false), [prompt, setPrompt] = useState<any>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => { if ('serviceWorker' in navigator)
        navigator.serviceWorker.register('/sw.js').catch(() => { }); const handler = (e: any) => { e.preventDefault(); setPrompt(e); }; window.addEventListener('beforeinstallprompt', handler); return () => window.removeEventListener('beforeinstallprompt', handler); }, []);
    useEffect(() => { open ? dialog.current?.showModal() : dialog.current?.close(); }, [open]);
    return <><button className="install-link" onClick={() => setOpen(true)}><Smartphone size={17}/>{t("Add to your phone")}</button><dialog ref={dialog} onCancel={() => setOpen(false)}><div className="modal"><button className="close" onClick={() => setOpen(false)} aria-label={t("Close install help")}><X /></button><div className="modal-symbol"><Smartphone /></div><h2>{t("One tap from your home screen.")}</h2><p className="modal-description">{t("No app store. Open Family Ledger like your other apps.")}</p>{prompt && <button className="button primary submit" onClick={async () => { await prompt.prompt(); setPrompt(null); }}>{t("Install Family Ledger ")}<Download size={18}/></button>}<div className="install-steps"><h3>{t("iPhone / iPad")}</h3><p>{t("Open this link in Safari. Tap Share, then ")}<strong>{t("Add to Home Screen")}</strong>{t(". Turn on \u201COpen as Web App\u201D if offered.")}</p><h3>{t("Android")}</h3><p>{t("Open this link in Chrome. Tap the \u22EE menu, then ")}<strong>{t("Install app")}</strong>{t(" or ")}<strong>{t("Add to Home screen")}</strong>.</p><h3>{t("When the signal drops")}</h3><p>{t("If Family Ledger is already open and you\u2019re signed in, new expenses can wait on this phone and sync when you reconnect. Opening the app from scratch and signing in need internet.")}</p><p>{t("Pending expenses are stored in this browser, under your account. Don\u2019t clear browser data or switch phones before syncing.")}</p></div></div></dialog></>;
}
export function AccountHelp({ mode, onClose, onRecovered, slug }: {
    mode: 'security' | 'recover';
    onClose: () => void;
    onRecovered: () => void;
    slug?: string;
}) {
 const { t, locale } = useLanguage();

    const dialog = useRef<HTMLDialogElement>(null);
    const [code, setCode] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    useEffect(() => { dialog.current?.showModal(); }, []);
    async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setError(''); try {
        const b = Object.fromEntries(new FormData(e.currentTarget));
        const r = await fetch('/api/household', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...b, action: mode === 'security' ? 'recoveryCode' : 'recover' }) });
        const d: any = await r.json();
        if (!r.ok)
            throw new Error(d.error);
        if (mode === 'security')
            setCode(d.code);
        else
            onRecovered();
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    return <dialog ref={dialog} onCancel={onClose}><div className="modal"><button className="close" aria-label={t("Close account help")} onClick={onClose}><X /></button><div className="modal-symbol"><ShieldCheck /></div><h2>{mode === 'security' ? t('Your spare key.') : t('Get back into your account.')}</h2><p className="modal-description">{mode === 'security' ? t('Create a recovery code and keep it somewhere safe, separate from this phone. Anyone with this code can reset your password.') : t('Use the recovery code you saved earlier. It works once and signs out all existing sessions.')}</p>{error && <div className="error" role="alert">{t(error)}</div>}{code ? <><label>{t("Save this code now")}<textarea readOnly value={code} rows={3}/></label><p className="field-note">{t("This replaces your previous code. It will not be shown again.")}</p><button className="button primary submit" onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([`${t('Family Ledger recovery code')}\n${t('Family login name')}: ${slug}\n${t('Code')}: ${code}\n${t('Keep private. This code resets your password once.')}`], { type: 'text/plain' })); a.download = 'family-ledger-recovery-code.txt'; a.click(); URL.revokeObjectURL(a.href); }}>{t("Download recovery code ")}<Download size={17}/></button><button className="button submit" onClick={onClose}>{t("I\u2019ve saved my code")}</button></> : <form onSubmit={submit}>{mode === 'recover' && <><label>{t("Family login name")}<input name="slug" required defaultValue={slug} autoCapitalize="none"/></label><label>{t("Your username")}<input name="username" required autoComplete="username" autoCapitalize="none"/></label><label>{t("Recovery code")}<input name="code" required minLength={64} maxLength={64} autoCapitalize="none" autoComplete="off"/></label></>}<label>{mode === 'security' ? t('Your current password') : t('New password')}<input name="password" type="password" required minLength={mode === 'security' ? 1 : 12} maxLength={128} autoComplete={mode === 'security' ? 'current-password' : 'new-password'}/></label><button className="button primary submit" disabled={busy}>{busy ? t('One moment…') : mode === 'security' ? t('Create recovery code') : t('Reset password')}</button></form>}</div></dialog>;
}
export async function downloadBackup() { const r = await fetch('/api/household?format=backup'); const d: any = await r.json(); if (!r.ok)
    throw new Error(d.error); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })); a.download = `family-ledger-records-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href); }
