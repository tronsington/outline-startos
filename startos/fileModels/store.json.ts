import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.looseObject({
  // Internal secrets, auto-generated at install (init/seedFiles.ts). Never
  // re-rolled: SECRET_KEY signs sessions (rotation logs everyone out),
  // UTILS_SECRET protects internal utilities.
  pgPassword: z.string().catch(''),
  secretKey: z.string().catch(''),
  utilsSecret: z.string().catch(''),
  // Public URL of the app (URL upstream), chosen via Set App Address.
  // Outline builds absolute links from it; changing it later breaks links
  // in emails and existing sessions.
  appUrl: z.string().optional().catch(undefined),

  // OIDC sign-in (set via Configure Sign-In). Outline has NO local account
  // system: without at least one auth provider nobody can log in. All four
  // endpoints are required by upstream for the generic OIDC provider; the
  // logout URI is optional.
  oidcClientId: z.string().optional().catch(undefined),
  oidcClientSecret: z.string().optional().catch(undefined),
  oidcAuthUri: z.string().optional().catch(undefined),
  oidcTokenUri: z.string().optional().catch(undefined),
  oidcUserinfoUri: z.string().optional().catch(undefined),
  oidcLogoutUri: z.string().optional().catch(undefined),
  oidcDisplayName: z.string().optional().catch(undefined),
  oidcUsernameClaim: z.string().optional().catch(undefined),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'store.json' },
  shape,
)
