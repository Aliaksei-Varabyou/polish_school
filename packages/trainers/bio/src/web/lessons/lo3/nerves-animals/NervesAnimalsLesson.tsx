// Lesson for LO3 §8.1 "Układ nerwowy u zwierząt" (zakres rozszerzony). Terms follow
// templates/data/comparative.ts (ANIMAL_NERVES).
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, type CompareCard, type QuizItem, type QuizOption } from "../../games.tsx";
import { Choice, KIT, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Układ nerwowy odbiera bodźce, przetwarza je i steruje reakcją. U najprostszych zwierząt to luźna sieć neuronów, a w toku ewolucji neurony skupiały się w zwoje i pnie, a ośrodki przesuwały się do przodu ciała — powstawała głowa z mózgiem. To zjawisko nazywamy cefalizacją.",
    "Нервная система воспринимает раздражители, обрабатывает их и управляет ответом. У самых простых животных это рыхлая сеть нейронов, а в ходе эволюции нейроны собирались в ганглии и стволы, а центры смещались в передний конец тела — возникала голова с мозгом. Это явление называют цефализацией.",
  ),
  s1: r("Typy układów nerwowych", "Типы нервных систем"),
  s1intro: r("Porównaj cztery typy budowy układu nerwowego.", "Сравни четыре типа строения нервной системы."),
  s2: r("Sieć czy ośrodek?", "Сеть или центр?"),
  s2intro: r(
    "Dotknij dowolnego punktu ciała zwierzęcia i zobacz, jak rozchodzi się pobudzenie.",
    "Нажми на любую точку тела животного и посмотри, как распространяется возбуждение.",
  ),
  s3: r("Mózgowie kręgowców", "Головной мозг позвоночных"),
  s3intro: r(
    "Mózgowie widziane od góry, przód z lewej. Wybierz gromadę i porównaj wielkość jego części.",
    "Головной мозг сверху, передний конец слева. Выбери класс и сравни размеры его отделов.",
  ),
  s4: r("Jaki to układ nerwowy?", "Какая это нервная система?"),
} satisfies Record<string, Txt>;

// ---------- types ----------

function Art({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

const L = {
  who: r("Kto ma", "У кого"),
  build: r("Budowa", "Строение"),
  centres: r("Ośrodki", "Центры"),
  where: r("Położenie", "Положение"),
  ceph: r("Cefalizacja", "Цефализация"),
};

const NERVE = "#d97706";
const GANGLION = "#b45309";

const HYDRA_NET: [number, number][] = [
  [86, 54],
  [114, 54],
  [100, 70],
  [84, 86],
  [116, 86],
  [100, 102],
  [86, 118],
  [114, 118],
];

const typeCards = (lang: BioLang): CompareCard[] => {
  const back = lang === "pl" ? "grzbiet" : "спина";
  const belly = lang === "pl" ? "brzuch" : "брюхо";
  return [
    {
      id: "diffuse",
      icon: "🪸",
      name: r("Rozproszony", "Диффузная"),
      art: (
        <Art label={lang === "pl" ? "stułbia" : "гидра"}>
          <path d="M80 40 Q 60 20 40 14 M90 38 Q 92 18 86 4 M110 38 Q 112 18 118 4 M120 40 Q 140 20 160 14" stroke="#86efac" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M80 40 Q 100 30 120 40 L 118 128 Q 100 136 82 128 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth={2} />
          {HYDRA_NET.map(([x, y], k) =>
            HYDRA_NET.slice(k + 1)
              .filter(([x2, y2]) => Math.hypot(x2 - x, y2 - y) < 34)
              .map(([x2, y2]) => <path key={`${k}-${x2}-${y2}`} d={`M${x} ${y} L ${x2} ${y2}`} stroke={NERVE} strokeWidth={1.4} />),
          )}
          {HYDRA_NET.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill={GANGLION} />
          ))}
        </Art>
      ),
      rows: [
        { label: L.who, value: r("parzydełkowce: stułbia, meduzy", "кишечнополостные: гидра, медузы") },
        { label: L.build, value: r("sieć neuronów pod całą powierzchnią ciała", "сеть нейронов под всей поверхностью тела") },
        { label: L.centres, value: r("brak", "нет") },
        { label: L.where, value: r("w całym ciele", "по всему телу") },
        { label: L.ceph, value: r("brak — zwierzę ma symetrię promienistą", "нет — у животного лучевая симметрия") },
      ],
    },
    {
      id: "ladder",
      icon: "🪱",
      name: r("Drabinkowy", "Лестничная"),
      art: (
        <Art label={lang === "pl" ? "wypławek" : "планария"}>
          <path d="M14 70 L 30 52 Q 40 44 50 52 Q 120 44 188 66 Q 192 70 188 74 Q 120 96 50 88 Q 40 96 30 88 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth={2} />
          <circle cx={30} cy={64} r={2.5} fill="#0f172a" />
          <circle cx={30} cy={76} r={2.5} fill="#0f172a" />
          <path d="M44 62 Q 120 60 180 68 M44 78 Q 120 80 180 72" stroke={NERVE} strokeWidth={2.5} fill="none" />
          {[62, 82, 102, 122, 142, 162].map((x) => (
            <path key={x} d={`M${x} 63 L ${x} 77`} stroke={NERVE} strokeWidth={1.6} />
          ))}
          <circle cx={42} cy={62} r={5} fill={GANGLION} />
          <circle cx={42} cy={78} r={5} fill={GANGLION} />
        </Art>
      ),
      rows: [
        { label: L.who, value: r("płazińce: wypławek, tasiemiec", "плоские черви: планария, цепень") },
        { label: L.build, value: r("podłużne pnie nerwowe połączone poprzecznymi spoidłami jak szczeble drabiny", "продольные нервные стволы, соединённые поперечными перемычками, как перекладины лестницы") },
        { label: L.centres, value: r("para zwojów głowowych", "пара головных ганглиев") },
        { label: L.where, value: r("wzdłuż ciała", "вдоль тела") },
        { label: L.ceph, value: r("początki — zwoje i przyoczka z przodu ciała", "начальная — ганглии и глазки в переднем конце тела") },
      ],
    },
    {
      id: "chain",
      icon: "🐛",
      name: r("Łańcuszek brzuszny", "Брюшная цепочка"),
      art: (
        <Art label={lang === "pl" ? "dżdżownica" : "дождевой червь"}>
          <rect x={10} y={40} width={182} height={64} rx={30} fill="#fecdd3" stroke="#be123c" strokeWidth={2} />
          {[44, 62, 80, 98, 116, 134, 152, 170].map((x) => (
            <path key={x} d={`M${x} 42 L ${x} 102`} stroke="#fda4af" strokeWidth={1} />
          ))}
          <path d="M18 70 L 190 70" stroke="#a16207" strokeWidth={6} opacity={0.5} />
          <circle cx={30} cy={56} r={6} fill={GANGLION} />
          <path d="M30 56 Q 22 70 32 86 M30 56 Q 40 70 32 86" stroke={NERVE} strokeWidth={2} fill="none" />
          <path d="M32 88 L 182 88" stroke={NERVE} strokeWidth={2.5} />
          {[32, 53, 71, 89, 107, 125, 143, 161, 179].map((x) => (
            <circle key={x} cx={x} cy={88} r={x === 32 ? 5 : 3.5} fill={GANGLION} />
          ))}
          <text x={100} y={30} textAnchor="middle" fontSize={10} fill="#64748b">
            {back}
          </text>
          <text x={100} y={122} textAnchor="middle" fontSize={10} fill="#64748b">
            {belly}
          </text>
        </Art>
      ),
      rows: [
        { label: L.who, value: r("pierścienice i stawonogi: dżdżownica, rak, owady", "кольчатые черви и членистоногие: дождевой червь, рак, насекомые") },
        { label: L.build, value: r("zwój nadprzełykowy i podprzełykowy połączone obrączką okołoprzełykową, dalej para zwojów w każdym segmencie", "надглоточный и подглоточный ганглии, соединённые окологлоточным кольцом, дальше пара ганглиев в каждом сегменте") },
        { label: L.centres, value: r("zwój nadprzełykowy pełni rolę mózgu", "надглоточный ганглий играет роль мозга") },
        { label: L.where, value: r("brzusznie — pod przewodem pokarmowym", "на брюшной стороне — под пищеварительным трактом") },
        { label: L.ceph, value: r("wyraźna; u owadów zwoje głowy i tułowia zlewają się w większe ośrodki", "выраженная; у насекомых ганглии головы и груди сливаются в крупные центры") },
      ],
    },
    {
      id: "tube",
      icon: "🐟",
      name: r("Cewka nerwowa", "Нервная трубка"),
      art: (
        <Art label={lang === "pl" ? "kręgowiec" : "позвоночное"}>
          <path d="M12 74 C 30 40, 140 34, 172 60 L 194 40 L 188 74 L 194 106 L 172 88 C 140 112, 30 108, 12 74 Z" fill="#e0f2fe" stroke="#0369a1" strokeWidth={2} />
          <path d="M30 70 C 60 82, 120 84, 160 76" stroke="#a16207" strokeWidth={6} opacity={0.45} fill="none" />
          <path d="M52 56 C 90 52, 140 52, 176 62" stroke={NERVE} strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={42} cy={57} rx={14} ry={9} fill={GANGLION} />
          <text x={100} y={30} textAnchor="middle" fontSize={10} fill="#64748b">
            {back}
          </text>
          <text x={100} y={124} textAnchor="middle" fontSize={10} fill="#64748b">
            {belly}
          </text>
        </Art>
      ),
      rows: [
        { label: L.who, value: r("strunowce, w tym kręgowce", "хордовые, в том числе позвоночные") },
        { label: L.build, value: r("cewka nerwowa — pusta w środku rurka; jej przód tworzy mózgowie, reszta — rdzeń kręgowy", "нервная трубка — полая внутри; её передняя часть образует головной мозг, остальное — спинной") },
        { label: L.centres, value: r("mózgowie i rdzeń kręgowy (ośrodkowy układ nerwowy)", "головной и спинной мозг (центральная нервная система)") },
        { label: L.where, value: r("grzbietowo — nad przewodem pokarmowym", "на спинной стороне — над пищеварительным трактом") },
        { label: L.ceph, value: r("najsilniejsza — duże mózgowie w czaszce", "наибольшая — крупный головной мозг в черепе") },
      ],
    },
  ];
};

// ---------- spreading of excitation ----------

interface Net {
  nodes: [number, number][];
  edges: [number, number][];
  /** ganglia, for the centralised system */
  centre: number[];
}

function hydraNet(): Net {
  const nodes: [number, number][] = [];
  const edges: [number, number][] = [];
  const cols = [136, 160, 184];
  const rows = [86, 110, 134, 158, 182, 206];
  rows.forEach((y) => cols.forEach((x) => nodes.push([x, y])));
  const at = (ri: number, ci: number) => ri * cols.length + ci;
  rows.forEach((_, ri) =>
    cols.forEach((_, ci) => {
      if (ci + 1 < cols.length) edges.push([at(ri, ci), at(ri, ci + 1)]);
      if (ri + 1 < rows.length) edges.push([at(ri, ci), at(ri + 1, ci)]);
      if (ri + 1 < rows.length && ci + 1 < cols.length && (ri + ci) % 2 === 0) edges.push([at(ri, ci), at(ri + 1, ci + 1)]);
    }),
  );
  // tentacles: base at the top row, two nodes along each
  const tentacles: [number, [number, number], [number, number]][] = [
    [0, [112, 50], [86, 22]],
    [1, [160, 46], [160, 14]],
    [2, [208, 50], [234, 22]],
  ];
  for (const [base, mid, tip] of tentacles) {
    const m = nodes.push(mid) - 1;
    const t = nodes.push(tip) - 1;
    edges.push([base, m], [m, t]);
  }
  return { nodes, edges, centre: [] };
}

function planariaNet(): Net {
  const nodes: [number, number][] = [
    [62, 106],
    [62, 134],
  ];
  const edges: [number, number][] = [[0, 1]];
  const xs = [98, 132, 166, 200, 234, 268];
  xs.forEach((x, k) => {
    const top = nodes.push([x, 104 + k * 2]) - 1;
    const bot = nodes.push([x, 136 - k * 2]) - 1;
    edges.push([top, bot]);
    edges.push(k === 0 ? [0, top] : [top - 2, top]);
    edges.push(k === 0 ? [1, bot] : [bot - 2, bot]);
  });
  return { nodes, edges, centre: [0, 1] };
}

/** breadth-first distances (and parents) from a set of start nodes */
function bfs(net: Net, from: number[]) {
  const dist = net.nodes.map(() => Infinity);
  const parent = net.nodes.map(() => -1);
  const queue = [...from];
  from.forEach((s) => (dist[s] = 0));
  while (queue.length) {
    const a = queue.shift()!;
    for (const [p, q] of net.edges) {
      const b = p === a ? q : q === a ? p : -1;
      if (b >= 0 && dist[b] === Infinity) {
        dist[b] = dist[a]! + 1;
        parent[b] = a;
        queue.push(b);
      }
    }
  }
  return { dist, parent };
}

type Animal = "hydra" | "planaria";

const SPREAD = {
  hydra: r("Stułbia — sieć", "Гидра — сеть"),
  planaria: r("Wypławek — pnie i zwoje", "Планария — стволы и ганглии"),
  tap: r("👆 Dotknij dowolnej kropki na ciele — to miejsce zadziała bodziec.", "👆 Нажми на любую точку на теле — сюда подействует раздражитель."),
  netGo: r("Pobudzenie rozchodzi się po sieci we wszystkich kierunkach naraz…", "Возбуждение расходится по сети во все стороны сразу…"),
  netDone: r(
    "Pobudzenie objęło całe ciało i stułbia kurczy się cała, chowając czułki. Nie ma ośrodka, który oceniłby, skąd przyszedł bodziec — reakcja jest prosta i mało precyzyjna.",
    "Возбуждение охватило всё тело, и гидра сжимается целиком, втягивая щупальца. Нет центра, который оценил бы, откуда пришёл раздражитель, — ответ простой и неточный.",
  ),
  toCentre: r("Impuls biegnie pniem nerwowym do zwojów głowowych…", "Импульс бежит по нервному стволу к головным ганглиям…"),
  fromCentre: r("Zwoje głowowe — ośrodek — analizują bodziec i wysyłają polecenia do mięśni…", "Головные ганглии — центр — анализируют раздражитель и посылают команды мышцам…"),
  centreDone: r(
    "Ośrodek „wie”, skąd przyszedł bodziec, więc reakcja jest skoordynowana i kierunkowa: wypławek skręca i odpływa od bodźca. Ośrodki z przodu ciała dostają informacje z narządów zmysłów jako pierwsze.",
    "Центр «знает», откуда пришёл раздражитель, поэтому ответ согласованный и направленный: планария поворачивает и уплывает от раздражителя. Центры в переднем конце тела первыми получают сведения от органов чувств.",
  ),
};

function Spread({ lang }: { lang: BioLang }) {
  const [animal, setAnimal] = useState<Animal>("hydra");
  const [origin, setOrigin] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const net = useMemo(() => (animal === "hydra" ? hydraNet() : planariaNet()), [animal]);
  const fromCentre = useMemo(() => bfs(net, net.centre), [net]);
  const fromOrigin = useMemo(() => (origin === null ? null : bfs(net, [origin])), [net, origin]);

  // the sensory path to the ganglia, origin first
  const path: number[] = [];
  if (origin !== null && net.centre.length) {
    for (let n = origin; n >= 0; n = fromCentre.parent[n]!) path.push(n);
  }
  const pathLen = path.length - 1;
  const maxCentre = Math.max(...fromCentre.dist.filter((d) => d < Infinity));
  const maxStep = net.centre.length ? pathLen + 1 + maxCentre : Math.max(...(fromOrigin?.dist ?? [0]));

  useEffect(() => {
    if (origin === null || step >= maxStep) return;
    const id = window.setTimeout(() => setStep(step + 1), 260);
    return () => window.clearTimeout(id);
  }, [origin, step, maxStep]);

  const fire = (n: number) => {
    setOrigin(n);
    setStep(0);
  };
  const switchTo = (a: Animal) => {
    setAnimal(a);
    setOrigin(null);
    setStep(0);
  };

  const colour = (n: number) => {
    if (origin === null) return "#94a3b8";
    if (net.centre.length) {
      const motorStep = step - pathLen - 1;
      if (motorStep >= 0 && fromCentre.dist[n]! <= motorStep) return "#4f46e5";
      const i = path.indexOf(n);
      if (i >= 0 && i <= step) return "#f59e0b";
      return "#94a3b8";
    }
    return fromOrigin!.dist[n]! <= step ? "#f59e0b" : "#94a3b8";
  };

  const message =
    origin === null
      ? SPREAD.tap
      : !net.centre.length
        ? step >= maxStep
          ? SPREAD.netDone
          : SPREAD.netGo
        : step <= pathLen
          ? SPREAD.toCentre
          : step >= maxStep
            ? SPREAD.centreDone
            : SPREAD.fromCentre;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup">
        {(["hydra", "planaria"] as const).map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={animal === a}
            onClick={() => switchTo(a)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              animal === a ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {SPREAD[a][lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 320 240" className="mx-auto w-full max-w-[420px] select-none" role="img" aria-label={SPREAD[animal][lang]}>
          <rect width={320} height={240} rx={14} fill="#f8fafc" />
          {animal === "hydra" ? (
            <>
              <path d="M136 68 L 112 50 L 86 22 M160 62 L 160 14 M184 68 L 208 50 L 234 22" stroke="#bbf7d0" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M124 70 Q 160 54 196 70 L 196 214 Q 160 226 124 214 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth={2} />
            </>
          ) : (
            <>
              <path d="M24 120 L 44 92 Q 56 84 70 94 Q 180 80 300 114 Q 306 120 300 126 Q 180 160 70 146 Q 56 156 44 148 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth={2} />
              <circle cx={46} cy={112} r={3} fill="#0f172a" />
              <circle cx={46} cy={128} r={3} fill="#0f172a" />
            </>
          )}
          {net.edges.map(([a, b]) => {
            const lit = colour(a) !== "#94a3b8" && colour(b) !== "#94a3b8";
            return (
              <path
                key={`${a}-${b}`}
                d={`M${net.nodes[a]![0]} ${net.nodes[a]![1]} L ${net.nodes[b]![0]} ${net.nodes[b]![1]}`}
                stroke={lit ? colour(b) : "#cbd5e1"}
                strokeWidth={net.centre.length ? 3 : 2}
              />
            );
          })}
          {net.nodes.map(([x, y], n) => (
            <g
              key={n}
              role="button"
              tabIndex={0}
              aria-label={`${lang === "pl" ? "punkt" : "точка"} ${n + 1}`}
              onClick={() => fire(n)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fire(n);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <circle cx={x} cy={y} r={14} fill="transparent" />
              <circle
                cx={x}
                cy={y}
                r={net.centre.includes(n) ? 10 : 6}
                fill={colour(n)}
                stroke={n === origin ? "#e11d48" : "white"}
                strokeWidth={n === origin ? 3 : 1.5}
                style={{ transition: "fill .2s" }}
              />
            </g>
          ))}
        </svg>
        <div className="space-y-3">
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
            {message[lang]}
          </p>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>
              <span className="mr-1 inline-block h-3 w-3 rounded-full bg-amber-500 align-middle" /> {lang === "pl" ? "pobudzenie od bodźca" : "возбуждение от раздражителя"}
            </li>
            {animal === "planaria" && (
              <li>
                <span className="mr-1 inline-block h-3 w-3 rounded-full bg-indigo-600 align-middle" /> {lang === "pl" ? "polecenia z ośrodka" : "команды из центра"}
              </li>
            )}
          </ul>
          {origin !== null && step >= maxStep && <Choice onClick={() => fire(origin)}>↺ {KIT.again[lang]}</Choice>}
        </div>
      </div>
    </div>
  );
}

// ---------- vertebrate brains ----------

type Cls = "fish" | "amphibian" | "reptile" | "bird" | "mammal";
/** [cx, rx, ry, dy]: a pair of ellipses at y = 100 ± dy (dy = 0 — one ellipse) */
type Blob = [number, number, number, number];

interface BrainPlan {
  name: Txt;
  icon: string;
  olf: Blob;
  cer: Blob;
  mid: Blob;
  cbl: Blob;
  med: number;
  /** relative development of: telencephalon, midbrain, cerebellum (1–5) */
  size: [number, number, number];
  folds?: boolean;
  text: Txt;
}

const BRAINS: Record<Cls, BrainPlan> = {
  fish: {
    name: r("Ryby", "Рыбы"),
    icon: "🐟",
    olf: [30, 10, 7, 10],
    cer: [66, 20, 15, 16],
    mid: [120, 28, 22, 23],
    cbl: [172, 22, 22, 0],
    med: 190,
    size: [1, 4, 3],
    text: r(
      "Kresomózgowie małe, związane głównie z węchem. Największe są płaty wzrokowe śródmózgowia — główny ośrodek przetwarzający bodźce. Móżdżek dobrze rozwinięty: koordynuje pływanie w trzech wymiarach.",
      "Конечный мозг маленький, связан в основном с обонянием. Крупнее всего зрительные доли среднего мозга — главный центр обработки сигналов. Мозжечок хорошо развит: он координирует плавание в трёх измерениях.",
    ),
  },
  amphibian: {
    name: r("Płazy", "Земноводные"),
    icon: "🐸",
    olf: [26, 10, 7, 10],
    cer: [70, 30, 15, 16],
    mid: [124, 20, 15, 16],
    cbl: [152, 7, 16, 0],
    med: 158,
    size: [2, 3, 1],
    text: r(
      "Półkule kresomózgowia są większe niż u ryb, ale bez kory nowej. Śródmózgowie wciąż jest głównym ośrodkiem. Móżdżek bardzo mały — płazy wykonują mało złożone ruchy.",
      "Полушария конечного мозга крупнее, чем у рыб, но без новой коры. Средний мозг по-прежнему главный центр. Мозжечок очень маленький — земноводные совершают несложные движения.",
    ),
  },
  reptile: {
    name: r("Gady", "Пресмыкающиеся"),
    icon: "🦎",
    olf: [24, 9, 7, 10],
    cer: [72, 34, 22, 23],
    mid: [130, 18, 15, 16],
    cbl: [160, 13, 18, 0],
    med: 172,
    size: [3, 2, 2],
    text: r(
      "Kresomózgowie wyraźnie większe niż u płazów; pojawiają się w nim zawiązki kory nowej. Móżdżek lepiej rozwinięty — gady sprawniej poruszają się na lądzie.",
      "Конечный мозг заметно крупнее, чем у земноводных; в нём появляются зачатки новой коры. Мозжечок развит лучше — пресмыкающиеся увереннее передвигаются по суше.",
    ),
  },
  bird: {
    name: r("Ptaki", "Птицы"),
    icon: "🐦",
    olf: [20, 6, 5, 8],
    cer: [80, 44, 30, 31],
    mid: [134, 16, 16, 48],
    cbl: [152, 26, 26, 0],
    med: 176,
    size: [4, 3, 5],
    folds: true,
    text: r(
      "Duże półkule kresomózgowia, ale bez kory nowej — ośrodki zachowań leżą głębiej, w ciałach prążkowanych. Po bokach widać duże płaty wzrokowe. Bardzo duży, pofałdowany móżdżek koordynuje lot.",
      "Крупные полушария конечного мозга, но без новой коры — центры поведения лежат глубже, в полосатых телах. По бокам видны крупные зрительные доли. Очень большой складчатый мозжечок координирует полёт.",
    ),
  },
  mammal: {
    name: r("Ssaki", "Млекопитающие"),
    icon: "🐕",
    olf: [18, 8, 6, 10],
    cer: [92, 64, 36, 37],
    mid: [150, 14, 12, 14],
    cbl: [184, 28, 30, 0],
    med: 206,
    size: [5, 1, 4],
    folds: true,
    text: r(
      "Największe kresomózgowie, pokryte korą nową, często pofałdowaną w bruzdy i zakręty, co zwiększa jej powierzchnię. Półkule przykrywają międzymózgowie i śródmózgowie. Móżdżek duży i pofałdowany.",
      "Самый крупный конечный мозг, покрытый новой корой, часто складчатой — с бороздами и извилинами, что увеличивает её площадь. Полушария прикрывают промежуточный и средний мозг. Мозжечок крупный и складчатый.",
    ),
  },
};

const BP = {
  olf: { name: r("opuszki węchowe", "обонятельные луковицы"), colour: "#c4b5fd" },
  cer: { name: r("kresomózgowie", "конечный мозг"), colour: "#a5b4fc" },
  mid: { name: r("śródmózgowie (płaty wzrokowe)", "средний мозг (зрительные доли)"), colour: "#fcd34d" },
  cbl: { name: r("móżdżek", "мозжечок"), colour: "#f9a8d4" },
  med: { name: r("rdzeń przedłużony", "продолговатый мозг"), colour: "#cbd5e1" },
};

function Pair({ b, fill, stroke, folds }: { b: Blob; fill: string; stroke: string; folds?: boolean }) {
  const [cx, rx, ry, dy] = b;
  const ys = dy ? [100 - dy, 100 + dy] : [100];
  return (
    <>
      {ys.map((y) => (
        <g key={y}>
          <ellipse cx={cx} cy={y} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={1.5} style={{ transition: "all .4s" }} />
          {folds &&
            [-0.5, 0, 0.5].map((f) => (
              <path
                key={f}
                d={dy ? `M${cx + f * rx} ${y - ry * 0.75} q ${rx * 0.12} ${ry * 0.4} 0 ${ry * 0.75} q ${-rx * 0.12} ${ry * 0.4} 0 ${ry * 0.75}` : `M${cx + f * rx} ${y - ry * 0.8} L ${cx + f * rx} ${y + ry * 0.8}`}
                stroke={stroke}
                strokeWidth={1}
                fill="none"
                opacity={0.6}
              />
            ))}
        </g>
      ))}
    </>
  );
}

function Brains({ lang }: { lang: BioLang }) {
  const [cls, setCls] = useState<Cls>("fish");
  const b = BRAINS[cls];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(BRAINS) as Cls[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={cls === k}
            onClick={() => setCls(k)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors ${
              cls === k ? "bg-indigo-600 text-white ring-indigo-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {BRAINS[k].icon} {BRAINS[k].name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 320 200" className="w-full" role="img" aria-label={`${b.name[lang]}: ${lang === "pl" ? "mózgowie" : "головной мозг"}`}>
            <rect width={320} height={200} rx={14} fill="#f8fafc" />
            <path d={`M${b.med} 90 L 312 96 L 312 104 L ${b.med} 110 Z`} fill={BP.med.colour} stroke="#64748b" strokeWidth={1.5} />
            <Pair b={b.mid} fill={BP.mid.colour} stroke="#b45309" />
            <Pair b={b.cbl} fill={BP.cbl.colour} stroke="#be185d" folds={b.folds} />
            <Pair b={b.olf} fill={BP.olf.colour} stroke="#6d28d9" />
            <Pair b={b.cer} fill={BP.cer.colour} stroke="#4338ca" folds={cls === "mammal"} />
            <text x={10} y={194} fontSize={10} fill="#64748b">
              ← {lang === "pl" ? "przód" : "перед"}
            </text>
          </svg>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
            {(Object.keys(BP) as (keyof typeof BP)[]).map((k) => (
              <li key={k} className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: BP[k].colour }} /> {BP[k].name[lang]}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3" aria-live="polite">
          <div className="space-y-1.5 text-sm">
            {([BP.cer, BP.mid, BP.cbl] as const).map((p, k) => (
              <p key={p.name.pl} className="flex items-center gap-2">
                <span className="w-40 shrink-0 text-slate-600">{p.name[lang]}</span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <span className="block h-full transition-all duration-500" style={{ width: `${b.size[k]! * 20}%`, background: p.colour }} />
                </span>
              </p>
            ))}
            <p className="text-xs text-slate-500">{lang === "pl" ? "Względny stopień rozwoju" : "Относительная степень развития"}</p>
          </div>
          <p className="rounded-xl bg-indigo-50 px-4 py-3 text-[15px] leading-relaxed text-indigo-950 ring-1 ring-indigo-200">{b.text[lang]}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- quiz ----------

const TYPE_OPTIONS: QuizOption[] = [
  { id: "diffuse", label: r("rozproszony", "диффузная") },
  { id: "ladder", label: r("drabinkowy", "лестничная") },
  { id: "chain", label: r("łańcuszek brzuszny", "брюшная цепочка") },
  { id: "tube", label: r("cewka nerwowa", "нервная трубка") },
];

const TYPE_ITEMS: QuizItem[] = [
  { icon: "🪸", name: r("stułbia", "гидра"), answer: "diffuse", explain: r("Parzydełkowce mają sieć neuronów bez ośrodków.", "У кишечнополостных сеть нейронов без центров.") },
  { icon: "🪼", name: r("meduza", "медуза"), answer: "diffuse", explain: r("Też parzydełkowiec — sieć nerwowa, choć wzdłuż brzegu parasola neurony gęstnieją.", "Тоже кишечнополостное — нервная сеть, хотя по краю зонтика нейронов больше.") },
  { icon: "🪱", name: r("wypławek", "планария"), answer: "ladder", explain: r("Płaziniec: dwa pnie nerwowe ze spoidłami i para zwojów głowowych.", "Плоский червь: два нервных ствола с перемычками и пара головных ганглиев.") },
  { icon: "🎗️", name: r("tasiemiec", "цепень"), answer: "ladder", explain: r("Tasiemce to płazińce — układ drabinkowy, choć bez rozwiniętych narządów zmysłów.", "Цепни — плоские черви: лестничная система, хотя без развитых органов чувств.") },
  { icon: "🐛", name: r("dżdżownica", "дождевой червь"), answer: "chain", explain: r("Pierścienica: zwój nadprzełykowy i łańcuch zwojów w segmentach, pod jelitem.", "Кольчатый червь: надглоточный ганглий и цепочка ганглиев в сегментах, под кишкой.") },
  { icon: "🐝", name: r("pszczoła", "пчела"), answer: "chain", explain: r("Stawonogi mają łańcuszek brzuszny; u owadów część zwojów zlewa się w duże ośrodki.", "У членистоногих брюшная цепочка; у насекомых часть ганглиев сливается в крупные центры.") },
  { icon: "🦞", name: r("rak", "рак"), answer: "chain", explain: r("Skorupiak — stawonóg, więc łańcuszek brzuszny.", "Ракообразное — членистоногое, значит, брюшная цепочка.") },
  { icon: "🐸", name: r("żaba", "лягушка"), answer: "tube", explain: r("Kręgowiec: mózgowie i rdzeń kręgowy powstają z grzbietowej cewki nerwowej.", "Позвоночное: головной и спинной мозг развиваются из спинной нервной трубки.") },
  { icon: "🧍", name: r("człowiek", "человек"), answer: "tube", explain: r("Ośrodkowy układ nerwowy człowieka to mózgowie i rdzeń kręgowy — potomkowie cewki nerwowej.", "Центральная нервная система человека — головной и спинной мозг, потомки нервной трубки.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Rozproszony → drabinkowy → łańcuszek brzuszny → cewka nerwowa: coraz silniejsza centralizacja i cefalizacja.", ru: "Диффузная → лестничная → брюшная цепочка → нервная трубка: всё сильнее централизация и цефализация." },
    { pl: "U bezkręgowców łańcuszek leży brzusznie, u kręgowców cewka nerwowa — grzbietowo.", ru: "У беспозвоночных цепочка лежит на брюшной стороне, у позвоночных нервная трубка — на спинной." },
  ],
  s2: [{ pl: "Ośrodki nerwowe zbierają informacje i koordynują reakcję całego ciała — jest szybsza i bardziej precyzyjna.", ru: "Нервные центры собирают информацию и согласуют ответ всего тела — он быстрее и точнее." }],
  s3: [
    { pl: "Mózgowie kręgowców ma pięć części: kresomózgowie, międzymózgowie, śródmózgowie, móżdżek i rdzeń przedłużony.", ru: "Головной мозг позвоночных состоит из пяти отделов: конечного, промежуточного, среднего мозга, мозжечка и продолговатого мозга." },
    { pl: "Kora nowa jest najlepiej rozwinięta u ssaków; duży móżdżek mają zwierzęta o złożonym ruchu, np. ptaki.", ru: "Новая кора лучше всего развита у млекопитающих; крупный мозжечок у животных со сложными движениями, например у птиц." },
  ],
  s4: [{ pl: "Typ układu nerwowego to cecha całej grupy systematycznej.", ru: "Тип нервной системы — признак всей систематической группы." }],
};

export default function NervesAnimalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="nera" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="nera-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={typeCards(lang)} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="nera-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Spread lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="nera-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Brains lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="nera-s4" n={4} title={T.s4[lang]}>
        <MatchQuiz
          lang={lang}
          title={T.s4}
          question={r("Jaki układ nerwowy ma", "Какая нервная система у этого животного:")}
          options={TYPE_OPTIONS}
          items={TYPE_ITEMS}
          wrongHint={r("Przypomnij sobie, do jakiej grupy należy to zwierzę.", "Вспомни, к какой группе относится это животное.")}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
