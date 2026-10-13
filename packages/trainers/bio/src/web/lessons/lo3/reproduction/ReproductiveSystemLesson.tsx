// Lesson for LO3 §11.2 "Budowa i funkcje męskich narządów rozrodczych" and §11.3 "Budowa i funkcje
// żeńskich narządów rozrodczych" (zakres rozszerzony) — one lesson for both, since gametogenesis and
// the hormones are best compared side by side. Terms follow templates/data/systems.ts
// (REPRODUCTION_PARTS), systemsMore.ts (MALE_PARTS) and hormones.ts (FSH, LH, estrogeny, progesteron).
// Drawings are schematic, textbook-style anatomical diagrams.
import { useEffect, useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, PartMap, type CompareCard, type MapPart } from "../../games.tsx";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Narządy rozrodcze wytwarzają gamety i hormony płciowe. Jądra produkują plemniki stale, miliony na dobę, a jajniki zwykle uwalniają jedną komórkę jajową na cykl. Rytm pracy jajnika i macicy wyznacza cykl miesiączkowy, sterowany przez hormony przysadki i jajnika.",
    "Половые органы образуют гаметы и половые гормоны. Семенники производят сперматозоиды постоянно, миллионами в сутки, а яичники обычно выпускают одну яйцеклетку за цикл. Ритм работы яичника и матки задаёт менструальный цикл, который регулируют гормоны гипофиза и яичника.",
  ),
  s1: r("Męski układ rozrodczy", "Мужская половая система"),
  s1intro: r("Schematyczny przekrój miednicy mężczyzny widziany z boku; przód ciała jest po prawej stronie rysunku.", "Схематический разрез мужского таза сбоку; передняя сторона тела справа на рисунке."),
  s2: r("Żeński układ rozrodczy", "Женская половая система"),
  s2intro: r("Schematyczny przekrój narządów wewnętrznych widzianych od przodu.", "Схематический разрез внутренних органов, вид спереди."),
  s3: r("Plemnik i komórka jajowa", "Сперматозоид и яйцеклетка"),
  s3intro: r(
    "Gamety bardzo się różnią: plemnik jest mały i ruchliwy, komórka jajowa — duża, nieruchoma i bogata w substancje zapasowe. Rysunek nie zachowuje skali: komórka jajowa jest naprawdę wiele razy większa od główki plemnika.",
    "Гаметы сильно различаются: сперматозоид маленький и подвижный, яйцеклетка — крупная, неподвижная и богатая запасными веществами. Рисунок не в масштабе: яйцеклетка на самом деле во много раз больше головки сперматозоида.",
  ),
  s4: r("Spermatogeneza i oogeneza", "Сперматогенез и оогенез"),
  s4intro: r("Obie gametogenezy obejmują mejozę, ale różnią się miejscem, czasem i liczbą powstających gamet.", "Оба гаметогенеза включают мейоз, но различаются местом, временем и числом образующихся гамет."),
  s5: r("Cykl miesiączkowy", "Менструальный цикл"),
  s5intro: r(
    "Przesuń suwak przez 28 dni modelowego cyklu. Obserwuj stężenia hormonów, to, co dzieje się w jajniku, i grubość błony śluzowej macicy. Faza folikularna jajnika zaczyna się już w czasie miesiączki. Długość cyklu bywa różna — owulacja następuje ok. 14 dni przed kolejną miesiączką.",
    "Передвигай ползунок по 28 дням модельного цикла. Следи за уровнем гормонов, за тем, что происходит в яичнике, и за толщиной слизистой оболочки матки. Фолликулярная фаза в яичнике начинается уже во время менструации. Длина цикла бывает разной — овуляция происходит примерно за 14 дней до следующей менструации.",
  ),
} satisfies Record<string, Txt>;

// ---------- male map ----------

type MPart = "testis" | "epid" | "scrotum" | "vas" | "sv" | "prostate" | "urethra" | "penis" | "bladder";

const MALE: Record<MPart, MapPart> = {
  testis: {
    name: r("Jądro", "Семенник"),
    text: r(
      "Parzysty gruczoł płciowy. W kanalikach nasiennych powstają plemniki, a komórki Leydiga leżące między kanalikami wydzielają testosteron.",
      "Парная половая железа. В семенных канальцах образуются сперматозоиды, а клетки Лейдига, лежащие между канальцами, выделяют тестостерон.",
    ),
    pin: [150, 282],
    to: [220, 260],
  },
  epid: {
    name: r("Najądrze", "Придаток семенника"),
    text: r("Przylega do jądra. Plemniki dojrzewają tu — uzyskują zdolność ruchu — i są magazynowane.", "Прилегает к семеннику. Здесь сперматозоиды созревают — приобретают подвижность — и хранятся."),
    pin: [150, 236],
    to: [205, 250],
  },
  scrotum: {
    name: r("Moszna", "Мошонка"),
    text: r(
      "Worek skórno-mięśniowy, w którym leżą jądra — poza jamą brzuszną. Utrzymuje je w temperaturze o 2–3 °C niższej niż temperatura ciała, co jest konieczne do wytwarzania plemników.",
      "Кожно-мышечный мешок, в котором лежат семенники, — вне брюшной полости. Поддерживает их температуру на 2–3 °C ниже температуры тела, что необходимо для образования сперматозоидов.",
    ),
    pin: [300, 286],
    to: [254, 266],
  },
  vas: {
    name: r("Nasieniowód", "Семявыносящий проток"),
    text: r(
      "Przewód wyprowadzający plemniki z najądrza. Biegnie przez kanał pachwinowy do jamy brzusznej, okrąża pęcherz moczowy i uchodzi do cewki moczowej w obrębie gruczołu krokowego.",
      "Проток, выводящий сперматозоиды из придатка. Идёт через паховый канал в брюшную полость, огибает мочевой пузырь и впадает в мочеиспускательный канал в области предстательной железы.",
    ),
    pin: [318, 52],
    to: [246, 70],
  },
  sv: {
    name: r("Pęcherzyk nasienny", "Семенной пузырёк"),
    text: r(
      "Parzysty gruczoł leżący za pęcherzem moczowym. Wydziela płyn bogaty we fruktozę — źródło energii dla plemników; stanowi on większą część nasienia.",
      "Парная железа позади мочевого пузыря. Выделяет жидкость, богатую фруктозой, — источник энергии для сперматозоидов; она составляет большую часть спермы.",
    ),
    pin: [56, 84],
    to: [134, 96],
  },
  prostate: {
    name: r("Gruczoł krokowy (prostata)", "Предстательная железа (простата)"),
    text: r(
      "Leży pod pęcherzem moczowym i otacza początkowy odcinek cewki moczowej. Wydziela płyn z enzymami i cynkiem, który wchodzi w skład nasienia i pobudza ruch plemników.",
      "Лежит под мочевым пузырём и окружает начальный отдел мочеиспускательного канала. Выделяет жидкость с ферментами и цинком, которая входит в состав спермы и активирует сперматозоиды.",
    ),
    pin: [70, 150],
    to: [176, 124],
  },
  urethra: {
    name: r("Cewka moczowa", "Мочеиспускательный канал"),
    text: r("U mężczyzny jest wspólną drogą wyprowadzania moczu i nasienia; biegnie przez gruczoł krokowy i prącie.", "У мужчин это общий путь выведения мочи и спермы; проходит через предстательную железу и половой член."),
    pin: [130, 200],
    to: [204, 151],
  },
  penis: {
    name: r("Prącie", "Половой член"),
    text: r("Zewnętrzny narząd zbudowany z ciał jamistych; przez jego środek biegnie końcowy odcinek cewki moczowej.", "Наружный орган, образованный пещеристыми телами; через него проходит конечный отдел мочеиспускательного канала."),
    pin: [336, 186],
    to: [288, 214],
  },
  bladder: {
    name: r("Pęcherz moczowy", "Мочевой пузырь"),
    text: r("Należy do układu moczowego — zaznaczony, żeby łatwiej było zorientować się w położeniu narządów rozrodczych.", "Относится к мочевыделительной системе — показан, чтобы было легче ориентироваться в положении половых органов."),
  },
};

function MaleMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<MPart>
      lang={lang}
      parts={MALE}
      viewBox="0 0 360 300"
      title={r("Męski układ rozrodczy", "Мужская половая система")}
      labelOrder={["testis", "epid", "scrotum", "vas", "sv", "prostate", "urethra", "penis"]}
      pinRadius={13}
      art={({ part, tone }) => (
        <>
          <rect x={276} y={88} width={18} height={42} rx={8} fill="#e7e5e4" stroke="#a8a29e" strokeWidth={1.5} />
          <text x={292} y={80} textAnchor="middle" fontSize={9} fill="#78716c">
            {lang === "pl" ? "kość łonowa" : "лобковая кость"}
          </text>
          <text x={354} y={14} textAnchor="end" fontSize={10} fill="#64748b">
            {lang === "pl" ? "przód →" : "перед →"}
          </text>
          {part("scrotum", <ellipse cx={226} cy={248} rx={32} ry={34} fill={tone("scrotum", "#fed7aa")} stroke="#c2410c" strokeWidth={1.5} />)}
          {part(
            "vas",
            <path
              d="M212 274 C 238 280, 252 240, 250 200 C 248 160, 246 110, 244 60 C 242 24, 180 12, 150 30 C 128 44, 130 80, 142 98 L 182 118"
              stroke={tone("vas", "#0ea5e9")}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
            />,
          )}
          {part("bladder", <ellipse cx={190} cy={70} rx={42} ry={34} fill={tone("bladder", "#fde68a")} stroke="#a16207" strokeWidth={2} />)}
          {part("sv", <ellipse cx={140} cy={100} rx={10} ry={24} transform="rotate(-25 140 100)" fill={tone("sv", "#a78bfa")} stroke="#5b21b6" strokeWidth={1.5} />)}
          {part("prostate", <ellipse cx={190} cy={121} rx={22} ry={15} fill={tone("prostate", "#f0abfc")} stroke="#a21caf" strokeWidth={1.5} />)}
          {part("testis", <ellipse cx={226} cy={252} rx={15} ry={21} fill={tone("testis", "#f9a8d4")} stroke="#9d174d" strokeWidth={1.5} />)}
          {part("epid", <path d="M214 234 C 202 240, 202 266, 214 272" stroke={tone("epid", "#8b5cf6")} strokeWidth={7} fill="none" strokeLinecap="round" />)}
          {part("penis", <path d="M236 150 C 258 162, 282 196, 300 236" stroke={tone("penis", "#fdba74")} strokeWidth={28} fill="none" strokeLinecap="round" />)}
          {part(
            "urethra",
            <path
              d="M190 104 L 190 136 C 192 156, 214 150, 238 152 C 260 164, 282 198, 298 234"
              stroke={tone("urethra", "#ca8a04")}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />,
          )}
        </>
      )}
    />
  );
}

// ---------- female map ----------

type FPart = "ovary" | "tube" | "uterus" | "endo" | "cervix" | "vagina";

const FEMALE: Record<FPart, MapPart> = {
  ovary: {
    name: r("Jajnik", "Яичник"),
    text: r(
      "Parzysty gruczoł płciowy. Dojrzewają w nim pęcherzyki jajnikowe z komórkami jajowymi; wydziela estrogeny, a po owulacji ciałko żółte wydziela progesteron.",
      "Парная половая железа. В нём созревают фолликулы с яйцеклетками; он выделяет эстрогены, а после овуляции жёлтое тело выделяет прогестерон.",
    ),
    pin: [36, 170],
    to: [60, 126],
  },
  tube: {
    name: r("Jajowód", "Маточная труба"),
    text: r(
      "Przewód o długości ok. 10–12 cm. Jego lejek ze strzępkami wychwytuje komórkę jajową po owulacji, a rzęski nabłonka i skurcze ściany przesuwają ją ku macicy. Tu zwykle dochodzi do zapłodnienia.",
      "Трубка длиной около 10–12 см. Её воронка с бахромками захватывает яйцеклетку после овуляции, а реснички эпителия и сокращения стенки продвигают её к матке. Здесь обычно происходит оплодотворение.",
    ),
    pin: [100, 24],
    to: [95, 63],
  },
  uterus: {
    name: r("Macica (błona mięśniowa)", "Матка (мышечная оболочка)"),
    text: r(
      "Gruszkowaty narząd o grubej ścianie z mięśni gładkich. Rozciąga się wraz z rosnącym płodem, a jej skurcze wypychają go podczas porodu.",
      "Грушевидный орган с толстой стенкой из гладких мышц. Растягивается вместе с растущим плодом, а её сокращения изгоняют его при родах.",
    ),
    pin: [318, 40],
    to: [228, 80],
  },
  endo: {
    name: r("Błona śluzowa macicy (endometrium)", "Слизистая оболочка матки (эндометрий)"),
    text: r(
      "Wyściela jamę macicy. W każdym cyklu grubieje pod wpływem estrogenów i progesteronu, a jeśli nie dojdzie do ciąży — złuszcza się podczas miesiączki. W niej zagnieżdża się zarodek.",
      "Выстилает полость матки. В каждом цикле утолщается под действием эстрогенов и прогестерона, а если беременность не наступила, — отторгается во время менструации. В неё внедряется зародыш.",
    ),
    pin: [324, 150],
    to: [203, 96],
  },
  cervix: {
    name: r("Szyjka macicy", "Шейка матки"),
    text: r(
      "Dolna, zwężona część macicy, łącząca ją z pochwą. Wydziela śluz, którego gęstość zmienia się w cyklu. Z jej powierzchni pobiera się wymaz do badania cytologicznego.",
      "Нижняя суженная часть матки, соединяющая её с влагалищем. Выделяет слизь, густота которой меняется в течение цикла. С её поверхности берут мазок для цитологического исследования.",
    ),
    pin: [104, 198],
    to: [164, 182],
  },
  vagina: {
    name: r("Pochwa", "Влагалище"),
    text: r(
      "Elastyczny przewód mięśniowy łączący macicę ze środowiskiem zewnętrznym. Kwaśny odczyn, utrzymywany przez pałeczki kwasu mlekowego, chroni przed drobnoustrojami. Podczas porodu tworzy kanał rodny.",
      "Эластичная мышечная трубка, соединяющая матку с внешней средой. Кислая среда, которую поддерживают молочнокислые бактерии, защищает от микробов. Во время родов образует родовой канал.",
    ),
    pin: [264, 232],
    to: [202, 226],
  },
};

function FemaleMap({ lang }: { lang: BioLang }) {
  const fringe = (x: number, s: number) => `M${x} 76 l ${-14 * s} 4 M${x} 76 l ${-12 * s} 12 M${x} 76 l ${-4 * s} 16 M${x} 76 l ${-16 * s} -4`;
  return (
    <PartMap<FPart>
      lang={lang}
      parts={FEMALE}
      viewBox="0 0 360 250"
      title={r("Żeński układ rozrodczy", "Женская половая система")}
      labelOrder={["ovary", "tube", "uterus", "endo", "cervix", "vagina"]}
      pinRadius={13}
      art={({ part, tone }) => (
        <>
          <path d="M88 118 L 130 94 M272 118 L 230 94" stroke="#cbd5e1" strokeWidth={3} />
          {part(
            "tube",
            <g stroke={tone("tube", "#f472b6")} fill="none" strokeLinecap="round">
              <path d="M130 80 C 104 62, 76 58, 58 76" strokeWidth={7} />
              <path d="M230 80 C 256 62, 284 58, 302 76" strokeWidth={7} />
              <path d={`${fringe(58, 1)} ${fringe(302, -1)}`} strokeWidth={3} />
            </g>,
          )}
          {part(
            "ovary",
            <g fill={tone("ovary", "#fda4af")} stroke="#be123c" strokeWidth={1.5}>
              <ellipse cx={64} cy={118} rx={24} ry={15} />
              <ellipse cx={296} cy={118} rx={24} ry={15} />
            </g>,
          )}
          {part(
            "uterus",
            <path
              d="M124 72 C 124 56, 236 56, 236 72 C 236 110, 214 150, 200 166 L 160 166 C 146 150, 124 110, 124 72 Z"
              fill={tone("uterus", "#f9a8d4")}
              stroke="#be185d"
              strokeWidth={2}
            />,
          )}
          {part(
            "endo",
            <g>
              <path d="M146 76 L 214 76 C 206 104, 190 130, 184 146 L 176 146 C 170 130, 154 104, 146 76 Z" fill={tone("endo", "#fb7185")} />
              <path d="M158 82 L 202 82 C 195 104, 186 124, 181 140 L 179 140 C 174 124, 165 104, 158 82 Z" fill="#fff1f2" />
            </g>,
          )}
          {part(
            "cervix",
            <g>
              <path d="M160 166 L 200 166 L 198 196 L 162 196 Z" fill={tone("cervix", "#ec4899")} stroke="#be185d" strokeWidth={1.5} />
              <path d="M180 144 L 180 196" stroke="#fff1f2" strokeWidth={3} />
            </g>,
          )}
          {part(
            "vagina",
            <g>
              <path d="M162 196 L 198 196 C 202 214, 204 230, 206 246 L 154 246 C 156 230, 158 214, 162 196 Z" fill={tone("vagina", "#fbcfe8")} stroke="#db2777" strokeWidth={1.5} />
              <path d="M180 198 L 180 246" stroke="#fdf2f8" strokeWidth={6} />
            </g>,
          )}
        </>
      )}
    />
  );
}

// ---------- gametes ----------

type GPart = "acrosome" | "head" | "mid" | "tail" | "corona" | "zona" | "cyto" | "nucleus";

const GAMETES: Record<GPart, MapPart> = {
  acrosome: {
    name: r("Akrosom", "Акросома"),
    text: r("Pęcherzyk na szczycie główki plemnika. Zawiera enzymy, które rozpuszczają osłonki komórki jajowej i pozwalają plemnikowi wniknąć do jej wnętrza.", "Пузырёк на вершине головки сперматозоида. Содержит ферменты, растворяющие оболочки яйцеклетки и позволяющие сперматозоиду проникнуть внутрь."),
    pin: [150, 40],
    to: [131, 96],
  },
  head: {
    name: r("Główka plemnika", "Головка сперматозоида"),
    text: r("Zawiera jądro komórkowe z haploidalnym (n) zestawem chromosomów, które plemnik wnosi do zygoty.", "Содержит ядро с гаплоидным (n) набором хромосом, который сперматозоид вносит в зиготу."),
    pin: [88, 40],
    to: [114, 98],
  },
  mid: {
    name: r("Wstawka", "Средняя часть"),
    text: r("Wypełniona mitochondriami, które wytwarzają ATP — energię do ruchu witki.", "Заполнена митохондриями, которые образуют АТФ — энергию для движения жгутика."),
    pin: [64, 160],
    to: [94, 104],
  },
  tail: {
    name: r("Witka", "Жгутик"),
    text: r("Napęd plemnika — jej ruchy pozwalają mu płynąć w drogach rodnych.", "Двигатель сперматозоида — её движения позволяют ему плыть по половым путям."),
    pin: [24, 60],
    to: [30, 96],
  },
  corona: {
    name: r("Wieniec promienisty", "Лучистый венец"),
    text: r("Warstwa komórek pęcherzykowych otaczająca komórkę jajową po owulacji.", "Слой фолликулярных клеток, окружающий яйцеклетку после овуляции."),
    pin: [196, 20],
    to: [225, 24],
  },
  zona: {
    name: r("Osłonka przejrzysta", "Блестящая оболочка"),
    text: r("Glikoproteinowa osłonka komórki jajowej. Po wniknięciu jednego plemnika zmienia się tak, że kolejne nie mogą się przedostać.", "Гликопротеиновая оболочка яйцеклетки. После проникновения одного сперматозоида она изменяется так, что другие уже не могут пройти."),
    pin: [196, 186],
    to: [226, 160],
  },
  cyto: {
    name: r("Cytoplazma z materiałami zapasowymi", "Цитоплазма с запасными веществами"),
    text: r("Komórka jajowa ma dużo cytoplazmy z substancjami odżywczymi — wystarcza ich zarodkowi na pierwsze dni, zanim zagnieździ się w macicy.", "У яйцеклетки много цитоплазмы с питательными веществами — их хватает зародышу на первые дни, пока он не внедрится в матку."),
    pin: [340, 186],
    to: [290, 130],
  },
  nucleus: {
    name: r("Jądro komórki jajowej", "Ядро яйцеклетки"),
    text: r("Zawiera haploidalny (n) zestaw chromosomów; po zapłodnieniu łączy się z jądrem plemnika i powstaje diploidalna zygota (2n).", "Содержит гаплоидный (n) набор хромосом; после оплодотворения сливается с ядром сперматозоида, и возникает диплоидная зигота (2n)."),
    pin: [340, 20],
    to: [258, 90],
  },
};

function GametesMap({ lang }: { lang: BioLang }) {
  const corona = Array.from({ length: 30 }, (_, k) => {
    const a = (k / 30) * Math.PI * 2;
    return [260 + 82 * Math.cos(a), 100 + 82 * Math.sin(a)] as const;
  });
  return (
    <PartMap<GPart>
      lang={lang}
      parts={GAMETES}
      viewBox="0 0 360 200"
      title={r("Plemnik i komórka jajowa", "Сперматозоид и яйцеклетка")}
      labelOrder={["acrosome", "head", "mid", "tail", "corona", "zona", "cyto", "nucleus"]}
      pinRadius={12}
      maxWidth="max-w-[480px]"
      art={({ part, tone }) => (
        <>
          {part(
            "corona",
            <g fill={tone("corona", "#fde68a")} stroke="#ca8a04" strokeWidth={0.8}>
              {corona.map(([x, y], k) => (
                <circle key={k} cx={x} cy={y} r={7} />
              ))}
            </g>,
          )}
          {part("zona", <circle cx={260} cy={100} r={69} fill="none" stroke={tone("zona", "#bae6fd")} strokeWidth={10} />)}
          {part(
            "cyto",
            <g>
              <circle cx={260} cy={100} r={64} fill={tone("cyto", "#fef3c7")} />
              {[
                [230, 70],
                [290, 80],
                [284, 130],
                [236, 132],
                [274, 60],
                [300, 108],
                [222, 104],
                [262, 140],
              ].map(([x, y], k) => (
                <circle key={k} cx={x} cy={y} r={3} fill="#fcd34d" />
              ))}
            </g>,
          )}
          {part("nucleus", <circle cx={256} cy={96} r={16} fill={tone("nucleus", "#c4b5fd")} stroke="#6d28d9" strokeWidth={1.5} />)}
          {part("tail", <path d="M82 100 C 70 90, 60 110, 48 100 S 26 90, 12 100" stroke={tone("tail", "#64748b")} strokeWidth={3} fill="none" strokeLinecap="round" />)}
          {part(
            "mid",
            <g>
              <rect x={82} y={95} width={24} height={10} rx={4} fill={tone("mid", "#fdba74")} stroke="#c2410c" strokeWidth={1} />
              <path d="M86 95 l 4 10 M92 95 l 4 10 M98 95 l 4 10" stroke="#c2410c" strokeWidth={0.8} />
            </g>,
          )}
          {part("head", <ellipse cx={120} cy={100} rx={15} ry={10} fill={tone("head", "#93c5fd")} stroke="#1d4ed8" strokeWidth={1.2} />)}
          {part(
            "acrosome",
            <path d="M124 90.6 C 132 91, 137 95, 137 100 C 137 105, 132 109, 124 109.4 C 129 105, 129 95, 124 90.6 Z" fill={tone("acrosome", "#fca5a5")} stroke="#b91c1c" strokeWidth={1} />,
          )}
        </>
      )}
    />
  );
}

// ---------- gametogenesis ----------

function SpermArt({ lang }: { lang: BioLang }) {
  const lab = lang === "pl" ? ["spermatocyt I rzędu", "spermatocyty II rzędu", "spermatydy", "4 plemniki"] : ["сперматоцит I порядка", "сперматоциты II порядка", "сперматиды", "4 сперматозоида"];
  return (
    <svg viewBox="0 0 280 170" className="w-full" role="img" aria-label={lab.join(" → ")}>
      <g stroke="#94a3b8" strokeWidth={1.5}>
        <path d="M74 32 L 58 52 M86 32 L 102 52" />
        <path d="M52 74 L 38 94 M58 74 L 64 94 M102 74 L 96 94 M108 74 L 122 94" />
        <path d="M35 112 L 35 132 M65 112 L 65 132 M95 112 L 95 132 M125 112 L 125 132" />
      </g>
      <circle cx={80} cy={22} r={12} fill="#bfdbfe" stroke="#1d4ed8" />
      <text x={80} y={25} textAnchor="middle" fontSize={9}>
        2n
      </text>
      {[55, 105].map((x) => (
        <g key={x}>
          <circle cx={x} cy={64} r={10} fill="#bfdbfe" stroke="#1d4ed8" />
          <text x={x} y={67} textAnchor="middle" fontSize={9}>
            n
          </text>
        </g>
      ))}
      {[35, 65, 95, 125].map((x) => (
        <g key={x}>
          <circle cx={x} cy={104} r={8} fill="#bfdbfe" stroke="#1d4ed8" />
          <ellipse cx={x} cy={140} rx={4} ry={5.5} fill="#93c5fd" stroke="#1d4ed8" />
          <path d={`M${x} 146 q 4 5 0 10 t 0 10`} stroke="#64748b" fill="none" />
        </g>
      ))}
      <g fontSize={8.5} fill="#334155">
        <text x={158} y={25}>{lab[0]}</text>
        <text x={158} y={67}>{lab[1]}</text>
        <text x={158} y={107}>{lab[2]}</text>
        <text x={158} y={146} fontWeight={700}>
          {lab[3]}
        </text>
      </g>
      <g fontSize={8} fill="#6366f1" fontStyle="italic">
        <text x={110} y={44}>{lang === "pl" ? "mejoza I" : "мейоз I"}</text>
        <text x={132} y={86}>{lang === "pl" ? "mejoza II" : "мейоз II"}</text>
      </g>
    </svg>
  );
}

function EggArt({ lang }: { lang: BioLang }) {
  const lab =
    lang === "pl"
      ? ["oocyt I rzędu", "oocyt II rzędu", "+ I ciałko kierunkowe", "komórka jajowa", "+ ciałka kierunkowe"]
      : ["ооцит I порядка", "ооцит II порядка", "+ I направительное тельце", "яйцеклетка", "+ направительные тельца"];
  return (
    <svg viewBox="0 0 280 170" className="w-full" role="img" aria-label={`${lab[0]} → ${lab[1]} → ${lab[3]}`}>
      <g stroke="#94a3b8" strokeWidth={1.5}>
        <path d="M74 38 L 70 52 M88 34 L 108 54" />
        <path d="M70 84 L 70 104 M112 68 L 110 90 M116 66 L 126 92 M78 82 L 98 120" />
      </g>
      <circle cx={80} cy={22} r={15} fill="#fde68a" stroke="#b45309" />
      <text x={80} y={25} textAnchor="middle" fontSize={9}>
        2n
      </text>
      <circle cx={70} cy={68} r={15} fill="#fde68a" stroke="#b45309" />
      <text x={70} y={71} textAnchor="middle" fontSize={9}>
        n
      </text>
      <circle cx={112} cy={60} r={5} fill="#fef3c7" stroke="#b45309" />
      <circle cx={70} cy={120} r={15} fill="#fde68a" stroke="#b45309" strokeWidth={2} />
      <text x={70} y={123} textAnchor="middle" fontSize={9}>
        n
      </text>
      {[
        [108, 98],
        [128, 100],
        [102, 126],
      ].map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={4.5} fill="#fef3c7" stroke="#b45309" strokeDasharray={k < 2 ? "2 1.5" : undefined} />
      ))}
      <g fontSize={8.5} fill="#334155">
        <text x={150} y={25}>{lab[0]}</text>
        <text x={150} y={64}>{lab[1]}</text>
        <text x={150} y={76}>{lab[2]}</text>
        <text x={150} y={116} fontWeight={700}>
          {lab[3]}
        </text>
        <text x={150} y={128}>{lab[4]}</text>
      </g>
      <g fontSize={8} fill="#6366f1" fontStyle="italic">
        <text x={10} y={46}>{lang === "pl" ? "mejoza I" : "мейоз I"}</text>
        <text x={10} y={98}>{lang === "pl" ? "mejoza II" : "мейоз II"}</text>
      </g>
    </svg>
  );
}

const G = {
  where: r("Gdzie", "Где"),
  start: r("Kiedy się zaczyna", "Когда начинается"),
  time: r("Przebieg w czasie", "Ход во времени"),
  cyto: r("Podział cytoplazmy", "Деление цитоплазмы"),
  product: r("Z jednej komórki po mejozie", "Из одной клетки после мейоза"),
  hormones: r("Regulacja", "Регуляция"),
};

function gametogenesis(lang: BioLang): CompareCard[] {
  return [
    {
      id: "sperm",
      icon: "♂",
      name: r("Spermatogeneza", "Сперматогенез"),
      art: <SpermArt lang={lang} />,
      rows: [
        { label: G.where, value: r("kanaliki nasienne jąder", "семенные канальцы семенников") },
        { label: G.start, value: r("w okresie dojrzewania płciowego", "в период полового созревания") },
        { label: G.time, value: r("ciągle, do późnej starości — miliony plemników na dobę", "непрерывно, до глубокой старости, — миллионы сперматозоидов в сутки") },
        { label: G.cyto, value: r("równy", "равномерное") },
        { label: G.product, value: r("4 plemniki", "4 сперматозоида") },
        { label: G.hormones, value: r("FSH i testosteron (wydzielany przez komórki Leydiga pod wpływem LH)", "ФСГ и тестостерон (выделяемый клетками Лейдига под действием ЛГ)") },
      ],
      text: r("Komórki Sertolego odżywiają i chronią rozwijające się plemniki.", "Клетки Сертоли питают и защищают развивающиеся сперматозоиды."),
    },
    {
      id: "egg",
      icon: "♀",
      name: r("Oogeneza", "Оогенез"),
      art: <EggArt lang={lang} />,
      rows: [
        { label: G.where, value: r("jajniki (pęcherzyki jajnikowe)", "яичники (фолликулы)") },
        { label: G.start, value: r("już w życiu płodowym — oocyty I rzędu zatrzymują się w profazie I mejozy aż do dojrzewania płciowego", "ещё во внутриутробном периоде — ооциты I порядка останавливаются в профазе I мейоза до полового созревания") },
        { label: G.time, value: r("cyklicznie: zwykle jeden oocyt na cykl, od pierwszej miesiączki do menopauzy; mejoza II kończy się dopiero po wniknięciu plemnika", "циклически: обычно один ооцит за цикл, от первой менструации до менопаузы; мейоз II завершается только после проникновения сперматозоида") },
        { label: G.cyto, value: r("nierówny — komórka jajowa zachowuje prawie całą cytoplazmę", "неравномерное — яйцеклетка сохраняет почти всю цитоплазму") },
        { label: G.product, value: r("1 komórka jajowa i 2–3 ciałka kierunkowe, które zanikają", "1 яйцеклетка и 2–3 направительных тельца, которые погибают") },
        { label: G.hormones, value: r("FSH i LH z przedniego płata przysadki", "ФСГ и ЛГ передней доли гипофиза") },
      ],
      text: r("Nierówny podział cytoplazmy zapewnia komórce jajowej zapas substancji odżywczych dla zarodka.", "Неравномерное деление цитоплазмы обеспечивает яйцеклетку запасом питательных веществ для зародыша."),
    },
  ];
}

// ---------- menstrual cycle ----------

const g = (d: number, m: number, s: number) => Math.exp(-(((d - m) / s) ** 2));

interface Levels {
  fsh: number;
  lh: number;
  est: number;
  prog: number;
}

/** relative blood levels (0–1) in a model 28-day cycle; `preg` keeps the corpus luteum alive from implantation on */
function levels(d: number, preg: boolean): Levels {
  const late = preg && d > 21.5;
  return {
    fsh: 0.22 + 0.2 * g(d, 3, 4) + 0.35 * g(d, 13.6, 1.3) + (preg ? 0 : 0.12 * g(d, 29, 2.5)),
    lh: 0.12 + 0.86 * g(d, 13.8, 1),
    est: late ? 0.15 + 0.72 * g(21.5, 12.8, 2.4) + 0.38 + 0.008 * (d - 21.5) : 0.15 + 0.72 * g(d, 12.8, 2.4) + 0.38 * g(d, 21, 3.4),
    prog: late ? 0.9 + 0.006 * (d - 21.5) : 0.04 + 0.86 * g(d, 21.5, 3.6),
  };
}

function thickness(d: number, preg: boolean): number {
  if (d <= 5) return 0.85 - ((d - 1) / 4) * 0.7;
  if (d <= 14) return 0.15 + ((d - 5) / 9) * 0.45;
  if (d <= 22) return 0.6 + ((d - 14) / 8) * 0.4;
  return preg ? 1 : 1 - ((d - 22) / 6) * 0.1;
}

type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";
const phaseOf = (d: number): Phase => (d <= 5 ? "menstrual" : d <= 13 ? "follicular" : d === 14 ? "ovulation" : "luteal");

const PHASES: Record<Phase, { name: Txt; band: string; chip: string }> = {
  menstrual: { name: r("Faza menstruacyjna (dni 1–5)", "Менструальная фаза (дни 1–5)"), band: "#ffe4e6", chip: "bg-rose-100 text-rose-900 ring-rose-300" },
  follicular: { name: r("Faza folikularna (do ok. 13. dnia)", "Фолликулярная фаза (примерно до 13-го дня)"), band: "#e0f2fe", chip: "bg-sky-100 text-sky-900 ring-sky-300" },
  ovulation: { name: r("Owulacja (ok. 14. dnia)", "Овуляция (около 14-го дня)"), band: "#d1fae5", chip: "bg-emerald-100 text-emerald-900 ring-emerald-300" },
  luteal: { name: r("Faza lutealna (dni 15–28)", "Лютеиновая фаза (дни 15–28)"), band: "#fef3c7", chip: "bg-amber-100 text-amber-900 ring-amber-300" },
};

const HORMONES: { key: keyof Levels; name: Txt; color: string; dash?: string; from: Txt }[] = [
  { key: "fsh", name: r("FSH", "ФСГ"), color: "#0284c7", dash: "5 3", from: r("przysadka", "гипофиз") },
  { key: "lh", name: r("LH", "ЛГ"), color: "#7c3aed", dash: "5 3", from: r("przysadka", "гипофиз") },
  { key: "est", name: r("estrogeny", "эстрогены"), color: "#db2777", from: r("jajnik", "яичник") },
  { key: "prog", name: r("progesteron", "прогестерон"), color: "#d97706", from: r("jajnik", "яичник") },
];

function describe(d: number, preg: boolean): { ovary: Txt; uterus: Txt } {
  if (preg && d >= 21)
    return {
      ovary: r(
        "Zarodek zagnieździł się w błonie śluzowej macicy. Jego kosmówka wydziela gonadotropinę kosmówkową (hCG), która podtrzymuje ciałko żółte — progesteron pozostaje wysoki.",
        "Зародыш внедрился в слизистую оболочку матки. Его хорион выделяет хорионический гонадотропин (ХГЧ), который поддерживает жёлтое тело, — прогестерон остаётся высоким.",
      ),
      uterus: r(
        "Błona śluzowa nie złuszcza się — miesiączka nie wystąpi. W dalszej części ciąży progesteron będzie wytwarzać łożysko.",
        "Слизистая оболочка не отторгается — менструации не будет. Позже прогестерон будет вырабатывать плацента.",
      ),
    };
  const p = phaseOf(d);
  if (p === "menstrual")
    return {
      ovary: r(
        "Spadek progesteronu pod koniec poprzedniego cyklu pozwala wzrosnąć stężeniu FSH — w jajniku zaczyna rosnąć kilka pęcherzyków jajnikowych.",
        "Падение прогестерона в конце предыдущего цикла позволяет вырасти уровню ФСГ — в яичнике начинают расти несколько фолликулов.",
      ),
      uterus: r(
        "Złuszcza się warstwa czynnościowa błony śluzowej macicy i wraz z krwią jest usuwana na zewnątrz — to krwawienie miesiączkowe.",
        "Функциональный слой слизистой оболочки матки отторгается и вместе с кровью выводится наружу — это менструальное кровотечение.",
      ),
    };
  if (p === "follicular")
    return {
      ovary: r(
        "Pod wpływem FSH dojrzewa jeden dominujący pęcherzyk jajnikowy (pęcherzyk Graafa). Jego komórki wydzielają coraz więcej estrogenów.",
        "Под действием ФСГ созревает один доминантный фолликул (граафов пузырёк). Его клетки выделяют всё больше эстрогенов.",
      ),
      uterus: r("Estrogeny pobudzają odbudowę i grubienie błony śluzowej macicy (faza proliferacyjna).", "Эстрогены стимулируют восстановление и утолщение слизистой оболочки матки (пролиферативная фаза)."),
    };
  if (p === "ovulation")
    return {
      ovary: r(
        "Wysokie stężenie estrogenów wywołuje gwałtowny wyrzut LH z przysadki. Pęcherzyk pęka i uwalnia komórkę jajową (oocyt II rzędu), którą wychwytuje lejek jajowodu.",
        "Высокий уровень эстрогенов вызывает резкий выброс ЛГ из гипофиза. Фолликул разрывается и выпускает яйцеклетку (ооцит II порядка), которую захватывает воронка маточной трубы.",
      ),
      uterus: r("Błona śluzowa jest pogrubiona, a śluz szyjkowy staje się rzadki i łatwo przepuszcza plemniki.", "Слизистая оболочка утолщена, а шеечная слизь становится жидкой и легко пропускает сперматозоиды."),
    };
  if (d <= 24 || preg)
    return {
      ovary: r(
        "Z pozostałości pęcherzyka pod wpływem LH powstaje ciałko żółte. Wydziela progesteron i estrogeny, które hamują wydzielanie FSH i LH.",
        "Из остатков фолликула под действием ЛГ образуется жёлтое тело. Оно выделяет прогестерон и эстрогены, которые тормозят выделение ФСГ и ЛГ.",
      ),
      uterus: r(
        "Progesteron przygotowuje błonę śluzową do zagnieżdżenia zarodka: rośnie jej ukrwienie, a gruczoły wydzielają substancje odżywcze (faza wydzielnicza).",
        "Прогестерон готовит слизистую оболочку к внедрению зародыша: усиливается её кровоснабжение, а железы выделяют питательные вещества (секреторная фаза).",
      ),
    };
  return {
    ovary: r(
      "Komórka jajowa nie została zapłodniona — ciałko żółte zanika, a stężenie progesteronu i estrogenów spada. Hamowanie przysadki słabnie i FSH znów zaczyna rosnąć.",
      "Яйцеклетка не была оплодотворена — жёлтое тело регрессирует, уровень прогестерона и эстрогенов падает. Торможение гипофиза ослабевает, и ФСГ снова начинает расти.",
    ),
    uterus: r("Bez progesteronu błona śluzowa nie może się utrzymać — wkrótce złuszczy się i zacznie się nowy cykl.", "Без прогестерона слизистая не может удержаться — скоро она отторгнется, и начнётся новый цикл."),
  };
}

const X0 = 28;
const X1 = 312;
const xDay = (d: number) => X0 + ((d - 1) / 27) * (X1 - X0);
const yLev = (v: number) => 150 - v * 128;

function OvaryView({ day, preg, lang }: { day: number; preg: boolean; lang: BioLang }) {
  let label: Txt;
  let node: ReactNode;
  if (day <= 13) {
    const rr = 7 + (day - 1) * 1.5;
    label = day >= 10 ? r("dojrzały pęcherzyk (Graafa)", "зрелый фолликул (граафов)") : r("rosnący pęcherzyk jajnikowy", "растущий фолликул");
    node = (
      <g>
        <circle cx={92} cy={62} r={rr} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
        <circle cx={92 + rr * 0.35} cy={62 - rr * 0.2} r={4.5} fill="#fde68a" stroke="#b45309" />
      </g>
    );
  } else if (day === 14) {
    label = r("owulacja — pęcherzyk pęka", "овуляция — фолликул разрывается");
    node = (
      <g>
        <path d="M92 37 A 25 25 0 1 0 114 50" fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
        <circle cx={140} cy={26} r={5} fill="#fde68a" stroke="#b45309" />
        <path d="M118 44 L 132 32" stroke="#059669" strokeWidth={2} markerEnd="url(#repr-arrow)" />
      </g>
    );
  } else {
    const growing = 14 + Math.min(day - 15, 6) * 1.6;
    const fading = !preg && day > 24;
    const rr = fading ? growing - (day - 24) * 3 : growing;
    label = fading ? r("ciałko żółte zanika", "жёлтое тело регрессирует") : preg && day >= 21 ? r("ciałko żółte podtrzymywane przez hCG", "жёлтое тело, поддерживаемое ХГЧ") : r("ciałko żółte", "жёлтое тело");
    node = <circle cx={92} cy={62} r={rr} fill={fading ? "#fef9c3" : "#facc15"} stroke="#a16207" strokeWidth={1.5} style={{ transition: "all .3s" }} />;
  }
  return (
    <figure>
      <svg viewBox="0 0 160 120" className="w-full" role="img" aria-label={label[lang]}>
        <defs>
          <marker id="repr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L 10 5 L 0 10 Z" fill="#059669" />
          </marker>
        </defs>
        <ellipse cx={80} cy={64} rx={70} ry={46} fill="#fce7f3" stroke="#db2777" strokeWidth={2} />
        {[
          [36, 50],
          [44, 82],
          [60, 96],
          [124, 92],
          [130, 70],
        ].map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r={3.5} fill="#f0f9ff" stroke="#7dd3fc" />
        ))}
        {node}
      </svg>
      <figcaption className="text-center text-xs text-slate-600">
        <b>{lang === "pl" ? "Jajnik" : "Яичник"}:</b> {label[lang]}
      </figcaption>
    </figure>
  );
}

function UterusView({ day, preg, lang }: { day: number; preg: boolean; lang: BioLang }) {
  const th = thickness(day, preg);
  const h = 8 + th * 52;
  const top = 84 - h;
  const bleeding = day <= 5 && !(preg && day >= 21);
  const secretory = day >= 15;
  return (
    <figure>
      <svg viewBox="0 0 160 120" className="w-full" role="img" aria-label={`${lang === "pl" ? "Grubość błony śluzowej" : "Толщина слизистой"}: ${num(th * 100)}%`}>
        <rect x={10} y={84} width={140} height={30} fill="#f9a8d4" />
        <rect x={10} y={top} width={140} height={h} fill={bleeding ? "#fca5a5" : "#fecdd3"} style={{ transition: "all .3s" }} />
        {secretory &&
          [30, 60, 90, 120].map((x) => (
            <path key={x} d={`M${x} ${84} q 6 ${-h * 0.3} 0 ${-h * 0.55} t 0 ${-h * 0.35}`} stroke="#e11d48" strokeWidth={1.2} fill="none" opacity={0.6} />
          ))}
        {bleeding &&
          [24, 52, 80, 108, 136].map((x, k) => (
            <path key={x} d={`M${x} ${top - 6 - (k % 2) * 8} q 4 6 0 9 q -4 -3 0 -9 Z`} fill="#dc2626" />
          ))}
        <path d={`M10 ${top} L 150 ${top}`} stroke={bleeding ? "#b91c1c" : "#be123c"} strokeWidth={1.5} strokeDasharray={bleeding ? "4 3" : undefined} />
        <text x={146} y={top + h / 2 + 3} textAnchor="end" fontSize={9} fill="#881337">
          {lang === "pl" ? "błona śluzowa" : "слизистая"}
        </text>
        <text x={146} y={103} textAnchor="end" fontSize={9} fill="#831843">
          {lang === "pl" ? "błona mięśniowa" : "мышечная"}
        </text>
      </svg>
      <figcaption className="text-center text-xs text-slate-600">
        <b>{lang === "pl" ? "Ściana macicy" : "Стенка матки"}</b>
      </figcaption>
    </figure>
  );
}

function MenstrualCycle({ lang }: { lang: BioLang }) {
  const [day, setDay] = useState(1);
  const [preg, setPreg] = useState(false);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!play) return;
    const id = window.setTimeout(() => setDay(day >= 28 ? 1 : day + 1), 550);
    return () => window.clearTimeout(id);
  }, [play, day]);

  const days = Array.from({ length: 109 }, (_, k) => 1 + k * 0.25);
  const lev = levels(day, preg);
  const phase = phaseOf(day);
  const info = describe(day, preg);
  const word = (v: number) => (v < 0.3 ? r("niskie", "низкий") : v < 0.65 ? r("średnie", "средний") : r("wysokie", "высокий"));
  const bandFor = (p: Phase): [number, number] => (p === "menstrual" ? [1, 5] : p === "follicular" ? [6, 13] : p === "ovulation" ? [14, 14] : [15, 28]);
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 320 182" className="w-full" role="img" aria-label={lang === "pl" ? "Stężenia hormonów w cyklu" : "Уровни гормонов в цикле"}>
        {(Object.keys(PHASES) as Phase[]).map((p) => {
          const [a, b] = bandFor(p);
          const x0 = Math.max(X0, xDay(a - 0.5));
          const x1 = Math.min(X1, xDay(b + 0.5));
          return <rect key={p} x={x0} y={14} width={x1 - x0} height={138} fill={PHASES[p].band} />;
        })}
        {[0.25, 0.5, 0.75, 1].map((v) => (
          <path key={v} d={`M${X0} ${yLev(v)} L ${X1} ${yLev(v)}`} stroke="#e2e8f0" strokeWidth={0.8} />
        ))}
        <path d={`M${X0} 150 L ${X1} 150`} stroke="#94a3b8" />
        {[1, 5, 10, 14, 20, 28].map((d) => (
          <text key={d} x={xDay(d)} y={163} textAnchor="middle" fontSize={9} fill="#64748b">
            {d}
          </text>
        ))}
        <text x={X1} y={177} textAnchor="end" fontSize={9} fill="#64748b">
          {lang === "pl" ? "dzień cyklu" : "день цикла"}
        </text>
        <text x={6} y={84} fontSize={9} fill="#64748b" transform="rotate(-90 6 84)" textAnchor="middle">
          {lang === "pl" ? "stężenie (względne)" : "уровень (относительный)"}
        </text>
        {HORMONES.map((h) => (
          <path
            key={h.key}
            d={days.map((d, k) => `${k ? "L" : "M"}${xDay(d).toFixed(1)} ${yLev(levels(d, preg)[h.key]).toFixed(1)}`).join(" ")}
            fill="none"
            stroke={h.color}
            strokeWidth={2.2}
            strokeDasharray={h.dash}
            strokeLinejoin="round"
          />
        ))}
        <path d={`M${xDay(day)} 14 L ${xDay(day)} 150`} stroke="#0f172a" strokeWidth={1.5} />
        {HORMONES.map((h) => (
          <circle key={h.key} cx={xDay(day)} cy={yLev(lev[h.key])} r={3.5} fill={h.color} stroke="white" strokeWidth={1.2} />
        ))}
      </svg>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        {HORMONES.map((h) => (
          <li key={h.key} className="flex items-center gap-1.5">
            <svg width="22" height="8" aria-hidden>
              <path d="M1 4 L 21 4" stroke={h.color} strokeWidth={2.5} strokeDasharray={h.dash} />
            </svg>
            <b className="text-slate-800">{h.name[lang]}</b> ({h.from[lang]}): {word(lev[h.key])[lang]}
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Dzień cyklu" : "День цикла"}: <span className="tabular-nums">{day}</span>
          <input
            type="range"
            min={1}
            max={28}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-rose-600"
            aria-valuetext={`${day}: ${PHASES[phase].name[lang]}`}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Choice onClick={() => setPlay(!play)}>{play ? (lang === "pl" ? "⏸ Pauza" : "⏸ Пауза") : lang === "pl" ? "▶ Odtwarzaj" : "▶ Запустить"}</Choice>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={preg} onChange={(e) => setPreg(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
            {lang === "pl" ? "Doszło do zapłodnienia i zagnieżdżenia zarodka" : "Произошло оплодотворение и имплантация зародыша"}
          </label>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[260px]">
          <OvaryView day={day} preg={preg} lang={lang} />
        </div>
        <div className="mx-auto w-full max-w-[260px]">
          <UterusView day={day} preg={preg} lang={lang} />
        </div>
      </div>
      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200" aria-live="polite">
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ring-1 ${PHASES[phase].chip}`}>
          {lang === "pl" ? "Dzień" : "День"} {day} · {PHASES[phase].name[lang]}
        </span>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
          <b>{lang === "pl" ? "W jajniku" : "В яичнике"}:</b> {info.ovary[lang]}
        </p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">
          <b>{lang === "pl" ? "W macicy" : "В матке"}:</b> {info.uterus[lang]}
        </p>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Jądra wytwarzają plemniki (kanaliki nasienne) i testosteron (komórki Leydiga).", ru: "Семенники образуют сперматозоиды (семенные канальцы) и тестостерон (клетки Лейдига)." },
    { pl: "Droga plemników: kanaliki nasienne → najądrze → nasieniowód → cewka moczowa.", ru: "Путь сперматозоидов: семенные канальцы → придаток семенника → семявыносящий проток → мочеиспускательный канал." },
    { pl: "Nasienie to plemniki wraz z wydzielinami pęcherzyków nasiennych i gruczołu krokowego.", ru: "Сперма — это сперматозоиды вместе с секретами семенных пузырьков и предстательной железы." },
  ],
  s2: [
    { pl: "Jajniki wytwarzają komórki jajowe oraz hormony: estrogeny i progesteron.", ru: "Яичники образуют яйцеклетки и гормоны: эстрогены и прогестерон." },
    { pl: "Do zapłodnienia dochodzi zwykle w jajowodzie, a zarodek zagnieżdża się w błonie śluzowej macicy.", ru: "Оплодотворение обычно происходит в маточной трубе, а зародыш внедряется в слизистую оболочку матки." },
  ],
  s3: [
    { pl: "Plemnik: główka z akrosomem i jądrem, wstawka z mitochondriami, witka.", ru: "Сперматозоид: головка с акросомой и ядром, средняя часть с митохондриями, жгутик." },
    { pl: "Obie gamety są haploidalne (n); zygota jest diploidalna (2n).", ru: "Обе гаметы гаплоидны (n); зигота диплоидна (2n)." },
  ],
  s4: [
    { pl: "Z jednego spermatocytu I rzędu powstają 4 plemniki, z jednego oocytu I rzędu — 1 komórka jajowa i ciałka kierunkowe.", ru: "Из одного сперматоцита I порядка образуются 4 сперматозоида, из одного ооцита I порядка — 1 яйцеклетка и направительные тельца." },
    { pl: "U mężczyzny FSH pobudza spermatogenezę, a LH — wydzielanie testosteronu przez komórki Leydiga.", ru: "У мужчин ФСГ стимулирует сперматогенез, а ЛГ — выделение тестостерона клетками Лейдига." },
  ],
  s5: [
    { pl: "FSH → wzrost pęcherzyka i wydzielanie estrogenów; wyrzut LH → owulacja i powstanie ciałka żółtego.", ru: "ФСГ → рост фолликула и выделение эстрогенов; выброс ЛГ → овуляция и образование жёлтого тела." },
    { pl: "Estrogeny odbudowują błonę śluzową macicy, progesteron przygotowuje ją do zagnieżdżenia zarodka.", ru: "Эстрогены восстанавливают слизистую оболочку матки, прогестерон готовит её к имплантации зародыша." },
    { pl: "Spadek progesteronu po zaniku ciałka żółtego wywołuje miesiączkę.", ru: "Падение прогестерона после регрессии жёлтого тела вызывает менструацию." },
  ],
};

export default function ReproductiveSystemLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="repr" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="repr-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MaleMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="repr-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <FemaleMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="repr-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <GametesMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="repr-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={gametogenesis(lang)} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="repr-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <MenstrualCycle lang={lang} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
