// =========================================================
// Cloudflare Pages Function: /api/generate-image
// Minimalistische Gravur-Vorschau via Workers AI
// =========================================================

const MAX_BODY_CHARS = 6000;
const MAX_PROMPT_CHARS = 600;

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

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function extractBase64Image(result) {
  if (!result) return "";
  if (typeof result === "string") return result;
  if (result instanceof ArrayBuffer) return arrayBufferToBase64(result);
  if (ArrayBuffer.isView(result)) return arrayBufferToBase64(result.buffer);
  if (result.image) return result.image;
  if (result.result?.image) return result.result.image;
  if (result.data?.[0]?.b64_json) return result.data[0].b64_json;
  return "";
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
  const prompt = String(body.prompt || "").trim().slice(0, MAX_PROMPT_CHARS);

  if (!prompt) {
    return json({ error: "Prompt fehlt." }, 400, { ...cors });
  }

  if (!env || !env.AI) {
    return json({ error: "AI binding fehlt." }, 500, { ...cors });
  }

  try {
    const model = (env.AI_IMAGE_MODEL || "@cf/stabilityai/stable-diffusion-xl-base-1.0").trim();
    const result = await env.AI.run(model, {
      prompt,
      negative_prompt: "fotorealistisch, bunte farben, 3d, render, watermark",
      num_steps: 18,
      guidance: 7,
      width: 768,
      height: 512
    });

    const image = extractBase64Image(result);
    if (!image) {
      return json({ error: "Bild konnte nicht erzeugt werden." }, 502, { ...cors });
    }

    return json({ image, mime: "image/png" }, 200, { ...cors });
  } catch (error) {
    return json({ error: "Bild konnte nicht erzeugt werden. Bitte erneut versuchen." }, 502, { ...cors });
  }
}
