import { T } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { SERVER_PORT } from './utils'

// One host, one binding, one interface — the web daemon serves the UI and
// the API on the same port. (Never add a second binding: StartOS
// auto-disables a public domain on every sibling of the binding that gets one.)
export const hostId = 'outline'
export const webInterfaceId = 'web'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, hostId)
  const origin = await multi.bindPort(SERVER_PORT, {
    protocol: 'http',
    preferredExternalPort: SERVER_PORT,
  })

  const web = sdk.createInterface(effects, {
    name: i18n('Outline'),
    id: webInterfaceId,
    description: i18n('Outline knowledge base web app and API'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await origin.export([web])]
})

// Domains + Cloudflare-Tunnel-style plugin hostnames (see the relay package's
// note; same two kinds). Used by the Set App Address action; the list never
// shows an address this interface isn't actually serving.
export function getOutlineAppUrls(effects: T.Effects): Promise<string[]> {
  return sdk.host
    .getOwn(effects, hostId, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === webInterfaceId)
      return iface
        ? iface.addressInfo
            // 1.11.0:2 — include the box's own LAN addresses (`ip`, `mdns`).
            // Without them a LAN-only install has an empty app-address list and
            // the install-time critical task cannot be resolved at all.
            .matchesAny([
              { kind: 'domain' },
              { kind: 'plugin' },
              { kind: 'ip' },
              { kind: 'mdns' },
            ])
            .format()
        : []
    })
    .once()
}
