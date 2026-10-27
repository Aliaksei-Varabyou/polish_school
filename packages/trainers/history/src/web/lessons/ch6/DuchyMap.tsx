// Block 2 of the duchy lesson: the Duchy of Warsaw as created in 1807 (lands of the second and
// third Prussian partitions) and as enlarged in 1809 (lands of the third Austrian partition with
// Kraków), between Prussia, Russia and Austria. Schematic, not to scale.
import { PartMap, type ArtKit, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "k1807" | "k1809" | "warszawa" | "poznan" | "krakow" | "raszyn" | "gdansk" | "prusy" | "rosja" | "austria";

const PARTS: Record<Part, MapPart> = {
  k1807: {
    name: { pl: "Księstwo Warszawskie 1807", ru: "Варшавское герцогство 1807" },
    text: {
      pl: "Ziemie II i III zaboru pruskiego: Wielkopolska z Poznaniem, Mazowsze z Warszawą, ziemia kaliska, bydgoska, płocka i łomżyńska. Powstało na mocy pokoju w Tylży.",
      ru: "Земли второго и третьего прусских разделов: Великая Польша с Познанью, Мазовия с Варшавой, Калишская, Быдгощская, Плоцкая и Ломжинская земли. Создано по Тильзитскому миру.",
    },
    pin: [150, 72],
    to: [175, 90],
  },
  k1809: {
    name: { pl: "ziemie przyłączone w 1809", ru: "земли, присоединённые в 1809" },
    text: {
      pl: "Po zwycięskiej wojnie z Austrią (Raszyn, pokój w Schönbrunn) Księstwo powiększyło się o ziemie III zaboru austriackiego: Kraków, Lublin, Radom i Siedlce.",
      ru: "После победной войны с Австрией (Рашин, Шёнбруннский мир) герцогство расширилось за счёт земель третьего австрийского раздела: Краков, Люблин, Радом и Седльце.",
    },
    pin: [232, 230],
    to: [222, 212],
  },
  warszawa: {
    name: { pl: "Warszawa", ru: "Варшава" },
    text: { pl: "Stolica Księstwa. Tu obradował sejm i rezydował książę, gdy przyjeżdżał z Saksonii.", ru: "Столица герцогства. Здесь заседал сейм и жил князь, когда приезжал из Саксонии." },
    pin: [222, 108],
    to: [200, 122],
  },
  poznan: {
    name: { pl: "Poznań", ru: "Познань" },
    text: { pl: "Stolica Wielkopolski, gdzie w listopadzie 1806 roku Dąbrowski i Wybicki wezwali Polaków do powstania przeciw Prusom.", ru: "Столица Великой Польши, где в ноябре 1806 года Домбровский и Выбицкий призвали поляков к восстанию против Пруссии." },
    pin: [96, 116],
    to: [118, 104],
  },
  krakow: {
    name: { pl: "Kraków", ru: "Краков" },
    text: { pl: "Dawna stolica Polski, odzyskana od Austrii w 1809 roku. W 1815 roku stanie się Rzecząpospolitą Krakowską.", ru: "Древняя столица Польши, отвоёванная у Австрии в 1809 году. В 1815 году станет Краковской республикой." },
    pin: [128, 246],
    to: [148, 232],
  },
  raszyn: {
    name: { pl: "Raszyn (19 IV 1809)", ru: "Рашин (19 IV 1809)" },
    text: { pl: "Tu armia Księstwa pod wodzą księcia Józefa Poniatowskiego zatrzymała dwa razy liczniejsze wojska austriackie idące na Warszawę.", ru: "Здесь армия герцогства под командованием князя Юзефа Понятовского остановила вдвое более многочисленные австрийские войска, шедшие на Варшаву." },
    pin: [166, 152],
    to: [188, 136],
  },
  gdansk: {
    name: { pl: "Wolne Miasto Gdańsk", ru: "Вольный город Гданьск" },
    text: { pl: "Port nie wszedł do Księstwa: Napoleon zrobił z niego wolne miasto z francuską załogą.", ru: "Порт не вошёл в герцогство: Наполеон сделал его вольным городом с французским гарнизоном." },
    pin: [184, 44],
    to: [162, 40],
  },
  prusy: {
    name: { pl: "Prusy", ru: "Пруссия" },
    text: { pl: "Po klęsce pod Jeną Prusy straciły w Tylży ziemie polskie z dwóch ostatnich rozbiorów, ale zachowały Śląsk, Pomorze i Prusy Wschodnie.", ru: "После поражения при Йене Пруссия потеряла по Тильзитскому миру польские земли двух последних разделов, но сохранила Силезию, Померанию и Восточную Пруссию." },
    pin: [48, 170],
    to: [60, 150],
  },
  rosja: {
    name: { pl: "Rosja", ru: "Россия" },
    text: { pl: "Car Aleksander I zgodził się w Tylży na Księstwo, ale nie pozwolił nazwać go Polską. W 1812 roku Napoleon ruszy stąd na Moskwę.", ru: "Царь Александр I согласился в Тильзите на герцогство, но не позволил назвать его Польшей. В 1812 году Наполеон отсюда пойдёт на Москву." },
    pin: [350, 110],
    to: [340, 130],
  },
  austria: {
    name: { pl: "Austria (Galicja)", ru: "Австрия (Галиция)" },
    text: { pl: "W 1809 roku Austria zaatakowała Księstwo, przegrała i oddała ziemie III zaboru. Lwów i wschodnia Galicja pozostały austriackie.", ru: "В 1809 году Австрия напала на герцогство, проиграла и отдала земли третьего раздела. Львов и восточная Галиция остались австрийскими." },
    pin: [180, 282],
    to: [200, 272],
  },
};

const D1807 = "#93c5fd";
const D1809 = "#3b82f6";
const AROUND = "#e7e5e4";
const LINE = "#44403c";

export function DuchyMap({ lang }: { lang: ContentLang }) {
  const pl = lang === "pl";
  const city = (id: Part, x: number, y: number, { part, tone }: ArtKit<Part>) => part(id, <circle cx={x} cy={y} r={5} fill={tone(id, "#1f2937")} stroke="#fff" strokeWidth={1.5} />);
  const label = (x: number, y: number, text: string, size = 8, color = "#1f2937") => (
    <text x={x} y={y} fontSize={size} fontWeight={600} fill={color} textAnchor="middle" pointerEvents="none">
      {text}
    </text>
  );
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 300"
      maxWidth="max-w-[520px]"
      title={{ pl: "Księstwo Warszawskie w 1807 i 1809 roku", ru: "Варшавское герцогство в 1807 и 1809 годах" }}
      labelOrder={["k1807", "k1809", "warszawa", "poznan", "krakow", "raszyn", "gdansk", "prusy", "rosja", "austria"]}
      pinRadius={10}
      overlay={() => (
        <>
          {label(188, 82, pl ? "KSIĘSTWO 1807" : "ГЕРЦОГСТВО 1807", 9)}
          {label(222, 214, "1809", 9, "#fff")}
          {label(60, 150, pl ? "PRUSY" : "ПРУССИЯ", 10)}
          {label(340, 130, pl ? "ROSJA" : "РОССИЯ", 10)}
          {label(200, 274, pl ? "AUSTRIA — Galicja" : "АВСТРИЯ — Галиция", 10)}
          {label(200, 116, pl ? "Warszawa" : "Варшава")}
          {label(118, 98, pl ? "Poznań" : "Познань")}
          {label(148, 223, pl ? "Kraków" : "Краков")}
          {label(166, 139, pl ? "Raszyn" : "Рашин", 7, "#991b1b")}
          {label(162, 29, pl ? "Gdańsk" : "Гданьск", 7)}
        </>
      )}
      art={(kit) => (
        <>
          <rect x={0} y={0} width={400} height={300} fill="#bfe0f2" />
          <text x={40} y={22} fontSize={9} fill="#1e40af" fontStyle="italic">
            {pl ? "Morze Bałtyckie" : "Балтийское море"}
          </text>
          <g stroke={LINE} strokeWidth={1.4} strokeLinejoin="round">
            {kit.part("prusy", <path d="M0 70 L140 40 L200 20 L300 40 L250 70 L190 50 L110 70 L95 120 L120 160 L115 200 L60 220 L0 230 Z" fill={kit.tone("prusy", AROUND)} />)}
            {kit.part("rosja", <path d="M300 40 L400 20 L400 300 L330 300 L290 220 L300 150 L260 130 L250 70 Z" fill={kit.tone("rosja", AROUND)} />)}
            {kit.part("austria", <path d="M60 220 L115 200 L150 240 L220 250 L290 220 L330 300 L0 300 L0 230 Z" fill={kit.tone("austria", AROUND)} />)}
            {kit.part("k1807", <path d="M110 70 L190 50 L250 70 L260 130 L230 170 L170 180 L120 160 L95 120 Z" fill={kit.tone("k1807", D1807)} />)}
            {kit.part("k1809", <path d="M120 160 L170 180 L230 170 L260 130 L300 150 L290 220 L220 250 L150 240 L115 200 Z" fill={kit.tone("k1809", D1809)} />)}
            {kit.part("gdansk", <circle cx={162} cy={40} r={6} fill={kit.tone("gdansk", "#fde047")} />)}
          </g>
          {kit.part("raszyn", <path d="M188 128 L190.5 134 L197 134.5 L192 138.5 L193.5 145 L188 141.5 L182.5 145 L184 138.5 L179 134.5 L185.5 134 Z" fill={kit.tone("raszyn", "#dc2626")} stroke="#fff" strokeWidth={1} />)}
          {city("warszawa", 200, 122, kit)}
          {city("poznan", 118, 104, kit)}
          {city("krakow", 148, 232, kit)}
          {/* legend */}
          <g transform="translate(300 232)">
            <rect width={96} height={40} rx={4} fill="#fff" opacity={0.9} />
            {[
              [D1807, pl ? "Księstwo 1807" : "герцогство 1807"],
              [D1809, pl ? "przyłączone 1809" : "присоединено 1809"],
              ["#fde047", pl ? "wolne miasto" : "вольный город"],
              ["#dc2626", pl ? "bitwa" : "битва"],
            ].map(([c, t], i) => (
              <g key={c} transform={`translate(5 ${5 + i * 9})`}>
                <rect width={9} height={6} fill={c} stroke={LINE} strokeWidth={0.5} />
                <text x={12} y={5.8} fontSize={6.5} fill="#1f2937">
                  {t}
                </text>
              </g>
            ))}
          </g>
        </>
      )}
    />
  );
}
