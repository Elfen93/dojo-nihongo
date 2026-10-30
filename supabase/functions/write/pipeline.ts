// Corrección de redacciones: normalización, caché por hash, detección por oraciones (2 muestras), juez y nota fija.
import { computeScore } from "./score.ts";

export const VERSION = "v5"; // cambiar al tocar prompts o fórmula: invalida la caché

export const norm = (t) => String(t || "").normalize("NFKC").replace(/[ \t　]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
// Para la clave: la puntuación latina y la japonesa cuentan igual (depende del teclado)
const keyNorm = (t) => norm(t).replace(/\./g, "。").replace(/,/g, "、").replace(/[ \n]/g, "");
export async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export const splitSentences = (t) => String(t).split(/(?<=[。！？!?\n])/).map((s) => s.trim()).filter(Boolean);
const LATIN = /[A-Za-z][A-Za-z' ]*[A-Za-z]|[A-Za-z]/g;

const ANCHORS = `Ejemplos de lo que NO es un error (no los confirmes):
- 私のし / なつ / おどり: hiragana de una palabra que suele llevar kanji (市, 夏, 踊り).
- "." o "," latinos en vez de 。 y 、; espacios sobrantes.
- それは / それが, 町 / 市 / 街, ぼく / 私, orden de frase distinto pero correcto, おすすめ / すすめ.
- Una frase correcta pero que tú escribirías distinto.
Ejemplos de lo que SÍ es un error:
- sev 2: パリでたくさんところがあります, おどりますだから (ます + だから sin cortar), とかけど, 好き所 (falta な), 買いました sin を cuando hace falta, で en lugar de に con あります, いい映画と言った (falta だ: いい映画だと言った), 土曜日七時午後 (orden: 土曜日の午後七時).
- sev 1: クレプ por クレープ (vocal larga), letras latinas por no saber la palabra, 今週も cuando no hay nada con que sumar (今週は), y mezclar frases finales casuales (見たい, してんの) con corteses (行きませんか, です) dentro del mismo texto (punto: 丁寧体と普通体の統一).`;

export async function grade(ctx, deps) {
  const { text: rawText, level, topic, use, min } = ctx;
  const text = norm(rawText);
  const textKey = await sha256(keyNorm(text));
  const fullKey = await sha256([VERSION, level, topic, min, (use || []).join(","), keyNorm(text)].join("|"));

  // 1) ¿Es el texto una corrección generada por el sistema? Entonces es 100 por construcción.
  const mine = await deps.cacheGet("c:" + textKey);
  if (mine) return { ...mine, cached: true };
  // 2) ¿El mismo texto ya se corrigió con estos datos? Misma respuesta siempre.
  const hit = await deps.cacheGet("i:" + fullKey);
  if (hit) return { ...hit, cached: true };

  const sents = splitSentences(text);
  const numbered = sents.map((s, i) => `[${i + 1}] ${s}`).join("\n");
  const latin = [...new Set((text.match(LATIN) || []).map((s) => s.trim()).filter(Boolean))];

  const analyze = `Eres profesor de japonés y analizas la redacción de un hispanohablante de nivel JLPT ${level}. Tema: ${topic || "libre"}. Longitud esperada: entre ${min || 100} y ${(min || 100) * 1.5} caracteres. ${use.length ? "Se le pidió usar: " + use.join(", ") + "." : ""}
Mide al alumno con el listón de SU nivel (${level}). NO pongas nota. Busca errores objetivos (gramática, partículas, orden de palabras, vocabulario, ortografía, mezcla de registro cortés/casual); no listes simples preferencias de estilo. Las letras latinas ya están controladas aparte: no las listes.
Responde SOLO con JSON: {"errors":[{"sid":número de oración,"orig":"fragmento EXACTO copiado de esa oración","fix":"fragmento corregido","why":"explicación corta en español","kind":"gramatica|vocabulario|kanji|escritura","sev":1|2|3,"point":"si kind es gramatica: el punto en japonés (〜ている, 〜たら, は/が, 敬語); si no, la palabra o kanji correcto"}],"topic_ok":true|false,"used":["estructuras pedidas que SÍ usó bien, tal como se pidieron"],"level":"nivel JLPT que aparenta (N5-N1)"}
Gravedad: 3 = SOLO si un nativo no entendería la frase o falta algo esencial (como mucho 2 en todo el texto); 2 = error claro de partícula, forma, orden o palabra que no impide entender (es lo normal); 1 = fallo menor (ortografía, vocal larga, letras latinas, registro). Que el error sea de gramática básica NO lo hace grave: en nivel N5 casi todo es básico.
${ANCHORS}
Texto, por oraciones:
${numbered}`;

  const samples = await Promise.all([0, 1].map(() => deps.ask(analyze, 6000).catch(() => null)));
  const cand = new Map();
  let topicOk = false, used = new Set(), levelGuess = "", got = 0;
  samples.forEach((raw, si) => {
    if (!raw) return; got++;
    for (const e of (Array.isArray(raw.errors) ? raw.errors : [])) {
      if (!e || typeof e.orig !== "string" || typeof e.fix !== "string" || !e.orig.trim() || e.orig === e.fix) continue;
      const orig = e.orig.trim();
      const sid = Number(e.sid);
      const inSent = sents[sid - 1] && sents[sid - 1].includes(orig);
      if (!inSent && !text.includes(orig)) continue; // errores "fantasma": no existen en el texto
      const k = orig;
      if (!cand.has(k)) cand.set(k, { orig, fix: e.fix, why: e.why || "", kind: e.kind || "gramatica", sev: Number(e.sev) || 2, point: e.point || "", votes: 0 });
      cand.get(k).votes++;
    }
    if (raw.topic_ok !== false) topicOk = true;
    for (const u of (Array.isArray(raw.used) ? raw.used : [])) used.add(u);
    if (!levelGuess && raw.level) levelGuess = raw.level;
  });
  if (!got) throw new Error("no se pudo analizar el texto; inténtalo otra vez");
  const items = [...cand.values()].map((c, i) => ({ id: i + 1, ...c }));
  // letras latinas: detección determinista; la escritura correcta la propone el juez
  for (const l of latin) items.push({ id: items.length + 1, orig: l, fix: "", why: "Escrito en letras latinas: en japonés va en katakana o kanji.", kind: "vocabulario", sev: 1, point: "", votes: 2, latin: true });

  // 3) Juez: confirma o descarta cada candidato (prioriza la precisión) y escribe el comentario
  let confirmed = [];
  let comment = "";
  if (items.length) {
    const judge = `Eres profesor de japonés y revisas una lista de supuestos errores de la redacción de un alumno de nivel JLPT ${level}. Confirma como error todo lo que un profesor de japonés corregiría en un texto de ese nivel; descarta solo lo que sea claramente aceptable para un hablante nativo o una simple preferencia de estilo. Texto, por oraciones:
${numbered}
Candidatos:
${items.map((c) => `#${c.id} «${c.orig}» → «${c.fix || "?"}» (${c.why})`).join("\n")}
${ANCHORS}
Para los candidatos con "?" propón en "fix" la escritura correcta en katakana o kanji. Responde SOLO con JSON: {"verdicts":[{"id":número,"verdict":"error"|"no_error"|"estilo","sev":1|2|3,"fix":"corrección final (opcional)","why":"explicación en español (opcional)"}],"comment":"valoración breve en español: qué hace bien y qué debe trabajar, coherente con los errores confirmados; tema: ${topic || "libre"}"}`;
    try {
      const j = await deps.ask(judge, 4000);
      const byId = new Map((Array.isArray(j.verdicts) ? j.verdicts : []).map((v) => [Number(v.id), v]));
      for (const c of items) {
        const v = byId.get(c.id);
        if (v ? v.verdict === "error" : (c.latin || c.votes >= 2)) confirmed.push({ ...c, fix: (v && v.fix) || c.fix, why: (v && v.why) || c.why, sev: [1, 2, 3].includes(Number(v && v.sev)) ? Number(v.sev) : c.sev });
      }
      comment = typeof j.comment === "string" ? j.comment : "";
    } catch (_) { confirmed = items.filter((c) => c.latin || c.votes >= 2); } // sin juez: solo lo que vieron las dos muestras
  }
  confirmed = confirmed.filter((c) => c.fix && c.fix !== c.orig);

  // 4) Versión corregida: solo los errores confirmados, de mayor a menor longitud
  let corrected = text;
  for (const c of [...confirmed].sort((a, b) => b.orig.length - a.orig.length)) corrected = corrected.split(c.orig).join(c.fix);

  const { score, breakdown } = computeScore({ text, errors: confirmed, min, use, used: [...used], topicOk });
  const result = {
    score, breakdown, comment,
    errors: confirmed.map(({ orig, fix, why, kind, sev, point }) => ({ orig, fix, why, kind, sev, point })),
    tips: [], corrected, level: levelGuess,
  };
  await deps.cachePut("i:" + fullKey, result);
  // la versión corregida puntúa 100 por construcción
  const cKey = await sha256(keyNorm(corrected));
  if (cKey !== textKey) await deps.cachePut("c:" + cKey, { score: 100, breakdown: { chars: breakdown.chars, errors: { 1: 0, 2: 0, 3: 0 }, accuracy: 100, lengthPenalty: 0, topicPenalty: 0, structPenalty: 0 }, comment: "Este texto es la versión corregida que generó la app para otra redacción: no tiene errores señalados.", errors: [], tips: [], corrected: text, level: levelGuess, system: true });
  return result;
}
