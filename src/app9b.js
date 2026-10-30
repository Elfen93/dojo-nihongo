// ===================== Revisión de contenido =====================
// Avisos de error de cualquier usuario y revisión por personas con permiso (p. ej. una profesora nativa).
let CAN_REVIEW=false, REVIEWED={};
// Idioma de la parte de revisión: la persona nativa puede verla en japonés
const REV_TR={
 'Señalar un error':'誤りの報告','¿Qué está mal o suena raro?':'何が間違い、または不自然ですか？','Cómo debería ser (opcional)':'正しい表現（任意）','Cancelar':'キャンセル','Enviar':'送信',
 'Escribe qué falla':'内容を書いてください','Gracias: aviso enviado':'ありがとうございます。送信しました','Guardado; se enviará cuando haya conexión':'保存しました。接続後に送信されます',
 'Señalar error':'誤りを報告','Proponer corrección':'修正を提案','Revisado ✓':'確認済み ✓','Pendiente':'未確認','Marcar revisado':'確認済みにする','Quitar revisado':'確認済みを取り消す',
 'Revisión':'校閲','Contenido a revisar por una persona nativa':'ネイティブによる内容確認','Gramática':'文法','Vocabulario':'語彙','Kanji':'漢字','Lecturas':'読解','Frases de examen':'試験の例文',
 'Todos':'すべて','Solo pendientes':'未確認のみ','Buscar…':'検索…','Progreso de la revisión':'確認の進み具合','Mostrar más':'もっと見る',
 'No quedan pendientes con este filtro.':'この条件では未確認はありません。','Sin resultados.':'該当なし。','Esta sección es solo para revisores.':'このページは校閲担当者専用です。',
 'Preguntas ({n})':'問題（{n}）','{done} de {total} revisados en este filtro · mostrando {shown} de {vis}':'{done}/{total} 確認済み・{vis}件中{shown}件を表示',
 'Las explicaciones están escritas en español para estudiantes hispanohablantes. Lo más importante es que revises que el japonés (frases, lecturas, vocabulario) sea correcto y natural.':'説明文はスペイン語話者向けにスペイン語で書かれています。特に、日本語（例文・読み・語彙）が正しく自然かどうかをご確認ください。誤りや不自然な点は「修正を提案」から、問題がなければ「確認済みにする」を押してください。',
 'Cómo se usa':'使い方・意味','Ojo':'注意','Ejemplos':'例文','Mostrar todo el furigana':'ふりがなを全部表示','Ocultar furigana':'ふりがなを隠す','Ver {n} más':'さらに{n}件','Compáralo con otros puntos ({n})':'似た文法との比較（{n}）',
 'Parecido':'類似','Opuesto':'反対','Relacionado':'関連','Toca una palabra con kanji para ver su lectura':'漢字の語をタップすると読みが表示されます',
 'Revisión de contenido':'内容の校閲','No hay avisos pendientes.':'未対応の報告はありません。','Propuesta: ':'提案：','Nota (opcional)':'メモ（任意）','Corregido':'修正済み','Está bien':'問題なし',
 'Expresión':'表現','Partícula':'助詞','Verbo':'動詞','Adjetivo':'形容詞','Sustantivo':'名詞','Adverbio':'副詞','Conjunción':'接続','Construcción':'構文','Auxiliar':'助動詞','Forma verbal':'動詞の形','Cuantificador':'数量',
 'Neutro':'普通','Formal':'丁寧・改まった','Informal':'くだけた','Coloquial':'口語','Escrito':'書き言葉','Honorífico':'尊敬','Humilde':'謙譲','Neutro / formal':'普通／丁寧','Informal / coloquial':'くだけた／口語',
 'Abrir la revisión por niveles':'レベル別の校閲を開く','Copiar informe':'報告をコピー','Actualizar':'更新','Aviso':'報告',
};
function revLang(){ try{ const v=localStorage.getItem('dojo.revLang'); if(v) return v; }catch(e){} return (CAN_REVIEW&&!IS_ADMIN)?'ja':'es'; }
function setRevLang(l){ try{ localStorage.setItem('dojo.revLang',l); }catch(e){} }
function tr(s,vars){ let t=(revLang()==='ja'&&REV_TR[s])||s; if(vars) for(const [k,v] of Object.entries(vars)) t=t.replace('{'+k+'}',v); return t; }

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
  const com=h('textarea',{placeholder:tr('¿Qué está mal o suena raro?'),style:'min-height:90px'});
  const sug=h('input',{type:'text',placeholder:tr('Cómo debería ser (opcional)')});
  let close; const send=h('button',{class:'btn primary',onclick:async()=>{
    const comment=com.value.trim(); if(!comment){ toast(tr('Escribe qué falla')); return; }
    const row={key,label:label||null,comment,suggestion:sug.value.trim()||null};
    let ok=false; if(sb&&USER){ try{ const r=await sb.from('content_reports').insert({...row,reporter_email:USER.email||null}); if(r.error) throw r.error; ok=true; }catch(e){} }
    if(!ok){ const q=reportQueue(); q.push(row); setReportQueue(q); }
    close(); toast(ok?tr('Gracias: aviso enviado'):tr('Guardado; se enviará cuando haya conexión'));
  }},tr('Enviar'));
  close=overlay([h('h3',{},tr('Señalar un error')), h('div',{class:'small muted jp'},label||key), com, sug, h('div',{class:'row'}, h('button',{class:'btn',onclick:()=>close()},tr('Cancelar')), h('span',{class:'sp'}), send)]);
}
const reportBtn=(key,label)=>h('button',{class:'btn sm ghost',title:'Avisar de un error en este contenido',onclick:e=>{ e.stopPropagation(); reportDialog(key,label); }},CAN_REVIEW?tr('Proponer corrección'):tr('Señalar error'));
// Botones de revisión para una ficha: aviso para todos; marcar como revisado solo para revisores
const reviewInline=(key,label)=>reviewRow(key,label,true);
function reviewRow(key,label,inline,onChange){
  const row=h('div',{class:'row small',style:'justify-content:center;align-items:center'+(inline?'':';margin-top:8px')});
  const draw=()=>{ row.innerHTML=''; if(REVIEWED[key]) row.append(h('span',{class:'badge soft',title:'Revisado por una persona nativa'},tr('Revisado ✓')));
    row.append(reportBtn(key,label));
    if(CAN_REVIEW) row.append(h('button',{class:'btn sm ghost',onclick:async()=>{ await setReviewed(key,!REVIEWED[key]); draw(); if(onChange) onChange(); }},REVIEWED[key]?tr('Quitar revisado'):tr('Marcar revisado'))); };
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
  const box=h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},tr('Revisión de contenido')));
  const list=h('div',{class:'list'}); let rows=[];
  const draw=()=>{
    list.innerHTML='';
    if(!rows.length){ list.append(h('div',{class:'small muted'},tr('No hay avisos pendientes.'))); return; }
    rows.forEach(r=>{
      const it=ITEMS.get(r.key); const note=h('input',{type:'text',placeholder:tr('Nota (opcional)'),style:'flex:1;min-width:0'});
      const set=async st=>{ try{ const u=await sb.from('content_reports').update({status:st,note:note.value.trim()||null,resolved_email:USER.email||null,resolved_at:new Date().toISOString()}).eq('id',r.id); if(u.error) throw u.error; rows=rows.filter(x=>x.id!==r.id); draw(); }catch(e){ toast('Error: '+e.message); } };
      list.append(h('div',{class:'item',style:'flex-direction:column;align-items:stretch;gap:6px'},
        h('div',{class:'row between'}, it?h('button',{class:'pill jp',onclick:()=>itemSheet(it)},r.label||r.key):h('b',{class:'jp'},r.label||r.key), h('span',{class:'small muted'},(r.reporter_email||'')+' · '+fmtDate(new Date(r.created_at).getTime()))),
        h('div',{},r.comment), r.suggestion?h('div',{class:'small'},tr('Propuesta: '),h('b',{},r.suggestion)):null,
        h('div',{class:'row'}, note, h('button',{class:'btn sm',onclick:()=>set('fixed')},tr('Corregido')), h('button',{class:'btn sm ghost',onclick:()=>set('ok')},tr('Está bien')))));
    });
  };
  const load=async()=>{ try{ const r=await sb.from('content_reports').select('*').eq('status','open').order('created_at'); if(r.error) throw r.error; rows=r.data||[]; draw(); }catch(e){ list.innerHTML=''; list.append(h('div',{class:'small muted'},'No se pudo leer: '+e.message+'. ¿Has ejecutado schema5.sql?')); } };
  const copy=h('button',{class:'btn sm',onclick:()=>{ const t=rows.map((r,i)=>`${i+1}. [${r.key}] ${r.label||''}\n  AVISO: ${r.comment}${r.suggestion?'\n  PROPUESTA: '+r.suggestion:''}\n  ACTUAL: ${itemSnapshot(r.key)}`).join('\n\n'); navigator.clipboard.writeText(t).then(()=>toast('Informe copiado')).catch(()=>toast('No se pudo copiar')); }},tr('Copiar informe'));
  box.append(list, h('div',{class:'row'}, h('button',{class:'btn sm primary',onclick:()=>go('revision')},tr('Abrir la revisión por niveles')), copy, h('button',{class:'btn sm ghost',onclick:load},tr('Actualizar'))));
  load(); return box;
}
