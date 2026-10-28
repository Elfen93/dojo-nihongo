'use strict';
const CONFIG = Object.assign({SUPABASE_URL:'',SUPABASE_ANON_KEY:''}, window.DOJO_CONFIG||{});
// ===================== Utilidades =====================
const $ = (s, el=document) => el.querySelector(s);
const h = (tag, attrs={}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs||{})) {
    if (k==='class') el.className = v;
    else if (k==='html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v===false||v==null) {}
    else el.setAttribute(k, v===true?'':v);
  }
  for (const kid of kids.flat()) if (kid!=null && kid!==false) el.append(kid.nodeType?kid:document.createTextNode(String(kid)));
  return el;
};
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle = a => { a=a.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const pick = (a,n) => shuffle(a).slice(0,n);
const rnd = a => a[Math.floor(Math.random()*a.length)];
const uniq = a => [...new Set(a)];
const now = () => Date.now();
const H = 3600e3, D = 24*H;
const todayKey = (t=new Date()) => t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');
const fmtDate = ts => new Date(ts).toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'});
const fmtRel = ts => { const d=ts-now(); if (d<=0) return 'ahora'; if (d<H) return Math.ceil(d/6e4)+' min'; if (d<D) return Math.round(d/H)+' h'; return Math.round(d/D)+' d'; };
const fmtAgo = ts => { const d=now()-ts; if (d<6e4) return 'ahora mismo'; if (d<H) return 'hace '+Math.round(d/6e4)+' min'; if (d<D) return 'hace '+Math.round(d/H)+' h'; return 'hace '+Math.round(d/D)+' d'; };
const plural = (n,s,p) => n===1?s:(p||s+'s');
let toastT; function toast(msg){ const t=$('#toast'); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,2600); }
const VOICE_PREF=[/Nanami/i,/O-?ren/i,/Kyoko/i,/Google 日本語/i,/Google.*ja/i,/Natural/i,/Online/i,/ja[-_]JP/i,/ja/i];
function jaVoices(){ try{ return speechSynthesis.getVoices().filter(v=>/^ja/i.test(v.lang)); }catch(e){ return []; } }
function bestVoice(){ const vs=jaVoices(); if(!vs.length) return null; const want=S&&S.settings&&S.settings.voice; if(want){ const v=vs.find(x=>x.name===want); if(v) return v; } for(const re of VOICE_PREF){ const v=vs.find(x=>re.test(x.name)); if(v) return v; } return vs[0]; }
const TTS_CACHE=new Map(); let ttsAudio=null, speaking=false;
function stopSpeak(){ try{ if(ttsAudio){ ttsAudio.pause(); ttsAudio=null; } }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} setSpeaking(false); }
function setSpeaking(on){ speaking=on; }
async function speak(text){
  if (speaking){ stopSpeak(); return; }
  stopSpeak();
  if (S&&S.settings&&S.settings.neuralVoice && typeof sb!=='undefined' && sb && USER){
    try{
      let url=TTS_CACHE.get(text);
      if(!url){ const r=await callFunction('tts',{text}); if(!r||!r.audio) throw new Error(r&&r.error||'sin audio'); const bin=atob(r.audio); const u8=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i); url=URL.createObjectURL(new Blob([u8],{type:'audio/mpeg'})); if(TTS_CACHE.size>300){ const k=TTS_CACHE.keys().next().value; URL.revokeObjectURL(TTS_CACHE.get(k)); TTS_CACHE.delete(k); } TTS_CACHE.set(text,url); }
      ttsAudio=new Audio(url); ttsAudio.onended=()=>setSpeaking(false); ttsAudio.onerror=()=>setSpeaking(false); setSpeaking(true); await ttsAudio.play(); return;
    }catch(e){ console.warn('tts',e); if(!speak._warned){ speak._warned=true; toast('Voz neuronal no disponible; uso la voz del navegador'); } }
  }
  try{ if(!('speechSynthesis' in window)) return; const u=new SpeechSynthesisUtterance(text); u.lang='ja-JP'; u.rate=(S&&S.settings&&S.settings.voiceRate)||0.9; const v=bestVoice(); if(v) u.voice=v; u.onend=()=>setSpeaking(false); u.onerror=()=>setSpeaking(false); speechSynthesis.cancel(); setSpeaking(true); speechSynthesis.speak(u);}catch(e){ setSpeaking(false); }
}
const spkBtn = text => h('button',{class:'btn sm ghost',title:'Escuchar (pulsa otra vez para parar)',onclick:e=>{e.stopPropagation();speak(text);}},'音');

// ===================== Kana / romaji =====================
const kataToHira = s => s.replace(/[ァ-ヶ]/g, c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const hiraToKata = s => s.replace(/[ぁ-ゖ]/g, c=>String.fromCharCode(c.charCodeAt(0)+0x60));
const hasKanji = s => /[一-龯]/.test(s);
const isKana = s => /^[ぁ-ヿーー〜]+$/.test(s);
const ROMA = {
 a:'あ',i:'い',u:'う',e:'え',o:'お',
 ka:'か',ki:'き',ku:'く',ke:'け',ko:'こ',sa:'さ',shi:'し',si:'し',su:'す',se:'せ',so:'そ',
 ta:'た',chi:'ち',ti:'ち',tsu:'つ',tu:'つ',te:'て',to:'と',na:'な',ni:'に',nu:'ぬ',ne:'ね',no:'の',
 ha:'は',hi:'ひ',fu:'ふ',hu:'ふ',he:'へ',ho:'ほ',ma:'ま',mi:'み',mu:'む',me:'め',mo:'も',
 ya:'や',yu:'ゆ',yo:'よ',ra:'ら',ri:'り',ru:'る',re:'れ',ro:'ろ',wa:'わ',wo:'を',
 ga:'が',gi:'ぎ',gu:'ぐ',ge:'げ',go:'ご',za:'ざ',ji:'じ',zi:'じ',zu:'ず',ze:'ぜ',zo:'ぞ',
 da:'だ',di:'ぢ',du:'づ',de:'で',do:'ど',ba:'ば',bi:'び',bu:'ぶ',be:'べ',bo:'ぼ',pa:'ぱ',pi:'ぴ',pu:'ぷ',pe:'ぺ',po:'ぽ',
 kya:'きゃ',kyu:'きゅ',kyo:'きょ',sha:'しゃ',shu:'しゅ',sho:'しょ',sya:'しゃ',syu:'しゅ',syo:'しょ',
 cha:'ちゃ',chu:'ちゅ',cho:'ちょ',tya:'ちゃ',tyu:'ちゅ',tyo:'ちょ',nya:'にゃ',nyu:'にゅ',nyo:'にょ',
 hya:'ひゃ',hyu:'ひゅ',hyo:'ひょ',mya:'みゃ',myu:'みゅ',myo:'みょ',rya:'りゃ',ryu:'りゅ',ryo:'りょ',
 gya:'ぎゃ',gyu:'ぎゅ',gyo:'ぎょ',ja:'じゃ',ju:'じゅ',jo:'じょ',jya:'じゃ',jyu:'じゅ',jyo:'じょ',zya:'じゃ',zyu:'じゅ',zyo:'じょ',
 bya:'びゃ',byu:'びゅ',byo:'びょ',pya:'ぴゃ',pyu:'ぴゅ',pyo:'ぴょ',dya:'ぢゃ',dyu:'ぢゅ',dyo:'ぢょ',
 fa:'ふぁ',fi:'ふぃ',fe:'ふぇ',fo:'ふぉ',va:'ゔぁ',vi:'ゔぃ',ve:'ゔぇ',vo:'ゔぉ',vu:'ゔ',
 xa:'ぁ',xi:'ぃ',xu:'ぅ',xe:'ぇ',xo:'ぉ',xya:'ゃ',xyu:'ゅ',xyo:'ょ',xtu:'っ',xtsu:'っ',ltu:'っ',
 wi:'うぃ',we:'うぇ',she:'しぇ',che:'ちぇ',je:'じぇ',tsa:'つぁ',tse:'つぇ',tso:'つぉ',thi:'てぃ',dhi:'でぃ',dhu:'でゅ',thu:'てゅ',
 '-':'ー','~':'〜'
};
// Convierte romaji a hiragana dejando colas sin resolver, con las reglas de un IME japonés. final=true fuerza la n final.
function toKana(input, final=false){
  let s = input.toLowerCase(), out='', i=0;
  while (i<s.length){
    const c=s[i], n1=s[i+1], n2=s[i+2];
    if (!/[a-z\-~']/.test(c)) { out+=c; i++; continue; }
    if (c==="'") { i++; continue; }
    if (c==='n'){
      if (n1==="'") { out+='ん'; i+=2; continue; }
      // nn: ん, y la segunda n abre la sílaba siguiente si viene una vocal (annai → あんない); ante consonante o al final, solo ん
      if (n1==='n'){ if (n2===undefined){ if (final){ out+='ん'; i+=2; continue; } out+='nn'; break; } out+='ん'; i+=(/[aeiouy]/.test(n2)?1:2); continue; }
      // n + consonante (no vocal, no y) => ん
      if (n1!==undefined && /[a-z]/.test(n1) && !/[aeiouy]/.test(n1)) { out+='ん'; i++; continue; }
      if (n1===undefined && final) { out+='ん'; i++; continue; }
    }
    // tch => っち (matcha → まっちゃ); consonante doble => っ
    if (c==='t' && n1==='c' && n2==='h') { out+='っ'; i++; continue; }
    if (/[bcdfghjklmpqrstvwxz]/.test(c) && n1===c) { out+='っ'; i++; continue; }
    let matched=false;
    for (const len of [4,3,2,1]) {
      const seg=s.substr(i,len);
      if (seg.length===len && ROMA[seg]) { out+=ROMA[seg]; i+=len; matched=true; break; }
    }
    if (matched) continue;
    // sin coincidencia: ¿quedan letras que podrían completarse?
    const rest=s.slice(i);
    if (final) { if (rest==='n') { out+='ん'; i++; continue; } out+=rest[0]; i++; continue; }
    const couldComplete = Object.keys(ROMA).some(k=>k.startsWith(rest.slice(0,3)) && k.length>rest.length);
    if (couldComplete && rest.length<=3) { out+=rest; break; }
    out+=c; i++;
  }
  return out;
}
const normKana = s => kataToHira(String(s||'')).replace(/[\s・。、！？!?]/g,'').replace(/ー/g,'ー');
// Comparación de respuestas en español: sin tildes, sin artículos, tolerante a erratas
const stripAcc = s => s.normalize('NFD').replace(/[̀-ͯ]/g,'');
const NUM_ES={0:'cero',1:'uno',2:'dos',3:'tres',4:'cuatro',5:'cinco',6:'seis',7:'siete',8:'ocho',9:'nueve',10:'diez',11:'once',12:'doce',13:'trece',14:'catorce',15:'quince',16:'dieciseis',17:'diecisiete',18:'dieciocho',19:'diecinueve',20:'veinte',21:'veintiuno',22:'veintidos',23:'veintitres',24:'veinticuatro',25:'veinticinco',26:'veintiseis',27:'veintisiete',28:'veintiocho',29:'veintinueve',30:'treinta',31:'treinta y uno',40:'cuarenta',50:'cincuenta',60:'sesenta',70:'setenta',80:'ochenta',90:'noventa',100:'cien',1000:'mil',10000:'diez mil'};
function numToEs(s){ return String(s).replace(/\d+/g, d=>NUM_ES[+d]||d); }
function normEs(s){ s=numToEs(s).replace(/\buno\b/g,'un'); return stripAcc(String(s).toLowerCase()).replace(/\([^)]*\)/g,'').replace(/[¿?¡!.,;:"']/g,'').replace(/\b(el|la|los|las|un|una|unos|unas|de|del|al|a|ser|estar|hacer|algo|alguien)\b(?=\s+\S)/g,' ').replace(/\s+/g,' ').trim(); }
// Distancia de edición con transposición de letras vecinas ("comre" → "comer" cuenta como una sola errata)
function lev(a,b){ const m=a.length,n=b.length; if(!m) return n; if(!n) return m; let pp=null, prev=[...Array(n+1).keys()], cur=[]; for(let i=1;i<=m;i++){cur=[i]; for(let j=1;j<=n;j++){ cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1)); if(pp&&i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) cur[j]=Math.min(cur[j],pp[j-2]+1); } pp=prev; prev=cur;} return prev[n]; }
// Todos los significados exactos del catálogo: una errata nunca debe convertir la respuesta en el significado de OTRO ítem
let MEANING_SET=null;
function meaningSet(){ if(!MEANING_SET){ MEANING_SET=new Set(); if(typeof ITEMS!=='undefined') for(const it of ITEMS.values()){ for(const m of (it.m||[])){ const mm=normEs(m); if(!mm) continue; MEANING_SET.add(mm); for(const part of mm.split(/\s*\/\s*|\s+o\s+/)) if(part) MEANING_SET.add(part); } } } return MEANING_SET; }
function matchEs(answer, meanings){
  const a=normEs(answer); if(!a) return false;
  const own=new Set(), norms=[];
  for (const m of meanings){ const mm=normEs(m); if(!mm) continue; norms.push(mm); own.add(mm); for (const part of mm.split(/\s*\/\s*|\s+o\s+/)) if(part) own.add(part); }
  if (own.has(a)) return true;
  for (const mm of own) if (a===mm+'s'||a===mm+'es'||a+'s'===mm||a+'es'===mm) return true; // singular / plural
  if (meaningSet().has(a)) return false; // es, exactamente, el significado de otra palabra: no vale como errata
  for (const mm of norms){
    const tol = mm.length>=7?2:(mm.length>=5?1:0);
    if (tol && lev(a,mm)<=tol) return true;
    // acepta si la respuesta coincide (con una errata) con una de las alternativas separadas por '/'
    for (const part of mm.split(/\s*\/\s*|\s+o\s+/)) if (part && part.length>=5 && lev(a,part)<=1) return true;
  }
  return false;
}
function matchKana(answer, accepted){ const a=normKana(toKana(answer,true)); return accepted.some(x=>normKana(x)===a); }
