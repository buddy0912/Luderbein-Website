# Backup der Rechteerklärungen

Die produktiven Bestätigungen der Rechteerklärungs-Seite werden in der Cloudflare-D1-Datenbank gespeichert.
Für diesen Zweck ist aktuell die Tabelle `rights_confirmations` relevant.

## Gespeicherte Nachweisdaten

Die Tabelle enthält die für Nachweis und spätere Sicherung relevanten Angaben:

- `created_at`
- `contact_name`
- `contact_email`
- `reference`
- `note`
- `checkbox_1`
- `checkbox_2`
- `checkbox_3`
- `declaration_version`
- `declaration_snapshot`
- `notified_at`

Damit ist die konkret bestätigte Fassung über Versionskennung und Snapshot nachvollziehbar, ohne dass Live-Daten lokal im Repo abgelegt werden müssen.

## Empfohlener Exportweg

Die pragmatische Backup-Routine ist ein manueller oder regelmäßig wiederholter D1-Export per Wrangler.
Dafür gibt es das Helper-Script:

```bash
./scripts/export-rights-confirmations.sh "/absoluter/pfad/zum/backup-ordner"
```

Beispiel:

```bash
./scripts/export-rights-confirmations.sh "$HOME/Documents/Luderbein-Backups/rechteerklaerungen"
```

Das Script erstellt eine timestamp-basierte SQL-Datei außerhalb des Repos, zum Beispiel:

```text
rights_confirmations_2026-03-25_15-30-00.sql
```

## Was das Script technisch macht

Es nutzt den dokumentierten Cloudflare-D1-Exportweg für genau eine Tabelle:

```bash
npx wrangler d1 export pinnwand_datenbank --remote --table=rights_confirmations --output=/pfad/zur/datei.sql
```

Damit bleibt die Website produktiv auf D1, und die lokale Sicherung ist ein bewusster Exportvorgang statt einer direkten Live-Synchronisation.

## Voraussetzungen

- Wrangler CLI muss nutzbar sein (`npx wrangler ...`)
- Zugriff auf das Cloudflare-Konto mit Berechtigung für die D1-Datenbank
- Zielordner auf dem lokalen Rechner, idealerweise außerhalb des Git-Repos

## Sinnvolle Routine

- nach wichtigen Kundenprojekten zusätzlich exportieren
- ansonsten regelmäßig wiederholen, zum Beispiel wöchentlich oder monatlich
- Exportdateien lokal geordnet nach Datum aufbewahren

## Optional später ausbaubar

Wenn später nötig, kann auf dieser Basis ergänzend gebaut werden:

- Export der gesamten D1-Datenbank statt nur der Tabelle
- zusätzlicher JSON- oder CSV-Aufbereitungsschritt
- automatisierte interne Backup-Routine außerhalb der öffentlichen Website

Für den aktuellen Projektstand ist der tabellenbezogene SQL-Export die schlankste und sicherste Lösung.
