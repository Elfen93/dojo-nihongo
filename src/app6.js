// ===================== Ajustes, importación y sincronización =====================
function renderAjustes(){
  const el=$('#main'); const st=S.settings;
  el.append(h('div',{class:'topline'}, h('h1',{},'Ajustes'), h('span',{class:'small muted',id:'synclabel2'},syncLabel)));
  const f=(label,input,help)=>h('div',{class:'field'}, h('label',{for:input.id},label), input, help?h('div',{class:'small muted'},help):null);
  const name=h('input',{id:'s-name',type:'text',value:st.name||'',placeholder:'Tu nombre'});
  const target=h('input',{id:'s-target',type:'date',value:st.target||''});
  const tier=h('select',{id:'s-tier'}, ['N4','N3','N2','N1'].map(t=>h('option',{value:t,selected:st.targetTier===t},t)));
  const goal=h('input',{id:'s-goal',type:'number',min:0,max:60,value:st.goalLessons});
  const maxr=h('input',{id:'s-maxr',type:'number',min:10,max:500,value:st.maxReviews||100});
  const strict=h('input',{id:'s-strict',type:'checkbox',checked:!!st.strict});
  const furi=h('input',{id:'s-furi',type:'checkbox',checked:!!st.furigana});
  const saveBtn=h('button',{class:'btn primary',onclick:()=>{ st.name=name.value.trim(); st.target=target.value; st.targetTier=tier.value; st.goalLessons=Math.max(0,+goal.value||0); st.maxReviews=Math.max(10,+maxr.value||100); st.strict=strict.checked; st.furigana=furi.checked; save(); toast('Ajustes guardados'); renderNav(); }},'Guardar ajustes');
  el.append(accountCard());
  el.append(h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Plan de estudio'),
    h('div',{class:'grid c2'}, f('Nombre',name), f('Fecha objetivo (examen JLPT)',target,'El JLPT se celebra el primer domingo de julio y de diciembre.'), f('Nivel objetivo para esa fecha',tier), f('Lecciones nuevas por día',goal,'10/día = N4 completo en unas 7 semanas desde cero.'), f('Máximo de repasos por sesión',maxr)),
    h('div',{class:'row'}, h('label',{class:'row small'},strict,' Modo estricto: para subir de nivel, el 75 % de los kanji deben estar en Gurú'), ), h('div',{class:'row'}, h('label',{class:'row small'},furi,' Mostrar furigana por defecto en las lecturas')),
    saveBtn));
  // Sincronización WaniKani / Bunpro (directa)
  const wk=h('input',{id:'s-wk',type:'password',value:st.wkToken||'',placeholder:'Token de API v2 de WaniKani',autocomplete:'off'});
  const bp=h('input',{id:'s-bp',type:'password',value:st.bpKey||'',placeholder:'Clave de API de Bunpro',autocomplete:'off'});
  const syncStatus=h('div',{class:'small muted'}, S.sync&&S.sync.date? `Última sincronización: ${fmtDate(S.sync.date)} · WaniKani nivel ${S.sync.wkLevel||'—'} · ${S.sync.wkMatched||0} ítems alineados · Bunpro ${S.sync.bpMatched||0} puntos alineados` : 'Sin sincronizar todavía.');
  el.append(h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'WaniKani y Bunpro'),
    h('p',{class:'small',style:'margin:0'},'Guarda tus claves (solo en tu cuenta) y pulsa sincronizar. Lo que tengas en Gurú o superior en WaniKani entra con ese nivel SRS; los puntos de Bunpro que dominas se marcan como aprendidos. Puedes repetirlo cuando quieras: nunca baja lo que ya tienes aquí.'),
    h('div',{class:'grid c2'}, f('WaniKani',wk,'wanikani.com → Settings → API Tokens (lectura)'), f('Bunpro',bp,'bunpro.jp → Settings → API')),
    h('div',{class:'row'}, h('button',{class:'btn primary',onclick:async()=>{ st.wkToken=wk.value.trim(); st.bpKey=bp.value.trim(); save(); syncStatus.textContent='Sincronizando…'; try{ await syncExternal(); }catch(e){ syncStatus.textContent='Error: '+e.message; } }},'Guardar y sincronizar ahora'), h('span',{class:'sp'})),
    syncStatus));
  // Notificaciones
  const pushBox=h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Notificaciones'), h('p',{class:'small',style:'margin:0'},'La app te avisa cuando se acumulan repasos, cuando vence el examen semanal y si a última hora del día no has estudiado. En iPhone hace falta tener la app añadida a la pantalla de inicio.'));
  const pstatus=h('div',{class:'small muted'},'Comprobando…'); const prow=h('div',{class:'row'}); pushBox.append(pstatus,prow); el.append(pushBox);
  pushStatus().then(stt=>{ pstatus.textContent={unsupported:'Este navegador no admite notificaciones push.',denied:'Has bloqueado las notificaciones en el navegador; actívalas en los ajustes del sitio.',on:'Activadas en este dispositivo.',off:'Desactivadas en este dispositivo.'}[stt]; if(stt==='on') prow.append(h('button',{class:'btn sm',onclick:()=>disablePush().then(()=>renderAjustes2())},'Desactivar aquí')); if(stt==='off') prow.append(h('button',{class:'btn primary',onclick:()=>enablePush().then(()=>renderAjustes2())},'Activar notificaciones')); });
  // Copia de seguridad
  const ta=h('textarea',{id:'s-backup',placeholder:'Pega aquí una copia de seguridad para restaurarla'});
  el.append(h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Copia de seguridad'),
    h('div',{class:'row'}, h('button',{class:'btn',onclick:exportBackup},'Descargar copia (.json)'), h('button',{class:'btn',onclick:()=>{ navigator.clipboard.writeText(JSON.stringify(S)).then(()=>toast('Copiado al portapapeles')).catch(()=>{ ta.value=JSON.stringify(S); ta.select(); toast('Selecciona y copia el texto'); }); }},'Copiar al portapapeles'), h('span',{class:'sp'}), h('button',{class:'btn warn sm',onclick:()=>confirmBox('Esto borra TODO tu progreso en este dispositivo y en tu cuenta. ¿Seguro?',()=>{ S=DEFAULT_STATE(); save(); go('hoy'); toast('Progreso borrado'); })},'Borrar progreso')),
    f('Restaurar',ta), h('button',{class:'btn',onclick:()=>{ try{ const o=JSON.parse(ta.value); if(!o.items) throw 0; S={...DEFAULT_STATE(),...o,settings:{...DEFAULT_STATE().settings,...(o.settings||{})}}; save(); toast('Copia restaurada'); go('hoy'); }catch(e){ toast('JSON no válido'); } }},'Restaurar desde el texto')));
  el.append(h('div',{class:'card',style:'margin-top:12px'}, h('h3',{},'Cómo funciona'), h('ul',{class:'small',style:'padding-left:18px;margin:8px 0 0'},
    h('li',{},'SRS con 9 etapas (4 h → 8 h → 1 d → 2 d → 1 sem → 2 sem → 1 mes → 4 meses → quemado). Fallar baja una etapa (dos si estabas en Gurú o más).'),
    h('li',{},'El vocabulario se pregunta en tres direcciones; la de español → japonés con elección del kanji es la que entrena tu punto débil.'),
    h('li',{},'Examen semanal obligatorio: si pasa más de un día de la fecha, se bloquean las lecciones. Examen de nivel al 80 % para subir. Los fallos de examen vuelven a la cola de repasos al momento.'),
    h('li',{},'Las lecciones se bloquean con más de 150 repasos pendientes: primero vaciar, luego aprender.'),
    h('li',{},'N5 y N4 van incluidos. N3, N2 y N1 se generan nivel a nivel con Claude cuando llegas a ellos.'))));
}
async function exportBackup(){
  const data=JSON.stringify(S,null,0);
  try{ const blob=new Blob([data],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='dojo-backup-'+todayKey()+'.json'; document.body.append(a); a.click(); a.remove(); toast('Copia descargada'); return; }catch(e){}
  try{ await navigator.clipboard.writeText(data); toast('No se pudo descargar; copiado al portapapeles'); }catch(e){ const ta=$('#s-backup'); if(ta){ ta.value=data; ta.select(); } toast('Copia el texto del cuadro de abajo'); }
}
// Mapea etapas de WaniKani (0-9) a las nuestras (misma escala)
function importSync(text){
  let o; try{ o=JSON.parse(text); }catch(e){ toast('JSON no válido'); return; }
  let wkMatched=0, bpMatched=0;
  if (o.wanikani && Array.isArray(o.wanikani.items)){
    for (const it of o.wanikani.items){ // {type:'kanji'|'vocabulary', chars, srs, meanings:[], readings:[]}
      if (!it.srs) continue;
      const keys=[]; if (it.type==='kanji') keys.push('k|'+it.chars); else if (it.type==='vocabulary'){ for (const v of VOCAB_BY_WORD[it.chars]||[]) keys.push('v|'+v.w+'|'+v.r); }
      for (const k of keys){ if(!ITEMS.has(k)) continue; const cur=S.items[k]; const s=Math.max(1,Math.min(9,it.srs)); if(!cur||cur.s<s){ S.items[k]={...(cur||{c:0,w:0}), s, due: s>=9?Infinity:now()+STAGE_HOURS[s]*H*Math.random(), lrn:cur&&cur.lrn||now(), ls:now()}; wkMatched++; } }
    }
    S.sync.wkLevel=o.wanikani.level;
  }
  if (o.bunpro && Array.isArray(o.bunpro.items)){
    const norm=s=>String(s||'').replace(/[〜～\s()（）・]/g,'').toLowerCase();
    for (const it of o.bunpro.items){ // {title, srs (0-12 Bunpro), learned}
      const t=norm(it.title); if(!t) continue;
      const g=GRAMMAR_ALL.find(x=>norm(x.bp)===t||norm(x.t)===t||norm(x.t).includes(t)||t.includes(norm(x.bp)));
      if (!g) continue; const k='g|'+g.id; const s=Math.max(1,Math.min(9,Math.round((it.srs||1)*9/12))); const cur=S.items[k]; if(!cur||cur.s<s){ S.items[k]={...(cur||{c:0,w:0}), s, due:s>=9?Infinity:now()+STAGE_HOURS[s]*H*Math.random(), lrn:now(), ls:now()}; bpMatched++; }
    }
  }
  S.sync={...S.sync,date:now(),wkMatched,bpMatched};
  // sube el nivel si todo lo de los niveles inferiores ya está aprendido
  while (S.level<13 && itemsOfLevel(S.level).length && itemsOfLevel(S.level).every(it=>S.items[keyOf(it)]&&S.items[keyOf(it)].s>=5)) { S.levelPass[S.level]=S.levelPass[S.level]||'sync'; S.level++; }
  save(); toast(`Sincronizado: ${wkMatched} de WaniKani, ${bpMatched} de Bunpro`); render();
}

// ===================== Generación de niveles N3–N1 =====================
function generationPrompt(lv){
  const tier=tierOf(lv); const ks=(ROADMAP[tier.n].kanjiByLevel||{})[lv]||[]; const gs=(ROADMAP[tier.n].grammarByLevel||{})[lv]||[];
  return `Eres un profesor de japonés. Genera el contenido del nivel ${lv} (JLPT ${tier.n}) de una app de estudio para un hispanohablante. Responde SOLO con JSON válido, sin texto alrededor, con esta forma exacta:
{"lv":${lv},"kanji":[{"k":"漢","m":["significado1","significado2"],"on":["カン"],"kun":["から"],"mn":"mnemotecnia breve en español que relacione los componentes con el significado"}],
 "vocab":[{"w":"漢字","r":"かんじ","m":["kanji"],"p":"n","ex":"frase de ejemplo natural y corta en japonés","es":"traducción al español"}],
 "grammar":[{"id":"identificador-ascii","t":"〜ばかりか","s":"estructura","e":"explicación clara en español de 2 a 4 frases, con matices de uso y registro","ex":[{"j":"frase con la parte gramatical entre corchetes [así]","s":"traducción","h":"pista opcional: verbo base o forma","k":"lectura en kana de la parte entre corchetes"}]}]}
Reglas: los significados ("m") en español, cortos, sin artículos. Las lecturas on en katakana y las kun en hiragana (sin puntos). Para cada kanji incluye exactamente 2 palabras de vocabulario frecuentes y de nivel ${tier.n} que lo contengan (campo "w"), con "p" entre: n, v5, v1, vk, adj-i, adj-na, adv, n-vs, exp. Para cada punto gramatical incluye 3 ejemplos; la parte entre corchetes debe ser exactamente lo que el estudiante escribirá, y "k" su lectura en hiragana. Usa vocabulario de nivel ${tier.n} o inferior en los ejemplos.
Kanji del nivel (carácter, lecturas de referencia, significado en inglés): ${ks.map(k=>k.k+' ('+(k.on||[]).join('/')+'; '+(k.kun||[]).join('/')+'; '+(k.en||[]).join(', ')+')').join(' | ')}
Puntos gramaticales del nivel: ${gs.join(' | ')}`;
}
function validateGen(o, lv){
  if (!o||typeof o!=='object') return 'no es un objeto';
  const ks=Array.isArray(o.kanji)?o.kanji.filter(k=>k&&typeof k.k==='string'&&k.k.length===1&&Array.isArray(k.m)&&k.m.length):[];
  const vs=Array.isArray(o.vocab)?o.vocab.filter(v=>v&&v.w&&v.r&&Array.isArray(v.m)&&v.m.length):[];
  const gs=Array.isArray(o.grammar)?o.grammar.filter(g=>g&&g.t&&Array.isArray(g.ex)&&g.ex.some(e=>e&&/\[[^\]]+\]/.test(e.j||''))).map(g=>({...g,id:(g.id||g.t).toString().replace(/[^\w\-一-龯ぁ-んァ-ン〜]/g,'')+'-'+lv,ex:g.ex.filter(e=>e&&/\[[^\]]+\]/.test(e.j||''))})):[];
  if (!ks.length&&!gs.length) return 'sin kanji ni gramática válidos';
  return {lv, kanji:ks.map(k=>({k:k.k,m:k.m,on:k.on||[],kun:k.kun||[],mn:k.mn||''})), vocab:vs.map(v=>({w:v.w,r:v.r,m:v.m,p:v.p||'n',ex:v.ex||'',es:v.es||''})), grammar:gs.map(g=>({id:g.id,t:g.t,s:g.s||'',e:g.e||'',ex:g.ex.map(e=>({j:e.j,s:e.s||'',h:e.h||'',k:e.k||''}))})), generated:now()};
}
function generatePanel(lv){
  const tier=tierOf(lv); const ks=(ROADMAP[tier.n].kanjiByLevel||{})[lv]||[]; const gs=(ROADMAP[tier.n].grammarByLevel||{})[lv]||[];
  const status=h('div',{class:'small muted'});
  const ta=h('textarea',{id:'gen-paste',placeholder:'Pega aquí el JSON generado'});
  const box=h('div',{class:'card stack'},
    h('h3',{},`Generar el nivel ${lv} (${tier.n})`),
    h('p',{class:'small',style:'margin:0'},`Este nivel tiene ${ks.length} kanji y ${gs.length} puntos gramaticales previstos. El contenido completo (significados en español, mnemotecnias, vocabulario con ejemplos, explicaciones y frases con hueco) se genera con Claude y se guarda en tu cuenta.`),
    h('div',{class:'row'}, ks.map(k=>h('span',{class:'pill k jp',style:'font-size:1.1rem'},k.k))),
    h('div',{class:'row'}, gs.map(g=>h('span',{class:'pill g jp'},g))),
    h('div',{class:'row'}, h('button',{class:'btn primary',id:'gen-btn',onclick:()=>generateWithClaude(lv,status)},'Generar con Claude'), h('button',{class:'btn',onclick:()=>{ navigator.clipboard.writeText(generationPrompt(lv)).then(()=>toast('Prompt copiado: pégalo en Claude y trae el JSON')).catch(()=>{ ta.value=generationPrompt(lv); ta.select(); toast('Copia el texto del cuadro'); }); }},'Copiar prompt para hacerlo a mano')),
    status,
    h('details',{}, h('summary',{class:'small'},'Pegar JSON generado a mano'), h('div',{class:'field',style:'margin-top:8px'}, ta, h('button',{class:'btn',onclick:()=>{ try{ const o=JSON.parse(ta.value); const v=validateGen(o,lv); if(typeof v==='string') throw new Error(v); saveGen(lv,v).then(()=>{toast('Nivel generado y guardado'); render();}); }catch(e){ toast('JSON no válido: '+e.message); } }},'Importar este nivel'))));
  return box;
}
async function generateWithClaude(lv, status){
  const btn=$('#gen-btn'); if(btn) btn.disabled=true;
  if (!sb||!USER){ status.textContent='Inicia sesión para generar niveles automáticamente, o usa "Copiar prompt" y pega el JSON.'; if(btn) btn.disabled=false; return; }
  try{
    status.textContent='Generando el nivel con Claude (puede tardar un minuto)…';
    const res=await callFunction('generate',{lv, prompt:generationPrompt(lv)});
    const v=validateGen(res, lv); if (typeof v==='string') throw new Error(v);
    await saveGen(lv, v); status.textContent='Listo.'; toast(`Nivel ${lv} generado: ${v.kanji.length} kanji, ${v.vocab.length} palabras, ${v.grammar.length} puntos`); render();
  }catch(e){ console.warn(e); status.textContent='No se pudo generar: '+(e&&e.message||'error')+'. Prueba otra vez o usa el prompt manual.'; if(btn) btn.disabled=false; }
}
function accountCard(){
  if (!CONFIG.SUPABASE_URL) return h('div',{class:'push'},'La cuenta no está configurada todavía (falta config.js). El progreso se guarda solo en este navegador.');
  if (USER) return h('div',{class:'card stack'}, h('h3',{},'Cuenta'), h('div',{class:'row'}, h('span',{},'Sesión iniciada como ', h('b',{},USER.email||USER.id)), h('span',{class:'sp'}), h('button',{class:'btn sm',onclick:signOut},'Cerrar sesión')), h('div',{class:'small muted',id:'synclabel2'},syncLabel));
  const email=h('input',{id:'s-email',type:'email',placeholder:'tu@correo.com',autocomplete:'email'});
  return h('div',{class:'card stack'}, h('h3',{},'Inicia sesión para guardar tu progreso en todos tus dispositivos'),
    h('div',{class:'row'}, email, h('button',{class:'btn primary',onclick:()=>{ if(email.value.includes('@')) signInEmail(email.value.trim()); }},'Enviar enlace de acceso')),
    CONFIG.GOOGLE_LOGIN ? h('div',{class:'row'}, h('button',{class:'btn',onclick:signInGoogle},'Entrar con Google')) : null,
    h('div',{class:'small muted'},'Sin sesión, el progreso se queda en este navegador. Al iniciar sesión se fusiona con lo que tengas en la cuenta (gana lo más reciente).'));
}
// ===================== Sincronización directa con WaniKani y Bunpro =====================
async function wkFetchAll(url, token){
  let all=[]; while(url){ const r=await fetch(url,{headers:{Authorization:'Bearer '+token,'Wanikani-Revision':'20170710'}}); if(!r.ok) throw new Error('WaniKani '+r.status); const j=await r.json(); if(Array.isArray(j.data)){ all=all.concat(j.data); url=j.pages&&j.pages.next_url; } else return j; } return all;
}
async function syncExternal(){
  const st=S.settings; const payload={};
  if (st.wkToken){
    toast('Leyendo WaniKani…');
    const user=await wkFetchAll('https://api.wanikani.com/v2/user', st.wkToken);
    const assignments=await wkFetchAll('https://api.wanikani.com/v2/assignments?started=true&subject_types=kanji,vocabulary', st.wkToken);
    const ids=assignments.map(a=>a.data.subject_id); const subjects={};
    for(let i=0;i<ids.length;i+=1000){ const chunk=await wkFetchAll('https://api.wanikani.com/v2/subjects?ids='+ids.slice(i,i+1000).join(','), st.wkToken); for(const sj of chunk) subjects[sj.id]={type:sj.object,chars:sj.data.characters}; }
    payload.wanikani={level:user.data.level, items:assignments.map(a=>{ const sj=subjects[a.data.subject_id]; return sj&&sj.chars?{type:sj.type,chars:sj.chars,srs:a.data.srs_stage}:null; }).filter(Boolean)};
  }
  if (st.bpKey){
    toast('Leyendo Bunpro…');
    try{ const data=await callFunction('bunpro',{key:st.bpKey}); payload.bunpro=data; }catch(e){ toast('Bunpro no disponible: '+e.message); }
  }
  if (!payload.wanikani && !payload.bunpro) throw new Error('No hay claves guardadas');
  importSync(JSON.stringify(payload));
}
// ===================== Arranque =====================
function renderAjustes2(){ const el=$('#main'); el.innerHTML=''; renderAjustes(); }
function boot(){
  loadLocal(); loadGenLocal(); loadUserReadingsLocal(); updateStreak();
  const hash=location.hash.replace('#',''); if (VIEWS.some(v=>v.id===hash)) VIEW=hash;
  render();
  window.addEventListener('hashchange',()=>{ const id=location.hash.replace('#',''); if(VIEWS.some(v=>v.id===id)&&id!==VIEW) go(id); });
  initDb();
  if ('serviceWorker' in navigator) { try{ navigator.serviceWorker.register('sw.js'); }catch(e){} }
  // refresco periódico de contadores (los repasos van venciendo)
  setInterval(()=>{ if(!SESSION&&!LESSON&&!EXAM&&(VIEW==='hoy'||VIEW==='repasos')) render(); }, 6e4);
  try{ speechSynthesis.getVoices(); }catch(e){}
}
boot();
