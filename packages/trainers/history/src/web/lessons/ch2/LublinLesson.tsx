// Lesson for §9 "Unia lubelska" (Historia 6, GWO). Terms, lands and dates follow the task bank of
// the same paragraph (templates/data/ch2.ts, LUBLIN and LUBLIN_DATES).
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
import { CommonwealthMap } from "./CommonwealthMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Od unii w Krewie (1385) Polskę i Litwę łączył tylko wspólny władca. Gdy stało się jasne, że bezdzietny Zygmunt August będzie ostatnim Jagiellonem, trzeba było związać oba państwa mocniej. W 1569 roku sejm w Lublinie utworzył Rzeczpospolitą Obojga Narodów.",
    "Со времени Кревской унии (1385) Польшу и Литву соединял только общий правитель. Когда стало ясно, что бездетный Сигизмунд Август будет последним Ягеллоном, нужно было связать оба государства крепче. В 1569 году сейм в Люблине создал Речь Посполитую Обоих Народов.",
  ),
  s1: r("Unia personalna czy realna?", "Личная или реальная уния?"),
  s1intro: r("Porównaj dwa rodzaje związku państw: ten sprzed 1569 roku i ten po unii lubelskiej.", "Сравни два вида союза государств: тот, что был до 1569 года, и тот, что после Люблинской унии."),
  s2: r("Wspólne czy osobne?", "Общее или отдельное?"),
  s2intro: r(
    "Po 1569 roku część instytucji była wspólna dla Korony i Litwy, a część każda ze stron zachowała dla siebie. Rozdziel je.",
    "После 1569 года часть учреждений была общей для Короны и Литвы, а часть каждая сторона сохранила для себя. Раздели их.",
  ),
  s3: r("Mapa Rzeczypospolitej Obojga Narodów", "Карта Речи Посполитой Обоих Народов"),
  s3intro: r("Dotknij ziem na mapie. Zwróć uwagę, które ziemie przeszły z Litwy do Korony.", "Нажимай на земли на карте. Обрати внимание, какие земли перешли из Литвы в Корону."),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Sprawdź, czy wiesz, kto chciał unii, a kto się jej bał.", "Проверь, знаешь ли ты, кто хотел унии, а кто её боялся."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Od Krewa do Lublina: ułóż wydarzenia w kolejności.", "От Крево до Люблина: расставь события по порядку."),
  sort: r("Po unii lubelskiej: wspólne czy osobne?", "После Люблинской унии: общее или отдельное?"),
  sortHint: r(
    "Unia realna: wspólne to, co łączy państwo na zewnątrz; osobne to, co działa wewnątrz.",
    "Реальная уния: общее — то, что связывает государство снаружи; отдельное — то, что действует внутри.",
  ),
  shared: r("wspólne", "общее"),
  separate: r("osobne", "отдельное"),
  tf: r("Kto chciał unii?", "Кто хотел унии?"),
  timeline: r("Polska i Litwa rok po roku", "Польша и Литва год за годом"),
  king: r("władca", "правитель"),
  parliament: r("sejm", "сейм"),
  army: r("wojsko i skarb", "войско и казна"),
  example: r("przykład", "пример"),
} satisfies Record<string, Txt>;

const CARDS: CompareCard[] = [
  {
    id: "pers",
    icon: "🤝",
    name: r("unia personalna", "личная уния"),
    rows: [
      {
        label: T.king,
        value: r("wspólny: ten sam człowiek jest królem Polski i wielkim księciem Litwy", "общий: один и тот же человек — король Польши и великий князь Литвы"),
      },
      {
        label: T.parliament,
        value: r("osobne sejmy w każdym państwie", "отдельные сеймы в каждом государстве"),
      },
      {
        label: T.army,
        value: r("osobne wojska, skarby, urzędy i prawa", "отдельные войска, казна, должности и законы"),
      },
      {
        label: T.example,
        value: r("Polska i Litwa od unii w Krewie (1385) do 1569 roku", "Польша и Литва от Кревской унии (1385) до 1569 года"),
      },
    ],
    text: r(
      "Związek trwa tak długo, jak długo żyje wspólna dynastia. Gdy Jagiellonowie wygasną, Litwa może wybrać sobie innego władcę.",
      "Союз длится, пока живёт общая династия. Когда Ягеллоны угаснут, Литва может выбрать себе другого правителя.",
    ),
  },
  {
    id: "real",
    icon: "🔗",
    name: r("unia realna", "реальная уния"),
    rows: [
      {
        label: T.king,
        value: r("wspólny, wybierany razem przez szlachtę obu narodów", "общий, избираемый вместе шляхтой обоих народов"),
      },
      {
        label: T.parliament,
        value: r("jeden wspólny sejm walny, w Warszawie", "один общий вальный сейм, в Варшаве"),
      },
      {
        label: T.army,
        value: r("osobne wojska, skarby i urzędy; wspólna moneta i polityka zagraniczna", "отдельные войска, казна и должности; общая монета и внешняя политика"),
      },
      {
        label: T.example,
        value: r("Rzeczpospolita Obojga Narodów od unii lubelskiej 1569", "Речь Посполитая Обоих Народов с Люблинской унии 1569"),
      },
    ],
    text: r("Związek nie zależy od dynastii: dwa narody tworzą jedno państwo i razem wybierają króla.", "Союз не зависит от династии: два народа образуют одно государство и вместе выбирают короля."),
  },
];

const SORT: SortItem[] = [
  {
    name: r("król (wybierany wspólnie)", "король (избираемый совместно)"),
    group: 0,
    why: r("jeden władca dla Korony i Litwy", "один правитель для Короны и Литвы"),
  },
  {
    name: r("sejm walny w Warszawie", "вальный сейм в Варшаве"),
    group: 0,
    why: r("posłowie polscy i litewscy obradowali razem", "польские и литовские послы заседали вместе"),
  },
  {
    name: r("moneta", "монета"),
    group: 0,
    why: r("wspólny pieniądz ułatwiał handel", "общие деньги облегчали торговлю"),
  },
  {
    name: r("polityka zagraniczna", "внешняя политика"),
    group: 0,
    why: r("wojny i traktaty zawierano wspólnie", "войны и договоры заключали вместе"),
  },
  {
    name: r("wojsko", "войско"),
    group: 1,
    why: r("Korona i Litwa miały własne armie i hetmanów", "Корона и Литва имели собственные армии и гетманов"),
  },
  {
    name: r("skarb", "казна"),
    group: 1,
    why: r("każda strona zbierała własne podatki", "каждая сторона собирала свои налоги"),
  },
  {
    name: r("urzędy (kanclerz, marszałek…)", "должности (канцлер, маршалок…)"),
    group: 1,
    why: r("osobny kanclerz koronny i litewski", "отдельный коронный и литовский канцлер"),
  },
  {
    name: r("prawo i sądy", "право и суды"),
    group: 1,
    why: r("na Litwie obowiązywał Statut litewski", "в Литве действовал Литовский статут"),
  },
];

const FACTS: Statement[] = [
  {
    text: r(
      "Zygmunt August dążył do unii, bo nie miał dzieci i bał się, że po jego śmierci Litwa oderwie się od Polski.",
      "Сигизмунд Август добивался унии, потому что не имел детей и боялся, что после его смерти Литва отделится от Польши.",
    ),
    truth: true,
    why: r("Unia realna miała przetrwać koniec dynastii Jagiellonów.", "Реальная уния должна была пережить конец династии Ягеллонов."),
  },
  {
    text: r("Litewscy magnaci z Radziwiłłem Rudym na czele byli najgorętszymi zwolennikami unii.", "Литовские магнаты во главе с Радзивиллом Рыжим были самыми горячими сторонниками унии."),
    truth: false,
    why: r(
      "Przeciwnie: bali się utraty wpływów i opuścili obrady w Lublinie. Unii chciała za to drobna szlachta litewska.",
      "Напротив: они боялись потерять влияние и покинули заседания в Люблине. Унии же хотела мелкая литовская шляхта.",
    ),
  },
  {
    text: r("Po unii lubelskiej Litwa zachowała własne wojsko i skarb.", "После Люблинской унии Литва сохранила собственное войско и казну."),
    truth: true,
    why: r("Wspólne były król, sejm, moneta i polityka zagraniczna.", "Общими были король, сейм, монета и внешняя политика."),
  },
  {
    text: r("Kijów po 1569 roku należał do Wielkiego Księstwa Litewskiego.", "Киев после 1569 года принадлежал Великому княжеству Литовскому."),
    truth: false,
    why: r("Kijowszczyznę, Wołyń i Podlasie przyłączono do Korony.", "Киевщину, Волынь и Подляшье присоединили к Короне."),
  },
  {
    text: r("Obraz „Unia lubelska” namalował naoczny świadek wydarzeń z 1569 roku.", "Картину «Люблинская уния» написал очевидец событий 1569 года."),
    truth: false,
    why: r("Jan Matejko namalował go trzysta lat później, w 1869 roku, na trzechsetlecie unii.", "Ян Матейко написал её триста лет спустя, в 1869 году, к трёхсотлетию унии."),
  },
  {
    text: r("Nazwa „Rzeczpospolita Obojga Narodów” oznacza państwo Polaków i Litwinów.", "Название «Речь Посполитая Обоих Народов» означает государство поляков и литовцев."),
    truth: true,
    why: r("Oba narody miały równe prawa w jednym państwie.", "Оба народа имели равные права в одном государстве."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("unia w Krewie", "Кревская уния"),
    when: "1385",
    note: r("Jagiełło królem Polski — początek unii personalnej", "Ягайло — король Польши: начало личной унии"),
  },
  {
    name: r("unia w Horodle", "Городельская уния"),
    when: "1413",
    note: r("litewscy bojarzy przyjęci do polskich herbów", "литовские бояре приняты в польские гербы"),
  },
  {
    name: r("Kazimierz Jagiellończyk królem Polski", "Казимир Ягеллончик — король Польши"),
    when: "1447",
  },
  {
    name: r("Inflanty poddają się Zygmuntowi Augustowi", "Ливония подчиняется Сигизмунду Августу"),
    when: "1561",
  },
  {
    name: r("unia lubelska", "Люблинская уния"),
    when: "1569",
    note: r("1 lipca — Rzeczpospolita Obojga Narodów", "1 июля — Речь Посполитая Обоих Народов"),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Unia personalna (od Krewa 1385): tylko wspólny władca.", "Личная уния (с Крево 1385): только общий правитель."),
    r("Unia realna (Lublin 1569): wspólny król, sejm, moneta, polityka zagraniczna — jedno państwo.", "Реальная уния (Люблин 1569): общий король, сейм, монета, внешняя политика — одно государство."),
  ],
  s2: [
    r("Wspólne: król, sejm walny, moneta, polityka zagraniczna.", "Общее: король, вальный сейм, монета, внешняя политика."),
    r("Osobne: wojsko, skarb, urzędy, prawo i sądy.", "Отдельное: войско, казна, должности, право и суды."),
  ],
  s3: [
    r("W 1569 roku Podlasie, Wołyń i Kijowszczyzna przeszły z Litwy do Korony; Inflanty stały się wspólne.", "В 1569 году Подляшье, Волынь и Киевщина перешли из Литвы в Корону; Ливония стала общей."),
    r("Rzeczpospolita Obojga Narodów = Korona + Wielkie Księstwo Litewskie.", "Речь Посполитая Обоих Народов = Корона + Великое княжество Литовское."),
  ],
  s4: [
    r(
      "Za unią: Zygmunt August, szlachta polska i drobna szlachta litewska. Przeciw: magnaci litewscy (Radziwiłł Rudy).",
      "За унию: Сигизмунд Август, польская шляхта и мелкая литовская шляхта. Против: литовские магнаты (Радзивилл Рыжий).",
    ),
    r("Obraz „Unia lubelska” — Jan Matejko, 1869.", "Картина «Люблинская уния» — Ян Матейко, 1869."),
  ],
};

export default function LublinLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="lublin" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="lublin-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={CARDS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="lublin-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.shared, T.separate]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="lublin-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <CommonwealthMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="lublin-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="lublin-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
