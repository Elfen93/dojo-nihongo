// Vuelca todos los textos japoneses de las fichas de gramática (para calcular el furigana). Uso: node tools/dump_strings.js > /ruta/strings.json
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(500);
await p.evaluate(()=>new Promise(r=>loadExt().then(r)));
const out=await p.evaluate(()=>{
  const set=new Set(); const add=s=>{ if(!s) return; for(const m of String(s).matchAll(JP_RUN)) if(hasKanji(m[0])) set.add(m[0]); };
  for(const v of VOCAB_ALL){ add(v.ex); add(v.w); add(v.kj); } for(const x of (typeof EXAM_SENTS!=='undefined'?EXAM_SENTS:[])) add(x.j); for(const x of (typeof EXAM_GRAMMAR!=='undefined'?EXAM_GRAMMAR:[])){ const c=parseCloze(x.j); add(c.pre); add(c.answers[0]); add(c.post); }
  for(const g of GRAMMAR_ALL){ for(const e of g.ex||[]) add(e.h); add(g.t); add(g.s); add(g.e); for(const e of g.ex||[]){ const c=parseCloze(e.j); add(c.pre); add(c.answers[0]); add(c.post); }
    const X=GRAM_EXT[g.id]; if(X){ (X.about||[]).forEach(add); add(X.ojo); (X.m||[]).forEach(e=>add(e.j)); (X.r||[]).forEach(r=>{ add(r.d); add(r.t); }); } }
  return [...set];
});
fs.writeFileSync(process.argv[2]||'/dev/stdout',JSON.stringify(out)); await b.close();})();
