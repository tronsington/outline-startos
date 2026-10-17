export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Outline': 0,
  'PostgreSQL is ready': 1,
  'Waiting for PostgreSQL to be ready': 2,
  'Redis is ready': 3,
  'Waiting for Redis to be ready': 4,
  Outline: 5,
  'Outline is ready': 6,
  'Outline is not ready': 7,
  // interfaces.ts
  'Outline knowledge base web app and API': 8,
  // actions/setAppUrl.ts
  'Set App Address': 9,
  'Choose the address Outline serves on.': 10,
  'App Address/URL': 11,
  'The address your browser will use to reach Outline. Links Outline generates (emails, document shares) point here; changing it later invalidates them.': 12,
  'No domain is switched on for the Outline interface yet. Add one under Interfaces and switch it on there first.': 13,
  'Outline builds absolute links (document shares, email actions) from this address. Changing it later invalidates links it already generated. Choose the address you intend to keep.': 14,
  // actions/setOidc.ts
  'Configure Sign-In': 15,
  'Connect the OIDC identity provider your team signs in with. Outline has no built-in accounts; without this nobody can log in. The first person to sign in becomes the admin.': 16,
  'The OIDC redirect/callback URL to register at your provider is <app address>/auth/oidc.callback — set the app address first.': 17,
  'Client ID': 18,
  'The OIDC client ID issued by your identity provider.': 19,
  'Client Secret': 20,
  'The OIDC client secret issued by your identity provider.': 21,
  'Authorization URL': 22,
  'Provider authorization endpoint (…/authorize or …/auth).': 23,
  'Token URL': 24,
  'Provider token endpoint.': 25,
  'Userinfo URL': 26,
  'Provider userinfo endpoint.': 27,
  'Logout URL (optional)': 28,
  'Provider end-session endpoint. Leave empty if your provider has none.': 29,
  'Button Label': 30,
  'The label on the sign-in button on the Outline login page.': 31,
  'Username Claim': 32,
  "The OIDC claim Outline derives usernames from. Upstream's default is preferred_username.": 33,
  // init/seedFiles.ts
  'Choose the address Outline serves its app on': 34,
  'Outline signs in exclusively through an OIDC provider — connect yours': 35,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
