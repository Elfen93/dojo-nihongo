# Calcula el furigana (lectura por palabra) de los textos japoneses de las fichas. Uso: python3 -I tools/furi.py strings.json
import sys,json,re
from sudachipy import dictionary,tokenizer
tok=dictionary.Dictionary().create(); M=tokenizer.Tokenizer.SplitMode.B
kj=re.compile(r'[一-鿿㐀-䶿々]'); kana=lambda c:'぀'<=c<='ゟ'
k2h=lambda s:''.join(chr(ord(c)-0x60) if 'ァ'<=c<='ヶ' else c for c in s)
FIX=[('にっぽん','にほん'),('わたくし','わたし'),('いっさくひ','おととい')]
def trim(sf,rd):
    # que el ruby cubra solo los kanji: quita okurigana final y kana inicial iguales en superficie y lectura
    while len(sf)>1 and len(rd)>1 and kana(sf[-1]) and sf[-1]==rd[-1]: sf,rd=sf[:-1],rd[:-1]
    while len(sf)>1 and len(rd)>1 and kana(sf[0]) and sf[0]==rd[0]: sf,rd=sf[1:],rd[1:]
    return sf,rd
src=json.load(open(sys.argv[1],encoding='utf-8')); out={}
for s in src:
    pairs=[]
    for t in tok.tokenize(s,M):
        sf=t.surface()
        if not kj.search(sf): continue
        rd=k2h(t.reading_form())
        if not rd or rd=='*': continue
        for a,b in FIX: rd=rd.replace(a,b)
        sf,rd=trim(sf,rd)
        if kj.search(sf) and rd and not kj.search(rd): pairs.append(sf+'|'+rd)
    if pairs: out[s]=';'.join(pairs)
json.dump(out,open('data/furi.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(len(out),'textos con furigana')
