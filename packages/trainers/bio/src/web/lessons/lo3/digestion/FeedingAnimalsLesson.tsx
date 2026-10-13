// Lesson for LO3 §4.1 "Odżywianie się zwierząt" (Biologia na czasie 3, zakres rozszerzony). Terms follow
// templates/data/comparative.ts (ANIMAL_FEEDING): roślinożercy, mięsożercy, wszystkożercy, żołądek
// wielokomorowy, wole, żołądek mięśniowy, jama chłonąco-trawiąca, trawienie wewnątrzkomórkowe.
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, OrderGame, TwoWaySort, type CompareCard, type SortItem } from "../../games.tsx";
import { Choice, KIT, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Zwierzęta są cudzożywne — pokarm muszą zdobyć, rozdrobnić i strawić. Budowa zębów, żołądka i jelita zdradza, czym zwierzę się żywi: inaczej wygląda przewód pokarmowy krowy, inaczej wilka, a jeszcze inaczej dżdżownicy czy stułbi.",
    "Животные — гетеротрофы: пищу им нужно добыть, измельчить и переварить. Строение зубов, желудка и кишечника выдаёт, чем животное питается: пищеварительный тракт коровы устроен иначе, чем у волка, а у дождевого червя или гидры — совсем по-другому.",
  ),
  s1: r("Roślinożerca, mięsożerca, wszystkożerca", "Растительноядные, плотоядные, всеядные"),
  s1intro: r(
    "Porównaj uzębienie żuchwy (widok z boku, z przodu po lewej) i długość jelita w stosunku do długości ciała. Rysunki są schematyczne.",
    "Сравни зубы нижней челюсти (вид сбоку, передние зубы слева) и длину кишечника относительно длины тела. Рисунки схематичные.",
  ),
  s2: r("Żołądek przeżuwacza", "Желудок жвачных"),
  s2intro: r(
    "Krowa nie wytwarza enzymów rozkładających celulozę — robią to za nią mikroorganizmy żyjące w żwaczu. Prześledź drogę trawy przez cztery komory żołądka.",
    "Корова не вырабатывает ферментов, расщепляющих целлюлозу, — за неё это делают микроорганизмы, живущие в рубце. Проследи путь травы через четыре отдела желудка.",
  ),
  s3: r("Układ pokarmowy w różnych grupach zwierząt", "Пищеварительная система у разных групп животных"),
  s3intro: r(
    "Od trawienia wewnątrz komórek, przez worek z jednym otworem, do przewodu z dwoma otworami i wyspecjalizowanymi odcinkami.",
    "От пищеварения внутри клеток, через мешок с одним отверстием, к тракту с двумя отверстиями и специализированными отделами.",
  ),
  s4: r("Przystosowania do rodzaju pokarmu", "Приспособления к типу пищи"),
  s4intro: r("Czy ta cecha jest typowa dla roślinożercy, czy dla mięsożercy?", "Этот признак типичен для растительноядного или для плотоядного животного?"),
} satisfies Record<string, Txt>;

// ---------- teeth and gut ----------

/** gum line of the lower jaw */
const G = 78;

type ToothKind = "incisor" | "canine" | "blade" | "grinder" | "bumpy";

function toothPath(kind: ToothKind, x: number, w: number, h: number): string {
  const top = G - h;
  switch (kind) {
    case "incisor":
      return `M${x} ${G} L ${x + 1} ${top + 3} Q ${x + w / 2} ${top - 2} ${x + w - 1} ${top + 3} L ${x + w} ${G} Z`;
    case "canine":
      return `M${x} ${G} Q ${x + w * 0.15} ${G - h * 0.55} ${x + w * 0.5} ${top} Q ${x + w * 0.85} ${G - h * 0.55} ${x + w} ${G} Z`;
    case "blade":
      return `M${x} ${G} L ${x + w * 0.3} ${top} L ${x + w * 0.5} ${G - h * 0.5} L ${x + w * 0.75} ${G - h * 0.85} L ${x + w} ${G} Z`;
    case "grinder": {
      // a flat crown crossed by enamel ridges
      const n = 4;
      let d = `M${x} ${G} L ${x} ${top}`;
      for (let k = 0; k < n; k++) d += ` L ${x + (w * (k + 0.5)) / n} ${top + 4} L ${x + (w * (k + 1)) / n} ${top}`;
      return `${d} L ${x + w} ${G} Z`;
    }
    case "bumpy": {
      // rounded cusps
      const n = 2;
      let d = `M${x} ${G} L ${x} ${top + 5}`;
      for (let k = 0; k < n; k++) d += ` Q ${x + (w * (k + 0.5)) / n} ${top - 4} ${x + (w * (k + 1)) / n} ${top + 5}`;
      return `${d} L ${x + w} ${G} Z`;
    }
  }
}

type Tooth = [ToothKind, number, number];

const JAWS: Record<"herb" | "carn" | "omni", { teeth: Tooth[]; gap?: [number, number]; gut: number }> = {
  // [kind, width, height]; a gap marks the diastema
  herb: {
    teeth: [
      ["incisor", 11, 30],
      ["incisor", 11, 30],
      ["grinder", 24, 20],
      ["grinder", 26, 22],
      ["grinder", 26, 22],
      ["grinder", 28, 22],
      ["grinder", 28, 20],
    ],
    gap: [24, 70],
    gut: 25,
  },
  carn: {
    teeth: [
      ["incisor", 7, 14],
      ["incisor", 7, 14],
      ["canine", 15, 42],
      ["blade", 16, 18],
      ["blade", 18, 22],
      ["blade", 20, 24],
      ["blade", 30, 32],
      ["incisor", 12, 10],
    ],
    gut: 4,
  },
  omni: {
    teeth: [
      ["incisor", 9, 22],
      ["incisor", 9, 22],
      ["canine", 13, 28],
      ["bumpy", 16, 16],
      ["bumpy", 17, 17],
      ["bumpy", 24, 18],
      ["bumpy", 25, 18],
      ["bumpy", 25, 17],
    ],
    gut: 12,
  },
};

const TOOTH_FILL: Record<ToothKind, string> = {
  incisor: "#f8fafc",
  canine: "#fef3c7",
  blade: "#fee2e2",
  grinder: "#e0f2fe",
  bumpy: "#ecfccb",
};

/** a serpentine drawn inside the panel whose length stands for the gut length */
function gutPath(units: number): string {
  const unit = 16;
  const row = 200;
  const total = units * unit;
  let left = total;
  let y = 116;
  let d = `M20 ${y}`;
  let dir = 1;
  let x = 20;
  while (left > 0) {
    const step = Math.min(row, left);
    x += dir * step;
    d += ` L ${x} ${y}`;
    left -= step;
    if (left > 0) {
      d += ` a 6 6 0 0 ${dir > 0 ? 1 : 0} 0 12`;
      y += 12;
      dir = -dir;
    }
  }
  return d;
}

function JawArt({ kind, lang }: { kind: "herb" | "carn" | "omni"; lang: BioLang }) {
  const jaw = JAWS[kind];
  let x = 14;
  const shapes = jaw.teeth.map(([k, w, h], i) => {
    const node = <path key={i} d={toothPath(k, x, w, h)} fill={TOOTH_FILL[k]} stroke="#475569" strokeWidth={1.4} strokeLinejoin="round" />;
    x += w + 2;
    if (jaw.gap && i === 1) x += jaw.gap[1] - jaw.gap[0];
    return node;
  });
  const gapX = jaw.gap ? 14 + 2 * 13 : 0;
  return (
    <svg viewBox="0 0 240 160" className="w-full" role="img" aria-label={lang === "pl" ? "Uzębienie i długość jelita" : "Зубы и длина кишечника"}>
      <rect x={6} y={G} width={228} height={16} rx={6} fill="#fecdd3" stroke="#e11d48" strokeWidth={1} />
      {shapes}
      {jaw.gap && (
        <text x={gapX + 22} y={G - 6} textAnchor="middle" fontSize={9} fill="#64748b">
          {lang === "pl" ? "diastema" : "диастема"}
        </text>
      )}
      <rect x={20} y={102} width={16} height={6} rx={2} fill="#64748b" />
      <text x={40} y={108} fontSize={9} fill="#475569">
        {lang === "pl" ? "= długość ciała" : "= длина тела"}
      </text>
      <path d={gutPath(jaw.gut)} fill="none" stroke="#d97706" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <text x={230} y={108} textAnchor="end" fontSize={9} fill="#92400e">
        {lang === "pl" ? "jelito" : "кишечник"}
      </text>
    </svg>
  );
}

const L1 = {
  examples: r("Przykłady", "Примеры"),
  incisors: r("Siekacze", "Резцы"),
  canines: r("Kły", "Клыки"),
  cheek: r("Zęby policzkowe", "Коренные зубы"),
  gut: r("Jelito", "Кишечник"),
  digestion: r("Trawienie", "Пищеварение"),
};

const DIETS = (lang: BioLang): CompareCard[] => [
  {
    id: "herb",
    icon: "🐄",
    name: r("Roślinożercy", "Растительноядные"),
    art: <JawArt kind="herb" lang={lang} />,
    rows: [
      { label: L1.examples, value: r("koń, krowa, zając, bóbr", "лошадь, корова, заяц, бобр") },
      { label: L1.incisors, value: r("duże, dłutowate — odcinają i obgryzają rośliny; u gryzoni rosną przez całe życie", "крупные, долотовидные — срезают и обгрызают растения; у грызунов растут всю жизнь") },
      { label: L1.canines, value: r("małe albo brak; między siekaczami a zębami policzkowymi jest przerwa — diastema", "мелкие или отсутствуют; между резцами и коренными зубами есть промежуток — диастема") },
      { label: L1.cheek, value: r("szerokie, płaskie korony z listewkami szkliwa rozcierają twardy pokarm", "широкие плоские коронки со складками эмали перетирают жёсткую пищу") },
      { label: L1.gut, value: r("bardzo długie (u owcy ok. 25 razy dłuższe od ciała), duże jelito ślepe", "очень длинный (у овцы примерно в 25 раз длиннее тела), большая слепая кишка") },
      { label: L1.digestion, value: r("celulozę rozkładają symbiotyczne bakterie i pierwotniaki — w żwaczu albo w jelicie ślepym", "целлюлозу расщепляют симбиотические бактерии и простейшие — в рубце или в слепой кишке") },
    ],
  },
  {
    id: "carn",
    icon: "🐺",
    name: r("Mięsożercy", "Плотоядные"),
    art: <JawArt kind="carn" lang={lang} />,
    rows: [
      { label: L1.examples, value: r("wilk, kot, lis, foka", "волк, кошка, лиса, тюлень") },
      { label: L1.incisors, value: r("małe — odrywają kawałki mięsa", "мелкие — отрывают куски мяса") },
      { label: L1.canines, value: r("długie, stożkowate — chwytają i zabijają ofiarę", "длинные, конические — хватают и убивают добычу") },
      { label: L1.cheek, value: r("ostre, tnące; łamacze kroją mięso jak nożyce i kruszą kości", "острые, режущие; хищнические зубы режут мясо, как ножницы, и дробят кости") },
      { label: L1.gut, value: r("krótkie (u kota ok. 4 razy dłuższe od ciała) — pokarm zwierzęcy trawi się łatwo", "короткий (у кошки примерно в 4 раза длиннее тела) — животная пища переваривается легко") },
      { label: L1.digestion, value: r("pokarm połykany dużymi kęsami, obfity sok żołądkowy", "пища заглатывается крупными кусками, обильный желудочный сок") },
    ],
  },
  {
    id: "omni",
    icon: "🐗",
    name: r("Wszystkożercy", "Всеядные"),
    art: <JawArt kind="omni" lang={lang} />,
    rows: [
      { label: L1.examples, value: r("człowiek, dzik, niedźwiedź brunatny, szczur", "человек, кабан, бурый медведь, крыса") },
      { label: L1.incisors, value: r("dłutowate, średniej wielkości", "долотовидные, средней величины") },
      { label: L1.canines, value: r("średnie (u dzika wyrastają w duże, wystające szable)", "средние (у кабана вырастают в крупные торчащие клыки)") },
      { label: L1.cheek, value: r("trzonowce z tępymi guzkami — miażdżą i rozcierają różny pokarm", "коренные с тупыми бугорками — раздавливают и перетирают разную пищу") },
      { label: L1.gut, value: r("średniej długości", "средней длины") },
      { label: L1.digestion, value: r("enzymy trawią i białka, i skrobię; celulozę rozkładają tylko w niewielkim stopniu bakterie jelita grubego", "ферменты переваривают и белки, и крахмал; целлюлозу лишь в небольшой степени расщепляют бактерии толстой кишки") },
    ],
  },
];

// ---------- ruminant stomach ----------

type Station = "mouth" | "rumen" | "reticulum" | "chew" | "omasum" | "abomasum";

interface Step {
  at: Station;
  name: Txt;
  text: Txt;
}

const STEPS: Step[] = [
  {
    at: "mouth",
    name: r("Jama ustna", "Ротовая полость"),
    text: r(
      "Krowa odgryza trawę, przeżuwa ją tylko pobieżnie, miesza z dużą ilością śliny i połyka.",
      "Корова откусывает траву, лишь слегка пережёвывает её, смешивает с большим количеством слюны и проглатывает.",
    ),
  },
  {
    at: "rumen",
    name: r("Żwacz", "Рубец"),
    text: r(
      "Największa komora. Żyjące tu bakterie i pierwotniaki fermentują celulozę; powstające kwasy tłuszczowe są wchłaniane i stanowią główne źródło energii krowy. Gazy (m.in. metan) zwierzę usuwa, odbijając je.",
      "Самый большой отдел. Живущие здесь бактерии и простейшие сбраживают целлюлозу; образующиеся жирные кислоты всасываются и служат корове главным источником энергии. Газы (в том числе метан) животное удаляет отрыжкой.",
    ),
  },
  {
    at: "reticulum",
    name: r("Czepiec", "Сетка"),
    text: r(
      "Komora o siateczkowatej ścianie. Formuje z treści żwacza kęsy, które wracają przełykiem do jamy ustnej.",
      "Отдел с сетчатой стенкой. Формирует из содержимого рубца комки (жвачку), которые по пищеводу возвращаются в ротовую полость.",
    ),
  },
  {
    at: "chew",
    name: r("Przeżuwanie", "Пережёвывание жвачки"),
    text: r(
      "W spoczynku zwierzę dokładnie przeżuwa cofnięty kęs i połyka go ponownie. Dobrze rozdrobniony pokarm omija już żwacz i przechodzi dalej.",
      "В покое животное тщательно пережёвывает отрыгнутый комок и снова его проглатывает. Хорошо измельчённая пища уже минует рубец и идёт дальше.",
    ),
  },
  {
    at: "omasum",
    name: r("Księgi", "Книжка"),
    text: r(
      "Ściana tworzy liczne fałdy ułożone jak kartki książki. Wchłaniana jest tu woda, a treść się zagęszcza.",
      "Стенка образует многочисленные складки, сложенные как страницы книги. Здесь всасывается вода, и содержимое сгущается.",
    ),
  },
  {
    at: "abomasum",
    name: r("Trawieniec", "Сычуг"),
    text: r(
      "Właściwy żołądek — wydziela sok żołądkowy z kwasem solnym i enzymami. Trawione są tu też białka mikroorganizmów, które przeszły ze żwacza — to dla krowy ważne źródło białka. Dalej pokarm trafia do jelita.",
      "Настоящий желудок — выделяет желудочный сок с соляной кислотой и ферментами. Здесь перевариваются и белки микроорганизмов, пришедших из рубца, — для коровы это важный источник белка. Дальше пища идёт в кишечник.",
    ),
  },
];

const SPOT: Record<Station, [number, number]> = {
  mouth: [34, 30],
  chew: [34, 30],
  rumen: [96, 148],
  reticulum: [178, 98],
  omasum: [236, 112],
  abomasum: [250, 172],
};

const RUM_T = {
  prev: r("Wstecz", "Назад"),
  step: r("Krok", "Шаг"),
  mouth: r("jama ustna", "рот"),
  rumen: r("żwacz", "рубец"),
  reticulum: r("czepiec", "сетка"),
  omasum: r("księgi", "книжка"),
  abomasum: r("trawieniec", "сычуг"),
  gut: r("jelito", "кишечник"),
};

function Ruminant({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const step = STEPS[i]!;
  const on = (s: Station) => step.at === s;
  const fill = (s: Station, base: string) => (on(s) ? "#6ee7b7" : base);
  const [fx, fy] = SPOT[step.at];
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 320 230" className="mx-auto w-full max-w-[420px] select-none" role="img" aria-label={step.name[lang]}>
        <rect width={320} height={230} rx={12} fill="#f8fafc" />
        {/* the oesophagus, from the mouth to where the rumen and reticulum meet */}
        <path d="M34 44 C 40 80, 110 84, 160 90" fill="none" stroke="#fda4af" strokeWidth={10} strokeLinecap="round" />
        <circle cx={34} cy={30} r={16} fill={on("mouth") || on("chew") ? "#6ee7b7" : "#fecdd3"} stroke="#be123c" strokeWidth={2} />
        <text x={56} y={22} fontSize={10} fill="#334155">
          {RUM_T.mouth[lang]}
        </text>
        {/* the passage reticulum → omasum → abomasum */}
        <path d="M178 98 L 236 112 L 252 176" fill="none" stroke="#fda4af" strokeWidth={9} strokeLinejoin="round" />
        <ellipse cx={96} cy={150} rx={80} ry={60} fill={fill("rumen", "#fde68a")} stroke="#b45309" strokeWidth={2} style={{ transition: "fill .3s" }} />
        <text x={96} y={176} textAnchor="middle" fontSize={11} fontWeight={600} fill="#78350f">
          {RUM_T.rumen[lang]}
        </text>
        <circle cx={178} cy={98} r={24} fill={fill("reticulum", "#fed7aa")} stroke="#b45309" strokeWidth={2} style={{ transition: "fill .3s" }} />
        <path d="M164 92 l 8 -8 l 8 8 l 8 -8 M164 104 l 8 -8 l 8 8 l 8 -8" fill="none" stroke="#c2410c" strokeWidth={1} opacity={0.6} />
        <text x={178} y={66} textAnchor="middle" fontSize={10} fill="#334155">
          {RUM_T.reticulum[lang]}
        </text>
        <circle cx={236} cy={112} r={26} fill={fill("omasum", "#e9d5ff")} stroke="#7e22ce" strokeWidth={2} style={{ transition: "fill .3s" }} />
        {[-12, -4, 4, 12].map((dx) => (
          <path key={dx} d={`M${236 + dx} 92 L ${236 + dx} 132`} stroke="#9333ea" strokeWidth={1} opacity={0.6} />
        ))}
        <text x={268} y={88} fontSize={10} fill="#334155">
          {RUM_T.omasum[lang]}
        </text>
        <ellipse cx={252} cy={176} rx={56} ry={22} transform="rotate(14 252 176)" fill={fill("abomasum", "#fecaca")} stroke="#b91c1c" strokeWidth={2} style={{ transition: "fill .3s" }} />
        <text x={244} y={180} textAnchor="middle" fontSize={10} fill="#7f1d1d">
          {RUM_T.abomasum[lang]}
        </text>
        <path d="M304 192 C 312 204, 304 214, 312 224" fill="none" stroke="#d97706" strokeWidth={6} strokeLinecap="round" />
        <text x={300} y={222} textAnchor="end" fontSize={9} fill="#92400e">
          {RUM_T.gut[lang]}
        </text>
        {on("chew") && (
          <path d="M170 76 C 150 30, 80 20, 54 26" fill="none" stroke="#059669" strokeWidth={2.5} strokeDasharray="5 4" markerEnd="url(#feeda-arrow)" />
        )}
        <defs>
          <marker id="feeda-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L 10 5 L 0 10 Z" fill="#059669" />
          </marker>
        </defs>
        <circle cx={fx} cy={fy} r={7} fill="#16a34a" stroke="white" strokeWidth={2} style={{ transition: "cx .5s, cy .5s" }} />
      </svg>
      <div className="space-y-3">
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <div className="text-xs font-medium text-emerald-700">
            {RUM_T.step[lang]} {i + 1} / {STEPS.length}
          </div>
          <h3 className="text-base font-semibold text-emerald-900">{step.name[lang]}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{step.text[lang]}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Choice disabled={i === 0} onClick={() => setI(i - 1)}>
            ‹ {RUM_T.prev[lang]}
          </Choice>
          <Choice state="active" disabled={i === STEPS.length - 1} onClick={() => setI(i + 1)}>
            {KIT.next[lang]} ›
          </Choice>
          {i === STEPS.length - 1 && <Choice onClick={() => setI(0)}>↺ {KIT.again[lang]}</Choice>}
        </div>
      </div>
    </div>
  );
}

const RUMEN_PATH: Txt[] = [
  r("żwacz", "рубец"),
  r("czepiec", "сетка"),
  r("jama ustna (przeżuwanie)", "ротовая полость (жвачка)"),
  r("księgi", "книжка"),
  r("trawieniec", "сычуг"),
  r("jelito cienkie", "тонкая кишка"),
];

// ---------- digestive systems across groups ----------

const L3 = {
  build: r("Budowa", "Строение"),
  openings: r("Otwory", "Отверстия"),
  digestion: r("Trawienie", "Пищеварение"),
  special: r("Cechy szczególne", "Особенности"),
};

const GUT = "#d97706";

function SpongeArt() {
  return (
    <svg viewBox="0 0 200 130" className="w-full" aria-hidden>
      <path d="M60 120 C 40 90, 44 40, 70 14 L 130 14 C 156 40, 160 90, 140 120 Z" fill="#fde68a" stroke="#b45309" strokeWidth={2} />
      <path d="M78 110 C 66 86, 68 44, 84 22 L 116 22 C 132 44, 134 86, 122 110 Z" fill="#e0f2fe" />
      {[30, 46, 62, 78, 94].map((y) => (
        <g key={y}>
          <circle cx={78 + (y > 70 ? -6 : 0)} cy={y} r={4} fill="#86efac" stroke="#15803d" />
          <circle cx={122 - (y > 70 ? -6 : 0)} cy={y} r={4} fill="#86efac" stroke="#15803d" />
        </g>
      ))}
      <path d="M100 30 L 100 4 M94 10 L 100 4 L 106 10" stroke="#0284c7" strokeWidth={2} fill="none" />
      <path d="M36 70 L 64 70 M58 64 L 64 70 L 58 76 M164 70 L 136 70 M142 64 L 136 70 L 142 76" stroke="#0284c7" strokeWidth={2} fill="none" />
    </svg>
  );
}

function HydraArt() {
  return (
    <svg viewBox="0 0 200 130" className="w-full" aria-hidden>
      {[-30, -12, 12, 30].map((dx) => (
        <path key={dx} d={`M${100 + dx / 3} 30 Q ${100 + dx} 10 ${100 + dx * 1.6} 4`} stroke="#15803d" strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
      <path d="M80 34 C 74 70, 78 110, 100 124 C 122 110, 126 70, 120 34 Z" fill="#bbf7d0" stroke="#15803d" strokeWidth={2} />
      <path d="M90 40 C 86 70, 88 100, 100 112 C 112 100, 114 70, 110 40 Z" fill="#fef3c7" stroke={GUT} strokeWidth={2} />
      <path d="M96 22 L 96 44 M90 38 L 96 44 L 102 38" stroke="#0284c7" strokeWidth={2} fill="none" />
      <path d="M106 44 L 106 22 M100 28 L 106 22 L 112 28" stroke="#78716c" strokeWidth={2} fill="none" />
    </svg>
  );
}

function FlatwormArt() {
  return (
    <svg viewBox="0 0 200 130" className="w-full" aria-hidden>
      <path d="M100 6 C 140 10, 150 60, 140 100 C 132 124, 68 124, 60 100 C 50 60, 60 10, 100 6 Z" fill="#e7e5e4" stroke="#57534e" strokeWidth={2} />
      <g fill="none" stroke={GUT} strokeWidth={4} strokeLinecap="round">
        <path d="M100 66 L 100 16" />
        <path d="M100 66 C 84 74, 80 92, 76 112 M100 66 C 116 74, 120 92, 124 112" />
        <path d="M100 26 l -12 -4 M100 36 l 12 -4 M100 46 l -14 -2 M100 56 l 14 -2 M82 86 l -10 4 M84 98 l 8 4 M118 86 l 10 4 M116 98 l -8 4" strokeWidth={3} />
      </g>
      <ellipse cx={100} cy={74} rx={6} ry={12} fill="#fda4af" stroke="#be123c" />
    </svg>
  );
}

function EarthwormArt({ lang }: { lang: BioLang }) {
  return (
    <svg viewBox="0 0 200 130" className="w-full" aria-hidden>
      <rect x={6} y={40} width={188} height={50} rx={25} fill="#fecdd3" stroke="#be123c" strokeWidth={2} />
      {[30, 50, 70, 90, 110, 130, 150, 170].map((x) => (
        <path key={x} d={`M${x} 42 L ${x} 88`} stroke="#fda4af" />
      ))}
      <path d="M10 65 L 40 65" stroke={GUT} strokeWidth={5} />
      <ellipse cx={54} cy={65} rx={14} ry={11} fill="#fde68a" stroke={GUT} strokeWidth={2} />
      <ellipse cx={82} cy={65} rx={14} ry={13} fill="#d6d3d1" stroke="#57534e" strokeWidth={3} />
      <path d="M96 65 L 192 65" stroke={GUT} strokeWidth={9} />
      <text x={54} y={32} textAnchor="middle" fontSize={9} fill="#475569">
        {lang === "pl" ? "wole" : "зоб"}
      </text>
      <text x={74} y={32} fontSize={9} fill="#475569">
        {lang === "pl" ? "żołądek mięśniowy" : "мускульный желудок"}
      </text>
      <text x={8} y={106} fontSize={9} fill="#475569">
        {lang === "pl" ? "otwór gębowy" : "рот"}
      </text>
      <text x={192} y={106} textAnchor="end" fontSize={9} fill="#475569">
        {lang === "pl" ? "odbyt" : "анальное отверстие"}
      </text>
    </svg>
  );
}

function BirdArt({ lang }: { lang: BioLang }) {
  return (
    <svg viewBox="0 0 200 130" className="w-full" aria-hidden>
      <path d="M8 20 L 30 14 L 30 26 Z" fill="#f59e0b" />
      <path d="M30 20 L 50 20 L 50 70" stroke={GUT} strokeWidth={5} fill="none" />
      <ellipse cx={64} cy={44} rx={14} ry={12} fill="#fde68a" stroke={GUT} strokeWidth={2} />
      <path d="M50 70 L 74 76" stroke={GUT} strokeWidth={5} />
      <ellipse cx={84} cy={78} rx={11} ry={8} fill="#fecaca" stroke="#b91c1c" strokeWidth={2} />
      <circle cx={112} cy={84} r={14} fill="#d6d3d1" stroke="#57534e" strokeWidth={4} />
      <path d="M124 92 C 150 110, 170 70, 150 64 C 132 58, 140 104, 170 104 L 188 104" stroke={GUT} strokeWidth={5} fill="none" />
      <circle cx={190} cy={104} r={5} fill="#a8a29e" />
      <text x={64} y={22} textAnchor="middle" fontSize={9} fill="#475569">
        {lang === "pl" ? "wole" : "зоб"}
      </text>
      <text x={70} y={102} textAnchor="middle" fontSize={8} fill="#475569">
        {lang === "pl" ? "ż. gruczołowy" : "железистый ж."}
      </text>
      <text x={112} y={120} textAnchor="middle" fontSize={8} fill="#475569">
        {lang === "pl" ? "ż. mięśniowy" : "мускульный ж."}
      </text>
      <text x={194} y={94} textAnchor="end" fontSize={8} fill="#475569">
        {lang === "pl" ? "kloaka" : "клоака"}
      </text>
    </svg>
  );
}

const GROUPS = (lang: BioLang): CompareCard[] => [
  {
    id: "sponges",
    icon: "🧽",
    name: r("Gąbki", "Губки"),
    art: <SpongeArt />,
    rows: [
      { label: L3.build, value: r("brak układu pokarmowego", "пищеварительной системы нет") },
      { label: L3.openings, value: r("woda z cząstkami pokarmu wpływa porami w ścianie ciała, wypływa otworem na szczycie", "вода с частицами пищи входит через поры в стенке тела, выходит через отверстие на вершине") },
      { label: L3.digestion, value: r("wyłącznie wewnątrzkomórkowe — w wodniczkach trawiennych", "только внутриклеточное — в пищеварительных вакуолях") },
      { label: L3.special, value: r("komórki kołnierzykowe wychwytują cząstki z wody — gąbki są filtratorami", "воротничковые клетки улавливают частицы из воды — губки являются фильтраторами") },
    ],
  },
  {
    id: "cnidarians",
    icon: "🪼",
    name: r("Parzydełkowce", "Кишечнополостные"),
    art: <HydraArt />,
    rows: [
      { label: L3.build, value: r("jama chłonąco-trawiąca — worek wewnątrz ciała", "гастральная полость — мешок внутри тела") },
      { label: L3.openings, value: r("jeden: otworem gębowym pokarm wpada i nim są usuwane niestrawione resztki", "одно: через рот пища попадает внутрь, и через него же удаляются непереваренные остатки") },
      { label: L3.digestion, value: r("zaczyna się w jamie (zewnątrzkomórkowe), kończy w komórkach (wewnątrzkomórkowe)", "начинается в полости (внеклеточное), заканчивается в клетках (внутриклеточное)") },
      { label: L3.special, value: r("ofiarę chwytają i paraliżują czułki z parzydełkami (np. stułbia)", "добычу ловят и парализуют щупальца со стрекательными клетками (например, гидра)") },
    ],
  },
  {
    id: "flatworms",
    icon: "🍃",
    name: r("Płazińce", "Плоские черви"),
    art: <FlatwormArt />,
    rows: [
      { label: L3.build, value: r("silnie rozgałęziona jama chłonąco-trawiąca (wypławek); tasiemce nie mają układu pokarmowego", "сильно разветвлённая пищеварительная полость (планария); у ленточных червей пищеварительной системы нет") },
      { label: L3.openings, value: r("jeden — otwór gębowy z wysuwaną gardzielą", "одно — рот с выдвижной глоткой") },
      { label: L3.digestion, value: r("zewnątrz- i wewnątrzkomórkowe", "внеклеточное и внутриклеточное") },
      { label: L3.special, value: r("odgałęzienia docierają do wszystkich części ciała, rozprowadzając pokarm; tasiemiec wchłania strawiony pokarm żywiciela całą powierzchnią ciała", "ответвления доходят до всех частей тела и разносят пищу; ленточный червь всасывает переваренную пищу хозяина всей поверхностью тела") },
    ],
  },
  {
    id: "annelids",
    icon: "🪱",
    name: r("Pierścienice", "Кольчатые черви"),
    art: <EarthwormArt lang={lang} />,
    rows: [
      { label: L3.build, value: r("przewód pokarmowy — rura biegnąca przez całe ciało", "пищеварительный тракт — трубка через всё тело") },
      { label: L3.openings, value: r("dwa: gębowy i odbytowy — pokarm przesuwa się w jednym kierunku", "два: ротовое и анальное — пища движется в одном направлении") },
      { label: L3.digestion, value: r("zewnątrzkomórkowe, w kolejnych wyspecjalizowanych odcinkach", "внеклеточное, в последовательных специализированных отделах") },
      { label: L3.special, value: r("u dżdżownicy: gardziel, przełyk, wole (magazyn), żołądek mięśniowy rozcierający pokarm z ziarnami piasku, jelito z fałdem zwiększającym powierzchnię", "у дождевого червя: глотка, пищевод, зоб (накопление), мускульный желудок, перетирающий пищу с песчинками, кишка со складкой, увеличивающей поверхность") },
    ],
  },
  {
    id: "birds",
    icon: "🐦",
    name: r("Ptaki", "Птицы"),
    art: <BirdArt lang={lang} />,
    rows: [
      { label: L3.build, value: r("przewód pokarmowy bez zębów; dziób chwyta pokarm, ale go nie żuje", "пищеварительный тракт без зубов; клюв захватывает пищу, но не жуёт её") },
      { label: L3.openings, value: r("dwa; przewód kończy się kloaką, do której uchodzą też drogi moczowe i płciowe", "два; тракт заканчивается клоакой, куда открываются также мочевые и половые пути") },
      { label: L3.digestion, value: r("chemiczne w żołądku gruczołowym, mechaniczne w żołądku mięśniowym", "химическое в железистом желудке, механическое в мускульном желудке") },
      { label: L3.special, value: r("wole gromadzi i rozmiękcza pokarm; żołądek mięśniowy rozciera go z pomocą połkniętych kamyków; szybkie trawienie zmniejsza masę ciała w locie", "зоб накапливает и размягчает пищу; мускульный желудок перетирает её с помощью проглоченных камешков; быстрое пищеварение уменьшает массу тела в полёте") },
    ],
  },
];

// ---------- adaptations ----------

const ADAPT: SortItem[] = [
  { name: r("Długie jelito i duże jelito ślepe", "Длинный кишечник и большая слепая кишка"), group: 0, why: r("Rozkład celulozy przez mikroorganizmy trwa długo.", "Расщепление целлюлозы микроорганизмами идёт долго.") },
  { name: r("Długie, stożkowate kły", "Длинные конические клыки"), group: 1, why: r("Służą do chwytania i zabijania ofiary.", "Служат для захвата и умерщвления добычи.") },
  { name: r("Trzonowce o szerokich koronach z listewkami szkliwa", "Коренные зубы с широкими коронками и складками эмали"), group: 0, why: r("Rozcierają twarde części roślin.", "Перетирают жёсткие части растений.") },
  { name: r("Łamacze — tnące zęby policzkowe", "Хищнические зубы — режущие коренные"), group: 1, why: r("Kroją mięso i kruszą kości.", "Режут мясо и дробят кости.") },
  { name: r("Diastema — przerwa między siekaczami a zębami policzkowymi", "Диастема — промежуток между резцами и коренными зубами"), group: 0, why: r("Ułatwia przesuwanie i obracanie pokarmu w jamie ustnej podczas żucia.", "Облегчает перемещение и перекладывание пищи во рту при жевании.") },
  { name: r("Krótkie jelito", "Короткий кишечник"), group: 1, why: r("Pokarm zwierzęcy jest łatwo strawny.", "Животная пища легко переваривается.") },
  { name: r("Symbiotyczne bakterie rozkładające celulozę", "Симбиотические бактерии, расщепляющие целлюлозу"), group: 0, why: r("Zwierzę samo nie wytwarza enzymu rozkładającego celulozę.", "Само животное не вырабатывает фермента, расщепляющего целлюлозу.") },
  { name: r("Żuchwa porusza się na boki — ruchy rozcierające", "Нижняя челюсть движется вбок — перетирающие движения"), group: 0, why: r("Zęby trą o siebie jak żarna.", "Зубы трутся друг о друга, как жернова.") },
  { name: r("Staw żuchwowy pozwala tylko na ruchy w górę i w dół", "Челюстной сустав допускает движения только вверх-вниз"), group: 1, why: r("Szczęki działają jak nożyce i mocno trzymają ofiarę.", "Челюсти работают как ножницы и крепко удерживают добычу.") },
  { name: r("Żołądek wielokomorowy", "Многокамерный желудок"), group: 0, why: r("Typowy dla przeżuwaczy — w żwaczu żyją mikroorganizmy.", "Типичен для жвачных — в рубце живут микроорганизмы.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Roślinożercy: duże siekacze, diastema, szerokie trzonowce, długie jelito.", ru: "Растительноядные: крупные резцы, диастема, широкие коренные зубы, длинный кишечник." },
    { pl: "Mięsożercy: długie kły, łamacze, krótkie jelito.", ru: "Плотоядные: длинные клыки, хищнические зубы, короткий кишечник." },
    { pl: "Ssaki mają uzębienie zróżnicowane (heterodontyczne): siekacze, kły, przedtrzonowce i trzonowce.", ru: "У млекопитающих дифференцированные (гетеродонтные) зубы: резцы, клыки, малые и большие коренные." },
  ],
  s2: [
    { pl: "Żołądek przeżuwacza: żwacz → czepiec → (przeżuwanie) → księgi → trawieniec.", ru: "Желудок жвачных: рубец → сетка → (жвачка) → книжка → сычуг." },
    { pl: "Celulozę rozkładają mikroorganizmy żwacza; tylko trawieniec wydziela sok żołądkowy.", ru: "Целлюлозу расщепляют микроорганизмы рубца; желудочный сок выделяет только сычуг." },
  ],
  s3: [
    { pl: "Jama chłonąco-trawiąca ma jeden otwór (parzydełkowce, płazińce); przewód pokarmowy — dwa.", ru: "Гастральная полость имеет одно отверстие (кишечнополостные, плоские черви); пищеварительный тракт — два." },
    { pl: "Wole gromadzi pokarm, żołądek mięśniowy go rozciera — u ptaków i u dżdżownicy.", ru: "Зоб накапливает пищу, мускульный желудок её перетирает — у птиц и у дождевого червя." },
  ],
  s4: [{ pl: "Budowa przewodu pokarmowego jest przystosowaniem do rodzaju pokarmu.", ru: "Строение пищеварительного тракта — приспособление к типу пищи." }],
};

export default function FeedingAnimalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="feeda" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="feeda-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={DIETS(lang)} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="feeda-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Ruminant lang={lang} />
        <div className="mt-5">
          <OrderGame
            lang={lang}
            title={r("Droga pokarmu u krowy", "Путь пищи у коровы")}
            hint={r("Ułóż kolejne etapy po połknięciu trawy.", "Расставь этапы после того, как трава проглочена.")}
            start={r("jama ustna", "ротовая полость")}
            steps={RUMEN_PATH}
          />
        </div>
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="feeda-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={GROUPS(lang)} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="feeda-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s4} groups={[r("roślinożerca", "растительноядное"), r("mięsożerca", "плотоядное")]} items={ADAPT} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
