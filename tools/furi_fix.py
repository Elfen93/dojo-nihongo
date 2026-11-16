# Corrige lecturas que Sudachi da mal en el furigana (data/furi.json): números con contador, 何時, 富士山, 下 (もと)…
# Uso: python3 -I tools/furi_fix.py   (se ejecuta después de tools/furi.py; es idempotente)
import json,re,sys
P='data/furi.json'
DIG={'一':'いち','二':'に','三':'さん','四':'よん','五':'ご','六':'ろく','七':'なな','八':'はち','九':'きゅう','十':'じゅう'}
# contador: (lectura base, {dígito: (lectura del número, lectura del contador)})
SOKU={'一':'いっ','六':'ろっ','八':'はっ','十':'じゅっ'}
def ctr(d,c):
    n=DIG[d]
    if c=='時': return ({'四':'よ','七':'しち','九':'く'}.get(d,n),'じ')
    if c=='月': return ({'四':'し','七':'しち','九':'く'}.get(d,n),'がつ')
    if c=='分':
        if d in SOKU: return (SOKU[d],'ぷん')
        if d in '三四': return ({'三':'さん','四':'よん'}[d],'ぷん')
        return (n,'ふん')
    if c=='本': return (SOKU.get(d,n),{'一':'ぽん','六':'ぽん','八':'ぽん','十':'ぽん','三':'ぼん'}.get(d,'ほん'))
    if c=='匹': return (SOKU.get(d,n),{'一':'ぴき','六':'ぴき','八':'ぴき','十':'ぴき','三':'びき'}.get(d,'ひき'))
    if c=='杯': return (SOKU.get(d,n),{'一':'ぱい','六':'ぱい','八':'ぱい','十':'ぱい','三':'ばい'}.get(d,'はい'))
    if c in ('回','個','冊','歳','才','週','階','か月','ヶ月','ページ'):
        base={'回':'かい','個':'こ','冊':'さつ','歳':'さい','才':'さい','週':'しゅう','階':'かい','ページ':'ぺーじ'}.get(c,'')
        if c=='階' and d=='三': return ('さん','がい')
        return (SOKU.get(d,n),base)
    if c=='人':
        if d=='一': return ('ひと','り')
        if d=='二': return ('ふた','り')
        return ({'四':'よ','七':'なな'}.get(d,n),'にん')
    return None
CTRS='時月分本匹杯回個冊歳才週階人'
def fix(text,f):
    pairs=[x.split('|') for x in f.split(';')]
    out=[]; pos=0; i=0
    while i<len(pairs):
        sf,rd=pairs[i]; at=text.find(sf,pos); after=text[at+len(sf):] if at>=0 else ''
        if sf=='何時' and rd=='いつ': rd='なんじ'
        elif sf=='富士山': rd='ふじさん'
        elif sf=='下' and rd=='もと': rd='した'
        elif sf=='明日' and rd=='あす': rd='あした'
        elif sf=='一昨日': rd='おととい'
        elif sf=='二日' and rd!='ふつか': rd='ふつか'
        elif sf=='十日' and rd!='とおか': rd='とおか'
        elif sf.endswith('曜日') and rd.endswith('ようひ'): rd=rd[:-1]+'び'
        elif sf=='中' and rd=='ちゅう' and text[:at].endswith(('一日','一年','世界')): rd='じゅう'
        elif sf=='何' and rd=='なん' and after[:1] in ('を','が','も','に','へ','と'): rd='なに'
        elif sf=='降' and rd=='お' and after.startswith('り') and re.search(r'(雨|雪)',text[:at]): rd='ふ'
        elif len(sf)>1 and all(c in DIG for c in sf) and at>=0 and i+1<len(pairs) and after.startswith(pairs[i+1][0]) and pairs[i+1][0] in '歳冊回個杯匹本分階' and sf[-1] in SOKU and rd.endswith(DIG[sf[-1]]):
            nx=pairs[i+1][0]; a2,b2=ctr(sf[-1],nx); rd=rd[:-len(DIG[sf[-1]])]+a2; out.append(sf+'|'+rd); pos=at+len(sf); i+=1
            at2=text.find(nx,pos); out.append(nx+'|'+b2); pos=at2+len(nx); i+=1; continue
        elif len(sf)==2 and sf[0] in DIG and sf[1] in CTRS and ctr(sf[0],sf[1]):
            a,b=ctr(sf[0],sf[1]); rd=a+b
            if sf=='十分' and not re.match(r'(ぐらい|くらい|ほど|後|前|間|かかり|かかる|で|も|です|だ|しか|まえ|ご)',after) and not re.search(r'(時|から|まで)$',text[:at]): rd=pairs[i][1]  # 十分 = suficiente
        elif sf in DIG and at>=0:
            nxt=pairs[i+1] if i+1<len(pairs) else None
            if after.startswith('ページ'):
                a,_=ctr(sf,'ページ'); rd=a
            elif nxt and after.startswith(nxt[0]) and nxt[0] in CTRS and ctr(sf,nxt[0]):
                a,b=ctr(sf,nxt[0]); rd=a; out.append(sf+'|'+rd); pos=at+len(sf); i+=1
                sf2=nxt[0]; at2=text.find(sf2,pos); out.append(sf2+'|'+b); pos=at2+len(sf2); i+=1; continue
        out.append(sf+'|'+rd)
        if at>=0: pos=at+len(sf)
        i+=1
    r=';'.join(out)
    for a,b in STR_FIX: r=re.sub(a,b,r)
    return r
STR_FIX=[(r'(^|;)一\|いち;日中\|にっちゅう',r'\1一日中|いちにちじゅう'),(r'(^|;)二\|ふた;日\|か(?=;|$)',r'\1二日|ふつか'),(r'(^|;)十\|とう;日間\|かかん',r'\1十日間|とおかかん'),
 (r'(^|;)十\|とう;日\|か(?=;|$)',r'\1十日|とおか'),(r'(曜\|[^;]*);日\|ひ(?=;|$)',r'\1;日|び'),(r'(^|;)一昨\|いっさく;日\|ひ',r'\1一昨日|おととい'),(r'(^|;)家\|か(?=;|$)',r'\1家|いえ')]
if __name__=='__main__':
    F=json.load(open(P,encoding='utf-8')); ch=0; ex=[]
    for k,v in F.items():
        n=fix(k,v)
        if n!=v: ch+=1; F[k]=n; ex.append((k,v,n))
    json.dump(F,open(P,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    print('furigana corregido en',ch,'textos')
    for k,v,n in ex[:int(sys.argv[1]) if len(sys.argv)>1 else 0]: print(' ',k,'|',v,'→',n)
