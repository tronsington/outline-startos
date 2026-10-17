import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import {
  DB_MIGRATE_CMD,
  OUTLINE_WORKDIR,
  POSTGRES_DB,
  POSTGRES_PATH,
  POSTGRES_USER,
  REDIS_PORT,
  SERVER_PORT,
  STORAGE_PATH,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Outline'))

  // Mapped read: only fields that feed daemon env (relay package precedent).
  const store = await storeJson
    .read((s) => ({
      pgPassword: s.pgPassword,
      secretKey: s.secretKey,
      utilsSecret: s.utilsSecret,
      appUrl: s.appUrl,
      oidcClientId: s.oidcClientId,
      oidcClientSecret: s.oidcClientSecret,
      oidcAuthUri: s.oidcAuthUri,
      oidcTokenUri: s.oidcTokenUri,
      oidcUserinfoUri: s.oidcUserinfoUri,
      oidcLogoutUri: s.oidcLogoutUri,
      oidcDisplayName: s.oidcDisplayName,
      oidcUsernameClaim: s.oidcUsernameClaim,
    }))
    .const(effects)

  const pgPassword = store?.pgPassword ?? ''
  const appUrl = store?.appUrl ?? ''
  const dbUrl = `postgres://${POSTGRES_USER}:${pgPassword}@127.0.0.1:5432/${POSTGRES_DB}`

  // OIDC env only lands when a provider is actually configured — an empty
  // half-set would register a broken sign-in button on the login page.
  const oidcConfigured = !!store?.oidcClientId
  const oidcEnv = oidcConfigured
    ? {
        OIDC_CLIENT_ID: store!.oidcClientId!,
        OIDC_CLIENT_SECRET: store!.oidcClientSecret || '',
        OIDC_AUTH_URI: store!.oidcAuthUri || '',
        OIDC_TOKEN_URI: store!.oidcTokenUri || '',
        OIDC_USERINFO_URI: store!.oidcUserinfoUri || '',
        ...(store!.oidcLogoutUri
          ? { OIDC_LOGOUT_URI: store!.oidcLogoutUri }
          : {}),
        OIDC_DISPLAY_NAME: store!.oidcDisplayName || 'SSO',
        OIDC_USERNAME_CLAIM: store!.oidcUsernameClaim || 'preferred_username',
      }
    : {}

  const outlineEnv = {
    NODE_ENV: 'production',
    URL: appUrl,
    PORT: String(SERVER_PORT),
    SECRET_KEY: store?.secretKey ?? '',
    UTILS_SECRET: store?.utilsSecret ?? '',
    DATABASE_URL: dbUrl,
    PGSSLMODE: 'disable',
    REDIS_URL: `redis://127.0.0.1:${REDIS_PORT}`,
    FILE_STORAGE: 'local',
    FILE_STORAGE_LOCAL_ROOT_DIR: STORAGE_PATH,
    // StartOS terminates TLS at its own interface/proxy layer; with upstream's
    // default (true), Outline 301s every plain-http request (LAN .local, tor
    // .onion) to https and the app looks broken.
    FORCE_HTTPS: 'false',
    WEB_CONCURRENCY: '1',
    ...oidcEnv,
  }

  /**
   * ======================== PostgreSQL sidecar ========================
   */
  const postgresSub = sdk.SubContainer.of(
    effects,
    { imageId: 'postgres' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'pgdata',
      subpath: null,
      mountpoint: POSTGRES_PATH,
      readonly: false,
    }),
    'postgres',
  )

  /**
   * ======================== Redis sidecar ========================
   * Collaboration/websockets + job queue. No password — loopback-only inside
   * the package netns, mirroring upstream's own single-tenant compose.
   */
  const redisSub = sdk.SubContainer.of(
    effects,
    { imageId: 'redis' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: 'redis',
      mountpoint: '/data',
      readonly: false,
    }),
    'redis',
  )

  const outlineSub = sdk.SubContainer.of(
    effects,
    { imageId: 'outline' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'storage',
      subpath: null,
      mountpoint: STORAGE_PATH,
      readonly: false,
    }),
    'outline',
  )

  // The migrate oneshot needs no volume of its own; a temp mount of the
  // outline image keeps it off the storage volume entirely.
  const migrateSub = sdk.SubContainer.of(
    effects,
    { imageId: 'outline' },
    sdk.Mounts.of(),
    'outline-migrate',
  )

  const chownSub = sdk.SubContainer.of(
    effects,
    { imageId: 'outline' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'storage',
      subpath: null,
      mountpoint: STORAGE_PATH,
      readonly: false,
    }),
    'outline-chown',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('chown-outline', {
      // Outline's Dockerfile bakes uid 1001 ownership onto the storage path,
      // but the mounted StartOS volume shadows it. Same fix as the relay
      // package's chown-git oneshot.
      subcontainer: chownSub,
      exec: {
        command: ['chown', '-R', '1001:1001', STORAGE_PATH],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('postgres', {
      subcontainer: postgresSub,
      exec: {
        command: sdk.useEntrypoint(['-c', 'listen_addresses=127.0.0.1']),
        env: {
          POSTGRES_DB,
          POSTGRES_USER,
          POSTGRES_PASSWORD: pgPassword,
        },
      },
      ready: {
        display: null,
        fn: async () => {
          const result = await postgresSub.exec([
            'pg_isready',
            '-q',
            '-h',
            '127.0.0.1',
            '-U',
            POSTGRES_USER,
            '-d',
            POSTGRES_DB,
          ])
          return result.exitCode === 0
            ? { result: 'success', message: i18n('PostgreSQL is ready') }
            : {
                result: 'starting',
                message: i18n('Waiting for PostgreSQL to be ready'),
              }
        },
        gracePeriod: 30_000,
      },
      requires: [],
    })
    .addDaemon('redis', {
      subcontainer: redisSub,
      exec: {
        command: sdk.useEntrypoint(),
      },
      ready: {
        display: null,
        fn: async () => {
          const result = await redisSub.exec(['redis-cli', 'ping'])
          return result.exitCode === 0 &&
            result.stdout.toString().trim() === 'PONG'
            ? { result: 'success', message: i18n('Redis is ready') }
            : {
                result: 'starting',
                message: i18n('Waiting for Redis to be ready'),
              }
        },
        gracePeriod: 30_000,
      },
      requires: [],
    })
    .addOneshot('db-migrate', {
      // Outline runs migrations as an explicit step at deploy
      // time rather than on every start. Runs once per (re)start of the
      // package, before the web daemon.
      subcontainer: migrateSub,
      exec: {
        command: DB_MIGRATE_CMD,
        // .sequelizerc resolves config/migrations relative to the cwd;
        // /opt/outline is the image WORKDIR.
        cwd: OUTLINE_WORKDIR,
        env: {
          NODE_ENV: 'production',
          DATABASE_URL: dbUrl,
          PGSSLMODE: 'disable',
        },
      },
      requires: ['postgres'],
    })
    .addDaemon('server', {
      subcontainer: outlineSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: outlineEnv,
      },
      ready: {
        display: i18n('Outline'),
        fn: () =>
          sdk.healthCheck.checkWebUrl(
            effects,
            `http://127.0.0.1:${SERVER_PORT}/_health`,
            {
              successMessage: i18n('Outline is ready'),
              errorMessage: i18n('Outline is not ready'),
            },
          ),
        // First boot follows the migrate oneshot, so the schema already
        // exists; this grace covers a cold Node start, not migrations.
        gracePeriod: 120_000,
      },
      requires: ['db-migrate', 'redis', 'chown-outline'],
    })
})
