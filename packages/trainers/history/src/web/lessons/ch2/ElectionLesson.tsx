// Lesson for §10 "Bezkrólewie i wolna elekcja" (Historia 6, GWO). Terms and dates follow the task
// bank of the same paragraph (templates/data/ch2.ts, ELECTION and ELECTION_DATES).
import {
  CompareTabs,
  LessonIntro,
  MatchQuiz,
  OrderGame,
  Remember,
  Section,
  Timeline,
  type CompareCard,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { ElectionField } from "./ElectionField.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "W 1572 roku zmarł bezpotomnie Zygmunt August — ostatni Jagiellon. Kto miał rządzić? Szlachta postanowiła, że króla będzie wybierać sama, i to każdy szlachcic osobiście. Tak narodziła się wolna elekcja, a pierwszym wybranym królem został Francuz, Henryk Walezy.",
    "В 1572 году бездетным умер Сигизмунд Август — последний Ягеллон. Кто должен был править? Шляхта решила, что будет выбирать короля сама, причём каждый шляхтич лично. Так родилась свободная элекция, а первым выборным королём стал француз Генрих Валуа.",
  ),
  s1: r("Kto rządzi, gdy nie ma króla?", "Кто правит, когда нет короля?"),
  s1intro: r("Nowe słowa z czasów bezkrólewia. Dopasuj opis do pojęcia.", "Новые слова времён бескоролевья. Подбери описание к понятию."),
  s2: r("Jak wybierano króla?", "Как выбирали короля?"),
  s2intro: r("Ułóż kroki wolnej elekcji w kolejności — od śmierci króla do koronacji następcy.", "Расставь шаги свободной элекции по порядку — от смерти короля до коронации преемника."),
  s3: r("Artykuły henrykowskie i pacta conventa", "Генриховы артикулы и pacta conventa"),
  s3intro: r("Każdy król elekcyjny musiał zaprzysiąc dwa dokumenty. Porównaj je.", "Каждый выборный король должен был присягнуть двум документам. Сравни их."),
  s4: r("Pole elekcyjne", "Элекционное поле"),
  s4intro: r(
    "Tak wyglądało pole pod Warszawą w dniu elekcji. Dotknij jego części, a potem podpisz je sam.",
    "Так выглядело поле под Варшавой в день элекции. Нажми на его части, а потом подпиши их сам.",
  ),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Pierwsze bezkrólewia: ułóż wydarzenia w kolejności.", "Первые бескоролевья: расставь события по порядку."),
  quiz: r("Słownik bezkrólewia", "Словарь бескоролевья"),
  quizQ: r("Jak nazywa się:", "Как называется:"),
  quizWrong: r("to inne pojęcie. Spróbuj jeszcze raz.", "это другое понятие. Попробуй ещё раз."),
  order: r("Kroki wolnej elekcji", "Шаги свободной элекции"),
  orderHint: r("Trzy sejmy: konwokacyjny, elekcyjny, koronacyjny.", "Три сейма: конвокационный, элекционный, коронационный."),
  start: r("śmierć króla", "смерть короля"),
  timeline: r("Od śmierci Zygmunta Augusta do wyboru Batorego", "От смерти Сигизмунда Августа до избрания Батория"),
  what: r("co to jest", "что это"),
  forWhom: r("kogo obowiązuje", "кого обязывает"),
  content: r("treść", "содержание"),
  change: r("czy się zmienia", "меняется ли"),
} satisfies Record<string, Txt>;

const OPTIONS: QuizOption[] = [
  { id: "bezkr", label: r("bezkrólewie", "бескоролевье") },
  { id: "interrex", label: r("interrex", "интеррекс") },
  { id: "viritim", label: r("elekcja viritim", "элекция viritim") },
  { id: "pole", label: r("pole elekcyjne", "элекционное поле") },
  { id: "demo", label: r("demokracja szlachecka", "шляхетская демократия") },
  { id: "rokosz", label: r("rokosz", "рокош") },
];

const QUIZ: QuizItem[] = [
  {
    icon: "⏳",
    name: r("czas między śmiercią króla a koronacją następcy", "время между смертью короля и коронацией преемника"),
    answer: "bezkr",
    explain: r("Pierwsze bezkrólewie trwało od lipca 1572 do lutego 1574 roku.", "Первое бескоролевье длилось с июля 1572 до февраля 1574 года."),
  },
  {
    icon: "⛪",
    name: r("prymas zastępujący króla w czasie bezkrólewia", "примас, замещающий короля во время бескоролевья"),
    answer: "interrex",
    explain: r("Pierwszym interreksem był prymas Jakub Uchański.", "Первым интеррексом был примас Якуб Уханьский."),
  },
  {
    icon: "🙋",
    name: r("zasada, że każdy szlachcic może osobiście głosować na króla", "принцип, по которому каждый шляхтич может лично голосовать за короля"),
    answer: "viritim",
    explain: r("Viritim znaczy po łacinie „mąż w męża”, czyli każdy osobiście.", "Viritim по-латыни значит «муж за мужем», то есть каждый лично."),
  },
  {
    icon: "⛺",
    name: r("błonia pod Warszawą, gdzie szlachta zjeżdżała się wybierać króla", "луга под Варшавой, куда съезжалась шляхта выбирать короля"),
    answer: "pole",
    explain: r("W 1573 roku elekcja odbyła się we wsi Kamień, później na Woli.", "В 1573 году элекция прошла в деревне Камень, позже — на Воле."),
  },
  {
    icon: "🏛️",
    name: r("ustrój, w którym szlachta rządzi przez sejm i wybiera króla", "устройство, при котором шляхта правит через сейм и выбирает короля"),
    answer: "demo",
    explain: r("W demokracji szlacheckiej prawa polityczne miał tylko jeden stan — szlachta.", "В шляхетской демократии политические права имело только одно сословие — шляхта."),
  },
  {
    icon: "✊",
    name: r("prawo wypowiedzenia posłuszeństwa królowi łamiącemu prawo", "право отказать в повиновении королю, нарушающему закон"),
    answer: "rokosz",
    explain: r("Artykuły henrykowskie pozwalały szlachcie na rokosz, gdy król ich nie przestrzegał.", "Генриховы артикулы позволяли шляхте рокош, если король их не соблюдал."),
  },
];

const STEPS: Txt[] = [
  r("prymas zostaje interreksem", "примас становится интеррексом"),
  r("sejm konwokacyjny ustala zasady wyboru", "конвокационный сейм устанавливает правила выбора"),
  r("szlachta zjeżdża na pole elekcyjne pod Warszawą", "шляхта съезжается на элекционное поле под Варшавой"),
  r("posłowie kandydatów składają obietnice", "послы кандидатов дают обещания"),
  r("głosowanie viritim i ogłoszenie wyboru przez prymasa", "голосование viritim и объявление выбора примасом"),
  r("elekt zaprzysięga artykuły henrykowskie i pacta conventa", "избранник присягает Генриховым артикулам и pacta conventa"),
  r("sejm koronacyjny w Krakowie — koronacja", "коронационный сейм в Кракове — коронация"),
];

const CARDS: CompareCard[] = [
  {
    id: "art",
    icon: "📜",
    name: r("artykuły henrykowskie", "Генриховы артикулы"),
    rows: [
      {
        label: T.what,
        value: r("zbiór stałych zasad ustroju Rzeczypospolitej", "свод постоянных основ устройства Речи Посполитой"),
      },
      {
        label: T.forWhom,
        value: r("każdego króla elekcyjnego, zawsze te same", "каждого выборного короля, всегда одни и те же"),
      },
      {
        label: T.content,
        value: r(
          "wolna elekcja, sejm co dwa lata, tolerancja religijna (konfederacja warszawska), bez zgody sejmu król nie wypowie wojny ani nie nałoży podatków; prawo do rokoszu",
          "свободная элекция, сейм раз в два года, веротерпимость (Варшавская конфедерация), без согласия сейма король не объявит войну и не введёт налоги; право на рокош",
        ),
      },
      {
        label: T.change,
        value: r("nie — obowiązywały do końca Rzeczypospolitej", "нет — действовали до конца Речи Посполитой"),
      },
    ],
    text: r("Nazwa pochodzi od Henryka Walezego, który pierwszy je zaprzysiągł w 1573 roku.", "Название происходит от Генриха Валуа, который первым присягнул им в 1573 году."),
  },
  {
    id: "pacta",
    icon: "✍️",
    name: r("pacta conventa", "pacta conventa"),
    rows: [
      {
        label: T.what,
        value: r("osobista umowa między wybranym królem a szlachtą", "личный договор между избранным королём и шляхтой"),
      },
      {
        label: T.forWhom,
        value: r("tylko tego jednego króla, który je podpisał", "только того одного короля, который их подписал"),
      },
      {
        label: T.content,
        value: r(
          "obietnice kandydata: Walezy obiecał m.in. spłacić długi, sprowadzić francuskich żołnierzy, kształcić polską młodzież w Paryżu",
          "обещания кандидата: Валуа обещал, среди прочего, выплатить долги, привести французских солдат, обучать польскую молодёжь в Париже",
        ),
      },
      {
        label: T.change,
        value: r("tak — spisywane na nowo przy każdej elekcji", "да — составлялись заново при каждой элекции"),
      },
    ],
    text: r("Po łacinie „warunki uzgodnione”. Kandydat targował się o nie z posłami szlachty.", "По-латыни «согласованные условия». Кандидат торговался о них с послами шляхты."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("bezpotomna śmierć Zygmunta Augusta", "бездетная смерть Сигизмунда Августа"),
    when: "1572",
    note: r("koniec Jagiellonów, pierwsze bezkrólewie", "конец Ягеллонов, первое бескоролевье"),
  },
  {
    name: r("pierwsza wolna elekcja — Henryk Walezy", "первая свободная элекция — Генрих Валуа"),
    when: "1573",
    note: r("artykuły henrykowskie i pacta conventa", "Генриховы артикулы и pacta conventa"),
  },
  {
    name: r("ucieczka Walezego do Francji", "бегство Валуа во Францию"),
    when: "1574",
  },
  {
    name: r("elekcja Anny Jagiellonki i Stefana Batorego", "избрание Анны Ягеллонки и Стефана Батория"),
    when: "1575",
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("1572 — śmierć Zygmunta Augusta, koniec Jagiellonów; interrex = prymas (Jakub Uchański).", "1572 — смерть Сигизмунда Августа, конец Ягеллонов; интеррекс = примас (Якуб Уханьский)."),
    r("Wolna elekcja viritim — każdy szlachcic głosuje osobiście na polu pod Warszawą.", "Свободная элекция viritim — каждый шляхтич голосует лично на поле под Варшавой."),
  ],
  s2: [
    r(
      "Trzy sejmy bezkrólewia: konwokacyjny (zasady) → elekcyjny (wybór) → koronacyjny (koronacja w Krakowie).",
      "Три сейма бескоролевья: конвокационный (правила) → элекционный (выбор) → коронационный (коронация в Кракове).",
    ),
  ],
  s3: [
    r("Artykuły henrykowskie — stałe, dla każdego króla; pacta conventa — osobiste, dla jednego.", "Генриховы артикулы — постоянные, для каждого короля; pacta conventa — личные, для одного."),
    r("Henryk Walezy (1573) uciekł do Francji w 1574 roku, by objąć tam tron po bracie.", "Генрих Валуа (1573) бежал во Францию в 1574 году, чтобы занять там трон после брата."),
  ],
  s4: [
    r("Pole elekcyjne: szopa senatorska w środku, koło rycerskie wokół, szlachta według województw.", "Элекционное поле: сенаторский шалаш в центре, рыцарский круг вокруг, шляхта по воеводствам."),
  ],
};

export default function ElectionLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="election" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="election-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.quiz} question={T.quizQ} options={OPTIONS} items={QUIZ} wrongHint={T.quizWrong} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="election-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} start={T.start} steps={STEPS} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="election-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={CARDS} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="election-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <ElectionField lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="election-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
