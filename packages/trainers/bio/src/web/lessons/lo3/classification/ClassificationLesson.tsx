// Lesson for LO3 §1.1 "Miejsce człowieka w systemie klasyfikacji organizmów" (zakres rozszerzony).
// Taxa and traits follow templates/data/comparative.ts (CLASSIFICATION).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, OrderGame, TwoWaySort, type CompareCard, type SortItem } from "../../games.tsx";
import { Choice, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Człowiek jest jednym z gatunków zwierząt i — jak każdy organizm — ma swoje miejsce w systemie klasyfikacji. Im niższa ranga, tym bliżej spokrewnione organizmy do niej należą: z owadem łączy nas tylko królestwo, z szympansem — aż rodzina.",
    "Человек — один из видов животных и, как любой организм, занимает своё место в системе классификации. Чем ниже ранг, тем ближе родство входящих в него организмов: с насекомым нас объединяет только царство, а с шимпанзе — даже семейство.",
  ),
  s1: r("Od królestwa do gatunku", "От царства до вида"),
  s1intro: r(
    "Każdy poziom lejka to jedna ranga. Schodź w dół i patrz, jak maleje grono naszych krewnych i przybywa wspólnych cech.",
    "Каждый уровень воронки — один ранг. Спускайся вниз и смотри, как сужается круг наших родственников и прибавляется общих признаков.",
  ),
  s2: r("Hierarchia rang", "Иерархия рангов"),
  s2intro: r(
    "Ułóż jednostki systematyczne, do których należy człowiek, od najszerszej do najwęższej.",
    "Расположи систематические группы, к которым относится человек, от самой широкой к самой узкой.",
  ),
  s3: r("Naczelne a człowiek", "Приматы и человек"),
  s3intro: r(
    "Część naszych cech mamy wspólnie ze wszystkimi naczelnymi, inne są tylko nasze — wiążą się głównie z dwunożnością i dużym mózgowiem.",
    "Часть признаков у нас общая со всеми приматами, другие есть только у человека — они связаны в основном с прямохождением и крупным мозгом.",
  ),
  s4: r("Człowiek i szympans", "Человек и шимпанзе"),
  s4intro: r(
    "Szympans to nasz najbliższy żyjący krewny, a jednak szkielet zdradza zupełnie inny sposób poruszania się.",
    "Шимпанзе — наш ближайший живой родственник, и всё же скелет выдаёт совсем другой способ передвижения.",
  ),
} satisfies Record<string, Txt>;

// ---------- the funnel of ranks ----------

interface Rank {
  rank: Txt;
  taxon: Txt;
  latin: string;
  trait: Txt;
  /** who else belongs here, besides us */
  others: Txt;
}

const RANKS: Rank[] = [
  {
    rank: r("królestwo", "царство"),
    taxon: r("zwierzęta", "животные"),
    latin: "Animalia",
    trait: r("Organizmy wielokomórkowe i cudzożywne, których komórki nie mają ściany komórkowej.", "Многоклеточные гетеротрофные организмы, клетки которых не имеют клеточной стенки."),
    others: r("gąbki, parzydełkowce, owady, mięczaki, ryby, ptaki…", "губки, кишечнополостные, насекомые, моллюски, рыбы, птицы…"),
  },
  {
    rank: r("typ", "тип"),
    taxon: r("strunowce", "хордовые"),
    latin: "Chordata",
    trait: r("W rozwoju zarodkowym mają strunę grzbietową, grzbietową cewkę nerwową i szczeliny skrzelowe w gardzieli.", "В зародышевом развитии у них есть хорда, спинная нервная трубка и жаберные щели в глотке."),
    others: r("lancetnik, ryby, płazy, gady, ptaki, ssaki", "ланцетник, рыбы, земноводные, пресмыкающиеся, птицы, млекопитающие"),
  },
  {
    rank: r("podtyp", "подтип"),
    taxon: r("kręgowce", "позвоночные"),
    latin: "Vertebrata",
    trait: r("Strunę grzbietową zastępuje kręgosłup, a mózgowie chroni czaszka.", "Хорду заменяет позвоночник, а головной мозг защищает череп."),
    others: r("ryby, płazy, gady, ptaki, ssaki", "рыбы, земноводные, пресмыкающиеся, птицы, млекопитающие"),
  },
  {
    rank: r("gromada", "класс"),
    taxon: r("ssaki", "млекопитающие"),
    latin: "Mammalia",
    trait: r("Stałocieplne, mają włosy, przeponę i gruczoły mlekowe — karmią młode mlekiem.", "Теплокровные, имеют волосы, диафрагму и млечные железы — выкармливают детёнышей молоком."),
    others: r("dziobak, kangur, pies, wieloryb, nietoperz…", "утконос, кенгуру, собака, кит, летучая мышь…"),
  },
  {
    rank: r("infragromada", "инфракласс"),
    taxon: r("łożyskowce", "плацентарные"),
    latin: "Placentalia",
    trait: r("Zarodek rozwija się w macicy i jest odżywiany przez matkę za pośrednictwem łożyska.", "Зародыш развивается в матке и получает питание от матери через плаценту."),
    others: r("pies, kot, wieloryb, słoń, nietoperz… (bez dziobaka i kangura)", "собака, кошка, кит, слон, летучая мышь… (без утконоса и кенгуру)"),
  },
  {
    rank: r("rząd", "отряд"),
    taxon: r("naczelne", "приматы"),
    latin: "Primates",
    trait: r("Chwytne dłonie z przeciwstawnym kciukiem, paznokcie zamiast pazurów, oczy skierowane do przodu — widzenie przestrzenne.", "Хватательные кисти с противопоставленным большим пальцем, ногти вместо когтей, глаза направлены вперёд — объёмное зрение."),
    others: r("lemury, makaki, gibony, orangutany, goryle, szympansy", "лемуры, макаки, гиббоны, орангутаны, гориллы, шимпанзе"),
  },
  {
    rank: r("rodzina", "семейство"),
    taxon: r("człowiekowate", "гоминиды"),
    latin: "Hominidae",
    trait: r("Duże naczelne bez ogona, o dużym mózgowiu i długim okresie opieki nad potomstwem.", "Крупные приматы без хвоста, с большим мозгом и долгой заботой о потомстве."),
    others: r("orangutany, goryle, szympansy", "орангутаны, гориллы, шимпанзе"),
  },
  {
    rank: r("rodzaj", "род"),
    taxon: r("człowiek", "человек"),
    latin: "Homo",
    trait: r("Dwunożny chód i wytwarzanie narzędzi. Dziś żyje tylko jeden gatunek z tego rodzaju.", "Прямохождение и изготовление орудий. Сегодня живёт лишь один вид этого рода."),
    others: r("tylko gatunki wymarłe, np. człowiek wyprostowany (Homo erectus), człowiek neandertalski (Homo neanderthalensis)", "только вымершие виды, например человек прямоходящий (Homo erectus), неандерталец (Homo neanderthalensis)"),
  },
  {
    rank: r("gatunek", "вид"),
    taxon: r("człowiek rozumny", "человек разумный"),
    latin: "Homo sapiens",
    trait: r("Największe względem ciała mózgowie, mowa artykułowana, myślenie abstrakcyjne. Nazwa dwuczłonowa: rodzaj (Homo) + epitet gatunkowy (sapiens).", "Самый крупный относительно тела мозг, членораздельная речь, абстрактное мышление. Название двойное: род (Homo) + видовой эпитет (sapiens)."),
    others: r("nikt więcej — wszyscy żyjący ludzie należą do jednego gatunku", "больше никто — все живущие люди принадлежат к одному виду"),
  },
];

const FUNNEL = {
  title: r("Lejek systematyki człowieka", "Воронка систематики человека"),
  wider: r("Szersza ranga", "Шире"),
  narrower: r("Węższa ranga", "Уже"),
  latin: r("Nazwa łacińska", "Латинское название"),
  trait: r("Wspólna cecha", "Общий признак"),
  others: r("Należą tu też", "Сюда же относятся"),
};

const ROW = 30;

function Funnel({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const rank = RANKS[i]!;
  const n = RANKS.length;
  const width = (k: number) => 300 - (k * 170) / (n - 1);
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox={`0 0 320 ${n * ROW + 10}`} className="mx-auto w-full max-w-[400px] select-none" role="img" aria-label={FUNNEL.title[lang]}>
          {RANKS.map((rk, k) => {
            const w = width(k);
            const on = k === i;
            const inside = k <= i;
            const x = 160 - w / 2;
            const y = 5 + k * ROW;
            return (
              <g
                key={rk.latin}
                role="button"
                tabIndex={0}
                aria-label={`${rk.rank[lang]}: ${rk.taxon[lang]}`}
                aria-pressed={on}
                onClick={() => setI(k)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setI(k);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={ROW - 4}
                  rx={8}
                  fill={on ? "#059669" : inside ? "#a7f3d0" : "#e2e8f0"}
                  stroke={on ? "#065f46" : "white"}
                  strokeWidth={on ? 2 : 1}
                  style={{ transition: "fill .25s" }}
                />
                <text x={160} y={y + 17} textAnchor="middle" fontSize={11.5} fontWeight={on ? 700 : 500} fill={on ? "white" : "#0f172a"}>
                  {rk.taxon[lang]}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Choice onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
            ↑ {FUNNEL.wider[lang]}
          </Choice>
          <Choice state="active" onClick={() => setI(Math.min(n - 1, i + 1))} disabled={i === n - 1}>
            ↓ {FUNNEL.narrower[lang]}
          </Choice>
        </div>
      </div>
      <div className="space-y-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
        <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
          {rank.rank[lang]} · {i + 1} / {n}
        </p>
        <h3 className="text-lg font-semibold text-emerald-900">{rank.taxon[lang]}</h3>
        <p className="text-sm text-emerald-950">
          <span className="font-medium">{FUNNEL.latin[lang]}:</span> <i>{rank.latin}</i>
        </p>
        <p className="text-[15px] leading-relaxed text-emerald-950">
          <span className="font-medium">{FUNNEL.trait[lang]}:</span> {rank.trait[lang]}
        </p>
        <p className="text-[15px] leading-relaxed text-emerald-950">
          <span className="font-medium">{FUNNEL.others[lang]}:</span> {rank.others[lang]}
        </p>
      </div>
    </div>
  );
}

// ---------- order of ranks ----------

const ORDER: Txt[] = [
  r("królestwo: zwierzęta", "царство: животные"),
  r("typ: strunowce", "тип: хордовые"),
  r("gromada: ssaki", "класс: млекопитающие"),
  r("rząd: naczelne", "отряд: приматы"),
  r("rodzina: człowiekowate", "семейство: гоминиды"),
  r("rodzaj: człowiek (Homo)", "род: человек (Homo)"),
  r("gatunek: człowiek rozumny", "вид: человек разумный"),
];

// ---------- primates vs. human ----------

const PRIMATE_TRAITS: SortItem[] = [
  { name: r("przeciwstawny kciuk", "противопоставленный большой палец"), group: 0, why: r("Umożliwia chwytanie gałęzi — i precyzyjny chwyt narzędzi u człowieka.", "Позволяет хвататься за ветки — а у человека точно держать орудия.") },
  { name: r("paznokcie zamiast pazurów", "ногти вместо когтей"), group: 0, why: r("Płaskie paznokcie mają wszystkie naczelne.", "Плоские ногти есть у всех приматов.") },
  { name: r("oczy skierowane do przodu, widzenie przestrzenne", "глаза направлены вперёд, объёмное зрение"), group: 0, why: r("Pozwala ocenić odległość — ważne przy skakaniu po drzewach.", "Позволяет оценивать расстояние — важно при прыжках по деревьям.") },
  { name: r("zwykle jedno młode i długa opieka nad nim", "обычно один детёныш и долгая забота о нём"), group: 0, why: r("Typowe dla naczelnych, u człowieka okres opieki jest najdłuższy.", "Типично для приматов; у человека период заботы самый долгий.") },
  { name: r("esowato wygięty kręgosłup", "S-образный позвоночник"), group: 1, why: r("Cztery krzywizny amortyzują wstrząsy przy chodzie na dwóch nogach.", "Четыре изгиба смягчают толчки при ходьбе на двух ногах.") },
  { name: r("wysklepiona stopa z nieprzeciwstawnym paluchem", "сводчатая стопа с непротивопоставленным большим пальцем"), group: 1, why: r("Stopa stała się podporą ciała, a nie narządem chwytnym.", "Стопа стала опорой тела, а не хватательным органом.") },
  { name: r("szeroka miednica w kształcie misy", "широкий таз в форме чаши"), group: 1, why: r("Podtrzymuje narządy jamy brzusznej w pionowej postawie.", "Поддерживает органы брюшной полости при вертикальном положении тела.") },
  { name: r("otwór wielki pośrodku podstawy czaszki", "большое затылочное отверстие в центре основания черепа"), group: 1, why: r("Głowa jest wyważona na szczycie pionowego kręgosłupa.", "Голова уравновешена на вершине вертикального позвоночника.") },
  { name: r("mózgowie ok. 1350 cm³ i mowa artykułowana", "мозг около 1350 см³ и членораздельная речь"), group: 1, why: r("Mózgowie szympansa ma ok. 400 cm³; mowa artykułowana jest wyłącznie ludzka.", "Мозг шимпанзе — около 400 см³; членораздельная речь есть только у человека.") },
];

// ---------- human vs. chimpanzee ----------

/** a person standing: upright S-shaped spine above a bowl pelvis */
function HumanArt() {
  return (
    <svg viewBox="0 0 160 200" className="mx-auto w-full max-w-[200px]" role="img" aria-label="Homo sapiens">
      <rect width={160} height={200} rx={10} fill="#f8fafc" />
      <path d="M10 190 L 150 190" stroke="#cbd5e1" strokeWidth={2} />
      <ellipse cx={80} cy={30} rx={20} ry={21} fill="#fde68a" stroke="#92400e" strokeWidth={2} />
      <path d="M68 44 Q 74 52 84 50" stroke="#92400e" strokeWidth={2} fill="none" />
      {/* S-shaped spine */}
      <path d="M82 52 C 76 66, 76 76, 82 90 C 88 104, 88 116, 80 128" stroke="#dc2626" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* bowl pelvis */}
      <path d="M62 126 Q 80 146 98 126 L 94 138 Q 80 150 66 138 Z" fill="#fca5a5" stroke="#991b1b" strokeWidth={1.5} />
      <path d="M80 64 L 58 112 M80 64 L 102 112" stroke="#64748b" strokeWidth={4} strokeLinecap="round" />
      <path d="M72 140 L 68 188 M88 140 L 92 188" stroke="#64748b" strokeWidth={5} strokeLinecap="round" />
      <path d="M60 188 Q 68 182 76 188 M84 188 Q 92 182 100 188" stroke="#0f766e" strokeWidth={3} fill="none" />
    </svg>
  );
}

/** a chimpanzee on all fours: arched C-shaped spine, long arms resting on knuckles */
function ChimpArt() {
  return (
    <svg viewBox="0 0 160 200" className="mx-auto w-full max-w-[200px]" role="img" aria-label="Pan troglodytes">
      <rect width={160} height={200} rx={10} fill="#f8fafc" />
      <path d="M10 190 L 150 190" stroke="#cbd5e1" strokeWidth={2} />
      <ellipse cx={34} cy={86} rx={18} ry={16} fill="#d6d3d1" stroke="#57534e" strokeWidth={2} />
      <path d="M18 92 Q 12 98 20 102 L 30 100" stroke="#57534e" strokeWidth={2} fill="#d6d3d1" />
      {/* C-shaped spine */}
      <path d="M50 88 C 70 64, 104 64, 122 96" stroke="#dc2626" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M114 92 L 132 100 L 126 110 L 112 104 Z" fill="#fca5a5" stroke="#991b1b" strokeWidth={1.5} />
      {/* long arms on knuckles, short bent legs */}
      <path d="M54 90 L 46 140 L 50 188" stroke="#64748b" strokeWidth={4} strokeLinecap="round" fill="none" />
      <path d="M44 188 Q 50 180 58 188" stroke="#0f766e" strokeWidth={3} fill="none" />
      <path d="M122 106 L 138 146 L 120 188" stroke="#64748b" strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d="M112 188 Q 118 180 128 188 M128 188 L 134 182" stroke="#0f766e" strokeWidth={3} fill="none" />
    </svg>
  );
}

const L = {
  move: r("Poruszanie się", "Передвижение"),
  spine: r("Kręgosłup", "Позвоночник"),
  pelvis: r("Miednica", "Таз"),
  foot: r("Stopa", "Стопа"),
  limbs: r("Kończyny", "Конечности"),
  skull: r("Czaszka", "Череп"),
  brain: r("Mózgowie", "Головной мозг"),
};

const COMPARE: CompareCard[] = [
  {
    id: "human",
    icon: "🧍",
    name: r("Człowiek", "Человек"),
    art: <HumanArt />,
    rows: [
      { label: L.move, value: r("dwunożny, wyprostowana postawa ciała", "на двух ногах, прямая осанка") },
      { label: L.spine, value: r("esowato wygięty, z czterema krzywiznami", "S-образный, с четырьмя изгибами") },
      { label: L.pelvis, value: r("szeroka i niska, w kształcie misy", "широкий и низкий, в форме чаши") },
      { label: L.foot, value: r("wysklepiona, paluch ułożony równolegle do pozostałych palców", "сводчатая, большой палец параллелен остальным") },
      { label: L.limbs, value: r("dolne dłuższe od górnych", "нижние длиннее верхних") },
      { label: L.skull, value: r("mała twarzoczaszka, wysunięta bródka, otwór wielki pośrodku podstawy czaszki", "маленький лицевой отдел, выступающий подбородок, большое затылочное отверстие в центре основания") },
      { label: L.brain, value: r("ok. 1350 cm³", "около 1350 см³") },
    ],
  },
  {
    id: "chimp",
    icon: "🐒",
    name: r("Szympans", "Шимпанзе"),
    art: <ChimpArt />,
    rows: [
      { label: L.move, value: r("głównie na czterech kończynach, z oparciem na zgiętych palcach dłoni", "в основном на четырёх конечностях, с опорой на согнутые пальцы рук") },
      { label: L.spine, value: r("łukowato wygięty (w kształcie litery C)", "дугообразный (в форме буквы C)") },
      { label: L.pelvis, value: r("wąska i wydłużona", "узкий и вытянутый") },
      { label: L.foot, value: r("chwytna, z przeciwstawnym paluchem", "хватательная, с противопоставленным большим пальцем") },
      { label: L.limbs, value: r("górne dłuższe od dolnych", "верхние длиннее нижних") },
      { label: L.skull, value: r("duża, wysunięta twarzoczaszka, wały nadoczodołowe, brak bródki, otwór wielki przesunięty ku tyłowi", "крупный выступающий лицевой отдел, надбровные валики, нет подбородка, большое отверстие смещено назад") },
      { label: L.brain, value: r("ok. 400 cm³", "около 400 см³") },
    ],
    text: r(
      "Ludzie i szympansy mają wspólnego przodka, a nie pochodzą jedni od drugich. Różnice w szkielecie to przystosowania do różnego trybu życia.",
      "У людей и шимпанзе общий предок — одни не произошли от других. Различия в скелете — приспособления к разному образу жизни.",
    ),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Człowiek: zwierzęta → strunowce → kręgowce → ssaki → łożyskowce → naczelne → człowiekowate → Homo → Homo sapiens.", "Человек: животные → хордовые → позвоночные → млекопитающие → плацентарные → приматы → гоминиды → Homo → Homo sapiens."),
    r("Im niższa ranga, tym bliższe pokrewieństwo i więcej wspólnych cech.", "Чем ниже ранг, тем ближе родство и больше общих признаков."),
  ],
  s2: [
    r("Rangi: królestwo → typ → gromada → rząd → rodzina → rodzaj → gatunek.", "Ранги: царство → тип → класс → отряд → семейство → род → вид."),
    r("Nazwa gatunku jest dwuczłonowa (binominalna): nazwa rodzaju + epitet gatunkowy, np. Homo sapiens — zasadę tę wprowadził Karol Linneusz.", "Название вида двойное (бинарное): название рода + видовой эпитет, например Homo sapiens; этот принцип ввёл Карл Линней."),
  ],
  s3: [r("Cechy wyłącznie ludzkie wiążą się z dwunożnością (kręgosłup, miednica, stopa) i z rozwojem mózgowia.", "Чисто человеческие признаки связаны с прямохождением (позвоночник, таз, стопа) и развитием головного мозга.")],
  s4: [r("Szympans jest najbliższym żyjącym krewnym człowieka; oba gatunki należą do rodziny człowiekowatych.", "Шимпанзе — ближайший живущий родственник человека; оба вида относятся к семейству гоминид.")],
};

export default function ClassificationLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="cls" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="cls-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <Funnel lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="cls-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <OrderGame lang={lang} title={r("Od najszerszej do najwęższej rangi", "От самого широкого ранга к самому узкому")} steps={ORDER} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="cls-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort
          lang={lang}
          title={r("Czyja to cecha?", "Чей это признак?")}
          groups={[r("wszystkie naczelne", "все приматы"), r("tylko człowiek", "только человек")]}
          items={PRIMATE_TRAITS}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="cls-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={COMPARE} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
