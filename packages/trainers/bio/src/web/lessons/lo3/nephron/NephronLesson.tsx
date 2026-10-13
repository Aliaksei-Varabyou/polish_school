// Lesson for LO3 §7.2 "Budowa i funkcjonowanie układu moczowego" (zakres rozszerzony). Parts and
// processes follow templates/data/urinary.ts (NEPHRON_PARTS, URINE_PROCESSES).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, OrderGame, PartMap, type CompareCard, type MapPart, type QuizItem, type QuizOption } from "../../games.tsx";
import { num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Każda nerka ma ok. miliona nefronów — mikroskopijnych filtrów. W ciągu doby przepływa przez nie tyle krwi, że powstaje ok. 180 litrów przesączu, a mimo to wydalamy tylko ok. 1,5 litra moczu. Cała reszta wraca do krwi.",
    "В каждой почке около миллиона нефронов — микроскопических фильтров. За сутки через них проходит столько крови, что образуется около 180 литров первичной мочи, а выделяем мы лишь около 1,5 литра. Всё остальное возвращается в кровь.",
  ),
  s1: r("Budowa nefronu", "Строение нефрона"),
  s1intro: r("Nefron zaczyna się w korze nerki, a jego pętla schodzi w głąb rdzenia.", "Нефрон начинается в корковом веществе почки, а его петля уходит вглубь мозгового вещества."),
  s2: r("Cztery procesy powstawania moczu", "Четыре процесса образования мочи"),
  s3: r("Los substancji w nefronie", "Судьба веществ в нефроне"),
  s3intro: r("Co dzieje się z daną substancją, gdy krew trafia do nerki?", "Что происходит с веществом, когда кровь попадает в почку?"),
  s4: r("Wazopresyna i gospodarka wodna", "Вазопрессин и водный баланс"),
  s4intro: r(
    "Przesuń suwak i zobacz, jak organizm reaguje na odwodnienie i nadmiar wody.",
    "Сдвинь ползунок и посмотри, как организм реагирует на обезвоживание и избыток воды.",
  ),
  s5: r("Droga moczu", "Путь мочи"),
  s5intro: r("Ułóż drogę od krwi w kłębuszku do wydalenia moczu z organizmu.", "Выстрой путь от крови в клубочке до выведения мочи из организма."),
} satisfies Record<string, Txt>;

// ---------- nephron map ----------

type NPart = "glom" | "capsule" | "prox" | "loop" | "distal" | "collect";

const PARTS: Record<NPart, MapPart> = {
  glom: {
    name: r("Kłębuszek nerkowy", "Почечный клубочек"),
    text: r(
      "Sieć naczyń włosowatych. Krew dopływa tętniczką doprowadzającą szerszą niż odprowadzająca, więc ciśnienie jest tu wysokie i wyciska osocze do torebki — to filtracja.",
      "Сеть капилляров. Приносящая артериола шире выносящей, поэтому давление здесь высокое и выдавливает плазму в капсулу — это фильтрация.",
    ),
    pin: [30, 150],
    to: [64, 86],
  },
  capsule: {
    name: r("Torebka Bowmana", "Капсула Боумена"),
    text: r("Dwuścienny „kielich” otaczający kłębuszek; zbiera przesącz, czyli mocz pierwotny.", "Двустенная «чаша» вокруг клубочка; собирает фильтрат, то есть первичную мочу."),
    pin: [30, 22],
    to: [48, 52],
  },
  prox: {
    name: r("Kanalik kręty bliższy", "Проксимальный извитой каналец"),
    text: r(
      "Tu odzyskiwana jest cała glukoza i aminokwasy, większość jonów i ok. 2/3 wody. Komórki mają mikrokosmki i dużo mitochondriów — resorpcja wymaga energii.",
      "Здесь возвращаются вся глюкоза и аминокислоты, большая часть ионов и около 2/3 воды. У клеток есть микроворсинки и много митохондрий — реабсорбция требует энергии.",
    ),
    pin: [150, 28],
    to: [140, 80],
  },
  loop: {
    name: r("Pętla nefronu (Henlego)", "Петля нефрона (Генле)"),
    text: r(
      "Ramię zstępujące przepuszcza wodę, wstępujące — wypompowuje sól. Dzięki temu rdzeń nerki staje się coraz bardziej słony w głąb, co pozwala potem zagęszczać mocz.",
      "Нисходящее колено пропускает воду, восходящее — выкачивает соль. Благодаря этому мозговое вещество вглубь становится всё солонее, что потом позволяет концентрировать мочу.",
    ),
    pin: [130, 250],
    to: [180, 232],
  },
  distal: {
    name: r("Kanalik kręty dalszy", "Дистальный извитой каналец"),
    text: r(
      "Zachodzi tu sekrecja jonów H⁺ i K⁺ oraz niektórych leków. Aldosteron zwiększa tu zwrotne wchłanianie sodu, a za nim wody.",
      "Здесь идёт секреция ионов H⁺ и K⁺ и некоторых лекарств. Альдостерон усиливает здесь обратное всасывание натрия, а за ним — воды.",
    ),
    pin: [262, 36],
    to: [252, 94],
  },
  collect: {
    name: r("Kanalik zbiorczy", "Собирательная трубочка"),
    text: r(
      "Zbiera mocz z wielu nefronów i prowadzi go przez słony rdzeń. Wazopresyna (ADH) otwiera w jego ścianie kanały wodne, więc woda wraca do krwi, a mocz się zagęszcza.",
      "Собирает мочу из многих нефронов и ведёт её через солёное мозговое вещество. Вазопрессин (АДГ) открывает в её стенке водные каналы, вода возвращается в кровь, а моча концентрируется.",
    ),
    pin: [344, 214],
    to: [322, 214],
  },
};

const TUBE = { fill: "none", strokeWidth: 11, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function NephronMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<NPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 360 300"
      title={r("Nefron", "Нефрон")}
      labelOrder={["glom", "capsule", "prox", "loop", "distal", "collect"]}
      pinRadius={13}
      art={({ part, tone }) => (
        <>
          <rect width={360} height={150} fill="#fef3c7" />
          <rect y={150} width={360} height={150} fill="#fde68a" />
          <text x={6} y={144} fontSize={10} fill="#92400e">
            {lang === "pl" ? "kora" : "корковое в-во"}
          </text>
          <text x={6} y={294} fontSize={10} fill="#92400e">
            {lang === "pl" ? "rdzeń" : "мозговое в-во"}
          </text>
          {part(
            "collect",
            <g>
              <path d="M320 14 L 320 292" stroke={tone("collect", "#a16207")} {...TUBE} strokeWidth={16} />
              <path d="M320 14 L 320 292" stroke="#fef9c3" fill="none" strokeWidth={6} strokeLinecap="round" />
            </g>,
          )}
          {part("prox", <path d="M104 70 C 118 56, 128 104, 144 82 S 168 58, 176 92 L 180 124" stroke={tone("prox", "#f59e0b")} {...TUBE} />)}
          {part("loop", <path d="M180 124 L 180 252 Q 195 284 210 252 L 210 124" stroke={tone("loop", "#0ea5e9")} {...TUBE} />)}
          {part("distal", <path d="M210 124 C 210 100, 232 70, 246 96 S 268 122, 282 92 L 312 82" stroke={tone("distal", "#a855f7")} {...TUBE} />)}
          {part(
            "capsule",
            <path d="M91.9 50 A34 34 0 1 0 103.5 70.1" stroke={tone("capsule", "#eab308")} fill="#fffbeb" strokeWidth={9} />,
          )}
          {part(
            "glom",
            <g fill={tone("glom", "#ef4444")}>
              <path d="M8 46 L 58 66" stroke={tone("glom", "#dc2626")} strokeWidth={7} strokeLinecap="round" />
              <path d="M62 62 L 40 10" stroke={tone("glom", "#b91c1c")} strokeWidth={5} strokeLinecap="round" />
              {[
                [64, 72],
                [78, 70],
                [70, 84],
                [58, 86],
                [82, 84],
                [70, 96],
              ].map(([x, y], k) => (
                <circle key={k} cx={x} cy={y} r={9} stroke="#7f1d1d" strokeWidth={1} />
              ))}
            </g>,
          )}
        </>
      )}
    />
  );
}

// ---------- the four processes ----------

const L = {
  where: r("Gdzie", "Где"),
  what: r("Co się dzieje", "Что происходит"),
  how: r("Mechanizm", "Механизм"),
  result: r("Efekt", "Результат"),
};

const PROCESSES: CompareCard[] = [
  {
    id: "filtration",
    icon: "🫗",
    name: r("Filtracja", "Фильтрация"),
    rows: [
      { label: L.where, value: r("kłębuszek → torebka Bowmana", "клубочек → капсула Боумена") },
      { label: L.what, value: r("woda i drobne cząsteczki przechodzą z krwi do torebki; białka i krwinki zostają we krwi", "вода и мелкие молекулы переходят из крови в капсулу; белки и клетки крови остаются в крови") },
      { label: L.how, value: r("bierny — napędza go ciśnienie krwi", "пассивный — движущая сила давление крови") },
      { label: L.result, value: r("ok. 180 l moczu pierwotnego na dobę", "около 180 л первичной мочи в сутки") },
    ],
  },
  {
    id: "reabsorption",
    icon: "↩️",
    name: r("Resorpcja zwrotna", "Обратное всасывание"),
    rows: [
      { label: L.where, value: r("głównie kanalik kręty bliższy, też pętla i kanalik dalszy", "в основном проксимальный каналец, а также петля и дистальный каналец") },
      { label: L.what, value: r("glukoza, aminokwasy, jony i woda wracają z kanalika do krwi", "глюкоза, аминокислоты, ионы и вода возвращаются из канальца в кровь") },
      { label: L.how, value: r("czynny transport (zużywa ATP) i osmoza wody", "активный транспорт (тратит АТФ) и осмос воды") },
      { label: L.result, value: r("ok. 99% przesączu wraca do krwi", "около 99% фильтрата возвращается в кровь") },
    ],
  },
  {
    id: "secretion",
    icon: "➕",
    name: r("Sekrecja kanalikowa", "Канальцевая секреция"),
    rows: [
      { label: L.where, value: r("głównie kanalik kręty dalszy", "в основном дистальный каналец") },
      { label: L.what, value: r("jony H⁺, K⁺, niektóre leki i toksyny przechodzą z krwi do kanalika", "ионы H⁺, K⁺, некоторые лекарства и токсины переходят из крови в каналец") },
      { label: L.how, value: r("czynny transport", "активный транспорт") },
      { label: L.result, value: r("usuwanie zbędnych substancji i regulacja pH krwi", "удаление ненужных веществ и регуляция pH крови") },
    ],
  },
  {
    id: "concentration",
    icon: "💧",
    name: r("Zagęszczanie", "Концентрирование"),
    rows: [
      { label: L.where, value: r("kanalik zbiorczy w rdzeniu nerki", "собирательная трубочка в мозговом веществе") },
      { label: L.what, value: r("woda przechodzi z kanalika do słonego rdzenia i wraca do krwi", "вода выходит из трубочки в солёное мозговое вещество и возвращается в кровь") },
      { label: L.how, value: r("osmoza; liczbę kanałów wodnych reguluje wazopresyna (ADH)", "осмос; число водных каналов регулирует вазопрессин (АДГ)") },
      { label: L.result, value: r("ok. 1,5 l moczu ostatecznego na dobę", "около 1,5 л вторичной мочи в сутки") },
    ],
  },
];

// ---------- fate of a substance ----------

const FATE: QuizOption[] = [
  { id: "stay", label: r("nie przechodzi do przesączu", "не попадает в фильтрат") },
  { id: "all", label: r("przesącza się i wraca do krwi w całości", "фильтруется и возвращается в кровь полностью") },
  { id: "most", label: r("przesącza się, większość wraca do krwi", "фильтруется, большая часть возвращается") },
  { id: "out", label: r("przesącza się i w dużej części zostaje w moczu", "фильтруется и в основном остаётся в моче") },
  { id: "secreted", label: r("dodatkowo wydzielana do kanalika (sekrecja)", "дополнительно выделяется в каналец (секреция)") },
];

const SUBSTANCES: QuizItem[] = [
  { icon: "🥚", name: r("białka osocza", "белки плазмы"), answer: "stay", explain: r("Są za duże, by przejść przez ścianę kłębuszka. Białko w moczu to sygnał uszkodzenia nerek.", "Слишком крупные, чтобы пройти через стенку клубочка. Белок в моче — признак повреждения почек.") },
  { icon: "🍬", name: r("glukoza", "глюкоза"), answer: "all", explain: r("Wraca w całości w kanaliku bliższym. Glukoza w moczu pojawia się, gdy jej stężenie we krwi jest za wysokie (cukrzyca) i nośniki nie nadążają.", "Полностью возвращается в проксимальном канальце. Глюкоза в моче появляется, когда её в крови слишком много (диабет) и переносчики не справляются.") },
  { icon: "💧", name: r("woda", "вода"), answer: "most", explain: r("Ok. 99% wody wraca do krwi; ile dokładnie — reguluje wazopresyna.", "Около 99% воды возвращается в кровь; сколько именно — регулирует вазопрессин.") },
  { icon: "🧪", name: r("mocznik", "мочевина"), answer: "out", explain: r("To główny produkt przemiany białek, powstaje w wątrobie. Tylko część wraca do krwi — reszta jest wydalana.", "Главный продукт распада белков, образуется в печени. Лишь часть возвращается в кровь — остальное выводится.") },
  { icon: "🩸", name: r("krwinki czerwone", "эритроциты"), answer: "stay", explain: r("Komórki krwi nie przechodzą przez filtr kłębuszka.", "Клетки крови не проходят через фильтр клубочка.") },
  { icon: "⚗️", name: r("jony H⁺", "ионы H⁺"), answer: "secreted", explain: r("Nerki wydzielają je do moczu, gdy krew jest zbyt kwaśna — tak pomagają utrzymać pH.", "Почки выделяют их в мочу, когда кровь слишком кислая, — так они поддерживают pH.") },
  { icon: "🧂", name: r("jony sodu Na⁺", "ионы натрия Na⁺"), answer: "most", explain: r("Większość wraca do krwi; aldosteron zwiększa resorpcję sodu w kanaliku dalszym.", "Большая часть возвращается; альдостерон усиливает реабсорбцию натрия в дистальном канальце.") },
  { icon: "💊", name: r("niektóre leki (np. penicylina)", "некоторые лекарства (например, пенициллин)"), answer: "secreted", explain: r("Są aktywnie wydzielane do kanalika, dlatego szybko znikają z krwi i trzeba je przyjmować co kilka godzin.", "Активно выделяются в каналец, поэтому быстро исчезают из крови, и их приходится принимать каждые несколько часов.") },
  { icon: "🧬", name: r("aminokwasy", "аминокислоты"), answer: "all", explain: r("Jak glukoza — cenne dla organizmu, wracają w całości w kanaliku bliższym.", "Как и глюкоза, ценны для организма и полностью возвращаются в проксимальном канальце.") },
];

// ---------- ADH ----------

function Vasopressin({ lang }: { lang: BioLang }) {
  const [water, setWater] = useState(50);
  const adh = 100 - water;
  const litres = 0.5 + (water / 50) ** 2;
  const reabsorbed = num(100 * (1 - litres / 180), 1);
  const state =
    water < 30
      ? r("Odwodnienie: osocze jest zbyt stężone. Osmoreceptory podwzgórza to wykrywają, przysadka uwalnia dużo wazopresyny, pojawia się pragnienie.", "Обезвоживание: плазма слишком концентрирована. Осморецепторы гипоталамуса это замечают, гипофиз выделяет много вазопрессина, появляется жажда.")
      : water > 70
        ? r("Nadmiar wody: osocze jest rozcieńczone. Wydzielanie wazopresyny słabnie, kanalik zbiorczy staje się mało przepuszczalny dla wody.", "Избыток воды: плазма разбавлена. Выделение вазопрессина ослабевает, собирательная трубочка становится плохо проницаемой для воды.")
        : r("Równowaga: wazopresyna wydzielana jest w umiarkowanej ilości.", "Равновесие: вазопрессин выделяется в умеренном количестве.");
  // pale straw for dilute urine, deep amber for concentrated
  const urine = `hsl(${42 + water * 0.1} ${90 - water * 0.4}% ${45 + water * 0.4}%)`;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Nawodnienie organizmu" : "Водный баланс организма"}
          <input
            type="range"
            min={0}
            max={100}
            value={water}
            onChange={(e) => setWater(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-sky-600"
            aria-valuetext={`${water}%`}
          />
          <span className="mt-1 flex justify-between text-xs font-normal text-slate-500">
            <span>{lang === "pl" ? "odwodnienie" : "обезвоживание"}</span>
            <span>{lang === "pl" ? "nadmiar wody" : "избыток воды"}</span>
          </span>
        </label>
        <div className="space-y-1 text-sm">
          <p className="flex items-center gap-2">
            <span className="w-28 text-slate-500">{lang === "pl" ? "Wazopresyna" : "Вазопрессин"}</span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
              <span className="block h-full bg-violet-500 transition-all" style={{ width: `${adh}%` }} />
            </span>
          </p>
        </div>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          {state[lang]}
        </p>
      </div>
      <div className="flex items-end gap-4">
        <svg viewBox="0 0 100 160" className="w-24 shrink-0" aria-hidden>
          <defs>
            <clipPath id="neph-cup">
              <path d="M20 10 L 80 10 L 74 150 L 26 150 Z" />
            </clipPath>
          </defs>
          <path d="M20 10 L 80 10 L 74 150 L 26 150 Z" fill="#f8fafc" />
          <rect x={0} y={150 - 136 * (litres / 4.5)} width={100} height={160} fill={urine} clipPath="url(#neph-cup)" style={{ transition: "all .4s" }} />
          <path d="M20 10 L 80 10 L 74 150 L 26 150 Z" fill="none" stroke="#94a3b8" strokeWidth={2} />
        </svg>
        <div className="space-y-1 text-[15px]" aria-live="polite">
          <p>
            {lang === "pl" ? "Mocz ostateczny" : "Вторичная моча"}: <b className="tabular-nums">{num(litres, 1)} {lang === "pl" ? "l / dobę" : "л / сутки"}</b>
          </p>
          <p>
            {lang === "pl" ? "Wraca do krwi" : "Возвращается в кровь"}: <b className="tabular-nums">{reabsorbed}%</b> {lang === "pl" ? "przesączu" : "фильтрата"}
          </p>
          <p className="text-sm text-slate-500">{lang === "pl" ? "Przesącz zawsze ≈ 180 l / dobę." : "Фильтрата всегда ≈ 180 л в сутки."}</p>
        </div>
      </div>
    </div>
  );
}

const PATH: Txt[] = [
  r("torebka Bowmana", "капсула Боумена"),
  r("kanalik kręty bliższy", "проксимальный извитой каналец"),
  r("pętla nefronu", "петля нефрона"),
  r("kanalik kręty dalszy", "дистальный извитой каналец"),
  r("kanalik zbiorczy", "собирательная трубочка"),
  r("miedniczka nerkowa", "почечная лоханка"),
  r("moczowód", "мочеточник"),
  r("pęcherz moczowy", "мочевой пузырь"),
  r("cewka moczowa", "мочеиспускательный канал"),
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Nefron = ciałko nerkowe (kłębuszek + torebka Bowmana) + układ kanalików.", ru: "Нефрон = почечное тельце (клубочек + капсула Боумена) + система канальцев." },
    { pl: "Kłębuszki leżą w korze nerki, pętle nefronów i kanaliki zbiorcze — w rdzeniu.", ru: "Клубочки лежат в корковом веществе, петли нефронов и собирательные трубочки — в мозговом." },
  ],
  s2: [{ pl: "Filtracja → resorpcja zwrotna → sekrecja → zagęszczanie.", ru: "Фильтрация → обратное всасывание → секреция → концентрирование." }],
  s3: [{ pl: "Mocz pierwotny nie zawiera białek ani krwinek; mocz ostateczny zdrowego człowieka nie zawiera też glukozy.", ru: "Первичная моча не содержит белков и клеток крови; во вторичной моче здорового человека нет и глюкозы." }],
  s4: [{ pl: "Wazopresyna (ADH) zwiększa wchłanianie wody w kanaliku zbiorczym — mniej moczu, bardziej stężonego.", ru: "Вазопрессин (АДГ) усиливает всасывание воды в собирательной трубочке — мочи меньше, и она концентрированнее." }],
  s5: [{ pl: "Moczowody prowadzą mocz z nerek do pęcherza, cewka — z pęcherza na zewnątrz.", ru: "Мочеточники ведут мочу из почек в мочевой пузырь, мочеиспускательный канал — из пузыря наружу." }],
};

export default function NephronLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="neph" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="neph-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <NephronMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="neph-s2" n={2} title={T.s2[lang]}>
        <CompareTabs lang={lang} cards={PROCESSES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="neph-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s3}
          question={r("Co dzieje się z tą substancją w nefronie?", "Что происходит с этим веществом в нефроне?")}
          options={FATE}
          items={SUBSTANCES}
          wrongHint={r("Pomyśl o wielkości cząsteczki i o tym, czy organizm jej potrzebuje.", "Подумай о размере молекулы и о том, нужна ли она организму.")}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="neph-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Vasopressin lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="neph-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.s5} start={r("kłębuszek nerkowy", "почечный клубочек")} steps={PATH} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
