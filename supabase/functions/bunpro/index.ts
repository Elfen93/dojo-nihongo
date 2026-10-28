// Puente a la API de Bunpro (el navegador no puede llamarla directamente por CORS).
// Prueba las variantes conocidas de la API y devuelve siempre 200 con diagnóstico.
Deno.serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
  const json = (b: unknown) => new Response(JSON.stringify(b), { headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { key } = await req.json();
    if (!key || typeof key !== "string" || key.length > 200) return json({ error: "clave no válida" });
    const k = encodeURIComponent(key.trim());
    const attempts: { name: string; url: string; headers?: Record<string, string> }[] = [
      { name: "v3 all_reviews", url: "https://bunpro.jp/api/v3/reviews/all_reviews_total", headers: { Authorization: "Token token=" + key.trim() } },
      { name: "v3 current", url: "https://bunpro.jp/api/v3/reviews/current_reviews", headers: { Authorization: "Token token=" + key.trim() } },
      { name: "v4 all_reviews", url: "https://bunpro.jp/api/v4/reviews/all_reviews_total", headers: { Authorization: "Token token=" + key.trim() } },
      { name: "legacy all_reviews", url: `https://bunpro.jp/api/user/${k}/all_reviews` },
      { name: "legacy recent", url: `https://bunpro.jp/api/user/${k}/recent_items/5000` },
    ];
    const diag: string[] = [];
    for (const a of attempts) {
      try {
        const r = await fetch(a.url, { headers: { Accept: "application/json", ...(a.headers || {}) } });
        const text = await r.text();
        if (!r.ok) { diag.push(`${a.name}: ${r.status}`); continue; }
        let j: any; try { j = JSON.parse(text); } catch { diag.push(`${a.name}: respuesta no JSON`); continue; }
        const arr: any[] = Array.isArray(j) ? j : (j.reviews || j.data || j.items || j.requested_studies || []);
        if (!arr.length) { diag.push(`${a.name}: 0 elementos (claves: ${Object.keys(j).slice(0, 8).join(",")})`); continue; }
        const items = arr.map((x: any) => {
          const gp = x.grammar_point || x.grammarPoint || x.grammar || {};
          const title = gp.title || gp.name || x.title || x.grammar_point_title || x.name || "";
          const correct = Number(x.times_correct ?? x.correct ?? 0), incorrect = Number(x.times_incorrect ?? x.incorrect ?? 0);
          const srs = Number(x.srs_stage ?? x.streak ?? x.stage ?? x.level ?? Math.max(1, Math.min(12, correct - incorrect)));
          return { title, meaning: gp.meaning || "", srs: isFinite(srs) ? srs : 1, id: gp.id || x.grammar_point_id || "" };
        }).filter((i: any) => i.title);
        diag.push(`${a.name}: OK, ${arr.length} elementos, ${items.length} con título (claves: ${Object.keys(arr[0]).slice(0, 10).join(",")})`);
        return json({ items, date: new Date().toISOString(), diag: diag.join(" | ") });
      } catch (e) { diag.push(`${a.name}: ${String(e).slice(0, 80)}`); }
    }
    return json({ error: "Ningún endpoint de Bunpro respondió. " + diag.join(" | ") });
  } catch (e) { return json({ error: String(e) }); }
});
