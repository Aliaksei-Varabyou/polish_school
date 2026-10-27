// Block 1 of the cnidarians lesson: a hydra with a bud. The gut cavity shows through when chosen.
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "@portal/lessons";

type HydraPart = "tentacles" | "stingers" | "mouth" | "cavity" | "foot" | "bud";

const PARTS: Record<HydraPart, MapPart> = {
  tentacles: {
    name: { pl: "Czułki", ru: "Щупальца" },
    text: {
      pl: "Ruchliwe wyrostki wokół otworu gębowego. Stułbia rozpościera je w wodzie, chwyta nimi drobne zwierzęta, np. rozwielitki, i wpycha do otworu gębowego.",
      ru: "Подвижные выросты вокруг рта. Гидра раскидывает их в воде, ловит ими мелких животных, например дафний, и проталкивает в рот.",
    },
    pin: [30, 40],
    to: [56, 72],
  },
  stingers: {
    name: { pl: "Komórki parzydełkowe", ru: "Стрекательные клетки" },
    text: {
      pl: "Na czułkach siedzą „baterie” komórek parzydełkowych. Po dotknięciu wystrzeliwują nić z jadem, która paraliżuje ofiarę albo odstrasza napastnika. Stąd nazwa: parzydełkowce.",
      ru: "На щупальцах сидят «батареи» стрекательных клеток. При касании они выстреливают нить с ядом, которая парализует добычу или отпугивает врага. Отсюда и название — стрекающие.",
    },
    pin: [270, 30],
    to: [236, 46],
  },
  mouth: {
    name: { pl: "Otwór gębowy", ru: "Ротовое отверстие" },
    text: {
      pl: "Jedyny otwór w ciele. Przez niego pokarm wpada do środka, a niestrawione resztki są usuwane na zewnątrz — tą samą drogą.",
      ru: "Единственное отверстие в теле. Через него пища попадает внутрь, и через него же наружу выбрасываются непереваренные остатки.",
    },
    pin: [96, 150],
    to: [140, 112],
  },
  cavity: {
    name: { pl: "Jama chłonąco-trawiąca", ru: "Кишечная полость" },
    text: {
      pl: "Wnętrze ciała to jedna jama, w której pokarm jest trawiony, a składniki odżywcze wchłaniane. Ściany ciała tworzą tylko dwie warstwy komórek — to najprostsze zwierzęta tkankowe.",
      ru: "Внутри тела — одна полость, где пища переваривается, а питательные вещества всасываются. Стенка тела состоит всего из двух слоёв клеток — это простейшие тканевые животные.",
    },
  },
  foot: {
    name: { pl: "Stopa", ru: "Подошва" },
    text: {
      pl: "Dolny koniec ciała, którym stułbia przyczepia się do roślin wodnych lub kamieni. To osiadła postać — polip. Potrafi jednak powoli „przespacerować się” w inne miejsce.",
      ru: "Нижний конец тела, которым гидра прикрепляется к водным растениям или камням. Это прикреплённая форма — полип. Но она умеет медленно «перешагнуть» на другое место.",
    },
    pin: [96, 274],
    to: [136, 272],
  },
  bud: {
    name: { pl: "Pączek", ru: "Почка" },
    text: {
      pl: "Z boku ciała wyrasta nowa, mała stułbia. Gdy podrośnie, odrywa się i żyje samodzielnie. To pączkowanie — rozmnażanie bezpłciowe.",
      ru: "Сбоку на теле вырастает новая маленькая гидра. Подрастая, она отрывается и живёт самостоятельно. Это почкование — бесполое размножение.",
    },
    pin: [262, 206],
    to: [212, 180],
  },
};

const TENTACLES = [
  "M136 112 C 100 102, 70 82, 40 72",
  "M140 106 C 116 78, 96 52, 84 22",
  "M147 102 C 140 72, 136 42, 138 10",
  "M153 102 C 160 72, 164 42, 162 10",
  "M160 106 C 184 78, 204 52, 216 22",
  "M164 112 C 200 102, 230 82, 260 72",
];

/** points along a cubic path given as "Mx y C x y, x y, x y" */
function along(d: string, ts: number[]): [number, number][] {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const [x0, y0, x1, y1, x2, y2, x3, y3] = n as [number, number, number, number, number, number, number, number];
  return ts.map((t) => {
    const u = 1 - t;
    return [u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3];
  });
}

const GREEN = "#a3e635";
const DARK = "#4d7c0f";

export function HydraMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<HydraPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 300 290"
      title={{ pl: "Budowa stułbi", ru: "Строение гидры" }}
      labelOrder={["tentacles", "stingers", "mouth", "foot", "bud"]}
      maxWidth="max-w-[340px]"
      art={({ part, tone }) => (
        <>
          {part(
            "bud",
            <g>
              <path d="M166 192 C 186 186, 198 176, 206 164 L 216 172 C 206 188, 190 200, 168 206 Z" fill={tone("bud", GREEN)} stroke={DARK} strokeWidth={1.5} />
              <path d="M210 166 L 214 148 M212 168 L 226 156 M214 172 L 230 172" stroke={tone("bud", GREEN)} strokeWidth={3} strokeLinecap="round" />
            </g>,
          )}
          {part(
            "tentacles",
            <g fill="none" strokeLinecap="round">
              {TENTACLES.map((d) => (
                <g key={d}>
                  <path d={d} stroke={tone("tentacles", GREEN)} strokeWidth={6} />
                  <path d={d} stroke="transparent" strokeWidth={16} />
                </g>
              ))}
            </g>,
          )}
          {part(
            "stingers",
            <g>
              {TENTACLES.flatMap((d) =>
                along(d, [0.35, 0.55, 0.75, 0.92]).map(([x, y]) => (
                  <g key={`${d}${x}`}>
                    <circle cx={x} cy={y} r={8} fill="transparent" />
                    <circle cx={x} cy={y} r={3.6} fill={tone("stingers", "#facc15")} stroke="#a16207" strokeWidth={1} />
                  </g>
                )),
              )}
            </g>,
          )}
          {part(
            "cavity",
            <path d="M132 112 C 128 160, 132 230, 138 268 L 162 268 C 168 230, 172 160, 168 112 Z" fill={tone("cavity", GREEN)} stroke={DARK} strokeWidth={2} />,
          )}
          {part("foot", <ellipse cx={150} cy={270} rx={19} ry={7} fill={tone("foot", "#65a30d")} stroke={DARK} strokeWidth={1.5} />)}
          {part(
            "mouth",
            <g>
              <ellipse cx={150} cy={110} rx={19} ry={9} fill={tone("mouth", "#bef264")} stroke={DARK} strokeWidth={1.5} />
              <ellipse cx={150} cy={106} rx={5} ry={2.5} fill="#365314" />
            </g>,
          )}
        </>
      )}
      overlay={(active) =>
        active === "cavity" && (
          <g pointerEvents="none">
            <path d="M144 112 C 141 160, 143 220, 147 258 L 153 258 C 157 220, 159 160, 156 112 Z" fill="#fef9c3" stroke="#ca8a04" strokeWidth={1.5} />
            <path d="M190 200 L 168 206" stroke="#ca8a04" strokeWidth={1.5} />
            <path d="M150 104 L 150 80 M144 88 L 150 78 L 156 88" fill="none" stroke="#ea580c" strokeWidth={2} />
            <path d="M162 92 L 162 118 M156 110 L 162 120 L 168 110" fill="none" stroke="#16a34a" strokeWidth={2} />
          </g>
        )
      }
    />
  );
}
