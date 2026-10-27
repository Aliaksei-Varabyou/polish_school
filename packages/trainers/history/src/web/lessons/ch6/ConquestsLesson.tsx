// Lesson for §32 "Podboje Napoleona" (Historia 6, GWO). Terms, people and dates follow the task
// bank of the same paragraph (templates/data/ch6.ts, CONQUESTS and CONQUESTS_DATES).
import {
  LessonIntro,
  MatchQuiz,
  OrderGame,
  Remember,
  Section,
  Timeline,
  TrueFalse,
  type LessonProps,
  type QuizItem,
  type QuizOption,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { NapoleonMap } from "./NapoleonMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Rewolucja francuska wyniosła na szczyt młodego generała z Korsyki. Napoleon Bonaparte w kilkanaście lat podbił niemal całą Europę, został cesarzem i dał Francji nowe prawo. Jego upadek zaczął się w śniegach Rosji, a skończył pod Waterloo.",
    "Французская революция вознесла на вершину молодого генерала с Корсики. Наполеон Бонапарт за полтора десятилетия покорил почти всю Европу, стал императором и дал Франции новые законы. Его падение началось в снегах России, а закончилось при Ватерлоо.",
  ),
  s1: r("Od Korsyki do tronu", "От Корсики до трона"),
  s1intro: r("Ułóż po kolei etapy drogi Napoleona do władzy.", "Расставь по порядку этапы пути Наполеона к власти."),
  s2: r("Europa u stóp Napoleona", "Европа у ног Наполеона"),
  s2intro: r(
    "Dotknij państwa na mapie, żeby dowiedzieć się, jak trafiło pod władzę Napoleona — albo dlaczego nie. Potem w trybie „Podpisz sam” sprawdź, czy pamiętasz, co gdzie leży.",
    "Нажми на государство на карте, чтобы узнать, как оно попало под власть Наполеона — или почему нет. Потом в режиме «Подпиши сам» проверь, помнишь ли ты, что где находится.",
  ),
  s3: r("Wielkie bitwy", "Великие битвы"),
  s3intro: r("Sześć bitew, które zdecydowały o losie Europy. Dopasuj opis do nazwy.", "Шесть сражений, решивших судьбу Европы. Подбери описание к названию."),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Upadek i kongres wiedeński", "Падение и Венский конгресс"),
  s5intro: r("Prawda czy fałsz? Zdania dotyczą końca Napoleona i nowego porządku Europy.", "Правда или ложь? Утверждения о конце Наполеона и новом порядке Европы."),
  order: r("Droga Napoleona do władzy", "Путь Наполеона к власти"),
  orderHint: r("Zacznij od młodego oficera z Korsyki.", "Начни с молодого офицера с Корсики."),
  orderStart: r("Korsyka: Napoleon Bonaparte, oficer artylerii", "Корсика: Наполеон Бонапарт, офицер артиллерии"),
  battles: r("Bitwy Napoleona", "Битвы Наполеона"),
  battlesQ: r("Która to bitwa:", "Какая это битва:"),
  battlesWrong: r("to inna bitwa. Spróbuj jeszcze raz.", "это другое сражение. Попробуй ещё раз."),
  timeline: r("Epoka napoleońska rok po roku", "Наполеоновская эпоха год за годом"),
  tf: r("Koniec Napoleona", "Конец Наполеона"),
} satisfies Record<string, Txt>;

const CAREER: Txt[] = [
  r("kampania włoska: zwycięstwa nad Austrią (1796–1797)", "Итальянская кампания: победы над Австрией (1796–1797)"),
  r("wyprawa do Egiptu (1798)", "Египетский поход (1798)"),
  r("zamach 18 brumaire'a — pierwszy konsul (1799)", "переворот 18 брюмера — первый консул (1799)"),
  r("Kodeks Napoleona (1804)", "Кодекс Наполеона (1804)"),
  r("koronacja na cesarza Francuzów (2 XII 1804)", "коронация императором французов (2 XII 1804)"),
];

const BATTLE_OPTIONS: QuizOption[] = [
  { id: "austerlitz", label: r("Austerlitz 1805", "Аустерлиц 1805") },
  { id: "trafalgar", label: r("Trafalgar 1805", "Трафальгар 1805") },
  { id: "jena", label: r("Jena i Auerstedt 1806", "Йена и Ауэрштедт 1806") },
  { id: "borodino", label: r("Borodino 1812", "Бородино 1812") },
  { id: "lipsk", label: r("Lipsk 1813", "Лейпциг 1813") },
  { id: "waterloo", label: r("Waterloo 1815", "Ватерлоо 1815") },
];

const BATTLES: QuizItem[] = [
  { icon: "👑", name: r("„bitwa trzech cesarzy” — Napoleon rozbił Austrię i Rosję", "«битва трёх императоров» — Наполеон разгромил Австрию и Россию"), answer: "austerlitz", explain: r("Pod Austerlitz na Morawach Napoleon odniósł największe zwycięstwo; Austria musiała prosić o pokój.", "Под Аустерлицем в Моравии Наполеон одержал величайшую победу; Австрии пришлось просить мира.") },
  { icon: "⚓", name: r("admirał Nelson zniszczył flotę francusko-hiszpańską", "адмирал Нельсон уничтожил франко-испанский флот"), answer: "trafalgar", explain: r("Po Trafalgarze Wielka Brytania panowała na morzach, a Napoleon musiał porzucić plan inwazji na Anglię.", "После Трафальгара Великобритания господствовала на морях, а Наполеону пришлось отказаться от вторжения в Англию.") },
  { icon: "🦅", name: r("armia pruska rozbita w jeden dzień, Francuzi wkroczyli do Berlina", "прусская армия разбита за один день, французы вошли в Берлин"), answer: "jena", explain: r("Po Jenie i Auerstedt Napoleon ogłosił w Berlinie blokadę kontynentalną — zakaz handlu z Wielką Brytanią.", "После Йены и Ауэрштедта Наполеон объявил в Берлине континентальную блокаду — запрет торговли с Великобританией.") },
  { icon: "❄️", name: r("krwawa bitwa pod Moskwą, po której Napoleon wszedł do pustego, płonącego miasta", "кровавая битва под Москвой, после которой Наполеон вошёл в пустой горящий город"), answer: "borodino", explain: r("Rosjanie wycofali się, a car nie prosił o pokój; Napoleon musiał zacząć odwrót przez mróz i głód.", "Русские отступили, а царь не просил мира; Наполеону пришлось начать отступление через мороз и голод.") },
  { icon: "🌍", name: r("„bitwa narodów” — koalicja Rosji, Prus, Austrii i Szwecji pokonała Napoleona", "«битва народов» — коалиция России, Пруссии, Австрии и Швеции разбила Наполеона"), answer: "lipsk", explain: r("Pod Lipskiem zginął książę Józef Poniatowski; rok później Napoleon abdykował i trafił na Elbę.", "Под Лейпцигом погиб князь Юзеф Понятовский; через год Наполеон отрёкся и был отправлен на Эльбу.") },
  { icon: "🏁", name: r("ostatnia bitwa Napoleona, przegrana z Wellingtonem i Blücherem", "последнее сражение Наполеона, проигранное Веллингтону и Блюхеру"), answer: "waterloo", explain: r("18 czerwca 1815 roku skończyło się „sto dni”; Napoleona zesłano na Wyspę Świętej Heleny.", "18 июня 1815 года закончились «Сто дней»; Наполеона сослали на остров Святой Елены.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("zamach 18 brumaire'a — Bonaparte pierwszym konsulem", "переворот 18 брюмера — Бонапарт первый консул"), when: "1799" },
  { name: r("Napoleon koronuje się na cesarza", "Наполеон коронуется императором"), when: "1804", note: r("2 grudnia w Notre Dame; w tym samym roku Kodeks Napoleona", "2 декабря в Нотр-Дам; в том же году Кодекс Наполеона") },
  { name: r("Austerlitz i Trafalgar", "Аустерлиц и Трафальгар"), when: "1805" },
  { name: r("blokada kontynentalna", "континентальная блокада"), when: "1806", note: r("po rozbiciu Prus pod Jeną", "после разгрома Пруссии под Йеной") },
  { name: r("pokój w Tylży", "Тильзитский мир"), when: "1807" },
  { name: r("wyprawa na Moskwę", "поход на Москву"), when: "1812" },
  { name: r("bitwa narodów pod Lipskiem", "битва народов под Лейпцигом"), when: "1813" },
  { name: r("abdykacja i zesłanie na Elbę", "отречение и ссылка на Эльбу"), when: "1814" },
  { name: r("sto dni i Waterloo", "Сто дней и Ватерлоо"), when: "1815", note: r("18 czerwca; w Wiedniu kończy obrady kongres", "18 июня; в Вене завершает работу конгресс") },
];

const END: Statement[] = [
  { text: r("Napoleon zginął w bitwie pod Waterloo.", "Наполеон погиб в битве при Ватерлоо."), truth: false, why: r("Przeżył, poddał się Brytyjczykom i został zesłany na Wyspę Świętej Heleny, gdzie zmarł w 1821 roku.", "Он выжил, сдался британцам и был сослан на остров Святой Елены, где умер в 1821 году.") },
  { text: r("Wielką Armię w Rosji zniszczyły nie tylko bitwy, ale też mróz, głód i choroby.", "Великую армию в России уничтожили не только битвы, но и мороз, голод и болезни."), truth: true, why: r("Z około 600 tysięcy żołnierzy wróciło zaledwie kilkadziesiąt tysięcy; przeprawa przez Berezynę stała się symbolem klęski.", "Из примерно 600 тысяч солдат вернулись лишь несколько десятков тысяч; переправа через Березину стала символом катастрофы.") },
  { text: r("Kongres wiedeński obradował w latach 1814–1815 i przywrócił na trony dawne dynastie.", "Венский конгресс заседал в 1814–1815 годах и вернул на троны прежние династии."), truth: true, why: r("To zasada legitymizmu: we Francji na tron wrócili Burbonowie.", "Это принцип легитимизма: во Франции на трон вернулись Бурбоны.") },
  { text: r("Święte Przymierze zawarły Wielka Brytania, Francja i Hiszpania.", "Священный союз заключили Великобритания, Франция и Испания."), truth: false, why: r("Święte Przymierze z 1815 roku to sojusz Rosji, Austrii i Prus, który miał tłumić wszelkie rewolucje.", "Священный союз 1815 года — это союз России, Австрии и Пруссии, который должен был подавлять любые революции.") },
  { text: r("Blokada kontynentalna była skierowana przeciw Rosji.", "Континентальная блокада была направлена против России."), truth: false, why: r("Była wymierzona w Wielką Brytanię: Europa miała przestać kupować brytyjskie towary. Rosja ją złamała — i to stało się powodem wojny 1812 roku.", "Она была направлена против Великобритании: Европа должна была перестать покупать британские товары. Россия её нарушила — и это стало поводом к войне 1812 года.") },
  { text: r("Kodeks Napoleona wprowadzał równość obywateli wobec prawa i obowiązywał długo po upadku cesarza.", "Кодекс Наполеона вводил равенство граждан перед законом и действовал долго после падения императора."), truth: true, why: r("Kodeks cywilny z 1804 roku stał się wzorem prawa w wielu krajach Europy, także na ziemiach polskich.", "Гражданский кодекс 1804 года стал образцом права во многих странах Европы, в том числе на польских землях.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Napoleon Bonaparte: Korsykanin, generał rewolucji, od 1799 pierwszy konsul, od 2 XII 1804 cesarz Francuzów.", "Наполеон Бонапарт: корсиканец, генерал революции, с 1799 первый консул, со 2 XII 1804 император французов."),
    r("Kodeks Napoleona (1804): równość wobec prawa, ochrona własności, śluby cywilne.", "Кодекс Наполеона (1804): равенство перед законом, защита собственности, гражданский брак."),
  ],
  s2: [
    r("Około 1812 roku Francja rządziła Europą wprost (cesarstwo) albo przez państwa zależne: Związek Reński, Włochy, Hiszpanię, Księstwo Warszawskie.", "Около 1812 года Франция правила Европой напрямую (империя) или через зависимые государства: Рейнский союз, Италию, Испанию, Варшавское герцогство."),
    r("Prusy i Austria były pokonane i zmuszone do sojuszu; Wielka Brytania pozostała wrogiem; Rosja złamała blokadę.", "Пруссия и Австрия были разбиты и принуждены к союзу; Великобритания осталась врагом; Россия нарушила блокаду."),
  ],
  s3: [
    r("Zwycięstwa: Austerlitz 1805, Jena 1806. Klęski: Trafalgar 1805 (Nelson), Rosja 1812, Lipsk 1813, Waterloo 1815 (Wellington).", "Победы: Аустерлиц 1805, Йена 1806. Поражения: Трафальгар 1805 (Нельсон), Россия 1812, Лейпциг 1813, Ватерлоо 1815 (Веллингтон)."),
    r("Blokada kontynentalna (1806) — zakaz handlu z Wielką Brytanią dla całej Europy.", "Континентальная блокада (1806) — запрет торговли с Великобританией для всей Европы."),
  ],
  s5: [
    r("Kongres wiedeński 1814–1815: legitymizm (powrót prawowitych dynastii), równowaga sił, Święte Przymierze Rosji, Austrii i Prus.", "Венский конгресс 1814–1815: легитимизм (возвращение законных династий), равновесие сил, Священный союз России, Австрии и Пруссии."),
    r("Napoleon: Elba 1814 → sto dni → Waterloo 18 VI 1815 → Wyspa Świętej Heleny.", "Наполеон: Эльба 1814 → Сто дней → Ватерлоо 18 VI 1815 → остров Святой Елены."),
  ],
};

export default function ConquestsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="conquests" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="conquests-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.order} hint={T.orderHint} start={T.orderStart} steps={CAREER} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="conquests-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <NapoleonMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="conquests-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={T.battles} question={T.battlesQ} options={BATTLE_OPTIONS} items={BATTLES} wrongHint={T.battlesWrong} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="conquests-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="conquests-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={END} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
