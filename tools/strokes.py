# Genera data/strokes.json (orden y forma de los trazos de cada kanji) a partir de KanjiVG (CC BY-SA 3.0, kanjivg.tagaini.net).
# Uso: python3 -I tools/strokes.py <carpeta con los .svg de KanjiVG>   (los .svg se descargan de github.com/KanjiVG/kanjivg, carpeta kanji/)
import sys,re,json,os
d=sys.argv[1]; ks=open('/tmp/kanji_list.txt',encoding='utf-8').read().split('\n') if len(sys.argv)<3 else open(sys.argv[2],encoding='utf-8').read().split('\n')
num=re.compile(r'-?\d+\.?\d*')
def short(path):  # una cifra decimal y sin ceros sobrantes
    return num.sub(lambda m:('%.1f'%float(m.group())).rstrip('0').rstrip('.'),path)
out={}
for k in ks:
    if not k: continue
    f=os.path.join(d,'%05x.svg'%ord(k))
    if not os.path.exists(f): print('FALTA',k); continue
    t=open(f,encoding='utf-8').read()
    strokes=[(int(m.group(1)),m.group(2)) for m in re.finditer(r'<path id="kvg:[0-9a-f]+-s(\d+)"[^>]*? d="([^"]+)"',t)]
    strokes.sort()
    if not strokes: print('SIN TRAZOS',k); continue
    out[k]=[short(p) for _,p in strokes]
json.dump(out,open('data/strokes.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(len(out),'kanji;',sum(len(v) for v in out.values()),'trazos;',os.path.getsize('data/strokes.json'),'bytes')
