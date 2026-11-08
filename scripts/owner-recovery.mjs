// Operator-only: requires the owner's existing authenticated Cloudflare CLI.
// No web endpoint, stored password disclosure, or plaintext secret in command arguments.
import {spawnSync} from 'node:child_process';
import {randomBytes,createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const args=process.argv.slice(2),value=flag=>{const i=args.indexOf(flag);return i<0?undefined:args[i+1];};
const family=value('--family'),username=value('--username'),output=value('--output');
if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(family||'')||!/^[a-z0-9_.-]{2,40}$/.test(username||'')||!output)throw Error('Supply --family <family-login> --username <username> --output <private-file-outside-repository>');
const root=process.cwd(),destination=path.resolve(output);
if(destination===root||destination.startsWith(root+path.sep))throw Error('Keep recovery secrets outside the source repository.');
if(fs.existsSync(destination))throw Error('Output exists; choose a new private filename.');
const local=args.includes('--local');
function query(sql){
 const r=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB',...(local?['--local','--persist-to','.wrangler/recovery-qa']:['--remote']),'--config',local?'dist/server/wrangler.json':'dist/server/wrangler.deploy.json','--command',sql,'--json'],{encoding:'utf8'});
 if(r.status!==0)throw Error('Cloudflare query failed: '+r.stderr);
 const parsed=JSON.parse(r.stdout);if(parsed.some(x=>!x.success))throw Error('Cloudflare query did not succeed.');return parsed[0].results;
}
const matches=query(`SELECT m.id,m.name,f.name AS familyName FROM members m JOIN families f ON f.id=m.family WHERE f.slug='${family}' AND m.username='${username}'`);
if(matches.length!==1)throw Error('No unique matching member. Nothing was changed.');
const member=matches[0];if(!/^[a-f0-9-]{36}$/.test(member.id))throw Error('Unexpected member identifier. Nothing changed.');
const code=randomBytes(32).toString('hex'),digest=createHash('sha256').update(code).digest('hex');
fs.mkdirSync(path.dirname(destination),{recursive:true});
const guide=`PRIVATE — Family Ledger account recovery\n\nFamily: ${member.familyName}\nPerson: ${member.name}\nFamily login name / Emri i familjes për kyçje: ${family}\nUsername / Emri i përdoruesit: ${username}\n\nOne-time recovery code / Kodi i rikuperimit:\n${code}\n\n1. Open https://hearth-family-ledger.aidjahja008.workers.dev\n2. Choose Sign in / Kyçu.\n3. Choose Forgot password? Use my recovery code / Harruat fjalëkalimin? Përdorni kodin e rikuperimit.\n4. Enter the family login name, username and recovery code above.\n5. Choose your own NEW password (12–128 characters) and submit.\n6. Sign in with that new password. Generate and save a fresh recovery code in account help.\n\nThe previous password cannot be extracted. Resetting keeps the existing account and expenses, and signs out that person's other sessions. This recovery code works once and replaces any earlier recovery code. Share this file only with the named person. Do not publish it on GitHub or in a group chat.\n\nKy kod përdoret vetëm një herë. Mbajeni privat dhe dërgojani vetëm personit të shënuar. Pas rivendosjes, ruani një kod të ri rikuperimi.\n`;
// Write privately before issuing so an interrupted request never loses the only copy.
fs.writeFileSync(destination,'ISSUANCE NOT YET CONFIRMED\n\n'+guide,{mode:0o600,flag:'wx'});
const updated=query(`UPDATE members SET recovery='${digest}' WHERE id='${member.id}' RETURNING id`);
if(updated.length!==1)throw Error('Issuance not confirmed. Keep the private file and check Cloudflare before retrying.');
fs.writeFileSync(destination,guide,{mode:0o600});
console.log('Issued one-time recovery for '+family+' / '+username+'. Private file: '+destination);
