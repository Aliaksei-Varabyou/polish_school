// Lesson for LO3 §7.3 "Choroby układu moczowego" (zakres rozszerzony). Diseases follow
// templates/data/disorders.ts (URINARY_DISORDERS).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { MatchQuiz, TwoWaySort, type QuizItem, type QuizOption, type SortItem } from "@portal/lessons";
import { num, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Nerki codziennie oczyszczają ok. 180 litrów osocza, a skład moczu wiernie pokazuje, co dzieje się w organizmie. Dlatego badanie moczu to jedno z najprostszych i najważniejszych badań. Gdy nerki przestają działać, ich pracę może przejąć dializa albo przeszczepiona nerka.",
    "Почки ежедневно очищают около 180 литров плазмы, а состав мочи точно показывает, что происходит в организме. Поэтому анализ мочи — одно из самых простых и важных исследований. Когда почки перестают работать, их функцию может взять на себя диализ или пересаженная почка.",
  ),
  s1: r("Co mówi badanie moczu?", "О чём говорит анализ мочи?"),
  s1intro: r(
    "Test paskowy zanurza się w moczu: każde pole zmienia barwę w obecności innej substancji. Wybierz wynik i sprawdź, co może oznaczać.",
    "Тест-полоску опускают в мочу: каждое поле меняет цвет при наличии своего вещества. Выбери результат и узнай, что он может означать.",
  ),
  s2: r("Choroby układu moczowego", "Болезни мочевыделительной системы"),
  s2intro: r("Rozpoznaj chorobę po objawach.", "Узнай болезнь по симптомам."),
  s3: r("Sztuczna nerka — dializa", "Искусственная почка — диализ"),
  s3intro: r(
    "Krew chorego płynie wzdłuż błony półprzepuszczalnej, a po drugiej stronie — płyn dializacyjny. Przesuń suwak czasu zabiegu.",
    "Кровь больного течёт вдоль полупроницаемой мембраны, а по другую сторону — диализирующий раствор. Сдвинь ползунок времени процедуры.",
  ),
  s4: r("Jak dbać o układ moczowy", "Как беречь мочевыделительную систему"),
} satisfies Record<string, Txt>;

// ---------- urine dipstick ----------

type Pad = "ph" | "sg" | "protein" | "glucose" | "blood" | "nitrite" | "leuko";
type Finding = "normal" | "glucose" | "protein" | "blood" | "infection" | "concentrated" | "dilute";

const PADS: { id: Pad; name: Txt; normal: string; abnormal: string }[] = [
  { id: "ph", name: r("pH", "pH"), normal: "#fb923c", abnormal: "#fb923c" },
  { id: "sg", name: r("ciężar właściwy", "удельный вес"), normal: "#65a30d", abnormal: "#ca8a04" },
  { id: "protein", name: r("białko", "белок"), normal: "#fde68a", abnormal: "#4ade80" },
  { id: "glucose", name: r("glukoza", "глюкоза"), normal: "#7dd3fc", abnormal: "#92400e" },
  { id: "blood", name: r("krew", "кровь"), normal: "#fef08a", abnormal: "#166534" },
  { id: "nitrite", name: r("azotyny", "нитриты"), normal: "#fafaf9", abnormal: "#f472b6" },
  { id: "leuko", name: r("leukocyty", "лейкоциты"), normal: "#f5f5f4", abnormal: "#a855f7" },
];

interface FindingInfo {
  name: Txt;
  pads: Pad[];
  /** urine colour in the cup */
  colour: string;
  cloudy?: boolean;
  sg?: string;
  text: Txt;
}

const FINDINGS: Record<Finding, FindingInfo> = {
  normal: {
    name: r("Wynik prawidłowy", "Нормальный результат"),
    pads: [],
    colour: "#fde047",
    sg: "1,020",
    text: r(
      "Mocz zdrowego człowieka jest słomkowożółty i przejrzysty, lekko kwaśny (pH ok. 5–7), o ciężarze właściwym zwykle 1,010–1,025. Nie zawiera glukozy, białka, krwi ani bakterii.",
      "Моча здорового человека соломенно-жёлтая и прозрачная, слабокислая (pH около 5–7), с удельным весом обычно 1,010–1,025. В ней нет глюкозы, белка, крови и бактерий.",
    ),
  },
  glucose: {
    name: r("Glukoza", "Глюкоза"),
    pads: ["glucose"],
    colour: "#fde047",
    sg: "1,030",
    text: r(
      "Cukromocz (glukozuria) — najczęściej cukrzyca. Gdy stężenie glukozy we krwi przekroczy próg nerkowy (ok. 180 mg/dl), nośniki w kanaliku bliższym nie nadążają z jej odzyskiwaniem i część glukozy zostaje w moczu.",
      "Глюкозурия — чаще всего сахарный диабет. Когда концентрация глюкозы в крови превышает почечный порог (около 180 мг/дл), переносчики в проксимальном канальце не успевают её возвращать, и часть глюкозы остаётся в моче.",
    ),
  },
  protein: {
    name: r("Białko", "Белок"),
    pads: ["protein"],
    colour: "#fde047",
    text: r(
      "Białkomocz — znak, że filtr w kłębuszkach jest uszkodzony i przepuszcza białka osocza, np. w kłębuszkowym zapaleniu nerek albo w nerkach niszczonych przez cukrzycę i nadciśnienie. Przejściowo bywa po dużym wysiłku lub w gorączce.",
      "Протеинурия — признак того, что фильтр клубочков повреждён и пропускает белки плазмы, например при гломерулонефрите или когда почки разрушаются из-за диабета и гипертонии. Временно бывает после большой нагрузки или при лихорадке.",
    ),
  },
  blood: {
    name: r("Krew", "Кровь"),
    pads: ["blood"],
    colour: "#f87171",
    text: r(
      "Krwiomocz — krwinki czerwone w moczu. Może go wywołać kamień nerkowy raniący drogi moczowe, zakażenie lub kłębuszkowe zapalenie nerek. Bezbolesny krwiomocz, zwłaszcza u palacza, może być objawem raka pęcherza moczowego — wymaga pilnej wizyty u lekarza.",
      "Гематурия — эритроциты в моче. Её может вызвать камень, ранящий мочевые пути, инфекция или гломерулонефрит. Безболезненная кровь в моче, особенно у курильщика, может быть признаком рака мочевого пузыря — нужно срочно к врачу.",
    ),
  },
  infection: {
    name: r("Bakterie", "Бактерии"),
    pads: ["nitrite", "leuko"],
    colour: "#fde68a",
    cloudy: true,
    text: r(
      "Azotyny, leukocyty i mętny mocz — zakażenie układu moczowego, najczęściej zapalenie pęcherza wywołane pałeczkami okrężnicy. Azotyny powstają, gdy bakterie przekształcają azotany zawarte w moczu; leukocyty to komórki odpornościowe walczące z zakażeniem.",
      "Нитриты, лейкоциты и мутная моча — инфекция мочевых путей, чаще всего цистит, вызванный кишечной палочкой. Нитриты образуются, когда бактерии превращают нитраты мочи; лейкоциты — иммунные клетки, борющиеся с инфекцией.",
    ),
  },
  concentrated: {
    name: r("Wysoki ciężar właściwy", "Высокий удельный вес"),
    pads: ["sg"],
    colour: "#d97706",
    sg: "1,035",
    text: r(
      "Ciemny, bardzo zagęszczony mocz — zwykle odwodnienie (mało picia, upał, gorączka, wysiłek). Wazopresyna zwiększa wtedy odzyskiwanie wody w kanalikach zbiorczych. Długo utrzymujące się zagęszczenie moczu sprzyja kamicy nerkowej.",
      "Тёмная, очень концентрированная моча — обычно обезвоживание (мало питья, жара, лихорадка, нагрузка). Вазопрессин тогда усиливает возврат воды в собирательных трубочках. Долго концентрированная моча способствует мочекаменной болезни.",
    ),
  },
  dilute: {
    name: r("Niski ciężar właściwy", "Низкий удельный вес"),
    pads: ["sg"],
    colour: "#fefce8",
    sg: "1,002",
    text: r(
      "Bardzo jasny, rozcieńczony mocz. Po wypiciu dużej ilości wody to normalne. Jeśli jednak moczu jest kilkanaście litrów na dobę, a pragnienie nie mija, może to być moczówka prosta — brak wazopresyny lub brak reakcji nerek na ten hormon.",
      "Очень светлая, разбавленная моча. После большого количества выпитой воды это нормально. Но если мочи больше десяти литров в сутки, а жажда не проходит, это может быть несахарный диабет — нехватка вазопрессина или нечувствительность почек к этому гормону.",
    ),
  },
};

const SG_LOW = "#0d9488";

function UrineTest({ lang }: { lang: BioLang }) {
  const [finding, setFinding] = useState<Finding>("normal");
  const f = FINDINGS[finding];
  const padColour = (p: (typeof PADS)[number]) => (f.pads.includes(p.id) ? (finding === "dilute" && p.id === "sg" ? SG_LOW : p.abnormal) : p.normal);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(FINDINGS) as Finding[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={finding === k}
            onClick={() => setFinding(k)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors ${
              finding === k ? "bg-amber-500 text-white ring-amber-500" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {FINDINGS[k].name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 320 250" className="mx-auto w-full max-w-[420px]" role="img" aria-label={f.name[lang]}>
          {/* cup */}
          <defs>
            <clipPath id="urd-cup">
              <path d="M24 40 L 104 40 L 96 220 L 32 220 Z" />
            </clipPath>
          </defs>
          <path d="M24 40 L 104 40 L 96 220 L 32 220 Z" fill="#f8fafc" />
          <rect x={0} y={80} width={130} height={150} fill={f.colour} clipPath="url(#urd-cup)" style={{ transition: "fill .4s" }} />
          {f.cloudy &&
            Array.from({ length: 30 }, (_, k) => <circle key={k} cx={36 + ((k * 17) % 58)} cy={90 + ((k * 29) % 124)} r={2.2} fill="#fff" opacity={0.75} clipPath="url(#urd-cup)" />)}
          <path d="M24 40 L 104 40 L 96 220 L 32 220 Z" fill="none" stroke="#94a3b8" strokeWidth={2.5} />
          {f.sg && (
            <text x={64} y={238} textAnchor="middle" fontSize={11} fill="#475569">
              {lang === "pl" ? "c. wł." : "уд. вес"} {f.sg}
            </text>
          )}
          {/* strip */}
          <rect x={150} y={10} width={40} height={232} rx={4} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.5} />
          {PADS.map((p, k) => {
            const y = 20 + k * 31;
            const bad = f.pads.includes(p.id);
            return (
              <g key={p.id}>
                <rect x={156} y={y} width={28} height={22} rx={3} fill={padColour(p)} stroke={bad ? "#e11d48" : "#d6d3d1"} strokeWidth={bad ? 3 : 1} style={{ transition: "fill .4s" }} />
                {finding === "blood" && p.id === "blood" &&
                  [0, 1, 2].map((d) => <circle key={d} cx={162 + d * 8} cy={y + 7 + (d % 2) * 8} r={2.2} fill="#14532d" />)}
                <text x={198} y={y + 15} fontSize={12} fill={bad ? "#be123c" : "#334155"} fontWeight={bad ? 700 : 400}>
                  {p.name[lang]}
                  {bad ? (finding === "dilute" ? " ↓" : " ↑") : ""}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200" aria-live="polite">
          <h3 className="text-base font-semibold text-amber-900">{f.name[lang]}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-amber-950">{f.text[lang]}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- diseases ----------

const D_OPTIONS: QuizOption[] = [
  { id: "zum", label: r("zapalenie pęcherza moczowego", "цистит") },
  { id: "odmiedniczkowe", label: r("odmiedniczkowe zapalenie nerek", "пиелонефрит") },
  { id: "kamica", label: r("kamica nerkowa", "мочекаменная болезнь") },
  { id: "klebuszkowe", label: r("kłębuszkowe zapalenie nerek", "гломерулонефрит") },
  { id: "niewydolnosc", label: r("przewlekła niewydolność nerek", "хроническая почечная недостаточность") },
  { id: "rak", label: r("rak pęcherza moczowego", "рак мочевого пузыря") },
  { id: "moczowka", label: r("moczówka prosta", "несахарный диабет") },
];

const D_ITEMS: QuizItem[] = [
  {
    icon: "🔥",
    name: r("pieczenie i ból przy oddawaniu moczu, częste parcie na pęcherz", "жжение и боль при мочеиспускании, частые позывы"),
    answer: "zum",
    explain: r("Zapalenie pęcherza wywołują bakterie, najczęściej pałeczki okrężnicy, wnikające przez cewkę moczową. Kobiety chorują częściej, bo mają krótszą cewkę.", "Цистит вызывают бактерии, чаще всего кишечная палочка, проникающие через мочеиспускательный канал. Женщины болеют чаще, потому что у них он короче."),
  },
  {
    icon: "🌡️",
    name: r("wysoka gorączka z dreszczami i ból w okolicy lędźwiowej", "высокая температура с ознобом и боль в пояснице"),
    answer: "odmiedniczkowe",
    explain: r("Bakterie wędrują z pęcherza przez moczowody do miedniczki nerkowej — dlatego nieleczonego zapalenia pęcherza nie wolno lekceważyć.", "Бактерии поднимаются из мочевого пузыря по мочеточникам в почечную лоханку — поэтому нельзя запускать цистит."),
  },
  {
    icon: "⚡",
    name: r("nagły, bardzo silny ból w okolicy lędźwiowej promieniujący w dół (kolka)", "внезапная очень сильная боль в пояснице, отдающая вниз (колика)"),
    answer: "kamica",
    explain: r("Z zagęszczonego moczu wytrącają się złogi soli, np. szczawianu wapnia. Kamień przesuwający się w moczowodzie wywołuje kolkę nerkową.", "Из концентрированной мочи выпадают соли, например оксалат кальция. Камень, движущийся по мочеточнику, вызывает почечную колику."),
  },
  {
    icon: "🫧",
    name: r("białko i krew w moczu, obrzęki i nadciśnienie", "белок и кровь в моче, отёки и повышенное давление"),
    answer: "klebuszkowe",
    explain: r("Kompleksy przeciwciał z antygenami odkładają się w ścianach kłębuszków i uszkadzają filtr — przechodzą przez niego białka i krwinki.", "Комплексы антител с антигенами оседают в стенках клубочков и повреждают фильтр — через него проходят белки и клетки крови."),
  },
  {
    icon: "🩺",
    name: r("mocznik gromadzi się we krwi, obrzęki; potrzebna dializa", "мочевина накапливается в крови, отёки; нужен диализ"),
    answer: "niewydolnosc",
    explain: r("Czynnych nefronów stopniowo ubywa, najczęściej wskutek cukrzycy i nadciśnienia. W końcowym stadium konieczna jest dializa lub przeszczep nerki.", "Работающих нефронов постепенно становится меньше, чаще всего из-за диабета и гипертонии. На последней стадии нужен диализ или пересадка почки."),
  },
  {
    icon: "🚬",
    name: r("bezbolesny krwiomocz u wieloletniego palacza", "безболезненная кровь в моче у курильщика со стажем"),
    answer: "rak",
    explain: r("Substancje rakotwórcze z dymu tytoniowego są wydalane z moczem i długo stykają się z nabłonkiem pęcherza.", "Канцерогены табачного дыма выводятся с мочой и долго контактируют с эпителием мочевого пузыря."),
  },
  {
    icon: "🚰",
    name: r("kilkanaście litrów rozcieńczonego moczu na dobę i silne pragnienie", "более десяти литров разбавленной мочи в сутки и сильная жажда"),
    answer: "moczowka",
    explain: r("Brak wazopresyny (lub reakcji nerek na nią) sprawia, że kanaliki zbiorcze nie odzyskują wody. Glukozy w moczu nie ma — to odróżnia ją od cukrzycy.", "Без вазопрессина (или реакции почек на него) собирательные трубочки не возвращают воду. Глюкозы в моче нет — этим он отличается от сахарного диабета."),
  },
];

// ---------- dialysis ----------

const MAX_DOTS = 24;

/** fixed pseudo-random dot positions inside a band */
const dots = (y0: number, h: number, seed: number) =>
  Array.from({ length: MAX_DOTS }, (_, k) => [20 + ((k * 47 + seed * 13) % 280), y0 + 8 + ((k * 23 + seed * 7) % (h - 16))] as const);

const BLOOD_UREA = dots(30, 70, 1);
const DIAL_UREA = dots(140, 70, 5);
const CELLS = dots(30, 70, 3).slice(0, 7);
const PROTEINS = dots(30, 70, 9).slice(0, 5);

function Dialysis({ lang }: { lang: BioLang }) {
  const [hours, setHours] = useState(0);
  const [fresh, setFresh] = useState(true);
  // with fresh dialysate the gradient stays: ~2/3 of urea removed in 4 h;
  // with standing fluid urea only evens out on both sides of the membrane
  const blood = fresh ? Math.exp(-0.28 * hours) : 0.5 + 0.5 * Math.exp(-hours / 0.6);
  const dial = fresh ? 0.12 * (1 - Math.exp(-2 * hours)) : 1 - blood;
  const gradient = blood - dial;
  const nArrows = Math.round(gradient * 5);
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 320 240" className="w-full" role="img" aria-label={lang === "pl" ? "dializator" : "диализатор"}>
          <defs>
            <marker id="urd-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#ca8a04" />
            </marker>
          </defs>
          <rect x={10} y={30} width={300} height={70} rx={8} fill="#fee2e2" />
          <rect x={10} y={140} width={300} height={70} rx={8} fill="#e0f2fe" />
          <text x={14} y={22} fontSize={12} fontWeight={600} fill="#b91c1c">
            {lang === "pl" ? "krew chorego →" : "кровь больного →"}
          </text>
          <text x={306} y={230} textAnchor="end" fontSize={12} fontWeight={600} fill="#0369a1">
            {fresh ? (lang === "pl" ? "← świeży płyn dializacyjny" : "← свежий диализирующий раствор") : lang === "pl" ? "płyn dializacyjny (nie wymieniany)" : "раствор (не меняется)"}
          </text>
          {/* membrane with pores */}
          <path d="M10 120 L 310 120" stroke="#64748b" strokeWidth={6} strokeDasharray="14 6" />
          {CELLS.map(([x, y], k) => (
            <ellipse key={`c${k}`} cx={x} cy={y} rx={9} ry={6} fill="#dc2626" stroke="#7f1d1d" />
          ))}
          {PROTEINS.map(([x, y], k) => (
            <path key={`p${k}`} d={`M${x - 7} ${y} q 3 -7 7 0 q 3 7 7 0`} stroke="#7c3aed" strokeWidth={3} fill="none" />
          ))}
          {BLOOD_UREA.slice(0, Math.round(MAX_DOTS * blood)).map(([x, y], k) => (
            <circle key={`b${k}`} cx={x} cy={y} r={3.2} fill="#eab308" stroke="#854d0e" strokeWidth={0.8} />
          ))}
          {DIAL_UREA.slice(0, Math.round(MAX_DOTS * dial)).map(([x, y], k) => (
            <circle key={`d${k}`} cx={x} cy={y} r={3.2} fill="#eab308" stroke="#854d0e" strokeWidth={0.8} />
          ))}
          {Array.from({ length: nArrows }, (_, k) => (
            <path key={`a${k}`} d={`M${50 + k * 55} 104 L ${50 + k * 55} 136`} stroke="#ca8a04" strokeWidth={3} markerEnd="url(#urd-arrow)" />
          ))}
        </svg>
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          <li>
            <span className="text-yellow-500">●</span> {lang === "pl" ? "mocznik" : "мочевина"}
          </li>
          <li>
            <span className="text-violet-600">〰</span> {lang === "pl" ? "białka" : "белки"}
          </li>
          <li>
            <span className="text-red-600">⬮</span> {lang === "pl" ? "krwinki" : "клетки крови"}
          </li>
          <li>
            <span className="text-slate-500">┅</span> {lang === "pl" ? "błona półprzepuszczalna" : "полупроницаемая мембрана"}
          </li>
        </ul>
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Czas zabiegu" : "Время процедуры"}: <span className="tabular-nums">{num(hours, 2)} {lang === "pl" ? "h" : "ч"}</span>
          <input
            type="range"
            min={0}
            max={4}
            step={0.25}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-amber-500"
            aria-valuetext={`${num(hours, 2)} ${lang === "pl" ? "h" : "ч"}`}
          />
        </label>
        <div className="flex gap-2" role="radiogroup">
          {[true, false].map((on) => (
            <button
              key={String(on)}
              type="button"
              role="radio"
              aria-checked={fresh === on}
              onClick={() => setFresh(on)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ${fresh === on ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"}`}
            >
              {on ? (lang === "pl" ? "płyn przepływa" : "раствор течёт") : lang === "pl" ? "płyn stoi" : "раствор стоит"}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-2 text-sm">
          <span className="w-36 text-slate-600">{lang === "pl" ? "Mocznik we krwi" : "Мочевина в крови"}</span>
          <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
            <span className="block h-full bg-yellow-500 transition-all" style={{ width: `${blood * 100}%` }} />
          </span>
          <span className="w-10 text-right tabular-nums">{Math.round(blood * 100)}%</span>
        </p>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          {hours === 0
            ? lang === "pl"
              ? "Mocznika we krwi jest dużo, w płynie dializacyjnym nie ma go wcale. Białka i krwinki są za duże, by przejść przez pory błony."
              : "Мочевины в крови много, а в диализирующем растворе её нет совсем. Белки и клетки крови слишком велики, чтобы пройти через поры мембраны."
            : fresh
              ? lang === "pl"
                ? "Mocznik dyfunduje przez błonę zgodnie z gradientem stężeń. Świeży płyn płynie w przeciwną stronę niż krew, więc gradient się utrzymuje i mocznik jest stale usuwany."
                : "Мочевина диффундирует через мембрану по градиенту концентрации. Свежий раствор течёт навстречу крови, поэтому градиент сохраняется и мочевина постоянно удаляется."
              : gradient < 0.05
                ? lang === "pl"
                  ? "Stężenia po obu stronach błony się wyrównały — dyfuzja ustała, a we krwi wciąż zostało dużo mocznika. Dlatego płyn trzeba stale wymieniać."
                  : "Концентрации по обе стороны мембраны выровнялись — диффузия прекратилась, а в крови осталось ещё много мочевины. Поэтому раствор нужно постоянно менять."
                : lang === "pl"
                  ? "Mocznik przechodzi do płynu, ale ten się nie wymienia — różnica stężeń szybko maleje."
                  : "Мочевина переходит в раствор, но он не меняется — разница концентраций быстро уменьшается."}
        </p>
        <p className="text-sm text-slate-500">
          {lang === "pl"
            ? "Płyn dializacyjny zawiera glukozę i jony w stężeniach jak w zdrowej krwi, więc organizm ich nie traci — usuwane są tylko nadmiar jonów, woda i zbędne produkty przemiany. Zabieg trwa ok. 4 godzin, zwykle 3 razy w tygodniu."
            : "Диализирующий раствор содержит глюкозу и ионы в концентрациях, как в здоровой крови, поэтому организм их не теряет — удаляются только избыток ионов, вода и ненужные продукты обмена. Процедура длится около 4 часов, обычно 3 раза в неделю."}
        </p>
      </div>
    </div>
  );
}

// ---------- prevention ----------

const HABITS: SortItem[] = [
  { name: r("picie ok. 1,5–2 l wody dziennie", "питьё около 1,5–2 л воды в день"), group: 0, why: r("Rozcieńczony mocz chroni przed kamicą i wypłukuje bakterie.", "Разбавленная моча защищает от камней и вымывает бактерии.") },
  { name: r("długie wstrzymywanie oddawania moczu", "долгое удержание мочи"), group: 1, why: r("Zalegający mocz sprzyja namnażaniu bakterii.", "Застой мочи способствует размножению бактерий.") },
  { name: r("siedzenie na zimnym, przemarznięcie", "сидение на холодном, переохлаждение"), group: 1, why: r("Wychłodzenie osłabia odporność i sprzyja zapaleniu pęcherza.", "Переохлаждение ослабляет иммунитет и способствует циститу.") },
  { name: r("bardzo słona dieta", "очень солёная пища"), group: 1, why: r("Nadmiar soli podnosi ciśnienie krwi i sprzyja kamicy nerkowej.", "Избыток соли повышает давление и способствует мочекаменной болезни.") },
  { name: r("palenie papierosów", "курение"), group: 1, why: r("Substancje rakotwórcze z dymu są wydalane z moczem — rośnie ryzyko raka pęcherza.", "Канцерогены дыма выводятся с мочой — растёт риск рака мочевого пузыря.") },
  { name: r("higiena okolic intymnych, podcieranie od przodu do tyłu", "гигиена интимной зоны, подмывание спереди назад"), group: 0, why: r("Ogranicza przenoszenie bakterii jelitowych do cewki moczowej.", "Уменьшает перенос кишечных бактерий в мочеиспускательный канал.") },
  { name: r("częste łykanie leków przeciwbólowych bez potrzeby", "частый приём обезболивающих без необходимости"), group: 1, why: r("Wiele leków jest wydalanych przez nerki i w nadmiarze je uszkadza.", "Многие лекарства выводятся почками и в избытке их повреждают.") },
  { name: r("kontrola ciśnienia krwi i poziomu cukru", "контроль давления и уровня сахара"), group: 0, why: r("Nadciśnienie i cukrzyca to główne przyczyny niewydolności nerek.", "Гипертония и диабет — главные причины почечной недостаточности.") },
  { name: r("regularne badanie ogólne moczu", "регулярный общий анализ мочи"), group: 0, why: r("Pozwala wcześnie wykryć chorobę, zanim pojawią się objawy.", "Позволяет рано обнаружить болезнь, ещё до появления симптомов.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "W moczu zdrowego człowieka nie ma glukozy, białka, krwi ani bakterii.", ru: "В моче здорового человека нет глюкозы, белка, крови и бактерий." },
    { pl: "Glukoza w moczu — cukrzyca; białko — uszkodzone kłębuszki; azotyny i leukocyty — zakażenie.", ru: "Глюкоза в моче — диабет; белок — повреждённые клубочки; нитриты и лейкоциты — инфекция." },
  ],
  s2: [
    { pl: "Zakażenia dróg moczowych szerzą się zwykle w górę: cewka → pęcherz → moczowody → nerki.", ru: "Инфекции мочевых путей обычно распространяются вверх: уретра → пузырь → мочеточники → почки." },
  ],
  s3: [
    { pl: "Dializa usuwa z krwi mocznik i nadmiar jonów oraz wody przez dyfuzję przez błonę półprzepuszczalną.", ru: "Диализ удаляет из крови мочевину, избыток ионов и воды путём диффузии через полупроницаемую мембрану." },
    { pl: "Dializa zastępuje filtrację, ale nie hormonalne funkcje nerek — trwałym rozwiązaniem jest przeszczep.", ru: "Диализ заменяет фильтрацию, но не гормональные функции почек — постоянное решение — пересадка." },
  ],
  s4: [{ pl: "Najprostsza profilaktyka: dużo pić, nie wstrzymywać moczu, dbać o higienę i nie palić.", ru: "Простейшая профилактика: много пить, не терпеть, соблюдать гигиену и не курить." }],
};

export default function UrinaryDisordersLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="urd" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="urd-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <UrineTest lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="urd-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s2}
          question={r("Która choroba daje takie objawy:", "Какая болезнь даёт такие симптомы:")}
          options={D_OPTIONS}
          items={D_ITEMS}
          wrongHint={r("Zastanów się, którą część układu moczowego dotyczą te objawy.", "Подумай, к какой части мочевыделительной системы относятся эти симптомы.")}
        />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="urd-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Dialysis lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="urd-s4" n={4} title={T.s4[lang]}>
        <TwoWaySort lang={lang} title={T.s4} groups={[r("chroni", "защищает"), r("szkodzi", "вредит")]} items={HABITS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
