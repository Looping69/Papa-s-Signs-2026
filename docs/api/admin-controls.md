# Local admin and provisional quote API contract

Management routes require an admin password session, remain local-only, and reject cross-origin writes. See admin-access.md for setup and recovery. Do not expose the local development server via a reverse proxy as a remote staff service.

- `GET /api/media`: `{ assets: MediaAsset[] }`, where assets contain `src`, `title`, `category`, `source` (`portfolio` or `upload`), and `mediaType`. Only known public directories are listed; JPG originals supersede same-basename WebP backups. No absolute filesystem paths. Failure: 500, no partial success.
- `GET /api/config`: site configuration, with absent optional fields defaulted. No secrets. `POST /api/config`: full validated configuration, atomic persistence, `{success:true}`; invalid pricing/media: 400; non-local or cross-origin management request: 403. No file deletion.
- `POST /api/upload`: multipart image field, supported raster image/video, maximum 20 MiB, returns `{url}`; 400 for rejected files. Upload remains independently discoverable without saving a site slot.
- `GET /api/quote/settings`: `{enabled, services:[{id,title,basis,packageQuantity,requiredDetails}]}` for enabled pricing rows; rates/messages not exposed here. Missing config defaults to disabled.
- `POST /api/quote/estimate`: `{serviceId,quantity,width?,height?,material?,details?}`; dimensions in metres; quantity positive whole units, maximum 10000; width/height at most 100m. Extra client price/approval fields are ignored. Returns `{status,message,disclaimer,...}`: `estimate` adds ZAR `amount`, `currency`, `requiresStaffApproval:true`, `serviceTitle`, `basis`, `quantity`; `needs_details` adds `missing`; `handoff` never includes a price. Disabled returns 503 with `status:disabled`; malformed data 400; throttling 429. No automated staff notification or binding approval occurs.

Rates are ZAR per item, per square metre, or per package. Package counts round up. Minimum charge applies once per estimate. Unknown tax/design/installation/delivery charges are not calculated; staff must confirm inclusions.

Material-specific rules accept an admin-maintained `allowedMaterials` list. A supplied material outside that list goes to staff without a price; custom requirements always go to staff. The editable failure message is used for customer-side connection failures. Existing open tabs refresh published visibility on focus or within 15 seconds; server disablement applies immediately after save.

## Password/session contract (supersedes unauthenticated management behavior)
- `GET /api/admin/session`: local-only, `{authenticated,setupRequired}`; 503 on corrupt or unreadable credential storage, never falls back to setup in that case.
- `POST /api/admin/setup`: local-only JSON `{password,confirmPassword}`, 14+ characters and at most 256 UTF-8 bytes. One-time creation: 201 and session cookie; invalid 400, already initialized 409, locked 429, storage failure 503. No secret returned.
- `POST /api/admin/login`: local-only JSON `{password}`. Success 200 and new session cookie, invalid 401, throttled 429; no password logging. Five unsuccessful attempts cause a 15-minute lock window.
- `POST /api/admin/logout`: local-only, revokes current token, clears cookie, 200. No anonymous reset operation exists.
- Session cookie: HttpOnly, SameSite=Strict, Path=/api, eight-hour maximum, Secure for direct HTTPS. Sessions are server-memory records with hashed tokens and expire on restart.
- `GET /api/admin/config` is the authenticated full configuration read. Public `/api/config` removes private pricing rules and internal admin response settings, retaining only the public failure copy and enabled flag.
- `POST /api/config`, `GET /api/media`, and `POST /api/upload` now require a valid session (401 without one) in addition to local/same-origin checks. Frontend guards are not the enforcement boundary.
- Credential storage, raw configuration files and encoded/Vite filesystem variants are blocked from direct HTTP access. These protections do not enable remote management or replace HTTPS for a future deployed service.
