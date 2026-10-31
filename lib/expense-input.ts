export const expenseCategories=['Groceries','Home & bills','Transport','Food & coffee','Health','Fun & family','Shopping','Other'];
// Accept common phone decimal separators; never guess ambiguous thousands formats.
export function amountToCents(raw:string):number|null {
 const normalized=raw.trim().replace(',','.');
 if(!/^\d{1,7}(\.\d{1,2})?$/.test(normalized))return null;
 const [whole,fraction='']=normalized.split('.');const n=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 return Number.isSafeInteger(n)&&n>0&&n<=100000000?n:null;
}
export function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export type PendingExpense={clientId:string;expectedMember:string;amount:number;description:string;category:string;date:string;action:'expense'};
export function queueKey(member:string){return 'hearth:pending:'+member;}
export function readQueue(member:string):PendingExpense[]{try{const q=JSON.parse(localStorage.getItem(queueKey(member))||'[]');return Array.isArray(q)?q.filter(x=>x.expectedMember===member&&typeof x.clientId==='string'&&Number.isSafeInteger(x.amount)):[];}catch{return [];}}
export function writeQueue(member:string,q:PendingExpense[]){localStorage.setItem(queueKey(member),JSON.stringify(q));window.dispatchEvent(new Event('hearth:queue'));}
export async function sendExpense(item:PendingExpense){const r=await fetch('/api/household',{signal:AbortSignal.timeout(12000),method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)});const result:any=await r.json();if(!r.ok)throw Object.assign(new Error(result.error||'Could not save.'),{status:r.status});return result;}
