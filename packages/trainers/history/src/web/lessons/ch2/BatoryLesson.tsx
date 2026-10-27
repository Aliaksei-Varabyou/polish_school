// Lesson for §11 "Panowanie Stefana Batorego" (Historia 6, GWO). People, places and dates follow the
// task bank of the same paragraph (templates/data/ch2.ts, BATORY and BATORY_DATES).
import {
  LessonIntro,
  MatchQuiz,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type SortItem,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { LivoniaMap } from "./LivoniaMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Po ucieczce Walezego szlachta wybrała Annę Jagiellonkę i jej męża — księcia Siedmiogrodu Stefana Batorego. Nowy król nie znał polskiego, ale okazał się świetnym wodzem i organizatorem: w trzech wyprawach pokonał Iwana Groźnego, stworzył piechotę wybraniecką i oddał szlachcie sądy.",
    "После бегства Валуа шляхта избрала Анну Ягеллонку и её мужа — князя Трансильвании Стефана Батория. Новый король не знал польского, но оказался отличным полководцем и организатором: в трёх походах победил Ивана Грозного, создал выбранецкую пехоту и отдал шляхте суды.",
  ),
  s1: r("Ludzie i pojęcia", "Люди и понятия"),
  s1intro: r("Kto to był albo co to jest? Dopasuj opis do nazwy.", "Кто это был или что это? Подбери описание к названию."),
  s2: r("Wojna z Moskwą o Inflanty", "Война с Москвой за Ливонию"),
  s2intro: r(
    "Trzy wyprawy, trzy twierdze, jeden rozejm. Dotknij strzałek i twierdz na mapie, a potem podpisz je sam.",
    "Три похода, три крепости, одно перемирие. Нажми на стрелки и крепости на карте, а потом подпиши их сам.",
  ),
  s3: r("Wojsko czy państwo?", "Войско или государство?"),
  s3intro: r("Batory reformował i armię, i Rzeczpospolitą. Rozdziel jego dokonania.", "Баторий реформировал и армию, и Речь Посполитую. Раздели его достижения."),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Sprawdź, co wiesz o królu z Siedmiogrodu.", "Проверь, что ты знаешь о короле из Трансильвании."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Dziesięć lat panowania Batorego: ułóż wydarzenia w kolejności.", "Десять лет правления Батория: расставь события по порядку."),
  quiz: r("Czasy Batorego", "Времена Батория"),
  quizQ: r("Kto to albo co to:", "Кто это или что это:"),
  quizWrong: r("to co innego. Spróbuj jeszcze raz.", "это другое. Попробуй ещё раз."),
  sort: r("Dokonania Batorego", "Достижения Батория"),
  sortHint: r("Co dotyczy armii, a co ustroju, sądów i szkół?", "Что касается армии, а что — устройства, судов и школ?"),
  army: r("wojsko", "войско"),
  state: r("państwo", "государство"),
  tf: r("Stefan Batory", "Стефан Баторий"),
  timeline: r("Panowanie Batorego rok po roku", "Правление Батория год за годом"),
} satisfies Record<string, Txt>;

const OPTIONS: QuizOption[] = [
  { id: "batory", label: r("Stefan Batory", "Стефан Баторий") },
  { id: "anna", label: r("Anna Jagiellonka", "Анна Ягеллонка") },
  { id: "iwan", label: r("Iwan IV Groźny", "Иван IV Грозный") },
  { id: "zamoyski", label: r("Jan Zamoyski", "Ян Замойский") },
  { id: "wybr", label: r("piechota wybraniecka", "выбранецкая пехота") },
  { id: "husaria", label: r("husaria", "гусария") },
  { id: "trybunal", label: r("Trybunał Koronny", "Коронный трибунал") },
];

const QUIZ: QuizItem[] = [
  {
    icon: "👑",
    name: r("książę Siedmiogrodu wybrany na króla Polski w 1575 roku", "князь Трансильвании, избранный королём Польши в 1575 году"),
    answer: "batory",
    explain: r(
      "Batory panował w latach 1576–1586 i okazał się jednym z najlepszych wodzów na polskim tronie.",
      "Баторий правил в 1576–1586 годах и оказался одним из лучших полководцев на польском троне.",
    ),
  },
  {
    icon: "👸",
    name: r("siostra Zygmunta Augusta, koronowana razem z Batorym jako jego żona", "сестра Сигизмунда Августа, коронованная вместе с Баторием как его жена"),
    answer: "anna",
    explain: r("Anna Jagiellonka była ostatnią z Jagiellonów; dzięki niej Batory zyskał prawa do tronu.", "Анна Ягеллонка была последней из Ягеллонов; благодаря ей Баторий получил права на трон."),
  },
  {
    icon: "🛡️",
    name: r("car Moskwy, który zajął Inflanty i przegrał wojnę z Batorym", "царь Москвы, захвативший Ливонию и проигравший войну Баторию"),
    answer: "iwan",
    explain: r("Iwan IV Groźny po oblężeniu Pskowa zgodził się na rozejm w Jamie Zapolskim.", "Иван IV Грозный после осады Пскова согласился на Ям-Запольское перемирие."),
  },
  {
    icon: "📜",
    name: r("kanclerz i hetman wielki koronny, najbliższy współpracownik króla", "канцлер и великий коронный гетман, ближайший соратник короля"),
    answer: "zamoyski",
    explain: r("Jan Zamoyski dowodził w wyprawach na Moskwę i założył Zamość.", "Ян Замойский командовал в походах на Москву и основал Замосць."),
  },
  {
    icon: "🪖",
    name: r("piechota z chłopów królewskich — jeden żołnierz z dwudziestu łanów", "пехота из королевских крестьян — один солдат с двадцати ланов"),
    answer: "wybr",
    explain: r(
      "Wybraniec był zwolniony z pańszczyzny; piechota wybraniecka kopała szańce i szturmowała twierdze.",
      "Выбранец был освобождён от барщины; выбранецкая пехота рыла шанцы и штурмовала крепости.",
    ),
  },
  {
    icon: "🐎",
    name: r("ciężka jazda z kopiami i skrzydłami u siodła", "тяжёлая конница с копьями и крыльями у седла"),
    answer: "husaria",
    explain: r("Husaria rozstrzygała bitwy szarżą; za Batorego stała się główną siłą jazdy polskiej.", "Гусария решала битвы атакой; при Батории она стала главной силой польской конницы."),
  },
  {
    icon: "⚖️",
    name: r("najwyższy sąd szlachecki utworzony w 1578 roku", "высший шляхетский суд, созданный в 1578 году"),
    answer: "trybunal",
    explain: r("Król zrzekł się sądzenia szlachty; Trybunał Koronny obradował w Piotrkowie i Lublinie.", "Король отказался судить шляхту; Коронный трибунал заседал в Пётркуве и Люблине."),
  },
];

const DEEDS: SortItem[] = [
  {
    name: r("piechota wybraniecka z chłopów królewskich", "выбранецкая пехота из королевских крестьян"),
    group: 0,
    why: r("nowa piechota do walki z twierdzami", "новая пехота для борьбы с крепостями"),
  },
  {
    name: r("Trybunał Koronny — sąd najwyższy dla szlachty", "Коронный трибунал — высший суд для шляхты"),
    group: 1,
    why: r("1578 — król oddał szlachcie sądownictwo", "1578 — король отдал шляхте судопроизводство"),
  },
  {
    name: r("husaria jako główna siła jazdy", "гусария как главная сила конницы"),
    group: 0,
    why: r("ciężka jazda rozstrzygała bitwy", "тяжёлая конница решала битвы"),
  },
  {
    name: r("Akademia Wileńska", "Виленская академия"),
    group: 1,
    why: r("1579 — pierwszy uniwersytet na Litwie, z kolegium jezuitów", "1579 — первый университет в Литве, из иезуитской коллегии"),
  },
  {
    name: r("artyleria i oblężenia Połocka, Wielkich Łuków, Pskowa", "артиллерия и осады Полоцка, Великих Лук, Пскова"),
    group: 0,
    why: r("Batory walczył o twierdze, nie w otwartym polu", "Баторий воевал за крепости, а не в открытом поле"),
  },
  {
    name: r("Trybunał Litewski", "Литовский трибунал"),
    group: 1,
    why: r("1581 — osobny sąd najwyższy dla Litwy", "1581 — отдельный высший суд для Литвы"),
  },
  {
    name: r("zaciąg Kozaków rejestrowych na służbę króla", "набор реестровых казаков на королевскую службу"),
    group: 0,
    why: r("Kozacy pilnowali granicy ze stepem i walczyli z Moskwą", "казаки охраняли границу со степью и воевали с Москвой"),
  },
  {
    name: r("współpraca z kanclerzem Janem Zamoyskim", "сотрудничество с канцлером Яном Замойским"),
    group: 1,
    why: r("kanclerz kierował polityką i kancelarią królewską", "канцлер руководил политикой и королевской канцелярией"),
  },
];

const FACTS: Statement[] = [
  {
    text: r("Stefan Batory pochodził z Francji, jak Henryk Walezy.", "Стефан Баторий происходил из Франции, как Генрих Валуа."),
    truth: false,
    why: r("Batory był księciem Siedmiogrodu — krainy w Królestwie Węgier (dziś w Rumunii).", "Баторий был князем Трансильвании — области в Венгерском королевстве (ныне в Румынии)."),
  },
  {
    text: r("Batory zdobył Psków i zajął Moskwę.", "Баторий взял Псков и занял Москву."),
    truth: false,
    why: r(
      "Pskowa nie zdobyto; oblężenie zmusiło jednak Iwana Groźnego do rozejmu, w którym oddał Inflanty.",
      "Псков не был взят; однако осада вынудила Ивана Грозного заключить перемирие, по которому он отдал Ливонию.",
    ),
  },
  {
    text: r("Rozejm w Jamie Zapolskim w 1582 roku oddał Rzeczypospolitej Inflanty i Połock.", "Ям-Запольское перемирие 1582 года отдало Речи Посполитой Ливонию и Полоцк."),
    truth: true,
    why: r("Wojna o Inflanty zakończyła się zwycięstwem Batorego.", "Война за Ливонию закончилась победой Батория."),
  },
  {
    text: r("Od 1578 roku król nie sądził już spraw szlachty — robił to Trybunał Koronny.", "С 1578 года король уже не судил дела шляхты — это делал Коронный трибунал."),
    truth: true,
    why: r("Sędziów Trybunału wybierała sama szlachta na sejmikach.", "Судей Трибунала выбирала сама шляхта на сеймиках."),
  },
  {
    text: r("Akademię Wileńską założył Zygmunt August.", "Виленскую академию основал Сигизмунд Август."),
    truth: false,
    why: r("Założył ją Stefan Batory w 1579 roku, przekształcając kolegium jezuitów.", "Её основал Стефан Баторий в 1579 году, преобразовав иезуитскую коллегию."),
  },
  {
    text: r("Gdańsk nie uznał wyboru Batorego i król musiał go oblegać.", "Гданьск не признал избрания Батория, и королю пришлось его осаждать."),
    truth: true,
    why: r(
      "W 1577 roku Gdańsk poparł cesarza Maksymiliana; po oblężeniu zapłacił królowi wysoką karę.",
      "В 1577 году Гданьск поддержал императора Максимилиана; после осады заплатил королю большой штраф.",
    ),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("koronacja Stefana Batorego i Anny Jagiellonki", "коронация Стефана Батория и Анны Ягеллонки"),
    when: "1576",
  },
  {
    name: r("utworzenie Trybunału Koronnego", "создание Коронного трибунала"),
    when: "1578",
  },
  {
    name: r("zdobycie Połocka", "взятие Полоцка"),
    when: "1579",
    note: r("pierwsza wyprawa; w tym samym roku powstaje Akademia Wileńska", "первый поход; в том же году возникает Виленская академия"),
  },
  { name: r("zdobycie Wielkich Łuków", "взятие Великих Лук"), when: "1580" },
  { name: r("początek oblężenia Pskowa", "начало осады Пскова"), when: "1581" },
  {
    name: r("rozejm w Jamie Zapolskim", "Ям-Запольское перемирие"),
    when: "1582",
    note: r("Moskwa oddaje Inflanty i Połock", "Москва отдаёт Ливонию и Полоцк"),
  },
  {
    name: r("śmierć Batorego w Grodnie", "смерть Батория в Гродно"),
    when: "1586",
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r(
      "Stefan Batory (1576–1586) — książę Siedmiogrodu, mąż Anny Jagiellonki; kanclerz i hetman Jan Zamoyski.",
      "Стефан Баторий (1576–1586) — князь Трансильвании, муж Анны Ягеллонки; канцлер и гетман Ян Замойский.",
    ),
    r("Wojsko Batorego: piechota wybraniecka, husaria, artyleria.", "Войско Батория: выбранецкая пехота, гусария, артиллерия."),
  ],
  s2: [
    r("Trzy wyprawy na Moskwę: Połock 1579, Wielkie Łuki 1580, Psków 1581–1582.", "Три похода на Москву: Полоцк 1579, Великие Луки 1580, Псков 1581–1582."),
    r("1582 — rozejm w Jamie Zapolskim: Iwan Groźny oddaje Inflanty i Połock.", "1582 — Ям-Запольское перемирие: Иван Грозный отдаёт Ливонию и Полоцк."),
  ],
  s3: [r("1578 — Trybunał Koronny; 1579 — Akademia Wileńska.", "1578 — Коронный трибунал; 1579 — Виленская академия.")],
  s4: [r("Batory nie zdobył Pskowa, ale wygrał wojnę. Zmarł w 1586 roku w Grodnie.", "Баторий не взял Псков, но выиграл войну. Умер в 1586 году в Гродно.")],
};

export default function BatoryLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="batory" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="batory-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.quiz} question={T.quizQ} options={OPTIONS} items={QUIZ} wrongHint={T.quizWrong} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="batory-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <LivoniaMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="batory-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.army, T.state]} items={DEEDS} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="batory-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="batory-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
