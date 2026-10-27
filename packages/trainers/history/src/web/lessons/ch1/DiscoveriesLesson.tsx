// Lesson for §1 "Wielkie odkrycia geograficzne" (Historia 6, GWO). Terms, people and dates follow
// the task bank of the same paragraph (templates/data/ch1.ts, DISCOVERIES and DISCOVERIES_DATES).
import {
  LessonIntro,
  MatchQuiz,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type SortItem,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { VoyagesMap } from "./VoyagesMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Pod koniec XV wieku Europejczycy wypłynęli na oceany. Szukali morskiej drogi do Indii — kraju przypraw — a znaleźli nowy kontynent. W ciągu kilkudziesięciu lat mapa świata zmieniła się nie do poznania.",
    "В конце XV века европейцы вышли в океаны. Они искали морской путь в Индию — страну пряностей, — а нашли новый континент. За несколько десятилетий карта мира изменилась до неузнаваемости.",
  ),
  s1: r("Dlaczego wyruszyli?", "Почему они отправились?"),
  s1intro: r(
    "Przyczyny pchały żeglarzy w morze, skutki zmieniły świat po powrocie. Rozdziel jedne od drugich.",
    "Причины толкали мореплавателей в море, последствия изменили мир после возвращения. Раздели одни и другие.",
  ),
  s2: r("Cztery wielkie wyprawy", "Четыре великие экспедиции"),
  s2intro: r(
    "Dotknij trasy na mapie, żeby poznać wyprawę. Potem w trybie „Podpisz sam” sprawdź, czy pamiętasz, kto dokąd płynął.",
    "Нажми на маршрут на карте, чтобы узнать об экспедиции. Потом в режиме «Подпиши сам» проверь, помнишь ли ты, кто куда плыл.",
  ),
  s3: r("Kto to był?", "Кто это был?"),
  s3intro: r("Sześciu ludzi, którzy zmienili mapę świata. Dopasuj opis do nazwiska.", "Шесть человек, изменивших карту мира. Подбери описание к фамилии."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Co przyniosły odkrycia?", "Что принесли открытия?"),
  s5intro: r("Prawda czy fałsz? Każde zdanie dotyczy skutków odkryć geograficznych.", "Правда или ложь? Каждое утверждение — о последствиях географических открытий."),
  sort: r("Przyczyna czy skutek?", "Причина или следствие?"),
  sortHint: r("Co było przed wyprawami, a co stało się dzięki nim?", "Что было до экспедиций, а что случилось благодаря им?"),
  cause: r("przyczyna", "причина"),
  effect: r("skutek", "следствие"),
  who: r("Odkrywcy i zdobywcy", "Первооткрыватели и завоеватели"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  timeline: r("Wielkie odkrycia rok po roku", "Великие открытия год за годом"),
  tf: r("Skutki odkryć", "Последствия открытий"),
} satisfies Record<string, Txt>;

const CAUSES: SortItem[] = [
  { name: r("przyprawy z Azji były bardzo drogie", "пряности из Азии были очень дорогими"), group: 0, why: r("chciano je kupować taniej, bez pośredników", "их хотели покупать дешевле, без посредников") },
  { name: r("Turcy zajęli lądowe szlaki handlowe na Wschód", "турки заняли сухопутные торговые пути на Восток"), group: 0, why: r("trzeba było znaleźć inną, morską drogę", "нужно было найти другой, морской путь") },
  { name: r("karawela, kompas i astrolabium", "каравелла, компас и астролябия"), group: 0, why: r("nowe statki i przyrządy pozwoliły wypłynąć na ocean", "новые корабли и приборы позволили выйти в океан") },
  { name: r("chęć szerzenia chrześcijaństwa", "желание распространять христианство"), group: 0, why: r("władcy chcieli nawracać nowe ludy", "правители хотели обращать новые народы") },
  { name: r("srebro i złoto z Ameryki napłynęły do Europy", "серебро и золото из Америки хлынули в Европу"), group: 1, why: r("Hiszpania wzbogaciła się na kopalniach Nowego Świata", "Испания разбогатела на рудниках Нового Света") },
  { name: r("ziemniaki, kukurydza i pomidory w Europie", "картофель, кукуруза и помидоры в Европе"), group: 1, why: r("nowe rośliny przywieziono z Ameryki", "новые растения привезли из Америки") },
  { name: r("upadek państw Azteków i Inków", "гибель государств ацтеков и инков"), group: 1, why: r("podbili je konkwistadorzy", "их покорили конкистадоры") },
  { name: r("niewolnicy z Afryki na plantacjach Ameryki", "рабы из Африки на плантациях Америки"), group: 1, why: r("Europejczycy zaczęli handel niewolnikami przez Atlantyk", "европейцы начали работорговлю через Атлантику") },
];

const WHO_OPTIONS: QuizOption[] = [
  { id: "kolumb", label: r("Krzysztof Kolumb", "Христофор Колумб") },
  { id: "gama", label: r("Vasco da Gama", "Васко да Гама") },
  { id: "magellan", label: r("Ferdynand Magellan", "Фернан Магеллан") },
  { id: "diaz", label: r("Bartolomeu Dias", "Бартоломеу Диаш") },
  { id: "cortes", label: r("Hernán Cortés", "Эрнан Кортес") },
  { id: "pizarro", label: r("Francisco Pizarro", "Франсиско Писарро") },
];

const WHO: QuizItem[] = [
  { icon: "🧭", name: r("w 1492 roku dopłynął do Karaibów, myśląc, że to Indie", "в 1492 году доплыл до Карибов, думая, что это Индия"), answer: "kolumb", explain: r("Kolumb, genueńczyk w służbie Hiszpanii, odkrył Amerykę, choć sam o tym nie wiedział.", "Колумб, генуэзец на службе Испании, открыл Америку, хотя сам этого не знал.") },
  { icon: "🌶️", name: r("pierwszy dopłynął do Indii drogą morską wokół Afryki", "первым доплыл до Индии морским путём вокруг Африки"), answer: "gama", explain: r("Vasco da Gama w 1498 roku dotarł do Kalikatu — Portugalia zdobyła drogę do przypraw.", "Васко да Гама в 1498 году достиг Каликута — Португалия получила путь к пряностям.") },
  { icon: "🌍", name: r("dowodził pierwszą wyprawą dookoła świata, ale nie dożył jej końca", "командовал первой кругосветной экспедицией, но не дожил до её конца"), answer: "magellan", explain: r("Magellan zginął na Filipinach w 1521 roku; wyprawę dokończył Juan Sebastián Elcano.", "Магеллан погиб на Филиппинах в 1521 году; экспедицию завершил Хуан Себастьян Элькано.") },
  { icon: "🌊", name: r("pierwszy opłynął Przylądek Dobrej Nadziei", "первым обогнул мыс Доброй Надежды"), answer: "diaz", explain: r("Dias w 1488 roku dotarł na południowy kraniec Afryki i otworzył drogę na wschód.", "Диаш в 1488 году достиг южной оконечности Африки и открыл путь на восток.") },
  { icon: "🏛️", name: r("podbił państwo Azteków i zdobył Tenochtitlán", "покорил государство ацтеков и взял Теночтитлан"), answer: "cortes", explain: r("Cortés z kilkuset żołnierzami zniszczył potężne państwo Azteków w 1521 roku.", "Кортес с несколькими сотнями солдат уничтожил могущественное государство ацтеков в 1521 году.") },
  { icon: "⛰️", name: r("podbił państwo Inków w Andach", "покорил государство инков в Андах"), answer: "pizarro", explain: r("Pizarro pojmał władcę Inków Atahualpę i zajął ich państwo w Peru.", "Писарро захватил правителя инков Атауальпу и занял их государство в Перу.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("Dias opływa Przylądek Dobrej Nadziei", "Диаш огибает мыс Доброй Надежды"), when: "1488" },
  { name: r("Kolumb dopływa do Ameryki", "Колумб доплывает до Америки"), when: "1492", note: r("12 października — San Salvador", "12 октября — Сан-Сальвадор") },
  { name: r("Vasco da Gama dociera do Indii", "Васко да Гама достигает Индии"), when: "1498" },
  { name: r("Magellan wypływa z Hiszpanii", "Магеллан выходит из Испании"), when: "1519" },
  { name: r("Cortés zdobywa Tenochtitlán", "Кортес берёт Теночтитлан"), when: "1521" },
  { name: r("„Victoria” wraca — koniec podróży dookoła świata", "«Виктория» возвращается — конец кругосветного плавания"), when: "1522" },
];

const EFFECTS: Statement[] = [
  { text: r("Kolumb od razu wiedział, że odkrył nowy kontynent.", "Колумб сразу понял, что открыл новый континент."), truth: false, why: r("Do śmierci uważał, że dopłynął do Azji. Nowy kontynent rozpoznał Amerigo Vespucci — stąd nazwa Ameryka.", "До смерти он считал, что доплыл до Азии. Новый континент распознал Америго Веспуччи — отсюда название Америка.") },
  { text: r("Do Europy trafiły nieznane wcześniej rośliny: ziemniaki, kukurydza, pomidory, kakao.", "В Европу попали неизвестные раньше растения: картофель, кукуруза, помидоры, какао."), truth: true, why: r("Z czasem ziemniak stał się podstawą wyżywienia w wielu krajach Europy.", "Со временем картофель стал основой питания во многих странах Европы.") },
  { text: r("Ludność Ameryki na podboju skorzystała: Hiszpanie przynieśli jej pokój.", "Население Америки выиграло от завоевания: испанцы принесли ему мир."), truth: false, why: r("Podboje, przymusowa praca i europejskie choroby, na które Indianie nie byli odporni, wyniszczyły miliony ludzi.", "Завоевания, принудительный труд и европейские болезни, к которым индейцы не имели иммунитета, погубили миллионы людей.") },
  { text: r("Do pracy na plantacjach w Ameryce zaczęto przywozić niewolników z Afryki.", "Для работы на плантациях в Америке стали привозить рабов из Африки."), truth: true, why: r("Handel niewolnikami przez Atlantyk trwał kilkaset lat.", "Работорговля через Атлантику продолжалась несколько столетий.") },
  { text: r("Hiszpania i Portugalia stały się najbogatszymi państwami Europy XVI wieku.", "Испания и Португалия стали богатейшими государствами Европы XVI века."), truth: true, why: r("Złoto i srebro z Ameryki oraz handel przyprawami przyniosły im ogromne dochody.", "Золото и серебро из Америки и торговля пряностями принесли им огромные доходы.") },
  { text: r("Po odkryciach handel przeniósł się z Morza Śródziemnego nad Atlantyk.", "После открытий торговля переместилась со Средиземного моря на Атлантику."), truth: true, why: r("Porty takie jak Lizbona, Sewilla czy Antwerpia wyprzedziły Wenecję i Genuę.", "Порты вроде Лиссабона, Севильи и Антверпена обогнали Венецию и Геную.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Przyczyny: drogie przyprawy, zamknięte szlaki lądowe, nowe statki i przyrządy, chęć zysku i szerzenia wiary.", "Причины: дорогие пряности, закрытые сухопутные пути, новые корабли и приборы, жажда прибыли и распространения веры."),
    r("Skutki: nowe ziemie i kolonie, napływ srebra, nowe rośliny, zagłada ludów Ameryki, handel niewolnikami.", "Последствия: новые земли и колонии, приток серебра, новые растения, гибель народов Америки, работорговля."),
  ],
  s2: [
    r("Portugalczycy płynęli na wschód wokół Afryki (Dias 1488, da Gama 1498).", "Португальцы плыли на восток вокруг Африки (Диаш 1488, да Гама 1498)."),
    r("Hiszpanie płynęli na zachód (Kolumb 1492, Magellan 1519–1522).", "Испанцы плыли на запад (Колумб 1492, Магеллан 1519–1522)."),
  ],
  s3: [
    r("Odkrywcy: Dias, Kolumb, da Gama, Magellan. Zdobywcy (konkwistadorzy): Cortés — Aztekowie, Pizarro — Inkowie.", "Первооткрыватели: Диаш, Колумб, да Гама, Магеллан. Завоеватели (конкистадоры): Кортес — ацтеки, Писарро — инки."),
  ],
  s5: [
    r("Wyprawa Magellana dowiodła, że Ziemia jest kulą.", "Экспедиция Магеллана доказала, что Земля — шар."),
    r("Nazwa „Ameryka” pochodzi od imienia Ameriga Vespucciego.", "Название «Америка» происходит от имени Америго Веспуччи."),
  ],
};

export default function DiscoveriesLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="discoveries" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="discoveries-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.cause, T.effect]} items={CAUSES} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="discoveries-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <VoyagesMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="discoveries-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="discoveries-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="discoveries-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={EFFECTS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
