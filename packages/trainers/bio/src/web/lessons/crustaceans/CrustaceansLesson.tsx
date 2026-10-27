// Lesson for §3.2 "Skorupiaki – stawonogi, które mają twardy pancerz" (Puls życia 6). Terms follow
// templates/data/sp6Invertebrates.ts (CRUSTACEANS).
import type { ReactNode } from "react";
import type { BioLang } from "../../../lang.ts";
import { MatchQuiz, PartMap, TwoWaySort, type MapPart, type QuizItem, type QuizOption, type SortItem } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Skorupiaki to stawonogi, które żyją głównie w wodzie i oddychają skrzelami. Ich pancerz jest wyjątkowo twardy, bo wzmacniają go sole wapnia. Należą do nich raki, kraby, krewetki, ale też drobne rozwielitki i lądowe prosionki.",
    "Ракообразные — членистоногие, которые живут в основном в воде и дышат жабрами. Их панцирь особенно твёрдый, потому что пропитан солями кальция. К ним относятся раки, крабы, креветки, а также крошечные дафнии и наземные мокрицы.",
  ),
  s1: r("Jak zbudowany jest rak", "Как устроен рак"),
  s1intro: r(
    "Rak rzeczny żyje tylko w czystych rzekach i jeziorach. Obejrzyj go od góry — przycisk „Skrzela” pokaże, co jest pod pancerzem.",
    "Речной рак живёт только в чистых реках и озёрах. Рассмотри его сверху — кнопка «Жабры» покажет, что под панцирем.",
  ),
  s2: r("Skorupiak czy nie?", "Ракообразное или нет?"),
  s2intro: r("Nie każde zwierzę z pancerzem i wieloma nogami to skorupiak.", "Не всякое животное с панцирем и множеством ног — ракообразное."),
  s3: r("Poznaj skorupiaki", "Узнай ракообразных"),
  s3intro: r("Rozpoznaj skorupiaka po opisie.", "Узнай ракообразное по описанию."),
  yes: r("skorupiak", "ракообразное"),
  no: r("nie skorupiak", "не ракообразное"),
} satisfies Record<string, Txt>;

type RakPart = "carapace" | "abdomen" | "antennae" | "eyes" | "claws" | "legs" | "swimmerets" | "tail" | "gills";

const PARTS: Record<RakPart, MapPart> = {
  carapace: {
    name: r("Głowotułów", "Головогрудь"),
    text: r("Głowa i tułów zrośnięte w jedną część, okrytą twardym pancerzem z chityny i soli wapnia.", "Голова и грудь сросшиеся в один отдел, покрытый твёрдым панцирем из хитина и солей кальция."),
    pin: [250, 140],
    to: [182, 130],
  },
  abdomen: {
    name: r("Odwłok", "Брюшко"),
    text: r("Zbudowany z ruchomych segmentów. Gwałtownie podginając odwłok, rak ucieka do tyłu.", "Состоит из подвижных сегментов. Резко подгибая брюшко, рак уплывает назад."),
    pin: [250, 240],
    to: [174, 240],
  },
  antennae: {
    name: r("Dwie pary czułków", "Две пары усиков"),
    text: r("Długie i krótkie czułki to narządy dotyku i węchu. Dwie pary czułków to cecha skorupiaków — owady mają jedną, pajęczaki żadnej.", "Длинные и короткие усики — органы осязания и обоняния. Две пары усиков — признак ракообразных: у насекомых одна, у паукообразных ни одной."),
    pin: [262, 26],
    to: [236, 30],
  },
  eyes: {
    name: r("Oczy na słupkach", "Глаза на стебельках"),
    text: r("Oczy złożone osadzone na ruchomych słupkach — rak może się rozglądać, nie ruszając ciałem.", "Сложные глаза сидят на подвижных стебельках — рак может осматриваться, не поворачивая тело."),
    pin: [196, 58],
    to: [164, 66],
  },
  claws: {
    name: r("Szczypce", "Клешни"),
    text: r("Pierwsza para odnóży krocznych przekształcona w szczypce. Rak chwyta nimi pokarm i broni się.", "Первая пара ходильных ног превращена в клешни. Ими рак хватает пищу и защищается."),
    pin: [30, 80],
    to: [70, 40],
  },
  legs: {
    name: r("Odnóża kroczne", "Ходильные ноги"),
    text: r("Za szczypcami są jeszcze cztery pary odnóży, na których rak chodzi po dnie. Razem ze szczypcami — pięć par.", "За клешнями ещё четыре пары ног, на которых рак ходит по дну. Вместе с клешнями — пять пар."),
    pin: [34, 170],
    to: [84, 150],
  },
  swimmerets: {
    name: r("Odnóża odwłokowe", "Брюшные ножки"),
    text: r("Drobne odnóża pod odwłokiem. Samica nosi na nich jaja, a potem młode rączki.", "Маленькие ножки под брюшком. Самка вынашивает на них икру, а потом рачат."),
    pin: [40, 250],
    to: [120, 240],
  },
  tail: {
    name: r("Wachlarz ogonowy", "Хвостовой веер"),
    text: r("Szerokie płytki na końcu odwłoka. Uderzając nimi, rak szybko płynie do tyłu — „rakiem”.", "Широкие пластинки на конце брюшка. Ударяя ими, рак быстро плывёт задом наперёд."),
    pin: [250, 318],
    to: [176, 320],
  },
  gills: {
    name: r("Skrzela", "Жабры"),
    text: r("Pierzaste skrzela leżą po bokach ciała pod pancerzem głowotułowia. Pobierają tlen z wody.", "Перистые жабры лежат по бокам тела под панцирем головогруди. Забирают кислород из воды."),
  },
};

const M = "matrix(-1 0 0 1 300 0)";
const both = (node: ReactNode) => (
  <>
    <g>{node}</g>
    <g transform={M}>{node}</g>
  </>
);
const BROWN = "#a16207";
const DARK = "#78350f";

function CrayfishMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<RakPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 300 350"
      title={r("Budowa raka", "Строение рака")}
      labelOrder={["carapace", "abdomen", "antennae", "eyes", "claws", "legs", "swimmerets", "tail"]}
      pinRadius={15}
      maxWidth="max-w-[360px]"
      art={({ part, tone }) => (
        <>
          {part(
            "antennae",
            both(
              <g fill="none" strokeLinecap="round">
                <path d="M144 76 C 120 40, 90 18, 46 6" stroke={tone("antennae", DARK)} strokeWidth={2.5} />
                <path d="M147 76 L 138 54 L 128 46" stroke={tone("antennae", DARK)} strokeWidth={2.5} />
                <path d="M144 76 C 120 40, 90 18, 46 6" stroke="transparent" strokeWidth={14} />
              </g>,
            ),
          )}
          {part(
            "legs",
            both(
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {[112, 128, 144, 160].map((y) => (
                  <g key={y}>
                    <path d={`M122 ${y} L 94 ${y - 4} L 82 ${y + 10}`} stroke={tone("legs", BROWN)} strokeWidth={4} />
                    <path d={`M122 ${y} L 94 ${y - 4} L 82 ${y + 10}`} stroke="transparent" strokeWidth={12} />
                  </g>
                ))}
              </g>,
            ),
          )}
          {part(
            "claws",
            both(
              <g>
                <path d="M126 92 L 98 74 L 86 50" fill="none" stroke={tone("claws", BROWN)} strokeWidth={7} strokeLinecap="round" />
                <path d="M86 54 C 60 48, 56 12, 74 2 C 80 14, 74 22, 88 30 C 92 22, 100 30, 94 48 Z" fill={tone("claws", "#b45309")} stroke={DARK} strokeWidth={1.5} />
              </g>,
            ),
          )}
          {part(
            "swimmerets",
            both(
              <g stroke={tone("swimmerets", DARK)} strokeWidth={2.5} strokeLinecap="round">
                {[214, 234, 254, 272].map((y) => (
                  <path key={y} d={`M${128 + (y - 214) / 12} ${y} l -10 4`} />
                ))}
              </g>,
            ),
          )}
          {part(
            "abdomen",
            <g>
              {[204, 226, 248, 268, 286].map((y, i) => (
                <ellipse key={y} cx={150} cy={y} rx={26 - i * 2} ry={12} fill={tone("abdomen", "#ca8a04")} stroke={DARK} strokeWidth={1.5} />
              ))}
            </g>,
          )}
          {part("tail", <path d="M150 294 L 116 330 L 134 338 L 150 322 L 166 338 L 184 330 Z" fill={tone("tail", "#ca8a04")} stroke={DARK} strokeWidth={1.5} />)}
          {part("carapace", <ellipse cx={150} cy={130} rx={34} ry={62} fill={tone("carapace", "#b45309")} stroke={DARK} strokeWidth={2} />)}
          {part(
            "eyes",
            both(
              <g>
                <path d="M144 72 L 138 64" stroke={DARK} strokeWidth={3} />
                <circle cx={136} cy={62} r={5} fill={tone("eyes", "#1c1917")} />
              </g>,
            ),
          )}
        </>
      )}
      overlay={(active) =>
        active === "gills" && (
          <g pointerEvents="none">
            {both(
              <g>
                {[100, 116, 132, 148, 164].map((y) => (
                  <path key={y} d={`M140 ${y} C 128 ${y - 4}, 122 ${y + 4}, 120 ${y + 10}`} fill="none" stroke="#f472b6" strokeWidth={5} strokeLinecap="round" />
                ))}
              </g>,
            )}
          </g>
        )
      }
    />
  );
}

const SORT: SortItem[] = [
  { name: r("krab", "краб"), group: 0, why: r("ma szczypce i dwie pary czułków", "есть клешни и две пары усиков") },
  { name: r("skorpion", "скорпион"), group: 1, why: r("pajęczak — 4 pary odnóży, brak czułków", "паукообразное — 4 пары ног, усиков нет") },
  { name: r("kryl", "криль"), group: 0, why: r("drobny skorupiak morski", "мелкое морское ракообразное") },
  { name: r("krocionóg (wij)", "кивсяк (многоножка)"), group: 1, why: r("wij — ma bardzo wiele par odnóży i jedną parę czułków", "многоножка — очень много пар ног и одна пара усиков") },
  { name: r("rozwielitka", "дафния"), group: 0, why: r("maleńki skorupiak słodkowodny", "крошечное пресноводное ракообразное") },
  { name: r("ślimak", "улитка"), group: 1, why: r("mięczak — muszla nie jest pancerzem stawonoga", "моллюск — раковина не панцирь членистоногого") },
  { name: r("prosionek", "мокрица"), group: 0, why: r("skorupiak, który wyszedł na ląd", "ракообразное, вышедшее на сушу") },
  { name: r("chrząszcz", "жук"), group: 1, why: r("owad — 3 pary odnóży", "насекомое — 3 пары ног") },
];

const OPTIONS: QuizOption[] = [
  { id: "rak", label: r("rak rzeczny", "речной рак") },
  { id: "krab", label: r("krab", "краб") },
  { id: "krewetka", label: r("krewetka", "креветка") },
  { id: "prosionek", label: r("prosionek", "мокрица") },
  { id: "rozwielitka", label: r("rozwielitka", "дафния") },
  { id: "kryl", label: r("kryl", "криль") },
];

const ITEMS: QuizItem[] = [
  { icon: "💧", name: r("żyje tylko w bardzo czystych rzekach — świadczy o czystości wody", "живёт только в очень чистых реках — показатель чистоты воды"), answer: "rak", explain: r("Rak rzeczny to wskaźnik czystości wód.", "Речной рак — показатель чистоты воды.") },
  { icon: "↔️", name: r("chodzi bokiem, a krótki odwłok ma podwinięty pod głowotułów", "ходит боком, а короткое брюшко подогнуто под головогрудь"), answer: "krab", explain: r("Tak wygląda i porusza się krab.", "Так выглядит и передвигается краб.") },
  { icon: "🐋", name: r("drobne skorupiaki morskie, główny pokarm wielorybów", "мелкие морские ракообразные, основная пища китов"), answer: "kryl", explain: r("Kryl żyje w ogromnych ławicach.", "Криль живёт огромными скоплениями.") },
  { icon: "🪨", name: r("mieszka pod kamieniami i w piwnicach, bo potrzebuje wilgoci", "живёт под камнями и в подвалах, потому что ему нужна влага"), answer: "prosionek", explain: r("Prosionek to lądowy skorupiak.", "Мокрица — наземное ракообразное.") },
  { icon: "🐟", name: r("maleńki skorupiak ze stawu, pokarm dla ryb akwariowych", "крошечное ракообразное из пруда, корм для аквариумных рыб"), answer: "rozwielitka", explain: r("Rozwielitkę nazywa się też dafnią.", "Дафнию ещё называют водяной блохой.") },
  { icon: "🍤", name: r("morski skorupiak hodowany i poławiany jako jedzenie", "морское ракообразное, которое разводят и ловят в пищу"), answer: "krewetka", explain: r("Krewetki to popularne owoce morza.", "Креветки — популярные морепродукты.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3", Txt[]> = {
  s1: [
    { pl: "Ciało raka: głowotułów i odwłok.", ru: "Тело рака: головогрудь и брюшко." },
    { pl: "Skorupiaki mają dwie pary czułków i oddychają skrzelami.", ru: "У ракообразных две пары усиков, они дышат жабрами." },
    { pl: "Rak ma pięć par odnóży krocznych; pierwsza to szczypce.", ru: "У рака пять пар ходильных ног; первая — клешни." },
  ],
  s2: [{ pl: "Pancerz skorupiaków wzmacniają sole wapnia.", ru: "Панцирь ракообразных укреплён солями кальция." }],
  s3: [
    { pl: "Skorupiaki są pokarmem ryb i wielorybów, a niektóre — ludzi.", ru: "Ракообразные — пища рыб и китов, а некоторые — и людей." },
    { pl: "Rak rzeczny żyje tylko w czystych wodach.", ru: "Речной рак живёт только в чистых водах." },
  ],
};

export default function CrustaceansLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="crustaceans" sections={[T.s1, T.s2, T.s3]} />
      <Section id="crustaceans-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CrayfishMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="crustaceans-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s2} groups={[T.yes, T.no]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="crustaceans-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={r("🦞 Kto to?", "🦞 Кто это?")}
          question={r("Kto", "Кто")}
          options={OPTIONS}
          items={ITEMS}
          wrongHint={r("to inny skorupiak. Zwróć uwagę, gdzie żyje.", "это другое ракообразное. Обрати внимание, где оно живёт.")}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
    </div>
  );
}
