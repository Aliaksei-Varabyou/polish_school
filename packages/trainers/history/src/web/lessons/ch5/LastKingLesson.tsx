// Lesson for §27 "Ostatni król Polski" (Historia 6, GWO). Names and dates follow the task bank of
// the same paragraph (templates/data/ch5.ts, LAST_KING and LAST_KING_DATES).
import {
  LessonIntro,
  MatchQuiz,
  Remember,
  Section,
  SpeciesGallery,
  Timeline,
  TwoWaySort,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type SortItem,
  type Species,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { FirstPartitionMap } from "./FirstPartitionMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "W 1764 roku, pod osłoną wojsk rosyjskich, szlachta wybrała królem Stanisława Augusta Poniatowskiego — kandydata Katarzyny II i Familii. Nowy król chciał naprawić państwo i wspierał naukę i sztukę, ale Rosja nie pozwalała na reformy. Bunt konfederatów barskich skończył się pierwszym rozbiorem Polski.",
    "В 1764 году, под прикрытием русских войск, шляхта избрала королём Станислава Августа Понятовского — кандидата Екатерины II и Фамилии. Новый король хотел исправить государство и поддерживал науку и искусство, но Россия не позволяла реформ. Бунт барских конфедератов закончился первым разделом Польши.",
  ),
  s1: r("Kto to był?", "Кто это был?"),
  s1intro: r("Sześć postaci z początku panowania Stanisława Augusta. Dopasuj opis do nazwiska.", "Шесть персонажей начала правления Станислава Августа. Подбери описание к имени."),
  s2: r("Król mecenas", "Король-меценат"),
  s2intro: r("Co Stanisław August zrobił dla nauki, wojska i sztuki? Otwórz karty.", "Что Станислав Август сделал для науки, армии и искусства? Открой карточки."),
  s3: r("Konfederacja barska", "Барская конфедерация"),
  s3intro: r("Dlaczego szlachta chwyciła za broń w 1768 roku i do czego to doprowadziło? Rozdziel przyczyny od skutków.", "Почему шляхта взялась за оружие в 1768 году и к чему это привело? Раздели причины и следствия."),
  s4: r("I rozbiór na mapie", "Первый раздел на карте"),
  s4intro: r("Dotknij zabranych ziem, żeby zobaczyć, kto co wziął. Potem podpisz mapę sam.", "Нажми на отнятые земли, чтобы увидеть, кто что взял. Потом подпиши карту сам."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Ułóż wydarzenia od elekcji do sejmu rozbiorowego.", "Расставь события от элекции до разделного сейма."),
  who: r("Postacie czasów Stanisława Augusta", "Персонажи времён Станислава Августа"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  sort: r("Przyczyna czy skutek konfederacji barskiej?", "Причина или следствие Барской конфедерации?"),
  sortHint: r("Co popchnęło szlachtę do buntu, a co z niego wynikło?", "Что толкнуло шляхту к бунту, а что из него вышло?"),
  cause: r("przyczyna", "причина"),
  effect: r("skutek", "следствие"),
  timeline: r("Od elekcji do rozbioru", "От элекции до раздела"),
} satisfies Record<string, Txt>;

const WHO_OPTIONS: QuizOption[] = [
  { id: "sap", label: r("Stanisław August Poniatowski", "Станислав Август Понятовский") },
  { id: "katarzyna", label: r("Katarzyna II", "Екатерина II") },
  { id: "repnin", label: r("Nikołaj Repnin", "Николай Репнин") },
  { id: "pulaski", label: r("Kazimierz Pułaski", "Казимир Пулаский") },
  { id: "rejtan", label: r("Tadeusz Rejtan", "Тадеуш Рейтан") },
  { id: "fryderyk", label: r("Fryderyk II", "Фридрих II") },
];

const WHO: QuizItem[] = [
  { icon: "👑", name: r("ostatni król Polski, wybrany w 1764 roku", "последний король Польши, избранный в 1764 году"), answer: "sap", explain: r("Stanisław August Poniatowski — człowiek oświecenia, mecenas sztuki, ale zależny od Rosji.", "Станислав Август Понятовский — человек Просвещения, меценат, но зависимый от России.") },
  { icon: "🇷🇺", name: r("cesarzowa, która poparła elekcję Poniatowskiego, by rządzić Polską przez swojego posła", "императрица, поддержавшая избрание Понятовского, чтобы править Польшей через своего посла"), answer: "katarzyna", explain: r("Katarzyna II chciała słabej Polski, posłusznej Rosji — dlatego broniła liberum veto i wolnej elekcji.", "Екатерина II хотела слабой Польши, послушной России, — поэтому защищала либерум вето и свободную элекцию.") },
  { icon: "✉️", name: r("poseł rosyjski, który kazał porwać senatorów sprzeciwiających się jego woli", "русский посол, приказавший похитить сенаторов, противившихся его воле"), answer: "repnin", explain: r("Repnin w 1767 roku wywiózł do Rosji biskupów Sołtyka i Załuskiego oraz hetmana Rzewuskiego z synem.", "Репнин в 1767 году вывез в Россию епископов Солтыка и Залуского, а также гетмана Жевуского с сыном.") },
  { icon: "⚔️", name: r("dowódca konfederatów barskich, później bohater walk o niepodległość USA", "командир барских конфедератов, позже герой борьбы за независимость США"), answer: "pulaski", explain: r("Kazimierz Pułaski po klęsce konfederacji wyjechał do Ameryki i zginął w 1779 roku pod Savannah.", "Казимир Пулаский после поражения конфедерации уехал в Америку и погиб в 1779 году под Саванной.") },
  { icon: "🚪", name: r("poseł, który leżąc w drzwiach, próbował zatrzymać sejm zatwierdzający rozbiór", "депутат, который, лёжа в дверях, пытался остановить сейм, утверждавший раздел"), answer: "rejtan", explain: r("Tadeusz Rejtan w 1773 roku wołał do posłów: „Zabijcie mnie, nie zabijajcie ojczyzny!”. Scenę namalował Matejko.", "Тадеуш Рейтан в 1773 году кричал депутатам: «Убейте меня, не убивайте отчизну!». Сцену написал Матейко.") },
  { icon: "🦅", name: r("król Prus, pomysłodawca I rozbioru, który zabrał Pomorze Gdańskie", "король Пруссии, инициатор первого раздела, забравший Гданьское Поморье"), answer: "fryderyk", explain: r("Fryderyk II chciał połączyć Prusy Książęce z Brandenburgią — polskie Pomorze leżało między nimi.", "Фридрих II хотел соединить Герцогскую Пруссию с Бранденбургом — польское Поморье лежало между ними.") },
];

const WORKS: Species[] = [
  { icon: "🍽️", name: r("Obiady czwartkowe", "Четверговые обеды"), tag: r("nauka i sztuka", "наука и искусство"), text: r("Co tydzień król zapraszał na Zamek uczonych, poetów i artystów. Rozmawiano o nauce, literaturze i naprawie państwa; tu czytano „Monitora” i bajki Krasickiego.", "Каждую неделю король приглашал в Замок учёных, поэтов и художников. Говорили о науке, литературе и исправлении государства; здесь читали «Монитор» и басни Красицкого.") },
  { icon: "🎓", name: r("Szkoła Rycerska (1765)", "Рыцарская школа (1765)"), tag: r("wojsko", "армия"), text: r("Korpus Kadetów w Warszawie kształcił oficerów i urzędników w duchu służby ojczyźnie. Jej najsłynniejszy uczeń to Tadeusz Kościuszko.", "Кадетский корпус в Варшаве готовил офицеров и чиновников в духе служения отчизне. Самый известный её ученик — Тадеуш Костюшко.") },
  { icon: "🖼️", name: r("Canaletto", "Каналетто"), tag: r("malarstwo", "живопись"), text: r("Bernardo Bellotto, zwany Canaletto, malował na zamówienie króla widoki Warszawy. Po II wojnie światowej według jego obrazów odbudowano Stare Miasto.", "Бернардо Беллотто, прозванный Каналетто, писал по заказу короля виды Варшавы. После Второй мировой войны по его картинам восстанавливали Старый город.") },
  { icon: "🎨", name: r("Marcello Bacciarelli", "Марчелло Баччарелли"), tag: r("malarstwo", "живопись"), text: r("Nadworny malarz króla, autor jego portretów i obrazów z dziejów Polski do Zamku Królewskiego; kierował królewską pracownią malarską.", "Придворный живописец короля, автор его портретов и картин из истории Польши для Королевского замка; руководил королевской мастерской.") },
  { icon: "🏛️", name: r("Łazienki", "Лазенки"), tag: r("architektura", "архитектура"), text: r("Letnia rezydencja króla w Warszawie: Pałac na Wyspie, park i amfiteatr w stylu klasycystycznym.", "Летняя резиденция короля в Варшаве: Дворец на острове, парк и амфитеатр в стиле классицизма.") },
  { icon: "🪙", name: r("Reforma monety i poczty", "Реформа монеты и почты"), tag: r("państwo", "государство"), text: r("Król uporządkował bicie monety, założył mennicę w Warszawie i usprawnił pocztę — proste reformy, na które Rosja się godziła.", "Король упорядочил чеканку монеты, основал монетный двор в Варшаве и улучшил почту — простые реформы, на которые Россия соглашалась.") },
];

const BAR: SortItem[] = [
  { name: r("wojska rosyjskie stacjonują w Rzeczypospolitej", "русские войска стоят в Речи Посполитой"), group: 0, why: r("szlachta chciała uwolnić kraj od obcej armii", "шляхта хотела освободить страну от чужой армии") },
  { name: r("Repnin narzuca sejmowi prawa kardynalne (1768)", "Репнин навязывает сейму кардинальные законы (1768)"), group: 0, why: r("wolna elekcja i liberum veto zostały uznane za niezmienne pod gwarancją Rosji", "свободная элекция и либерум вето объявлены неизменными под гарантией России") },
  { name: r("równouprawnienie innowierców wymuszone przez Rosję", "равноправие иноверцев, навязанное Россией"), group: 0, why: r("katolicka szlachta uznała to za zamach na wiarę", "католическая шляхта сочла это покушением на веру") },
  { name: r("porwanie senatorów przez posła rosyjskiego", "похищение сенаторов русским послом"), group: 0, why: r("upokorzenie Rzeczypospolitej oburzyło szlachtę", "унижение Речи Посполитой возмутило шляхту") },
  { name: r("cztery lata walk partyzanckich (1768–1772)", "четыре года партизанской войны (1768–1772)"), group: 1, why: r("konfederaci nie mieli szans w otwartej bitwie z armią rosyjską", "у конфедератов не было шансов в открытом бою с русской армией") },
  { name: r("nieudane porwanie króla (1771)", "неудачное похищение короля (1771)"), group: 1, why: r("konfederaci chcieli zmusić Stanisława Augusta do ustępstw", "конфедераты хотели вынудить Станислава Августа к уступкам") },
  { name: r("Pułaski ucieka do Ameryki", "Пулаский бежит в Америку"), group: 1, why: r("po klęsce dowódcy konfederacji musieli emigrować", "после поражения командирам конфедерации пришлось эмигрировать") },
  { name: r("I rozbiór Polski (1772)", "первый раздел Польши (1772)"), group: 1, why: r("zaborcy tłumaczyli rozbiór „anarchią” w Polsce", "захватчики оправдывали раздел «анархией» в Польше") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("elekcja Stanisława Augusta Poniatowskiego", "избрание Станислава Августа Понятовского"), when: "1764" },
  { name: r("założenie Szkoły Rycerskiej", "основание Рыцарской школы"), when: "1765" },
  { name: r("zawiązanie konfederacji barskiej", "создание Барской конфедерации"), when: "1768", note: r("w Barze na Podolu", "в Баре на Подолье") },
  { name: r("porwanie króla przez konfederatów", "похищение короля конфедератами"), when: "1771" },
  { name: r("I rozbiór Polski", "первый раздел Польши"), when: "1772", note: r("Rosja, Prusy, Austria", "Россия, Пруссия, Австрия") },
  { name: r("sejm rozbiorowy i protest Rejtana", "разделный сейм и протест Рейтана"), when: "1773" },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Stanisław August Poniatowski — ostatni król Polski, elekcja 1764 (poparcie Katarzyny II i Familii).", "Станислав Август Понятовский — последний король Польши, элекция 1764 (поддержка Екатерины II и Фамилии)."),
    r("Poseł rosyjski Repnin rządził w Warszawie groźbą i siłą.", "Русский посол Репнин правил в Варшаве угрозами и силой."),
  ],
  s2: [
    r("Obiady czwartkowe, Szkoła Rycerska (1765), mecenat: Canaletto, Bacciarelli, Łazienki.", "Четверговые обеды, Рыцарская школа (1765), меценатство: Каналетто, Баччарелли, Лазенки."),
  ],
  s3: [
    r("Konfederacja barska 1768–1772: w obronie wiary i niezależności od Rosji, przeciw królowi; Kazimierz Pułaski.", "Барская конфедерация 1768–1772: в защиту веры и независимости от России, против короля; Казимир Пулаский."),
    r("Prawa kardynalne 1768: wolna elekcja i liberum veto „na zawsze”, pod gwarancją Rosji.", "Кардинальные законы 1768: свободная элекция и либерум вето «навсегда», под гарантией России."),
  ],
  s4: [
    r("I rozbiór 1772: Prusy — Pomorze Gdańskie (bez Gdańska) i Warmia; Austria — ziemie na południe od Wisły (Galicja); Rosja — ziemie za Dźwiną i Dnieprem.", "Первый раздел 1772: Пруссия — Гданьское Поморье (без Гданьска) и Вармия; Австрия — земли к югу от Вислы (Галиция); Россия — земли за Двиной и Днепром."),
    r("Sejm rozbiorowy 1773 zatwierdził rozbiór mimo protestu Tadeusza Rejtana.", "Разделный сейм 1773 утвердил раздел вопреки протесту Тадеуша Рейтана."),
  ],
};

export default function LastKingLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="last-king" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="last-king-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="last-king-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={WORKS} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="last-king-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.cause, T.effect]} items={BAR} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="last-king-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <FirstPartitionMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="last-king-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
