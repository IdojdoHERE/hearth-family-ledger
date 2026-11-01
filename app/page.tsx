'use client';
import {calendarDate,numberLocale} from '../lib/i18n';
import { useLanguage, LanguageSwitch } from './components/language';
import { useEffect, useRef, useState } from 'react';
import QuickExpense from './components/quick-expense';
import { SyncStatus, InstallHelp, AccountHelp, downloadBackup } from './components/phone-tools';
import { ArrowDownLeft, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Check, ChevronLeft, ChevronRight, ChevronsUpDown, Coffee, Copy, Download, Flame, Flower2, Heart, Home, Leaf, LockKeyhole, LogOut, Menu, MoreHorizontal, Pencil, Plus, Search, Settings, ShieldCheck, ShoppingBag, ShoppingBasket, Sparkles, Target, Trash2, Users, Wallet, X, Car, Activity, Gamepad2 } from 'lucide-react';
const cats = ['Groceries', 'Home & bills', 'Transport', 'Food & coffee', 'Health', 'Fun & family', 'Shopping', 'Other'];
const colors = ['#8caa7b', '#d3aa7e', '#9aabbd', '#cc997f', '#a59cb7', '#bfad62', '#b88091', '#b4b6ab'];
const icons = [ShoppingBasket, Home, Car, Coffee, Activity, Gamepad2, ShoppingBag, Flower2];
const currentMonth = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;};
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
type Expense = {
    id: string;
    member: string;
    memberName: string;
    amount: number;
    description: string;
    category: string;
    date: string;
};
type Data = {
    family: {
        name: string;
        slug: string;
        size: number;
        currency: string;
        budget: number;
    };
    user: {
        id: string;
        name: string;
        role: string;
    };
    members: {
        id: string;
        name: string;
        role: string;
        username: string;
    }[];
    expenses: Expense[];
    goals: {
        id: string;
        name: string;
        target: number;
        saved: number;
    }[];
    previousTotal: number;
};
function demoData(month: string): Data {
    return { family: { name: 'The Morgan family', slug: 'morgan-family', size: 4, currency: 'EUR', budget: 400000 }, user: { id: '1', name: 'Alex', role: 'admin' }, members: [{ id: '1', name: 'Alex', role: 'admin', username: 'alex' }, { id: '2', name: 'Jamie', role: 'member', username: 'jamie' }, { id: '3', name: 'Sam', role: 'member', username: 'sam' }, { id: '4', name: 'Riley', role: 'member', username: 'riley' }], previousTotal: 321400, goals: [{ id: 'g1', name: 'A little seaside escape', target: 200000, saved: 124000 }], expenses: [
            { id: 'e1', member: '2', memberName: 'Jamie', amount: 8650, description: 'The weekly grocery run', category: 'Groceries', date: `${month}-24` },
            { id: 'e2', member: '1', memberName: 'Alex', amount: 1850, description: 'Coffee & a catch-up', category: 'Food & coffee', date: `${month}-24` },
            { id: 'e3', member: '3', memberName: 'Sam', amount: 3200, description: 'Movie night, all of us', category: 'Fun & family', date: `${month}-23` },
            { id: 'e4', member: '1', memberName: 'Alex', amount: 5800, description: 'Fuel for the week', category: 'Transport', date: `${month}-22` },
            { id: 'e5', member: '2', memberName: 'Jamie', amount: 125000, description: 'Our home — monthly rent', category: 'Home & bills', date: `${month}-01` },
            { id: 'e6', member: '1', memberName: 'Alex', amount: 58000, description: 'Groceries & household essentials', category: 'Groceries', date: `${month}-08` },
            { id: 'e7', member: '2', memberName: 'Jamie', amount: 24500, description: 'Electricity, water & internet', category: 'Home & bills', date: `${month}-10` },
            { id: 'e8', member: '4', memberName: 'Riley', amount: 15800, description: 'School supplies & trainers', category: 'Shopping', date: `${month}-14` },
            { id: 'e9', member: '1', memberName: 'Alex', amount: 18000, description: 'Train tickets & car insurance', category: 'Transport', date: `${month}-15` },
            { id: 'e10', member: '2', memberName: 'Jamie', amount: 13850, description: 'Sunday lunch & family outings', category: 'Fun & family', date: `${month}-18` }
        ] };
}
const initialMonth = localDate().slice(0, 7);
function Beach() { return <svg className="beach" viewBox="0 0 260 110" fill="none" aria-hidden="true"><circle cx="206" cy="31" r="19" fill="#e8ba73"/><path d="M0 92c40-13 78 8 120 0s79-5 140-1v19H0" fill="#bdc4aa"/><path d="M0 103c60-15 101 14 166-1s76 1 94 0v8H0" fill="#8fa493"/><path d="M136 81l11-61m-37 22c12-31 46-28 60 7-19-13-41-15-60-7z" fill="#d18e69" stroke="#86694e" strokeWidth="2"/><path d="M142 23c-13 8-18 16-20 17m22-17c12 10 15 18 16 21" stroke="#f1c7a4" strokeWidth="2"/><path d="M66 89L56 62l34-2 17 26m-44-9 34-2m-12-13 8 25m-36-12L48 89m48-12 14 11" stroke="#607d64" strokeWidth="3" strokeLinecap="round"/><path d="M190 83c-6-8-6-18-3-27m1 15c-12-1-17-7-19-11 12-2 18 2 19 11zm0-7c9-1 15-7 17-13-10 0-16 5-17 13z" fill="#829777"/></svg>; }
export default function Page() {
 const { t, locale } = useLanguage();

    const [welcome, setWelcome] = useState(true), [quick, setQuick] = useState(false), [accountHelp, setAccountHelp] = useState<'security' | 'recover' | null>(null);
    const [month, setMonth] = useState(initialMonth), [data, setData] = useState<Data>(demoData(initialMonth)), [demo, setDemo] = useState(true), [loading, setLoading] = useState(true), [tab, setTab] = useState('Overview'), [modal, setModal] = useState<string | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [toast, setToast] = useState(''), [search, setSearch] = useState(''), [category, setCategory] = useState('All categories'), [person, setPerson] = useState('Everyone'), [edit, setEdit] = useState<Expense | null>(null), [selectedGoal, setSelectedGoal] = useState(''), [invite, setInvite] = useState(''), [mobile, setMobile] = useState(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const requestId = useRef(0);
    const money = (c: number) => new Intl.NumberFormat(numberLocale(locale), { style: 'currency', currency: data.family.currency }).format(c / 100);
    const monthLabel = calendarDate(new Date(month + '-01T12:00:00'),locale, { month: 'long', year: 'numeric' });
    function clearInvitationUrl() {
        const url = new URL(window.location.href);
        if (!url.searchParams.has('invite')) return;
        url.searchParams.delete('invite');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
    async function refresh(m = month, initial = false) { const id = ++requestId.current; try {
        const r = await fetch('/api/household?month=' + m);
        if (r.status === 401) {
            setWelcome(true);
            setDemo(true);
            if (initial)
                return;
            throw new Error('Please sign in again. Your unsent expenses remain on this phone.');
        }
        const d: any = await r.json();
        if (!r.ok)
            throw new Error(d.error);
        if (id === requestId.current) {
            setData(d);
            setDemo(false);
            setWelcome(false);
            // An existing session goes straight into its own family, even from an old invitation.
            if (initial && new URLSearchParams(window.location.search).has('invite')) {
                setModal(null);
                clearInvitationUrl();
            }
            if (initial && new URLSearchParams(window.location.search).has('quick')) {
                setQuick(true);
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }
    catch (e: any) {
        if (!initial)
            setToast(e.message);
        else
            setToast('Connect to the internet to sign in. Any pending expenses remain on this phone.');
    }
    finally {
        setLoading(false);
    } }
    useEffect(() => { refresh(initialMonth, true); const t = new URLSearchParams(window.location.search).get('invite'); if (t) {
        setInvite(t);
        setModal('join');
        // Keep the invitation in the address until registration succeeds, so reloads can retry.
    } }, []);
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [tab]);
    useEffect(() => { if (demo)
        return; const update = () => { if (navigator.onLine && document.visibilityState === 'visible')
        refresh(month); }; window.addEventListener('focus', update); window.addEventListener('online', update); const timer = setInterval(update, 60000); return () => { window.removeEventListener('focus', update); window.removeEventListener('online', update); clearInterval(timer); }; }, [demo, month]);
    useEffect(() => {
        // Initial invitation state is set while the loading screen has no dialog yet.
        // Open it once the session check finishes and the dialog is mounted.
        if (loading) return;
        if (modal) {
        setError('');
        dialog.current?.showModal();
    }
    else
        dialog.current?.close(); }, [modal, loading]);
    useEffect(() => { if (!toast)
        return; const t = setTimeout(() => setToast(''), 5000); return () => clearTimeout(t); }, [toast]);
    async function api(payload: any) { const r = await fetch('/api/household', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const d: any = await r.json(); if (!r.ok)
        throw new Error(d.error || 'Please try again.'); return d; }
    function notify(s: string) { setToast(s); }
    function changeMonth(delta: number) { const d = new Date(month + '-01T12:00:00'); d.setMonth(d.getMonth() + delta); const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; setMonth(m); if (demo)
        setData(demoData(m));
    else
        refresh(m); }
    function open(name: string) { setEdit(null); setMobile(false); if (name === 'expense') {
        setQuick(true);
        return;
    } setModal(name); }
    const total = data.expenses.reduce((s, e) => s + e.amount, 0), remaining = data.family.budget - total, spentPercent = data.family.budget ? Math.round(total / data.family.budget * 100) : 0;
    const active = data.members.filter(m => data.expenses.some(e => e.member === m.id)).length;
    const totals = cats.map((name, i) => ({ name, color: colors[i], amount: data.expenses.filter(e => e.category === name).reduce((s, e) => s + e.amount, 0) })).sort((a, b) => b.amount - a.amount);
    const filtered = data.expenses.filter(e => (category === 'All categories' || e.category === category) && (person === 'Everyone' || e.member === person) && (e.description + ' ' + e.memberName + ' ' + e.category + ' ' + t(e.category)).toLowerCase().includes(search.toLowerCase()));
    const comparison = data.previousTotal ? Math.round((total - data.previousTotal) / data.previousTotal * 100) : null;
    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setError('');
        const f = Object.fromEntries(new FormData(event.currentTarget).entries()) as any;
        try {
            if (['login', 'register', 'join'].includes(modal || '')) {
                await api({ ...f, action: modal, size: Number(f.size) });
                clearInvitationUrl();
                setInvite('');
                setMonth(initialMonth);
                await refresh(initialMonth);
                setModal(null);
                setTab('Overview');
                setSearch('');
                setCategory('All categories');
                setPerson('Everyone');
                if (modal !== 'login')
                    setAccountHelp('security');
                notify(modal === 'login' ? 'Welcome home.' : 'Your family space is ready.');
                return;
            }
            const action = modal === 'expense' ? 'expense' : modal === 'goal' ? 'goal' : modal === 'contribute' ? 'contribute' : modal === 'settings' ? 'settings' : modal === 'password' ? 'password' : '';
            const payload: any = { ...f, action };
            if (f.amount)
                payload.amount = Math.round(Number(f.amount) * 100);
            if (f.target)
                payload.target = Math.round(Number(f.target) * 100);
            if (f.budget !== undefined)
                payload.budget = Math.round(Number(f.budget) * 100);
            if (f.size)
                payload.size = Number(f.size);
            if (edit)
                payload.id = edit.id;
            if (modal === 'contribute')
                payload.id = selectedGoal;
            if (demo) {
                if (action === 'expense') {
                    const e = { ...payload, id: edit?.id || crypto.randomUUID(), member: edit?.member || data.user.id, memberName: edit?.memberName || data.user.name };
                    setData({ ...data, expenses: [e, ...data.expenses.filter(x => x.id !== e.id)].sort((a, b) => b.date.localeCompare(a.date)) });
                }
                else if (action === 'goal')
                    setData({ ...data, goals: [...data.goals, { id: crypto.randomUUID(), name: f.name, target: payload.target, saved: 0 }] });
                else if (action === 'contribute')
                    setData({ ...data, goals: data.goals.map(g => g.id === selectedGoal ? { ...g, saved: g.saved + payload.amount } : g) });
                else if (action === 'settings')
                    setData({ ...data, family: { ...data.family, name: f.name, size: Number(f.size), budget: payload.budget } });
                else
                    throw new Error('Create your family to use account settings.');
            }
            else {
                await api(payload);
                if (action === 'expense' && payload.date.slice(0, 7) !== month) {
                    setMonth(payload.date.slice(0, 7));
                    await refresh(payload.date.slice(0, 7));
                }
                else
                    await refresh();
            }
            setModal(null);
            notify(demo ? 'Updated in demo · changes reset when you reload' : 'Saved. A little more clarity for everyone.');
        }
        catch (e: any) {
            setError(e.message);
        }
        finally {
            setBusy(false);
        }
    }
    async function removeExpense() { if (!edit)
        return; setBusy(true); try {
        if (demo)
            setData({ ...data, expenses: data.expenses.filter(e => e.id !== edit.id) });
        else {
            await api({ action: 'deleteExpense', id: edit.id });
            await refresh();
        }
        setModal(null);
        notify('Expense removed.');
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    async function makeInvite() { if (demo) {
        open('register');
        return;
    } setBusy(true); try {
        const r = await api({ action: 'invite' });
        setInvite(r.token);
        setModal('invite');
    }
    catch (e: any) {
        notify(e.message);
    }
    finally {
        setBusy(false);
    } }
    async function copyInvite() { try {
        await navigator.clipboard.writeText(window.location.origin + '/?invite=' + invite);
        notify('Invitation link copied.');
    }
    catch {
        notify('Select and copy the invitation link below.');
    } }
    function expenseTitle(e:Expense){return demo && /^e\d+$/.test(e.id) ? t(e.description) : e.description;}
    function goalTitle(g:Data['goals'][number]){return demo && g.id==='g1' ? t(g.name) : g.name;}
    function exportCSV() { const rows = [[t('Date'), t('Description'), t('Category'), t('Paid by'), `${t('Amount')} (${data.family.currency})`], ...filtered.map(e => [e.date, expenseTitle(e), t(e.category), e.memberName, (e.amount / 100).toFixed(2)])]; const csv = rows.map(r => r.map(v => '"' + String(v).replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""') + '"').join(',')).join('\r\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })); a.download = `family-ledger-${month}${demo ? '-demo' : ''}.csv`; a.click(); URL.revokeObjectURL(a.href); notify('Monthly expenses exported.'); }
    const nav = [{ name: 'Overview', Icon: Home }, { name: 'Expenses', Icon: Wallet }, { name: 'Insights', Icon: BarChart3 }, { name: 'Family goals', Icon: Target }, { name: 'Our family', Icon: Users }];
    function expenseTable(limit?: number) { const entries = limit ? filtered.slice(0, limit) : filtered; return entries.length ? <div className="table-scroll"><table><thead><tr><th>{t("Expense")}</th><th>{t("Category")}</th><th>{t("Paid by")}</th><th>{t("Date")}</th><th className="right">{t("Amount")}</th><th><span className="sr-only">{t("Edit")}</span></th></tr></thead><tbody>{entries.map(e => { const i = cats.indexOf(e.category), Icon = icons[i] || Flower2; return <tr key={e.id}><td><div className="expense-title"><span className="cat-icon" style={{ background: colors[i] + '25', color: colors[i] }}><Icon size={18}/></span><strong>{expenseTitle(e)}</strong></div></td><td><span className="category-pill">{t(e.category)}</span></td><td><span className={'avatar tiny a' + data.members.findIndex(m => m.id === e.member)}>{e.memberName[0]}</span>{e.memberName}</td><td className="muted">{calendarDate(new Date(e.date + 'T12:00:00'),locale, { day: 'numeric', month: 'short' })}</td><td className="right amount">{money(e.amount)}</td><td>{(data.user.role === 'admin' || e.member === data.user.id) && <button className="icon-button" aria-label={t('Edit ') + expenseTitle(e)} onClick={() => { setEdit(e); setModal('expense'); }}><Pencil size={14}/></button>}</td></tr>; })}</tbody></table></div> : <div className="empty"><Leaf size={32}/><h3>{search || category !== 'All categories' || person !== 'Everyone' ? t('No matching expenses') : t('A fresh page for your family')}</h3><p>{search ? t('Try a different search or filter.') : t('Add your first expense and the picture starts to come together.')}</p><button className="button" onClick={() => open('expense')}>{t("Add an expense ")}<Plus size={16}/></button></div>; }
    if (loading)
        return <div className="loading-home"><Flame size={38}/><h1>{t("Family Ledger")}</h1><p>{t("Opening your family space\u2026")}</p></div>;
    return <div className={'app-shell ' + (welcome ? 'welcome-active' : '')}>{welcome && <section className="welcome-home"><div className="welcome-language"><LanguageSwitch /></div><a className="brand" href="/"><span className="brand-mark"><Flame size={23}/></span>{t("Family Ledger")}</a><div className="welcome-art"><Home size={48}/><span>{t("YOUR PEOPLE. YOUR EVERYDAY.")}</span></div><h1>{t("Spend a moment.")}<br />{t("Save the bigger picture.")}</h1><p>{t("A quick note today. A clear family budget all month.")}</p><button className="button primary" onClick={() => open('login')}>{t("Sign in to my family ")}<ArrowRight size={19}/></button><button className="button" onClick={() => open('register')}>{t("Create a family space")}</button><button className="text-button" onClick={() => open('join')}>{t("I have a family invitation ")}<ArrowRight size={16}/></button><div className="welcome-benefits"><span><LockKeyhole size={17}/>{t("Private family accounts")}</span><span><Wallet size={17}/>{t("Quick expense entry")}</span></div><InstallHelp /><button className="explore-demo" onClick={() => { setWelcome(false); setDemo(true); setData(demoData(month)); }}>{t("Explore with sample data")}</button></section>}<aside className={'sidebar ' + (mobile ? 'shown' : '')}><a className="brand" href="/" aria-label={t("Family Ledger home")}><span className="brand-mark"><Flame size={23}/></span>{t("Family Ledger")}</a><div className="brand-caption">{t("A little more together.")}</div><button className="family-switch" onClick={() => { setTab('Our family'); setMobile(false); }}><span className="family-emblem"><Home size={21}/></span><span><strong>{demo ? t(data.family.name) : data.family.name}</strong><small>{demo ? t('Your demo family') : t('Your private family space')}</small></span><ChevronsUpDown size={15}/></button><div className="nav-label">{t("YOUR FAMILY SPACE")}</div><nav>{nav.map(({ name, Icon }) => <button key={name} className={tab === name ? 'active' : ''} onClick={() => { setTab(name); setSearch(''); setCategory('All categories'); setPerson('Everyone'); setMobile(false); }}><Icon size={19}/>{t(name)}{name === 'Family goals' && <span className="nav-count">{data.goals.length}</span>}</button>)}</nav><div className="sidebar-bottom"><div className="together-note"><div className="leaf-symbol"><Leaf size={23}/></div><strong>{t("Small steps.")}<br />{t("Shared possibilities.")}</strong><p>{t("Good things grow when")}<br />{t("you plan them together.")}</p></div><button className="settings-nav" onClick={() => open('settings')}><Settings size={18}/>{t("Family settings")}</button><div className="user-row"><span className="avatar a0">{data.user.name[0]}</span><span><strong>{demo ? t('Hello, explorer') : data.user.name}</strong><small>{demo ? t('Make yourself at home') : data.user.role === 'admin' ? t('Family admin') : t('Family member')}</small></span><button className="icon-button" aria-label={demo ? t('Sign in') : t('Sign out')} onClick={async () => { if (demo)
        open('login');
    else
        try {
            await api({ action: 'logout' });
            setDemo(true);
            setWelcome(true);
            setData(demoData(month));
            setTab('Overview');
            notify('Signed out. Pending expenses remain on this phone for your next sign-in.');
        }
        catch (e: any) {
            notify(e.message);
        } }}><LogOut size={17}/></button></div></div></aside>
 <div className="workspace"><header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" aria-label={t("Open menu")} onClick={() => setMobile(!mobile)}><Menu size={20}/></button><Home size={15}/><span>{demo ? t(data.family.name) : data.family.name}</span><span className="slash">/</span><strong>{t(tab)}</strong></div><div className="top-actions"><LanguageSwitch /><span className="privacy"><LockKeyhole size={13}/>{demo ? t('A private space for every family') : t('Private to your family')}</span>{demo ? <button className="text-button" onClick={() => open('login')}>{t("Sign in ")}<ArrowUpRight size={15}/></button> : <button className="avatar a0" onClick={() => open('password')} title={t("Change password")}>{data.user.name[0]}</button>}</div></header>
 <main>{!demo && <SyncStatus member={data.user.id} onSynced={() => refresh()}/>}<div className="intro"><div><div className="eyebrow"><span className="little-dot"/>{t("THE EVERYDAY, SHARED")}</div><h1>{tab === 'Overview' ? t('Your month, at a glance.') : tab === 'Expenses' ? t('The little things add up.') : tab === 'Insights' ? t('See the bigger picture.') : tab === 'Family goals' ? t('Dream a little. Save together.') : t('Your people. Your space.')}</h1><p>{tab === 'Overview' ? t('Less wondering where it went. More deciding where you’ll go.') : tab === 'Expenses' ? t('Every grocery run, coffee, and family adventure. All in one place.') : tab === 'Insights' ? t('A clearer view of the habits that make up your month.') : tab === 'Family goals' ? t('Give the things you’re looking forward to a place to grow.') : t('Everyone has their own account. Everything stays in the family.')}</p></div><button className="button primary" onClick={() => open('expense')}><Plus size={18}/>{t("Add expense")}</button></div>
 {demo && <div className="demo-banner"><span><Sparkles size={16}/><strong>{t("A peek into family life.")}</strong>{t(" You\u2019re exploring a demo \u2014 try it out.")}</span><button onClick={() => open('register')}>{t("Create your family ")}<ArrowRight size={16}/></button></div>}
 <div className="section-toolbar"><div className="month-picker"><button aria-label={t("Previous month")} onClick={() => changeMonth(-1)}><ChevronLeft size={17}/></button><label><span>{monthLabel}</span><input aria-label={t("Select month")} type="month" value={month} onChange={e => { if (!e.target.value)
        return; setMonth(e.target.value); demo ? setData(demoData(e.target.value)) : refresh(e.target.value); }}/></label><button aria-label={t("Next month")} onClick={() => changeMonth(1)}><ChevronRight size={17}/></button></div><span className="live-note"><span className="little-dot"/>{loading ? t('Getting things ready…') : demo ? t('Sample family · Try every feature') : t('Your family’s shared ledger')}</span></div>
 {(tab === 'Overview' || tab === 'Insights') && <><div className="summary-grid"><section className="summary total-card"><div className="summary-label">{t("Together, you\u2019ve spent ")}<span className="summary-icon"><Wallet size={18}/></span></div><div className="big-number">{money(total)}</div><div className="summary-foot">{comparison !== null ? <><span className="trend">{comparison <= 0 ? <ArrowDownRight size={15}/> : <ArrowUpRight size={15}/>} {Math.abs(comparison)}%</span><span>{t("vs. last month")}</span></> : <span>{t("Your monthly story starts here")}</span>}<div className="mini-bars" aria-hidden="true">{[32, 55, 42, 76, 60, 45, 68, 48, 80, 57, 44, 65].map((h, i) => <i key={i} style={{ height: h + '%' }}/>)}</div></div></section><section className="summary"><div className="summary-label">{data.family.budget > 0 && remaining < 0 ? t('Over your monthly budget') : t('Room in your budget')}<span className="summary-icon light"><Leaf size={18}/></span></div><div className="big-number">{data.family.budget ? money(Math.abs(remaining)) : t('Let’s set a plan')}</div><div className="budget-track"><i style={{ width: Math.min(100, spentPercent) + '%', background: remaining < 0 ? '#b66853' : undefined }}/></div><div className="summary-foot muted">{data.family.budget ? <><span>{spentPercent}{t("% of ")}{money(data.family.budget)}{t(" used")}</span><button className="link" onClick={() => open('settings')}>{t("Edit")}</button></> : <button className="link" onClick={() => open('settings')}>{t("Set a monthly budget ")}<ArrowRight size={14}/></button>}</div></section><section className="summary"><div className="summary-label">{t("Everyone, in the loop ")}<span className="summary-icon light"><Users size={18}/></span></div><div className="family-stat"><div className="avatar-stack">{data.members.slice(0, 4).map((m, i) => <span key={m.id} className={'avatar a' + i}>{m.name[0]}</span>)}</div><span><strong>{data.members.length}</strong>{t(" members")}</span></div><div className="summary-foot muted"><span>{active}{t(" added expenses this month")}</span><button className="round-arrow" aria-label={t("View family")} onClick={() => setTab('Our family')}><ArrowUpRight size={16}/></button></div></section></div>
 <div className="middle-grid"><section className="panel spending"><div className="panel-heading"><div><h2>{t("Where life happened")}</h2><p>{t("Your spending, by category")}</p></div><span className="subtle-tag">{monthLabel.split(' ')[0]}</span></div><div className="spending-body"><div className="donut" style={{ background: total ? `conic-gradient(${(() => { let start = 0; return totals.filter(c => c.amount).map(c => { const end = start + c.amount / total * 100, s = `${c.color} ${start}% ${end}%`; start = end; return s; }).join(','); })()})` : '#e8ebe3' }}><div><span>{data.expenses.length}</span><small>{t("little moments")}</small></div></div><div className="category-list">{totals.filter(c => c.amount > 0).slice(0, 5).map(c => <button key={c.name} onClick={() => { setCategory(c.name); setTab('Expenses'); }}><span className="category-dot" style={{ background: c.color }}/><span>{t(c.name)}</span><strong>{money(c.amount)}</strong><small>{Math.round(c.amount / total * 100)}%</small></button>)}{!total && <p className="muted">{t("Add your first expense to see your spending story.")}</p>}{totals.filter(c => c.amount > 0).length > 5 && <button className="link" onClick={() => setTab('Insights')}>{t("View all categories")}</button>}</div></div><div className="panel-foot"><Leaf size={15}/>{total ? t(`${totals[0].name} is your biggest chapter this month.`) : t('A little awareness is a good place to start.')}<button className="link" onClick={() => setTab('Expenses')}>{t("See expenses ")}<ArrowRight size={14}/></button></div></section><section className="dream-card"><div className="dream-kicker"><Sparkles size={15}/>{t("THE NEXT GOOD THING")}</div><h2>{data.goals[0] ? goalTitle(data.goals[0]) : t('What’s your family dreaming of?')}</h2><p>{t("A shared dream. A little closer every day.")}</p><Beach />{data.goals[0] ? <><div className="goal-amount"><strong>{money(data.goals[0].saved)}</strong><span>{t("of ")}{money(data.goals[0].target)}</span><b>{Math.round(data.goals[0].saved / data.goals[0].target * 100)}%</b></div><div className="budget-track"><i style={{ width: Math.min(100, data.goals[0].saved / data.goals[0].target * 100) + '%' }}/></div><button className="dream-button" onClick={() => { setSelectedGoal(data.goals[0].id); setModal('contribute'); }}>{t("Add to the dream ")}<Plus size={16}/></button></> : <button className="dream-button" onClick={() => open('goal')}>{t("Start a family goal ")}<Plus size={16}/></button>}</section></div></>}
 {(tab === 'Overview' || tab === 'Expenses') && <section className="panel ledger"><div className="panel-heading"><div><h2>{tab === 'Overview' ? t('The latest little things') : t('Your family’s expenses')}</h2><p>{tab === 'Overview' ? t('An everyday record, made together.') : t(`${filtered.length} ${filtered.length===1?'expense':'expenses'} · ${money(filtered.reduce((s, e) => s + e.amount, 0))} total`)}</p></div><button className="text-button export" onClick={exportCSV}><Download size={15}/>{t("Export CSV")}</button></div>{tab === 'Expenses' && <div className="filters"><label className="search-box"><Search size={16}/><input placeholder={t("Search your expenses…")} aria-label={t("Search expenses")} value={search} onChange={e => setSearch(e.target.value)}/></label><select aria-label={t("Filter by category")} value={category} onChange={e => setCategory(e.target.value)}>{['All categories', ...cats].map(c => <option key={c} value={c}>{t(c)}</option>)}</select><select aria-label={t("Filter by member")} value={person} onChange={e => setPerson(e.target.value)}><option value="Everyone">{t("Everyone")}</option>{data.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>}{expenseTable(tab === 'Overview' ? 4 : undefined)}{tab === 'Overview' && <button className="table-bottom" onClick={() => setTab('Expenses')}>{t("See all expenses ")}<ArrowRight size={15}/></button>}</section>}
 {tab === 'Insights' && <div className="insight-grid"><section className="panel"><div className="panel-heading"><div><h2>{t("Every category, in focus")}</h2><p>{t("Where this month\u2019s money went")}</p></div></div><div className="bar-list">{totals.map(c => <div key={c.name}><div><span>{t(c.name)}</span><strong>{money(c.amount)}</strong></div><div className="budget-track"><i style={{ width: (total ? c.amount / total * 100 : 0) + '%', background: c.color }}/></div></div>)}</div></section><section className="panel"><div className="panel-heading"><div><h2>{t("Made possible by everyone")}</h2><p>{t("Who paid for this month\u2019s expenses")}</p></div></div><div className="member-totals">{data.members.map((m, i) => <div key={m.id}><span className={'avatar a' + i}>{m.name[0]}</span><span>{m.name}</span><strong>{money(data.expenses.filter(e => e.member === m.id).reduce((s, e) => s + e.amount, 0))}</strong></div>)}</div><p className="gentle-note"><Heart size={16}/>{t("Every contribution matters. This is a shared picture, never a scoreboard.")}</p></section></div>}
 {tab === 'Family goals' && <><div className="row-heading"><p className="muted">{t("Savings are tracked separately from expenses. No money is moved.")}</p><button className="button" onClick={() => open('goal')}><Plus size={16}/>{t("New goal")}</button></div><div className="goals-grid">{data.goals.map((g, i) => <section key={g.id} className={'goal-card ' + (i % 2 ? 'sage' : '')}><Target size={25}/><h2>{goalTitle(g)}</h2><p>{g.saved >= g.target ? t('You made it. Time to celebrate!') : t('One small step at a time.')}</p><Beach /><div className="goal-amount"><strong>{money(g.saved)}</strong><span>{t("of ")}{money(g.target)}</span></div><div className="budget-track"><i style={{ width: Math.min(100, g.saved / g.target * 100) + '%' }}/></div><button className="dream-button" onClick={() => { setSelectedGoal(g.id); setModal('contribute'); }}>{t("Record savings ")}<Plus size={16}/></button></section>)}<button className="new-goal" onClick={() => open('goal')}><span><Plus size={26}/></span><h3>{t("Make room for a new dream")}</h3><p>{t("A holiday, a new home, or a rainy-day fund.")}</p></button></div></>}
 {tab === 'Our family' && <><div className="family-hero"><div className="family-emblem large"><Home size={32}/></div><div><h2>{demo ? t(data.family.name) : data.family.name}</h2><p>{t("Family login: ")}<strong>{data.family.slug}</strong>{t(" \u00B7 Household size: ")}{data.family.size}</p></div>{data.user.role === 'admin' && <button className="button primary" disabled={busy} onClick={makeInvite}><Plus size={16}/>{t("Invite a member")}</button>}</div><div className="members-grid">{data.members.map((m, i) => <section className="panel member-card" key={m.id}><span className={'avatar xl a' + i}>{m.name[0]}</span><h2>{m.name} {m.id === data.user.id && <small>{t("(you)")}</small>}</h2><span className="category-pill">{m.role === 'admin' ? t('Family admin') : t('Family member')}</span><p>{data.expenses.filter(e => e.member === m.id).length}{t(" expenses this month")}</p></section>)}</div><div className="privacy-card"><ShieldCheck size={28}/><div><h3>{t("Your family\u2019s business stays your family\u2019s business.")}</h3><p>{t("Every member has their own password. Invitations are single-use and expire in 48 hours. Other families cannot view or change your records.")}</p></div></div></>}
 <div className="phone-install"><InstallHelp /></div><footer><span className="footer-brand"><Flame size={15}/>{t("Family Ledger")}</span><span>{t("A little clarity. A lot more together.")}</span><button onClick={() => open('about')}>{t("About & privacy ")}<ArrowUpRight size={12}/></button></footer>
 </main></div>
 <dialog ref={dialog} onCancel={() => setModal(null)} onClick={e => { if (e.target === dialog.current)
        setModal(null); }}><div className="modal"><button className="close" aria-label={t("Close dialog")} onClick={() => setModal(null)}><X size={21}/></button><div className="modal-symbol">{['register', 'join', 'login'].includes(modal || '') ? <Flame size={26}/> : modal === 'goal' || modal === 'contribute' ? <Target size={26}/> : <Leaf size={26}/>}</div><h2>{modal === 'register' ? t('Make yourself at home.') : modal === 'login' ? t('Welcome home.') : modal === 'join' ? t('There’s a place for you.') : modal === 'expense' ? (edit ? 'Edit a little moment.' : 'What did life look like today?') : modal === 'goal' ? t('What are you dreaming of?') : modal === 'contribute' ? t('A little closer to your dream.') : modal === 'settings' ? t('A plan that fits your family.') : modal === 'invite' ? t('Bring your people together.') : modal === 'delete' ? t('Remove this expense?') : modal === 'password' ? t('Your account, kept safe.') : t('A little about Family Ledger.')}</h2><p className="modal-description">{modal === 'register' ? t('Start your private family space. You’ll be the family admin.') : modal === 'login' ? t('Your family login name, your username, your password.') : modal === 'join' ? t('Join with an invitation from your family admin.') : modal === 'expense' ? t('Every little thing belongs in the bigger picture.') : modal === 'contribute' ? t('Record money you’ve set aside. This does not transfer money or add an expense.') : modal === 'invite' ? t('One link, one member. Expires in 48 hours.') : modal === 'settings' ? t('The monthly budget applies to every month. Past spending is kept.') : modal === 'delete' ? t('This will permanently remove the expense from your family ledger.') : ''}</p>
 {error && <div className="error" role="alert">{t(error)}</div>}
 {['register', 'login', 'join', 'expense', 'goal', 'contribute', 'settings', 'password'].includes(modal || '') && <form key={modal} onSubmit={submit}>
 {modal === 'register' && <><label>{t("Family name")}<input name="familyName" required minLength={2} maxLength={60} placeholder={t("The Morgan family")}/></label><label>{t("Family login name")}<input name="slug" required minLength={3} maxLength={40} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder={t("morgan-family")} autoCapitalize="none"/><small>{t("A unique name everyone in your family uses to sign in.")}</small></label><div className="form-row"><label>{t("Household members")}<input name="size" type="number" required min={1} max={50} defaultValue={4}/></label><label>{t("Currency")}<select name="currency" defaultValue="EUR">{['EUR', 'USD', 'GBP', 'RSD', 'CHF', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{t(c)}</option>)}</select></label></div></>}
 {modal === 'login' && <label>{t("Family login name")}<input name="slug" required autoCapitalize="none" placeholder={t("morgan-family")} autoComplete="organization"/></label>}
 {modal === 'join' && <label>{t("Invitation code")}<input name="token" required defaultValue={invite} placeholder={t("Paste your invitation code")}/></label>}
 {(modal === 'register' || modal === 'join') && <label>{t("Your name")}<input name="name" required minLength={2} maxLength={60} placeholder={t("Alex")} autoComplete="given-name"/></label>}
 {['register', 'login', 'join'].includes(modal || '') && <><label>{t("Your username")}<input name="username" required minLength={2} maxLength={40} autoCapitalize="none" autoComplete="username" placeholder={t("alex")}/></label><label>{t("Password")}<input name="password" type="password" required minLength={modal === 'login' ? 1 : 12} maxLength={128} autoComplete={modal === 'login' ? 'current-password' : 'new-password'} placeholder={modal === 'login' ? t('Your password') : t('At least 12 characters')}/></label>{modal !== 'login' && <p className="field-note">{t("Use a password you can remember. After joining, save a recovery code in case you forget it.")}</p>}</>}
 {modal === 'expense' && <><div className="form-row"><label>{t("Amount (")}{data.family.currency})<input name="amount" type="number" min="0.01" max="1000000" step="0.01" required placeholder="0.00" defaultValue={edit ? edit.amount / 100 : undefined} autoFocus/></label><label>{t("Date")}<input name="date" type="date" required defaultValue={edit?.date || (month === initialMonth ? localDate() : month + '-01')}/></label></div><label>{t("What was it for?")}<input name="description" required minLength={1} maxLength={240} placeholder={t("The weekly grocery run")} defaultValue={edit?.description}/></label><label>{t("Category")}<select name="category" defaultValue={edit?.category || 'Groceries'}>{cats.map(c => <option key={c} value={c}>{t(c)}</option>)}</select></label><div className="recorded-as"><span className="avatar tiny a0">{(edit?.memberName || data.user.name)[0]}</span>{t("Paid by ")}{edit?.memberName || data.user.name}</div></>}
 {modal === 'goal' && <><label>{t("Give your goal a name")}<input name="name" required minLength={2} maxLength={60} placeholder={t("Our next family adventure")}/></label><label>{t("Target amount (")}{data.family.currency})<input name="target" type="number" required min="0.01" max="1000000" step="0.01" placeholder="2000.00"/></label></>}
 {modal === 'contribute' && <label>{t("Amount saved (")}{data.family.currency})<input name="amount" type="number" required min="0.01" max="1000000" step="0.01" placeholder="50.00"/></label>}
 {modal === 'settings' && <><label>{t("Family name")}<input name="name" required minLength={2} maxLength={60} defaultValue={data.family.name} disabled={data.user.role !== 'admin'}/></label><div className="form-row"><label>{t("Household size")}<input name="size" type="number" min={1} max={50} required defaultValue={data.family.size} disabled={data.user.role !== 'admin'}/></label><label>{t("Monthly budget (")}{data.family.currency})<input name="budget" type="number" min={0} max="1000000" step="0.01" required defaultValue={data.family.budget / 100} disabled={data.user.role !== 'admin'}/></label></div><p className="field-note">{t("Currency is fixed at registration so existing amounts keep their meaning. A budget of 0 turns budget tracking off.")}</p>{data.user.role !== 'admin' && <p className="field-note">{t("Ask your family admin to update these settings.")}</p>}</>}
 {modal === 'password' && <><label>{t("Current password")}<input name="currentPassword" type="password" required autoComplete="current-password"/></label><label>{t("New password")}<input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password"/></label><p className="field-note">{t("Changing your password signs out your other sessions.")}</p></>}
 <button className="button primary submit" disabled={busy || (modal === 'settings' && data.user.role !== 'admin')}>{busy ? t('One moment…') : modal === 'login' ? t('Sign in') : modal === 'register' ? t('Create my family') : modal === 'join' ? t('Join my family') : modal === 'expense' ? t('Save expense') : modal === 'goal' ? t('Create goal') : modal === 'contribute' ? t('Record savings') : t('Save changes')}<ArrowRight size={17}/></button>
 {modal === 'expense' && edit && <button type="button" className="delete-button" onClick={() => setModal('delete')}><Trash2 size={14}/>{t("Remove expense")}</button>}
 </form>}
 {modal === 'login' && <div className="auth-links"><button onClick={() => { setModal(null); setAccountHelp('recover'); }}>{t("Forgot password? Use my recovery code")}</button><button onClick={() => setModal('register')}>{t("New here? Create your family")}</button><button onClick={() => setModal('join')}>{t("Have an invitation? Join your family")}</button></div>}
 {(modal === 'register' || modal === 'join') && <div className="auth-links"><button onClick={() => setModal('login')}>{t("Already part of the family? Sign in")}</button></div>}
 {modal === 'invite' && <><label>{t("Invitation link")}<textarea readOnly rows={3} value={typeof window !== 'undefined' ? window.location.origin + '/?invite=' + invite : invite}/></label><button className="button primary submit" onClick={copyInvite}><Copy size={16}/>{t("Copy invitation link")}</button><p className="field-note">{t("Share this privately with the person you want to invite. They\u2019ll create their own username and password.")}</p></>}
 {modal === 'settings' && !demo && <div className="account-actions"><button className="button" onClick={() => { setModal(null); setAccountHelp('security'); }}><ShieldCheck size={18}/>{t("Create recovery code")}</button><button className="button" onClick={() => { setModal('password'); }}>{t("Change my password")}</button><button className="button" onClick={async () => { try {
        await downloadBackup();
        notify('All-months family records downloaded. Keep this file private.');
    }
    catch (e: any) {
        setError(e.message);
    } }}><Download size={18}/>{t("Download all family records")}</button><p className="field-note">{t("The export includes all months, members and goals. It is a readable data snapshot; automatic restore is not included.")}</p></div>}{modal === 'delete' && <div className="form-row"><button className="button" onClick={() => setModal('expense')}>{t("Keep expense")}</button><button className="button danger" disabled={busy} onClick={removeExpense}>{t("Remove expense")}</button></div>}
 {modal === 'about' && <div className="about-copy"><p>{t("Family Ledger gives every family a separate place to keep track of everyday spending and shared dreams.")}</p><h3>{t("Your information")}</h3><p>{t("Family names, account names, expenses, budgets, and savings goals are stored on the server. Passwords are salted and hashed. A necessary sign-in cookie keeps you logged in for up to seven days. No advertising or analytics trackers are included.")}</p><h3>{t("Who can see what?")}</h3><p>{t("Members see their family\u2019s shared expenses and goals. Members can edit their own expenses; the family admin can edit all family expenses and invite people. As with any hosted service, the operator manages the underlying database.")}</p><h3>{t("Your records, your choice")}</h3><p>{t("You can export monthly expenses as CSV and remove expenses from the ledger. Savings goals record progress; Family Ledger does not connect to banks or move money. You can generate a private, single-use recovery code in Family settings. It can reset a forgotten password. Full account deletion is not available yet. Unsent expenses are saved in this browser under your account until the server confirms them; do not clear browser data before syncing.")}</p><h3>{t("Built to grow together")}</h3><p>{t("Family Ledger was built with AI assistance. It does not send your expenses to an AI service, and there is no AI usage fee. The app is open-source under the MIT license. ")}<a href="https://github.com/IdojdoHERE/hearth-family-ledger" target="_blank" rel="noopener noreferrer">{t("View the source and contribute on GitHub.")}</a></p></div>}
 </div></dialog>{quick && <QuickExpense user={data.user} currency={data.family.currency} demo={demo} recent={data.expenses} onClose={() => setQuick(false)} onSaved={date => { setMonth(date.slice(0, 7)); refresh(date.slice(0, 7)); }} onDemo={e => setData({ ...data, expenses: [e, ...data.expenses] })}/>}{accountHelp && <AccountHelp mode={accountHelp} slug={accountHelp === 'security' ? data.family.slug : undefined} onClose={() => setAccountHelp(null)} onRecovered={() => { setAccountHelp(null); setModal('login'); notify('Password reset. Sign in with your new password.'); }}/>}{!welcome && <nav className="phone-nav" aria-label={t("Phone navigation")}><button className={tab === 'Overview' ? 'selected' : ''} onClick={() => setTab('Overview')}><Home size={22}/><span>{t("Home")}</span></button><button className={tab === 'Expenses' ? 'selected' : ''} onClick={() => setTab('Expenses')}><Wallet size={22}/><span>{t("Expenses")}</span></button><button className="phone-add" aria-label={t("Add expense quickly")} onClick={() => open('expense')}><Plus size={26}/><span>{t("Add")}</span></button><button className={tab === 'Family goals' ? 'selected' : ''} onClick={() => setTab('Family goals')}><Target size={22}/><span>{t("Goals")}</span></button><button className={tab === 'Our family' ? 'selected' : ''} onClick={() => setTab('Our family')}><Users size={22}/><span>{t("Family")}</span></button></nav>}{toast && <div className="toast" role="status"><Check size={17}/>{t(toast)}<button aria-label={t("Dismiss notification")} onClick={() => setToast('')}><X size={14}/></button></div>}</div>;
}
