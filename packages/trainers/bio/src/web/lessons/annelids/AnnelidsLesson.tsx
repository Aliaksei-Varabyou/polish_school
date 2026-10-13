// Lesson for §2.4 "Pierścienice – zwierzęta, które mają segmentowane ciało" (Puls życia 6). Terms
// follow templates/data/sp6Invertebrates.ts (ANNELIDS).
import { MatchQuiz, type QuizItem, type QuizOption } from "../games.tsx";
import { Remember, Section, type LessonProps, type Txt } from "../kit.tsx";
import { LessonIntro } from "../LessonIntro.tsx";
import { Crawl, EarthwormMap, Soil } from "./Earthworm.tsx";

const T = {
  lead: {
    pl: "Pierścienice to robaki, których ciało podzielone jest na wiele podobnych pierścieni — segmentów. Należą do nich dżdżownice żyjące w glebie, pijawki z wód słodkich i morskie nereidy. Mają już zamknięty układ krwionośny.",
    ru: "Кольчатые черви — черви, тело которых разделено на множество похожих колец — сегментов. К ним относятся дождевые черви из почвы, пиявки из пресных вод и морские нереиды. У них уже есть замкнутая кровеносная система.",
  },
  s1: { pl: "Jak zbudowana jest dżdżownica", ru: "Как устроен дождевой червь" },
  s1intro: {
    pl: "Obejrzyj dżdżownicę z boku. Przyciski „Zamknięty układ krwionośny” i „Wór powłokowo-mięśniowy” pokażą wnętrze.",
    ru: "Рассмотри дождевого червя сбоку. Кнопки «Замкнутая кровеносная система» и «Кожно-мускульный мешок» покажут, что внутри.",
  },
  s2: { pl: "Jak pełza dżdżownica", ru: "Как ползает дождевой червь" },
  s2intro: {
    pl: "Dżdżownica nie ma nóg, a jednak sprawnie przeciska się przez glebę. Uruchom animację i śledź fale skurczów.",
    ru: "У дождевого червя нет ног, но он ловко протискивается сквозь почву. Запусти анимацию и проследи за волнами сокращений.",
  },
  s3: { pl: "Dżdżownice a gleba", ru: "Дождевые черви и почва" },
  s3intro: {
    pl: "Porównaj ogród z dżdżownicami i bez nich.",
    ru: "Сравни огород с дождевыми червями и без них.",
  },
  s4: { pl: "Kto to?", ru: "Кто это?" },
  s4intro: {
    pl: "Rozpoznaj pierścienicę po opisie.",
    ru: "Узнай кольчатого червя по описанию.",
  },
} satisfies Record<string, Txt>;

const OPTIONS: QuizOption[] = [
  { id: "earthworm", label: { pl: "dżdżownica", ru: "дождевой червь" } },
  { id: "leech", label: { pl: "pijawka lekarska", ru: "медицинская пиявка" } },
  { id: "nereis", label: { pl: "nereida", ru: "нереида" } },
];

const ITEMS: QuizItem[] = [
  { icon: "🪱", name: { pl: "drąży korytarze w glebie i wciąga do nich liście", ru: "роет ходы в почве и затаскивает в них листья" }, answer: "earthworm", explain: { pl: "Dżdżownica spulchnia glebę i tworzy próchnicę.", ru: "Дождевой червь рыхлит почву и создаёт гумус." } },
  {
    icon: "🩸",
    name: { pl: "ma przyssawki na obu końcach ciała i wysysa krew", ru: "имеет присоски на обоих концах тела и сосёт кровь" },
    answer: "leech",
    explain: { pl: "Pijawka lekarska — jej ślina zapobiega krzepnięciu krwi, dlatego używa się jej w leczeniu zakrzepów.", ru: "Медицинская пиявка — её слюна мешает свёртыванию крови, поэтому её применяют при лечении тромбов." },
  },
  { icon: "🌊", name: { pl: "żyje w morzu, ma boczne wyrostki z licznymi szczecinkami", ru: "живёт в море, у неё боковые выросты с многочисленными щетинками" }, answer: "nereis", explain: { pl: "Nereida — morska pierścienica, pokarm wielu ryb.", ru: "Нереида — морской кольчатый червь, пища многих рыб." } },
  { icon: "🌧", name: { pl: "po ulewie wychodzi na chodnik, bo w zalanej glebie brakuje powietrza", ru: "после ливня выползает на тротуар, потому что в залитой почве не хватает воздуха" }, answer: "earthworm", explain: { pl: "Dżdżownica oddycha przez skórę i potrzebuje powietrza w glebie.", ru: "Дождевой червь дышит кожей, и ему нужен воздух в почве." } },
  { icon: "🏊", name: { pl: "pływa w stawie falistymi ruchami spłaszczonego ciała", ru: "плавает в пруду волнообразными движениями плоского тела" }, answer: "leech", explain: { pl: "Pijawki żyją w wodach słodkich i dobrze pływają.", ru: "Пиявки живут в пресных водах и хорошо плавают." } },
  { icon: "🥚", name: { pl: "ma siodełko, które wytwarza kokon z jajami", ru: "у него есть поясок, образующий кокон с яйцами" }, answer: "earthworm", explain: { pl: "Siodełko to charakterystyczna cecha dżdżownicy.", ru: "Поясок — характерный признак дождевого червя." } },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Ciało pierścienic jest podzielone na segmenty.", ru: "Тело кольчатых червей разделено на сегменты." },
    { pl: "Dżdżownica oddycha przez wilgotną skórę i ma zamknięty układ krwionośny.", ru: "Дождевой червь дышит влажной кожей, у него замкнутая кровеносная система." },
    { pl: "Dżdżownica jest obojnakiem; siodełko wytwarza kokon z jajami.", ru: "Дождевой червь — гермафродит; поясок образует кокон с яйцами." },
  ],
  s2: [{ pl: "Wór powłokowo-mięśniowy (mięśnie okrężne i podłużne) i szczecinki umożliwiają ruch pełzający.", ru: "Кожно-мускульный мешок (кольцевые и продольные мышцы) и щетинки позволяют ползать." }],
  s3: [{ pl: "Dżdżownice spulchniają i napowietrzają glebę oraz tworzą próchnicę.", ru: "Дождевые черви рыхлят почву, насыщают её воздухом и создают гумус." }],
  s4: [{ pl: "Przedstawiciele pierścienic: dżdżownica (gleba), pijawka lekarska (wody słodkie), nereida (morze).", ru: "Представители кольчатых: дождевой червь (почва), медицинская пиявка (пресные воды), нереида (море)." }],
};

export default function AnnelidsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="annelids" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="annelids-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <EarthwormMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="annelids-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Crawl lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="annelids-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Soil lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="annelids-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={{ pl: "🪱 Która pierścienica?", ru: "🪱 Какой кольчатый червь?" }}
          question={{ pl: "Kto", ru: "Кто" }}
          options={OPTIONS}
          items={ITEMS}
          wrongHint={{ pl: "to inna pierścienica. Zwróć uwagę, gdzie żyje.", ru: "это другой кольчатый червь. Обрати внимание, где он живёт." }}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
