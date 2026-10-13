// Lesson for LO3 §8.5 "Autonomiczny układ nerwowy" and §8.6 "Higiena i choroby układu nerwowego"
// (zakres rozszerzony). Terms follow templates/data/systems.ts (NERVOUS_PARTS),
// templates/data/systemsMore.ts (AUTONOMIC_PARTS) and templates/data/disorders.ts (NERVOUS_DISORDERS).
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, TwoWaySort, type CompareCard, type QuizItem, type QuizOption, type SortItem } from "../../games.tsx";
import { Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Bicia serca, trawienia ani szerokości źrenic nie kontrolujemy świadomie — zajmuje się tym autonomiczny układ nerwowy. Ma dwie części o przeciwnym działaniu: współczulną, która mobilizuje organizm do wysiłku, i przywspółczulną, która sprzyja odpoczynkowi i trawieniu. Na koniec poznasz choroby układu nerwowego i sposoby dbania o niego.",
    "Сердцебиение, пищеварение и ширину зрачков мы не контролируем сознательно — этим занимается вегетативная нервная система. У неё две части с противоположным действием: симпатическая, которая мобилизует организм к нагрузке, и парасимпатическая, которая способствует отдыху и пищеварению. В конце ты узнаешь о болезнях нервной системы и о том, как её беречь.",
  ),
  s1: r("Układ somatyczny i autonomiczny", "Соматическая и вегетативная нервная система"),
  s1intro: r("Porównaj drogę impulsu od ośrodka do narządu w trzech częściach układu nerwowego.", "Сравни путь импульса от центра к органу в трёх частях нервной системы."),
  s2: r("Walcz lub uciekaj — odpoczywaj i traw", "Бей или беги — отдыхай и переваривай"),
  s2intro: r(
    "Przełącz część układu autonomicznego i zobacz, jak zmieniają się narządy. Dotknij narządu, by przeczytać szczegóły.",
    "Переключи отдел вегетативной системы и посмотри, как меняются органы. Нажми на орган, чтобы прочитать подробности.",
  ),
  s3: r("Choroby układu nerwowego", "Болезни нервной системы"),
  s3intro: r("Rozpoznaj chorobę po jej objawach.", "Узнай болезнь по её симптомам."),
  s4: r("Higiena układu nerwowego", "Гигиена нервной системы"),
} satisfies Record<string, Txt>;

// ---------- somatic vs autonomic ----------

const CL = {
  effectors: r("Narządy wykonawcze", "Рабочие органы"),
  will: r("Kontrola woli", "Контроль воли"),
  centres: r("Ośrodki", "Центры"),
  ganglia: r("Zwoje", "Ганглии"),
  transmitter: r("Neuroprzekaźnik przy narządzie", "Медиатор у органа"),
  effect: r("Działanie", "Действие"),
};

function Chain({ lang, ganglion, effector, transmitter }: { lang: BioLang; ganglion: number | null; effector: string; transmitter: Txt }) {
  return (
    <svg viewBox="0 0 220 100" className="w-full" role="img" aria-label={`${lang === "pl" ? "droga impulsu" : "путь импульса"}: ${transmitter[lang]}`}>
      <rect x={6} y={26} width={46} height={40} rx={8} fill="#c7d2fe" stroke="#4338ca" />
      <text x={29} y={50} textAnchor="middle" fontSize={11} fontWeight={700} fill="#312e81">
        {lang === "pl" ? "OUN" : "ЦНС"}
      </text>
      {ganglion === null ? (
        <path d="M52 46 L 180 46" stroke="#4f46e5" strokeWidth={3} />
      ) : (
        <>
          <path d={`M52 46 L ${ganglion - 9} 46`} stroke="#4f46e5" strokeWidth={3} />
          <circle cx={ganglion} cy={46} r={9} fill="#fde68a" stroke="#b45309" strokeWidth={1.5} />
          <path d={`M${ganglion + 9} 46 L 180 46`} stroke="#d97706" strokeWidth={3} strokeDasharray="6 3" />
          <text x={ganglion} y={26} textAnchor="middle" fontSize={10} fill="#92400e">
            {lang === "pl" ? "zwój" : "ганглий"}
          </text>
        </>
      )}
      <text x={198} y={54} textAnchor="middle" fontSize={22}>
        {effector}
      </text>
      <text x={110} y={86} textAnchor="middle" fontSize={10} fill="#475569">
        {transmitter[lang]}
      </text>
    </svg>
  );
}

const ACH = r("acetylocholina", "ацетилхолин");
const NA = r("noradrenalina", "норадреналин");

const divisionCards = (lang: BioLang): CompareCard[] => [
  {
    id: "somatic",
    icon: "💪",
    name: r("Somatyczny", "Соматическая"),
    art: <Chain lang={lang} ganglion={null} effector="💪" transmitter={ACH} />,
    rows: [
      { label: CL.effectors, value: r("mięśnie szkieletowe", "скелетные мышцы") },
      { label: CL.will, value: r("tak — ruchy dowolne (oraz odruchy)", "да — произвольные движения (а также рефлексы)") },
      { label: CL.centres, value: r("kora ruchowa, pień mózgu, rdzeń kręgowy", "двигательная кора, ствол мозга, спинной мозг") },
      { label: CL.ganglia, value: r("brak — jeden neuron ruchowy biegnie od rdzenia do mięśnia", "нет — один двигательный нейрон идёт от спинного мозга к мышце") },
      { label: CL.transmitter, value: ACH },
      { label: CL.effect, value: r("ruchy ciała", "движения тела") },
    ],
  },
  {
    id: "sympathetic",
    icon: "🏃",
    name: r("Współczulny", "Симпатическая"),
    art: <Chain lang={lang} ganglion={78} effector="🫀" transmitter={NA} />,
    rows: [
      { label: CL.effectors, value: r("mięśnie gładkie, mięsień sercowy, gruczoły", "гладкие мышцы, сердечная мышца, железы") },
      { label: CL.will, value: r("nie", "нет") },
      { label: CL.centres, value: r("odcinek piersiowy i lędźwiowy rdzenia kręgowego", "грудной и поясничный отделы спинного мозга") },
      { label: CL.ganglia, value: r("blisko rdzenia — w pniu współczulnym; włókna przedzwojowe krótkie, zazwojowe długie", "близко к спинному мозгу — в симпатическом стволе; преганглионарные волокна короткие, постганглионарные длинные") },
      { label: CL.transmitter, value: NA },
      { label: CL.effect, value: r("mobilizacja do wysiłku i reakcji na stres — „walcz lub uciekaj”", "мобилизация к нагрузке и стрессу — «бей или беги»") },
    ],
  },
  {
    id: "parasympathetic",
    icon: "🛋️",
    name: r("Przywspółczulny", "Парасимпатическая"),
    art: <Chain lang={lang} ganglion={162} effector="🫀" transmitter={ACH} />,
    rows: [
      { label: CL.effectors, value: r("mięśnie gładkie, mięsień sercowy, gruczoły", "гладкие мышцы, сердечная мышца, железы") },
      { label: CL.will, value: r("nie", "нет") },
      { label: CL.centres, value: r("pień mózgu (m.in. nerw błędny) i odcinek krzyżowy rdzenia", "ствол мозга (в том числе блуждающий нерв) и крестцовый отдел спинного мозга") },
      { label: CL.ganglia, value: r("blisko narządu lub w jego ścianie; włókna przedzwojowe długie, zazwojowe krótkie", "рядом с органом или в его стенке; преганглионарные волокна длинные, постганглионарные короткие") },
      { label: CL.transmitter, value: ACH },
      { label: CL.effect, value: r("odpoczynek, trawienie i odnowa zapasów — „odpoczywaj i traw”", "отдых, пищеварение и восстановление запасов — «отдыхай и переваривай»") },
    ],
  },
];

// ---------- body ----------

type Mode = "sym" | "para";
type Organ = "eye" | "saliva" | "bronchi" | "heart" | "liver" | "gut" | "adrenal" | "bladder";

const ORGANS: Record<Organ, { name: Txt; sym: Txt; para: Txt }> = {
  eye: {
    name: r("Źrenica", "Зрачок"),
    sym: r("rozszerza się — do oka wpada więcej światła", "расширяется — в глаз попадает больше света"),
    para: r("zwęża się", "сужается"),
  },
  saliva: {
    name: r("Ślinianki", "Слюнные железы"),
    sym: r("wydzielają mało gęstej śliny — „sucho w ustach” przed egzaminem", "выделяют мало густой слюны — «сухо во рту» перед экзаменом"),
    para: r("wydzielają dużo rzadkiej, wodnistej śliny", "выделяют много жидкой, водянистой слюны"),
  },
  bronchi: {
    name: r("Oskrzela", "Бронхи"),
    sym: r("rozszerzają się — do płuc dociera więcej powietrza", "расширяются — в лёгкие поступает больше воздуха"),
    para: r("zwężają się", "сужаются"),
  },
  heart: {
    name: r("Serce", "Сердце"),
    sym: r("przyspiesza i kurczy się silniej — rośnie ciśnienie krwi", "учащается и сокращается сильнее — растёт давление крови"),
    para: r("zwalnia — działa tu głównie nerw błędny", "замедляется — здесь действует в основном блуждающий нерв"),
  },
  liver: {
    name: r("Wątroba", "Печень"),
    sym: r("rozkłada glikogen — do krwi trafia glukoza, paliwo dla mięśni", "расщепляет гликоген — в кровь поступает глюкоза, топливо для мышц"),
    para: r("sprzyja magazynowaniu glukozy w postaci glikogenu", "способствует запасанию глюкозы в виде гликогена"),
  },
  gut: {
    name: r("Żołądek i jelita", "Желудок и кишечник"),
    sym: r("hamuje perystaltykę i wydzielanie soków trawiennych", "тормозит перистальтику и выделение пищеварительных соков"),
    para: r("pobudza perystaltykę i wydzielanie soków trawiennych", "усиливает перистальтику и выделение пищеварительных соков"),
  },
  adrenal: {
    name: r("Rdzeń nadnerczy", "Мозговое вещество надпочечников"),
    sym: r("wydziela adrenalinę, która wzmacnia i przedłuża reakcję „walcz lub uciekaj”", "выделяет адреналин, который усиливает и продлевает реакцию «бей или беги»"),
    para: r("nie ma unerwienia przywspółczulnego — bez zmian", "не имеет парасимпатической иннервации — без изменений"),
  },
  bladder: {
    name: r("Pęcherz moczowy", "Мочевой пузырь"),
    sym: r("ściana się rozkurcza, a zwieracz zaciska — mocz jest zatrzymywany", "стенка расслабляется, а сфинктер сжимается — моча задерживается"),
    para: r("ściana się kurczy, a zwieracz rozluźnia — oddawanie moczu", "стенка сокращается, а сфинктер расслабляется — мочеиспускание"),
  },
};

const MODE = {
  sym: { name: r("Współczulny", "Симпатическая"), scene: r("🐕 Goni cię pies albo zaraz zaczyna się egzamin.", "🐕 За тобой гонится собака или сейчас начнётся экзамен.") },
  para: { name: r("Przywspółczulny", "Парасимпатическая"), scene: r("🛋️ Odpoczywasz po obiedzie.", "🛋️ Ты отдыхаешь после обеда.") },
};

function Body({ lang }: { lang: BioLang }) {
  const [mode, setMode] = useState<Mode>("sym");
  const [organ, setOrgan] = useState<Organ>("heart");
  const sym = mode === "sym";
  const o = ORGANS[organ];
  const hit = (id: Organ, node: ReactNode) => (
    <g
      role="button"
      tabIndex={0}
      aria-label={ORGANS[id].name[lang]}
      aria-pressed={organ === id}
      onClick={() => setOrgan(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOrgan(id);
        }
      }}
      className="cursor-pointer outline-none"
      style={organ === id ? { filter: "drop-shadow(0 0 4px #10b981)" } : undefined}
    >
      {node}
    </g>
  );
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup">
        {(["sym", "para"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              mode === m ? (m === "sym" ? "bg-rose-600 text-white ring-rose-600" : "bg-sky-600 text-white ring-sky-600") : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {m === "sym" ? "🏃" : "🛋️"} {MODE[m].name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 240 340" className="mx-auto w-full max-w-[320px] select-none" role="img" aria-label={`${MODE[mode].name[lang]}`}>
          <rect width={240} height={340} rx={16} fill={sym ? "#fff1f2" : "#f0f9ff"} style={{ transition: "fill .4s" }} />
          {/* body */}
          <path d="M70 96 Q 120 84 170 96 L 178 200 Q 176 290 150 318 L 90 318 Q 64 290 62 200 Z" fill="#fff7ed" stroke="#d6d3d1" strokeWidth={2} />
          <rect x={108} y={72} width={24} height={22} fill="#fde2c8" />
          <circle cx={120} cy={44} r={32} fill="#fde2c8" stroke="#e7c4a0" strokeWidth={1.5} />
          {/* eyes */}
          {hit(
            "eye",
            <g>
              <rect x={96} y={30} width={48} height={20} fill="transparent" />
              {[108, 132].map((x) => (
                <g key={x}>
                  <ellipse cx={x} cy={40} rx={9} ry={5.5} fill="white" stroke="#94a3b8" />
                  <circle cx={x} cy={40} r={4.6} fill="#0ea5e9" />
                  <circle cx={x} cy={40} r={sym ? 3.8 : 1.4} fill="#0f172a" style={{ transition: "r .4s" }} />
                </g>
              ))}
            </g>,
          )}
          {/* salivary glands */}
          {hit(
            "saliva",
            <g>
              <rect x={86} y={50} width={68} height={26} fill="transparent" />
              <ellipse cx={93} cy={56} rx={6} ry={8} fill="#fbcfe8" stroke="#db2777" />
              <ellipse cx={147} cy={56} rx={6} ry={8} fill="#fbcfe8" stroke="#db2777" />
              <path d="M112 62 Q 120 66 128 62" stroke="#be123c" strokeWidth={2} fill="none" />
              {(sym ? [0] : [-6, 0, 6]).map((d) => (
                <path
                  key={d}
                  d={`M${120 + d} 66 q -3 5 0 7 q 3 -2 0 -7`}
                  fill={sym ? "#e5e7eb" : "#7dd3fc"}
                  stroke={sym ? "#9ca3af" : "#0284c7"}
                  strokeWidth={sym ? 1.5 : 0.8}
                />
              ))}
            </g>,
          )}
          {/* lungs and bronchi */}
          {hit(
            "bronchi",
            <g>
              <ellipse cx={96} cy={142} rx={22} ry={34} fill="#fce7f3" stroke="#f9a8d4" />
              <ellipse cx={146} cy={142} rx={22} ry={34} fill="#fce7f3" stroke="#f9a8d4" />
              <path
                d="M120 94 L 120 120 M120 120 L 100 136 L 92 156 M100 136 L 108 158 M120 120 L 140 136 L 150 156 M140 136 L 132 158"
                stroke="#64748b"
                strokeWidth={sym ? 7 : 3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{ transition: "stroke-width .4s" }}
              />
            </g>,
          )}
          {/* heart */}
          {hit(
            "heart",
            <g transform="translate(128 168)">
              <circle r={16} fill="transparent" />
              <g>
                <animateTransform key={mode} attributeName="transform" type="scale" values="1;1.22;1" dur={sym ? "0.42s" : "1.3s"} repeatCount="indefinite" />
                <path d="M0 9 C -16 -2, -13 -15, -5 -13 C -1 -12, 0 -8, 0 -6 C 0 -8, 1 -12, 5 -13 C 13 -15, 16 -2, 0 9 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth={1} />
              </g>
            </g>,
          )}
          {/* liver */}
          {hit(
            "liver",
            <g>
              <path d="M72 188 Q 110 176 132 190 Q 118 212 84 212 Q 70 204 72 188 Z" fill="#c2410c" opacity={0.8} />
              <text x={96} y={202} textAnchor="middle" fontSize={8} fill="white" fontWeight={700}>
                {sym ? (lang === "pl" ? "glukoza ↑" : "глюкоза ↑") : lang === "pl" ? "glikogen" : "гликоген"}
              </text>
            </g>,
          )}
          {/* stomach and intestine */}
          {hit(
            "gut",
            <g>
              <path d="M140 186 Q 164 180 164 200 Q 162 220 142 216 Q 132 208 140 196 Z" fill={sym ? "#e5e7eb" : "#fda4af"} stroke={sym ? "#9ca3af" : "#be123c"} style={{ transition: "fill .4s" }} />
              <path
                d="M104 230 Q 120 222 136 230 Q 150 238 136 246 Q 120 254 104 246 Q 92 256 104 262 Q 120 270 136 262"
                stroke={sym ? "#d1d5db" : "#fb7185"}
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={sym ? undefined : "10 4"}
              >
                {!sym && <animate attributeName="stroke-dashoffset" values="0;-28" dur="1.2s" repeatCount="indefinite" />}
              </path>
            </g>,
          )}
          {/* kidneys with adrenal glands */}
          {hit(
            "adrenal",
            <g>
              {[78, 162].map((x) => (
                <g key={x}>
                  <ellipse cx={x} cy={240} rx={8} ry={13} fill="#a16207" opacity={0.55} />
                  <path d={`M${x - 8} 228 L ${x} 214 L ${x + 8} 228 Z`} fill={sym ? "#facc15" : "#fde68a"} stroke="#a16207" style={{ transition: "fill .4s" }} />
                </g>
              ))}
              {sym && (
                <text x={162} y={264} textAnchor="middle" fontSize={8} fill="#a16207" fontWeight={700}>
                  {lang === "pl" ? "adrenalina" : "адреналин"}
                </text>
              )}
            </g>,
          )}
          {/* bladder */}
          {hit(
            "bladder",
            <g>
              <ellipse cx={120} cy={292} rx={sym ? 17 : 12} ry={sym ? 14 : 9} fill="#fef08a" stroke="#ca8a04" strokeWidth={sym ? 1.5 : 3} style={{ transition: "all .4s" }} />
              <path d={sym ? "M116 306 L 124 306" : "M114 302 L 126 302"} stroke="#a16207" strokeWidth={3} />
              {!sym && <path d="M120 304 L 120 322" stroke="#eab308" strokeWidth={3} strokeDasharray="3 3" />}
            </g>,
          )}
        </svg>
        <div className="space-y-3">
          <p className={`rounded-xl px-4 py-3 text-[15px] ring-1 ${sym ? "bg-rose-50 text-rose-950 ring-rose-200" : "bg-sky-50 text-sky-950 ring-sky-200"}`}>{MODE[mode].scene[lang]}</p>
          <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
            <h3 className="text-base font-semibold text-emerald-900">{o.name[lang]}</h3>
            <p className={`mt-2 text-[15px] leading-relaxed ${sym ? "font-semibold text-rose-900" : "text-slate-500"}`}>
              🏃 {MODE.sym.name[lang]}: {o.sym[lang]}
            </p>
            <p className={`mt-1 text-[15px] leading-relaxed ${!sym ? "font-semibold text-sky-900" : "text-slate-500"}`}>
              🛋️ {MODE.para.name[lang]}: {o.para[lang]}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(ORGANS) as Organ[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setOrgan(id)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                  organ === id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
                }`}
              >
                {ORGANS[id].name[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- diseases ----------

const D_OPTIONS: QuizOption[] = [
  { id: "alzheimer", label: r("choroba Alzheimera", "болезнь Альцгеймера") },
  { id: "parkinson", label: r("choroba Parkinsona", "болезнь Паркинсона") },
  { id: "padaczka", label: r("padaczka", "эпилепсия") },
  { id: "depresja", label: r("depresja", "депрессия") },
  { id: "meningitis", label: r("bakteryjne zapalenie opon mózgowo-rdzeniowych", "бактериальный менингит") },
  { id: "kzm", label: r("kleszczowe zapalenie mózgu", "клещевой энцефалит") },
  { id: "borelioza", label: r("borelioza", "боррелиоз") },
  { id: "wscieklizna", label: r("wścieklizna", "бешенство") },
];

const D_ITEMS: QuizItem[] = [
  {
    icon: "🧓",
    name: r("u starszej osoby postępujące zaburzenia pamięci świeżej, orientacji i mowy", "у пожилого человека нарастающие нарушения памяти на недавние события, ориентации и речи"),
    answer: "alzheimer",
    explain: r("Obumierają neurony kory mózgowej, a w mózgu odkładają się złogi białka.", "Гибнут нейроны коры, а в мозге откладываются белковые бляшки."),
  },
  {
    icon: "✋",
    name: r("drżenie rąk w spoczynku, spowolnienie ruchów i sztywność mięśni", "дрожание рук в покое, замедленность движений и скованность мышц"),
    answer: "parkinson",
    explain: r("Obumierają neurony istoty czarnej wytwarzające dopaminę — neuroprzekaźnik potrzebny do płynnych ruchów.", "Гибнут нейроны чёрной субстанции, вырабатывающие дофамин — медиатор, нужный для плавных движений."),
  },
  {
    icon: "⚡",
    name: r("nawracające napady drgawek, często z utratą przytomności", "повторяющиеся приступы судорог, часто с потерей сознания"),
    answer: "padaczka",
    explain: r("Grupy neuronów nagle wysyłają nadmierne, zsynchronizowane wyładowania. Przy napadzie chroni się głowę chorego, niczego nie wkłada się mu do ust.", "Группы нейронов внезапно дают чрезмерные синхронные разряды. При приступе защищают голову больного, ничего не вставляя ему в рот."),
  },
  {
    icon: "🌧️",
    name: r("długotrwały smutek, utrata zainteresowań, zaburzenia snu i apetytu", "длительная подавленность, потеря интереса, нарушения сна и аппетита"),
    answer: "depresja",
    explain: r("Zaburzone jest przekaźnictwo nerwowe, m.in. serotoninowe. To choroba, którą się leczy — nie „lenistwo” ani „chandra”.", "Нарушена нервная передача, в том числе серотониновая. Это болезнь, которую лечат, а не «лень» или «хандра».") ,
  },
  {
    icon: "🤒",
    name: r("wysoka gorączka, silny ból głowy, sztywność karku i wysypka", "высокая температура, сильная головная боль, ригидность затылочных мышц и сыпь"),
    answer: "meningitis",
    explain: r("Bakterie, np. meningokoki, zakażają opony mózgowo-rdzeniowe. Choroba postępuje bardzo szybko — przed niektórymi bakteriami chronią szczepienia.", "Бактерии, например менингококки, поражают мозговые оболочки. Болезнь развивается очень быстро — от некоторых бактерий защищают прививки."),
  },
  {
    icon: "🕷️",
    name: r("po ukąszeniu kleszcza gorączka, a po kilku dniach zaburzenia świadomości i niedowłady", "после укуса клеща температура, а через несколько дней нарушения сознания и параличи"),
    answer: "kzm",
    explain: r("Wirus przenoszony przez kleszcze. Chroni przed nim szczepionka.", "Вирус передаётся клещами. От него защищает вакцина."),
  },
  {
    icon: "🎯",
    name: r("rumień wędrujący wokół ukąszenia kleszcza, później bóle stawów", "мигрирующая эритема вокруг укуса клеща, позже боли в суставах"),
    answer: "borelioza",
    explain: r("Wywołują ją bakterie — krętki — przenoszone przez kleszcze. Leczy się ją antybiotykami; szczepionki dla ludzi brak.", "Её вызывают бактерии — спирохеты, — передающиеся клещами. Лечат антибиотиками; вакцины для людей нет."),
  },
  {
    icon: "🦊",
    name: r("po ugryzieniu przez dzikie zwierzę: wodowstręt, pobudzenie i porażenia", "после укуса дикого животного: водобоязнь, возбуждение и параличи"),
    answer: "wscieklizna",
    explain: r("Wirus wścieklizny wędruje nerwami do mózgu. Po ugryzieniu trzeba natychmiast się zaszczepić — gdy pojawią się objawy, choroba kończy się śmiercią.", "Вирус бешенства движется по нервам к мозгу. После укуса нужно сразу привиться — после появления симптомов болезнь смертельна."),
  },
];

// ---------- hygiene ----------

const HYGIENE: SortItem[] = [
  { name: r("regularny sen, ok. 8–9 godzin", "регулярный сон, около 8–9 часов"), group: 0, why: r("We śnie mózg porządkuje i utrwala informacje.", "Во сне мозг упорядочивает и закрепляет информацию.") },
  { name: r("nauka do późnej nocy przy ekranie", "учёба до поздней ночи у экрана"), group: 1, why: r("Światło ekranu hamuje wydzielanie melatoniny i skraca sen.", "Свет экрана подавляет выработку мелатонина и сокращает сон.") },
  { name: r("regularna aktywność fizyczna", "регулярная физическая активность"), group: 0, why: r("Poprawia ukrwienie mózgu i obniża poziom stresu.", "Улучшает кровоснабжение мозга и снижает стресс.") },
  { name: r("picie alkoholu", "употребление алкоголя"), group: 1, why: r("Uszkadza neurony, zaburza pracę kory i móżdżku.", "Повреждает нейроны, нарушает работу коры и мозжечка.") },
  { name: r("palenie papierosów i e-papierosów", "курение сигарет и электронных сигарет"), group: 1, why: r("Nikotyna działa na synapsy (receptory acetylocholiny) i silnie uzależnia.", "Никотин действует на синапсы (рецепторы ацетилхолина) и вызывает сильную зависимость.") },
  { name: r("dopalacze i narkotyki", "«спайсы» и наркотики"), group: 1, why: r("Zaburzają przekaźnictwo w synapsach, uzależniają i mogą zabić.", "Нарушают передачу в синапсах, вызывают зависимость и могут убить.") },
  { name: r("przewlekły stres bez odpoczynku", "хронический стресс без отдыха"), group: 1, why: r("Długotrwała przewaga układu współczulnego wyczerpuje organizm.", "Длительное преобладание симпатической системы истощает организм.") },
  { name: r("przerwy w nauce i czas na relaks", "перерывы в учёбе и время на отдых"), group: 0, why: r("Odpoczynek pozwala działać układowi przywspółczulnemu i poprawia koncentrację.", "Отдых даёт работать парасимпатической системе и улучшает концентрацию.") },
  { name: r("kask na rowerze i hulajnodze", "шлем на велосипеде и самокате"), group: 0, why: r("Chroni mózg przed urazami.", "Защищает мозг от травм.") },
  { name: r("szczepienie przeciw KZM i oglądanie skóry po spacerze w lesie", "прививка от клещевого энцефалита и осмотр кожи после прогулки в лесу"), group: 0, why: r("Chroni przed chorobami przenoszonymi przez kleszcze.", "Защищает от болезней, которые передают клещи.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Układ somatyczny steruje mięśniami szkieletowymi, autonomiczny — narządami wewnętrznymi, niezależnie od woli.", ru: "Соматическая система управляет скелетными мышцами, вегетативная — внутренними органами, независимо от воли." },
    { pl: "Droga autonomiczna ma dwa neurony: przedzwojowy i zazwojowy, połączone w zwoju.", ru: "Вегетативный путь состоит из двух нейронов — преганглионарного и постганглионарного, соединённых в ганглии." },
  ],
  s2: [
    { pl: "Większość narządów ma podwójne unerwienie: część współczulna i przywspółczulna działają na nie przeciwnie.", ru: "Большинство органов имеют двойную иннервацию: симпатическая и парасимпатическая части действуют на них противоположно." },
    { pl: "Współczulny: serce szybciej, źrenice i oskrzela szersze, trawienie hamowane; przywspółczulny — odwrotnie.", ru: "Симпатическая: сердце чаще, зрачки и бронхи шире, пищеварение тормозится; парасимпатическая — наоборот." },
  ],
  s3: [
    { pl: "Alzheimer i Parkinson to choroby zwyrodnieniowe — obumierają w nich neurony.", ru: "Болезни Альцгеймера и Паркинсона — дегенеративные: при них гибнут нейроны." },
    { pl: "Przed KZM chroni szczepionka, przed boreliozą — unikanie ukąszeń kleszczy i szybkie ich usuwanie.", ru: "От клещевого энцефалита защищает вакцина, от боррелиоза — защита от укусов клещей и их быстрое удаление." },
  ],
  s4: [{ pl: "Sen, ruch i odpoczynek chronią układ nerwowy; alkohol, nikotyna i narkotyki mu szkodzą.", ru: "Сон, движение и отдых берегут нервную систему; алкоголь, никотин и наркотики ей вредят." }],
};

export default function AutonomicLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="auto" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="auto-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={divisionCards(lang)} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="auto-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Body lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="auto-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s3}
          question={r("Jaka choroba daje takie objawy:", "Какая болезнь даёт такие симптомы:")}
          options={D_OPTIONS}
          items={D_ITEMS}
          wrongHint={r("Zastanów się, czy to choroba zakaźna, zwyrodnieniowa czy zaburzenie pracy neuronów.", "Подумай, инфекционная это болезнь, дегенеративная или нарушение работы нейронов.")}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="auto-s4" n={4} title={T.s4[lang]}>
        <TwoWaySort lang={lang} title={T.s4} groups={[r("sprzyja", "полезно"), r("szkodzi", "вредно")]} items={HYGIENE} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
