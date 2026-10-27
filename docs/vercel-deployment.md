# Papa's Signs Vercel deployment

Target: `loop69/papas-signs-2026`. The connected deployment repository is `Looping69/Papa-s-Signs-2026`, not the upstream `WimpyvL` repository. Deploy verified source explicitly; merging upstream alone does not update production.

## Runtime and persistence

Vite builds public assets to `dist`; `api/index.ts` exports the Express cloud API. `vercel.json` routes `/api/*` to that function. The local `server.ts` continues to use local files and loopback-only maintenance, unchanged.

Cloud settings, password hashes, opaque-session hashes and rate-limit counters live in the dedicated Neon database. Uploads use the dedicated public `papas-signs-media` Blob store. Credentials and private rates must never be uploaded to Blob. The original 102 portfolio photos remain deployed static assets. New uploads are discoverable before assignment to any page.

Only the API uses `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`; neither has a client-visible prefix. Use `DATABASE_URL_UNPOOLED` for `migrations/001-cloud.sql`. Connections verify server TLS certificates. Do not print env files or commit `.private`, `.env*`, `.vercel` or runtime `config.json`.

## Initial content and private administrator setup

Run `vercel env pull .env.cloud.local --yes --scope loop69` locally, then:

```sh
node --env-file=.env.cloud.local --import tsx scripts/initialize-cloud.ts
```

Initialization is transactional and idempotent. It seeds the current local configuration only if cloud settings do not exist, and never resets a password. On first initialization it generates a cryptographic setup code, saves only its SHA-256 digest in the database, and creates `.private/cloud-admin-setup.html` locally. Keep that file private. The link puts the code in the browser fragment, which is not sent in HTTP URLs; the admin UI immediately removes it from the address bar. The code expires after 72 hours and is atomically consumed by password creation. No public first-visitor setup, default password, anonymous reset endpoint, or password stored in Git.

Open the private local file to create your own password of at least 14 characters. The server uses scrypt with a random salt. Authentication uses Secure, HttpOnly, SameSite=Strict cookies, eight-hour database-backed sessions, revocation on logout, and database-backed login limits. Management writes must have the exact approved HTTPS origin. The function trusts client-IP headers only at the Vercel edge; do not expose the cloud handler behind an arbitrary self-hosted proxy.

If the setup code expires, an operator with database authority must explicitly issue a new code. Recovery never opens public registration. Back up private configuration before editing or recovery. Do not email passwords or paste them into chat.

## Contracts

Existing API contracts in `docs/api/admin-controls.md` remain valid for local mode. Cloud differences:

- Session response includes `mode:cloud`, `setupKeyRequired`; setup additionally requires `setupKey`.
- Admin configuration includes `_revision`. A complete save requires that revision and returns a new `revision`. Stale saves return 409 without replacing newer settings.
- `/api/media/upload-mode` returns `provider:blob` for authenticated cloud users. `/api/upload` signs restricted, short-lived client upload tokens rather than accepting a multipart body. Supported raster/video uploads retain the 20 MiB cap; SVG and arbitrary files are excluded. Blob verifies completion callbacks. Tokens cannot overwrite existing media.
- Public configuration omits rates, internal responses, revisions and credentials. Server estimates still require staff approval; no binding quote or automatic staff approval is created.
- Infrastructure failure returns a generic 503 rather than secrets, a reset opportunity, or a false success.

## Verification and release

```sh
npm test
npm run lint
npm run build
npm run test:cloud-runtime
```

Real database integration test uses the isolated `papas_cloud_test` schema, not production configuration or real administrator credentials. In PowerShell set `$env:PAPAS_CLOUD_TEST='1'`, then run:

```sh
node --env-file=.env.cloud.local --import tsx --test tests/cloud-api.test.ts
```

It checks guarded setup, concurrent setup, durable sessions across app instances, save persistence, stale-save rejection, cross-origin denial, staff-required calculations, login throttling and logout. It clears only its own test tables. The ordinary suite skips this opt-in test.

Stage production with `vercel deploy --prod --skip-domain --scope loop69 --yes`; check actual API JSON, static assets, unauthorized denials and admin UI before promoting that exact deployment. Keep deployment protection enabled. Rollback switches code/domain assignment only; it does not roll back database edits or uploaded media.
