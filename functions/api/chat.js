// =========================================================
// Cloudflare Pages Function: /api/chat  (Workers AI only)
// Datei: /functions/api/chat.js
// =========================================================

const MAX_BODY_CHARS = 12000;
const MAX_MESSAGES = 18;
const MAX_CONTENT_CHARS = 1400;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGIN || "").trim();

  if (allowed) {
    if (origin === allowed) {
      return {
        "Access-Control-Allow-Origin": origin,
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      };
    }
    return {};
  }

  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      }
    : {
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      };
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function clampMessages(messages) {
  if (!Array.isArray(messages)) return [];
  const sliced = messages.slice(-MAX_MESSAGES);

  return sliced
    .map((m) => {
      const role = (m && m.role) || "user";
      const content = String((m && m.content) || "").slice(0, MAX_CONTENT_CHARS);
      if (!content.trim()) return null;
      if (!["user", "assistant"].includes(role)) return null;
      return { role, content };
    })
    .filter(Boolean);
}

function inferSubjectFromText(text) {
  const t = (text || "").toLowerCase();
  const material =
    t.includes("schiefer") ? "Schiefer" :
    (t.includes("metall") || t.includes("edelstahl") || t.includes("alu")) ? "Metall" :
    t.includes("acryl") ? "Acryl" :
    t.includes("glas") ? "Glas" :
    t.includes("holz") ? "Holz" :
    (t.includes("lampe") || t.includes("leuchte")) ? "Lampenbau" :
    (t.includes("schwibbogen") || t.includes("schwibbögen")) ? "Schwibbogen" :
    (t.includes("3d") || t.includes("druck")) ? "3D-Druck" :
    "Luderbein";

  const item =
    t.includes("plakette") ? "Plakette" :
    t.includes("schlüssel") ? "Schlüsselanhänger" :
    t.includes("schild") ? "Schild" :
    t.includes("gedenk") ? "Gedenkstück" :
    t.includes("generator") || t.includes("kalkulator") ? "Kalkulator" :
    "Anfrage";

  return `Luderbein Anfrage – ${material} – ${item}`;
}

function buildSuggestionFromMessages(messages) {
  const convo = messages.map(m => `${m.role}: ${m.content}`).join("\n");
  const subject = inferSubjectFromText(convo);
  const mailBody = `Hi Luderbein,\n\nich möchte anfragen:\n\n${convo}\n\nViele Grüße`;
  const whatsappText = `Hi! Kurze Anfrage:\n\n${convo}`;
  return {
    subject,
    mailBody,
    whatsappText,
    text: whatsappText
  };
}

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[ä]/g, "ae")
    .replace(/[ö]/g, "oe")
    .replace(/[ü]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, list) {
  return list.some((term) => text.includes(term));
}

function classifyIntent(text) {
  const t = normalize(text);
  const offTopic = includesAny(t, [
    "30jaehrig",
    "dreissigjaehrig",
    "krieg",
    "geschichte",
    "politik",
    "medizin",
    "arzt",
    "recht",
    "anwalt",
    "promi",
    "prominent",
    "beruehmt",
    "wikipedia"
  ]);

  const indecisive = includesAny(t, [
    "weiss nicht",
    "weis nicht",
    "keine ahnung",
    "keine idee",
    "unsicher",
    "unschluessig",
    "egal",
    "planlos"
  ]);

  const categories = [
    { key: "holz", terms: ["holz", "schwibbogen"] },
    { key: "metall", terms: ["metall", "edelstahl", "alu", "aluminium"] },
    { key: "glas", terms: ["glas"] },
    { key: "acryl", terms: ["acryl", "plexi"] },
    { key: "schiefer", terms: ["schiefer"] },
    { key: "lampe", terms: ["lampe", "leuchte", "lampen"] },
    { key: "schmuck", terms: ["schmuck", "anhanger", "anhaenger"] },
    { key: "geschenk", terms: ["geschenk", "geschenkidee", "praesent"] },
    { key: "gravur", terms: ["gravur", "laser", "gravieren", "graviert"] }
  ];

  const category = categories.find((c) => includesAny(t, c.terms))?.key || null;
  return { offTopic, indecisive, category };
}

function buildSuggestions(category) {
  switch (category) {
    case "holz":
      return {
        question: "Soll es eher ein Schild, eine Box oder ein Schwibbogen werden?",
        suggestions: [
          { label: "Graviertes Holzschild", link: "/leistungen/holz/" },
          { label: "Personalisierte Holzbox", link: "/leistungen/holz/" },
          { label: "Schwibbogen als Sonderanfertigung", link: "/leistungen/custom/" }
        ]
      };
    case "metall":
      return {
        question: "Welche Oberfläche passt besser: Edelstahl, Aluminium oder Messing?",
        suggestions: [
          { label: "Metallplakette mit Logo", link: "/leistungen/metall/" },
          { label: "Graviertes Typenschild", link: "/leistungen/metall/" },
          { label: "Namensschild für Werkstatt/Shop", link: "/leistungen/metall/" }
        ]
      };
    case "glas":
      return {
        question: "Soll die Gravur eher dezent oder als Blickfang wirken?",
        suggestions: [
          { label: "Graviertes Glas-Accessoire", link: "/leistungen/glas/" },
          { label: "Glasplatte mit Motiv", link: "/leistungen/glas/" },
          { label: "Personalisierte Glaskante", link: "/leistungen/glas/" }
        ]
      };
    case "acryl":
      return {
        question: "Eher klar, satiniert oder farbiges Acryl?",
        suggestions: [
          { label: "Acryl-Schild mit Logo", link: "/leistungen/acryl-schilder/" },
          { label: "Acryl-Display für Deko", link: "/leistungen/acryl/" },
          { label: "Personalisierter Acryl-Aufsteller", link: "/leistungen/acryl/" }
        ]
      };
    case "schiefer":
      return {
        question: "Welche Größe schwebt dir vor?",
        suggestions: [
          { label: "Schieferplatte mit Gravur", link: "/leistungen/schiefer/" },
          { label: "Schiefer-Gedenkstück", link: "/leistungen/schiefer/" },
          { label: "Schiefer-Tafel mit Wunschtext", link: "/leistungen/schiefer-text/" }
        ]
      };
    case "lampe":
      return {
        question: "Soll es eine Tischlampe oder eine Wand-/Deckenleuchte werden?",
        suggestions: [
          { label: "Individuelle Leuchte (Sonderanfertigung)", link: "/leistungen/custom/" },
          { label: "Leuchte mit graviertem Element", link: "/leistungen/holz/" },
          { label: "Design-Leuchte mit Logo/Motiv", link: "/leistungen/custom/" }
        ]
      };
    case "schmuck":
      return {
        question: "Aus welchem Material soll der Schmuck sein?",
        suggestions: [
          { label: "Metall-Anhänger mit Gravur", link: "/leistungen/metall/" },
          { label: "Acryl-Anhänger mit Namen", link: "/leistungen/acryl/" },
          { label: "Holz-Anhänger mit Motiv", link: "/leistungen/holz/" }
        ]
      };
    case "geschenk":
      return {
        question: "Für wen ist das Geschenk gedacht?",
        suggestions: [
          { label: "Schieferplatte mit Wunschtext", link: "/leistungen/schiefer/" },
          { label: "Acryl-Schild mit Gravur", link: "/leistungen/acryl-schilder/" },
          { label: "Graviertes Holzstück", link: "/leistungen/holz/" }
        ]
      };
    default:
      return {
        question: "Welches Material oder Produkt schwebt dir vor?",
        suggestions: [
          { label: "Holzgravur", link: "/leistungen/holz/" },
          { label: "Acryl- oder Glasschnitt", link: "/leistungen/acryl/" },
          { label: "Metallgravur", link: "/leistungen/metall/" }
        ]
      };
  }
}

function buildReply(messages) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const intent = classifyIntent(lastUser);

  if (intent.offTopic) {
    return {
      reply:
        "Dazu kann ich dir nicht helfen – ich bin auf Gravur, Laser & Sonderanfertigungen bei Luderbein spezialisiert. Schau gern hier vorbei: /leistungen/ (z.B. /leistungen/holz/, /leistungen/metall/) – oder schreib direkt über /kontakt/.",
      suggestion: buildSuggestionFromMessages(messages)
    };
  }

  if (intent.indecisive) {
    return {
      reply:
        "Kein Stress! Wenn du noch unschlüssig bist, stöbere kurz auf /leistungen/ und den Unterseiten wie /leistungen/holz/, /leistungen/acryl/, /leistungen/schiefer/ oder /leistungen/metall/. Wenn du magst, klären wir alles direkt über /kontakt/.",
      suggestion: buildSuggestionFromMessages(messages)
    };
  }

  const { question, suggestions } = buildSuggestions(intent.category);
  const suggestionLines = suggestions
    .slice(0, 3)
    .map((item) => `- ${item.label} (${item.link})`)
    .join("\n");

  const replyParts = [
    "Alles klar – hier ein paar konkrete Ideen:",
    suggestionLines,
    question ? `Kurze Rückfrage: ${question}` : null,
    "Wenn das passt, schick mir kurz die Eckdaten über /kontakt/."
  ].filter(Boolean);

  return {
    reply: replyParts.join("\n"),
    suggestion: buildSuggestionFromMessages(messages)
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  const cors = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...cors } });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, { ...cors });
  }

  if ((env.ALLOWED_ORIGIN || "").trim()) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== env.ALLOWED_ORIGIN.trim()) {
      return json({ error: "Origin nicht erlaubt." }, 403, { ...cors });
    }
  }

  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return json({ error: "Body konnte nicht gelesen werden." }, 400, { ...cors });
  }

  if (raw.length > MAX_BODY_CHARS) {
    return json({ error: "Payload zu groß." }, 413, { ...cors });
  }

  const body = safeJsonParse(raw || "{}") || {};
  const incomingMessages = Array.isArray(body.messages)
    ? body.messages
    : typeof body.message === "string"
      ? [{ role: "user", content: body.message }]
      : [];

  if (!incomingMessages.length) {
    return json({ error: "Bitte JSON senden: { messages: [...] }" }, 400, { ...cors });
  }

  const userMessages = clampMessages(incomingMessages);
  if (userMessages.length === 0) {
    return json({ error: "Keine Nachrichten gefunden." }, 400, { ...cors });
  }

  const response = buildReply(userMessages);
  return json(response, 200, { ...cors });
}
