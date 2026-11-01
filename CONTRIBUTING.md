# Contributing to Family Ledger

Welcome! Family Ledger is a calm, collaborative expense register for families.

1. Fork the repository and follow README.md to run it locally.
2. Open an issue describing the problem or feature before a large change.
3. Use a focused branch; keep the interface accessible on phones and desktops.
4. Run the TypeScript check, build, and local integration test.
5. Open a pull request explaining the user-visible behavior and verification.

Every database query involving family records must derive the family ID from the authenticated server session. Never trust a family ID sent by the browser. Keep amounts in integer minor units, validate input on the server, and test attempts to access another family's records.

Never commit credentials, local databases, real household data, build output, or dependency folders. Database migrations are append-only after publication.

Helpful next contributions: account/data deletion, recurring expenses, receipt attachments, goal contribution history and corrections, internationalization, accessibility and security reviews, cold-start offline capture, and richer budgeting.

Be kind. Respect contributors' time and remember that families organize money in different ways. Avoid shaming language or rankings of family members.
