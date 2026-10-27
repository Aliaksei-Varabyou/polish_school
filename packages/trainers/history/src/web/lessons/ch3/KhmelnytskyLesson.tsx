// Lesson for §14 "Powstanie Chmielnickiego" (Historia 6, GWO). Names and dates follow the task
// bank of the same paragraph (templates/data/ch3.ts, KHMELNYTSKY and KHMELNYTSKY_DATES).
import { CompareTabs, LessonIntro, MatchQuiz, Remember, Section, Timeline, TrueFalse, TwoWaySort, type CompareCard, type LessonProps, type QuizItem, type QuizOption, type SortItem, type Statement, type TimelineEvent, type Txt } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Na Ukrainie, za porohami Dniepru, żyli Kozacy zaporoscy — wolni wojownicy, którzy nie chcieli być chłopami pańszczyźnianymi. W 1648 roku Bohdan Chmielnicki poprowadził ich do największego powstania w dziejach Rzeczypospolitej. Zaczęło się od trzech klęsk wojsk koronnych, a skończyło oddaniem Ukrainy carowi.",
    "На Украине, за порогами Днепра, жили запорожские казаки — вольные воины, не желавшие быть крепостными крестьянами. В 1648 году Богдан Хмельницкий повёл их на крупнейшее восстание в истории Речи Посполитой. Оно началось с трёх поражений коронных войск, а закончилось переходом Украины под власть царя.",
  ),
  s1: r("Dlaczego wybuchło powstanie?", "Почему вспыхнуло восстание?"),
  s1intro: r("Rozdziel przyczyny powstania od jego skutków.", "Раздели причины восстания и его последствия."),
  s2: r("Kto to był?", "Кто это был?"),
  s2intro: r("Ludzie powstania: Kozacy, magnaci, król. Dopasuj opis do postaci.", "Люди восстания: казаки, магнаты, король. Подбери описание к личности."),
  s3: r("Trzy ugody", "Три соглашения"),
  s3intro: r("Zborów, Perejasław, Hadziacz — trzy próby zakończenia wojny. Porównaj, co każda z nich dawała Kozakom.", "Зборов, Переяслав, Гадяч — три попытки закончить войну. Сравни, что каждая из них давала казакам."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia powstania od najwcześniejszego do najpóźniejszego.", "Расставь события восстания от самого раннего до самого позднего."),
  s5: r("Prawda czy fałsz?", "Правда или ложь?"),
  s5intro: r("Sprawdź, czy nie dałeś się złapać na typowe pomyłki.", "Проверь, не попался ли ты на типичные ошибки."),
  sort: r("Przyczyna czy skutek powstania?", "Причина или следствие восстания?"),
  sortHint: r("Co było przed rokiem 1648, a co stało się przez powstanie?", "Что было до 1648 года, а что случилось из-за восстания?"),
  cause: r("przyczyna", "причина"),
  effect: r("skutek", "следствие"),
  who: r("Postacie powstania", "Личности восстания"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  tf: r("Powstanie Chmielnickiego", "Восстание Хмельницкого"),
  timeline: r("Powstanie rok po roku", "Восстание год за годом"),
  year: r("Rok", "Год"),
  sides: r("Kto z kim", "Кто с кем"),
  terms: r("Ustalenia", "Условия"),
  fate: r("Co z tego wyszło", "Что из этого вышло"),
} satisfies Record<string, Txt>;

const CAUSES: SortItem[] = [
  {
    name: r("mały rejestr kozacki — tylko część Kozaków na żołdzie", "малый казацкий реестр — лишь часть казаков на жалованье"),
    group: 0,
    why: r("pozostali mieli zostać chłopami pańszczyźnianymi", "остальные должны были стать крепостными крестьянами"),
  },
  {
    name: r("magnaci zakładają folwarki na Ukrainie", "магнаты заводят фольварки на Украине"),
    group: 0,
    why: r("Kozacy i chłopi nie chcieli odrabiać pańszczyzny", "казаки и крестьяне не хотели отрабатывать барщину"),
  },
  {
    name: r("prawosławni czują się gorsi od katolików", "православные чувствуют себя ниже католиков"),
    group: 0,
    why: r("religia Kozaków nie miała takich praw jak katolicka", "религия казаков не имела таких прав, как католическая"),
  },
  {
    name: r("osobista krzywda Chmielnickiego", "личная обида Хмельницкого"),
    group: 0,
    why: r("szlachcic zajął jego majątek, a sądy nie pomogły", "шляхтич захватил его имение, а суды не помогли"),
  },
  {
    name: r("klęski pod Żółtymi Wodami, Korsuniem i Piławcami", "поражения при Жёлтых Водах, Корсуне и Пилявцах"),
    group: 1,
    why: r("wojska koronne zostały rozbite w pierwszym roku powstania", "коронные войска были разбиты в первый год восстания"),
  },
  {
    name: r("ugoda perejasławska i wojna z Rosją", "Переяславская рада и война с Россией"),
    group: 1,
    why: r("Kozacy poddali się carowi, a Rosja uderzyła na Rzeczpospolitą", "казаки перешли к царю, и Россия ударила по Речи Посполитой"),
  },
  {
    name: r("wyludnienie i zniszczenie Ukrainy", "обезлюдение и разорение Украины"),
    group: 1,
    why: r("lata walk spustoszyły kraj", "годы войны опустошили край"),
  },
  {
    name: r("osłabienie Rzeczypospolitej przed potopem", "ослабление Речи Посполитой перед потопом"),
    group: 1,
    why: r("wyczerpane państwo nie zdołało odeprzeć Szwedów w 1655 roku", "истощённое государство не смогло отразить шведов в 1655 году"),
  },
];

const WHO_OPTIONS: QuizOption[] = [
  { id: "chmielnicki", label: r("Bohdan Chmielnicki", "Богдан Хмельницкий") },
  {
    id: "wisniowiecki",
    label: r("Jeremi Wiśniowiecki", "Иеремия Вишневецкий"),
  },
  { id: "jan-kazimierz", label: r("Jan Kazimierz", "Ян Казимир") },
  { id: "tuhaj-bej", label: r("Tuhaj-bej", "Тугай-бей") },
  { id: "wladyslaw", label: r("Władysław IV", "Владислав IV") },
];

const WHO: QuizItem[] = [
  {
    icon: "🪶",
    name: r("hetman kozacki, który w 1648 roku poprowadził powstanie", "казацкий гетман, который в 1648 году возглавил восстание"),
    answer: "chmielnicki",
    explain: r("Chmielnicki, pokrzywdzony przez sąsiada szlachcica, uciekł na Sicz i stanął na czele Kozaków.", "Хмельницкий, обиженный соседом-шляхтичем, бежал на Сечь и возглавил казаков."),
  },
  {
    icon: "🏰",
    name: r("książę kresowy, bezwzględny pogromca Kozaków i obrońca Zbaraża", "окраинный князь, беспощадный усмиритель казаков и защитник Збаража"),
    answer: "wisniowiecki",
    explain: r("Jeremi Wiśniowiecki, właściciel ogromnych dóbr na Ukrainie, w 1649 roku bronił Zbaraża przez wiele tygodni.", "Иеремия Вишневецкий, владелец огромных имений на Украине, в 1649 году много недель оборонял Збараж."),
  },
  {
    icon: "👑",
    name: r("król wybrany w 1648 roku, zwycięzca spod Beresteczka", "король, избранный в 1648 году, победитель под Берестечком"),
    answer: "jan-kazimierz",
    explain: r("Jan Kazimierz, brat Władysława IV, w 1651 roku pokonał Kozaków i Tatarów pod Beresteczkiem.", "Ян Казимир, брат Владислава IV, в 1651 году разбил казаков и татар под Берестечком."),
  },
  {
    icon: "🏹",
    name: r("wódz tatarski, sojusznik Kozaków w pierwszych bitwach", "татарский предводитель, союзник казаков в первых битвах"),
    answer: "tuhaj-bej",
    explain: r("Tuhaj-bej przyprowadził Chmielnickiemu jazdę tatarską, bez której Kozacy nie wygraliby z husarią.", "Тугай-бей привёл Хмельницкому татарскую конницу, без которой казаки не одолели бы гусарию."),
  },
  {
    icon: "⚰️",
    name: r("król, który zmarł w pierwszych tygodniach powstania", "король, умерший в первые недели восстания"),
    answer: "wladyslaw",
    explain: r("Władysław IV zmarł w maju 1648 roku; Rzeczpospolita walczyła z powstaniem w czasie bezkrólewia.", "Владислав IV умер в мае 1648 года; Речь Посполитая боролась с восстанием во время бескоролевья."),
  },
];

const TREATIES: CompareCard[] = [
  {
    id: "zborow",
    icon: "🤝",
    name: r("Ugoda zborowska", "Зборовский договор"),
    rows: [
      { label: T.year, value: r("1649", "1649") },
      {
        label: T.sides,
        value: r("Jan Kazimierz i Chmielnicki, po obronie Zbaraża", "Ян Казимир и Хмельницкий, после обороны Збаража"),
      },
      {
        label: T.terms,
        value: r("rejestr 40 tysięcy Kozaków; Chmielnicki hetmanem trzech województw ukrainnych", "реестр в 40 тысяч казаков; Хмельницкий — гетман трёх украинских воеводств"),
      },
      {
        label: T.fate,
        value: r("żadna strona jej nie dotrzymała; wojna wróciła w 1651 roku", "ни одна сторона её не соблюдала; война вернулась в 1651 году"),
      },
    ],
  },
  {
    id: "perejaslaw",
    icon: "🇷🇺",
    name: r("Ugoda perejasławska", "Переяславская рада"),
    rows: [
      { label: T.year, value: r("1654", "1654") },
      {
        label: T.sides,
        value: r("Chmielnicki i car Rosji Aleksy", "Хмельницкий и русский царь Алексей"),
      },
      {
        label: T.terms,
        value: r("Kozacy poddają się carowi i przysięgają mu wierność", "казаки переходят под власть царя и присягают ему"),
      },
      {
        label: T.fate,
        value: r("wybuchła wojna Rzeczypospolitej z Rosją; Ukraina na lewym brzegu Dniepru została przy Rosji", "началась война Речи Посполитой с Россией; Левобережная Украина осталась за Россией"),
      },
    ],
  },
  {
    id: "hadziacz",
    icon: "📜",
    name: r("Unia hadziacka", "Гадячская уния"),
    rows: [
      { label: T.year, value: r("1658", "1658") },
      {
        label: T.sides,
        value: r("Rzeczpospolita i hetman Iwan Wyhowski, następca Chmielnickiego", "Речь Посполитая и гетман Иван Выговский, преемник Хмельницкого"),
      },
      {
        label: T.terms,
        value: r("Ukraina trzecim członem Rzeczypospolitej obok Korony i Litwy, z własnymi urzędami", "Украина — третья часть Речи Посполитой наряду с Короной и Литвой, со своими должностями"),
      },
      {
        label: T.fate,
        value: r("nie weszła w życie: Kozacy obalili Wyhowskiego, a sejm okroił ugodę", "не вступила в силу: казаки свергли Выговского, а сейм урезал соглашение"),
      },
    ],
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("Żółte Wody, Korsuń, Piławce — klęski wojsk koronnych", "Жёлтые Воды, Корсунь, Пилявцы — поражения коронных войск"),
    when: "1648",
    note: r("wybuch powstania; umiera Władysław IV", "начало восстания; умирает Владислав IV"),
  },
  {
    name: r("obrona Zbaraża i ugoda zborowska", "оборона Збаража и Зборовский договор"),
    when: "1649",
  },
  {
    name: r("bitwa pod Beresteczkiem", "битва под Берестечком"),
    when: "1651",
    note: r("zwycięstwo Jana Kazimierza", "победа Яна Казимира"),
  },
  {
    name: r("ugoda perejasławska", "Переяславская рада"),
    when: "1654",
    note: r("Kozacy poddają się carowi", "казаки переходят к царю"),
  },
  {
    name: r("śmierć Bohdana Chmielnickiego", "смерть Богдана Хмельницкого"),
    when: "1657",
  },
  { name: r("unia hadziacka", "Гадячская уния"), when: "1658" },
];

const FACTS: Statement[] = [
  {
    text: r("Sicz to warowny obóz Kozaków zaporoskich na wyspie Dniepru.", "Сечь — укреплённый лагерь запорожских казаков на днепровском острове."),
    truth: true,
    why: r("Za porohami — skalistymi progami rzeki — Kozacy byli bezpieczni od wojsk i urzędników.", "За порогами — скалистыми уступами реки — казаки были в безопасности от войск и чиновников."),
  },
  {
    text: r("Rejestr kozacki to lista Kozaków, którzy dostawali żołd od Rzeczypospolitej.", "Казацкий реестр — список казаков, получавших жалованье от Речи Посполитой."),
    truth: true,
    why: r("Kozacy chcieli, by rejestr był jak największy; sejm go zmniejszał — i to była jedna z przyczyn powstań.", "Казаки хотели, чтобы реестр был как можно больше; сейм его уменьшал — и это была одна из причин восстаний."),
  },
  {
    text: r("Pod Piławcami w 1648 roku szlachta odniosła wielkie zwycięstwo.", "Под Пилявцами в 1648 году шляхта одержала большую победу."),
    truth: false,
    why: r("Pospolite ruszenie uciekło w panice, porzucając obóz — Piławce to symbol hańby, nie chwały.", "Ополчение в панике бежало, бросив лагерь, — Пилявцы стали символом позора, а не славы."),
  },
  {
    text: r("Pod Beresteczkiem w 1651 roku Jan Kazimierz pokonał Kozaków i Tatarów.", "Под Берестечком в 1651 году Ян Казимир разбил казаков и татар."),
    truth: true,
    why: r("Była to jedna z największych bitew XVII-wiecznej Europy; chan uciekł, uprowadzając Chmielnickiego.", "Это было одно из крупнейших сражений Европы XVII века; хан бежал, уведя с собой Хмельницкого."),
  },
  {
    text: r("W ugodzie perejasławskiej Kozacy poddali się sułtanowi tureckiemu.", "По Переяславской раде казаки перешли под власть турецкого султана."),
    truth: false,
    why: r("Poddali się carowi Rosji (1654). To Rosja, nie Turcja, rozpoczęła potem wojnę z Rzecząpospolitą.", "Они перешли под власть русского царя (1654). Именно Россия, а не Турция, начала потом войну с Речью Посполитой."),
  },
  {
    text: r("Unia hadziacka miała uczynić Ukrainę równoprawną częścią Rzeczypospolitej.", "Гадячская уния должна была сделать Украину равноправной частью Речи Посполитой."),
    truth: true,
    why: r("Obok Korony i Litwy miało powstać Księstwo Ruskie, ale układ z 1658 roku nie wszedł w życie.", "Рядом с Короной и Литвой должно было возникнуть Русское княжество, но договор 1658 года не вступил в силу."),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Przyczyny: mały rejestr, pańszczyzna w magnackich folwarkach, krzywdy prawosławnych, osobista krzywda Chmielnickiego.", "Причины: малый реестр, барщина в магнатских фольварках, обиды православных, личная обида Хмельницкого."),
    r("Skutki: zniszczenie Ukrainy, wojna z Rosją, osłabienie państwa przed potopem.", "Последствия: разорение Украины, война с Россией, ослабление государства перед потопом."),
  ],
  s2: [r("Bohdan Chmielnicki — hetman kozacki; Jeremi Wiśniowiecki — książę, obrońca Zbaraża; Jan Kazimierz — król od 1648 roku.", "Богдан Хмельницкий — казацкий гетман; Иеремия Вишневецкий — князь, защитник Збаража; Ян Казимир — король с 1648 года.")],
  s3: [r("Zborów 1649 — rejestr 40 tysięcy. Perejasław 1654 — Kozacy pod władzą cara. Hadziacz 1658 — Ukraina trzecim członem Rzeczypospolitej (nie weszło w życie).", "Зборов 1649 — реестр 40 тысяч. Переяслав 1654 — казаки под властью царя. Гадяч 1658 — Украина третья часть Речи Посполитой (не вступило в силу).")],
  s5: [r("1648: Żółte Wody, Korsuń, Piławce — trzy klęski. 1651: Beresteczko — wielkie zwycięstwo.", "1648: Жёлтые Воды, Корсунь, Пилявцы — три поражения. 1651: Берестечко — большая победа."), r("Kozacy zaporoscy mieszkali na Siczy za porohami Dniepru; ich dowódcą był ataman.", "Запорожские казаки жили на Сечи за порогами Днепра; их предводителем был атаман.")],
};

export default function KhmelnytskyLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="khmelnytsky" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="khmelnytsky-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.cause, T.effect]} items={CAUSES} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="khmelnytsky-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="khmelnytsky-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={TREATIES} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="khmelnytsky-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="khmelnytsky-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
