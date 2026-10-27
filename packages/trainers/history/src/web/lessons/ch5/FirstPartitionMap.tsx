// Block 4 of the last-king lesson: the first partition (1772) on a schematic map. Each of the three
// seized pieces, the remaining Commonwealth, Gdańsk and Ducal Prussia explain themselves when tapped.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";
import { CITIES, CITY_RU, DUCAL_PRUSSIA, FILL, OUTLINE, PIECES, VIEW } from "./partitionShapes.ts";

type Part = "prusy" | "austria" | "rosja" | "reszta" | "gdansk" | "ksiazece";

const PARTS: Record<Part, MapPart> = {
  prusy: {
    name: { pl: "Prusy 1772", ru: "Пруссия 1772" },
    text: {
      pl: "Fryderyk II zabrał Pomorze Gdańskie (bez Gdańska), Warmię i pas ziem nad Notecią. Najmniejszy, ale najbogatszy kawałek: połączył Prusy Książęce z resztą państwa pruskiego i odciął Polskę od morza.",
      ru: "Фридрих II забрал Гданьское Поморье (без Гданьска), Вармию и полосу земель над Нотецью. Самый маленький, но самый богатый кусок: он соединил Герцогскую Пруссию с остальной Пруссией и отрезал Польшу от моря.",
    },
    pin: [138, 84],
  },
  austria: {
    name: { pl: "Austria 1772", ru: "Австрия 1772" },
    text: {
      pl: "Maria Teresa zajęła ziemie na południe od Wisły ze Lwowem — od okolic Krakowa po rzekę Zbrucz. Austriacy nazwali je Galicją. Sam Kraków został jeszcze w Rzeczypospolitej.",
      ru: "Мария Терезия заняла земли к югу от Вислы со Львовом — от окрестностей Кракова до реки Збруч. Австрийцы назвали их Галицией. Сам Краков пока остался в Речи Посполитой.",
    },
    pin: [195, 262],
  },
  rosja: {
    name: { pl: "Rosja 1772", ru: "Россия 1772" },
    text: {
      pl: "Katarzyna II wzięła największy obszar: Inflanty Polskie i ziemie białoruskie za Dźwiną i Dnieprem (Połock, Witebsk, Mohylew). Dużo ziemi, ale słabo zaludnionej.",
      ru: "Екатерина II взяла самую большую территорию: Польскую Ливонию и белорусские земли за Двиной и Днепром (Полоцк, Витебск, Могилёв). Много земли, но малонаселённой.",
    },
    pin: [348, 112],
  },
  reszta: {
    name: { pl: "Rzeczpospolita po 1772", ru: "Речь Посполитая после 1772" },
    text: {
      pl: "Państwo straciło około 30% terytorium i 35% ludności, ale wciąż istniało — z Warszawą, Krakowem, Wilnem i Poznaniem. Sejm rozbiorowy 1773 roku musiał zatwierdzić straty; Rejtan protestował na próżno.",
      ru: "Государство потеряло около 30% территории и 35% населения, но продолжало существовать — с Варшавой, Краковом, Вильно и Познанью. Разделный сейм 1773 года был вынужден утвердить потери; Рейтан протестовал напрасно.",
    },
    pin: [215, 165],
  },
  gdansk: {
    name: { pl: "Gdańsk", ru: "Гданьск" },
    text: {
      pl: "Prusy otoczyły Gdańsk, ale miasta nie dostały — zabrały je dopiero w II rozbiorze (1793). Polski handel zbożem przez Gdańsk musiał odtąd płacić pruskie cła.",
      ru: "Пруссия окружила Гданьск, но города не получила — его забрали только во втором разделе (1793). Польская торговля зерном через Гданьск отныне платила прусские пошлины.",
    },
    pin: [96, 36],
    to: [130, 58],
  },
  ksiazece: {
    name: { pl: "Prusy Książęce", ru: "Герцогская Пруссия" },
    text: {
      pl: "Dawne lenno Polski, od 1657 roku niezależne, a od 1701 część Królestwa Prus. Oddzielone od Brandenburgii polskim Pomorzem — dlatego Fryderyk II tak bardzo chciał I rozbioru.",
      ru: "Бывший лен Польши, с 1657 года независимый, а с 1701 — часть Королевства Пруссия. Отделена от Бранденбурга польским Поморьем — поэтому Фридрих II так хотел первого раздела.",
    },
    pin: [205, 32],
    to: [200, 62],
  },
};

const REST = "#fef3c7";
const LINE = "#78350f";

export function FirstPartitionMap({ lang }: { lang: ContentLang }) {
  const first = PIECES.filter((p) => p.year === 1772);
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox={VIEW}
      maxWidth="max-w-[520px]"
      title={{ pl: "Mapa I rozbioru Polski", ru: "Карта первого раздела Польши" }}
      labelOrder={["prusy", "austria", "rosja", "reszta", "gdansk"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={400} height={318} fill="#e0f2fe" />
          {/* neighbours, drawn flat */}
          <path d={DUCAL_PRUSSIA} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
          {part("ksiazece", <path d={DUCAL_PRUSSIA} fill={tone("ksiazece", "#cbd5e1")} stroke="#64748b" strokeWidth={1} />)}
          {/* the rest of the Commonwealth: the whole outline, the seized pieces are drawn over it */}
          {part("reszta", <path d={OUTLINE} fill={tone("reszta", REST)} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />)}
          {first.map((p) => {
            const id = p.taker as Part;
            return part(id, <path d={p.d} fill={tone(id, FILL[p.taker][1772])} stroke={LINE} strokeWidth={1.5} strokeLinejoin="round" />);
          })}
          <path d={OUTLINE} fill="none" stroke={LINE} strokeWidth={2} strokeLinejoin="round" pointerEvents="none" />
          {/* cities */}
          {CITIES.map((c) => {
            const isGdansk = c.name === "Gdańsk";
            const label = lang === "pl" ? c.name : CITY_RU[c.name];
            const dot = <circle cx={c.x} cy={c.y} r={isGdansk ? 5 : 3} fill={isGdansk ? tone("gdansk", "#fff") : "#1f2937"} stroke="#1f2937" strokeWidth={isGdansk ? 2 : 0} />;
            return (
              <g key={c.name} pointerEvents={isGdansk ? undefined : "none"}>
                {isGdansk ? part("gdansk", dot) : dot}
                <text x={c.side === "l" ? c.x - 6 : c.x + 6} y={c.y + 3.5} fontSize={9} fill="#1f2937" textAnchor={c.side === "l" ? "end" : "start"} fontWeight={600} pointerEvents="none">
                  {label}
                </text>
              </g>
            );
          })}
          {/* legend */}
          <g fontSize={9} fill="#1f2937">
            <rect x={8} y={298} width={12} height={10} fill={FILL.prusy[1772]} stroke={LINE} strokeWidth={0.8} />
            <text x={24} y={306.5}>{lang === "pl" ? "Prusy" : "Пруссия"}</text>
            <rect x={72} y={298} width={12} height={10} fill={FILL.rosja[1772]} stroke={LINE} strokeWidth={0.8} />
            <text x={88} y={306.5}>{lang === "pl" ? "Rosja" : "Россия"}</text>
            <rect x={132} y={298} width={12} height={10} fill={FILL.austria[1772]} stroke={LINE} strokeWidth={0.8} />
            <text x={148} y={306.5}>{lang === "pl" ? "Austria" : "Австрия"}</text>
            <rect x={200} y={298} width={12} height={10} fill={REST} stroke={LINE} strokeWidth={0.8} />
            <text x={216} y={306.5}>{lang === "pl" ? "Rzeczpospolita po 1772 r." : "Речь Посполитая после 1772 г."}</text>
          </g>
        </>
      )}
    />
  );
}
