# Your Family Ledger app: a practical owner’s guide

Updated 1 November 2026. No coding experience is needed to follow this guide.

## My recommendation

Use Family Ledger as a **phone web app with a shared online database**. The new free address is ready for your family. A custom domain is optional, and there is no need to buy a server or pay app-store fees to use this version.

Your free-hosted app: https://hearth-family-ledger.aidjahja008.workers.dev

The previous app and its existing accounts/expenses remain at https://hearth-family-ledger.ceramdent.chatgpt.site. The new app has a separate database. Create a family on the new app to start there; data and passwords have not been migrated. Keep the old link and export its records before any later migration.

The app was built with AI assistance. It does not call a paid AI service when you record expenses, and it does not send your family’s spending to an AI provider.

## What each part does

| Part | Plain-language meaning | Your app |
| --- | --- | --- |
| The web app | The screens and buttons you use | Family Ledger |
| Hosting | The service that keeps the app available while your computer is off | Your personal Cloudflare Workers Free account |
| Database | The private shared record of accounts and expenses | Cloudflare D1, attached to the hosted app |
| Domain | The address people type or share | Cloudflare supplies the workers.dev address; a purchased name is optional |
| Git | A version history of the code | Helps track changes and recover an earlier source version |
| GitHub repository | An online home for the source code and contributions | Source is published on GitHub |
| PWA / phone web app | A website opened from a phone’s home-screen icon | Included in the mobile version |

Publishing source code on GitHub does **not** automatically publish the app, move the database, or expose family records. Passwords, real records, recovery codes, and private exports do not belong in the repository. GitHub Pages alone cannot run this app’s sign-in and database server.

## Start with your own family

1. Open the app and choose **Create a family space**.
2. Pick a display name and a unique family login name. The login name is shared by family members; each person has a separate username and password.
3. Choose your currency. EUR is the default. Currency stays fixed so old expenses are never silently converted.
4. Save your private recovery code when offered. You can also create one in **Family settings**. A new code replaces the old one.
5. Open **Family → Invite a member**. Send the link privately to the intended person. It works once and expires after 48 hours.
6. Set a monthly budget if useful. Zero means no budget has been set.
7. Keep the recovery code somewhere other than only on the phone, such as a trusted password manager or a safe printed copy. Anyone holding it can reset your account password.

There is no public family directory. Joining requires an invitation. Members see only their family’s records; members edit their own expenses, while the family admin can edit all family expenses.

## Put it on your phone

**iPhone:** Open the address in Safari → Share → Add to Home Screen. Enable **Open as Web App** if offered. [Apple’s instructions](https://support.apple.com/en-eg/guide/iphone/iphea86e5236/ios).

**Android:** Open the address in Chrome → ⋮ menu → Install app or Add to Home screen. If Family Ledger offers an install button, you can use it. Browser wording varies. [Web-app installation guide](https://web.dev/learn/pwa/installation/).

Each family member installs the same link and signs in using their own account. Installation is not the same as registration.

## Record an expense on the go

Tap **Add** at the bottom → enter the amount → tap a category → **Save expense**.

- Both `12.50` and `12,50` are accepted.
- Notes are optional. If you leave the note blank, the category is used as the description.
- The date defaults to today, and the expense belongs to the signed-in member.
- Expand the date row only if you need to record another day.
- Recent expenses can fill in the amount, category and note for you; review them before saving.
- The success screen offers **Done** and **Add another expense**.
- Home-screen launch can take a signed-in user directly to quick entry.

The family name is visible in the header. Real accounts start with real empty records; sample records appear only when you deliberately choose **Explore with sample data**.

## What happens without internet?

If the app is already loaded and you are signed in, a new expense is saved on that phone before it is sent. If the connection fails, it waits in a queue and the screen says so. Once online, it can sync automatically when connectivity returns, or you can tap **Sync now**. Retry protection prevents the same queued expense being counted twice.

Important practical limits:

- Opening the app from scratch and signing in require internet. An offline startup shows an explanatory page.
- Waiting expenses are stored in that browser on that device, under the original member’s account. They are not yet visible on another phone or included in the shared monthly totals.
- Sign back into the same account to sync. The app will not send one person’s waiting expense into another account.
- Do not clear browser data, uninstall, or replace the phone before the queue is empty.
- Browser storage is not an encrypted vault. Protect the phone with its normal screen lock.

A fully offline, once-a-month device merge is possible as a different product, but it adds file sharing, duplicate detection, conflicting edits, and the risk of a lost phone losing a month’s records. I recommend the shared online ledger for your family.

## English and Shqip

Choose **Language / Gjuha → Shqip** on the welcome page or in the app header. Choose **English** to switch back. Each device remembers its own choice. The interface, categories, forms, messages, dates and amounts change language; family/member names and your written notes stay exactly as entered. Your accounts, records and totals are unchanged. Browser-owned date pickers may follow the phone's own language.

## Where the online app lives

| Part | What it does | Who provides it |
| --- | --- | --- |
| Phone browser / home-screen icon | Displays Family Ledger and sends your entries securely over HTTPS. | Your phone/browser |
| Cloudflare Worker | Serves the app, checks sign-ins and permissions, and handles expenses. | Your Cloudflare account |
| Cloudflare D1 database | Stores family accounts, expenses, budgets and goals centrally, so devices share the same records. | Your Cloudflare account |
| GitHub repository | Stores the app's source code and version history for development and contributions. It does not store the live family database. | Your GitHub account |

Your laptop and this chat do not need to stay open. After an expense reaches the server, another signed-in family member can see it by reopening or refreshing their app. Unsent phone entries must sync before they appear on other devices.

## Where the address comes from

The address is **https://hearth-family-ledger.aidjahja008.workers.dev**.

- `workers.dev` is Cloudflare's domain.
- `aidjahja008` is your Cloudflare account subdomain.
- `hearth-family-ledger` identifies this deployed app.

Cloudflare supplies this address; you have not bought a domain. There is no domain renewal fee for this supplied subdomain. **Family Ledger** is now the app's displayed name. The address deliberately stays the same so current phone shortcuts, sign-ins and waiting expenses keep using the same service. A custom domain such as a separately purchased `.com` is optional and would have its own renewal cost. Availability and price would need checking before purchase.

[Cloudflare's explanation of workers.dev addresses](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/).

## Cost and how long it can keep working

The deployment is on Cloudflare's **Free ($0)** plan. This update does not enable a paid plan, purchase a domain or add a subscription. There is no trial countdown or scheduled shutdown configured in Family Ledger. Signing out or a session expiring does not stop hosting: sign in again.

It can continue running while your Cloudflare account and deployment remain active, the service remains available, and usage stays within the plan's limits. This is not a promise of free lifetime hosting: providers can change plans or terms, limits can be reached, and software needs occasional maintenance. Keep access to your GitHub and Cloudflare accounts and their recovery methods.

Current published allowances, checked 1 November 2026:

| Free resource | Allowance |
| --- | --- |
| Worker requests | 100,000 per day; static asset requests are free and unlimited |
| Worker CPU | 10 ms per invocation; this is a separate limit from traffic |
| D1 reads | 5 million database rows read per day |
| D1 writes | 100,000 database rows written per day |
| D1 storage | 5 GB total per account |

A request is not one expense: opening screens, signing in and saving can each make requests, and one operation can read/write several database rows. These are account-wide allowances shared with other apps using the same account. Daily quota exhaustion can interrupt requests until the quota resets; reaching storage limits needs space freed or a deliberate plan change. Reaching a quota does not make this app automatically subscribe you to a paid plan. Monitor usage in Cloudflare as more families join.

Sources: [Workers pricing and limits](https://developers.cloudflare.com/workers/platform/pricing/), [D1 pricing and limit behavior](https://developers.cloudflare.com/d1/platform/pricing/).

GitHub and hosting are separate. Deleting or changing source code on GitHub does not itself update the running app. This project currently uses a deliberate build/test/deploy process, rather than automatic deployment on every contribution. If Cloudflare hosting ever needs replacing, the source helps rebuild the app elsewhere; private data exports are also needed to preserve records. A JSON export is a readable backup, not an automatic restore feature.

## Monthly routine and backups

1. Have each member open Family Ledger and check that no expenses are waiting to sync.
2. Select the month. Review category totals and individual expenses together.
3. Export the monthly CSV if you want to use Excel or keep a simple report.
4. In **Family settings**, choose **Download all family records** for an all-month JSON snapshot of members, expenses and goals.
5. Keep exports in a private backup folder. Do not upload them to public GitHub issues or repositories.

The JSON export is readable structured data. It is not a one-click restore package; automated import/restore has not been implemented. Source-code backups and expense-data backups are different things.

## How GitHub will work when you are ready

The source is published at https://github.com/IdojdoHERE/hearth-family-ledger.

Your `hearth-family-ledger` repository contains source code, a setup guide, a license, tests and contribution instructions. It contains no real family records or passwords.

A **commit** records a version of the code. A **branch** is a separate line of work. A **pull request** is someone’s proposed change, which can be reviewed before being accepted. Accepting a contribution does not have to mean publishing it immediately.

The safe release sequence is: make the change → test it in a preview → review it → record the source version → deploy the tested version → verify the live app. Changes to database structure need extra care: reverting code does not automatically undo a database migration.

You can keep asking for changes in ordinary language. For example: “Add a fuel category without changing existing records,” or “Make the monthly export include the family name.” You do not have to edit source files yourself. You should understand what the proposed change does and try its important screens before a wide release.

## What this mobile version has and what remains

Included: phone navigation, quick entry, persistent unsent expenses, duplicate-save protection, personal logins, invitations, family isolation, budgets, goals, monthly breakdowns, exports and recovery codes.

Still outside this release: bank connections, receipt OCR, recurring expense automation, full account deletion, automatic backup restore, editable savings-contribution history, and cold-start offline expense entry. A recovery code must have been generated before a forgotten password can be reset.

The app has automated tests and browser checks. It has not undergone an independent security audit, so “final” means a tested release to try with your family, not a promise that software will never need fixes or maintenance.

## Your next small step

Create your real family, install the icon on two phones, and each record one small expense. Check that both phones show the same two expenses. Then try one monthly export. That is the clearest way to build confidence before inviting more families.
