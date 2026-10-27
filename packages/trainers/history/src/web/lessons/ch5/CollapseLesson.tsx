// Lesson for §31 "Upadek Rzeczypospolitej" (Historia 6, GWO). Names and dates follow the task bank
// of the same paragraph (templates/data/ch5.ts, COLLAPSE and COLLAPSE_DATES).
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
import { PartitionsMap } from "./PartitionsMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "24 marca 1794 roku na rynku w Krakowie Tadeusz Kościuszko przysiągł, że będzie walczył o wolność ojczyzny. Zaczęła się insurekcja: zwycięstwo pod Racławicami, powstanie Warszawy, uniwersał dla chłopów — a potem klęska pod Maciejowicami i rzeź Pragi. W 1795 roku Rosja, Prusy i Austria podzieliły resztę kraju. Rzeczpospolita zniknęła z mapy na 123 lata.",
    "24 марта 1794 года на рынке в Кракове Тадеуш Костюшко поклялся бороться за свободу отчизны. Началось восстание: победа под Рацлавицами, восстание Варшавы, универсал для крестьян — а потом поражение под Мацеёвицами и резня в Праге. В 1795 году Россия, Пруссия и Австрия разделили остаток страны. Речь Посполитая исчезла с карты на 123 года.",
  ),
  s1: r("Bohaterowie insurekcji", "Герои восстания"),
  s1intro: r("Naczelnik, chłop, szewc, poeta i dwaj ich przeciwnicy. Dopasuj opis do nazwiska.", "Начальник, крестьянин, сапожник, поэт и два их противника. Подбери описание к фамилии."),
  s2: r("Prawda czy fałsz?", "Правда или ложь?"),
  s2intro: r("Sprawdź, co wiesz o powstaniu kościuszkowskim.", "Проверь, что ты знаешь о восстании Костюшко."),
  s3: r("Trzy rozbiory na mapie", "Три раздела на карте"),
  s3intro: r("Kolor to zaborca, odcień to rozbiór: im ciemniej, tym później. Dotknij każdej części, a potem podpisz mapę sam.", "Цвет — захватчик, оттенок — раздел: чем темнее, тем позже. Нажми на каждую часть, а потом подпиши карту сам."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia roku 1794 i upadku państwa po kolei.", "Расставь события 1794 года и падения государства по порядку."),
  s5: r("Dlaczego Rzeczpospolita upadła?", "Почему пала Речь Посполитая?"),
  s5intro: r("Historycy dzielą przyczyny na wewnętrzne (wina samej Rzeczypospolitej) i zewnętrzne (działania sąsiadów). Rozdziel je.", "Историки делят причины на внутренние (вина самой Речи Посполитой) и внешние (действия соседей). Раздели их."),
  who: r("Ludzie roku 1794", "Люди 1794 года"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  tf: r("Insurekcja kościuszkowska", "Восстание Костюшко"),
  timeline: r("Od przysięgi do abdykacji", "От присяги до отречения"),
  sort: r("Przyczyny wewnętrzne i zewnętrzne", "Внутренние и внешние причины"),
  sortHint: r("Co zawiniła sama Rzeczpospolita, a co zrobili sąsiedzi?", "В чём виновата сама Речь Посполитая, а что сделали соседи?"),
  inner: r("wewnętrzna", "внутренняя"),
  outer: r("zewnętrzna", "внешняя"),
} satisfies Record<string, Txt>;

const WHO_OPTIONS: QuizOption[] = [
  { id: "kosciuszko", label: r("Tadeusz Kościuszko", "Тадеуш Костюшко") },
  { id: "glowacki", label: r("Wojciech Bartos Głowacki", "Войцех Бартош Гловацкий") },
  { id: "kilinski", label: r("Jan Kiliński", "Ян Килинский") },
  { id: "jasinski", label: r("Jakub Jasiński", "Якуб Ясинский") },
  { id: "suworow", label: r("Aleksandr Suworow", "Александр Суворов") },
  { id: "sap", label: r("Stanisław August Poniatowski", "Станислав Август Понятовский") },
];

const WHO: QuizItem[] = [
  { icon: "🎖️", name: r("Najwyższy Naczelnik powstania, ranny i wzięty do niewoli pod Maciejowicami", "Верховный начальник восстания, раненный и взятый в плен под Мацеёвицами"), answer: "kosciuszko", explain: r("Tadeusz Kościuszko przysięgał w Krakowie, zwyciężył pod Racławicami i wydał Uniwersał połaniecki.", "Тадеуш Костюшко присягал в Кракове, победил под Рацлавицами и издал Поланецкий универсал.") },
  { icon: "🌾", name: r("kosynier, który czapką zgasił lont rosyjskiej armaty", "косинер, который шапкой погасил фитиль русской пушки"), answer: "glowacki", explain: r("Wojciech Bartos spod Racławic został za to oficerem i otrzymał nazwisko Głowacki; zginął po bitwie pod Szczekocinami.", "Войцех Бартош из-под Рацлавиц стал за это офицером и получил фамилию Гловацкий; погиб после битвы под Щекоцинами.") },
  { icon: "👞", name: r("szewc, który poprowadził lud Warszawy przeciw garnizonowi rosyjskiemu", "сапожник, возглавивший народ Варшавы против русского гарнизона"), answer: "kilinski", explain: r("Jan Kiliński 17–18 kwietnia 1794 roku dowodził mieszczanami w walkach ulicznych; został pułkownikiem.", "Ян Килинский 17–18 апреля 1794 года командовал горожанами в уличных боях; стал полковником.") },
  { icon: "🖋️", name: r("pułkownik i poeta, przywódca powstania w Wilnie, poległ w obronie Pragi", "полковник и поэт, вождь восстания в Вильно, погиб при обороне Праги"), answer: "jasinski", explain: r("Jakub Jasiński wyzwolił Wilno w kwietniu 1794 roku; zginął 4 listopada na szańcach Pragi.", "Якуб Ясинский освободил Вильно в апреле 1794 года; погиб 4 ноября на валах Праги.") },
  { icon: "🪖", name: r("rosyjski generał, który zdobył Pragę i stłumił powstanie", "русский генерал, взявший Прагу и подавивший восстание"), answer: "suworow", explain: r("Wojska Suworowa po szturmie wymordowały mieszkańców Pragi; przerażona Warszawa skapitulowała.", "Войска Суворова после штурма перебили жителей Праги; испуганная Варшава капитулировала.") },
  { icon: "👑", name: r("ostatni król, który w 1795 roku abdykował w Grodnie", "последний король, отрёкшийся в 1795 году в Гродно"), answer: "sap", explain: r("Stanisław August podpisał abdykację 25 listopada 1795 roku, w rocznicę swojej koronacji, i zmarł w Petersburgu w 1798 roku.", "Станислав Август подписал отречение 25 ноября 1795 года, в годовщину своей коронации, и умер в Петербурге в 1798 году.") },
];

const TF: Statement[] = [
  { text: r("Kosynierzy to chłopi uzbrojeni w kosy osadzone na sztorc.", "Косинеры — это крестьяне, вооружённые косами, насаженными вертикально."), truth: true, why: r("Brakowało karabinów, więc kosy przekuwano w broń. Pod Racławicami kosynierzy zdobyli rosyjskie armaty.", "Ружей не хватало, поэтому косы перековывали в оружие. Под Рацлавицами косинеры захватили русские пушки.") },
  { text: r("Uniwersał połaniecki całkowicie zniósł pańszczyznę.", "Поланецкий универсал полностью отменил барщину."), truth: false, why: r("Dał chłopom wolność osobistą i zmniejszył pańszczyznę (a walczącym ją zawiesił), ale jej nie zniósł.", "Он дал крестьянам личную свободу и уменьшил барщину (а сражавшимся её приостановил), но не отменил её.") },
  { text: r("Kościuszko zginął w bitwie pod Maciejowicami.", "Костюшко погиб в битве под Мацеёвицами."), truth: false, why: r("Został ranny i trafił do niewoli rosyjskiej. Zwolniony w 1796 roku, zmarł w Szwajcarii w 1817 roku.", "Он был ранен и попал в русский плен. Освобождён в 1796 году, умер в Швейцарии в 1817 году.") },
  { text: r("Powstanie wybuchło po II rozbiorze, gdy zaborcy kazali zmniejszyć polską armię.", "Восстание вспыхнуло после второго раздела, когда захватчики приказали сократить польскую армию."), truth: true, why: r("Rozkaz redukcji wojska do 15 tysięcy przyspieszył wybuch: brygadier Madaliński odmówił i ruszył na Kraków.", "Приказ сократить войско до 15 тысяч ускорил начало: бригадир Мадалинский отказался и двинулся на Краков.") },
  { text: r("Po III rozbiorze Warszawa znalazła się pod panowaniem Rosji.", "После третьего раздела Варшава оказалась под властью России."), truth: false, why: r("Warszawę i Mazowsze wzięły Prusy; Rosja — Litwę z Wilnem i Grodnem; Austria — Kraków i Lublin.", "Варшаву и Мазовию взяла Пруссия; Россия — Литву с Вильно и Гродно; Австрия — Краков и Люблин.") },
  { text: r("Zaborcy obiecali sobie, że nazwa „Polska” nigdy nie wróci.", "Захватчики пообещали друг другу, что имя «Польша» никогда не вернётся."), truth: true, why: r("W konwencji z 1797 roku Rosja, Prusy i Austria zobowiązały się nie używać nazwy Królestwo Polskie.", "В конвенции 1797 года Россия, Пруссия и Австрия обязались не употреблять название Королевство Польское.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("przysięga Kościuszki na rynku w Krakowie", "присяга Костюшко на рынке в Кракове"), when: "24 III 1794", note: r("początek insurekcji", "начало восстания") },
  { name: r("bitwa pod Racławicami", "битва под Рацлавицами"), when: "4 IV 1794", note: r("kosynierzy, Bartos Głowacki", "косинеры, Бартош Гловацкий") },
  { name: r("insurekcja warszawska", "Варшавское восстание"), when: "17 IV 1794", note: r("Jan Kiliński", "Ян Килинский") },
  { name: r("Uniwersał połaniecki", "Поланецкий универсал"), when: "7 V 1794" },
  { name: r("bitwa pod Szczekocinami", "битва под Щекоцинами"), when: "6 VI 1794" },
  { name: r("bitwa pod Maciejowicami", "битва под Мацеёвицами"), when: "10 X 1794", note: r("Kościuszko w niewoli", "Костюшко в плену") },
  { name: r("rzeź Pragi", "резня в Праге"), when: "4 XI 1794", note: r("Suworow", "Суворов") },
  { name: r("III rozbiór Polski", "третий раздел Польши"), when: "1795" },
  { name: r("abdykacja Stanisława Augusta", "отречение Станислава Августа"), when: "25 XI 1795" },
];

const SORT: SortItem[] = [
  { name: r("liberum veto i zrywanie sejmów", "либерум вето и срыв сеймов"), group: 0, why: r("państwo przez sto lat nie mogło uchwalić reform", "государство сто лет не могло принять реформ") },
  { name: r("mała armia, brak pieniędzy w skarbie", "маленькая армия, пустая казна"), group: 0, why: r("szlachta nie chciała płacić podatków na wojsko", "шляхта не хотела платить налоги на войско") },
  { name: r("magnaci przekupywani przez obce dwory", "магнаты, подкупленные чужими дворами"), group: 0, why: r("Targowica wezwała obce wojska do własnego kraju", "Тарговица призвала чужие войска в собственную страну") },
  { name: r("wolna elekcja — okazja do obcej interwencji", "свободная элекция — повод для чужого вмешательства"), group: 0, why: r("każdy wybór króla ściągał obce wojska i pieniądze", "каждые выборы короля притягивали чужие войска и деньги") },
  { name: r("Rosja gwarantem ustroju od sejmu niemego", "Россия — гарант строя с Немого сейма"), group: 1, why: r("car blokował każdą próbę wzmocnienia państwa", "царь блокировал любую попытку усилить государство") },
  { name: r("Prusy chcą połączyć swoje ziemie przez Pomorze", "Пруссия хочет соединить свои земли через Поморье"), group: 1, why: r("Fryderyk II był pomysłodawcą I rozbioru", "Фридрих II был инициатором первого раздела") },
  { name: r("sąsiedzi mają armie po 200 tysięcy żołnierzy", "у соседей армии по 200 тысяч солдат"), group: 1, why: r("absolutne monarchie były silniejsze od szlacheckiej republiki", "абсолютные монархии были сильнее шляхетской республики") },
  { name: r("zaborcy boją się Konstytucji 3 maja", "захватчики боятся Конституции 3 мая"), group: 1, why: r("silna Polska psuła ich plany, więc ją zniszczyli", "сильная Польша портила их планы, поэтому они её уничтожили") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Tadeusz Kościuszko — Najwyższy Naczelnik; Bartos Głowacki — kosynier spod Racławic; Jan Kiliński — Warszawa; Jakub Jasiński — Wilno.", "Тадеуш Костюшко — Верховный начальник; Бартош Гловацкий — косинер из-под Рацлавиц; Ян Килинский — Варшава; Якуб Ясинский — Вильно."),
    r("Suworow zdobył Pragę (rzeź Pragi 4 XI 1794) — koniec powstania.", "Суворов взял Прагу (резня в Праге 4 XI 1794) — конец восстания."),
  ],
  s2: [
    r("Uniwersał połaniecki 7 V 1794: wolność osobista dla chłopów i mniejsza pańszczyzna.", "Поланецкий универсал 7 V 1794: личная свобода для крестьян и меньшая барщина."),
    r("Maciejowice 10 X 1794: Kościuszko ranny w niewoli.", "Мацеёвице 10 X 1794: Костюшко ранен и в плену."),
  ],
  s3: [
    r("I rozbiór 1772 — Rosja, Prusy, Austria. II rozbiór 1793 — Rosja i Prusy. III rozbiór 1795 — Rosja, Prusy, Austria.", "Первый раздел 1772 — Россия, Пруссия, Австрия. Второй раздел 1793 — Россия и Пруссия. Третий раздел 1795 — Россия, Пруссия, Австрия."),
    r("Po 1795 roku: Warszawa — Prusy, Kraków — Austria, Wilno — Rosja.", "После 1795 года: Варшава — Пруссия, Краков — Австрия, Вильно — Россия."),
  ],
  s5: [
    r("Przyczyny wewnętrzne: liberum veto, słaba armia, przekupni magnaci, wolna elekcja. Zewnętrzne: potęga i chciwość sąsiadów.", "Внутренние причины: либерум вето, слабая армия, продажные магнаты, свободная элекция. Внешние: мощь и жадность соседей."),
    r("25 XI 1795 Stanisław August abdykował; Rzeczpospolita zniknęła z mapy do 1918 roku.", "25 XI 1795 Станислав Август отрёкся; Речь Посполитая исчезла с карты до 1918 года."),
  ],
};

export default function CollapseLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="collapse" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="collapse-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="collapse-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={TF} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="collapse-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <PartitionsMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="collapse-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="collapse-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.inner, T.outer]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
