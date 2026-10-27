// Lesson for §3.4 "Pajęczaki – stawonogi, które mają cztery pary odnóży" (Puls życia 6). Terms
// follow templates/data/sp6Invertebrates.ts (ARACHNIDS).
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../lang.ts";
import { MatchQuiz, PartMap, TwoWaySort, type MapPart, type QuizItem, type QuizOption, type SortItem } from "@portal/lessons";
import { Choice, KIT, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Pajęczaki to stawonogi o czterech parach odnóży krocznych i bez czułków. Ich ciało dzieli się na głowotułów i odwłok. Należą do nich pająki, kleszcze, skorpiony i maleńkie roztocza. Większość to drapieżniki.",
    "Паукообразные — членистоногие с четырьмя парами ходильных ног и без усиков. Их тело делится на головогрудь и брюшко. К ним относятся пауки, клещи, скорпионы и крошечные пылевые клещи. Большинство — хищники.",
  ),
  s1: r("Jak zbudowany jest pająk", "Как устроен паук"),
  s1intro: r("Pająk krzyżak od góry. Kądziołki przędne są na spodzie odwłoka.", "Паук-крестовик сверху. Паутинные бородавки — на нижней стороне брюшка."),
  s2: r("Polowanie pająka", "Охота паука"),
  s2intro: r("Przejdź krok po kroku przez polowanie krzyżaka.", "Пройди шаг за шагом охоту крестовика."),
  s3: r("Kleszcz — co robić?", "Клещ — что делать?"),
  s3intro: r("Kleszcze przenoszą boreliozę i kleszczowe zapalenie mózgu. Oceń, co pomaga, a co szkodzi.", "Клещи переносят боррелиоз и клещевой энцефалит. Оцени, что помогает, а что вредит."),
  s4: r("Kto to?", "Кто это?"),
  s4intro: r("Rozpoznaj pajęczaka po opisie.", "Узнай паукообразное по описанию."),
  good: r("dobrze", "правильно"),
  bad: r("źle", "неправильно"),
} satisfies Record<string, Txt>;

// ---------- spider map ----------

type SpiderPart = "cephalothorax" | "abdomen" | "legs" | "chelicerae" | "pedipalps" | "eyes" | "spinnerets";

const PARTS: Record<SpiderPart, MapPart> = {
  cephalothorax: { name: r("Głowotułów", "Головогрудь"), text: r("Przednia część ciała: zrośnięte głowa i tułów. Wyrastają z niej odnóża.", "Передний отдел тела: сросшиеся голова и грудь. От него отходят ноги."), pin: [256, 100], to: [182, 110] },
  abdomen: { name: r("Odwłok", "Брюшко"), text: r("Duży, miękki, niepodzielony na segmenty. U krzyżaka ma jasny wzór w kształcie krzyża.", "Большое, мягкое, не разделено на сегменты. У крестовика на нём светлый рисунок в виде креста."), pin: [256, 210], to: [196, 210] },
  legs: { name: r("Cztery pary odnóży", "Четыре пары ног"), text: r("Osiem odnóży krocznych — cecha wszystkich pajęczaków. Owady mają sześć.", "Восемь ходильных ног — признак всех паукообразных. У насекомых шесть."), pin: [30, 240], to: [64, 200] },
  chelicerae: { name: r("Szczękoczułki", "Хелицеры"), text: r("Pierwsza para odnóży gębowych, zakończona pazurkami z jadem. Pająk wstrzykuje nimi jad, który paraliżuje ofiarę.", "Первая пара ротовых конечностей с ядовитыми коготками. Ими паук впрыскивает яд, парализующий добычу."), pin: [150, 20], to: [150, 66] },
  pedipalps: { name: r("Nogogłaszczki", "Педипальпы"), text: r("Druga para odnóży gębowych, krótka. Pająk obmacuje nimi i przytrzymuje pokarm — nie służą do chodzenia.", "Вторая пара ротовых конечностей, короткая. Ими паук ощупывает и удерживает пищу — для ходьбы они не служат."), pin: [234, 40], to: [170, 68] },
  eyes: { name: r("Oczy proste", "Простые глаза"), text: r("Krzyżak ma osiem prostych oczu, ale widzi słabo — o ofierze dowiaduje się z drgań sieci. Pająki nie mają czułków.", "У крестовика восемь простых глаз, но видит он плохо — о добыче узнаёт по дрожанию сети. Усиков у пауков нет."), pin: [66, 40], to: [140, 84] },
  spinnerets: { name: r("Kądziołki przędne", "Паутинные бородавки"), text: r("Na końcu odwłoka. Wydobywa się z nich płynna przędza, która na powietrzu twardnieje w nić — mocniejszą od stalowego drutu tej samej grubości.", "На конце брюшка. Из них выходит жидкий секрет, который на воздухе застывает в нить — прочнее стальной проволоки той же толщины."), pin: [250, 290], to: [156, 268] },
};

const M = "matrix(-1 0 0 1 300 0)";
const both = (node: ReactNode) => (
  <>
    <g>{node}</g>
    <g transform={M}>{node}</g>
  </>
);

function SpiderMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<SpiderPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 300 300"
      title={r("Budowa pająka", "Строение паука")}
      labelOrder={["cephalothorax", "abdomen", "legs", "chelicerae", "pedipalps", "eyes", "spinnerets"]}
      pinRadius={15}
      maxWidth="max-w-[360px]"
      art={({ part, tone }) => (
        <>
          {part(
            "legs",
            both(
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {["M126 92 L 92 62 L 70 20", "M122 104 L 80 90 L 40 80", "M122 118 L 80 128 L 44 150", "M126 128 L 96 160 L 70 210"].map((d) => (
                  <g key={d}>
                    <path d={d} stroke={tone("legs", "#57534e")} strokeWidth={5} />
                    <path d={d} stroke="transparent" strokeWidth={14} />
                  </g>
                ))}
              </g>,
            ),
          )}
          {part(
            "pedipalps",
            both(<path d="M140 78 L 128 62 L 132 50" fill="none" stroke={tone("pedipalps", "#78716c")} strokeWidth={4} strokeLinecap="round" />),
          )}
          {part(
            "abdomen",
            <g>
              <ellipse cx={150} cy={204} rx={48} ry={60} fill={tone("abdomen", "#a16207")} stroke="#44403c" strokeWidth={2} />
              <path d="M150 166 L 150 240 M128 190 L 172 190 M134 214 L 166 214" stroke="#fef3c7" strokeWidth={4} strokeLinecap="round" />
            </g>,
          )}
          {part("spinnerets", <ellipse cx={150} cy={266} rx={8} ry={5} fill={tone("spinnerets", "#57534e")} />)}
          {part("cephalothorax", <ellipse cx={150} cy={110} rx={32} ry={36} fill={tone("cephalothorax", "#78716c")} stroke="#44403c" strokeWidth={2} />)}
          {part(
            "chelicerae",
            both(<path d="M144 76 C 140 68, 140 62, 146 58 L 148 70 Z" fill={tone("chelicerae", "#292524")} stroke="#292524" strokeWidth={2} />),
          )}
          {part(
            "eyes",
            <g>
              {[
                [140, 86], [146, 82], [154, 82], [160, 86], [143, 92], [157, 92], [147, 96], [153, 96],
              ].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} fill={tone("eyes", "#0f172a")} />
              ))}
              <rect x={136} y={78} width={28} height={22} fill="transparent" />
            </g>,
          )}
        </>
      )}
    />
  );
}

// ---------- the hunt ----------

const HUNT: Txt[] = [
  r("Krzyżak tka koło z lepkiej, spiralnej nici rozpiętej na promieniach i czeka z boku, trzymając nić sygnałową.", "Крестовик плетёт колесо из клейкой спиральной нити на радиальных нитях и ждёт сбоку, держась за сигнальную нить."),
  r("Mucha wpada w sieć i przykleja się. Szarpiąc się, wprawia nici w drgania — pająk je wyczuwa.", "Муха попадает в сеть и прилипает. Дёргаясь, она заставляет нити дрожать — паук это чувствует."),
  r("Pająk podbiega i wbija szczękoczułki: jad paraliżuje muchę. Potem owija ją nicią w kokon.", "Паук подбегает и вонзает хелицеры: яд парализует муху. Потом обматывает её нитью в кокон."),
  r("Pająk wstrzykuje do ofiary soki trawienne, które rozpuszczają jej wnętrze — to trawienie pozajelitowe, poza ciałem pająka.", "Паук впрыскивает в добычу пищеварительные соки, которые растворяют её внутренности, — это внекишечное пищеварение, вне тела паука."),
  r("Na koniec wysysa płynną treść. Z muchy zostaje pusty pancerzyk.", "Наконец он высасывает жидкое содержимое. От мухи остаётся пустой хитиновый панцирь."),
];

function Hunt({ lang }: { lang: BioLang }) {
  const [step, setStep] = useState(0);
  const spider = step >= 2 ? [196, 110] : [262, 40];
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 300 220" className="w-full" role="img" aria-label={`${lang === "pl" ? "Krok" : "Шаг"} ${step + 1}`}>
          <rect width={300} height={220} rx={12} fill="#f1f5f9" />
          <g stroke="#94a3b8" fill="none" strokeWidth={1.2}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <path key={i} d={`M150 110 L ${150 + Math.cos(a) * 100} ${110 + Math.sin(a) * 100}`} />;
            })}
            {[16, 30, 44, 58, 72, 86].map((rad) => (
              <circle key={rad} cx={150} cy={110} r={rad} strokeDasharray={step === 1 ? "3 2" : undefined} />
            ))}
            <path d="M262 40 L 150 110" stroke="#64748b" strokeDasharray="4 3" />
          </g>
          <g transform="translate(196 110)">
            {step < 2 ? (
              <g className={step === 1 ? "animate-pulse" : ""}>
                <ellipse rx={8} ry={5} fill="#1c1917" />
                <ellipse cx={-3} cy={-6} rx={6} ry={3.5} fill="#e2e8f0" opacity={0.9} />
              </g>
            ) : step === 2 || step === 3 ? (
              <ellipse rx={11} ry={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={2} />
            ) : (
              <ellipse rx={10} ry={7} fill="none" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="2 2" />
            )}
            {step === 3 && <circle r={4} fill="#facc15" opacity={0.8} />}
          </g>
          <g transform={`translate(${spider[0]! + (step >= 2 ? 16 : 0)} ${spider[1]! - (step >= 2 ? 14 : 0)})`} style={{ transition: "transform .6s" }}>
            <path d="M-6 -2 L -16 -10 M-6 2 L -18 2 M-6 4 L -16 14 M6 -2 L 16 -10 M6 2 L 18 2 M6 4 L 16 14 M-4 -5 L -10 -16 M4 -5 L 10 -16" stroke="#44403c" strokeWidth={2} />
            <ellipse cy={6} rx={8} ry={10} fill="#a16207" />
            <circle cy={-5} r={6} fill="#78716c" />
          </g>
        </svg>
        <div className="mt-3 flex flex-wrap gap-2">
          <Choice onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            ‹ {lang === "pl" ? "Wstecz" : "Назад"}
          </Choice>
          {step < HUNT.length - 1 ? (
            <Choice state="active" onClick={() => setStep(step + 1)}>
              {KIT.next[lang]} ›
            </Choice>
          ) : (
            <Choice onClick={() => setStep(0)}>↺ {KIT.again[lang]}</Choice>
          )}
        </div>
      </div>
      <ol className="space-y-2" aria-live="polite">
        {HUNT.map((s, i) => (
          <li key={i} className={`flex gap-3 text-[15px] leading-relaxed transition-colors ${i === step ? "font-medium text-slate-900" : i < step ? "text-slate-600" : "text-slate-400"}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${i <= step ? "bg-emerald-600" : "bg-slate-300"}`}>{i + 1}</span>
            {s[lang]}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------- ticks and the quiz ----------

const TICK: SortItem[] = [
  { name: r("długie spodnie i jasne ubranie na wycieczkę do lasu", "длинные брюки и светлая одежда в лес"), group: 0, why: r("trudniej się dostać do skóry, łatwiej zauważyć kleszcza", "клещу труднее добраться до кожи, его легче заметить") },
  { name: r("posmarować kleszcza masłem lub tłuszczem", "намазать клеща маслом или жиром"), group: 1, why: r("kleszcz może wtedy wstrzyknąć więcej bakterii", "клещ может впрыснуть больше бактерий") },
  { name: r("obejrzeć całe ciało po powrocie z lasu", "осмотреть всё тело после леса"), group: 0, why: r("im szybciej usuniesz kleszcza, tym mniejsze ryzyko", "чем быстрее удалить клеща, тем меньше риск") },
  { name: r("odczekać kilka dni, aż sam odpadnie", "подождать несколько дней, пока сам отпадёт"), group: 1, why: r("im dłużej ssie krew, tym większe ryzyko boreliozy", "чем дольше он сосёт кровь, тем выше риск боррелиоза") },
  { name: r("chwycić pęsetą tuż przy skórze i wyciągnąć", "захватить пинцетом у самой кожи и вытащить"), group: 0, why: r("tak usuwa się kleszcza w całości", "так клеща удаляют целиком") },
  { name: r("zgnieść kleszcza palcami na skórze", "раздавить клеща пальцами на коже"), group: 1, why: r("zawartość kleszcza może dostać się do rany", "содержимое клеща может попасть в ранку") },
  { name: r("pójść do lekarza, gdy wokół ukłucia pojawi się czerwony, powiększający się rumień", "пойти к врачу, если вокруг укуса появилось растущее красное пятно"), group: 0, why: r("to typowy objaw boreliozy — leczy się ją antybiotykiem", "это типичный признак боррелиоза — его лечат антибиотиком") },
  { name: r("chodzić boso po wysokiej trawie w krótkich spodenkach", "ходить босиком по высокой траве в шортах"), group: 1, why: r("kleszcze czekają właśnie na trawach i krzakach", "клещи поджидают именно на траве и кустах") },
];

const SPECIES: QuizOption[] = [
  { id: "spider", label: r("pająk krzyżak", "паук-крестовик") },
  { id: "tick", label: r("kleszcz", "клещ") },
  { id: "scorpion", label: r("skorpion", "скорпион") },
  { id: "mites", label: r("roztocza kurzu", "пылевые клещи") },
];

const ITEMS: QuizItem[] = [
  { icon: "🕸", name: r("buduje koliste sieci łowne w ogrodzie", "строит круглые ловчие сети в саду"), answer: "spider", explain: r("Krzyżak — z jasnym krzyżem na odwłoku.", "Крестовик — со светлым крестом на брюшке.") },
  { icon: "🩸", name: r("czatuje na trawie i wysysa krew, przenosi boreliozę", "поджидает на траве и сосёт кровь, переносит боррелиоз"), answer: "tick", explain: r("Kleszcz pospolity — pasożyt zewnętrzny.", "Лесной клещ — наружный паразит.") },
  { icon: "🏜", name: r("żyje w ciepłych krajach, ma jadowy kolec na końcu odwłoka", "живёт в жарких странах, на конце брюшка ядовитое жало"), answer: "scorpion", explain: r("Skorpion chwyta ofiarę szczypcami (nogogłaszczkami).", "Скорпион хватает добычу клешнями (педипальпами).") },
  { icon: "🤧", name: r("mikroskopijne, żyją w kurzu i pościeli, wywołują alergie", "микроскопические, живут в пыли и постели, вызывают аллергию"), answer: "mites", explain: r("Roztocza widać dopiero pod mikroskopem.", "Пылевых клещей видно только под микроскопом.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Pajęczaki: głowotułów i odwłok, 4 pary odnóży krocznych, brak czułków.", ru: "Паукообразные: головогрудь и брюшко, 4 пары ходильных ног, усиков нет." },
    { pl: "Pająk ma szczękoczułki z jadem i kądziołki przędne.", ru: "У паука есть хелицеры с ядом и паутинные бородавки." },
  ],
  s2: [{ pl: "Trawienie pozajelitowe: pająk rozpuszcza ofiarę sokami trawiennymi i wysysa ją.", ru: "Внекишечное пищеварение: паук растворяет добычу пищеварительными соками и высасывает её." }],
  s3: [{ pl: "Kleszcza trzeba szybko usunąć w całości; borelioza objawia się często rumieniem wędrującym.", ru: "Клеща нужно быстро удалить целиком; боррелиоз часто проявляется растущим красным пятном." }],
  s4: [{ pl: "Pajęczaki to pająki, kleszcze, skorpiony i roztocza.", ru: "Паукообразные — это пауки, клещи, скорпионы и мелкие клещи." }],
};

export default function ArachnidsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="arachnids" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="arachnids-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <SpiderMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="arachnids-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Hunt lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="arachnids-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={r("🌲 Po spacerze w lesie", "🌲 После прогулки в лесу")} groups={[T.good, T.bad]} items={TICK} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="arachnids-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={r("🕷 Kto to?", "🕷 Кто это?")} question={r("Kto", "Кто")} options={SPECIES} items={ITEMS} wrongHint={r("to inny pajęczak.", "это другое паукообразное.")} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
