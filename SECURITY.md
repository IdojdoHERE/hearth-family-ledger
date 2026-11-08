# Security

Do not include real household information, passwords, invitation links, or session cookies in public issues. Report suspected vulnerabilities privately to the repository maintainer through GitHub's private vulnerability reporting when available; otherwise ask the maintainer for a private channel without disclosing exploit details.

## Current model
- Family IDs are derived from server-side sessions, never accepted as authorization from clients.
- Users see only their family's data; members edit their own expenses and admins can edit family expenses.
- Passwords use PBKDF2-SHA256, 100,000 iterations, and per-user random salts (the current Workers runtime ceiling). Passwords require 12–128 characters. Consider a stronger supported password KDF as deployment options evolve.
- Random session and invitation tokens are stored only as SHA-256 digests. Sessions have no scheduled server expiry (`expires=0`) and are revoked on sign-out, password change or recovery. Persistent cookies last up to 400 days and renew on successful authenticated requests; browser storage rules can still require sign-in. Active legacy sessions upgrade on use; already expired sessions stay invalid. Cookies are HttpOnly, SameSite=Lax and Secure on HTTPS.
- One-use invitations expire after 48 hours. An atomic D1 transaction claims invitations.
- State-changing requests require a matching Origin and JSON content type.
- Authentication attempts are rate-limited per platform-supplied client IP to 20 per 15 minutes. Direct self-hosted deployments must trust only platform-provided client IP headers. This is basic abuse protection, not a comprehensive edge WAF.
- Amounts use integer minor units; SQL parameters are bound.

This first release has automated boundary tests, not an independent security audit. Account deletion, MFA, operational backups/restore tooling, and audit logging remain future work. Goal contributions currently update a total and do not include a reversible contribution history. Operators can access the underlying database. Public deployments should supply operator contact information and any required local policies before broad promotion.

## Mobile release additions
- A 256-bit random recovery code is stored only as a SHA-256 digest. Code generation checks the current password and is rate-limited. Password recovery is rate-limited, uses a transactional single-use claim, and invalidates active sessions.
- New expense retries use a stable random identifier. Existing IDs must match owner, family and payload; concurrent duplicates are inserted only once. An expected-member check prevents a pending entry from being posted into another signed-in account.
- Pending records are stored unencrypted in localStorage per member until acknowledged. Family API responses are never cached by the service worker. Device access can expose pending records. Clearing browser data can destroy unsent expenses.
- All-month exports contain household records but no password hashes, recovery hashes or sessions. Users must protect exported files. There is no automatic import/restore path.
