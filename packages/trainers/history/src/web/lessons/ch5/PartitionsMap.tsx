// Block 3 of the collapse lesson and the key visual of the chapter: the three partitions on one
// schematic map. Colour = who took the piece, shade = which partition; every piece explains itself
// when tapped, and in "label it" mode the student has to say which piece went to whom and when.
import { PartMap, type ContentLang, type MapPart, type Txt } from "@portal/lessons";
import { CITIES, CITY_RU, DUCAL_PRUSSIA, FILL, OUTLINE, PIECES, TAKER_NAME, VIEW, type Taker, type Year } from "./partitionShapes.ts";

type Part = "p1772" | "a1772" | "r1772" | "p1793" | "r1793" | "p1795" | "r1795" | "a1795";

const ORDER: Part[] = ["p1772", "a1772", "r1772", "p1793", "r1793", "p1795", "r1795", "a1795"];

const name = (taker: Taker, year: Year): Txt => ({
  pl: `${TAKER_NAME[taker].pl} ${year}`,
  ru: `${TAKER_NAME[taker].ru} ${year}`,
});

const TEXT: Record<Part, Txt> = {
  p1772: {
    pl: "I rozbiór. Prusy wzięły Pomorze Gdańskie bez Gdańska, Warmię i ziemie nad Notecią — mały, ale bogaty obszar, który odciął Polskę od morza.",
    ru: "Первый раздел. Пруссия взяла Гданьское Поморье без Гданьска, Вармию и земли над Нотецью — небольшую, но богатую область, отрезавшую Польшу от моря.",
  },
  a1772: {
    pl: "I rozbiór. Austria zajęła ziemie na południe od Wisły ze Lwowem i nazwała je Galicją. Kraków został jeszcze w Polsce.",
    ru: "Первый раздел. Австрия заняла земли к югу от Вислы со Львовом и назвала их Галицией. Краков пока остался в Польше.",
  },
  r1772: {
    pl: "I rozbiór. Rosja wzięła Inflanty Polskie i białoruskie ziemie za Dźwiną i Dnieprem: Połock, Witebsk, Mohylew.",
    ru: "Первый раздел. Россия взяла Польскую Ливонию и белорусские земли за Двиной и Днепром: Полоцк, Витебск, Могилёв.",
  },
  p1793: {
    pl: "II rozbiór. Prusy zagarnęły Wielkopolskę z Poznaniem, Kujawy oraz Gdańsk i Toruń — najżyźniejsze i najlepiej zagospodarowane ziemie Korony.",
    ru: "Второй раздел. Пруссия захватила Великую Польшу с Познанью, Куявию, а также Гданьск и Торунь — самые плодородные и ухоженные земли Короны.",
  },
  r1793: {
    pl: "II rozbiór. Rosja zabrała Ukrainę naddnieprzańską, Podole i środkową Białoruś z Mińskiem — ponad 250 tysięcy km². Austria w tym rozbiorze nie uczestniczyła.",
    ru: "Второй раздел. Россия забрала Приднепровскую Украину, Подолье и центральную Белоруссию с Минском — более 250 тысяч км². Австрия в этом разделе не участвовала.",
  },
  p1795: {
    pl: "III rozbiór. Prusy dostały Mazowsze z Warszawą i Podlasie. Stolica Rzeczypospolitej stała się prowincjonalnym miastem pruskim.",
    ru: "Третий раздел. Пруссии достались Мазовия с Варшавой и Подляшье. Столица Речи Посполитой стала провинциальным прусским городом.",
  },
  r1795: {
    pl: "III rozbiór. Rosja wzięła resztę Litwy z Wilnem i Grodnem, Kurlandię i Wołyń. W Grodnie Stanisław August podpisał abdykację.",
    ru: "Третий раздел. Россия взяла остаток Литвы с Вильно и Гродно, Курляндию и Волынь. В Гродно Станислав Август подписал отречение.",
  },
  a1795: {
    pl: "III rozbiór. Austria zajęła Małopolskę z Krakowem i ziemie między Pilicą a Bugiem z Lublinem (tzw. Galicję Zachodnią).",
    ru: "Третий раздел. Австрия заняла Малую Польшу с Краковом и земли между Пилицей и Бугом с Люблином (так называемую Западную Галицию).",
  },
};

const PARTS = Object.fromEntries(
  PIECES.map((p) => [p.id, { name: name(p.taker, p.year), text: TEXT[p.id as Part], pin: p.at }]),
) as Record<Part, MapPart>;

const LINE = "#78350f";

export function PartitionsMap({ lang }: { lang: ContentLang }) {
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox={VIEW}
      maxWidth="max-w-[560px]"
      title={{ pl: "Mapa trzech rozbiorów Polski", ru: "Карта трёх разделов Польши" }}
      labelOrder={ORDER}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={400} height={318} fill="#e0f2fe" />
          <path d={DUCAL_PRUSSIA} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
          <path d={OUTLINE} fill="#f1f5f9" stroke="none" />
          {PIECES.map((p) => {
            const id = p.id as Part;
            return part(id, <path d={p.d} fill={tone(id, FILL[p.taker][p.year])} stroke={LINE} strokeWidth={1} strokeLinejoin="round" />);
          })}
          <path d={OUTLINE} fill="none" stroke={LINE} strokeWidth={2.2} strokeLinejoin="round" pointerEvents="none" />
          {CITIES.map((c) => (
            <g key={c.name} pointerEvents="none">
              <circle cx={c.x} cy={c.y} r={3} fill="#1f2937" stroke="#fff" strokeWidth={1} />
              <text x={c.side === "l" ? c.x - 6 : c.x + 6} y={c.y + 3.5} fontSize={8.5} fill="#1f2937" textAnchor={c.side === "l" ? "end" : "start"} fontWeight={600} stroke="#f8fafc" strokeWidth={2.5} paintOrder="stroke">
                {lang === "pl" ? c.name : CITY_RU[c.name]}
              </text>
            </g>
          ))}
          {/* legend: one row per taker, three shades */}
          <g fontSize={9} fill="#1f2937">
            {(["prusy", "rosja", "austria"] as Taker[]).map((t, row) => (
              <g key={t} transform={`translate(${8 + row * 132} 298)`}>
                <text x={0} y={8.5} fontWeight={600}>
                  {TAKER_NAME[t][lang]}
                </text>
                {([1772, 1793, 1795] as Year[]).map((y, i) => (
                  <g key={y} transform={`translate(${52 + i * 26} 0)`}>
                    <rect x={0} y={0} width={12} height={10} fill={FILL[t][y]} stroke={LINE} strokeWidth={0.6} />
                    <text x={0} y={18} fontSize={6.5}>
                      {y}
                    </text>
                  </g>
                ))}
              </g>
            ))}
          </g>
        </>
      )}
    />
  );
}
