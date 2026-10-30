import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
import glob
def part(pat): return [os.path.basename(x) for x in sorted(glob.glob('data/'+pat))]
order=['kanji.js','kanji_n4.js','@kanji_n3*.js','@kanji_n2*.js','vocab_n5.js','vocab_n5b.js','vocab_n4a.js','vocab_n4b.js','@vocab_n3*.js','@vocab_n2*.js','vocab_hints.js','grammar_n5.js','grammar_n4a.js','grammar_n4b.js','grammar_extra.js','readings.js','readings_tales.js','readings_more.js','readings_n5.js','@readings_n3*.js','@readings_n2*.js','exam_bank.js','exam_bank_n5.js','@exam_n3*.js','@exam_n2*.js','grammar_n3.js','grammar_n3b.js','@grammar_n3_*.js','@grammar_n2_*.js','gram_ext.js','@gram_ext_*.js','roadmap.js']
files=[]
for o in order: files+= part(o[1:]) if o.startswith('@') else [o]
data=''.join(open('data/'+f,encoding='utf-8').read()+'\n' for f in files)
data+='const CLOZE_KANA='+open('data/cloze_auto.json').read()+';\n'
data+='const EXAM_KANA='+open('data/exam_kana.json').read()+';\n'
import datetime
data+='const APP_BUILD="'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M')+' UTC";\n'
data+='const ROADMAP_KANJI='+open('data/roadmap_kanji.json').read()+';\n'
app=''.join(open('src/'+f).read()+'\n' for f in ['app1.js','app2.js','app3.js','app4.js','app5.js','app6.js','app7.js','app8.js','app9.js'])
out=open('src/template.html').read().replace('/*__DATA__*/',data).replace('/*__APP__*/',app)
open('index.html','w').write(out)
print('index.html', len(out.encode()), 'bytes')
