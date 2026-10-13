// Lesson for LO3 §10.3 "Regulacja wydzielania hormonów" and §10.4 "Nadczynność i niedoczynność gruczołów
// dokrewnych. Stres" (zakres rozszerzony). Hormones, loops and diseases follow templates/data/hormones.ts
// (HORMONES, LOOPS, DISORDERS).
import { useEffect, useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, type CompareCard, type QuizItem, type QuizOption } from "../../games.tsx";
import { Choice, KIT, num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Stężenie hormonów we krwi musi być dopasowane do potrzeb organizmu. Najczęściej pilnuje tego ujemne sprzężenie zwrotne: skutek działania hormonu hamuje jego dalsze wydzielanie. Gdy regulacja zawodzi, gruczoł pracuje za mocno (nadczynność) albo za słabo (niedoczynność).",
    "Концентрация гормонов в крови должна соответствовать потребностям организма. Чаще всего за этим следит отрицательная обратная связь: результат действия гормона тормозит его дальнейшее выделение. Когда регуляция нарушается, железа работает слишком сильно (гиперфункция) или слишком слабо (гипофункция).",
  ),
  s1: r("Oś podwzgórze–przysadka–tarczyca", "Ось гипоталамус–гипофиз–щитовидная железа"),
  s1intro: r("Wybierz sytuację i zobacz, jak zmieniają się poziomy hormonów w pętli.", "Выбери ситуацию и посмотри, как меняются уровни гормонов в петле."),
  s2: r("Regulacja poziomu glukozy", "Регуляция уровня глюкозы"),
  s2intro: r(
    "Symulator: zjedz posiłek, poćwicz albo zacznij post i obserwuj, jak insulina i glukagon utrzymują glukozę w normie.",
    "Симулятор: поешь, позанимайся спортом или поголодай и наблюдай, как инсулин и глюкагон удерживают глюкозу в норме.",
  ),
  s3: r("Gospodarka wapniowa", "Обмен кальция"),
  s3intro: r(
    "Ustaw poziom wapnia we krwi, a potem pozwól działać hormonom — parathormonowi i kalcytoninie.",
    "Установи уровень кальция в крови, а потом дай поработать гормонам — паратгормону и кальцитонину.",
  ),
  s4: r("Nadczynność i niedoczynność gruczołów", "Гипер- и гипофункция желёз"),
  s5: r("Stres", "Стресс"),
  s5intro: r("W stresie działają dwa hormony nadnerczy — jeden w ciągu sekund, drugi przez godziny i dni.", "При стрессе работают два гормона надпочечников — один в течение секунд, другой — часами и днями."),
} satisfies Record<string, Txt>;

// ---------- thyroid axis ----------

type Axis = "norm" | "cold" | "iodine" | "graves";

const AXIS: Record<Axis, { name: Txt; trh: number; tsh: number; t4: number; size: number; text: Txt }> = {
  norm: {
    name: r("norma", "норма"),
    trh: 0.5,
    tsh: 0.5,
    t4: 0.5,
    size: 1,
    text: r(
      "Podwzgórze wydziela TRH (tyreoliberynę), która pobudza przysadkę do wydzielania TSH (tyreotropiny), a TSH pobudza tarczycę. Gdy T3 i T4 jest dość, hamują one podwzgórze i przysadkę — to ujemne sprzężenie zwrotne.",
      "Гипоталамус выделяет ТРГ (тиреолиберин), который стимулирует гипофиз выделять ТТГ (тиреотропин), а ТТГ стимулирует щитовидную железу. Когда Т3 и Т4 достаточно, они тормозят гипоталамус и гипофиз — это отрицательная обратная связь.",
    ),
  },
  cold: {
    name: r("zimno", "холод"),
    trh: 0.8,
    tsh: 0.75,
    t4: 0.72,
    size: 1,
    text: r(
      "Organizm się wychładza: podwzgórze wydziela więcej TRH, przysadka — więcej TSH, rośnie poziom T3 i T4. Przemiana materii przyspiesza i powstaje więcej ciepła.",
      "Организм охлаждается: гипоталамус выделяет больше ТРГ, гипофиз — больше ТТГ, растёт уровень Т3 и Т4. Обмен веществ ускоряется, и вырабатывается больше тепла.",
    ),
  },
  iodine: {
    name: r("niedobór jodu", "недостаток йода"),
    trh: 0.7,
    tsh: 0.95,
    t4: 0.18,
    size: 1.6,
    text: r(
      "Bez jodu tarczyca nie wytworzy dość T3 i T4. Brak hamowania zwrotnego sprawia, że przysadka wydziela coraz więcej TSH, który pobudza tarczycę do rozrostu — powstaje wole. Zapobiega temu sól jodowana.",
      "Без йода щитовидная железа не может выработать достаточно Т3 и Т4. Без обратного торможения гипофиз выделяет всё больше ТТГ, который заставляет железу разрастаться, — возникает зоб. Предотвращает это йодированная соль.",
    ),
  },
  graves: {
    name: r("choroba Gravesa-Basedowa", "болезнь Грейвса — Базедова"),
    trh: 0.12,
    tsh: 0.06,
    t4: 0.95,
    size: 1.3,
    text: r(
      "Przeciwciała pobudzają tarczycę zamiast TSH, więc T3 i T4 jest za dużo (nadczynność). Silne hamowanie zwrotne obniża TRH i TSH prawie do zera. Objawy: przyspieszony metabolizm, chudnięcie, wytrzeszcz oczu.",
      "Антитела стимулируют щитовидную железу вместо ТТГ, поэтому Т3 и Т4 слишком много (гиперфункция). Сильное обратное торможение снижает ТРГ и ТТГ почти до нуля. Симптомы: ускоренный обмен веществ, похудение, пучеглазие.",
    ),
  },
};

function LevelBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <p className="flex items-center gap-2 text-sm">
      <span className="w-20 shrink-0 font-medium text-slate-600">{label}</span>
      <span className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
        <span className={`block h-full transition-all duration-500 ${color}`} style={{ width: `${Math.round(value * 100)}%` }} />
        <span className="absolute top-0 left-1/2 h-full w-0.5 bg-slate-500/60" aria-hidden />
      </span>
    </p>
  );
}

function ThyroidAxis({ lang }: { lang: BioLang }) {
  const [axis, setAxis] = useState<Axis>("norm");
  const a = AXIS[axis];
  const pl = lang === "pl";
  const w = (v: number) => 1.5 + v * 7;
  const hormone = { trh: pl ? "TRH" : "ТРГ", tsh: pl ? "TSH" : "ТТГ", t4: pl ? "T3, T4" : "Т3, Т4" };
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(AXIS) as Axis[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={axis === k}
            onClick={() => setAxis(k)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              axis === k ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {AXIS[k].name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 300 250" className="w-full" role="img" aria-label={a.name[lang]}>
          <defs>
            <marker id="hreg-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#334155" />
            </marker>
          </defs>
          <rect x={30} y={10} width={130} height={34} rx={10} fill="#fce7f3" stroke="#db2777" />
          <text x={95} y={32} textAnchor="middle" fontSize={12} fontWeight={600} fill="#831843">
            {pl ? "podwzgórze" : "гипоталамус"}
          </text>
          <path d="M95 44 L 95 88" stroke="#334155" strokeWidth={w(a.trh)} markerEnd="url(#hreg-arrow)" style={{ transition: "stroke-width .4s" }} />
          <text x={108} y={70} fontSize={11} fontWeight={700} fill="#334155">
            {hormone.trh}
          </text>
          <rect x={30} y={92} width={130} height={34} rx={10} fill="#ffe4e6" stroke="#e11d48" />
          <text x={95} y={114} textAnchor="middle" fontSize={12} fontWeight={600} fill="#881337">
            {pl ? "przysadka" : "гипофиз"}
          </text>
          <path d="M95 126 L 95 166" stroke="#334155" strokeWidth={w(a.tsh)} markerEnd="url(#hreg-arrow)" style={{ transition: "stroke-width .4s" }} />
          <text x={108} y={152} fontSize={11} fontWeight={700} fill="#334155">
            {hormone.tsh}
          </text>
          <g transform={`translate(95 200) scale(${a.size})`} style={{ transition: "transform .5s" }}>
            <ellipse cx={-13} cy={0} rx={13} ry={20} fill="#f59e0b" stroke="#b45309" />
            <ellipse cx={13} cy={0} rx={13} ry={20} fill="#f59e0b" stroke="#b45309" />
            <rect x={-13} y={2} width={26} height={9} fill="#f59e0b" />
          </g>
          {axis === "graves" && (
            <g stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" fill="none">
              {[
                [40, 180],
                [44, 214],
                [146, 186],
              ].map(([x, y]) => (
                <path key={x} d={`M${x} ${y} l 0 8 M${x} ${y} l -5 -6 M${x} ${y} l 5 -6`} />
              ))}
            </g>
          )}
          <text x={95} y={246} textAnchor="middle" fontSize={11} fontWeight={600} fill="#92400e">
            {pl ? "tarczyca" : "щитовидная железа"}
            {axis === "iodine" ? (pl ? " — wole" : " — зоб") : ""}
          </text>
          <path d="M134 200 L 194 200" stroke="#334155" strokeWidth={w(a.t4)} markerEnd="url(#hreg-arrow)" style={{ transition: "stroke-width .4s" }} />
          <text x={164} y={192} textAnchor="middle" fontSize={11} fontWeight={700} fill="#334155">
            {hormone.t4}
          </text>
          <rect x={198} y={178} width={96} height={44} rx={10} fill="#ecfccb" stroke="#65a30d" />
          <text x={246} y={196} textAnchor="middle" fontSize={10} fill="#365314">
            {pl ? "komórki ciała" : "клетки тела"}
          </text>
          <text x={246} y={212} textAnchor="middle" fontSize={10} fontWeight={600} fill="#365314">
            {pl ? "metabolizm, ciepło" : "обмен, тепло"}
          </text>
          <g stroke="#dc2626" strokeWidth={w(a.t4) * 0.6} strokeDasharray="5 4" fill="none" style={{ transition: "stroke-width .4s" }}>
            <path d="M262 178 L 262 27 L 164 27" />
            <path d="M262 109 L 164 109" />
          </g>
          {[27, 109].map((y) => (
            <g key={y}>
              <circle cx={178} cy={y} r={9} fill="white" stroke="#dc2626" strokeWidth={2} />
              <text x={178} y={y + 5} textAnchor="middle" fontSize={15} fontWeight={800} fill="#dc2626">
                −
              </text>
            </g>
          ))}
        </svg>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <LevelBar label={hormone.trh} value={a.trh} color="bg-pink-500" />
            <LevelBar label={hormone.tsh} value={a.tsh} color="bg-rose-500" />
            <LevelBar label={hormone.t4} value={a.t4} color="bg-amber-500" />
            <p className="text-xs text-slate-500">{pl ? "pionowa kreska — poziom prawidłowy" : "вертикальная черта — нормальный уровень"}</p>
          </div>
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
            {a.text[lang]}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- glucose simulator ----------

interface GState {
  t: number;
  /** glucose, mg/dl */
  G: number;
  /** insulin and glucagon, arbitrary units (0 at rest) */
  I: number;
  N: number;
  /** glucose still waiting in the gut, mg/dl equivalents */
  gut: number;
  /** minutes of exercise and of fasting left */
  ex: number;
  fast: number;
}

type GKind = "meal" | "exercise" | "fast";
interface GEvent {
  t: number;
  kind: GKind;
}

const START: GState = { t: 0, G: 90, I: 0, N: 0, gut: 0, ex: 0, fast: 0 };
const WINDOW = 240;

/** one simulated minute; a toy model tuned so the curves look like real ones */
function gStep(s: GState, diabetic: boolean): GState {
  const absorbed = s.gut * 0.04;
  const exerciseUse = s.ex > 0 ? 1.0 : 0;
  const fastUse = s.fast > 0 ? 0.6 : 0;
  const insulinTarget = diabetic ? 0 : Math.max(0, (s.G - 90) / 30);
  const glucagonTarget = Math.max(0, (90 - s.G) / 8);
  const I = s.I + (insulinTarget - s.I) * 0.12;
  const N = s.N + (glucagonTarget - s.N) * 0.12;
  // above the renal threshold glucose spills into urine; without insulin the liver keeps releasing glucose
  const urine = s.G > 180 ? (s.G - 180) * 0.03 : 0;
  const liverLeak = diabetic ? 0.15 : 0;
  const G = s.G + absorbed - exerciseUse - fastUse - 1.4 * I + 1.0 * N + liverLeak - urine;
  return { t: s.t + 1, G, I, N, gut: s.gut - absorbed, ex: Math.max(0, s.ex - 1), fast: Math.max(0, s.fast - 1) };
}

const EVENT_ICON: Record<GKind, string> = { meal: "🍽️", exercise: "🏃", fast: "🌙" };

interface Sim {
  s: GState;
  hist: number[];
  events: GEvent[];
  /** the minute of the last thing the user did */
  since: number;
}

const freshSim = (): Sim => ({ s: START, hist: [START.G], events: [], since: 0 });

function GlucoseSim({ lang }: { lang: BioLang }) {
  const [sim, setSim] = useState<Sim>(freshSim);
  const [running, setRunning] = useState(false);
  const [diabetic, setDiabetic] = useState(false);
  const pl = lang === "pl";

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSim((prev) => {
        let s = prev.s;
        const hist = [...prev.hist];
        for (let k = 0; k < 2; k++) {
          s = gStep(s, diabetic);
          hist.push(s.G);
        }
        if (hist.length > WINDOW + 1) hist.splice(0, hist.length - WINDOW - 1);
        return { s, hist, events: prev.events.filter((e) => s.t - e.t <= WINDOW), since: prev.since };
      });
    }, 60);
    return () => window.clearInterval(id);
  }, [running, diabetic]);

  // pause by itself once everything has settled, so the page does not tick forever
  const { s, hist, events, since } = sim;
  const prevG = hist.length > 2 ? hist[hist.length - 3]! : s.G;
  const settled = s.gut < 1 && s.ex === 0 && s.fast === 0 && Math.abs(s.G - prevG) < 0.04 && s.t - since > 60;
  useEffect(() => {
    if (running && (settled || s.t - since > 6 * 60)) setRunning(false);
  }, [running, settled, s.t, since]);

  const add = (kind: GKind) => {
    setSim((prev) => ({
      s: {
        ...prev.s,
        gut: kind === "meal" ? prev.s.gut + 100 : prev.s.gut,
        ex: kind === "exercise" ? 40 : prev.s.ex,
        fast: kind === "fast" ? 240 : prev.s.fast,
      },
      hist: prev.hist,
      events: [...prev.events, { t: prev.s.t, kind }],
      since: prev.s.t,
    }));
    setRunning(true);
  };
  const toggleDiabetes = (on: boolean) => {
    setDiabetic(on);
    setSim((prev) => ({ ...prev, since: prev.s.t }));
    setRunning(true);
  };
  const reset = () => {
    setSim(freshSim());
    setRunning(false);
  };

  const X0 = 40;
  const X1 = 330;
  const dx = (X1 - X0) / WINDOW;
  const Y = (g: number) => 172 - ((Math.min(230, Math.max(40, g)) - 40) / 190) * 156;
  const line = hist.map((g, i) => `${(X1 - (hist.length - 1 - i) * dx).toFixed(1)} ${Y(g).toFixed(1)}`).join(" ");
  const insulin = Math.min(1, s.I / 1.4);
  const glucagon = Math.min(1, s.N / 1.4);
  const G = s.G;
  const mg = pl ? "mg/dl" : "мг/дл";
  const status: Txt =
    G > 180
      ? r(
          "Glukoza powyżej progu nerkowego (ok. 180 mg/dl) — nerki nie nadążają z jej odzyskiwaniem i pojawia się w moczu. Tak jest w nieleczonej cukrzycy.",
          "Глюкоза выше почечного порога (около 180 мг/дл) — почки не успевают её возвращать, и она появляется в моче. Так бывает при нелеченом диабете.",
        )
      : G > 100
        ? diabetic
          ? r("Glukoza jest za wysoka, ale komórki beta nie wydzielają insuliny — glukoza nie wnika do komórek i zostaje we krwi.", "Глюкоза слишком высокая, но бета-клетки не выделяют инсулин — глюкоза не входит в клетки и остаётся в крови.")
          : r(
              "Glukoza powyżej normy: komórki beta trzustki wydzielają insulinę. Wątroba i mięśnie pobierają glukozę i magazynują ją jako glikogen — poziom spada.",
              "Глюкоза выше нормы: бета-клетки поджелудочной железы выделяют инсулин. Печень и мышцы поглощают глюкозу и запасают её в виде гликогена — уровень снижается.",
            )
        : G < 86
          ? r(
              "Glukoza spada: komórki alfa trzustki wydzielają glukagon. Wątroba rozkłada glikogen i oddaje glukozę do krwi — poziom wraca do normy.",
              "Глюкоза падает: альфа-клетки поджелудочной железы выделяют глюкагон. Печень расщепляет гликоген и отдаёт глюкозу в кровь — уровень возвращается к норме.",
            )
          : r("Glukoza w normie (ok. 70–100 mg/dl na czczo).", "Глюкоза в норме (около 70–100 мг/дл натощак).");

  const button = (kind: GKind, label: Txt) => (
    <Choice onClick={() => add(kind)}>
      {EVENT_ICON[kind]} {label[lang]}
    </Choice>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {button("meal", r("Posiłek", "Еда"))}
        {button("exercise", r("Wysiłek", "Нагрузка"))}
        {button("fast", r("Post (wiele godzin bez jedzenia)", "Голодание (много часов без еды)"))}
        <Choice onClick={reset}>↺ {KIT.again[lang]}</Choice>
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <svg viewBox="0 0 340 196" className="w-full" role="img" aria-label={`${pl ? "glukoza" : "глюкоза"} ${Math.round(G)} ${mg}`}>
            <rect x={X0} y={Y(100)} width={X1 - X0} height={Y(70) - Y(100)} fill="#d1fae5" />
            <text x={X0 + 4} y={Y(100) + 11} fontSize={9} fill="#047857">
              {pl ? "norma na czczo" : "норма натощак"}
            </text>
            <path d={`M${X0} ${Y(180)} L ${X1} ${Y(180)}`} stroke="#f43f5e" strokeDasharray="4 4" />
            <text x={X1 - 2} y={Y(180) - 4} textAnchor="end" fontSize={9} fill="#be123c">
              {pl ? "próg nerkowy" : "почечный порог"}
            </text>
            <path d={`M${X0} 16 L ${X0} 172 L ${X1} 172`} stroke="#94a3b8" fill="none" />
            {[70, 100, 140, 180, 220].map((g) => (
              <text key={g} x={X0 - 4} y={Y(g) + 3} textAnchor="end" fontSize={9} fill="#64748b">
                {g}
              </text>
            ))}
            {[4, 3, 2, 1, 0].map((h) => (
              <text key={h} x={X1 - h * 60 * dx} y={186} textAnchor={h === 0 ? "end" : "middle"} fontSize={9} fill="#64748b">
                {h === 0 ? (pl ? "teraz" : "сейчас") : `−${h} ${pl ? "h" : "ч"}`}
              </text>
            ))}
            <text x={4} y={12} fontSize={9} fill="#64748b">
              {mg}
            </text>
            {events.map((e, k) => {
              const x = X1 - (s.t - e.t) * dx;
              return (
                <g key={k}>
                  <path d={`M${x} 22 L ${x} 172`} stroke="#cbd5e1" strokeDasharray="2 3" />
                  <text x={x} y={20} textAnchor="middle" fontSize={12}>
                    {EVENT_ICON[e.kind]}
                  </text>
                </g>
              );
            })}
            <polyline points={line} fill="none" stroke="#0f172a" strokeWidth={2.2} strokeLinejoin="round" />
            <circle cx={X1} cy={Y(G)} r={4} fill="#0f172a" />
          </svg>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={diabetic} onChange={(e) => toggleDiabetes(e.target.checked)} className="h-4 w-4 accent-rose-600" />
            {pl ? "Cukrzyca typu 1 — komórki beta nie wydzielają insuliny" : "Диабет 1 типа — бета-клетки не выделяют инсулин"}
          </label>
        </div>
        <div className="space-y-3">
          <p className="text-2xl font-bold tabular-nums text-slate-900" aria-live="polite">
            {Math.round(G)} <span className="text-sm font-medium text-slate-500">{mg}</span>
          </p>
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 font-medium text-sky-800">{pl ? "insulina" : "инсулин"}</span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                <span className="block h-full bg-sky-500" style={{ width: `${Math.round(insulin * 100)}%` }} />
              </span>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 font-medium text-amber-800">{pl ? "glukagon" : "глюкагон"}</span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                <span className="block h-full bg-amber-500" style={{ width: `${Math.round(glucagon * 100)}%` }} />
              </span>
            </p>
          </div>
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
            {status[lang]}
          </p>
          {!running && events.length === 0 && (
            <p className="text-sm text-slate-500">{pl ? "👆 Wybierz zdarzenie, by uruchomić symulację." : "👆 Выбери событие, чтобы запустить симуляцию."}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- calcium ----------

const CA_NORM = 2.4;

function Calcium({ lang }: { lang: BioLang }) {
  const [ca, setCa] = useState(1.95);
  const [run, setRun] = useState(false);
  const pl = lang === "pl";
  useEffect(() => {
    if (!run) return;
    const id = window.setInterval(() => setCa((c) => c + (CA_NORM - c) * 0.08), 90);
    return () => window.clearInterval(id);
  }, [run]);
  useEffect(() => {
    if (run && Math.abs(ca - CA_NORM) < 0.01) setRun(false);
  }, [run, ca]);

  const pth = Math.min(1, Math.max(0, (CA_NORM - ca) / 0.4));
  const ct = Math.min(1, Math.max(0, (ca - CA_NORM) / 0.4));
  const low = ca < 2.2;
  const high = ca > 2.6;
  const mmol = pl ? "mmol/l" : "ммоль/л";
  const flow = (x: number, dir: "up" | "down" | null, label: Txt) => (
    <g>
      {dir && (
        <path
          d={dir === "up" ? `M${x} 150 L ${x} 122` : `M${x} 116 L ${x} 144`}
          stroke={dir === "up" ? "#e11d48" : "#2563eb"}
          strokeWidth={4}
          markerEnd={dir === "up" ? "url(#hreg-ca-up)" : "url(#hreg-ca-down)"}
        />
      )}
      <rect x={x - 46} y={152} width={92} height={30} rx={10} fill="#f8fafc" stroke="#cbd5e1" />
      <text x={x} y={171} textAnchor="middle" fontSize={11} fontWeight={600} fill="#334155">
        {label[lang]}
      </text>
    </g>
  );
  const text: Txt =
    ca < 2.0
      ? r(
          "Groźnie mało wapnia: nerwy i mięśnie stają się nadmiernie pobudliwe — grozi tężyczka (bolesne skurcze mięśni). Przytarczyce wydzielają dużo parathormonu.",
          "Опасно мало кальция: нервы и мышцы становятся чрезмерно возбудимыми — грозит тетания (болезненные судороги мышц). Паращитовидные железы выделяют много паратгормона.",
        )
      : low
        ? r(
            "Za mało wapnia: przytarczyce wydzielają parathormon. Wapń jest uwalniany z kości, nerki zatrzymują go w organizmie, a jelito — dzięki aktywnej witaminie D — wchłania go więcej.",
            "Кальция мало: паращитовидные железы выделяют паратгормон. Кальций высвобождается из костей, почки задерживают его в организме, а кишечник — благодаря активному витамину D — всасывает его больше.",
          )
        : high
          ? r(
              "Za dużo wapnia: tarczyca wydziela kalcytoninę. Wapń jest odkładany w kościach, a nerki wydalają go więcej z moczem.",
              "Кальция слишком много: щитовидная железа выделяет кальцитонин. Кальций откладывается в костях, а почки выводят его больше с мочой.",
            )
          : r("Norma (ok. 2,2–2,6 mmol/l): oba hormony są wydzielane w niewielkich ilościach.", "Норма (около 2,2–2,6 ммоль/л): оба гормона выделяются в небольших количествах.");
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 320 190" className="w-full" role="img" aria-label={`Ca²⁺ ${num(ca, 2)} ${mmol}`}>
          <defs>
            <marker id="hreg-ca-up" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#e11d48" />
            </marker>
            <marker id="hreg-ca-down" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#2563eb" />
            </marker>
          </defs>
          <rect x={6} y={8} width={128} height={40} rx={10} fill="#fff1f2" stroke="#e11d48" strokeWidth={1 + pth * 3} />
          <text x={70} y={24} textAnchor="middle" fontSize={10} fill="#881337">
            {pl ? "przytarczyce" : "паращитовидные"}
          </text>
          <text x={70} y={40} textAnchor="middle" fontSize={11} fontWeight={700} fill="#be123c" opacity={0.3 + pth * 0.7}>
            {pl ? "parathormon" : "паратгормон"}
          </text>
          <rect x={186} y={8} width={128} height={40} rx={10} fill="#eff6ff" stroke="#2563eb" strokeWidth={1 + ct * 3} />
          <text x={250} y={24} textAnchor="middle" fontSize={10} fill="#1e3a8a">
            {pl ? "tarczyca" : "щитовидная железа"}
          </text>
          <text x={250} y={40} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1d4ed8" opacity={0.3 + ct * 0.7}>
            {pl ? "kalcytonina" : "кальцитонин"}
          </text>
          <path d="M100 48 L 132 70" stroke="#e11d48" strokeWidth={1 + pth * 4} strokeDasharray="4 3" />
          <path d="M220 48 L 188 70" stroke="#2563eb" strokeWidth={1 + ct * 4} strokeDasharray="4 3" />
          <ellipse cx={160} cy={92} rx={78} ry={24} fill={low ? "#fee2e2" : high ? "#dbeafe" : "#dcfce7"} stroke="#94a3b8" />
          <text x={160} y={88} textAnchor="middle" fontSize={10} fill="#334155">
            {pl ? "Ca²⁺ we krwi" : "Ca²⁺ в крови"}
          </text>
          <text x={160} y={104} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0f172a">
            {num(ca, 2)} {mmol}
          </text>
          {flow(56, low ? "up" : high ? "down" : null, r("🦴 kości", "🦴 кости"))}
          {flow(160, low ? "up" : high ? "down" : null, r("nerki", "почки"))}
          {flow(264, low ? "up" : null, r("jelito", "кишечник"))}
        </svg>
        <label className="mt-2 block text-sm font-semibold text-slate-700">
          {pl ? "Wapń we krwi" : "Кальций в крови"}: <span className="tabular-nums">{num(ca, 2)} {mmol}</span>
          <input
            type="range"
            min={1.8}
            max={3}
            step={0.05}
            value={ca}
            onChange={(e) => {
              setRun(false);
              setCa(Number(e.target.value));
            }}
            className="mt-2 h-2 w-full cursor-pointer accent-rose-600"
          />
        </label>
        <div className="mt-3">
          <Choice state="active" disabled={run || Math.abs(ca - CA_NORM) < 0.02} onClick={() => setRun(true)}>
            ▶ {pl ? "Niech działają hormony" : "Пусть работают гормоны"}
          </Choice>
        </div>
      </div>
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
        {text[lang]}
      </p>
    </div>
  );
}

// ---------- disorders ----------

const CAUSES: QuizOption[] = [
  { id: "gh+", label: r("nadmiar somatotropiny", "избыток соматотропина") },
  { id: "gh-", label: r("niedobór somatotropiny", "недостаток соматотропина") },
  { id: "t4+", label: r("nadmiar tyroksyny", "избыток тироксина") },
  { id: "t4-", label: r("niedobór tyroksyny", "недостаток тироксина") },
  { id: "pth-", label: r("niedobór parathormonu", "недостаток паратгормона") },
  { id: "cort+", label: r("nadmiar kortyzolu", "избыток кортизола") },
  { id: "cort-", label: r("niedobór kortyzolu", "недостаток кортизола") },
  { id: "ins-", label: r("niedobór insuliny", "недостаток инсулина") },
  { id: "adh-", label: r("niedobór wazopresyny", "недостаток вазопрессина") },
];

const DISEASES: QuizItem[] = [
  { icon: "🧍", name: r("gigantyzmu", "гигантизм"), answer: "gh+", explain: r("Nadczynność: nadmierny wzrost kości długich przed zakończeniem dojrzewania.", "Гиперфункция: чрезмерный рост длинных костей до окончания полового созревания.") },
  { icon: "🧒", name: r("karłowatości przysadkowej", "гипофизарную карликовость"), answer: "gh-", explain: r("Niedoczynność: znacznie niższy wzrost przy zachowanych proporcjach ciała.", "Гипофункция: значительно более низкий рост при сохранённых пропорциях тела.") },
  { icon: "✋", name: r("akromegalii", "акромегалию"), answer: "gh+", explain: r("Nadczynność u dorosłego: powiększają się dłonie, stopy i rysy twarzy.", "Гиперфункция у взрослого: увеличиваются кисти, стопы и черты лица.") },
  { icon: "👀", name: r("choroby Gravesa-Basedowa", "болезнь Грейвса — Базедова"), answer: "t4+", explain: r("Nadczynność tarczycy: przyspieszony metabolizm, chudnięcie i wytrzeszcz oczu.", "Гиперфункция щитовидной железы: ускоренный обмен веществ, похудение и пучеглазие.") },
  { icon: "😴", name: r("obrzęku śluzowatego", "микседему"), answer: "t4-", explain: r("Niedoczynność tarczycy u dorosłych: spowolnienie metabolizmu, senność i obrzęki podskórne.", "Гипофункция щитовидной железы у взрослых: замедление обмена веществ, сонливость и подкожные отёки.") },
  { icon: "⚡", name: r("tężyczki", "тетанию"), answer: "pth-", explain: r("Za mało parathormonu → za mało wapnia we krwi → bolesne skurcze mięśni.", "Мало паратгормона → мало кальция в крови → болезненные судороги мышц.") },
  { icon: "⚖️", name: r("zespołu Cushinga", "синдром Кушинга"), answer: "cort+", explain: r("Nadmiar kortyzolu: otyłość tułowiowa, nadciśnienie i osłabienie mięśni.", "Избыток кортизола: ожирение туловища, гипертония и мышечная слабость.") },
  { icon: "🟫", name: r("choroby Addisona", "болезнь Аддисона"), answer: "cort-", explain: r("Niedoczynność kory nadnerczy: osłabienie, spadek ciśnienia i brązowe przebarwienia skóry.", "Гипофункция коры надпочечников: слабость, падение давления и бронзовая пигментация кожи.") },
  {
    icon: "🍬",
    name: r("cukrzycy", "сахарный диабет"),
    answer: "ins-",
    explain: r(
      "Typ 1 — brak insuliny (zniszczone komórki beta); typ 2 — komórki słabo reagują na insulinę. Skutek: wysoka glukoza we krwi i cukier w moczu.",
      "1 тип — нет инсулина (разрушены бета-клетки); 2 тип — клетки плохо реагируют на инсулин. Итог: высокая глюкоза в крови и сахар в моче.",
    ),
  },
  { icon: "🚰", name: r("moczówki prostej", "несахарный диабет"), answer: "adh-", explain: r("Bez wazopresyny nerki nie zagęszczają moczu: ogromne ilości rozcieńczonego moczu i silne pragnienie.", "Без вазопрессина почки не концентрируют мочу: огромное количество разведённой мочи и сильная жажда.") },
];

// ---------- stress ----------

const SL = {
  gland: r("Gruczoł", "Железа"),
  control: r("Sterowanie", "Управление"),
  speed: r("Czas reakcji", "Время реакции"),
  effects: r("Działanie", "Действие"),
  chronic: r("Gdy stres trwa długo", "При длительном стрессе"),
};

const STRESS: CompareCard[] = [
  {
    id: "adrenaline",
    icon: "⚡",
    name: r("Adrenalina", "Адреналин"),
    rows: [
      { label: SL.gland, value: r("rdzeń nadnerczy", "мозговое вещество надпочечников") },
      { label: SL.control, value: r("układ współczulny — impuls nerwowy", "симпатическая нервная система — нервный импульс") },
      { label: SL.speed, value: r("sekundy", "секунды") },
      {
        label: SL.effects,
        value: r(
          "serce bije szybciej, oskrzela się rozszerzają, do krwi trafia glukoza, krew płynie do mięśni — reakcja „walcz lub uciekaj”",
          "сердце бьётся чаще, бронхи расширяются, в кровь поступает глюкоза, кровь приливает к мышцам — реакция «бей или беги»",
        ),
      },
      { label: SL.chronic, value: r("częste wyrzuty sprzyjają nadciśnieniu i chorobom serca", "частые выбросы способствуют гипертонии и болезням сердца") },
    ],
  },
  {
    id: "cortisol",
    icon: "⏳",
    name: r("Kortyzol", "Кортизол"),
    rows: [
      { label: SL.gland, value: r("kora nadnerczy", "кора надпочечников") },
      { label: SL.control, value: r("podwzgórze (kortykoliberyna) → przysadka (ACTH) → kora nadnerczy", "гипоталамус (кортиколиберин) → гипофиз (АКТГ) → кора надпочечников") },
      { label: SL.speed, value: r("minuty–godziny, działa długo", "минуты–часы, действует долго") },
      { label: SL.effects, value: r("podwyższa poziom glukozy kosztem białek i tłuszczów, hamuje odczyn zapalny", "повышает уровень глюкозы за счёт белков и жиров, подавляет воспаление") },
      { label: SL.chronic, value: r("osłabienie odporności, wzrost ciśnienia i poziomu glukozy we krwi", "ослабление иммунитета, повышение давления и уровня глюкозы в крови") },
    ],
    text: r(
      "Według H. Selyego reakcja na stres ma trzy fazy: alarmową, odporności i — gdy stres trwa zbyt długo — wyczerpania.",
      "По Г. Селье, реакция на стресс имеет три стадии: тревоги, резистентности и — если стресс длится слишком долго — истощения.",
    ),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    r(
      "Ujemne sprzężenie zwrotne: wysoki poziom hormonu gruczołu docelowego hamuje wydzielanie hormonów podwzgórza i przysadki.",
      "Отрицательная обратная связь: высокий уровень гормона железы-мишени тормозит выделение гормонов гипоталамуса и гипофиза.",
    ),
    r("Niedobór jodu → mało T3 i T4 → dużo TSH → rozrost tarczycy (wole).", "Недостаток йода → мало Т3 и Т4 → много ТТГ → разрастание щитовидной железы (зоб)."),
  ],
  s2: [
    r(
      "Insulina (komórki beta) obniża poziom glukozy, glukagon (komórki alfa) go podwyższa — to hormony o działaniu antagonistycznym.",
      "Инсулин (бета-клетки) снижает уровень глюкозы, глюкагон (альфа-клетки) повышает его — это гормоны-антагонисты.",
    ),
    r("Prawidłowa glukoza na czczo: ok. 70–100 mg/dl.", "Нормальная глюкоза натощак: около 70–100 мг/дл."),
  ],
  s3: [
    r(
      "Parathormon (przytarczyce) podwyższa poziom wapnia we krwi, kalcytonina (tarczyca) go obniża.",
      "Паратгормон (паращитовидные железы) повышает уровень кальция в крови, кальцитонин (щитовидная железа) его снижает.",
    ),
  ],
  s4: [
    r(
      "Nadczynność — za dużo hormonu, niedoczynność — za mało. Ten sam hormon może dawać różne choroby zależnie od wieku (gigantyzm u dziecka, akromegalia u dorosłego).",
      "Гиперфункция — гормона слишком много, гипофункция — слишком мало. Один и тот же гормон даёт разные болезни в зависимости от возраста (гигантизм у ребёнка, акромегалия у взрослого).",
    ),
  ],
  s5: [
    r("Adrenalina — szybka, krótka reakcja na stres; kortyzol — powolna i długotrwała.", "Адреналин — быстрая и короткая реакция на стресс; кортизол — медленная и длительная."),
  ],
};

export default function RegulationLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="hreg" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="hreg-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <ThyroidAxis lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="hreg-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <GlucoseSim lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="hreg-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Calcium lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="hreg-s4" n={4} title={T.s4[lang]}>
        <MatchQuiz
          lang={lang}
          title={T.s4}
          question={r("Co jest przyczyną", "Что вызывает")}
          options={CAUSES}
          items={DISEASES}
          wrongHint={r("Zastanów się, czy objawy wskazują na za dużo, czy za mało hormonu — i co ten hormon reguluje.", "Подумай, указывают ли симптомы на избыток или недостаток гормона — и что этот гормон регулирует.")}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="hreg-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={STRESS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
