// Lesson for LO3 §6.2 "Skład i funkcje krwi" (zakres rozszerzony). Components and blood groups
// follow templates/data/circulation.ts (BLOOD_COMPONENTS, BLOOD_GROUPS).
import { useEffect, useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, OrderGame, type CompareCard } from "../../games.tsx";
import { Choice, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Krew to tkanka łączna płynna: dorosły człowiek ma jej ok. 5 litrów. Transportuje gazy, składniki odżywcze, hormony i ciepło, broni organizm przed drobnoustrojami, a po zranieniu krzepnie i zamyka uszkodzone naczynie.",
    "Кровь — жидкая соединительная ткань: у взрослого человека её около 5 литров. Она переносит газы, питательные вещества, гормоны и тепло, защищает организм от микробов, а при ранении свёртывается и закрывает повреждённый сосуд.",
  ),
  s1: r("Skład krwi", "Состав крови"),
  s1intro: r("Odwiruj probówkę z krwią — cięższe składniki opadną na dno. Potem dotknij każdej warstwy.", "Отцентрифугируй пробирку с кровью — более тяжёлые компоненты осядут на дно. Потом нажми на каждый слой."),
  s2: r("Elementy morfotyczne", "Форменные элементы"),
  s3: r("Krzepnięcie krwi", "Свёртывание крови"),
  s3intro: r("Ułóż etapy krzepnięcia w kolejności — od zranienia do skrzepu.", "Расставь этапы свёртывания по порядку — от ранения до сгустка."),
  s4: r("Grupy krwi i transfuzja", "Группы крови и переливание"),
  s4intro: r(
    "Wybierz grupę krwi dawcy i biorcy. Sprawdź, czy przeciwciała w osoczu biorcy rozpoznają antygeny na krwinkach dawcy.",
    "Выбери группу крови донора и реципиента. Проверь, узнают ли антитела в плазме реципиента антигены на эритроцитах донора.",
  ),
  s5: r("Konflikt serologiczny", "Резус-конфликт"),
  s5intro: r("Matka ma krew Rh−, a dziecko — Rh+. Prześledź, co się dzieje bez profilaktyki i z nią.", "У матери кровь Rh−, а у ребёнка — Rh+. Проследи, что происходит без профилактики и с ней."),
} satisfies Record<string, Txt>;

// ---------- test tube ----------

type Layer = "plasma" | "buffy" | "rbc";

const LAYERS: Record<Layer, { name: Txt; text: Txt; color: string; y: number; h: number }> = {
  plasma: {
    name: r("Osocze — ok. 55%", "Плазма — около 55%"),
    text: r(
      "Płynna część krwi. Ponad 90% to woda, ok. 7–8% — białka (albuminy, globuliny, w tym przeciwciała, oraz fibrynogen), reszta to glukoza, sole mineralne, mocznik i hormony. Transportuje rozpuszczone substancje i większość CO₂ (jako jony wodorowęglanowe). Osocze bez fibrynogenu to surowica.",
      "Жидкая часть крови. Более 90% — вода, около 7–8% — белки (альбумины, глобулины, в том числе антитела, и фибриноген), остальное — глюкоза, минеральные соли, мочевина и гормоны. Переносит растворённые вещества и большую часть CO₂ (в виде гидрокарбонат-ионов). Плазма без фибриногена — это сыворотка.",
    ),
    color: "#fde68a",
    y: 50,
    h: 124,
  },
  buffy: {
    name: r("Cienka biała warstwa — poniżej 1%", "Тонкий белый слой — меньше 1%"),
    text: r("Leukocyty i trombocyty. Jest ich bardzo dużo, ale są małe lub nieliczne w porównaniu z erytrocytami, więc zajmują znikomą objętość.", "Лейкоциты и тромбоциты. Их много, но они мелкие или немногочисленные по сравнению с эритроцитами, поэтому занимают ничтожный объём."),
    color: "#f8fafc",
    y: 174,
    h: 6,
  },
  rbc: {
    name: r("Erytrocyty — ok. 45%", "Эритроциты — около 45%"),
    text: r(
      "Najcięższy składnik, więc opada na dno. Odsetek objętości krwi zajmowany przez erytrocyty to hematokryt; u mężczyzn jest nieco wyższy niż u kobiet. Erytrocyty, leukocyty i trombocyty to razem elementy morfotyczne krwi.",
      "Самый тяжёлый компонент, поэтому оседает на дно. Доля объёма крови, которую занимают эритроциты, называется гематокритом; у мужчин он немного выше, чем у женщин. Эритроциты, лейкоциты и тромбоциты вместе — форменные элементы крови.",
    ),
    color: "#b91c1c",
    y: 180,
    h: 96,
  },
};

const TUBE = "M34 20 L 34 250 A26 26 0 0 0 86 250 L 86 20";

function TestTube({ lang }: { lang: BioLang }) {
  const [spun, setSpun] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<Layer | null>(null);
  useEffect(() => {
    if (!spinning) return;
    const id = window.setTimeout(() => {
      setSpinning(false);
      setSpun(true);
    }, 1200);
    return () => window.clearTimeout(id);
  }, [spinning]);
  const layer = picked ? LAYERS[picked] : null;
  const ids = Object.keys(LAYERS) as Layer[];
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 120 290" className="w-full max-w-[160px]" role="img" aria-label={lang === "pl" ? "Probówka z krwią" : "Пробирка с кровью"}>
          <defs>
            <clipPath id="blood-tube">
              <path d={`${TUBE} Z`} />
            </clipPath>
          </defs>
          <g
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: spinning ? "rotate(720deg)" : "none",
              transition: spinning ? "transform 1.2s ease-in-out" : "none",
            }}
          >
            <path d={`${TUBE} Z`} fill="white" />
            <g clipPath="url(#blood-tube)">
              {ids.map((id) => {
                const L = LAYERS[id];
                const node = <rect x={0} y={L.y} width={120} height={L.h} fill={picked === id ? "#6ee7b7" : L.color} />;
                return spun ? (
                  <g
                    key={id}
                    role="button"
                    tabIndex={0}
                    aria-label={L.name[lang]}
                    aria-pressed={picked === id}
                    onClick={() => setPicked(id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPicked(id);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    {node}
                  </g>
                ) : null;
              })}
              <rect x={0} y={50} width={120} height={240} fill="#991b1b" style={{ opacity: spun ? 0 : 1, transition: "opacity .6s", pointerEvents: spun ? "none" : "auto" }} />
            </g>
            <path d={TUBE} fill="none" stroke="#64748b" strokeWidth={3} />
            <path d="M28 20 L 92 20" stroke="#64748b" strokeWidth={4} strokeLinecap="round" />
          </g>
          {spun && (
            <g fontSize={10} fill="#334155">
              <path d="M90 112 L 104 112" stroke="#94a3b8" />
              <text x={106} y={115}>55%</text>
              <path d="M90 228 L 104 228" stroke="#94a3b8" />
              <text x={106} y={231}>45%</text>
            </g>
          )}
        </svg>
        <div className="flex gap-2">
          <Choice
            state="active"
            disabled={spinning}
            onClick={() => {
              if (spun) {
                setSpun(false);
                setPicked(null);
              } else setSpinning(true);
            }}
          >
            {spun ? (lang === "pl" ? "↺ Wymieszaj" : "↺ Перемешать") : lang === "pl" ? "🌀 Odwiruj" : "🌀 Центрифугировать"}
          </Choice>
        </div>
      </div>
      <div aria-live="polite">
        {!spun ? (
          <p className="rounded-xl bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-600 ring-1 ring-slate-200">
            {lang === "pl"
              ? "Krew w probówce wygląda na jednolitą czerwoną ciecz. W wirówce składniki rozdzielą się według gęstości."
              : "Кровь в пробирке выглядит однородной красной жидкостью. В центрифуге компоненты разделятся по плотности."}
          </p>
        ) : layer ? (
          <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
            <h3 className="text-base font-semibold text-emerald-900">{layer.name[lang]}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{layer.text[lang]}</p>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-[15px] text-slate-600 ring-1 ring-slate-200">👆 {lang === "pl" ? "Dotknij warstwy w probówce albo nazwy poniżej." : "Нажми на слой в пробирке или на название ниже."}</p>
        )}
        {spun && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ids.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPicked(id)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${picked === id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"}`}
              >
                {LAYERS[id].name[lang]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- cells ----------

const CL = {
  build: r("Budowa", "Строение"),
  count: r("Liczba w 1 mm³", "Число в 1 мм³"),
  origin: r("Powstają w", "Образуются в"),
  life: r("Czas życia", "Срок жизни"),
  role: r("Funkcja", "Функция"),
};

function CellArt({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 130" className="w-full" role="img" aria-label={label}>
      <rect width={200} height={130} rx={10} fill="#fff1f2" />
      {children}
    </svg>
  );
}

function cells(lang: BioLang): CompareCard[] {
  const pl = lang === "pl";
  return [
    {
      id: "rbc",
      icon: "🔴",
      name: r("Erytrocyty", "Эритроциты"),
      art: (
        <CellArt label={pl ? "Erytrocyt z góry i z boku" : "Эритроцит сверху и сбоку"}>
          <circle cx={62} cy={62} r={38} fill="#dc2626" />
          <circle cx={62} cy={62} r={18} fill="#f87171" />
          <path d="M120 44 C 150 34, 150 54, 165 54 C 180 54, 180 34, 190 44 L 190 80 C 180 90, 180 70, 165 70 C 150 70, 150 90, 120 80 Z" fill="#dc2626" />
          <text x={62} y={118} textAnchor="middle" fontSize={10} fill="#7f1d1d">
            {pl ? "z góry" : "сверху"}
          </text>
          <text x={155} y={110} textAnchor="middle" fontSize={10} fill="#7f1d1d">
            {pl ? "przekrój" : "в разрезе"}
          </text>
        </CellArt>
      ),
      rows: [
        { label: CL.build, value: r("dwuwklęsłe krążki bez jądra i mitochondriów, wypełnione hemoglobiną", "двояковогнутые диски без ядра и митохондрий, заполненные гемоглобином") },
        { label: CL.count, value: r("ok. 4,5–5 mln", "около 4,5–5 млн") },
        { label: CL.origin, value: r("czerwony szpik kostny", "красный костный мозг") },
        { label: CL.life, value: r("ok. 120 dni; rozkładane w śledzionie i wątrobie", "около 120 дней; разрушаются в селезёнке и печени") },
        { label: CL.role, value: r("transport tlenu (i części CO₂) dzięki hemoglobinie", "перенос кислорода (и части CO₂) благодаря гемоглобину") },
      ],
      text: r(
        "Brak jądra zostawia więcej miejsca na hemoglobinę, a dwuwklęsły kształt zwiększa powierzchnię wymiany gazów. Hemoglobina zawiera żelazo — jego niedobór prowadzi do niedokrwistości.",
        "Отсутствие ядра оставляет больше места для гемоглобина, а двояковогнутая форма увеличивает поверхность газообмена. Гемоглобин содержит железо — его недостаток ведёт к анемии.",
      ),
    },
    {
      id: "wbc",
      icon: "⚪",
      name: r("Leukocyty", "Лейкоциты"),
      art: (
        <CellArt label={pl ? "Neutrofil i limfocyt" : "Нейтрофил и лимфоцит"}>
          <circle cx={60} cy={58} r={38} fill="#ede9fe" stroke="#7c3aed" strokeWidth={2} />
          {[
            [46, 50],
            [62, 70],
            [74, 46],
          ].map(([x, y]) => (
            <ellipse key={x} cx={x} cy={y} rx={11} ry={9} fill="#7c3aed" />
          ))}
          <circle cx={148} cy={58} r={30} fill="#ede9fe" stroke="#7c3aed" strokeWidth={2} />
          <circle cx={148} cy={58} r={24} fill="#6d28d9" />
          <text x={60} y={118} textAnchor="middle" fontSize={10} fill="#4c1d95">
            {pl ? "neutrofil" : "нейтрофил"}
          </text>
          <text x={148} y={118} textAnchor="middle" fontSize={10} fill="#4c1d95">
            {pl ? "limfocyt" : "лимфоцит"}
          </text>
        </CellArt>
      ),
      rows: [
        { label: CL.build, value: r("duże komórki z jądrem: granulocyty (np. neutrofile) i agranulocyty (limfocyty, monocyty)", "крупные клетки с ядром: гранулоциты (например, нейтрофилы) и агранулоциты (лимфоциты, моноциты)") },
        { label: CL.count, value: r("4–10 tys.", "4–10 тыс.") },
        { label: CL.origin, value: r("czerwony szpik kostny; limfocyty T dojrzewają w grasicy", "красный костный мозг; Т-лимфоциты созревают в тимусе") },
        { label: CL.life, value: r("od kilku godzin do wielu lat (komórki pamięci)", "от нескольких часов до многих лет (клетки памяти)") },
        { label: CL.role, value: r("obrona organizmu: fagocytoza, wytwarzanie przeciwciał", "защита организма: фагоцитоз, выработка антител") },
      ],
      text: r(
        "Leukocyty przeciskają się przez ściany naczyń włosowatych do tkanek (diapedeza) i poruszają się ruchem pełzakowatym. Monocyty w tkankach przekształcają się w makrofagi.",
        "Лейкоциты протискиваются сквозь стенки капилляров в ткани (диапедез) и передвигаются амебоидным движением. Моноциты в тканях превращаются в макрофаги.",
      ),
    },
    {
      id: "plt",
      icon: "🟣",
      name: r("Trombocyty", "Тромбоциты"),
      art: (
        <CellArt label={pl ? "Płytki krwi" : "Кровяные пластинки"}>
          {[
            [40, 50, 0],
            [80, 80, 30],
            [110, 40, 60],
            [150, 76, 15],
            [170, 40, 45],
            [60, 100, 80],
          ].map(([x, y, a]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={12} ry={7} transform={`rotate(${a} ${x} ${y})`} fill="#f0abfc" stroke="#a21caf" strokeWidth={1.5} />
          ))}
          <text x={100} y={122} textAnchor="middle" fontSize={10} fill="#701a75">
            {pl ? "fragmenty komórek bez jądra" : "фрагменты клеток без ядра"}
          </text>
        </CellArt>
      ),
      rows: [
        { label: CL.build, value: r("małe fragmenty cytoplazmy olbrzymich komórek szpiku (megakariocytów), bez jądra", "небольшие фрагменты цитоплазмы гигантских клеток костного мозга (мегакариоцитов), без ядра") },
        { label: CL.count, value: r("150–400 tys.", "150–400 тыс.") },
        { label: CL.origin, value: r("czerwony szpik kostny", "красный костный мозг") },
        { label: CL.life, value: r("ok. 7–10 dni", "около 7–10 дней") },
        { label: CL.role, value: r("krzepnięcie krwi — tworzą czop i uwalniają czynniki krzepnięcia", "свёртывание крови — образуют пробку и выделяют факторы свёртывания") },
      ],
      text: r("Przy niedoborze płytek nawet drobne urazy powodują siniaki i długie krwawienia.", "При недостатке тромбоцитов даже мелкие травмы вызывают синяки и долгие кровотечения."),
    },
  ];
}

// ---------- clotting ----------

const CLOTTING: Txt[] = [
  r("płytki krwi przylegają do rany i tworzą czop", "тромбоциты прилипают к ране и образуют пробку"),
  r("uwolnienie tromboplastyny z płytek i uszkodzonych tkanek", "выделение тромбопластина из тромбоцитов и повреждённых тканей"),
  r("protrombina → trombina (z udziałem Ca²⁺)", "протромбин → тромбин (при участии Ca²⁺)"),
  r("fibrynogen → fibryna", "фибриноген → фибрин"),
  r("nici fibryny zatrzymują krwinki — powstaje skrzep", "нити фибрина задерживают клетки крови — образуется сгусток"),
];

// ---------- transfusion ----------

type Abo = "0" | "A" | "B" | "AB";
interface Group {
  abo: Abo;
  rh: boolean;
}

const GROUPS: Group[] = (["0", "A", "B", "AB"] as const).flatMap((abo) => [false, true].map((rh) => ({ abo, rh })));
const gName = (g: Group) => `${g.abo} Rh${g.rh ? "+" : "−"}`;
const hasA = (g: Group) => g.abo === "A" || g.abo === "AB";
const hasB = (g: Group) => g.abo === "B" || g.abo === "AB";
const same = (a: Group, b: Group) => a.abo === b.abo && a.rh === b.rh;

type Outcome = "ok" | "abo" | "rh";

function transfuse(donor: Group, recipient: Group): Outcome {
  if ((hasA(donor) && !hasA(recipient)) || (hasB(donor) && !hasB(recipient))) return "abo";
  if (donor.rh && !recipient.rh) return "rh";
  return "ok";
}

function antigens(g: Group, lang: BioLang): string {
  const list = [hasA(g) && "A", hasB(g) && "B", g.rh && "D"].filter(Boolean);
  return list.length ? list.join(", ") : lang === "pl" ? "brak" : "нет";
}

function antibodies(g: Group, lang: BioLang): string {
  const list = [!hasA(g) && (lang === "pl" ? "anty-A" : "анти-A"), !hasB(g) && (lang === "pl" ? "anty-B" : "анти-B")].filter(Boolean);
  return list.length ? list.join(", ") : lang === "pl" ? "brak" : "нет";
}

const SPREAD: [number, number][] = [
  [50, 55],
  [112, 40],
  [176, 58],
  [242, 42],
  [80, 112],
  [150, 106],
  [222, 114],
];
const CLUMPED: [number, number][] = [
  [92, 70],
  [116, 60],
  [110, 88],
  [204, 76],
  [228, 66],
  [222, 92],
  [134, 80],
];
const Y_SPOTS: [number, number][] = [
  [84, 82],
  [146, 74],
  [206, 88],
  [270, 98],
  [30, 104],
  [186, 132],
];
const Y_CLUMP: [number, number][] = [
  [104, 74],
  [216, 80],
  [122, 70],
  [214, 64],
  [100, 96],
  [232, 98],
];

function Yab({ x, y, color, dashed }: { x: number; y: number; color: string; dashed?: boolean }) {
  return (
    <path
      d={`M${x} ${y + 9} L ${x} ${y} M${x} ${y} L ${x - 6} ${y - 7} M${x} ${y} L ${x + 6} ${y - 7}`}
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      fill="none"
      strokeDasharray={dashed ? "2 2" : undefined}
      style={{ transition: "d .8s" }}
    />
  );
}

const ANTI_A = "#0284c7";
const ANTI_B = "#d97706";
const ANTI_D = "#7c3aed";

function GroupPicker({ lang, label, value, onPick }: { lang: BioLang; label: Txt; value: Group; onPick: (g: Group) => void }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-semibold text-slate-700">{label[lang]}</div>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label[lang]}>
        {GROUPS.map((g) => (
          <button
            key={gName(g)}
            type="button"
            role="radio"
            aria-checked={same(g, value)}
            onClick={() => onPick(g)}
            className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold tabular-nums ring-1 transition-colors ${
              same(g, value) ? "bg-rose-600 text-white ring-rose-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
            }`}
          >
            {gName(g)}
          </button>
        ))}
      </div>
    </div>
  );
}

const OUT: Record<Outcome, { title: Txt; look: string }> = {
  ok: { title: r("✓ Krew zgodna — brak aglutynacji", "✓ Кровь совместима — агглютинации нет"), look: "bg-emerald-50 text-emerald-950 ring-emerald-200" },
  abo: { title: r("✗ Aglutynacja — krwinki dawcy się zlepiają", "✗ Агглютинация — эритроциты донора склеиваются"), look: "bg-rose-50 text-rose-950 ring-rose-200" },
  rh: { title: r("✗ Niezgodność w układzie Rh", "✗ Несовместимость по системе Rh"), look: "bg-amber-50 text-amber-950 ring-amber-200" },
};

function Transfusion({ lang }: { lang: BioLang }) {
  const [donor, setDonor] = useState<Group>({ abo: "A", rh: true });
  const [recipient, setRecipient] = useState<Group>({ abo: "0", rh: true });
  const [showAll, setShowAll] = useState(false);
  const out = transfuse(donor, recipient);
  const clumped = out === "abo";
  const abs: string[] = [!hasA(recipient) && ANTI_A, !hasB(recipient) && ANTI_B].filter((x): x is string => Boolean(x));
  const okDonors = GROUPS.filter((g) => transfuse(g, recipient) === "ok");
  const why =
    out === "abo"
      ? lang === "pl"
        ? `Osocze biorcy zawiera przeciwciała ${antibodies(recipient, lang)}, a krwinki dawcy mają antygeny ${antigens(donor, lang)}. Przeciwciała łączą się z pasującymi antygenami i zlepiają krwinki — zlepy zatykają naczynia, a krwinki ulegają rozpadowi. To zagraża życiu.`
        : `В плазме реципиента есть антитела ${antibodies(recipient, lang)}, а на эритроцитах донора — антигены ${antigens(donor, lang)}. Антитела связываются с подходящими антигенами и склеивают эритроциты — сгустки закупоривают сосуды, а эритроциты разрушаются. Это угрожает жизни.`
      : out === "rh"
        ? lang === "pl"
          ? "Osoba Rh− nie ma od urodzenia przeciwciał anty-D, więc pierwsza taka transfuzja zwykle nie wywoła natychmiastowej aglutynacji. Ale jej organizm wytworzy przeciwciała anty-D i przy kolejnym przetoczeniu krwi Rh+ krwinki się zlepią. Dlatego osobie Rh− przetacza się tylko krew Rh−."
          : "У человека с Rh− нет врождённых антител анти-D, поэтому первое такое переливание обычно не вызывает немедленной агглютинации. Но его организм выработает антитела анти-D, и при следующем переливании крови Rh+ эритроциты склеятся. Поэтому человеку с Rh− переливают только кровь Rh−."
        : lang === "pl"
          ? `Przeciwciała biorcy (${antibodies(recipient, lang)}) nie pasują do żadnego antygenu na krwinkach dawcy (${antigens(donor, lang)}).`
          : `Антитела реципиента (${antibodies(recipient, lang)}) не подходят ни к одному антигену на эритроцитах донора (${antigens(donor, lang)}).`;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <GroupPicker lang={lang} label={r("🩸 Dawca (krwinki)", "🩸 Донор (эритроциты)")} value={donor} onPick={setDonor} />
        <GroupPicker lang={lang} label={r("🛏️ Biorca (osocze)", "🛏️ Реципиент (плазма)")} value={recipient} onPick={setRecipient} />
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 300 150" className="w-full" role="img" aria-label={`${gName(donor)} → ${gName(recipient)}: ${OUT[out].title[lang]}`}>
            <rect x={4} y={4} width={292} height={142} rx={40} fill="#fef9c3" stroke="#eab308" strokeWidth={1.5} />
            {SPREAD.map((p, k) => {
              const [x, y] = clumped ? CLUMPED[k]! : p;
              return (
                <g key={k} style={{ transform: `translate(${x}px, ${y}px)`, transition: "transform .8s ease-in-out" }}>
                  <circle r={14} fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.5} />
                  {hasA(donor) && <path d="M-9 -14 L -4 -22 L 1 -14 Z" fill={ANTI_A} />}
                  {hasB(donor) && <rect x={3} y={-21} width={7} height={7} fill={ANTI_B} />}
                  {donor.rh && <circle cx={0} cy={17} r={3.5} fill={ANTI_D} />}
                </g>
              );
            })}
            {abs.length > 0 &&
              (clumped ? Y_CLUMP : Y_SPOTS).map(([x, y], k) => <Yab key={k} x={x} y={y} color={abs[k % abs.length]!} />)}
            {out === "rh" && <Yab x={60} y={84} color={ANTI_D} dashed />}
          </svg>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              <span style={{ color: ANTI_A }}>▲</span> {lang === "pl" ? "antygen A" : "антиген A"}
            </span>
            <span>
              <span style={{ color: ANTI_B }}>■</span> {lang === "pl" ? "antygen B" : "антиген B"}
            </span>
            <span>
              <span style={{ color: ANTI_D }}>●</span> {lang === "pl" ? "antygen D (Rh)" : "антиген D (Rh)"}
            </span>
            <span>Y {lang === "pl" ? "przeciwciała (kolor = cel)" : "антитела (цвет = мишень)"}</span>
          </p>
        </div>
        <div className="space-y-3" aria-live="polite">
          <div className={`rounded-xl px-4 py-3 text-[15px] leading-relaxed ring-1 ${OUT[out].look}`}>
            <p className="font-semibold">{OUT[out].title[lang]}</p>
            <p className="mt-1">{why}</p>
          </div>
          <button type="button" onClick={() => setShowAll(!showAll)} className="text-sm font-medium text-indigo-700 underline underline-offset-2">
            {lang === "pl" ? `Od kogo może dostać krew biorca ${gName(recipient)}?` : `От кого может получить кровь реципиент ${gName(recipient)}?`}
          </button>
          {showAll && (
            <p className="flex flex-wrap gap-1.5">
              {okDonors.map((g) => (
                <span key={gName(g)} className="rounded-md bg-emerald-100 px-2 py-0.5 text-sm font-semibold text-emerald-900 tabular-nums">
                  {gName(g)}
                </span>
              ))}
            </p>
          )}
          <p className="text-sm text-slate-500">
            {lang === "pl"
              ? "W szpitalu przetacza się zwykle krew tej samej grupy, a przed transfuzją wykonuje się próbę zgodności krwi dawcy i biorcy."
              : "В больнице обычно переливают кровь той же группы, а перед переливанием проводят пробу на совместимость крови донора и реципиента."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- serological conflict ----------

interface ConflictStep {
  name: Txt;
  text: Txt;
}

const CONFLICT: { plain: ConflictStep[]; prevented: ConflictStep[] } = {
  plain: [
    {
      name: r("Pierwsza ciąża", "Первая беременность"),
      text: r(
        "Matka ma krew Rh−, ojciec Rh+, a płód odziedziczył po ojcu antygen D (Rh+). W czasie ciąży krew matki i płodu oddziela łożysko.",
        "У матери кровь Rh−, у отца Rh+, а плод унаследовал от отца антиген D (Rh+). Во время беременности кровь матери и плода разделяет плацента.",
      ),
    },
    {
      name: r("Poród", "Роды"),
      text: r("Podczas porodu (a także poronienia) do krwi matki przedostaje się trochę erytrocytów dziecka z antygenem D.", "Во время родов (а также выкидыша) в кровь матери попадает немного эритроцитов ребёнка с антигеном D."),
    },
    {
      name: r("Uczulenie matki", "Иммунизация матери"),
      text: r(
        "Układ odpornościowy matki rozpoznaje antygen D jako obcy i wytwarza przeciwciała anty-D oraz komórki pamięci. Pierwsze dziecko jest zwykle bezpieczne — przeciwciała powstały za późno.",
        "Иммунная система матери распознаёт антиген D как чужой и вырабатывает антитела анти-D и клетки памяти. Первый ребёнок обычно в безопасности — антитела появились слишком поздно.",
      ),
    },
    {
      name: r("Kolejna ciąża (płód Rh+)", "Следующая беременность (плод Rh+)"),
      text: r(
        "Przeciwciała anty-D przechodzą przez łożysko i niszczą erytrocyty płodu (hemoliza). Grozi choroba hemolityczna płodu i noworodka: niedokrwistość, żółtaczka, obrzęki.",
        "Антитела анти-D проходят через плаценту и разрушают эритроциты плода (гемолиз). Грозит гемолитическая болезнь плода и новорождённого: анемия, желтуха, отёки.",
      ),
    },
  ],
  prevented: [],
};
CONFLICT.prevented = [
  CONFLICT.plain[0]!,
  CONFLICT.plain[1]!,
  {
    name: r("Immunoglobulina anty-D", "Иммуноглобулин анти-D"),
    text: r(
      "W ciągu 72 godzin po porodzie matka dostaje zastrzyk z gotowymi przeciwciałami anty-D. Niszczą one krwinki dziecka, zanim jej układ odpornościowy je rozpozna — nie powstają ani własne przeciwciała, ani komórki pamięci.",
      "В течение 72 часов после родов матери вводят готовые антитела анти-D. Они уничтожают эритроциты ребёнка раньше, чем её иммунная система их распознает, — не образуются ни собственные антитела, ни клетки памяти.",
    ),
  },
  {
    name: r("Kolejna ciąża (płód Rh+)", "Следующая беременность (плод Rh+)"),
    text: r(
      "Matka nie ma przeciwciał anty-D ani komórek pamięci, więc ciąża przebiega bezpiecznie. Immunoglobulinę podaje się po każdym porodzie dziecka Rh+, a profilaktycznie także w czasie ciąży.",
      "У матери нет ни антител анти-D, ни клеток памяти, поэтому беременность протекает благополучно. Иммуноглобулин вводят после каждых родов ребёнка с Rh+, а для профилактики — и во время беременности.",
    ),
  },
];

const MOTHER_CELLS: [number, number][] = [
  [36, 62],
  [82, 48],
  [122, 70],
  [46, 118],
  [104, 126],
];
const FETAL_CELLS: [number, number][] = [
  [200, 62],
  [244, 50],
  [284, 72],
  [210, 118],
  [264, 124],
];
const LEAKED: [number, number][] = [
  [72, 92],
  [128, 104],
];

function Conflict({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const [prevent, setPrevent] = useState(false);
  const steps = prevent ? CONFLICT.prevented : CONFLICT.plain;
  const step = steps[i]!;
  const leaked = i >= 1 && !(prevent && i >= 2);
  const injected = prevent && i === 2;
  const motherAb = !prevent && i >= 2;
  const crossing = !prevent && i === 3;
  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={prevent} onChange={(e) => setPrevent(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
        💉 {lang === "pl" ? "Z profilaktyką (immunoglobulina anty-D)" : "С профилактикой (иммуноглобулин анти-D)"}
      </label>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 320 170" className="w-full" role="img" aria-label={step.name[lang]}>
            <rect x={6} y={18} width={146} height={146} rx={12} fill="#fff1f2" />
            <rect x={152} y={18} width={20} height={146} fill="#f9a8d4" />
            <rect x={172} y={18} width={142} height={146} rx={12} fill="#fef3c7" />
            <text x={78} y={12} textAnchor="middle" fontSize={10} fontWeight={600} fill="#9f1239">
              {lang === "pl" ? "krew matki (Rh−)" : "кровь матери (Rh−)"}
            </text>
            <text x={162} y={12} textAnchor="middle" fontSize={9} fill="#9d174d">
              {lang === "pl" ? "łożysko" : "плацента"}
            </text>
            <text x={244} y={12} textAnchor="middle" fontSize={10} fontWeight={600} fill="#92400e">
              {lang === "pl" ? "krew płodu (Rh+)" : "кровь плода (Rh+)"}
            </text>
            {MOTHER_CELLS.map(([x, y]) => (
              <circle key={`m${x}`} cx={x} cy={y} r={12} fill="#dc2626" stroke="#7f1d1d" />
            ))}
            {FETAL_CELLS.map(([x, y]) =>
              crossing ? (
                <g key={`f${x}`} fill="#fca5a5" stroke="#b91c1c">
                  <path d={`M${x - 12} ${y} A12 12 0 0 1 ${x - 2} ${y - 11} L ${x - 4} ${y} Z`} />
                  <path d={`M${x + 2} ${y + 2} A12 12 0 0 0 ${x + 12} ${y - 4} L ${x + 4} ${y - 2} Z`} />
                  <path d={`M${x - 8} ${y + 10} L ${x + 6} ${y + 9} L ${x} ${y + 4} Z`} />
                </g>
              ) : (
                <g key={`f${x}`}>
                  <circle cx={x} cy={y} r={12} fill="#dc2626" stroke="#7f1d1d" />
                  <circle cx={x} cy={y + 14} r={3.5} fill={ANTI_D} />
                </g>
              ),
            )}
            {leaked &&
              LEAKED.map(([x, y]) => (
                <g key={`l${x}`} opacity={injected ? 0.35 : 1}>
                  <circle cx={x} cy={y} r={12} fill="#dc2626" stroke="#f59e0b" strokeWidth={2.5} />
                  <circle cx={x} cy={y + 14} r={3.5} fill={ANTI_D} />
                </g>
              ))}
            {injected && LEAKED.map(([x, y]) => <Yab key={`i${x}`} x={x + 15} y={y - 8} color="#059669" />)}
            {motherAb &&
              [
                [26, 92],
                [100, 90],
                [60, 146],
                [134, 40],
              ].map(([x, y]) => <Yab key={`a${x}`} x={x!} y={y!} color={ANTI_D} />)}
            {crossing &&
              [
                [162, 70],
                [190, 92],
                [232, 88],
                [276, 98],
              ].map(([x, y]) => <Yab key={`c${x}`} x={x!} y={y!} color={ANTI_D} />)}
          </svg>
          <div className="mt-2 flex flex-wrap gap-2">
            {steps.map((s, k) => (
              <Choice key={s.name.pl + k} state={k === i ? "active" : "idle"} onClick={() => setI(k)}>
                {k + 1}. {s.name[lang]}
              </Choice>
            ))}
          </div>
        </div>
        <div className="space-y-3" aria-live="polite">
          <h3 className="text-base font-semibold text-slate-900">{step.name[lang]}</h3>
          <p className="text-[15px] leading-relaxed text-slate-700">{step.text[lang]}</p>
          <p className="text-xs text-slate-500">
            <span style={{ color: ANTI_D }}>●</span> {lang === "pl" ? "antygen D" : "антиген D"} · <span style={{ color: ANTI_D }}>Y</span> {lang === "pl" ? "przeciwciała anty-D matki" : "антитела анти-D матери"}
            {prevent && (
              <>
                {" "}
                · <span className="text-emerald-600">Y</span> {lang === "pl" ? "anty-D z zastrzyku" : "анти-D из укола"}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Krew = osocze (ok. 55%) + elementy morfotyczne (ok. 45%).", ru: "Кровь = плазма (около 55%) + форменные элементы (около 45%)." },
    { pl: "Osocze pozbawione fibrynogenu to surowica.", ru: "Плазма без фибриногена — это сыворотка." },
  ],
  s2: [{ pl: "Erytrocyty transportują tlen, leukocyty bronią organizmu, trombocyty biorą udział w krzepnięciu; wszystkie powstają w czerwonym szpiku kostnym.", ru: "Эритроциты переносят кислород, лейкоциты защищают организм, тромбоциты участвуют в свёртывании; все они образуются в красном костном мозге." }],
  s3: [
    { pl: "Do krzepnięcia potrzebne są jony wapnia i witamina K — z jej udziałem wątroba wytwarza protrombinę.", ru: "Для свёртывания нужны ионы кальция и витамин K — с его участием печень вырабатывает протромбин." },
    { pl: "Rozpuszczalny fibrynogen przechodzi w nierozpuszczalne włókna fibryny.", ru: "Растворимый фибриноген превращается в нерастворимые нити фибрина." },
  ],
  s4: [
    { pl: "Na erytrocytach są antygeny (A, B, D), a w osoczu — przeciwciała przeciw tym antygenom układu AB0, których brak na własnych krwinkach.", ru: "На эритроцитах есть антигены (A, B, D), а в плазме — антитела к тем антигенам системы AB0, которых нет на собственных эритроцитах." },
    { pl: "0 Rh− to uniwersalny dawca krwinek, AB Rh+ — uniwersalny biorca.", ru: "0 Rh− — универсальный донор эритроцитов, AB Rh+ — универсальный реципиент." },
  ],
  s5: [{ pl: "Konflikt serologiczny grozi, gdy matka jest Rh−, a płód Rh+; zapobiega mu immunoglobulina anty-D podana matce.", ru: "Резус-конфликт возможен, когда мать Rh−, а плод Rh+; его предотвращает иммуноглобулин анти-D, введённый матери." }],
};

export default function BloodLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="blood" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="blood-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <TestTube lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="blood-s2" n={2} title={T.s2[lang]}>
        <CompareTabs lang={lang} cards={cells(lang)} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="blood-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.s3} start={r("uszkodzenie naczynia", "повреждение сосуда")} steps={CLOTTING} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="blood-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Transfusion lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="blood-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Conflict lang={lang} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
