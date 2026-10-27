// Lesson for §28 "Czasy stanisławowskie" (Historia 6, GWO). Names and dates follow the task bank
// of the same paragraph (templates/data/ch5.ts, STANISLAUS and STANISLAUS_DATES).
import {
  CompareTabs,
  LessonIntro,
  MatchQuiz,
  OrderGame,
  Remember,
  Section,
  SpeciesGallery,
  Timeline,
  type CompareCard,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type Species,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Po I rozbiorze Rzeczpospolita była okrojona i zależna od Rosji, a mimo to przeżywała rozkwit kultury. Powstało pierwsze w Europie ministerstwo oświaty, w Warszawie grał publiczny teatr, a poeci i publicyści oświecenia uczyli rodaków myśleć o państwie. Ten okres nazywamy czasami stanisławowskimi.",
    "После первого раздела Речь Посполитая была урезана и зависима от России, и всё же переживала расцвет культуры. Возникло первое в Европе министерство просвещения, в Варшаве играл публичный театр, а поэты и публицисты Просвещения учили соотечественников думать о государстве. Этот период называют эпохой Станислава Августа.",
  ),
  s1: r("Komisja Edukacji Narodowej", "Комиссия национального образования"),
  s1intro: r("Jak powstała i działała pierwsza władza oświatowa w Europie? Ułóż kroki po kolei.", "Как возникло и работало первое в Европе ведомство просвещения? Расставь шаги по порядку."),
  s2: r("Ludzie polskiego oświecenia", "Люди польского Просвещения"),
  s2intro: r("Poeci, publicyści, reformatorzy. Dopasuj opis do nazwiska.", "Поэты, публицисты, реформаторы. Подбери описание к фамилии."),
  s3: r("Warszawa Stanisława Augusta", "Варшава Станислава Августа"),
  s3intro: r("Miejsca i instytucje, w których tętniło życie stolicy. Otwórz karty.", "Места и учреждения, где кипела жизнь столицы. Открой карточки."),
  s4: r("Barok czy klasycyzm?", "Барокко или классицизм?"),
  s4intro: r("Dwa style, które widać w Polsce do dziś. Porównaj je w zakładkach.", "Два стиля, которые видны в Польше до сих пор. Сравни их на вкладках."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Ułóż wydarzenia czasów stanisławowskich od najwcześniejszego.", "Расставь события эпохи Станислава Августа от самого раннего."),
  order: r("Jak powstała KEN", "Как возникла КЭН"),
  orderHint: r("Zacznij od decyzji papieża.", "Начни с решения папы."),
  who: r("Twórcy oświecenia", "Деятели Просвещения"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  timeline: r("Czasy stanisławowskie rok po roku", "Эпоха Станислава Августа год за годом"),
  when: r("Kiedy", "Когда"),
  model: r("Wzór", "Образец"),
  shapes: r("Kształty", "Формы"),
  mood: r("Nastrój", "Настроение"),
  example: r("Przykład", "Пример"),
} satisfies Record<string, Txt>;

const STEPS: Txt[] = [
  r("1773 — papież rozwiązuje zakon jezuitów", "1773 — папа распускает орден иезуитов"),
  r("szkoły i majątek jezuitów zostają bez gospodarza", "школы и имущество иезуитов остаются без хозяина"),
  r("1773 — sejm powołuje Komisję Edukacji Narodowej", "1773 — сейм создаёт Комиссию национального образования"),
  r("Towarzystwo do Ksiąg Elementarnych pisze nowe podręczniki", "Общество элементарных книг пишет новые учебники"),
  r("Kołłątaj reformuje Akademię Krakowską", "Коллонтай реформирует Краковскую академию"),
  r("w szkołach uczy się po polsku nauk przyrodniczych i historii", "в школах учат по-польски естественным наукам и истории"),
];

const WHO_OPTIONS: QuizOption[] = [
  { id: "krasicki", label: r("Ignacy Krasicki", "Игнаций Красицкий") },
  { id: "karpinski", label: r("Franciszek Karpiński", "Францишек Карпинский") },
  { id: "boguslawski", label: r("Wojciech Bogusławski", "Войцех Богуславский") },
  { id: "staszic", label: r("Stanisław Staszic", "Станислав Сташиц") },
  { id: "kollataj", label: r("Hugo Kołłątaj", "Гуго Коллонтай") },
  { id: "naruszewicz", label: r("Adam Naruszewicz", "Адам Нарушевич") },
];

const WHO: QuizItem[] = [
  { icon: "🦊", name: r("biskup, „książę poetów”, autor bajek i „Monachomachii”", "епископ, «князь поэтов», автор басен и «Монахомахии»"), answer: "krasicki", explain: r("Ignacy Krasicki w bajkach („Ptaszki w klatce”, „Szczur i kot”) śmiał się z ludzkich wad; w „Monachomachii” — z leniwych mnichów.", "Игнаций Красицкий в баснях («Птички в клетке», «Крыса и кот») смеялся над людскими пороками; в «Монахомахии» — над ленивыми монахами.") },
  { icon: "🎄", name: r("poeta sentymentalny, autor kolędy „Bóg się rodzi”", "поэт-сентименталист, автор колядки «Бог рождается»"), answer: "karpinski", explain: r("Franciszek Karpiński pisał o uczuciach i wsi; jego „Laura i Filon” to najsłynniejsza polska sielanka.", "Францишек Карпинский писал о чувствах и деревне; его «Лаура и Филон» — самая известная польская идиллия.") },
  { icon: "🎭", name: r("aktor i dyrektor Teatru Narodowego, „ojciec teatru polskiego”", "актёр и директор Национального театра, «отец польского театра»"), answer: "boguslawski", explain: r("Wojciech Bogusławski wystawił w 1794 roku „Krakowiaków i Górali” — sztukę, która dodawała ducha przed insurekcją.", "Войцех Богуславский поставил в 1794 году «Краковяков и горцев» — пьесу, поднимавшую дух накануне восстания.") },
  { icon: "📜", name: r("ksiądz z rodziny mieszczańskiej, autor „Uwag nad życiem Jana Zamoyskiego”", "священник из мещанской семьи, автор «Замечаний о жизни Яна Замойского»"), answer: "staszic", explain: r("Stanisław Staszic żądał zniesienia liberum veto, praw dla mieszczan i opieki nad chłopami.", "Станислав Сташиц требовал отмены либерум вето, прав для горожан и защиты крестьян.") },
  { icon: "🏫", name: r("reformator Akademii Krakowskiej z ramienia KEN", "реформатор Краковской академии по поручению КЭН"), answer: "kollataj", explain: r("Hugo Kołłątaj wprowadził na uczelni wykłady po polsku i nauki przyrodnicze; później współtworzył Konstytucję 3 maja.", "Гуго Коллонтай ввёл в университете лекции по-польски и естественные науки; позже участвовал в создании Конституции 3 мая.") },
  { icon: "📚", name: r("biskup i historyk, autor wielotomowej „Historii narodu polskiego”", "епископ и историк, автор многотомной «Истории польского народа»"), answer: "naruszewicz", explain: r("Adam Naruszewicz pisał na zamówienie króla; był stałym gościem obiadów czwartkowych.", "Адам Нарушевич писал по заказу короля; был постоянным гостем четверговых обедов.") },
];

const PLACES: Species[] = [
  { icon: "🏰", name: r("Zamek Królewski", "Королевский замок"), tag: r("siedziba króla", "резиденция короля"), text: r("Przebudowany za Stanisława Augusta; w jego salach odbywały się obiady czwartkowe i obrady sejmu, a 3 maja 1791 roku uchwalono tu konstytucję.", "Перестроен при Станиславе Августе; в его залах проходили четверговые обеды и заседания сейма, а 3 мая 1791 года здесь приняли конституцию.") },
  { icon: "🌳", name: r("Łazienki Królewskie", "Королевские Лазенки"), tag: r("klasycyzm", "классицизм"), text: r("Letnia rezydencja króla: Pałac na Wyspie, park i teatr na wodzie. Wzór polskiego klasycyzmu.", "Летняя резиденция короля: Дворец на острове, парк и театр на воде. Образец польского классицизма.") },
  { icon: "🎭", name: r("Teatr Narodowy (1765)", "Национальный театр (1765)"), tag: r("scena publiczna", "публичная сцена"), text: r("Pierwszy stały teatr publiczny w Polsce, dostępny za biletem dla każdego. Grano w nim po polsku komedie wyśmiewające wady szlachty.", "Первый постоянный публичный театр в Польше, доступный по билету каждому. В нём играли по-польски комедии, высмеивавшие пороки шляхты.") },
  { icon: "📰", name: r("„Monitor” (1765)", "«Монитор» (1765)"), tag: r("czasopismo", "журнал"), text: r("Gazeta wydawana z poparciem króla, która krytykowała sarmackie przesądy i uczyła, jak naprawić państwo.", "Газета, выходившая при поддержке короля; критиковала сарматские предрассудки и учила, как исправить государство.") },
  { icon: "⚖️", name: r("Rada Nieustająca (1775)", "Постоянный совет (1775)"), tag: r("rząd", "правительство"), text: r("Pierwszy stały rząd Rzeczypospolitej: król i 36 członków. Niestety nadzorował go poseł rosyjski, więc szlachta nazywała ją „Zdradą Nieustającą”.", "Первое постоянное правительство Речи Посполитой: король и 36 членов. Увы, за ним следил русский посол, и шляхта звала его «Постоянной изменой».") },
  { icon: "🖨️", name: r("Drukarnie i gazety", "Типографии и газеты"), tag: r("oświecenie", "Просвещение"), text: r("W Warszawie przybywało drukarni, księgarń i czasopism; czytanie gazet stało się modne wśród szlachty i mieszczan.", "В Варшаве прибавлялось типографий, книжных лавок и журналов; читать газеты стало модно среди шляхты и горожан.") },
];

const STYLES: CompareCard[] = [
  {
    id: "barok",
    icon: "✨",
    name: r("Barok", "Барокко"),
    rows: [
      { label: T.when, value: r("XVII wiek i pierwsza połowa XVIII wieku", "XVII век и первая половина XVIII века") },
      { label: T.model, value: r("Kościół kontrreformacji — olśnić i poruszyć wiernych", "церковь Контрреформации — поразить и взволновать верующих") },
      { label: T.shapes, value: r("faliste linie, przepych, złoto, rzeźby, ruch", "волнистые линии, роскошь, золото, скульптуры, движение") },
      { label: T.mood, value: r("emocje, przepych, kontrast światła i cienia", "эмоции, пышность, контраст света и тени") },
      { label: T.example, value: r("kościół św. Piotra i Pawła w Krakowie, pałac w Wilanowie", "костёл св. Петра и Павла в Кракове, дворец в Вилянове") },
    ],
  },
  {
    id: "klasycyzm",
    icon: "🏛️",
    name: r("Klasycyzm", "Классицизм"),
    rows: [
      { label: T.when, value: r("druga połowa XVIII wieku — czasy stanisławowskie", "вторая половина XVIII века — эпоха Станислава Августа") },
      { label: T.model, value: r("antyk: świątynie Grecji i Rzymu", "античность: храмы Греции и Рима") },
      { label: T.shapes, value: r("proste linie, kolumny, trójkątny fronton, symetria", "прямые линии, колонны, треугольный фронтон, симметрия") },
      { label: T.mood, value: r("spokój, rozum, umiar, jasne kolory", "спокойствие, разум, умеренность, светлые цвета") },
      { label: T.example, value: r("Łazienki — Pałac na Wyspie, kościół ewangelicki w Warszawie", "Лазенки — Дворец на острове, евангелическая церковь в Варшаве") },
    ],
    text: r("Klasycyzm to styl oświecenia: tak jak rozum ma porządkować państwo, tak symetria porządkuje budynek.", "Классицизм — стиль Просвещения: как разум должен упорядочить государство, так симметрия упорядочивает здание."),
  },
];

const EVENTS: TimelineEvent[] = [
  { name: r("otwarcie Teatru Narodowego; pierwszy numer „Monitora”", "открытие Национального театра; первый номер «Монитора»"), when: "1765" },
  { name: r("powołanie Komisji Edukacji Narodowej", "создание Комиссии национального образования"), when: "1773", note: r("po kasacie jezuitów", "после упразднения иезуитов") },
  { name: r("powołanie Rady Nieustającej", "создание Постоянного совета"), when: "1775" },
  { name: r("Kołłątaj zaczyna reformę Akademii Krakowskiej", "Коллонтай начинает реформу Краковской академии"), when: "1777" },
  { name: r("wydanie „Monachomachii” Krasickiego", "издание «Монахомахии» Красицкого"), when: "1778" },
  { name: r("wydanie „Uwag nad życiem Jana Zamoyskiego” Staszica", "издание «Замечаний о жизни Яна Замойского» Сташица"), when: "1787" },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("KEN (1773) — pierwsze w Europie ministerstwo oświaty; Towarzystwo do Ksiąg Elementarnych pisało podręczniki.", "КЭН (1773) — первое в Европе министерство просвещения; Общество элементарных книг писало учебники."),
    r("Hugo Kołłątaj zreformował Akademię Krakowską: wykłady po polsku, nauki przyrodnicze.", "Гуго Коллонтай реформировал Краковскую академию: лекции по-польски, естественные науки."),
  ],
  s2: [
    r("Ignacy Krasicki — bajki, satyry, „Monachomachia”; Franciszek Karpiński — „Bóg się rodzi”; Stanisław Staszic — „Uwagi nad życiem Jana Zamoyskiego”.", "Игнаций Красицкий — басни, сатиры, «Монахомахия»; Францишек Карпинский — «Бог рождается»; Станислав Сташиц — «Замечания о жизни Яна Замойского»."),
  ],
  s3: [
    r("Teatr Narodowy i „Monitor” — 1765; Wojciech Bogusławski — ojciec teatru polskiego.", "Национальный театр и «Монитор» — 1765; Войцех Богуславский — отец польского театра."),
    r("Rada Nieustająca (1775) — stały rząd, ale pod nadzorem posła rosyjskiego.", "Постоянный совет (1775) — постоянное правительство, но под надзором русского посла."),
  ],
  s4: [
    r("Klasycyzm naśladuje antyk: kolumny, symetria, prostota. Przykład: Łazienki Królewskie.", "Классицизм подражает античности: колонны, симметрия, простота. Пример: Королевские Лазенки."),
  ],
};

export default function StanislausLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="stanislaus" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="stanislaus-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} steps={STEPS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="stanislaus-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="stanislaus-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={PLACES} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="stanislaus-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={STYLES} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="stanislaus-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
