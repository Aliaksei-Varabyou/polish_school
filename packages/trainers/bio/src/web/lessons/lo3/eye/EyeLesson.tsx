// Lesson for LO3 §9.2 "Budowa i działanie narządu wzroku" (zakres rozszerzony). Parts follow
// templates/data/systems.ts (senses.vision).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, PartMap, type CompareCard, type MapPart } from "@portal/lessons";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Oko działa jak aparat fotograficzny: rogówka i soczewka skupiają światło, tęczówka jak przysłona reguluje jego ilość, a siatkówka jak matryca zamienia obraz na impulsy nerwowe. Obraz na siatkówce jest pomniejszony i odwrócony — dopiero mózg „ustawia go” prawidłowo.",
    "Глаз устроен как фотоаппарат: роговица и хрусталик фокусируют свет, радужка, как диафрагма, регулирует его количество, а сетчатка, как матрица, превращает изображение в нервные импульсы. Изображение на сетчатке уменьшенное и перевёрнутое — правильно его «ставит» только мозг.",
  ),
  s1: r("Budowa oka", "Строение глаза"),
  s1intro: r("Przekrój gałki ocznej widzianej z boku; światło wpada z lewej strony.", "Разрез глазного яблока сбоку; свет падает слева."),
  s2: r("Akomodacja", "Аккомодация"),
  s2intro: r("Przesuń przedmiot bliżej i dalej — zobacz, jak oko ustawia ostrość.", "Двигай предмет ближе и дальше — посмотри, как глаз наводит резкость."),
  s3: r("Wady wzroku i ich korekcja", "Дефекты зрения и их коррекция"),
  s3intro: r("Wybierz oko i załóż mu okulary.", "Выбери глаз и надень ему очки."),
  s4: r("Czopki i pręciki", "Колбочки и палочки"),
} satisfies Record<string, Txt>;

// ---------- eye map ----------

type EPart = "cornea" | "iris" | "lens" | "ciliary" | "sclera" | "retina" | "macula" | "blind" | "nerve";

const PARTS: Record<EPart, MapPart> = {
  cornea: { name: r("Rogówka", "Роговица"), text: r("Przezroczysta, wypukła przednia część twardówki. Załamuje światło najsilniej ze wszystkich części oka.", "Прозрачная выпуклая передняя часть склеры. Преломляет свет сильнее всех частей глаза."), pin: [30, 120], to: [80, 120] },
  iris: { name: r("Tęczówka i źrenica", "Радужка и зрачок"), text: r("Tęczówka nadaje oku kolor; jej mięśnie zwężają źrenicę w jasnym świetle i rozszerzają w ciemności.", "Радужка придаёт глазу цвет; её мышцы сужают зрачок на ярком свету и расширяют в темноте."), pin: [60, 36], to: [118, 86] },
  lens: { name: r("Soczewka", "Хрусталик"), text: r("Elastyczna, dwuwypukła. Zmienia kształt podczas akomodacji, by ostro widzieć z różnych odległości.", "Эластичный, двояковыпуклый. Меняет форму при аккомодации, чтобы чётко видеть на разных расстояниях."), pin: [160, 22], to: [134, 100] },
  ciliary: { name: r("Ciało rzęskowe", "Ресничное тело"), text: r("Zawiera mięsień rzęskowy, połączony z soczewką włóknami obwódki rzęskowej. Jego skurcz pozwala soczewce stać się bardziej wypukłą.", "Содержит ресничную мышцу, связанную с хрусталиком волокнами ресничного пояска. Её сокращение позволяет хрусталику стать более выпуклым."), pin: [60, 210], to: [114, 166] },
  sclera: { name: r("Twardówka", "Склера"), text: r("Zewnętrzna, mocna, biała błona — „białko oka”; chroni gałkę i nadaje jej kształt.", "Наружная прочная белая оболочка — «белок глаза»; защищает глазное яблоко и придаёт ему форму."), pin: [236, 14], to: [214, 28] },
  retina: { name: r("Siatkówka", "Сетчатка"), text: r("Wewnętrzna warstwa z fotoreceptorami — czopkami i pręcikami. Tu światło zamienia się w impulsy nerwowe.", "Внутренний слой с фоторецепторами — колбочками и палочками. Здесь свет превращается в нервные импульсы."), pin: [330, 50], to: [268, 74] },
  macula: { name: r("Plamka żółta", "Жёлтое пятно"), text: r("Miejsce najostrzejszego widzenia — największe skupienie czopków. Na nią pada obraz przedmiotu, na który patrzymy.", "Место самого чёткого зрения — наибольшее скопление колбочек. Сюда падает изображение предмета, на который мы смотрим."), pin: [340, 108], to: [282, 116] },
  blind: { name: r("Plamka ślepa", "Слепое пятно"), text: r("Miejsce wyjścia nerwu wzrokowego. Nie ma tu fotoreceptorów, więc obraz padający w to miejsce nie jest widziany.", "Место выхода зрительного нерва. Здесь нет фоторецепторов, поэтому изображение, попавшее сюда, не видно."), pin: [270, 224], to: [270, 156] },
  nerve: { name: r("Nerw wzrokowy", "Зрительный нерв"), text: r("Przewodzi impulsy z siatkówki do ośrodka wzroku w płacie potylicznym kory mózgu.", "Проводит импульсы от сетчатки к зрительному центру в затылочной доле коры мозга."), pin: [340, 214], to: [328, 178] },
};

function EyeMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<EPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 360 240"
      title={r("Przekrój oka", "Разрез глаза")}
      labelOrder={["cornea", "iris", "lens", "ciliary", "sclera", "retina", "macula", "blind", "nerve"]}
      pinRadius={13}
      art={({ part, tone }) => (
        <>
          {part("nerve", <path d="M268 152 C 300 162, 320 170, 350 186" stroke={tone("nerve", "#facc15")} strokeWidth={16} strokeLinecap="round" fill="none" />)}
          <circle cx={190} cy={120} r={95} fill="#f8fafc" />
          {part("sclera", <path d="M108 72 A95 95 0 1 1 108 168" stroke={tone("sclera", "#cbd5e1")} strokeWidth={9} fill="none" />)}
          <circle cx={190} cy={120} r={86} fill="#ecfeff" />
          {part("retina", <path d="M220 39 A86 86 0 0 1 220 201" stroke={tone("retina", "#fb7185")} strokeWidth={7} fill="none" />)}
          {part("macula", <circle cx={276} cy={120} r={7} fill={tone("macula", "#eab308")} />)}
          {part("blind", <circle cx={270} cy={152} r={7} fill={tone("blind", "#1e293b")} />)}
          {part(
            "cornea",
            <path d="M104 72 Q 60 120 104 168" stroke={tone("cornea", "#7dd3fc")} strokeWidth={6} fill="#e0f2fe" fillOpacity={0.6} />,
          )}
          {part(
            "ciliary",
            <g fill={tone("ciliary", "#c084fc")}>
              <ellipse cx={114} cy={76} rx={9} ry={7} />
              <ellipse cx={114} cy={164} rx={9} ry={7} />
            </g>,
          )}
          <path d="M118 80 L 132 92 M118 160 L 132 148" stroke="#a78bfa" strokeWidth={1.5} />
          {part(
            "iris",
            <g fill={tone("iris", "#a16207")}>
              <rect x={113} y={84} width={6} height={22} rx={2} />
              <rect x={113} y={134} width={6} height={22} rx={2} />
            </g>,
          )}
          {part("lens", <ellipse cx={134} cy={120} rx={11} ry={30} fill={tone("lens", "#bae6fd")} stroke="#0284c7" strokeWidth={1.5} />)}
        </>
      )}
    />
  );
}

// ---------- accommodation ----------

function Accommodation({ lang }: { lang: BioLang }) {
  const [far, setFar] = useState(100);
  const t = far / 100;
  const rx = 17 - 8 * t;
  const sx = 24 - 24 * t;
  const near = t < 0.5;
  const text = near
    ? r(
        "Przedmiot blisko: mięsień rzęskowy kurczy się, włókna obwódki rzęskowej rozluźniają się i elastyczna soczewka sama staje się bardziej wypukła — silniej załamuje światło.",
        "Предмет близко: ресничная мышца сокращается, волокна ресничного пояска расслабляются, и эластичный хрусталик сам становится более выпуклым — сильнее преломляет свет.",
      )
    : r(
        "Przedmiot daleko: mięsień rzęskowy jest rozluźniony, włókna obwódki są napięte i rozciągają soczewkę — staje się płaska i słabiej załamuje światło.",
        "Предмет далеко: ресничная мышца расслаблена, волокна пояска натянуты и растягивают хрусталик — он становится плоским и слабее преломляет свет.",
      );
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 300 160" className="w-full" role="img" aria-label={near ? (lang === "pl" ? "przedmiot blisko" : "предмет близко") : lang === "pl" ? "przedmiot daleko" : "предмет далеко"}>
          <circle cx={190} cy={80} r={76} fill="#ecfeff" stroke="#cbd5e1" strokeWidth={6} />
          <path d="M220 12 A70 70 0 0 1 220 148" stroke="#fb7185" strokeWidth={5} fill="none" />
          <ellipse cx={132} cy={80} rx={rx} ry={30} fill="#bae6fd" stroke="#0284c7" strokeWidth={1.5} style={{ transition: "rx .3s" }} />
          {near && <text x={sx} y={86} fontSize={16} textAnchor="middle">✏️</text>}
          <g stroke="#f59e0b" strokeWidth={1.8} fill="none">
            {[-1, 1].map((s) => (
              <path key={s} d={near ? `M${sx + 8} 80 L 132 ${80 - s * 28} L 258 80` : `M0 ${80 - s * 28} L 132 ${80 - s * 28} L 258 80`} />
            ))}
          </g>
          <circle cx={258} cy={80} r={3} fill="#16a34a" />
        </svg>
        <label className="mt-2 block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Odległość przedmiotu" : "Расстояние до предмета"}
          <input type="range" min={0} max={100} value={far} onChange={(e) => setFar(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-sky-600" />
          <span className="mt-1 flex justify-between text-xs font-normal text-slate-500">
            <span>25 cm</span>
            <span>{lang === "pl" ? "daleko (> 6 m)" : "далеко (> 6 м)"}</span>
          </span>
        </label>
      </div>
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
        {text[lang]}
      </p>
    </div>
  );
}

// ---------- defects ----------

type Defect = "normal" | "myopia" | "hyperopia";

const DEFECTS: Record<Defect, { name: Txt; focus: number; text: Txt; fix: Txt }> = {
  normal: {
    name: r("Oko miarowe", "Нормальный глаз"),
    focus: 278,
    text: r("Promienie z dalekiego przedmiotu skupiają się dokładnie na siatkówce.", "Лучи от далёкого предмета сходятся точно на сетчатке."),
    fix: r("Okulary nie są potrzebne.", "Очки не нужны."),
  },
  myopia: {
    name: r("Krótkowzroczność", "Близорукость"),
    focus: 236,
    text: r(
      "Gałka oczna jest za długa (lub układ optyczny za silnie załamuje), więc obraz dalekich przedmiotów powstaje przed siatkówką. Blisko widać dobrze, daleko — nieostro.",
      "Глазное яблоко слишком длинное (или оптика глаза слишком сильно преломляет), поэтому изображение далёких предметов возникает перед сетчаткой. Вблизи видно хорошо, вдаль — размыто.",
    ),
    fix: r("Korekcja: soczewka rozpraszająca (wklęsła), moc ujemna, np. −2 D.", "Коррекция: рассеивающая (вогнутая) линза, отрицательная сила, например −2 дптр."),
  },
  hyperopia: {
    name: r("Dalekowzroczność", "Дальнозоркость"),
    focus: 330,
    text: r(
      "Gałka oczna jest za krótka, więc obraz powstaje za siatkówką. Najtrudniej ostro widzieć z bliska.",
      "Глазное яблоко слишком короткое, поэтому изображение возникает за сетчаткой. Труднее всего чётко видеть вблизи.",
    ),
    fix: r("Korekcja: soczewka skupiająca (wypukła), moc dodatnia, np. +2 D.", "Коррекция: собирающая (выпуклая) линза, положительная сила, например +2 дптр."),
  },
};

const RETINA_X = 278;

function Defects({ lang }: { lang: BioLang }) {
  const [defect, setDefect] = useState<Defect>("myopia");
  const [glasses, setGlasses] = useState(false);
  const d = DEFECTS[defect];
  const corrected = glasses || defect === "normal";
  // rays meet the lens 28 px above and below the axis; the glasses tilt them so they meet on the retina
  const atLens = (s: number) => 120 - s * (defect === "myopia" && glasses ? 36 : defect === "hyperopia" && glasses ? 22 : 28);
  const focus = corrected ? RETINA_X : d.focus;
  const hit = (s: number) => {
    const y0 = atLens(s);
    return y0 + (120 - y0) * ((RETINA_X - 132) / (focus - 132));
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(DEFECTS) as Defect[]).map((k) => (
          <Choice key={k} state={defect === k ? "active" : "idle"} onClick={() => setDefect(k)}>
            {DEFECTS[k].name[lang]}
          </Choice>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 300 240" className="w-full" role="img" aria-label={d.name[lang]}>
            <circle cx={190} cy={120} r={defect === "myopia" ? 92 : defect === "hyperopia" ? 82 : 88} fill="#ecfeff" stroke="#cbd5e1" strokeWidth={6} />
            <path d={`M${RETINA_X} 70 L ${RETINA_X} 170`} stroke="#fb7185" strokeWidth={5} />
            <ellipse cx={132} cy={120} rx={11} ry={30} fill="#bae6fd" stroke="#0284c7" strokeWidth={1.5} />
            {glasses && defect !== "normal" &&
              (defect === "myopia" ? (
                <path d="M42 60 Q 54 120 42 180 L 62 180 Q 50 120 62 60 Z" fill="#c7d2fe" stroke="#4f46e5" strokeWidth={1.5} />
              ) : (
                <ellipse cx={52} cy={120} rx={9} ry={60} fill="#c7d2fe" stroke="#4f46e5" strokeWidth={1.5} />
              ))}
            <g stroke="#f59e0b" strokeWidth={1.8} fill="none">
              {[-1, 1].map((s) => (
                <path
                  key={s}
                  d={
                    glasses && defect !== "normal"
                      ? `M0 ${120 - s * 28} L 52 ${120 - s * 28} L 132 ${atLens(s)} L ${RETINA_X} ${hit(s)}`
                      : `M0 ${atLens(s)} L 132 ${atLens(s)} L ${RETINA_X} ${hit(s)}`
                  }
                />
              ))}
            </g>
            {!corrected && <path d={`M${RETINA_X} ${hit(-1)} L ${RETINA_X} ${hit(1)}`} stroke="#dc2626" strokeWidth={7} strokeLinecap="round" opacity={0.7} />}
            {corrected && <circle cx={RETINA_X} cy={120} r={4} fill="#16a34a" />}
            {!corrected && <circle cx={d.focus} cy={120} r={3} fill="#dc2626" />}
          </svg>
          {defect !== "normal" && (
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={glasses} onChange={(e) => setGlasses(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
              👓 {lang === "pl" ? "Załóż okulary" : "Надеть очки"}
            </label>
          )}
        </div>
        <div className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          <p>{d.text[lang]}</p>
          <p className="font-medium text-indigo-800">{d.fix[lang]}</p>
        </div>
      </div>
    </div>
  );
}

function Diopters({ lang }: { lang: BioLang }) {
  const [dpt, setDpt] = useState(-2);
  const f = dpt === 0 ? null : 1 / dpt;
  return (
    <div className="mt-5 rounded-xl bg-indigo-50 p-4 ring-1 ring-indigo-200">
      <h3 className="font-semibold text-indigo-900">{lang === "pl" ? "Zdolność skupiająca soczewki" : "Оптическая сила линзы"}: D = 1 / f</h3>
      <label className="mt-3 block text-sm font-semibold text-slate-700">
        {lang === "pl" ? "Moc soczewki" : "Сила линзы"}: <span className="tabular-nums">{dpt > 0 ? "+" : ""}{num(dpt, 1)} {lang === "pl" ? "D" : "дптр"}</span>
        <input type="range" min={-8} max={8} step={0.5} value={dpt} onChange={(e) => setDpt(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-indigo-600" />
      </label>
      <p className="mt-2 text-[15px] text-indigo-950" aria-live="polite">
        {f === null
          ? lang === "pl"
            ? "0 D — zwykła szyba, nie skupia ani nie rozprasza światła."
            : "0 дптр — обычное стекло, не собирает и не рассеивает свет."
          : lang === "pl"
            ? `f = 1 / (${num(dpt, 1)} D) = ${num(f * 100, 1)} cm — soczewka ${dpt > 0 ? "skupiająca, dla dalekowidza" : "rozpraszająca, dla krótkowidza"}.`
            : `f = 1 / (${num(dpt, 1)} дптр) = ${num(f * 100, 1)} см — ${dpt > 0 ? "собирающая линза, для дальнозорких" : "рассеивающая линза, для близоруких"}.`}
      </p>
    </div>
  );
}

// ---------- cones and rods ----------

const L = {
  count: r("Liczba w siatkówce", "Количество в сетчатке"),
  where: r("Rozmieszczenie", "Где больше всего"),
  light: r("Światło", "Свет"),
  colour: r("Barwy", "Цвета"),
  sharp: r("Ostrość obrazu", "Чёткость"),
  pigment: r("Barwnik", "Пигмент"),
};

const RECEPTORS: CompareCard[] = [
  {
    id: "cones",
    icon: "🌈",
    name: r("Czopki", "Колбочки"),
    rows: [
      { label: L.count, value: r("ok. 6 mln", "около 6 млн") },
      { label: L.where, value: r("plamka żółta", "жёлтое пятно") },
      { label: L.light, value: r("działają przy dobrym oświetleniu (widzenie dzienne)", "работают при хорошем освещении (дневное зрение)") },
      { label: L.colour, value: r("tak — trzy rodzaje czopków, czułe na barwę niebieską, zieloną i czerwoną", "да — три типа колбочек, чувствительных к синему, зелёному и красному") },
      { label: L.sharp, value: r("wysoka", "высокая") },
      { label: L.pigment, value: r("jodopsyna", "йодопсин") },
    ],
    text: r("Brak jednego rodzaju czopków powoduje daltonizm — zaburzenie widzenia barw, dziedziczone w sprzężeniu z płcią.", "Отсутствие одного типа колбочек вызывает дальтонизм — нарушение цветового зрения, наследуемое сцепленно с полом."),
  },
  {
    id: "rods",
    icon: "🌙",
    name: r("Pręciki", "Палочки"),
    rows: [
      { label: L.count, value: r("ok. 120 mln", "около 120 млн") },
      { label: L.where, value: r("obwód siatkówki", "периферия сетчатки") },
      { label: L.light, value: r("bardzo czułe — działają o zmierzchu i w nocy", "очень чувствительны — работают в сумерках и ночью") },
      { label: L.colour, value: r("nie — widzenie czarno-białe", "нет — чёрно-белое зрение") },
      { label: L.sharp, value: r("niska", "низкая") },
      { label: L.pigment, value: r("rodopsyna (do jej odtwarzania potrzebna jest witamina A)", "родопсин (для его восстановления нужен витамин A)") },
    ],
    text: r("Niedobór witaminy A prowadzi do kurzej ślepoty — złego widzenia o zmierzchu.", "Недостаток витамина A приводит к куриной слепоте — плохому зрению в сумерках."),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Ściana gałki ocznej: twardówka (z rogówką), naczyniówka (z tęczówką i ciałem rzęskowym), siatkówka.", ru: "Стенка глазного яблока: склера (с роговицей), сосудистая оболочка (с радужкой и ресничным телом), сетчатка." },
    { pl: "Obraz na siatkówce jest rzeczywisty, pomniejszony i odwrócony.", ru: "Изображение на сетчатке действительное, уменьшенное и перевёрнутое." },
  ],
  s2: [
    { pl: "Akomodacja to zmiana wypukłości soczewki zależnie od odległości przedmiotu.", ru: "Аккомодация — изменение выпуклости хрусталика в зависимости от расстояния до предмета." },
    { pl: "Z wiekiem soczewka traci elastyczność — to starczowzroczność (prezbiopia).", ru: "С возрастом хрусталик теряет эластичность — это старческая дальнозоркость (пресбиопия)." },
  ],
  s3: [
    { pl: "Krótkowzroczność — soczewki rozpraszające (−D); dalekowzroczność — skupiające (+D); astygmatyzm — cylindryczne.", ru: "Близорукость — рассеивающие линзы (−дптр); дальнозоркость — собирающие (+дптр); астигматизм — цилиндрические." },
  ],
  s4: [{ pl: "Czopki — barwy i ostrość w dzień; pręciki — widzenie o zmierzchu.", ru: "Колбочки — цвет и чёткость днём; палочки — сумеречное зрение." }],
};

export default function EyeLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="eye" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="eye-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <EyeMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="eye-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Accommodation lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="eye-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Defects lang={lang} />
        <Diopters lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="eye-s4" n={4} title={T.s4[lang]}>
        <CompareTabs lang={lang} cards={RECEPTORS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
