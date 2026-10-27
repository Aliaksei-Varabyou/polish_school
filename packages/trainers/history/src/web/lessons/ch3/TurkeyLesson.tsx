// Lesson for §13 "Konflikty z Turcją i ze Szwecją" (Historia 6, GWO). Names and dates follow the
// task bank of the same paragraph (templates/data/ch3.ts, TURKEY and TURKEY_DATES).
import { LessonIntro, Remember, Section, SpeciesGallery, Timeline, TrueFalse, TwoWaySort, type LessonProps, type SortItem, type Species, type Statement, type TimelineEvent, type Txt } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Na południowym wschodzie Rzeczpospolita graniczyła z potężną Turcją. Kozacy napadali na tureckie wybrzeża, Tatarzy na polskie kresy — i w 1620 roku wybuchła wojna. Ledwie ją zakończono pod Chocimiem, a od północy znów uderzyła Szwecja: król Gustaw II Adolf chciał opanować ujście Wisły.",
    "На юго-востоке Речь Посполитая граничила с могущественной Турцией. Казаки нападали на турецкие берега, татары — на польские окраины, и в 1620 году вспыхнула война. Едва её закончили под Хотином, как с севера снова ударила Швеция: король Густав II Адольф хотел захватить устье Вислы.",
  ),
  s1: r("Kto jest kim na południu i na północy", "Кто есть кто на юге и на севере"),
  s1intro: r("Dotknij karty, żeby poznać ludy, państwa i wodzów tych wojen.", "Нажми на карточку, чтобы узнать о народах, государствах и полководцах этих войн."),
  s2: r("Turcja czy Szwecja?", "Турция или Швеция?"),
  s2intro: r("Dwie wojny, dwa końce państwa. Przypisz bitwy, układy i ludzi do właściwego przeciwnika.", "Две войны, два конца государства. Распредели битвы, договоры и людей по нужному противнику."),
  s3: r("Prawda czy fałsz?", "Правда или ложь?"),
  s3intro: r("Kilka zdań o wojnach lat 1620–1635. Które są prawdziwe?", "Несколько утверждений о войнах 1620–1635 годов. Какие из них верны?"),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  sort: r("Wojna z Turcją czy ze Szwecją?", "Война с Турцией или со Швецией?"),
  sortHint: r("Dniestr i Mołdawia — czy Bałtyk i Prusy?", "Днестр и Молдавия — или Балтика и Пруссия?"),
  turkey: r("Turcja", "Турция"),
  sweden: r("Szwecja", "Швеция"),
  tf: r("Chocim i ujście Wisły", "Хотин и устье Вислы"),
  timeline: r("Od Cecory do Sztumskiej Wsi", "От Цецоры до Штумсдорфа"),
  south: r("południe", "юг"),
  north: r("północ", "север"),
} satisfies Record<string, Txt>;

const PLAYERS: Species[] = [
  {
    icon: "🏇",
    name: r("Kozacy", "Казаки"),
    tag: T.south,
    text: r("Wolni ludzie z naddnieprzańskich stepów. Żyli z wypraw wojennych, a na czajkach — lekkich łodziach — napadali na tureckie wybrzeża Morza Czarnego. Turcja obwiniała o to Rzeczpospolitą.", "Вольные люди с приднепровских степей. Жили военными походами, а на чайках — лёгких лодках — нападали на турецкие берега Чёрного моря. Турция винила в этом Речь Посполитую."),
  },
  {
    icon: "🏹",
    name: r("Tatarzy", "Татары"),
    tag: T.south,
    text: r("Mieszkańcy Chanatu Krymskiego, zależnego od sułtana. Co roku najeżdżali kresy Rzeczypospolitej, paląc wsie i uprowadzając ludzi w jasyr — na targi niewolników.", "Жители Крымского ханства, зависимого от султана. Каждый год совершали набеги на окраины Речи Посполитой, сжигая деревни и уводя людей в ясырь — на невольничьи рынки."),
  },
  {
    icon: "🌙",
    name: r("Imperium Osmańskie", "Османская империя"),
    tag: T.south,
    text: r("Potężne państwo tureckie ze stolicą w Stambule. Sułtan Osman II w 1621 roku poprowadził na Rzeczpospolitą ponad stutysięczną armię.", "Могущественное турецкое государство со столицей в Стамбуле. Султан Осман II в 1621 году повёл на Речь Посполитую армию более чем в сто тысяч человек."),
  },
  {
    icon: "⚔️",
    name: r("Stanisław Żółkiewski", "Станислав Жолкевский"),
    tag: T.south,
    text: r("Hetman wielki koronny, zwycięzca spod Kłuszyna. W 1620 roku poprowadził wyprawę do Mołdawii; pod Cecorą jego wojsko zostało rozbite, a sędziwy hetman zginął w odwrocie.", "Великий коронный гетман, победитель при Клушине. В 1620 году повёл поход в Молдавию; при Цецоре его войско было разбито, а престарелый гетман погиб при отступлении."),
  },
  {
    icon: "🛡️",
    name: r("Jan Karol Chodkiewicz", "Ян Кароль Ходкевич"),
    tag: T.south,
    text: r("Zwycięzca spod Kircholmu. W 1621 roku dowodził obroną obozu pod Chocimiem przeciw armii sułtana; zmarł w czasie oblężenia, ale Turcy nie przełamali obrony.", "Победитель при Кирхгольме. В 1621 году командовал обороной лагеря под Хотином против армии султана; умер во время осады, но турки не прорвали оборону."),
  },
  {
    icon: "👑",
    name: r("Gustaw II Adolf", "Густав II Адольф"),
    tag: T.north,
    text: r("Król Szwecji, jeden z najlepszych wodzów epoki. W 1626 roku wylądował w Prusach i zajął porty nad Bałtykiem, żeby przejąć cła z handlu gdańskiego.", "Король Швеции, один из лучших полководцев эпохи. В 1626 году высадился в Пруссии и занял балтийские порты, чтобы забрать пошлины с гданьской торговли."),
  },
  {
    icon: "🐎",
    name: r("Stanisław Koniecpolski", "Станислав Конецпольский"),
    tag: T.north,
    text: r("Hetman polny koronny. Wojną podjazdową zatrzymał Szwedów w Prusach, a w 1629 roku pobił ich pod Trzcianą — sam Gustaw Adolf ledwo uszedł z życiem.", "Польный коронный гетман. Малой войной остановил шведов в Пруссии, а в 1629 году разбил их под Тшцяной — сам Густав Адольф едва спасся."),
  },
  {
    icon: "⛵",
    name: r("Flota polska", "Польский флот"),
    tag: T.north,
    text: r("Zygmunt III zbudował kilkanaście okrętów. W 1627 roku pod Oliwą pokonały one szwedzką eskadrę blokującą Gdańsk — jedyne wielkie zwycięstwo morskie w dziejach Polski.", "Сигизмунд III построил больше десяти кораблей. В 1627 году при Оливе они победили шведскую эскадру, блокировавшую Гданьск, — единственная крупная морская победа в истории Польши."),
  },
];

const SIDES: SortItem[] = [
  {
    name: r("bitwa pod Cecorą (1620)", "битва при Цецоре (1620)"),
    group: 0,
    why: r("klęska w Mołdawii; zginął Żółkiewski", "поражение в Молдавии; погиб Жолкевский"),
  },
  {
    name: r("obrona Chocimia (1621)", "оборона Хотина (1621)"),
    group: 0,
    why: r("Chodkiewicz zatrzymał armię sułtana nad Dniestrem", "Ходкевич остановил армию султана на Днестре"),
  },
  {
    name: r("sułtan Osman II", "султан Осман II"),
    group: 0,
    why: r("poprowadził Turków na Chocim", "повёл турок на Хотин"),
  },
  {
    name: r("lisowczycy w Siedmiogrodzie", "лисовчики в Трансильвании"),
    group: 0,
    why: r("ich najazd rozgniewał Turcję, lennika Siedmiogrodu", "их набег разгневал Турцию, сюзерена Трансильвании"),
  },
  {
    name: r("bitwa morska pod Oliwą (1627)", "морская битва при Оливе (1627)"),
    group: 1,
    why: r("polska flota pobiła szwedzką eskadrę pod Gdańskiem", "польский флот разбил шведскую эскадру под Гданьском"),
  },
  {
    name: r("wojna o ujście Wisły", "война за устье Вислы"),
    group: 1,
    why: r("Gustaw Adolf chciał portów i ceł gdańskich", "Густав Адольф хотел портов и гданьских пошлин"),
  },
  {
    name: r("rozejm w Altmarku (1629)", "Альтмаркское перемирие (1629)"),
    group: 1,
    why: r("Szwedzi zatrzymali porty pruskie i cło gdańskie", "шведы сохранили прусские порты и гданьскую пошлину"),
  },
  {
    name: r("rozejm w Sztumskiej Wsi (1635)", "Штумсдорфское перемирие (1635)"),
    group: 1,
    why: r("Władysław IV odzyskał porty pruskie", "Владислав IV вернул прусские порты"),
  },
];

const FACTS: Statement[] = [
  {
    text: r("Pod Cecorą w 1620 roku zginął hetman Stanisław Żółkiewski.", "При Цецоре в 1620 году погиб гетман Станислав Жолкевский."),
    truth: true,
    why: r("Sędziwy hetman poległ w odwrocie; jego głowę Turcy wysłali sułtanowi.", "Престарелый гетман погиб при отступлении; его голову турки отправили султану."),
  },
  {
    text: r("Pod Chocimiem w 1621 roku Polacy odnieśli druzgocące zwycięstwo i ruszyli na Stambuł.", "Под Хотином в 1621 году поляки одержали сокрушительную победу и двинулись на Стамбул."),
    truth: false,
    why: r("Była to obrona warownego obozu. Turcy nie zdołali go zdobyć i zawarto pokój, który utrzymał dawną granicę na Dniestrze.", "Это была оборона укреплённого лагеря. Турки не смогли его взять, и был заключён мир, сохранивший прежнюю границу по Днестру."),
  },
  {
    text: r("W obronie Chocimia pomagali Polakom Kozacy.", "В обороне Хотина полякам помогали казаки."),
    truth: true,
    why: r("Kilkadziesiąt tysięcy Kozaków pod wodzą Piotra Konaszewicza-Sahajdacznego walczyło obok wojsk koronnych.", "Несколько десятков тысяч казаков во главе с Петром Конашевичем-Сагайдачным сражались рядом с коронными войсками."),
  },
  {
    text: r("Gustaw II Adolf chciał opanować ujście Wisły, żeby pobierać cła z handlu gdańskiego.", "Густав II Адольф хотел захватить устье Вислы, чтобы собирать пошлины с гданьской торговли."),
    truth: true,
    why: r("Z ceł pruskich Szwecja finansowała swoje wojny w Niemczech.", "Прусскими пошлинами Швеция оплачивала свои войны в Германии."),
  },
  {
    text: r("Bitwa pod Oliwą była bitwą lądową pod Gdańskiem.", "Битва при Оливе была сухопутным сражением под Гданьском."),
    truth: false,
    why: r("To bitwa morska: polskie okręty pokonały szwedzką eskadrę na redzie Gdańska w 1627 roku.", "Это морское сражение: польские корабли победили шведскую эскадру на рейде Гданьска в 1627 году."),
  },
  {
    text: r("Rozejm w Sztumskiej Wsi (1635) był dla Polski korzystniejszy niż rozejm w Altmarku (1629).", "Штумсдорфское перемирие (1635) было для Польши выгоднее Альтмаркского (1629)."),
    truth: true,
    why: r("W Altmarku Szwedzi zatrzymali porty pruskie i cła; w Sztumskiej Wsi Władysław IV je odzyskał.", "В Альтмарке шведы сохранили прусские порты и пошлины; в Штумсдорфе Владислав IV их вернул."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("bitwa pod Cecorą", "битва при Цецоре"),
    when: "1620",
    note: r("śmierć hetmana Żółkiewskiego", "гибель гетмана Жолкевского"),
  },
  {
    name: r("obrona Chocimia", "оборона Хотина"),
    when: "1621",
    note: r("Chodkiewicz zatrzymuje armię Osmana II", "Ходкевич останавливает армию Османа II"),
  },
  {
    name: r("Gustaw II Adolf ląduje w Prusach", "Густав II Адольф высаживается в Пруссии"),
    when: "1626",
    note: r("początek wojny o ujście Wisły", "начало войны за устье Вислы"),
  },
  {
    name: r("bitwa morska pod Oliwą", "морская битва при Оливе"),
    when: "1627",
  },
  {
    name: r("rozejm w Altmarku", "Альтмаркское перемирие"),
    when: "1629",
    note: r("porty pruskie i cła dla Szwecji", "прусские порты и пошлины — Швеции"),
  },
  { name: r("elekcja Władysława IV", "избрание Владислава IV"), when: "1632" },
  {
    name: r("rozejm w Sztumskiej Wsi", "Штумсдорфское перемирие"),
    when: "1635",
    note: r("porty pruskie wracają do Rzeczypospolitej", "прусские порты возвращаются Речи Посполитой"),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3", Txt[]> = {
  s1: [
    r("Przyczyny wojny z Turcją: napady Kozaków na Turcję i Tatarów na Polskę oraz spory o Mołdawię.", "Причины войны с Турцией: нападения казаков на Турцию и татар на Польшу, а также споры из-за Молдавии."),
    r("Przyczyna wojny ze Szwecją: Gustaw II Adolf chciał ujścia Wisły i ceł z handlu gdańskiego.", "Причина войны со Швецией: Густав II Адольф хотел устья Вислы и пошлин с гданьской торговли."),
  ],
  s2: [r("Turcja: Cecora 1620 (śmierć Żółkiewskiego), Chocim 1621 (Chodkiewicz).", "Турция: Цецора 1620 (гибель Жолкевского), Хотин 1621 (Ходкевич)."), r("Szwecja: wojna o ujście Wisły 1626–1629, Oliwa 1627, rozejm w Altmarku 1629, Sztumska Wieś 1635.", "Швеция: война за устье Вислы 1626–1629, Олива 1627, перемирие в Альтмарке 1629, Штумсдорф 1635.")],
  s3: [r("Władysław IV (król od 1632) odzyskał porty pruskie i obronił Smoleńsk przed Rosją.", "Владислав IV (король с 1632) вернул прусские порты и отстоял Смоленск от России."), r("Oliwa 1627 to jedyne wielkie zwycięstwo morskie w dziejach Polski.", "Олива 1627 — единственная крупная морская победа в истории Польши.")],
};

export default function TurkeyLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="turkey" sections={[T.s1, T.s2, T.s3, T.s4]} />

      <Section id="turkey-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={PLAYERS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="turkey-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.turkey, T.sweden]} items={SIDES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="turkey-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="turkey-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
