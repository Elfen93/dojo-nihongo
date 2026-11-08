// ===================== Piezas (componentes) de cada kanji =====================
// Cada kanji se muestra como «Partes: 亻 persona + 氏 …»; tocar una pieza lista los kanji de la app que la usan. Datos: data/components.js
const kanjiParts=ch=>(typeof KPARTS!=='undefined'&&KPARTS[ch])||[];
function partsRow(ch,opts={}){
  const ps=kanjiParts(ch); if(!ps.length||ps.every(x=>'一丨丿丶乙亅'.includes(x))) return null; // sin partes, o solo rayas sueltas: no aporta nada
  const items=[]; ps.forEach((p,i)=>{ if(i) items.push(h('span',{class:'muted'},'+')); const nm=((typeof KCOMP!=='undefined'&&KCOMP[p])||{}).n||'';
    items.push(h('button',{class:'kpart',title:'Ver los kanji que usan esta pieza',onclick:e=>{ e.stopPropagation(); showPieceSheet(p); }}, h('span',{class:'jp kp-c'},p), nm?h('span',{class:'kp-n'},nm):null)); });
  return h('div',{class:'kparts'}, opts.label===false?null:h('b',{class:'small'},'Partes ·'), ...items);
}
function showPieceSheet(p){
  document.querySelectorAll('.piece-bg,.piece-sheet').forEach(x=>x.remove());
  const c=(typeof KCOMP!=='undefined'&&KCOMP[p])||{}; const ks=Object.keys(typeof KPARTS!=='undefined'?KPARTS:{}).filter(k=>KPARTS[k].includes(p)).map(k=>ITEMS.get('k|'+k)).filter(Boolean);
  const close=()=>{ bg.remove(); box.remove(); };
  const bg=h('div',{class:'piece-bg',onclick:close});
  const box=h('div',{class:'card piece-sheet stack'}, h('div',{class:'big-jp',style:'text-align:center'},p), h('div',{style:'text-align:center;font-weight:600'},c.n||'pieza'), c.t?h('div',{class:'small muted',style:'text-align:center'},c.t):null,
    ks.length?h('div',{class:'small muted'},`Kanji con esta pieza (${ks.length}):`):null,
    h('div',{class:'hw-picks'}, ks.map(it=>h('button',{class:'btn hw-pick',title:(it.m||[]).join(', '),onclick:()=>{ close(); itemSheet(it); }},it.k))),
    h('div',{class:'row',style:'justify-content:center'}, h('button',{class:'btn',onclick:close},'Cerrar')));
  document.body.append(bg,box);
}
