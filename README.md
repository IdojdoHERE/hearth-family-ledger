# Family Ledger

[Free-hosted app](https://hearth-family-ledger.aidjahja008.workers.dev) · [Issues](https://github.com/IdojdoHERE/hearth-family-ledger/issues) · [Owner guide](OWNER-GUIDE.md)

**A little clarity. A lot more together.**

A phone-first family expense register with separate household spaces, personal sign-ins, monthly spending summaries, and shared savings goals. EUR is the default; each family selects its currency at registration.

The live app runs on the owner’s Cloudflare Workers Free plan with D1. The previous Sites app remains at https://hearth-family-ledger.ceramdent.chatgpt.site. These deployments have separate databases: existing accounts and records are not automatically transferred.

## Included

- Family registration with name, unique login name and household size
- Individual usernames/passwords and expiring single-use invitations
- Server-enforced family isolation and admin/member permissions
- Expense descriptions, categories, dates, editing and deletion
- Monthly totals, prior-month comparison, category/member breakdowns
- Monthly family budget, shared savings goals, monthly CSV and all-month JSON export
- Fast amount/category capture, optional notes, recent-expense shortcuts, phone bottom navigation
- Home-screen installation (PWA) and account-scoped pending expenses during connection loss
- Idempotent retry protection and single-use password recovery codes
- Responsive interface and interactive demonstration data

Demo changes are temporary. Real family accounts store records in Cloudflare D1 across devices. The public demo contains fictional sample information only.

## Run locally

Requires Node.js 22.13+ (Node 24 recommended) and npm.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_high_silhouette.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_first_slipstream.sql
npm run dev
```

Open the Local URL printed by the development server. Apply each additional pending migration in order; do not replay migrations. Use `npm run start` to preview the built Worker at http://127.0.0.1:8787.

## Verification

```sh
npx tsc --noEmit
npm run build
# Start the built local preview in another terminal first:
node tests/integration.mjs
node tests/expense-input.mjs
```

Integration tests create fictional households in the local database. They check authentication, role permissions, cross-family access, invitation reuse, input validation, CSRF, monthly totals, savings, password rotation and logout. Never run them against a real database. The test refuses non-loopback URLs. Repeated runs may hit the authentication rate limit; wait 15 minutes or use a fresh disposable database.

## Deploy

This application uses Vinext/React and runs as a Cloudflare Worker with D1. It cannot be hosted as a static GitHub Pages site because authentication and records require the server.

With the Sites plugin, create your own Site, set its returned project ID in `.openai/hosting.json`, retain `"d1": "DB"`, and use the Sites build/source/publish workflow. Do not reuse another deployment's project ID. New deployments need a separate database. The public source package intentionally omits the original Site identity.

For independent Cloudflare hosting, use a Cloudflare Free account and the included setup helper. No purchased domain is needed; Cloudflare provides a workers.dev address. Free-tier CPU, request, and database quotas apply. This app must be verified on your actual account before treating the free plan as a guaranteed fit.

```sh
npx wrangler login
npx wrangler d1 create hearth-family-ledger
npm run build
# Copy the database ID returned by the previous command:
npm run cloudflare:configure -- --database-id YOUR_DATABASE_ID
npm run cloudflare:migrate
npm run cloudflare:deploy
```

The helper writes an ignored deployment config next to the built Worker, preserving its module and asset paths. Supply `--account-id YOUR_ACCOUNT_ID` when selecting among multiple accounts. Never commit credentials. Re-run configuration after every build because build output is disposable. A new deployment creates a separate empty database; it does not transfer records or accounts from another hosting provider. Keep the old app available until any migration has been planned and verified.

The family/password sign-in is implemented in `app/api/household/route.ts`; it does not require every family to have a ChatGPT account. Public Site access must be enabled for visitors to reach it anonymously.

## First-release limits

No bank connection or real money transfer. Savings record manually set-aside amounts. No full account deletion, recurring expenses, receipt uploads, automatic backup restore, or cold-start offline capture yet. Recovery requires generating a code beforehand. Without a saved code, forgotten-password recovery is unavailable. The budget is a single family setting applied across months. Currency is fixed after registration to avoid reinterpreting stored amounts. Read SECURITY.md before production operation.

## Contribute

See CONTRIBUTING.md and SECURITY.md. MIT licensed; vendored tools retain their own licenses. Pull requests, translations and thoughtful feature proposals are welcome.

## Mobile and connection behavior

New visitors see sign-in choices; sample data is opt-in. Home-screen launch opens quick entry for an authenticated account. Amount input accepts a decimal point or comma, category buttons are large, notes are optional, and the date/member default automatically.

New expenses are persisted to localStorage under the current member ID before sending. The server validates `expectedMember`, and a stable client-generated ID makes retries idempotent. A confirmed save removes the local pending entry. The app syncs pending entries when mounted under the original account or when network connectivity returns; a manual retry is available. Browser storage is not encrypted and can be read by someone with access to the browser profile. Do not clear site data before syncing. The app must already be loaded and signed in to capture during connection loss. Cold offline startup shows a clear fallback page and requires internet to reopen the ledger.

The service worker caches only a public offline page and icon, never family API responses or authenticated records. Test family records remain local and are excluded from deployment.

## Recovery

In Family settings, generate a recovery code after confirming your password. Save it privately. Only its SHA-256 hash is stored on the server. A new code replaces the previous code. A reset consumes the code atomically, invalidates existing sessions, and asks the member to sign in again. Generating a code is offered after registration, and existing users can do it in Family settings.

No runtime AI service is used. The app was developed with AI assistance; family expense data is not sent to an AI provider. Source: https://github.com/IdojdoHERE/hearth-family-ledger. See OWNER-GUIDE.md for the nontechnical overview.

## Optional continuous integration

An example GitHub Actions workflow is in `docs/github-actions-example.yml`. Repository maintainers can enable it under `.github/workflows/` when their publishing credentials include workflow permissions. The test commands above also run locally without any GitHub secrets.

## Languages (v1.1.0)

English and Albanian (Shqip) are included. The header and welcome page offer a language selector; the choice is stored on the device. Interface translations live in `lib/i18n.ts`. Stored category identifiers remain stable in English; labels are translated for display. Member names and expense notes are never automatically translated. Albanian date labels and European number formatting also work in browsers without Albanian Intl locale data. Run `node tests/i18n.mjs` to verify translations and formatting.

The displayed app name is Family Ledger. The existing Worker name, repository URL, session cookie, queue keys and PWA identity are retained so existing users continue using the same app and data. See [OWNER-GUIDE.md](OWNER-GUIDE.md) for the hosting, domain and free-plan explanation.

## Persistent sign-in (v1.2.0)

Sessions no longer have a seven-day server expiry. `sessions.expires=0` means valid until explicit revocation. Valid legacy sessions upgrade on use; expired sessions are never revived. HttpOnly, SameSite=Lax cookies use a 400-day Max-Age and renew on successful authenticated requests. Sign-out, password changes and password recovery still revoke sessions. Browser cookie eviction and site-data clearing can still require sign-in.

Run `node tests/session-persistence.mjs` against the isolated local `.wrangler/recovery-qa` preview to test renewal, legacy upgrade, expired rejection, recovery and revocation. The operator-only `scripts/owner-recovery.mjs` requires Cloudflare access and writes one-time recovery instructions outside the repository; it provides no public authentication bypass.
