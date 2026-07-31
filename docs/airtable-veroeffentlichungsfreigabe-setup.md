# Airtable-Anbindung der Veröffentlichungsfreigabe

Stand: 31.07.2026

## Ziel

Die Website speichert jede wirksame Veröffentlichungsfreigabe zuerst vollständig in Cloudflare D1. Anschließend wird eine Arbeitskopie nach Airtable übertragen. Ein Airtable-Fehler darf die bereits dokumentierte Kundenfreigabe nicht verwerfen.

## Airtable-Ziel

- Basis: `Luderbein Auftragszentrale`
- Tabelle: `Veröffentlichungsfreigaben`
- Base-ID: `appv7YqLyKbEqN87V`
- Table-ID: `tblTAzo5wBT1rQCew`

## Benötigter Zugang

In Airtable einen Personal Access Token ausschließlich für die Basis `Luderbein Auftragszentrale` anlegen. Benötigte Berechtigung:

- `data.records:write`

Den Token nicht in Dateien oder in den Chat kopieren, sondern als Cloudflare-Secret unter `AIRTABLE_TOKEN` hinterlegen.

Die nicht geheimen Base- und Table-IDs stehen in `wrangler.toml`.

## Kostenfreie Benachrichtigung in Airtable

Die Website weist jeden neu angelegten Datensatz nach dem Speichern im Benutzerfeld
`Benachrichtigung an` dem Luderbein-Airtable-Konto zu. In den Feldeinstellungen muss
`Benutzer*innen mit Base-Zugriff benachrichtigen, wenn sie hinzugefügt wurden` aktiviert
bleiben. Airtable kann dadurch eine native Mitteilung in der App, im Benachrichtigungsbereich
und abhängig von den persönlichen Airtable-Einstellungen per E-Mail auslösen.

Für diesen Weg ist keine Airtable-Automation erforderlich. Die nicht geheime Benutzer-ID
steht als `AIRTABLE_NOTIFICATION_USER_ID` in `wrangler.toml`.

Optional kann die Website nach der D1-Speicherung zusätzlich eine interne E-Mail über
Resend senden. Dafür müssen `RESEND_API_KEY`, `PUBLICATION_RELEASE_NOTIFY_TO` und
`PUBLICATION_RELEASE_EMAIL_FROM` in Cloudflare vollständig konfiguriert sein.

## Datenschutz vor produktiver Nutzung

- Airtable-DPA prüfen und gegebenenfalls abschließen.
- Tatsächliche Datenregion und internationale Übermittlung prüfen.
- Lösch- und Widerrufsprozess für D1 und Airtable gemeinsam festlegen.
