// Lesson for §21 "Oświecenie w Europie" (Historia 6, GWO). Terms, people and dates follow the task
// bank of the same paragraph (templates/data/ch4.ts, ENLIGHTENMENT and ENLIGHTENMENT_DATES).
import {
  LessonIntro,
  MatchQuiz,
  Remember,
  Section,
  SpeciesGallery,
  Timeline,
  TwoWaySort,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type SortItem,
  type Species,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { PowersDiagram } from "./PowersDiagram.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "XVIII wiek nazwano wiekiem rozumu. Filozofowie oświecenia wierzyli, że rozum i nauka — a nie tradycja i wiara — pozwolą zrozumieć świat i urządzić go lepiej. Ich pomysły o wolności, równości i podziale władzy zmieniły najpierw Amerykę, a potem Francję.",
    "XVIII век назвали веком разума. Философы Просвещения верили, что разум и наука — а не традиция и вера — позволят понять мир и устроить его лучше. Их идеи о свободе, равенстве и разделении властей изменили сначала Америку, а потом Францию.",
  ),
  s1: r("Myśliciele oświecenia", "Мыслители Просвещения"),
  s1intro: r("Dotknij karty, żeby poznać człowieka i jego najważniejszą myśl.", "Нажми на карточку, чтобы узнать о человеке и его главной мысли."),
  s2: r("Trójpodział władzy", "Разделение властей"),
  s2intro: r(
    "Monteskiusz: żeby nikt nie został tyranem, władzę trzeba podzielić. Poznaj schemat, a potem podpisz go sam.",
    "Монтескьё: чтобы никто не стал тираном, власть нужно разделить. Изучи схему, а потом подпиши её сам.",
  ),
  s3: r("Nowe czy stare?", "Новое или старое?"),
  s3intro: r("Które poglądy głosiło oświecenie, a które należały do dawnego porządku?", "Какие взгляды проповедовало Просвещение, а какие принадлежали старому порядку?"),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż najważniejsze dzieła i wydarzenia epoki po kolei.", "Расставь важнейшие труды и события эпохи по порядку."),
  s5: r("Słownik oświecenia", "Словарь Просвещения"),
  s5intro: r("Dopasuj pojęcie do opisu.", "Подбери понятие к описанию."),
  sort: r("Oświecenie czy dawny porządek?", "Просвещение или старый порядок?"),
  sortHint: r("Pomyśl: czy ten pogląd opiera się na rozumie i prawach człowieka?", "Подумай: опирается ли этот взгляд на разум и права человека?"),
  newIdea: r("oświecenie", "Просвещение"),
  oldIdea: r("dawny porządek", "старый порядок"),
  timeline: r("Wiek rozumu", "Век разума"),
  terms: r("Pojęcia", "Понятия"),
  termsQ: r("Jak nazywa się:", "Как называется:"),
  termsWrong: r("to inne pojęcie. Spróbuj jeszcze raz.", "это другое понятие. Попробуй ещё раз."),
} satisfies Record<string, Txt>;

const THINKERS: Species[] = [
  { icon: "🍎", name: r("Isaac Newton", "Исаак Ньютон"), tag: r("Anglia", "Англия"), text: r("Odkrył prawo powszechnego ciążenia i opisał prawa ruchu (1687). Pokazał, że światem rządzą prawa, które rozum może odkryć — to zachęciło filozofów, by rozumem badać także społeczeństwo.", "Открыл закон всемирного тяготения и описал законы движения (1687). Показал, что миром правят законы, которые разум может открыть, — это побудило философов разумом исследовать и общество.") },
  { icon: "🔑", name: r("John Locke", "Джон Локк"), tag: r("Anglia", "Англия"), text: r("Każdy człowiek ma naturalne prawa: do życia, wolności i własności. Państwo istnieje po to, by ich strzec; jeśli je łamie, lud może zmienić władzę.", "У каждого человека есть естественные права: на жизнь, свободу и собственность. Государство существует, чтобы их охранять; если оно их нарушает, народ может сменить власть.") },
  { icon: "✒️", name: r("Wolter", "Вольтер"), tag: r("Francja", "Франция"), text: r("Pisarz i filozof, najsłynniejszy człowiek epoki. Ostro krytykował Kościół, fanatyzm i nietolerancję, bronił wolności słowa. Korespondował z władcami całej Europy.", "Писатель и философ, самый знаменитый человек эпохи. Остро критиковал церковь, фанатизм и нетерпимость, защищал свободу слова. Переписывался с правителями всей Европы.") },
  { icon: "⚖️", name: r("Monteskiusz", "Монтескьё"), tag: r("Francja", "Франция"), text: r("W dziele „O duchu praw” (1748) opisał trójpodział władzy: ustawodawcza, wykonawcza i sądownicza muszą być rozdzielone i kontrolować się nawzajem.", "В труде «О духе законов» (1748) описал разделение властей: законодательная, исполнительная и судебная должны быть разделены и контролировать друг друга.") },
  { icon: "🤝", name: r("Jan Jakub Rousseau", "Жан-Жак Руссо"), tag: r("Francja", "Франция"), text: r("Autor „Umowy społecznej” (1762): państwo powstaje z umowy obywateli, a najwyższa władza należy do ludu. Wierzył, że człowiek z natury jest dobry, a psuje go cywilizacja.", "Автор «Общественного договора» (1762): государство возникает из договора граждан, а высшая власть принадлежит народу. Верил, что человек по природе добр, а портит его цивилизация.") },
  { icon: "📚", name: r("Denis Diderot", "Дени Дидро"), tag: r("Francja", "Франция"), text: r("Redaktor „Wielkiej encyklopedii francuskiej” (od 1751): 35 tomów, które miały zebrać całą wiedzę ludzkości i rozpowszechnić idee oświecenia.", "Редактор «Большой французской энциклопедии» (с 1751): 35 томов, которые должны были собрать все знания человечества и распространить идеи Просвещения.") },
];

const IDEAS: SortItem[] = [
  { name: r("źródłem wiedzy jest rozum i doświadczenie", "источник знания — разум и опыт"), group: 0, why: r("racjonalizm i empiryzm — podstawa oświecenia", "рационализм и эмпиризм — основа Просвещения") },
  { name: r("władza króla pochodzi od Boga", "власть короля исходит от Бога"), group: 1, why: r("tak uzasadniano absolutyzm; oświecenie wywodziło władzę od ludu", "так обосновывали абсолютизм; Просвещение выводило власть из народа") },
  { name: r("ludzie rodzą się wolni i równi", "люди рождаются свободными и равными"), group: 0, why: r("prawa naturalne według Locke’a i Rousseau", "естественные права по Локку и Руссо") },
  { name: r("każdy ma prawo wyznawać swoją religię", "каждый вправе исповедовать свою религию"), group: 0, why: r("tolerancja religijna — jedno z głównych haseł Woltera", "веротерпимость — один из главных лозунгов Вольтера") },
  { name: r("o prawdzie decyduje tradycja i autorytet Kościoła", "истину определяют традиция и авторитет церкви"), group: 1, why: r("oświecenie kazało wszystko sprawdzać rozumem", "Просвещение велело всё проверять разумом") },
  { name: r("władzę trzeba podzielić między parlament, rząd i sądy", "власть нужно разделить между парламентом, правительством и судами"), group: 0, why: r("trójpodział władzy Monteskiusza", "разделение властей Монтескьё") },
  { name: r("urodzenie decyduje o miejscu człowieka w społeczeństwie", "происхождение определяет место человека в обществе"), group: 1, why: r("to stary porządek stanowy; oświecenie ceniło zasługi i talent", "это старый сословный порядок; Просвещение ценило заслуги и талант") },
  { name: r("wiedzę trzeba upowszechniać przez szkoły i encyklopedie", "знания нужно распространять через школы и энциклопедии"), group: 0, why: r("stąd Encyklopedia Diderota i reformy szkolnictwa", "отсюда Энциклопедия Дидро и реформы школ") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("Newton ogłasza prawo powszechnego ciążenia", "Ньютон публикует закон всемирного тяготения"), when: "1687" },
  { name: r("pierwsza wielka loża masońska w Londynie", "первая великая масонская ложа в Лондоне"), when: "1717" },
  { name: r("„O duchu praw” Monteskiusza", "«О духе законов» Монтескьё"), when: "1748", note: r("trójpodział władzy", "разделение властей") },
  { name: r("pierwszy tom Encyklopedii", "первый том Энциклопедии"), when: "1751", note: r("Diderot i d’Alembert", "Дидро и Д’Аламбер") },
  { name: r("„Umowa społeczna” Rousseau", "«Общественный договор» Руссо"), when: "1762" },
];

const TERM_OPTIONS: QuizOption[] = [
  { id: "deizm", label: r("deizm", "деизм") },
  { id: "empiryzm", label: r("empiryzm", "эмпиризм") },
  { id: "klasycyzm", label: r("klasycyzm", "классицизм") },
  { id: "umowa", label: r("umowa społeczna", "общественный договор") },
  { id: "oswiecony", label: r("absolutyzm oświecony", "просвещённый абсолютизм") },
  { id: "salon", label: r("salon", "салон") },
  { id: "loza", label: r("loża masońska", "масонская ложа") },
];

const TERMS: QuizItem[] = [
  { icon: "🌍", name: r("pogląd, że Bóg stworzył świat, ale nie ingeruje w jego bieg", "взгляд, что Бог сотворил мир, но не вмешивается в его ход"), answer: "deizm", explain: r("Deiści, jak Wolter, uważali, że świat działa według praw natury jak nakręcony zegar.", "Деисты, как Вольтер, считали, что мир действует по законам природы, как заведённые часы.") },
  { icon: "🔬", name: r("pogląd, że wiedzę zdobywa się przez doświadczenie i obserwację", "взгляд, что знание добывается опытом и наблюдением"), answer: "empiryzm", explain: r("Empiryzm, obok racjonalizmu, był podstawą nauki oświecenia.", "Эмпиризм, наряду с рационализмом, был основой науки Просвещения.") },
  { icon: "🏛️", name: r("styl w sztuce nawiązujący do antyku: prostota, symetria, kolumny", "стиль в искусстве, обращённый к античности: простота, симметрия, колонны"), answer: "klasycyzm", explain: r("Klasycyzm zastąpił przeładowany barok; w Polsce to m.in. Łazienki Królewskie.", "Классицизм сменил перегруженное барокко; в Польше это, например, Королевские Лазенки.") },
  { icon: "🤝", name: r("pogląd Rousseau, że państwo powstaje z dobrowolnej zgody obywateli", "взгляд Руссо, что государство возникает из добровольного согласия граждан"), answer: "umowa", explain: r("Skoro władza pochodzi z umowy ludu, lud może ją też odebrać.", "Раз власть исходит из договора народа, народ может её и отобрать.") },
  { icon: "👑", name: r("rządy monarchy, który sam wprowadza reformy w duchu oświecenia", "правление монарха, который сам проводит реформы в духе Просвещения"), answer: "oswiecony", explain: r("Tak rządzili Fryderyk II, Katarzyna II i Józef II: „wszystko dla ludu, nic przez lud”.", "Так правили Фридрих II, Екатерина II и Иосиф II: «всё для народа, ничего посредством народа».") },
  { icon: "🛋️", name: r("spotkania w domach arystokratów, na których dyskutowano o nauce i polityce", "встречи в домах аристократов, где обсуждали науку и политику"), answer: "salon", explain: r("W paryskich salonach, często prowadzonych przez kobiety, rodziły się idee oświecenia.", "В парижских салонах, которые часто вели женщины, рождались идеи Просвещения.") },
  { icon: "🔺", name: r("tajne stowarzyszenie głoszące braterstwo i doskonalenie człowieka", "тайное общество, проповедующее братство и совершенствование человека"), answer: "loza", explain: r("Loże masońskie skupiały arystokratów, uczonych i artystów w całej Europie.", "Масонские ложи объединяли аристократов, учёных и художников по всей Европе.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Newton — prawo ciążenia; Locke — prawa naturalne; Wolter — tolerancja i wolność słowa.", "Ньютон — закон тяготения; Локк — естественные права; Вольтер — терпимость и свобода слова."),
    r("Monteskiusz — trójpodział władzy; Rousseau — umowa społeczna; Diderot — Encyklopedia.", "Монтескьё — разделение властей; Руссо — общественный договор; Дидро — Энциклопедия."),
  ],
  s2: [
    r("Władza ustawodawcza (uchwala prawa), wykonawcza (rządzi), sądownicza (sądzi) — rozdzielone i kontrolujące się nawzajem.", "Законодательная власть (принимает законы), исполнительная (правит), судебная (судит) — разделены и контролируют друг друга."),
    r("Trójpodział władzy zapisano w konstytucji USA (1787) i Konstytucji 3 maja (1791).", "Разделение властей записали в конституции США (1787) и Конституции 3 мая (1791)."),
  ],
  s3: [
    r("Oświecenie: rozum, nauka, postęp, tolerancja, równość wobec prawa, władza od ludu.", "Просвещение: разум, наука, прогресс, терпимость, равенство перед законом, власть от народа."),
  ],
  s5: [
    r("Absolutyzm oświecony: monarcha reformuje państwo, ale władzy nie oddaje.", "Просвещённый абсолютизм: монарх реформирует государство, но власти не отдаёт."),
    r("Klasycyzm w sztuce, salony i loże masońskie — tak idee oświecenia krążyły po Europie.", "Классицизм в искусстве, салоны и масонские ложи — так идеи Просвещения распространялись по Европе."),
  ],
};

export default function EnlightenmentLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="enlightenment" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="enlightenment-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={THINKERS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="enlightenment-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <PowersDiagram lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="enlightenment-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.newIdea, T.oldIdea]} items={IDEAS} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="enlightenment-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="enlightenment-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.terms} question={T.termsQ} options={TERM_OPTIONS} items={TERMS} wrongHint={T.termsWrong} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
