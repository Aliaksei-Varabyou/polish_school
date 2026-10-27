// Lesson for §12 "Wojny ze Szwecją i z Moskwą" (Historia 6, GWO). Names and dates follow the task
// bank of the same paragraph (templates/data/ch3.ts, SWEDEN and SWEDEN_DATES).
import { CompareTabs, LessonIntro, Remember, Section, Timeline, TrueFalse, TwoWaySort, type CompareCard, type LessonProps, type SortItem, type Statement, type TimelineEvent, type Txt } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "W 1587 roku królem Polski został Zygmunt III Waza — syn króla Szwecji. Kiedy stracił koronę szwedzką, Rzeczpospolita na kilkadziesiąt lat weszła w wojny ze Szwecją. W tym samym czasie Polacy mieszali się w sprawy Moskwy, a husaria odnosiła swoje najsłynniejsze zwycięstwa: Kircholm i Kłuszyn.",
    "В 1587 году королём Польши стал Сигизмунд III Ваза — сын короля Швеции. Когда он потерял шведскую корону, Речь Посполитая на десятилетия вступила в войны со Швецией. В то же время поляки вмешивались в дела Москвы, а гусария одерживала свои самые знаменитые победы: Кирхгольм и Клушино.",
  ),
  s1: r("Dwa fronty: Szwecja i Moskwa", "Два фронта: Швеция и Москва"),
  s1intro: r("Każda bitwa, każdy wódz i każde miejsce należy do jednej z dwóch wojen. Przypisz je właściwie.", "Каждая битва, каждый полководец и каждое место относятся к одной из двух войн. Распредели их правильно."),
  s2: r("Kircholm i Kłuszyn — dwie wielkie wiktorie", "Кирхгольм и Клушино — две великие победы"),
  s2intro: r("Porównaj dwa zwycięstwa husarii. Przełączaj zakładki i patrz, co je łączy, a co różni.", "Сравни две победы гусарии. Переключай вкладки и смотри, что их объединяет, а что отличает."),
  s3: r("Prawda czy fałsz?", "Правда или ложь?"),
  s3intro: r("Sprawdź, czy dobrze rozumiesz, o co toczyły się wojny Zygmunta III.", "Проверь, правильно ли ты понимаешь, за что велись войны Сигизмунда III."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  sort: r("Wojna ze Szwecją czy z Moskwą?", "Война со Швецией или с Москвой?"),
  sortHint: r("Pomyśl: Inflanty i Bałtyk — czy Kreml i Smoleńsk?", "Подумай: Ливония и Балтика — или Кремль и Смоленск?"),
  sweden: r("Szwecja", "Швеция"),
  moscow: r("Moskwa", "Москва"),
  tf: r("Wojny Zygmunta III", "Войны Сигизмунда III"),
  timeline: r("Od elekcji Zygmunta III do rozejmu w Dywilinie", "От избрания Сигизмунда III до Деулинского перемирия"),
  year: r("Rok", "Год"),
  commander: r("Dowódca", "Командующий"),
  enemy: r("Przeciwnik", "Противник"),
  where: r("Gdzie", "Где"),
  odds: r("Siły", "Силы"),
  result: r("Skutek", "Итог"),
} satisfies Record<string, Txt>;

const FRONTS: SortItem[] = [
  {
    name: r("Inflanty", "Ливония"),
    group: 0,
    why: r("o tę krainę nad Bałtykiem walczono ze Szwedami", "за эту землю на Балтике воевали со шведами"),
  },
  {
    name: r("bitwa pod Kircholmem (1605)", "битва при Кирхгольме (1605)"),
    group: 0,
    why: r("Chodkiewicz rozbił tu armię szwedzką", "здесь Ходкевич разбил шведскую армию"),
  },
  {
    name: r("Jan Karol Chodkiewicz", "Ян Кароль Ходкевич"),
    group: 0,
    why: r("hetman litewski, zwycięzca spod Kircholmu", "литовский гетман, победитель при Кирхгольме"),
  },
  {
    name: r("utracona korona Zygmunta III", "потерянная корона Сигизмунда III"),
    group: 0,
    why: r("król chciał odzyskać tron szwedzki, który odebrał mu stryj", "король хотел вернуть шведский трон, отнятый дядей"),
  },
  {
    name: r("Dymitr Samozwaniec", "Лжедмитрий I"),
    group: 1,
    why: r("polscy magnaci osadzili go na tronie carów", "польские магнаты посадили его на царский трон"),
  },
  {
    name: r("bitwa pod Kłuszynem (1610)", "битва при Клушине (1610)"),
    group: 1,
    why: r("Żółkiewski pokonał tu armię rosyjsko-szwedzką", "здесь Жолкевский разбил русско-шведскую армию"),
  },
  {
    name: r("polska załoga na Kremlu", "польский гарнизон в Кремле"),
    group: 1,
    why: r("Polacy stali w Moskwie w latach 1610–1612", "поляки стояли в Москве в 1610–1612 годах"),
  },
  {
    name: r("Smoleńsk i rozejm w Dywilinie", "Смоленск и Деулинское перемирие"),
    group: 1,
    why: r("twierdzę zdobył Zygmunt III, a rozejm z Rosją ją potwierdził", "крепость взял Сигизмунд III, а перемирие с Россией это закрепило"),
  },
];

const BATTLES: CompareCard[] = [
  {
    id: "kircholm",
    icon: "🐎",
    name: r("Kircholm", "Кирхгольм"),
    rows: [
      { label: T.year, value: r("1605", "1605") },
      {
        label: T.commander,
        value: r("Jan Karol Chodkiewicz, hetman wielki litewski", "Ян Кароль Ходкевич, великий гетман литовский"),
      },
      {
        label: T.enemy,
        value: r("Szwedzi króla Karola IX", "шведы короля Карла IX"),
      },
      { label: T.where, value: r("Inflanty, pod Rygą", "Ливония, под Ригой") },
      {
        label: T.odds,
        value: r("ok. 4 tys. Polaków i Litwinów przeciw ok. 11 tys. Szwedów", "ок. 4 тыс. поляков и литовцев против ок. 11 тыс. шведов"),
      },
      {
        label: T.result,
        value: r("rozbicie armii szwedzkiej w kilka godzin; Szwedzi na lata zapamiętali husarię", "разгром шведской армии за несколько часов; шведы надолго запомнили гусарию"),
      },
    ],
    text: r("Chodkiewicz udał odwrót, wyciągnął Szwedów z dobrej pozycji na równinę i uderzył husarią. Trzykrotnie liczniejsza armia poszła w rozsypkę.", "Ходкевич изобразил отступление, выманил шведов с удобной позиции на равнину и ударил гусарией. Втрое большая армия рассыпалась."),
  },
  {
    id: "kluszyn",
    icon: "⚔️",
    name: r("Kłuszyn", "Клушино"),
    rows: [
      { label: T.year, value: r("1610", "1610") },
      {
        label: T.commander,
        value: r("Stanisław Żółkiewski, hetman polny koronny", "Станислав Жолкевский, польный коронный гетман"),
      },
      {
        label: T.enemy,
        value: r("wojska cara Wasyla Szujskiego i szwedzcy najemnicy", "войска царя Василия Шуйского и шведские наёмники"),
      },
      {
        label: T.where,
        value: r("między Smoleńskiem a Moskwą", "между Смоленском и Москвой"),
      },
      {
        label: T.odds,
        value: r("ok. 7 tys. Polaków przeciw ok. 30 tys. przeciwników", "ок. 7 тыс. поляков против ок. 30 тыс. противников"),
      },
      {
        label: T.result,
        value: r("droga do Moskwy otwarta; bojarzy wybrali carem królewicza Władysława", "дорога на Москву открыта; бояре избрали царём королевича Владислава"),
      },
    ],
    text: r("Husaria Żółkiewskiego szarżowała kilkanaście razy, aż rozbiła o wiele większą armię. Hetman wszedł do Moskwy i wziął do niewoli cara Wasyla Szujskiego.", "Гусария Жолкевского атаковала больше десяти раз, пока не разбила намного большую армию. Гетман вошёл в Москву и взял в плен царя Василия Шуйского."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("elekcja Zygmunta III Wazy", "избрание Сигизмунда III Вазы"),
    when: "1587",
  },
  {
    name: r("przeniesienie stolicy do Warszawy", "перенос столицы в Варшаву"),
    when: "1596",
    note: r("dwór opuścił Kraków po pożarze Wawelu", "двор покинул Краков после пожара на Вавеле"),
  },
  {
    name: r("bitwa pod Kircholmem", "битва при Кирхгольме"),
    when: "1605",
    note: r("Chodkiewicz rozbija Szwedów", "Ходкевич разбивает шведов"),
  },
  {
    name: r("bitwa pod Kłuszynem", "битва при Клушине"),
    when: "1610",
    note: r("Żółkiewski otwiera drogę do Moskwy", "Жолкевский открывает дорогу на Москву"),
  },
  { name: r("zdobycie Smoleńska", "взятие Смоленска"), when: "1611" },
  {
    name: r("kapitulacja polskiej załogi Kremla", "капитуляция польского гарнизона Кремля"),
    when: "1612",
  },
  {
    name: r("rozejm w Dywilinie", "Деулинское перемирие"),
    when: "1619",
    note: r("Smoleńsk, ziemia czernihowska i siewierska przy Rzeczypospolitej", "Смоленск, Черниговская и Северская земли — у Речи Посполитой"),
  },
];

const FACTS: Statement[] = [
  {
    text: r("Zygmunt III Waza był jednocześnie królem Polski i Szwecji.", "Сигизмунд III Ваза был одновременно королём Польши и Швеции."),
    truth: true,
    why: r("Od 1592 do 1599 roku — potem Szwedzi pozbawili go tronu, a królem został jego stryj Karol.", "С 1592 по 1599 год — потом шведы лишили его трона, и королём стал его дядя Карл."),
  },
  {
    text: r("Wojny ze Szwecją toczyły się o Inflanty i o koronę szwedzką Zygmunta III.", "Войны со Швецией велись за Ливонию и за шведскую корону Сигизмунда III."),
    truth: true,
    why: r("Król nie pogodził się z utratą tronu, a oba państwa chciały panować nad Bałtykiem.", "Король не смирился с потерей трона, а оба государства хотели господствовать на Балтике."),
  },
  {
    text: r("Pod Kircholmem dowodził Stanisław Żółkiewski.", "При Кирхгольме командовал Станислав Жолкевский."),
    truth: false,
    why: r("Pod Kircholmem (1605) zwyciężył Jan Karol Chodkiewicz; Żółkiewski wygrał pod Kłuszynem (1610).", "При Кирхгольме (1605) победил Ян Кароль Ходкевич; Жолкевский выиграл при Клушине (1610)."),
  },
  {
    text: r("Dymitriady to oficjalne wojny Rzeczypospolitej z Rosją.", "Димитриады — это официальные войны Речи Посполитой с Россией."),
    truth: false,
    why: r("Były to prywatne wyprawy magnatów wspierających Dymitra Samozwańca; sejm wojny nie ogłosił.", "Это были частные походы магнатов в поддержку Лжедмитрия; сейм войны не объявлял."),
  },
  {
    text: r("Polska załoga przebywała na Kremlu przez dwa lata.", "Польский гарнизон находился в Кремле два года."),
    truth: true,
    why: r("W latach 1610–1612; wygłodzeni żołnierze poddali się pospolitemu ruszeniu Minina i Pożarskiego.", "В 1610–1612 годах; изголодавшиеся солдаты сдались ополчению Минина и Пожарского."),
  },
  {
    text: r("Po rozejmie w Dywilinie Rzeczpospolita straciła Smoleńsk.", "После Деулинского перемирия Речь Посполитая потеряла Смоленск."),
    truth: false,
    why: r("Przeciwnie: zatrzymała Smoleńsk oraz ziemię czernihowską i siewierską — miała wtedy największe terytorium w dziejach.", "Наоборот: она сохранила Смоленск, Черниговскую и Северскую земли — тогда её территория была наибольшей в истории."),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3", Txt[]> = {
  s1: [r("Szwecja: Inflanty, korona szwedzka, Kircholm 1605 (Chodkiewicz).", "Швеция: Ливония, шведская корона, Кирхгольм 1605 (Ходкевич)."), r("Moskwa: dymitriady, Kłuszyn 1610 (Żółkiewski), Polacy na Kremlu 1610–1612, Smoleńsk, rozejm w Dywilinie 1619.", "Москва: Димитриады, Клушино 1610 (Жолкевский), поляки в Кремле 1610–1612, Смоленск, Деулинское перемирие 1619.")],
  s2: [r("Husaria — ciężka jazda z kopiami i skrzydłami — wygrywała z o wiele liczniejszym wrogiem.", "Гусария — тяжёлая конница с копьями и крыльями — побеждала намного более многочисленного врага."), r("Hetman to najwyższy dowódca wojsk Korony albo Litwy, mianowany dożywotnio.", "Гетман — верховный командующий войсками Короны или Литвы, назначаемый пожизненно.")],
  s3: [
    r("Zygmunt III Waza: król Polski od 1587, król Szwecji 1592–1599; w 1596 roku przeniósł stolicę do Warszawy.", "Сигизмунд III Ваза: король Польши с 1587, король Швеции 1592–1599; в 1596 году перенёс столицу в Варшаву."),
    r("Rozejm w Dywilinie (1619): Smoleńsk, ziemia czernihowska i siewierska przy Rzeczypospolitej.", "Деулинское перемирие (1619): Смоленск, Черниговская и Северская земли у Речи Посполитой."),
  ],
};

export default function SwedenLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="sweden" sections={[T.s1, T.s2, T.s3, T.s4]} />

      <Section id="sweden-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.sweden, T.moscow]} items={FRONTS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="sweden-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={BATTLES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="sweden-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="sweden-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
