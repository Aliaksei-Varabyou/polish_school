// Lesson for §5.2 "Przegląd i znaczenie ptaków" (Puls życia 6). Species follow
// templates/data/sp6Vertebrates.ts (BIRD_SPECIES).
import { SpeciesGallery, TwoWaySort, type SortItem, type Species } from "../games.tsx";
import { Remember, Section, type LessonProps, type Txt } from "../kit.tsx";
import { LessonIntro } from "../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Na świecie żyje ponad 10 tysięcy gatunków ptaków, w Polsce — ponad 400. Ptaki zjadają szkodniki, zapylają rośliny i roznoszą nasiona, a ptaki hodowlane dają nam jaja i mięso. Część z nich na zimę odlatuje do ciepłych krajów.",
    "В мире живёт больше 10 тысяч видов птиц, в Польше — больше 400. Птицы поедают вредителей, опыляют растения и разносят семена, а домашние птицы дают нам яйца и мясо. Часть птиц на зиму улетает в тёплые края.",
  ),
  s1: r("Poznaj ptaki", "Познакомься с птицами"),
  s2: r("Odlatuje czy zostaje?", "Улетает или остаётся?"),
  s2intro: r(
    "Ptaki wędrowne odlatują, gdy zimą brakuje im pokarmu — owadów, żab, ryb. Ptaki, które zimą znajdą nasiona i larwy pod korą, zostają.",
    "Перелётные птицы улетают, когда зимой им не хватает пищи — насекомых, лягушек, рыбы. Птицы, которые зимой найдут семена и личинок под корой, остаются.",
  ),
  s3: r("Karmnik zimą", "Кормушка зимой"),
  s3intro: r("Dokarmianie pomaga ptakom przetrwać mrozy — ale tylko wtedy, gdy robi się to mądrze.", "Подкормка помогает птицам пережить морозы — но только если делать её с умом."),
  leaves: r("odlatuje", "улетает"),
  stays: r("zostaje", "остаётся"),
  ok: r("można", "можно"),
  notOk: r("nie wolno", "нельзя"),
} satisfies Record<string, Txt>;

const SPECIES: Species[] = [
  { icon: "🪺", name: r("Bocian biały", "Белый аист"), text: r("Gnieździ się na słupach i dachach; na zimę odlatuje do Afryki. Polska to jedno z miejsc, gdzie gnieździ się najwięcej bocianów na świecie.", "Гнездится на столбах и крышах; на зиму улетает в Африку. Польша — одно из мест, где гнездится больше всего аистов в мире."), tag: r("wędrowny", "перелётный") },
  { icon: "🐦", name: r("Sikora bogatka", "Большая синица"), text: r("Zjada szkodniki drzew; zimuje w Polsce i chętnie odwiedza karmniki.", "Поедает вредителей деревьев; зимует в Польше и охотно прилетает к кормушкам.") },
  { icon: "🦅", name: r("Orzeł przedni", "Беркут"), text: r("Duży ptak drapieżny z hakowatym dziobem i silnymi szponami.", "Крупная хищная птица с крючковатым клювом и сильными когтями.") },
  { icon: "🦉", name: r("Puszczyk", "Серая неясыть"), text: r("Sowa polująca nocą dzięki doskonałemu słuchowi i bezszelestnemu lotowi.", "Сова, охотящаяся ночью благодаря отличному слуху и бесшумному полёту.") },
  { icon: "🪵", name: r("Dzięcioł duży", "Большой пёстрый дятел"), text: r("Kuje pnie w poszukiwaniu larw — „lekarz drzew”.", "Долбит стволы в поисках личинок — «лесной доктор».") },
  { icon: "🥚", name: r("Kukułka", "Кукушка"), text: r("Podrzuca jaja do gniazd innych ptaków, które wychowują jej pisklę.", "Подкладывает яйца в гнёзда других птиц, которые выкармливают её птенца."), tag: r("wędrowna", "перелётная") },
  { icon: "🐦", name: r("Jaskółka dymówka", "Деревенская ласточка"), text: r("Łowi owady w locie; gniazdo lepi z błota w stodołach.", "Ловит насекомых на лету; гнездо лепит из грязи в сараях."), tag: r("wędrowna", "перелётная") },
  { icon: "🦢", name: r("Łabędź niemy", "Лебедь-шипун"), text: r("Duży ptak wodny z białym upierzeniem i pomarańczowym dziobem.", "Крупная водоплавающая птица с белым оперением и оранжевым клювом.") },
  { icon: "🐔", name: r("Kura domowa", "Домашняя курица"), text: r("Ptak hodowlany dostarczający jaj i mięsa.", "Домашняя птица, дающая яйца и мясо.") },
  { icon: "🪶", name: r("Struś afrykański", "Африканский страус"), text: r("Największy żyjący ptak; nie lata, ale biega nawet 70 km/h.", "Самая крупная птица; не летает, но бегает со скоростью до 70 км/ч.") },
  { icon: "🐧", name: r("Pingwin", "Пингвин"), text: r("Nielot z półkuli południowej; skrzydła przekształciły się w płetwy.", "Нелетающая птица Южного полушария; крылья превратились в ласты.") },
];

const MIGRATION: SortItem[] = [
  { name: r("bocian biały", "белый аист"), group: 0, why: r("zimą brak żab i owadów — leci do Afryki", "зимой нет лягушек и насекомых — летит в Африку") },
  { name: r("sikora bogatka", "большая синица"), group: 1, why: r("zimą zjada nasiona i jaja owadów ukryte w korze", "зимой ест семена и яйца насекомых в коре") },
  { name: r("jaskółka dymówka", "деревенская ласточка"), group: 0, why: r("zimą nie ma latających owadów", "зимой нет летающих насекомых") },
  { name: r("dzięcioł duży", "большой пёстрый дятел"), group: 1, why: r("larwy pod korą i nasiona z szyszek są dostępne cały rok", "личинки под корой и семена шишек есть круглый год") },
  { name: r("kukułka", "кукушка"), group: 0, why: r("żywi się gąsienicami", "питается гусеницами") },
  { name: r("wróbel", "воробей"), group: 1, why: r("żyje blisko ludzi i zjada nasiona", "живёт рядом с людьми и ест семена") },
  { name: r("żuraw", "серый журавль"), group: 0, why: r("odlatuje kluczem do Afryki i południowej Europy", "улетает клином в Африку и на юг Европы") },
  { name: r("sroka", "сорока"), group: 1, why: r("je prawie wszystko", "ест почти всё") },
];

const FEEDER: SortItem[] = [
  { name: r("nasiona słonecznika", "семечки подсолнечника"), group: 0, why: r("tłuste i pożywne — ulubione przez sikory", "жирные и питательные — любимый корм синиц") },
  { name: r("chleb", "хлеб"), group: 1, why: r("pęcznieje w żołądku i szybko pleśnieje", "разбухает в желудке и быстро плесневеет") },
  { name: r("niesolona słonina", "несолёное сало"), group: 0, why: r("daje dużo energii w mróz", "даёт много энергии в мороз") },
  { name: r("solone orzeszki i chipsy", "солёные орешки и чипсы"), group: 1, why: r("sól szkodzi ptakom", "соль вредна птицам") },
  { name: r("dokarmianie przy mrozie i śniegu", "подкармливать в мороз и снег"), group: 0, why: r("wtedy ptakom najtrudniej znaleźć pokarm", "тогда птицам труднее всего найти еду") },
  { name: r("przyprawione resztki obiadu", "приправленные остатки обеда"), group: 1, why: r("przyprawy i tłuszcz smażony szkodzą", "специи и жареный жир вредны") },
  { name: r("regularne czyszczenie karmnika", "регулярно чистить кормушку"), group: 0, why: r("chroni ptaki przed chorobami", "защищает птиц от болезней") },
  { name: r("zacząć dokarmiać i nagle przerwać w środku zimy", "начать кормить и вдруг бросить посреди зимы"), group: 1, why: r("ptaki przyzwyczajają się do karmnika", "птицы привыкают к кормушке") },
];

const REMEMBER: Record<"s1" | "s2" | "s3", Txt[]> = {
  s1: [
    { pl: "Ptaki zjadają szkodniki, roznoszą nasiona i zapylają rośliny.", ru: "Птицы поедают вредителей, разносят семена и опыляют растения." },
    { pl: "Struś i pingwin to ptaki nieloty.", ru: "Страус и пингвин — нелетающие птицы." },
  ],
  s2: [{ pl: "Ptaki wędrowne odlatują na zimę, bo brakuje im pokarmu; osiadłe zostają.", ru: "Перелётные птицы улетают на зиму из-за нехватки пищи; оседлые остаются." }],
  s3: [{ pl: "Karmimy ptaki tylko zimą, regularnie, karmą bez soli i przypraw.", ru: "Птиц подкармливают только зимой, регулярно, кормом без соли и специй." }],
};

export default function BirdDiversityLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="birdd" sections={[T.s1, T.s2, T.s3]} />
      <Section id="birdd-s1" n={1} title={T.s1[lang]}>
        <SpeciesGallery lang={lang} items={SPECIES} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="birdd-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s2} groups={[T.leaves, T.stays]} items={MIGRATION} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="birdd-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={r("🏠 Co do karmnika?", "🏠 Что в кормушку?")} groups={[T.ok, T.notOk]} items={FEEDER} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
    </div>
  );
}
