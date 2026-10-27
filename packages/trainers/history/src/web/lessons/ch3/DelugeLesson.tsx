// Lesson for §15 "Potop" (Historia 6, GWO). Names and dates follow the task bank of the same
// paragraph (templates/data/ch3.ts, DELUGE and DELUGE_DATES).
import { LessonIntro, MatchQuiz, OrderGame, Remember, Section, Timeline, TrueFalse, type LessonProps, type QuizItem, type QuizOption, type Statement, type TimelineEvent, type Txt } from "@portal/lessons";
import { DelugeMap } from "./DelugeMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "W 1655 roku na wyczerpaną wojnami Rzeczpospolitą uderzyła Szwecja. Wojska Karola X Gustawa zalały kraj jak biblijny potop: szlachta poddawała się bez walki, a król uciekł za granicę. Przełom przyszedł zimą pod murami Jasnej Góry — i w 1660 roku Szwedzi musieli odejść.",
    "В 1655 году на истощённую войнами Речь Посполитую напала Швеция. Войска Карла X Густава затопили страну, как библейский потоп: шляхта сдавалась без боя, а король бежал за границу. Перелом наступил зимой у стен Ясной Горы — и в 1660 году шведам пришлось уйти.",
  ),
  s1: r("Mapa potopu", "Карта потопа"),
  s1intro: r("Dotknij strzałek i miast, żeby zobaczyć, którędy szli Szwedzi i gdzie odwróciła się karta. Potem w trybie „Podpisz sam” sprawdź, czy pamiętasz, co gdzie się stało.", "Нажимай на стрелки и города, чтобы увидеть, откуда шли шведы и где всё переломилось. Потом в режиме «Подпиши сам» проверь, помнишь ли ты, что где случилось."),
  s2: r("Zdrajcy i bohaterowie", "Изменники и герои"),
  s2intro: r("Jedni sprowadzili Szwedów, inni ich przepędzili. Dopasuj opis do postaci.", "Одни привели шведов, другие их прогнали. Подбери описание к личности."),
  s3: r("Jak przebiegał potop?", "Как проходил потоп?"),
  s3intro: r("Ułóż etapy wojny w kolejności — od pierwszej kapitulacji do pokoju.", "Расставь этапы войны по порядку — от первой капитуляции до мира."),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Sprawdź, czy dobrze pamiętasz, jak potop się skończył i co zmienił.", "Проверь, правильно ли ты помнишь, как закончился потоп и что он изменил."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  who: r("Ludzie potopu", "Люди потопа"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  order: r("Od Ujścia do Oliwy", "От Уйсьце до Оливы"),
  orderHint: r("Dotknij tego, co wydarzyło się jako następne.", "Нажми на то, что случилось следующим."),
  tf: r("Koniec potopu", "Конец потопа"),
  timeline: r("Potop rok po roku", "Потоп год за годом"),
} satisfies Record<string, Txt>;

const WHO_OPTIONS: QuizOption[] = [
  { id: "karol", label: r("Karol X Gustaw", "Карл X Густав") },
  {
    id: "radziejowski",
    label: r("Hieronim Radziejowski", "Иероним Радзеёвский"),
  },
  { id: "radziwill", label: r("Janusz Radziwiłł", "Януш Радзивилл") },
  { id: "kordecki", label: r("Augustyn Kordecki", "Августин Кордецкий") },
  { id: "czarniecki", label: r("Stefan Czarniecki", "Стефан Чарнецкий") },
  { id: "jan-kazimierz", label: r("Jan Kazimierz", "Ян Казимир") },
  { id: "rakoczy", label: r("Jerzy II Rakoczy", "Дьёрдь II Ракоци") },
];

const WHO: QuizItem[] = [
  {
    icon: "👑",
    name: r("król Szwecji, który w 1655 roku najechał Rzeczpospolitą", "король Швеции, вторгшийся в Речь Посполитую в 1655 году"),
    answer: "karol",
    explain: r("Karol X Gustaw chciał zdobyć całe wybrzeże Bałtyku i koronę polską, do której rościł sobie prawa.", "Карл X Густав хотел захватить всё побережье Балтики и польскую корону, на которую претендовал."),
  },
  {
    icon: "🗝️",
    name: r("skazany na banicję podkanclerzy, który namówił Szwedów do najazdu", "приговорённый к изгнанию подканцлер, уговоривший шведов напасть"),
    answer: "radziejowski",
    explain: r("Radziejowski, skłócony z królem, uciekł do Szwecji i przekonywał, że Polska podda się bez walki.", "Радзеёвский, поссорившись с королём, бежал в Швецию и уверял, что Польша сдастся без боя."),
  },
  {
    icon: "🏰",
    name: r("hetman litewski, który w Kiejdanach oddał Litwę Szwedom", "литовский гетман, отдавший в Кейданах Литву шведам"),
    answer: "radziwill",
    explain: r("Janusz Radziwiłł liczył, że pod rządami Szwecji Litwa zyska więcej niż w unii z Polską.", "Януш Радзивилл рассчитывал, что под властью Швеции Литва получит больше, чем в унии с Польшей."),
  },
  {
    icon: "⛪",
    name: r("przeor paulinów, który kierował obroną Jasnej Góry", "настоятель паулинов, руководивший обороной Ясной Горы"),
    answer: "kordecki",
    explain: r("Ksiądz Augustyn Kordecki przez sześć tygodni odmawiał poddania klasztoru, aż Szwedzi odstąpili.", "Отец Августин Кордецкий шесть недель отказывался сдать монастырь, пока шведы не отступили."),
  },
  {
    icon: "🐎",
    name: r("dowódca wojny szarpanej, zwycięzca spod Warki", "предводитель партизанской войны, победитель под Варкой"),
    answer: "czarniecki",
    explain: r("Stefan Czarniecki nękał Szwedów nagłymi napadami; o jego powrocie „przez morze” z Danii śpiewa hymn Polski.", "Стефан Чарнецкий изматывал шведов внезапными налётами; о его возвращении «через море» из Дании поёт гимн Польши."),
  },
  {
    icon: "🙏",
    name: r("król, który we Lwowie ogłosił Matkę Boską Królową Polski", "король, провозгласивший во Львове Богоматерь Королевой Польши"),
    answer: "jan-kazimierz",
    explain: r("Jan Kazimierz złożył śluby lwowskie 1 kwietnia 1656 roku, po powrocie ze Śląska.", "Ян Казимир принёс Львовские обеты 1 апреля 1656 года, вернувшись из Силезии."),
  },
  {
    icon: "⚔️",
    name: r("książę Siedmiogrodu, który w 1657 roku najechał Polskę jako sojusznik Szwedów", "князь Трансильвании, вторгшийся в Польшу в 1657 году как союзник шведов"),
    answer: "rakoczy",
    explain: r("Rakoczy liczył na część Polski obiecaną w Radnot; jego armia została rozbita i musiał prosić o pokój.", "Ракоци рассчитывал на часть Польши, обещанную в Радноте; его армия была разбита, и ему пришлось просить мира."),
  },
];

const STAGES: Txt[] = [r("kapitulacja pod Ujściem", "капитуляция под Уйсьце"), r("układ w Kiejdanach", "договор в Кейданах"), r("obrona Jasnej Góry", "оборона Ясной Горы"), r("śluby lwowskie", "Львовские обеты"), r("zwycięstwo pod Warką", "победа под Варкой"), r("traktaty welawsko-bydgoskie", "Велявско-Быдгощские трактаты"), r("pokój w Oliwie", "Оливский мир")];

const FACTS: Statement[] = [
  {
    text: r("Nazwa „potop” pochodzi od biblijnej powodzi, która zalała cały świat.", "Название «потоп» происходит от библейского наводнения, залившего весь мир."),
    truth: true,
    why: r("Szwedzi w kilka miesięcy zajęli prawie cały kraj — jak woda w czasie potopu.", "Шведы за несколько месяцев заняли почти всю страну — как вода во время потопа."),
  },
  {
    text: r("Obrona Jasnej Góry trwała sześć tygodni i zakończyła się odejściem Szwedów.", "Оборона Ясной Горы длилась шесть недель и закончилась уходом шведов."),
    truth: true,
    why: r("Od listopada do grudnia 1655 roku; po tym sukcesie w całym kraju wybuchły walki ze Szwedami.", "С ноября по декабрь 1655 года; после этого успеха по всей стране вспыхнула борьба со шведами."),
  },
  {
    text: r("W pokoju w Oliwie Rzeczpospolita straciła Prusy Królewskie i Gdańsk.", "По Оливскому миру Речь Посполитая потеряла Королевскую Пруссию и Гданьск."),
    truth: false,
    why: r("Granice nie zmieniły się; Jan Kazimierz zrzekł się tylko praw do tronu Szwecji.", "Границы не изменились; Ян Казимир лишь отказался от прав на шведский трон."),
  },
  {
    text: r("Traktaty welawsko-bydgoskie uniezależniły Prusy Książęce od Polski.", "Велявско-Быдгощские трактаты сделали Княжескую Пруссию независимой от Польши."),
    truth: true,
    why: r("Elektor brandenburski przeszedł na stronę Polski, a w zamian przestał być jej lennikiem — z czasem wyrosły z tego Prusy.", "Бранденбургский курфюрст перешёл на сторону Польши, а взамен перестал быть её вассалом — со временем из этого выросла Пруссия."),
  },
  {
    text: r("Traktat w Radnot był sojuszem Polski ze Szwecją przeciw Rosji.", "Раднотский договор был союзом Польши со Швецией против России."),
    truth: false,
    why: r("Był to plan rozbioru Rzeczypospolitej między Szwecję, Siedmiogród, Brandenburgię, Radziwiłła i Kozaków.", "Это был план раздела Речи Посполитой между Швецией, Трансильванией, Бранденбургом, Радзивиллом и казаками."),
  },
  {
    text: r("Potop przyniósł ogromne zniszczenia: Szwedzi wywieźli skarby i spalili setki miast.", "Потоп принёс огромные разрушения: шведы вывезли сокровища и сожгли сотни городов."),
    truth: true,
    why: r("Kraj stracił około jednej trzeciej ludności; wiele miast nigdy nie wróciło do dawnej świetności.", "Страна потеряла около трети населения; многие города так и не вернули прежнего величия."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("najazd Szwedów — początek potopu", "вторжение шведов — начало потопа"),
    when: "1655",
    note: r("Ujście, Kiejdany, obrona Jasnej Góry", "Уйсьце, Кейданы, оборона Ясной Горы"),
  },
  {
    name: r("śluby lwowskie Jana Kazimierza", "Львовские обеты Яна Казимира"),
    when: "1656",
    note: r("wiosną zwycięstwo Czarnieckiego pod Warką", "весной — победа Чарнецкого под Варкой"),
  },
  {
    name: r("traktaty welawsko-bydgoskie", "Велявско-Быдгощские трактаты"),
    when: "1657",
    note: r("Prusy Książęce niezależne; najazd Rakoczego", "Княжеская Пруссия независима; вторжение Ракоци"),
  },
  {
    name: r("wyprawa Czarnieckiego do Danii", "поход Чарнецкого в Данию"),
    when: "1658",
  },
  {
    name: r("pokój w Oliwie", "Оливский мир"),
    when: "1660",
    note: r("koniec potopu", "конец потопа"),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [r("Szwedzi weszli z Pomorza Szwedzkiego (na Wielkopolskę) i z Inflant (na Litwę).", "Шведы вошли из Шведской Померании (в Великую Польшу) и из Ливонии (в Литву)."), r("Kapitulacja pod Ujściem i układ w Kiejdanach (1655) — poddanie się bez walki. Obrona Jasnej Góry — przełom.", "Капитуляция под Уйсьце и договор в Кейданах (1655) — сдача без боя. Оборона Ясной Горы — перелом.")],
  s2: [r("Zdrajcy: Hieronim Radziejowski, Janusz Radziwiłł. Obrońcy: Augustyn Kordecki, Stefan Czarniecki, Jan Kazimierz.", "Изменники: Иероним Радзеёвский, Януш Радзивилл. Защитники: Августин Кордецкий, Стефан Чарнецкий, Ян Казимир."), r("Wojna szarpana — nagłe napady małych oddziałów zamiast wielkich bitew.", "Партизанская война — внезапные налёты малых отрядов вместо больших сражений.")],
  s3: [r("1655: Ujście, Kiejdany, Jasna Góra. 1656: śluby lwowskie, Warka. 1657: Welawa i Bydgoszcz, najazd Rakoczego. 1660: Oliwa.", "1655: Уйсьце, Кейданы, Ясная Гора. 1656: Львовские обеты, Варка. 1657: Велява и Быдгощ, вторжение Ракоци. 1660: Олива.")],
  s4: [r("Pokój w Oliwie (1660): granice bez zmian, Jan Kazimierz zrzeka się tronu Szwecji.", "Оливский мир (1660): границы без изменений, Ян Казимир отказывается от шведского трона."), r("Traktaty welawsko-bydgoskie (1657): Prusy Książęce przestają być lennem Polski.", "Велявско-Быдгощские трактаты (1657): Княжеская Пруссия перестаёт быть леном Польши.")],
};

export default function DelugeLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="deluge" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="deluge-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <DelugeMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="deluge-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="deluge-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} steps={STAGES} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="deluge-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="deluge-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
