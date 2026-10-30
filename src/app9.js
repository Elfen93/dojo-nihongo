// ===================== El camino (perfil) =====================
const WEEKDAYS=['L','M','X','J','V','S','D'];
function mondayOf(d){ const t=new Date(d.getFullYear(),d.getMonth(),d.getDate()); t.setDate(t.getDate()-((t.getDay()+6)%7)); return t; }
function weekInfo(){
  const goal=clampN(+S.settings.weekGoal||4,1,7); const mon=mondayOf(new Date()); const days=[];
  for(let i=0;i<7;i++){ const dt=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+i); const d=S.days[todayKey(dt)]; days.push({on:!!(d&&dayCounts(d)),today:todayKey(dt)===todayKey(),future:dt.getTime()>now()}); }
  const done=days.filter(x=>x.on).length;
  // semanas cumplidas (completas, sin contar la actual) y días practicados en total
  const byWeek={}; let total=0; for(const [k,v] of Object.entries(S.days)){ if(!dayCounts(v)) continue; total++; const [y,m,dd]=k.split('-').map(Number); const w=todayKey(mondayOf(new Date(y,m-1,dd))); byWeek[w]=(byWeek[w]||0)+1; }
  const cur=todayKey(mon); const met=Object.entries(byWeek).filter(([w,n])=>w!==cur&&n>=goal).length;
  return {goal,days,done,met,total,ok:done>=goal};
}
// Un sendero de piedras: cada piedra es un tramo del camino recorrido (ítems en Gurú o más); el musgo, lo ya quemado
function caminoSvg(){
  const slots=36; const items=[...ITEMS.values()].filter(i=>i.lv<=TIERS.find(t=>t.n===(S.settings.targetTier||'N4')).to||true);
  const guru=Object.entries(S.items).filter(([k,r])=>ITEMS.has(k)&&r.s>=5).length, burned=Object.entries(S.items).filter(([k,r])=>ITEMS.has(k)&&r.s>=9).length;
  const total=Math.max(1,[...ITEMS.values()].filter(i=>i.lv<=53).length);
  const filled=guru>0?Math.max(1,Math.min(slots,Math.floor(slots*guru/total))):0;
  const W=360,H=250; const pts=[]; for(let i=0;i<slots;i++){ const t=i/(slots-1); const x=34+t*290+Math.sin(t*Math.PI*3)*30*(1-t*0.25); const y=218-t*158+Math.cos(t*Math.PI*2.4)*16; pts.push([x,y]); }
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tu camino: ${filled} de ${slots} tramos" class="camino-svg">`;
  s+=`<path d="M0 232 Q90 214 180 224 T360 214 L360 250 L0 250Z" fill="var(--accent-soft)" opacity=".55"/>`;
  s+=`<path d="M0 246 Q120 226 240 238 T360 230 L360 250 L0 250Z" fill="var(--accent)" opacity=".18"/>`;
  // musgo alrededor de lo quemado
  const moss=Math.min(26,Math.floor(burned/8)); for(let i=0;i<moss;i++){ const p=pts[Math.min(filled,slots-1)>0?(i*7)%Math.max(1,filled):0]; const a=(i*2.399)%6.28, r=10+(i%4)*5; s+=`<circle cx="${(p[0]+Math.cos(a)*r).toFixed(1)}" cy="${(p[1]+Math.sin(a)*r*0.6+4).toFixed(1)}" r="${2.2+(i%3)}" fill="var(--leaf)" opacity=".5"/>`; }
  pts.forEach((p,i)=>{ const done=i<filled; const rx=4.6+(i%3)*0.8+i/slots*1.6, ry=rx*0.58; const last=done&&i===filled-1;
    s+=`<ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${done?'var(--accent)':'none'}" stroke="${done?'none':'var(--line)'}" stroke-width="1.2" ${done?(last?'':'opacity=".78"'):'stroke-dasharray="2 3"'}/>`;
    if(last) s+=`<ellipse cx="${p[0].toFixed(1)}" cy="${(p[1]-1.5).toFixed(1)}" rx="${(rx+4).toFixed(1)}" ry="${(ry+3).toFixed(1)}" fill="none" stroke="var(--accent)" stroke-width="1.2" opacity=".5"/>`; });
  // torii al final del sendero
  const [tx,ty]=pts[slots-1]; s+=`<g transform="translate(${(tx+12).toFixed(1)} ${(ty-20).toFixed(1)})" stroke="var(--fg)" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".75"><path d="M-12 8 V30 M12 8 V30 M-16 8 H16 M-13 14 H13 M-18 4 Q0 10 18 4"/></g>`;
  s+=`</svg>`; return {svg:s,filled,slots,guru,burned,total};
}
function hankoEl(size){ const k=S.settings.hanko||'道'; return h('button',{class:'hanko',style:`--hs:${size||64}px`,title:'Elige tu sello','aria-label':'Tu sello',onclick:pickHanko},k); }
function pickHanko(){
  const ks=Object.entries(S.items).filter(([k,r])=>k.startsWith('k|')&&r.s>0&&ITEMS.has(k)).map(([k])=>k.slice(2));
  const box=h('div',{class:'card stack',style:'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;max-width:420px;width:calc(100% - 32px);max-height:80vh;overflow:auto'}, h('h3',{},'Tu sello'),
    ks.length?h('div',{class:'hanko-grid'}, ['道',...ks].map(k=>h('button',{class:'hanko sm'+((S.settings.hanko||'道')===k?' on':''),onclick:()=>{ S.settings.hanko=k; S.settingsAt=now(); save(); box.remove(); veil.remove(); render(); }},k))):h('div',{class:'small muted'},'Cuando aprendas tus primeros kanji podrás elegir uno como sello.'),
    h('div',{class:'row'}, h('span',{class:'sp'}), h('button',{class:'btn sm',onclick:()=>{box.remove();veil.remove();}},'Cerrar')));
  const veil=h('div',{style:'position:fixed;inset:0;z-index:59;background:rgba(0,0,0,.25)',onclick:()=>{box.remove();veil.remove();}}); document.body.append(veil,box);
}
// Momentos del camino: hitos personales, sin puntuaciones
function cuadernoItems(){
  const ev=[]; const lrn=Object.values(S.items).map(r=>r.lrn).filter(Boolean).sort((a,b)=>a-b);
  if(lrn[0]) ev.push([lrn[0],'Primer ítem aprendido']);
  [50,100,250,500,1000].forEach(n=>{ if(lrn[n-1]) ev.push([lrn[n-1],`${n} ítems aprendidos`]); });
  const rd=Object.values(S.readings||{}).map(r=>r.date).filter(Boolean).sort((a,b)=>a-b); if(rd[0]) ev.push([rd[0],'Primera lectura terminada']); if(rd.length>=10) ev.push([rd[9],'Diez lecturas terminadas']);
  const ws=(S.writings||[]); if(ws[0]) ev.push([ws[0].date,'Primera redacción']); const best=ws.filter(w=>w.score!=null).sort((a,b)=>b.score-a.score)[0]; if(best) ev.push([best.date,`Tu mejor redacción: ${best.score} %`]);
  const ex=S.exams||[]; if(ex[0]) ev.push([ex[0].date,'Primer examen']); const bx=ex.slice().sort((a,b)=>b.score-a.score)[0]; if(bx&&ex.length>2) ev.push([bx.date,`Tu mejor examen: ${bx.score} %`]);
  (S.placements||[]).forEach(p=>ev.push([p.date,`Test de nivel: ${lvLabel(p.overall)}`]));
  Object.entries(S.levelPass||{}).forEach(([lv,sc])=>{ ev.push([ (ex.find(e=>e.kind==='level'&&e.level==+lv)||{}).date||0, `Nivel ${lv} superado`]); });
  return ev.filter(e=>e[0]).sort((a,b)=>b[0]-a[0]).slice(0,8);
}
function caminoSection(){
  const w=weekInfo(); const c=caminoSvg();
  const name=S.settings.name?S.settings.name:'';
  const head=h('div',{class:'camino-head'}, hankoEl(64), h('div',{style:'min-width:0'}, h('div',{class:'lvl'},name||'Tu camino'), h('div',{class:'sub'},`Nivel ${S.level} · ${tierOf(S.level).n} · ${w.total} ${plural(w.total,'día practicado','días practicados')}`), S.settings.hanko?null:h('div',{class:'small',style:'color:var(--accent);margin-top:2px'},'Toca el sello para elegir tu kanji')));
  const dots=h('div',{class:'weekdots'}, w.days.map((d,i)=>h('div',{class:'wd'+(d.on?' on':'')+(d.today?' today':'')+(d.future?' future':'')}, h('i',{}), h('span',{},WEEKDAYS[i]))));
  const goalSel=h('select',{'aria-label':'Días por semana',onchange:e=>{ S.settings.weekGoal=+e.target.value; S.settingsAt=now(); save(); render(); }}, [2,3,4,5,6,7].map(n=>h('option',{value:n,selected:n===w.goal},`${n} días por semana`)));
  const cuaderno=cuadernoItems();
  return h('div',{class:'stack'},
    h('div',{class:'card camino'}, head, h('div',{class:'camino-art',html:c.svg}), h('div',{class:'small muted',style:'text-align:center'},`${c.filled} de ${c.slots} tramos del camino hasta el final de N2`)),
    h('div',{class:'card stack'}, h('div',{class:'row between'}, h('h3',{},'Esta semana'), goalSel), dots, h('div',{class:'small muted'}, w.ok?`Compromiso cumplido: ${w.done} de ${w.goal} días.`:`Llevas ${w.done} de ${w.goal} días. Cada día cuenta, a tu ritmo.`+(w.met?` · ${w.met} ${plural(w.met,'semana cumplida','semanas cumplidas')}`:''))),
    cuaderno.length?h('div',{class:'card stack'}, h('h3',{},'Cuaderno'), h('div',{class:'cuaderno'}, cuaderno.map(([d,t])=>h('div',{class:'cq'}, h('span',{class:'small muted num'},fmtDate(d)), h('span',{},t))))):null,
    (S.placements||[]).length?h('div',{class:'card stack'}, h('h3',{},'Tu último test de nivel'), ...Object.entries(PL_SKILLS).filter(([k])=>S.placements.slice(-1)[0].theta[k]!=null).map(([k,m])=>plBar(m.t,S.placements.slice(-1)[0].theta[k]))):null);
}

// Flechas del teclado en las lecciones: ← anterior, → siguiente (y en la última, empezar el test)
document.addEventListener('keydown',e=>{
  if (!LESSON||SESSION||e.altKey||e.ctrlKey||e.metaKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target&&e.target.tagName)||'')) return;
  if (e.key==='ArrowLeft'){ if(LESSON.i>0){ e.preventDefault(); LESSON.i--; renderLesson(); } }
  else if (e.key==='ArrowRight'){ e.preventDefault(); if(LESSON.i<LESSON.batch.length-1){ LESSON.i++; renderLesson(); window.scrollTo(0,0); } else { const b=LESSON.batch, t=LESSON.track; LESSON=null; startSession('lesson',b,{track:t}); } }
});
boot();
// Descarga en segundo plano (sin ejecutar) las fichas ampliadas y el furigana, para que queden en caché
(window.requestIdleCallback||setTimeout)(()=>{ try{ fetch('ext.js').catch(()=>{}); }catch(e){} }, {timeout:6000});
