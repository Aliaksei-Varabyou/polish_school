// Lesson for LO3 §4.4 "Budowa i funkcje układu pokarmowego" and §4.5 "Procesy trawienia i wchłaniania"
// (Biologia na czasie 3, zakres rozszerzony) — one lesson for both paragraphs: the enzymes only make
// sense where they act. Organs and enzymes follow templates/data/systems.ts (DIGESTIVE_ORGANS, ENZYMES).
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { MatchQuiz, OrderGame, PartMap, type MapPart, type QuizItem, type QuizOption } from "../../games.tsx";
import { Choice, KIT, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Przewód pokarmowy człowieka ma kilka metrów długości. W kolejnych odcinkach pokarm jest rozdrabniany, trawiony przez enzymy do małych cząsteczek, a te są wchłaniane do krwi i limfy. Pomagają w tym gruczoły leżące poza przewodem — ślinianki, wątroba i trzustka.",
    "Пищеварительный тракт человека длиной в несколько метров. В его отделах пища измельчается, ферменты расщепляют её до мелких молекул, а те всасываются в кровь и лимфу. В этом помогают железы, лежащие вне тракта, — слюнные железы, печень и поджелудочная железа.",
  ),
  s1: r("Budowa układu pokarmowego", "Строение пищеварительной системы"),
  s1intro: r(
    "Narządy widziane od przodu — prawa strona ciała jest po lewej stronie rysunku. Dotknij narządu albo przejdź do trybu podpisywania.",
    "Органы, вид спереди, — правая сторона тела находится слева на рисунке. Нажми на орган или перейди в режим подписей.",
  ),
  s2: r("Droga pokarmu", "Путь пищи"),
  s2intro: r("Ułóż odcinki przewodu pokarmowego w kolejności, w jakiej przechodzi przez nie pokarm.", "Расставь отделы пищеварительного тракта в том порядке, в каком через них проходит пища."),
  s3: r("Śledź składnik pokarmowy", "Проследи за питательным веществом"),
  s3intro: r(
    "Wybierz składnik i przejdź z nim przez przewód pokarmowy. Zobacz, który enzym działa w danym miejscu i co z cząsteczki zostaje.",
    "Выбери вещество и пройди с ним по пищеварительному тракту. Посмотри, какой фермент где работает и что остаётся от молекулы.",
  ),
  s4: r("Enzymy i inne soki trawienne", "Ферменты и другие пищеварительные соки"),
  s4intro: r("Każdy enzym rozkłada tylko określony rodzaj związków.", "Каждый фермент расщепляет только определённый вид веществ."),
  s5: r("Wchłanianie w kosmku jelitowym", "Всасывание в кишечной ворсинке"),
  s5intro: r(
    "Kosmek to palczasty wyrostek błony śluzowej jelita cienkiego. Wybierz produkt trawienia i zobacz, dokąd trafia.",
    "Ворсинка — пальцевидный вырост слизистой оболочки тонкой кишки. Выбери продукт пищеварения и посмотри, куда он попадает.",
  ),
} satisfies Record<string, Txt>;

// ---------- digestive tract map ----------

type DPart = "mouth" | "salivary" | "pharynx" | "esophagus" | "liver" | "gallbladder" | "stomach" | "pancreas" | "duodenum" | "small" | "large" | "anus";

const PARTS: Record<DPart, MapPart> = {
  mouth: {
    name: r("Jama ustna", "Ротовая полость"),
    text: r(
      "Zęby rozdrabniają pokarm, język miesza go ze śliną i formuje kęs. Tu zaczyna się trawienie skrobi przez amylazę ślinową.",
      "Зубы измельчают пищу, язык перемешивает её со слюной и формирует пищевой комок. Здесь начинается переваривание крахмала амилазой слюны.",
    ),
    pin: [296, 70],
    to: [178, 80],
  },
  salivary: {
    name: r("Ślinianki", "Слюнные железы"),
    text: r(
      "Trzy pary dużych gruczołów: przyusznice, podżuchwowe i podjęzykowe. Wydzielają ok. 1–1,5 l śliny na dobę; ślina zawiera amylazę, śluz ułatwiający połykanie i lizozym niszczący bakterie.",
      "Три пары крупных желёз: околоушные, поднижнечелюстные и подъязычные. Выделяют около 1–1,5 л слюны в сутки; слюна содержит амилазу, слизь, облегчающую глотание, и лизоцим, разрушающий бактерии.",
    ),
    pin: [24, 66],
    to: [116, 66],
  },
  pharynx: {
    name: r("Gardło", "Глотка"),
    text: r(
      "Wspólny odcinek dróg pokarmowych i oddechowych. Podczas połykania nagłośnia zamyka wejście do krtani, a kęs trafia do przełyku.",
      "Общий участок пищеварительных и дыхательных путей. При глотании надгортанник закрывает вход в гортань, и комок попадает в пищевод.",
    ),
    pin: [296, 112],
    to: [168, 106],
  },
  esophagus: {
    name: r("Przełyk", "Пищевод"),
    text: r(
      "Umięśniona rura długości ok. 25 cm. Fale skurczów — perystaltyka — przesuwają kęs do żołądka nawet wtedy, gdy stoimy na głowie.",
      "Мышечная трубка длиной около 25 см. Волны сокращений — перистальтика — продвигают комок в желудок, даже если мы стоим на голове.",
    ),
    pin: [24, 150],
    to: [158, 160],
  },
  liver: {
    name: r("Wątroba", "Печень"),
    text: r(
      "Największy gruczoł ciała. Wytwarza żółć, magazynuje glikogen, odtruwa krew (np. z alkoholu i leków), wytwarza mocznik i białka osocza. Krew z jelit dopływa do niej żyłą wrotną.",
      "Самая крупная железа тела. Вырабатывает жёлчь, запасает гликоген, обезвреживает кровь (например, от алкоголя и лекарств), образует мочевину и белки плазмы. Кровь от кишечника приходит к ней по воротной вене.",
    ),
    pin: [24, 210],
    to: [100, 214],
  },
  gallbladder: {
    name: r("Pęcherzyk żółciowy", "Жёлчный пузырь"),
    text: r(
      "Magazynuje i zagęszcza żółć wytwarzaną przez wątrobę. Po tłustym posiłku kurczy się i wypuszcza ją do dwunastnicy.",
      "Накапливает и сгущает жёлчь, которую вырабатывает печень. После жирной еды сокращается и выпускает её в двенадцатиперстную кишку.",
    ),
    pin: [24, 256],
    to: [132, 250],
  },
  stomach: {
    name: r("Żołądek", "Желудок"),
    text: r(
      "Miesza pokarm z sokiem żołądkowym: kwas solny zakwasza treść (pH ok. 2) i zabija bakterie, pepsyna rozpoczyna trawienie białek, a śluz chroni ścianę przed samostrawieniem. Odźwiernik wypuszcza papkę porcjami do dwunastnicy.",
      "Перемешивает пищу с желудочным соком: соляная кислота подкисляет содержимое (pH около 2) и убивает бактерии, пепсин начинает переваривание белков, а слизь защищает стенку от самопереваривания. Привратник порциями выпускает кашицу в двенадцатиперстную кишку.",
    ),
    pin: [296, 200],
    to: [234, 226],
  },
  pancreas: {
    name: r("Trzustka", "Поджелудочная железа"),
    text: r(
      "Gruczoł o podwójnej funkcji. Wydziela sok trzustkowy z enzymami trawiącymi wszystkie grupy składników (amylaza, trypsyna, lipaza, nukleazy) i z wodorowęglanami, które zobojętniają kwaśną treść z żołądka. Jej wysepki wydzielają do krwi insulinę i glukagon.",
      "Железа с двойной функцией. Выделяет поджелудочный сок с ферментами, переваривающими все группы веществ (амилаза, трипсин, липаза, нуклеазы), и с гидрокарбонатами, нейтрализующими кислое содержимое из желудка. Её островки выделяют в кровь инсулин и глюкагон.",
    ),
    pin: [296, 262],
    to: [244, 278],
  },
  duodenum: {
    name: r("Dwunastnica", "Двенадцатиперстная кишка"),
    text: r(
      "Pierwszy odcinek jelita cienkiego. Uchodzą do niej przewody trzustki i wątroby, więc to tu zachodzi większość trawienia.",
      "Первый отдел тонкой кишки. В неё открываются протоки поджелудочной железы и печени, поэтому здесь идёт большая часть переваривания.",
    ),
    pin: [24, 300],
    to: [150, 296],
  },
  small: {
    name: r("Jelito cienkie", "Тонкая кишка"),
    text: r(
      "Najdłuższy odcinek przewodu — ma kilka metrów. Enzymy jelitowe kończą tu trawienie, a kosmki wchłaniają jego produkty. Fałdy, kosmki i mikrokosmki ogromnie zwiększają powierzchnię wchłaniania.",
      "Самый длинный отдел тракта — несколько метров. Кишечные ферменты завершают здесь переваривание, а ворсинки всасывают его продукты. Складки, ворсинки и микроворсинки многократно увеличивают поверхность всасывания.",
    ),
    pin: [296, 362],
    to: [208, 368],
  },
  large: {
    name: r("Jelito grube", "Толстая кишка"),
    text: r(
      "Ma ok. 1,5 m. Wchłania wodę i sole mineralne, formuje kał. Żyjące w nim bakterie częściowo rozkładają błonnik i wytwarzają witaminę K oraz niektóre witaminy z grupy B. Od jelita ślepego odchodzi wyrostek robaczkowy.",
      "Длина около 1,5 м. Всасывает воду и минеральные соли, формирует кал. Живущие в ней бактерии частично расщепляют пищевые волокна и синтезируют витамин K и некоторые витамины группы B. От слепой кишки отходит червеобразный отросток (аппендикс).",
    ),
    pin: [24, 360],
    to: [108, 360],
  },
  anus: {
    name: r("Odbyt", "Анальное отверстие"),
    text: r(
      "Końcowy otwór przewodu pokarmowego. Zamykają go dwa zwieracze: wewnętrzny z mięśni gładkich (niezależny od woli) i zewnętrzny z mięśni szkieletowych (zależny od woli).",
      "Конечное отверстие пищеварительного тракта. Его замыкают два сфинктера: внутренний из гладких мышц (непроизвольный) и наружный из скелетных мышц (произвольный).",
    ),
    pin: [296, 448],
    to: [171, 452],
  },
};

const TRACT = "#f472b6";

function TractMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<DPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 320 470"
      title={r("Układ pokarmowy człowieka", "Пищеварительная система человека")}
      labelOrder={["mouth", "salivary", "pharynx", "esophagus", "liver", "gallbladder", "stomach", "pancreas", "duodenum", "small", "large", "anus"]}
      pinRadius={12}
      maxWidth="max-w-[380px]"
      art={({ part, tone }) => (
        <>
          {/* the body outline */}
          <circle cx={160} cy={58} r={46} fill="#ffedd5" stroke="#fdba74" strokeWidth={2} />
          <rect x={140} y={96} width={40} height={36} fill="#ffedd5" />
          <path d="M62 156 C 62 136, 92 128, 132 126 L 188 126 C 228 128, 258 136, 258 156 L 250 400 C 248 440, 218 462, 160 462 C 102 462, 72 440, 70 400 Z" fill="#ffedd5" stroke="#fdba74" strokeWidth={2} />
          {part(
            "salivary",
            <g fill={tone("salivary", "#f9a8d4")} stroke="#be185d" strokeWidth={1.2}>
              <ellipse cx={118} cy={66} rx={7} ry={12} />
              <ellipse cx={202} cy={66} rx={7} ry={12} />
              <ellipse cx={136} cy={100} rx={8} ry={5} />
              <ellipse cx={184} cy={100} rx={8} ry={5} />
            </g>,
          )}
          {part("pharynx", <rect x={152} y={86} width={16} height={34} rx={6} fill={tone("pharynx", "#fda4af")} stroke="#be185d" strokeWidth={1.2} />)}
          {part(
            "mouth",
            <g>
              <ellipse cx={160} cy={80} rx={22} ry={10} fill={tone("mouth", "#fb7185")} stroke="#9f1239" strokeWidth={1.5} />
              <path d="M146 80 Q 160 72 174 80" stroke="#fecdd3" strokeWidth={3} fill="none" />
            </g>,
          )}
          {part("esophagus", <path d="M160 118 L 162 208" stroke={tone("esophagus", TRACT)} strokeWidth={9} strokeLinecap="round" fill="none" />)}
          {part(
            "small",
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M184 300 C 204 314, 204 332, 184 338 C 156 346, 126 334, 128 350 C 130 366, 208 354, 210 370 C 212 386, 140 378, 138 392 C 136 402, 130 406, 116 404"
                stroke={tone("small", "#f9a8d4")}
                strokeWidth={11}
              />
              <path d="M184 300 C 204 314, 204 332, 184 338 C 156 346, 126 334, 128 350 C 130 366, 208 354, 210 370 C 212 386, 140 378, 138 392 C 136 402, 130 406, 116 404" stroke="#fce7f3" strokeWidth={3} />
            </g>,
          )}
          {part(
            "large",
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M108 412 L 108 322 L 232 322 L 232 410 C 232 428, 196 428, 172 430 C 166 432, 166 438, 166 446" stroke={tone("large", "#fb923c")} strokeWidth={15} />
              <path d="M104 416 q -6 10 0 18" stroke={tone("large", "#fb923c")} strokeWidth={5} />
              {[340, 360, 380, 400].map((y) => (
                <path key={`l${y}`} d={`M101 ${y} L 115 ${y}`} stroke="#c2410c" strokeWidth={1} />
              ))}
              {[340, 360, 380, 400].map((y) => (
                <path key={`r${y}`} d={`M225 ${y} L 239 ${y}`} stroke="#c2410c" strokeWidth={1} />
              ))}
              {[130, 150, 170, 190, 210].map((x) => (
                <path key={`t${x}`} d={`M${x} 315 L ${x} 329`} stroke="#c2410c" strokeWidth={1} />
              ))}
            </g>,
          )}
          {part("anus", <circle cx={166} cy={452} r={6} fill={tone("anus", "#7c2d12")} />)}
          {part(
            "liver",
            <path d="M78 206 C 104 190, 168 188, 184 200 C 176 216, 156 236, 128 246 C 100 254, 78 240, 78 206 Z" fill={tone("liver", "#b45309")} stroke="#78350f" strokeWidth={1.5} />,
          )}
          {part("gallbladder", <ellipse cx={134} cy={248} rx={7} ry={11} fill={tone("gallbladder", "#65a30d")} stroke="#365314" strokeWidth={1.2} />)}
          {part(
            "stomach",
            <path
              d="M160 204 C 182 192, 238 194, 243 230 C 247 264, 214 284, 184 274 C 178 272, 174 268, 170 262 C 186 262, 200 254, 198 240 C 196 226, 180 218, 162 218 Z"
              fill={tone("stomach", "#f9a8d4")}
              stroke="#be185d"
              strokeWidth={1.5}
            />,
          )}
          {part(
            "pancreas",
            <path d="M182 288 C 200 280, 224 274, 246 270 C 252 276, 248 284, 242 285 C 222 289, 204 296, 184 298 Z" fill={tone("pancreas", "#fde68a")} stroke="#ca8a04" strokeWidth={1.5} />,
          )}
          {part("duodenum", <path d="M172 268 C 152 270, 146 300, 162 306 C 176 310, 186 304, 184 298" stroke={tone("duodenum", TRACT)} strokeWidth={9} strokeLinecap="round" fill="none" />)}
        </>
      )}
    />
  );
}

// ---------- the route ----------

const ROUTE: Txt[] = [
  r("gardło", "глотка"),
  r("przełyk", "пищевод"),
  r("żołądek", "желудок"),
  r("dwunastnica", "двенадцатиперстная кишка"),
  r("jelito czcze", "тощая кишка"),
  r("jelito kręte", "подвздошная кишка"),
  r("jelito ślepe (kątnica)", "слепая кишка"),
  r("okrężnica", "ободочная кишка"),
  r("odbytnica", "прямая кишка"),
  r("odbyt", "анальное отверстие"),
];

// ---------- follow a nutrient ----------

type Nutrient = "starch" | "protein" | "fat";
type FatState = "drop" | "emulsion" | "split" | "chylo";

interface Stage {
  enzyme: Txt | null;
  text: Txt;
  /** chains of units for starch and proteins; a state for fats */
  pieces: number[] | FatState;
  /** where the products go, shown at the last station */
  into?: "blood" | "lymph";
}

const STATIONS: { name: Txt; ph: string }[] = [
  { name: r("Jama ustna", "Ротовая полость"), ph: "≈ 7" },
  { name: r("Żołądek", "Желудок"), ph: "≈ 2" },
  { name: r("Dwunastnica", "Двенадцатиперстная кишка"), ph: "≈ 8" },
  { name: r("Jelito cienkie", "Тонкая кишка"), ph: "≈ 8" },
  { name: r("Kosmek jelitowy", "Кишечная ворсинка"), ph: "" },
];

const NUTRIENTS: Record<Nutrient, { name: Txt; stages: Stage[] }> = {
  starch: {
    name: r("Skrobia", "Крахмал"),
    stages: [
      {
        enzyme: r("amylaza ślinowa (ślinianki)", "амилаза слюны (слюнные железы)"),
        text: r("Rozcina skrobię na krótsze łańcuchy i dwucukier maltozę. Działa krótko, bo kęs szybko trafia dalej.", "Разрезает крахмал на более короткие цепи и дисахарид мальтозу. Работает недолго: комок быстро уходит дальше."),
        pieces: [5, 4, 3, 2, 2],
      },
      {
        enzyme: null,
        text: r("Gdy kęs przesiąknie kwasem solnym, amylaza ślinowa przestaje działać. Żołądek nie wydziela enzymów trawiących węglowodany.", "Когда комок пропитывается соляной кислотой, амилаза слюны перестаёт работать. Желудок не выделяет ферментов, переваривающих углеводы."),
        pieces: [5, 4, 3, 2, 2],
      },
      {
        enzyme: r("amylaza trzustkowa (sok trzustkowy)", "амилаза поджелудочного сока"),
        text: r("Rozkłada resztę skrobi do maltozy.", "Расщепляет остаток крахмала до мальтозы."),
        pieces: [2, 2, 2, 2, 2, 2, 2, 2],
      },
      {
        enzyme: r("maltaza i inne enzymy jelitowe (nabłonek jelita)", "мальтаза и другие кишечные ферменты (эпителий кишки)"),
        text: r("Maltaza rozkłada maltozę na dwie cząsteczki glukozy; sacharaza i laktaza rozkładają inne dwucukry.", "Мальтаза расщепляет мальтозу на две молекулы глюкозы; сахараза и лактаза расщепляют другие дисахариды."),
        pieces: Array.from({ length: 16 }, () => 1),
      },
      {
        enzyme: null,
        text: r("Glukoza przechodzi przez nabłonek kosmka do naczyń włosowatych krwionośnych, a dalej żyłą wrotną do wątroby.", "Глюкоза проходит через эпителий ворсинки в кровеносные капилляры, а дальше по воротной вене — в печень."),
        pieces: Array.from({ length: 16 }, () => 1),
        into: "blood",
      },
    ],
  },
  protein: {
    name: r("Białko", "Белок"),
    stages: [
      {
        enzyme: null,
        text: r("Białka są tu tylko rozdrabniane mechanicznie — ślina nie zawiera enzymów trawiących białka.", "Белки здесь только механически измельчаются — в слюне нет ферментов, переваривающих белки."),
        pieces: [16],
      },
      {
        enzyme: r("pepsyna (gruczoły żołądka)", "пепсин (железы желудка)"),
        text: r(
          "Wydzielana jako nieczynny pepsynogen, który kwas solny przekształca w pepsynę. Kwas denaturuje białka, a pepsyna tnie je na krótsze polipeptydy.",
          "Выделяется в виде неактивного пепсиногена, который соляная кислота превращает в пепсин. Кислота денатурирует белки, а пепсин разрезает их на более короткие полипептиды.",
        ),
        pieces: [6, 5, 5],
      },
      {
        enzyme: r("trypsyna (sok trzustkowy)", "трипсин (поджелудочный сок)"),
        text: r(
          "Wydzielana jako nieczynny trypsynogen; uaktywnia go enterokinaza jelitowa. Trypsyna tnie polipeptydy na krótkie peptydy.",
          "Выделяется в виде неактивного трипсиногена; его активирует кишечная энтерокиназа. Трипсин разрезает полипептиды на короткие пептиды.",
        ),
        pieces: [3, 3, 2, 3, 2, 3],
      },
      {
        enzyme: r("peptydazy (nabłonek jelita)", "пептидазы (эпителий кишки)"),
        text: r("Odcinają od krótkich peptydów kolejne aminokwasy.", "Отщепляют от коротких пептидов аминокислоты одну за другой."),
        pieces: Array.from({ length: 16 }, () => 1),
      },
      {
        enzyme: null,
        text: r("Aminokwasy wchłaniają się do naczyń włosowatych krwionośnych kosmka i żyłą wrotną płyną do wątroby.", "Аминокислоты всасываются в кровеносные капилляры ворсинки и по воротной вене идут в печень."),
        pieces: Array.from({ length: 16 }, () => 1),
        into: "blood",
      },
    ],
  },
  fat: {
    name: r("Tłuszcz", "Жир"),
    stages: [
      {
        enzyme: null,
        text: r("Tłuszcze nie są tu trawione — tylko rozdrabniane razem z resztą kęsa.", "Жиры здесь не перевариваются — только измельчаются вместе с остальным комком."),
        pieces: "drop",
      },
      {
        enzyme: null,
        text: r("Tłuszcze są trawione bardzo słabo; tłusty posiłek dłużej zalega w żołądku.", "Жиры перевариваются очень слабо; жирная еда дольше задерживается в желудке."),
        pieces: "drop",
      },
      {
        enzyme: r("żółć (wątroba) + lipaza trzustkowa", "жёлчь (печень) + липаза поджелудочного сока"),
        text: r(
          "Żółć nie zawiera enzymów — emulguje tłuszcz, rozbijając go na drobne kropelki. Dzięki temu rośnie powierzchnia, na której działa lipaza.",
          "Жёлчь не содержит ферментов — она эмульгирует жир, разбивая его на мелкие капельки. Благодаря этому растёт поверхность, на которой работает липаза.",
        ),
        pieces: "emulsion",
      },
      {
        enzyme: r("lipaza", "липаза"),
        text: r("Rozkład tłuszczów kończy się — powstają glicerol i kwasy tłuszczowe.", "Расщепление жиров завершается — образуются глицерин и жирные кислоты."),
        pieces: "split",
      },
      {
        enzyme: null,
        text: r(
          "Glicerol i kwasy tłuszczowe wnikają do komórek nabłonka, gdzie znów łączą się w tłuszcze. Otoczone białkami kropelki trafiają do naczynia chłonnego, a z limfą — do krwi.",
          "Глицерин и жирные кислоты проникают в клетки эпителия, где снова соединяются в жиры. Окружённые белками капельки попадают в лимфатический сосуд, а с лимфой — в кровь.",
        ),
        pieces: "chylo",
        into: "lymph",
      },
    ],
  },
};

const SAME = r("bez zmian", "без изменений");

/** what is left of the nutrient after each station (none at the villus) */
const RESULT: Record<Nutrient, (Txt | null)[]> = {
  starch: [r("krótsze łańcuchy i maltoza", "более короткие цепи и мальтоза"), SAME, r("maltoza", "мальтоза"), r("glukoza", "глюкоза"), null],
  protein: [SAME, r("polipeptydy", "полипептиды"), r("krótkie peptydy", "короткие пептиды"), r("aminokwasy", "аминокислоты"), null],
  fat: [SAME, SAME, r("drobne kropelki tłuszczu (emulsja), pierwsze produkty rozkładu", "мелкие капельки жира (эмульсия), первые продукты расщепления"), r("glicerol i kwasy tłuszczowe", "глицерин и жирные кислоты"), null],
};

const AA = ["#fda4af", "#a5b4fc", "#86efac", "#fcd34d", "#c4b5fd", "#67e8f9"];

function hexPath(cx: number, cy: number, s: number): string {
  return (
    Array.from({ length: 6 }, (_, k) => {
      const a = (Math.PI / 3) * k + Math.PI / 6;
      return `${k ? "L" : "M"}${(cx + s * Math.cos(a)).toFixed(1)} ${(cy + s * Math.sin(a)).toFixed(1)}`;
    }).join(" ") + " Z"
  );
}

function unit(n: Nutrient, k: number, x: number, y: number, s: number): ReactNode {
  return n === "starch" ? (
    <path key={k} d={hexPath(x, y, s)} fill="#fde68a" stroke="#b45309" strokeWidth={1.5} />
  ) : (
    <circle key={k} cx={x} cy={y} r={s} fill={AA[(k * 5) % AA.length]} stroke="#475569" strokeWidth={1} />
  );
}

/** chains laid out left to right, wrapping to a second row */
function Chains({ n, pieces }: { n: Nutrient; pieces: number[] }) {
  const out: ReactNode[] = [];
  let x = 22;
  let y = 82;
  let k = 0;
  for (const [p, len] of pieces.entries()) {
    if (x + (len - 1) * 16 > 300) {
      x = 22;
      y += 32;
    }
    if (len > 1) out.push(<path key={`b${p}`} d={`M${x} ${y} L ${x + (len - 1) * 16} ${y}`} stroke="#64748b" strokeWidth={2} />);
    for (let j = 0; j < len; j++) out.push(unit(n, k++, x + j * 16, y, 7));
    x += (len - 1) * 16 + 26;
  }
  return <g>{out}</g>;
}

const FAT_SPOTS: [number, number][] = [
  [60, 84], [92, 100], [124, 80], [150, 108], [178, 86], [206, 104], [236, 82], [266, 102], [80, 120], [140, 124], [200, 126], [252, 124],
];

function Fats({ state }: { state: FatState }) {
  if (state === "drop") return <circle cx={160} cy={100} r={32} fill="#fde047" stroke="#ca8a04" strokeWidth={2} />;
  if (state === "emulsion")
    return (
      <g>
        {FAT_SPOTS.map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r={k % 3 ? 8 : 6} fill="#fde047" stroke="#ca8a04" strokeWidth={1.5} />
        ))}
      </g>
    );
  if (state === "split")
    return (
      <g>
        {FAT_SPOTS.slice(0, 4).map(([x, y], k) => (
          <rect key={`g${k}`} x={x - 4} y={y - 10} width={8} height={20} rx={3} fill="#bae6fd" stroke="#0369a1" strokeWidth={1.2} />
        ))}
        {FAT_SPOTS.slice(4).map(([x, y], k) => (
          <path key={`f${k}`} d={`M${x - 14} ${y} l 7 -5 l 7 5 l 7 -5 l 7 5`} fill="none" stroke="#a16207" strokeWidth={2.5} strokeLinejoin="round" />
        ))}
      </g>
    );
  return null;
}

const FOLLOW_T = {
  enzyme: r("Działa:", "Работает:"),
  result: r("Wynik:", "Результат:"),
  none: r("brak enzymu dla tego składnika", "фермента для этого вещества нет"),
  prev: r("Wstecz", "Назад"),
  blood: r("krew", "кровь"),
  lymph: r("limfa", "лимфа"),
  station: r("Etap", "Этап"),
};

function FollowFood({ lang }: { lang: BioLang }) {
  const [n, setN] = useState<Nutrient>("starch");
  const [i, setI] = useState(0);
  const stage = NUTRIENTS[n].stages[i]!;
  const station = STATIONS[i]!;
  const xs = [36, 98, 160, 222, 284];
  const into = stage.into;
  const result = RESULT[n][i];
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(NUTRIENTS) as Nutrient[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={n === k}
            onClick={() => {
              setN(k);
              setI(0);
            }}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              n === k ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {NUTRIENTS[k].name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 320 196" className="w-full select-none" role="img" aria-label={`${NUTRIENTS[n].name[lang]} — ${station.name[lang]}`}>
            <rect width={320} height={196} rx={12} fill="#f8fafc" />
            <path d="M36 26 L 284 26" stroke="#f9a8d4" strokeWidth={8} strokeLinecap="round" />
            {xs.map((x, k) => (
              <g
                key={k}
                role="button"
                tabIndex={0}
                aria-label={`${FOLLOW_T.station[lang]} ${k + 1}: ${STATIONS[k]!.name[lang]}`}
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
                <circle cx={x} cy={26} r={k === i ? 15 : 12} fill={k === i ? "#059669" : k < i ? "#a7f3d0" : "white"} stroke={k <= i ? "#059669" : "#cbd5e1"} strokeWidth={2} />
                <text x={x} y={31} textAnchor="middle" fontSize={12} fontWeight={700} fill={k === i ? "white" : "#334155"}>
                  {k + 1}
                </text>
              </g>
            ))}
            {!into && (typeof stage.pieces === "string" ? <Fats state={stage.pieces} /> : <Chains n={n} pieces={stage.pieces} />)}
            <g opacity={into ? 1 : 0.35}>
              <rect x={14} y={150} width={140} height={38} rx={10} fill="#fee2e2" stroke={into === "blood" ? "#dc2626" : "#fca5a5"} strokeWidth={into === "blood" ? 3 : 1.5} />
              <text x={24} y={164} fontSize={10} fontWeight={600} fill="#991b1b">
                {FOLLOW_T.blood[lang]}
              </text>
              <rect x={166} y={150} width={140} height={38} rx={10} fill="#fef9c3" stroke={into === "lymph" ? "#ca8a04" : "#fde68a"} strokeWidth={into === "lymph" ? 3 : 1.5} />
              <text x={176} y={164} fontSize={10} fontWeight={600} fill="#854d0e">
                {FOLLOW_T.lymph[lang]}
              </text>
            </g>
            {into === "blood" && <g>{Array.from({ length: 12 }, (_, k) => unit(n, k, 28 + (k % 6) * 21 + (k >= 6 ? 11 : 0), k < 6 ? 172 : 182, 4.5))}</g>}
            {into === "lymph" && (
              <g>
                {Array.from({ length: 8 }, (_, k) => (
                  <circle key={k} cx={186 + k * 15} cy={176} r={5} fill="#fde047" stroke="#ca8a04" strokeWidth={1.2} />
                ))}
              </g>
            )}
            {into && (
              <path d={into === "blood" ? "M84 66 L 84 140 M76 132 L 84 140 L 92 132" : "M236 66 L 236 140 M228 132 L 236 140 L 244 132"} stroke="#059669" strokeWidth={3} fill="none" />
            )}
          </svg>
          <div className="mt-3 flex flex-wrap gap-2">
            <Choice disabled={i === 0} onClick={() => setI(i - 1)}>
              ‹ {FOLLOW_T.prev[lang]}
            </Choice>
            {i < STATIONS.length - 1 ? (
              <Choice state="active" onClick={() => setI(i + 1)}>
                {KIT.next[lang]} ›
              </Choice>
            ) : (
              <Choice onClick={() => setI(0)}>↺ {KIT.again[lang]}</Choice>
            )}
          </div>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <div className="text-xs font-medium text-emerald-700">
            {FOLLOW_T.station[lang]} {i + 1} / {STATIONS.length}
            {station.ph && <> · pH {station.ph}</>}
          </div>
          <h3 className="text-base font-semibold text-emerald-900">{station.name[lang]}</h3>
          {i < STATIONS.length - 1 && (
            <p className="mt-1.5 text-sm text-emerald-900">
              <span className="font-semibold">{FOLLOW_T.enzyme[lang]}</span> {stage.enzyme ? stage.enzyme[lang] : <span className="italic text-slate-500">{FOLLOW_T.none[lang]}</span>}
            </p>
          )}
          <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{stage.text[lang]}</p>
          {result && (
            <p className="mt-2 rounded-lg bg-white/70 px-3 py-1.5 text-sm text-emerald-900">
              <span className="font-semibold">{FOLLOW_T.result[lang]}</span> {result[lang]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- enzymes quiz ----------

const TARGETS: QuizOption[] = [
  { id: "sugar", label: r("węglowodany (skrobia, dwucukry)", "углеводы (крахмал, дисахариды)") },
  { id: "protein", label: r("białka", "белки") },
  { id: "fat", label: r("tłuszcze", "жиры") },
  { id: "nucleic", label: r("kwasy nukleinowe", "нуклеиновые кислоты") },
  { id: "none", label: r("nie trawi — tylko wspomaga trawienie", "не переваривает — только помогает пищеварению") },
];

const ENZYME_ITEMS: QuizItem[] = [
  { icon: "👄", name: r("amylaza ślinowa", "амилаза слюны"), answer: "sugar", explain: r("Wydzielana przez ślinianki, rozkłada skrobię do maltozy już w jamie ustnej.", "Выделяется слюнными железами и расщепляет крахмал до мальтозы уже во рту.") },
  { icon: "🧪", name: r("pepsyna", "пепсин"), answer: "protein", explain: r("Działa w kwaśnym środowisku żołądka i tnie białka na polipeptydy.", "Работает в кислой среде желудка и разрезает белки на полипептиды.") },
  { icon: "🟢", name: r("żółć", "жёлчь"), answer: "none", explain: r("Nie zawiera enzymów; emulguje tłuszcze, ułatwiając pracę lipazy.", "Не содержит ферментов; эмульгирует жиры, облегчая работу липазы.") },
  { icon: "🟡", name: r("lipaza trzustkowa", "липаза поджелудочного сока"), answer: "fat", explain: r("Rozkłada tłuszcze do glicerolu i kwasów tłuszczowych w dwunastnicy.", "Расщепляет жиры до глицерина и жирных кислот в двенадцатиперстной кишке.") },
  { icon: "✂️", name: r("trypsyna", "трипсин"), answer: "protein", explain: r("Enzym soku trzustkowego, trawi białka w zasadowym środowisku jelita cienkiego.", "Фермент поджелудочного сока, переваривает белки в щелочной среде тонкой кишки.") },
  { icon: "⚗️", name: r("kwas solny", "соляная кислота"), answer: "none", explain: r("Nie jest enzymem: zakwasza treść żołądka, przekształca pepsynogen w pepsynę i zabija bakterie.", "Не фермент: подкисляет содержимое желудка, превращает пепсиноген в пепсин и убивает бактерии.") },
  { icon: "🧬", name: r("nukleazy", "нуклеазы"), answer: "nucleic", explain: r("Enzymy soku trzustkowego rozkładające DNA i RNA do nukleotydów.", "Ферменты поджелудочного сока, расщепляющие ДНК и РНК до нуклеотидов.") },
  { icon: "🍬", name: r("maltaza", "мальтаза"), answer: "sugar", explain: r("Enzym jelitowy — rozkłada maltozę do dwóch cząsteczek glukozy.", "Кишечный фермент — расщепляет мальтозу до двух молекул глюкозы.") },
  { icon: "🥛", name: r("laktaza", "лактаза"), answer: "sugar", explain: r("Rozkłada cukier mleczny — laktozę. Jej niedobór powoduje nietolerancję laktozy.", "Расщепляет молочный сахар — лактозу. Её нехватка вызывает непереносимость лактозы.") },
];

// ---------- villus ----------

type Product = "glucose" | "amino" | "fatty" | "vitamins";

const BLOOD_PATHS = [
  "M40 30 C 80 40, 110 70, 126 98 C 146 74, 182 74, 196 100 L 196 250",
  "M282 24 C 250 40, 214 70, 198 100 L 196 250",
  "M150 8 C 150 36, 160 60, 186 84 C 192 92, 196 100, 196 120 L 196 250",
];
const LYMPH_PATHS = ["M160 6 L 160 250", "M110 18 C 140 40, 156 70, 160 112 L 160 250", "M214 18 C 182 40, 164 70, 160 112 L 160 250"];

const PRODUCTS: Record<Product, { name: Txt; into: "blood" | "lymph"; color: string; text: Txt }> = {
  glucose: {
    name: r("glukoza", "глюкоза"),
    into: "blood",
    color: "#f59e0b",
    text: r(
      "Glukoza przechodzi przez komórki nabłonka do naczyń włosowatych krwionośnych. Krew z kosmków zbiera żyła wrotna i prowadzi do wątroby, która magazynuje nadmiar glukozy jako glikogen.",
      "Глюкоза проходит через клетки эпителия в кровеносные капилляры. Кровь от ворсинок собирает воротная вена и несёт в печень, которая запасает избыток глюкозы в виде гликогена.",
    ),
  },
  amino: {
    name: r("aminokwasy", "аминокислоты"),
    into: "blood",
    color: "#e11d48",
    text: r(
      "Aminokwasy, tak jak glukoza, wchłaniają się do krwi i żyłą wrotną płyną do wątroby, a stamtąd do wszystkich komórek, które budują z nich własne białka.",
      "Аминокислоты, как и глюкоза, всасываются в кровь и по воротной вене идут в печень, а оттуда ко всем клеткам, которые строят из них собственные белки.",
    ),
  },
  fatty: {
    name: r("glicerol i kwasy tłuszczowe", "глицерин и жирные кислоты"),
    into: "lymph",
    color: "#ca8a04",
    text: r(
      "W komórkach nabłonka znów łączą się w tłuszcze. Otoczone białkami kropelki trafiają do naczynia chłonnego, a z limfą — przez przewód piersiowy — do krwi, z pominięciem wątroby.",
      "В клетках эпителия они снова соединяются в жиры. Окружённые белками капельки попадают в лимфатический сосуд, а с лимфой — через грудной проток — в кровь, минуя печень.",
    ),
  },
  vitamins: {
    name: r("witaminy A, D, E, K", "витамины A, D, E, K"),
    into: "lymph",
    color: "#16a34a",
    text: r(
      "Witaminy rozpuszczalne w tłuszczach wchłaniają się razem z tłuszczami — do naczynia chłonnego. Gdy brakuje żółci, trawienie tłuszczów słabnie i pojawiają się niedobory tych witamin.",
      "Жирорастворимые витамины всасываются вместе с жирами — в лимфатический сосуд. Когда не хватает жёлчи, переваривание жиров ослабевает и возникает нехватка этих витаминов.",
    ),
  },
};

function Villus({ lang }: { lang: BioLang }) {
  const [p, setP] = useState<Product>("glucose");
  const prod = PRODUCTS[p];
  const paths = prod.into === "blood" ? BLOOD_PATHS : LYMPH_PATHS;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(PRODUCTS) as Product[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={p === k}
            onClick={() => setP(k)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              p === k ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {PRODUCTS[k].name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 320 260" className="mx-auto w-full max-w-[420px] select-none" role="img" aria-label={lang === "pl" ? "Przekrój kosmka jelitowego" : "Разрез кишечной ворсинки"}>
          <rect width={320} height={260} rx={12} fill="#fefce8" />
          <text x={12} y={18} fontSize={10} fill="#854d0e">
            {lang === "pl" ? "światło jelita" : "просвет кишки"}
          </text>
          <path d="M96 260 L 96 96 C 96 36, 224 36, 224 96 L 224 260" fill="none" stroke="#fb7185" strokeWidth={8} strokeDasharray="1.5 3" />
          <path d="M100 260 L 100 96 C 100 42, 220 42, 220 96 L 220 260" fill="#fecdd3" stroke="#e11d48" strokeWidth={2} />
          <path d="M112 260 L 112 98 C 112 56, 208 56, 208 98 L 208 260" fill="#fff1f2" />
          <path d="M124 260 L 124 100 C 124 70, 160 66, 160 66" fill="none" stroke={prod.into === "blood" ? "#ef4444" : "#fca5a5"} strokeWidth={5} />
          <path d="M160 66 C 160 66, 196 70, 196 100 L 196 260" fill="none" stroke={prod.into === "blood" ? "#991b1b" : "#d6a5a5"} strokeWidth={5} />
          <path d="M152 260 L 152 106 C 152 94, 168 94, 168 106 L 168 260 Z" fill={prod.into === "lymph" ? "#fde68a" : "#fef9c3"} stroke="#ca8a04" strokeWidth={prod.into === "lymph" ? 2.5 : 1.5} />
          <g fontSize={10} fill="#334155">
            <path d="M70 178 L 122 178" stroke="#64748b" strokeWidth={1} />
            <text x={6} y={170}>{lang === "pl" ? "naczynia" : "кровеносные"}</text>
            <text x={6} y={182}>{lang === "pl" ? "krwionośne" : "капилляры"}</text>
            <path d="M262 214 L 170 214" stroke="#64748b" strokeWidth={1} />
            <text x={314} y={202} textAnchor="end">
              {lang === "pl" ? "naczynie" : "лимфатический"}
            </text>
            <text x={314} y={214} textAnchor="end">
              {lang === "pl" ? "chłonne" : "сосуд"}
            </text>
            <path d="M244 52 L 214 64" stroke="#64748b" strokeWidth={1} />
            <text x={314} y={34} textAnchor="end">
              {lang === "pl" ? "nabłonek z" : "эпителий с"}
            </text>
            <text x={314} y={46} textAnchor="end">
              {lang === "pl" ? "mikrokosmkami" : "микроворсинками"}
            </text>
          </g>
          {paths.map((d, k) =>
            [0, 1].map((j) => (
              <circle key={`${p}-${k}-${j}`} r={5} fill={prod.color} stroke="white" strokeWidth={1.5}>
                <animateMotion dur="3s" begin={`${-(k * 0.9 + j * 1.5)}s`} repeatCount="indefinite" path={d} />
              </circle>
            )),
          )}
        </svg>
        <div className="space-y-3" aria-live="polite">
          <p className={`rounded-xl px-4 py-3 text-[15px] font-semibold ring-1 ${prod.into === "blood" ? "bg-rose-50 text-rose-900 ring-rose-200" : "bg-amber-50 text-amber-900 ring-amber-200"}`}>
            {prod.name[lang]} → {prod.into === "blood" ? (lang === "pl" ? "naczynia krwionośne" : "кровеносные капилляры") : lang === "pl" ? "naczynie chłonne" : "лимфатический сосуд"}
          </p>
          <p className="text-[15px] leading-relaxed text-slate-700">{prod.text[lang]}</p>
        </div>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Gruczoły poza przewodem pokarmowym: ślinianki, wątroba i trzustka — ich wydzieliny uchodzą do jamy ustnej i dwunastnicy.", ru: "Железы вне пищеварительного тракта: слюнные, печень и поджелудочная — их секреты поступают в ротовую полость и двенадцатиперстную кишку." },
    { pl: "Wątroba wytwarza żółć, pęcherzyk żółciowy ją magazynuje.", ru: "Печень вырабатывает жёлчь, жёлчный пузырь её накапливает." },
  ],
  s2: [{ pl: "Jelito cienkie: dwunastnica → jelito czcze → jelito kręte; jelito grube: jelito ślepe → okrężnica → odbytnica.", ru: "Тонкая кишка: двенадцатиперстная → тощая → подвздошная; толстая кишка: слепая → ободочная → прямая." }],
  s3: [
    { pl: "Skrobia → glukoza, białka → aminokwasy, tłuszcze → glicerol i kwasy tłuszczowe.", ru: "Крахмал → глюкоза, белки → аминокислоты, жиры → глицерин и жирные кислоты." },
    { pl: "Trawienie kończy się w jelicie cienkim; większość enzymów działa w środowisku zasadowym, pepsyna — w kwaśnym.", ru: "Переваривание заканчивается в тонкой кишке; большинство ферментов работает в щелочной среде, пепсин — в кислой." },
  ],
  s4: [{ pl: "Żółć i kwas solny nie są enzymami: żółć emulguje tłuszcze, kwas aktywuje pepsynę i niszczy bakterie.", ru: "Жёлчь и соляная кислота — не ферменты: жёлчь эмульгирует жиры, кислота активирует пепсин и уничтожает бактерии." }],
  s5: [
    { pl: "Glukoza i aminokwasy → krew → żyła wrotna → wątroba; tłuszcze → naczynie chłonne → limfa.", ru: "Глюкоза и аминокислоты → кровь → воротная вена → печень; жиры → лимфатический сосуд → лимфа." },
    { pl: "Powierzchnię wchłaniania zwiększają fałdy błony śluzowej, kosmki i mikrokosmki.", ru: "Поверхность всасывания увеличивают складки слизистой оболочки, ворсинки и микроворсинки." },
  ],
};

export default function DigestionLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="dig" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="dig-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <TractMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="dig-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.s2} start={r("jama ustna", "ротовая полость")} steps={ROUTE} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="dig-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <FollowFood lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="dig-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s4}
          question={r("Co rozkłada", "Что расщепляет")}
          options={TARGETS}
          items={ENZYME_ITEMS}
          wrongHint={r("Pomyśl, gdzie ta substancja działa i co tam jest trawione.", "Подумай, где действует это вещество и что там переваривается.")}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="dig-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Villus lang={lang} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
