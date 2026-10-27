// Block 3 of the Lublin lesson: the Commonwealth of Both Nations after 1569 — the Crown, Lithuania,
// the three lands moved from Lithuania to the Crown, Livonia held jointly, and Ducal Prussia as a fief.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "korona" | "litwa" | "podlasie" | "wolyn" | "kijow" | "inflanty" | "prusy" | "lublin";

const PARTS: Record<Part, MapPart> = {
  korona: {
    name: {
      pl: "Korona Królestwa Polskiego",
      ru: "Корона Королевства Польского",
    },
    text: {
      pl: "Polska część Rzeczypospolitej. Po 1569 roku powiększona o Podlasie, Wołyń i Kijowszczyznę. Stolica: Kraków, ale sejmy zbierały się w Warszawie.",
      ru: "Польская часть Речи Посполитой. После 1569 года увеличена за счёт Подляшья, Волыни и Киевщины. Столица: Краков, но сеймы собирались в Варшаве.",
    },
    pin: [60, 130],
    to: [60, 130],
  },
  litwa: {
    name: {
      pl: "Wielkie Księstwo Litewskie",
      ru: "Великое княжество Литовское",
    },
    text: {
      pl: "Litewska część Rzeczypospolitej ze stolicą w Wilnie. Po unii zachowała własne wojsko, skarb, urzędy i prawo (Statut litewski).",
      ru: "Литовская часть Речи Посполитой со столицей в Вильно. После унии сохранила собственное войско, казну, должности и право (Литовский статут).",
    },
    pin: [330, 130],
    to: [330, 130],
  },
  podlasie: {
    name: { pl: "Podlasie", ru: "Подляшье" },
    text: {
      pl: "Ziemia nad Bugiem i Narwią. W marcu 1569 roku Zygmunt August przeniósł ją z Litwy do Korony, by nacisnąć na litewskich magnatów.",
      ru: "Земля на Буге и Нареве. В марте 1569 года Сигизмунд Август передал её из Литвы в Корону, чтобы надавить на литовских магнатов.",
    },
    pin: [150, 110],
    to: [190, 138],
  },
  wolyn: {
    name: { pl: "Wołyń", ru: "Волынь" },
    text: {
      pl: "Ziemia z Łuckiem na zachodniej Ukrainie, włączona do Korony przed zawarciem unii. Szlachta wołyńska zachowała własne prawo i język ruski w urzędach.",
      ru: "Земля с Луцком на западной Украине, присоединённая к Короне перед заключением унии. Волынская шляхта сохранила собственное право и русский язык в делопроизводстве.",
    },
    pin: [200, 240],
    to: [240, 198],
  },
  kijow: {
    name: { pl: "Kijowszczyzna", ru: "Киевщина" },
    text: {
      pl: "Ziemia z Kijowem nad Dnieprem, przyłączona do Korony w 1569 roku razem z Bracławszczyzną. Odtąd Korona graniczyła ze stepem i z Moskwą.",
      ru: "Земля с Киевом на Днепре, присоединённая к Короне в 1569 году вместе с Брацлавщиной. С тех пор Корона граничила со степью и с Москвой.",
    },
    pin: [380, 240],
    to: [322, 222],
  },
  inflanty: {
    name: { pl: "Inflanty", ru: "Ливония" },
    text: {
      pl: "Kraj nad Bałtykiem (dzisiejsza Łotwa i Estonia), który w 1561 roku poddał się Zygmuntowi Augustowi. Od 1569 roku wspólna własność Korony i Litwy.",
      ru: "Страна на Балтике (нынешние Латвия и Эстония), в 1561 году подчинившаяся Сигизмунду Августу. С 1569 года — общее владение Короны и Литвы.",
    },
    pin: [380, 24],
    to: [300, 36],
  },
  prusy: {
    name: { pl: "Prusy Książęce", ru: "Герцогская Пруссия" },
    text: {
      pl: "Lenno Polski od hołdu pruskiego w 1525 roku — nie część Rzeczypospolitej, ale państwo zależne od króla.",
      ru: "Лен Польши с прусского оммажа 1525 года — не часть Речи Посполитой, а государство, зависимое от короля.",
    },
    pin: [196, 20],
    to: [196, 84],
  },
  lublin: {
    name: { pl: "Lublin — sejm 1569", ru: "Люблин — сейм 1569" },
    text: {
      pl: "Tu od stycznia do sierpnia 1569 roku obradował wspólny sejm Polaków i Litwinów. 1 lipca podpisano akt unii; scenę tę namalował w 1869 roku Jan Matejko.",
      ru: "Здесь с января по август 1569 года заседал общий сейм поляков и литовцев. 1 июля был подписан акт унии; эту сцену в 1869 году написал Ян Матейко.",
    },
    pin: [120, 240],
    to: [172, 190],
  },
};

const LINE = "#6b5a3a";
const MOVED = "#fb923c";

export function CommonwealthMap({ lang }: { lang: ContentLang }) {
  const t = (pl: string, ru: string) => (lang === "pl" ? pl : ru);
  const city = (x: number, y: number, label: string, dx = 6, dy = 4) => (
    <g>
      <circle cx={x} cy={y} r={3.5} fill="#1f2937" stroke="#fff" strokeWidth={1.2} />
      <text x={x + dx} y={y + dy} fontSize={9} fill="#1f2937" fontWeight={600}>
        {label}
      </text>
    </g>
  );
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 260"
      maxWidth="max-w-[520px]"
      title={{
        pl: "Rzeczpospolita Obojga Narodów po 1569 roku",
        ru: "Речь Посполитая Обоих Народов после 1569 года",
      }}
      labelOrder={["korona", "litwa", "podlasie", "wolyn", "kijow", "inflanty", "prusy", "lublin"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={400} height={260} fill="#f1f5f9" />
          {/* the Baltic with the Gulf of Riga */}
          <path d="M0 0 H 262 L 250 60 L 90 62 C 60 62, 30 70, 0 90 Z" fill="#bfe0f2" />
          <text x={40} y={34} fontSize={10} fill="#1e3a8a" fontStyle="italic">
            {t("Morze Bałtyckie", "Балтийское море")}
          </text>
          <g stroke={LINE} strokeWidth={1.5} strokeLinejoin="round">
            {part("korona", <path d="M0 90 C 30 70, 60 62, 90 62 L 150 60 L 150 100 L 205 120 L 205 165 L 240 180 L 330 180 L 340 250 L 20 255 L 0 240 Z" fill={tone("korona", "#fde68a")} />)}
            {part("litwa", <path d="M205 120 L 250 100 L 262 60 L 290 44 L 330 60 L 370 100 L 360 180 L 330 180 L 240 180 L 205 165 Z" fill={tone("litwa", "#bbf7d0")} />)}
            {part("inflanty", <path d="M262 14 L 340 8 L 338 60 L 330 60 L 290 44 L 262 60 Z" fill={tone("inflanty", "#a5b4fc")} />)}
            {part("prusy", <path d="M150 60 L 240 60 L 250 100 L 205 120 L 150 100 Z" fill={tone("prusy", "#c4b5fd")} />)}
            {/* lands moved from Lithuania to the Crown in 1569 */}
            <g stroke={MOVED} strokeWidth={2.5} strokeDasharray="5 3">
              {part("podlasie", <path d="M172 112 L 205 120 L 205 165 L 176 160 Z" fill={tone("podlasie", "#fed7aa")} />)}
              {part("wolyn", <path d="M205 165 L 240 180 L 280 180 L 276 216 L 212 212 Z" fill={tone("wolyn", "#fed7aa")} />)}
              {part("kijow", <path d="M280 180 L 330 180 L 340 250 L 270 252 L 276 216 Z" fill={tone("kijow", "#fed7aa")} />)}
            </g>
          </g>
          {/* names */}
          <text x={40} y={150} fontSize={11} fill="#78350f" fontWeight={700}>
            {t("KORONA", "КОРОНА")}
          </text>
          <text x={276} y={140} fontSize={11} fill="#14532d" fontWeight={700}>
            {t("LITWA", "ЛИТВА")}
          </text>
          <text x={272} y={30} fontSize={8} fill="#312e81" fontWeight={600}>
            {t("Inflanty", "Ливония")}
          </text>
          <text x={166} y={88} fontSize={7} fill="#4c1d95">
            {t("Prusy Książęce", "Герцогская Пруссия")}
          </text>
          <text x={178} y={142} fontSize={6.5} fill="#7c2d12" transform="rotate(-70 178 142)">
            {t("Podlasie", "Подляшье")}
          </text>
          <text x={226} y={202} fontSize={7.5} fill="#7c2d12" fontWeight={600}>
            {t("Wołyń", "Волынь")}
          </text>
          <text x={284} y={244} fontSize={7.5} fill="#7c2d12" fontWeight={600}>
            {t("Kijowszczyzna", "Киевщина")}
          </text>
          {/* cities */}
          {city(118, 68, t("Gdańsk", "Гданьск"), -8, 12)}
          {city(80, 195, t("Kraków", "Краков"))}
          {city(150, 150, t("Warszawa", "Варшава"), -42, 4)}
          {part("lublin", city(172, 190, t("Lublin", "Люблин"), -8, 12))}
          {city(300, 110, t("Wilno", "Вильно"))}
          {city(322, 222, t("Kijów", "Киев"), 6, 4)}
          {city(300, 36, t("Ryga", "Рига"), 6, 4)}
          {/* legend */}
          <g fontSize={7} fill="#334155">
            <rect x={8} y={220} width={9} height={9} fill="#fed7aa" stroke={MOVED} strokeWidth={1.5} strokeDasharray="3 2" />
            <text x={20} y={227.5}>
              {t("z Litwy do Korony w 1569 r.", "из Литвы в Корону в 1569 г.")}
            </text>
            <rect x={8} y={232} width={9} height={9} fill="#a5b4fc" stroke={LINE} />
            <text x={20} y={239.5}>
              {t("wspólne Korony i Litwy", "общее Короны и Литвы")}
            </text>
            <rect x={8} y={244} width={9} height={9} fill="#c4b5fd" stroke={LINE} />
            <text x={20} y={251.5}>
              {t("lenno Polski", "лен Польши")}
            </text>
          </g>
        </>
      )}
    />
  );
}
