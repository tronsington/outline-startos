import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.11.0:0',
  releaseNotes: {
    en_US:
      'Initial StartOS package of Outline v1.11.0 (outlinewiki/outline, digest-pinned). Runs the web app plus internal Postgres and Redis; set the app address and connect your OIDC provider during install.',
    es_ES:
      'Paquete inicial para StartOS de Outline v1.11.0 (outlinewiki/outline, fijado por digest). Ejecuta la app web junto a Postgres y Redis internos; define la dirección de la app y conecta tu proveedor OIDC durante la instalación.',
    de_DE:
      'Erstes StartOS-Paket für Outline v1.11.0 (outlinewiki/outline, per Digest angepinnt). Startet die Web-App sowie internes Postgres und Redis; bei der Installation App-Adresse wählen und den OIDC-Anbieter verbinden.',
    pl_PL:
      'Pierwszy pakiet StartOS dla Outline v1.11.0 (outlinewiki/outline, przypięty po digeście). Uruchamia aplikację webową oraz wewnętrzne Postgres i Redis; przy instalacji wybierz adres aplikacji i podłącz dostawcę OIDC.',
    fr_FR:
      "Premier paquet StartOS pour Outline v1.11.0 (outlinewiki/outline, épinglé par digest). Lance l'app web ainsi que Postgres et Redis internes ; à l'installation, choisissez l'adresse de l'app et connectez votre fournisseur OIDC.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
