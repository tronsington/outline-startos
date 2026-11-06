export const SERVER_PORT = 3000

export const POSTGRES_PATH = '/var/lib/postgresql'
export const POSTGRES_DB = 'outline'
export const POSTGRES_USER = 'postgres'
export const REDIS_PORT = 6379
// Outline's own Dockerfile declares this path as the attachment volume
// (FILE_STORAGE_LOCAL_ROOT_DIR) and chowns it to uid 1001; the chown-outline
// oneshot re-applies that on the StartOS-mounted volume (mount shadows the
// image's baked-in ownership).
export const STORAGE_PATH = '/var/lib/outline/data'

// Upstream runs DB migrations as a separate step (`yarn db:migrate` ===
// `sequelize db:migrate`), deliberately not on every start. Probed in the
// pinned image 2026-10-17: no yarn binary, but node_modules/.bin/sequelize
// exists and .sequelizerc resolves the config relative to workdir
// /opt/outline (set via exec.cwd). Verified:
//   docker run --rm ... sh -c 'which yarn' -> nothing; .bin/sequelize present
export const DB_MIGRATE_CMD: [string, ...string[]] = [
  'node',
  'node_modules/.bin/sequelize',
  'db:migrate',
  // 1.11.0:2 — upstream's server/config/database.js enables TLS under the
  // `production` config block, and the sidecar is plain TCP. `--env` picks the
  // TLS-free sibling config for the CLI *without* touching NODE_ENV, which
  // Outline validates against development/production/staging/test and child
  // migration scripts inherit.
  '--env',
  'production-ssl-disabled',
]
export const OUTLINE_WORKDIR = '/opt/outline'
