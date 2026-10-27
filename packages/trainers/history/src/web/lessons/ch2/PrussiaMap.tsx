// Block 2 of the Sigismund lesson: a schematic map of the Jagiellonian lands after 1525 — Royal
// Prussia inside the Crown, Ducal Prussia as a fief, Mazovia joining in 1526, and the eastern front
// with Muscovy. Each part explains itself when tapped; in "label it" mode the student matches names.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "krolewskie" | "ksiazece" | "mazowsze" | "krakow" | "gdansk" | "krolewiec" | "orsza" | "smolensk";

const PARTS: Record<Part, MapPart> = {
  krolewskie: {
    name: { pl: "Prusy Królewskie", ru: "Королевская Пруссия" },
    text: {
      pl: "Pomorze Gdańskie z Gdańskiem, Toruniem i Malborkiem. Od II pokoju toruńskiego (1466) należały bezpośrednio do Korony — to była część Polski, nie lenno.",
      ru: "Гданьское Поморье с Гданьском, Торунем и Мальборком. Со Второго Торуньского мира (1466) принадлежало непосредственно Короне — это была часть Польши, а не лен.",
    },
    pin: [100, 92],
    to: [100, 92],
  },
  ksiazece: {
    name: { pl: "Prusy Książęce", ru: "Герцогская Пруссия" },
    text: {
      pl: "Dawne państwo zakonu krzyżackiego. W 1525 roku Albrecht Hohenzollern zamienił je w świeckie księstwo (sekularyzacja) i został lennikiem króla Polski. Stolica: Królewiec.",
      ru: "Бывшее государство Тевтонского ордена. В 1525 году Альбрехт Гогенцоллерн превратил его в светское княжество (секуляризация) и стал вассалом короля Польши. Столица: Кёнигсберг.",
    },
    pin: [200, 100],
    to: [200, 100],
  },
  mazowsze: {
    name: { pl: "Mazowsze", ru: "Мазовия" },
    text: {
      pl: "Księstwo rządzone przez Piastów mazowieckich. Gdy w 1526 roku zmarł ostatni z nich, Zygmunt Stary włączył Mazowsze z Warszawą do Korony.",
      ru: "Княжество, которым правили мазовецкие Пясты. Когда в 1526 году умер последний из них, Сигизмунд Старый присоединил Мазовию с Варшавой к Короне.",
    },
    pin: [160, 158],
    to: [160, 158],
  },
  krakow: {
    name: {
      pl: "Kraków — hołd pruski 1525",
      ru: "Краков — прусский оммаж 1525",
    },
    text: {
      pl: "Stolica Polski. 10 kwietnia 1525 roku na rynku krakowskim Albrecht Hohenzollern uklęknął przed Zygmuntem Starym i złożył mu hołd lenny. Scenę tę namalował Jan Matejko.",
      ru: "Столица Польши. 10 апреля 1525 года на краковском рынке Альбрехт Гогенцоллерн преклонил колени перед Сигизмундом Старым и принёс ему ленную присягу. Эту сцену написал Ян Матейко.",
    },
    pin: [96, 238],
    to: [118, 224],
  },
  gdansk: {
    name: { pl: "Gdańsk", ru: "Гданьск" },
    text: {
      pl: "Największy port Rzeczypospolitej, w Prusach Królewskich. Stąd polskie zboże płynęło do Europy Zachodniej.",
      ru: "Крупнейший порт Речи Посполитой, в Королевской Пруссии. Отсюда польское зерно шло в Западную Европу.",
    },
    pin: [60, 60],
    to: [94, 70],
  },
  krolewiec: {
    name: { pl: "Królewiec", ru: "Кёнигсберг" },
    text: {
      pl: "Stolica Prus Książęcych, siedziba księcia Albrechta. Dziś Kaliningrad.",
      ru: "Столица Герцогской Пруссии, резиденция князя Альбрехта. Сегодня Калининград.",
    },
    pin: [236, 44],
    to: [196, 72],
  },
  orsza: {
    name: { pl: "Orsza — bitwa 1514", ru: "Орша — битва 1514" },
    text: {
      pl: "Tu hetman Konstanty Ostrogski rozbił armię moskiewską. Zwycięstwo zatrzymało Moskwę, ale nie wystarczyło, by odzyskać Smoleńsk.",
      ru: "Здесь гетман Константин Острожский разбил московскую армию. Победа остановила Москву, но её не хватило, чтобы вернуть Смоленск.",
    },
    pin: [290, 216],
    to: [314, 166],
  },
  smolensk: {
    name: { pl: "Smoleńsk", ru: "Смоленск" },
    text: {
      pl: "Twierdza nad Dnieprem, którą Moskwa zdobyła w 1514 roku. Litwa straciła ją na prawie sto lat.",
      ru: "Крепость на Днепре, которую Москва взяла в 1514 году. Литва потеряла её почти на сто лет.",
    },
    pin: [372, 110],
    to: [346, 148],
  },
};

const SEA = "#bfe0f2";
const LINE = "#6b5a3a";

export function PrussiaMap({ lang }: { lang: ContentLang }) {
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
        pl: "Ziemie Jagiellonów po 1525 roku",
        ru: "Земли Ягеллонов после 1525 года",
      }}
      labelOrder={["krolewskie", "ksiazece", "mazowsze", "krakow", "gdansk", "krolewiec", "orsza", "smolensk"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={400} height={260} fill="#f1f5f9" />
          {/* the Baltic */}
          <path d="M0 0 H270 C 262 30, 250 50, 240 60 L 60 60 C 40 62, 20 70, 0 90 Z" fill={SEA} />
          <text x={90} y={40} fontSize={10} fill="#1e3a8a" fontStyle="italic">
            {t("Morze Bałtyckie", "Балтийское море")}
          </text>
          <g stroke={LINE} strokeWidth={1.5} strokeLinejoin="round">
            {/* the Crown */}
            <path d="M0 90 C 20 70, 40 62, 70 62 L 150 60 L 240 60 L 245 100 L 205 125 L 205 175 L 210 240 L 210 260 L 0 260 Z" fill="#fde68a" />
            {/* Lithuania */}
            <path d="M205 125 L 245 100 L 240 60 C 250 50, 262 30, 270 0 L 330 0 L 330 70 L 300 90 L 330 130 L 320 200 L 330 260 L 210 260 L 210 240 L 205 175 Z" fill="#bbf7d0" />
            {/* Muscovy */}
            <path d="M330 0 L 400 0 L 400 260 L 330 260 L 320 200 L 330 130 L 300 90 L 330 70 Z" fill="#fecaca" />
            {part("krolewskie", <path d="M70 62 L 150 60 L 150 100 L 120 125 L 110 128 L 70 120 Z" fill={tone("krolewskie", "#fbbf24")} />)}
            {part("ksiazece", <path d="M150 60 L 240 60 L 245 100 L 205 125 L 150 100 Z" fill={tone("ksiazece", "#c4b5fd")} />)}
            {part("mazowsze", <path d="M110 128 L 205 125 L 205 175 L 120 180 Z" fill={tone("mazowsze", "#fdba74")} />)}
          </g>
          {/* region names */}
          <text x={40} y={200} fontSize={11} fill="#78350f" fontWeight={700}>
            {t("KORONA", "КОРОНА")}
          </text>
          <text x={232} y={200} fontSize={11} fill="#14532d" fontWeight={700}>
            {t("LITWA", "ЛИТВА")}
          </text>
          <text x={338} y={110} fontSize={10} fill="#7f1d1d" fontWeight={700}>
            {t("MOSKWA", "МОСКВА")}
          </text>
          <text x={74} y={112} fontSize={6.5} fill="#78350f">
            {t("Prusy Królewskie", "Королевская Пруссия")}
          </text>
          <text x={160} y={88} fontSize={7.5} fill="#4c1d95">
            {t("Prusy Książęce", "Герцогская Пруссия")}
          </text>
          <text x={132} y={170} fontSize={7.5} fill="#7c2d12">
            {t("Mazowsze", "Мазовия")}
          </text>
          {/* cities and battle */}
          {part("gdansk", city(94, 70, t("Gdańsk", "Гданьск"), -6, 12))}
          {part("krolewiec", city(196, 72, t("Królewiec", "Кёнигсберг"), 6, -3))}
          {city(160, 150, t("Warszawa", "Варшава"))}
          {city(270, 150, t("Wilno", "Вильно"))}
          {part("krakow", city(118, 224, t("Kraków", "Краков")))}
          {part("smolensk", city(346, 148, t("Smoleńsk", "Смоленск"), 6, 12))}
          {part(
            "orsza",
            <g>
              <path d="M306 158 L322 174 M322 158 L306 174" stroke={tone("orsza", "#b91c1c")} strokeWidth={3.5} strokeLinecap="round" />
              <text x={300} y={186} fontSize={8} fill="#7f1d1d" fontWeight={600}>
                {t("Orsza 1514", "Орша 1514")}
              </text>
            </g>,
          )}
          {/* legend */}
          <g fontSize={7.5} fill="#334155">
            <rect x={6} y={6} width={9} height={9} fill="#fde68a" stroke={LINE} />
            <text x={18} y={13.5}>
              {t("Korona", "Корона")}
            </text>
            <rect x={6} y={18} width={9} height={9} fill="#c4b5fd" stroke={LINE} />
            <text x={18} y={25.5}>
              {t("lenno Polski", "лен Польши")}
            </text>
            <rect x={6} y={30} width={9} height={9} fill="#bbf7d0" stroke={LINE} />
            <text x={18} y={37.5}>
              {t("Litwa", "Литва")}
            </text>
          </g>
        </>
      )}
    />
  );
}
