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
