// Lesson for §23 "Powstanie Stanów Zjednoczonych" (Historia 6, GWO). Terms, people and dates
// follow the task bank of the same paragraph (templates/data/ch4.ts, USA and USA_DATES).
import {
  LessonIntro,
  MatchQuiz,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type SortItem,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { ColoniesMap } from "./ColoniesMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Na wschodnim wybrzeżu Ameryki Północnej leżało trzynaście angielskich kolonii. Gdy Londyn zaczął nakładać na nie nowe podatki, koloniści odpowiedzieli: „nie ma podatków bez reprezentacji”. Spór o herbatę zamienił się w wojnę, a wojna — w pierwsze państwo zbudowane na ideach oświecenia.",
    "На восточном побережье Северной Америки лежали тринадцать английских колоний. Когда Лондон начал облагать их новыми налогами, колонисты ответили: «нет налогов без представительства». Спор о чае превратился в войну, а война — в первое государство, построенное на идеях Просвещения.",
  ),
  s1: r("Trzynaście kolonii na mapie", "Тринадцать колоний на карте"),
  s1intro: r(
    "Dotknij miejsc na mapie, żeby poznać wydarzenia. Potem w trybie „Podpisz sam” sprawdź, czy pamiętasz, gdzie co się stało.",
    "Нажми на места на карте, чтобы узнать о событиях. Потом в режиме «Подпиши сам» проверь, помнишь ли ты, где что случилось.",
  ),
  s2: r("Koloniści czy Londyn?", "Колонисты или Лондон?"),
  s2intro: r("Kto tak mówił albo tak postępował — koloniści czy rząd brytyjski?", "Кто так говорил или так поступал — колонисты или британское правительство?"),
  s3: r("Ludzie rewolucji amerykańskiej", "Люди американской революции"),
  s3intro: r("Dowódca, pisarz, dyplomata i dwaj Polacy. Dopasuj opis do nazwiska.", "Полководец, писатель, дипломат и два поляка. Подбери описание к фамилии."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Deklaracja i konstytucja", "Декларация и конституция"),
  s5intro: r("Prawda czy fałsz? Każde zdanie dotyczy nowego państwa.", "Правда или ложь? Каждое утверждение — о новом государстве."),
  sort: r("Dwie strony sporu", "Две стороны спора"),
  sortHint: r("Pomyśl, komu zależało na podatkach, a komu na wolności.", "Подумай, кому были нужны налоги, а кому — свобода."),
  colonists: r("koloniści", "колонисты"),
  britain: r("rząd brytyjski", "британское правительство"),
  who: r("Kto to był?", "Кто это был?"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  timeline: r("Od herbaty do konstytucji", "От чая до конституции"),
  tf: r("Nowe państwo", "Новое государство"),
} satisfies Record<string, Txt>;

const SIDES: SortItem[] = [
  { name: r("„Nie ma podatków bez reprezentacji!”", "«Нет налогов без представительства!»"), group: 0, why: r("koloniści nie mieli posłów w parlamencie w Londynie", "у колонистов не было депутатов в парламенте в Лондоне") },
  { name: r("nakłada cło na herbatę, cukier i papier", "вводит пошлину на чай, сахар и бумагу"), group: 1, why: r("Londyn chciał, by kolonie spłaciły koszty wojny z Francją", "Лондон хотел, чтобы колонии оплатили расходы на войну с Францией") },
  { name: r("wyrzuca skrzynie herbaty do portu w Bostonie", "выбрасывает ящики чая в бостонскую гавань"), group: 0, why: r("bostońskie picie herbaty, 1773", "Бостонское чаепитие, 1773") },
  { name: r("zamyka port w Bostonie za karę", "закрывает порт Бостона в наказание"), group: 1, why: r("kary tylko zjednoczyły kolonie przeciw metropolii", "наказания лишь объединили колонии против метрополии") },
  { name: r("zwołuje Kongres Kontynentalny w Filadelfii", "созывает Континентальный конгресс в Филадельфии"), group: 0, why: r("przedstawiciele kolonii po raz pierwszy działają razem (1774)", "представители колоний впервые действуют вместе (1774)") },
  { name: r("wysyła wojsko za ocean, by stłumić bunt", "посылает войска за океан, чтобы подавить бунт"), group: 1, why: r("król Jerzy III uznał kolonistów za buntowników", "король Георг III объявил колонистов мятежниками") },
  { name: r("ogłasza Deklarację niepodległości", "провозглашает Декларацию независимости"), group: 0, why: r("4 lipca 1776 roku kolonie stały się wolnymi państwami", "4 июля 1776 года колонии стали свободными государствами") },
  { name: r("uznaje niepodległość Stanów Zjednoczonych w pokoju paryskim", "признаёт независимость Соединённых Штатов по Парижскому миру"), group: 1, why: r("po klęsce pod Yorktown Wielka Brytania musiała ustąpić (1783)", "после поражения при Йорктауне Великобритания вынуждена была уступить (1783)") },
];

const WHO_OPTIONS: QuizOption[] = [
  { id: "washington", label: r("George Washington", "Джордж Вашингтон") },
  { id: "jefferson", label: r("Thomas Jefferson", "Томас Джефферсон") },
  { id: "franklin", label: r("Benjamin Franklin", "Бенджамин Франклин") },
  { id: "kosciuszko", label: r("Tadeusz Kościuszko", "Тадеуш Костюшко") },
  { id: "pulaski", label: r("Kazimierz Pułaski", "Казимир Пулавский") },
];

const WHO: QuizItem[] = [
  { icon: "🎖️", name: r("głównodowodzący armii kolonistów, pierwszy prezydent USA", "главнокомандующий армией колонистов, первый президент США"), answer: "washington", explain: r("Washington dowodził przez całą wojnę, a w 1789 roku został prezydentem; od niego nazwano stolicę.", "Вашингтон командовал всю войну, а в 1789 году стал президентом; его именем названа столица.") },
  { icon: "✒️", name: r("główny autor Deklaracji niepodległości", "главный автор Декларации независимости"), answer: "jefferson", explain: r("Jefferson zapisał w Deklaracji, że wszyscy ludzie są równi i mają prawo do życia, wolności i dążenia do szczęścia.", "Джефферсон записал в Декларации, что все люди равны и имеют право на жизнь, свободу и стремление к счастью.") },
  { icon: "⚡", name: r("uczony i wynalazca piorunochronu, który zdobył dla kolonii pomoc Francji", "учёный и изобретатель громоотвода, добившийся для колоний помощи Франции"), answer: "franklin", explain: r("Franklin jako poseł w Paryżu przekonał Francję do sojuszu w 1778 roku.", "Франклин как посланник в Париже убедил Францию заключить союз в 1778 году.") },
  { icon: "🏰", name: r("polski inżynier, który budował umocnienia, m.in. w West Point", "польский инженер, строивший укрепления, в том числе в Вест-Пойнте"), answer: "kosciuszko", explain: r("Jego fortyfikacje pod Saratogą pomogły odnieść zwycięstwo w 1777 roku. Kongres nadał mu stopień generała.", "Его укрепления под Саратогой помогли одержать победу в 1777 году. Конгресс присвоил ему звание генерала.") },
  { icon: "🐎", name: r("„ojciec amerykańskiej kawalerii”, śmiertelnie ranny pod Savannah", "«отец американской кавалерии», смертельно раненный под Саванной"), answer: "pulaski", explain: r("Pułaski stworzył pierwszy oddział kawalerii armii amerykańskiej; zginął w 1779 roku.", "Пулавский создал первый кавалерийский отряд американской армии; погиб в 1779 году.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("bostońskie picie herbaty", "Бостонское чаепитие"), when: "1773" },
  { name: r("I Kongres Kontynentalny", "I Континентальный конгресс"), when: "1774", note: r("w Filadelfii", "в Филадельфии") },
  { name: r("Deklaracja niepodległości", "Декларация независимости"), when: "4 VII 1776" },
  { name: r("zwycięstwo pod Saratogą", "победа при Саратоге"), when: "1777", note: r("Francja przystępuje do wojny", "Франция вступает в войну") },
  { name: r("kapitulacja Brytyjczyków pod Yorktown", "капитуляция британцев при Йорктауне"), when: "1781" },
  { name: r("pokój paryski", "Парижский мир"), when: "1783", note: r("Wielka Brytania uznaje niepodległość USA", "Великобритания признаёт независимость США") },
  { name: r("Konstytucja Stanów Zjednoczonych", "Конституция США"), when: "1787" },
];

const FACTS: Statement[] = [
  { text: r("Deklaracja niepodległości głosi, że wszyscy ludzie są równi i mają prawo do wolności.", "Декларация независимости гласит, что все люди равны и имеют право на свободу."), truth: true, why: r("To idee oświecenia — Locke’a i Rousseau — zapisane w dokumencie państwowym.", "Это идеи Просвещения — Локка и Руссо, — записанные в государственном документе.") },
  { text: r("Stany Zjednoczone wywalczyły niepodległość bez niczyjej pomocy.", "Соединённые Штаты добились независимости без чьей-либо помощи."), truth: false, why: r("Po Saratodze do wojny przystąpiła Francja; jej flota i wojska przesądziły o zwycięstwie pod Yorktown.", "После Саратоги в войну вступила Франция; её флот и войска решили исход битвы при Йорктауне.") },
  { text: r("Konstytucja z 1787 roku była pierwszą spisaną konstytucją na świecie.", "Конституция 1787 года была первой писаной конституцией в мире."), truth: true, why: r("Druga była Konstytucja 3 maja w Polsce (1791), trzecia — francuska (wrzesień 1791).", "Второй была Конституция 3 мая в Польше (1791), третьей — французская (сентябрь 1791).") },
  { text: r("Według konstytucji USA cała władza należy do prezydenta.", "По конституции США вся власть принадлежит президенту."), truth: false, why: r("Konstytucja wprowadziła trójpodział władzy: Kongres uchwala prawa, prezydent rządzi, Sąd Najwyższy sądzi.", "Конституция ввела разделение властей: Конгресс принимает законы, президент правит, Верховный суд судит.") },
  { text: r("Stany Zjednoczone są federacją: każdy stan ma własne prawa, ale wspólny rząd.", "Соединённые Штаты — федерация: у каждого штата свои законы, но общее правительство."), truth: true, why: r("Stany zachowały własne władze; sprawy wspólne — armia, pieniądz, handel — należą do rządu federalnego.", "Штаты сохранили свои органы власти; общие дела — армия, деньги, торговля — принадлежат федеральному правительству.") },
  { text: r("Niewolnictwo zniesiono w USA razem z uchwaleniem Deklaracji niepodległości.", "Рабство в США отменили вместе с принятием Декларации независимости."), truth: false, why: r("Mimo słów o równości niewolnictwo na Południu przetrwało jeszcze prawie sto lat.", "Несмотря на слова о равенстве, рабство на Юге сохранялось ещё почти сто лет.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Boston 1773 — herbatka; Filadelfia 1776 — Deklaracja; Saratoga 1777; Yorktown 1781 — kapitulacja Brytyjczyków.", "Бостон 1773 — чаепитие; Филадельфия 1776 — Декларация; Саратога 1777; Йорктаун 1781 — капитуляция британцев."),
    r("13 kolonii leżało między Atlantykiem a Appalachami; metropolią była Wielka Brytania.", "13 колоний лежали между Атлантикой и Аппалачами; метрополией была Великобритания."),
  ],
  s2: [
    r("Przyczyna sporu: nowe podatki i cła bez zgody kolonistów — „nie ma podatków bez reprezentacji”.", "Причина спора: новые налоги и пошлины без согласия колонистов — «нет налогов без представительства»."),
    r("Kongres Kontynentalny (od 1774) kierował walką i 4 VII 1776 ogłosił niepodległość.", "Континентальный конгресс (с 1774) руководил борьбой и 4 июля 1776 года провозгласил независимость."),
  ],
  s3: [
    r("Washington — wódz i pierwszy prezydent; Jefferson — autor Deklaracji; Franklin — dyplomata.", "Вашингтон — полководец и первый президент; Джефферсон — автор Декларации; Франклин — дипломат."),
    r("Polacy w wojnie: Kościuszko (inżynier, West Point) i Pułaski (kawaleria, zginął pod Savannah 1779).", "Поляки в войне: Костюшко (инженер, Вест-Пойнт) и Пулавский (кавалерия, погиб под Саванной в 1779)."),
  ],
  s5: [
    r("Konstytucja 1787: pierwsza na świecie, trójpodział władzy, federacja, prezydent na czele władzy wykonawczej.", "Конституция 1787: первая в мире, разделение властей, федерация, президент во главе исполнительной власти."),
  ],
};

export default function UsaLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="usa" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="usa-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <ColoniesMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="usa-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.colonists, T.britain]} items={SIDES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="usa-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="usa-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="usa-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
