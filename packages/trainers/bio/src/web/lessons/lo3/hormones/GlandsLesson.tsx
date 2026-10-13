// Lesson for LO3 §10.2 "Budowa i rola układu hormonalnego" (zakres rozszerzony). Glands and hormones
// follow templates/data/hormones.ts (HORMONES).
import { useMemo, useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, PartMap, TwoWaySort, type CompareCard, type MapPart, type QuizItem, type QuizOption, type SortItem } from "../../games.tsx";
import { Choice, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Gruczoły dokrewne nie mają przewodów wyprowadzających — wydzielają hormony prosto do krwi. Krew roznosi je po całym ciele, ale każdy hormon działa tylko na komórki, które mają dla niego receptory. Tak układ hormonalny, razem z nerwowym, steruje pracą całego organizmu.",
    "Железы внутренней секреции не имеют выводных протоков — они выделяют гормоны прямо в кровь. Кровь разносит их по всему телу, но каждый гормон действует только на клетки, у которых есть для него рецепторы. Так эндокринная система вместе с нервной управляет работой всего организма.",
  ),
  s1: r("Gruczoły dokrewne", "Железы внутренней секреции"),
  s1intro: r("Dotknij gruczołu, by poznać jego hormony. Przełącz sylwetkę, by zobaczyć gonady kobiety lub mężczyzny.", "Нажми на железу, чтобы узнать её гормоны. Переключи силуэт, чтобы увидеть половые железы женщины или мужчины."),
  s2: r("Hormon i jego gruczoł", "Гормон и его железа"),
  s3: r("Komórki docelowe", "Клетки-мишени"),
  s3intro: r("Wybierz hormon i sprawdź, na które komórki działa.", "Выбери гормон и посмотри, на какие клетки он действует."),
  s4: r("Jak hormony działają na komórkę", "Как гормоны действуют на клетку"),
  s4intro: r(
    "O sposobie działania hormonu decyduje jego budowa chemiczna: czy przenika przez błonę komórkową, czy nie.",
    "Способ действия гормона определяется его химическим строением: проходит ли он через клеточную мембрану или нет.",
  ),
} satisfies Record<string, Txt>;

// ---------- gland map ----------

type Gland = "pineal" | "hypothalamus" | "pituitary" | "thyroid" | "parathyroid" | "thymus" | "adrenal" | "pancreas" | "gonads";
type Sex = "f" | "m";

function glandParts(sex: Sex): Record<Gland, MapPart> {
  return {
    pineal: {
      name: r("Szyszynka", "Эпифиз"),
      text: r(
        "Wydziela melatoninę — głównie nocą, w ciemności. Melatonina reguluje rytm dobowy i ułatwia zasypianie.",
        "Выделяет мелатонин — в основном ночью, в темноте. Мелатонин регулирует суточный ритм и облегчает засыпание.",
      ),
      pin: [36, 28],
      to: [146, 52],
    },
    hypothalamus: {
      name: r("Podwzgórze", "Гипоталамус"),
      text: r(
        "Część międzymózgowia, która łączy układ nerwowy z hormonalnym. Jego komórki neurosekrecyjne wytwarzają liberyny i statyny sterujące przysadką, a także wazopresynę i oksytocynę.",
        "Часть промежуточного мозга, связывающая нервную и эндокринную системы. Его нейросекреторные клетки вырабатывают либерины и статины, управляющие гипофизом, а также вазопрессин и окситоцин.",
      ),
      pin: [264, 46],
      to: [162, 74],
    },
    pituitary: {
      name: r("Przysadka mózgowa", "Гипофиз"),
      text: r(
        "„Gruczoł nadrzędny”. Płat przedni wydziela hormony tropowe (TSH, ACTH, FSH, LH), somatotropinę i prolaktynę; płat tylny uwalnia do krwi wazopresynę i oksytocynę wytworzone w podwzgórzu.",
        "«Главная железа». Передняя доля выделяет тропные гормоны (ТТГ, АКТГ, ФСГ, ЛГ), соматотропин и пролактин; задняя доля выпускает в кровь вазопрессин и окситоцин, образованные в гипоталамусе.",
      ),
      pin: [36, 96],
      to: [144, 92],
    },
    thyroid: {
      name: r("Tarczyca", "Щитовидная железа"),
      text: r(
        "Wydziela tyroksynę (T4) i trijodotyroninę (T3), które przyspieszają przemianę materii; do ich wytworzenia potrzebny jest jod. Wydziela też kalcytoninę, obniżającą poziom wapnia we krwi.",
        "Выделяет тироксин (Т4) и трийодтиронин (Т3), которые ускоряют обмен веществ; для их синтеза нужен йод. Выделяет также кальцитонин, снижающий уровень кальция в крови.",
      ),
      pin: [264, 120],
      to: [170, 138],
    },
    parathyroid: {
      name: r("Przytarczyce", "Паращитовидные железы"),
      text: r(
        "Cztery drobne gruczoły na tylnej powierzchni tarczycy. Wydzielają parathormon, który podwyższa poziom wapnia we krwi.",
        "Четыре маленькие железы на задней поверхности щитовидной железы. Выделяют паратгормон, повышающий уровень кальция в крови.",
      ),
      pin: [36, 160],
      to: [134, 146],
    },
    thymus: {
      name: r("Grasica", "Тимус"),
      text: r(
        "Leży za mostkiem; najaktywniejsza w dzieciństwie, potem zanika. Jej hormony (np. tymozyna) sterują dojrzewaniem limfocytów T.",
        "Лежит за грудиной; активнее всего в детстве, потом уменьшается. Её гормоны (например, тимозин) управляют созреванием Т-лимфоцитов.",
      ),
      pin: [264, 186],
      to: [162, 184],
    },
    adrenal: {
      name: r("Nadnercza", "Надпочечники"),
      text: r(
        "Leżą na górnych biegunach nerek. Kora wydziela kortyzol i aldosteron (hormony steroidowe), a rdzeń — adrenalinę i noradrenalinę.",
        "Лежат на верхних полюсах почек. Корковое вещество выделяет кортизол и альдостерон (стероидные гормоны), а мозговое — адреналин и норадреналин.",
      ),
      pin: [36, 236],
      to: [114, 244],
    },
    pancreas: {
      name: r("Trzustka (wyspy trzustkowe)", "Поджелудочная железа (островки)"),
      text: r(
        "Gruczoł o wydzielaniu mieszanym: większość komórek wytwarza sok trawienny, a rozsiane wśród nich wyspy trzustkowe — insulinę (komórki beta) i glukagon (komórki alfa).",
        "Железа смешанной секреции: большинство клеток вырабатывает пищеварительный сок, а рассеянные среди них островки — инсулин (бета-клетки) и глюкагон (альфа-клетки).",
      ),
      pin: [264, 310],
      to: [190, 312],
    },
    gonads:
      sex === "f"
        ? {
            name: r("Jajniki", "Яичники"),
            text: r(
              "Wydzielają estrogeny i progesteron (ten ostatni głównie ciałko żółte). Warunkują żeńskie cechy płciowe i regulują cykl miesiączkowy.",
              "Выделяют эстрогены и прогестерон (его в основном жёлтое тело). Определяют женские половые признаки и регулируют менструальный цикл.",
            ),
            pin: [36, 352],
            to: [118, 352],
          }
        : {
            name: r("Jądra", "Семенники"),
            text: r(
              "Wydzielają testosteron, który warunkuje męskie cechy płciowe i jest potrzebny do spermatogenezy.",
              "Выделяют тестостерон, который определяет мужские половые признаки и нужен для сперматогенеза.",
            ),
            pin: [36, 392],
            to: [140, 398],
          },
  };
}

function GlandMap({ lang }: { lang: BioLang }) {
  const [sex, setSex] = useState<Sex>("f");
  const parts = useMemo(() => glandParts(sex), [sex]);
  return (
    <div>
      <div className="mb-4 flex gap-2" role="radiogroup">
        {(["f", "m"] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={sex === s}
            onClick={() => setSex(s)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              sex === s ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {s === "f" ? (lang === "pl" ? "♀ kobieta" : "♀ женщина") : lang === "pl" ? "♂ mężczyzna" : "♂ мужчина"}
          </button>
        ))}
      </div>
      <PartMap<Gland>
        key={sex}
        lang={lang}
        parts={parts}
        viewBox="0 0 300 420"
        title={r("Gruczoły dokrewne człowieka", "Железы внутренней секреции человека")}
        labelOrder={["pineal", "hypothalamus", "pituitary", "thyroid", "parathyroid", "thymus", "adrenal", "pancreas", "gonads"]}
        pinRadius={12}
        maxWidth="max-w-[340px]"
        art={({ part, tone }) => (
          <>
            <path
              d="M88 152 Q 150 140 212 152 Q 234 162 230 204 L 220 300 Q 216 350 204 384 L 96 384 Q 84 350 80 300 L 70 204 Q 66 162 88 152 Z"
              fill="#ffedd5"
              stroke="#fdba74"
              strokeWidth={2}
            />
            <rect x={134} y={112} width={32} height={44} fill="#ffedd5" />
            <circle cx={150} cy={70} r={54} fill="#ffedd5" stroke="#fdba74" strokeWidth={2} />
            <path d="M134 120 L 134 152 M166 120 L 166 152" stroke="#fdba74" strokeWidth={2} />
            <ellipse cx={150} cy={64} rx={40} ry={32} fill="#fce7f3" stroke="#f9a8d4" />
            <path d="M150 34 L 150 94" stroke="#f9a8d4" />
            <g fill="#fecaca" stroke="#fca5a5">
              <path d="M106 252 C 92 254, 92 290, 108 294 C 118 296, 122 284, 116 274 C 122 266, 120 250, 106 252 Z" />
              <path d="M194 252 C 208 254, 208 290, 192 294 C 182 296, 178 284, 184 274 C 178 266, 180 250, 194 252 Z" />
            </g>
            {sex === "f" ? (
              <path d="M134 340 Q 150 330 166 340 L 160 372 L 140 372 Z" fill="#fbcfe8" stroke="#f9a8d4" />
            ) : (
              <path d="M128 384 Q 150 420 172 384 Z" fill="#ffedd5" stroke="#fdba74" strokeWidth={2} />
            )}
            {part("pineal", <circle cx={150} cy={52} r={6} fill={tone("pineal", "#a855f7")} stroke="#6b21a8" />)}
            {part("hypothalamus", <ellipse cx={150} cy={76} rx={13} ry={6} fill={tone("hypothalamus", "#f472b6")} stroke="#be185d" />)}
            {part(
              "pituitary",
              <g>
                <path d="M150 82 L 150 88" stroke={tone("pituitary", "#e11d48")} strokeWidth={3} />
                <circle cx={150} cy={93} r={6.5} fill={tone("pituitary", "#e11d48")} stroke="#9f1239" />
              </g>,
            )}
            {part(
              "thyroid",
              <g fill={tone("thyroid", "#f59e0b")} stroke="#b45309">
                <ellipse cx={140} cy={138} rx={9} ry={13} />
                <ellipse cx={160} cy={138} rx={9} ry={13} />
                <rect x={140} y={140} width={20} height={7} stroke="none" />
              </g>,
            )}
            {part(
              "parathyroid",
              <g fill={tone("parathyroid", "#7c2d12")}>
                {[
                  [134, 131],
                  [134, 146],
                  [166, 131],
                  [166, 146],
                ].map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r={3.2} />
                ))}
              </g>,
            )}
            {part(
              "thymus",
              <g fill={tone("thymus", "#94a3b8")} stroke="#475569">
                <ellipse cx={143} cy={184} rx={9} ry={17} />
                <ellipse cx={157} cy={184} rx={9} ry={17} />
              </g>,
            )}
            {part(
              "adrenal",
              <g fill={tone("adrenal", "#eab308")} stroke="#a16207">
                <path d="M96 252 Q 104 232 120 248 Q 110 256 96 252 Z" />
                <path d="M204 252 Q 196 232 180 248 Q 190 256 204 252 Z" />
              </g>,
            )}
            {part(
              "pancreas",
              <path
                d="M122 318 C 120 306, 136 302, 150 306 C 166 310, 184 298, 198 302 C 206 304, 204 314, 196 316 C 180 318, 164 324, 148 324 C 134 324, 124 326, 122 318 Z"
                fill={tone("pancreas", "#fb923c")}
                stroke="#c2410c"
              />,
            )}
            {part(
              "gonads",
              sex === "f" ? (
                <g fill={tone("gonads", "#ec4899")} stroke="#9d174d">
                  <ellipse cx={120} cy={352} rx={9} ry={6} />
                  <ellipse cx={180} cy={352} rx={9} ry={6} />
                </g>
              ) : (
                <g fill={tone("gonads", "#3b82f6")} stroke="#1e3a8a">
                  <ellipse cx={142} cy={397} rx={7} ry={9} />
                  <ellipse cx={158} cy={397} rx={7} ry={9} />
                </g>
              ),
            )}
          </>
        )}
      />
    </div>
  );
}

// ---------- hormone -> gland ----------

const GLANDS: QuizOption[] = [
  { id: "ant", label: r("przysadka — płat przedni", "гипофиз — передняя доля") },
  { id: "post", label: r("przysadka — płat tylny", "гипофиз — задняя доля") },
  { id: "thyroid", label: r("tarczyca", "щитовидная железа") },
  { id: "para", label: r("przytarczyce", "паращитовидные железы") },
  { id: "cortex", label: r("kora nadnerczy", "кора надпочечников") },
  { id: "medulla", label: r("rdzeń nadnerczy", "мозговое вещество надпочечников") },
  { id: "islets", label: r("wyspy trzustkowe", "островки поджелудочной железы") },
  { id: "ovary", label: r("jajniki", "яичники") },
  { id: "testis", label: r("jądra", "семенники") },
  { id: "pineal", label: r("szyszynka", "эпифиз") },
  { id: "thymus", label: r("grasica", "тимус") },
];

const HORMONE_ITEMS: QuizItem[] = [
  { name: r("somatotropina (hormon wzrostu)", "соматотропин (гормон роста)"), answer: "ant", explain: r("Pobudza wzrost kości długich i syntezę białek.", "Стимулирует рост длинных костей и синтез белка.") },
  { name: r("tyreotropina (TSH)", "тиреотропин (ТТГ)"), answer: "ant", explain: r("Hormon tropowy: pobudza tarczycę do wydzielania tyroksyny.", "Тропный гормон: стимулирует щитовидную железу выделять тироксин.") },
  {
    name: r("wazopresyna (ADH)", "вазопрессин (АДГ)"),
    answer: "post",
    explain: r("Wytwarzana w podwzgórzu, uwalniana z tylnego płata przysadki. Zwiększa resorpcję zwrotną wody w nerkach.", "Образуется в гипоталамусе, выделяется из задней доли гипофиза. Усиливает обратное всасывание воды в почках."),
  },
  { name: r("oksytocyna", "окситоцин"), answer: "post", explain: r("Wywołuje skurcze mięśni macicy podczas porodu i wypływ mleka.", "Вызывает сокращения мышц матки во время родов и выделение молока.") },
  { name: r("tyroksyna (T4)", "тироксин (Т4)"), answer: "thyroid", explain: r("Zwiększa tempo przemiany materii i wytwarzanie ciepła; zawiera jod.", "Повышает скорость обмена веществ и теплопродукцию; содержит йод.") },
  { name: r("kalcytonina", "кальцитонин"), answer: "thyroid", explain: r("Obniża poziom wapnia we krwi, hamując uwalnianie go z kości.", "Снижает уровень кальция в крови, подавляя его высвобождение из костей.") },
  { name: r("parathormon", "паратгормон"), answer: "para", explain: r("Podwyższa poziom wapnia we krwi, uwalniając go z kości.", "Повышает уровень кальция в крови, высвобождая его из костей.") },
  { name: r("kortyzol", "кортизол"), answer: "cortex", explain: r("Podwyższa poziom glukozy kosztem białek i tłuszczów, hamuje odczyn zapalny.", "Повышает уровень глюкозы за счёт белков и жиров, подавляет воспаление.") },
  { name: r("aldosteron", "альдостерон"), answer: "cortex", explain: r("Zwiększa resorpcję zwrotną sodu i wydalanie potasu w nerkach.", "Усиливает обратное всасывание натрия и выведение калия в почках.") },
  { name: r("adrenalina", "адреналин"), answer: "medulla", explain: r("Przyspiesza akcję serca i rozszerza oskrzela w reakcji na stres.", "Ускоряет работу сердца и расширяет бронхи в ответ на стресс.") },
  { name: r("insulina", "инсулин"), answer: "islets", explain: r("Wydzielają ją komórki beta; obniża poziom glukozy we krwi.", "Выделяется бета-клетками; снижает уровень глюкозы в крови.") },
  { name: r("glukagon", "глюкагон"), answer: "islets", explain: r("Wydzielają go komórki alfa; podwyższa poziom glukozy, rozkładając glikogen w wątrobie.", "Выделяется альфа-клетками; повышает уровень глюкозы, расщепляя гликоген в печени.") },
  { name: r("testosteron", "тестостерон"), answer: "testis", explain: r("Warunkuje rozwój męskich cech płciowych i spermatogenezę.", "Определяет развитие мужских половых признаков и сперматогенез.") },
  {
    name: r("progesteron", "прогестерон"),
    answer: "ovary",
    explain: r("Wydziela go ciałko żółte jajnika; przygotowuje błonę śluzową macicy do zagnieżdżenia zarodka.", "Выделяется жёлтым телом яичника; готовит слизистую матки к имплантации зародыша."),
  },
  { name: r("melatonina", "мелатонин"), answer: "pineal", explain: r("Reguluje rytm dobowy i ułatwia zasypianie.", "Регулирует суточный ритм и облегчает засыпание.") },
  { name: r("tymozyna", "тимозин"), answer: "thymus", explain: r("Steruje dojrzewaniem limfocytów T.", "Управляет созреванием Т-лимфоцитов.") },
];

// ---------- target cells ----------

type Hormone = "tsh" | "insulin" | "glucagon" | "adrenaline" | "adh";
type Cell = "thyroid" | "liver" | "muscle" | "fat" | "heart" | "kidney";

const HORMONE_INFO: Record<Hormone, { name: Txt; color: string; targets: Partial<Record<Cell, Txt>> }> = {
  tsh: {
    name: r("TSH", "ТТГ"),
    color: "#8b5cf6",
    targets: { thyroid: r("wydziela więcej tyroksyny", "выделяет больше тироксина") },
  },
  insulin: {
    name: r("insulina", "инсулин"),
    color: "#0ea5e9",
    targets: {
      liver: r("pobiera glukozę i magazynuje ją jako glikogen", "поглощает глюкозу и запасает её в виде гликогена"),
      muscle: r("pobiera glukozę z krwi i magazynuje glikogen", "поглощает глюкозу из крови и запасает гликоген"),
      fat: r("pobiera glukozę i odkłada tłuszcz", "поглощает глюкозу и откладывает жир"),
    },
  },
  glucagon: {
    name: r("glukagon", "глюкагон"),
    color: "#f59e0b",
    targets: { liver: r("rozkłada glikogen i oddaje glukozę do krwi", "расщепляет гликоген и отдаёт глюкозу в кровь") },
  },
  adrenaline: {
    name: r("adrenalina", "адреналин"),
    color: "#ef4444",
    targets: {
      heart: r("bije szybciej i silniej", "бьётся чаще и сильнее"),
      liver: r("rozkłada glikogen do glukozy", "расщепляет гликоген до глюкозы"),
      muscle: r("rozkłada glikogen — energia do wysiłku", "расщепляет гликоген — энергия для усилия"),
      fat: r("rozkłada tłuszcze", "расщепляет жиры"),
    },
  },
  adh: {
    name: r("wazopresyna", "вазопрессин"),
    color: "#14b8a6",
    targets: { kidney: r("kanalik zbiorczy wchłania więcej wody", "собирательная трубочка всасывает больше воды") },
  },
};

const CELLS: { id: Cell; icon: string; name: Txt; x: number; y: number }[] = [
  { id: "thyroid", icon: "🦋", name: r("tarczyca", "щитовидная железа"), x: 10, y: 74 },
  { id: "liver", icon: "🟤", name: r("wątroba", "печень"), x: 126, y: 74 },
  { id: "muscle", icon: "💪", name: r("mięśnie szkieletowe", "скелетные мышцы"), x: 242, y: 74 },
  { id: "fat", icon: "🟡", name: r("tkanka tłuszczowa", "жировая ткань"), x: 10, y: 150 },
  { id: "heart", icon: "❤️", name: r("serce", "сердце"), x: 126, y: 150 },
  { id: "kidney", icon: "💧", name: r("nerka", "почка"), x: 242, y: 150 },
];

function TargetCells({ lang }: { lang: BioLang }) {
  const [hormone, setHormone] = useState<Hormone>("tsh");
  const h = HORMONE_INFO[hormone];
  const isTarget = (c: Cell) => c in h.targets;
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(HORMONE_INFO) as Hormone[]).map((k) => (
          <Choice key={k} state={hormone === k ? "active" : "idle"} onClick={() => setHormone(k)}>
            {HORMONE_INFO[k].name[lang]}
          </Choice>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 360 218" className="w-full" role="img" aria-label={lang === "pl" ? `komórki docelowe: ${h.name.pl}` : `клетки-мишени: ${h.name.ru}`}>
          <rect x={0} y={10} width={360} height={34} rx={17} fill="#fee2e2" stroke="#fca5a5" />
          <text x={8} y={8} fontSize={9} fill="#991b1b">
            {lang === "pl" ? "krew" : "кровь"}
          </text>
          {Array.from({ length: 14 }, (_, k) => (
            <circle key={k} cx={14 + k * 25 + (k % 2) * 6} cy={22 + (k % 3) * 5} r={4} fill={h.color} />
          ))}
          {CELLS.map((c) => (
            <path key={`${c.id}-v`} d={`M${c.x + 54} 44 L ${c.x + 54} ${c.y}`} stroke="#fca5a5" strokeWidth={3} />
          ))}
          {CELLS.map((c) => {
            const on = isTarget(c.id);
            return (
              <g key={c.id}>
                <rect x={c.x} y={c.y} width={108} height={60} rx={14} fill={on ? "#d1fae5" : "#f1f5f9"} stroke={on ? "#059669" : "#cbd5e1"} strokeWidth={on ? 2.5 : 1.5} />
                {on &&
                  [24, 54, 84].map((dx) => (
                    <g key={dx}>
                      <path d={`M${c.x + dx - 6} ${c.y - 1} L ${c.x + dx - 6} ${c.y + 6} L ${c.x + dx + 6} ${c.y + 6} L ${c.x + dx + 6} ${c.y - 1}`} fill="none" stroke="#059669" strokeWidth={2} />
                      <circle cx={c.x + dx} cy={c.y + 1} r={4} fill={h.color} />
                    </g>
                  ))}
                <text x={c.x + 54} y={c.y + 30} textAnchor="middle" fontSize={16}>
                  {c.icon}
                </text>
                <text x={c.x + 54} y={c.y + 50} textAnchor="middle" fontSize={10} fontWeight={on ? 700 : 400} fill={on ? "#065f46" : "#64748b"}>
                  {c.name[lang]}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          <p className="font-semibold text-slate-900">
            {lang === "pl" ? "Główne komórki docelowe" : "Главные клетки-мишени"} — {h.name[lang]}:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {CELLS.filter((c) => isTarget(c.id)).map((c) => (
              <li key={c.id}>
                <b>{c.name[lang]}</b> — {h.targets[c.id]![lang]}
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-500">
            {lang === "pl"
              ? "Hormon dociera z krwią do wszystkich komórek, ale reagują tylko te, które mają dla niego receptory (zielone „miseczki”)."
              : "Гормон с кровью доходит до всех клеток, но реагируют только те, у которых есть для него рецепторы (зелёные «чашечки»)."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- steroid vs peptide ----------

function CellArt({ kind, lang }: { kind: "peptide" | "steroid"; lang: BioLang }) {
  const pl = lang === "pl";
  return (
    <svg viewBox="0 0 220 170" className="w-full" role="img" aria-label={kind === "peptide" ? (pl ? "hormon peptydowy i receptor w błonie" : "пептидный гормон и рецептор в мембране") : pl ? "hormon steroidowy i receptor w komórce" : "стероидный гормон и рецептор внутри клетки"}>
      <defs>
        <marker id={`gland-arrow-${kind}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L 10 5 L 0 10 Z" fill="#334155" />
        </marker>
      </defs>
      <rect x={10} y={40} width={200} height={124} rx={22} fill="#f0fdf4" stroke="#16a34a" strokeWidth={4} />
      <circle cx={150} cy={116} r={30} fill="#e0e7ff" stroke="#6366f1" strokeWidth={2} />
      <path d="M132 112 q 6 -8 12 0 t 12 0 t 12 0" stroke="#4338ca" fill="none" strokeWidth={2} />
      <text x={150} y={136} textAnchor="middle" fontSize={8} fill="#3730a3">
        {pl ? "DNA" : "ДНК"}
      </text>
      {kind === "peptide" ? (
        <g>
          <circle cx={60} cy={14} r={7} fill="#0ea5e9" />
          <path d="M50 30 L 50 44 L 70 44 L 70 30" fill="#bae6fd" stroke="#0369a1" strokeWidth={2} />
          <path d="M60 22 L 60 30" stroke="#0369a1" strokeWidth={1.5} markerEnd={`url(#gland-arrow-${kind})`} />
          <text x={76} y={30} fontSize={8} fill="#0369a1">
            {pl ? "receptor w błonie" : "рецептор в мембране"}
          </text>
          <path d="M60 50 L 60 72" stroke="#334155" strokeWidth={1.5} markerEnd={`url(#gland-arrow-${kind})`} />
          <circle cx={60} cy={84} r={11} fill="#fde68a" stroke="#b45309" />
          <text x={60} y={87} textAnchor="middle" fontSize={7} fill="#78350f">
            {pl ? "cAMP" : "цАМФ"}
          </text>
          <path d="M60 96 L 60 116" stroke="#334155" strokeWidth={1.5} markerEnd={`url(#gland-arrow-${kind})`} />
          <rect x={34} y={120} width={52} height={20} rx={6} fill="#fecaca" stroke="#b91c1c" />
          <text x={60} y={133} textAnchor="middle" fontSize={8} fill="#7f1d1d">
            {pl ? "enzymy" : "ферменты"}
          </text>
          <text x={60} y={156} textAnchor="middle" fontSize={8} fill="#334155">
            {pl ? "szybka odpowiedź" : "быстрый ответ"}
          </text>
        </g>
      ) : (
        <g>
          <path d="M44 6 l 8 5 l 0 9 l -8 5 l -8 -5 l 0 -9 Z" fill="#f97316" />
          <path d="M44 28 L 52 64" stroke="#334155" strokeWidth={1.5} strokeDasharray="3 2" markerEnd={`url(#gland-arrow-${kind})`} />
          <text x={56} y={24} fontSize={8} fill="#9a3412">
            {pl ? "przenika przez błonę" : "проходит через мембрану"}
          </text>
          <path d="M44 72 l 8 5 l 0 9 l -8 5 l -8 -5 l 0 -9 Z" fill="#f97316" />
          <path d="M50 80 L 64 80 L 64 96 L 50 96" fill="#bae6fd" stroke="#0369a1" strokeWidth={2} />
          <text x={30} y={110} fontSize={8} fill="#0369a1">
            {pl ? "receptor w cytoplazmie" : "рецептор в цитоплазме"}
          </text>
          <path d="M68 88 L 120 108" stroke="#334155" strokeWidth={1.5} markerEnd={`url(#gland-arrow-${kind})`} />
          <text x={150} y={94} textAnchor="middle" fontSize={8} fill="#3730a3">
            {pl ? "zmiana ekspresji genów" : "изменение экспрессии генов"}
          </text>
          <path d="M150 146 L 90 150" stroke="#334155" strokeWidth={1.5} markerEnd={`url(#gland-arrow-${kind})`} />
          <text x={60} y={154} textAnchor="middle" fontSize={8} fill="#334155">
            {pl ? "nowe białka" : "новые белки"}
          </text>
        </g>
      )}
    </svg>
  );
}

const L = {
  examples: r("Przykłady", "Примеры"),
  chem: r("Budowa", "Строение"),
  membrane: r("Błona komórkowa", "Клеточная мембрана"),
  receptor: r("Receptor", "Рецептор"),
  action: r("Działanie", "Действие"),
  speed: r("Szybkość", "Скорость"),
};

function hormoneTypes(lang: BioLang): CompareCard[] {
  return [
    {
      id: "peptide",
      icon: "🔗",
      name: r("Peptydowe", "Пептидные"),
      art: <CellArt kind="peptide" lang={lang} />,
      rows: [
        { label: L.examples, value: r("insulina, glukagon, wazopresyna, somatotropina; podobnie adrenalina", "инсулин, глюкагон, вазопрессин, соматотропин; так же действует адреналин") },
        { label: L.chem, value: r("łańcuchy aminokwasów (białka, peptydy) lub pochodne aminokwasów", "цепочки аминокислот (белки, пептиды) или производные аминокислот") },
        { label: L.membrane, value: r("rozpuszczalne w wodzie — nie przechodzą przez błonę", "растворимы в воде — через мембрану не проходят") },
        { label: L.receptor, value: r("w błonie komórkowej", "в клеточной мембране") },
        { label: L.action, value: r("receptor uruchamia przekaźnik II rzędu (np. cykliczny AMP), który aktywuje enzymy", "рецептор запускает вторичный посредник (например, циклический АМФ), который активирует ферменты") },
        { label: L.speed, value: r("szybkie (sekundy–minuty)", "быстрое (секунды–минуты)") },
      ],
    },
    {
      id: "steroid",
      icon: "⬡",
      name: r("Steroidowe", "Стероидные"),
      art: <CellArt kind="steroid" lang={lang} />,
      rows: [
        { label: L.examples, value: r("kortyzol, aldosteron, testosteron, estrogeny, progesteron", "кортизол, альдостерон, тестостерон, эстрогены, прогестерон") },
        { label: L.chem, value: r("pochodne cholesterolu (lipidy)", "производные холестерина (липиды)") },
        { label: L.membrane, value: r("rozpuszczalne w tłuszczach — przenikają przez błonę", "растворимы в жирах — проходят через мембрану") },
        { label: L.receptor, value: r("w cytoplazmie lub w jądrze komórkowym", "в цитоплазме или в ядре") },
        { label: L.action, value: r("kompleks hormon–receptor wiąże się z DNA i zmienia ekspresję genów — powstają nowe białka", "комплекс гормон–рецептор связывается с ДНК и меняет экспрессию генов — образуются новые белки") },
        { label: L.speed, value: r("wolniejsze (godziny), ale długotrwałe", "медленнее (часы), но длительно") },
      ],
      text: r(
        "Tak samo działają hormony tarczycy (T3, T4): choć są pochodnymi aminokwasu, przenikają do komórki, a ich receptory leżą w jądrze.",
        "Так же действуют гормоны щитовидной железы (Т3, Т4): хотя они производные аминокислоты, они проникают в клетку, а их рецепторы находятся в ядре.",
      ),
    },
  ];
}

const RECEPTOR_SORT: SortItem[] = [
  { name: r("insulina", "инсулин"), group: 0, why: r("Białko — nie przejdzie przez błonę.", "Белок — через мембрану не пройдёт.") },
  { name: r("kortyzol", "кортизол"), group: 1, why: r("Steroid — przenika przez błonę.", "Стероид — проходит через мембрану.") },
  { name: r("adrenalina", "адреналин"), group: 0, why: r("Pochodna aminokwasu rozpuszczalna w wodzie; działa przez cAMP.", "Водорастворимое производное аминокислоты; действует через цАМФ.") },
  { name: r("testosteron", "тестостерон"), group: 1, why: r("Steroid — pochodna cholesterolu.", "Стероид — производное холестерина.") },
  { name: r("glukagon", "глюкагон"), group: 0, why: r("Peptyd; jego receptor w błonie komórek wątroby uruchamia cAMP.", "Пептид; его рецептор в мембране клеток печени запускает цАМФ.") },
  { name: r("tyroksyna", "тироксин"), group: 1, why: r("Wyjątek: pochodna aminokwasu, ale jej receptor leży w jądrze.", "Исключение: производное аминокислоты, но его рецептор находится в ядре.") },
  { name: r("wazopresyna", "вазопрессин"), group: 0, why: r("Krótki peptyd — działa przez receptor w błonie.", "Короткий пептид — действует через рецептор в мембране.") },
  { name: r("estrogen", "эстроген"), group: 1, why: r("Steroid — przenika przez błonę.", "Стероид — проходит через мембрану.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r(
      "Podwzgórze steruje przysadką, a przysadka hormonami tropowymi — tarczycą, korą nadnerczy i gonadami.",
      "Гипоталамус управляет гипофизом, а гипофиз тропными гормонами — щитовидной железой, корой надпочечников и половыми железами.",
    ),
    r("Trzustka i gonady to gruczoły o wydzielaniu mieszanym (zewnątrz- i wewnątrzwydzielniczym).", "Поджелудочная и половые железы — железы смешанной секреции (внешней и внутренней)."),
  ],
  s2: [
    r(
      "Wazopresyna i oksytocyna powstają w podwzgórzu, a do krwi uwalnia je tylny płat przysadki.",
      "Вазопрессин и окситоцин образуются в гипоталамусе, а в кровь их выпускает задняя доля гипофиза.",
    ),
  ],
  s3: [
    r("Hormon działa tylko na komórki docelowe — te, które mają dla niego swoiste receptory.", "Гормон действует только на клетки-мишени — те, у которых есть для него специфические рецепторы."),
  ],
  s4: [
    r(
      "Hormony peptydowe: receptor w błonie + przekaźnik II rzędu (cAMP). Hormony steroidowe: receptor w komórce + zmiana ekspresji genów.",
      "Пептидные гормоны: рецептор в мембране + вторичный посредник (цАМФ). Стероидные гормоны: рецептор внутри клетки + изменение экспрессии генов.",
    ),
  ],
};

export default function GlandsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="gland" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="gland-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <GlandMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="gland-s2" n={2} title={T.s2[lang]}>
        <MatchQuiz
          lang={lang}
          title={T.s2}
          question={r("Który gruczoł wydziela", "Какая железа выделяет")}
          options={GLANDS}
          items={HORMONE_ITEMS}
          wrongHint={r("Pomyśl, czym steruje ten hormon — często podpowiada to, gdzie powstaje.", "Подумай, чем управляет этот гормон, — это часто подсказывает, где он образуется.")}
        />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="gland-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TargetCells lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="gland-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={hormoneTypes(lang)} />
        <div className="mt-5">
          <TwoWaySort
            lang={lang}
            title={r("Gdzie leży receptor?", "Где находится рецептор?")}
            groups={[r("w błonie", "в мембране"), r("w komórce", "внутри клетки")]}
            items={RECEPTOR_SORT}
          />
        </div>
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
