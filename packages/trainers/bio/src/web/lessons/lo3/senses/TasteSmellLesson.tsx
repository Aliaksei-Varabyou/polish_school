// Lesson for LO3 §9.4 "Narządy smaku oraz węchu" (zakres rozszerzony). Terms follow
// templates/data/systemsMore.ts (CHEMICAL_SENSES) and systems.ts (SENSE_PARTS, kubki smakowe).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { MatchQuiz, type QuizItem, type QuizOption } from "../../games.tsx";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Smak i węch to zmysły chemiczne: ich receptory — chemoreceptory — pobudzają cząsteczki substancji. Smak odbieramy kubkami smakowymi na języku, zapach — nabłonkiem węchowym w nosie. To, co nazywamy „smakiem” potrawy, jest w dużej części jej zapachem.",
    "Вкус и обоняние — химические чувства: их рецепторы — хеморецепторы — возбуждаются молекулами веществ. Вкус мы воспринимаем вкусовыми почками языка, запах — обонятельным эпителием носа. То, что мы называем «вкусом» блюда, во многом его запах.",
  ),
  s1: r("Pięć smaków podstawowych", "Пять основных вкусов"),
  s1intro: r("Każdy smak niesie informację o pokarmie. Rozpoznaj, który smak dominuje.", "Каждый вкус несёт информацию о пище. Определи, какой вкус преобладает."),
  s2: r("Język: brodawki i kubki smakowe", "Язык: сосочки и вкусовые почки"),
  s2intro: r("Porównaj popularną „mapę języka” z tym, jak jest naprawdę.", "Сравни популярную «карту языка» с тем, как всё устроено на самом деле."),
  s3: r("Smak i węch działają razem", "Вкус и обоняние работают вместе"),
  s3intro: r("Wybierz przysmak i zatkaj nos — co zostanie z jego smaku?", "Выбери лакомство и зажми нос — что останется от его вкуса?"),
  s4: r("Adaptacja węchowa", "Обонятельная адаптация"),
  s4intro: r(
    "Wchodzisz do kuchni, w której parzy się kawa. Przesuwaj czas i obserwuj, jak zmienia się odczuwany zapach.",
    "Ты входишь на кухню, где варится кофе. Двигай время и смотри, как меняется ощущаемый запах.",
  ),
} satisfies Record<string, Txt>;

// ---------- five tastes ----------

const TASTES: QuizOption[] = [
  { id: "sweet", label: r("słodki", "сладкий") },
  { id: "salty", label: r("słony", "солёный") },
  { id: "sour", label: r("kwaśny", "кислый") },
  { id: "bitter", label: r("gorzki", "горький") },
  { id: "umami", label: r("umami", "умами") },
];

const FOODS: QuizItem[] = [
  { icon: "🍯", name: r("miód", "мёд"), answer: "sweet", explain: r("Smak słodki sygnalizuje cukry — źródło energii.", "Сладкий вкус сигнализирует о сахарах — источнике энергии.") },
  { icon: "🍋", name: r("sok z cytryny", "лимонный сок"), answer: "sour", explain: r("Smak kwaśny wywołują jony wodoru (H⁺); ostrzega przed niedojrzałym lub zepsutym pokarmem.", "Кислый вкус вызывают ионы водорода (H⁺); он предупреждает о незрелой или испорченной пище.") },
  { icon: "🧂", name: r("sól kuchenna", "поваренная соль"), answer: "salty", explain: r("Smak słony wywołują jony sodu (Na⁺) — pomaga utrzymać równowagę soli w organizmie.", "Солёный вкус вызывают ионы натрия (Na⁺) — он помогает поддерживать солевой баланс организма.") },
  { icon: "☕", name: r("kawa bez cukru", "кофе без сахара"), answer: "bitter", explain: r("Kofeina jest gorzka. Smak gorzki ostrzega przed substancjami potencjalnie trującymi — wiele trucizn roślinnych jest gorzkich.", "Кофеин горький. Горький вкус предупреждает о возможно ядовитых веществах — многие растительные яды горькие.") },
  { icon: "🍜", name: r("przyprawa z glutaminianem sodu", "приправа с глутаматом натрия"), answer: "umami", explain: r("Glutaminian wywołuje smak umami, który sygnalizuje pokarm bogaty w białko.", "Глутамат вызывает вкус умами, который сигнализирует о пище, богатой белком.") },
  { icon: "🍉", name: r("dojrzały arbuz", "спелый арбуз"), answer: "sweet", explain: r("Dojrzałe owoce są pełne cukrów — to dla nas sygnał „warto zjeść”.", "Спелые плоды полны сахаров — для нас это сигнал «стоит съесть».") },
  { icon: "🥛", name: r("skwaśniałe mleko", "прокисшее молоко"), answer: "sour", explain: r("Bakterie fermentacji mlekowej wytwarzają kwas mlekowy — kwaśny smak zdradza zmiany w pokarmie.", "Молочнокислые бактерии образуют молочную кислоту — кислый вкус выдаёт изменения в пище.") },
  { icon: "🥤", name: r("tonik z chininą", "тоник с хинином"), answer: "bitter", explain: r("Chinina to alkaloid z kory chinowca — bardzo gorzka nawet w małym stężeniu.", "Хинин — алкалоид из коры хинного дерева, очень горький даже в малой концентрации.") },
];

// ---------- tongue ----------

type Papilla = "filiform" | "fungiform" | "foliate" | "vallate";

const PAPILLAE: Record<Papilla, { name: Txt; text: Txt }> = {
  filiform: {
    name: r("brodawki nitkowate", "нитевидные сосочки"),
    text: r(
      "Najliczniejsze, pokrywają cały grzbiet języka. Nie mają kubków smakowych — odbierają dotyk i nadają językowi szorstkość.",
      "Самые многочисленные, покрывают всю спинку языка. Вкусовых почек не имеют — воспринимают прикосновение и делают язык шершавым.",
    ),
  },
  fungiform: {
    name: r("brodawki grzybowate", "грибовидные сосочки"),
    text: r(
      "Rozsiane między nitkowatymi, najwięcej na czubku i brzegach języka. Mają kubki smakowe.",
      "Рассеяны среди нитевидных, больше всего их на кончике и краях языка. Содержат вкусовые почки.",
    ),
  },
  foliate: {
    name: r("brodawki liściaste", "листовидные сосочки"),
    text: r("Fałdy na bocznych brzegach tylnej części języka; w ich ścianach leżą kubki smakowe.", "Складки на боковых краях задней части языка; в их стенках находятся вкусовые почки."),
  },
  vallate: {
    name: r("brodawki okolone", "желобоватые сосочки"),
    text: r(
      "Największe; ułożone w kształcie litery V przed nasadą języka, każdą otacza rowek. Mają najwięcej kubków smakowych.",
      "Самые крупные; расположены буквой V перед корнем языка, каждый окружён желобком. Содержат больше всего вкусовых почек.",
    ),
  },
};

const TONGUE = "M40 44 Q 120 22 200 44 C 214 124, 196 220, 152 266 Q 120 294 88 266 C 44 220, 26 124, 40 44 Z";
const VALLATE: [number, number][] = [
  [72, 64],
  [88, 74],
  [104, 84],
  [120, 92],
  [136, 84],
  [152, 74],
  [168, 64],
];
const FUNGIFORM: [number, number][] = [
  [120, 262],
  [104, 254],
  [136, 254],
  [92, 240],
  [148, 240],
  [112, 238],
  [128, 238],
  [80, 222],
  [160, 222],
  [70, 196],
  [170, 196],
  [100, 214],
  [140, 214],
  [62, 166],
  [178, 166],
  [84, 182],
  [156, 182],
  [58, 134],
  [182, 134],
  [120, 200],
];
// a fixed scatter of filiform papillae inside the tongue outline
const FILIFORM: [number, number][] = [];
for (let y = 104; y < 250; y += 11) {
  for (let x = 58; x < 184; x += 11) {
    const jx = x + (((x * 7 + y * 3) % 9) - 4);
    const jy = y + (((x * 5 + y * 11) % 7) - 3);
    const half = 70 - (y - 104) * 0.25 - (y > 200 ? (y - 200) * 0.6 : 0);
    if (Math.abs(jx - 120) < half && Math.abs(jx - 120) > 3) FILIFORM.push([jx, jy]);
  }
}

type TongueView = "myth" | "real";

const MYTH_ZONES: { d: string; fill: string; label: Txt; x: number; y: number }[] = [
  { d: "M60 210 Q 120 300 180 210 L 180 300 L 60 300 Z", fill: "#f9a8d4", label: r("słodki", "сладкий"), x: 120, y: 250 },
  { d: "M20 150 L 82 150 L 74 230 L 20 230 Z M220 150 L 158 150 L 166 230 L 220 230 Z", fill: "#93c5fd", label: r("słony", "солёный"), x: 66, y: 196 },
  { d: "M20 80 L 80 80 L 82 150 L 20 150 Z M220 80 L 160 80 L 158 150 L 220 150 Z", fill: "#fde047", label: r("kwaśny", "кислый"), x: 66, y: 120 },
  { d: "M20 20 L 220 20 L 220 80 L 20 80 Z", fill: "#86efac", label: r("gorzki", "горький"), x: 120, y: 58 },
];

function Tongue({ lang }: { lang: BioLang }) {
  const [view, setView] = useState<TongueView>("myth");
  const [papilla, setPapilla] = useState<Papilla | null>(null);
  const dim = (p: Papilla) => (papilla && papilla !== p ? 0.2 : 1);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup">
        {(["myth", "real"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={view === v}
            onClick={() => setView(v)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              view === v ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {v === "myth" ? (lang === "pl" ? "🗺️ „Mapa języka” (mit)" : "🗺️ «Карта языка» (миф)") : lang === "pl" ? "🔬 Jak jest naprawdę" : "🔬 Как на самом деле"}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 240 300" className="mx-auto w-full max-w-[300px]" role="img" aria-label={lang === "pl" ? "język widziany z góry" : "язык, вид сверху"}>
          <defs>
            <clipPath id="taste-tongue">
              <path d={TONGUE} />
            </clipPath>
          </defs>
          <path d={TONGUE} fill="#fda4af" stroke="#e11d48" strokeWidth={2} />
          {view === "myth" ? (
            <g clipPath="url(#taste-tongue)">
              {MYTH_ZONES.map((z) => (
                <path key={z.label.pl} d={z.d} fill={z.fill} opacity={0.85} />
              ))}
            </g>
          ) : null}
          {view === "myth" ? (
            <g>
              {MYTH_ZONES.map((z) => (
                <text key={`${z.label.pl}-t`} x={z.x} y={z.y} textAnchor="middle" fontSize={13} fontWeight={600} fill="#1e293b">
                  {z.label[lang]}
                </text>
              ))}
              <text x={120} y={150} textAnchor="middle" fontSize={64} fontWeight={800} fill="#dc2626" opacity={0.75}>
                ✗
              </text>
            </g>
          ) : (
            <g>
              <path d="M120 100 L 120 236" stroke="#e11d48" strokeWidth={1.5} opacity={0.5} />
              <g fill="#fecdd3" opacity={dim("filiform")}>
                {FILIFORM.map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} />
                ))}
              </g>
              <g fill="#e11d48" opacity={dim("fungiform")}>
                {FUNGIFORM.map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r={4} stroke="#fff1f2" strokeWidth={1} />
                ))}
              </g>
              <g stroke="#9f1239" strokeWidth={2} strokeLinecap="round" opacity={dim("foliate")}>
                {[100, 110, 120, 130].map((y) => (
                  <path key={y} d={`M38 ${y} l 10 4 M202 ${y} l -10 4`} />
                ))}
              </g>
              <g opacity={dim("vallate")}>
                {VALLATE.map(([x, y]) => (
                  <g key={x}>
                    <circle cx={x} cy={y} r={7.5} fill="none" stroke="#9f1239" strokeWidth={1.5} />
                    <circle cx={x} cy={y} r={4.5} fill="#be123c" />
                  </g>
                ))}
              </g>
              <text x={120} y={16} textAnchor="middle" fontSize={10} fill="#64748b">
                {lang === "pl" ? "nasada języka" : "корень языка"}
              </text>
            </g>
          )}
        </svg>
        <div className="space-y-3" aria-live="polite">
          {view === "myth" ? (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-[15px] leading-relaxed text-rose-950 ring-1 ring-rose-200">
              {lang === "pl"
                ? "Popularna „mapa języka” (słodki czubek, gorzka nasada) to mit — powstała z błędnego odczytania badań z początku XX wieku. Każdą część języka, na której są kubki smakowe, pobudzają wszystkie pięć smaków, a różnice w czułości są niewielkie."
                : "Популярная «карта языка» (сладкий кончик, горький корень) — миф, возникший из неверного прочтения исследований начала XX века. Любой участок языка со вкусовыми почками воспринимает все пять вкусов, а различия в чувствительности невелики."}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PAPILLAE) as Papilla[]).map((p) => (
                  <Choice key={p} state={papilla === p ? "active" : "idle"} onClick={() => setPapilla(papilla === p ? null : p)}>
                    {PAPILLAE[p].name[lang]}
                  </Choice>
                ))}
              </div>
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-[15px] leading-relaxed text-emerald-950 ring-1 ring-emerald-200">
                {papilla
                  ? PAPILLAE[papilla].text[lang]
                  : lang === "pl"
                    ? "Kubki smakowe leżą w brodawkach grzybowatych, liściastych i okolonych (a także na podniebieniu i w gardle). W każdym są komórki zmysłowe z mikrokosmkami wystającymi przez por smakowy. Wybierz rodzaj brodawek."
                    : "Вкусовые почки находятся в грибовидных, листовидных и желобоватых сосочках (а также на нёбе и в глотке). В каждой есть рецепторные клетки с микроворсинками, выступающими через вкусовую пору. Выбери вид сосочков."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- taste + smell ----------

type Food = "strawberry" | "lemon" | "coffee" | "broth";

const TREATS: Record<Food, { icon: string; name: Txt; full: Txt; pinched: Txt; taste: number; smell: number }> = {
  strawberry: {
    icon: "🍓",
    name: r("żelek truskawkowy", "клубничный мармелад"),
    full: r("Słodki, wyraźnie truskawkowy.", "Сладкий, отчётливо клубничный."),
    pinched: r("Słodki… i tyle. Nie da się poznać, że truskawkowy.", "Сладкий… и всё. Не понять, что клубничный."),
    taste: 55,
    smell: 90,
  },
  lemon: {
    icon: "🍋",
    name: r("żelek cytrynowy", "лимонный мармелад"),
    full: r("Słodko-kwaśny, o zapachu cytryny.", "Кисло-сладкий, с запахом лимона."),
    pinched: r("Słodko-kwaśny — może cytrynowy, a może jakiś inny.", "Кисло-сладкий — может, лимонный, а может, и другой."),
    taste: 65,
    smell: 85,
  },
  coffee: {
    icon: "☕",
    name: r("kawa", "кофе"),
    full: r("Gorzka, o bogatym aromacie kawy.", "Горький, с богатым кофейным ароматом."),
    pinched: r("Po prostu gorzki, ciepły napój — bez aromatu kawy.", "Просто горький тёплый напиток — без кофейного аромата."),
    taste: 50,
    smell: 95,
  },
  broth: {
    icon: "🍲",
    name: r("rosół", "куриный бульон"),
    full: r("Słony, „mięsny” (umami), pachnący warzywami i ziołami.", "Солёный, «мясной» (умами), с запахом овощей и зелени."),
    pinched: r("Słony i trochę umami — ale bez zapachu rosołu.", "Солёный и немного умами — но без запаха бульона."),
    taste: 60,
    smell: 85,
  },
};

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <p className="flex items-center gap-2 text-sm">
      <span className="w-40 shrink-0 text-slate-600">{label}</span>
      <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
        <span className={`block h-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </span>
    </p>
  );
}

function NosePinch({ lang }: { lang: BioLang }) {
  const [food, setFood] = useState<Food>("strawberry");
  const [pinched, setPinched] = useState(false);
  const f = TREATS[food];
  const smell = pinched ? 5 : f.smell;
  const whole = Math.round((f.taste * 0.35 + smell * 0.65) * (pinched ? 0.9 : 1));
  const aroma = pinched ? "#cbd5e1" : "#f59e0b";
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(TREATS) as Food[]).map((k) => (
          <Choice key={k} state={food === k ? "active" : "idle"} onClick={() => setFood(k)}>
            {TREATS[k].icon} {TREATS[k].name[lang]}
          </Choice>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 240 200" className="w-full" role="img" aria-label={lang === "pl" ? "przekrój głowy: droga cząsteczek zapachowych z jamy ustnej do nosa" : "разрез головы: путь пахучих молекул изо рта в нос"}>
            <path
              d="M86 10 C 150 4, 222 30, 222 96 C 222 140, 200 160, 180 172 L 176 196 L 128 196 L 128 168 C 112 168, 92 166, 78 160 L 70 140 C 60 138, 56 132, 62 126 L 58 118 C 48 112, 50 104, 58 100 L 30 84 C 26 78, 32 70, 40 64 C 52 36, 66 16, 86 10 Z"
              fill="#fde68a"
              stroke="#d97706"
              strokeWidth={2}
            />
            <path d="M48 74 C 70 58, 120 56, 152 70 L 152 92 C 120 96, 80 96, 52 86 Z" fill="#e0f2fe" stroke="#7dd3fc" />
            <path d="M92 60 C 110 54, 132 56, 146 64" stroke="#ca8a04" strokeWidth={5} fill="none" strokeLinecap="round" />
            <ellipse cx={122} cy={44} rx={16} ry={6} fill="#facc15" stroke="#a16207" />
            <path d="M118 50 L 116 58 M126 50 L 128 58" stroke="#a16207" strokeWidth={1.5} />
            <path d="M64 112 C 90 106, 130 106, 154 112 L 152 132 C 120 138, 90 136, 66 128 Z" fill="#fecdd3" stroke="#fb7185" />
            <path d="M80 126 C 100 116, 130 116, 150 122" stroke="#f43f5e" strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M152 70 L 166 70 L 170 196 L 152 196 L 152 134" fill="#fce7f3" stroke="#f9a8d4" />
            <text x={96} y={120} fontSize={14}>
              {f.icon}
            </text>
            <path
              d="M104 116 C 140 112, 160 110, 160 96 C 160 84, 150 76, 136 66"
              stroke={aroma}
              strokeWidth={2.5}
              strokeDasharray="5 4"
              fill="none"
              markerEnd={pinched ? undefined : "url(#taste-arrow)"}
            />
            <defs>
              <marker id="taste-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L 10 5 L 0 10 Z" fill="#f59e0b" />
              </marker>
            </defs>
            {pinched && (
              <g>
                <text x={20} y={92} fontSize={24}>
                  🤏
                </text>
                <text x={162} y={100} fontSize={18} fontWeight={800} fill="#dc2626">
                  ✗
                </text>
              </g>
            )}
            <text x={160} y={34} fontSize={9} fill="#713f12">
              <tspan x={160}>{lang === "pl" ? "opuszka" : "обонятельная"}</tspan>
              <tspan x={160} dy={10}>{lang === "pl" ? "węchowa" : "луковица"}</tspan>
            </text>
            <path d="M158 37 L 139 43" stroke="#a16207" strokeWidth={0.8} />
            <text x={100} y={82} fontSize={8} fill="#854d0e" textAnchor="middle">
              {lang === "pl" ? "nabłonek węchowy" : "обонятельный эпителий"}
            </text>
            <text x={70} y={150} fontSize={9} fill="#be123c">
              {lang === "pl" ? "język" : "язык"}
            </text>
          </svg>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={pinched} onChange={(e) => setPinched(e.target.checked)} className="h-4 w-4 accent-rose-600" />
            🤏 {lang === "pl" ? "Zatkaj nos" : "Зажать нос"}
          </label>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Bar label={lang === "pl" ? "Smak (kubki smakowe)" : "Вкус (вкусовые почки)"} value={f.taste} color="bg-rose-500" />
            <Bar label={lang === "pl" ? "Zapach (nabłonek węchowy)" : "Запах (обонятельный эпителий)"} value={smell} color="bg-amber-500" />
            <Bar label={lang === "pl" ? "Rozpoznanie przysmaku" : "Узнаваемость лакомства"} value={whole} color="bg-emerald-500" />
          </div>
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
            <b>{pinched ? (lang === "pl" ? "Z zatkanym nosem: " : "С зажатым носом: ") : lang === "pl" ? "Normalnie: " : "Обычно: "}</b>
            {(pinched ? f.pinched : f.full)[lang]}{" "}
            {pinched
              ? lang === "pl"
                ? "Powietrze nie przepływa przez nos, więc cząsteczki zapachowe nie docierają od tyłu do nabłonka węchowego."
                : "Воздух не проходит через нос, поэтому пахучие молекулы не попадают сзади к обонятельному эпителию."
              : lang === "pl"
                ? "Cząsteczki zapachowe z jamy ustnej docierają przez gardło od tyłu do jamy nosowej."
                : "Пахучие молекулы изо рта через глотку попадают сзади в носовую полость."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- olfactory adaptation ----------

const MAX_MIN = 10;
const felt = (t: number) => 15 + 85 * Math.exp(-t / 1.6);

function Adaptation({ lang }: { lang: BioLang }) {
  const [t, setT] = useState(0);
  const X = (m: number) => 34 + (m / MAX_MIN) * 270;
  const Y = (v: number) => 150 - v * 1.25;
  const curve: string[] = [];
  for (let m = 0; m <= MAX_MIN; m += 0.1) curve.push(`${X(m).toFixed(1)} ${Y(felt(m)).toFixed(1)}`);
  const now = felt(t);
  const unit = lang === "pl" ? "min" : "мин";
  const text =
    t < 0.5
      ? r("Zapach kawy jest bardzo wyraźny — receptory węchowe silnie reagują na nowy bodziec.", "Запах кофе очень сильный — обонятельные рецепторы сильно реагируют на новый раздражитель.")
      : t < 3
        ? r(
            "Cząsteczek zapachowych w powietrzu jest tyle samo, ale receptory i ośrodki węchowe reagują coraz słabiej — zapach słabnie.",
            "Пахучих молекул в воздухе столько же, но рецепторы и обонятельные центры реагируют всё слабее — запах слабеет.",
          )
        : r(
            "Po kilku minutach prawie nie czujesz kawy. Wystarczy jednak wyjść na chwilę na świeże powietrze, by po powrocie znów ją poczuć. Nowy zapach, np. cytryny, poczujesz od razu.",
            "Через несколько минут кофе почти не чувствуется. Но стоит ненадолго выйти на свежий воздух — и, вернувшись, снова его почувствуешь. Новый запах, например лимона, почувствуешь сразу.",
          );
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 320 180" className="w-full" role="img" aria-label={lang === "pl" ? `po ${num(t, 1)} min odczuwasz ${Math.round(now)}% zapachu` : `через ${num(t, 1)} мин ощущается ${Math.round(now)}% запаха`}>
          <path d={`M34 20 L 34 150 L 306 150`} stroke="#94a3b8" fill="none" />
          {[0, 2, 4, 6, 8, 10].map((m) => (
            <text key={m} x={X(m)} y={164} textAnchor="middle" fontSize={9} fill="#64748b">
              {m}
            </text>
          ))}
          <text x={306} y={176} textAnchor="end" fontSize={9} fill="#64748b">
            {lang === "pl" ? "czas, min" : "время, мин"}
          </text>
          {[0, 50, 100].map((v) => (
            <text key={v} x={30} y={Y(v) + 3} textAnchor="end" fontSize={9} fill="#64748b">
              {v}%
            </text>
          ))}
          <path d={`M${X(0)} ${Y(100)} L ${X(MAX_MIN)} ${Y(100)}`} stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 4" />
          <text x={X(MAX_MIN)} y={Y(100) - 5} textAnchor="end" fontSize={9} fill="#0369a1">
            {lang === "pl" ? "stężenie zapachu w powietrzu" : "концентрация запаха в воздухе"}
          </text>
          <polyline points={curve.join(" ")} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
          <text x={X(2.2)} y={Y(felt(2.2)) - 8} fontSize={9} fill="#b45309">
            {lang === "pl" ? "odczuwany zapach" : "ощущаемый запах"}
          </text>
          <path d={`M${X(t)} 20 L ${X(t)} 150`} stroke="#334155" strokeDasharray="2 3" />
          <circle cx={X(t)} cy={Y(now)} r={5} fill="#f59e0b" stroke="white" strokeWidth={2} />
        </svg>
        <label className="mt-2 block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Czas w kuchni" : "Время на кухне"}: <span className="tabular-nums">{num(t, 1)} {unit}</span>
          <input type="range" min={0} max={MAX_MIN} step={0.1} value={t} onChange={(e) => setT(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-amber-500" />
        </label>
      </div>
      <div className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
        <p className="text-2xl" aria-hidden>
          ☕ <span style={{ opacity: now / 100 }}>〰️〰️〰️</span>
        </p>
        <p>
          {lang === "pl" ? "Odczuwany zapach" : "Ощущаемый запах"}: <b className="tabular-nums">{Math.round(now)}%</b>
        </p>
        <p>{text[lang]}</p>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Pięć smaków podstawowych: słodki, słony, kwaśny, gorzki i umami.", "Пять основных вкусов: сладкий, солёный, кислый, горький и умами."),
    r("Substancja musi się rozpuścić w ślinie, by pobudzić receptory smaku.", "Чтобы возбудить вкусовые рецепторы, вещество должно раствориться в слюне."),
  ],
  s2: [
    r(
      "Kubki smakowe leżą w brodawkach grzybowatych, liściastych i okolonych; brodawki nitkowate nie mają kubków smakowych.",
      "Вкусовые почки находятся в грибовидных, листовидных и желобоватых сосочках; в нитевидных сосочках вкусовых почек нет.",
    ),
    r("Wszystkie smaki odbieramy na całym języku — „mapa języka” to mit.", "Все вкусы воспринимаются всем языком; «карта языка» — миф."),
  ],
  s3: [
    r(
      "Receptory węchu leżą w nabłonku węchowym w górnej części jamy nosowej; impulsy biegną przez opuszkę węchową do kory mózgu.",
      "Обонятельные рецепторы лежат в обонятельном эпителии верхней части носовой полости; импульсы идут через обонятельную луковицу в кору мозга.",
    ),
    r("Przy katarze lub zatkanym nosie odróżniamy tylko smaki podstawowe — potrawy wydają się „bez smaku”.", "При насморке или зажатом носе различаются только основные вкусы — еда кажется «безвкусной»."),
  ],
  s4: [
    r(
      "Adaptacja węchowa: przy długim działaniu tego samego zapachu przestajemy go czuć, choć jego stężenie się nie zmienia.",
      "Обонятельная адаптация: при длительном действии одного и того же запаха мы перестаём его чувствовать, хотя его концентрация не меняется.",
    ),
  ],
};

export default function TasteSmellLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="taste" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="taste-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s1}
          question={r("Jaki smak dominuje:", "Какой вкус преобладает:")}
          options={TASTES}
          items={FOODS}
          wrongHint={r("Pomyśl, jaka substancja odpowiada za ten smak: cukry, jony sodu, jony wodoru, alkaloidy czy glutaminian?", "Подумай, какое вещество отвечает за этот вкус: сахара, ионы натрия, ионы водорода, алкалоиды или глутамат?")}
        />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="taste-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Tongue lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="taste-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <NosePinch lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="taste-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Adaptation lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
