# Quellen zur Veröffentlichungsfreigabe

Abrufstand: 31.07.2026

## Zweck und betroffene Seiten

Diese interne Dokumentation gehört zur allgemeinen Fassung:

- `/rechtliches/veroeffentlichungsfreigabe/`
- `/rechtliches/datenschutz.html`
- `/rechtliches/index.html`

Die allgemeine Veröffentlichungsfreigabe ist eine eigenständige Erklärung. Sie erweitert die bestehende Rechteerklärung für Kundenvorlagen nicht stillschweigend. Jene bleibt auf die Durchführung eines konkreten Kundenauftrags beschränkt. Die verpflichtende Rechnungsnummer oder Auftragsreferenz dient der eindeutigen Zuordnung zum Kundenauftrag.

## Gesetzliche Primärquellen

### Datenschutz-Grundverordnung

Offizielle Fassung bei EUR-Lex:

https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679

Verwendete Stellen:

- Art. 4 Nr. 11: Einwilligung als freiwillige, für den bestimmten Fall, informierte und unmissverständlich abgegebene Willensbekundung durch Erklärung oder eindeutige bestätigende Handlung.
- Art. 6 Abs. 1 lit. a: Einwilligung als Rechtsgrundlage für die Verarbeitung personenbezogener Daten zu bestimmten Zwecken.
- Art. 7 Abs. 1: Nachweisbarkeit der Einwilligung.
- Art. 7 Abs. 2: verständliche, leicht zugängliche, klare und von anderen Sachverhalten unterscheidbare Erklärung.
- Art. 7 Abs. 3: Widerruf jederzeit mit Wirkung für die Zukunft; der Widerruf muss so einfach wie die Erteilung sein.
- Art. 7 Abs. 4: Berücksichtigung des Koppelungsverbots bei der Beurteilung der Freiwilligkeit.
- Art. 13: Informationen bei Erhebung personenbezogener Daten, insbesondere Verantwortlicher, Zweck, Rechtsgrundlage, Speicherdauer und Betroffenenrechte.

Technische Folgerung:

- keine vorausgewählten Optionen;
- getrennte aktive Auswahl der Veröffentlichungsarten;
- ausdrücklicher Hinweis auf Freiwilligkeit, fehlende Nachteile und Widerruf;
- Speicherung von Auswahl, Textversion, Zeitstempel und Referenzcode als Nachweis;
- kein Unterschrifts-Zeichenfeld, weil eine Einwilligung nicht an Schriftform gebunden ist und die digitale Bestätigung nachvollziehbarer dokumentiert werden kann.

### Recht am eigenen Bild

Offizielle Fassungen:

- https://www.gesetze-im-internet.de/kunsturhg/__22.html
- https://www.gesetze-im-internet.de/kunsturhg/__23.html

Verwendete Stellen:

- § 22 KunstUrhG: Bildnisse dürfen grundsätzlich nur mit Einwilligung der abgebildeten Person verbreitet oder öffentlich zur Schau gestellt werden.
- § 23 Abs. 1 KunstUrhG: gesetzliche Ausnahmen für bestimmte Fallgruppen.
- § 23 Abs. 2 KunstUrhG: keine Berufung auf die Ausnahmen, wenn berechtigte Interessen der abgebildeten Person verletzt werden.

Technische Folgerung:

- gesonderte Auswahl für Fotos einer Übergabe oder Veranstaltung;
- erforderliche aktive Entscheidung, ob keine Personen erkennbar sind, Personen mit den erforderlichen Zustimmungen im Original gezeigt werden dürfen oder nur eine verpixelte beziehungsweise anonymisierte Darstellung zulässig ist;
- keine automatische Annahme, dass eine Veranstaltung allein bereits jede Veröffentlichung erlaubt.

### Urheberrecht und Nutzungsrechte

Offizielle Fassungen:

- https://www.gesetze-im-internet.de/urhg/__29.html
- https://www.gesetze-im-internet.de/urhg/__31.html

Verwendete Stellen:

- § 29 Abs. 1 UrhG: Das Urheberrecht selbst ist grundsätzlich nicht übertragbar.
- § 29 Abs. 2 UrhG: Einräumung von Nutzungsrechten und Vereinbarungen zu Verwertungsrechten sind zulässig.
- § 31 Abs. 1 und 2 UrhG: einfache oder ausschließliche sowie räumlich, zeitlich und inhaltlich beschränkte Nutzungsrechte.
- § 31 Abs. 5 UrhG: Bedeutung der ausdrücklich bezeichneten Nutzungsarten und des Vertragszwecks.

Technische Folgerung:

- keine Behauptung einer Übertragung des Urheberrechts;
- einfache, nicht ausschließliche Nutzungsrechte;
- inhaltliche Begrenzung auf das bezeichnete Projekt und die aktiv ausgewählten Nutzungsarten;
- gesonderte Bestätigung der Berechtigung an kundenseitig gelieferten Fotos, Logos, Wappen, Texten und sonstigen Bestandteilen.

## Offizielle Auslegungshilfe

Bundesbeauftragte für den Datenschutz und die Informationsfreiheit:

https://www.bfdi.bund.de/DE/Buerger/Inhalte/Allgemein/Datenschutz/Einwilligung.html

Berücksichtigte Aussagen:

- echte und freie Wahl;
- Verweigerung und Rücknahme ohne Nachteile;
- keine Koppelung an nicht erforderliche Datenverarbeitungen;
- verständliche Information zu Verantwortlichem, Zweck, Daten und Widerruf;
- Widerruf so einfach wie Erteilung;
- keine bestimmte Form vorgeschrieben, aber dokumentierbarer Nachweis erforderlich.

## Bestehende Luderbein-Quellen

- https://luderbein-gravur.pages.dev/rechtliches/
- https://luderbein-gravur.pages.dev/rechtliches/urheberrecht-bildrechte.html
- https://luderbein-gravur.pages.dev/rechtliches/rechteerklaerung-kundenvorlagen.html
- https://luderbein-gravur.pages.dev/rechtliches/datenschutz.html

Im Repository geprüft:

- `rechtliches/rechteerklaerung-kundenvorlagen.html`
- `functions/api/rechteerklaerung.js`
- `functions/lib/rights-confirmation.js`
- `rechtliches/datenschutz.html`
- `rechtliches/urheberrecht-bildrechte.html`
- `rechtliches/index.html`
- `service/index.html`
- `sitemap.xml`
- `sitemap-main.xml`
- `sitemap.txt`
- `robots.txt`
- `wrangler.toml`

Wiederverwendete technische Grundsätze:

- aktive Pflichtbestätigungen;
- serverseitige Validierung;
- eigene D1-Tabelle;
- Versionskennung der Textfassung;
- Referenzcode und Zeitstempel;
- herunterladbarer PDF-Nachweis.

## Offene rechtliche und organisatorische Fragen

1. Die Textfassung und insbesondere das Zusammenspiel von datenschutzrechtlicher Einwilligung, Bildnisfreigabe und urheberrechtlicher Nutzungsrechtseinräumung sollten anwaltlich geprüft werden.
2. Bei Firmen, Behörden und anderen Organisationen ist zu prüfen, ob interne Vertretungs- oder Zeichnungsregeln gelten und wer die Freigabe wirksam abgeben darf.
3. Zu klären ist, ob zusätzlich ein E-Mail-Bestätigungslink als stärkerer Identitätsnachweis eingerichtet werden soll. Die jetzige Fassung dokumentiert Rechnungsnummer oder Auftragsreferenz, Name, gegebenenfalls Funktion, E-Mail, Auswahl, Zeitstempel, Textversion und Referenzcode, verifiziert den Zugriff auf die angegebene E-Mail-Adresse aber noch nicht.
4. Für erkennbare Personen muss organisatorisch nachvollziehbar sein, welche Einwilligungen vorliegen und welche Kanäle sie abdecken. Das Formular ersetzt diese Einwilligungen nicht.
5. Der praktische Umgang mit einem Widerruf bei bereits gedruckten Materialien und bei Veröffentlichungen außerhalb direkt beherrschbarer Kanäle sollte verbindlich festgelegt werden.
6. Vor Veröffentlichung ist zu prüfen, ob die Datenschutzhinweise nach Art. 13 DSGVO alle tatsächlichen Empfänger, Auftragsverarbeiter und Löschregeln vollständig abbilden.

## Hinweis

Diese Dokumentation und die zugehörige Fassung ersetzen keine anwaltliche Prüfung. Nicht geklärte Punkte sind bewusst als offene Fragen dokumentiert und dürfen nicht als abschließend rechtssicher dargestellt werden.
