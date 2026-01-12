import { Ai } from "@cloudflare/ai";

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { prompt } = await request.json();
  if (!prompt) {
    return new Response(JSON.stringify({ error: "Kein Prompt" }), { status: 400 });
  }

  const ai = new Ai(env.AI);
  const fullPrompt = `${prompt}. Generate a simple black-and-white line art with minimal shading.`;
  const result = await ai.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
    prompt: fullPrompt
  });

  return new Response(JSON.stringify({ image: result }), {
    headers: { "Content-Type": "application/json" }
  });
}
