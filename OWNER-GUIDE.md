# Your Hearth app: a practical owner’s guide

Updated 31 October 2026. No coding experience is needed to follow this guide.

## My recommendation

Use Hearth as a **phone web app with a shared online database**. Keep the existing address while your family tries it. A custom domain is optional, and there is no need to buy a server or pay app-store fees to use this version.

Your app: https://hearth-family-ledger.ceramdent.chatgpt.site

The app was built with AI assistance. It does not call a paid AI service when you record expenses, and it does not send your family’s spending to an AI provider.

## What each part does

| Part | Plain-language meaning | Your app |
| --- | --- | --- |
| The web app | The screens and buttons you use | Hearth |
| Hosting | The service that keeps the app available while your computer is off | Currently supplied through Sites |
| Database | The private shared record of accounts and expenses | Cloudflare D1, attached to the hosted app |
| Domain | The address people type or share | You already have a hosted address; a purchased name is optional |
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

**Android:** Open the address in Chrome → ⋮ menu → Install app or Add to Home screen. If Hearth offers an install button, you can use it. Browser wording varies. [Web-app installation guide](https://web.dev/learn/pwa/installation/).

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

## Costs and the cheapest sensible path

| Option | Cost position | Recommendation |
| --- | --- | --- |
| Keep the current Sites address | Already hosted; no separate domain or server has been purchased. Account-specific Sites quotas/billing have not been verified here. | Use this for the family trial. Do not buy another service just to get started. |
| Your own Cloudflare deployment | A free tier exists. Workers currently includes 100,000 requests/day with a 10 ms CPU limit per request. D1 has free usage/storage allowances. | A possible low-cost independent home, after testing the actual app against its limits. |
| Cloudflare Workers Paid | Starts with a $5/month subscription, plus usage above included allowances and applicable taxes. | A fallback if free-plan limits are too restrictive; this is not a guaranteed maximum bill. |
| GitHub personal Free | Public/private repositories are available on the free plan. | Enough to share source and accept contributions. |
| Custom domain | Optional recurring registrar charge. | Buy later only if you want a memorable name. |
| Native App Store / Play Store app | Adds separate release, review and maintenance work. | Not needed for this phone web app. |

Pricing checked on 31 October 2026: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [GitHub plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans).

The free Workers CPU limit is separate from traffic volume. Rendering and password processing must be measured before promising a free independent deployment. A home-screen icon does not remove the need for online hosting if multiple phones share records. Your current hosting is not automatically covered by the prices of a separate personal Cloudflare account.

## Monthly routine and backups

1. Have each member open Hearth and check that no expenses are waiting to sync.
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

Create your real family, install the icon on two phones, and each record one small expense. Check that both phones show the same two expenses. Then try one monthly export. That is the clearest way to build confidence before inviting more families or publishing the source.
