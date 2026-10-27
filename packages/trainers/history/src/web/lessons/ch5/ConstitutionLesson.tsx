// Lesson for §29 "Konstytucja 3 maja" (Historia 6, GWO). Names and dates follow the task bank of
// the same paragraph (templates/data/ch5.ts, CONSTITUTION and CONSTITUTION_DATES).
import {
  CompareTabs,
  LessonIntro,
  MatchQuiz,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type CompareCard,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type SortItem,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Gdy Rosja zajęła się wojną z Turcją, Polacy dostali kilka lat swobody. Sejm Wielki (1788–1792) powiększył armię, dał prawa mieszczanom i 3 maja 1791 roku uchwalił pierwszą w Europie konstytucję. Zniosła ona liberum veto i wolną elekcję — dwie choroby, które od stu lat paraliżowały państwo.",
    "Когда Россия занялась войной с Турцией, поляки получили несколько лет свободы. Великий сейм (1788–1792) увеличил армию, дал права горожанам и 3 мая 1791 года принял первую в Европе конституцию. Она отменила либерум вето и свободную элекцию — две болезни, которые сто лет парализовали государство.",
  ),
  s1: r("Trzy stronnictwa Sejmu Wielkiego", "Три партии Великого сейма"),
  s1intro: r("Kto chciał reform, kto ich nie chciał, a kto się wahał? Porównaj obozy w zakładkach.", "Кто хотел реформ, кто не хотел, а кто колебался? Сравни лагеря на вкладках."),
  s2: r("Co zmieniła konstytucja?", "Что изменила конституция?"),
  s2intro: r("Rozdziel: tak było przed Konstytucją 3 maja, a tak miało być po niej.", "Раздели: так было до Конституции 3 мая, а так должно было стать после неё."),
  s3: r("Ludzie Sejmu Wielkiego", "Люди Великого сейма"),
  s3intro: r("Dopasuj opis do nazwiska.", "Подбери описание к фамилии."),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Sprawdź, co wiesz o konstytucji i o tym, jak ją zapamiętano.", "Проверь, что ты знаешь о конституции и о том, как её запомнили."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  sort: r("Przed konstytucją czy po konstytucji?", "До конституции или после конституции?"),
  sortHint: r("Każde zdanie opisuje stary albo nowy porządek.", "Каждое утверждение описывает старый или новый порядок."),
  before: r("przed konstytucją", "до конституции"),
  after: r("po konstytucji", "после конституции"),
  who: r("Autorzy i obrońcy konstytucji", "Авторы и защитники конституции"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  tf: r("Konstytucja 3 maja", "Конституция 3 мая"),
  timeline: r("Sejm Wielki rok po roku", "Великий сейм год за годом"),
  leaders: r("Przywódcy", "Лидеры"),
  goal: r("Cel", "Цель"),
  russia: r("Wobec Rosji", "Отношение к России"),
  reforms: r("Wobec reform", "Отношение к реформам"),
} satisfies Record<string, Txt>;

const CAMPS: CompareCard[] = [
  {
    id: "patriotyczne",
    icon: "🔥",
    name: r("Stronnictwo patriotyczne", "Патриотическая партия"),
    rows: [
      { label: T.leaders, value: r("Ignacy Potocki, Stanisław Małachowski, Hugo Kołłątaj", "Игнаций Потоцкий, Станислав Малаховский, Гуго Коллонтай") },
      { label: T.goal, value: r("silne, niezależne państwo z dużą armią i sprawnym rządem", "сильное независимое государство с большой армией и дееспособным правительством") },
      { label: T.russia, value: r("zerwać zależność; szukać sojuszu z Prusami", "порвать зависимость; искать союза с Пруссией") },
      { label: T.reforms, value: r("za: znieść liberum veto i wolną elekcję, dać prawa mieszczanom", "за: отменить либерум вето и свободную элекцию, дать права горожанам") },
    ],
  },
  {
    id: "hetmanskie",
    icon: "🛡️",
    name: r("Stronnictwo hetmańskie", "Гетманская партия"),
    rows: [
      { label: T.leaders, value: r("hetmani Ksawery Branicki i Seweryn Rzewuski, Szczęsny Potocki", "гетманы Ксаверий Браницкий и Северин Жевуский, Щенсный Потоцкий") },
      { label: T.goal, value: r("zachować „złotą wolność” i władzę magnatów", "сохранить «золотую вольность» и власть магнатов") },
      { label: T.russia, value: r("oprzeć się na Rosji, która gwarantuje stary ustrój", "опереться на Россию, гарантирующую старый строй") },
      { label: T.reforms, value: r("przeciw: liberum veto i wolna elekcja to „źrenica wolności”", "против: либерум вето и свободная элекция — «зеница вольности»") },
    ],
    text: r("Ci sami ludzie zawiążą w 1792 roku konfederację targowicką.", "Те же люди в 1792 году создадут Тарговицкую конфедерацию."),
  },
  {
    id: "dworskie",
    icon: "👑",
    name: r("Stronnictwo dworskie", "Придворная партия"),
    rows: [
      { label: T.leaders, value: r("król Stanisław August i jego otoczenie", "король Станислав Август и его окружение") },
      { label: T.goal, value: r("ostrożne reformy, wzmocnienie władzy króla", "осторожные реформы, усиление власти короля") },
      { label: T.russia, value: r("nie drażnić Katarzyny II; reformować za jej zgodą", "не раздражать Екатерину II; реформировать с её согласия") },
      { label: T.reforms, value: r("za, ale powoli — w końcu król poparł patriotów i konstytucję", "за, но медленно — в итоге король поддержал патриотов и конституцию") },
    ],
  },
];

const SORT: SortItem[] = [
  { name: r("króla wybiera szlachta na wolnej elekcji", "короля выбирает шляхта на свободной элекции"), group: 0, why: r("elekcje były okazją do przekupstwa i obcej interwencji", "элекции были поводом для подкупа и иностранного вмешательства") },
  { name: r("tron dziedziczny w dynastii saskiej Wettynów", "наследственный трон саксонской династии Веттинов"), group: 1, why: r("konstytucja zniosła wolną elekcję", "конституция отменила свободную элекцию") },
  { name: r("jeden poseł może zerwać sejm", "один депутат может сорвать сейм"), group: 0, why: r("liberum veto paraliżowało państwo przez sto lat", "либерум вето сто лет парализовало государство") },
  { name: r("sejm uchwala prawa większością głosów", "сейм принимает законы большинством голосов"), group: 1, why: r("konstytucja zniosła liberum veto i zakazała konfederacji", "конституция отменила либерум вето и запретила конфедерации") },
  { name: r("Straż Praw: król i ministrowie jako rząd", "Стража законов: король и министры как правительство"), group: 1, why: r("władza wykonawcza według zasady trójpodziału władzy", "исполнительная власть по принципу разделения властей") },
  { name: r("armia 100 tysięcy żołnierzy", "армия в 100 тысяч солдат"), group: 1, why: r("Sejm Wielki uchwalił powiększenie wojska", "Великий сейм постановил увеличить войско") },
  { name: r("mieszczanie bez prawa do urzędów i kupna ziemi", "горожане без права на должности и покупку земли"), group: 0, why: r("dopiero prawo o miastach z 1791 roku dało im te prawa", "только закон о городах 1791 года дал им эти права") },
  { name: r("chłopi pod opieką prawa i rządu krajowego", "крестьяне под защитой закона и правительства"), group: 1, why: r("konstytucja po raz pierwszy wzięła chłopów pod opiekę państwa", "конституция впервые взяла крестьян под защиту государства") },
];

const WHO_OPTIONS: QuizOption[] = [
  { id: "malachowski", label: r("Stanisław Małachowski", "Станислав Малаховский") },
  { id: "potocki", label: r("Ignacy Potocki", "Игнаций Потоцкий") },
  { id: "kollataj", label: r("Hugo Kołłątaj", "Гуго Коллонтай") },
  { id: "dekert", label: r("Jan Dekert", "Ян Декерт") },
  { id: "sap", label: r("Stanisław August Poniatowski", "Станислав Август Понятовский") },
  { id: "matejko", label: r("Jan Matejko", "Ян Матейко") },
];

const WHO: QuizItem[] = [
  { icon: "🔨", name: r("marszałek Sejmu Wielkiego", "маршал Великого сейма"), answer: "malachowski", explain: r("Stanisław Małachowski prowadził obrady przez cztery lata; za uczciwość nazywano go polskim Arystydesem.", "Станислав Малаховский вёл заседания четыре года; за честность его звали польским Аристидом.") },
  { icon: "✍️", name: r("przywódca stronnictwa patriotycznego, współautor konstytucji", "лидер патриотической партии, соавтор конституции"), answer: "potocki", explain: r("Ignacy Potocki razem z królem i Kołłątajem pisał w tajemnicy projekt Ustawy Rządowej.", "Игнаций Потоцкий вместе с королём и Коллонтаем тайно писал проект Правительственного закона.") },
  { icon: "📖", name: r("ksiądz, reformator Akademii Krakowskiej, współautor konstytucji", "священник, реформатор Краковской академии, соавтор конституции"), answer: "kollataj", explain: r("Hugo Kołłątaj nadał konstytucji ostateczny kształt; jego publicyści tworzyli „Kuźnicę Kołłątajowską”.", "Гуго Коллонтай придал конституции окончательную форму; его публицисты составляли «Кузницу Коллонтая».") },
  { icon: "🖤", name: r("prezydent Warszawy, który poprowadził czarną procesję mieszczan", "президент Варшавы, возглавивший чёрную процессию горожан"), answer: "dekert", explain: r("Jan Dekert w grudniu 1789 roku przyniósł królowi żądania 141 miast; dwa lata później sejm uchwalił prawo o miastach.", "Ян Декерт в декабре 1789 года принёс королю требования 141 города; через два года сейм принял закон о городах.") },
  { icon: "👑", name: r("król, który poparł konstytucję i pierwszy ją zaprzysiągł", "король, поддержавший конституцию и первым ей присягнувший"), answer: "sap", explain: r("Stanisław August współtworzył projekt i 3 maja 1791 roku złożył przysięgę na ręce biskupa krakowskiego.", "Станислав Август участвовал в создании проекта и 3 мая 1791 года принёс присягу перед краковским епископом.") },
  { icon: "🖼️", name: r("malarz, który sto lat później uwiecznił uchwalenie konstytucji", "художник, который сто лет спустя увековечил принятие конституции"), answer: "matejko", explain: r("Jan Matejko namalował „Konstytucję 3 maja 1791 roku” w 1891 roku: pochód posłów z Zamku do kolegiaty św. Jana.", "Ян Матейко написал «Конституцию 3 мая 1791 года» в 1891 году: шествие депутатов из Замка в коллегиату св. Иоанна.") },
];

const TF: Statement[] = [
  { text: r("Konstytucja 3 maja była pierwszą spisaną konstytucją na świecie.", "Конституция 3 мая была первой писаной конституцией в мире."), truth: false, why: r("Była pierwsza w Europie, ale druga na świecie — po konstytucji Stanów Zjednoczonych z 1787 roku.", "Она была первой в Европе, но второй в мире — после конституции Соединённых Штатов 1787 года.") },
  { text: r("Konstytucja zniosła liberum veto.", "Конституция отменила либерум вето."), truth: true, why: r("Sejm miał odtąd decydować większością głosów; zakazano też konfederacji.", "Сейм отныне должен был решать большинством голосов; запретили и конфедерации.") },
  { text: r("Po konstytucji króla nadal wybierano na wolnej elekcji.", "После конституции короля по-прежнему избирали на свободной элекции."), truth: false, why: r("Tron stał się dziedziczny: po Stanisławie Auguście mieli panować Wettynowie z Saksonii.", "Трон стал наследственным: после Станислава Августа должны были править саксонские Веттины.") },
  { text: r("Konstytucja wprowadziła trójpodział władzy: sejm, Straż Praw i sądy.", "Конституция ввела разделение властей: сейм, Стража законов и суды."), truth: true, why: r("Władza prawodawcza, wykonawcza i sądownicza miały być od siebie niezależne — pomysł Monteskiusza.", "Законодательная, исполнительная и судебная власти должны были быть независимы — идея Монтескьё.") },
  { text: r("Konstytucja zniosła pańszczyznę i uwolniła chłopów.", "Конституция отменила барщину и освободила крестьян."), truth: false, why: r("Wzięła chłopów „pod opiekę prawa”, ale pańszczyzna pozostała. Dopiero Uniwersał połaniecki (1794) ją ograniczył.", "Она взяла крестьян «под защиту закона», но барщина осталась. Только Поланецкий универсал (1794) её ограничил.") },
  { text: r("Konstytucję uchwalono, gdy wielu jej przeciwników nie wróciło jeszcze ze świąt do Warszawy.", "Конституцию приняли, когда многие её противники ещё не вернулись в Варшаву после праздников."), truth: true, why: r("Zwolennicy wykorzystali dzień tuż po Wielkanocy; sala i ulice wokół Zamku były pełne mieszczan popierających reformy.", "Сторонники использовали день сразу после Пасхи; зал и улицы вокруг Замка были полны горожан, поддерживавших реформы.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("konstytucja Stanów Zjednoczonych", "конституция Соединённых Штатов"), when: "1787", note: r("pierwsza na świecie", "первая в мире") },
  { name: r("początek obrad Sejmu Wielkiego", "начало заседаний Великого сейма"), when: "1788" },
  { name: r("czarna procesja mieszczan", "чёрная процессия горожан"), when: "2 XII 1789" },
  { name: r("prawo o miastach", "закон о городах"), when: "18 IV 1791" },
  { name: r("uchwalenie Konstytucji 3 maja", "принятие Конституции 3 мая"), when: "3 V 1791", note: r("pierwsza w Europie", "первая в Европе") },
  { name: r("koniec obrad Sejmu Wielkiego", "конец заседаний Великого сейма"), when: "V 1792" },
  { name: r("Matejko maluje „Konstytucję 3 maja”", "Матейко пишет «Конституцию 3 мая»"), when: "1891" },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Sejm Wielki (Czteroletni) 1788–1792, marszałek Stanisław Małachowski; sejm skonfederowany — nie można go było zerwać.", "Великий (Четырёхлетний) сейм 1788–1792, маршал Станислав Малаховский; сейм конфедеративный — его нельзя было сорвать."),
    r("Stronnictwa: patriotyczne (reformy), hetmańskie (Rosja, złota wolność), dworskie (król).", "Партии: патриотическая (реформы), гетманская (Россия, золотая вольность), придворная (король)."),
  ],
  s2: [
    r("Konstytucja 3 maja 1791: koniec liberum veto i wolnej elekcji, tron dziedziczny (Wettynowie), trójpodział władzy, Straż Praw, armia 100 tys., opieka nad chłopami.", "Конституция 3 мая 1791: конец либерум вето и свободной элекции, наследственный трон (Веттины), разделение властей, Стража законов, армия 100 тыс., защита крестьян."),
    r("Prawo o miastach (IV 1791): mieszczanie miast królewskich mogli kupować ziemię, piastować urzędy i wysyłać posłów na sejm.", "Закон о городах (IV 1791): горожане королевских городов могли покупать землю, занимать должности и посылать депутатов на сейм."),
  ],
  s3: [
    r("Autorzy konstytucji: król Stanisław August, Ignacy Potocki, Hugo Kołłątaj. Czarna procesja 1789 — Jan Dekert.", "Авторы конституции: король Станислав Август, Игнаций Потоцкий, Гуго Коллонтай. Чёрная процессия 1789 — Ян Декерт."),
  ],
  s4: [
    r("Druga na świecie (po USA 1787), pierwsza w Europie. Dziś 3 maja to święto narodowe.", "Вторая в мире (после США 1787), первая в Европе. Сегодня 3 мая — национальный праздник."),
  ],
};

export default function ConstitutionLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="constitution" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="constitution-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={CAMPS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="constitution-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.before, T.after]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="constitution-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="constitution-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={TF} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="constitution-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
