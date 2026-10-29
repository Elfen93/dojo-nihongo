// ===================== Lectura =====================
let READER={id:null, sel:null, furi:false, trans:false, answers:{}};
function renderLectura(){
  const el=$('#main'); el.innerHTML='';
  if (!READER.id){
    el.append(h('div',{class:'topline'}, h('h1',{},'Lectura'), h('span',{class:'muted small'},'Al estilo Satori Reader: toca una palabra para verla.')));
    const list=h('div',{class:'list'});
    const ordered=allReadings().filter(r=>!r.user).sort((a,b)=>(a.lv-b.lv)||(a.id>b.id?1:-1)); const userR=allReadings().filter(r=>r.user);
    let prevDone=true;
    [...ordered,...userR].forEach(r=>{ const done=S.readings[r.id]; let unlocked=(r.lv||1)<=S.level; if(!r.user){ unlocked=unlocked&&prevDone; prevDone=!!done; } list.append(h('button',{class:'item'+(done?' done':'')+(unlocked?'':' locked'),disabled:!unlocked,onclick:()=>{READER={id:r.id,sel:null,furi:S.settings.furigana,trans:false,answers:{}};renderLectura();}}, h('div',{style:'flex:1;min-width:0'}, h('div',{class:'t jp'},r.title), h('div',{class:'small muted'}, r.sub+' · nivel '+r.lv+(unlocked?'':((r.lv||1)>S.level?' · se desbloquea en el nivel '+r.lv:' · termina la lectura anterior')))), done?h('span',{class:'badge ok'},done.score+'%'):unlocked?h('span',{class:'badge soft'},r.user?'Importada':'Nueva'):h('span',{class:'badge soft'},'—'))); });
    el.append(list);
    el.append(h('p',{class:'small muted',style:'margin-top:10px'},'Las lecturas se abren en orden: termina una (responde sus preguntas) para pasar a la siguiente. Las importadas no tienen orden.'));
    el.append(importReadingCard());
    el.append(h('div',{class:'card soft',style:'margin-top:12px'}, h('h3',{},'Lectura graduada gratuita fuera de la app'), h('p',{class:'small',style:'margin:6px 0 0'},'Los libros de ', h('a',{href:'https://tadoku.org/japanese/en/free-books-en/',target:'_blank',rel:'noopener'},'Tadoku'), ' (niveles 0 a 5) y ', h('a',{href:'https://www3.nhk.or.jp/news/easy/',target:'_blank',rel:'noopener'},'NHK News Web Easy'), ' son gratis. Copia el texto y pégalo arriba en "Importar texto" para leerlo aquí con glosario y preguntas.')));
    el.append(h('p',{class:'small muted',style:'margin-top:14px'},'Lee sin furigana primero (ajuste por defecto). Solo cuando te atasques, toca la palabra. Después responde en japonés: así es el 読解 del JLPT.'));
    return;
  }
  const r=allReadings().find(x=>x.id===READER.id); if(!r){ READER.id=null; return renderLectura(); }
  const reader=h('div',{class:'reader'+(READER.furi?'':' nofuri'),lang:'ja'});
  const re=/\[([^|\]]+)\|([^|\]]*)\|([^\]]*)\]/g; let last=0, m;
  const addPlain=t=>{ t.split(/\r?\n|\\n/).forEach((part,i)=>{ if(i) reader.append(h('br')); if(part) reader.append(part); }); };
  while((m=re.exec(r.t))){ addPlain(r.t.slice(last,m.index)); const [,w,rd,gl]=m; const tok=h('span',{class:'tok',onclick:()=>{ [...reader.querySelectorAll('.tok.sel')].forEach(x=>x.classList.remove('sel')); tok.classList.add('sel'); READER.sel={w,rd,gl}; renderGloss(); }}, rd&&rd!==w?h('ruby',{},w,h('rt',{},rd)):w); reader.append(tok); last=m.index+m[0].length; }
  addPlain(r.t.slice(last));
  // botones de audio por frase: tras cada 。
  (function(){ const nodes=[...reader.childNodes]; reader.innerHTML=''; let sent=h('span',{class:'sent'}); let txt=''; const flush=()=>{ if(!sent.childNodes.length) return; const t=txt; const s=sent; const btn=h('button',{class:'sent-play',title:'Escuchar esta frase',onclick:e=>{ e.stopPropagation(); [...reader.querySelectorAll('.sent.reading')].forEach(x=>x.classList.remove('reading')); s.classList.add('reading'); speak(t); const iv=setInterval(()=>{ if(!speaking){ s.classList.remove('reading'); clearInterval(iv); } },300); }},'音'); s.append(btn); reader.append(s); sent=h('span',{class:'sent'}); txt=''; }; nodes.forEach(n=>{ if(n.nodeName==='BR'){ flush(); reader.append(n); return; } if(n.nodeType===3){ let str=n.textContent; while(str.length){ const i=str.indexOf('。'); if(i<0){ sent.append(str); txt+=str; break; } sent.append(str.slice(0,i+1)); txt+=str.slice(0,i+1); flush(); str=str.slice(i+1); } } else { sent.append(n); txt+=(n.querySelector('rt')?n.textContent.replace(n.querySelector('rt').textContent,''):n.textContent); } }); flush(); })();
  const gloss=h('div',{id:'gloss'});
  const qa=h('div',{class:'stack',style:'margin-top:16px'});
  r.q.forEach((q,qi)=>{ const box=h('div',{class:'card'}, h('div',{class:'jp',style:'font-weight:600'},(qi+1)+'. '+q.q)); const ch=h('div',{class:'choices text one'}); q.o.forEach((o,oi)=>ch.append(h('button',{lang:'ja',onclick:()=>{ if(READER.answers[qi]!=null) return; READER.answers[qi]=oi; [...ch.children].forEach((b,i)=>{ b.disabled=true; if(i===q.a) b.classList.add('right'); else if(i===oi) b.classList.add('wrong'); }); checkReadingDone(r); }},o))); box.append(ch); qa.append(box); });
  el.append(h('div',{class:'stack'},
    h('div',{class:'study-head'}, h('button',{class:'btn sm ghost',onclick:()=>{READER.id=null;renderLectura();}},'← Lecturas'), h('span',{class:'sp'}), h('button',{class:'btn sm',onclick:()=>{READER.furi=!READER.furi;reader.classList.toggle('nofuri');}},'Furigana'), h('button',{class:'btn sm',onclick:()=>speak(plainReading(r))},'音 Leer / parar'), h('button',{class:'btn sm',onclick:()=>{READER.trans=!READER.trans;$('#trans').hidden=!READER.trans;}},'Traducción')),
    h('h1',{class:'jp'},r.title), h('div',{class:'muted small'},r.sub),
    h('div',{class:'card'}, reader),
    gloss,
    h('div',{id:'trans',class:'card soft',hidden:true}, r.es),
    r.g&&r.g.length ? h('div',{class:'small muted'}, 'Gramática que aparece: ', r.g.map(id=>ITEMS.get('g|'+id)).filter(Boolean).map(g=>h('span',{class:'pill g jp',style:'margin:2px'},g.t))) : null,
    h('h2',{},'Preguntas'), qa,
    r.notes&&r.notes.length ? h('div',{class:'card soft'}, h('div',{class:'eyebrow'},'Notas'), h('ul',{class:'small',style:'margin:6px 0 0;padding-left:18px'}, r.notes.map(n=>h('li',{},n)))) : null,
    h('div',{class:'row'}, h('button',{class:'btn',onclick:()=>addReadingVocab(r)},'Añadir palabras nuevas a mis repasos'), r.user?h('button',{class:'btn sm warn ghost',onclick:()=>confirmBox('¿Borrar esta lectura importada?',()=>{deleteUserReading(r.id);READER.id=null;renderLectura();})},'Borrar'):null)
  ));
  window.scrollTo(0,0);
}
function renderGloss(){ const g=$('#gloss'); if(!g) return; g.innerHTML=''; const s=READER.sel; if(!s) return; const v=(VOCAB_BY_WORD[s.w]||[])[0]; const rec=v&&S.items[keyOf({...v,kind:'v'})]; g.append(h('div',{class:'gloss'}, h('div',{class:'row'}, h('span',{class:'w',lang:'ja'},s.w), h('span',{class:'r',lang:'ja'},s.rd), spkBtn(s.w), h('span',{class:'sp'}), v?h('span',{class:'badge soft'},rec&&rec.s>0?STAGE_NAMES[rec.s]:'No aprendida'):null, h('button',{class:'btn sm ghost',title:'Cerrar','aria-label':'Cerrar',onclick:()=>{ READER.sel=null; [...document.querySelectorAll('.reader .tok.sel')].forEach(x=>x.classList.remove('sel')); renderGloss(); }},'✕')), h('div',{},s.gl))); }
function checkReadingDone(r){ if(Object.keys(READER.answers).length<r.q.length) return; const ok=r.q.filter((q,i)=>READER.answers[i]===q.a).length; const score=Math.round(100*ok/r.q.length); S.readings[r.id]={score,date:now()}; bump('rd'); toast(`Lectura completada: ${score}%`); }
function addReadingVocab(r){ let n=0; const re=/\[([^|\]]+)\|/g; let m; while((m=re.exec(r.t))){ const v=(VOCAB_BY_WORD[m[1]]||[])[0]; if(v){ const k=keyOf({...v,kind:'v'}); if(!S.items[k]||S.items[k].s===0){ S.items[k]={s:1,due:now()+4*H,c:0,w:0,lrn:now()}; n++; } } } save(); toast(n?`${n} palabras añadidas a tus repasos`:'Todas las palabras del texto ya estaban en tu SRS'); }

// ===================== Vistas =====================
const VIEWS=[{id:'hoy',t:'Hoy',ic:'今'},{id:'lecciones',t:'Lecciones',ic:'学'},{id:'repasos',t:'Repasos',ic:'復'},{id:'lectura',t:'Lectura',ic:'読'},{id:'examenes',t:'Exámenes',ic:'試'},{id:'practica',t:'Práctica',ic:'練'},{id:'progreso',t:'Progreso',ic:'進'},{id:'ajustes',t:'Ajustes',ic:'設'}];
let VIEW='hoy';
function go(id){ stopSpeak(); if(PRACT&&PRACT.kh){ document.removeEventListener('keydown',PRACT.kh); } PRACT={mode:null}; if(SESSION){ if(SESSION.enterHandler) document.removeEventListener('keydown',SESSION.enterHandler); clearTimeout(SESSION.autoT); } if(EXAM) examKeysOff(EXAM); VIEW=id; SESSION=null; LESSON=null; EXAM=null; clearInterval(examTimer); document.body.classList.remove('focus'); if(location.hash!=='#'+id) history.replaceState(null,'','#'+id); render(); window.scrollTo(0,0); }
function renderNav(){
  const due=dueItems().length, la=lessonsAvailable();
  const mk=v=>h('button',{class:VIEW===v.id?'active':'',onclick:()=>go(v.id)}, h('span',{class:'ic'},v.ic), h('span',{},v.t), v.id==='repasos'&&due?h('span',{class:'badge'+(due>100?' warn':'')},due):null, v.id==='lecciones'&&la.items.length?h('span',{class:'badge ok'},Math.min(la.items.length,99)):null);
  const side=$('#sidenav'); side.innerHTML=''; side.append(h('div',{class:'brand'},h('b',{},'道場'),h('span',{},'Dojo 日本語')), ...VIEWS.map(mk), h('div',{class:'foot'}, h('div',{},`Nivel ${S.level} · ${tierOf(S.level).n}`), h('div',{class:'synclabel'},syncLabel)));
  const head=$('#mobilehead'); if(head){ head.innerHTML=''; head.append(h('div',{class:'brand'},h('b',{},'道場'),h('span',{},`Nivel ${S.level} · ${tierOf(S.level).n}`)), h('button',{class:VIEW==='progreso'?'active':'',title:'Progreso','aria-label':'Progreso',onclick:()=>go('progreso')},'進'), h('button',{class:VIEW==='ajustes'?'active':'',title:'Ajustes','aria-label':'Ajustes',onclick:()=>go('ajustes')},'設')); }
  const tabs=$('#tabnav'); tabs.innerHTML=''; VIEWS.filter(v=>['hoy','lecciones','repasos','lectura','examenes','practica'].includes(v.id)).forEach(v=>tabs.append(mk(v)));
}
function render(){ if (needsLogin()) { renderLoginWall(); return; } document.body.classList.remove('login-mode'); document.body.classList.remove('focus'); renderNav(); const el=$('#main'); el.innerHTML=''; ({hoy:renderHoy,lecciones:renderLecciones,repasos:renderRepasos,lectura:renderLectura,examenes:renderExamenes,practica:renderPractica,progreso:renderProgreso,ajustes:renderAjustes}[VIEW]||renderHoy)(); }

function pushMessage(){
  const due=dueItems().length, missed=daysMissed(), w=weeklyStatus(), d=day(), la=lessonsAvailable();
  const target=S.settings.target?new Date(S.settings.target+'T09:00:00'):null; const daysLeft=target?Math.ceil((target-now())/D):null;
  if (w.overdue && paceToday().mode!=='recuperacion') return {cls:'warnish',t:'El examen semanal espera. Las lecciones se abren después.'};
  if (missed>=2) return {cls:'',t:`Vuelves tras ${missed} días. Hoy basta con una sesión corta de repasos.`};
  if (due>150) return {cls:'',t:`${due} repasos esperan. Hoy, solo repasar.`};
  if (due>=40) return {cls:'info',t:`${due} repasos listos.`};
  if (d.r===0 && due>0) return {cls:'info',t:`${due} ${plural(due,'repaso listo','repasos listos')}. Primero repasar, luego aprender.`};
  if ((d.l<paceToday().lessons || (d.lg||0)<grammarGoalToday()) && la.items.length) return {cls:'info',t:`Hoy llevas ${d.l} de ${paceToday().lessons} ítems de kanji/vocab y ${d.lg||0} de ${grammarGoalToday()} de gramática. ${daysLeft&&daysLeft>0?`Quedan ${daysLeft} días para tu objetivo.`:''}`};
  if (w.available && !w.overdue && now()>=w.due) return {cls:'info',t:'El examen semanal está disponible.'};
  const le=levelExamStatus(); if (le.ready) return {cls:'ok',t:'Nivel aprendido. El examen de nivel te espera cuando quieras.'};
  return {cls:'ok',t:'Al día. Si quieres algo más, una lectura.'};
}
function paceInfo(){
  const tier=tierByName(S.settings.targetTier||'N4')||tierOf(S.level); const target=S.settings.target?new Date(S.settings.target+'T09:00:00'):null;
  let remaining=0, total=0;
  for(let lv=1;lv<=tier.to;lv++){ const gs=itemsOfLevel(lv).filter(it=>it.kind==='g'); if(gs.length||!isGenerated(lv)){ total+=gs.length; remaining+=gs.filter(it=>!(S.items[keyOf(it)]&&S.items[keyOf(it)].s>0)).length; } else { const t=tierOf(lv).n; const n=(((ROADMAP[t]||{}).grammarByLevel||{})[lv]||[]).length; total+=n; remaining+=n; } }
  if (!target) return {remaining,total};
  if (target.getTime()<now()) return {remaining,total,past:true};
  const days=Math.max(1,Math.ceil((target-now())/D)); return {remaining,total,days,perDay:Math.ceil(remaining/days),perWeek:Math.ceil(remaining/days*7)};
}
function renderHoy(){
  const el=$('#main'); const due=dueItems().length, la=lessonsAvailable(), w=weeklyStatus(), le=levelExamStatus(), d=day(), pm=pushMessage(), pace=paceInfo();
  updateStreak();
  const hello=S.settings.name?S.settings.name:'今日';
  const lvItems=itemsOfLevel(S.level), lvDone=lvItems.filter(it=>S.items[keyOf(it)]&&S.items[keyOf(it)].s>0).length, lvPct=lvItems.length?Math.round(100*lvDone/lvItems.length):0;
  const R=34, C=2*Math.PI*R; const ring=h('div',{class:'ring',html:`<svg viewBox="0 0 84 84" width="84" height="84"><circle cx="42" cy="42" r="${R}" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="42" cy="42" r="${R}" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-lvPct/100)}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle" font-size="20">${S.level}</text></svg>`});
  el.append(h('div',{class:'hero',style:'margin-bottom:14px'}, ring, h('div',{style:'min-width:0'}, h('div',{class:'lvl'},hello), h('div',{class:'sub'},`Nivel ${S.level} · ${tierOf(S.level).n} · ${lvPct}% del nivel aprendido`), h('div',{class:'chips'}, h('span',{class:'chip'},`${S.streak||0} ${plural(S.streak||0,'día seguido','días seguidos')}`), pace.days?h('span',{class:'chip'},`${pace.days} d para ${S.settings.targetTier||'N4'}`):pace.past?h('span',{class:'chip'},'Fecha objetivo pasada'):null, h('span',{class:'chip'},`${pace.total-pace.remaining}/${pace.total} gramática ${S.settings.targetTier||'N4'}`)))));
  if (CONFIG.SUPABASE_URL && !USER) el.append(h('div',{class:'push info',style:'margin-bottom:10px'}, OFFLINE?'Sin conexión: lo que hagas se guarda aquí y se sube a tu cuenta en cuanto vuelva la red.':'No has iniciado sesión: el progreso se guarda solo en este navegador. ', OFFLINE?null:h('a',{href:'#ajustes',onclick:e=>{e.preventDefault();go('ajustes');}},'Inicia sesión'), OFFLINE?null:' para tenerlo en todos tus dispositivos.'));
  el.append(h('div',{class:'push '+pm.cls,style:'margin-bottom:14px'}, pm.t));
  const actions=h('div',{class:'grid c3'},
    h('button',{class:'action rev',onclick:()=>startReviews()}, h('div',{class:'big-n'},due), h('div',{}, h('div',{class:'t'},'Repasos'), h('div',{class:'d'}, due?`El más antiguo venció ${fmtAgo(Math.min(...dueItems().map(i=>S.items[keyOf(i)].due)))}`:'Nada pendiente'))),
    h('button',{class:'action les'+(la.items.length?'':' locked'),onclick:()=>go('lecciones'),disabled:!la.items.length}, h('div',{class:'big-n'},la.items.length?la.items.length:'—'), h('div',{}, h('div',{class:'t'},'Lecciones'), h('div',{class:'d'}, la.items.length?`${la.kv.length} kanji/vocab · ${la.g.length} gramática hoy`:la.reason))),
    h('button',{class:'action exam'+(le.ready||(w.available&&now()>=w.due)?'':' locked'),onclick:()=>go('examenes')}, h('div',{class:'big-n'},'試'), h('div',{}, h('div',{class:'t'},'Exámenes'), h('div',{class:'d'}, w.overdue?'Semanal atrasado':le.ready?'Examen de nivel listo':'Semanal: '+w.text)))
  );
  el.append(actions);
  const pc=paceToday(); const goalL=pc.lessons, dueStart=(d.r||0)+due;

  el.append(h('div',{class:'card stack',style:'margin-top:14px'},
    h('div',{class:'row between'}, h('h3',{},'Hoy'), h('span',{class:'small muted'},`${PACE_LABEL[pc.mode]} · ${pc.why}`)),
    h('div',{}, h('div',{class:'row between small'},h('span',{},'Repasos'),h('span',{class:'num muted'},`${d.r||0} / ${dueStart}`)), h('div',{class:'bar'},h('i',{style:'width:'+(dueStart?Math.min(100,Math.round(100*(d.r||0)/dueStart)):100)+'%'}))),
    h('div',{}, h('div',{class:'row between small'},h('span',{},'Kanji y vocabulario'),h('span',{class:'num muted'},`${d.l||0} / ${goalL}`)), h('div',{class:'bar'},h('i',{style:'width:'+(goalL?Math.min(100,Math.round(100*(d.l||0)/goalL)):100)+'%'}))),
    h('div',{}, h('div',{class:'row between small'},h('span',{},'Gramática'),h('span',{class:'num muted'},`${d.lg||0} / ${grammarGoalToday()}`)), h('div',{class:'bar'},h('i',{style:'width:'+(grammarGoalToday()?Math.min(100,Math.round(100*(d.lg||0)/grammarGoalToday())):100)+'%'}))),
    pace.days?h('div',{class:'small muted'}, `Gramática hasta ${S.settings.targetTier||'N4'}: ${pace.total-pace.remaining} de ${pace.total}. Ritmo para el ${fmtDate(new Date(S.settings.target+'T09:00:00'))}: ${pace.perWeek} puntos por semana.`):pace.past?h('div',{class:'small muted'}, `La fecha objetivo (${fmtDate(new Date(S.settings.target+'T09:00:00'))}) ya pasó. Pon la siguiente convocatoria en Ajustes.`):null));
  const lastLi=Math.max(0,...Object.values(S.listen||{}).map(x=>x.date||0),...(S.writings||[]).map(w=>w.date||0)); if (learnedKeys().length>=40 && now()-lastLi>7*D) el.append(h('div',{class:'card',style:'margin-top:14px'}, h('div',{class:'eyebrow'},'Escucha y escritura'), h('div',{style:'margin-top:4px;font-weight:600'},'Llevas más de una semana sin practicar el oído ni la escritura'), h('p',{class:'small muted',style:'margin:2px 0 0'},'El JLPT tiene 聴解 y el japonés real exige escribir. Un dictado de 10 frases o una redacción corta hoy.'), h('button',{class:'btn sm',style:'margin-top:8px',onclick:()=>go('practica')},'Ir a Práctica')));
  const tip=tipsFor()[0]; if (tip && tip.b!=='Todo en orden') el.append(h('div',{class:'card',style:'margin-top:14px'}, h('div',{class:'eyebrow'},'Un consejo'), h('div',{style:'margin-top:4px;font-weight:600'},tip.b), h('p',{class:'small muted',style:'margin:2px 0 0'},tip.p), tip.act?h('button',{class:'btn sm',style:'margin-top:8px',onclick:tip.act[1]},tip.act[0]):null));
  if (isGenerated(S.level) && !levelHasContent(S.level)) el.append(h('div',{class:'card',style:'margin-top:12px'}, h('h3',{},`Nivel ${S.level} (${tierOf(S.level).n}) sin contenido todavía`), h('p',{class:'small muted'},'Los niveles N3 a N1 se generan cuando llegas a ellos.'), h('button',{class:'btn primary',onclick:()=>go('lecciones')},'Generar el nivel')));
}
function tipsFor(){
  const tips=[]; const st=S.stats||{}; const acc=f=>{ const x=st[f]; return x&&(x.c+x.w)>=15 ? x.c/(x.c+x.w) : null; };
  const pv=acc('vp'), rv=acc('vr'), mv=acc('vm'), kr=acc('kr'), km=acc('km'), gc=acc('gc');
  const s7=stats7(), due=dueItems().length, appr=Object.entries(S.items).filter(([k,r])=>ITEMS.has(k)&&r.s>=1&&r.s<=4).length, lch=leeches();
  if (pv!=null && rv!=null && rv-pv>=0.15) tips.push({ic:'',b:'Tu punto débil sigue siendo español → japonés',p:`Aciertas el ${Math.round(rv*100)} % leyendo pero solo el ${Math.round(pv*100)} % produciendo. Diez minutos de "Entrenar producción" al día cierran esa brecha más rápido que más lecciones.`,act:['Entrenar producción',()=>{ const its=learnedKeys().map(k=>ITEMS.get(k)).filter(i=>i.kind==='v'); startSession('drill',pick(its,20),{facets:['vp']}); }]});
  if (kr!=null && kr<0.75) tips.push({ic:'',b:'Las lecturas de kanji se te resisten',p:'Los kanji aislados se olvidan; dentro de palabras se quedan. En cada fallo mira la lista "Palabras" del panel y di la palabra en voz alta. Las lecturas on se aprenden por los compuestos, no de memoria.'});
  if (km!=null && km<0.75) tips.push({ic:'',b:'Significados de kanji flojos',p:'Cuando falles uno, inventa tu propia mnemotecnia en el momento (la de la app es solo una semilla). Lo que te inventas tú se recuerda el doble.'});
  if (gc!=null && gc<0.7) tips.push({ic:'',b:'Gramática por debajo del 70 %',p:'En las lecciones de gramática lee los tres ejemplos en voz alta y tapa la parte entre corchetes antes de pasar. Y haz una lectura por semana: la gramática en contexto es la que se fija.'});
  const exs=S.exams.slice(-3); if (exs.length){ const agg={}; exs.forEach(e=>Object.entries(e.secs||{}).forEach(([k,v])=>{ const a=agg[k]=agg[k]||{ok:0,n:0}; a.ok+=v.ok; a.n+=v.n; })); const worst=Object.entries(agg).filter(([k,v])=>v.n>=6).sort((a,b)=>(a[1].ok/a[1].n)-(b[1].ok/b[1].n))[0]; if (worst && worst[1].ok/worst[1].n<0.65){ const map={'漢字読み':'En el examen fallas lecturas de kanji: al repasar vocabulario, lee siempre la frase de ejemplo completa.','表記':'Fallas la escritura (表記): en la pregunta de producción, antes de elegir el kanji, intenta visualizarlo con los ojos cerrados.','文脈規定':'Fallas vocabulario en contexto: las lecturas son el mejor entrenamiento. Una cada dos días.','文法形式':'Fallas formas gramaticales: repasa los puntos del nivel en Lecciones (pulsa cada pastilla verde) y vuelve a leer la estructura.','並び替え':'Fallas el ordenar frases (★): lee frases largas en voz alta y fíjate en qué partícula cierra cada bloque.','読解':'El 読解 es tu sección débil y vale un tercio del examen: una lectura completa cada dos días, sin furigana.','producción':'La producción escrita es tu sección débil: usa "Entrenar producción" y escribe tú mismo una frase por cada palabra nueva.'}; tips.push({ic:'',b:`Sección más floja en tus últimos exámenes: ${worst[0]} (${Math.round(100*worst[1].ok/worst[1].n)} %)`,p:map[worst[0]]||''}); } }
  if (lch.length>=5) tips.push({ic:'',b:`${lch.length} sanguijuelas`,p:'Son pocas palabras pero se llevan la mitad de tus fallos. Un repaso dedicado de 3 minutos al día las desactiva en una semana.',act:['Machacarlas',()=>startReviews(true)]});
  const lastRead=Math.max(0,...Object.values(S.readings||{}).map(r=>r.date||0)); if (learnedKeys().length>=40 && now()-lastRead>7*D) tips.push({ic:'',b:'Llevas más de una semana sin leer',p:'Las lecciones enseñan piezas; la lectura enseña a usarlas. Una lectura corta hoy, sin furigana, y responde las preguntas en japonés.',act:['Ir a Lectura',()=>go('lectura')]});
  if (s7.active>=1 && s7.active<=3 && daysMissed()>=1) tips.push({ic:'',b:'Más vale 10 minutos diarios que 2 horas el domingo',p:'El SRS castiga los huecos: cada día que saltas, los intervalos se te vienen encima juntos. Fija una hora (la misma siempre) y haz solo los repasos si no hay más.'});
  if (appr>90) tips.push({ic:'',b:`${appr} ítems en Aprendiz`,p:'Es lo que de verdad pesa en tu día a día. Hasta que baje de 70, cada lección nueva te añade carga para una semana. La app ya frena por ti; no fuerces el techo.'});
  if (s7.acc!=null && s7.acc>=0.92 && appr<50 && due<20 && s7.active>=5) tips.push({ic:'',b:'Vas sobrado',p:`${Math.round(s7.acc*100)} % de acierto, poca carga y constancia. Puedes subir el techo de lecciones en Ajustes, o mejor: añade una lectura y un examen de frases nuevas, que es donde se nota el nivel real.`});
  const prodAll=(st.vp||{c:0,w:0}); if (!tips.length) tips.push({ic:'',b:'Todo en orden',p:'Sigue el ritmo que marca la app y vuelve mañana. Los consejos aparecerán cuando los datos digan algo claro.'});
  return tips.slice(0,3);
}
function forecastChart(){
  const buckets=Array(12).fill(0); const t=now();
  Object.entries(S.items).forEach(([k,r])=>{ if(!ITEMS.has(k)||r.s<=0||r.s>=9) return; const dt=r.due-t; if(dt<=0) buckets[0]++; else if(dt<24*H) buckets[Math.floor(dt/(2*H))]++; });
  const max=Math.max(1,...buckets);
  return h('div',{}, h('div',{class:'forecast'}, buckets.map((n,i)=>h('div',{title:`+${i*2} h: ${n}`}, h('i',{style:'height:'+Math.round(100*n/max)+'%'})))), h('div',{class:'forecast-labels'},h('span',{},'ahora'),h('span',{},'+12 h'),h('span',{},'+24 h')));
}
function renderLecciones(){
  const el=$('#main'); const la=lessonsAvailable(); const lv=S.level, items=itemsOfLevel(lv);
  el.append(h('div',{class:'topline'}, h('h1',{},`Nivel ${lv}`), h('span',{class:'pill'},tierOf(lv).n), h('span',{class:'small muted'},`${items.filter(i=>i.kind==='k').length} kanji · ${items.filter(i=>i.kind==='v').length} vocab · ${items.filter(i=>i.kind==='g').length} gramática`)));
  if (levelNeedsGen(lv)) { el.append(generatePanel(lv)); }
  el.append(h('div',{class:'grid c2',style:'margin-bottom:12px'},
    h('div',{class:'card stack'}, h('div',{class:'eyebrow'},'Kanji y vocabulario'), h('div',{class:'small muted'},`Hoy: ${la.kvDone} de ${la.kvGoal} · ${la.kvTotal} disponibles`+(la.kvWaiting?` · ${la.kvWaiting} ${plural(la.kvWaiting,'palabra espera','palabras esperan')} a sus kanji (Gurú)`:'')), la.kv.length?h('button',{class:'btn leaf big',onclick:()=>startLessonBatch('kv')},`Lección de ${Math.min(5,la.kv.length)} ${plural(Math.min(5,la.kv.length),'ítem','ítems')}`):h('div',{class:'push info small'},la.kvNeedsGen?'Genera el nivel (arriba) para tener kanji y vocabulario.':la.locked?'Bloqueado: '+la.reason:(la.kvTotal?'Objetivo de hoy cumplido.':(la.kvWaiting?'Las palabras se desbloquean cuando sus kanji llegan a Gurú.':'Nivel completo.')))),
    h('div',{class:'card stack'}, h('div',{class:'eyebrow'},'Gramática'), h('div',{class:'small muted'},`Hoy: ${la.gDone} de ${la.gGoal} · quedan ${la.gTotal} en el nivel`), la.g.length?h('button',{class:'btn primary big',onclick:()=>startLessonBatch('g')},`Lección de ${Math.min(3,la.g.length)} ${plural(Math.min(3,la.g.length),'punto')}`):h('div',{class:'push info small'},la.locked?'Bloqueado: '+la.reason:(la.gTotal?'Objetivo de hoy cumplido.':'Nivel completo.')))));
  if (la.reason && !la.items.length && !la.locked) el.append(h('div',{class:'push info',style:'margin-bottom:12px'},la.reason));
  el.append(h('div',{class:'small muted',style:'margin-bottom:12px'},`Ritmo de hoy: ${PACE_LABEL[paceToday().mode]} · kanji/vocab ${paceToday().lessons}/día (techo ${S.settings.goalLessons}) · gramática ${grammarGoalToday()}/día (techo ${S.settings.goalGrammar!=null?S.settings.goalGrammar:2}). Como en WaniKani, cada palabra se desbloquea cuando sus kanji están en Gurú.`));
  const le=levelExamStatus(); el.append(h('div',{class:'card',style:'margin-bottom:12px'}, h('div',{class:'row between'}, h('div',{}, h('h3',{},'Examen de nivel'), h('div',{class:'small muted'},le.text)), le.ready?h('button',{class:'btn primary',onclick:()=>startExam('level')},'Hacer examen'):null)));
  const groups=[['k','Kanji'],['v','Vocabulario'],['g','Gramática']];
  const mobile=window.matchMedia('(max-width:860px)').matches;
  groups.forEach(([kind,label])=>{ const its=items.filter(i=>i.kind===kind); if(!its.length) return; const done=its.filter(i=>S.items[keyOf(i)]&&S.items[keyOf(i)].s>0).length; const det=h('details',{class:'sec',open:!mobile}, h('summary',{}, label, h('span',{class:'badge soft'},`${done}/${its.length}`))); el.append(det); det.append(h('div',{class:'row'}, its.map(it=>{ const rec=S.items[keyOf(it)]; const st=rec?rec.s:0; return h('button',{class:'pill jp '+kind+(st>0?'':' todo')+(st>=5?' guru':''),style:'font-size:'+(kind==='k'?'1.2rem':'.95rem'),title:STAGE_NAMES[st]||'Nuevo',onclick:()=>itemSheet(it)}, kind==='k'?it.k:kind==='v'?it.w:it.t); }))); });
  el.append(h('p',{class:'small muted',style:'margin-top:12px'},'Opacos: sin aprender. Con borde verde: en Gurú o superior.'));
}
function renderRepasos(){
  const el=$('#main'); const due=dueItems(); const soon=Object.entries(S.items).filter(([k,r])=>ITEMS.has(k)&&r.s>0&&r.s<9&&r.due>now()&&r.due<now()+D).length;
  el.append(h('div',{class:'topline'}, h('h1',{},'Repasos'), h('span',{class:'pill'},`${due.length} pendientes`), h('span',{class:'small muted'},`${soon} más en las próximas 24 h`)));
  el.append(h('div',{class:'card stack',style:'margin-bottom:12px'}, due.length?h('button',{class:'btn primary big',onclick:()=>startReviews()},`Repasar ${Math.min(due.length,paceToday().maxReviews)} ahora`):h('div',{class:'push ok'},'Sin repasos pendientes. Vuelve más tarde o haz una lección.'),
    h('div',{class:'small muted'},'Cada ítem tiene varias preguntas: kanji (significado + lectura), vocabulario (significado, lectura y español→japonés con elección del kanji) y gramática (frase con hueco). Un fallo en cualquiera cuenta como fallo del ítem.'),
    h('div',{class:'row'}, due.length?h('button',{class:'btn sm',onclick:()=>startReviews(false,12)},'Sesión de 5 minutos (12 ítems)'):null, h('button',{class:'btn sm warn',onclick:()=>startReviews(true)},'Solo sanguijuelas'), h('button',{class:'btn sm',onclick:()=>{ const its=learnedKeys().map(k=>ITEMS.get(k)).filter(i=>i.kind==='v'); if(!its.length){toast('Nada aprendido aún');return;} startSession('drill',pick(its,20),{facets:['vp']}); }},'Entrenar producción (20 palabras)'))));
  if (due.length) el.append(h('div',{class:'card'}, h('h3',{},'En la cola'), h('div',{class:'list',style:'margin-top:8px'}, due.slice(0,30).map(itemRow)), due.length>30?h('div',{class:'small muted',style:'margin-top:8px'},`… y ${due.length-30} más`):null));
}
function renderExamenes(){
  const el=$('#main'); const w=weeklyStatus(), le=levelExamStatus();
  const learnedIts=learnedKeys().map(k=>ITEMS.get(k)); const nv=learnedIts.filter(i=>i.kind==='v').length, ng=learnedIts.filter(i=>i.kind==='g').length, freshOk=nv>=30&&ng>=8;
  el.append(h('div',{class:'topline'}, h('h1',{},'Exámenes'), h('span',{class:'small muted'},'Formato JLPT. Las frases de los exámenes salen de un banco aparte que no aparece en las lecciones.')));
  el.append(h('div',{class:'grid c2'},
    h('div',{class:'card stack'}, h('div',{class:'section-tag'},'Semanal · obligatorio'), h('p',{class:'small',style:'margin:0'},'Unas 33 preguntas, 30 min, sobre todo lo aprendido, con 聴解 (escucha). Si lo dejas pasar, se bloquean las lecciones.'), h('div',{class:'small muted'},w.text), h('button',{class:'btn primary',disabled:!w.available,onclick:()=>startExam('weekly')},'Hacer examen semanal')),
    h('div',{class:'card stack'}, h('div',{class:'section-tag'},`Nivel ${S.level}`), h('p',{class:'small',style:'margin:0'},'22 preguntas sobre el nivel actual. Hace falta un 80 % para subir.'), h('div',{class:'small muted'},le.text), h('button',{class:'btn primary',disabled:!le.ready,onclick:()=>startExam('level')},'Hacer examen de nivel')),
    h('div',{class:'card stack'}, h('div',{class:'section-tag'},'Frases nuevas · Claude'), h('p',{class:'small',style:'margin:0'},'27 preguntas escritas en el momento con tu vocabulario y gramática aprendidos, en frases que no has visto nunca. El reto real.'), h('div',{class:'small muted',id:'fresh-status'},freshOk?'Disponible':`Se activa con 30 palabras (llevas ${nv}) y 8 puntos gramaticales (llevas ${ng})`), h('button',{class:'btn primary',disabled:!freshOk,onclick:()=>startFreshExam($('#fresh-status'))},'Generar examen nuevo')),
    h('div',{class:'card stack'}, h('div',{class:'section-tag'},'Simulacro JLPT'), h('p',{class:'small',style:'margin:0'},'Unas 70 preguntas, 60 min, sin ayudas, con lectura y escucha. Para medirte antes del examen real.'), h('div',{class:'small muted'},learnedKeys().length<60?'Se activa con 60 ítems aprendidos':'Disponible'), h('button',{class:'btn',disabled:learnedKeys().length<60,onclick:()=>startExam('mock')},'Hacer simulacro'))));
  const ex=S.exams.slice().reverse();
  el.append(h('div',{class:'card',style:'margin-top:12px'}, h('h3',{},'Historial'), ex.length?h('div',{class:'tscroll'},h('table',{}, h('thead',{},h('tr',{},h('th',{},'Fecha'),h('th',{},'Tipo'),h('th',{},'Nivel'),h('th',{},'Nota'),h('th',{},'Secciones'),h('th',{},''))), h('tbody',{}, ex.slice(0,20).map(e=>h('tr',{}, h('td',{},fmtDate(e.date)), h('td',{},{weekly:'Semanal',level:'Nivel',mock:'Simulacro',fresh:'Frases nuevas'}[e.kind]||e.kind), h('td',{class:'num'},e.level), h('td',{},h('b',{style:'color:'+(e.score>=80?'var(--ok)':e.score>=60?'var(--gold)':'var(--warn)')},e.score+'%')), h('td',{class:'small'}, Object.entries(e.secs||{}).map(([s,v])=>`${s} ${v.ok}/${v.n}`).join(' · ')), h('td',{}, h('button',{class:'btn sm ghost warn',title:'Borrar este examen del historial','aria-label':'Borrar este examen',onclick:()=>confirmBox(`¿Borrar del historial el examen del ${fmtDate(e.date)} (${e.score} %)? No se puede deshacer.`,()=>{ S.exams=S.exams.filter(x=>x.date!==e.date); S.exDel=uniq([...(S.exDel||[]),e.date]); S.settingsAt=S.settingsAt||0; save(); toast('Examen borrado del historial'); render(); })},'Borrar'))))))):h('p',{class:'small muted'},'Todavía no has hecho ningún examen.'), ex.length?h('p',{class:'small muted',style:'margin:8px 0 0'},'Borrar solo quita la fila: no deshace los ítems que bajaron de nivel SRS por ese examen ni cambia la fecha del próximo semanal.'):null));
}
function renderProgreso(){
  const el=$('#main'); el.append(h('div',{class:'topline'}, h('h1',{},'Progreso')));
  const counts={aprendiz:0,guru:0,maestro:0,iluminado:0,quemado:0}; Object.entries(S.items).forEach(([k,r])=>{ if(!ITEMS.has(k)||r.s<=0) return; counts[stageGroup(r.s)]++; });
  const STAGE_GROUP_LABEL={aprendiz:'Aprendiz',guru:'Gurú',maestro:'Maestro',iluminado:'Iluminado',quemado:'Quemado'};
  el.append(h('div',{class:'stages'}, Object.entries(counts).map(([k,n])=>h('div',{class:'card',title:STAGE_GROUP_LABEL[k]},h('div',{class:'n'},n),h('div',{class:'l'},STAGE_GROUP_LABEL[k]||k)))));
  const days=Object.keys(S.days).sort().slice(-14);
  el.append(h('div',{class:'card',style:'margin-top:12px'}, h('h3',{},'Últimas dos semanas'), h('div',{class:'tscroll'},h('table',{},h('thead',{},h('tr',{},h('th',{},'Día'),h('th',{},'Repasos'),h('th',{},'Precisión'),h('th',{},'Lecciones'),h('th',{},'Lecturas'),h('th',{},'Dictado'),h('th',{},'Redacc.'),h('th',{},'Exámenes'))), h('tbody',{}, days.length?days.map(k=>{const d=S.days[k];return h('tr',{},h('td',{},k),h('td',{class:'num'},d.r||0),h('td',{class:'num'},d.r?Math.round(100*(d.rc||0)/d.r)+'%':'—'),h('td',{class:'num'},d.l||0),h('td',{class:'num'},d.rd||0),h('td',{class:'num'},d.di||0),h('td',{class:'num'},d.wr||0),h('td',{class:'num'},d.ex||0));}):h('tr',{},h('td',{colspan:8},'Aún no hay actividad.')))))));
  el.append(h('div',{class:'card',style:'margin-top:12px'}, h('h3',{},'Próximas 24 h'), forecastChart(), h('div',{class:'small muted'}, `Aprendidos: ${learnedKeys().length} · Quemados: ${Object.values(S.items).filter(r=>r.s>=9).length}`)));
  el.append(h('div',{class:'card',style:'margin-top:12px'}, h('h3',{},'Consejos'), h('div',{class:'tips',style:'margin-top:6px'}, tipsFor().map(t=>h('div',{class:'tip'}, h('div',{class:'b'}, h('b',{},t.b), h('p',{},t.p), t.act?h('button',{class:'btn sm',style:'margin-top:6px',onclick:t.act[1]},t.act[0]):null))))));
  const lch=leeches(); if (lch.length) el.append(h('div',{class:'card',style:'margin-top:12px'}, h('div',{class:'row between'},h('h3',{},'Sanguijuelas'),h('button',{class:'btn sm',onclick:()=>startReviews(true)},'Repasarlas')), h('p',{class:'small muted',style:'margin:4px 0 8px'},'Ítems que fallas una y otra vez.'), h('div',{class:'row'}, lch.slice(0,10).map(it=>h('span',{class:'pill jp '+it.kind}, it.kind==='k'?it.k:it.kind==='v'?it.w:it.t)))));
  const mapDet=h('details',{class:'sec',open:!window.matchMedia('(max-width:860px)').matches}, h('summary',{},'Mapa de niveles hasta N1')); const map=h('div',{class:'card',style:'margin-top:12px'}, mapDet);
  TIERS.forEach(t=>{ mapDet.append(h('div',{class:'tier-row'}, h('b',{},t.n), h('span',{class:'small muted'}, t.n==='N5'?'repaso':t.n==='N4'?'contenido completo':'generado al llegar'))); const g=h('div',{class:'levelmap'}); for(let lv=t.from;lv<=t.to;lv++) g.append(h('div',{class:lv<S.level?'done':lv===S.level?'cur':(isGenerated(lv)&&S.gen[lv])?'gen':'',title:'Nivel '+lv},lv)); mapDet.append(g); });
  el.append(map);
  const exs=S.exams; if(exs.length){ const avg=Math.round(exs.reduce((a,e)=>a+e.score,0)/exs.length); const secAgg={}; exs.forEach(e=>Object.entries(e.secs||{}).forEach(([s,v])=>{const a=secAgg[s]=secAgg[s]||{ok:0,n:0};a.ok+=v.ok;a.n+=v.n;})); el.append(h('div',{class:'card',style:'margin-top:12px'}, h('h3',{},`Exámenes: media ${avg} %`), h('div',{class:'result-grid',style:'margin-top:8px'}, Object.entries(secAgg).map(([s,v])=>h('div',{class:'card'},h('div',{class:'section-tag'},s),h('div',{class:'num'},Math.round(100*v.ok/v.n)+'%'),h('div',{class:'bar gold'},h('i',{style:'width:'+Math.round(100*v.ok/v.n)+'%'}))))), h('p',{class:'small muted',style:'margin:8px 0 0'},'La sección más baja es tu prioridad de estudio esta semana.'))); }
}

function importReadingCard(){
  const ta=h('textarea',{id:'imp-text',placeholder:'Pega aquí un texto en japonés (hasta 6000 caracteres): un libro de Tadoku, una noticia de NHK Easy, un correo…',style:'min-height:120px'});
  const title=h('input',{id:'imp-title',type:'text',placeholder:'Título (opcional)'});
  const status=h('div',{class:'small muted'});
  const btn=h('button',{class:'btn primary',onclick:async()=>{
    const text=ta.value.trim(); if(text.length<20){ toast('Pega un texto más largo'); return; }
    if(!sb||!USER){ status.textContent='Inicia sesión para importar textos (usa la función de Claude de tu cuenta).'; return; }
    btn.disabled=true; status.textContent='Analizando el texto con Claude (30 a 60 segundos)…';
    try{ const r=await callFunction('reader',{text, title:title.value.trim(), level:tierOf(S.level).n}); if(!r||!r.t) throw new Error(r&&r.error||'respuesta vacía');
      const id='u'+now().toString(36); const reading={id, lv:1, user:true, title:r.title||title.value||'Texto importado', sub:(r.sub||'')+' · importada '+fmtDate(now()), t:r.t, es:r.es||'', q:Array.isArray(r.q)?r.q.filter(q=>q&&q.q&&Array.isArray(q.o)&&q.o.length>=2).map(q=>({q:q.q,o:q.o,a:Math.max(0,Math.min(q.o.length-1,q.a|0))})):[], notes:Array.isArray(r.notes)?r.notes:[], g:[]};
      await saveUserReading(reading); toast('Lectura importada'); READER={id,sel:null,furi:S.settings.furigana,trans:false,answers:{}}; renderLectura();
    }catch(e){ status.textContent='No se pudo importar: '+(e.message||e); btn.disabled=false; }
  }},'Importar texto');
  return h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Importar texto'), h('p',{class:'small muted',style:'margin:0'},'Cualquier texto japonés se convierte en una lectura con furigana, glosario al tocar, traducción y preguntas. Se guarda en tu cuenta.'), title, ta, h('div',{class:'row'}, btn, h('span',{class:'sp'})), status);
}

let AUTH_OPT=false;
function needsLogin(){ return !!CONFIG.SUPABASE_URL && !USER && !AUTH_PENDING && !OFFLINE && !AUTH_OPT; }
let AUTH_PENDING=true;
function renderLoginWall(){
  const el=$('#main'); el.innerHTML=''; $('#sidenav').innerHTML=''; $('#tabnav').innerHTML=''; const mh=$('#mobilehead'); if(mh) mh.innerHTML='';
  document.body.classList.remove('leaving'); document.body.classList.add('login-mode');
  const enso=h('div',{class:'enso',html:'<svg viewBox="0 0 120 120"><path d="M92 36 A40 40 0 1 1 60 20"/><text x="60" y="72" text-anchor="middle">道</text></svg>'});
  const gicon='<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" opacity=".9"/><path fill="currentColor" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" opacity=".7"/><path fill="currentColor" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z" opacity=".5"/><path fill="currentColor" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6z" opacity=".8"/></svg>';
  el.append(h('div',{class:'login-wrap'}, h('div',{class:'login'}, enso, h('h1',{},'Dojo 日本語'), h('div',{class:'sub'},'Un rato de japonés, cada día.'),
    h('button',{class:'google',onclick:()=>{ signInGoogle(); }}, h('span',{html:gicon}), 'Entrar con Google'),
    DENIED_EMAIL?h('div',{class:'note',style:'color:var(--warn)'},`La cuenta ${DENIED_EMAIL} no está autorizada. Pide acceso al administrador.`):DENIED_NET?h('div',{class:'note',style:'color:var(--warn)'},'No se pudo comprobar tu cuenta (sin conexión con el servidor). Inténtalo de nuevo.'):(!window.supabase&&CONFIG.SUPABASE_URL)?h('div',{class:'note',style:'color:var(--warn)'},'Sin conexión: no se pudo cargar el acceso. Comprueba la red y recarga.'):h('div',{class:'note'},'Acceso privado. Solo cuentas autorizadas.'))));
}

function itemSheet(it){
  const k=keyOf(it), rec=S.items[k]||{s:0,c:0,w:0};
  const total=(rec.c||0)+(rec.w||0); const acc=total?Math.round(100*(rec.c||0)/total):null;
  const body=h('div',{class:'stack'});
  if (it.kind==='k') body.append(h('div',{class:'big-jp',style:'text-align:center'},it.k), h('div',{style:'text-align:center'},it.m.join(', ')), h('div',{class:'small muted',style:'text-align:center'},'On: '+((it.on||[]).join('・')||'—')+' · Kun: '+((it.kun||[]).join('・')||'—')), it.mn?h('div',{class:'small'},it.mn):null, h('div',{class:'small jp'}, vocabWithKanji(it.k).slice(0,5).map(v=>v.w+'（'+v.r+'）').join('、')));
  else if (it.kind==='v') body.append(h('div',{class:'big-jp',style:'text-align:center;font-size:2.2rem'},it.w), h('div',{style:'text-align:center'},h('span',{class:'jp'},it.r),' · ',it.m.join(', ')), it.ex?h('div',{class:'small'}, h('div',{class:'jp'},it.ex), h('div',{class:'muted'},it.es||'')):null);
  else body.append(h('div',{class:'mid-jp',style:'text-align:center;font-weight:600'},it.t), h('div',{class:'small muted jp',style:'text-align:center'},it.s||''), h('p',{class:'small',style:'margin:0'},it.e||''), ...(it.ex||[]).slice(0,2).map(ex=>{ const c=parseCloze(ex.j); return h('div',{class:'small'}, h('span',{class:'jp'},c.pre+c.answers[0]+c.post), h('span',{class:'muted'},' · '+ex.s)); }));
  body.append(h('div',{class:'row small muted',style:'justify-content:center'}, h('span',{},STAGE_NAMES[rec.s]), rec.s>0&&rec.s<9?h('span',{},'· próximo repaso '+fmtRel(rec.due)):null, total?h('span',{},`· ${acc} % de acierto (${rec.c||0}/${total})`):null));
  const burnBtn = rec.s>=9 ? h('button',{class:'btn sm ghost',onclick:()=>{ S.items[k]={...rec,s:1,due:now(),ls:now()}; save(); box.remove(); veil.remove(); toast('Vuelve a los repasos'); render(); }},'Desquemar') : h('button',{class:'btn sm ghost',onclick:()=>{ S.items[k]={...rec,s:9,due:Infinity,lrn:rec.lrn||now(),ls:now()}; save(); box.remove(); veil.remove(); toast('Quemado: no volverá a salir'); render(); }},'Ya lo sé (quemar)');
  const box=h('div',{class:'card stack',style:'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;max-width:420px;width:calc(100% - 32px);max-height:80vh;overflow:auto'}, body, h('div',{class:'row'}, burnBtn, h('span',{class:'sp'}), spkBtn(it.kind==='g'?parseCloze(it.ex[0].j).pre+parseCloze(it.ex[0].j).answers[0]+parseCloze(it.ex[0].j).post:(it.w||it.k)), h('button',{class:'btn sm',onclick:()=>{box.remove();veil.remove();}},'Cerrar')));
  const veil=h('div',{style:'position:fixed;inset:0;z-index:59;background:rgba(0,0,0,.25)',onclick:()=>{box.remove();veil.remove();}});
  document.body.append(veil,box);
}
