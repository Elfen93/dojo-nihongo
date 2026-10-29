// Gramática N3, bloque 2 (20 puntos, niveles 17 a 19), escrita a mano.
GRAMMAR_N3.push(
// ---- nivel 17 ----
{id:"n3-bakari-de-naku",lv:17,t:"〜ばかりでなく〜も",s:"V・adj + ばかりでなく / N + ばかりでなく + も",bp:"ばかりでなく",e:"«No solo… sino también». Añade un segundo elemento a uno ya dado, y el segundo suele ser más llamativo o igual de importante. Muy cercano a だけでなく, algo más formal y enfático.",ex:[
 {j:"彼は[英語ばかりでなく]、中国語も話せる。",s:"No solo habla inglés, también habla chino.",h:"英語"},
 {j:"この店は[安いばかりでなく]、味もいい。",s:"Esta tienda no solo es barata, además la comida es buena.",h:"安い"},
 {j:"彼女は[頭がいいばかりでなく]、性格もいい。",s:"Ella no solo es lista, también tiene buen carácter.",h:"頭がいい"}]},
{id:"n3-tokoro-datta",lv:17,t:"〜ところだった",s:"V-る + ところだった",bp:"ところだった",e:"«Por poco, casi». Cuenta algo que estuvo a punto de pasar y al final no pasó, normalmente algo malo. Suele llevar もう少しで o 危うく.",ex:[
 {j:"もう少しで[電車に乗り遅れるところだった]。",s:"Por poco pierdo el tren.",h:"乗り遅れる"},
 {j:"危うく[車にひかれるところでした]。",s:"Por poco me atropella un coche.",h:"ひかれる, cortés"},
 {j:"大事な書類を[忘れるところだった]よ。",s:"¡Casi me olvido de los documentos importantes!",h:"忘れる"}]},
{id:"n3-tokoro-ni",lv:17,t:"〜ところに / ところへ",s:"V-る・V-ている・V-た + ところに",bp:"ところに",e:"«Justo cuando». Algo ocurre en el preciso momento en que otra cosa está pasando o va a pasar, a menudo interrumpiéndola. Con ところへ la idea de llegada es más marcada.",ex:[
 {j:"出かけようとした[ところに]、友だちが来た。",s:"Justo cuando iba a salir, llegó un amigo.",h:"ところに"},
 {j:"寝ようと思っていた[ところへ]、電話がかかってきた。",s:"Justo cuando pensaba acostarme, sonó el teléfono.",h:"ところへ"},
 {j:"みんなで[話していたところに]、先生が入ってきた。",s:"Mientras hablábamos todos, entró el profesor.",h:"話す + ている"}]},
{id:"n3-dokoro-ka",lv:17,t:"〜どころか",s:"V・adj・N + どころか",bp:"どころか",e:"«Lejos de, ni hablar de». Niega lo dicho y presenta algo más extremo o contrario. A menudo va seguido de も / さえ, y suele aparecer en frases negativas.",ex:[
 {j:"彼は[日本語どころか]、英語も話せない。",s:"Lejos de hablar japonés, ni siquiera habla inglés.",h:"日本語"},
 {j:"忙しくて[休むどころか]、食事をする時間もない。",s:"Estoy tan ocupado que ni descanso ni tengo tiempo de comer.",h:"休む"},
 {j:"今日は[暑いどころか]、寒いくらいだ。",s:"Hoy, lejos de hacer calor, hace casi frío.",h:"暑い"}]},
{id:"n3-toshite",lv:17,t:"〜として",s:"N + として",bp:"として",e:"«Como, en calidad de». Indica la función, el papel o el punto de vista desde el que se habla. Variantes: としては («como…, por lo que respecta a»), としても («aun como»).",ex:[
 {j:"彼は[留学生として]日本に来た。",s:"Vino a Japón como estudiante extranjero.",h:"留学生"},
 {j:"[趣味として]、写真を撮っている。",s:"Hago fotos como afición.",h:"趣味"},
 {j:"この町は[観光地として]有名だ。",s:"Esta ciudad es famosa como destino turístico.",h:"観光地"}]},
{id:"n3-to-tomo-ni",lv:17,t:"〜とともに",s:"N + とともに / V-る・adj + とともに",bp:"とともに",e:"Dos usos: (1) «junto con» una persona o cosa; (2) «a la vez que, a medida que», dos cambios que avanzan al mismo tiempo. Es más formal que と一緒に.",ex:[
 {j:"年を[取るとともに]、体力が落ちてきた。",s:"A medida que me hago mayor, me han ido faltando fuerzas.",h:"取る"},
 {j:"家族[とともに]、京都へ旅行した。",s:"Viajé a Kioto con mi familia.",h:"とともに"},
 {j:"技術の進歩[とともに]、生活は便利になった。",s:"Con el progreso de la tecnología, la vida se ha vuelto más cómoda.",h:"とともに"}]},
{id:"n3-toori",lv:17,t:"〜とおり / 〜どおり",s:"V-る・V-た + とおり / N + どおり",bp:"とおり",e:"«Tal como, conforme a». Hacer algo siguiendo lo dicho, lo escrito o lo esperado. Tras un verbo se escribe とおり (sin sonorizar); tras un sustantivo se usa どおり (予想どおり, 約束どおり).",ex:[
 {j:"先生が[言ったとおりに]やってみた。",s:"Lo intenté tal como dijo el profesor.",h:"言う, pasado"},
 {j:"予想[どおり]、試合は私たちが勝った。",s:"Tal como se esperaba, ganamos el partido.",h:"どおり"},
 {j:"説明書に[書いてあるとおり]にすれば大丈夫だ。",s:"Si lo haces tal como pone en las instrucciones, no habrá problema.",h:"書いてある"}]},
// ---- nivel 18 ----
{id:"n3-toka",lv:18,t:"〜とか〜とか",s:"N・V・adj + とか + N・V・adj + とか",bp:"とか",e:"Enumera ejemplos de forma coloquial y no exhaustiva: «cosas como X, Y…». Con una frase final, también sirve para transmitir un rumor: «dicen que, creo que dijeron que».",ex:[
 {j:"冷蔵庫に[牛乳とか]、卵とかが入っている。",s:"En la nevera hay cosas como leche, huevos…",h:"牛乳"},
 {j:"山田さんは[結婚するとか]。",s:"Dicen que Yamada se casa.",h:"結婚する"},
 {j:"休みの日は[映画を見るとか]、買い物に行くとかして過ごしている。",s:"Los días libres los paso viendo películas, yendo de compras…",h:"映画を見る"}]},
{id:"n3-to-shitara",lv:18,t:"〜としたら / 〜とすれば",s:"informal + としたら / とすれば",bp:"としたら",e:"«Suponiendo que, si fuera el caso de que». Plantea una hipótesis sobre algo que no se sabe si es verdad, y comenta sus consecuencias. とすれば es más formal y razonado.",ex:[
 {j:"もし[宝くじが当たったとしたら]、世界旅行に行く。",s:"Si me tocara la lotería, me iría de viaje por el mundo.",h:"当たる, pasado"},
 {j:"[行くとすれば]、来月がいい。",s:"Si hubiera que ir, el mes que viene sería lo mejor.",h:"行く"},
 {j:"[一人で住むとしたら]、駅の近くがいい。",s:"Si fuera a vivir solo, preferiría cerca de la estación.",h:"一人で住む"}]},
{id:"n3-to-ittemo",lv:18,t:"〜といっても",s:"informal + といっても",bp:"といっても",e:"«Aunque diga X, en realidad…». Matiza o corrige la impresión que da una afirmación: lo dicho es cierto, pero no tanto como parece. Después va lo que lo rebaja.",ex:[
 {j:"料理が[得意といっても]、簡単なものしか作れない。",s:"Aunque digo que se me da bien cocinar, solo hago cosas sencillas.",h:"得意"},
 {j:"[旅行に行ったといっても]、日帰りです。",s:"Aunque dije que viajé, fue solo una excursión de un día.",h:"行く, pasado"},
 {j:"日本語が[話せるといっても]、挨拶ができる程度です。",s:"Aunque hable japonés, es solo lo justo para saludar.",h:"話せる"}]},
{id:"n3-to-iu-yori",lv:18,t:"〜というより",s:"informal + というより",bp:"というより",e:"«Más que X, es Y». Reformula una descripción con otra más acertada: lo primero no es del todo falso, pero lo segundo lo describe mejor. Se cierra con una afirmación.",ex:[
 {j:"彼女は[優しいというより]、気が弱いのだ。",s:"Más que amable, es de carácter débil.",h:"優しい"},
 {j:"これは[ケーキというより]、パンに近い。",s:"Esto más que un pastel es casi un pan.",h:"ケーキ"},
 {j:"今日は[暑いというより]、蒸し暑い。",s:"Hoy más que calor, hace bochorno.",h:"暑い"}]},
{id:"n3-to-iu-to",lv:18,t:"〜というと",s:"N + というと",bp:"というと",e:"«Hablando de, cuando se dice X». Toma un tema y lo asocia con lo primero que viene a la mente, o pide aclarar a qué se refiere el otro. Variante coloquial: っていうと.",ex:[
 {j:"[日本の食べ物というと]、すぐ寿司を思い出す。",s:"Hablando de comida japonesa, enseguida pienso en el sushi.",h:"日本の食べ物"},
 {j:"[京都というと]、お寺ですね。",s:"Cuando se dice Kioto, uno piensa en templos.",h:"京都"},
 {j:"[夏というと]、花火を思い浮かべる。",s:"Si se dice verano, me viene a la cabeza los fuegos artificiales.",h:"夏"}]},
{id:"n3-to-itta",lv:18,t:"〜といった",s:"N + や + N + といった + N",bp:"といった",e:"«Como, tales como». Pone ejemplos representativos justo antes del sustantivo que los agrupa. Más escrito que のような, y casi siempre con や o と para listar.",ex:[
 {j:"[りんごやバナナといった]果物が好きだ。",s:"Me gustan las frutas como la manzana o el plátano.",h:"りんご + バナナ"},
 {j:"[東京や大阪といった]大都市は人が多い。",s:"Las grandes ciudades como Tokio y Osaka tienen mucha gente.",h:"東京 + 大阪"},
 {j:"[ギターやピアノといった]楽器を習いたい。",s:"Quiero aprender instrumentos como la guitarra o el piano.",h:"ギター + ピアノ"}]},
{id:"n3-ni-oite",lv:18,t:"〜において",s:"N + において / N + における + N",bp:"において",e:"«En, dentro de» un lugar, un momento o un ámbito. Equivale a で pero en registro formal o escrito. Con sustantivo después: における (社会における役割).",ex:[
 {j:"会議は第一会議室[において]行われる。",s:"La reunión se celebrará en la sala de reuniones uno.",h:"において"},
 {j:"現代社会[において]、情報は大変重要だ。",s:"En la sociedad actual, la información es muy importante.",h:"において"},
 {j:"日本の歴史[において]、この事件は大きな意味を持つ。",s:"En la historia de Japón, este suceso tiene un gran significado.",h:"において"}]},
// ---- nivel 19 ----
{id:"n3-ni-kanshite",lv:19,t:"〜に関して",s:"N + に関して / N + に関する + N",bp:"に関して",e:"«Sobre, en relación con, acerca de». Delimita el tema de lo que se habla o se hace. Más formal que について; con sustantivo después: に関する.",ex:[
 {j:"この問題[に関して]、意見を聞かせてください。",s:"Dígame su opinión sobre este problema.",h:"に関して"},
 {j:"事故の原因[に関しては]、まだ調査中だ。",s:"En cuanto a la causa del accidente, aún se está investigando.",h:"に関しては"},
 {j:"日本の文化[に関して]、レポートを書いた。",s:"Escribí un informe sobre la cultura japonesa.",h:"に関して"}]},
{id:"n3-ni-taishite",lv:19,t:"〜に対して",s:"N + に対して / V・adj + のに対して",bp:"に対して",e:"Dos usos: (1) «hacia, frente a» una persona o cosa a la que se dirige una acción o actitud; (2) «mientras que, en contraste con», comparando dos cosas opuestas.",ex:[
 {j:"お客様[に対して]、失礼なことを言ってはいけない。",s:"No se debe decir nada descortés a los clientes.",h:"に対して"},
 {j:"兄は静か[なのに対して]、弟はにぎやかだ。",s:"Mi hermano mayor es tranquilo, mientras que el pequeño es bullicioso.",h:"なのに対して"},
 {j:"先生の質問[に対して]、学生は何も答えなかった。",s:"Ante la pregunta del profesor, los alumnos no respondieron nada.",h:"に対して"}]},
{id:"n3-ni-tsurete",lv:19,t:"〜につれて",s:"V-る・N + につれて",bp:"につれて",e:"«A medida que». Un cambio provoca o acompaña otro cambio gradual. Ambas partes son cambios progresivos; no se usa para acciones puntuales ni con la voluntad del hablante.",ex:[
 {j:"時間が[たつにつれて]、悲しみは薄れた。",s:"Con el paso del tiempo, la tristeza se fue apagando.",h:"たつ"},
 {j:"年を[とるにつれて]、体が弱くなる。",s:"A medida que uno envejece, el cuerpo se debilita.",h:"とる"},
 {j:"都市が[発展するにつれて]、人口が増えた。",s:"A medida que la ciudad se desarrolló, creció la población.",h:"発展する"}]},
{id:"n3-ni-shitagatte",lv:19,t:"〜にしたがって",s:"V-る・N + にしたがって",bp:"にしたがって",e:"Dos usos: (1) «a medida que», parecido a につれて pero algo más formal; (2) «de acuerdo con, siguiendo» una indicación, una regla o una persona.",ex:[
 {j:"山を[登るにしたがって]、気温が下がった。",s:"A medida que subíamos la montaña, bajaba la temperatura.",h:"登る"},
 {j:"先生の[指示にしたがって]、作業を進めた。",s:"Seguí con el trabajo según las instrucciones del profesor.",h:"指示"},
 {j:"ルール[にしたがって]、行動してください。",s:"Actúen conforme a las normas.",h:"にしたがって"}]},
{id:"n3-ni-tomonatte",lv:19,t:"〜にともなって",s:"N・V-る + にともなって / にともない",bp:"にともなって",e:"«Junto con, a raíz de». Un cambio importante arrastra otro cambio. Es formal, de textos y noticias; la forma にともない es todavía más escrita.",ex:[
 {j:"人口の増加[にともなって]、住宅不足が問題になった。",s:"Con el aumento de población, la falta de viviendas se convirtió en un problema.",h:"にともなって"},
 {j:"台風の接近[にともなって]、風が強くなってきた。",s:"Con la aproximación del tifón, el viento se ha ido haciendo más fuerte.",h:"にともなって"},
 {j:"事業の拡大[にともない]、社員を増やした。",s:"Con la expansión del negocio, aumentamos la plantilla.",h:"にともない"}]},
{id:"n3-ni-kurabete",lv:19,t:"〜に比べて",s:"N + に比べて / N + に比べ",bp:"にくらべて",e:"«Comparado con». Pone una cosa como punto de referencia para comparar otra. Equivale a より en registro algo más formal; にくらべ es la forma escrita.",ex:[
 {j:"去年[に比べて]、今年は雪が少ない。",s:"Comparado con el año pasado, este año hay menos nieve.",h:"に比べて"},
 {j:"姉[に比べて]、妹は背が高い。",s:"Comparada con mi hermana mayor, la pequeña es más alta.",h:"に比べて"},
 {j:"東京は地方[に比べて]、物価が高い。",s:"Tokio tiene los precios más altos en comparación con las provincias.",h:"に比べて"}]}
);
// Frases inéditas de examen para estos puntos
EXAM_GRAMMAR.push(
{g:"n3-bakari-de-naku",j:"この本は[子どもばかりでなく]、大人にも人気がある。",s:"Este libro es popular no solo entre los niños, también entre los adultos.",h:"子ども"},
{g:"n3-tokoro-datta",j:"急いで走らなかったら、[遅刻するところだった]。",s:"Si no hubiera corrido, habría llegado tarde por poco.",h:"遅刻する"},
{g:"n3-tokoro-ni",j:"料理を[作っていたところに]、母が帰ってきた。",s:"Justo cuando estaba cocinando, volvió mi madre.",h:"作る + ている"},
{g:"n3-dokoro-ka",j:"貯金[どころか]、借金ばかり増えている。",s:"Lejos de ahorrar, solo aumentan las deudas.",h:"どころか"},
{g:"n3-toshite",j:"彼は[通訳として]会議に参加した。",s:"Participó en la reunión como intérprete.",h:"通訳"},
{g:"n3-to-tomo-ni",j:"春が[来るとともに]、花が咲き始めた。",s:"Con la llegada de la primavera, empezaron a florecer las flores.",h:"来る"},
{g:"n3-toori",j:"地図の[とおりに]行けば、駅に着く。",s:"Si vas tal como indica el mapa, llegarás a la estación.",h:"とおり"},
{g:"n3-toka",j:"週末は[掃除するとか]、洗濯するとかして過ごす。",s:"Los fines de semana los paso limpiando, lavando la ropa y cosas así.",h:"掃除する"},
{g:"n3-to-shitara",j:"[もし若いころに戻れるとしたら]、何をしたいですか。",s:"Si pudieras volver a tu juventud, ¿qué te gustaría hacer?",h:"戻れる"},
{g:"n3-to-ittemo",j:"[貯金があるといっても]、少しだけです。",s:"Aunque tengo ahorros, es solo un poco.",h:"ある"},
{g:"n3-to-iu-yori",j:"彼の話し方は[丁寧というより]、冷たい感じがする。",s:"Su forma de hablar, más que cortés, resulta fría.",h:"丁寧"},
{g:"n3-to-iu-to",j:"[カレーというと]、インドを思い浮かべる人が多い。",s:"Hablando de curri, mucha gente piensa en la India.",h:"カレー"},
{g:"n3-to-itta",j:"[バスや電車といった]公共交通機関を利用する。",s:"Uso el transporte público, como el autobús o el tren.",h:"バス + 電車"},
{g:"n3-ni-oite",j:"試験は体育館[において]行われた。",s:"El examen se realizó en el gimnasio.",h:"において"},
{g:"n3-ni-kanshite",j:"新しい制度[に関して]、説明会が開かれる。",s:"Se celebrará una sesión informativa sobre el nuevo sistema.",h:"に関して"},
{g:"n3-ni-taishite",j:"親の期待[に対して]、彼は責任を感じている。",s:"Ante las expectativas de sus padres, él siente responsabilidad.",h:"に対して"},
{g:"n3-ni-tsurete",j:"日が[暮れるにつれて]、気温が下がってきた。",s:"A medida que anochecía, bajaba la temperatura.",h:"暮れる"},
{g:"n3-ni-shitagatte",j:"山道を[進むにしたがって]、霧が深くなった。",s:"A medida que avanzábamos por el camino de montaña, la niebla se espesaba.",h:"進む"},
{g:"n3-ni-tomonatte",j:"技術の発展[にともなって]、仕事の内容も変わってきた。",s:"Con el desarrollo de la tecnología, también ha cambiado el contenido del trabajo.",h:"にともなって"},
{g:"n3-ni-kurabete",j:"昨年[に比べて]、売り上げが二割伸びた。",s:"En comparación con el año pasado, las ventas subieron un veinte por ciento.",h:"に比べて"}
);
