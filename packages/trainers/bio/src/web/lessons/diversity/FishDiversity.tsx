// Lesson for §4.2 "Przegląd i znaczenie ryb" (Puls życia 6). Species follow
// templates/data/sp6Vertebrates.ts (FISH_SPECIES).
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import { SPECIES_HINT, SpeciesGallery, TwoWaySort, type SortItem, type Species } from "@portal/lessons";
import { Choice, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Ryby żyją we wszystkich wodach świata — od górskich strumieni po głębiny oceanów. Dzielimy je na kostnoszkieletowe (większość) i chrzęstnoszkieletowe (rekiny i płaszczki). Są ważnym pokarmem dla ludzi i zwierząt, a niektóre odbywają niezwykłe wędrówki.",
    "Рыбы живут во всех водах мира — от горных ручьёв до глубин океана. Их делят на костных (большинство) и хрящевых (акулы и скаты). Они — важная пища для людей и животных, а некоторые совершают удивительные путешествия.",
  ),
  s1: r("Poznaj ryby", "Познакомься с рыбами"),
  s2: r("Ryby wędrowne", "Проходные рыбы"),
  s2intro: r("Łosoś i węgorz żyją w dwóch światach — słodkiej i słonej wodzie. Prześledź ich wędrówki.", "Лосось и угорь живут в двух мирах — в пресной и солёной воде. Проследи их путешествия."),
  s3: r("Kość czy chrząstka?", "Кость или хрящ?"),
  s3intro: r("Przypisz rybę do grupy według budowy szkieletu.", "Отнеси рыбу к группе по строению скелета."),
  bony: r("kostnoszkieletowa", "костная"),
  cartilaginous: r("chrzęstnoszkieletowa", "хрящевая"),
} satisfies Record<string, Txt>;

const SPECIES: Species[] = [
  { icon: "🐟", name: r("Karp", "Карп"), text: r("Hodowany w stawach, tradycyjne danie wigilijne w Polsce.", "Его разводят в прудах; традиционное рождественское блюдо в Польше.") },
  { icon: "🐟", name: r("Śledź", "Сельдь"), text: r("Morska ryba żyjąca w wielkich ławicach, ważna w rybołówstwie Bałtyku.", "Морская рыба, живущая огромными стаями, важна для рыболовства на Балтике.") },
  { icon: "🐟", name: r("Dorsz", "Треска"), text: r("Drapieżna ryba morska; z jej wątroby otrzymuje się tran — źródło witaminy D.", "Хищная морская рыба; из её печени получают рыбий жир — источник витамина D.") },
  { icon: "🐟", name: r("Łosoś", "Лосось"), text: r("Ryba wędrowna: żyje w morzu, a na tarło płynie w górę rzek.", "Проходная рыба: живёт в море, а на нерест поднимается вверх по рекам."), tag: r("wędrowna", "проходная") },
  { icon: "🐍", name: r("Węgorz", "Угорь"), text: r("Ma wężowate ciało; na tarło wędruje aż do Morza Sargassowego.", "У него змеевидное тело; на нерест уплывает в Саргассово море."), tag: r("wędrowna", "проходная") },
  { icon: "🐟", name: r("Szczupak", "Щука"), text: r("Drapieżnik słodkowodny polujący z zasadzki wśród roślin.", "Пресноводный хищник, охотящийся из засады в зарослях.") },
  { icon: "🐟", name: r("Pstrąg potokowy", "Ручьевая форель"), text: r("Żyje tylko w czystych, zimnych, natlenionych potokach górskich.", "Живёт только в чистых холодных горных ручьях, богатых кислородом.") },
  { icon: "🦈", name: r("Rekin", "Акула"), text: r("Ryba chrzęstnoszkieletowa bez pęcherza pławnego — musi stale pływać.", "Хрящевая рыба без плавательного пузыря — ей приходится всё время плыть.") },
  { icon: "🪁", name: r("Płaszczka", "Скат"), text: r("Ma płaskie ciało i żyje przy dnie morza.", "У неё плоское тело, она живёт у морского дна.") },
  { icon: "🌊", name: r("Konik morski", "Морской конёк"), text: r("Samiec nosi jaja w torbie lęgowej na brzuchu.", "Самец вынашивает икру в выводковой сумке на брюшке.") },
];

// ---------- migrations ----------

type Fish = "salmon" | "eel";
const ROUTES: Record<Fish, { path: string; steps: Txt[] }> = {
  salmon: {
    path: "M262 54 C 250 70, 240 90, 236 110 C 230 130, 210 140, 190 136",
    steps: [
      r("Łosoś wylęga się z ikry w górnym biegu czystej rzeki.", "Лосось выходит из икры в верховьях чистой реки."),
      r("Młode spływają do morza (np. Bałtyku), gdzie rosną kilka lat.", "Молодь скатывается в море (например, Балтийское), где растёт несколько лет."),
      r("Dorosłe wracają do rzeki, w której się urodziły, i płyną pod prąd na tarło — pokonując nawet wodospady.", "Взрослые возвращаются в реку, где родились, и плывут против течения на нерест — преодолевая даже водопады."),
    ],
  },
  eel: {
    path: "M40 140 C 90 100, 150 90, 190 120 C 210 110, 230 90, 250 70",
    steps: [
      r("Węgorz wylęga się w dalekim Morzu Sargassowym na Atlantyku.", "Угорь выходит из икры в далёком Саргассовом море в Атлантике."),
      r("Przezroczyste larwy przez około dwa lata dryfują z prądami morskimi do Europy.", "Прозрачные личинки около двух лет дрейфуют с морскими течениями к Европе."),
      r("Węgorze dorastają w rzekach i jeziorach, a dorosłe płyną z powrotem do Morza Sargassowego, by złożyć ikrę i zginąć.", "Угри вырастают в реках и озёрах, а взрослые плывут обратно в Саргассово море, чтобы отнереститься и погибнуть."),
    ],
  },
};

function Migration({ lang }: { lang: BioLang }) {
  const [fish, setFish] = useState<Fish>("salmon");
  const [run, setRun] = useState(0);
  const route = ROUTES[fish];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup">
        {(["salmon", "eel"] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={fish === f}
            onClick={() => {
              setFish(f);
              setRun(run + 1);
            }}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              fish === f ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {f === "salmon" ? r("🐟 Łosoś", "🐟 Лосось")[lang] : r("🐍 Węgorz", "🐍 Угорь")[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 300 170" className="w-full" role="img" aria-label={fish === "salmon" ? "Łosoś / Лосось" : "Węgorz / Угорь"}>
            <rect width={300} height={170} rx={12} fill="#bae6fd" />
            <path d="M170 0 L 300 0 L 300 150 C 270 150, 250 140, 230 150 C 210 160, 200 150, 196 140 C 210 120, 200 100, 180 96 C 170 80, 176 40, 170 0 Z" fill="#bbf7d0" stroke="#16a34a" />
            <path d="M190 136 C 210 140, 230 130, 236 110 C 240 90, 250 70, 262 54" fill="none" stroke="#0284c7" strokeWidth={3} />
            <ellipse cx={186} cy={122} rx={14} ry={10} fill="#7dd3fc" />
            <ellipse cx={46} cy={142} rx={30} ry={14} fill="#38bdf8" opacity={0.6} />
            <text x={46} y={146} textAnchor="middle" fontSize={8} fill="#0c4a6e">
              {lang === "pl" ? "M. Sargassowe" : "Саргассово м."}
            </text>
            <text x={250} y={90} fontSize={8} fill="#166534">
              {lang === "pl" ? "rzeka" : "река"}
            </text>
            <text x={174} y={112} fontSize={8} fill="#0c4a6e">
              {lang === "pl" ? "Bałtyk" : "Балтика"}
            </text>
            <text x={80} y={60} fontSize={9} fill="#0c4a6e">
              {lang === "pl" ? "Ocean Atlantycki" : "Атлантический океан"}
            </text>
            <path d={route.path} fill="none" stroke="#f97316" strokeWidth={2} strokeDasharray="5 4" />
            <g key={`${fish}-${run}`}>
              <circle r={6} fill="#f97316" stroke="white" strokeWidth={2}>
                <animateMotion dur="4s" repeatCount="indefinite" path={route.path} keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" />
              </circle>
            </g>
          </svg>
          <div className="mt-2">
            <Choice onClick={() => setRun(run + 1)}>▶ {lang === "pl" ? "Pokaż jeszcze raz" : "Показать ещё раз"}</Choice>
          </div>
        </div>
        <ol className="space-y-2">
          {route.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">{i + 1}</span>
              {s[lang]}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const SORT: SortItem[] = [
  { name: r("karp", "карп"), group: 0, why: r("ma kostny szkielet i pęcherz pławny", "костный скелет и плавательный пузырь") },
  { name: r("rekin", "акула"), group: 1, why: r("szkielet z chrząstki, brak pęcherza pławnego", "скелет из хряща, плавательного пузыря нет") },
  { name: r("łosoś", "лосось"), group: 0, why: r("ryba kostnoszkieletowa", "костная рыба") },
  { name: r("płaszczka", "скат"), group: 1, why: r("krewna rekinów, szkielet chrzęstny", "родственник акул, хрящевой скелет") },
  { name: r("szczupak", "щука"), group: 0, why: r("ma pokrywy skrzelowe i ości", "есть жаберные крышки и кости") },
  { name: r("śledź", "сельдь"), group: 0, why: r("ryba kostnoszkieletowa", "костная рыба") },
  { name: r("konik morski", "морской конёк"), group: 0, why: r("mimo dziwnego kształtu — ryba kostnoszkieletowa", "несмотря на необычную форму — костная рыба") },
  { name: r("rekin wielorybi", "китовая акула"), group: 1, why: r("największa ryba świata, chrzęstnoszkieletowa", "самая большая рыба в мире, хрящевая") },
];

const REMEMBER: Record<"s1" | "s2" | "s3", Txt[]> = {
  s1: [
    { pl: "Ryby są pokarmem ludzi i zwierząt; z wątroby dorsza otrzymuje się tran.", ru: "Рыбы — пища людей и животных; из печени трески получают рыбий жир." },
    { pl: "Pstrąg żyje tylko w czystych wodach — świadczy o ich czystości.", ru: "Форель живёт только в чистой воде — она показатель чистоты." },
  ],
  s2: [{ pl: "Ryby wędrowne: łosoś (z morza do rzek na tarło) i węgorz (z rzek do Morza Sargassowego).", ru: "Проходные рыбы: лосось (из моря в реки на нерест) и угорь (из рек в Саргассово море)." }],
  s3: [{ pl: "Ryby chrzęstnoszkieletowe (rekiny, płaszczki) nie mają pęcherza pławnego ani pokryw skrzelowych.", ru: "У хрящевых рыб (акулы, скаты) нет плавательного пузыря и жаберных крышек." }],
};

export default function FishDiversityLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="fishd" sections={[T.s1, T.s2, T.s3]} />
      <Section id="fishd-s1" n={1} title={T.s1[lang]}>
        <SpeciesGallery lang={lang} items={SPECIES} hint={SPECIES_HINT} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="fishd-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Migration lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="fishd-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s3} groups={[T.bony, T.cartilaginous]} items={SORT} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
    </div>
  );
}
