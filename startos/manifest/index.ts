import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'outline',
  title: 'Outline',
  license: 'BSL-1.1', // matches upstream outline/outline
  packageRepo: 'https://github.com/tronsington/outline-startos',
  upstreamRepo: 'https://github.com/outline/outline',
  marketingUrl: 'https://www.getoutline.com',
  donationUrl: null,
  description: { short, long },
  // pgdata = Postgres cluster; storage = Outline's FILE_STORAGE_LOCAL_ROOT_DIR
  // (uploads, attachments, avatars); main = this package's own store.json.
  // Do not co-locate.
  volumes: ['pgdata', 'storage', 'main'],
  images: {
    // outlinewiki/outline v1.11.0 on Docker Hub, pinned by index digest;
    // verified amd64+arm64 (index digest, resolved 2026-10-17 — equals the
    // current `latest` and the same-day GitHub v1.11.0 release).
    outline: {
      source: {
        dockerTag:
          'outlinewiki/outline@sha256:08ee9ffdb847e1bd35ded30ee832090dd06a7f93f67422687db59e70bc7f5393',
      },
      arch: ['x86_64', 'aarch64'],
    },
    // postgres:16, Hub's current :16 index digest (resolved 2026-10-17;
    // same pin as twenty-startos).
    postgres: {
      source: {
        dockerTag:
          'postgres:16@sha256:ca0bd484cb98bf4b24eb1010e73fb3fcbd6714d240fbc1a10eea5b7dbecb641d',
      },
      arch: ['x86_64', 'aarch64'],
    },
    // redis:7-alpine, Hub's current :7-alpine index digest (resolved
    // 2026-10-17; unchanged since 2026-09-21).
    redis: {
      source: {
        dockerTag:
          'redis:7-alpine@sha256:858f009f9709ce576febc734aa78b8f6d624b82571f9ddb6bda4377c833b3499',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  // Web + internal postgres + redis. Node server, WEB_CONCURRENCY=1;
  // 2 GiB mirrors the twenty/relay precedent.
  hardwareRequirements: {
    ram: 2 * 1024 ** 3,
  },
})
