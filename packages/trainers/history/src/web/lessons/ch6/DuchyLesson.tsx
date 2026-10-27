// Lesson for §34 "Księstwo Warszawskie" (Historia 6, GWO). Terms, people and dates follow the task
// bank of the same paragraph (templates/data/ch6.ts, DUCHY and DUCHY_DATES).
import {
  CompareTabs,
  LessonIntro,
  OrderGame,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  type CompareCard,
  type LessonProps,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { DuchyMap } from "./DuchyMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Gdy w 1806 roku Napoleon rozbił Prusy, Polacy chwycili za broń. Rok później na mocy pokoju w Tylży powstało Księstwo Warszawskie — małe państwo z własnym sejmem, armią i nowoczesnym prawem, ale całkowicie zależne od cesarza Francuzów. Przetrwało osiem lat.",
    "Когда в 1806 году Наполеон разгромил Пруссию, поляки взялись за оружие. Год спустя по Тильзитскому миру возникло Варшавское герцогство — небольшое государство с собственным сеймом, армией и современным правом, но полностью зависимое от императора французов. Оно просуществовало восемь лет.",
  ),
  s1: r("Jak powstało Księstwo", "Как возникло герцогство"),
  s1intro: r("Ułóż po kolei wydarzenia, które doprowadziły do powstania Księstwa Warszawskiego.", "Расставь по порядку события, которые привели к созданию Варшавского герцогства."),
  s2: r("Mapa Księstwa: 1807 i 1809", "Карта герцогства: 1807 и 1809"),
  s2intro: r(
    "Dotknij części mapy, żeby zobaczyć, skąd wzięły się ziemie Księstwa i kto je otaczał. Potem podpisz mapę sam.",
    "Нажми на часть карты, чтобы увидеть, откуда взялись земли герцогства и кто его окружал. Потом подпиши карту сам.",
  ),
  s3: r("Nowe państwo, nowe prawo", "Новое государство, новое право"),
  s3intro: r(
    "Porównaj dawną Rzeczpospolitą szlachecką z Księstwem Warszawskim: kto rządził, jakie było prawo, co zmieniło się dla chłopów.",
    "Сравни прежнюю шляхетскую Речь Посполитую с Варшавским герцогством: кто правил, каким было право, что изменилось для крестьян.",
  ),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Koniec Księstwa", "Конец герцогства"),
  s5intro: r("Prawda czy fałsz? Zdania dotyczą Księstwa, wojny 1809 roku i kongresu wiedeńskiego.", "Правда или ложь? Утверждения о герцогстве, войне 1809 года и Венском конгрессе."),
  order: r("Od Jeny do Księstwa", "От Йены до герцогства"),
  orderHint: r("Zacznij od klęski Prus.", "Начни с поражения Пруссии."),
  timeline: r("Księstwo Warszawskie rok po roku", "Варшавское герцогство год за годом"),
  tf: r("Księstwo Warszawskie", "Варшавское герцогство"),
} satisfies Record<string, Txt>;

const BIRTH: Txt[] = [
  r("Napoleon rozbija Prusy pod Jeną i Auerstedt (X 1806)", "Наполеон разбивает Пруссию при Йене и Ауэрштедте (X 1806)"),
  r("powstanie wielkopolskie: Dąbrowski i Wybicki wzywają do broni (XI 1806)", "Великопольское восстание: Домбровский и Выбицкий призывают к оружию (XI 1806)"),
  r("Napoleon wkracza do Warszawy, Polacy tworzą wojsko", "Наполеон вступает в Варшаву, поляки создают войско"),
  r("pokój w Tylży z carem i królem Prus (VII 1807)", "Тильзитский мир с царём и королём Пруссии (VII 1807)"),
  r("Napoleon nadaje w Dreźnie konstytucję (22 VII 1807)", "Наполеон дарует в Дрездене конституцию (22 VII 1807)"),
  r("Fryderyk August, król Saksonii, zostaje księciem warszawskim", "Фридрих Август, король Саксонии, становится варшавским князем"),
];

const ROWS = {
  ruler: r("władca", "правитель"),
  law: r("prawo", "право"),
  peasants: r("chłopi", "крестьяне"),
  sejm: r("sejm", "сейм"),
  army: r("wojsko", "войско"),
  freedom: r("niezależność", "независимость"),
};

const SYSTEMS: CompareCard[] = [
  {
    id: "rp",
    icon: "🦅",
    name: r("Rzeczpospolita szlachecka", "Шляхетская Речь Посполитая"),
    rows: [
      { label: ROWS.ruler, value: r("król wybierany przez szlachtę (wolna elekcja)", "король, избираемый шляхтой (свободная элекция)") },
      { label: ROWS.law, value: r("każdy stan miał inne prawa; rządziła szlachta", "у каждого сословия своё право; правила шляхта") },
      { label: ROWS.peasants, value: r("poddani pana, przywiązani do ziemi, pańszczyzna", "зависимые от помещика, прикреплены к земле, барщина") },
      { label: ROWS.sejm, value: r("sejm szlachecki, przez lata paraliżowany liberum veto", "шляхетский сейм, годами парализованный liberum veto") },
      { label: ROWS.army, value: r("nieliczne, zaniedbane", "малочисленное, запущенное") },
      { label: ROWS.freedom, value: r("państwo niepodległe, lecz słabe — padło w rozbiorach", "независимое, но слабое государство — пало в разделах") },
    ],
    text: r("Rzeczpospolita próbowała się naprawić Konstytucją 3 maja, ale zabrakło czasu: w 1795 roku zniknęła z mapy.", "Речь Посполитая пыталась исправиться Конституцией 3 мая, но времени не хватило: в 1795 году она исчезла с карты."),
  },
  {
    id: "kw",
    icon: "🇫🇷",
    name: r("Księstwo Warszawskie", "Варшавское герцогство"),
    rows: [
      { label: ROWS.ruler, value: r("dziedziczny książę Fryderyk August, król Saksonii", "наследственный князь Фридрих Август, король Саксонии") },
      { label: ROWS.law, value: r("Kodeks Napoleona (od 1808): wszyscy równi wobec prawa", "Кодекс Наполеона (с 1808): все равны перед законом") },
      { label: ROWS.peasants, value: r("wolni osobiście, ale bez ziemi — „kajdany zdjęto z butami”", "лично свободны, но без земли — «кандалы сняли вместе с сапогами»") },
      { label: ROWS.sejm, value: r("dwie izby: Senat i Izba Poselska; posłowie także z miast", "две палаты: Сенат и Посольская палата; депутаты и от городов") },
      { label: ROWS.army, value: r("silna armia pod wodzą ks. Józefa Poniatowskiego; w 1812 roku z Napoleonem poszło ok. 100 tys. polskich żołnierzy", "сильная армия под командованием кн. Юзефа Понятовского; в 1812 году с Наполеоном пошли около 100 тыс. польских солдат") },
      { label: ROWS.freedom, value: r("całkowicie zależne od Napoleona; nie wolno było nazwać go Polską", "полностью зависимое от Наполеона; его нельзя было называть Польшей") },
    ],
    text: r("Konstytucja z 22 lipca 1807 roku była wzorowana na francuskiej: nowoczesna, ale nadana z góry przez Napoleona, bez pytania Polaków o zdanie.", "Конституция от 22 июля 1807 года была построена по французскому образцу: современная, но дарованная сверху Наполеоном, без вопроса к полякам."),
  },
];

const EVENTS: TimelineEvent[] = [
  { name: r("powstanie wielkopolskie", "Великопольское восстание"), when: "1806" },
  { name: r("pokój w Tylży — powstaje Księstwo Warszawskie", "Тильзитский мир — возникает Варшавское герцогство"), when: "1807", note: r("22 lipca konstytucja nadana w Dreźnie", "22 июля конституция, дарованная в Дрездене") },
  { name: r("Kodeks Napoleona wchodzi w życie w Księstwie", "Кодекс Наполеона вступает в силу в герцогстве"), when: "1808" },
  { name: r("bitwa pod Raszynem", "битва под Рашином"), when: "19 IV 1809" },
  { name: r("pokój w Schönbrunn — Kraków w Księstwie", "Шёнбруннский мир — Краков в герцогстве"), when: "X 1809" },
  { name: r("wojska Księstwa idą z Napoleonem na Moskwę", "войска герцогства идут с Наполеоном на Москву"), when: "1812" },
  { name: r("Poniatowski ginie pod Lipskiem", "Понятовский гибнет под Лейпцигом"), when: "1813" },
  { name: r("kongres wiedeński dzieli Księstwo", "Венский конгресс делит герцогство"), when: "1815", note: r("Królestwo Polskie, Wielkie Księstwo Poznańskie, Rzeczpospolita Krakowska", "Царство Польское, Великое княжество Познанское, Краковская республика") },
];

const END: Statement[] = [
  { text: r("Księciem warszawskim był sam Napoleon.", "Варшавским князем был сам Наполеон."), truth: false, why: r("Księciem został Fryderyk August, król Saksonii. Napoleon tylko nadał konstytucję i trzymał Księstwo w zależności.", "Князем стал Фридрих Август, король Саксонии. Наполеон лишь даровал конституцию и держал герцогство в зависимости.") },
  { text: r("Chłopi w Księstwie dostali na własność ziemię, którą uprawiali.", "Крестьяне в герцогстве получили в собственность землю, которую обрабатывали."), truth: false, why: r("Dostali tylko wolność osobistą; ziemia została przy panu, który mógł chłopa usunąć. Stąd powiedzenie: „zdjęto chłopom kajdany z butami”.", "Они получили только личную свободу; земля осталась у помещика, который мог прогнать крестьянина. Отсюда поговорка: «сняли с крестьян кандалы вместе с сапогами».") },
  { text: r("Po wojnie 1809 roku Księstwo powiększyło się o Kraków i ziemie III zaboru austriackiego.", "После войны 1809 года герцогство расширилось за счёт Кракова и земель третьего австрийского раздела."), truth: true, why: r("Poniatowski zatrzymał Austriaków pod Raszynem, a potem zajął Galicję; pokój w Schönbrunn przyznał Księstwu nowe ziemie.", "Понятовский остановил австрийцев под Рашином, а затем занял Галицию; Шёнбруннский мир отдал герцогству новые земли.") },
  { text: r("Wyprawę na Moskwę w 1812 roku Napoleon nazwał „drugą wojną polską”.", "Поход на Москву в 1812 году Наполеон назвал «второй польской войной»."), truth: true, why: r("Chciał zdobyć poparcie Polaków; z Wielką Armią poszło około 100 tysięcy polskich żołnierzy, wróciło niewielu.", "Он хотел заручиться поддержкой поляков; с Великой армией пошли около 100 тысяч польских солдат, вернулись немногие.") },
  { text: r("Książę Józef Poniatowski zginął pod Lipskiem w 1813 roku, osłaniając odwrót Francuzów.", "Князь Юзеф Понятовский погиб под Лейпцигом в 1813 году, прикрывая отступление французов."), truth: true, why: r("Świeżo mianowany marszałek Francji, ranny, utonął w rzece Elsterze.", "Только что назначенный маршалом Франции, раненый, он утонул в реке Эльстер.") },
  { text: r("Kongres wiedeński przywrócił Księstwo Warszawskie w dawnych granicach.", "Венский конгресс восстановил Варшавское герцогство в прежних границах."), truth: false, why: r("W 1815 roku Księstwo podzielono: Królestwo Polskie pod berłem cara, Wielkie Księstwo Poznańskie w Prusach i Rzeczpospolita Krakowska pod nadzorem trzech zaborców.", "В 1815 году герцогство разделили: Царство Польское под скипетром царя, Великое княжество Познанское в Пруссии и Краковская республика под надзором трёх держав.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("1806: Jena → powstanie wielkopolskie. 1807: pokój w Tylży → Księstwo Warszawskie z ziem II i III zaboru pruskiego.", "1806: Йена → Великопольское восстание. 1807: Тильзитский мир → Варшавское герцогство из земель второго и третьего прусских разделов."),
    r("Konstytucję nadał Napoleon w Dreźnie 22 VII 1807; księciem został Fryderyk August, król Saksonii.", "Конституцию даровал Наполеон в Дрездене 22 VII 1807; князем стал Фридрих Август, король Саксонии."),
  ],
  s2: [
    r("1807: Warszawa, Poznań, Kalisz, Bydgoszcz, Płock, Łomża. 1809: Kraków, Lublin, Radom, Siedlce (po wojnie z Austrią).", "1807: Варшава, Познань, Калиш, Быдгощ, Плоцк, Ломжа. 1809: Краков, Люблин, Радом, Седльце (после войны с Австрией)."),
    r("Gdańsk został wolnym miastem; Lwów i wschodnia Galicja pozostały przy Austrii.", "Гданьск стал вольным городом; Львов и восточная Галиция остались у Австрии."),
  ],
  s3: [
    r("Kodeks Napoleona (1808): równość wobec prawa, ochrona własności, śluby cywilne.", "Кодекс Наполеона (1808): равенство перед законом, защита собственности, гражданский брак."),
    r("Chłopi wolni osobiście, ale bez ziemi; sejm dwuizbowy; armia pod wodzą ks. Józefa Poniatowskiego.", "Крестьяне лично свободны, но без земли; двухпалатный сейм; армия под командованием кн. Юзефа Понятовского."),
  ],
  s5: [
    r("Raszyn 19 IV 1809 → Kraków w Księstwie. 1812 — „druga wojna polska”. 1813 — śmierć Poniatowskiego pod Lipskiem.", "Рашин 19 IV 1809 → Краков в герцогстве. 1812 — «вторая польская война». 1813 — гибель Понятовского под Лейпцигом."),
    r("Kongres wiedeński 1815: Królestwo Polskie (car królem), Wielkie Księstwo Poznańskie (Prusy), Rzeczpospolita Krakowska.", "Венский конгресс 1815: Царство Польское (царь — король), Великое княжество Познанское (Пруссия), Краковская республика."),
  ],
};

export default function DuchyLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="duchy" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="duchy-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} steps={BIRTH} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="duchy-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <DuchyMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="duchy-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={SYSTEMS} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="duchy-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="duchy-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={END} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
