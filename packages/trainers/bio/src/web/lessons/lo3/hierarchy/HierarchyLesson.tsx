// Lesson for LO3 §1.2 "Hierarchiczna budowa organizmu człowieka" (zakres rozszerzony): levels of
// organisation, the four tissue groups and transport across the cell membrane. Terms follow
// templates/data/organism.ts (TISSUES, HIERARCHY_AND_TRANSPORT).
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, type CompareCard } from "@portal/lessons";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Organizm człowieka zbudowany jest piętrowo: komórki tworzą tkanki, tkanki — narządy, narządy — układy narządów, a wszystkie układy razem — organizm. Każdy wyższy poziom ma cechy, których nie ma żaden z niższych, a wszystko zaczyna się od komórki i jej błony.",
    "Организм человека устроен по уровням: клетки образуют ткани, ткани — органы, органы — системы органов, а все системы вместе — организм. У каждого более высокого уровня есть свойства, которых нет у нижних, а начинается всё с клетки и её мембраны.",
  ),
  s1: r("Poziomy organizacji", "Уровни организации"),
  s1intro: r(
    "Przybliżaj obraz krok po kroku — od całego człowieka do jednej komórki wyściełającej żołądek.",
    "Приближай изображение шаг за шагом — от всего человека до одной клетки, выстилающей желудок.",
  ),
  s2: r("Cztery grupy tkanek", "Четыре группы тканей"),
  s2intro: r(
    "Tkanka to zespół komórek o podobnej budowie i funkcji wraz z substancją międzykomórkową. Porównaj, jak różnią się cztery podstawowe grupy tkanek.",
    "Ткань — совокупность клеток со сходным строением и функцией вместе с межклеточным веществом. Сравни, чем различаются четыре основные группы тканей.",
  ),
  s3: r("Transport przez błonę komórkową", "Транспорт через клеточную мембрану"),
  s3intro: r(
    "Błona komórkowa jest półprzepuszczalna: jedne cząsteczki przechodzą przez nią swobodnie, inne wcale, a jeszcze inne tylko z pomocą białek i energii. Wybierz rodzaj transportu i uruchom symulację.",
    "Клеточная мембрана полупроницаема: одни молекулы проходят через неё свободно, другие — совсем нет, а третьи — только с помощью белков и энергии. Выбери вид транспорта и запусти модель.",
  ),
  s4: r("Krwinka czerwona w roztworach", "Эритроцит в растворах"),
  s4intro: r(
    "Zmieniaj stężenie soli kuchennej w roztworze, w którym zanurzono krwinkę czerwoną, i obserwuj, dokąd płynie woda.",
    "Меняй концентрацию поваренной соли в растворе, куда помещён эритроцит, и смотри, куда движется вода.",
  ),
} satisfies Record<string, Txt>;

// ---------- zoom through the levels ----------

const ZOOM_STYLE = ".hier-zoom{animation:hier-zoom .35s ease-out}@keyframes hier-zoom{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}";

function ZoomRing({ cx, cy, rr }: { cx: number; cy: number; rr: number }) {
  return <circle cx={cx} cy={cy} r={rr} fill="none" stroke="#4f46e5" strokeWidth={2.5} strokeDasharray="6 4" />;
}

function OrganismArt() {
  return (
    <g>
      <circle cx={120} cy={28} r={16} fill="#fde68a" stroke="#92400e" strokeWidth={2} />
      <path d="M100 56 L 80 122 M140 56 L 160 122" stroke="#fcd34d" strokeWidth={10} strokeLinecap="round" />
      <path d="M110 124 L 106 192 M130 124 L 134 192" stroke="#fcd34d" strokeWidth={12} strokeLinecap="round" />
      <rect x={94} y={46} width={52} height={82} rx={18} fill="#fef3c7" stroke="#92400e" strokeWidth={2} />
      <path d="M120 44 L 120 74" stroke="#f9a8d4" strokeWidth={3} />
      <path d="M118 72 C 134 66, 142 80, 134 90 C 128 96, 116 94, 114 88 Z" fill="#f472b6" />
      <path d="M112 98 C 100 102, 102 112, 114 110 C 128 108, 138 112, 128 118 C 116 122, 108 118, 112 114" stroke="#fb923c" strokeWidth={3} fill="none" />
      <ZoomRing cx={124} cy={92} rr={26} />
    </g>
  );
}

function SystemArt() {
  return (
    <g>
      <path d="M118 6 L 118 62" stroke="#f9a8d4" strokeWidth={9} strokeLinecap="round" />
      <path d="M50 64 C 80 52, 118 58, 112 78 C 104 98, 70 102, 52 90 Z" fill="#b45309" />
      <path d="M116 60 C 150 48, 184 72, 172 102 C 162 126, 122 124, 114 108 C 110 100, 118 94, 126 98 C 136 102, 148 98, 148 88 C 148 76, 132 72, 116 76 Z" fill="#f472b6" stroke="#9d174d" strokeWidth={1.5} />
      <path d="M80 190 L 76 140 Q 76 132 86 132 L 166 132 Q 176 132 176 142 L 176 190" stroke="#a16207" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M120 124 C 98 140, 96 150, 112 152 C 136 154, 154 146, 150 160 C 146 172, 112 166, 102 174 C 92 182, 124 188, 146 180" stroke="#fb923c" strokeWidth={7} fill="none" strokeLinecap="round" />
      <ZoomRing cx={144} cy={90} rr={36} />
    </g>
  );
}

const STOMACH = "M60 34 C 150 12, 222 62, 198 122 C 178 172, 98 176, 72 142 C 60 126, 72 110, 94 116 C 122 124, 152 112, 152 90 C 152 64, 112 60, 86 66 Z";

function OrganArt({ lang }: { lang: BioLang }) {
  return (
    <g>
      <path d="M66 0 L 66 40" stroke="#be185d" strokeWidth={16} />
      <path d={STOMACH} fill="#fdf2f8" stroke="#be185d" strokeWidth={16} strokeLinejoin="round" />
      <path d={STOMACH} fill="none" stroke="#f9a8d4" strokeWidth={5} strokeLinejoin="round" />
      <path d="M150 50 L 176 22" stroke="#334155" strokeWidth={1} />
      <text x={178} y={20} fontSize={9} fill="#334155">
        {lang === "pl" ? "mięśnie gładkie" : "гладкие мышцы"}
      </text>
      <path d="M110 108 L 98 92" stroke="#334155" strokeWidth={1} />
      <text x={100} y={88} fontSize={9} fill="#334155" textAnchor="middle">
        {lang === "pl" ? "błona śluzowa" : "слизистая оболочка"}
      </text>
      <ZoomRing cx={196} cy={126} rr={18} />
    </g>
  );
}

function TissueArt() {
  return (
    <g>
      <rect x={0} y={0} width={240} height={40} fill="#fdf2f8" />
      {[30, 80, 140, 200].map((x) => (
        <ellipse key={x} cx={x} cy={18} rx={14} ry={6} fill="white" stroke="#f9a8d4" />
      ))}
      {Array.from({ length: 8 }, (_, k) => {
        const x = 12 + k * 27;
        return (
          <g key={k}>
            <rect x={x} y={40} width={26} height={90} rx={3} fill="#fbcfe8" stroke="#9d174d" strokeWidth={1.2} />
            <ellipse cx={x + 13} cy={108} rx={7} ry={9} fill="#7c3aed" />
            <circle cx={x + 13} cy={52} r={5} fill="white" stroke="#f472b6" />
          </g>
        );
      })}
      <path d="M8 133 L 232 133" stroke="#475569" strokeWidth={2} />
      <rect x={0} y={135} width={240} height={65} fill="#fffbeb" />
      {[146, 162, 178, 192].map((y, k) => (
        <path key={y} d={`M0 ${y} C 40 ${y - 8}, 80 ${y + 8}, 120 ${y} S 200 ${y - 8}, 240 ${y}`} stroke="#d6d3d1" strokeWidth={2} fill="none" opacity={k % 2 ? 1 : 0.7} />
      ))}
      <path d="M0 170 C 60 160, 140 182, 240 166" stroke="#ef4444" strokeWidth={5} fill="none" />
      <ZoomRing cx={133} cy={85} rr={30} />
    </g>
  );
}

function CellArt({ lang }: { lang: BioLang }) {
  const lbl = (x: number, y: number, tx: number, ty: number, text: string, anchor: "start" | "end") => (
    <g key={text}>
      <path d={`M${x} ${y} L ${tx} ${ty}`} stroke="#334155" strokeWidth={1} />
      <text x={tx + (anchor === "start" ? 2 : -2)} y={ty + 3} fontSize={8.5} fill="#334155" textAnchor={anchor}>
        {text}
      </text>
    </g>
  );
  return (
    <g>
      <rect x={84} y={8} width={92} height={184} rx={22} fill="#fdf2f8" stroke="#9d174d" strokeWidth={3} />
      {[
        [104, 30],
        [126, 24],
        [150, 32],
        [114, 46],
        [138, 48],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={7} fill="white" stroke="#f472b6" strokeWidth={1.5} />
      ))}
      {[70, 76, 82].map((y, k) => (
        <path key={y} d={`M${108 + k * 2} ${y} Q 130 ${y - 8} ${152 - k * 2} ${y}`} stroke="#0ea5e9" strokeWidth={2.5} fill="none" />
      ))}
      <path d="M96 118 C 104 110, 112 126, 120 116 S 136 108, 160 116" stroke="#22c55e" strokeWidth={2} fill="none" />
      {[
        [104, 98],
        [156, 100],
        [106, 176],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y} rx={12} ry={6} fill="#fdba74" stroke="#c2410c" strokeWidth={1.2} />
          <path d={`M${x - 7} ${y} l 3 -3 l 3 6 l 3 -6 l 3 6 l 2 -3`} stroke="#c2410c" strokeWidth={0.8} fill="none" />
        </g>
      ))}
      <ellipse cx={130} cy={148} rx={28} ry={24} fill="#ddd6fe" stroke="#6d28d9" strokeWidth={2} />
      <circle cx={136} cy={144} r={7} fill="#6d28d9" />
      {lbl(86, 60, 78, 60, lang === "pl" ? "błona komórkowa" : "мембрана клетки", "end")}
      {lbl(94, 98, 78, 98, lang === "pl" ? "mitochondrium" : "митохондрия", "end")}
      {lbl(98, 30, 78, 24, lang === "pl" ? "pęcherzyki ze śluzem" : "пузырьки со слизью", "end")}
      {lbl(150, 76, 182, 70, lang === "pl" ? "aparat Golgiego" : "аппарат Гольджи", "start")}
      {lbl(156, 148, 182, 148, lang === "pl" ? "jądro komórkowe" : "ядро", "start")}
      {lbl(158, 116, 182, 112, lang === "pl" ? "siateczka śródplazmatyczna" : "ЭПС", "start")}
    </g>
  );
}

interface Level {
  name: Txt;
  example: Txt;
  text: Txt;
  art: (lang: BioLang) => ReactNode;
}

const LEVELS: Level[] = [
  {
    name: r("Organizm", "Организм"),
    example: r("człowiek", "человек"),
    text: r(
      "Najwyższy poziom budowy pojedynczego człowieka. Wszystkie układy narządów współpracują, a ich pracę koordynują układ nerwowy i hormonalny — dzięki temu organizm utrzymuje homeostazę.",
      "Высший уровень строения отдельного человека. Все системы органов работают вместе, а их работу согласуют нервная и эндокринная системы — благодаря этому организм поддерживает гомеостаз.",
    ),
    art: () => <OrganismArt />,
  },
  {
    name: r("Układ narządów", "Система органов"),
    example: r("układ pokarmowy", "пищеварительная система"),
    text: r(
      "Zespół narządów współpracujących w jednym procesie życiowym. Przewód pokarmowy i gruczoły trawienne (np. wątroba) razem pobierają, trawią i wchłaniają pokarm.",
      "Совокупность органов, работающих вместе в одном жизненном процессе. Пищеварительный тракт и пищеварительные железы (например, печень) вместе поглощают, переваривают и всасывают пищу.",
    ),
    art: () => <SystemArt />,
  },
  {
    name: r("Narząd", "Орган"),
    example: r("żołądek", "желудок"),
    text: r(
      "Zespół różnych tkanek pełniący wspólnie określoną funkcję. Ścianę żołądka buduje nabłonek, tkanka łączna, tkanka mięśniowa gładka i tkanka nerwowa.",
      "Совокупность разных тканей, совместно выполняющих определённую функцию. Стенку желудка образуют эпителий, соединительная ткань, гладкая мышечная и нервная ткани.",
    ),
    art: (lang) => <OrganArt lang={lang} />,
  },
  {
    name: r("Tkanka", "Ткань"),
    example: r("nabłonek jednowarstwowy walcowaty", "однослойный цилиндрический эпителий"),
    text: r(
      "Zespół komórek o podobnej budowie i funkcji wraz z substancją międzykomórkową. Nabłonek wyściełający żołądek wydziela śluz, który chroni ścianę przed kwasem solnym; leży na tkance łącznej z naczyniami krwionośnymi.",
      "Совокупность клеток со сходным строением и функцией вместе с межклеточным веществом. Эпителий, выстилающий желудок, выделяет слизь, защищающую стенку от соляной кислоты; он лежит на соединительной ткани с кровеносными сосудами.",
    ),
    art: () => <TissueArt />,
  },
  {
    name: r("Komórka", "Клетка"),
    example: r("komórka nabłonka żołądka", "клетка эпителия желудка"),
    text: r(
      "Najmniejsza jednostka budowy i funkcji organizmu, zdolna do samodzielnego życia. Niżej są już tylko organella i cząsteczki — same nie są żywe.",
      "Наименьшая единица строения и функционирования организма, способная к самостоятельной жизни. Ниже — только органоиды и молекулы, которые сами по себе не живые.",
    ),
    art: (lang) => <CellArt lang={lang} />,
  },
];

const ZOOM = {
  in: r("Przybliż", "Приблизить"),
  out: r("Oddal", "Отдалить"),
  levels: r("Poziomy organizacji", "Уровни организации"),
  example: r("Przykład", "Пример"),
};

function LevelZoom({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const level = LEVELS[i]!;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 260 200" className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200" role="img" aria-label={`${level.name[lang]}: ${level.example[lang]}`}>
          <style>{ZOOM_STYLE}</style>
          <g key={i} className="hier-zoom" style={{ transformOrigin: "130px 100px" }}>
            <g transform="translate(10 0)">{level.art(lang)}</g>
          </g>
        </svg>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Choice onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
            − {ZOOM.out[lang]}
          </Choice>
          <Choice state="active" onClick={() => setI(Math.min(LEVELS.length - 1, i + 1))} disabled={i === LEVELS.length - 1}>
            🔍 {ZOOM.in[lang]}
          </Choice>
        </div>
      </div>
      <div className="space-y-3">
        <ol className="space-y-1.5" role="radiogroup" aria-label={ZOOM.levels[lang]}>
          {LEVELS.map((lv, k) => (
            <li key={lv.name.pl}>
              <button
                type="button"
                role="radio"
                aria-checked={k === i}
                onClick={() => setI(k)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm ring-1 transition-colors ${
                  k === i ? "bg-emerald-600 font-semibold text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                }`}
                style={{ marginLeft: `${k * 10}px`, width: `calc(100% - ${k * 10}px)` }}
              >
                <span className="tabular-nums">{k + 1}.</span> {lv.name[lang]}
              </button>
            </li>
          ))}
        </ol>
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <h3 className="text-base font-semibold text-emerald-900">{level.name[lang]}</h3>
          <p className="text-sm text-emerald-800">
            {ZOOM.example[lang]}: <b>{level.example[lang]}</b>
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{level.text[lang]}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- four tissue groups ----------

function EpitheliumArt({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 160 100" className="w-full" role="img" aria-label={label}>
      <rect width={160} height={100} rx={8} fill="#fdf2f8" />
      {[0, 1].map((row) =>
        Array.from({ length: 6 }, (_, k) => (
          <g key={`${row}-${k}`}>
            <rect x={8 + k * 24 + row * 12} y={22 + row * 26} width={24} height={26} fill="#fbcfe8" stroke="#9d174d" strokeWidth={1.2} />
            <circle cx={20 + k * 24 + row * 12} cy={35 + row * 26} r={4.5} fill="#7c3aed" />
          </g>
        )),
      )}
      <path d="M8 76 L 164 76" stroke="#475569" strokeWidth={2} />
    </svg>
  );
}

function ConnectiveArt({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 160 100" className="w-full" role="img" aria-label={label}>
      <rect width={160} height={100} rx={8} fill="#fffbeb" />
      {[22, 40, 58, 76].map((y, k) => (
        <path key={y} d={`M4 ${y} C 40 ${y - 10}, 80 ${y + 10}, 120 ${y} S 150 ${y - 6}, 158 ${y}`} stroke={k % 2 ? "#fca5a5" : "#d6d3d1"} strokeWidth={2} fill="none" />
      ))}
      {[
        [30, 30],
        [92, 48],
        [126, 22],
        [56, 74],
        [136, 76],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path d={`M${x - 12} ${y} Q ${x} ${y - 7} ${x + 12} ${y} Q ${x} ${y + 7} ${x - 12} ${y} Z`} fill="#fde68a" stroke="#a16207" />
          <circle cx={x} cy={y} r={3} fill="#7c3aed" />
        </g>
      ))}
    </svg>
  );
}

function MuscleArt({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 160 100" className="w-full" role="img" aria-label={label}>
      <rect width={160} height={100} rx={8} fill="#fff1f2" />
      {[14, 42, 70].map((y) => (
        <g key={y}>
          <rect x={6} y={y} width={148} height={22} rx={11} fill="#fda4af" stroke="#9f1239" strokeWidth={1.2} />
          {Array.from({ length: 24 }, (_, k) => (
            <path key={k} d={`M${14 + k * 6} ${y + 3} L ${14 + k * 6} ${y + 19}`} stroke="#be123c" strokeWidth={1.2} opacity={0.6} />
          ))}
          <ellipse cx={50} cy={y + 4} rx={6} ry={2.5} fill="#7c3aed" />
          <ellipse cx={116} cy={y + 18} rx={6} ry={2.5} fill="#7c3aed" />
        </g>
      ))}
    </svg>
  );
}

function NerveArt({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 160 100" className="w-full" role="img" aria-label={label}>
      <rect width={160} height={100} rx={8} fill="#eef2ff" />
      <g stroke="#4338ca" strokeWidth={2} fill="none" strokeLinecap="round">
        <path d="M34 50 L 14 30 M34 50 L 12 52 M34 50 L 18 74 M22 36 L 16 20 M18 66 L 6 70" />
        <path d="M46 50 L 148 50" strokeWidth={3} />
        <path d="M148 50 L 154 42 M148 50 L 156 50 M148 50 L 154 58" />
      </g>
      {[70, 96, 122].map((x) => (
        <rect key={x} x={x} y={44} width={20} height={12} rx={6} fill="#fef9c3" stroke="#a16207" />
      ))}
      <circle cx={38} cy={50} r={13} fill="#a5b4fc" stroke="#4338ca" strokeWidth={2} />
      <circle cx={38} cy={50} r={5} fill="#4338ca" />
    </svg>
  );
}

const TL = {
  build: r("Budowa", "Строение"),
  matrix: r("Substancja międzykomórkowa", "Межклеточное вещество"),
  role: r("Funkcje", "Функции"),
  kinds: r("Rodzaje", "Виды"),
  where: r("Przykłady", "Примеры"),
};

const tissueCards = (lang: BioLang): CompareCard[] => [
  {
    id: "epi",
    icon: "🧱",
    name: r("Nabłonkowa", "Эпителиальная"),
    art: <EpitheliumArt label={r("Nabłonkowa", "Эпителиальная")[lang]} />,
    rows: [
      { label: TL.build, value: r("komórki ściśle do siebie przylegają i leżą na błonie podstawnej; brak naczyń krwionośnych", "клетки плотно прилегают друг к другу и лежат на базальной мембране; кровеносных сосудов нет") },
      { label: TL.matrix, value: r("prawie brak", "почти нет") },
      { label: TL.role, value: r("ochrona, wydzielanie (gruczoły), wchłanianie, odbieranie bodźców", "защита, секреция (железы), всасывание, восприятие раздражений") },
      { label: TL.kinds, value: r("jedno- i wielowarstwowy; płaski, sześcienny, walcowaty", "однослойный и многослойный; плоский, кубический, цилиндрический") },
      { label: TL.where, value: r("naskórek, wyściółka jelita, ściana pęcherzyków płucnych", "эпидермис, выстилка кишечника, стенка альвеол") },
    ],
  },
  {
    id: "conn",
    icon: "🦴",
    name: r("Łączna", "Соединительная"),
    art: <ConnectiveArt label={r("Łączna", "Соединительная")[lang]} />,
    rows: [
      { label: TL.build, value: r("komórki rozproszone, oddalone od siebie", "клетки рассеяны, удалены друг от друга") },
      { label: TL.matrix, value: r("obfita: włókna (kolagenowe, sprężyste) i substancja podstawowa — płynna, galaretowata lub twarda", "обильное: волокна (коллагеновые, эластические) и основное вещество — жидкое, студенистое или твёрдое") },
      { label: TL.role, value: r("łączenie i podpora innych tkanek, transport, magazynowanie, obrona", "соединение и опора других тканей, транспорт, запасание, защита") },
      { label: TL.kinds, value: r("łączna właściwa, tłuszczowa, chrzęstna, kostna, krew i limfa", "собственно соединительная, жировая, хрящевая, костная, кровь и лимфа") },
      { label: TL.where, value: r("ścięgna, skóra właściwa, kości, chrząstki stawowe, krew", "сухожилия, дерма, кости, суставные хрящи, кровь") },
    ],
  },
  {
    id: "musc",
    icon: "💪",
    name: r("Mięśniowa", "Мышечная"),
    art: <MuscleArt label={r("Mięśniowa", "Мышечная")[lang]} />,
    rows: [
      { label: TL.build, value: r("wydłużone komórki lub włókna z białkami kurczliwymi — aktyną i miozyną", "вытянутые клетки или волокна с сократительными белками — актином и миозином") },
      { label: TL.matrix, value: r("bardzo mało", "очень мало") },
      { label: TL.role, value: r("skurcz, czyli ruch ciała i narządów", "сокращение, то есть движение тела и органов") },
      { label: TL.kinds, value: r("gładka, poprzecznie prążkowana szkieletowa, poprzecznie prążkowana sercowa", "гладкая, поперечнополосатая скелетная, поперечнополосатая сердечная") },
      { label: TL.where, value: r("mięśnie szkieletowe, ściany żołądka i naczyń, serce", "скелетные мышцы, стенки желудка и сосудов, сердце") },
    ],
  },
  {
    id: "nerv",
    icon: "⚡",
    name: r("Nerwowa", "Нервная"),
    art: <NerveArt label={r("Nerwowa", "Нервная")[lang]} />,
    rows: [
      { label: TL.build, value: r("neurony (ciało komórki, dendryty, akson) i komórki glejowe", "нейроны (тело, дендриты, аксон) и глиальные клетки") },
      { label: TL.matrix, value: r("bardzo mało", "очень мало") },
      { label: TL.role, value: r("odbieranie bodźców, przewodzenie i przetwarzanie impulsów nerwowych; glej odżywia i chroni neurony", "восприятие раздражений, проведение и обработка нервных импульсов; глия питает и защищает нейроны") },
      { label: TL.kinds, value: r("jeden rodzaj tkanki, różne typy neuronów: czuciowe, ruchowe, pośredniczące", "один вид ткани, разные типы нейронов: чувствительные, двигательные, вставочные") },
      { label: TL.where, value: r("mózgowie, rdzeń kręgowy, nerwy", "головной мозг, спинной мозг, нервы") },
    ],
  },
];

// ---------- membrane transport simulation ----------

type Mode = "diff" | "osmo" | "active";
type Kind = "o2" | "water" | "solute" | "na" | "k";

interface Particle {
  kind: Kind;
  x0: number;
  /** height as a fraction of the liquid column (0 = bottom, 1 = surface) */
  y0: number;
  x1: number;
  y1: number;
  /** the pump the particle passes through, for active transport */
  via?: [number, number];
  delay: number;
  dur: number;
}

const BOTTOM = 188;
const FULL = 172;
const MID = 160;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function build(mode: Mode): Particle[] {
  const rand = seeded(mode === "diff" ? 11 : mode === "osmo" ? 23 : 37);
  const left = () => 20 + rand() * 120;
  const right = () => 180 + rand() * 120;
  const fy = () => 0.06 + rand() * 0.86;
  const still = (kind: Kind, side: "L" | "R"): Particle => {
    const x = side === "L" ? left() : right();
    const y = fy();
    return { kind, x0: x, y0: y, x1: x, y1: y, delay: 0, dur: 1 };
  };
  const moving = (kind: Kind, from: "L" | "R", delay: number, dur: number, via?: [number, number]): Particle => ({
    kind,
    x0: from === "L" ? left() : right(),
    y0: fy(),
    x1: from === "L" ? right() : left(),
    y1: fy(),
    via,
    delay,
    dur,
  });
  const ps: Particle[] = [];
  if (mode === "diff") {
    for (let k = 0; k < 8; k++) ps.push(moving("o2", "L", 0.04 + k * 0.08, 0.3));
    for (let k = 0; k < 12; k++) ps.push(still("o2", "L"));
    for (let k = 0; k < 4; k++) ps.push(still("o2", "R"));
  } else if (mode === "osmo") {
    for (let k = 0; k < 8; k++) ps.push(still("solute", "L"));
    for (let k = 0; k < 2; k++) ps.push(still("solute", "R"));
    for (let k = 0; k < 10; k++) ps.push(still("water", "L"));
    for (let k = 0; k < 12; k++) ps.push(still("water", "R"));
    for (let k = 0; k < 6; k++) ps.push(moving("water", "R", 0.04 + k * 0.12, 0.28));
  } else {
    // sodium–potassium pump: each cycle uses one ATP, takes 3 Na⁺ out of the cell and 2 K⁺ in
    const pump: [number, number] = [MID, 0.5];
    for (let c = 0; c < 3; c++) {
      const d = 0.06 + c * 0.3;
      for (let k = 0; k < 3; k++) ps.push(moving("na", "R", d + k * 0.02, 0.24, pump));
      for (let k = 0; k < 2; k++) ps.push(moving("k", "L", d + 0.03 + k * 0.02, 0.24, pump));
    }
    for (let k = 0; k < 1; k++) ps.push(still("na", "R"));
    for (let k = 0; k < 12; k++) ps.push(still("na", "L"));
    for (let k = 0; k < 9; k++) ps.push(still("k", "R"));
    for (let k = 0; k < 1; k++) ps.push(still("k", "L"));
  }
  return ps;
}

const ease = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p));

/** where a particle is at time t (0…1), before the liquid height is applied */
function place(p: Particle, t: number): { x: number; y: number; done: number } {
  const done = ease((t - p.delay) / p.dur);
  if (p.via) {
    const [vx, vy] = p.via;
    if (done < 0.5) {
      const q = done * 2;
      return { x: p.x0 + (vx - p.x0) * q, y: p.y0 + (vy - p.y0) * q, done };
    }
    const q = (done - 0.5) * 2;
    return { x: vx + (p.x1 - vx) * q, y: vy + (p.y1 - vy) * q, done };
  }
  return { x: p.x0 + (p.x1 - p.x0) * done, y: p.y0 + (p.y1 - p.y0) * done, done };
}

const LOOK: Record<Kind, { r: number; fill: string; stroke: string }> = {
  o2: { r: 4.5, fill: "#38bdf8", stroke: "#0369a1" },
  water: { r: 3, fill: "#93c5fd", stroke: "#1d4ed8" },
  solute: { r: 7, fill: "#c4b5fd", stroke: "#6d28d9" },
  na: { r: 4.5, fill: "#fdba74", stroke: "#c2410c" },
  k: { r: 4.5, fill: "#a78bfa", stroke: "#5b21b6" },
};

const KIND_NAME: Record<Kind, Txt> = {
  o2: r("tlen O₂", "кислород O₂"),
  water: r("woda", "вода"),
  solute: r("cukier (nie przechodzi)", "сахар (не проходит)"),
  na: r("jony Na⁺", "ионы Na⁺"),
  k: r("jony K⁺", "ионы K⁺"),
};

const MODES: { id: Mode; name: Txt; text: Txt; sides: [Txt, Txt]; done: Txt }[] = [
  {
    id: "diff",
    name: r("Dyfuzja", "Диффузия"),
    text: r(
      "Cząsteczki samorzutnie przemieszczają się z miejsca o wyższym stężeniu do miejsca o niższym — zgodnie z gradientem stężeń, bez nakładu energii. Tak przez błonę przechodzą np. tlen i dwutlenek węgla.",
      "Молекулы самопроизвольно перемещаются из места с более высокой концентрацией в место с более низкой — по градиенту концентрации, без затрат энергии. Так через мембрану проходят, например, кислород и углекислый газ.",
    ),
    sides: [r("na zewnątrz komórki", "снаружи клетки"), r("wnętrze komórki", "внутри клетки")],
    done: r("Stężenia się wyrównały. Cząsteczki nadal się poruszają, ale tyle samo przechodzi w każdą stronę.", "Концентрации выровнялись. Молекулы по-прежнему движутся, но в каждую сторону проходит столько же."),
  },
  {
    id: "osmo",
    name: r("Osmoza", "Осмос"),
    text: r(
      "Błona przepuszcza wodę, ale nie cząsteczki cukru. Woda przenika z roztworu o mniejszym stężeniu (hipotonicznego) do roztworu bardziej stężonego (hipertonicznego) — poziom płynu po tej stronie rośnie.",
      "Мембрана пропускает воду, но не молекулы сахара. Вода переходит из раствора с меньшей концентрацией (гипотонического) в более концентрированный (гипертонический) — уровень жидкости с этой стороны растёт.",
    ),
    sides: [r("roztwór hipertoniczny", "гипертонический раствор"), r("roztwór hipotoniczny", "гипотонический раствор")],
    done: r("Woda przeszła na stronę bardziej stężonego roztworu i rozcieńczyła go.", "Вода перешла на сторону более концентрированного раствора и разбавила его."),
  },
  {
    id: "active",
    name: r("Transport aktywny", "Активный транспорт"),
    text: r(
      "Białko błonowe — pompa sodowo-potasowa — przenosi jony wbrew gradientowi stężeń kosztem energii z ATP: w jednym cyklu wyrzuca z komórki 3 jony Na⁺ i wprowadza 2 jony K⁺.",
      "Мембранный белок — натрий-калиевый насос — переносит ионы против градиента концентрации за счёт энергии АТФ: за один цикл выводит из клетки 3 иона Na⁺ и вводит 2 иона K⁺.",
    ),
    sides: [r("na zewnątrz komórki", "снаружи клетки"), r("wnętrze komórki", "внутри клетки")],
    done: r("Jony Na⁺ zgromadziły się na zewnątrz, a K⁺ wewnątrz komórki — choć już wcześniej było ich tam więcej.", "Ионы Na⁺ накопились снаружи, а K⁺ — внутри клетки, хотя их там и раньше было больше."),
  },
];

const SIM = {
  play: r("▶ Uruchom", "▶ Запустить"),
  pause: r("⏸ Pauza", "⏸ Пауза"),
  time: r("Czas", "Время"),
  atp: r("Zużyte ATP", "Израсходовано АТФ"),
  kinds: r("Rodzaj transportu", "Вид транспорта"),
  left: r("lewa strona", "слева"),
  right: r("prawa strona", "справа"),
};

function MembraneSim({ lang }: { lang: BioLang }) {
  const [mode, setMode] = useState<Mode>("diff");
  const [t, setT] = useState(0);
  const [play, setPlay] = useState(false);
  const tRef = useRef(0);
  const particles = useMemo(() => build(mode), [mode]);
  const info = MODES.find((m) => m.id === mode)!;

  useEffect(() => {
    if (!play) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const next = Math.min(1, tRef.current + (now - last) / 8000);
      last = now;
      tRef.current = next;
      setT(next);
      if (next < 1) raf = requestAnimationFrame(step);
      else setPlay(false);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [play]);

  const choose = (m: Mode) => {
    setMode(m);
    setPlay(false);
    tRef.current = 0;
    setT(0);
  };
  const scrub = (v: number) => {
    setPlay(false);
    tRef.current = v;
    setT(v);
  };
  const start = () => {
    if (tRef.current >= 1) {
      tRef.current = 0;
      setT(0);
    }
    setPlay(!play);
  };

  const placed = particles.map((p) => ({ p, ...place(p, t) }));
  // osmosis: the liquid column on each side grows with the water it holds
  const waterL = mode === "osmo" ? 10 + placed.filter((q) => q.p.kind === "water" && q.p.x0 > MID).reduce((s, q) => s + q.done, 0) : 0;
  const height = (side: "L" | "R") => (mode !== "osmo" ? FULL : FULL * (0.3 + 0.033 * (side === "L" ? waterL : 28 - waterL)));
  const atp = mode === "active" ? [0, 1, 2].filter((c) => t >= 0.06 + c * 0.3 + 0.12).length : 0;
  const pumping = mode === "active" && [0, 1, 2].some((c) => t > 0.06 + c * 0.3 && t < 0.06 + c * 0.3 + 0.28);
  const kinds = [...new Set(particles.map((p) => p.kind))];
  const count = (kind: Kind, side: "L" | "R") => placed.filter((q) => q.p.kind === kind && q.x < MID === (side === "L")).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={SIM.kinds[lang]}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => choose(m.id)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              mode === m.id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {m.name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 320 214" className="w-full select-none" role="img" aria-label={info.name[lang]}>
            <rect x={8} y={14} width={304} height={176} rx={10} fill="#f8fafc" stroke="#cbd5e1" />
            {(["L", "R"] as const).map((side) => {
              const h = height(side);
              return (
                <rect
                  key={side}
                  x={side === "L" ? 10 : MID + 10}
                  y={BOTTOM - h}
                  width={140}
                  height={h}
                  fill={mode === "osmo" && side === "L" ? "#ddd6fe" : "#e0f2fe"}
                  opacity={0.8}
                />
              );
            })}
            {/* phospholipid bilayer */}
            <rect x={MID - 8} y={14} width={16} height={176} fill="#fef3c7" />
            {Array.from({ length: 22 }, (_, k) => (
              <g key={k}>
                <circle cx={MID - 6} cy={18 + k * 8} r={3} fill="#f59e0b" />
                <circle cx={MID + 6} cy={18 + k * 8} r={3} fill="#f59e0b" />
              </g>
            ))}
            {mode === "active" && (
              <g>
                <rect x={MID - 13} y={BOTTOM - 0.5 * FULL - 18} width={26} height={36} rx={8} fill={pumping ? "#4f46e5" : "#818cf8"} stroke="#312e81" strokeWidth={1.5} />
                <text x={MID} y={BOTTOM - 0.5 * FULL + 32} textAnchor="middle" fontSize={9} fontWeight={700} fill="#312e81">
                  {pumping ? (lang === "pl" ? "ATP → ADP" : "АТФ → АДФ") : lang === "pl" ? "pompa" : "насос"}
                </text>
              </g>
            )}
            {placed.map(({ p, x, y }, k) => {
              const side = x < MID ? "L" : "R";
              const wig = t > 0 && t < 1 ? Math.sin(t * 90 + k * 2.3) * 2 : 0;
              const lk = LOOK[p.kind];
              return (
                <circle
                  key={k}
                  cx={x + wig}
                  cy={BOTTOM - y * height(side) + Math.cos(t * 70 + k) * (t > 0 && t < 1 ? 1.5 : 0)}
                  r={lk.r}
                  fill={lk.fill}
                  stroke={lk.stroke}
                  strokeWidth={1}
                />
              );
            })}
            <text x={80} y={208} textAnchor="middle" fontSize={10} fill="#475569">
              {info.sides[0][lang]}
            </text>
            <text x={240} y={208} textAnchor="middle" fontSize={10} fill="#475569">
              {info.sides[1][lang]}
            </text>
            <text x={MID} y={10} textAnchor="middle" fontSize={9} fill="#92400e">
              {lang === "pl" ? "błona komórkowa" : "клеточная мембрана"}
            </text>
          </svg>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Choice state="active" onClick={start}>
              {play ? SIM.pause[lang] : SIM.play[lang]}
            </Choice>
            <label className="flex min-w-[160px] flex-1 items-center gap-2 text-sm text-slate-600">
              {SIM.time[lang]}
              <input type="range" min={0} max={100} value={Math.round(t * 100)} onChange={(e) => scrub(Number(e.target.value) / 100)} className="h-2 flex-1 cursor-pointer accent-emerald-600" />
            </label>
          </div>
        </div>
        <div className="space-y-3" aria-live="polite">
          <p className="text-[15px] leading-relaxed text-slate-700">{info.text[lang]}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-1 font-medium" />
                <th className="py-1 font-medium">{SIM.left[lang]}</th>
                <th className="py-1 font-medium">{SIM.right[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {kinds.map((kind) => (
                <tr key={kind} className="border-t border-slate-200">
                  <th scope="row" className="py-1.5 pr-2 text-left font-medium text-slate-700">
                    <span className="mr-1.5 inline-block h-3 w-3 rounded-full align-middle" style={{ background: LOOK[kind].fill, border: `1px solid ${LOOK[kind].stroke}` }} />
                    {KIND_NAME[kind][lang]}
                  </th>
                  <td className="py-1.5 tabular-nums">{count(kind, "L")}</td>
                  <td className="py-1.5 tabular-nums">{count(kind, "R")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {mode === "active" && (
            <p className="text-sm text-slate-700">
              {SIM.atp[lang]}: <b className="tabular-nums">{atp}</b>
            </p>
          )}
          {t >= 1 && <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-950 ring-1 ring-emerald-200">{info.done[lang]}</p>}
        </div>
      </div>
    </div>
  );
}

// ---------- red blood cell in a salt solution ----------

/** a crenated outline: a circle with small bumps */
function spiky(cx: number, cy: number, rad: number, bumps: number, depth: number) {
  const pts: string[] = [];
  for (let k = 0; k <= bumps * 2; k++) {
    const a = (k / (bumps * 2)) * Math.PI * 2;
    const rr = k % 2 ? rad - depth : rad + depth;
    pts.push(`${k ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `${pts.join(" ")} Z`;
}

function BloodCell({ lang }: { lang: BioLang }) {
  const [c, setC] = useState(9); // tenths of a percent of NaCl
  const pct = c / 10;
  const state = pct < 0.45 ? "lysis" : pct < 0.85 ? "swell" : pct <= 0.95 ? "iso" : "shrink";
  const rad = state === "swell" ? 44 + (0.85 - pct) * 30 : state === "shrink" ? Math.max(26, 40 - (pct - 0.95) * 9) : 40;
  const arrowsIn = state === "swell" || state === "lysis";
  const arrowsOut = state === "shrink";
  const text = {
    lysis: r(
      "Roztwór silnie hipotoniczny: woda napływa do krwinki tak szybko, że błona pęka — hemoglobina wydostaje się do roztworu. To hemoliza.",
      "Сильно гипотонический раствор: вода поступает в эритроцит так быстро, что мембрана разрывается и гемоглобин выходит в раствор. Это гемолиз.",
    ),
    swell: r(
      "Roztwór hipotoniczny: wewnątrz krwinki stężenie jest wyższe, więc woda wnika do niej przez osmozę — krwinka pęcznieje i traci dwuwklęsły kształt.",
      "Гипотонический раствор: внутри эритроцита концентрация выше, поэтому вода входит в него путём осмоса — клетка набухает и теряет двояковогнутую форму.",
    ),
    iso: r(
      "Roztwór izotoniczny (0,9% NaCl — sól fizjologiczna): woda wnika i wypływa w równym tempie, krwinka zachowuje dwuwklęsły kształt. Dlatego kroplówki podaje się w roztworze izotonicznym.",
      "Изотонический раствор (0,9% NaCl — физиологический раствор): вода входит и выходит с одинаковой скоростью, эритроцит сохраняет двояковогнутую форму. Поэтому капельницы делают на изотоническом растворе.",
    ),
    shrink: r(
      "Roztwór hipertoniczny: na zewnątrz stężenie jest wyższe, więc woda wypływa z krwinki — krwinka kurczy się i marszczy.",
      "Гипертонический раствор: снаружи концентрация выше, поэтому вода выходит из эритроцита — клетка сжимается и сморщивается.",
    ),
  }[state];
  const name = {
    lysis: r("hemoliza", "гемолиз"),
    swell: r("roztwór hipotoniczny", "гипотонический раствор"),
    iso: r("roztwór izotoniczny", "изотонический раствор"),
    shrink: r("roztwór hipertoniczny", "гипертонический раствор"),
  }[state];
  const arrows = [0, 1, 2, 3, 4, 5].map((k) => (k / 6) * Math.PI * 2 + 0.3);
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 240 200" className="mx-auto w-full max-w-[360px]" role="img" aria-label={name[lang]}>
          <defs>
            <marker id="hier-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#0284c7" />
            </marker>
          </defs>
          <rect width={240} height={200} rx={12} fill={`hsl(200, 80%, ${97 - pct * 6}%)`} />
          {state === "lysis" ? (
            <g>
              <circle cx={120} cy={100} r={64} fill="#fecaca" opacity={0.5} />
              {[0, 1, 2, 3, 4].map((k) => {
                const a0 = (k / 5) * Math.PI * 2;
                const a1 = a0 + 0.9;
                const rr = 52;
                return (
                  <path
                    key={k}
                    d={`M${120 + rr * Math.cos(a0)} ${100 + rr * Math.sin(a0)} A ${rr} ${rr} 0 0 1 ${120 + rr * Math.cos(a1)} ${100 + rr * Math.sin(a1)}`}
                    stroke="#b91c1c"
                    strokeWidth={3}
                    fill="none"
                  />
                );
              })}
            </g>
          ) : state === "shrink" ? (
            <path d={spiky(120, 100, rad, 14, 3.5)} fill="#ef4444" stroke="#991b1b" strokeWidth={2} style={{ transition: "d .3s" }} />
          ) : (
            <g>
              <circle cx={120} cy={100} r={rad} fill="#ef4444" stroke="#991b1b" strokeWidth={2} style={{ transition: "r .3s" }} />
              {state === "iso" && <circle cx={120} cy={100} r={rad * 0.42} fill="#fca5a5" />}
            </g>
          )}
          {(arrowsIn || arrowsOut) &&
            arrows.map((a) => {
              const far = 96;
              const near = Math.min(rad, 56) + 8;
              const [from, to] = arrowsIn ? [far, near] : [near, far];
              return (
                <path
                  key={a}
                  d={`M${120 + from * Math.cos(a)} ${100 + from * Math.sin(a)} L ${120 + to * Math.cos(a)} ${100 + to * Math.sin(a)}`}
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  markerEnd="url(#hier-arrow)"
                />
              );
            })}
          {state === "iso" &&
            [0.4, 2.5, 4.6].map((a) => (
              <path
                key={a}
                d={`M${120 + 92 * Math.cos(a)} ${100 + 92 * Math.sin(a)} L ${120 + 52 * Math.cos(a)} ${100 + 52 * Math.sin(a)}`}
                stroke="#0284c7"
                strokeWidth={2}
                markerStart="url(#hier-arrow)"
                markerEnd="url(#hier-arrow)"
              />
            ))}
        </svg>
        <label className="mt-2 block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Stężenie NaCl w roztworze" : "Концентрация NaCl в растворе"}: <span className="tabular-nums">{num(pct, 1)}%</span>
          <input
            type="range"
            min={0}
            max={30}
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-sky-600"
            aria-valuetext={`${num(pct, 1)}%`}
          />
          <span className="mt-1 flex justify-between text-xs font-normal text-slate-500">
            <span>{lang === "pl" ? "woda destylowana" : "дистиллированная вода"}</span>
            <span>3%</span>
          </span>
        </label>
      </div>
      <div className="rounded-xl bg-sky-50 p-4 ring-1 ring-sky-200" aria-live="polite">
        <h3 className="text-base font-semibold text-sky-900">{name[lang]}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-sky-950">{text[lang]}</p>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Komórka → tkanka → narząd → układ narządów → organizm.", "Клетка → ткань → орган → система органов → организм."),
    r("Narząd zbudowany jest z kilku różnych tkanek, a układ — z narządów współpracujących w jednym procesie życiowym.", "Орган состоит из нескольких разных тканей, а система — из органов, работающих в одном жизненном процессе."),
  ],
  s2: [
    r("Cztery grupy tkanek: nabłonkowa, łączna, mięśniowa i nerwowa.", "Четыре группы тканей: эпителиальная, соединительная, мышечная и нервная."),
    r("Tkanka łączna ma najwięcej substancji międzykomórkowej, nabłonek — prawie wcale.", "У соединительной ткани больше всего межклеточного вещества, у эпителия — почти нет."),
  ],
  s3: [
    r("Dyfuzja i osmoza to transport bierny — zgodnie z gradientem stężeń, bez ATP.", "Диффузия и осмос — пассивный транспорт: по градиенту концентрации, без АТФ."),
    r("Transport aktywny przenosi substancje wbrew gradientowi stężeń i zużywa ATP.", "Активный транспорт переносит вещества против градиента концентрации и тратит АТФ."),
  ],
  s4: [
    r("Woda przenika przez osmozę do roztworu o wyższym stężeniu.", "При осмосе вода переходит в раствор с более высокой концентрацией."),
    r("Krwinka w roztworze hipotonicznym pęcznieje (aż do hemolizy), w hipertonicznym — kurczy się; 0,9% NaCl jest izotoniczny z osoczem.", "В гипотоническом растворе эритроцит набухает (вплоть до гемолиза), в гипертоническом — сморщивается; 0,9% NaCl изотоничен плазме."),
  ],
};

export default function HierarchyLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="hier" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="hier-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <LevelZoom lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="hier-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={tissueCards(lang)} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="hier-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MembraneSim lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="hier-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <BloodCell lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
