// Lesson for §1.1 "W królestwie zwierząt" (Puls życia 6). Terms follow
// templates/data/sp6Invertebrates.ts (KINGDOM).
import { Symmetry } from "../cnidarians/Symmetry.tsx";
import { MatchQuiz, TwoWaySort, type QuizItem, type QuizOption, type SortItem } from "../games.tsx";
import { Remember, Section, type LessonProps, type Txt } from "../kit.tsx";
import { LessonIntro } from "../LessonIntro.tsx";

const T = {
  lead: {
    pl: "Zwierzęta to ogromne królestwo: od gąbek i robaków po ptaki i ssaki. Łączy je to, że są cudzożywne — nie wytwarzają same pokarmu jak rośliny, tylko zjadają gotowy — i że zbudowane są z wielu komórek. Większość z nich potrafi się aktywnie poruszać.",
    ru: "Животные — огромное царство: от губок и червей до птиц и млекопитающих. Их объединяет то, что они гетеротрофы — не производят пищу сами, как растения, а поедают готовую, — и что они многоклеточные. Большинство из них способно активно передвигаться.",
  },
  s1: { pl: "Zwierzę czy nie?", ru: "Животное или нет?" },
  s1intro: {
    pl: "Niektóre zwierzęta wyglądają jak rośliny, a niektóre rośliny polują jak zwierzęta. Zdecyduj, kto należy do królestwa zwierząt.",
    ru: "Некоторые животные похожи на растения, а некоторые растения охотятся, как животные. Реши, кто относится к царству животных.",
  },
  s2: { pl: "Kręgowce i bezkręgowce", ru: "Позвоночные и беспозвоночные" },
  s2intro: {
    pl: "Zwierzęta dzielimy na dwie wielkie grupy — według tego, czy mają kręgosłup.",
    ru: "Животных делят на две большие группы — по тому, есть ли у них позвоночник.",
  },
  s3: { pl: "Symetria ciała", ru: "Симметрия тела" },
  s3intro: {
    pl: "Budowę zwierząt opisuje się też przez symetrię. Obracaj linię i szukaj płaszczyzn, które dzielą ciało na lustrzane połowy.",
    ru: "Строение животных описывают и через симметрию. Поворачивай линию и ищи плоскости, которые делят тело на зеркальные половинки.",
  },
  s4: { pl: "Czym się żywi?", ru: "Чем питается?" },
  s4intro: {
    pl: "Zwierzęta zdobywają pokarm na różne sposoby. Przypisz każde do właściwej grupy.",
    ru: "Животные добывают пищу по-разному. Отнеси каждое к нужной группе.",
  },
  animal: { pl: "zwierzę", ru: "животное" },
  notAnimal: { pl: "nie zwierzę", ru: "не животное" },
  vertebrate: { pl: "kręgowiec", ru: "позвоночное" },
  invertebrate: { pl: "bezkręgowiec", ru: "беспозвоночное" },
} satisfies Record<string, Txt>;

const ANIMAL_OR_NOT: SortItem[] = [
  { name: { pl: "gąbka morska", ru: "морская губка" }, group: 0, why: { pl: "najprostsze zwierzę: odfiltrowuje pokarm z wody", ru: "простейшее животное: отфильтровывает пищу из воды" } },
  { name: { pl: "rosiczka, która łapie owady", ru: "росянка, ловящая насекомых" }, group: 1, why: { pl: "to roślina — ma chlorofil i sama wytwarza pokarm", ru: "это растение — у неё есть хлорофилл и она сама производит пищу" } },
  { name: { pl: "ukwiał, podobny do kwiatu", ru: "актиния, похожая на цветок" }, group: 0, why: { pl: "polip parzydełkowca, poluje czułkami", ru: "полип кишечнополостных, охотится щупальцами" } },
  { name: { pl: "borowik", ru: "белый гриб" }, group: 1, why: { pl: "grzyb — osobne królestwo", ru: "гриб — отдельное царство" } },
  { name: { pl: "koralowiec", ru: "коралловый полип" }, group: 0, why: { pl: "kolonia polipów, choć wygląda jak kamień", ru: "колония полипов, хотя похожа на камень" } },
  { name: { pl: "mech", ru: "мох" }, group: 1, why: { pl: "roślina", ru: "растение" } },
  { name: { pl: "stułbia", ru: "гидра" }, group: 0, why: { pl: "parzydełkowiec — zwierzę tkankowe", ru: "кишечнополостное — тканевое животное" } },
  { name: { pl: "drożdże", ru: "дрожжи" }, group: 1, why: { pl: "jednokomórkowe grzyby", ru: "одноклеточные грибы" } },
];

const SPINE: SortItem[] = [
  { name: { pl: "żaba", ru: "лягушка" }, group: 0, why: { pl: "płaz", ru: "земноводное" } },
  { name: { pl: "ślimak winniczek", ru: "виноградная улитка" }, group: 1, why: { pl: "mięczak", ru: "моллюск" } },
  { name: { pl: "rekin", ru: "акула" }, group: 0, why: { pl: "ryba — ma kręgosłup z chrząstki", ru: "рыба — позвоночник из хряща" } },
  { name: { pl: "pająk", ru: "паук" }, group: 1, why: { pl: "stawonóg ze szkieletem zewnętrznym", ru: "членистоногое с наружным скелетом" } },
  { name: { pl: "wąż", ru: "змея" }, group: 0, why: { pl: "gad z bardzo długim kręgosłupem", ru: "пресмыкающееся с очень длинным позвоночником" } },
  { name: { pl: "ośmiornica", ru: "осьминог" }, group: 1, why: { pl: "głowonóg — mięczak bez szkieletu", ru: "головоногий моллюск без скелета" } },
  { name: { pl: "nietoperz", ru: "летучая мышь" }, group: 0, why: { pl: "ssak", ru: "млекопитающее" } },
  { name: { pl: "dżdżownica", ru: "дождевой червь" }, group: 1, why: { pl: "pierścienica", ru: "кольчатый червь" } },
];

const DIETS: QuizOption[] = [
  { id: "herb", label: { pl: "roślinożerca", ru: "растительноядное" } },
  { id: "pred", label: { pl: "drapieżnik", ru: "хищник" } },
  { id: "omni", label: { pl: "wszystkożerca", ru: "всеядное" } },
  { id: "para", label: { pl: "pasożyt", ru: "паразит" } },
];

const FEEDERS: QuizItem[] = [
  { icon: "🦌", name: { pl: "sarna", ru: "косуля" }, answer: "herb", explain: { pl: "Je trawy, liście i pędy.", ru: "Ест траву, листья и побеги." } },
  { icon: "🐺", name: { pl: "wilk", ru: "волк" }, answer: "pred", explain: { pl: "Poluje na jelenie i dziki.", ru: "Охотится на оленей и кабанов." } },
  { icon: "🐗", name: { pl: "dzik", ru: "кабан" }, answer: "omni", explain: { pl: "Je żołędzie, korzenie, ale też larwy i myszy.", ru: "Ест жёлуди и корни, но и личинок, и мышей." } },
  { icon: "🕷", name: { pl: "kleszcz", ru: "клещ" }, answer: "para", explain: { pl: "Żywi się krwią żywiciela, szkodząc mu.", ru: "Питается кровью хозяина, вредя ему." } },
  { icon: "🦉", name: { pl: "sowa", ru: "сова" }, answer: "pred", explain: { pl: "Nocą poluje na gryzonie.", ru: "Ночью охотится на грызунов." } },
  { icon: "🐻", name: { pl: "niedźwiedź brunatny", ru: "бурый медведь" }, answer: "omni", explain: { pl: "Je jagody, korzenie, miód, ryby i mięso.", ru: "Ест ягоды, корни, мёд, рыбу и мясо." } },
  { icon: "🐇", name: { pl: "zając", ru: "заяц" }, answer: "herb", explain: { pl: "Zjada trawę, korę i pędy.", ru: "Ест траву, кору и побеги." } },
  { icon: "🪱", name: { pl: "tasiemiec", ru: "цепень" }, answer: "para", explain: { pl: "Żyje w jelicie żywiciela i wchłania jego pokarm.", ru: "Живёт в кишечнике хозяина и всасывает его пищу." } },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Zwierzęta są wielokomórkowe i cudzożywne: pobierają gotowy pokarm.", ru: "Животные многоклеточные и гетеротрофные: получают готовую пищу." },
    { pl: "Grzyby i rośliny to osobne królestwa.", ru: "Грибы и растения — отдельные царства." },
  ],
  s2: [
    { pl: "Kręgowce mają szkielet wewnętrzny z kręgosłupem; bezkręgowce go nie mają.", ru: "У позвоночных внутренний скелет с позвоночником; у беспозвоночных его нет." },
    { pl: "Bezkręgowce stanowią większość gatunków zwierząt.", ru: "Беспозвоночные составляют большинство видов животных." },
  ],
  s3: [
    { pl: "Symetria promienista — wiele płaszczyzn (np. stułbia); dwuboczna — jedna płaszczyzna (np. robaki, kręgowce).", ru: "Радиальная симметрия — много плоскостей (например, гидра); двусторонняя — одна плоскость (черви, позвоночные)." },
  ],
  s4: [
    { pl: "Roślinożercy, drapieżniki, wszystkożercy i pasożyty to różne sposoby zdobywania pokarmu.", ru: "Растительноядные, хищники, всеядные и паразиты — разные способы добывать пищу." },
    { pl: "Zwierzęta zmiennocieplne mają temperaturę zależną od otoczenia, stałocieplne (ptaki, ssaki) — stałą.", ru: "У холоднокровных температура зависит от среды, у теплокровных (птицы, млекопитающие) она постоянна." },
  ],
};

export default function KingdomLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="kingdom" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="kingdom-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s1} groups={[T.animal, T.notAnimal]} items={ANIMAL_OR_NOT} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="kingdom-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={{ pl: "Ma kręgosłup?", ru: "Есть позвоночник?" }} groups={[T.vertebrate, T.invertebrate]} items={SPINE} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="kingdom-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Symmetry lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="kingdom-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={{ pl: "🍽 Sposób odżywiania", ru: "🍽 Способ питания" }}
          question={{ pl: "Jak odżywia się", ru: "Как питается" }}
          options={DIETS}
          items={FEEDERS}
          wrongHint={{ pl: "to nie ta grupa. Pomyśl, czym to zwierzę się żywi.", ru: "не та группа. Подумай, чем питается это животное." }}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
