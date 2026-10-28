// ===================== Lecciones =====================
function lessonsAvailable(){
  const lv=S.level;
  if (!levelHasContent(lv)) return {items:[], reason:'Este nivel aún no tiene contenido generado.', lock:'gen'};
  const due=dueItems().length;
  if (due>150) return {items:[], reason:`Tienes ${due} repasos pendientes. Las lecciones se desbloquean por debajo de 150.`, lock:'reviews'};
  const w=weeklyStatus(); if (w.overdue) return {items:[], reason:'Tu examen semanal está atrasado. Hazlo para desbloquear las lecciones.', lock:'weekly'};
  const all=itemsOfLevel(lv).filter(it=>!(S.items[keyOf(it)]&&S.items[keyOf(it)].s>0));
  const order={k:0,v:1,g:2}; all.sort((a,b)=>order[a.kind]-order[b.kind]);
  // vocabulario solo después de sus kanji
  const learnedK=new Set(KANJI_ALL.concat(Object.values(S.gen).flatMap(g=>g.kanji||[])).filter(k=>S.items['k|'+k.k]&&S.items['k|'+k.k].s>0).map(k=>k.k));
  const ready=all.filter(it=>it.kind!=='v' || [...it.w].filter(hasKanji).every(ch=>learnedK.has(ch)||!itemsOfLevel(lv).some(x=>x.kind==='k'&&x.k===ch)));
  const list = ready.length?ready:all;
  const todayL=day().l, goal=S.settings.goalLessons;
  return {items:list, reason: list.length?'':'Has completado todas las lecciones de este nivel.', todayLeft:Math.max(0,goal-todayL)};
}
let LESSON=null;
function startLessonBatch(){
  const la=lessonsAvailable(); if(!la.items.length){ toast(la.reason||'No hay lecciones'); return; }
  const batch=la.items.slice(0,5);
  LESSON={batch,i:0}; renderLesson();
}
function renderLesson(){
  const L=LESSON, it=L.batch[L.i], el=$('#main'); el.innerHTML='';
  const dots=h('div',{class:'progress-dots'}, L.batch.map((_,i)=>h('i',{class:i<=L.i?'on':''})));
  const head=h('div',{class:'study-head'}, h('button',{class:'btn sm ghost',onclick:()=>{LESSON=null;go('lecciones');}},'✕ Salir'), h('span',{class:'sp'}), dots, h('span',{class:'badge soft'},`Lección ${L.i+1}/${L.batch.length}`));
  const card=h('div',{class:'prompt-card kind-'+it.kind+' lesson-body'});
  if (it.kind==='k'){
    card.append(h('div',{class:'ask k',style:'text-align:center'},'Kanji nuevo'), h('div',{class:'big-jp',lang:'ja',style:'text-align:center'},it.k), h('div',{class:'big-es',style:'text-align:center;font-size:1.4rem'}, it.m.join(', ')),
      h('div',{class:'readings'}, h('div',{}, h('b',{},'On\'yomi'), h('span',{class:'jp'},(it.on||[]).join('・')||'—')), h('div',{}, h('b',{},'Kun\'yomi'), h('span',{class:'jp'},(it.kun||[]).join('・')||'—'))),
      it.mn?h('div',{class:'mn'}, h('b',{class:'small'},'Mnemotecnia · '), it.mn):null);
    const vs=vocabWithKanji(it.k).slice(0,4); if(vs.length) card.append(h('div',{class:'ex'}, h('div',{class:'eyebrow'},'Palabras con este kanji'), vs.map(v=>h('div',{class:'jp',style:'margin-top:4px'}, v.w, ' ', h('span',{class:'muted'},'（'+v.r+'）'), ' ', h('span',{class:'muted',style:'font-family:var(--f-ui)'}, v.m[0])))));
  } else if (it.kind==='v'){
    card.append(h('div',{class:'ask v',style:'text-align:center'},'Vocabulario nuevo'), h('div',{class:'big-jp',lang:'ja',style:'text-align:center'},it.w), h('div',{class:'mid-jp',style:'text-align:center;color:var(--accent)'}, it.r, ' ', spkBtn(it.w)),
      h('div',{class:'big-es',style:'text-align:center;font-size:1.4rem'}, it.m.join(', ')), it.p?h('div',{class:'small muted',style:'text-align:center'},posLabel(it.p)):null);
    const ks=[...it.w].filter(hasKanji).map(ch=>KANJI_META[ch]||(ITEMS.get('k|'+ch))).filter(Boolean);
    if (ks.length) card.append(h('div',{class:'mn'}, h('b',{class:'small'},'Composición · '), h('span',{class:'jp'}, ks.map(k=>k.k+' ('+(k.m||[])[0]+')').join(' + '))));
    if (it.ex) card.append(h('div',{class:'ex'}, h('div',{class:'jp'}, it.ex, ' ', spkBtn(it.ex)), h('div',{class:'small muted'}, it.es||'')));
    card.append(h('div',{class:'small muted',style:'margin-top:10px'}, 'En los repasos te pediré también la dirección español → japonés: ', h('b',{},it.m[0]), ' → ', h('b',{class:'jp'},it.r), '. Fíjate ahora en cómo se escribe.'));
  } else {
    card.append(h('div',{class:'ask g',style:'text-align:center'},'Gramática nueva'), h('div',{class:'mid-jp',style:'text-align:center;font-weight:700'},it.t), h('div',{class:'small muted jp',style:'text-align:center'}, it.s||''), h('p',{style:'margin:10px 0 0'}, it.e||''));
    (it.ex||[]).forEach(ex=>{ const c=parseCloze(ex.j); card.append(h('div',{class:'ex'}, h('div',{class:'jp'}, c.pre, h('b',{style:'color:var(--leaf)'},c.answers[0]), c.post, ' ', spkBtn(c.pre+c.answers[0]+c.post)), h('div',{class:'small muted'}, ex.s))); });
  }
  el.append(h('div',{class:'study stack'}, head, card,
    h('div',{class:'row'}, L.i>0?h('button',{class:'btn',onclick:()=>{L.i--;renderLesson();}},'← Anterior'):null, h('span',{class:'sp'}),
      L.i<L.batch.length-1 ? h('button',{class:'btn primary',onclick:()=>{L.i++;renderLesson();window.scrollTo(0,0);}},'Siguiente →') : h('button',{class:'btn leaf',onclick:()=>{const b=L.batch;LESSON=null;startSession('lesson',b);}},'Empezar el test de la lección'))));
  window.scrollTo(0,0);
}

// ===================== Exámenes =====================
function weeklyStatus(){
  const learned=learnedKeys().length; if(learned<20) return {available:false, overdue:false, text:'Se activa cuando tengas 20 ítems aprendidos.'};
  const last=S.weekly.last||S.created; const due=last+7*D; const overdue=now()>due+1*D;
  return {available:now()>=due-2*D, overdue, due, text: now()>=due ? (overdue?'Atrasado desde hace '+Math.floor((now()-due)/D)+' d':'Disponible, hazlo hoy') : 'En '+fmtRel(due)};
}
function levelExamStatus(){
  const lv=S.level; const items=itemsOfLevel(lv); if(!items.length) return {ready:false, text:'Sin contenido'};
  const learned=items.filter(it=>S.items[keyOf(it)]&&S.items[keyOf(it)].s>0).length;
  if (learned<items.length) return {ready:false, text:`Aprende los ${items.length-learned} ítems que faltan del nivel`};
  if (S.settings.strict){ const ks=items.filter(i=>i.kind==='k'); const guru=ks.filter(k=>S.items[keyOf(k)].s>=5).length; if(guru<Math.ceil(ks.length*0.75)) return {ready:false,text:`Modo estricto: ${guru}/${Math.ceil(ks.length*0.75)} kanji en Gurú`}; }
  return {ready:true, text:'Listo para el examen de nivel'};
}
function mutateReading(r){
  const ops=[s=>s.replace(/ー/,''), s=>s.replace(/っ/,''), s=>s.includes('っ')?s:s.replace(/(.)([かきくけこさしすせそたちつてとぱぴぷぺぽ])/,'$1っ$2'), s=>s.replace(/[がぎぐげご]/,c=>String.fromCharCode(c.charCodeAt(0)-1)), s=>s.replace(/[かきくけこ]/,c=>String.fromCharCode(c.charCodeAt(0)+1)), s=>s.replace(/う(?=[^う]|$)/,''), s=>s.replace(/([おこそとのほもよろごぞどぼぽ])(?!う)/,'$1う'), s=>s.replace(/[しじ]ゅ/,m=>m[0]+'ゆ'), s=>s.replace(/ょ/,'ゅ'), s=>s.replace(/ゅ/,'ょ'), s=>s.replace(/[はひふへほ]/,c=>String.fromCharCode(c.charCodeAt(0)+2))];
  const out=new Set(); for (const op of shuffle(ops)){ const m=op(r); if(m&&m!==r) out.add(m); if(out.size>=3) break; }
  return [...out];
}
function qKanjiReading(v){ const ds=uniq([...mutateReading(v.r), ...pick(VOCAB_ALL.filter(x=>x.r!==v.r&&Math.abs(x.r.length-v.r.length)<=1).map(x=>x.r),3)]).filter(x=>x!==v.r).slice(0,3); return {sec:'漢字読み', type:'mc', text:v.ex, under:v.w, es:v.es, prompt:'¿Cómo se lee la palabra subrayada?', options:shuffle([v.r,...ds]), answer:v.r, key:keyOf(v)}; }
function qOrthography(v){ const ds=kanjiDistractors(v); if(ds.length<3) return null; return {sec:'表記', type:'mc', text:v.ex.replace(v.w,v.r), under:v.r, es:v.es, prompt:'¿Cómo se escribe la palabra subrayada?', options:shuffle([v.w,...ds]), answer:v.w, key:keyOf(v)}; }
function qContext(v, pool){ const same=pool.filter(x=>x.kind==='v'&&x!==v&&x.p===v.p&&x.w!==v.w); const ds=pick(same.length>=3?same:VOCAB_ALL.filter(x=>x.w!==v.w&&x.p===v.p), 3).map(x=>x.w); if(ds.length<3) return null; return {sec:'文脈規定', type:'mc', text:v.ex.replace(v.w,'（　　）'), es:v.es, prompt:'Elige la palabra que encaja en el hueco', options:shuffle([v.w,...ds]), answer:v.w, key:keyOf(v)}; }
function qGrammar(g, pool){ const ex=rnd(g.ex); const c=parseCloze(ex.j); const others=pool.filter(x=>x.kind==='g'&&x!==g).flatMap(x=>x.ex.map(e=>parseCloze(e.j).answers[0])).filter(a=>a&&a!==c.answers[0]); const near=others.filter(a=>Math.abs(a.length-c.answers[0].length)<=3); const ds=uniq(pick(near.length>=3?near:others,6)).slice(0,3); if(ds.length<3) return null; return {sec:'文法形式', type:'mc', text:c.pre+'（　　）'+c.post, es:ex.s, prompt:'Elige la forma correcta', options:shuffle([c.answers[0],...ds]), answer:c.answers[0], key:keyOf(g)}; }
function qOrder(o){ const star=1+Math.floor(Math.random()*2); return {sec:'並び替え', type:'order', o, star, prompt:'¿Qué parte va en la posición ★?', options:shuffle(o.parts), answer:o.parts[star], es:o.es}; }
function qProduction(v){ return {sec:'producción', type:'typed', prompt:'Escribe en japonés (kana):', es:v.m.join(', ')+(v.p?' · '+posLabel(v.p):''), check:a=>matchKana(a,[v.r]), answer:v.r+(hasKanji(v.w)?'（'+v.w+'）':''), key:keyOf(v)}; }
function qReading(r){ return r.q.map((q,i)=>({sec:'読解', type:'mc', reading:r, text:q.q, prompt:'Lee el texto y responde', options:q.o.slice(), answer:q.o[q.a], key:null})); }
function buildExam(kind){
  let pool, n, title, minutes;
  if (kind==='level'){ pool=itemsOfLevel(S.level); n={kr:4,or:3,ctx:3,gr:5,ord:2,prod:5,rd:0}; title=`Examen de nivel ${S.level}`; minutes=20; }
  else if (kind==='weekly'){ pool=learnedKeys().map(k=>ITEMS.get(k)); n={kr:6,or:4,ctx:5,gr:6,ord:3,prod:6,rd:1}; title='Examen semanal'; minutes=30; }
  else { pool=learnedKeys().map(k=>ITEMS.get(k)); n={kr:12,or:8,ctx:10,gr:14,ord:5,prod:8,rd:2}; title='Simulacro JLPT'; minutes=60; }
  // ítems más débiles primero, mezcla con aleatorios
  const weak=pool.slice().sort((a,b)=>leechScore(S.items[keyOf(b)]||{})-leechScore(S.items[keyOf(a)]||{}));
  const vs=uniq([...weak.filter(i=>i.kind==='v'&&i.ex).slice(0,10), ...shuffle(pool.filter(i=>i.kind==='v'&&i.ex))]);
  const gs=uniq([...weak.filter(i=>i.kind==='g').slice(0,6), ...shuffle(pool.filter(i=>i.kind==='g'))]);
  const qs=[]; let vi=0;
  const take=(fn,count,arr)=>{ let c=0,tries=0; while(c<count&&tries<arr.length*2&&arr.length){ const it=arr[(vi++)%arr.length]; tries++; const q=fn(it); if(q&&!qs.some(x=>x.key===q.key&&x.sec===q.sec)){ qs.push(q); c++; } } };
  take(qKanjiReading,n.kr,vs); take(qOrthography,n.or,vs.filter(v=>hasKanji(v.w))); take(v=>qContext(v,pool),n.ctx,vs); take(g=>qGrammar(g,pool),n.gr,gs);
  const maxLv=Math.max(S.level,2); let ords=ORDER_QS.filter(o=>o.lv<=maxLv && (kind!=='level'||o.lv===S.level)); if(!ords.length) ords=ORDER_QS.filter(o=>o.lv<=maxLv); pick(ords,n.ord).forEach(o=>qs.push(qOrder(o)));
  take(qProduction,n.prod,shuffle(vs));
  if (n.rd){ const rs=READINGS.filter(r=>r.lv<=S.level); pick(rs,n.rd).forEach(r=>qs.push(...qReading(r))); }
  // orden por secciones como el JLPT
  const secOrder=['漢字読み','表記','文脈規定','文法形式','並び替え','読解','producción']; qs.sort((a,b)=>secOrder.indexOf(a.sec)-secOrder.indexOf(b.sec));
  return {kind,title,qs,minutes,i:0,answers:[],start:now(),deadline:now()+minutes*6e4};
}
let EXAM=null, examTimer=null;
function startExam(kind){ const ex=buildExam(kind); if(ex.qs.length<8){ toast('Aún no hay suficiente material aprendido para este examen.'); return; } EXAM=ex; clearInterval(examTimer); examTimer=setInterval(()=>{ const t=$('#timer'); if(!EXAM){clearInterval(examTimer);return;} const left=EXAM.deadline-now(); if(t){ t.textContent=fmtTimer(left); t.classList.toggle('low',left<3*6e4);} if(left<=0){ clearInterval(examTimer); toast('Tiempo agotado'); finishExam(); } },1000); renderExam(); }
const fmtTimer = ms => { ms=Math.max(0,ms); const m=Math.floor(ms/6e4), s=Math.floor(ms%6e4/1000); return m+':'+String(s).padStart(2,'0'); };
function renderExam(){
  const E=EXAM, q=E.qs[E.i], el=$('#main'); el.innerHTML='';
  const head=h('div',{class:'study-head'}, h('button',{class:'btn sm ghost',onclick:()=>confirmBox('¿Abandonar el examen? No se guardará.',()=>{EXAM=null;clearInterval(examTimer);go('examenes');})},'✕'), h('span',{class:'sp'}), h('span',{class:'num'},`${E.i+1}/${E.qs.length}`), h('span',{class:'timer',id:'timer'},fmtTimer(E.deadline-now())));
  const card=h('div',{class:'card stack'});
  card.append(h('div',{class:'row between'}, h('span',{class:'section-tag'}, q.sec), h('span',{class:'small muted'}, E.title)));
  if (q.reading){ card.append(h('details',{open:E.i===0||E.qs[E.i-1].reading!==q.reading}, h('summary',{}, q.reading.title), h('div',{class:'reader small',lang:'ja',style:'font-size:1.05rem;line-height:2'}, plainReading(q.reading)))); }
  card.append(h('div',{class:'small muted'}, q.prompt));
  if (q.type==='order'){ const o=q.o; const parts=o.parts.map((p,i)=> i===q.star? h('span',{class:'slot star'},'★') : h('span',{class:'slot'},'＿')); card.append(h('div',{class:'exam-q',lang:'ja'}, o.pre, ...parts, o.post)); }
  else if (q.text){ const t=q.under? h('span',{html:esc(q.text).replace(esc(q.under),'<u>'+esc(q.under)+'</u>')}) : q.text; card.append(h('div',{class:'exam-q',lang:'ja'}, t)); }
  if (q.es && q.type!=='typed' && E.kind!=='mock') card.append(h('div',{class:'small muted'}, h('details',{}, h('summary',{class:'small'},'Traducción (ayuda)'), q.es)));
  if (q.type==='typed'){
    card.append(h('div',{class:'big-es',style:'font-size:1.4rem'}, q.es));
    const input=h('input',{type:'text',id:'ans',autocomplete:'off',autocapitalize:'off',lang:'ja',placeholder:'romaji → かな'}); kanaInput(input);
    const submit=()=>{ const v=input.value.trim(); if(!v) return; recordExam(q, toKana(v,true), q.check(v)); };
    input.addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault();submit();} });
    card.append(h('div',{class:'answer'}, input, h('button',{class:'btn primary',onclick:submit},'→'))); setTimeout(()=>input.focus(),0);
  } else {
    const ch=h('div',{class:'choices text'+(q.options.some(o=>o.length>12)?' one':'')});
    q.options.forEach((o,i)=>ch.append(h('button',{lang:'ja',onclick:()=>recordExam(q,o,o===q.answer)}, h('span',{class:'muted small',style:'margin-right:8px'},(i+1)+'.'), o)));
    card.append(ch);
    const kh=e=>{ const n=parseInt(e.key); if(n>=1&&n<=q.options.length){ document.removeEventListener('keydown',kh); recordExam(q,q.options[n-1],q.options[n-1]===q.answer);} };
    document.addEventListener('keydown',kh); E._kh=kh;
  }
  el.append(h('div',{class:'study stack'}, head, card));
  window.scrollTo(0,0);
}
function recordExam(q, given, ok){ const E=EXAM; if(E._kh) document.removeEventListener('keydown',E._kh); E.answers.push({sec:q.sec, ok, given, answer:q.answer, key:q.key, es:q.es, text:q.text||(q.o?q.o.pre+q.o.parts.join('')+q.o.post:'')}); E.i++; if(E.i>=E.qs.length) finishExam(); else renderExam(); }
function finishExam(){
  const E=EXAM; EXAM=null; clearInterval(examTimer);
  const total=E.qs.length, ok=E.answers.filter(a=>a.ok).length, pct=Math.round(100*ok/total);
  const secs={}; E.answers.forEach(a=>{ const s=secs[a.sec]=secs[a.sec]||{ok:0,n:0}; s.n++; if(a.ok) s.ok++; });
  // consecuencias: los fallos bajan de nivel SRS y vuelven ya
  let penal=0; E.answers.filter(a=>!a.ok&&a.key&&S.items[a.key]&&S.items[a.key].s>0).forEach(a=>{ const r=S.items[a.key]; r.s=Math.max(1,r.s-1); r.due=now(); r.w=(r.w||0)+1; penal++; });
  const rec={kind:E.kind,date:now(),score:pct,ok,total,secs,level:S.level,minutes:Math.round((now()-E.start)/6e4)}; S.exams.push(rec); bump('ex');
  let passed=false, msg='';
  if (E.kind==='weekly'){ S.weekly.last=now(); msg = pct>=80?'Buen examen semanal. Mantén el ritmo.': pct>=60?'Aprobado justo. Los fallos ya están de vuelta en tu cola de repasos.':'Por debajo del 60 %. Esta semana toca repasar más y avanzar menos: los fallos vuelven a la cola ahora.'; }
  if (E.kind==='level'){ passed=pct>=80; if(passed){ S.levelPass[S.level]=pct; if(S.level<MAX_LEVEL) S.level++; msg=`Nivel superado. Bienvenido al nivel ${S.level}.`; } else msg='Necesitas un 80 % para subir de nivel. Los fallos ya están en tu cola: repásalos y repite el examen mañana.'; }
  if (E.kind==='mock'){ msg = pct>=60 ? 'Por encima del umbral orientativo de aprobado del JLPT (60 %).' : 'Por debajo del umbral orientativo del JLPT (60 %). Mira las secciones débiles.'; }
  save();
  const el=$('#main'); el.innerHTML='';
  el.append(h('div',{class:'study stack'},
    h('div',{class:'card',style:'text-align:center'}, h('div',{class:'eyebrow'},E.title), h('div',{class:'score '+(pct>=(E.kind==='level'?80:60)?'pass':'fail')},pct+'%'), h('div',{class:'muted'},`${ok}/${total} · ${rec.minutes} min`), h('p',{},msg), penal?h('div',{class:'small muted'},`${penal} ${plural(penal,'ítem','ítems')} han bajado de nivel SRS y están pendientes ahora.`):null),
    h('div',{class:'result-grid'}, Object.entries(secs).map(([s,v])=>h('div',{class:'card'}, h('div',{class:'section-tag'},s), h('div',{class:'num',style:'font-weight:700;font-size:1.2rem'},`${v.ok}/${v.n}`), h('div',{class:'bar gold'},h('i',{style:'width:'+Math.round(100*v.ok/v.n)+'%'}))))),
    h('div',{class:'card'}, h('h3',{},'Revisión de fallos'), h('div',{class:'tscroll'}, h('table',{}, h('thead',{},h('tr',{},h('th',{},'Pregunta'),h('th',{},'Tu respuesta'),h('th',{},'Correcta'))), h('tbody',{}, E.answers.filter(a=>!a.ok).map(a=>h('tr',{}, h('td',{class:'jp'},a.text||a.es||''), h('td',{class:'jp',style:'color:var(--warn)'},a.given), h('td',{class:'jp',style:'color:var(--ok)'},a.answer)))), E.answers.every(a=>a.ok)?h('tr',{},h('td',{colspan:3},'Sin fallos. Impecable.')):null))),
    h('div',{class:'row'}, penal?h('button',{class:'btn warn',onclick:()=>startReviews()},'Repasar los fallos ahora'):null, h('button',{class:'btn primary',onclick:()=>go('hoy')},'Volver a Hoy'))
  ));
  window.scrollTo(0,0);
}
function plainReading(r){ return r.t.replace(/\[([^|\]]+)\|[^\]]*\]/g,'$1'); }

// ===================== Repasos =====================
function startReviews(onlyLeeches=false){
  let due=dueItems();
  if (onlyLeeches){ due=leeches(); if(!due.length){toast('No tienes sanguijuelas ahora mismo.');return;} startSession('drill',due); return; }
  if (!due.length){ toast('No hay repasos pendientes'); return; }
  due.sort((a,b)=>S.items[keyOf(a)].due-S.items[keyOf(b)].due);
  startSession('review', due.slice(0,S.settings.maxReviews||100));
}
function leeches(){ return Object.entries(S.items).filter(([k,r])=>r.s>0&&r.s<9&&ITEMS.has(k)&&(r.w||0)>=3&&leechScore(r)>=1).sort((a,b)=>leechScore(b[1])-leechScore(a[1])).slice(0,10).map(([k])=>ITEMS.get(k)); }
