# Admin Controls Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. Steps are tracked below.

**Goal:** Reusable image selection and server-enforced provisional quotes controlled from admin.
**Architecture:** Existing React/Express application and JSON storage. Separate pure quote rules, filesystem media inventory, reusable library and quote settings components, and shared configuration context.
**Tech Stack:** React, TypeScript, Express, Node test runner with existing tsx.
**Spec:** ../specs/2026-10-26-admin-media-library-design.md and ../specs/2026-10-26-quote-assistant-controls-design.md

## Global Constraints
Preserve all current edits and assets; no deletion, cloud publication, binding quotes, invented rates, or provider credentials in browser bundles. Missing quote settings fail closed. New pricing rows start disabled with no approved rate. Staff review remains manual.

## Review Focus
Restart must not reset image overrides. Upload completion must not overwrite unrelated edits. Disabled assistants must reject HTTP requests. Area/package calculations must use server rates and bound quantities. Remote configuration writes must not remain unrestricted.

## Tasks
- [x] 1. Tests first: `tests/admin-controls.test.ts` covers quote calculation/gates/validation, inventory duplicate handling, image destination assignments, saved defaults. Add pure modules `shared/quote.ts`, `shared/media.ts`, `server/mediaLibrary.ts`, `shared/siteConfig.ts`. Run RED then GREEN with `node --import tsx --test tests/*.test.ts`.
- [x] 2. Server: normalized config defaults without reset, validated atomic writes, read-only `/api/media`, public `/api/quote/settings` and `/api/quote/estimate`. Local-only same-origin management endpoints; size/rate limits. Document contract in `docs/api/admin-controls.md`. Integration tests use isolated temp config and real HTTP server.
- [x] 3. React: `SiteConfigProvider`, reusable media browser with search/source/category and confirm/cancel, image-slot editor including service sub-images, quote settings editor. Wire existing replace controls and preserve unsaved draft state. Test pure assignment helpers before implementation.
- [x] 4. Replace browser-model price generation with guided specification form and server calculation, staff disclaimer/handoff, disabled route and all entry points. Remove client credential substitution. Browser-test selection, save/reload, quote settings, estimate and disabled behavior; run all tests, TypeScript, build.

## Execution ledger
Approved designs; implement in current workspace preserving the user's uncommitted edits. Do not commit or publish those edits without a separate request. Native execution selected to keep existing local dev-server work intact. No new runtime dependency is necessary. Author review plus independent final review after implementation.

## Results and rulings
- All 10 Node/HTTP regression tests pass; TypeScript and Vite build pass. Build retains the pre-existing missing index.css warning.
- Live browser checks: 102 original images, search, cancel versus apply, save persistence, new unassigned upload discovery, guided estimate, custom-requirement handoff, disabled route redirect, hidden navigation. Real restart preserved the changed image; QA data was then restored and removed.
- Ruling: guided deterministic specifications replace free-form model pricing in this phase. There is no need for model-provider access to calculate approved rates; conversational interpretation is not implemented.
- Ruling: configuration writes, media inventory, and uploads are loopback/same-origin only. This is not remote staff authentication; public proxy deployment remains out of scope and unsafe without that separate boundary.
- Responsive CSS implemented; mobile-width render verification remains unverified because the in-app viewport override left the actual document at desktop width. Desktop screenshot visually inspected for navigation, typography, spacing, asset crops, and functional controls.
- Independent review was attempted but the review tool was not installed. No independent security/correctness review conclusion is claimed.
- Deferred pre-existing issues: runtime Tailwind CDN production warning and missing index.css build reference.
- No commits or publication. Original imagery and disabled/unpriced quote settings restored after QA; generated QA upload and its temporary configuration backup removed.
