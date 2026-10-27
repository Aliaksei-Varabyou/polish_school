// Lesson for §2 "Renesans w Europie" (Historia 6, GWO). Terms, people and dates follow the task bank
// of the same paragraph (templates/data/ch1.ts, RENAISSANCE and RENAISSANCE_DATES).
import {
  CompareTabs,
  LessonIntro,
  Remember,
  Section,
  SpeciesGallery,
  Timeline,
  TrueFalse,
  type CompareCard,
  type LessonProps,
  type Species,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { PrintingPress } from "./PrintingPress.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "W XV wieku we Włoszech narodziła się nowa epoka — renesans, czyli odrodzenie. Artyści i uczeni odkryli na nowo kulturę starożytnej Grecji i Rzymu, a w centrum uwagi postawili człowieka. Dzięki wynalazkowi druku nowe myśli rozeszły się po całej Europie.",
    "В XV веке в Италии родилась новая эпоха — Возрождение, или Ренессанс. Художники и учёные заново открыли культуру Древней Греции и Рима, а в центр внимания поставили человека. Благодаря изобретению книгопечатания новые идеи разошлись по всей Европе.",
  ),
  s1: r("Człowiek w centrum", "Человек в центре"),
  s1intro: r(
    "Porównaj, jak patrzono na świat w średniowieczu i w renesansie. Przełączaj zakładki — wiersze tabeli są te same.",
    "Сравни, как смотрели на мир в Средневековье и в эпоху Возрождения. Переключай вкладки — строки таблицы одни и те же.",
  ),
  s2: r("Wielcy ludzie renesansu", "Великие люди Возрождения"),
  s2intro: r("Ośmiu twórców i uczonych epoki. Dotknij karty, żeby poznać człowieka i jego dzieło.", "Восемь творцов и учёных эпохи. Нажми на карточку, чтобы узнать о человеке и его труде."),
  s3: r("Wynalazek, który zmienił świat", "Изобретение, изменившее мир"),
  s3intro: r(
    "Około 1450 roku Johannes Gutenberg z Moguncji zbudował prasę drukarską z ruchomą czcionką. Przejdź cztery kroki i sam odbij kilka stron.",
    "Около 1450 года Иоганн Гутенберг из Майнца построил печатный станок с подвижными литерами. Пройди четыре шага и сам отпечатай несколько страниц.",
  ),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Prawda czy fałsz?", "Правда или ложь?"),
  s5intro: r("Sprawdź, czy nie dałeś się złapać na popularne pomyłki o renesansie.", "Проверь, не попался ли ты на распространённые ошибки о Возрождении."),
  timeline: r("Renesans rok po roku", "Возрождение год за годом"),
  tf: r("Mity i fakty o renesansie", "Мифы и факты о Возрождении"),
  rowCenter: r("W centrum uwagi", "В центре внимания"),
  rowModel: r("Wzór do naśladowania", "Образец для подражания"),
  rowGoal: r("Cel życia", "Цель жизни"),
  rowArt: r("Sztuka", "Искусство"),
  rowScience: r("Nauka", "Наука"),
  rowLang: r("Język książek", "Язык книг"),
} satisfies Record<string, Txt>;

const ERAS: CompareCard[] = [
  {
    id: "medieval",
    icon: "⛪",
    name: r("Średniowiecze", "Средневековье"),
    rows: [
      { label: T.rowCenter, value: r("Bóg i życie wieczne", "Бог и вечная жизнь") },
      { label: T.rowModel, value: r("święci, rycerze, pokorni zakonnicy", "святые, рыцари, смиренные монахи") },
      { label: T.rowGoal, value: r("zbawienie duszy po śmierci", "спасение души после смерти") },
      { label: T.rowArt, value: r("tematy religijne; twórcy zwykle bezimienni; gotyk", "религиозные сюжеты; создатели обычно безымянны; готика") },
      { label: T.rowScience, value: r("opiera się na autorytecie Kościoła i dawnych ksiąg", "опирается на авторитет церкви и древних книг") },
      { label: T.rowLang, value: r("łacina; księgi przepisywane ręcznie w klasztorach", "латынь; книги переписывались вручную в монастырях") },
    ],
    text: r("Człowiek średniowiecza myślał przede wszystkim o tym, co czeka go po śmierci. Świat doczesny był tylko przygotowaniem.", "Человек Средневековья думал прежде всего о том, что ждёт его после смерти. Земной мир был лишь подготовкой."),
  },
  {
    id: "renaissance",
    icon: "🎨",
    name: r("Renesans", "Возрождение"),
    rows: [
      { label: T.rowCenter, value: r("człowiek, jego rozum i talenty — humanizm", "человек, его разум и таланты — гуманизм") },
      { label: T.rowModel, value: r("antyk — kultura starożytnej Grecji i Rzymu", "античность — культура Древней Греции и Рима") },
      { label: T.rowGoal, value: r("szczęśliwe, mądre i piękne życie na ziemi", "счастливая, мудрая и красивая жизнь на земле") },
      { label: T.rowArt, value: r("portrety, ciało człowieka, perspektywa; sławni artyści pod opieką mecenasów", "портреты, тело человека, перспектива; знаменитые художники под покровительством меценатов") },
      { label: T.rowScience, value: r("obserwacja i doświadczenie — Kopernik, Leonardo", "наблюдение и опыт — Коперник, Леонардо") },
      { label: T.rowLang, value: r("łacina, ale coraz częściej języki narodowe; książki drukowane", "латынь, но всё чаще национальные языки; печатные книги") },
    ],
    text: r("Humaniści pozostali chrześcijanami — ale uważali, że człowiek może i powinien poznawać świat własnym rozumem.", "Гуманисты остались христианами — но считали, что человек может и должен познавать мир собственным разумом."),
  },
];

const PEOPLE: Species[] = [
  { icon: "🎨", name: r("Leonardo da Vinci", "Леонардо да Винчи"), tag: r("malarz i wynalazca", "художник и изобретатель"), text: r("Malarz, rzeźbiarz, inżynier i uczony — „człowiek renesansu”, który umiał wszystko. Namalował „Monę Lisę” (od 1503 roku) i „Ostatnią Wieczerzę”, projektował machiny latające i badał budowę ciała człowieka.", "Художник, скульптор, инженер и учёный — «человек Возрождения», который умел всё. Написал «Мону Лизу» (с 1503 года) и «Тайную вечерю», проектировал летательные машины и изучал строение тела человека.") },
  { icon: "🗿", name: r("Michał Anioł", "Микеланджело"), tag: r("rzeźbiarz i malarz", "скульптор и живописец"), text: r("Wyrzeźbił z jednego bloku marmuru pięciometrowego „Dawida” (1504) i przez cztery lata malował freski na sklepieniu Kaplicy Sykstyńskiej w Rzymie (ukończone w 1512 roku).", "Высек из одного блока мрамора пятиметрового «Давида» (1504) и четыре года расписывал фресками свод Сикстинской капеллы в Риме (закончены в 1512 году).") },
  { icon: "🖼️", name: r("Rafael Santi", "Рафаэль Санти"), tag: r("malarz", "художник"), text: r("Malarz słynący z łagodnych madonn i fresku „Szkoła Ateńska”, na którym przedstawił starożytnych filozofów — Platona i Arystotelesa — z twarzami swoich przyjaciół, m.in. Leonarda.", "Художник, прославившийся нежными мадоннами и фреской «Афинская школа», на которой изобразил античных философов — Платона и Аристотеля — с лицами своих друзей, в том числе Леонардо.") },
  { icon: "📜", name: r("Erazm z Rotterdamu", "Эразм Роттердамский"), tag: r("humanista", "гуманист"), text: r("Najsłynniejszy humanista Europy, ksiądz i uczony z Niderlandów. W „Pochwale głupoty” wyśmiał wady ludzi — także duchownych. Pisał listy do uczonych w całej Europie, również w Polsce.", "Самый известный гуманист Европы, священник и учёный из Нидерландов. В «Похвале глупости» высмеял пороки людей — в том числе духовенства. Переписывался с учёными всей Европы, включая Польшу.") },
  { icon: "🔭", name: r("Mikołaj Kopernik", "Николай Коперник"), tag: r("astronom", "астроном"), text: r("Polski astronom z Torunia, kanonik we Fromborku. W dziele „O obrotach sfer niebieskich” (1543) dowodził, że to Ziemia krąży wokół Słońca, a nie odwrotnie — to teoria heliocentryczna.", "Польский астроном из Торуни, каноник во Фромборке. В труде «О вращении небесных сфер» (1543) доказывал, что Земля вращается вокруг Солнца, а не наоборот — это гелиоцентрическая теория.") },
  { icon: "🖨️", name: r("Johannes Gutenberg", "Иоганн Гутенберг"), tag: r("drukarz", "печатник"), text: r("Złotnik z Moguncji, który około 1450 roku wynalazł druk ruchomą czcionką. Jego pierwszym wielkim dziełem była drukowana Biblia. Książki stały się tańsze i powszechne.", "Ювелир из Майнца, который около 1450 года изобрёл печать подвижными литерами. Его первым большим трудом была печатная Библия. Книги стали дешевле и доступнее.") },
  { icon: "👑", name: r("Niccolò Machiavelli", "Никколо Макиавелли"), tag: r("pisarz polityczny", "политический писатель"), text: r("Florencki urzędnik i pisarz. W „Księciu” opisał, jak władca zdobywa i utrzymuje władzę — nawet podstępem i siłą, jeśli trzeba. Stąd słowo „makiawelizm”.", "Флорентийский чиновник и писатель. В «Государе» описал, как правитель получает и удерживает власть — даже хитростью и силой, если нужно. Отсюда слово «макиавеллизм».") },
  { icon: "🏝️", name: r("Tomasz Morus", "Томас Мор"), tag: r("humanista", "гуманист"), text: r("Angielski humanista, prawnik i kanclerz króla Henryka VIII. W „Utopii” opisał wymyśloną wyspę z idealnym, sprawiedliwym państwem. Stracony, bo nie uznał króla za głowę Kościoła.", "Английский гуманист, юрист и канцлер короля Генриха VIII. В «Утопии» описал выдуманный остров с идеальным справедливым государством. Казнён за то, что не признал короля главой церкви.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("Gutenberg wynajduje druk", "Гутенберг изобретает книгопечатание"), when: "ok. 1450", note: r("Moguncja — pierwsza prasa z ruchomą czcionką", "Майнц — первый станок с подвижными литерами") },
  { name: r("Leonardo zaczyna „Monę Lisę”", "Леонардо начинает «Мону Лизу»"), when: "1503" },
  { name: r("Michał Anioł kończy „Dawida”", "Микеланджело заканчивает «Давида»"), when: "1504", note: r("posąg stanął przed ratuszem Florencji", "статуя встала перед ратушей Флоренции") },
  { name: r("Gotowe freski Kaplicy Sykstyńskiej", "Готовы фрески Сикстинской капеллы"), when: "1512" },
  { name: r("Kopernik wydaje „O obrotach sfer niebieskich”", "Коперник издаёт «О вращении небесных сфер»"), when: "1543", note: r("w roku śmierci autora", "в год смерти автора") },
];

const MYTHS: Statement[] = [
  { text: r("Renesans narodził się we Włoszech.", "Возрождение родилось в Италии."), truth: true, why: r("Zaczął się w bogatych miastach włoskich, zwłaszcza we Florencji rządzonej przez Medyceuszy, którzy opiekowali się artystami.", "Оно началось в богатых итальянских городах, особенно во Флоренции под властью Медичи, покровительствовавших художникам.") },
  { text: r("Humaniści odrzucili wiarę w Boga.", "Гуманисты отвергли веру в Бога."), truth: false, why: r("Humaniści byli chrześcijanami — Erazm z Rotterdamu był księdzem, a Kopernik kanonikiem. Chcieli tylko, by człowiek poznawał świat własnym rozumem.", "Гуманисты были христианами — Эразм Роттердамский был священником, а Коперник каноником. Они лишь хотели, чтобы человек познавал мир собственным разумом.") },
  { text: r("Według Kopernika Słońce krąży wokół Ziemi.", "По Копернику Солнце вращается вокруг Земли."), truth: false, why: r("Odwrotnie: Kopernik dowodził, że Ziemia krąży wokół Słońca. „Wstrzymał Słońce, ruszył Ziemię”.", "Наоборот: Коперник доказывал, что Земля вращается вокруг Солнца. «Остановил Солнце, сдвинул Землю».") },
  { text: r("Przed Gutenbergiem książki przepisywano ręcznie i były bardzo drogie.", "До Гутенберга книги переписывали вручную, и они были очень дорогими."), truth: true, why: r("Jedna księga kosztowała tyle co dom lub wieś; druk sprawił, że mogli ją kupić mieszczanie i studenci.", "Одна книга стоила как дом или деревня; печать сделала её доступной горожанам и студентам.") },
  { text: r("Michał Anioł namalował „Monę Lisę”.", "Микеланджело написал «Мону Лизу»."), truth: false, why: r("„Monę Lisę” namalował Leonardo da Vinci. Michał Anioł to „Dawid” i Kaplica Sykstyńska.", "«Мону Лизу» написал Леонардо да Винчи. Микеланджело — это «Давид» и Сикстинская капелла.") },
  { text: r("Słowo „renesans” znaczy „odrodzenie”.", "Слово «ренессанс» означает «возрождение»."), truth: true, why: r("Z francuskiego renaissance — odrodzenie kultury antyku po wiekach średnich.", "От французского renaissance — возрождение античной культуры после Средних веков.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Renesans (odrodzenie) — epoka XV–XVI wieku, która odrodziła wzory antyku.", "Возрождение (Ренессанс) — эпоха XV–XVI веков, возродившая античные образцы."),
    r("Humanizm — w centrum uwagi człowiek, jego rozum i ziemskie życie.", "Гуманизм — в центре внимания человек, его разум и земная жизнь."),
    r("Mecenat — opieka bogatych władców i mieszczan (np. Medyceuszy) nad artystami.", "Меценатство — покровительство богатых правителей и горожан (например, Медичи) художникам."),
  ],
  s2: [
    r("Leonardo — „Mona Lisa”; Michał Anioł — „Dawid”, Kaplica Sykstyńska; Rafael — „Szkoła Ateńska”.", "Леонардо — «Мона Лиза»; Микеланджело — «Давид», Сикстинская капелла; Рафаэль — «Афинская школа»."),
    r("Erazm — „Pochwała głupoty”; Morus — „Utopia”; Machiavelli — „Książę”.", "Эразм — «Похвала глупости»; Мор — «Утопия»; Макиавелли — «Государь»."),
    r("Kopernik — „O obrotach sfer niebieskich” (1543), teoria heliocentryczna.", "Коперник — «О вращении небесных сфер» (1543), гелиоцентрическая теория."),
  ],
  s3: [
    r("Johannes Gutenberg, Moguncja, około 1450 roku — druk ruchomą czcionką.", "Иоганн Гутенберг, Майнц, около 1450 года — печать подвижными литерами."),
    r("Skutki: tanie książki, szybki obieg wiedzy, więcej ludzi umie czytać.", "Последствия: дешёвые книги, быстрое распространение знаний, больше людей умеет читать."),
  ],
  s5: [
    r("Renesans zaczął się we Włoszech, a potem objął całą Europę — także Polskę.", "Возрождение началось в Италии, а потом охватило всю Европу — в том числе Польшу."),
    r("Humanizm nie odrzucał religii; zmieniał tylko sposób patrzenia na człowieka.", "Гуманизм не отвергал религию; он лишь менял взгляд на человека."),
  ],
};

export default function RenaissanceLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="renaissance" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="renaissance-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={ERAS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="renaissance-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={PEOPLE} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="renaissance-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <PrintingPress lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="renaissance-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="renaissance-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={MYTHS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
