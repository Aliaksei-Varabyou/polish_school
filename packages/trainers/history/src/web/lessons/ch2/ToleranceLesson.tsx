// Lesson for §6 "Tolerancja religijna w Polsce" (Historia 6, GWO). Terms and dates follow the task
// bank of the same paragraph (templates/data/ch2.ts, TOLERANCE and TOLERANCE_DATES).
import {
  CompareTabs,
  LessonIntro,
  MatchQuiz,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  type CompareCard,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Gdy w Europie płonęły stosy i toczyły się wojny religijne, w Rzeczypospolitej obok siebie żyli katolicy, luteranie, kalwini, bracia polscy, prawosławni, Żydzi i muzułmanie. W 1573 roku szlachta zapisała tę zgodę w konfederacji warszawskiej.",
    "Когда в Европе горели костры и шли религиозные войны, в Речи Посполитой рядом жили католики, лютеране, кальвинисты, польские братья, православные, евреи и мусульмане. В 1573 году шляхта закрепила это согласие в Варшавской конфедерации.",
  ),
  s1: r("Kto w co wierzył?", "Кто во что верил?"),
  s1intro: r("Przełączaj zakładki i porównaj wyznania Rzeczypospolitej: kto, gdzie i czym się wyróżniał.", "Переключай вкладки и сравни вероисповедания Речи Посполитой: кто, где и чем выделялся."),
  s2: r("Pojęcia tolerancji", "Понятия веротерпимости"),
  s2intro: r("Dopasuj opis do nazwy.", "Подбери описание к названию."),
  s3: r("Państwo bez stosów?", "Государство без костров?"),
  s3intro: r("Prawda czy fałsz? Uważaj na pułapki.", "Правда или ложь? Осторожно, есть ловушки."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  quiz: r("Co to jest?", "Что это?"),
  quizQ: r("Jak nazywa się:", "Как называется:"),
  quizWrong: r("to co innego. Spróbuj jeszcze raz.", "это другое. Попробуй ещё раз."),
  tf: r("Tolerancja w Rzeczypospolitej", "Веротерпимость в Речи Посполитой"),
  timeline: r("Wyznania i prawa rok po roku", "Исповедания и законы год за годом"),
  who: r("Kto?", "Кто?"),
  where: r("Gdzie?", "Где?"),
  what: r("Co ich wyróżniało?", "Чем выделялись?"),
} satisfies Record<string, Txt>;

const CARDS: CompareCard[] = [
  {
    id: "kat",
    icon: "⛪",
    name: r("katolicy", "католики"),
    rows: [
      {
        label: T.who,
        value: r("większość mieszkańców Korony, król i większość senatorów", "большинство жителей Короны, король и большинство сенаторов"),
      },
      {
        label: T.where,
        value: r("cała Polska, zwłaszcza wsie i małe miasta", "вся Польша, особенно деревни и малые города"),
      },
      {
        label: T.what,
        value: r("uznawali papieża; jezuici zakładali dla nich szkoły (od 1564 roku)", "признавали папу; иезуиты открывали для них школы (с 1564 года)"),
      },
    ],
  },
  {
    id: "lut",
    icon: "📖",
    name: r("luteranie", "лютеране"),
    rows: [
      {
        label: T.who,
        value: r("mieszczanie, często pochodzenia niemieckiego", "горожане, часто немецкого происхождения"),
      },
      {
        label: T.where,
        value: r("Gdańsk, Toruń, Elbląg, Prusy Królewskie i Książęce", "Гданьск, Торунь, Эльблонг, Королевская и Герцогская Пруссия"),
      },
      {
        label: T.what,
        value: r("nauka Lutra: tylko Biblia, nabożeństwa w języku wiernych", "учение Лютера: только Библия, богослужения на языке верующих"),
      },
    ],
  },
  {
    id: "kal",
    icon: "🕯️",
    name: r("kalwini", "кальвинисты"),
    rows: [
      {
        label: T.who,
        value: r("szlachta, także wielcy magnaci (Radziwiłłowie)", "шляхта, в том числе крупные магнаты (Радзивиллы)"),
      },
      {
        label: T.where,
        value: r("Małopolska i Litwa", "Малая Польша и Литва"),
      },
      {
        label: T.what,
        value: r("nauka Kalwina; zbory zakładane w dworach; ugoda sandomierska 1570", "учение Кальвина; общины при усадьбах; Сандомирское соглашение 1570"),
      },
    ],
  },
  {
    id: "ari",
    icon: "🕊️",
    name: r("bracia polscy", "польские братья"),
    rows: [
      {
        label: T.who,
        value: r("część szlachty i mieszczan, zwani arianami", "часть шляхты и горожан, называемые арианами"),
      },
      {
        label: T.where,
        value: r("Raków w Małopolsce — akademia i drukarnia", "Ракув в Малой Польше — академия и типография"),
      },
      {
        label: T.what,
        value: r("odrzucali Trójcę Świętą, potępiali wojnę i pańszczyznę; wygnani w 1658 roku", "отвергали Святую Троицу, осуждали войну и барщину; изгнаны в 1658 году"),
      },
    ],
  },
  {
    id: "pra",
    icon: "☦️",
    name: r("prawosławni", "православные"),
    rows: [
      {
        label: T.who,
        value: r("Rusini: chłopi, mieszczanie i część szlachty", "русины: крестьяне, горожане и часть шляхты"),
      },
      {
        label: T.where,
        value: r("wschód Rzeczypospolitej: Litwa, Wołyń, Kijowszczyzna", "восток Речи Посполитой: Литва, Волынь, Киевщина"),
      },
      {
        label: T.what,
        value: r("obrządek wschodni; po unii brzeskiej 1596 część z nich została grekokatolikami", "восточный обряд; после Брестской унии 1596 часть из них стала грекокатоликами"),
      },
    ],
  },
  {
    id: "zyd",
    icon: "✡️",
    name: r("Żydzi", "евреи"),
    rows: [
      {
        label: T.who,
        value: r("kupcy, rzemieślnicy, dzierżawcy", "купцы, ремесленники, арендаторы"),
      },
      {
        label: T.where,
        value: r("miasta i miasteczka w całym kraju", "города и местечки по всей стране"),
      },
      {
        label: T.what,
        value: r("własny samorząd (kahały) i sądy; największa społeczność żydowska w Europie", "собственное самоуправление (кагалы) и суды; крупнейшая еврейская община в Европе"),
      },
    ],
  },
];

const OPTIONS: QuizOption[] = [
  {
    id: "konf",
    label: r("konfederacja warszawska", "Варшавская конфедерация"),
  },
  { id: "brzesc", label: r("unia brzeska", "Брестская уния") },
  { id: "arianie", label: r("bracia polscy", "польские братья") },
  { id: "stosy", label: r("państwo bez stosów", "государство без костров") },
  { id: "unici", label: r("grekokatolicy", "грекокатолики") },
  { id: "sand", label: r("ugoda sandomierska", "Сандомирское соглашение") },
];

const QUIZ: QuizItem[] = [
  {
    icon: "📜",
    name: r("uchwała szlachty z 1573 roku gwarantująca pokój między wyznaniami", "постановление шляхты 1573 года, гарантирующее мир между исповеданиями"),
    answer: "konf",
    explain: r(
      "Konfederację warszawską uchwalono w bezkrólewiu, by żaden król nie mógł prześladować innowierców.",
      "Варшавскую конфедерацию приняли в бескоролевье, чтобы ни один король не мог преследовать иноверцев.",
    ),
  },
  {
    icon: "🤝",
    name: r("porozumienie z 1596 roku, w którym część prawosławnych uznała papieża", "соглашение 1596 года, по которому часть православных признала папу"),
    answer: "brzesc",
    explain: r("Unia brzeska połączyła część Cerkwi prawosławnej z Kościołem katolickim.", "Брестская уния соединила часть православной церкви с католической."),
  },
  {
    icon: "🕊️",
    name: r("najbardziej radykalny odłam reformacji, odrzucający Trójcę Świętą", "самое радикальное течение Реформации, отвергающее Святую Троицу"),
    answer: "arianie",
    explain: r("Bracia polscy (arianie) potępiali też wojnę i pańszczyznę; ich ośrodkiem był Raków.", "Польские братья (ариане) осуждали также войну и барщину; их центром был Ракув."),
  },
  {
    icon: "🔥",
    name: r("określenie Rzeczypospolitej, w której nikogo nie palono za wiarę", "название Речи Посполитой, где никого не сжигали за веру"),
    answer: "stosy",
    explain: r("W XVI wieku Rzeczpospolita była „państwem bez stosów” — wyjątkiem w Europie.", "В XVI веке Речь Посполитая была «государством без костров» — исключением в Европе."),
  },
  {
    icon: "☦️",
    name: r("wierni, którzy uznali papieża, ale zachowali wschodni obrządek", "верующие, признавшие папу, но сохранившие восточный обряд"),
    answer: "unici",
    explain: r("Grekokatolików nazywano też unitami — od unii brzeskiej.", "Грекокатоликов называли также униатами — от Брестской унии."),
  },
  {
    icon: "🛡️",
    name: r("porozumienie protestantów z 1570 roku o wspólnej obronie", "соглашение протестантов 1570 года о совместной защите"),
    answer: "sand",
    explain: r(
      "Luteranie, kalwini i bracia czescy zawarli ugodę w Sandomierzu; braci polskich do niej nie dopuszczono.",
      "Лютеране, кальвинисты и чешские братья заключили соглашение в Сандомире; польских братьев к нему не допустили.",
    ),
  },
];

const FACTS: Statement[] = [
  {
    text: r("Zygmunt August powiedział innowiercom: „Nie jestem królem waszych sumień”.", "Сигизмунд Август сказал иноверцам: «Я не король ваших совестей»."),
    truth: true,
    why: r("Król nie chciał zmuszać poddanych do zmiany wiary.", "Король не хотел принуждать подданных менять веру."),
  },
  {
    text: r("W Rzeczypospolitej luteranami byli głównie szlachcice, a kalwinami mieszczanie.", "В Речи Посполитой лютеранами были в основном шляхтичи, а кальвинистами — горожане."),
    truth: false,
    why: r(
      "Odwrotnie: luteranizm przyjmowali mieszczanie (Gdańsk, Toruń), a kalwinizm — szlachta Małopolski i Litwy.",
      "Наоборот: лютеранство принимали горожане (Гданьск, Торунь), а кальвинизм — шляхта Малой Польши и Литвы.",
    ),
  },
  {
    text: r("Konfederacja warszawska zakazywała wszystkich wyznań poza katolickim.", "Варшавская конфедерация запрещала все исповедания, кроме католического."),
    truth: false,
    why: r("Przeciwnie: gwarantowała pokój między różniącymi się w wierze chrześcijanami.", "Напротив: она гарантировала мир между христианами разной веры."),
  },
  {
    text: r("Unia brzeska zjednoczyła z Kościołem katolickim wszystkich prawosławnych.", "Брестская уния соединила с католической церковью всех православных."),
    truth: false,
    why: r(
      "Tylko część biskupów i wiernych przyjęła unię; pozostali (dyzunici) zostali przy prawosławiu.",
      "Только часть епископов и верующих приняла унию; остальные (дизуниты) остались в православии.",
    ),
  },
  {
    text: r("Żydzi mieli w Rzeczypospolitej własny samorząd.", "Евреи имели в Речи Посполитой собственное самоуправление."),
    truth: true,
    why: r("Gminy żydowskie (kahały) same zarządzały swoimi sprawami i sądami.", "Еврейские общины (кагалы) сами управляли своими делами и судами."),
  },
  {
    text: r("Bracia polscy pozostali w Rzeczypospolitej aż do rozbiorów.", "Польские братья оставались в Речи Посполитой вплоть до разделов."),
    truth: false,
    why: r("W 1658 roku sejm nakazał im zmienić wyznanie albo opuścić kraj.", "В 1658 году сейм приказал им сменить веру или покинуть страну."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("jezuici przybywają do Polski", "иезуиты прибывают в Польшу"),
    when: "1564",
    note: r("biskup Hozjusz osadza ich w Braniewie", "епископ Гозий поселяет их в Бранево"),
  },
  { name: r("ugoda sandomierska", "Сандомирское соглашение"), when: "1570" },
  {
    name: r("konfederacja warszawska", "Варшавская конфедерация"),
    when: "1573",
    note: r("pokój między wyznaniami zapisany w prawie", "мир между исповеданиями закреплён законом"),
  },
  {
    name: r("unia brzeska", "Брестская уния"),
    when: "1596",
    note: r("powstaje Kościół grekokatolicki", "возникает грекокатолическая церковь"),
  },
  {
    name: r("wygnanie braci polskich", "изгнание польских братьев"),
    when: "1658",
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3", Txt[]> = {
  s1: [
    r(
      "Luteranie — mieszczanie (Gdańsk, Toruń); kalwini — szlachta (Małopolska, Litwa); bracia polscy — Raków.",
      "Лютеране — горожане (Гданьск, Торунь); кальвинисты — шляхта (Малая Польша, Литва); польские братья — Ракув.",
    ),
    r("Prawosławni na wschodzie, Żydzi w miastach, Tatarzy (muzułmanie) na Litwie.", "Православные на востоке, евреи в городах, татары (мусульмане) в Литве."),
  ],
  s2: [
    r("1573 — konfederacja warszawska: pokój między wyznaniami; 1596 — unia brzeska: grekokatolicy.", "1573 — Варшавская конфедерация: мир между исповеданиями; 1596 — Брестская уния: грекокатолики."),
    r("Rzeczpospolita XVI wieku — „państwo bez stosów”.", "Речь Посполитая XVI века — «государство без костров»."),
  ],
  s3: [
    r("Zygmunt August: „Nie jestem królem sumień waszych”.", "Сигизмунд Август: «Я не король ваших совестей»."),
    r("Tolerancja osłabła w XVII wieku: w 1658 roku wygnano braci polskich.", "Веротерпимость ослабла в XVII веке: в 1658 году изгнали польских братьев."),
  ],
};

export default function ToleranceLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="tolerance" sections={[T.s1, T.s2, T.s3, T.s4]} />

      <Section id="tolerance-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={CARDS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="tolerance-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.quiz} question={T.quizQ} options={OPTIONS} items={QUIZ} wrongHint={T.quizWrong} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="tolerance-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="tolerance-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
