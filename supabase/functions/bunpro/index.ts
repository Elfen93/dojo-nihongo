// Puente a la API de Bunpro. Sondea versiones y formas de autenticación y devuelve diagnóstico.
Deno.serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
  const json = (b: unknown) => new Response(JSON.stringify(b), { headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { key } = await req.json();
    if (!key || typeof key !== "string" || key.length > 200) return json({ error: "clave no válida" });
    const kk = key.trim();
    const auths: Record<string, Record<string, string>> = {
      token: { Authorization: "Token token=" + kk },
      bearer: { Authorization: "Bearer " + kk },
      apikey: { "X-Api-Key": kk, "api-key": kk },
    };
    const paths = [
      "/api/v5/user", "/api/v5/reviews/current_reviews", "/api/v5/reviews/all_reviews_total", "/api/v5/study_queue", "/api/v5/grammar_points",
      "/api/v4/user", "/api/v4/reviews/all_reviews_total", "/api/v4/reviews/current_reviews",
      "/api/v3/user", "/api/v3/reviews/all_reviews_total", "/api/v3/reviews/current_reviews", "/api/v3/study_queue",
      "/api/frontend/user", "/api/frontend/reviews",
    ];
    const diag: string[] = [];
    const ua = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36", Accept: "application/json" };
    for (const p of paths) {
      for (const [an, ah] of Object.entries(auths)) {
        try {
          const r = await fetch("https://bunpro.jp" + p, { headers: { ...ua, ...ah } });
          const text = await r.text();
          const short = `${p} [${an}] ${r.status}`;
          if (!r.ok) { diag.push(short); continue; }
          let j: any; try { j = JSON.parse(text); } catch { diag.push(short + " no-JSON"); continue; }
          const arr: any[] = Array.isArray(j) ? j : (j.reviews || j.data || j.items || j.requested_studies || j.grammar_points || []);
          diag.push(short + ` OK claves=${Object.keys(j).slice(0, 10).join(",")} n=${Array.isArray(arr) ? arr.length : "?"}` + (Array.isArray(arr) && arr[0] ? ` elem=${Object.keys(arr[0]).slice(0, 12).join(",")}` : ""));
          if (Array.isArray(arr) && arr.length && /reviews|queue/.test(p)) {
            const items = arr.map((x: any) => {
              const gp = x.grammar_point || x.grammarPoint || x.grammar || x.study_question?.grammar_point || {};
              const title = gp.title || gp.name || x.title || x.grammar_point_title || "";
              const correct = Number(x.times_correct ?? 0), incorrect = Number(x.times_incorrect ?? 0);
              const srs = Number(x.srs_stage ?? x.streak ?? x.stage ?? Math.max(1, Math.min(12, correct - incorrect)));
              return { title, srs: isFinite(srs) ? srs : 1, id: gp.id || x.grammar_point_id || "" };
            }).filter((i: any) => i.title);
            if (items.length) return json({ items, date: new Date().toISOString(), diag: diag.join(" | ") });
          }
        } catch (e) { diag.push(`${p} [${an}] ${String(e).slice(0, 60)}`); }
      }
    }
    return json({ error: "Sin datos de Bunpro. " + diag.join(" | ") });
  } catch (e) { return json({ error: String(e) }); }
});
