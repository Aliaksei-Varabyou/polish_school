// Lesson for §3 "Reformacja w Europie" (Historia 6, GWO). Terms, people and dates follow the task
// bank of the same paragraph (templates/data/ch1.ts, REFORMATION and REFORMATION_DATES).
import {
  CompareTabs,
  LessonIntro,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type CompareCard,
  type LessonProps,
  type SortItem,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { ConfessionsMap } from "./ConfessionsMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "31 października 1517 roku niemiecki zakonnik Marcin Luter ogłosił w Wittenberdze 95 tez przeciw handlowi odpustami. Tak zaczęła się reformacja — ruch, który podzielił chrześcijan Europy Zachodniej na katolików i protestantów. W ciągu kilkudziesięciu lat powstały nowe wyznania: luteranizm, kalwinizm i anglikanizm.",
    "31 октября 1517 года немецкий монах Мартин Лютер обнародовал в Виттенберге 95 тезисов против торговли индульгенциями. Так началась Реформация — движение, разделившее христиан Западной Европы на католиков и протестантов. За несколько десятилетий возникли новые исповедания: лютеранство, кальвинизм и англиканство.",
  ),
  s1: r("Co krytykował Luter?", "Что критиковал Лютер?"),
  s1intro: r(
    "Każde zdanie to nauka ówczesnego Kościoła katolickiego albo nauka Lutra. Rozdziel je.",
    "Каждое утверждение — учение тогдашней католической церкви или учение Лютера. Раздели их.",
  ),
  s2: r("Trzy wyznania protestanckie", "Три протестантских исповедания"),
  s2intro: r("Porównaj luteranizm, kalwinizm i anglikanizm: kto je stworzył, gdzie się przyjęły i czym się różnią.", "Сравни лютеранство, кальвинизм и англиканство: кто их создал, где они прижились и чем отличаются."),
  s3: r("Mapa wyznań około 1560 roku", "Карта исповеданий около 1560 года"),
  s3intro: r(
    "Dotknij kraju, żeby sprawdzić, które wyznanie w nim przeważyło. Potem w trybie „Podpisz sam” odszukaj kraje na mapie.",
    "Нажми на страну, чтобы узнать, какое исповедание в ней возобладало. Потом в режиме «Подпиши сам» найди страны на карте.",
  ),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Prawda czy fałsz?", "Правда или ложь?"),
  s5intro: r("Sprawdź, co naprawdę wiesz o reformacji.", "Проверь, что ты на самом деле знаешь о Реформации."),
  sort: r("Kościół czy Luter?", "Церковь или Лютер?"),
  sortHint: r("Czego nauczał Kościół katolicki na początku XVI wieku, a co głosił Luter?", "Чему учила католическая церковь в начале XVI века, а что провозглашал Лютер?"),
  church: r("nauka Kościoła", "учение церкви"),
  luther: r("nauka Lutra", "учение Лютера"),
  timeline: r("Reformacja rok po roku", "Реформация год за годом"),
  tf: r("Fakty o reformacji", "Факты о Реформации"),
  rowFounder: r("Twórca", "Основатель"),
  rowWhere: r("Gdzie się przyjęło", "Где прижилось"),
  rowIdea: r("Główna myśl", "Главная мысль"),
  rowHead: r("Kto stoi na czele", "Кто во главе"),
  rowYear: r("Początek", "Начало"),
} satisfies Record<string, Txt>;

const TEACHINGS: SortItem[] = [
  { name: r("Kupując odpust, można skrócić karę za grzechy.", "Купив индульгенцию, можно сократить наказание за грехи."), group: 0, why: r("handel odpustami oburzył Lutra najbardziej", "торговля индульгенциями возмутила Лютера больше всего") },
  { name: r("Człowieka zbawia sama wiara, nie uczynki ani pieniądze.", "Человека спасает сама вера, а не дела или деньги."), group: 1, why: r("to podstawa nauki Lutra", "это основа учения Лютера") },
  { name: r("Jedynym źródłem wiary jest Biblia.", "Единственный источник веры — Библия."), group: 1, why: r("Luter odrzucił tradycję i orzeczenia papieży", "Лютер отверг предание и решения пап") },
  { name: r("Głową całego Kościoła jest papież.", "Глава всей церкви — папа."), group: 0, why: r("Luter nie uznał władzy papieża i spalił jego bullę", "Лютер не признал власть папы и сжёг его буллу") },
  { name: r("Nabożeństwa i Biblia w języku narodowym.", "Богослужения и Библия на национальном языке."), group: 1, why: r("Luter przetłumaczył Biblię na niemiecki", "Лютер перевёл Библию на немецкий") },
  { name: r("Msza odprawiana po łacinie.", "Месса совершается на латыни."), group: 0, why: r("łacina była językiem Kościoła od wieków", "латынь веками была языком церкви") },
  { name: r("Jest siedem sakramentów.", "Таинств семь."), group: 0, why: r("tak nauczał i naucza Kościół katolicki", "так учила и учит католическая церковь") },
  { name: r("Są tylko dwa sakramenty: chrzest i komunia.", "Таинств только два: крещение и причастие."), group: 1, why: r("Luter uznał tylko te, o których mówi Biblia", "Лютер признал лишь те, о которых говорит Библия") },
  { name: r("Księża nie zakładają rodzin.", "Священники не заводят семей."), group: 0, why: r("celibat obowiązuje duchownych katolickich", "целибат обязателен для католического духовенства") },
  { name: r("Duchowni mogą się żenić.", "Духовные лица могут жениться."), group: 1, why: r("sam Luter ożenił się z byłą zakonnicą", "сам Лютер женился на бывшей монахине") },
];

const BRANCHES: CompareCard[] = [
  {
    id: "luth",
    icon: "📖",
    name: r("Luteranizm", "Лютеранство"),
    rows: [
      { label: T.rowFounder, value: r("Marcin Luter, zakonnik z Wittenbergi", "Мартин Лютер, монах из Виттенберга") },
      { label: T.rowWhere, value: r("północne Niemcy, Prusy, Dania, Szwecja", "северная Германия, Пруссия, Дания, Швеция") },
      { label: T.rowIdea, value: r("zbawia sama wiara; jedynym źródłem wiary jest Biblia; dwa sakramenty", "спасает сама вера; единственный источник веры — Библия; два таинства") },
      { label: T.rowHead, value: r("nie ma papieża; Kościołami opiekują się książęta i królowie", "папы нет; церквями опекаются князья и короли") },
      { label: T.rowYear, value: r("1517 — 95 tez", "1517 — 95 тезисов") },
    ],
    text: r("Pokój augsburski z 1555 roku pozwolił każdemu księciu Rzeszy wybrać wyznanie dla swoich poddanych: „czyj kraj, tego religia”.", "Аугсбургский мир 1555 года позволил каждому князю империи выбрать веру для своих подданных: «чья власть, того и вера»."),
  },
  {
    id: "calv",
    icon: "⚖️",
    name: r("Kalwinizm", "Кальвинизм"),
    rows: [
      { label: T.rowFounder, value: r("Jan Kalwin, Francuz działający w Genewie", "Жан Кальвин, француз, действовавший в Женеве") },
      { label: T.rowWhere, value: r("Szwajcaria, Niderlandy, Szkocja; we Francji hugenoci", "Швейцария, Нидерланды, Шотландия; во Франции гугеноты") },
      { label: T.rowIdea, value: r("predestynacja — Bóg z góry przeznaczył każdego do zbawienia albo potępienia; surowe, pracowite życie", "предопределение — Бог заранее предназначил каждого к спасению или гибели; строгая, трудолюбивая жизнь") },
      { label: T.rowHead, value: r("nie ma papieża ani biskupów; gminy wiernych wybierają starszych", "нет ни папы, ни епископов; общины верующих выбирают старейшин") },
      { label: T.rowYear, value: r("1536 — Kalwin w Genewie", "1536 — Кальвин в Женеве") },
    ],
    text: r("Kalwini uważali, że sukces w pracy jest znakiem Bożej łaski — dlatego cenili oszczędność i pracowitość.", "Кальвинисты считали, что успех в труде — знак Божьей милости, поэтому ценили бережливость и трудолюбие."),
  },
  {
    id: "angl",
    icon: "👑",
    name: r("Anglikanizm", "Англиканство"),
    rows: [
      { label: T.rowFounder, value: r("Henryk VIII, król Anglii", "Генрих VIII, король Англии") },
      { label: T.rowWhere, value: r("Anglia", "Англия") },
      { label: T.rowIdea, value: r("król, nie papież, kieruje Kościołem; obrzędy i nauka blisko katolickich", "церковью руководит король, а не папа; обряды и учение близки к католическим") },
      { label: T.rowHead, value: r("król Anglii — głowa Kościoła anglikańskiego", "король Англии — глава англиканской церкви") },
      { label: T.rowYear, value: r("1534 — akt supremacji", "1534 — Акт о супрематии") },
    ],
    text: r("Powód był polityczny: papież nie zgodził się na rozwód króla, więc Henryk VIII zerwał z Rzymem i przejął majątki klasztorów.", "Причина была политической: папа не дал согласия на развод короля, и Генрих VIII порвал с Римом и забрал имущество монастырей."),
  },
];

const EVENTS: TimelineEvent[] = [
  { name: r("Luter ogłasza 95 tez", "Лютер обнародует 95 тезисов"), when: "1517", note: r("31 października, Wittenberga — początek reformacji", "31 октября, Виттенберг — начало Реформации") },
  { name: r("Akt supremacji Henryka VIII", "Акт о супрематии Генриха VIII"), when: "1534", note: r("król głową Kościoła w Anglii", "король — глава церкви в Англии") },
  { name: r("Pokój augsburski", "Аугсбургский религиозный мир"), when: "1555", note: r("„czyj kraj, tego religia”", "«чья власть, того и вера»") },
  { name: r("Noc św. Bartłomieja", "Варфоломеевская ночь"), when: "1572", note: r("rzeź hugenotów w Paryżu", "резня гугенотов в Париже") },
  { name: r("Edykt nantejski", "Нантский эдикт"), when: "1598", note: r("Henryk IV daje hugenotom wolność wyznania", "Генрих IV даёт гугенотам свободу веры") },
];

const FACTS: Statement[] = [
  { text: r("Luter chciał od początku założyć nowy Kościół.", "Лютер с самого начала хотел основать новую церковь."), truth: false, why: r("Chciał naprawić Kościół katolicki. Nowe wyznanie powstało, gdy papież go wyklął, a on nie odwołał swoich poglądów.", "Он хотел исправить католическую церковь. Новое исповедание возникло, когда папа отлучил его, а он не отрёкся от своих взглядов.") },
  { text: r("Protestanci to wspólna nazwa wyznawców Kościołów powstałych w wyniku reformacji.", "Протестанты — общее название приверженцев церквей, возникших в результате Реформации."), truth: true, why: r("Nazwa pochodzi od protestu książąt niemieckich w obronie Lutra w 1529 roku.", "Название происходит от протеста немецких князей в защиту Лютера в 1529 году.") },
  { text: r("Hugenoci to francuscy luteranie.", "Гугеноты — французские лютеране."), truth: false, why: r("Hugenoci byli kalwinami. To ich wymordowano w noc św. Bartłomieja w 1572 roku.", "Гугеноты были кальвинистами. Именно их перебили в Варфоломеевскую ночь 1572 года.") },
  { text: r("Pokój augsburski pozwolił każdemu poddanemu samemu wybrać wyznanie.", "Аугсбургский мир позволил каждому подданному самому выбрать веру."), truth: false, why: r("Wyznanie wybierał książę, a poddani musieli je przyjąć albo wyjechać — „czyj kraj, tego religia”.", "Веру выбирал князь, а подданные должны были принять её или уехать — «чья власть, того и вера».") },
  { text: r("Edykt nantejski zakończył wojny religijne we Francji.", "Нантский эдикт завершил религиозные войны во Франции."), truth: true, why: r("W 1598 roku Henryk IV dał hugenotom wolność wyznania, choć katolicyzm pozostał religią państwową.", "В 1598 году Генрих IV дал гугенотам свободу веры, хотя католицизм остался государственной религией.") },
  { text: r("Druk pomógł reformacji: pisma Lutra rozchodziły się w tysiącach egzemplarzy.", "Книгопечатание помогло Реформации: сочинения Лютера расходились тысячами экземпляров."), truth: true, why: r("Bez prasy drukarskiej 95 tez i niemiecka Biblia Lutra nie dotarłyby tak szybko do tylu ludzi.", "Без печатного станка 95 тезисов и немецкая Библия Лютера не дошли бы так быстро до стольких людей.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Reformacja — ruch XVI wieku dążący do naprawy Kościoła; zaczęła się od 95 tez Lutra (1517).", "Реформация — движение XVI века за исправление церкви; началась с 95 тезисов Лютера (1517)."),
    r("Luter: zbawia sama wiara, tylko Biblia jest źródłem wiary, nabożeństwa w języku narodowym.", "Лютер: спасает сама вера, единственный источник веры — Библия, богослужения на национальном языке."),
    r("Odpusty — odpuszczenie kar za grzechy sprzedawane przez Kościół; ich handel oburzył Lutra.", "Индульгенции — отпущение наказаний за грехи, продаваемое церковью; торговля ими возмутила Лютера."),
  ],
  s2: [
    r("Luteranizm — Luter, Niemcy i Skandynawia. Kalwinizm — Kalwin, Genewa; predestynacja. Anglikanizm — Henryk VIII, Anglia; król głową Kościoła.", "Лютеранство — Лютер, Германия и Скандинавия. Кальвинизм — Кальвин, Женева; предопределение. Англиканство — Генрих VIII, Англия; король — глава церкви."),
    r("Wszystkie trzy wyznania odrzucają władzę papieża — to protestanci.", "Все три исповедания отвергают власть папы — это протестанты."),
  ],
  s3: [
    r("Północ Europy stała się protestancka, południe (Hiszpania, Włochy) pozostało katolickie.", "Север Европы стал протестантским, юг (Испания, Италия) остался католическим."),
    r("Francja: katolicy przeciw hugenotom — noc św. Bartłomieja (1572), edykt nantejski (1598).", "Франция: католики против гугенотов — Варфоломеевская ночь (1572), Нантский эдикт (1598)."),
  ],
  s5: [
    r("Pokój augsburski (1555): „czyj kraj, tego religia” — wyznanie poddanych wybiera książę.", "Аугсбургский мир (1555): «чья власть, того и вера» — веру подданных выбирает князь."),
    r("Hugenoci to francuscy kalwini, nie luteranie.", "Гугеноты — французские кальвинисты, а не лютеране."),
  ],
};

export default function ReformationLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="reformation" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="reformation-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.church, T.luther]} items={TEACHINGS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="reformation-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={BRANCHES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="reformation-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <ConfessionsMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="reformation-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="reformation-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
