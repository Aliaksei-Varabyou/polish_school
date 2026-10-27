// Lesson for §24 "Początek rewolucji francuskiej" (Historia 6, GWO). Terms, people and dates
// follow the task bank of the same paragraph (templates/data/ch4.ts, REVOLUTION and REVOLUTION_DATES).
import {
  LessonIntro,
  OrderGame,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type LessonProps,
  type SortItem,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { EstatesDiagram } from "./EstatesDiagram.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Francja Ludwika XVI była największym państwem Europy — i bankrutem. Podatki płacił tylko stan trzeci, a szlachta i duchowieństwo cieszyły się przywilejami. Gdy w 1789 roku król zwołał Stany Generalne, by ratować skarb, posłowie stanu trzeciego ogłosili się Zgromadzeniem Narodowym. Kilka tygodni później lud Paryża zdobył Bastylię.",
    "Франция Людовика XVI была крупнейшим государством Европы — и банкротом. Налоги платило только третье сословие, а дворянство и духовенство пользовались привилегиями. Когда в 1789 году король созвал Генеральные штаты, чтобы спасти казну, депутаты третьего сословия объявили себя Национальным собранием. Через несколько недель парижане взяли Бастилию.",
  ),
  s1: r("Trzy stany", "Три сословия"),
  s1intro: r(
    "Rysunek powtarza słynną karykaturę z 1789 roku. Dotknij każdej postaci, a potem podpisz je sam.",
    "Рисунок повторяет знаменитую карикатуру 1789 года. Нажми на каждую фигуру, а потом подпиши их сам.",
  ),
  s2: r("Przyczyna czy skutek?", "Причина или следствие?"),
  s2intro: r("Co doprowadziło do wybuchu rewolucji, a co było jej pierwszym owocem?", "Что привело к началу революции, а что стало её первым плодом?"),
  s3: r("Od Stanów Generalnych do Bastylii", "От Генеральных штатов до Бастилии"),
  s3intro: r("Rok 1789 krok po kroku. Ułóż wydarzenia w kolejności.", "1789 год шаг за шагом. Расставь события по порядку."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Tym razem liczą się nie tylko lata, ale i dni.", "На этот раз важны не только годы, но и дни."),
  s5: r("Deklaracja praw człowieka i obywatela", "Декларация прав человека и гражданина"),
  s5intro: r("Prawda czy fałsz? Co naprawdę zapisano 26 sierpnia 1789 roku?", "Правда или ложь? Что на самом деле записали 26 августа 1789 года?"),
  sort: r("Przed czy po 14 lipca?", "До или после 14 июля?"),
  sortHint: r("Przyczyny narastały latami; skutki przyszły w ciągu kilku miesięcy.", "Причины копились годами; следствия пришли за несколько месяцев."),
  cause: r("przyczyna", "причина"),
  effect: r("skutek", "следствие"),
  order: r("Rok 1789", "1789 год"),
  orderHint: r("Zacznij od decyzji króla.", "Начни с решения короля."),
  timeline: r("Rewolucja dzień po dniu", "Революция день за днём"),
  tf: r("Co mówi Deklaracja?", "Что говорит Декларация?"),
} satisfies Record<string, Txt>;

const CAUSES: SortItem[] = [
  { name: r("pusty skarb po wojnach i pomocy dla Ameryki", "пустая казна после войн и помощи Америке"), group: 0, why: r("kryzys finansowy zmusił króla do zwołania Stanów Generalnych", "финансовый кризис вынудил короля созвать Генеральные штаты") },
  { name: r("szlachta i duchowieństwo nie płacą podatków", "дворянство и духовенство не платят налогов"), group: 0, why: r("nierówność stanów była główną przyczyną gniewu stanu trzeciego", "неравенство сословий было главной причиной гнева третьего сословия") },
  { name: r("nieurodzaj i drożyzna chleba", "неурожай и дороговизна хлеба"), group: 0, why: r("głodny Paryż łatwo wychodził na ulice", "голодный Париж легко выходил на улицы") },
  { name: r("idee oświecenia: wolność, równość, władza od ludu", "идеи Просвещения: свобода, равенство, власть от народа"), group: 0, why: r("burżuazja czytała Rousseau i Monteskiusza", "буржуазия читала Руссо и Монтескьё") },
  { name: r("zniesienie przywilejów feudalnych", "отмена феодальных привилегий"), group: 1, why: r("Zgromadzenie Narodowe, noc 4 sierpnia 1789", "Национальное собрание, ночь 4 августа 1789") },
  { name: r("Deklaracja praw człowieka i obywatela", "Декларация прав человека и гражданина"), group: 1, why: r("uchwalona 26 sierpnia 1789", "принята 26 августа 1789") },
  { name: r("monarchia konstytucyjna", "конституционная монархия"), group: 1, why: r("wprowadzona konstytucją z września 1791", "введена конституцией в сентябре 1791") },
  { name: r("Gwardia Narodowa pod wodzą La Fayette’a", "Национальная гвардия под командованием Лафайета"), group: 1, why: r("mieszczanie uzbroili się po zdobyciu Bastylii", "горожане вооружились после взятия Бастилии") },
];

const ORDER: Txt[] = [
  r("Ludwik XVI zwołuje Stany Generalne", "Людовик XVI созывает Генеральные штаты"),
  r("spór o głosowanie: stanami czy głowami?", "спор о голосовании: по сословиям или поголовно?"),
  r("stan trzeci ogłasza się Zgromadzeniem Narodowym", "третье сословие объявляет себя Национальным собранием"),
  r("przysięga w sali do gry w piłkę", "клятва в зале для игры в мяч"),
  r("lud Paryża zdobywa Bastylię", "парижане берут Бастилию"),
  r("zniesienie przywilejów feudalnych", "отмена феодальных привилегий"),
  r("Deklaracja praw człowieka i obywatela", "Декларация прав человека и гражданина"),
  r("konstytucja — Francja monarchią konstytucyjną", "конституция — Франция становится конституционной монархией"),
];

const EVENTS: TimelineEvent[] = [
  { name: r("otwarcie Stanów Generalnych w Wersalu", "открытие Генеральных штатов в Версале"), when: "5 V 1789" },
  { name: r("stan trzeci ogłasza się Zgromadzeniem Narodowym", "третье сословие объявляет себя Национальным собранием"), when: "17 VI 1789" },
  { name: r("przysięga w sali do gry w piłkę", "клятва в зале для игры в мяч"), when: "20 VI 1789", note: r("„nie rozejdziemy się, póki nie uchwalimy konstytucji”", "«не разойдёмся, пока не примем конституцию»") },
  { name: r("zdobycie Bastylii", "взятие Бастилии"), when: "14 VII 1789", note: r("dziś święto narodowe Francji", "сегодня национальный праздник Франции") },
  { name: r("zniesienie przywilejów feudalnych", "отмена феодальных привилегий"), when: "4 VIII 1789" },
  { name: r("Deklaracja praw człowieka i obywatela", "Декларация прав человека и гражданина"), when: "26 VIII 1789" },
  { name: r("pierwsza konstytucja Francji", "первая конституция Франции"), when: "IX 1791", note: r("monarchia konstytucyjna", "конституционная монархия") },
];

const FACTS: Statement[] = [
  { text: r("Ludzie rodzą się i pozostają wolni i równi w prawach.", "Люди рождаются и остаются свободными и равными в правах."), truth: true, why: r("To pierwszy artykuł Deklaracji — koniec podziału na stany.", "Это первая статья Декларации — конец деления на сословия.") },
  { text: r("Źródłem wszelkiej władzy jest król.", "Источник всякой власти — король."), truth: false, why: r("Deklaracja mówi: źródłem władzy jest naród. To idea Rousseau.", "Декларация гласит: источник власти — нация. Это идея Руссо.") },
  { text: r("Każdy ma prawo do wolności słowa i wyznania.", "Каждый имеет право на свободу слова и вероисповедания."), truth: true, why: r("Nikogo nie wolno niepokoić z powodu jego poglądów, także religijnych.", "Никого нельзя преследовать за его взгляды, в том числе религиозные.") },
  { text: r("Deklaracja przyznała prawa wyborcze wszystkim, także kobietom.", "Декларация дала избирательные права всем, в том числе женщинам."), truth: false, why: r("Prawa wyborcze dostali tylko mężczyźni płacący odpowiedni podatek. Kobiety musiały czekać do XX wieku.", "Избирательные права получили только мужчины, платившие определённый налог. Женщинам пришлось ждать до XX века.") },
  { text: r("Własność jest prawem świętym i nienaruszalnym.", "Собственность — священное и неприкосновенное право."), truth: true, why: r("Tak chciała burżuazja: nikt nie może odebrać majątku bez odszkodowania.", "Так хотела буржуазия: никто не может отнять имущество без возмещения.") },
  { text: r("Deklaracja zniosła monarchię i ogłosiła republikę.", "Декларация упразднила монархию и провозгласила республику."), truth: false, why: r("W 1789 roku Francja pozostała monarchią; republikę ogłoszono dopiero we wrześniu 1792 roku.", "В 1789 году Франция осталась монархией; республику провозгласили только в сентябре 1792 года.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Stan I — duchowieństwo, stan II — szlachta: 2% ludności, przywileje, bez podatków.", "I сословие — духовенство, II — дворянство: 2% населения, привилегии, без налогов."),
    r("Stan III — 98%: chłopi i mieszczanie (w tym burżuazja); płacili podatki, nie mieli władzy.", "III сословие — 98%: крестьяне и горожане (включая буржуазию); платили налоги, не имели власти."),
  ],
  s2: [
    r("Przyczyny: kryzys finansowy, nierówność stanów, drożyzna, idee oświecenia.", "Причины: финансовый кризис, неравенство сословий, дороговизна, идеи Просвещения."),
    r("Pierwsze skutki: zniesienie przywilejów (4 VIII), Deklaracja praw (26 VIII), konstytucja (1791).", "Первые следствия: отмена привилегий (4 VIII), Декларация прав (26 VIII), конституция (1791)."),
  ],
  s3: [
    r("5 V 1789 Stany Generalne → 17 VI Zgromadzenie Narodowe → 20 VI przysięga → 14 VII Bastylia.", "5 V 1789 Генеральные штаты → 17 VI Национальное собрание → 20 VI клятва → 14 VII Бастилия."),
  ],
  s5: [
    r("Deklaracja praw człowieka i obywatela (26 VIII 1789): wolność, równość wobec prawa, własność, władza od narodu.", "Декларация прав человека и гражданина (26 VIII 1789): свобода, равенство перед законом, собственность, власть от нации."),
    r("Konstytucja 1791: monarchia konstytucyjna — król ma władzę wykonawczą, prawa uchwala zgromadzenie.", "Конституция 1791: конституционная монархия — у короля исполнительная власть, законы принимает собрание."),
  ],
};

export default function RevolutionLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="revolution" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="revolution-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <EstatesDiagram lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="revolution-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.cause, T.effect]} items={CAUSES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="revolution-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} steps={ORDER} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="revolution-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="revolution-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
