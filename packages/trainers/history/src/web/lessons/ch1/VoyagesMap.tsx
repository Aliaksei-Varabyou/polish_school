// Block 2 of the discoveries lesson: a schematic world map with the four great voyages. Each route
// explains itself when tapped; in "label it" mode the student matches names to pins.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "kolumb" | "diaz" | "gama" | "magellan" | "cape" | "india" | "caribbean";

const PARTS: Record<Part, MapPart> = {
  kolumb: {
    name: { pl: "Wyprawa Kolumba (1492)", ru: "Экспедиция Колумба (1492)" },
    text: {
      pl: "Kolumb popłynął z Hiszpanii na zachód, bo wierzył, że tak szybciej dotrze do Indii. Po 33 dniach zobaczył ląd — wyspy Karaibów. Do końca życia myślał, że to Azja.",
      ru: "Колумб поплыл из Испании на запад, веря, что так быстрее доберётся до Индии. Через 33 дня он увидел землю — острова Карибского моря. До конца жизни он думал, что это Азия.",
    },
    pin: [150, 70],
    to: [150, 92],
  },
  diaz: {
    name: { pl: "Wyprawa Diasa (1488)", ru: "Экспедиция Диаша (1488)" },
    text: {
      pl: "Portugalczycy płynęli wzdłuż Afryki coraz dalej na południe. Bartolomeu Dias jako pierwszy opłynął jej południowy kraniec — Przylądek Dobrej Nadziei.",
      ru: "Португальцы плыли вдоль Африки всё дальше на юг. Бартоломеу Диаш первым обогнул её южную оконечность — мыс Доброй Надежды.",
    },
    pin: [160, 150],
    to: [184, 140],
  },
  gama: {
    name: { pl: "Wyprawa Vasco da Gamy (1498)", ru: "Экспедиция Васко да Гамы (1498)" },
    text: {
      pl: "Vasco da Gama poszedł drogą Diasa i popłynął dalej: wokół Afryki, przez Ocean Indyjski, aż do portu Kalikat w Indiach. Morska droga do przypraw była znaleziona.",
      ru: "Васко да Гама пошёл путём Диаша и поплыл дальше: вокруг Африки, через Индийский океан, до порта Каликут в Индии. Морской путь к пряностям был найден.",
    },
    pin: [272, 170],
    to: [262, 148],
  },
  magellan: {
    name: { pl: "Wyprawa Magellana (1519–1522)", ru: "Экспедиция Магеллана (1519–1522)" },
    text: {
      pl: "Pięć statków wypłynęło z Hiszpanii, przepłynęło cieśninę na południu Ameryki i ogromny Ocean Spokojny. Magellan zginął na Filipinach; do domu wrócił jeden statek — i tak udowodniono, że Ziemia jest kulą.",
      ru: "Пять кораблей вышли из Испании, прошли пролив на юге Америки и огромный Тихий океан. Магеллан погиб на Филиппинах; домой вернулся один корабль — и так было доказано, что Земля шар.",
    },
    pin: [60, 190],
    to: [96, 182],
  },
  cape: {
    name: { pl: "Przylądek Dobrej Nadziei", ru: "Мыс Доброй Надежды" },
    text: { pl: "Południowy kraniec Afryki. Kto go opłynął, mógł płynąć dalej do Indii.", ru: "Южная оконечность Африки. Кто её обогнул, мог плыть дальше в Индию." },
    pin: [232, 200],
    to: [215, 186],
  },
  india: {
    name: { pl: "Indie", ru: "Индия" },
    text: { pl: "Kraj przypraw: pieprzu, cynamonu, goździków. Cel wszystkich tych wypraw.", ru: "Страна пряностей: перца, корицы, гвоздики. Цель всех этих экспедиций." },
    pin: [330, 70],
    to: [302, 100],
  },
  caribbean: {
    name: { pl: "Wyspy Karaibów", ru: "Карибские острова" },
    text: { pl: "Tu 12 października 1492 roku Kolumb po raz pierwszy zszedł na ląd Nowego Świata.", ru: "Здесь 12 октября 1492 года Колумб впервые сошёл на землю Нового Света." },
    pin: [70, 130],
    to: [104, 106],
  },
};

const LAND = "#d9c89e";
const LAND_LINE = "#8a7a52";

export function VoyagesMap({ lang }: { lang: ContentLang }) {
  const route = (d: string, color: string, dash?: string) => <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />;
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 220"
      maxWidth="max-w-[520px]"
      title={{ pl: "Mapa wielkich wypraw", ru: "Карта великих экспедиций" }}
      labelOrder={["kolumb", "diaz", "gama", "magellan", "cape", "india", "caribbean"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={400} height={220} fill="#bfe0f2" />
          {/* continents, very schematically */}
          <g fill={LAND} stroke={LAND_LINE} strokeWidth={1.5} strokeLinejoin="round">
            {/* North America */}
            <path d="M22 28 L118 24 L126 60 L112 92 L98 110 L80 112 L70 96 L44 86 L26 66 Z" />
            {/* South America */}
            <path d="M84 116 L128 112 L140 136 L128 170 L116 198 L104 200 L96 172 L82 142 Z" />
            {/* Eurasia */}
            <path d="M172 34 L390 26 L396 70 L372 92 L350 110 L332 96 L310 106 L298 128 L288 100 L262 92 L232 90 L212 76 L190 84 L176 68 Z" />
            {/* Africa */}
            <path d="M180 92 L232 94 L250 120 L244 156 L226 184 L212 188 L200 160 L184 134 L176 110 Z" />
            {/* Australia */}
            <path d="M330 160 L378 156 L386 184 L352 196 L328 184 Z" />
          </g>
          {part("cape", <circle cx={215} cy={186} r={7} fill={tone("cape", "#b45309")} stroke="#fff" strokeWidth={2} />)}
          {part("india", <circle cx={302} cy={100} r={7} fill={tone("india", "#b45309")} stroke="#fff" strokeWidth={2} />)}
          {part("caribbean", <circle cx={104} cy={106} r={7} fill={tone("caribbean", "#b45309")} stroke="#fff" strokeWidth={2} />)}
          {/* Spain and Portugal, where everything starts */}
          <circle cx={186} cy={82} r={4} fill="#1f2937" />
          <text x={178} y={74} fontSize={9} fill="#1f2937" fontWeight={600}>
            {lang === "pl" ? "Hiszpania" : "Испания"}
          </text>
          {part("kolumb", route("M186 84 C 160 80, 130 92, 108 104", tone("kolumb", "#dc2626")))}
          {part("diaz", route("M184 86 C 170 110, 170 150, 196 176 L 214 190", tone("diaz", "#2563eb")))}
          {part("gama", route("M182 88 C 164 116, 168 160, 206 196 C 240 212, 270 170, 300 110", tone("gama", "#16a34a")))}
          {part(
            "magellan",
            route("M188 86 C 150 120, 120 160, 112 200 L 100 208 C 70 212, 30 190, 2 150 M398 148 C 380 130, 364 124, 350 118 C 332 150, 300 200, 230 210 C 212 206, 196 150, 186 90", tone("magellan", "#7c3aed"), "7 5"),
          )}
        </>
      )}
    />
  );
}
