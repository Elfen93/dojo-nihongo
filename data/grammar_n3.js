// Gramática N3 escrita a mano. Niveles 14 en adelante.
const GRAMMAR_N3 = [
// ---- nivel 14 ----
{id:"n3-koto-ni-natteiru",lv:14,t:"〜ことになっている",s:"V-る・V-ない + ことになっている",bp:"ことになっている",e:"Expresa una norma, un horario o un acuerdo ya establecido: «está decidido que, la regla es que». No lo decide el hablante; es algo fijado por una institución, una costumbre o un plan previo.",ex:[
 {j:"この会社では九時に[出勤することになっています]。",s:"En esta empresa la norma es fichar a las nueve.",h:"出勤する"},
 {j:"来週、部長と[会うことになっている]。",s:"Está previsto que me reúna con el jefe la semana que viene.",h:"会う"},
 {j:"図書館では[飲食してはいけないことになっています]。",s:"En la biblioteca está establecido que no se puede comer ni beber.",h:"飲食する + てはいけない"}]},
{id:"n3-koto-wa-nai",lv:14,t:"〜ことはない",s:"V-る + ことはない",bp:"ことはない",e:"«No hace falta, no hay motivo para». Tranquiliza o quita importancia: no es necesario hacer algo o no hay razón para preocuparse.",ex:[
 {j:"そんなに[急ぐことはない]よ。",s:"No hace falta que te des tanta prisa.",h:"急ぐ"},
 {j:"失敗しても[心配することはありません]。",s:"Aunque falles, no hay por qué preocuparse.",h:"心配する, cortés"},
 {j:"わざわざ[来ることはなかった]のに。",s:"No hacía falta que vinieras expresamente.",h:"来る, pasado"}]},
{id:"n3-koto-da",lv:14,t:"〜ことだ",s:"V-る・V-ない + ことだ",bp:"ことだ",e:"Consejo o recomendación firme: «lo que hay que hacer es». Suena a instrucción de alguien con autoridad o experiencia.",ex:[
 {j:"風邪を治したいなら、ゆっくり[休むことだ]。",s:"Si quieres curarte el resfriado, lo que tienes que hacer es descansar.",h:"休む"},
 {j:"上手になりたければ、毎日[練習することです]。",s:"Si quieres mejorar, la clave es practicar cada día.",h:"練習する, cortés"},
 {j:"分からないときは[遠慮しないで聞くことだ]。",s:"Cuando no entiendas algo, hay que preguntar sin reparos.",h:"聞く"}]},
{id:"n3-koto-ka",lv:14,t:"〜ことか",s:"interrogativo + informal + ことか",bp:"ことか",e:"Exclamación de intensidad: «¡cuánto…!, ¡qué…!». Va con どんなに, 何度, どれほど y expresa un sentimiento fuerte sobre algo que el hablante ha vivido.",ex:[
 {j:"合格して、どんなに[うれしかったことか]。",s:"¡Cuánto me alegré al aprobar!",h:"うれしい, pasado"},
 {j:"この日を何年[待ったことか]。",s:"¡Cuántos años he esperado este día!",h:"待つ, pasado"},
 {j:"一人暮らしがどれほど[大変なことか]、やってみて分かった。",s:"Al probarlo entendí lo duro que es vivir solo.",h:"大変 + な"}]},
{id:"n3-koto-kara",lv:14,t:"〜ことから",s:"informal + ことから (N・な-adj + な/である + ことから)",bp:"ことから",e:"Indica la razón o el origen de un hecho, un nombre o un juicio: «debido a que, por el hecho de que». Muy habitual para explicar nombres y conclusiones.",ex:[
 {j:"窓が[開いていることから]、誰かが入ったと分かった。",s:"Por el hecho de que la ventana estaba abierta, se supo que alguien había entrado.",h:"開く + ている"},
 {j:"この町は[桜が多いことから]、「桜町」と呼ばれている。",s:"A este pueblo lo llaman Sakuramachi porque tiene muchos cerezos.",h:"多い"},
 {j:"[成績がいいことから]、彼は先生に信頼されている。",s:"Como tiene buenas notas, el profesor confía en él.",h:"いい"}]},
{id:"n3-koto-ni",lv:14,t:"〜ことに",s:"adj-い・adj-な (な)・V-た + ことに",bp:"ことに",e:"Introduce el sentimiento del hablante ante lo que va a decir: «para mi sorpresa, por desgracia, afortunadamente». Va con 驚いた, 残念な, うれしい, 困った.",ex:[
 {j:"[驚いたことに]、彼は一度も日本に行ったことがなかった。",s:"Para mi sorpresa, él nunca había estado en Japón.",h:"驚く, pasado"},
 {j:"[残念なことに]、試合は雨で中止になった。",s:"Por desgracia, el partido se canceló por la lluvia.",h:"残念 + な"},
 {j:"[うれしいことに]、全員が合格した。",s:"Afortunadamente, aprobaron todos.",h:"うれしい"}]},
{id:"n3-koto-ni-shiteiru",lv:14,t:"〜ことにしている",s:"V-る・V-ない + ことにしている",bp:"ことにしている",e:"Hábito que uno se ha impuesto por decisión propia: «tengo por norma, me he propuesto». Diferente de ことになっている, que es una norma externa.",ex:[
 {j:"毎朝三十分[走ることにしています]。",s:"Me he propuesto correr treinta minutos cada mañana.",h:"走る"},
 {j:"夜はコーヒーを[飲まないことにしている]。",s:"Tengo por norma no tomar café por la noche.",h:"飲む, negativo"},
 {j:"週末は仕事のメールを[見ないことにしている]。",s:"Los fines de semana me he propuesto no mirar el correo del trabajo.",h:"見る, negativo"}]},
// ---- nivel 15 ----
{id:"n3-mono-da",lv:15,t:"〜ものだ",s:"V-る・adj + ものだ / V-た + ものだ",bp:"ものだ",e:"Tres usos: (1) verdad general o naturaleza de las cosas («así son las cosas»); (2) con V-た, recuerdo nostálgico («solía…»); (3) con V-る, lo que es propio o debido («se debe…»).",ex:[
 {j:"時間がたつのは[早いものだ]。",s:"Qué rápido pasa el tiempo (así es).",h:"早い"},
 {j:"子どものころ、よくこの川で[泳いだものだ]。",s:"De niño solía nadar en este río.",h:"泳ぐ, pasado"},
 {j:"目上の人には敬語を[使うものだ]。",s:"Con los superiores se debe usar keigo.",h:"使う"}]},
{id:"n3-mono-ka",lv:15,t:"〜ものか",s:"V-る・adj + ものか (もんか)",bp:"ものか",e:"Negación rotunda con emoción: «¡ni hablar!, ¡de ninguna manera!». Coloquial: もんか. Expresa rechazo o determinación.",ex:[
 {j:"あんな店、二度と[行くものか]。",s:"A esa tienda no vuelvo ni loco.",h:"行く"},
 {j:"こんなところで[あきらめるもんか]。",s:"¡Ni hablar de rendirme ahora!",h:"あきらめる, coloquial"},
 {j:"彼の言うことなんて[信じるものか]。",s:"¿Creer lo que dice él? Jamás.",h:"信じる"}]},
{id:"n3-mono-no",lv:15,t:"〜ものの",s:"informal + ものの (な-adj + な/である + ものの)",bp:"ものの",e:"«Aunque, si bien»: se admite A, pero el resultado B no es el esperado. Registro algo formal.",ex:[
 {j:"大学は[卒業したものの]、仕事が見つからない。",s:"Aunque terminé la universidad, no encuentro trabajo.",h:"卒業する, pasado"},
 {j:"日本語は[話せるものの]、漢字はまだ苦手だ。",s:"Si bien sé hablar japonés, los kanji aún se me resisten.",h:"話せる"},
 {j:"[安いものの]、品質はあまりよくない。",s:"Aunque es barato, la calidad no es muy buena.",h:"安い"}]},
{id:"n3-mono-dakara",lv:15,t:"〜ものだから",s:"informal + ものだから (N・な-adj + な + ものだから)",bp:"ものだから",e:"Da una razón a modo de excusa, con tono de justificación: «es que…». Coloquial: もんだから.",ex:[
 {j:"電車が[遅れたものだから]、遅刻してしまいました。",s:"Es que el tren se retrasó, y por eso llegué tarde.",h:"遅れる, pasado"},
 {j:"[急いでいたものだから]、財布を忘れた。",s:"Como iba con prisa, me dejé la cartera.",h:"急ぐ + ている, pasado"},
 {j:"あまりに[おいしかったもんだから]、全部食べてしまった。",s:"Es que estaba tan rico que me lo comí todo.",h:"おいしい, pasado, coloquial"}]},
{id:"n3-mono-reason",lv:15,t:"〜もの / 〜もん (razón)",s:"informal + もの / もん",bp:"もの (because)",e:"Al final de la frase, justifica algo con tono infantil o íntimo: «es que…». Muy coloquial; típico de niños y conversación cercana.",ex:[
 {j:"行きたくない。だって、[寒いんだもん]。",s:"No quiero ir. Es que hace frío.",h:"寒い + んだ + もん"},
 {j:"だって、[知らなかったんだもの]。",s:"¡Es que no lo sabía!",h:"知る, pasado negativo + んだ + もの"},
 {j:"食べられないよ。[嫌いなんだもん]。",s:"No puedo comérmelo. Es que no me gusta.",h:"嫌い + なんだ + もん"}]},
{id:"n3-wake-ga-nai",lv:15,t:"〜わけがない",s:"informal + わけがない (N・な-adj + な/の + わけがない)",bp:"わけがない",e:"«Es imposible que, no puede ser que». Negación basada en la lógica: el hablante está seguro de que algo no puede ocurrir.",ex:[
 {j:"あんなに練習した彼が[負けるわけがない]。",s:"Es imposible que él pierda, con lo que ha entrenado.",h:"負ける"},
 {j:"こんな難しい問題、子どもに[解けるわけがない]。",s:"Un problema tan difícil no puede resolverlo un niño.",h:"解ける"},
 {j:"そんな[安いわけがない]。何か裏があるよ。",s:"No puede ser tan barato. Algo esconde.",h:"安い"}]},
{id:"n3-wake-ni-wa-ikanai",lv:15,t:"〜わけにはいかない",s:"V-る + わけにはいかない / V-ない + わけにはいかない",bp:"わけにはいかない",e:"«No puedo permitirme, no es aceptable (por una razón social o moral)». Con V-ない: «no me queda más remedio que».",ex:[
 {j:"大事な会議だから、[休むわけにはいかない]。",s:"Es una reunión importante; no puedo faltar.",h:"休む"},
 {j:"約束したので、[行かないわけにはいかない]。",s:"Como lo prometí, no me queda más remedio que ir.",h:"行く, negativo"},
 {j:"これは秘密だから、[話すわけにはいきません]。",s:"Es un secreto, así que no puedo contarlo.",h:"話す, cortés"}]},
// ---- nivel 16 ----
{id:"n3-bakari-ka",lv:16,t:"〜ばかりか",s:"informal・N + ばかりか + 〜も",bp:"ばかりか",e:"«No solo…, sino que además». Añade algo de mayor grado, a menudo negativo. Más formal que だけでなく.",ex:[
 {j:"彼は[遅刻したばかりか]、宿題も忘れてきた。",s:"No solo llegó tarde, sino que además olvidó los deberes.",h:"遅刻する, pasado"},
 {j:"この店は[安いばかりか]、味もいい。",s:"Esta tienda no solo es barata; además la comida es buena.",h:"安い"},
 {j:"[雨ばかりか]、風も強くなってきた。",s:"No solo llueve: también se ha levantado viento.",h:"雨 (N)"}]},
{id:"n3-bakari-ni",lv:16,t:"〜ばかりに",s:"informal (V-た・adj) + ばかりに",bp:"ばかりに",e:"«Solo por…, precisamente por…» seguido de un resultado negativo. Expresa arrepentimiento por una causa pequeña que trajo una mala consecuencia.",ex:[
 {j:"一言[言ったばかりに]、彼女を怒らせてしまった。",s:"Solo por decir una palabra, la hice enfadar.",h:"言う, pasado"},
 {j:"[寝坊したばかりに]、試験を受けられなかった。",s:"Por el simple hecho de dormirme, no pude hacer el examen.",h:"寝坊する, pasado"},
 {j:"[安かったばかりに]、すぐ壊れてしまった。",s:"Precisamente por ser barato, se rompió enseguida.",h:"安い, pasado"}]},
{id:"n3-ta-totan",lv:16,t:"〜たとたん（に）",s:"V-た + とたん（に）",bp:"たとたん",e:"«En cuanto, justo al…»: algo ocurre inmediatamente después de otra acción, de forma inesperada. Lo que sigue no es una acción voluntaria del hablante.",ex:[
 {j:"ドアを[開けたとたん]、猫が飛び出してきた。",s:"En cuanto abrí la puerta, el gato salió disparado.",h:"開ける, pasado"},
 {j:"[立ち上がったとたんに]、めまいがした。",s:"Justo al levantarme, me mareé.",h:"立ち上がる, pasado"},
 {j:"その話を[聞いたとたん]、彼は泣き出した。",s:"Nada más oír eso, él rompió a llorar.",h:"聞く, pasado"}]},
{id:"n3-tabi-ni",lv:16,t:"〜たびに",s:"V-る + たびに / N + の + たびに",bp:"たびに",e:"«Cada vez que». Cada repetición de A trae B.",ex:[
 {j:"この歌を[聞くたびに]、学生時代を思い出す。",s:"Cada vez que oigo esta canción, recuerdo mi época de estudiante.",h:"聞く"},
 {j:"[旅行のたびに]、お土産を買ってくる。",s:"Cada vez que viajo, traigo un recuerdo.",h:"旅行 + の"},
 {j:"彼に[会うたびに]、元気をもらう。",s:"Cada vez que lo veo, me da energía.",h:"会う"}]},
{id:"n3-tsuide-ni",lv:16,t:"〜ついでに",s:"V-る・V-た + ついでに / N + の + ついでに",bp:"ついでに",e:"«Aprovechando que, de paso». Se hace B aprovechando la ocasión de A, que es lo principal.",ex:[
 {j:"[買い物のついでに]、郵便局に寄った。",s:"Aprovechando que iba de compras, pasé por correos.",h:"買い物 + の"},
 {j:"東京に[行ったついでに]、昔の友だちに会った。",s:"Ya que fui a Tokio, vi a un viejo amigo.",h:"行く, pasado"},
 {j:"部屋を[掃除するついでに]、窓も拭いた。",s:"De paso que limpiaba la habitación, limpié también las ventanas.",h:"掃除する"}]},
{id:"n3-tsutsu",lv:16,t:"〜つつ / 〜つつある",s:"V-ます + つつ / V-ます + つつある",bp:"つつ",e:"つつ: «mientras» (formal, como ながら) o «aunque» (つつも). つつある: «está en proceso de», cambio en curso (escrito, formal).",ex:[
 {j:"景色を[楽しみつつ]、山道を歩いた。",s:"Caminé por el sendero disfrutando del paisaje.",h:"楽しむ"},
 {j:"悪いと[知りつつも]、うそをついてしまった。",s:"Aun sabiendo que estaba mal, mentí.",h:"知る + つつも"},
 {j:"日本の人口は[減りつつある]。",s:"La población de Japón está disminuyendo.",h:"減る + つつある"}]}
];
// Frases inéditas de examen para estos puntos
const EXAM_GRAMMAR_N3 = [
{g:"n3-koto-ni-natteiru",j:"このアパートではペットを[飼ってはいけないことになっている]。",s:"En este piso la norma es que no se pueden tener mascotas.",h:"飼う + てはいけない"},
{g:"n3-koto-wa-nai",j:"簡単な手続きだから、[心配することはない]。",s:"Es un trámite sencillo; no hay por qué preocuparse.",h:"心配する"},
{g:"n3-koto-da",j:"痩せたいなら、まず甘い物を[やめることだ]。",s:"Si quieres adelgazar, lo primero es dejar los dulces.",h:"やめる"},
{g:"n3-koto-ka",j:"母の料理をどれほど[恋しく思ったことか]。",s:"¡Cuánto eché de menos la comida de mi madre!",h:"恋しく思う, pasado"},
{g:"n3-koto-kara",j:"足跡が[残っていることから]、犯人は裏口から逃げたらしい。",s:"Por las huellas que quedan, parece que el culpable huyó por la puerta trasera.",h:"残る + ている"},
{g:"n3-koto-ni",j:"[困ったことに]、鍵をどこに置いたか思い出せない。",s:"Lo malo es que no recuerdo dónde dejé las llaves.",h:"困る, pasado"},
{g:"n3-koto-ni-shiteiru",j:"健康のために、エレベーターを[使わないことにしている]。",s:"Por salud, tengo por norma no usar el ascensor.",h:"使う, negativo"},
{g:"n3-mono-da",j:"若いころは、徹夜しても[平気だったものだ]。",s:"De joven, aguantaba sin dormir sin problema (recuerdo).",h:"平気 + だった"},
{g:"n3-mono-ka",j:"あんなに失礼な人に[謝るものか]。",s:"¿Pedirle perdón a alguien tan maleducado? Ni hablar.",h:"謝る"},
{g:"n3-mono-no",j:"薬を[飲んだものの]、熱は下がらなかった。",s:"Aunque tomé la medicina, la fiebre no bajó.",h:"飲む, pasado"},
{g:"n3-mono-dakara",j:"[初めてだったものだから]、緊張して何も言えなかった。",s:"Es que era la primera vez, y de los nervios no pude decir nada.",h:"初めて + だった"},
{g:"n3-mono-reason",j:"もう帰る。[疲れたんだもん]。",s:"Me voy ya. Es que estoy cansado.",h:"疲れる, pasado + んだ + もん"},
{g:"n3-wake-ga-nai",j:"彼がそんなことを[言うわけがない]。",s:"Es imposible que él dijera algo así.",h:"言う"},
{g:"n3-wake-ni-wa-ikanai",j:"店長に頼まれたから、[断るわけにはいかない]。",s:"Me lo pidió el encargado; no puedo negarme.",h:"断る"},
{g:"n3-bakari-ka",j:"熱が[あるばかりか]、せきもひどい。",s:"No solo tiene fiebre; además tose mucho.",h:"ある"},
{g:"n3-bakari-ni",j:"地図を[忘れたばかりに]、道に迷ってしまった。",s:"Solo por olvidar el mapa, me perdí.",h:"忘れる, pasado"},
{g:"n3-ta-totan",j:"電車が[止まったとたん]、みんなが走り出した。",s:"En cuanto se detuvo el tren, todos echaron a correr.",h:"止まる, pasado"},
{g:"n3-tabi-ni",j:"この写真を[見るたびに]、祖母を思い出す。",s:"Cada vez que veo esta foto, me acuerdo de mi abuela.",h:"見る"},
{g:"n3-tsuide-ni",j:"駅に[行くついでに]、切手を買ってきてくれない？",s:"Ya que vas a la estación, ¿me compras sellos?",h:"行く"},
{g:"n3-tsutsu",j:"この町の人口は少しずつ[増えつつある]。",s:"La población de esta ciudad está aumentando poco a poco.",h:"増える + つつある"}
];

EXAM_GRAMMAR.push(...EXAM_GRAMMAR_N3);
