// ===================== Práctica: escucha y escritura =====================
// Cuenta caracteres japoneses (kana, kanji, ー), sin espacios ni puntuación
const jaLen = s => (String(s||'').match(/[぀-ヿ一-龯々ー]/g)||[]).length;
// Frases de una lectura con su versión en kana (para dictado)
function readingSentences(r){
  const kana=r.t.replace(/\[([^|\]]+)\|([^|\]]*)\|[^\]]*\]/g,(m,w,rd)=>rd||w), plain=plainReading(r);
  const split=t=>t.replace(/\\n|\r?\n/g,'').split('。').map(s=>s.trim()).filter(s=>s.length>=6).map(s=>s+'。');
  const a=split(plain), b=split(kana); return a.map((s,i)=>({j:s,k:b[i]||s,lv:r.lv,es:'',src:r.title})).filter(x=>!/「|」/.test(x.j)||x.j.length<40);
}
function dictationPool(){ const out=[]; for(const r of allReadings()){ if((r.lv||1)>S.level) continue; out.push(...readingSentences(r)); } return out; }
// Comparación carácter a carácter (kana): porcentaje de acierto y marcado de diferencias
function kanaDiff(a,b){ a=[...normKana(a)]; b=[...normKana(b)]; const m=a.length,n=b.length; const d=Array.from({length:m+1},()=>Array(n+1).fill(0)); for(let i=0;i<=m;i++) d[i][0]=i; for(let j=0;j<=n;j++) d[0][j]=j; for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); let i=m,j=n; const marks=[]; while(i>0||j>0){ if(i>0&&j>0&&a[i-1]===b[j-1]&&d[i][j]===d[i-1][j-1]){ marks.unshift({c:b[j-1],ok:true}); i--; j--; } else if(j>0&&(i===0||d[i][j]===d[i][j-1]+1)){ marks.unshift({c:b[j-1],ok:false}); j--; } else if(i>0&&(j===0||d[i][j]===d[i-1][j]+1)){ i--; } else { marks.unshift({c:b[j-1],ok:false}); i--; j--; } } return {pct:n?Math.max(0,Math.round(100*(1-d[m][n]/n))):0, marks}; }
let PRACT={mode:null};
function renderPractica(){
  const el=$('#main'); el.innerHTML='';
  if (PRACT.mode==='dictado') return renderDictado();
  if (PRACT.mode==='escucha') return renderEscucha();
  if (PRACT.mode==='redaccion') return renderRedaccion();
  const d=day(); const ws=(S.writings||[]).slice(-1)[0]; const minW=writingMin();
  el.append(h('div',{class:'topline'}, h('h1',{},'Práctica'), h('span',{class:'small muted'},'Escucha y escritura: lo que el SRS no entrena.')));
  el.append(h('div',{class:'grid c3'},
    h('div',{class:'card stack'}, h('div',{class:'eyebrow'},'Dictado'), h('p',{class:'small',style:'margin:0'},'Oyes una frase de las lecturas (sin verla) y la escribes en kana. Se corrige carácter a carácter.'), h('div',{class:'small muted'},`Hoy: ${d.di||0} ${plural(d.di||0,'frase')}`), h('button',{class:'btn primary',onclick:()=>{ PRACT={mode:'dictado',n:0,sum:0,plays:0}; nextDictation(); }},'Empezar (10 frases)')),
    h('div',{class:'card stack'}, h('div',{class:'eyebrow'},'Comprensión auditiva'), h('p',{class:'small',style:'margin:0'},'Una lectura entera solo con el oído: escuchas el texto y respondes a las preguntas sin leer.'), h('div',{class:'small muted'},`${Object.keys(S.listen||{}).length} ${plural(Object.keys(S.listen||{}).length,'texto escuchado','textos escuchados')}`), h('button',{class:'btn primary',onclick:()=>{ PRACT={mode:'escucha',id:null}; renderPractica(); }},'Elegir texto')),
    h('div',{class:'card stack'}, h('div',{class:'eyebrow'},'Redacción'), h('p',{class:'small',style:'margin:0'},`Un tema, un mínimo de ${minW} caracteres y corrección de Claude: errores, versión natural y nota.`), h('div',{class:'small muted'},ws?`Última: ${fmtDate(ws.date)} · ${ws.score!=null?ws.score+'%':'sin corregir'}`:'Todavía ninguna'), h('button',{class:'btn primary',onclick:()=>{ PRACT={mode:'redaccion',topic:pickTopic(),text:'',result:null}; renderPractica(); }},'Escribir'))));
  const ws10=(S.writings||[]).slice(-10).reverse();
  if (ws10.length) el.append(h('div',{class:'card',style:'margin-top:12px'}, h('h3',{},'Redacciones'), h('div',{class:'list',style:'margin-top:8px'}, ws10.map(w=>h('button',{class:'item',onclick:()=>{ PRACT={mode:'redaccion',topic:w.topic,text:w.text,result:w.result||null,saved:true}; renderPractica(); }}, h('div',{style:'flex:1;min-width:0'}, h('div',{class:'t'},w.topic.t), h('div',{class:'small muted'},`${fmtDate(w.date)} · ${jaLen(w.text)} caracteres`)), h('span',{class:'badge '+(w.score>=70?'ok':'soft')}, w.score!=null?w.score+'%':'—'))))));
  el.append(h('div',{class:'card soft',style:'margin-top:12px'}, h('h3',{},'Recursos gratuitos para escuchar y escribir'), h('ul',{class:'small',style:'margin:8px 0 0;padding-left:18px'},
    h('li',{}, h('a',{href:'https://www.jlpt.jp/e/samples/forlearners.html',target:'_blank',rel:'noopener'},'JLPT: preguntas de muestra oficiales'), ' con audio de 聴解 de cada nivel. Es el formato exacto del examen.'),
    h('li',{}, h('a',{href:'https://www3.nhk.or.jp/news/easy/',target:'_blank',rel:'noopener'},'NHK News Web Easy'), ': noticias con audio y furigana. Escucha primero, lee después; pega el texto en Lectura para el glosario.'),
    h('li',{}, h('a',{href:'https://tadoku.org/japanese/en/free-books-en/',target:'_blank',rel:'noopener'},'Tadoku'), ': libros graduados gratis (niveles 0 a 5), muchos con audio.'),
    h('li',{}, h('a',{href:'https://www.erin.jpf.go.jp/',target:'_blank',rel:'noopener'},'Erin\'s Challenge (Fundación Japón)'), ': vídeos con diálogos reales y transcripción, N5 a N4.'),
    h('li',{}, h('a',{href:'https://langcorrect.com/',target:'_blank',rel:'noopener'},'LangCorrect'), ' y ', h('a',{href:'https://hinative.com/',target:'_blank',rel:'noopener'},'HiNative'), ': correcciones de redacciones por hablantes nativos, para contrastar con la corrección de aquí.'))));
}
// ---------- Dictado ----------
function nextDictation(){
  const P=PRACT; if(P.n>=10){ finishDictation(); return; }
  const pool=dictationPool().filter(x=>!(P.used||[]).includes(x.j)); if(!pool.length){ toast('No hay frases disponibles en tu nivel'); PRACT={mode:null}; renderPractica(); return; }
  P.cur=rnd(pool); (P.used=P.used||[]).push(P.cur.j); P.plays=0; P.answer=null; renderDictado(); setTimeout(()=>speak(P.cur.j),300);
}
function renderDictado(){
  const P=PRACT, el=$('#main'); el.innerHTML=''; document.body.classList.add('focus'); const c=P.cur;
  const head=h('div',{class:'study-head'}, h('button',{class:'btn sm ghost',onclick:()=>confirmBox('¿Salir del dictado?',()=>{ PRACT={mode:null}; go('practica'); })},'✕ Salir'), h('span',{class:'sp'}), h('span',{class:'num'},`${P.n+1}/10`), h('span',{class:'badge soft'},'Dictado'));
  const card=h('div',{class:'prompt-card enter kind-g'}, h('div',{class:'ask'},'Escucha y escribe en kana'), h('div',{class:'row',style:'justify-content:center'}, h('button',{class:'btn big',style:'width:auto',onclick:()=>{ P.plays++; speak(c.j); }},'音 Escuchar otra vez')), h('div',{class:'small muted'},`De «${c.src}»`));
  const wrap=h('div',{class:'study'}, head, card);
  if (P.answer==null){
    const input=h('input',{type:'text',id:'ans',autocomplete:'off',autocapitalize:'off',autocorrect:'off',spellcheck:'false',lang:'ja',placeholder:'romaji → かな'}); kanaInput(input);
    const submit=()=>{ const v=input.value.trim(); if(!v) return; P.answer=toKana(v,true); const r=kanaDiff(P.answer,c.k); P.last=r; P.sum+=r.pct; S.stats=S.stats||{}; const st=S.stats.di=S.stats.di||{c:0,w:0}; if(r.pct>=85) st.c++; else st.w++; bump('di'); renderDictado(); };
    input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } });
    wrap.append(h('div',{class:'answer'}, input, h('button',{class:'btn primary',title:'Corregir',onclick:submit},'→')), h('div',{class:'kbd',style:'margin-top:6px;text-align:center'},'Puedes escucharla las veces que quieras. Enter para corregir.'));
    setTimeout(()=>input.focus(),0);
  } else {
    const r=P.last; const fb=h('div',{class:'feedback'}, h('div',{class:'verdict '+(r.pct>=85?'ok':'ko')}, `${r.pct} % de acierto`, h('span',{class:'muted',style:'font-weight:400'},` · escuchada ${P.plays+1} ${plural(P.plays+1,'vez','veces')}`)));
    const dl=h('dl'); const add=(t,d)=>dl.append(h('dt',{},t),h('dd',{},d));
    add('Tu dictado', h('span',{class:'jp'},P.answer));
    add('Correcto', h('span',{class:'jp'}, r.marks.map(m=>m.ok?m.c:h('b',{style:'color:var(--warn)'},m.c))));
    add('Con kanji', h('span',{class:'jp'}, c.j, ' ', spkBtn(c.j)));
    fb.append(dl); const next=h('button',{class:'btn primary big',style:'margin-top:12px',onclick:()=>{ P.n++; nextDictation(); }},'Siguiente (Enter)'); fb.append(next); wrap.append(fb);
    const hd=e=>{ if(e.key==='Enter'&&PRACT===P&&P.answer!=null){ e.preventDefault(); document.removeEventListener('keydown',hd); P.n++; nextDictation(); } }; document.addEventListener('keydown',hd); P.kh=hd; setTimeout(()=>next.focus(),0);
  }
  el.append(wrap); window.scrollTo(0,0);
}
function finishDictation(){ const P=PRACT; const avg=Math.round(P.sum/Math.max(1,P.n)); PRACT={mode:null}; document.body.classList.remove('focus'); const el=$('#main'); el.innerHTML=''; el.append(h('div',{class:'study stack'}, h('div',{class:'card',style:'text-align:center'}, h('div',{class:'eyebrow'},'Dictado terminado'), h('div',{class:'score '+(avg>=85?'pass':'fail')},avg+'%'), h('p',{class:'muted'}, avg>=85?'Buen oído. Sube la velocidad de la voz en Ajustes para hacerlo más difícil.':'Por debajo del 85 %: vuelve a escuchar las frases falladas en voz alta, repitiéndolas tú también (shadowing).')), h('div',{class:'row'}, h('button',{class:'btn primary',onclick:()=>go('practica')},'Volver a Práctica')))); window.scrollTo(0,0); }
// ---------- Comprensión auditiva ----------
function renderEscucha(){
  const P=PRACT, el=$('#main'); el.innerHTML='';
  if (!P.id){
    el.append(h('div',{class:'topline'}, h('button',{class:'btn sm ghost',onclick:()=>{ PRACT={mode:null}; renderPractica(); }},'← Práctica'), h('h1',{},'Comprensión auditiva')));
    const list=h('div',{class:'list'});
    allReadings().filter(r=>(r.lv||1)<=S.level).forEach(r=>{ const done=(S.listen||{})[r.id]; list.append(h('button',{class:'item'+(done?' done':''),onclick:()=>{ P.id=r.id; P.answers={}; renderEscucha(); }}, h('div',{style:'flex:1;min-width:0'}, h('div',{class:'t jp'},r.title), h('div',{class:'small muted'},r.sub+' · nivel '+r.lv)), done?h('span',{class:'badge ok'},done.score+'%'):h('span',{class:'badge soft'},'Nuevo'))); });
    el.append(list); return;
  }
  const r=allReadings().find(x=>x.id===P.id); const sents=readingSentences(r);
  el.append(h('div',{class:'study-head'}, h('button',{class:'btn sm ghost',onclick:()=>{ stopSpeak(); P.id=null; renderEscucha(); }},'← Textos'), h('span',{class:'sp'}), h('button',{class:'btn sm',onclick:()=>speak(plainReading(r))},'音 Todo / parar')));
  el.append(h('h1',{class:'jp'},r.title), h('div',{class:'muted small'},r.sub));
  el.append(h('div',{class:'card'}, h('div',{class:'eyebrow'},'Escucha por frases'), h('div',{class:'row',style:'margin-top:8px'}, sents.map((s,i)=>h('button',{class:'btn sm',onclick:()=>speak(s.j)},String(i+1)))), h('p',{class:'small muted',style:'margin:8px 0 0'},'El texto está oculto. Responde solo con lo que oigas; al terminar podrás leerlo.')));
  const qa=h('div',{class:'stack',style:'margin-top:12px'});
  r.q.forEach((q,qi)=>{ const box=h('div',{class:'card'}, h('div',{class:'row'}, h('div',{class:'jp',style:'font-weight:600;flex:1'},(qi+1)+'. '+q.q), spkBtn(q.q))); const ch=h('div',{class:'choices text one'}); q.o.forEach((o,oi)=>ch.append(h('button',{lang:'ja',onclick:()=>{ if(P.answers[qi]!=null) return; P.answers[qi]=oi; [...ch.children].forEach((b,i)=>{ b.disabled=true; if(i===q.a) b.classList.add('right'); else if(i===oi) b.classList.add('wrong'); }); if(Object.keys(P.answers).length>=r.q.length){ const ok=r.q.filter((x,i)=>P.answers[i]===x.a).length; const score=Math.round(100*ok/r.q.length); S.listen=S.listen||{}; S.listen[r.id]={score,date:now()}; bump('li'); toast(`Escucha completada: ${score}%`); $('#li-text').hidden=false; } }},o))); box.append(ch); qa.append(box); });
  el.append(h('h2',{},'Preguntas'), qa, h('div',{id:'li-text',class:'card soft',hidden:true,style:'margin-top:12px'}, h('div',{class:'eyebrow'},'Texto'), h('div',{class:'jp',style:'margin-top:6px;line-height:2'},plainReading(r)), h('div',{class:'small muted',style:'margin-top:8px'},r.es)));
  window.scrollTo(0,0);
}
// ---------- Redacción ----------
const WRITING_TOPICS = {
  N5:[{t:'Preséntate',d:'Tu nombre, de dónde eres, qué estudias o en qué trabajas, qué te gusta.'},{t:'Mi día',d:'Qué haces un día normal, de la mañana a la noche, con horas.'},{t:'Mi familia',d:'Quiénes son, qué hacen, cómo son.'},{t:'El fin de semana pasado',d:'Qué hiciste, con quién, qué tal estuvo (pasado).'},{t:'Mi comida favorita',d:'Qué es, dónde la comes, por qué te gusta.'},{t:'Mi casa',d:'Dónde está, cómo es, qué hay en cada habitación.'},{t:'Un correo a un amigo',d:'Invítalo a hacer algo el sábado: dónde, a qué hora, por qué.'},{t:'Mi ciudad',d:'Qué hay, qué no hay, qué recomiendas.'}],
  N4:[{t:'Por qué estudio japonés',d:'Cuándo empezaste, qué te cuesta, qué quieres conseguir.'},{t:'Un viaje',d:'Un viaje que hiciste: adónde, qué viste, qué comiste, qué pasó.'},{t:'Consejos para un amigo que viene a tu país',d:'Qué debe hacer, qué no debe hacer (〜たほうがいい、〜てはいけない).'},{t:'Si tuviera más tiempo',d:'Qué harías (〜たら、〜ば).'},{t:'Un problema y su solución',d:'Algo que te pasó y cómo lo resolviste.'},{t:'Mi trabajo o mis estudios',d:'Qué haces, qué te gusta y qué no, qué quieres cambiar.'},{t:'Una persona importante para mí',d:'Quién es, cómo es, qué has aprendido de ella.'},{t:'Opinión: ¿ciudad o campo?',d:'Ventajas y desventajas, y tu opinión (〜と思う、〜し〜し).'}],
  N3:[{t:'Un cambio en tu vida',d:'Qué cambió, por qué, cómo te sientes ahora (〜ようになる、〜ば〜ほど).'},{t:'Carta de queja educada',d:'A un hotel o tienda: qué pasó y qué pides (keigo básico).'},{t:'Opinión: trabajar desde casa',d:'Argumentos a favor y en contra, conclusión.'},{t:'Una costumbre de tu país',d:'Explícasela a un japonés: origen, cómo se hace, qué significa.'},{t:'Un libro, película o serie',d:'Resumen breve y tu valoración, sin destripar.'},{t:'Algo que te arrepientes de no haber hecho',d:'(〜ばよかった、〜べきだった).'}],
  N2:[{t:'Ventajas e inconvenientes de las redes sociales',d:'Estructura: introducción, dos argumentos por lado, conclusión.'},{t:'Un problema social de tu país',d:'Causas, consecuencias y una propuesta.'},{t:'Carta formal de solicitud',d:'Pide una beca, un puesto o una colaboración (keigo).'},{t:'¿Qué significa aprender un idioma de adulto?',d:'Reflexión con ejemplos propios.'},{t:'Describe un proceso',d:'Cómo se hace algo paso a paso (receta, trámite, trabajo).'}],
  N1:[{t:'Ensayo: tecnología y soledad',d:'Tesis, argumentos con matices, contraargumento y conclusión.'},{t:'Crítica de una decisión política',d:'Expón, analiza y valora con lenguaje formal.'},{t:'Relato breve',d:'Un relato con narrador, diálogo y un giro (lenguaje literario).'},{t:'Informe para tu empresa',d:'Situación, análisis y recomendación (文書体).'}],
};
const WRITING_MIN = {N5:300, N4:500, N3:700, N2:1000, N1:1300};
function writingMin(){ return WRITING_MIN[tierOf(S.level).n]||200; }
function pickTopic(){ const tier=tierOf(S.level).n; const tiers=['N5','N4','N3','N2','N1']; const pool=tiers.slice(0,tiers.indexOf(tier)+1).flatMap(t=>WRITING_TOPICS[t].map(x=>({...x,tier:t}))); const recent=(S.writings||[]).slice(-6).map(w=>w.topic.t); const fresh=pool.filter(x=>!recent.includes(x.t)&&x.tier===tier); const pick1=rnd(fresh.length?fresh:pool); const gs=shuffle(learnedKeys().map(k=>ITEMS.get(k)).filter(i=>i.kind==='g')).slice(0,2).map(g=>g.t); return {...pick1, use:gs, min:writingMin()}; }
function renderRedaccion(){
  const P=PRACT, el=$('#main'); el.innerHTML=''; const tp=P.topic;
  el.append(h('div',{class:'topline'}, h('button',{class:'btn sm ghost',onclick:()=>{ PRACT={mode:null}; renderPractica(); }},'← Práctica'), h('h1',{},'Redacción'), h('button',{class:'btn sm',onclick:()=>{ PRACT={mode:'redaccion',topic:pickTopic(),text:'',result:null}; renderPractica(); }},'Otro tema')));
  el.append(h('div',{class:'card stack'}, h('div',{class:'eyebrow'},`Tema · ${tp.tier||''} · mínimo ${tp.min} caracteres`), h('h2',{},tp.t), h('p',{class:'small',style:'margin:0'},tp.d), tp.use&&tp.use.length?h('div',{class:'small muted'},'Intenta usar: ', tp.use.map(t=>h('span',{class:'pill g jp',style:'margin:2px'},t))):null));
  const counter=h('span',{class:'num small muted'});
  const ta=h('textarea',{id:'wr-text',lang:'ja',placeholder:'Escribe aquí en japonés con tu teclado japonés (kanji y kana). Sin límite máximo.',style:'min-height:220px;font-family:var(--f-jp);font-size:1.1rem'}); ta.value=P.text||'';
  const upd=()=>{ const n=jaLen(ta.value); counter.textContent=`${n} / mín. ${tp.min} caracteres`; counter.style.color=n>=tp.min?'var(--ok)':'var(--muted)'; btn.disabled=n<tp.min; saveBtn.disabled=n<Math.floor(tp.min/2); P.text=ta.value; }; ta.addEventListener('input',upd);
  const status=h('div',{class:'small muted'});
  const btn=h('button',{class:'btn primary',onclick:async()=>{ if(!sb||!USER){ status.textContent='Inicia sesión para corregir con Claude.'; return; } btn.disabled=true; status.textContent='Claude está corrigiendo (30 a 60 segundos)…'; try{ const r=await callFunction('write',{text:ta.value,topic:tp.t+'. '+tp.d,level:tierOf(S.level).n,use:tp.use||[]}); if(!r||typeof r.score!=='number') throw new Error('respuesta incompleta'); P.result=r; saveWriting(P,r); status.textContent=''; renderPractica(); }catch(e){ status.textContent='No se pudo corregir: '+(e.message||e); btn.disabled=false; } }},'Corregir con Claude');
  const saveBtn=h('button',{class:'btn',onclick:()=>{ saveWriting(P,null); toast('Guardada sin corregir'); PRACT={mode:null}; renderPractica(); }},'Guardar sin corregir');
  el.append(h('div',{class:'card stack',style:'margin-top:12px'}, ta, h('div',{class:'row'}, counter, h('span',{class:'sp'}), saveBtn, btn), status)); upd();
  const r=P.result; if (r){
    const box=h('div',{class:'card stack',style:'margin-top:12px'}, h('div',{class:'row between'}, h('h3',{},'Corrección'), h('span',{class:'score '+(r.score>=70?'pass':'fail'),style:'font-size:1.6rem'},r.score+'%')), r.comment?h('p',{style:'margin:0'},r.comment):null);
    if (Array.isArray(r.errors)&&r.errors.length) box.append(h('div',{class:'tscroll'}, h('table',{}, h('thead',{},h('tr',{},h('th',{},'Escribiste'),h('th',{},'Mejor'),h('th',{},'Por qué'))), h('tbody',{}, r.errors.map(e=>h('tr',{}, h('td',{class:'jp wrap',style:'color:var(--warn)'},e.orig||''), h('td',{class:'jp wrap',style:'color:var(--ok)'},e.fix||''), h('td',{class:'wrap small'},e.why||'')))))));
    else box.append(h('div',{class:'small muted'},'Sin errores señalados.'));
    if (r.corrected) box.append(h('div',{}, h('div',{class:'eyebrow'},'Versión natural'), h('div',{class:'jp',style:'margin-top:6px;line-height:2;white-space:pre-wrap'},r.corrected), h('div',{class:'row',style:'margin-top:6px'}, spkBtn(r.corrected))));
    if (r.level) box.append(h('div',{class:'small muted'},'Nivel estimado de este texto: '+r.level));
    el.append(box);
  }
}
function saveWriting(P,r){ S.writings=S.writings||[]; const rec={date:now(),topic:P.topic,text:P.text,score:r?r.score:null,result:r?{score:r.score,comment:r.comment||'',errors:(r.errors||[]).slice(0,30),corrected:r.corrected||'',level:r.level||''}:null}; const i=S.writings.findIndex(w=>w.topic.t===P.topic.t&&w.text===P.text); if(i>=0) S.writings[i]=rec; else S.writings.push(rec); if(S.writings.length>50) S.writings=S.writings.slice(-50); if(!P.saved) bump('wr'); P.saved=true; save(); }
