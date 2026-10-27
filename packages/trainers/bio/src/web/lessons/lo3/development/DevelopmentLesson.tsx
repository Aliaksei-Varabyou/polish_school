// Lesson for LO3 §11.4 "Rozwój człowieka. Metody antykoncepcji" (zakres rozszerzony). Terms follow
// templates/data/systemsMore.ts (DEVELOPMENT_STAGES) and systems.ts (REPRODUCTION_PARTS: zygota,
// łożysko, ektoderma, mezoderma, endoderma). Weeks of development are counted from fertilization,
// as in DEVELOPMENT_STAGES.
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, OrderGame, PartMap, type CompareCard, type MapPart, type QuizItem, type QuizOption } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Rozwój człowieka zaczyna się od zapłodnienia w jajowodzie. Przez pierwsze 8 tygodni zarodek tworzy zawiązki wszystkich narządów, a potem — już jako płód — rośnie i dojrzewa aż do porodu. Przez cały ten czas łączy go z matką łożysko.",
    "Развитие человека начинается с оплодотворения в маточной трубе. За первые 8 недель зародыш формирует зачатки всех органов, а затем — уже как плод — растёт и созревает до самых родов. Всё это время его связывает с матерью плацента.",
  ),
  s1: r("Od zapłodnienia do porodu", "От оплодотворения до родов"),
  s1intro: r(
    "Ułóż etapy rozwoju we właściwej kolejności. Zygota dzieli się już w drodze przez jajowód, a do macicy dociera po kilku dniach jako blastocysta.",
    "Расположи этапы развития в правильном порядке. Зигота делится уже на пути по маточной трубе, а в матку попадает через несколько дней в виде бластоцисты.",
  ),
  s2: r("Listki zarodkowe", "Зародышевые листки"),
  s2intro: r(
    "W czasie gastrulacji powstają trzy listki zarodkowe. Każdy daje początek innym tkankom i narządom.",
    "Во время гаструляции образуются три зародышевых листка. Каждый даёт начало другим тканям и органам.",
  ),
  s3: r("Łożysko i błony płodowe", "Плацента и зародышевые оболочки"),
  s3intro: r("Schemat płodu w macicy. Dotknij części rysunku.", "Схема плода в матке. Нажимай на части рисунка."),
  s4: r("Rozwój w czasie ciąży", "Развитие во время беременности"),
  s4intro: r(
    "Przesuń suwak — tygodnie są liczone od zapłodnienia. Lekarze liczą czas ciąży od pierwszego dnia ostatniej miesiączki, dlatego według nich trwa ona ok. 40 tygodni, a od zapłodnienia — ok. 38.",
    "Сдвигай ползунок — недели отсчитываются от оплодотворения. Врачи считают срок беременности от первого дня последней менструации, поэтому по их счёту она длится около 40 недель, а от оплодотворения — около 38.",
  ),
  s5: r("Metody antykoncepcji", "Методы контрацепции"),
  s5intro: r(
    "Skuteczność metody opisuje wskaźnik Pearla — liczba ciąż na 100 kobiet stosujących ją przez rok. Im niższy wskaźnik, tym metoda skuteczniejsza. Metodę hormonalną lub wewnątrzmaciczną dobiera zawsze lekarz.",
    "Эффективность метода описывает индекс Перля — число беременностей на 100 женщин, использующих его в течение года. Чем ниже индекс, тем метод эффективнее. Гормональный или внутриматочный метод всегда подбирает врач.",
  ),
} satisfies Record<string, Txt>;

// ---------- early development ----------

const STEPS: Txt[] = [
  r("zapłodnienie", "оплодотворение"),
  r("zygota", "зигота"),
  r("bruzdkowanie", "дробление"),
  r("morula", "морула"),
  r("blastocysta", "бластоциста"),
  r("implantacja", "имплантация"),
  r("gastrulacja", "гаструляция"),
  r("organogeneza", "органогенез"),
  r("okres płodowy", "плодный период"),
  r("poród", "роды"),
];

// ---------- germ layers ----------

const LAYERS: QuizOption[] = [
  { id: "ecto", label: r("ektoderma", "эктодерма"), art: <LayerDot color="#60a5fa" /> },
  { id: "meso", label: r("mezoderma", "мезодерма"), art: <LayerDot color="#f87171" /> },
  { id: "endo", label: r("endoderma", "энтодерма"), art: <LayerDot color="#facc15" /> },
];

function LayerDot({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 30" className="mx-auto h-8 w-16" aria-hidden>
      <rect x={4} y={6} width={52} height={18} rx={9} fill={color} />
    </svg>
  );
}

const ORGANS: QuizItem[] = [
  { icon: "🧴", name: r("naskórek", "эпидермис"), answer: "ecto", explain: r("Zewnętrzny listek daje zewnętrzną warstwę skóry — naskórek, a także włosy i paznokcie.", "Наружный листок даёт наружный слой кожи — эпидермис, а также волосы и ногти.") },
  { icon: "🧠", name: r("mózgowie i rdzeń kręgowy", "головной и спинной мозг"), answer: "ecto", explain: r("Cały układ nerwowy powstaje z ektodermy — najpierw tworzy się z niej cewa nerwowa.", "Вся нервная система возникает из эктодермы — сначала из неё образуется нервная трубка.") },
  { icon: "💪", name: r("mięśnie szkieletowe", "скелетные мышцы"), answer: "meso", explain: r("Mięśnie, podobnie jak kości, powstają ze środkowego listka.", "Мышцы, как и кости, развиваются из среднего листка.") },
  { icon: "🫁", name: r("nabłonek płuc", "эпителий лёгких"), answer: "endo", explain: r("Płuca powstają jako uwypuklenie przedniego odcinka jelita pierwotnego, więc ich nabłonek pochodzi z endodermy.", "Лёгкие возникают как выпячивание переднего отдела первичной кишки, поэтому их эпителий происходит из энтодермы.") },
  { icon: "🦴", name: r("kości i chrząstki", "кости и хрящи"), answer: "meso", explain: r("Tkanki łączne szkieletu pochodzą z mezodermy.", "Соединительные ткани скелета происходят из мезодермы.") },
  { icon: "👁️", name: r("soczewka oka", "хрусталик глаза"), answer: "ecto", explain: r("Soczewka powstaje z ektodermy pokrywającej zawiązek oka.", "Хрусталик развивается из эктодермы, покрывающей зачаток глаза.") },
  { icon: "🫀", name: r("serce i naczynia krwionośne", "сердце и кровеносные сосуды"), answer: "meso", explain: r("Cały układ krwionośny, razem z krwią, pochodzi z mezodermy.", "Вся кровеносная система вместе с кровью происходит из мезодермы.") },
  { icon: "🟤", name: r("wątroba", "печень"), answer: "endo", explain: r("Wątroba i trzustka wyrastają z jelita pierwotnego wysłanego endodermą.", "Печень и поджелудочная железа вырастают из первичной кишки, выстланной энтодермой.") },
  { icon: "🦷", name: r("szkliwo zębów", "эмаль зубов"), answer: "ecto", explain: r("Szkliwo wytwarzają komórki pochodzenia ektodermalnego.", "Эмаль образуют клетки эктодермального происхождения.") },
  { icon: "🩸", name: r("krew", "кровь"), answer: "meso", explain: r("Krew to tkanka łączna — pochodzi z mezodermy.", "Кровь — соединительная ткань, она происходит из мезодермы.") },
  { icon: "🫘", name: r("nerki", "почки"), answer: "meso", explain: r("Nerki i gonady rozwijają się z mezodermy.", "Почки и половые железы развиваются из мезодермы.") },
  { icon: "🍽️", name: r("nabłonek jelita", "эпителий кишечника"), answer: "endo", explain: r("Endoderma wyściela cały przewód pokarmowy od środka.", "Энтодерма выстилает изнутри весь пищеварительный тракт.") },
  { icon: "🧵", name: r("skóra właściwa", "дерма (собственно кожа)"), answer: "meso", explain: r("Uwaga: naskórek pochodzi z ektodermy, ale leżąca pod nim skóra właściwa — z mezodermy.", "Внимание: эпидермис происходит из эктодермы, а лежащая под ним дерма — из мезодермы.") },
];

// ---------- placenta map ----------

type PPart = "wall" | "placenta" | "cord" | "chorion" | "amnion" | "fluid" | "fetus";

const PLACENTA: Record<PPart, MapPart> = {
  wall: {
    name: r("Ściana macicy", "Стенка матки"),
    text: r("Jej błona śluzowa tworzy matczyną część łożyska, a gruba błona mięśniowa rozciąga się wraz z rosnącym płodem.", "Её слизистая оболочка образует материнскую часть плаценты, а толстая мышечная оболочка растягивается вместе с растущим плодом."),
    pin: [30, 40],
    to: [68, 70],
  },
  placenta: {
    name: r("Łożysko", "Плацента"),
    text: r(
      "Powstaje z kosmówki i błony śluzowej macicy. Z krwi matki przechodzą do krwi płodu tlen, glukoza, aminokwasy i przeciwciała, a w przeciwną stronę — CO₂ i mocznik; krew matki i płodu nie miesza się. Łożysko wydziela też hormony (hCG, progesteron, estrogeny). Przenikają przez nie niestety także alkohol, nikotyna, niektóre leki i wirusy.",
      "Образуется из хориона и слизистой оболочки матки. Из крови матери в кровь плода переходят кислород, глюкоза, аминокислоты и антитела, а в обратную сторону — CO₂ и мочевина; кровь матери и плода не смешивается. Плацента выделяет и гормоны (ХГЧ, прогестерон, эстрогены). К сожалению, через неё проникают также алкоголь, никотин, некоторые лекарства и вирусы.",
    ),
    pin: [330, 30],
    to: [266, 65],
  },
  cord: {
    name: r("Pępowina", "Пуповина"),
    text: r(
      "Sznur łączący płód z łożyskiem. Biegną w nim dwie tętnice pępowinowe, które prowadzą krew od płodu do łożyska, i jedna żyła pępowinowa, która przynosi krew utlenowaną do płodu.",
      "Тяж, соединяющий плод с плацентой. В нём проходят две пупочные артерии, несущие кровь от плода к плаценте, и одна пупочная вена, приносящая к плоду насыщенную кислородом кровь.",
    ),
    pin: [340, 150],
    to: [242, 132],
  },
  chorion: {
    name: r("Kosmówka", "Хорион"),
    text: r("Zewnętrzna błona płodowa. Jej kosmki wrastają w błonę śluzową macicy i tworzą płodową część łożyska. Od początku ciąży wydziela hCG.", "Наружная зародышевая оболочка. Её ворсинки врастают в слизистую оболочку матки и образуют плодную часть плаценты. С начала беременности выделяет ХГЧ."),
    pin: [20, 186],
    to: [49, 160],
  },
  amnion: {
    name: r("Owodnia", "Амнион"),
    text: r("Wewnętrzna błona płodowa tworząca pęcherz płodowy wypełniony płynem owodniowym.", "Внутренняя зародышевая оболочка, образующая плодный пузырь с околоплодной жидкостью."),
    pin: [40, 262],
    to: [85, 206],
  },
  fluid: {
    name: r("Płyn owodniowy", "Околоплодные воды"),
    text: r("Chroni płód przed wstrząsami, uciskiem i wysychaniem, utrzymuje stałą temperaturę i pozwala mu swobodnie się poruszać.", "Защищают плод от толчков, сдавливания и высыхания, поддерживают постоянную температуру и позволяют ему свободно двигаться."),
    pin: [312, 254],
    to: [252, 206],
  },
  fetus: {
    name: r("Płód", "Плод"),
    text: r("Od 9. tygodnia rozwoju zarodek nazywamy płodem. Jego płuca jeszcze nie pracują — tlen otrzymuje z krwi matki przez łożysko.", "С 9-й недели развития зародыш называют плодом. Его лёгкие ещё не работают — кислород он получает из крови матери через плаценту."),
    pin: [150, 268],
    to: [168, 206],
  },
};

function Fetus({ fill }: { fill: string }) {
  return (
    <g fill={fill} stroke="#9a3412" strokeWidth={1.5}>
      <ellipse cx={176} cy={176} rx={30} ry={38} transform="rotate(-30 176 176)" />
      <ellipse cx={168} cy={202} rx={26} ry={10} transform="rotate(-8 168 202)" />
      <ellipse cx={150} cy={204} rx={9} ry={6} />
      <circle cx={140} cy={124} r={27} />
      <ellipse cx={158} cy={166} rx={16} ry={6} transform="rotate(35 158 166)" />
    </g>
  );
}

// short strokes across the placenta: the chorionic villi reaching into the uterine lining
const VILLI = [-95, -82, -69, -56, -43, -30]
  .map((deg) => {
    const a = (deg * Math.PI) / 180;
    const at = (k: number) => `${(180 + 134 * k * Math.cos(a)).toFixed(1)} ${(145 + 104 * k * Math.sin(a)).toFixed(1)}`;
    return `M${at(0.94)} L ${at(1.05)}`;
  })
  .join(" ");

function PlacentaMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<PPart>
      lang={lang}
      parts={PLACENTA}
      viewBox="0 0 360 280"
      title={r("Płód w macicy", "Плод в матке")}
      labelOrder={["wall", "placenta", "cord", "chorion", "amnion", "fluid", "fetus"]}
      pinRadius={13}
      art={({ part, tone }) => (
        <>
          {part("wall", <ellipse cx={180} cy={145} rx={146} ry={116} fill="none" stroke={tone("wall", "#f9a8d4")} strokeWidth={18} />)}
          {part("chorion", <ellipse cx={180} cy={145} rx={132} ry={102} fill="#fdf2f8" stroke={tone("chorion", "#a78bfa")} strokeWidth={8} />)}
          {part("amnion", <ellipse cx={180} cy={145} rx={124} ry={95} fill="none" stroke={tone("amnion", "#0ea5e9")} strokeWidth={4} />)}
          {part("fluid", <ellipse cx={180} cy={145} rx={122} ry={93} fill={tone("fluid", "#e0f2fe")} />)}
          {part(
            "placenta",
            <g>
              <path d="M157 43 A 134 104 0 0 1 306 109" fill="none" stroke={tone("placenta", "#be123c")} strokeWidth={22} />
              <path d={VILLI} stroke="#fda4af" strokeWidth={2} />
            </g>,
          )}
          {part(
            "cord",
            <path d="M250 68 C 282 98, 222 108, 242 134 S 214 164, 196 170" fill="none" stroke={tone("cord", "#c4b5fd")} strokeWidth={8} strokeLinecap="round" />,
          )}
          {part("fetus", <Fetus fill={tone("fetus", "#fed7aa")} />)}
        </>
      )}
    />
  );
}

// ---------- pregnancy timeline ----------

interface Milestone {
  from: number;
  to: number;
  title: Txt;
  text: Txt;
}

const MILESTONES: Milestone[] = [
  {
    from: 1,
    to: 1,
    title: r("Bruzdkowanie i zagnieżdżenie", "Дробление и имплантация"),
    text: r(
      "Zygota dzieli się w jajowodzie: morula, potem blastocysta. Ok. 6.–7. dnia blastocysta zaczyna zagnieżdżać się w błonie śluzowej macicy.",
      "Зигота делится в маточной трубе: морула, затем бластоциста. Примерно на 6–7-й день бластоциста начинает внедряться в слизистую оболочку матки.",
    ),
  },
  {
    from: 2,
    to: 2,
    title: r("Błony płodowe", "Зародышевые оболочки"),
    text: r(
      "Zarodek jest zagnieżdżony; powstają błony płodowe. Kosmówka wydziela hCG — ten hormon wykrywa test ciążowy, a jego działanie podtrzymuje ciałko żółte.",
      "Зародыш внедрился; образуются зародышевые оболочки. Хорион выделяет ХГЧ — этот гормон обнаруживает тест на беременность, а его действие поддерживает жёлтое тело.",
    ),
  },
  {
    from: 3,
    to: 3,
    title: r("Gastrulacja", "Гаструляция"),
    text: r("Powstają trzy listki zarodkowe; z ektodermy zaczyna się tworzyć cewa nerwowa.", "Образуются три зародышевых листка; из эктодермы начинает формироваться нервная трубка."),
  },
  {
    from: 4,
    to: 4,
    title: r("Pierwsze skurcze serca", "Первые сокращения сердца"),
    text: r("Serce zaczyna się kurczyć, pojawiają się zawiązki kończyn. Zarodek ma ok. 4–5 mm.", "Сердце начинает сокращаться, появляются зачатки конечностей. Зародыш длиной около 4–5 мм."),
  },
  {
    from: 5,
    to: 8,
    title: r("Organogeneza", "Органогенез"),
    text: r(
      "Powstają zawiązki wszystkich narządów. To okres największej wrażliwości na czynniki szkodliwe: alkohol, nikotynę, niektóre leki, promieniowanie, wirusa różyczki. Pod koniec 8. tygodnia zarodek ma ok. 3 cm.",
      "Образуются зачатки всех органов. Это период наибольшей чувствительности к вредным факторам: алкоголю, никотину, некоторым лекарствам, излучению, вирусу краснухи. К концу 8-й недели зародыш около 3 см.",
    ),
  },
  {
    from: 9,
    to: 12,
    title: r("Początek okresu płodowego", "Начало плодного периода"),
    text: r(
      "Zarodek staje się płodem. Narządy rosną i dojrzewają, kształtują się zewnętrzne narządy płciowe. Płód się porusza, choć matka jeszcze tego nie czuje.",
      "Зародыш становится плодом. Органы растут и созревают, формируются наружные половые органы. Плод двигается, хотя мать этого ещё не ощущает.",
    ),
  },
  {
    from: 13,
    to: 24,
    title: r("Szybki wzrost", "Быстрый рост"),
    text: r("Płód szybko rośnie. W połowie ciąży matka zaczyna odczuwać jego ruchy; rozwijają się zmysły, np. słuch.", "Плод быстро растёт. В середине беременности мать начинает ощущать его движения; развиваются органы чувств, например слух."),
  },
  {
    from: 25,
    to: 36,
    title: r("Dojrzewanie", "Созревание"),
    text: r(
      "Płód przybiera na masie i gromadzi tkankę tłuszczową. Dojrzewają płuca — zaczynają wytwarzać surfaktant, bez którego pęcherzyki płucne zapadałyby się po urodzeniu.",
      "Плод набирает массу и накапливает жировую ткань. Созревают лёгкие — начинают вырабатывать сурфактант, без которого альвеолы спадались бы после рождения.",
    ),
  },
  {
    from: 37,
    to: 38,
    title: r("Gotowy do porodu", "Готов к рождению"),
    text: r(
      "Płód jest donoszony: ma ok. 50 cm i ok. 3–3,5 kg. Poród zaczyna się od skurczów macicy, które nasila oksytocyna.",
      "Плод доношен: около 50 см и около 3–3,5 кг. Роды начинаются со схваток — сокращений матки, которые усиливает окситоцин.",
    ),
  },
];

function Pregnancy({ lang }: { lang: BioLang }) {
  const [week, setWeek] = useState(4);
  const m = MILESTONES.find((x) => week >= x.from && week <= x.to)!;
  const embryo = week <= 8;
  // schematic growth only: the sac and the fetus are not drawn to scale
  const sac = 12 + (week / 38) * 48;
  const s = sac / 75;
  const xw = (w: number) => 12 + ((w - 0.5) / 38) * 276;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <svg viewBox="0 0 200 180" className="mx-auto w-full max-w-[300px]" role="img" aria-label={m.title[lang]}>
        <ellipse cx={100} cy={86} rx={sac + 14} ry={(sac + 14) * 0.95} fill="none" stroke="#f9a8d4" strokeWidth={10} style={{ transition: "all .3s" }} />
        <ellipse cx={100} cy={86} rx={sac} ry={sac * 0.95} fill="#e0f2fe" stroke="#0ea5e9" strokeWidth={2} style={{ transition: "all .3s" }} />
        {week >= 3 && <path d={`M${100 - sac * 0.5} ${86 - sac * 0.82} A ${sac} ${sac * 0.95} 0 0 1 ${100 + sac * 0.85} ${86 - sac * 0.5}`} stroke="#be123c" strokeWidth={Math.max(3, sac * 0.16)} fill="none" />}
        {week <= 2 ? (
          <g>
            <circle cx={100} cy={86} r={7} fill="#fde68a" stroke="#b45309" />
            <circle cx={97} cy={83} r={2.5} fill="#b45309" />
          </g>
        ) : (
          <g transform={`translate(100 86) scale(${s}) translate(-170 -155)`} style={{ transition: "transform .3s" }}>
            <path d="M207 97 C 228 114, 202 134, 216 150 S 206 168, 196 170" fill="none" stroke="#c4b5fd" strokeWidth={8} strokeLinecap="round" />
            <Fetus fill="#fed7aa" />
          </g>
        )}
        <text x={100} y={176} textAnchor="middle" fontSize={10} fill="#64748b">
          {lang === "pl" ? "schemat — nie w skali" : "схема — не в масштабе"}
        </text>
      </svg>
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Tydzień rozwoju (od zapłodnienia)" : "Неделя развития (от оплодотворения)"}: <span className="tabular-nums">{week}</span>
          <input
            type="range"
            min={1}
            max={38}
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-rose-600"
            aria-valuetext={`${week}: ${m.title[lang]}`}
          />
        </label>
        <svg viewBox="0 0 300 30" className="w-full" aria-hidden>
          <rect x={xw(1)} y={4} width={xw(8.5) - xw(1)} height={12} fill="#fecdd3" />
          <rect x={xw(8.5)} y={4} width={xw(38.5) - xw(8.5)} height={12} fill="#bae6fd" />
          <text x={xw(1) + 2} y={27} fontSize={9} fill="#9f1239">
            {lang === "pl" ? "zarodek" : "зародыш"}
          </text>
          <text x={xw(9) + 4} y={27} fontSize={9} fill="#075985">
            {lang === "pl" ? "płód" : "плод"}
          </text>
          <path d={`M${xw(week + 0.5)} 1 L ${xw(week + 0.5)} 19`} stroke="#0f172a" strokeWidth={2} />
        </svg>
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <div className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
            {embryo ? (lang === "pl" ? "okres zarodkowy" : "зародышевый период") : lang === "pl" ? "okres płodowy" : "плодный период"} ·{" "}
            {m.from === m.to ? `${lang === "pl" ? "tydz." : "нед."} ${m.from}` : `${lang === "pl" ? "tyg." : "нед."} ${m.from}–${m.to}`}
          </div>
          <h3 className="mt-1 text-base font-semibold text-emerald-900">{m.title[lang]}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{m.text[lang]}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- contraception ----------

function Meter({ level, sti, lang }: { level: 1 | 2 | 3; sti: boolean; lang: BioLang }) {
  return (
    <svg viewBox="0 0 200 110" className="w-full" role="img" aria-label={`${lang === "pl" ? "skuteczność" : "эффективность"} ${level}/3`}>
      <text x={10} y={20} fontSize={11} fill="#334155" fontWeight={600}>
        {lang === "pl" ? "Skuteczność" : "Эффективность"}
      </text>
      {[0, 1, 2].map((k) => (
        <rect key={k} x={10 + k * 62} y={28} width={56} height={16} rx={5} fill={k < level ? ["#fbbf24", "#34d399", "#059669"][level - 1] : "#e2e8f0"} />
      ))}
      <text x={10} y={76} fontSize={11} fill="#334155" fontWeight={600}>
        {lang === "pl" ? "Ochrona przed zakażeniami" : "Защита от инфекций"}
      </text>
      <circle cx={22} cy={94} r={10} fill={sti ? "#059669" : "#e11d48"} />
      <text x={22} y={98} textAnchor="middle" fontSize={12} fill="white" fontWeight={700}>
        {sti ? "✓" : "✗"}
      </text>
      <text x={40} y={98} fontSize={11} fill="#334155">
        {sti ? (lang === "pl" ? "tak" : "да") : lang === "pl" ? "nie" : "нет"}
      </text>
    </svg>
  );
}

const C = {
  how: r("Na czym polega", "В чём суть"),
  examples: r("Przykłady", "Примеры"),
  eff: r("Skuteczność", "Эффективность"),
  sti: r("Chroni przed chorobami przenoszonymi drogą płciową", "Защищает от болезней, передающихся половым путём"),
};

function contraception(lang: BioLang): CompareCard[] {
  return [
    {
      id: "natural",
      icon: "🌡️",
      name: r("Naturalne", "Естественные"),
      art: <Meter level={1} sti={false} lang={lang} />,
      rows: [
        { label: C.how, value: r("rozpoznawanie dni płodnych na podstawie objawów cyklu i unikanie w tym czasie współżycia", "определение фертильных дней по признакам цикла и отказ в это время от половых контактов") },
        { label: C.examples, value: r("metoda termiczna (po owulacji temperatura ciała rośnie o ok. 0,2–0,5 °C pod wpływem progesteronu), obserwacja śluzu szyjkowego, metoda objawowo-termiczna, kalendarzyk", "температурный метод (после овуляции температура тела повышается примерно на 0,2–0,5 °C под действием прогестерона), наблюдение за шеечной слизью, симптотермальный метод, календарный метод") },
        { label: C.eff, value: r("niższa — zależy od regularności cyklu i staranności obserwacji; najmniej pewny jest kalendarzyk", "ниже — зависит от регулярности цикла и тщательности наблюдений; наименее надёжен календарный метод") },
        { label: C.sti, value: r("nie", "нет") },
      ],
      text: r("Nie wymagają środków chemicznych, ale wymagają wiedzy, systematyczności i regularnych cykli.", "Не требуют химических средств, но требуют знаний, систематичности и регулярного цикла."),
    },
    {
      id: "barrier",
      icon: "🛡️",
      name: r("Mechaniczne", "Барьерные"),
      art: <Meter level={2} sti lang={lang} />,
      rows: [
        { label: C.how, value: r("fizyczna bariera nie pozwala plemnikom dotrzeć do komórki jajowej", "физический барьер не даёт сперматозоидам добраться до яйцеклетки") },
        { label: C.examples, value: r("prezerwatywa", "презерватив") },
        { label: C.eff, value: r("dość wysoka, jeśli jest stosowana prawidłowo i za każdym razem", "довольно высокая, если использовать правильно и каждый раз") },
        { label: C.sti, value: r("tak — prezerwatywa znacznie zmniejsza ryzyko zakażenia HIV i innymi chorobami przenoszonymi drogą płciową", "да — презерватив значительно снижает риск заражения ВИЧ и другими болезнями, передающимися половым путём") },
      ],
      text: r("To jedyna metoda antykoncepcji, która jednocześnie chroni przed zakażeniami.", "Это единственный метод контрацепции, который одновременно защищает от инфекций."),
    },
    {
      id: "hormonal",
      icon: "💊",
      name: r("Hormonalne", "Гормональные"),
      art: <Meter level={3} sti={false} lang={lang} />,
      rows: [
        { label: C.how, value: r("syntetyczne hormony (estrogeny i progestageny) hamują wydzielanie FSH i LH, więc nie dochodzi do owulacji; zagęszczają też śluz szyjkowy", "синтетические гормоны (эстрогены и прогестагены) подавляют выделение ФСГ и ЛГ, поэтому овуляция не происходит; они также сгущают шеечную слизь") },
        { label: C.examples, value: r("tabletki, plastry, pierścień dopochwowy, implant, zastrzyki", "таблетки, пластыри, влагалищное кольцо, имплант, инъекции") },
        { label: C.eff, value: r("bardzo wysoka przy regularnym stosowaniu (niski wskaźnik Pearla)", "очень высокая при регулярном применении (низкий индекс Перля)") },
        { label: C.sti, value: r("nie", "нет") },
      ],
      text: r("Wymagają recepty i kontroli lekarskiej, bo mogą mieć działania niepożądane.", "Требуют рецепта и врачебного контроля, так как могут иметь побочные эффекты."),
    },
    {
      id: "iud",
      icon: "🩺",
      name: r("Wewnątrzmaciczne", "Внутриматочные"),
      art: <Meter level={3} sti={false} lang={lang} />,
      rows: [
        { label: C.how, value: r("wkładka umieszczona przez lekarza w macicy utrudnia zapłodnienie i zagnieżdżenie zarodka", "спираль, введённая врачом в матку, препятствует оплодотворению и имплантации зародыша") },
        { label: C.examples, value: r("wkładka z miedzią lub uwalniająca hormon (progestagen)", "спираль с медью или выделяющая гормон (прогестаген)") },
        { label: C.eff, value: r("bardzo wysoka", "очень высокая") },
        { label: C.sti, value: r("nie", "нет") },
      ],
    },
  ];
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Zapłodnienie zachodzi w jajowodzie; implantacja blastocysty — ok. tydzień później.", ru: "Оплодотворение происходит в маточной трубе; имплантация бластоцисты — примерно через неделю." },
    { pl: "Okres zarodkowy trwa do końca 8. tygodnia (organogeneza), potem zaczyna się okres płodowy.", ru: "Зародышевый период длится до конца 8-й недели (органогенез), затем начинается плодный период." },
  ],
  s2: [
    { pl: "Ektoderma → naskórek i układ nerwowy; mezoderma → mięśnie, kości, krew, serce, nerki; endoderma → nabłonek przewodu pokarmowego i płuc, wątroba.", ru: "Эктодерма → эпидермис и нервная система; мезодерма → мышцы, кости, кровь, сердце, почки; энтодерма → эпителий пищеварительного тракта и лёгких, печень." },
  ],
  s3: [
    { pl: "Łożysko umożliwia wymianę gazów i substancji między krwią matki a krwią płodu, bez ich mieszania.", ru: "Плацента обеспечивает обмен газов и веществ между кровью матери и плода, без их смешивания." },
    { pl: "Owodnia z płynem owodniowym chroni płód, a kosmki kosmówki tworzą płodową część łożyska.", ru: "Амнион с околоплодными водами защищает плод, а ворсинки хориона образуют плодную часть плаценты." },
  ],
  s4: [
    { pl: "Najwrażliwszy na alkohol, leki i infekcje jest zarodek w czasie organogenezy.", ru: "Наиболее чувствителен к алкоголю, лекарствам и инфекциям зародыш в период органогенеза." },
    { pl: "Poród wywołują skurcze macicy, które nasila oksytocyna (dodatnie sprzężenie zwrotne).", ru: "Роды вызывают сокращения матки, которые усиливает окситоцин (положительная обратная связь)." },
  ],
  s5: [
    { pl: "Im niższy wskaźnik Pearla, tym skuteczniejsza metoda antykoncepcji.", ru: "Чем ниже индекс Перля, тем эффективнее метод контрацепции." },
    { pl: "Przed chorobami przenoszonymi drogą płciową chroni tylko prezerwatywa.", ru: "От болезней, передающихся половым путём, защищает только презерватив." },
  ],
};

export default function DevelopmentLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="devel" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="devel-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <OrderGame lang={lang} title={r("Etapy rozwoju człowieka", "Этапы развития человека")} start={r("owulacja", "овуляция")} steps={STEPS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="devel-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={r("Z którego listka?", "Из какого листка?")}
          question={r("Z którego listka zarodkowego powstaje", "Из какого зародышевого листка развивается")}
          options={LAYERS}
          items={ORGANS}
          wrongHint={r("Ektoderma — to, co na zewnątrz i nerwy; endoderma — wyściółka „rury” pokarmowej; mezoderma — wszystko pomiędzy.", "Эктодерма — наружные покровы и нервы; энтодерма — выстилка пищеварительной «трубки»; мезодерма — всё, что между ними.")}
        />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="devel-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <PlacentaMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="devel-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Pregnancy lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="devel-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={contraception(lang)} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
