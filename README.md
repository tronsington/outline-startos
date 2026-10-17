# outline-startos

A [StartOS](https://start9.com) service package for
[Outline](https://www.getoutline.com) (`outlinewiki/outline`) — the open-source
team knowledge base and wiki.

```bash
git clone https://github.com/tronsington/outline-startos
cd outline-startos
npm ci
make x86        # outline_x86_64.s9pk
make arm        # outline_aarch64.s9pk (upstream publishes both)
```

## What this package is

|              |                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------- |
| Upstream pin | `outlinewiki/outline@sha256:08ee9ffd…` = **v1.11.0** (= `latest`, amd64+arm64, digest-pinned) |
| Sidecars     | `postgres:16@sha256:ca0bd484…`, `redis:7-alpine@sha256:858f009f…`                             |
| Interface    | one web UI + API on port 3000                                                                 |
| Secrets      | `SECRET_KEY` / `UTILS_SECRET` / `PG password` — generated at install, never re-rolled         |
| Daemons      | postgres + redis + chown oneshot + **migrate oneshot** + web server (`node build/server/…`)   |

**Outline has no built-in username/password accounts.** Sign-in goes through
an OIDC identity provider (Authentik, Keycloak, Pocket ID, Google Workspace,
…). The **Configure Sign-In** action is a critical task at install; the first
person to sign in becomes the admin.

v1 notes: S3/object storage, SMTP (magic links, invites), Slack/Google
integrations and the rest of the collab stack are not wired (envs stay unset);
storage is `FILE_STORAGE=local` on the `storage` volume.

## Repo layout

- `startos/manifest/index.ts` — pins + volumes + RAM floor
- `startos/main.ts` — sidecars + migrate oneshot + web daemon on a shared netns
- `startos/actions/setAppUrl.ts` — the `URL` chooser (critical at install)
- `startos/actions/setOidc.ts` — the OIDC provider wiring (critical at install)
- `startos/backups.ts` — pg_dump + raw volumes
- `UPDATING.md` — pin-bump procedure

## Licenses

- This package: BSL-1.1 (see `LICENSE`, licensor tronsington).
- Outline itself: (c) General Outline, Inc., BSL-1.1 with its own parameters —
  see upstream's
  [LICENSE](https://github.com/outline/outline/blob/v1.11.0/LICENSE).
