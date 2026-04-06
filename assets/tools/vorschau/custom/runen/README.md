# Runenbibliothek

Dieser Ordner ist die vorbereitete Projektstruktur fuer eine spaetere echte Runenbibliothek im Vorschau-Tool.

Aktueller Stand:
- Die Kategorie `Runen` ist jetzt dateibasiert aus dem Ordner `svg/` angebunden.
- Es liegt jetzt ein freigegebener Kernbestand im Ordner `svg/` vor.
- Es werden bewusst keine Google-Symbole oder improvisierten Platzhalter als Runen verwendet.
- Die feste JPEG-Referenz liegt unter `source/runen-vorlage-altgermanisch.jpg`.

Erwartete Struktur:
- `svg/`
  - eine SVG-Datei pro Rune
  - nur echte, kuratierte und fachlich freigegebene Dateien
  - keine automatisch geratenen oder halbgar vektorisierten Zeichen

Empfohlene Dateilogik:
- Dateinamen klein, eindeutig und ASCII-basiert
- Beispielmuster:
  - `ansuz.svg`
  - `berkana.svg`
  - `dagaz.svg`

Technische Zielanbindung:
- Geplanter Quellpfad im Tool:
  - `/assets/tools/vorschau/custom/runen/svg`
- Geplantes Dateimuster:
  - `*.svg`

Hinweis zur Rohquelle:
- Die abgelegte JPEG-Referenz unter `source/runen-vorlage-altgermanisch.jpg` dient nur als Rohvorlage.
- Solche Rohvorlagen sind noch kein freigeschalteter Asset-Bestand fuer das Tool.
- `Hagalaz` und `Sowilo` bleiben weiterhin bewusst ausserhalb des aktiven Bestands, bis sie gesondert geprueft sind.
