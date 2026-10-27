// Block 3 of the economy lesson: the road of Polish grain — from the manors of Lesser Poland down
// the Vistula to Gdańsk, and by sea to the Netherlands. Stops explain themselves when tapped.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "krakow" | "wisla" | "warszawa" | "torun" | "gdansk" | "baltyk" | "amsterdam";

const PARTS: Record<Part, MapPart> = {
  krakow: {
    name: {
      pl: "Kraków i folwarki Małopolski",
      ru: "Краков и фольварки Малой Польши",
    },
    text: {
      pl: "Tu zaczyna się droga zboża. Wiosną, gdy ruszają lody, szlachcice ładują worki ze spichlerzy na szkuty i tratwy.",
      ru: "Здесь начинается путь зерна. Весной, когда сходит лёд, шляхтичи грузят мешки из амбаров на шкуты и плоты.",
    },
    pin: [300, 228],
    to: [300, 206],
  },
  wisla: {
    name: { pl: "Wisła i flisacy", ru: "Висла и плотогоны" },
    text: {
      pl: "Flisacy spławiają zboże z prądem rzeki. Podróż z Krakowa do Gdańska trwa kilka tygodni; z powrotem flisacy często wracają pieszo.",
      ru: "Плотогоны сплавляют зерно вниз по реке. Путь из Кракова в Гданьск занимает несколько недель; обратно плотогоны часто возвращаются пешком.",
    },
    pin: [334, 160],
    to: [293, 171],
  },
  warszawa: {
    name: { pl: "Warszawa", ru: "Варшава" },
    text: {
      pl: "Miasto na Mazowszu nad Wisłą. Po unii lubelskiej zbierał się tu sejm; przez most przepływały setki szkut.",
      ru: "Город в Мазовии на Висле. После Люблинской унии здесь собирался сейм; мимо моста проплывали сотни шкут.",
    },
    pin: [226, 150],
    to: [262, 124],
  },
  torun: {
    name: { pl: "Toruń", ru: "Торунь" },
    text: {
      pl: "Bogate miasto kupieckie w Prusach Królewskich, dawny członek Hanzy. Tu zboże przeładowywano i cłowano.",
      ru: "Богатый купеческий город в Королевской Пруссии, бывший член Ганзы. Здесь зерно перегружали и облагали пошлиной.",
    },
    pin: [170, 110],
    to: [224, 96],
  },
  gdansk: {
    name: { pl: "Gdańsk", ru: "Гданьск" },
    text: {
      pl: "Największy port Rzeczypospolitej, członek Hanzy. Setki spichlerzy na Wyspie Spichrzów; stąd zboże płynie statkami na Zachód. Gdańsk bogaci się bardziej niż szlachta.",
      ru: "Крупнейший порт Речи Посполитой, член Ганзы. Сотни амбаров на Амбарном острове; отсюда зерно идёт на кораблях на Запад. Гданьск богатеет больше, чем шляхта.",
    },
    pin: [268, 36],
    to: [232, 64],
  },
  baltyk: {
    name: { pl: "Morze Bałtyckie", ru: "Балтийское море" },
    text: {
      pl: "Statki holenderskie i angielskie płyną z Gdańska przez Bałtyk i cieśniny duńskie na Morze Północne.",
      ru: "Голландские и английские корабли идут из Гданьска через Балтику и датские проливы в Северное море.",
    },
    pin: [160, 60],
    to: [150, 40],
  },
  amsterdam: {
    name: { pl: "Amsterdam — Niderlandy", ru: "Амстердам — Нидерланды" },
    text: {
      pl: "Kupcy holenderscy kupują najwięcej polskiego zboża i karmią nim miasta Europy Zachodniej. Za zboże szlachta kupuje sukno, wino, korzenie.",
      ru: "Голландские купцы покупают больше всего польского зерна и кормят им города Западной Европы. За зерно шляхта покупает сукно, вино, пряности.",
    },
    pin: [70, 110],
    to: [56, 78],
  },
};

const LAND = "#e9dfbf";
const LINE = "#8a7a52";

export function GrainRoute({ lang }: { lang: ContentLang }) {
  const t = (pl: string, ru: string) => (lang === "pl" ? pl : ru);
  const city = (x: number, y: number, label: string, dx = 7, dy = 4) => (
    <g>
      <circle cx={x} cy={y} r={4} fill="#1f2937" stroke="#fff" strokeWidth={1.5} />
      <text x={x + dx} y={y + dy} fontSize={9} fill="#1f2937" fontWeight={600}>
        {label}
      </text>
    </g>
  );
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 240"
      maxWidth="max-w-[520px]"
      title={{ pl: "Droga polskiego zboża", ru: "Путь польского зерна" }}
      labelOrder={["krakow", "wisla", "warszawa", "torun", "gdansk", "baltyk", "amsterdam"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={400} height={240} fill="#bfe0f2" />
          {/* land: the continent from the Netherlands to Poland, with the Baltic bay on top */}
          <path d="M0 82 L 56 78 L 110 92 L 150 72 L 200 70 L 232 62 L 300 70 L 400 56 L 400 240 L 0 240 Z" fill={LAND} stroke={LINE} strokeWidth={1.5} strokeLinejoin="round" />
          {/* Denmark, schematically */}
          <path d="M98 0 L 112 0 L 116 26 L 104 36 L 94 22 Z" fill={LAND} stroke={LINE} strokeWidth={1.2} />
          <text x={24} y={40} fontSize={9} fill="#1e3a8a" fontStyle="italic">
            {t("Morze Północne", "Северное море")}
          </text>
          <text x={128} y={18} fontSize={9} fill="#1e3a8a" fontStyle="italic">
            {t("Bałtyk", "Балтика")}
          </text>
          <text x={300} y={150} fontSize={11} fill="#78350f" fontWeight={700}>
            {t("POLSKA", "ПОЛЬША")}
          </text>
          <text x={14} y={120} fontSize={9} fill="#78350f" fontWeight={700}>
            {t("NIDERLANDY", "НИДЕРЛАНДЫ")}
          </text>
          {/* the river */}
          {part(
            "wisla",
            <path d="M300 206 C 292 180, 298 160, 280 142 C 266 128, 250 118, 236 106 C 222 96, 214 84, 232 64" fill="none" stroke={tone("wisla", "#2563eb")} strokeWidth={5} strokeLinecap="round" />,
          )}
          <text x={298} y={176} fontSize={8} fill="#1e3a8a" fontStyle="italic">
            {t("Wisła", "Висла")}
          </text>
          {/* the sea route */}
          {part(
            "baltyk",
            <path d="M230 60 C 200 40, 160 36, 118 46 C 100 50, 80 68, 58 78" fill="none" stroke={tone("baltyk", "#7c3aed")} strokeWidth={4} strokeDasharray="7 5" strokeLinecap="round" />,
          )}
          {/* grain sacks on the river */}
          <g fill="#f59e0b" stroke="#92400e" strokeWidth={0.8}>
            <rect x={288} y={166} width={9} height={7} rx={1.5} />
            <rect x={242} y={108} width={9} height={7} rx={1.5} />
          </g>
          {/* ship on the sea */}
          <path d="M178 30 L 202 30 L 196 38 L 184 38 Z" fill="#78350f" />
          <path d="M190 30 L 190 18 L 200 26 Z" fill="#fff" stroke="#78350f" strokeWidth={0.8} />
          {part("krakow", city(300, 206, t("Kraków", "Краков")))}
          {part("warszawa", city(262, 124, t("Warszawa", "Варшава"), 8, 10))}
          {part("torun", city(224, 96, t("Toruń", "Торунь"), -36, 4))}
          {part("gdansk", city(232, 64, t("Gdańsk", "Гданьск"), 8, 12))}
          {part("amsterdam", city(56, 78, t("Amsterdam", "Амстердам"), -24, 16))}
        </>
      )}
    />
  );
}
