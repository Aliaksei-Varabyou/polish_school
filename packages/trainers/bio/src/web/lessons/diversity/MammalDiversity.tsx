// Lesson for §5.4 "Przegląd i znaczenie ssaków" (Puls życia 6). Species follow
// templates/data/sp6Vertebrates.ts (MAMMAL_SPECIES).
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import { MatchQuiz, SpeciesGallery, type QuizItem, type QuizOption, type Species } from "../games.tsx";
import { Remember, Section, type LessonProps, type Txt } from "../kit.tsx";
import { LessonIntro } from "../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Ssaki zamieszkały cały świat: ląd, wodę i powietrze. Najwięcej gatunków to gryzonie i nietoperze. Ssaki hodowlane dają nam mleko, mięso i wełnę, dzikie — regulują liczebność innych zwierząt. Wiele gatunków trzeba chronić.",
    "Млекопитающие заселили весь мир: сушу, воду и воздух. Больше всего видов среди грызунов и летучих мышей. Домашние млекопитающие дают нам молоко, мясо и шерсть, дикие — регулируют численность других животных. Многие виды нуждаются в охране.",
  ),
  s1: r("Poznaj ssaki", "Познакомься с млекопитающими"),
  s2: r("Do jakiej grupy?", "К какой группе?"),
  s2intro: r("Ssaki łożyskowe dzielimy na grupy według budowy i sposobu życia. Przypisz zwierzę do grupy.", "Плацентарных млекопитающих делят на группы по строению и образу жизни. Отнеси животное к группе."),
  s3: r("Jak uratowano żubra", "Как спасли зубра"),
  s3intro: r("Przesuń suwak po osi czasu i poznaj historię największego ssaka lądowego Europy.", "Подвигай ползунок по шкале времени и узнай историю самого крупного наземного млекопитающего Европы."),
} satisfies Record<string, Txt>;

const SPECIES: Species[] = [
  { icon: "🦆", name: r("Dziobak", "Утконос"), text: r("Australijski ssak, który składa jaja; ma dziób jak kaczka.", "Австралийское млекопитающее, откладывающее яйца; клюв как у утки.") },
  { icon: "🦘", name: r("Kangur rudy", "Рыжий кенгуру"), text: r("Torbacz — młode rozwija się w torbie na brzuchu matki.", "Сумчатое — детёныш развивается в сумке на животе матери.") },
  { icon: "🦇", name: r("Nietoperz", "Летучая мышь"), text: r("Jedyny latający ssak; w ciemności orientuje się za pomocą echolokacji.", "Единственное летающее млекопитающее; в темноте ориентируется эхолокацией."), tag: r("chroniony", "охраняется") },
  { icon: "🕳", name: r("Kret", "Крот"), text: r("Kopie korytarze łopatowatymi przednimi łapami i zjada larwy w glebie.", "Роет ходы лопатообразными передними лапами и ест личинок в почве."), tag: r("chroniony", "охраняется") },
  { icon: "🦔", name: r("Jeż", "Ёж"), text: r("Owadożerca z kolcami; zimą zapada w sen zimowy.", "Насекомоядное с иглами; зимой впадает в спячку."), tag: r("chroniony", "охраняется") },
  { icon: "🦫", name: r("Bóbr europejski", "Речной бобр"), text: r("Gryzoń budujący tamy i żeremia; zmienia całe doliny rzek.", "Грызун, строящий плотины и хатки; меняет целые речные долины.") },
  { icon: "🐺", name: r("Wilk", "Волк"), text: r("Drapieżnik polujący w watahach na jelenie i dziki; dba o zdrowie ich stad.", "Хищник, охотящийся стаей на оленей и кабанов; поддерживает здоровье их стад."), tag: r("chroniony", "охраняется") },
  { icon: "🐄", name: r("Krowa", "Корова"), text: r("Przeżuwacz hodowany dla mleka i mięsa.", "Жвачное животное, которое разводят ради молока и мяса.") },
  { icon: "🦬", name: r("Żubr", "Зубр"), text: r("Największy ssak lądowy Europy, uratowany przed wyginięciem w Puszczy Białowieskiej.", "Самое крупное наземное млекопитающее Европы, спасённое от вымирания в Беловежской пуще."), tag: r("chroniony", "охраняется") },
  { icon: "🦭", name: r("Foka szara", "Серый тюлень"), text: r("Ssak morski Bałtyku; jej kończyny przekształciły się w płetwy.", "Морское млекопитающее Балтики; конечности превратились в ласты."), tag: r("chroniony", "охраняется") },
  { icon: "🐋", name: r("Płetwal błękitny", "Синий кит"), text: r("Największe zwierzę na Ziemi; odcedza kryl przez fiszbiny.", "Самое большое животное на Земле; отцеживает криль через китовый ус.") },
];

const ORDERS: QuizOption[] = [
  { id: "insect", label: r("owadożerne", "насекомоядные") },
  { id: "rodent", label: r("gryzonie", "грызуны") },
  { id: "bat", label: r("nietoperze", "рукокрылые") },
  { id: "carnivore", label: r("drapieżne", "хищные") },
  { id: "hoofed", label: r("parzystokopytne", "парнокопытные") },
  { id: "whale", label: r("walenie", "китообразные") },
];

const ITEMS: QuizItem[] = [
  { icon: "🕳", name: r("kret", "крот"), answer: "insect", explain: r("Owadożerny — ma ostre, drobne zęby do chwytania owadów i dżdżownic.", "Насекомоядное — у него острые мелкие зубы для ловли насекомых и червей.") },
  { icon: "🦫", name: r("bóbr", "бобр"), answer: "rodent", explain: r("Gryzoń — ma rosnące całe życie siekacze.", "Грызун — у него растущие всю жизнь резцы.") },
  { icon: "🐗", name: r("dzik", "кабан"), answer: "hoofed", explain: r("Parzystokopytny — stoi na dwóch palcach zakończonych racicami.", "Парнокопытное — стоит на двух пальцах с копытцами.") },
  { icon: "🦇", name: r("mopek", "широкоух"), answer: "bat", explain: r("Nietoperz — kończyny przednie z błoną lotną.", "Летучая мышь — передние конечности с летательной перепонкой.") },
  { icon: "🦊", name: r("lis", "лиса"), answer: "carnivore", explain: r("Drapieżny — ma duże kły i zęby łamacze.", "Хищное — у него большие клыки и хищнические зубы.") },
  { icon: "🐬", name: r("morświn", "морская свинья"), answer: "whale", explain: r("Waleń żyjący w Bałtyku — oddycha powietrzem przez nozdrza na czubku głowy.", "Китообразное из Балтики — дышит воздухом через ноздрю на макушке.") },
  { icon: "🐿", name: r("wiewiórka", "белка"), answer: "rodent", explain: r("Gryzoń — rozgryza orzechy siekaczami.", "Грызун — разгрызает орехи резцами.") },
  { icon: "🦌", name: r("jeleń", "олень"), answer: "hoofed", explain: r("Parzystokopytny przeżuwacz.", "Парнокопытное жвачное.") },
];

const BISON: { year: string; text: Txt; count: number }[] = [
  { year: "XIX w.", text: r("Żubry żyją już tylko w Puszczy Białowieskiej i na Kaukazie. Giną z powodu polowań i wycinki lasów.", "Зубры остались только в Беловежской пуще и на Кавказе. Их истребляют охота и вырубка лесов."), count: 700 },
  { year: "1919", text: r("Kłusownik zabija ostatniego dzikiego żubra w Puszczy Białowieskiej. Na wolności gatunek wymiera.", "Браконьер убивает последнего дикого зубра в Беловежской пуще. На воле вид исчезает."), count: 0 },
  { year: "1929", text: r("Z kilku żubrów z ogrodów zoologicznych zaczyna się w Białowieży hodowla — restytucja gatunku.", "Из нескольких зубров из зоопарков в Беловеже начинают разведение — восстановление вида."), count: 5 },
  { year: "1952", text: r("Pierwsze żubry wracają z zagród na wolność do Puszczy Białowieskiej.", "Первые зубры из вольеров возвращаются на волю в Беловежскую пущу."), count: 60 },
  { year: "dziś / сегодня", text: r("W Polsce żyje ponad 2 tysiące żubrów — najwięcej na świecie. Żubr jest pod ścisłą ochroną.", "В Польше живёт больше 2 тысяч зубров — больше, чем где-либо в мире. Зубр под строгой охраной."), count: 2000 },
];

function Bison({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const step = BISON[i]!;
  const icons = Math.min(40, Math.ceil(step.count / 50));
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="flex min-h-[120px] flex-wrap content-start gap-0.5 rounded-xl bg-amber-50 p-3 text-xl ring-1 ring-amber-200" aria-hidden>
          {step.count === 0 ? <span className="text-sm text-amber-800">—</span> : Array.from({ length: Math.max(1, icons) }, (_, k) => <span key={k}>🦬</span>)}
        </div>
        <label className="mt-3 block text-sm font-semibold text-slate-700">
          <span className="text-amber-700">{step.year}</span>
          <input
            type="range"
            min={0}
            max={BISON.length - 1}
            value={i}
            onChange={(e) => setI(Number(e.target.value))}
            aria-valuetext={step.year}
            className="mt-2 h-2 w-full cursor-pointer accent-amber-600"
          />
        </label>
        <p className="mt-1 text-xs text-slate-500">{lang === "pl" ? "1 ikona ≈ 50 żubrów" : "1 значок ≈ 50 зубров"}</p>
      </div>
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-amber-950 ring-1 ring-amber-200" aria-live="polite">
        <span className="font-semibold">{step.year}.</span> {step.text[lang]}
      </p>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3", Txt[]> = {
  s1: [
    { pl: "Ssaki: stekowce (składają jaja), torbacze i łożyskowe.", ru: "Млекопитающие: однопроходные (откладывают яйца), сумчатые и плацентарные." },
    { pl: "Ssaki hodowlane dają mleko, mięso, wełnę i skóry.", ru: "Домашние млекопитающие дают молоко, мясо, шерсть и кожу." },
  ],
  s2: [{ pl: "Grupy ssaków łożyskowych: owadożerne, nietoperze, gryzonie, drapieżne, parzystokopytne, walenie i inne.", ru: "Группы плацентарных: насекомоядные, рукокрылые, грызуны, хищные, парнокопытные, китообразные и другие." }],
  s3: [{ pl: "Żubra uratowano dzięki hodowli w zagrodach i powrotowi na wolność (restytucja).", ru: "Зубра спасли благодаря разведению в вольерах и возвращению на волю (реинтродукция)." }],
};

export default function MammalDiversityLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="mammd" sections={[T.s1, T.s2, T.s3]} />
      <Section id="mammd-s1" n={1} title={T.s1[lang]}>
        <SpeciesGallery lang={lang} items={SPECIES} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="mammd-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={r("🐾 Grupa ssaków", "🐾 Группа млекопитающих")} question={r("Do jakiej grupy należy", "К какой группе относится")} options={ORDERS} items={ITEMS} wrongHint={r("spójrz na zęby i kończyny tego zwierzęcia.", "посмотри на зубы и конечности этого животного.")} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="mammd-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Bison lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
    </div>
  );
}
