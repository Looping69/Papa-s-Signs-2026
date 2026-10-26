# Admin password access

## Intent
Require a real password before the admin dashboard, private configuration, uploads, media inventory, or configuration changes can be accessed. Preserve the existing public website, images, quote behavior, and all unsaved/uncommitted project work.

## Recommended approach
Use a small server-side password/session layer in the existing Express app. A frontend-only password check would leave the APIs unprotected. Adding an external identity service or multi-user accounts is unnecessary for the requested single-admin local app.

## Password setup and storage
The operator chooses and confirms a password privately in the local setup screen, not in chat. Setup is available only while no credentials exist and only under the existing strict loopback/same-origin boundary. Use a minimum 14-character password, bounded input, fresh random salt, Node scrypt, and timing-safe verification. Persist only the salted hash and its version in a Git-ignored private local file, never a plaintext password. Reject malformed existing credential files rather than opening setup again. Prevent simultaneous setup from overwriting credentials. Block the credential directory from every Vite filesystem-serving path.

## Sessions and enforcement
Issue a cryptographically random opaque session cookie, HttpOnly and SameSite=Strict, with an eight-hour maximum lifetime; Secure under HTTPS. Store only session-token hashes server-side, rotate on login, revoke on logout, expire on server restart, and bound the session store. Apply bounded failed-login throttling before expensive password verification, with generic rejection messages. Retain local-only management restrictions; no proxy trust or public deployment is enabled by this change.

Enforce authentication on the server for private admin configuration reads, configuration writes, uploads, and media inventory. Public configuration must contain only what the website needs, not private rate rules. The admin route renders setup/login until authenticated, offers logout, and returns to login if the session expires. Unsaved edits must not silently disappear on a failed API request; show session-expiry feedback.

## Recovery and limits
No email reset, multi-user roles, or remote access is introduced. Document local password reset/recovery as an explicit operator action; do not create an unauthenticated reset endpoint. Do not commit, publish, or display credentials.

## Verification
Test setup single-use/concurrency, wrong and correct passwords, rate limiting, cookie attributes, logout, session expiry, restart invalidation, and unauthenticated access to every management endpoint. Verify public pages still load, secret files cannot be fetched through normal or Vite filesystem routes, and the admin initially displays the password setup/login screen. Run all regression tests, TypeScript and build.

## Approval
Approved by the user on 26 October 2026. Real password selection remains a private operator action in the local setup screen, not an agent-created credential.
