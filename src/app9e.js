// ===================== Banco propio de simulacros (formato JLPT, preguntas originales) =====================
let MOCK_STATE=0; const MOCK_WAIT=[];
function loadMock(){
  return new Promise(res=>{
    if(MOCK_STATE===2) return res();
    MOCK_WAIT.push(res); if(MOCK_STATE===1) return; MOCK_STATE=1;
    const s=document.createElement('script'); s.src='mock.js';
    s.onload=()=>{ MOCK_STATE=2; MOCK_WAIT.splice(0).forEach(f=>f()); };
    s.onerror=()=>{ MOCK_STATE=0; MOCK_WAIT.splice(0).forEach(f=>f()); };
    document.head.append(s);
  });
}
const MOCK_SEC={kanji:'漢字読み',orth:'表記',ctx:'文脈規定',para:'言い換え',usage:'用法',gram:'文法形式',order:'並び替え',cloze:'文章の文法',read:'読解',readm:'読解',info:'読解'};
// Un elemento del banco → una o varias preguntas del examen
function mockToQs(it){
  const base=q=>({...q,mock:it.id,why:q.why||it.why,key:null});
  const strip=s=>s.replace(/[【】]/g,'');
  const under=s=>{ const m=s.match(/【(.+?)】/); return m?m[1]:''; };
  const mc=(extra)=>base({type:'mc',options:it.o.slice(),answer:it.o[it.a],...extra});
  switch(it.t){
    case 'kanji': return [mc({sec:MOCK_SEC.kanji,text:strip(it.s),under:under(it.s),prompt:'¿Cómo se lee la palabra subrayada?'})];
    case 'orth': return [mc({sec:MOCK_SEC.orth,text:strip(it.s),under:under(it.s),prompt:'¿Cómo se escribe la palabra subrayada?'})];
    case 'ctx': return [mc({sec:MOCK_SEC.ctx,text:it.s,prompt:'Elige la palabra que encaja en el hueco'})];
    case 'para': return [mc({sec:MOCK_SEC.para,text:strip(it.s),under:under(it.s),prompt:'Elige la opción con el significado más cercano a la palabra subrayada'})];
    case 'usage': return [mc({sec:MOCK_SEC.usage,text:`「${it.w}」`,prompt:'¿En qué frase se usa mejor esta palabra?'})];
    case 'gram': return [mc({sec:MOCK_SEC.gram,text:it.s,prompt:'Elige la forma correcta'})];
    case 'order': { const star=1+Math.floor(Math.random()*2); return [base({sec:MOCK_SEC.order,type:'order',o:{pre:it.pre||'',parts:it.parts,post:it.post||'。'},star,prompt:'¿Qué parte va en la posición ★?',options:shuffle(it.parts.slice()),answer:it.parts[star]})]; }
    case 'cloze': return it.q.map((q,i)=>base({sec:MOCK_SEC.cloze,type:'mc',pid:it.id,passage:it.p.replace(/\((\d)\)/g,'（$1）'),text:`（${i+1}）`,prompt:'Elige la opción que encaja en el hueco del texto',options:q.o.slice(),answer:q.o[q.a],why:it.why}));
    default: return it.q.map(q=>base({sec:MOCK_SEC[it.t],type:'mc',pid:it.id,passage:it.p,text:q.q,prompt:'Lee el texto y responde',options:q.o.slice(),answer:q.o[q.a],why:q.why}));
  }
}
const MOCK_PLAN={kanji:9,orth:6,ctx:10,para:5,usage:5,gram:15,order:5,cloze:1,read:4,readm:2,info:2};
// Monta un simulacro con el banco del nivel: primero las preguntas que aún no te han salido
function buildMockFromBank(tierObj){
  const bank=(typeof MOCK_Q!=='undefined'?MOCK_Q:[]).filter(q=>q.lv===tierObj.n); if(bank.length<40) return null;
  const seen=S.mockSeen||{}; const chosen=[];
  for (const [t,n] of Object.entries(MOCK_PLAN)){
    const pool=bank.filter(q=>q.t===t); if(!pool.length) continue;
    const fresh=shuffle(pool.filter(q=>!seen[q.id])); const old=pool.filter(q=>seen[q.id]).sort((a,b)=>seen[a.id]-seen[b.id]);
    chosen.push(...fresh.concat(old).slice(0,n));
  }
  const qs=chosen.flatMap(mockToQs);
  const usedLi=new Set(); for (let i=0;i<6;i++){ const q=qListening([],usedLi); if(q) qs.push(q); }
  const secOrder=['漢字読み','表記','文脈規定','言い換え','用法','文法形式','並び替え','文章の文法','読解','聴解'];
  qs.sort((a,b)=>secOrder.indexOf(a.sec)-secOrder.indexOf(b.sec));
  S.mockSeen=S.mockSeen||{}; chosen.forEach(q=>{ S.mockSeen[q.id]=now(); }); save();
  return qs;
}
