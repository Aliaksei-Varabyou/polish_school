// Lesson for LO3 §3.3 "Rodzaje połączeń kości" (Biologia na czasie 3, zakres rozszerzony). Terms
// follow templates/data/systemsMore.ts (JOINT_TYPES) and systems.ts (MOTION_PARTS: chrząstka
// stawowa, maź stawowa, więzadła).
import { useEffect, useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, PartMap, type CompareCard, type MapPart, type QuizItem, type QuizOption } from "../../games.tsx";
import { Choice, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Kości łączą się ze sobą na dwa sposoby: ściśle — tkanką łączną włóknistą, chrząstką albo kością — lub ruchomo, w stawach. Od budowy połączenia zależy, czy kości mogą się względem siebie poruszać i w ilu kierunkach.",
    "Кости соединяются двумя способами: непрерывно — волокнистой соединительной тканью, хрящом или костью — или подвижно, в суставах. От строения соединения зависит, могут ли кости двигаться относительно друг друга и в скольких направлениях.",
  ),
  s1: r("Połączenia ścisłe i ruchome", "Непрерывные и подвижные соединения"),
  s1intro: r("Porównaj cztery rodzaje połączeń kości — od zupełnie nieruchomych do stawów.", "Сравни четыре типа соединений костей — от совсем неподвижных до суставов."),
  s2: r("Budowa stawu", "Строение сустава"),
  s2intro: r("Schemat typowego stawu w przekroju. Dotknij jego części.", "Схема типичного сустава в разрезе. Нажми на его части."),
  s3: r("Rodzaje stawów i zakres ruchów", "Типы суставов и объём движений"),
  s3intro: r("Kształt powierzchni stawowych decyduje o tym, wokół ilu osi może poruszać się kość. Wybierz staw i obejrzyj ruch.", "Форма суставных поверхностей определяет, вокруг скольких осей может двигаться кость. Выбери сустав и посмотри на движение."),
  s4: r("Rozpoznaj staw", "Узнай сустав"),
} satisfies Record<string, Txt>;

const BONE = "#f5efe0";
const EDGE = "#a8a29e";

// ---------- kinds of connections ----------

const L = {
  tissue: r("Co łączy kości", "Чем соединены кости"),
  move: r("Ruchomość", "Подвижность"),
  example: r("Przykład", "Пример"),
};

function SutureArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
      <path d="M20 20 L 100 20 L 92 32 L 104 44 L 92 56 L 104 68 L 92 80 L 100 90 L 20 90 Z" fill={BONE} stroke={EDGE} strokeWidth={2} />
      <path d="M180 20 L 104 20 L 96 32 L 108 44 L 96 56 L 108 68 L 96 80 L 104 90 L 180 90 Z" fill={BONE} stroke={EDGE} strokeWidth={2} />
      <path d="M102 20 L 94 32 L 106 44 L 94 56 L 106 68 L 94 80 L 102 90" fill="none" stroke="#f472b6" strokeWidth={3} />
    </svg>
  );
}

function CartilageArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
      <rect x={60} y={10} width={80} height={32} rx={8} fill={BONE} stroke={EDGE} strokeWidth={2} />
      <rect x={64} y={44} width={72} height={20} rx={8} fill="#bae6fd" stroke="#0284c7" strokeWidth={2} />
      <rect x={60} y={66} width={80} height={32} rx={8} fill={BONE} stroke={EDGE} strokeWidth={2} />
    </svg>
  );
}

function BonyArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
      <path d="M50 12 L 150 12 L 128 98 L 72 98 Z" fill={BONE} stroke={EDGE} strokeWidth={2} />
      {[30, 48, 66, 84].map((y) => (
        <path key={y} d={`M${58 + (y - 12) * 0.25} ${y} L ${142 - (y - 12) * 0.25} ${y}`} stroke="#d6c7a1" strokeWidth={2} strokeDasharray="3 4" />
      ))}
    </svg>
  );
}

function JointArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
      <rect x={86} y={4} width={28} height={40} fill={BONE} stroke={EDGE} strokeWidth={2} />
      <circle cx={100} cy={52} r={20} fill={BONE} stroke={EDGE} strokeWidth={2} />
      <path d="M66 106 L 66 64 L 72 64 A 30 30 0 0 0 128 64 L 134 64 L 134 106 Z" fill={BONE} stroke={EDGE} strokeWidth={2} />
      <path d="M78 34 C 60 46, 62 70, 70 78 M122 34 C 140 46, 138 70, 130 78" fill="none" stroke="#a855f7" strokeWidth={3} />
    </svg>
  );
}

const CONNECTIONS: CompareCard[] = [
  {
    id: "suture",
    icon: "〰️",
    name: r("Szwy", "Швы"),
    art: <SutureArt />,
    rows: [
      { label: L.tissue, value: r("cienka warstwa tkanki łącznej włóknistej między ząbkowanymi brzegami kości", "тонкий слой волокнистой соединительной ткани между зубчатыми краями костей") },
      { label: L.move, value: r("nieruchome", "неподвижные") },
      { label: L.example, value: r("kości sklepienia czaszki", "кости свода черепа") },
    ],
    text: r("U noworodka między kośćmi czaszki są miękkie ciemiączka — czaszka może się lekko odkształcać podczas porodu i rosnąć wraz z mózgiem.", "У новорождённого между костями черепа есть мягкие роднички — череп может слегка деформироваться при родах и расти вместе с мозгом."),
  },
  {
    id: "cartilage",
    icon: "🩵",
    name: r("Chrząstkozrost", "Хрящевое соединение"),
    art: <CartilageArt />,
    rows: [
      { label: L.tissue, value: r("chrząstka", "хрящ") },
      { label: L.move, value: r("niewielka — połączenie sprężyste", "небольшая — соединение упругое") },
      { label: L.example, value: r("kręgi połączone krążkami międzykręgowymi; spojenie łonowe", "позвонки, соединённые межпозвонковыми дисками; лобковый симфиз") },
    ],
  },
  {
    id: "bony",
    icon: "🧱",
    name: r("Kościozrost", "Синостоз"),
    art: <BonyArt />,
    rows: [
      { label: L.tissue, value: r("tkanka kostna — kości zrastają się w jedną", "костная ткань — кости срастаются в одну") },
      { label: L.move, value: r("brak", "нет") },
      { label: L.example, value: r("kręgi krzyżowe w kości krzyżowej; kość biodrowa, kulszowa i łonowa w kości miednicznej", "крестцовые позвонки в крестце; подвздошная, седалищная и лобковая кости в тазовой кости") },
    ],
    text: r("Kościozrosty powstają z czasem — z chrząstkozrostów lub więzozrostów, które kostnieją.", "Синостозы образуются со временем — из хрящевых или фиброзных соединений, которые окостеневают."),
  },
  {
    id: "joint",
    icon: "🦴",
    name: r("Staw", "Сустав"),
    art: <JointArt />,
    rows: [
      { label: L.tissue, value: r("kości nie stykają się bezpośrednio — oddziela je jama stawowa, a otacza torebka stawowa", "кости не соприкасаются напрямую — их разделяет суставная полость и окружает суставная капсула") },
      { label: L.move, value: r("ruchome — połączenie wolne", "подвижные — прерывное соединение") },
      { label: L.example, value: r("staw ramienny, łokciowy, kolanowy", "плечевой, локтевой, коленный суставы") },
    ],
  },
];

// ---------- joint map ----------

type JPart = "head" | "socket" | "cartilage" | "cavity" | "capsule" | "ligaments";

const JOINT: Record<JPart, MapPart> = {
  head: {
    name: r("Główka stawowa", "Суставная головка"),
    text: r("Wypukła powierzchnia stawowa jednej z kości.", "Выпуклая суставная поверхность одной из костей."),
    pin: [300, 100],
    to: [210, 130],
  },
  socket: {
    name: r("Panewka stawowa", "Суставная впадина"),
    text: r("Wklęsła powierzchnia stawowa drugiej kości, w którą wchodzi główka. Głęboka panewka (np. w stawie biodrowym) czyni staw stabilniejszym, ale mniej ruchomym.", "Вогнутая суставная поверхность другой кости, в которую входит головка. Глубокая впадина (например, в тазобедренном суставе) делает сустав прочнее, но менее подвижным."),
    pin: [300, 290],
    to: [222, 280],
  },
  cartilage: {
    name: r("Chrząstka stawowa", "Суставной хрящ"),
    text: r("Gładka chrząstka szklista pokrywająca powierzchnie stawowe. Zmniejsza tarcie i amortyzuje nacisk. Nie ma naczyń krwionośnych — odżywia ją maź stawowa.", "Гладкий гиалиновый хрящ, покрывающий суставные поверхности. Уменьшает трение и смягчает давление. Не имеет кровеносных сосудов — его питает синовиальная жидкость."),
    pin: [64, 270],
    to: [137, 193],
  },
  cavity: {
    name: r("Jama stawowa", "Суставная полость"),
    text: r("Wąska szczelina między powierzchniami stawowymi, wypełniona mazią stawową, która nawilża i odżywia chrząstkę.", "Узкая щель между суставными поверхностями, заполненная синовиальной жидкостью, которая смазывает и питает хрящ."),
    pin: [300, 200],
    to: [222, 186],
  },
  capsule: {
    name: r("Torebka stawowa", "Суставная капсула"),
    text: r("Łącznotkankowa osłona otaczająca staw i zamykająca jamę stawową; jej wewnętrzna warstwa (błona maziowa) wytwarza maź.", "Соединительнотканная оболочка, окружающая сустав и замыкающая суставную полость; её внутренний слой (синовиальная оболочка) выделяет синовиальную жидкость."),
    pin: [64, 60],
    to: [118, 98],
  },
  ligaments: {
    name: r("Więzadła", "Связки"),
    text: r("Pasma tkanki łącznej włóknistej łączące kości; wzmacniają staw i ograniczają zbyt duże ruchy. Gwałtowne wykręcenie stawu może je naderwać.", "Тяжи волокнистой соединительной ткани, соединяющие кости; укрепляют сустав и ограничивают чрезмерные движения. Резкое подворачивание сустава может их надорвать."),
    pin: [52, 150],
    to: [88, 150],
  },
};

function JointMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<JPart>
      lang={lang}
      parts={JOINT}
      viewBox="0 0 360 330"
      title={r("Budowa stawu", "Строение сустава")}
      labelOrder={["head", "socket", "cartilage", "cavity", "capsule", "ligaments"]}
      pinRadius={12}
      art={({ part, tone }) => (
        <>
          <rect width={360} height={330} fill="#fff7ed" />
          {part(
            "cavity",
            <g>
              <path d="M125.8 159.6 A 55 55 0 0 0 234.2 159.6" fill="none" stroke={tone("cavity", "#fde68a")} strokeWidth={10} />
              <path d="M112 150 C 108 120, 130 100, 150 96 L 210 96 C 230 100, 252 120, 248 150 L 248 182 L 112 182 Z" fill={tone("cavity", "#fef3c7")} />
            </g>,
          )}
          {part(
            "socket",
            <path d="M104 330 L 104 175 L 121.1 175 A 64 64 0 0 0 238.9 175 L 256 175 L 256 330 Z" fill={tone("socket", BONE)} stroke={EDGE} strokeWidth={2} />,
          )}
          {part(
            "head",
            <g fill={tone("head", BONE)} stroke={EDGE} strokeWidth={2}>
              <rect x={150} y={0} width={60} height={110} />
              <circle cx={180} cy={150} r={46} />
              <rect x={151} y={96} width={58} height={20} stroke="none" />
            </g>,
          )}
          {part(
            "cartilage",
            <g fill="none" stroke={tone("cartilage", "#7dd3fc")} strokeWidth={6}>
              <path d="M123.8 173.8 A 61 61 0 0 0 236.2 173.8" />
              <path d="M134 166.8 A 49 49 0 0 0 226 166.8" />
            </g>,
          )}
          {part(
            "capsule",
            <g fill="none" stroke={tone("capsule", "#a855f7")} strokeWidth={5} strokeLinecap="round">
              <path d="M150 70 C 110 84, 100 120, 104 160 C 106 180, 104 200, 104 222" />
              <path d="M210 70 C 250 84, 260 120, 256 160 C 254 180, 256 200, 256 222" />
            </g>,
          )}
          {part(
            "ligaments",
            <g stroke={tone("ligaments", "#d97706")} strokeWidth={7} strokeLinecap="round">
              <path d="M150 40 C 96 60, 82 150, 104 250" fill="none" />
              <path d="M210 40 C 264 60, 278 150, 256 250" fill="none" />
            </g>,
          )}
        </>
      )}
    />
  );
}

// ---------- joint types ----------

type JType = "ball" | "hinge" | "pivot" | "saddle" | "ellipsoid";

const TYPES: { id: JType; name: Txt; axes: number; example: Txt; move: Txt }[] = [
  {
    id: "ball",
    name: r("Staw kulisty", "Шаровидный сустав"),
    axes: 3,
    example: r("staw ramienny, staw biodrowy", "плечевой, тазобедренный суставы"),
    move: r("Kulista główka w panewce pozwala na ruchy we wszystkich płaszczyznach: zginanie i prostowanie, odwodzenie i przywodzenie, obracanie, a także krążenie kończyną.", "Шаровидная головка во впадине позволяет движения во всех плоскостях: сгибание и разгибание, отведение и приведение, вращение, а также круговые движения конечностью."),
  },
  {
    id: "hinge",
    name: r("Staw zawiasowy", "Блоковидный сустав"),
    axes: 1,
    example: r("stawy międzypaliczkowe, staw ramienno-łokciowy", "межфаланговые суставы, плечелоктевой сустав"),
    move: r("Działa jak zawias drzwi: tylko zginanie i prostowanie, w jednej płaszczyźnie.", "Работает как дверная петля: только сгибание и разгибание в одной плоскости."),
  },
  {
    id: "pivot",
    name: r("Staw obrotowy", "Цилиндрический (вращательный) сустав"),
    axes: 1,
    example: r("staw między kręgiem szczytowym a obrotowym; staw promieniowo-łokciowy bliższy", "сустав между атлантом и осевым позвонком; проксимальный лучелоктевой сустав"),
    move: r("Jedna kość obraca się wokół własnej osi długiej lub wokół drugiej kości — np. obracanie głową na boki („nie”).", "Одна кость вращается вокруг своей длинной оси или вокруг другой кости — например, поворот головы в стороны («нет»)."),
  },
  {
    id: "saddle",
    name: r("Staw siodełkowy", "Седловидный сустав"),
    axes: 2,
    example: r("staw nadgarstkowo-śródręczny kciuka", "запястно-пястный сустав большого пальца"),
    move: r("Obie powierzchnie są wygięte jak siodło. Ruchy w dwóch płaszczyznach — dzięki temu kciuk można przeciwstawić pozostałym palcom.", "Обе поверхности изогнуты, как седло. Движения в двух плоскостях — благодаря этому большой палец можно противопоставить остальным."),
  },
  {
    id: "ellipsoid",
    name: r("Staw eliptyczny", "Эллипсовидный сустав"),
    axes: 2,
    example: r("staw promieniowo-nadgarstkowy", "лучезапястный сустав"),
    move: r("Główka ma kształt elipsy. Zginanie i prostowanie oraz odchylanie na boki — w dwóch płaszczyznach, ale bez obracania.", "Головка имеет форму эллипса. Сгибание и разгибание, а также отведение в стороны — в двух плоскостях, но без вращения."),
  },
];

const AXES_T = r("Liczba osi ruchu", "Число осей движения");
const EX_T = r("Przykłady", "Примеры");

/** the drawn pose of the moving bone at phase t (radians): swing in the picture plane, swing toward
 * the viewer (drawn as foreshortening), twist about its own axis */
function pose(type: JType, t: number): { swing: number; tilt: number; twist: number } {
  switch (type) {
    case "ball":
      return { swing: 40 * Math.sin(t), tilt: Math.cos(t), twist: 0 };
    case "hinge":
      return { swing: 45 + 45 * Math.sin(t), tilt: 0, twist: 0 };
    case "pivot":
      return { swing: 0, tilt: 0, twist: t };
    default: {
      // two planes one after another: first side to side, then toward and away from the viewer
      const half = Math.floor(t / (2 * Math.PI)) % 2 === 0;
      return half ? { swing: 32 * Math.sin(t), tilt: 0, twist: 0 } : { swing: 0, tilt: Math.sin(t), twist: 0 };
    }
  }
}

function SurfaceGlyph({ type }: { type: JType }) {
  const fill = "#bae6fd";
  const stroke = "#0369a1";
  switch (type) {
    case "ball":
      return <circle cx={30} cy={26} r={16} fill={fill} stroke={stroke} strokeWidth={2} />;
    case "hinge":
      return <rect x={10} y={16} width={40} height={20} rx={10} fill={fill} stroke={stroke} strokeWidth={2} />;
    case "pivot":
      return <ellipse cx={30} cy={26} rx={10} ry={18} fill={fill} stroke={stroke} strokeWidth={2} />;
    case "saddle":
      return <path d="M8 16 Q 30 34 52 16 L 52 34 Q 30 50 8 34 Z" fill={fill} stroke={stroke} strokeWidth={2} />;
    default:
      return <ellipse cx={30} cy={26} rx={20} ry={12} fill={fill} stroke={stroke} strokeWidth={2} />;
  }
}

function JointTypes({ lang }: { lang: BioLang }) {
  const [type, setType] = useState<JType>("ball");
  const [t, setT] = useState(0);
  const [play, setPlay] = useState(true);
  useEffect(() => {
    if (!play) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      setT((v) => v + ((now - last) / 1000) * 1.8);
      last = now;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [play]);
  const info = TYPES.find((x) => x.id === type)!;
  const p = pose(type, t);
  const len = 110 * (1 - 0.45 * Math.abs(p.tilt));
  const towardViewer = p.tilt > 0.05;
  // a stripe on the bone shows the twist of the pivot joint
  const stripeX = 11 * Math.sin(p.twist);
  const stripeVisible = Math.cos(p.twist) > 0;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 240 230" className="mx-auto w-full max-w-[340px]" role="img" aria-label={info.name[lang]}>
          <rect width={240} height={230} rx={12} fill="#f8fafc" />
          <rect x={100} y={0} width={40} height={64} fill={BONE} stroke={EDGE} strokeWidth={2} />
          <ellipse cx={120} cy={66} rx={28} ry={10} fill="#e7e0cc" stroke={EDGE} strokeWidth={2} />
          {type === "ball" && <ellipse cx={120} cy={66 + 110 * 0.82} rx={110 * Math.sin((40 * Math.PI) / 180)} ry={18} fill="none" stroke="#c7d2fe" strokeWidth={2} strokeDasharray="5 4" />}
          {type === "hinge" && <path d={`M120 76 L 120 186 A 110 110 0 0 0 ${120 + 110 * Math.sin(Math.PI / 2)} ${76}`} fill="none" stroke="#c7d2fe" strokeWidth={2} strokeDasharray="5 4" />}
          <g transform={`rotate(${-p.swing} 120 76)`}>
            <rect x={108} y={76} width={24} height={len} rx={10} fill={towardViewer ? "#fffbeb" : BONE} stroke={EDGE} strokeWidth={2} />
            <circle cx={120} cy={76} r={14} fill="#bae6fd" stroke="#0369a1" strokeWidth={2} />
            {type === "pivot" && stripeVisible && <rect x={120 + stripeX - 2} y={92} width={4} height={len - 26} fill="#f43f5e" />}
            {towardViewer && <ellipse cx={120} cy={76 + len} rx={12} ry={6} fill="#fde68a" stroke={EDGE} strokeWidth={1.5} />}
          </g>
          {type === "pivot" && <path d="M92 150 A 28 10 0 1 0 148 150" fill="none" stroke="#4f46e5" strokeWidth={2.5} markerEnd="url(#joint-arrow)" />}
          <defs>
            <marker id="joint-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#4f46e5" />
            </marker>
          </defs>
          <g transform="translate(176 158)">
            <SurfaceGlyph type={type} />
          </g>
          <text x={206} y={222} textAnchor="middle" fontSize={9} fill="#64748b">
            {lang === "pl" ? "kształt główki" : "форма головки"}
          </text>
        </svg>
        <div className="mt-2 flex justify-center">
          <Choice onClick={() => setPlay(!play)}>{play ? (lang === "pl" ? "⏸ Pauza" : "⏸ Пауза") : lang === "pl" ? "▶ Ruch" : "▶ Движение"}</Choice>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {TYPES.map((x) => (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={type === x.id}
              onClick={() => {
                setType(x.id);
                setT(0);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors ${
                type === x.id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
              }`}
            >
              {x.name[lang]}
            </button>
          ))}
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <h3 className="text-base font-semibold text-emerald-900">{info.name[lang]}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{info.move[lang]}</p>
          <dl className="mt-2 space-y-1 text-sm text-emerald-900">
            <div>
              <dt className="inline font-semibold">{AXES_T[lang]}:</dt> <dd className="inline">{info.axes === 3 ? (lang === "pl" ? "3 (wieloosiowy)" : "3 (многоосный)") : info.axes}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">{EX_T[lang]}:</dt> <dd className="inline">{info.example[lang]}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

// ---------- quiz ----------

const TYPE_OPTIONS: QuizOption[] = TYPES.map((x) => ({ id: x.id, label: x.name }));

const REAL_JOINTS: QuizItem[] = [
  { icon: "💪", name: r("staw ramienny", "плечевой сустав"), answer: "ball", explain: r("Głowa kości ramiennej w płytkiej panewce łopatki — to najbardziej ruchomy staw ciała.", "Головка плечевой кости в мелкой суставной впадине лопатки — самый подвижный сустав тела.") },
  { icon: "☝️", name: r("staw między paliczkami palca", "сустав между фалангами пальца"), answer: "hinge", explain: r("Palec można tylko zgiąć i wyprostować.", "Палец можно только согнуть и разогнуть.") },
  { icon: "🙅", name: r("staw szczytowo-obrotowy (między 1. a 2. kręgiem szyjnym)", "срединный атлантоосевой сустав (между 1-м и 2-м шейными позвонками)"), answer: "pivot", explain: r("Kręg szczytowy obraca się wokół zęba kręgu obrotowego — kręcimy głową „nie”.", "Атлант вращается вокруг зуба осевого позвонка — мы мотаем головой «нет».") },
  { icon: "🦵", name: r("staw biodrowy", "тазобедренный сустав"), answer: "ball", explain: r("Głowa kości udowej w głębokiej panewce kości miednicznej — ruchy we wszystkich płaszczyznach, ale mniejsze niż w ramieniu.", "Головка бедренной кости в глубокой вертлужной впадине — движения во всех плоскостях, но меньше, чем в плече.") },
  { icon: "👍", name: r("staw nadgarstkowo-śródręczny kciuka", "запястно-пястный сустав большого пальца"), answer: "saddle", explain: r("Siodełkowy kształt pozwala przeciwstawić kciuk pozostałym palcom.", "Седловидная форма позволяет противопоставить большой палец остальным.") },
  { icon: "✋", name: r("staw promieniowo-nadgarstkowy", "лучезапястный сустав"), answer: "ellipsoid", explain: r("Dłoń zginamy, prostujemy i odchylamy na boki, ale nie obracamy jej w tym stawie.", "Кисть сгибаем, разгибаем и отводим в стороны, но не вращаем в этом суставе.") },
  { icon: "🔄", name: r("staw promieniowo-łokciowy bliższy", "проксимальный лучелоктевой сустав"), answer: "pivot", explain: r("Głowa kości promieniowej obraca się przy kości łokciowej — tak obracamy przedramię i dłoń.", "Головка лучевой кости вращается у локтевой — так мы поворачиваем предплечье и кисть.") },
  { icon: "🦾", name: r("staw ramienno-łokciowy", "плечелоктевой сустав"), answer: "hinge", explain: r("Zginanie i prostowanie łokcia w jednej płaszczyźnie.", "Сгибание и разгибание в локте в одной плоскости.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Połączenia ścisłe: szwy (więzozrosty), chrząstkozrosty, kościozrosty; połączenia ruchome to stawy.", ru: "Непрерывные соединения: швы (фиброзные соединения), хрящевые соединения, синостозы; подвижные соединения — суставы." },
    { pl: "Kręgi łączą krążki międzykręgowe (chrząstkozrost), kręgi krzyżowe są zrośnięte (kościozrost).", ru: "Позвонки соединены межпозвонковыми дисками (хрящевое соединение), крестцовые позвонки срослись (синостоз)." },
  ],
  s2: [
    { pl: "Staw: główka i panewka pokryte chrząstką stawową, jama stawowa z mazią, torebka stawowa, więzadła.", ru: "Сустав: головка и впадина, покрытые суставным хрящом, суставная полость с синовиальной жидкостью, суставная капсула, связки." },
    { pl: "Maź stawowa zmniejsza tarcie i odżywia chrząstkę; wytwarza ją błona maziowa torebki.", ru: "Синовиальная жидкость уменьшает трение и питает хрящ; её выделяет синовиальная оболочка капсулы." },
  ],
  s3: [
    { pl: "Staw kulisty — wieloosiowy; siodełkowy i eliptyczny — dwuosiowe; zawiasowy i obrotowy — jednoosiowe.", ru: "Шаровидный сустав — многоосный; седловидный и эллипсовидный — двуосные; блоковидный и цилиндрический — одноосные." },
  ],
  s4: [{ pl: "Ramienny i biodrowy — kuliste; międzypaliczkowe — zawiasowe; szczytowo-obrotowy — obrotowy; kciuka — siodełkowy.", ru: "Плечевой и тазобедренный — шаровидные; межфаланговые — блоковидные; атлантоосевой — цилиндрический; сустав большого пальца — седловидный." }],
};

export default function JointsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="joint" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="joint-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={CONNECTIONS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="joint-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <JointMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="joint-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <JointTypes lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="joint-s4" n={4} title={T.s4[lang]}>
        <MatchQuiz
          lang={lang}
          title={T.s4}
          question={r("Jakim stawem jest", "Каким суставом является")}
          options={TYPE_OPTIONS}
          items={REAL_JOINTS}
          wrongHint={r("Sprawdź, w ilu płaszczyznach porusza się ta część ciała.", "Проверь, в скольких плоскостях движется эта часть тела.")}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
