// Lesson for §33 "Po III rozbiorze Polski" (Historia 6, GWO). Terms, people and dates follow the
// task bank of the same paragraph (templates/data/ch6.ts, LEGIONS and LEGIONS_DATES).
import {
  LessonIntro,
  Remember,
  Section,
  SpeciesGallery,
  Timeline,
  TrueFalse,
  type LessonProps,
  type Species,
  type Statement,
  type TimelineEvent,
  type Txt,
} from "@portal/lessons";
import { MazurekQuiz } from "./MazurekQuiz.tsx";
import { PartitionsMap } from "./PartitionsMap.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "W 1795 roku Rzeczpospolita zniknęła z mapy Europy. Polacy nie pogodzili się z tym: patrioci wyjechali do Francji, a generał Dąbrowski utworzył we Włoszech Legiony Polskie. To dla nich Józef Wybicki napisał pieśń, która jest dziś hymnem Polski.",
    "В 1795 году Речь Посполитая исчезла с карты Европы. Поляки не смирились с этим: патриоты уехали во Францию, а генерал Домбровский создал в Италии Польские легионы. Для них Юзеф Выбицкий написал песню, которая сегодня является гимном Польши.",
  ),
  s1: r("Polska pod zaborami", "Польша под властью трёх держав"),
  s1intro: r(
    "Dotknij części mapy, żeby zobaczyć, co przypadło każdemu z zaborców i jak traktowali Polaków. Potem podpisz mapę sam.",
    "Нажми на часть карты, чтобы увидеть, что досталось каждой из держав и как они обращались с поляками. Потом подпиши карту сам.",
  ),
  s2: r("Ludzie Legionów", "Люди легионов"),
  s2intro: r("Dotknij karty, żeby poznać człowieka. Jeden z nich odmówił — zgadniesz kto?", "Нажми на карточку, чтобы узнать о человеке. Один из них отказался — догадаешься кто?"),
  s3: r("Mazurek Dąbrowskiego", "Мазурка Домбровского"),
  s3intro: r(
    "Pieśń Legionów powstała w Reggio w lipcu 1797 roku. Każda zwrotka mówi o czymś z historii — dopasuj.",
    "Песнь легионов возникла в Реджо в июле 1797 года. Каждый куплет говорит о чём-то из истории — подбери.",
  ),
  s4: r("Oś czasu", "Лента времени"),
  s4intro: r("Ułóż wydarzenia od najwcześniejszego do najpóźniejszego.", "Расставь события от самого раннего до самого позднего."),
  s5: r("Nadzieje i zawód", "Надежды и разочарование"),
  s5intro: r("Prawda czy fałsz? Zdania dotyczą Legionów i Napoleona.", "Правда или ложь? Утверждения о легионах и Наполеоне."),
  timeline: r("Legiony rok po roku", "Легионы год за годом"),
  tf: r("Legiony i Napoleon", "Легионы и Наполеон"),
} satisfies Record<string, Txt>;

const PEOPLE: Species[] = [
  { icon: "🎖️", name: r("Jan Henryk Dąbrowski", "Ян Генрик Домбровский"), tag: r("generał", "генерал"), text: r("Generał z insurekcji kościuszkowskiej. W styczniu 1797 roku zawarł umowę z Republiką Lombardzką i utworzył Legiony Polskie we Włoszech. Legioniści nosili polskie mundury, a na naramiennikach napis „Ludzie wolni są braćmi”.", "Генерал восстания Костюшко. В январе 1797 года заключил соглашение с Ломбардской республикой и создал Польские легионы в Италии. Легионеры носили польские мундиры, а на погонах — надпись «Свободные люди — братья».") },
  { icon: "✍️", name: r("Józef Wybicki", "Юзеф Выбицкий"), tag: r("poeta", "поэт"), text: r("Działacz polityczny i poeta, współpracownik Dąbrowskiego. W lipcu 1797 roku w Reggio napisał „Pieśń Legionów Polskich we Włoszech” — dzisiejszy Mazurek Dąbrowskiego.", "Политический деятель и поэт, соратник Домбровского. В июле 1797 года в Реджо написал «Песнь польских легионов в Италии» — нынешнюю Мазурку Домбровского.") },
  { icon: "⚔️", name: r("Karol Kniaziewicz", "Кароль Князевич"), tag: r("generał", "генерал"), text: r("Generał Legionów. W 1799 roku utworzył Legię Naddunajską, która walczyła z Austrią nad Dunajem i odznaczyła się pod Hohenlinden w 1800 roku.", "Генерал легионов. В 1799 году создал Придунайский легион, который сражался с Австрией на Дунае и отличился при Гогенлиндене в 1800 году.") },
  { icon: "👑", name: r("Napoleon Bonaparte", "Наполеон Бонапарт"), tag: r("generał Francji", "генерал Франции"), text: r("Zgodził się na utworzenie Legionów, bo potrzebował żołnierzy. Obiecywał Polakom pomoc, ale w pokoju w Lunéville (1801) pominął sprawę polską, a niewygodnych legionistów wysłał na San Domingo.", "Согласился на создание легионов, потому что нуждался в солдатах. Обещал полякам помощь, но в Люневильском мире (1801) обошёл польский вопрос, а неудобных легионеров отправил на Сан-Доминго.") },
  { icon: "🛡️", name: r("Tadeusz Kościuszko", "Тадеуш Костюшко"), tag: r("odmówił", "отказался"), text: r("Naczelnik insurekcji 1794 roku, po wyjściu z rosyjskiej niewoli mieszkał we Francji. Nie ufał Napoleonowi: uważał, że ten używa Polaków do własnych celów, i odmówił stanięcia na czele polskich oddziałów.", "Вождь восстания 1794 года, после освобождения из русского плена жил во Франции. Не доверял Наполеону: считал, что тот использует поляков в своих целях, и отказался возглавить польские части.") },
  { icon: "🐎", name: r("Stefan Czarniecki", "Стефан Чарнецкий"), tag: r("bohater z pieśni", "герой из песни"), text: r("Hetman z czasów potopu szwedzkiego (XVII wiek), wspomniany w Mazurku. Ścigał Szwedów aż do Danii i wrócił „przez morze” ratować ojczyznę — tak jak chcieli wrócić legioniści.", "Гетман времён шведского «потопа» (XVII век), упомянутый в Мазурке. Преследовал шведов до самой Дании и вернулся «через море» спасать отчизну — как хотели вернуться легионеры.") },
];

const EVENTS: TimelineEvent[] = [
  { name: r("III rozbiór Polski", "третий раздел Польши"), when: "1795", note: r("Rzeczpospolita znika z mapy", "Речь Посполитая исчезает с карты") },
  { name: r("Dąbrowski tworzy Legiony Polskie we Włoszech", "Домбровский создаёт Польские легионы в Италии"), when: "I 1797" },
  { name: r("Wybicki pisze Pieśń Legionów w Reggio", "Выбицкий пишет Песнь легионов в Реджо"), when: "VII 1797" },
  { name: r("Kniaziewicz tworzy Legię Naddunajską", "Князевич создаёт Придунайский легион"), when: "1799" },
  { name: r("pokój w Lunéville — Napoleon pomija sprawę polską", "Люневильский мир — Наполеон обходит польский вопрос"), when: "1801" },
  { name: r("legioniści wysłani na San Domingo", "легионеры отправлены на Сан-Доминго"), when: "1802", note: r("większość ginie na Haiti", "большинство гибнет на Гаити") },
  { name: r("Mazurek Dąbrowskiego hymnem Polski", "Мазурка Домбровского — гимн Польши"), when: "1927" },
];

const HOPES: Statement[] = [
  { text: r("Napoleon zgodził się na Legiony, bo chciał przede wszystkim odbudować Polskę.", "Наполеон согласился на легионы, потому что прежде всего хотел восстановить Польшу."), truth: false, why: r("Potrzebował żołnierzy do wojny z Austrią. Sprawa polska była dla niego kartą przetargową — w Lunéville w 1801 roku w ogóle o niej nie wspomniał.", "Ему нужны были солдаты для войны с Австрией. Польский вопрос был для него разменной картой — в Люневиле в 1801 году он о нём даже не упомянул.") },
  { text: r("Legiony Polskie powstały w 1797 roku w Lombardii, u boku Francji.", "Польские легионы возникли в 1797 году в Ломбардии, на стороне Франции."), truth: true, why: r("Formalnie służyły Republice Lombardzkiej, zależnej od Francji; dowodził nimi generał Dąbrowski.", "Формально они служили Ломбардской республике, зависимой от Франции; командовал ими генерал Домбровский.") },
  { text: r("Na czele Legionów stanął Tadeusz Kościuszko.", "Легионы возглавил Тадеуш Костюшко."), truth: false, why: r("Kościuszko odmówił współpracy z Napoleonem. Legionami dowodził Jan Henryk Dąbrowski.", "Костюшко отказался сотрудничать с Наполеоном. Легионами командовал Ян Генрик Домбровский.") },
  { text: r("Legioniści wysłani na San Domingo walczyli tam o wolność Polski.", "Легионеры, отправленные на Сан-Доминго, сражались там за свободу Польши."), truth: false, why: r("Mieli tłumić powstanie niewolników na Haiti. Większość zmarła na żółtą febrę; część przeszła na stronę powstańców.", "Они должны были подавлять восстание рабов на Гаити. Большинство умерло от жёлтой лихорадки; часть перешла на сторону повстанцев.") },
  { text: r("Mazurek Dąbrowskiego został hymnem Polski już w 1797 roku.", "Мазурка Домбровского стала гимном Польши уже в 1797 году."), truth: false, why: r("W 1797 roku była pieśnią legionistów. Hymnem państwowym została dopiero w 1927 roku, w odrodzonej Polsce.", "В 1797 году это была песня легионеров. Государственным гимном она стала только в 1927 году, в возрождённой Польше.") },
  { text: r("W zaborze pruskim prowadzono germanizację, a w rosyjskim rusyfikację.", "В прусской части проводили германизацию, а в российской — русификацию."), truth: true, why: r("Zaborcy wprowadzali swój język do szkół i urzędów i chcieli, by Polacy zapomnieli o własnym państwie.", "Державы-захватчицы вводили свой язык в школы и учреждения и хотели, чтобы поляки забыли о собственном государстве.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s5", Txt[]> = {
  s1: [
    r("Po III rozbiorze (1795) ziemie polskie podzieliły Rosja (Wilno), Prusy (Warszawa, Poznań, Gdańsk) i Austria (Galicja: Kraków, Lwów).", "После третьего раздела (1795) польские земли поделили Россия (Вильно), Пруссия (Варшава, Познань, Гданьск) и Австрия (Галиция: Краков, Львов)."),
    r("Germanizacja w zaborze pruskim, rusyfikacja w rosyjskim; patrioci wyjeżdżali na emigrację, głównie do Francji.", "Германизация в прусской части, русификация в российской; патриоты уезжали в эмиграцию, главным образом во Францию."),
  ],
  s2: [
    r("Legiony Polskie we Włoszech: 1797, Lombardia, gen. Jan Henryk Dąbrowski. Legia Naddunajska: 1799, gen. Karol Kniaziewicz.", "Польские легионы в Италии: 1797, Ломбардия, ген. Ян Генрик Домбровский. Придунайский легион: 1799, ген. Кароль Князевич."),
    r("Kościuszko odmówił współpracy z Napoleonem — nie wierzył w jego obietnice.", "Костюшко отказался сотрудничать с Наполеоном — не верил его обещаниям."),
  ],
  s3: [
    r("„Pieśń Legionów Polskich we Włoszech”: słowa Józef Wybicki, Reggio, lipiec 1797. Od 1927 roku hymn Polski — Mazurek Dąbrowskiego.", "«Песнь польских легионов в Италии»: слова Юзефа Выбицкого, Реджо, июль 1797. С 1927 года гимн Польши — Мазурка Домбровского."),
    r("W hymnie: Dąbrowski (Legiony), Bonaparte (wzór zwycięzcy), Czarniecki (potop szwedzki), Wisła i Warta (powrót do kraju).", "В гимне: Домбровский (легионы), Бонапарт (образец победителя), Чарнецкий (шведский «потоп»), Висла и Варта (возвращение на родину)."),
  ],
  s5: [
    r("Pokój w Lunéville (1801) pominął Polskę; w 1802–1803 część legionistów wysłano na San Domingo (Haiti), gdzie większość zginęła.", "Люневильский мир (1801) обошёл Польшу; в 1802–1803 годах часть легионеров отправили на Сан-Доминго (Гаити), где большинство погибло."),
    r("Mimo zawodu Legiony zachowały polskie wojsko i nadzieję — przydały się w 1806 roku, gdy Napoleon ruszył na Prusy.", "Несмотря на разочарование, легионы сохранили польское войско и надежду — они пригодились в 1806 году, когда Наполеон пошёл на Пруссию."),
  ],
};

export default function LegionsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="legions" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />

      <Section id="legions-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <PartitionsMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="legions-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <SpeciesGallery lang={lang} items={PEOPLE} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="legions-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MazurekQuiz lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="legions-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Timeline lang={lang} title={T.timeline} events={EVENTS} />
      </Section>

      <Section id="legions-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TrueFalse lang={lang} title={T.tf} items={HOPES} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
