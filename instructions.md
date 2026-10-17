# Outline on StartOS

Outline is an open-source knowledge base and wiki for teams: documents,
collections, search, comments, and sharing — served from your own box.

## Before you install: sign-in requires an OIDC provider

Outline has **no built-in username/password accounts** — nobody can log in
until you connect an OIDC identity provider. StartOS makes that a required
setup task at install (**Configure Sign-In**). If you don't already run one:

- **Authentik** or **Keycloak** for a self-hosted identity service
- **Pocket ID** if you want something passkey-shaped and light
- Any hosted OIDC-compatible IdP (Google Workspace, Okta, Entra ID, …)

From your provider you need the **client ID**, **client secret**, and its
authorization / token / userinfo endpoints. Register this redirect/callback
URL at your provider (set the app address first so you know it):

```
<your Outline address>/auth/oidc.callback
```

**The first person to sign in becomes the admin.** Do it yourself before
inviting the team.

## First start

1. Answer both critical tasks: **Set App Address** (pick the address you
   intend to keep — Outline bakes it into document links it generates) and
   **Configure Sign-In** (your OIDC wiring).
2. Start the service. First boot runs the database migrations; health checks
   go green when the app is actually serving (~a couple of minutes cold).
3. Open the app, sign in through your provider, and make your first
   collection and document.

## Notes

- Uploaded files and images live in the package's `storage` volume; the
  database backs up as a logical dump, so restores survive Postgres upgrades.
- SMTP is not wired in this package version — email invites, magic-link
  sign-in, and notification emails stay off (OIDC sign-in does not need
  email).
- SSO button label and username-claim mapping can be changed later in
  **Configure Sign-In** if your provider needs a different claim.
