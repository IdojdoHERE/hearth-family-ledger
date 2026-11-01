'use client';
import {calendarDate,numberLocale} from '../../lib/i18n';
import { useLanguage } from './language';
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Check, ChevronDown, Coffee, Home, ShoppingBasket, Car, Activity, Gamepad2, ShoppingBag, Flower2, X } from 'lucide-react';
import { amountToCents, today, expenseCategories, readQueue, writeQueue, sendExpense, PendingExpense } from '../../lib/expense-input';
const icons = [ShoppingBasket, Home, Car, Coffee, Activity, Gamepad2, ShoppingBag, Flower2];
export default function QuickExpense({ user, currency, demo, recent, onClose, onSaved, onDemo }: {
    user: {
        id: string;
        name: string;
    };
    currency: string;
    demo: boolean;
    recent: any[];
    onClose: () => void;
    onSaved: (date: string) => void;
    onDemo: (e: any) => void;
}) {
 const { t, locale } = useLanguage();

    const [amount, setAmount] = useState(''), [category, setCategory] = useState('Groceries'), [note, setNote] = useState(''), [date, setDate] = useState(today()), [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');
    const dialog = useRef<HTMLDialogElement>(null), input = useRef<HTMLInputElement>(null), locked = useRef(false), clientId = useRef(crypto.randomUUID());
    const favorites = recent.filter(e => e.member === user.id).filter((e, i, a) => a.findIndex(x => x.description === e.description && x.amount === e.amount) === i).slice(0, 3);
    useEffect(() => { dialog.current?.showModal(); input.current?.focus(); }, []);
    async function save(e: React.FormEvent) {
        e.preventDefault();
        if (locked.current)
            return;
        const cents = amountToCents(amount);
        if (cents === null) {
            setError('Enter an amount like 12.50 or 12,50.');
            return;
        }
        locked.current = true;
        setBusy(true);
        setError('');
        const item: PendingExpense = { action: 'expense', clientId: clientId.current, expectedMember: user.id, amount: cents, category, description: note.trim() || t(category), date };
        try {
            if (demo) {
                onDemo({ ...item, id: item.clientId, member: user.id, memberName: user.name });
                setSuccess('Added to the demo.');
            }
            else {
                const q = readQueue(user.id);
                if (q.length >= 100)
                    throw new Error('You have 100 pending expenses. Connect and sync them first.');
                // Persist before sending so a lost response or interrupted connection cannot lose the entry.
                writeQueue(user.id, [...q.filter(x => x.clientId !== item.clientId), item]);
                try {
                    await sendExpense(item);
                    writeQueue(user.id, readQueue(user.id).filter(x => x.clientId !== item.clientId));
                    setSuccess('Saved to your family.');
                    onSaved(date);
                }
                catch (err: any) {
                    if (err.status && err.status < 500) {
                        writeQueue(user.id, readQueue(user.id).filter(x => x.clientId !== item.clientId));
                        throw err;
                    }
                    setSuccess('Saved on this phone. It will sync when you reconnect.');
                }
            }
        }
        catch (err: any) {
            setError(err.message || 'This phone could not store the expense. Please keep this screen open and try again.');
        }
        finally {
            setBusy(false);
            locked.current = false;
        }
    }
    return <dialog ref={dialog} className="quick-dialog" onCancel={onClose}><div className="quick-sheet"><div className="sheet-handle"/><div className="quick-top"><span>{demo ? t('DEMO EXPENSE') : t('NEW EXPENSE')}</span><button className="icon-button" onClick={onClose} aria-label={t("Close quick expense")}><X size={22}/></button></div>{success ? <div className="quick-success"><span className="success-orb"><Check size={34}/></span><h2>{success.startsWith('Saved on') ? t('Safe on this phone.') : t('All done.')}</h2><p role="status">{t(success)}</p><button className="button primary" onClick={onClose}>{t("Done ")}<Check size={18}/></button><button className="text-button" onClick={() => { setSuccess(''); setAmount(''); setNote(''); clientId.current = crypto.randomUUID(); setTimeout(() => input.current?.focus(), 0); }}>{t("Add another expense")}</button></div> : <form onSubmit={save}><label className="quick-amount"><span>{t("How much?")}</span><div><b>{currency}</b><input ref={input} aria-label={t("Expense amount")} inputMode="decimal" autoComplete="off" placeholder={locale==='sq-AL'?'0,00':'0.00'} value={amount} onChange={e => setAmount(e.target.value)} required/></div></label><div className="quick-category-label">{t("What was it for?")}</div><div className="quick-categories" role="group" aria-label={t("Expense category")}>{expenseCategories.map((c, i) => { const Icon = icons[i]; return <button type="button" key={c} aria-pressed={category === c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}><Icon size={21}/><span>{t(c)}</span></button>; })}</div><label className="quick-note">{t("Note ")}<span>{t("optional")}</span><input maxLength={240} placeholder={t("e.g. bread & milk")} value={note} onChange={e => setNote(e.target.value)}/></label><details className="quick-details"><summary>{date === today() ? t('Today') : calendarDate(new Date(date + 'T12:00:00'),locale, { day: 'numeric', month: 'short' })} · {user.name}<ChevronDown size={16}/></summary><label>{t("Expense date")}<input type="date" value={date} onChange={e => setDate(e.target.value)} required/></label><small>{t("The expense is always recorded under your own account.")}</small></details>{favorites.length > 0 && <div className="quick-repeats"><span>{t("Use a recent expense")}</span><div>{favorites.map(e => <button type="button" key={e.id} onClick={() => { setAmount((e.amount / 100).toFixed(2)); setNote(e.description); setCategory(e.category); }}>{demo && /^e\d+$/.test(e.id) ? t(e.description) : e.description} · {new Intl.NumberFormat(numberLocale(locale),{minimumFractionDigits:2,maximumFractionDigits:2}).format(e.amount/100)}</button>)}</div></div>}{error && <div className="error" role="alert">{t(error)}</div>}<div className="quick-save"><button className="button primary" type="submit" disabled={busy}>{busy ? t('Saving…') : t('Save expense')}<ArrowRight size={20}/></button><small>{demo ? t('Demo only · no real records saved') : t('Stored on this phone until the server confirms it')}</small></div></form>}</div></dialog>;
}
