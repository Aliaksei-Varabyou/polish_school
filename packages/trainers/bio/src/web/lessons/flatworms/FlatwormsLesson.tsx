// Lesson for §2.2 "Płazińce – zwierzęta, które mają płaskie ciało" (Puls życia 6). Terms follow
// templates/data/sp6Invertebrates.ts (FLATWORMS).
import { CycleDiagram, TwoWaySort, type CycleStage, type SortItem } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";
import { PlanariaMap, Tapeworm } from "./Flatworms.tsx";

const T = {
  lead: {
    pl: "Płazińce to robaki o płaskim ciele, przypominającym wstążkę lub listek. Niektóre, jak wypławek, żyją swobodnie w wodzie. Większość jednak to pasożyty — tasiemce i przywry — żyjące w ciele innych zwierząt i człowieka.",
    ru: "Плоские черви — черви с плоским телом, похожим на ленточку или листок. Некоторые, как планария, живут свободно в воде. Но большинство — паразиты: цепни и сосальщики, живущие в теле других животных и человека.",
  },
  s1: { pl: "Wypławek — płaziniec wolno żyjący", ru: "Планария — свободноживущий плоский червь" },
  s1intro: {
    pl: "Wypławek żyje w czystych strumieniach pod kamieniami. Przyjrzyj się jego budowie — przycisk „Rozgałęzione jelito” pokaże wnętrze.",
    ru: "Планария живёт в чистых ручьях под камнями. Рассмотри её строение — кнопка «Ветвистый кишечник» покажет, что внутри.",
  },
  s2: { pl: "Tasiemiec — pasożyt jelita", ru: "Цепень — паразит кишечника" },
  s2intro: {
    pl: "Tasiemce są świetnie przystosowane do życia w jelicie. Porównaj dwa gatunki, którymi może zarazić się człowiek.",
    ru: "Цепни прекрасно приспособлены к жизни в кишечнике. Сравни два вида, которыми может заразиться человек.",
  },
  s3: { pl: "Cykl rozwojowy tasiemca uzbrojonego", ru: "Цикл развития свиного цепня" },
  s3intro: {
    pl: "Tasiemiec potrzebuje dwóch żywicieli: w żywicielu pośrednim (świni) żyje larwa, w żywicielu ostatecznym (człowieku) — dorosły pasożyt. Przejdź przez cały cykl i znajdź miejsca, w których można go przerwać.",
    ru: "Цепню нужны два хозяина: в промежуточном (свинье) живёт личинка, в окончательном (человеке) — взрослый паразит. Пройди весь цикл и найди места, где его можно разорвать.",
  },
  s4: { pl: "Pasożyt czy wolno żyjący?", ru: "Паразит или свободноживущий?" },
  s4intro: {
    pl: "Życie w ciele żywiciela zmieniło budowę pasożytów. Przypisz cechy tasiemcowi albo wypławkowi.",
    ru: "Жизнь в теле хозяина изменила строение паразитов. Отнеси признаки к цепню или к планарии.",
  },
  tapeworm: { pl: "tasiemiec", ru: "цепень" },
  planarian: { pl: "wypławek", ru: "планария" },
} satisfies Record<string, Txt>;

const CYCLE: CycleStage[] = [
  {
    icon: "🧑",
    name: { pl: "Tasiemiec w jelicie człowieka", ru: "Цепень в кишечнике человека" },
    text: {
      pl: "Człowiek jest żywicielem ostatecznym: w jego jelicie cienkim żyje dorosły tasiemiec. Przyczepia się przyssawkami i haczykami i rośnie nawet do kilku metrów.",
      ru: "Человек — окончательный хозяин: в его тонкой кишке живёт взрослый цепень. Он прикрепляется присосками и крючьями и вырастает до нескольких метров.",
    },
    prevent: { pl: "Gdy pojawią się objawy, idź do lekarza — tasiemca usuwa się lekami.", ru: "При симптомах — к врачу: цепня выводят лекарствами." },
  },
  {
    icon: "🚽",
    name: { pl: "Człony z jajami trafiają do kału", ru: "Членики с яйцами попадают в кал" },
    text: {
      pl: "Ostatnie człony, pełne tysięcy jaj, odrywają się i wydostają z organizmu razem z kałem.",
      ru: "Последние членики, полные тысяч яиц, отрываются и выходят из организма вместе с калом.",
    },
    prevent: { pl: "Toalety i oczyszczalnie ścieków — kał nie trafia na pola ani do paszy zwierząt.", ru: "Туалеты и очистные сооружения — кал не попадает на поля и в корм животным." },
  },
  {
    icon: "🐖",
    name: { pl: "Świnia połyka jaja", ru: "Свинья проглатывает яйца" },
    text: {
      pl: "Świnia zjada paszę lub pije wodę zanieczyszczoną jajami. W jej jelicie z jaj wylęgają się larwy. Świnia jest żywicielem pośrednim.",
      ru: "Свинья съедает корм или пьёт воду, загрязнённые яйцами. В её кишечнике из яиц выходят личинки. Свинья — промежуточный хозяин.",
    },
    prevent: { pl: "Czysta pasza i woda dla zwierząt hodowlanych.", ru: "Чистый корм и вода для домашних животных." },
  },
  {
    icon: "🥩",
    name: { pl: "Wągry w mięśniach świni", ru: "Финны в мышцах свиньи" },
    text: {
      pl: "Larwy wędrują z krwią do mięśni i otaczają się torebką. Taka otorbiona larwa to wągier — wygląda jak białe ziarenko w mięsie.",
      ru: "Личинки с кровью попадают в мышцы и окружают себя капсулой. Такая личинка в капсуле — финна; в мясе она похожа на белое зёрнышко.",
    },
    prevent: { pl: "Weterynarz bada mięso w rzeźni — mięso z wągrami nie trafia do sklepu.", ru: "Ветеринар проверяет мясо на бойне — мясо с финнами не попадает в магазин." },
  },
  {
    icon: "🍳",
    name: { pl: "Człowiek je niedogotowaną wieprzowinę", ru: "Человек ест недоваренную свинину" },
    text: {
      pl: "Jeśli wągier przeżyje gotowanie, w jelicie człowieka wyrasta z niego nowy tasiemiec — i cykl się zamyka.",
      ru: "Если финна пережила готовку, в кишечнике человека из неё вырастает новый цепень — и цикл замыкается.",
    },
    prevent: { pl: "Dobrze gotuj i smaż mięso — wysoka temperatura zabija wągry.", ru: "Хорошо проваривай и прожаривай мясо — высокая температура убивает финн." },
  },
];

const SORT: SortItem[] = [
  { name: { pl: "przyssawki i haczyki", ru: "присоски и крючья" }, group: 0, why: { pl: "trzymają się ściany jelita", ru: "держатся за стенку кишечника" } },
  { name: { pl: "oczka wyczuwające światło", ru: "глазки, чувствующие свет" }, group: 1, why: { pl: "w ciemnym jelicie oczy są niepotrzebne", ru: "в тёмном кишечнике глаза не нужны" } },
  { name: { pl: "brak przewodu pokarmowego", ru: "нет пищеварительной системы" }, group: 0, why: { pl: "wchłania strawiony pokarm całym ciałem", ru: "всасывает переваренную пищу всем телом" } },
  { name: { pl: "gardziel do chwytania pokarmu", ru: "глотка для захвата пищи" }, group: 1, why: { pl: "sam zdobywa pokarm", ru: "сама добывает пищу" } },
  { name: { pl: "ogromna liczba jaj", ru: "огромное количество яиц" }, group: 0, why: { pl: "tylko nieliczne trafią do nowego żywiciela", ru: "лишь немногие попадут к новому хозяину" } },
  { name: { pl: "pełza po kamieniach dzięki rzęskom", ru: "скользит по камням с помощью ресничек" }, group: 1, why: { pl: "porusza się aktywnie", ru: "передвигается активно" } },
  { name: { pl: "osłona odporna na soki trawienne", ru: "покров, устойчивый к пищеварительным сокам" }, group: 0, why: { pl: "żywiciel go nie strawi", ru: "хозяин его не переварит" } },
  { name: { pl: "żyje w strumieniu pod kamieniami", ru: "живёт в ручье под камнями" }, group: 1, why: { pl: "wolno żyjący płaziniec", ru: "свободноживущий плоский червь" } },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Płazińce mają płaskie ciało o symetrii dwubocznej.", ru: "У плоских червей плоское тело с двусторонней симметрией." },
    { pl: "Wypławek ma oczka, gardziel i rozgałęzione jelito z jednym otworem.", ru: "У планарии есть глазки, глотка и ветвистый кишечник с одним отверстием." },
  ],
  s2: [
    { pl: "Tasiemiec uzbrojony (wieprzowina) ma przyssawki i haczyki, nieuzbrojony (wołowina) — tylko przyssawki.", ru: "Свиной цепень (свинина) имеет присоски и крючья, бычий (говядина) — только присоски." },
    { pl: "Płazińce są obojnakami — jeden osobnik ma męskie i żeńskie narządy rozrodcze.", ru: "Плоские черви — гермафродиты: у одной особи есть и мужские, и женские половые органы." },
  ],
  s3: [
    { pl: "Żywiciel ostateczny — w nim pasożyt dorasta i rozmnaża się; żywiciel pośredni — w nim żyje larwa.", ru: "Окончательный хозяин — в нём паразит взрослеет и размножается; промежуточный — в нём живёт личинка." },
    { pl: "Motylica wątrobowa żyje w wątrobie bydła i owiec, a jej żywicielem pośrednim jest ślimak.", ru: "Печёночный сосальщик живёт в печени коров и овец, а его промежуточный хозяин — улитка." },
  ],
  s4: [{ pl: "Przystosowania pasożytów: narządy czepne, odporna osłona ciała, brak zbędnych narządów, dużo jaj.", ru: "Приспособления паразитов: органы прикрепления, устойчивый покров, нет лишних органов, много яиц." }],
};

export default function FlatwormsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="flatworms" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="flatworms-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <PlanariaMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="flatworms-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Tapeworm lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="flatworms-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <CycleDiagram lang={lang} title={T.s3} stages={CYCLE} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="flatworms-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={{ pl: "Czyja to cecha?", ru: "Чей это признак?" }} groups={[T.tapeworm, T.planarian]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
