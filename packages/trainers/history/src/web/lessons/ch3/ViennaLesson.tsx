// Lesson for §17 "Wojny z Turcją" (Historia 6, GWO). Names and dates follow the task bank of the
// same paragraph (templates/data/ch3.ts, VIENNA and VIENNA_DATES).
import { LessonIntro, MatchQuiz, Remember, Section, Timeline, TrueFalse, TwoWaySort, type LessonProps, type QuizItem, type QuizOption, type SortItem, type Statement, type TimelineEvent, type Txt } from "@portal/lessons";
import { ViennaPlan } from "./ViennaPlan.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "W 1672 roku Turcy zdobyli Kamieniec Podolski, a osłabiona Rzeczpospolita musiała w Buczaczu zgodzić się na haracz. Hetman Jan Sobieski zmył tę hańbę pod Chocimiem i został królem. Jedenaście lat później uratował Wiedeń — a razem z nim całą chrześcijańską Europę.",
    "В 1672 году турки взяли Каменец-Подольский, и ослабленная Речь Посполитая была вынуждена в Бучаче согласиться на дань. Гетман Ян Собеский смыл этот позор под Хотином и стал королём. Одиннадцать лет спустя он спас Вену — а с ней и всю христианскую Европу.",
  ),
  s1: r("Kto to był?", "Кто это был?"),
  s1intro: r("Król, wezyr, cesarz… Dopasuj opis do postaci.", "Король, визирь, император… Подбери описание к личности."),
  s2: r("Plan bitwy pod Wiedniem", "План Венской битвы"),
  s2intro: r("Dotknij części planu, żeby poznać przebieg bitwy 12 września 1683 roku. Potem w trybie „Podpisz sam” rozmieść nazwy.", "Нажимай на части плана, чтобы узнать ход битвы 12 сентября 1683 года. Потом в режиме «Подпиши сам» расставь названия."),
  s3: r("Zysk czy strata?", "Приобретение или потеря?"),
  s3intro: r("Co w wojnach z Turcją było dla Rzeczypospolitej zyskiem, a co stratą lub hańbą?", "Что в войнах с Турцией было для Речи Посполитой приобретением, а что — потерей или позором?"),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Sprawdź, czy nie dałeś się złapać na typowe pomyłki.", "Проверь, не попался ли ты на типичные ошибки."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  who: r("Ludzie wojen z Turcją", "Люди войн с Турцией"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  sort: r("Zysk czy strata Rzeczypospolitej?", "Приобретение или потеря Речи Посполитой?"),
  sortHint: r("Pomyśl, czy po tym wydarzeniu Polska była silniejsza, czy słabsza.", "Подумай, стала ли Польша после этого события сильнее или слабее."),
  gain: r("zysk", "приобретение"),
  loss: r("strata", "потеря"),
  tf: r("Sobieski i Turcy", "Собеский и турки"),
  timeline: r("Od Buczacza do Karłowic", "От Бучача до Карловиц"),
} satisfies Record<string, Txt>;

const WHO_OPTIONS: QuizOption[] = [
  { id: "sobieski", label: r("Jan III Sobieski", "Ян III Собеский") },
  { id: "kara", label: r("Kara Mustafa", "Кара-Мустафа") },
  { id: "leopold", label: r("Leopold I", "Леопольд I") },
  {
    id: "korybut",
    label: r("Michał Korybut Wiśniowiecki", "Михаил Корибут Вишневецкий"),
  },
  { id: "lotarynski", label: r("Karol Lotaryński", "Карл Лотарингский") },
];

const WHO: QuizItem[] = [
  {
    icon: "👑",
    name: r("hetman, zwycięzca spod Chocimia, od 1674 roku król Polski", "гетман, победитель под Хотином, с 1674 года король Польши"),
    answer: "sobieski",
    explain: r("Jan III Sobieski — jedyny król Polski, który został wybrany za zasługi wojenne.", "Ян III Собеский — единственный король Польши, избранный за военные заслуги."),
  },
  {
    icon: "🌙",
    name: r("wielki wezyr, dowódca armii oblegającej Wiedeń", "великий визирь, командующий армией, осаждавшей Вену"),
    answer: "kara",
    explain: r("Kara Mustafa po klęsce został uduszony jedwabnym sznurem na rozkaz sułtana.", "Кара-Мустафа после поражения был задушен шёлковым шнуром по приказу султана."),
  },
  {
    icon: "🏰",
    name: r("cesarz, który uciekł z oblężonego Wiednia i prosił Polskę o pomoc", "император, бежавший из осаждённой Вены и просивший Польшу о помощи"),
    answer: "leopold",
    explain: r("Leopold I zawarł z Sobieskim sojusz na wiosnę 1683 roku; po bitwie przyjął króla dość chłodno.", "Леопольд I заключил с Собеским союз весной 1683 года; после битвы принял короля довольно холодно."),
  },
  {
    icon: "😔",
    name: r("słaby król, za którego panowania utracono Kamieniec i podpisano traktat w Buczaczu", "слабый король, при котором потеряли Каменец и подписали Бучачский мир"),
    answer: "korybut",
    explain: r("Michał Korybut Wiśniowiecki zmarł w 1673 roku, dzień przed zwycięstwem chocimskim.", "Михаил Корибут Вишневецкий умер в 1673 году, за день до победы под Хотином."),
  },
  {
    icon: "🛡️",
    name: r("książę dowodzący wojskami cesarskimi na lewym skrzydle pod Wiedniem", "герцог, командовавший императорскими войсками на левом крыле под Веной"),
    answer: "lotarynski",
    explain: r("Karol Lotaryński nacierał wzdłuż Dunaju; całością armii dowodził Sobieski.", "Карл Лотарингский наступал вдоль Дуная; всей армией командовал Собеский."),
  },
];

const BALANCE: SortItem[] = [
  {
    name: r("utrata Kamieńca Podolskiego (1672)", "потеря Каменца-Подольского (1672)"),
    group: 1,
    why: r("najpotężniejsza twierdza kresów wpadła w ręce Turków", "сильнейшая крепость окраин попала в руки турок"),
  },
  {
    name: r("traktat w Buczaczu (1672)", "Бучачский мир (1672)"),
    group: 1,
    why: r("Polska oddała Podole i miała płacić haracz", "Польша отдала Подолье и должна была платить дань"),
  },
  {
    name: r("haracz dla sułtana", "дань султану"),
    group: 1,
    why: r("coroczna danina — hańba dla Rzeczypospolitej", "ежегодная дань — позор для Речи Посполитой"),
  },
  {
    name: r("bitwa pod Chocimiem (1673)", "битва под Хотином (1673)"),
    group: 0,
    why: r("Sobieski rozbił armię turecką; haraczu nie zapłacono", "Собеский разбил турецкую армию; дань не заплатили"),
  },
  {
    name: r("odsiecz wiedeńska (1683)", "Венская битва (1683)"),
    group: 0,
    why: r("sława w całej Europie i złamanie potęgi Turcji", "слава во всей Европе и крах могущества Турции"),
  },
  {
    name: r("pokój w Karłowicach (1699)", "Карловицкий мир (1699)"),
    group: 0,
    why: r("Podole z Kamieńcem wróciło do Polski", "Подолье с Каменцем вернулось Польше"),
  },
  {
    name: r("Liga Święta (1684)", "Священная лига (1684)"),
    group: 0,
    why: r("sojusz z Austrią, Wenecją i papieżem przeciw Turcji", "союз с Австрией, Венецией и папой против Турции"),
  },
  {
    name: r("27 lat Podola pod władzą Turcji", "27 лет Подолья под властью Турции"),
    group: 1,
    why: r("kraina była zniszczona i wyludniona, gdy wróciła", "край был разорён и обезлюдел, когда вернулся"),
  },
];

const FACTS: Statement[] = [
  {
    text: r("Po traktacie w Buczaczu Rzeczpospolita miała płacić Turcji coroczny haracz.", "После Бучачского мира Речь Посполитая должна была платить Турции ежегодную дань."),
    truth: true,
    why: r("Sejm nie uznał traktatu, a zwycięstwo pod Chocimiem sprawiło, że haraczu nigdy nie zapłacono.", "Сейм не признал договор, а победа под Хотином привела к тому, что дань так и не заплатили."),
  },
  {
    text: r("Sobieski został królem dzięki zwycięstwu pod Chocimiem.", "Собеский стал королём благодаря победе под Хотином."),
    truth: true,
    why: r("Zwycięstwo z 1673 roku przyniosło mu taką sławę, że w 1674 roku szlachta wybrała go na króla.", "Победа 1673 года принесла ему такую славу, что в 1674 году шляхта избрала его королём."),
  },
  {
    text: r("Pod Wiedniem Sobieski dowodził tylko wojskami polskimi.", "Под Веной Собеский командовал только польскими войсками."),
    truth: false,
    why: r("Jako król stał na czele całej armii sprzymierzonych: Polaków, Austriaków i Niemców.", "Как король он возглавлял всю союзную армию: поляков, австрийцев и немцев."),
  },
  {
    text: r("Odsiecz wiedeńska miała miejsce 12 września 1683 roku.", "Венская битва произошла 12 сентября 1683 года."),
    truth: true,
    why: r("Bitwa trwała od rana; o zwycięstwie przesądziła wieczorna szarża husarii z Kahlenbergu.", "Битва шла с утра; победу решила вечерняя атака гусарии с Каленберга."),
  },
  {
    text: r("„Veni, vidi, Deus vicit” znaczy: „Przybyłem, zobaczyłem, zwyciężyłem”.", "«Veni, vidi, Deus vicit» означает: «Пришёл, увидел, победил»."),
    truth: false,
    why: r("Sobieski zmienił słowa Cezara: „Przybyłem, zobaczyłem, Bóg zwyciężył” — tak napisał do papieża.", "Собеский изменил слова Цезаря: «Пришёл, увидел, Бог победил» — так он написал папе."),
  },
  {
    text: r("Pokój w Karłowicach zawarto jeszcze za życia Jana III Sobieskiego.", "Карловицкий мир заключили ещё при жизни Яна III Собеского."),
    truth: false,
    why: r("Król zmarł w 1696 roku; pokój podpisano trzy lata później, w 1699 roku, już za Augusta II.", "Король умер в 1696 году; мир подписали три года спустя, в 1699 году, уже при Августе II."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("upadek Kamieńca i traktat w Buczaczu", "падение Каменца и Бучачский мир"),
    when: "1672",
    note: r("Podole oddane Turcji, haracz", "Подолье отдано Турции, дань"),
  },
  {
    name: r("zwycięstwo Sobieskiego pod Chocimiem", "победа Собеского под Хотином"),
    when: "1673",
  },
  {
    name: r("elekcja Jana III Sobieskiego", "избрание Яна III Собеского"),
    when: "1674",
  },
  {
    name: r("odsiecz wiedeńska", "Венская битва"),
    when: "1683",
    note: r("12 września — szarża husarii z Kahlenbergu", "12 сентября — атака гусарии с Каленберга"),
  },
  {
    name: r("zawiązanie Ligi Świętej", "создание Священной лиги"),
    when: "1684",
  },
  {
    name: r("śmierć Jana III Sobieskiego", "смерть Яна III Собеского"),
    when: "1696",
  },
  {
    name: r("pokój w Karłowicach", "Карловицкий мир"),
    when: "1699",
    note: r("Podole z Kamieńcem wraca do Polski", "Подолье с Каменцем возвращается Польше"),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [r("Jan III Sobieski — hetman, od 1674 król; Kara Mustafa — wielki wezyr; Leopold I — cesarz, który wezwał pomoc.", "Ян III Собеский — гетман, с 1674 король; Кара-Мустафа — великий визирь; Леопольд I — император, позвавший на помощь.")],
  s2: [r("12 IX 1683: armia sprzymierzonych zeszła z Kahlenbergu; o zwycięstwie przesądziła szarża husarii.", "12 IX 1683: союзная армия спустилась с Каленберга; победу решила атака гусарии."), r("„Veni, vidi, Deus vicit” — „Przybyłem, zobaczyłem, Bóg zwyciężył” (list Sobieskiego do papieża).", "«Veni, vidi, Deus vicit» — «Пришёл, увидел, Бог победил» (письмо Собеского папе).")],
  s3: [r("Straty: Kamieniec Podolski i traktat w Buczaczu 1672 (Podole, haracz).", "Потери: Каменец-Подольский и Бучачский мир 1672 (Подолье, дань)."), r("Zyski: Chocim 1673, Wiedeń 1683, Liga Święta 1684, pokój w Karłowicach 1699 (powrót Podola).", "Приобретения: Хотин 1673, Вена 1683, Священная лига 1684, Карловицкий мир 1699 (возвращение Подолья).")],
  s4: [r("Pokój w Karłowicach (1699) zakończył wojny polsko-tureckie; Turcja już nigdy nie zagroziła Polsce.", "Карловицкий мир (1699) завершил польско-турецкие войны; Турция больше никогда не угрожала Польше.")],
};

export default function ViennaLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="vienna" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="vienna-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="vienna-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <ViennaPlan lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="vienna-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.gain, T.loss]} items={BALANCE} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="vienna-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="vienna-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
