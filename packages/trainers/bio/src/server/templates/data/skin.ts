// Content tables for §2.1 (integument across the animal kingdom) and §2.3 (skin hygiene and
// diseases). The human skin's own structure is §2.2 and lives in organism.ts (SKIN_PARTS).
import type { Difficulty } from "@portal/core";
import type { NamedEntry } from "../tableTemplate.ts";
import type { Bi } from "./hormones.ts";

// ---- §2.1: Układ powłokowy u zwierząt ----

export const ANIMAL_INTEGUMENT: readonly NamedEntry[] = [
  {
    id: "kutykula",
    name: { pl: "kutykula", ru: "кутикула" },
    role: { pl: "niekomórkowa warstwa wydzielana przez naskórek bezkręgowców, chroniąca przed wysychaniem", ru: "неклеточный слой, выделяемый эпидермисом беспозвоночных и защищающий от высыхания" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "pancerz-chitynowy",
    name: { pl: "pancerz chitynowy", ru: "хитиновый панцирь" },
    role: { pl: "sztywny szkielet zewnętrzny stawonogów: ochrona i miejsce przyczepu mięśni", ru: "жёсткий наружный скелет членистоногих: защита и место прикрепления мышц" },
    aliases: { pl: ["szkielet zewnętrzny", "egzoszkielet"], ru: ["наружный скелет", "экзоскелет"] },
    tier: 1,
  },
  {
    id: "linienie",
    name: { pl: "linienie", ru: "линька" },
    role: { pl: "okresowe zrzucanie pancerza lub skóry, które umożliwia wzrost stawonogów i węży", ru: "периодический сброс панциря или кожи, позволяющий расти членистоногим и змеям" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "luski-kostne",
    name: { pl: "łuski kostne ryb", ru: "костная чешуя рыб" },
    role: { pl: "płytki kostne wytwarzane przez skórę właściwą, chroniące ciało ryby", ru: "костные пластинки, образованные дермой и защищающие тело рыбы" },
    aliases: { pl: ["łuski kostne"], ru: ["костная чешуя"] },
    tier: 2,
  },
  {
    id: "luski-rogowe",
    name: { pl: "łuski rogowe gadów", ru: "роговые чешуи пресмыкающихся" },
    role: { pl: "zrogowaciały wytwór naskórka chroniący gady przed utratą wody", ru: "ороговевшее производное эпидермиса, защищающее пресмыкающихся от потери воды" },
    aliases: { pl: ["łuski rogowe"], ru: ["роговая чешуя", "роговые чешуи"] },
    tier: 2,
  },
  {
    id: "piora",
    name: { pl: "pióra", ru: "перья" },
    role: { pl: "rogowe wytwory naskórka ptaków: izolacja cieplna i powierzchnia nośna do lotu", ru: "роговые производные эпидермиса птиц: теплоизоляция и несущая поверхность для полёта" },
    aliases: { pl: ["pióro"], ru: ["перо"] },
    tier: 1,
  },
  {
    id: "siersc",
    name: { pl: "sierść", ru: "шерсть" },
    role: { pl: "okrywa z włosów — rogowych wytworów naskórka ssaków — chroniąca przed utratą ciepła", ru: "покров из волос — роговых производных эпидермиса млекопитающих, — защищающий от потери тепла" },
    aliases: { pl: ["włosy", "futro"], ru: ["волосы", "мех"] },
    tier: 1,
  },
  {
    id: "gruczol-kuprowy",
    name: { pl: "gruczoł kuprowy", ru: "копчиковая железа" },
    role: { pl: "gruczoł ptaków wydzielający tłustą wydzielinę do natłuszczania piór", ru: "железа птиц, выделяющая жировой секрет для смазывания перьев" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "gruczoly-sluzowe",
    name: { pl: "gruczoły śluzowe", ru: "слизистые железы" },
    role: { pl: "gruczoły skóry ryb i płazów wydzielające śluz, który nawilża skórę i ułatwia ruch w wodzie", ru: "железы кожи рыб и земноводных, выделяющие слизь, которая увлажняет кожу и облегчает движение в воде" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "gruczoly-jadowe",
    name: { pl: "gruczoły jadowe płazów", ru: "ядовитые железы земноводных" },
    role: { pl: "gruczoły skóry płazów wydzielające toksyny odstraszające drapieżniki", ru: "железы кожи земноводных, выделяющие токсины, отпугивающие хищников" },
    aliases: { pl: ["gruczoły jadowe"], ru: ["ядовитые железы"] },
    tier: 2,
  },
  {
    id: "chromatofory",
    name: { pl: "chromatofory", ru: "хроматофоры" },
    role: { pl: "komórki z barwnikiem umożliwiające zmianę ubarwienia, np. u kameleona i głowonogów", ru: "клетки с пигментом, позволяющие менять окраску, например у хамелеона и головоногих" },
    aliases: { pl: ["chromatofor"], ru: ["хроматофор"] },
    tier: 2,
  },
  {
    id: "oddychanie-skorne",
    name: { pl: "oddychanie skórne", ru: "кожное дыхание" },
    role: { pl: "wymiana gazowa przez cienką, wilgotną i ukrwioną skórę, ważna u płazów i dżdżownic", ru: "газообмен через тонкую, влажную и богатую сосудами кожу, важный у земноводных и дождевых червей" },
    aliases: { pl: ["wymiana gazowa przez skórę"], ru: ["дыхание кожей"] },
    tier: 2,
  },
];

/** A group of animals and what its body covering is like. */
export interface GroupEntry {
  id: string;
  group: Bi;
  cover: Bi;
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

export const ANIMAL_GROUPS: readonly GroupEntry[] = [
  {
    id: "pierscienice",
    group: { pl: "pierścienice", ru: "кольчатые черви" },
    cover: { pl: "cienka kutykula i wilgotny nabłonek ze śluzem, przez który zachodzi oddychanie", ru: "тонкая кутикула и влажный эпителий со слизью, через который идёт дыхание" },
    aliases: { pl: ["pierścienica"], ru: ["кольчатый червь", "кольчецы"] },
    tier: 2,
  },
  {
    id: "stawonogi",
    group: { pl: "stawonogi", ru: "членистоногие" },
    cover: { pl: "chitynowy szkielet zewnętrzny, zrzucany podczas linienia", ru: "хитиновый наружный скелет, сбрасываемый при линьке" },
    aliases: { pl: ["stawonóg"], ru: ["членистоногое"] },
    tier: 1,
  },
  {
    id: "ryby",
    group: { pl: "ryby", ru: "рыбы" },
    cover: { pl: "łuski kostne pokryte skórą z licznymi gruczołami śluzowymi", ru: "костная чешуя, покрытая кожей с многочисленными слизистыми железами" },
    aliases: { pl: ["ryba"], ru: ["рыба"] },
    tier: 1,
  },
  {
    id: "plazy",
    group: { pl: "płazy", ru: "земноводные" },
    cover: { pl: "naga, cienka i wilgotna skóra bogata w gruczoły, uczestnicząca w oddychaniu", ru: "голая, тонкая и влажная кожа, богатая железами и участвующая в дыхании" },
    aliases: { pl: ["płaz"], ru: ["земноводное", "амфибии"] },
    tier: 1,
  },
  {
    id: "gady",
    group: { pl: "gady", ru: "пресмыкающиеся" },
    cover: { pl: "sucha skóra pokryta rogowymi łuskami, prawie bez gruczołów", ru: "сухая кожа с роговыми чешуями, почти без желёз" },
    aliases: { pl: ["gad"], ru: ["пресмыкающееся", "рептилии"] },
    tier: 1,
  },
  {
    id: "ptaki",
    group: { pl: "ptaki", ru: "птицы" },
    cover: { pl: "pióra i sucha skóra z jednym gruczołem kuprowym", ru: "перья и сухая кожа с единственной копчиковой железой" },
    aliases: { pl: ["ptak"], ru: ["птица"] },
    tier: 1,
  },
  {
    id: "ssaki",
    group: { pl: "ssaki", ru: "млекопитающие" },
    cover: { pl: "włosy oraz skóra z gruczołami potowymi, łojowymi i mlekowymi", ru: "волосы и кожа с потовыми, сальными и молочными железами" },
    aliases: { pl: ["ssak"], ru: ["млекопитающее"] },
    tier: 1,
  },
];

// ---- §2.3: Higiena i choroby skóry ----

export type DiseaseKind =
  | "bakteryjna"
  | "wirusowa"
  | "grzybicza"
  | "pasozytnicza"
  | "autoimmunologiczna"
  | "alergiczna"
  | "nowotworowa"
  | "genetyczna"
  | "urazowa";

export const DISEASE_KINDS: Record<DiseaseKind, Bi> = {
  bakteryjna: { pl: "choroba bakteryjna", ru: "бактериальная болезнь" },
  wirusowa: { pl: "choroba wirusowa", ru: "вирусная болезнь" },
  grzybicza: { pl: "choroba grzybicza", ru: "грибковая болезнь" },
  pasozytnicza: { pl: "choroba pasożytnicza", ru: "паразитарная болезнь" },
  autoimmunologiczna: { pl: "choroba autoimmunologiczna", ru: "аутоиммунная болезнь" },
  alergiczna: { pl: "choroba alergiczna", ru: "аллергическая болезнь" },
  nowotworowa: { pl: "nowotwór złośliwy", ru: "злокачественная опухоль" },
  genetyczna: { pl: "choroba genetyczna", ru: "генетическое заболевание" },
  urazowa: { pl: "uraz (uszkodzenie skóry)", ru: "травма (повреждение кожи)" },
};

export interface DiseaseEntry {
  id: string;
  name: Bi;
  kind: DiseaseKind;
  cause: Bi;
  sign: Bi;
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

export const SKIN_DISEASES: readonly DiseaseEntry[] = [
  {
    id: "tradzik",
    name: { pl: "trądzik pospolity", ru: "обыкновенные угри" },
    kind: "bakteryjna",
    cause: { pl: "zatkanie ujść gruczołów łojowych i zakażenie bakteriami przy nadmiarze łoju w okresie dojrzewania", ru: "закупорка протоков сальных желёз и заражение бактериями при избытке кожного сала в период полового созревания" },
    sign: { pl: "zaskórniki, grudki i krostki na twarzy, plecach i dekolcie", ru: "комедоны, папулы и гнойнички на лице, спине и груди" },
    aliases: { pl: ["trądzik"], ru: ["акне", "угри", "угревая сыпь"] },
    tier: 1,
  },
  {
    id: "grzybica-stop",
    name: { pl: "grzybica stóp", ru: "микоз стоп" },
    kind: "grzybicza",
    cause: { pl: "zakażenie grzybami rozwijającymi się w wilgotnym i ciepłym środowisku", ru: "заражение грибами, которые развиваются во влажной и тёплой среде" },
    sign: { pl: "swędzenie, zaczerwienienie i łuszczenie się skóry między palcami stóp", ru: "зуд, покраснение и шелушение кожи между пальцами ног" },
    aliases: { pl: ["grzybica", "stopa atlety"], ru: ["грибок стопы", "грибок", "микоз"] },
    tier: 1,
  },
  {
    id: "luszczyca",
    name: { pl: "łuszczyca", ru: "псориаз" },
    kind: "autoimmunologiczna",
    cause: { pl: "reakcja układu odpornościowego przyspieszająca podziały komórek naskórka", ru: "реакция иммунной системы, ускоряющая деление клеток эпидермиса" },
    sign: { pl: "czerwone, wyraźnie odgraniczone plamy pokryte srebrzystymi łuskami", ru: "красные чётко очерченные бляшки, покрытые серебристыми чешуйками" },
    aliases: { pl: [], ru: ["чешуйчатый лишай"] },
    tier: 2,
  },
  {
    id: "azs",
    name: { pl: "atopowe zapalenie skóry", ru: "атопический дерматит" },
    kind: "alergiczna",
    cause: { pl: "wrodzona skłonność do alergii i uszkodzona bariera naskórka", ru: "врождённая склонность к аллергии и нарушенный барьер эпидермиса" },
    sign: { pl: "sucha, silnie swędząca skóra z nawracającymi wypryskami w zgięciach łokci i kolan", ru: "сухая, сильно зудящая кожа с повторяющейся сыпью на сгибах локтей и коленей" },
    aliases: { pl: ["AZS", "egzema atopowa"], ru: ["АтД", "атопическая экзема", "нейродермит"] },
    tier: 2,
  },
  {
    id: "pokrzywka",
    name: { pl: "pokrzywka", ru: "крапивница" },
    kind: "alergiczna",
    cause: { pl: "uwolnienie histaminy w skórze po kontakcie z alergenem", ru: "выброс гистамина в коже после контакта с аллергеном" },
    sign: { pl: "swędzące bąble przypominające oparzenie pokrzywą, szybko znikające", ru: "зудящие волдыри, похожие на ожог крапивой, быстро исчезающие" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "czerniak",
    name: { pl: "czerniak", ru: "меланома" },
    kind: "nowotworowa",
    cause: { pl: "nowotworowe namnażanie melanocytów, któremu sprzyja nadmiar promieniowania UV", ru: "опухолевое размножение меланоцитов, которому способствует избыток ультрафиолета" },
    sign: { pl: "znamię o nieregularnym brzegu i niejednolitej barwie, które szybko się powiększa", ru: "родинка с неровным краем и неоднородной окраской, которая быстро растёт" },
    aliases: { pl: ["czerniak złośliwy"], ru: ["злокачественная меланома"] },
    tier: 2,
  },
  {
    id: "brodawki",
    name: { pl: "brodawki", ru: "бородавки" },
    kind: "wirusowa",
    cause: { pl: "zakażenie wirusem brodawczaka ludzkiego (HPV)", ru: "заражение вирусом папилломы человека (ВПЧ)" },
    sign: { pl: "twarde, szorstkie grudki na dłoniach lub podeszwach stóp", ru: "твёрдые шершавые узелки на кистях или подошвах" },
    aliases: { pl: ["kurzajki", "brodawka"], ru: ["бородавка"] },
    tier: 1,
  },
  {
    id: "opryszczka",
    name: { pl: "opryszczka wargowa", ru: "герпес губ" },
    kind: "wirusowa",
    cause: { pl: "wirus opryszczki pozostający w nerwach i uaktywniający się przy spadku odporności", ru: "вирус герпеса, сохраняющийся в нервах и активирующийся при снижении иммунитета" },
    sign: { pl: "bolesne pęcherzyki z płynem na brzegu warg", ru: "болезненные пузырьки с жидкостью на краю губ" },
    aliases: { pl: ["opryszczka", "herpes"], ru: ["герпес", "простуда на губах"] },
    tier: 1,
  },
  {
    id: "swierzb",
    name: { pl: "świerzb", ru: "чесотка" },
    kind: "pasozytnicza",
    cause: { pl: "świerzbowiec drążący korytarze w naskórku", ru: "чесоточный клещ, прокладывающий ходы в эпидермисе" },
    sign: { pl: "silny świąd nasilający się w nocy, zwłaszcza między palcami dłoni", ru: "сильный зуд, усиливающийся ночью, особенно между пальцами рук" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "wszawica",
    name: { pl: "wszawica", ru: "педикулёз" },
    kind: "pasozytnicza",
    cause: { pl: "wszy żywiące się krwią i składające jaja (gnidy) na włosach", ru: "вши, питающиеся кровью и откладывающие яйца (гниды) на волосах" },
    sign: { pl: "swędzenie skóry głowy i widoczne gnidy przyklejone do włosów", ru: "зуд кожи головы и заметные гниды, приклеенные к волосам" },
    aliases: { pl: [], ru: ["вшивость"] },
    tier: 1,
  },
  {
    id: "bielactwo",
    name: { pl: "bielactwo nabyte", ru: "витилиго" },
    kind: "autoimmunologiczna",
    cause: { pl: "niszczenie melanocytów przez własny układ odpornościowy", ru: "разрушение меланоцитов собственной иммунной системой" },
    sign: { pl: "białe, odbarwione plamy na skórze pojawiające się w ciągu życia", ru: "белые обесцвеченные пятна на коже, появляющиеся в течение жизни" },
    aliases: { pl: ["bielactwo", "vitiligo"], ru: ["лейкодерма"] },
    tier: 2,
  },
  {
    id: "albinizm",
    name: { pl: "albinizm", ru: "альбинизм" },
    kind: "genetyczna",
    cause: { pl: "wrodzony brak melaniny wynikający z mutacji genu", ru: "врождённое отсутствие меланина из-за мутации гена" },
    sign: { pl: "bardzo jasna skóra i włosy od urodzenia oraz nadwrażliwość na słońce", ru: "очень светлые кожа и волосы с рождения и повышенная чувствительность к солнцу" },
    aliases: { pl: ["bielactwo wrodzone"], ru: [] },
    tier: 1,
  },
  {
    id: "oparzenie-1",
    name: { pl: "oparzenie I stopnia", ru: "ожог I степени" },
    kind: "urazowa",
    cause: { pl: "krótkie działanie wysokiej temperatury lub słońca, uszkadzające tylko naskórek", ru: "кратковременное действие высокой температуры или солнца, повреждающее только эпидермис" },
    sign: { pl: "zaczerwienienie i ból skóry bez pęcherzy", ru: "покраснение и боль кожи без пузырей" },
    aliases: { pl: ["oparzenie pierwszego stopnia", "oparzenie 1 stopnia"], ru: ["ожог первой степени", "ожог 1 степени"] },
    tier: 2,
  },
  {
    id: "oparzenie-2",
    name: { pl: "oparzenie II stopnia", ru: "ожог II степени" },
    kind: "urazowa",
    cause: { pl: "działanie wysokiej temperatury uszkadzające naskórek i część skóry właściwej", ru: "действие высокой температуры, повреждающее эпидермис и часть дермы" },
    sign: { pl: "pęcherze wypełnione płynem surowiczym i silny ból", ru: "пузыри с серозной жидкостью и сильная боль" },
    aliases: { pl: ["oparzenie drugiego stopnia", "oparzenie 2 stopnia"], ru: ["ожог второй степени", "ожог 2 степени"] },
    tier: 2,
  },
  {
    id: "odlezyny",
    name: { pl: "odleżyny", ru: "пролежни" },
    kind: "urazowa",
    cause: { pl: "długotrwały ucisk skóry u osób leżących, który odcina dopływ krwi", ru: "длительное сдавливание кожи у лежачих больных, прекращающее приток крови" },
    sign: { pl: "rany i martwica skóry nad wystającymi kośćmi, np. nad kością krzyżową", ru: "раны и омертвение кожи над выступающими костями, например над крестцом" },
    aliases: { pl: ["odleżyna"], ru: ["пролежень"] },
    tier: 2,
  },
];

/** A threat to the skin and the hygiene rule that prevents it. */
export interface RiskEntry {
  id: string;
  risk: Bi;
  rule: Bi;
  tier: Difficulty;
}

export const SKIN_RISKS: readonly RiskEntry[] = [
  {
    id: "uv",
    risk: { pl: "oparzenie słoneczne i przedwczesne starzenie się skóry", ru: "солнечный ожог и преждевременное старение кожи" },
    rule: { pl: "krem z filtrem UV i unikanie słońca w południe", ru: "крем с УФ-фильтром и избегание солнца в полдень" },
    tier: 1,
  },
  {
    id: "znamiona",
    risk: { pl: "późne wykrycie czerniaka", ru: "позднее выявление меланомы" },
    rule: { pl: "regularne oglądanie znamion według reguły ABCDE", ru: "регулярный осмотр родинок по правилу ABCDE" },
    tier: 2,
  },
  {
    id: "grzybica",
    risk: { pl: "grzybica stóp", ru: "микоз стоп" },
    rule: { pl: "dokładne osuszanie stóp i własne klapki na basenie", ru: "тщательно вытирать стопы и носить свои шлёпанцы в бассейне" },
    tier: 1,
  },
  {
    id: "tradzik",
    risk: { pl: "nasilenie trądziku i blizny", ru: "усиление угрей и рубцы" },
    rule: { pl: "mycie twarzy łagodnym środkiem i niewyciskanie zmian", ru: "умывание мягким средством и отказ от выдавливания" },
    tier: 1,
  },
  {
    id: "solarium",
    risk: { pl: "rak skóry po sztucznym opalaniu", ru: "рак кожи после искусственного загара" },
    rule: { pl: "rezygnacja z solarium, zwłaszcza przed 18. rokiem życia", ru: "отказ от солярия, особенно до 18 лет" },
    tier: 1,
  },
  {
    id: "wszawica",
    risk: { pl: "wszawica", ru: "педикулёз" },
    rule: { pl: "własny grzebień, szczotka i nakrycie głowy", ru: "собственные расчёска, щётка и головной убор" },
    tier: 1,
  },
  {
    id: "odlezyny",
    risk: { pl: "odleżyny u osoby leżącej", ru: "пролежни у лежачего больного" },
    rule: { pl: "zmiana ułożenia chorego co 2 godziny", ru: "смена положения больного каждые 2 часа" },
    tier: 2,
  },
];
