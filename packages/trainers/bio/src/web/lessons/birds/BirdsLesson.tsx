// Lesson for §5.1 "Ptaki – kręgowce zdolne do lotu" (Puls życia 6). Terms follow the task bank of the
// same paragraph (templates/data/sp6Vertebrates.ts, BIRDS).
import { TwoWaySort, type SortItem } from "../games.tsx";
import { Remember, Section, type LessonProps, type Txt } from "../kit.tsx";
import { LessonIntro } from "../LessonIntro.tsx";
import { Beaks } from "./Beaks.tsx";
import { BirdMap } from "./BirdMap.tsx";
import { EggMap } from "./EggMap.tsx";
import { FlightBuilder } from "./FlightBuilder.tsx";

const T = {
  lead: {
    pl: "Ptaki to jedyne dziś żyjące zwierzęta pokryte piórami. Prawie wszystkie potrafią latać, a całe ich ciało — od kości po płuca — jest temu podporządkowane. Są stałocieplne i opiekują się swoim potomstwem.",
    ru: "Птицы — единственные ныне живущие животные, покрытые перьями. Почти все они умеют летать, и всё их тело — от костей до лёгких — подчинено полёту. Птицы теплокровны и заботятся о потомстве.",
  },
  s1: { pl: "Jak zbudowany jest ptak", ru: "Как устроена птица" },
  s1intro: {
    pl: "Zajrzyj nie tylko na zewnątrz: kości, mięśnie i płuca też pomagają w locie. Wnętrze pokażą przyciski „Kości pneumatyczne”, „Grzebień mostka” i „Worki powietrzne”.",
    ru: "Загляни не только снаружи: кости, мышцы и лёгкие тоже помогают летать. Внутреннее строение покажут кнопки «Пневматические кости», «Киль» и «Воздушные мешки».",
  },
  s2: { pl: "Zbuduj lotnika", ru: "Собери лётчика" },
  s2intro: {
    pl: "Żeby latać, trzeba być lekkim, mieć silny „silnik” i dużo energii. Włącz wszystkie przystosowania, a ptak wzbije się w powietrze.",
    ru: "Чтобы летать, нужно быть лёгким, иметь мощный «мотор» и много энергии. Включи все приспособления — и птица взлетит.",
  },
  s3: { pl: "Dziób dopasowany do pokarmu", ru: "Клюв по пище" },
  s3intro: {
    pl: "Ptaki nie mają zębów, więc ich narzędziem jest dziób. Po jego kształcie zgadniesz, czym ptak się żywi.",
    ru: "Зубов у птиц нет, поэтому их инструмент — клюв. По его форме можно угадать, чем птица питается.",
  },
  s4: { pl: "Jajo i pisklęta", ru: "Яйцо и птенцы" },
  s4intro: {
    pl: "Ptaki składają jaja z twardą skorupką i wysiadują je — ogrzewają ciepłem własnego ciała. Zobacz, co jest w środku jaja.",
    ru: "Птицы откладывают яйца с твёрдой скорлупой и насиживают их — согревают теплом своего тела. Посмотри, что внутри яйца.",
  },
  chicks: { pl: "Gniazdownik czy zagniazdownik?", ru: "Птенцовая или выводковая?" },
  chicksHint: {
    pl: "Pisklęta zagniazdowników wykluwają się pokryte puchem, z otwartymi oczami, i od razu chodzą za matką. Pisklęta gniazdowników są nagie i ślepe — rodzice długo karmią je w gnieździe.",
    ru: "Птенцы выводковых птиц вылупляются в пуху, с открытыми глазами и сразу ходят за матерью. Птенцы птенцовых птиц голые и слепые — родители долго кормят их в гнезде.",
  },
  nest: { pl: "gniazdownik", ru: "птенцовая" },
  away: { pl: "zagniazdownik", ru: "выводковая" },
} satisfies Record<string, Txt>;

const NAKED: Txt = { pl: "pisklęta nagie i ślepe, karmione w gnieździe", ru: "птенцы голые и слепые, их кормят в гнезде" };
const DOWNY: Txt = { pl: "pisklęta w puchu, od razu chodzą za matką", ru: "птенцы в пуху, сразу ходят за матерью" };

const CHICKS: SortItem[] = [
  { name: { pl: "kura domowa", ru: "домашняя курица" }, group: 1, why: DOWNY },
  { name: { pl: "sikora bogatka", ru: "большая синица" }, group: 0, why: NAKED },
  { name: { pl: "kaczka krzyżówka", ru: "кряква" }, group: 1, why: { pl: "pisklęta w puchu, zaraz po wykluciu pływają", ru: "птенцы в пуху, сразу после вылупления плавают" } },
  { name: { pl: "jaskółka dymówka", ru: "деревенская ласточка" }, group: 0, why: NAKED },
  { name: { pl: "czajka", ru: "чибис" }, group: 1, why: DOWNY },
  { name: { pl: "dzięcioł duży", ru: "большой пёстрый дятел" }, group: 0, why: { pl: "pisklęta nagie, wychowują się w dziupli", ru: "птенцы голые, растут в дупле" } },
  { name: { pl: "łabędź niemy", ru: "лебедь-шипун" }, group: 1, why: DOWNY },
  { name: { pl: "wróbel", ru: "воробей" }, group: 0, why: NAKED },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Ciało ptaka pokrywają pióra; kończyny przednie są przekształcone w skrzydła.", ru: "Тело птицы покрыто перьями; передние конечности превратились в крылья." },
    { pl: "Ptaki mają dziób bez zębów, nogi pokryte łuskami i gruczoł kuprowy.", ru: "У птиц клюв без зубов, ноги покрыты чешуйками, есть копчиковая железа." },
    { pl: "Kości pneumatyczne, grzebień mostka i worki powietrzne to przystosowania do lotu.", ru: "Пневматические кости, киль и воздушные мешки — приспособления к полёту." },
  ],
  s2: [
    { pl: "Lot ułatwia: lekkie ciało, opływowy kształt, silne mięśnie i sprawne oddychanie.", ru: "Полёту помогают: лёгкое тело, обтекаемая форма, сильные мышцы и эффективное дыхание." },
    { pl: "Ptaki są stałocieplne — mają ok. 40 °C.", ru: "Птицы теплокровны — около 40 °C." },
  ],
  s3: [
    { pl: "Kształt dzioba zależy od rodzaju pokarmu.", ru: "Форма клюва зависит от вида пищи." },
    { pl: "Pokarm rozciera żołądek mięśniowy, a ptaki ziarnożerne gromadzą go w wolu.", ru: "Пищу перетирает мускульный желудок, а зерноядные птицы запасают её в зобе." },
  ],
  s4: [
    { pl: "Zapłodnienie jest wewnętrzne; jaja mają wapienną skorupkę i są wysiadywane.", ru: "Оплодотворение внутреннее; яйца с известковой скорлупой, птицы их насиживают." },
    { pl: "Zarodek rozwija się z tarczki zarodkowej i odżywia się żółtkiem.", ru: "Зародыш развивается из зародышевого диска и питается желтком." },
    { pl: "Gniazdowniki: pisklęta nagie i ślepe. Zagniazdowniki: pisklęta w puchu, od razu samodzielnie chodzą.", ru: "Птенцовые: птенцы голые и слепые. Выводковые: птенцы в пуху и сразу ходят сами." },
  ],
};

export default function BirdsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="birds" sections={[T.s1, T.s2, T.s3, T.s4]} />

      <Section id="birds-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <BirdMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="birds-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <FlightBuilder lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="birds-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Beaks lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="birds-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <div className="space-y-6">
          <EggMap lang={lang} />
          <TwoWaySort lang={lang} title={T.chicks} hint={T.chicksHint} groups={[T.nest, T.away]} items={CHICKS} />
        </div>
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
