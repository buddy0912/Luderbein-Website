import { Ai } from "@cloudflare/ai";

export async function onRequest({ request, env }) {
  const ai = new Ai(env.AI);
  const { prompt } = await request.json().catch(() => ({}));
  if (!prompt) {
    return new Response(JSON.stringify({ error: "Kein Prompt" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  const fullPrompt = `${prompt}. simple black-and-white line art with minimal shading.`;
  const result = await ai.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
    prompt: fullPrompt
  });
  return new Response(JSON.stringify({ image: result }), {
    headers: { "content-type": "application/json" }
  });
}
