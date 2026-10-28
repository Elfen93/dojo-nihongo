// Puente a la API de Bunpro (el navegador no puede llamarla directamente por CORS).
// Desplegar: supabase functions deploy bunpro
Deno.serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { key } = await req.json();
    if (!key || typeof key !== "string" || key.length > 200) return new Response(JSON.stringify({ error: "clave no válida" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    const r = await fetch(`https://bunpro.jp/api/user/${encodeURIComponent(key)}/all_reviews`);
    if (!r.ok) return new Response(JSON.stringify({ error: "Bunpro " + r.status }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    const j = await r.json();
    const reviews = j.reviews || j.data || [];
    const items = reviews.map((x: any) => {
      const gp = x.grammar_point || {};
      const correct = x.times_correct ?? 0, incorrect = x.times_incorrect ?? 0;
      const srs = x.srs_stage ?? x.streak ?? Math.max(1, Math.min(12, correct - incorrect));
      return { title: gp.title || x.title || "", meaning: gp.meaning || "", srs, level: gp.level || "" };
    }).filter((i: any) => i.title);
    return new Response(JSON.stringify({ items, date: new Date().toISOString() }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
