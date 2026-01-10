# Luderbein – Bilder schnell reinballern (ohne Rakete)

## Ziel
Du schmeißt Bilder in `incoming/<kategorie>/` und bekommst optimierte Web-Bilder + Manifest automatisch.

## Setup (einmalig)
Python 3 installieren.
Dann im Repo-Root:

pip install pillow

## Ordner
incoming/
  metall/
  glas/
  schiefer/
  acryl/
  holz/
  custom/
  werkstatt/   (optional)

## Ausführen
python3 tools/luderbein-images.py

Optional (alles neu generieren pro Kategorie):
python3 tools/luderbein-images.py --clean

## Ergebnis
assets/<kategorie>/reel/*.webp
assets/<kategorie>/thumbs/*.webp
assets/<kategorie>/reel/manifest.json

## Reihenfolge steuern
Script sortiert alphabetisch nach Dateiname.
Wenn du Reihenfolge willst: Originale im incoming-Ordner so benennen:
01_xyz.jpg, 02_abc.jpg, 03_...
