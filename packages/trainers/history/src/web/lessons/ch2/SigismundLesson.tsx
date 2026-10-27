// Lesson for §5 "Czasy zygmuntowskie" (Historia 6, GWO). People, places and dates follow the task
// bank of the same paragraph (templates/data/ch2.ts, SIGISMUND and SIGISMUND_DATES).
import {
  LessonIntro,
  Remember,
  Section,
  SpeciesGallery,
  Timeline,
  TrueFalse,
  TwoWaySort,
  type LessonProps,
  type SortItem,
  type Species,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { PrussiaMap } from "./PrussiaMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Wiek XVI nazywamy złotym wiekiem Polski. Rządzili wtedy dwaj ostatni Jagiellonowie: Zygmunt I Stary i jego syn Zygmunt II August. Państwo było silne i bogate, Krzyżacy przestali być groźni, a na Wawelu zamieszkał renesans.",
    "XVI век называют золотым веком Польши. Тогда правили два последних Ягеллона: Сигизмунд I Старый и его сын Сигизмунд II Август. Государство было сильным и богатым, крестоносцы перестали быть опасными, а на Вавеле поселилось Возрождение.",
  ),
  s1: r("Ludzie epoki", "Люди эпохи"),
  s1intro: r(
    "Dotknij karty, żeby poznać postać. Zwróć uwagę, kto był czyim synem, żoną albo wrogiem.",
    "Нажми на карточку, чтобы узнать о человеке. Обрати внимание, кто кому был сыном, женой или врагом.",
  ),
  s2: r("Hołd pruski i mapa państwa", "Прусский оммаж и карта государства"),
  s2intro: r(
    "W 1525 roku państwo krzyżackie zniknęło z mapy, a w 1526 roku do Korony dołączyło Mazowsze. Obejrzyj mapę, a potem podpisz ją sam.",
    "В 1525 году государство крестоносцев исчезло с карты, а в 1526 году к Короне присоединилась Мазовия. Рассмотри карту, а потом подпиши её сам.",
  ),
  s3: r("Ojciec czy syn?", "Отец или сын?"),
  s3intro: r("Dwaj Zygmuntowie łatwo się mylą. Kto zrobił co?", "Двух Сигизмундов легко перепутать. Кто что сделал?"),
  s4: r("Prawda czy fałsz?", "Правда или ложь?"),
  s4intro: r("Sprawdź, czy dobrze rozumiesz, co się stało z Krzyżakami i Prusami.", "Проверь, правильно ли ты понимаешь, что случилось с крестоносцами и Пруссией."),
  s5: r("Oś czasu", "Лента времени"),
  s5intro: r("Ułóż wydarzenia czasów zygmuntowskich od najwcześniejszego.", "Расставь события эпохи Сигизмундов от самого раннего."),
  sort: r("Zygmunt Stary czy Zygmunt August?", "Сигизмунд Старый или Сигизмунд Август?"),
  sortHint: r("Ojciec rządził do 1548 roku, syn — do 1572.", "Отец правил до 1548 года, сын — до 1572."),
  stary: r("Zygmunt Stary", "Сигизмунд Старый"),
  august: r("Zygmunt August", "Сигизмунд Август"),
  tf: r("Krzyżacy, Prusy i hołd", "Крестоносцы, Пруссия и оммаж"),
  timeline: r("Czasy zygmuntowskie rok po roku", "Эпоха Сигизмундов год за годом"),
} satisfies Record<string, Txt>;

const PEOPLE: Species[] = [
  {
    icon: "👑",
    name: r("Zygmunt I Stary", "Сигизмунд I Старый"),
    tag: r("król 1506–1548", "король 1506–1548"),
    text: r(
      "Syn Kazimierza Jagiellończyka. Przyjął hołd pruski, włączył Mazowsze do Korony i przebudował Wawel w stylu renesansowym. Przydomek „Stary” dostał, bo objął tron w wieku 39 lat i rządził 42 lata.",
      "Сын Казимира Ягеллончика. Принял прусский оммаж, присоединил Мазовию к Короне и перестроил Вавель в стиле Возрождения. Прозвище «Старый» получил, потому что занял трон в 39 лет и правил 42 года.",
    ),
  },
  {
    icon: "👸",
    name: r("Bona Sforza", "Бона Сфорца"),
    tag: r("królowa", "королева"),
    text: r(
      "Włoska księżniczka z Mediolanu, druga żona Zygmunta Starego. Sprowadziła włoskich artystów i uczonych, a także warzywa, które do dziś nazywamy włoszczyzną. Energiczna i zaradna, dbała o majątek rodziny.",
      "Итальянская принцесса из Милана, вторая жена Сигизмунда Старого. Привезла итальянских художников и учёных, а также овощи, которые по-польски до сих пор называют «włoszczyzna». Энергичная и предприимчивая, она заботилась об имуществе семьи.",
    ),
  },
  {
    icon: "🤴",
    name: r("Zygmunt II August", "Сигизмунд II Август"),
    tag: r("król 1548–1572", "король 1548–1572"),
    text: r(
      "Syn Zygmunta Starego i Bony, koronowany już w 1530 roku, za życia ojca. Ostatni król z dynastii Jagiellonów: zmarł bezpotomnie w 1572 roku. Doprowadził do unii lubelskiej i słynął z tolerancji.",
      "Сын Сигизмунда Старого и Боны, коронованный уже в 1530 году, при жизни отца. Последний король из династии Ягеллонов: умер бездетным в 1572 году. Добился Люблинской унии и славился веротерпимостью.",
    ),
  },
  {
    icon: "⚜️",
    name: r("Jagiellonowie", "Ягеллоны"),
    tag: r("dynastia", "династия"),
    text: r(
      "Ród królewski wywodzący się od Władysława Jagiełły. W XVI wieku Jagiellonowie rządzili Polską, Litwą, a przez pewien czas także Czechami i Węgrami. Dynastia wygasła w 1572 roku.",
      "Королевский род, идущий от Владислава Ягайло. В XVI веке Ягеллоны правили Польшей, Литвой, а некоторое время также Чехией и Венгрией. Династия угасла в 1572 году.",
    ),
  },
  {
    icon: "✝️",
    name: r("Zakon krzyżacki", "Тевтонский орден"),
    tag: r("wróg", "враг"),
    text: r(
      "Zakon rycerski, który od XIII wieku panował w Prusach. Po przegranej wojnie z Polską (1519–1521) i przyjęciu luteranizmu przez wielkiego mistrza zakon przestał istnieć w Prusach.",
      "Рыцарский орден, с XIII века правивший в Пруссии. После проигранной войны с Польшей (1519–1521) и принятия лютеранства великим магистром орден перестал существовать в Пруссии.",
    ),
  },
  {
    icon: "🧎",
    name: r("Albrecht Hohenzollern", "Альбрехт Гогенцоллерн"),
    tag: r("lennik", "вассал"),
    text: r(
      "Ostatni wielki mistrz Krzyżaków i siostrzeniec Zygmunta Starego. Przyjął luteranizm, zamienił państwo zakonne w świeckie Prusy Książęce i w 1525 roku złożył hołd królowi Polski.",
      "Последний великий магистр крестоносцев и племянник Сигизмунда Старого. Принял лютеранство, превратил орденское государство в светскую Герцогскую Пруссию и в 1525 году принёс присягу королю Польши.",
    ),
  },
  {
    icon: "⚔️",
    name: r("Konstanty Ostrogski", "Константин Острожский"),
    tag: r("hetman", "гетман"),
    text: r(
      "Hetman wielki litewski. W 1514 roku pod Orszą rozbił armię moskiewską, choć utraconego wcześniej Smoleńska nie udało się odzyskać.",
      "Великий гетман литовский. В 1514 году под Оршей разбил московскую армию, хотя потерянный ранее Смоленск вернуть не удалось.",
    ),
  },
  {
    icon: "🏰",
    name: r("Piastowie mazowieccy", "Мазовецкие Пясты"),
    tag: r("książęta", "князья"),
    text: r(
      "Ostatnia linia dynastii Piastów, rządząca księstwem mazowieckim. Po śmierci ostatnich książąt Zygmunt Stary włączył Mazowsze z Warszawą do Korony w 1526 roku.",
      "Последняя ветвь династии Пястов, правившая Мазовецким княжеством. После смерти последних князей Сигизмунд Старый присоединил Мазовию с Варшавой к Короне в 1526 году.",
    ),
  },
];

const WHO: SortItem[] = [
  {
    name: r("przyjął hołd pruski na rynku w Krakowie", "принял прусский оммаж на рынке в Кракове"),
    group: 0,
    why: r("1525 — Albrecht uklęknął przed Zygmuntem Starym", "1525 — Альбрехт преклонил колени перед Сигизмундом Старым"),
  },
  {
    name: r("poślubił Bonę Sforzę", "женился на Боне Сфорце"),
    group: 0,
    why: r("Bona była drugą żoną Zygmunta Starego", "Бона была второй женой Сигизмунда Старого"),
  },
  {
    name: r("włączył Mazowsze do Korony", "присоединил Мазовию к Короне"),
    group: 0,
    why: r("1526 — po śmierci ostatnich Piastów mazowieckich", "1526 — после смерти последних мазовецких Пястов"),
  },
  {
    name: r("przebudował Wawel w stylu renesansowym", "перестроил Вавель в стиле Возрождения"),
    group: 0,
    why: r("włoscy architekci pracowali dla Zygmunta Starego", "итальянские архитекторы работали для Сигизмунда Старого"),
  },
  {
    name: r("został koronowany jako dziesięcioletni chłopiec", "был коронован десятилетним мальчиком"),
    group: 1,
    why: r("1530 — koronacja za życia ojca", "1530 — коронация при жизни отца"),
  },
  {
    name: r("doprowadził do unii lubelskiej", "добился Люблинской унии"),
    group: 1,
    why: r("1569 — ostatnie wielkie dzieło Zygmunta Augusta", "1569 — последнее большое дело Сигизмунда Августа"),
  },
  {
    name: r("był ostatnim królem z dynastii Jagiellonów", "был последним королём из династии Ягеллонов"),
    group: 1,
    why: r("zmarł bezpotomnie w 1572 roku", "умер бездетным в 1572 году"),
  },
  {
    name: r("zamówił arrasy do komnat wawelskich", "заказал аррасы для вавельских покоев"),
    group: 1,
    why: r("Zygmunt August sprowadził je z Brukseli", "Сигизмунд Август привёз их из Брюсселя"),
  },
];

const FACTS: Statement[] = [
  {
    text: r("Po hołdzie pruskim Prusy Książęce stały się częścią Polski.", "После прусского оммажа Герцогская Пруссия стала частью Польши."),
    truth: false,
    why: r(
      "Były lennem: miały własnego księcia, który tylko uznawał zwierzchnictwo króla Polski. Częścią Korony były Prusy Królewskie.",
      "Она была леном: имела собственного князя, который лишь признавал верховенство короля Польши. Частью Короны была Королевская Пруссия.",
    ),
  },
  {
    text: r("Albrecht Hohenzollern przyjął luteranizm i został świeckim księciem.", "Альбрехт Гогенцоллерн принял лютеранство и стал светским князем."),
    truth: true,
    why: r("To była sekularyzacja: państwo zakonne zamieniło się w świeckie księstwo.", "Это была секуляризация: орденское государство превратилось в светское княжество."),
  },
  {
    text: r("Gdańsk leżał w Prusach Książęcych.", "Гданьск находился в Герцогской Пруссии."),
    truth: false,
    why: r(
      "Gdańsk należał do Prus Królewskich, czyli do Korony. Stolicą Prus Książęcych był Królewiec.",
      "Гданьск принадлежал Королевской Пруссии, то есть Короне. Столицей Герцогской Пруссии был Кёнигсберг.",
    ),
  },
  {
    text: r("Bitwa pod Orszą w 1514 roku była zwycięstwem nad Moskwą.", "Битва под Оршей в 1514 году была победой над Москвой."),
    truth: true,
    why: r("Hetman Ostrogski rozbił armię moskiewską, ale Smoleńsk pozostał w rękach Moskwy.", "Гетман Острожский разбил московскую армию, но Смоленск остался в руках Москвы."),
  },
  {
    text: r("Zygmunt August został koronowany dopiero po śmierci ojca.", "Сигизмунд Август был коронован только после смерти отца."),
    truth: false,
    why: r(
      "Koronowano go już w 1530 roku, za życia Zygmunta Starego — to wyjątek w dziejach Polski.",
      "Его короновали уже в 1530 году, при жизни Сигизмунда Старого — это исключение в истории Польши.",
    ),
  },
  {
    text: r("Mazowsze z Warszawą weszło do Korony w 1526 roku.", "Мазовия с Варшавой вошла в Корону в 1526 году."),
    truth: true,
    why: r("Po śmierci ostatnich Piastów mazowieckich księstwo przypadło królowi.", "После смерти последних мазовецких Пястов княжество досталось королю."),
  },
];

const EVENTS: TimelineEvent[] = [
  {
    name: r("Zygmunt I Stary obejmuje tron", "Сигизмунд I Старый занимает трон"),
    when: "1506",
  },
  {
    name: r("bitwa pod Orszą", "битва под Оршей"),
    when: "1514",
    note: r("hetman Konstanty Ostrogski pokonał Moskwę", "гетман Константин Острожский победил Москву"),
  },
  {
    name: r("początek ostatniej wojny z Krzyżakami", "начало последней войны с крестоносцами"),
    when: "1519",
  },
  {
    name: r("hołd pruski w Krakowie", "прусский оммаж в Кракове"),
    when: "1525",
    note: r("Albrecht Hohenzollern lennikiem Polski", "Альбрехт Гогенцоллерн — вассал Польши"),
  },
  {
    name: r("włączenie Mazowsza do Korony", "присоединение Мазовии к Короне"),
    when: "1526",
  },
  {
    name: r("koronacja Zygmunta Augusta za życia ojca", "коронация Сигизмунда Августа при жизни отца"),
    when: "1530",
  },
  {
    name: r("śmierć Zygmunta Starego", "смерть Сигизмунда Старого"),
    when: "1548",
    note: r("Zygmunt August rządzi samodzielnie", "Сигизмунд Август правит самостоятельно"),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Zygmunt I Stary (1506–1548) i Zygmunt II August (1548–1572) — dwaj ostatni Jagiellonowie.", "Сигизмунд I Старый (1506–1548) и Сигизмунд II Август (1548–1572) — два последних Ягеллона."),
    r("Bona Sforza, żona Zygmunta Starego, sprowadziła do Polski włoską kulturę.", "Бона Сфорца, жена Сигизмунда Старого, принесла в Польшу итальянскую культуру."),
  ],
  s2: [
    r("1525 — hołd pruski: Albrecht Hohenzollern, lennik Polski, książę w Prusach Książęcych.", "1525 — прусский оммаж: Альбрехт Гогенцоллерн, вассал Польши, князь Герцогской Пруссии."),
    r(
      "Prusy Królewskie (z Gdańskiem) należały do Korony; Prusy Książęce (z Królewcem) były lennem.",
      "Королевская Пруссия (с Гданьском) принадлежала Короне; Герцогская Пруссия (с Кёнигсбергом) была леном.",
    ),
    r("1526 — Mazowsze z Warszawą włączone do Korony.", "1526 — Мазовия с Варшавой присоединена к Короне."),
  ],
  s3: [
    r("Zygmunt Stary: hołd pruski, Mazowsze, renesansowy Wawel, żona Bona.", "Сигизмунд Старый: прусский оммаж, Мазовия, ренессансный Вавель, жена Бона."),
    r("Zygmunt August: koronacja w 1530 roku, unia lubelska, arrasy, ostatni Jagiellon.", "Сигизмунд Август: коронация в 1530 году, Люблинская уния, аррасы, последний Ягеллон."),
  ],
  s4: [
    r("Sekularyzacja = zamiana państwa zakonnego w świeckie księstwo.", "Секуляризация = превращение орденского государства в светское княжество."),
    r("Lenno = ziemia trzymana od władcy w zamian za przysięgę wierności (hołd lenny).", "Лен = земля, полученная от правителя в обмен на присягу верности (ленную присягу)."),
  ],
};

export default function SigismundLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="sigismund" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="sigismund-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={PEOPLE} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="sigismund-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <PrussiaMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="sigismund-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.sort} hint={T.sortHint} groups={[T.stary, T.august]} items={WHO} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="sigismund-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={FACTS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>

      <Section id="sigismund-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>
    </div>
  );
}
