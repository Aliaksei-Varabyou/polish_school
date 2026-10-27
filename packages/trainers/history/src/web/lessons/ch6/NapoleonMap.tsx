// Block 2 of the conquests lesson: a schematic map of Europe around 1812, at the height of
// Napoleon's power. Four shades: the French Empire, its dependent states, the beaten powers that
// had to sign peace, and the enemies that never gave in. Each country explains itself when tapped;
// in "label it" mode the student matches names to pins.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "cesarstwo" | "ren" | "wlochy" | "hiszpania" | "warszawa" | "prusy" | "austria" | "rosja" | "brytania" | "austerlitz" | "trafalgar";

const PARTS: Record<Part, MapPart> = {
  cesarstwo: {
    name: { pl: "Cesarstwo Francuskie", ru: "Французская империя" },
    text: {
      pl: "Francja wraz z ziemiami wcielonymi wprost do cesarstwa: Belgią, Holandią, wybrzeżem Niemiec i częścią Włoch z Rzymem. Tu rządził sam Napoleon.",
      ru: "Франция вместе с землями, прямо включёнными в империю: Бельгией, Голландией, побережьем Германии и частью Италии с Римом. Здесь правил сам Наполеон.",
    },
    pin: [150, 140],
    to: [160, 128],
  },
  ren: {
    name: { pl: "Związek Reński", ru: "Рейнский союз" },
    text: {
      pl: "Państewka niemieckie, które Napoleon połączył w 1806 roku w związek zależny od Francji. Musiały dostarczać mu żołnierzy.",
      ru: "Немецкие государства, которые Наполеон объединил в 1806 году в союз, зависимый от Франции. Они должны были поставлять ему солдат.",
    },
    pin: [252, 116],
    to: [244, 104],
  },
  wlochy: {
    name: { pl: "Królestwo Włoch i Neapol", ru: "Королевство Италия и Неаполь" },
    text: {
      pl: "Państwa satelickie: królem Włoch był sam Napoleon, a w Neapolu panował jego szwagier Murat.",
      ru: "Государства-сателлиты: королём Италии был сам Наполеон, а в Неаполе правил его зять Мюрат.",
    },
    pin: [252, 214],
    to: [240, 200],
  },
  hiszpania: {
    name: { pl: "Hiszpania", ru: "Испания" },
    text: {
      pl: "Napoleon osadził tu na tronie swojego brata Józefa, ale Hiszpanie walczyli z Francuzami latami w wojnie partyzanckiej, wspierani przez Brytyjczyków z Portugalii.",
      ru: "Наполеон посадил здесь на трон своего брата Жозефа, но испанцы годами вели с французами партизанскую войну при поддержке британцев из Португалии.",
    },
    pin: [84, 204],
    to: [92, 190],
  },
  warszawa: {
    name: { pl: "Księstwo Warszawskie", ru: "Варшавское герцогство" },
    text: {
      pl: "Polskie państwo utworzone w 1807 roku po pokoju w Tylży, sprzymierzone z Francją. Jego armią dowodził książę Józef Poniatowski.",
      ru: "Польское государство, созданное в 1807 году после Тильзитского мира и союзное Франции. Его армией командовал князь Юзеф Понятовский.",
    },
    pin: [336, 122],
    to: [326, 112],
  },
  prusy: {
    name: { pl: "Prusy", ru: "Пруссия" },
    text: {
      pl: "Rozbite pod Jeną i Auerstedt w 1806 roku. W Tylży straciły połowę ziem i musiały zostać wymuszonym sojusznikiem Napoleona.",
      ru: "Разгромлена при Йене и Ауэрштедте в 1806 году. По Тильзитскому миру потеряла половину земель и была вынуждена стать союзником Наполеона.",
    },
    pin: [312, 82],
    to: [300, 90],
  },
  austria: {
    name: { pl: "Austria", ru: "Австрия" },
    text: {
      pl: "Pokonana pod Austerlitz (1805) i Wagram (1809). Cesarz Franciszek oddał Napoleonowi za żonę swoją córkę Marię Ludwikę.",
      ru: "Побеждена под Аустерлицем (1805) и при Ваграме (1809). Император Франц отдал Наполеону в жёны свою дочь Марию-Луизу.",
    },
    pin: [296, 172],
    to: [288, 160],
  },
  rosja: {
    name: { pl: "Rosja", ru: "Россия" },
    text: {
      pl: "Sojusznik z Tylży, który złamał blokadę kontynentalną. W 1812 roku Napoleon ruszył na Moskwę — i stracił tam Wielką Armię.",
      ru: "Союзник по Тильзиту, нарушивший континентальную блокаду. В 1812 году Наполеон пошёл на Москву — и потерял там Великую армию.",
    },
    pin: [388, 120],
    to: [376, 108],
  },
  brytania: {
    name: { pl: "Wielka Brytania", ru: "Великобритания" },
    text: {
      pl: "Jedyny wróg, którego Napoleon nigdy nie pokonał. Po Trafalgarze panowała na morzach, a blokada kontynentalna miała ją zrujnować gospodarczo.",
      ru: "Единственный враг, которого Наполеон так и не победил. После Трафальгара она господствовала на морях, а континентальная блокада должна была разорить её.",
    },
    pin: [112, 72],
    to: [116, 86],
  },
  austerlitz: {
    name: { pl: "Austerlitz (1805)", ru: "Аустерлиц (1805)" },
    text: {
      pl: "„Bitwa trzech cesarzy” na Morawach: Napoleon rozbił wojska cesarza Austrii i cara Rosji. Największe zwycięstwo w jego karierze.",
      ru: "«Битва трёх императоров» в Моравии: Наполеон разгромил войска императора Австрии и русского царя. Величайшая победа в его карьере.",
    },
    pin: [318, 150],
    to: [308, 146],
  },
  trafalgar: {
    name: { pl: "Trafalgar (1805)", ru: "Трафальгар (1805)" },
    text: {
      pl: "U wybrzeży Hiszpanii admirał Nelson zniszczył flotę francusko-hiszpańską. Napoleon musiał porzucić plan lądowania w Anglii.",
      ru: "У берегов Испании адмирал Нельсон уничтожил франко-испанский флот. Наполеону пришлось отказаться от высадки в Англии.",
    },
    pin: [48, 254],
    to: [58, 244],
  },
};

const EMPIRE = "#1d4ed8";
const SATELLITE = "#7dd3fc";
const BEATEN = "#d6d3d1";
const ENEMY = "#f87171";
const NEUTRAL = "#e7e5e4";
const LINE = "#44403c";

export function NapoleonMap({ lang }: { lang: ContentLang }) {
  const pl = lang === "pl";
  const label = (x: number, y: number, text: string, dark = false) => (
    <text x={x} y={y} fontSize={8} fontWeight={600} fill={dark ? "#1f2937" : "#fff"} textAnchor="middle" pointerEvents="none">
      {text}
    </text>
  );
  const legend = [
    [EMPIRE, pl ? "Cesarstwo Francuskie" : "Французская империя"],
    [SATELLITE, pl ? "państwa zależne od Francji" : "государства, зависимые от Франции"],
    [BEATEN, pl ? "pokonani, zmuszeni do sojuszu" : "побеждённые, принуждённые к союзу"],
    [ENEMY, pl ? "wrogowie Napoleona" : "враги Наполеона"],
  ] as const;
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 420 300"
      maxWidth="max-w-[560px]"
      title={{ pl: "Europa w czasach Napoleona (około 1812 roku)", ru: "Европа во времена Наполеона (около 1812 года)" }}
      labelOrder={["cesarstwo", "ren", "wlochy", "hiszpania", "warszawa", "prusy", "austria", "rosja", "brytania", "austerlitz", "trafalgar"]}
      pinRadius={10}
      overlay={() => (
        <>
          {label(160, 128, pl ? "Francja" : "Франция")}
          {label(244, 104, pl ? "Zw. Reński" : "Рейнский союз", true)}
          {label(240, 200, pl ? "Włochy" : "Италия", true)}
          {label(92, 190, pl ? "Hiszpania" : "Испания", true)}
          {label(326, 112, pl ? "Ks. Warsz." : "Варш. герц.", true)}
          {label(300, 90, pl ? "Prusy" : "Пруссия", true)}
          {label(288, 160, pl ? "Austria" : "Австрия", true)}
          {label(376, 108, pl ? "Rosja" : "Россия", true)}
          {label(116, 86, pl ? "W. Brytania" : "Британия", true)}
        </>
      )}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={420} height={300} fill="#bfe0f2" />
          <g stroke={LINE} strokeWidth={1.2} strokeLinejoin="round">
            {/* neutral or outside the story: Scandinavia, Balkans, Portugal with the British */}
            <path d="M200 10 L262 4 L272 60 L242 92 L212 72 L196 40 Z" fill={NEUTRAL} />
            <path d="M300 198 L352 190 L378 250 L332 264 L292 238 Z" fill={NEUTRAL} />
            {part("rosja", <path d="M340 58 L352 20 L420 0 L420 300 L382 300 L358 242 L372 142 L352 96 Z" fill={tone("rosja", ENEMY)} />)}
            {part("brytania", <><path d="M100 40 L128 36 L134 60 L126 90 L112 108 L96 100 L92 72 Z" fill={tone("brytania", ENEMY)} /><path d="M66 60 L86 56 L88 80 L72 86 Z" fill={tone("brytania", ENEMY)} /></>)}
            {part("hiszpania", <path d="M58 168 L120 160 L128 200 L100 236 L60 238 Z" fill={tone("hiszpania", SATELLITE)} />)}
            <path d="M40 170 L58 168 L60 238 L46 238 L36 210 Z" fill={ENEMY} />
            {part("cesarstwo", <path d="M126 96 L212 82 L222 108 L206 150 L184 176 L128 176 L112 140 Z" fill={tone("cesarstwo", EMPIRE)} />)}
            {part("ren", <path d="M212 82 L280 70 L300 104 L296 130 L250 150 L222 108 Z" fill={tone("ren", SATELLITE)} />)}
            {part("prusy", <path d="M280 70 L340 58 L352 96 L300 104 Z" fill={tone("prusy", BEATEN)} />)}
            {part("warszawa", <path d="M300 104 L352 96 L372 142 L340 144 L296 130 Z" fill={tone("warszawa", SATELLITE)} />)}
            {part("austria", <path d="M250 150 L296 130 L340 144 L352 190 L300 198 L252 182 Z" fill={tone("austria", BEATEN)} />)}
            {part("wlochy", <path d="M196 176 L252 182 L262 200 L292 236 L284 256 L262 242 L236 212 L206 196 Z" fill={tone("wlochy", SATELLITE)} />)}
          </g>
          {label(236, 44, pl ? "Szwecja" : "Швеция", true)}
          {label(336, 232, pl ? "Turcja" : "Турция", true)}
          {/* the two battles of 1805 */}
          {part("austerlitz", <path d="M308 139 L311 145 L317 146 L312 150 L314 156 L308 153 L302 156 L304 150 L299 146 L305 145 Z" fill={tone("austerlitz", "#facc15")} stroke={LINE} strokeWidth={1} />)}
          {part("trafalgar", <path d="M58 237 L61 243 L67 244 L62 248 L64 254 L58 251 L52 254 L54 248 L49 244 L55 243 Z" fill={tone("trafalgar", "#facc15")} stroke={LINE} strokeWidth={1} />)}
          {/* legend */}
          <rect x={150} y={262} width={160} height={36} rx={4} fill="#fff" opacity={0.9} />
          {legend.map(([color, text], i) => (
            <g key={color} transform={`translate(154 ${266 + i * 8})`}>
              <rect width={9} height={6} fill={color} stroke={LINE} strokeWidth={0.5} />
              <text x={12} y={5.8} fontSize={6.5} fill="#1f2937">
                {text}
              </text>
            </g>
          ))}
        </>
      )}
    />
  );
}
