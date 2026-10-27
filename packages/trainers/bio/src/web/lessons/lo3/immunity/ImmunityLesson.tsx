// Lesson for LO3 §6.5 "Układ limfatyczny", §6.7 "Budowa i funkcje układu odpornościowego" and §6.8
// "Rodzaje i mechanizmy odporności" (zakres rozszerzony) — one lesson, since the lymphatic organs, the
// immune cells and the kinds of immunity only make sense together. Terms follow
// templates/data/circulation.ts (IMMUNITY) and systemsMore.ts (LYMPH_PARTS, IMMUNE_CELLS,
// IMMUNITY_MECHANISMS).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { PartMap, TwoWaySort, type MapPart, type SortItem } from "@portal/lessons";
import { Choice, KIT, Remember, Section, Verdict, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Układ limfatyczny odprowadza nadmiar płynu tkankowego z powrotem do krwi, a w jego narządach dojrzewają i namnażają się limfocyty. Razem z innymi leukocytami tworzą one układ odpornościowy, który rozpoznaje obce antygeny, niszczy je i zapamiętuje.",
    "Лимфатическая система возвращает избыток тканевой жидкости в кровь, а в её органах созревают и размножаются лимфоциты. Вместе с другими лейкоцитами они образуют иммунную систему, которая распознаёт чужие антигены, уничтожает их и запоминает.",
  ),
  s1: r("Układ limfatyczny", "Лимфатическая система"),
  s1intro: r(
    "Z naczyń włosowatych przesącza się płyn tkankowy. Jego nadmiar zbierają naczynia chłonne — odtąd nazywa się on limfą.",
    "Из капилляров фильтруется тканевая жидкость. Её избыток собирают лимфатические сосуды — с этого момента она называется лимфой.",
  ),
  s2: r("Odporność nieswoista i swoista", "Неспецифический и специфический иммунитет"),
  s2intro: r("Nieswoista działa od razu i tak samo wobec każdego intruza; swoista celuje w konkretny antygen.", "Неспецифический иммунитет действует сразу и одинаково против любого чужака; специфический нацелен на конкретный антиген."),
  s3: r("Przebieg odpowiedzi swoistej", "Ход специфического иммунного ответа"),
  s3intro: r("Przejdź krok po kroku od wniknięcia antygenu do jego zniszczenia.", "Пройди шаг за шагом от проникновения антигена до его уничтожения."),
  s4: r("Odpowiedź pierwotna i wtórna", "Первичный и вторичный иммунный ответ"),
  s4intro: r("Przesuń drugi kontakt z tym samym antygenem i porównaj obie odpowiedzi.", "Сдвигай момент второй встречи с тем же антигеном и сравни оба ответа."),
  s5: r("Rodzaje odporności swoistej", "Виды специфического иммунитета"),
  s5intro: r("Umieść każdy przykład w odpowiednim polu tabeli.", "Помести каждый пример в нужную клетку таблицы."),
} satisfies Record<string, Txt>;

// ---------- lymphatic map ----------

type LPart = "tonsils" | "nodes" | "thymus" | "spleen" | "duct" | "vessels";

const PARTS: Record<LPart, MapPart> = {
  tonsils: {
    name: r("Migdałki", "Миндалины"),
    text: r("Skupiska tkanki limfatycznej w gardle — pierwsza zapora dla drobnoustrojów wnikających z powietrzem i pokarmem.", "Скопления лимфоидной ткани в глотке — первый заслон для микробов, проникающих с воздухом и пищей."),
    pin: [40, 40],
    to: [121, 60],
  },
  nodes: {
    name: r("Węzły chłonne", "Лимфатические узлы"),
    text: r(
      "Leżą na przebiegu naczyń chłonnych, najliczniej na szyi, pod pachami i w pachwinach. Filtrują limfę — zatrzymują bakterie i komórki nowotworowe — i namnażają się w nich limfocyty. Przy zakażeniu powiększają się i bolą.",
      "Лежат по ходу лимфатических сосудов, больше всего на шее, в подмышках и в паху. Фильтруют лимфу — задерживают бактерии и опухолевые клетки, — в них размножаются лимфоциты. При инфекции увеличиваются и болят.",
    ),
    pin: [30, 118],
    to: [92, 104],
  },
  thymus: {
    name: r("Grasica", "Тимус"),
    text: r("Leży za mostkiem. Dojrzewają w niej limfocyty T (litera T pochodzi od łacińskiej nazwy grasicy — thymus). Jest najaktywniejsza w dzieciństwie, potem stopniowo zanika.", "Лежит за грудиной. В нём созревают Т-лимфоциты (буква T — от латинского названия тимуса, thymus). Наиболее активен в детстве, затем постепенно уменьшается."),
    pin: [230, 70],
    to: [136, 104],
  },
  spleen: {
    name: r("Śledziona", "Селезёнка"),
    text: r("Leży w lewym podżebrzu. Filtruje krew (a nie limfę): usuwa zużyte erytrocyty i namnaża limfocyty.", "Лежит в левом подреберье. Фильтрует кровь (а не лимфу): удаляет старые эритроциты и размножает лимфоциты."),
    pin: [232, 150],
    to: [164, 150],
  },
  duct: {
    name: r("Przewód piersiowy", "Грудной проток"),
    text: r("Największe naczynie chłonne. Zbiera limfę z większej części ciała i uchodzi do lewej żyły podobojczykowej — tak płyn wraca do krwi.", "Самый крупный лимфатический сосуд. Собирает лимфу с большей части тела и впадает в левую подключичную вену — так жидкость возвращается в кровь."),
    pin: [36, 168],
    to: [128, 150],
  },
  vessels: {
    name: r("Naczynia chłonne", "Лимфатические сосуды"),
    text: r(
      "Zaczynają się ślepo w tkankach i zbierają nadmiar płynu tkankowego. Jak żyły mają zastawki, a limfa płynie dzięki skurczom mięśni szkieletowych. Naczynia chłonne kosmków jelitowych wchłaniają strawione tłuszcze.",
      "Начинаются слепо в тканях и собирают избыток тканевой жидкости. Как и вены, имеют клапаны, а лимфа движется благодаря сокращениям скелетных мышц. Лимфатические сосуды кишечных ворсинок всасывают переваренные жиры.",
    ),
    pin: [228, 300],
    to: [160, 316],
  },
};

const NODES: [number, number][] = [
  [112, 80],
  [148, 80],
  [114, 88],
  [146, 88],
  [92, 104],
  [168, 104],
  [96, 112],
  [164, 112],
  [124, 172],
  [136, 178],
  [108, 198],
  [152, 198],
  [112, 206],
  [148, 206],
];

function LymphMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<LPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 260 380"
      title={r("Układ limfatyczny człowieka", "Лимфатическая система человека")}
      labelOrder={["tonsils", "nodes", "thymus", "spleen", "duct", "vessels"]}
      pinRadius={13}
      maxWidth="max-w-[320px]"
      art={({ part, tone }) => (
        <>
          <g fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={2}>
            <circle cx={130} cy={42} r={28} />
            <rect x={118} y={66} width={24} height={22} />
            <path d="M84 88 Q 130 78 176 88 L 182 200 Q 130 214 78 200 Z" />
          </g>
          <g stroke="#f1f5f9" strokeLinecap="round" fill="none">
            <path d="M86 94 L 54 190 L 44 250" strokeWidth={18} />
            <path d="M174 94 L 206 190 L 216 250" strokeWidth={18} />
            <path d="M106 204 L 100 360" strokeWidth={24} />
            <path d="M154 204 L 160 360" strokeWidth={24} />
          </g>
          {part(
            "vessels",
            <g stroke={tone("vessels", "#22c55e")} strokeWidth={2.5} fill="none" strokeDasharray="6 3">
              <path d="M84 98 L 54 188 L 44 244" />
              <path d="M176 98 L 206 188 L 216 244" />
              <path d="M106 212 L 100 352" />
              <path d="M154 212 L 160 352" />
              <path d="M108 206 L 124 186 M152 206 L 132 186" />
              <rect x={30} y={90} width={36} height={170} fill="transparent" stroke="none" />
              <rect x={194} y={90} width={36} height={170} fill="transparent" stroke="none" />
              <rect x={86} y={210} width={88} height={150} fill="transparent" stroke="none" />
            </g>,
          )}
          {part("duct", <path d="M128 188 L 128 120 C 128 98, 136 88, 148 84" stroke={tone("duct", "#0ea5e9")} strokeWidth={5} fill="none" strokeLinecap="round" />)}
          {part(
            "nodes",
            <g fill={tone("nodes", "#16a34a")}>
              {NODES.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={4.5} />
              ))}
            </g>,
          )}
          {part(
            "thymus",
            <g fill={tone("thymus", "#f59e0b")} stroke="#b45309" strokeWidth={1}>
              <ellipse cx={124} cy={108} rx={7} ry={12} />
              <ellipse cx={136} cy={108} rx={7} ry={12} />
            </g>,
          )}
          {part("spleen", <ellipse cx={162} cy={150} rx={10} ry={17} transform="rotate(-20 162 150)" fill={tone("spleen", "#9333ea")} stroke="#581c87" strokeWidth={1} />)}
          {part(
            "tonsils",
            <g fill={tone("tonsils", "#fb7185")} stroke="#be123c" strokeWidth={1}>
              <ellipse cx={121} cy={58} rx={5} ry={4} />
              <ellipse cx={139} cy={58} rx={5} ry={4} />
            </g>,
          )}
        </>
      )}
    />
  );
}

// ---------- innate vs specific ----------

const DEFENCES: SortItem[] = [
  { name: r("Skóra i błony śluzowe", "Кожа и слизистые оболочки"), group: 0, why: r("Bariera, która zatrzymuje każdy drobnoustrój tak samo.", "Барьер, одинаково задерживающий любой микроб.") },
  { name: r("Przeciwciała", "Антитела"), group: 1, why: r("Każde wiąże tylko jeden, określony antygen.", "Каждое связывает только один определённый антиген.") },
  { name: r("Lizozym we łzach i ślinie", "Лизоцим в слезах и слюне"), group: 0, why: r("Enzym rozkładający ściany komórkowe wielu bakterii.", "Фермент, разрушающий клеточные стенки многих бактерий.") },
  { name: r("Fagocytoza przez neutrofile", "Фагоцитоз нейтрофилами"), group: 0, why: r("Neutrofile pochłaniają drobnoustroje bez rozpoznawania konkretnego antygenu.", "Нейтрофилы поглощают микробы, не распознавая конкретный антиген.") },
  { name: r("Limfocyty T cytotoksyczne", "Цитотоксические Т-лимфоциты"), group: 1, why: r("Niszczą komórki z konkretnym antygenem, który rozpoznały.", "Уничтожают клетки с конкретным антигеном, который они распознали.") },
  { name: r("Kwas solny w żołądku", "Соляная кислота в желудке"), group: 0, why: r("Niszczy drobnoustroje połknięte z pokarmem — wszystkie jednakowo.", "Уничтожает микробы, проглоченные с пищей, — все одинаково.") },
  { name: r("Komórki pamięci", "Клетки памяти"), group: 1, why: r("Pamięć immunologiczna to cecha odporności swoistej.", "Иммунная память — признак специфического иммунитета.") },
  { name: r("Gorączka", "Лихорадка"), group: 0, why: r("Podwyższona temperatura hamuje namnażanie się wielu drobnoustrojów.", "Повышенная температура тормозит размножение многих микробов.") },
  { name: r("Komórki NK", "NK-клетки"), group: 0, why: r("Niszczą komórki zakażone i nowotworowe bez wcześniejszego kontaktu z antygenem.", "Уничтожают заражённые и опухолевые клетки без предварительной встречи с антигеном.") },
  { name: r("Komórki plazmatyczne", "Плазматические клетки"), group: 1, why: r("To zróżnicowane limfocyty B wytwarzające przeciwciała przeciw jednemu antygenowi.", "Это дифференцированные В-лимфоциты, вырабатывающие антитела к одному антигену.") },
  { name: r("Interferony", "Интерфероны"), group: 0, why: r("Komórki zakażone wirusem wydzielają je, by chronić sąsiednie komórki przed każdym wirusem.", "Заражённые вирусом клетки выделяют их, чтобы защитить соседние клетки от любого вируса.") },
  { name: r("Stan zapalny", "Воспаление"), group: 0, why: r("Miejscowa reakcja na każde uszkodzenie lub zakażenie.", "Местная реакция на любое повреждение или инфекцию.") },
];

// ---------- immune response ----------

interface RStep {
  name: Txt;
  text: Txt;
  kind?: "humoral" | "cellular";
}

const RESPONSE: RStep[] = [
  {
    name: r("Antygen", "Антиген"),
    text: r(
      "Do organizmu wnika drobnoustrój. Cząsteczki na jego powierzchni, rozpoznawane jako obce, to antygeny. Gdy drobnoustrój pokona bariery i odporność nieswoistą, rusza odpowiedź swoista.",
      "В организм проникает микроб. Молекулы на его поверхности, распознаваемые как чужие, — это антигены. Если микроб преодолеет барьеры и неспецифическую защиту, запускается специфический ответ.",
    ),
  },
  {
    name: r("Makrofag prezentuje antygen", "Макрофаг представляет антиген"),
    text: r(
      "Makrofag pochłania drobnoustrój (fagocytoza), trawi go i wystawia fragmenty antygenu na swojej powierzchni — staje się komórką prezentującą antygen.",
      "Макрофаг поглощает микроб (фагоцитоз), переваривает его и выставляет фрагменты антигена на своей поверхности — становится антигенпредставляющей клеткой.",
    ),
  },
  {
    name: r("Limfocyt Th", "Т-хелпер"),
    text: r("Limfocyt T pomocniczy rozpoznaje prezentowany antygen i zostaje pobudzony. Wydziela cytokiny, które uruchamiają kolejne etapy odpowiedzi.", "Т-хелпер распознаёт представленный антиген и активируется. Он выделяет цитокины, запускающие следующие этапы ответа."),
  },
  {
    name: r("Limfocyt B", "В-лимфоцит"),
    text: r("Limfocyt B, który rozpoznał ten sam antygen, pobudzony przez limfocyt Th zaczyna się intensywnie dzielić.", "В-лимфоцит, распознавший тот же антиген, после активации Т-хелпером начинает интенсивно делиться."),
    kind: "humoral",
  },
  {
    name: r("Komórki plazmatyczne i pamięci", "Плазматические клетки и клетки памяти"),
    text: r(
      "Większość potomnych limfocytów B przekształca się w komórki plazmatyczne, które wytwarzają przeciwciała. Część staje się długowiecznymi komórkami pamięci (P).",
      "Большинство дочерних В-лимфоцитов превращается в плазматические клетки, вырабатывающие антитела. Часть становится долгоживущими клетками памяти (П).",
    ),
    kind: "humoral",
  },
  {
    name: r("Przeciwciała działają", "Антитела действуют"),
    text: r("Przeciwciała swoiście wiążą antygen: zlepiają drobnoustroje, unieczynniają toksyny i ułatwiają fagocytozę.", "Антитела специфически связывают антиген: склеивают микробы, обезвреживают токсины и облегчают фагоцитоз."),
    kind: "humoral",
  },
  {
    name: r("Limfocyty Tc", "Цитотоксические Т-лимфоциты"),
    text: r(
      "Limfocyty Th pobudzają też limfocyty T cytotoksyczne. Rozpoznają one antygen na powierzchni komórek zakażonych wirusem i niszczą je. Także po tej odpowiedzi zostają komórki pamięci.",
      "Т-хелперы активируют и цитотоксические Т-лимфоциты. Те распознают антиген на поверхности заражённых вирусом клеток и уничтожают их. И после этого ответа остаются клетки памяти.",
    ),
    kind: "cellular",
  },
];

const KIND: Record<"humoral" | "cellular", Txt> = {
  humoral: r("odpowiedź humoralna", "гуморальный ответ"),
  cellular: r("odpowiedź komórkowa", "клеточный ответ"),
};

function Bug({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-18} y={-8} width={36} height={16} rx={8} fill="#84cc16" stroke="#3f6212" />
      {[-10, 0, 10].map((dx) => (
        <path key={dx} d={`M${dx - 3} -8 L ${dx} -14 L ${dx + 3} -8 Z M${dx - 3} 8 L ${dx} 14 L ${dx + 3} 8 Z`} fill="#dc2626" />
      ))}
    </g>
  );
}

function Ab({ x, y, a = 0 }: { x: number; y: number; a?: number }) {
  return <path d={`M${x} ${y + 8} L ${x} ${y} L ${x - 5} ${y - 6} M${x} ${y} L ${x + 5} ${y - 6}`} transform={`rotate(${a} ${x} ${y})`} stroke="#7c3aed" strokeWidth={2.5} fill="none" strokeLinecap="round" />;
}

function Cell({ x, y, rad, fill, stroke, label, on }: { x: number; y: number; rad: number; fill: string; stroke: string; label: string; on: boolean }) {
  return (
    <g opacity={on ? 1 : 0.15} style={{ transition: "opacity .4s" }}>
      <circle cx={x} cy={y} r={rad} fill={fill} stroke={stroke} strokeWidth={2} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={stroke}>
        {label}
      </text>
    </g>
  );
}

function Arr({ d, on }: { d: string; on: boolean }) {
  return <path d={d} stroke="#475569" strokeWidth={2} fill="none" markerEnd="url(#imm-arrow)" opacity={on ? 1 : 0} style={{ transition: "opacity .4s" }} />;
}

function ImmuneResponse({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const step = RESPONSE[i]!;
  const P = lang === "pl" ? "P" : "П";
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 340 210" className="w-full" role="img" aria-label={step.name[lang]}>
          <defs>
            <marker id="imm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#475569" />
            </marker>
          </defs>
          <rect width={340} height={210} rx={12} fill="#f8fafc" />
          {i === 0 && <Bug x={34} y={105} />}
          <g opacity={i >= 1 ? 1 : 0.15} style={{ transition: "opacity .4s" }}>
            <path d="M74 105 C 70 80, 96 74, 110 82 C 130 76, 134 100, 126 110 C 134 128, 108 136, 96 128 C 78 134, 70 118, 74 105 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth={2} />
            {i >= 1 && <Bug x={98} y={104} s={0.45} />}
            {i >= 1 && <path d="M128 99 L 136 105 L 128 111 Z" fill="#dc2626" />}
            <text x={100} y={150} textAnchor="middle" fontSize={9} fill="#9a3412">
              {lang === "pl" ? "makrofag" : "макрофаг"}
            </text>
          </g>
          <Cell x={182} y={105} rad={20} fill="#bfdbfe" stroke="#1d4ed8" label="Th" on={i >= 2} />
          <Cell x={250} y={46} rad={18} fill="#ddd6fe" stroke="#6d28d9" label="B" on={i >= 3} />
          <g opacity={i >= 4 ? 1 : 0.15} style={{ transition: "opacity .4s" }}>
            <circle cx={310} cy={46} r={22} fill="#ede9fe" stroke="#6d28d9" strokeWidth={2} />
            <circle cx={316} cy={46} r={8} fill="#6d28d9" />
            {[36, 44, 52].map((y) => (
              <path key={y} d={`M294 ${y} q 6 -3 12 0`} stroke="#a78bfa" strokeWidth={1.5} fill="none" />
            ))}
            <text x={310} y={14} textAnchor="middle" fontSize={9} fill="#5b21b6">
              {lang === "pl" ? "kom. plazmatyczna" : "плазм. клетка"}
            </text>
          </g>
          <Cell x={222} y={20} rad={9} fill="#f5f3ff" stroke="#6d28d9" label={P} on={i >= 4} />
          <g opacity={i >= 4 ? 1 : 0} style={{ transition: "opacity .4s" }}>
            {i >= 5 ? (
              <>
                <Bug x={296} y={102} s={0.6} />
                <Ab x={286} y={86} a={-20} />
                <Ab x={306} y={86} a={20} />
                <Ab x={296} y={124} a={180} />
              </>
            ) : (
              <>
                <Ab x={280} y={90} />
                <Ab x={300} y={98} a={15} />
                <Ab x={318} y={90} a={-15} />
              </>
            )}
          </g>
          <Cell x={250} y={165} rad={18} fill="#fecaca" stroke="#b91c1c" label="Tc" on={i >= 6} />
          <Cell x={222} y={196} rad={9} fill="#fef2f2" stroke="#b91c1c" label={P} on={i >= 6} />
          <g opacity={i >= 6 ? 1 : 0.15} style={{ transition: "opacity .4s" }}>
            <circle cx={312} cy={165} r={20} fill="#fef3c7" stroke="#ca8a04" strokeWidth={2} />
            {[
              [304, 158],
              [318, 160],
              [310, 172],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r={3} fill="#dc2626" />
            ))}
            {i >= 6 && <path d="M298 151 L 326 179 M326 151 L 298 179" stroke="#b91c1c" strokeWidth={3} strokeLinecap="round" />}
          </g>
          <Arr d="M56 105 L 70 105" on={i >= 1} />
          <Arr d="M138 105 L 158 105" on={i >= 2} />
          <Arr d="M198 92 L 234 58" on={i >= 3} />
          <Arr d="M268 46 L 284 46" on={i >= 4} />
          <Arr d="M244 30 L 232 24" on={i >= 4} />
          <Arr d="M198 118 L 234 154" on={i >= 6} />
          <Arr d="M268 165 L 288 165" on={i >= 6} />
          <Arr d="M244 180 L 232 190" on={i >= 6} />
        </svg>
        <div className="mt-2 flex flex-wrap gap-2">
          <Choice onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
            ‹ {lang === "pl" ? "Wstecz" : "Назад"}
          </Choice>
          {i < RESPONSE.length - 1 ? (
            <Choice state="active" onClick={() => setI(i + 1)}>
              {KIT.next[lang]} ›
            </Choice>
          ) : (
            <Choice onClick={() => setI(0)}>↺ {KIT.again[lang]}</Choice>
          )}
        </div>
      </div>
      <div className="space-y-3" aria-live="polite">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {lang === "pl" ? "Krok" : "Шаг"} {i + 1} / {RESPONSE.length}
          {step.kind && <span className={`ml-2 rounded-full px-2 py-0.5 normal-case ${step.kind === "humoral" ? "bg-violet-100 text-violet-800" : "bg-rose-100 text-rose-800"}`}>{KIND[step.kind][lang]}</span>}
        </p>
        <h3 className="text-base font-semibold text-slate-900">{step.name[lang]}</h3>
        <p className="text-[15px] leading-relaxed text-slate-700">{step.text[lang]}</p>
      </div>
    </div>
  );
}

// ---------- primary and secondary response ----------

const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** antibody level of one response that starts at day t0 */
function response(t: number, t0: number, lag: number, rise: number, h: number, decay: number): number {
  const s = t - t0 - lag;
  if (s <= 0) return 0;
  if (s < rise) return h * smooth(s / rise);
  return h * Math.exp(-(s - rise) / decay);
}

const PRIMARY = { lag: 6, rise: 8, h: 1, decay: 14 };
const SECONDARY = { lag: 2, rise: 5, h: 5, decay: 45 };

function Memory({ lang }: { lang: BioLang }) {
  const [t2, setT2] = useState(50);
  const [vaccine, setVaccine] = useState(false);
  const [memory, setMemory] = useState(true);
  const X = (d: number) => 34 + d * 2.76;
  const Y = (v: number) => 150 - v * 22;
  const ab = (t: number) => response(t, 0, PRIMARY.lag, PRIMARY.rise, PRIMARY.h, PRIMARY.decay) + response(t, t2, SECONDARY.lag, SECONDARY.rise, SECONDARY.h, SECONDARY.decay);
  const mem = (t: number) => 0.8 * smooth((t - PRIMARY.lag) / 10) + 0.8 * smooth((t - t2 - SECONDARY.lag) / 8);
  const line = (f: (t: number) => number) => {
    const pts: string[] = [];
    for (let t = 0; t <= 100; t += 0.5) pts.push(`${pts.length ? "L" : "M"}${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`);
    return pts.join(" ");
  };
  const day = lang === "pl" ? "dzień" : "день";
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <svg viewBox="0 0 320 180" className="w-full" role="img" aria-label={lang === "pl" ? "Stężenie przeciwciał w czasie" : "Концентрация антител во времени"}>
          <rect width={320} height={180} rx={10} fill="#f8fafc" />
          {!vaccine && <rect x={X(2)} y={14} width={X(15) - X(2)} height={136} fill="#fee2e2" />}
          {!vaccine && (
            <text x={X(8.5)} y={24} textAnchor="middle" fontSize={8} fill="#b91c1c">
              {lang === "pl" ? "choroba" : "болезнь"}
            </text>
          )}
          <path d="M34 150 L 312 150 M34 150 L 34 12" stroke="#94a3b8" />
          {[0, 20, 40, 60, 80, 100].map((d) => (
            <text key={d} x={X(d)} y={162} textAnchor="middle" fontSize={8} fill="#94a3b8">
              {d}
            </text>
          ))}
          <text x={312} y={174} textAnchor="end" fontSize={8} fill="#64748b">
            {lang === "pl" ? "dni" : "дни"}
          </text>
          <text x={38} y={12} fontSize={8} fill="#64748b">
            {lang === "pl" ? "przeciwciała" : "антитела"}
          </text>
          {[0, t2].map((d, k) => (
            <g key={k}>
              <path d={`M${X(d)} 150 L ${X(d)} 140`} stroke="#dc2626" strokeWidth={2} />
              <text x={X(d)} y={136} textAnchor="middle" fontSize={11}>
                {k === 0 && vaccine ? "💉" : "🦠"}
              </text>
            </g>
          ))}
          {memory && <path d={line(mem)} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" />}
          <path d={line(ab)} fill="none" stroke="#7c3aed" strokeWidth={3} strokeLinejoin="round" />
        </svg>
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Drugi kontakt z antygenem" : "Вторая встреча с антигеном"}: {day} {t2}
          <input type="range" min={30} max={80} value={t2} onChange={(e) => setT2(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-violet-600" aria-valuetext={`${day} ${t2}`} />
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {[false, true].map((v) => (
            <Choice key={String(v)} state={vaccine === v ? "active" : "idle"} onClick={() => setVaccine(v)}>
              {v ? (lang === "pl" ? "1. kontakt: szczepionka 💉" : "1-я встреча: вакцина 💉") : lang === "pl" ? "1. kontakt: zakażenie 🦠" : "1-я встреча: инфекция 🦠"}
            </Choice>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={memory} onChange={(e) => setMemory(e.target.checked)} className="h-4 w-4 accent-amber-500" />
          <span>
            <span className="font-bold text-amber-500">- - -</span> {lang === "pl" ? "pokaż liczbę komórek pamięci" : "показать число клеток памяти"}
          </span>
        </label>
      </div>
      <div className="space-y-3 text-[15px] leading-relaxed text-slate-700" aria-live="polite">
        <p>
          <b className="text-violet-800">{lang === "pl" ? "Odpowiedź pierwotna" : "Первичный ответ"}</b>{" "}
          {lang === "pl"
            ? "— przeciwciała pojawiają się dopiero po ok. tygodniu, a maksimum osiągają po ok. 2 tygodniach. Tyle czasu limfocyty potrzebują na rozpoznanie antygenu i namnożenie się."
            : "— антитела появляются лишь примерно через неделю, а максимума достигают примерно через 2 недели. Столько времени нужно лимфоцитам, чтобы распознать антиген и размножиться."}
        </p>
        <p>
          <b className="text-violet-800">{lang === "pl" ? `Odpowiedź wtórna (${day} ${t2})` : `Вторичный ответ (${day} ${t2})`}</b>{" "}
          {lang === "pl"
            ? "— komórki pamięci rozpoznają antygen od razu: przeciwciała rosną już po 1–3 dniach, osiągają wielokrotnie wyższe stężenie i utrzymują się dłużej. Drobnoustrój zostaje zniszczony, zanim wywoła objawy."
            : "— клетки памяти сразу узнают антиген: антитела нарастают уже через 1–3 дня, достигают во много раз более высокой концентрации и дольше сохраняются. Микроб уничтожается раньше, чем вызовет симптомы."}
        </p>
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-950 ring-1 ring-emerald-200">
          {vaccine
            ? lang === "pl"
              ? "Szczepionka zawiera antygeny osłabionych lub zabitych drobnoustrojów albo ich fragmenty. Wywołuje odpowiedź pierwotną i powstanie komórek pamięci — bez przechodzenia choroby."
              : "Вакцина содержит антигены ослабленных или убитых микробов либо их фрагменты. Она вызывает первичный ответ и образование клеток памяти — без перенесённой болезни."
            : lang === "pl"
              ? "Przy pierwszym zakażeniu organizm choruje, zanim przeciwciał będzie dość. Przełącz na szczepionkę i porównaj."
              : "При первой инфекции организм болеет, пока антител не станет достаточно. Переключи на вакцину и сравни."}
        </p>
      </div>
    </div>
  );
}

// ---------- kinds of immunity ----------

type Kind = "activeNatural" | "activeArtificial" | "passiveNatural" | "passiveArtificial";

const KINDS: Record<Kind, Txt> = {
  activeNatural: r("czynna naturalna", "естественный активный"),
  activeArtificial: r("czynna sztuczna", "искусственный активный"),
  passiveNatural: r("bierna naturalna", "естественный пассивный"),
  passiveArtificial: r("bierna sztuczna", "искусственный пассивный"),
};

const EXAMPLES: { name: Txt; kind: Kind; why: Txt }[] = [
  { name: r("przechorowanie ospy wietrznej", "перенесённая ветряная оспа"), kind: "activeNatural", why: r("Organizm sam wytworzył przeciwciała i komórki pamięci po zakażeniu.", "Организм сам выработал антитела и клетки памяти после инфекции.") },
  { name: r("szczepionka przeciw odrze", "вакцина против кори"), kind: "activeArtificial", why: r("Podano antygen, a przeciwciała i komórki pamięci wytworzył sam organizm.", "Введён антиген, а антитела и клетки памяти организм выработал сам.") },
  { name: r("przeciwciała matki przechodzące przez łożysko", "антитела матери, проходящие через плаценту"), kind: "passiveNatural", why: r("Płód dostaje gotowe przeciwciała; chronią noworodka przez pierwsze miesiące.", "Плод получает готовые антитела; они защищают новорождённого первые месяцы.") },
  { name: r("surowica przeciwjadowa po ukąszeniu żmii", "противозмеиная сыворотка после укуса гадюки"), kind: "passiveArtificial", why: r("Gotowe przeciwciała działają natychmiast, ale krótko.", "Готовые антитела действуют сразу, но недолго.") },
  { name: r("przeciwciała w mleku matki", "антитела в материнском молоке"), kind: "passiveNatural", why: r("Niemowlę dostaje gotowe przeciwciała z pokarmem.", "Младенец получает готовые антитела с молоком.") },
  { name: r("szczepienie przeciw HPV", "прививка от ВПЧ"), kind: "activeArtificial", why: r("Szczepionka uczy układ odpornościowy rozpoznawać wirusa — powstaje pamięć.", "Вакцина учит иммунную систему узнавать вирус — возникает память.") },
  { name: r("immunoglobulina anty-D podana matce po porodzie", "иммуноглобулин анти-D, введённый матери после родов"), kind: "passiveArtificial", why: r("To gotowe przeciwciała podane w zastrzyku.", "Это готовые антитела, введённые уколом.") },
  { name: r("przechorowanie świnki", "перенесённый эпидемический паротит (свинка)"), kind: "activeNatural", why: r("Odporność po chorobie — własne przeciwciała i komórki pamięci.", "Иммунитет после болезни — собственные антитела и клетки памяти.") },
  { name: r("surowica przeciwtężcowa po głębokiej, zabrudzonej ranie", "противостолбнячная сыворотка при глубокой загрязнённой ране"), kind: "passiveArtificial", why: r("Gotowe przeciwciała unieczynniają toksynę od razu — nie ma czasu czekać na własne.", "Готовые антитела сразу обезвреживают токсин — ждать собственных некогда.") },
];

const GRID = {
  active: r("Czynna", "Активный"),
  passive: r("Bierna", "Пассивный"),
  natural: r("Naturalna", "Естественный"),
  artificial: r("Sztuczna", "Искусственный"),
  activeNote: r("własne przeciwciała i komórki pamięci; działa długo, ale powstaje powoli", "собственные антитела и клетки памяти; действует долго, но формируется медленно"),
  passiveNote: r("gotowe przeciwciała z zewnątrz; działa od razu, ale tylko kilka tygodni", "готовые антитела извне; действует сразу, но лишь несколько недель"),
  where: r("Gdzie pasuje", "Куда отнести"),
  wrong: r("to pole nie pasuje. Zadaj sobie dwa pytania: kto wytworzył przeciwciała? czy zrobił to człowiek (medycyna)?", "эта клетка не подходит. Задай себе два вопроса: кто выработал антитела? вмешался ли человек (медицина)?"),
  done: r("Wszystko na miejscu! Pomyłek:", "Всё на месте! Ошибок:"),
};

function KindsGrid({ lang }: { lang: BioLang }) {
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState<Kind | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const item = EXAMPLES[idx];
  const placed = EXAMPLES.slice(0, idx);
  const pick = (k: Kind) => {
    if (!item) return;
    if (k === item.kind) {
      setIdx(idx + 1);
      setWrong(null);
    } else {
      setWrong(k);
      setMistakes(mistakes + 1);
    }
  };
  const reset = () => {
    setIdx(0);
    setWrong(null);
    setMistakes(0);
  };
  const last = idx > 0 ? EXAMPLES[idx - 1] : null;
  const cell = (k: Kind) => (
    <button
      type="button"
      onClick={() => pick(k)}
      disabled={!item}
      aria-label={KINDS[k][lang]}
      className={`min-h-24 rounded-xl p-2 text-left align-top ring-1 transition-colors ${
        wrong === k ? "bg-rose-50 ring-rose-300" : "bg-white ring-slate-200 hover:bg-emerald-50 disabled:hover:bg-white"
      }`}
    >
      <span className="block text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{KINDS[k][lang]}</span>
      <span className="mt-1 flex flex-wrap gap-1">
        {placed
          .filter((e) => e.kind === k)
          .map((e) => (
            <span key={e.name.pl} className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-900">
              {e.name[lang]}
            </span>
          ))}
      </span>
    </button>
  );
  return (
    <div className="space-y-3">
      <div aria-live="polite">
        {item ? (
          <p className="rounded-xl bg-indigo-50 px-4 py-3 text-[15px] text-indigo-950 ring-1 ring-indigo-200">
            {GRID.where[lang]}: <b>{item.name[lang]}</b>
            <span className="ml-2 text-xs text-indigo-600">
              {idx + 1} / {EXAMPLES.length}
            </span>
          </p>
        ) : (
          <Verdict ok={mistakes === 0} lang={lang}>
            {GRID.done[lang]} {mistakes}.
          </Verdict>
        )}
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-2 text-sm">
        <div />
        <div className="text-center font-semibold text-slate-700">{GRID.natural[lang]}</div>
        <div className="text-center font-semibold text-slate-700">{GRID.artificial[lang]}</div>
        <div className="flex w-20 flex-col justify-center sm:w-36">
          <span className="font-semibold text-slate-700">{GRID.active[lang]}</span>
          <span className="hidden text-xs text-slate-500 sm:block">{GRID.activeNote[lang]}</span>
        </div>
        {cell("activeNatural")}
        {cell("activeArtificial")}
        <div className="flex w-20 flex-col justify-center sm:w-36">
          <span className="font-semibold text-slate-700">{GRID.passive[lang]}</span>
          <span className="hidden text-xs text-slate-500 sm:block">{GRID.passiveNote[lang]}</span>
        </div>
        {cell("passiveNatural")}
        {cell("passiveArtificial")}
      </div>
      {wrong && item && (
        <Verdict ok={false} lang={lang}>
          {KINDS[wrong][lang]} — {GRID.wrong[lang]}
        </Verdict>
      )}
      {!wrong && last && item && (
        <p className="text-sm text-emerald-800">
          ✓ {last.name[lang]}: {last.why[lang]}
        </p>
      )}
      {!item && (
        <>
          {last && (
            <p className="text-sm text-emerald-800">
              ✓ {last.name[lang]}: {last.why[lang]}
            </p>
          )}
          <Choice onClick={reset}>↺ {KIT.again[lang]}</Choice>
        </>
      )}
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Limfa powstaje z nadmiaru płynu tkankowego i wraca do krwi przez przewód piersiowy.", ru: "Лимфа образуется из избытка тканевой жидкости и возвращается в кровь через грудной проток." },
    { pl: "Węzły chłonne filtrują limfę, śledziona — krew; w grasicy dojrzewają limfocyty T.", ru: "Лимфатические узлы фильтруют лимфу, селезёнка — кровь; в тимусе созревают Т-лимфоциты." },
  ],
  s2: [{ pl: "Odporność nieswoista działa od razu i tak samo wobec każdego patogenu; swoista rozpoznaje konkretny antygen i ma pamięć.", ru: "Неспецифический иммунитет действует сразу и одинаково против любого патогена; специфический распознаёт конкретный антиген и обладает памятью." }],
  s3: [
    { pl: "Odpowiedź humoralna: limfocyty B → komórki plazmatyczne → przeciwciała.", ru: "Гуморальный ответ: В-лимфоциты → плазматические клетки → антитела." },
    { pl: "Odpowiedź komórkowa: limfocyty Tc niszczą zakażone komórki. Obie odpowiedzi uruchamiają limfocyty Th.", ru: "Клеточный ответ: цитотоксические Т-лимфоциты уничтожают заражённые клетки. Оба ответа запускают Т-хелперы." },
  ],
  s4: [{ pl: "Przy ponownym kontakcie z antygenem komórki pamięci zapewniają odpowiedź szybszą i silniejszą — na tym polega działanie szczepień.", ru: "При повторной встрече с антигеном клетки памяти обеспечивают более быстрый и сильный ответ — на этом основано действие прививок." }],
  s5: [
    { pl: "Czynna: organizm sam wytwarza przeciwciała i komórki pamięci — odporność długotrwała, ale powstaje powoli.", ru: "Активный: организм сам вырабатывает антитела и клетки памяти — иммунитет длительный, но формируется медленно." },
    { pl: "Bierna: gotowe przeciwciała — działa od razu, ale tylko kilka tygodni.", ru: "Пассивный: готовые антитела — действует сразу, но лишь несколько недель." },
  ],
};

export default function ImmunityLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="imm" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="imm-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <LymphMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="imm-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={r("Nieswoista czy swoista?", "Неспецифический или специфический?")} groups={[r("Nieswoista", "Неспецифический"), r("Swoista", "Специфический")]} items={DEFENCES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="imm-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <ImmuneResponse lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="imm-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Memory lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="imm-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <KindsGrid lang={lang} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
