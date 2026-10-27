// Lesson for §30 "II rozbiór Polski" (Historia 6, GWO). Names and dates follow the task bank of the
// same paragraph (templates/data/ch5.ts, SECOND_PARTITION and SECOND_PARTITION_DATES).
import {
  LessonIntro,
  OrderGame,
  Remember,
  Section,
  SpeciesGallery,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type LessonProps,
  type SortItem,
  type Species,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Katarzyna II nie zamierzała pozwolić, by Polska się wzmocniła. Gdy skończyła wojnę z Turcją, grupa magnatów na jej zamówienie zawiązała konfederację targowicką, a armia rosyjska ruszyła na Rzeczpospolitą. Wojna w obronie konstytucji trwała trzy miesiące; przegrał ją nie żołnierz, lecz król. Ceną był II rozbiór Polski.",
    "Екатерина II не собиралась позволить Польше окрепнуть. Когда она закончила войну с Турцией, группа магнатов по её заказу создала Тарговицкую конфедерацию, а русская армия двинулась на Речь Посполитую. Война в защиту конституции длилась три месяца; проиграл её не солдат, а король. Ценой стал второй раздел Польши.",
  ),
  s1: r("Targowica", "Тарговица"),
  s1intro: r("Kto stał za konfederacją targowicką? Otwórz karty.", "Кто стоял за Тарговицкой конфедерацией? Открой карточки."),
  s2: r("Wojna w obronie konstytucji", "Война в защиту конституции"),
  s2intro: r("Ułóż po kolei wydarzenia 1792 roku — od spisku do kapitulacji króla.", "Расставь по порядку события 1792 года — от заговора до капитуляции короля."),
  s3: r("Dlaczego doszło do II rozbioru?", "Почему произошёл второй раздел?"),
  s3intro: r("Rozdziel przyczyny II rozbioru od jego skutków.", "Раздели причины второго раздела и его следствия."),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Sprawdź, czy dobrze zapamiętałeś wojnę 1792 roku i II rozbiór.", "Проверь, хорошо ли ты запомнил войну 1792 года и второй раздел."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  order: r("Rok 1792 krok po kroku", "1792 год шаг за шагом"),
  orderHint: r("Zacznij od spotkania magnatów w Petersburgu.", "Начни со встречи магнатов в Петербурге."),
  sort: r("Przyczyna czy skutek?", "Причина или следствие?"),
  sortHint: r("Co doprowadziło do rozbioru, a co z niego wynikło?", "Что привело к разделу, а что из него вышло?"),
  cause: r("przyczyna", "причина"),
  effect: r("skutek", "следствие"),
  tf: r("Wojna 1792 roku i II rozbiór", "Война 1792 года и второй раздел"),
  timeline: r("Od Targowicy do Grodna", "От Тарговицы до Гродно"),
} satisfies Record<string, Txt>;

const PEOPLE: Species[] = [
  { icon: "👸", name: r("Katarzyna II", "Екатерина II"), tag: r("cesarzowa Rosji", "императрица России"), text: r("Uznała Konstytucję 3 maja za „zarazę jakobińską” i zagrożenie dla swojej władzy nad Polską. Gdy w styczniu 1792 roku zawarła pokój z Turcją, mogła wysłać na Rzeczpospolitą 100 tysięcy żołnierzy.", "Сочла Конституцию 3 мая «якобинской заразой» и угрозой своей власти над Польшей. Когда в январе 1792 года она заключила мир с Турцией, то смогла послать на Речь Посполитую 100 тысяч солдат.") },
  { icon: "💰", name: r("Szczęsny Potocki", "Щенсный Потоцкий"), tag: r("marszałek konfederacji", "маршал конфедерации"), text: r("Najbogatszy magnat Rzeczypospolitej, właściciel setek wsi na Ukrainie. Stanął na czele Targowicy, bo wolał Polskę słabą i zależną od Rosji niż silne państwo ograniczające magnatów.", "Богатейший магнат Речи Посполитой, владелец сотен деревень на Украине. Возглавил Тарговицу, потому что предпочитал Польшу слабую и зависимую от России сильному государству, ограничивающему магнатов.") },
  { icon: "⚔️", name: r("Ksawery Branicki", "Ксаверий Браницкий"), tag: r("hetman wielki koronny", "великий коронный гетман"), text: r("Hetman, któremu konstytucja odebrała władzę nad wojskiem. Ożeniony z Rosjanką, zaufany Katarzyny II — jeden z trzech przywódców Targowicy.", "Гетман, у которого конституция отняла власть над войском. Женатый на русской, доверенное лицо Екатерины II — один из трёх вождей Тарговицы.") },
  { icon: "📜", name: r("Seweryn Rzewuski", "Северин Жевуский"), tag: r("hetman polny koronny", "польный коронный гетман"), text: r("Zaciekły obrońca wolnej elekcji i liberum veto; pisał, że dziedziczny tron to niewola. Współtwórca Targowicy.", "Ярый защитник свободной элекции и либерум вето; писал, что наследственный трон — это рабство. Соучредитель Тарговицы.") },
];

const STEPS: Txt[] = [
  r("magnaci w Petersburgu układają z Katarzyną akt konfederacji", "магнаты в Петербурге составляют с Екатериной акт конфедерации"),
  r("14 V — ogłoszenie konfederacji w Targowicy", "14 V — провозглашение конфедерации в Тарговице"),
  r("18 V — armia rosyjska przekracza granicę", "18 V — русская армия переходит границу"),
  r("18 VI — zwycięstwo księcia Józefa pod Zieleńcami", "18 VI — победа князя Юзефа под Зеленцами"),
  r("22 VI — król ustanawia order Virtuti Militari", "22 VI — король учреждает орден Virtuti Militari"),
  r("18 VII — Kościuszko broni przeprawy pod Dubienką", "18 VII — Костюшко обороняет переправу под Дубенкой"),
  r("24 VII — król przystępuje do Targowicy, wojsko składa broń", "24 VII — король присоединяется к Тарговице, войско складывает оружие"),
];

const SORT: SortItem[] = [
  { name: r("Katarzyna II kończy wojnę z Turcją i ma wolną armię", "Екатерина II заканчивает войну с Турцией и располагает свободной армией"), group: 0, why: r("dopiero wtedy mogła uderzyć na Polskę", "только тогда она смогла ударить по Польше") },
  { name: r("magnaci wzywają Rosję przeciw konstytucji", "магнаты призывают Россию против конституции"), group: 0, why: r("Targowica dała Katarzynie pretekst do interwencji", "Тарговица дала Екатерине предлог для вмешательства") },
  { name: r("Prusy zrywają przymierze z 1790 roku", "Пруссия разрывает союз 1790 года"), group: 0, why: r("Polska została sama; Prusy wolały dostać Wielkopolskę", "Польша осталась одна; Пруссия предпочла получить Великую Польшу") },
  { name: r("król przystępuje do Targowicy", "король присоединяется к Тарговице"), group: 0, why: r("kapitulacja oddała kraj w ręce zaborców", "капитуляция отдала страну в руки захватчиков") },
  { name: r("Prusy zabierają Wielkopolskę, Gdańsk i Toruń", "Пруссия забирает Великую Польшу, Гданьск и Торунь"), group: 1, why: r("to był pruski udział w II rozbiorze", "это была прусская доля во втором разделе") },
  { name: r("Rosja zabiera Ukrainę i środkową Białoruś", "Россия забирает Украину и центральную Белоруссию"), group: 1, why: r("to był rosyjski udział w II rozbiorze", "это была русская доля во втором разделе") },
  { name: r("sejm grodzieński zatwierdza rozbiór", "Гродненский сейм утверждает раздел"), group: 1, why: r("ostatni sejm Rzeczypospolitej obradował otoczony przez wojsko rosyjskie", "последний сейм Речи Посполитой заседал в окружении русских войск") },
  { name: r("Kołłątaj, Potocki i Kościuszko emigrują do Lipska", "Коллонтай, Потоцкий и Костюшко эмигрируют в Лейпциг"), group: 1, why: r("za granicą przygotowywali powstanie", "за границей они готовили восстание") },
];

const TF: Statement[] = [
  { text: r("W II rozbiorze Polski uczestniczyły Rosja, Prusy i Austria.", "Во втором разделе Польши участвовали Россия, Пруссия и Австрия."), truth: false, why: r("Tylko Rosja i Prusy. Austria była zajęta wojną z rewolucyjną Francją i nie wzięła udziału.", "Только Россия и Пруссия. Австрия была занята войной с революционной Францией и участия не приняла.") },
  { text: r("Bitwę pod Zieleńcami wygrało wojsko polskie pod wodzą księcia Józefa Poniatowskiego.", "Битву под Зеленцами выиграло польское войско под командованием князя Юзефа Понятовского."), truth: true, why: r("18 czerwca 1792 roku — pierwsze zwycięstwo polskiego oręża od czasów Sobieskiego. Król ustanowił za nie order Virtuti Militari.", "18 июня 1792 года — первая победа польского оружия со времён Собеского. Король учредил за неё орден Virtuti Militari.") },
  { text: r("Armia polska przegrała wojnę 1792 roku w wielkiej bitwie.", "Польская армия проиграла войну 1792 года в большом сражении."), truth: false, why: r("Wojsko cofało się w porządku i nie zostało rozbite. Wojnę zakończył król, przystępując do Targowicy.", "Войско отступало в порядке и не было разбито. Войну закончил король, присоединившись к Тарговице.") },
  { text: r("Słowo „targowiczanin” oznacza do dziś zdrajcę ojczyzny.", "Слово «тарговичанин» до сих пор означает предателя отечества."), truth: true, why: r("Konfederaci targowiccy sprowadzili obce wojska na własny kraj — stali się symbolem zdrady.", "Тарговицкие конфедераты привели чужие войска в собственную страну — они стали символом измены.") },
  { text: r("Pod Dubienką Kościuszko dowodził siłami większymi niż rosyjskie.", "Под Дубенкой Костюшко командовал силами, превосходившими русские."), truth: false, why: r("Miał około 5 tysięcy żołnierzy przeciw 25 tysiącom Rosjan i mimo to przez cały dzień utrzymał pozycje nad Bugiem.", "У него было около 5 тысяч солдат против 25 тысяч русских, и всё же он весь день удерживал позиции над Бугом.") },
  { text: r("Sejm grodzieński z 1793 roku był ostatnim sejmem Rzeczypospolitej.", "Гродненский сейм 1793 года был последним сеймом Речи Посполитой."), truth: true, why: r("Pod lufami rosyjskich armat posłowie „milczeniem” zatwierdzili rozbiór; po 1795 roku sejmu już nie było.", "Под дулами русских пушек депутаты «молчанием» утвердили раздел; после 1795 года сейма уже не было.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("Kościuszko wraca z Ameryki", "Костюшко возвращается из Америки"), when: "1784" },
  { name: r("przymierze polsko-pruskie", "польско-прусский союз"), when: "1790", note: r("Prusy je zdradzą w 1792", "Пруссия предаст его в 1792") },
  { name: r("ogłoszenie konfederacji targowickiej", "провозглашение Тарговицкой конфедерации"), when: "14 V 1792" },
  { name: r("bitwa pod Zieleńcami", "битва под Зеленцами"), when: "18 VI 1792", note: r("książę Józef Poniatowski; order Virtuti Militari", "князь Юзеф Понятовский; орден Virtuti Militari") },
  { name: r("bitwa pod Dubienką", "битва под Дубенкой"), when: "18 VII 1792", note: r("Tadeusz Kościuszko", "Тадеуш Костюшко") },
  { name: r("król przystępuje do Targowicy", "король присоединяется к Тарговице"), when: "24 VII 1792" },
  { name: r("II rozbiór Polski; sejm grodzieński", "второй раздел Польши; Гродненский сейм"), when: "1793", note: r("Rosja i Prusy", "Россия и Пруссия") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Konfederacja targowicka 1792: Szczęsny Potocki, Ksawery Branicki, Seweryn Rzewuski — pod opieką Katarzyny II, przeciw Konstytucji 3 maja.", "Тарговицкая конфедерация 1792: Щенсный Потоцкий, Ксаверий Браницкий, Северин Жевуский — под покровительством Екатерины II, против Конституции 3 мая."),
    r("Targowiczanin = zdrajca.", "Тарговичанин = предатель."),
  ],
  s2: [
    r("Zieleńce 18 VI 1792 — książę Józef Poniatowski, order Virtuti Militari; Dubienka 18 VII 1792 — Tadeusz Kościuszko.", "Зеленцы 18 VI 1792 — князь Юзеф Понятовский, орден Virtuti Militari; Дубенка 18 VII 1792 — Тадеуш Костюшко."),
    r("24 VII 1792 król przystąpił do Targowicy — koniec wojny i konstytucji.", "24 VII 1792 король присоединился к Тарговице — конец войны и конституции."),
  ],
  s3: [
    r("II rozbiór 1793: Rosja (Ukraina, Podole, środkowa Białoruś) i Prusy (Wielkopolska, Gdańsk, Toruń); Austria nie brała udziału.", "Второй раздел 1793: Россия (Украина, Подолье, центральная Белоруссия) и Пруссия (Великая Польша, Гданьск, Торунь); Австрия не участвовала."),
    r("Sejm grodzieński 1793 zatwierdził rozbiór; patrioci wyjechali do Lipska i szykowali powstanie.", "Гродненский сейм 1793 утвердил раздел; патриоты уехали в Лейпциг и готовили восстание."),
  ],
  s4: [
    r("Wojnę 1792 roku przegrano nie na polu bitwy, lecz przez kapitulację króla.", "Война 1792 года была проиграна не на поле боя, а из-за капитуляции короля."),
  ],
};

export default function SecondPartitionLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="second-partition" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="second-partition-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={PEOPLE} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="second-partition-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} steps={STEPS} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="second-partition-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.cause, T.effect]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="second-partition-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={TF} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="second-partition-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
