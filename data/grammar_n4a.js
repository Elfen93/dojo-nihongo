const GRAMMAR_N4A = [
// ---- nivel 4 ----
{id:"potential",lv:4,t:"Forma potencial 〜られる / 〜える",s:"G1: u→eru (書く→書ける); G2: る→られる; する→できる; 来る→来られる",bp:"Potential Verbs",e:"Capacidad: «poder hacer». El objeto suele tomar が. Más natural que ことができる en conversación.",ex:[
 {j:"私は漢字が[読めます]。",s:"Puedo leer kanji.",h:"読む"},
 {j:"納豆が[食べられますか]。",s:"¿Puedes comer natto?",h:"食べる, pregunta"},
 {j:"明日は[来られません]。",s:"Mañana no puedo venir.",h:"来る, negativo"}]},
{id:"volitional",lv:4,t:"Forma volitiva 〜よう / 〜おう",s:"G1: u→ou (行く→行こう); G2: る→よう; する→しよう; 来る→来よう",bp:"Volitional Form",e:"«Vamos a / voy a» informal. Con と思う expresa intención: 行こうと思います.",ex:[
 {j:"一緒に[行こう]。",s:"Vayamos juntos.",h:"行く"},
 {j:"来年日本に[留学しようと思います]。",s:"Pienso ir a estudiar a Japón el año que viene.",h:"留学する + と思う"},
 {j:"もっと野菜を[食べよう]と思っています。",s:"Estoy pensando en comer más verdura.",h:"食べる"}]},
{id:"you-to-omou",lv:4,t:"〜ようと思う / 〜つもり",s:"V-volitiva + と思う / V-る + つもりです",bp:"つもり",e:"Intención. つもり expresa un plan más firme y decidido.",ex:[
 {j:"週末は家で[休むつもり]です。",s:"Pienso descansar en casa el fin de semana.",h:"休む + つもり"},
 {j:"タバコを[やめようと思います]。",s:"Pienso dejar de fumar.",h:"やめる + volitiva"},
 {j:"来年は車を[買わないつもり]です。",s:"No tengo intención de comprar coche el año que viene.",h:"買う, negativo + つもり"}]},
{id:"te-shimau",lv:4,t:"〜てしまう / 〜ちゃう",s:"V-て + しまう (informal: ちゃう／じゃう)",bp:"てしまう",e:"Acción completada del todo, o lamento por algo que pasó sin querer.",ex:[
 {j:"財布を[なくしてしまいました]。",s:"He perdido la cartera (lamentablemente).",h:"なくす"},
 {j:"ケーキを全部[食べてしまった]。",s:"Me comí todo el pastel.",h:"食べる, pasado"},
 {j:"宿題を[忘れちゃった]。",s:"Se me olvidaron los deberes.",h:"忘れる, informal ちゃう"}]},
{id:"te-oku",lv:4,t:"〜ておく",s:"V-て + おく",bp:"ておく",e:"Hacer algo de antemano como preparación, o dejar algo como está.",ex:[
 {j:"旅行の前にホテルを[予約しておきます]。",s:"Antes del viaje reservo el hotel.",h:"予約する"},
 {j:"ビールを冷蔵庫に[入れておいた]。",s:"Dejé cerveza en la nevera (preparada).",h:"入れる, pasado"},
 {j:"窓は[開けておいて]ください。",s:"Deja la ventana abierta.",h:"開ける + ください"}]},
{id:"te-miru",lv:4,t:"〜てみる",s:"V-て + みる",bp:"てみる",e:"Probar a hacer algo para ver qué pasa.",ex:[
 {j:"この服を[着てみても]いいですか。",s:"¿Puedo probarme esta ropa?",h:"着る + てもいい"},
 {j:"一度[食べてみてください]。",s:"Pruébalo una vez.",h:"食べる + ください"},
 {j:"新しい方法を[試してみました]。",s:"Probé un método nuevo.",h:"試す, pasado"}]},
{id:"te-ageru",lv:4,t:"〜てあげる / 〜てくれる / 〜てもらう",s:"V-て + あげる・くれる・もらう",bp:"てあげる",e:"Dar y recibir acciones. あげる: yo hago por otro. くれる: otro hace por mí. もらう: recibo que otro haga (sujeto soy yo, la persona toma に).",ex:[
 {j:"友だちが駅まで[送ってくれました]。",s:"Un amigo me llevó hasta la estación.",h:"送る, otro para mí"},
 {j:"先生に漢字を[教えてもらいました]。",s:"El profesor me enseñó kanji (lo recibí).",h:"教える, recibí"},
 {j:"弟に本を[読んであげました]。",s:"Le leí un libro a mi hermano menor.",h:"読む, yo para otro"}]},
// ---- nivel 5 ----
{id:"nakereba-naranai",lv:5,t:"〜なければならない / 〜なくてはいけない",s:"V-ない (sin い) + ければならない / くてはいけない",bp:"なければならない",e:"Obligación: «tengo que». Informal: なきゃ / なくちゃ.",ex:[
 {j:"明日早く[起きなければなりません]。",s:"Mañana tengo que levantarme temprano.",h:"起きる"},
 {j:"薬を[飲まなくてはいけません]。",s:"Tengo que tomar la medicina.",h:"飲む, なくては"},
 {j:"もう[帰らなきゃ]。",s:"Ya tengo que irme.",h:"帰る, informal なきゃ"}]},
{id:"nakute-mo-ii",lv:5,t:"〜なくてもいい",s:"V-ない (sin い) + くてもいい",bp:"なくてもいい",e:"No es necesario hacer algo.",ex:[
 {j:"明日は[来なくてもいい]です。",s:"Mañana no hace falta que vengas.",h:"来る"},
 {j:"全部[食べなくてもいい]ですよ。",s:"No hace falta que te lo comas todo.",h:"食べる"},
 {j:"急いで[書かなくてもいい]です。",s:"No hace falta escribirlo deprisa.",h:"書く"}]},
{id:"ba-conditional",lv:5,t:"Condicional 〜ば",s:"G1: u→eba; G2: る→れば; adj-い→ければ; N・な-adj→なら(ば)",bp:"ば",e:"Condición hipotética: «si ...». Negativo: なければ.",ex:[
 {j:"時間が[あれば]、行きます。",s:"Si hay tiempo, voy.",h:"ある"},
 {j:"[安ければ]買います。",s:"Si es barato, lo compro.",h:"安い"},
 {j:"[急がなければ]間に合いません。",s:"Si no te das prisa, no llegarás.",h:"急ぐ, negativo"}]},
{id:"tara",lv:5,t:"Condicional 〜たら",s:"V-た + ら / adj-い + かったら / N + だったら",bp:"たら",e:"«Si / cuando ...». Muy flexible; también «después de que».",ex:[
 {j:"駅に[着いたら]電話してください。",s:"Cuando llegues a la estación, llámame.",h:"着く"},
 {j:"[雨だったら]行きません。",s:"Si llueve, no voy.",h:"雨 + だったら"},
 {j:"お金が[あったら]旅行したいです。",s:"Si tuviera dinero, querría viajar.",h:"ある"}]},
{id:"to-conditional",lv:5,t:"〜と (condición natural)",s:"V-る・V-ない + と",bp:"と (conditional)",e:"Consecuencia automática o natural: «siempre que / al hacer...». No se usa con voluntad, órdenes ni peticiones.",ex:[
 {j:"このボタンを[押すと]、ドアが開きます。",s:"Al pulsar este botón, se abre la puerta.",h:"押す"},
 {j:"春に[なると]、花が咲きます。",s:"Cuando llega la primavera, florecen las flores.",h:"なる"},
 {j:"まっすぐ[行くと]、駅があります。",s:"Si vas recto, está la estación.",h:"行く"}]},
{id:"nara",lv:5,t:"〜なら",s:"N・frase informal + なら",bp:"なら",e:"Condición basada en lo que ha dicho el interlocutor: «si es el caso de que / si hablamos de».",ex:[
 {j:"日本に行く[なら]、京都がいいですよ。",s:"Si vas a Japón, Kioto está bien."},
 {j:"寿司[なら]、あの店がおいしいです。",s:"Si hablamos de sushi, ese restaurante es bueno."},
 {j:"明日[なら]暇です。",s:"Si es mañana, estoy libre."}]},
{id:"kamoshirenai",lv:5,t:"〜かもしれない",s:"frase informal + かもしれない",bp:"かもしれない",e:"Posibilidad: «quizá, puede que».",ex:[
 {j:"明日は雨が[降るかもしれません]。",s:"Puede que mañana llueva.",h:"降る"},
 {j:"彼は[来ないかもしれない]。",s:"Quizá él no venga.",h:"来る, negativo"},
 {j:"この店は[高いかもしれません]。",s:"Puede que esta tienda sea cara.",h:"高い"}]},
// ---- nivel 6 ----
{id:"deshou",lv:6,t:"〜でしょう / 〜だろう",s:"frase informal + でしょう",bp:"でしょう",e:"Conjetura: «probablemente». Con entonación ascendente, busca confirmación.",ex:[
 {j:"明日は晴れる[でしょう]。",s:"Mañana probablemente haga sol."},
 {j:"彼はもう帰った[だろう]。",s:"Él ya se habrá ido, supongo.",h:"informal"},
 {j:"この問題は難しい[でしょう]。",s:"Este problema debe de ser difícil."}]},
{id:"sou-desu-looks",lv:6,t:"〜そうです (parece que)",s:"V-ます + そう / adj-い (sin い) + そう / adj-な + そう",bp:"そうです (looks like)",e:"Apariencia por lo que se ve: «parece que». いい→よさそう, ない→なさそう.",ex:[
 {j:"このケーキは[おいしそう]です。",s:"Este pastel parece delicioso.",h:"おいしい"},
 {j:"雨が[降りそう]です。",s:"Parece que va a llover.",h:"降る"},
 {j:"彼は[元気そう]でした。",s:"Parecía estar bien.",h:"元気"}]},
{id:"sou-desu-hearsay",lv:6,t:"〜そうです (dicen que)",s:"frase informal + そうです",bp:"そうです (hearsay)",e:"Información de oídas: «he oído que / dicen que». Se une a la forma informal completa.",ex:[
 {j:"天気予報によると、明日は[雪だそう]です。",s:"Según el pronóstico, dicen que mañana nevará.",h:"雪 + だ"},
 {j:"あの店は[おいしいそう]です。",s:"Dicen que ese restaurante es bueno.",h:"おいしい"},
 {j:"田中さんは会社を[やめるそう]です。",s:"He oído que Tanaka deja la empresa.",h:"やめる"}]},
{id:"you-da",lv:6,t:"〜ようだ / 〜みたい",s:"informal + ようだ (N + のようだ) / informal + みたいだ",bp:"ようだ",e:"Parece (por indicios o impresión); también «como» en comparaciones. みたい es coloquial.",ex:[
 {j:"誰か来た[ようです]。",s:"Parece que ha venido alguien."},
 {j:"彼は日本人[みたい]ですね。",s:"Parece japonés, ¿no?",h:"coloquial"},
 {j:"今日は冬[のよう]に寒いです。",s:"Hoy hace frío como en invierno.",h:"N + のよう"}]},
{id:"rashii",lv:6,t:"〜らしい",s:"informal + らしい / N + らしい",bp:"らしい",e:"«Parece que / he oído que» (con base en información externa). N + らしい: típico de (男らしい).",ex:[
 {j:"田中さんは来週日本へ帰る[らしい]です。",s:"Parece que Tanaka vuelve a Japón la semana que viene."},
 {j:"あの店は[おいしいらしい]。",s:"Dicen que ese restaurante es bueno.",h:"おいしい"},
 {j:"今日は[春らしい]天気です。",s:"Hoy hace un tiempo típico de primavera.",h:"春 + らしい"}]},
{id:"hazu",lv:6,t:"〜はずだ / 〜はずがない",s:"informal + はずだ (N + のはず, な-adj + なはず)",bp:"はず",e:"Deducción firme: «debería ser / seguro que». はずがない: es imposible.",ex:[
 {j:"彼はもう着いている[はず]です。",s:"Él debería haber llegado ya."},
 {j:"そんな[はずがない]。",s:"Eso es imposible.",h:"negación"},
 {j:"今日は[休みのはず]です。",s:"Hoy debería ser festivo.",h:"N + の"}]},
{id:"noni",lv:6,t:"〜のに",s:"informal + のに (N・な-adj + なのに)",bp:"のに",e:"«A pesar de que, aunque»: contraste con sorpresa o queja.",ex:[
 {j:"たくさん勉強した[のに]、試験に落ちました。",s:"A pesar de estudiar mucho, suspendí el examen."},
 {j:"[雨なのに]出かけました。",s:"Salió aunque llovía.",h:"雨 + なのに"},
 {j:"薬を飲んだ[のに]、治りません。",s:"Aunque tomé la medicina, no me curo."}]},
// ---- nivel 7 ----
{id:"passive",lv:7,t:"Voz pasiva 〜られる / 〜される",s:"G1: a + れる (書く→書かれる); G2: る→られる; する→される; 来る→来られる",bp:"Passive Verbs",e:"Pasiva: el agente toma に. También pasiva de molestia (雨に降られた).",ex:[
 {j:"先生に[ほめられました]。",s:"El profesor me elogió (fui elogiado).",h:"ほめる"},
 {j:"この本は多くの人に[読まれています]。",s:"Este libro es leído por mucha gente.",h:"読む + ている"},
 {j:"電車で足を[踏まれました]。",s:"Me pisaron en el tren.",h:"踏む"}]},
{id:"causative",lv:7,t:"Causativo 〜させる / 〜せる",s:"G1: a + せる (行く→行かせる); G2: る→させる; する→させる; 来る→来させる",bp:"Causative Verbs",e:"Hacer o dejar que alguien haga algo. La persona toma に (verbos transitivos) o を (intransitivos).",ex:[
 {j:"母は弟に野菜を[食べさせました]。",s:"Mi madre hizo que mi hermano comiera verdura.",h:"食べる"},
 {j:"先生は学生を[立たせました]。",s:"El profesor hizo levantarse al estudiante.",h:"立つ"},
 {j:"子どもを一人で[行かせない]でください。",s:"No deje ir al niño solo.",h:"行く, negativo"}]},
{id:"causative-passive",lv:7,t:"Causativo-pasivo 〜させられる",s:"G1: a + される (飲む→飲まされる); G2: る→させられる",bp:"Causative-Passive",e:"Ser obligado a hacer algo contra la voluntad.",ex:[
 {j:"先輩にお酒を[飲まされました]。",s:"Un veterano me obligó a beber.",h:"飲む"},
 {j:"毎日残業を[させられています]。",s:"Me obligan a hacer horas extra cada día.",h:"する + ている"},
 {j:"子どものころ、ピアノを[習わされました]。",s:"De niño me obligaron a aprender piano.",h:"習う"}]},
{id:"te-kuru-iku",lv:7,t:"〜ていく / 〜てくる",s:"V-て + いく / くる",bp:"ていく",e:"Dirección en el tiempo o espacio: てくる (hacia el hablante / hasta ahora), ていく (alejándose / de ahora en adelante).",ex:[
 {j:"だんだん暖かく[なってきました]。",s:"Ha ido haciendo más calor.",h:"なる + てくる, pasado"},
 {j:"これからも日本語を[勉強していきます]。",s:"Seguiré estudiando japonés de ahora en adelante.",h:"勉強する + ていく"},
 {j:"ちょっと飲み物を[買ってきます]。",s:"Voy a comprar algo de beber (y vuelvo).",h:"買う + てくる"}]},
{id:"te-aru",lv:7,t:"〜てある",s:"V-transitivo-て + ある",bp:"てある",e:"Estado resultante de una acción hecha a propósito por alguien. El objeto toma が.",ex:[
 {j:"窓が[開けてあります]。",s:"La ventana está abierta (alguien la abrió).",h:"開ける"},
 {j:"壁に地図が[はってあります]。",s:"Hay un mapa pegado en la pared.",h:"はる"},
 {j:"晩ご飯はもう[作ってあります]。",s:"La cena ya está hecha.",h:"作る"}]},
{id:"transitive-intransitive",lv:7,t:"Verbos transitivos e intransitivos",s:"N + を + V-trans / N + が + V-intrans",bp:"Transitive/Intransitive",e:"Pares como 開ける/開く, 閉める/閉まる, 止める/止まる, 始める/始まる. El transitivo toma を; el intransitivo, が.",ex:[
 {j:"ドアが[閉まりました]。",s:"La puerta se cerró.",h:"intransitivo, pasado"},
 {j:"電気を[つけてください]。",s:"Enciende la luz, por favor.",h:"transitivo つける + ください"},
 {j:"授業が[始まります]。",s:"Empieza la clase.",h:"intransitivo"}]},
{id:"sugiru",lv:7,t:"〜すぎる",s:"V-ます + すぎる / adj-い (sin い) + すぎる / adj-な + すぎる",bp:"すぎる",e:"Exceso: «demasiado».",ex:[
 {j:"昨日[飲みすぎました]。",s:"Ayer bebí demasiado.",h:"飲む, pasado"},
 {j:"この靴は[大きすぎます]。",s:"Estos zapatos son demasiado grandes.",h:"大きい"},
 {j:"この問題は[簡単すぎる]。",s:"Este problema es demasiado fácil.",h:"簡単"}]},
// ---- nivel 8 ----
{id:"yasui-nikui",lv:8,t:"〜やすい / 〜にくい",s:"V-ます + やすい / にくい",bp:"やすい",e:"Fácil de / difícil de hacer.",ex:[
 {j:"この本は[読みやすい]です。",s:"Este libro es fácil de leer.",h:"読む"},
 {j:"この薬は[飲みにくい]です。",s:"Esta medicina es difícil de tomar.",h:"飲む"},
 {j:"先生の説明は[分かりやすかった]です。",s:"La explicación del profesor fue fácil de entender.",h:"分かる, pasado"}]},
{id:"hajimeru-owaru",lv:8,t:"〜始める / 〜終わる / 〜続ける",s:"V-ます + 始める・終わる・続ける",bp:"始める",e:"Empezar a / terminar de / seguir haciendo.",ex:[
 {j:"去年日本語を[習い始めました]。",s:"Empecé a aprender japonés el año pasado.",h:"習う + 始める"},
 {j:"レポートを[書き終わりました]。",s:"Terminé de escribir el informe.",h:"書く + 終わる"},
 {j:"雨が[降り続けています]。",s:"Sigue lloviendo.",h:"降る + 続ける + ている"}]},
{id:"nagara",lv:8,t:"〜ながら",s:"V-ます + ながら",bp:"ながら",e:"Dos acciones simultáneas del mismo sujeto. La principal va al final.",ex:[
 {j:"音楽を[聞きながら]勉強します。",s:"Estudio escuchando música.",h:"聞く"},
 {j:"[歩きながら]話しましょう。",s:"Hablemos mientras caminamos.",h:"歩く"},
 {j:"テレビを[見ながら]ご飯を食べました。",s:"Comí viendo la tele.",h:"見る"}]},
{id:"aida-ni",lv:8,t:"〜間 / 〜間に",s:"V-ている・N + の + 間(に)",bp:"間に",e:"間: durante todo el periodo. 間に: en algún momento dentro del periodo.",ex:[
 {j:"[留守の間に]泥棒が入りました。",s:"Mientras no estaba entró un ladrón.",h:"留守 + の + 間に"},
 {j:"夏休みの[間]、ずっと働きました。",s:"Durante las vacaciones de verano trabajé todo el tiempo."},
 {j:"寝ている[間に]地震がありました。",s:"Mientras dormía hubo un terremoto."}]},
{id:"uchi-ni",lv:8,t:"〜うちに",s:"V-る・V-ている・adj + うちに / N + の + うちに",bp:"うちに",e:"«Mientras todavía ...» (antes de que cambie la situación).",ex:[
 {j:"[温かいうちに]食べてください。",s:"Cómelo mientras está caliente.",h:"温かい"},
 {j:"[明るいうちに]帰りましょう。",s:"Volvamos mientras haya luz.",h:"明るい"},
 {j:"[忘れないうちに]メモします。",s:"Lo apunto antes de que se me olvide.",h:"忘れる, negativo"}]},
{id:"toki",lv:8,t:"〜時",s:"V-る・V-た・adj・N + の + 時",bp:"時",e:"«Cuando». V-る時: antes/al momento de; V-た時: después de que ocurriera.",ex:[
 {j:"日本に[行く時]、カメラを買いました。",s:"Cuando iba a ir a Japón, compré una cámara (antes).",h:"行く, aún no ha ido"},
 {j:"日本に[行った時]、カメラを買いました。",s:"Cuando fui a Japón, compré una cámara (allí).",h:"行く, ya allí"},
 {j:"[子どもの時]、よく泳ぎました。",s:"De niño nadaba mucho.",h:"子ども + の"}]},
{id:"ato-de",lv:8,t:"〜後で / 〜てから",s:"V-た + 後で / N + の + 後で",bp:"後で",e:"Después de ...",ex:[
 {j:"[食べた後で]薬を飲みます。",s:"Después de comer tomo la medicina.",h:"食べる"},
 {j:"[仕事の後で]飲みに行きました。",s:"Después del trabajo fui a tomar algo.",h:"仕事 + の"},
 {j:"宿題を[した後で]遊びます。",s:"Juego después de hacer los deberes.",h:"する"}]}
];
