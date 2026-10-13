// Lesson for LO3 §5.2 "Budowa i funkcje układu oddechowego" and §5.3 "Wentylacja płuc i wymiana
// gazowa" (zakres rozszerzony). Terms and volumes follow templates/data/respiration.ts.
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { OrderGame } from "../../games.tsx";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Oddychanie to dwa różne procesy: wentylacja płuc — wymiana powietrza między płucami a otoczeniem — i wymiana gazowa, czyli dyfuzja tlenu i dwutlenku węgla między powietrzem w pęcherzykach a krwią oraz między krwią a tkankami.",
    "Дыхание — это два разных процесса: вентиляция лёгких — обмен воздуха между лёгкими и окружающей средой — и газообмен, то есть диффузия кислорода и углекислого газа между воздухом в альвеолах и кровью, а также между кровью и тканями.",
  ),
  s1: r("Drogi oddechowe", "Дыхательные пути"),
  s1intro: r("Ułóż drogę, którą przebywa wdychane powietrze — od nosa do miejsca wymiany gazowej.", "Выстрой путь вдыхаемого воздуха — от носа до места газообмена."),
  s2: r("Mechanika wdechu i wydechu", "Механика вдоха и выдоха"),
  s2intro: r("Płuca nie mają mięśni — powietrze wciąga do nich zmiana objętości klatki piersiowej.", "В лёгких нет мышц — воздух в них втягивает изменение объёма грудной клетки."),
  s3: r("Spirogram: objętości i pojemności płuc", "Спирограмма: объёмы и ёмкости лёгких"),
  s3intro: r("Dotknij pasma na wykresie, żeby zobaczyć, co oznacza. Wartości są typowe dla zdrowego dorosłego mężczyzny.", "Нажми на полосу графика, чтобы узнать, что она означает. Значения типичны для здорового взрослого мужчины."),
  s4: r("Wentylacja minutowa", "Минутная вентиляция"),
  s4intro: r("Policz, ile powietrza wymieniasz w ciągu minuty — i ile z niego naprawdę dociera do pęcherzyków.", "Посчитай, сколько воздуха проходит через лёгкие за минуту — и сколько из него реально доходит до альвеол."),
  s5: r("Wymiana gazowa", "Газообмен"),
  s5intro: r("Gazy dyfundują zawsze z miejsca o wyższym ciśnieniu parcjalnym do miejsca o niższym.", "Газы всегда диффундируют из места с более высоким парциальным давлением в место с более низким."),
} satisfies Record<string, Txt>;

// ---------- airway ----------

const AIRWAY: Txt[] = [
  r("jama nosowa", "носовая полость"),
  r("gardło", "глотка"),
  r("krtań", "гортань"),
  r("tchawica", "трахея"),
  r("oskrzela", "бронхи"),
  r("oskrzeliki", "бронхиолы"),
  r("pęcherzyki płucne", "альвеолы"),
];

// ---------- mechanics ----------

const MECH = {
  inhale: r("Wdech", "Вдох"),
  exhale: r("Wydech", "Выдох"),
  rows: [
    { label: r("Przepona", "Диафрагма"), in: r("kurczy się i obniża (spłaszcza)", "сокращается и опускается (уплощается)"), out: r("rozkurcza się i unosi (kopuła)", "расслабляется и поднимается (купол)") },
    { label: r("Mięśnie międzyżebrowe zewnętrzne", "Наружные межрёберные мышцы"), in: r("kurczą się, żebra unoszą się", "сокращаются, рёбра поднимаются"), out: r("rozkurczają się, żebra opadają", "расслабляются, рёбра опускаются") },
    { label: r("Objętość klatki piersiowej", "Объём грудной клетки"), in: r("rośnie", "увеличивается"), out: r("maleje", "уменьшается") },
    { label: r("Ciśnienie w płucach", "Давление в лёгких"), in: r("niższe od atmosferycznego", "ниже атмосферного"), out: r("wyższe od atmosferycznego", "выше атмосферного") },
    { label: r("Powietrze", "Воздух"), in: r("wpływa do płuc", "входит в лёгкие"), out: r("wypływa z płuc", "выходит из лёгких") },
  ],
  note: r(
    "Spokojny wydech jest bierny — wystarczy rozkurcz mięśni i sprężystość płuc. Przy wysiłku włączają się mięśnie międzyżebrowe wewnętrzne i mięśnie brzucha.",
    "Спокойный выдох пассивен — достаточно расслабления мышц и упругости лёгких. При нагрузке включаются внутренние межрёберные мышцы и мышцы живота.",
  ),
};

function Mechanics({ lang }: { lang: BioLang }) {
  const [inhale, setInhale] = useState(true);
  const lung = inhale ? 1.12 : 0.92;
  // half-width of the chest and the slope of the ribs: raised ribs widen the chest
  const w = inhale ? 132 : 114;
  const tilt = inhale ? -4 : 12;
  const dome = inhale ? "M50 196 C 90 186, 210 186, 250 196" : "M50 196 C 90 140, 210 140, 250 196";
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div>
        <svg viewBox="0 0 300 230" className="w-full" role="img" aria-label={inhale ? MECH.inhale[lang] : MECH.exhale[lang]}>
          <rect width={300} height={230} rx={12} fill="#f0f9ff" />
          <path d="M150 10 L 150 70 M150 70 L 120 96 M150 70 L 180 96" stroke="#94a3b8" strokeWidth={8} strokeLinecap="round" fill="none" />
          <path
            d={`M150 60 C ${150 - w} 66, ${150 - w} 120, ${156 - w} 198 M150 60 C ${150 + w} 66, ${150 + w} 120, ${144 + w} 198`}
            stroke="#d6d3d1"
            strokeWidth={5}
            fill="none"
            style={{ transition: "d .6s" }}
          />
          {[0, 1, 2, 3].map((k) =>
            [-1, 1].map((s) => (
              <path
                key={`${k}${s}`}
                d={`M${150 + s * 14} ${84 + k * 28} Q ${150 + s * (w - 14)} ${70 + k * 28} ${150 + s * w} ${84 + k * 28 + tilt}`}
                stroke="#a8a29e"
                strokeWidth={4}
                strokeLinecap="round"
                fill="none"
                style={{ transition: "d .6s" }}
              />
            )),
          )}
          {[-1, 1].map((s) => (
            <ellipse
              key={s}
              cx={150 + s * 56}
              cy={inhale ? 128 : 110}
              rx={44 * lung}
              ry={58 * lung}
              fill="#fda4af"
              fillOpacity={0.92}
              stroke="#be123c"
              strokeWidth={2}
              style={{ transition: "all .6s" }}
            />
          ))}
          <path d={dome} fill="none" stroke="#b45309" strokeWidth={6} style={{ transition: "d .6s" }} />
          <text x={150} y={222} textAnchor="middle" fontSize={11} fill="#92400e">
            {lang === "pl" ? "przepona" : "диафрагма"}
          </text>
          <path d={inhale ? "M150 4 L 150 26 M142 18 L 150 26 L 158 18" : "M150 26 L 150 4 M142 12 L 150 4 L 158 12"} stroke="#0284c7" strokeWidth={3} fill="none" />
        </svg>
        <div className="mt-2 flex gap-2" role="radiogroup">
          {[true, false].map((v) => (
            <Choice key={String(v)} state={inhale === v ? "active" : "idle"} onClick={() => setInhale(v)}>
              {v ? MECH.inhale[lang] : MECH.exhale[lang]}
            </Choice>
          ))}
        </div>
      </div>
      <div>
        <table className="w-full text-sm" aria-live="polite">
          <tbody>
            {MECH.rows.map((row) => (
              <tr key={row.label.pl} className="border-b border-slate-200 last:border-0">
                <th scope="row" className="w-40 py-2 pr-3 text-left align-top font-medium text-slate-500">
                  {row.label[lang]}
                </th>
                <td className="py-2 text-slate-800">{(inhale ? row.in : row.out)[lang]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm text-slate-600">{MECH.note[lang]}</p>
      </div>
    </div>
  );
}

// ---------- spirogram ----------

interface Band {
  id: string;
  name: Txt;
  ml: number;
  text: Txt;
  /** litres, bottom and top of the band on the chart (0 = empty lungs) */
  from: number;
  to: number;
  x: number;
}

// TLC 5.9 l = RV 1.2 + ERV 1.2 + TV 0.5 + IRV 3.0
const RV = 1.2;
const ERV = 1.2;
const TV = 0.5;
const IRV = 3.0;
const BANDS: Band[] = [
  { id: "tv", name: r("Objętość oddechowa (TV)", "Дыхательный объём (ДО)"), ml: 500, from: RV + ERV, to: RV + ERV + TV, x: 46, text: r("Powietrze wdychane i wydychane podczas spokojnego oddechu.", "Воздух, вдыхаемый и выдыхаемый при спокойном дыхании.") },
  { id: "irv", name: r("Zapasowa objętość wdechowa (IRV)", "Резервный объём вдоха (РОвд)"), ml: 3000, from: RV + ERV + TV, to: RV + ERV + TV + IRV, x: 120, text: r("Ile można jeszcze wciągnąć po spokojnym wdechu.", "Сколько можно ещё вдохнуть после спокойного вдоха.") },
  { id: "erv", name: r("Zapasowa objętość wydechowa (ERV)", "Резервный объём выдоха (РОвыд)"), ml: 1200, from: RV, to: RV + ERV, x: 156, text: r("Ile można jeszcze wydmuchać po spokojnym wydechu.", "Сколько можно ещё выдохнуть после спокойного выдоха.") },
  { id: "rv", name: r("Objętość zalegająca (RV)", "Остаточный объём (ОО)"), ml: 1200, from: 0, to: RV, x: 200, text: r("Zostaje w płucach nawet po najgłębszym wydechu — nie da się jej zmierzyć spirometrem.", "Остаётся в лёгких даже после самого глубокого выдоха — спирометром его не измерить.") },
  { id: "vc", name: r("Pojemność życiowa (VC)", "Жизненная ёмкость (ЖЁЛ)"), ml: 4700, from: RV, to: RV + ERV + TV + IRV, x: 236, text: r("Największa objętość wydychana po najgłębszym wdechu: VC = IRV + TV + ERV.", "Наибольший объём выдоха после самого глубокого вдоха: ЖЁЛ = РОвд + ДО + РОвыд.") },
  { id: "tlc", name: r("Całkowita pojemność płuc (TLC)", "Общая ёмкость лёгких (ОЁЛ)"), ml: 5900, from: 0, to: RV + ERV + TV + IRV, x: 272, text: r("Pojemność życiowa powiększona o objętość zalegającą: TLC = VC + RV.", "Жизненная ёмкость плюс остаточный объём: ОЁЛ = ЖЁЛ + ОО.") },
];

const yL = (l: number) => 190 - l * 28;

function Spirogram({ lang }: { lang: BioLang }) {
  const [id, setId] = useState("tv");
  const band = BANDS.find((b) => b.id === id)!;
  // the trace: three calm breaths, a deepest inhale, a deepest exhale, calm again
  const base = RV + ERV;
  const pts: [number, number][] = [];
  for (let k = 0; k <= 3; k++) pts.push([20 + k * 24, base], [32 + k * 24, base + TV]);
  pts.push([116, RV + ERV + TV + IRV], [150, RV], [176, base], [188, base + TV], [200, base]);
  const d = pts.map(([x, l], k) => `${k ? "L" : "M"}${x} ${yL(l)}`).join(" ");
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 300 210" className="w-full" role="img" aria-label={band.name[lang]}>
        <rect width={300} height={210} rx={10} fill="#f8fafc" />
        {[0, 1, 2, 3, 4, 5, 6].map((l) => (
          <g key={l}>
            <path d={`M16 ${yL(l)} L 292 ${yL(l)}`} stroke="#e2e8f0" />
            <text x={4} y={yL(l) + 3} fontSize={8} fill="#94a3b8">
              {l}
            </text>
          </g>
        ))}
        <path d={d} fill="none" stroke="#0ea5e9" strokeWidth={2.5} strokeLinejoin="round" />
        {BANDS.map((b) => (
          <g
            key={b.id}
            role="button"
            tabIndex={0}
            aria-label={b.name[lang]}
            aria-pressed={b.id === id}
            onClick={() => setId(b.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setId(b.id))}
            className="cursor-pointer outline-none"
          >
            <rect x={b.x - 9} y={yL(b.to)} width={18} height={yL(b.from) - yL(b.to)} rx={4} fill={b.id === id ? "#10b981" : "#cbd5e1"} opacity={0.85} />
            <text x={b.x} y={yL(b.to) - 4} textAnchor="middle" fontSize={8} fontWeight={700} fill="#334155">
              {b.id.toUpperCase()}
            </text>
          </g>
        ))}
        <text x={292} y={204} textAnchor="end" fontSize={8} fill="#64748b">
          {lang === "pl" ? "litry" : "литры"}
        </text>
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {BANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setId(b.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${b.id === id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-300"}`}
            >
              {b.id.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <h3 className="font-semibold text-emerald-900">{band.name[lang]}</h3>
          <p className="mt-1 text-2xl font-bold text-emerald-800 tabular-nums">≈ {band.ml} {lang === "pl" ? "ml" : "мл"}</p>
          <p className="mt-1 text-[15px] leading-relaxed text-emerald-950">{band.text[lang]}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- minute ventilation ----------

const DEAD = 150;

function Ventilation({ lang }: { lang: BioLang }) {
  const [tv, setTv] = useState(500);
  const [f, setF] = useState(14);
  const ve = tv * f;
  const va = Math.max(0, tv - DEAD) * f;
  const share = Math.round((va / ve) * 100);
  const ml = lang === "pl" ? "ml" : "мл";
  const lpm = lang === "pl" ? "l/min" : "л/мин";
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Objętość oddechowa" : "Дыхательный объём"}: <span className="tabular-nums">{tv} {ml}</span>
          <input type="range" min={250} max={1500} step={50} value={tv} onChange={(e) => setTv(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-sky-600" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Częstość oddechów" : "Частота дыхания"}: <span className="tabular-nums">{f} / {lang === "pl" ? "min" : "мин"}</span>
          <input type="range" min={6} max={40} value={f} onChange={(e) => setF(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-sky-600" />
        </label>
      </div>
      <div className="space-y-2 rounded-xl bg-sky-50 p-4 text-[15px] ring-1 ring-sky-200" aria-live="polite">
        <p>
          {lang === "pl" ? "Wentylacja minutowa" : "Минутная вентиляция"} = {tv} {ml} × {f} = <b className="tabular-nums">{num(ve / 1000, 2)} {lpm}</b>
        </p>
        <p>
          {lang === "pl" ? "Wentylacja pęcherzykowa" : "Альвеолярная вентиляция"} = ({tv} − {DEAD}) {ml} × {f} = <b className="tabular-nums">{num(va / 1000, 2)} {lpm}</b>
        </p>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200" aria-hidden>
          <div className="h-full bg-sky-600 transition-all" style={{ width: `${share}%` }} />
        </div>
        <p className="text-sm text-slate-600">
          {lang === "pl"
            ? `Do pęcherzyków trafia ${share}% powietrza. Ok. 150 ml każdego oddechu zostaje w przestrzeni martwej — drogach oddechowych, gdzie nie ma wymiany gazowej. Dlatego płytki, szybki oddech jest mniej wydajny niż głęboki i wolny.`
            : `До альвеол доходит ${share}% воздуха. Около 150 мл каждого вдоха остаётся в мёртвом пространстве — в дыхательных путях, где нет газообмена. Поэтому частое поверхностное дыхание менее эффективно, чем редкое и глубокое.`}
        </p>
      </div>
    </div>
  );
}

// ---------- gas exchange ----------

const GAS = {
  lungs: r("W płucach", "В лёгких"),
  tissues: r("W tkankach", "В тканях"),
  lungsText: r(
    "W pęcherzyku pO₂ ≈ 100 mmHg, a w krwi napływającej ≈ 40 mmHg — tlen dyfunduje do krwi i wiąże się z hemoglobiną. pCO₂ we krwi ≈ 46 mmHg, w pęcherzyku ≈ 40 mmHg — dwutlenek węgla dyfunduje do pęcherzyka i zostaje wydychany.",
    "В альвеоле pO₂ ≈ 100 мм рт. ст., а в притекающей крови ≈ 40 — кислород диффундирует в кровь и связывается с гемоглобином. pCO₂ в крови ≈ 46, в альвеоле ≈ 40 — углекислый газ диффундирует в альвеолу и выдыхается.",
  ),
  tissuesText: r(
    "We krwi tętniczej pO₂ ≈ 100 mmHg, w komórkach ≈ 40 mmHg lub mniej — tlen dyfunduje do tkanek. Komórki produkują CO₂ w oddychaniu komórkowym, więc jego ciśnienie jest tam wyższe — CO₂ przechodzi do krwi i jest transportowany głównie jako jony wodorowęglanowe.",
    "В артериальной крови pO₂ ≈ 100, в клетках ≈ 40 или меньше — кислород диффундирует в ткани. Клетки производят CO₂ при клеточном дыхании, поэтому там его давление выше — CO₂ переходит в кровь и переносится в основном в виде гидрокарбонат-ионов.",
  ),
};

function GasExchange({ lang }: { lang: BioLang }) {
  const [lungs, setLungs] = useState(true);
  const left = lungs ? { name: r("pęcherzyk", "альвеола"), o2: 100, co2: 40, fill: "#e0f2fe" } : { name: r("komórki tkanki", "клетки ткани"), o2: 40, co2: 46, fill: "#fef3c7" };
  const right = lungs ? { name: r("krew odtlenowana", "венозная кровь"), o2: 40, co2: 46, fill: "#bfdbfe" } : { name: r("krew utlenowana", "артериальная кровь"), o2: 100, co2: 40, fill: "#fecaca" };
  const o2ToRight = left.o2 > right.o2;
  return (
    <div>
      <div className="mb-3 flex gap-2" role="radiogroup">
        {[true, false].map((v) => (
          <Choice key={String(v)} state={lungs === v ? "active" : "idle"} onClick={() => setLungs(v)}>
            {v ? GAS.lungs[lang] : GAS.tissues[lang]}
          </Choice>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 300 160" className="w-full" role="img" aria-label={lungs ? GAS.lungs[lang] : GAS.tissues[lang]}>
          <rect x={6} y={10} width={130} height={140} rx={16} fill={left.fill} stroke="#64748b" />
          <rect x={164} y={10} width={130} height={140} rx={16} fill={right.fill} stroke="#64748b" />
          <rect x={136} y={10} width={28} height={140} fill="#f1f5f9" />
          {[left, right].map((s, k) => (
            <g key={k}>
              <text x={71 + k * 158} y={34} textAnchor="middle" fontSize={11} fontWeight={600} fill="#334155">
                {s.name[lang]}
              </text>
              <text x={71 + k * 158} y={66} textAnchor="middle" fontSize={13} fill="#0f172a">
                pO₂ {s.o2}
              </text>
              <text x={71 + k * 158} y={90} textAnchor="middle" fontSize={13} fill="#0f172a">
                pCO₂ {s.co2}
              </text>
            </g>
          ))}
          <g strokeWidth={3} fill="none">
            <path d={o2ToRight ? "M110 110 L 190 110 M180 102 L 190 110 L 180 118" : "M190 110 L 110 110 M120 102 L 110 110 L 120 118"} stroke="#0284c7" />
            <path d={o2ToRight ? "M190 134 L 110 134 M120 126 L 110 134 L 120 142" : "M110 134 L 190 134 M180 126 L 190 134 L 180 142"} stroke="#78716c" />
          </g>
          <text x={150} y={106} textAnchor="middle" fontSize={9} fill="#0284c7">
            O₂
          </text>
          <text x={150} y={130} textAnchor="middle" fontSize={9} fill="#57534e">
            CO₂
          </text>
        </svg>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          {(lungs ? GAS.lungsText : GAS.tissuesText)[lang]}
        </p>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Drogi oddechowe ogrzewają, nawilżają i oczyszczają powietrze; wymiana gazowa zachodzi dopiero w pęcherzykach.", ru: "Дыхательные пути согревают, увлажняют и очищают воздух; газообмен идёт только в альвеолах." },
    { pl: "Nagłośnia zamyka krtań podczas połykania.", ru: "Надгортанник закрывает гортань при глотании." },
  ],
  s2: [{ pl: "Wdech: przepona i mięśnie międzyżebrowe zewnętrzne kurczą się, objętość klatki rośnie, ciśnienie w płucach spada.", ru: "Вдох: диафрагма и наружные межрёберные мышцы сокращаются, объём грудной клетки растёт, давление в лёгких падает." }],
  s3: [{ pl: "VC = IRV + TV + ERV; TLC = VC + RV.", ru: "ЖЁЛ = РОвд + ДО + РОвыд; ОЁЛ = ЖЁЛ + ОО." }],
  s4: [{ pl: "Wentylacja minutowa = objętość oddechowa × częstość oddechów; pęcherzykowa uwzględnia przestrzeń martwą.", ru: "Минутная вентиляция = дыхательный объём × частота; альвеолярная учитывает мёртвое пространство." }],
  s5: [{ pl: "Wymiana gazowa zachodzi przez dyfuzję zgodnie z różnicą ciśnień parcjalnych.", ru: "Газообмен идёт путём диффузии по разнице парциальных давлений." }],
};

export default function BreathingLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="breath" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="breath-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <OrderGame lang={lang} title={r("Droga powietrza", "Путь воздуха")} steps={AIRWAY} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="breath-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Mechanics lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="breath-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Spirogram lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="breath-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Ventilation lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="breath-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <GasExchange lang={lang} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
