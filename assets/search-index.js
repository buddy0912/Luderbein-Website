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
      keywords: ["schiefer foto", "fotogravur", "portrait", "haustier", "tier", "erinnerung", "foto check"],
      imageTags: ["portrait", "haustier", "foto", "schiefer", "gravur"],
      imageProjects: [
        { project: "Schiefer Fotogravur", tags: ["portrait", "haustier", "foto", "schiefer"] }
      ],
      content: "Geeignet für Portraits, Tiermotive und Erinnerungsfotos mit kontrastreicher Vorbereitung und persönlicher Abstimmung."
    },
    {
      title: "Schiefer-Gedenktafeln",
      url: "/leistungen/schiefer/",
      type: "Produktart",
      section: "Schiefer Gedenken",
      summary: "Würdige kleine Ahnentafeln und Gedenkplatten auf Schiefer.",
      modalTarget: { product: "Schiefer", variant: "Gedenktafel" },
      keywords: ["gedenktafel", "gedenkplatte", "ahnentafel", "ahnentafeln", "ahnen", "erinnerung", "trauer", "schiefer"],
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
      keywords: ["hundemarke", "hundemarken", "haustier", "tiermarke", "tag", "anhänger", "qr", "metall"],
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
      keywords: ["metallschild", "schild", "plakette", "business", "visitenkarte", "branding", "werkstatt", "qr", "b2b"],
      imageTags: ["plakette", "schild", "branding", "metall", "visitenkarte"],
      imageProjects: [
        { project: "Business Plaketten", tags: ["plakette", "schild", "branding", "visitenkarte"] }
      ],
      content: "Metall-Schilder und Business-Plaketten für Werkstatt, Unternehmen, Branding, QR-Codes, Kennzeichnung und professionelle Anwendungen."
    },
    {
      title: "Holzgravur",
      url: "/leistungen/holz/",
      type: "Leistung",
      section: "Material Holz",
      summary: "Schilder, Deko, Schlüsselanhänger und kleine Serien aus Holz.",
      keywords: ["holz", "holzgravur", "schild", "deko", "schlüsselanhänger", "serie", "geschenk", "laser"],
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
      keywords: ["acryl", "acrylgravur", "schild", "label", "beschriftung", "serie", "qr"],
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
      keywords: ["glas", "glasgravur", "weinglas", "weingläser", "glasgeschenk", "erinnerungsglas", "datum", "anlass"],
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
      keywords: ["weinglas", "weingläser", "hochzeit", "geschenk", "datum", "name", "anlass", "glas"],
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
      keywords: ["custom", "sonderanfertigung", "sonderwunsch", "prototyp", "mischmaterial", "lampe", "schmuck", "freie idee"],
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
      summary: "Schwibbögen mit Charakter, sauberer Verarbeitung und Anfrage-Kalkulator.",
      keywords: ["schwibbogen", "schwibbögen", "erzgebirge", "lichtbogen", "geschenk", "dimmer", "geschenkset", "konfigurator"],
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
      content: "Fertiger Schwibbogen mit Design-Vorgabe, Preispunkt, Anfrage-Kalkulator und optionalen Upgrades wie Dimmer oder Geschenkset."
    },
    {
      title: "Schwibbogen-Konfigurator",
      url: "/tools/schwibbogen-konfigurator/",
      type: "Tool",
      section: "Schwibbogen Anfrage",
      summary: "Variante, Upgrades, Geschenkset und Deadline für Schwibbögen konfigurieren.",
      keywords: ["konfigurator", "schwibbogen", "dimmer", "deadline", "geschenkset", "vorbestellung"],
      imageTags: ["schwibbogen", "konfiguration", "upgrade", "geschenkset"],
      imageProjects: [
        { project: "Schwibbogen Konfigurator", tags: ["konfiguration", "upgrade", "geschenkset", "schwibbogen"] }
      ],
      content: "Tool zur Anfrage für Schwibbögen mit Varianten, Upgrades, Deadline und Geschenkset."
    },
    {
      title: "B2B-Lösungen",
      url: "/b2b/",
      type: "B2B",
      section: "Geschäftskunden",
      summary: "B2B für Industrie, Handwerk, Gastronomie und Werkstätten.",
      keywords: ["b2b", "geschäftskunden", "business", "industrie", "handwerk", "gastronomie", "werkstatt", "branding"],
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
      title: "Kalkulator",
      url: "/tools/kalkulator/",
      type: "Tool",
      section: "Preis & Anfrage",
      summary: "Schiefer und Metall kalkulieren, Staffelpreise prüfen und Sammelanfrage starten.",
      keywords: ["kalkulator", "preis", "schiefer", "metall", "staffelpreis", "anfrage", "gravur"],
      imageTags: ["preis", "kalkulation", "metall", "schiefer"],
      imageProjects: [
        { project: "Kalkulator", tags: ["preis", "kalkulation", "metall", "schiefer"] }
      ],
      content: "Hilft bei Preisrichtung, Staffelpreisen, Metall-Optionen und Sammelanfragen für Schiefer- und Metallprodukte."
    }
  ];
})();
