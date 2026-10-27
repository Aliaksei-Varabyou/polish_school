// Block 3 of the Reformation lesson: a schematic map of Europe's confessions around 1560. Each
// region explains which faith prevailed there and why; in "label it" mode the student places
// the names of the countries.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "england" | "scotland" | "scandinavia" | "germanyN" | "netherlands" | "switzerland" | "france" | "iberia" | "italy" | "poland" | "austria" | "russia" | "ireland";

const PARTS: Record<Part, MapPart> = {
  england: {
    name: { pl: "Anglia", ru: "Англия" },
    text: { pl: "Anglikanizm. Henryk VIII zerwał z papieżem (akt supremacji 1534) i sam stanął na czele Kościoła w Anglii.", ru: "Англиканство. Генрих VIII порвал с папой (Акт о супрематии 1534) и сам встал во главе церкви в Англии." },
    pin: [100, 150],
    to: [95, 112],
  },
  scotland: {
    name: { pl: "Szkocja", ru: "Шотландия" },
    text: { pl: "Kalwinizm. Reformację wprowadził tu w 1560 roku John Knox, uczeń Kalwina.", ru: "Кальвинизм. Реформацию здесь в 1560 году провёл Джон Нокс, ученик Кальвина." },
    pin: [60, 38],
    to: [88, 62],
  },
  scandinavia: {
    name: { pl: "Skandynawia", ru: "Скандинавия" },
    text: { pl: "Luteranizm. Królowie Danii i Szwecji przyjęli naukę Lutra i przejęli majątki Kościoła.", ru: "Лютеранство. Короли Дании и Швеции приняли учение Лютера и забрали имущество церкви." },
    pin: [222, 30],
    to: [222, 58],
  },
  germanyN: {
    name: { pl: "Niemcy północne", ru: "Северная Германия" },
    text: { pl: "Luteranizm. Ojczyzna reformacji — Wittenberga, Saksonia, Prusy. Pokój augsburski (1555): „czyj kraj, tego religia”.", ru: "Лютеранство. Родина Реформации — Виттенберг, Саксония, Пруссия. Аугсбургский мир (1555): «чья власть, того и вера»." },
    pin: [210, 135],
    to: [210, 135],
  },
  netherlands: {
    name: { pl: "Niderlandy", ru: "Нидерланды" },
    text: { pl: "Kalwinizm (na północy). Kalwini z Niderlandów wkrótce powstali przeciw katolickiemu królowi Hiszpanii.", ru: "Кальвинизм (на севере). Кальвинисты Нидерландов вскоре восстали против католического короля Испании." },
    pin: [118, 100],
    to: [153, 124],
  },
  switzerland: {
    name: { pl: "Szwajcaria", ru: "Швейцария" },
    text: { pl: "Kalwinizm. W Genewie od 1536 roku działał Jan Kalwin; stąd jego nauka rozeszła się po Europie.", ru: "Кальвинизм. В Женеве с 1536 года действовал Жан Кальвин; отсюда его учение разошлось по Европе." },
    pin: [150, 252],
    to: [168, 196],
  },
  france: {
    name: { pl: "Francja", ru: "Франция" },
    text: { pl: "Katolicyzm — ale z silną mniejszością kalwinów (hugenotów). Wojny religijne, noc św. Bartłomieja (1572), edykt nantejski (1598).", ru: "Католицизм — но с сильным меньшинством кальвинистов (гугенотов). Религиозные войны, Варфоломеевская ночь (1572), Нантский эдикт (1598)." },
    pin: [118, 170],
    to: [118, 170],
  },
  iberia: {
    name: { pl: "Hiszpania i Portugalia", ru: "Испания и Португалия" },
    text: { pl: "Katolicyzm. Reformacja tu nie dotarła; inkwizycja ścigała każde odstępstwo od wiary.", ru: "Католицизм. Реформация сюда не дошла; инквизиция преследовала любое отступление от веры." },
    pin: [88, 252],
    to: [88, 252],
  },
  italy: {
    name: { pl: "Włochy", ru: "Италия" },
    text: { pl: "Katolicyzm. Siedziba papieża — Rzym; stąd ruszyła odpowiedź na reformację.", ru: "Католицизм. Резиденция папы — Рим; отсюда начался ответ на Реформацию." },
    pin: [222, 236],
    to: [222, 236],
  },
  poland: {
    name: { pl: "Polska", ru: "Польша" },
    text: { pl: "Katolicyzm, ale część szlachty przyjęła luteranizm lub kalwinizm. Rzeczpospolita słynęła z tolerancji religijnej.", ru: "Католицизм, но часть шляхты приняла лютеранство или кальвинизм. Речь Посполитая славилась религиозной терпимостью." },
    pin: [290, 140],
    to: [290, 140],
  },
  austria: {
    name: { pl: "Niemcy południowe i Austria", ru: "Южная Германия и Австрия" },
    text: { pl: "Katolicyzm. Bawaria i ziemie Habsburgów pozostały przy papieżu.", ru: "Католицизм. Бавария и земли Габсбургов остались с папой." },
    pin: [225, 180],
    to: [225, 180],
  },
  russia: {
    name: { pl: "Rosja", ru: "Россия" },
    text: { pl: "Prawosławie — Kościół wschodni, oddzielony od Rzymu już od 1054 roku. Reformacja go nie dotyczyła.", ru: "Православие — восточная церковь, отделённая от Рима ещё с 1054 года. Реформация её не касалась." },
    pin: [350, 110],
    to: [350, 110],
  },
  ireland: {
    name: { pl: "Irlandia", ru: "Ирландия" },
    text: { pl: "Katolicyzm. Mimo rządów angielskich Irlandczycy pozostali katolikami.", ru: "Католицизм. Несмотря на английское правление, ирландцы остались католиками." },
    pin: [44, 160],
    to: [46, 106],
  },
};

const LUTH = "#60a5fa";
const CALV = "#a78bfa";
const ANGL = "#f87171";
const CATH = "#fbbf24";
const ORTH = "#a8a29e";
const LINE = "#1f2937";

const LEGEND: { color: string; name: Record<ContentLang, string> }[] = [
  { color: LUTH, name: { pl: "luteranizm", ru: "лютеранство" } },
  { color: CALV, name: { pl: "kalwinizm", ru: "кальвинизм" } },
  { color: ANGL, name: { pl: "anglikanizm", ru: "англиканство" } },
  { color: CATH, name: { pl: "katolicyzm", ru: "католицизм" } },
  { color: ORTH, name: { pl: "prawosławie", ru: "православие" } },
];

/** country names drawn in explore mode only; the "label it" mode must not give them away */
const NAMES: [Part, number, number][] = [
  ["england", 95, 118],
  ["scotland", 90, 66],
  ["ireland", 46, 108],
  ["scandinavia", 224, 56],
  ["germanyN", 212, 150],
  ["netherlands", 154, 128],
  ["france", 112, 182],
  ["iberia", 90, 252],
  ["italy", 206, 216],
  ["poland", 290, 148],
  ["austria", 222, 184],
  ["russia", 350, 112],
];

export function ConfessionsMap({ lang }: { lang: ContentLang }) {
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 300"
      maxWidth="max-w-[520px]"
      title={{ pl: "Wyznania w Europie około 1560 roku", ru: "Исповедания в Европе около 1560 года" }}
      labelOrder={["england", "scotland", "scandinavia", "germanyN", "netherlands", "switzerland", "france", "iberia", "italy", "poland"]}
      pinRadius={11}
      overlay={() => (
        <g fill={LINE} fontSize={7} fontWeight={600} textAnchor="middle" pointerEvents="none" stroke="#fff" strokeWidth={2.5} paintOrder="stroke" strokeLinejoin="round">
          {NAMES.map(([id, x, y]) => (
            <text key={id} x={x} y={y}>
              {PARTS[id].name[lang]}
            </text>
          ))}
        </g>
      )}
      art={({ part, tone }) => (
        <g stroke={LINE} strokeWidth={1.2} strokeLinejoin="round">
          <rect x={0} y={0} width={400} height={300} fill="#bfe0f2" stroke="none" />
          <defs>
            <pattern id="cm-hug" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width={6} height={6} fill={CATH} />
              <rect width={1.5} height={6} fill={CALV} />
            </pattern>
            <pattern id="cm-pol" width={7} height={7} patternUnits="userSpaceOnUse">
              <rect width={7} height={7} fill={CATH} />
              <circle cx={3.5} cy={3.5} r={1.1} fill={LUTH} />
            </pattern>
          </defs>
          {part("russia", <path d="M270 60 L330 30 L400 20 L400 200 L330 175 L320 95 L250 100 Z" fill={tone("russia", ORTH)} />)}
          {part("scandinavia", <path d="M175 20 L250 10 L270 60 L250 100 L215 95 L195 60 Z M172 95 L192 92 L190 112 L168 110 Z" fill={tone("scandinavia", LUTH)} />)}
          {part("poland", <path d="M250 100 L320 95 L330 175 L275 190 L255 160 Z" fill={tone("poland", "url(#cm-pol)")} />)}
          {part("germanyN", <path d="M165 110 L250 100 L255 160 L172 162 L168 132 Z" fill={tone("germanyN", LUTH)} />)}
          {part("austria", <path d="M172 162 L255 160 L275 190 L190 200 L185 186 Z" fill={tone("austria", CATH)} />)}
          {/* the Balkans under the Ottomans: no part, just context */}
          <path d="M240 230 L275 190 L330 175 L360 260 L280 290 L265 262 Z" fill="#d6d3d1" />
          <text x={305} y={222} textAnchor="middle" fontSize={7} fill="#44403c" stroke="#fff" strokeWidth={2} paintOrder="stroke">
            {lang === "pl" ? "Imperium Osmańskie" : "Османская империя"}
          </text>
          {part("netherlands", <path d="M140 115 L165 110 L168 132 L148 140 Z" fill={tone("netherlands", CALV)} />)}
          {part("france", <path d="M90 135 L148 140 L172 162 L160 192 L150 206 L130 212 L50 215 L70 170 Z" fill={tone("france", "url(#cm-hug)")} />)}
          {part("switzerland", <path d="M150 192 L185 186 L190 200 L158 206 Z" fill={tone("switzerland", CALV)} />)}
          {part("italy", <path d="M185 200 L225 196 L240 230 L265 262 L255 280 L235 270 L215 240 L195 230 L180 215 Z" fill={tone("italy", CATH)} />)}
          {part("iberia", <path d="M50 215 L130 212 L140 240 L120 285 L60 290 L40 250 Z" fill={tone("iberia", CATH)} />)}
          {part("scotland", <path d="M70 45 L105 40 L112 80 L75 88 Z" fill={tone("scotland", CALV)} />)}
          {part("england", <path d="M75 88 L112 80 L118 125 L95 145 L70 130 Z" fill={tone("england", ANGL)} />)}
          {part("ireland", <path d="M30 85 L58 80 L62 120 L38 128 Z" fill={tone("ireland", CATH)} />)}
          {/* a few anchors of the story */}
          <g stroke="#fff" strokeWidth={2} paintOrder="stroke" fill={LINE} fontSize={7} fontWeight={600}>
            <circle cx={205} cy={122} r={2.5} stroke="none" />
            <text x={209} y={120}>Wittenberga</text>
            <circle cx={163} cy={196} r={2.5} stroke="none" />
            <text x={150} y={216}>{lang === "pl" ? "Genewa" : "Женева"}</text>
            <circle cx={215} cy={236} r={2.5} stroke="none" />
            <text x={219} y={234}>{lang === "pl" ? "Rzym" : "Рим"}</text>
          </g>
          {/* legend */}
          <g stroke="none">
            <rect x={294} y={234} width={102} height={62} rx={5} fill="#fff" opacity={0.92} />
            {LEGEND.map((l, i) => (
              <g key={l.color} transform={`translate(300 ${239 + i * 11})`}>
                <rect width={11} height={8} rx={1.5} fill={l.color} />
                <text x={15} y={7.5} fontSize={8} fill={LINE}>
                  {l.name[lang]}
                </text>
              </g>
            ))}
          </g>
        </g>
      )}
    />
  );
}
