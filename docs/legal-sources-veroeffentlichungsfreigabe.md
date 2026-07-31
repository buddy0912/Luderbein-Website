# Quellen zur Veröffentlichungsfreigabe

Abrufstand: 31.07.2026

Diese interne Dokumentation hält die Arbeitsgrundlage für die Entwürfe der allgemeinen
und projektbezogenen Veröffentlichungs- und Nutzungsfreigabe fest. Sie ersetzt keine
anwaltliche oder datenschutzrechtliche Fachprüfung.

## Gesetzliche Primärquellen

- Datenschutz-Grundverordnung, Verordnung (EU) 2016/679:
  <https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679>
  - Art. 4 Nr. 11: freiwillige, für den bestimmten Fall, informierte und
    unmissverständlich abgegebene Einwilligung durch Erklärung oder eindeutige
    bestätigende Handlung.
  - Art. 6 Abs. 1 lit. a: Einwilligung als Rechtsgrundlage für die Verarbeitung
    personenbezogener Daten.
  - Art. 7: Nachweisbarkeit, klare und verständliche Erklärung, Widerruf mit Wirkung
    für die Zukunft und gleich einfache Widerrufsmöglichkeit.
  - Art. 13: Informationen bei Erhebung personenbezogener Daten, insbesondere
    Verantwortlicher, Zwecke, Rechtsgrundlage, Speicherdauer beziehungsweise Kriterien,
    Rechte und Beschwerdemöglichkeit.
- Kunsturhebergesetz:
  - § 22 KunstUrhG:
    <https://www.gesetze-im-internet.de/kunsturhg/__22.html>
    Grundsatz der Einwilligung abgebildeter Personen.
  - § 23 KunstUrhG:
    <https://www.gesetze-im-internet.de/kunsturhg/__23.html>
    gesetzliche Ausnahmen und Grenze durch berechtigte Interessen der abgebildeten
    Person. Für den Formularentwurf wird nicht pauschal auf eine Ausnahme vertraut.
- Urheberrechtsgesetz:
  - § 29 UrhG:
    <https://www.gesetze-im-internet.de/urhg/__29.html>
    Das Urheberrecht selbst wird nicht pauschal übertragen; zulässig ist insbesondere
    die Einräumung von Nutzungsrechten.
  - § 31 UrhG:
    <https://www.gesetze-im-internet.de/urhg/__31.html>
    einfache oder ausschließliche sowie räumlich, zeitlich und inhaltlich beschränkte
    Nutzungsrechte; Nutzungsarten sollen konkret bezeichnet werden.

## Offizielle Auslegungshilfe

- Bundesbeauftragte für den Datenschutz und die Informationsfreiheit, „Einwilligung“:
  <https://www.bfdi.bund.de/DE/Buerger/Inhalte/Allgemein/Datenschutz/Einwilligung.html>
  - aktive und unmissverständliche Zustimmung,
  - keine vorausgewählten Kontrollkästchen,
  - freiwillige Entscheidung ohne Nachteile,
  - keine Kopplung an die Auftragsabwicklung,
  - konkrete und verständliche Zwecke,
  - dokumentierbarer Nachweis,
  - Widerruf mit Wirkung für die Zukunft,
  - Widerruf muss so einfach wie die Erteilung sein.

## Bestehende Luderbein-Quellen

Produktionsseiten, am 31.07.2026 mit HTTP-Status 200 geprüft:

- Übersicht Rechtliches:
  <https://luderbein-gravur.pages.dev/rechtliches/>
- Urheberrecht, Bildrechte und unzulässige Motive:
  <https://luderbein-gravur.pages.dev/rechtliches/urheberrecht-bildrechte>
- Rechteerklärung für Kundenvorlagen:
  <https://luderbein-gravur.pages.dev/rechtliches/rechteerklaerung-kundenvorlagen>
- Datenschutzerklärung:
  <https://luderbein-gravur.pages.dev/rechtliches/datenschutz>

Die bestehende Rechteerklärung ist ausschließlich auf die Durchführung eines konkreten
Kundenauftrags begrenzt. Sie wird weder textlich noch technisch zur
Veröffentlichungsfreigabe erweitert. Die neue Erklärung verwendet einen eigenen
Cloudflare-Function-Endpunkt und die eigene D1-Tabelle
`publication_release_confirmations`.

## Betroffene Website-Seiten und Technik

- `rechtliches/veroeffentlichungsfreigabe.html`
- `rechtliches/veroeffentlichungsfreigabe-nachtwaechter-luderboegen.html`
- `rechtliches/index.html`
- `rechtliches/datenschutz.html`
- `functions/api/veroeffentlichungsfreigabe.js`
- `functions/lib/publication-release-confirmation.js`
- `assets/publication-release.css`
- `assets/publication-release.js`
- allgemeine Header-Navigationen ohne den bisherigen Download-Link
- `service/index.html`, Sitemaps und `_headers`

## Technische Leitentscheidungen

- Alle Auswahlmöglichkeiten sind einzelne, nicht vorausgewählte Checkboxen.
- Mindestens ein Veröffentlichungskanal ist erforderlich.
- Namensnennung und anonymisierte Veröffentlichung schließen sich technisch aus.
- Die vier rechtlich relevanten Bestätigungen müssen jeweils aktiv gesetzt werden.
- Gewählte und nicht gewählte Optionen, Textversion, Zeitpunkt und Referenz-ID werden
  getrennt von der bestehenden Auftrags-Rechteerklärung in D1 dokumentiert.
- Eine PDF-Bestätigung wird im Browser bereitgestellt; ein optionales privates
  R2-Archiv nutzt einen getrennten Pfad.
- Der Widerruf kann auf derselben Seite mit Referenz-ID und E-Mail-Adresse erklärt
  werden. Er wird mit Zeitstempel für die Zukunft dokumentiert.
- Beide neuen Seiten tragen bis zur Fachprüfung `noindex`; die Projektseite bleibt
  projektbezogen und ist nicht Bestandteil der Sitemap.

## Offene Auslegungs- und Prüffragen

1. Ob und in welchem Umfang eine öffentlich-rechtliche Stelle wie die Stadt
   Annaberg-Buchholz die Freigabe durch eine bestimmte vertretungsberechtigte Person
   oder nach zusätzlichen internen Vorgaben erklären muss.
2. Ob die gewählte Kombination aus Einwilligung für personenbezogene Daten und
   einfachen Nutzungsrechten für alle vorgesehenen Fotografien, Logos, Wappen und
   Texte genügt oder einzelne Rechteinhaber gesondert erklären müssen.
3. Welche konkrete Speicherdauer für Nachweis- und Widerrufsdaten festgelegt werden
   soll. Der Entwurf verwendet Kriterien statt einer festen Frist.
4. Wie bereits veröffentlichte Inhalte nach einem Widerruf im Einzelfall entfernt
   werden und welche Grenzen für bereits hergestellte Drucksachen gelten.
5. Ob für Veranstaltungsfotos neben § 22 und § 23 KunstUrhG zusätzliche
   datenschutzrechtliche Informationen oder Einwilligungen der abgebildeten Personen
   erforderlich sind.
6. Ob Wappen, Hoheitszeichen, Marken oder sonstige Kennzeichen im konkreten Projekt
   zusätzlichen öffentlich-rechtlichen, markenrechtlichen oder gestalterischen
   Beschränkungen unterliegen.
7. Ob die Formulierung zur Einräumung einfacher Nutzungsrechte zeitlich oder räumlich
   noch enger begrenzt werden soll. Der Entwurf vermeidet eine pauschale Übertragung
   des Urheberrechts, benennt aber keine feste Laufzeit.

Vor Veröffentlichung oder produktiver Nutzung müssen die Texte, der Datenprozess, die
Speicherdauer und die konkrete Vertretungsberechtigung fachlich geprüft und freigegeben
werden.
