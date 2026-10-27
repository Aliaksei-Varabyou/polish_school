// Lesson for §16 "Kryzys Rzeczypospolitej" (Historia 6, GWO). Terms and dates follow the task bank
// of the same paragraph (templates/data/ch3.ts, CRISIS and CRISIS_DATES).
import { CycleDiagram, LessonIntro, MatchQuiz, OrderGame, Remember, Section, Timeline, TrueFalse, type CycleStage, type LessonProps, type QuizItem, type QuizOption, type Statement, type TimelineEvent, type Txt } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Wojny połowy XVII wieku zostawiły Rzeczpospolitą zrujnowaną i wyludnioną. Jeszcze groźniejsza była choroba ustroju: od 1652 roku jeden poseł mógł zerwać sejm, szlachta podnosiła rokosze przeciw królowi, a państwem rządzili w praktyce najbogatsi magnaci. Zmęczony tym wszystkim Jan Kazimierz w 1668 roku zrzekł się korony.",
    "Войны середины XVII века оставили Речь Посполитую разорённой и обезлюдевшей. Ещё опаснее была болезнь государственного строя: с 1652 года один посол мог сорвать сейм, шляхта поднимала рокоши против короля, а страной на деле правили богатейшие магнаты. Уставший от всего этого Ян Казимир в 1668 году отказался от короны.",
  ),
  s1: r("Jak jeden poseł zrywał sejm", "Как один посол срывал сейм"),
  s1intro: r("Ułóż po kolei, co działo się od sejmiku do zerwanego sejmu.", "Расставь по порядку, что происходило от сеймика до сорванного сейма."),
  s2: r("Błędne koło kryzysu", "Порочный круг кризиса"),
  s2intro: r("Słabość państwa napędzała samą siebie. Przejdź przez koło i zobacz, gdzie można je było przerwać.", "Слабость государства подпитывала саму себя. Пройди по кругу и посмотри, где его можно было разорвать."),
  s3: r("Pojęcia kryzysu", "Понятия кризиса"),
  s3intro: r("Liberum veto, rokosz, oligarchia… Dopasuj definicję do pojęcia.", "Либерум вето, рокош, олигархия… Подбери определение к понятию."),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Sprawdź, czy nie dałeś się złapać na typowe pomyłki.", "Проверь, не попался ли ты на типичные ошибки."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  order: r("Od sejmiku do zerwanego sejmu", "От сеймика до сорванного сейма"),
  orderHint: r("Dotknij tego, co działo się jako następne.", "Нажми на то, что происходило следующим."),
  cycle: r("Błędne koło oligarchii magnackiej", "Порочный круг магнатской олигархии"),
  terms: r("Słownik kryzysu", "Словарь кризиса"),
  termsQ: r("Jak nazywa się:", "Как называется:"),
  termsWrong: r("to inne pojęcie. Spróbuj jeszcze raz.", "это другое понятие. Попробуй ещё раз."),
  tf: r("Kryzys Rzeczypospolitej", "Кризис Речи Посполитой"),
  timeline: r("Od Sicińskiego do Michała Korybuta", "От Сицинского до Михаила Корибута"),
} satisfies Record<string, Txt>;

const VETO_STEPS: Txt[] = [
  r("sejmik wybiera posłów i daje im instrukcje", "сеймик выбирает послов и даёт им наказы"),
  r("posłowie zjeżdżają na sejm do Warszawy", "послы съезжаются на сейм в Варшаву"),
  r("sejm obraduje sześć tygodni nad podatkami i wojskiem", "сейм шесть недель обсуждает налоги и войско"),
  r("jeden poseł woła: „Nie pozwalam!”", "один посол кричит: «Не позволяю!»"),
  r("sejm zerwany — przepadają wszystkie uchwały", "сейм сорван — пропадают все решения"),
  r("państwo zostaje bez podatków i bez nowego wojska", "государство остаётся без налогов и без нового войска"),
];

const CYCLE: CycleStage[] = [
  {
    icon: "💰",
    name: r("Magnaci kupują szlachtę", "Магнаты покупают шляхту"),
    text: r("Najbogatsze rody utrzymują na swoim dworze ubogą szlachtę — klientelę — i płacą za jej głosy.", "Богатейшие роды содержат при своём дворе бедную шляхту — клиентелу — и платят за её голоса."),
    prevent: r("szlachta niezależna od magnackich pieniędzy", "шляхта, не зависящая от магнатских денег"),
  },
  {
    icon: "🗳️",
    name: r("Sejmiki pod kontrolą", "Сеймики под контролем"),
    text: r("Klientela głosuje na sejmikach tak, jak każe magnat; posłowie jadą na sejm z jego instrukcjami.", "Клиентела голосует на сеймиках так, как велит магнат; послы едут на сейм с его наказами."),
    prevent: r("tajne głosowanie i wolny wybór posłów", "тайное голосование и свободный выбор послов"),
  },
  {
    icon: "✋",
    name: r("Sejmy zrywane", "Сеймы срываются"),
    text: r("Gdy uchwała nie podoba się magnatowi, jego poseł woła „nie pozwalam” — i sejm się rozchodzi.", "Если решение не нравится магнату, его посол кричит «не позволяю» — и сейм расходится."),
    prevent: r("zniesienie liberum veto i głosowanie większością", "отмена либерум вето и голосование большинством"),
  },
  {
    icon: "🏚️",
    name: r("Państwo słabnie", "Государство слабеет"),
    text: r("Bez uchwał nie ma podatków ani wojska; król nic nie może, a magnaci rządzą w swoich latyfundiach jak udzielni władcy.", "Без решений нет ни налогов, ни войска; король ничего не может, а магнаты правят в своих латифундиях как независимые государи."),
    prevent: r("stałe podatki i wojsko niezależne od sejmu", "постоянные налоги и войско, не зависящее от сейма"),
  },
  {
    icon: "🔥",
    name: r("Wojny i zniszczenia", "Войны и разрушения"),
    text: r("Słabe państwo przegrywa wojny; wsie płoną, miasta upadają, ludność maleje o jedną trzecią.", "Слабое государство проигрывает войны; деревни горят, города приходят в упадок, население сокращается на треть."),
    prevent: r("silna armia odstrasza sąsiadów", "сильная армия отпугивает соседей"),
  },
  {
    icon: "🪙",
    name: r("Szlachta ubożeje", "Шляхта беднеет"),
    text: r("Zrujnowany szlachcic szuka opieki bogatego magnata — i koło się zamyka.", "Разорённый шляхтич ищет покровительства богатого магната — и круг замыкается."),
    prevent: r("odbudowa gospodarki i własny majątek szlachcica", "восстановление хозяйства и собственное имение шляхтича"),
  },
];

const TERM_OPTIONS: QuizOption[] = [
  { id: "veto", label: r("liberum veto", "либерум вето") },
  { id: "rokosz", label: r("rokosz", "рокош") },
  { id: "oligarchia", label: r("oligarchia magnacka", "магнатская олигархия") },
  { id: "klientela", label: r("klientela", "клиентела") },
  { id: "wolnosc", label: r("złota wolność", "золотая вольность") },
  { id: "sejmik", label: r("sejmik", "сеймик") },
  { id: "abdykacja", label: r("abdykacja", "отречение") },
];

const TERMS: QuizItem[] = [
  {
    icon: "✋",
    name: r("prawo każdego posła do zerwania sejmu jednym sprzeciwem", "право каждого посла сорвать сейм одним возражением"),
    answer: "veto",
    explain: r("Liberum veto — „wolne nie pozwalam”. Po raz pierwszy użył go Władysław Siciński w 1652 roku.", "Либерум вето — «свободное не позволяю». Впервые им воспользовался Владислав Сицинский в 1652 году."),
  },
  {
    icon: "⚔️",
    name: r("zbrojne wystąpienie szlachty przeciw królowi", "вооружённое выступление шляхты против короля"),
    answer: "rokosz",
    explain: r("Rokosz Lubomirskiego (1665–1666) zakończył się klęską wojsk królewskich pod Mątwami.", "Рокош Любомирского (1665–1666) закончился поражением королевских войск под Монтвами."),
  },
  {
    icon: "👑",
    name: r("rządy garstki najbogatszych rodów w państwie", "власть горстки богатейших родов в государстве"),
    answer: "oligarchia",
    explain: r("Magnaci — Radziwiłłowie, Lubomirscy, Potoccy — podporządkowali sobie sejmiki i sejm.", "Магнаты — Радзивиллы, Любомирские, Потоцкие — подчинили себе сеймики и сейм."),
  },
  {
    icon: "🤝",
    name: r("uboga szlachta na usługach magnata, głosująca po jego myśli", "бедная шляхта на службе у магната, голосующая по его воле"),
    answer: "klientela",
    explain: r("Klient dostawał od magnata urząd, ziemię albo pieniądze — i oddawał mu swój głos.", "Клиент получал от магната должность, землю или деньги — и отдавал ему свой голос."),
  },
  {
    icon: "🏅",
    name: r("przekonanie szlachty, że jej przywileje to najlepszy ustrój świata", "убеждение шляхты, что её привилегии — лучший строй в мире"),
    answer: "wolnosc",
    explain: r("W imię złotej wolności szlachta broniła liberum veto i wolnej elekcji — nawet gdy państwo upadało.", "Во имя золотой вольности шляхта защищала либерум вето и свободную элекцию — даже когда государство гибло."),
  },
  {
    icon: "🗳️",
    name: r("zjazd szlachty ziemi, który wybiera posłów na sejm", "съезд шляхты земли, выбирающий послов на сейм"),
    answer: "sejmik",
    explain: r("Sejmiki dawały posłom instrukcje; kto rządził sejmikami, rządził sejmem.", "Сеймики давали послам наказы; кто правил сеймиками, правил сеймом."),
  },
  {
    icon: "🚪",
    name: r("dobrowolne zrzeczenie się tronu przez władcę", "добровольный отказ правителя от трона"),
    answer: "abdykacja",
    explain: r("Jan Kazimierz abdykował w 1668 roku i wyjechał do Francji.", "Ян Казимир отрёкся в 1668 году и уехал во Францию."),
  },
];

const FACTS: Statement[] = [
  {
    text: r("Pierwszy sejm zerwano przez liberum veto w 1652 roku.", "Первый сейм был сорван через либерум вето в 1652 году."),
    truth: true,
    why: r("Zrobił to Władysław Siciński, poseł z Upity, działający w interesie Radziwiłłów.", "Это сделал Владислав Сицинский, посол из Упиты, действовавший в интересах Радзивиллов."),
  },
  {
    text: r("Liberum veto wprowadzono dopiero po potopie.", "Либерум вето ввели только после потопа."),
    truth: false,
    why: r("Zasada jednomyślności istniała od dawna; nowością 1652 roku było, że jeden sprzeciw przerwał obrady całkowicie.", "Принцип единогласия существовал давно; новым в 1652 году было то, что одно возражение полностью прервало заседания."),
  },
  {
    text: r("Rokosz Lubomirskiego wybuchł, bo Jan Kazimierz chciał zreformować państwo.", "Рокош Любомирского вспыхнул, потому что Ян Казимир хотел реформировать государство."),
    truth: true,
    why: r("Król planował elekcję następcy za swojego życia i wzmocnienie władzy; szlachta uznała to za zamach na wolność.", "Король планировал элекцию преемника при своей жизни и укрепление власти; шляхта сочла это покушением на вольность."),
  },
  {
    text: r("Pod Mątwami w 1666 roku zwyciężyły wojska królewskie.", "Под Монтвами в 1666 году победили королевские войска."),
    truth: false,
    why: r("Zwyciężyli rokoszanie; król musiał porzucić plany reform.", "Победили рокошане; королю пришлось отказаться от планов реформ."),
  },
  {
    text: r("Michał Korybut Wiśniowiecki był synem księcia Jeremiego, obrońcy Zbaraża.", "Михаил Корибут Вишневецкий был сыном князя Иеремии, защитника Збаража."),
    truth: true,
    why: r("Szlachta wybrała go w 1669 roku jako „Piasta” — rodaka, nie cudzoziemca; okazał się władcą słabym.", "Шляхта выбрала его в 1669 году как «Пяста» — соотечественника, а не иностранца; он оказался слабым правителем."),
  },
  {
    text: r("Po wojnach XVII wieku liczba ludności Rzeczypospolitej wzrosła.", "После войн XVII века население Речи Посполитой выросло."),
    truth: false,
    why: r("Spadła o około jedną trzecią — przez wojny, głód i zarazy; miasta i wsie opustoszały.", "Оно сократилось примерно на треть — из-за войн, голода и эпидемий; города и деревни опустели."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("Siciński zrywa sejm — pierwsze liberum veto", "Сицинский срывает сейм — первое либерум вето"),
    when: "1652",
  },
  {
    name: r("początek rokoszu Lubomirskiego", "начало рокоша Любомирского"),
    when: "1665",
  },
  {
    name: r("bitwa pod Mątwami", "битва под Монтвами"),
    when: "1666",
    note: r("klęska wojsk królewskich", "поражение королевских войск"),
  },
  {
    name: r("abdykacja Jana Kazimierza", "отречение Яна Казимира"),
    when: "1668",
    note: r("ostatni Waza wyjeżdża do Francji", "последний Ваза уезжает во Францию"),
  },
  {
    name: r("elekcja Michała Korybuta Wiśniowieckiego", "избрание Михаила Корибута Вишневецкого"),
    when: "1669",
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [r("Liberum veto: sprzeciw jednego posła zrywał sejm i unieważniał wszystkie jego uchwały.", "Либерум вето: возражение одного посла срывало сейм и отменяло все его решения."), r("Pierwszy zerwany sejm — 1652 rok, poseł Władysław Siciński.", "Первый сорванный сейм — 1652 год, посол Владислав Сицинский.")],
  s2: [r("Oligarchia magnacka: garstka najbogatszych rodów rządzi przez klientelę, sejmiki i zrywane sejmy.", "Магнатская олигархия: горстка богатейших родов правит через клиентелу, сеймики и сорванные сеймы."), r("Skutki wojen: zniszczenia, upadek miast, spadek liczby ludności o około jedną trzecią.", "Последствия войн: разрушения, упадок городов, сокращение населения примерно на треть.")],
  s3: [r("Złota wolność — przywileje szlachty uznawane za najlepszy ustrój; rokosz — zbrojny bunt szlachty przeciw królowi.", "Золотая вольность — привилегии шляхты, считавшиеся лучшим строем; рокош — вооружённый бунт шляхты против короля.")],
  s4: [r("Rokosz Lubomirskiego 1665–1666 (Mątwy) → abdykacja Jana Kazimierza 1668 → elekcja Michała Korybuta 1669.", "Рокош Любомирского 1665–1666 (Монтвы) → отречение Яна Казимира 1668 → избрание Михаила Корибута 1669.")],
};

export default function CrisisLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="crisis" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="crisis-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} steps={VETO_STEPS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="crisis-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CycleDiagram lang={lang} title={T.cycle} stages={CYCLE} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="crisis-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.terms} question={T.termsQ} options={TERM_OPTIONS} items={TERMS} wrongHint={T.termsWrong} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="crisis-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="crisis-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
