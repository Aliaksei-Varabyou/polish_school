// Lesson for §4.1 "Ryby – kręgowce środowisk wodnych" (Puls życia 6). Terms follow
// templates/data/sp6Vertebrates.ts (FISH).
import { MatchQuiz, type QuizItem, type QuizOption } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";
import { FishMap } from "./FishMap.tsx";
import { Buoyancy, GillsFlow } from "./FishWater.tsx";

const T = {
  lead: {
    pl: "Ryby to najstarsze i najliczniejsze kręgowce. Całe życie spędzają w wodzie — słodkiej albo słonej — i wszystko w ich budowie jest do tego przystosowane: kształt ciała, płetwy, skrzela i zmysły.",
    ru: "Рыбы — самые древние и самые многочисленные позвоночные. Всю жизнь они проводят в воде — пресной или солёной, — и всё в их строении к этому приспособлено: форма тела, плавники, жабры и органы чувств.",
  },
  s1: { pl: "Jak zbudowana jest ryba", ru: "Как устроена рыба" },
  s1intro: {
    pl: "Dotykaj kolejnych części. Przyciski „Skrzela” i „Pęcherz pławny” pokażą to, co ukryte w środku.",
    ru: "Нажимай на части по очереди. Кнопки «Жабры» и «Плавательный пузырь» покажут то, что спрятано внутри.",
  },
  s2: { pl: "Oddychanie skrzelami", ru: "Дыхание жабрами" },
  s2intro: {
    pl: "Ryba nie wynurza się po powietrze — tlen pobiera z wody, w której jest rozpuszczony.",
    ru: "Рыба не всплывает за воздухом — кислород она берёт из воды, в которой он растворён.",
  },
  s3: { pl: "Pęcherz pławny", ru: "Плавательный пузырь" },
  s3intro: {
    pl: "Przesuń suwak i zobacz, jak ilość gazu w pęcherzu zmienia głębokość, na której ryba pływa.",
    ru: "Подвигай ползунок и посмотри, как количество газа в пузыре меняет глубину, на которой плавает рыба.",
  },
  s4: { pl: "Do czego to służy?", ru: "Для чего это нужно?" },
  s4intro: {
    pl: "Dopasuj narząd do zadania, które wykonuje.",
    ru: "Подбери орган к работе, которую он выполняет.",
  },
} satisfies Record<string, Txt>;

const OPTIONS: QuizOption[] = [
  { id: "tail", label: { pl: "płetwa ogonowa", ru: "хвостовой плавник" } },
  { id: "paired", label: { pl: "płetwy parzyste", ru: "парные плавники" } },
  { id: "bladder", label: { pl: "pęcherz pławny", ru: "плавательный пузырь" } },
  { id: "lateral", label: { pl: "linia boczna", ru: "боковая линия" } },
  { id: "gills", label: { pl: "skrzela", ru: "жабры" } },
  { id: "mucus", label: { pl: "śluz", ru: "слизь" } },
];

const ITEMS: QuizItem[] = [
  { icon: "🚀", name: { pl: "napędza rybę do przodu", ru: "толкает рыбу вперёд" }, answer: "tail", explain: { pl: "Płetwa ogonowa to główny napęd.", ru: "Хвостовой плавник — главный двигатель." } },
  { icon: "🫧", name: { pl: "pobiera tlen rozpuszczony w wodzie", ru: "забирает растворённый в воде кислород" }, answer: "gills", explain: { pl: "Skrzela — narząd oddechowy ryb.", ru: "Жабры — орган дыхания рыб." } },
  { icon: "🌫", name: { pl: "wyczuwa drapieżnika w mętnej wodzie", ru: "чувствует хищника в мутной воде" }, answer: "lateral", explain: { pl: "Linia boczna rejestruje ruchy wody.", ru: "Боковая линия улавливает движения воды." } },
  { icon: "⚖️", name: { pl: "utrzymuje rybę na wybranej głębokości", ru: "удерживает рыбу на нужной глубине" }, answer: "bladder", explain: { pl: "Pęcherz pławny reguluje unoszenie się ryby.", ru: "Плавательный пузырь регулирует плавучесть." } },
  { icon: "↩️", name: { pl: "pozwala skręcać i hamować", ru: "помогает поворачивать и тормозить" }, answer: "paired", explain: { pl: "Płetwy piersiowe i brzuszne sterują rybą.", ru: "Грудные и брюшные плавники управляют рыбой." } },
  { icon: "🛡", name: { pl: "zmniejsza tarcie i chroni przed drobnoustrojami", ru: "уменьшает трение и защищает от микробов" }, answer: "mucus", explain: { pl: "Śluz pokrywa łuski ryby.", ru: "Слизь покрывает чешую рыбы." } },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Ryba ma opływowy kształt, łuski pokryte śluzem i płetwy.", ru: "У рыбы обтекаемая форма, чешуя со слизью и плавники." },
    { pl: "Płetwy parzyste: piersiowe i brzuszne; nieparzyste: grzbietowa, odbytowa i ogonowa.", ru: "Парные плавники: грудные и брюшные; непарные: спинной, анальный и хвостовой." },
    { pl: "Linia boczna wyczuwa ruchy wody i zmiany ciśnienia.", ru: "Боковая линия улавливает движения воды и изменения давления." },
  ],
  s2: [
    { pl: "Ryby oddychają skrzelami osłoniętymi pokrywami skrzelowymi.", ru: "Рыбы дышат жабрами, прикрытыми жаберными крышками." },
    { pl: "Woda wpływa pyskiem i wypływa spod pokryw skrzelowych.", ru: "Вода входит через рот и выходит из-под жаберных крышек." },
  ],
  s3: [
    { pl: "Pęcherz pławny wypełniony gazem pozwala rybie unosić się na różnej głębokości.", ru: "Плавательный пузырь с газом позволяет рыбе держаться на разной глубине." },
    { pl: "Ryby chrzęstnoszkieletowe, np. rekiny, nie mają pęcherza pławnego.", ru: "У хрящевых рыб, например акул, плавательного пузыря нет." },
  ],
  s4: [
    { pl: "Ryby są zmiennocieplne.", ru: "Рыбы холоднокровны." },
    { pl: "Rozmnażanie: tarło — samica składa ikrę, samiec polewa ją nasieniem (zapłodnienie zewnętrzne); z ikry wylęga się narybek.", ru: "Размножение: нерест — самка выметывает икру, самец поливает её молоками (наружное оплодотворение); из икры выходят мальки." },
  ],
};

export default function FishLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="fish" sections={[T.s1, T.s2, T.s3, T.s4]} />

      <Section id="fish-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <FishMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="fish-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <GillsFlow lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="fish-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Buoyancy lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="fish-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={{ pl: "🐟 Narząd i jego praca", ru: "🐟 Орган и его работа" }}
          question={{ pl: "Co", ru: "Что" }}
          options={OPTIONS}
          items={ITEMS}
          wrongHint={{ pl: "to robi coś innego. Wróć do rysunku w pierwszym bloku.", ru: "делает другое. Загляни в рисунок в первом блоке." }}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
