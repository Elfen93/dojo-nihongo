// ===================== Escritura a mano de kanji =====================
// Orden y forma de los trazos: KanjiVG (CC BY-SA 3.0, kanjivg.tagaini.net), cargados bajo demanda desde strokes.js
let STROKE_STATE=0; const STROKE_WAIT=[];
function loadStrokes(){
  return new Promise(res=>{
    if(STROKE_STATE===2) return res();
    STROKE_WAIT.push(res); if(STROKE_STATE===1) return; STROKE_STATE=1;
    const s=document.createElement('script'); s.src='strokes.js';
    s.onload=()=>{ STROKE_STATE=2; STROKE_WAIT.splice(0).forEach(f=>f()); };
    s.onerror=()=>{ STROKE_STATE=0; STROKE_WAIT.splice(0).forEach(f=>f()); };
    document.head.append(s);
  });
}
// Escritura a mano: ciclo propio, como WaniKani. Cada kanji tiene su etapa de escritura, independiente de la de reconocimiento.
// Lecciones nuevas (calcar y luego de memoria) hasta una cuota diaria + repasos de lo ya escrito.
const HW_STEPS=[4/24,8/24,1,2,7,14,30,120]; // días hasta el siguiente repaso según la etapa (1 a 8); a la etapa 9 está «quemado»
const HW_REV_MAX=20; // repasos máximos por sesión
function hwQuota(){ const q=(S.settings||{}).hwNew; return q==null?5:q; }
function hwAvail(){ const lvl=S.level||1; return [...ITEMS.values()].filter(i=>i.kind==='k'&&(i.lv<=lvl||(S.items['k|'+i.k]&&S.items['k|'+i.k].s>=1))); }
function handLearned(){ return hwAvail().filter(i=>STROKES[i.k]).sort((a,b)=>a.lv-b.lv); }
// disponibles: kanji de tu nivel (aunque no sepas escribirlos); pendientes = repasos que tocan; nuevos = sin escribir nunca
function handStatus(){
  const hand=S.hand||{}, t=now(); const learned=handLearned();
  const due=learned.filter(i=>hand[i.k]&&(hand[i.k].due||0)<=t).sort((a,b)=>(hand[a.k].due||0)-(hand[b.k].due||0));
  const fresh=learned.filter(i=>!hand[i.k]);
  return {due,fresh,learned};
}
function handPool(){
  const st=handStatus(), d=day(); const newLeft=Math.max(0,hwQuota()-(d.hwn||0));
  const rev=st.due.slice(0,HW_REV_MAX).map(i=>i.k), nw=st.fresh.slice(0,newLeft).map(i=>i.k); const list=[...rev,...nw];
  if (list.length) return {list,fallback:false,extra:false};
  // sin nada pendiente ni lecciones: práctica extra con los que más tiempo llevan sin escribirse
  const hand=S.hand||{}; const ex=st.learned.filter(i=>hand[i.k]).sort((a,b)=>(hand[a.k].last||0)-(hand[b.k].last||0)).slice(0,5).map(i=>i.k);
  if (ex.length) return {list:ex,fallback:false,extra:true};
  const nw2=st.fresh.slice(0,3).map(i=>i.k); if (nw2.length) return {list:nw2,fallback:false,extra:true};
  const n5=[...ITEMS.values()].filter(i=>i.kind==='k'&&STROKES[i.k]&&i.lv<=3).slice(0,3).map(i=>i.k);
  return {list:n5,fallback:true,extra:false};
}
function strokeSvg(ch,opts={}){
  const st=STROKES[ch]; if(!st) return '';
  const nums=opts.numbers?st.map((d,i)=>{ const m=d.match(/^M\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/); return m?`<text x="${(+m[1]-5).toFixed(1)}" y="${(+m[2]-1.5).toFixed(1)}" class="hw-num">${i+1}</text>`:''; }).join(''):'';
  return `<svg viewBox="0 0 109 109" class="hw-model" aria-hidden="true">${st.map((d,i)=>`<path d="${d}" fill="none" stroke="currentColor" stroke-width="${opts.w||4.2}" stroke-linecap="round" stroke-linejoin="round"${opts.focus!=null?(i===opts.focus?' class="hw-next" stroke-width="6"':(i<opts.focus?' opacity=".18"':' opacity=".35" stroke-dasharray="1.5 4"')):''}/>`).join('')}${nums}</svg>`;
}
function animateStrokes(box){
  const ps=[...box.querySelectorAll('path')]; let t=0;
  ps.forEach(p=>{ const len=p.getTotalLength(); const dur=Math.max(260,len*11); p.style.strokeDasharray=len; p.style.strokeDashoffset=len; p.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:dur,delay:t,fill:'forwards',easing:'ease-in-out'}); t+=dur+120; });
}
function handCanvas(onChange){
  const c=h('canvas',{width:640,height:640,class:'hw-canvas'}); const ctx=c.getContext('2d'); const strokes=[]; let cur=null;
  const pos=e=>{ const r=c.getBoundingClientRect(); return [(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]; };
  const draw=()=>{ ctx.clearRect(0,0,c.width,c.height); ctx.lineWidth=15; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle=getComputedStyle(c).color;
    for (const s of strokes){ ctx.beginPath(); s.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); if(s.length===1) ctx.lineTo(s[0][0]+.1,s[0][1]); ctx.stroke(); } };
  c.addEventListener('pointerdown',e=>{ e.preventDefault(); try{ c.setPointerCapture(e.pointerId); }catch(_){} cur=[pos(e)]; strokes.push(cur); draw(); });
  c.addEventListener('pointermove',e=>{ if(!cur) return; cur.push(pos(e)); draw(); });
  const end=()=>{ if(cur){ cur=null; onChange(strokes.length); } };
  c.addEventListener('pointerup',end); c.addEventListener('pointercancel',end);
  return {el:c, undo(){ strokes.pop(); draw(); onChange(strokes.length); }, clear(){ strokes.length=0; draw(); onChange(0); }, count:()=>strokes.length};
}
function startHandwriting(){
  loadStrokes().then(()=>{
    if (STROKE_STATE!==2){ toast('No se pudieron cargar los trazos (¿sin conexión?)'); return; }
    const pool=handPool();
    PRACT={mode:'escritura',queue:pool.list,i:0,ok:0,again:[],seen:new Set(),learned:new Set(),total:pool.list.length,fallback:pool.fallback,extra:pool.extra}; renderPractica();
  });
}
function startHandPick(){
  loadStrokes().then(()=>{
    if (STROKE_STATE!==2){ toast('No se pudieron cargar los trazos (¿sin conexión?)'); return; }
    PRACT={mode:'escritura-pick',sel:new Set()}; renderPractica();
  });
}
function renderHandPick(){
  const P=PRACT, el=$('#main'); el.innerHTML=''; const hand=S.hand||{};
  el.append(h('div',{class:'topline'}, h('button',{class:'btn sm ghost',onclick:()=>{ PRACT={mode:null}; renderPractica(); }},'← Práctica'), h('h1',{},'Elegir kanji')));
  const list=handLearned().sort((a,b)=>a.lv-b.lv);
  if (!list.length){ el.append(h('div',{class:'card muted'},'Aún no has empezado ningún kanji.')); return; }
  const cnt=h('span',{class:'num'},''); const go=h('button',{class:'btn primary',onclick:()=>{ const q=[...P.sel]; if(!q.length) return; PRACT={mode:'escritura',queue:q,i:0,ok:0,again:[],seen:new Set(),learned:new Set(),total:q.length,fallback:false,extra:true}; renderPractica(); }},'');
  const upd=()=>{ cnt.textContent=P.sel.size; go.textContent=P.sel.size?`Practicar ${P.sel.size}`:'Elige uno o más'; go.disabled=!P.sel.size; };
  const cells=list.map(i=>{ const b=h('button',{class:'btn hw-pick'+(P.sel.has(i.k)?' on':''),title:(i.m||[]).join(', '),onclick:()=>{ P.sel.has(i.k)?P.sel.delete(i.k):P.sel.add(i.k); b.classList.toggle('on'); upd(); }},i.k); return b; });
  const rnd=h('button',{class:'btn',onclick:()=>{ const a=list.map(i=>i.k).sort(()=>Math.random()-.5).slice(0,10); P.sel=new Set(a); renderHandPick(); }},'10 al azar');
  el.append(h('div',{class:'card stack'}, h('div',{class:'small muted'},'Toca los kanji que quieras escribir. Cuentan para tu repaso igual que los demás.'), h('div',{class:'hw-picks'},...cells), h('div',{class:'row'},go,rnd)));
  upd();
}
function renderEscritura(){
  const P=PRACT, el=$('#main'); el.innerHTML='';
  el.append(h('div',{class:'topline'}, h('button',{class:'btn sm ghost',onclick:()=>{ PRACT={mode:null}; renderPractica(); }},'← Práctica'), h('h1',{},'Escribir a mano')));
  if (P.i>=P.queue.length){
    const done=[...new Set(P.queue)];
    el.append(h('div',{class:'card stack',style:'text-align:center'}, h('div',{class:'eyebrow'},'Sesión terminada'), h('div',{class:'big-jp'},done.join(' ')), h('div',{},`${P.ok} de ${P.total} escritos bien a la primera`), P.again.length?h('div',{class:'small muted'},'Los repetiste hasta acertarlos: '+[...new Set(P.again)].join(' ')):null,
      h('div',{class:'row',style:'justify-content:center'}, h('button',{class:'btn primary',onclick:startHandwriting},'Otra sesión'), h('button',{class:'btn',onclick:()=>{ PRACT={mode:null}; renderPractica(); }},'Salir'))));
    return;
  }
  const ch=P.queue[P.i]; const it=ITEMS.get('k|'+ch); const total=STROKES[ch].length;
  const isNew=!(S.hand&&S.hand[ch])&&!P.learned.has(ch); // kanji que nunca has escrito: primero lección (calcar), luego de memoria
  let revealed=false, tracing=isNew, n=0;
  const read=[...(it.on||[]).slice(0,2).map(r=>kataToHira(r.split('.')[0])), ...(it.kun||[]).slice(0,2).map(r=>r.split('.')[0])].filter(Boolean);
  const info=h('div',{class:'stack',style:'text-align:center;gap:4px'}, h('div',{class:'eyebrow'},isNew?'Lección nueva: calca el kanji siguiendo la guía':(P.learned.has(ch)&&!P.seen.has(ch)?'Ahora de memoria':(P.seen.has(ch)?'Repetición: ahora de memoria':`Kanji ${Math.min(P.seen.size+1,P.total)} de ${P.total}`))), h('div',{style:'font-size:1.4rem;font-weight:600'},(it.m||[]).join(', ')), h('div',{class:'small muted jp'},read.join('・')));
  const status=h('div',{class:'small muted',style:'text-align:center'});
  const model=h('div',{class:'hw-overlay',html:''});
  const cv=handCanvas(c=>{ n=c; refresh(); });
  const box=h('div',{class:'hw-box'}, model, cv.el);
  const actions=h('div',{class:'row',style:'justify-content:center;gap:8px;flex-wrap:wrap'});
  function setModel(show,animate,numbers){
    // Calcar: guía trazo a trazo (el siguiente resaltado, los hechos tenues); Ver modelo: todo el kanji animado en orden
    const guide=show&&!revealed&&tracing;
    model.innerHTML=show?strokeSvg(ch,{numbers:numbers||guide,w:4.6,focus:guide?Math.min(n,total-1):null}):''; model.style.opacity=show?(revealed?'.55':(guide?'.8':'.16')):'0'; if(show&&animate) animateStrokes(model);
  }
  function refresh(){
    actions.innerHTML='';
    if (!revealed&&tracing) setModel(true,false,true);
    if (isNew&&!revealed){
      status.textContent=n>=total?'Listo. Ahora lo escribirás de memoria.':`${n} de ${total} trazos · sigue la guía`;
      actions.append(h('button',{class:'btn sm',disabled:!n,onclick:()=>cv.undo()},'Deshacer trazo'), h('button',{class:'btn sm',disabled:!n,onclick:()=>cv.clear()},'Borrar'),
        h('button',{class:'btn sm ghost',onclick:()=>{ tracing=false; setModel(true,true,true); const t=total*900+400; setTimeout(()=>{ if(!revealed){ tracing=true; setModel(true,false,true); } },t); }},'Ver el orden'),
        h('button',{class:'btn primary',disabled:n<total,onclick:()=>{ P.learned.add(ch); renderPractica(); }},'Ya lo calqué'));
    } else if (!revealed){
      status.textContent=n?`${n} ${n===1?'trazo':'trazos'}`:'Escribe el kanji de memoria; si no te acuerdas, pulsa «Ver modelo»';
      actions.append(h('button',{class:'btn sm',disabled:!n,onclick:()=>cv.undo()},'Deshacer trazo'), h('button',{class:'btn sm',disabled:!n,onclick:()=>cv.clear()},'Borrar'),
        h('button',{class:'btn sm ghost',onclick:()=>{ tracing=!tracing; setModel(tracing,false,false); refresh(); }},tracing?'Quitar guía':'Calcar'),
        tracing?h('button',{class:'btn sm ghost',onclick:()=>{ tracing=false; setModel(true,true,true); const t=total*900+400; setTimeout(()=>{ if(!revealed){ tracing=true; setModel(true,false,true); } },t); }},'Ver el orden'):null,
        h('button',{class:'btn primary',onclick:()=>{ revealed=true; tracing=false; setModel(true,true,true); refresh(); }},'Ver modelo'));
    } else {
      const same=n===total;
      status.innerHTML=''; status.append(h('span',{style:'color:'+(same?'var(--ok)':'var(--warn)')},`Tus trazos: ${n} · modelo: ${total}`), h('div',{class:'small muted'},'Compara la forma y el orden. Algunos kanji admiten variantes: sé honesto contigo.'));
      actions.append(h('button',{class:'btn sm',disabled:!n,onclick:()=>cv.undo()},'Deshacer trazo'), h('button',{class:'btn sm',disabled:!n,onclick:()=>cv.clear()},'Borrar'), h('button',{class:'btn sm ghost',onclick:()=>{ setModel(true,true,true); }},'Repetir animación'),
        h('button',{class:'btn warn',title:'Volverá a salir dentro de unos kanji',onclick:()=>grade(false)},'Necesito repetirlo'), h('button',{class:'btn primary',onclick:()=>grade(true)},'Lo escribí bien'));
    }
  }
  function grade(ok){
    S.hand=S.hand||{}; const firstEver=!(S.hand[ch]&&S.hand[ch].n); const r=S.hand[ch]||{n:0,ok:0,last:0,st:0}; r.n++; if(ok) r.ok++; r.last=now();
    // solo el primer intento de la sesión cuenta para el calendario; las repeticiones después de un fallo no lo cambian
    if (!P.seen.has(ch)){ if(ok){ r.st=(r.st||0)+1; r.due=now()+(r.st>=9?3650:HW_STEPS[r.st-1])*864e5; } else { r.st=(r.st||1)>=5?(r.st||1)-2:Math.max(1,(r.st||1)-1); r.due=now()+HW_STEPS[0]*864e5; } }
    S.hand[ch]=r; S.settingsAt=now(); bump('hw'); if(firstEver) bump('hwn');
    const first=!P.seen.has(ch); P.seen.add(ch);
    if(ok){ if(first) P.ok++; }
    else { P.again.push(ch); P.queue.splice(Math.min(P.queue.length,P.i+3+Math.floor(Math.random()*2)),0,ch); } // vuelve a salir tras 2 o 3 kanji más, hasta que lo escribas bien
    P.i++; renderPractica();
  }
  el.append(h('div',{class:'card stack',style:'align-items:center'}, info, h('div',{style:'width:100%;display:flex;justify-content:center'},box), status, actions));
  el.append(h('div',{class:'small muted',style:'text-align:center;margin-top:10px'},'Trazos: KanjiVG (CC BY-SA 3.0)'));
  refresh();
  if (isNew){ setModel(true,true,true); setTimeout(()=>{ if(!revealed&&n===0&&P.queue[P.i]===ch){ tracing=true; setModel(true,false,true); } },total*900+400); }
}

// Resumen para la tarjeta de Práctica y la pantalla Hoy (no necesita los datos de trazos: usa el catálogo de kanji)
function hwCounts(){
  const hand=S.hand||{}, t=now(); const av=hwAvail(), d=day();
  const due=av.filter(i=>hand[i.k]&&(hand[i.k].due||0)<=t).length, fresh=av.filter(i=>!hand[i.k]).length;
  return {due,fresh,total:av.length,newLeft:Math.min(fresh,Math.max(0,hwQuota()-(d.hwn||0))),done:d.hw||0};
}
function hwSummary(){
  const c=hwCounts();
  if (!c.total) return 'Los kanji de tu nivel, aunque ya los reconozcas';
  const bits=[]; if(c.due) bits.push(`${c.due} ${plural(c.due,'repaso','repasos')}`); if(c.newLeft) bits.push(`${c.newLeft} ${plural(c.newLeft,'lección nueva','lecciones nuevas')} hoy`);
  return bits.length?bits.join(' · '):(c.fresh?'Al día hoy · más lecciones mañana':'Al día: nada pendiente');
}
