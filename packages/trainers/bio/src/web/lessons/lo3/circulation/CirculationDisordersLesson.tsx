// Lesson for LO3 §6.6 "Choroby układu krążenia" and §6.9 "Zaburzenia funkcjonowania układu
// odpornościowego" (zakres rozszerzony) — one lesson for both "disorders" paragraphs of dział 6.
// Diseases follow templates/data/disorders.ts (CIRCULATION_DISORDERS, IMMUNE_DISORDERS).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { MatchQuiz, type QuizItem, type QuizOption } from "../../games.tsx";
import { Choice, KIT, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Choroby układu krążenia są w Polsce najczęstszą przyczyną zgonów, a większości z nich sprzyja styl życia. Układ odpornościowy też może zawodzić: reagować zbyt silnie (alergia), za słabo (niedobory odporności) albo atakować własne tkanki (choroby autoimmunizacyjne).",
    "Болезни системы кровообращения — самая частая причина смерти в Польше, и большинству из них способствует образ жизни. Иммунная система тоже может давать сбои: реагировать слишком сильно (аллергия), слишком слабо (иммунодефициты) или атаковать собственные ткани (аутоиммунные заболевания).",
  ),
  s1: r("Miażdżyca", "Атеросклероз"),
  s1intro: r("Przesuń suwak, by zobaczyć, jak przez lata rośnie blaszka miażdżycowa. Zaznacz czynniki ryzyka.", "Двигай ползунок, чтобы увидеть, как за годы растёт атеросклеротическая бляшка. Отметь факторы риска."),
  s2: r("Ciśnienie tętnicze krwi", "Артериальное давление"),
  s2intro: r(
    "Ciśnienie skurczowe panuje w tętnicach podczas skurczu komór, rozkurczowe — podczas ich rozkurczu. Ustaw wynik pomiaru i sprawdź jego kategorię.",
    "Систолическое давление — в артериях во время сокращения желудочков, диастолическое — во время их расслабления. Задай результат измерения и узнай его категорию.",
  ),
  s3: r("Rozpoznaj chorobę układu krążenia", "Узнай болезнь системы кровообращения"),
  s4: r("Mechanizm alergii", "Механизм аллергии"),
  s4intro: r("Alergia to nadmierna reakcja układu odpornościowego na nieszkodliwy antygen — alergen.", "Аллергия — чрезмерная реакция иммунной системы на безвредный антиген — аллерген."),
  s5: r("Zaburzenia odporności", "Нарушения иммунитета"),
} satisfies Record<string, Txt>;

// ---------- atherosclerosis ----------

const STAGES: { from: number; text: Txt }[] = [
  { from: 0, text: r("Zdrowa tętnica: gładki śródbłonek i elastyczna ściana.", "Здоровая артерия: гладкий эндотелий и эластичная стенка.") },
  {
    from: 10,
    text: r(
      "Pod uszkodzonym śródbłonkiem odkłada się cholesterol (z frakcji LDL) i gromadzą się makrofagi — zaczyna się blaszka miażdżycowa. Na razie nie ma objawów.",
      "Под повреждённым эндотелием откладывается холестерин (из фракции ЛПНП) и скапливаются макрофаги — начинается атеросклеротическая бляшка. Симптомов пока нет.",
    ),
  },
  {
    from: 40,
    text: r("Blaszka rośnie i twardnieje (tkanka łączna, sole wapnia). Tętnica traci elastyczność, ale w spoczynku przepływ jeszcze wystarcza.", "Бляшка растёт и твердеет (соединительная ткань, соли кальция). Артерия теряет эластичность, но в покое кровотока ещё хватает."),
  },
  {
    from: 70,
    text: r(
      "Zwężenie ogranicza przepływ, zwłaszcza w czasie wysiłku — tkanka jest niedokrwiona. W tętnicach wieńcowych objawia się to dławicą piersiową, w tętnicach nóg — chromaniem przestankowym.",
      "Сужение ограничивает кровоток, особенно при нагрузке, — ткань страдает от ишемии. В коронарных артериях это проявляется стенокардией, в артериях ног — перемежающейся хромотой.",
    ),
  },
  {
    from: 90,
    text: r(
      "Na pękniętej blaszce tworzy się zakrzep, który może całkowicie zamknąć tętnicę: w sercu dochodzi do zawału, w mózgu — do udaru niedokrwiennego.",
      "На разорвавшейся бляшке образуется тромб, который может полностью закрыть артерию: в сердце происходит инфаркт, в мозге — ишемический инсульт.",
    ),
  },
];

const RISKS: { id: string; name: Txt; fixed?: boolean }[] = [
  { id: "smoke", name: r("palenie tytoniu", "курение") },
  { id: "bp", name: r("nadciśnienie", "гипертензия") },
  { id: "ldl", name: r("wysoki cholesterol LDL", "высокий холестерин ЛПНП") },
  { id: "dm", name: r("cukrzyca", "сахарный диабет") },
  { id: "obesity", name: r("otyłość", "ожирение") },
  { id: "sitting", name: r("brak ruchu", "малоподвижность") },
  { id: "diet", name: r("dieta bogata w tłuszcze zwierzęce i sól", "питание с избытком животных жиров и соли") },
  { id: "age", name: r("wiek", "возраст"), fixed: true },
  { id: "male", name: r("płeć męska", "мужской пол"), fixed: true },
  { id: "genes", name: r("choroby serca w rodzinie", "болезни сердца в семье"), fixed: true },
];

const RISK_LEVEL: Txt[] = [r("niskie", "низкий"), r("umiarkowane", "умеренный"), r("wysokie", "высокий"), r("bardzo wysokie", "очень высокий")];

function Atherosclerosis({ lang }: { lang: BioLang }) {
  const [n, setN] = useState(0);
  const [risks, setRisks] = useState<string[]>([]);
  const f = n / 100;
  const clot = n >= 90;
  const flow = clot ? Math.max(0, Math.round(100 * (1 - f ** 4) * ((100 - n) / 10))) : Math.round(100 * (1 - f ** 4));
  const stage = [...STAGES].reverse().find((s) => n >= s.from)!;
  const half = 36 * f;
  const plaque = (top: boolean) => {
    const w = top ? 44 : 116;
    const s = top ? 1 : -1;
    return `M60 ${w} C 92 ${w}, 98 ${w + s * half}, 120 ${w + s * half} C 142 ${w + s * half}, 148 ${w}, 180 ${w} Z`;
  };
  const lumenR = 24 * (1 - f);
  const level = Math.min(3, Math.floor((risks.length + 1) / 2));
  const flowDur = flow > 0 ? (2.4 / Math.max(0.15, flow / 100)).toFixed(2) : "0";
  return (
    <div className="space-y-4">
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 320 160" className="w-full" role="img" aria-label={`${lang === "pl" ? "Zwężenie tętnicy" : "Сужение артерии"}: ${n}%`}>
            <rect width={320} height={160} rx={12} fill="#f8fafc" />
            <rect x={10} y={30} width={220} height={14} fill="#fca5a5" />
            <rect x={10} y={116} width={220} height={14} fill="#fca5a5" />
            <rect x={10} y={44} width={220} height={72} fill="#fee2e2" />
            {n > 0 && <path d={plaque(true)} fill="#fde68a" stroke="#ca8a04" strokeWidth={1.5} />}
            {n > 0 && <path d={plaque(false)} fill="#fde68a" stroke="#ca8a04" strokeWidth={1.5} />}
            {clot && <ellipse cx={120} cy={80} rx={14} ry={Math.max(2, 36 - half + 2)} fill="#7f1d1d" opacity={0.85} />}
            {flow > 0 &&
              [0, 1, 2, 3].map((k) => (
                <ellipse key={`${k}-${flowDur}`} rx={6} ry={3.5} fill="#dc2626">
                  <animateMotion dur={`${flowDur}s`} repeatCount="indefinite" path={`M14 ${70 + (k % 2) * 20} L 112 80 L 128 80 L 226 ${70 + (k % 2) * 20}`} begin={`-${(k * Number(flowDur)) / 4}s`} />
                </ellipse>
              ))}
            <text x={120} y={24} textAnchor="middle" fontSize={10} fill="#64748b">
              {lang === "pl" ? "przekrój podłużny" : "продольный разрез"}
            </text>
            <circle cx={278} cy={80} r={34} fill="#fca5a5" />
            <circle cx={278} cy={80} r={24} fill={n > 0 ? "#fde68a" : "#fee2e2"} />
            {lumenR > 0.5 && <circle cx={278} cy={80 + 14 * f} r={lumenR} fill={clot ? "#7f1d1d" : "#fee2e2"} stroke="#ef4444" strokeWidth={0.8} />}
            <text x={278} y={128} textAnchor="middle" fontSize={10} fill="#64748b">
              <tspan x={278}>{lang === "pl" ? "przekrój" : "поперечный"}</tspan>
              <tspan x={278} dy={12}>{lang === "pl" ? "poprzeczny" : "разрез"}</tspan>
            </text>
          </svg>
          <label className="mt-2 block text-sm font-semibold text-slate-700">
            {lang === "pl" ? "Zwężenie światła tętnicy" : "Сужение просвета артерии"}: <span className="tabular-nums">{n}%</span>
            <input type="range" min={0} max={100} value={n} onChange={(e) => setN(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-amber-600" aria-valuetext={`${n}%`} />
          </label>
        </div>
        <div className="space-y-3" aria-live="polite">
          <div>
            <div className="mb-1 flex justify-between text-sm text-slate-600">
              <span>{lang === "pl" ? "Przepływ krwi (orientacyjnie)" : "Кровоток (ориентировочно)"}</span>
              <span className="tabular-nums">{flow}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200" aria-hidden>
              <div className={`h-full transition-all ${flow > 60 ? "bg-emerald-500" : flow > 25 ? "bg-amber-500" : "bg-rose-600"}`} style={{ width: `${flow}%` }} />
            </div>
          </div>
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">{stage.text[lang]}</p>
          <p className="text-xs text-slate-500">
            {lang === "pl"
              ? "Przepływ długo prawie się nie zmienia, a spada gwałtownie dopiero przy dużym zwężeniu — dlatego miażdżyca przez lata nie daje objawów."
              : "Кровоток долго почти не меняется и резко падает только при сильном сужении — поэтому атеросклероз годами протекает без симптомов."}
          </p>
        </div>
      </div>
      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <h3 className="text-base font-semibold text-slate-800">⚠️ {lang === "pl" ? "Czynniki ryzyka" : "Факторы риска"}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {RISKS.map((rk) => {
            const on = risks.includes(rk.id);
            return (
              <button
                key={rk.id}
                type="button"
                aria-pressed={on}
                onClick={() => setRisks(on ? risks.filter((x) => x !== rk.id) : [...risks, rk.id])}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition-colors ${
                  on ? (rk.fixed ? "bg-slate-600 text-white ring-slate-600" : "bg-rose-600 text-white ring-rose-600") : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
                }`}
              >
                {rk.fixed ? "🔒 " : ""}
                {rk.name[lang]}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-slate-700" aria-live="polite">
          {lang === "pl" ? "Ryzyko chorób sercowo-naczyniowych" : "Риск сердечно-сосудистых заболеваний"}: <b className={level >= 2 ? "text-rose-700" : level === 1 ? "text-amber-700" : "text-emerald-700"}>{RISK_LEVEL[level]![lang]}</b>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {lang === "pl"
            ? "🔒 — czynniki, na które nie mamy wpływu. Pozostałe można zmienić. Czynniki ryzyka sumują się: każdy kolejny przyspiesza rozwój miażdżycy."
            : "🔒 — факторы, на которые мы не можем повлиять. Остальные можно изменить. Факторы риска суммируются: каждый следующий ускоряет развитие атеросклероза."}
        </p>
      </div>
    </div>
  );
}

// ---------- blood pressure ----------

interface BpCat {
  name: Txt;
  /** upper bounds (exclusive) of systolic and diastolic for this category */
  sys: number;
  dia: number;
  color: string;
  text: Txt;
}

const BP: BpCat[] = [
  { name: r("optymalne", "оптимальное"), sys: 120, dia: 80, color: "#bbf7d0", text: r("Wartości optymalne.", "Оптимальные значения.") },
  { name: r("prawidłowe", "нормальное"), sys: 130, dia: 85, color: "#d9f99d", text: r("Ciśnienie prawidłowe.", "Нормальное давление.") },
  {
    name: r("wysokie prawidłowe", "высокое нормальное"),
    sys: 140,
    dia: 90,
    color: "#fef08a",
    text: r("Jeszcze nie nadciśnienie, ale warto ograniczyć sól, więcej się ruszać i kontrolować ciśnienie.", "Ещё не гипертензия, но стоит ограничить соль, больше двигаться и контролировать давление."),
  },
  {
    name: r("nadciśnienie 1. stopnia", "гипертензия 1-й степени"),
    sys: 160,
    dia: 100,
    color: "#fed7aa",
    text: r(
      "Nieleczone nadciśnienie uszkadza naczynia, serce, nerki i mózg — sprzyja miażdżycy, zawałowi i udarowi. Pierwszy krok: mniej soli, ruch, redukcja masy ciała, niepalenie.",
      "Нелеченая гипертензия повреждает сосуды, сердце, почки и мозг — способствует атеросклерозу, инфаркту и инсульту. Первый шаг: меньше соли, движение, снижение веса, отказ от курения.",
    ),
  },
  { name: r("nadciśnienie 2. stopnia", "гипертензия 2-й степени"), sys: 180, dia: 110, color: "#fdba74", text: r("Zwykle potrzebne są leki obniżające ciśnienie.", "Обычно нужны препараты, снижающие давление.") },
  { name: r("nadciśnienie 3. stopnia", "гипертензия 3-й степени"), sys: Infinity, dia: Infinity, color: "#fca5a5", text: r("Bardzo wysokie ciśnienie — wymaga pilnej pomocy lekarskiej.", "Очень высокое давление — нужна срочная помощь врача.") },
];

const LOW: BpCat = {
  name: r("niedociśnienie", "гипотензия"),
  sys: 90,
  dia: 60,
  color: "#bae6fd",
  text: r("Niskie ciśnienie może powodować zawroty głowy i omdlenia, np. przy szybkim wstawaniu.", "Низкое давление может вызывать головокружение и обмороки, например при резком вставании."),
};

function bpCategory(sys: number, dia: number): BpCat {
  if (sys < LOW.sys || dia < LOW.dia) return LOW;
  const iS = BP.findIndex((c) => sys < c.sys);
  const iD = BP.findIndex((c) => dia < c.dia);
  return BP[Math.max(iS, iD)]!;
}

const PRESETS: [number, number][] = [
  [115, 75],
  [135, 88],
  [150, 95],
  [185, 112],
  [85, 55],
];

function BloodPressure({ lang }: { lang: BioLang }) {
  const [sys, setSys] = useState(120);
  const [dia, setDia] = useState(80);
  const invalid = dia >= sys;
  const cat = bpCategory(sys, dia);
  const isolated = !invalid && sys >= 140 && dia < 90;
  // chart: diastolic 40–120 on x, systolic 70–200 on y
  const X = (d: number) => 30 + (Math.min(120, Math.max(40, d)) - 40) * 3.4;
  const Y = (s: number) => 186 - (Math.min(200, Math.max(70, s)) - 70) * 1.3;
  const mm = lang === "pl" ? "mmHg" : "мм рт. ст.";
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <svg viewBox="0 0 310 210" className="w-full" role="img" aria-label={`${sys}/${dia} ${mm}: ${cat.name[lang]}`}>
          <rect width={310} height={210} rx={10} fill="#f8fafc" />
          {[...BP].reverse().map((c) => (
            <rect key={c.name.pl} x={X(40)} y={Y(Math.min(200, c.sys))} width={X(Math.min(120, c.dia)) - X(40)} height={Y(70) - Y(Math.min(200, c.sys))} fill={c.color} />
          ))}
          <rect x={X(40)} y={Y(90)} width={X(120) - X(40)} height={Y(70) - Y(90)} fill={LOW.color} opacity={0.85} />
          <rect x={X(40)} y={Y(200)} width={X(60) - X(40)} height={Y(70) - Y(200)} fill={LOW.color} opacity={0.85} />
          {[40, 60, 80, 100, 120].map((d) => (
            <text key={d} x={X(d)} y={200} textAnchor="middle" fontSize={8} fill="#64748b">
              {d}
            </text>
          ))}
          {[70, 90, 120, 140, 160, 180, 200].map((s) => (
            <text key={s} x={26} y={Y(s) + 3} textAnchor="end" fontSize={8} fill="#64748b">
              {s}
            </text>
          ))}
          <text x={300} y={208} textAnchor="end" fontSize={7} fill="#64748b">
            {lang === "pl" ? "rozkurczowe →" : "диастолическое →"}
          </text>
          <text x={4} y={10} fontSize={7} fill="#64748b">
            {lang === "pl" ? "↑ skurczowe" : "↑ систолическое"}
          </text>
          {!invalid && <circle cx={X(dia)} cy={Y(sys)} r={6} fill="#0f172a" stroke="white" strokeWidth={2} />}
        </svg>
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Skurczowe" : "Систолическое"}: <span className="tabular-nums">{sys} {mm}</span>
          <input type="range" min={70} max={220} value={sys} onChange={(e) => setSys(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-rose-600" aria-valuetext={`${sys} ${mm}`} />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Rozkurczowe" : "Диастолическое"}: <span className="tabular-nums">{dia} {mm}</span>
          <input type="range" min={40} max={130} value={dia} onChange={(e) => setDia(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-sky-600" aria-valuetext={`${dia} ${mm}`} />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(([s, d]) => (
            <Choice
              key={`${s}/${d}`}
              state={s === sys && d === dia ? "active" : "idle"}
              onClick={() => {
                setSys(s);
                setDia(d);
              }}
            >
              {s}/{d}
            </Choice>
          ))}
        </div>
      </div>
      <div className="space-y-3" aria-live="polite">
        <p className="text-3xl font-bold text-slate-900 tabular-nums">
          {sys}/{dia} <span className="text-base font-medium text-slate-500">{mm}</span>
        </p>
        {invalid ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-[15px] text-rose-900 ring-1 ring-rose-200">
            {lang === "pl" ? "Ciśnienie rozkurczowe musi być niższe niż skurczowe." : "Диастолическое давление должно быть ниже систолического."}
          </p>
        ) : (
          <div className="rounded-xl px-4 py-3 text-[15px] leading-relaxed ring-1 ring-slate-300" style={{ background: cat.color }}>
            <p className="font-semibold text-slate-900">{cat.name[lang]}</p>
            <p className="mt-1 text-slate-800">{cat.text[lang]}</p>
            {isolated && (
              <p className="mt-1 text-sm text-slate-700">
                {lang === "pl" ? "Podwyższone jest tylko ciśnienie skurczowe — to izolowane nadciśnienie skurczowe, częste u osób starszych o sztywnych tętnicach." : "Повышено только систолическое давление — это изолированная систолическая гипертензия, частая у пожилых людей с жёсткими артериями."}
              </p>
            )}
          </div>
        )}
        <p className="text-sm text-slate-500">
          {lang === "pl"
            ? "O kategorii decyduje wyższa z dwóch wartości. Nadciśnienie rozpoznaje lekarz na podstawie kilku pomiarów wykonanych w różne dni."
            : "Категорию определяет более высокое из двух значений. Гипертензию диагностирует врач по нескольким измерениям в разные дни."}
        </p>
      </div>
    </div>
  );
}

// ---------- circulation quiz ----------

const CIRC_OPTIONS: QuizOption[] = [
  { id: "athero", label: r("miażdżyca", "атеросклероз") },
  { id: "ihd", label: r("choroba niedokrwienna serca", "ишемическая болезнь сердца") },
  { id: "mi", label: r("zawał serca", "инфаркт миокарда") },
  { id: "htn", label: r("nadciśnienie tętnicze", "артериальная гипертензия") },
  { id: "stroke", label: r("udar mózgu", "инсульт") },
  { id: "varices", label: r("żylaki", "варикозное расширение вен") },
  { id: "anemia", label: r("niedokrwistość z niedoboru żelaza", "железодефицитная анемия") },
  { id: "hemophilia", label: r("hemofilia", "гемофилия") },
  { id: "sickle", label: r("niedokrwistość sierpowata", "серповидноклеточная анемия") },
  { id: "leukemia", label: r("białaczka", "лейкоз") },
];

const CIRC_ITEMS: QuizItem[] = [
  {
    icon: "🦵",
    name: r("ból łydek podczas chodzenia, ustępujący w spoczynku", "боль в икрах при ходьбе, проходящая в покое"),
    answer: "athero",
    explain: r("To chromanie przestankowe: blaszki miażdżycowe zwężają tętnice nóg i przy wysiłku mięśnie dostają za mało krwi.", "Это перемежающаяся хромота: атеросклеротические бляшки сужают артерии ног, и при нагрузке мышцы получают мало крови."),
  },
  {
    icon: "🏃",
    name: r("ucisk i ból za mostkiem przy wysiłku, mijający po odpoczynku", "давящая боль за грудиной при нагрузке, проходящая после отдыха"),
    answer: "ihd",
    explain: r("Dławica piersiowa: zwężone tętnice wieńcowe nie nadążają z dostarczaniem tlenu do mięśnia sercowego w czasie wysiłku.", "Стенокардия: суженные коронарные артерии не успевают доставлять кислород к сердечной мышце при нагрузке."),
  },
  {
    icon: "💔",
    name: r("silny, piekący ból za mostkiem promieniujący do lewej ręki, trwający ponad 20 minut", "сильная жгучая боль за грудиной, отдающая в левую руку, дольше 20 минут"),
    answer: "mi",
    explain: r("Skrzep zamknął tętnicę wieńcową i fragment mięśnia sercowego obumiera — trzeba natychmiast wezwać pogotowie.", "Тромб закрыл коронарную артерию, и участок сердечной мышцы отмирает — нужно немедленно вызвать скорую."),
  },
  {
    icon: "🩺",
    name: r("ciśnienie stale powyżej 140/90 mmHg i bóle głowy", "давление постоянно выше 140/90 мм рт. ст. и головные боли"),
    answer: "htn",
    explain: r("Sprzyjają mu nadmiar soli, otyłość, stres i brak ruchu. Przez lata może nie dawać objawów.", "Ему способствуют избыток соли, ожирение, стресс и малоподвижность. Годами может протекать без симптомов."),
  },
  {
    icon: "🧠",
    name: r("nagły niedowład połowy ciała, opadnięty kącik ust i zaburzenia mowy", "внезапная слабость половины тела, опущенный уголок рта и нарушение речи"),
    answer: "stroke",
    explain: r("Naczynie w mózgu zostało zamknięte lub pękło. Liczy się każda minuta — trzeba wezwać pogotowie.", "Сосуд в мозге закупорился или разорвался. Важна каждая минута — нужно вызвать скорую."),
  },
  {
    icon: "🦶",
    name: r("poszerzone, kręte, uwypuklone żyły na łydkach i uczucie ciężkich nóg", "расширенные извитые выступающие вены на голенях и тяжесть в ногах"),
    answer: "varices",
    explain: r("Zastawki żylne nie domykają się, krew zalega w żyłach — sprzyja temu długie stanie lub siedzenie.", "Венозные клапаны не смыкаются, кровь застаивается в венах — этому способствует долгое стояние или сидение."),
  },
  {
    icon: "😮‍💨",
    name: r("bladość, osłabienie, szybkie męczenie się i zadyszka", "бледность, слабость, быстрая утомляемость и одышка"),
    answer: "anemia",
    explain: r("Bez żelaza nie powstaje dość hemoglobiny, więc krew przenosi mniej tlenu.", "Без железа не образуется достаточно гемоглобина, поэтому кровь переносит меньше кислорода."),
  },
  {
    icon: "🩸",
    name: r("długie krwawienia po drobnych urazach i wylewy krwi do stawów u chłopca", "долгие кровотечения после мелких травм и кровоизлияния в суставы у мальчика"),
    answer: "hemophilia",
    explain: r("Dziedziczny, sprzężony z chromosomem X niedobór czynnika krzepnięcia (VIII lub IX) — dlatego chorują głównie chłopcy.", "Наследственный, сцепленный с X-хромосомой недостаток фактора свёртывания (VIII или IX) — поэтому болеют в основном мальчики."),
  },
  {
    icon: "🌙",
    name: r("erytrocyty w kształcie półksiężyca zatykające naczynia włosowate", "эритроциты в форме полумесяца, закупоривающие капилляры"),
    answer: "sickle",
    explain: r("Mutacja genu hemoglobiny zmienia kształt krwinek — bóle i niedokrwistość.", "Мутация гена гемоглобина меняет форму эритроцитов — боли и анемия."),
  },
  {
    icon: "🦴",
    name: r("niedokrwistość, częste zakażenia i skłonność do krwawień; w szpiku pełno niedojrzałych krwinek białych", "анемия, частые инфекции и склонность к кровотечениям; в костном мозге много незрелых лейкоцитов"),
    answer: "leukemia",
    explain: r("Nowotworowe krwinki białe wypierają w szpiku prawidłowe erytrocyty, leukocyty i płytki.", "Опухолевые лейкоциты вытесняют в костном мозге нормальные эритроциты, лейкоциты и тромбоциты."),
  },
];

// ---------- allergy ----------

const ALLERGY: { name: Txt; text: Txt }[] = [
  {
    name: r("Pierwszy kontakt z alergenem", "Первая встреча с аллергеном"),
    text: r(
      "Alergen (np. pyłek traw) jest nieszkodliwy dla większości ludzi. U osoby z predyspozycją limfocyty B, pobudzone przez limfocyty Th, przekształcają się w komórki plazmatyczne wytwarzające przeciwciała IgE.",
      "Аллерген (например, пыльца злаков) безвреден для большинства людей. У предрасположенного человека В-лимфоциты, активированные Т-хелперами, превращаются в плазматические клетки, вырабатывающие антитела IgE.",
    ),
  },
  {
    name: r("Uczulenie", "Сенсибилизация"),
    text: r(
      "Przeciwciała IgE przyczepiają się do komórek tucznych (mastocytów) w skórze i błonach śluzowych. Objawów jeszcze nie ma, ale organizm jest już uczulony.",
      "Антитела IgE прикрепляются к тучным клеткам (мастоцитам) в коже и слизистых оболочках. Симптомов ещё нет, но организм уже сенсибилизирован.",
    ),
  },
  {
    name: r("Ponowny kontakt", "Повторная встреча"),
    text: r("Alergen łączy się z IgE na powierzchni komórek tucznych, które natychmiast uwalniają ziarnistości z histaminą.", "Аллерген связывается с IgE на поверхности тучных клеток, и те сразу выбрасывают гранулы с гистамином."),
  },
  {
    name: r("Działanie histaminy", "Действие гистамина"),
    text: r(
      "Histamina rozszerza naczynia i zwiększa ich przepuszczalność — stąd zaczerwienienie, obrzęk, katar, łzawienie i świąd. Kurczy też mięśnie gładkie oskrzeli, co wywołuje duszność. Objawy łagodzą leki przeciwhistaminowe.",
      "Гистамин расширяет сосуды и повышает их проницаемость — отсюда покраснение, отёк, насморк, слезотечение и зуд. Он также сокращает гладкие мышцы бронхов, вызывая удушье. Симптомы смягчают антигистаминные препараты.",
    ),
  },
  {
    name: r("Wstrząs anafilaktyczny", "Анафилактический шок"),
    text: r(
      "Gdy histamina uwalnia się w całym ciele (np. po użądleniu osy), ciśnienie krwi gwałtownie spada, a obrzęk gardła utrudnia oddychanie. To stan zagrożenia życia — ratunkiem jest natychmiastowe podanie adrenaliny.",
      "Когда гистамин выбрасывается во всём теле (например, после укуса осы), давление резко падает, а отёк горла затрудняет дыхание. Это угроза жизни — спасает немедленное введение адреналина.",
    ),
  },
];

function Allergen({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={9} fill="#facc15" stroke="#a16207" />
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2;
        return <path key={k} d={`M${9 * Math.cos(a)} ${9 * Math.sin(a)} L ${13 * Math.cos(a)} ${13 * Math.sin(a)}`} stroke="#a16207" strokeWidth={2} />;
      })}
    </g>
  );
}

function IgE({ x, y, a = 0 }: { x: number; y: number; a?: number }) {
  return <path d={`M0 10 L 0 0 L -5 -6 M0 0 L 5 -6`} transform={`translate(${x} ${y}) rotate(${a})`} stroke="#0d9488" strokeWidth={2.5} fill="none" strokeLinecap="round" />;
}

function Allergy({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const step = ALLERGY[i]!;
  // IgE on the mast cell surface, pointing outwards
  const surface = [-60, -30, 0, 30, 60, 150, 180, 210].map((deg) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return { x: 220 + 44 * Math.cos(a), y: 100 + 44 * Math.sin(a), deg };
  });
  const granules: [number, number][] = [
    [206, 88],
    [226, 82],
    [240, 100],
    [214, 112],
    [232, 118],
    [200, 104],
    [222, 98],
  ];
  const released = i >= 2;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 320 200" className="w-full" role="img" aria-label={step.name[lang]}>
          <rect width={320} height={200} rx={12} fill="#f8fafc" />
          <Allergen x={34} y={i === 0 ? 100 : 40} />
          {i === 0 && (
            <g>
              <circle cx={100} cy={100} r={20} fill="#ede9fe" stroke="#6d28d9" strokeWidth={2} />
              <text x={100} y={104} textAnchor="middle" fontSize={10} fontWeight={700} fill="#6d28d9">
                B
              </text>
              <path d="M48 100 L 76 100" stroke="#475569" strokeWidth={2} />
              {[
                [134, 80, 30],
                [140, 104, 80],
                [130, 126, 130],
              ].map(([x, y, a]) => (
                <IgE key={y} x={x} y={y} a={a} />
              ))}
            </g>
          )}
          <circle cx={220} cy={100} r={40} fill="#fce7f3" stroke="#be185d" strokeWidth={2} strokeDasharray={released ? "6 4" : undefined} />
          <text x={220} y={160} textAnchor="middle" fontSize={10} fill="#9d174d">
            {lang === "pl" ? "komórka tuczna" : "тучная клетка"}
          </text>
          {granules.map(([x, y], k) => (
            <circle key={k} cx={released ? x + (x - 220) * 1.6 + (k % 2 ? 30 : -30) : x} cy={released ? y + (y - 100) * 1.6 : y} r={4} fill="#a855f7" style={{ transition: "all .7s" }} />
          ))}
          {i >= 1 && surface.map((s) => <IgE key={s.deg} x={s.x} y={s.y} a={s.deg} />)}
          {i >= 2 &&
            surface.slice(0, 5).map((s) => {
              const a = ((s.deg - 90) * Math.PI) / 180;
              return <Allergen key={s.deg} x={220 + 66 * Math.cos(a)} y={100 + 66 * Math.sin(a)} />;
            })}
          {released && (
            <text x={300} y={190} textAnchor="end" fontSize={10} fontWeight={600} fill="#7e22ce">
              {lang === "pl" ? "• histamina" : "• гистамин"}
            </text>
          )}
          {i >= 3 && (
            <text x={20} y={180} fontSize={18}>
              🤧 😵‍💫
            </text>
          )}
          {i === 4 && (
            <text x={110} y={180} fontSize={18}>
              💉
            </text>
          )}
        </svg>
        <div className="mt-2 flex flex-wrap gap-2">
          <Choice onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
            ‹ {lang === "pl" ? "Wstecz" : "Назад"}
          </Choice>
          {i < ALLERGY.length - 1 ? (
            <Choice state="active" onClick={() => setI(i + 1)}>
              {KIT.next[lang]} ›
            </Choice>
          ) : (
            <Choice onClick={() => setI(0)}>↺ {KIT.again[lang]}</Choice>
          )}
        </div>
      </div>
      <div className="space-y-3" aria-live="polite">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {lang === "pl" ? "Krok" : "Шаг"} {i + 1} / {ALLERGY.length}
        </p>
        <h3 className="text-base font-semibold text-slate-900">{step.name[lang]}</h3>
        <p className="text-[15px] leading-relaxed text-slate-700">{step.text[lang]}</p>
        <p className="text-xs text-slate-500">
          <span className="font-bold text-teal-600">Y</span> IgE · <span className="text-purple-500">●</span> {lang === "pl" ? "ziarnistości z histaminą" : "гранулы с гистамином"}
        </p>
      </div>
    </div>
  );
}

// ---------- immune disorders quiz ----------

const IMMUNE_OPTIONS: QuizOption[] = [
  { id: "hypersensitivity", label: r("nadwrażliwość", "гиперчувствительность") },
  { id: "acquired", label: r("nabyty niedobór odporności", "приобретённый иммунодефицит") },
  { id: "congenital", label: r("wrodzony niedobór odporności", "врождённый иммунодефицит") },
  { id: "autoimmune", label: r("choroba autoimmunizacyjna", "аутоиммунное заболевание") },
  { id: "rejection", label: r("reakcja na przeszczep", "реакция на трансплантат") },
];

const IMMUNE_ITEMS: QuizItem[] = [
  { icon: "🤧", name: r("alergia", "аллергия"), answer: "hypersensitivity", explain: r("Miejscowa, nadmierna reakcja na nieszkodliwy antygen — alergen, np. pyłek roślin lub sierść.", "Местная чрезмерная реакция на безвредный антиген — аллерген, например пыльцу растений или шерсть.") },
  { icon: "🦠", name: r("AIDS", "СПИД"), answer: "acquired", explain: r("Wirus HIV niszczy limfocyty T pomocnicze; pojawiają się zakażenia oportunistyczne i nowotwory.", "ВИЧ разрушает Т-хелперы; возникают оппортунистические инфекции и опухоли.") },
  { icon: "🍬", name: r("cukrzyca typu 1", "сахарный диабет 1 типа"), answer: "autoimmune", explain: r("Własne limfocyty niszczą komórki beta wysp trzustkowych wytwarzające insulinę.", "Собственные лимфоциты разрушают бета-клетки островков поджелудочной железы, вырабатывающие инсулин.") },
  { icon: "🐝", name: r("wstrząs anafilaktyczny", "анафилактический шок"), answer: "hypersensitivity", explain: r("Ponowny kontakt uczulonego organizmu z alergenem wywołuje masowe uwolnienie histaminy w całym ciele.", "Повторный контакт сенсибилизированного организма с аллергеном вызывает массовый выброс гистамина во всём теле.") },
  { icon: "🖐️", name: r("reumatoidalne zapalenie stawów", "ревматоидный артрит"), answer: "autoimmune", explain: r("Układ odpornościowy atakuje błonę maziową stawów.", "Иммунная система атакует синовиальную оболочку суставов.") },
  { icon: "👶", name: r("ciężki złożony niedobór odporności (SCID)", "тяжёлый комбинированный иммунодефицит (ТКИД)"), answer: "congenital", explain: r("Wrodzona wada genetyczna uniemożliwia powstawanie dojrzałych limfocytów T i B — ciężkie zakażenia od pierwszych miesięcy życia.", "Врождённый генетический дефект не даёт образоваться зрелым Т- и В-лимфоцитам — тяжёлые инфекции с первых месяцев жизни.") },
  { icon: "🧠", name: r("stwardnienie rozsiane", "рассеянный склероз"), answer: "autoimmune", explain: r("Limfocyty niszczą osłonki mielinowe neuronów mózgu i rdzenia kręgowego.", "Лимфоциты разрушают миелиновые оболочки нейронов головного и спинного мозга.") },
  { icon: "🫀", name: r("odrzucenie przeszczepionej nerki", "отторжение пересаженной почки"), answer: "rejection", explain: r("Antygeny zgodności tkankowej dawcy są rozpoznawane jako obce; dlatego po przeszczepie podaje się leki hamujące odporność.", "Антигены тканевой совместимости донора распознаются как чужие; поэтому после пересадки дают препараты, подавляющие иммунитет.") },
  { icon: "🦋", name: r("choroba Hashimoto", "тиреоидит Хашимото"), answer: "autoimmune", explain: r("Przeciwciała i limfocyty niszczą tarczycę — rozwija się jej niedoczynność.", "Антитела и лимфоциты разрушают щитовидную железу — развивается гипотиреоз.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Miażdżyca: blaszki z cholesterolu zwężają tętnice i usztywniają ich ściany.", ru: "Атеросклероз: холестериновые бляшки сужают артерии и делают их стенки жёсткими." },
    { pl: "Zwężenie tętnic wieńcowych → choroba niedokrwienna serca; zamknięcie przez skrzep → zawał; w mózgu → udar.", ru: "Сужение коронарных артерий → ишемическая болезнь сердца; закупорка тромбом → инфаркт; в мозге → инсульт." },
  ],
  s2: [
    { pl: "Nadciśnienie tętnicze: ciśnienie stale równe lub wyższe niż 140/90 mmHg.", ru: "Артериальная гипертензия: давление постоянно 140/90 мм рт. ст. и выше." },
    { pl: "Nadciśnienie przez lata nie boli, a uszkadza serce, naczynia, nerki i mózg.", ru: "Гипертензия годами не болит, но повреждает сердце, сосуды, почки и мозг." },
  ],
  s3: [{ pl: "Hemofilia i niedokrwistość sierpowata są dziedziczne; większości pozostałych chorób układu krążenia sprzyja styl życia.", ru: "Гемофилия и серповидноклеточная анемия наследственные; большинству остальных болезней кровообращения способствует образ жизни." }],
  s4: [
    { pl: "W alergii główną rolę grają przeciwciała IgE, komórki tuczne i histamina.", ru: "В аллергии главную роль играют антитела IgE, тучные клетки и гистамин." },
    { pl: "Wstrząs anafilaktyczny zagraża życiu — podaje się adrenalinę.", ru: "Анафилактический шок угрожает жизни — вводят адреналин." },
  ],
  s5: [
    { pl: "W chorobach autoimmunizacyjnych układ odpornościowy atakuje własne tkanki.", ru: "При аутоиммунных заболеваниях иммунная система атакует собственные ткани." },
    { pl: "HIV niszczy limfocyty T pomocnicze — dlatego AIDS to nabyty niedobór odporności.", ru: "ВИЧ разрушает Т-хелперы — поэтому СПИД является приобретённым иммунодефицитом." },
  ],
};

export default function CirculationDisordersLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="cird" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="cird-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <Atherosclerosis lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="cird-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <BloodPressure lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="cird-s3" n={3} title={T.s3[lang]}>
        <MatchQuiz
          lang={lang}
          title={T.s3}
          question={r("Jaka choroba daje objawy:", "Какая болезнь даёт симптомы:")}
          options={CIRC_OPTIONS}
          items={CIRC_ITEMS}
          wrongHint={r("Zastanów się, które naczynie lub który składnik krwi jest uszkodzony.", "Подумай, какой сосуд или какой компонент крови поражён.")}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="cird-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Allergy lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="cird-s5" n={5} title={T.s5[lang]}>
        <MatchQuiz
          lang={lang}
          title={T.s5}
          question={r("Jaki to rodzaj zaburzenia odporności:", "Какой это вид нарушения иммунитета:")}
          options={IMMUNE_OPTIONS}
          items={IMMUNE_ITEMS}
          wrongHint={r("Zapytaj: czy odporność reaguje za mocno, za słabo, czy atakuje własne tkanki?", "Спроси себя: иммунитет реагирует слишком сильно, слишком слабо или атакует собственные ткани?")}
        />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
