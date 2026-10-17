import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

// Generic OIDC provider wiring, mirroring upstream's .env surface exactly
// (docs.getoutline.com/s/hosting/doc/oidc). Outline has no built-in local
// accounts, so this action is the install-time critical task.
const inputSpec = InputSpec.of({
  clientId: Value.text({
    name: i18n('Client ID'),
    description: i18n('The OIDC client ID issued by your identity provider.'),
    required: true,
    default: null,
    masked: false,
    placeholder: 'outline',
  }),
  clientSecret: Value.text({
    name: i18n('Client Secret'),
    description: i18n(
      'The OIDC client secret issued by your identity provider.',
    ),
    required: true,
    default: null,
    masked: true,
    placeholder: null,
  }),
  authUri: Value.text({
    name: i18n('Authorization URL'),
    description: i18n(
      'Provider authorization endpoint (…/authorize or …/auth).',
    ),
    required: true,
    default: null,
    masked: false,
    placeholder: 'https://idp.example.com/authorize',
  }),
  tokenUri: Value.text({
    name: i18n('Token URL'),
    description: i18n('Provider token endpoint.'),
    required: true,
    default: null,
    masked: false,
    placeholder: 'https://idp.example.com/token',
  }),
  userinfoUri: Value.text({
    name: i18n('Userinfo URL'),
    description: i18n('Provider userinfo endpoint.'),
    required: true,
    default: null,
    masked: false,
    placeholder: 'https://idp.example.com/userinfo',
  }),
  logoutUri: Value.text({
    name: i18n('Logout URL (optional)'),
    description: i18n(
      'Provider end-session endpoint. Leave empty if your provider has none.',
    ),
    required: false,
    default: null,
    masked: false,
    placeholder: 'https://idp.example.com/logout',
  }),
  displayName: Value.text({
    name: i18n('Button Label'),
    description: i18n(
      'The label on the sign-in button on the Outline login page.',
    ),
    required: false,
    default: 'SSO',
    masked: false,
    placeholder: null,
  }),
  usernameClaim: Value.text({
    name: i18n('Username Claim'),
    description: i18n(
      "The OIDC claim Outline derives usernames from. Upstream's default is preferred_username.",
    ),
    required: false,
    default: 'preferred_username',
    masked: false,
    placeholder: null,
  }),
})

export const setOidc = sdk.Action.withInput(
  'set-oidc',
  async () => ({
    name: i18n('Configure Sign-In'),
    description: i18n(
      'Connect the OIDC identity provider your team signs in with. Outline has no built-in accounts; without this nobody can log in. The first person to sign in becomes the admin.',
    ),
    warning: i18n(
      'The OIDC redirect/callback URL to register at your provider is <app address>/auth/oidc.callback — set the app address first.',
    ),
    allowedStatuses: 'any',
    group: null,
    // 'always' (not task-only): IdP secrets rotate, so this stays reachable
    // after install wraps up.
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const current = await storeJson.read((s) => s).once()
    return {
      clientId: current?.oidcClientId ?? '',
      clientSecret: '',
      authUri: current?.oidcAuthUri ?? '',
      tokenUri: current?.oidcTokenUri ?? '',
      userinfoUri: current?.oidcUserinfoUri ?? '',
      logoutUri: current?.oidcLogoutUri ?? '',
      displayName: current?.oidcDisplayName ?? 'SSO',
      usernameClaim: current?.oidcUsernameClaim ?? 'preferred_username',
    }
  },
  async ({ effects, input }) => {
    // Empty string = unset (main.ts gates on truthy). Never write an
    // explicit undefined through merge — DeepPartial treats it as
    // "no change", which would strand a cleared field.
    // The masked secret re-opens blank; an empty submit keeps the stored one
    // instead of clobbering it.
    const keepSecret = !input.clientSecret
    await storeJson.merge(effects, {
      oidcClientId: input.clientId,
      ...(keepSecret ? {} : { oidcClientSecret: input.clientSecret }),
      oidcAuthUri: input.authUri,
      oidcTokenUri: input.tokenUri,
      oidcUserinfoUri: input.userinfoUri,
      oidcLogoutUri: input.logoutUri || '',
      oidcDisplayName: input.displayName || 'SSO',
      oidcUsernameClaim: input.usernameClaim || 'preferred_username',
    })
  },
)
