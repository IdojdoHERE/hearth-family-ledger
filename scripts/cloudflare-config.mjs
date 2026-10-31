import fs from 'node:fs';
const args=process.argv.slice(2);const value=(flag)=>{const i=args.indexOf(flag);return i<0?undefined:args[i+1];};
const databaseId=value('--database-id')||process.env.HEARTH_DATABASE_ID;
const accountId=value('--account-id')||process.env.CLOUDFLARE_ACCOUNT_ID;
if(!/^[a-f0-9-]{36}$/.test(databaseId||''))throw Error('Supply the database ID returned by Cloudflare: --database-id <ID>');
if(accountId&&!/^[a-f0-9]{32}$/.test(accountId))throw Error('Invalid Cloudflare account ID.');
const file='dist/server/wrangler.json';
if(!fs.existsSync(file))throw Error('Run npm run build first.');
const generated=JSON.parse(fs.readFileSync(file,'utf8'));
const config={...generated,name:'hearth-family-ledger',...(accountId?{account_id:accountId}:{}),workers_dev:true,preview_urls:false,d1_databases:[{binding:'DB',database_name:'hearth-family-ledger',database_id:databaseId,migrations_dir:'../../drizzle'}]};
// This file stays beside the generated entrypoint so all asset/module paths remain correct.
fs.writeFileSync('dist/server/wrangler.deploy.json',JSON.stringify(config,null,2)+'\n');
console.log('Prepared dist/server/wrangler.deploy.json for your own Cloudflare account.');
