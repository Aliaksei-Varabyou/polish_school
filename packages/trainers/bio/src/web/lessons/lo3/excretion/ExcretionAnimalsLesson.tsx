// Lesson for LO3 §7.1 "Osmoregulacja i wydalanie u zwierząt" (zakres rozszerzony). Terms follow
// templates/data/comparative.ts (ANIMAL_EXCRETION).
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, type CompareCard, type QuizItem, type QuizOption } from "../../games.tsx";
import { Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Przy rozkładzie białek i kwasów nukleinowych powstaje amoniak — silna trucizna. Każde zwierzę musi się go pozbyć, a przy okazji utrzymać właściwą ilość wody i soli w ciele (osmoregulacja). To, w jakiej postaci usuwa azot i jak gospodaruje wodą, zależy przede wszystkim od środowiska, w którym żyje.",
    "При распаде белков и нуклеиновых кислот образуется аммиак — сильный яд. Каждое животное должно от него избавляться и при этом поддерживать нужное количество воды и солей в теле (осморегуляция). В каком виде оно выводит азот и как расходует воду, зависит прежде всего от среды, в которой оно живёт.",
  ),
  s1: r("Amoniak, mocznik, kwas moczowy", "Аммиак, мочевина, мочевая кислота"),
  s1intro: r("Trzy postacie azotowych produktów przemiany materii — porównaj ich właściwości.", "Три формы азотистых продуктов обмена — сравни их свойства."),
  s2: r("Kto co wydala?", "Кто что выделяет?"),
  s2intro: r("Pomyśl, ile wody ma do dyspozycji to zwierzę i jak rozwija się jego zarodek.", "Подумай, сколько воды есть у этого животного и как развивается его зародыш."),
  s3: r("Osmoregulacja ryb", "Осморегуляция рыб"),
  s3intro: r(
    "Wybierz środowisko i zobacz, dokąd płynie woda i sole. Niebieskie strzałki to woda, pomarańczowe — sole.",
    "Выбери среду и посмотри, куда движутся вода и соли. Синие стрелки — вода, оранжевые — соли.",
  ),
  s4: r("Narządy wydalnicze zwierząt", "Органы выделения животных"),
  s4intro: r("Od pojedynczej wodniczki do nerki z milionem nefronów.", "От одной вакуоли до почки с миллионом нефронов."),
} satisfies Record<string, Txt>;

// ---------- nitrogen compounds ----------

/** a beaker showing how much water is needed to flush out the same amount of nitrogen */
function Beaker({ level, formula, note }: { level: number; formula: string; note: string }) {
  return (
    <svg viewBox="0 0 200 150" className="w-full" role="img" aria-label={`${formula}: ${note}`}>
      <defs>
        <clipPath id={`exa-beaker-${formula.length}`}>
          <path d="M60 20 L 140 20 L 134 130 L 66 130 Z" />
        </clipPath>
      </defs>
      <path d="M60 20 L 140 20 L 134 130 L 66 130 Z" fill="#f8fafc" />
      <rect x={0} y={130 - 110 * level} width={200} height={150} fill="#7dd3fc" clipPath={`url(#exa-beaker-${formula.length})`} />
      <path d="M60 20 L 140 20 L 134 130 L 66 130 Z" fill="none" stroke="#64748b" strokeWidth={2.5} />
      <text x={100} y={146} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0f172a">
        {formula}
      </text>
      <text x={150} y={130 - 110 * level + 4} fontSize={11} fill="#0369a1">
        💧
      </text>
      <text x={100} y={14} textAnchor="middle" fontSize={10} fill="#475569">
        {note}
      </text>
    </svg>
  );
}

const NL = {
  toxic: r("Toksyczność", "Токсичность"),
  solub: r("Rozpuszczalność w wodzie", "Растворимость в воде"),
  water: r("Woda do wydalenia", "Вода для выведения"),
  energy: r("Koszt wytworzenia", "Затраты на образование"),
  who: r("Kto wydala", "Кто выделяет"),
};

const waterNote = (lang: BioLang) => (lang === "pl" ? "woda na 1 g azotu" : "вода на 1 г азота");

const nitrogenCards = (lang: BioLang): CompareCard[] => [
  {
    id: "ammonia",
    icon: "🐟",
    name: r("Amoniak", "Аммиак"),
    art: <Beaker level={0.95} formula="NH₃" note={waterNote(lang)} />,
    rows: [
      { label: NL.toxic, value: r("bardzo duża", "очень высокая") },
      { label: NL.solub, value: r("bardzo dobra", "очень хорошая") },
      { label: NL.water, value: r("bardzo dużo — musi być od razu rozcieńczany", "очень много — его нужно сразу разбавлять") },
      { label: NL.energy, value: r("najmniejszy — powstaje wprost przy rozkładzie aminokwasów", "наименьшие — образуется прямо при распаде аминокислот") },
      { label: NL.who, value: r("ryby kostnoszkieletowe, kijanki, większość bezkręgowców wodnych", "костные рыбы, головастики, большинство водных беспозвоночных") },
    ],
    text: r("U ryb amoniak dyfunduje głównie przez skrzela prosto do otaczającej wody.", "У рыб аммиак диффундирует в основном через жабры прямо в окружающую воду."),
  },
  {
    id: "urea",
    icon: "🧍",
    name: r("Mocznik", "Мочевина"),
    art: <Beaker level={0.4} formula="CO(NH₂)₂" note={waterNote(lang)} />,
    rows: [
      { label: NL.toxic, value: r("znacznie mniejsza niż amoniaku", "намного ниже, чем у аммиака") },
      { label: NL.solub, value: r("dobra", "хорошая") },
      { label: NL.water, value: r("umiarkowana ilość", "умеренное количество") },
      { label: NL.energy, value: r("większy — powstaje z amoniaku i CO₂ w wątrobie, w cyklu mocznikowym (zużywa ATP)", "больше — образуется из аммиака и CO₂ в печени, в орнитиновом цикле (тратит АТФ)") },
      { label: NL.who, value: r("ssaki, dorosłe płazy, ryby chrzęstnoszkieletowe", "млекопитающие, взрослые земноводные, хрящевые рыбы") },
    ],
    text: r("Mocznik można bezpiecznie przechowywać przez pewien czas w płynach ciała i wydalać z moczem.", "Мочевину можно какое-то время безопасно хранить в жидкостях тела и выводить с мочой."),
  },
  {
    id: "uric",
    icon: "🐦",
    name: r("Kwas moczowy", "Мочевая кислота"),
    art: <Beaker level={0.08} formula="C₅H₄N₄O₃" note={waterNote(lang)} />,
    rows: [
      { label: NL.toxic, value: r("mała", "низкая") },
      { label: NL.solub, value: r("słaba — wytrąca się jako biała pasta lub kryształki", "плохая — выпадает в виде белой пасты или кристаллов") },
      { label: NL.water, value: r("prawie wcale", "почти не нужна") },
      { label: NL.energy, value: r("największy", "наибольшие") },
      { label: NL.who, value: r("ptaki, większość gadów, owady, ślimaki lądowe", "птицы, большинство пресмыкающихся, насекомые, наземные улитки") },
    ],
    text: r(
      "Oszczędza wodę i nie szkodzi zarodkowi zamkniętemu w jaju ze skorupką — kwas moczowy gromadzi się w nim jako nierozpuszczalny osad. Ptakom pozwala też nie nosić ciężkiego pęcherza z moczem.",
      "Экономит воду и не вредит зародышу, закрытому в яйце со скорлупой: мочевая кислота копится там в виде нерастворимого осадка. Птицам это ещё и позволяет не носить тяжёлый мочевой пузырь.",
    ),
  },
];

// ---------- who excretes what ----------

const N_OPTIONS: QuizOption[] = [
  { id: "ammonia", label: r("amoniak", "аммиак") },
  { id: "urea", label: r("mocznik", "мочевина") },
  { id: "uric", label: r("kwas moczowy", "мочевая кислота") },
];

const N_ITEMS: QuizItem[] = [
  { icon: "🐟", name: r("karp", "карп"), answer: "ammonia", explain: r("Ryba kostnoszkieletowa ma wokół siebie dużo wody, która od razu rozcieńcza amoniak wydalany przez skrzela.", "У костной рыбы вокруг много воды, которая сразу разбавляет аммиак, выводимый через жабры.") },
  { icon: "🐸", name: r("kijanka żaby", "головастик лягушки"), answer: "ammonia", explain: r("Kijanka żyje w wodzie i oddycha skrzelami — wydala amoniak jak ryba.", "Головастик живёт в воде и дышит жабрами — выделяет аммиак, как рыба.") },
  { icon: "🐸", name: r("dorosła żaba", "взрослая лягушка"), answer: "urea", explain: r("Podczas przeobrażenia wątroba zaczyna wytwarzać mocznik — na lądzie nie ma wody do rozcieńczania amoniaku.", "Во время превращения печень начинает образовывать мочевину: на суше нет воды, чтобы разбавлять аммиак.") },
  { icon: "🧍", name: r("człowiek", "человек"), answer: "urea", explain: r("Ssaki wydalają mocznik, który powstaje w wątrobie.", "Млекопитающие выводят мочевину, которая образуется в печени.") },
  { icon: "🦈", name: r("rekin", "акула"), answer: "urea", explain: r("Ryby chrzęstnoszkieletowe zatrzymują mocznik we krwi — dzięki temu ich płyny ciała są prawie tak stężone jak woda morska.", "Хрящевые рыбы удерживают мочевину в крови — благодаря этому жидкости их тела почти так же концентрированы, как морская вода.") },
  { icon: "🕊️", name: r("gołąb", "голубь"), answer: "uric", explain: r("Ptaki wydalają kwas moczowy jako białą pastę — razem z kałem przez kloakę.", "Птицы выводят мочевую кислоту в виде белой пасты — вместе с калом через клоаку.") },
  { icon: "🦎", name: r("jaszczurka zwinka", "прыткая ящерица"), answer: "uric", explain: r("Gad lądowy oszczędza wodę, a jego zarodek rozwija się w jaju na lądzie.", "Наземная рептилия экономит воду, а её зародыш развивается в яйце на суше.") },
  { icon: "🐝", name: r("pszczoła", "пчела"), answer: "uric", explain: r("Owady wydalają kwas moczowy przez cewki Malpighiego i jelito.", "Насекомые выводят мочевую кислоту через мальпигиевы сосуды и кишечник.") },
  { icon: "🪸", name: r("stułbia", "гидра"), answer: "ammonia", explain: r("Słodkowodny parzydełkowiec — amoniak dyfunduje przez całą powierzchnię ciała do wody.", "Пресноводное кишечнополостное — аммиак диффундирует через всю поверхность тела в воду.") },
  { icon: "🐌", name: r("ślimak winniczek", "виноградная улитка"), answer: "uric", explain: r("Ślimak lądowy, by nie tracić wody, wydala słabo rozpuszczalny kwas moczowy.", "Наземная улитка, чтобы не терять воду, выводит плохо растворимую мочевую кислоту.") },
];

// ---------- fish osmoregulation ----------

type Water = "fresh" | "sea" | "shark";

interface FishMode {
  name: Txt;
  /** concentration of the water around and of the body fluids, % of sea water */
  env: number;
  salts: number;
  urea: number;
  waterIn: boolean;
  drinks: boolean;
  activeIn: boolean;
  urine: number;
  rows: { label: Txt; value: Txt }[];
  text: Txt;
}

const FL = {
  water: r("Woda", "Вода"),
  salts: r("Sole", "Соли"),
  drink: r("Picie", "Питьё"),
  urine: r("Mocz", "Моча"),
};

const FISH: Record<Water, FishMode> = {
  fresh: {
    name: r("Ryba słodkowodna", "Пресноводная рыба"),
    env: 1,
    salts: 30,
    urea: 0,
    waterIn: true,
    drinks: false,
    activeIn: true,
    urine: 1,
    rows: [
      { label: FL.water, value: r("stale napływa do ciała przez skrzela i skórę (osmoza)", "постоянно поступает в тело через жабры и кожу (осмос)") },
      { label: FL.salts, value: r("uciekają do wody; skrzela aktywnie je pobierają (ATP)", "уходят в воду; жабры активно их поглощают (АТФ)") },
      { label: FL.drink, value: r("nie pije", "не пьёт") },
      { label: FL.urine, value: r("bardzo dużo, silnie rozcieńczonego", "очень много, сильно разбавленной") },
    ],
    text: r("Płyny ciała są bardziej stężone niż woda słodka (hipertoniczne), więc ryba „nasiąka” wodą i musi ją ciągle usuwać.", "Жидкости тела концентрированнее пресной воды (гипертоничны), поэтому рыба «набухает» водой и должна постоянно её выводить."),
  },
  sea: {
    name: r("Ryba morska", "Морская рыба"),
    env: 100,
    salts: 38,
    urea: 0,
    waterIn: false,
    drinks: true,
    activeIn: false,
    urine: 0.25,
    rows: [
      { label: FL.water, value: r("ucieka z ciała do morza przez skrzela i skórę (osmoza)", "уходит из тела в море через жабры и кожу (осмос)") },
      { label: FL.salts, value: r("napływają z wodą i pokarmem; skrzela aktywnie je wydalają (ATP)", "поступают с водой и пищей; жабры активно их выводят (АТФ)") },
      { label: FL.drink, value: r("pije dużo wody morskiej", "пьёт много морской воды") },
      { label: FL.urine, value: r("bardzo mało", "очень мало") },
    ],
    text: r("Płyny ciała są mniej stężone niż woda morska (hipotoniczne), więc ryba odwadnia się jak na pustyni — pije i usuwa nadmiar soli.", "Жидкости тела менее концентрированы, чем морская вода (гипотоничны), поэтому рыба обезвоживается, как в пустыне, — пьёт и выводит избыток соли."),
  },
  shark: {
    name: r("Rekin", "Акула"),
    env: 100,
    salts: 40,
    urea: 64,
    waterIn: true,
    drinks: false,
    activeIn: false,
    urine: 0.6,
    rows: [
      { label: FL.water, value: r("napływa powoli — płyny ciała są nieco bardziej stężone niż morze", "поступает медленно — жидкости тела чуть концентрированнее моря") },
      { label: FL.salts, value: r("nadmiar usuwa gruczoł odbytniczy", "избыток выводит ректальная железа") },
      { label: FL.drink, value: r("nie pije", "не пьёт") },
      { label: FL.urine, value: r("nerki zatrzymują mocznik, usuwają nadmiar wody", "почки удерживают мочевину, выводят лишнюю воду") },
    ],
    text: r("Ryby chrzęstnoszkieletowe zatrzymują we krwi mocznik, który podnosi jej stężenie — dzięki temu nie tracą wody jak ryby kostnoszkieletowe.", "Хрящевые рыбы удерживают в крови мочевину, которая повышает её концентрацию, — поэтому они не теряют воду, как костные рыбы."),
  },
};

const BLUE = "#2563eb";
const ORANGE = "#ea580c";

function Arrow({ d, color, dashed, marker }: { d: string; color: string; dashed?: boolean; marker: string }) {
  return <path d={d} stroke={color} strokeWidth={3} fill="none" strokeDasharray={dashed ? "5 4" : undefined} markerEnd={`url(#${marker})`} strokeLinecap="round" />;
}

/** a vertical arrow at x between y1 (start) and y2 (end) */
const v = (x: number, y1: number, y2: number) => `M${x} ${y1} L ${x} ${y2}`;

function FishOsmo({ lang }: { lang: BioLang }) {
  const [mode, setMode] = useState<Water>("fresh");
  const f = FISH[mode];
  const bg = mode === "fresh" ? "#e0f2fe" : "#bfdbfe";
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(FISH) as Water[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={mode === k}
            onClick={() => setMode(k)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              mode === k ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {k === "shark" ? "🦈" : "🐟"} {FISH[k].name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 360 220" className="w-full" role="img" aria-label={f.name[lang]}>
            <defs>
              {[
                ["exa-ab", BLUE],
                ["exa-ao", ORANGE],
              ].map(([id, c]) => (
                <marker key={id} id={id} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
                  <path d="M0 0 L 10 5 L 0 10 Z" fill={c} />
                </marker>
              ))}
            </defs>
            <rect width={360} height={220} rx={14} fill={bg} />
            {mode !== "fresh" &&
              Array.from({ length: 26 }, (_, k) => <circle key={k} cx={(k * 53) % 350 + 6} cy={(k * 37) % 210 + 6} r={1.6} fill="#94a3b8" />)}
            {/* fish */}
            <path
              d={
                mode === "shark"
                  ? "M40 112 C 70 70, 200 64, 280 104 L 336 58 L 318 110 L 330 156 L 280 118 C 210 150, 80 150, 40 112 Z M168 70 L 190 36 L 212 72 Z"
                  : "M60 110 C 90 60, 220 60, 280 105 L 330 70 L 320 110 L 330 150 L 280 115 C 220 160, 90 160, 60 110 Z"
              }
              fill={mode === "shark" ? "#94a3b8" : "#fcd34d"}
              stroke="#475569"
              strokeWidth={2}
            />
            <circle cx={mode === "shark" ? 66 : 84} cy={102} r={4} fill="#0f172a" />
            {mode === "shark" ? (
              <path d="M98 96 L 98 118 M106 96 L 106 120 M114 96 L 114 120" stroke="#475569" strokeWidth={2} />
            ) : (
              <path d="M112 84 Q 124 110 112 136" stroke="#b45309" strokeWidth={3} fill="none" />
            )}
            {/* water through skin and gills */}
            {(mode === "shark" ? [[146, 72], [240, 82]] : [[150, 64], [205, 66]]).map(([x, top]) => (
              <Arrow key={x} d={f.waterIn ? v(x!, 22, top!) : v(x!, top! + 2, 24)} color={BLUE} marker="exa-ab" />
            ))}
            <Arrow d={f.waterIn ? v(118, 22, 80) : v(118, 82, 24)} color={BLUE} marker="exa-ab" />
            {/* salts: passive and active at the gills */}
            {mode === "fresh" && (
              <>
                <Arrow d={v(132, 150, 196)} color={ORANGE} dashed marker="exa-ao" />
                <Arrow d={v(104, 198, 148)} color={ORANGE} marker="exa-ao" />
                <text x={70} y={194} fontSize={11} fontWeight={700} fill={ORANGE}>
                  {lang === "pl" ? "ATP" : "АТФ"}
                </text>
              </>
            )}
            {mode === "sea" && (
              <>
                <Arrow d={v(132, 198, 150)} color={ORANGE} dashed marker="exa-ao" />
                <Arrow d={v(104, 148, 198)} color={ORANGE} marker="exa-ao" />
                <text x={70} y={194} fontSize={11} fontWeight={700} fill={ORANGE}>
                  {lang === "pl" ? "ATP" : "АТФ"}
                </text>
              </>
            )}
            {mode === "shark" && (
              <>
                <Arrow d={v(132, 198, 150)} color={ORANGE} dashed marker="exa-ao" />
                <Arrow d={v(262, 128, 186)} color={ORANGE} marker="exa-ao" />
                <text x={270} y={186} fontSize={11} fontWeight={700} fill={ORANGE}>
                  {lang === "pl" ? "ATP" : "АТФ"}
                </text>
              </>
            )}
            {/* drinking */}
            {f.drinks && <Arrow d="M6 110 L 54 110" color={BLUE} marker="exa-ab" />}
            {/* urine */}
            <g transform={`translate(222 ${mode === "shark" ? 136 : 142})`}>
              <path d="M0 0 L 0 14" stroke="#ca8a04" strokeWidth={2} />
              <path
                d={`M0 16 C ${-24 * f.urine - 4} ${26 + 50 * f.urine}, ${24 * f.urine + 4} ${26 + 50 * f.urine}, 0 16 Z`}
                fill="#fde047"
                stroke="#ca8a04"
                strokeWidth={1.5}
                style={{ transition: "d .4s" }}
              />
            </g>
          </svg>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            <li>
              <span className="font-bold text-blue-600">→</span> {lang === "pl" ? "woda (osmoza)" : "вода (осмос)"}
            </li>
            <li>
              <span className="font-bold text-orange-600">⇢</span> {lang === "pl" ? "sole (dyfuzja)" : "соли (диффузия)"}
            </li>
            <li>
              <span className="font-bold text-orange-600">→</span> {lang === "pl" ? "sole (transport aktywny)" : "соли (активный транспорт)"}
            </li>
            <li>
              <span className="text-yellow-600">💧</span> {lang === "pl" ? "mocz" : "моча"}
            </li>
          </ul>
        </div>
        <div className="space-y-3" aria-live="polite">
          <div className="space-y-1.5 text-sm">
            <ConcBar label={lang === "pl" ? "Woda wokół" : "Вода вокруг"} parts={[[f.env, "#0284c7"]]} />
            <ConcBar
              label={lang === "pl" ? "Płyny ciała" : "Жидкости тела"}
              parts={[
                [f.salts, "#f59e0b"],
                [f.urea, "#a855f7"],
              ]}
            />
            <p className="text-xs text-slate-500">
              {lang === "pl" ? "Stężenie substancji rozpuszczonych" : "Концентрация растворённых веществ"}
              {mode === "shark" && <span className="text-violet-700"> · {lang === "pl" ? "fioletowe — mocznik" : "фиолетовое — мочевина"}</span>}
            </p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {f.rows.map((row) => (
                <tr key={row.label.pl} className="border-b border-slate-200 last:border-0">
                  <th scope="row" className="w-20 py-1.5 pr-3 text-left align-top font-medium text-slate-500">
                    {row.label[lang]}
                  </th>
                  <td className="py-1.5 text-slate-800">{row.value[lang]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="rounded-xl bg-sky-50 px-4 py-3 text-[15px] leading-relaxed text-sky-950 ring-1 ring-sky-200">{f.text[lang]}</p>
        </div>
      </div>
    </div>
  );
}

function ConcBar({ label, parts }: { label: string; parts: [number, string][] }) {
  return (
    <p className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-slate-600">{label}</span>
      <span className="flex h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
        {parts.map(([w, c], k) => (
          <span key={k} className="block h-full transition-all duration-500" style={{ width: `${(w / 105) * 100}%`, background: c }} />
        ))}
      </span>
    </p>
  );
}

// ---------- excretory organs ----------

const OL = {
  who: r("Kto ma", "У кого"),
  build: r("Budowa", "Строение"),
  from: r("Skąd zbiera zbędne substancje", "Откуда собирает ненужное"),
  role: r("Główna rola", "Главная роль"),
};

function OrganArt({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

const organCards = (lang: BioLang): CompareCard[] => [
  {
    id: "vacuole",
    icon: "🦠",
    name: r("Wodniczka tętniąca", "Сократительная вакуоль"),
    art: (
      <OrganArt label={lang === "pl" ? "wodniczka tętniąca" : "сократительная вакуоль"}>
        <ellipse cx={100} cy={70} rx={86} ry={50} fill="#ecfccb" stroke="#65a30d" strokeWidth={2} />
        {Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return <path key={k} d={`M${100 + 12 * Math.cos(a)} ${70 + 12 * Math.sin(a)} L ${100 + 40 * Math.cos(a)} ${70 + 28 * Math.sin(a)}`} stroke="#38bdf8" strokeWidth={4} strokeLinecap="round" />;
        })}
        <circle cx={100} cy={70} r={13} fill="#7dd3fc" stroke="#0284c7" strokeWidth={1.5} />
        <path d="M100 57 L 100 24" stroke="#0284c7" strokeWidth={2} strokeDasharray="3 3" />
        <text x={108} y={30} fontSize={10} fill="#0369a1">
          H₂O
        </text>
      </OrganArt>
    ),
    rows: [
      { label: OL.who, value: r("pierwotniaki słodkowodne, np. pantofelek", "пресноводные простейшие, например инфузория-туфелька") },
      { label: OL.build, value: r("pęcherzyk z kanalikami doprowadzającymi w cytoplazmie", "пузырёк с приводящими канальцами в цитоплазме") },
      { label: OL.from, value: r("z cytoplazmy", "из цитоплазмы") },
      { label: OL.role, value: r("usuwanie nadmiaru wody, który wnika do komórki przez osmozę", "удаление избытка воды, проникающей в клетку путём осмоса") },
    ],
  },
  {
    id: "proto",
    icon: "🪱",
    name: r("Protonefrydia", "Протонефридии"),
    art: (
      <OrganArt label={lang === "pl" ? "protonefrydia" : "протонефридии"}>
        <path d="M20 70 C 60 70, 80 40, 110 40 L 180 40 M110 40 L 110 20 M60 70 L 60 108 M140 40 L 150 92" stroke="#0ea5e9" strokeWidth={4} fill="none" />
        {[
          [110, 18],
          [60, 112],
          [150, 96],
          [180, 40],
        ].map(([x, y], k) => (
          <g key={k}>
            <circle cx={x} cy={y} r={9} fill="#fde68a" stroke="#b45309" strokeWidth={1.5} />
            <path d={`M${x - 3} ${y - 3} q 3 6 0 9 M${x + 2} ${y - 3} q 3 6 0 9`} stroke="#b45309" strokeWidth={1.2} fill="none" />
          </g>
        ))}
        <circle cx={18} cy={70} r={4} fill="#0369a1" />
        <text x={14} y={92} fontSize={10} fill="#0369a1">
          {lang === "pl" ? "por" : "пора"}
        </text>
      </OrganArt>
    ),
    rows: [
      { label: OL.who, value: r("płazińce, np. wypławek", "плоские черви, например планария") },
      { label: OL.build, value: r("rozgałęzione kanaliki zakończone komórkami płomykowymi z pękiem rzęsek", "ветвящиеся канальцы, оканчивающиеся пламенными клетками с пучком ресничек") },
      { label: OL.from, value: r("z płynu między komórkami ciała", "из жидкости между клетками тела") },
      { label: OL.role, value: r("głównie usuwanie nadmiaru wody; amoniak dyfunduje też przez powierzchnię ciała", "в основном удаление лишней воды; аммиак диффундирует и через поверхность тела") },
    ],
    text: r("Ruch rzęsek przypomina migotanie płomienia — stąd nazwa komórek.", "Движение ресничек напоминает мерцание пламени — отсюда название клеток."),
  },
  {
    id: "meta",
    icon: "🐛",
    name: r("Metanefrydia", "Метанефридии"),
    art: (
      <OrganArt label={lang === "pl" ? "metanefrydia" : "метанефридии"}>
        <rect x={8} y={20} width={184} height={100} rx={20} fill="#fce7f3" stroke="#db2777" strokeWidth={2} />
        <path d="M100 22 L 100 118" stroke="#db2777" strokeWidth={3} />
        <path d="M70 56 L 92 46 L 92 66 Z" fill="#a855f7" />
        <path d="M92 56 L 108 56 C 120 56, 120 70, 132 70 C 146 70, 146 52, 158 56 C 170 60, 166 84, 150 86 C 136 88, 140 110, 150 118" stroke="#a855f7" strokeWidth={4} fill="none" />
        <circle cx={150} cy={120} r={4} fill="#6b21a8" />
        <path d="M120 96 C 130 80, 146 96, 160 74" stroke="#dc2626" strokeWidth={2} fill="none" />
        <text x={30} y={40} fontSize={10} fill="#9d174d">
          {lang === "pl" ? "segment" : "сегмент"}
        </text>
      </OrganArt>
    ),
    rows: [
      { label: OL.who, value: r("pierścienice, np. dżdżownica (para w każdym segmencie)", "кольчатые черви, например дождевой червь (пара в каждом сегменте)") },
      { label: OL.build, value: r("orzęsiony lejek otwarty do jamy ciała, kręty kanalik oplątany naczyniami krwionośnymi, ujście na zewnątrz w następnym segmencie", "реснитчатая воронка, открытая в полость тела, извитой каналец, оплетённый кровеносными сосудами, выход наружу в следующем сегменте") },
      { label: OL.from, value: r("z płynu jamy ciała", "из жидкости полости тела") },
      { label: OL.role, value: r("wydalanie amoniaku i mocznika oraz nadmiaru wody; w kanaliku cenne substancje wracają do krwi", "выведение аммиака, мочевины и лишней воды; в канальце ценные вещества возвращаются в кровь") },
    ],
  },
  {
    id: "malpighi",
    icon: "🐝",
    name: r("Cewki Malpighiego", "Мальпигиевы сосуды"),
    art: (
      <OrganArt label={lang === "pl" ? "cewki Malpighiego" : "мальпигиевы сосуды"}>
        <rect x={6} y={6} width={188} height={128} rx={14} fill="#fef9c3" />
        <path d="M10 70 L 190 70" stroke="#a16207" strokeWidth={14} strokeLinecap="round" />
        {[
          "M108 64 C 96 30, 70 40, 60 18",
          "M112 64 C 120 30, 150 36, 160 14",
          "M108 76 C 96 110, 70 104, 56 124",
          "M112 76 C 124 112, 150 104, 168 124",
        ].map((d) => (
          <path key={d} d={d} stroke="#16a34a" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        ))}
        <text x={14} y={96} fontSize={10} fill="#713f12">
          {lang === "pl" ? "jelito" : "кишка"}
        </text>
        <text x={120} y={58} fontSize={9} fill="#0369a1">
          H₂O ↩
        </text>
      </OrganArt>
    ),
    rows: [
      { label: OL.who, value: r("owady i pajęczaki", "насекомые и паукообразные") },
      { label: OL.build, value: r("ślepo zakończone kanaliki zanurzone w hemolimfie, uchodzące do jelita", "слепо замкнутые канальцы, погружённые в гемолимфу и впадающие в кишку") },
      { label: OL.from, value: r("z hemolimfy", "из гемолимфы") },
      { label: OL.role, value: r("usuwanie kwasu moczowego; w jelicie tylnym woda wraca do organizmu, a kwas moczowy wydalany jest z kałem", "удаление мочевой кислоты; в задней кишке вода возвращается в организм, а мочевая кислота выводится с калом") },
    ],
  },
  {
    id: "kidney",
    icon: "🫘",
    name: r("Nerki", "Почки"),
    art: (
      <OrganArt label={lang === "pl" ? "nerka" : "почка"}>
        <path d="M100 18 C 150 10, 176 50, 166 84 C 158 116, 120 130, 96 116 C 86 110, 92 92, 84 84 C 74 76, 60 80, 58 66 C 54 34, 76 20, 100 18 Z" fill="#fca5a5" stroke="#b91c1c" strokeWidth={2} />
        <path d="M100 30 C 140 28, 158 58, 150 84 C 144 104, 118 112, 104 104" fill="none" stroke="#fde68a" strokeWidth={8} opacity={0.8} />
        <path d="M84 84 C 70 100, 60 112, 52 136" stroke="#ca8a04" strokeWidth={5} fill="none" />
        <path d="M60 60 L 30 52" stroke="#dc2626" strokeWidth={4} />
        <path d="M62 72 L 30 76" stroke="#2563eb" strokeWidth={4} />
      </OrganArt>
    ),
    rows: [
      { label: OL.who, value: r("kręgowce", "позвоночные") },
      { label: OL.build, value: r("parzyste narządy z tysiącami do milionów nefronów", "парные органы с тысячами — миллионами нефронов") },
      { label: OL.from, value: r("z krwi — przesącz powstaje w kłębuszkach pod ciśnieniem krwi", "из крови — фильтрат образуется в клубочках под давлением крови") },
      { label: OL.role, value: r("wydalanie i osmoregulacja; ssaki (i częściowo ptaki) dzięki pętli nefronu wytwarzają mocz bardziej stężony niż krew", "выделение и осморегуляция; млекопитающие (и отчасти птицы) благодаря петле нефрона образуют мочу концентрированнее крови") },
    ],
    text: r("Ptaki i gady morskie mają dodatkowo gruczoły solne przy oczach lub nozdrzach, które usuwają nadmiar soli.", "У морских птиц и пресмыкающихся есть ещё солевые железы у глаз или ноздрей, которые выводят избыток соли."),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Amoniak — najbardziej toksyczny, wymaga najwięcej wody; kwas moczowy — najmniej toksyczny, prawie bez wody.", ru: "Аммиак — самый токсичный, требует больше всего воды; мочевая кислота — наименее токсична, почти без воды." },
    { pl: "Im mniej wody w środowisku, tym „droższy”, ale oszczędniejszy w wodę produkt wydalania.", ru: "Чем меньше воды в среде, тем «дороже», но экономнее по воде продукт выделения." },
  ],
  s2: [
    { pl: "Zwierzęta wodne — amoniak; ssaki i płazy — mocznik; ptaki, gady, owady — kwas moczowy.", ru: "Водные животные — аммиак; млекопитающие и земноводные — мочевина; птицы, пресмыкающиеся, насекомые — мочевая кислота." },
  ],
  s3: [
    { pl: "Ryba słodkowodna nie pije, wydala dużo rozcieńczonego moczu i aktywnie pobiera sole skrzelami.", ru: "Пресноводная рыба не пьёт, выделяет много разбавленной мочи и активно поглощает соли жабрами." },
    { pl: "Ryba morska pije wodę, wydala mało moczu i aktywnie usuwa sole skrzelami.", ru: "Морская рыба пьёт воду, выделяет мало мочи и активно выводит соли жабрами." },
  ],
  s4: [
    { pl: "Protonefrydia — płazińce; metanefrydia — pierścienice; cewki Malpighiego — owady; nerki — kręgowce.", ru: "Протонефридии — плоские черви; метанефридии — кольчатые черви; мальпигиевы сосуды — насекомые; почки — позвоночные." },
  ],
};

export default function ExcretionAnimalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="exa" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="exa-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={nitrogenCards(lang)} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="exa-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s2}
          question={r("Jaki związek azotowy wydala głównie", "Какое азотистое вещество в основном выделяет")}
          options={N_OPTIONS}
          items={N_ITEMS}
          wrongHint={r("Zastanów się, czy to zwierzę ma pod dostatkiem wody.", "Подумай, хватает ли этому животному воды.")}
        />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="exa-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <FishOsmo lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="exa-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={organCards(lang)} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
