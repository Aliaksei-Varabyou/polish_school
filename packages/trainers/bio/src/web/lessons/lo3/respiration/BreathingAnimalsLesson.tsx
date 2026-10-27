// Lesson for LO3 §5.1 "Układ oddechowy u zwierząt" (zakres rozszerzony). Terms follow
// templates/data/comparative.ts (ANIMAL_BREATHING).
import { useEffect, useState, type ReactNode } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, type CompareCard, type QuizItem, type QuizOption } from "@portal/lessons";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Każde zwierzę musi pobierać tlen i usuwać dwutlenek węgla, a gazy przechodzą przez błony wyłącznie na drodze dyfuzji. Dlatego narządy wymiany gazowej — od skóry dżdżownicy po płuca ptaka — mają wspólne cechy: dużą powierzchnię, cienką i wilgotną ścianę oraz zwykle bogate ukrwienie.",
    "Каждое животное должно поглощать кислород и удалять углекислый газ, а газы проходят через мембраны только путём диффузии. Поэтому у органов газообмена — от кожи дождевого червя до лёгких птицы — общие черты: большая поверхность, тонкая влажная стенка и, как правило, обильное кровоснабжение.",
  ),
  s1: r("Narządy wymiany gazowej", "Органы газообмена"),
  s1intro: r("Porównaj, jak różne zwierzęta rozwiązują ten sam problem — doprowadzenie tlenu do komórek.", "Сравни, как разные животные решают одну задачу — доставку кислорода к клеткам."),
  s2: r("Wymiana przeciwprądowa w skrzelach", "Противоточный обмен в жабрах"),
  s2intro: r(
    "W blaszce skrzelowej ryby krew płynie w kierunku przeciwnym do wody. Przełącz kierunek przepływu krwi i przesuń sondę wzdłuż blaszki.",
    "В жаберной пластинке рыбы кровь течёт навстречу воде. Переключи направление тока крови и передвигай зонд вдоль пластинки.",
  ),
  s3: r("Worki powietrzne i podwójne oddychanie ptaków", "Воздушные мешки и двойное дыхание птиц"),
  s3intro: r(
    "Śledź jedną porcję powietrza (żółte kropki): potrzebuje dwóch wdechów i dwóch wydechów, by przejść przez układ oddechowy ptaka.",
    "Следи за одной порцией воздуха (жёлтые точки): ей нужно два вдоха и два выдоха, чтобы пройти через дыхательную систему птицы.",
  ),
  s4: r("Kto czym oddycha?", "Кто чем дышит?"),
  s4intro: r("Dopasuj zwierzę do jego głównego narządu wymiany gazowej.", "Подбери животному его главный орган газообмена."),
} satisfies Record<string, Txt>;

// ---------- organs ----------

const L = {
  who: r("Przykłady", "Примеры"),
  where: r("Środowisko", "Среда"),
  build: r("Budowa", "Строение"),
  blood: r("Transport gazów", "Транспорт газов"),
  vent: r("Wentylacja", "Вентиляция"),
};

function Art({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full" role="img" aria-label={label}>
      <rect width={200} height={140} rx={10} fill="#f8fafc" />
      {children}
    </svg>
  );
}

const O2 = "#0284c7";

function Arrow({ d, color = O2 }: { d: string; color?: string }) {
  return <path d={d} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

function organs(lang: BioLang): CompareCard[] {
  return [
    {
      id: "skin",
      icon: "🪱",
      name: r("Powierzchnia ciała", "Поверхность тела"),
      art: (
        <Art label={lang === "pl" ? "Oddychanie przez skórę" : "Кожное дыхание"}>
          <rect x={20} y={50} width={160} height={50} rx={25} fill="#fbcfe8" stroke="#be185d" strokeWidth={2} />
          {[40, 70, 100, 130, 160].map((x) => (
            <path key={x} d={`M${x - 10} 60 q 5 -6 10 0 t 10 0`} stroke="#dc2626" strokeWidth={1.8} fill="none" />
          ))}
          <Arrow d="M60 18 L 60 46 M54 38 L 60 46 L 66 38" />
          <Arrow d="M140 46 L 140 18 M134 26 L 140 18 L 146 26" color="#78716c" />
          <text x={72} y={26} fontSize={11} fill={O2} fontWeight={600}>
            O₂
          </text>
          <text x={152} y={26} fontSize={11} fill="#57534e" fontWeight={600}>
            CO₂
          </text>
          <text x={100} y={124} textAnchor="middle" fontSize={10} fill="#64748b">
            {lang === "pl" ? "wilgotna skóra + naczynia włosowate" : "влажная кожа + капилляры"}
          </text>
        </Art>
      ),
      rows: [
        { label: L.who, value: r("parzydełkowce, płazińce, dżdżownica; uzupełniająco płazy", "кишечнополостные, плоские черви, дождевой червь; дополнительно земноводные") },
        { label: L.where, value: r("woda lub wilgotne środowisko lądowe", "вода или влажная среда на суше") },
        { label: L.build, value: r("cienka, wilgotna skóra (u dżdżownicy pokryta śluzem) z gęstą siecią naczyń włosowatych", "тонкая влажная кожа (у дождевого червя покрытая слизью) с густой сетью капилляров") },
        { label: L.blood, value: r("u dżdżownicy tlen rozprowadza krew; u płazińców, które nie mają układu krwionośnego, tlen dyfunduje wprost do komórek", "у дождевого червя кислород разносит кровь; у плоских червей, у которых нет кровеносной системы, кислород диффундирует прямо к клеткам") },
        { label: L.vent, value: r("brak — wystarcza dyfuzja", "нет — достаточно диффузии") },
      ],
      text: r(
        "Wystarcza tylko małym lub płaskim zwierzętom: mają dużą powierzchnię w stosunku do objętości ciała. Skóra musi być stale wilgotna, bo gazy dyfundują dopiero po rozpuszczeniu się w wodzie.",
        "Этого хватает лишь мелким или плоским животным: у них большая поверхность по отношению к объёму тела. Кожа должна быть постоянно влажной, ведь газы диффундируют, только растворившись в воде.",
      ),
    },
    {
      id: "gills",
      icon: "🐟",
      name: r("Skrzela", "Жабры"),
      art: (
        <Art label={lang === "pl" ? "Łuk skrzelowy z listkami" : "Жаберная дуга с лепестками"}>
          <path d="M30 110 Q 100 30 170 110" stroke="#94a3b8" strokeWidth={8} fill="none" strokeLinecap="round" />
          {Array.from({ length: 13 }, (_, k) => {
            const t = (k + 0.5) / 13;
            const x = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 100 + t * t * 170;
            const y = (1 - t) * (1 - t) * 110 + 2 * (1 - t) * t * 30 + t * t * 110;
            return <path key={k} d={`M${x} ${y} L ${x + (x - 100) * 0.25} ${y + 34}`} stroke="#ef4444" strokeWidth={5} strokeLinecap="round" />;
          })}
          <Arrow d="M10 30 L 50 30 M42 24 L 50 30 L 42 36" />
          <text x={12} y={20} fontSize={10} fill={O2}>
            {lang === "pl" ? "woda" : "вода"}
          </text>
          <text x={100} y={132} textAnchor="middle" fontSize={10} fill="#64748b">
            {lang === "pl" ? "listki skrzelowe" : "жаберные лепестки"}
          </text>
        </Art>
      ),
      rows: [
        { label: L.who, value: r("ryby, larwy płazów, skorupiaki, małże", "рыбы, личинки земноводных, ракообразные, двустворчатые моллюски") },
        { label: L.where, value: r("woda", "вода") },
        { label: L.build, value: r("łuki skrzelowe z licznymi listkami i blaszkami — ogromna, cienkościenna, silnie ukrwiona powierzchnia", "жаберные дуги с многочисленными лепестками и пластинками — огромная тонкостенная поверхность с обильным кровоснабжением") },
        { label: L.blood, value: r("krew pobiera tlen w blaszkach skrzelowych i rozprowadza go po ciele", "кровь забирает кислород в жаберных пластинках и разносит его по телу") },
        { label: L.vent, value: r("u ryb kostnoszkieletowych woda wpływa otworem gębowym i wypływa spod pokrywy skrzelowej — przepływ jest jednokierunkowy", "у костных рыб вода входит через рот и выходит из-под жаберной крышки — ток односторонний") },
      ],
      text: r(
        "Woda zawiera wielokrotnie mniej tlenu niż powietrze, więc skrzela muszą wydobyć z niej jak najwięcej — służy temu wymiana przeciwprądowa. Na lądzie blaszki skrzelowe zlepiają się i wysychają.",
        "В воде во много раз меньше кислорода, чем в воздухе, поэтому жабры должны извлечь из неё как можно больше — для этого служит противоточный обмен. На суше жаберные пластинки слипаются и высыхают.",
      ),
    },
    {
      id: "tracheae",
      icon: "🦗",
      name: r("Tchawki", "Трахеи"),
      art: (
        <Art label={lang === "pl" ? "Tchawki owada" : "Трахеи насекомого"}>
          <ellipse cx={100} cy={72} rx={80} ry={36} fill="#ecfccb" stroke="#65a30d" strokeWidth={2} />
          <path d="M30 72 L 170 72" stroke="#64748b" strokeWidth={4} />
          {[50, 80, 110, 140].map((x) => (
            <g key={x} stroke="#64748b" fill="none" strokeLinecap="round">
              <path d={`M${x} 40 L ${x} 104`} strokeWidth={3} />
              <path d={`M${x} 56 l -10 -6 M${x} 56 l 10 -6 M${x} 90 l -10 6 M${x} 90 l 10 6`} strokeWidth={1.5} />
              <circle cx={x} cy={38} r={3.5} fill="#1e293b" stroke="none" />
              <circle cx={x} cy={106} r={3.5} fill="#1e293b" stroke="none" />
            </g>
          ))}
          <text x={100} y={130} textAnchor="middle" fontSize={10} fill="#64748b">
            {lang === "pl" ? "przetchlinki → tchawki → komórki" : "дыхальца → трахеи → клетки"}
          </text>
        </Art>
      ),
      rows: [
        { label: L.who, value: r("owady, także niektóre pajęczaki i wije", "насекомые, а также некоторые паукообразные и многоножки") },
        { label: L.where, value: r("ląd", "суша") },
        { label: L.build, value: r("rozgałęzione rurki wzmocnione chitynową spiralą; zaczynają się przetchlinkami na bokach ciała, a ich najcieńsze odgałęzienia dochodzą do komórek", "разветвлённые трубочки, укреплённые хитиновой спиралью; начинаются дыхальцами по бокам тела, а их тончайшие веточки подходят к самим клеткам") },
        { label: L.blood, value: r("hemolimfa prawie nie bierze udziału — powietrze dociera tchawkami wprost do komórek", "гемолимфа почти не участвует — воздух по трахеям доходит прямо до клеток") },
        { label: L.vent, value: r("dyfuzja; duże owady wspomagają ją ruchami odwłoka", "диффузия; крупные насекомые помогают ей движениями брюшка") },
      ],
      text: r(
        "Przetchlinki mogą się zamykać, co ogranicza utratę wody. Dyfuzja w długich rurkach jest powolna — to jeden z powodów, dla których owady są niewielkie.",
        "Дыхальца могут закрываться, что ограничивает потерю воды. Диффузия по длинным трубкам медленная — это одна из причин, почему насекомые невелики.",
      ),
    },
    {
      id: "book",
      icon: "🕷️",
      name: r("Płucotchawki", "Лёгочные мешки"),
      art: (
        <Art label={lang === "pl" ? "Płucotchawka" : "Лёгочный мешок"}>
          <path d="M30 30 L 150 30 Q 175 30 175 55 L 175 95 Q 175 120 150 120 L 30 120" fill="#fef3c7" stroke="#a16207" strokeWidth={2} />
          {Array.from({ length: 8 }, (_, k) => (
            <rect key={k} x={50} y={38 + k * 10} width={115} height={5} rx={2.5} fill="#f87171" stroke="#b91c1c" strokeWidth={0.8} />
          ))}
          <path d="M30 30 L 30 120" stroke="#a16207" strokeWidth={4} strokeDasharray="10 8" />
          <Arrow d="M6 75 L 40 75 M32 69 L 40 75 L 32 81" />
          <text x={4} y={66} fontSize={10} fill={O2}>
            {lang === "pl" ? "powietrze" : "воздух"}
          </text>
          <text x={110} y={136} textAnchor="middle" fontSize={10} fill="#64748b">
            {lang === "pl" ? "blaszki jak kartki książki" : "пластинки как страницы книги"}
          </text>
        </Art>
      ),
      rows: [
        { label: L.who, value: r("pajęczaki: pająki, skorpiony", "паукообразные: пауки, скорпионы") },
        { label: L.where, value: r("ląd", "суша") },
        { label: L.build, value: r("wpuklenie ściany ciała z wieloma cienkimi blaszkami ułożonymi jak kartki książki; między blaszkami jest powietrze, wewnątrz nich płynie hemolimfa", "впячивание стенки тела со множеством тонких пластинок, сложенных как страницы книги; между пластинками воздух, внутри них течёт гемолимфа") },
        { label: L.blood, value: r("hemolimfa z hemocyjaniną przenosi tlen do narządów", "гемолимфа с гемоцианином переносит кислород к органам") },
        { label: L.vent, value: r("głównie dyfuzja przez szczelinę oddechową", "в основном диффузия через дыхательную щель") },
      ],
      text: r("Wiele pająków ma jednocześnie płucotchawki i tchawki.", "У многих пауков есть одновременно и лёгочные мешки, и трахеи."),
    },
    {
      id: "frog",
      icon: "🐸",
      name: r("Płuca płazów", "Лёгкие земноводных"),
      art: (
        <Art label={lang === "pl" ? "Workowate płuca płaza" : "Мешковидные лёгкие земноводного"}>
          <path d="M100 14 L 100 44 M100 44 L 72 58 M100 44 L 128 58" stroke="#94a3b8" strokeWidth={6} fill="none" strokeLinecap="round" />
          {[-1, 1].map((s) => (
            <g key={s}>
              <ellipse cx={100 + s * 38} cy={86} rx={30} ry={40} fill="#fecdd3" stroke="#be123c" strokeWidth={2} />
              <path d={`M${100 + s * 38} 60 L ${100 + s * 38} 112 M${100 + s * 24} 76 L ${100 + s * 52} 76 M${100 + s * 24} 96 L ${100 + s * 52} 96`} stroke="#be123c" strokeWidth={1} opacity={0.5} />
            </g>
          ))}
          <text x={100} y={136} textAnchor="middle" fontSize={10} fill="#64748b">
            {lang === "pl" ? "słabo pofałdowane worki" : "слабо складчатые мешки"}
          </text>
        </Art>
      ),
      rows: [
        { label: L.who, value: r("dorosłe żaby, ropuchy, traszki", "взрослые лягушки, жабы, тритоны") },
        { label: L.where, value: r("ląd i woda", "суша и вода") },
        { label: L.build, value: r("dwa cienkościenne worki o słabo pofałdowanej ścianie — mała powierzchnia wymiany", "два тонкостенных мешка со слабо складчатой стенкой — малая поверхность газообмена") },
        { label: L.blood, value: r("krew; znaczną część gazów wymienia też wilgotna skóra (oddychanie skórne)", "кровь; значительную часть газов обменивает также влажная кожа (кожное дыхание)") },
        { label: L.vent, value: r("płazy nie wentylują płuc ruchami żeber — powietrze jest wtłaczane do płuc ruchami dna jamy gębowej", "земноводные не вентилируют лёгкие движениями рёбер — воздух нагнетается в лёгкие движениями дна ротовой полости") },
      ],
      text: r("Zimujące na dnie zbiorników żaby oddychają wyłącznie przez skórę.", "Зимующие на дне водоёмов лягушки дышат только через кожу."),
    },
    {
      id: "mammal",
      icon: "🐕",
      name: r("Płuca ssaków", "Лёгкие млекопитающих"),
      art: (
        <Art label={lang === "pl" ? "Pęcherzykowe płuca ssaka" : "Альвеолярные лёгкие млекопитающего"}>
          <path d="M100 10 L 100 40 M100 40 L 60 70 M100 40 L 140 70 M60 70 L 40 96 M60 70 L 70 100 M140 70 L 130 100 M140 70 L 160 96" stroke="#94a3b8" strokeWidth={4} fill="none" strokeLinecap="round" />
          {[
            [40, 104],
            [70, 108],
            [130, 108],
            [160, 104],
          ].map(([x, y]) => (
            <g key={x} fill="#fecdd3" stroke="#be123c" strokeWidth={1.2}>
              {[
                [-7, 0],
                [7, 0],
                [0, 9],
                [-7, 15],
                [7, 15],
              ].map(([dx, dy], k) => (
                <circle key={k} cx={x + dx} cy={y + dy} r={6} />
              ))}
            </g>
          ))}
          <text x={100} y={74} textAnchor="middle" fontSize={10} fill="#64748b">
            {lang === "pl" ? "pęcherzyki" : "альвеолы"}
          </text>
        </Art>
      ),
      rows: [
        { label: L.who, value: r("ssaki, w tym człowiek; także wieloryby i delfiny", "млекопитающие, в том числе человек; также киты и дельфины") },
        { label: L.where, value: r("ląd; ssaki wodne wynurzają się po powietrze", "суша; водные млекопитающие всплывают за воздухом") },
        { label: L.build, value: r("płuca gąbczaste: drzewo oskrzelowe zakończone milionami pęcherzyków płucnych — dziesiątki metrów kwadratowych powierzchni", "губчатые лёгкие: бронхиальное дерево, оканчивающееся миллионами альвеол, — десятки квадратных метров поверхности") },
        { label: L.blood, value: r("krew; tlen wiąże hemoglobina w erytrocytach", "кровь; кислород связывает гемоглобин эритроцитов") },
        { label: L.vent, value: r("przepona i mięśnie międzyżebrowe zmieniają objętość klatki piersiowej; powietrze wpływa i wypływa tą samą drogą", "диафрагма и межрёберные мышцы меняют объём грудной клетки; воздух входит и выходит одним путём") },
      ],
      text: r(
        "Ponieważ wdech i wydech biegną tą samą drogą, w płucach zawsze zostaje część zużytego powietrza (objętość zalegająca).",
        "Так как вдох и выдох идут одним путём, в лёгких всегда остаётся часть использованного воздуха (остаточный объём).",
      ),
    },
    {
      id: "bird",
      icon: "🐦",
      name: r("Płuca ptaków", "Лёгкие птиц"),
      art: (
        <Art label={lang === "pl" ? "Płuca i worki powietrzne ptaka" : "Лёгкие и воздушные мешки птицы"}>
          <ellipse cx={46} cy={92} rx={30} ry={24} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
          <ellipse cx={160} cy={90} rx={32} ry={30} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
          <rect x={70} y={40} width={64} height={36} rx={12} fill="#fecdd3" stroke="#be123c" strokeWidth={2} />
          {[48, 56, 64].map((y) => (
            <path key={y} d={`M76 ${y} L 128 ${y}`} stroke="#be123c" strokeWidth={1} />
          ))}
          <path d="M20 14 C 50 30, 66 50, 80 70" stroke="#94a3b8" strokeWidth={6} fill="none" strokeLinecap="round" />
          <text x={46} y={128} textAnchor="middle" fontSize={9} fill="#0369a1">
            {lang === "pl" ? "worki przednie" : "передние мешки"}
          </text>
          <text x={160} y={132} textAnchor="middle" fontSize={9} fill="#0369a1">
            {lang === "pl" ? "worki tylne" : "задние мешки"}
          </text>
          <text x={102} y={30} textAnchor="middle" fontSize={9} fill="#9f1239">
            {lang === "pl" ? "płuca" : "лёгкие"}
          </text>
        </Art>
      ),
      rows: [
        { label: L.who, value: r("ptaki", "птицы") },
        { label: L.where, value: r("ląd i powietrze — lot wymaga dużo tlenu", "суша и воздух — полёт требует много кислорода") },
        { label: L.build, value: r("małe, sztywne płuca zbudowane z cienkich kanalików oraz połączone z nimi worki powietrzne, wnikające nawet do kości", "небольшие жёсткие лёгкие из тонких трубочек и связанные с ними воздушные мешки, проникающие даже в кости") },
        { label: L.blood, value: r("krew; wymiana bardzo wydajna", "кровь; обмен очень эффективный") },
        { label: L.vent, value: r("ruchy mostka i żeber zmieniają objętość worków, a nie płuc; powietrze płynie przez płuca w jednym kierunku", "движения грудины и рёбер меняют объём мешков, а не лёгких; воздух проходит через лёгкие в одном направлении") },
      ],
      text: r(
        "Wymiana gazowa zachodzi podczas wdechu i podczas wydechu (podwójne oddychanie), dlatego ptaki mogą latać wysoko, gdzie powietrze jest rozrzedzone. Same worki powietrzne nie uczestniczą w wymianie gazowej.",
        "Газообмен идёт и при вдохе, и при выдохе (двойное дыхание), поэтому птицы могут летать высоко, где воздух разрежен. Сами воздушные мешки в газообмене не участвуют.",
      ),
    },
  ];
}

// ---------- countercurrent ----------

/** exchange strength along the lamella; with equal flows the countercurrent keeps a constant gap */
const K = 6;
const GAP = 100 / (1 + K);

/** O₂ in water and in blood at position x (0 = where water enters), in % of the incoming water */
function o2At(counter: boolean, x: number): { w: number; b: number } {
  if (counter) {
    const w = 100 - (100 - GAP) * x;
    return { w, b: w - GAP };
  }
  const e = Math.exp(-2 * K * x);
  return { w: 50 + 50 * e, b: 50 - 50 * e };
}

const CC = {
  counter: r("Przeciwprąd (jak u ryby)", "Противоток (как у рыбы)"),
  co: r("Współprąd", "Прямоток"),
  probe: r("Położenie sondy wzdłuż blaszki", "Положение зонда вдоль пластинки"),
  water: r("woda", "вода"),
  blood: r("krew", "кровь"),
  here: r("W tym miejscu", "В этой точке"),
  diff: r("różnica", "разница"),
  flows: r("tlen dyfunduje z wody do krwi.", "кислород диффундирует из воды в кровь."),
  stops: r("różnica prawie zniknęła — dyfuzja ustaje.", "разница почти исчезла — диффузия прекращается."),
  out: r("Krew opuszczająca blaszkę niesie", "Кровь, покидающая пластинку, несёт"),
  ofMax: r("tlenu, który mogłaby pobrać z wody.", "кислорода, который могла бы взять из воды."),
  unit: r("O₂ w % wartości w wodzie wpływającej", "O₂ в % от значения во входящей воде"),
};

const bloodColor = (v: number) => `hsl(${220 + 1.4 * v} 75% 55%)`;
const waterColor = (v: number) => `hsl(199 85% ${92 - 0.42 * v}%)`;

function Countercurrent({ lang }: { lang: BioLang }) {
  const [counter, setCounter] = useState(true);
  const [pos, setPos] = useState(50);
  const N = 14;
  const x0 = 30;
  const len = 260;
  const p = o2At(counter, pos / 100);
  const bOut = counter ? o2At(true, 0).b : o2At(false, 1).b;
  const d = p.w - p.b;
  const px = x0 + (len * pos) / 100;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {[true, false].map((v) => (
          <Choice key={String(v)} state={counter === v ? "active" : "idle"} onClick={() => setCounter(v)}>
            {v ? CC.counter[lang] : CC.co[lang]}
          </Choice>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 320 150" className="w-full" role="img" aria-label={`${counter ? CC.counter[lang] : CC.co[lang]}: ${Math.round(bOut)}%`}>
            <rect width={320} height={150} rx={10} fill="#f8fafc" />
            {Array.from({ length: N }, (_, k) => {
              const xm = (k + 0.5) / N;
              const v = o2At(counter, xm);
              return (
                <g key={k}>
                  <rect x={x0 + (len * k) / N} y={30} width={len / N + 0.5} height={30} fill={waterColor(v.w)} />
                  <rect x={x0 + (len * k) / N} y={72} width={len / N + 0.5} height={30} fill={bloodColor(v.b)} style={{ transition: "fill .4s" }} />
                </g>
              );
            })}
            <rect x={x0} y={60} width={len} height={12} fill="#e2e8f0" />
            <rect x={x0} y={30} width={len} height={72} fill="none" stroke="#64748b" strokeWidth={1.5} />
            <text x={x0} y={22} fontSize={11} fontWeight={600} fill="#0369a1">
              {CC.water[lang]} →
            </text>
            <text x={counter ? x0 + len : x0} y={120} textAnchor={counter ? "end" : "start"} fontSize={11} fontWeight={600} fill="#9f1239">
              {counter ? `← ${CC.blood[lang]}` : `${CC.blood[lang]} →`}
            </text>
            <text x={x0 - 4} y={50} textAnchor="end" fontSize={9} fill="#0f172a">
              100
            </text>
            <text x={x0 + len + 4} y={50} fontSize={9} fill="#0f172a">
              {Math.round(o2At(counter, 1).w)}
            </text>
            <text x={counter ? x0 + len + 4 : x0 - 4} y={92} textAnchor={counter ? "start" : "end"} fontSize={9} fill="#0f172a">
              0
            </text>
            <text x={counter ? x0 - 4 : x0 + len + 4} y={92} textAnchor={counter ? "end" : "start"} fontSize={9} fontWeight={700} fill="#9f1239">
              {Math.round(bOut)}
            </text>
            <path d={`M${px} 26 L ${px} 106`} stroke="#0f172a" strokeWidth={2} strokeDasharray="4 3" />
            <circle cx={px} cy={26} r={4} fill="#0f172a" />
            <text x={160} y={142} textAnchor="middle" fontSize={9} fill="#64748b">
              {CC.unit[lang]}
            </text>
          </svg>
          <label className="mt-2 block text-sm font-semibold text-slate-700">
            {CC.probe[lang]}
            <input
              type="range"
              min={0}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer accent-sky-600"
              aria-valuetext={`${pos}%`}
            />
          </label>
        </div>
        <div className="space-y-3" aria-live="polite">
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] ring-1 ring-slate-200">
            <p className="font-semibold text-slate-800">{CC.here[lang]}:</p>
            <p className="tabular-nums">
              {CC.water[lang]} {Math.round(p.w)} · {CC.blood[lang]} {Math.round(p.b)} · {CC.diff[lang]} {Math.round(d)}
            </p>
            <p className="mt-1 text-sm text-slate-600">{(d > 3 ? CC.flows : CC.stops)[lang]}</p>
          </div>
          <div className={`rounded-xl px-4 py-3 text-[15px] ring-1 ${counter ? "bg-emerald-50 text-emerald-950 ring-emerald-200" : "bg-rose-50 text-rose-950 ring-rose-200"}`}>
            {CC.out[lang]} <b className="tabular-nums">≈ {num(bOut, 0)}%</b> {CC.ofMax[lang]}
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {counter
              ? lang === "pl"
                ? "Krew na każdym odcinku spotyka wodę bogatszą w tlen niż ona sama, więc dyfuzja trwa na całej długości blaszki."
                : "На каждом участке кровь встречает воду, более богатую кислородом, чем она сама, поэтому диффузия идёт по всей длине пластинки."
              : lang === "pl"
                ? "Woda i krew szybko wyrównują stężenia; dalej tlen już nie przechodzi, bo nie ma różnicy stężeń."
                : "Вода и кровь быстро выравнивают концентрации; дальше кислород уже не переходит — нет разницы концентраций."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- bird air sacs ----------

interface BirdStep {
  name: Txt;
  text: Txt;
  /** inhale (sacs expand), exhale, or neither for the start */
  phase: "in" | "out" | null;
  at: [number, number];
}

const BIRD: BirdStep[] = [
  {
    name: r("Start", "Начало"),
    text: r(
      "Porcja świeżego powietrza czeka przed dziobem. Ptak nie ma przepony — objętość worków powietrznych zmieniają ruchy mostka i żeber.",
      "Порция свежего воздуха ждёт перед клювом. У птицы нет диафрагмы — объём воздушных мешков меняют движения грудины и рёбер.",
    ),
    phase: null,
    at: [16, 14],
  },
  {
    name: r("1. wdech", "1-й вдох"),
    text: r("Worki powietrzne rozszerzają się. Świeże powietrze płynie tchawicą i oskrzelem głównym do tylnych worków powietrznych.", "Воздушные мешки расширяются. Свежий воздух идёт по трахее и главному бронху в задние воздушные мешки."),
    phase: "in",
    at: [268, 122],
  },
  {
    name: r("1. wydech", "1-й выдох"),
    text: r("Worki są ściskane. Powietrze z tylnych worków przepływa przez płuca — tu zachodzi wymiana gazowa.", "Мешки сжимаются. Воздух из задних мешков проходит через лёгкие — здесь идёт газообмен."),
    phase: "out",
    at: [168, 70],
  },
  {
    name: r("2. wdech", "2-й вдох"),
    text: r(
      "Nasza porcja, już uboga w tlen, przechodzi z płuc do przednich worków. W tym samym czasie do tylnych worków wpływa nowa porcja świeżego powietrza.",
      "Наша порция, уже бедная кислородом, переходит из лёгких в передние мешки. В это же время в задние мешки поступает новая порция свежего воздуха.",
    ),
    phase: "in",
    at: [64, 146],
  },
  {
    name: r("2. wydech", "2-й выдох"),
    text: r(
      "Przednie worki wypychają zużyte powietrze tchawicą na zewnątrz, a tylne tłoczą świeże powietrze przez płuca. Przez płuca płynie więc powietrze bogate w tlen przy każdym wdechu i wydechu, zawsze w tym samym kierunku.",
      "Передние мешки выталкивают использованный воздух через трахею наружу, а задние прогоняют свежий воздух через лёгкие. Значит, через лёгкие воздух, богатый кислородом, идёт при каждом вдохе и выдохе, всегда в одном направлении.",
    ),
    phase: "out",
    at: [16, 14],
  },
];

const FRESH = "#0284c7";
const USED = "#78716c";

function BirdLungs({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(false);
  const step = BIRD[i]!;
  useEffect(() => {
    if (!play) return;
    const id = window.setTimeout(() => setI((i + 1) % BIRD.length), 2600);
    return () => window.clearTimeout(id);
  }, [play, i]);
  const s = step.phase === "in" ? 1.15 : step.phase === "out" ? 0.82 : 1;
  const flows: { d: string; c: string }[] =
    step.phase === "in"
      ? [
          { d: "M22 22 C 46 44, 66 76, 92 96 C 140 120, 196 126, 236 122", c: FRESH },
          { d: "M124 76 C 104 92, 88 110, 76 126", c: USED },
        ]
      : step.phase === "out"
        ? [
            { d: "M244 104 C 236 92, 226 82, 214 74", c: FRESH },
            { d: "M80 128 C 86 116, 90 106, 88 98 C 66 76, 44 48, 18 18", c: USED },
          ]
        : [];
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 320 190" className="w-full" role="img" aria-label={step.name[lang]}>
          <defs>
            <marker id="bra-arrow-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill={FRESH} />
            </marker>
            <marker id="bra-arrow-u" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill={USED} />
            </marker>
          </defs>
          <rect width={320} height={190} rx={12} fill="#f8fafc" />
          <g style={{ transformBox: "fill-box", transformOrigin: "center", transform: `scale(${s})`, transition: "transform .7s" }}>
            <ellipse cx={268} cy={124} rx={38} ry={34} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
          </g>
          <g style={{ transformBox: "fill-box", transformOrigin: "center", transform: `scale(${s})`, transition: "transform .7s" }}>
            <ellipse cx={66} cy={148} rx={32} ry={26} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
          </g>
          <path d="M14 12 C 40 36, 62 72, 92 96" stroke="#94a3b8" strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M92 96 C 140 120, 196 126, 236 122" stroke="#cbd5e1" strokeWidth={6} fill="none" />
          <path d="M248 106 C 236 92, 226 82, 214 74" stroke="#cbd5e1" strokeWidth={6} fill="none" />
          <path d="M124 74 C 104 92, 88 110, 76 126" stroke="#cbd5e1" strokeWidth={6} fill="none" />
          <path d="M80 126 L 90 100" stroke="#cbd5e1" strokeWidth={6} fill="none" />
          <rect x={120} y={46} width={96} height={46} rx={14} fill="#fecdd3" stroke="#be123c" strokeWidth={2} />
          {[56, 66, 76, 84].map((y) => (
            <path key={y} d={`M128 ${y} L 208 ${y}`} stroke="#be123c" strokeWidth={1} opacity={0.6} />
          ))}
          {flows.map((f) => (
            <path key={f.d} d={f.d} stroke={f.c} strokeWidth={3} fill="none" strokeDasharray="6 4" markerEnd={`url(#${f.c === FRESH ? "bra-arrow-f" : "bra-arrow-u"})`}>
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite" />
            </path>
          ))}
          <g style={{ transform: `translate(${step.at[0]}px, ${step.at[1]}px)`, transition: "transform .9s ease-in-out" }}>
            {[
              [-5, -3],
              [5, -3],
              [0, 5],
            ].map(([dx, dy], k) => (
              <circle key={k} cx={dx} cy={dy} r={4.2} fill="#facc15" stroke="#a16207" strokeWidth={1.2} />
            ))}
          </g>
          <text x={168} y={40} textAnchor="middle" fontSize={10} fontWeight={600} fill="#9f1239">
            {lang === "pl" ? "płuca" : "лёгкие"}
          </text>
          <text x={268} y={176} textAnchor="middle" fontSize={10} fill="#0369a1">
            {lang === "pl" ? "worki tylne" : "задние мешки"}
          </text>
          <text x={66} y={186} textAnchor="middle" fontSize={10} fill="#0369a1">
            {lang === "pl" ? "worki przednie" : "передние мешки"}
          </text>
          <text x={40} y={70} fontSize={10} fill="#475569">
            {lang === "pl" ? "tchawica" : "трахея"}
          </text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-2">
          {BIRD.map((b, k) => (
            <Choice key={b.name.pl} state={k === i ? "active" : "idle"} onClick={() => setI(k)}>
              {b.name[lang]}
            </Choice>
          ))}
          <Choice onClick={() => setPlay(!play)}>{play ? (lang === "pl" ? "⏸ Pauza" : "⏸ Пауза") : lang === "pl" ? "▶ Odtwarzaj" : "▶ Запустить"}</Choice>
        </div>
      </div>
      <div className="space-y-3" aria-live="polite">
        <h3 className="text-base font-semibold text-slate-900">
          {step.name[lang]}
          {step.phase && <span className="ml-2 text-sm font-normal text-slate-500">({step.phase === "in" ? (lang === "pl" ? "worki się rozszerzają" : "мешки расширяются") : lang === "pl" ? "worki się kurczą" : "мешки сжимаются"})</span>}
        </h3>
        <p className="text-[15px] leading-relaxed text-slate-700">{step.text[lang]}</p>
        <p className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span>
            <span className="font-bold text-sky-700">- - →</span> {lang === "pl" ? "powietrze świeże" : "свежий воздух"}
          </span>
          <span>
            <span className="font-bold text-stone-500">- - →</span> {lang === "pl" ? "powietrze zużyte" : "использованный воздух"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ---------- quiz ----------

const ORGANS: QuizOption[] = [
  { id: "skin", label: r("powierzchnia ciała", "поверхность тела") },
  { id: "gills", label: r("skrzela", "жабры") },
  { id: "tracheae", label: r("tchawki", "трахеи") },
  { id: "book", label: r("płucotchawki", "лёгочные мешки") },
  { id: "lungs", label: r("płuca", "лёгкие") },
];

const ANIMALS: QuizItem[] = [
  { icon: "🐟", name: r("karp", "карп"), answer: "gills", explain: r("Ryby kostnoszkieletowe oddychają skrzelami ukrytymi pod pokrywami skrzelowymi.", "Костные рыбы дышат жабрами, скрытыми под жаберными крышками.") },
  { icon: "🐝", name: r("pszczoła miodna", "медоносная пчела"), answer: "tracheae", explain: r("Owady mają tchawki; powietrze wnika do nich przez przetchlinki.", "У насекомых трахеи; воздух попадает в них через дыхальца.") },
  { icon: "🕷️", name: r("pająk krzyżak", "паук-крестовик"), answer: "book", explain: r("Pająki oddychają płucotchawkami (wiele z nich ma też tchawki).", "Пауки дышат лёгочными мешками (у многих есть ещё и трахеи).") },
  { icon: "🪱", name: r("dżdżownica", "дождевой червь"), answer: "skin", explain: r("Gazy przenikają przez wilgotną skórę, pod którą leży gęsta sieć naczyń włosowatych.", "Газы проходят через влажную кожу, под которой лежит густая сеть капилляров.") },
  { name: r("kijanka żaby", "головастик лягушки"), answer: "gills", explain: r("Larwy płazów żyją w wodzie i oddychają skrzelami; płuca rozwijają się w czasie przeobrażenia.", "Личинки земноводных живут в воде и дышат жабрами; лёгкие развиваются при превращении.") },
  { icon: "🐬", name: r("delfin", "дельфин"), answer: "lungs", explain: r("Delfin to ssak — mimo życia w wodzie oddycha płucami i musi wynurzać się po powietrze.", "Дельфин — млекопитающее: хотя он живёт в воде, он дышит лёгкими и всплывает за воздухом.") },
  { icon: "🕊️", name: r("gołąb", "голубь"), answer: "lungs", explain: r("Ptaki mają płuca połączone z workami powietrznymi.", "У птиц лёгкие, соединённые с воздушными мешками.") },
  { icon: "🦞", name: r("rak rzeczny", "речной рак"), answer: "gills", explain: r("Skorupiaki wodne oddychają skrzelami.", "Водные ракообразные дышат жабрами.") },
  { name: r("stułbia", "гидра"), answer: "skin", explain: r("Parzydełkowce nie mają narządów oddechowych — gazy dyfundują przez powierzchnię ciała.", "У кишечнополостных нет органов дыхания — газы диффундируют через поверхность тела.") },
  { icon: "🐸", name: r("dorosła żaba", "взрослая лягушка"), answer: "lungs", explain: r("Dorosła żaba ma płuca workowate, ale znaczną część gazów wymienia też przez skórę.", "У взрослой лягушки мешковидные лёгкие, но значительную часть газов она обменивает и через кожу.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Powierzchnia wymiany gazowej jest zawsze duża, cienka i wilgotna, a zwykle też silnie ukrwiona.", ru: "Поверхность газообмена всегда большая, тонкая и влажная, а обычно ещё и обильно снабжена кровью." },
    { pl: "Tchawki owadów doprowadzają powietrze wprost do komórek — hemolimfa prawie nie bierze udziału w transporcie tlenu.", ru: "Трахеи насекомых подводят воздух прямо к клеткам — гемолимфа почти не участвует в переносе кислорода." },
  ],
  s2: [
    { pl: "W przeciwprądzie różnica stężeń tlenu między wodą a krwią utrzymuje się na całej długości blaszki, więc krew pobiera większość tlenu z wody.", ru: "При противотоке разница концентраций кислорода между водой и кровью сохраняется по всей длине пластинки, поэтому кровь забирает большую часть кислорода из воды." },
    { pl: "Przy współprądzie stężenia szybko się wyrównują i dyfuzja ustaje.", ru: "При прямотоке концентрации быстро выравниваются, и диффузия прекращается." },
  ],
  s3: [
    { pl: "Worki powietrzne działają jak miechy; same nie uczestniczą w wymianie gazowej.", ru: "Воздушные мешки работают как меха; сами в газообмене не участвуют." },
    { pl: "Podwójne oddychanie: przez płuca ptaka płynie świeże powietrze podczas wdechu i wydechu, zawsze w jednym kierunku.", ru: "Двойное дыхание: через лёгкие птицы свежий воздух идёт и при вдохе, и при выдохе, всегда в одном направлении." },
  ],
  s4: [{ pl: "O rodzaju narządu oddechowego decyduje środowisko i tryb życia, nie tylko pokrewieństwo: delfin oddycha płucami, a kijanka — skrzelami.", ru: "Тип органа дыхания определяют среда и образ жизни, а не только родство: дельфин дышит лёгкими, а головастик — жабрами." }],
};

export default function BreathingAnimalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="bra" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="bra-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={organs(lang)} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="bra-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Countercurrent lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="bra-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <BirdLungs lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="bra-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s4}
          question={r("Czym oddycha", "Чем дышит")}
          options={ORGANS}
          items={ANIMALS}
          wrongHint={r("Pomyśl, czy to zwierzę żyje w wodzie, czy na lądzie, i do jakiej grupy należy.", "Подумай, живёт ли это животное в воде или на суше и к какой группе оно относится.")}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
