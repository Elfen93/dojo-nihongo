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
// Kanji para practicar: primero los que más tiempo llevan sin escribirse o con más fallos; solo los que ya has empezado a aprender
function handPool(n=8){
  const hand=S.hand||{};
  let ks=[...ITEMS.values()].filter(i=>i.kind==='k'&&STROKES[i.k]&&S.items['k|'+i.k]&&S.items['k|'+i.k].s>=1);
  let fallback=false;
  if (!ks.length){ ks=[...ITEMS.values()].filter(i=>i.kind==='k'&&STROKES[i.k]&&i.lv<=3); fallback=true; }
  ks.sort((a,b)=>{ const ha=hand[a.k]||{}, hb=hand[b.k]||{}; const sa=(ha.last||0)-((ha.n||0)-(ha.ok||0))*864e5, sb=(hb.last||0)-((hb.n||0)-(hb.ok||0))*864e5; return sa-sb; });
  return {list:ks.slice(0,n).map(i=>i.k), fallback};
}
function strokeSvg(ch,opts={}){
  const st=STROKES[ch]; if(!st) return '';
  const nums=opts.numbers?st.map((d,i)=>{ const m=d.match(/^M\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/); return m?`<text x="${(+m[1]-5).toFixed(1)}" y="${(+m[2]-1.5).toFixed(1)}" class="hw-num">${i+1}</text>`:''; }).join(''):'';
  return `<svg viewBox="0 0 109 109" class="hw-model" aria-hidden="true">${st.map(d=>`<path d="${d}" fill="none" stroke="currentColor" stroke-width="${opts.w||4.2}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}${nums}</svg>`;
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
    const pool=handPool(8);
    PRACT={mode:'escritura',queue:pool.list,i:0,ok:0,again:[],seen:new Set(),total:pool.list.length,fallback:pool.fallback}; renderPractica();
  });
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
  let revealed=false, tracing=false, n=0;
  const read=[...(it.on||[]).slice(0,2).map(r=>kataToHira(r.split('.')[0])), ...(it.kun||[]).slice(0,2).map(r=>r.split('.')[0])].filter(Boolean);
  const info=h('div',{class:'stack',style:'text-align:center;gap:4px'}, h('div',{class:'eyebrow'},P.seen.has(ch)?'Repetición: ahora de memoria':`Kanji ${Math.min(P.seen.size+1,P.total)} de ${P.total}`), h('div',{style:'font-size:1.4rem;font-weight:600'},(it.m||[]).join(', ')), h('div',{class:'small muted jp'},read.join('・')));
  const status=h('div',{class:'small muted',style:'text-align:center'});
  const model=h('div',{class:'hw-overlay',html:''});
  const cv=handCanvas(c=>{ n=c; refresh(); });
  const box=h('div',{class:'hw-box'}, model, cv.el);
  const actions=h('div',{class:'row',style:'justify-content:center;gap:8px;flex-wrap:wrap'});
  function setModel(show,animate,numbers){
    model.innerHTML=show?strokeSvg(ch,{numbers,w:4.6}):''; model.style.opacity=show?(revealed?'.55':'.16'):'0'; if(show&&animate) animateStrokes(model);
  }
  function refresh(){
    actions.innerHTML='';
    if (!revealed){
      status.textContent=n?`${n} ${n===1?'trazo':'trazos'}`:'Escribe el kanji de memoria; si no te acuerdas, pulsa «Ver modelo»';
      actions.append(h('button',{class:'btn sm',disabled:!n,onclick:()=>cv.undo()},'Deshacer trazo'), h('button',{class:'btn sm',disabled:!n,onclick:()=>cv.clear()},'Borrar'),
        h('button',{class:'btn sm ghost',onclick:()=>{ tracing=!tracing; setModel(tracing,false,false); refresh(); }},tracing?'Quitar guía':'Calcar'),
        h('button',{class:'btn primary',onclick:()=>{ revealed=true; tracing=false; setModel(true,true,true); refresh(); }},'Ver modelo'));
    } else {
      const same=n===total;
      status.innerHTML=''; status.append(h('span',{style:'color:'+(same?'var(--ok)':'var(--warn)')},`Tus trazos: ${n} · modelo: ${total}`), h('div',{class:'small muted'},'Compara la forma y el orden. Algunos kanji admiten variantes: sé honesto contigo.'));
      actions.append(h('button',{class:'btn sm ghost',onclick:()=>{ setModel(true,true,true); }},'Repetir animación'),
        h('button',{class:'btn warn',title:'Volverá a salir dentro de unos kanji',onclick:()=>grade(false)},'Necesito repetirlo'), h('button',{class:'btn primary',onclick:()=>grade(true)},'Lo escribí bien'));
    }
  }
  function grade(ok){
    S.hand=S.hand||{}; const r=S.hand[ch]||{n:0,ok:0,last:0}; r.n++; if(ok) r.ok++; r.last=now(); S.hand[ch]=r; S.settingsAt=now(); bump('hw');
    const first=!P.seen.has(ch); P.seen.add(ch);
    if(ok){ if(first) P.ok++; }
    else { P.again.push(ch); P.queue.splice(Math.min(P.queue.length,P.i+3+Math.floor(Math.random()*2)),0,ch); } // vuelve a salir tras 2 o 3 kanji más, hasta que lo escribas bien
    P.i++; renderPractica();
  }
  el.append(h('div',{class:'card stack',style:'align-items:center'}, info, h('div',{style:'width:100%;display:flex;justify-content:center'},box), status, actions));
  el.append(h('div',{class:'small muted',style:'text-align:center;margin-top:10px'},'Trazos: KanjiVG (CC BY-SA 3.0)'));
  refresh();
}
