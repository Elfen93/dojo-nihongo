// Genera el contenido de un nivel N3–N1 con la API de Claude. Requiere el secreto ANTHROPIC_API_KEY.
// Desplegar: supabase secrets set ANTHROPIC_API_KEY=sk-ant-... && supabase functions deploy generate
import { createClient } from "npm:@supabase/supabase-js@2";
Deno.serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    // Solo usuarios con sesión
    const auth = req.headers.get("Authorization") || "";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "sin sesión" }, 401);
    const { lv, prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 20000) return json({ error: "prompt no válido" }, 400);
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) return json({ error: "falta ANTHROPIC_API_KEY en el servidor" }, 500);
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 16000, messages: [{ role: "user", content: prompt }] }),
    });
    if (!r.ok) return json({ error: "Claude " + r.status + " " + (await r.text()).slice(0, 200) }, 502);
    const out = await r.json();
    const text = (out.content || []).map((c: any) => c.text || "").join("");
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return json({ error: "respuesta sin JSON" }, 502);
    const parsed = JSON.parse(m[0]);
    parsed.lv = lv;
    return json(parsed);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
