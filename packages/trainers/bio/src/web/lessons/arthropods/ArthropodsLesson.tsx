// Lesson for §3.1 "Cechy stawonogów" (Puls życia 6). Terms follow
// templates/data/sp6Invertebrates.ts (ARTHROPOD_FEATURES).
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import { CompareTabs, MatchQuiz, type CompareCard, type QuizItem, type QuizOption } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";
import { Molting } from "./Molting.tsx";

const T = {
  lead: {
    pl: "Stawonogi to największa grupa zwierząt — należą do nich owady, skorupiaki i pajęczaki. Ich nazwa pochodzi od odnóży zbudowanych z ruchomo połączonych odcinków, czyli odnóży członowanych. Całe ciało okrywa twardy pancerz z chityny.",
    ru: "Членистоногие — самая большая группа животных: к ним относятся насекомые, ракообразные и паукообразные. Название дано по ногам, состоящим из подвижно соединённых члеников, — членистым конечностям. Всё тело покрыто твёрдым хитиновым панцирем.",
  },
  s1: { pl: "Pancerz i linienie", ru: "Панцирь и линька" },
  s1intro: {
    pl: "Jak rosnąć w zbroi, która się nie rozciąga? Sprawdź.",
    ru: "Как расти в доспехах, которые не растягиваются? Проверь.",
  },
  s2: { pl: "Trzy grupy stawonogów", ru: "Три группы членистоногих" },
  s2intro: {
    pl: "Wszystkie stawonogi mają odnóża członowane i pancerz, ale różnią się budową ciała. Porównaj je.",
    ru: "У всех членистоногих членистые ноги и панцирь, но строение тела у них разное. Сравни их.",
  },
  s3: { pl: "Do której grupy?", ru: "К какой группе?" },
  s3intro: { pl: "Przypisz zwierzę do właściwej grupy stawonogów.", ru: "Отнеси животное к нужной группе членистоногих." },
  s4: { pl: "Otwarty układ krwionośny", ru: "Незамкнутая кровеносная система" },
  s4intro: {
    pl: "Porównaj krwiobieg stawonoga i dżdżownicy.",
    ru: "Сравни кровообращение членистоногого и дождевого червя.",
  },
} satisfies Record<string, Txt>;

const r = (pl: string, ru: string): Txt => ({ pl, ru });
const L = {
  body: r("Podział ciała", "Отделы тела"),
  legs: r("Odnóża kroczne", "Ходильные ноги"),
  antennae: r("Czułki", "Усики"),
  breath: r("Oddychanie", "Дыхание"),
  home: r("Gdzie żyją", "Где живут"),
  who: r("Przykłady", "Примеры"),
};

const GROUPS: CompareCard[] = [
  {
    id: "insects",
    icon: "🐝",
    name: r("Owady", "Насекомые"),
    rows: [
      { label: L.body, value: r("głowa, tułów, odwłok", "голова, грудь, брюшко") },
      { label: L.legs, value: r("3 pary", "3 пары") },
      { label: L.antennae, value: r("1 para", "1 пара") },
      { label: L.breath, value: r("tchawki", "трахеи") },
      { label: L.home, value: r("głównie ląd i powietrze", "в основном суша и воздух") },
      { label: L.who, value: r("pszczoła, motyl, mrówka, komar", "пчела, бабочка, муравей, комар") },
    ],
    text: r("Jedyne bezkręgowce, które potrafią latać — większość ma dwie pary skrzydeł.", "Единственные беспозвоночные, умеющие летать, — у большинства две пары крыльев."),
  },
  {
    id: "crustaceans",
    icon: "🦞",
    name: r("Skorupiaki", "Ракообразные"),
    rows: [
      { label: L.body, value: r("głowotułów, odwłok", "головогрудь, брюшко") },
      { label: L.legs, value: r("5 par i więcej (pierwsza to często szczypce)", "5 пар и больше (первая часто клешни)") },
      { label: L.antennae, value: r("2 pary", "2 пары") },
      { label: L.breath, value: r("skrzela", "жабры") },
      { label: L.home, value: r("głównie woda", "в основном вода") },
      { label: L.who, value: r("rak, krab, krewetka, prosionek", "рак, краб, креветка, мокрица") },
    ],
    text: r("Pancerz skorupiaków wzmacniają sole wapnia — dlatego jest tak twardy.", "Панцирь ракообразных укреплён солями кальция — поэтому он такой твёрдый."),
  },
  {
    id: "arachnids",
    icon: "🕷",
    name: r("Pajęczaki", "Паукообразные"),
    rows: [
      { label: L.body, value: r("głowotułów, odwłok", "головогрудь, брюшко") },
      { label: L.legs, value: r("4 pary", "4 пары") },
      { label: L.antennae, value: r("brak", "нет") },
      { label: L.breath, value: r("płuca lub tchawki", "лёгкие или трахеи") },
      { label: L.home, value: r("głównie ląd", "в основном суша") },
      { label: L.who, value: r("pająk krzyżak, kleszcz, skorpion", "паук-крестовик, клещ, скорпион") },
    ],
    text: r("Pierwsza para odnóży gębowych pająka — szczękoczułki — wstrzykuje jad.", "Первая пара ротовых конечностей паука — хелицеры — впрыскивает яд."),
  },
];

const GROUP_OPTIONS: QuizOption[] = [
  { id: "insects", label: r("owad", "насекомое") },
  { id: "crustaceans", label: r("skorupiak", "ракообразное") },
  { id: "arachnids", label: r("pajęczak", "паукообразное") },
];

const ANIMALS: QuizItem[] = [
  { icon: "🐞", name: r("biedronka", "божья коровка"), answer: "insects", explain: r("3 pary odnóży, 1 para czułków.", "3 пары ног, 1 пара усиков.") },
  { icon: "🦀", name: r("krab", "краб"), answer: "crustaceans", explain: r("Szczypce, 2 pary czułków, oddycha skrzelami.", "Клешни, 2 пары усиков, дышит жабрами.") },
  { icon: "🦂", name: r("skorpion", "скорпион"), answer: "arachnids", explain: r("4 pary odnóży krocznych i jadowy kolec — pajęczak.", "4 пары ходильных ног и ядовитое жало — паукообразное.") },
  { icon: "🦐", name: r("krewetka", "креветка"), answer: "crustaceans", explain: r("Morski skorupiak.", "Морское ракообразное.") },
  { icon: "🦗", name: r("konik polny", "кузнечик"), answer: "insects", explain: r("Owad z dwiema parami skrzydeł.", "Насекомое с двумя парами крыльев.") },
  { icon: "🕷", name: r("kleszcz", "клещ"), answer: "arachnids", explain: r("4 pary odnóży, brak czułków.", "4 пары ног, усиков нет.") },
  { icon: "🪨", name: r("prosionek spod kamienia", "мокрица из-под камня"), answer: "crustaceans", explain: r("Lądowy skorupiak — potrzebuje wilgoci.", "Наземное ракообразное — ему нужна влага.") },
  { icon: "🦋", name: r("motyl cytrynek", "бабочка-лимонница"), answer: "insects", explain: r("Owad z trąbką ssącą.", "Насекомое с сосущим хоботком.") },
];

const C = {
  open: r("Otwarty — stawonóg", "Незамкнутая — членистоногое"),
  closed: r("Zamknięty — dżdżownica", "Замкнутая — дождевой червь"),
  openText: r(
    "Serce w postaci rurki na grzbiecie pompuje płyn — hemolimfę — do krótkich naczyń, z których wylewa się ona do jamy ciała i obmywa narządy. Potem wraca do serca przez otworki.",
    "Сердце в виде трубки на спине гонит жидкость — гемолимфу — в короткие сосуды, из которых она изливается в полость тела и омывает органы. Потом через отверстия возвращается в сердце.",
  ),
  closedText: r(
    "Krew płynie wyłącznie w naczyniach i nigdy z nich nie wypływa. Taki układ ma dżdżownica, a także wszystkie kręgowce.",
    "Кровь течёт только по сосудам и никогда из них не изливается. Такая система у дождевого червя и у всех позвоночных.",
  ),
};

function Circulation({ lang }: { lang: BioLang }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup">
        {[true, false].map((o) => (
          <button
            key={String(o)}
            type="button"
            role="radio"
            aria-checked={open === o}
            onClick={() => setOpen(o)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              open === o ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {o ? C.open[lang] : C.closed[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 300 140" className="w-full" role="img" aria-label={open ? C.open[lang] : C.closed[lang]}>
          <rect width={300} height={140} rx={12} fill={open ? "#fef3c7" : "#fff1f2"} />
          <ellipse cx={150} cy={70} rx={130} ry={50} fill={open ? "#fde68a" : "#fecdd3"} stroke={open ? "#a16207" : "#be123c"} strokeWidth={2} />
          {open ? (
            <g>
              <rect x={80} y={30} width={140} height={12} rx={6} fill="#16a34a" />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <circle key={i} r={3.5} fill="#22c55e">
                  <animateMotion dur="3s" begin={`${i * 0.37}s`} repeatCount="indefinite" path={`M${90 + (i % 4) * 40} 42 C ${90 + (i % 4) * 40} 70, ${70 + i * 20} 90, ${60 + i * 25} 100`} />
                </circle>
              ))}
              {[110, 170, 220].map((x) => (
                <ellipse key={x} cx={x} cy={80} rx={14} ry={9} fill="#d6d3d1" stroke="#78716c" />
              ))}
            </g>
          ) : (
            <g>
              <path d="M40 54 L 260 54 M40 86 L 260 86 M44 54 C 30 62, 30 78, 44 86 M256 54 C 270 62, 270 78, 256 86" fill="none" stroke="#dc2626" strokeWidth={5} />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle key={i} r={3.5} fill="#7f1d1d">
                  <animateMotion dur="4s" begin={`${i * 0.66}s`} repeatCount="indefinite" path="M44 54 L 256 54 C 270 62, 270 78, 256 86 L 44 86 C 30 78, 30 62, 44 54 Z" />
                </circle>
              ))}
            </g>
          )}
        </svg>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          {open ? C.openText[lang] : C.closedText[lang]}
        </p>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Stawonogi mają szkielet zewnętrzny — pancerz z chityny.", ru: "У членистоногих наружный скелет — хитиновый панцирь." },
    { pl: "Żeby rosnąć, muszą linieć, czyli zrzucać stary pancerz.", ru: "Чтобы расти, им приходится линять — сбрасывать старый панцирь." },
  ],
  s2: [
    { pl: "Owady: 3 pary odnóży, 1 para czułków. Skorupiaki: 5+ par odnóży, 2 pary czułków. Pajęczaki: 4 pary odnóży, brak czułków.", ru: "Насекомые: 3 пары ног, 1 пара усиков. Ракообразные: 5+ пар ног, 2 пары усиков. Паукообразные: 4 пары ног, усиков нет." },
    { pl: "Owady oddychają tchawkami, skorupiaki — skrzelami.", ru: "Насекомые дышат трахеями, ракообразные — жабрами." },
  ],
  s3: [{ pl: "Odnóża członowane to cecha wszystkich stawonogów.", ru: "Членистые конечности — признак всех членистоногих." }],
  s4: [{ pl: "Stawonogi mają otwarty układ krwionośny: hemolimfa obmywa narządy.", ru: "У членистоногих незамкнутая кровеносная система: гемолимфа омывает органы." }],
};

export default function ArthropodsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="arthropods" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="arthropods-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <Molting lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="arthropods-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={GROUPS} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="arthropods-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={{ pl: "🧩 Kto to?", ru: "🧩 Кто это?" }}
          question={{ pl: "Do jakiej grupy należy", ru: "К какой группе относится" }}
          options={GROUP_OPTIONS}
          items={ANIMALS}
          wrongHint={{ pl: "policz pary odnóży i czułków.", ru: "посчитай пары ног и усиков." }}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="arthropods-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Circulation lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
