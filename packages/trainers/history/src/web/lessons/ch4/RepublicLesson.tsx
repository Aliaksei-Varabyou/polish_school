// Lesson for §25 "Od monarchii konstytucyjnej do republiki" (Historia 6, GWO). Terms, people and
// dates follow the task bank of the same paragraph (templates/data/ch4.ts, REPUBLIC and REPUBLIC_DATES).
import {
  CompareTabs,
  LessonIntro,
  MatchQuiz,
  OrderGame,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  type CompareCard,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Monarchia konstytucyjna nie przetrwała nawet roku. Król próbował uciec z kraju, Austria i Prusy ruszyły na Francję, a lud Paryża szturmem wziął pałac. We wrześniu 1792 roku Francja stała się republiką, w styczniu 1793 ścięto Ludwika XVI — i zaczął się czas jakobinów, gilotyny i terroru.",
    "Конституционная монархия не продержалась и года. Король попытался бежать из страны, Австрия и Пруссия двинулись на Францию, а парижане взяли штурмом дворец. В сентябре 1792 года Франция стала республикой, в январе 1793 казнили Людовика XVI — и началось время якобинцев, гильотины и террора.",
  ),
  s1: r("Jak upadła monarchia", "Как пала монархия"),
  s1intro: r("Od ucieczki króla do jego ścięcia. Ułóż wydarzenia po kolei.", "От бегства короля до его казни. Расставь события по порядку."),
  s2: r("Żyrondyści i jakobini", "Жирондисты и якобинцы"),
  s2intro: r("W Konwencie ścierały się dwa stronnictwa. Porównaj, czego chciały.", "В Конвенте столкнулись две партии. Сравни, чего они хотели."),
  s3: r("Ludzie rewolucji", "Люди революции"),
  s3intro: r("Trzej przywódcy jakobinów i ich przeciwnicy. Kto to był?", "Три вождя якобинцев и их противники. Кто это был?"),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Terror i co dalej", "Террор и что дальше"),
  s5intro: r("Prawda czy fałsz? Każde zdanie dotyczy lat 1793–1795.", "Правда или ложь? Каждое утверждение — о 1793–1795 годах."),
  order: r("Koniec monarchii", "Конец монархии"),
  orderHint: r("Zacznij od czerwca 1791 roku.", "Начни с июня 1791 года."),
  who: r("Kto to był?", "Кто это был?"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  timeline: r("Od Varennes do Dyrektoriatu", "От Варенна до Директории"),
  tf: r("Rządy jakobinów", "Правление якобинцев"),
} satisfies Record<string, Txt>;

const ORDER: Txt[] = [
  r("Ludwik XVI próbuje uciec — zatrzymany w Varennes", "Людовик XVI пытается бежать — задержан в Варенне"),
  r("Francja wypowiada wojnę Austrii; Prusy ruszają na Paryż", "Франция объявляет войну Австрии; Пруссия идёт на Париж"),
  r("ochotnicy z Marsylii śpiewają Marsyliankę", "добровольцы из Марселя поют Марсельезу"),
  r("szturm na Tuileries — król uwięziony", "штурм Тюильри — король заключён под стражу"),
  r("zwycięstwo pod Valmy", "победа при Вальми"),
  r("Konwent ogłasza republikę", "Конвент провозглашает республику"),
  r("ścięcie Ludwika XVI", "казнь Людовика XVI"),
];

const PARTIES: CompareCard[] = [
  {
    id: "zyr",
    icon: "🎩",
    name: r("Żyrondyści", "Жирондисты"),
    rows: [
      { label: r("Kogo reprezentowali", "Кого представляли"), value: r("bogatą burżuazję z prowincji (nazwa od departamentu Gironde)", "богатую буржуазию провинций (название от департамента Жиронда)") },
      { label: r("Czego chcieli", "Чего хотели"), value: r("umiarkowanej republiki, wolności handlu, ochrony własności", "умеренной республики, свободы торговли, защиты собственности") },
      { label: r("Stosunek do króla", "Отношение к королю"), value: r("część chciała go oszczędzić", "часть хотела его пощадить") },
      { label: r("Metody", "Методы"), value: r("spory w Konwencie, bez terroru", "споры в Конвенте, без террора") },
      { label: r("Los", "Судьба"), value: r("w czerwcu 1793 usunięci z Konwentu, przywódcy zgilotynowani", "в июне 1793 изгнаны из Конвента, вожди гильотинированы") },
    ],
    text: r("Żyrondyści pchnęli Francję do wojny w 1792 roku, ale gdy wojna szła źle, lud Paryża zwrócił się przeciw nim.", "Жирондисты толкнули Францию к войне в 1792 году, но когда война пошла плохо, парижане обратились против них."),
  },
  {
    id: "jak",
    icon: "🔴",
    name: r("Jakobini", "Якобинцы"),
    rows: [
      { label: r("Kogo reprezentowali", "Кого представляли"), value: r("drobnych mieszczan i biedotę Paryża (nazwa od klasztoru św. Jakuba, gdzie się zbierali)", "мелких горожан и бедноту Парижа (название от монастыря св. Иакова, где они собирались)") },
      { label: r("Czego chcieli", "Чего хотели"), value: r("republiki równych, taniego chleba, bezwzględnej walki z wrogami rewolucji", "республики равных, дешёвого хлеба, беспощадной борьбы с врагами революции") },
      { label: r("Stosunek do króla", "Отношение к королю"), value: r("żądali jego śmierci", "требовали его смерти") },
      { label: r("Metody", "Методы"), value: r("Komitet Ocalenia Publicznego, trybunał rewolucyjny, gilotyna — terror", "Комитет общественного спасения, революционный трибунал, гильотина — террор") },
      { label: r("Los", "Судьба"), value: r("obaleni 9 thermidora 1794, Robespierre ścięty", "свергнуты 9 термидора 1794, Робеспьер казнён") },
    ],
    text: r("Jakobini uratowali republikę przed obcymi armiami, ale cena była straszna: w czasie terroru stracono około 17 tysięcy ludzi.", "Якобинцы спасли республику от чужих армий, но цена была страшной: во время террора казнили около 17 тысяч человек."),
  },
];

const WHO_OPTIONS: QuizOption[] = [
  { id: "robespierre", label: r("Maximilien Robespierre", "Максимилиан Робеспьер") },
  { id: "danton", label: r("Georges Danton", "Жорж Дантон") },
  { id: "marat", label: r("Jean-Paul Marat", "Жан-Поль Марат") },
  { id: "ludwik", label: r("Ludwik XVI", "Людовик XVI") },
  { id: "corday", label: r("Charlotte Corday", "Шарлотта Корде") },
];

const WHO: QuizItem[] = [
  { icon: "🧊", name: r("„Nieprzekupny”, przywódca jakobinów i twórca terroru, ścięty po 9 thermidora", "«Неподкупный», вождь якобинцев и создатель террора, казнённый после 9 термидора"), answer: "robespierre", explain: r("Robespierre kierował Komitetem Ocalenia Publicznego; zginął na gilotynie 28 lipca 1794 roku.", "Робеспьер руководил Комитетом общественного спасения; погиб на гильотине 28 июля 1794 года.") },
  { icon: "📣", name: r("porywający mówca, jeden z twórców republiki, stracony przez dawnych towarzyszy", "пламенный оратор, один из создателей республики, казнённый бывшими товарищами"), answer: "danton", explain: r("Danton chciał złagodzić terror — Robespierre posłał go na gilotynę w kwietniu 1794 roku.", "Дантон хотел смягчить террор — Робеспьер отправил его на гильотину в апреле 1794 года.") },
  { icon: "📰", name: r("radykalny dziennikarz, „przyjaciel ludu”, zasztyletowany w wannie", "радикальный журналист, «друг народа», заколотый в ванне"), answer: "marat", explain: r("Marat w swojej gazecie domagał się głów „zdrajców”; zginął w lipcu 1793 roku.", "Марат в своей газете требовал голов «предателей»; погиб в июле 1793 года.") },
  { icon: "👑", name: r("król skazany przez Konwent i zgilotynowany 21 stycznia 1793 roku", "король, осуждённый Конвентом и гильотинированный 21 января 1793 года"), answer: "ludwik", explain: r("Ludwika XVI uznano za zdrajcę po ucieczce do Varennes i tajnych kontaktach z Austrią.", "Людовика XVI признали предателем после бегства в Варенн и тайных контактов с Австрией.") },
  { icon: "🗡️", name: r("młoda zwolenniczka żyrondystów, która zabiła Marata", "молодая сторонница жирондистов, убившая Марата"), answer: "corday", explain: r("Charlotte Corday chciała powstrzymać terror; cztery dni później ją ścięto.", "Шарлотта Корде хотела остановить террор; через четыре дня её казнили.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("ucieczka króla do Varennes", "бегство короля в Варенн"), when: "VI 1791" },
  { name: r("szturm na Tuileries — obalenie monarchii", "штурм Тюильри — свержение монархии"), when: "10 VIII 1792" },
  { name: r("bitwa pod Valmy", "битва при Вальми"), when: "20 IX 1792", note: r("armia rewolucyjna zatrzymuje Prusaków", "революционная армия останавливает пруссаков") },
  { name: r("ogłoszenie republiki", "провозглашение республики"), when: "22 IX 1792" },
  { name: r("ścięcie Ludwika XVI", "казнь Людовика XVI"), when: "21 I 1793" },
  { name: r("przewrót 9 thermidora — upadek Robespierre’a", "переворот 9 термидора — падение Робеспьера"), when: "27 VII 1794" },
  { name: r("powołanie Dyrektoriatu", "учреждение Директории"), when: "1795" },
];

const FACTS: Statement[] = [
  { text: r("Gilotynę uważano za humanitarny sposób egzekucji — szybki i jednakowy dla wszystkich.", "Гильотину считали гуманным способом казни — быстрым и одинаковым для всех."), truth: true, why: r("Przed rewolucją szlachtę ścinano mieczem, a prostych ludzi wieszano. Gilotyna „zrównała” skazanych.", "До революции дворян обезглавливали мечом, а простых людей вешали. Гильотина «уравняла» осуждённых.") },
  { text: r("Komitet Ocalenia Publicznego kierował Francją w czasie terroru.", "Комитет общественного спасения управлял Францией во время террора."), truth: true, why: r("Dwunastu członków z Robespierre’em na czele miało władzę niemal nieograniczoną.", "Двенадцать членов во главе с Робеспьером обладали почти неограниченной властью.") },
  { text: r("Terror dotknął tylko arystokratów i księży.", "Террор затронул только аристократов и священников."), truth: false, why: r("Większość straconych to chłopi i mieszczanie, w tym dawni rewolucjoniści — Danton i żyrondyści.", "Большинство казнённых — крестьяне и горожане, в том числе бывшие революционеры — Дантон и жирондисты.") },
  { text: r("Kalendarz rewolucyjny liczył lata od ogłoszenia republiki, a miesiące nazwano od pogody.", "Революционный календарь считал годы от провозглашения республики, а месяцы назвали по погоде."), truth: true, why: r("Rok I zaczął się 22 września 1792. Thermidor to „miesiąc upałów”, brumaire — „mgieł”.", "Год I начался 22 сентября 1792. Термидор — «месяц жары», брюмер — «туманов».") },
  { text: r("Po 9 thermidora Francja wróciła do monarchii.", "После 9 термидора Франция вернулась к монархии."), truth: false, why: r("Republika przetrwała; od 1795 roku rządził nią pięcioosobowy Dyrektoriat.", "Республика сохранилась; с 1795 года ею правила Директория из пяти человек.") },
  { text: r("Marsylianka, pieśń z 1792 roku, jest dziś hymnem Francji.", "Марсельеза, песня 1792 года, сегодня — гимн Франции."), truth: true, why: r("Napisał ją oficer Rouget de Lisle dla armii; śpiewając ją, ochotnicy z Marsylii weszli do Paryża.", "Её написал офицер Руже де Лиль для армии; с ней добровольцы из Марселя вошли в Париж.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Varennes VI 1791 → wojna z Austrią i Prusami 1792 → 10 VIII szturm na Tuileries → Valmy → 22 IX 1792 republika.", "Варенн VI 1791 → война с Австрией и Пруссией 1792 → 10 VIII штурм Тюильри → Вальми → 22 IX 1792 республика."),
    r("21 I 1793 — ścięcie Ludwika XVI.", "21 I 1793 — казнь Людовика XVI."),
  ],
  s2: [
    r("Żyrondyści — umiarkowani; jakobini — radykalni, z Robespierre’em na czele.", "Жирондисты — умеренные; якобинцы — радикальные, во главе с Робеспьером."),
    r("Konwent Narodowy (od 1792) zniósł monarchię i skazał króla.", "Национальный конвент (с 1792) упразднил монархию и осудил короля."),
  ],
  s3: [
    r("Robespierre — terror i Komitet Ocalenia Publicznego; Danton — stracony 1794; Marat — zabity 1793.", "Робеспьер — террор и Комитет общественного спасения; Дантон — казнён в 1794; Марат — убит в 1793."),
  ],
  s5: [
    r("Terror 1793–1794 → przewrót 9 thermidora (27 VII 1794) → Dyrektoriat 1795–1799.", "Террор 1793–1794 → переворот 9 термидора (27 VII 1794) → Директория 1795–1799."),
    r("Dziedzictwo rewolucji: Marsylianka, trójkolorowa flaga, hasło „wolność, równość, braterstwo”.", "Наследие революции: Марсельеза, трёхцветный флаг, лозунг «свобода, равенство, братство»."),
  ],
};

export default function RepublicLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="republic" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="republic-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} steps={ORDER} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="republic-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={PARTIES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="republic-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="republic-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="republic-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
