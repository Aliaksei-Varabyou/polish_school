// Lesson for §5.3 "Ssaki – kręgowce, które karmią młode mlekiem" (Puls życia 6). Terms follow
// templates/data/sp6Vertebrates.ts (MAMMALS, MAMMAL_SPECIES).
import { MatchQuiz, type QuizItem, type QuizOption } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";
import { FoxMap } from "./FoxMap.tsx";
import { KeepWarm } from "./KeepWarm.tsx";
import { Teeth } from "./Teeth.tsx";

const T = {
  lead: {
    pl: "Ssaki żyją na lądzie, w wodzie i w powietrzu — od maleńkiej ryjówki po płetwala błękitnego, największe zwierzę na Ziemi. Łączy je to, że samice karmią młode mlekiem, mają sierść i są stałocieplne. Człowiek też jest ssakiem.",
    ru: "Млекопитающие живут на суше, в воде и в воздухе — от крошечной землеройки до синего кита, самого большого животного на Земле. Их объединяет то, что самки кормят детёнышей молоком, у них есть шерсть и постоянная температура тела. Человек — тоже млекопитающее.",
  },
  s1: { pl: "Cechy ssaków", ru: "Признаки млекопитающих" },
  s1intro: {
    pl: "Część cech widać od razu, inne są ukryte. Przyciski „Gruczoły mlekowe” i „Przepona” pokażą to, czego nie widać z zewnątrz.",
    ru: "Часть признаков видна сразу, другие скрыты. Кнопки «Молочные железы» и «Диафрагма» покажут то, чего не видно снаружи.",
  },
  s2: { pl: "Zęby zdradzają pokarm", ru: "Зубы выдают пищу" },
  s2intro: {
    pl: "Porównaj uzębienie drapieżnika, roślinożerców i wszystkożercy.",
    ru: "Сравни зубы хищника, растительноядных и всеядного.",
  },
  s3: { pl: "Stałe 37 °C", ru: "Всегда 37 °C" },
  s3intro: {
    pl: "Ssaki są stałocieplne. Zmień temperaturę powietrza i zobacz, jak ciało utrzymuje swoją.",
    ru: "Млекопитающие теплокровны. Поменяй температуру воздуха и посмотри, как тело сохраняет свою.",
  },
  s4: { pl: "Jak rodzą się ssaki", ru: "Как появляются на свет млекопитающие" },
  s4intro: {
    pl: "Większość ssaków rodzi młode, ale są wyjątki. Wszystkie jednak karmią młode mlekiem.",
    ru: "Большинство млекопитающих рождают детёнышей, но бывают исключения. Но молоком кормят все.",
  },
} satisfies Record<string, Txt>;

const GROUPS: QuizOption[] = [
  { id: "egg", label: { pl: "stekowce — składają jaja", ru: "однопроходные — откладывают яйца" } },
  { id: "pouch", label: { pl: "torbacze — młode rośnie w torbie", ru: "сумчатые — детёныш растёт в сумке" } },
  { id: "placenta", label: { pl: "łożyskowce — płód odżywia łożysko", ru: "плацентарные — плод питается через плаценту" } },
];

const ITEMS: QuizItem[] = [
  { icon: "🦆", name: { pl: "dziobak", ru: "утконос" }, answer: "egg", explain: { pl: "Dziobak składa jaja, a wyklute młode liże mleko z futra matki.", ru: "Утконос откладывает яйца, а вылупившиеся детёныши слизывают молоко с шерсти матери." } },
  { icon: "🦘", name: { pl: "kangur rudy", ru: "рыжий кенгуру" }, answer: "pouch", explain: { pl: "Malutki, wielkości fasolki noworodek wędruje do torby i tam ssie mleko przez kilka miesięcy.", ru: "Крошечный, размером с фасолину новорождённый забирается в сумку и там несколько месяцев сосёт молоко." } },
  { icon: "🦇", name: { pl: "nietoperz", ru: "летучая мышь" }, answer: "placenta", explain: { pl: "Nietoperz to ssak łożyskowy — jedyny ssak, który naprawdę lata.", ru: "Летучая мышь — плацентарное, единственное млекопитающее, которое по-настоящему летает." } },
  { icon: "🐨", name: { pl: "koala", ru: "коала" }, answer: "pouch", explain: { pl: "Koala to australijski torbacz, nie miś!", ru: "Коала — австралийское сумчатое, а не медведь!" } },
  { icon: "🐋", name: { pl: "płetwal błękitny", ru: "синий кит" }, answer: "placenta", explain: { pl: "Wieloryby to łożyskowe ssaki morskie: młode rodzi się w wodzie i ssie mleko matki.", ru: "Киты — плацентарные морские млекопитающие: детёныш рождается в воде и сосёт молоко матери." } },
  { icon: "🦔", name: { pl: "kolczatka australijska", ru: "австралийская ехидна" }, answer: "egg", explain: { pl: "Kolczatka, jak dziobak, jest stekowcem — znosi jajo do torby lęgowej.", ru: "Ехидна, как и утконос, однопроходное — откладывает яйцо в выводковую сумку." } },
  { icon: "🧒", name: { pl: "człowiek", ru: "человек" }, answer: "placenta", explain: { pl: "Człowiek jest ssakiem łożyskowym: płód rozwija się w macicy, a łożysko dostarcza mu tlen i pokarm.", ru: "Человек — плацентарное млекопитающее: плод развивается в матке, а плацента доставляет ему кислород и питание." } },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Tylko ssaki mają sierść, gruczoły mlekowe i małżowiny uszne.", ru: "Только у млекопитающих есть шерсть, молочные железы и ушные раковины." },
    { pl: "W skórze ssaków są gruczoły potowe, łojowe i mlekowe.", ru: "В коже млекопитающих есть потовые, сальные и молочные железы." },
    { pl: "Przepona oddziela klatkę piersiową od jamy brzusznej; serce jest czterodziałowe.", ru: "Диафрагма отделяет грудную полость от брюшной; сердце четырёхкамерное." },
  ],
  s2: [
    { pl: "Zęby ssaków: siekacze, kły, przedtrzonowce i trzonowce.", ru: "Зубы млекопитающих: резцы, клыки, малые и большие коренные." },
    { pl: "Drapieżniki mają duże kły, roślinożercy — szerokie trzonowce, gryzonie — rosnące całe życie siekacze.", ru: "У хищников большие клыки, у растительноядных — широкие коренные, у грызунов — растущие всю жизнь резцы." },
  ],
  s3: [{ pl: "Ssaki są stałocieplne — temperatura ich ciała to ok. 37 °C.", ru: "Млекопитающие теплокровны — температура их тела около 37 °C." }],
  s4: [
    { pl: "Zapłodnienie u ssaków jest wewnętrzne.", ru: "Оплодотворение у млекопитающих внутреннее." },
    { pl: "Większość ssaków to ssaki łożyskowe: płód rozwija się w ciele matki i odżywia przez łożysko.", ru: "Большинство млекопитающих — плацентарные: плод развивается в теле матери и питается через плаценту." },
  ],
};

export default function MammalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="mammals" sections={[T.s1, T.s2, T.s3, T.s4]} />

      <Section id="mammals-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <FoxMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="mammals-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Teeth lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="mammals-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <KeepWarm lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="mammals-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={{ pl: "🍼 Do której grupy należy", ru: "🍼 К какой группе относится" }}
          question={{ pl: "Jak rozmnaża się", ru: "Как размножается" }}
          options={GROUPS}
          items={ITEMS}
          wrongHint={{ pl: "nie ta grupa. Pomyśl: jajo, torba czy łożysko?", ru: "не та группа. Подумай: яйцо, сумка или плацента?" }}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
