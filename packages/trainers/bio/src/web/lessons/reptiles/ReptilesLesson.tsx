// Lesson for §4.5 "Gady – kręgowce, które opanowały ląd" (Puls życia 6). Terms follow
// templates/data/sp6Vertebrates.ts (REPTILES, REPTILE_SPECIES).
import { MatchQuiz, TwoWaySort, type QuizItem, type QuizOption, type SortItem } from "../games.tsx";
import { Remember, Section, type LessonProps, type Txt } from "../kit.tsx";
import { LessonIntro } from "../LessonIntro.tsx";
import { DryTest } from "./DryTest.tsx";
import { LizardMap } from "./LizardMap.tsx";

const T = {
  lead: {
    pl: "Gady — jaszczurki, węże, żółwie i krokodyle — jako pierwsze kręgowce uniezależniły się od wody. Mają suchą skórę z łuskami, oddychają wyłącznie płucami i składają jaja na lądzie. Tak jak płazy są zmiennocieplne, dlatego lubią wygrzewać się na słońcu.",
    ru: "Пресмыкающиеся — ящерицы, змеи, черепахи и крокодилы — первыми из позвоночных стали независимы от воды. У них сухая кожа с чешуёй, дышат они только лёгкими и откладывают яйца на суше. Как и земноводные, они холоднокровны, поэтому любят греться на солнце.",
  },
  s1: { pl: "Jak zbudowana jest jaszczurka", ru: "Как устроена ящерица" },
  s1intro: {
    pl: "Jaszczurka zwinka żyje też w Polsce. Sprawdź, co pozwala jej żyć z dala od wody, i dotknij ogona.",
    ru: "Прыткая ящерица живёт и в Польше. Посмотри, что позволяет ей жить вдали от воды, и нажми на хвост.",
  },
  s2: { pl: "Płaz czy gad?", ru: "Земноводное или пресмыкающееся?" },
  s2intro: {
    pl: "Płazy i gady łatwo pomylić. Przypisz każdą cechę właściwej grupie.",
    ru: "Земноводных и пресмыкающихся легко перепутать. Отнеси каждый признак к своей группе.",
  },
  s3: { pl: "Jajo na lądzie", ru: "Яйцо на суше" },
  s3intro: {
    pl: "Najważniejszy „wynalazek” gadów to jajo, które nie wysycha. Zrób doświadczenie.",
    ru: "Главное «изобретение» пресмыкающихся — яйцо, которое не высыхает. Проведи опыт.",
  },
  s4: { pl: "Gady Polski", ru: "Пресмыкающиеся Польши" },
  s4intro: {
    pl: "W Polsce żyje kilka gatunków gadów — wszystkie są pod ochroną. Rozpoznaj je po opisie.",
    ru: "В Польше живёт несколько видов пресмыкающихся — все они охраняются. Узнай их по описанию.",
  },
  amphibian: { pl: "płaz", ru: "земноводное" },
  reptile: { pl: "gad", ru: "пресмыкающееся" },
} satisfies Record<string, Txt>;

const SORT: SortItem[] = [
  { name: { pl: "naga, wilgotna skóra", ru: "голая влажная кожа" }, group: 0, why: { pl: "przez nią płaz też oddycha", ru: "через неё земноводное тоже дышит" } },
  { name: { pl: "sucha skóra z łuskami rogowymi", ru: "сухая кожа с роговыми чешуями" }, group: 1, why: { pl: "chroni przed wysychaniem", ru: "защищает от высыхания" } },
  { name: { pl: "jaja w galarecie składane do wody", ru: "яйца в студне, отложенные в воду" }, group: 0, why: { pl: "to skrzek", ru: "это икра земноводных" } },
  { name: { pl: "jaja z osłonką składane na lądzie", ru: "яйца с оболочкой, отложенные на суше" }, group: 1, why: { pl: "osłonka nie pozwala wyschnąć", ru: "оболочка не даёт высохнуть" } },
  { name: { pl: "zapłodnienie zewnętrzne", ru: "наружное оплодотворение" }, group: 0, why: { pl: "w wodzie, poza ciałem samicy", ru: "в воде, вне тела самки" } },
  { name: { pl: "zapłodnienie wewnętrzne", ru: "внутреннее оплодотворение" }, group: 1, why: { pl: "w ciele samicy, bez potrzeby wody", ru: "в теле самки, вода не нужна" } },
  { name: { pl: "larwa (kijanka) oddycha skrzelami", ru: "личинка (головастик) дышит жабрами" }, group: 0, why: { pl: "rozwój z przeobrażeniem", ru: "развитие с превращением" } },
  { name: { pl: "z jaja wychodzi młode podobne do dorosłego", ru: "из яйца выходит детёныш, похожий на взрослого" }, group: 1, why: { pl: "rozwój prosty, bez larwy", ru: "прямое развитие, без личинки" } },
];

const SPECIES: QuizOption[] = [
  { id: "viper", label: { pl: "żmija zygzakowata", ru: "обыкновенная гадюка" } },
  { id: "grass", label: { pl: "zaskroniec", ru: "обыкновенный уж" } },
  { id: "slow", label: { pl: "padalec", ru: "веретеница" } },
  { id: "sand", label: { pl: "jaszczurka zwinka", ru: "прыткая ящерица" } },
  { id: "turtle", label: { pl: "żółw błotny", ru: "болотная черепаха" } },
];

const ITEMS: QuizItem[] = [
  {
    icon: "⚠️",
    name: { pl: "jedyny jadowity wąż w Polsce, z ciemnym zygzakiem na grzbiecie", ru: "единственная ядовитая змея Польши, с тёмным зигзагом на спине" },
    answer: "viper",
    explain: {
      pl: "Żmija zygzakowata. Atakuje tylko w obronie — gdy ją zobaczysz, spokojnie się oddal. Po ukąszeniu trzeba jak najszybciej jechać do lekarza.",
      ru: "Обыкновенная гадюка. Нападает только защищаясь — увидев её, спокойно отойди. После укуса нужно как можно скорее ехать к врачу.",
    },
  },
  {
    icon: "🟡",
    name: { pl: "niejadowity wąż z żółtymi plamami po bokach głowy, świetnie pływa", ru: "неядовитая змея с жёлтыми пятнами по бокам головы, отлично плавает" },
    answer: "grass",
    explain: { pl: "Zaskroniec — poluje głównie na żaby i ryby.", ru: "Уж — охотится в основном на лягушек и рыбу." },
  },
  {
    icon: "🪱",
    name: { pl: "beznoga jaszczurka z powiekami, często mylona z wężem", ru: "безногая ящерица с веками, которую часто путают со змеёй" },
    answer: "slow",
    explain: { pl: "Padalec — w odróżnieniu od węży mruga powiekami i potrafi odrzucić ogon.", ru: "Веретеница — в отличие от змей, моргает веками и может отбросить хвост." },
  },
  {
    icon: "🌞",
    name: { pl: "jaszczurka nasłonecznionych miejsc; samiec wiosną ma zielone boki", ru: "ящерица солнечных мест; у самца весной зелёные бока" },
    answer: "sand",
    explain: { pl: "Jaszczurka zwinka — najczęściej spotykana jaszczurka w Polsce.", ru: "Прыткая ящерица — самая обычная ящерица Польши." },
  },
  {
    icon: "🐢",
    name: { pl: "jedyny dziko żyjący żółw w Polsce, ściśle chroniony", ru: "единственная дикая черепаха Польши, строго охраняемая" },
    answer: "turtle",
    explain: { pl: "Żółw błotny — żyje w czystych stawach i rozlewiskach.", ru: "Европейская болотная черепаха — живёт в чистых прудах и заводях." },
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Skóra gadów jest sucha, pokryta łuskami rogowymi; gady linieją.", ru: "Кожа пресмыкающихся сухая, с роговыми чешуями; они линяют." },
    { pl: "Gady oddychają wyłącznie płucami.", ru: "Пресмыкающиеся дышат только лёгкими." },
    { pl: "Jaszczurki potrafią odrzucić ogon (autotomia).", ru: "Ящерицы умеют отбрасывать хвост (автотомия)." },
  ],
  s2: [
    { pl: "Gady: zapłodnienie wewnętrzne i rozwój prosty, bez larwy.", ru: "Пресмыкающиеся: внутреннее оплодотворение и прямое развитие, без личинки." },
    { pl: "Płazy i gady są zmiennocieplne.", ru: "Земноводные и пресмыкающиеся холоднокровны." },
  ],
  s3: [
    { pl: "Jajo gada ma skórzastą lub wapienną osłonkę, która chroni zarodek przed wyschnięciem.", ru: "Яйцо пресмыкающегося имеет кожистую или известковую оболочку, защищающую зародыш от высыхания." },
  ],
  s4: [
    { pl: "Jedynym jadowitym wężem w Polsce jest żmija zygzakowata.", ru: "Единственная ядовитая змея Польши — обыкновенная гадюка." },
    { pl: "Wszystkie gady w Polsce są chronione.", ru: "Все пресмыкающиеся Польши охраняются." },
  ],
};

export default function ReptilesLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="reptiles" sections={[T.s1, T.s2, T.s3, T.s4]} />

      <Section id="reptiles-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <LizardMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="reptiles-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={{ pl: "Czyja to cecha?", ru: "Чей это признак?" }} groups={[T.amphibian, T.reptile]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="reptiles-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <DryTest lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="reptiles-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={{ pl: "🦎 Kto to?", ru: "🦎 Кто это?" }}
          question={{ pl: "Kto to:", ru: "Кто это:" }}
          options={SPECIES}
          items={ITEMS}
          wrongHint={{ pl: "to nie ten gatunek. Przeczytaj opis jeszcze raz.", ru: "это другой вид. Перечитай описание." }}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
