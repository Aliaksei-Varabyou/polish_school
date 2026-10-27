// Chapter I "Początki epoki nowożytnej": the great discoveries, the Renaissance, the Reformation and
// the Catholic reform. Per paragraph: a table of terms and people (each row → "what is it / who was
// it" and "name it", see pairFromTable) and a table of dates (→ "what happened in" and "which year").
import type { DatedEvent, NamedEntry } from "../tableTemplate.ts";
import { dated, named } from "./common.ts";

// ---- 1. Wielkie odkrycia geograficzne ----

export const DISCOVERIES: readonly NamedEntry[] = [
  named("karawela", ["karawela", "каравелла"], ["zwrotny żaglowiec o trójkątnych żaglach, którym Portugalczycy i Hiszpanie wyruszali na oceany", "манёвренный парусник с треугольными парусами, на котором португальцы и испанцы выходили в океаны"], 1, ["karawele"], ["каравеллы"]),
  named("kompas", ["kompas", "компас"], ["przyrząd z namagnesowaną igłą wskazującą północ, dzięki któremu żeglarz zna kierunek na otwartym morzu", "прибор с намагниченной стрелкой, указывающей на север, по которому моряк знает направление в открытом море"], 1, ["busola"], ["буссоль"]),
  named("astrolabium", ["astrolabium", "астролябия"], ["przyrząd do mierzenia wysokości Słońca i gwiazd, z którego żeglarz odczytywał szerokość geograficzną", "прибор для измерения высоты Солнца и звёзд, по которому моряк определял географическую широту"], 2),
  named("przyprawy", ["przyprawy korzenne", "пряности"], ["pieprz, cynamon i goździki z Azji — towar tak cenny, że dla niego szukano morskiej drogi do Indii", "перец, корица и гвоздика из Азии — товар настолько ценный, что ради него искали морской путь в Индию"], 1, ["korzenie", "przyprawy"], ["специи"]),
  named("henryk-zeglarz", ["Henryk Żeglarz", "Генрих Мореплаватель"], ["portugalski książę, który finansował wyprawy wzdłuż zachodnich wybrzeży Afryki i założył szkołę nawigacji", "португальский принц, финансировавший экспедиции вдоль западных берегов Африки и основавший школу навигации"], 2, ["Henryk"], ["Энрике Мореплаватель", "Генрих"]),
  named("diaz", ["Bartolomeu Dias", "Бартоломеу Диаш"], ["portugalski żeglarz, który w 1488 roku jako pierwszy opłynął Przylądek Dobrej Nadziei na południu Afryki", "португальский мореплаватель, который в 1488 году первым обогнул мыс Доброй Надежды на юге Африки"], 2, ["Dias", "Bartłomiej Diaz", "Diaz"], ["Диаш", "Диас"]),
  named("kolumb", ["Krzysztof Kolumb", "Христофор Колумб"], ["genueńczyk w służbie Hiszpanii, który w 1492 roku szukając drogi do Indii dopłynął do wysp u wybrzeży Ameryki", "генуэзец на службе Испании, который в 1492 году, ища путь в Индию, доплыл до островов у берегов Америки"], 1, ["Kolumb"], ["Колумб"]),
  named("vasco-da-gama", ["Vasco da Gama", "Васко да Гама"], ["portugalski żeglarz, który w 1498 roku opłynął Afrykę i dotarł drogą morską do Indii", "португальский мореплаватель, который в 1498 году обогнул Африку и достиг Индии морским путём"], 1, ["da Gama"], ["да Гама"]),
  named("magellan", ["Ferdynand Magellan", "Фернан Магеллан"], ["dowódca wyprawy, która w latach 1519–1522 jako pierwsza opłynęła Ziemię dookoła; sam zginął na Filipinach", "командир экспедиции, которая в 1519–1522 годах первой обогнула Землю; сам погиб на Филиппинах"], 1, ["Magellan"], ["Магеллан"]),
  named("vespucci", ["Amerigo Vespucci", "Америго Веспуччи"], ["żeglarz, który jako pierwszy uznał odkryte ziemie za nowy kontynent; od jego imienia nazwano Amerykę", "мореплаватель, первым признавший открытые земли новым континентом; его именем названа Америка"], 2, ["Vespucci"], ["Веспуччи"]),
  named("konkwistador", ["konkwistadorzy", "конкистадоры"], ["hiszpańscy zdobywcy, którzy podbijali ziemie Ameryki w poszukiwaniu złota i sławy", "испанские завоеватели, покорявшие земли Америки в поисках золота и славы"], 1, ["konkwistador"], ["конкистадор"]),
  named("cortes", ["Hernán Cortés", "Эрнан Кортес"], ["konkwistador, który w 1521 roku podbił państwo Azteków w Meksyku", "конкистадор, который в 1521 году покорил государство ацтеков в Мексике"], 2, ["Cortés", "Cortez", "Ferdynand Cortez"], ["Кортес"]),
  named("pizarro", ["Francisco Pizarro", "Франсиско Писарро"], ["konkwistador, który podbił państwo Inków w Peru", "конкистадор, покоривший государство инков в Перу"], 2, ["Pizarro"], ["Писарро"]),
  named("aztekowie", ["Aztekowie", "ацтеки"], ["lud Ameryki Środkowej ze stolicą w Tenochtitlánie, podbity przez Hiszpanów", "народ Центральной Америки со столицей в Теночтитлане, покорённый испанцами"], 1, ["Aztecy"], ["ацтек"]),
  named("inkowie", ["Inkowie", "инки"], ["lud Ameryki Południowej, który zbudował w Andach wielkie państwo z siecią dróg", "народ Южной Америки, создавший в Андах большое государство с сетью дорог"], 1, ["Inka"], ["инк"]),
  named("kolonia", ["kolonia", "колония"], ["ziemia zajęta i rządzona przez obce państwo, które czerpie z niej bogactwa", "земля, захваченная и управляемая чужим государством, которое извлекает из неё богатства"], 1, ["kolonie"], ["колонии"]),
];

export const DISCOVERIES_DATES: readonly DatedEvent[] = [
  dated("diaz-1488", ["opłynięcie Przylądka Dobrej Nadziei przez Bartolomeu Diasa", "Бартоломеу Диаш обогнул мыс Доброй Надежды"], 1488, ["Portugalczycy dotarli na południowy kraniec Afryki — droga do Indii stanęła otworem.", "Португальцы достигли южной оконечности Африки — путь в Индию открылся."], 2),
  dated("kolumb-1492", ["pierwsza wyprawa Krzysztofa Kolumba", "первая экспедиция Христофора Колумба"], 1492, ["12 października Kolumb dopłynął do wyspy San Salvador; tę datę uznaje się za odkrycie Ameryki.", "12 октября Колумб доплыл до острова Сан-Сальвадор; эту дату считают открытием Америки."], 1, ["odkrycie Ameryki"], ["открытие Америки"]),
  dated("gama-1498", ["dotarcie Vasco da Gamy do Indii", "Васко да Гама достиг Индии"], 1498, ["Portugalczycy znaleźli morską drogę do Indii wokół Afryki.", "Португальцы нашли морской путь в Индию вокруг Африки."], 1),
  dated("magellan-1519", ["początek wyprawy Magellana dookoła świata", "начало кругосветной экспедиции Магеллана"], 1519, ["Pięć statków wypłynęło z Hiszpanii; po trzech latach wrócił tylko jeden, bez Magellana.", "Пять кораблей вышли из Испании; через три года вернулся только один, без Магеллана."], 2),
  dated("cortes-1521", ["podbój państwa Azteków przez Cortésa", "завоевание государства ацтеков Кортесом"], 1521, ["Hiszpanie zdobyli Tenochtitlán, stolicę Azteków.", "Испанцы взяли Теночтитлан, столицу ацтеков."], 2),
  dated("magellan-1522", ["zakończenie pierwszej podróży dookoła świata", "завершение первого кругосветного плавания"], 1522, ["Statek „Victoria” wrócił do Hiszpanii — dowód, że Ziemia jest kulą.", "Корабль «Виктория» вернулся в Испанию — доказательство, что Земля шар."], 2),
];

// ---- 2. Renesans w Europie ----

export const RENAISSANCE: readonly NamedEntry[] = [
  named("renesans", ["renesans", "Возрождение"], ["epoka w kulturze XV–XVI wieku, która odrodziła wzory antyku i postawiła w centrum człowieka", "эпоха в культуре XV–XVI веков, возродившая античные образцы и поставившая в центр человека"], 1, ["odrodzenie"], ["Ренессанс"]),
  named("humanizm", ["humanizm", "гуманизм"], ["prąd umysłowy renesansu: zainteresowanie człowiekiem, jego rozumem i ziemskim życiem", "течение мысли эпохи Возрождения: интерес к человеку, его разуму и земной жизни"], 1),
  named("antyk", ["antyk", "античность"], ["kultura starożytnej Grecji i Rzymu, którą renesans uznał za wzór", "культура Древней Греции и Рима, которую Возрождение считало образцом"], 1, ["starożytność"], ["древность"]),
  named("mecenat", ["mecenat", "меценатство"], ["opieka bogatych władców i mieszczan nad artystami i uczonymi", "покровительство богатых правителей и горожан художникам и учёным"], 2, ["mecenas"], ["меценат"]),
  named("medyceusze", ["Medyceusze", "Медичи"], ["ród bankierów rządzący Florencją, słynny z opieki nad sztuką", "род банкиров, правивший Флоренцией и знаменитый покровительством искусству"], 2, ["Medici"], ["Медичи"]),
  named("gutenberg", ["Johannes Gutenberg", "Иоганн Гутенберг"], ["wynalazca druku ruchomą czcionką około 1450 roku, dzięki któremu książki stały się tańsze i powszechne", "изобретатель книгопечатания подвижными литерами около 1450 года, благодаря которому книги стали дешевле и доступнее"], 1, ["Gutenberg", "Jan Gutenberg"], ["Гутенберг"]),
  named("leonardo", ["Leonardo da Vinci", "Леонардо да Винчи"], ["malarz, wynalazca i uczony — autor „Mony Lisy” i „Ostatniej Wieczerzy”", "художник, изобретатель и учёный — автор «Моны Лизы» и «Тайной вечери»"], 1, ["Leonardo"], ["Леонардо"]),
  named("michal-aniol", ["Michał Anioł", "Микеланджело"], ["rzeźbiarz i malarz, twórca „Dawida” i fresków w Kaplicy Sykstyńskiej", "скульптор и живописец, создатель «Давида» и фресок Сикстинской капеллы"], 1, ["Michelangelo"], ["Микеланджело Буонарроти"]),
  named("rafael", ["Rafael Santi", "Рафаэль Санти"], ["malarz renesansu, autor fresku „Szkoła Ateńska” i wielu madonn", "художник Возрождения, автор фрески «Афинская школа» и многих мадонн"], 2, ["Rafael", "Rafał Santi"], ["Рафаэль"]),
  named("erazm", ["Erazm z Rotterdamu", "Эразм Роттердамский"], ["najsłynniejszy humanista Europy, autor „Pochwały głupoty”", "самый известный гуманист Европы, автор «Похвалы глупости»"], 2, ["Erazm"], ["Эразм"]),
  named("kopernik", ["Mikołaj Kopernik", "Николай Коперник"], ["polski astronom, który w dziele „O obrotach sfer niebieskich” dowodził, że Ziemia krąży wokół Słońca", "польский астроном, доказывавший в труде «О вращении небесных сфер», что Земля вращается вокруг Солнца"], 1, ["Kopernik"], ["Коперник"]),
  named("heliocentryzm", ["teoria heliocentryczna", "гелиоцентрическая теория"], ["pogląd, że w środku układu jest Słońce, a Ziemia i planety krążą wokół niego", "взгляд, согласно которому в центре системы Солнце, а Земля и планеты вращаются вокруг него"], 2, ["heliocentryzm"], ["гелиоцентризм"]),
  named("perspektywa", ["perspektywa", "перспектива"], ["sposób malowania, dzięki któremu na płaskim obrazie widać głębię i odległość", "способ рисования, благодаря которому на плоской картине видна глубина и расстояние"], 2),
  named("machiavelli", ["Niccolò Machiavelli", "Никколо Макиавелли"], ["florencki pisarz polityczny, autor „Księcia” o tym, jak zdobyć i utrzymać władzę", "флорентийский политический писатель, автор «Государя» о том, как получить и удержать власть"], 3, ["Machiavelli", "Makiawel"], ["Макиавелли"]),
  named("morus", ["Tomasz Morus", "Томас Мор"], ["angielski humanista, który w „Utopii” opisał idealne, sprawiedliwe państwo", "английский гуманист, описавший в «Утопии» идеальное справедливое государство"], 3, ["Thomas More", "Morus"], ["Мор"]),
];

export const RENAISSANCE_DATES: readonly DatedEvent[] = [
  dated("druk-1450", ["wynalezienie druku przez Gutenberga", "изобретение книгопечатания Гутенбергом"], 1450, ["Około tego roku w Moguncji ruszyła pierwsza prasa drukarska z ruchomą czcionką.", "Около этого года в Майнце заработал первый печатный станок с подвижными литерами."], 1),
  dated("mona-1503", ["rozpoczęcie „Mony Lisy” przez Leonarda", "Леонардо начал «Мону Лизу»"], 1503, ["Leonardo pracował nad portretem przez wiele lat.", "Леонардо работал над портретом много лет."], 3),
  dated("dawid-1504", ["ukończenie „Dawida” Michała Anioła", "Микеланджело закончил «Давида»"], 1504, ["Pięciometrowy posąg stanął przed ratuszem Florencji.", "Пятиметровая статуя встала перед ратушей Флоренции."], 2),
  dated("sykstyna-1512", ["ukończenie fresków na sklepieniu Kaplicy Sykstyńskiej", "завершение фресок на своде Сикстинской капеллы"], 1512, ["Michał Anioł malował sklepienie przez cztery lata, leżąc na rusztowaniu.", "Микеланджело расписывал свод четыре года, лёжа на лесах."], 3),
  dated("kopernik-1543", ["wydanie „O obrotach sfer niebieskich” Kopernika", "издание «О вращении небесных сфер» Коперника"], 1543, ["Dzieło ukazało się w roku śmierci autora i zapoczątkowało przewrót w astronomii.", "Труд вышел в год смерти автора и положил начало перевороту в астрономии."], 1),
];

// ---- 3. Reformacja w Europie ----

export const REFORMATION: readonly NamedEntry[] = [
  named("reformacja", ["reformacja", "Реформация"], ["ruch religijny XVI wieku dążący do naprawy Kościoła, który doprowadził do powstania wyznań protestanckich", "религиозное движение XVI века за исправление церкви, приведшее к возникновению протестантских исповеданий"], 1),
  named("odpust", ["odpusty", "индульгенции"], ["sprzedawane przez Kościół odpuszczenie kar za grzechy — ich handel oburzył Lutra", "продаваемое церковью отпущение наказаний за грехи — торговля ими возмутила Лютера"], 1, ["odpust"], ["индульгенция"]),
  named("luter", ["Marcin Luter", "Мартин Лютер"], ["niemiecki zakonnik, który w 1517 roku ogłosił 95 tez przeciw odpustom i zapoczątkował reformację", "немецкий монах, который в 1517 году обнародовал 95 тезисов против индульгенций и положил начало Реформации"], 1, ["Luter"], ["Лютер"]),
  named("95-tez", ["95 tez", "95 тезисов"], ["zarzuty Lutra wobec handlu odpustami, według tradycji przybite do drzwi kościoła w Wittenberdze", "возражения Лютера против торговли индульгенциями, по преданию прибитые к дверям церкви в Виттенберге"], 1, ["tezy Lutra"], ["тезисы Лютера"]),
  named("luteranizm", ["luteranizm", "лютеранство"], ["wyznanie oparte na nauce Lutra: tylko Biblia jest źródłem wiary, a zbawia sama wiara", "исповедание, основанное на учении Лютера: единственный источник веры — Библия, а спасает сама вера"], 2, ["luteranie"], ["лютеране"]),
  named("protestanci", ["protestanci", "протестанты"], ["wspólna nazwa wyznawców Kościołów powstałych w wyniku reformacji", "общее название приверженцев церквей, возникших в результате Реформации"], 1, ["protestantyzm"], ["протестантизм"]),
  named("kalwin", ["Jan Kalwin", "Жан Кальвин"], ["reformator działający w Genewie, który nauczał o predestynacji", "реформатор, действовавший в Женеве и учивший о предопределении"], 1, ["Kalwin"], ["Кальвин"]),
  named("predestynacja", ["predestynacja", "предопределение"], ["nauka Kalwina, że Bóg z góry przeznaczył każdego człowieka do zbawienia albo potępienia", "учение Кальвина о том, что Бог заранее предназначил каждого человека к спасению или гибели"], 3),
  named("kalwinizm", ["kalwinizm", "кальвинизм"], ["wyznanie oparte na nauce Kalwina, popularne w Szwajcarii, Niderlandach i Szkocji", "исповедание, основанное на учении Кальвина, популярное в Швейцарии, Нидерландах и Шотландии"], 2, ["kalwini"], ["кальвинисты"]),
  named("henryk-viii", ["Henryk VIII", "Генрих VIII"], ["król Anglii, który zerwał z papieżem i ogłosił się głową Kościoła anglikańskiego", "король Англии, порвавший с папой и объявивший себя главой англиканской церкви"], 1, ["Henryk 8"], ["Генрих 8"]),
  named("anglikanizm", ["Kościół anglikański", "англиканская церковь"], ["Kościół w Anglii, na którego czele stoi król, a nie papież", "церковь в Англии, которую возглавляет король, а не папа"], 2, ["anglikanizm"], ["англиканство"]),
  named("hugenoci", ["hugenoci", "гугеноты"], ["francuscy kalwini, prześladowani w czasie wojen religijnych", "французские кальвинисты, преследуемые во время религиозных войн"], 2, ["hugenot"], ["гугенот"]),
  named("noc-bartlomieja", ["noc św. Bartłomieja", "Варфоломеевская ночь"], ["rzeź hugenotów w Paryżu w 1572 roku", "резня гугенотов в Париже в 1572 году"], 2, ["noc świętego Bartłomieja"], ["Варфоломеевская резня"]),
  named("pokoj-augsburski", ["pokój augsburski", "Аугсбургский религиозный мир"], ["ugoda z 1555 roku: każdy książę Rzeszy sam wybiera wyznanie dla swoich poddanych („czyj kraj, tego religia”)", "соглашение 1555 года: каждый князь империи сам выбирает веру для своих подданных («чья власть, того и вера»)"], 2, ["pokój w Augsburgu"], ["Аугсбургский мир"]),
  named("edykt-nantejski", ["edykt nantejski", "Нантский эдикт"], ["dokument króla Henryka IV z 1598 roku dający hugenotom wolność wyznania", "указ короля Генриха IV 1598 года, давший гугенотам свободу вероисповедания"], 3),
];

export const REFORMATION_DATES: readonly DatedEvent[] = [
  dated("tezy-1517", ["ogłoszenie 95 tez przez Marcina Lutra", "обнародование 95 тезисов Мартина Лютера"], 1517, ["31 października w Wittenberdze; ten dzień uznaje się za początek reformacji.", "31 октября в Виттенберге; этот день считают началом Реформации."], 1, ["początek reformacji", "wystąpienie Lutra"], ["начало Реформации", "выступление Лютера"]),
  dated("supremacja-1534", ["akt supremacji Henryka VIII", "Акт о супрематии Генриха VIII"], 1534, ["Parlament uznał króla za głowę Kościoła w Anglii.", "Парламент признал короля главой церкви в Англии."], 3, ["powstanie Kościoła anglikańskiego"], ["возникновение англиканской церкви"]),
  dated("augsburg-1555", ["pokój augsburski", "Аугсбургский религиозный мир"], 1555, ["Zakończył wojny między katolikami a luteranami w Rzeszy.", "Завершил войны между католиками и лютеранами в империи."], 2),
  dated("bartlomiej-1572", ["noc św. Bartłomieja", "Варфоломеевская ночь"], 1572, ["W Paryżu wymordowano tysiące hugenotów przybyłych na królewski ślub.", "В Париже перебили тысячи гугенотов, приехавших на королевскую свадьбу."], 2),
  dated("nantes-1598", ["edykt nantejski", "Нантский эдикт"], 1598, ["Henryk IV zakończył wojny religijne we Francji, dając hugenotom swobodę wyznania.", "Генрих IV завершил религиозные войны во Франции, дав гугенотам свободу веры."], 3),
];

// ---- 4. Reforma Kościoła katolickiego ----

export const CATHOLIC_REFORM: readonly NamedEntry[] = [
  named("kontrreformacja", ["kontrreformacja", "Контрреформация"], ["działania Kościoła katolickiego przeciw reformacji i odzyskiwanie wiernych dla katolicyzmu", "действия католической церкви против Реформации и возвращение верующих в католичество"], 1, ["reforma katolicka"], ["католическая реформа"]),
  named("sobor-trydencki", ["sobór trydencki", "Тридентский собор"], ["zgromadzenie biskupów w latach 1545–1563, które potępiło naukę protestantów i uporządkowało Kościół", "собрание епископов в 1545–1563 годах, осудившее учение протестантов и упорядочившее церковь"], 1, ["sobór w Trydencie"], ["Триентский собор"]),
  named("jezuici", ["jezuici", "иезуиты"], ["zakon założony przez Ignacego Loyolę, słynny z doskonałych szkół i misji", "орден, основанный Игнатием Лойолой, знаменитый превосходными школами и миссиями"], 1, ["Towarzystwo Jezusowe", "jezuita"], ["Общество Иисуса", "иезуит"]),
  named("loyola", ["Ignacy Loyola", "Игнатий Лойола"], ["hiszpański szlachcic i były żołnierz, założyciel zakonu jezuitów", "испанский дворянин и бывший солдат, основатель ордена иезуитов"], 1, ["Loyola", "Ignacy z Loyoli"], ["Лойола"]),
  named("inkwizycja", ["inkwizycja", "инквизиция"], ["sądy kościelne ścigające odstępców od wiary katolickiej", "церковные суды, преследовавшие отступников от католической веры"], 1),
  named("indeks", ["indeks ksiąg zakazanych", "Индекс запрещённых книг"], ["lista książek, których katolikom nie wolno było czytać, ogłoszona w 1559 roku", "список книг, которые католикам запрещалось читать, объявленный в 1559 году"], 2, ["indeks"], ["индекс"]),
  named("seminarium", ["seminarium duchowne", "духовная семинария"], ["szkoła kształcąca przyszłych księży, nakazana przez sobór trydencki w każdej diecezji", "школа, готовящая будущих священников, предписанная Тридентским собором в каждой епархии"], 2, ["seminaria duchowne", "seminarium"], ["семинария"]),
  named("katechizm", ["katechizm", "катехизис"], ["książka z wykładem zasad wiary w pytaniach i odpowiedziach, wydana po soborze", "книга с изложением основ веры в вопросах и ответах, изданная после собора"], 2),
  named("misje", ["misje", "миссии"], ["wyprawy zakonników, zwłaszcza jezuitów, nawracające na katolicyzm w Ameryce i Azji", "поездки монахов, особенно иезуитов, обращавших в католичество в Америке и Азии"], 2, ["misja", "misjonarze"], ["миссия", "миссионеры"]),
  named("kolegium", ["kolegium jezuickie", "иезуитская коллегия"], ["bezpłatna szkoła jezuitów, w której uczyli się także synowie szlachty i mieszczan", "бесплатная школа иезуитов, где учились и сыновья шляхты и горожан"], 2, ["kolegium", "kolegia jezuickie"], ["коллегия"]),
  named("barok-sztuka", ["sztuka barokowa", "искусство барокко"], ["bogaty, pełen złota i ruchu styl kościołów, którym Kościół chciał olśnić wiernych", "богатый, полный золота и движения стиль церквей, которым церковь хотела поразить верующих"], 2, ["barok"], ["барокко"]),
  named("papiez-pawel-iii", ["Paweł III", "Павел III"], ["papież, który zatwierdził zakon jezuitów i zwołał sobór trydencki", "папа, утвердивший орден иезуитов и созвавший Тридентский собор"], 3, ["papież Paweł III"], ["папа Павел III"]),
];

export const CATHOLIC_REFORM_DATES: readonly DatedEvent[] = [
  dated("jezuici-1534", ["założenie zakonu jezuitów przez Ignacego Loyolę", "основание ордена иезуитов Игнатием Лойолой"], 1534, ["Loyola i sześciu towarzyszy złożyli śluby w Paryżu.", "Лойола и шесть товарищей принесли обеты в Париже."], 2),
  dated("jezuici-1540", ["zatwierdzenie zakonu jezuitów przez papieża", "утверждение ордена иезуитов папой"], 1540, ["Paweł III uznał Towarzystwo Jezusowe za zakon Kościoła.", "Павел III признал Общество Иисуса орденом церкви."], 3),
  dated("trydent-1545", ["początek soboru trydenckiego", "начало Тридентского собора"], 1545, ["Biskupi zebrali się w Trydencie, by odpowiedzieć na reformację.", "Епископы собрались в Триденте, чтобы ответить на Реформацию."], 1),
  dated("indeks-1559", ["ogłoszenie indeksu ksiąg zakazanych", "объявление Индекса запрещённых книг"], 1559, ["Pierwsza oficjalna lista pism, których katolikom nie wolno czytać.", "Первый официальный список сочинений, которые католикам нельзя читать."], 3),
  dated("trydent-1563", ["zakończenie soboru trydenckiego", "завершение Тридентского собора"], 1563, ["Po 18 latach obrad sobór ogłosił reformę Kościoła.", "После 18 лет заседаний собор объявил реформу церкви."], 2),
];
