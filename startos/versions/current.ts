import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.11.0:2',
  releaseNotes: {
    en_US:
      "First-boot fix, completed: the database migration step now connects without TLS (the CLI is run on its TLS-free production config), receives the full app environment its helper scripts validate, and the app address can be picked from the box's own LAN addresses — without one the install-time address task had no choices at all. Same Outline v1.11.0, no data change. Sign-in still requires an OIDC provider.",
    es_ES:
      'Corrección del primer arranque, completa: la migración se conecta sin TLS (el CLI usa su configuración de producción sin TLS), recibe todo el entorno de la app que validan sus scripts auxiliares, y la dirección de la app puede elegirse entre las direcciones LAN del equipo — sin ellas la tarea de dirección no ofrecía ninguna opción. Mismo Outline v1.11.0, sin cambios en los datos. El inicio de sesión sigue requiriendo un proveedor OIDC.',
    de_DE:
      'Erststart-Korrektur, vollständig: Die Migration verbindet sich ohne TLS (CLI läuft mit ihrer TLS-freien Produktionskonfiguration), erhält die vollständige App-Umgebung, die ihre Hilfsskripte prüfen, und die App-Adresse lässt sich aus den LAN-Adressen des Geräts wählen — ohne diese hatte die Adress-Aufgabe gar keine Auswahl. Gleiches Outline v1.11.0, keine Datenänderung. Anmeldung erfordert weiterhin einen OIDC-Anbieter.',
    pl_PL:
      'Poprawka pierwszego uruchomienia, dokończona: migracja łączy się bez TLS (CLI działa na produkcyjnej konfiguracji bez TLS), otrzymuje pełne środowisko aplikacji sprawdzane przez skrypty pomocnicze, a adres aplikacji można wybrać spośród adresów LAN urządzenia — bez nich zadanie adresu nie miało żadnych opcji. Ten sam Outline v1.11.0, bez zmian w danych. Logowanie nadal wymaga dostawcy OIDC.',
    fr_FR:
      "Correctif de premier démarrage, terminé : la migration se connecte sans TLS (le CLI tourne sur sa configuration de production sans TLS), reçoit l'environnement complet de l'application que valident ses scripts auxiliaires, et l'adresse de l'app peut être choisie parmi les adresses LAN de la machine — sans elles, la tâche d'adresse n'offrait aucun choix. Même Outline v1.11.0, aucune donnée modifiée. La connexion exige toujours un fournisseur OIDC.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
