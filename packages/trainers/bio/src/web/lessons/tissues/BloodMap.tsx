// Block 3: a drop of blood under the microscope — plasma and the three kinds of blood cells.
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "../games.tsx";

type BloodPart = "plasma" | "red" | "white" | "platelets";

const PARTS: Record<BloodPart, MapPart> = {
  plasma: {
    name: { pl: "Osocze", ru: "Плазма" },
    text: {
      pl: "Płynna, żółtawa część krwi — głównie woda. Są w niej rozpuszczone substancje odżywcze, sole i zbędne produkty przemiany materii; niesie też komórki krwi.",
      ru: "Жидкая желтоватая часть крови — в основном вода. В ней растворены питательные вещества, соли и продукты обмена; она же несёт клетки крови.",
    },
    pin: [272, 22],
    to: [250, 50],
  },
  red: {
    name: { pl: "Czerwone krwinki", ru: "Эритроциты" },
    text: {
      pl: "Najliczniejsze komórki krwi, w kształcie dwuwklęsłych krążków. Zawierają czerwony barwnik — hemoglobinę, która wiąże tlen. Rozwożą tlen po całym ciele.",
      ru: "Самые многочисленные клетки крови, в форме двояковогнутых дисков. Содержат красный пигмент гемоглобин, который связывает кислород. Разносят кислород по всему телу.",
    },
    pin: [28, 24],
    to: [56, 52],
  },
  white: {
    name: { pl: "Białe krwinki", ru: "Лейкоциты" },
    text: {
      pl: "Większe od czerwonych, mają jądro. Bronią organizm przed bakteriami i wirusami — niektóre je pochłaniają, inne wytwarzają przeciwciała.",
      ru: "Крупнее эритроцитов, у них есть ядро. Защищают организм от бактерий и вирусов — одни их поглощают, другие вырабатывают антитела.",
    },
    pin: [196, 182],
    to: [186, 140],
  },
  platelets: {
    name: { pl: "Płytki krwi", ru: "Тромбоциты" },
    text: {
      pl: "Drobne fragmenty komórek. Gdy skaleczysz się, sklejają się w miejscu rany i pomagają krwi krzepnąć — tworzy się strup.",
      ru: "Мелкие фрагменты клеток. Когда ты поранишься, они склеиваются в месте раны и помогают крови свернуться — образуется корочка.",
    },
    pin: [96, 184],
    to: [104, 152],
  },
};

const RED: [number, number][] = [
  [56, 52], [100, 34], [150, 46], [210, 30], [36, 104], [86, 92], [132, 104], [246, 88], [60, 150], [150, 160], [236, 150], [280, 120],
];
const PLATELETS: [number, number][] = [
  [104, 150], [176, 76], [30, 64], [272, 64], [206, 112],
];

export function BloodMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<BloodPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 300 200"
      title={{ pl: "Krew pod mikroskopem", ru: "Кровь под микроскопом" }}
      labelOrder={["plasma", "red", "white", "platelets"]}
      pinRadius={14}
      art={({ part, tone }) => (
        <>
          {part("plasma", <rect x={4} y={4} width={292} height={192} rx={16} fill={tone("plasma", "#fef3c7")} stroke="#fcd34d" strokeWidth={2} />)}
          {part(
            "red",
            <g>
              {RED.map(([x, y]) => (
                <g key={`${x}-${y}`}>
                  <circle cx={x} cy={y} r={17} fill={tone("red", "#ef4444")} />
                  <circle cx={x} cy={y} r={7} fill={tone("red", "#fca5a5")} opacity={0.8} />
                </g>
              ))}
            </g>,
          )}
          {part(
            "white",
            <g>
              {[
                [186, 140],
                [180, 34],
              ].map(([x, y]) => (
                <g key={`${x}-${y}`}>
                  <circle cx={x} cy={y} r={22} fill={tone("white", "#ede9fe")} stroke="#a78bfa" strokeWidth={1.5} />
                  <path d={`M${x! - 12} ${y! - 2} q 5 -10 12 -3 q 7 -9 12 3 q -3 10 -12 6 q -9 5 -12 -6 Z`} fill="#6d28d9" />
                </g>
              ))}
            </g>,
          )}
          {part(
            "platelets",
            <g>
              {PLATELETS.map(([x, y]) => (
                <g key={`${x}-${y}`}>
                  <circle cx={x} cy={y} r={11} fill="transparent" />
                  <circle cx={x} cy={y} r={4} fill={tone("platelets", "#a855f7")} />
                </g>
              ))}
            </g>,
          )}
        </>
      )}
    />
  );
}
