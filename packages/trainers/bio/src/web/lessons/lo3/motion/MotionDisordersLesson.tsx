// Lesson for LO3 §3.6 "Higiena i choroby układu ruchu" (Biologia na czasie 3, zakres rozszerzony).
// Diseases, their causes, signs and kinds follow templates/data/disorders.ts (MOTION_DISORDERS) and
// the kind names in templates/data/rows.ts.
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, TwoWaySort, type CompareCard, type QuizItem, type QuizOption, type SortItem } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Układ ruchu rozwija się aż do zakończenia wzrostu — to, jak siedzisz, co nosisz i ile się ruszasz, wpływa na kręgosłup i stopy na całe życie. W tej lekcji poznasz wady postawy, urazy i ich pierwszą pomoc oraz najważniejsze choroby kości i mięśni.",
    "Опорно-двигательная система развивается вплоть до окончания роста — то, как ты сидишь, что носишь и сколько двигаешься, влияет на позвоночник и стопы на всю жизнь. В этом уроке ты узнаешь о нарушениях осанки, травмах и первой помощи при них, а также о главных болезнях костей и мышц.",
  ),
  s1: r("Wady postawy", "Нарушения осанки"),
  s1intro: r("Wybierz wadę i porównaj ją z postawą prawidłową (linia przerywana).", "Выбери нарушение и сравни его с правильной осанкой (пунктирная линия)."),
  s2: r("Urazy kości i stawów", "Травмы костей и суставов"),
  s3: r("Pierwsza pomoc", "Первая помощь"),
  s3intro: r("Co należy zrobić przy urazie kości lub stawu, a czego nie wolno?", "Что нужно делать при травме кости или сустава, а чего делать нельзя?"),
  s4: r("Choroby układu ruchu", "Болезни опорно-двигательной системы"),
  s4intro: r("Każdą chorobę przypisz do odpowiedniej grupy według jej przyczyny.", "Отнеси каждую болезнь к нужной группе по её причине."),
  s5: r("Higiena układu ruchu", "Гигиена опорно-двигательной системы"),
} satisfies Record<string, Txt>;

// ---------- posture ----------

type Posture = "normal" | "kyphosis" | "lordosis" | "scoliosis" | "flatfoot";

const P_L = {
  cause: r("Przyczyny", "Причины"),
  signs: r("Objawy", "Признаки"),
  prevent: r("Zapobieganie", "Профилактика"),
};

const POSTURES: Record<Posture, { name: Txt; view: "side" | "back" | "feet"; cause: Txt; signs: Txt; prevent: Txt }> = {
  normal: {
    name: r("Postawa prawidłowa", "Правильная осанка"),
    view: "side",
    cause: r("silne mięśnie grzbietu i brzucha, aktywność fizyczna", "сильные мышцы спины и живота, физическая активность"),
    signs: r("głowa, barki, biodra i kostki leżą na jednej linii pionu; krzywizny kręgosłupa są umiarkowane", "голова, плечи, таз и лодыжки лежат на одной вертикали; изгибы позвоночника умеренные"),
    prevent: r("postawę utrzymują mięśnie — dlatego tak ważny jest codzienny ruch", "осанку удерживают мышцы — поэтому так важно ежедневное движение"),
  },
  kyphosis: {
    name: r("Pogłębiona kifoza", "Гиперкифоз"),
    view: "side",
    cause: r("garbienie się i słabe mięśnie grzbietu", "сутулость и слабые мышцы спины"),
    signs: r("nadmierne wygięcie kręgosłupa piersiowego ku tyłowi — plecy okrągłe, barki i głowa wysunięte do przodu", "чрезмерный изгиб грудного отдела позвоночника назад — круглая спина, плечи и голова выдвинуты вперёд"),
    prevent: r("ćwiczenia wzmacniające mięśnie grzbietu, prosta postawa przy biurku i nad telefonem", "упражнения для мышц спины, ровная посадка за столом и с телефоном"),
  },
  lordosis: {
    name: r("Pogłębiona lordoza", "Гиперлордоз"),
    view: "side",
    cause: r("słabe mięśnie brzucha, nadwaga i częste chodzenie w butach na wysokim obcasie", "слабые мышцы живота, лишний вес и частая ходьба на высоких каблуках"),
    signs: r("nadmierne wygięcie odcinka lędźwiowego ku przodowi — plecy wklęsłe, wysunięty brzuch i pośladki", "чрезмерный изгиб поясничного отдела вперёд — прогнутая поясница, выпяченные живот и ягодицы"),
    prevent: r("ćwiczenia mięśni brzucha, prawidłowa masa ciała, obuwie na niskim obcasie", "упражнения для мышц живота, нормальный вес, обувь на низком каблуке"),
  },
  scoliosis: {
    name: r("Skolioza", "Сколиоз"),
    view: "back",
    cause: r("długotrwała nieprawidłowa postawa i nierównomierne obciążanie kręgosłupa w okresie wzrostu", "длительная неправильная осанка и неравномерная нагрузка на позвоночник в период роста"),
    signs: r("boczne skrzywienie kręgosłupa, nierówno ustawione barki i łopatki", "боковое искривление позвоночника, разная высота плеч и лопаток"),
    prevent: r("równomierne obciążanie ciała (plecak na obu ramionach), pływanie, ćwiczenia korekcyjne", "равномерная нагрузка (рюкзак на обоих плечах), плавание, корригирующие упражнения"),
  },
  flatfoot: {
    name: r("Płaskostopie", "Плоскостопие"),
    view: "feet",
    cause: r("osłabienie mięśni i więzadeł utrzymujących wysklepienie stopy", "ослабление мышц и связок, удерживающих свод стопы"),
    signs: r("obniżenie łuku podłużnego stopy i ból stóp przy dłuższym chodzeniu", "опущение продольного свода стопы и боль в стопах при долгой ходьбе"),
    prevent: r("chodzenie boso po piasku i trawie, ćwiczenia stóp, dobrze dobrane obuwie", "ходьба босиком по песку и траве, упражнения для стоп, правильно подобранная обувь"),
  },
};

type Pt = [number, number];

/** a smooth curve through the points (Catmull–Rom turned into cubic Béziers) */
function smooth(pts: Pt[]): string {
  let d = `M${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]!.toFixed(1)} ${c1[1]!.toFixed(1)}, ${c2[0]!.toFixed(1)} ${c2[1]!.toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// side view, the front of the body to the right; `front` runs from the neck down to the groin
const SIDE: Record<"normal" | "kyphosis" | "lordosis", { spine: Pt[]; front: Pt[]; head: Pt; pelvisTilt: number; buttock: number }> = {
  normal: {
    spine: [[100, 64], [105, 82], [101, 102], [93, 132], [96, 160], [106, 182], [102, 202], [94, 218]],
    front: [[116, 70], [134, 106], [138, 130], [130, 160], [132, 186], [124, 222]],
    head: [104, 42],
    pelvisTilt: 0,
    buttock: 0,
  },
  kyphosis: {
    spine: [[114, 70], [116, 88], [104, 106], [84, 134], [92, 164], [104, 184], [102, 202], [94, 218]],
    front: [[128, 78], [138, 112], [136, 136], [128, 162], [132, 186], [124, 222]],
    head: [122, 50],
    pelvisTilt: -6,
    buttock: 0,
  },
  lordosis: {
    spine: [[100, 64], [105, 82], [100, 102], [90, 132], [98, 160], [116, 184], [104, 204], [90, 216]],
    front: [[116, 70], [134, 106], [138, 130], [140, 162], [146, 188], [128, 222]],
    head: [104, 42],
    pelvisTilt: 16,
    buttock: 10,
  },
};

function SideView({ kind, ghost }: { kind: "normal" | "kyphosis" | "lordosis"; ghost: boolean }) {
  const s = SIDE[kind];
  const back = s.spine.map(([x, y]) => [x - 14, y] as Pt);
  const outline: Pt[] = [...back, [s.spine[7]![0] - 16 - s.buttock, 228], [110, 236], ...[...s.front].reverse()];
  return (
    <>
      <path d="M100 226 L 102 262 L 100 290 L 124 292" fill="none" stroke="#fda4af" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M100 226 L 102 262 L 100 290 L 124 292" fill="none" stroke="#ffe4e6" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${smooth(outline)} Z`} fill="#ffe4e6" stroke="#fda4af" strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={s.head[0]} cy={s.head[1]} r={19} fill="#ffe4e6" stroke="#fda4af" strokeWidth={2.5} />
      <ellipse cx={104} cy={222} rx={22} ry={9} fill="#e7e0cc" stroke="#a8a29e" strokeWidth={2} transform={`rotate(${s.pelvisTilt} 104 222)`} />
      {ghost && kind !== "normal" && <path d={smooth(SIDE.normal.spine)} fill="none" stroke="#10b981" strokeWidth={3} strokeDasharray="5 4" />}
      <path d={smooth(s.spine)} fill="none" stroke="#a8a29e" strokeWidth={10} strokeLinecap="round" />
      <path d={smooth(s.spine)} fill="none" stroke="#f5efe0" strokeWidth={6} strokeLinecap="round" strokeDasharray="5 2" />
      <line x1={100} y1={8} x2={100} y2={296} stroke="#64748b" strokeWidth={1.2} strokeDasharray="5 4" />
    </>
  );
}

function BackView({ scoliosis, ghost }: { scoliosis: boolean; ghost: boolean }) {
  const spine: Pt[] = scoliosis
    ? [[100, 62], [103, 88], [114, 122], [108, 156], [92, 184], [98, 214]]
    : [[100, 62], [100, 88], [100, 122], [100, 156], [100, 184], [100, 214]];
  const tilt = scoliosis ? 7 : 0;
  return (
    <>
      <line x1={100} y1={10} x2={100} y2={292} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" />
      <path d={`M100 64 L ${58} ${88 - tilt} L 64 210 L 136 210 L ${142} ${88 + tilt} Z`} fill="#fff1f2" stroke="#fda4af" strokeWidth={3} strokeLinejoin="round" />
      <circle cx={100} cy={40} r={20} fill="#fecdd3" stroke="#e11d48" strokeWidth={2} />
      <path d={`M60 ${88 - tilt} L 140 ${88 + tilt}`} stroke="#e11d48" strokeWidth={2} strokeDasharray="3 3" />
      <path d={`M74 ${98 - tilt} L 92 ${100 - tilt} L 84 ${136 - tilt} Z`} fill="#e7e0cc" stroke="#a8a29e" strokeWidth={1.5} />
      <path d={`M126 ${98 + tilt} L 108 ${100 + tilt} L 116 ${136 + tilt} Z`} fill="#e7e0cc" stroke="#a8a29e" strokeWidth={1.5} />
      {ghost && scoliosis && <path d="M100 62 L 100 214" stroke="#10b981" strokeWidth={3} strokeDasharray="5 4" />}
      <path d={smooth(spine)} fill="none" stroke="#a8a29e" strokeWidth={10} strokeLinecap="round" />
      <path d={smooth(spine)} fill="none" stroke="#f5efe0" strokeWidth={6} strokeLinecap="round" strokeDasharray="5 2" />
      <path d="M70 212 C 70 236, 130 236, 130 212 Z" fill="#e7e0cc" stroke="#a8a29e" strokeWidth={2} />
      <path d="M86 232 L 84 290 M114 232 L 116 290" stroke="#fb7185" strokeWidth={9} strokeLinecap="round" />
    </>
  );
}

function FeetView({ lang }: { lang: BioLang }) {
  const toes = (cx: number) =>
    [
      [cx - 13, 52, 7],
      [cx - 2, 46, 5],
      [cx + 8, 48, 4.5],
      [cx + 16, 54, 4],
      [cx + 22, 62, 3.5],
    ].map(([x, y, rr], k) => <circle key={k} cx={x} cy={y} r={rr} fill="#fb7185" />);
  return (
    <>
      {/* a normal footprint: the inner side of the arch does not touch the ground */}
      <path d="M44 66 C 40 80, 52 92, 62 96 C 66 120, 56 150, 50 176 C 44 200, 52 218, 64 218 C 78 218, 82 204, 80 186 C 78 150, 84 110, 82 76 C 80 62, 54 58, 44 66 Z" fill="#fb7185" opacity={0.85} />
      {toes(56)}
      {/* a flat footprint: the whole sole touches the ground */}
      <path d="M118 66 C 112 90, 112 120, 116 160 C 118 200, 124 218, 140 218 C 154 218, 160 204, 160 186 C 160 150, 162 110, 160 76 C 158 62, 128 58, 118 66 Z" fill="#fb7185" opacity={0.85} />
      {toes(140)}
      <path d="M24 262 C 36 262, 44 236, 64 236 C 84 236, 90 262, 104 262" fill="#fecdd3" stroke="#e11d48" strokeWidth={2} />
      <path d="M108 262 C 118 262, 124 254, 140 254 C 158 254, 164 262, 176 262" fill="#fecdd3" stroke="#e11d48" strokeWidth={2} />
      <line x1={20} y1={263} x2={180} y2={263} stroke="#78716c" strokeWidth={2} />
      <text x={62} y={286} textAnchor="middle" fontSize={11} fill="#334155">
        {lang === "pl" ? "prawidłowa" : "нормальная"}
      </text>
      <text x={140} y={286} textAnchor="middle" fontSize={11} fill="#334155">
        {lang === "pl" ? "płaskostopie" : "плоскостопие"}
      </text>
    </>
  );
}

function PostureWidget({ lang }: { lang: BioLang }) {
  const [kind, setKind] = useState<Posture>("normal");
  const [ghost, setGhost] = useState(true);
  const p = POSTURES[kind];
  const viewName = p.view === "side" ? r("widok z boku (przód po prawej)", "вид сбоку (перед справа)") : p.view === "back" ? r("widok od tyłu", "вид сзади") : r("odcisk stopy i łuk stopy z boku", "отпечаток стопы и свод стопы сбоку");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(POSTURES) as Posture[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              kind === k ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {POSTURES[k].name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <figure className="rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
          <svg viewBox="0 0 200 300" className="mx-auto w-full max-w-[260px]" role="img" aria-label={`${p.name[lang]} — ${viewName[lang]}`}>
            {p.view === "side" && <SideView kind={kind as "normal" | "kyphosis" | "lordosis"} ghost={ghost} />}
            {p.view === "back" && <BackView scoliosis ghost={ghost} />}
            {p.view === "feet" && <FeetView lang={lang} />}
          </svg>
          <figcaption className="text-center text-xs text-slate-500">{viewName[lang]}</figcaption>
        </figure>
        <div className="space-y-3">
          <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
            <h3 className="text-base font-semibold text-emerald-900">{p.name[lang]}</h3>
            <dl className="mt-2 space-y-2 text-[15px] leading-relaxed text-emerald-950">
              {(["cause", "signs", "prevent"] as const).map((key) => (
                <div key={key}>
                  <dt className="text-sm font-semibold text-emerald-800">{P_L[key][lang]}</dt>
                  <dd>{p[key][lang]}</dd>
                </div>
              ))}
            </dl>
          </div>
          {p.view !== "feet" && kind !== "normal" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={ghost} onChange={(e) => setGhost(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
              {lang === "pl" ? "Pokaż prawidłowy kształt kręgosłupa" : "Показать правильную форму позвоночника"}
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- injuries ----------

const I_L = {
  what: r("Co się dzieje", "Что происходит"),
  signs: r("Objawy", "Признаки"),
  aid: r("Pierwsza pomoc", "Первая помощь"),
};

const BONE = "#f5efe0";
const EDGE = "#a8a29e";

function FractureArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
      <path d="M20 50 L 96 50 L 90 58 L 98 66 L 20 66 Z" fill={BONE} stroke={EDGE} strokeWidth={2} transform="rotate(-6 60 58)" />
      <path d="M104 56 L 182 56 L 182 72 L 104 72 L 112 64 Z" fill={BONE} stroke={EDGE} strokeWidth={2} transform="rotate(10 140 64)" />
      <path d="M96 40 l 6 8 l -6 6 l 8 6" stroke="#dc2626" strokeWidth={2.5} fill="none" />
    </svg>
  );
}

function DislocationArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
      <path d="M50 106 L 50 66 L 62 66 A 30 30 0 0 0 118 66 L 130 66 L 130 106 Z" fill={BONE} stroke={EDGE} strokeWidth={2} />
      <g transform="translate(34 -14)">
        <rect x={86} y={4} width={26} height={36} fill={BONE} stroke={EDGE} strokeWidth={2} />
        <circle cx={99} cy={46} r={18} fill={BONE} stroke={EDGE} strokeWidth={2} />
      </g>
      <path d="M90 50 C 100 40, 110 36, 122 34" stroke="#dc2626" strokeWidth={2.5} fill="none" strokeDasharray="4 3" />
    </svg>
  );
}

function SprainArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
      <rect x={84} y={0} width={32} height={46} fill={BONE} stroke={EDGE} strokeWidth={2} />
      <rect x={84} y={60} width={32} height={50} fill={BONE} stroke={EDGE} strokeWidth={2} />
      <path d="M78 20 L 78 46 M78 64 L 78 90" stroke="#d97706" strokeWidth={6} strokeLinecap="round" />
      <path d="M78 46 l 4 4 l -6 4 l 4 4" stroke="#dc2626" strokeWidth={2.5} fill="none" />
      <path d="M122 20 L 122 90" stroke="#d97706" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={100} cy={53} rx={46} ry={22} fill="#fca5a5" opacity={0.3} />
    </svg>
  );
}

const INJURIES: CompareCard[] = [
  {
    id: "fracture",
    icon: "🦴",
    name: r("Złamanie", "Перелом"),
    art: <FractureArt />,
    rows: [
      { label: I_L.what, value: r("przerwanie ciągłości kości; w złamaniu otwartym kość przebija skórę i powstaje rana", "нарушение целостности кости; при открытом переломе кость прорывает кожу и образуется рана") },
      { label: I_L.signs, value: r("silny ból, obrzęk, nienaturalne ustawienie kończyny", "сильная боль, отёк, неестественное положение конечности") },
      { label: I_L.aid, value: r("unieruchomić kończynę razem z dwoma sąsiednimi stawami; na ranę — jałowy opatrunek; wezwać pomoc", "обездвижить конечность вместе с двумя соседними суставами; на рану — стерильную повязку; вызвать помощь") },
    ],
    text: r("Kość zrasta się dzięki okostnej — najpierw powstaje kostnina, która z czasem przebudowuje się w kość.", "Кость срастается благодаря надкостнице — сначала образуется костная мозоль, которая со временем перестраивается в кость."),
  },
  {
    id: "dislocation",
    icon: "💥",
    name: r("Zwichnięcie", "Вывих"),
    art: <DislocationArt />,
    rows: [
      { label: I_L.what, value: r("powierzchnie stawowe przemieszczają się i nie wracają na swoje miejsce; często uszkodzona jest torebka stawowa", "суставные поверхности смещаются и не возвращаются на место; часто повреждается суставная капсула") },
      { label: I_L.signs, value: r("zniekształcenie stawu, silny ból, brak możliwości ruchu", "деформация сустава, сильная боль, невозможность движения") },
      { label: I_L.aid, value: r("unieruchomić staw w zastanej pozycji (z dwiema sąsiednimi kośćmi), zimny okład; nie nastawiać — robi to lekarz", "обездвижить сустав в том положении, в котором он есть (с двумя соседними костями), холод; не вправлять — это делает врач") },
    ],
  },
  {
    id: "sprain",
    icon: "🦶",
    name: r("Skręcenie stawu", "Растяжение связок"),
    art: <SprainArt />,
    rows: [
      { label: I_L.what, value: r("nagłe wykręcenie stawu (np. skokowego); powierzchnie stawowe wracają na miejsce, ale więzadła mogą się naderwać", "внезапное подворачивание сустава (например, голеностопного); суставные поверхности возвращаются на место, но связки могут надорваться") },
      { label: I_L.signs, value: r("ból i obrzęk stawu, bez przemieszczenia kości", "боль и отёк сустава без смещения костей") },
      { label: I_L.aid, value: r("zimny okład, odciążenie i unieruchomienie stawu, uniesienie kończyny", "холод, покой и обездвиживание сустава, приподнятое положение конечности") },
    ],
  },
];

const FIRST_AID: SortItem[] = [
  { name: r("unieruchomić złamaną kończynę razem z dwoma sąsiednimi stawami", "обездвижить сломанную конечность вместе с двумя соседними суставами"), group: 0, why: r("ruch odłamów kości może uszkodzić naczynia i nerwy", "движение отломков может повредить сосуды и нервы") },
  { name: r("samodzielnie nastawić zwichnięty staw", "самостоятельно вправить вывих"), group: 1, why: r("można uszkodzić więzadła, naczynia i nerwy — nastawia lekarz", "можно повредить связки, сосуды и нервы — вправляет врач") },
  { name: r("przyłożyć zimny okład na skręcony staw", "приложить холод к травмированному суставу"), group: 0, why: r("zimno zmniejsza obrzęk i ból", "холод уменьшает отёк и боль") },
  { name: r("wcisnąć wystającą kość z powrotem do rany", "затолкать торчащую кость обратно в рану"), group: 1, why: r("grozi zakażeniem i krwotokiem — ranę tylko się osłania", "грозит инфекцией и кровотечением — рану только закрывают") },
  { name: r("założyć jałowy opatrunek na ranę przy złamaniu otwartym", "наложить стерильную повязку на рану при открытом переломе"), group: 0, why: r("chroni ranę przed zakażeniem", "защищает рану от инфекции") },
  { name: r("bez potrzeby przenosić osobę z podejrzeniem urazu kręgosłupa", "без необходимости перемещать человека с подозрением на травму позвоночника"), group: 1, why: r("przemieszczenie kręgów może uszkodzić rdzeń kręgowy", "смещение позвонков может повредить спинной мозг") },
  { name: r("wezwać pomoc — numer alarmowy 112", "вызвать помощь — номер экстренной службы 112"), group: 0, why: r("poszkodowany potrzebuje badania i leczenia", "пострадавшему нужны обследование и лечение") },
  { name: r("sprawdzać, czy złamana noga da się wyprostować", "проверять, разгибается ли сломанная нога"), group: 1, why: r("każdy ruch nasila ból i przesuwa odłamy", "любое движение усиливает боль и смещает отломки") },
  { name: r("masować świeżo skręcony, obrzęknięty staw", "массировать только что травмированный, отёкший сустав"), group: 1, why: r("masaż nasila obrzęk i krwawienie w tkankach", "массаж усиливает отёк и кровоизлияние в тканях") },
];

// ---------- diseases ----------

const KINDS: QuizOption[] = [
  { id: "injury", label: r("uraz mechaniczny", "механическая травма") },
  { id: "posture", label: r("wada postawy", "нарушение осанки") },
  { id: "deficiency", label: r("choroba z niedoboru", "болезнь, вызванная недостатком питательных веществ") },
  { id: "metabolic", label: r("choroba metaboliczna", "болезнь обмена веществ") },
  { id: "degenerative", label: r("choroba zwyrodnieniowa", "дегенеративное заболевание") },
  { id: "genetic", label: r("choroba genetyczna", "генетическое заболевание") },
];

const DISEASES: QuizItem[] = [
  { icon: "🦴", name: r("krzywica", "рахит"), answer: "deficiency", explain: r("Niedobór witaminy D u dzieci zaburza uwapnienie kości — są miękkie i wyginają się.", "Недостаток витамина D у детей нарушает минерализацию костей — они мягкие и искривляются.") },
  { icon: "👵", name: r("osteoporoza", "остеопороз"), answer: "metabolic", explain: r("Niszczenie kości przeważa nad jej odbudową, m.in. po menopauzie przy spadku stężenia estrogenów; kości stają się kruche.", "Разрушение кости преобладает над её восстановлением, в том числе после менопаузы при снижении уровня эстрогенов; кости становятся хрупкими.") },
  { icon: "🪑", name: r("skolioza", "сколиоз"), answer: "posture", explain: r("Boczne skrzywienie kręgosłupa, które rozwija się w okresie wzrostu.", "Боковое искривление позвоночника, развивающееся в период роста.") },
  { icon: "💿", name: r("dyskopatia", "межпозвонковая грыжа"), answer: "degenerative", explain: r("Zwyrodniały krążek międzykręgowy przemieszcza się i uciska korzenie nerwów rdzeniowych — ból promieniuje do nogi.", "Дегенерировавший межпозвонковый диск смещается и давит на корешки спинномозговых нервов — боль отдаёт в ногу.") },
  { icon: "🧬", name: r("dystrofia mięśniowa Duchenne'a", "миодистрофия Дюшенна"), answer: "genetic", explain: r("Mutacja genu dystrofiny na chromosomie X — dlatego chorują głównie chłopcy.", "Мутация гена дистрофина в X-хромосоме — поэтому болеют в основном мальчики.") },
  { icon: "⛷️", name: r("złamanie kości", "перелом кости"), answer: "injury", explain: r("Uraz mechaniczny przekraczający wytrzymałość kości.", "Механическая травма, превышающая прочность кости.") },
  { icon: "🦶", name: r("płaskostopie", "плоскостопие"), answer: "posture", explain: r("Osłabione mięśnie i więzadła nie utrzymują wysklepienia stopy.", "Ослабленные мышцы и связки не удерживают свод стопы.") },
  { icon: "👠", name: r("pogłębiona lordoza", "гиперлордоз"), answer: "posture", explain: r("Nadmierne wygięcie odcinka lędźwiowego ku przodowi.", "Чрезмерный изгиб поясничного отдела вперёд.") },
  { icon: "🏀", name: r("skręcenie stawu", "растяжение связок"), answer: "injury", explain: r("Nagłe wykręcenie stawu z naderwaniem więzadeł.", "Внезапное подворачивание сустава с надрывом связок.") },
];

// ---------- hygiene ----------

const HABITS: SortItem[] = [
  { name: r("plecak noszony na obu ramionach", "рюкзак на обоих плечах"), group: 0, why: r("ciężar rozkłada się symetrycznie", "вес распределяется симметрично") },
  { name: r("torba noszona zawsze na tym samym ramieniu", "сумка всегда на одном и том же плече"), group: 1, why: r("jednostronne obciążenie sprzyja skoliozie", "односторонняя нагрузка способствует сколиозу") },
  { name: r("podnoszenie ciężaru z przysiadu, z prostymi plecami", "подъём тяжести из приседа с прямой спиной"), group: 0, why: r("pracują mięśnie nóg, a krążki międzykręgowe są obciążone równomiernie", "работают мышцы ног, а межпозвонковые диски нагружены равномерно") },
  { name: r("podnoszenie ciężaru w skłonie, na prostych nogach", "подъём тяжести в наклоне на прямых ногах"), group: 1, why: r("przeciąża odcinek lędźwiowy i sprzyja dyskopatii", "перегружает поясничный отдел и способствует грыже диска") },
  { name: r("pływanie", "плавание"), group: 0, why: r("wzmacnia mięśnie grzbietu bez obciążania kręgosłupa", "укрепляет мышцы спины без нагрузки на позвоночник") },
  { name: r("wiele godzin siedzenia bez przerwy", "многочасовое сидение без перерывов"), group: 1, why: r("mięśnie słabną, a kręgosłup jest długo obciążony w jednej pozycji", "мышцы слабеют, а позвоночник долго нагружен в одной позе") },
  { name: r("krzesło i biurko dopasowane do wzrostu", "стул и стол по росту"), group: 0, why: r("ułatwiają prostą postawę", "помогают держать спину прямо") },
  { name: r("dieta bogata w wapń i witaminę D", "питание, богатое кальцием и витамином D"), group: 0, why: r("budulec kości — chroni przed krzywicą i osteoporozą", "строительный материал костей — защищает от рахита и остеопороза") },
  { name: r("garbienie się nad telefonem", "сутулость над телефоном"), group: 1, why: r("sprzyja pogłębionej kifozie", "способствует гиперкифозу") },
  { name: r("codzienne chodzenie w butach na wysokim obcasie", "ежедневная ходьба на высоких каблуках"), group: 1, why: r("pogłębia lordozę lędźwiową i przeciąża stopy", "усиливает поясничный лордоз и перегружает стопы") },
  { name: r("chodzenie boso po piasku i trawie", "ходьба босиком по песку и траве"), group: 0, why: r("ćwiczy mięśnie utrzymujące wysklepienie stopy", "тренирует мышцы, удерживающие свод стопы") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Skolioza — boczne skrzywienie; pogłębiona kifoza — plecy okrągłe; pogłębiona lordoza — plecy wklęsłe; płaskostopie — obniżony łuk stopy.", ru: "Сколиоз — боковое искривление; гиперкифоз — круглая спина; гиперлордоз — прогнутая поясница; плоскостопие — опущенный свод стопы." },
    { pl: "Wady postawy powstają głównie w okresie wzrostu, gdy mięśnie są słabe, a kręgosłup obciążany nierównomiernie.", ru: "Нарушения осанки возникают в основном в период роста, когда мышцы слабы, а позвоночник нагружен неравномерно." },
  ],
  s2: [
    { pl: "Złamanie — przerwana kość; zwichnięcie — powierzchnie stawowe nie wracają na miejsce; skręcenie — wracają, ale więzadła są naderwane.", ru: "Перелом — нарушена целостность кости; вывих — суставные поверхности не возвращаются на место; растяжение — возвращаются, но связки надорваны." },
  ],
  s3: [
    { pl: "Przy złamaniu kości unieruchamiamy dwa sąsiednie stawy, przy urazie stawu — dwie sąsiednie kości.", ru: "При переломе кости обездвиживают два соседних сустава, при травме сустава — две соседние кости." },
    { pl: "Nie nastawiamy zwichnięć ani złamań — robi to lekarz.", ru: "Вывихи и переломы самостоятельно не вправляют — это делает врач." },
  ],
  s4: [
    { pl: "Krzywica — niedobór witaminy D u dzieci; osteoporoza — utrata masy kostnej, głównie u starszych kobiet.", ru: "Рахит — недостаток витамина D у детей; остеопороз — потеря костной массы, в основном у пожилых женщин." },
    { pl: "Dystrofia mięśniowa Duchenne'a jest sprzężona z chromosomem X.", ru: "Миодистрофия Дюшенна сцеплена с X-хромосомой." },
  ],
  s5: [
    { pl: "Ruch wzmacnia mięśnie i zwiększa masę kostną; wapń i witamina D są niezbędne do budowy kości.", ru: "Движение укрепляет мышцы и увеличивает костную массу; кальций и витамин D необходимы для построения костей." },
  ],
};

export default function MotionDisordersLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="movd" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="movd-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <PostureWidget lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="movd-s2" n={2} title={T.s2[lang]}>
        <CompareTabs lang={lang} cards={INJURIES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="movd-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s3} groups={[r("należy", "нужно"), r("nie wolno", "нельзя")]} items={FIRST_AID} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="movd-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s4}
          question={r("Do jakiej grupy należy", "К какой группе относится")}
          options={KINDS}
          items={DISEASES}
          wrongHint={r("Zastanów się, co jest przyczyną tej choroby.", "Подумай, что является причиной этой болезни.")}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="movd-s5" n={5} title={T.s5[lang]}>
        <TwoWaySort
          lang={lang}
          title={r("Co służy układowi ruchu?", "Что полезно для опорно-двигательной системы?")}
          groups={[r("pomaga", "полезно"), r("szkodzi", "вредно")]}
          items={HABITS}
        />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
