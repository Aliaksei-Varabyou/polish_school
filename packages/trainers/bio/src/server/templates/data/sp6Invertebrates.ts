// Class 6, chapters I–III: the animal kingdom and its tissues, worms, arthropods and molluscs.
// One table per paragraph; each row becomes two tasks ("what is it" and "name it", see pairFromTable).
// Descriptions are written for 11–12-year-olds: one idea each, in the textbook's own vocabulary.
import type { Difficulty } from "@portal/core";
import type { NamedEntry } from "../tableTemplate.ts";

type Pair = readonly [pl: string, ru: string];

/** One row: id, name, what it is or does, difficulty, then other accepted names in each language. */
export const named = (id: string, name: Pair, role: Pair, tier: Difficulty, aliasesPl: string[] = [], aliasesRu: string[] = []): NamedEntry => ({
  id,
  name: { pl: name[0], ru: name[1] },
  role: { pl: role[0], ru: role[1] },
  aliases: { pl: aliasesPl, ru: aliasesRu },
  tier,
});

// ---- I. Świat zwierząt ----

export const KINGDOM: readonly NamedEntry[] = [
  named("cudzozywnosc", ["cudzożywność", "гетеротрофность"], ["pobieranie gotowego pokarmu, bo zwierzę nie wytwarza go samo", "получение готовой пищи, потому что животное не производит её само"], 1, ["heterotrofizm"], ["гетеротрофия", "гетеротрофное питание"]),
  named("bezkregowce", ["bezkręgowce", "беспозвоночные"], ["zwierzęta bez kręgosłupa, stanowiące większość gatunków", "животные без позвоночника, составляющие большинство видов"], 1, ["bezkręgowiec"], ["беспозвоночное"]),
  named("kregowce", ["kręgowce", "позвоночные"], ["zwierzęta z kręgosłupem jako osią szkieletu wewnętrznego", "животные с позвоночником — осью внутреннего скелета"], 1, ["kręgowiec"], ["позвоночное"]),
  named("symetria-promienista", ["symetria promienista", "радиальная симметрия"], ["budowa ciała, przez którego środek można poprowadzić wiele płaszczyzn symetrii, jak u stułbi", "строение тела, через центр которого можно провести много плоскостей симметрии, как у гидры"], 2, ["symetria promienna"], ["лучевая симметрия"]),
  named("symetria-dwuboczna", ["symetria dwuboczna", "двусторонняя симметрия"], ["budowa ciała, które tylko jedna płaszczyzna dzieli na dwie lustrzane połowy", "строение тела, которое только одна плоскость делит на две зеркальные половины"], 2, [], ["билатеральная симметрия"]),
  named("zmiennocieplnosc", ["zmiennocieplność", "холоднокровность"], ["zależność temperatury ciała od temperatury otoczenia", "зависимость температуры тела от температуры окружающей среды"], 1, [], ["пойкилотермия"]),
  named("stalocieplnosc", ["stałocieplność", "теплокровность"], ["utrzymywanie stałej temperatury ciała niezależnie od otoczenia", "поддержание постоянной температуры тела независимо от окружающей среды"], 1, [], ["гомойотермия"]),
  named("roslinozercy", ["roślinożercy", "растительноядные"], ["zwierzęta żywiące się roślinami", "животные, питающиеся растениями"], 1, ["roślinożerca"], ["травоядные", "растительноядное"]),
  named("drapiezniki", ["drapieżniki", "хищники"], ["zwierzęta polujące na inne zwierzęta", "животные, охотящиеся на других животных"], 1, ["drapieżnik", "mięsożercy"], ["хищник"]),
  named("wszystkozercy", ["wszystkożercy", "всеядные"], ["zwierzęta jedzące zarówno pokarm roślinny, jak i zwierzęcy", "животные, поедающие и растительную, и животную пищу"], 1, ["wszystkożerca"], ["всеядное"]),
  named("pasozyty", ["pasożyty", "паразиты"], ["organizmy żyjące kosztem żywiciela i szkodzące mu", "организмы, живущие за счёт хозяина и вредящие ему"], 1, ["pasożyt"], ["паразит"]),
];

export const TISSUES6: readonly NamedEntry[] = [
  named("nablonkowa", ["tkanka nabłonkowa", "эпителиальная ткань"], ["ściśle przylegające komórki pokrywające ciało i wyścielające narządy", "плотно прилегающие клетки, покрывающие тело и выстилающие органы"], 1, ["nabłonek"], ["эпителий"]),
  named("nablonek-gruczolowy", ["nabłonek gruczołowy", "железистый эпителий"], ["komórki wytwarzające wydzieliny, np. pot, śluz lub enzymy", "клетки, выделяющие секреты, например пот, слизь или ферменты"], 2),
  named("miesniowa-gladka", ["tkanka mięśniowa gładka", "гладкая мышечная ткань"], ["mięśnie ścian narządów wewnętrznych, kurczące się powoli i niezależnie od woli", "мышцы стенок внутренних органов, сокращающиеся медленно и непроизвольно"], 2, ["mięśnie gładkie"], ["гладкие мышцы"]),
  named("miesniowa-szkieletowa", ["tkanka mięśniowa poprzecznie prążkowana szkieletowa", "поперечнополосатая скелетная мышечная ткань"], ["mięśnie poruszające szkieletem, kurczące się szybko i zależnie od woli", "мышцы, двигающие скелет, сокращающиеся быстро и произвольно"], 2, ["tkanka mięśniowa szkieletowa", "mięśnie szkieletowe"], ["скелетная мышечная ткань", "скелетные мышцы"]),
  named("miesien-sercowy", ["tkanka mięśniowa poprzecznie prążkowana serca", "поперечнополосатая сердечная мышечная ткань"], ["tkanka budująca serce, kurcząca się rytmicznie przez całe życie bez zmęczenia", "ткань сердца, ритмично сокращающаяся всю жизнь без утомления"], 2, ["mięsień sercowy", "tkanka mięśniowa serca"], ["сердечная мышца", "сердечная мышечная ткань"]),
  named("nerwowa", ["tkanka nerwowa", "нервная ткань"], ["tkanka odbierająca bodźce i przewodząca impulsy nerwowe", "ткань, воспринимающая раздражения и проводящая нервные импульсы"], 1),
  named("neuron", ["neuron", "нейрон"], ["komórka nerwowa z ciałem komórki i wypustkami", "нервная клетка с телом и отростками"], 1, ["komórka nerwowa"], ["нервная клетка"]),
  named("dendryty", ["dendryty", "дендриты"], ["krótkie, rozgałęzione wypustki doprowadzające impulsy do ciała neuronu", "короткие ветвящиеся отростки, проводящие импульсы к телу нейрона"], 2, ["dendryt"], ["дендрит"]),
  named("akson", ["akson", "аксон"], ["długa wypustka odprowadzająca impuls z ciała neuronu", "длинный отросток, отводящий импульс от тела нейрона"], 2, ["neuryt"], ["нейрит"]),
];

export const CONNECTIVE: readonly NamedEntry[] = [
  named("kostna", ["tkanka kostna", "костная ткань"], ["twarda tkanka szkieletu z solami wapnia w istocie międzykomórkowej", "твёрдая ткань скелета с солями кальция в межклеточном веществе"], 1, ["kość"], ["кость"]),
  named("chrzestna", ["tkanka chrzęstna", "хрящевая ткань"], ["sprężysta tkanka małżowiny usznej i nosa, pokrywająca też powierzchnie stawowe", "упругая ткань ушной раковины и носа, покрывающая также суставные поверхности"], 1, ["chrząstka"], ["хрящ"]),
  named("tluszczowa", ["tkanka tłuszczowa", "жировая ткань"], ["magazyn energii, izolacja cieplna i ochrona narządów przed urazami", "запас энергии, теплоизоляция и защита органов от ударов"], 1, [], ["жир"]),
  named("wloknista", ["tkanka łączna włóknista", "плотная волокнистая соединительная ткань"], ["tkanka z mocnych włókien budująca ścięgna i więzadła", "ткань из прочных волокон, образующая сухожилия и связки"], 2, ["tkanka łączna właściwa"], ["волокнистая соединительная ткань"]),
  named("krew", ["krew", "кровь"], ["płynna tkanka łączna transportująca tlen, pokarm i zbędne produkty przemiany materii", "жидкая соединительная ткань, переносящая кислород, питательные вещества и продукты обмена"], 1),
  named("osocze", ["osocze", "плазма крови"], ["płynna część krwi, w której rozpuszczone są substancje odżywcze", "жидкая часть крови с растворёнными питательными веществами"], 2, ["osocze krwi"], ["плазма"]),
  named("erytrocyty", ["czerwone krwinki", "эритроциты"], ["komórki krwi przenoszące tlen dzięki hemoglobinie", "клетки крови, переносящие кислород благодаря гемоглобину"], 1, ["erytrocyty", "krwinki czerwone"], ["красные кровяные клетки", "красные кровяные тельца"]),
  named("leukocyty", ["białe krwinki", "лейкоциты"], ["komórki krwi broniące organizm przed drobnoustrojami", "клетки крови, защищающие организм от микробов"], 1, ["leukocyty", "krwinki białe"], ["белые кровяные клетки", "белые кровяные тельца"]),
  named("plytki", ["płytki krwi", "тромбоциты"], ["fragmenty komórek krwi uczestniczące w krzepnięciu krwi", "фрагменты клеток крови, участвующие в свёртывании крови"], 1, ["trombocyty"], ["кровяные пластинки"]),
];

// ---- II. Od parzydełkowców do pierścienic ----

export const CNIDARIANS: readonly NamedEntry[] = [
  named("stulbia", ["stułbia", "гидра"], ["słodkowodny polip długości ok. 1 cm, chwytający drobne zwierzęta czułkami", "пресноводный полип длиной около 1 см, ловящий мелких животных щупальцами"], 1, [], ["пресноводная гидра"]),
  named("meduza", ["meduza", "медуза"], ["swobodnie pływająca postać parzydełkowca o kształcie parasola", "свободно плавающая форма кишечнополостного в виде зонтика"], 1),
  named("polip", ["polip", "полип"], ["osiadła postać parzydełkowca z otworem gębowym skierowanym w górę", "прикреплённая форма кишечнополостного с ротовым отверстием, направленным вверх"], 2, ["polipy"], ["полипы"]),
  named("parzydelka", ["komórki parzydełkowe", "стрекательные клетки"], ["komórki wystrzeliwujące nić z jadem, do obrony i chwytania ofiar", "клетки, выбрасывающие нить с ядом для защиты и ловли добычи"], 1, ["parzydełka", "parzydełko"], ["стрекательная клетка", "стрекательные капсулы"]),
  named("jama", ["jama chłonąco-trawiąca", "кишечная полость"], ["jedyna jama ciała z jednym otworem, w której trawiony jest pokarm", "единственная полость тела с одним отверстием, в которой переваривается пища"], 2, ["jama gastralna"], ["гастральная полость"]),
  named("czulki", ["czułki", "щупальца"], ["ruchliwe wyrostki wokół otworu gębowego, chwytające pokarm", "подвижные выросты вокруг рта, захватывающие пищу"], 1, ["czułek"], ["щупальце"]),
  named("paczkowanie", ["pączkowanie", "почкование"], ["rozmnażanie bezpłciowe przez wyrastanie nowego osobnika z ciała rodzica", "бесполое размножение, при котором новая особь вырастает из тела родителя"], 1),
  named("koralowce", ["koralowce", "коралловые полипы"], ["polipy żyjące w koloniach i budujące wapienne szkielety raf", "полипы, живущие колониями и строящие известковые скелеты рифов"], 1, ["korale", "koralowiec"], ["кораллы", "коралл"]),
  named("ukwial", ["ukwiał", "актиния"], ["duży, samotny polip morski, który może żyć razem z krabem pustelnikiem", "крупный одиночный морской полип, способный жить вместе с раком-отшельником"], 2, [], ["морской анемон"]),
  named("chelbia", ["chełbia modra", "аурелия ушастая"], ["meduza występująca w Bałtyku", "медуза, встречающаяся в Балтийском море"], 2, ["chełbia"], ["аурелия", "ушастая медуза"]),
];

export const FLATWORMS: readonly NamedEntry[] = [
  named("wyplawek", ["wypławek", "планария"], ["wolno żyjący płaziniec ze strumieni, z oczkami na przedniej części ciała", "свободноживущий плоский червь из ручьёв с глазками на переднем конце тела"], 1, ["wypławek biały"], ["молочная планария"]),
  named("tasiemiec-uzbrojony", ["tasiemiec uzbrojony", "свиной цепень"], ["pasożyt jelita człowieka, którym zarażamy się, jedząc niedogotowaną wieprzowinę", "паразит кишечника человека, которым заражаются, съев недоваренную свинину"], 1, ["tasiemiec"], ["цепень вооружённый", "цепень"]),
  named("tasiemiec-nieuzbrojony", ["tasiemiec nieuzbrojony", "бычий цепень"], ["pasożyt jelita człowieka, którym zarażamy się, jedząc surową lub niedogotowaną wołowinę", "паразит кишечника человека, которым заражаются, съев сырую или недоваренную говядину"], 2, [], ["цепень невооружённый"]),
  named("motylica", ["motylica wątrobowa", "печёночный сосальщик"], ["pasożyt wątroby bydła i owiec, którego żywicielem pośrednim jest ślimak", "паразит печени коров и овец, промежуточный хозяин которого — улитка"], 2, ["motylica"], ["сосальщик"]),
  named("przyssawki", ["przyssawki", "присоски"], ["narządy czepne, którymi pasożyt przytwierdza się do ciała żywiciela", "органы прикрепления, которыми паразит держится в теле хозяина"], 1, ["przyssawka"], ["присоска"]),
  named("haczyki", ["haczyki", "крючья"], ["dodatkowe narządy czepne na główce tasiemca uzbrojonego", "дополнительные органы прикрепления на головке свиного цепня"], 2, ["haczyk"], ["крючки", "крючок"]),
  named("zywiciel-ostateczny", ["żywiciel ostateczny", "окончательный хозяин"], ["organizm, w którym pasożyt dorasta i rozmnaża się płciowo", "организм, в котором паразит становится взрослым и размножается половым путём"], 2, ["żywiciel główny"], ["основной хозяин", "дефинитивный хозяин"]),
  named("zywiciel-posredni", ["żywiciel pośredni", "промежуточный хозяин"], ["organizm, w którym żyje larwa pasożyta", "организм, в котором живёт личинка паразита"], 2),
  named("wagier", ["wągier", "финна"], ["larwa tasiemca otorbiona w mięśniach żywiciela pośredniego", "личинка цепня, заключённая в капсулу в мышцах промежуточного хозяина"], 2, ["wągry"], ["финны", "цистицерк"]),
  named("obojnactwo", ["obojnactwo", "гермафродитизм"], ["posiadanie przez jednego osobnika narządów rozrodczych męskich i żeńskich", "наличие у одной особи и мужских, и женских половых органов"], 2, ["obojnak", "obojnaki"], ["гермафродит"]),
];

export const ROUNDWORMS: readonly NamedEntry[] = [
  named("glista", ["glista ludzka", "человеческая аскарида"], ["pasożyt jelita cienkiego, którego jajami zarażamy się przez brudne ręce i nieumyte warzywa", "паразит тонкой кишки, яйцами которого заражаются через грязные руки и немытые овощи"], 1, ["glista"], ["аскарида"]),
  named("owsik", ["owsik ludzki", "острица"], ["mały pasożyt jelita grubego, powodujący swędzenie okolic odbytu, częsty u dzieci", "мелкий паразит толстой кишки, вызывающий зуд около заднего прохода, частый у детей"], 1, ["owsik", "owsiki"], ["острицы"]),
  named("wlosien", ["włosień kręty", "трихинелла"], ["pasożyt, którego larwy żyją w mięśniach; zarażamy się, jedząc niebadane mięso dzików lub świń", "паразит, личинки которого живут в мышцах; заражаются, съев непроверенное мясо кабана или свиньи"], 2, ["włosień"], ["трихина"]),
  named("wlosnica", ["włośnica", "трихинеллёз"], ["choroba wywołana przez larwy włośnia, której zapobiega badanie mięsa przez weterynarza", "болезнь от личинок трихинеллы, которую предотвращает ветеринарная проверка мяса"], 2, [], ["трихиноз"]),
  named("cialo-nitkowate", ["ciało nitkowate", "нитевидное тело"], ["wydłużone, obłe ciało niepodzielone na segmenty, typowe dla nicieni", "вытянутое круглое тело без сегментов, типичное для круглых червей"], 1, [], ["круглое тело"]),
  named("oskorek", ["oskórek", "кутикула"], ["mocna, nieprzepuszczalna osłona ciała nicienia, chroniąca pasożyta przed sokami trawiennymi", "прочная непроницаемая оболочка тела круглого червя, защищающая паразита от пищеварительных соков"], 2, ["kutykula"]),
  named("rozdzielnoplciowosc", ["rozdzielnopłciowość", "раздельнополость"], ["występowanie osobnych samców i samic, różniących się wyglądem", "наличие отдельных самцов и самок, отличающихся внешне"], 2, ["rozdzielnopłciowe"], ["раздельнополые"]),
  named("mycie-rak", ["mycie rąk", "мытьё рук"], ["najprostszy sposób zapobiegania zarażeniu glistą i owsikiem", "простейший способ избежать заражения аскаридой и острицей"], 1, ["mycie rąk przed jedzeniem"], ["мыть руки"]),
  named("nicienie-glebowe", ["nicienie glebowe", "почвенные нематоды"], ["wolno żyjące nicienie rozkładające szczątki organiczne w glebie", "свободноживущие круглые черви, разлагающие органические остатки в почве"], 2, ["nicienie wolno żyjące"], ["свободноживущие нематоды"]),
];

export const ANNELIDS: readonly NamedEntry[] = [
  named("dzdzownica", ["dżdżownica", "дождевой червь"], ["pierścienica żyjąca w glebie, która ją spulchnia i napowietrza", "кольчатый червь, живущий в почве, рыхлящий и насыщающий её воздухом"], 1, ["dżdżownica ziemna"], ["земляной червь"]),
  named("pijawka", ["pijawka lekarska", "медицинская пиявка"], ["pierścienica wysysająca krew, stosowana w leczeniu zakrzepów", "кольчатый червь, сосущий кровь, применяемый для лечения тромбов"], 1, ["pijawka"], ["пиявка"]),
  named("nereida", ["nereida", "нереида"], ["morska pierścienica z licznymi szczecinkami na wyrostkach bocznych", "морской кольчатый червь с многочисленными щетинками на боковых выростах"], 2, ["nereidy"], ["нереис"]),
  named("segmenty", ["segmenty", "сегменты"], ["powtarzające się pierścienie, z których zbudowane jest ciało", "повторяющиеся кольца, из которых состоит тело"], 1, ["segment", "pierścienie"], ["сегмент", "членики", "кольца"]),
  named("szczecinki", ["szczecinki", "щетинки"], ["sztywne włoski ułatwiające dżdżownicy poruszanie się w glebie", "жёсткие волоски, помогающие дождевому червю передвигаться в почве"], 1, ["szczecinka"], ["щетинка"]),
  named("siodelko", ["siodełko", "поясок"], ["zgrubienie ciała dżdżownicy wytwarzające kokon z jajami", "утолщение тела дождевого червя, образующее кокон с яйцами"], 2),
  named("wor", ["wór powłokowo-mięśniowy", "кожно-мускульный мешок"], ["połączenie naskórka z mięśniami, umożliwiające ruch pełzający", "сочетание покровов и мышц, позволяющее ползать"], 2, ["worek powłokowo-mięśniowy"]),
  named("prochnica", ["próchnica", "гумус"], ["żyzna warstwa gleby z resztek roślin przerobionych przez dżdżownice", "плодородный слой почвы из растительных остатков, переработанных дождевыми червями"], 2, [], ["перегной"]),
  named("uklad-zamkniety", ["zamknięty układ krwionośny", "замкнутая кровеносная система"], ["układ, w którym krew płynie tylko w naczyniach, jak u dżdżownicy", "система, в которой кровь течёт только по сосудам, как у дождевого червя"], 2),
  named("oddychanie-skorne", ["oddychanie przez skórę", "дыхание через кожу"], ["wymiana gazów przez wilgotną powierzchnię ciała dżdżownicy", "газообмен через влажную поверхность тела дождевого червя"], 1, ["oddychanie skórne"], ["кожное дыхание"]),
];

// ---- III. Stawonogi i mięczaki ----

export const ARTHROPOD_FEATURES: readonly NamedEntry[] = [
  named("szkielet-zewnetrzny", ["szkielet zewnętrzny", "наружный скелет"], ["twardy pancerz okrywający ciało stawonoga i chroniący je", "твёрдый панцирь, покрывающий и защищающий тело членистоногого"], 1, ["pancerz", "egzoszkielet"], ["панцирь", "экзоскелет"]),
  named("chityna", ["chityna", "хитин"], ["wytrzymały związek budujący pancerz stawonogów", "прочное вещество, из которого состоит панцирь членистоногих"], 2),
  named("linienie", ["linienie", "линька"], ["zrzucanie starego pancerza, które pozwala stawonogowi rosnąć", "сбрасывание старого панциря, позволяющее членистоногому расти"], 1),
  named("odnoza", ["odnóża członowane", "членистые конечности"], ["ruchomo połączone odcinki kończyn, od których stawonogi wzięły nazwę", "подвижно соединённые членики конечностей, давшие название членистоногим"], 1, ["odnóża"], ["конечности", "членистые ноги"]),
  named("glowa-tulow-odwlok", ["głowa, tułów i odwłok", "голова, грудь и брюшко"], ["trzy części ciała owada", "три отдела тела насекомого"], 1, ["głowa tułów odwłok"], ["голова грудь брюшко"]),
  named("glowotulow", ["głowotułów", "головогрудь"], ["zrośnięte głowa i tułów u skorupiaków i pajęczaków", "слитые голова и грудь у ракообразных и паукообразных"], 1),
  named("czulki", ["czułki", "усики"], ["narządy dotyku i węchu na głowie owadów i skorupiaków", "органы осязания и обоняния на голове насекомых и ракообразных"], 1, ["czułek"], ["антенны", "усик"]),
  named("oczy-zlozone", ["oczy złożone", "фасеточные глаза"], ["oczy zbudowane z wielu drobnych oczek, dające obraz mozaikowy", "глаза из множества мелких глазков, дающие мозаичное изображение"], 2, ["oko złożone"], ["сложные глаза", "фасеточный глаз"]),
  named("tchawki", ["tchawki", "трахеи"], ["rozgałęzione rurki doprowadzające powietrze do wszystkich części ciała owada", "ветвящиеся трубочки, подводящие воздух ко всем частям тела насекомого"], 2, ["tchawka"], ["трахея"]),
  named("skrzela", ["skrzela", "жабры"], ["narządy oddechowe skorupiaków żyjących w wodzie", "органы дыхания ракообразных, живущих в воде"], 1),
  named("uklad-otwarty", ["otwarty układ krwionośny", "незамкнутая кровеносная система"], ["układ, w którym hemolimfa wylewa się z naczyń i obmywa narządy", "система, в которой гемолимфа изливается из сосудов и омывает органы"], 2, [], ["открытая кровеносная система"]),
];

export const CRUSTACEANS: readonly NamedEntry[] = [
  named("rak", ["rak rzeczny", "речной рак"], ["słodkowodny skorupiak z dużymi szczypcami, żyjący tylko w czystych wodach", "пресноводное ракообразное с крупными клешнями, живущее только в чистой воде"], 1, ["rak", "rak szlachetny"], ["рак"]),
  named("krab", ["krab", "краб"], ["morski skorupiak z krótkim odwłokiem podwiniętym pod głowotułów, chodzący bokiem", "морское ракообразное с коротким брюшком, подогнутым под головогрудь, ходящее боком"], 1),
  named("krewetka", ["krewetka", "креветка"], ["morski skorupiak poławiany i hodowany jako pokarm dla ludzi", "морское ракообразное, которое ловят и разводят в пищу людям"], 1, ["krewetki"], ["креветки"]),
  named("prosionek", ["prosionek szorstki", "мокрица"], ["lądowy skorupiak żyjący w wilgotnych miejscach, np. pod kamieniami", "наземное ракообразное, живущее в сырых местах, например под камнями"], 2, ["prosionek", "stonoga murowa"], ["мокрицы"]),
  named("rozwielitka", ["rozwielitka", "дафния"], ["drobny skorupiak słodkowodny, którym żywią się ryby", "мелкое пресноводное ракообразное, которым питаются рыбы"], 2, ["dafnia"], ["водяная блоха"]),
  named("kryl", ["kryl", "криль"], ["drobne morskie skorupiaki, główny pokarm wielorybów fiszbinowych", "мелкие морские ракообразные, основная пища усатых китов"], 2),
  named("szczypce", ["szczypce", "клешни"], ["pierwsza para odnóży krocznych raka, do chwytania pokarmu i obrony", "первая пара ходильных ног рака для захвата пищи и защиты"], 1, ["szczypce raka"], ["клешня"]),
  named("pancerz-wapienny", ["pancerz z węglanem wapnia", "панцирь, пропитанный известью"], ["twarda okrywa skorupiaków, wzmocniona solami wapnia", "твёрдый покров ракообразных, укреплённый солями кальция"], 2, ["pancerz wapienny"], ["известковый панцирь"]),
  named("dwie-pary-czulkow", ["dwie pary czułków", "две пары усиков"], ["cecha skorupiaków odróżniająca je od owadów, które mają jedną parę", "признак ракообразных, отличающий их от насекомых с одной парой"], 2, [], ["две пары антенн"]),
  named("odnoza-odwlokowe", ["odnóża odwłokowe", "брюшные ножки"], ["odnóża na odwłoku raka, na których samica nosi jaja", "ножки на брюшке рака, на которых самка вынашивает икру"], 2),
];

export const INSECTS: readonly NamedEntry[] = [
  named("trzy-pary-odnozy", ["trzy pary odnóży", "три пары ног"], ["liczba odnóży, po której rozpoznaje się owada", "число ног, по которому узнают насекомое"], 1, ["6 odnóży", "sześć odnóży"], ["6 ног", "шесть ног"]),
  named("skrzydla", ["skrzydła", "крылья"], ["wyrostki pancerza na tułowiu, umożliwiające owadom lot", "выросты покровов на груди, позволяющие насекомым летать"], 1),
  named("gryzacy", ["aparat gębowy gryzący", "грызущий ротовой аппарат"], ["narząd do rozdrabniania twardego pokarmu, np. u chrabąszcza i szarańczy", "ротовой аппарат для измельчения твёрдой пищи, например у майского жука и саранчи"], 2),
  named("klujaco-ssacy", ["aparat gębowy kłująco-ssący", "колюще-сосущий ротовой аппарат"], ["narząd do przebijania skóry lub roślin i wysysania płynów, np. u komara", "ротовой аппарат для прокалывания кожи или растений и высасывания жидкостей, например у комара"], 2),
  named("ssacy", ["aparat gębowy ssący", "сосущий ротовой аппарат"], ["zwinięta trąbka do picia nektaru, u motyli", "свёрнутый хоботок для питья нектара, у бабочек"], 2, [], ["хоботок"]),
  named("lizacy", ["aparat gębowy liżący", "лижущий ротовой аппарат"], ["narząd do zlizywania płynnego pokarmu, u muchy domowej", "аппарат для слизывания жидкой пищи, у комнатной мухи"], 3, [], ["лижуще-сосущий ротовой аппарат"]),
  named("przeobrazenie-zupelne", ["przeobrażenie zupełne", "полное превращение"], ["rozwój: jajo – larwa – poczwarka – postać dorosła", "развитие: яйцо — личинка — куколка — взрослая особь"], 2, [], ["развитие с полным превращением"]),
  named("przeobrazenie-niezupelne", ["przeobrażenie niezupełne", "неполное превращение"], ["rozwój bez stadium poczwarki: jajo – larwa – postać dorosła", "развитие без стадии куколки: яйцо — личинка — взрослая особь"], 2, [], ["развитие с неполным превращением"]),
  named("poczwarka", ["poczwarka", "куколка"], ["nieruchome stadium, w którym larwa przekształca się w postać dorosłą", "неподвижная стадия, в которой личинка превращается во взрослую особь"], 1),
  named("gasienica", ["gąsienica", "гусеница"], ["larwa motyla, żywiąca się liśćmi", "личинка бабочки, питающаяся листьями"], 1),
  named("pszczola", ["pszczoła miodna", "медоносная пчела"], ["owad zapylający rośliny i wytwarzający miód oraz wosk", "насекомое, опыляющее растения и дающее мёд и воск"], 1, ["pszczoła"], ["пчела"]),
  named("komar", ["komar", "комар"], ["owad, którego samice piją krew i mogą przenosić choroby, np. malarię", "насекомое, самки которого пьют кровь и могут переносить болезни, например малярию"], 1, [], ["малярийный комар"]),
];

export const ARACHNIDS: readonly NamedEntry[] = [
  named("krzyzak", ["pająk krzyżak", "паук-крестовик"], ["pająk budujący koliste sieci łowne w ogrodach i lasach", "паук, строящий круглые ловчие сети в садах и лесах"], 1, ["krzyżak"], ["крестовик"]),
  named("kleszcz", ["kleszcz pospolity", "лесной клещ"], ["pajęczak wysysający krew, przenoszący boreliozę i kleszczowe zapalenie mózgu", "паукообразное, сосущее кровь и переносящее боррелиоз и клещевой энцефалит"], 1, ["kleszcz"], ["клещ", "иксодовый клещ"]),
  named("skorpion", ["skorpion", "скорпион"], ["pajęczak z ciepłych krajów, z jadowym kolcem na końcu odwłoka", "паукообразное жарких стран с ядовитым жалом на конце брюшка"], 1),
  named("roztocza", ["roztocza kurzu domowego", "домашние пылевые клещи"], ["mikroskopijne pajęczaki z kurzu, wywołujące alergie", "микроскопические паукообразные из пыли, вызывающие аллергию"], 2, ["roztocza", "roztocze"], ["пылевые клещи", "клещи домашней пыли"]),
  named("cztery-pary-odnozy", ["cztery pary odnóży krocznych", "четыре пары ходильных ног"], ["liczba odnóży służących do chodzenia u pajęczaków", "число ходильных ног у паукообразных"], 1, ["8 odnóży", "osiem odnóży", "cztery pary odnóży"], ["8 ног", "восемь ног", "четыре пары ног"]),
  named("kadziolki", ["kądziołki przędne", "паутинные бородавки"], ["narządy na odwłoku pająka, z których wydobywa się nić", "органы на брюшке паука, из которых выходит паутинная нить"], 2, ["kądziołki"]),
  named("szczekoczulki", ["szczękoczułki", "хелицеры"], ["pierwsza para odnóży gębowych pająka z jadem do paraliżowania ofiary", "первая пара ротовых конечностей паука с ядом, парализующим добычу"], 2),
  named("trawienie-pozajelitowe", ["trawienie pozajelitowe", "внекишечное пищеварение"], ["rozpuszczanie ciała ofiary sokami trawiennymi przed wyssaniem, jak u pająka", "растворение тела добычи пищеварительными соками перед высасыванием, как у паука"], 2, ["trawienie zewnętrzne"], ["наружное пищеварение"]),
  named("brak-czulkow", ["brak czułków", "отсутствие усиков"], ["cecha pajęczaków odróżniająca je od owadów i skorupiaków", "признак паукообразных, отличающий их от насекомых и ракообразных"], 2, [], ["нет усиков"]),
  named("borelioza", ["borelioza", "боррелиоз"], ["choroba bakteryjna przenoszona przez kleszcze; chroni przed nią szybkie usunięcie kleszcza", "бактериальная болезнь, переносимая клещами; от неё защищает быстрое удаление клеща"], 2, [], ["болезнь Лайма", "клещевой боррелиоз"]),
];

export const MOLLUSCS: readonly NamedEntry[] = [
  named("winniczek", ["ślimak winniczek", "виноградная улитка"], ["lądowy ślimak z muszlą skręconą spiralnie", "наземная улитка со спирально закрученной раковиной"], 1, ["winniczek"], ["улитка"]),
  named("szczezuja", ["szczeżuja", "беззубка"], ["słodkowodny małż filtrujący wodę", "пресноводный двустворчатый моллюск, фильтрующий воду"], 2, ["szczeżuja wielka"]),
  named("malze", ["małże", "двустворчатые моллюски"], ["mięczaki z muszlą z dwóch połówek, bez wyraźnej głowy", "моллюски с раковиной из двух створок, без выраженной головы"], 1, ["małż"], ["двустворчатые"]),
  named("glowonogi", ["głowonogi", "головоногие"], ["morskie mięczaki z ramionami z przyssawkami, np. kałamarnica", "морские моллюски со щупальцами с присосками, например кальмар"], 1, ["głowonóg"], ["головоногие моллюски"]),
  named("osmiornica", ["ośmiornica", "осьминог"], ["głowonóg z ośmioma ramionami, bez muszli, który może zmieniać barwę", "головоногий моллюск с восемью щупальцами, без раковины, способный менять окраску"], 1),
  named("muszla", ["muszla", "раковина"], ["wapienna osłona ciała mięczaka wytwarzana przez płaszcz", "известковая оболочка тела моллюска, которую образует мантия"], 1),
  named("plaszcz", ["płaszcz", "мантия"], ["fałd skóry okrywający narządy mięczaka i wytwarzający muszlę", "кожная складка, покрывающая органы моллюска и образующая раковину"], 2),
  named("noga", ["noga", "нога"], ["umięśniona część ciała mięczaka służąca do pełzania lub zakopywania się", "мускулистая часть тела моллюска для ползания или закапывания"], 1),
  named("tarka", ["tarka", "тёрка"], ["język z rzędami ząbków, którym ślimak zeskrobuje pokarm", "язык с рядами зубчиков, которым улитка соскабливает пищу"], 2, ["raduła"], ["радула"]),
  named("perla", ["perła", "жемчужина"], ["kulka z masy perłowej powstająca wokół ciała obcego w muszli małża", "шарик из перламутра, образующийся вокруг инородного тела в раковине моллюска"], 2, ["perły"], ["жемчуг"]),
  named("czulki-z-oczami", ["czułki z oczami", "щупальца с глазами"], ["wyrostki na głowie ślimaka, na końcach których są oczy", "выросты на голове улитки с глазами на концах"], 2, [], ["рожки"]),
];
