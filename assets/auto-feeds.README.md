DATEI: /assets/auto-feeds.README.md

# Auto-Feeds – so fütterst du Seiten automatisch (ohne Overkill)

## Grundsatz
- Originalbilder bleiben lokal (z.B. in `incoming/`) und müssen NICHT ins Repo.
- Ins Repo kommen nur die Web-Versionen in `/assets/` + JSON-Dateien.

---

## 1) Werkstatt-Feed (Startseite) – Reel-System (aktueller Stand)
Der Werkstatt-Feed läuft als Reel und wird so eingebunden:

<div
  class="reel"
  aria-label="Werkstatt Reel"
  data-reel
  data-reel-src="/assets/reel-werkstatt.json"
  data-interval="4500"
  data-reel-default-tag="Werkstatt"
></div>

### Erwartetes JSON-Format (/assets/reel-werkstatt.json)
Array aus Objekten, z.B.:
[
  {
    "src": "/assets/reel/reel-01.jpg",
    "alt": "Werkstatt – Einblick",
    "cap": "Werkstatt – Einblick",
    "cats": ["schiefer"]
  }
]

Felder:
- src  (Pfad zum Bild)
- alt  (Alt-Text)
- cap  (Caption/Text im Reel)
- cats (Kategorien/Tags als Array)
Optional:
- tag  (z.B. für spezielle Label/Anzeige)

### Bilder-Pfad (wie aktuell genutzt)
- /assets/reel/reel-01.jpg
- /assets/reel/reel-02.jpg
- ...

Du kannst später problemlos auf .webp wechseln – wichtig ist nur: src muss stimmen.

---

## 2) Leistungsseiten-Feeds – Empfehlung (einheitlich)
Empfehlung: Für Leistungsseiten ebenfalls Reel-JSONs nutzen, damit du nur EIN System hast.

Beispiel (Metall-Seite):
data-reel-src="/assets/reel-metall.json"

Dann erzeugst du pro Leistung:
- /assets/reel-metall.json
- /assets/reel-holz.json
- /assets/reel-schiefer.json
- /assets/reel-glas.json
- ...

Format wie Werkstatt (src/alt/cap/cats).

---

## 3) Vorschaubild / Kachelbild ändern (später, simpel)
Wenn du für eine Leistung ein bestimmtes Kachelbild willst:
Lege lokal in incoming/<kategorie>/ eine cover.jpg ab, z.B.
incoming/metall/cover.jpg

Pipeline laufen lassen → erzeugt:
- /assets/metall/cover.webp          (normal)
- /assets/metall/cover-square.webp   (für 1:1 Kacheln)

Dann kannst du in HTML gezielt dieses Cover als Vorschaubild verwenden.
