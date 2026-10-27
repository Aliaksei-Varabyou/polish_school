// Block 3 of the legions lesson: the stanzas of "Mazurek Dąbrowskiego" (the text sung today) matched
// to the history each one refers to. In Russian the quote keeps the Polish original with a
// translation beside it, since the hymn is learnt in Polish.
import { MatchQuiz, type ContentLang, type QuizItem, type QuizOption, type Txt } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const OPTIONS: QuizOption[] = [
  { id: "rozbiory", label: r("rozbiory: Polska zniknęła z mapy, ale żyje w Polakach", "разделы: Польша исчезла с карты, но живёт в поляках") },
  { id: "dabrowski", label: r("generał Dąbrowski i Legiony we Włoszech", "генерал Домбровский и легионы в Италии") },
  { id: "powrot", label: r("powrót do kraju przez polskie rzeki", "возвращение на родину через польские реки") },
  { id: "bonaparte", label: r("Napoleon Bonaparte — wzór, jak zwyciężać", "Наполеон Бонапарт — пример, как побеждать") },
  { id: "czarniecki", label: r("hetman Czarniecki i potop szwedzki", "гетман Чарнецкий и шведский «потоп»") },
  { id: "basia", label: r("rodziny w kraju czekające na legionistów", "семьи на родине, ждущие легионеров") },
];

const STANZAS: QuizItem[] = [
  {
    icon: "🇵🇱",
    name: r("„Jeszcze Polska nie zginęła, kiedy my żyjemy. Co nam obca przemoc wzięła, szablą odbierzemy.”", "«Jeszcze Polska nie zginęła, kiedy my żyjemy…» — «Ещё Польша не погибла, пока мы живём. Что отняла чужая сила, саблей отберём»"),
    answer: "rozbiory",
    explain: r("Po III rozbiorze (1795) państwo polskie zniknęło z mapy. Pieśń mówi: dopóki żyją Polacy, Polska istnieje — a zabrane ziemie odzyskamy walką.", "После третьего раздела (1795) польское государство исчезло с карты. Песня говорит: пока живут поляки, Польша существует — а отнятые земли вернём борьбой."),
  },
  {
    icon: "🎖️",
    name: r("„Marsz, marsz, Dąbrowski, z ziemi włoskiej do Polski. Za twoim przewodem złączym się z narodem.”", "«Marsz, marsz, Dąbrowski, z ziemi włoskiej do Polski…» — «Марш, марш, Домбровский, с земли итальянской в Польшу. Под твоим началом соединимся с народом»"),
    answer: "dabrowski",
    explain: r("Refren zwraca się do generała Jana Henryka Dąbrowskiego, twórcy Legionów Polskich we Włoszech (1797). Legioniści wierzyli, że u boku Francji wrócą z bronią do Polski.", "Припев обращён к генералу Яну Генрику Домбровскому, создателю Польских легионов в Италии (1797). Легионеры верили, что на стороне Франции вернутся с оружием в Польшу."),
  },
  {
    icon: "🌊",
    name: r("„Przejdziem Wisłę, przejdziem Wartę, będziem Polakami.”", "«Przejdziem Wisłę, przejdziem Wartę, będziem Polakami» — «Перейдём Вислу, перейдём Варту, будем поляками»"),
    answer: "powrot",
    explain: r("Wisła i Warta to główne rzeki Polski. Przejść je znaczy wrócić do ojczyzny i znów być wolnym narodem.", "Висла и Варта — главные реки Польши. Перейти их — значит вернуться на родину и снова быть свободным народом."),
  },
  {
    icon: "👑",
    name: r("„Dał nam przykład Bonaparte, jak zwyciężać mamy.”", "«Dał nam przykład Bonaparte, jak zwyciężać mamy» — «Дал нам пример Бонапарт, как побеждать должны мы»"),
    answer: "bonaparte",
    explain: r("W 1797 roku Napoleon Bonaparte był młodym generałem, który właśnie pokonał Austrię we Włoszech. Polacy widzieli w nim wzór zwycięzcy i nadzieję na pomoc.", "В 1797 году Наполеон Бонапарт был молодым генералом, только что победившим Австрию в Италии. Поляки видели в нём образец победителя и надежду на помощь."),
  },
  {
    icon: "🐎",
    name: r("„Jak Czarniecki do Poznania po szwedzkim zaborze, dla ojczyzny ratowania wrócim się przez morze.”", "«Jak Czarniecki do Poznania po szwedzkim zaborze…» — «Как Чарнецкий в Познань после шведского захвата, для спасения отчизны вернёмся через море»"),
    answer: "czarniecki",
    explain: r("Stefan Czarniecki to hetman z czasów potopu szwedzkiego (1655–1660), który walczył ze Szwedami aż w Danii i wrócił do Polski. Legioniści chcieli tak jak on wrócić z daleka ratować ojczyznę.", "Стефан Чарнецкий — гетман времён шведского «потопа» (1655–1660), который воевал со шведами даже в Дании и вернулся в Польшу. Легионеры хотели, как он, вернуться издалека спасать отчизну."),
  },
  {
    icon: "👨‍👧",
    name: r("„Już tam ojciec do swej Basi mówi zapłakany: słuchaj jeno, pono nasi biją w tarabany.”", "«Już tam ojciec do swej Basi mówi zapłakany…» — «Вот уже отец своей Басе говорит в слезах: слушай-ка, вроде наши бьют в барабаны»"),
    answer: "basia",
    explain: r("Ojciec i Basia to rodzina w kraju, która słyszy bębny nadchodzącego wojska. Zwrotka mówi o nadziei Polaków pod zaborami na powrót legionistów.", "Отец и Бася — семья на родине, которая слышит барабаны приближающегося войска. Куплет говорит о надежде поляков под властью захватчиков на возвращение легионеров."),
  },
];

export function MazurekQuiz({ lang }: { lang: ContentLang }) {
  return (
    <MatchQuiz
      lang={lang}
      title={r("O czym śpiewa Mazurek Dąbrowskiego?", "О чём поёт Мазурка Домбровского?")}
      question={r("Do czego odnosi się zwrotka:", "К чему относится куплет:")}
      options={OPTIONS}
      items={STANZAS}
      wrongHint={r("ta zwrotka mówi o czymś innym. Spróbuj jeszcze raz.", "этот куплет о другом. Попробуй ещё раз.")}
    />
  );
}
