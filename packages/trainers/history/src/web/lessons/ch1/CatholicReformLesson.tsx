// Lesson for §4 "Reforma Kościoła katolickiego" (Historia 6, GWO). Terms, people and dates follow
// the task bank of the same paragraph (templates/data/ch1.ts, CATHOLIC_REFORM and CATHOLIC_REFORM_DATES).
import {
  LessonIntro,
  MatchQuiz,
  Remember,
  Section,
  SpeciesGallery,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type SortItem,
  type Species,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Reformacja odebrała Kościołowi katolickiemu pół Europy. Odpowiedzią była reforma: papież Paweł III zwołał sobór trydencki (1545–1563), zatwierdził zakon jezuitów, a Kościół zaczął zwalczać protestantów i naprawiać własne błędy. Te działania nazywamy kontrreformacją.",
    "Реформация отняла у католической церкви половину Европы. Ответом стала реформа: папа Павел III созвал Тридентский собор (1545–1563), утвердил орден иезуитов, а церковь начала бороться с протестантами и исправлять собственные ошибки. Эти действия называют Контрреформацией.",
  ),
  s1: r("Sobór trydencki", "Тридентский собор"),
  s1intro: r(
    "Biskupi obradowali w Trydencie z przerwami przez 18 lat. Dopasuj decyzję soboru do problemu, na który odpowiadała.",
    "Епископы заседали в Триденте с перерывами 18 лет. Подбери решение собора к проблеме, на которую оно отвечало.",
  ),
  s2: r("Jezuici — żołnierze papieża", "Иезуиты — солдаты папы"),
  s2intro: r("Dotknij karty, żeby poznać zakon, jego założyciela i dzieła.", "Нажми на карточку, чтобы узнать об ордене, его основателе и делах."),
  s3: r("Walka czy naprawa?", "Борьба или исправление?"),
  s3intro: r(
    "Kościół działał na dwa sposoby: zwalczał reformację i naprawiał się od środka. Rozdziel środki kontrreformacji.",
    "Церковь действовала двумя способами: боролась с Реформацией и исправлялась изнутри. Раздели средства Контрреформации.",
  ),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Prawda czy fałsz?", "Правда или ложь?"),
  s5intro: r("Sprawdź, co wiesz o reformie Kościoła katolickiego.", "Проверь, что ты знаешь о реформе католической церкви."),
  quiz: r("Decyzje soboru", "Решения собора"),
  quizQ: r("Jak sobór odpowiedział na problem:", "Как собор ответил на проблему:"),
  quizWrong: r("to odpowiedź na inny problem. Spróbuj jeszcze raz.", "это ответ на другую проблему. Попробуй ещё раз."),
  sort: r("Środki kontrreformacji", "Средства Контрреформации"),
  sortHint: r("Co służyło walce z protestantami, a co naprawie samego Kościoła?", "Что служило борьбе с протестантами, а что — исправлению самой церкви?"),
  fight: r("walka z reformacją", "борьба с Реформацией"),
  repair: r("naprawa Kościoła od środka", "исправление церкви изнутри"),
  timeline: r("Reforma katolicka rok po roku", "Католическая реформа год за годом"),
  tf: r("Fakty o kontrreformacji", "Факты о Контрреформации"),
} satisfies Record<string, Txt>;

const DECISIONS: QuizOption[] = [
  { id: "sem", label: r("seminaria duchowne w każdej diecezji", "духовные семинарии в каждой епархии") },
  { id: "kat", label: r("katechizm dla wiernych", "катехизис для верующих") },
  { id: "trad", label: r("źródłem wiary jest Biblia i Tradycja", "источник веры — Библия и Предание") },
  { id: "odp", label: r("zakaz sprzedaży odpustów", "запрет продажи индульгенций") },
  { id: "rez", label: r("biskup musi mieszkać w swojej diecezji", "епископ должен жить в своей епархии") },
  { id: "sakr", label: r("potwierdzenie siedmiu sakramentów", "подтверждение семи таинств") },
];

const PROBLEMS: QuizItem[] = [
  { icon: "🎓", name: r("księża byli słabo wykształceni i nie umieli nauczać", "священники были плохо образованы и не умели учить"), answer: "sem", explain: r("Sobór nakazał założyć w każdej diecezji seminarium duchowne — szkołę dla przyszłych księży.", "Собор предписал основать в каждой епархии духовную семинарию — школу для будущих священников.") },
  { icon: "📘", name: r("zwykli wierni nie znali zasad swojej wiary", "простые верующие не знали основ своей веры"), answer: "kat", explain: r("Po soborze wydano katechizm — wykład wiary w pytaniach i odpowiedziach.", "После собора издали катехизис — изложение веры в вопросах и ответах.") },
  { icon: "📖", name: r("protestanci twierdzili, że liczy się tylko Biblia", "протестанты утверждали, что имеет значение только Библия"), answer: "trad", explain: r("Sobór orzekł, że obok Biblii źródłem wiary jest też Tradycja Kościoła.", "Собор постановил, что наряду с Библией источником веры является и Предание церкви.") },
  { icon: "💰", name: r("handel odpustami gorszył wiernych i dał początek reformacji", "торговля индульгенциями соблазняла верующих и положила начало Реформации"), answer: "odp", explain: r("Sobór zakazał sprzedawania odpustów za pieniądze.", "Собор запретил продавать индульгенции за деньги.") },
  { icon: "🏰", name: r("biskupi żyli na dworach, a nie wśród swoich wiernych", "епископы жили при дворах, а не среди своих верующих"), answer: "rez", explain: r("Sobór nakazał biskupom przebywać w swoich diecezjach i wizytować parafie.", "Собор обязал епископов находиться в своих епархиях и посещать приходы.") },
  { icon: "✝️", name: r("Luter uznawał tylko dwa sakramenty", "Лютер признавал только два таинства"), answer: "sakr", explain: r("Sobór potwierdził, że sakramentów jest siedem, i potępił naukę protestantów.", "Собор подтвердил, что таинств семь, и осудил учение протестантов.") },
];

const JESUITS: Species[] = [
  { icon: "🛡️", name: r("Ignacy Loyola", "Игнатий Лойола"), tag: r("założyciel", "основатель"), text: r("Hiszpański szlachcic i żołnierz. Ciężko ranny w 1521 roku, w czasie leczenia czytał żywoty świętych i postanowił służyć Kościołowi. Napisał „Ćwiczenia duchowne” i został pierwszym generałem zakonu.", "Испанский дворянин и солдат. Тяжело раненный в 1521 году, во время лечения читал жития святых и решил служить церкви. Написал «Духовные упражнения» и стал первым генералом ордена.") },
  { icon: "✝️", name: r("Towarzystwo Jezusowe", "Общество Иисуса"), tag: r("1534 · 1540", "1534 · 1540"), text: r("Loyola i sześciu towarzyszy złożyli śluby w Paryżu w 1534 roku; papież Paweł III zatwierdził zakon w 1540 roku. Jezuici składają dodatkowy ślub posłuszeństwa papieżowi, a zakonem rządzi generał jak wódz armią.", "Лойола и шесть товарищей принесли обеты в Париже в 1534 году; папа Павел III утвердил орден в 1540 году. Иезуиты приносят дополнительный обет послушания папе, а орденом управляет генерал, как полководец армией.") },
  { icon: "📜", name: r("Paweł III", "Павел III"), tag: r("papież", "папа"), text: r("Papież, który zaczął reformę Kościoła: zatwierdził jezuitów (1540) i zwołał sobór trydencki (1545).", "Папа, который начал реформу церкви: утвердил иезуитов (1540) и созвал Тридентский собор (1545).") },
  { icon: "🏫", name: r("Kolegia jezuickie", "Иезуитские коллегии"), tag: r("szkoły", "школы"), text: r("Bezpłatne szkoły słynące z wysokiego poziomu: łacina, retoryka, matematyka, teatr szkolny. Uczyli się w nich synowie szlachty i mieszczan — także protestantów, którzy często wracali do katolicyzmu.", "Бесплатные школы, славившиеся высоким уровнем: латынь, риторика, математика, школьный театр. В них учились сыновья шляхты и горожан — в том числе протестантов, которые часто возвращались в католичество.") },
  { icon: "🌏", name: r("Misje", "Миссии"), tag: r("Ameryka · Azja", "Америка · Азия"), text: r("Jezuici płynęli za odkrywcami: nawracali Indian w Ameryce, uczyli się języków i obyczajów Indii, Japonii i Chin. Kościół zyskiwał poza Europą wiernych, których tracił w Europie.", "Иезуиты плыли вслед за первооткрывателями: обращали индейцев в Америке, изучали языки и обычаи Индии, Японии и Китая. Церковь приобретала за пределами Европы верующих, которых теряла в Европе.") },
  { icon: "⛵", name: r("Franciszek Ksawery", "Франциск Ксаверий"), tag: r("misjonarz", "миссионер"), text: r("Jeden z pierwszych towarzyszy Loyoli. Jako misjonarz dotarł do Indii i Japonii; zmarł w drodze do Chin.", "Один из первых товарищей Лойолы. Как миссионер добрался до Индии и Японии; умер по пути в Китай.") },
  { icon: "🇵🇱", name: r("Jezuici w Polsce", "Иезуиты в Польше"), tag: r("1564", "1564"), text: r("Kardynał Stanisław Hozjusz sprowadził jezuitów do Braniewa w 1564 roku. Wkrótce ich kolegia powstały w Wilnie, Poznaniu i wielu innych miastach Rzeczypospolitej.", "Кардинал Станислав Гозий привёл иезуитов в Бранево в 1564 году. Вскоре их коллегии появились в Вильне, Познани и многих других городах Речи Посполитой.") },
  { icon: "✨", name: r("Ad maiorem Dei gloriam", "Ad maiorem Dei gloriam"), tag: r("dewiza", "девиз"), text: r("„Na większą chwałę Bożą” — hasło jezuitów. Cel: bronić Kościoła słowem, nauką i przykładem, a nie mieczem.", "«К вящей славе Божией» — девиз иезуитов. Цель: защищать церковь словом, наукой и примером, а не мечом.") },
];

const MEANS: SortItem[] = [
  { name: r("inkwizycja", "инквизиция"), group: 0, why: r("sądy kościelne ścigały odstępców od wiary katolickiej", "церковные суды преследовали отступников от католической веры") },
  { name: r("indeks ksiąg zakazanych (1559)", "Индекс запрещённых книг (1559)"), group: 0, why: r("katolikom nie wolno było czytać pism protestantów", "католикам нельзя было читать сочинения протестантов") },
  { name: r("sztuka baroku", "искусство барокко"), group: 0, why: r("wspaniałe kościoły miały olśnić wiernych i przyciągnąć ich z powrotem", "великолепные храмы должны были поразить верующих и вернуть их") },
  { name: r("misje w Ameryce i Azji", "миссии в Америке и Азии"), group: 0, why: r("Kościół chciał zyskać tylu wiernych, ilu stracił na rzecz protestantów", "церковь хотела приобрести столько верующих, сколько потеряла из-за протестантов") },
  { name: r("seminaria duchowne", "духовные семинарии"), group: 1, why: r("lepiej wykształceni księża", "лучше образованные священники") },
  { name: r("katechizm", "катехизис"), group: 1, why: r("wierni poznają zasady swojej wiary", "верующие узнают основы своей веры") },
  { name: r("kolegia jezuickie", "иезуитские коллегии"), group: 1, why: r("dobre, bezpłatne szkoły podnosiły poziom wykształcenia katolików", "хорошие бесплатные школы поднимали уровень образования католиков") },
  { name: r("obowiązek mieszkania biskupa w diecezji", "обязанность епископа жить в епархии"), group: 1, why: r("biskup ma pilnować swoich parafii, a nie dworu", "епископ должен следить за своими приходами, а не за двором") },
  { name: r("zakaz sprzedaży odpustów", "запрет продажи индульгенций"), group: 1, why: r("Kościół usunął nadużycie, od którego zaczęła się reformacja", "церковь устранила злоупотребление, с которого началась Реформация") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("Loyola zakłada zakon jezuitów", "Лойола основывает орден иезуитов"), when: "1534", note: r("śluby siedmiu towarzyszy w Paryżu", "обеты семи товарищей в Париже") },
  { name: r("Paweł III zatwierdza jezuitów", "Павел III утверждает иезуитов"), when: "1540" },
  { name: r("Początek soboru trydenckiego", "Начало Тридентского собора"), when: "1545" },
  { name: r("Indeks ksiąg zakazanych", "Индекс запрещённых книг"), when: "1559" },
  { name: r("Koniec soboru trydenckiego", "Завершение Тридентского собора"), when: "1563", note: r("po 18 latach obrad", "после 18 лет заседаний") },
];

const FACTS: Statement[] = [
  { text: r("Sobór trydencki pogodził katolików z protestantami.", "Тридентский собор примирил католиков с протестантами."), truth: false, why: r("Sobór potępił naukę protestantów — podział chrześcijaństwa zachodniego stał się trwały.", "Собор осудил учение протестантов — раскол западного христианства стал окончательным.") },
  { text: r("Jezuici prowadzili szkoły, w których uczono bezpłatnie.", "Иезуиты вели школы, где учили бесплатно."), truth: true, why: r("Kolegia jezuickie należały do najlepszych szkół Europy.", "Иезуитские коллегии были среди лучших школ Европы.") },
  { text: r("Na indeksie ksiąg zakazanych znalazło się później także dzieło Kopernika.", "В Индекс запрещённых книг позже попал и труд Коперника."), truth: true, why: r("„O obrotach sfer niebieskich” trafiło na indeks w 1616 roku, bo przeczyło dawnemu obrazowi świata.", "«О вращении небесных сфер» попал в Индекс в 1616 году, потому что противоречил прежней картине мира.") },
  { text: r("Założyciel jezuitów Ignacy Loyola był wcześniej żołnierzem.", "Основатель иезуитов Игнатий Лойола раньше был солдатом."), truth: true, why: r("Dlatego zakon ma wojskową dyscyplinę i generała na czele.", "Поэтому у ордена военная дисциплина и генерал во главе.") },
  { text: r("Kontrreformacja się nie udała — cała Europa została protestancka.", "Контрреформация не удалась — вся Европа стала протестантской."), truth: false, why: r("Kościół zatrzymał reformację i odzyskał wielu wiernych, m.in. w Polsce, Austrii i południowych Niemczech.", "Церковь остановила Реформацию и вернула многих верующих, в том числе в Польше, Австрии и южной Германии.") },
  { text: r("Sobór trydencki nakazał, by każda diecezja miała seminarium dla przyszłych księży.", "Тридентский собор предписал, чтобы в каждой епархии была семинария для будущих священников."), truth: true, why: r("Od tej pory kandydat na księdza musiał przejść kilkuletnią naukę.", "С тех пор кандидат в священники должен был пройти многолетнее обучение.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Sobór trydencki (1545–1563) zwołał papież Paweł III.", "Тридентский собор (1545–1563) созвал папа Павел III."),
    r("Sobór potępił naukę protestantów, ale naprawił Kościół: seminaria, katechizm, koniec handlu odpustami.", "Собор осудил учение протестантов, но исправил церковь: семинарии, катехизис, конец торговли индульгенциями."),
  ],
  s2: [
    r("Jezuici (Towarzystwo Jezusowe) — zakon Ignacego Loyoli, założony w 1534, zatwierdzony w 1540 roku.", "Иезуиты (Общество Иисуса) — орден Игнатия Лойолы, основанный в 1534, утверждённый в 1540 году."),
    r("Ich broń: doskonałe szkoły (kolegia), misje i posłuszeństwo papieżowi.", "Их оружие: превосходные школы (коллегии), миссии и послушание папе."),
  ],
  s3: [
    r("Walka: inkwizycja, indeks ksiąg zakazanych (1559), misje, sztuka baroku.", "Борьба: инквизиция, Индекс запрещённых книг (1559), миссии, искусство барокко."),
    r("Naprawa: seminaria, katechizm, kolegia, biskup w diecezji, koniec sprzedaży odpustów.", "Исправление: семинарии, катехизис, коллегии, епископ в епархии, конец продажи индульгенций."),
  ],
  s5: [
    r("Kontrreformacja — działania Kościoła przeciw reformacji i odzyskiwanie wiernych.", "Контрреформация — действия церкви против Реформации и возвращение верующих."),
    r("Podział na katolików i protestantów przetrwał — trwa do dziś.", "Раскол на католиков и протестантов сохранился — он существует до сих пор."),
  ],
};

export default function CatholicReformLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="catholic-reform" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="catholic-reform-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.quiz} question={T.quizQ} options={DECISIONS} items={PROBLEMS} wrongHint={T.quizWrong} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="catholic-reform-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={JESUITS} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="catholic-reform-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.fight, T.repair]} items={MEANS} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="catholic-reform-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="catholic-reform-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
