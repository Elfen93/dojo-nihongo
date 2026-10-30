// Nota de una redacción calculada con una fórmula fija a partir de los hechos que detecta el modelo.
// La IA no decide la nota: solo localiza errores, y la misma lista de errores da siempre la misma nota.
export const WEIGHT = { 1: 1, 2: 2, 3: 3 };
export const jaLen = (s) => (String(s || "").match(/[぀-ヿ一-鿿々ー]/g) || []).length;
export function computeScore(input) {
  const n = Math.max(1, jaLen(input.text));
  const errors = Array.isArray(input.errors) ? input.errors : [];
  let points = 0;
  const count = { 1: 0, 2: 0, 3: 0 };
  for (const e of errors) { const s = [1, 2, 3].includes(Number(e.sev)) ? Number(e.sev) : 2; points += WEIGHT[s]; count[s]++; }
  const density = points / (n / 100);
  const accuracy = Math.max(0, 100 - 3.2 * density);
  let score = accuracy;
  const parts = [];
  const min = Number(input.min) || 0;
  let lengthPenalty = 0;
  if (min && n < min) lengthPenalty = Math.min(20, Math.round(20 * (min - n) / min));
  score -= lengthPenalty;
  const topicPenalty = input.topicOk === false ? 12 : 0;
  score -= topicPenalty;
  const required = Array.isArray(input.use) ? input.use.length : 0;
  const used = Array.isArray(input.used) ? input.used.length : 0;
  const structPenalty = required ? Math.min(10, 3 * Math.max(0, required - used)) : 0;
  score -= structPenalty;
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, breakdown: { chars: n, errors: count, accuracy: Math.round(accuracy), lengthPenalty, topicPenalty, structPenalty } };
}
