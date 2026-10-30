// ===================== Ritmo adaptativo =====================
function stats7(){ const t=new Date(); t.setHours(0,0,0,0); let r=0,rc=0,l=0,active=0; for(let i=0;i<7;i++){ const d=S.days[todayKey(new Date(t.getTime()-i*D))]; if(!d) continue; r+=d.r||0; rc+=d.rc||0; l+=d.l||0; if(dayCounts(d)) active++; } return {r,rc,l,active,acc:r?rc/r:null}; }
function clearedStreak(){ // días seguidos (antes de hoy) con la cola vaciada y buena precisión
  let n=0; const t=new Date(); t.setHours(0,0,0,0); for(let i=1;i<=7;i++){ const d=S.days[todayKey(new Date(t.getTime()-i*D))]; if(!d||!d.cleared||!(d.r>=10)||(d.rc/d.r)<0.9) break; n++; } return n; }
function paceToday(){
  const k=todayKey(); S.pace=S.pace||{goal:null,day:null,mode:'normal'};
  if (S.pace.day===k && S.pace.lessons!=null) return S.pace;
  const ceiling=Math.max(0,S.settings.goalLessons||10); const manual=!!S.settings.manualPace;
  const due=dueItems().length, appr=Object.entries(S.items).filter(([key,r])=>ITEMS.has(key)&&r.s>=1&&r.s<=4).length, missed=daysMissed(), st=stats7(), lch=leeches().length;
  let prev=S.pace.goal!=null?S.pace.goal:Math.min(ceiling,10); let goal=prev, mode='normal', why='';
  if (manual){ goal=ceiling; mode='manual'; why='Ritmo fijo: has desactivado la adaptación.'; }
  else if (due>100){ goal=0; mode='recuperacion'; why=`${due} repasos pendientes. Hoy solo repasar, en sesiones cortas.`; }
  else if (appr>120){ goal=0; mode='recuperacion'; why=`${appr} ítems en fase Aprendiz: demasiada carga nueva a la vez. Deja que se asienten.`; }
  else if (missed>=2){ goal=0; mode='recuperacion'; why=`Vuelves tras ${missed} días. Hoy solo repasos, sin prisa. Mañana retomamos lecciones.`; }
  else if (st.acc!=null && st.r>=30 && st.acc<0.75){ goal=Math.max(2,Math.floor(prev/2)); mode='suave'; why=`Precisión del ${Math.round(st.acc*100)} % esta semana. Menos material nuevo hasta que suba.`; }
  else if (weeklyStatus().overdue){ goal=Math.max(2,Math.floor(prev/2)); mode='suave'; why='La revisión semanal te espera: mientras tanto, la mitad de lecciones nuevas.'; }
  else if (lch>=8){ goal=Math.max(2,Math.floor(prev/2)); mode='suave'; why=`${lch} sanguijuelas. Antes de añadir, machaca las que fallas siempre.`; }
  else if (due>60 || appr>90){ goal=Math.max(2,Math.min(prev,ceiling)-2); mode='suave'; why=due>60?`${due} repasos esperando: bajo el ritmo un poco.`:`${appr} en Aprendiz: bajo el ritmo un poco.`; }
  else { const cs=clearedStreak(); if (cs>=3 && (st.acc==null||st.acc>=0.9) && appr<70 && due<30){ goal=Math.min(ceiling,prev+2); mode=goal>prev?'impulso':'normal'; why=goal>prev?`${cs} días seguidos con la cola vacía y más del 90 %: subo a ${goal}.`:`Vas bien y al techo que fijaste (${ceiling}).`; } else { goal=Math.min(ceiling,Math.max(prev,Math.min(ceiling,prev+ (prev<ceiling&&st.active>=3?1:0)))); mode='normal'; why=`Carga equilibrada: ${goal} ${plural(goal,'lección','lecciones')} hoy.`; } }
  goal=Math.max(0,Math.min(ceiling,goal));
  const maxReviews = mode==='recuperacion'?40 : mode==='suave'?60 : (S.settings.maxReviews||100);
  S.pace={goal, lessons:goal, day:k, mode, why, maxReviews, due, appr}; saveLocal(); return S.pace;
}
const PACE_LABEL={recuperacion:'Retomar',suave:'Paso tranquilo',normal:'Paso firme',impulso:'Paso largo',manual:'Ritmo fijo'};
function markClearedIfEmpty(){ if(!dueItems().length){ const d=day(); if(!d.cleared){ d.cleared=1; save(); } } }
// ===================== Lecciones =====================
function grammarGoalToday(){ const base=Math.max(0,S.settings.goalGrammar!=null?S.settings.goalGrammar:2); const pace=paceToday(); if(pace.mode==='recuperacion') return 0; if(pace.mode==='suave') return Math.max(base?1:0,Math.floor(base/2)); return base; }
function lessonsAvailable(track){
  const lv=S.level; const dd0=day(); const empty=(reason,lock)=>({items:[],reason,lock,kv:[],g:[],kvTotal:0,gTotal:0,kvWaiting:0,kvGoal:paceToday().lessons,gGoal:grammarGoalToday(),kvDone:dd0.l||0,gDone:dd0.lg||0,locked:true});
  if (!levelHasContent(lv)) return empty('Este nivel aún no tiene contenido.','gen');
  const due=dueItems().length;
  if (due>150) return empty(`Tienes ${due} repasos pendientes. Las lecciones se desbloquean por debajo de 150.`,'reviews');
  const pace=paceToday(); if (pace.lessons===0 && pace.mode==='recuperacion') return empty('Modo Recuperación: hoy no hay lecciones nuevas. '+pace.why,'pace');
  const all=itemsOfLevel(lv).filter(it=>!(S.items[keyOf(it)]&&S.items[keyOf(it)].s>0));
  // Como WaniKani: una palabra se desbloquea cuando todos sus kanji (los que existen en la app) están en Gurú o más
  const guruK=ch=>{ if(!ITEMS.has('k|'+ch)) return true; const r=S.items['k|'+ch]; return !!(r&&r.s>=5); };
  const vocabReady=it=>it.kind!=='v' || [...it.w].filter(hasKanji).every(guruK);
  const kvAll=levelNeedsGen(lv)?[]:all.filter(it=>it.kind!=='g');
  const kv=kvAll.filter(vocabReady);
  const waiting=kvAll.length-kv.length;
  const kvList=kv.sort((a,b)=>(a.kind==='k'?0:1)-(b.kind==='k'?0:1));
  const gList=all.filter(it=>it.kind==='g');
  const dd=day(); const kvGoal=pace.lessons, gGoal=grammarGoalToday();
  const kvLeft=Math.max(0,kvGoal-(dd.l||0)), gLeft=Math.max(0,gGoal-(dd.lg||0));
  const res={kv:kvList.slice(0,kvLeft), g:gList.slice(0,gLeft), kvTotal:kvList.length, kvWaiting:waiting, gTotal:gList.length, kvGoal, gGoal, kvDone:dd.l||0, gDone:dd.lg||0, reason:''};
  res.items=[...res.kv,...res.g]; if(levelNeedsGen(lv)) res.kvNeedsGen=true;
  if (!res.items.length) res.reason = (!kvList.length&&!gList.length) ? (waiting?`${waiting} ${plural(waiting,'palabra')} del nivel esperan a que sus kanji lleguen a Gurú.`:'Has completado todas las lecciones de este nivel.') : 'Objetivo de hoy cumplido. Mañana, según la carga, habrá más.';
  return track==='g' ? {...res, items:res.g} : track==='kv' ? {...res, items:res.kv} : res;
}
let LESSON=null;
function startLessonBatch(track){
  track = track || 'kv'; const la=lessonsAvailable(track); if(!la.items.length){ toast(la.reason||'No hay lecciones'); return; }
  const batch=la.items.slice(0, track==='g'?3:5);
  LESSON={batch,i:0,track}; renderLesson();
}
function renderLesson(){
  const L=LESSON, it=L.batch[L.i], el=$('#main'); el.innerHTML=''; document.body.classList.add('focus');
  const dots=h('div',{class:'progress-dots'}, L.batch.map((_,i)=>h('i',{class:i<=L.i?'on':''})));
  const head=h('div',{class:'study-head'}, h('button',{class:'btn sm ghost',onclick:()=>{LESSON=null;go('lecciones');}},'✕ Salir'), h('span',{class:'sp'}), dots, h('span',{class:'badge soft'},`Lección ${L.i+1}/${L.batch.length}`));
  const card=h('div',{class:'prompt-card enter kind-'+it.kind+' lesson-body'});
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
  } else {
    card.append(h('div',{class:'ask g',style:'text-align:center'},'Gramática nueva'), h('div',{class:'mid-jp',style:'text-align:center;font-weight:700'},it.t), h('div',{class:'small muted jp',style:'text-align:center'}, it.s||''), h('p',{style:'margin:10px 0 0'}, it.e||''));
    (it.ex||[]).forEach(ex=>{ const c=parseCloze(ex.j); card.append(h('div',{class:'ex'}, h('div',{class:'jp'}, c.pre, h('b',{style:'color:var(--leaf)'},c.answers[0]), c.post, ' ', spkBtn(c.pre+c.answers[0]+c.post)), h('div',{class:'small muted'}, ex.s))); });
  }
  el.append(h('div',{class:'study stack'}, head, card,
    h('div',{class:'row'}, L.i>0?h('button',{class:'btn',onclick:()=>{L.i--;renderLesson();}},'← Anterior'):null, h('button',{class:'btn ghost sm',onclick:()=>{ const k=keyOf(it); S.items[k]={s:9,due:Infinity,c:0,w:0,lrn:now(),ls:now()}; save(); L.batch.splice(L.i,1); toast('Quemado: no volverá a salir'); const inBatch=new Set(L.batch.map(keyOf)); const next=lessonsAvailable(L.track||'kv').items.find(x=>!inBatch.has(keyOf(x))&&keyOf(x)!==k); if(next) L.batch.splice(L.i,0,next); if(!L.batch.length){ LESSON=null; go('lecciones'); return; } if(L.i>=L.batch.length) L.i=L.batch.length-1; renderLesson(); }},'Ya lo sé'), h('span',{class:'sp'}),
      L.i<L.batch.length-1 ? h('button',{class:'btn primary',onclick:()=>{L.i++;renderLesson();window.scrollTo(0,0);}},'Siguiente →') : h('button',{class:'btn leaf',onclick:()=>{const b=L.batch;LESSON=null;startSession('lesson',b,{track:L.track});}},'Empezar el test de la lección'))));
  window.scrollTo(0,0);
}

// ===================== Exámenes =====================
function weeklyStatus(){
  const learned=learnedKeys().length; if(learned<20) return {available:false, overdue:false, text:'Se activa cuando tengas 20 ítems aprendidos.'};
  const last=S.weekly.last||S.created; const due=last+7*D; const overdue=now()>due+1*D;
  return {available:now()>=due-2*D, overdue, due, text: now()>=due ? (overdue?'Pendiente desde hace '+Math.floor((now()-due)/D)+' d':'Disponible') : 'En '+fmtRel(due)};
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
const usedBank=new Set();
function bankSentence(v){ const cands=(typeof EXAM_SENTS!=='undefined'?EXAM_SENTS:[]).filter(x=>x.lv<=S.level&&x.v.includes(v.w)&&x.j.includes(v.w)); const fresh=cands.filter(x=>!usedBank.has(x.j)); const c=rnd(fresh.length?fresh:cands); if(c) usedBank.add(c.j); return c; }
function sentFor(v){ const b=bankSentence(v); if(b) return {text:b.j,es:b.es,fresh:true}; if(v.ex && v.ex.includes(v.w)) return {text:v.ex,es:v.es,fresh:false}; return null; }
function qKanjiReading(v){ const st=sentFor(v); if(!st) return null; const ds=uniq([...mutateReading(v.r), ...pick(VOCAB_ALL.filter(x=>x.r!==v.r&&Math.abs(x.r.length-v.r.length)<=1).map(x=>x.r),3)]).filter(x=>x!==v.r).slice(0,3); if(ds.length<3) return null; return {sec:'漢字読み', type:'mc', text:st.text, under:v.w, es:st.es, fresh:st.fresh, prompt:'¿Cómo se lee la palabra subrayada?', options:shuffle([v.r,...ds]), answer:v.r, key:keyOf(v)}; }
function qOrthography(v){ const ds=kanjiDistractors(v); if(ds.length<3) return null; const st=sentFor(v); if(!st) return null; return {sec:'表記', type:'mc', text:st.text.replace(v.w,v.r), under:v.r, es:st.es, fresh:st.fresh, prompt:'¿Cómo se escribe la palabra subrayada?', options:shuffle([v.w,...ds]), answer:v.w, key:keyOf(v)}; }
function qContext(v, pool){ const same=pool.filter(x=>x.kind==='v'&&x!==v&&x.p===v.p&&x.w!==v.w); const ds=pick(same.length>=3?same:VOCAB_ALL.filter(x=>x.w!==v.w&&x.p===v.p), 3).map(x=>x.w); if(ds.length<3) return null; const st=sentFor(v); if(!st) return null; return {sec:'文脈規定', type:'mc', text:st.text.replace(v.w,'（　　）'), es:st.es, fresh:st.fresh, prompt:'Elige la palabra que encaja en el hueco', options:shuffle([v.w,...ds]), answer:v.w, key:keyOf(v)}; }
function qGrammar(g, pool){ const bank=(typeof EXAM_GRAMMAR!=='undefined'?EXAM_GRAMMAR:[]).find(x=>x.g===g.id); const ex=bank?{j:bank.j,s:bank.s,h:bank.h}:rnd(g.ex); const c=parseCloze(ex.j); const others=pool.filter(x=>x.kind==='g'&&x!==g).flatMap(x=>x.ex.map(e=>parseCloze(e.j).answers[0])).filter(a=>a&&a!==c.answers[0]); const near=others.filter(a=>Math.abs(a.length-c.answers[0].length)<=3); const ds=uniq(pick(near.length>=3?near:others,6)).slice(0,3); if(ds.length<3) return null; return {sec:'文法形式', type:'mc', text:c.pre+'（　　）'+c.post, es:ex.s, prompt:'Elige la forma correcta', options:shuffle([c.answers[0],...ds]), answer:c.answers[0], key:keyOf(g)}; }
function qOrder(o){ const star=1+Math.floor(Math.random()*2); return {sec:'並び替え', type:'order', o, star, prompt:'¿Qué parte va en la posición ★?', options:shuffle(o.parts), answer:o.parts[star], es:o.es}; }
function qProduction(v){ return {sec:'producción', type:'typed', prompt:'Escribe en japonés (kana):', es:v.m.join(', ')+(v.p?' · '+posLabel(v.p):''), check:a=>matchKana(a,[v.r])||!!vocabSynonym(v,a), answer:v.r+(hasKanji(v.w)?'（'+v.w+'）':''), key:keyOf(v)}; }
function qListening(pool, usedLi){ const all=(typeof EXAM_SENTS!=='undefined'?EXAM_SENTS:[]).filter(x=>x.lv<=S.level&&x.es&&!usedLi.has(x.j)); const bank=all.filter(x=>!usedBank.has(x.j)).length>=4?all.filter(x=>!usedBank.has(x.j)):all; if(bank.length<4) return null; const s=rnd(bank); usedLi.add(s.j); const ds=pick(bank.filter(x=>x!==s&&x.es!==s.es),3).map(x=>x.es); if(ds.length<3) return null; return {sec:'聴解', type:'mc', audio:s.j, text:'', prompt:'Escucha la frase y elige lo que significa', options:shuffle([s.es,...ds]), answer:s.es, key:null}; }
function qReading(r){ return r.q.map((q,i)=>({sec:'読解', type:'mc', reading:r, text:q.q, prompt:'Lee el texto y responde', options:q.o.slice(), answer:q.o[q.a], key:null})); }
function buildExam(kind){
  let pool, n, title, minutes;
  if (kind==='level'){ pool=itemsOfLevel(S.level); n={kr:4,or:3,ctx:3,gr:5,ord:2,prod:5,rd:0,li:2}; title=`Examen de nivel ${S.level}`; minutes=20; }
  else if (kind==='weekly'){ pool=learnedKeys().map(k=>ITEMS.get(k)); n={kr:6,or:4,ctx:5,gr:6,ord:3,prod:6,rd:1,li:3}; title='Examen semanal'; minutes=30; }
  else { pool=learnedKeys().map(k=>ITEMS.get(k)); n={kr:12,or:8,ctx:10,gr:14,ord:5,prod:8,rd:2,li:6}; title='Simulacro JLPT'; minutes=60; }
  // ítems más débiles primero, mezcla con aleatorios
  const weak=pool.slice().sort((a,b)=>leechScore(S.items[keyOf(b)]||{})-leechScore(S.items[keyOf(a)]||{}));
  const hasBank=v=>(typeof EXAM_SENTS!=='undefined'?EXAM_SENTS:[]).some(x=>x.lv<=S.level&&x.v.includes(v.w));
  let vs=uniq([...weak.filter(i=>i.kind==='v'&&i.ex).slice(0,10), ...shuffle(pool.filter(i=>i.kind==='v'&&i.ex))]);
  vs=[...vs.filter(hasBank), ...vs.filter(v=>!hasBank(v))];
  const gs=uniq([...weak.filter(i=>i.kind==='g').slice(0,6), ...shuffle(pool.filter(i=>i.kind==='g'))]);
  const qs=[]; let vi=0;
  const take=(fn,count,arr)=>{ let c=0,tries=0; while(c<count&&tries<arr.length*2&&arr.length){ const it=arr[(vi++)%arr.length]; tries++; const q=fn(it); if(q&&!qs.some(x=>x.key===q.key&&x.sec===q.sec)){ qs.push(q); c++; } } };
  take(qKanjiReading,n.kr,vs); take(qOrthography,n.or,vs.filter(v=>hasKanji(v.w))); take(v=>qContext(v,pool),n.ctx,vs); take(g=>qGrammar(g,pool),n.gr,gs);
  const maxLv=Math.max(S.level,2); let ords=ORDER_QS.filter(o=>o.lv<=maxLv && (kind!=='level'||o.lv===S.level)); if(!ords.length) ords=ORDER_QS.filter(o=>o.lv<=maxLv); pick(ords,n.ord).forEach(o=>qs.push(qOrder(o)));
  take(qProduction,n.prod,shuffle(vs));
  if (n.rd){ const rs=READINGS.filter(r=>r.lv<=S.level); pick(rs,n.rd).forEach(r=>qs.push(...qReading(r))); }
  const usedLi=new Set(); for (let i=0;i<(n.li||0);i++){ const q=qListening(pool, usedLi); if(q) qs.push(q); }
  // orden por secciones como el JLPT
  const secOrder=['漢字読み','表記','文脈規定','文法形式','並び替え','読解','聴解','producción']; qs.sort((a,b)=>secOrder.indexOf(a.sec)-secOrder.indexOf(b.sec));
  return {kind,title,qs,minutes,i:0,answers:[],start:now(),deadline:now()+minutes*6e4};
}
let EXAM=null, examTimer=null;
async function startFreshExam(statusEl){
  if(!sb||!USER){ toast('Inicia sesión para generar exámenes con frases nuevas'); return; }
  const learned=learnedKeys().map(k=>ITEMS.get(k));
  const vs=learned.filter(i=>i.kind==='v'), gs=learned.filter(i=>i.kind==='g'), ks=learned.filter(i=>i.kind==='k');
  if(vs.length<30||gs.length<8){ toast('Necesitas al menos 30 palabras y 8 puntos gramaticales aprendidos'); return; }
  if(statusEl) statusEl.textContent='Preparando frases nuevas con lo que has aprendido (hasta un minuto)…';
  try{
    const r=await callFunction('exam',{vocab:shuffle(vs).slice(0,250).map(v=>v.w+'/'+v.r), grammar:shuffle(gs).slice(0,120).map(g=>g.t), kanji:ks.map(k=>k.k), counts:{kr:6,or:4,ctx:5,gr:6,prod:6}, level:tierOf(S.level).n});
    const qs=(r&&r.qs||[]).map(q=>{ if(!q||!q.sec) return null; if(q.sec==='producción'){ if(!q.answer||!q.es) return null; const acc=[q.answer,...(q.alt||[])]; return {sec:'producción',type:'typed',prompt:'Escribe en japonés (kana):',es:q.es,check:a=>matchSentence(a,acc),answer:q.answer,key:null}; } if(!Array.isArray(q.options)||q.options.length<2||!q.options.includes(q.answer)) return null; return {sec:q.sec,type:'mc',text:q.text||'',under:q.under||'',es:q.es||'',prompt:{'漢字読み':'¿Cómo se lee la palabra subrayada?','表記':'¿Cómo se escribe la palabra subrayada?','文脈規定':'Elige la palabra que encaja en el hueco','文法形式':'Elige la forma correcta'}[q.sec]||'Elige', options:shuffle(q.options.slice()), answer:q.answer, key:null}; }).filter(Boolean);
    if(qs.length<10) throw new Error('respuesta incompleta ('+qs.length+' preguntas)');
    const secOrder=['漢字読み','表記','文脈規定','文法形式','並び替え','読解','聴解','producción']; qs.sort((a,b)=>secOrder.indexOf(a.sec)-secOrder.indexOf(b.sec));
    EXAM={kind:'fresh',title:'Examen con frases nuevas',qs,minutes:Math.max(15,qs.length),i:0,answers:[],start:now(),deadline:now()+Math.max(15,qs.length)*6e4};
    clearInterval(examTimer); examTimer=setInterval(()=>{ const t=$('#timer'); if(!EXAM){clearInterval(examTimer);return;} const left=EXAM.deadline-now(); if(t){ t.textContent=fmtTimer(left); t.classList.toggle('low',left<3*6e4);} if(left<=0){ clearInterval(examTimer); toast('Tiempo agotado'); finishExam(); } },1000);
    renderExam();
  }catch(e){ if(statusEl) statusEl.textContent='No se pudo generar: '+(e.message||e); toast('Error al generar el examen'); }
}
function startExam(kind){ const ex=buildExam(kind); if(ex.qs.length<8){ toast('Aún no hay suficiente material aprendido para este examen.'); return; } EXAM=ex; clearInterval(examTimer); examTimer=setInterval(()=>{ const t=$('#timer'); if(!EXAM){clearInterval(examTimer);return;} const left=EXAM.deadline-now(); if(t){ t.textContent=fmtTimer(left); t.classList.toggle('low',left<3*6e4);} if(left<=0){ clearInterval(examTimer); toast('Tiempo agotado'); finishExam(); } },1000); renderExam(); }
const fmtTimer = ms => { ms=Math.max(0,ms); const m=Math.floor(ms/6e4), s=Math.floor(ms%6e4/1000); return m+':'+String(s).padStart(2,'0'); };
function examKeysOff(E){ if(E&&E._kh){ document.removeEventListener('keydown',E._kh); E._kh=null; } }
function renderExam(){
  const E=EXAM, q=E.qs[E.i], el=$('#main'); el.innerHTML=''; document.body.classList.add('focus'); examKeysOff(E);
  const head=h('div',{class:'study-head'}, h('button',{class:'btn sm ghost',onclick:()=>confirmBox('¿Abandonar el examen? No se guardará.',()=>go('examenes'))},'✕ Abandonar'), h('span',{class:'sp'}), h('span',{class:'num'},`${E.i+1}/${E.total||E.qs.length}`), E.dynamic?null:h('span',{class:'timer',id:'timer'},fmtTimer(E.deadline-now())));
  const card=h('div',{class:'card stack'});
  card.append(h('div',{class:'row between'}, h('span',{class:'section-tag'}, q.sec), h('span',{class:'small muted'}, E.title)));
  if (q.reading){ card.append(h('details',{open:E.i===0||E.qs[E.i-1].reading!==q.reading}, h('summary',{}, q.reading.title), h('div',{class:'reader small',lang:'ja',style:'font-size:1.05rem;line-height:2'}, plainReading(q.reading)))); }
  card.append(h('div',{class:'small muted'}, q.prompt));
  if (q.audio){ card.append(h('div',{class:'row',style:'justify-content:center'}, h('button',{class:'btn big',style:'width:auto',onclick:()=>speak(q.audio)},'音 Escuchar'))); if(!q._played){ q._played=true; setTimeout(()=>speak(q.audio),400); } }
  if (q.type==='order'){ const o=q.o; const parts=o.parts.map((p,i)=> i===q.star? h('span',{class:'slot star'},'★') : h('span',{class:'slot'},'＿')); card.append(h('div',{class:'exam-q',lang:'ja'}, o.pre, ...parts, o.post)); }
  else if (q.text){ const t=q.under? h('span',{html:esc(q.text).replace(esc(q.under),'<u>'+esc(q.under)+'</u>')}) : q.text; card.append(h('div',{class:'exam-q',lang:'ja'}, t)); }
  if (q.es && q.type!=='typed' && E.kind!=='mock' && !E.dynamic) card.append(h('div',{class:'small muted'}, h('details',{}, h('summary',{class:'small'},'Traducción (ayuda)'), q.es)));
  if (q.type==='write'){
    card.append(h('div',{class:'big-es',style:'font-size:1.4rem'}, q.topic), h('div',{class:'small muted'}, q.desc));
    const ta=h('textarea',{lang:'ja',placeholder:'Escribe en japonés',style:'min-height:160px;font-family:var(--f-jp);font-size:1.1rem;width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--card)'});
    const cnt=h('span',{class:'small muted num'}); const send=h('button',{class:'btn primary',disabled:true,onclick:()=>{ if(EXAM!==E) return; q.topic=q.topic; recordExam(q,ta.value,true); }},'Enviar');
    ta.addEventListener('input',()=>{ const n=jaLen(ta.value); cnt.textContent=`${n} / ${q.tmin} caracteres como mínimo`; send.disabled=n<q.tmin; });
    card.append(ta, h('div',{class:'row'}, cnt, h('span',{class:'sp'}), h('button',{class:'btn ghost',onclick:()=>recordExam(q,'',false,true)},'Omitir'), send)); setTimeout(()=>ta.focus(),0);
  } else if (q.type==='typed'){
    card.append(h('div',{class:'big-es',style:'font-size:1.4rem'}, q.es));
    const input=h('input',{type:'text',id:'ans',autocomplete:'off',autocapitalize:'off',lang:'ja',placeholder:'romaji → かな'}); kanaInput(input);
    let sent=false; const submit=()=>{ if(sent||EXAM!==E) return; const v=input.value.trim(); if(!v) return; sent=true; recordExam(q, toKana(v,true), q.check(v)); };
    input.addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault();submit();} });
    card.append(h('div',{class:'answer'}, input, h('button',{class:'btn primary',title:'Responder',onclick:submit},'→'))); if(E.dynamic) card.append(h('div',{class:'row',style:'justify-content:center'}, h('button',{class:'btn sm ghost',onclick:()=>{ if(EXAM!==E) return; recordExam(q,'(no sé)',false,true); }},'No sé'))); setTimeout(()=>input.focus(),0);
  } else {
    const ch=h('div',{class:'choices text'+(q.options.some(o=>o.length>12)?' one':'')});
    let sent=false; const choose=(o,unk)=>{ if(sent||EXAM!==E) return; sent=true; [...ch.children].forEach(b=>b.disabled=true); recordExam(q,o,!unk&&o===q.answer,!!unk); };
    q.options.forEach((o,i)=>ch.append(h('button',{lang:'ja',onclick:()=>choose(o)}, h('span',{class:'muted small',style:'margin-right:8px'},(i+1)+'.'), o)));
    card.append(ch); if(E.dynamic) card.append(h('div',{class:'row',style:'justify-content:center'}, h('button',{class:'btn sm ghost',onclick:()=>choose('(no sé)',true)},'No sé')));
    const kh=e=>{ if(EXAM!==E||E.qs[E.i]!==q||e.ctrlKey||e.metaKey||e.altKey) return; const n=parseInt(e.key); if(n>=1&&n<=q.options.length){ examKeysOff(E); choose(q.options[n-1]); } };
    document.addEventListener('keydown',kh); E._kh=kh;
  }
  el.append(h('div',{class:'study stack'}, head, card));
  window.scrollTo(0,0);
}
function recordExam(q, given, ok, unknown){ const E=EXAM; if(!E) return; examKeysOff(E); E.answers.push({sec:q.sec, ok, given, answer:q.answer, key:q.key, es:q.es, typed:q.type==='typed', skill:q.skill, d:q.d, unknown:!!unknown, topic:q.topic, text:q.text||q.audio||(q.o?q.o.pre+q.o.parts.join('')+q.o.post:'')}); E.i++; if(E.dynamic){ plAnswer(E,q,ok,unknown); const nq=plNext(E); if(!nq){ finishPlacement(E); return; } E.qs.push(nq); renderExam(); return; } if(E.i>=E.qs.length) finishExam(); else renderExam(); }
function finishExam(){
  const E=EXAM; if(!E) return; EXAM=null; clearInterval(examTimer); examKeysOff(E); document.body.classList.remove('focus');
  // sin responder (se acabó el tiempo): cuentan como fallo en la nota, pero no penalizan el SRS
  for (let i=E.answers.length;i<E.qs.length;i++){ const q=E.qs[i]; E.answers.push({sec:q.sec, ok:false, given:'(sin responder)', answer:q.answer, key:null, es:q.es, text:q.text||(q.o?q.o.pre+q.o.parts.join('')+q.o.post:'')}); }
  const total=E.qs.length, ok=E.answers.filter(a=>a.ok).length, pct=Math.round(100*ok/total);
  const secs={}; E.answers.forEach(a=>{ const s=secs[a.sec]=secs[a.sec]||{ok:0,n:0}; s.n++; if(a.ok) s.ok++; });
  // consecuencias: los fallos bajan de nivel SRS y vuelven ya
  let penal=0; E.answers.filter(a=>!a.ok&&a.key&&S.items[a.key]&&S.items[a.key].s>0&&S.items[a.key].s<9).forEach(a=>{ const r=S.items[a.key]; r.s=Math.max(1,r.s-1); r.due=now(); r.w=(r.w||0)+1; r.ls=now(); penal++; });
  const rec={kind:E.kind,date:now(),score:pct,ok,total,secs,level:S.level,minutes:Math.round((now()-E.start)/6e4)}; S.exams.push(rec); bump('ex');
  let passed=false, msg='';
  if (E.kind==='weekly'){ S.weekly.last=now(); msg = pct>=80?'Buen examen semanal. Mantén el ritmo.': pct>=60?'Aprobado justo. Los fallos ya están de vuelta en tu cola de repasos.':'Por debajo del 60 %. Esta semana toca repasar más y avanzar menos: los fallos vuelven a la cola ahora.'; }
  if (E.kind==='level'){ passed=pct>=80; if(passed){ S.levelPass[S.level]=pct; if(S.level<MAX_LEVEL) S.level++; msg=`Nivel superado. Bienvenido al nivel ${S.level}.`; } else msg='Necesitas un 80 % para subir de nivel. Los fallos ya están en tu cola: repásalos y repite el examen mañana.'; }
  if (E.kind==='fresh'){ msg = pct>=70 ? 'Con frases que nunca habías visto. Esto sí mide japonés real.' : 'Frases nuevas: por debajo del 70 %. Las secciones flojas te dicen qué repasar; el vocabulario lo sabes, aplicarlo en contexto nuevo es lo que falta.'; }
  if (E.kind==='mock'){ msg = pct>=60 ? 'Por encima del umbral orientativo de aprobado del JLPT (60 %).' : 'Por debajo del umbral orientativo del JLPT (60 %). Mira las secciones débiles.'; }
  rec.passed=passed; save();
  renderExamResult(E, rec, secs, penal, msg);
}
// Frases libres: に y へ valen lo mismo tras un verbo de movimiento; sin puntuación
const sentNorm = s => normKana(toKana(s,true)).replace(/へ/g,'に');
function matchSentence(a, accepted){ const t=sentNorm(a); return accepted.some(x=>sentNorm(x.replace(/（[^）]*）/g,''))===t); }
function examMarkValid(E, rec, secs, a, penal){
  if (a.ok) return penal; a.ok=true; a.judged=true;
  rec.ok=E.answers.filter(x=>x.ok).length; rec.score=Math.round(100*rec.ok/rec.total); if(secs[a.sec]) secs[a.sec].ok++;
  if (a.key&&S.items[a.key]&&S.items[a.key].s>0&&S.items[a.key].s<9&&penal>0){ const r=S.items[a.key]; r.s=Math.min(9,r.s+1); r.w=Math.max(0,(r.w||0)-1); penal--; }
  if (E.kind==='level' && !rec.passed && rec.score>=80){ rec.passed=true; S.levelPass[rec.level]=rec.score; if(S.level===rec.level&&S.level<MAX_LEVEL) S.level++; }
  save(); return penal;
}
function renderExamResult(E, rec, secs, penal, msg){
  const total=rec.total, ok=rec.ok, pct=rec.score; const passAt=E.kind==='level'?80:E.kind==='fresh'?70:60;
  const el=$('#main'); el.innerHTML='';
  const rows=E.answers.filter(a=>!a.ok).map(a=>{ const st=h('span',{class:'small muted'}); 
    const valid=h('button',{class:'btn sm ghost',title:'Mi respuesta era correcta',onclick:()=>{ penal=examMarkValid(E,rec,secs,a,penal); renderExamResult(E,rec,secs,penal,msg); toast('Contada como correcta'); }},'Era válida');
    const ask=h('button',{class:'btn sm ghost',onclick:async()=>{ if(!sb||!USER){ st.textContent='Inicia sesión para comprobarlo.'; return; } ask.disabled=true; st.textContent='Comprobando…'; try{ const r=await callFunction('exam',{judge:true,es:a.es||'',answer:a.answer,given:a.given,level:tierOf(S.level).n}); if(r&&r.valid){ penal=examMarkValid(E,rec,secs,a,penal); toast('Es correcta'); renderExamResult(E,rec,secs,penal,msg); } else { st.textContent=((r&&r.why)||'No es correcta.'); } }catch(e){ st.textContent='No se pudo consultar: '+(e.message||e); ask.disabled=false; } }},'Comprobar');
    return h('tr',{}, h('td',{class:'jp wrap'},a.text||a.es||''), h('td',{class:'jp wrap',style:'color:var(--warn)'},a.given), h('td',{class:'jp wrap',style:'color:var(--ok)'},a.answer), h('td',{class:'wrap'}, a.typed?h('div',{class:'stack',style:'gap:4px'}, valid, ask, st):null)); });
  el.append(h('div',{class:'study stack'},
    h('div',{class:'card',style:'text-align:center'}, h('div',{class:'eyebrow'},E.title), h('div',{class:'score '+(pct>=passAt?'pass':'fail')},pct+'%'), h('div',{class:'muted'},`${ok}/${total} · ${rec.minutes} min`), h('p',{},msg), penal?h('div',{class:'small muted'},`${penal} ${plural(penal,'ítem','ítems')} han bajado de nivel SRS y están pendientes ahora.`):null),
    h('div',{class:'result-grid'}, Object.entries(secs).map(([s,v])=>h('div',{class:'card'}, h('div',{class:'section-tag'},s), h('div',{class:'num',style:'font-weight:700;font-size:1.2rem'},`${v.ok}/${v.n}`), h('div',{class:'bar gold'},h('i',{style:'width:'+Math.round(100*v.ok/v.n)+'%'}))))),
    h('div',{class:'card'}, h('h3',{},'Revisión de fallos'), h('div',{class:'tscroll'}, h('table',{}, h('thead',{},h('tr',{},h('th',{},'Pregunta'),h('th',{},'Tu respuesta'),h('th',{},'Correcta'),h('th',{},''))), h('tbody',{}, rows, rows.length?null:h('tr',{},h('td',{colspan:4},'Sin fallos. Impecable.')))))),
    h('div',{class:'row'}, penal?h('button',{class:'btn warn',onclick:()=>startReviews()},'Repasar los fallos ahora'):null, h('button',{class:'btn primary',onclick:()=>go('hoy')},'Volver a Hoy'))
  ));
  window.scrollTo(0,0);
}
function plainReading(r){ return r.t.replace(/\[([^|\]]+)\|[^\]]*\]/g,'$1'); }
// Etiqueta de hablante de un diálogo: [A|…] o [B|…] al inicio de línea, seguida de 「
const SPEAKER_RE=/(^|\n|\\n)\[([AB])\|[^\]]*\](?=「)/g;
// Texto para el audio: sin etiquetas de hablante ("A", "B") ni anotaciones
function speechPlain(r){ return plainReading({t:r.t.replace(SPEAKER_RE,'$1')}); }
// Trozos para leer en voz alta: en un diálogo, una voz por hablante; en un texto normal, todo seguido
function readingChunks(r){
  const lines=r.t.split(/\r?\n|\\n/); const chunks=[]; let any=false;
  for (const ln of lines){ const m=ln.match(/^\[([AB])\|[^\]]*\](?=「)/); const spk=m?m[1]:undefined; if(m) any=true; const txt=plainReading({t:m?ln.slice(m[0].length):ln}).trim(); if(txt) chunks.push({text:txt,spk}); }
  if (!any) return [{text:speechPlain(r)}];
  return chunks;
}

// ===================== Repasos =====================
function startReviews(onlyLeeches=false, limit=null){
  let due=dueItems();
  if (onlyLeeches){ due=leeches(); if(!due.length){toast('No tienes sanguijuelas ahora mismo.');return;} startSession('drill',due); return; }
  if (!due.length){ toast('No hay repasos pendientes'); return; }
  due.sort((a,b)=>S.items[keyOf(a)].due-S.items[keyOf(b)].due);
  startSession('review', due.slice(0, limit||paceToday().maxReviews||100));
}
function leeches(){ return Object.entries(S.items).filter(([k,r])=>r.s>0&&r.s<9&&ITEMS.has(k)&&(r.w||0)>=3&&leechScore(r)>=1).sort((a,b)=>leechScore(b[1])-leechScore(a[1])).slice(0,10).map(([k])=>ITEMS.get(k)); }
