import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
import glob
def part(pat): return [os.path.basename(x) for x in sorted(glob.glob('data/'+pat))]
order=['kanji.js','kanji_n4.js','@kanji_n3*.js','@kanji_n2*.js','vocab_n5.js','vocab_n5b.js','vocab_n4a.js','vocab_n4b.js','@vocab_n3*.js','vocab_kj.js','@vocab_n2*.js','vocab_hints.js','grammar_n5.js','grammar_n4a.js','grammar_n4b.js','grammar_extra.js','readings.js','readings_tales.js','readings_more.js','readings_n5.js','@readings_n3*.js','@readings_n2*.js','readings_qhead.js','@readings_q_*.js','readings_zapply.js','exam_bank.js','exam_bank_n5.js','@exam_n3*.js','@exam_n2*.js','grammar_n3.js','grammar_n3b.js','@grammar_n3_*.js','@grammar_n2_*.js','roadmap.js']
files=[]
for o in order: files+= part(o[1:]) if o.startswith('@') else [o]
data=''.join(open('data/'+f,encoding='utf-8').read()+'\n' for f in files)
data+='const CLOZE_KANA='+open('data/cloze_auto.json').read()+';\n'
data+='const EXAM_KANA='+open('data/exam_kana.json').read()+';\n'
import datetime,json
data+='const APP_BUILD="'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M')+' UTC";\n'
rk=json.load(open('data/roadmap_kanji.json',encoding='utf-8')); rk['N3']=[]; rk['N2']=[]  # N3 y N2 ya están escritos a mano
data+='const ROADMAP_KANJI='+json.dumps(rk,ensure_ascii=False,separators=(',',':'))+';\n'
data+='const GRAM_EXT={},FURI={},STROKES={};\n'
import json,re
ext=''
for f in part('gram_ext_*.js'):
    t=open('data/'+f,encoding='utf-8').read(); m=t[t.index('{'):t.rindex('}')+1]; ext+='Object.assign(GRAM_EXT,'+json.dumps(json.loads(m),ensure_ascii=False,separators=(',',':'))+');\n'
if os.path.exists('data/furi.json'): ext+='Object.assign(FURI,'+open('data/furi.json',encoding='utf-8').read()+');\n'
open('ext.js','w',encoding='utf-8').write(ext); print('ext.js',len(ext.encode()),'bytes')
if os.path.exists('data/strokes.json'):
    st='Object.assign(STROKES,'+open('data/strokes.json',encoding='utf-8').read()+');\n'
    open('strokes.js','w',encoding='utf-8').write(st); print('strokes.js',len(st.encode()),'bytes')
app=''.join(open('src/'+f).read()+'\n' for f in ['app1.js','app2.js','app3.js','app4.js','app5.js','app6.js','app7.js','app8.js','app9b.js','app9c.js','app9d.js','app9.js'])
out=open('src/template.html').read().replace('/*__DATA__*/',data).replace('/*__APP__*/',app)
open('index.html','w').write(out)
import re as _re
open('version.json','w').write(json.dumps({'build':_re.search(r'const APP_BUILD="([^"]+)"',data).group(1)}))
print('index.html', len(out.encode()), 'bytes')
