// Lesson for LO3 §3.5 "Budowa i funkcjonowanie układu mięśniowego" (Biologia na czasie 3, zakres
// rozszerzony). Terms follow templates/data/systemsMore.ts (MUSCLE_WORK) and systems.ts
// (MOTION_PARTS: sarkomer, aktyna i miozyna, ścięgno, mięśnie antagonistyczne).
import { useEffect, useRef, useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, OrderGame, TwoWaySort, type CompareCard, type SortItem } from "@portal/lessons";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Mięśnie to czynna część układu ruchu: kurcząc się, ciągną za kości jak za dźwignie. Skurcz zaczyna się w najmniejszej jednostce — sarkomerze, w którym białkowe filamenty aktyny i miozyny wsuwają się między siebie kosztem energii z ATP.",
    "Мышцы — активная часть опорно-двигательной системы: сокращаясь, они тянут кости, как рычаги. Сокращение начинается в мельчайшей единице — саркомере, где белковые нити актина и миозина вдвигаются друг между другом за счёт энергии АТФ.",
  ),
  s1: r("Trzy rodzaje tkanki mięśniowej", "Три вида мышечной ткани"),
  s1intro: r("Porównaj budowę i pracę tkanek mięśniowych.", "Сравни строение и работу мышечных тканей."),
  s2: r("Sarkomer — jak skraca się mięsień", "Саркомер — как укорачивается мышца"),
  s2intro: r(
    "Mięsień → pęczki → włókna mięśniowe → miofibryle → sarkomery. Przesuń suwak i zobacz, co zmienia się w sarkomerze podczas skurczu, a co nie.",
    "Мышца → пучки → мышечные волокна → миофибриллы → саркомеры. Сдвинь ползунок и посмотри, что меняется в саркомере при сокращении, а что — нет.",
  ),
  s3: r("Od impulsu do skurczu", "От импульса к сокращению"),
  s3intro: r("Ułóż w kolejności zdarzenia, które prowadzą od impulsu nerwowego do skurczu i rozkurczu włókna mięśniowego.", "Расставь по порядку события, ведущие от нервного импульса к сокращению и расслаблению мышечного волокна."),
  s4: r("Mięśnie antagonistyczne", "Мышцы-антагонисты"),
  s4intro: r("Mięsień potrafi tylko ciągnąć, więc ruchy przeciwne wykonują dwa różne mięśnie. Zginaj i prostuj rękę w łokciu.", "Мышца умеет только тянуть, поэтому противоположные движения выполняют две разные мышцы. Сгибай и разгибай руку в локте."),
  s5: r("Rodzaje skurczów i energia", "Виды сокращений и энергия"),
  s5intro: r(
    "W skurczu izotonicznym mięsień skraca się przy stałym napięciu, w izometrycznym — napina się, nie zmieniając długości. Do obu potrzebny jest ATP.",
    "При изотоническом сокращении мышца укорачивается при постоянном напряжении, при изометрическом — напрягается, не меняя длины. Для обоих нужен АТФ.",
  ),
} satisfies Record<string, Txt>;

// ---------- muscle tissues ----------

const L = {
  cells: r("Komórki", "Клетки"),
  nuclei: r("Jądra", "Ядра"),
  stripes: r("Prążkowanie", "Исчерченность"),
  work: r("Skurcz", "Сокращение"),
  control: r("Kontrola", "Управление"),
  where: r("Występowanie", "Где встречается"),
};

function SkeletalArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
      {[18, 58].map((y) => (
        <g key={y}>
          <rect x={6} y={y} width={188} height={34} rx={8} fill="#fecdd3" stroke="#e11d48" strokeWidth={1.5} />
          {Array.from({ length: 30 }, (_, k) => (
            <line key={k} x1={12 + k * 6.2} y1={y + 3} x2={12 + k * 6.2} y2={y + 31} stroke="#be123c" strokeWidth={k % 2 ? 1 : 2.2} opacity={0.55} />
          ))}
          {[30, 90, 150].map((x) => (
            <ellipse key={x} cx={x + (y === 58 ? 20 : 0)} cy={y + 4} rx={9} ry={3} fill="#4c1d95" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function SmoothArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
      {[
        [20, 30],
        [90, 22],
        [56, 58],
        [128, 52],
        [30, 86],
        [104, 84],
      ].map(([x, y], k) => (
        <g key={k}>
          <path d={`M${x} ${y} Q ${x! + 34} ${y! - 12} ${x! + 68} ${y} Q ${x! + 34} ${y! + 12} ${x} ${y} Z`} fill="#fecdd3" stroke="#e11d48" strokeWidth={1.5} />
          <ellipse cx={x! + 34} cy={y} rx={7} ry={2.6} fill="#4c1d95" />
        </g>
      ))}
    </svg>
  );
}

function CardiacArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
      <path d="M6 28 L 90 28 L 110 14 L 194 14 L 194 44 L 116 44 L 100 56 L 6 56 Z" fill="#fecdd3" stroke="#e11d48" strokeWidth={1.5} />
      <path d="M6 62 L 96 62 L 112 74 L 194 74 L 194 100 L 6 100 Z" fill="#fecdd3" stroke="#e11d48" strokeWidth={1.5} />
      {Array.from({ length: 31 }, (_, k) => (
        <g key={k} opacity={0.5}>
          <line x1={8 + k * 6.2} y1={k > 14 ? 16 : 30} x2={8 + k * 6.2} y2={k > 14 ? 42 : 54} stroke="#be123c" strokeWidth={1.3} />
          <line x1={8 + k * 6.2} y1={k > 16 ? 76 : 64} x2={8 + k * 6.2} y2={98} stroke="#be123c" strokeWidth={1.3} />
        </g>
      ))}
      <path d="M60 28 L 60 56 M150 14 L 150 44 M70 62 L 70 100 M150 74 L 150 100" stroke="#0f172a" strokeWidth={3} />
      <ellipse cx={34} cy={42} rx={7} ry={3} fill="#4c1d95" />
      <ellipse cx={124} cy={29} rx={7} ry={3} fill="#4c1d95" />
      <ellipse cx={110} cy={87} rx={7} ry={3} fill="#4c1d95" />
    </svg>
  );
}

const TISSUES: CompareCard[] = [
  {
    id: "skeletal",
    icon: "🏋️",
    name: r("Szkieletowa", "Скелетная"),
    art: <SkeletalArt />,
    rows: [
      { label: L.cells, value: r("długie, walcowate włókna mięśniowe — komórki powstałe z połączenia wielu komórek", "длинные цилиндрические мышечные волокна — клетки, образовавшиеся при слиянии многих клеток") },
      { label: L.nuclei, value: r("wiele, na obwodzie włókna", "много, на периферии волокна") },
      { label: L.stripes, value: r("poprzeczne prążkowanie", "поперечная исчерченность") },
      { label: L.work, value: r("szybki i silny, ale szybko się męczy", "быстрое и сильное, но быстро утомляется") },
      { label: L.control, value: r("zależna od woli", "произвольное") },
      { label: L.where, value: r("mięśnie szkieletowe, przyczepione ścięgnami do kości", "скелетные мышцы, прикреплённые сухожилиями к костям") },
    ],
  },
  {
    id: "smooth",
    icon: "🌀",
    name: r("Gładka", "Гладкая"),
    art: <SmoothArt />,
    rows: [
      { label: L.cells, value: r("wrzecionowate komórki", "веретеновидные клетки") },
      { label: L.nuclei, value: r("jedno, w środku komórki", "одно, в центре клетки") },
      { label: L.stripes, value: r("brak — filamenty nie tworzą sarkomerów", "нет — филаменты не образуют саркомеров") },
      { label: L.work, value: r("powolny, długotrwały, mało męczący", "медленное, длительное, малоутомляемое") },
      { label: L.control, value: r("niezależna od woli (autonomiczny układ nerwowy, hormony)", "непроизвольное (вегетативная нервная система, гормоны)") },
      { label: L.where, value: r("ściany przewodu pokarmowego, naczyń krwionośnych, pęcherza moczowego, macicy", "стенки пищеварительного тракта, кровеносных сосудов, мочевого пузыря, матки") },
    ],
  },
  {
    id: "cardiac",
    icon: "❤️",
    name: r("Sercowa", "Сердечная"),
    art: <CardiacArt />,
    rows: [
      { label: L.cells, value: r("rozgałęzione komórki połączone wstawkami (czarne kreski)", "ветвящиеся клетки, соединённые вставочными дисками (чёрные полоски)") },
      { label: L.nuclei, value: r("1–2, w środku komórki", "1–2, в центре клетки") },
      { label: L.stripes, value: r("poprzeczne prążkowanie", "поперечная исчерченность") },
      { label: L.work, value: r("rytmiczny, praktycznie się nie męczy", "ритмичное, практически не утомляется") },
      { label: L.control, value: r("niezależna od woli — automatyzm serca", "непроизвольное — автоматия сердца") },
      { label: L.where, value: r("tylko ściana serca", "только стенка сердца") },
    ],
    text: r("Wstawki przewodzą pobudzenie z komórki do komórki, więc mięsień sercowy kurczy się jak jedna całość.", "Вставочные диски проводят возбуждение от клетки к клетке, поэтому сердечная мышца сокращается как единое целое."),
  },
];

// ---------- sarcomere ----------

const ACTIN = 1.0;
const MYOSIN = 1.6;
const S_MAX = 3.0;
const S_MIN = 2.0;
const PX = 100;
const CX = 180;

const SARC_T = {
  slider: r("Stopień skurczu", "Степень сокращения"),
  relaxed: r("rozkurcz", "расслабление"),
  contracted: r("skurcz", "сокращение"),
  length: r("Długość sarkomeru", "Длина саркомера"),
  a: r("prążek A (ciemny)", "диск A (тёмный)"),
  i: r("prążek I (jasny)", "диск I (светлый)"),
  h: r("strefa H", "зона H"),
  same: r("bez zmian", "не меняется"),
  actin: r("aktyna (filament cienki)", "актин (тонкая нить)"),
  myosin: r("miozyna (filament gruby)", "миозин (толстая нить)"),
  bridges: r("mostki poprzeczne", "поперечные мостики"),
  note: r(
    "Filamenty nie skracają się — aktyna wsuwa się między miozynę. Linie Z zbliżają się do siebie, prążek I i strefa H się zwężają, a szerokość prążka A pozostaje stała.",
    "Нити не укорачиваются — актин вдвигается между нитями миозина. Z-линии сближаются, диск I и зона H сужаются, а ширина диска A остаётся постоянной.",
  ),
  um: r("µm", "мкм"),
};

function Sarcomere({ lang }: { lang: BioLang }) {
  const [c, setC] = useState(30);
  const S = S_MAX - ((S_MAX - S_MIN) * c) / 100;
  const zL = CX - (S / 2) * PX;
  const zR = CX + (S / 2) * PX;
  const aL = CX - (MYOSIN / 2) * PX;
  const aR = CX + (MYOSIN / 2) * PX;
  const H = Math.max(0, S - 2 * ACTIN);
  const I = S - MYOSIN;
  const actinTipL = zL + ACTIN * PX;
  const actinTipR = zR - ACTIN * PX;
  const um = SARC_T.um[lang];
  const heads = Array.from({ length: 14 }, (_, k) => aL + 6 + k * 11.3).filter((x) => Math.abs(x - CX) > 9);
  const bound = (x: number) => (x < CX ? x <= actinTipL : x >= actinTipR);
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 360 236" className="w-full" role="img" aria-label={`${SARC_T.length[lang]}: ${num(S, 1)} ${um}`}>
        <rect width={360} height={236} rx={12} fill="#f8fafc" />
        {/* the striation as seen under a microscope */}
        <rect x={zL} y={10} width={zR - zL} height={14} fill="white" stroke="#cbd5e1" />
        <rect x={aL} y={10} width={aR - aL} height={14} fill="#64748b" />
        {H > 0 && <rect x={CX - (H / 2) * PX} y={10} width={H * PX} height={14} fill="#94a3b8" />}
        {/* bands */}
        <g fontSize={10} fill="#334155" textAnchor="middle">
          <path d={`M${aL} 40 L ${aL} 34 L ${aR} 34 L ${aR} 40`} fill="none" stroke="#475569" strokeWidth={1.5} />
          <text x={CX} y={31}>
            {lang === "pl" ? "prążek A" : "диск A"}
          </text>
          {H > 0.12 && (
            <>
              <path d={`M${CX - (H / 2) * PX} 50 L ${CX - (H / 2) * PX} 46 L ${CX + (H / 2) * PX} 46 L ${CX + (H / 2) * PX} 50`} fill="none" stroke="#7c3aed" strokeWidth={1.5} />
              <text x={CX} y={58} fill="#7c3aed" fontSize={9}>
                H
              </text>
            </>
          )}
          {I > 0.1 &&
            [
              [zL, aL],
              [aR, zR],
            ].map(([x1, x2], k) => (
              <g key={k}>
                <path d={`M${x1} 196 L ${x1} 202 L ${x2} 202 L ${x2} 196`} fill="none" stroke="#0284c7" strokeWidth={1.5} />
                <text x={(x1! + x2!) / 2} y={216} fill="#0284c7">
                  {I > 0.5 ? (lang === "pl" ? "½ prążka I" : "½ диска I") : "I"}
                </text>
              </g>
            ))}
        </g>
        {/* thin filaments */}
        {[72, 104, 136, 168].map((y) => (
          <g key={y} stroke="#0ea5e9" strokeWidth={3.5} strokeLinecap="round">
            <line x1={zL} y1={y} x2={actinTipL} y2={y} />
            <line x1={actinTipR} y1={y} x2={zR} y2={y} />
          </g>
        ))}
        {/* thick filaments with heads */}
        {[88, 120, 152].map((y) => (
          <g key={y}>
            <rect x={aL} y={y - 4.5} width={aR - aL} height={9} rx={4.5} fill="#e11d48" />
            {heads.map((x) => {
              const on = bound(x);
              const dir = x < CX ? -1 : 1;
              return (
                <g key={x} stroke={on ? "#7f1d1d" : "#fda4af"} strokeWidth={2} strokeLinecap="round">
                  <line x1={x} y1={y - 4} x2={x + dir * 4} y2={y - 11} />
                  <line x1={x} y1={y + 4} x2={x + dir * 4} y2={y + 11} />
                </g>
              );
            })}
          </g>
        ))}
        {/* Z lines and M line */}
        {[zL, zR].map((x) => (
          <g key={x}>
            <path d={`M${x} 62 l 4 8 l -8 8 l 8 8 l -8 8 l 8 8 l -8 8 l 8 8 l -8 8 l 8 8 l -8 8 l 8 8 l -4 8`} fill="none" stroke="#0f172a" strokeWidth={2.5} strokeLinejoin="round" />
            <text x={x} y={190} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">
              Z
            </text>
          </g>
        ))}
        <line x1={CX} y1={64} x2={CX} y2={176} stroke="#475569" strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={CX} y={190} textAnchor="middle" fontSize={10} fill="#475569">
          M
        </text>
      </svg>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            {SARC_T.slider[lang]}
            <input
              type="range"
              min={0}
              max={100}
              value={c}
              onChange={(e) => setC(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer accent-rose-600"
              aria-valuetext={`${SARC_T.length[lang]}: ${num(S, 1)} ${um}`}
            />
            <span className="mt-1 flex justify-between text-xs font-normal text-slate-500">
              <span>{SARC_T.relaxed[lang]}</span>
              <span>{SARC_T.contracted[lang]}</span>
            </span>
          </label>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            <li>
              <span className="mr-1 inline-block h-1 w-5 bg-sky-500 align-middle" /> {SARC_T.actin[lang]}
            </li>
            <li>
              <span className="mr-1 inline-block h-2 w-5 rounded bg-rose-600 align-middle" /> {SARC_T.myosin[lang]}
            </li>
            <li>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-900 align-middle" /> {SARC_T.bridges[lang]}
            </li>
          </ul>
        </div>
        <div className="space-y-2" aria-live="polite">
          <table className="w-full text-sm">
            <tbody>
              {[
                [SARC_T.length, `${num(S, 2)} ${um}`, "text-slate-900"],
                [SARC_T.a, `${num(MYOSIN, 1)} ${um} · ${SARC_T.same[lang]}`, "text-slate-900"],
                [SARC_T.i, `${num(I, 2)} ${um}`, "text-sky-700"],
                [SARC_T.h, `${num(H, 2)} ${um}`, "text-violet-700"],
              ].map(([label, value, cls]) => (
                <tr key={(label as Txt).pl} className="border-b border-slate-200 last:border-0">
                  <th scope="row" className="py-1.5 pr-3 text-left font-medium text-slate-500">
                    {(label as Txt)[lang]}
                  </th>
                  <td className={`py-1.5 font-semibold tabular-nums ${cls as string}`}>{value as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm leading-relaxed text-slate-600">{SARC_T.note[lang]}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- contraction steps ----------

const STEPS: Txt[] = [
  r("uwolnienie acetylocholiny w płytce nerwowo-mięśniowej", "выделение ацетилхолина в нервно-мышечном синапсе"),
  r("depolaryzacja błony włókna mięśniowego", "деполяризация мембраны мышечного волокна"),
  r("uwolnienie jonów Ca²⁺ z siateczki sarkoplazmatycznej", "выход ионов Ca²⁺ из саркоплазматической сети"),
  r("odsłonięcie na aktynie miejsc wiązania miozyny", "открытие на актине мест связывания миозина"),
  r("utworzenie mostków poprzecznych miozyna–aktyna", "образование поперечных мостиков миозин–актин"),
  r("przesunięcie aktyny ku środkowi sarkomeru (energia z ATP)", "сдвиг актина к центру саркомера (энергия АТФ)"),
  r("skrócenie sarkomerów — skurcz", "укорочение саркомеров — сокращение"),
  r("powrót Ca²⁺ do siateczki — rozkurcz", "возврат Ca²⁺ в сеть — расслабление"),
];

// ---------- antagonists ----------

type Phase = "flex" | "extend" | null;

const ARM_T = {
  angle: r("Kąt w stawie łokciowym", "Угол в локтевом суставе"),
  flex: r("Zegnij", "Согни"),
  extend: r("Wyprostuj", "Разогни"),
  biceps: r("mięsień dwugłowy ramienia (zginacz)", "двуглавая мышца плеча (сгибатель)"),
  triceps: r("mięsień trójgłowy ramienia (prostownik)", "трёхглавая мышца плеча (разгибатель)"),
  contracts: r("kurczy się", "сокращается"),
  relaxes: r("rozkurcza się i jest rozciągany", "расслабляется и растягивается"),
  idle: r("Poruszaj suwakiem albo użyj przycisków.", "Двигай ползунок или нажимай кнопки."),
  flexText: r("Zginanie: mięsień dwugłowy kurczy się i pociąga kość promieniową, a mięsień trójgłowy rozkurcza się.", "Сгибание: двуглавая мышца сокращается и тянет лучевую кость, а трёхглавая расслабляется."),
  extendText: r("Prostowanie: mięsień trójgłowy kurczy się i ciągnie za wyrostek łokciowy, a mięsień dwugłowy rozkurcza się.", "Разгибание: трёхглавая мышца сокращается и тянет за локтевой отросток, а двуглавая расслабляется."),
};

const SHOULDER: [number, number] = [96, 30];
const ELBOW: [number, number] = [96, 150];

/** a muscle belly between two attachments, bulging to one side by an amount that grows as it shortens */
function belly(o: [number, number], i: [number, number], side: 1 | -1, thick: number): string {
  const dx = i[0] - o[0];
  const dy = i[1] - o[1];
  const len = Math.hypot(dx, dy);
  let nx = -dy / len;
  let ny = dx / len;
  if (Math.sign(nx || 1) !== side) {
    nx = -nx;
    ny = -ny;
  }
  const mx = (o[0] + i[0]) / 2;
  const my = (o[1] + i[1]) / 2;
  return `M${o[0]} ${o[1]} Q ${mx + nx * thick * 2} ${my + ny * thick * 2} ${i[0]} ${i[1]} Q ${mx - nx * thick * 0.4} ${my - ny * thick * 0.4} ${o[0]} ${o[1]} Z`;
}

function Antagonists({ lang }: { lang: BioLang }) {
  const [angle, setAngle] = useState(160);
  const [phase, setPhase] = useState<Phase>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const current = useRef(160);

  useEffect(() => {
    if (goal === null) return;
    let raf = 0;
    const step = () => {
      const a = current.current;
      const next = a + Math.sign(goal - a) * Math.min(2, Math.abs(goal - a));
      current.current = next;
      setAngle(next);
      if (next !== goal) raf = requestAnimationFrame(step);
      else setGoal(null);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [goal]);

  const go = (to: number) => {
    if (to === angle) return;
    setPhase(to < angle ? "flex" : "extend");
    setGoal(to);
  };

  const a = (angle * Math.PI) / 180;
  const dir: [number, number] = [Math.sin(a), -Math.cos(a)];
  const n: [number, number] = [dir[1], -dir[0]];
  const hand: [number, number] = [ELBOW[0] + dir[0] * 110, ELBOW[1] + dir[1] * 110];
  const bicepsO: [number, number] = [SHOULDER[0] + 8, SHOULDER[1] + 10];
  const bicepsI: [number, number] = [ELBOW[0] + dir[0] * 24 + n[0] * 6, ELBOW[1] + dir[1] * 24 + n[1] * 6];
  const tricepsO: [number, number] = [SHOULDER[0] - 8, SHOULDER[1] + 12];
  const olecranon: [number, number] = [ELBOW[0] - n[0] * 10 - dir[0] * 6, ELBOW[1] - n[1] * 10 - dir[1] * 6];
  const lenB = Math.hypot(bicepsI[0] - bicepsO[0], bicepsI[1] - bicepsO[1]);
  const lenT = Math.hypot(olecranon[0] - tricepsO[0], olecranon[1] - tricepsO[1]);
  const bOn = phase === "flex";
  const tOn = phase === "extend";
  const RED = "#e11d48";
  const PALE = "#fda4af";
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 260 290" className="mx-auto w-full max-w-[340px]" role="img" aria-label={`${ARM_T.angle[lang]}: ${angle}°`}>
        <rect width={260} height={290} rx={12} fill="#f8fafc" />
        <path d="M70 2 L 126 2 L 120 24 L 76 24 Z" fill="#e7e0cc" stroke="#a8a29e" strokeWidth={2} />
        <path d={`M${SHOULDER[0]} ${SHOULDER[1]} L ${ELBOW[0]} ${ELBOW[1]}`} stroke="#a8a29e" strokeWidth={13} strokeLinecap="round" />
        <path d={`M${SHOULDER[0]} ${SHOULDER[1]} L ${ELBOW[0]} ${ELBOW[1]}`} stroke="#f5efe0" strokeWidth={10} strokeLinecap="round" />
        <path d={`M${olecranon[0]} ${olecranon[1]} L ${hand[0]} ${hand[1]}`} stroke="#a8a29e" strokeWidth={11} strokeLinecap="round" />
        <path d={`M${olecranon[0]} ${olecranon[1]} L ${hand[0]} ${hand[1]}`} stroke="#f5efe0" strokeWidth={8} strokeLinecap="round" />
        <circle cx={hand[0]} cy={hand[1]} r={11} fill="#fde68a" stroke="#a16207" strokeWidth={2} />
        <path d={belly(tricepsO, olecranon, -1, Math.min(26, 1700 / lenT))} fill={tOn ? RED : PALE} stroke="#9f1239" strokeWidth={1.5} opacity={0.92} />
        <path d={belly(bicepsO, bicepsI, 1, Math.min(26, 1700 / lenB))} fill={bOn ? RED : PALE} stroke="#9f1239" strokeWidth={1.5} opacity={0.92} />
        <circle cx={ELBOW[0]} cy={ELBOW[1]} r={5} fill="#a8a29e" />
        <text x={248} y={280} textAnchor="end" fontSize={13} fontWeight={700} fill="#334155">
          {angle}°
        </text>
      </svg>
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          {ARM_T.angle[lang]}
          <input
            type="range"
            min={40}
            max={170}
            value={angle}
            onChange={(e) => {
              const v = Number(e.target.value);
              setGoal(null);
              setPhase(v < angle ? "flex" : v > angle ? "extend" : phase);
              current.current = v;
              setAngle(v);
            }}
            className="mt-2 h-2 w-full cursor-pointer accent-rose-600"
            aria-valuetext={`${angle}°`}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Choice state={phase === "flex" ? "active" : "idle"} onClick={() => go(40)}>
            ↶ {ARM_T.flex[lang]}
          </Choice>
          <Choice state={phase === "extend" ? "active" : "idle"} onClick={() => go(170)}>
            ↷ {ARM_T.extend[lang]}
          </Choice>
        </div>
        <ul className="space-y-1.5 text-sm">
          {(
            [
              [ARM_T.biceps, bOn, tOn],
              [ARM_T.triceps, tOn, bOn],
            ] as const
          ).map(([name, on, other]) => (
            <li key={name.pl} className="flex items-start gap-2">
              <span className={`mt-1 inline-block h-3 w-3 shrink-0 rounded-full ${on ? "bg-rose-600" : "bg-rose-300"}`} />
              <span>
                <b className="text-slate-800">{name[lang]}</b>
                {(on || other) && <span className={on ? "text-rose-700" : "text-slate-500"}> — {on ? ARM_T.contracts[lang] : ARM_T.relaxes[lang]}</span>}
              </span>
            </li>
          ))}
        </ul>
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-[15px] leading-relaxed text-emerald-950 ring-1 ring-emerald-200" aria-live="polite">
          {phase === "flex" ? ARM_T.flexText[lang] : phase === "extend" ? ARM_T.extendText[lang] : ARM_T.idle[lang]}
        </p>
      </div>
    </div>
  );
}

// ---------- isotonic or isometric ----------

const CONTRACTIONS: SortItem[] = [
  { name: r("unoszenie hantla do barku", "подъём гантели к плечу"), group: 0, why: r("mięsień dwugłowy skraca się, a ciężar się przemieszcza", "двуглавая мышца укорачивается, груз перемещается") },
  { name: r("trzymanie ciężkiej torby w nieruchomej ręce", "удерживание тяжёлой сумки в неподвижной руке"), group: 1, why: r("mięśnie są napięte, ale nie zmieniają długości", "мышцы напряжены, но не меняют длину") },
  { name: r("pchanie ściany", "толкание стены"), group: 1, why: r("rośnie napięcie, nic się nie przesuwa", "растёт напряжение, ничего не сдвигается") },
  { name: r("przysiady", "приседания"), group: 0, why: r("mięśnie ud skracają się i wydłużają, ciało się porusza", "мышцы бёдер укорачиваются и удлиняются, тело движется") },
  { name: r("deska (plank)", "планка"), group: 1, why: r("utrzymujesz stałą pozycję — długość mięśni się nie zmienia", "ты удерживаешь неподвижную позу — длина мышц не меняется") },
  { name: r("wchodzenie po schodach", "подъём по лестнице"), group: 0, why: r("mięśnie skracają się i podnoszą ciało", "мышцы укорачиваются и поднимают тело") },
  { name: r("zwis na drążku na ugiętych rękach", "вис на перекладине на согнутых руках"), group: 1, why: r("kąt w łokciach się nie zmienia, mięśnie tylko się napinają", "угол в локтях не меняется, мышцы только напрягаются") },
  { name: r("pompki", "отжимания"), group: 0, why: r("mięśnie ramion i klatki zmieniają długość, ciało unosi się i opada", "мышцы рук и груди меняют длину, тело поднимается и опускается") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Szkieletowa: wielojądrowe włókna, prążkowana, zależna od woli. Gładka: wrzecionowate komórki, niezależna od woli. Sercowa: prążkowana, wstawki, automatyzm.", ru: "Скелетная: многоядерные волокна, исчерченная, произвольная. Гладкая: веретеновидные клетки, непроизвольная. Сердечная: исчерченная, вставочные диски, автоматия." },
  ],
  s2: [
    { pl: "Sarkomer — odcinek miofibryli między dwiema liniami Z; podstawowa jednostka kurczliwa.", ru: "Саркомер — участок миофибриллы между двумя Z-линиями; основная сократительная единица." },
    { pl: "W skurczu skracają się prążek I i strefa H, a prążek A ma stałą szerokość — filamenty się wsuwają, a nie skracają.", ru: "При сокращении укорачиваются диск I и зона H, а ширина диска A постоянна — нити вдвигаются, а не укорачиваются." },
  ],
  s3: [
    { pl: "Jony Ca²⁺ z siateczki sarkoplazmatycznej odsłaniają na aktynie miejsca wiązania miozyny.", ru: "Ионы Ca²⁺ из саркоплазматической сети открывают на актине места связывания миозина." },
    { pl: "ATP jest potrzebny do ruchu główek miozyny, do ich odłączenia od aktyny i do wpompowania Ca²⁺ z powrotem.", ru: "АТФ нужен для движения головок миозина, их отсоединения от актина и для закачивания Ca²⁺ обратно." },
  ],
  s4: [
    { pl: "Mięśnie antagonistyczne wykonują ruchy przeciwne: dwugłowy ramienia zgina, trójgłowy prostuje rękę w łokciu.", ru: "Мышцы-антагонисты выполняют противоположные движения: двуглавая мышца плеча сгибает, трёхглавая разгибает руку в локте." },
    { pl: "Siłę skurczu przenoszą na kość ścięgna.", ru: "Силу сокращения на кость передают сухожилия." },
  ],
  s5: [
    { pl: "Najpierw ATP odtwarza fosfokreatyna (kilka sekund), potem glikoliza beztlenowa (powstaje mleczan) i oddychanie tlenowe.", ru: "Сначала АТФ восстанавливает креатинфосфат (несколько секунд), затем анаэробный гликолиз (образуется лактат) и аэробное дыхание." },
    { pl: "Dług tlenowy — dodatkowy tlen pobierany po wysiłku na usunięcie mleczanu i odbudowę zapasów ATP.", ru: "Кислородный долг — дополнительный кислород, потребляемый после нагрузки для удаления лактата и восстановления запасов АТФ." },
    { pl: "Szybko następujące impulsy sumują się w długotrwały, silny skurcz tężcowy.", ru: "Быстро следующие импульсы суммируются в длительное сильное тетаническое сокращение." },
  ],
};

export default function MusclesLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="musc" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="musc-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={TISSUES} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="musc-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Sarcomere lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="musc-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.s3} start={r("impuls w neuronie ruchowym", "импульс в двигательном нейроне")} steps={STEPS} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="musc-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Antagonists lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="musc-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TwoWaySort
          lang={lang}
          title={r("Izotoniczny czy izometryczny?", "Изотоническое или изометрическое?")}
          groups={[r("izotoniczny", "изотоническое"), r("izometryczny", "изометрическое")]}
          items={CONTRACTIONS}
        />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
