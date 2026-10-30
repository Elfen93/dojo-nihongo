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
// Palabras que el propio alumno ya marcó como válidas para este ítem
const meaningAlts = it => glossAlts(keyOf(it)+'#m');
function customAlt(it, typed){ const t=normKana(toKana(typed,true)); const list=glossAlts(keyOf(it)); return t&&list.includes(t)?{w:t,r:t,custom:true}:null; }
function kanjiDistractors(v){
  const word=v.w; const chars=[...word].filter(c=>hasKanji(c));
  let pool = VOCAB_ALL.filter(x=>x.w!==word && hasKanji(x.w) && !(VOCAB_BY_WORD[x.w]||[]).some(y=>y.r===v.r&&y.w===v.w));
  const share = pool.filter(x=>chars.some(c=>x.w.includes(c)));
  const sameLen = pool.filter(x=>x.w.length===word.length && !share.includes(x));
  const out = uniq([...pick(share,2), ...shuffle(sameLen), ...shuffle(pool)].map(x=>x.w)).filter(w=>w!==word).slice(0,3);
  return out;
}
// Registro: la respuesta debe seguir el registro de la frase (cortés o casual); solo se detecta para avisar si te equivocas de registro
const REG_PAIRS=[['ていませんでした','ていなかった'],['でいませんでした','でいなかった'],['ていました','ていた'],['でいました','でいた'],['ています','ている'],['でいます','でいる'],['ていません','ていない'],['でいません','でいない'],['ではありませんでした','ではなかった'],['じゃありませんでした','じゃなかった'],['ではありません','ではない'],['じゃありません','じゃない'],['でした','だった'],['でしょう','だろう'],['です','だ']];
function regVariants(a){
  const out=[]; for (const [pol,pl] of REG_PAIRS){ if(a.endsWith(pol)){ out.push(a.slice(0,-pol.length)+pl); if(pol==='です'&&/い$/.test(a.slice(0,-2))) out.push(a.slice(0,-2)); break; } if(a.endsWith(pl)){ out.push(a.slice(0,-pl.length)+pol); break; } }
  return out;
}
const isPoliteAns=a=>REG_PAIRS.some(([pol])=>a.endsWith(pol))||/(ます|ました|ません|ましょう)$/.test(a);
// Construye la pregunta de una faceta
function buildPrompt(it, facet){
  const p={it,facet};
  if (facet==='km'){ p.kind='k'; p.main=it.k; p.ask='Significado'; p.input='es'; p.check=a=>matchEs(a,[...it.m,...meaningAlts(it)]); p.correct=it.m.join(', '); }
  else if (facet==='kr'){ p.kind='k'; p.main=it.k; p.ask='Lectura (cualquiera)'; p.input='kana'; const acc=kanjiReadings(it); p.check=a=>matchKana(a,acc); p.correct=acc.join('・'); }
  else if (facet==='vm'){ p.kind='v'; p.main=it.w; p.ask='Significado'; p.input='es'; p.check=a=>matchEs(a,[...it.m,...meaningAlts(it)]); p.correct=it.m.join(', '); }
  else if (facet==='vr'){ p.kind='v'; p.main=it.w; p.ask='Lectura'; p.input='kana'; p.check=a=>matchKana(a,[it.r]); p.correct=it.r; }
  else if (facet==='vp'){ p.kind='p'; p.mainEs=it.m.join(', '); p.sub=it.p?posLabel(it.p):''; p.ask='Escribe la palabra en japonés'; p.input='kana'; p.check=a=>matchKana(a,[it.r]); p.synonym=a=>vocabSynonym(it,a)||customAlt(it,a); p.hint=(typeof VOCAB_HINT!=='undefined'&&VOCAB_HINT[it.w])||''; p.correct=it.r+(hasKanji(it.w)?'（'+it.w+'）':''); if (hasKanji(it.w)) { p.pick={correct:it.w, options:shuffle([it.w,...kanjiDistractors(it)])}; } }
  else if (facet==='gc'){ p.kind='g'; const ex = it._ex || rnd(it.ex); const c=parseCloze(ex.j); p.cloze=c; p.ex=ex; p.ask='Completa'; p.input='kana'; const acc=uniq([...c.answers, ...(ex.k?[ex.k]:[]), ...(typeof CLOZE_KANA!=='undefined'&&CLOZE_KANA[c.answers[0]]?[CLOZE_KANA[c.answers[0]]]:[])]); const alt=acc.flatMap(regVariants); const hit=(list,a)=>{ const t=toKana(a,true); return list.some(x=>normKana(x)===normKana(t)) || list.some(x=>x===a.trim()); }; p.check=a=>hit(acc,a); p.viaReg=a=>!hit(acc,a)&&hit(alt,a); if (alt.length){ const polite=isPoliteAns(c.answers[0]); const rec=S.items[keyOf(it)]; if(!rec||rec.s<5) p.reg=polite?'Registro: cortés':'Registro: casual'; p.regPolite=polite; } p.correct=c.answers[0]; }
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
      null
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
  return h('div',{class:'card'}, h('h3',{}, s.mode==='lesson'?'Lo aprendido en esta lección':'Lo repasado en esta sesión'), h('div',{class:'small muted',style:'margin:2px 0 8px'}, nf?`${nf} ${plural(nf,'fallado')} · ${rs.length-nf} ${plural(rs.length-nf,'acertado')}`:'Todo acertado'), h('div',{class:'sess'}, rs.map(card)));
}
// Fila de la cola de repasos: solo el ítem y su etapa; sin lectura ni significado para no adelantar la respuesta
function itemRow(it){
  const rec=S.items[keyOf(it)]||{s:0};
  const main = it.kind==='k'?it.k : it.kind==='v'?it.w : it.t;
  return h('div',{class:'item'}, h('span',{class:'pill '+it.kind}, it.kind==='k'?'kanji':it.kind==='v'?'vocab':'gram.'), h('div',{style:'min-width:0;flex:1'}, h('div',{class:'t jp'},main)), h('span',{class:'badge soft'},STAGE_NAMES[rec.s]||'Nuevo'));
}

// ===================== Tarjeta de estudio =====================
let imeComposing=false;
function kanaInput(input){
  if (!input) return;
  let nnTail=false, lastConv='';
  input.addEventListener('input', e=>{
    if (imeComposing) return;
    const v=input.value; if(!/[a-zA-Z\-~']/.test(v)) return;
    let conv=toKana(v);
    // "nn" da ん al instante; si justo después llega una vocal, esa n abre la sílaba (konni → こんに)
    if (nnTail && v.length===lastConv.length+1 && v.startsWith(lastConv) && /[aiueoy]/i.test(v.slice(-1))) conv=toKana(lastConv+'n'+v.slice(-1));
    nnTail=/nn$/i.test(v)&&conv.endsWith('ん'); lastConv=conv;
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
    card.append(h('div',{class:'mid-jp',lang:'ja'}, ...furiText(cl.pre), h('span',{class:'blank'}, s.phase==='ask'?'　　　':cl.answers[0]), ...furiText(cl.post)));
    const ask=s.phase==='ask'; const hidden=ask&&!S.settings.showTrans; const trans=h('div',{class:'muted',style:hidden?'display:none':''}, p.ex.s);
    card.append(trans);
    if (hidden) card.append(h('button',{class:'btn sm ghost',onclick:e=>{ trans.style.display=trans.style.display==='none'?'':'none'; e.currentTarget.textContent=trans.style.display==='none'?'Ver traducción':'Ocultar traducción'; }},'Ver traducción'));
    if (p.ex.h) card.append(h('div',{class:'small muted'}, 'Pista: ', h('span',{class:'jp'},...furiText(p.ex.h))));
    card.append(h('div',{class:'small'}, ask?null:h('span',{class:'pill g'}, p.it.t), p.reg?h('span',{class:'badge soft',style:ask?'':'margin-left:6px',title:'Registro que pide la frase'},p.reg):null));
  } else if (c.f==='vp'){
    card.append(h('div',{class:'big-es'}, p.mainEs));
    if (p.hint) card.append(h('div',{class:'small',style:'color:var(--accent);font-weight:600'}, p.hint));
    if (p.sub) card.append(h('div',{class:'small muted'}, p.sub));
  } else {
    card.append(h('div',{class:'big-jp',lang:'ja'}, p.main));
    if (p.kind==='v' && p.it.p) card.append(h('div',{class:'small muted'}, posLabel(p.it.p)));
  }
  el.append(h('div',{class:'study'}, head, card));
  const study=el.firstChild;
  if (s.phase==='ask'){
    if (c.syn){ const a=c.syn; study.append(h('div',{class:'push warnish',style:'margin-top:10px'}, a.custom?h('span',{class:'jp'},'«'+a.w+'»'):h('span',{class:'jp'}, a.w, '（'+a.r+'）'), a.custom?' ya la marcaste como válida, pero no es la palabra que buscamos aquí. Prueba con otra.':' también es correcto y significa lo mismo, pero no es la palabra que buscamos aquí. Prueba con otra.')); }
    const input=h('input',{type:'text',id:'ans',autocomplete:'off',autocapitalize:'off',autocorrect:'off',spellcheck:'false',lang:p.input==='kana'?'ja':'es',placeholder:p.input==='kana'?'romaji → かな':'en español',inputmode:'text'});
    if (p.input==='kana') kanaInput(input);
    const sendBtn=h('button',{class:'btn primary',title:'Responder'},'→');
    const submit=()=>{ if(SESSION!==s||s.cur!==c||s.phase!=='ask'||c.answer!==undefined) return; const v=input.value.trim(); if(!v) return; if(p.input==='kana') input.value=toKana(v,true); sendBtn.disabled=true; evaluate(input.value.trim()); };
    sendBtn.addEventListener('click',submit);
    input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } });
    study.append(h('div',{class:'answer'}, input, sendBtn));
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
  c.answer=ans; if(!ok&&p.viaReg&&p.viaReg(ans)) c.regNote=p.regPolite?'Tu respuesta es correcta, pero en otro registro: esta frase pide la forma cortés (です・ます).':'Tu respuesta es correcta, pero en otro registro: esta frase pide la forma casual (sin です・ます).';
  const input=$('#ans'); if(input){ input.classList.add(ok?'right':'wrong'); input.disabled=true; }
  if (!ok && p.synonym){ const alt=p.synonym(ans); if(alt){ // palabra válida pero no la buscada: no se evalúa, se vuelve a preguntar
    c.syn=alt; c.answer=undefined; s.phase='ask'; renderStudy(); return; } }
  if (ok && p.pick){ s.phase='pick'; setTimeout(renderStudy,250); return; }
  setTimeout(()=>answerCurrent(ok), ok?250:0);
}
// Línea de acierto: la respuesta en una línea y adelante (Enter o espera), sin botones. Las fichas se ven al final de la sesión.
function quickFeedback(c){
  const s=SESSION;
  const fb=h('div',{class:'feedback quick'}, h('div',{class:'verdict ok'},'Correcto'));
  const handler=e=>{ if(e.key==='Enter' && SESSION===s && s.cur===c && s.phase==='feedback'){ e.preventDefault(); nextCard(); } };
  if (s.enterHandler) document.removeEventListener('keydown',s.enterHandler);
  s.enterHandler=handler; document.addEventListener('keydown',handler);
  return fb;
}

// Carga diferida de las fichas ampliadas y del furigana (ext.js): la app arranca sin ellas
let EXT_STATE=0; const EXT_WAIT=[];
function loadExt(){
  return new Promise(res=>{
    if(EXT_STATE===2) return res();
    EXT_WAIT.push(res); if(EXT_STATE===1) return; EXT_STATE=1;
    const s=document.createElement('script'); s.src='ext.js';
    s.onload=()=>{ EXT_STATE=2; EXT_WAIT.splice(0).forEach(f=>f()); };
    s.onerror=()=>{ EXT_STATE=0; EXT_WAIT.splice(0).forEach(f=>f()); };
    document.head.append(s);
  });
}
// Furigana según lo aprendido: visible mientras algún kanji de la palabra no esté en Gurú; después, solo al pasar el ratón o tocar
const furiCache={};
const furiMode=()=>(S.settings&&S.settings.furiMode)||'auto';
const kanjiLearned=ch=>{ const r=S.items['k|'+ch]; return !!r&&r.s>=5; };
const tokenLearned=sf=>[...sf].filter(hasKanji).every(kanjiLearned);
let GLOSS_IDX=null;
function glossOf(sf){
  if(!GLOSS_IDX){ GLOSS_IDX={}; for(const v of VOCAB_ALL){ const core=String(v.w).replace(/[ぁ-んー]+$/,''); if(core&&hasKanji(core)&&!GLOSS_IDX[core]) GLOSS_IDX[core]=(v.m||[]).slice(0,2).join(', '); } }
  if(GLOSS_IDX[sf]) return GLOSS_IDX[sf];
  if([...sf].length===1){ const k=(typeof KANJI_META!=='undefined'&&KANJI_META[sf])||ITEMS.get('k|'+sf); if(k) return (k.m||[]).slice(0,2).join(', '); }
  const ks=[...sf].filter(hasKanji).map(c=>(typeof KANJI_META!=='undefined'&&KANJI_META[c])||ITEMS.get('k|'+c));
  if(ks.length&&ks.every(Boolean)) return 'Kanji: '+ks.map(k=>k.k+' '+((k.m||[])[0]||'')).join(' · ');
  return '';
}
function showWordBubble(el,sf,rd){
  document.querySelectorAll('.fgbubble').forEach(x=>x.remove());
  const g=glossOf(sf); const r=el.getBoundingClientRect();
  const b=h('div',{class:'fgbubble'}, h('b',{class:'jp'},sf+'（'+rd+'）'), g?h('div',{},g):null);
  document.body.append(b); const w=b.offsetWidth;
  b.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px'; b.style.top=(r.bottom+window.scrollY+6)+'px';
  const off=()=>{ b.remove(); document.removeEventListener('click',off,true); };
  setTimeout(()=>document.addEventListener('click',off,true),0); setTimeout(off,6000);
}
// Furigana por palabra, bajo demanda: FURI[texto] = "kanji|lectura;kanji|lectura"
function furiNodes(str){
  const f=FURI[str]; if(!f||furiMode()==='never') return [str];
  let pairs=furiCache[str]; if(!pairs) pairs=furiCache[str]=f.split(';').map(x=>x.split('|'));
  const out=[]; let cur=0; const mode=furiMode();
  for (const [sf,rd] of pairs){ const i=str.indexOf(sf,cur); if(i<0) continue; if(i>cur) out.push(str.slice(cur,i));
    const learned=mode==='auto'&&tokenLearned(sf);
    out.push(h('ruby',{class:'fg '+(learned?'ln':'un'),onclick:e=>{ e.stopPropagation(); showWordBubble(e.currentTarget,sf,rd); }}, sf, h('rt',{},rd))); cur=i+sf.length; }
  if(cur<str.length) out.push(str.slice(cur)); return out;
}
// Texto japonés cualquiera con furigana según lo aprendido
function furiText(t){ const out=[]; let last=0; t=String(t||''); for (const m of t.matchAll(JP_RUN)){ if(m.index>last) out.push(t.slice(last,m.index)); out.push(...furiNodes(m[0])); last=m.index+m[0].length; } if(last<t.length) out.push(t.slice(last)); return out; }
// Texto con los términos japoneses resaltados
const JP_RUN=/[\u3040-\u30ff\u3400-\u9fff〜～々ー・]+/g;
function richJp(text){
  const out=[]; let last=0; text=String(text||'');
  for (const m of text.matchAll(JP_RUN)){ if(m.index>last) out.push(text.slice(last,m.index)); out.push(h('span',{class:'gs-term'},...furiNodes(m[0]))); last=m.index+m[0].length; }
  if(last<text.length) out.push(text.slice(last)); return out;
}
// Ficha completa de un punto de gramática: estructura, detalles, explicación, nota, ejemplos y comparaciones
function grammarSheet(it, opts={}){
  const X=(typeof GRAM_EXT!=='undefined'&&GRAM_EXT[it.id])||{};
  const sec=(t,...kids)=>h('div',{class:'gs-sec'}, h('div',{class:'eyebrow'},t), ...kids);
  const root=h('div',{class:'gs'});
  const plain=furiText;
  if (EXT_STATE!==2) loadExt().then(()=>{ if(EXT_STATE===2&&root.isConnected) root.replaceWith(grammarSheet(it,opts)); });
  root.append(h('div',{class:'gs-head'}, h('div',{class:'gs-title'},...plain(it.t)), it.s?h('div',{class:'gs-formula'},...plain(it.s)):null,
    (X.cat||X.reg)?h('div',{class:'gs-chips'}, X.cat?h('span',{class:'badge soft'},tr(X.cat)):null, X.reg?h('span',{class:'badge soft'},tr(X.reg)):null):null,
    EXT_STATE===2?h('div',{class:'gs-tools'}, h('button',{class:'btn sm ghost',title:tr('Toca una palabra con kanji para ver su lectura'),onclick:e=>{ root.classList.toggle('allfg'); e.currentTarget.textContent=root.classList.contains('allfg')?tr('Ocultar furigana'):tr('Mostrar todo el furigana'); }},tr('Mostrar todo el furigana'))):null));
  const about=(X.about&&X.about.length)?X.about:[it.e||''];
  root.append(sec(tr('Cómo se usa'), h('div',{class:'gs-about'}, ...about.map(p=>h('p',{},...richJp(p))))));
  if (X.ojo) root.append(h('div',{class:'gs-ojo'}, h('b',{},tr('Ojo')), ...richJp(X.ojo)));
  const exs=[...(it.ex||[]).map(e=>{ const c=parseCloze(e.j); return {pre:c.pre,mid:c.answers[0],post:c.post,es:e.s}; }), ...((X.m||[]).map(e=>({pre:e.j,mid:'',post:'',es:e.s})))];
  const row=(e,i)=>h('div',{class:'gs-ex'}, h('span',{class:'n'},i+1), h('div',{class:'t'}, h('div',{class:'j',lang:'ja'}, ...plain(e.pre), e.mid?h('mark',{},...plain(e.mid)):null, ...plain(e.post)), h('div',{class:'es'},e.es)), spkBtn(e.pre+e.mid+e.post));
  const SHOW=4; const first=exs.slice(0,SHOW), rest=exs.slice(SHOW);
  root.append(sec(tr('Ejemplos'), h('div',{class:'gs-exs'}, first.map((e,i)=>row(e,i))), rest.length?h('details',{class:'gs-more',style:'margin-top:8px'}, h('summary',{},tr('Ver {n} más',{n:rest.length})), h('div',{class:'gs-exs'}, rest.map((e,i)=>row(e,SHOW+i)))):null));
  const rel=X.r||[];
  if (rel.length){
    const KIND={sin:tr('Parecido'),ant:tr('Opuesto'),rel:tr('Relacionado')};
    const det=h('details',{class:'gs-more'}, h('summary',{},tr('Compáralo con otros puntos ({n})',{n:rel.length})));
    rel.forEach(r=>{ const tgt=r.id&&ITEMS.get('g|'+r.id); det.append(h('div',{class:'gs-rel'}, h('div',{class:'top'}, h('span',{class:'kind '+r.k},KIND[r.k]||r.k), tgt?h('button',{class:'pill g jp',onclick:()=>itemSheet(tgt)},r.t):h('b',{class:'jp'},r.t)), h('div',{class:'d'},...richJp(r.d)))); });
    root.append(det);
  }
  root.append(h('div',{class:'gs-review'}, reviewInline(keyOf(it),it.t)));
  return root;
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
    if (it.ex) add('Ejemplo', h('div',{}, h('div',{class:'jp'}, ...furiText(it.ex), ' ', spkBtn(it.ex)), h('div',{class:'small muted'}, it.es||'')));
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
  if (c.regNote) fb.append(h('div',{class:'push info small',style:'margin-top:8px'},c.regNote));
  fb.append(itemDetails(it, p));
  const rec=S.items[c.k]; if(rec&&rec.s>0) fb.append(h('div',{class:'small muted',style:'margin-top:8px'}, 'Nivel SRS actual: '+STAGE_NAMES[rec.s]));
  const next=h('button',{class:'btn primary big',style:'margin-top:12px',onclick:nextCard},ok&&S.settings.autoNext!==false?'Siguiente':'Siguiente (Enter)');
  fb.append(next);
  const burn=()=>{ const s=SESSION; if(!s||s.cur!==c) return; clearTimeout(s.autoT); const k=c.k, r=s.results[k]; const old=S.items[k]||{c:0,w:0};
    S.items[k]={...old,s:9,due:Infinity,lrn:old.lrn||now(),ls:now()}; s.queue=s.queue.filter(q=>q.k!==k);
    if (r.left.size){ r.left.clear(); s.done++; s.correct++; if(s.mode==='lesson') bump(r.it.kind==='g'?'lg':'l'); else if(s.mode==='review'){ bump('r'); bump('rc'); } }
    s.undo=null; save(); if(s.mode==='review') markClearedIfEmpty(); toast('Quemado: no volverá a salir'); nextCard(); };
  fb.append(h('div',{class:'row',style:'margin-top:8px;justify-content:center'}, h('button',{class:'btn sm ghost',onclick:undoLast},'Deshacer'), reportBtn(c.k,it.kind==='k'?it.k:it.kind==='v'?it.w:it.t), !ok?h('button',{class:'btn sm ghost',onclick:(c.f==='km'||c.f==='vm')?()=>{ const t=(c.answer||'').trim().toLowerCase(); if(!t) return; addAlt(c.k+'#m',t).then(shared=>toast(shared?'Añadido al glosario común':'Anotado: esa respuesta también vale')); markAsCorrect(); }:c.f==='vp'?()=>{ const t=normKana(toKana(c.answer||'',true)); if(!t) return; const k=c.k; addAlt(k,t).then(shared=>{ if(shared) toast('Añadido al glosario común'); }); undoLast(); if(SESSION&&SESSION.cur){ SESSION.cur.syn={w:t,r:t,custom:true}; renderStudy(); } }:markAsCorrect},c.f==='vp'?'Mi palabra también era válida (sin penalizar)':(c.f==='km'||c.f==='vm')?'Mi respuesta también era válida':'Era una errata, estaba bien'):null, ok?h('button',{class:'btn sm ghost',onclick:burn},'Ya lo domino, quemar'):null));
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
