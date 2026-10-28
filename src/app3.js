// ===================== Facetas de estudio =====================
function parseCloze(j){
  const m = j.match(/^(.*?)\[([^\]]+)\](.*)$/s);
  if (!m) return {pre:j, answers:[], post:''};
  return {pre:m[1], answers:m[2].split('|'), post:m[3]};
}
function kanjiReadings(k){
  const on=(k.on||[]).map(r=>kataToHira(r.split('.')[0]));
  const kun=(k.kun||[]).map(r=>r.split('.')[0]).filter(Boolean);
  return uniq([...on,...kun]);
}
function facetsFor(it){ return it.kind==='k'?['kr','km'] : it.kind==='v'?['vp','vr','vm'] : ['gc']; }
const FACET_LABEL = {km:'Significado del kanji', kr:'Lectura del kanji', vm:'Significado', vr:'Lectura', vp:'Producción: del español al japonés', gc:'Gramática: completa la frase'};
function kanjiDistractors(v){
  const word=v.w; const chars=[...word].filter(c=>hasKanji(c));
  let pool = VOCAB_ALL.filter(x=>x.w!==word && hasKanji(x.w) && !(VOCAB_BY_WORD[x.w]||[]).some(y=>y.r===v.r&&y.w===v.w));
  const share = pool.filter(x=>chars.some(c=>x.w.includes(c)));
  const sameLen = pool.filter(x=>x.w.length===word.length && !share.includes(x));
  const out = uniq([...pick(share,2), ...shuffle(sameLen), ...shuffle(pool)].map(x=>x.w)).filter(w=>w!==word).slice(0,3);
  return out;
}
// Construye la pregunta de una faceta
function buildPrompt(it, facet){
  const p={it,facet};
  if (facet==='km'){ p.kind='k'; p.main=it.k; p.ask='Significado'; p.input='es'; p.check=a=>matchEs(a,it.m); p.correct=it.m.join(', '); }
  else if (facet==='kr'){ p.kind='k'; p.main=it.k; p.ask='Lectura (cualquiera)'; p.input='kana'; const acc=kanjiReadings(it); p.check=a=>matchKana(a,acc); p.correct=acc.join('・'); }
  else if (facet==='vm'){ p.kind='v'; p.main=it.w; p.ask='Significado'; p.input='es'; p.check=a=>matchEs(a,it.m); p.correct=it.m.join(', '); }
  else if (facet==='vr'){ p.kind='v'; p.main=it.w; p.ask='Lectura'; p.input='kana'; p.check=a=>matchKana(a,[it.r]); p.correct=it.r; }
  else if (facet==='vp'){ p.kind='p'; p.mainEs=it.m.join(', '); p.sub=it.p?posLabel(it.p):''; p.ask='Escribe la palabra en japonés'; p.input='kana'; p.check=a=>matchKana(a,[it.r]); p.correct=it.r+(hasKanji(it.w)?'（'+it.w+'）':''); if (hasKanji(it.w)) { p.pick={correct:it.w, options:shuffle([it.w,...kanjiDistractors(it)])}; } }
  else if (facet==='gc'){ p.kind='g'; const ex = it._ex || rnd(it.ex); const c=parseCloze(ex.j); p.cloze=c; p.ex=ex; p.ask='Completa'; p.input='kana'; const acc=uniq([...c.answers, ...(ex.k?[ex.k]:[]), ...(typeof CLOZE_KANA!=='undefined'&&CLOZE_KANA[c.answers[0]]?[CLOZE_KANA[c.answers[0]]]:[])]); p.check=a=>{ const t=toKana(a,true); return acc.some(x=>normKana(x)===normKana(t)) || acc.some(x=>x===a.trim()); }; p.correct=c.answers[0]; }
  return p;
}
const POS = {n:'sustantivo',v5:'verbo (grupo 1)',v1:'verbo (grupo 2)',vk:'verbo irregular','adj-i':'adjetivo い','adj-na':'adjetivo な',adv:'adverbio','n-vs':'sustantivo / verbo する',adj:'adjetivo',exp:'expresión'};
const posLabel = p => POS[p]||p||'';

// ===================== Motor de sesión =====================
let SESSION=null;
function startSession(mode, items, opts={}){
  const results={}; const its=shuffle(items); const passes=[[],[],[]];
  for (const it of its){ const k=keyOf(it); const fs=facetsFor(it); results[k]={wrong:0,left:new Set(fs),it}; fs.forEach((f,i)=>passes[i].push({k,f})); }
  // primera pasada: la faceta principal de cada ítem (español→japonés en vocabulario); luego el resto
  const queue=[...shuffle(passes[0]), ...shuffle(passes[1]), ...shuffle(passes[2])];
  SESSION={mode, queue, results, total:items.length, done:0, correct:0, cur:null, phase:'ask', opts, startedAt:now(), wrongKeys:new Set()};
  nextCard();
}
function nextCard(){
  const s=SESSION; if(!s) return;
  if (!s.queue.length){ finishSession(); return; }
  // evita repetir la misma palabra dos veces seguidas si hay alternativa
  if (s.cur && s.queue.length>1 && s.queue[0].k===s.cur.k){ const i=s.queue.findIndex(q=>q.k!==s.cur.k); if(i>0){ const [q]=s.queue.splice(i,1); s.queue.unshift(q);} }
  const q=s.queue.shift(); const it=s.results[q.k].it;
  s.cur={k:q.k,f:q.f,p:buildPrompt(it,q.f),wrong:false}; s.phase='ask'; renderStudy();
}
function answerCurrent(correct){
  const s=SESSION, c=s.cur, r=s.results[c.k];
  if (correct){
    r.left.delete(c.f);
    if (!r.left.size){ completeItem(c.k); }
  } else {
    r.wrong++; s.wrongKeys.add(c.k);
    const pos=Math.min(s.queue.length, 2+Math.floor(Math.random()*5)); s.queue.splice(pos,0,{k:c.k,f:c.f});
  }
  s.phase='feedback'; c.ok=correct; renderStudy();
}
function completeItem(k){
  const s=SESSION, r=s.results[k]; s.done++;
  const rec = S.items[k] || (S.items[k]={s:0,due:0,c:0,w:0});
  if (s.mode==='lesson'){ rec.s=1; rec.due=now()+4*H; rec.lrn=now(); rec.ls=now(); bump(r.it.kind==='g'?'lg':'l'); }
  else { const ok=r.wrong===0; srsAnswer(rec, ok, Math.max(1,r.wrong)); if(ok) s.correct++; bump('r'); if(ok) bump('rc'); }
  save(); if(s.mode!=='lesson') markClearedIfEmpty();
}
function finishSession(){
  const s=SESSION; SESSION=null;
  const el=$('#main'); el.innerHTML='';
  const wrong=[...s.wrongKeys].map(k=>ITEMS.get(k)).filter(Boolean);
  const pct = s.total? Math.round(100*(s.total-wrong.length)/s.total):0;
  el.append(h('div',{class:'study stack'},
    h('div',{class:'card',style:'text-align:center'},
      h('div',{class:'eyebrow'}, s.mode==='lesson'?'Lección completada':'Sesión de repaso terminada'),
      h('div',{class:'score '+(pct>=80?'pass':'fail')}, pct+'%'),
      h('p',{class:'muted'}, s.mode==='lesson' ? `${s.total} ${plural(s.total,'ítem','ítems')} nuevos. Primer repaso en 4 horas.` : `${s.total-wrong.length} de ${s.total} correctos. Los fallos vuelven antes.`),
      s.mode!=='lesson' && pct<70 ? h('div',{class:'push'}, 'Menos del 70 %. Esto no es mala suerte: son ítems que todavía no están asentados. Repásalos ahora con el botón de abajo y vuelve mañana.') : null
    ),
    wrong.length ? h('div',{class:'card'}, h('h3',{},'Fallados'), h('div',{class:'list',style:'margin-top:8px'}, wrong.map(it=>itemRow(it)))) : null,
    h('div',{class:'row'},
      wrong.length ? h('button',{class:'btn warn',onclick:()=>startSession('drill',wrong)},'Repetir solo los fallados') : null,
      h('button',{class:'btn primary',onclick:()=>go('hoy')},'Volver a Hoy'),
      s.mode==='lesson' && lessonsAvailable(s.opts&&s.opts.track||'kv').items.length ? h('button',{class:'btn leaf',onclick:()=>startLessonBatch(s.opts&&s.opts.track||'kv')},'Siguiente lección') : null
    )
  ));
  window.scrollTo(0,0);
}
function itemRow(it){
  const rec=S.items[keyOf(it)]||{s:0};
  const main = it.kind==='k'?it.k : it.kind==='v'?it.w : it.t;
  const sub = it.kind==='k'?(it.m||[]).join(', ') : it.kind==='v'?it.r+' · '+it.m.join(', ') : (it.s||'');
  return h('div',{class:'item'}, h('span',{class:'pill '+it.kind}, it.kind==='k'?'kanji':it.kind==='v'?'vocab':'gram.'), h('div',{style:'min-width:0;flex:1'}, h('div',{class:'t jp'},main), h('div',{class:'small muted'},sub)), h('span',{class:'badge soft'},STAGE_NAMES[rec.s]||'Nuevo'));
}

// ===================== Tarjeta de estudio =====================
let imeComposing=false;
function kanaInput(input){
  if (!input) return;
  input.addEventListener('input', e=>{
    if (imeComposing) return;
    const v=input.value; if(!/[a-zA-Z\-~']/.test(v)) return;
    const pos=input.selectionStart; const conv=toKana(v);
    if (conv!==v){ input.value=conv; try{input.setSelectionRange(conv.length,conv.length);}catch(e){} }
  });
  input.addEventListener('compositionstart',()=>imeComposing=true);
  input.addEventListener('compositionend',()=>{imeComposing=false;});
}
function renderStudy(){
  const s=SESSION, c=s.cur, p=c.p, el=$('#main'); el.innerHTML='';
  const remaining=s.queue.length+1;
  const head=h('div',{class:'study-head'},
    h('button',{class:'btn sm ghost',onclick:()=>{ if(confirmBox('¿Salir de la sesión? Lo respondido ya está guardado.', ()=>{SESSION=null;go('hoy');})) {} }},'✕ Salir'),
    h('span',{class:'sp'}),
    h('span',{class:'num'}, `${s.done}/${s.total} ítems · ${remaining} ${plural(remaining,'pregunta')}`),
    h('span',{class:'badge soft'}, s.mode==='lesson'?'Lección':s.mode==='drill'?'Refuerzo':'Repaso'));
  const card=h('div',{class:'prompt-card kind-'+p.kind});
  card.append(h('div',{class:'ask '+p.kind}, FACET_LABEL[c.f]));
  if (c.f==='gc'){
    const cl=p.cloze;
    card.append(h('div',{class:'mid-jp',lang:'ja'}, cl.pre, h('span',{class:'blank'}, s.phase==='ask'?'　　　':cl.answers[0]), cl.post));
    card.append(h('div',{class:'muted'}, p.ex.s));
    if (p.ex.h) card.append(h('div',{class:'small muted'}, 'Pista: ', h('span',{class:'jp'},p.ex.h)));
    card.append(h('div',{class:'small'}, h('span',{class:'pill g'}, p.it.t)));
  } else if (c.f==='vp'){
    card.append(h('div',{class:'big-es'}, p.mainEs));
    if (p.sub) card.append(h('div',{class:'small muted'}, p.sub));
  } else {
    card.append(h('div',{class:'big-jp',lang:'ja'}, p.main));
    if (p.kind==='v' && p.it.p) card.append(h('div',{class:'small muted'}, posLabel(p.it.p)));
  }
  el.append(h('div',{class:'study'}, head, card));
  const study=el.firstChild;
  if (s.phase==='ask'){
    const input=h('input',{type:'text',id:'ans',autocomplete:'off',autocapitalize:'off',autocorrect:'off',spellcheck:'false',lang:p.input==='kana'?'ja':'es',placeholder:p.input==='kana'?'romaji → かな':'en español',inputmode:'text'});
    if (p.input==='kana') kanaInput(input);
    const submit=()=>{ const v=input.value.trim(); if(!v) return; if(p.input==='kana' && /[a-zA-Z]/.test(toKana(v,true).replace(/[^a-zA-Z]/g,'')) && !isKana(toKana(v,true))) { input.value=toKana(v,true); } evaluate(input.value.trim()); };
    input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } });
    study.append(h('div',{class:'answer'}, input, h('button',{class:'btn primary',onclick:submit},'→')));
    study.append(h('div',{class:'kbd',style:'margin-top:6px;text-align:center'}, p.input==='kana'?'Escribe en romaji; se convierte a kana. Enter para responder.':'Escribe el significado en español. Enter para responder.'));
    setTimeout(()=>input.focus(),0);
  } else if (s.phase==='pick'){
    study.append(h('div',{class:'muted',style:'margin-top:10px;text-align:center'}, 'Lectura correcta: ', h('b',{class:'jp'},p.it.r), '. Ahora elige cómo se escribe.'));
    const ch=h('div',{class:'choices'});
    p.pick.options.forEach(o=>ch.append(h('button',{lang:'ja',onclick:()=>{ const ok=o===p.pick.correct; [...ch.children].forEach(b=>{ b.disabled=true; if(b.textContent===p.pick.correct) b.classList.add('right'); else if(b.textContent===o&&!ok) b.classList.add('wrong'); }); setTimeout(()=>answerCurrent(ok),350); }},o)));
    study.append(ch);
  } else {
    study.append(feedbackPanel(c));
  }
}
function evaluate(ans){
  const s=SESSION, c=s.cur, p=c.p; const ok=p.check(ans);
  c.answer=ans;
  const input=$('#ans'); if(input){ input.classList.add(ok?'right':'wrong'); input.disabled=true; }
  if (ok && p.pick){ s.phase='pick'; setTimeout(renderStudy,250); return; }
  setTimeout(()=>answerCurrent(ok), ok?250:0);
}
function feedbackPanel(c){
  const p=c.p, it=p.it, ok=c.ok;
  const fb=h('div',{class:'feedback'});
  fb.append(h('div',{class:'verdict '+(ok?'ok':'ko')}, ok?'Correcto':'Incorrecto', c.answer?h('span',{class:'muted',style:'font-weight:400'}, ' · tu respuesta: ', h('span',{class:'jp'},toKana(c.answer,true))):null));
  const dl=h('dl');
  const add=(t,d)=>dl.append(h('dt',{},t),h('dd',{},d));
  if (it.kind==='k'){
    add('Significado', it.m.join(', ')); add('On', h('span',{class:'jp'},(it.on||[]).join('・')||'—')); add('Kun', h('span',{class:'jp'},(it.kun||[]).join('・')||'—'));
    if (it.mn) add('Mnemotecnia', it.mn);
    const vs=vocabWithKanji(it.k).slice(0,3); if(vs.length) add('Palabras', h('span',{class:'jp'}, vs.map(v=>v.w+'（'+v.r+'）').join('、')));
  } else if (it.kind==='v'){
    add('Palabra', h('span',{class:'jp'}, it.w, ' ', h('span',{class:'muted'},'（'+it.r+'）'), ' ', spkBtn(it.w)));
    add('Significado', it.m.join(', ')); if (it.p) add('Tipo', posLabel(it.p));
    if (it.ex) add('Ejemplo', h('div',{}, h('div',{class:'jp'}, it.ex, ' ', spkBtn(it.ex)), h('div',{class:'small muted'}, it.es||'')));
    const kinfo=[...it.w].filter(hasKanji).map(ch=>KANJI_META[ch]).filter(Boolean); if(kinfo.length) add('Kanji', h('span',{class:'jp'}, kinfo.map(k=>k.k+' = '+k.m[0]).join(' · ')));
  } else {
    add('Respuesta', h('span',{class:'jp'}, p.cloze.answers.join(' / ')));
    add('Frase', h('div',{}, h('div',{class:'jp'}, p.cloze.pre+p.cloze.answers[0]+p.cloze.post, ' ', spkBtn(p.cloze.pre+p.cloze.answers[0]+p.cloze.post)), h('div',{class:'small muted'}, p.ex.s)));
    add('Punto', h('span',{}, h('b',{class:'jp'},it.t), ' — ', h('span',{class:'jp'},it.s||'')));
    add('Explicación', it.e||'');
  }
  fb.append(dl);
  const rec=S.items[c.k]; if(rec&&rec.s>0) fb.append(h('div',{class:'small muted',style:'margin-top:8px'}, 'Nivel SRS actual: '+STAGE_NAMES[rec.s]));
  const next=h('button',{class:'btn primary big',style:'margin-top:12px',onclick:nextCard},'Siguiente (Enter)');
  fb.append(next);
  const handler=e=>{ if(e.key==='Enter'){ e.preventDefault(); document.removeEventListener('keydown',handler); nextCard(); } };
  document.addEventListener('keydown',handler); setTimeout(()=>next.focus(),0);
  return fb;
}
// Confirmación dentro de la página (no hay confirm())
function confirmBox(msg, onYes){
  const box=h('div',{class:'card',style:'position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:60;max-width:360px;width:calc(100% - 32px);box-shadow:0 20px 60px rgba(0,0,0,.3)'},
    h('p',{style:'margin:0 0 12px'},msg),
    h('div',{class:'row'}, h('button',{class:'btn',onclick:()=>box.remove()},'Cancelar'), h('span',{class:'sp'}), h('button',{class:'btn warn',onclick:()=>{box.remove();onYes();}},'Sí')));
  document.body.append(box); return true;
}
