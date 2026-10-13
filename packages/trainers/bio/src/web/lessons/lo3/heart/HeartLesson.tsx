// Lesson for LO3 §6.3 "Budowa i funkcje układu krwionośnego" and §6.4 "Funkcjonowanie układu
// krwionośnego" (Biologia na czasie 3, zakres rozszerzony) — one lesson for both paragraphs, since the
// heart's build only makes sense together with its cycle. Terms follow templates/data/circulation.ts.
import { useEffect, useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, OrderGame, PartMap, type CompareCard, type MapPart } from "../../games.tsx";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Serce to pompa złożona z dwóch połówek: prawa tłoczy krew odtlenowaną do płuc, lewa — utlenowaną do całego ciała. Kurczy się ok. 70 razy na minutę przez całe życie, a jego rytm nadaje własny „rozrusznik” — węzeł zatokowo-przedsionkowy.",
    "Сердце — насос из двух половин: правая гонит венозную кровь в лёгкие, левая — артериальную по всему телу. Оно сокращается около 70 раз в минуту всю жизнь, а ритм ему задаёт собственный «водитель ритма» — синусно-предсердный узел.",
  ),
  s1: r("Budowa serca", "Строение сердца"),
  s1intro: r(
    "Przekrój serca widziany od przodu — prawa strona serca jest po lewej stronie rysunku. Kolor niebieski to krew odtlenowana, czerwony — utlenowana.",
    "Разрез сердца спереди — правая половина сердца находится слева на рисунке. Синий цвет — венозная кровь, красный — артериальная.",
  ),
  s2: r("Cykl pracy serca", "Сердечный цикл"),
  s2intro: r("Przy 75 skurczach na minutę jeden cykl trwa 0,8 s. Prześledź, co dzieje się z jamami serca i zastawkami.", "При 75 сокращениях в минуту один цикл длится 0,8 с. Проследи, что происходит с камерами сердца и клапанами."),
  s3: r("Krwiobieg duży i mały", "Большой и малый круги кровообращения"),
  s3intro: r(
    "Ułóż drogę krwi od lewej komory przez całe ciało i płuca z powrotem do lewej komory.",
    "Выстрой путь крови от левого желудочка через всё тело и лёгкие обратно в левый желудочек.",
  ),
  s4: r("Tętnice, żyły, naczynia włosowate", "Артерии, вены, капилляры"),
  s4intro: r("Budowa naczyń wynika z ciśnienia krwi, która nimi płynie.", "Строение сосудов определяется давлением крови, которая по ним течёт."),
} satisfies Record<string, Txt>;

// ---------- heart map ----------

type HeartPart = "ra" | "rv" | "la" | "lv" | "av" | "semilunar" | "aorta" | "trunk" | "cavae" | "pulmVeins" | "sa";

const PARTS: Record<HeartPart, MapPart> = {
  ra: { name: r("Prawy przedsionek", "Правое предсердие"), text: r("Przyjmuje krew odtlenowaną z żył głównych górnej i dolnej.", "Принимает венозную кровь из верхней и нижней полых вен."), pin: [30, 96], to: [86, 112] },
  rv: { name: r("Prawa komora", "Правый желудочек"), text: r("Tłoczy krew do pnia płucnego, czyli do krwiobiegu małego. Ściana jest cieńsza niż w lewej komorze, bo do płuc wystarczy niższe ciśnienie.", "Нагнетает кровь в лёгочный ствол, то есть в малый круг. Стенка тоньше, чем у левого желудочка: для лёгких хватает меньшего давления."), pin: [40, 280], to: [112, 236] },
  la: { name: r("Lewy przedsionek", "Левое предсердие"), text: r("Przyjmuje krew utlenowaną z żył płucnych.", "Принимает артериальную кровь из лёгочных вен."), pin: [330, 186], to: [262, 140] },
  lv: { name: r("Lewa komora", "Левый желудочек"), text: r("Ma najgrubszą ścianę mięśniową, bo tłoczy krew do aorty pod najwyższym ciśnieniem — do całego ciała.", "У него самая толстая мышечная стенка: он нагнетает кровь в аорту под наибольшим давлением — во всё тело."), pin: [324, 290], to: [240, 246] },
  av: {
    name: r("Zastawki przedsionkowo-komorowe", "Предсердно-желудочковые клапаны"),
    text: r("Między przedsionkami a komorami: trójdzielna po prawej, dwudzielna (mitralna) po lewej. Zamykają się w czasie skurczu komór i nie pozwalają krwi cofnąć się do przedsionków.", "Между предсердиями и желудочками: трёхстворчатый справа, двустворчатый (митральный) слева. Закрываются при сокращении желудочков и не дают крови вернуться в предсердия."),
    pin: [184, 330],
    to: [232, 176],
  },
  semilunar: {
    name: r("Zastawki półksiężycowate", "Полулунные клапаны"),
    text: r("U ujścia aorty i pnia płucnego. Zamykają się po skurczu komór, by krew nie wróciła z tętnic do serca.", "У основания аорты и лёгочного ствола. Закрываются после сокращения желудочков, чтобы кровь не вернулась из артерий в сердце."),
    pin: [270, 36],
    to: [210, 160],
  },
  aorta: { name: r("Aorta", "Аорта"), text: r("Największa tętnica ciała — wyprowadza krew utlenowaną z lewej komory do krwiobiegu dużego.", "Самая крупная артерия — выводит артериальную кровь из левого желудочка в большой круг."), pin: [330, 60], to: [296, 90] },
  trunk: { name: r("Pień płucny", "Лёгочный ствол"), text: r("Wyprowadza krew odtlenowaną z prawej komory; dzieli się na tętnice płucne. To tętnica, choć płynie nią krew odtlenowana!", "Выводит венозную кровь из правого желудочка; делится на лёгочные артерии. Это артерия, хотя по ней течёт венозная кровь!"), pin: [120, 20], to: [150, 50] },
  cavae: { name: r("Żyły główne", "Полые вены"), text: r("Żyła główna górna i dolna doprowadzają krew odtlenowaną z całego ciała do prawego przedsionka.", "Верхняя и нижняя полые вены приносят венозную кровь от всего тела в правое предсердие."), pin: [40, 20], to: [96, 40] },
  pulmVeins: { name: r("Żyły płucne", "Лёгочные вены"), text: r("Doprowadzają krew utlenowaną z płuc do lewego przedsionka. To żyły, choć płynie nimi krew utlenowana!", "Приносят артериальную кровь из лёгких в левое предсердие. Это вены, хотя по ним течёт артериальная кровь!") },
  sa: {
    name: r("Węzeł zatokowo-przedsionkowy", "Синусно-предсердный узел"),
    text: r("Skupisko komórek w ścianie prawego przedsionka, które samo wytwarza impulsy — rozrusznik serca. Dzięki niemu serce kurczy się automatycznie, nawet bez udziału układu nerwowego (automatyzm serca).", "Скопление клеток в стенке правого предсердия, которое само генерирует импульсы, — водитель ритма. Благодаря ему сердце сокращается автоматически, даже без нервной системы (автоматия сердца)."),
  },
};

const BLUE = "#60a5fa";
const RED = "#f87171";

function HeartMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<HeartPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 360 340"
      title={r("Przekrój serca", "Разрез сердца")}
      labelOrder={["ra", "rv", "la", "lv", "av", "semilunar", "aorta", "trunk", "cavae"]}
      pinRadius={15}
      art={({ part, tone }) => (
        <>
          {part(
            "cavae",
            <g fill={tone("cavae", "#3b82f6")}>
              <rect x={92} y={14} width={26} height={74} rx={6} />
              <rect x={52} y={140} width={24} height={190} rx={6} />
              <rect x={60} y={140} width={34} height={22} />
            </g>,
          )}
          {part(
            "pulmVeins",
            <g fill={tone("pulmVeins", "#ef4444")}>
              <rect x={286} y={100} width={66} height={14} rx={5} />
              <rect x={286} y={128} width={66} height={14} rx={5} />
            </g>,
          )}
          {part(
            "aorta",
            <path d="M206 176 C 206 100, 226 50, 262 46 C 300 42, 314 70, 314 110 L 314 150" fill="none" stroke={tone("aorta", "#dc2626")} strokeWidth={22} strokeLinecap="butt" />,
          )}
          {part(
            "trunk",
            <g fill="none" stroke={tone("trunk", "#2563eb")} strokeWidth={20}>
              <path d="M150 178 C 150 120, 156 70, 166 48" />
              <path d="M166 48 L 120 36 M166 48 L 214 34" strokeWidth={12} />
            </g>,
          )}
          {part("ra", <path d="M70 112 C 70 82, 108 72, 150 84 L 172 92 L 172 170 L 80 172 C 70 152, 68 132, 70 112 Z" fill={tone("ra", BLUE)} stroke="#1e3a8a" strokeWidth={3} />)}
          {part("rv", <path d="M80 178 L 172 178 L 176 300 C 130 290, 90 240, 80 178 Z" fill={tone("rv", BLUE)} stroke="#1e3a8a" strokeWidth={5} />)}
          {part("la", <path d="M190 92 L 212 82 C 252 70, 290 82, 290 112 C 292 140, 286 160, 282 170 L 190 170 Z" fill={tone("la", RED)} stroke="#7f1d1d" strokeWidth={3} />)}
          {part("lv", <path d="M190 178 L 284 178 C 292 232, 252 292, 180 306 Z" fill={tone("lv", RED)} stroke="#7f1d1d" strokeWidth={11} strokeLinejoin="round" />)}
          {part(
            "av",
            <g fill="none" stroke={tone("av", "#fef3c7")} strokeWidth={5} strokeLinecap="round">
              <path d="M90 175 L 120 188 M162 175 L 132 188" />
              <path d="M200 175 L 230 188 M274 175 L 244 188" />
              <rect x={86} y={166} width={190} height={22} fill="transparent" stroke="none" />
            </g>,
          )}
          {part(
            "semilunar",
            <g fill={tone("semilunar", "#fef3c7")} stroke="#78350f" strokeWidth={1}>
              <path d="M140 176 Q 150 166 160 176 Z" />
              <path d="M196 176 Q 206 166 216 176 Z" />
            </g>,
          )}
          {part(
            "sa",
            <g>
              <circle cx={128} cy={96} r={9} fill={tone("sa", "#facc15")} stroke="#a16207" strokeWidth={2} />
              <path d="M128 86 L 130 92 L 136 92 L 131 96 L 133 102 L 128 98 L 123 102 L 125 96 L 120 92 L 126 92 Z" fill="#a16207" />
            </g>,
          )}
          <rect x={172} y={92} width={18} height={214} fill="#fda4af" pointerEvents="none" />
        </>
      )}
    />
  );
}

// ---------- cardiac cycle ----------

interface Phase {
  name: Txt;
  ms: number;
  text: Txt;
  atria: boolean;
  ventricles: boolean;
  avOpen: boolean;
  slOpen: boolean;
}

const PHASES: Phase[] = [
  {
    name: r("Skurcz przedsionków", "Систола предсердий"),
    ms: 100,
    text: r("Przedsionki kurczą się i dopychają krew do komór przez otwarte zastawki przedsionkowo-komorowe.", "Предсердия сокращаются и дожимают кровь в желудочки через открытые предсердно-желудочковые клапаны."),
    atria: true,
    ventricles: false,
    avOpen: true,
    slOpen: false,
  },
  {
    name: r("Skurcz komór", "Систола желудочков"),
    ms: 300,
    text: r(
      "Komory kurczą się. Ciśnienie zatrzaskuje zastawki przedsionkowo-komorowe (pierwszy ton serca) i otwiera półksiężycowate — krew płynie do aorty i pnia płucnego. Na końcu zamykają się zastawki półksiężycowate (drugi ton).",
      "Желудочки сокращаются. Давление захлопывает предсердно-желудочковые клапаны (первый тон сердца) и открывает полулунные — кровь идёт в аорту и лёгочный ствол. В конце закрываются полулунные клапаны (второй тон).",
    ),
    atria: false,
    ventricles: true,
    avOpen: false,
    slOpen: true,
  },
  {
    name: r("Rozkurcz (pauza)", "Диастола (пауза)"),
    ms: 400,
    text: r(
      "Wszystkie jamy są rozluźnione. Krew z żył napływa do przedsionków i — przez otwarte zastawki przedsionkowo-komorowe — swobodnie spływa do komór. Mięsień serca odpoczywa najdłużej w całym cyklu.",
      "Все камеры расслаблены. Кровь из вен поступает в предсердия и через открытые предсердно-желудочковые клапаны свободно стекает в желудочки. Сердечная мышца отдыхает дольше всего за цикл.",
    ),
    atria: false,
    ventricles: false,
    avOpen: true,
    slOpen: false,
  },
];

const CYCLE_T = {
  play: r("▶ Odtwarzaj", "▶ Запустить"),
  stop: r("⏸ Pauza", "⏸ Пауза"),
  open: r("otwarte", "открыты"),
  closed: r("zamknięte", "закрыты"),
  av: r("Zastawki przedsionkowo-komorowe:", "Предсердно-желудочковые клапаны:"),
  sl: r("Zastawki półksiężycowate:", "Полулунные клапаны:"),
};

function Valve({ x, y, w, open, vertical }: { x: number; y: number; w: number; open: boolean; vertical?: boolean }) {
  const c = open ? "#16a34a" : "#dc2626";
  if (vertical) return <path d={open ? `M${x} ${y} l -8 -10 M${x + w} ${y} l 8 -10` : `M${x} ${y} L ${x + w} ${y}`} stroke={c} strokeWidth={4} strokeLinecap="round" />;
  return <path d={open ? `M${x} ${y} l 8 12 M${x + w} ${y} l -8 12` : `M${x} ${y} L ${x + w} ${y}`} stroke={c} strokeWidth={4} strokeLinecap="round" />;
}

function CardiacCycle({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(2);
  const [play, setPlay] = useState(false);
  const p = PHASES[i]!;
  useEffect(() => {
    if (!play) return;
    // slowed down 6× so each phase can be seen
    const id = window.setTimeout(() => setI((i + 1) % PHASES.length), p.ms * 6);
    return () => window.clearTimeout(id);
  }, [play, i, p.ms]);
  const sq = (on: boolean) => (on ? 0.82 : 1);
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 260 220" className="w-full" role="img" aria-label={p.name[lang]}>
          <rect width={260} height={220} rx={12} fill="#fff1f2" />
          {[
            [40, 30, BLUE, p.atria],
            [140, 30, RED, p.atria],
            [40, 110, BLUE, p.ventricles],
            [140, 110, RED, p.ventricles],
          ].map(([x, y, c, on], k) => (
            <g key={k} style={{ transformBox: "fill-box", transformOrigin: "center", transform: `scale(${sq(on as boolean)})`, transition: "transform .25s" }}>
              <rect x={x as number} y={y as number} width={80} height={k < 2 ? 70 : 90} rx={14} fill={c as string} stroke={on ? "#0f172a" : "#94a3b8"} strokeWidth={on ? 3 : 1.5} />
            </g>
          ))}
          <Valve x={58} y={106} w={44} open={p.avOpen} />
          <Valve x={158} y={106} w={44} open={p.avOpen} />
          <Valve x={74} y={26} w={12} open={p.slOpen} vertical />
          <Valve x={174} y={26} w={12} open={p.slOpen} vertical />
          <text x={80} y={70} textAnchor="middle" fontSize={11} fill="white" fontWeight={600}>
            {lang === "pl" ? "PP" : "ПП"}
          </text>
          <text x={180} y={70} textAnchor="middle" fontSize={11} fill="white" fontWeight={600}>
            {lang === "pl" ? "LP" : "ЛП"}
          </text>
          <text x={80} y={160} textAnchor="middle" fontSize={11} fill="white" fontWeight={600}>
            {lang === "pl" ? "PK" : "ПЖ"}
          </text>
          <text x={180} y={160} textAnchor="middle" fontSize={11} fill="white" fontWeight={600}>
            {lang === "pl" ? "LK" : "ЛЖ"}
          </text>
          {p.ventricles && (
            <g fill="none" strokeWidth={3}>
              <path d="M80 110 C 80 60, 70 30, 80 8" stroke="#2563eb" strokeDasharray="4 3" />
              <path d="M180 110 C 180 60, 190 30, 180 8" stroke="#dc2626" strokeDasharray="4 3" />
            </g>
          )}
        </svg>
        <div className="mt-2 flex h-6 overflow-hidden rounded-full ring-1 ring-slate-300" aria-hidden>
          {PHASES.map((ph, k) => (
            <button
              key={k}
              type="button"
              tabIndex={-1}
              onClick={() => setI(k)}
              style={{ flexGrow: ph.ms }}
              className={`text-[10px] font-medium ${k === i ? "bg-rose-600 text-white" : "bg-white text-slate-500"}`}
            >
              {num(ph.ms / 1000, 1)} {lang === "pl" ? "s" : "с"}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PHASES.map((ph, k) => (
            <Choice key={k} state={k === i ? "active" : "idle"} onClick={() => setI(k)}>
              {ph.name[lang]}
            </Choice>
          ))}
          <Choice onClick={() => setPlay(!play)}>{play ? CYCLE_T.stop[lang] : CYCLE_T.play[lang]}</Choice>
        </div>
      </div>
      <div className="space-y-3" aria-live="polite">
        <h3 className="text-base font-semibold text-slate-900">
          {p.name[lang]} · {num(p.ms / 1000, 1)} {lang === "pl" ? "s" : "с"}
        </h3>
        <p className="text-[15px] leading-relaxed text-slate-700">{p.text[lang]}</p>
        <ul className="space-y-1 text-sm">
          <li>
            {CYCLE_T.av[lang]} <b className={p.avOpen ? "text-emerald-700" : "text-rose-700"}>{p.avOpen ? CYCLE_T.open[lang] : CYCLE_T.closed[lang]}</b>
          </li>
          <li>
            {CYCLE_T.sl[lang]} <b className={p.slOpen ? "text-emerald-700" : "text-rose-700"}>{p.slOpen ? CYCLE_T.open[lang] : CYCLE_T.closed[lang]}</b>
          </li>
        </ul>
      </div>
    </div>
  );
}

// ---------- the route and the vessels ----------

const ROUTE: Txt[] = [
  r("aorta", "аорта"),
  r("tętnice", "артерии"),
  r("naczynia włosowate narządów", "капилляры органов"),
  r("żyły", "вены"),
  r("żyły główne", "полые вены"),
  r("prawy przedsionek", "правое предсердие"),
  r("prawa komora", "правый желудочек"),
  r("pień płucny i tętnice płucne", "лёгочный ствол и лёгочные артерии"),
  r("naczynia włosowate płuc", "капилляры лёгких"),
  r("żyły płucne", "лёгочные вены"),
  r("lewy przedsionek", "левое предсердие"),
  r("lewa komora", "левый желудочек"),
];

const L = {
  wall: r("Ściana", "Стенка"),
  pressure: r("Ciśnienie krwi", "Давление крови"),
  direction: r("Kierunek przepływu", "Направление тока"),
  valves: r("Zastawki", "Клапаны"),
  role: r("Rola", "Роль"),
};

const VESSELS: CompareCard[] = [
  {
    id: "arteries",
    icon: "🔴",
    name: r("Tętnice", "Артерии"),
    rows: [
      { label: L.wall, value: r("gruba, sprężysta, z dużą ilością mięśni gładkich", "толстая, упругая, с большим количеством гладких мышц") },
      { label: L.pressure, value: r("wysokie, pulsujące — czujemy je jako tętno", "высокое, пульсирующее — его ощущают как пульс") },
      { label: L.direction, value: r("od serca", "от сердца") },
      { label: L.valves, value: r("brak (poza ujściem z serca)", "нет (кроме выхода из сердца)") },
      { label: L.role, value: r("rozprowadzanie krwi do narządów", "разнос крови к органам") },
    ],
  },
  {
    id: "capillaries",
    icon: "🟣",
    name: r("Naczynia włosowate", "Капилляры"),
    rows: [
      { label: L.wall, value: r("jedna warstwa komórek nabłonka", "один слой клеток эпителия") },
      { label: L.pressure, value: r("niskie, przepływ bardzo powolny", "низкое, ток очень медленный") },
      { label: L.direction, value: r("łączą tętniczki z żyłkami", "соединяют артериолы с венулами") },
      { label: L.valves, value: r("brak", "нет") },
      { label: L.role, value: r("wymiana gazów i substancji między krwią a tkankami", "обмен газами и веществами между кровью и тканями") },
    ],
    text: r("Cienka ściana i powolny przepływ to warunki sprawnej wymiany przez dyfuzję.", "Тонкая стенка и медленный ток — условия эффективного обмена путём диффузии."),
  },
  {
    id: "veins",
    icon: "🔵",
    name: r("Żyły", "Вены"),
    rows: [
      { label: L.wall, value: r("cieńsza, mniej mięśni, szersze światło", "тоньше, меньше мышц, шире просвет") },
      { label: L.pressure, value: r("najniższe", "самое низкое") },
      { label: L.direction, value: r("do serca", "к сердцу") },
      { label: L.valves, value: r("zastawki żylne zapobiegają cofaniu się krwi", "венозные клапаны не дают крови течь обратно") },
      { label: L.role, value: r("odprowadzanie krwi do serca", "возврат крови к сердцу") },
    ],
    text: r("Krew w żyłach kończyn dolnych płynie w górę dzięki skurczom mięśni szkieletowych i zastawkom.", "Кровь в венах ног поднимается вверх благодаря сокращениям скелетных мышц и клапанам."),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Serce ma dwa przedsionki i dwie komory; prawa połowa zawiera krew odtlenowaną, lewa — utlenowaną.", ru: "В сердце два предсердия и два желудочка; в правой половине венозная кровь, в левой — артериальная." },
    { pl: "Zastawki przedsionkowo-komorowe i półksiężycowate wymuszają jednokierunkowy przepływ krwi.", ru: "Предсердно-желудочковые и полулунные клапаны обеспечивают односторонний ток крови." },
    { pl: "Węzeł zatokowo-przedsionkowy odpowiada za automatyzm serca.", ru: "Синусно-предсердный узел обеспечивает автоматию сердца." },
  ],
  s2: [{ pl: "Cykl: skurcz przedsionków 0,1 s → skurcz komór 0,3 s → rozkurcz 0,4 s (przy 75/min).", ru: "Цикл: систола предсердий 0,1 с → систола желудочков 0,3 с → диастола 0,4 с (при 75/мин)." }],
  s3: [
    { pl: "Krwiobieg duży: lewa komora → aorta → narządy → żyły główne → prawy przedsionek.", ru: "Большой круг: левый желудочек → аорта → органы → полые вены → правое предсердие." },
    { pl: "Krwiobieg mały: prawa komora → pień płucny → płuca → żyły płucne → lewy przedsionek.", ru: "Малый круг: правый желудочек → лёгочный ствол → лёгкие → лёгочные вены → левое предсердие." },
  ],
  s4: [{ pl: "Tętnice prowadzą krew od serca, żyły — do serca; o nazwie decyduje kierunek, nie stopień utlenowania.", ru: "Артерии несут кровь от сердца, вены — к сердцу; название определяет направление, а не насыщенность кислородом." }],
};

export default function HeartLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="heart" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="heart-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <HeartMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="heart-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CardiacCycle lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="heart-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <OrderGame lang={lang} title={r("Droga krwi", "Путь крови")} start={r("lewa komora", "левый желудочек")} steps={ROUTE} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="heart-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={VESSELS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
