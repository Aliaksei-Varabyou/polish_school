// Lesson for §1.2 "Tkanki: nabłonkowa, mięśniowa i nerwowa" and §1.3 "Tkanka łączna" (Puls życia 6) —
// one lesson for both, since the four tissue groups only make sense side by side. Terms follow
// templates/data/sp6Invertebrates.ts (TISSUES6, CONNECTIVE).
import { MatchQuiz, type QuizItem } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";
import { BloodMap } from "./BloodMap.tsx";
import { Neuron } from "./Neuron.tsx";
import { GROUPS, TissueScope } from "./TissueScope.tsx";

const T = {
  lead: {
    pl: "Ciało zwierzęcia zbudowane jest z komórek, ale komórki nie są rozrzucone byle jak. Podobne komórki, które wykonują tę samą pracę, tworzą tkankę. U zwierząt wyróżniamy cztery rodzaje tkanek: nabłonkową, mięśniową, nerwową i łączną.",
    ru: "Тело животного состоит из клеток, но клетки не разбросаны как попало. Похожие клетки, выполняющие одну работу, образуют ткань. У животных различают четыре типа тканей: эпителиальную, мышечную, нервную и соединительную.",
  },
  s1: { pl: "Tkanki pod mikroskopem", ru: "Ткани под микроскопом" },
  s1intro: {
    pl: "Każda tkanka wygląda inaczej, bo inaczej pracuje. Porównaj ułożenie komórek: ciasno jak płytki, długie włókna, komórki z wypustkami albo komórki zanurzone w substancji międzykomórkowej.",
    ru: "Каждая ткань выглядит по-своему, потому что по-своему работает. Сравни, как лежат клетки: плотно, как плитка, длинными волокнами, клетками с отростками или клетками, погружёнными в межклеточное вещество.",
  },
  s2: { pl: "Neuron — komórka nerwowa", ru: "Нейрон — нервная клетка" },
  s2intro: {
    pl: "Tkanka nerwowa zbudowana jest z neuronów. Poznaj części neuronu i zobacz, w którą stronę biegnie impuls.",
    ru: "Нервная ткань состоит из нейронов. Познакомься с частями нейрона и посмотри, в какую сторону бежит импульс.",
  },
  s3: { pl: "Krew — płynna tkanka łączna", ru: "Кровь — жидкая соединительная ткань" },
  s3intro: {
    pl: "Krew to też tkanka łączna: jej substancją międzykomórkową jest płynne osocze.",
    ru: "Кровь — тоже соединительная ткань: её межклеточное вещество — жидкая плазма.",
  },
  s4: { pl: "Jaka to tkanka?", ru: "Какая это ткань?" },
  s4intro: {
    pl: "Sprawdź się: po tym, gdzie tkanka leży i co robi, rozpoznaj jej rodzaj.",
    ru: "Проверь себя: по тому, где находится ткань и что она делает, определи её тип.",
  },
} satisfies Record<string, Txt>;

const OPTIONS = (Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => ({ id: g, label: GROUPS[g] }));

const ITEMS: QuizItem[] = [
  { icon: "🧤", name: { pl: "okrywa ciało i chroni je przed drobnoustrojami", ru: "покрывает тело и защищает от микробов" }, answer: "epithelial", explain: { pl: "To tkanka nabłonkowa — np. naskórek.", ru: "Это эпителиальная ткань — например, наружный слой кожи." } },
  { icon: "🏃", name: { pl: "porusza kośćmi, gdy biegniesz", ru: "двигает кости, когда ты бежишь" }, answer: "muscle", explain: { pl: "To tkanka mięśniowa szkieletowa — kurczy się zależnie od woli.", ru: "Это скелетная мышечная ткань — сокращается по нашей воле." } },
  { icon: "❤️", name: { pl: "kurczy się rytmicznie przez całe życie", ru: "ритмично сокращается всю жизнь" }, answer: "muscle", explain: { pl: "To tkanka mięśniowa sercowa.", ru: "Это сердечная мышечная ткань." } },
  { icon: "⚡", name: { pl: "przewodzi impulsy z oka do mózgu", ru: "проводит импульсы от глаза к мозгу" }, answer: "nerve", explain: { pl: "To tkanka nerwowa — zbudowana z neuronów.", ru: "Это нервная ткань — она состоит из нейронов." } },
  { icon: "👂", name: { pl: "buduje sprężystą małżowinę uszną", ru: "образует упругую ушную раковину" }, answer: "connective", explain: { pl: "To tkanka łączna chrzęstna.", ru: "Это хрящевая соединительная ткань." } },
  { icon: "🩸", name: { pl: "rozwozi tlen po całym ciele", ru: "разносит кислород по всему телу" }, answer: "connective", explain: { pl: "To krew — płynna tkanka łączna.", ru: "Это кровь — жидкая соединительная ткань." } },
  { icon: "🥣", name: { pl: "wydziela ślinę i soki trawienne", ru: "выделяет слюну и пищеварительные соки" }, answer: "epithelial", explain: { pl: "To nabłonek gruczołowy — rodzaj tkanki nabłonkowej.", ru: "Это железистый эпителий — разновидность эпителиальной ткани." } },
  { icon: "🧥", name: { pl: "chroni przed zimnem i magazynuje energię", ru: "защищает от холода и запасает энергию" }, answer: "connective", explain: { pl: "To tkanka tłuszczowa — rodzaj tkanki łącznej.", ru: "Это жировая ткань — разновидность соединительной." } },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Tkanka to grupa podobnych komórek, które wykonują tę samą funkcję.", ru: "Ткань — группа похожих клеток, выполняющих одну функцию." },
    { pl: "Nabłonkowa okrywa i wyściela; mięśniowa kurczy się; nerwowa przewodzi impulsy; łączna łączy, podpiera i transportuje.", ru: "Эпителиальная покрывает и выстилает; мышечная сокращается; нервная проводит импульсы; соединительная соединяет, поддерживает и переносит." },
    { pl: "Mięśnie: gładkie (niezależne od woli), szkieletowe (zależne od woli), sercowe (rytmiczne, bez zmęczenia).", ru: "Мышцы: гладкие (непроизвольные), скелетные (произвольные), сердечная (ритмичная, без утомления)." },
  ],
  s2: [
    { pl: "Neuron: ciało komórki, dendryty i akson.", ru: "Нейрон: тело клетки, дендриты и аксон." },
    { pl: "Dendryty doprowadzają impuls do ciała neuronu, akson go odprowadza.", ru: "Дендриты проводят импульс к телу нейрона, аксон — от него." },
  ],
  s3: [
    { pl: "Krew: osocze + czerwone krwinki + białe krwinki + płytki krwi.", ru: "Кровь: плазма + эритроциты + лейкоциты + тромбоциты." },
    { pl: "Czerwone krwinki niosą tlen, białe bronią, płytki pomagają w krzepnięciu.", ru: "Эритроциты несут кислород, лейкоциты защищают, тромбоциты помогают свёртыванию." },
  ],
  s4: [
    { pl: "W tkance łącznej jest dużo substancji międzykomórkowej: twardej (kość), sprężystej (chrząstka) albo płynnej (krew).", ru: "В соединительной ткани много межклеточного вещества: твёрдого (кость), упругого (хрящ) или жидкого (кровь)." },
  ],
};

export default function TissuesLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="tissues" sections={[T.s1, T.s2, T.s3, T.s4]} />

      <Section id="tissues-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <TissueScope lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="tissues-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Neuron lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="tissues-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <BloodMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="tissues-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={{ pl: "🔬 Rozpoznaj tkankę", ru: "🔬 Определи ткань" }}
          question={{ pl: "Jaka tkanka", ru: "Какая ткань" }}
          options={OPTIONS}
          items={ITEMS}
          wrongHint={{
            pl: "to nie ta. Zapytaj siebie: czy okrywa, kurczy się, przewodzi impulsy, czy łączy i podpiera?",
            ru: "не она. Спроси себя: покрывает, сокращается, проводит импульсы или соединяет и поддерживает?",
          }}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
