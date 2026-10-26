# Admin Password Implementation Plan

**Goal:** Password-protect all admin operations without changing public site behavior.
**Spec:** ../specs/2026-10-26-admin-password-design.md (approved).
**Architecture:** Existing local-management guard plus Node crypto scrypt and opaque server sessions; no external auth provider or new dependency. Native execution in this workspace, preserving uncommitted work; no commits or deployment.

- [x] Write failing real HTTP tests for setup, concurrent single-use initialization, login, protected endpoints, cookie flags, logout, expiry, throttling, corrupt credentials, and restart invalidation.
- [x] Implement `createAdminAuth` in server/adminAuth.ts. Store versioned salted hash with exclusive creation; bound session and login-attempt maps. Authentication required middleware defaults fail closed. Routes: GET /api/admin/session, POST /api/admin/setup, /login, /logout.
- [x] Wire auth into config writes, uploads, media, and new private GET /api/admin/config. Public GET /api/config returns only public website fields and failure response copy, never private rate rules. Block direct Vite access to private directory, config JSON, and backup names. Git-ignore private credentials.
- [x] Add AdminAccess boundary with private setup/login, expiry warning, and logout. Preserve drafts on expired-session responses; successful reauthentication resumes the mounted editor. Switch dashboard reads to private endpoint.
- [x] Run the entire test suite, TypeScript and build. Restart local server, verify public pages and denied admin APIs/secret paths; inspect setup screen without creating a real credential. Document recovery. User chooses their real password privately after handoff.

## Review focus
No setup reopens on corrupt credential files. Simultaneous setup cannot overwrite credentials. Never trust forwarded proxy headers. Secret paths cannot be served through Vite or URL encoding. Stale editor must not save after logout/session expiry. Cookie requires HttpOnly and strict same-site, HTTPS Secure, bounded lifetime.

## Verification and handoff
- 15 regression tests pass, including real HTTP login, session rotation/revocation, expiry, restart invalidation, throttling, concurrent setup, and corrupt storage handling. TypeScript and Vite build pass; missing index.css and the large-bundle warning remain.
- Live unauthenticated requests: private config/media 401; config writes/upload 401; public configuration and home 200. Known non-secret probe file was blocked through normal, encoded, and Vite filesystem URLs, then removed. Raw config JSON also blocked.
- Browser: admin displays setup with empty private password fields; no dashboard rendered before authentication. Public home renders with no application console errors. Actual operator credential creation was intentionally left to the user; no real password was created, read, or logged by the agent.
- Session-expired editor stays mounted but hidden, and any media-picker portal is explicitly suppressed while unauthenticated. Logout discards the local draft only after confirmation.
- Independent automated review remains unavailable because CodeRabbit is not installed. No external audit or production/remote authentication deployment is claimed.
- No commits, pushes, external identity provider, or Windows security changes. The user chooses their real password privately in the local setup screen.
