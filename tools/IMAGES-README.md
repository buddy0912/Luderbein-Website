DATEI: /tools/IMAGES-README.md

# Luderbein – Bilder rein, fertig (ohne Rakete)

## Idee
Du wirfst JPG/PNG in `incoming/<kategorie>/` und bekommst automatisch:
- schnelle Web-Bilder (WebP) in `assets/<kategorie>/`
- `manifest.json` pro Kategorie (für Auto-Feeds)
- optionales Vorschaubild pro Kategorie (`cover.webp` + `cover-square.webp`)

## Setup (einmalig)
Python 3 installieren, dann im Repo-Root:

pip install pillow

## Ordnerstruktur (Beispiel)
incoming/
  metall/
  glas/
  schiefer/
  acryl/
  holz/
  custom/
  werkstatt/

## Optional: Vorschaubild pro Kategorie setzen
Wenn du ein bestimmtes Kachelbild willst:
Lege in die Kategorie eine Datei `cover.jpg` (oder cover.png).
Beispiel: incoming/metall/cover.jpg

Dann erzeugt das Script:
- assets/metall/cover.webp
- assets/metall/cover-square.webp  (perfekt für Kacheln)

## Ausführen
Im Repo-Root:

python3 tools/luderbein-images.py

Wenn du alles neu generieren willst:
python3 tools/luderbein-images.py --clean

## Ergebnis
assets/<kategorie>/
  <kategorie>-reel-01.webp
  <kategorie>-thumb-01.webp
  ...
  cover.webp
  cover-square.webp
  manifest.json

manifest.json ist die Futterliste für die Feeds.
