// ===================== Datos y currículo =====================
const TIERS = [ {n:'N5',from:1,to:3}, {n:'N4',from:4,to:13}, {n:'N3',from:14,to:33}, {n:'N2',from:34,to:53}, {n:'N1',from:54,to:103} ];
const MAX_LEVEL = 103;
const tierOf = lv => TIERS.find(t=>lv>=t.from&&lv<=t.to) || TIERS[TIERS.length-1];
const tierByName = n => TIERS.find(t=>t.n===n);

// Catálogo: ítems integrados (N5/N4) + esqueleto N3–N1 (completado por generación)
const KANJI_ALL = [...KANJI, ...KANJI_N4, ...(typeof KANJI_N3!=='undefined'?KANJI_N3:[]), ...(typeof KANJI_N2!=='undefined'?KANJI_N2:[])].filter(k=>k.lv>0);
const VOCAB_ALL = [...VOCAB_N5, ...VOCAB_N4A, ...VOCAB_N4B, ...(typeof VOCAB_N3!=='undefined'?VOCAB_N3:[]), ...(typeof VOCAB_N2!=='undefined'?VOCAB_N2:[])].filter(v=>v.lv>0);
const GRAMMAR_ALL = [...GRAMMAR_N5, ...GRAMMAR_N4A, ...GRAMMAR_N4B, ...(typeof GRAMMAR_EXTRA!=='undefined'?GRAMMAR_EXTRA:[]), ...(typeof GRAMMAR_N3!=='undefined'?GRAMMAR_N3:[])];
// Reparto del esqueleto en niveles
(function assignRoadmap(){
  for (const t of ['N3','N2','N1']){
    const tier=tierByName(t), nlv=tier.to-tier.from+1;
    const normT=s=>String(s).replace(/（[^）]*）|\([^)]*\)/g,'').replace(/[〜～\s()（）・、。\-ー]/g,'').toLowerCase();
    const hand=new Set(GRAMMAR_ALL.flatMap(g=>g.t.split(/\s*\/\s*/).map(normT)));
    const handK=new Set(KANJI_ALL.map(k=>k.k)); const ks=(ROADMAP_KANJI[t]||[]).filter(k=>!handK.has(k.k)), gs=(ROADMAP[t].grammar||[]).filter(x=>!hand.has(normT(x))&&!hand.has(normT(x.replace(/\s*\(.*\)$/,''))));
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
  MEANING_SET=null;
}
registerItems(KANJI_ALL, VOCAB_ALL, GRAMMAR_ALL);
MEANING_SET=null;
const itemsOfLevel = lv => [...ITEMS.values()].filter(i=>i.lv===lv);
const KANJI_META = Object.fromEntries(KANJI_ALL.map(k=>[k.k,k]));
const VOCAB_BY_WORD = {}; for (const v of VOCAB_ALL) (VOCAB_BY_WORD[v.w]=VOCAB_BY_WORD[v.w]||[]).push(v);
// Vocabulario que contiene un kanji
const vocabWithKanji = k => VOCAB_ALL.filter(v=>v.w.includes(k));
function isGenerated(lv){ return lv>=14; }
function levelHasContent(lv){ return lv<14 || !!(S.gen && S.gen[lv]) || itemsOfLevel(lv).length>0; }
function levelNeedsGen(lv){ return isGenerated(lv) && !(S.gen && S.gen[lv]) && !itemsOfLevel(lv).some(i=>i.kind==='k'||i.kind==='v'); }

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
  v:1, updated:0, created:now(), items:{}, level:1, exams:[], levelPass:{}, weekly:{last:0}, readings:{}, listen:{}, writings:[], wrDel:[], alts:{}, exDel:[], placements:[], days:{}, gen:{},
  settings:{ target:'2026-12-06', goalLessons:10, goalGrammar:2, examDay:0, strict:false, furigana:false, furiMode:'auto', showTrans:false, maxReviews:100, name:'', targetTier:'N4', wkToken:'', bpKey:'', weekGoal:4, hanko:'' },
  sync:{}, log:[]
});
let S = DEFAULT_STATE();
let sb=null, USER=null, saveT=null, remoteBusy=false, pendingSave=false, OFFLINE=false;
const withTimeout=(p,ms)=>Promise.race([p, new Promise((_,rej)=>setTimeout(()=>rej(new Error('sin respuesta del servidor')),ms))]);
function hasStoredSession(){ try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&/^sb-.*-auth-token$/.test(k)) return true; } }catch(e){} return false; }
function loadLocal(){ try{ const raw=localStorage.getItem('dojo.state'); if(raw){ const o=JSON.parse(raw); S={...DEFAULT_STATE(),...o,settings:{...DEFAULT_STATE().settings,...(o.settings||{})}}; S.gen={}; } }catch(e){} }
function saveLocal(){ try{ const {gen,...rest}=S; localStorage.setItem('dojo.state', JSON.stringify(rest)); }catch(e){} }
// Dueño del estado local: si entra otra cuenta en este dispositivo, no se mezcla con el progreso de la anterior
function localOwner(){ try{ return localStorage.getItem('dojo.owner')||''; }catch(e){ return ''; } }
function adoptUser(){ const prev=localOwner(); if(prev && USER && prev!==USER.id){ S=DEFAULT_STATE(); for(const k of Object.keys(USER_READINGS)) delete USER_READINGS[k]; saveLocal(); saveUserReadingsLocal(); } try{ localStorage.setItem('dojo.owner',USER.id); }catch(e){} }
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
  // "Borrar progreso": lo anterior a la fecha de borrado (venga del dispositivo que venga) se descarta; el lado que borró más tarde manda en lo no fusionable
  const cut=Math.max(L.resetAt||0, R.resetAt||0); const fresh=t=>!cut||(t||0)>=cut; const cutDay=cut?todayKey(new Date(cut)):'';
  const newer=(R.resetAt||0)>(L.resetAt||0)?R:(L.resetAt||0)>(R.resetAt||0)?L:null;
  if (cut) M.resetAt=cut;
  M.resetKeys={...(R.resetKeys||{})}; for (const [k,t] of Object.entries(L.resetKeys||{})) M.resetKeys[k]=Math.max(t,M.resetKeys[k]||0);
  const rk=(k,r)=>{ const t=M.resetKeys[k]; return !t||(r.ls||r.lrn||0)>=t; };
  // ítems: gana el registro visto más recientemente; a igualdad, el de etapa mayor
  M.items={}; for (const [k,r] of Object.entries(L.items||{})) if(r&&fresh(r.ls||r.lrn)&&rk(k,r)) M.items[k]=r;
  for (const [k,r] of Object.entries(R.items||{})){ if(!r||!fresh(r.ls||r.lrn)||!rk(k,r)) continue; const l=M.items[k]; if(!l) { M.items[k]=r; continue; } const lt=l.ls||l.lrn||0, rt=r.ls||r.lrn||0; if (rt>lt || (rt===lt && (r.s||0)>(l.s||0))) M.items[k]=r; }
  // ajustes: los modificados más recientemente
  M.settings = ((R.settingsAt||0) > (L.settingsAt||0)) ? {...DEFAULT_STATE().settings, ...(R.settings||{})} : {...DEFAULT_STATE().settings, ...(L.settings||{})};
  M.settingsAt = Math.max(R.settingsAt||0, L.settingsAt||0);
  // días: máximo por campo
  M.days={}; for (const [d,v] of Object.entries(L.days||{})) if(d>=cutDay) M.days[d]=v;
  for (const [d,v] of Object.entries(R.days||{})){ if(d<cutDay) continue; const l=M.days[d]||{}; const o={...l}; for (const f of Object.keys({...l,...v})) o[f]=Math.max(l[f]||0, v[f]||0); M.days[d]=o; }
  // exámenes: unión por fecha
  M.exDel=uniq([...(L.exDel||[]),...(R.exDel||[])]).slice(-200);
  const ex={}; [...(L.exams||[]),...(R.exams||[])].filter(e=>e&&fresh(e.date)&&!M.exDel.includes(e.date)).forEach(e=>{ ex[e.date]=e; }); M.exams=Object.values(ex).sort((a,b)=>a.date-b.date);
  if (newer){ M.level=newer.level||1; M.levelPass={...(newer.levelPass||{})}; M.weekly={last:(newer.weekly||{}).last||0}; M.stats={...(newer.stats||{})}; M.created=newer.created||now(); }
  else {
    M.level=Math.max(L.level||1, R.level||1); M.levelPass={...(R.levelPass||{}),...(L.levelPass||{})};
    M.weekly={last:Math.max((L.weekly||{}).last||0,(R.weekly||{}).last||0)};
    M.stats={...(L.stats||{})}; for (const [f,v] of Object.entries(R.stats||{})){ const l=M.stats[f]||{c:0,w:0}; M.stats[f]={c:Math.max(l.c||0,v.c||0), w:Math.max(l.w||0,v.w||0)}; }
    M.created=Math.min(L.created||now(), R.created||now());
  }
  { const la=(L.lvReset&&L.lvReset.at)||0, ra=(R.lvReset&&R.lvReset.at)||0, lr=ra>la?R:la?L:null; if(lr){ M.lvReset=lr.lvReset; if(!newer){ M.level=lr.level||1; M.levelPass={...(lr.levelPass||{})}; } } }
  M.readings={}; for (const [k,v] of Object.entries(R.readings||{})) if(v&&fresh(v.date)) M.readings[k]=v;
  for (const [k,v] of Object.entries(L.readings||{})) if(v&&fresh(v.date)&&(!M.readings[k]||(v.date||0)>(M.readings[k].date||0))) M.readings[k]=v;
  M.listen={}; for (const [k,v] of Object.entries(R.listen||{})) if(v&&fresh(v.date)) M.listen[k]=v; for (const [k,v] of Object.entries(L.listen||{})) if(v&&fresh(v.date)&&(!M.listen[k]||(v.date||0)>(M.listen[k].date||0))) M.listen[k]=v;
  M.wrDel=uniq([...(L.wrDel||[]),...(R.wrDel||[])]).slice(-200);
  const wr={}; [...(L.writings||[]),...(R.writings||[])].filter(w=>w&&fresh(w.date)&&!M.wrDel.includes(w.date)).forEach(w=>{ wr[w.date]=w; }); M.writings=Object.values(wr).sort((a,b)=>a.date-b.date).slice(-50);
  { const pl={}; [...(L.placements||[]),...(R.placements||[])].filter(x=>x&&fresh(x.date)).forEach(x=>{ pl[x.date]=x; }); M.placements=Object.values(pl).sort((a,b)=>a.date-b.date).slice(-10); }
  M.alts={}; for (const src of (newer?[newer.alts||{}]:[R.alts||{},L.alts||{}])) for (const [k,a] of Object.entries(src)) M.alts[k]=uniq([...(M.alts[k]||[]),...(Array.isArray(a)?a:[])]);
  M.wgrade=newer?(newer.wgrade||1):Math.max(L.wgrade||1,R.wgrade||1);
  M.wgradeBase=newer?(newer.wgradeBase==null?undefined:newer.wgradeBase):(L.wgradeBase==null&&R.wgradeBase==null?undefined:Math.max(L.wgradeBase||1,R.wgradeBase||1));
  M.sync = ((R.sync||{}).date||0) > ((L.sync||{}).date||0) ? R.sync : (L.sync||{});
  M.gen=L.gen||{}; M.pace=null;
  const changedLocal = JSON.stringify({i:M.items,s:M.settings,d:M.days}) !== JSON.stringify({i:L.items,s:L.settings,d:L.days});
  S=M; updateStreak(); saveLocal();
  // si lo fusionado difiere de lo remoto, subimos la fusión
  const sig=o=>JSON.stringify({i:o.items||{},s:{...DEFAULT_STATE().settings,...(o.settings||{})},d:o.days||{},e:(o.exams||[]).length,l:o.level||1,x:o.resetAt||0,rk:Object.keys(o.resetKeys||{}).length,lr:(o.lvReset&&o.lvReset.at)||0});
  if (sig(M)!==sig(R)) { S.updated=now(); saveRemote(); }
  return changedLocal;
}
async function initDb(){
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY){ AUTH_PENDING=false; setSyncLabel('Sin cuenta configurada: guardado solo aquí'); render(); return; }
  if (!window.supabase){ // no cargó la librería (sin conexión): si este dispositivo ya tenía sesión, se trabaja en local y se sube al volver la red
    AUTH_PENDING=false; AUTH_OPT=false; if (localOwner()){ OFFLINE=true; setSyncLabel('Sin conexión: guardado solo aquí'); } else setSyncLabel('Sin conexión'); render(); return; }
  try{
    sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    let session=null; try{ ({ data:{ session } } = await withTimeout(sb.auth.getSession(), 8000)); }catch(e){ console.warn('getSession', e); }
    USER = session ? session.user : null; AUTH_PENDING=false; AUTH_OPT=false;
    sb.auth.onAuthStateChange((ev, sess)=>{ const was=USER&&USER.id; const u=sess?sess.user:null; if (u && u.id!==was){ USER=u; AUTH_PENDING=false; setTimeout(onSignedIn,0); } else if (!u && USER && ev==='SIGNED_OUT'){ USER=null; render(); } });
    if (USER) await onSignedIn(); else { setSyncLabel('Sin sesión'); render(); }
  }catch(e){ console.warn(e); AUTH_PENDING=false; setSyncLabel('Error de conexión'); render(); }
}
// Tras entrar: primero la autorización, luego adoptar el estado local y fusionar con la cuenta
async function onSignedIn(){
  const ok=await checkAllowed(); if(!ok){ render(); return; }
  adoptUser(); const wall=document.body.classList.contains('login-mode'); if (wall) document.body.classList.add('leaving');
  await pullRemote();
  if (wall) setTimeout(()=>{ document.body.classList.remove('leaving'); render(); },560); else render();
}
// Glosario común: respuestas válidas compartidas. Si no tienes permiso para editarlo, lo que anotas se queda en tu dispositivo.
async function pullGlossary(){
  if(!sb||!USER) return;
  try{ const r=await sb.from('glossary_alts').select('key,alt'); if(r.error) throw r.error; const m={}; for(const row of r.data||[]) (m[row.key]=m[row.key]||[]).push(row.alt); GLOSS=m; saveGlossLocal(); }catch(e){ console.warn('glosario',e); }
}
function glossAlts(key){ return uniq([...((S.alts&&S.alts[key])||[]), ...(GLOSS[key]||[])]); }
async function addAlt(key, alt){
  S.alts=S.alts||{}; S.alts[key]=uniq([...(S.alts[key]||[]),alt]); S.settingsAt=now(); save();
  if(!(sb&&USER&&CAN_GLOSS)) return false;
  try{ const r=await sb.from('glossary_alts').upsert({key,alt,added_by:USER.id,added_email:USER.email||null}); if(r.error) throw r.error; GLOSS[key]=uniq([...(GLOSS[key]||[]),alt]); saveGlossLocal(); return true; }catch(e){ console.warn('glosario',e); return false; }
}
async function removeAlt(key, alt, common){
  if(S.alts&&S.alts[key]){ S.alts[key]=S.alts[key].filter(x=>x!==alt); if(!S.alts[key].length) delete S.alts[key]; S.settingsAt=now(); save(); }
  if(common&&sb&&USER&&CAN_GLOSS){ try{ const r=await sb.from('glossary_alts').delete().eq('key',key).eq('alt',alt); if(r.error) throw r.error; GLOSS[key]=(GLOSS[key]||[]).filter(x=>x!==alt); if(!GLOSS[key].length) delete GLOSS[key]; saveGlossLocal(); }catch(e){ toast('No se pudo quitar del glosario común'); }}
}
async function pullRemote(){
  if(!sb||!USER) return;
  try{
    const {data,error}=await sb.from('progress').select('state').eq('user_id',USER.id).maybeSingle(); if(error) throw error;
    if (data && data.state) mergeRemote(data.state); else { S.updated=now(); saveRemote(); }
    const g=await sb.from('gen_levels').select('lv,data').eq('user_id',USER.id); if(!g.error && g.data) for(const row of g.data){ S.gen[row.lv]=row.data; } registerGenerated();
    const ur=await sb.from('user_readings').select('id,data').eq('user_id',USER.id); if(!ur.error && ur.data){ for(const row of ur.data) USER_READINGS[row.id]=row.data; saveUserReadingsLocal(); }
    await pullGlossary(); pullReviewed();
    setSyncLabel('Sincronizado con tu cuenta');
  }catch(e){ console.warn(e); setSyncLabel('Sin conexión: guardado solo aquí'); }
}
async function saveGen(lv, data){ S.gen[lv]=data; try{ localStorage.setItem('dojo.gen.'+lv, JSON.stringify(data)); }catch(e){} if(sb&&USER){ try{ const {error}=await sb.from('gen_levels').upsert({user_id:USER.id, lv, data}); if(error) throw error; }catch(e){ console.warn(e); toast('El nivel se guardó solo en este dispositivo'); } } registerGenerated(); }
function loadGenLocal(){ for(let lv=14;lv<=MAX_LEVEL;lv++){ try{ const raw=localStorage.getItem('dojo.gen.'+lv); if(raw) S.gen[lv]=JSON.parse(raw);}catch(e){} } registerGenerated(); }
function registerGenerated(){ for (const lv of Object.keys(S.gen)){ const g=S.gen[lv]; if(!g) continue; registerItems((g.kanji||[]).map(k=>({...k,lv:+lv})), (g.vocab||[]).map(v=>({...v,lv:+lv})), (g.grammar||[]).map(x=>({...x,lv:+lv}))); } }
let syncLabel='…'; function setSyncLabel(t){ syncLabel=t; document.querySelectorAll('.synclabel').forEach(el=>{ el.textContent=t; }); }
// Autenticación
async function signInEmail(email){ if(!sb) return toast('Cuenta no configurada'); const {error}=await sb.auth.signInWithOtp({email, options:{emailRedirectTo:location.origin+location.pathname}}); if(error) toast('Error: '+error.message); else toast('Te he enviado un enlace de acceso al correo'); }
async function signInGoogle(){ DENIED_EMAIL=null; DENIED_NET=false; if(!sb) return toast(window.supabase?'Cuenta no configurada':'Sin conexión con el servidor. Comprueba la red y recarga la página.'); const {error}=await sb.auth.signInWithOAuth({provider:'google', options:{redirectTo:location.origin+location.pathname}}); if(error) toast('Error: '+error.message); }
async function signOut(){ if(sb){ try{ await sb.auth.signOut(); }catch(e){} } USER=null; OFFLINE=false; toast('Sesión cerrada'); render(); }
async function callFunction(name, body){
  if(!sb) throw new Error(window.supabase?'Cuenta no configurada':'Sin conexión');
  const {data,error}=await sb.functions.invoke(name,{body});
  if(error){ let msg=error.message||'error'; try{ if(error.context && typeof error.context.json==='function'){ const j=await error.context.json(); if(j&&j.error) msg=String(j.error); } }catch(e){} throw new Error(msg); }
  if(data && data.error) throw new Error(String(data.error));
  return data;
}

// Registro diario
function day(k=todayKey()){ return S.days[k] = S.days[k] || {r:0,l:0,rd:0,ex:0,rc:0}; }
function bump(field, n=1){ const d=day(); d[field]=(d[field]||0)+n; updateStreak(); save(); }
function dayCounts(d){ return (d.r>=20||d.l>=5||d.ex>0||d.rd>0||d.di>=5||d.wr>0||d.li>0); }
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
const swReady=()=>withTimeout(navigator.serviceWorker.ready, 20000);
async function pushStatus(){ try{ if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){ const ua=navigator.userAgent||''; if(/iPhone|iPad|iPod/.test(ua)) return 'ios'; if(/FBAN|FBAV|Instagram|Line\/|wv\)|; wv|MicroMessenger|Telegram/i.test(ua)) return 'inapp'; if(!window.isSecureContext) return 'insecure'; return 'unsupported'; } if(Notification.permission==='denied') return 'denied'; const reg=await swReady(); const sub=await reg.pushManager.getSubscription(); return sub?'on':'off'; }catch(e){ return 'sw'; } }
function b64ToU8(b){ const p='='.repeat((4-b.length%4)%4); const s=(b+p).replace(/-/g,'+').replace(/_/g,'/'); const r=atob(s); return Uint8Array.from([...r].map(c=>c.charCodeAt(0))); }
const localTz=()=>{ try{ return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'; }catch(e){ return 'UTC'; } };
async function enablePush(){
  if(!sb||!USER){ toast('Inicia sesión primero'); return; }
  if(!CONFIG.VAPID_PUBLIC_KEY){ toast('Falta la clave VAPID en config.js'); return; }
  try{
    const perm=await Notification.requestPermission(); if(perm!=='granted'){ toast('Permiso denegado por el navegador'); return; }
    const reg=await swReady();
    const sub=await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64ToU8(CONFIG.VAPID_PUBLIC_KEY)});
    let {error}=await sb.from('push_subs').upsert({endpoint:sub.endpoint, user_id:USER.id, sub:sub.toJSON(), tz:localTz()});
    if(error && /tz/.test(error.message||'')) ({error}=await sb.from('push_subs').upsert({endpoint:sub.endpoint, user_id:USER.id, sub:sub.toJSON()})); // tabla sin la columna tz todavía
    if(error){ toast('No se pudo guardar la suscripción: '+error.message); return; }
    toast('Notificaciones activadas en este dispositivo');
  }catch(e){ toast('No se pudieron activar: '+(e.message||e)); }
}
async function disablePush(){ try{ const reg=await swReady(); const sub=await reg.pushManager.getSubscription(); if(sub){ if(sb&&USER) await sb.from('push_subs').delete().eq('endpoint',sub.endpoint); await sub.unsubscribe(); } toast('Notificaciones desactivadas'); }catch(e){ toast('No se pudieron desactivar: '+(e.message||e)); } }

let CAN_GLOSS=false, GLOSS={};
try{ GLOSS=JSON.parse(localStorage.getItem('dojo.gloss')||'{}')||{}; }catch(e){ GLOSS={}; }
const saveGlossLocal=()=>{ try{ localStorage.setItem('dojo.gloss',JSON.stringify(GLOSS)); }catch(e){} };
let ALLOWED=null, IS_ADMIN=false, DENIED_EMAIL=null, DENIED_NET=false;
async function checkAllowed(){
  const cacheKey='dojo.allowed'; let cached=''; try{ cached=localStorage.getItem(cacheKey)||''; }catch(e){}
  DENIED_NET=false;
  try{
    const r=await withTimeout(sb.rpc('is_allowed'), 10000); if(r.error) throw r.error; ALLOWED=!!r.data;
    const a=await sb.rpc('is_admin'); IS_ADMIN=!a.error&&!!a.data;
    try{ const g=await sb.rpc('can_edit_glossary'); CAN_GLOSS=!g.error&&!!g.data; }catch(e){ CAN_GLOSS=false; }
    try{ if(ALLOWED) localStorage.setItem(cacheKey,USER.id); else localStorage.removeItem(cacheKey); }catch(e){}
  }catch(e){
    IS_ADMIN=false; CAN_GLOSS=false;
    const noRpc = !!e && (e.code==='PGRST202' || /is_allowed/.test(e.message||''));
    if (noRpc){ // sin schema3 aún: usar la lista de config como respaldo
      const list=(CONFIG.ALLOWED_EMAILS||[]).map(x=>String(x).toLowerCase()); ALLOWED=!list.length||!!(USER&&USER.email&&list.includes(USER.email.toLowerCase()));
    } else { // sin red: vale la última comprobación hecha en este dispositivo; si no la hay, no se puede entrar todavía
      ALLOWED=!!USER && cached===USER.id; if(!ALLOWED) DENIED_NET=true;
    }
  }
  if(!ALLOWED){ DENIED_EMAIL=DENIED_NET?null:(USER&&USER.email); try{ await sb.auth.signOut(); }catch(e){} USER=null; }
  return ALLOWED;
}
async function adminList(){ const r=await sb.rpc('admin_list_users'); if(r.error) throw r.error; return r.data||[]; }
async function adminAdd(email,note){ const r=await sb.rpc('admin_add_user',{p_email:email,p_note:note||null}); if(r.error) throw r.error; }
async function adminSetReviewer(email,on){ const r=await sb.rpc('admin_set_reviewer',{p_email:email,p_on:!!on}); if(r.error) throw r.error; }
async function adminSetEditor(email,on){ const r=await sb.rpc('admin_set_glossary_editor',{p_email:email,p_on:!!on}); if(r.error) throw r.error; }
async function adminRemove(email){ const r=await sb.rpc('admin_remove_user',{p_email:email}); if(r.error) throw r.error; }
