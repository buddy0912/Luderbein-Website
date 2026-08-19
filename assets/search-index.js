// Luderbein search index
// Pflegehinweis:
// - Pro Seite oder Unterthema einen Eintrag anlegen.
// - "keywords" = suchrelevante Begriffe aus Inhalt, Navigation, Produktarten und Leistungen.
// - "imageTags" = zusätzliche Suchbegriffe aus Bildkontexten.
// - "imageProjects" = pflegbare Bildprojekt-Struktur für spätere Filterung/Zuordnung.
// - "content" = kurze textliche Verdichtung für Fließtext-, FAQ- und B2B-Treffer.
(function () {
  window.__lbSearchIndex = [
    {
      title: "Start",
      url: "/",
      type: "Seite",
      section: "Startseite",
      summary: "Einstieg in Leistungen, Gravurarten, Privatkunden- und B2B-Bereich.",
      keywords: ["start", "leistungen", "gravur", "geschenk", "b2b", "privatkunden", "werkstatt"],
      imageTags: ["gravur", "werkstatt", "material", "laser", "beispiele"],
      imageProjects: [
        { project: "Werkstatt-Feed", tags: ["gravur", "werkstatt", "laser", "beispiele"] }
      ],
      content: "Schneller Überblick über Materialien, Leistungen, Werkstatt-Feed, Einzelstücke, Geschenke und Business-Anfragen."
    },
    {
      title: "Leistungen",
      url: "/leistungen/",
      type: "Übersicht",
      section: "Leistungsübersicht",
      summary: "Gesamte Übersicht über Schiefer, Metall, Holz, Acryl, Glas, Custom und Schwibbögen.",
      keywords: ["leistungen", "materialien", "produktarten", "schiefer", "metall", "holz", "acryl", "glas", "custom", "schwibbogen"],
      imageTags: ["material", "produkt", "beispiele", "gravur", "laser"],
      imageProjects: [
        { project: "Leistungsübersicht", tags: ["material", "produkt", "gravur", "beispiele"] }
      ],
      content: "Zentraler Einstieg für Materialien, Gravurarten, Schilder, Deko, Serien, Schwibbögen und Sonderanfertigungen."
    },
    {
      title: "Schiefergravur",
      url: "/leistungen/schiefer/",
      type: "Leistung",
      section: "Material Schiefer",
      summary: "Fotogravur, Text, Symbole und Erinnerungsstücke auf Schiefer.",
      keywords: ["schiefer", "schiefergravur", "fotogravur", "text", "symbole", "widmung", "gedenken", "gedenktafel", "geschenk", "haustier"],
      imageTags: ["schiefer", "naturstein", "fotogravur", "haustier", "erinnerung", "widmung"],
      imageProjects: [
        { project: "Schiefer Übersicht", tags: ["schiefer", "naturstein", "widmung"] },
        { project: "Schiefer Foto", tags: ["fotogravur", "haustier", "erinnerung"] }
      ],
      content: "Schiefer eignet sich für Fotos, Portraits, Haustiere, klare Linien, kurze Texte, Koordinaten und würdige Erinnerungsstücke."
    },
    {
      title: "Schiefer-Fotogravur",
      url: "/leistungen/schiefer/foto/",
      type: "Produktart",
      section: "Schiefer Foto",
      summary: "Portraits, Haustiere und Erinnerungen als Gravur auf Schiefer.",
      modalTarget: null,
      keywords: ["schiefer foto", "fotogravur", "portrait", "portrait gravieren", "tierportrait", "haustier", "hund", "katze", "hundefoto", "tierfoto", "familienfoto", "erinnerungsfoto", "fotogeschenk", "tier", "erinnerung", "foto check"],
      imageTags: ["portrait", "haustier", "foto", "schiefer", "gravur"],
      imageProjects: [
        { project: "Schiefer Fotogravur", tags: ["portrait", "haustier", "foto", "schiefer"] }
      ],
      content: "Geeignet für Portraits, Tiermotive und Erinnerungsfotos mit kontrastreicher Vorbereitung und persönlicher Abstimmung."
    },
    {
      title: "Schiefer mit Text & Symbol",
      url: "/leistungen/schiefer-text/",
      type: "Produktart",
      section: "Schiefer Text & Symbol",
      summary: "Widmung, Name, Datum, Koordinaten, Spruch oder kleines Symbol auf Schiefer.",
      keywords: ["schiefer text", "textgravur", "schrift gravieren", "widmung", "name", "datum", "koordinaten", "gps koordinaten", "spruch", "zitat", "symbol", "icon", "schild", "namensschild"],
      imageTags: ["schiefer", "text", "schrift", "widmung", "koordinaten", "symbol"],
      imageProjects: [
        { project: "Schiefer Text & Symbol", tags: ["schiefer", "textgravur", "widmung", "koordinaten", "symbol"] }
      ],
      content: "Schiefergestaltung mit Namen, Datum, kurzem Satz, Widmung, Koordinaten oder kleinem Icon in einem klaren, gut lesbaren Layout."
    },
    {
      title: "Schiefer-Gedenktafeln",
      url: "/leistungen/schiefer/gedenktafeln/",
      type: "Produktart",
      section: "Schiefer Gedenken",
      summary: "Würdige kleine Ahnentafeln und Gedenkplatten auf Schiefer.",
      modalTarget: { product: "Schiefer", variant: "Gedenktafel" },
      keywords: ["gedenktafel", "gedenktafeln", "gedenkplatte", "gedenkschild", "ahnentafel", "ahnentafeln", "ahnen", "erinnerung", "trauergeschenk", "trauer", "andenken", "memorial", "name datum spruch", "schiefer"],
      imageTags: ["gedenken", "schiefer", "erinnerung", "tafel"],
      imageProjects: [
        { project: "Schiefer Gedenktafeln", tags: ["gedenken", "erinnerung", "tafel", "schiefer"] }
      ],
      content: "Schiefer-Gedenktafeln für würdevolle Erinnerungen, Namen, Daten und reduzierte Gestaltung ohne Kitsch."
    },
    {
      title: "Metallgravur",
      url: "/leistungen/metall/",
      type: "Leistung",
      section: "Material Metall",
      summary: "Edelstahl, Aluminium, Tags, Plaketten und robuste Gravuren.",
      keywords: ["metall", "metallgravur", "edelstahl", "aluminium", "tags", "plaketten", "schilder", "anhänger", "gravur"],
      imageTags: ["metall", "gravur", "tag", "plakette", "qr", "anhänger"],
      imageProjects: [
        { project: "Metall Übersicht", tags: ["metall", "gravur", "plakette"] },
        { project: "Metall Tags", tags: ["tag", "anhänger", "qr"] }
      ],
      content: "Metall eignet sich für Hundemarken, Schilder, Plaketten, Schlüsselanhänger, Business-Tags und präzise dauerhafte Kennzeichnung."
    },
    {
      title: "Hundemarken & Tags",
      url: "/leistungen/metall/",
      type: "Produktart",
      section: "Metall Hundemarken",
      summary: "Personalisierte Hundemarken und Tags mit Name, Nummer oder QR.",
      modalTarget: { product: "Metall", variant: "Hundemarken & Tags" },
      keywords: ["hundemarke", "hundemarken", "hundeanhänger", "tieranhänger", "haustier", "tiermarke", "tag", "anhänger", "telefonnummer", "adresse", "name nummer", "qr", "metall"],
      imageTags: ["hundemarke", "metall", "haustier", "gravur", "anhänger"],
      imageProjects: [
        { project: "Hundemarken Projekt", tags: ["hundemarke", "haustier", "anhänger", "metall", "gravur"] }
      ],
      content: "Personalisierte Metall-Hundemarken und Tags für Haustiere, Alltag und klare Lesbarkeit mit robuster Gravur."
    },
    {
      title: "Metall-Schilder & Business-Plaketten",
      url: "/leistungen/metall/",
      type: "Produktart",
      section: "Metall Business",
      summary: "Schilder, Plaketten, Visitenkarten und Branding-Elemente aus Metall.",
      modalTarget: { product: "Metall", variant: "Schilder & Plaketten" },
      keywords: ["metallschild", "schild", "plakette", "typenschild", "werkstatt label", "werkzeuglabel", "warnhinweis", "inventarschild", "metallvisitenkarte", "firmenlogo", "logo gravieren", "business", "visitenkarte", "branding", "werkstatt", "qr", "b2b"],
      imageTags: ["plakette", "schild", "branding", "metall", "visitenkarte"],
      imageProjects: [
        { project: "Business Plaketten", tags: ["plakette", "schild", "branding", "visitenkarte"] }
      ],
      content: "Metall-Schilder und Business-Plaketten für Werkstatt, Unternehmen, Branding, QR-Codes, Kennzeichnung und professionelle Anwendungen."
    },
    {
      title: "Metall-Schlüsselanhänger",
      url: "/leistungen/metall/",
      type: "Produktart",
      section: "Metall Schlüsselanhänger",
      summary: "Schlüsselanhänger aus Metall mit Text, Icon oder Koordinaten.",
      modalTarget: { product: "Metall", variant: "Schlüsselanhänger" },
      keywords: ["schlüsselanhänger", "metallanhänger", "anhänger gravieren", "schlüsselbund", "name", "initialen", "koordinaten", "icon", "geschenk"],
      imageTags: ["schlüsselanhänger", "metall", "gravur", "geschenk", "koordinaten"],
      imageProjects: [
        { project: "Metall-Schlüsselanhänger", tags: ["schlüsselanhänger", "metall", "gravur", "anhänger"] }
      ],
      content: "Personalisierte Metall-Schlüsselanhänger mit Name, kurzem Text, Icon oder Koordinaten."
    },
    {
      title: "Schmuck & Anhänger aus Metall",
      url: "/leistungen/metall/",
      type: "Produktart",
      section: "Metall Schmuck",
      summary: "Initialen, Symbole und kleine Motive auf Schmuck und Metallanhängern.",
      modalTarget: { product: "Metall", variant: "Schmuck" },
      keywords: ["schmuck", "schmuck gravieren", "anhänger", "kette", "kettenanhänger", "initialen", "symbol", "partneranhänger", "unikat", "kleine serie"],
      imageTags: ["schmuck", "anhänger", "metall", "initialen", "symbol"],
      imageProjects: [
        { project: "Metall-Schmuck", tags: ["schmuck", "anhänger", "metall", "gravur"] }
      ],
      content: "Feine Gravuren für Schmuck, Anhänger, Initialen, Symbole, Unikate und kleine Serien."
    },
    {
      title: "Holzgravur",
      url: "/leistungen/holz/",
      type: "Leistung",
      section: "Material Holz",
      summary: "Schilder, Deko, Schlüsselanhänger und kleine Serien aus Holz.",
      keywords: ["holz", "holzgravur", "holz gravieren", "holzschild", "schild", "holzdeko", "deko", "schlüsselanhänger", "kleinzeug", "namensanhänger", "koordinaten", "qr code", "serie", "kleinserie", "geschenk", "laser"],
      imageTags: ["holz", "deko", "schild", "geschenk", "schlüsselanhänger"],
      imageProjects: [
        { project: "Holz Übersicht", tags: ["holz", "deko", "schild"] },
        { project: "Holz Kleinzeug", tags: ["schlüsselanhänger", "geschenk"] }
      ],
      content: "Holz passt für Schilder, Deko, Geschenke, Schlüsselanhänger, Kleinzeug und kleine Serien mit klaren Linien und natürlichem Look."
    },
    {
      title: "Acrylgravur",
      url: "/leistungen/acryl/",
      type: "Leistung",
      section: "Material Acryl",
      summary: "Acryl für Schilder, Labels, Beschriftung und kleine Serien.",
      keywords: ["acryl", "acrylgravur", "acryl gravieren", "acrylschild", "schild", "türschild", "hinweisschild", "werkstattschild", "namensschild", "logo", "label", "tag", "beschriftung", "serie", "kleinserie", "qr", "qr schild"],
      imageTags: ["acryl", "schild", "label", "beschriftung"],
      imageProjects: [
        { project: "Acryl Schilder", tags: ["acryl", "schild", "label", "beschriftung"] }
      ],
      content: "Acryl ist ideal für moderne Beschriftung, klare Schilder, Labels, QR-Anwendungen und kleine Serien."
    },
    {
      title: "Glasgravur",
      url: "/leistungen/glas/",
      type: "Leistung",
      section: "Material Glas",
      summary: "Glas auf Anfrage, zum Beispiel Weingläser und Erinnerungsgläser.",
      keywords: ["glas", "glasgravur", "glas gravieren", "weinglas", "weingläser", "glasgeschenk", "erinnerungsglas", "gedenkglas", "grabglas", "name", "datum", "anlass"],
      imageTags: ["glas", "weinglas", "geschenk", "gravur", "anlass"],
      imageProjects: [
        { project: "Glas Übersicht", tags: ["glas", "gravur", "anlass"] },
        { project: "Glas Geschenk", tags: ["weinglas", "geschenk"] }
      ],
      content: "Glasgravur für Weingläser, Anlässe, Namen, Daten, Erinnerungsgläser und einzelne personalisierte Geschenke."
    },
    {
      title: "Weingläser & Anlassgravur",
      url: "/leistungen/glas/",
      type: "Produktart",
      section: "Glas Anlass",
      summary: "Weingläser mit Namen, Datum oder Anlass als Geschenk oder Event-Detail.",
      modalTarget: { product: "Weingläser", variant: "Weingläser" },
      keywords: ["weinglas", "weingläser", "weinglas gravieren", "hochzeit", "geburtstag", "jubiläum", "firmenevent", "geschenk", "datum", "name", "anlass", "glas"],
      imageTags: ["weinglas", "glas", "geschenk", "hochzeit", "gravur"],
      imageProjects: [
        { project: "Weingläser", tags: ["weinglas", "glas", "geschenk", "hochzeit"] }
      ],
      content: "Personalisierte Weingläser mit Anlass, Datum oder Namen für Hochzeit, Geschenk und persönliche Momente."
    },
    {
      title: "Custom & Sonderanfertigungen",
      url: "/leistungen/custom/",
      type: "Leistung",
      section: "Custom",
      summary: "Sonderwünsche, Mischmaterial, Prototypen und freie Ideen.",
      keywords: ["custom", "sonderanfertigung", "sonderanfertigungen", "sonderwunsch", "einzelanfertigung", "unikat", "prototyp", "mischmaterial", "lampe", "lampenbau", "laserschnitt", "laser schneiden", "dickes holz", "schmuck", "kleinzeug", "freie idee", "verrückte idee"],
      imageTags: ["custom", "prototyp", "schmuck", "lampe", "sonderbau"],
      imageProjects: [
        { project: "Custom Lampenbau", tags: ["lampe", "sonderbau"] },
        { project: "Custom Schmuck", tags: ["schmuck", "custom"] },
        { project: "Custom Prototyp", tags: ["prototyp", "mischmaterial"] }
      ],
      content: "Für freie Ideen, Lampenbau, Schmuck, stärkere Materialien, Prototypen und Sonderlösungen mit schneller Machbarkeitsprüfung."
    },
    {
      title: "Schwibbögen",
      url: "/leistungen/schwibboegen/",
      type: "Leistung",
      section: "Schwibbogen",
      summary: "Schwibbögen mit Charakter, sauberer Verarbeitung und direkter Anfrage.",
      keywords: ["schwibbogen", "schwibbögen", "luderbogen", "luderbögen", "lichterbogen", "erzgebirge", "weihnachtsdeko", "fensterdeko", "lichtbogen", "geschenk", "dimmer", "geschenkset", "konfigurator"],
      imageTags: ["schwibbogen", "holz", "licht", "erzgebirge", "geschenk"],
      imageProjects: [
        { project: "Schwibbogen Übersicht", tags: ["schwibbogen", "licht", "erzgebirge", "geschenk"] }
      ],
      content: "Schwibbögen mit fester Gestaltung, Upgrades, Geschenkset, Wunsch-Deadline und sauberem Anfrageprozess für Einzelstücke oder Seriennähe."
    },
    {
      title: "FAQ: Was ist ein Schwibbogen?",
      url: "/leistungen/schwibboegen/",
      type: "FAQ",
      section: "Schwibbogen FAQ",
      summary: "Erzgebirgsklassiker als feste Designs mit Licht, Charakter und klarer Linie.",
      keywords: ["faq", "was ist ein schwibbogen", "schwibbogen", "erzgebirgsklassiker", "licht"],
      imageTags: ["schwibbogen", "erzgebirge", "lichtbogen"],
      imageProjects: [
        { project: "Schwibbogen FAQ Visual", tags: ["schwibbogen", "erzgebirge", "lichtbogen"] }
      ],
      content: "FAQ-Antwort zu Aufbau, Stil und Produktcharakter der Schwibbögen inklusive Variante, Licht und fester Gestaltung."
    },
    {
      title: "Epidemic Scorn Schwibbogen",
      url: "/leistungen/schwibboegen/epidemic-scorn-schwibbogen/",
      type: "Produkt",
      section: "Schwibbogen Produkt",
      summary: "Konkreter Schwibbogen mit fertigem Design und wenigen Upgrades.",
      keywords: ["epidemic scorn", "schwibbogen", "band", "produkt", "dimmer", "geschenkset"],
      imageTags: ["schwibbogen", "bandmotiv", "licht", "geschenkset"],
      imageProjects: [
        { project: "Epidemic Scorn", tags: ["schwibbogen", "bandmotiv", "licht", "geschenkset"] }
      ],
      content: "Fertiger Schwibbogen mit Design-Vorgabe, Preispunkt, direkter Anfrage und optionalen Upgrades wie Dimmer oder Geschenkset."
    },
    {
      title: "B2B-Lösungen",
      url: "/b2b/",
      type: "B2B",
      section: "Geschäftskunden",
      summary: "B2B für Industrie, Handwerk, Gastronomie und Werkstätten.",
      keywords: ["b2b", "geschäftskunden", "firmenkunden", "unternehmen", "business", "industrie", "handwerk", "gastronomie", "werkstatt", "branding", "firmenlogo", "logo gravieren", "firmengeschenk", "werbegeschenk", "seriengravur", "kleinserie", "angebot"],
      imageTags: ["b2b", "industrie", "werkstatt", "branding"],
      imageProjects: [
        { project: "B2B Übersicht", tags: ["b2b", "industrie", "werkstatt", "branding"] }
      ],
      content: "Geschäftskundenbereich für industrielle Markierung, Gastronomiebedarf, Werbemittel, Kleinserien, Vor-Ort-Service und direkte Abstimmung."
    },
    {
      title: "B2B: Industrielle Markierung vor Ort",
      url: "/b2b/",
      type: "B2B",
      section: "Industrielle Markierung",
      summary: "Mobile IR-Markierung für Metalle, Werkzeuge, Typenschilder und ortsfeste Anlagen.",
      keywords: ["industrielle markierung", "vor ort", "ir laser", "metallmarkierung", "typenschild", "werkzeug", "anlage", "inventarisierung"],
      imageTags: ["metall", "industrie", "typenschild", "werkzeug", "markierung"],
      imageProjects: [
        { project: "Vor-Ort-Markierung", tags: ["metall", "industrie", "typenschild", "werkzeug", "markierung"] }
      ],
      content: "Vor-Ort-Metallmarkierung für Industrie und Handwerk mit mobilem IR-Laser, ohne Ausbau der Teile und ohne langen Produktionsstopp."
    },
    {
      title: "B2B: Gastronomie & Branding",
      url: "/b2b/",
      type: "B2B",
      section: "Gastronomie",
      summary: "QR-Aufsteller, Menükarten, Schiefer, Holz, Glas und Metall für den professionellen Auftritt.",
      keywords: ["gastronomie", "gastro", "branding", "qr aufsteller", "menükarte", "weinglas", "schiefer", "holz", "glas", "metall"],
      imageTags: ["gastronomie", "qr", "branding", "menükarte", "weinglas"],
      imageProjects: [
        { project: "Gastronomie Branding", tags: ["gastronomie", "qr", "branding", "menükarte", "weinglas"] }
      ],
      content: "B2B-Lösung für Gastronomie mit QR-Aufstellern, gebrandeten Menükarten, Schiefer, Holz, Glas und Metallgravuren."
    },
    {
      title: "Service & Downloads",
      url: "/service/",
      type: "Service",
      section: "Downloads",
      summary: "Vorbestellformulare, PDF-Infos und spätere Material-Guides.",
      keywords: ["service", "download", "pdf", "vorbestellung", "formular", "schwibbogen", "material guide", "foto check"],
      imageTags: ["pdf", "formular", "download"],
      imageProjects: [
        { project: "Service Downloads", tags: ["pdf", "formular", "download"] }
      ],
      content: "Download-Bereich für Bestellformular, PDF-Hinweise, Vorbestellungen und perspektivisch Foto-Checks oder Material-Guides."
    },
    {
      title: "Kontakt & Anfrage",
      url: "/kontakt/",
      type: "Kontakt",
      section: "Anfrage stellen",
      summary: "Gravuridee mit Material, Motiv, Größe und Termin per WhatsApp oder E-Mail anfragen.",
      keywords: ["kontakt", "anfrage", "anfragen", "bestellen", "bestellung", "angebot", "angebot anfragen", "preis anfragen", "whatsapp", "email", "e-mail", "nachricht", "telefon", "motividee", "wunschmotiv", "sonderwunsch", "deadline", "termin", "datei senden", "foto senden"],
      imageTags: ["kontakt", "anfrage", "whatsapp", "email", "motividee"],
      imageProjects: [
        { project: "Anfrage-Builder", tags: ["kontakt", "anfrage", "material", "motiv", "termin"] }
      ],
      content: "Der Anfrage-Builder sammelt Material, Produktwunsch, Motiv, Größe und Deadline und bereitet eine Anfrage für WhatsApp oder E-Mail vor. Auch eine noch unfertige Idee reicht für den ersten Kontakt."
    },
    {
      title: "Ideen- und Diskussionspinnwand",
      url: "/ideenpinnwand/",
      type: "Mitmachen",
      section: "Ideen & Feedback",
      summary: "Ideen, Wünsche, Vorschläge und Diskussionsbeiträge öffentlich oder intern einreichen.",
      keywords: ["ideenpinnwand", "pinnwand", "idee einreichen", "idee teilen", "vorschlag", "wunsch", "feedback", "diskussion", "beitrag schreiben", "mitmachen", "produktidee", "motividee"],
      imageTags: ["idee", "feedback", "pinnwand", "beitrag"],
      imageProjects: [
        { project: "Ideenpinnwand", tags: ["idee", "wunsch", "feedback", "diskussion"] }
      ],
      content: "Auf der Pinnwand können Besucher eigene Ideen, Wünsche, Feedback und Diskussionsbeiträge öffentlich oder nicht öffentlich einreichen."
    },
    {
      title: "Über Luderbein",
      url: "/ueber/",
      type: "Seite",
      section: "Über uns",
      summary: "Handwerk, Haltung und die Geschichte hinter Luderbein Gravur.",
      keywords: ["über", "über uns", "über luderbein", "wer ist luderbein", "luderbein gravur", "werkstatt", "erzgebirge", "handwerk", "geschichte", "haltung"],
      imageTags: ["luderbein", "werkstatt", "handwerk", "erzgebirge"],
      imageProjects: [
        { project: "Über Luderbein", tags: ["luderbein", "werkstatt", "handwerk"] }
      ],
      content: "Informationen über Luderbein, die Werkstatt, den handwerklichen Anspruch und die Haltung hinter Gravur und Fertigung."
    },
    {
      title: "Motiv-Vorschau & Konfigurator",
      url: "/tools/vorschau/",
      type: "Tool",
      section: "Gestaltung & Preisvorschau",
      summary: "Material, Produkt, Motiv und Text auswählen und vor der Anfrage als unverbindliche Vorschau ansehen.",
      keywords: [
        "motiv",
        "motive",
        "motivvorschau",
        "motiv-vorschau",
        "vorschau",
        "vorschautool",
        "vorschau tool",
        "produktvorschau",
        "gravurvorschau",
        "konfigurator",
        "produkt konfigurieren",
        "produkt gestalten",
        "gestaltung",
        "design",
        "eigene datei",
        "bild hochladen",
        "foto hochladen",
        "motiv hochladen",
        "vorlage",
        "monogramm",
        "qr code",
        "text",
        "preisvorschau",
        "preis prüfen",
        "anfrage senden"
      ],
      imageTags: ["motiv", "vorschau", "gestaltung", "foto", "symbol", "monogramm", "qr code", "text"],
      imageProjects: [
        { project: "Motiv-Vorschau", tags: ["motiv", "vorschau", "konfigurator", "gestaltung", "produkt"] }
      ],
      content: "Im Vorschautool lassen sich Material, Produkt, Größe und Gestaltungsart wählen. Eigene Bilder, Motive, Vorlagen, Monogramme, QR-Codes oder kurze Texte können platziert, als unverbindliche Vorschau gespeichert und für eine Anfrage verwendet werden."
    },
    {
      title: "Kalkulator",
      url: "/tools/kalkulator/",
      type: "Tool",
      section: "Preis & Anfrage",
      summary: "Schiefer und Metall kalkulieren, Staffelpreise prüfen und Sammelanfrage starten.",
      keywords: ["kalkulator", "rechner", "preisrechner", "kostenrechner", "preis berechnen", "kosten berechnen", "kalkulieren", "preis", "schiefer", "metall", "staffelpreis", "anfrage", "gravur"],
      imageTags: ["preis", "kalkulation", "metall", "schiefer"],
      imageProjects: [
        { project: "Kalkulator", tags: ["preis", "kalkulation", "metall", "schiefer"] }
      ],
      content: "Hilft bei Preisrichtung, Staffelpreisen, Metall-Optionen und Sammelanfragen für Schiefer- und Metallprodukte."
    }
  ];
})();
