// Lesson for LO3 §2.1 "Układ powłokowy u zwierząt" (zakres rozszerzony). Structures and groups follow
// templates/data/skin.ts (ANIMAL_INTEGUMENT, ANIMAL_GROUPS).
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, TwoWaySort, type CompareCard, type QuizItem, type QuizOption, type SortItem } from "@portal/lessons";
import { num, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Powłoka ciała to granica między zwierzęciem a środowiskiem: chroni przed urazami i drobnoustrojami, ogranicza utratę wody, a u niektórych zwierząt służy też do oddychania. Jej budowa zależy od środowiska — inna jest u dżdżownicy w wilgotnej glebie, a inna u jaszczurki na pustyni.",
    "Покров тела — граница между животным и средой: он защищает от травм и микробов, ограничивает потерю воды, а у некоторых животных служит и для дыхания. Его строение зависит от среды — у дождевого червя во влажной почве он один, у ящерицы в пустыне — другой.",
  ),
  s1: r("Powłoki w świecie zwierząt", "Покровы в мире животных"),
  s1intro: r(
    "Przekroje powłok różnych grup zwierząt. U kręgowców skóra zawsze składa się z naskórka i skóry właściwej, a różnią się jej wytwory i gruczoły.",
    "Разрезы покровов разных групп животных. У позвоночных кожа всегда состоит из эпидермиса и дермы, а различаются её производные и железы.",
  ),
  s2: r("Linienie stawonogów", "Линька членистоногих"),
  s2intro: r(
    "Sztywny pancerz chitynowy nie rośnie razem ze zwierzęciem. Przesuwaj czas i porównaj wzrost stawonoga ze wzrostem kręgowca.",
    "Жёсткий хитиновый панцирь не растёт вместе с животным. Сдвигай время и сравни рост членистоногого с ростом позвоночного.",
  ),
  s3: r("Czyja to powłoka?", "Чей это покров?"),
  s3intro: r("Po opisie powłoki lub jej wytworu rozpoznaj grupę zwierząt.", "По описанию покрова или его производного определи группу животных."),
  s4: r("Powłoka a środowisko życia", "Покров и среда обитания"),
  s4intro: r(
    "Zwierzęta lądowe muszą chronić się przed wysychaniem, a wodne i żyjące w wilgoci — korzystają z wody wokół siebie.",
    "Наземным животным нужно защищаться от высыхания, а водные и живущие во влаге используют воду вокруг себя.",
  ),
} satisfies Record<string, Txt>;

// ---------- cross-sections ----------

function Frame({ label, children, bg }: { label: string; children: ReactNode; bg: string }) {
  return (
    <svg viewBox="0 0 160 110" className="w-full" role="img" aria-label={label}>
      <rect width={160} height={110} rx={8} fill={bg} />
      {children}
    </svg>
  );
}

const cells = (y: number, h: number, fill: string, stroke: string, w = 16) =>
  Array.from({ length: Math.ceil(160 / w) }, (_, k) => <rect key={k} x={k * w} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={0.8} />);

function AnnelidArt({ label }: { label: string }) {
  return (
    <Frame label={label} bg="#fef3c7">
      <rect y={18} width={160} height={6} fill="#bae6fd" opacity={0.9} />
      <rect y={24} width={160} height={3} fill="#78350f" />
      {cells(27, 20, "#fde68a", "#a16207")}
      {[24, 72, 120].map((x) => (
        <ellipse key={x} cx={x + 8} cy={36} rx={5} ry={8} fill="white" stroke="#0284c7" />
      ))}
      <rect y={47} width={160} height={20} fill="#fda4af" />
      <rect y={67} width={160} height={30} fill="#fb7185" />
      <path d="M96 27 L 104 6" stroke="#57534e" strokeWidth={2.5} strokeLinecap="round" />
    </Frame>
  );
}

function ArthropodArt({ label }: { label: string }) {
  return (
    <Frame label={label} bg="#f1f5f9">
      {[0, 56, 112].map((x) => (
        <path key={x} d={`M${x + 2} 22 L ${x + 52} 22 L ${x + 54} 44 L ${x} 44 Z`} fill="#b45309" stroke="#78350f" strokeWidth={1.5} />
      ))}
      {[30, 86, 140].map((x) => (
        <path key={x} d={`M${x} 22 L ${x + 3} 10`} stroke="#78350f" strokeWidth={1.5} />
      ))}
      {cells(44, 10, "#fde68a", "#a16207")}
      <path d="M20 44 L 20 54 M136 44 L 136 54" stroke="#78350f" strokeWidth={3} />
      <path d="M20 58 C 50 74, 106 74, 136 58" stroke="#e11d48" strokeWidth={10} fill="none" strokeLinecap="round" />
    </Frame>
  );
}

function FishArt({ label }: { label: string }) {
  return (
    <Frame label={label} bg="#e0f2fe">
      <rect y={24} width={160} height={4} fill="#93c5fd" />
      {cells(28, 10, "#fef9c3", "#a16207", 12)}
      <rect y={38} width={160} height={50} fill="#fed7aa" />
      {[0, 30, 60, 90, 120].map((x) => (
        <path key={x} d={`M${x + 6} 70 Q ${x + 30} 30 ${x + 52} 40 L ${x + 44} 52 Q ${x + 26} 46 ${x + 10} 74 Z`} fill="#e2e8f0" stroke="#64748b" strokeWidth={1.2} />
      ))}
      <circle cx={30} cy={32} r={3} fill="white" stroke="#0284c7" />
      <circle cx={102} cy={32} r={3} fill="white" stroke="#0284c7" />
    </Frame>
  );
}

function AmphibianArt({ label }: { label: string }) {
  return (
    <Frame label={label} bg="#ecfccb">
      <rect y={20} width={160} height={5} fill="#7dd3fc" opacity={0.8} />
      {cells(25, 8, "#d9f99d", "#4d7c0f", 12)}
      <rect y={33} width={160} height={60} fill="#fef3c7" />
      {[24, 112].map((x) => (
        <g key={x}>
          <circle cx={x} cy={50} r={9} fill="white" stroke="#0284c7" strokeWidth={1.5} />
          <path d={`M${x} 41 L ${x} 33`} stroke="#0284c7" strokeWidth={2} />
        </g>
      ))}
      <circle cx={70} cy={62} r={16} fill="#fde047" stroke="#a16207" strokeWidth={1.5} />
      <path d="M70 46 L 70 33" stroke="#a16207" strokeWidth={2} />
      {[10, 40, 90, 136, 150].map((x) => (
        <circle key={x} cx={x} cy={37} r={2.5} fill="#ef4444" />
      ))}
      <path d="M0 86 C 40 80, 120 92, 160 84" stroke="#ef4444" strokeWidth={3} fill="none" />
    </Frame>
  );
}

function ReptileArt({ label }: { label: string }) {
  return (
    <Frame label={label} bg="#fefce8">
      {[0, 32, 64, 96, 128].map((x) => (
        <path key={x} d={`M${x} 40 Q ${x + 2} 16 ${x + 30} 18 L ${x + 38} 40 Z`} fill="#65a30d" stroke="#365314" strokeWidth={1.5} />
      ))}
      {cells(40, 10, "#d9f99d", "#4d7c0f", 12)}
      <rect y={50} width={160} height={42} fill="#fed7aa" />
      <path d="M0 76 C 40 70, 120 82, 160 74" stroke="#ef4444" strokeWidth={2} fill="none" />
    </Frame>
  );
}

function BirdArt({ label }: { label: string }) {
  return (
    <Frame label={label} bg="#f0f9ff">
      <path d="M56 70 C 52 50, 54 30, 70 4" stroke="#475569" strokeWidth={2} fill="none" />
      <path d="M57 62 C 30 50, 34 26, 68 8 C 70 30, 64 50, 57 62 Z" fill="#c7d2fe" stroke="#4338ca" strokeWidth={1} />
      <path d="M58 62 C 84 48, 92 26, 70 6" fill="none" stroke="#4338ca" strokeWidth={1} />
      <path d="M58 62 C 82 46, 88 28, 70 6 L 66 30 Z" fill="#a5b4fc" />
      {[110, 130].map((x) => (
        <g key={x} stroke="#94a3b8" strokeWidth={1} fill="none">
          <path d={`M${x} 64 q -8 -14 -14 -16 M${x} 64 q 0 -16 -2 -20 M${x} 64 q 8 -14 14 -16`} />
        </g>
      ))}
      {cells(64, 6, "#fef3c7", "#a16207", 12)}
      <rect y={70} width={160} height={30} fill="#fed7aa" />
      <rect x={52} y={60} width={10} height={24} rx={5} fill="#fde68a" stroke="#a16207" />
    </Frame>
  );
}

function MammalArt({ label }: { label: string }) {
  return (
    <Frame label={label} bg="#fff7ed">
      {cells(18, 6, "#e7e5e4", "#78716c", 12)}
      {cells(24, 12, "#fde68a", "#a16207", 12)}
      <rect y={36} width={160} height={46} fill="#fecdd3" />
      <rect y={82} width={160} height={28} fill="#fef9c3" />
      {[90, 110, 130, 150].map((x) => (
        <circle key={x} cx={x - 6} cy={96} r={7} fill="#fef08a" stroke="#ca8a04" />
      ))}
      <path d="M44 72 L 40 18 L 30 2" stroke="#44403c" strokeWidth={3} fill="none" />
      <rect x={36} y={30} width={12} height={46} rx={6} fill="none" stroke="#a16207" strokeWidth={1.5} />
      <ellipse cx={56} cy={46} rx={7} ry={5} fill="#fcd34d" stroke="#a16207" />
      <path d="M118 18 L 118 50" stroke="#0284c7" strokeWidth={2} />
      <path d="M118 50 c 8 0 8 8 0 8 c -8 0 -8 8 0 8 c 8 0 8 8 0 8" stroke="#0284c7" strokeWidth={2} fill="none" />
    </Frame>
  );
}

const L = {
  cover: r("Okrycie ciała", "Покров тела"),
  glands: r("Gruczoły", "Железы"),
  growth: r("Wytwory", "Производные"),
  extra: r("Dodatkowa rola", "Дополнительная роль"),
};

const groupCards = (lang: BioLang): CompareCard[] => [
  {
    id: "annelids",
    icon: "🪱",
    name: r("Pierścienice", "Кольчатые черви"),
    art: <AnnelidArt label={r("Pierścienice", "Кольчатые черви")[lang]} />,
    rows: [
      { label: L.cover, value: r("jednowarstwowy nabłonek pokryty cienką kutykulą", "однослойный эпителий, покрытый тонкой кутикулой") },
      { label: L.glands, value: r("liczne komórki śluzowe — śluz utrzymuje wilgotność ciała", "многочисленные слизистые клетки — слизь сохраняет тело влажным") },
      { label: L.growth, value: r("szczecinki ułatwiające poruszanie się", "щетинки, облегчающие передвижение") },
      { label: L.extra, value: r("oddychanie skórne przez wilgotną powierzchnię ciała", "кожное дыхание через влажную поверхность тела") },
    ],
    text: r("Pod nabłonkiem leżą mięśnie okrężne i podłużne — razem tworzą wór powłokowo-mięśniowy.", "Под эпителием лежат кольцевые и продольные мышцы — вместе они образуют кожно-мускульный мешок."),
  },
  {
    id: "arthropods",
    icon: "🦀",
    name: r("Stawonogi", "Членистоногие"),
    art: <ArthropodArt label={r("Stawonogi", "Членистоногие")[lang]} />,
    rows: [
      { label: L.cover, value: r("nabłonek wydzielający kutykulę z chityną — sztywny pancerz (szkielet zewnętrzny); u skorupiaków wysycony węglanem wapnia", "эпителий, выделяющий кутикулу с хитином, — жёсткий панцирь (наружный скелет); у ракообразных пропитан карбонатом кальция") },
      { label: L.glands, value: r("u owadów woskowa warstwa kutykuli ogranicza parowanie", "у насекомых восковой слой кутикулы снижает испарение") },
      { label: L.growth, value: r("włoski, kolce, łuseczki na skrzydłach motyli", "волоски, шипы, чешуйки на крыльях бабочек") },
      { label: L.extra, value: r("miejsce przyczepu mięśni; wzrost możliwy tylko dzięki linieniu", "место прикрепления мышц; рост возможен только благодаря линьке") },
    ],
  },
  {
    id: "fish",
    icon: "🐟",
    name: r("Ryby", "Рыбы"),
    art: <FishArt label={r("Ryby", "Рыбы")[lang]} />,
    rows: [
      { label: L.cover, value: r("skóra z cienkim naskórkiem i skórą właściwą, w której tkwią łuski kostne ułożone dachówkowato", "кожа с тонким эпидермисом и дермой, в которой сидит черепицеобразно лежащая костная чешуя") },
      { label: L.glands, value: r("liczne gruczoły śluzowe", "многочисленные слизистые железы") },
      { label: L.growth, value: r("łuski kostne — wytwór skóry właściwej", "костная чешуя — производное дермы") },
      { label: L.extra, value: r("śluz zmniejsza tarcie w wodzie i chroni przed drobnoustrojami", "слизь уменьшает трение в воде и защищает от микробов") },
    ],
  },
  {
    id: "amphibians",
    icon: "🐸",
    name: r("Płazy", "Земноводные"),
    art: <AmphibianArt label={r("Płazy", "Земноводные")[lang]} />,
    rows: [
      { label: L.cover, value: r("naga, cienka i wilgotna skóra, słabo zrogowaciała", "голая, тонкая и влажная кожа, слабо ороговевающая") },
      { label: L.glands, value: r("liczne gruczoły śluzowe i jadowe", "многочисленные слизистые и ядовитые железы") },
      { label: L.growth, value: r("brak łusek; komórki barwnikowe (chromatofory)", "чешуи нет; пигментные клетки (хроматофоры)") },
      { label: L.extra, value: r("oddychanie skórne dzięki gęstej sieci naczyń krwionośnych tuż pod naskórkiem", "кожное дыхание благодаря густой сети кровеносных сосудов прямо под эпидермисом") },
    ],
    text: r("Przez cienką skórę płaz łatwo traci wodę, dlatego większość płazów żyje w wilgotnych miejscach.", "Через тонкую кожу земноводное легко теряет воду, поэтому большинство земноводных живёт во влажных местах."),
  },
  {
    id: "reptiles",
    icon: "🦎",
    name: r("Gady", "Пресмыкающиеся"),
    art: <ReptileArt label={r("Gady", "Пресмыкающиеся")[lang]} />,
    rows: [
      { label: L.cover, value: r("sucha skóra z grubym, zrogowaciałym naskórkiem", "сухая кожа с толстым ороговевшим эпидермисом") },
      { label: L.glands, value: r("prawie brak gruczołów", "желёз почти нет") },
      { label: L.growth, value: r("łuski rogowe — wytwór naskórka; tarczki pancerza żółwi, pazury", "роговые чешуи — производное эпидермиса; щитки панциря черепах, когти") },
      { label: L.extra, value: r("chroni przed utratą wody — gady mogą żyć nawet na pustyniach; wąż zrzuca całą wylinkę", "защищает от потери воды — пресмыкающиеся живут даже в пустынях; змея сбрасывает выползок целиком") },
    ],
  },
  {
    id: "birds",
    icon: "🐦",
    name: r("Ptaki", "Птицы"),
    art: <BirdArt label={r("Ptaki", "Птицы")[lang]} />,
    rows: [
      { label: L.cover, value: r("cienka, sucha skóra pokryta piórami", "тонкая сухая кожа, покрытая перьями") },
      { label: L.glands, value: r("tylko gruczoł kuprowy — jego tłusta wydzielina natłuszcza pióra", "только копчиковая железа — её жировой секрет смазывает перья") },
      { label: L.growth, value: r("pióra, rogowe łuski na nogach, rogowa pochwa dzioba, pazury", "перья, роговые чешуи на ногах, роговой чехол клюва, когти") },
      { label: L.extra, value: r("pióra izolują cieplnie i tworzą powierzchnię nośną do lotu", "перья теплоизолируют и образуют несущую поверхность для полёта") },
    ],
  },
  {
    id: "mammals",
    icon: "🐻",
    name: r("Ssaki", "Млекопитающие"),
    art: <MammalArt label={r("Ssaki", "Млекопитающие")[lang]} />,
    rows: [
      { label: L.cover, value: r("wielowarstwowy, rogowaciejący naskórek, gruba skóra właściwa i tkanka podskórna", "многослойный ороговевающий эпидермис, толстая дерма и подкожная клетчатка") },
      { label: L.glands, value: r("potowe, łojowe, mlekowe i zapachowe", "потовые, сальные, млечные и пахучие") },
      { label: L.growth, value: r("włosy (sierść), pazury, paznokcie, kopyta, pochwy rogowe", "волосы (шерсть), когти, ногти, копыта, роговые чехлы") },
      { label: L.extra, value: r("termoregulacja (sierść, pot) i wydalanie", "терморегуляция (шерсть, пот) и выделение") },
    ],
  },
];

// ---------- molting ----------

const MOLTS = [22, 48, 76];
const SIZE0 = 0.6;
const GROW = 1.3;

function sizeAt(day: number) {
  // a fresh soft cuticle stretches for a couple of days after each molt
  let s = SIZE0;
  for (const m of MOLTS) {
    if (day >= m) s *= 1 + (GROW - 1) * Math.min(1, (day - m) / 2);
  }
  return s;
}
const vertebrateAt = (day: number) => SIZE0 + (SIZE0 * GROW ** 3 - SIZE0) * (day / 100);

const MOLT_T = {
  hard: r("Pancerz jest twardy — ciało nie może się powiększyć, choć zwierzę je i przybiera na masie.", "Панцирь твёрдый — тело не может увеличиться, хотя животное питается и набирает массу."),
  before: r("Pod starym pancerzem nabłonek wytwarza nową, miękką kutykulę. Linienie wyzwala hormon ekdyzon.", "Под старым панцирем эпителий образует новую мягкую кутикулу. Линьку запускает гормон экдизон."),
  molt: r("Linienie: stary pancerz pęka, a zwierzę wychodzi z niego — zostaje pusta wylinka.", "Линька: старый панцирь лопается, и животное выбирается из него — остаётся пустая шкурка (экзувий)."),
  soft: r("Nowy pancerz jest miękki: ciało szybko się powiększa, zanim kutykula stwardnieje. W tym czasie zwierzę jest bezbronne i się ukrywa.", "Новый панцирь мягкий: тело быстро увеличивается, пока кутикула не затвердела. В это время животное беззащитно и прячется."),
  day: r("Dzień", "День"),
  size: r("rozmiar ciała", "размер тела"),
  arthropod: r("stawonóg", "членистоногое"),
  vertebrate: r("kręgowiec", "позвоночное"),
  old: r("wylinka", "экзувий"),
};

function Molting({ lang }: { lang: BioLang }) {
  const [day, setDay] = useState(10);
  const s = sizeAt(day);
  const last = [...MOLTS].reverse().find((m) => day >= m);
  const next = MOLTS.find((m) => day < m);
  const phase = last !== undefined && day < last + 1 ? "molt" : last !== undefined && day < last + 5 ? "soft" : next !== undefined && day >= next - 4 ? "before" : "hard";
  const text = MOLT_T[phase];
  const gx = (d: number) => 30 + d * 2.6;
  const gy = (v: number) => 130 - (v - 0.4) * 60;
  const arthro = Array.from({ length: 201 }, (_, k) => k / 2).map((d, k) => `${k ? "L" : "M"}${gx(d).toFixed(1)} ${gy(sizeAt(d)).toFixed(1)}`).join(" ");
  const verte = `M${gx(0)} ${gy(vertebrateAt(0))} L ${gx(100)} ${gy(vertebrateAt(100))}`;
  const shell = phase === "soft" || phase === "molt" ? "#fde68a" : "#b45309";
  const showOld = last !== undefined && day < last + 12;
  const prev = last !== undefined ? sizeAt(last - 0.01) : SIZE0;
  const bug = (cx: number, size: number, fill: string, dashed?: boolean) => {
    const rx = 30 * size;
    const ry = 18 * size;
    return (
      <g opacity={dashed ? 0.7 : 1}>
        {[-0.5, 0, 0.5].map((f) => (
          <path
            key={f}
            d={`M${cx + f * rx} ${60 - ry * 0.6} L ${cx + f * rx * 1.2} ${60 - ry - 10 * size} M${cx + f * rx} ${60 + ry * 0.6} L ${cx + f * rx * 1.2} ${60 + ry + 10 * size}`}
            stroke={dashed ? "#a8a29e" : "#78350f"}
            strokeWidth={2}
            strokeDasharray={dashed ? "3 2" : undefined}
          />
        ))}
        <ellipse cx={cx} cy={60} rx={rx} ry={ry} fill={dashed ? "none" : fill} stroke={dashed ? "#a8a29e" : "#78350f"} strokeWidth={2} strokeDasharray={dashed ? "4 3" : undefined} />
        {[-0.5, 0, 0.5].map((f) => (
          <path key={`s${f}`} d={`M${cx + f * rx} ${60 - ry * 0.85} L ${cx + f * rx} ${60 + ry * 0.85}`} stroke={dashed ? "#a8a29e" : "#78350f"} strokeWidth={1} strokeDasharray={dashed ? "3 2" : undefined} />
        ))}
        {!dashed && <circle cx={cx + rx * 0.75} cy={60 - ry * 0.3} r={2.2} fill="#0f172a" />}
      </g>
    );
  };
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <svg viewBox="0 0 300 150" className="w-full" role="img" aria-label={`${MOLT_T.day[lang]} ${day}`}>
          <rect width={300} height={150} rx={10} fill="#f8fafc" />
          <path d="M30 10 L 30 132 L 292 132" stroke="#94a3b8" strokeWidth={1.5} fill="none" />
          <text x={12} y={70} fontSize={9} fill="#64748b" transform="rotate(-90 12 70)" textAnchor="middle">
            {MOLT_T.size[lang]}
          </text>
          {MOLTS.map((m) => (
            <path key={m} d={`M${gx(m)} 128 L ${gx(m)} 136`} stroke="#b45309" strokeWidth={2} />
          ))}
          <path d={verte} stroke="#64748b" strokeWidth={2} strokeDasharray="5 4" fill="none" />
          <path d={arthro} stroke="#d97706" strokeWidth={3} fill="none" />
          <path d={`M${gx(day)} 10 L ${gx(day)} 132`} stroke="#4f46e5" strokeWidth={1.5} />
          <circle cx={gx(day)} cy={gy(s)} r={4.5} fill="#d97706" stroke="white" strokeWidth={1.5} />
          <g fontSize={9}>
            <path d="M40 16 L 56 16" stroke="#d97706" strokeWidth={3} />
            <text x={60} y={19} fill="#334155">
              {MOLT_T.arthropod[lang]}
            </text>
            <path d="M40 30 L 56 30" stroke="#64748b" strokeWidth={2} strokeDasharray="5 4" />
            <text x={60} y={33} fill="#334155">
              {MOLT_T.vertebrate[lang]}
            </text>
          </g>
          <text x={292} y={146} textAnchor="end" fontSize={9} fill="#64748b">
            {MOLT_T.day[lang]}
          </text>
        </svg>
        <label className="block text-sm font-semibold text-slate-700">
          {MOLT_T.day[lang]}: <span className="tabular-nums">{day}</span>
          <input type="range" min={0} max={100} value={day} onChange={(e) => setDay(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-amber-600" />
        </label>
      </div>
      <div className="space-y-3">
        <svg viewBox="0 0 240 120" className="w-full" role="img" aria-label={text[lang]}>
          <rect width={240} height={120} rx={10} fill="#fffbeb" />
          {showOld && (
            <g>
              {bug(56, prev, "none", true)}
              <text x={56} y={114} textAnchor="middle" fontSize={9} fill="#78716c">
                {MOLT_T.old[lang]}
              </text>
            </g>
          )}
          {phase === "before" && <ellipse cx={164} cy={60} rx={30 * s * 0.94} ry={18 * s * 0.94} fill="#fde68a" opacity={0.6} />}
          {bug(164, s, shell)}
        </svg>
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-amber-950 ring-1 ring-amber-200" aria-live="polite">
          {text[lang]} <span className="text-amber-800">({MOLT_T.size[lang]}: ×{num(s / SIZE0, 2)})</span>
        </p>
      </div>
    </div>
  );
}

// ---------- whose covering ----------

const GROUP_OPTIONS: QuizOption[] = [
  { id: "annelids", label: r("pierścienice", "кольчатые черви") },
  { id: "arthropods", label: r("stawonogi", "членистоногие") },
  { id: "fish", label: r("ryby", "рыбы") },
  { id: "amphibians", label: r("płazy", "земноводные") },
  { id: "reptiles", label: r("gady", "пресмыкающиеся") },
  { id: "birds", label: r("ptaki", "птицы") },
  { id: "mammals", label: r("ssaki", "млекопитающие") },
];

const WHOSE: QuizItem[] = [
  { icon: "🛡️", name: r("pancerz chitynowy zrzucany podczas linienia", "хитиновый панцирь, сбрасываемый при линьке"), answer: "arthropods", explain: r("Chitynowy szkielet zewnętrzny mają stawonogi — owady, pajęczaki i skorupiaki.", "Хитиновый наружный скелет есть у членистоногих — насекомых, паукообразных и ракообразных.") },
  { icon: "🐚", name: r("łuski kostne ułożone dachówkowato i pokryte śluzem", "черепицеобразная костная чешуя, покрытая слизью"), answer: "fish", explain: r("Łuski kostne to wytwór skóry właściwej ryb.", "Костная чешуя — производное дермы рыб.") },
  { icon: "☠️", name: r("skóra z gruczołami jadowymi, przez którą zachodzi oddychanie", "кожа с ядовитыми железами, через которую идёт дыхание"), answer: "amphibians", explain: r("Płazy mają nagą, wilgotną skórę z gruczołami śluzowymi i jadowymi; oddychają nią i płucami.", "У земноводных голая влажная кожа со слизистыми и ядовитыми железами; они дышат ею и лёгкими.") },
  { icon: "🌵", name: r("sucha skóra z rogowymi łuskami, prawie bez gruczołów", "сухая кожа с роговыми чешуями, почти без желёз"), answer: "reptiles", explain: r("Rogowe łuski gadów chronią przed utratą wody na lądzie.", "Роговые чешуи пресмыкающихся защищают от потери воды на суше.") },
  { icon: "🪶", name: r("gruczoł kuprowy natłuszczający okrywę", "копчиковая железа, смазывающая покров"), answer: "birds", explain: r("To jedyny gruczoł skórny ptaków; natłuszczone pióra nie przemakają.", "Это единственная кожная железа птиц; смазанные перья не намокают.") },
  { icon: "🍼", name: r("skóra z gruczołami mlekowymi i potowymi", "кожа с млечными и потовыми железами"), answer: "mammals", explain: r("Gruczoły mlekowe — przekształcone gruczoły skórne — są cechą wszystkich ssaków.", "Млечные железы — видоизменённые кожные железы — признак всех млекопитающих.") },
  { icon: "💧", name: r("cienka kutykula na wilgotnym nabłonku pełnym komórek śluzowych", "тонкая кутикула на влажном эпителии со множеством слизистых клеток"), answer: "annelids", explain: r("Tak zbudowana jest powłoka dżdżownicy — wilgotna, bo przez nią oddycha.", "Так устроен покров дождевого червя — влажный, потому что через него он дышит.") },
  { icon: "🧥", name: r("włosy wyrastające z mieszków, z gruczołami łojowymi", "волосы, растущие из волосяных мешочков, с сальными железами"), answer: "mammals", explain: r("Włosy to rogowe wytwory naskórka ssaków; łój natłuszcza je i skórę.", "Волосы — роговые производные эпидермиса млекопитающих; кожное сало смазывает их и кожу.") },
  { icon: "🐍", name: r("wylinka zrzucana w całości, razem z łuską pokrywającą oczy", "выползок, сбрасываемый целиком вместе с чешуёй, закрывающей глаза"), answer: "reptiles", explain: r("Węże zrzucają zrogowaciałą warstwę naskórka w jednym kawałku.", "Змеи сбрасывают ороговевший слой эпидермиса одним куском.") },
];

// ---------- land vs water ----------

const HABITAT: SortItem[] = [
  { name: r("rogowe łuski jaszczurki", "роговые чешуи ящерицы"), group: 0, why: r("Zrogowaciały naskórek jest słabo przepuszczalny dla wody.", "Ороговевший эпидермис плохо пропускает воду.") },
  { name: r("woskowa warstwa kutykuli owadów", "восковой слой кутикулы насекомых"), group: 0, why: r("Wosk ogranicza parowanie przez pancerz.", "Воск ограничивает испарение через панцирь.") },
  { name: r("wielowarstwowy, rogowaciejący naskórek ssaków", "многослойный ороговевающий эпидермис млекопитающих"), group: 0, why: r("Martwe komórki z keratyną tworzą barierę dla wody.", "Мёртвые клетки с кератином образуют барьер для воды.") },
  { name: r("sucha skóra gadów bez gruczołów śluzowych", "сухая кожа пресмыкающихся без слизистых желёз"), group: 0, why: r("Brak wydzieliny na powierzchni oznacza mniejsze straty wody.", "Нет секрета на поверхности — меньше потери воды.") },
  { name: r("śluz pokrywający łuski ryby", "слизь, покрывающая чешую рыбы"), group: 1, why: r("Zmniejsza tarcie podczas pływania i chroni przed drobnoustrojami.", "Уменьшает трение при плавании и защищает от микробов.") },
  { name: r("cienka skóra żaby z gęstą siecią naczyń włosowatych", "тонкая кожа лягушки с густой сетью капилляров"), group: 1, why: r("Umożliwia oddychanie skórne, ale musi być stale wilgotna.", "Позволяет дышать кожей, но должна быть постоянно влажной.") },
  { name: r("wilgotny nabłonek dżdżownicy", "влажный эпителий дождевого червя"), group: 1, why: r("Tlen dyfunduje przez wilgotną powierzchnię ciała.", "Кислород диффундирует через влажную поверхность тела.") },
  { name: r("natłuszczone pióra kaczki", "смазанные жиром перья утки"), group: 1, why: r("Wydzielina gruczołu kuprowego sprawia, że pióra nie przemakają w wodzie.", "Секрет копчиковой железы делает перья непромокаемыми в воде.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Bezkręgowce mają jednowarstwowy nabłonek, często pokryty kutykulą; kręgowce — skórę z naskórka i skóry właściwej.", "У беспозвоночных однослойный эпителий, часто покрытый кутикулой; у позвоночных — кожа из эпидермиса и дермы."),
    r("Łuski rogowe, pióra i włosy to wytwory naskórka; łuski kostne ryb — wytwór skóry właściwej.", "Роговые чешуи, перья и волосы — производные эпидермиса; костная чешуя рыб — производное дермы."),
  ],
  s2: [r("Stawonogi rosną skokowo — tylko po linieniu, gdy nowy pancerz jest jeszcze miękki.", "Членистоногие растут скачками — только после линьки, пока новый панцирь ещё мягкий.")],
  s3: [r("Gruczoł kuprowy mają ptaki, gruczoły mlekowe — ssaki, gruczoły jadowe w skórze — płazy.", "Копчиковая железа есть у птиц, млечные железы — у млекопитающих, ядовитые кожные железы — у земноводных.")],
  s4: [r("Zwierzęta lądowe mają powłoki ograniczające parowanie; cienka, wilgotna skóra pozwala oddychać, ale wiąże zwierzę z wilgotnym środowiskiem.", "У наземных животных покровы снижают испарение; тонкая влажная кожа позволяет дышать, но привязывает животное к влажной среде.")],
};

export default function SkinAnimalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="skina" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="skina-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={groupCards(lang)} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="skina-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Molting lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="skina-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s3}
          question={r("Do kogo należy", "Кому принадлежит")}
          options={GROUP_OPTIONS}
          items={WHOSE}
          wrongHint={r("Ta grupa ma inną powłokę — przypomnij sobie zakładki z pierwszej części.", "У этой группы другой покров — вспомни вкладки из первой части.")}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="skina-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TwoWaySort
          lang={lang}
          title={r("Do czego służy ta cecha?", "Для чего нужен этот признак?")}
          groups={[r("chroni przed wysychaniem", "защищает от высыхания"), r("służy życiu w wodzie lub wilgoci", "помогает жить в воде или влаге")]}
          items={HABITAT}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
