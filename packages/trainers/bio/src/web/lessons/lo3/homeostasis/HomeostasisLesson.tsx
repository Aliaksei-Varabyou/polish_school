// Lesson for LO3 §1.3 "Homeostaza" (zakres rozszerzony). Terms, normal values and responses follow
// templates/data/homeostasis.ts (HOMEOSTASIS, PARAMETERS, RESPONSES).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, TwoWaySort, type CompareCard, type QuizItem, type QuizOption, type SortItem } from "../../games.tsx";
import { num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Na zewnątrz bywa mróz albo upał, a temperatura wewnątrz ciała prawie się nie zmienia. Homeostaza to utrzymywanie stałości środowiska wewnętrznego mimo zmian na zewnątrz — dzięki pętlom regulacyjnym, które wykrywają odchylenie i je wygaszają.",
    "Снаружи бывает мороз или жара, а температура внутри тела почти не меняется. Гомеостаз — поддержание постоянства внутренней среды несмотря на внешние изменения — благодаря регуляторным петлям, которые замечают отклонение и гасят его.",
  ),
  s1: r("Termoregulacja — pętla w działaniu", "Терморегуляция — петля в действии"),
  s1intro: r(
    "Zmieniaj temperaturę otoczenia i włącz wysiłek. Obserwuj, które efektory pracują i jak mało zmienia się temperatura wewnętrzna ciała.",
    "Меняй температуру среды и включай нагрузку. Смотри, какие эффекторы работают и как мало меняется внутренняя температура тела.",
  ),
  s2: r("Ujemne i dodatnie sprzężenie zwrotne", "Отрицательная и положительная обратная связь"),
  s2intro: r(
    "Ujemne sprzężenie zwrotne wygasza odchylenie — to podstawa homeostazy. Dodatnie wzmacnia je aż do zakończenia procesu.",
    "Отрицательная обратная связь гасит отклонение — это основа гомеостаза. Положительная усиливает его до завершения процесса.",
  ),
  s3: r("Parametry środowiska wewnętrznego", "Показатели внутренней среды"),
  s3intro: r("Każdy z tych parametrów ma swoją wartość prawidłową i własne mechanizmy, które ją przywracają.", "У каждого из этих показателей есть своя норма и свои механизмы, которые её восстанавливают."),
  s4: r("Gdy homeostaza zawodzi", "Когда гомеостаз нарушен"),
  s4intro: r("Rozpoznaj, który parametr środowiska wewnętrznego jest zaburzony.", "Определи, какой показатель внутренней среды нарушен."),
} satisfies Record<string, Txt>;

// ---------- thermoregulation simulator ----------

const SIM = {
  ambient: r("Temperatura otoczenia", "Температура среды"),
  activity: r("Aktywność", "Активность"),
  rest: r("Spoczynek", "Покой"),
  exercise: r("Wysiłek fizyczny", "Физическая нагрузка"),
  core: r("Temperatura wewnętrzna", "Внутренняя температура"),
  vessels: r("Naczynia krwionośne skóry", "Кровеносные сосуды кожи"),
  sweat: r("Gruczoły potowe", "Потовые железы"),
  shiver: r("Mięśnie szkieletowe (drżenie)", "Скелетные мышцы (дрожь)"),
  pili: r("Mięśnie przywłosowe", "Мышцы, поднимающие волосы"),
  wide: r("rozszerzone — więcej ciepła oddawane przez skórę", "расширены — кожа отдаёт больше тепла"),
  narrow: r("zwężone — mniej krwi płynie przy powierzchni", "сужены — у поверхности течёт меньше крови"),
  normal: r("bez zmian", "без изменений"),
  sweatOn: r("wydzielają pot — jego parowanie chłodzi", "выделяют пот — его испарение охлаждает"),
  off: r("nieaktywne", "не активны"),
  shiverOn: r("drżą — skurcze wytwarzają ciepło", "дрожат — сокращения выделяют тепло"),
  piliOn: r("„gęsia skórka”", "«гусиная кожа»"),
  behaviourHot: r("Zachowanie: zdejmujemy ubranie, szukamy cienia, pijemy więcej.", "Поведение: снимаем одежду, ищем тень, больше пьём."),
  behaviourCold: r("Zachowanie: ubieramy się cieplej, kulimy się, szukamy ciepła.", "Поведение: одеваемся теплее, сжимаемся, ищем тепло."),
  limitHot: r(
    "Efektory pracują na granicy możliwości. Gdy pot nie nadąża parować, temperatura ciała rośnie — grozi udar cieplny.",
    "Эффекторы работают на пределе. Если пот не успевает испаряться, температура тела растёт — грозит тепловой удар.",
  ),
  limitCold: r(
    "Efektory pracują na granicy możliwości. Gdy utrata ciepła przewyższa jego wytwarzanie, grozi hipotermia (poniżej 35 °C).",
    "Эффекторы работают на пределе. Если теплопотери превышают теплообразование, грозит гипотермия (ниже 35 °C).",
  ),
  hormones: r(
    "Przy długotrwałym zimnie rośnie też wydzielanie tyroksyny, która przyspiesza przemianę materii i wytwarzanie ciepła.",
    "При длительном холоде растёт и выделение тироксина, который ускоряет обмен веществ и теплообразование.",
  ),
};

const LOOP = {
  stimulus: r("Bodziec", "Раздражитель"),
  receptors: r("Receptory", "Рецепторы"),
  centre: r("Ośrodek", "Центр"),
  effectors: r("Efektory", "Эффекторы"),
  hot: { pl: ["temperatura ciała", "rośnie"], ru: ["температура тела", "растёт"] },
  cold: { pl: ["temperatura ciała", "spada"], ru: ["температура тела", "падает"] },
  ok: { pl: ["temperatura", "w normie"], ru: ["температура", "в норме"] },
  rec: { pl: ["termoreceptory skóry", "i podwzgórza"], ru: ["терморецепторы кожи", "и гипоталамуса"] },
  hyp: { pl: ["podwzgórze porównuje", "z wartością 36,6 °C"], ru: ["гипоталамус сравнивает", "с нормой 36,6 °C"] },
  effHot: { pl: ["naczynia skóry,", "gruczoły potowe"], ru: ["сосуды кожи,", "потовые железы"] },
  effCold: { pl: ["naczynia skóry,", "mięśnie szkieletowe"], ru: ["сосуды кожи,", "скелетные мышцы"] },
  effOk: { pl: ["pracują", "w zwykłym trybie"], ru: ["работают", "в обычном режиме"] },
  back: r("reakcja usuwa odchylenie", "ответ устраняет отклонение"),
};

type Lines = Readonly<Record<BioLang, string[]>>;

function LoopBox({ x, y, title, lines, lang, on, color }: { x: number; y: number; title: Txt; lines: Lines; lang: BioLang; on: boolean; color: string }) {
  return (
    <g>
      <rect x={x} y={y} width={134} height={58} rx={10} fill={on ? color : "#f8fafc"} stroke={on ? "#0f172a" : "#cbd5e1"} strokeWidth={on ? 2 : 1.2} style={{ transition: "fill .3s" }} />
      <text x={x + 67} y={y + 17} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">
        {title[lang]}
      </text>
      {lines[lang].map((line, k) => (
        <text key={line} x={x + 67} y={y + 33 + k * 12} textAnchor="middle" fontSize={9.5} fill="#334155">
          {line}
        </text>
      ))}
    </g>
  );
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function Thermoregulation({ lang }: { lang: BioLang }) {
  const [ambient, setAmbient] = useState(22);
  const [exercise, setExercise] = useState(false);
  // + heat load (too warm), − heat loss (too cold)
  const load = (ambient - 22) / 16 + (exercise ? 0.8 : 0);
  const dilate = clamp01(load / 1.2);
  const constrict = clamp01(-load / 1.2);
  const sweat = clamp01((load - 0.25) / 1.1);
  const shiver = clamp01((-load - 0.5) / 0.9);
  const pili = load < -0.3;
  const core = 36.6 + Math.max(-0.5, Math.min(0.7, load * 0.2));
  const mode = load > 0.15 ? "hot" : load < -0.15 ? "cold" : "ok";
  const limit = load > 1.6 ? SIM.limitHot : load < -1.6 ? SIM.limitCold : null;
  const tone = mode === "hot" ? "#fecaca" : mode === "cold" ? "#bfdbfe" : "#e2e8f0";
  const skin = mode === "hot" ? `hsl(0, ${70 + dilate * 20}%, ${86 - dilate * 10}%)` : mode === "cold" ? `hsl(220, ${30 + constrict * 30}%, ${90 - constrict * 4}%)` : "#fcd9b6";
  const vesselW = 1.5 + dilate * 3 - constrict * 1;
  const drops = Math.round(sweat * 6);
  const thermoY = (tC: number) => 196 - ((tC - 35) / 4) * 150;
  const bar = (v: number, color: string) => (
    <span className="h-2.5 w-20 shrink-0 overflow-hidden rounded-full bg-slate-200" aria-hidden>
      <span className="block h-full transition-all" style={{ width: `${Math.round(v * 100)}%`, background: color }} />
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="block text-sm font-semibold text-slate-700">
          {SIM.ambient[lang]}: <span className="tabular-nums">{num(ambient)} °C</span>
          <input
            type="range"
            min={-10}
            max={40}
            value={ambient}
            onChange={(e) => setAmbient(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-rose-500"
            aria-valuetext={`${num(ambient)} °C`}
          />
          <span className="mt-1 flex justify-between text-xs font-normal text-slate-500">
            <span>−10 °C</span>
            <span>40 °C</span>
          </span>
        </label>
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">{SIM.activity[lang]}</div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={SIM.activity[lang]}>
            {[false, true].map((v) => (
              <button
                key={String(v)}
                type="button"
                role="radio"
                aria-checked={exercise === v}
                onClick={() => setExercise(v)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
                  exercise === v ? "bg-indigo-600 text-white ring-indigo-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
                }`}
              >
                {v ? `🏃 ${SIM.exercise[lang]}` : `🧍 ${SIM.rest[lang]}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <svg viewBox="0 0 200 220" className="mx-auto w-full max-w-[280px]" role="img" aria-label={`${SIM.core[lang]}: ${num(core, 1)} °C`}>
          <style>{".homeo-shiver{animation:homeo-shiver .12s linear infinite}@keyframes homeo-shiver{0%{transform:translateX(-1px)}50%{transform:translateX(1px)}100%{transform:translateX(-1px)}}"}</style>
          <rect width={200} height={220} rx={12} fill={mode === "hot" ? "#fff7ed" : mode === "cold" ? "#eff6ff" : "#f8fafc"} />
          <g className={shiver > 0 ? "homeo-shiver" : undefined}>
            <circle cx={70} cy={34} r={18} fill={skin} stroke="#92400e" strokeWidth={1.5} />
            <path d="M52 66 L 30 128 M88 66 L 110 128" stroke={skin} strokeWidth={14} strokeLinecap="round" />
            <path d="M52 66 L 30 128 M88 66 L 110 128" stroke="#92400e" strokeWidth={14} strokeLinecap="round" opacity={0.12} />
            <path d="M60 136 L 56 206 M80 136 L 84 206" stroke={skin} strokeWidth={16} strokeLinecap="round" />
            <rect x={46} y={54} width={48} height={88} rx={16} fill={skin} stroke="#92400e" strokeWidth={1.5} />
            {/* skin vessels on the arms */}
            <path d="M47 80 L 33 120 M93 80 L 107 120" stroke="#dc2626" strokeWidth={vesselW} strokeLinecap="round" opacity={0.75} style={{ transition: "stroke-width .3s" }} />
            {pili &&
              [
                [44, 90],
                [40, 102],
                [96, 90],
                [100, 102],
                [62, 160],
                [80, 170],
              ].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} fill="#475569" />)}
          </g>
          {Array.from({ length: drops }, (_, k) => {
            const [x, y] = [
              [56, 28],
              [86, 40],
              [50, 80],
              [92, 96],
              [64, 118],
              [36, 110],
            ][k]!;
            return <path key={k} d={`M${x} ${y} q 4 7 0 9 q -4 -2 0 -9 Z`} fill="#38bdf8" stroke="#0369a1" strokeWidth={0.8} />;
          })}
          {shiver > 0 && (
            <g stroke="#2563eb" strokeWidth={1.5} fill="none" opacity={0.4 + shiver * 0.6}>
              <path d="M18 70 l 4 -4 l 4 4 l 4 -4 M18 150 l 4 -4 l 4 4 l 4 -4" />
              <path d="M112 70 l 4 -4 l 4 4 l 4 -4 M112 150 l 4 -4 l 4 4 l 4 -4" />
            </g>
          )}
          {/* thermometer of the core temperature */}
          <rect x={150} y={40} width={16} height={160} rx={8} fill="white" stroke="#64748b" strokeWidth={1.5} />
          <circle cx={158} cy={204} r={11} fill="#ef4444" stroke="#64748b" strokeWidth={1.5} />
          <rect x={154} y={thermoY(core)} width={8} height={204 - thermoY(core)} fill="#ef4444" style={{ transition: "all .3s" }} />
          {[35, 36, 37, 38, 39].map((tC) => (
            <g key={tC}>
              <path d={`M166 ${thermoY(tC)} L 172 ${thermoY(tC)}`} stroke="#64748b" />
              <text x={175} y={thermoY(tC) + 3} fontSize={8} fill="#475569">
                {tC}
              </text>
            </g>
          ))}
          <path d={`M146 ${thermoY(36.6)} L 170 ${thermoY(36.6)}`} stroke="#059669" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={158} y={30} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">
            {num(core, 1)} °C
          </text>
        </svg>

        <div className="space-y-3">
          <svg viewBox="0 0 300 180" className="w-full" role="img" aria-label={`${LOOP.stimulus[lang]} → ${LOOP.receptors[lang]} → ${LOOP.centre[lang]} → ${LOOP.effectors[lang]}`}>
            <defs>
              <marker id="homeo-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L 10 5 L 0 10 Z" fill="#475569" />
              </marker>
            </defs>
            <LoopBox x={4} y={4} title={LOOP.stimulus} lines={mode === "hot" ? LOOP.hot : mode === "cold" ? LOOP.cold : LOOP.ok} lang={lang} on={mode !== "ok"} color={tone} />
            <LoopBox x={162} y={4} title={LOOP.receptors} lines={LOOP.rec} lang={lang} on={mode !== "ok"} color={tone} />
            <LoopBox x={162} y={118} title={LOOP.centre} lines={LOOP.hyp} lang={lang} on={mode !== "ok"} color={tone} />
            <LoopBox x={4} y={118} title={LOOP.effectors} lines={mode === "hot" ? LOOP.effHot : mode === "cold" ? LOOP.effCold : LOOP.effOk} lang={lang} on={mode !== "ok"} color={tone} />
            <g stroke="#475569" strokeWidth={2} fill="none" markerEnd="url(#homeo-arrow)">
              <path d="M140 33 L 160 33" />
              <path d="M229 64 L 229 116" />
              <path d="M160 147 L 140 147" />
              <path d="M71 116 L 71 64" />
            </g>
            <text x={79} y={88} fontSize={14} fontWeight={700} fill="#be123c">
              −
            </text>
            <text x={79} y={101} fontSize={8.5} fill="#475569">
              {LOOP.back[lang]}
            </text>
          </svg>
          <ul className="space-y-1.5 text-sm" aria-live="polite">
            <li className="flex items-center gap-2">
              {bar(Math.max(dilate, constrict), dilate > 0 ? "#ef4444" : "#3b82f6")}
              <span>
                <b className="font-medium">{SIM.vessels[lang]}:</b> {(dilate > 0.05 ? SIM.wide : constrict > 0.05 ? SIM.narrow : SIM.normal)[lang]}
              </span>
            </li>
            <li className="flex items-center gap-2">
              {bar(sweat, "#0ea5e9")}
              <span>
                <b className="font-medium">{SIM.sweat[lang]}:</b> {(sweat > 0 ? SIM.sweatOn : SIM.off)[lang]}
              </span>
            </li>
            <li className="flex items-center gap-2">
              {bar(shiver, "#6366f1")}
              <span>
                <b className="font-medium">{SIM.shiver[lang]}:</b> {(shiver > 0 ? SIM.shiverOn : SIM.off)[lang]}
              </span>
            </li>
            <li className="flex items-center gap-2">
              {bar(pili ? 1 : 0, "#64748b")}
              <span>
                <b className="font-medium">{SIM.pili[lang]}:</b> {(pili ? SIM.piliOn : SIM.off)[lang]}
              </span>
            </li>
          </ul>
          {mode !== "ok" && <p className="text-sm text-slate-600">{(mode === "hot" ? SIM.behaviourHot : SIM.behaviourCold)[lang]}</p>}
          {mode === "cold" && <p className="text-sm text-slate-600">{SIM.hormones[lang]}</p>}
          {limit && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-900 ring-1 ring-rose-200">⚠️ {limit[lang]}</p>}
        </div>
      </div>
    </div>
  );
}

// ---------- negative vs positive feedback ----------

function FeedbackCurves({ lang }: { lang: BioLang }) {
  return (
    <svg viewBox="0 0 320 120" className="mb-4 w-full max-w-[520px]" role="img" aria-label={lang === "pl" ? "Przebieg sprzężenia ujemnego i dodatniego" : "Ход отрицательной и положительной обратной связи"}>
      {[0, 165].map((x0, k) => (
        <g key={x0}>
          <rect x={x0} y={0} width={155} height={120} rx={10} fill={k ? "#fff7ed" : "#ecfdf5"} />
          <path d={`M${x0 + 10} 64 L ${x0 + 148} 64`} stroke="#94a3b8" strokeDasharray="4 3" />
          <text x={x0 + 78} y={16} textAnchor="middle" fontSize={11} fontWeight={700} fill={k ? "#9a3412" : "#065f46"}>
            {k ? (lang === "pl" ? "dodatnie" : "положительная") : lang === "pl" ? "ujemne" : "отрицательная"}
          </text>
          <text x={x0 + 146} y={60} textAnchor="end" fontSize={8} fill="#64748b">
            {lang === "pl" ? "norma" : "норма"}
          </text>
        </g>
      ))}
      <path d="M12 64 C 24 64, 28 30, 42 30 C 58 30, 60 84, 76 84 C 90 84, 92 52, 106 52 C 118 52, 120 70, 132 70 L 148 64" stroke="#059669" strokeWidth={2.5} fill="none" />
      <path d="M177 64 C 200 64, 220 62, 236 54 C 256 44, 270 30, 290 14" stroke="#ea580c" strokeWidth={2.5} fill="none" />
      <path d="M290 14 L 300 108" stroke="#ea580c" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={296} y={104} textAnchor="end" fontSize={8} fill="#9a3412">
        {lang === "pl" ? "koniec procesu" : "конец процесса"}
      </text>
    </svg>
  );
}

const FEEDBACK: SortItem[] = [
  { name: r("wzrost temperatury ciała → rozszerzenie naczyń skóry i pocenie się", "повышение температуры тела → расширение сосудов кожи и потоотделение"), group: 0, why: r("Oddawanie ciepła obniża temperaturę z powrotem do normy.", "Теплоотдача возвращает температуру к норме.") },
  { name: r("wzrost stężenia glukozy we krwi → wydzielanie insuliny", "повышение глюкозы в крови → выделение инсулина"), group: 0, why: r("Insulina obniża stężenie glukozy — odchylenie zostaje wygaszone.", "Инсулин снижает уровень глюкозы — отклонение гасится.") },
  { name: r("spadek stężenia glukozy we krwi → wydzielanie glukagonu", "понижение глюкозы в крови → выделение глюкагона"), group: 0, why: r("Glukagon uruchamia rozkład glikogenu w wątrobie i glukoza wraca do normy.", "Глюкагон запускает распад гликогена в печени, и глюкоза возвращается к норме.") },
  { name: r("niedobór wody → wydzielanie ADH i pragnienie", "недостаток воды → выделение АДГ и жажда"), group: 0, why: r("Nerki oszczędzają wodę, a my ją pijemy — stężenie osocza wraca do normy.", "Почки экономят воду, а мы пьём — концентрация плазмы возвращается к норме.") },
  { name: r("wzrost stężenia CO₂ we krwi → szybszy i głębszy oddech", "повышение CO₂ в крови → учащение и углубление дыхания"), group: 0, why: r("Więcej CO₂ zostaje wydychane, więc jego stężenie spada.", "Больше CO₂ выдыхается, поэтому его концентрация падает.") },
  { name: r("spadek ciśnienia tętniczego → przyspieszenie pracy serca", "падение артериального давления → учащение работы сердца"), group: 0, why: r("Serce tłoczy więcej krwi, a naczynia się zwężają — ciśnienie rośnie.", "Сердце перекачивает больше крови, сосуды сужаются — давление растёт.") },
  { name: r("rozciąganie szyjki macicy przy porodzie → oksytocyna → silniejsze skurcze macicy", "растяжение шейки матки при родах → окситоцин → более сильные сокращения матки"), group: 1, why: r("Skurcze jeszcze bardziej rozciągają szyjkę, a to zwiększa wydzielanie oksytocyny — aż do narodzin dziecka.", "Сокращения ещё сильнее растягивают шейку, а это усиливает выделение окситоцина — до рождения ребёнка.") },
  { name: r("aktywowane płytki krwi przyciągają kolejne płytki", "активированные тромбоциты привлекают новые тромбоциты"), group: 1, why: r("Proces nasila się, aż powstanie czop zamykający uszkodzone naczynie.", "Процесс усиливается, пока не образуется пробка, закрывающая повреждённый сосуд.") },
  { name: r("rosnące stężenie estrogenów → nagły wyrzut LH przed owulacją", "растущий уровень эстрогенов → резкий выброс ЛГ перед овуляцией"), group: 1, why: r("Wysokie stężenie estrogenów pobudza wydzielanie LH, a ono kończy się owulacją.", "Высокий уровень эстрогенов стимулирует выделение ЛГ, и всё завершается овуляцией.") },
];

// ---------- controlled parameters ----------

const PL = {
  norm: r("Wartość prawidłowa", "Норма"),
  sensor: r("Kto kontroluje", "Кто контролирует"),
  up: r("Gdy rośnie", "Если растёт"),
  down: r("Gdy spada", "Если падает"),
};

const PARAMS: CompareCard[] = [
  {
    id: "temp",
    icon: "🌡️",
    name: r("Temperatura", "Температура"),
    rows: [
      { label: PL.norm, value: r("ok. 36,6 °C (36–37 °C)", "около 36,6 °C (36–37 °C)") },
      { label: PL.sensor, value: r("termoreceptory skóry i podwzgórza; ośrodek termoregulacji w podwzgórzu", "терморецепторы кожи и гипоталамуса; центр терморегуляции в гипоталамусе") },
      { label: PL.up, value: r("rozszerzenie naczyń skóry, pocenie się", "расширение сосудов кожи, потоотделение") },
      { label: PL.down, value: r("zwężenie naczyń skóry, drżenie mięśni, więcej tyroksyny", "сужение сосудов кожи, мышечная дрожь, больше тироксина") },
    ],
  },
  {
    id: "glucose",
    icon: "🍬",
    name: r("Glukoza we krwi", "Глюкоза в крови"),
    rows: [
      { label: PL.norm, value: r("70–99 mg/dl na czczo", "70–99 мг/дл натощак") },
      { label: PL.sensor, value: r("komórki wysp trzustkowych", "клетки островков поджелудочной железы") },
      { label: PL.up, value: r("insulina: komórki pobierają glukozę, wątroba i mięśnie magazynują ją jako glikogen", "инсулин: клетки поглощают глюкозу, печень и мышцы запасают её в виде гликогена") },
      { label: PL.down, value: r("glukagon: rozkład glikogenu w wątrobie i uwalnianie glukozy do krwi", "глюкагон: распад гликогена в печени и выход глюкозы в кровь") },
    ],
  },
  {
    id: "ph",
    icon: "⚗️",
    name: r("pH krwi", "pH крови"),
    rows: [
      { label: PL.norm, value: r("7,35–7,45", "7,35–7,45") },
      { label: PL.sensor, value: r("chemoreceptory wrażliwe na CO₂ i H⁺; układy buforowe krwi, płuca i nerki", "хеморецепторы, чувствительные к CO₂ и H⁺; буферные системы крови, лёгкие и почки") },
      { label: PL.up, value: r("płytszy oddech zatrzymuje CO₂; nerki wydalają więcej wodorowęglanów", "более поверхностное дыхание задерживает CO₂; почки выводят больше гидрокарбонатов") },
      { label: PL.down, value: r("szybszy, głębszy oddech usuwa CO₂; nerki wydzielają jony H⁺ do moczu", "частое глубокое дыхание удаляет CO₂; почки выделяют ионы H⁺ в мочу") },
    ],
  },
  {
    id: "osmo",
    icon: "💧",
    name: r("Ciśnienie osmotyczne", "Осмотическое давление"),
    rows: [
      { label: PL.norm, value: r("stałe stężenie soli w osoczu — takie jak w 0,9% roztworze NaCl", "постоянная концентрация солей в плазме — как в 0,9% растворе NaCl") },
      { label: PL.sensor, value: r("osmoreceptory podwzgórza", "осморецепторы гипоталамуса") },
      { label: PL.up, value: r("więcej wazopresyny (ADH) — mniej, bardziej stężonego moczu; pragnienie", "больше вазопрессина (АДГ) — меньше более концентрированной мочи; жажда") },
      { label: PL.down, value: r("mniej wazopresyny — dużo rozcieńczonego moczu", "меньше вазопрессина — много разбавленной мочи") },
    ],
    text: r("Utrzymywanie stałego stężenia soli i ilości wody w płynach ustrojowych to osmoregulacja.", "Поддержание постоянной концентрации солей и количества воды в жидкостях тела — это осморегуляция."),
  },
];

// ---------- when homeostasis fails ----------

const PARAM_OPTIONS: QuizOption[] = [
  { id: "temp", label: r("temperatura ciała", "температура тела") },
  { id: "glucose", label: r("stężenie glukozy", "уровень глюкозы") },
  { id: "water", label: r("gospodarka wodna", "водный баланс") },
  { id: "ph", label: r("pH krwi", "pH крови") },
];

const FAILURES: QuizItem[] = [
  { icon: "🤒", name: r("gorączka przy grypie", "лихорадка при гриппе"), answer: "temp", explain: r("Ośrodek termoregulacji w podwzgórzu zostaje przestawiony na wyższą temperaturę w odpowiedzi na infekcję — dlatego na początku czujemy dreszcze.", "Центр терморегуляции в гипоталамусе перенастраивается на более высокую температуру в ответ на инфекцию — поэтому вначале нас знобит.") },
  { icon: "🥶", name: r("hipotermia po kąpieli w przerębli", "гипотермия после купания в проруби"), answer: "temp", explain: r("Temperatura wewnętrzna spada poniżej 35 °C, bo utrata ciepła przewyższa jego wytwarzanie.", "Внутренняя температура падает ниже 35 °C, потому что теплопотери превышают теплообразование.") },
  { icon: "🩸", name: r("cukrzyca typu 1", "сахарный диабет 1 типа"), answer: "glucose", explain: r("Trzustka nie wydziela insuliny, glukoza nie przechodzi do komórek i jej stężenie we krwi rośnie.", "Поджелудочная железа не выделяет инсулин, глюкоза не попадает в клетки, и её уровень в крови растёт.") },
  { icon: "😵", name: r("osłabienie i drżenie rąk po długim wysiłku bez jedzenia", "слабость и дрожь в руках после долгой нагрузки без еды"), answer: "glucose", explain: r("To hipoglikemia — za mało glukozy we krwi. Glukagon i adrenalina próbują podnieść jej stężenie.", "Это гипогликемия — слишком мало глюкозы в крови. Глюкагон и адреналин пытаются поднять её уровень.") },
  { icon: "🏜️", name: r("odwodnienie po biegunce w upale", "обезвоживание после диареи в жару"), answer: "water", explain: r("Utrata wody przewyższa jej pobieranie, stężenie osocza rośnie — wzrasta wydzielanie ADH i pojawia się pragnienie.", "Потеря воды превышает поступление, концентрация плазмы растёт — усиливается выделение АДГ и появляется жажда.") },
  { icon: "🌊", name: r("picie wody morskiej przez rozbitka", "питьё морской воды потерпевшим кораблекрушение"), answer: "water", explain: r("Sól podnosi stężenie osocza; żeby ją wydalić, nerki muszą usunąć więcej wody, niż wypito — organizm się odwadnia.", "Соль повышает концентрацию плазмы; чтобы её вывести, почки должны удалить больше воды, чем выпито, — организм обезвоживается.") },
  { icon: "😮‍💨", name: r("zawroty głowy przy hiperwentylacji ze stresu", "головокружение при гипервентиляции от стресса"), answer: "ph", explain: r("Zbyt szybki oddech usuwa za dużo CO₂ — krew staje się zbyt zasadowa (zasadowica).", "Слишком частое дыхание удаляет слишком много CO₂ — кровь становится слишком щелочной (алкалоз).") },
  { icon: "🫘", name: r("kwasica przy niewydolności nerek", "ацидоз при почечной недостаточности"), answer: "ph", explain: r("Nerki nie usuwają jonów H⁺ — pH krwi spada poniżej 7,35.", "Почки не выводят ионы H⁺ — pH крови падает ниже 7,35.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Pętla regulacyjna: receptor → ośrodek integrujący → efektor → reakcja wygaszająca odchylenie.", "Регуляторная петля: рецептор → интегрирующий центр → эффектор → ответ, гасящий отклонение."),
    r("Ośrodek termoregulacji leży w podwzgórzu. Przegrzanie: rozszerzenie naczyń skóry i pot; wychłodzenie: zwężenie naczyń i drżenie mięśni.", "Центр терморегуляции находится в гипоталамусе. Перегрев: расширение сосудов кожи и пот; охлаждение: сужение сосудов и мышечная дрожь."),
  ],
  s2: [
    r("Ujemne sprzężenie zwrotne wygasza odchylenie i utrzymuje homeostazę; dodatnie wzmacnia je aż do zakończenia procesu (np. poród).", "Отрицательная обратная связь гасит отклонение и поддерживает гомеостаз; положительная усиливает его до завершения процесса (например, роды)."),
  ],
  s3: [
    r("Norma: temperatura ok. 36,6 °C, pH krwi 7,35–7,45, glukoza na czczo 70–99 mg/dl.", "Норма: температура около 36,6 °C, pH крови 7,35–7,45, глюкоза натощак 70–99 мг/дл."),
    r("Pracę efektorów koordynują układ nerwowy i hormonalny.", "Работу эффекторов согласуют нервная и эндокринная системы."),
  ],
  s4: [r("Choroba często oznacza, że pętla regulacyjna nie nadąża albo nie działa — np. brak insuliny w cukrzycy typu 1.", "Болезнь часто означает, что регуляторная петля не справляется или не работает, — например, нет инсулина при диабете 1 типа.")],
};

export default function HomeostasisLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="homeo" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="homeo-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <Thermoregulation lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="homeo-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <FeedbackCurves lang={lang} />
        <TwoWaySort
          lang={lang}
          title={r("Jakie to sprzężenie zwrotne?", "Какая это обратная связь?")}
          groups={[r("ujemne", "отрицательная"), r("dodatnie", "положительная")]}
          items={FEEDBACK}
        />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="homeo-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={PARAMS} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="homeo-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s4}
          question={r("Który parametr jest zaburzony w tej sytuacji:", "Какой показатель нарушен в этой ситуации:")}
          options={PARAM_OPTIONS}
          items={FAILURES}
          wrongHint={r("Pomyśl, co dokładnie odbiega od normy w tej sytuacji.", "Подумай, что именно отклоняется от нормы в этой ситуации.")}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
