// End-to-end check of the operator CLI using only disposable local accounts.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,statSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const base='http://127.0.0.1:8787',slug='owner-cli-'+crypto.randomUUID().slice(0,8),password='Local-owner-pass-8274';
const localSql=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--persist-to','.wrangler/recovery-qa','--config','dist/server/wrangler.json','--command','DELETE FROM attempts'],{encoding:'utf8'});assert.equal(localSql.status,0);
async function post(body,status=200){const r=await fetch(base+'/api/household',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify(body)});assert.equal(r.status,status,await r.clone().text());return r;}
await post({action:'register',familyName:'Operator CLI QA',slug,size:2,currency:'EUR',name:'Test Owner',username:'tester',password});
const folder=mkdtempSync(path.join(tmpdir(),'family-recovery-qa-')),file=path.join(folder,'private.txt');
try{
 const r=spawnSync(process.execPath,['scripts/owner-recovery.mjs','--local','--family',slug,'--username','tester','--output',file],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(statSync(file).mode&0o777,0o600);
 const code=readFileSync(file,'utf8').match(/\n([a-f0-9]{64})\n/)[1];assert.ok(!r.stdout.includes(code));assert.ok(!r.stderr.includes(code));
 await post({action:'recover',slug,username:'tester',code,password:password+'new'});
 await post({action:'recover',slug,username:'tester',code,password:password+'new'},401);
 await post({action:'login',slug,username:'tester',password:password+'new'});
 const denied=spawnSync(process.execPath,['scripts/owner-recovery.mjs','--local','--family',slug,'--username','tester','--output',path.join(process.cwd(),'private-secret.txt')],{encoding:'utf8'});assert.notEqual(denied.status,0);
 console.log('PASS: owner CLI private output permissions, no secret logging, recovery redemption, one-time use and repository-file protection.');
}finally{rmSync(folder,{recursive:true,force:true});}
