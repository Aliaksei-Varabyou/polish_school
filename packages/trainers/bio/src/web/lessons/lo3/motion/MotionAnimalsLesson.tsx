// Lesson for LO3 §3.1 "Ruch u zwierząt" (Biologia na czasie 3, zakres rozszerzony). Terms follow
// templates/data/comparative.ts (ANIMAL_MOTION): the three kinds of skeleton, molting, the body-wall
// muscle sac and the ways of moving without a skeleton.
import { useEffect, useRef, useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, type CompareCard, type QuizItem, type QuizOption } from "../../games.tsx";
import { Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Mięsień potrafi tylko się kurczyć i ciągnąć — żeby ten skurcz poruszył ciałem, potrzebuje oparcia, czyli szkieletu. U zwierząt spotykamy trzy rozwiązania: płyn pod ciśnieniem, sztywny pancerz na zewnątrz i rusztowanie wewnątrz ciała.",
    "Мышца умеет только сокращаться и тянуть — чтобы это сокращение двигало телом, ей нужна опора, то есть скелет. У животных встречаются три решения: жидкость под давлением, жёсткий панцирь снаружи и каркас внутри тела.",
  ),
  s1: r("Trzy rodzaje szkieletu", "Три типа скелета"),
  s1intro: r("Przełączaj karty i porównaj, gdzie leży szkielet i jak przyczepiają się do niego mięśnie.", "Переключай карточки и сравни, где находится скелет и как к нему крепятся мышцы."),
  s2: r("Jak pełza dżdżownica", "Как ползает дождевой червь"),
  s2intro: r(
    "Każdy segment dżdżownicy to zamknięta komora z płynem. Płynu nie da się ścisnąć, więc gdy segment robi się cieńszy, musi się wydłużyć — i odwrotnie.",
    "Каждый сегмент дождевого червя — замкнутая камера с жидкостью. Жидкость несжимаема, поэтому, когда сегмент становится тоньше, он обязан удлиниться, — и наоборот.",
  ),
  s3: r("Linienie, czyli jak rośnie zwierzę w pancerzu", "Линька: как растёт животное в панцире"),
  s3intro: r("Przesuń suwak czasu i porównaj wzrost stawonoga i kręgowca.", "Сдвигай ползунок времени и сравни рост членистоногого и позвоночного."),
  s4: r("Kto ma jaki szkielet?", "У кого какой скелет?"),
  s5: r("Ruch bez mięśni i szkieletu", "Движение без мышц и скелета"),
  s5intro: r(
    "Pojedyncze komórki i niektóre małe zwierzęta poruszają się dzięki nibynóżkom, rzęskom lub wiciom, a głowonogi — dzięki odrzutowi wody.",
    "Одиночные клетки и некоторые мелкие животные передвигаются с помощью ложноножек, ресничек или жгутиков, а головоногие — за счёт реактивной отдачи воды.",
  ),
} satisfies Record<string, Txt>;

/** a colour between two RGB colours */
const mix = (a: [number, number, number], b: [number, number, number], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i]! - v) * t)).join(",")})`;

// ---------- the three skeletons ----------

const L = {
  what: r("Z czego", "Из чего"),
  where: r("Gdzie leży", "Где находится"),
  muscles: r("Mięśnie", "Мышцы"),
  growth: r("Wzrost", "Рост"),
  who: r("U kogo", "У кого"),
};

function HydroArt() {
  return (
    <svg viewBox="0 0 200 120" className="w-full" aria-hidden>
      <rect x={14} y={30} width={172} height={60} rx={30} fill="#fbcfe8" stroke="#be185d" strokeWidth={3} />
      <rect x={22} y={38} width={156} height={44} rx={22} fill="#93c5fd" />
      {[46, 76, 106, 136].map((x) => (
        <line key={x} x1={x} y1={32} x2={x} y2={88} stroke="#be185d" strokeWidth={2} strokeDasharray="3 3" />
      ))}
      <text x={100} y={64} textAnchor="middle" fontSize={11} fill="#1e3a8a">
        H₂O
      </text>
      <path d="M100 14 L 100 28" stroke="#0f172a" strokeWidth={2} markerEnd="url(#mova-arr)" />
      <path d="M100 106 L 100 92" stroke="#0f172a" strokeWidth={2} markerEnd="url(#mova-arr)" />
      <defs>
        <marker id="mova-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L 10 5 L 0 10 Z" fill="#0f172a" />
        </marker>
      </defs>
    </svg>
  );
}

function ExoArt() {
  return (
    <svg viewBox="0 0 200 120" className="w-full" aria-hidden>
      <path d="M20 40 L 96 40 L 100 60 L 96 80 L 20 80 Z" fill="#fde68a" stroke="#92400e" strokeWidth={5} strokeLinejoin="round" />
      <path d="M104 46 L 182 46 L 182 74 L 104 74 L 100 60 Z" fill="#fde68a" stroke="#92400e" strokeWidth={5} strokeLinejoin="round" />
      <path d="M30 50 C 60 46, 90 50, 112 54" stroke="#e11d48" strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d="M30 70 C 60 74, 90 70, 112 66" stroke="#fb7185" strokeWidth={4} strokeLinecap="round" fill="none" />
      <circle cx={100} cy={60} r={4} fill="#92400e" />
    </svg>
  );
}

function EndoArt() {
  return (
    <svg viewBox="0 0 200 120" className="w-full" aria-hidden>
      <rect x={18} y={30} width={168} height={60} rx={26} fill="#fecdd3" />
      <rect x={30} y={52} width={66} height={16} rx={8} fill="#f8fafc" stroke="#94a3b8" strokeWidth={2} />
      <rect x={104} y={52} width={70} height={16} rx={8} fill="#f8fafc" stroke="#94a3b8" strokeWidth={2} />
      <path d="M50 50 C 70 36, 100 36, 120 50" stroke="#e11d48" strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M50 70 C 70 82, 100 82, 120 70" stroke="#fb7185" strokeWidth={5} strokeLinecap="round" fill="none" />
    </svg>
  );
}

const SKELETONS: CompareCard[] = [
  {
    id: "hydro",
    icon: "💧",
    name: r("Hydrostatyczny", "Гидростатический"),
    art: <HydroArt />,
    rows: [
      { label: L.what, value: r("płyn wypełniający jamę ciała, zamknięty pod ciśnieniem", "жидкость, заполняющая полость тела, замкнутая под давлением") },
      { label: L.where, value: r("wewnątrz ciała, otoczony workiem powłokowo-mięśniowym", "внутри тела, окружён кожно-мускульным мешком") },
      { label: L.muscles, value: r("okrężne i podłużne w ścianie ciała; uciskają płyn i zmieniają kształt ciała", "кольцевые и продольные в стенке тела; давят на жидкость и меняют форму тела") },
      { label: L.growth, value: r("nie ogranicza wzrostu", "не ограничивает рост") },
      { label: L.who, value: r("pierścienice (dżdżownica), nicienie, parzydełkowce", "кольчатые черви (дождевой червь), круглые черви, кишечнополостные") },
    ],
    text: r("Płyn jest nieściśliwy, dlatego skurcz jednej warstwy mięśni zawsze zmienia kształt segmentu.", "Жидкость несжимаема, поэтому сокращение одного слоя мышц всегда меняет форму сегмента."),
  },
  {
    id: "exo",
    icon: "🦀",
    name: r("Zewnętrzny", "Наружный"),
    art: <ExoArt />,
    rows: [
      { label: L.what, value: r("oskórek z chityny, u skorupiaków wysycony węglanem wapnia", "кутикула из хитина, у ракообразных пропитанная карбонатом кальция") },
      { label: L.where, value: r("na powierzchni ciała — pancerz", "на поверхности тела — панцирь") },
      { label: L.muscles, value: r("przyczepione od wewnątrz do pancerza; odcinki połączone stawami", "прикреплены изнутри к панцирю; членики соединены сочленениями") },
      { label: L.growth, value: r("ogranicza wzrost — konieczne linienie", "ограничивает рост — нужна линька") },
      { label: L.who, value: r("stawonogi: owady, skorupiaki, pajęczaki", "членистоногие: насекомые, ракообразные, паукообразные") },
    ],
    text: r("Pancerz chroni też przed urazami i wysychaniem — to jedna z przyczyn sukcesu owadów na lądzie.", "Панцирь также защищает от травм и высыхания — одна из причин успеха насекомых на суше."),
  },
  {
    id: "endo",
    icon: "🦴",
    name: r("Wewnętrzny", "Внутренний"),
    art: <EndoArt />,
    rows: [
      { label: L.what, value: r("kości i chrząstki — żywe tkanki zbudowane z komórek i istoty międzykomórkowej", "кости и хрящи — живые ткани из клеток и межклеточного вещества") },
      { label: L.where, value: r("wewnątrz ciała", "внутри тела") },
      { label: L.muscles, value: r("przyczepione od zewnątrz do kości za pomocą ścięgien", "прикреплены снаружи к костям с помощью сухожилий") },
      { label: L.growth, value: r("rośnie razem z organizmem", "растёт вместе с организмом") },
      { label: L.who, value: r("kręgowce; u szkarłupni — wapienne płytki pod naskórkiem", "позвоночные; у иглокожих — известковые пластинки под покровами") },
    ],
    text: r("U lancetnika i zarodków strunowców rolę szkieletu wewnętrznego pełni elastyczna struna grzbietowa.", "У ланцетника и зародышей хордовых роль внутреннего скелета выполняет упругая хорда."),
  },
];

// ---------- earthworm ----------

type WormMode = "circ" | "long" | "wave";
const N = 9;
const W_THIN = 30;
const W_THICK = 18;
/** s: 0 = circular muscles contracted (long and thin), 1 = longitudinal contracted (short and thick) */
const segW = (s: number) => W_THIN - (W_THIN - W_THICK) * s;
/** the fluid's volume (here: the side area) stays the same */
const segH = (s: number) => 360 / segW(s);

const WORM_T = {
  circ: r("Kurczą się mięśnie okrężne", "Сокращаются кольцевые мышцы"),
  long: r("Kurczą się mięśnie podłużne", "Сокращаются продольные мышцы"),
  wave: r("▶ Fala skurczów", "▶ Волна сокращений"),
  circText: r(
    "Mięśnie okrężne ściskają segmenty jak obręcz — płyn przemieszcza się wzdłuż ciała, więc segmenty stają się cieńsze i dłuższe. Tył jest zakotwiczony szczecinkami, a przód wysuwa się do przodu.",
    "Кольцевые мышцы сжимают сегменты, как обруч, — жидкость смещается вдоль тела, сегменты становятся тоньше и длиннее. Задний конец заякорен щетинками, а передний выдвигается вперёд.",
  ),
  longText: r(
    "Mięśnie podłużne skracają segmenty — płyn rozpycha je na boki, więc stają się grubsze i krótsze. Teraz przód jest zakotwiczony szczecinkami i podciąga tył ciała. Przełączaj oba skurcze na zmianę, a dżdżownica ruszy naprzód.",
    "Продольные мышцы укорачивают сегменты — жидкость распирает их в стороны, они становятся толще и короче. Теперь заякорен передний конец, и он подтягивает заднюю часть тела. Чередуй оба сокращения, и червь поползёт вперёд.",
  ),
  waveText: r(
    "W naturze skurcze biegną falą od przodu do tyłu ciała (perystaltyka). Grube segmenty wysuwają szczecinki i opierają się o glebę, cienkie — sięgają do przodu. Dzięki temu dżdżownica sunie naprzód.",
    "В природе сокращения бегут волной от переднего конца к заднему (перистальтика). Толстые сегменты выдвигают щетинки и упираются в почву, тонкие — тянутся вперёд. Так червь движется вперёд.",
  ),
  circM: r("mięśnie okrężne", "кольцевые мышцы"),
  longM: r("mięśnie podłużne", "продольные мышцы"),
  fluid: r("płyn jamy ciała", "жидкость полости тела"),
  setae: r("szczecinki", "щетинки"),
  zoom: r("Jeden segment", "Один сегмент"),
};

interface WormState {
  s: number[];
  head: number;
  cam: number;
  t: number;
  /** which layer is shortening right now in the watched segment */
  active: "circ" | "long" | null;
}

const ZOOM_SEG = 3;

function Earthworm({ lang }: { lang: BioLang }) {
  const [mode, setMode] = useState<WormMode>("long");
  const sim = useRef<WormState>({ s: Array<number>(N).fill(1), head: 290, cam: 0, t: 0, active: null });
  const [, setTick] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = sim.current;
      st.t += dt;
      const target = st.s.map((_, i) => (mode === "wave" ? 0.5 + 0.5 * Math.sin(2 * Math.PI * (st.t / 2.4 - i / 6)) : mode === "long" ? 1 : 0));
      const next = mode === "wave" ? target : st.s.map((v, i) => v + (target[i]! - v) * Math.min(1, dt * 5));
      // the anchored segment keeps its place on the ground: the thickest one in the wave, the tail
      // while the worm stretches, the head while it shortens
      const a = mode === "wave" ? next.indexOf(Math.max(...next)) : mode === "circ" ? N - 1 : 0;
      const before = (arr: number[]) => arr.slice(0, a).reduce((sum, v) => sum + segW(v), 0) + segW(arr[a]!) / 2;
      const anchorX = st.head - before(st.s);
      const ds = next[ZOOM_SEG]! - st.s[ZOOM_SEG]!;
      st.active = Math.abs(ds) < 1e-4 ? null : ds < 0 ? "circ" : "long";
      st.head = anchorX + before(next);
      st.s = next;
      st.cam += (st.head - 300 - st.cam) * Math.min(1, dt * 1.2);
      setTick((k) => k + 1);
      const settled = mode !== "wave" && next.every((v, i) => Math.abs(v - target[i]!) < 0.002);
      if (settled) st.active = null;
      else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  const st = sim.current;
  const segs: { x: number; w: number; h: number; s: number }[] = [];
  let x = st.head - st.cam;
  for (const s of st.s) {
    const w = segW(s);
    segs.push({ x: x - w, w, h: segH(s), s });
    x -= w;
  }
  const z = st.s[ZOOM_SEG]!;
  const text = mode === "circ" ? WORM_T.circText : mode === "long" ? WORM_T.longText : WORM_T.waveText;
  const GROUND = 120;
  const pebbleOffset = ((st.cam % 50) + 50) % 50;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {(["circ", "long", "wave"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              mode === m ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {WORM_T[m][lang]}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 360 150" className="w-full" role="img" aria-label={WORM_T[mode][lang]}>
        <rect width={360} height={150} rx={12} fill="#fefce8" />
        <rect y={GROUND} width={360} height={30} fill="#a16207" opacity={0.35} />
        {Array.from({ length: 9 }, (_, k) => (
          <ellipse key={k} cx={k * 50 - pebbleOffset} cy={GROUND + 12} rx={6} ry={3.5} fill="#78350f" opacity={0.5} />
        ))}
        {segs.map((g, i) => (
          <g key={i}>
            {g.s > 0.75 &&
              [0.3, 0.7].map((f) => <line key={f} x1={g.x + g.w * f} y1={GROUND - 2} x2={g.x + g.w * f - 3} y2={GROUND + 5} stroke="#78350f" strokeWidth={1.5} />)}
            <rect
              x={g.x + 0.5}
              y={GROUND - 2 - g.h}
              width={g.w - 1}
              height={g.h}
              rx={i === 0 || i === N - 1 ? g.h / 2 : 5}
              fill={mix([251, 207, 232], [219, 39, 119], g.s * 0.7)}
              stroke="#9d174d"
              strokeWidth={1.2}
            />
            {i === ZOOM_SEG && <rect x={g.x + 0.5} y={GROUND - 4 - g.h} width={g.w - 1} height={g.h + 4} fill="none" stroke="#4f46e5" strokeWidth={1.5} strokeDasharray="3 2" rx={4} />}
          </g>
        ))}
        {segs[0] && <circle cx={segs[0]!.x + segs[0]!.w - 6} cy={GROUND - 2 - segs[0]!.h / 2 - 2} r={1.6} fill="#831843" />}
      </svg>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <figure className="rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
          <figcaption className="px-1 text-xs font-semibold text-slate-500">{WORM_T.zoom[lang]}</figcaption>
          <svg viewBox="0 0 160 110" className="w-full" role="img" aria-label={WORM_T.zoom[lang]}>
            {(() => {
              const w = segW(z) * 3.6;
              const h = segH(z) * 3.6;
              const x0 = 80 - w / 2;
              const y0 = 55 - h / 2;
              const circOn = st.active === "circ" || (st.active === null && mode === "circ");
              const longOn = st.active === "long" || (st.active === null && mode === "long");
              return (
                <>
                  <rect x={x0} y={y0} width={w} height={h} rx={12} fill="#bfdbfe" />
                  <rect x={x0} y={y0} width={w} height={h} rx={12} fill="none" stroke={circOn ? "#f59e0b" : "#fcd34d"} strokeWidth={circOn ? 7 : 4} />
                  <rect x={x0 + 8} y={y0 + 7} width={w - 16} height={5} rx={2.5} fill={longOn ? "#0284c7" : "#7dd3fc"} />
                  <rect x={x0 + 8} y={y0 + h - 12} width={w - 16} height={5} rx={2.5} fill={longOn ? "#0284c7" : "#7dd3fc"} />
                  <text x={80} y={59} textAnchor="middle" fontSize={9} fill="#1e3a8a">
                    H₂O
                  </text>
                </>
              );
            })()}
          </svg>
          <ul className="space-y-0.5 px-1 text-xs text-slate-600">
            <li>
              <span className="mr-1 inline-block h-2 w-3 rounded-sm bg-amber-500 align-middle" /> {WORM_T.circM[lang]}
            </li>
            <li>
              <span className="mr-1 inline-block h-2 w-3 rounded-sm bg-sky-600 align-middle" /> {WORM_T.longM[lang]}
            </li>
            <li>
              <span className="mr-1 inline-block h-2 w-3 rounded-sm bg-blue-200 align-middle" /> {WORM_T.fluid[lang]}
            </li>
          </ul>
        </figure>
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-[15px] leading-relaxed text-emerald-950 ring-1 ring-emerald-200" aria-live="polite">
          {text[lang]}
        </p>
      </div>
    </div>
  );
}

// ---------- molting ----------

const MOLTS = [18, 38, 60, 84];
const crabSize = (t: number) => 20 * 1.32 ** MOLTS.filter((m) => t >= m).length;
const vertSize = (t: number) => 20 + 37 * (1 - Math.exp(-t / 45));

const MOLT_T = {
  time: r("Czas", "Время"),
  arthropod: r("stawonóg", "членистоногое"),
  vertebrate: r("kręgowiec", "позвоночное"),
  size: r("wielkość ciała", "размер тела"),
  hard: r(
    "Pancerz jest twardy i nie rozciąga się — stawonóg w tym czasie nie zwiększa wymiarów ciała (choć może przybierać na masie).",
    "Панцирь твёрдый и не растягивается — в это время членистоногое не увеличивает размеры тела (хотя может набирать массу).",
  ),
  molt: r(
    "Linienie! Pod wpływem hormonu ekdyzonu stary oskórek pęka i zostaje zrzucony (wylinka). Nowy jest jeszcze miękki: zwierzę pobiera wodę lub powietrze, powiększa ciało, zanim pancerz stwardnieje. W tym czasie jest bezbronne.",
    "Линька! Под действием гормона экдизона старая кутикула лопается и сбрасывается (экзувий). Новая ещё мягкая: животное набирает воду или воздух и увеличивается, пока панцирь не затвердеет. В это время оно беззащитно.",
  ),
  vert: r("Kręgowiec rośnie płynnie — kości rosną razem z resztą ciała.", "Позвоночное растёт плавно — кости растут вместе с остальным телом."),
};

function Molting({ lang }: { lang: BioLang }) {
  const [t, setT] = useState(10);
  const molting = MOLTS.some((m) => t >= m && t < m + 5);
  const X = (v: number) => 30 + v * 3.1;
  const Y = (v: number) => 170 - (v - 15) * 3;
  let stair = `M${X(0)} ${Y(crabSize(0))}`;
  for (const m of MOLTS) stair += ` H ${X(m)} V ${Y(crabSize(m))}`;
  stair += ` H ${X(100)}`;
  const smooth = Array.from({ length: 51 }, (_, k) => `${k ? "L" : "M"}${X(k * 2)} ${Y(vertSize(k * 2))}`).join(" ");
  const size = crabSize(t);
  const lastMolt = [...MOLTS].reverse().find((m) => t >= m);
  // the new shell darkens over the five time units after a molt
  const hardness = lastMolt === undefined ? 1 : Math.min(1, (t - lastMolt) / 5);
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div>
        <svg viewBox="0 0 360 200" className="w-full" role="img" aria-label={MOLT_T.size[lang]}>
          <rect width={360} height={200} rx={12} fill="#f8fafc" />
          {MOLTS.map((m) => (
            <rect key={m} x={X(m)} y={14} width={X(m + 5) - X(m)} height={162} fill="#fef3c7" />
          ))}
          <line x1={30} y1={176} x2={344} y2={176} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={30} y1={176} x2={30} y2={14} stroke="#94a3b8" strokeWidth={1.5} />
          <text x={344} y={192} textAnchor="end" fontSize={11} fill="#64748b">
            {MOLT_T.time[lang]} →
          </text>
          <text x={36} y={22} fontSize={11} fill="#64748b">
            {MOLT_T.size[lang]}
          </text>
          <path d={smooth} fill="none" stroke="#0ea5e9" strokeWidth={3} strokeDasharray="6 4" />
          <path d={stair} fill="none" stroke="#ea580c" strokeWidth={3.5} />
          <line x1={X(t)} y1={14} x2={X(t)} y2={176} stroke="#4f46e5" strokeWidth={2} />
          <circle cx={X(t)} cy={Y(size)} r={5} fill="#ea580c" stroke="white" strokeWidth={2} />
          <circle cx={X(t)} cy={Y(vertSize(t))} r={5} fill="#0ea5e9" stroke="white" strokeWidth={2} />
        </svg>
        <label className="mt-2 block text-sm font-semibold text-slate-700">
          {MOLT_T.time[lang]}
          <input
            type="range"
            min={0}
            max={100}
            value={t}
            onChange={(e) => setT(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-orange-600"
            aria-valuetext={molting ? MOLT_T.molt[lang] : MOLT_T.hard[lang]}
          />
        </label>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
          <span>
            <span className="mr-1 inline-block h-1 w-5 bg-orange-600 align-middle" /> {MOLT_T.arthropod[lang]}
          </span>
          <span>
            <span className="mr-1 inline-block h-1 w-5 border-t-2 border-dashed border-sky-500 align-middle" /> {MOLT_T.vertebrate[lang]}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <svg viewBox="0 0 160 110" className="mx-auto w-full max-w-[220px]" aria-hidden>
          <rect width={160} height={110} rx={12} fill="#ecfeff" />
          {molting && lastMolt !== undefined && (
            <ellipse cx={40} cy={74} rx={crabSize(lastMolt - 1) * 0.7} ry={crabSize(lastMolt - 1) * 0.45} fill="none" stroke="#a8a29e" strokeWidth={2} strokeDasharray="4 3" />
          )}
          <ellipse
            cx={molting ? 104 : 80}
            cy={66}
            rx={size * 0.7}
            ry={size * 0.45}
            fill={mix([255, 237, 213], [234, 88, 12], hardness)}
            stroke="#9a3412"
            strokeWidth={1 + hardness * 2.5}
            style={{ transition: "all .3s" }}
          />
        </svg>
        <p
          className={`rounded-xl px-4 py-3 text-[15px] leading-relaxed ring-1 ${molting ? "bg-amber-50 text-amber-950 ring-amber-200" : "bg-slate-50 text-slate-700 ring-slate-200"}`}
          aria-live="polite"
        >
          {molting ? MOLT_T.molt[lang] : MOLT_T.hard[lang]}
        </p>
        <p className="text-sm text-slate-600">{MOLT_T.vert[lang]}</p>
      </div>
    </div>
  );
}

// ---------- quizzes ----------

const SKELETON_OPTIONS: QuizOption[] = [
  { id: "hydro", label: r("hydrostatyczny", "гидростатический") },
  { id: "exo", label: r("zewnętrzny", "наружный") },
  { id: "endo", label: r("wewnętrzny", "внутренний") },
];

const ANIMALS: QuizItem[] = [
  { icon: "🪱", name: r("dżdżownica", "дождевой червь"), answer: "hydro", explain: r("Płyn w segmentach otoczony workiem powłokowo-mięśniowym.", "Жидкость в сегментах, окружённая кожно-мускульным мешком.") },
  { icon: "🐜", name: r("mrówka", "муравей"), answer: "exo", explain: r("Owady mają chitynowy oskórek; mięśnie przyczepiają się do niego od wewnątrz.", "У насекомых хитиновая кутикула; мышцы крепятся к ней изнутри.") },
  { icon: "🐸", name: r("żaba", "лягушка"), answer: "endo", explain: r("Płazy, jak wszystkie kręgowce, mają szkielet kostny wewnątrz ciała.", "Земноводные, как все позвоночные, имеют костный скелет внутри тела.") },
  { icon: "🦞", name: r("rak", "рак"), answer: "exo", explain: r("Pancerz skorupiaków to chityna wysycona węglanem wapnia — rak musi linieć, by rosnąć.", "Панцирь ракообразных — хитин, пропитанный карбонатом кальция; чтобы расти, рак должен линять.") },
  { icon: "🪱", name: r("glista ludzka", "человеческая аскарида"), answer: "hydro", explain: r("Nicienie mają tylko mięśnie podłużne, które napierają na płyn w jamie ciała — stąd wijące się ruchy.", "У круглых червей есть только продольные мышцы, давящие на жидкость в полости тела, — отсюда изгибающиеся движения.") },
  { icon: "🦈", name: r("rekin", "акула"), answer: "endo", explain: r("Ryby chrzęstnoszkieletowe mają szkielet wewnętrzny z chrząstki.", "У хрящевых рыб внутренний скелет из хряща.") },
  { icon: "🕷️", name: r("pająk", "паук"), answer: "exo", explain: r("Pajęczaki to stawonogi — mają chitynowy szkielet zewnętrzny.", "Паукообразные — членистоногие, у них хитиновый наружный скелет.") },
  { icon: "⭐", name: r("rozgwiazda", "морская звезда"), answer: "endo", explain: r("Szkarłupnie mają wapienne płytki leżące pod nabłonkiem — to szkielet wewnętrzny.", "У иглокожих известковые пластинки лежат под эпителием — это внутренний скелет.") },
  { icon: "🪼", name: r("stułbia", "гидра"), answer: "hydro", explain: r("Ruchy stułbi opierają się na płynie wypełniającym jamę chłonąco-trawiącą.", "Движения гидры основаны на жидкости, заполняющей кишечную полость.") },
];

const MOVE_OPTIONS: QuizOption[] = [
  { id: "amoeboid", label: r("ruch pełzakowaty", "амёбоидное движение") },
  { id: "cilia", label: r("ruch rzęskowy", "ресничное движение") },
  { id: "flagella", label: r("ruch wiciowy", "жгутиковое движение") },
  { id: "jet", label: r("ruch odrzutowy", "реактивное движение") },
];

const MOVERS: QuizItem[] = [
  { icon: "🦠", name: r("ameba (pełzak)", "амёба"), answer: "amoeboid", explain: r("Cytoplazma przelewa się do wypustek — nibynóżek.", "Цитоплазма перетекает в выросты — ложноножки.") },
  { icon: "🩸", name: r("makrofag wędrujący w tkankach", "макрофаг, мигрирующий в тканях"), answer: "amoeboid", explain: r("Leukocyty przeciskają się między komórkami ruchem pełzakowatym, tworząc nibynóżki.", "Лейкоциты протискиваются между клетками амёбоидным движением, образуя ложноножки.") },
  { icon: "🥿", name: r("pantofelek", "инфузория-туфелька"), answer: "cilia", explain: r("Tysiące rzęsek biją zgodnie jak wiosła.", "Тысячи ресничек бьют согласованно, как вёсла.") },
  { icon: "🪱", name: r("wypławek", "планария"), answer: "cilia", explain: r("Rzęski na brzusznej stronie ciała przesuwają go po podłożu pokrytym śluzem.", "Биение ресничек на брюшной стороне тела перемещает планарию по слою слизи на субстрате.") },
  { icon: "🧬", name: r("plemnik", "сперматозоид"), answer: "flagella", explain: r("Plemnik porusza się dzięki jednej długiej witce.", "Сперматозоид движется благодаря одному длинному жгутику.") },
  { icon: "🦑", name: r("kałamarnica", "кальмар"), answer: "jet", explain: r("Głowonogi gwałtownie wyrzucają wodę z jamy płaszczowej przez lejek.", "Головоногие резко выталкивают воду из мантийной полости через воронку.") },
  { icon: "🐙", name: r("ośmiornica uciekająca przed drapieżnikiem", "осьминог, спасающийся от хищника"), answer: "jet", explain: r("W ucieczce ośmiornica też korzysta z odrzutu wody z lejka.", "Спасаясь, осьминог тоже использует реактивную струю из воронки.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Szkielet hydrostatyczny — płyn pod ciśnieniem; zewnętrzny — chitynowy pancerz stawonogów; wewnętrzny — kości i chrząstki kręgowców.", ru: "Гидростатический скелет — жидкость под давлением; наружный — хитиновый панцирь членистоногих; внутренний — кости и хрящи позвоночных." },
    { pl: "Mięśnie przyczepiają się do szkieletu zewnętrznego od wewnątrz, a do wewnętrznego — od zewnątrz.", ru: "К наружному скелету мышцы крепятся изнутри, к внутреннему — снаружи." },
  ],
  s2: [
    { pl: "Wór powłokowo-mięśniowy dżdżownicy ma mięśnie okrężne (segment cieńszy i dłuższy) i podłużne (segment grubszy i krótszy).", ru: "Кожно-мускульный мешок дождевого червя содержит кольцевые мышцы (сегмент тоньше и длиннее) и продольные (сегмент толще и короче)." },
    { pl: "Mięśnie działają antagonistycznie — przeciwstawnie, a płyn przenosi siłę skurczu.", ru: "Мышцы работают антагонистически — противоположно, а жидкость передаёт силу сокращения." },
  ],
  s3: [{ pl: "Linienie (zrzucanie oskórka) umożliwia stawonogom wzrost; reguluje je hormon ekdyzon.", ru: "Линька (сбрасывание кутикулы) позволяет членистоногим расти; её регулирует гормон экдизон." }],
  s4: [{ pl: "Stawonogi — szkielet zewnętrzny; pierścienice i nicienie — hydrostatyczny; kręgowce i szkarłupnie — wewnętrzny.", ru: "Членистоногие — наружный скелет; кольчатые и круглые черви — гидростатический; позвоночные и иглокожие — внутренний." }],
  s5: [
    { pl: "Ruch pełzakowaty — nibynóżki (ameba, leukocyty); rzęskowy — rzęski (pantofelek, wypławek); wiciowy — wić (plemnik).", ru: "Амёбоидное движение — ложноножки (амёба, лейкоциты); ресничное — реснички (туфелька, планария); жгутиковое — жгутик (сперматозоид)." },
    { pl: "Ruch odrzutowy — wyrzucanie wody z jamy płaszczowej przez lejek (głowonogi).", ru: "Реактивное движение — выталкивание воды из мантийной полости через воронку (головоногие)." },
  ],
};

export default function MotionAnimalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="mova" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="mova-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={SKELETONS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="mova-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Earthworm lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="mova-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Molting lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="mova-s4" n={4} title={T.s4[lang]}>
        <MatchQuiz
          lang={lang}
          title={T.s4}
          question={r("Jaki szkielet ma", "Какой скелет у")}
          options={SKELETON_OPTIONS}
          items={ANIMALS}
          wrongHint={r("Zastanów się, do jakiej grupy zwierząt należy i czy ma pancerz albo kości.", "Подумай, к какой группе животных оно относится и есть ли у него панцирь или кости.")}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="mova-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s5}
          question={r("Jak porusza się", "Как передвигается")}
          options={MOVE_OPTIONS}
          items={MOVERS}
          wrongHint={r("Pomyśl, jakie struktury ma ten organizm na powierzchni komórki lub ciała.", "Подумай, какие структуры есть у этого организма на поверхности клетки или тела.")}
        />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
