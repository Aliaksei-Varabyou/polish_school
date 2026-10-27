// Lesson for §19 "Absolutyzm we Francji" (Historia 6, GWO). Terms, people and dates follow the
// task bank of the same paragraph (templates/data/ch4.ts, ABSOLUTISM and ABSOLUTISM_DATES).
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
import { PowerPyramid } from "./PowerPyramid.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "W XVII wieku król Francji Ludwik XIV skupił w swoich rękach całą władzę. Nie pytał o zdanie ani szlachty, ani miast — rządził sam, otoczony dworem w Wersalu. Taki ustrój nazywamy absolutyzmem, a Ludwik XIV stał się jego wzorem dla całej Europy.",
    "В XVII веке король Франции Людовик XIV сосредоточил в своих руках всю власть. Он не спрашивал мнения ни дворянства, ни городов — правил сам, окружённый двором в Версале. Такой строй называют абсолютизмом, а Людовик XIV стал его образцом для всей Европы.",
  ),
  s1: r("Jak działa władza absolutna?", "Как устроена абсолютная власть?"),
  s1intro: r(
    "Dotknij każdej części schematu. Zwróć uwagę, że wszystkie nitki prowadzą do jednej osoby.",
    "Нажми на каждую часть схемы. Обрати внимание: все нити ведут к одному человеку.",
  ),
  s2: r("Ludzie króla", "Люди короля"),
  s2intro: r("Kardynałowie, ministrowie i sam król. Kto to był?", "Кардиналы, министры и сам король. Кто это был?"),
  s3: r("Gospodarka według Colberta", "Хозяйство по Кольберу"),
  s3intro: r(
    "Merkantylizm: złoto ma wpływać do Francji, a nie z niej wypływać. Które działania Colbert by pochwalił?",
    "Меркантилизм: золото должно притекать во Францию, а не утекать из неё. Какие действия Кольбер бы одобрил?",
  ),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Prawda czy fałsz?", "Правда или ложь?"),
  s5intro: r("Sprawdź, co naprawdę wiesz o Królu Słońce.", "Проверь, что ты на самом деле знаешь о Короле-Солнце."),
  who: r("Kto to był?", "Кто это был?"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  sort: r("Merkantylizm czy nie?", "Меркантилизм или нет?"),
  sortHint: r("Pomyśl: czy po tym działaniu złoto zostaje w kraju?", "Подумай: остаётся ли после этого действия золото в стране?"),
  yes: r("Colbert by pochwalił", "Кольбер бы одобрил"),
  no: r("Colbert by zabronił", "Кольбер бы запретил"),
  timeline: r("Francja Ludwika XIV", "Франция Людовика XIV"),
  tf: r("Król Słońce", "Король-Солнце"),
} satisfies Record<string, Txt>;

const WHO_OPTIONS: QuizOption[] = [
  { id: "ludwik14", label: r("Ludwik XIV", "Людовик XIV") },
  { id: "richelieu", label: r("kardynał Richelieu", "кардинал Ришельё") },
  { id: "mazarin", label: r("kardynał Mazarin", "кардинал Мазарини") },
  { id: "colbert", label: r("Jean-Baptiste Colbert", "Жан-Батист Кольбер") },
  { id: "ludwik13", label: r("Ludwik XIII", "Людовик XIII") },
];

const WHO: QuizItem[] = [
  { icon: "☀️", name: r("Król Słońce, który panował 72 lata i mówił „Państwo to ja”", "Король-Солнце, правивший 72 года и говоривший «Государство — это я»"), answer: "ludwik14", explain: r("Ludwik XIV (1643–1715) — wzór monarchy absolutnego.", "Людовик XIV (1643–1715) — образец абсолютного монарха.") },
  { icon: "🎩", name: r("pierwszy minister Ludwika XIII, który złamał arystokrację i hugenotów", "первый министр Людовика XIII, сломивший аристократию и гугенотов"), answer: "richelieu", explain: r("Kardynał Richelieu rządził Francją w latach 1624–1642 i przygotował grunt pod absolutyzm.", "Кардинал Ришельё правил Францией в 1624–1642 годах и подготовил почву для абсолютизма.") },
  { icon: "👶", name: r("Włoch, który rządził Francją, gdy Ludwik XIV był dzieckiem", "итальянец, правивший Францией, пока Людовик XIV был ребёнком"), answer: "mazarin", explain: r("Kardynał Mazarin kierował państwem do swojej śmierci w 1661 roku; potem król rządził sam.", "Кардинал Мазарини руководил государством до своей смерти в 1661 году; затем король правил сам.") },
  { icon: "💰", name: r("minister finansów, twórca manufaktur i polityki merkantylizmu", "министр финансов, создатель мануфактур и политики меркантилизма"), answer: "colbert", explain: r("Colbert chciał, by Francja sama produkowała wszystko, czego potrzebuje, i sprzedawała to za granicę.", "Кольбер хотел, чтобы Франция сама производила всё необходимое и продавала это за границу.") },
  { icon: "👑", name: r("ojciec Króla Słońce, za którego rządził kardynał Richelieu", "отец Короля-Солнце, за которого правил кардинал Ришельё"), answer: "ludwik13", explain: r("Ludwik XIII zmarł w 1643 roku, zostawiając tron pięcioletniemu synowi.", "Людовик XIII умер в 1643 году, оставив трон пятилетнему сыну.") },
];

const ECONOMY: SortItem[] = [
  { name: r("zakładanie królewskich manufaktur", "основание королевских мануфактур"), group: 0, why: r("własne towary zamiast kupowanych za granicą", "свои товары вместо купленных за границей") },
  { name: r("wysokie cła na towary z zagranicy", "высокие пошлины на товары из-за границы"), group: 0, why: r("obce towary stają się droższe, więc kupuje się francuskie", "чужие товары дорожают, поэтому покупают французские") },
  { name: r("budowa floty handlowej i wojennej", "строительство торгового и военного флота"), group: 0, why: r("własne statki wożą francuskie towary do kolonii i z kolonii", "свои корабли возят французские товары в колонии и из колоний") },
  { name: r("zakładanie kompanii handlowych i kolonii", "основание торговых компаний и колоний"), group: 0, why: r("kolonie dostarczają surowców i kupują francuskie wyroby", "колонии дают сырьё и покупают французские изделия") },
  { name: r("sprowadzanie luksusowych tkanin z Włoch", "ввоз роскошных тканей из Италии"), group: 1, why: r("złoto odpływa do Włoch — lepiej tkać jedwab we Francji", "золото утекает в Италию — лучше ткать шёлк во Франции") },
  { name: r("wywóz złota za granicę za gotowe towary", "вывоз золота за границу за готовые товары"), group: 1, why: r("to dokładne przeciwieństwo merkantylizmu", "это полная противоположность меркантилизма") },
  { name: r("zniesienie wszystkich ceł, by każdy handlował swobodnie", "отмена всех пошлин, чтобы каждый торговал свободно"), group: 1, why: r("bez ceł tanie obce towary wyparłyby francuskie", "без пошлин дешёвые чужие товары вытеснили бы французские") },
  { name: r("kupowanie broni dla armii w Holandii zamiast we Francji", "закупка оружия для армии в Голландии вместо Франции"), group: 1, why: r("pieniądze skarbu powinny trafiać do francuskich warsztatów", "деньги казны должны идти во французские мастерские") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("Richelieu zostaje pierwszym ministrem", "Ришельё становится первым министром"), when: "1624", note: r("za Ludwika XIII", "при Людовике XIII") },
  { name: r("Ludwik XIV wstępuje na tron", "Людовик XIV вступает на престол"), when: "1643", note: r("ma pięć lat; rządzi Mazarin", "ему пять лет; правит Мазарини") },
  { name: r("początek samodzielnych rządów Ludwika XIV", "начало самостоятельного правления Людовика XIV"), when: "1661", note: r("po śmierci Mazarina", "после смерти Мазарини") },
  { name: r("dwór przenosi się do Wersalu", "двор переезжает в Версаль"), when: "1682" },
  { name: r("odwołanie edyktu nantejskiego", "отмена Нантского эдикта"), when: "1685", note: r("hugenoci tracą wolność wyznania", "гугеноты теряют свободу вероисповедания") },
  { name: r("śmierć Ludwika XIV", "смерть Людовика XIV"), when: "1715", note: r("po 72 latach panowania", "после 72 лет правления") },
];

const FACTS: Statement[] = [
  { text: r("Ludwik XIV został królem jako pięcioletnie dziecko.", "Людовик XIV стал королём пятилетним ребёнком."), truth: true, why: r("Tron objął w 1643 roku; przez 18 lat rządził za niego kardynał Mazarin.", "Он занял трон в 1643 году; 18 лет за него правил кардинал Мазарини.") },
  { text: r("Wersal zbudowano w samym centrum Paryża.", "Версаль построили в самом центре Парижа."), truth: false, why: r("Wersal leży około 20 km od Paryża. Król wolał trzymać się z dala od niespokojnego miasta.", "Версаль находится примерно в 20 км от Парижа. Король предпочитал держаться подальше от беспокойного города.") },
  { text: r("Po śmierci Mazarina Ludwik XIV nie mianował już żadnego pierwszego ministra.", "После смерти Мазарини Людовик XIV больше не назначал первого министра."), truth: true, why: r("Od 1661 roku rządził sam — to początek jego absolutyzmu.", "С 1661 года он правил сам — это начало его абсолютизма.") },
  { text: r("Odwołanie edyktu nantejskiego dało hugenotom więcej wolności.", "Отмена Нантского эдикта дала гугенотам больше свободы."), truth: false, why: r("Przeciwnie: edykt nantejski z 1598 roku dawał im wolność wyznania, a jego odwołanie w 1685 roku ją odebrało.", "Наоборот: Нантский эдикт 1598 года давал им свободу вероисповедания, а его отмена в 1685 году её отняла.") },
  { text: r("Arystokraci w Wersalu byli tak zajęci ceremoniałem, że nie mieli czasu na spiski.", "Аристократы в Версале были так заняты церемониалом, что у них не оставалось времени на заговоры."), truth: true, why: r("O to właśnie chodziło królowi: zamienił groźnych panów w dworzan zabiegających o jego łaski.", "Именно этого и добивался король: он превратил опасных сеньоров в придворных, ищущих его милости.") },
  { text: r("Wojny Ludwika XIV przyniosły Francji wielkie bogactwo.", "Войны Людовика XIV принесли Франции большое богатство."), truth: false, why: r("Długie wojny, zwłaszcza o sukcesję hiszpańską, wyczerpały skarb i zubożyły poddanych.", "Долгие войны, особенно за испанское наследство, истощили казну и разорили подданных.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Absolutyzm: cała władza — prawodawcza, wykonawcza, sądownicza — w rękach króla.", "Абсолютизм: вся власть — законодательная, исполнительная, судебная — в руках короля."),
    r("Narzędzia króla: ministrowie, intendenci, armia stała, dwór w Wersalu, jedna wiara.", "Инструменты короля: министры, интенданты, постоянная армия, двор в Версале, одна вера."),
  ],
  s2: [
    r("Richelieu (za Ludwika XIII) i Mazarin (w dzieciństwie Ludwika XIV) przygotowali absolutyzm.", "Ришельё (при Людовике XIII) и Мазарини (в детстве Людовика XIV) подготовили абсолютизм."),
    r("Od 1661 roku Ludwik XIV rządzi sam; Colbert dba o skarb i gospodarkę.", "С 1661 года Людовик XIV правит сам; Кольбер заботится о казне и хозяйстве."),
  ],
  s3: [
    r("Merkantylizm: więcej wywozić, mniej sprowadzać, gromadzić złoto w kraju.", "Меркантилизм: больше вывозить, меньше ввозить, накапливать золото в стране."),
    r("Manufaktura — duży zakład, w którym wielu robotników pracuje ręcznie, każdy przy innej czynności.", "Мануфактура — большое предприятие, где много рабочих трудятся вручную, каждый над своей операцией."),
  ],
  s5: [
    r("1685 — odwołanie edyktu nantejskiego: „jeden król, jedno prawo, jedna wiara”.", "1685 — отмена Нантского эдикта: «один король, один закон, одна вера»."),
    r("Ludwik XIV panował w latach 1643–1715 — najdłużej w dziejach Europy.", "Людовик XIV правил в 1643–1715 годах — дольше всех в истории Европы."),
  ],
};

export default function AbsolutismLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="absolutism" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="absolutism-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <PowerPyramid lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="absolutism-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="absolutism-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.yes, T.no]} items={ECONOMY} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="absolutism-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="absolutism-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
