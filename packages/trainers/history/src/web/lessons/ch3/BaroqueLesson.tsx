// Lesson for §18 "Barok i sarmatyzm" (Historia 6, GWO). Terms, people and dates follow the task
// bank of the same paragraph (templates/data/ch3.ts, BAROQUE and BAROQUE_DATES).
import { LessonIntro, Remember, Section, SpeciesGallery, Timeline, TrueFalse, TwoWaySort, type LessonProps, type SortItem, type Species, type Statement, type TimelineEvent, type Txt } from "@portal/lessons";
import { SarmatianDress } from "./SarmatianDress.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "XVII wiek to w sztuce czas baroku: złota, przepychu i ruchu, które miały olśnić wiernego w kościele i gościa w pałacu. Polska szlachta stworzyła w tym czasie własny styl życia — sarmatyzm. Uważała się za potomków starożytnych Sarmatów, nosiła kontusz i karabelę, a swoją złotą wolność miała za najlepszy ustrój świata.",
    "XVII век в искусстве — время барокко: золота, пышности и движения, которые должны были поразить верующего в костёле и гостя во дворце. Польская шляхта создала в это время собственный стиль жизни — сарматизм. Она считала себя потомками древних сарматов, носила кунтуш и карабелю, а свою золотую вольность считала лучшим строем в мире.",
  ),
  s1: r("Strój Sarmaty", "Наряд сармата"),
  s1intro: r("Dotknij części ubrania, żeby poznać jej nazwę i historię. Potem w trybie „Podpisz sam” sprawdź, czy je pamiętasz.", "Нажимай на части одежды, чтобы узнать их названия и историю. Потом в режиме «Подпиши сам» проверь, помнишь ли ты их."),
  s2: r("Twórcy i zabytki baroku", "Творцы и памятники барокко"),
  s2intro: r("Pisarze, pałace i obyczaje epoki. Dotknij karty, żeby dowiedzieć się więcej.", "Писатели, дворцы и обычаи эпохи. Нажми на карточку, чтобы узнать больше."),
  s3: r("Renesans czy barok?", "Возрождение или барокко?"),
  s3intro: r("Dwie epoki, dwa gusty. Do której pasuje każda cecha?", "Две эпохи, два вкуса. К какой подходит каждая черта?"),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Sprawdź, co naprawdę wiesz o sarmatyzmie.", "Проверь, что ты на самом деле знаешь о сарматизме."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Ułóż dzieła baroku od najstarszego do najmłodszego.", "Расставь произведения барокко от самого старого до самого нового."),
  sort: r("Renesans czy barok?", "Возрождение или барокко?"),
  sortHint: r("Renesans lubił spokój i harmonię, barok — ruch i przepych.", "Возрождение любило покой и гармонию, барокко — движение и пышность."),
  renaissance: r("renesans", "Возрождение"),
  baroque: r("barok", "барокко"),
  tf: r("Sarmatyzm", "Сарматизм"),
  timeline: r("Barok w Polsce rok po roku", "Барокко в Польше год за годом"),
  writer: r("pisarz", "писатель"),
  building: r("zabytek", "памятник"),
  custom: r("obyczaj", "обычай"),
} satisfies Record<string, Txt>;

const GALLERY: Species[] = [
  {
    icon: "📖",
    name: r("Jan Chryzostom Pasek", "Ян Хризостом Пасек"),
    tag: T.writer,
    text: r("Szlachcic i żołnierz Czarnieckiego, uczestnik wyprawy do Danii. Na starość spisał „Pamiętniki” — barwną, pełną przechwałek opowieść o wojnach, sejmikach, ucztach i bójkach XVII wieku.", "Шляхтич и солдат Чарнецкого, участник похода в Данию. На старости лет написал «Воспоминания» — красочный, полный похвальбы рассказ о войнах, сеймиках, пирах и драках XVII века."),
  },
  {
    icon: "✒️",
    name: r("Wacław Potocki", "Вацлав Потоцкий"),
    tag: T.writer,
    text: r("Poeta ziemianin. W poemacie „Wojna chocimska” opiewał zwycięstwo Chodkiewicza z 1621 roku jako wzór dawnej dzielności, a w innych utworach ostro krytykował wady szlachty.", "Поэт-помещик. В поэме «Хотинская война» он воспевал победу Ходкевича 1621 года как образец былой доблести, а в других произведениях резко критиковал пороки шляхты."),
  },
  {
    icon: "💌",
    name: r("Jan Andrzej Morsztyn", "Ян Анджей Морштын"),
    tag: T.writer,
    text: r("Poeta dworski i dyplomata. Pisał wyszukane, błyskotliwe wiersze o miłości, pełne zaskakujących porównań — typowe dla baroku, który lubił zadziwiać.", "Придворный поэт и дипломат. Писал изысканные, блестящие стихи о любви, полные неожиданных сравнений — типичные для барокко, которое любило удивлять."),
  },
  {
    icon: "🏛️",
    name: r("Pałac w Wilanowie", "Вилянувский дворец"),
    tag: T.building,
    text: r("Letnia rezydencja Jana III Sobieskiego pod Warszawą, budowana od 1677 roku. Barokowy pałac z ogrodem, rzeźbami i malowidłami sławiącymi zwycięstwa króla.", "Летняя резиденция Яна III Собеского под Варшавой, строившаяся с 1677 года. Барочный дворец с садом, скульптурами и росписями, прославляющими победы короля."),
  },
  {
    icon: "🏰",
    name: r("Zamek Krzyżtopór", "Замок Кшижтопур"),
    tag: T.building,
    text: r("Ogromna rezydencja magnacka Ossolińskich w Ujeździe (budowana od 1627 roku). Według legendy miała tyle okien, ile dni w roku. Zrujnowana w czasie potopu, do dziś stoi w ruinie.", "Огромная магнатская резиденция Оссолинских в Уязде (строилась с 1627 года). По легенде, в ней было столько окон, сколько дней в году. Разрушена во время потопа и до сих пор стоит в руинах."),
  },
  {
    icon: "⛪",
    name: r("Kościół św. Piotra i Pawła w Krakowie", "Костёл Святых Петра и Павла в Кракове"),
    tag: T.building,
    text: r("Pierwsza barokowa świątynia w Polsce, wzniesiona dla jezuitów od 1597 roku na wzór rzymskiego kościoła Il Gesù. Barokowe kościoły miały olśniewać złotem, rzeźbami i światłem.", "Первый барочный храм в Польше, построенный для иезуитов с 1597 года по образцу римской церкви Иль-Джезу. Барочные костёлы должны были ослеплять золотом, скульптурами и светом."),
  },
  {
    icon: "🖼️",
    name: r("Portret trumienny", "Трумный портрет"),
    tag: T.custom,
    text: r("Wizerunek zmarłego malowany na blasze, przybijany do trumny podczas wielodniowego pogrzebu. Zmarły patrzył na żałobników jak żywy — to wyłącznie polski zwyczaj sarmacki.", "Портрет покойного на жестяной пластине, прибиваемый к гробу во время многодневных похорон. Покойный смотрел на скорбящих как живой — это исключительно польский сарматский обычай."),
  },
  {
    icon: "🏡",
    name: r("Dwór szlachecki", "Шляхетская усадьба"),
    tag: T.custom,
    text: r("Drewniana siedziba średniej szlachty: ganek na kolumnach, wysoki dach, alkierze w narożach. Wokół sad, stawy i folwark. Szlachcic chwalił się gościnnością — uczty trwały dniami.", "Деревянный дом средней шляхты: крыльцо на колоннах, высокая крыша, угловые пристройки. Вокруг сад, пруды и фольварк. Шляхтич гордился гостеприимством — пиры длились днями."),
  },
];

const STYLES: SortItem[] = [
  {
    name: r("spokój, harmonia i proste proporcje", "покой, гармония и простые пропорции"),
    group: 0,
    why: r("renesans naśladował umiar antyku", "Возрождение подражало умеренности античности"),
  },
  {
    name: r("przepych, złoto i ruch", "пышность, золото и движение"),
    group: 1,
    why: r("barok chciał olśnić i zadziwić", "барокко хотело ослепить и удивить"),
  },
  {
    name: r("Wawel Zygmunta Starego i Kaplica Zygmuntowska", "Вавель Сигизмунда Старого и часовня Сигизмунда"),
    group: 0,
    why: r("dzieła włoskich mistrzów renesansu w Krakowie", "произведения итальянских мастеров Возрождения в Кракове"),
  },
  {
    name: r("pałac w Wilanowie i kościoły jezuitów", "дворец в Вилянуве и костёлы иезуитов"),
    group: 1,
    why: r("barokowe budowle XVII wieku", "барочные постройки XVII века"),
  },
  {
    name: r("Mikołaj Rej i Jan Kochanowski", "Миколай Рей и Ян Кохановский"),
    group: 0,
    why: r("poeci polskiego renesansu XVI wieku", "поэты польского Возрождения XVI века"),
  },
  {
    name: r("Jan Chryzostom Pasek i Wacław Potocki", "Ян Хризостом Пасек и Вацлав Потоцкий"),
    group: 1,
    why: r("pisarze polskiego baroku XVII wieku", "писатели польского барокко XVII века"),
  },
  {
    name: r("człowiek i jego rozum w centrum uwagi", "человек и его разум в центре внимания"),
    group: 0,
    why: r("humanizm — hasło renesansu", "гуманизм — девиз Возрождения"),
  },
  {
    name: r("przemijanie, śmierć i zaskakujące porównania w poezji", "бренность, смерть и неожиданные сравнения в поэзии"),
    group: 1,
    why: r("ulubione tematy poetów baroku, np. Morsztyna", "любимые темы поэтов барокко, например Морштына"),
  },
];

const FACTS: Statement[] = [
  {
    text: r("Szlachta uważała się za potomków starożytnego ludu Sarmatów.", "Шляхта считала себя потомками древнего народа сарматов."),
    truth: true,
    why: r("Sarmaci byli koczownikami znad Morza Czarnego; szlachta wierzyła, że od nich odziedziczyła waleczność i umiłowanie wolności.", "Сарматы были кочевниками с Чёрного моря; шляхта верила, что унаследовала от них воинственность и любовь к свободе."),
  },
  {
    text: r("Strój sarmacki — kontusz, żupan, pas — wzorowano na modzie francuskiej.", "Сарматский наряд — кунтуш, жупан, пояс — был скопирован с французской моды."),
    truth: false,
    why: r("Wzorowano go na strojach Wschodu: tureckich, perskich i węgierskich. Modę francuską Sarmaci wyśmiewali.", "Его заимствовали из одежды Востока: турецкой, персидской и венгерской. Французскую моду сарматы высмеивали."),
  },
  {
    text: r("Mesjanizm to przekonanie, że Polska ma szczególną misję od Boga.", "Мессианство — это убеждение, что у Польши особая миссия от Бога."),
    truth: true,
    why: r("Szlachta wierzyła, że Rzeczpospolita jest przedmurzem chrześcijaństwa, broniącym Europy przed Turkami.", "Шляхта верила, что Речь Посполитая — оплот христианства, защищающий Европу от турок."),
  },
  {
    text: r("Sarmaci chętnie przyjmowali obce zwyczaje i uczyli się od cudzoziemców.", "Сарматы охотно перенимали чужие обычаи и учились у иностранцев."),
    truth: false,
    why: r("Przeciwnie — nasilała się ksenofobia: niechęć do cudzoziemców i wszystkiego, co obce.", "Наоборот — усиливалась ксенофобия: неприязнь к иностранцам и ко всему чужому."),
  },
  {
    text: r("Portret trumienny malowano na blasze i przybijano do trumny.", "Трумный портрет писали на жести и прибивали к гробу."),
    truth: true,
    why: r("Po pogrzebie portret wieszano w kościele; dziś to cenne zabytki malarstwa sarmackiego.", "После похорон портрет вешали в костёле; сегодня это ценные памятники сарматской живописи."),
  },
  {
    text: r("Barokowe kościoły były skromne i pozbawione ozdób.", "Барочные костёлы были скромными и без украшений."),
    truth: false,
    why: r("Były pełne złota, rzeźb, malowideł i światła — Kościół chciał w ten sposób olśnić wiernych.", "Они были полны золота, скульптур, росписей и света — церковь хотела так поразить верующих."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("początek budowy kościoła św. Piotra i Pawła w Krakowie", "начало строительства костёла Святых Петра и Павла в Кракове"),
    when: "1597",
    note: r("pierwsza barokowa świątynia w Polsce", "первый барочный храм в Польше"),
  },
  {
    name: r("początek budowy zamku Krzyżtopór", "начало строительства замка Кшижтопур"),
    when: "1627",
  },
  {
    name: r("odsłonięcie kolumny Zygmunta III w Warszawie", "открытие колонны Сигизмунда III в Варшаве"),
    when: "1644",
  },
  {
    name: r("„Wojna chocimska” Wacława Potockiego", "«Хотинская война» Вацлава Потоцкого"),
    when: "1670",
  },
  {
    name: r("początek budowy pałacu w Wilanowie", "начало строительства дворца в Вилянуве"),
    when: "1677",
    note: r("letnia rezydencja Jana III Sobieskiego", "летняя резиденция Яна III Собеского"),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [r("Strój szlachecki: żupan (pod spodem), kontusz z wylotami (na wierzchu), pas kontuszowy, karabela, kołpak.", "Шляхетский наряд: жупан (снизу), кунтуш с вылетами (сверху), кунтушовый пояс, карабеля, колпак."), r("Wzorowano go na modzie Wschodu, nie Zachodu.", "Его заимствовали из моды Востока, а не Запада.")],
  s2: [
    r("Pisarze baroku: Jan Chryzostom Pasek („Pamiętniki”), Wacław Potocki („Wojna chocimska”), Jan Andrzej Morsztyn (wiersze o miłości).", "Писатели барокко: Ян Хризостом Пасек («Воспоминания»), Вацлав Потоцкий («Хотинская война»), Ян Анджей Морштын (стихи о любви)."),
    r("Zabytki: pałac w Wilanowie, zamek Krzyżtopór, kościoły jezuitów; obyczaje: portret trumienny, dwór szlachecki.", "Памятники: Вилянувский дворец, замок Кшижтопур, костёлы иезуитов; обычаи: трумный портрет, шляхетская усадьба."),
  ],
  s3: [r("Barok (XVII w.): przepych, złoto, ruch, kontrast — ma olśnić. Renesans (XVI w.): harmonia, umiar, wzory antyku.", "Барокко (XVII в.): пышность, золото, движение, контраст — должно ослепить. Возрождение (XVI в.): гармония, умеренность, античные образцы.")],
  s4: [r("Sarmatyzm: szlachta jako potomkowie Sarmatów, złota wolność, mesjanizm (Polska przedmurzem chrześcijaństwa), ksenofobia.", "Сарматизм: шляхта как потомки сарматов, золотая вольность, мессианство (Польша — оплот христианства), ксенофобия.")],
};

export default function BaroqueLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="baroque" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="baroque-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <SarmatianDress lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="baroque-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={GALLERY} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="baroque-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.renaissance, T.baroque]} items={STYLES} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="baroque-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="baroque-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
