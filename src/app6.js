// ===================== Ajustes, importación y sincronización =====================
function renderAjustes(){
  const el=$('#main'); const st=S.settings;
  el.append(h('div',{class:'topline'}, h('h1',{},'Ajustes'), h('span',{class:'small muted synclabel'},syncLabel)));
  const f=(label,input)=>h('div',{class:'field'}, h('label',{for:input.id},label), input);
  const name=h('input',{id:'s-name',type:'text',value:st.name||'',placeholder:'Tu nombre'});
  const target=h('input',{id:'s-target',type:'date',value:st.target||''});
  const presets=h('select',{id:'s-preset',onchange:e=>{ if(e.target.value) target.value=e.target.value; }}, h('option',{value:''},'Elegir convocatoria JLPT…'), [['2026-12-06','Diciembre 2026 (6 dic)'],['2027-07-04','Julio 2027 (4 jul)'],['2027-12-05','Diciembre 2027 (5 dic)'],['2028-07-02','Julio 2028 (2 jul)']].map(([v,l])=>h('option',{value:v},l)));
  const tier=h('select',{id:'s-tier'}, ['N4','N3','N2','N1'].map(t=>h('option',{value:t,selected:st.targetTier===t},t)));
  const goal=h('input',{id:'s-goal',type:'number',min:0,max:60,value:st.goalLessons});
  const goalG=h('input',{id:'s-goalg',type:'number',min:0,max:20,value:st.goalGrammar!=null?st.goalGrammar:2});
  const maxr=h('input',{id:'s-maxr',type:'number',min:10,max:500,value:st.maxReviews||100});
  const strict=h('input',{id:'s-strict',type:'checkbox',checked:!!st.strict});
  const manual=h('input',{id:'s-manual',type:'checkbox',checked:!!st.manualPace});
  const furi=h('input',{id:'s-furi',type:'checkbox',checked:!!st.furigana});
  const autoNext=h('input',{id:'s-auto',type:'checkbox',checked:st.autoNext!==false});
  const askR=h('input',{id:'s-askr',type:'checkbox',checked:!!st.askReading});
  const clamp=(v,lo,hi,def)=>{ v=Math.round(+v); return isFinite(v)?Math.max(lo,Math.min(hi,v)):def; };
  const saveBtn=h('button',{class:'btn primary',onclick:()=>{ st.name=name.value.trim().slice(0,40); st.target=/^\d{4}-\d{2}-\d{2}$/.test(target.value)?target.value:''; st.targetTier=tier.value; st.goalLessons=clamp(goal.value,0,60,10); st.goalGrammar=clamp(goalG.value,0,20,2); st.maxReviews=clamp(maxr.value,10,500,100); st.strict=strict.checked; st.manualPace=manual.checked; st.furigana=furi.checked; st.autoNext=autoNext.checked; st.askReading=askR.checked;
    // también lo que esté escrito en los demás paneles (token de WaniKani, voz), por si se pulsa solo este botón
    const wkEl=$('#s-wk'), bpEl=$('#s-bp'), vEl=$('#s-voice'), rEl=$('#s-rate'), nEl=$('#s-neural'); if(wkEl) st.wkToken=wkEl.value.trim(); if(bpEl) st.bpKey=bpEl.value.trim(); if(vEl) st.voice=vEl.value; if(rEl) st.voiceRate=+rEl.value||0.9; if(nEl) st.neuralVoice=nEl.checked;
    S.settingsAt=now(); if(S.pace) S.pace.day=null; save(); toast('Ajustes guardados'); renderNav(); }},'Guardar ajustes');
  el.append(accountCard());
  el.append(h('div',{class:'row',style:'margin-top:12px'}, h('button',{class:'btn',onclick:()=>go('guia')},'Guía de uso')));
  el.append(updateCard());
  el.append(h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Plan de estudio'),
    h('div',{class:'grid c2'}, f('Nombre',name), f('Fecha objetivo (examen JLPT)',h('div',{class:'stack'},presets,target),'El JLPT se celebra el primer domingo de julio y de diciembre.'), f('Nivel objetivo para esa fecha',tier), f('Kanji y vocabulario nuevos por día (techo)',goal,'El ritmo real lo decide la app según tu carga (Recuperación, Suave, Normal, Impulso) sin pasar de este techo. Las palabras se desbloquean cuando sus kanji llegan a Gurú.'), f('Puntos de gramática nuevos por día',goalG,'Se reduce a la mitad en modo Suave y a cero en Recuperación. Con 1 al día llegas a N2 en unos dos años; con 2, en uno.'), f('Máximo de repasos por sesión',maxr)),
    h('div',{class:'row'}, h('label',{class:'row small'},strict,' Modo estricto')), h('div',{class:'row'}, h('label',{class:'row small'},manual,' Ritmo fijo (sin adaptación)')), h('div',{class:'row'}, h('label',{class:'row small'},furi,' Furigana en las lecturas')), h('div',{class:'row'}, h('label',{class:'row small'},autoNext,' Avanzar solo al acertar')), h('div',{class:'row'}, h('label',{class:'row small'},askR,' Preguntar también la lectura')),
    saveBtn));
  // Sincronización WaniKani / Bunpro (directa)
  const wk=h('input',{id:'s-wk',type:'password',value:st.wkToken||'',placeholder:'Token de API v2 de WaniKani',autocomplete:'off'});
  const bp=h('input',{id:'s-bp',type:'password',value:st.bpKey||'',placeholder:'Clave de API de Bunpro',autocomplete:'off'});
  const syncStatus=h('div',{class:'small muted'}, S.sync&&S.sync.wkDiag?h('div',{},S.sync.wkDiag):null, S.sync&&S.sync.bpDiag?h('div',{style:'margin-bottom:6px'},S.sync.bpDiag):null, S.sync&&S.sync.date? `Última sincronización: ${fmtDate(S.sync.date)} · WaniKani nivel ${S.sync.wkLevel||'—'} · ${S.sync.wkMatched||0} ítems alineados · Bunpro ${S.sync.bpMatched||0} puntos alineados` : 'Sin sincronizar todavía.');
  el.append(h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'WaniKani y Bunpro'),
    h('div',{class:'grid c2'}, f('WaniKani',wk,'wanikani.com → Settings → API Tokens (lectura)'), f('Bunpro',bp,'bunpro.jp → Settings → API')),
    h('div',{class:'row'}, h('button',{class:'btn primary',onclick:async()=>{ st.wkToken=wk.value.trim(); st.bpKey=bp.value.trim(); S.settingsAt=now(); save(); syncStatus.textContent='Sincronizando…'; try{ await syncExternal(); }catch(e){ syncStatus.textContent='Error: '+e.message; } }},'Guardar y sincronizar ahora'), h('span',{class:'sp'})),
    syncStatus));
  el.append(glossaryCard());
  if (IS_ADMIN) el.append(adminCard());
  // Gramática ya dominada (sustituye a la sincronización con Bunpro)
  el.append(masteredGrammarCard());
  // Voz
  const vsel=h('select',{id:'s-voice'}); const fillVoices=()=>{ vsel.innerHTML=''; vsel.append(h('option',{value:''},'Automática (la mejor disponible)')); jaVoices().forEach(v=>vsel.append(h('option',{value:v.name,selected:st.voice===v.name},v.name+(v.localService?'':' (en línea)')))); if(jaVoices().length===0) vsel.append(h('option',{value:'',disabled:true},'Este navegador no tiene voces japonesas instaladas')); }; fillVoices(); try{ speechSynthesis.onvoiceschanged=fillVoices; }catch(e){}
  const rate=h('input',{id:'s-rate',type:'range',min:'0.6',max:'1.2',step:'0.05',value:st.voiceRate||0.9});
  const neural=h('input',{id:'s-neural',type:'checkbox',checked:!!st.neuralVoice});
  el.append(h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Voz'),
    h('div',{class:'grid c2'}, f('Voz del navegador',vsel), f('Velocidad',rate)),
    h('div',{class:'row'}, h('label',{class:'row small'},neural,' Usar voz neuronal de Google cuando esté disponible')),
    h('div',{class:'row'}, h('button',{class:'btn',onclick:()=>{ st.voice=vsel.value; st.voiceRate=+rate.value; st.neuralVoice=neural.checked; S.settingsAt=now(); save(); speak('日本語の勉強は毎日続けることが大切です。'); }},'Guardar y probar la voz'))));
  // Notificaciones
  const pushBox=h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Notificaciones'));
  const pstatus=h('div',{class:'small muted'},'Comprobando…'); const prow=h('div',{class:'row'}); pushBox.append(pstatus,prow); el.append(pushBox);
  pushStatus().then(stt=>{ pstatus.textContent={unsupported:'Este navegador no admite notificaciones push.',denied:'Has bloqueado las notificaciones en el navegador; actívalas en los ajustes del sitio.',on:'Activadas en este dispositivo.',off:'Desactivadas en este dispositivo.'}[stt]; if(stt==='on') prow.append(h('button',{class:'btn sm',onclick:()=>disablePush().then(()=>renderAjustes2())},'Desactivar aquí')); if(stt==='off') prow.append(h('button',{class:'btn primary',onclick:()=>enablePush().then(()=>renderAjustes2())},'Activar notificaciones')); });
  // Copia de seguridad
  const ta=h('textarea',{id:'s-backup',placeholder:'Pega aquí una copia de seguridad para restaurarla'});
  el.append(h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Copia de seguridad'),
    h('div',{class:'row'}, h('button',{class:'btn',onclick:exportBackup},'Descargar copia (.json)'), h('button',{class:'btn',onclick:()=>{ navigator.clipboard.writeText(JSON.stringify(S)).then(()=>toast('Copiado al portapapeles')).catch(()=>{ ta.value=JSON.stringify(S); ta.select(); toast('Selecciona y copia el texto'); }); }},'Copiar al portapapeles')),
    f('Restaurar',ta), h('button',{class:'btn',onclick:()=>{ try{ const o=parseLooseJson(ta.value); if(!o||!o.items) throw 0; S={...DEFAULT_STATE(),...o,settings:{...DEFAULT_STATE().settings,...(o.settings||{})}}; S.gen={...(S.gen||{}),...(o.gen||{})}; S.pace=null; S.settingsAt=now(); S.updated=now(); registerGenerated(); updateStreak(); save(); toast('Copia restaurada'); go('hoy'); }catch(e){ toast('JSON no válido'); } }},'Restaurar desde el texto')));
  el.append(resetCard());
  collapseSettingsOnMobile();
}
// JSON pegado a mano: admite vallas ```json y texto alrededor
function parseLooseJson(t){ t=String(t||'').trim().replace(/^```[a-z]*\s*/i,'').replace(/```\s*$/,''); const m=t.match(/\{[\s\S]*\}/); return JSON.parse(m?m[0]:t); }
async function exportBackup(){
  const data=JSON.stringify(S,null,0);
  try{ const blob=new Blob([data],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='dojo-backup-'+todayKey()+'.json'; document.body.append(a); a.click(); a.remove(); toast('Copia descargada'); return; }catch(e){}
  try{ await navigator.clipboard.writeText(data); toast('No se pudo descargar; copiado al portapapeles'); }catch(e){ const ta=$('#s-backup'); if(ta){ ta.value=data; ta.select(); } toast('Copia el texto del cuadro de abajo'); }
}
// Mapea etapas de WaniKani (0-9) a las nuestras (misma escala)
function importSync(text){
  let o; try{ o=parseLooseJson(text); }catch(e){ toast('JSON no válido'); return; }
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
    const norm=s=>String(s||'').replace(/[〜～\s()（）・、。～\-ー]/g,'').replace(/[Ａ-Ｚａ-ｚ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0)).toLowerCase();
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
  const elsewhere=key=>ITEMS.has(key) && ITEMS.get(key).lv!==lv; // ya existe en otro nivel: no se duplica
  const seen=new Set(); const once=key=>{ if(seen.has(key)) return false; seen.add(key); return true; };
  const ks=Array.isArray(o.kanji)?o.kanji.filter(k=>k&&typeof k.k==='string'&&k.k.length===1&&Array.isArray(k.m)&&k.m.length&&!elsewhere('k|'+k.k)&&once('k|'+k.k)):[];
  const vs=Array.isArray(o.vocab)?o.vocab.filter(v=>v&&typeof v.w==='string'&&typeof v.r==='string'&&Array.isArray(v.m)&&v.m.length&&!elsewhere('v|'+v.w+'|'+v.r)&&once('v|'+v.w+'|'+v.r)):[];
  const gs=Array.isArray(o.grammar)?o.grammar.filter(g=>g&&g.t&&Array.isArray(g.ex)&&g.ex.some(e=>e&&/\[[^\]]+\]/.test(e.j||''))).map(g=>({...g,id:(g.id||g.t).toString().replace(/[^\w\-一-龯ぁ-んァ-ン〜]/g,'')+'-'+lv,ex:g.ex.filter(e=>e&&/\[[^\]]+\]/.test(e.j||''))})).filter(g=>!elsewhere('g|'+g.id)&&once('g|'+g.id)):[];
  if (!ks.length&&!gs.length) return 'sin kanji ni gramática válidos';
  return {lv, kanji:ks.map(k=>({k:k.k,m:k.m,on:k.on||[],kun:k.kun||[],mn:k.mn||''})), vocab:vs.map(v=>({w:v.w,r:v.r,m:v.m,p:v.p||'n',ex:v.ex||'',es:v.es||''})), grammar:gs.map(g=>({id:g.id,t:g.t,s:g.s||'',e:g.e||'',ex:g.ex.map(e=>({j:e.j,s:e.s||'',h:e.h||'',k:e.k||''}))})), generated:now()};
}
function generatePanel(lv){
  const tier=tierOf(lv); const ks=(ROADMAP[tier.n].kanjiByLevel||{})[lv]||[]; const gs=(ROADMAP[tier.n].grammarByLevel||{})[lv]||[];
  const status=h('div',{class:'small muted'});
  return h('div',{class:'card stack'},
    h('h3',{},`Preparar el nivel ${lv} (${tier.n})`),
    h('div',{class:'row'}, ks.map(k=>h('span',{class:'pill k jp',style:'font-size:1.1rem'},k.k))),
    h('div',{class:'row'}, gs.map(g=>h('span',{class:'pill g jp'},g))),
    h('div',{class:'row'}, h('button',{class:'btn primary',id:'gen-btn',onclick:()=>generateLevel(lv,status)},'Preparar nivel')),
    status);
}
async function generateLevel(lv, status){
  const btn=$('#gen-btn'); if(btn) btn.disabled=true;
  if (!sb||!USER){ status.textContent='Inicia sesión para preparar el nivel.'; if(btn) btn.disabled=false; return; }
  try{
    status.textContent='Preparando el nivel (puede tardar un minuto)…';
    const res=await callFunction('generate',{lv, prompt:generationPrompt(lv)});
    const v=validateGen(res, lv); if (typeof v==='string') throw new Error(v);
    await saveGen(lv, v); status.textContent='Listo.'; toast(`Nivel ${lv} preparado: ${v.kanji.length} kanji, ${v.vocab.length} palabras, ${v.grammar.length} puntos`); render();
  }catch(e){ console.warn(e); status.textContent='No se pudo preparar el nivel: '+(e&&e.message||'error')+'. Prueba otra vez.'; if(btn) btn.disabled=false; }
}
function accountCard(){
  if (!CONFIG.SUPABASE_URL) return h('div',{class:'push'},'La cuenta no está configurada todavía (falta config.js). El progreso se guarda solo en este navegador.');
  if (USER) return h('div',{class:'card stack'}, h('h3',{},'Cuenta'), h('div',{class:'row'}, h('span',{},'Sesión iniciada como ', h('b',{},USER.email||USER.id)), h('span',{class:'sp'}), h('button',{class:'btn sm',onclick:signOut},'Cerrar sesión')), h('div',{class:'small muted synclabel'},syncLabel));
  if (OFFLINE) return h('div',{class:'card stack'}, h('h3',{},'Cuenta'), h('div',{class:'small'},'Sin conexión con el servidor. Trabajas con la copia local de tu cuenta; se sincroniza sola cuando vuelva la red y recargues.'), h('div',{class:'small muted synclabel'},syncLabel));
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
    S.sync.wkDiag='WaniKani devolvió '+assignments.length+' asignaciones.';
    payload.wanikani={level:user.data.level, items:assignments.map(a=>{ const sj=subjects[a.data.subject_id]; return sj&&sj.chars?{type:sj.type,chars:sj.chars,srs:a.data.srs_stage}:null; }).filter(Boolean)};
  }
  if (st.bpKey){
    toast('Leyendo Bunpro…');
    let data=null;
    try{ const r=await fetch('https://bunpro.jp/api/user/'+encodeURIComponent(st.bpKey)+'/all_reviews',{headers:{Accept:'application/json'}}); if(r.ok){ const j=await r.json(); const arr=Array.isArray(j)?j:(j.reviews||j.data||[]); data={items:arr.map(x=>{const gp=x.grammar_point||{}; return {title:gp.title||x.title||'', srs:Number(x.srs_stage??x.streak??1)};}).filter(i=>i.title), diag:'directo desde el navegador: '+arr.length+' elementos'}; } }catch(e){}
    try{ if(!data) data=await callFunction('bunpro',{key:st.bpKey}); if(data&&data.error) throw new Error(data.error); payload.bunpro=data; S.sync.bpDiag='Bunpro devolvió '+((data&&data.items)||[]).length+' puntos. Ejemplos: '+((data&&data.items)||[]).slice(0,6).map(i=>i.title+' (srs '+i.srs+')').join(' · ')+(data.diag?' · '+data.diag:''); }catch(e){ S.sync.bpDiag='Error de Bunpro: '+e.message; toast('Bunpro no disponible: '+e.message); }
  }
  if (!payload.wanikani && !payload.bunpro) throw new Error('No hay claves guardadas');
  importSync(JSON.stringify(payload));
}
// ===================== Arranque =====================
function renderAjustes2(){ const el=$('#main'); el.innerHTML=''; renderAjustes(); }
function collapseSettingsOnMobile(){ if(!window.matchMedia('(max-width:860px)').matches) return; const el=$('#main'); [...el.querySelectorAll(':scope > .card')].forEach((card,i)=>{ const h3=card.querySelector(':scope > h3'); if(!h3||i===0) return; const det=h('details',{class:'sec',style:'border:0;padding:0'}, h('summary',{},h3.textContent)); const body=h('div',{class:'stack'}); [...card.childNodes].forEach(n=>{ if(n!==h3) body.append(n); }); h3.remove(); det.append(body); card.append(det); }); }
function boot(){
  loadLocal(); loadGenLocal(); loadUserReadingsLocal(); updateStreak();
  const hash=location.hash.replace('#',''); if (VIEWS.some(v=>v.id===hash)) VIEW=hash;
  if (CONFIG.SUPABASE_URL && localOwner() && hasStoredSession()) { AUTH_OPT=true; AUTH_PENDING=false; render(); } // ya había sesión en este dispositivo: se pinta al instante y la cuenta se comprueba por detrás
  else if (CONFIG.SUPABASE_URL) { const el=$('#main'); el.innerHTML=''; el.append(h('div',{class:'muted',style:'text-align:center;margin-top:20vh'},'Cargando…')); } else render();
  window.addEventListener('hashchange',()=>{ const id=location.hash.replace('#',''); if(VIEWS.some(v=>v.id===id)&&id!==VIEW) go(id); });
  initDb();
  if ('serviceWorker' in navigator) { try{ navigator.serviceWorker.register('sw.js').catch(e=>console.warn('sw',e)); navigator.serviceWorker.addEventListener('message',e=>{ if(e.data&&e.data.type==='update-ready') showUpdateBar(); }); }catch(e){} }
  // refresco periódico de contadores (los repasos van venciendo)
  setInterval(()=>{ if(!SESSION&&!LESSON&&!EXAM&&(VIEW==='hoy'||VIEW==='repasos')) render(); }, 6e4);
  try{ speechSynthesis.getVoices(); }catch(e){}
}
// boot() se llama al final de app9.js, cuando todos los módulos están definidos

// Actualizar: borra la copia guardada y recarga la última versión publicada
async function updateApp(){
  toast('Actualizando…');
  try{ if('serviceWorker' in navigator){ const regs=await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r=>r.unregister())); } if(window.caches){ const ks=await caches.keys(); await Promise.all(ks.map(k=>caches.delete(k))); } }catch(e){ console.warn('update',e); }
  location.reload();
}
function showUpdateBar(){
  if ($('#updatebar')) return;
  const bar=h('div',{id:'updatebar',class:'updatebar'}, h('span',{},'Hay una versión nueva.'), h('button',{class:'btn sm primary',onclick:updateApp},'Actualizar'), h('button',{class:'btn sm ghost','aria-label':'Cerrar',onclick:()=>bar.remove()},'✕'));
  document.body.append(bar);
}
function updateCard(){
  return h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Actualizar la app'), h('div',{class:'row'}, h('button',{class:'btn primary',onclick:updateApp},'Actualizar ahora'), h('span',{class:'small muted'},'Versión: '+APP_BUILD)));
}
function masteredGrammarCard(){
  const box=h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Gramática que ya dominas'));
  const applyMany=(items)=>{ let n=0; for(const it of items){ const k=keyOf(it); const cur=S.items[k]; if(!cur||cur.s<5){ S.items[k]={...(cur||{c:0,w:0}), s:5, due:now()+STAGE_HOURS[5]*H*Math.random(), lrn:cur&&cur.lrn||now(), ls:now()}; n++; } } save(); toast(n?`${n} puntos marcados como dominados`:'Nada que cambiar'); renderAjustes2(); };
  TIERS.filter(t=>t.n==='N5'||t.n==='N4').forEach(t=>{
    const gs=GRAMMAR_ALL.filter(g=>g.lv>=t.from&&g.lv<=t.to); const done=gs.filter(g=>S.items['g|'+g.id]&&S.items['g|'+g.id].s>=5).length;
    const det=h('details',{}, h('summary',{}, `${t.n}: ${done}/${gs.length} dominados`));
    det.append(h('div',{class:'row',style:'margin:8px 0'}, h('button',{class:'btn sm primary',onclick:()=>applyMany(gs.map(g=>({...g,kind:'g'})))},`Marcar todo ${t.n}`)));
    for(let lv=t.from;lv<=t.to;lv++){ const lg=gs.filter(g=>g.lv===lv); if(!lg.length) continue; const row=h('div',{class:'row',style:'margin:4px 0;align-items:flex-start'}, h('button',{class:'btn sm',onclick:()=>applyMany(lg.map(g=>({...g,kind:'g'})))},`Nivel ${lv}`)); lg.forEach(g=>{ const rec=S.items['g|'+g.id]; const on=rec&&rec.s>=5; row.append(h('button',{class:'pill g jp'+(on?' guru':' todo'),title:on?'Dominado · pulsa para quitar':'Pulsa para marcar como dominado',onclick:()=>{ if(on){ S.items['g|'+g.id]={...rec,s:1,due:now(),ls:now()}; save(); renderAjustes2(); } else applyMany([{...g,kind:'g'}]); }},g.t)); }); det.append(row); }
    box.append(det);
  });
  return box;
}

// Confirmación fuerte: hay que escribir la palabra para poder continuar
function typedConfirm(msg, word, onYes){
  const inp=h('input',{type:'text',placeholder:'Escribe '+word,autocomplete:'off',style:'width:100%'});
  const go=h('button',{class:'btn warn',disabled:true,onclick:()=>{ box.remove(); onYes(); }},'Borrar para siempre');
  inp.addEventListener('input',()=>{ go.disabled=inp.value.trim().toUpperCase()!==word; });
  const box=h('div',{class:'card stack',style:'position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:60;max-width:380px;width:calc(100% - 32px);box-shadow:0 20px 60px rgba(0,0,0,.3)'},
    h('p',{style:'margin:0'},msg), inp, h('div',{class:'row'}, h('button',{class:'btn',onclick:()=>box.remove()},'Cancelar'), h('span',{class:'sp'}), go));
  document.body.append(box); setTimeout(()=>inp.focus(),0);
}
function resetLevel(tierName){
  const tier=tierByName(tierName); const t=now(); S.resetKeys=S.resetKeys||{};
  for (const it of ITEMS.values()){ if(it.lv>=tier.from&&it.lv<=tier.to){ const k=keyOf(it); delete S.items[k]; S.resetKeys[k]=t; } }
  for (let lv=tier.from; lv<=tier.to; lv++) if(S.levelPass) delete S.levelPass[lv];
  if ((S.level||1)>=tier.from&&(S.level||1)<=tier.to){ S.level=tier.from; S.lvReset={at:t}; }
  S.pace=null; S.settingsAt=t; updateStreak(); save();
}
function resetCard(){
  const sel=h('select',{}, TIERS.map(t=>h('option',{value:t.n},t.n)));
  return h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Reiniciar'),
    h('div',{class:'small muted'},'Estas acciones no se pueden deshacer. Descarga antes una copia si dudas.'),
    h('div',{class:'row'}, sel, h('button',{class:'btn warn sm',onclick:()=>typedConfirm(`Se borra el progreso de todo el nivel ${sel.value} (kanji, vocabulario y gramática), en este dispositivo y en tu cuenta.`,'BORRAR',()=>{ resetLevel(sel.value); toast('Nivel '+sel.value+' reiniciado'); go('hoy'); })},'Reiniciar nivel')),
    h('div',{class:'row'}, h('button',{class:'btn warn sm',onclick:()=>typedConfirm('Se borra TODO: progreso, exámenes, redacciones, ajustes y respuestas anotadas, en este dispositivo y en tu cuenta.','BORRAR',()=>{ S=DEFAULT_STATE(); S.resetAt=now(); S.settingsAt=now(); S.lvReset={at:now()}; loadGenLocal(); save(); go('hoy'); toast('Cuenta reiniciada'); })},'Reiniciar toda la cuenta')));
}
function glossaryCard(){
  const box=h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Glosario'));
  const list=h('div',{class:'list'});
  const label=key=>{ const base=key.replace(/#m$/,''); const it=ITEMS.get(base); if(!it) return base; return it.kind==='k'?it.k:it.kind==='v'?it.w+'（'+it.r+'）':base; };
  const draw=()=>{
    list.innerHTML='';
    const rows=[]; const seen=new Set();
    for (const [k,a] of Object.entries(S.alts||{})) for (const x of a){ rows.push({k,x,mine:true,common:(GLOSS[k]||[]).includes(x)}); seen.add(k+'\u0000'+x); }
    for (const [k,a] of Object.entries(GLOSS)) for (const x of a) if(!seen.has(k+'\u0000'+x)) rows.push({k,x,mine:false,common:true});
    if(!rows.length){ list.append(h('div',{class:'small muted'},'Aún no hay respuestas añadidas. Cuando una respuesta tuya sea válida y la app la marque mal, pulsa "Mi respuesta también era válida" y aparecerá aquí.')); return; }
    rows.sort((a,b)=>label(a.k).localeCompare(label(b.k),'ja'));
    for (const r of rows){
      const canRemove = r.mine || CAN_GLOSS;
      list.append(h('div',{class:'item'}, h('div',{style:'flex:1;min-width:0'}, h('div',{class:'t'}, h('span',{class:'jp'},label(r.k)), ' → ', r.x), h('div',{class:'small muted'}, (r.k.endsWith('#m')?'Significado':'Palabra')+' · '+(r.common?'compartido con todos':'solo en tu cuenta'))),
        canRemove?h('button',{class:'btn sm ghost',onclick:async()=>{ await removeAlt(r.k,r.x,r.common); draw(); }},'Quitar'):null));
    }
  };
  draw();
  box.append(h('div',{class:'small muted'}, CAN_GLOSS?'Tienes permiso para editar el glosario común: lo que añades lo ven todos.':'Lo que añades se guarda en tu cuenta. Para compartirlo con todos hace falta permiso de edición.'), list);
  return box;
}
function adminCard(){
  const box=h('div',{class:'card stack',style:'margin-top:12px'}, h('h3',{},'Cuentas autorizadas'));
  const list=h('div',{class:'list'}); const email=h('input',{type:'email',placeholder:'correo@gmail.com',autocomplete:'off',style:'flex:1;min-width:0'}); const note=h('input',{type:'text',placeholder:'nota (opcional)',style:'flex:1;min-width:0'});
  const refresh=async()=>{ list.innerHTML=''; try{ const rows=await adminList(); if(!rows.length) list.append(h('div',{class:'small muted'},'Lista vacía (ejecuta schema3.sql).')); rows.forEach(r=>list.append(h('div',{class:'item'}, h('div',{style:'flex:1;min-width:0'}, h('div',{class:'t'},r.email), h('div',{class:'small muted'},(r.note||'')+(r.added_at?' · '+fmtDate(new Date(r.added_at).getTime()):''))), r.email.toLowerCase()===(USER.email||'').toLowerCase()?h('span',{class:'badge soft'},'tú'):h('button',{class:'btn sm ghost',onclick:async()=>{ try{ await adminSetEditor(r.email,!r.glossary_editor); toast(r.glossary_editor?'Ya no edita el glosario':'Puede editar el glosario'); refresh(); }catch(e){ toast('Error: '+e.message); } }},r.glossary_editor?'Editor del glosario ✓':'Dar permiso de glosario'), r.email.toLowerCase()===(USER.email||'').toLowerCase()?null:h('button',{class:'btn sm warn',onclick:()=>confirmBox(`¿Quitar el acceso a ${r.email}? Su progreso se conserva pero no podrá entrar.`,async()=>{ try{ await adminRemove(r.email); toast('Acceso retirado'); refresh(); }catch(e){ toast('Error: '+e.message); } })},'Quitar')))); }catch(e){ list.append(h('div',{class:'small muted'},'No se pudo leer la lista: '+e.message+'. ¿Has ejecutado schema3.sql?')); } };
  box.append(list, h('div',{class:'row'}, email, note, h('button',{class:'btn primary',onclick:async()=>{ const v=email.value.trim().toLowerCase(); if(!v.includes('@')){ toast('Correo no válido'); return; } try{ await adminAdd(v,note.value.trim()); email.value=''; note.value=''; toast('Cuenta autorizada'); refresh(); }catch(e){ toast('Error: '+e.message); } }},'Autorizar')));
  refresh(); return box;
}
