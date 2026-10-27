// Lesson for §22 "Nowe potęgi w Europie" (Historia 6, GWO). Terms, people and dates follow the
// task bank of the same paragraph (templates/data/ch4.ts, POWERS and POWERS_DATES).
import {
  CompareTabs,
  LessonIntro,
  MatchQuiz,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type CompareCard,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type SortItem,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "W XVIII wieku na mapie Europy wyrosły trzy nowe potęgi: Rosja Piotra I i Katarzyny II, Prusy Fryderyka II oraz Austria Marii Teresy. Każde z tych państw budowało wielką armię, sprawny skarb i posłuszną administrację. Dla Rzeczypospolitej, która nie miała ani jednego, ani drugiego, byli to groźni sąsiedzi.",
    "В XVIII веке на карте Европы выросли три новые державы: Россия Петра I и Екатерины II, Пруссия Фридриха II и Австрия Марии Терезии. Каждое из этих государств строило большую армию, исправную казну и послушную администрацию. Для Речи Посполитой, у которой не было ни того, ни другого, это были опасные соседи.",
  ),
  s1: r("Trzy potęgi", "Три державы"),
  s1intro: r("Przełącz zakładki i porównaj, na czym każde państwo budowało swoją siłę.", "Переключай вкладки и сравни, на чём каждое государство строило свою силу."),
  s2: r("Reformy Piotra I", "Реформы Петра I"),
  s2intro: r("Car Piotr chciał przerobić Rosję na wzór Zachodu. Prawda czy fałsz?", "Царь Пётр хотел переделать Россию по образцу Запада. Правда или ложь?"),
  s3: r("Kto to był?", "Кто это был?"),
  s3intro: r("Sześcioro władców, którzy zmienili XVIII-wieczną Europę.", "Шесть правителей, изменивших Европу XVIII века."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Wojna siedmioletnia", "Семилетняя война"),
  s5intro: r(
    "W latach 1756–1763 cała Europa podzieliła się na dwa obozy. Kto walczył po której stronie?",
    "В 1756–1763 годах вся Европа разделилась на два лагеря. Кто сражался на чьей стороне?",
  ),
  tf: r("Car reformator", "Царь-реформатор"),
  who: r("Władcy XVIII wieku", "Правители XVIII века"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inny władca. Spróbuj jeszcze raz.", "это другой правитель. Попробуй ещё раз."),
  timeline: r("Nowe potęgi rok po roku", "Новые державы год за годом"),
  sort: r("Dwa obozy", "Два лагеря"),
  sortHint: r("Prusy chciały utrzymać Śląsk; Austria chciała go odzyskać — i znalazła sojuszników.", "Пруссия хотела удержать Силезию; Австрия хотела её вернуть — и нашла союзников."),
  prussia: r("po stronie Prus", "на стороне Пруссии"),
  austria: r("po stronie Austrii", "на стороне Австрии"),
} satisfies Record<string, Txt>;

const STATES: CompareCard[] = [
  {
    id: "rosja",
    icon: "🐻",
    name: r("Rosja", "Россия"),
    rows: [
      { label: r("Dynastia", "Династия"), value: r("Romanowowie", "Романовы") },
      { label: r("Stolica", "Столица"), value: r("Petersburg (od 1712; założony 1703)", "Санкт-Петербург (с 1712; основан в 1703)") },
      { label: r("Najważniejsi władcy", "Главные правители"), value: r("Piotr I Wielki, Katarzyna II Wielka", "Пётр I Великий, Екатерина II Великая") },
      { label: r("Na czym budowano potęgę", "На чём строили могущество"), value: r("reformy na wzór Zachodu, nowa armia i flota, dostęp do Bałtyku", "реформы по западному образцу, новая армия и флот, выход к Балтике") },
      { label: r("Główna wojna", "Главная война"), value: r("wojna północna ze Szwecją 1700–1721, Połtawa 1709", "Северная война со Швецией 1700–1721, Полтава 1709") },
      { label: r("Tytuł władcy", "Титул правителя"), value: r("od 1721 cesarz (imperator)", "с 1721 император") },
    ],
    text: r("Piotr I „wyrąbał okno na Europę”: Rosja stała się państwem, z którym liczył się cały kontynent.", "Пётр I «прорубил окно в Европу»: Россия стала государством, с которым считался весь континент."),
  },
  {
    id: "prusy",
    icon: "🦅",
    name: r("Prusy", "Пруссия"),
    rows: [
      { label: r("Dynastia", "Династия"), value: r("Hohenzollernowie", "Гогенцоллерны") },
      { label: r("Stolica", "Столица"), value: r("Berlin", "Берлин") },
      { label: r("Najważniejsi władcy", "Главные правители"), value: r("Fryderyk Wilhelm I „król sierżant”, Fryderyk II Wielki", "Фридрих Вильгельм I «король-солдат», Фридрих II Великий") },
      { label: r("Na czym budowano potęgę", "На чём строили могущество"), value: r("ogromna, świetnie wyćwiczona armia; oszczędny skarb; dyscyplina", "огромная, отлично обученная армия; бережливая казна; дисциплина") },
      { label: r("Główna wojna", "Главная война"), value: r("wojny śląskie z Austrią od 1740; wojna siedmioletnia 1756–1763", "Силезские войны с Австрией с 1740; Семилетняя война 1756–1763") },
      { label: r("Tytuł władcy", "Титул правителя"), value: r("król w Prusach (od 1701), potem król Prus", "король в Пруссии (с 1701), затем король Пруссии") },
    ],
    text: r("Mówiono, że Prusy to nie państwo z armią, lecz armia z państwem. Fryderyk II zdobył na Austrii bogaty Śląsk.", "Говорили, что Пруссия — не государство с армией, а армия с государством. Фридрих II отнял у Австрии богатую Силезию."),
  },
  {
    id: "austria",
    icon: "👑",
    name: r("Austria", "Австрия"),
    rows: [
      { label: r("Dynastia", "Династия"), value: r("Habsburgowie", "Габсбурги") },
      { label: r("Stolica", "Столица"), value: r("Wiedeń", "Вена") },
      { label: r("Najważniejsi władcy", "Главные правители"), value: r("Maria Teresa, Józef II", "Мария Терезия, Иосиф II") },
      { label: r("Na czym budowano potęgę", "На чём строили могущество"), value: r("reformy skarbu, armii i szkół po utracie Śląska; absolutyzm oświecony", "реформы казны, армии и школ после потери Силезии; просвещённый абсолютизм") },
      { label: r("Główna wojna", "Главная война"), value: r("wojny o Śląsk z Prusami, wojna siedmioletnia", "войны за Силезию с Пруссией, Семилетняя война") },
      { label: r("Tytuł władcy", "Титул правителя"), value: r("cesarz rzymski (Habsburgowie), król Czech i Węgier", "император Священной Римской империи (Габсбурги), король Чехии и Венгрии") },
    ],
    text: r("Józef II ogłosił tolerancję religijną, zniósł poddaństwo chłopów i nakazał obowiązek szkolny — wzór władcy oświeconego.", "Иосиф II объявил веротерпимость, отменил крепостную зависимость крестьян и ввёл обязательное обучение — образец просвещённого правителя."),
  },
];

const PETER: Statement[] = [
  { text: r("Piotr I sam pracował jako cieśla w stoczniach Holandii i Anglii.", "Пётр I сам работал плотником на верфях Голландии и Англии."), truth: true, why: r("Podczas „wielkiego poselstwa” car uczył się budowy okrętów, by zbudować rosyjską flotę.", "Во время «Великого посольства» царь учился строить корабли, чтобы создать российский флот.") },
  { text: r("Nową stolicę, Petersburg, założono nad Morzem Czarnym.", "Новую столицу, Петербург, основали на Чёрном море."), truth: false, why: r("Petersburg leży nad Newą, przy Bałtyku — to było „okno na Europę”.", "Петербург стоит на Неве, у Балтики — это было «окно в Европу».") },
  { text: r("Piotr I kazał bojarom golić brody i nosić zachodnie stroje.", "Пётр I велел боярам брить бороды и носить западную одежду."), truth: true, why: r("Kto chciał zachować brodę, musiał płacić specjalny podatek.", "Кто хотел сохранить бороду, должен был платить особый налог.") },
  { text: r("W wojnie północnej Rosja walczyła z Turcją.", "В Северной войне Россия воевала с Турцией."), truth: false, why: r("Przeciwnikiem była Szwecja Karola XII; rozstrzygnęła bitwa pod Połtawą w 1709 roku.", "Противником была Швеция Карла XII; исход решила Полтавская битва 1709 года.") },
  { text: r("Po wojnie północnej Piotr I przyjął tytuł cesarza.", "После Северной войны Пётр I принял титул императора."), truth: true, why: r("W 1721 roku Rosja stała się Imperium Rosyjskim.", "В 1721 году Россия стала Российской империей.") },
  { text: r("Reformy Piotra I zniosły poddaństwo chłopów.", "Реформы Петра I отменили крепостную зависимость крестьян."), truth: false, why: r("Przeciwnie: chłopi dźwigali ciężar reform — podatki, pobór do wojska, budowę Petersburga.", "Наоборот: крестьяне несли бремя реформ — налоги, рекрутчину, строительство Петербурга.") },
];

const WHO_OPTIONS: QuizOption[] = [
  { id: "piotr", label: r("Piotr I", "Пётр I") },
  { id: "katarzyna", label: r("Katarzyna II", "Екатерина II") },
  { id: "fw1", label: r("Fryderyk Wilhelm I", "Фридрих Вильгельм I") },
  { id: "fryderyk", label: r("Fryderyk II", "Фридрих II") },
  { id: "teresa", label: r("Maria Teresa", "Мария Терезия") },
  { id: "jozef", label: r("Józef II", "Иосиф II") },
];

const WHO: QuizItem[] = [
  { icon: "⚓", name: r("car, który założył Petersburg i pokonał Szwedów pod Połtawą", "царь, основавший Петербург и разбивший шведов под Полтавой"), answer: "piotr", explain: r("Piotr I Wielki uczynił Rosję potęgą i w 1721 roku przyjął tytuł cesarza.", "Пётр I Великий сделал Россию державой и в 1721 году принял титул императора.") },
  { icon: "👒", name: r("caryca, władczyni oświecona, która brała udział w rozbiorach Polski", "императрица, просвещённая правительница, участвовавшая в разделах Польши"), answer: "katarzyna", explain: r("Katarzyna II korespondowała z Wolterem, ale rządziła twardą ręką.", "Екатерина II переписывалась с Вольтером, но правила твёрдой рукой.") },
  { icon: "🥾", name: r("„król sierżant”, który rozbudował pruską armię i oszczędzał każdy grosz", "«король-солдат», расширивший прусскую армию и экономивший каждый грош"), answer: "fw1", explain: r("Fryderyk Wilhelm I zostawił synowi pełny skarb i jedną z najlepszych armii Europy.", "Фридрих Вильгельм I оставил сыну полную казну и одну из лучших армий Европы.") },
  { icon: "🎖️", name: r("król Prus, który odebrał Austrii Śląsk", "король Пруссии, отнявший у Австрии Силезию"), answer: "fryderyk", explain: r("Fryderyk II Wielki — wódz, filozof i władca oświecony, przyjaciel Woltera.", "Фридрих II Великий — полководец, философ и просвещённый правитель, друг Вольтера.") },
  { icon: "👸", name: r("władczyni Austrii, matka szesnaściorga dzieci, która zreformowała państwo po utracie Śląska", "правительница Австрии, мать шестнадцати детей, реформировавшая государство после потери Силезии"), answer: "teresa", explain: r("Maria Teresa rządziła 40 lat; jej córką była Maria Antonina, królowa Francji.", "Мария Терезия правила 40 лет; её дочерью была Мария-Антуанетта, королева Франции.") },
  { icon: "📖", name: r("cesarz, który ogłosił tolerancję religijną i zniósł poddaństwo chłopów", "император, объявивший веротерпимость и отменивший крепостную зависимость крестьян"), answer: "jozef", explain: r("Józef II, syn Marii Teresy, był wzorem władcy oświeconego.", "Иосиф II, сын Марии Терезии, был образцом просвещённого правителя.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("początek wojny północnej", "начало Северной войны"), when: "1700" },
  { name: r("założenie Petersburga", "основание Санкт-Петербурга"), when: "1703" },
  { name: r("bitwa pod Połtawą", "Полтавская битва"), when: "1709", note: r("klęska Karola XII", "поражение Карла XII") },
  { name: r("koniec wojny północnej; Piotr I cesarzem", "конец Северной войны; Пётр I — император"), when: "1721" },
  { name: r("Fryderyk II i Maria Teresa obejmują władzę", "Фридрих II и Мария Терезия приходят к власти"), when: "1740", note: r("początek wojen śląskich", "начало Силезских войн") },
  { name: r("początek wojny siedmioletniej", "начало Семилетней войны"), when: "1756" },
  { name: r("Katarzyna II na tronie Rosji", "Екатерина II на российском троне"), when: "1762" },
];

const SIDES: SortItem[] = [
  { name: r("Wielka Brytania", "Великобритания"), group: 0, why: r("płaciła Prusom za walkę z Francją w Europie, sama walczyła z nią w koloniach", "платила Пруссии за войну с Францией в Европе, сама воевала с ней в колониях") },
  { name: r("Francja", "Франция"), group: 1, why: r("dawny wróg Habsburgów tym razem stanął po ich stronie", "давний враг Габсбургов на этот раз встал на их сторону") },
  { name: r("Rosja", "Россия"), group: 1, why: r("caryca Elżbieta walczyła z Prusami; po jej śmierci w 1762 roku Rosja wycofała się z wojny", "императрица Елизавета воевала с Пруссией; после её смерти в 1762 году Россия вышла из войны") },
  { name: r("Hanower", "Ганновер"), group: 0, why: r("niemieckie państwo króla Wielkiej Brytanii", "немецкое государство короля Великобритании") },
  { name: r("Saksonia", "Саксония"), group: 1, why: r("sąsiad Prus, zajęty przez Fryderyka II na początku wojny", "сосед Пруссии, занятый Фридрихом II в начале войны") },
  { name: r("Szwecja", "Швеция"), group: 1, why: r("chciała odzyskać Pomorze od Prus", "хотела вернуть Померанию у Пруссии") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Rosja — Romanowowie, Petersburg; Prusy — Hohenzollernowie, Berlin; Austria — Habsburgowie, Wiedeń.", "Россия — Романовы, Петербург; Пруссия — Гогенцоллерны, Берлин; Австрия — Габсбурги, Вена."),
    r("Wspólna recepta na potęgę: wielka armia stała, sprawny skarb, posłuszni urzędnicy.", "Общий рецепт могущества: большая постоянная армия, исправная казна, послушные чиновники."),
  ],
  s2: [
    r("Piotr I: reformy na wzór Zachodu, Petersburg 1703, Połtawa 1709, tytuł cesarza 1721.", "Пётр I: реформы по западному образцу, Петербург 1703, Полтава 1709, титул императора 1721."),
    r("Wojna północna (1700–1721) dała Rosji Bałtyk, a odebrała Szwecji potęgę.", "Северная война (1700–1721) дала России Балтику и отняла у Швеции могущество."),
  ],
  s3: [
    r("Absolutyzm oświecony: Fryderyk II, Katarzyna II, Józef II — reformy, ale cała władza u monarchy.", "Просвещённый абсолютизм: Фридрих II, Екатерина II, Иосиф II — реформы, но вся власть у монарха."),
  ],
  s5: [
    r("Wojna siedmioletnia 1756–1763: Prusy i Wielka Brytania przeciw Austrii, Francji i Rosji.", "Семилетняя война 1756–1763: Пруссия и Великобритания против Австрии, Франции и России."),
    r("Prusy zatrzymały Śląsk; Wielka Brytania odebrała Francji Kanadę i Indie.", "Пруссия удержала Силезию; Великобритания отняла у Франции Канаду и Индию."),
  ],
};

export default function PowersLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="powers" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="powers-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={STATES} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="powers-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={PETER} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="powers-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="powers-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="powers-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.prussia, T.austria]} items={SIDES} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
