// ===================== Revisión de contenido =====================
// Avisos de error de cualquier usuario y revisión por personas con permiso (p. ej. una profesora nativa).
let CAN_REVIEW=false, REVIEWED={};
try{ REVIEWED=JSON.parse(localStorage.getItem('dojo.reviewed')||'{}')||{}; }catch(e){ REVIEWED={}; }
const saveReviewedLocal=()=>{ try{ localStorage.setItem('dojo.reviewed',JSON.stringify(REVIEWED)); }catch(e){} };
const reportQueue=()=>{ try{ return JSON.parse(localStorage.getItem('dojo.reports')||'[]'); }catch(e){ return []; } };
const setReportQueue=q=>{ try{ localStorage.setItem('dojo.reports',JSON.stringify(q)); }catch(e){} };
async function flushReports(){
  const q=reportQueue(); if(!q.length||!sb||!USER) return;
  const left=[]; for (const r of q){ try{ const x=await sb.from('content_reports').insert({...r,reporter_email:USER.email||null}); if(x.error) throw x.error; }catch(e){ left.push(r); } }
  setReportQueue(left);
}
async function pullReviewed(){
  if(!sb||!USER) return;
  try{ const r=await sb.rpc('is_reviewer'); CAN_REVIEW=!r.error&&!!r.data; }catch(e){ CAN_REVIEW=false; }
  try{ const r=await sb.from('content_reviewed').select('key'); if(r.error) throw r.error; REVIEWED={}; for(const x of r.data||[]) REVIEWED[x.key]=1; saveReviewedLocal(); }catch(e){}
  flushReports();
}
async function setReviewed(key,on){
  if(on) REVIEWED[key]=1; else delete REVIEWED[key]; saveReviewedLocal();
  if(!sb||!USER) return;
  try{ const r=on?await sb.from('content_reviewed').upsert({key,reviewer_email:USER.email||null}):await sb.from('content_reviewed').delete().eq('key',key); if(r.error) throw r.error; }catch(e){ toast('No se pudo guardar la revisión'); }
}
function overlay(content){
  const veil=h('div',{style:'position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.3)',onclick:()=>close()});
  const box=h('div',{class:'card stack',style:'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:71;max-width:420px;width:calc(100% - 32px);max-height:80vh;overflow:auto'}, content);
  const close=()=>{ box.remove(); veil.remove(); };
  document.body.append(veil,box); return close;
}
function reportDialog(key,label){
  const com=h('textarea',{placeholder:'¿Qué está mal o suena raro?',style:'min-height:90px'});
  const sug=h('input',{type:'text',placeholder:'Cómo debería ser (opcional)'});
  let close; const send=h('button',{class:'btn primary',onclick:async()=>{
    const comment=com.value.trim(); if(!comment){ toast('Escribe qué falla'); return; }
    const row={key,label:label||null,comment,suggestion:sug.value.trim()||null};
    let ok=false; if(sb&&USER){ try{ const r=await sb.from('content_reports').insert({...row,reporter_email:USER.email||null}); if(r.error) throw r.error; ok=true; }catch(e){} }
    if(!ok){ const q=reportQueue(); q.push(row); setReportQueue(q); }
    close(); toast(ok?'Gracias: aviso enviado':'Guardado; se enviará cuando haya conexión');
  }},'Enviar');
  close=overlay([h('h3',{},'Señalar un error'), h('div',{class:'small muted jp'},label||key), com, sug, h('div',{class:'row'}, h('button',{class:'btn',onclick:()=>close()},'Cancelar'), h('span',{class:'sp'}), send)]);
}
const reportBtn=(key,label)=>h('button',{class:'btn sm ghost',title:'Avisar de un error en este contenido',onclick:e=>{ e.stopPropagation(); reportDialog(key,label); }},CAN_REVIEW?'Proponer corrección':'Señalar error');
// Botones de revisión para una ficha: aviso para todos; marcar como revisado solo para revisores
const reviewInline=(key,label)=>reviewRow(key,label,true);
function reviewRow(key,label,inline,onChange){
  const row=h('div',{class:'row small',style:'justify-content:center;align-items:center'+(inline?'':';margin-top:8px')});
  const draw=()=>{ row.innerHTML=''; if(REVIEWED[key]) row.append(h('span',{class:'badge soft',title:'Revisado por una persona nativa'},'Revisado ✓'));
    row.append(reportBtn(key,label));
    if(CAN_REVIEW) row.append(h('button',{class:'btn sm ghost',onclick:async()=>{ await setReviewed(key,!REVIEWED[key]); draw(); if(onChange) onChange(); }},REVIEWED[key]?'Quitar revisado':'Marcar revisado')); };
  draw(); return row;
}
// Texto de un ítem para el informe de correcciones
function itemSnapshot(key){
  const it=ITEMS.get(key); if(!it){ const rd=key.startsWith('r|')?READINGS.find(r=>r.id===key.slice(2)):null; return rd?`Lectura «${rd.title}»`:''; }
  if(it.kind==='g') return `${it.t} | ${it.s||''}\n  explicación: ${it.e||''}\n`+(it.ex||[]).map(x=>'  ej: '+x.j+' = '+x.s).join('\n');
  if(it.kind==='v') return `${it.w}（${it.r}）= ${it.m.join('; ')}\n  ej: ${it.ex||''} = ${it.es||''}`;
  return `${it.k} = ${it.m.join('; ')}  on: ${(it.on||[]).join('・')} kun: ${(it.kun||[]).join('・')}\n  mnemotecnia: ${it.mn||''}`;
}
function reviewCard(){
  const box=h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Revisión de contenido'));
  const list=h('div',{class:'list'}); let rows=[];
  const draw=()=>{
    list.innerHTML='';
    if(!rows.length){ list.append(h('div',{class:'small muted'},'No hay avisos pendientes.')); return; }
    rows.forEach(r=>{
      const it=ITEMS.get(r.key); const note=h('input',{type:'text',placeholder:'Nota (opcional)',style:'flex:1;min-width:0'});
      const set=async st=>{ try{ const u=await sb.from('content_reports').update({status:st,note:note.value.trim()||null,resolved_email:USER.email||null,resolved_at:new Date().toISOString()}).eq('id',r.id); if(u.error) throw u.error; rows=rows.filter(x=>x.id!==r.id); draw(); }catch(e){ toast('Error: '+e.message); } };
      list.append(h('div',{class:'item',style:'flex-direction:column;align-items:stretch;gap:6px'},
        h('div',{class:'row between'}, it?h('button',{class:'pill jp',onclick:()=>itemSheet(it)},r.label||r.key):h('b',{class:'jp'},r.label||r.key), h('span',{class:'small muted'},(r.reporter_email||'')+' · '+fmtDate(new Date(r.created_at).getTime()))),
        h('div',{},r.comment), r.suggestion?h('div',{class:'small'},'Propuesta: ',h('b',{},r.suggestion)):null,
        h('div',{class:'row'}, note, h('button',{class:'btn sm',onclick:()=>set('fixed')},'Corregido'), h('button',{class:'btn sm ghost',onclick:()=>set('ok')},'Está bien'))));
    });
  };
  const load=async()=>{ try{ const r=await sb.from('content_reports').select('*').eq('status','open').order('created_at'); if(r.error) throw r.error; rows=r.data||[]; draw(); }catch(e){ list.innerHTML=''; list.append(h('div',{class:'small muted'},'No se pudo leer: '+e.message+'. ¿Has ejecutado schema5.sql?')); } };
  const copy=h('button',{class:'btn sm',onclick:()=>{ const t=rows.map((r,i)=>`${i+1}. [${r.key}] ${r.label||''}\n  AVISO: ${r.comment}${r.suggestion?'\n  PROPUESTA: '+r.suggestion:''}\n  ACTUAL: ${itemSnapshot(r.key)}`).join('\n\n'); navigator.clipboard.writeText(t).then(()=>toast('Informe copiado')).catch(()=>toast('No se pudo copiar')); }},'Copiar informe');
  box.append(list, h('div',{class:'row'}, h('button',{class:'btn sm primary',onclick:()=>go('revision')},'Abrir la revisión por niveles'), copy, h('button',{class:'btn sm ghost',onclick:load},'Actualizar')));
  load(); return box;
}
