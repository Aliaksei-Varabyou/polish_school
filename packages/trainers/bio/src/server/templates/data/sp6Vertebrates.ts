// Class 6, chapters IV–V: fish, amphibians, reptiles, birds and mammals. Each group has a table of
// body features (its "X – kręgowce …" paragraph) and a table of species with what sets them apart
// (its "Przegląd i znaczenie" paragraph).
import type { NamedEntry } from "../tableTemplate.ts";
import { named } from "./sp6Invertebrates.ts";

// ---- IV. Kręgowce zmiennocieplne ----

export const FISH: readonly NamedEntry[] = [
  named("skrzela", ["skrzela", "жабры"], ["narządy pobierające tlen rozpuszczony w wodzie", "органы, поглощающие растворённый в воде кислород"], 1),
  named("pokrywy-skrzelowe", ["pokrywy skrzelowe", "жаберные крышки"], ["kostne płytki osłaniające skrzela ryb kostnoszkieletowych", "костные пластинки, прикрывающие жабры костных рыб"], 2),
  named("pecherz-plawny", ["pęcherz pławny", "плавательный пузырь"], ["narząd wypełniony gazem, który pozwala rybie unosić się na różnej głębokości", "заполненный газом орган, позволяющий рыбе держаться на разной глубине"], 1),
  named("linia-boczna", ["linia boczna", "боковая линия"], ["narząd zmysłu wyczuwający ruchy wody i zmiany ciśnienia", "орган чувств, улавливающий движения воды и изменения давления"], 1),
  named("pletwa-ogonowa", ["płetwa ogonowa", "хвостовой плавник"], ["płetwa nadająca rybie napęd do przodu", "плавник, двигающий рыбу вперёд"], 1),
  named("pletwy-parzyste", ["płetwy piersiowe i brzuszne", "грудные и брюшные плавники"], ["parzyste płetwy do sterowania i hamowania", "парные плавники для управления и торможения"], 2, ["płetwy parzyste"], ["парные плавники"]),
  named("luski", ["łuski", "чешуя"], ["dachówkowato ułożone płytki chroniące ciało ryby", "черепицеобразно расположенные пластинки, защищающие тело рыбы"], 1, ["łuska"], ["чешуйки"]),
  named("sluz", ["śluz", "слизь"], ["wydzielina skóry zmniejszająca tarcie o wodę i chroniąca przed drobnoustrojami", "выделения кожи, уменьшающие трение о воду и защищающие от микробов"], 1),
  named("ikra", ["ikra", "икра"], ["jaja ryb składane do wody", "яйца рыб, откладываемые в воду"], 1),
  named("tarlo", ["tarło", "нерест"], ["składanie ikry i zapłodnienie zewnętrzne w wodzie", "откладывание икры и наружное оплодотворение в воде"], 2),
  named("narybek", ["narybek", "мальки"], ["młode ryby wylęgłe z ikry", "молодые рыбки, вылупившиеся из икры"], 1, [], ["малёк"]),
  named("ksztalt-oplywowy", ["opływowy kształt ciała", "обтекаемая форма тела"], ["kształt ciała zmniejszający opór wody podczas pływania", "форма тела, уменьшающая сопротивление воды при плавании"], 1, ["kształt opływowy"], ["обтекаемое тело"]),
];

export const FISH_SPECIES: readonly NamedEntry[] = [
  named("karp", ["karp", "карп"], ["ryba słodkowodna hodowana w stawach, tradycyjne danie wigilijne", "пресноводная рыба, которую разводят в прудах, традиционное рождественское блюдо в Польше"], 1),
  named("sledz", ["śledź", "сельдь"], ["ryba morska żyjąca w ławicach, ważna w rybołówstwie Bałtyku", "морская стайная рыба, важная для рыболовства на Балтике"], 1, [], ["селёдка"]),
  named("dorsz", ["dorsz", "треска"], ["drapieżna ryba morska, z której wątroby otrzymuje się tran", "хищная морская рыба, из печени которой получают рыбий жир"], 2),
  named("losos", ["łosoś", "лосось"], ["ryba wędrowna: żyje w morzu, a na tarło płynie w górę rzek", "проходная рыба: живёт в море, а на нерест поднимается вверх по рекам"], 2),
  named("wegorz", ["węgorz europejski", "европейский угорь"], ["ryba o wężowatym ciele, wędrująca na tarło do Morza Sargassowego", "рыба со змеевидным телом, уплывающая на нерест в Саргассово море"], 2, ["węgorz"], ["угорь"]),
  named("szczupak", ["szczupak", "щука"], ["drapieżna ryba słodkowodna polująca z zasadzki", "хищная пресноводная рыба, охотящаяся из засады"], 1),
  named("pstrag", ["pstrąg potokowy", "ручьевая форель"], ["ryba czystych, chłodnych i natlenionych strumieni górskich", "рыба чистых, холодных, богатых кислородом горных ручьёв"], 2, ["pstrąg"], ["форель"]),
  named("rekin", ["rekin", "акула"], ["ryba chrzęstnoszkieletowa, która nie ma pęcherza pławnego", "хрящевая рыба без плавательного пузыря"], 2, ["rekiny"], ["акулы"]),
  named("plaszczka", ["płaszczka", "скат"], ["ryba chrzęstnoszkieletowa o płaskim ciele, żyjąca przy dnie morza", "хрящевая рыба с плоским телом, живущая у дна моря"], 2, [], ["скаты"]),
  named("konik-morski", ["konik morski", "морской конёк"], ["ryba, u której samiec nosi jaja w torbie lęgowej", "рыба, у которой самец вынашивает икру в выводковой сумке"], 2),
];

export const AMPHIBIANS: readonly NamedEntry[] = [
  named("skora-naga", ["naga, wilgotna skóra", "голая влажная кожа"], ["skóra płazów bez łusek, bogata w gruczoły śluzowe", "кожа земноводных без чешуи, богатая слизистыми железами"], 1, ["skóra naga", "naga skóra"], ["голая кожа"]),
  named("oddychanie-skorne", ["oddychanie przez skórę", "кожное дыхание"], ["wymiana gazów przez wilgotną skórę, uzupełniająca oddychanie płucami", "газообмен через влажную кожу, дополняющий дыхание лёгкими"], 2, ["oddychanie skórne"], ["дыхание через кожу"]),
  named("pluca", ["płuca", "лёгкие"], ["proste, workowate narządy oddechowe dorosłych płazów", "простые мешковидные органы дыхания взрослых земноводных"], 2),
  named("skrzek", ["skrzek", "икра лягушки"], ["galaretowate jaja płazów składane w wodzie", "студенистые яйца земноводных, отложенные в воду"], 1, [], ["лягушачья икра", "икра"]),
  named("kijanka", ["kijanka", "головастик"], ["larwa płaza żyjąca w wodzie, oddychająca skrzelami", "личинка земноводного, живущая в воде и дышащая жабрами"], 1, ["kijanki"], ["головастики"]),
  named("przeobrazenie", ["przeobrażenie", "метаморфоз"], ["przemiana kijanki w dorosłego płaza", "превращение головастика во взрослое земноводное"], 1, ["metamorfoza"], ["превращение"]),
  named("blona-plawna", ["błona pławna", "плавательная перепонка"], ["skóra między palcami tylnych kończyn żaby, ułatwiająca pływanie", "кожа между пальцами задних ног лягушки, помогающая плавать"], 1, [], ["перепонки"]),
  named("zaplodnienie-zewnetrzne", ["zapłodnienie zewnętrzne", "наружное оплодотворение"], ["łączenie się komórek jajowych z plemnikami w wodzie, poza ciałem samicy", "слияние яйцеклеток со сперматозоидами в воде, вне тела самки"], 2),
  named("sen-zimowy", ["sen zimowy", "зимняя спячка"], ["zimowe odrętwienie płazów, gdy temperatura ich ciała spada razem z otoczeniem", "зимнее оцепенение земноводных, когда температура их тела падает вместе со средой"], 2, ["hibernacja", "odrętwienie zimowe"], ["спячка", "оцепенение"]),
  named("jezyk", ["lepki język", "липкий язык"], ["wyrzucany z pyska narząd, którym żaba chwyta owady", "выбрасываемый изо рта орган, которым лягушка ловит насекомых"], 1, ["język"], ["язык"]),
];

export const AMPHIBIAN_SPECIES: readonly NamedEntry[] = [
  named("zaba-trawna", ["żaba trawna", "травяная лягушка"], ["pospolita brunatna żaba, poza okresem godów żyjąca na łąkach i w lasach", "обычная бурая лягушка, вне брачного периода живущая на лугах и в лесах"], 1),
  named("zaba-wodna", ["żaba wodna", "зелёная лягушка"], ["zielona żaba spędzająca większość życia w wodzie lub tuż przy niej", "зелёная лягушка, проводящая большую часть жизни в воде или рядом с ней"], 2, [], ["прудовая лягушка"]),
  named("ropucha", ["ropucha szara", "серая жаба"], ["płaz o suchej, brodawkowatej skórze z gruczołami jadowymi", "земноводное с сухой бугристой кожей с ядовитыми железами"], 1, ["ropucha"], ["жаба"]),
  named("rzekotka", ["rzekotka drzewna", "обыкновенная квакша"], ["mała zielona żaba z przylgami na palcach, wspinająca się na drzewa", "маленькая зелёная лягушка с присосками на пальцах, лазающая по деревьям"], 2, ["rzekotka"], ["квакша"]),
  named("kumak", ["kumak nizinny", "краснобрюхая жерлянка"], ["płaz z jaskrawym, czerwono-czarnym brzuchem ostrzegającym drapieżniki", "земноводное с ярким красно-чёрным брюшком, предупреждающим хищников"], 3, ["kumak"], ["жерлянка"]),
  named("traszka", ["traszka zwyczajna", "обыкновенный тритон"], ["płaz ogoniasty, którego samiec ma wiosną grzebień na grzbiecie", "хвостатое земноводное, у самца которого весной на спине гребень"], 2, ["traszka"], ["тритон"]),
  named("salamandra", ["salamandra plamista", "огненная саламандра"], ["czarny płaz ogoniasty w żółte plamy, żyjący w górskich lasach", "чёрное хвостатое земноводное в жёлтых пятнах, живущее в горных лесах"], 1, ["salamandra"], ["саламандра", "пятнистая саламандра"]),
  named("grzebiuszka", ["grzebiuszka ziemna", "обыкновенная чесночница"], ["płaz zakopujący się w ziemi, pachnący czosnkiem w razie zagrożenia", "земноводное, закапывающееся в землю и пахнущее чесноком при опасности"], 3, ["grzebiuszka"], ["чесночница"]),
  named("beznogie", ["płazy beznogie", "безногие земноводные"], ["tropikalne płazy bez kończyn, przypominające dżdżownice", "тропические земноводные без конечностей, похожие на дождевых червей"], 3, ["marszczelce"], ["червяги"]),
];

export const REPTILES: readonly NamedEntry[] = [
  named("luski-rogowe", ["łuski rogowe", "роговые чешуи"], ["zrogowaciały naskórek chroniący gady przed wysychaniem", "ороговевший эпидермис, защищающий пресмыкающихся от высыхания"], 1, ["łuski"], ["чешуя", "роговая чешуя"]),
  named("sucha-skora", ["sucha skóra bez gruczołów", "сухая кожа без желёз"], ["skóra gadów, prawie pozbawiona gruczołów śluzowych", "кожа пресмыкающихся, почти лишённая слизистых желёз"], 2, ["sucha skóra"], ["сухая кожа"]),
  named("linienie", ["linienie", "линька"], ["zrzucanie zrogowaciałej skóry, u węży w całości jako wylinka", "сбрасывание ороговевшей кожи, у змей целиком в виде выползка"], 1),
  named("jajo", ["jajo z osłonką", "яйцо с оболочкой"], ["jajo składane na lądzie, chronione przed wyschnięciem skórzastą lub wapienną osłonką", "яйцо, откладываемое на суше и защищённое от высыхания кожистой или известковой оболочкой"], 2, ["jajo"], ["яйцо"]),
  named("zaplodnienie-wewnetrzne", ["zapłodnienie wewnętrzne", "внутреннее оплодотворение"], ["łączenie się gamet w ciele samicy, niezależne od wody", "слияние гамет в теле самки, не зависящее от воды"], 2),
  named("pluca", ["płuca", "лёгкие"], ["jedyne narządy oddechowe gadów, bardziej pofałdowane niż u płazów", "единственные органы дыхания пресмыкающихся, более складчатые, чем у земноводных"], 2),
  named("wygrzewanie", ["wygrzewanie się na słońcu", "прогревание на солнце"], ["zachowanie zmiennocieplnych gadów podnoszące temperaturę ich ciała", "поведение холоднокровных пресмыкающихся, повышающее температуру их тела"], 1, ["wygrzewanie"], ["греться на солнце"]),
  named("autotomia", ["autotomia", "автотомия"], ["odrzucanie ogona przez jaszczurkę w razie zagrożenia", "отбрасывание ящерицей хвоста при опасности"], 2, ["odrzucanie ogona"], ["отбрасывание хвоста"]),
  named("jezyk-weza", ["rozwidlony język", "раздвоенный язык"], ["narząd, którym wąż zbiera zapachy z powietrza", "орган, которым змея собирает запахи из воздуха"], 2, ["język"], ["язык"]),
  named("szczeki", ["rozciągliwe szczęki", "растяжимые челюсти"], ["ruchome połączenie kości czaszki pozwalające wężom połykać ofiary w całości", "подвижное соединение костей черепа, позволяющее змеям глотать добычу целиком"], 2, ["szczęki"], ["челюсти"]),
];

export const REPTILE_SPECIES: readonly NamedEntry[] = [
  named("zwinka", ["jaszczurka zwinka", "прыткая ящерица"], ["jaszczurka nasłonecznionych miejsc, której samiec ma wiosną zielone boki", "ящерица солнечных мест, у самца которой весной зелёные бока"], 1, ["zwinka", "jaszczurka"], ["ящерица"]),
  named("padalec", ["padalec zwyczajny", "ломкая веретеница"], ["beznoga jaszczurka z powiekami, często mylona z wężem", "безногая ящерица с веками, которую часто путают со змеёй"], 2, ["padalec"], ["веретеница"]),
  named("zmija", ["żmija zygzakowata", "обыкновенная гадюка"], ["jedyny jadowity wąż w Polsce, z zygzakiem na grzbiecie", "единственная ядовитая змея Польши, с зигзагом на спине"], 1, ["żmija"], ["гадюка"]),
  named("zaskroniec", ["zaskroniec zwyczajny", "обыкновенный уж"], ["niejadowity wąż z żółtymi plamami po bokach głowy, dobry pływak", "неядовитая змея с жёлтыми пятнами по бокам головы, хороший пловец"], 1, ["zaskroniec"], ["уж"]),
  named("zolw-blotny", ["żółw błotny", "европейская болотная черепаха"], ["jedyny dziko żyjący żółw w Polsce, ściśle chroniony", "единственная дикая черепаха Польши, строго охраняемая"], 2, [], ["болотная черепаха"]),
  named("krokodyl", ["krokodyl nilowy", "нильский крокодил"], ["duży drapieżny gad wód Afryki, czyhający na ofiary przy brzegu", "крупное хищное пресмыкающееся вод Африки, подстерегающее добычу у берега"], 1, ["krokodyl"], ["крокодил"]),
  named("kameleon", ["kameleon", "хамелеон"], ["jaszczurka zmieniająca barwę, łapiąca owady długim językiem", "ящерица, меняющая окраску и ловящая насекомых длинным языком"], 1),
  named("zolw-morski", ["żółw morski", "морская черепаха"], ["gad oceanów z kończynami w kształcie płetw, wychodzący na plażę tylko złożyć jaja", "пресмыкающееся океанов с ластами вместо ног, выходящее на пляж только отложить яйца"], 2),
  named("gniewosz", ["gniewosz plamisty", "медянка"], ["rzadki, niejadowity wąż, często zabijany przez pomyłkę ze żmiją", "редкая неядовитая змея, которую часто убивают, путая с гадюкой"], 3, ["gniewosz"]),
];

// ---- V. Kręgowce stałocieplne ----

export const BIRDS: readonly NamedEntry[] = [
  named("piora", ["pióra", "перья"], ["rogowe wytwory skóry ptaków, służące do lotu i ochrony przed utratą ciepła", "роговые образования кожи птиц для полёта и сохранения тепла"], 1, ["pióro"], ["перо"]),
  named("kosci-pneumatyczne", ["kości pneumatyczne", "пневматические кости"], ["lekkie kości wypełnione powietrzem, zmniejszające masę ptaka", "лёгкие кости с полостями, заполненными воздухом, уменьшающие массу птицы"], 2, ["puste kości"], ["полые кости"]),
  named("worki-powietrzne", ["worki powietrzne", "воздушные мешки"], ["narządy połączone z płucami, dzięki którym wymiana gazowa zachodzi przy wdechu i wydechu", "органы, связанные с лёгкими, благодаря которым газообмен идёт и при вдохе, и при выдохе"], 2),
  named("grzebien-mostka", ["grzebień mostka", "киль"], ["wyrostek mostka, do którego przyczepiają się silne mięśnie skrzydeł", "вырост грудины, к которому крепятся сильные мышцы крыльев"], 2, ["grzebień"], ["киль грудины"]),
  named("dziob", ["dziób", "клюв"], ["rogowa pochwa szczęk, kształtem przystosowana do rodzaju pokarmu", "роговой чехол челюстей, по форме приспособленный к виду пищи"], 1),
  named("zoladek-miesniowy", ["żołądek mięśniowy", "мускульный желудок"], ["część żołądka, w której pokarm jest rozcierany, często z pomocą połkniętych kamyków", "отдел желудка, где пища перетирается, часто с помощью проглоченных камешков"], 2),
  named("wole", ["wole", "зоб"], ["rozszerzenie przełyku, w którym ptak gromadzi i rozmiękcza pokarm", "расширение пищевода, в котором птица запасает и размягчает пищу"], 2),
  named("jajo", ["jajo z wapienną skorupką", "яйцо с известковой скорлупой"], ["jajo, które ptak wysiaduje, ogrzewając je ciepłem własnego ciała", "яйцо, которое птица насиживает, согревая теплом своего тела"], 1, ["jajo"], ["яйцо"]),
  named("gniazdowniki", ["gniazdowniki", "птенцовые птицы"], ["ptaki, których pisklęta wykluwają się nagie i ślepe i długo zostają w gnieździe", "птицы, птенцы которых вылупляются голыми и слепыми и долго остаются в гнезде"], 2, ["gniazdownik"], ["птенцовые"]),
  named("zagniazdowniki", ["zagniazdowniki", "выводковые птицы"], ["ptaki, których pisklęta wykluwają się opierzone i zaraz opuszczają gniazdo", "птицы, птенцы которых вылупляются в пуху и сразу покидают гнездо"], 2, ["zagniazdownik"], ["выводковые"]),
  named("stalocieplnosc", ["stałocieplność", "теплокровность"], ["stała, wysoka temperatura ciała ptaków, ok. 40 °C", "постоянная высокая температура тела птиц, около 40 °C"], 1),
  named("gruczol-kuprowy", ["gruczoł kuprowy", "копчиковая железа"], ["gruczoł wydzielający tłuszcz, którym ptak natłuszcza pióra", "железа, выделяющая жир, которым птица смазывает перья"], 2),
];

export const BIRD_SPECIES: readonly NamedEntry[] = [
  named("bocian", ["bocian biały", "белый аист"], ["ptak brodzący, gnieżdżący się na słupach i dachach, odlatujący na zimę do Afryki", "голенастая птица, гнездящаяся на столбах и крышах и улетающая зимовать в Африку"], 1, ["bocian"], ["аист"]),
  named("sikora", ["sikora bogatka", "большая синица"], ["mały ptak śpiewający, zjadający szkodniki drzew i zimujący w Polsce", "маленькая певчая птица, поедающая вредителей деревьев и зимующая в Польше"], 1, ["bogatka", "sikorka"], ["синица"]),
  named("orzel", ["orzeł przedni", "беркут"], ["duży ptak drapieżny z hakowatym dziobem i silnymi szponami", "крупная хищная птица с крючковатым клювом и сильными когтями"], 2, ["orzeł"], ["орёл"]),
  named("puszczyk", ["puszczyk", "серая неясыть"], ["sowa polująca nocą dzięki doskonałemu słuchowi i bezszelestnemu lotowi", "сова, охотящаяся ночью благодаря отличному слуху и бесшумному полёту"], 2, ["sowa", "puszczyk zwyczajny"], ["неясыть", "сова"]),
  named("dzieciol", ["dzięcioł duży", "большой пёстрый дятел"], ["ptak kujący dziobem pnie drzew w poszukiwaniu larw owadów", "птица, долбящая клювом стволы в поисках личинок насекомых"], 1, ["dzięcioł"], ["дятел"]),
  named("kukulka", ["kukułka", "кукушка"], ["ptak podrzucający jaja do gniazd innych ptaków", "птица, подкладывающая яйца в гнёзда других птиц"], 1),
  named("jaskolka", ["jaskółka dymówka", "деревенская ласточка"], ["ptak łowiący owady w locie, budujący gniazda z błota w budynkach", "птица, ловящая насекомых на лету и строящая гнёзда из грязи в постройках"], 1, ["jaskółka", "dymówka"], ["ласточка", "касатка"]),
  named("strus", ["struś afrykański", "африканский страус"], ["największy żyjący ptak, nielot szybko biegający po sawannie", "самая крупная живая птица, нелетающая и быстро бегающая по саванне"], 1, ["struś"], ["страус"]),
  named("pingwin", ["pingwin", "пингвин"], ["nielot z półkuli południowej, którego skrzydła przekształciły się w płetwy", "нелетающая птица Южного полушария, крылья которой превратились в ласты"], 1),
  named("kura", ["kura domowa", "домашняя курица"], ["ptak hodowlany dostarczający jaj i mięsa", "домашняя птица, дающая яйца и мясо"], 1, ["kura"], ["курица"]),
  named("labedz", ["łabędź niemy", "лебедь-шипун"], ["duży ptak wodny o białym upierzeniu, z pomarańczowym dziobem", "крупная водоплавающая птица с белым оперением и оранжевым клювом"], 2, ["łabędź"], ["лебедь"]),
];

export const MAMMALS: readonly NamedEntry[] = [
  named("siersc", ["sierść", "шерсть"], ["okrywa włosowa chroniąca ssaki przed utratą ciepła", "волосяной покров, защищающий млекопитающих от потери тепла"], 1, ["włosy", "futro"], ["волосы", "мех"]),
  named("gruczoly-mlekowe", ["gruczoły mlekowe", "молочные железы"], ["gruczoły wytwarzające mleko, którym samica karmi młode", "железы, вырабатывающие молоко, которым самка кормит детёнышей"], 1),
  named("gruczoly-potowe", ["gruczoły potowe", "потовые железы"], ["gruczoły skóry wydzielające pot, który chłodzi ciało", "железы кожи, выделяющие пот, который охлаждает тело"], 1),
  named("gruczoly-lojowe", ["gruczoły łojowe", "сальные железы"], ["gruczoły natłuszczające włosy i skórę", "железы, смазывающие волосы и кожу"], 2),
  named("lozysko", ["łożysko", "плацента"], ["narząd, przez który płód otrzymuje od matki tlen i pokarm", "орган, через который плод получает от матери кислород и питание"], 2),
  named("przepona", ["przepona", "диафрагма"], ["mięsień oddzielający klatkę piersiową od jamy brzusznej, pomagający w oddychaniu", "мышца, отделяющая грудную полость от брюшной и помогающая дышать"], 2),
  named("zeby", ["zróżnicowane zęby", "дифференцированные зубы"], ["zęby różnego kształtu: siekacze, kły, przedtrzonowce i trzonowce", "зубы разной формы: резцы, клыки, малые и большие коренные"], 2, ["uzębienie zróżnicowane"], ["разные зубы"]),
  named("kly", ["kły", "клыки"], ["spiczaste zęby do chwytania i rozrywania pokarmu, silne u drapieżników", "заострённые зубы для захвата и разрывания пищи, сильные у хищников"], 1, ["kieł"], ["клык"]),
  named("malzowina", ["małżowina uszna", "ушная раковина"], ["zewnętrzna część ucha, kierująca dźwięki do przewodu słuchowego", "наружная часть уха, направляющая звуки в слуховой проход"], 1),
  named("serce", ["serce czterodziałowe", "четырёхкамерное сердце"], ["serce z dwoma przedsionkami i dwiema komorami, w którym krew się nie miesza", "сердце с двумя предсердиями и двумя желудочками, в котором кровь не смешивается"], 2, ["serce czterokomorowe"]),
  named("stalocieplnosc", ["stałocieplność", "теплокровность"], ["stała temperatura ciała ok. 37 °C, utrzymywana dzięki sierści i tłuszczowi", "постоянная температура тела около 37 °C, которую сохраняют шерсть и жир"], 1),
];

export const MAMMAL_SPECIES: readonly NamedEntry[] = [
  named("dziobak", ["dziobak", "утконос"], ["australijski ssak składający jaja, z dziobem jak u kaczki", "австралийское млекопитающее, откладывающее яйца, с клювом как у утки"], 2),
  named("kangur", ["kangur rudy", "рыжий кенгуру"], ["torbacz, którego młode rozwija się w torbie na brzuchu matki", "сумчатое, детёныш которого развивается в сумке на животе матери"], 1, ["kangur"], ["кенгуру"]),
  named("nietoperz", ["nietoperz", "летучая мышь"], ["jedyny latający ssak, orientujący się w ciemności za pomocą echolokacji", "единственное летающее млекопитающее, ориентирующееся в темноте с помощью эхолокации"], 1, ["nietoperze"], ["летучие мыши"]),
  named("kret", ["kret", "крот"], ["owadożerny ssak kopiący korytarze w ziemi łopatowatymi przednimi kończynami", "насекомоядное млекопитающее, роющее ходы лопатообразными передними лапами"], 1),
  named("jez", ["jeż", "ёж"], ["owadożerca z kolcami, zapadający w sen zimowy", "насекомоядное с иголками, впадающее в зимнюю спячку"], 1),
  named("bobr", ["bóbr europejski", "речной бобр"], ["gryzoń budujący tamy i żeremia na rzekach", "грызун, строящий плотины и хатки на реках"], 1, ["bóbr"], ["бобр"]),
  named("wilk", ["wilk szary", "серый волк"], ["drapieżnik polujący w watahach na jelenie i dziki", "хищник, охотящийся стаей на оленей и кабанов"], 1, ["wilk"], ["волк"]),
  named("krowa", ["krowa domowa", "домашняя корова"], ["przeżuwacz hodowany dla mleka i mięsa", "жвачное животное, которое разводят ради молока и мяса"], 1, ["krowa", "bydło"], ["корова"]),
  named("zubr", ["żubr", "зубр"], ["największy ssak lądowy Europy, uratowany przed wyginięciem w Puszczy Białowieskiej", "крупнейшее наземное млекопитающее Европы, спасённое от вымирания в Беловежской пуще"], 2),
  named("foka", ["foka szara", "серый тюлень"], ["ssak morski Bałtyku o kończynach przekształconych w płetwy", "морское млекопитающее Балтики, конечности которого превратились в ласты"], 2, ["foka"], ["тюлень"]),
  named("pletwal", ["płetwal błękitny", "синий кит"], ["największe zwierzę na Ziemi, odcedzające kryl przez fiszbiny", "самое большое животное на Земле, отцеживающее криль через китовый ус"], 2, ["płetwal"], ["голубой кит", "блювал"]),
];
