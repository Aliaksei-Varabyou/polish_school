// Block 1 of the USA lesson: a schematic map of the thirteen colonies along the Atlantic coast with
// the places of the war of independence. Each place explains itself when tapped; in "label it" mode
// the student matches names to pins (the map shows only the years, so the names are the exercise).
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "kolonie" | "boston" | "filadelfia" | "saratoga" | "westpoint" | "yorktown" | "savannah" | "atlantyk";

const PARTS: Record<Part, MapPart> = {
  kolonie: {
    name: { pl: "13 kolonii", ru: "13 колоний" },
    text: {
      pl: "Pas ziemi między Atlantykiem a górami Appalachami. Od Massachusetts na północy po Georgię na południu — trzynaście kolonii angielskich, około 2,5 miliona mieszkańców.",
      ru: "Полоса земли между Атлантикой и Аппалачскими горами. От Массачусетса на севере до Джорджии на юге — тринадцать английских колоний, около 2,5 миллиона жителей.",
    },
  },
  boston: {
    name: { pl: "Boston", ru: "Бостон" },
    text: {
      pl: "Port w Massachusetts. 16 grudnia 1773 roku koloniści przebrani za Indian wyrzucili do morza 342 skrzynie herbaty — „bostońskie picie herbaty”. Tu zaczął się bunt.",
      ru: "Порт в Массачусетсе. 16 декабря 1773 года колонисты, переодетые индейцами, выбросили в море 342 ящика чая — «Бостонское чаепитие». Здесь начался бунт.",
    },
    pin: [238, 66],
  },
  filadelfia: {
    name: { pl: "Filadelfia", ru: "Филадельфия" },
    text: {
      pl: "Największe miasto kolonii. Tu obradował Kongres Kontynentalny (od 1774), tu 4 lipca 1776 roku uchwalono Deklarację niepodległości, a w 1787 roku — konstytucję.",
      ru: "Крупнейший город колоний. Здесь заседал Континентальный конгресс (с 1774), здесь 4 июля 1776 года приняли Декларацию независимости, а в 1787 году — конституцию.",
    },
    pin: [190, 128],
  },
  saratoga: {
    name: { pl: "Saratoga", ru: "Саратога" },
    text: {
      pl: "W 1777 roku Amerykanie zmusili tu do kapitulacji całą armię brytyjską. Po tym zwycięstwie Francja uznała Stany Zjednoczone i przystąpiła do wojny.",
      ru: "В 1777 году американцы вынудили здесь капитулировать целую британскую армию. После этой победы Франция признала Соединённые Штаты и вступила в войну.",
    },
    pin: [180, 50],
  },
  westpoint: {
    name: { pl: "West Point", ru: "Вест-Пойнт" },
    text: {
      pl: "Twierdza nad rzeką Hudson, której umocnienia zaprojektował Tadeusz Kościuszko. Dziś mieści się tu słynna akademia wojskowa.",
      ru: "Крепость на реке Гудзон, укрепления которой спроектировал Тадеуш Костюшко. Сегодня здесь находится знаменитая военная академия.",
    },
    pin: [204, 94],
  },
  yorktown: {
    name: { pl: "Yorktown", ru: "Йорктаун" },
    text: {
      pl: "W 1781 roku armia Washingtona i wojska francuskie okrążyły tu Brytyjczyków, a francuska flota odcięła im odwrót morzem. Kapitulacja Yorktown zakończyła wojnę.",
      ru: "В 1781 году армия Вашингтона и французские войска окружили здесь британцев, а французский флот отрезал им отход морем. Капитуляция Йорктауна завершила войну.",
    },
    pin: [200, 190],
  },
  savannah: {
    name: { pl: "Savannah", ru: "Саванна" },
    text: {
      pl: "Port w Georgii. Podczas szturmu na miasto w 1779 roku został śmiertelnie ranny Kazimierz Pułaski, dowódca amerykańskiej kawalerii.",
      ru: "Порт в Джорджии. Во время штурма города в 1779 году был смертельно ранен Казимир Пулавский, командир американской кавалерии.",
    },
    pin: [150, 272],
  },
  atlantyk: {
    name: { pl: "Ocean Atlantycki", ru: "Атлантический океан" },
    text: {
      pl: "Sześć tygodni żeglugi dzieliło kolonie od Londynu. Przez ocean płynęły brytyjskie wojska i podatkowana herbata — a potem francuska flota na pomoc kolonistom.",
      ru: "Шесть недель плавания отделяли колонии от Лондона. Через океан шли британские войска и обложенный налогом чай — а потом французский флот на помощь колонистам.",
    },
  },
};

const COAST = "M262 0 L250 22 L240 48 L232 76 L214 92 L206 112 L198 132 L204 160 L208 182 L196 206 L182 232 L172 258 L164 290 L176 320 L184 340";

export function ColoniesMap({ lang }: { lang: ContentLang }) {
  const t = (pl: string, ru: string) => (lang === "pl" ? pl : ru);
  const dot = (id: Part, x: number, y: number, label: string, dx: number, dy: number, tone: (id: Part, base: string) => string) => (
    <>
      <circle cx={x} cy={y} r={6} fill={tone(id, "#b91c1c")} stroke="#fff" strokeWidth={2} />
      <text x={x + dx} y={y + dy} fontSize={9} fontWeight={600} fill="#1f2937">
        {label}
      </text>
    </>
  );
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 300 340"
      maxWidth="max-w-[400px]"
      title={{ pl: "Trzynaście kolonii i wojna o niepodległość", ru: "Тринадцать колоний и война за независимость" }}
      labelOrder={["boston", "filadelfia", "saratoga", "westpoint", "yorktown", "savannah"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          {part("atlantyk", <rect x={0} y={0} width={300} height={340} fill={tone("atlantyk", "#bfe0f2")} />)}
          {/* the continent: everything west of the coast */}
          <path d={`M0 0 L262 0 ${COAST.slice(6)} L0 340 Z`} fill="#e7e5e4" stroke="#78716c" strokeWidth={1.5} />
          {/* the thirteen colonies: the strip between the Appalachians and the sea */}
          {part("kolonie", <path d={`M200 0 L262 0 ${COAST.slice(6)} L120 340 L112 300 L120 250 L130 200 L150 150 L160 100 L176 50 Z`} fill={tone("kolonie", "#fde68a")} stroke="#b45309" strokeWidth={1.5} />)}
          <path d="M176 50 L160 100 L150 150 L130 200 L120 250 L112 300 L120 340" fill="none" stroke="#78716c" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={30} y={40} fontSize={10} fontWeight={600} fill="#57534e">
            {t("Kanada (bryt.)", "Канада (брит.)")}
          </text>
          <text x={60} y={200} fontSize={9} fill="#57534e" transform="rotate(-70 60 200)">
            {t("Appalachy", "Аппалачи")}
          </text>
          <text x={212} y={250} fontSize={9} fontWeight={600} fill="#1e3a8a">
            {t("Ocean", "Атлантический")}
          </text>
          <text x={212} y={262} fontSize={9} fontWeight={600} fill="#1e3a8a">
            {t("Atlantycki", "океан")}
          </text>
          <text x={232} y={300} fontSize={9} fill="#1e3a8a">
            {t("→ do Londynu", "→ в Лондон")}
          </text>
          {part("saratoga", dot("saratoga", 180, 50, "1777", -38, 4, tone))}
          {part("boston", dot("boston", 238, 66, "1773", 14, 4, tone))}
          {part("westpoint", dot("westpoint", 204, 94, "🏰", -28, 5, tone))}
          {part("filadelfia", dot("filadelfia", 190, 128, "1776", -38, 4, tone))}
          {part("yorktown", dot("yorktown", 200, 190, "1781", -38, 4, tone))}
          {part("savannah", dot("savannah", 150, 272, "1779", -38, 4, tone))}
        </>
      )}
    />
  );
}
