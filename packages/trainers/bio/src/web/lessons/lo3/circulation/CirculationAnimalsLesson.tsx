// Lesson for LO3 §6.1 "Układ krążenia u zwierząt" (zakres rozszerzony). Terms follow
// templates/data/comparative.ts (ANIMAL_CIRCULATION).
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, OrderGame, type CompareCard } from "../../games.tsx";
import { Choice, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Małym zwierzętom wystarcza dyfuzja, ale u większych potrzebny jest układ krążenia, który rozprowadza tlen i składniki odżywcze. Może on być otwarty albo zamknięty, a u kręgowców serce zmieniało się od dwujamowego u ryb do czterojamowego u ptaków i ssaków.",
    "Мелким животным хватает диффузии, но крупным нужна кровеносная система, разносящая кислород и питательные вещества. Она бывает незамкнутой или замкнутой, а сердце позвоночных менялось от двухкамерного у рыб до четырёхкамерного у птиц и млекопитающих.",
  ),
  s1: r("Układ otwarty i zamknięty", "Незамкнутая и замкнутая системы"),
  s1intro: r("Przełącz układ i obserwuj, którędy płynie płyn ustrojowy.", "Переключай систему и следи, куда течёт жидкость тела."),
  s2: r("Serce kręgowców", "Сердце позвоночных"),
  s2intro: r("Niebieski kolor to krew odtlenowana, czerwony — utlenowana, fioletowy — krew mieszana.", "Синий цвет — венозная кровь, красный — артериальная, фиолетовый — смешанная."),
  s3: r("Jeden czy dwa obiegi krwi?", "Один или два круга кровообращения?"),
  s3intro: r("Porównaj ciśnienie krwi wzdłuż jej drogi u ryby i u ssaka.", "Сравни давление крови на её пути у рыбы и у млекопитающего."),
  s4: r("Droga krwi u ryby", "Путь крови у рыбы"),
  s4intro: r("Ułóż drogę krwi od komory serca ryby z powrotem do serca.", "Выстрой путь крови от желудочка сердца рыбы обратно к сердцу."),
} satisfies Record<string, Txt>;

// ---------- open vs closed ----------

const OC = {
  open: r("Otwarty (owad)", "Незамкнутая (насекомое)"),
  closed: r("Zamknięty (dżdżownica)", "Замкнутая (дождевой червь)"),
  rows: [
    {
      label: r("Przykłady", "Примеры"),
      open: r("stawonogi (owady, skorupiaki, pajęczaki), większość mięczaków", "членистоногие (насекомые, ракообразные, паукообразные), большинство моллюсков"),
      closed: r("pierścienice (dżdżownica), głowonogi, kręgowce", "кольчатые черви (дождевой червь), головоногие, позвоночные"),
    },
    {
      label: r("Płyn", "Жидкость"),
      open: r("hemolimfa — pełni rolę krwi i limfy", "гемолимфа — выполняет роль крови и лимфы"),
      closed: r("krew, oddzielona od płynu tkankowego ścianami naczyń", "кровь, отделённая от тканевой жидкости стенками сосудов"),
    },
    {
      label: r("Droga płynu", "Путь жидкости"),
      open: r("z serca naczyniem do jamy ciała, gdzie omywa narządy; wraca do serca przez otworki w jego ścianie", "из сердца по сосуду в полость тела, где омывает органы; возвращается в сердце через отверстия в его стенке"),
      closed: r("cały czas w naczyniach; wymiana substancji przez ściany naczyń włosowatych", "всё время по сосудам; обмен веществ через стенки капилляров"),
    },
    {
      label: r("Ciśnienie i przepływ", "Давление и ток"),
      open: r("niskie, przepływ powolny", "низкое, ток медленный"),
      closed: r("wyższe, przepływ szybki i łatwy do regulacji", "выше, ток быстрый и легко регулируется"),
    },
    {
      label: r("Pompa", "Насос"),
      open: r("u owadów — kurczliwe naczynie grzbietowe (serce)", "у насекомых — сократимый спинной сосуд (сердце)"),
      closed: r("u dżdżownicy — naczynie grzbietowe i 5 par pulsujących naczyń okrężnych („serc”)", "у дождевого червя — спинной сосуд и 5 пар пульсирующих кольцевых сосудов («сердец»)"),
    },
  ],
  openText: r(
    "U owadów hemolimfa prawie nie przenosi tlenu — robią to tchawki, więc niskie ciśnienie i powolny przepływ wystarczają. U skorupiaków i mięczaków tlen wiąże hemocyjanina zawierająca miedź.",
    "У насекомых гемолимфа почти не переносит кислород — это делают трахеи, поэтому низкого давления и медленного тока достаточно. У ракообразных и моллюсков кислород связывает гемоцианин, содержащий медь.",
  ),
  closedText: r(
    "Układ zamknięty szybko dostarcza tlen nawet do odległych narządów — mają go duże, aktywne zwierzęta, np. głowonogi. U dżdżownicy barwnik oddechowy (hemoglobina) jest rozpuszczony w osoczu.",
    "Замкнутая система быстро доставляет кислород даже к отдалённым органам — она есть у крупных активных животных, например у головоногих. У дождевого червя дыхательный пигмент (гемоглобин) растворён в плазме.",
  ),
};

/** dots that travel along a path; negative begin offsets spread them along it from the start */
function Flow({ path, n, dur, color, r: radius = 3.5 }: { path: string; n: number; dur: number; color: string; r?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, k) => (
        <circle key={k} r={radius} fill={color}>
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} begin={`-${((k * dur) / n).toFixed(2)}s`} />
        </circle>
      ))}
    </>
  );
}

function OpenClosed({ lang }: { lang: BioLang }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {[true, false].map((v) => (
          <Choice key={String(v)} state={open === v ? "active" : "idle"} onClick={() => setOpen(v)}>
            {v ? OC.open[lang] : OC.closed[lang]}
          </Choice>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {open ? (
          <svg key="open" viewBox="0 0 320 170" className="w-full" role="img" aria-label={OC.open[lang]}>
            <rect width={320} height={170} rx={12} fill="#f8fafc" />
            <ellipse cx={160} cy={92} rx={145} ry={60} fill="#ecfccb" stroke="#65a30d" strokeWidth={2} />
            <rect x={60} y={86} width={200} height={20} rx={10} fill="#fde68a" stroke="#ca8a04" />
            <ellipse cx={110} cy={130} rx={26} ry={10} fill="#fed7aa" stroke="#ea580c" />
            <ellipse cx={210} cy={130} rx={26} ry={10} fill="#fed7aa" stroke="#ea580c" />
            <path d="M40 52 L 280 52" stroke="#15803d" strokeWidth={9} strokeLinecap="round" />
            {[150, 190, 230, 270].map((x) => (
              <circle key={x} cx={x} cy={52} r={3} fill="#ecfccb" />
            ))}
            <Flow path="M276 52 L 44 52 C 24 72, 30 128, 80 146 C 140 160, 220 156, 246 136 C 262 116, 236 80, 230 56" n={7} dur={6} color="#4d7c0f" />
            <Flow path="M276 52 L 44 52 C 30 90, 70 118, 140 120 C 180 120, 200 92, 190 56" n={5} dur={5} color="#4d7c0f" />
            <Flow path="M276 52 L 44 52 C 40 70, 110 70, 150 74 C 170 76, 156 62, 150 56" n={4} dur={4} color="#4d7c0f" />
            <text x={150} y={36} textAnchor="middle" fontSize={10} fill="#166534" fontWeight={600}>
              {lang === "pl" ? "naczynie grzbietowe (serce)" : "спинной сосуд (сердце)"}
            </text>
            <text x={160} y={100} textAnchor="middle" fontSize={9} fill="#854d0e">
              {lang === "pl" ? "jelito" : "кишечник"}
            </text>
            <text x={160} y={166} textAnchor="middle" fontSize={10} fill="#3f6212">
              {lang === "pl" ? "hemolimfa w jamie ciała" : "гемолимфа в полости тела"}
            </text>
          </svg>
        ) : (
          <svg key="closed" viewBox="0 0 320 170" className="w-full" role="img" aria-label={OC.closed[lang]}>
            <rect width={320} height={170} rx={12} fill="#f8fafc" />
            <rect x={14} y={36} width={292} height={104} rx={52} fill="#fce7f3" stroke="#be185d" strokeWidth={2} />
            <path d="M40 56 L 290 56" stroke="#dc2626" strokeWidth={6} strokeLinecap="round" />
            <path d="M40 122 L 290 122" stroke="#dc2626" strokeWidth={6} strokeLinecap="round" />
            {[64, 76, 88, 100, 112].map((x) => (
              <path key={x} d={`M${x} 56 C ${x - 10} 80, ${x - 10} 100, ${x} 122`} stroke="#b91c1c" strokeWidth={5} fill="none">
                <animate attributeName="stroke-width" values="4;8;4" dur="1s" repeatCount="indefinite" />
              </path>
            ))}
            {[170, 220, 270].map((x) => (
              <path key={x} d={`M${x} 122 q 8 -11 0 -22 t 0 -22 t 0 -22`} stroke="#f87171" strokeWidth={1.8} fill="none" />
            ))}
            <Flow path="M286 56 L 76 56 C 66 80, 66 100, 76 122 L 270 122 q 8 -11 0 -22 t 0 -22 t 0 -22 L 286 56" n={8} dur={6} color="#7f1d1d" />
            <Flow path="M220 56 L 100 56 C 90 80, 90 100, 100 122 L 220 122 q 8 -11 0 -22 t 0 -22 t 0 -22" n={5} dur={4.5} color="#7f1d1d" />
            <text x={180} y={48} textAnchor="middle" fontSize={10} fill="#991b1b" fontWeight={600}>
              {lang === "pl" ? "naczynie grzbietowe" : "спинной сосуд"}
            </text>
            <text x={190} y={136} textAnchor="middle" fontSize={10} fill="#991b1b" fontWeight={600}>
              {lang === "pl" ? "naczynie brzuszne" : "брюшной сосуд"}
            </text>
            <text x={88} y={160} textAnchor="middle" fontSize={10} fill="#9f1239">
              {lang === "pl" ? "„serca” — naczynia okrężne" : "«сердца» — кольцевые сосуды"}
            </text>
            <text x={234} y={92} textAnchor="middle" fontSize={9} fill="#9f1239">
              {lang === "pl" ? "naczynia włosowate" : "капилляры"}
            </text>
          </svg>
        )}
        <div aria-live="polite">
          <table className="w-full text-sm">
            <tbody>
              {OC.rows.map((row) => (
                <tr key={row.label.pl} className="border-b border-slate-200 last:border-0">
                  <th scope="row" className="w-32 py-2 pr-3 text-left align-top font-medium text-slate-500">
                    {row.label[lang]}
                  </th>
                  <td className="py-2 text-slate-800">{(open ? row.open : row.closed)[lang]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-[15px] leading-relaxed text-emerald-950 ring-1 ring-emerald-200">{(open ? OC.openText : OC.closedText)[lang]}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- hearts ----------

const BLUE = "#60a5fa";
const RED = "#f87171";
const MIX = "#a78bfa";

function HeartArt({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 170" className="w-full" role="img" aria-label={label}>
      <defs>
        <linearGradient id="cira-mix3" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={BLUE} />
          <stop offset="0.5" stopColor={MIX} />
          <stop offset="1" stopColor={RED} />
        </linearGradient>
        <linearGradient id="cira-mixr" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0.3" stopColor={BLUE} />
          <stop offset="0.5" stopColor={MIX} />
          <stop offset="0.7" stopColor={RED} />
        </linearGradient>
      </defs>
      <rect width={200} height={170} rx={10} fill="#fff1f2" />
      {children}
    </svg>
  );
}

const lbl = (x: number, y: number, t: string) => (
  <text x={x} y={y} textAnchor="middle" fontSize={10} fontWeight={600} fill="#0f172a">
    {t}
  </text>
);

const HL = {
  chambers: r("Jamy serca", "Камеры сердца"),
  atria: r("Przedsionki", "Предсердия"),
  ventricles: r("Komory", "Желудочки"),
  blood: r("Krew w sercu", "Кровь в сердце"),
  circuits: r("Obiegi krwi", "Круги кровообращения"),
  temp: r("Temperatura ciała", "Температура тела"),
};

function hearts(lang: BioLang): CompareCard[] {
  const pl = lang === "pl";
  return [
    {
      id: "fish",
      icon: "🐟",
      name: r("Ryby", "Рыбы"),
      art: (
        <HeartArt label={pl ? "Serce ryby" : "Сердце рыбы"}>
          <rect x={14} y={70} width={30} height={34} rx={10} fill={BLUE} opacity={0.7} />
          <rect x={52} y={56} width={44} height={60} rx={16} fill={BLUE} stroke="#1e3a8a" strokeWidth={2} />
          <rect x={104} y={60} width={50} height={54} rx={14} fill={BLUE} stroke="#1e3a8a" strokeWidth={5} />
          <rect x={160} y={74} width={26} height={26} rx={13} fill={BLUE} stroke="#1e3a8a" strokeWidth={1.5} />
          {lbl(29, 124, pl ? "zatoka" : "синус")}
          {lbl(74, 48, pl ? "przedsionek" : "предсердие")}
          {lbl(129, 134, pl ? "komora" : "желудочек")}
          {lbl(173, 120, pl ? "opuszka" : "луковица")}
          <path d="M173 70 L 173 30 M166 38 L 173 30 L 180 38" stroke="#1e3a8a" strokeWidth={2.5} fill="none" />
          {lbl(150, 24, pl ? "do skrzeli" : "к жабрам")}
        </HeartArt>
      ),
      rows: [
        { label: HL.chambers, value: r("2 — serce dwujamowe", "2 — двухкамерное сердце") },
        { label: HL.atria, value: r("1", "1") },
        { label: HL.ventricles, value: r("1", "1") },
        { label: HL.blood, value: r("tylko odtlenowana (serce żylne)", "только венозная (венозное сердце)") },
        { label: HL.circuits, value: r("jeden obieg", "один круг") },
        { label: HL.temp, value: r("zmiennocieplne", "холоднокровные (пойкилотермные)") },
      ],
      text: r(
        "Krew w czasie pełnego obiegu przepływa przez serce tylko raz. Serce tłoczy krew odtlenowaną do skrzeli, a utlenowana płynie stamtąd do narządów, nie wracając do serca. Przed przedsionkiem leży zatoka żylna, za komorą — opuszka tętnicza.",
        "За полный оборот кровь проходит через сердце только один раз. Сердце гонит венозную кровь к жабрам, а оттуда артериальная кровь идёт к органам, не возвращаясь в сердце. Перед предсердием лежит венозный синус, за желудочком — артериальная луковица.",
      ),
    },
    {
      id: "amphibian",
      icon: "🐸",
      name: r("Płazy", "Земноводные"),
      art: (
        <HeartArt label={pl ? "Serce płaza" : "Сердце земноводного"}>
          <rect x={30} y={18} width={64} height={52} rx={16} fill={BLUE} stroke="#1e3a8a" strokeWidth={2} />
          <rect x={106} y={18} width={64} height={52} rx={16} fill={RED} stroke="#7f1d1d" strokeWidth={2} />
          <rect x={30} y={80} width={140} height={66} rx={22} fill="url(#cira-mix3)" stroke="#4c1d95" strokeWidth={5} />
          {lbl(62, 48, pl ? "PP" : "ПП")}
          {lbl(138, 48, pl ? "LP" : "ЛП")}
          {lbl(100, 118, pl ? "jedna komora" : "один желудочек")}
        </HeartArt>
      ),
      rows: [
        { label: HL.chambers, value: r("3 — serce trójjamowe", "3 — трёхкамерное сердце") },
        { label: HL.atria, value: r("2: do prawego wpływa krew odtlenowana (z domieszką utlenowanej ze skóry), do lewego — utlenowana z płuc", "2: в правое поступает венозная кровь (с примесью артериальной от кожи), в левое — артериальная из лёгких") },
        { label: HL.ventricles, value: r("1 — bez przegrody", "1 — без перегородки") },
        { label: HL.blood, value: r("w komorze krew częściowo się miesza", "в желудочке кровь частично смешивается") },
        { label: HL.circuits, value: r("dwa: płucno-skórny i ustrojowy", "два: лёгочно-кожный и большой (системный)") },
        { label: HL.temp, value: r("zmiennocieplne", "холоднокровные (пойкилотермные)") },
      ],
      text: r(
        "Mieszanie ograniczają fałdy ściany komory i budowa naczyń wychodzących z serca, ale narządy i tak dostają krew mieszaną. Braki tlenu uzupełnia oddychanie skórne.",
        "Смешивание ограничивают складки стенки желудочка и устройство отходящих от сердца сосудов, но органы всё равно получают смешанную кровь. Недостаток кислорода восполняет кожное дыхание.",
      ),
    },
    {
      id: "reptile",
      icon: "🦎",
      name: r("Gady", "Пресмыкающиеся"),
      art: (
        <HeartArt label={pl ? "Serce gada" : "Сердце пресмыкающегося"}>
          <rect x={30} y={18} width={64} height={52} rx={16} fill={BLUE} stroke="#1e3a8a" strokeWidth={2} />
          <rect x={106} y={18} width={64} height={52} rx={16} fill={RED} stroke="#7f1d1d" strokeWidth={2} />
          <rect x={30} y={80} width={140} height={66} rx={22} fill="url(#cira-mixr)" stroke="#4c1d95" strokeWidth={5} />
          <path d="M100 146 L 100 100" stroke="#4c1d95" strokeWidth={6} strokeLinecap="round" />
          {lbl(62, 48, pl ? "PP" : "ПП")}
          {lbl(138, 48, pl ? "LP" : "ЛП")}
          {lbl(100, 164, pl ? "niepełna przegroda" : "неполная перегородка")}
        </HeartArt>
      ),
      rows: [
        { label: HL.chambers, value: r("3 (u krokodyli 4)", "3 (у крокодилов 4)") },
        { label: HL.atria, value: r("2", "2") },
        { label: HL.ventricles, value: r("1 z niepełną przegrodą", "1 с неполной перегородкой") },
        { label: HL.blood, value: r("miesza się słabiej niż u płazów", "смешивается слабее, чем у земноводных") },
        { label: HL.circuits, value: r("dwa: płucny i ustrojowy", "два: лёгочный и большой (системный)") },
        { label: HL.temp, value: r("zmiennocieplne", "холоднокровные (пойкилотермные)") },
      ],
      text: r("Krokodyle mają już całkowitą przegrodę między komorami, czyli serce czterojamowe.", "У крокодилов уже полная перегородка между желудочками, то есть четырёхкамерное сердце."),
    },
    {
      id: "bird-mammal",
      icon: "🐦",
      name: r("Ptaki i ssaki", "Птицы и млекопитающие"),
      art: (
        <HeartArt label={pl ? "Serce ptaka i ssaka" : "Сердце птицы и млекопитающего"}>
          <rect x={30} y={18} width={64} height={52} rx={16} fill={BLUE} stroke="#1e3a8a" strokeWidth={2} />
          <rect x={106} y={18} width={64} height={52} rx={16} fill={RED} stroke="#7f1d1d" strokeWidth={2} />
          <rect x={30} y={80} width={66} height={66} rx={20} fill={BLUE} stroke="#1e3a8a" strokeWidth={3} />
          <rect x={104} y={80} width={66} height={66} rx={20} fill={RED} stroke="#7f1d1d" strokeWidth={7} />
          {lbl(62, 48, pl ? "PP" : "ПП")}
          {lbl(138, 48, pl ? "LP" : "ЛП")}
          {lbl(63, 118, pl ? "PK" : "ПЖ")}
          {lbl(137, 118, pl ? "LK" : "ЛЖ")}
          {lbl(100, 164, pl ? "przegroda całkowita" : "полная перегородка")}
        </HeartArt>
      ),
      rows: [
        { label: HL.chambers, value: r("4 — serce czterojamowe", "4 — четырёхкамерное сердце") },
        { label: HL.atria, value: r("2", "2") },
        { label: HL.ventricles, value: r("2 — przegroda całkowita", "2 — перегородка полная") },
        { label: HL.blood, value: r("utlenowana i odtlenowana nie mieszają się", "артериальная и венозная не смешиваются") },
        { label: HL.circuits, value: r("dwa: płucny (mały) i ustrojowy (duży)", "два: лёгочный (малый) и большой (системный)") },
        { label: HL.temp, value: r("stałocieplne", "теплокровные (гомойотермные)") },
      ],
      text: r(
        "Całkowity rozdział krwi zapewnia narządom krew bogatą w tlen — to warunek intensywnej przemiany materii i stałocieplności. Krew z lewej komory wyprowadza u ptaków prawy łuk aorty, a u ssaków — lewy.",
        "Полное разделение крови обеспечивает органы кровью, богатой кислородом, — это условие интенсивного обмена веществ и теплокровности. Кровь из левого желудочка выводит у птиц правая дуга аорты, а у млекопитающих — левая.",
      ),
    },
  ];
}

// ---------- one vs two circuits ----------

interface Station {
  name: Txt;
  /** relative pressure, 0–100, at this point of the route */
  p: number;
  pump?: boolean;
}

const FISH_ROUTE: Station[] = [
  { name: r("komora", "желудочек"), p: 45, pump: true },
  { name: r("aorta brzuszna", "брюшная аорта"), p: 40 },
  { name: r("skrzela", "жабры"), p: 30 },
  { name: r("aorta grzbietowa", "спинная аорта"), p: 20 },
  { name: r("narządy", "органы"), p: 12 },
  { name: r("żyły", "вены"), p: 4 },
];

const MAMMAL_ROUTE: Station[] = [
  { name: r("prawa komora", "правый желудочек"), p: 25, pump: true },
  { name: r("płuca", "лёгкие"), p: 12 },
  { name: r("żyły płucne", "лёгочные вены"), p: 6 },
  { name: r("lewa komora", "левый желудочек"), p: 100, pump: true },
  { name: r("aorta", "аорта"), p: 95 },
  { name: r("narządy", "органы"), p: 30 },
  { name: r("żyły", "вены"), p: 5 },
];

const CIRC = {
  fish: r("🐟 Ryba — jeden obieg", "🐟 Рыба — один круг"),
  mammal: r("🐕 Ssak — dwa obiegi", "🐕 Млекопитающее — два круга"),
  axis: r("ciśnienie krwi (względne)", "давление крови (относительное)"),
  pump: r("serce", "сердце"),
  fishText: r(
    "Serce nadaje krwi ciśnienie tylko raz. W naczyniach włosowatych skrzeli krew traci jego dużą część, więc do narządów płynie powoli i pod niskim ciśnieniem. Rybie, zmiennocieplnej i o wolniejszej przemianie materii, to wystarcza.",
    "Сердце создаёт давление только один раз. В капиллярах жабр кровь теряет значительную его часть, поэтому к органам она течёт медленно и под низким давлением. Рыбе — холоднокровной и с более медленным обменом веществ — этого достаточно.",
  ),
  mammalText: r(
    "Po przejściu przez płuca krew wraca do serca i lewa komora ponownie nadaje jej wysokie ciśnienie — tlen szybko dociera do wszystkich narządów. Płuca dostają krew pod niskim ciśnieniem, co chroni delikatne pęcherzyki.",
    "Пройдя через лёгкие, кровь возвращается в сердце, и левый желудочек снова создаёт высокое давление — кислород быстро доходит до всех органов. Лёгкие получают кровь под низким давлением, что бережёт нежные альвеолы.",
  ),
};

function Circuits({ lang }: { lang: BioLang }) {
  const [fish, setFish] = useState(true);
  const route = fish ? FISH_ROUTE : MAMMAL_ROUTE;
  const n = route.length;
  const x = (k: number) => 76 + (k * 226) / (n - 1);
  const y = (p: number) => 150 - p * 1.2;
  const d = route.map((s, k) => `${k ? "L" : "M"}${x(k)} ${y(s.p)}`).join(" ");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {[true, false].map((v) => (
          <Choice key={String(v)} state={fish === v ? "active" : "idle"} onClick={() => setFish(v)}>
            {v ? CIRC.fish[lang] : CIRC.mammal[lang]}
          </Choice>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 320 220" className="w-full" role="img" aria-label={(fish ? CIRC.fish : CIRC.mammal)[lang]}>
          <rect width={320} height={220} rx={10} fill="#f8fafc" />
          <path d="M30 150 L 310 150" stroke="#94a3b8" />
          <text x={8} y={16} fontSize={9} fill="#64748b">
            ↑ {CIRC.axis[lang]}
          </text>
          {route.map((s, k) => (
            <g key={s.name.pl}>
              <path d={`M${x(k)} 150 L ${x(k)} ${y(s.p)}`} stroke={s.pump ? "#e11d48" : "#cbd5e1"} strokeWidth={s.pump ? 3 : 1.5} strokeDasharray={s.pump ? undefined : "3 3"} />
              <text
                x={x(k)}
                y={164}
                fontSize={9}
                fill="#334155"
                textAnchor="end"
                transform={`rotate(-35 ${x(k)} 164)`}
                fontWeight={s.pump ? 700 : 400}
              >
                {s.name[lang]}
              </text>
              {s.pump && (
                <text x={x(k)} y={y(s.p) - 8} textAnchor="middle" fontSize={14}>
                  ❤️
                </text>
              )}
            </g>
          ))}
          <path d={d} fill="none" stroke="#dc2626" strokeWidth={3} strokeLinejoin="round" />
          {route.map((s, k) => (
            <circle key={s.name.pl} cx={x(k)} cy={y(s.p)} r={4} fill={s.pump ? "#e11d48" : "#dc2626"} />
          ))}
        </svg>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          {(fish ? CIRC.fishText : CIRC.mammalText)[lang]}
        </p>
      </div>
    </div>
  );
}

// ---------- fish route ----------

const FISH_PATH: Txt[] = [
  r("opuszka tętnicza", "артериальная луковица"),
  r("aorta brzuszna", "брюшная аорта"),
  r("naczynia włosowate skrzeli", "капилляры жабр"),
  r("aorta grzbietowa", "спинная аорта"),
  r("naczynia włosowate narządów", "капилляры органов"),
  r("żyły", "вены"),
  r("zatoka żylna", "венозный синус"),
  r("przedsionek", "предсердие"),
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "W układzie otwartym hemolimfa wylewa się do jamy ciała, w zamkniętym krew cały czas płynie w naczyniach.", ru: "В незамкнутой системе гемолимфа изливается в полость тела, в замкнутой кровь всё время течёт по сосудам." },
    { pl: "Układ zamknięty mają pierścienice, głowonogi i kręgowce; otwarty — stawonogi i większość mięczaków.", ru: "Замкнутая система у кольчатых червей, головоногих и позвоночных; незамкнутая — у членистоногих и большинства моллюсков." },
  ],
  s2: [
    { pl: "Ryby: serce dwujamowe; płazy: trójjamowe; gady: trójjamowe z niepełną przegrodą; ptaki i ssaki: czterojamowe.", ru: "Рыбы: двухкамерное сердце; земноводные: трёхкамерное; пресмыкающиеся: трёхкамерное с неполной перегородкой; птицы и млекопитающие: четырёхкамерное." },
    { pl: "Całkowity rozdział krwi utlenowanej i odtlenowanej umożliwia stałocieplność ptaków i ssaków.", ru: "Полное разделение артериальной и венозной крови делает возможной теплокровность птиц и млекопитающих." },
  ],
  s3: [{ pl: "Ryby mają jeden obieg krwi; kręgowce oddychające płucami — dwa: płucny i ustrojowy.", ru: "У рыб один круг кровообращения; у позвоночных, дышащих лёгкими, — два: лёгочный и большой." }],
  s4: [{ pl: "Serce ryby zawiera tylko krew odtlenowaną; utlenowana krew ze skrzeli płynie do narządów bez powrotu do serca.", ru: "В сердце рыбы только венозная кровь; артериальная кровь из жабр идёт к органам, не возвращаясь в сердце." }],
};

export default function CirculationAnimalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="cira" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="cira-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <OpenClosed lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="cira-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={hearts(lang)} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="cira-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Circuits lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="cira-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.s4} start={r("komora serca", "желудочек сердца")} steps={FISH_PATH} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
