// Puntos adicionales N5/N4 con la granularidad de Bunpro
const GRAMMAR_EXTRA = [
// ---- nivel 1 ----
{id:"deshita",lv:1,t:"〜でした / 〜じゃありませんでした",s:"N + でした / N + じゃありませんでした",bp:"でした",e:"Pasado de la cópula: afirmativo でした, negativo じゃありませんでした (o ではありませんでした).",ex:[
 {j:"昨日は休み[でした]。",s:"Ayer fue festivo."},
 {j:"あの人は先生[じゃありませんでした]。",s:"Esa persona no era profesor.",h:"pasado negativo"},
 {j:"テストは簡単[でした]。",s:"El examen fue fácil."}]},
{id:"he-direction",lv:1,t:"〜へ (dirección)",s:"N(lugar) + へ",bp:"へ",e:"Marca la dirección del movimiento. Se lee «e». Intercambiable con に en la mayoría de casos.",ex:[
 {j:"来週、大阪[へ]行きます。",s:"La semana que viene voy a Osaka."},
 {j:"学校[へ]歩いて行きます。",s:"Voy andando a la escuela."},
 {j:"家[へ]帰りましょう。",s:"Volvamos a casa."}]},
{id:"ni-location",lv:1,t:"〜に (lugar de existencia)",s:"N(lugar) + に + ある・いる・住む",bp:"に (location)",e:"Con verbos de existencia o permanencia (ある, いる, 住む, 座る) el lugar toma に, no で.",ex:[
 {j:"犬は庭[に]います。",s:"El perro está en el jardín."},
 {j:"東京[に]住んでいます。",s:"Vivo en Tokio."},
 {j:"いす[に]座ってください。",s:"Siéntese en la silla."}]},
{id:"to-with",lv:1,t:"〜と (con alguien)",s:"N(persona) + と + V",bp:"と (with)",e:"«Con»: la persona con la que se hace la acción.",ex:[
 {j:"友だち[と]映画を見ました。",s:"Vi una película con un amigo."},
 {j:"誰[と]行きますか。",s:"¿Con quién vas?"},
 {j:"家族[と]旅行します。",s:"Viajo con mi familia."}]},
// ---- nivel 2 ----
{id:"masen-ka-invite",lv:2,t:"〜ましょうか",s:"V-ます + しょうか",bp:"ましょうか",e:"Ofrecer ayuda («¿le ayudo a…?») o proponer («¿qué tal si…?»).",ex:[
 {j:"荷物を[持ちましょうか]。",s:"¿Le llevo el equipaje?",h:"持つ"},
 {j:"窓を[開けましょうか]。",s:"¿Abro la ventana?",h:"開ける"},
 {j:"そろそろ[帰りましょうか]。",s:"¿Nos vamos ya?",h:"帰る"}]},
{id:"kudasai-noun",lv:2,t:"〜をください",s:"N + を + ください",bp:"ください",e:"Pedir un objeto: «deme…, por favor».",ex:[
 {j:"水[をください]。",s:"Agua, por favor."},
 {j:"これ[をください]。",s:"Deme esto, por favor."},
 {j:"切符を二枚[ください]。",s:"Dos billetes, por favor."}]},
{id:"ga-arimasu-have",lv:2,t:"〜があります (tener / haber evento)",s:"N + があります",bp:"があります",e:"Además de existencia, expresa posesión (お金がある) o que ocurre un evento (試験がある).",ex:[
 {j:"明日、試験[があります]。",s:"Mañana hay examen."},
 {j:"時間[がありません]。",s:"No tengo tiempo.",h:"negativo"},
 {j:"質問[があります]。",s:"Tengo una pregunta."}]},
{id:"te-kara",lv:2,t:"〜てから",s:"V-て + から",bp:"てから",e:"«Después de hacer A, B». Marca secuencia clara.",ex:[
 {j:"手を[洗ってから]食べます。",s:"Como después de lavarme las manos.",h:"洗う"},
 {j:"仕事が[終わってから]電話します。",s:"Te llamo cuando termine el trabajo.",h:"終わる"},
 {j:"日本に[来てから]日本語を始めました。",s:"Empecé japonés después de venir a Japón.",h:"来る"}]},
{id:"ni-naru-time",lv:2,t:"〜に (frecuencia: 週に二回)",s:"periodo + に + número de veces",bp:"に (frequency)",e:"Frecuencia: «X veces por (periodo)».",ex:[
 {j:"週[に]三回、ジムに行きます。",s:"Voy al gimnasio tres veces por semana."},
 {j:"一日[に]二回、薬を飲みます。",s:"Tomo la medicina dos veces al día."},
 {j:"月[に]一度、母に会います。",s:"Veo a mi madre una vez al mes."}]},
// ---- nivel 3 ----
{id:"amari-nai",lv:3,t:"あまり〜ない / 全然〜ない",s:"あまり + negativo / 全然 + negativo",bp:"あまり",e:"あまり: «no mucho». 全然: «nada en absoluto». Ambos con verbo negativo.",ex:[
 {j:"肉は[あまり]食べません。",s:"No como mucha carne."},
 {j:"漢字が[全然|ぜんぜん]分かりません。",s:"No entiendo nada de kanji."},
 {j:"最近[あまり]寝ていません。",s:"Últimamente no duermo mucho."}]},
{id:"mada-mou",lv:3,t:"まだ / もう",s:"まだ + V-ていない / もう + V-た",bp:"まだ",e:"まだ: todavía (no). もう: ya.",ex:[
 {j:"宿題は[まだ]終わっていません。",s:"Los deberes todavía no están terminados."},
 {j:"[もう]昼ご飯を食べましたか。",s:"¿Ya has almorzado?"},
 {j:"[まだ]九時です。",s:"Todavía son las nueve."}]},
{id:"nagara-kata",lv:3,t:"〜方 (manera de hacer)",s:"V-ます + 方",bp:"方",e:"Forma de hacer algo: 使い方, 読み方, 作り方.",ex:[
 {j:"この漢字の[読み方|よみかた]を教えてください。",s:"Dime cómo se lee este kanji.",h:"読む + 方"},
 {j:"カレーの[作り方|つくりかた]を知っていますか。",s:"¿Sabes cómo se hace el curry?",h:"作る + 方"},
 {j:"切符の[買い方|かいかた]が分かりません。",s:"No sé cómo comprar el billete.",h:"買う + 方"}]},
{id:"tsumori-desu-n5",lv:3,t:"〜でしょうか / 〜ますか (pregunta suave)",s:"frase + でしょうか",bp:"でしょうか",e:"Pregunta más suave y cortés que ですか.",ex:[
 {j:"この電車は東京に行く[でしょうか]。",s:"¿Este tren va a Tokio? (cortés)"},
 {j:"明日は晴れる[でしょうか]。",s:"¿Hará sol mañana?"},
 {j:"いくら[でしょうか]。",s:"¿Cuánto costará?"}]},
// ---- nivel 4 ----
{id:"koto-ni-naru",lv:4,t:"〜ことになる",s:"V-る・V-ない + ことになる",bp:"ことになる",e:"Algo queda decidido por circunstancias externas: «se ha decidido que». Diferente de ことにする (decisión propia).",ex:[
 {j:"来月から大阪で[働くことになりました]。",s:"Se ha decidido que trabajaré en Osaka desde el mes que viene.",h:"働く"},
 {j:"会議は中止[ということになりました]。",s:"Se decidió cancelar la reunión.",h:"という + ことになる"},
 {j:"日本に[留学することになった]。",s:"Al final voy a estudiar en Japón.",h:"留学する, informal"}]},
{id:"temo",lv:4,t:"〜ても / 〜でも (aunque)",s:"V-て + も / adj-い (くて) + も / N・adj-な + でも",bp:"ても",e:"«Aunque, incluso si». Con interrogativos: 何でも, 誰でも, いつでも.",ex:[
 {j:"雨が[降っても]行きます。",s:"Aunque llueva, voy.",h:"降る"},
 {j:"[高くても]買います。",s:"Aunque sea caro, lo compro.",h:"高い"},
 {j:"[日曜日でも]働きます。",s:"Trabajo incluso los domingos.",h:"日曜日 + でも"}]},
{id:"interrog-demo",lv:4,t:"何でも / 誰でも / いつでも / どこでも",s:"interrogativo + でも",bp:"でも (any)",e:"«Cualquier cosa / cualquiera / en cualquier momento / en cualquier lugar».",ex:[
 {j:"[何でも|なんでも]食べられます。",s:"Puedo comer cualquier cosa."},
 {j:"[いつでも]電話してください。",s:"Llámame en cualquier momento."},
 {j:"[誰でも|だれでも]参加できます。",s:"Cualquiera puede participar."}]},
{id:"interrog-ka",lv:4,t:"何か / 誰か / どこか / いつか",s:"interrogativo + か",bp:"か (some)",e:"«Algo / alguien / algún sitio / algún día».",ex:[
 {j:"[何か|なにか]飲みますか。",s:"¿Bebes algo?"},
 {j:"[誰か|だれか]来ました。",s:"Ha venido alguien."},
 {j:"[いつか]日本に住みたいです。",s:"Algún día quiero vivir en Japón."}]},
// ---- nivel 5 ----
{id:"interrog-mo-nai",lv:5,t:"何も / 誰も / どこも + negativo",s:"interrogativo + も + V-ない",bp:"も〜ない",e:"«Nada / nadie / ningún sitio» con verbo negativo.",ex:[
 {j:"冷蔵庫に[何も|なにも]ありません。",s:"No hay nada en la nevera."},
 {j:"教室に[誰も|だれも]いません。",s:"No hay nadie en el aula."},
 {j:"週末は[どこも]行きませんでした。",s:"El fin de semana no fui a ningún sitio."}]},
{id:"sugi-mae",lv:5,t:"〜すぎ / 〜前 (hora: 五時すぎ, 五時前)",s:"hora + すぎ / 前",bp:"すぎ",e:"«Pasadas las X» y «antes de las X».",ex:[
 {j:"三時[すぎ]に着きました。",s:"Llegué pasadas las tres."},
 {j:"九時[前]に家を出ます。",s:"Salgo de casa antes de las nueve."},
 {j:"十二時[すぎ]まで働きました。",s:"Trabajé hasta pasadas las doce."}]},
{id:"ndesu-ka-reason",lv:5,t:"〜ので",s:"informal + ので (N・な-adj + なので)",bp:"ので",e:"«Como, dado que»: razón más suave y objetiva que から. Con nombres y adjetivos な: なので.",ex:[
 {j:"雨[なので]、試合は中止です。",s:"Como llueve, el partido se cancela.",h:"雨 + なので"},
 {j:"[疲れたので]、早く寝ます。",s:"Como estoy cansado, me acuesto pronto.",h:"疲れる, pasado"},
 {j:"[安いので]、たくさん買いました。",s:"Como era barato, compré mucho.",h:"安い"}]},
{id:"hoshii",lv:5,t:"〜がほしい",s:"N + がほしい",bp:"ほしい",e:"Querer un objeto (no una acción: para eso, 〜たい). Se conjuga como adjetivo い.",ex:[
 {j:"新しい自転車[がほしい]です。",s:"Quiero una bicicleta nueva."},
 {j:"今は何も[ほしくない]です。",s:"Ahora no quiero nada.",h:"negativo"},
 {j:"子どものころ、犬[がほしかった]。",s:"De niño quería un perro.",h:"pasado"}]},
// ---- nivel 6 ----
{id:"garu",lv:6,t:"〜がる / 〜たがる",s:"adj-い (sin い) + がる / V-ます + たがる",bp:"がる",e:"Tercera persona muestra señales de un sentimiento o deseo: 寒がる, 行きたがる.",ex:[
 {j:"弟は犬を[ほしがっています]。",s:"Mi hermano menor quiere un perro (se le nota).",h:"ほしい + がる + ている"},
 {j:"娘は海に[行きたがっています]。",s:"Mi hija tiene ganas de ir al mar.",h:"行く + たがる"},
 {j:"彼は[寒がり]です。",s:"Él es friolero.",h:"寒い + がり"}]},
{id:"you-ni-iu",lv:6,t:"〜ように言う / 〜ように頼む",s:"V-る・V-ない + ように + 言う・頼む・伝える",bp:"ように言う",e:"Orden o petición indirecta: «decirle a alguien que haga…».",ex:[
 {j:"医者に酒を[やめるように]言われました。",s:"El médico me dijo que dejara el alcohol.",h:"やめる"},
 {j:"学生に[遅れないように]伝えてください。",s:"Diga a los estudiantes que no lleguen tarde.",h:"遅れる, negativo"},
 {j:"友だちに[来るように]頼みました。",s:"Le pedí a un amigo que viniera.",h:"来る"}]},
{id:"to-iu-koto",lv:6,t:"〜ということだ / 〜とのことだ",s:"informal + ということだ",bp:"ということだ",e:"Transmitir información: «dicen que, me han dicho que». Más formal que そうだ.",ex:[
 {j:"田中さんは今日休む[ということです]。",s:"Me han dicho que Tanaka hoy libra."},
 {j:"会議は来週[ということでした]。",s:"Dijeron que la reunión era la semana que viene.",h:"pasado"},
 {j:"店は十時に開く[とのことです]。",s:"Según me han dicho, la tienda abre a las diez."}]},
{id:"ka-mo",lv:6,t:"〜か〜 (A o B) / 〜か〜ないか",s:"N + か + N / V-る + か + V-ない + か",bp:"か (or)",e:"Alternativa: «A o B».",ex:[
 {j:"コーヒー[か]紅茶、どちらにしますか。",s:"¿Café o té, cuál prefieres?"},
 {j:"行く[か]行かないか、早く決めてください。",s:"Decide pronto si vas o no."},
 {j:"バス[か]電車で行きます。",s:"Voy en autobús o en tren."}]},
// ---- nivel 7 ----
{id:"mieru-kikoeru",lv:7,t:"見える / 聞こえる",s:"N + が + 見える・聞こえる",bp:"見える",e:"Percepción espontánea: «se ve / se oye», sin esfuerzo. Diferente de 見られる / 聞ける (poder, posibilidad).",ex:[
 {j:"ここから海[が見えます]。",s:"Desde aquí se ve el mar."},
 {j:"隣の部屋から音楽[が聞こえます]。",s:"Se oye música desde la habitación de al lado."},
 {j:"字が小さくて[見えません]。",s:"La letra es pequeña y no se ve.",h:"negativo"}]},
{id:"te-kureru-request",lv:7,t:"〜てくれませんか / 〜てもらえませんか",s:"V-て + くれませんか / もらえませんか",bp:"てくれませんか",e:"Petición cortés: «¿podrías…?». もらえませんか es un poco más suave.",ex:[
 {j:"もう一度[言ってくれませんか]。",s:"¿Podrías decirlo otra vez?",h:"言う"},
 {j:"写真を[撮ってもらえませんか]。",s:"¿Podría hacernos una foto?",h:"撮る"},
 {j:"駅まで[送ってくれませんか]。",s:"¿Me llevas hasta la estación?",h:"送る"}]},
{id:"ta-mama-n4",lv:7,t:"〜てばかりいる",s:"V-て + ばかりいる",bp:"てばかり",e:"«No hace más que…»: crítica por repetir una acción.",ex:[
 {j:"弟はゲームを[してばかりいます]。",s:"Mi hermano menor no hace más que jugar.",h:"する"},
 {j:"[寝てばかりいないで]、勉強しなさい。",s:"Deja de estar todo el día durmiendo y estudia.",h:"寝る + ないで"},
 {j:"彼は[文句を言ってばかりいる]。",s:"Él no hace más que quejarse.",h:"文句を言う"}]},
{id:"ni-kuraberu",lv:7,t:"〜と比べて / 〜に比べて",s:"N + と比べて / に比べて",bp:"に比べて",e:"«Comparado con».",ex:[
 {j:"去年[に比べて|にくらべて]、今年は暖かいです。",s:"Comparado con el año pasado, este año hace calor."},
 {j:"東京[と比べて|とくらべて]、大阪は物価が安い。",s:"Comparada con Tokio, Osaka es más barata."},
 {j:"兄[に比べて|にくらべて]、私は背が低い。",s:"Comparado con mi hermano mayor, soy bajo."}]},
// ---- nivel 8 ----
{id:"aida",lv:8,t:"〜中 (ちゅう / じゅう)",s:"N + 中",bp:"中",e:"ちゅう: durante, en curso (会議中, 勉強中). じゅう: en todo (一日中, 世界中).",ex:[
 {j:"今、[会議中|かいぎちゅう]です。",s:"Ahora estoy en una reunión.",h:"会議 + 中 (ちゅう)"},
 {j:"[一日中|いちにちじゅう]雨でした。",s:"Llovió todo el día.",h:"一日 + 中 (じゅう)"},
 {j:"[世界中|せかいじゅう]の人が見ました。",s:"Lo vio gente de todo el mundo.",h:"世界 + 中"}]},
{id:"goro-gurai",lv:8,t:"〜ごろ / 〜ぐらい",s:"hora + ごろ / cantidad + ぐらい",bp:"ごろ",e:"ごろ: aproximadamente (momento). ぐらい/くらい: aproximadamente (cantidad).",ex:[
 {j:"七時[ごろ]帰ります。",s:"Vuelvo sobre las siete."},
 {j:"駅まで十分[ぐらい]かかります。",s:"Se tarda unos diez minutos hasta la estación."},
 {j:"三年[ぐらい]日本語を勉強しています。",s:"Llevo unos tres años estudiando japonés."}]},
{id:"nakya",lv:8,t:"〜なくちゃ / 〜なきゃ (coloquial)",s:"V-ない (sin い) + くちゃ / きゃ",bp:"なくちゃ",e:"Forma coloquial de なければならない: «tengo que».",ex:[
 {j:"もう[行かなくちゃ]。",s:"Ya tengo que irme.",h:"行く"},
 {j:"宿題を[しなきゃ]。",s:"Tengo que hacer los deberes.",h:"する"},
 {j:"早く[起きなきゃ]。",s:"Tengo que levantarme pronto.",h:"起きる"}]},
{id:"to-iu-to",lv:8,t:"〜とき (〜た時 / 〜る時, matices)",s:"V-た + 時 vs V-る + 時",bp:"時 (advanced)",e:"〜た時: la acción principal ocurre después de completarse la del 時. 〜る時: antes o mientras.",ex:[
 {j:"家を[出る時]、鍵をかけます。",s:"Al salir de casa (justo antes), cierro con llave.",h:"出る"},
 {j:"家に[帰った時]、手を洗います。",s:"Cuando vuelvo a casa (ya dentro), me lavo las manos.",h:"帰る"},
 {j:"[寝る時]、電気を消します。",s:"Al acostarme, apago la luz.",h:"寝る"}]},
// ---- nivel 9 ----
{id:"o-ni-naru",lv:9,t:"お〜になる",s:"お + V-ます + になる",bp:"お〜になる",e:"Forma honorífica regular de un verbo: お読みになる, お帰りになる.",ex:[
 {j:"社長はもう[お帰りになりました]。",s:"El presidente ya se ha ido.",h:"お + 帰る + になる"},
 {j:"この本を[お読みになりましたか]。",s:"¿Ha leído este libro?",h:"お + 読む"},
 {j:"先生は何時に[お出かけになりますか]。",s:"¿A qué hora sale el profesor?",h:"お + 出かける"}]},
{id:"o-suru",lv:9,t:"お〜する / ご〜する",s:"お + V-ます + する / ご + N + する",bp:"お〜する",e:"Forma humilde regular: お持ちする, ご案内する.",ex:[
 {j:"駅まで[お送りします]。",s:"Le acompaño hasta la estación.",h:"お + 送る + する"},
 {j:"後で[ご連絡します]。",s:"Le contactaré más tarde.",h:"ご + 連絡 + する"},
 {j:"詳しく[ご説明します]。",s:"Se lo explicaré en detalle.",h:"ご + 説明 + する"}]},
{id:"te-orimasu",lv:9,t:"〜ております / 〜でございます (humilde)",s:"V-て + おります",bp:"ております",e:"Versión humilde de ている.",ex:[
 {j:"田中は今、席を[外しております]。",s:"Tanaka no está en su sitio ahora.",h:"外す + ております"},
 {j:"いつもお世話に[なっております]。",s:"Siempre agradecido por su ayuda.",h:"なる + ております"},
 {j:"東京に[住んでおります]。",s:"Vivo en Tokio (humilde).",h:"住む"}]},
{id:"itadaku-kudasaru",lv:9,t:"〜ていただく / 〜てくださる",s:"V-て + いただく / くださる",bp:"ていただく",e:"Versiones corteses de てもらう y てくれる.",ex:[
 {j:"先生に[教えていただきました]。",s:"El profesor tuvo la bondad de enseñarme.",h:"教える + ていただく"},
 {j:"部長が[手伝ってくださいました]。",s:"El jefe de sección me ayudó amablemente.",h:"手伝う + てくださる"},
 {j:"資料を[送っていただけますか]。",s:"¿Podría enviarme los documentos?",h:"送る + ていただけますか"}]},
// ---- nivel 10 ----
{id:"tte",lv:10,t:"〜って (coloquial: と / という)",s:"frase + って",bp:"って",e:"Coloquial de と (cita), という (llamado) y は (tema).",ex:[
 {j:"田中さん、明日来ない[って]。",s:"Tanaka dice que mañana no viene."},
 {j:"「さくら」[って]店、知ってる？",s:"¿Conoces una tienda llamada Sakura?"},
 {j:"日本語[って]難しいね。",s:"El japonés es difícil, ¿eh?"}]},
{id:"nde",lv:10,t:"〜んで (coloquial de ので)",s:"informal + んで",bp:"んで",e:"Forma hablada de ので.",ex:[
 {j:"風邪を引いた[んで]、休みます。",s:"Como me he resfriado, falto."},
 {j:"時間がない[んで]、先に行くね。",s:"Como no hay tiempo, me adelanto."},
 {j:"雨[なんで]、中止です。",s:"Como llueve, se cancela.",h:"雨 + なんで"}]},
{id:"chau",lv:10,t:"〜ちゃう / 〜じゃう (coloquial)",s:"V-て (sin て) + ちゃう / V-で (sin で) + じゃう",bp:"ちゃう",e:"Coloquial de てしまう.",ex:[
 {j:"全部[食べちゃった]。",s:"Me lo comí todo.",h:"食べる"},
 {j:"宿題を[忘れちゃった]。",s:"Se me olvidaron los deberes.",h:"忘れる"},
 {j:"本を[読んじゃった]。",s:"Me acabé el libro.",h:"読む + じゃう"}]},
{id:"toka",lv:10,t:"〜とか〜とか",s:"N + とか + N + とか",bp:"とか",e:"Enumeración coloquial de ejemplos («cosas como…»).",ex:[
 {j:"週末は掃除[とか]洗濯[とか]をします。",s:"Los fines de semana hago cosas como limpiar y lavar la ropa."},
 {j:"りんご[とか]バナナ[とか]を買いました。",s:"Compré manzanas, plátanos y cosas así."},
 {j:"映画[とか]音楽[とか]が好きです。",s:"Me gustan cosas como el cine y la música."}]},
// ---- nivel 11 ----
{id:"hazu-datta",lv:11,t:"〜はずだった",s:"V-る + はずだった",bp:"はずだった",e:"«Se suponía que» (pero no ocurrió).",ex:[
 {j:"彼は昨日[来るはずでした]。",s:"Se suponía que él venía ayer."},
 {j:"試験は簡単な[はずだった]のに。",s:"Se suponía que el examen sería fácil."},
 {j:"今日は[休みのはずでした]。",s:"Se suponía que hoy era festivo.",h:"休み + の"}]},
{id:"koto-wa",lv:11,t:"〜ことは〜が",s:"V-る + ことは + V-る + が",bp:"ことは〜が",e:"«Hacer, lo hago, pero…»: concesión parcial.",ex:[
 {j:"日本語を[話すことは話します]が、上手じゃありません。",s:"Hablar, hablo japonés, pero no bien.",h:"話す"},
 {j:"[行くことは行きます]が、遅れます。",s:"Ir, voy, pero llegaré tarde.",h:"行く"},
 {j:"[食べることは食べた]が、おいしくなかった。",s:"Comer, comí, pero no estaba bueno.",h:"食べる, pasado"}]},
{id:"you-ni-naru-hab",lv:11,t:"〜なくなる / 〜ようになる (cambio de hábito)",s:"V-ない (sin い) + くなる / V-る + ようになる",bp:"なくなる",e:"Cambio: dejar de hacer algo (なくなる) o empezar a hacerlo (ようになる).",ex:[
 {j:"最近、お酒を[飲まなくなりました]。",s:"Últimamente he dejado de beber.",h:"飲む"},
 {j:"毎朝走る[ようになりました]。",s:"He empezado a correr cada mañana."},
 {j:"テレビを[見なくなった]。",s:"Dejé de ver la tele.",h:"見る, informal"}]},
{id:"ni-shite-wa",lv:11,t:"〜にしては",s:"N・V + にしては",bp:"にしては",e:"«Para ser…»: resultado contrario a lo esperado.",ex:[
 {j:"初めて[にしては]上手ですね。",s:"Para ser la primera vez, lo haces bien."},
 {j:"子ども[にしては]背が高い。",s:"Para ser un niño, es alto."},
 {j:"冬[にしては]暖かい。",s:"Para ser invierno, hace calor."}]},
// ---- nivel 12 ----
{id:"tara-dou",lv:12,t:"〜たらどうですか",s:"V-たら + どうですか",bp:"たらどう",e:"Sugerencia: «¿por qué no…?».",ex:[
 {j:"医者に[行ったらどうですか]。",s:"¿Por qué no vas al médico?",h:"行く"},
 {j:"少し[休んだらどうですか]。",s:"¿Por qué no descansas un poco?",h:"休む"},
 {j:"先生に[聞いたらどう]？",s:"¿Y si le preguntas al profesor?",h:"聞く, informal"}]},
{id:"nagara-mo",lv:12,t:"〜ながらも / 〜のに〜",s:"V-ます + ながら(も) + contraste",bp:"ながらも",e:"«Aunque, a pesar de» (uso contrastivo de ながら).",ex:[
 {j:"[知っていながら]、教えてくれなかった。",s:"Aunque lo sabía, no me lo dijo.",h:"知る + ている"},
 {j:"[狭いながらも]、楽しい我が家。",s:"Aunque pequeña, mi casa es feliz.",h:"狭い"},
 {j:"悪いと[思いながら]、言ってしまった。",s:"Aunque sabía que estaba mal, lo dije.",h:"思う"}]},
{id:"dake-de-naku",lv:12,t:"〜だけでなく〜も",s:"N・informal + だけでなく + 〜も",bp:"だけでなく",e:"«No solo…, sino también».",ex:[
 {j:"彼は英語[だけでなく]、中国語も話せます。",s:"Él habla no solo inglés, sino también chino."},
 {j:"この店は[安いだけでなく]、おいしい。",s:"Esta tienda no solo es barata, también es buena.",h:"安い"},
 {j:"子ども[だけでなく]大人も楽しめます。",s:"Pueden disfrutarlo no solo los niños, también los adultos."}]},
{id:"tokoro-de",lv:12,t:"ところで / それで / そして / それから",s:"conectores de discurso",bp:"ところで",e:"ところで: por cierto (cambio de tema). それで: por eso. そして: y, además. それから: y luego.",ex:[
 {j:"[ところで]、来週の会議はどこですか。",s:"Por cierto, ¿dónde es la reunión de la semana que viene?"},
 {j:"熱が出ました。[それで]、学校を休みました。",s:"Me subió la fiebre. Por eso falté a la escuela."},
 {j:"買い物をして、[それから]映画を見ました。",s:"Hice compras y luego vi una película."}]},
// ---- nivel 13 ----
{id:"sae-ba",lv:13,t:"〜さえ〜ば",s:"N + さえ + V-ば",bp:"さえ〜ば",e:"«Con tal de que…, basta con…».",ex:[
 {j:"お金[さえあれば]、何でも買えます。",s:"Con tal de tener dinero, se puede comprar cualquier cosa.",h:"ある + ば"},
 {j:"薬を[飲みさえすれば]、治ります。",s:"Basta con tomar la medicina para curarse.",h:"飲む + さえすれば"},
 {j:"時間[さえあれば]、行きたい。",s:"Si al menos tuviera tiempo, querría ir."}]},
{id:"toshite",lv:13,t:"〜として",s:"N + として",bp:"として",e:"«Como, en calidad de».",ex:[
 {j:"留学生[として]日本に来ました。",s:"Vine a Japón como estudiante de intercambio."},
 {j:"彼は医者[として]働いています。",s:"Él trabaja como médico."},
 {j:"趣味[として]写真を撮っています。",s:"Hago fotos como afición."}]},
{id:"wake-da",lv:13,t:"〜わけだ / 〜わけではない",s:"informal + わけだ / わけではない",bp:"わけだ",e:"わけだ: «por eso, con razón» (conclusión lógica). わけではない: «no es que…».",ex:[
 {j:"彼は日本に十年住んでいた。日本語が上手な[わけだ]。",s:"Vivió diez años en Japón. Con razón habla bien japonés."},
 {j:"嫌いな[わけではありません]が、今日は食べたくない。",s:"No es que no me guste, pero hoy no quiero comerlo.",h:"negación"},
 {j:"忙しい[わけではない]。",s:"No es que esté ocupado."}]},
{id:"ni-chigainai",lv:13,t:"〜に違いない / 〜に決まっている",s:"informal + に違いない",bp:"に違いない",e:"Certeza fuerte: «seguro que, sin duda».",ex:[
 {j:"彼が犯人[に違いない|にちがいない]。",s:"Sin duda él es el culpable."},
 {j:"この店は高い[に決まっている|にきまっている]。",s:"Seguro que esta tienda es cara."},
 {j:"あの人は日本人[に違いない|にちがいない]。",s:"Esa persona tiene que ser japonesa."}]}
];
