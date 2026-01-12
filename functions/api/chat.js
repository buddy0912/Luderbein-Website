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

function findFirstLabel(normalizedText, list) {
  for (const item of list) {
    if (item.terms.some((term) => normalizedText.includes(term))) {
      return item.label;
    }
  }
  return "";
}

function extractQuantity(text) {
  const match = text.match(/\b(\d{1,4})\s*(stueck|stück|stk|exemplare|teile|pcs)\b/i);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return "";
}

function extractDeadline(text) {
  const dateMatch = text.match(/\b\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?\b/);
  if (dateMatch) {
    return dateMatch[0];
  }
  const phraseMatch = text.match(/\b(bis|sp[aä]testens|zum|termin|deadline|lieferung|fertig|abholung)\b[^.!?\n]{0,48}/i);
  return phraseMatch ? phraseMatch[0].trim() : "";
}

function extractSpecial(text) {
  const match = text.match(/\b(sonder\w*|spezial\w*|extra\w*|wunsch\w*|individuell\w*|bitte)\b[^.!?\n]{0,64}/i);
  return match ? match[0].trim() : "";
}

function extractDetailsFromMessages(messages) {
  const convoText = messages.map((m) => m.content).join("\n");
  const normalizedText = normalize(convoText);

  const product = findFirstLabel(normalizedText, [
    { label: "Schlüsselanhänger", terms: ["schluesselanhaenger", "schluessel", "anhaenger"] },
    { label: "Geschenkset", terms: ["geschenkset", "geschenk box", "geschenkbox"] },
    { label: "Schwibbogen", terms: ["schwibbogen"] },
    { label: "Holzlampe", terms: ["holzlampe"] },
    { label: "Lampe", terms: ["lampe", "leuchte"] },
    { label: "Schild", terms: ["schild", "plakette", "typenschild"] },
    { label: "Schieferplatte", terms: ["schieferplatte", "schiefer"] },
    { label: "Acrylschild", terms: ["acrylschild", "acryl", "plexi"] },
    { label: "Holzprodukt", terms: ["holz"] },
    { label: "Metallprodukt", terms: ["metall", "edelstahl", "alu", "aluminium", "messing"] }
  ]) || "Unklar";

  const material = findFirstLabel(normalizedText, [
    { label: "Holz", terms: ["holz"] },
    { label: "Metall", terms: ["metall", "edelstahl", "alu", "aluminium", "messing"] },
    { label: "Schiefer", terms: ["schiefer"] },
    { label: "Acryl", terms: ["acryl", "plexi"] }
  ]) || "Unklar";

  const textNegative = /(?:kein|keine|ohne)\s+(text|motiv|foto|bild|logo|gravur|schrift)/.test(normalizedText);
  const textPositive = /(text|motiv|foto|bild|logo|gravur|schrift)/.test(normalizedText);
  const textMotif = textNegative ? "Nein" : (textPositive ? "Ja" : "Unklar");

  const quantity = extractQuantity(convoText) || "Unklar";
  const deadline = extractDeadline(convoText) || "Unklar";

  const missing = [];
  if (product === "Unklar") missing.push("Produkt");
  if (material === "Unklar") missing.push("Material");
  if (textMotif === "Unklar") missing.push("Text/Motiv/Foto");
  if (quantity === "Unklar") missing.push("Menge");
  if (deadline === "Unklar") missing.push("Termin");

  return {
    product,
    material,
    textMotif,
    quantity,
    deadline,
    missing
  };
}

function buildSummaryLines(details) {
  return [
    `• Produkt: ${details.product}`,
    `• Material: ${details.material}`,
    `• Text/Motiv/Foto: ${details.textMotif}`,
    `• Menge: ${details.quantity}`,
    `• Termin: ${details.deadline}`
  ];
}

function buildHandoff(details) {
  const summary = buildSummaryLines(details).join("\n");
  return {
    subject: `Gravur-Anfrage: ${details.product} aus ${details.material}`,
    mailBody: `Hallo Luderbein,

hier die Eckdaten meiner Anfrage:
${summary}

Vielen Dank!`,
    whatsappText: `Hallo Luderbein, hier die Eckdaten meiner Anfrage:
${summary}`
  };
}

function buildMissingQuestion(details) {
  const nextMissing = details.missing[0] || "";
  switch (nextMissing) {
    case "Produkt":
      return "Danke! Welches Produkt wünschst du dir (z. B. Schlüsselanhänger, Schild, Geschenkset)?";
    case "Material":
      return "Welches Material möchtest du verwenden (Holz, Metall, Schiefer oder Acryl)?";
    case "Text/Motiv/Foto":
      return "Welchen Text, welches Motiv oder Foto soll graviert werden?";
    case "Menge":
      return "Wie viele Stück brauchst du ungefähr?";
    case "Termin":
      return "Bis wann benötigst du die Gravur?";
    default:
      return "Kannst du mir noch kurz die fehlenden Eckdaten nennen?";
  }
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

function buildSystemPrompt() {
  return [
    "Du bist „LuderBot“, der Chat-Assistent von Luderbein, einem Gravur- und Laserdienstleister.",
    "",
    "Unser Angebot: Gravuren auf Holz, Metall, Schiefer, Acryl und Geschenksets. Wir verkaufen KEINE Gravur- oder Lasermaschinen.",
    "",
    "Ziel: Sammle freundlich diese Eckdaten: Produkt/Art, Material, Text/Motiv/Fotos, Menge, Termin. Frage nur eine Sache auf einmal, und nur wenn etwas fehlt.",
    "Erfinde keine Produkte oder Dienstleistungen, die wir nicht anbieten.",
    "",
    "Wenn alle Eckdaten vorliegen, gib eine kurze Zusammenfassung zurück und ein suggestion/handoff-Objekt mit subject, mailBody und whatsappText.",
    "Wenn noch Informationen fehlen, gib nur reply mit einer höflichen Frage und KEIN suggestion/handoff.",
    ""
  ].join("\n");
}

function buildAiMessages(messages) {
  return [{ role: "system", content: buildSystemPrompt() }, ...messages];
}

async function generateReply(env, messages) {
  if (!env || !env.AI) {
    throw new Error("AI binding fehlt.");
  }

  const model = (env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct").trim();
  const result = await env.AI.run(model, {
    messages: buildAiMessages(messages)
  });

  const reply =
    result?.response ||
    result?.result?.response ||
    result?.output_text ||
    result?.text ||
    "";

  if (!reply.trim()) {
    throw new Error("Leere Antwort vom Modell.");
  }

  return reply.trim();
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

  if (!raw.trim()) {
    return json({ error: "Body fehlt." }, 400, { ...cors });
  }

  if (raw.length > MAX_BODY_CHARS) {
    return json({ error: "Payload zu groß." }, 413, { ...cors });
  }

  const body = safeJsonParse(raw);
  if (!body || typeof body !== "object") {
    return json({ error: "Ungültiges JSON." }, 400, { ...cors });
  }

  const incomingMessages = Array.isArray(body.messages) ? body.messages : null;
  if (!incomingMessages || incomingMessages.length === 0) {
    return json({ error: "messages fehlen." }, 400, { ...cors });
  }

  if (!env.OPENAI_API_KEY) {
    return json(
      { reply: "Entschuldigung, unsere KI ist gerade offline. Bitte später erneut versuchen." },
      200,
      { ...cors }
    );
  }

  const userMessages = clampMessages(incomingMessages);
  if (userMessages.length === 0) {
    return json({ error: "Keine Nachrichten gefunden." }, 400, { ...cors });
  }

  try {
    const details = extractDetailsFromMessages(userMessages);
    const hasAllDetails = details.missing.length === 0;

    if (!hasAllDetails) {
      return json(
        {
          reply: buildMissingQuestion(details)
        },
        200,
        { ...cors }
      );
    }

    const summary = buildSummaryLines(details).join("\n");
    return json(
      {
        reply: `Danke! Hier ist die Zusammenfassung deiner Anfrage:\n${summary}`,
        suggestion: buildHandoff(details)
      },
      200,
      { ...cors }
    );
  } catch (error) {
    return json(
      { reply: "Entschuldigung, unsere KI ist gerade offline. Bitte später erneut versuchen." },
      200,
      { ...cors }
    );
  }
}
