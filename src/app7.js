// ===================== Práctica: escucha y escritura =====================
// Cuenta caracteres japoneses (kana, kanji, ー), sin espacios ni puntuación
const jaLen = s => (String(s||'').match(/[぀-ヿ一-龯々ー]/g)||[]).length;
// Frases de una lectura con su versión en kana (para dictado)
function readingSentences(r){
  const rt=r.t.replace(SPEAKER_RE,'$1'); const kana=rt.replace(/\[([^|\]]+)\|([^|\]]*)\|[^\]]*\]/g,(m,w,rd)=>rd||w), plain=plainReading({t:rt});
  const split=t=>t.replace(/\\n|\r?\n/g,'').split('。').map(s=>s.trim()).filter(s=>s.length>=6).map(s=>s+'。');
  const a=split(plain), b=split(kana); return a.map((s,i)=>({j:s,k:b[i]||s,lv:r.lv,es:'',src:r.title})).filter(x=>!/「|」/.test(x.j)||x.j.length<40);
}
function dictationPool(){
  const bank=(typeof EXAM_SENTS!=='undefined'?EXAM_SENTS:[]).filter(x=>x.lv<=S.level&&x.es&&EXAM_KANA[x.j]).map(x=>({j:x.j,k:EXAM_KANA[x.j],es:x.es,lv:x.lv,src:'banco de examen'}));
  if (bank.length>=10) return bank;
  const out=bank.slice(); for(const r of allReadings()){ if((r.lv||1)>S.level) continue; out.push(...readingSentences(r)); } return out;
}
// Comparación carácter a carácter (kana): porcentaje de acierto y marcado de diferencias
function kanaDiff(a,b){ a=[...normKana(a)]; b=[...normKana(b)]; const m=a.length,n=b.length; const d=Array.from({length:m+1},()=>Array(n+1).fill(0)); for(let i=0;i<=m;i++) d[i][0]=i; for(let j=0;j<=n;j++) d[0][j]=j; for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); let i=m,j=n; const marks=[]; while(i>0||j>0){ if(i>0&&j>0&&a[i-1]===b[j-1]&&d[i][j]===d[i-1][j-1]){ marks.unshift({c:b[j-1],ok:true}); i--; j--; } else if(j>0&&(i===0||d[i][j]===d[i][j-1]+1)){ marks.unshift({c:b[j-1],ok:false}); j--; } else if(i>0&&(j===0||d[i][j]===d[i-1][j]+1)){ i--; } else { marks.unshift({c:b[j-1],ok:false}); i--; j--; } } return {pct:n?Math.max(0,Math.round(100*(1-d[m][n]/n))):0, marks}; }
let PRACT={mode:null};
function renderPractica(){
  const el=$('#main'); el.innerHTML='';
  if (PRACT.mode==='dictado') return renderDictado();
  if (PRACT.mode==='escucha') return renderEscucha();
  if (PRACT.mode==='redaccion') return renderRedaccion();
  if (PRACT.mode==='escritura') return renderEscritura();
  const d=day(); const ws=(S.writings||[]).slice(-1)[0]; const minW=writingMin();
  el.append(h('div',{class:'topline'}, h('h1',{},'Práctica')));
  el.append(h('div',{class:'grid c3'},
    h('div',{class:'card stack'}, h('div',{class:'eyebrow'},'Dictado'), h('div',{class:'small muted'},`Hoy: ${d.di||0} ${plural(d.di||0,'frase')}`), h('button',{class:'btn primary',onclick:()=>{ PRACT={mode:'dictado',n:0,sum:0,plays:0}; nextDictation(); }},'Empezar (10 frases)')),
    h('div',{class:'card stack'}, h('div',{class:'eyebrow'},'Comprensión auditiva'), h('div',{class:'small muted'},`${Object.keys(S.listen||{}).length} ${plural(Object.keys(S.listen||{}).length,'texto escuchado','textos escuchados')}`), h('button',{class:'btn primary',onclick:()=>{ PRACT={mode:'escucha',id:null}; renderPractica(); }},'Elegir texto')),
    h('div',{class:'card stack'}, h('div',{class:'eyebrow'},`Redacción · grado ${writingGrade()} de 10 (${WRITING_GRADES[writingGrade()].tier})`), h('div',{class:'small muted'},`${writingRange()[0]} a ${writingRange()[1]} caracteres`), h('div',{class:'small muted'},(writingGrade()<10?`${writingPassCount()}/${WR_NEED} para subir (nota de ${writingPass(writingGrade())} o más)`:'Grado máximo')+(ws?` · última ${ws.score!=null?ws.score+' %':'sin corregir'}`:'')), writingLowStreak()?h('div',{class:'small',style:'color:var(--warn)'},'Repite el mismo tema.'):null, h('button',{class:'btn primary',onclick:()=>{ PRACT={mode:'redaccion',topic:pickTopic(true),text:'',result:null}; renderPractica(); }},'Escribir'), h('button',{class:'btn sm ghost',onclick:chooseWritingGrade},'Cambiar de grado'))));
  { const hand=S.hand||{}; const seen=Object.keys(hand).length; el.append(h('div',{class:'card stack',style:'margin-top:12px'}, h('div',{class:'eyebrow'},'Escritura a mano'), h('div',{class:'small muted'},`Dibuja el kanji de memoria y compáralo con el modelo. ${seen?`${seen} ${plural(seen,'kanji practicado','kanji practicados')}`:'Con los kanji que ya has empezado a aprender.'}`), h('div',{class:'row'}, h('button',{class:'btn primary',onclick:startHandwriting},`Empezar (${HW_SESSION} kanji)`), seen?h('button',{class:'btn sm ghost',onclick:()=>confirmBox('¿Reiniciar todo tu progreso de escritura a mano? Se borra el recuento de kanji practicados y de aciertos. No se puede deshacer.',()=>{ S.hand={}; S.handResetAt=now(); S.settingsAt=now(); save(); toast('Escritura a mano reiniciada'); renderPractica(); })},'Reiniciar'):null))); }
  const ws10=(S.writings||[]).slice(-10).reverse();
  if (ws10.length) el.append(h('div',{class:'card',style:'margin-top:12px'}, h('h3',{},'Redacciones'), h('div',{class:'list',style:'margin-top:8px'}, ws10.map(w=>h('div',{class:'row',style:'align-items:stretch;gap:6px'}, h('button',{class:'item',style:'flex:1;min-width:0',onclick:()=>{ PRACT={mode:'redaccion',topic:w.topic,text:w.text,result:w.result||null,saved:true}; renderPractica(); }}, h('div',{style:'flex:1;min-width:0'}, h('div',{class:'t'},w.topic.t), h('div',{class:'small muted'},`${fmtDate(w.date)} · ${jaLen(w.text)} caracteres`)), h('span',{class:'badge '+(w.score>=70?'ok':'soft')}, w.score!=null?w.score+'%':'—')), h('button',{class:'btn sm ghost',title:'Borrar esta redacción',onclick:()=>deleteWriting(w)},'Borrar'))))));
}
function deleteWriting(w){
  confirmBox('¿Borrar esta redacción y su corrección? No se puede deshacer.',()=>{
    S.wrDel=uniq([...(S.wrDel||[]),w.date]); S.writings=(S.writings||[]).filter(x=>x.date!==w.date); S.settingsAt=now(); save();
    if (PRACT&&PRACT.mode==='redaccion'&&PRACT.text===w.text) PRACT={mode:null};
    toast('Redacción borrada'); renderPractica();
  });
}
// ---------- Dictado ----------
function nextDictation(){
  const P=PRACT; if(P.n>=10){ finishDictation(); return; }
  const pool=dictationPool().filter(x=>!(P.used||[]).includes(x.j)); if(!pool.length){ toast('No hay frases disponibles en tu nivel'); PRACT={mode:null}; renderPractica(); return; }
  P.cur=rnd(pool); (P.used=P.used||[]).push(P.cur.j); P.plays=0; P.answer=null; P.trans=null; P.graded=false; if(P.kh){ document.removeEventListener('keydown',P.kh); P.kh=null; } renderDictado(); setTimeout(()=>speak(P.cur.j),300);
}
function renderDictado(){
  const P=PRACT, el=$('#main'); el.innerHTML=''; document.body.classList.add('focus'); const c=P.cur;
  const head=h('div',{class:'study-head'}, h('button',{class:'btn sm ghost',onclick:()=>confirmBox('¿Salir del dictado?',()=>{ PRACT={mode:null}; go('practica'); })},'✕ Salir'), h('span',{class:'sp'}), h('span',{class:'num'},`${P.n+1}/10`), h('span',{class:'badge soft'},'Dictado'));
  const card=h('div',{class:'prompt-card enter kind-g'}, h('div',{class:'ask'},'Escucha y escribe en kana'), h('div',{class:'row',style:'justify-content:center'}, h('button',{class:'btn big',style:'width:auto',onclick:()=>{ P.plays++; speak(c.j); }},'音 Escuchar otra vez')), h('div',{class:'small muted'},`De «${c.src}»`));
  const wrap=h('div',{class:'study'}, head, card);
  if (P.answer==null){
    const input=h('input',{type:'text',id:'ans',autocomplete:'off',autocapitalize:'off',autocorrect:'off',spellcheck:'false',lang:'ja',placeholder:'romaji → かな'}); kanaInput(input);
    const submit=()=>{ const v=input.value.trim(); if(!v) return; P.answer=toKana(v,true); const r=kanaDiff(P.answer,c.k); P.last=r; S.stats=S.stats||{}; const st=S.stats.di=S.stats.di||{c:0,w:0}; if(r.pct>=85) st.c++; else st.w++; renderDictado(); };
    input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } });
    wrap.append(h('div',{class:'answer'}, input, h('button',{class:'btn primary',title:'Corregir',onclick:submit},'→')));
    setTimeout(()=>input.focus(),0);
  } else if (P.trans==null){
    // Paso 2: traducir al español lo escuchado
    const r=P.last; const fb=h('div',{class:'feedback'}, h('div',{class:'verdict '+(r.pct>=85?'ok':'ko')}, `Dictado: ${r.pct} %`), h('div',{class:'jp',style:'margin:4px 0 8px'}, r.marks.map(m=>m.ok?m.c:h('b',{style:'color:var(--warn)'},m.c))));
    const ta=h('input',{type:'text',id:'ans',autocomplete:'off',lang:'es',placeholder:'¿Qué significa? Escríbelo en español'});
    const go2=()=>{ const v=ta.value.trim(); if(!v) return; P.trans=v; renderDictado(); };
    ta.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); go2(); } });
    fb.append(h('div',{class:'answer'}, ta, h('button',{class:'btn primary',title:'Comprobar',onclick:go2},'→')));
    wrap.append(fb); setTimeout(()=>ta.focus(),0);
  } else {
    const r=P.last; const fb=h('div',{class:'feedback'}, h('div',{class:'verdict '+(r.pct>=85?'ok':'ko')}, `Dictado: ${r.pct} %`, h('span',{class:'muted',style:'font-weight:400'},` · escuchada ${P.plays+1} ${plural(P.plays+1,'vez','veces')}`)));
    const dl=h('dl'); const add=(t,d)=>dl.append(h('dt',{},t),h('dd',{},d));
    add('Tu dictado', h('span',{class:'jp'},P.answer));
    add('Correcto', h('span',{class:'jp'}, r.marks.map(m=>m.ok?m.c:h('b',{style:'color:var(--warn)'},m.c))));
    add('Con kanji', h('span',{class:'jp'}, c.j, ' ', spkBtn(c.j)));
    add('Tu traducción', P.trans);
    add('Referencia', c.es||h('span',{class:'muted'},'(sin traducción de referencia para esta frase)'));
    fb.append(dl);
    const finish=(g)=>{ if(P.graded) return; P.graded=true; P.sum+=Math.round(r.pct*0.5+g*50); S.stats=S.stats||{}; const st=S.stats.tr=S.stats.tr||{c:0,w:0}; if(g>=0.5) st.c++; else st.w++; bump('di'); P.n++; nextDictation(); };
    fb.append(h('div',{class:'small muted',style:'margin-top:10px'},'¿Tu traducción es correcta?'), h('div',{class:'row',style:'margin-top:6px'}, h('button',{class:'btn',onclick:()=>finish(1)},'Sí (1)'), h('button',{class:'btn',onclick:()=>finish(0.5)},'A medias (2)'), h('button',{class:'btn warn',onclick:()=>finish(0)},'No (3)')));
    wrap.append(fb);
    const hd=e=>{ if(PRACT!==P||P.trans==null) return; const g={'1':1,'2':0.5,'3':0}[e.key]; if(g==null) return; e.preventDefault(); document.removeEventListener('keydown',hd); finish(g); }; document.addEventListener('keydown',hd); P.kh=hd;
  }
  el.append(wrap); window.scrollTo(0,0);
}
function finishDictation(){ const P=PRACT; const avg=Math.round(P.sum/Math.max(1,P.n)); PRACT={mode:null}; document.body.classList.remove('focus'); const el=$('#main'); el.innerHTML=''; el.append(h('div',{class:'study stack'}, h('div',{class:'card',style:'text-align:center'}, h('div',{class:'eyebrow'},'Dictado terminado'), h('div',{class:'score '+(avg>=75?'pass':'fail')},avg+'%'), h('p',{class:'muted'}, 'Media de dictado y traducción. ', avg>=75?'Buen oído. Sube la velocidad de la voz en Ajustes para hacerlo más difícil.':'Por debajo del 85 %: vuelve a escuchar las frases falladas en voz alta, repitiéndolas tú también (shadowing).')), h('div',{class:'row'}, h('button',{class:'btn primary',onclick:()=>go('practica')},'Volver a Práctica')))); window.scrollTo(0,0); }
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
  el.append(h('div',{class:'study-head'}, h('button',{class:'btn sm ghost',onclick:()=>{ stopSpeak(); P.id=null; renderEscucha(); }},'← Textos'), h('span',{class:'sp'}), h('button',{class:'btn sm',onclick:()=>speakSeq(readingChunks(r))},'音 Todo / parar')));
  el.append(h('h1',{class:'jp'},r.title), h('div',{class:'muted small'},r.sub));
  el.append(h('div',{class:'card'}, h('div',{class:'eyebrow'},'Escucha por frases'), h('div',{class:'row',style:'margin-top:8px'}, sents.map((s,i)=>h('button',{class:'btn sm',onclick:()=>speak(s.j)},String(i+1))))));
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
// Escala propia de redacción (independiente del nivel de kanji): 10 grados, se sube con 3 redacciones corregidas dentro del rango con 85 % o más
const WRITING_GRADES = [null,{tier:'N5',r:[120,180]},{tier:'N5',r:[180,260]},{tier:'N5',r:[260,350]},{tier:'N4',r:[350,450]},{tier:'N4',r:[450,600]},{tier:'N3',r:[600,750]},{tier:'N3',r:[750,900]},{tier:'N2',r:[900,1100]},{tier:'N2',r:[1100,1300]},{tier:'N1',r:[1300,1700]}];
const WR_NEED=3;
// Nota para aprobar: 80 en los grados 1 a 7 (N5–N3) y 85 en los grados 8 a 10 (N2–N1)
const writingPass=g=>g>=8?85:80;
// El grado se calcula con lo que hay guardado: grado de partida (test de nivel) + subidas ganadas con las redacciones que existen ahora
function writingBase(){ if(S.wgradeBase!=null) return S.wgradeBase; const g=S.wgrade||1; S.wgradeBase=(g>1&&!S.wgradeAt)?Math.min(3,g):1; return S.wgradeBase; }
function writingPassAt(g){ return (S.writings||[]).filter(w=>w.grade===g&&w.score!=null&&w.score>=writingPass(g)&&jaLen(w.text)>=WRITING_GRADES[g].r[0]).length; }
function writingGrade(){ let g=Math.max(1,Math.min(10,writingBase())); while(g<10&&writingPassAt(g)>=WR_NEED) g++; return g; }
function chooseWritingGrade(){
  const sel=h('select',{}, WRITING_GRADES.map((g,i)=>i?h('option',{value:i,selected:i===writingGrade()},`Grado ${i} · ${g.tier} · ${g.r[0]} a ${g.r[1]} caracteres`):null));
  let close; close=overlay([h('h3',{},'Grado de redacción'), h('div',{class:'small muted'},'Es el grado desde el que empiezas. Sube solo al tener 3 redacciones del grado con la nota de aprobado (80 en los grados 1 a 7, 85 del 8 al 10), y baja si las borras.'), sel, h('div',{class:'row'}, h('button',{class:'btn',onclick:()=>close()},'Cancelar'), h('span',{class:'sp'}), h('button',{class:'btn primary',onclick:()=>{ const n=Number(sel.value); S.wgradeBase=n; S.wgrade=n; S.wgradeAt=now(); S.settingsAt=now(); save(); close(); toast('Grado '+n); renderPractica(); }},'Aplicar'))]);
}
function writingRange(){ return WRITING_GRADES[writingGrade()].r; }
function writingMin(){ return writingRange()[0]; }
// Redacciones que cuentan para subir: del grado actual, corregidas, con nota suficiente y longitud dentro del rango
function writingPassCount(){ return writingPassAt(writingGrade()); }
function writingPromote(){ const g=writingGrade(), before=S.wgrade||1; S.wgrade=g; if(g>before){ S.wgradeAt=now(); save(); return true; } return false; }
function writingLowStreak(){ const g=writingGrade(); const last=(S.writings||[]).filter(w=>w.grade===g&&w.score!=null).slice(-2); return last.length===2&&last.every(w=>w.score<60); }
function pickTopic(repeat){ const g=writingGrade(); const tier=WRITING_GRADES[g].tier; const pool=WRITING_TOPICS[tier].map(x=>({...x,tier})); const ws=(S.writings||[]); const recent=ws.slice(-6).map(w=>w.topic.t); let pick1; if(repeat&&writingLowStreak()) pick1=pool.find(x=>x.t===ws[ws.length-1].topic.t)||rnd(pool); else { const fresh=pool.filter(x=>!recent.includes(x.t)); pick1=rnd(fresh.length?fresh:pool); } const gs=shuffle(learnedKeys().map(k=>ITEMS.get(k)).filter(i=>i.kind==='g')).slice(0,2).map(g=>g.t); const [mn,mx]=writingRange(); return {...pick1, use:gs, min:mn, max:mx, grade:g}; }
function renderRedaccion(){
  const P=PRACT, el=$('#main'); el.innerHTML=''; const tp=P.topic;
  el.append(h('div',{class:'topline'}, h('button',{class:'btn sm ghost',onclick:()=>{ PRACT={mode:null}; renderPractica(); }},'← Práctica'), h('h1',{},'Redacción'), h('button',{class:'btn sm',onclick:()=>{ PRACT={mode:'redaccion',topic:pickTopic(),text:'',result:null}; renderPractica(); }},'Otro tema')));
  el.append(h('div',{class:'card stack'}, h('div',{class:'eyebrow'},`Tema · ${tp.tier||''} · grado ${tp.grade||writingGrade()} · entre ${tp.min} y ${tp.max||Math.round(tp.min*1.4)} caracteres`), h('h2',{},tp.t), h('p',{class:'small',style:'margin:0'},tp.d), tp.use&&tp.use.length?h('div',{class:'small muted'},'Usa: ', tp.use.map(t=>h('span',{class:'pill g jp',style:'margin:2px'},t))):null));
  const counter=h('span',{class:'num small muted'});
  const ta=h('textarea',{id:'wr-text',lang:'ja',placeholder:'Escribe aquí en japonés con tu teclado japonés (kanji y kana). Sin límite máximo.',style:'min-height:220px;font-family:var(--f-jp);font-size:1.1rem'}); ta.value=P.text||'';
  const upd=()=>{ const n=jaLen(ta.value), mx=tp.max||Math.round(tp.min*1.4); counter.textContent=`${n} caracteres · entre ${tp.min} y ${mx}`+(n>mx?' (te has pasado; no pasa nada, pero sé conciso)':''); counter.style.color=n<tp.min?'var(--muted)':n>mx?'var(--warn)':'var(--ok)'; btn.disabled=n<tp.min; saveBtn.disabled=n<Math.floor(tp.min/2); P.text=ta.value; }; ta.addEventListener('input',upd);
  const status=h('div',{class:'small muted'});
  const btn=h('button',{class:'btn primary',onclick:async()=>{ if(!sb||!USER){ status.textContent='Inicia sesión para corregir.'; return; } btn.disabled=true; status.textContent='Corrigiendo (30 a 60 segundos)…'; const prev=P.result&&typeof P.result.score==='number'&&P.text===ta.value?P.result.score:null; try{ const r=await callFunction('write',{text:ta.value,topic:tp.t+'. '+tp.d,level:tierOf(S.level).n,use:tp.use||[],min:tp.min,max:tp.max}); if(!r||typeof r.score!=='number') throw new Error('respuesta incompleta'); if(prev!=null) r.prev=prev; P.text=ta.value; P.result=r; saveWriting(P,r); status.textContent=''; if(writingPromote()) toast(`Subes al grado ${writingGrade()} de redacción: ahora entre ${writingRange()[0]} y ${writingRange()[1]} caracteres`); renderPractica(); }catch(e){ status.textContent='No se pudo corregir: '+(e.message||e); btn.disabled=false; } }},'Corregir');
  const saveBtn=h('button',{class:'btn',onclick:()=>{ saveWriting(P,null); toast('Guardada sin corregir'); PRACT={mode:null}; renderPractica(); }},'Guardar sin corregir');
  el.append(h('div',{class:'card stack',style:'margin-top:12px'}, ta, h('div',{class:'row'}, counter, h('span',{class:'sp'}), saveBtn, btn), status)); upd();
  const r=P.result; if (r){
    const box=h('div',{class:'card stack',style:'margin-top:12px'}, h('div',{class:'row between'}, h('h3',{},'Corrección'), h('span',{class:'score '+(r.score>=70?'pass':'fail'),style:'font-size:1.6rem'},r.score+'%')), r.cached?h('div',{class:'small muted'},r.system?'Este texto es una versión corregida por la app.':'Resultado guardado: el mismo texto siempre recibe la misma nota.'):null, r.breakdown?h('div',{class:'small muted'},`Errores: ${(r.breakdown.errors[3]||0)} graves · ${(r.breakdown.errors[2]||0)} medios · ${(r.breakdown.errors[1]||0)} leves`+(r.breakdown.lengthPenalty?` · longitud −${r.breakdown.lengthPenalty}`:'')+(r.breakdown.topicPenalty?` · tema −${r.breakdown.topicPenalty}`:'')+(r.breakdown.structPenalty?` · estructuras pedidas −${r.breakdown.structPenalty}`:'')):null, r.prev!=null?h('div',{class:'small muted'},`Corrección anterior de este mismo texto: ${r.prev} %`):null, r.comment?h('p',{style:'margin:0'},r.comment):null);
    const errCard=(e,tip)=>h('div',{class:'wr-err'+(tip?' tip':'')}, e.orig?h('div',{class:'o jp'},e.orig):null, e.fix?h('div',{class:'f jp'},(e.orig?'→ ':'')+e.fix):null, e.why?h('div',{class:'w small'},e.why):null);
    if (Array.isArray(r.errors)&&r.errors.length){ box.append(h('div',{class:'eyebrow'},'Errores'), h('div',{class:'stack',style:'gap:8px'}, r.errors.map(e=>errCard(e,false)))); box.append(studyLinks(r.errors)); }
    else box.append(h('div',{class:'small muted'},'Sin errores señalados.'));
    if (Array.isArray(r.tips)&&r.tips.length) box.append(h('details',{class:'gs-more',open:true}, h('summary',{},`Sugerencias, no restan nota (${r.tips.length})`), h('div',{class:'stack',style:'gap:8px;margin-top:8px'}, r.tips.map(e=>errCard(e,true)))));
    if (r.corrected) box.append(h('div',{}, h('div',{class:'eyebrow'},'Versión natural'), h('div',{class:'jp',style:'margin-top:6px;line-height:2;white-space:pre-wrap'},r.corrected), h('div',{class:'row',style:'margin-top:6px'}, spkBtn(r.corrected))));
    if (r.level) box.append(h('div',{class:'small muted'},'Nivel estimado de este texto: '+r.level));
    box.append(h('div',{class:'row',style:'justify-content:flex-end'}, (()=>{ const rec=(S.writings||[]).find(w=>w.topic.t===P.topic.t&&w.text===P.text); return rec?h('button',{class:'btn sm ghost',onclick:()=>deleteWriting(rec)},'Borrar redacción'):null; })(), reportBtn('w|'+(P.topic&&P.topic.t||'redaccion'), 'Corrección de redacción: '+((P.topic&&P.topic.t)||''))));
    el.append(box);
  }
}
// Dónde estudiar lo que ha fallado: punto de la app (si existe) y recursos externos por tema
function studyLinks(errors){
  const normT=s=>String(s||'').replace(/（[^）]*）|\([^)]*\)/g,'').replace(/[〜～\s()（）・、。\-ー]/g,'').toLowerCase();
  const seen=new Set(); const rows=[];
  for (const e of errors){ const pt=e.point; if(!pt||seen.has(pt)) continue; seen.add(pt); rows.push({pt,kind:e.kind||'gramatica'}); }
  if(!rows.length) return null;
  const box=h('div',{}, h('div',{class:'eyebrow'},'Dónde estudiar lo que has fallado'));
  const list=h('div',{class:'stack',style:'margin-top:6px'});
  rows.slice(0,8).forEach(({pt,kind})=>{
    const a=(href,t)=>h('a',{href,target:'_blank',rel:'noopener'},t);
    if (kind==='gramatica'){
      const own=[...ITEMS.values()].find(i=>i.kind==='g'&&(normT(i.t)===normT(pt)||normT(i.t).includes(normT(pt))||(normT(pt).length>=3&&normT(pt).includes(normT(i.t)))));
      list.append(h('div',{class:'row small',style:'align-items:center'}, h('b',{class:'jp'},pt), own?h('button',{class:'pill g jp',title:'Ver el punto en la app',onclick:()=>itemSheet(own)},'En la app: '+own.t):null,
        a('https://bunpro.jp/grammar_points?search='+encodeURIComponent(pt),'Bunpro'), a('https://jlptsensei.com/?s='+encodeURIComponent(pt),'JLPT Sensei')));
    } else {
      list.append(h('div',{class:'row small',style:'align-items:center'}, h('b',{class:'jp'},pt), a('https://jisho.org/search/'+encodeURIComponent(pt),'Jisho'), a('https://www.google.com/search?q='+encodeURIComponent(pt+' japonés'),'Buscar')));
    }
  });
  box.append(list);
  return box;
}
function saveWriting(P,r){ S.writings=S.writings||[]; const rec={date:now(),topic:P.topic,grade:P.topic.grade||writingGrade(),text:P.text,score:r?r.score:null,result:r?{score:r.score,breakdown:r.breakdown||null,prev:r.prev==null?undefined:r.prev,comment:r.comment||'',errors:(r.errors||[]).slice(0,30).map(e=>({orig:e.orig||'',fix:e.fix||'',why:e.why||'',kind:e.kind||'',point:e.point||''})),tips:(r.tips||[]).slice(0,20).map(e=>({orig:e.orig||'',fix:e.fix||'',why:e.why||''})),corrected:r.corrected||'',level:r.level||''}:null}; const i=S.writings.findIndex(w=>w.topic.t===P.topic.t&&w.text===P.text); if(i>=0) S.writings[i]=rec; else S.writings.push(rec); if(S.writings.length>50) S.writings=S.writings.slice(-50); if(!P.saved) bump('wr'); P.saved=true; save(); }

// ===================== Guía de uso =====================
function renderGuia(){
  const el=$('#main'); el.innerHTML='';
  el.append(h('div',{class:'topline'}, h('button',{class:'btn sm ghost',onclick:()=>go('ajustes')},'← Ajustes'), h('h1',{},'Guía de uso')));
  const a=(href,t)=>h('a',{href,target:'_blank',rel:'noopener'},t);
  const sec=(title,...kids)=>h('details',{class:'sec'}, h('summary',{},title), h('div',{class:'stack small'}, ...kids));
  const ul=(...items)=>h('ul',{style:'padding-left:18px;margin:0;display:flex;flex-direction:column;gap:6px'}, items.map(i=>h('li',{},i)));
  el.append(h('div',{class:'card'},
    sec('El camino',
      ul('Dojo es un lugar para recorrer un camino con disciplina, pero cada uno lo recorre a su ritmo: no es una carrera.',
         'En Camino ves tu sendero de piedras: cada tramo es contenido que ya dominas (Gurú o más), y el musgo crece con lo que has quemado.',
         'Tu sello es uno de los kanji que has aprendido, a tu elección. El cuaderno guarda los momentos importantes.')),
    sec('Cómo se estudia',
      ul('Cada día: primero los repasos, después las lecciones nuevas. Con más de 150 repasos pendientes las lecciones se bloquean.',
         'El SRS tiene 9 etapas: 4 h, 8 h, 1 día, 2 días, 1 semana, 2 semanas, 1 mes, 4 meses y quemado. Fallar baja una etapa, o dos si ya estabas en Gurú o más.',
         'El ritmo se adapta solo (Retomar, Paso tranquilo, Paso firme, Paso largo) sin pasar del techo que fijes en Ajustes. Con «Ritmo fijo» se desactiva la adaptación.',
         'En Camino fijas tu compromiso semanal, de 2 a 7 días. No hay castigo si un día no puedes: la constancia se mide en semanas y en días practicados, no en rachas.',
         'Kanji y vocabulario cuentan aparte de la gramática, cada uno con su objetivo diario. Una palabra se desbloquea cuando sus kanji llegan a Gurú.')),
    sec('Lecciones',
      ul('Cada lección son 5 ítems de kanji o vocabulario, o 3 puntos de gramática, seguidos de un test corto.',
         '«Ya lo sé» quema el ítem (no vuelve a salir) y entra el siguiente disponible.',
         'En la lista del nivel, los ítems opacos están sin aprender y los que tienen borde verde están en Gurú o más. Pulsa uno para ver su ficha.')),
    sec('Repasos',
      ul('Kanji: significado y lectura. Vocabulario: significado y español → japonés eligiendo el kanji (tu punto débil). Gramática: frase con hueco. Un fallo en cualquier pregunta cuenta como fallo del ítem.',
         'Al acertar solo ves una línea y pasa a la siguiente (Enter para ir más rápido). Las fichas de todo lo repasado se ven al final.',
         'Si escribes una palabra válida pero distinta de la buscada, te avisa y vuelves a intentarlo sin penalización. «Mi palabra también era válida» la guarda para ese ítem.',
         '«Sesión de 5 minutos» repasa solo los 12 más antiguos. «Solo sanguijuelas» y «Entrenar producción» son refuerzo: no cambian la etapa SRS.',
         'Romaji → kana: nn + vocal da んな (annai → あんない); n\' separa (sen\'en → せんえん).')),
    sec('Exámenes',
      ul('Revisión semanal (unos 30 min): si se queda pendiente, las lecciones siguen abiertas pero a medio ritmo hasta que la hagas.',
         'De nivel: hace falta un 80 % para subir al siguiente. Simulacro JLPT: unas 70 preguntas, 60 min, sin ayudas.',
         'Frases nuevas: preguntas escritas al momento con lo que has aprendido, con frases que nunca viste. Se activa con 30 palabras y 8 puntos de gramática.',
         'Los fallos bajan un nivel SRS y vuelven a repasos. En las frases libres puede haber más de una traducción correcta: «Era válida» la cuenta como acierto, y «Comprobar» la revisa.')),
    sec('Preguntas y respuestas válidas',
      ul('Cada ítem tiene varias preguntas: kanji (significado y lectura), vocabulario (significado, lectura y español→japonés) y gramática (frase con hueco). Fallar una cuenta como fallo del ítem.',
         'Si tu respuesta era buena y la app la marca mal, pulsa «Mi respuesta también era válida»: cuenta como acierto y queda anotada en el Glosario (Ajustes), donde puedes quitarla.',
         'Si tu cuenta tiene permiso de edición, lo que anotas se comparte con todos; si no, se guarda solo en tu cuenta.')),
    sec('Cómo se corrige una redacción',
      ul('La IA propone errores en dos análisis independientes y un tercer paso los confirma o los descarta; solo cuentan los confirmados. Lo que es estilo, hiragana por kanji o puntuación latina no cuenta.',
         'La nota sale de una fórmula fija, no de una impresión: depende de cuántos errores hay (graves, medios y leves) respecto a la longitud del texto, de si cumple el tema y de si usas las estructuras pedidas.',
         'El mismo texto recibe siempre la misma corrección y la misma nota. La versión corregida que te devuelve la app puntúa 100.',
         'Si cambias aunque sea un carácter del texto, se vuelve a analizar y la nota puede variar unos puntos: una IA no es un examinador perfecto.')),
    sec('Escritura a mano',
      ul('En Práctica → Escritura a mano dibujas con el dedo (o el ratón) un kanji de memoria. Los kanji salen de los que ya has empezado a aprender, empezando por los que más tiempo llevan sin practicarse o los que más fallas.',
         '«Ver modelo» muestra el kanji con el orden de los trazos numerado y animado, y compara cuántos trazos has hecho. Después te evalúas tú: «Lo escribí bien» o «Necesito repetirlo». «Calcar» deja una guía tenue mientras dibujas.',
         'La app no puede juzgar por sí sola si tu trazo es correcto, así que la comparación visual la haces tú. Los datos de trazos son de KanjiVG (Ulrich Apel, CC BY-SA 3.0, kanjivg.tagaini.net).')),
    sec('Test de nivel',
      ul('Unas 30 preguntas de vocabulario y kanji, gramática, lectura, escucha, producción y una redacción corta (si has iniciado sesión).',
         'Se adapta a ti: si aciertas, la siguiente es más difícil; si fallas, más fácil. «No sé» cuenta como fallo, mejor que adivinar.',
         'El resultado es un perfil por destreza y un nivel de partida. Al aplicarlo, lo que está claramente por debajo de tu nivel se marca como conocido (Gurú I) y vuelve en repasos espaciados.',
         'Puedes repetirlo cuando quieras; se guardan los últimos resultados.')),
    sec('Lectura',
      ul('Las lecturas se abren en orden: termina una (responde sus preguntas) para pasar a la siguiente.',
         'Lee primero sin furigana y toca una palabra solo cuando te atasques. Después responde las preguntas, igual que el 読解 del JLPT.',
         'Importar texto convierte cualquier texto japonés en una lectura con furigana, glosario, traducción y preguntas.')),
    sec('Práctica: escucha y escritura',
      ul('Dictado: oyes una frase sin verla, la escribes en kana (se corrige carácter a carácter) y después la traduces al español.',
         'Comprensión auditiva: una lectura entera con el texto oculto; respondes las preguntas solo con el oído.',
         'Redacción: 10 grados, de 120 a 1700 caracteres. Se sube con 3 redacciones corregidas, dentro del rango, con 85 % o más. Tras cada corrección ves dónde estudiar lo que fallaste.')),
    sec('Ajustes y cuentas',
      ul('WaniKani: guarda tu token y sincroniza; lo que tengas empezado allí entra con la misma etapa SRS. Nunca baja lo que ya tienes aquí.',
         'Bunpro: su API pública no funciona; marca lo que dominas en «Gramática que ya dominas» (entra como Gurú I y sigue en repasos).',
         'Voz: la del navegador depende del sistema. La neuronal de Google suena más natural y necesita su clave en el servidor.',
         'Notificaciones: avisan de repasos acumulados, del examen semanal y si a última hora no has estudiado. En iPhone hace falta añadir la app a la pantalla de inicio.',
         'Cuentas autorizadas (solo administrador): quien no esté en la lista puede iniciar sesión pero no accede a nada.')),
    sec('Recursos gratuitos',
      ul(h('span',{}, a('https://www.jlpt.jp/e/samples/forlearners.html','JLPT, preguntas de muestra'), ' con audio de cada nivel.'),
         h('span',{}, a('https://www3.nhk.or.jp/news/easy/','NHK News Web Easy'), ': noticias con audio y furigana; pega el texto en Lectura.'),
         h('span',{}, a('https://tadoku.org/japanese/en/free-books-en/','Tadoku'), ': libros graduados gratis.'),
         h('span',{}, a('https://www.erin.jpf.go.jp/','Erin\'s Challenge'), ': vídeos con diálogos reales, N5 a N4.'),
         h('span',{}, a('https://www.guidetojapanese.org/spanish/','Guía de Tae Kim'), ' y ', a('https://hablajapones.org/','Habla Japonés'), ': gramática en español.'),
         h('span',{}, a('https://langcorrect.com/','LangCorrect'), ' y ', a('https://hinative.com/','HiNative'), ': correcciones de nativos.')))));
}
