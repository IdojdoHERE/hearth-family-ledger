// Only for the isolated local recovery-qa preview. No real accounts or remote DB access.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const base='http://127.0.0.1:8787', endpoint=base+'/api/household';
function sql(command){const r=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--persist-to','.wrangler/recovery-qa','--config','dist/server/wrangler.json','--command',command,'--json'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)[0].results;}
async function post(body,cookie=''){const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json',origin:base,cookie},body:JSON.stringify(body)});assert.equal(r.status,200,await r.clone().text());return {cookie:r.headers.get('set-cookie')?.split(';')[0]||cookie,header:r.headers.get('set-cookie')};}
async function get(cookie,status=200){const r=await fetch(endpoint,{headers:{cookie}});assert.equal(r.status,status);return r;}
const slug='session-'+crypto.randomUUID().slice(0,8),password='Local-only-pass-8847';
const register={action:'register',familyName:'Session test',slug,size:2,currency:'EUR',name:'Test User',username:'tester',password};
const a=await post(register);assert.match(a.header,/Max-Age=34560000/);assert.match(a.header,/HttpOnly; SameSite=Lax/);
const key=c=>createHash('sha256').update(c.split('=')[1]).digest('hex');
assert.equal(sql(`SELECT expires FROM sessions WHERE token='${key(a.cookie)}'`)[0].expires,0);
const renewed=await get(a.cookie);assert.match(renewed.headers.get('set-cookie'),/Max-Age=34560000/);assert.ok(!('sessionExpires' in (await renewed.json()).user));
// Live old sessions upgrade to persistent, expired old sessions stay rejected.
sql(`UPDATE sessions SET expires=${Date.now()+3600000} WHERE token='${key(a.cookie)}'`);
await get(a.cookie);assert.equal(sql(`SELECT expires FROM sessions WHERE token='${key(a.cookie)}'`)[0].expires,0);
sql(`UPDATE sessions SET expires=${Date.now()-1000} WHERE token='${key(a.cookie)}'`);
const expired=await get(a.cookie,401);assert.equal(expired.headers.get('set-cookie'),null);
const b=await post({...register,slug:slug+'-other'});
const login=await post({action:'login',slug,username:'tester',password});await get(b.cookie); // Cleanup must preserve expires=0.
// Operator-issued recovery codes use the ordinary one-time flow and revoke sessions.
const code=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const data=await (await get(login.cookie)).json();
sql(`UPDATE members SET recovery='${createHash('sha256').update(code).digest('hex')}' WHERE id='${data.user.id}'`);
await post({action:'recover',slug,username:'tester',code,password:password+'new'});await get(login.cookie,401);
const replay=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json',origin:base},body:JSON.stringify({action:'recover',slug,username:'tester',code,password:password+'new'})});assert.equal(replay.status,401);
const recovered=await post({action:'login',slug,username:'tester',password:password+'new'});await get(recovered.cookie);
const logout=await post({action:'logout'},recovered.cookie);assert.match(logout.header,/Max-Age=0/);await get(recovered.cookie,401);
console.log('PASS: persistent sessions, cookie renewal, legacy upgrade, expired rejection, cleanup, owner-issued one-time recovery, revocation and logout.');
