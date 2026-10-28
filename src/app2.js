// ===================== Datos y currículo =====================
const TIERS = [ {n:'N5',from:1,to:3}, {n:'N4',from:4,to:13}, {n:'N3',from:14,to:33}, {n:'N2',from:34,to:53}, {n:'N1',from:54,to:103} ];
const MAX_LEVEL = 103;
const tierOf = lv => TIERS.find(t=>lv>=t.from&&lv<=t.to) || TIERS[TIERS.length-1];
const tierByName = n => TIERS.find(t=>t.n===n);

// Catálogo: ítems integrados (N5/N4) + esqueleto N3–N1 (completado por generación)
const KANJI_ALL = [...KANJI, ...KANJI_N4].filter(k=>k.lv>0);
const VOCAB_ALL = [...VOCAB_N5, ...VOCAB_N4A, ...VOCAB_N4B].filter(v=>v.lv>0);
const GRAMMAR_ALL = [...GRAMMAR_N5, ...GRAMMAR_N4A, ...GRAMMAR_N4B, ...(typeof GRAMMAR_EXTRA!=='undefined'?GRAMMAR_EXTRA:[])];
// Reparto del esqueleto en niveles
(function assignRoadmap(){
  for (const t of ['N3','N2','N1']){
    const tier=tierByName(t), nlv=tier.to-tier.from+1;
    const ks=ROADMAP_KANJI[t]||[], gs=ROADMAP[t].grammar||[];
    ROADMAP[t].kanjiByLevel={}; ROADMAP[t].grammarByLevel={};
    ks.forEach((k,i)=>{ const lv=tier.from+Math.min(nlv-1,Math.floor(i/Math.ceil(ks.length/nlv))); (ROADMAP[t].kanjiByLevel[lv]=ROADMAP[t].kanjiByLevel[lv]||[]).push(k); });
    gs.forEach((g,i)=>{ const lv=tier.from+Math.min(nlv-1,Math.floor(i/Math.ceil(gs.length/nlv))); (ROADMAP[t].grammarByLevel[lv]=ROADMAP[t].grammarByLevel[lv]||[]).push(g); });
  }
})();
const keyOf = it => it.kind==='k' ? 'k|'+it.k : it.kind==='v' ? 'v|'+it.w+'|'+it.r : 'g|'+it.id;
const ITEMS = new Map(); // key -> item
function registerItems(ks, vs, gs){
  for (const k of ks){ const it={...k,kind:'k'}; ITEMS.set(keyOf(it),it); }
  for (const v of vs){ const it={...v,kind:'v'}; ITEMS.set(keyOf(it),it); }
  for (const g of gs){ const it={...g,kind:'g'}; ITEMS.set(keyOf(it),it); }
}
registerItems(KANJI_ALL, VOCAB_ALL, GRAMMAR_ALL);
const itemsOfLevel = lv => [...ITEMS.values()].filter(i=>i.lv===lv);
const KANJI_META = Object.fromEntries(KANJI_ALL.map(k=>[k.k,k]));
const VOCAB_BY_WORD = {}; for (const v of VOCAB_ALL) (VOCAB_BY_WORD[v.w]=VOCAB_BY_WORD[v.w]||[]).push(v);
// Vocabulario que contiene un kanji
const vocabWithKanji = k => VOCAB_ALL.filter(v=>v.w.includes(k));
function isGenerated(lv){ return lv>=14; }
function levelHasContent(lv){ return lv<14 || !!(S.gen && S.gen[lv]); }

// ===================== SRS =====================
const STAGE_HOURS = [0, 4, 8, 24, 48, 24*7, 24*14, 24*30, 24*120, Infinity];
const STAGE_NAMES = ['Nuevo','Aprendiz I','Aprendiz II','Aprendiz III','Aprendiz IV','Gurú I','Gurú II','Maestro','Iluminado','Quemado'];
const stageGroup = s => s<=0?'nuevo':s<=4?'aprendiz':s<=6?'guru':s===7?'maestro':s===8?'iluminado':'quemado';
function srsAnswer(rec, correct, wrongCount=1){
  if (correct) { rec.s=Math.min(9,rec.s+1); rec.c=(rec.c||0)+1; }
  else { const pen = rec.s>=5 ? 2*Math.ceil(wrongCount/2) : Math.ceil(wrongCount/2); rec.s=Math.max(1,rec.s-pen); rec.w=(rec.w||0)+wrongCount; }
  rec.due = rec.s>=9 ? Infinity : now()+STAGE_HOURS[rec.s]*H;
  rec.ls=now();
  return rec;
}
const isDue = rec => rec && rec.s>0 && rec.s<9 && rec.due<=now();
const dueItems = () => Object.entries(S.items).filter(([k,r])=>isDue(r)&&ITEMS.has(k)).map(([k])=>ITEMS.get(k));
const learnedKeys = () => Object.keys(S.items).filter(k=>S.items[k].s>0 && ITEMS.has(k));
const leechScore = r => (r.w||0) - (r.c||0)*0.5;

// ===================== Estado y persistencia (Supabase) =====================
const DEFAULT_STATE = () => ({
  v:1, updated:0, created:now(), items:{}, level:1, exams:[], levelPass:{}, weekly:{last:0}, readings:{}, days:{}, gen:{},
  settings:{ target:'2026-12-06', goalLessons:10, goalGrammar:2, examDay:0, strict:false, furigana:false, maxReviews:100, name:'', targetTier:'N4', wkToken:'', bpKey:'' },
  sync:{}, log:[]
});
let S = DEFAULT_STATE();
let sb=null, USER=null, saveT=null, remoteBusy=false, pendingSave=false;
function loadLocal(){ try{ const raw=localStorage.getItem('dojo.state'); if(raw){ const o=JSON.parse(raw); S={...DEFAULT_STATE(),...o,settings:{...DEFAULT_STATE().settings,...(o.settings||{})}}; } }catch(e){} }
function saveLocal(){ try{ localStorage.setItem('dojo.state', JSON.stringify(S)); }catch(e){} }
function save(){ S.updated=now(); saveLocal(); clearTimeout(saveT); saveT=setTimeout(saveRemote, 1000); }
async function saveRemote(){
  if(!sb||!USER) return; if(remoteBusy){ pendingSave=true; return; }
  remoteBusy=true; try{ const {gen,...rest}=S; const {error}=await sb.from('progress').upsert({user_id:USER.id, state:rest, updated_at:new Date(S.updated).toISOString()}); if(error) throw error; setSyncLabel('Guardado en tu cuenta · '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})); }
  catch(e){ console.warn('save',e); setSyncLabel('Error al guardar en la cuenta: '+(e.message||e)); }
  remoteBusy=false; if(pendingSave){ pendingSave=false; saveRemote(); }
}
function mergeRemote(remote){
  if (!remote||typeof remote!=='object') return;
  const L=S, R=remote, M={...DEFAULT_STATE(), ...L};
  // ítems: gana el registro visto más recientemente; a igualdad, el de etapa mayor
  M.items={...(L.items||{})};
  for (const [k,r] of Object.entries(R.items||{})){ const l=M.items[k]; if(!l) { M.items[k]=r; continue; } const lt=l.ls||l.lrn||0, rt=r.ls||r.lrn||0; if (rt>lt || (rt===lt && (r.s||0)>(l.s||0))) M.items[k]=r; }
  // ajustes: los modificados más recientemente
  M.settings = ((R.settingsAt||0) > (L.settingsAt||0)) ? {...DEFAULT_STATE().settings, ...(R.settings||{})} : {...DEFAULT_STATE().settings, ...(L.settings||{})};
  M.settingsAt = Math.max(R.settingsAt||0, L.settingsAt||0);
  // días: máximo por campo
  M.days={...(L.days||{})}; for (const [d,v] of Object.entries(R.days||{})){ const l=M.days[d]||{}; const o={...l}; for (const f of Object.keys({...l,...v})) o[f]=Math.max(l[f]||0, v[f]||0); M.days[d]=o; }
  // exámenes: unión por fecha
  const ex={}; [...(L.exams||[]),...(R.exams||[])].forEach(e=>{ ex[e.date]=e; }); M.exams=Object.values(ex).sort((a,b)=>a.date-b.date);
  M.level=Math.max(L.level||1, R.level||1); M.levelPass={...(R.levelPass||{}),...(L.levelPass||{})};
  M.weekly={last:Math.max((L.weekly||{}).last||0,(R.weekly||{}).last||0)};
  M.readings={...(R.readings||{})}; for (const [k,v] of Object.entries(L.readings||{})) if(!M.readings[k]||(v.date||0)>(M.readings[k].date||0)) M.readings[k]=v;
  M.sync = ((R.sync||{}).date||0) > ((L.sync||{}).date||0) ? R.sync : (L.sync||{});
  M.stats={...(L.stats||{})}; for (const [f,v] of Object.entries(R.stats||{})){ const l=M.stats[f]||{c:0,w:0}; M.stats[f]={c:Math.max(l.c||0,v.c||0), w:Math.max(l.w||0,v.w||0)}; }
  M.created=Math.min(L.created||now(), R.created||now()); M.gen=L.gen||{}; M.pace=null;
  const changedLocal = JSON.stringify({i:M.items,s:M.settings,d:M.days}) !== JSON.stringify({i:L.items,s:L.settings,d:L.days});
  S=M; updateStreak(); saveLocal();
  // si lo fusionado difiere de lo remoto, subimos la fusión
  if (JSON.stringify({i:M.items,s:M.settings,d:M.days,e:M.exams.length}) !== JSON.stringify({i:R.items||{},s:{...DEFAULT_STATE().settings,...(R.settings||{})},d:R.days||{},e:(R.exams||[]).length})) { S.updated=now(); saveRemote(); }
  return changedLocal;
}
async function initDb(){
  if (!window.supabase || !CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY){ AUTH_PENDING=false; setSyncLabel('Sin cuenta configurada: guardado solo aquí'); render(); return; }
  try{
    sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    const { data:{ session } } = await sb.auth.getSession();
    USER = session ? session.user : null; AUTH_PENDING=false;
    if (USER && !emailAllowed(USER)) { await sb.auth.signOut(); USER=null; toast('Esta cuenta no está autorizada'); }
    sb.auth.onAuthStateChange((ev, sess)=>{ const was=USER&&USER.id; USER=sess?sess.user:null; AUTH_PENDING=false; if(USER && !emailAllowed(USER)){ sb.auth.signOut(); USER=null; toast('Esta cuenta no está autorizada'); render(); return; } if(USER && USER.id!==was){ pullRemote().then(render); } if(!USER && ev==='SIGNED_OUT'){ render(); } });
    if (USER) await pullRemote(); else setSyncLabel('Sin sesión');
    render();
  }catch(e){ console.warn(e); AUTH_PENDING=false; setSyncLabel('Error de conexión'); render(); }
}
async function pullRemote(){
  if(!sb||!USER) return;
  try{
    const {data,error}=await sb.from('progress').select('state').eq('user_id',USER.id).maybeSingle(); if(error) throw error;
    if (data && data.state) mergeRemote(data.state); else { S.updated=now(); saveRemote(); }
    const g=await sb.from('gen_levels').select('lv,data').eq('user_id',USER.id); if(!g.error && g.data) for(const row of g.data){ S.gen[row.lv]=row.data; } registerGenerated();
    const ur=await sb.from('user_readings').select('id,data').eq('user_id',USER.id); if(!ur.error && ur.data){ for(const row of ur.data) USER_READINGS[row.id]=row.data; saveUserReadingsLocal(); }
    setSyncLabel('Sincronizado con tu cuenta');
  }catch(e){ console.warn(e); setSyncLabel('Sin conexión: guardado solo aquí'); }
}
async function saveGen(lv, data){ S.gen[lv]=data; try{ localStorage.setItem('dojo.gen.'+lv, JSON.stringify(data)); }catch(e){} if(sb&&USER){ try{ const {error}=await sb.from('gen_levels').upsert({user_id:USER.id, lv, data}); if(error) throw error; }catch(e){ console.warn(e); toast('El nivel se guardó solo en este dispositivo'); } } registerGenerated(); }
function loadGenLocal(){ for(let lv=14;lv<=MAX_LEVEL;lv++){ try{ const raw=localStorage.getItem('dojo.gen.'+lv); if(raw) S.gen[lv]=JSON.parse(raw);}catch(e){} } registerGenerated(); }
function registerGenerated(){ for (const lv of Object.keys(S.gen)){ const g=S.gen[lv]; if(!g) continue; registerItems((g.kanji||[]).map(k=>({...k,lv:+lv})), (g.vocab||[]).map(v=>({...v,lv:+lv})), (g.grammar||[]).map(x=>({...x,lv:+lv}))); } }
let syncLabel='…'; function setSyncLabel(t){ syncLabel=t; const el=$('#synclabel'); if(el) el.textContent=t; const el2=$('#synclabel2'); if(el2) el2.textContent=t; }
// Autenticación
async function signInEmail(email){ if(!sb) return toast('Cuenta no configurada'); const {error}=await sb.auth.signInWithOtp({email, options:{emailRedirectTo:location.origin+location.pathname}}); if(error) toast('Error: '+error.message); else toast('Te he enviado un enlace de acceso al correo'); }
async function signInGoogle(){ if(!sb) return toast('Cuenta no configurada'); const {error}=await sb.auth.signInWithOAuth({provider:'google', options:{redirectTo:location.origin+location.pathname}}); if(error) toast('Error: '+error.message); }
async function signOut(){ if(sb){ await sb.auth.signOut(); } USER=null; toast('Sesión cerrada'); render(); }
async function callFunction(name, body){
  if(!sb) throw new Error('Cuenta no configurada');
  const {data,error}=await sb.functions.invoke(name,{body}); if(error) throw new Error(error.message||'error'); return data;
}

// Registro diario
function day(k=todayKey()){ return S.days[k] = S.days[k] || {r:0,l:0,rd:0,ex:0,rc:0}; }
function bump(field, n=1){ const d=day(); d[field]=(d[field]||0)+n; updateStreak(); save(); }
function dayCounts(d){ return (d.r>=20||d.l>=5||d.ex>0||d.rd>0); }
function updateStreak(){
  const keys=Object.keys(S.days).filter(k=>dayCounts(S.days[k])).sort();
  let n=0; const t=new Date(); t.setHours(0,0,0,0);
  for (let i=0;i<400;i++){ const k=todayKey(new Date(t.getTime()-i*D)); if (S.days[k]&&dayCounts(S.days[k])) n++; else if (i===0) continue; else break; }
  S.streak=n;
}
function daysMissed(){ let m=0; const t=new Date(); t.setHours(0,0,0,0); for(let i=1;i<=30;i++){ const k=todayKey(new Date(t.getTime()-i*D)); if(S.days[k]&&dayCounts(S.days[k])) break; if(new Date(t.getTime()-i*D).getTime()<S.created) break; m++; } return m; }

// Lecturas importadas por el usuario
const USER_READINGS = {};
function loadUserReadingsLocal(){ try{ Object.assign(USER_READINGS, JSON.parse(localStorage.getItem('dojo.readings')||'{}')); }catch(e){} }
function saveUserReadingsLocal(){ try{ localStorage.setItem('dojo.readings', JSON.stringify(USER_READINGS)); }catch(e){} }
async function saveUserReading(r){ USER_READINGS[r.id]=r; saveUserReadingsLocal(); if(sb&&USER){ try{ const {error}=await sb.from('user_readings').upsert({user_id:USER.id,id:r.id,data:r}); if(error) throw error; }catch(e){ console.warn(e); toast('La lectura se guardó solo en este dispositivo'); } } }
async function deleteUserReading(id){ delete USER_READINGS[id]; saveUserReadingsLocal(); if(sb&&USER){ try{ await sb.from('user_readings').delete().eq('user_id',USER.id).eq('id',id); }catch(e){} } }
const allReadings = () => [...READINGS, ...Object.values(USER_READINGS)];
// Notificaciones push
async function pushStatus(){ if(!('serviceWorker' in navigator)||!('PushManager' in window)) return 'unsupported'; if(Notification.permission==='denied') return 'denied'; const reg=await navigator.serviceWorker.ready; const sub=await reg.pushManager.getSubscription(); return sub?'on':'off'; }
function b64ToU8(b){ const p='='.repeat((4-b.length%4)%4); const s=(b+p).replace(/-/g,'+').replace(/_/g,'/'); const r=atob(s); return Uint8Array.from([...r].map(c=>c.charCodeAt(0))); }
async function enablePush(){
  if(!sb||!USER){ toast('Inicia sesión primero'); return; }
  if(!CONFIG.VAPID_PUBLIC_KEY){ toast('Falta la clave VAPID en config.js'); return; }
  const perm=await Notification.requestPermission(); if(perm!=='granted'){ toast('Permiso denegado por el navegador'); return; }
  const reg=await navigator.serviceWorker.ready;
  const sub=await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64ToU8(CONFIG.VAPID_PUBLIC_KEY)});
  const {error}=await sb.from('push_subs').upsert({endpoint:sub.endpoint, user_id:USER.id, sub:sub.toJSON()}); if(error){ toast('No se pudo guardar la suscripción: '+error.message); return; }
  toast('Notificaciones activadas en este dispositivo');
}
async function disablePush(){ const reg=await navigator.serviceWorker.ready; const sub=await reg.pushManager.getSubscription(); if(sub){ if(sb&&USER) await sb.from('push_subs').delete().eq('endpoint',sub.endpoint); await sub.unsubscribe(); } toast('Notificaciones desactivadas'); }

function emailAllowed(u){ const list=(CONFIG.ALLOWED_EMAILS||[]).map(x=>String(x).toLowerCase()); if(!list.length) return true; return !!(u&&u.email&&list.includes(u.email.toLowerCase())); }
