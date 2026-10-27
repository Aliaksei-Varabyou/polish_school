// Lesson for LO3 §11.1 "Rozmnażanie i rozwój u zwierząt" (zakres rozszerzony). Terms follow
// templates/data/comparative.ts (ANIMAL_REPRODUCTION): partenogeneza, pączkowanie, fragmentacja,
// zapłodnienie zewnętrzne/wewnętrzne, jajorodność, żyworodność, rozwój złożony, błony płodowe.
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, TwoWaySort, type CompareCard, type QuizItem, type QuizOption, type SortItem } from "@portal/lessons";
import { Choice, KIT, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Zwierzęta rozmnażają się bezpłciowo — wtedy potomstwo jest genetyczną kopią rodzica — albo płciowo, z udziałem gamet. Zapłodnienie może zajść w wodzie lub w drogach rodnych samicy, a zarodek rozwija się w jaju albo w ciele matki. Z jaja wychodzi młode podobne do rodziców lub larwa, która musi przejść przeobrażenie.",
    "Животные размножаются бесполым путём — тогда потомство является генетической копией родителя — или половым, с участием гамет. Оплодотворение может происходить в воде или в половых путях самки, а зародыш развивается в яйце или в теле матери. Из яйца выходит детёныш, похожий на родителей, или личинка, которой предстоит превращение.",
  ),
  s1: r("Rozmnażanie płciowe i bezpłciowe", "Половое и бесполое размножение"),
  s1intro: r(
    "W rozmnażaniu bezpłciowym nowy osobnik powstaje z komórek ciała rodzica, w płciowym — z gamet powstałych w wyniku mejozy.",
    "При бесполом размножении новая особь возникает из клеток тела родителя, при половом — из гамет, образованных в результате мейоза.",
  ),
  s2: r("Zapłodnienie zewnętrzne i wewnętrzne", "Наружное и внутреннее оплодотворение"),
  s2intro: r("Gdzie spotykają się gamety? Porównaj oba sposoby zapłodnienia.", "Где встречаются гаметы? Сравни оба способа оплодотворения."),
  s3: r("Jajorodność, jajożyworodność, żyworodność", "Яйцекладность, яйцеживорождение, живорождение"),
  s3intro: r(
    "Zarodek może rozwijać się w jaju złożonym do środowiska, w jaju zatrzymanym w drogach rodnych samicy albo w ciele matki, która go odżywia.",
    "Зародыш может развиваться в яйце, отложенном во внешнюю среду, в яйце, задержанном в половых путях самки, или в теле матери, которая его питает.",
  ),
  s4: r("Rozwój prosty i złożony", "Прямое и непрямое развитие"),
  s4intro: r(
    "Wybierz zwierzę i przejdź przez kolejne stadia jego rozwoju pozazarodkowego.",
    "Выбери животное и пройди по стадиям его постэмбрионального развития.",
  ),
} satisfies Record<string, Txt>;

// ---------- sexual or asexual ----------

const SEXUAL = r("płciowe", "половое");
const ASEXUAL = r("bezpłciowe", "бесполое");

const MODES: SortItem[] = [
  { name: r("pączkowanie stułbi", "почкование гидры"), group: 1, why: r("Pączek wyrasta z ciała rodzica i odrywa się — potomek jest jego klonem.", "Почка вырастает из тела родителя и отделяется — потомок является его клоном.") },
  { name: r("tarło karpia — ikra i mlecz w wodzie", "нерест карпа — икра и молоки в воде"), group: 0, why: r("Łączą się gamety: komórki jajowe i plemniki.", "Сливаются гаметы: яйцеклетки и сперматозоиды.") },
  { name: r("fragmentacja wypławka", "фрагментация планарии"), group: 1, why: r("Z każdego fragmentu ciała odtwarza się cały organizm, bez udziału gamet.", "Из каждого фрагмента тела восстанавливается целый организм, без участия гамет.") },
  {
    name: r("rozwój trutnia z niezapłodnionego jaja (partenogeneza)", "развитие трутня из неоплодотворённого яйца (партеногенез)"),
    group: 0,
    why: r(
      "To szczególna forma rozmnażania płciowego: osobnik rozwija się z gamety — komórki jajowej — choć bez zapłodnienia.",
      "Это особая форма полового размножения: особь развивается из гаметы — яйцеклетки, хотя и без оплодотворения.",
    ),
  },
  { name: r("rozgwiazda odtwarzająca się z oderwanego ramienia", "морская звезда, восстанавливающаяся из оторванного луча"), group: 1, why: r("Fragment ciała z częścią tarczy środkowej odtwarza całe zwierzę — to fragmentacja.", "Фрагмент тела с частью центрального диска восстанавливает целое животное — это фрагментация.") },
  { name: r("dżdżownice (obojnaki) wymieniające się plemnikami", "дождевые черви (гермафродиты), обменивающиеся сперматозоидами"), group: 0, why: r("Obojnaki mają oba rodzaje gonad, ale zwykle zapładniają się krzyżowo — to rozmnażanie płciowe.", "У гермафродитов есть оба типа половых желёз, но обычно они оплодотворяются перекрёстно — это половое размножение.") },
  { name: r("podział ukwiału na dwa osobniki", "деление актинии на две особи"), group: 1, why: r("Ciało dzieli się na części, z których powstają nowe osobniki — bez gamet.", "Тело делится на части, из которых возникают новые особи, — без гамет.") },
  { name: r("składanie jaj przez kurę po kojarzeniu z kogutem", "откладывание яиц курицей после спаривания с петухом"), group: 0, why: r("Z zapłodnionej komórki jajowej (zygoty) rozwija się zarodek.", "Из оплодотворённой яйцеклетки (зиготы) развивается зародыш.") },
];

// ---------- fertilization ----------

function WaterArt() {
  const eggs = [
    [60, 70],
    [84, 60],
    [76, 90],
    [104, 80],
    [96, 106],
    [124, 98],
  ];
  return (
    <svg viewBox="0 0 200 150" className="w-full" aria-hidden>
      <rect width={200} height={150} rx={10} fill="#e0f2fe" />
      <path d="M0 22 Q 25 14 50 22 T 100 22 T 150 22 T 200 22" stroke="#7dd3fc" strokeWidth={3} fill="none" />
      {eggs.map(([x, y], k) => (
        <g key={k}>
          <circle cx={x} cy={y} r={9} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1.5} />
          <circle cx={x} cy={y} r={3} fill="#b45309" />
        </g>
      ))}
      {[
        [150, 50],
        [160, 76],
        [142, 112],
        [170, 124],
        [40, 120],
        [30, 50],
      ].map(([x, y], k) => (
        <g key={k} stroke="#475569" strokeWidth={1.2} fill="none">
          <ellipse cx={x} cy={y} rx={3} ry={2} fill="#475569" />
          <path d={`M${x + 3} ${y} q 5 -3 9 0 t 9 0`} />
        </g>
      ))}
    </svg>
  );
}

function BodyArt() {
  return (
    <svg viewBox="0 0 200 150" className="w-full" aria-hidden>
      <rect width={200} height={150} rx={10} fill="#fef9c3" />
      <path d="M30 75 C 30 30, 170 30, 170 75 C 170 120, 30 120, 30 75 Z" fill="#fecdd3" stroke="#be123c" strokeWidth={2} />
      <path d="M60 75 C 80 60, 120 60, 140 75" stroke="#f43f5e" strokeWidth={8} fill="none" strokeLinecap="round" />
      <circle cx={128} cy={72} r={9} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1.5} />
      <circle cx={128} cy={72} r={3} fill="#b45309" />
      {[
        [84, 66],
        [98, 63],
        [108, 68],
      ].map(([x, y], k) => (
        <g key={k} stroke="#475569" strokeWidth={1.2} fill="none">
          <ellipse cx={x} cy={y} rx={3} ry={2} fill="#475569" />
          <path d={`M${x - 3} ${y} q -4 -3 -8 0 t -8 0`} />
        </g>
      ))}
    </svg>
  );
}

const F = {
  where: r("Gdzie łączą się gamety", "Где сливаются гаметы"),
  env: r("Środowisko", "Среда"),
  count: r("Liczba gamet i jaj", "Число гамет и яиц"),
  odds: r("Szansa spotkania gamet i przeżycia potomstwa", "Шанс встречи гамет и выживания потомства"),
  who: r("Przykłady", "Примеры"),
};

const FERTILIZATION: CompareCard[] = [
  {
    id: "external",
    icon: "💧",
    name: r("Zapłodnienie zewnętrzne", "Наружное оплодотворение"),
    art: <WaterArt />,
    rows: [
      { label: F.where, value: r("poza ciałem samicy", "вне тела самки") },
      { label: F.env, value: r("woda — chroni gamety przed wyschnięciem i pozwala plemnikom pływać", "вода — защищает гаметы от высыхания и позволяет сперматозоидам плавать") },
      { label: F.count, value: r("bardzo duża — tysiące jaj i ogromne ilości plemników", "очень большое — тысячи яиц и огромное количество сперматозоидов") },
      { label: F.odds, value: r("mała — wiele gamet nie spotyka się, a jaja i młode są zjadane", "малый — многие гаметы не встречаются, а яйца и молодь поедаются") },
      { label: F.who, value: r("większość ryb i płazów, jeżowce, małże", "большинство рыб и земноводных, морские ежи, двустворчатые моллюски") },
    ],
    text: r("Samica i samiec muszą wydzielić gamety w tym samym miejscu i czasie — tarło ryb, gody płazów.", "Самка и самец должны выпустить гаметы в одном месте и в одно время — нерест рыб, брачный период земноводных."),
  },
  {
    id: "internal",
    icon: "🏠",
    name: r("Zapłodnienie wewnętrzne", "Внутреннее оплодотворение"),
    art: <BodyArt />,
    rows: [
      { label: F.where, value: r("w drogach rodnych samicy", "в половых путях самки") },
      { label: F.env, value: r("wilgotne wnętrze ciała — niezależne od wody w otoczeniu", "влажная внутренняя среда тела — не зависит от воды снаружи") },
      { label: F.count, value: r("mniejsza liczba jaj", "меньшее число яиц") },
      { label: F.odds, value: r("duża — gamety spotykają się łatwo, zarodek jest lepiej chroniony", "большой — гаметы легко встречаются, зародыш лучше защищён") },
      { label: F.who, value: r("owady, pajęczaki, gady, ptaki, ssaki, rekiny", "насекомые, паукообразные, пресмыкающиеся, птицы, млекопитающие, акулы") },
    ],
    text: r("Zapłodnienie wewnętrzne jest przystosowaniem do życia na lądzie.", "Внутреннее оплодотворение — приспособление к жизни на суше."),
  },
];

// ---------- egg or womb ----------

const BIRTH: QuizOption[] = [
  { id: "ovi", label: r("jajorodność", "яйцекладность") },
  { id: "ovovivi", label: r("jajożyworodność", "яйцеживорождение") },
  { id: "vivi", label: r("żyworodność", "живорождение") },
];

const BIRTH_ITEMS: QuizItem[] = [
  { icon: "🐔", name: r("kura", "курица"), answer: "ovi", explain: r("Jajo z dużym zapasem żółtka i skorupką rozwija się poza ciałem matki, ogrzewane w czasie wysiadywania.", "Яйцо с большим запасом желтка и скорлупой развивается вне тела матери, согреваемое при насиживании.") },
  { icon: "🐍", name: r("żmija zygzakowata", "гадюка обыкновенная"), answer: "ovovivi", explain: r("Jaja pozostają w drogach rodnych samicy, a zarodki odżywiają się głównie żółtkiem. Młode wydostają się z osłonek jaja tuż przed porodem lub w jego trakcie.", "Яйца остаются в половых путях самки, а зародыши питаются в основном желтком. Детёныши выходят из оболочек яйца непосредственно перед родами или во время них.") },
  { icon: "🐕", name: r("pies", "собака"), answer: "vivi", explain: r("Zarodek rozwija się w macicy i jest odżywiany przez matkę za pośrednictwem łożyska.", "Зародыш развивается в матке и питается от матери через плаценту.") },
  { icon: "🐟", name: r("karp", "карп"), answer: "ovi", explain: r("Samica składa w wodzie ikrę (jaja), które są zapładniane i rozwijają się poza jej ciałem.", "Самка выметывает в воду икру (яйца), которые оплодотворяются и развиваются вне её тела.") },
  { icon: "🦆", name: r("dziobak", "утконос"), answer: "ovi", explain: r("To ssak, ale składa jaja! Po wykluciu młode są karmione mlekiem.", "Это млекопитающее, но оно откладывает яйца! После вылупления детёнышей выкармливают молоком.") },
  { icon: "🐠", name: r("gupik", "гуппи"), answer: "ovovivi", explain: r("Ta ryba ma zapłodnienie wewnętrzne; jaja rozwijają się w ciele samicy, która rodzi gotowy do życia narybek.", "У этой рыбы внутреннее оплодотворение; икринки развиваются в теле самки, которая рождает готовых к жизни мальков.") },
  { icon: "🦘", name: r("kangur", "кенгуру"), answer: "vivi", explain: r("Torbacz: rodzi bardzo małe młode, które dalej rozwija się w torbie, karmione mlekiem.", "Сумчатое: рождает очень маленького детёныша, который дальше развивается в сумке, питаясь молоком.") },
];

// ---------- development: stage drawings ----------

type StageArt =
  | "frogEggs"
  | "tadpole"
  | "tadpoleLegs"
  | "froglet"
  | "frog"
  | "insectEggs"
  | "caterpillar"
  | "pupa"
  | "butterfly"
  | "nymph"
  | "grasshopper"
  | "reptileEgg"
  | "lizardYoung"
  | "lizard";

function Frog({ s, tail }: { s: number; tail?: boolean }) {
  return (
    <g transform={`translate(40 38) scale(${s})`}>
      {tail && <path d="M0 16 L 0 30" stroke="#65a30d" strokeWidth={4} strokeLinecap="round" />}
      <path d="M-12 8 C -26 12, -26 24, -14 26 M12 8 C 26 12, 26 24, 14 26" stroke="#4d7c0f" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M-10 -6 L -20 -2 M10 -6 L 20 -2" stroke="#4d7c0f" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={0} cy={2} rx={13} ry={17} fill="#84cc16" stroke="#3f6212" strokeWidth={1.5} />
      <circle cx={-6} cy={-13} r={4} fill="#84cc16" stroke="#3f6212" strokeWidth={1.2} />
      <circle cx={6} cy={-13} r={4} fill="#84cc16" stroke="#3f6212" strokeWidth={1.2} />
      <circle cx={-6} cy={-13} r={1.6} fill="#1e293b" />
      <circle cx={6} cy={-13} r={1.6} fill="#1e293b" />
    </g>
  );
}

function Tadpole({ legs, arms }: { legs?: boolean; arms?: boolean }) {
  return (
    <g>
      <path d="M44 36 C 52 28, 60 44, 70 34" stroke="#57534e" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M44 36 C 52 30, 60 42, 70 34" stroke="#a8a29e" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.35} />
      {legs && <path d="M40 42 L 46 52 L 50 52" stroke="#57534e" strokeWidth={2.5} fill="none" strokeLinecap="round" />}
      {arms && <path d="M24 42 L 20 50 L 16 50" stroke="#57534e" strokeWidth={2.5} fill="none" strokeLinecap="round" />}
      <ellipse cx={30} cy={36} rx={14} ry={10} fill="#78716c" />
      <circle cx={22} cy={33} r={2} fill="white" />
      {!legs && <path d="M34 27 l 4 -6 M37 28 l 6 -4 M34 27 l 0 -7" stroke="#f472b6" strokeWidth={1.6} strokeLinecap="round" />}
    </g>
  );
}

function Lizard({ s }: { s: number }) {
  return (
    <g transform={`translate(40 38) scale(${s})`}>
      <path d="M-4 0 C -18 2, -26 10, -34 4" stroke="#65a30d" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M-2 -5 L -6 -12 M-2 5 L -6 12 M10 -5 L 14 -12 M10 5 L 14 12" stroke="#4d7c0f" strokeWidth={2.5} strokeLinecap="round" />
      <ellipse cx={4} cy={0} rx={12} ry={6} fill="#84cc16" stroke="#3f6212" strokeWidth={1.2} />
      <ellipse cx={20} cy={0} rx={6} ry={4.5} fill="#84cc16" stroke="#3f6212" strokeWidth={1.2} />
      <circle cx={22} cy={-2} r={1.2} fill="#1e293b" />
    </g>
  );
}

function Grasshopper({ s, wings }: { s: number; wings: boolean }) {
  return (
    <g transform={`translate(40 40) scale(${s})`}>
      <path d="M-4 4 L 6 -10 L 18 10" stroke="#4d7c0f" strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      <path d="M-10 6 L -12 14 M-2 6 L -2 14" stroke="#4d7c0f" strokeWidth={1.8} />
      <ellipse cx={0} cy={0} rx={18} ry={6} fill="#a3e635" stroke="#3f6212" strokeWidth={1.2} />
      {wings && <path d="M-16 -3 C -4 -10, 10 -8, 14 -3 C 4 -2, -6 -1, -16 -3 Z" fill="#65a30d" opacity={0.85} />}
      <ellipse cx={-19} cy={-2} rx={6} ry={5} fill="#a3e635" stroke="#3f6212" strokeWidth={1.2} />
      <circle cx={-21} cy={-3} r={1.3} fill="#1e293b" />
      <path d="M-22 -6 C -26 -16, -30 -20, -36 -22" stroke="#3f6212" strokeWidth={1} fill="none" />
    </g>
  );
}

const ART: Record<StageArt, ReactNode> = {
  frogEggs: (
    <g>
      {[
        [28, 30],
        [42, 26],
        [54, 34],
        [34, 44],
        [48, 46],
        [22, 44],
        [60, 48],
      ].map(([x, y], k) => (
        <g key={k}>
          <circle cx={x} cy={y} r={7} fill="#e0f2fe" stroke="#7dd3fc" strokeWidth={1.2} />
          <circle cx={x} cy={y} r={2.5} fill="#1e293b" />
        </g>
      ))}
    </g>
  ),
  tadpole: <Tadpole />,
  tadpoleLegs: <Tadpole legs />,
  froglet: <Frog s={0.8} tail />,
  frog: <Frog s={1} />,
  insectEggs: (
    <g>
      <ellipse cx={40} cy={44} rx={32} ry={12} fill="#86efac" />
      {[24, 34, 44, 54].map((x) => (
        <ellipse key={x} cx={x} cy={40} rx={4} ry={5.5} fill="#fef9c3" stroke="#ca8a04" strokeWidth={1} />
      ))}
    </g>
  ),
  caterpillar: (
    <g>
      {[14, 22, 30, 38, 46, 54].map((x, k) => (
        <circle key={x} cx={x} cy={40 + (k % 2 ? -3 : 0)} r={6} fill="#4ade80" stroke="#166534" strokeWidth={1} />
      ))}
      <circle cx={63} cy={37} r={7} fill="#15803d" />
      <circle cx={66} cy={35} r={1.4} fill="white" />
    </g>
  ),
  pupa: (
    <g>
      <path d="M20 12 L 60 12" stroke="#78350f" strokeWidth={3} strokeLinecap="round" />
      <path d="M40 12 L 40 18" stroke="#a16207" strokeWidth={1.5} />
      <path d="M40 18 C 52 24, 50 48, 40 62 C 30 48, 28 24, 40 18 Z" fill="#bef264" stroke="#4d7c0f" strokeWidth={1.4} />
      <path d="M34 34 L 46 34 M33 42 L 47 42 M35 50 L 45 50" stroke="#4d7c0f" strokeWidth={0.8} />
    </g>
  ),
  butterfly: (
    <g>
      <ellipse cx={26} cy={30} rx={14} ry={12} fill="#fb923c" stroke="#7c2d12" strokeWidth={1.2} />
      <ellipse cx={54} cy={30} rx={14} ry={12} fill="#fb923c" stroke="#7c2d12" strokeWidth={1.2} />
      <ellipse cx={30} cy={48} rx={9} ry={8} fill="#fdba74" stroke="#7c2d12" strokeWidth={1.2} />
      <ellipse cx={50} cy={48} rx={9} ry={8} fill="#fdba74" stroke="#7c2d12" strokeWidth={1.2} />
      <ellipse cx={40} cy={39} rx={2.5} ry={16} fill="#292524" />
      <path d="M39 24 C 36 16, 32 12, 30 10 M41 24 C 44 16, 48 12, 50 10" stroke="#292524" strokeWidth={1} fill="none" />
    </g>
  ),
  nymph: <Grasshopper s={0.7} wings={false} />,
  grasshopper: <Grasshopper s={1.05} wings />,
  reptileEgg: (
    <g>
      <ellipse cx={30} cy={44} rx={10} ry={13} fill="#fafaf9" stroke="#a8a29e" strokeWidth={1.4} />
      <ellipse cx={50} cy={42} rx={10} ry={13} fill="#fafaf9" stroke="#a8a29e" strokeWidth={1.4} />
      <path d="M8 58 L 72 58" stroke="#d6d3d1" strokeWidth={4} strokeLinecap="round" />
    </g>
  ),
  lizardYoung: <Lizard s={0.65} />,
  lizard: <Lizard s={1} />,
};

interface Stage {
  art: StageArt;
  name: Txt;
  text: Txt;
}

interface Animal {
  id: string;
  icon: string;
  name: Txt;
  type: Txt;
  stages: Stage[];
  note: Txt;
}

const ANIMALS: Animal[] = [
  {
    id: "frog",
    icon: "🐸",
    name: r("Żaba", "Лягушка"),
    type: r("rozwój złożony (z przeobrażeniem)", "непрямое развитие (с превращением)"),
    stages: [
      { art: "frogEggs", name: r("Skrzek (jaja)", "Икра (яйца)"), text: r("Jaja otoczone galaretowatą osłonką, złożone i zapłodnione w wodzie.", "Яйца в студенистой оболочке, отложенные и оплодотворённые в воде.") },
      { art: "tadpole", name: r("Kijanka ze skrzelami zewnętrznymi", "Головастик с наружными жабрами"), text: r("Larwa żyjąca w wodzie: oddycha skrzelami, pływa dzięki ogonowi, ma linię boczną, odżywia się głównie pokarmem roślinnym. Przypomina bardziej rybę niż żabę.", "Личинка, живущая в воде: дышит жабрами, плавает с помощью хвоста, имеет боковую линию, питается в основном растительной пищей. Похожа скорее на рыбу, чем на лягушку.") },
      { art: "tadpoleLegs", name: r("Kijanka z kończynami tylnymi", "Головастик с задними конечностями"), text: r("Skrzela zewnętrzne zostały zastąpione wewnętrznymi; wyrastają kończyny tylne.", "Наружные жабры сменились внутренними; отрастают задние конечности.") },
      { art: "froglet", name: r("Młoda żaba z resztką ogona", "Лягушонок с остатком хвоста"), text: r("Przeobrażenie: pojawiają się kończyny przednie i płuca, skrzela zanikają, ogon jest stopniowo wchłaniany. Przeobrażenie wywołuje hormon tarczycy — tyroksyna.", "Превращение: появляются передние конечности и лёгкие, жабры исчезают, хвост постепенно рассасывается. Превращение вызывает гормон щитовидной железы — тироксин.") },
      { art: "frog", name: r("Dorosła żaba", "Взрослая лягушка"), text: r("Oddycha płucami i skórą, porusza się na lądzie i w wodzie, jest drapieżnikiem.", "Дышит лёгкими и кожей, передвигается по суше и в воде, хищник.") },
    ],
    note: r("Larwa i postać dorosła żyją w innych środowiskach i jedzą co innego — nie konkurują ze sobą.", "Личинка и взрослая особь живут в разных средах и едят разное — они не конкурируют друг с другом."),
  },
  {
    id: "butterfly",
    icon: "🦋",
    name: r("Motyl", "Бабочка"),
    type: r("rozwój złożony — przeobrażenie zupełne", "непрямое развитие — полное превращение"),
    stages: [
      { art: "insectEggs", name: r("Jaja", "Яйца"), text: r("Samica składa jaja na roślinie, którą będą jadły larwy.", "Самка откладывает яйца на растение, которым будут питаться личинки.") },
      { art: "caterpillar", name: r("Larwa (gąsienica)", "Личинка (гусеница)"), text: r("Zupełnie niepodobna do dorosłego motyla: ma narządy gębowe gryzące, je liście i szybko rośnie, kilka razy linieje.", "Совсем не похожа на взрослую бабочку: у неё грызущий ротовой аппарат, она ест листья, быстро растёт и несколько раз линяет.") },
      { art: "pupa", name: r("Poczwarka", "Куколка"), text: r("Nieruchome stadium, które nie pobiera pokarmu. Wewnątrz tkanki larwy przebudowują się w ciało owada dorosłego.", "Неподвижная стадия, которая не питается. Внутри ткани личинки перестраиваются в тело взрослого насекомого.") },
      { art: "butterfly", name: r("Postać dorosła (imago)", "Взрослая особь (имаго)"), text: r("Ma skrzydła i ssącą trąbkę, odżywia się nektarem i rozmnaża się.", "У неё есть крылья и сосущий хоботок, она питается нектаром и размножается.") },
    ],
    note: r("Przeobrażenie zupełne: jajo → larwa → poczwarka → imago (np. motyle, chrząszcze, muchówki, błonkówki).", "Полное превращение: яйцо → личинка → куколка → имаго (например, бабочки, жуки, двукрылые, перепончатокрылые)."),
  },
  {
    id: "grasshopper",
    icon: "🦗",
    name: r("Konik polny", "Кузнечик"),
    type: r("rozwój złożony — przeobrażenie niezupełne", "непрямое развитие — неполное превращение"),
    stages: [
      { art: "insectEggs", name: r("Jaja", "Яйца"), text: r("Jaja złożone do gleby.", "Яйца, отложенные в почву.") },
      { art: "nymph", name: r("Larwa", "Личинка"), text: r("Podobna do dorosłego owada, ale mniejsza i bez skrzydeł; rośnie i kilka razy linieje, a zawiązki skrzydeł z każdym linieniem są większe.", "Похожа на взрослое насекомое, но меньше и без крыльев; растёт и несколько раз линяет, а зачатки крыльев с каждой линькой становятся больше.") },
      { art: "grasshopper", name: r("Postać dorosła (imago)", "Взрослая особь (имаго)"), text: r("Po ostatnim linieniu ma w pełni rozwinięte skrzydła i jest zdolna do rozmnażania.", "После последней линьки у неё полностью развиты крылья и она способна к размножению.") },
    ],
    note: r("Przeobrażenie niezupełne: jajo → larwa → imago, bez stadium poczwarki (np. prostoskrzydłe, ważki, pluskwiaki).", "Неполное превращение: яйцо → личинка → имаго, без стадии куколки (например, прямокрылые, стрекозы, клопы)."),
  },
  {
    id: "lizard",
    icon: "🦎",
    name: r("Jaszczurka zwinka", "Прыткая ящерица"),
    type: r("rozwój prosty (bez przeobrażenia)", "прямое развитие (без превращения)"),
    stages: [
      { art: "reptileEgg", name: r("Jaja", "Яйца"), text: r("Jaja ze skórzastą osłonką złożone na lądzie; zarodek otaczają błony płodowe, m.in. owodnia.", "Яйца с кожистой оболочкой, отложенные на суше; зародыш окружён зародышевыми оболочками, в том числе амнионом.") },
      { art: "lizardYoung", name: r("Młoda jaszczurka", "Молодая ящерица"), text: r("Z jaja wykluwa się młode podobne do dorosłego — różni się głównie wielkością i proporcjami ciała.", "Из яйца вылупляется детёныш, похожий на взрослую особь, — отличается в основном размерами и пропорциями тела.") },
      { art: "lizard", name: r("Dorosła jaszczurka", "Взрослая ящерица"), text: r("Młoda jaszczurka rośnie i dojrzewa płciowo bez przeobrażenia.", "Молодая ящерица растёт и становится половозрелой без превращения.") },
    ],
    note: r("Rozwój prosty mają m.in. gady, ptaki i ssaki — w tym człowiek.", "Прямое развитие у пресмыкающихся, птиц и млекопитающих — в том числе у человека."),
  },
];

function DevelopmentStepper({ lang }: { lang: BioLang }) {
  const [animalId, setAnimalId] = useState("frog");
  const [i, setI] = useState(0);
  const animal = ANIMALS.find((a) => a.id === animalId)!;
  const n = animal.stages.length;
  const stage = animal.stages[Math.min(i, n - 1)]!;
  const choose = (id: string) => {
    setAnimalId(id);
    setI(0);
  };
  const W = 80;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup">
        {ANIMALS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={a.id === animalId}
            onClick={() => choose(a.id)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              a.id === animalId ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {a.icon} {a.name[lang]}
          </button>
        ))}
      </div>
      <p className="mb-3 inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 ring-1 ring-indigo-200">{animal.type[lang]}</p>
      <svg viewBox={`0 0 ${n * W} 84`} className="w-full max-w-[520px] select-none" role="img" aria-label={`${animal.name[lang]}: ${stage.name[lang]}`}>
        {animal.stages.map((s, k) => (
          <g
            key={k}
            transform={`translate(${k * W} 0)`}
            role="button"
            tabIndex={0}
            aria-label={s.name[lang]}
            aria-pressed={k === i}
            onClick={() => setI(k)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setI(k);
              }
            }}
            className="cursor-pointer outline-none"
          >
            <rect x={4} y={4} width={W - 8} height={70} rx={10} fill={k === i ? "#d1fae5" : "#f8fafc"} stroke={k === i ? "#059669" : "#e2e8f0"} strokeWidth={k === i ? 2.5 : 1.5} />
            <g opacity={k <= i ? 1 : 0.45}>{ART[s.art]}</g>
            {k < n - 1 && <path d={`M${W - 6} 39 l 8 0 m -3 -3 l 3 3 l -3 3`} stroke="#94a3b8" strokeWidth={1.8} fill="none" />}
          </g>
        ))}
      </svg>
      <div className="mt-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
        <h3 className="text-base font-semibold text-emerald-900">
          {i + 1}/{n} · {stage.name[lang]}
        </h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{stage.text[lang]}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Choice disabled={i === 0} onClick={() => setI(Math.max(0, i - 1))}>
          ‹ {lang === "pl" ? "Wstecz" : "Назад"}
        </Choice>
        {i < n - 1 ? (
          <Choice state="active" onClick={() => setI(i + 1)}>
            {KIT.next[lang]} ›
          </Choice>
        ) : (
          <Choice onClick={() => setI(0)}>↺ {KIT.again[lang]}</Choice>
        )}
      </div>
      {i === n - 1 && <p className="mt-3 text-sm text-slate-600">{animal.note[lang]}</p>}
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Rozmnażanie bezpłciowe (pączkowanie, fragmentacja, podział) daje potomstwo identyczne genetycznie z rodzicem.", ru: "Бесполое размножение (почкование, фрагментация, деление) даёт потомство, генетически идентичное родителю." },
    { pl: "Rozmnażanie płciowe zwiększa zmienność genetyczną potomstwa.", ru: "Половое размножение повышает генетическую изменчивость потомства." },
    { pl: "Partenogeneza (dzieworództwo) to rozwój z niezapłodnionej komórki jajowej, np. u mszyc i trutni.", ru: "Партеногенез (девственное размножение) — развитие из неоплодотворённой яйцеклетки, например у тлей и трутней." },
  ],
  s2: [
    { pl: "Zapłodnienie zewnętrzne wymaga wody i dużej liczby gamet; wewnętrzne jest przystosowaniem do życia na lądzie.", ru: "Наружное оплодотворение требует воды и большого числа гамет; внутреннее — приспособление к жизни на суше." },
  ],
  s3: [
    { pl: "Jajorodność — zarodek rozwija się w jaju poza ciałem matki; żyworodność — w ciele matki, która go odżywia.", ru: "Яйцекладность — зародыш развивается в яйце вне тела матери; живорождение — в теле матери, которая его питает." },
    { pl: "U gadów, ptaków i ssaków zarodek otaczają błony płodowe: owodnia, kosmówka i omocznia.", ru: "У пресмыкающихся, птиц и млекопитающих зародыш окружён зародышевыми оболочками: амнионом, хорионом и аллантоисом." },
  ],
  s4: [
    { pl: "Rozwój prosty — z jaja wychodzi młode podobne do dorosłego; rozwój złożony — larwa, która przechodzi przeobrażenie.", ru: "Прямое развитие — из яйца выходит детёныш, похожий на взрослого; непрямое — личинка, которая проходит превращение." },
    { pl: "Przeobrażenie zupełne ma stadium poczwarki, niezupełne — nie ma.", ru: "При полном превращении есть стадия куколки, при неполном — нет." },
  ],
};

export default function ReproductionAnimalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="repa" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="repa-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <TwoWaySort
          lang={lang}
          title={r("Jaki to sposób rozmnażania?", "Какой это способ размножения?")}
          hint={r("Zastanów się, czy nowy osobnik powstaje z gamety.", "Подумай, возникает ли новая особь из гаметы.")}
          groups={[SEXUAL, ASEXUAL]}
          items={MODES}
        />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="repa-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={FERTILIZATION} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="repa-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={r("Gdzie rozwija się zarodek?", "Где развивается зародыш?")}
          question={r("Jak rozwija się zarodek tego zwierzęcia:", "Как развивается зародыш этого животного:")}
          options={BIRTH}
          items={BIRTH_ITEMS}
          wrongHint={r("Zastanów się, czy jaja są składane i czym odżywia się zarodek.", "Подумай, откладываются ли яйца и чем питается зародыш.")}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="repa-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <DevelopmentStepper lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
