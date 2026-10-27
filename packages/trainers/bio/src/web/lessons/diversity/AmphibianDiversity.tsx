// Lesson for §4.4 "Przegląd i znaczenie płazów" (Puls życia 6). Species follow
// templates/data/sp6Vertebrates.ts (AMPHIBIAN_SPECIES).
import { SPECIES_HINT, SpeciesGallery, TwoWaySort, type SortItem, type Species } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });
const PROTECTED = r("chroniony", "охраняется");

const T = {
  lead: r(
    "W Polsce żyje kilkanaście gatunków płazów i wszystkie są pod ochroną. Dzielimy je na płazy bezogonowe (żaby, ropuchy, rzekotki) i ogoniaste (traszki, salamandry); w tropikach żyją jeszcze płazy beznogie. Płazy zjadają mnóstwo owadów, a same są pokarmem ptaków, węży i ssaków.",
    "В Польше живёт около двух десятков видов земноводных, и все они охраняются. Их делят на бесхвостых (лягушки, жабы, квакши) и хвостатых (тритоны, саламандры); в тропиках живут ещё безногие. Земноводные поедают массу насекомых и сами служат пищей птицам, змеям и млекопитающим.",
  ),
  s1: r("Poznaj płazy", "Познакомься с земноводными"),
  s2: r("Ogoniaste czy bezogonowe?", "Хвостатые или бесхвостые?"),
  s2intro: r("Przypisz gatunek do właściwej grupy.", "Отнеси вид к нужной группе."),
  s3: r("Jak pomóc płazom?", "Как помочь земноводным?"),
  s3intro: r(
    "Płazy giną pod kołami samochodów podczas wiosennych wędrówek do stawów i tracą miejsca do rozrodu. Co im pomaga, a co szkodzi?",
    "Земноводные гибнут под колёсами машин во время весенних переходов к прудам и теряют места для размножения. Что им помогает, а что вредит?",
  ),
  tailed: r("ogoniaste", "хвостатые"),
  tailless: r("bezogonowe", "бесхвостые"),
  helps: r("pomaga", "помогает"),
  harms: r("szkodzi", "вредит"),
} satisfies Record<string, Txt>;

const SPECIES: Species[] = [
  { icon: "🐸", name: r("Żaba trawna", "Травяная лягушка"), text: r("Pospolita brunatna żaba; poza okresem godów żyje na łąkach i w lasach.", "Обычная бурая лягушка; вне брачного периода живёт на лугах и в лесах."), tag: PROTECTED },
  { icon: "🐸", name: r("Żaba wodna", "Зелёная лягушка"), text: r("Zielona żaba, która spędza większość życia w wodzie lub tuż przy niej.", "Зелёная лягушка, проводящая большую часть жизни в воде или рядом с ней."), tag: PROTECTED },
  { icon: "🟤", name: r("Ropucha szara", "Серая жаба"), text: r("Ma suchą, brodawkowatą skórę z gruczołami jadowymi; nocą poluje na ślimaki i owady.", "Сухая бугристая кожа с ядовитыми железами; ночью охотится на слизней и насекомых."), tag: PROTECTED },
  { icon: "🌿", name: r("Rzekotka drzewna", "Квакша"), text: r("Mała zielona żaba z przylgami na palcach — wspina się na drzewa i krzewy.", "Маленькая зелёная лягушка с присосками на пальцах — лазает по деревьям и кустам."), tag: PROTECTED },
  { icon: "🔴", name: r("Kumak nizinny", "Краснобрюхая жерлянка"), text: r("Jaskrawy, czerwono-czarny brzuch ostrzega drapieżniki, że kumak jest trujący.", "Яркое красно-чёрное брюшко предупреждает хищников, что жерлянка ядовита."), tag: PROTECTED },
  { icon: "🦎", name: r("Traszka zwyczajna", "Обыкновенный тритон"), text: r("Płaz ogoniasty; samiec ma wiosną falisty grzebień na grzbiecie.", "Хвостатое земноводное; у самца весной на спине волнистый гребень."), tag: PROTECTED },
  { icon: "🖤", name: r("Salamandra plamista", "Огненная саламандра"), text: r("Czarna w żółte plamy, żyje w wilgotnych lasach górskich; rodzi larwy do strumieni.", "Чёрная в жёлтых пятнах, живёт в сырых горных лесах; рождает личинок в ручьи."), tag: PROTECTED },
  { icon: "🧄", name: r("Grzebiuszka ziemna", "Чесночница"), text: r("Zakopuje się w ziemi, a w razie zagrożenia pachnie czosnkiem.", "Закапывается в землю, а при опасности пахнет чесноком."), tag: PROTECTED },
  { icon: "🪱", name: r("Płazy beznogie", "Безногие земноводные"), text: r("Tropikalne płazy bez kończyn, podobne do dżdżownic; żyją w ziemi.", "Тропические земноводные без конечностей, похожие на дождевых червей; живут в почве.") },
];

const TAIL: SortItem[] = [
  { name: r("traszka zwyczajna", "обыкновенный тритон"), group: 0, why: r("ma ogon przez całe życie", "хвост сохраняется всю жизнь") },
  { name: r("ropucha szara", "серая жаба"), group: 1, why: r("dorosła nie ma ogona", "у взрослой нет хвоста") },
  { name: r("salamandra plamista", "огненная саламандра"), group: 0, why: r("płaz ogoniasty", "хвостатое земноводное") },
  { name: r("rzekotka drzewna", "квакша"), group: 1, why: r("płaz bezogonowy", "бесхвостое земноводное") },
  { name: r("żaba trawna", "травяная лягушка"), group: 1, why: r("ogon ma tylko kijanka", "хвост есть только у головастика") },
  { name: r("traszka grzebieniasta", "гребенчатый тритон"), group: 0, why: r("największa traszka w Polsce", "самый крупный тритон Польши") },
  { name: r("kumak nizinny", "краснобрюхая жерлянка"), group: 1, why: r("płaz bezogonowy", "бесхвостое земноводное") },
  { name: r("grzebiuszka ziemna", "чесночница"), group: 1, why: r("płaz bezogonowy", "бесхвостое земноводное") },
];

const HELP: SortItem[] = [
  { name: r("płotki i tunele pod drogami przy stawach", "заборчики и тоннели под дорогами у прудов"), group: 0, why: r("płazy bezpiecznie przechodzą pod jezdnią", "земноводные безопасно проходят под дорогой") },
  { name: r("osuszanie małych stawów i mokradeł", "осушение маленьких прудов и болот"), group: 1, why: r("płazy tracą miejsca do składania skrzeku", "земноводные теряют места для икрометания") },
  { name: r("wiosenne przenoszenie płazów przez drogę z opiekunem", "весенний перенос земноводных через дорогу со взрослым", ), group: 0, why: r("tak działają wolontariusze w całej Polsce", "так работают волонтёры по всей Польше") },
  { name: r("wypalanie traw wiosną", "весенние палы травы"), group: 1, why: r("giną płazy ukryte w trawie", "гибнут земноводные, спрятавшиеся в траве") },
  { name: r("oczko wodne w ogrodzie bez ryb", "пруд в саду без рыб"), group: 0, why: r("miejsce do rozrodu; ryby zjadałyby skrzek", "место для размножения; рыбы съели бы икру") },
  { name: r("opryskiwanie pól środkami chemicznymi", "опрыскивание полей химикатами"), group: 1, why: r("przez cienką skórę trucizny łatwo dostają się do ciała", "через тонкую кожу яды легко проникают в тело") },
  { name: r("sterta liści i gałęzi w kącie ogrodu", "куча листьев и веток в углу сада"), group: 0, why: r("kryjówka i miejsce na zimę", "укрытие и место для зимовки") },
  { name: r("wypuszczanie złotych rybek do stawu w parku", "выпускать золотых рыбок в парковый пруд"), group: 1, why: r("obce ryby zjadają skrzek i kijanki", "чужие рыбы поедают икру и головастиков") },
];

const REMEMBER: Record<"s1" | "s2" | "s3", Txt[]> = {
  s1: [
    { pl: "Wszystkie płazy w Polsce są chronione.", ru: "Все земноводные Польши охраняются." },
    { pl: "Płazy zjadają owady i ślimaki — są sprzymierzeńcami rolników.", ru: "Земноводные поедают насекомых и слизней — они помощники земледельцев." },
  ],
  s2: [{ pl: "Płazy: bezogonowe (żaby, ropuchy), ogoniaste (traszki, salamandry) i beznogie.", ru: "Земноводные: бесхвостые (лягушки, жабы), хвостатые (тритоны, саламандры) и безногие." }],
  s3: [{ pl: "Zagrożenia płazów: ruch drogowy, osuszanie mokradeł, chemia, wypalanie traw.", ru: "Угрозы для земноводных: автодороги, осушение болот, химикаты, палы травы." }],
};

export default function AmphibianDiversityLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="amphd" sections={[T.s1, T.s2, T.s3]} />
      <Section id="amphd-s1" n={1} title={T.s1[lang]}>
        <SpeciesGallery lang={lang} items={SPECIES} hint={SPECIES_HINT} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="amphd-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s2} groups={[T.tailed, T.tailless]} items={TAIL} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="amphd-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={r("🛡 Pomaga czy szkodzi?", "🛡 Помогает или вредит?")} groups={[T.helps, T.harms]} items={HELP} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
    </div>
  );
}
