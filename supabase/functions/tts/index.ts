// Voz neuronal japonesa (Google Cloud Text-to-Speech). Requiere el secreto GOOGLE_TTS_KEY.
import { cors, json, requireUser } from "../_shared.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await requireUser(req); if (!user) return json({ error: "sin sesión" }, 401);
    const { text, voice } = await req.json();
    if (!text || typeof text !== "string" || text.length > 1500) return json({ error: "texto vacío o demasiado largo" }, 400);
    const key = Deno.env.get("GOOGLE_TTS_KEY");
    if (!key) return json({ error: "sin GOOGLE_TTS_KEY" }, 500);
    const name = typeof voice === "string" && /^ja-JP-[A-Za-z0-9-]+$/.test(voice) ? voice : "ja-JP-Neural2-B";
    const r = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize?key=" + key, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: { text }, voice: { languageCode: "ja-JP", name }, audioConfig: { audioEncoding: "MP3", speakingRate: 0.95 } }),
    });
    if (!r.ok) return json({ error: "Google TTS " + r.status + " " + (await r.text()).slice(0, 200) }, 502);
    const out = await r.json();
    return json({ audio: out.audioContent });
  } catch (e) { return json({ error: String(e) }, 500); }
});
