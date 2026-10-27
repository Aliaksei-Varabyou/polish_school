// Lesson for §20 "Monarchia parlamentarna w Anglii" (Historia 6, GWO). Terms, people and dates
// follow the task bank of the same paragraph (templates/data/ch4.ts, ENGLAND and ENGLAND_DATES).
import {
  CompareTabs,
  LessonIntro,
  MatchQuiz,
  OrderGame,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  type CompareCard,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Gdy Ludwik XIV budował absolutyzm, w Anglii działo się coś odwrotnego. Królowie z dynastii Stuartów też chcieli rządzić sami, ale trafili na opór parlamentu. Spór skończył się wojną domową, ścięciem króla, a w końcu — ustrojem, w którym król panuje, ale nie rządzi.",
    "Пока Людовик XIV строил абсолютизм, в Англии происходило обратное. Короли из династии Стюартов тоже хотели править сами, но натолкнулись на сопротивление парламента. Спор закончился гражданской войной, казнью короля и в конце концов — строем, при котором король царствует, но не правит.",
  ),
  s1: r("Król kontra parlament", "Король против парламента"),
  s1intro: r(
    "Od sporu o podatki do Bill of Rights minęło pół wieku. Ułóż wydarzenia po kolei.",
    "От спора о налогах до Билля о правах прошло полвека. Расставь события по порядку.",
  ),
  s2: r("Dwa ustroje", "Два строя"),
  s2intro: r(
    "Francja Ludwika XIV i Anglia po 1689 roku. Porównaj, kto o czym decyduje.",
    "Франция Людовика XIV и Англия после 1689 года. Сравни, кто и что решает.",
  ),
  s3: r("Kto to był?", "Кто это был?"),
  s3intro: r("Królowie, którzy przegrali, i wódz, który wygrał. Dopasuj opis do postaci.", "Короли, которые проиграли, и полководец, который победил. Подбери описание к личности."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Prawda czy fałsz?", "Правда или ложь?"),
  s5intro: r("Każde zdanie dotyczy angielskiego parlamentu i jego walki z królem.", "Каждое утверждение — об английском парламенте и его борьбе с королём."),
  order: r("Droga do monarchii parlamentarnej", "Путь к парламентской монархии"),
  orderHint: r("Zacznij od tego, co zrobił Karol I.", "Начни с того, что сделал Карл I."),
  who: r("Postacie Anglii XVII wieku", "Личности Англии XVII века"),
  whoQ: r("Kto to był:", "Кто это:"),
  whoWrong: r("to inna postać. Spróbuj jeszcze raz.", "это другой человек. Попробуй ещё раз."),
  timeline: r("Anglia w XVII wieku", "Англия в XVII веке"),
  tf: r("Parlament i król", "Парламент и король"),
} satisfies Record<string, Txt>;

const ORDER: Txt[] = [
  r("Karol I rządzi 11 lat bez parlamentu", "Карл I правит 11 лет без парламента"),
  r("wybucha wojna domowa", "начинается гражданская война"),
  r("armia parlamentu pod wodzą Cromwella wygrywa", "армия парламента под командованием Кромвеля побеждает"),
  r("ścięcie Karola I i ogłoszenie republiki", "казнь Карла I и провозглашение республики"),
  r("Cromwell rządzi jako lord protektor", "Кромвель правит как лорд-протектор"),
  r("restauracja Stuartów — Karol II na tronie", "реставрация Стюартов — Карл II на троне"),
  r("chwalebna rewolucja — ucieczka Jakuba II", "Славная революция — бегство Якова II"),
  r("Wilhelm III Orański podpisuje Bill of Rights", "Вильгельм III Оранский подписывает Билль о правах"),
];

const SYSTEMS: CompareCard[] = [
  {
    id: "abs",
    icon: "☀️",
    name: r("Absolutyzm (Francja)", "Абсолютизм (Франция)"),
    rows: [
      { label: r("Kto stanowi prawa", "Кто издаёт законы"), value: r("król — jego wola jest prawem", "король — его воля есть закон") },
      { label: r("Kto nakłada podatki", "Кто вводит налоги"), value: r("król, bez pytania kogokolwiek o zgodę", "король, ни у кого не спрашивая согласия") },
      { label: r("Armia", "Армия"), value: r("stała, posłuszna tylko królowi", "постоянная, подчинённая только королю") },
      { label: r("Sądy", "Суды"), value: r("w imieniu króla; król jest najwyższym sędzią", "от имени короля; король — высший судья") },
      { label: r("Rola parlamentu", "Роль парламента"), value: r("Stany Generalne nie zbierały się od 1614 roku", "Генеральные штаты не собирались с 1614 года") },
      { label: r("Hasło", "Лозунг"), value: r("„Państwo to ja”", "«Государство — это я»") },
    ],
    text: r("Ludwik XIV decydował o wszystkim sam. Jedynym ograniczeniem były obyczaj i religia — nie prawo.", "Людовик XIV решал всё сам. Единственным ограничением были обычай и религия — не закон."),
  },
  {
    id: "parl",
    icon: "🏛️",
    name: r("Monarchia parlamentarna (Anglia)", "Парламентская монархия (Англия)"),
    rows: [
      { label: r("Kto stanowi prawa", "Кто издаёт законы"), value: r("parlament: Izba Lordów i Izba Gmin", "парламент: Палата лордов и Палата общин") },
      { label: r("Kto nakłada podatki", "Кто вводит налоги"), value: r("tylko parlament — król nie może sam", "только парламент — король не может сам") },
      { label: r("Armia", "Армия"), value: r("tylko za zgodą parlamentu", "только с согласия парламента") },
      { label: r("Sądy", "Суды"), value: r("niezależne; król nie może zawieszać praw", "независимые; король не может отменять законы") },
      { label: r("Rola parlamentu", "Роль парламента"), value: r("zbiera się regularnie, kontroluje rząd", "собирается регулярно, контролирует правительство") },
      { label: r("Hasło", "Лозунг"), value: r("„Król panuje, ale nie rządzi”", "«Король царствует, но не правит»") },
    ],
    text: r("Po 1689 roku król Anglii musiał rządzić razem z parlamentem. Z czasem rządy przejął gabinet ministrów z premierem na czele.", "После 1689 года король Англии должен был править вместе с парламентом. Со временем управление перешло к кабинету министров во главе с премьером."),
  },
];

const WHO_OPTIONS: QuizOption[] = [
  { id: "karol1", label: r("Karol I", "Карл I") },
  { id: "cromwell", label: r("Oliver Cromwell", "Оливер Кромвель") },
  { id: "karol2", label: r("Karol II", "Карл II") },
  { id: "jakub2", label: r("Jakub II", "Яков II") },
  { id: "wilhelm", label: r("Wilhelm III Orański", "Вильгельм III Оранский") },
];

const WHO: QuizItem[] = [
  { icon: "🪓", name: r("król, którego parlament skazał na śmierć i ścięto w 1649 roku", "король, которого парламент приговорил к смерти и казнил в 1649 году"), answer: "karol1", explain: r("Karol I Stuart przegrał wojnę domową z parlamentem.", "Карл I Стюарт проиграл гражданскую войну парламенту.") },
  { icon: "⚔️", name: r("dowódca armii parlamentu, potem lord protektor", "командующий армией парламента, затем лорд-протектор"), answer: "cromwell", explain: r("Oliver Cromwell pokonał króla, a od 1653 roku sam rządził Anglią jak dyktator.", "Оливер Кромвель победил короля, а с 1653 года сам правил Англией как диктатор.") },
  { icon: "👑", name: r("syn ściętego króla, wezwany na tron w 1660 roku", "сын казнённого короля, призванный на трон в 1660 году"), answer: "karol2", explain: r("Powrót Karola II to restauracja Stuartów.", "Возвращение Карла II — это реставрация Стюартов.") },
  { icon: "🏃", name: r("katolicki król, który uciekł z kraju podczas chwalebnej rewolucji", "король-католик, бежавший из страны во время Славной революции"), answer: "jakub2", explain: r("Jakub II stracił tron w 1688 roku bez jednej bitwy — dlatego rewolucję nazwano chwalebną.", "Яков II лишился трона в 1688 году без единого сражения — поэтому революцию назвали Славной.") },
  { icon: "📜", name: r("namiestnik Niderlandów, który został królem Anglii i przyjął Bill of Rights", "правитель Нидерландов, ставший королём Англии и принявший Билль о правах"), answer: "wilhelm", explain: r("Wilhelm III Orański zgodził się w 1689 roku na ograniczenie władzy króla.", "Вильгельм III Оранский в 1689 году согласился на ограничение власти короля.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("wybuch wojny domowej", "начало гражданской войны"), when: "1642" },
  { name: r("ścięcie Karola I, Anglia republiką", "казнь Карла I, Англия — республика"), when: "1649" },
  { name: r("Cromwell lordem protektorem", "Кромвель — лорд-протектор"), when: "1653" },
  { name: r("restauracja Stuartów", "реставрация Стюартов"), when: "1660", note: r("Karol II wraca na tron", "Карл II возвращается на трон") },
  { name: r("chwalebna rewolucja", "Славная революция"), when: "1688" },
  { name: r("Bill of Rights", "Билль о правах"), when: "1689", note: r("początek monarchii parlamentarnej", "начало парламентской монархии") },
];

const FACTS: Statement[] = [
  { text: r("W Izbie Gmin zasiadali arystokraci i biskupi.", "В Палате общин заседали аристократы и епископы."), truth: false, why: r("Arystokraci i biskupi tworzyli Izbę Lordów. Do Izby Gmin wybierano przedstawicieli szlachty i miast.", "Аристократы и епископы составляли Палату лордов. В Палату общин избирали представителей дворянства и городов.") },
  { text: r("Karol I został skazany na śmierć przez parlament.", "Карл I был приговорён к смерти парламентом."), truth: true, why: r("Po raz pierwszy w Europie poddani osądzili i ścięli swojego króla (1649).", "Впервые в Европе подданные судили и казнили своего короля (1649).") },
  { text: r("Po śmierci Cromwella Anglia na zawsze pozostała republiką.", "После смерти Кромвеля Англия навсегда осталась республикой."), truth: false, why: r("W 1660 roku parlament wezwał na tron Karola II — to restauracja Stuartów.", "В 1660 году парламент призвал на трон Карла II — это реставрация Стюартов.") },
  { text: r("Chwalebną rewolucję nazwano tak, bo obyła się prawie bez rozlewu krwi.", "Славную революцию назвали так потому, что она обошлась почти без кровопролития."), truth: true, why: r("Jakub II uciekł do Francji, a parlament oddał koronę Wilhelmowi Orańskiemu.", "Яков II бежал во Францию, а парламент отдал корону Вильгельму Оранскому.") },
  { text: r("Bill of Rights pozwalał królowi nakładać podatki bez zgody parlamentu.", "Билль о правах позволял королю вводить налоги без согласия парламента."), truth: false, why: r("Przeciwnie: bez parlamentu król nie mógł nakładać podatków, zawieszać praw ani utrzymywać armii.", "Наоборот: без парламента король не мог вводить налоги, отменять законы и содержать армию.") },
  { text: r("„Król panuje, ale nie rządzi” — to zasada monarchii parlamentarnej.", "«Король царствует, но не правит» — это принцип парламентской монархии."), truth: true, why: r("Faktyczną władzę sprawuje rząd odpowiedzialny przed parlamentem.", "Реальную власть осуществляет правительство, ответственное перед парламентом.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Wojna domowa 1642–1649 → ścięcie Karola I → republika Cromwella → restauracja 1660 → chwalebna rewolucja 1688.", "Гражданская война 1642–1649 → казнь Карла I → республика Кромвеля → реставрация 1660 → Славная революция 1688."),
    r("Bill of Rights (1689) zamyka spór: król nie może rządzić bez parlamentu.", "Билль о правах (1689) завершает спор: король не может править без парламента."),
  ],
  s2: [
    r("Absolutyzm: cała władza u króla. Monarchia parlamentarna: prawa i podatki uchwala parlament.", "Абсолютизм: вся власть у короля. Парламентская монархия: законы и налоги принимает парламент."),
    r("Parlament angielski = Izba Lordów (arystokracja, biskupi) + Izba Gmin (wybierana).", "Английский парламент = Палата лордов (аристократия, епископы) + Палата общин (выборная)."),
  ],
  s3: [
    r("Karol I — ścięty 1649. Cromwell — lord protektor. Jakub II — obalony 1688. Wilhelm III — Bill of Rights 1689.", "Карл I — казнён в 1649. Кромвель — лорд-протектор. Яков II — свергнут в 1688. Вильгельм III — Билль о правах 1689."),
  ],
  s5: [
    r("Bill of Rights: bez zgody parlamentu król nie może zawieszać praw, nakładać podatków ani utrzymywać armii.", "Билль о правах: без согласия парламента король не может отменять законы, вводить налоги и содержать армию."),
    r("Z czasem rządzi gabinet ministrów z premierem — odpowiedzialny przed parlamentem.", "Со временем правит кабинет министров во главе с премьером — ответственный перед парламентом."),
  ],
};

export default function EnglandLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="england" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="england-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} steps={ORDER} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="england-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={SYSTEMS} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="england-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.who} question={T.whoQ} options={WHO_OPTIONS} items={WHO} wrongHint={T.whoWrong} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="england-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="england-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
