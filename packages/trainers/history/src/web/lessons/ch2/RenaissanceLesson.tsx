// Lesson for §8 "Renesans w Polsce" (Historia 6, GWO). People, works and dates follow the task bank
// of the same paragraph (templates/data/ch2.ts, POLISH_RENAISSANCE and POLISH_RENAISSANCE_DATES).
import {
  LessonIntro,
  MatchQuiz,
  Remember,
  Section,
  SpeciesGallery,
  Timeline,
  TrueFalse,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type Species,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { WawelDiagram } from "./WawelDiagram.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Renesans przyszedł do Polski z Włoch — z królową Boną, z architektami Zygmunta Starego i ze studentami wracającymi z Padwy i Bolonii. Powstały Kaplica Zygmuntowska i dziedziniec arkadowy na Wawelu, a Rej i Kochanowski pokazali, że po polsku można pisać wielką literaturę.",
    "Возрождение пришло в Польшу из Италии — с королевой Боной, с архитекторами Сигизмунда Старого и со студентами, возвращавшимися из Падуи и Болоньи. Появились Сигизмундова капелла и аркадный двор на Вавеле, а Рей и Кохановский показали, что по-польски можно писать большую литературу.",
  ),
  s1: r("Twórcy polskiego renesansu", "Деятели польского Возрождения"),
  s1intro: r("Dotknij karty, żeby poznać pisarza, uczonego albo budowniczego.", "Нажми на карточку, чтобы узнать о писателе, учёном или строителе."),
  s2: r("Kto to stworzył?", "Кто это создал?"),
  s2intro: r("Dzieło — twórca. Dopasuj.", "Произведение — автор. Подбери."),
  s3: r("Renesansowy Wawel", "Ренессансный Вавель"),
  s3intro: r(
    "Obejrzyj wzgórze wawelskie: dotknij zamku, dziedzińca, katedry i kaplicy. Potem podpisz je sam.",
    "Рассмотри Вавельский холм: нажми на замок, двор, собор и капеллу. Потом подпиши их сам.",
  ),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Kilka zdań o polskim renesansie. Które są prawdziwe?", "Несколько утверждений о польском Возрождении. Какие из них верны?"),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  quiz: r("Dzieło i twórca", "Произведение и автор"),
  quizQ: r("Kto stworzył:", "Кто создал:"),
  quizWrong: r("to ktoś inny. Spróbuj jeszcze raz.", "это кто-то другой. Попробуй ещё раз."),
  tf: r("Polski renesans", "Польское Возрождение"),
  timeline: r("Renesans w Polsce rok po roku", "Возрождение в Польше год за годом"),
} satisfies Record<string, Txt>;

const PEOPLE: Species[] = [
  {
    icon: "🪶",
    name: r("Mikołaj Rej", "Миколай Рей"),
    tag: r("pisarz", "писатель"),
    text: r(
      "„Ojciec literatury polskiej”. Szlachcic z Nagłowic, który pisał tylko po polsku i bronił języka ojczystego: „A niechaj narodowie wżdy postronni znają, iż Polacy nie gęsi, iż swój język mają”.",
      "«Отец польской литературы». Шляхтич из Наглович, писавший только по-польски и защищавший родной язык: «Пусть же знают чужие народы, что поляки не гуси, у них свой язык есть».",
    ),
  },
  {
    icon: "🌳",
    name: r("Jan Kochanowski", "Ян Кохановский"),
    tag: r("poeta", "поэт"),
    text: r(
      "Najwybitniejszy poeta polskiego renesansu. Studiował w Krakowie i Padwie, potem osiadł w Czarnolesie. Autor „Fraszek”, „Pieśni” i „Trenów” — wierszy po śmierci córeczki Urszulki.",
      "Крупнейший поэт польского Возрождения. Учился в Кракове и Падуе, затем поселился в Чарнолясе. Автор «Фрашек», «Песен» и «Тренов» — стихов после смерти дочки Уршули.",
    ),
  },
  {
    icon: "⚖️",
    name: r("Andrzej Frycz Modrzewski", "Анджей Фрыч-Моджевский"),
    tag: r("pisarz polityczny", "политический писатель"),
    text: r(
      "Autor dzieła „O poprawie Rzeczypospolitej”. Domagał się równości wszystkich stanów wobec prawa — tej samej kary za zabójstwo dla szlachcica i chłopa — oraz opieki państwa nad szkołami.",
      "Автор труда «Об исправлении Речи Посполитой». Требовал равенства всех сословий перед законом — одинакового наказания за убийство для шляхтича и крестьянина — и заботы государства о школах.",
    ),
  },
  {
    icon: "🔭",
    name: r("Mikołaj Kopernik", "Николай Коперник"),
    tag: r("astronom", "астроном"),
    text: r(
      "Wychowanek Akademii Krakowskiej, kanonik we Fromborku. W dziele „O obrotach sfer niebieskich” (1543) dowiódł, że Ziemia krąży wokół Słońca.",
      "Воспитанник Краковской академии, каноник во Фромборке. В труде «О вращении небесных сфер» (1543) доказал, что Земля вращается вокруг Солнца.",
    ),
  },
  {
    icon: "🏛️",
    name: r("Bartolomeo Berrecci", "Бартоломео Берреччи"),
    tag: r("architekt", "архитектор"),
    text: r(
      "Włoski architekt i rzeźbiarz. Zbudował na Wawelu Kaplicę Zygmuntowską (1519–1533) ze złotą kopułą i pracował przy przebudowie zamku.",
      "Итальянский архитектор и скульптор. Построил на Вавеле Сигизмундову капеллу (1519–1533) с золотым куполом и участвовал в перестройке замка.",
    ),
  },
  {
    icon: "📐",
    name: r("Bernardo Morando", "Бернардо Морандо"),
    tag: r("architekt", "архитектор"),
    text: r(
      "Włoch z Padwy, który dla Jana Zamoyskiego zaprojektował Zamość — „miasto idealne” z rynkiem, ratuszem i murami, zbudowane od podstaw według jednego planu.",
      "Итальянец из Падуи, спроектировавший для Яна Замойского Замосць — «идеальный город» с рынком, ратушей и стенами, построенный с нуля по единому плану.",
    ),
  },
  {
    icon: "👑",
    name: r("Jan Zamoyski", "Ян Замойский"),
    tag: r("kanclerz", "канцлер"),
    text: r(
      "Kanclerz i hetman wielki koronny, wychowanek uniwersytetu w Padwie. Założył Zamość (1580) i Akademię Zamojską (1594).",
      "Канцлер и великий коронный гетман, воспитанник Падуанского университета. Основал Замосць (1580) и Замойскую академию (1594).",
    ),
  },
  {
    icon: "🎓",
    name: r("Akademia Krakowska", "Краковская академия"),
    tag: r("uczelnia", "университет"),
    text: r(
      "Najstarsza polska uczelnia, założona w 1364 roku przez Kazimierza Wielkiego. W XVI wieku przyciągała studentów z całej Europy; studiowali tu Kopernik i Kochanowski.",
      "Старейший польский университет, основанный в 1364 году Казимиром Великим. В XVI веке привлекал студентов со всей Европы; здесь учились Коперник и Кохановский.",
    ),
  },
];

const OPTIONS: QuizOption[] = [
  { id: "rej", label: r("Mikołaj Rej", "Миколай Рей") },
  { id: "koch", label: r("Jan Kochanowski", "Ян Кохановский") },
  { id: "modrz", label: r("Frycz Modrzewski", "Фрыч-Моджевский") },
  { id: "berr", label: r("Bartolomeo Berrecci", "Бартоломео Берреччи") },
  { id: "mor", label: r("Bernardo Morando", "Бернардо Морандо") },
  { id: "zyg", label: r("Zygmunt August", "Сигизмунд Август") },
];

const QUIZ: QuizItem[] = [
  {
    icon: "😢",
    name: r("„Treny” — wiersze po śmierci córeczki Urszulki", "«Трены» — стихи после смерти дочки Уршули"),
    answer: "koch",
    explain: r("Jan Kochanowski wydał „Treny” w 1580 roku.", "Ян Кохановский издал «Трены» в 1580 году."),
  },
  {
    icon: "🦢",
    name: r("słowa „Polacy nie gęsi, iż swój język mają”", "слова «поляки не гуси, у них свой язык есть»"),
    answer: "rej",
    explain: r("Mikołaj Rej pisał wyłącznie po polsku, gdy uczeni pisali po łacinie.", "Миколай Рей писал исключительно по-польски, когда учёные писали на латыни."),
  },
  {
    icon: "📘",
    name: r("„O poprawie Rzeczypospolitej”", "«Об исправлении Речи Посполитой»"),
    answer: "modrz",
    explain: r("Modrzewski proponował w nim naprawę prawa, wojska, Kościoła i szkół.", "Моджевский предлагал в нём исправление закона, войска, церкви и школ."),
  },
  {
    icon: "🟡",
    name: r("Kaplicę Zygmuntowską ze złotą kopułą", "Сигизмундову капеллу с золотым куполом"),
    answer: "berr",
    explain: r("Berrecci budował kaplicę grobową Jagiellonów w latach 1519–1533.", "Берреччи строил усыпальницу Ягеллонов в 1519–1533 годах."),
  },
  {
    icon: "🏙️",
    name: r("plan Zamościa — „miasta idealnego”", "план Замосця — «идеального города»"),
    answer: "mor",
    explain: r("Morando zaprojektował miasto dla kanclerza Jana Zamoyskiego.", "Морандо спроектировал город для канцлера Яна Замойского."),
  },
  {
    icon: "🧵",
    name: r("zamówienie arrasów wawelskich w Brukseli", "заказ вавельских аррасов в Брюсселе"),
    answer: "zyg",
    explain: r("Zygmunt August sprowadził ponad 350 tkanin do ozdoby komnat zamku.", "Сигизмунд Август привёз больше 350 тканей для украшения покоев замка."),
  },
  {
    icon: "😄",
    name: r("„Fraszki” — krótkie, żartobliwe wiersze", "«Фрашки» — короткие шутливые стихи"),
    answer: "koch",
    explain: r("Kochanowski pisał fraszki o życiu dworskim, przyjaciołach i o sobie.", "Кохановский писал фрашки о придворной жизни, друзьях и о себе."),
  },
];

const FACTS: Statement[] = [
  {
    text: r(
      "W XVI wieku uczeni w Polsce pisali głównie po łacinie, a Rej jako jeden z pierwszych — po polsku.",
      "В XVI веке учёные в Польше писали в основном на латыни, а Рей одним из первых — по-польски.",
    ),
    truth: true,
    why: r("Łacina była językiem nauki i Kościoła; literatura w języku polskim dopiero się rodziła.", "Латынь была языком науки и церкви; литература на польском языке только рождалась."),
  },
  {
    text: r("Kaplica Zygmuntowska jest w stylu gotyckim.", "Сигизмундова капелла построена в готическом стиле."),
    truth: false,
    why: r("To arcydzieło renesansu: kopuła, symetria i antyczne zdobienia. Gotycka jest sama katedra.", "Это шедевр Возрождения: купол, симметрия и античные украшения. Готический — сам собор."),
  },
  {
    text: r("Zamość zbudowano od podstaw według jednego planu.", "Замосць построили с нуля по единому плану."),
    truth: true,
    why: r("Jan Zamoyski i Bernardo Morando stworzyli „miasto idealne” z regularnym rynkiem i murami.", "Ян Замойский и Бернардо Морандо создали «идеальный город» с правильным рынком и стенами."),
  },
  {
    text: r("Jan Kochanowski napisał „Treny” po śmierci żony.", "Ян Кохановский написал «Трены» после смерти жены."),
    truth: false,
    why: r("„Treny” opłakują śmierć córeczki Urszulki.", "«Трены» оплакивают смерть дочки Уршули."),
  },
  {
    text: r("Renesansową przebudowę Wawelu rozpoczął Zygmunt Stary.", "Ренессансную перестройку Вавеля начал Сигизмунд Старый."),
    truth: true,
    why: r("Włoscy architekci pracowali dla niego od 1507 roku; arrasy dodał później Zygmunt August.", "Итальянские архитекторы работали для него с 1507 года; аррасы добавил позже Сигизмунд Август."),
  },
  {
    text: r("Frycz Modrzewski uważał, że szlachcic i chłop powinni odpowiadać za zabójstwo tak samo.", "Фрыч-Моджевский считал, что шляхтич и крестьянин должны одинаково отвечать за убийство."),
    truth: true,
    why: r("Domagał się równości wobec prawa — w jego czasach kara zależała od stanu.", "Он требовал равенства перед законом — в его время наказание зависело от сословия."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("założenie Akademii Krakowskiej", "основание Краковской академии"),
    when: "1364",
    note: r("Kazimierz Wielki", "Казимир Великий"),
  },
  {
    name: r("ukończenie Kaplicy Zygmuntowskiej", "завершение Сигизмундовой капеллы"),
    when: "1533",
    note: r("Bartolomeo Berrecci", "Бартоломео Берреччи"),
  },
  {
    name: r("„O obrotach sfer niebieskich” Kopernika", "«О вращении небесных сфер» Коперника"),
    when: "1543",
  },
  {
    name: r("„O poprawie Rzeczypospolitej” Modrzewskiego", "«Об исправлении Речи Посполитой» Моджевского"),
    when: "1551",
  },
  { name: r("„Treny” Kochanowskiego", "«Трены» Кохановского"), when: "1580" },
  {
    name: r("otwarcie Akademii Zamojskiej", "открытие Замойской академии"),
    when: "1594",
    note: r("Jan Zamoyski", "Ян Замойский"),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r(
      "Literatura: Mikołaj Rej („Polacy nie gęsi”), Jan Kochanowski (Czarnolas, „Treny”, „Fraszki”), Andrzej Frycz Modrzewski („O poprawie Rzeczypospolitej”).",
      "Литература: Миколай Рей («поляки не гуси»), Ян Кохановский (Чарноляс, «Трены», «Фрашки»), Анджей Фрыч-Моджевский («Об исправлении Речи Посполитой»).",
    ),
    r("Architektura: Berrecci — Kaplica Zygmuntowska; Morando — Zamość dla Jana Zamoyskiego.", "Архитектура: Берреччи — Сигизмундова капелла; Морандо — Замосць для Яна Замойского."),
  ],
  s2: [r("Nauka: Akademia Krakowska (1364) i jej wychowanek Mikołaj Kopernik (1543).", "Наука: Краковская академия (1364) и её воспитанник Николай Коперник (1543).")],
  s3: [
    r(
      "Wawel: renesansowy zamek z dziedzińcem arkadowym, Kaplica Zygmuntowska ze złotą kopułą, arrasy Zygmunta Augusta.",
      "Вавель: ренессансный замок с аркадным двором, Сигизмундова капелла с золотым куполом, аррасы Сигизмунда Августа.",
    ),
  ],
  s4: [r("Renesans w Polsce przyszedł z Włoch: królowa Bona, włoscy architekci, studia w Padwie.", "Возрождение в Польшу пришло из Италии: королева Бона, итальянские архитекторы, учёба в Падуе.")],
};

export default function RenaissanceLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="renaissance" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="renaissance-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={PEOPLE} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="renaissance-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.quiz} question={T.quizQ} options={OPTIONS} items={QUIZ} wrongHint={T.quizWrong} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="renaissance-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <WawelDiagram lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="renaissance-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="renaissance-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
