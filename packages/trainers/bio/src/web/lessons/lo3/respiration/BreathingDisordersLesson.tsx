// Lesson for LO3 §5.4 "Zaburzenia funkcjonowania układu oddechowego" (zakres rozszerzony). Diseases
// and their causes follow templates/data/disorders.ts (RESPIRATORY_DISORDERS).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { MatchQuiz, TwoWaySort, type QuizItem, type QuizOption, type SortItem } from "../../games.tsx";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Drogi oddechowe są stale wystawione na drobnoustroje, pyły i dym, które wdychamy razem z powietrzem. Choroby układu oddechowego mogą więc wywoływać bakterie i wirusy, alergeny, zanieczyszczenia powietrza, a także mutacje genów i nowotwory.",
    "Дыхательные пути постоянно встречаются с микробами, пылью и дымом, которые мы вдыхаем с воздухом. Поэтому болезни дыхательной системы могут вызывать бактерии и вирусы, аллергены, загрязнение воздуха, а также мутации генов и опухоли.",
  ),
  s1: r("Przyczyny chorób układu oddechowego", "Причины болезней дыхательной системы"),
  s1intro: r("Od przyczyny zależy leczenie: antybiotyk pomoże tylko przy zakażeniu bakteryjnym.", "От причины зависит лечение: антибиотик поможет только при бактериальной инфекции."),
  s2: r("Co dym tytoniowy robi z płucami", "Что табачный дым делает с лёгкими"),
  s2intro: r(
    "Przesuń suwak lat palenia (ok. paczka dziennie) i zobacz, co dzieje się z nabłonkiem oskrzeli i z pęcherzykami. Potem sprawdź, co się zmienia po rzuceniu palenia.",
    "Сдвигай ползунок стажа курения (около пачки в день) и смотри, что происходит с эпителием бронхов и с альвеолами. Потом проверь, что меняется после отказа от курения.",
  ),
  s3: r("Spirometria: astma a POChP", "Спирометрия: астма и ХОБЛ"),
  s3intro: r(
    "Pacjent robi najgłębszy wdech i jak najszybciej wydmuchuje całe powietrze. Wykres pokazuje objętość wydychanego powietrza w czasie (wyniki przykładowe).",
    "Пациент делает максимальный вдох и как можно быстрее выдыхает весь воздух. График показывает объём выдыхаемого воздуха во времени (примерные результаты).",
  ),
  s4: r("Profilaktyka", "Профилактика"),
  s4intro: r("Które nawyki chronią układ oddechowy, a które mu szkodzą?", "Какие привычки защищают дыхательную систему, а какие ей вредят?"),
} satisfies Record<string, Txt>;

// ---------- causes ----------

const KINDS: QuizOption[] = [
  { id: "bacterial", label: r("bakterie", "бактерии") },
  { id: "viral", label: r("wirusy", "вирусы") },
  { id: "allergic", label: r("nadwrażliwość (alergia)", "гиперчувствительность (аллергия)") },
  { id: "environmental", label: r("dym tytoniowy i pyły", "табачный дым и пыль") },
  { id: "cancer", label: r("nowotwór", "опухоль") },
  { id: "genetic", label: r("mutacja genu", "мутация гена") },
];

const DISEASES: QuizItem[] = [
  {
    icon: "🫁",
    name: r("gruźlica", "туберкулёз"),
    answer: "bacterial",
    explain: r(
      "Wywołują ją prątki gruźlicy przenoszone drogą kropelkową. Objawy: długotrwały kaszel, czasem z krwią, stany podgorączkowe, nocne poty i chudnięcie. Chroni przed nią szczepionka BCG.",
      "Вызывают туберкулёзные палочки, передающиеся воздушно-капельным путём. Симптомы: длительный кашель, иногда с кровью, субфебрильная температура, ночной пот и похудение. Защищает вакцина БЦЖ.",
    ),
  },
  {
    icon: "🤒",
    name: r("grypa", "грипп"),
    answer: "viral",
    explain: r(
      "Wirus grypy szerzy się drogą kropelkową. Objawy: nagła wysoka gorączka, bóle mięśni i głowy, suchy kaszel. Antybiotyki na wirusy nie działają.",
      "Вирус гриппа передаётся воздушно-капельным путём. Симптомы: внезапная высокая температура, ломота в мышцах, головная боль, сухой кашель. Антибиотики на вирусы не действуют.",
    ),
  },
  {
    icon: "🌼",
    name: r("astma oskrzelowa", "бронхиальная астма"),
    answer: "allergic",
    explain: r(
      "To przewlekły stan zapalny i nadwrażliwość oskrzeli, najczęściej na alergeny. W czasie napadu oskrzela kurczą się, puchną i wypełniają śluzem — pojawia się duszność ze świszczącym oddechem.",
      "Это хроническое воспаление и повышенная чувствительность бронхов, чаще всего к аллергенам. Во время приступа бронхи сужаются, отекают и заполняются слизью — возникает удушье со свистящим дыханием.",
    ),
  },
  {
    icon: "🚬",
    name: r("przewlekła obturacyjna choroba płuc (POChP)", "хроническая обструктивная болезнь лёгких (ХОБЛ)"),
    answer: "environmental",
    explain: r(
      "Powstaje po wieloletnim wdychaniu dymu tytoniowego i zanieczyszczeń, które niszczą oskrzeliki i pęcherzyki. Objawy: postępująca duszność i przewlekły kaszel z odkrztuszaniem.",
      "Развивается после многолетнего вдыхания табачного дыма и загрязнений, разрушающих бронхиолы и альвеолы. Симптомы: нарастающая одышка и хронический кашель с мокротой.",
    ),
  },
  {
    icon: "🦠",
    name: r("pneumokokowe zapalenie płuc", "пневмококковая пневмония"),
    answer: "bacterial",
    explain: r(
      "Bakterie (pneumokoki) zakażają pęcherzyki płucne, które wypełniają się płynem. Objawy: wysoka gorączka, kaszel z odkrztuszaniem, duszność i ból w klatce piersiowej.",
      "Бактерии (пневмококки) поражают альвеолы, которые заполняются жидкостью. Симптомы: высокая температура, кашель с мокротой, одышка и боль в груди.",
    ),
  },
  {
    icon: "⛏️",
    name: r("pylica płuc", "пневмокониоз"),
    answer: "environmental",
    explain: r(
      "Wywołuje ją długotrwałe wdychanie pyłów w miejscu pracy, np. w kopalni. Tkanka płucna włóknieje, a duszność narasta.",
      "Вызывается длительным вдыханием пыли на работе, например в шахте. Лёгочная ткань замещается соединительной, одышка нарастает.",
    ),
  },
  {
    icon: "🧬",
    name: r("mukowiscydoza", "муковисцидоз"),
    answer: "genetic",
    explain: r(
      "Mutacja genu powoduje wydzielanie gęstego, lepkiego śluzu, który zatyka oskrzela i przewody trzustki. Objawy od dzieciństwa: przewlekły kaszel, nawracające zapalenia płuc i zaburzenia trawienia.",
      "Мутация гена приводит к выделению густой вязкой слизи, закупоривающей бронхи и протоки поджелудочной железы. Симптомы с детства: хронический кашель, повторяющиеся пневмонии и нарушения пищеварения.",
    ),
  },
  {
    icon: "😷",
    name: r("COVID-19", "COVID-19"),
    answer: "viral",
    explain: r("Wywołuje go koronawirus SARS-CoV-2 szerzący się drogą kropelkową. Objawy: gorączka, kaszel, duszność, utrata węchu i smaku.", "Вызывает коронавирус SARS-CoV-2, передающийся воздушно-капельным путём. Симптомы: температура, кашель, одышка, потеря обоняния и вкуса."),
  },
  {
    icon: "🎗️",
    name: r("rak płuca", "рак лёгкого"),
    answer: "cancer",
    explain: r(
      "To niekontrolowane podziały komórek nabłonka oskrzeli, głównie wskutek palenia tytoniu. Objawy: przewlekły kaszel, krwioplucie i chudnięcie bez gorączki.",
      "Это неконтролируемое деление клеток эпителия бронхов, главным образом из-за курения. Симптомы: хронический кашель, кровохарканье и похудение без температуры.",
    ),
  },
  {
    icon: "🔴",
    name: r("angina", "ангина"),
    answer: "bacterial",
    explain: r("Paciorkowce zakażają migdałki podniebienne. Objawy: silny ból gardła, gorączka i powiększone migdałki z białym nalotem.", "Стрептококки поражают нёбные миндалины. Симптомы: сильная боль в горле, температура и увеличенные миндалины с белым налётом."),
  },
];

// ---------- smoking ----------

/** clusters of alveoli, from healthy (many small) to emphysema (few large) */
const ALVEOLI: [number, number, number, number][][] = [
  [
    [215, 55, 15, 15],
    [245, 50, 15, 15],
    [275, 55, 15, 15],
    [210, 85, 15, 15],
    [245, 82, 15, 15],
    [280, 85, 15, 15],
    [220, 113, 15, 15],
    [250, 114, 15, 15],
    [278, 110, 15, 15],
  ],
  [
    [230, 52, 31, 18],
    [275, 55, 15, 15],
    [210, 85, 15, 15],
    [245, 82, 15, 15],
    [280, 85, 15, 15],
    [220, 113, 15, 15],
    [250, 114, 15, 15],
    [278, 110, 15, 15],
  ],
  [
    [230, 52, 31, 18],
    [278, 70, 16, 30],
    [228, 84, 32, 17],
    [236, 113, 31, 16],
    [280, 112, 13, 13],
  ],
  [
    [244, 60, 46, 24],
    [242, 106, 48, 23],
  ],
];

interface Level {
  word: Txt;
  tone: "ok" | "warn" | "bad";
}

const SM = {
  years: r("Lata palenia", "Стаж курения"),
  quit: r("🚭 Rzuca palenie", "🚭 Бросает курить"),
  smokes: r("🚬 Pali dalej", "🚬 Продолжает курить"),
  cilia: r("Rzęski nabłonka", "Реснички эпителия"),
  mucus: r("Śluz w oskrzelach", "Слизь в бронхах"),
  alv: r("Pęcherzyki płucne", "Альвеолы"),
  fn: r("Wydolność płuc", "Работоспособность лёгких"),
  cancer: r("Ryzyko raka płuca", "Риск рака лёгкого"),
  epi: r("nabłonek oskrzela", "эпителий бронха"),
  alvLabel: r("pęcherzyki", "альвеолы"),
};

function smokingState(years: number, quit: boolean) {
  const c = years === 0 ? 0 : years < 5 ? 1 : years < 15 ? 2 : 3;
  const a = years < 10 ? 0 : years < 20 ? 1 : years < 30 ? 2 : 3;
  const cilia: Level =
    quit && years > 0
      ? { word: r("odbudowują się w ciągu kilku miesięcy", "восстанавливаются за несколько месяцев"), tone: "ok" }
      : [
          { word: r("sprawne — przesuwają śluz ku gardłu", "работают — продвигают слизь к глотке"), tone: "ok" as const },
          { word: r("porażone, poruszają się wolniej", "парализованы, двигаются медленнее"), tone: "warn" as const },
          { word: r("częściowo zniszczone", "частично разрушены"), tone: "bad" as const },
          { word: r("w dużej części zniszczone", "в большей части разрушены"), tone: "bad" as const },
        ][c]!;
  const mucus: Level =
    years === 0 || quit
      ? { word: r("prawidłowo usuwany", "нормально удаляется"), tone: "ok" }
      : c === 1
        ? { word: r("więcej śluzu — poranny kaszel palacza", "больше слизи — утренний кашель курильщика"), tone: "warn" }
        : { word: r("zalega; częste zapalenia oskrzeli", "застаивается; частые бронхиты"), tone: "bad" };
  const alv: Level = [
    { word: r("prawidłowe", "в норме"), tone: "ok" as const },
    { word: r("pierwsze uszkodzenia ścian", "первые повреждения стенок"), tone: "warn" as const },
    { word: r("rozedma — pęcherzyki zlewają się", "эмфизема — альвеолы сливаются"), tone: "bad" as const },
    { word: r("zaawansowana rozedma", "выраженная эмфизема"), tone: "bad" as const },
  ][a]!;
  const cancerLvl = years === 0 ? 0 : years < 10 ? 1 : years < 20 ? 2 : 3;
  const cancer: Level =
    quit && years > 0
      ? { word: r("maleje z każdym rokiem bez palenia", "снижается с каждым годом без курения"), tone: "warn" }
      : [
          { word: r("niskie", "низкий"), tone: "ok" as const },
          { word: r("podwyższone", "повышен"), tone: "warn" as const },
          { word: r("wysokie", "высокий"), tone: "bad" as const },
          { word: r("bardzo wysokie", "очень высокий"), tone: "bad" as const },
        ][cancerLvl]!;
  // lost lung function does not come back; quitting only slows the decline back to the normal pace
  const fn = 100 - Math.min(55, years * 1.4);
  return { c: quit && years > 0 ? 0 : c, a, cilia, mucus, alv, cancer, fn, tar: quit ? 0 : Math.min(14, Math.round(years / 2.5)) };
}

const TONE = { ok: "bg-emerald-100 text-emerald-900", warn: "bg-amber-100 text-amber-900", bad: "bg-rose-100 text-rose-900" };

function Smoking({ lang }: { lang: BioLang }) {
  const [years, setYears] = useState(0);
  const [quit, setQuit] = useState(false);
  const s = smokingState(years, quit);
  const ciliaPerCell = [6, 6, 3, 1][s.c]!;
  const ciliaTilt = s.c === 1 ? 0 : 7;
  const mucusH = s.c === 0 || quit ? 8 : 8 + Math.min(14, years * 0.6);
  const rows: [Txt, Level][] = [
    [SM.cilia, s.cilia],
    [SM.mucus, s.mucus],
    [SM.alv, s.alv],
    [SM.cancer, s.cancer],
  ];
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <svg viewBox="0 0 320 160" className="w-full" role="img" aria-label={`${SM.years[lang]}: ${years}`}>
          <rect width={320} height={160} rx={12} fill="#f8fafc" />
          {/* mucus with trapped tar particles */}
          <rect x={14} y={78 - mucusH - 22} width={140} height={mucusH} rx={4} fill="#fef9c3" stroke="#eab308" strokeWidth={1} style={{ transition: "all .4s" }} />
          {Array.from({ length: s.tar }, (_, k) => (
            <circle key={k} cx={20 + ((k * 37) % 128)} cy={78 - 22 - mucusH / 2 + ((k * 13) % 7) - 3} r={2.2} fill="#44403c" />
          ))}
          {Array.from({ length: 5 }, (_, k) => (
            <g key={k}>
              <rect x={14 + k * 28} y={78} width={28} height={50} fill="#fde2e4" stroke="#be123c" strokeWidth={1} />
              <ellipse cx={28 + k * 28} cy={110} rx={6} ry={8} fill="#9f1239" opacity={0.7} />
              {Array.from({ length: ciliaPerCell }, (_, j) => {
                const x = 17 + k * 28 + j * (22 / Math.max(1, ciliaPerCell - 1));
                const tilt = ((j + k) % 2 ? 1 : -1) * ciliaTilt;
                return <path key={j} d={`M${x} 78 l ${s.c === 1 ? 0 : tilt} -18`} stroke="#be123c" strokeWidth={1.6} strokeLinecap="round" style={{ transition: "d .4s" }} />;
              })}
            </g>
          ))}
          <text x={84} y={146} textAnchor="middle" fontSize={10} fill="#64748b">
            {SM.epi[lang]}
          </text>
          <path d="M168 84 L 196 84" stroke="#94a3b8" strokeWidth={8} strokeLinecap="round" />
          {ALVEOLI[s.a]!.map(([cx, cy, rx, ry], k) => (
            <ellipse key={`${s.a}-${k}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="#fecdd3" stroke="#be123c" strokeWidth={1.5} />
          ))}
          <text x={245} y={150} textAnchor="middle" fontSize={10} fill="#64748b">
            {SM.alvLabel[lang]}
          </text>
        </svg>
        <label className="block text-sm font-semibold text-slate-700">
          {SM.years[lang]}: <span className="tabular-nums">{years}</span>
          <input
            type="range"
            min={0}
            max={40}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-rose-600"
            aria-valuetext={String(years)}
          />
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {[false, true].map((v) => (
            <Choice key={String(v)} state={quit === v ? "active" : "idle"} onClick={() => setQuit(v)}>
              {v ? SM.quit[lang] : SM.smokes[lang]}
            </Choice>
          ))}
        </div>
      </div>
      <div className="space-y-3" aria-live="polite">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, lvl]) => (
              <tr key={label.pl} className="border-b border-slate-200 last:border-0">
                <th scope="row" className="w-36 py-2 pr-3 text-left align-top font-medium text-slate-500">
                  {label[lang]}
                </th>
                <td className="py-2">
                  <span className={`rounded-md px-2 py-0.5 ${TONE[lvl.tone]}`}>{lvl.word[lang]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <div className="mb-1 flex justify-between text-sm text-slate-600">
            <span>{SM.fn[lang]}</span>
            <span className="tabular-nums">{num(s.fn, 0)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200" aria-hidden>
            <div className="h-full bg-sky-600 transition-all" style={{ width: `${s.fn}%` }} />
          </div>
        </div>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200">
          {years === 0
            ? lang === "pl"
              ? "Zdrowy nabłonek migawkowy: rzęski biją rytmicznie i przesuwają śluz z zatrzymanym pyłem w stronę gardła."
              : "Здоровый мерцательный эпителий: реснички ритмично бьются и продвигают слизь с задержанной пылью к глотке."
            : quit
              ? lang === "pl"
                ? "Po rzuceniu palenia w ciągu 1–2 dni z krwi znika tlenek węgla, rzęski odrastają, a kaszel słabnie; po ok. 10 latach ryzyko raka płuca spada mniej więcej o połowę. Zniszczone pęcherzyki jednak nie odrastają, a utracona wydolność nie wraca — przestaje tylko szybko spadać."
                : "После отказа от курения за 1–2 дня из крови уходит угарный газ, реснички отрастают, кашель ослабевает; примерно через 10 лет риск рака лёгкого снижается примерно вдвое. Но разрушенные альвеолы не восстанавливаются, а потерянная работоспособность лёгких не возвращается — она лишь перестаёт быстро падать."
              : lang === "pl"
                ? "Dym zawiera substancje smoliste (w tym rakotwórcze) i tlenek węgla, który wiąże się z hemoglobiną i zmniejsza transport tlenu. Wydolność płuc na wykresie to model poglądowy — u wielu palaczy spada wielokrotnie szybciej niż u niepalących."
                : "Дым содержит смолы (в том числе канцерогены) и угарный газ, который связывается с гемоглобином и уменьшает перенос кислорода. Работоспособность лёгких здесь — наглядная модель: у многих курильщиков она падает в разы быстрее, чем у некурящих."}
        </p>
      </div>
    </div>
  );
}

// ---------- spirometry ----------

type Patient = "healthy" | "asthma" | "copd";

const SPIRO: Record<Patient, { name: Txt; fvc: number; ratio: number; fvcDrug: number; ratioDrug: number; text: Txt; drugText: Txt }> = {
  healthy: {
    name: r("Osoba zdrowa", "Здоровый человек"),
    fvc: 4.6,
    ratio: 0.81,
    fvcDrug: 4.6,
    ratioDrug: 0.81,
    text: r("W pierwszej sekundzie natężonego wydechu zdrowa osoba wydmuchuje ok. 80% swojej natężonej pojemności życiowej.", "За первую секунду форсированного выдоха здоровый человек выдыхает около 80% своей форсированной жизненной ёмкости."),
    drugText: r("Lek rozszerzający oskrzela niczego nie zmienia — oskrzela są drożne.", "Бронхорасширяющее средство ничего не меняет — бронхи проходимы."),
  },
  asthma: {
    name: r("Astma (zaostrzenie)", "Астма (обострение)"),
    fvc: 4.2,
    ratio: 0.6,
    fvcDrug: 4.5,
    ratioDrug: 0.79,
    text: r(
      "Skurcz mięśni gładkich, obrzęk i śluz zwężają oskrzela — powietrze wypływa wolniej i FEV1/FVC spada poniżej 70% (obturacja).",
      "Спазм гладких мышц, отёк и слизь сужают бронхи — воздух выходит медленнее, и ОФВ1/ФЖЕЛ падает ниже 70% (обструкция).",
    ),
    drugText: r("Po leku rozszerzającym oskrzela wynik wraca prawie do normy — w astmie obturacja jest odwracalna.", "После бронхорасширяющего средства результат почти нормализуется — при астме обструкция обратима."),
  },
  copd: {
    name: r("POChP", "ХОБЛ"),
    fvc: 3.6,
    ratio: 0.52,
    fvcDrug: 3.7,
    ratioDrug: 0.55,
    text: r(
      "Oskrzeliki są trwale zwężone, a zniszczone pęcherzyki (rozedma) nie podtrzymują ich ścian — wydech jest powolny i niepełny.",
      "Бронхиолы стойко сужены, а разрушенные альвеолы (эмфизема) не поддерживают их стенки — выдох медленный и неполный.",
    ),
    drugText: r("Lek tylko nieznacznie poprawia wynik — w POChP obturacja nie jest w pełni odwracalna.", "Лекарство лишь немного улучшает результат — при ХОБЛ обструкция обратима не полностью."),
  },
};

const tx = (t: number) => 34 + t * 44;
const vy = (v: number) => 160 - v * 28;

function curve(fvc: number, ratio: number): string {
  const tau = -1 / Math.log(1 - ratio);
  const pts: string[] = [];
  for (let t = 0; t <= 6.001; t += 0.1) pts.push(`${pts.length ? "L" : "M"}${tx(t).toFixed(1)} ${vy(fvc * (1 - Math.exp(-t / tau))).toFixed(1)}`);
  return pts.join(" ");
}

function Spirometry({ lang }: { lang: BioLang }) {
  const [who, setWho] = useState<Patient>("asthma");
  const [drug, setDrug] = useState(false);
  const p = SPIRO[who];
  const fvc = drug ? p.fvcDrug : p.fvc;
  const ratio = drug ? p.ratioDrug : p.ratio;
  const fev1 = fvc * ratio;
  const obstructed = ratio < 0.7;
  const l = lang === "pl" ? "l" : "л";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(SPIRO) as Patient[]).map((k) => (
          <Choice key={k} state={who === k ? "active" : "idle"} onClick={() => setWho(k)}>
            {SPIRO[k].name[lang]}
          </Choice>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 310 190" className="w-full" role="img" aria-label={`FEV1/FVC ${Math.round(ratio * 100)}%`}>
            <rect width={310} height={190} rx={10} fill="#f8fafc" />
            {[0, 1, 2, 3, 4, 5].map((v) => (
              <g key={v}>
                <path d={`M34 ${vy(v)} L 300 ${vy(v)}`} stroke="#e2e8f0" />
                <text x={26} y={vy(v) + 3} textAnchor="end" fontSize={8} fill="#94a3b8">
                  {v}
                </text>
              </g>
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((t) => (
              <text key={t} x={tx(t)} y={174} textAnchor="middle" fontSize={8} fill="#94a3b8">
                {t}
              </text>
            ))}
            <text x={300} y={186} textAnchor="end" fontSize={8} fill="#64748b">
              {lang === "pl" ? "czas [s]" : "время [с]"}
            </text>
            <text x={6} y={12} fontSize={8} fill="#64748b">
              {lang === "pl" ? "objętość [l]" : "объём [л]"}
            </text>
            {who !== "healthy" && <path d={curve(SPIRO.healthy.fvc, SPIRO.healthy.ratio)} fill="none" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 4" />}
            <path d={curve(fvc, ratio)} fill="none" stroke={obstructed ? "#e11d48" : "#0284c7"} strokeWidth={3} strokeLinejoin="round" />
            <path d={`M${tx(1)} 160 L ${tx(1)} ${vy(fev1)} L 34 ${vy(fev1)}`} fill="none" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="3 3" />
            <circle cx={tx(1)} cy={vy(fev1)} r={4} fill="#7c3aed" />
            <text x={tx(1) + 6} y={vy(fev1) + 12} fontSize={9} fontWeight={700} fill="#6d28d9">
              FEV1
            </text>
            <path d={`M${tx(6)} ${vy(fvc)} L 300 ${vy(fvc)}`} stroke="#0f172a" strokeWidth={1} />
            <text x={300} y={vy(fvc) - 4} textAnchor="end" fontSize={9} fontWeight={700} fill="#0f172a">
              FVC
            </text>
          </svg>
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={drug} onChange={(e) => setDrug(e.target.checked)} className="h-4 w-4 accent-violet-600" />
            {lang === "pl" ? "💨 Po podaniu leku rozszerzającego oskrzela" : "💨 После бронхорасширяющего средства"}
          </label>
        </div>
        <div className="space-y-3" aria-live="polite">
          <ul className="space-y-1 text-[15px]">
            <li>
              FEV1 <span className="text-sm text-slate-500">{lang === "pl" ? "(natężona objętość wydechowa pierwszosekundowa)" : "(ОФВ1, объём форсированного выдоха за 1 секунду)"}</span>:{" "}
              <b className="tabular-nums">
                {num(fev1, 1)} {l}
              </b>
            </li>
            <li>
              FVC <span className="text-sm text-slate-500">{lang === "pl" ? "(natężona pojemność życiowa)" : "(ФЖЕЛ, форсированная жизненная ёмкость)"}</span>:{" "}
              <b className="tabular-nums">
                {num(fvc, 1)} {l}
              </b>
            </li>
            <li>
              FEV1/FVC: <b className={`tabular-nums ${obstructed ? "text-rose-700" : "text-emerald-700"}`}>{Math.round(ratio * 100)}%</b>{" "}
              <span className="text-sm text-slate-500">{obstructed ? (lang === "pl" ? "< 70% — obturacja" : "< 70% — обструкция") : lang === "pl" ? "— prawidłowo" : "— норма"}</span>
            </li>
          </ul>
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">{(drug ? p.drugText : p.text)[lang]}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- prevention ----------

const HABITS: SortItem[] = [
  { name: r("Oddychanie przez nos", "Дыхание через нос"), group: 0, why: r("Nos ogrzewa, nawilża i oczyszcza wdychane powietrze.", "Нос согревает, увлажняет и очищает вдыхаемый воздух.") },
  { name: r("Palenie e-papierosów", "Курение электронных сигарет"), group: 1, why: r("Aerozol zawiera nikotynę i substancje drażniące drogi oddechowe.", "Аэрозоль содержит никотин и вещества, раздражающие дыхательные пути.") },
  { name: r("Coroczne szczepienie przeciw grypie", "Ежегодная прививка от гриппа"), group: 0, why: r("Zmniejsza ryzyko grypy i jej powikłań, np. zapalenia płuc.", "Снижает риск гриппа и его осложнений, например пневмонии.") },
  { name: r("Przebywanie w pokoju, w którym ktoś pali", "Пребывание в комнате, где кто-то курит"), group: 1, why: r("Bierne palenie — wdychasz te same szkodliwe substancje co palacz.", "Пассивное курение — ты вдыхаешь те же вредные вещества, что и курильщик.") },
  { name: r("Regularny ruch na świeżym powietrzu", "Регулярное движение на свежем воздухе"), group: 0, why: r("Wzmacnia mięśnie oddechowe i poprawia wydolność.", "Укрепляет дыхательные мышцы и повышает выносливость.") },
  { name: r("Bieganie przy ruchliwej ulicy w dzień smogowy", "Бег вдоль оживлённой улицы в день смога"), group: 1, why: r("Drobne pyły docierają aż do pęcherzyków, a przy wysiłku wdychasz ich więcej.", "Мелкая пыль проникает до альвеол, а при нагрузке ты вдыхаешь её больше.") },
  { name: r("Praca w zapylonym pomieszczeniu bez maski", "Работа в пыльном помещении без маски"), group: 1, why: r("Długotrwałe wdychanie pyłów prowadzi do pylicy.", "Длительное вдыхание пыли ведёт к пневмокониозу.") },
  { name: r("Wietrzenie mieszkania i nawilżanie powietrza", "Проветривание и увлажнение воздуха"), group: 0, why: r("Świeże, wilgotne powietrze nie wysusza błony śluzowej dróg oddechowych.", "Свежий влажный воздух не пересушивает слизистую дыхательных путей.") },
  { name: r("Spalanie śmieci w domowym piecu", "Сжигание мусора в домашней печи"), group: 1, why: r("Powstają toksyczne gazy i pyły zanieczyszczające powietrze.", "Образуются ядовитые газы и пыль, загрязняющие воздух.") },
  { name: r("Zasłanianie ust przy kaszlu i mycie rąk", "Прикрывать рот при кашле и мыть руки"), group: 0, why: r("Ogranicza szerzenie się zakażeń przenoszonych drogą kropelkową.", "Ограничивает распространение инфекций, передающихся воздушно-капельным путём.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Antybiotyki działają tylko na bakterie — nie leczą grypy ani COVID-19.", ru: "Антибиотики действуют только на бактерии — они не лечат грипп и COVID-19." },
    { pl: "Gruźlica, angina i pneumokokowe zapalenie płuc to choroby bakteryjne; przed gruźlicą chroni szczepionka BCG.", ru: "Туберкулёз, ангина и пневмококковая пневмония — бактериальные болезни; от туберкулёза защищает вакцина БЦЖ." },
  ],
  s2: [
    { pl: "Dym tytoniowy poraża rzęski nabłonka migawkowego, więc śluz z zanieczyszczeniami zalega w oskrzelach.", ru: "Табачный дым парализует реснички мерцательного эпителия, поэтому слизь с загрязнениями застаивается в бронхах." },
    { pl: "Zniszczone ściany pęcherzyków nie odrastają — rozedma na stałe zmniejsza powierzchnię wymiany gazowej.", ru: "Разрушенные стенки альвеол не восстанавливаются — эмфизема навсегда уменьшает поверхность газообмена." },
    { pl: "Palenie tytoniu to główny czynnik ryzyka raka płuca i POChP.", ru: "Курение — главный фактор риска рака лёгкого и ХОБЛ." },
  ],
  s3: [{ pl: "Obturacja: FEV1/FVC poniżej 70%. W astmie jest odwracalna, w POChP — nie w pełni.", ru: "Обструкция: ОФВ1/ФЖЕЛ ниже 70%. При астме она обратима, при ХОБЛ — не полностью." }],
  s4: [{ pl: "Najlepsza profilaktyka: niepalenie (także bierne), czyste powietrze, ruch i szczepienia.", ru: "Лучшая профилактика: не курить (в том числе пассивно), чистый воздух, движение и прививки." }],
};

export default function BreathingDisordersLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="brd" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="brd-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s1}
          question={r("Co jest główną przyczyną choroby:", "Что главная причина болезни:")}
          options={KINDS}
          items={DISEASES}
          wrongHint={r("Pomyśl, czy chorobą można się zarazić, czy powstaje ona z innego powodu.", "Подумай, можно ли этой болезнью заразиться или она возникает по другой причине.")}
        />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="brd-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Smoking lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="brd-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Spirometry lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="brd-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TwoWaySort
          lang={lang}
          title={r("Chroni czy szkodzi?", "Защищает или вредит?")}
          groups={[r("Chroni", "Защищает"), r("Szkodzi", "Вредит")]}
          items={HABITS}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
