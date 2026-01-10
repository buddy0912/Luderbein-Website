DATEI: /assets/auto-feeds.README.md

# Auto-Feeds – so fütterst du Seiten automatisch

## 1) Script erzeugt Manifeste
Für jede Kategorie entsteht:
/assets/<kategorie>/manifest.json

Beispiele:
- /assets/metall/manifest.json
- /assets/glas/manifest.json
- /assets/werkstatt/manifest.json

## 2) Auto-Feeds aktivieren
Binde die Datei ein:
<script src="/assets/auto-feeds.js"></script>

## 3) Feed-Container markieren
Du brauchst irgendwo auf der Seite ein Element mit data-feed.

Beispiel (perfekt, weil dein CSS dafür schon Grid kann):
<div class="products" data-feed="/assets/metall/manifest.json"></div>

Optionen:
- data-feed-limit="12"          (Standard 12)
- data-feed-use="thumb"         (nimmt thumb statt src)
- data-feed-item-class="productcard"  (Standard productcard)

## 4) Werkstattfeed auf Startseite
Genauso – nur mit werkstatt:
<div class="products" data-feed="/assets/werkstatt/manifest.json" data-feed-limit="12"></div>

## Vorschaubild / Kachelbild ändern (später “Foto XX soll Kachelbild sein”)
Lege in incoming/<kategorie>/ eine cover.jpg ab:
incoming/metall/cover.jpg

Script laufen lassen → dann ist das hier dein Kachelbild:
- /assets/metall/cover-square.webp
und für normal:
- /assets/metall/cover.webp
