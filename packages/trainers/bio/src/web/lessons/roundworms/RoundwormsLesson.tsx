// Lesson for §2.3 "Nicienie – zwierzęta, które mają nitkowate ciało" (Puls życia 6). Terms follow
// templates/data/sp6Invertebrates.ts (ROUNDWORMS).
import type { BioLang } from "../../../lang.ts";
import { CycleDiagram, MatchQuiz, PartMap, TwoWaySort, type CycleStage, type MapPart, type QuizItem, type QuizOption, type SortItem } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const T = {
  lead: {
    pl: "Nicienie to robaki o długim, cienkim, obłym ciele, niepodzielonym na segmenty. Większość żyje swobodnie w glebie i wodzie i rozkłada szczątki organiczne. Niektóre są pasożytami człowieka — glista, owsik i włosień.",
    ru: "Круглые черви (нематоды) — черви с длинным тонким телом, круглым в поперечнике и без сегментов. Большинство свободно живёт в почве и воде и разлагает органические остатки. Некоторые паразитируют у человека — аскарида, острица и трихинелла.",
  },
  s1: { pl: "Jak zbudowana jest glista", ru: "Как устроена аскарида" },
  s1intro: {
    pl: "Porównaj samicę i samca glisty ludzkiej. Przycisk „Przewód pokarmowy” pokaże, czym nicienie różnią się od płazińców.",
    ru: "Сравни самку и самца человеческой аскариды. Кнопка «Пищеварительная трубка» покажет, чем круглые черви отличаются от плоских.",
  },
  s2: { pl: "Cykl rozwojowy glisty", ru: "Цикл развития аскариды" },
  s2intro: {
    pl: "Glista ma tylko jednego żywiciela — człowieka — ale jej larwy odbywają długą wędrówkę po ciele.",
    ru: "У аскариды только один хозяин — человек, — но её личинки совершают долгое путешествие по телу.",
  },
  s3: { pl: "Detektyw: kto zaraził?", ru: "Детектив: кто заразил?" },
  s3intro: {
    pl: "Po opisie sytuacji odgadnij, którym pasożytem mógł się zarazić człowiek.",
    ru: "По описанию ситуации угадай, каким паразитом мог заразиться человек.",
  },
  s4: { pl: "Chroni czy naraża?", ru: "Защищает или подвергает риску?" },
  s4intro: {
    pl: "Większości chorób pasożytniczych łatwo uniknąć. Oceń te nawyki.",
    ru: "Большинства паразитарных болезней легко избежать. Оцени эти привычки.",
  },
  protects: { pl: "chroni", ru: "защищает" },
  risky: { pl: "naraża", ru: "опасно" },
} satisfies Record<string, Txt>;

// ---------- the worms ----------

type WormPart = "cuticle" | "mouth" | "anus" | "gut" | "female" | "male";

const PARTS: Record<WormPart, MapPart> = {
  cuticle: {
    name: { pl: "Oskórek", ru: "Кутикула" },
    text: {
      pl: "Mocna, gładka osłona ciała. Nie przepuszcza soków trawiennych żywiciela, więc glista nie zostaje strawiona w jelicie.",
      ru: "Прочный гладкий покров тела. Не пропускает пищеварительные соки хозяина, поэтому аскарида не переваривается в кишечнике.",
    },
    pin: [180, 22],
    to: [180, 54],
  },
  mouth: {
    name: { pl: "Otwór gębowy", ru: "Рот" },
    text: { pl: "Na przednim końcu, otoczony trzema wargami. Glista wysysa nim treść jelita.", ru: "На переднем конце, окружён тремя губами. Им аскарида всасывает содержимое кишечника." },
    pin: [22, 30],
    to: [28, 62],
  },
  anus: {
    name: { pl: "Otwór odbytowy", ru: "Анальное отверстие" },
    text: {
      pl: "Na tylnym końcu ciała. Nicienie jako pierwsze zwierzęta mają przewód pokarmowy z dwoma otworami: pokarm wchodzi jednym, a resztki wychodzą drugim.",
      ru: "На заднем конце тела. Круглые черви — первые животные, у которых пищеварительная трубка с двумя отверстиями: пища входит через одно, остатки выходят через другое.",
    },
    pin: [338, 32],
    to: [330, 62],
  },
  gut: {
    name: { pl: "Przewód pokarmowy", ru: "Пищеварительная трубка" },
    text: {
      pl: "Prosta rura biegnąca od otworu gębowego do odbytowego. U płazińców i parzydełkowców był tylko jeden otwór — tu są dwa.",
      ru: "Прямая трубка от рта до анального отверстия. У плоских червей и кишечнополостных было одно отверстие — здесь их два.",
    },
  },
  female: {
    name: { pl: "Samica", ru: "Самка" },
    text: {
      pl: "Większa, do ok. 40 cm, z prostym końcem ciała. Składa nawet 200 tysięcy jaj dziennie. Nicienie są rozdzielnopłciowe: samce i samice to osobne osobniki.",
      ru: "Крупнее, до 40 см, с прямым концом тела. Откладывает до 200 тысяч яиц в день. Круглые черви раздельнополые: самцы и самки — разные особи.",
    },
    pin: [120, 100],
    to: [120, 70],
  },
  male: {
    name: { pl: "Samiec", ru: "Самец" },
    text: { pl: "Mniejszy i cieńszy od samicy, z charakterystycznie zagiętym tylnym końcem ciała.", ru: "Мельче и тоньше самки, с характерно загнутым задним концом тела." },
    pin: [300, 180],
    to: [262, 150],
  },
};

const FEMALE = "M24 62 C 90 44, 260 46, 334 64 C 260 82, 90 82, 24 62 Z";
const MALE = "M60 140 C 110 132, 200 134, 250 140 C 270 142, 278 156, 266 164 C 262 158, 262 150, 248 148 C 200 146, 110 148, 60 140 Z";

function WormMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<WormPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 360 200"
      title={{ pl: "Samica i samiec glisty", ru: "Самка и самец аскариды" }}
      labelOrder={["cuticle", "mouth", "anus", "female", "male"]}
      pinRadius={15}
      maxWidth="max-w-[460px]"
      art={({ part, tone }) => (
        <>
          {part(
            "female",
            <g>
              <path d={FEMALE} fill={tone("female", "#fecdd3")} />
              <rect x={100} y={64} width={40} height={30} fill="transparent" />
            </g>,
          )}
          {part("male", <path d={MALE} fill={tone("male", "#fecdd3")} stroke="#be123c" strokeWidth={2} />)}
          {part(
            "cuticle",
            <g fill="none">
              <path d={FEMALE} stroke={tone("cuticle", "#be123c")} strokeWidth={3} />
              <path d={FEMALE} stroke="transparent" strokeWidth={10} />
            </g>,
          )}
          {part("mouth", <circle cx={26} cy={62} r={5} fill={tone("mouth", "#9f1239")} />)}
          {part("anus", <circle cx={330} cy={64} r={4} fill={tone("anus", "#9f1239")} />)}
        </>
      )}
      overlay={(active) =>
        active === "gut" && (
          <g pointerEvents="none">
            <path d="M30 62 C 100 58, 260 60, 326 64" fill="none" stroke="#ca8a04" strokeWidth={5} strokeLinecap="round" />
            <path d="M14 54 L 28 60 M14 70 L 28 64" stroke="#16a34a" strokeWidth={2} />
            <path d="M332 64 L 348 58 M332 64 L 348 70" stroke="#ea580c" strokeWidth={2} />
          </g>
        )
      }
    />
  );
}

// ---------- the cycle ----------

const CYCLE: CycleStage[] = [
  {
    icon: "🧒",
    name: { pl: "Dorosła glista w jelicie", ru: "Взрослая аскарида в кишечнике" },
    text: { pl: "Samce i samice żyją w jelicie cienkim człowieka. Samica składa ogromne ilości jaj.", ru: "Самцы и самки живут в тонкой кишке человека. Самка откладывает огромное количество яиц." },
    prevent: { pl: "Przy objawach (bóle brzucha, osłabienie) — do lekarza; glisty usuwa się lekami.", ru: "При симптомах (боли в животе, слабость) — к врачу; аскарид выводят лекарствами." },
  },
  {
    icon: "🚽",
    name: { pl: "Jaja z kałem trafiają do gleby", ru: "Яйца с калом попадают в почву" },
    text: { pl: "Jaja wydostają się z kałem. Mają grubą osłonkę i przeżywają w glebie nawet kilka lat.", ru: "Яйца выходят с калом. У них толстая оболочка, и в почве они выживают даже несколько лет." },
    prevent: { pl: "Korzystanie z toalet; ludzkich odchodów nie używa się do nawożenia warzyw.", ru: "Пользоваться туалетом; человеческие отходы не используют для удобрения овощей." },
  },
  {
    icon: "🌱",
    name: { pl: "Jaja dojrzewają w glebie", ru: "Яйца созревают в почве" },
    text: { pl: "W ciepłej, wilgotnej ziemi w ciągu kilku tygodni w jajach rozwijają się larwy. Dopiero takie jaja są zaraźliwe.", ru: "В тёплой влажной земле за несколько недель в яйцах развиваются личинки. Только такие яйца заразны." },
  },
  {
    icon: "🥕",
    name: { pl: "Połknięcie jaj", ru: "Яйца проглочены" },
    text: { pl: "Człowiek połyka jaja z brudnymi rękami albo z nieumytymi warzywami i owocami.", ru: "Человек проглатывает яйца с грязными руками или немытыми овощами и фруктами." },
    prevent: { pl: "Myj ręce przed jedzeniem i po zabawie na dworze; myj warzywa i owoce.", ru: "Мой руки перед едой и после игр на улице; мой овощи и фрукты." },
  },
  {
    icon: "🫁",
    name: { pl: "Wędrówka larw", ru: "Путешествие личинок" },
    text: {
      pl: "Larwy przebijają ścianę jelita i z krwią wędrują przez wątrobę i serce do płuc. Stamtąd są odkrztuszane, połykane i wracają do jelita, gdzie dorastają.",
      ru: "Личинки пробивают стенку кишки и с кровью путешествуют через печень и сердце в лёгкие. Оттуда их откашливают, проглатывают, и они возвращаются в кишечник, где вырастают.",
    },
  },
];

// ---------- detective and habits ----------

const SUSPECTS: QuizOption[] = [
  { id: "ascaris", label: { pl: "glista ludzka", ru: "человеческая аскарида" } },
  { id: "pinworm", label: { pl: "owsik", ru: "острица" } },
  { id: "trichinella", label: { pl: "włosień kręty", ru: "трихинелла" } },
  { id: "pork", label: { pl: "tasiemiec uzbrojony", ru: "свиной цепень" } },
  { id: "beef", label: { pl: "tasiemiec nieuzbrojony", ru: "бычий цепень" } },
];

const CASES: QuizItem[] = [
  { icon: "🥕", name: { pl: "zjadł nieumytą marchewkę prosto z grządki", ru: "съел немытую морковку прямо с грядки" }, answer: "ascaris", explain: { pl: "Na warzywach z ziemi mogą być jaja glisty.", ru: "На овощах с земли могут быть яйца аскариды." } },
  {
    icon: "😣",
    name: { pl: "przedszkolak drapie się wieczorem wokół odbytu, a potem wkłada palce do buzi", ru: "дошкольник вечером чешется около заднего прохода, а потом тянет пальцы в рот" },
    answer: "pinworm",
    explain: {
      pl: "Owsiki składają jaja wokół odbytu i powodują swędzenie. Drapiąc się, dziecko przenosi jaja na palce i zaraża się znowu.",
      ru: "Острицы откладывают яйца около заднего прохода и вызывают зуд. Расчёсывая, ребёнок переносит яйца на пальцы и заражается снова.",
    },
  },
  {
    icon: "🐗",
    name: { pl: "myśliwy zjadł kiełbasę z dzika, której mięsa nie zbadał weterynarz", ru: "охотник съел колбасу из кабана, мясо которого не проверил ветеринар" },
    answer: "trichinella",
    explain: { pl: "Larwy włośnia żyją w mięśniach dzików i świń i wywołują groźną włośnicę.", ru: "Личинки трихинеллы живут в мышцах кабанов и свиней и вызывают опасный трихинеллёз." },
  },
  { icon: "🥩", name: { pl: "zjadł tatara z surowej wołowiny", ru: "съел тартар из сырой говядины" }, answer: "beef", explain: { pl: "Wągry tasiemca nieuzbrojonego żyją w mięśniach bydła.", ru: "Финны бычьего цепня живут в мышцах крупного рогатого скота." } },
  {
    icon: "🐖",
    name: { pl: "zjadł niedosmażony kotlet wieprzowy z białymi ziarenkami w mięsie", ru: "съел недожаренную свиную котлету с белыми зёрнышками в мясе" },
    answer: "pork",
    explain: { pl: "Białe ziarenka to wągry tasiemca uzbrojonego.", ru: "Белые зёрнышки — финны свиного цепня." },
  },
];

const HABITS: SortItem[] = [
  { name: { pl: "mycie rąk po wyjściu z toalety", ru: "мыть руки после туалета" }, group: 0, why: { pl: "najprostsza ochrona przed glistą i owsikiem", ru: "простейшая защита от аскариды и острицы" } },
  { name: { pl: "obgryzanie paznokci", ru: "грызть ногти" }, group: 1, why: { pl: "jaja spod paznokci trafiają do ust", ru: "яйца из-под ногтей попадают в рот" } },
  { name: { pl: "mycie owoców przed jedzeniem", ru: "мыть фрукты перед едой" }, group: 0, why: { pl: "zmywa jaja pasożytów", ru: "смывает яйца паразитов" } },
  { name: { pl: "jedzenie niebadanego mięsa z dzika", ru: "есть непроверенное мясо кабана" }, group: 1, why: { pl: "ryzyko włośnicy", ru: "риск трихинеллёза" } },
  { name: { pl: "krótko obcięte paznokcie", ru: "коротко подстриженные ногти" }, group: 0, why: { pl: "pod krótkimi paznokciami nie zbiera się brud", ru: "под короткими ногтями не скапливается грязь" } },
  { name: { pl: "picie wody prosto ze stawu", ru: "пить воду прямо из пруда" }, group: 1, why: { pl: "w wodzie mogą być jaja i larwy pasożytów", ru: "в воде могут быть яйца и личинки паразитов" } },
  { name: { pl: "dokładne smażenie i gotowanie mięsa", ru: "хорошо прожаривать и проваривать мясо" }, group: 0, why: { pl: "wysoka temperatura zabija larwy", ru: "высокая температура убивает личинок" } },
  { name: { pl: "głaskanie psa i od razu jedzenie bez mycia rąk", ru: "погладить собаку и сразу есть, не помыв руки" }, group: 1, why: { pl: "na sierści mogą być jaja pasożytów", ru: "на шерсти могут быть яйца паразитов" } },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Nicienie mają nitkowate, obłe ciało bez segmentów, okryte oskórkiem.", ru: "У круглых червей нитевидное круглое тело без сегментов, покрытое кутикулой." },
    { pl: "Przewód pokarmowy ma dwa otwory: gębowy i odbytowy.", ru: "Пищеварительная трубка имеет два отверстия: рот и анальное." },
    { pl: "Nicienie są rozdzielnopłciowe.", ru: "Круглые черви раздельнополые." },
  ],
  s2: [{ pl: "Glistą zarażamy się, połykając jej jaja — z brudnymi rękami lub nieumytymi warzywami.", ru: "Аскаридой заражаются, проглатывая её яйца — с грязными руками или немытыми овощами." }],
  s3: [
    { pl: "Owsik: swędzenie okolic odbytu, częsty u dzieci.", ru: "Острица: зуд около заднего прохода, часто у детей." },
    { pl: "Włosień: larwy w mięśniach; chroni badanie mięsa przez weterynarza.", ru: "Трихинелла: личинки в мышцах; защищает ветеринарная проверка мяса." },
  ],
  s4: [{ pl: "Najważniejsze: mycie rąk, mycie warzyw i owoców, jedzenie tylko zbadanego i dobrze przyrządzonego mięsa.", ru: "Главное: мыть руки, овощи и фрукты, есть только проверенное и хорошо приготовленное мясо." }],
};

export default function RoundwormsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="roundworms" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="roundworms-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <WormMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="roundworms-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CycleDiagram lang={lang} title={T.s2} stages={CYCLE} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="roundworms-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={{ pl: "🔎 Kto zaraził?", ru: "🔎 Кто заразил?" }}
          question={{ pl: "Czym mógł się zarazić ktoś, kto", ru: "Чем мог заразиться тот, кто" }}
          options={SUSPECTS}
          items={CASES}
          wrongHint={{ pl: "ten pasożyt trafia do nas inną drogą.", ru: "этот паразит попадает к нам другим путём." }}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="roundworms-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={{ pl: "Dobry czy zły nawyk?", ru: "Хорошая или плохая привычка?" }} groups={[T.protects, T.risky]} items={HABITS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
