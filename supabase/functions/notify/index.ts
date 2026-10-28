// Envía notificaciones push a cada usuario según sus repasos pendientes y su examen semanal.
// Programada cada hora (ver supabase/notify.sql). Requiere VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY y SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { cors, json } from "../_shared.ts";
const STAGE_HOURS = [0, 4, 8, 24, 48, 168, 336, 720, 2880, Infinity];
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const secret = Deno.env.get("NOTIFY_SECRET") || "";
    const given = req.headers.get("x-notify-secret") || new URL(req.url).searchParams.get("secret") || "";
    if (!secret || given !== secret) return json({ error: "no autorizado" }, 401);
    webpush.setVapidDetails("mailto:dojo@example.com", Deno.env.get("VAPID_PUBLIC_KEY")!, Deno.env.get("VAPID_PRIVATE_KEY")!);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: subs, error } = await admin.from("push_subs").select("user_id, endpoint, sub, last_sent, last_kind, tz");
    if (error) throw error;
    const byUser: Record<string, any[]> = {};
    for (const s of subs || []) (byUser[s.user_id] = byUser[s.user_id] || []).push(s);
    const now = Date.now(), H = 3600e3, D = 24 * H;
    let sent = 0;
    for (const uid of Object.keys(byUser)) {
      const { data: row } = await admin.from("progress").select("state").eq("user_id", uid).maybeSingle();
      const st = row?.state; if (!st) continue;
      const items = st.items || {};
      let due = 0; for (const k in items) { const r = items[k]; if (r.s > 0 && r.s < 9 && r.due <= now) due++; }
      const learned = Object.values(items).filter((r: any) => r.s > 0).length;
      const weeklyDue = learned >= 20 ? ((st.weekly?.last || st.created || now) + 7 * D) : Infinity;
      // Hora y día LOCALES del dispositivo (la zona horaria se guarda con la suscripción); sin ella, UTC
      const localParts = (tz: string) => { try { const p = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false }).formatToParts(new Date()); const g = (t: string) => p.find((x) => x.type === t)?.value || ""; return { day: `${g("year")}-${g("month")}-${g("day")}`, hour: Number(g("hour")) % 24 }; } catch { const d = new Date(); return { day: d.toISOString().slice(0, 10), hour: d.getUTCHours() }; } };
      for (const s of byUser[uid]) {
        const { day: todayKey, hour } = localParts(s.tz || "UTC");
        const today = (st.days || {})[todayKey] || {};
        const studied = (today.r || 0) + (today.l || 0) + (today.lg || 0) + (today.rd || 0) + (today.ex || 0) > 0;
        if (hour < 8 || hour >= 23) continue; // nunca de noche
        // Decide el mensaje (uno por tipo y por día como máximo)
        let kind = "", title = "", body = "";
        if (now > weeklyDue + D) { kind = "weekly-late"; title = "Examen semanal atrasado"; body = "Las lecciones están bloqueadas hasta que lo hagas. 30 preguntas, 30 minutos."; }
        else if (now >= weeklyDue) { kind = "weekly"; title = "Tu examen semanal está listo"; body = "Hazlo hoy y mide dónde estás de verdad."; }
        else if (due >= 100) { kind = "due-high"; title = `${due} repasos esperando`; body = "Cuanto más tardes, más olvidas. Empieza por 30."; }
        else if (due >= 30) { kind = "due"; title = `${due} repasos pendientes`; body = "Diez minutos ahora te ahorran una hora mañana."; }
        else if (!studied && hour >= 19) { kind = "idle"; title = "Hoy aún no has estudiado"; body = "Una lección de 5 ítems o tus repasos. Mantén la racha."; }
        if (!kind) continue;
        const last = s.last_sent ? new Date(s.last_sent).getTime() : 0;
        if (s.last_kind === kind && now - last < 20 * H) continue; // no repetir el mismo aviso el mismo día
        if (now - last < 3 * H) continue; // como mucho un aviso cada 3 horas
        try {
          await webpush.sendNotification(s.sub, JSON.stringify({ title, body, url: "./" }));
          await admin.from("push_subs").update({ last_sent: new Date().toISOString(), last_kind: kind }).eq("endpoint", s.endpoint);
          sent++;
        } catch (e: any) {
          if (e?.statusCode === 404 || e?.statusCode === 410) await admin.from("push_subs").delete().eq("endpoint", s.endpoint);
        }
      }
    }
    return json({ ok: true, sent });
  } catch (e) { return json({ error: String(e) }, 500); }
});
