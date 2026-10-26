<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Papa's Signs

React/Vite website with an Express content-management backend, reusable media library, password-protected local administration, and server-calculated provisional quotes.

## Run locally

1. Install dependencies: `npm ci`.
2. Start the app: `npm run dev` (default port 3000; set `PORT` to override).
3. Open `/#/admin` on localhost and privately create the admin password on first use.

No Gemini API key is needed for the guided quote assistant. Only staff-configured prices are used, and every estimate requires staff confirmation.

## Verify and run the production build

```sh
npm test
npm run lint
npm run build
npm start
```

`npm start` serves the built site through Express without the Vite development server. Build before starting. The host must run the Node backend; publishing dist/ alone breaks configuration, media and quote APIs.

## State and deployment boundaries

The Git repository contains application source and original portfolio images, not runtime passwords or settings. `config.json` is generated from safe defaults when absent. Back up and retain it privately if you need to carry configured content/pricing to another server. New environments start with no pricing rules; configure and enable estimates deliberately.

Settings (`config.json`), uploaded files (`public/uploads/`), and password hashes (`.private/admin-auth.local`) currently use local writable storage. A durable deployment needs persistent storage and backups for these paths. Admin sessions and failed-login limits are process-local; a single server is assumed. Static hosting or ephemeral/serverless filesystems are not a complete deployment of this app.

Administration intentionally remains restricted to loopback access. A public reverse proxy must not be used to bypass that guard. Remote admin access, HTTPS/proxy trust and storage must be explicitly designed for the selected host before claiming production readiness. Do not publish a development server or copy a local password hash into Git.

See [admin access and recovery](docs/admin-access.md) and [API contracts](docs/api/admin-controls.md). No deployment provider, domain, or automatic deployment workflow is configured in this repository.
