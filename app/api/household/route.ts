import { env } from 'cloudflare:workers';
export const dynamic = 'force-dynamic';
const categories=['Groceries','Home & bills','Transport','Food & coffee','Health','Fun & family','Shopping','Other'];
const currencies=['EUR','USD','GBP','RSD','CHF','CAD','AUD'];
const now=()=>Date.now(),uid=()=>crypto.randomUUID();
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
async function hash(s:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));}
async function passwordHash(password:string,salt:string){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},k,256));}
function equal(a:string,b:string){let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;}
function fail(message:string,status=400):never{throw Object.assign(new Error(message),{status});}
function str(value:unknown,label:string,min=1,max=100){if(typeof value!=='string'||value.trim().length<min||value.trim().length>max)fail(`${label} must be ${min}–${max} characters.`);return (value as string).trim();}
function pass(value:unknown){if(typeof value!=='string'||value.length<12||value.length>128)fail('Use a password with 12–128 characters.');return value as string;}
function money(value:unknown,zero=false){if(typeof value!=='number'||!Number.isSafeInteger(value)||value<(zero?0:1)||value>100000000)fail('Enter a valid amount (up to 1,000,000).');return value as number;}
function validDate(value:unknown){const s=str(value,'Date',10,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)fail('Choose a valid date.');return s;}
function db(){if(!env.DB)fail('The family database is unavailable. Please try again later.',503);return env.DB!;}
function response(body:unknown,status=200,cookie?:string){return Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(cookie?{'Set-Cookie':cookie}:{})}});}
function cookie(token:string,req:Request,maxAge=604800){return `hearth_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${new URL(req.url).protocol==='https:'?'; Secure':''}`;}
async function session(req:Request){const token=(req.headers.get('cookie')||'').match(/(?:^|;\s*)hearth_session=([a-f0-9-]{73})/)?.[1];if(!token)fail('Please sign in to your family.',401);const user=await db().prepare('SELECT m.id,m.family,m.name,m.username,m.role FROM sessions s JOIN members m ON m.id=s.member WHERE s.token=? AND s.expires>?').bind(await hash(token!),now()).first<any>();if(!user)fail('Your session expired. Please sign in again.',401);return user;}
async function limit(req:Request,identity:string){const key=await hash(`${req.headers.get('cf-connecting-ip')||'local'}:${identity}`),time=now();await db().prepare('INSERT INTO attempts (key,count,reset) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset<? THEN 1 ELSE count+1 END, reset=CASE WHEN reset<? THEN excluded.reset ELSE reset END').bind(key,time+900000,time,time).run();const record=await db().prepare('SELECT count FROM attempts WHERE key=?').bind(key).first<any>();if(record.count>20)fail('Too many attempts. Please wait 15 minutes.',429);}
async function newSession(member:string,req:Request){const token=uid()+'-'+uid();await db().batch([db().prepare('DELETE FROM sessions WHERE expires<?').bind(now()),db().prepare('DELETE FROM attempts WHERE reset<?').bind(now()),db().prepare('INSERT INTO sessions(token,member,expires) VALUES (?,?,?)').bind(await hash(token),member,now()+604800000)]);return response({ok:true},200,cookie(token,req));}
async function handler(req:Request){
 if(req.method==='GET'){
  const user=await session(req);
  if(new URL(req.url).searchParams.get('format')==='backup'){const [family,members,expenses,goals]=await Promise.all([db().prepare('SELECT id,name,slug,size,currency,budget FROM families WHERE id=?').bind(user.family).first(),db().prepare('SELECT id,name,username,role FROM members WHERE family=?').bind(user.family).all(),db().prepare('SELECT * FROM expenses WHERE family=? ORDER BY date').bind(user.family).all(),db().prepare('SELECT * FROM goals WHERE family=?').bind(user.family).all()]);return response({format:'hearth-family-export',version:1,exportedAt:new Date().toISOString(),family,members:members.results,expenses:expenses.results,goals:goals.results});}
  const month=new URL(req.url).searchParams.get('month')||new Date().toISOString().slice(0,7);if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))fail('Choose a valid month.');
  const previous=new Date(`${month}-01T12:00:00Z`);previous.setUTCMonth(previous.getUTCMonth()-1);
  const [family,members,expenses,goals,previousTotal]=await Promise.all([
   db().prepare('SELECT id,name,slug,size,currency,budget FROM families WHERE id=?').bind(user.family).first(),
   db().prepare('SELECT id,name,username,role FROM members WHERE family=? ORDER BY created').bind(user.family).all(),
   db().prepare('SELECT e.*,m.name as memberName FROM expenses e JOIN members m ON m.id=e.member WHERE e.family=? AND substr(e.date,1,7)=? ORDER BY e.date DESC,e.created DESC').bind(user.family,month).all(),
   db().prepare('SELECT * FROM goals WHERE family=?').bind(user.family).all(),
   db().prepare('SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE family=? AND substr(date,1,7)=?').bind(user.family,previous.toISOString().slice(0,7)).first<any>()]);
  return response({user,family,members:members.results,expenses:expenses.results,goals:goals.results,previousTotal:previousTotal?.total||0});
 }
 const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)fail('Request origin is not allowed.',403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))fail('Expected JSON.',415);
 const bodyText=await req.text();if(bodyText.length>12000)fail('Request is too large.',413);let b:any;try{b=JSON.parse(bodyText);}catch{fail('Invalid request.');}if(!b||typeof b!=='object')fail('Invalid request.');
 if(['register','login','join','recover'].includes(b.action))await limit(req,'authentication');
 if(b.action==='register'){
  const name=str(b.familyName,'Family name',2,60),slug=str(b.slug,'Family login name',3,40).toLowerCase();if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))fail('Use letters, numbers and single hyphens for the family login name.');
  const memberName=str(b.name,'Your name',2,60),username=str(b.username,'Username',2,40).toLowerCase();if(!/^[a-z0-9_.-]+$/.test(username))fail('Username can contain letters, numbers, dots, underscores and hyphens.');
  if(!Number.isInteger(b.size)||b.size<1||b.size>50)fail('Family size must be between 1 and 50.');if(!currencies.includes(b.currency))fail('Choose a supported currency.');
  const password=pass(b.password),salt=uid(),family=uid(),member=uid(),digest=await passwordHash(password,salt);
  if(await db().prepare('SELECT id FROM families WHERE slug=?').bind(slug).first())fail('That family login name is taken. Add a word or number.',409);
  await db().batch([db().prepare('INSERT INTO families(id,name,slug,size,currency,budget,created) VALUES(?,?,?,?,?,0,?)').bind(family,name,slug,b.size,b.currency,now()),db().prepare('INSERT INTO members(id,family,name,username,password,salt,role,created) VALUES(?,?,?,?,?,?,?,?)').bind(member,family,memberName,username,digest,salt,'admin',now())]);return newSession(member,req);
 }
 if(b.action==='login'){
  const slug=str(b.slug,'Family login name',3,40).toLowerCase(),username=str(b.username,'Username',2,40).toLowerCase();if(typeof b.password!=='string'||b.password.length>128)fail('Enter your password.');
  const member=await db().prepare('SELECT m.* FROM members m JOIN families f ON f.id=m.family WHERE f.slug=? AND m.username=?').bind(slug,username).first<any>(),digest=await passwordHash(b.password,member?.salt||'hearth-constant-timing-salt');
  if(!member||!equal(digest,member.password))fail('Family login name, username or password is incorrect.',401);return newSession(member.id,req);
 }
 if(b.action==='join'){
  const token=str(b.token,'Invitation code',20,120),name=str(b.name,'Your name',2,60),username=str(b.username,'Username',2,40).toLowerCase();if(!/^[a-z0-9_.-]+$/.test(username))fail('Username can contain letters, numbers, dots, underscores and hyphens.');
  const invitation=await db().prepare('SELECT * FROM invites WHERE token=? AND used=0 AND expires>?').bind(await hash(token),now()).first<any>();if(!invitation)fail('This invitation is invalid or expired. Ask your family admin for a new one.');
  const salt=uid(),digest=await passwordHash(pass(b.password),salt),id=uid();
  // D1 batch is transactional. changes() gates insertion on a successful one-time claim.
  const results=await db().batch([db().prepare('UPDATE invites SET used=1 WHERE token=? AND used=0 AND expires>? RETURNING family').bind(await hash(token),now()),db().prepare('INSERT INTO members(id,family,name,username,password,salt,role,created) SELECT ?,?,?,?,?,?,?,? WHERE changes()=1').bind(id,invitation.family,name,username,digest,salt,'member',now())]);if(!results[0].results?.length)fail('This invitation has already been used.',409);return newSession(id,req);
 }
 if(b.action==='recover'){
  const slug=str(b.slug,'Family login name',3,40).toLowerCase(),username=str(b.username,'Username',2,40).toLowerCase(),code=str(b.code,'Recovery code',64,64).toLowerCase();
  const member=await db().prepare('SELECT m.id,m.recovery FROM members m JOIN families f ON f.id=m.family WHERE f.slug=? AND m.username=?').bind(slug,username).first<any>();
  const digest=await hash(code);if(!member?.recovery||!equal(digest,member.recovery))fail('Family, username or recovery code is incorrect.',401);
  const salt=uid(),password=await passwordHash(pass(b.password),salt);
  const r=await db().batch([db().prepare('UPDATE members SET password=?,salt=?,recovery=NULL WHERE id=? AND recovery=? RETURNING id').bind(password,salt,member.id,digest),db().prepare('DELETE FROM sessions WHERE member=? AND changes()=1').bind(member.id)]);
  if(!r[0].results?.length)fail('This recovery code has already been used.',409);return response({ok:true});
 }
 const user=await session(req);
 if(b.expectedMember&&b.expectedMember!==user.id)fail('Sign in to the original account to save this expense.',403);
 if(b.action==='recoveryCode'){
  await limit(req,'recovery-code:'+user.id);const member=await db().prepare('SELECT password,salt FROM members WHERE id=?').bind(user.id).first<any>();
  if(typeof b.password!=='string'||b.password.length>128||!equal(await passwordHash(b.password,member.salt),member.password))fail('Your password is incorrect.',403);
  const code=hex(crypto.getRandomValues(new Uint8Array(32)).buffer);await db().prepare('UPDATE members SET recovery=? WHERE id=?').bind(await hash(code),user.id).run();return response({code});
 }
 if(b.action==='logout'){const token=(req.headers.get('cookie')||'').match(/hearth_session=([^;]+)/)?.[1]||'';await db().prepare('DELETE FROM sessions WHERE token=?').bind(await hash(token)).run();return response({ok:true},200,cookie('',req,0));}
 if(b.action==='expense'){
  const description=str(b.description,'Description',1,240),amount=money(b.amount),date=validDate(b.date);if(!categories.includes(b.category))fail('Choose a category.');
  if(b.id){const result=await db().prepare("UPDATE expenses SET description=?,amount=?,category=?,date=? WHERE id=? AND family=? AND (member=? OR ?='admin')").bind(description,amount,b.category,date,str(b.id,'Expense ID'),user.family,user.id,user.role).run();if(!result.meta.changes)fail('Expense not found or not editable.',404);}
  else {
   const id=b.clientId?str(b.clientId,'Save ID',36,36):uid();if(!/^[a-f0-9-]{36}$/.test(id))fail('Invalid save ID.');
   const old=await db().prepare('SELECT * FROM expenses WHERE id=?').bind(id).first<any>();
   if(old){if(old.family!==user.family||old.member!==user.id||old.amount!==amount||old.description!==description||old.category!==b.category||old.date!==date)fail('This save ID was already used. Refresh and try again.',409);return response({ok:true,id});}
   await db().prepare('INSERT OR IGNORE INTO expenses(id,family,member,amount,description,category,date,created) VALUES(?,?,?,?,?,?,?,?)').bind(id,user.family,user.id,amount,description,b.category,date,now()).run();
   const saved=await db().prepare('SELECT * FROM expenses WHERE id=?').bind(id).first<any>();if(saved.family!==user.family||saved.member!==user.id||saved.amount!==amount||saved.description!==description||saved.category!==b.category||saved.date!==date)fail('Conflicting save. Please retry.',409);
  }return response({ok:true});
 }
 if(b.action==='deleteExpense'){const result=await db().prepare("DELETE FROM expenses WHERE id=? AND family=? AND (member=? OR ?='admin')").bind(str(b.id,'Expense ID'),user.family,user.id,user.role).run();if(!result.meta.changes)fail('Expense not found or not editable.',404);return response({ok:true});}
 if(b.action==='goal'){await db().prepare('INSERT INTO goals(id,family,name,target,saved) VALUES(?,?,?,?,?)').bind(uid(),user.family,str(b.name,'Goal name',2,60),money(b.target),0).run();return response({ok:true});}
 if(b.action==='contribute'){const result=await db().prepare('UPDATE goals SET saved=saved+? WHERE id=? AND family=? AND saved+?<=100000000').bind(money(b.amount),str(b.id,'Goal ID'),user.family,b.amount).run();if(!result.meta.changes)fail('Goal not found or savings limit exceeded.',404);return response({ok:true});}
 if(b.action==='password'){const m=await db().prepare('SELECT password,salt FROM members WHERE id=? AND family=?').bind(user.id,user.family).first<any>();if(typeof b.currentPassword!=='string'||b.currentPassword.length>128||!equal(await passwordHash(b.currentPassword,m.salt),m.password))fail('Current password is incorrect.',403);const salt=uid(),digest=await passwordHash(pass(b.password),salt);await db().batch([db().prepare('UPDATE members SET password=?,salt=? WHERE id=? AND family=?').bind(digest,salt,user.id,user.family),db().prepare('DELETE FROM sessions WHERE member=?').bind(user.id)]);return newSession(user.id,req);}
 if(user.role!=='admin')fail('Only the family admin can do that.',403);
 if(b.action==='invite'){const token=uid()+'-'+uid();await db().prepare('INSERT INTO invites(token,family,expires,used) VALUES(?,?,?,0)').bind(await hash(token),user.family,now()+172800000).run();return response({token});}
 if(b.action==='settings'){const size=Number(b.size);if(!Number.isInteger(size)||size<1||size>50)fail('Family size must be 1–50.');await db().prepare('UPDATE families SET name=?,size=?,budget=? WHERE id=?').bind(str(b.name,'Family name',2,60),size,money(b.budget,true),user.family).run();return response({ok:true});}
 fail('Unknown action.');
}
async function safe(req:Request){try{return await handler(req);}catch(e:any){if(e.message?.includes('UNIQUE constraint'))return response({error:'That name is already in use. Please choose another.'},409);if(!e.status)console.error('Hearth request failed',e.message);return response({error:e.status?e.message:'Something went wrong. Please try again.'},e.status||500);}}
export const GET=safe;export const POST=safe;
