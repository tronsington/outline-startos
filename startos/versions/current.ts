import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.11.0:1',
  releaseNotes: {
    en_US:
      'Fixes first-boot failure: the database migration step tried to reach the bundled Postgres over TLS ("The server does not support SSL connections") and the service never started. Upstream keeps a production config without TLS for exactly this case, and both the migration step and the web app now use it. Same Outline v1.11.0, no data change. Sign-in still needs an OIDC provider before the service will run.',
    es_ES:
      'Corrige el fallo del primer arranque: la migración de la base de datos intentaba conectar con el Postgres incluido mediante TLS ("The server does not support SSL connections") y el servicio nunca arrancaba. Se usa la configuración de producción sin TLS que upstream mantiene para este caso, tanto en la migración como en la app. Mismo Outline v1.11.0, sin cambios en los datos. El inicio de sesión sigue necesitando un proveedor OIDC.',
    de_DE:
      'Behebt den Fehlstart: Die Datenbankmigration verband sich per TLS mit dem mitgelieferten Postgres ("The server does not support SSL connections"), der Dienst startete nie. Sowohl Migration als auch Web-App nutzen jetzt die TLS-freie Produktionskonfiguration, die Upstream genau dafür bereithält. Gleiches Outline v1.11.0, keine Datenänderung. Anmeldung benötigt weiterhin einen OIDC-Anbieter.',
    pl_PL:
      'Naprawia błąd pierwszego uruchomienia: migracja bazy łączyła się z dołączonym Postgresem przez TLS ("The server does not support SSL connections") i usługa nigdy nie startowała. Zarówno migracja, jak i aplikacja używają teraz produkcyjnej konfiguracji bez TLS, którą upstream utrzymuje właśnie dla tego przypadku. Ten sam Outline v1.11.0, bez zmian w danych. Logowanie nadal wymaga dostawcy OIDC.',
    fr_FR:
      "Corrige l'échec du premier démarrage : la migration de base tentait de joindre le Postgres embarqué en TLS (« The server does not support SSL connections ») et le service ne démarrait jamais. La migration et l'application utilisent désormais la configuration de production sans TLS qu'upstream prévoit pour ce cas. Même Outline v1.11.0, aucune donnée modifiée. La connexion exige toujours un fournisseur OIDC.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
