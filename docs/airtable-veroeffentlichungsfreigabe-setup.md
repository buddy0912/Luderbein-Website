# Airtable-Anbindung der Veröffentlichungsfreigabe

Stand: 09.08.2026 · Veröffentlichungsfreigabe Version 1.0

## Ziel

Die Website speichert vorbereitete und bestätigte Veröffentlichungsfreigaben vollständig in Cloudflare D1. Erst nach einer eindeutigen Kundenbestätigung wird eine Arbeitskopie nach Airtable übertragen. Ein Airtable-Fehler darf die bereits in D1 dokumentierte Kundenfreigabe nicht verwerfen.

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

## Sparsamer Schreibvorgang

Pro bestätigter Freigabe sendet die Website genau eine `PATCH`-Anfrage an Airtable.
Der Referenzcode dient dabei als eindeutiger Schlüssel. Existiert bereits ein Datensatz mit
diesem Referenzcode, wird er aktualisiert; andernfalls wird er angelegt. Dadurch entstehen
keine unnötigen Duplikate.

Vorbereitete Freigaben mit ausstehender Kundenbestätigung werden nicht an Airtable
übertragen. Es gibt weder einen zweiten Schreibvorgang für das Benutzerfeld
`Benachrichtigung an` noch zusätzliche Lese- oder Abfragevorgänge.

Zusätzlich zu den bisherigen Feldern werden in Airtable gespeichert:

- Status
- Bestätigungsweg
- Bestätigungstext

Die vollständige Auswahl nach PDF-Version 1.0 bleibt in Cloudflare D1 der maßgebliche
Nachweis. Airtable erhält weiterhin nur eine kompakte Arbeitskopie. Die detaillierte
Materialbeschreibung, die freigegebenen Inhalte, sichtbare Angaben, Personenregelungen
und Einschränkungen werden dafür zusammengefasst im vorhandenen Notizfeld abgelegt.
Die vorhandenen Mehrfachauswahlfelder werden weiterhin sparsam auf Website, Social
Media, digitales Portfolio und gedruckte Materialien abgebildet. Es entstehen keine
zusätzlichen Airtable-Schreibvorgänge.

## Benachrichtigungsstrategie

Für Veröffentlichungsfreigaben ist keine automatische Push- oder E-Mail-Benachrichtigung
aktiv. Dadurch entstehen 0 Airtable-Automationsläufe pro Monat. Die Kontrolle erfolgt
manuell in Airtable.

Eine spätere wöchentliche Sammelmail wäre mit ungefähr 4 bis 5 geplanten
Automationsläufen pro Monat möglich. Sie ist bewusst nicht Bestandteil dieser Fassung,
damit die Freigabe selbst zuverlässig und kontingentsparend bleibt.

## Datenschutz vor produktiver Nutzung

- Airtable-DPA prüfen und gegebenenfalls abschließen.
- Tatsächliche Datenregion und internationale Übermittlung prüfen.
- Lösch- und Widerrufsprozess für D1 und Airtable gemeinsam festlegen.
