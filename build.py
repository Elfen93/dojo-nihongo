import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
data=''.join(open('data/'+f).read()+'\n' for f in ['kanji.js','kanji_n4.js','vocab_n5.js','vocab_n4a.js','vocab_n4b.js','grammar_n5.js','grammar_n4a.js','grammar_n4b.js','readings.js','roadmap.js'])
data+='const CLOZE_KANA='+open('data/cloze_auto.json').read()+';\n'
data+='const ROADMAP_KANJI='+open('data/roadmap_kanji.json').read()+';\n'
app=''.join(open('src/'+f).read()+'\n' for f in ['app1.js','app2.js','app3.js','app4.js','app5.js','app6.js'])
out=open('src/template.html').read().replace('/*__DATA__*/',data).replace('/*__APP__*/',app)
open('index.html','w').write(out)
print('index.html', len(out.encode()), 'bytes')
