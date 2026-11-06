# AGENTS.md — outline-startos

StartOS service-package repository for [Outline](https://github.com/outline/outline)
(team knowledge base / wiki), wrapping the official `outlinewiki/outline` image
(digest-pinned; README has the pin table) with postgres + redis sidecars.
**Start every task at the SDK recipe index** — same discipline as siblings.

## Design decisions not to re-litigate

- **URL comes only from the Set App Address action** (critical task at
  install). Outline builds absolute links (document shares, email actions)
  from it; do not "helpfully" default it.
- **Sign-in is OIDC-only.** Outline has no local accounts — the
  **Configure Sign-In** action is a critical task at install, and the first
  person to sign in becomes the admin. SMTP/magic links are not wired.
- **Migrations are NOT auto-run by upstream's entrypoint** — they are a
  pre-start oneshot (`db-migrate`) between postgres and the web daemon. The
  images ship **no `yarn` binary**: the oneshot runs
  `node node_modules/.bin/sequelize db:migrate` with `cwd: /opt/outline`,
  because `.sequelizerc` resolves its config/migrations relative to the
  working directory. Probe the real image before changing this.
- **FORCE_HTTPS=false is required** — upstream's default `true` 301-redirects
  everything to https and breaks the http/tor interface; StartOS terminates
  external TLS.
- **Redis has no password**, matching upstream's single-tenant compose; it is
  loopback-only inside the package's netns.
- **Storage is FILE_STORAGE=local** on the `storage` volume at upstream's path
  (`/var/lib/outline/data`). A `chown-outline` oneshot fixes ownership to
  1001:1001 (upstream's `nodejs` user) because a StartOS volume shadows the
  image's baked-in ownership.
- store.json lives on `main`, never mounted into daemons.
- Backups = pg_dump(pgdata) + raw `storage` + raw `main`. Rotating SECRET_KEY
  or UTILS_SECRET on restore invalidates sessions/tokens — never re-roll.

## Known-untested (verify on first real install)

- /\_health probe across a cold first boot with migrations (grace: 120 s).
- OIDC end-to-end against a real provider (the env names were verified against
  upstream's `.env.sample`, not against live sign-in).

## First-boot and OIDC traps (learned 2026-11-06, released as 1.11.0:2)
- **Postgres SSL.** `server/config/database.js` puts `dialectOptions.ssl` under the `production`
  config block only, and the sidecar is plain TCP, so `NODE_ENV=production` fails every connection
  with "The server does not support SSL connections". Do **not** set
  `NODE_ENV=production-ssl-disabled` — Outline derives `ENVIRONMENT` from `NODE_ENV` and only accepts
  development/production/staging/test, so the app then dies on env validation. Correct shape: keep
  `NODE_ENV=production`, put the TLS-free config on the CLI only —
  `sequelize db:migrate --env production-ssl-disabled` — and keep `PGSSLMODE=disable` for the app.
- **The migrate oneshot needs the full app env.** Several migrations spawn helper scripts
  (`build/server/scripts/*.js`) that `require('./bootstrap')` and validate SECRET_KEY, UTILS_SECRET,
  REDIS_URL and URL. With only `DATABASE_URL` they exit 1 and take the oneshot with them.
- **The app-address list must include LAN addresses.** `getOutlineAppUrls` matched only
  `domain`/`plugin`; on a LAN-only box the list was empty and the install-time critical task could
  not be resolved at all. It now also matches `ip` and `mdns`.
- **Testing migrations without credentials:** `psql -U postgres` works over the local socket in the
  package's own Postgres, so a throwaway role+database can be migrated for real:
  `CREATE ROLE migtest LOGIN PASSWORD '…' CREATEDB; CREATE DATABASE migtest OWNER migtest;` then run
  the migrate command against it. Drop both afterwards.
- **Gitea as the IdP (worked, 2026-11-06).**
  - Create the app: `POST /api/v1/user/applications/oauth2` — the documented-looking
    `/api/v1/user/applications` returns 404 on Gitea 28.
  - The confidentiality field is **`confidential_client: true`**. Sending `confidential` is silently
    ignored, the client is created *public*, Gitea then demands PKCE, and Outline's generic OIDC
    cannot do PKCE → `OAuth error during authentication: PKCE is required for public clients`.
  - Endpoints: auth `/login/oauth/authorize`, token `/login/oauth/access_token`, userinfo
    `/login/oauth/userinfo`; `usernameClaim` = `preferred_username`. Gitea's discovery doc advertises
    `sub`/`email`/`email_verified`, so claims line up.
- **Proving a real sign-in without a browser.** With a Gitea session cookie jar: `GET <app>/auth/oidc`
  → Gitea consent page → POST the hidden fields (`client_id`, `state`, `scope`, `nonce`,
  `redirect_uri`, `granted=true`) to `/login/oauth/grant` → the callback creates the user. Verify from
  the box, not the UI: log line `users.signin` with `{"name":…,"service":"oidc"}` and the row in
  `users` (first user gets `admin`).
