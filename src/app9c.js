// ===================== Vista de revisión (solo para revisores y administración) =====================
const REV_CATS=[['g','Gramática'],['v','Vocabulario'],['k','Kanji'],['r','Lecturas'],['x','Frases de examen']];
let REV={cat:'g',tier:'N5',pending:true,q:'',shown:40};
const plainJp=t=>String(t||'').replace(/\[([^\]|]*)\|[^\]|]*\|[^\]]*\]/g,'$1').replace(/\[([^\]|]+)\|[^\]]*\]/g,'$1');
function revRows(cat){
  const tier=lv=>tierOf(lv||1).n;
  if (cat==='g'||cat==='v'||cat==='k')
    return [...ITEMS.values()].filter(i=>i.kind===cat&&i.lv>=1&&i.lv<=53).map(it=>({key:keyOf(it),it,tier:tier(it.lv),lv:it.lv,
      label: cat==='g'?it.t:cat==='v'?it.w+'（'+it.r+'）':it.k,
      sub: cat==='g'?(it.s||''):(it.m||[]).join(', ')}));
  if (cat==='r') return READINGS.filter(r=>!r.user).map(r=>({key:'r|'+r.id,rd:r,tier:tier(r.lv),lv:r.lv,label:r.title,sub:r.sub||''}));
  return (typeof EXAM_SENTS!=='undefined'?EXAM_SENTS:[]).filter(x=>x.es).map(x=>({key:'x|'+x.j,sent:x,tier:tier(x.lv),lv:x.lv,label:x.j,sub:x.es}));
}
function revBody(row,onChange){
  const box=h('div',{class:'stack',style:'padding:6px 2px 2px'});
  if (row.it&&row.it.kind==='g'){ box.append(grammarSheet(row.it)); return box; }
  if (row.it&&row.it.kind==='v'){ const it=row.it; box.append(h('div',{class:'jp',style:'font-size:1.3rem'},it.w,' ',h('span',{class:'muted'},'（'+it.r+'）'),' ',spkBtn(it.w)), h('div',{},it.m.join(', ')), it.p?h('div',{class:'small muted'},posLabel(it.p)):null, it.ex?h('div',{class:'gs-ex'},h('div',{class:'t'},h('div',{class:'j',lang:'ja'},it.ex),h('div',{class:'es'},it.es||'')),spkBtn(it.ex)):null); }
  else if (row.it&&row.it.kind==='k'){ const it=row.it; box.append(h('div',{class:'big-jp',style:'font-size:2.4rem'},it.k), h('div',{},it.m.join(', ')), h('div',{class:'small jp'},'On: '+((it.on||[]).join('・')||'—')+' · Kun: '+((it.kun||[]).join('・')||'—')), it.mn?h('div',{class:'small'},it.mn):null); }
  else if (row.rd){ const r=row.rd; box.append(h('div',{class:'jp',style:'line-height:1.9;white-space:pre-wrap'},plainJp(r.t)), r.es?h('div',{class:'small muted',style:'white-space:pre-wrap'},r.es):null, (r.q||[]).length?h('details',{class:'gs-more'},h('summary',{},`Preguntas (${r.q.length})`),...r.q.map(q=>h('div',{class:'small',style:'margin-top:6px'},h('div',{class:'jp'},q.q),h('div',{class:'muted'},q.o.map((o,i)=>(i===q.a?'✓ ':'· ')+o).join('  ')))) ):null); }
  else if (row.sent){ box.append(h('div',{class:'jp',style:'font-size:1.15rem;line-height:1.7'},row.sent.j,' ',spkBtn(row.sent.j)), h('div',{class:'muted'},row.sent.es)); }
  box.append(reviewRow(row.key,row.label,true,onChange));
  return box;
}
function renderRevision(){
  const el=$('#main');
  if (!(CAN_REVIEW||IS_ADMIN)){ el.append(h('div',{class:'card'},'Esta sección es solo para revisores.')); return; }
  el.append(h('div',{class:'topline'}, h('h1',{},'Revisión'), h('span',{class:'small muted'},'Contenido a revisar por una persona nativa')));
  const head=h('div',{class:'card stack'}); const list=h('div',{class:'stack',style:'margin-top:12px;gap:8px'}); const more=h('div',{style:'text-align:center;margin-top:8px'});
  el.append(head,list,more);
  // resumen global (cuántos ítems están revisados)
  const summary=()=>{
    const wrap=h('div',{class:'stack',style:'gap:6px'});
    for (const [c,l] of REV_CATS){ const rows=revRows(c); const done=rows.filter(r=>REVIEWED[r.key]).length; const pct=rows.length?Math.round(100*done/rows.length):0; wrap.append(h('div',{}, h('div',{class:'row between small'},h('span',{},l),h('span',{class:'num muted'},`${done} / ${rows.length}`)), h('div',{class:'bar'},h('i',{style:'width:'+pct+'%'})))); }
    return wrap;
  };
  const catSel=h('div',{class:'row',style:'gap:6px;flex-wrap:wrap'}, REV_CATS.map(([c,l])=>h('button',{class:'btn sm'+(REV.cat===c?' primary':' ghost'),onclick:()=>{ REV.cat=c; REV.shown=40; draw(); }},l)));
  const tierSel=h('select',{onchange:e=>{ REV.tier=e.target.value; REV.shown=40; drawList(); }}, ['Todos',...TIERS.map(t=>t.n)].map(t=>h('option',{value:t,selected:t===REV.tier},t)));
  const pend=h('label',{class:'row small',style:'align-items:center;gap:6px'}, h('input',{type:'checkbox',checked:REV.pending,onchange:e=>{ REV.pending=e.target.checked; REV.shown=40; drawList(); }}),'Solo pendientes');
  const q=h('input',{type:'search',placeholder:'Buscar…',value:REV.q,style:'flex:1;min-width:120px',oninput:e=>{ REV.q=e.target.value; REV.shown=40; drawList(); }});
  const counter=h('div',{class:'small muted'});
  head.append(h('details',{class:'gs-more'},h('summary',{},'Progreso de la revisión'),summary()), catSel, h('div',{class:'row',style:'gap:10px;align-items:center'},tierSel,pend,q), counter);
  let rows=[];
  function drawList(){
    const norm=s=>String(s||'').toLowerCase(); const qq=norm(REV.q);
    const vis=rows.filter(r=>(REV.tier==='Todos'||r.tier===REV.tier)&&(!REV.pending||!REVIEWED[r.key])&&(!qq||norm(r.label).includes(qq)||norm(r.sub).includes(qq)));
    const all=rows.filter(r=>REV.tier==='Todos'||r.tier===REV.tier); const done=all.filter(r=>REVIEWED[r.key]).length;
    counter.textContent=`${done} de ${all.length} revisados en este filtro · mostrando ${Math.min(REV.shown,vis.length)} de ${vis.length}`;
    list.innerHTML=''; more.innerHTML='';
    vis.slice(0,REV.shown).forEach(r=>{
      const badge=h('span',{class:'badge '+(REVIEWED[r.key]?'ok':'soft')},REVIEWED[r.key]?'Revisado ✓':'Pendiente');
      const onChange=()=>{ badge.className='badge '+(REVIEWED[r.key]?'ok':'soft'); badge.textContent=REVIEWED[r.key]?'Revisado ✓':'Pendiente'; };
      const det=h('details',{class:'sec'}, h('summary',{style:'gap:8px'}, h('span',{class:'jp',style:'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis'},r.label), badge));
      let built=false; det.addEventListener('toggle',()=>{ if(det.open&&!built){ built=true; det.append(revBody(r,onChange)); } });
      list.append(det);
    });
    if (vis.length>REV.shown) more.append(h('button',{class:'btn',onclick:()=>{ REV.shown+=40; drawList(); }},'Mostrar más'));
    if (!vis.length) list.append(h('div',{class:'small muted'},REV.pending?'No quedan pendientes con este filtro.':'Sin resultados.'));
  }
  function draw(){ rows=revRows(REV.cat); [...catSel.children].forEach((b,i)=>{ b.className='btn sm'+(REV_CATS[i][0]===REV.cat?' primary':' ghost'); }); if(REV.cat==='g') loadExt(); drawList(); }
  draw();
}
