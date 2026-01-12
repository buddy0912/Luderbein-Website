DATEI: /functions/api/generate-image.js

// =========================================================
// Cloudflare Pages Function: /api/generate-image
// IMPORTANT: No "@cloudflare/ai" import (Pages build has no npm install)
// Uses Workers AI binding directly: context.env.AI.run(...)
// =========================================================

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env?.ALLOWED_ORIGIN || "").trim();

  // If ALLOWED_ORIGIN is configured, reflect only if it matches.
  if (allowed) {
    if (origin === allowed) {
      return {
        "Access-Control-Allow-Origin": origin,
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      };
    }
    // no CORS for other origins
    return {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    };
  }

  // Default: same-origin usage; for safety still reflect origin if present
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
}

function toBase64(uint8) {
  // Convert Uint8Array -> base64 without Buffer
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < uint8.length; i += chunk) {
    binary += String.fromCharCode(...uint8.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function onRequest(context) {
  const { request, env } = context;

  // Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, corsHeaders(request, env));
  }

  // Basic body guard
  let bodyText = "";
  try {
    bodyText = await request.text();
    if (bodyText.length > 12000) {
      return json({ error: "Request too large" }, 413, corsHeaders(request, env));
    }
  } catch (_) {
    return json({ error: "Invalid request body" }, 400, corsHeaders(request, env));
  }

  let payload = {};
  try {
    payload = bodyText ? JSON.parse(bodyText) : {};
  } catch (_) {
    return json({ error: "Invalid JSON" }, 400, corsHeaders(request, env));
  }

  const promptRaw = (payload.prompt || "").toString().trim();
  if (!promptRaw) {
    return json({ error: "Missing prompt" }, 400, corsHeaders(request, env));
  }

  // Model: allow override via env, else safe default
  const MODEL = (env?.IMAGE_MODEL || "").trim() || "@cf/stabilityai/stable-diffusion-xl-base-1.0";

  // Style: keep it minimalist/engraving-friendly, but don’t overwrite user intent
  const prompt = `minimalist engraving preview, monochrome, high contrast, clean lines, no background, centered motif. ${promptRaw}`.trim();

  try {
    if (!env || !env.AI || typeof env.AI.run !== "function") {
      return json({ error: "Workers AI binding (env.AI) not configured." }, 500, corsHeaders(request, env));
    }

    // Keep inputs minimal for broad model compatibility
    const result = await env.AI.run(MODEL, { prompt });

    // Handle multiple possible result shapes
    // 1) base64 already
    if (typeof result === "string") {
      return json({ image: result, mime: "image/png" }, 200, corsHeaders(request, env));
    }

    // 2) common object shape: { image: "base64", mime? }
    if (result && typeof result === "object" && typeof result.image === "string") {
      return json(
        { image: result.image, mime: result.mime || "image/png" },
        200,
        corsHeaders(request, env)
      );
    }

    // 3) bytes
    if (result instanceof ArrayBuffer) {
      const b64 = toBase64(new Uint8Array(resu
