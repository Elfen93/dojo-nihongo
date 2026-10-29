// ===================== Test de nivel adaptativo =====================
// Cada destreza tiene su propia estimación (en unidades de "nivel" de la app, 1 a 19). Tras cada respuesta sube o baja
// según la probabilidad que había de acertar; la siguiente pregunta es la más cercana a la estimación actual.
const PL_SKILLS = {
  vocab:{t:'Vocabulario y kanji',quota:7,w:1}, gram:{t:'Gramática',quota:7,w:1}, lect:{t:'Lectura',quota:5,w:1},
  esc:{t:'Escucha',quota:5,w:0.8}, prod:{t:'Producción',quota:6,w:1}, escr:{t:'Escritura',quota:1,w:0.5}
};
const PL_START=3, PL_SCALE=1.5;
const clampN=(x,a,b)=>Math.max(a,Math.min(b,x));
function plProb(theta,d,guess){ return guess+(1-guess)/(1+Math.exp(-(theta-d)/PL_SCALE)); }
// Estimación bayesiana (media a posteriori sobre una rejilla de niveles): no se estanca cuando el alumno está muy por encima o por debajo
const PL_GRID=Array.from({length:77},(_,i)=>0.5+i*0.25);
function plInit(sk){ const lim=sk.max+1; sk.post=PL_GRID.map(g=>g>lim?0:Math.exp(-0.5*((g-5)/5)**2)); plNorm(sk); }
function plNorm(sk){ const s=sk.post.reduce((a,x)=>a+x,0)||1; sk.post=sk.post.map(x=>x/s); const m=PL_GRID.reduce((a,g,i)=>a+g*sk.post[i],0); sk.theta=clampN(m,1,sk.max+1); sk.sd=Math.sqrt(PL_GRID.reduce((a,g,i)=>a+(g-m)**2*sk.post[i],0)); }
function plUpdate(sk, d, guess, score, unknown){
  if(!sk.post) plInit(sk); const gs=unknown?0:guess;
  sk.post=sk.post.map((w,i)=>{ const p=plProb(PL_GRID[i],d,gs); return w*(score?p:1-p); }); plNorm(sk); sk.n++; sk.hist.push(sk.theta);
}
function lvLabel(th){ return th<=3.5?'N5':th<=13.5?'N4':'N3'; }
function withLevel(n, fn){ const old=S.level; S.level=n; try{ return fn(); } finally{ S.level=old; } }
function plPools(){
  const items=[...ITEMS.values()];
  const v=items.filter(i=>i.kind==='v'&&i.lv>=1&&i.lv<=19), g=items.filter(i=>i.kind==='g'&&i.lv>=1&&i.lv<=19);
  const sents=(typeof EXAM_SENTS!=='undefined'?EXAM_SENTS:[]).filter(x=>x.es), orders=(typeof ORDER_QS!=='undefined'?ORDER_QS:[]);
  const mx=a=>a.reduce((m,x)=>Math.max(m,x.lv||1),1);
  return {v,g,sents,orders,reads:READINGS.filter(r=>!r.user&&r.q&&r.q.length), max:{vocab:mx(v),gram:Math.max(mx(g),mx(orders)),lect:mx(READINGS),esc:mx(sents),prod:mx(v),escr:10}};
}
// candidatos por cercanía de nivel (con algo de azar para no repetir siempre lo mismo)
function plNear(arr, target, used, keyf){ return arr.filter(x=>!used.has(keyf(x))).map(x=>({x,s:Math.abs((x.lv||1)-target)+Math.random()*0.9})).sort((a,b)=>a.s-b.s).slice(0,8).map(o=>o.x); }
function plGen(E, skill, target){
  const P=E.pools, used=E.used;
  const done=(q,key,d)=>{ if(!q) return null; used.add(key); q.skill=skill; q.d=d; q.guess=q.type==='typed'?0:0.25; return q; };
  if (skill==='vocab'){
    for (const v of plNear(P.v,target,used,x=>'v:'+keyOf(x))){ const kind=hasKanji(v.w)?rnd(['kr','or','ctx']):'ctx'; const q=withLevel(99,()=>kind==='kr'?qKanjiReading(v):kind==='or'?qOrthography(v):qContext(v,P.v.filter(x=>x.lv<=v.lv+2))); if(q) return done(q,'v:'+keyOf(v),v.lv); }
  } else if (skill==='gram'){
    if (Math.random()<0.7||!P.orders.length){ for (const g of plNear(P.g,target,used,x=>'g:'+keyOf(x))){ const q=qGrammar(g,P.g.filter(x=>Math.abs(x.lv-g.lv)<=3)); if(q) return done(q,'g:'+keyOf(g),g.lv); } }
    const o=plNear(P.orders,target,used,x=>'o:'+x.parts.join(''))[0]; if(o){ const q=qOrder(o); return done(q,'o:'+o.parts.join(''),o.lv); }
  } else if (skill==='lect'){
    for (const r of plNear(P.reads,target,used,x=>'r:'+x.id)){ const qi=Math.floor(Math.random()*r.q.length), q0=r.q[qi]; const q={sec:'読解',type:'mc',reading:r,text:q0.q,prompt:'Lee el texto y responde',options:shuffle(q0.o.slice()),answer:q0.o[q0.a],key:null}; return done(q,'r:'+r.id,r.lv); }
  } else if (skill==='esc'){
    const s=plNear(P.sents,target,used,x=>'s:'+x.j)[0]; if(s){ const ds=pick(P.sents.filter(x=>x!==s&&x.es!==s.es&&Math.abs(x.lv-s.lv)<=3),3).map(x=>x.es); if(ds.length===3) return done({sec:'聴解',type:'mc',audio:s.j,text:'',prompt:'Escucha la frase y elige lo que significa',options:shuffle([s.es,...ds]),answer:s.es,key:null},'s:'+s.j,s.lv); }
  } else if (skill==='prod'){
    for (const v of plNear(P.v,target,used,x=>'p:'+keyOf(x))){ const q=qProduction(v); return done(q,'p:'+keyOf(v),v.lv); }
  } else if (skill==='escr'){
    const topic=WRITING_TOPICS.N5[Math.floor(Math.random()*WRITING_TOPICS.N5.length)]; return done({sec:'作文',type:'write',topic:topic.t,desc:topic.d,tmin:60,prompt:'Escribe en japonés',key:null},'w',4);
  }
  return null;
}
function plNextSkill(E){
  const open=Object.entries(E.skills).filter(([k,s])=>s.n<s.quota && !s.stop); if(!open.length) return null;
  // la escritura va al final; el resto, intercalado por la destreza más atrasada
  const rest=open.filter(([k])=>k!=='escr'); const pool=rest.length?rest:open;
  const minR=Math.min(...pool.map(([k,s])=>s.n/s.quota)); const cand=pool.filter(([k,s])=>s.n/s.quota-minR<0.01);
  // empieza suave: vocabulario primero, y las lecturas (largas) no abren el test
  if(!E.answers.length&&cand.some(([k])=>k==='vocab')) return 'vocab';
  const soft=cand.filter(([k])=>!(k==='lect'&&E.answers.length<4)); return rnd(soft.length?soft:cand)[0];
}
function plNext(E){
  for (let t=0;t<6;t++){ const k=plNextSkill(E); if(!k) return null; const s=E.skills[k]; const q=plGen(E,k,s.theta+(Math.random()*1.2-0.6)); if(q) return q; s.stop=true; }
  return null;
}
function plAnswer(E, q, ok, unknown){
  const sk=E.skills[q.skill]; if(!sk||q.type==='write') return;
  plUpdate(sk,q.d,q.guess,ok?1:0,unknown);
  // parada anticipada: la estimación ya no se mueve
  if (sk.n>=4 && sk.n<sk.quota && sk.sd<0.8) sk.stop=true;
}
function startPlacement(){
  const pools=plPools(); const skills={}; for(const [k,m] of Object.entries(PL_SKILLS)){ skills[k]={theta:PL_START,n:0,hist:[],quota:m.quota,max:pools.max[k]||13,stop:false}; plInit(skills[k]); }
  const signed=!!(sb&&USER); if(!signed){ skills.escr.stop=true; }
  const total=Object.values(skills).reduce((a,s)=>a+(s.stop?0:s.quota),0);
  EXAM={kind:'placement',title:'Test de nivel',dynamic:true,qs:[],i:0,answers:[],start:now(),deadline:now()+180*6e4,total,skills,pools,used:new Set()};
  clearInterval(examTimer); const q=plNext(EXAM); if(!q){ EXAM=null; toast('No hay preguntas suficientes'); return; } EXAM.qs.push(q); renderExam();
}
async function finishPlacement(E){
  EXAM=null; clearInterval(examTimer); examKeysOff(E); document.body.classList.remove('focus');
  const el=$('#main'); el.innerHTML='';
  const w=E.answers.find(a=>a.skill==='escr'&&a.given&&!a.unknown);
  let wnote='';
  if (w){
    el.append(h('div',{class:'muted',style:'text-align:center;margin-top:20vh'},'Corrigiendo tu texto…'));
    try{ const r=await callFunction('write',{text:w.given,topic:w.topic||'Presentación',level:'N5',use:[],min:60,max:200}); const sc=clampN(+r.score||0,0,100); const sk=E.skills.escr; sk.theta=clampN(1+sc/100*9,1,10); sk.n=1; wnote=r.comment||''; w.score=sc; }
    catch(e){ E.skills.escr.n=0; wnote='No se pudo corregir el texto: '+(e.message||e); }
  } else E.skills.escr.n=0;
  const res={}; let sw=0, sum=0;
  for (const [k,s] of Object.entries(E.skills)){ if(s.n===0) continue; res[k]=Math.round(s.theta*10)/10; sum+=s.theta*PL_SKILLS[k].w; sw+=PL_SKILLS[k].w; }
  const overall=Math.round(sum/Math.max(sw,0.1)*10)/10;
  // Solo se da por sabido lo que está claramente por debajo de tu nivel en vocabulario y en gramática (margen de 1,5 niveles)
  const cut=x=>x==null?overall-1.5:x-1.5; const rec=clampN(Math.floor(Math.min(cut(res.vocab),cut(res.gram)))+1,1,13);
  const graded=E.answers.filter(a=>a.skill!=='escr'); const rec0={date:now(),theta:res,overall,rec,answered:graded.length,ok:graded.filter(a=>a.ok).length};
  S.placements=S.placements||[]; S.placements.push(rec0); S.placements=S.placements.slice(-10); save();
  renderPlacementResult(rec0, wnote);
}
function plBar(label, th){
  const pct=clampN((th-1)/18*100,0,100);
  return h('div',{}, h('div',{class:'row between small'}, h('span',{},label), h('span',{class:'num muted'},`${lvLabel(th)} · nivel ${th.toFixed(1)}`)),
    h('div',{class:'bar plbar'}, h('i',{style:'width:'+pct+'%'})));
}
function renderPlacementResult(r, wnote){
  const el=$('#main'); el.innerHTML='';
  const entries=Object.entries(r.theta).sort((a,b)=>a[1]-b[1]); const weakest=entries[0]&&PL_SKILLS[entries[0][0]].t, strongest=entries.length>1&&PL_SKILLS[entries[entries.length-1][0]].t;
  const tooHigh=r.overall>=14;
  const known=[...ITEMS.values()].filter(i=>i.lv<r.rec&&!(S.items[keyOf(i)]&&S.items[keyOf(i)].s>=5)).length;
  el.append(h('div',{class:'study stack'},
    h('div',{class:'card',style:'text-align:center'}, h('div',{class:'eyebrow'},'Resultado del test de nivel'), h('div',{class:'score pass'},lvLabel(r.overall)), h('div',{class:'muted'},`nivel ${r.overall.toFixed(1)} de 19 · ${r.ok}/${r.answered} aciertos`), tooHigh?h('p',{class:'small muted',style:'margin:8px 0 0'},'Superas el contenido de N4 de la app; el vocabulario de N3 se genera al llegar a ese nivel.'):null),
    h('div',{class:'card stack'}, h('h3',{},'Por destreza'), ...Object.entries(PL_SKILLS).filter(([k])=>r.theta[k]!=null).map(([k,m])=>plBar(m.t,r.theta[k])), weakest&&strongest&&weakest!==strongest?h('div',{class:'small muted'},`Más fuerte: ${strongest}. A reforzar: ${weakest}.`):null, wnote?h('div',{class:'small muted'},wnote):null),
    h('div',{class:'card stack'}, h('h3',{},`Empezar en el nivel ${r.rec}`), h('div',{class:'small muted'},known?`${known} ítems de los niveles anteriores se marcan como conocidos (Gurú I) y vuelven en repasos espaciados.`:'No hay ítems por marcar.'),
      h('div',{class:'row'}, S.level<r.rec||known?h('button',{class:'btn primary',onclick:()=>applyPlacement(r)},'Aplicar resultado'):null, h('button',{class:'btn',onclick:()=>go('examenes')},'Ahora no')))));
  window.scrollTo(0,0);
}
function applyPlacement(r){
  let n=0; const t=now();
  for (const it of ITEMS.values()){ if(it.lv>=r.rec) continue; const k=keyOf(it), cur=S.items[k]; if(cur&&cur.s>=5) continue; S.items[k]={...(cur||{c:0,w:0}),s:5,due:t+STAGE_HOURS[5]*H*Math.random(),lrn:(cur&&cur.lrn)||t,ls:t,placed:1}; n++; }
  if (S.level<r.rec) S.level=r.rec;
  if (r.theta.escr!=null){ const g=r.theta.escr>=7?3:r.theta.escr>=4.5?2:1; S.wgrade=Math.max(S.wgrade||1,g); }
  S.pace=null; save(); toast(`Nivel ${S.level}: ${n} ítems marcados como conocidos`); go('hoy');
}
function placementCard(){
  const last=(S.placements||[]).slice(-1)[0];
  return h('div',{class:'card stack'}, h('div',{class:'section-tag'},'Test de nivel'), h('div',{class:'small muted'}, last?`Último: ${fmtDate(last.date)} · ${lvLabel(last.overall)} · nivel ${last.overall.toFixed(1)}`:'Unas 30 preguntas que se adaptan a ti'), h('button',{class:'btn primary',onclick:startPlacement},last?'Repetir el test':'Hacer el test'));
}
