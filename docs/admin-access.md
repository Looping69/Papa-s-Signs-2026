# Admin password access

Open http://localhost:3001/#/admin on this computer. On the first visit, choose and confirm a password of at least 14 characters. A password manager or a long unique passphrase is recommended. Do not put the password in chat, source code, or config.json.

Setup signs you in. Subsequent visits require the password unless the browser has a valid session. Use Log out in the admin sidebar when finished. Sessions expire after eight hours and every server restart. Five unsuccessful login attempts block further attempts for up to 15 minutes.

The server stores only a versioned salted scrypt hash in `.private/admin-auth.local`. The private directory and local credential files are Git-ignored and blocked from Vite/static serving. Session tokens are random, stored only as hashes on the server, and transmitted in an HttpOnly strict same-site cookie. No password is bundled into the public application.

Public visitors can still read the website. They cannot read private quote rules, list the admin media inventory, change settings, or upload without a valid admin session. Site images themselves remain public by design.

## Session expiry and edits
If your session expires during editing, sign in again in the same tab; the mounted editor keeps its unsaved draft in memory. Refreshing/closing the tab or confirming logout discards unsaved edits. Do not treat a failed save as published.

## Local recovery (operator action only)
There is deliberately no unauthenticated password-reset endpoint. If the password is lost, the machine operator must stop the Papa's Signs server, move the exact `.private/admin-auth.local` file to a safe private backup outside the served workspace, then restart and immediately complete local setup again. Keep the backup private; never move it to public/ or commit it. This invalidates sessions and allows a new password to be chosen. Ask for help if unsure of the exact file or server process; do not delete unrelated data.

Corrupt credential storage blocks login/setup rather than silently resetting access. Restore the correct credential backup or use the explicit recovery procedure. Windows filesystem confidentiality relies on the operator's OS account/ACLs; the application does not change Windows security settings.

## Deployment boundary
Administration remains restricted to loopback hosts, without proxy-header trust. This is a single-admin local app, not a public multi-user identity service. Do not tunnel or reverse-proxy it into a remote admin service without a separately reviewed HTTPS/authentication/deployment design.
