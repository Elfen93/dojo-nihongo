// id, lv, t: título, s: estructura, e: explicación, bp: nombre en Bunpro (para sincronizar), ex: ejemplos con cloze [respuesta|alternativa] y h: pista
const GRAMMAR_N5 = [
// ---- nivel 1 ----
{id:"desu",lv:1,t:"〜です / 〜じゃありません",s:"N + です / N + じゃありません",bp:"です",e:"Cópula cortés. です afirma; じゃありません (o ではありません) niega. En pasado: でした / じゃありませんでした.",ex:[
 {j:"私は学生[です]。",s:"Soy estudiante."},
 {j:"これは私のかばん[じゃありません|ではありません]。",s:"Esto no es mi bolso.",h:"negativo"},
 {j:"昨日は雨[でした]。",s:"Ayer llovió (fue lluvia).",h:"pasado"}]},
{id:"wa",lv:1,t:"〜は (tema)",s:"N + は",bp:"は",e:"Marca el tema de la frase: aquello de lo que se habla. Se lee «wa».",ex:[
 {j:"今日[は]暑いです。",s:"Hoy hace calor."},
 {j:"田中さん[は]先生です。",s:"Tanaka es profesor."},
 {j:"私[は]スペイン人です。",s:"Yo soy español."}]},
{id:"ga",lv:1,t:"〜が (sujeto)",s:"N + が",bp:"が",e:"Marca el sujeto gramatical, sobre todo con información nueva, existencia (ある/いる), gustos y habilidades.",ex:[
 {j:"机の上に本[が]あります。",s:"Hay un libro sobre la mesa."},
 {j:"私は犬[が]好きです。",s:"Me gustan los perros."},
 {j:"誰[が]来ましたか。",s:"¿Quién ha venido?"}]},
{id:"o",lv:1,t:"〜を (objeto directo)",s:"N + を + V",bp:"を",e:"Marca el objeto directo del verbo.",ex:[
 {j:"パン[を]食べます。",s:"Como pan."},
 {j:"毎日日本語[を]勉強します。",s:"Estudio japonés todos los días."},
 {j:"公園[を]歩きました。",s:"Caminé por el parque.",h:"espacio que se recorre"}]},
{id:"ni-time",lv:1,t:"〜に (tiempo / destino)",s:"N(tiempo) + に / N(lugar) + に + 行く・来る",bp:"に",e:"Indica un momento concreto (時に, 月曜日に) o el destino de un movimiento. No se usa con 今日, 明日, 毎日.",ex:[
 {j:"七時[に]起きます。",s:"Me levanto a las siete."},
 {j:"来年日本[に]行きます。",s:"El año que viene voy a Japón."},
 {j:"友だちは三月[に]来ます。",s:"Mi amigo viene en marzo."}]},
{id:"de-place",lv:1,t:"〜で (lugar de acción / medio)",s:"N + で",bp:"で",e:"Marca el lugar donde ocurre una acción o el medio con que se hace (車で, 日本語で).",ex:[
 {j:"図書館[で]勉強します。",s:"Estudio en la biblioteca."},
 {j:"電車[で]会社に行きます。",s:"Voy a la empresa en tren."},
 {j:"日本語[で]話してください。",s:"Habla en japonés, por favor."}]},
{id:"masu",lv:1,t:"〜ます / 〜ません / 〜ました",s:"V-ます形",bp:"ます",e:"Forma cortés del verbo. ます presente/futuro, ません negativo, ました pasado, ませんでした pasado negativo.",ex:[
 {j:"毎朝コーヒーを[飲みます]。",s:"Cada mañana tomo café.",h:"飲む"},
 {j:"昨日は何も[食べませんでした]。",s:"Ayer no comí nada.",h:"食べる, pasado negativo"},
 {j:"先週映画を[見ました]。",s:"La semana pasada vi una película.",h:"見る, pasado"}]},
{id:"ka",lv:1,t:"〜か (pregunta)",s:"frase + か",bp:"か",e:"Convierte la frase en pregunta sin cambiar el orden de las palabras.",ex:[
 {j:"これは何です[か]。",s:"¿Qué es esto?"},
 {j:"明日学校に行きます[か]。",s:"¿Vas mañana a la escuela?"},
 {j:"田中さんは学生です[か]。",s:"¿Tanaka es estudiante?"}]},
{id:"no",lv:1,t:"〜の (posesión / unión de nombres)",s:"N1 + の + N2",bp:"の",e:"Une dos nombres: posesión (私の本), pertenencia (東京の大学) o descripción.",ex:[
 {j:"これは私[の]本です。",s:"Este es mi libro."},
 {j:"日本[の]食べ物が好きです。",s:"Me gusta la comida de Japón."},
 {j:"東京大学[の]学生です。",s:"Soy estudiante de la Universidad de Tokio."}]},
{id:"mo",lv:1,t:"〜も (también)",s:"N + も",bp:"も",e:"Sustituye a は/が/を para decir «también». Con negativo: «tampoco».",ex:[
 {j:"私[も]学生です。",s:"Yo también soy estudiante."},
 {j:"肉も魚[も]食べません。",s:"No como ni carne ni pescado."},
 {j:"兄[も]来ます。",s:"Mi hermano mayor también viene."}]},
{id:"arimasu-imasu",lv:1,t:"あります / います",s:"N(lugar) + に + N + が + あります／います",bp:"ある",e:"Existencia: あります para cosas y plantas, います para personas y animales.",ex:[
 {j:"部屋に猫が[います]。",s:"Hay un gato en la habitación."},
 {j:"机の上にペンが[あります]。",s:"Hay un bolígrafo sobre la mesa."},
 {j:"教室に学生が[いません]。",s:"No hay estudiantes en el aula.",h:"negativo"}]},
{id:"kore-sore",lv:1,t:"これ / それ / あれ / どれ",s:"これ・それ・あれ・どれ",bp:"これ",e:"Demostrativos pronombre: これ (cerca de mí), それ (cerca de ti), あれ (lejos de ambos), どれ (¿cuál?).",ex:[
 {j:"[これ]は私のかばんです。",s:"Esto (aquí) es mi bolso."},
 {j:"[それ]は何ですか。",s:"¿Qué es eso (que tienes)?"},
 {j:"あなたの傘は[どれ]ですか。",s:"¿Cuál es tu paraguas?"}]},
{id:"kono-sono",lv:1,t:"この / その / あの + N",s:"この・その・あの + N",bp:"この",e:"Demostrativos adjetivos: van siempre seguidos de un nombre.",ex:[
 {j:"[この]本は面白いです。",s:"Este libro es interesante."},
 {j:"[あの]人は誰ですか。",s:"¿Quién es aquella persona?"},
 {j:"[その]店は安いです。",s:"Esa tienda es barata."}]},
{id:"koko-soko",lv:1,t:"ここ / そこ / あそこ / どこ",s:"ここ・そこ・あそこ・どこ",bp:"ここ",e:"Demostrativos de lugar. どこ = ¿dónde?",ex:[
 {j:"トイレは[どこ]ですか。",s:"¿Dónde está el baño?"},
 {j:"[ここ]は駅です。",s:"Aquí es la estación."},
 {j:"[あそこ]に銀行があります。",s:"Allí hay un banco."}]},
{id:"adj-i-na",lv:1,t:"Adjetivos い / な",s:"adj-い + N / adj-な + な + N",bp:"い-Adjectives",e:"Los adjetivos en い modifican el nombre directamente (高い山). Los adjetivos な necesitan な antes del nombre (静かな町).",ex:[
 {j:"[静かな]町に住んでいます。",s:"Vivo en un pueblo tranquilo.",h:"静か"},
 {j:"[大きい]犬がいます。",s:"Hay un perro grande.",h:"大きい"},
 {j:"[きれいな]花ですね。",s:"Qué flor tan bonita.",h:"きれい"}]},
// ---- nivel 2 ----
{id:"adj-past-neg",lv:2,t:"Adjetivos: negativo y pasado",s:"adj-い → くない / かった / くなかった; adj-な → じゃない / だった",bp:"くない",e:"Los adjetivos い se conjugan: 高くない, 高かった, 高くなかった. Los な se conjugan como nombres: 静かじゃない, 静かでした.",ex:[
 {j:"この店は[高くない]です。",s:"Esta tienda no es cara.",h:"高い, negativo"},
 {j:"昨日は[寒かった]です。",s:"Ayer hizo frío.",h:"寒い, pasado"},
 {j:"テストは[難しくなかった]です。",s:"El examen no fue difícil.",h:"難しい, pasado negativo"}]},
{id:"te-form",lv:2,t:"Forma て",s:"V-て",bp:"Verb[て]",e:"Forma de conexión del verbo. Grupo 1: う・つ・る→って, む・ぶ・ぬ→んで, く→いて, ぐ→いで, す→して. Grupo 2: る→て. する→して, 来る→来て.",ex:[
 {j:"朝ご飯を[食べて]、学校に行きます。",s:"Desayuno y voy a la escuela.",h:"食べる"},
 {j:"新聞を[読んで]、コーヒーを飲みます。",s:"Leo el periódico y tomo café.",h:"読む"},
 {j:"友だちに[会って]、話しました。",s:"Vi a un amigo y hablamos.",h:"会う"}]},
{id:"te-kudasai",lv:2,t:"〜てください",s:"V-て + ください",bp:"てください",e:"Petición cortés: «haga ..., por favor».",ex:[
 {j:"ここに名前を[書いてください]。",s:"Escriba su nombre aquí, por favor.",h:"書く"},
 {j:"ゆっくり[話してください]。",s:"Hable despacio, por favor.",h:"話す"},
 {j:"ちょっと[待ってください]。",s:"Espere un momento, por favor.",h:"待つ"}]},
{id:"te-iru",lv:2,t:"〜ている",s:"V-て + いる",bp:"ている",e:"Acción en progreso (食べている = estoy comiendo) o estado resultante (結婚している = estar casado, 住んでいる = vivir en).",ex:[
 {j:"今、本を[読んでいます]。",s:"Ahora estoy leyendo un libro.",h:"読む"},
 {j:"東京に[住んでいます]。",s:"Vivo en Tokio.",h:"住む"},
 {j:"兄は結婚[しています]。",s:"Mi hermano mayor está casado.",h:"する"}]},
{id:"te-mo-ii",lv:2,t:"〜てもいいです",s:"V-て + もいいです",bp:"てもいい",e:"Permiso: «se puede / está bien hacer». Pregunta: 〜てもいいですか.",ex:[
 {j:"写真を[撮ってもいい]ですか。",s:"¿Puedo hacer una foto?",h:"撮る"},
 {j:"ここに[座ってもいい]ですよ。",s:"Puedes sentarte aquí.",h:"座る"},
 {j:"窓を[開けてもいい]ですか。",s:"¿Puedo abrir la ventana?",h:"開ける"}]},
{id:"te-wa-ikemasen",lv:2,t:"〜てはいけません",s:"V-て + はいけません",bp:"てはいけない",e:"Prohibición: «no se debe / no se puede».",ex:[
 {j:"ここで[泳いではいけません]。",s:"Aquí no se puede nadar.",h:"泳ぐ"},
 {j:"教室で[食べてはいけません]。",s:"No se puede comer en el aula.",h:"食べる"},
 {j:"授業中に[寝てはいけません]。",s:"No se debe dormir en clase.",h:"寝る"}]},
{id:"mashou",lv:2,t:"〜ましょう / 〜ませんか",s:"V-ます + しょう / V-ませんか",bp:"ましょう",e:"ましょう: «hagamos». ませんか: invitación «¿no quieres ...?».",ex:[
 {j:"一緒に[行きましょう]。",s:"Vayamos juntos.",h:"行く"},
 {j:"コーヒーを[飲みませんか]。",s:"¿Tomamos un café?",h:"飲む, invitación"},
 {j:"明日[会いましょう]。",s:"Veámonos mañana.",h:"会う"}]},
{id:"tai",lv:2,t:"〜たい",s:"V-ます + たい",bp:"たい",e:"Deseo del hablante: «quiero hacer». Se conjuga como adjetivo い (たくない, たかった).",ex:[
 {j:"日本に[行きたい]です。",s:"Quiero ir a Japón.",h:"行く"},
 {j:"何も[食べたくない]です。",s:"No quiero comer nada.",h:"食べる, negativo"},
 {j:"新しい車を[買いたかった]です。",s:"Quería comprar un coche nuevo.",h:"買う, pasado"}]},
{id:"ni-iku",lv:2,t:"〜に行く (propósito)",s:"V-ます + に + 行く・来る・帰る",bp:"に行く",e:"Ir / venir a hacer algo. El verbo en raíz ます + に + verbo de movimiento.",ex:[
 {j:"映画を[見に]行きます。",s:"Voy a ver una película.",h:"見る"},
 {j:"友だちが[遊びに]来ました。",s:"Un amigo vino a jugar.",h:"遊ぶ"},
 {j:"昼ご飯を[食べに]帰ります。",s:"Vuelvo (a casa) a almorzar.",h:"食べる"}]},
{id:"kara-made",lv:2,t:"〜から〜まで",s:"N + から + N + まで",bp:"から",e:"Desde ... hasta ... (tiempo o lugar).",ex:[
 {j:"九時[から]五時まで働きます。",s:"Trabajo de nueve a cinco."},
 {j:"家から駅[まで]歩きます。",s:"Camino de casa a la estación."},
 {j:"東京[から]大阪まで新幹線で行きます。",s:"De Tokio a Osaka voy en shinkansen."}]},
{id:"to-ya",lv:2,t:"〜と / 〜や (y)",s:"N と N / N や N (など)",bp:"と",e:"と enumera de forma completa; や da ejemplos de una lista incompleta (a menudo con など).",ex:[
 {j:"パン[と]牛乳を買いました。",s:"Compré pan y leche.",h:"lista completa"},
 {j:"机の上に本[や]ノートなどがあります。",s:"Sobre la mesa hay libros, cuadernos y otras cosas.",h:"lista incompleta"},
 {j:"友だち[と]映画を見ました。",s:"Vi una película con un amigo.",h:"con"}]},
{id:"suki-kirai",lv:2,t:"〜が好き / 嫌い / 上手 / 下手",s:"N + が + 好き・嫌い・上手・下手",bp:"好き",e:"Gustos y habilidades toman が, no を.",ex:[
 {j:"私は音楽[が]好きです。",s:"Me gusta la música."},
 {j:"妹は料理[が]上手です。",s:"Mi hermana menor cocina bien."},
 {j:"納豆[が]嫌いです。",s:"Odio el natto."}]},
{id:"nai-form",lv:2,t:"Forma ない",s:"V-ない",bp:"Verb[ない]",e:"Negativo informal. Grupo 1: cambia la u por a + ない (書く→書かない, 買う→買わない). Grupo 2: quita る + ない. する→しない, 来る→来ない.",ex:[
 {j:"お酒を[飲まない]。",s:"No bebo alcohol.",h:"飲む"},
 {j:"明日は学校に[行かない]。",s:"Mañana no voy a la escuela.",h:"行く"},
 {j:"テレビを[見ない]。",s:"No veo la tele.",h:"見る"}]},
{id:"naide-kudasai",lv:2,t:"〜ないでください",s:"V-ない + でください",bp:"ないでください",e:"Petición negativa: «no haga ..., por favor».",ex:[
 {j:"ここで写真を[撮らないでください]。",s:"No haga fotos aquí, por favor.",h:"撮る"},
 {j:"電気を[消さないでください]。",s:"No apague la luz, por favor.",h:"消す"},
 {j:"[忘れないでください]。",s:"No lo olvide, por favor.",h:"忘れる"}]},
// ---- nivel 3 ----
{id:"ta-form",lv:3,t:"Forma た (pasado informal)",s:"V-た",bp:"Verb[た]",e:"Pasado informal. Se forma igual que la forma て cambiando て→た, で→だ.",ex:[
 {j:"昨日映画を[見た]。",s:"Ayer vi una película.",h:"見る"},
 {j:"友だちと[話した]。",s:"Hablé con un amigo.",h:"話す"},
 {j:"本を[読んだ]。",s:"Leí un libro.",h:"読む"}]},
{id:"ta-koto-ga-aru",lv:3,t:"〜たことがある",s:"V-た + ことがある",bp:"たことがある",e:"Experiencia: «alguna vez he hecho».",ex:[
 {j:"日本に[行ったことがあります]。",s:"He estado en Japón.",h:"行く"},
 {j:"すしを[食べたことがありますか]。",s:"¿Has comido sushi alguna vez?",h:"食べる, pregunta"},
 {j:"富士山を[見たことがありません]。",s:"Nunca he visto el monte Fuji.",h:"見る, negativo"}]},
{id:"tari-tari",lv:3,t:"〜たり〜たりする",s:"V-たり + V-たり + する",bp:"たり〜たり",e:"Enumera acciones como ejemplos, sin orden: «hago cosas como ... y ...».",ex:[
 {j:"週末は本を[読んだり]、映画を見たりします。",s:"El fin de semana leo libros, veo películas y cosas así.",h:"読む"},
 {j:"休みの日は[寝たり]、テレビを見たりします。",s:"Los días libres duermo, veo la tele...",h:"寝る"},
 {j:"友だちと[話したり]、遊んだりしました。",s:"Hablé y jugué con amigos, entre otras cosas.",h:"話す"}]},
{id:"ta-hou-ga-ii",lv:3,t:"〜たほうがいい",s:"V-た + ほうがいい / V-ない + ほうがいい",bp:"たほうがいい",e:"Consejo: «sería mejor que ...». Negativo: ないほうがいい.",ex:[
 {j:"薬を[飲んだほうがいい]ですよ。",s:"Sería mejor que tomaras la medicina.",h:"飲む"},
 {j:"早く[寝たほうがいい]です。",s:"Es mejor acostarse pronto.",h:"寝る"},
 {j:"お酒を[飲まないほうがいい]です。",s:"Es mejor que no bebas alcohol.",h:"飲む, negativo"}]},
{id:"dictionary-form",lv:3,t:"Forma diccionario + こと / の",s:"V-る + こと / の",bp:"Verb[る]",e:"La forma diccionario nominaliza con こと o の: 泳ぐこと = nadar (el hecho de).",ex:[
 {j:"私の趣味は本を[読むこと]です。",s:"Mi afición es leer libros.",h:"読む + こと"},
 {j:"[泳ぐの]が好きです。",s:"Me gusta nadar.",h:"泳ぐ + の"},
 {j:"漢字を[書くこと]ができます。",s:"Sé escribir kanji.",h:"書く + こと"}]},
{id:"koto-ga-dekiru",lv:3,t:"〜ことができる",s:"V-る + ことができる",bp:"ことができる",e:"Capacidad o posibilidad: «poder hacer».",ex:[
 {j:"日本語を[話すことができます]。",s:"Puedo hablar japonés.",h:"話す"},
 {j:"ここで切符を[買うことができます]。",s:"Aquí se pueden comprar billetes.",h:"買う"},
 {j:"私は[泳ぐことができません]。",s:"No sé nadar.",h:"泳ぐ, negativo"}]},
{id:"mae-ni",lv:3,t:"〜前に / 〜てから",s:"V-る + 前に / V-て + から",bp:"前に",e:"前に: antes de hacer. てから: después de hacer (y luego).",ex:[
 {j:"[寝る前に]歯を磨きます。",s:"Antes de dormir me lavo los dientes.",h:"寝る"},
 {j:"手を[洗ってから]食べます。",s:"Como después de lavarme las manos.",h:"洗う"},
 {j:"日本に[来る前に]日本語を勉強しました。",s:"Estudié japonés antes de venir a Japón.",h:"来る"}]},
{id:"kara-reason",lv:3,t:"〜から (porque)",s:"frase + から",bp:"から (because)",e:"Expresa la razón: «porque». La razón va antes de から.",ex:[
 {j:"時間がない[から]、急ぎましょう。",s:"Como no hay tiempo, démonos prisa."},
 {j:"暑いです[から]、窓を開けてください。",s:"Como hace calor, abra la ventana."},
 {j:"雨が降っている[から]、行きません。",s:"No voy porque está lloviendo."}]},
{id:"ga-but",lv:3,t:"〜が / 〜でも (pero)",s:"frase + が / でも + frase",bp:"が (but)",e:"が une dos frases con contraste. でも va al inicio de la segunda frase.",ex:[
 {j:"日本語は難しいです[が]、面白いです。",s:"El japonés es difícil, pero interesante."},
 {j:"高いです。[でも]、買います。",s:"Es caro. Pero lo compro."},
 {j:"行きたいです[が]、時間がありません。",s:"Quiero ir, pero no tengo tiempo."}]},
{id:"ne-yo",lv:3,t:"〜ね / 〜よ",s:"frase + ね / よ",bp:"ね",e:"ね busca acuerdo («¿verdad?»); よ afirma o informa con énfasis.",ex:[
 {j:"いい天気です[ね]。",s:"Hace buen tiempo, ¿verdad?"},
 {j:"この店は安いです[よ]。",s:"Esta tienda es barata (te lo digo)."},
 {j:"明日は休みです[よ]。",s:"Mañana es festivo, ¿sabes?"}]},
{id:"counter",lv:3,t:"Contadores: つ, 人, 枚, 本, 匹",s:"N + を + número+contador + V",bp:"Counters",e:"Los numerales con contador van tras el objeto: りんごを三つ買う. 人 personas (一人・二人・三人), 枚 planos, 本 largos, 匹 animales pequeños.",ex:[
 {j:"りんごを[三つ|みっつ]ください。",s:"Tres manzanas, por favor.",h:"三 + つ"},
 {j:"学生が[二人|ふたり]います。",s:"Hay dos estudiantes.",h:"二 + 人"},
 {j:"切手を[五枚|ごまい]買いました。",s:"Compré cinco sellos.",h:"五 + 枚"}]},
{id:"ni-naru",lv:3,t:"〜になる / 〜くなる",s:"N・adj-な + になる / adj-い (く) + なる",bp:"になる",e:"Cambio de estado: «volverse, llegar a ser».",ex:[
 {j:"医者[になりたい]です。",s:"Quiero ser médico.",h:"になる + たい"},
 {j:"だんだん[暖かくなりました]。",s:"Poco a poco ha ido haciendo más calor.",h:"暖かい"},
 {j:"部屋が[きれいになりました]。",s:"La habitación quedó limpia.",h:"きれい"}]},
{id:"dake-shika",lv:3,t:"〜だけ / 〜しか〜ない",s:"N + だけ / N + しか + V-ない",bp:"だけ",e:"だけ = solo (afirmativo). しか = solo, obligatoriamente con verbo negativo, matiz de «nada más que».",ex:[
 {j:"百円[しか]ありません。",s:"Solo tengo cien yenes.",h:"con negativo"},
 {j:"一人[だけ]来ました。",s:"Vino solo una persona."},
 {j:"野菜[しか]食べません。",s:"Solo como verdura.",h:"con negativo"}]},
{id:"to-omou",lv:3,t:"〜と思う",s:"frase informal + と思う",bp:"と思う",e:"Opinión: «creo que». La frase anterior va en forma informal.",ex:[
 {j:"明日は雨が[降ると思います]。",s:"Creo que mañana lloverá.",h:"降る"},
 {j:"この本は[面白いと思います]。",s:"Creo que este libro es interesante.",h:"面白い"},
 {j:"彼は[来ないと思います]。",s:"Creo que él no vendrá.",h:"来る, negativo"}]},
{id:"to-iu",lv:3,t:"〜と言う / 〜と言っていた",s:"「cita」と言う",bp:"と言う",e:"Citar lo que alguien dijo: 「...」と言いました. Forma indirecta: informal + と言っていました.",ex:[
 {j:"田中さんは「明日来る」[と言いました]。",s:"Tanaka dijo: «mañana vengo».",h:"言う, pasado"},
 {j:"母は早く帰る[と言っていました]。",s:"Mi madre dijo que volvería pronto.",h:"言う + ていた"},
 {j:"先生は「静かにしてください」[と言いました]。",s:"El profesor dijo: «silencio, por favor».",h:"言う, pasado"}]},
{id:"n-desu",lv:3,t:"〜んです / 〜のです",s:"informal + んです (N・な-adj + なんです)",bp:"んです",e:"Explicación o énfasis: pide o da una razón. Con nombres y adjetivos な: なんです.",ex:[
 {j:"どうして遅れた[んですか]。",s:"¿Por qué has llegado tarde?",h:"pregunta"},
 {j:"電車が止まった[んです]。",s:"Es que se paró el tren."},
 {j:"頭が痛い[んです]。",s:"Es que me duele la cabeza."}]}
];
