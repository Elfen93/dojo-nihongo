// Corrige una redacción en japonés en dos pasadas y calcula la nota con una fórmula fija.
//  1) Análisis: errores (con gravedad), sugerencias, ¿cumple el tema?, estructuras usadas y versión corregida.
//  2) Verificación: se revisa la versión corregida y se aplican los fallos que aún queden, para que corregir un texto ya corregido dé 100.
import { cors, json, requireUser, askClaude, extractJson, cleanLevel, strList } from "../_shared.ts";
import { computeScore } from "./score.ts";

const RULES = `Reglas importantes:
- Escribir en hiragana una palabra que normalmente lleva kanji NO es un error (va en "tips"). Antes de marcar un fragmento, piensa qué quería decir el alumno: lo escrito en hiragana puede ser una palabra con kanji (やから puede ser 屋から, し puede ser 市). Corrige lo que de verdad esté mal, no una grafía distinta.
- No marques como error alternativas igual de naturales (それは / それが, 町 / 市 / 街, ぼく / 私…). Si prefieres otra, va en "tips".
- La puntuación latina (. en vez de 。) y los espacios sobrantes NO son errores: van en "tips".
- Si el alumno escribió una palabra en letras latinas por no saberla, es un error leve (sev 1) y en la corrección debe ir en katakana o kanji.
- Cada fallo distinto se lista una vez. No inventes errores: si dudas, va en "tips" o no se menciona.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await requireUser(req); if (!user) return json({ error: "sin sesión" }, 401);
    const body = await req.json();
    const text = body.text, level = cleanLevel(body.level), use = strList(body.use, 4, 60);
    const topic = typeof body.topic === "string" ? body.topic.slice(0, 300) : "";
    if (!text || typeof text !== "string" || text.length < 20 || text.length > 6000) return json({ error: "texto vacío o demasiado largo (máx. 6000 caracteres)" }, 400);
    const min = Math.max(100, Number(body.min) || 300), max = Math.max(150, Number(body.max) || 450);

    const analyze = `Eres profesor de japonés y analizas la redacción de un hispanohablante de nivel JLPT ${level}. Tema propuesto: ${topic || "libre"}. Longitud esperada: entre ${min} y ${max} caracteres. ${use.length ? "Se le pidió usar: " + use.join(", ") + "." : ""}
Mide al alumno con el listón de SU nivel (${level}), no con el de un nativo. NO pongas nota: solo localiza hechos. Responde SOLO con JSON válido:
{"errors":[{"orig":"fragmento tal cual lo escribió","fix":"fragmento corregido","why":"explicación corta en español","kind":"gramatica|vocabulario|kanji|escritura","sev":1|2|3,"point":"si kind es gramatica: nombre corto del punto en japonés tal como se busca en un libro (〜ている, 〜たら, は/が, 敬語); en otro caso, la palabra o el kanji correcto"}],
"tips":[{"orig":"fragmento (puede ir vacío)","fix":"alternativa","why":"explicación corta en español"}],
"topic_ok":true|false,
"used":["estructuras de las pedidas que el alumno SÍ usó correctamente, tal como aparecen en la lista pedida"],
"comment":"valoración breve en español: qué hace bien y qué debe trabajar",
"corrected":"el texto completo corregido aplicando SOLO las correcciones de 'errors' (cambios mínimos, mismo contenido y estilo; conserva el hiragana del alumno si no era un error; todo en japonés)",
"level":"nivel JLPT que aparenta el texto (N5-N1)"}
Gravedad (sev): 3 = impide entender o rompe la frase o es un fallo de gramática básica del nivel; 2 = error claro que no impide entender (partícula equivocada u omitida, falta な, conjugación errónea, palabra mal usada); 1 = fallo menor (vocal larga, okurigana, kana mal escrito, letras latinas).
${RULES}
Texto del alumno:
${text}`;

    const parsed = extractJson(await askClaude(analyze, 6000, 0));
    const errors = (Array.isArray(parsed.errors) ? parsed.errors : []).filter((e: any) => e && e.orig && e.fix && e.orig !== e.fix);
    const tips = Array.isArray(parsed.tips) ? parsed.tips : [];
    let corrected = typeof parsed.corrected === "string" ? parsed.corrected : "";

    // Verificación: la versión corregida no debería tener errores; si el modelo encuentra alguno, se aplica
    if (corrected) {
      try {
        const verify = `Revisa este texto en japonés (nivel JLPT ${level}) escrito por un alumno y ya corregido. Lista SOLO errores objetivos que queden: partícula equivocada u omitida, conjugación errónea, falta de な, kana o kanji mal escritos, letras latinas. NO listes preferencias de estilo ni alternativas igual de naturales. Si no queda ninguno, responde {"errors":[]}. Responde SOLO con JSON: {"errors":[{"orig":"fragmento exacto del texto","fix":"fragmento corregido"}]}
Texto:
${corrected}`;
        const v = extractJson(await askClaude(verify, 1500, 0));
        for (const e of (Array.isArray(v.errors) ? v.errors : []).slice(0, 8)) {
          if (e && typeof e.orig === "string" && typeof e.fix === "string" && e.orig && e.orig !== e.fix && corrected.includes(e.orig)) corrected = corrected.replace(e.orig, e.fix);
        }
      } catch (_) { /* si falla la verificación se deja la corrección tal cual */ }
    }

    const { score, breakdown } = computeScore({ text, errors, min, use, used: parsed.used, topicOk: parsed.topic_ok !== false });
    return json({ score, breakdown, comment: parsed.comment || "", errors, tips, corrected, level: parsed.level || "" });
  } catch (e) { return json({ error: String(e) }, 500); }
});
