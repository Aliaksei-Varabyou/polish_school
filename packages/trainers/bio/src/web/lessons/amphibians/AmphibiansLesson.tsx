// Lesson for §4.3 "Płazy – kręgowce wodno-lądowe" (Puls życia 6). Terms follow the task bank of the
// same paragraph (templates/data/sp6Vertebrates.ts, AMPHIBIANS).
import { TwoWaySort, type SortItem } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";
import { ColdBlood } from "./ColdBlood.tsx";
import { FrogMap } from "./FrogMap.tsx";
import { TadpoleGrowth } from "./TadpoleGrowth.tsx";

const T = {
  lead: {
    pl: "Płazy — żaby, ropuchy, traszki i salamandry — to pierwsze kręgowce, które wyszły na ląd. Nie opuściły jednak wody na dobre: rozmnażają się w niej, a ich młode, kijanki, żyją jak ryby. Stąd nazwa „kręgowce wodno-lądowe”.",
    ru: "Земноводные — лягушки, жабы, тритоны и саламандры — первые позвоночные, вышедшие на сушу. Но с водой они до конца не расстались: размножаются в ней, а их детёныши, головастики, живут как рыбы. Отсюда и название «земноводные».",
  },
  s1: { pl: "Jak zbudowana jest żaba", ru: "Как устроена лягушка" },
  s1intro: {
    pl: "Żaba jest przystosowana do dwóch środowisk naraz. Sprawdź, które części ciała pomagają jej w wodzie, a które na lądzie.",
    ru: "Лягушка приспособлена сразу к двум средам. Посмотри, какие части тела помогают ей в воде, а какие на суше.",
  },
  s2: { pl: "Od skrzeku do żaby", ru: "От икры до лягушки" },
  s2intro: {
    pl: "Rozwój płazów to przeobrażenie: larwa — kijanka — wygląda i żyje zupełnie inaczej niż dorosła żaba. Przesuwaj suwak i obserwuj, co się zmienia.",
    ru: "Развитие земноводных — это превращение (метаморфоз): личинка-головастик выглядит и живёт совсем не так, как взрослая лягушка. Двигай ползунок и следи, что меняется.",
  },
  s3: { pl: "Woda czy ląd?", ru: "Вода или суша?" },
  s3intro: {
    pl: "Każda cecha płaza to przystosowanie do jednego z jego dwóch domów. Do którego?",
    ru: "Каждый признак земноводного — приспособление к одному из двух его домов. К какому?",
  },
  s4: { pl: "Zmiennocieplność", ru: "Холоднокровность" },
  s4intro: {
    pl: "Płazy są zmiennocieplne: temperatura ich ciała zależy od otoczenia. Przesuń suwak przez cały rok i porównaj żabę z ptakiem.",
    ru: "Земноводные холоднокровны: температура их тела зависит от окружающей среды. Проведи ползунок через весь год и сравни лягушку с птицей.",
  },
  groupsTitle: { pl: "Do czego to przystosowanie?", ru: "К чему это приспособление?" },
  water: { pl: "do wody", ru: "к воде" },
  land: { pl: "do lądu", ru: "к суше" },
} satisfies Record<string, Txt>;

const SORT: SortItem[] = [
  { name: { pl: "błona pławna między palcami", ru: "плавательная перепонка между пальцами" }, group: 0, why: { pl: "działa jak płetwa", ru: "работает как ласт" } },
  { name: { pl: "płuca", ru: "лёгкие" }, group: 1, why: { pl: "pozwalają oddychać powietrzem", ru: "позволяют дышать воздухом" } },
  { name: { pl: "oczy i nozdrza na szczycie głowy", ru: "глаза и ноздри на макушке" }, group: 0, why: { pl: "żaba widzi i oddycha, prawie cała zanurzona", ru: "лягушка видит и дышит, почти целиком погрузившись" } },
  { name: { pl: "powieki", ru: "веки" }, group: 1, why: { pl: "chronią oczy przed wyschnięciem", ru: "защищают глаза от высыхания" } },
  { name: { pl: "skrzela kijanki", ru: "жабры головастика" }, group: 0, why: { pl: "pobierają tlen rozpuszczony w wodzie", ru: "поглощают растворённый в воде кислород" } },
  { name: { pl: "błona bębenkowa", ru: "барабанная перепонка" }, group: 1, why: { pl: "odbiera dźwięki niesione przez powietrze", ru: "улавливает звуки, идущие по воздуху" } },
  { name: { pl: "ogon kijanki", ru: "хвост головастика" }, group: 0, why: { pl: "napędza kijankę jak płetwa ogonowa ryby", ru: "двигает головастика, как хвостовой плавник рыбы" } },
  { name: { pl: "cztery kończyny z palcami", ru: "четыре конечности с пальцами" }, group: 1, why: { pl: "podpierają ciało i pozwalają chodzić i skakać", ru: "держат тело и позволяют ходить и прыгать" } },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Skóra płazów jest naga, wilgotna i pełna gruczołów śluzowych.", ru: "Кожа земноводных голая, влажная, с множеством слизистых желёз." },
    { pl: "Dorosłe płazy oddychają płucami i skórą.", ru: "Взрослые земноводные дышат лёгкими и кожей." },
    { pl: "Żaba ma błonę pławną, silne kończyny tylne i lepki język do chwytania owadów.", ru: "У лягушки есть плавательные перепонки, сильные задние ноги и липкий язык для ловли насекомых." },
  ],
  s2: [
    { pl: "Zapłodnienie u płazów jest zewnętrzne, w wodzie.", ru: "Оплодотворение у земноводных наружное, в воде." },
    { pl: "Rozwój: skrzek → kijanka → przeobrażenie → dorosły płaz.", ru: "Развитие: икра → головастик → превращение → взрослое земноводное." },
    { pl: "Kijanka oddycha skrzelami, ma ogon i linię boczną — jak ryba.", ru: "Головастик дышит жабрами, у него хвост и боковая линия — как у рыбы." },
  ],
  s3: [
    { pl: "Płazy żyją w wodzie i na lądzie, ale rozmnażają się w wodzie.", ru: "Земноводные живут в воде и на суше, но размножаются в воде." },
    { pl: "Naga skóra łatwo wysycha — dlatego płazy trzymają się wilgotnych miejsc.", ru: "Голая кожа легко высыхает — поэтому земноводные держатся сырых мест." },
  ],
  s4: [
    { pl: "Płazy są zmiennocieplne: temperatura ich ciała zmienia się razem z otoczeniem.", ru: "Земноводные холоднокровны: температура их тела меняется вместе с окружающей средой." },
    { pl: "Zimę przesypiają — zapadają w sen zimowy.", ru: "Зиму они пережидают в оцепенении — впадают в зимнюю спячку." },
  ],
};

export default function AmphibiansLesson({ lang }: LessonProps) {
  const sections = [T.s1, T.s2, T.s3, T.s4];
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="amphibians" sections={sections} />

      <Section id="amphibians-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <FrogMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="amphibians-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TadpoleGrowth lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="amphibians-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.groupsTitle} groups={[T.water, T.land]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="amphibians-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <ColdBlood lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
