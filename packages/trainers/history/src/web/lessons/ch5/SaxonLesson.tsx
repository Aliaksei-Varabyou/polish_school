// Lesson for §26 "Czasy saskie" (Historia 6, GWO). Names and dates follow the task bank of the same
// paragraph (templates/data/ch5.ts, SAXON and SAXON_DATES).
import {
  CompareTabs,
  LessonIntro,
  OrderGame,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type CompareCard,
  type LessonProps,
  type SortItem,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "W 1697 roku królem Polski został elektor saski August II. Przez następne 66 lat Rzecząpospolitą rządzili dwaj Sasi, a obce wojska — szwedzkie, saskie i rosyjskie — czuły się w niej jak u siebie. Państwo słabło, sejmy zrywano, a szlachta powtarzała: „za króla Sasa jedz, pij i popuszczaj pasa”.",
    "В 1697 году королём Польши стал саксонский курфюрст Август II. Следующие 66 лет Речью Посполитой правили два саксонца, а чужие войска — шведские, саксонские и русские — чувствовали себя в ней как дома. Государство слабело, сеймы срывались, а шляхта повторяла: «при короле-саксонце ешь, пей и пояс распускай».",
  ),
  s1: r("Dwaj Sasi i jeden Polak", "Два саксонца и один поляк"),
  s1intro: r("Trzech ludzi walczyło o polską koronę. Porównaj ich losy w zakładkach.", "Три человека боролись за польскую корону. Сравни их судьбы на вкладках."),
  s2: r("Od elekcji do sejmu niemego", "От элекции до Немого сейма"),
  s2intro: r("Ułóż po kolei, jak wojna północna doprowadziła Rzeczpospolitą pod kuratelę Rosji.", "Расставь по порядку, как Северная война привела Речь Посполитую под опеку России."),
  s3: r("Słabość i próby naprawy", "Слабость и попытки исправления"),
  s3intro: r("Jedne rzeczy osłabiały państwo, inne były próbą jego ratowania. Rozdziel je.", "Одно ослабляло государство, другое было попыткой его спасти. Раздели их."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia czasów saskich od najwcześniejszego.", "Расставь события саксонских времён от самого раннего."),
  s5: r("Prawda czy fałsz?", "Правда или ложь?"),
  s5intro: r("Sprawdź, czy dobrze rozumiesz, co działo się za Sasów.", "Проверь, правильно ли ты понимаешь, что происходило при саксонцах."),
  order: r("Droga do sejmu niemego", "Путь к Немому сейму"),
  orderHint: r("Zacznij od elekcji Augusta II.", "Начни с избрания Августа II."),
  sort: r("Choroba czy lekarstwo?", "Болезнь или лекарство?"),
  sortHint: r("Co osłabiało Rzeczpospolitą, a co miało ją naprawić?", "Что ослабляло Речь Посполитую, а что должно было её исправить?"),
  weak: r("osłabiało państwo", "ослабляло государство"),
  fix: r("próba naprawy", "попытка исправить"),
  timeline: r("Czasy saskie rok po roku", "Саксонские времена год за годом"),
  tf: r("Czasy saskie", "Саксонские времена"),
  reign: r("Panowanie", "Правление"),
  throne: r("Jak zdobył tron", "Как получил трон"),
  known: r("Z czego znany", "Чем известен"),
  end: r("Jak skończył", "Чем кончил"),
} satisfies Record<string, Txt>;

const KINGS: CompareCard[] = [
  {
    id: "august2",
    icon: "💪",
    name: r("August II Mocny", "Август II Сильный"),
    rows: [
      { label: T.reign, value: r("1697–1733 (z przerwą 1704–1709)", "1697–1733 (с перерывом 1704–1709)") },
      { label: T.throne, value: r("elektor Saksonii, przyjął katolicyzm i przekupił część szlachty", "курфюрст Саксонии, принял католичество и подкупил часть шляхты") },
      { label: T.known, value: r("niezwykła siła fizyczna; wciągnął Polskę w wojnę północną ze Szwecją", "необычайная физическая сила; втянул Польшу в Северную войну со Швецией") },
      { label: T.end, value: r("rządził do śmierci, ale po sejmie niemym 1717 roku pod okiem Rosji", "правил до смерти, но после Немого сейма 1717 года под присмотром России") },
    ],
    text: r("Marzył o silnej władzy dziedzicznej jak w Saksonii, a zostawił państwo zależne od cara.", "Мечтал о сильной наследственной власти, как в Саксонии, а оставил государство, зависимое от царя."),
  },
  {
    id: "leszczynski",
    icon: "🎭",
    name: r("Stanisław Leszczyński", "Станислав Лещинский"),
    rows: [
      { label: T.reign, value: r("1704–1709 i krótko w 1733", "1704–1709 и недолго в 1733"), },
      { label: T.throne, value: r("za pierwszym razem osadził go Karol XII, za drugim wybrała go szlachta", "в первый раз его посадил Карл XII, во второй — избрала шляхта") },
      { label: T.known, value: r("jedyny Polak na tronie w XVIII wieku; teść króla Francji Ludwika XV", "единственный поляк на троне в XVIII веке; тесть короля Франции Людовика XV") },
      { label: T.end, value: r("dwa razy wygnany; dożył lat jako książę Lotaryngii", "дважды изгнан; дожил свой век герцогом Лотарингии") },
    ],
    text: r("Wojska rosyjskie wyparły go z Polski w wojnie o sukcesję polską (1733–1735).", "Русские войска вытеснили его из Польши в войне за польское наследство (1733–1735)."),
  },
  {
    id: "august3",
    icon: "🍖",
    name: r("August III", "Август III"),
    rows: [
      { label: T.reign, value: r("1733–1763", "1733–1763") },
      { label: T.throne, value: r("narzucony przez wojska rosyjskie i austriackie wbrew wyborowi szlachty", "навязан русскими и австрийскими войсками вопреки выбору шляхты") },
      { label: T.known, value: r("mieszkał w Dreźnie; z 14 sejmów za jego rządów doszedł do skutku tylko jeden", "жил в Дрездене; из 14 сеймов при его правлении состоялся только один") },
      { label: T.end, value: r("zmarł w Dreźnie; po nim wybrano Stanisława Augusta Poniatowskiego", "умер в Дрездене; после него избрали Станислава Августа Понятовского") },
    ],
    text: r("To o jego czasach mówiono: „za króla Sasa jedz, pij i popuszczaj pasa”.", "Именно о его временах говорили: «при короле-саксонце ешь, пей и пояс распускай»."),
  },
];

const STEPS: Txt[] = [
  r("1697 — elekcja Augusta II", "1697 — избрание Августа II"),
  r("1700 — August II zaczyna wojnę ze Szwecją", "1700 — Август II начинает войну со Швецией"),
  r("Karol XII wkracza do Polski i detronizuje Augusta", "Карл XII входит в Польшу и низлагает Августа"),
  r("1704 — Leszczyński królem z łaski Szwedów", "1704 — Лещинский король милостью шведов"),
  r("1709 — Piotr I bije Szwedów pod Połtawą, August wraca", "1709 — Пётр I бьёт шведов под Полтавой, Август возвращается"),
  r("1715 — konfederacja tarnogrodzka przeciw wojskom saskim", "1715 — Тарногродская конфедерация против саксонских войск"),
  r("1717 — sejm niemy pod okiem wojsk rosyjskich", "1717 — Немой сейм под присмотром русских войск"),
];

const SORT: SortItem[] = [
  { name: r("liberum veto i zrywanie sejmów", "либерум вето и срыв сеймов"), group: 0, why: r("jeden poseł mógł unieważnić pracę całego sejmu", "один депутат мог отменить работу всего сейма") },
  { name: r("armia ograniczona do 24 tysięcy", "армия, сокращённая до 24 тысяч"), group: 0, why: r("sąsiedzi mieli po 100–200 tysięcy żołnierzy", "у соседей было по 100–200 тысяч солдат") },
  { name: r("obce wojska na ziemiach polskich", "чужие войска на польских землях"), group: 0, why: r("Szwedzi, Sasi i Rosjanie rabowali kraj i dyktowali warunki", "шведы, саксонцы и русские грабили страну и диктовали условия") },
  { name: r("magnaci opłacani przez obce dwory", "магнаты на содержании чужих дворов"), group: 0, why: r("za pieniądze Rosji czy Prus zrywali sejmy i blokowali reformy", "за деньги России или Пруссии срывали сеймы и блокировали реформы") },
  { name: r("Collegium Nobilium Konarskiego", "Коллегиум Нобилиум Конарского"), group: 1, why: r("nowoczesna szkoła uczyła przyszłych posłów myśleć o państwie", "современная школа учила будущих депутатов думать о государстве") },
  { name: r("„O skutecznym rad sposobie”", "«О действенном способе совещаний»"), group: 1, why: r("Konarski dowodził w tym dziele, że liberum veto trzeba znieść", "Конарский доказывал в этом труде, что либерум вето нужно отменить") },
  { name: r("Biblioteka Załuskich", "библиотека Залуских"), group: 1, why: r("publiczna biblioteka szerzyła wiedzę i idee oświecenia", "публичная библиотека распространяла знания и идеи Просвещения") },
  { name: r("program Familii Czartoryskich", "программа Фамилии Чарторыйских"), group: 1, why: r("stronnictwo chciało wzmocnić władzę króla i powiększyć armię", "партия хотела усилить власть короля и увеличить армию") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("elekcja Augusta II Mocnego", "избрание Августа II Сильного"), when: "1697", note: r("początek unii personalnej z Saksonią", "начало личной унии с Саксонией") },
  { name: r("początek wojny północnej", "начало Северной войны"), when: "1700" },
  { name: r("konfederacja tarnogrodzka", "Тарногродская конфедерация"), when: "1715", note: r("szlachta przeciw wojskom saskim", "шляхта против саксонских войск") },
  { name: r("sejm niemy", "Немой сейм"), when: "1717", note: r("Rosja gwarantem ustroju, armia 24 tys.", "Россия — гарант строя, армия 24 тыс.") },
  { name: r("elekcja Augusta III, wojna o sukcesję polską", "избрание Августа III, война за польское наследство"), when: "1733" },
  { name: r("otwarcie Collegium Nobilium", "открытие Коллегиум Нобилиум"), when: "1740" },
  { name: r("otwarcie Biblioteki Załuskich", "открытие библиотеки Залуских"), when: "1747" },
];

const TF: Statement[] = [
  { text: r("Unia z Saksonią była unią realną ze wspólnym sejmem i wojskiem.", "Уния с Саксонией была реальной унией с общим сеймом и войском."), truth: false, why: r("To była unia personalna: tylko wspólny władca. Każde państwo miało własne urzędy, prawa i armię.", "Это была личная уния: только общий правитель. У каждого государства были свои учреждения, законы и армия.") },
  { text: r("Sejm niemy nazwano tak, bo nikt na nim nie przemawiał.", "Немой сейм назвали так, потому что на нём никто не выступал."), truth: true, why: r("Posłowie przyjęli gotowe ustawy bez dyskusji, by nikt nie zerwał obrad. Sala była otoczona wojskiem rosyjskim.", "Депутаты приняли готовые законы без обсуждения, чтобы никто не сорвал заседание. Зал окружали русские войска.") },
  { text: r("Za Augusta III niemal wszystkie sejmy zostały zerwane przez liberum veto.", "При Августе III почти все сеймы были сорваны с помощью либерум вето."), truth: true, why: r("Z 14 sejmów uchwały podjął tylko jeden (1736). Państwo nie mogło uchwalić podatków ani powiększyć armii.", "Из 14 сеймов решения принял только один (1736). Государство не могло ввести налоги или увеличить армию.") },
  { text: r("Karol XII był sojusznikiem Augusta II w wojnie północnej.", "Карл XII был союзником Августа II в Северной войне."), truth: false, why: r("Przeciwnie: król Szwecji był jego wrogiem. Najechał Polskę, zdetronizował Augusta i osadził na tronie Leszczyńskiego.", "Наоборот: король Швеции был его врагом. Он вторгся в Польшу, низложил Августа и посадил на трон Лещинского.") },
  { text: r("Stanisław Konarski założył Collegium Nobilium, żeby lepiej kształcić synów szlachty.", "Станислав Конарский основал Коллегиум Нобилиум, чтобы лучше учить сыновей шляхты."), truth: true, why: r("Szkoła pijarów (1740) uczyła nowożytnych języków, nauk ścisłych i troski o dobro państwa.", "Школа пиаристов (1740) учила новым языкам, точным наукам и заботе о благе государства.") },
  { text: r("Czasy saskie to okres rozkwitu nauki i szkolnictwa w Polsce.", "Саксонские времена — это период расцвета науки и школы в Польше."), truth: false, why: r("Przeciwnie: oświata podupadła, a szkoły uczyły głównie łaciny i retoryki. Dopiero Konarski i Załuscy zaczęli to zmieniać.", "Наоборот: образование пришло в упадок, школы учили в основном латыни и риторике. Только Конарский и Залуские начали это менять.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("August II Mocny (1697–1733) i August III (1733–1763) — dwaj Sasi z dynastii Wettynów; między nimi Stanisław Leszczyński.", "Август II Сильный (1697–1733) и Август III (1733–1763) — два саксонца из династии Веттинов; между ними Станислав Лещинский."),
    r("Unia personalna: wspólny tylko władca, osobne urzędy, prawa i wojsko.", "Личная уния: общий только правитель, отдельные учреждения, законы и войско."),
  ],
  s2: [
    r("Wojna północna 1700–1721: Rosja, Dania i Saksonia przeciw Szwecji; Karol XII pustoszył Polskę.", "Северная война 1700–1721: Россия, Дания и Саксония против Швеции; Карл XII опустошал Польшу."),
    r("Sejm niemy 1717: armia 24 tys., Rosja gwarantem ustroju Rzeczypospolitej.", "Немой сейм 1717: армия 24 тыс., Россия — гарант строя Речи Посполитой."),
  ],
  s3: [
    r("Słabość: liberum veto, zrywane sejmy, mała armia, przekupni magnaci.", "Слабость: либерум вето, срываемые сеймы, малая армия, продажные магнаты."),
    r("Naprawa: Konarski (Collegium Nobilium 1740, „O skutecznym rad sposobie”), Biblioteka Załuskich 1747, Familia Czartoryskich.", "Исправление: Конарский (Коллегиум Нобилиум 1740, «О действенном способе совещаний»), библиотека Залуских 1747, Фамилия Чарторыйских."),
  ],
  s5: [
    r("„Za króla Sasa jedz, pij i popuszczaj pasa” — szlachta ucztowała, a państwo słabło.", "«При короле-саксонце ешь, пей и пояс распускай» — шляхта пировала, а государство слабело."),
  ],
};

export default function SaxonLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="saxon" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="saxon-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={KINGS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="saxon-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} steps={STEPS} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="saxon-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.weak, T.fix]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="saxon-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="saxon-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={TF} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
