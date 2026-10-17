# Updating the upstream version

Upstream (`outline/outline`) releases as `vX.Y.Z` tags on Docker Hub
(`outlinewiki/outline`). This package pins by **digest**.

A bump is:

1. Pick the upstream release (https://github.com/outline/outline/releases).
2. Resolve the digest:
   `docker buildx imagetools inspect outlinewiki/outline:vX.Y.Z` — top-level
   `Digest:`, and confirm amd64+arm64 children are both present.
   **Check the tag's `last_updated` freshness, not just the version number** —
   a digest match proves the tag exists, not that it is current. Compare the
   tag against Hub's `latest`: if `latest` moved on, the bare tag is stale.
3. Re-read upstream's `.env.sample` and `docker-compose.yml` **at the pinned
   tag** for new or renamed env vars before touching `startos/main.ts` — the
   OIDC/DATABASE/REDIS surface drifts between majors.
4. Re-check the migration story at that tag: this package runs
   `node node_modules/.bin/sequelize db:migrate` as a pre-start oneshot from
   `/opt/outline` (upstream documents `yarn db:migrate`, and the images do not
   ship a `yarn` binary). If upstream changes the runner, update
   `DB_MIGRATE_CMD` in `startos/utils/constants.ts`.
5. Update `dockerTag` in `startos/manifest/index.ts`, the pin table in
   `README.md`, and `version` in `startos/versions/current.ts` (`X.Y.Z:0`).
6. Release notes: 5 locales.
7. Build + install on the test box. First boot after a real upgrade runs
   pending migrations through the same oneshot — watch health before
   declaring done.
