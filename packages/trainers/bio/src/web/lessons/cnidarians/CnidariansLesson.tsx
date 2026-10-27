// Lesson for §2.1 "Parzydełkowce – najprostsze zwierzęta tkankowe" (Puls życia 6). Terms follow
// templates/data/sp6Invertebrates.ts (CNIDARIANS).
import { TwoWaySort, type SortItem } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";
import { HydraMap } from "./HydraMap.tsx";
import { Stinger } from "./Stinger.tsx";
import { Symmetry } from "./Symmetry.tsx";

const T = {
  lead: {
    pl: "Parzydełkowce to stułbie, meduzy, ukwiały i koralowce. Żyją w wodzie, prawie wszystkie w morzach. Są najprostszymi zwierzętami tkankowymi: ich ciało ma tylko dwie warstwy komórek i jedną jamę z jednym otworem. Za to mają broń, której nie ma nikt inny — komórki parzydełkowe.",
    ru: "Кишечнополостные (стрекающие) — это гидры, медузы, актинии и кораллы. Они живут в воде, почти все — в морях. Это простейшие тканевые животные: тело из двух слоёв клеток и одна полость с одним отверстием. Зато у них есть оружие, которого нет ни у кого больше, — стрекательные клетки.",
  },
  s1: { pl: "Jak zbudowana jest stułbia", ru: "Как устроена гидра" },
  s1intro: {
    pl: "Stułbia ma ok. 1 cm i żyje w stawach i jeziorach, przyczepiona do roślin. Dotknij jej ciała, żeby zajrzeć do środka.",
    ru: "Гидра длиной около 1 см живёт в прудах и озёрах, прикрепившись к растениям. Нажми на её тело, чтобы заглянуть внутрь.",
  },
  s2: { pl: "Strzał komórki parzydełkowej", ru: "Выстрел стрекательной клетки" },
  s2intro: {
    pl: "Zobacz w zbliżeniu, jak stułbia poluje na rozwielitkę.",
    ru: "Посмотри крупным планом, как гидра охотится на дафнию.",
  },
  s3: { pl: "Polip czy meduza?", ru: "Полип или медуза?" },
  s3intro: {
    pl: "Parzydełkowce występują w dwóch postaciach: osiadłego polipa i pływającej meduzy. Rozpoznaj je po cechach.",
    ru: "Кишечнополостные бывают в двух формах: прикреплённый полип и плавающая медуза. Различи их по признакам.",
  },
  s4: { pl: "Symetria promienista", ru: "Радиальная симметрия" },
  s4intro: {
    pl: "Obracaj linię przez środek ciała. Ile razy podzieli zwierzę na dwie lustrzane połowy?",
    ru: "Поворачивай линию через центр тела. Сколько раз она разделит животное на две зеркальные половинки?",
  },
  polyp: { pl: "polip", ru: "полип" },
  medusa: { pl: "meduza", ru: "медуза" },
} satisfies Record<string, Txt>;

const POLYP: Txt = { pl: "polip żyje przyczepiony", ru: "полип живёт прикреплённым" };
const SORT: SortItem[] = [
  { name: { pl: "przyczepiony do podłoża", ru: "прикреплён ко дну или предметам" }, group: 0, why: POLYP },
  { name: { pl: "swobodnie pływa w toni wodnej", ru: "свободно плавает в толще воды" }, group: 1, why: { pl: "meduza pływa, kurcząc parasol", ru: "медуза плавает, сокращая купол" } },
  { name: { pl: "otwór gębowy skierowany w górę", ru: "рот направлен вверх" }, group: 0, why: { pl: "czułki łowią pokarm nad polipem", ru: "щупальца ловят пищу над полипом" } },
  { name: { pl: "otwór gębowy skierowany w dół", ru: "рот направлен вниз" }, group: 1, why: { pl: "pod parasolem meduzy", ru: "под куполом медузы" } },
  { name: { pl: "kształt parasola lub dzwonu", ru: "форма зонтика или колокола" }, group: 1, why: { pl: "typowy kształt meduzy", ru: "типичная форма медузы" } },
  { name: { pl: "stułbia", ru: "гидра" }, group: 0, why: POLYP },
  { name: { pl: "chełbia modra z Bałtyku", ru: "аурелия из Балтийского моря" }, group: 1, why: { pl: "najpospolitsza meduza Bałtyku", ru: "самая обычная медуза Балтики" } },
  { name: { pl: "koralowce budujące rafy", ru: "кораллы, строящие рифы" }, group: 0, why: { pl: "polipy żyjące w koloniach", ru: "полипы, живущие колониями" } },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Ciało parzydełkowca: dwie warstwy komórek i jama chłonąco-trawiąca z jednym otworem.", ru: "Тело кишечнополостного: два слоя клеток и кишечная полость с одним отверстием." },
    { pl: "Stułbia rozmnaża się bezpłciowo przez pączkowanie.", ru: "Гидра размножается бесполым путём — почкованием." },
  ],
  s2: [{ pl: "Komórki parzydełkowe służą do chwytania ofiar i obrony.", ru: "Стрекательные клетки служат для ловли добычи и защиты." }],
  s3: [
    { pl: "Dwie postacie: polip (osiadły, otwór gębowy w górę) i meduza (pływa, otwór gębowy w dół).", ru: "Две формы: полип (прикреплён, рот вверх) и медуза (плавает, рот вниз)." },
    { pl: "Koralowce tworzą kolonie i budują wapienne rafy.", ru: "Коралловые полипы образуют колонии и строят известковые рифы." },
  ],
  s4: [
    { pl: "Parzydełkowce mają symetrię promienistą — przez ich ciało przechodzi wiele płaszczyzn symetrii.", ru: "У кишечнополостных радиальная симметрия — через их тело проходит много плоскостей симметрии." },
    { pl: "Robaki, np. wypławek, mają symetrię dwuboczną — tylko jedną płaszczyznę.", ru: "У червей, например планарии, двусторонняя симметрия — всего одна плоскость." },
  ],
};

export default function CnidariansLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="cnidarians" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="cnidarians-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <HydraMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="cnidarians-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Stinger lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="cnidarians-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={{ pl: "Do której postaci pasuje?", ru: "К какой форме подходит?" }} groups={[T.polyp, T.medusa]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="cnidarians-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Symmetry lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
