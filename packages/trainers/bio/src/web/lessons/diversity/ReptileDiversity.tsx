// Lesson for §4.6 "Przegląd i znaczenie gadów" (Puls życia 6). Species follow
// templates/data/sp6Vertebrates.ts (REPTILE_SPECIES).
import { SPECIES_HINT, CompareTabs, SpeciesGallery, TwoWaySort, type CompareCard, type SortItem, type Species } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });
const PROTECTED = r("chroniony", "охраняется");

const T = {
  lead: r(
    "Gady to jaszczurki, węże, żółwie i krokodyle. Najwięcej gatunków żyje w ciepłych krajach — w Polsce jest ich tylko kilka i wszystkie są chronione. Gady zjadają owady i gryzonie, a jad węży wykorzystuje się do produkcji leków.",
    "Пресмыкающиеся — это ящерицы, змеи, черепахи и крокодилы. Больше всего видов живёт в тёплых странах — в Польше их всего несколько, и все охраняются. Пресмыкающиеся поедают насекомых и грызунов, а из змеиного яда делают лекарства.",
  ),
  s1: r("Poznaj gady", "Познакомься с пресмыкающимися"),
  s2: r("Żmija, zaskroniec czy padalec?", "Гадюка, уж или веретеница?"),
  s2intro: r(
    "Te trzy zwierzęta często się myli — a tylko jedno jest jadowite. Porównaj ich cechy.",
    "Этих трёх животных часто путают — а ядовито только одно. Сравни их признаки.",
  ),
  s3: r("Żyje w Polsce?", "Живёт в Польше?"),
  s3intro: r("Które gady możesz spotkać w Polsce, a które tylko w ciepłych krajach?", "Каких пресмыкающихся можно встретить в Польше, а каких — только в тёплых странах?"),
  yes: r("w Polsce", "в Польше"),
  no: r("w ciepłych krajach", "в тёплых странах"),
} satisfies Record<string, Txt>;

const SPECIES: Species[] = [
  { icon: "🦎", name: r("Jaszczurka zwinka", "Прыткая ящерица"), text: r("Lubi nasłonecznione miejsca; samiec wiosną ma zielone boki.", "Любит солнечные места; у самца весной зелёные бока."), tag: PROTECTED },
  { icon: "🪱", name: r("Padalec", "Веретеница"), text: r("Beznoga jaszczurka z powiekami, często mylona z wężem.", "Безногая ящерица с веками, которую часто путают со змеёй."), tag: PROTECTED },
  { icon: "⚠️", name: r("Żmija zygzakowata", "Обыкновенная гадюка"), text: r("Jedyny jadowity wąż w Polsce, z zygzakiem na grzbiecie.", "Единственная ядовитая змея Польши, с зигзагом на спине."), tag: PROTECTED },
  { icon: "🐍", name: r("Zaskroniec", "Обыкновенный уж"), text: r("Niejadowity wąż z żółtymi plamami po bokach głowy; świetnie pływa.", "Неядовитая змея с жёлтыми пятнами по бокам головы; отлично плавает."), tag: PROTECTED },
  { icon: "🐢", name: r("Żółw błotny", "Болотная черепаха"), text: r("Jedyny dziko żyjący żółw w Polsce, ściśle chroniony.", "Единственная дикая черепаха Польши, строго охраняется."), tag: PROTECTED },
  { icon: "🟫", name: r("Gniewosz plamisty", "Медянка"), text: r("Rzadki niejadowity wąż, często zabijany przez pomyłkę ze żmiją.", "Редкая неядовитая змея, которую часто убивают, путая с гадюкой."), tag: PROTECTED },
  { icon: "🐊", name: r("Krokodyl nilowy", "Нильский крокодил"), text: r("Duży drapieżny gad z Afryki, czyhający na ofiary przy brzegu.", "Крупный хищник из Африки, подстерегающий добычу у берега.") },
  { icon: "🦎", name: r("Kameleon", "Хамелеон"), text: r("Zmienia barwę i łapie owady bardzo długim językiem.", "Меняет окраску и ловит насекомых очень длинным языком.") },
  { icon: "🐢", name: r("Żółw morski", "Морская черепаха"), text: r("Ma kończyny jak płetwy; na ląd wychodzi tylko złożyć jaja na plaży.", "Конечности как ласты; на сушу выходит только отложить яйца на пляже.") },
];

const row = (pl: string, ru: string): Txt => r(pl, ru);
const L = {
  sign: row("Znak rozpoznawczy", "Как узнать"),
  pupil: row("Źrenica", "Зрачок"),
  eyelids: row("Powieki", "Веки"),
  venom: row("Jad", "Яд"),
  what: row("Co robić", "Что делать"),
};

const CARDS: CompareCard[] = [
  {
    id: "viper",
    icon: "⚠️",
    name: r("Żmija", "Гадюка"),
    rows: [
      { label: L.sign, value: row("ciemny zygzak na grzbiecie", "тёмный зигзаг на спине") },
      { label: L.pupil, value: row("pionowa, jak u kota", "вертикальная, как у кошки") },
      { label: L.eyelids, value: row("brak — to wąż", "нет — это змея") },
      { label: L.venom, value: row("jadowita", "ядовита") },
      { label: L.what, value: row("spokojnie odejdź; po ukąszeniu — natychmiast do lekarza", "спокойно отойди; после укуса — сразу к врачу") },
    ],
    text: row("Żmija atakuje tylko w obronie. Nie wolno jej łapać ani zabijać — jest chroniona.", "Гадюка нападает только защищаясь. Её нельзя ловить и убивать — она охраняется."),
  },
  {
    id: "grass",
    icon: "🐍",
    name: r("Zaskroniec", "Уж"),
    rows: [
      { label: L.sign, value: row("żółte lub pomarańczowe plamy po bokach głowy", "жёлтые или оранжевые пятна по бокам головы") },
      { label: L.pupil, value: row("okrągła", "круглая") },
      { label: L.eyelids, value: row("brak — to wąż", "нет — это змея") },
      { label: L.venom, value: row("niejadowity", "неядовит") },
      { label: L.what, value: row("możesz spokojnie obserwować z daleka", "можно спокойно понаблюдать издалека") },
    ],
    text: row("Zaskroniec żyje przy wodzie i poluje na żaby i ryby. Przestraszony udaje martwego.", "Уж живёт у воды и охотится на лягушек и рыбу. Испугавшись, притворяется мёртвым."),
  },
  {
    id: "slow",
    icon: "🪱",
    name: r("Padalec", "Веретеница"),
    rows: [
      { label: L.sign, value: row("gładkie, błyszczące, brązowe ciało bez nóg", "гладкое блестящее коричневое тело без ног") },
      { label: L.pupil, value: row("okrągła", "круглая") },
      { label: L.eyelids, value: row("ma — mruga! To jaszczurka", "есть — моргает! Это ящерица") },
      { label: L.venom, value: row("niejadowity", "неядовита") },
      { label: L.what, value: row("nie łap za ogon — może go odrzucić", "не хватай за хвост — может его отбросить") },
    ],
    text: row("Padalec to beznoga jaszczurka: ma powieki i potrafi odrzucić ogon, czego węże nie umieją.", "Веретеница — безногая ящерица: у неё есть веки и она может отбросить хвост, чего змеи не умеют."),
  },
];

const WHERE: SortItem[] = [
  { name: r("jaszczurka zwinka", "прыткая ящерица"), group: 0, why: r("najpospolitsza jaszczurka w Polsce", "самая обычная ящерица Польши") },
  { name: r("krokodyl nilowy", "нильский крокодил"), group: 1, why: r("żyje w Afryce", "живёт в Африке") },
  { name: r("żmija zygzakowata", "обыкновенная гадюка"), group: 0, why: r("spotkasz ją np. na wrzosowiskach i w lasach", "её можно встретить на пустошах и в лесах") },
  { name: r("kameleon", "хамелеон"), group: 1, why: r("głównie Afryka i Madagaskar", "в основном Африка и Мадагаскар") },
  { name: r("żółw błotny", "болотная черепаха"), group: 0, why: r("rzadki, żyje m.in. na Polesiu", "редкая, живёт, например, на Полесье") },
  { name: r("żółw morski", "морская черепаха"), group: 1, why: r("ciepłe morza i oceany", "тёплые моря и океаны") },
  { name: r("zaskroniec", "уж"), group: 0, why: r("pospolity przy stawach i rzekach", "обычен у прудов и рек") },
  { name: r("waran z Komodo", "комодский варан"), group: 1, why: r("największa jaszczurka świata, z Indonezji", "самая крупная ящерица мира, из Индонезии") },
];

const REMEMBER: Record<"s1" | "s2" | "s3", Txt[]> = {
  s1: [
    { pl: "Gady zjadają owady i gryzonie; z jadu węży wytwarza się leki.", ru: "Пресмыкающиеся поедают насекомых и грызунов; из змеиного яда делают лекарства." },
    { pl: "Wszystkie gady w Polsce są chronione.", ru: "Все пресмыкающиеся Польши охраняются." },
  ],
  s2: [{ pl: "Jedyny jadowity wąż w Polsce to żmija zygzakowata. Padalec to jaszczurka, nie wąż.", ru: "Единственная ядовитая змея Польши — обыкновенная гадюка. Веретеница — ящерица, а не змея." }],
  s3: [{ pl: "Większość gatunków gadów żyje w ciepłym klimacie, bo są zmiennocieplne.", ru: "Большинство видов пресмыкающихся живёт в тёплом климате, потому что они холоднокровны." }],
};

export default function ReptileDiversityLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="reptd" sections={[T.s1, T.s2, T.s3]} />
      <Section id="reptd-s1" n={1} title={T.s1[lang]}>
        <SpeciesGallery lang={lang} items={SPECIES} hint={SPECIES_HINT} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="reptd-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={CARDS} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="reptd-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s3} groups={[T.yes, T.no]} items={WHERE} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
    </div>
  );
}
