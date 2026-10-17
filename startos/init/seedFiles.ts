import { utils } from '@start9labs/start-sdk'
import { setAppUrl } from '../actions/setAppUrl'
import { setOidc } from '../actions/setOidc'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {
    pgPassword: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 22 }),
    // Both upstream-specified random keys; SECRET_KEY is hex-32-bytes per
    // the sample, UTILS_SECRET just needs to be unique/random.
    secretKey: utils.getDefaultString({ charset: '0-9,a-f', len: 64 }),
    utilsSecret: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 40 }),
  })

  await sdk.action.createOwnTask(effects, setAppUrl, 'critical', {
    reason: i18n('Choose the address Outline serves its app on'),
  })
  // Outline has no local-account fallback: with no sign-in provider the app
  // starts but nobody can log in. Gate first start on OIDC being configured
  // rather than leaving a broken-looking login screen.
  await sdk.action.createOwnTask(effects, setOidc, 'critical', {
    reason: i18n(
      'Outline signs in exclusively through an OIDC provider — connect yours',
    ),
  })
})
