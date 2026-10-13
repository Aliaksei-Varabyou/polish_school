// Lesson for LO3 §9.1 "Narządy zmysłów u zwierząt" (zakres rozszerzony). Terms follow
// templates/data/comparative.ts (ANIMAL_SENSES).
import { useEffect, useMemo, useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { MatchQuiz, SpeciesGallery, type QuizItem, type QuizOption, type Species } from "../../games.tsx";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Każde zwierzę odbiera z otoczenia te bodźce, które pomagają mu przeżyć. Pszczoła widzi nadfiolet, grzechotnik wyczuwa ciepło ofiary, a nietoperz „słyszy” kształt przeszkód. Wszystkie te zmysły opierają się jednak na kilku rodzajach receptorów.",
    "Каждое животное воспринимает из окружающей среды те раздражители, которые помогают ему выжить. Пчела видит ультрафиолет, гремучая змея чувствует тепло добычи, а летучая мышь «слышит» форму препятствий. Но все эти чувства опираются на несколько типов рецепторов.",
  ),
  s1: r("Rodzaje receptorów", "Типы рецепторов"),
  s1intro: r(
    "Receptory dzielimy według rodzaju bodźca, który je pobudza. Dopasuj narząd zmysłu zwierzęcia do rodzaju jego receptorów.",
    "Рецепторы делят по типу раздражителя, который их возбуждает. Подбери к органу чувств животного тип его рецепторов.",
  ),
  s2: r("Niezwykłe zmysły zwierząt", "Необычные органы чувств животных"),
  s3: r("Oko złożone a oko z soczewką", "Фасеточный глаз и камерный глаз"),
  s3intro: r(
    "Ta sama łąka widziana okiem owada i okiem kręgowca. Zmieniaj liczbę omatidiów i porównaj obrazy.",
    "Один и тот же луг глазами насекомого и позвоночного. Меняй число омматидиев и сравни изображения.",
  ),
  s4: r("Echolokacja", "Эхолокация"),
  s4intro: r(
    "Wyślij impuls dźwiękowy i zmierz, po jakim czasie wróci echo. Z tego czasu zwierzę „oblicza” odległość ofiary.",
    "Отправь звуковой импульс и измерь, через какое время вернётся эхо. По этому времени животное «вычисляет» расстояние до добычи.",
  ),
} satisfies Record<string, Txt>;

// ---------- receptor types ----------

const RECEPTORS: QuizOption[] = [
  { id: "mech", label: r("mechanoreceptory", "механорецепторы") },
  { id: "chem", label: r("chemoreceptory", "хеморецепторы") },
  { id: "photo", label: r("fotoreceptory", "фоторецепторы") },
  { id: "thermo", label: r("termoreceptory", "терморецепторы") },
  { id: "electro", label: r("elektroreceptory", "электрорецепторы") },
];

const RECEPTOR_ITEMS: QuizItem[] = [
  {
    icon: "🐟",
    name: r("linia boczna ryby", "боковая линия рыбы"),
    answer: "mech",
    explain: r("Komórki zmysłowe z rzęskami w kanale linii bocznej wychylają się pod wpływem ruchów wody i drgań.", "Волосковые клетки в канале боковой линии отклоняются под действием движения воды и колебаний."),
  },
  {
    icon: "🐝",
    name: r("oczy złożone pszczoły", "фасеточные глаза пчелы"),
    answer: "photo",
    explain: r("Każde omatidium ma własne komórki światłoczułe; pszczoła widzi też nadfiolet.", "В каждом омматидии есть свои светочувствительные клетки; пчела видит и ультрафиолет."),
  },
  {
    icon: "🐍",
    name: r("narząd Jacobsona węża", "якобсонов орган змеи"),
    answer: "chem",
    explain: r("Rozwidlony język zbiera cząsteczki z powietrza i przenosi je do narządu w podniebieniu.", "Раздвоенный язык собирает молекулы из воздуха и переносит их к органу в нёбе."),
  },
  {
    icon: "🌡️",
    name: r("dołki policzkowe grzechotnika", "лицевые ямки гремучей змеи"),
    answer: "thermo",
    explain: r("Odbierają promieniowanie podczerwone ciepłego ciała ofiary — wąż poluje nawet w całkowitej ciemności.", "Улавливают инфракрасное излучение тёплого тела добычи — змея охотится даже в полной темноте."),
  },
  {
    icon: "🦈",
    name: r("ampułki Lorenziniego rekina", "ампулы Лоренцини акулы"),
    answer: "electro",
    explain: r("Wykrywają słabe pole elektryczne wytwarzane przez pracujące mięśnie ofiary, np. ryby ukrytej w piasku.", "Улавливают слабое электрическое поле, которое создают работающие мышцы добычи, например рыбы, спрятавшейся в песке."),
  },
  {
    icon: "🦋",
    name: r("czułki samca motyla", "усики самца бабочки"),
    answer: "chem",
    explain: r("Wyczuwają feromony samicy nawet z dużej odległości.", "Улавливают феромоны самки даже с большого расстояния."),
  },
  {
    icon: "🦞",
    name: r("statocysty raka", "статоцисты рака"),
    answer: "mech",
    explain: r("Ziarenka (statolity) naciskają na komórki zmysłowe z rzęskami — zwierzę wie, gdzie jest „dół”.", "Крупинки (статолиты) давят на волосковые клетки — животное знает, где «низ»."),
  },
  {
    icon: "🪱",
    name: r("przyoczka wypławka", "глазки планарии"),
    answer: "photo",
    explain: r("Odróżniają tylko jasność i kierunek światła — wypławek odwraca się od światła.", "Различают только яркость и направление света — планария уползает от света."),
  },
  {
    icon: "🦇",
    name: r("ucho nietoperza odbierające echo", "ухо летучей мыши, принимающее эхо"),
    answer: "mech",
    explain: r("Echo to fala dźwiękowa, a słuch opiera się na mechanoreceptorach — komórkach zmysłowych z rzęskami w ślimaku.", "Эхо — это звуковая волна, а слух основан на механорецепторах — волосковых клетках улитки."),
  },
];

// ---------- gallery ----------

const SENSES: Species[] = [
  {
    icon: "🐝",
    name: r("Oczy złożone", "Фасеточные глаза"),
    tag: r("owady, skorupiaki", "насекомые, ракообразные"),
    text: r(
      "Zbudowane z setek lub tysięcy omatidiów — każde ma własną soczewkę i komórki światłoczułe. Obraz jest mozaikowy, ale oko doskonale wykrywa ruch. Ważka ma w jednym oku nawet ok. 30 tys. omatidiów.",
      "Состоят из сотен или тысяч омматидиев — у каждого своя линза и светочувствительные клетки. Изображение мозаичное, но глаз отлично замечает движение. У стрекозы в одном глазу до 30 тыс. омматидиев.",
    ),
  },
  {
    icon: "🪱",
    name: r("Przyoczka", "Глазки"),
    tag: r("np. wypławek", "например, планария"),
    text: r(
      "Najprostsze narządy wzroku: komórki światłoczułe osłonięte barwnikiem. Nie tworzą obrazu — informują tylko, jak jest jasno i skąd pada światło.",
      "Простейшие органы зрения: светочувствительные клетки, прикрытые пигментом. Изображения не дают — сообщают только, насколько светло и откуда падает свет.",
    ),
  },
  {
    icon: "🐟",
    name: r("Linia boczna", "Боковая линия"),
    tag: r("ryby, larwy płazów", "рыбы, личинки земноводных"),
    text: r(
      "Kanał wzdłuż boku ciała, otwarty na zewnątrz porami. Komórki zmysłowe z rzęskami odbierają ruchy wody i drgania — dzięki temu ławica płynie zgodnie, a drapieżnik wyczuwa ofiarę w mętnej wodzie.",
      "Канал вдоль бока тела, открытый наружу порами. Волосковые клетки воспринимают движение воды и колебания — поэтому стая плывёт слаженно, а хищник чувствует добычу в мутной воде.",
    ),
  },
  {
    icon: "🐍",
    name: r("Narząd Jacobsona", "Якобсонов орган"),
    tag: r("węże, jaszczurki", "змеи, ящерицы"),
    text: r(
      "Narząd chemiczny w podniebieniu. Wąż wysuwa rozwidlony język, zbiera nim cząsteczki zapachowe z powietrza i wprowadza je do narządu Jacobsona — „wącha” językiem.",
      "Химический орган в нёбе. Змея высовывает раздвоенный язык, собирает им пахучие молекулы из воздуха и вводит их в якобсонов орган — «нюхает» языком.",
    ),
  },
  {
    icon: "🌡️",
    name: r("Dołki policzkowe", "Лицевые ямки"),
    tag: r("grzechotniki", "гремучие змеи"),
    text: r(
      "Jamki między okiem a nozdrzem z receptorami czułymi na promieniowanie podczerwone. Wąż wyczuwa ciepłe ciało ofiary nawet w całkowitej ciemności i trafnie ocenia jej położenie.",
      "Ямки между глазом и ноздрёй с рецепторами, чувствительными к инфракрасному излучению. Змея чувствует тёплое тело добычи даже в полной темноте и точно определяет, где она.",
    ),
  },
  {
    icon: "🦇",
    name: r("Echolokacja", "Эхолокация"),
    tag: r("nietoperze, delfiny", "летучие мыши, дельфины"),
    text: r(
      "Zwierzę wysyła ultradźwięki i odbiera ich echo. Z czasu powrotu echa ocenia odległość przeszkody lub ofiary, a ze zmian echa — jej wielkość i ruch.",
      "Животное испускает ультразвук и принимает эхо. По времени возвращения эха оно оценивает расстояние до препятствия или добычи, а по изменениям эха — её размер и движение.",
    ),
  },
  {
    icon: "🦞",
    name: r("Statocysty", "Статоцисты"),
    tag: r("meduzy, raki", "медузы, раки"),
    text: r(
      "Pęcherzyki z ziarenkami (statolitami), które pod wpływem siły ciężkości naciskają na komórki zmysłowe z rzęskami. To narząd równowagi — działa podobnie jak przedsionek w uchu człowieka.",
      "Пузырьки с крупинками (статолитами), которые под действием силы тяжести давят на волосковые клетки. Это орган равновесия — работает похоже на преддверие во внутреннем ухе человека.",
    ),
  },
  {
    icon: "🐈",
    name: r("Błona odblaskowa", "Тапетум"),
    tag: r("np. kot, pies", "например, кошка, собака"),
    text: r(
      "Warstwa za siatkówką odbijająca światło, które przeszło już przez fotoreceptory — trafia ono do nich drugi raz. Poprawia to widzenie w nocy; dlatego oczy kota świecą w świetle reflektorów.",
      "Слой за сетчаткой, отражающий свет, который уже прошёл через фоторецепторы, — свет попадает на них второй раз. Это улучшает ночное зрение; поэтому глаза кошки светятся в свете фар.",
    ),
  },
  {
    icon: "🦈",
    name: r("Ampułki Lorenziniego", "Ампулы Лоренцини"),
    tag: r("rekiny, płaszczki", "акулы, скаты"),
    text: r(
      "Kanaliki wypełnione galaretą, otwierające się porami na głowie. Ich elektroreceptory wykrywają słabe pole elektryczne mięśni ofiary, nawet zakopanej w piasku.",
      "Каналы, заполненные студенистым веществом и открывающиеся порами на голове. Их электрорецепторы улавливают слабое электрическое поле мышц добычи, даже зарывшейся в песок.",
    ),
  },
  {
    icon: "🦋",
    name: r("Czułki", "Усики"),
    tag: r("owady", "насекомые"),
    text: r(
      "Na czułkach leżą chemoreceptory i mechanoreceptory. Samiec motyla wyczuwa nimi feromony samicy nawet z dużej odległości.",
      "На усиках расположены хеморецепторы и механорецепторы. Самец бабочки улавливает ими феромоны самки даже с большого расстояния.",
    ),
  },
];

// ---------- compound eye vs camera eye ----------

const W = 200;
const H = 140;
const COL = { sky: "#bae6fd", grass: "#86efac", sun: "#fde047", cloud: "#ffffff", stem: "#15803d", petal: "#f472b6", core: "#f59e0b" };
const PETALS = [0, 1, 2, 3, 4].map((k) => {
  const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
  return [100 + 15 * Math.cos(a), 60 + 15 * Math.sin(a)] as const;
});
const CLOUD: readonly (readonly [number, number, number])[] = [
  [36, 30, 10],
  [50, 25, 13],
  [64, 31, 10],
];

/** the colour of the scene at a point — the sharp picture and the mosaic share it */
function sceneAt(x: number, y: number): string {
  if (Math.hypot(x - 100, y - 60) < 8) return COL.core;
  if (PETALS.some(([px, py]) => Math.hypot(x - px, y - py) < 10)) return COL.petal;
  if (Math.abs(x - 100) < 2.5 && y > 60) return COL.stem;
  if (Math.hypot((x - 113) / 12, (y - 104) / 5) < 1) return COL.stem;
  if (Math.hypot(x - 162, y - 28) < 15) return COL.sun;
  if (CLOUD.some(([cx, cy, cr]) => Math.hypot(x - cx, y - cy) < cr)) return COL.cloud;
  return y < 100 ? COL.sky : COL.grass;
}

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** one facet per ommatidium: the average colour of the scene inside it */
function mosaic(s: number) {
  const dx = Math.sqrt(3) * s;
  const dy = 1.5 * s;
  const cells: { x: number; y: number; fill: string }[] = [];
  for (let j = 0; j * dy < H + s; j++) {
    for (let i = 0; i * dx < W + dx; i++) {
      const x = i * dx + (j % 2 ? dx / 2 : 0);
      const y = j * dy;
      const samples = [[0, 0], ...[0, 1, 2, 3, 4, 5].map((k) => [0.55 * s * Math.cos((k * Math.PI) / 3), 0.55 * s * Math.sin((k * Math.PI) / 3)])];
      const sum = [0, 0, 0];
      for (const [ox, oy] of samples) {
        const c = rgb(sceneAt(x + ox!, y + oy!));
        for (let k = 0; k < 3; k++) sum[k]! += c[k]!;
      }
      const fill = `rgb(${sum.map((v) => Math.round(v / samples.length)).join(",")})`;
      cells.push({ x, y, fill });
    }
  }
  return cells;
}

const hexPoints = (x: number, y: number, s: number) =>
  [0, 1, 2, 3, 4, 5].map((k) => {
    const a = ((60 * k - 90) * Math.PI) / 180;
    return `${(x + s * Math.cos(a)).toFixed(1)},${(y + s * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

function SharpScene() {
  return (
    <g>
      <rect width={W} height={100} fill={COL.sky} />
      <rect y={100} width={W} height={H - 100} fill={COL.grass} />
      <circle cx={162} cy={28} r={15} fill={COL.sun} />
      {CLOUD.map(([cx, cy, cr]) => (
        <circle key={cx} cx={cx} cy={cy} r={cr} fill={COL.cloud} />
      ))}
      <rect x={97.5} y={60} width={5} height={H - 60} fill={COL.stem} />
      <ellipse cx={113} cy={104} rx={12} ry={5} fill={COL.stem} />
      {PETALS.map(([px, py]) => (
        <circle key={px} cx={px} cy={py} r={10} fill={COL.petal} />
      ))}
      <circle cx={100} cy={60} r={8} fill={COL.core} />
    </g>
  );
}

type EyeKind = "compound" | "camera";

function Toggle<K extends string>({ value, options, onChange }: { value: K; options: { id: K; label: string }[]; onChange: (k: K) => void }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
            value === o.id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function EyeCompare({ lang }: { lang: BioLang }) {
  const [kind, setKind] = useState<EyeKind>("compound");
  const [size, setSize] = useState(7);
  const cells = useMemo(() => mosaic(size), [size]);
  const inFrame = cells.filter((c) => c.x <= W && c.y <= H).length;
  const text =
    kind === "compound"
      ? r(
          "Każde omatidium widzi tylko mały wycinek pola widzenia i daje jeden „punkt” obrazu. Z tych punktów powstaje obraz mozaikowy — tym dokładniejszy, im więcej omatidiów. Za to ruch, który przeskakuje z omatidium na omatidium, owad wychwytuje błyskawicznie.",
          "Каждый омматидий видит лишь маленький участок поля зрения и даёт одну «точку» изображения. Из этих точек складывается мозаичное изображение — тем подробнее, чем больше омматидиев. Зато движение, перескакивающее с омматидия на омматидий, насекомое замечает мгновенно.",
        )
      : r(
          "Jedna soczewka skupia światło na siatkówce z milionami fotoreceptorów, dlatego obraz jest ostry i szczegółowy. Taki typ oka mają kręgowce, a także — niezależnie od nich — głowonogi, np. ośmiornica.",
          "Один хрусталик фокусирует свет на сетчатке с миллионами фоторецепторов, поэтому изображение чёткое и подробное. Такой тип глаза есть у позвоночных и — независимо от них — у головоногих, например у осьминога.",
        );
  return (
    <div>
      <Toggle<EyeKind>
        value={kind}
        onChange={setKind}
        options={[
          { id: "compound", label: lang === "pl" ? "🐝 Oko złożone (owad)" : "🐝 Фасеточный глаз (насекомое)" },
          { id: "camera", label: lang === "pl" ? "👁️ Oko z soczewką (kręgowiec)" : "👁️ Камерный глаз (позвоночное)" },
        ]}
      />
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full overflow-hidden rounded-xl ring-1 ring-slate-200"
            role="img"
            aria-label={kind === "compound" ? (lang === "pl" ? "obraz mozaikowy łąki z kwiatem" : "мозаичное изображение луга с цветком") : lang === "pl" ? "ostry obraz łąki z kwiatem" : "чёткое изображение луга с цветком"}
          >
            {kind === "camera" ? (
              <SharpScene />
            ) : (
              <g>
                {cells.map((c) => (
                  <polygon key={`${c.x}-${c.y}`} points={hexPoints(c.x, c.y, size * 0.98)} fill={c.fill} stroke="#475569" strokeWidth={size > 5 ? 0.5 : 0.25} />
                ))}
              </g>
            )}
          </svg>
          {kind === "compound" && (
            <label className="mt-3 block text-sm font-semibold text-slate-700">
              {lang === "pl" ? "Liczba omatidiów" : "Число омматидиев"}
              <input
                type="range"
                min={3}
                max={14}
                step={0.5}
                value={17 - size}
                onChange={(e) => setSize(17 - Number(e.target.value))}
                className="mt-2 h-2 w-full cursor-pointer accent-amber-500"
                aria-valuetext={`${inFrame}`}
              />
              <span className="mt-1 flex justify-between text-xs font-normal text-slate-500">
                <span>{lang === "pl" ? "mało" : "мало"}</span>
                <span>{lang === "pl" ? "dużo" : "много"}</span>
              </span>
            </label>
          )}
        </div>
        <div className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          {kind === "compound" && (
            <p className="font-semibold text-amber-800">
              {lang === "pl" ? `W tym kadrze: ok. ${inFrame} omatidiów` : `В этом кадре: около ${inFrame} омматидиев`}
            </p>
          )}
          <p>{text[lang]}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- echolocation ----------

type Medium = "air" | "water";
const SPEED: Record<Medium, number> = { air: 340, water: 1500 };
const MAX_D = 30;

function Echolocation({ lang }: { lang: BioLang }) {
  const [medium, setMedium] = useState<Medium>("air");
  const [d, setD] = useState(10);
  const [pulse, setPulse] = useState(0);
  const [p, setP] = useState(0);
  const v = SPEED[medium];
  const t = (2 * d) / v; // seconds
  const ms = t * 1000;

  useEffect(() => {
    if (!pulse) return;
    // the pulse is shown 12× slower than real, so a longer way visibly takes longer
    const total = Math.max(500, ms * 12);
    const t0 = performance.now();
    let id = 0;
    const tick = (now: number) => {
      const k = Math.min(2, ((now - t0) / total) * 2);
      setP(k);
      if (k < 2) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [pulse, ms]);

  const reset = () => {
    setPulse(0);
    setP(0);
  };
  const sx = 30;
  const tx = 60 + (d / MAX_D) * 245;
  const span = tx - sx;
  const arc = (cx: number, R: number, from: number, to: number) => {
    const a0 = (from * Math.PI) / 180;
    const a1 = (to * Math.PI) / 180;
    return `M${cx + R * Math.cos(a0)} ${65 + R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${65 + R * Math.sin(a1)}`;
  };
  const waves: { d: string; color: string; o: number }[] = [];
  if (pulse && p < 1) for (const k of [0, 1, 2]) {
    const R = p * span - k * 7;
    if (R > 2) waves.push({ d: arc(sx, R, -32, 32), color: "#4f46e5", o: 1 - k * 0.3 });
  }
  if (pulse && p >= 1 && p < 2) for (const k of [0, 1, 2]) {
    const R = (p - 1) * span - k * 7;
    if (R > 2) waves.push({ d: arc(tx, R, 148, 212), color: "#e11d48", o: (1 - k * 0.3) * 0.9 });
  }
  const back = pulse > 0 && p >= 2;
  const unit = lang === "pl" ? { m: "m", ms: "ms", v: "m/s" } : { m: "м", ms: "мс", v: "м/с" };

  return (
    <div>
      <Toggle<Medium>
        value={medium}
        onChange={(m) => {
          setMedium(m);
          reset();
        }}
        options={[
          { id: "air", label: lang === "pl" ? "🦇 Nietoperz w powietrzu" : "🦇 Летучая мышь в воздухе" },
          { id: "water", label: lang === "pl" ? "🐬 Delfin w wodzie" : "🐬 Дельфин в воде" },
        ]}
      />
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 320 120" className="w-full rounded-xl ring-1 ring-slate-200" role="img" aria-label={lang === "pl" ? `odległość ${num(d, 1)} m` : `расстояние ${num(d, 1)} м`}>
            <rect width={320} height={120} fill={medium === "air" ? "#eef2ff" : "#cffafe"} />
            {waves.map((w, k) => (
              <path key={k} d={w.d} fill="none" stroke={w.color} strokeWidth={2.5} strokeLinecap="round" opacity={w.o} />
            ))}
            <text x={sx} y={74} textAnchor="middle" fontSize={26}>
              {medium === "air" ? "🦇" : "🐬"}
            </text>
            <text x={tx} y={73} textAnchor="middle" fontSize={20}>
              {medium === "air" ? "🦋" : "🐟"}
            </text>
            <path d={`M${sx} 104 L ${tx} 104`} stroke="#64748b" strokeWidth={1.5} />
            <path d={`M${sx} 99 L ${sx} 109 M${tx} 99 L ${tx} 109`} stroke="#64748b" strokeWidth={1.5} />
            <text x={(sx + tx) / 2} y={98} textAnchor="middle" fontSize={11} fill="#334155">
              d = {num(d, 1)} {unit.m}
            </text>
          </svg>
          <label className="mt-3 block text-sm font-semibold text-slate-700">
            {lang === "pl" ? "Odległość ofiary" : "Расстояние до добычи"}: <span className="tabular-nums">{num(d, 1)} {unit.m}</span>
            <input
              type="range"
              min={1}
              max={MAX_D}
              step={0.5}
              value={d}
              onChange={(e) => {
                setD(Number(e.target.value));
                reset();
              }}
              className="mt-2 h-2 w-full cursor-pointer accent-indigo-600"
            />
          </label>
          <div className="mt-3">
            <Choice state="active" onClick={() => setPulse(pulse + 1)}>
              📣 {lang === "pl" ? "Wyślij impuls" : "Отправить импульс"}
            </Choice>
          </div>
        </div>
        <div className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          <p>
            {lang === "pl" ? "Prędkość dźwięku" : "Скорость звука"} {medium === "air" ? (lang === "pl" ? "w powietrzu" : "в воздухе") : lang === "pl" ? "w wodzie" : "в воде"}: ≈ {v} {unit.v}
          </p>
          <p className="font-mono text-sm">
            t = 2 · d / v = 2 · {num(d, 1)} / {v} ≈ <b>{num(ms, 1)} {unit.ms}</b>
          </p>
          <p className={back ? "font-semibold text-emerald-800" : "text-slate-500"}>
            {back
              ? lang === "pl"
                ? `Echo wróciło po ${num(ms, 1)} ms — dźwięk przebył drogę ${num(2 * d, 1)} m (tam i z powrotem).`
                : `Эхо вернулось через ${num(ms, 1)} мс — звук прошёл ${num(2 * d, 1)} м (туда и обратно).`
              : pulse && p > 0
                ? lang === "pl"
                  ? "Impuls w drodze… (pokazany 12 razy wolniej)"
                  : "Импульс в пути… (показан в 12 раз медленнее)"
                : lang === "pl"
                  ? "Naciśnij „Wyślij impuls”."
                  : "Нажми «Отправить импульс»."}
          </p>
          <p className="text-sm text-slate-500">
            {medium === "air"
              ? lang === "pl"
                ? "Zbliżając się do ofiary, nietoperz wysyła impulsy coraz częściej, by dokładnie śledzić jej ruch."
                : "Приближаясь к добыче, летучая мышь посылает импульсы всё чаще, чтобы точно следить за её движением."
              : lang === "pl"
                ? "W wodzie dźwięk biegnie ponad 4 razy szybciej niż w powietrzu, więc echo wraca szybciej."
                : "В воде звук распространяется более чем в 4 раза быстрее, чем в воздухе, поэтому эхо возвращается быстрее."}
          </p>
        </div>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r(
      "Mechanoreceptory — dotyk, słuch, równowaga, ruchy wody; chemoreceptory — smak i węch; fotoreceptory — światło; termoreceptory — temperatura.",
      "Механорецепторы — осязание, слух, равновесие, движение воды; хеморецепторы — вкус и обоняние; фоторецепторы — свет; терморецепторы — температура.",
    ),
    r("Receptor zamienia bodziec na impulsy nerwowe; wrażenie zmysłowe powstaje dopiero w mózgu.", "Рецептор превращает раздражитель в нервные импульсы; ощущение возникает только в мозге."),
  ],
  s2: [
    r(
      "Linia boczna ryb, statocysty i ucho wewnętrzne odbierają bodźce za pomocą komórek zmysłowych z rzęskami.",
      "Боковая линия рыб, статоцисты и внутреннее ухо воспринимают раздражители с помощью волосковых клеток.",
    ),
    r("Węże „wąchają” językiem i narządem Jacobsona, a grzechotniki wyczuwają ciepło ofiary dołkami policzkowymi.", "Змеи «нюхают» языком и якобсоновым органом, а гремучие змеи чувствуют тепло добычи лицевыми ямками."),
  ],
  s3: [
    r("Oko złożone składa się z wielu omatidiów i daje obraz mozaikowy, ale świetnie wykrywa ruch.", "Фасеточный глаз состоит из многих омматидиев и даёт мозаичное изображение, но отлично замечает движение."),
  ],
  s4: [
    r("Odległość = prędkość dźwięku × czas powrotu echa : 2, bo dźwięk przebywa drogę tam i z powrotem.", "Расстояние = скорость звука × время возвращения эха : 2, ведь звук проходит путь туда и обратно."),
    r("Nietoperze i delfiny używają ultradźwięków — dźwięków powyżej 20 kHz, niesłyszalnych dla człowieka.", "Летучие мыши и дельфины используют ультразвук — звуки выше 20 кГц, неслышимые для человека."),
  ],
};

export default function SensesAnimalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="sena" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="sena-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s1}
          question={r("Jakie receptory ma", "Какие рецепторы использует")}
          options={RECEPTORS}
          items={RECEPTOR_ITEMS}
          wrongHint={r("Zastanów się, jaki bodziec odbiera ten narząd: światło, ciepło, cząsteczki, ruch czy pole elektryczne?", "Подумай, какой раздражитель воспринимает этот орган: свет, тепло, молекулы, движение или электрическое поле?")}
        />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="sena-s2" n={2} title={T.s2[lang]}>
        <SpeciesGallery lang={lang} items={SENSES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="sena-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <EyeCompare lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="sena-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Echolocation lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
