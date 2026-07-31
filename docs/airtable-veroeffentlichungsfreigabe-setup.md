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

In der Tabelle `Veröffentlichungsfreigaben` eine Automation anlegen:

1. Auslöser: `When record created`
2. Tabelle: `Veröffentlichungsfreigaben`
3. Aktion: `Send email`
4. Empfänger: die verifizierte E-Mail-Adresse des Airtable-Mitarbeiters
5. Betreff: `Neue Veröffentlichungsfreigabe: {Freigabe}`
6. Inhalt: Auftragsreferenz, Projekt, Kunde, Name, Kanäle, Darstellung, Personen und Bestätigt am
7. Automation testen und auf `On` stellen

Im kostenlosen Airtable-Tarif sind derzeit 100 Automationsläufe pro Monat enthalten. Der native E-Mail-Versand darf dort nur an verifizierte Mitarbeiter der Basis gehen.

Unabhängig davon versucht die Website nach der D1-Speicherung eine kurze interne E-Mail über den bereits für die Pinnwand verwendeten Resend-Zugang zu senden. Dadurch steht eine sofortige Benachrichtigung zur Verfügung, auch solange die Airtable-Automation noch nicht aktiviert ist.

## Datenschutz vor produktiver Nutzung

- Airtable-DPA prüfen und gegebenenfalls abschließen.
- Tatsächliche Datenregion und internationale Übermittlung prüfen.
- Lösch- und Widerrufsprozess für D1 und Airtable gemeinsam festlegen.
