// Lesson for §7 "Gospodarka dawnej Polski" (Historia 6, GWO). Terms and dates follow the task bank
// of the same paragraph (templates/data/ch2.ts, ECONOMY and ECONOMY_DATES).
import { LessonIntro, Remember, Section, Timeline, TrueFalse, TwoWaySort, type LessonProps, type SortItem, type Statement, type TimelineEvent, type Txt } from "@portal/lessons";
import { FolwarkDiagram } from "./FolwarkDiagram.tsx";
import { GrainRoute } from "./GrainRoute.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Złoty wiek Polski miał swoje źródło w zbożu. Szlachta zakładała folwarki, chłopi odrabiali na nich pańszczyznę, a worki z żytem i pszenicą płynęły Wisłą do Gdańska i dalej do Niderlandów. Rzeczpospolita stała się spichlerzem Europy.",
    "Источником золотого века Польши было зерно. Шляхта основывала фольварки, крестьяне отрабатывали на них барщину, а мешки с рожью и пшеницей плыли по Висле в Гданьск и дальше в Нидерланды. Речь Посполитая стала житницей Европы.",
  ),
  s1: r("Folwark i pańszczyzna", "Фольварк и барщина"),
  s1intro: r("Dotknij części rysunku: dworu, pól, wsi i rzeki. Potem podpisz je sam.", "Нажимай на части рисунка: усадьбу, поля, деревню и реку. Потом подпиши их сам."),
  s2: r("Szlachcic czy chłop?", "Шляхтич или крестьянин?"),
  s2intro: r("Kogo dotyczy każde zdanie? Dwa stany, dwa zupełnie różne życia.", "О ком каждое утверждение? Два сословия, две совершенно разные жизни."),
  s3: r("Droga zboża", "Путь зерна"),
  s3intro: r("Prześledź drogę worka zboża: z folwarku pod Krakowem aż na stół w Amsterdamie.", "Проследи путь мешка зерна: из фольварка под Краковом до стола в Амстердаме."),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Sprawdź, czy rozumiesz, kto na handlu zbożem zyskał, a kto stracił.", "Проверь, понимаешь ли ты, кто выиграл от торговли зерном, а кто проиграл."),
  s5: r("Przywileje szlachty — oś czasu", "Привилегии шляхты — лента времени"),
  s5intro: r("Królowie krok po kroku oddawali szlachcie władzę. Ułóż przywileje i prawa w kolejności.", "Короли шаг за шагом отдавали шляхте власть. Расставь привилегии и законы по порядку."),
  sort: r("Kogo to dotyczy?", "О ком это?"),
  sortHint: r("Szlachcic — właściciel folwarku; chłop — jego poddany.", "Шляхтич — владелец фольварка; крестьянин — его подданный."),
  noble: r("szlachcic", "шляхтич"),
  peasant: r("chłop", "крестьянин"),
  tf: r("Zboże, Gdańsk i pieniądze", "Зерно, Гданьск и деньги"),
  timeline: r("Od przywileju koszyckiego do ustawy o pańszczyźnie", "От Кошицкого привилея до закона о барщине"),
} satisfies Record<string, Txt>;

const WHO: SortItem[] = [
  {
    name: r("sprzedaje zboże kupcom w Gdańsku", "продаёт зерно купцам в Гданьске"),
    group: 0,
    why: r("dochód z folwarku należał do właściciela", "доход с фольварка принадлежал владельцу"),
  },
  {
    name: r("odrabia pańszczyznę na polu pana", "отрабатывает барщину на поле пана"),
    group: 1,
    why: r("od 1520 roku co najmniej jeden dzień w tygodniu z łanu", "с 1520 года не менее одного дня в неделю с лана"),
  },
  {
    name: r("nie płaci cła na towary przewożone Wisłą", "не платит пошлину на товары, перевозимые по Висле"),
    group: 0,
    why: r("przywilej z 1496 roku zwolnił szlachtę z ceł", "привилей 1496 года освободил шляхту от пошлин"),
  },
  {
    name: r("nie może opuścić wsi bez zgody pana", "не может покинуть деревню без согласия пана"),
    group: 1,
    why: r("to poddaństwo chłopów", "это крепостная зависимость крестьян"),
  },
  {
    name: r("sądzi swoich poddanych", "судит своих подданных"),
    group: 0,
    why: r("pan był sędzią dla mieszkańców swojej wsi", "пан был судьёй для жителей своей деревни"),
  },
  {
    name: r("uprawia własny łan ziemi dla rodziny", "обрабатывает собственный лан земли для семьи"),
    group: 1,
    why: r("z łanu chłop żywił rodzinę i odrabiał pańszczyznę", "с лана крестьянин кормил семью и отрабатывал барщину"),
  },
  {
    name: r("kupuje za zboże sukno, wino i przyprawy z Zachodu", "покупает за зерно сукно, вино и пряности с Запада"),
    group: 0,
    why: r("szlachta wydawała zyski na towary luksusowe", "шляхта тратила прибыль на предметы роскоши"),
  },
  {
    name: r("płaci panu czynsz i daniny w naturze", "платит пану чинш и натуральные повинности"),
    group: 1,
    why: r("oprócz pańszczyzny chłop oddawał część plonów", "кроме барщины крестьянин отдавал часть урожая"),
  },
];

const FACTS: Statement[] = [
  {
    text: r("Folwark produkował zboże głównie na sprzedaż, nie na własne potrzeby.", "Фольварк производил зерно главным образом на продажу, а не для собственных нужд."),
    truth: true,
    why: r("Zboże płynęło Wisłą do Gdańska i dalej na Zachód — to był towar.", "Зерно шло по Висле в Гданьск и дальше на Запад — это был товар."),
  },
  {
    text: r("Największe zyski z handlu zbożem miały miasta portowe, przede wszystkim Gdańsk.", "Наибольшую прибыль от торговли зерном получали портовые города, прежде всего Гданьск."),
    truth: true,
    why: r("Gdańsk pośredniczył w handlu i stał się najbogatszym miastem Rzeczypospolitej.", "Гданьск был посредником в торговле и стал богатейшим городом Речи Посполитой."),
  },
  {
    text: r("Chłopi, dzięki handlowi zbożem, zyskali wolność i pieniądze.", "Крестьяне благодаря торговле зерном получили свободу и деньги."),
    truth: false,
    why: r("Było odwrotnie: szlachta zwiększała pańszczyznę i przywiązywała chłopów do ziemi.", "Было наоборот: шляхта увеличивала барщину и прикрепляла крестьян к земле."),
  },
  {
    text: r("Mieszczanie mogli swobodnie kupować ziemię i zakładać folwarki.", "Горожане могли свободно покупать землю и основывать фольварки."),
    truth: false,
    why: r("Przywilej piotrkowski z 1496 roku zakazał mieszczanom kupowania dóbr ziemskich.", "Петроковский привилей 1496 года запретил горожанам покупать земельные владения."),
  },
  {
    text: r("Trójpolówka polegała na tym, że co roku jedno z trzech pól odpoczywało jako ugór.", "Трёхполье состояло в том, что каждый год одно из трёх полей отдыхало под паром."),
    truth: true,
    why: r("Pole ozime, jare i ugór zmieniały się co roku, dzięki czemu ziemia się nie wyjaławiała.", "Озимое, яровое поле и пар менялись каждый год, благодаря чему земля не истощалась."),
  },
  {
    text: r("Zboże z Polski kupowali przede wszystkim kupcy z Niderlandów.", "Зерно из Польши покупали прежде всего купцы из Нидерландов."),
    truth: true,
    why: r("Holenderskie statki wywoziły je z Gdańska i karmiły miasta Europy Zachodniej.", "Голландские корабли вывозили его из Гданьска и кормили города Западной Европы."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("przywilej koszycki", "Кошицкий привилей"),
    when: "1374",
    note: r("szlachta zwolniona z większości podatków", "шляхта освобождена от большинства налогов"),
  },
  {
    name: r("przywileje cerekwicko-nieszawskie", "Нешавские привилеи"),
    when: "1454",
    note: r("bez zgody sejmików król nie zwoła pospolitego ruszenia", "без согласия сеймиков король не созовёт посполитое рушение"),
  },
  {
    name: r("II pokój toruński — Gdańsk wraca do Polski", "Второй Торуньский мир — Гданьск возвращается к Польше"),
    when: "1466",
  },
  {
    name: r("przywilej piotrkowski", "Петроковский привилей"),
    when: "1496",
    note: r("mieszczanie nie kupią ziemi, chłop nie odejdzie ze wsi", "горожане не купят землю, крестьянин не уйдёт из деревни"),
  },
  {
    name: r("konstytucja nihil novi", "конституция nihil novi"),
    when: "1505",
    note: r("nic nowego bez zgody sejmu", "ничего нового без согласия сейма"),
  },
  {
    name: r("ustawa o pańszczyźnie jednego dnia w tygodniu z łanu", "закон о барщине в один день в неделю с лана"),
    when: "1520",
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r(
      "Folwark — gospodarstwo szlachcica produkujące zboże na sprzedaż; pracują w nim chłopi odrabiający pańszczyznę.",
      "Фольварк — хозяйство шляхтича, производящее зерно на продажу; в нём работают крестьяне, отрабатывающие барщину.",
    ),
    r("Trójpolówka: pole ozime, jare i ugór zmieniają się co roku.", "Трёхполье: озимое, яровое поле и пар меняются каждый год."),
  ],
  s2: [
    r("Szlachcic: właściciel ziemi, sędzia dla chłopów, wolny od ceł i większości podatków.", "Шляхтич: владелец земли, судья для крестьян, свободный от пошлин и большинства налогов."),
    r(
      "Chłop: poddany pana, przywiązany do ziemi, odrabia pańszczyznę (od 1520 roku co najmniej 1 dzień w tygodniu z łanu).",
      "Крестьянин: подданный пана, прикреплённый к земле, отрабатывает барщину (с 1520 года не менее 1 дня в неделю с лана).",
    ),
  ],
  s3: [
    r("Folwark → Wisła (flisacy, szkuty) → Gdańsk (spichlerze, Hanza) → Niderlandy.", "Фольварк → Висла (плотогоны, шкуты) → Гданьск (амбары, Ганза) → Нидерланды."),
    r("Gdańsk był największym portem i najbogatszym miastem Rzeczypospolitej.", "Гданьск был крупнейшим портом и богатейшим городом Речи Посполитой."),
  ],
  s4: [
    r("Na handlu zbożem zyskali szlachta i Gdańsk; chłopi i miasta w głębi kraju stracili.", "От торговли зерном выиграли шляхта и Гданьск; крестьяне и города в глубине страны проиграли."),
    r("1496 — przywilej piotrkowski: mieszczanom nie wolno kupować ziemi.", "1496 — Петроковский привилей: горожанам нельзя покупать землю."),
  ],
};

export default function EconomyLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="economy" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="economy-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <FolwarkDiagram lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="economy-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.noble, T.peasant]} items={WHO} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="economy-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <GrainRoute lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="economy-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="economy-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
