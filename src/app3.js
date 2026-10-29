// ===================== Facetas de estudio =====================
function parseCloze(j){
  const m = j.match(/^(.*?)\[([^\]]+)\](.*)$/s);
  if (!m) return {pre:j, answers:[], post:''};
  return {pre:m[1], answers:m[2].split('|'), post:m[3].replace(/\[([^\]|]+)(?:\|[^\]]*)?\]/g,'$1')};
}
function kanjiReadings(k){
  const on=(k.on||[]).map(r=>kataToHira(r.split('.')[0]));
  const kun=(k.kun||[]).map(r=>r.split('.')[0]).filter(Boolean);
  return uniq([...on,...kun]);
}
function facetsFor(it){ return it.kind==='k'?['kr','km'] : it.kind==='v'?(S.settings.askReading?['vp','vr','vm']:['vp','vm']) : ['gc']; }
const FACET_LABEL = {km:'Significado del kanji', kr:'Lectura del kanji', vm:'Significado', vr:'Lectura', vp:'Producción: del español al japonés', gc:'Gramática: completa la frase'};
// Sinónimo válido: otra palabra del catálogo con esa lectura y algún significado en común con la pedida
function vocabSynonym(it, typed){
  const t=normKana(toKana(typed,true)); if(!t) return null;
  const parts=m=>normEs(m).split(/\s*\/\s*|\s*,\s*/).filter(Boolean);
  const mine=new Set((it.m||[]).flatMap(parts));
  for (const x of ITEMS.values()){
    if (x.kind!=='v' || x===it || (x.w===it.w && x.r===it.r)) continue;
    if (normKana(x.r)!==t) continue;
    if ((x.m||[]).flatMap(parts).some(q=>mine.has(q))) return x;
  }
  return null;
}
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
  else if (facet==='vp'){ p.kind='p'; p.mainEs=it.m.join(', '); p.sub=it.p?posLabel(it.p):''; p.ask='Escribe la palabra en japonés'; p.input='kana'; p.check=a=>matchKana(a,[it.r]); p.synonym=a=>vocabSynonym(it,a); p.correct=it.r+(hasKanji(it.w)?'（'+it.w+'）':''); if (hasKanji(it.w)) { p.pick={correct:it.w, options:shuffle([it.w,...kanjiDistractors(it)])}; } }
  else if (facet==='gc'){ p.kind='g'; const ex = it._ex || rnd(it.ex); const c=parseCloze(ex.j); p.cloze=c; p.ex=ex; p.ask='Completa'; p.input='kana'; const acc=uniq([...c.answers, ...(ex.k?[ex.k]:[]), ...(typeof CLOZE_KANA!=='undefined'&&CLOZE_KANA[c.answers[0]]?[CLOZE_KANA[c.answers[0]]]:[])]); p.check=a=>{ const t=toKana(a,true); return acc.some(x=>normKana(x)===normKana(t)) || acc.some(x=>x===a.trim()); }; p.correct=c.answers[0]; }
  return p;
}
const POS = {n:'sustantivo',v5:'verbo (grupo 1)',v1:'verbo (grupo 2)',vk:'verbo irregular','adj-i':'adjetivo い','adj-na':'adjetivo な',adv:'adverbio','n-vs':'sustantivo / verbo する',adj:'adjetivo',exp:'expresión'};
const posLabel = p => POS[p]||p||'';

// ===================== Motor de sesión =====================
let SESSION=null;
function startSession(mode, items, opts={}){
  const results={}; const its=shuffle(items); const passes=[[],[],[]];
  for (const it of its){ const k=keyOf(it); const fs=(opts.facets||facetsFor(it)).filter(f=>facetsFor(it).includes(f)); if(!fs.length) continue; results[k]={wrong:0,left:new Set(fs),it}; fs.forEach((f,i)=>passes[i].push({k,f})); }
  // primera pasada: la faceta principal de cada ítem (español→japonés en vocabulario); luego el resto
  const queue=[...shuffle(passes[0]), ...shuffle(passes[1]), ...shuffle(passes[2])];
  SESSION={mode, queue, results, total:Object.keys(results).length, done:0, correct:0, cur:null, phase:'ask', opts, startedAt:now(), wrongKeys:new Set()};
  if (!queue.length){ SESSION=null; toast('No hay nada que repasar'); return; }
  nextCard();
}
function nextCard(){
  const s=SESSION; if(!s) return; clearTimeout(s.autoT); if(s.enterHandler){ document.removeEventListener('keydown',s.enterHandler); s.enterHandler=null; }
  if (!s.queue.length){ for (const [k,r] of Object.entries(s.results)) for (const f of r.left) s.queue.push({k,f}); }
  if (!s.queue.length){ finishSession(); return; }
  // evita repetir la misma palabra dos veces seguidas si hay alternativa
  if (s.cur && s.queue.length>1 && s.queue[0].k===s.cur.k){ const i=s.queue.findIndex(q=>q.k!==s.cur.k); if(i>0){ const [q]=s.queue.splice(i,1); s.queue.unshift(q);} }
  const q=s.queue.shift(); const it=s.results[q.k].it;
  s.cur={k:q.k,f:q.f,p:buildPrompt(it,q.f),wrong:false}; s.phase='ask'; renderStudy();
}
function snapshotForUndo(){ const s=SESSION, c=s.cur; const rec=S.items[c.k]; s.undo={cur:{...c}, result:{wrong:s.results[c.k].wrong, left:new Set(s.results[c.k].left)}, queue:s.queue.slice(), done:s.done, correct:s.correct, rec:rec?JSON.parse(JSON.stringify(rec)):null, hadRec:!!rec, day:JSON.parse(JSON.stringify(day())), stats:JSON.parse(JSON.stringify(S.stats||{})), wrongHad:s.wrongKeys.has(c.k)}; }
function undoLast(){ const s=SESSION; if(!s||!s.undo) return; clearTimeout(s.autoT); if(s.enterHandler){ document.removeEventListener('keydown',s.enterHandler); s.enterHandler=null; } const u=s.undo; s.cur=u.cur; s.results[u.cur.k].wrong=u.result.wrong; s.results[u.cur.k].left=u.result.left; s.queue=u.queue; s.done=u.done; s.correct=u.correct; if(u.hadRec) S.items[u.cur.k]=u.rec; else delete S.items[u.cur.k]; S.days[todayKey()]=u.day; S.stats=u.stats; if(!u.wrongHad) s.wrongKeys.delete(u.cur.k); s.undo=null; s.phase='ask'; s.cur.ok=undefined; s.cur.answer=undefined; save(); renderStudy(); }
function markAsCorrect(){ const s=SESSION; if(!s||!s.undo) return; const u=s.undo; const ans=u.cur.answer; undoLast(); SESSION.cur=u.cur; SESSION.cur.answer=ans; answerCurrent(true); }
function answerCurrent(correct){
  const s=SESSION, c=s.cur, r=s.results[c.k]; snapshotForUndo(); r.lastP=c.p; if(!correct) r.failed=true;
  if (s.mode!=='lesson'){ S.stats=S.stats||{}; const st=S.stats[c.f]=S.stats[c.f]||{c:0,w:0}; if(correct) st.c++; else st.w++; }
  if (correct){
    r.left.delete(c.f);
    if (!r.left.size){ completeItem(c.k); }
  } else {
    r.wrong++; s.wrongKeys.add(c.k);
    const pos=Math.min(s.queue.length, 2+Math.floor(Math.random()*5)); s.queue.splice(pos,0,{k:c.k,f:c.f});
  }
  s.phase='feedback'; c.ok=correct; renderStudy();
  if (correct && S.settings.autoNext!==false){ const token=s.cur; s.autoT=setTimeout(()=>{ if(SESSION===s && s.cur===token && s.phase==='feedback' && !token.full) nextCard(); }, 550); }
}
function completeItem(k){
  const s=SESSION, r=s.results[k]; s.done++;
  const rec = S.items[k] || (S.items[k]={s:0,due:0,c:0,w:0});
  if (s.mode==='lesson'){ rec.s=1; rec.due=now()+4*H; rec.lrn=now(); rec.ls=now(); bump(r.it.kind==='g'?'lg':'l'); }
  else if (s.mode==='drill'){ const ok=r.wrong===0; if(ok){ rec.c=(rec.c||0)+1; s.correct++; } else { rec.w=(rec.w||0)+r.wrong; if(rec.s>0&&rec.s<9) rec.due=Math.min(rec.due||0, now()); } rec.ls=now(); }
  else { const ok=r.wrong===0; srsAnswer(rec, ok, Math.max(1,r.wrong)); if(ok) s.correct++; bump('r'); if(ok) bump('rc'); }
  save(); if(s.mode==='review') markClearedIfEmpty();
}
function finishSession(){
  const s=SESSION; SESSION=null; if(s.enterHandler) document.removeEventListener('keydown',s.enterHandler); clearTimeout(s.autoT); document.body.classList.remove('focus');
  const el=$('#main'); el.innerHTML='';
  const wrong=[...s.wrongKeys].map(k=>ITEMS.get(k)).filter(Boolean);
  const pct = s.total? Math.round(100*(s.total-wrong.length)/s.total):0;
  el.append(h('div',{class:'study stack'},
    h('div',{class:'card',style:'text-align:center'},
      h('div',{class:'eyebrow'}, s.mode==='lesson'?'Lección completada':'Sesión de repaso terminada'),
      h('div',{class:'score '+(pct>=80?'pass':'fail')}, pct+'%'),
      h('p',{class:'muted'}, s.mode==='lesson' ? `${s.total} ${plural(s.total,'ítem','ítems')} nuevos. Primer repaso en 4 horas.` : s.mode==='drill' ? `${s.total-wrong.length} de ${s.total} correctos. El refuerzo no cambia la etapa SRS; lo fallado vuelve a la cola de repasos.` : `${s.total-wrong.length} de ${s.total} correctos. Los fallos vuelven antes.`),
      s.mode!=='lesson' && pct<70 ? h('div',{class:'push'}, 'Menos del 70 %. Esto no es mala suerte: son ítems que todavía no están asentados. Repásalos ahora con el botón de abajo y vuelve mañana.') : null
    ),
    sessionSummary(s),
    h('div',{class:'row'},
      wrong.length ? h('button',{class:'btn warn',onclick:()=>startSession('drill',wrong,{facets:s.opts&&s.opts.facets})},'Repetir solo los fallados') : null,
      h('button',{class:'btn primary',onclick:()=>go('hoy')},'Volver a Hoy'),
      s.mode==='lesson' && lessonsAvailable(s.opts&&s.opts.track||'kv').items.length ? h('button',{class:'btn leaf',onclick:()=>startLessonBatch(s.opts&&s.opts.track||'kv')},'Siguiente lección') : null
    )
  ));
  window.scrollTo(0,0);
}
function sessionSummary(s){
  const rs=Object.values(s.results).filter(r=>r.lastP); if(!rs.length) return null;
  rs.sort((a,b)=>(b.failed?1:0)-(a.failed?1:0));
  const nf=rs.filter(r=>r.failed).length;
  const card=r=>{ const it=r.it, rec=S.items[keyOf(it)]||{s:0}; const main=it.kind==='k'?it.k:it.kind==='v'?it.w:it.t; const sub=it.kind==='k'?(it.m||[]).join(', '):it.kind==='v'?it.r+' · '+it.m.join(', '):(it.s||'');
    return h('details',{class:r.failed?'ko':'',open:!!r.failed}, h('summary',{}, h('span',{class:'pill '+it.kind}, it.kind==='k'?'kanji':it.kind==='v'?'vocab':'gram.'), h('div',{style:'min-width:0;flex:1'}, h('div',{class:'t jp'},main), h('div',{class:'small muted'},sub)), h('span',{class:'badge '+(r.failed?'warn':'soft')}, r.failed?'fallado':STAGE_NAMES[rec.s]||'Nuevo')), h('div',{class:'body'}, itemDetails(it, r.lastP)));
  };
  return h('div',{class:'card'}, h('h3',{}, s.mode==='lesson'?'Lo aprendido en esta lección':'Lo repasado en esta sesión'), h('p',{class:'small muted',style:'margin:2px 0 8px'}, nf?`${nf} ${plural(nf,'fallado')} (abiertos) y ${rs.length-nf} ${plural(rs.length-nf,'acertado')}. Toca cualquiera para ver su ficha.`:'Todo acertado. Toca cualquiera para ver su ficha.'), h('div',{class:'sess'}, rs.map(card)));
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
  const s=SESSION, c=s.cur, p=c.p, el=$('#main'); el.innerHTML=''; document.body.classList.add('focus');
  const remaining=s.queue.length+1;
  const head=h('div',{class:'study-head'},
    h('button',{class:'btn sm ghost',onclick:()=>confirmBox('¿Salir de la sesión? Lo respondido ya está guardado.', ()=>go('hoy'))},'✕ Salir'),
    s.undo&&s.phase==='ask'?h('button',{class:'btn sm ghost',onclick:undoLast},'Deshacer'):null,
    h('span',{class:'sp'}),
    h('span',{class:'num'}, `${s.done}/${s.total} ítems · ${remaining} ${plural(remaining,'pregunta')}`),
    h('span',{class:'badge soft'}, s.mode==='lesson'?'Lección':s.mode==='drill'?'Refuerzo':'Repaso'));
  const card=h('div',{class:'prompt-card kind-'+p.kind+(s.phase==='ask'?' enter':'')});
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
    if (c.syn){ const a=c.syn; study.append(h('div',{class:'push warnish',style:'margin-top:10px'}, h('span',{class:'jp'}, a.w, '（'+a.r+'）'), ' también es correcto y significa lo mismo, pero no es la palabra que buscamos aquí. Prueba con otra.')); }
    const input=h('input',{type:'text',id:'ans',autocomplete:'off',autocapitalize:'off',autocorrect:'off',spellcheck:'false',lang:p.input==='kana'?'ja':'es',placeholder:p.input==='kana'?'romaji → かな':'en español',inputmode:'text'});
    if (p.input==='kana') kanaInput(input);
    const sendBtn=h('button',{class:'btn primary',title:'Responder'},'→');
    const submit=()=>{ if(SESSION!==s||s.cur!==c||s.phase!=='ask'||c.answer!==undefined) return; const v=input.value.trim(); if(!v) return; if(p.input==='kana') input.value=toKana(v,true); sendBtn.disabled=true; evaluate(input.value.trim()); };
    sendBtn.addEventListener('click',submit);
    input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } });
    study.append(h('div',{class:'answer'}, input, sendBtn));
    study.append(h('div',{class:'kbd',style:'margin-top:6px;text-align:center'}, p.input==='kana'?"Romaji → kana. nn + vocal = んな (annai → あんない); n' separa (sen'en → せんえん). Enter para responder.":'Escribe el significado en español. Enter para responder.'));
    setTimeout(()=>input.focus(),0);
  } else if (s.phase==='pick'){
    study.append(h('div',{class:'muted',style:'margin-top:10px;text-align:center'}, 'Lectura correcta: ', h('b',{class:'jp'},p.it.r), '. Ahora elige cómo se escribe.'));
    const ch=h('div',{class:'choices'});
    p.pick.options.forEach(o=>ch.append(h('button',{lang:'ja',onclick:()=>{ const ok=o===p.pick.correct; [...ch.children].forEach(b=>{ b.disabled=true; if(b.textContent===p.pick.correct) b.classList.add('right'); else if(b.textContent===o&&!ok) b.classList.add('wrong'); }); setTimeout(()=>answerCurrent(ok),350); }},o)));
    study.append(ch);
  } else {
    study.append(c.ok && S.settings.autoNext!==false && !c.full ? quickFeedback(c) : feedbackPanel(c));
  }
}
function evaluate(ans){
  const s=SESSION; if(!s||s.phase!=='ask') return; const c=s.cur, p=c.p; if(c.answer!==undefined) return; const ok=p.check(ans);
  c.answer=ans;
  const input=$('#ans'); if(input){ input.classList.add(ok?'right':'wrong'); input.disabled=true; }
  if (!ok && p.synonym){ const alt=p.synonym(ans); if(alt){ // palabra válida pero no la buscada: no se evalúa, se vuelve a preguntar
    c.syn=alt; c.answer=undefined; s.phase='ask'; renderStudy(); return; } }
  if (ok && p.pick){ s.phase='pick'; setTimeout(renderStudy,250); return; }
  setTimeout(()=>answerCurrent(ok), ok?250:0);
}
// Línea de acierto: la respuesta en una línea y adelante (Enter o espera), sin botones. Las fichas se ven al final de la sesión.
function quickFeedback(c){
  const p=c.p, it=p.it, s=SESSION;
  const line = it.kind==='v' ? h('span',{class:'jp'}, it.w, ' ', h('span',{class:'muted'},'（'+it.r+'）'), ' · ', h('span',{style:'font-family:var(--f-ui)'},it.m.join(', ')))
    : it.kind==='k' ? h('span',{class:'jp'}, it.k, ' · ', kanjiReadings(it).join('・'), ' · ', h('span',{style:'font-family:var(--f-ui)'},it.m.join(', ')))
    : h('span',{class:'jp'}, p.cloze.pre+p.cloze.answers[0]+p.cloze.post);
  const fb=h('div',{class:'feedback quick'}, h('div',{class:'verdict ok'},'Correcto'), h('div',{},line));
  const handler=e=>{ if(e.key==='Enter' && SESSION===s && s.cur===c && s.phase==='feedback'){ e.preventDefault(); nextCard(); } };
  if (s.enterHandler) document.removeEventListener('keydown',s.enterHandler);
  s.enterHandler=handler; document.addEventListener('keydown',handler);
  return fb;
}
function itemDetails(it, p){
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
    const ex=(p&&p.ex)||(it.ex||[])[0]||{j:'',s:''}; const cl=(p&&p.cloze)||parseCloze(ex.j);
    add('Respuesta', h('span',{class:'jp'}, cl.answers.join(' / ')));
    add('Frase', h('div',{}, h('div',{class:'jp'}, cl.pre+cl.answers[0]+cl.post, ' ', spkBtn(cl.pre+cl.answers[0]+cl.post)), h('div',{class:'small muted'}, ex.s)));
    add('Punto', h('span',{}, h('b',{class:'jp'},it.t), ' — ', h('span',{class:'jp'},it.s||'')));
    add('Explicación', it.e||'');
  }
  return dl;
}
function feedbackPanel(c){
  const p=c.p, it=p.it, ok=c.ok;
  const fb=h('div',{class:'feedback'});
  fb.append(h('div',{class:'verdict '+(ok?'ok':'ko')}, ok?'Correcto':'Incorrecto', c.answer?h('span',{class:'muted',style:'font-weight:400'}, ' · tu respuesta: ', h('span',{class:'jp'},p.input==='kana'?toKana(c.answer,true):c.answer)):null));
  fb.append(itemDetails(it, p));
  const rec=S.items[c.k]; if(rec&&rec.s>0) fb.append(h('div',{class:'small muted',style:'margin-top:8px'}, 'Nivel SRS actual: '+STAGE_NAMES[rec.s]));
  const next=h('button',{class:'btn primary big',style:'margin-top:12px',onclick:nextCard},ok&&S.settings.autoNext!==false?'Siguiente':'Siguiente (Enter)');
  fb.append(next);
  const burn=()=>{ const s=SESSION; if(!s||s.cur!==c) return; clearTimeout(s.autoT); const k=c.k, r=s.results[k]; const old=S.items[k]||{c:0,w:0};
    S.items[k]={...old,s:9,due:Infinity,lrn:old.lrn||now(),ls:now()}; s.queue=s.queue.filter(q=>q.k!==k);
    if (r.left.size){ r.left.clear(); s.done++; s.correct++; if(s.mode==='lesson') bump(r.it.kind==='g'?'lg':'l'); else if(s.mode==='review'){ bump('r'); bump('rc'); } }
    s.undo=null; save(); if(s.mode==='review') markClearedIfEmpty(); toast('Quemado: no volverá a salir'); nextCard(); };
  fb.append(h('div',{class:'row',style:'margin-top:8px;justify-content:center'}, h('button',{class:'btn sm ghost',onclick:undoLast},'Deshacer'), !ok?h('button',{class:'btn sm ghost',onclick:markAsCorrect},c.f==='vp'?'Mi palabra también era válida':'Era una errata, estaba bien'):null, ok?h('button',{class:'btn sm ghost',onclick:burn},'Ya lo domino, quemar'):null));
  const sess=SESSION; const handler=e=>{ if(e.key==='Enter' && SESSION===sess && sess.cur===c && sess.phase==='feedback'){ e.preventDefault(); nextCard(); } };
  if (SESSION.enterHandler) document.removeEventListener('keydown',SESSION.enterHandler);
  SESSION.enterHandler=handler; document.addEventListener('keydown',handler); setTimeout(()=>next.focus(),0);
  return fb;
}
// Confirmación dentro de la página (no hay confirm())
function confirmBox(msg, onYes){
  const box=h('div',{class:'card',style:'position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:60;max-width:360px;width:calc(100% - 32px);box-shadow:0 20px 60px rgba(0,0,0,.3)'},
    h('p',{style:'margin:0 0 12px'},msg),
    h('div',{class:'row'}, h('button',{class:'btn',onclick:()=>box.remove()},'Cancelar'), h('span',{class:'sp'}), h('button',{class:'btn warn',onclick:()=>{box.remove();onYes();}},'Sí')));
  document.body.append(box); return true;
}
