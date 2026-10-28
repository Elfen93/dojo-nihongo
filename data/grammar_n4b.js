const GRAMMAR_N4B = [
// ---- nivel 9 ----
{id:"keigo-sonkeigo",lv:9,t:"Keigo: 尊敬語 (いらっしゃる, おっしゃる, 召し上がる)",s:"verbos honoríficos especiales / お + V-ます + になる",bp:"尊敬語",e:"Lenguaje respetuoso hacia la acción del superior: 行く・来る・いる→いらっしゃる, 言う→おっしゃる, 食べる→召し上がる, 見る→ご覧になる, する→なさる.",ex:[
 {j:"先生は明日[いらっしゃいます]か。",s:"¿Vendrá el profesor mañana?",h:"来る, honorífico"},
 {j:"どうぞ[召し上がって|めしあがって]ください。",s:"Por favor, coma.",h:"食べる, honorífico + て"},
 {j:"社長が[おっしゃいました]。",s:"El presidente lo dijo.",h:"言う, honorífico pasado"}]},
{id:"keigo-kenjougo",lv:9,t:"Keigo: 謙譲語 (参る, 申す, いただく)",s:"verbos humildes / お + V-ます + する",bp:"謙譲語",e:"Lenguaje humilde para las propias acciones: 行く・来る→参る, 言う→申す, 食べる・もらう→いただく, 見る→拝見する, する→いたす, いる→おる.",ex:[
 {j:"田中と[申します]。",s:"Me llamo Tanaka (humilde).",h:"言う, humilde"},
 {j:"明日三時に[参ります]。",s:"Mañana iré a las tres (humilde).",h:"行く, humilde"},
 {j:"お荷物を[お持ちします]。",s:"Le llevo el equipaje.",h:"お + 持つ + する"}]},
{id:"teineigo",lv:9,t:"〜でございます / お〜 / ご〜",s:"N + でございます / お + 和語 / ご + 漢語",bp:"でございます",e:"Forma muy cortés de です. Prefijos お (palabras japonesas: お名前) y ご (sino-japonesas: ご住所).",ex:[
 {j:"こちらは会議室[でございます]。",s:"Esta es la sala de reuniones."},
 {j:"[お名前]をお願いします。",s:"Su nombre, por favor.",h:"お + 名前"},
 {j:"[ご住所]を教えてください。",s:"Dígame su dirección.",h:"ご + 住所"}]},
{id:"o-kudasai",lv:9,t:"お〜ください",s:"お + V-ます + ください / ご + N + ください",bp:"お〜ください",e:"Petición respetuosa: «tenga la bondad de».",ex:[
 {j:"こちらで少々[お待ちください]。",s:"Espere aquí un momento, por favor.",h:"お + 待つ"},
 {j:"どうぞ[お入りください]。",s:"Pase, por favor.",h:"お + 入る"},
 {j:"[ご注意ください]。",s:"Tenga cuidado, por favor.",h:"ご + 注意"}]},
{id:"yori-hou",lv:9,t:"〜より / 〜のほうが",s:"A は B より / A より B のほうが + adj",bp:"より",e:"Comparación: «más que». のほうが marca el que gana.",ex:[
 {j:"東京は大阪[より]大きいです。",s:"Tokio es más grande que Osaka."},
 {j:"電車[のほうが]バスより速いです。",s:"El tren es más rápido que el autobús."},
 {j:"夏より冬[のほうが]好きです。",s:"Me gusta más el invierno que el verano."}]},
{id:"ichiban",lv:9,t:"〜の中で〜が一番",s:"N + の中で + N + が + 一番 + adj",bp:"一番",e:"Superlativo: «el más ... de».",ex:[
 {j:"果物[の中で]りんごが一番好きです。",s:"De las frutas, la que más me gusta es la manzana."},
 {j:"クラスで田中さんが[一番]背が高いです。",s:"Tanaka es el más alto de la clase."},
 {j:"日本で[一番]高い山は富士山です。",s:"La montaña más alta de Japón es el Fuji."}]},
{id:"hodo-nai",lv:9,t:"〜ほど〜ない",s:"A は B ほど + negativo",bp:"ほど〜ない",e:"«A no es tan ... como B».",ex:[
 {j:"今日は昨日[ほど]寒くないです。",s:"Hoy no hace tanto frío como ayer."},
 {j:"私は兄[ほど]背が高くありません。",s:"No soy tan alto como mi hermano."},
 {j:"バスは電車[ほど]速くない。",s:"El autobús no es tan rápido como el tren."}]},
// ---- nivel 10 ----
{id:"ni-suru",lv:10,t:"〜にする / 〜ことにする",s:"N + にする / V-る + ことにする",bp:"ことにする",e:"にする: elegir, decidirse por. ことにする: decidir hacer. ことになる: queda decidido (por otros).",ex:[
 {j:"私はコーヒー[にします]。",s:"Yo tomaré café (elijo).",h:"にする"},
 {j:"毎日運動する[ことにしました]。",s:"Decidí hacer ejercicio cada día.",h:"ことにする, pasado"},
 {j:"来月大阪に転勤する[ことになりました]。",s:"Se ha decidido que me trasladan a Osaka.",h:"ことになる, pasado"}]},
{id:"you-ni-suru",lv:10,t:"〜ようにする / 〜ようになる",s:"V-る・V-ない + ようにする / V-る・potencial + ようになる",bp:"ようにする",e:"ようにする: esforzarse por hacer (hábito). ようになる: llegar a poder / empezar a hacer (cambio).",ex:[
 {j:"毎日野菜を[食べるようにしています]。",s:"Procuro comer verdura cada día.",h:"食べる + ようにする + ている"},
 {j:"日本語が[話せるようになりました]。",s:"He llegado a poder hablar japonés.",h:"話せる + ようになる, pasado"},
 {j:"遅刻[しないようにして]ください。",s:"Procure no llegar tarde.",h:"する, negativo + ようにする + て"}]},
{id:"you-ni",lv:10,t:"〜ように (finalidad)",s:"V-る・V-ない・potencial + ように",bp:"ように (so that)",e:"«Para que, de modo que». Con verbos sin voluntad (potenciales, negativos, 分かる, なる).",ex:[
 {j:"[忘れないように]メモしてください。",s:"Apúntelo para no olvidarlo.",h:"忘れる, negativo"},
 {j:"よく[聞こえるように]大きい声で話します。",s:"Hablo en voz alta para que se oiga bien.",h:"聞こえる"},
 {j:"[間に合うように]早く出ました。",s:"Salí pronto para llegar a tiempo.",h:"間に合う"}]},
{id:"tame-ni",lv:10,t:"〜ために (propósito / causa)",s:"V-る + ために / N + の + ために",bp:"ために",e:"Propósito con verbos de voluntad: «para». Con pasado: causa («debido a»).",ex:[
 {j:"日本で[働くために]日本語を勉強しています。",s:"Estudio japonés para trabajar en Japón.",h:"働く"},
 {j:"[家族のために]お金をためています。",s:"Ahorro dinero por mi familia.",h:"家族 + の"},
 {j:"[事故のために]電車が遅れました。",s:"El tren se retrasó debido a un accidente.",h:"事故 + の, causa"}]},
{id:"noni-purpose",lv:10,t:"〜のに (para hacer...)",s:"V-る + のに + 使う・便利・必要・かかる",bp:"のに (for)",e:"«Para (hacer algo)» con verbos como 使う, かかる, 便利, 必要.",ex:[
 {j:"このはさみは紙を[切るのに]使います。",s:"Estas tijeras se usan para cortar papel.",h:"切る"},
 {j:"駅まで[行くのに]三十分かかります。",s:"Se tarda treinta minutos en llegar a la estación.",h:"行く"},
 {j:"この辞書は漢字を[調べるのに]便利です。",s:"Este diccionario es práctico para consultar kanji.",h:"調べる"}]},
{id:"shi",lv:10,t:"〜し〜し",s:"informal + し、informal + し",bp:"し",e:"Enumera razones: «y además».",ex:[
 {j:"この店は[安いし]、おいしいし、よく来ます。",s:"Esta tienda es barata y además buena, así que vengo mucho.",h:"安い"},
 {j:"雨が[降っているし]、寒いし、出かけたくない。",s:"Está lloviendo y hace frío, no quiero salir.",h:"降る + ている"},
 {j:"彼は[親切だし]、頭もいい。",s:"Él es amable y además inteligente.",h:"親切 + だ"}]},
{id:"ka-dou-ka",lv:10,t:"〜かどうか / 〜か (pregunta indirecta)",s:"informal + かどうか / interrogativo + informal + か",bp:"かどうか",e:"Pregunta incrustada: «si ... o no» / «qué, dónde, cuándo ...».",ex:[
 {j:"彼が来る[かどうか]分かりません。",s:"No sé si él vendrá o no."},
 {j:"どこに住んでいる[か]知っていますか。",s:"¿Sabes dónde vive?"},
 {j:"試験に合格した[かどうか]まだ分かりません。",s:"Aún no sé si aprobé el examen."}]},
// ---- nivel 11 ----
{id:"to-iu-noun",lv:11,t:"〜という + N",s:"N・frase + という + N",bp:"という",e:"«Llamado / que se llama» o «el hecho de que».",ex:[
 {j:"「さくら」[という]店を知っていますか。",s:"¿Conoces una tienda llamada Sakura?"},
 {j:"田中さんが結婚する[という]話を聞きました。",s:"Oí que Tanaka se casa."},
 {j:"これは何[という]花ですか。",s:"¿Cómo se llama esta flor?"}]},
{id:"ba-ii",lv:11,t:"〜ばいい / 〜たらいい",s:"V-ば・V-たら + いい(です)",bp:"ばいい",e:"Sugerencia: «bastaría con / deberías».",ex:[
 {j:"分からなかったら、先生に[聞けばいい]ですよ。",s:"Si no lo entiendes, basta con preguntar al profesor.",h:"聞く + ば"},
 {j:"疲れたら[休めばいい]。",s:"Si estás cansado, descansa.",h:"休む + ば"},
 {j:"どう[すればいい]ですか。",s:"¿Qué debería hacer?",h:"する + ば"}]},
{id:"nasai",lv:11,t:"〜なさい",s:"V-ます + なさい",bp:"なさい",e:"Orden suave (padres a hijos, profesores): «haz ...».",ex:[
 {j:"早く[寝なさい]。",s:"Acuéstate ya.",h:"寝る"},
 {j:"野菜も[食べなさい]。",s:"Come también verdura.",h:"食べる"},
 {j:"静かに[しなさい]。",s:"Estate callado.",h:"する"}]},
{id:"imperative",lv:11,t:"Imperativo 〜ろ / 〜え y prohibitivo 〜な",s:"G1: u→e (行く→行け); G2: る→ろ; する→しろ; 来る→来い / V-る + な",bp:"Imperative",e:"Orden brusca (hombres, señales, emergencias). V-る + な: prohibición brusca.",ex:[
 {j:"危ない！[逃げろ]！",s:"¡Peligro! ¡Huye!",h:"逃げる"},
 {j:"ここに[入るな]。",s:"No entres aquí.",h:"入る + な"},
 {j:"もっと[頑張れ]！",s:"¡Esfuérzate más!",h:"頑張る"}]},
{id:"te-hoshii",lv:11,t:"〜てほしい",s:"V-て + ほしい / V-ない + でほしい",bp:"てほしい",e:"Querer que otra persona haga algo.",ex:[
 {j:"もっとゆっくり[話してほしい]です。",s:"Quiero que hables más despacio.",h:"話す"},
 {j:"ここに[来てほしい]。",s:"Quiero que vengas aquí.",h:"来る"},
 {j:"タバコを[吸わないでほしい]。",s:"Quiero que no fumes.",h:"吸う, negativo"}]},
{id:"to-ii",lv:11,t:"〜といい / 〜たらいい (deseo)",s:"V-る + といい(ですね)",bp:"といい",e:"Deseo: «ojalá / estaría bien que».",ex:[
 {j:"明日晴れる[といい]ですね。",s:"Ojalá mañana haga sol."},
 {j:"早く[元気になるといい]ですね。",s:"Espero que te recuperes pronto.",h:"元気になる"},
 {j:"試験に[合格できるといい]なあ。",s:"Ojalá pueda aprobar el examen.",h:"合格できる"}]},
{id:"mama",lv:11,t:"〜まま",s:"V-た・V-ない・N + の + まま",bp:"まま",e:"Sin cambiar el estado: «tal como está».",ex:[
 {j:"[電気をつけたまま]寝てしまった。",s:"Me dormí con la luz encendida.",h:"つける"},
 {j:"[靴のまま]入らないでください。",s:"No entre con los zapatos puestos.",h:"靴 + の"},
 {j:"窓を[開けたまま]出かけました。",s:"Salí dejando la ventana abierta.",h:"開ける"}]},
// ---- nivel 12 ----
{id:"bakari",lv:12,t:"〜ばかり / 〜たばかり",s:"N + ばかり / V-て + ばかりいる / V-た + ばかり",bp:"ばかり",e:"ばかり: solo, nada más que. たばかり: acabar de hacer.",ex:[
 {j:"さっき[食べたばかり]です。",s:"Acabo de comer.",h:"食べる + たばかり"},
 {j:"弟は[遊んでばかり]います。",s:"Mi hermano menor no hace más que jugar.",h:"遊ぶ + てばかり"},
 {j:"甘い物[ばかり]食べています。",s:"Solo come dulces."}]},
{id:"tokoro",lv:12,t:"〜ところ (momento)",s:"V-る + ところ / V-ている + ところ / V-た + ところ",bp:"ところ",e:"るところ: a punto de. ているところ: en medio de. たところ: justo acabar de.",ex:[
 {j:"今から[出かけるところ]です。",s:"Estoy a punto de salir.",h:"出かける"},
 {j:"今、ご飯を[作っているところ]です。",s:"Ahora estoy preparando la comida.",h:"作る + ている"},
 {j:"今[帰ったところ]です。",s:"Acabo de volver ahora mismo.",h:"帰る + た"}]},
{id:"sou-ni-nai",lv:12,t:"〜そうもない / 〜そうにない",s:"V-ます + そうもない",bp:"そうにない",e:"«No parece que vaya a ...».",ex:[
 {j:"雨は[やみそうにない]。",s:"No parece que vaya a parar de llover.",h:"やむ"},
 {j:"今日は仕事が[終わりそうもありません]。",s:"Hoy no parece que el trabajo vaya a terminar.",h:"終わる, cortés"},
 {j:"この問題は[解けそうにない]。",s:"No parece que pueda resolver este problema.",h:"解ける"}]},
{id:"ka-shira-ka-na",lv:12,t:"〜かな / 〜かしら",s:"informal + かな",bp:"かな",e:"Duda o pregunta a uno mismo: «me pregunto si».",ex:[
 {j:"明日は晴れる[かな]。",s:"¿Hará sol mañana? (me pregunto)"},
 {j:"彼は来る[かな]。",s:"¿Vendrá él?"},
 {j:"これでいい[かな]。",s:"¿Estará bien así?"}]},
{id:"darou-to-omou",lv:12,t:"〜だろうと思う",s:"informal + だろうと思う",bp:"だろうと思う",e:"Conjetura suavizada: «supongo que».",ex:[
 {j:"彼は来ない[だろうと思います]。",s:"Supongo que él no vendrá."},
 {j:"明日は雨[だろうと思う]。",s:"Supongo que mañana lloverá."},
 {j:"試験は難しい[だろうと思います]。",s:"Supongo que el examen será difícil."}]},
{id:"ni-tsuite",lv:12,t:"〜について / 〜によると",s:"N + について / N + によると",bp:"について",e:"について: acerca de. によると: según (fuente de información).",ex:[
 {j:"日本の歴史[について]勉強しています。",s:"Estudio sobre la historia de Japón."},
 {j:"天気予報[によると]、明日は雪だそうです。",s:"Según el pronóstico, mañana nevará."},
 {j:"この問題[について]どう思いますか。",s:"¿Qué opinas sobre este problema?"}]},
{id:"ndesu-ga",lv:12,t:"〜んですが / 〜のですが",s:"informal + んですが、…",bp:"んですが",e:"Introduce una situación antes de pedir algo: «resulta que ..., y ...».",ex:[
 {j:"道が分からない[んですが]、教えていただけませんか。",s:"No sé el camino, ¿podría indicármelo?"},
 {j:"予約をしたい[んですが]。",s:"Querría hacer una reserva."},
 {j:"頭が痛い[んですが]、帰ってもいいですか。",s:"Me duele la cabeza, ¿puedo irme?"}]},
// ---- nivel 13 ----
{id:"te-itadakemasenka",lv:13,t:"〜ていただけませんか / 〜てくださいませんか",s:"V-て + いただけませんか",bp:"ていただけませんか",e:"Petición muy cortés: «¿podría usted ...?».",ex:[
 {j:"もう一度[説明していただけませんか]。",s:"¿Podría explicarlo otra vez?",h:"説明する + ていただけませんか"},
 {j:"写真を[撮ってくださいませんか]。",s:"¿Podría hacernos una foto?",h:"撮る + てくださいませんか"},
 {j:"ここに[書いていただけませんか]。",s:"¿Podría escribir aquí?",h:"書く + ていただけませんか"}]},
{id:"sasete-kudasai",lv:13,t:"〜させてください / 〜させていただく",s:"V-causativo-て + ください / いただく",bp:"させてください",e:"Pedir permiso con humildad: «permítame hacer».",ex:[
 {j:"少し[休ませてください]。",s:"Permítame descansar un poco.",h:"休む, causativo + ください"},
 {j:"私に[払わせてください]。",s:"Déjeme pagar a mí.",h:"払う, causativo"},
 {j:"自己紹介を[させていただきます]。",s:"Permítanme presentarme.",h:"する, causativo + いただく"}]},
{id:"te-kara-tsuite",lv:13,t:"〜によって / 〜にとって",s:"N + によって / N + にとって",bp:"によって",e:"によって: según, dependiendo de; por medio de; por (agente). にとって: para (desde el punto de vista de).",ex:[
 {j:"国[によって]習慣が違います。",s:"Las costumbres varían según el país."},
 {j:"私[にとって]家族が一番大切です。",s:"Para mí, la familia es lo más importante."},
 {j:"この寺は八世紀に[建てられました]。",s:"Este templo fue construido en el siglo VIII.",h:"建てる, pasiva pasado"}]},
{id:"no-ni-kuraberu",lv:13,t:"〜ば〜ほど",s:"V-ば + V-る + ほど / adj-ければ + adj-い + ほど",bp:"ば〜ほど",e:"«Cuanto más ..., más ...».",ex:[
 {j:"[練習すればするほど]上手になります。",s:"Cuanto más practicas, mejor te vuelves.",h:"練習する"},
 {j:"[安ければ安いほど]いいです。",s:"Cuanto más barato, mejor.",h:"安い"},
 {j:"[考えれば考えるほど]分からなくなる。",s:"Cuanto más lo pienso, menos lo entiendo.",h:"考える"}]},
{id:"koto-ga-aru-n4",lv:13,t:"〜ことがある (a veces ocurre)",s:"V-る + ことがある",bp:"ことがある",e:"«A veces pasa que ...». Diferente de たことがある (experiencia).",ex:[
 {j:"たまに朝ご飯を[食べないことがあります]。",s:"A veces no desayuno.",h:"食べる, negativo"},
 {j:"週末は仕事に[行くことがある]。",s:"A veces voy a trabajar el fin de semana.",h:"行く"},
 {j:"電車が[遅れることがあります]。",s:"A veces el tren se retrasa.",h:"遅れる"}]},
{id:"to-ieba",lv:13,t:"〜といえば / 〜と言われている",s:"N + といえば / informal + と言われている",bp:"といえば",e:"といえば: hablando de. と言われている: se dice que.",ex:[
 {j:"日本[といえば]、やっぱり寿司ですね。",s:"Hablando de Japón, lo típico es el sushi."},
 {j:"富士山は日本で一番美しい山だ[と言われています]。",s:"Se dice que el Fuji es la montaña más bella de Japón."},
 {j:"京都[といえば]、お寺が有名です。",s:"Hablando de Kioto, son famosos sus templos."}]},
{id:"zu-ni",lv:13,t:"〜ずに / 〜ないで",s:"V-ない (sin ない) + ずに (する→せずに) / V-ないで",bp:"ずに",e:"«Sin hacer ...». ずに es más formal o escrito.",ex:[
 {j:"朝ご飯を[食べずに]出かけました。",s:"Salí sin desayunar.",h:"食べる + ずに"},
 {j:"辞書を[使わないで]読んでみてください。",s:"Intenta leerlo sin usar el diccionario.",h:"使う + ないで"},
 {j:"何も[言わずに]帰ってしまった。",s:"Se fue sin decir nada.",h:"言う + ずに"}]}
];
