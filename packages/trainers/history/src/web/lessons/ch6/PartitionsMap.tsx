// Block 1 of the legions lesson: the lands of the former Commonwealth after the third partition
// (1795), split between Russia, Prussia and Austria. The drawing is schematic: the outline is the
// old Rzeczpospolita, the three fills are the three zabory, the dots are the cities to remember.
import { PartMap, type ArtKit, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "rosyjski" | "pruski" | "austriacki" | "warszawa" | "krakow" | "wilno" | "lwow" | "poznan" | "gdansk";

const PARTS: Record<Part, MapPart> = {
  rosyjski: {
    name: { pl: "zabór rosyjski", ru: "российская часть" },
    text: {
      pl: "Największy z trzech zaborów: Litwa, Białoruś, Ukraina i Wołyń z Wilnem. Rosjanie prowadzili rusyfikację — język rosyjski w urzędach, posłuszeństwo carowi.",
      ru: "Крупнейшая из трёх частей: Литва, Белоруссия, Украина и Волынь с Вильно. Россия проводила русификацию — русский язык в учреждениях, покорность царю.",
    },
    pin: [320, 150],
    to: [300, 140],
  },
  pruski: {
    name: { pl: "zabór pruski", ru: "прусская часть" },
    text: {
      pl: "Wielkopolska, Pomorze Gdańskie i Mazowsze z Warszawą. Prusacy prowadzili germanizację: niemiecki w szkołach i urzędach, niemieccy urzędnicy i osadnicy.",
      ru: "Великая Польша, Гданьское Поморье и Мазовия с Варшавой. Пруссаки проводили германизацию: немецкий язык в школах и учреждениях, немецкие чиновники и поселенцы.",
    },
    pin: [120, 100],
    to: [140, 112],
  },
  austriacki: {
    name: { pl: "zabór austriacki (Galicja)", ru: "австрийская часть (Галиция)" },
    text: {
      pl: "Małopolska z Krakowem, Lubelszczyzna i Ruś Czerwona ze Lwowem. Austriacy nazwali te ziemie Galicją i rządzili nimi z Wiednia.",
      ru: "Малая Польша с Краковом, Люблинщина и Червонная Русь со Львовом. Австрийцы назвали эти земли Галицией и управляли ими из Вены.",
    },
    pin: [200, 240],
    to: [190, 250],
  },
  warszawa: {
    name: { pl: "Warszawa", ru: "Варшава" },
    text: { pl: "Dawna stolica Rzeczypospolitej po III rozbiorze trafiła do Prus i stała się zwykłym prowincjonalnym miastem.", ru: "Бывшая столица Речи Посполитой после третьего раздела отошла к Пруссии и стала обычным провинциальным городом." },
    pin: [186, 148],
    to: [186, 148],
  },
  krakow: {
    name: { pl: "Kraków", ru: "Краков" },
    text: { pl: "Dawna stolica królów polskich w zaborze austriackim. W 1809 roku na dwa lata wróci do Polski — do Księstwa Warszawskiego.", ru: "Древняя столица польских королей в австрийской части. В 1809 году она на несколько лет вернётся в Польшу — в Варшавское герцогство." },
    pin: [150, 228],
    to: [150, 228],
  },
  wilno: {
    name: { pl: "Wilno", ru: "Вильно" },
    text: { pl: "Stolica dawnego Wielkiego Księstwa Litewskiego, teraz miasto cesarstwa rosyjskiego.", ru: "Столица бывшего Великого княжества Литовского, теперь город Российской империи." },
    pin: [290, 86],
    to: [290, 86],
  },
  lwow: {
    name: { pl: "Lwów", ru: "Львов" },
    text: { pl: "Stolica austriackiej Galicji.", ru: "Столица австрийской Галиции." },
    pin: [262, 232],
    to: [262, 232],
  },
  poznan: {
    name: { pl: "Poznań", ru: "Познань" },
    text: { pl: "Główne miasto Wielkopolski, w zaborze pruskim już od I rozbioru. Stąd w 1806 roku wybuchnie powstanie wielkopolskie.", ru: "Главный город Великой Польши, в прусской части уже с первого раздела. Отсюда в 1806 году начнётся Великопольское восстание." },
    pin: [108, 132],
    to: [108, 132],
  },
  gdansk: {
    name: { pl: "Gdańsk", ru: "Гданьск" },
    text: { pl: "Port nad Bałtykiem, przez który Polska wywoziła zboże; od 1793 roku w rękach Prus.", ru: "Порт на Балтике, через который Польша вывозила зерно; с 1793 года в руках Пруссии." },
    pin: [132, 66],
    to: [132, 66],
  },
};

const PRUSSIA = "#93c5fd";
const AUSTRIA = "#fde047";
const RUSSIA = "#86efac";
const LINE = "#44403c";

export function PartitionsMap({ lang }: { lang: ContentLang }) {
  const pl = lang === "pl";
  const city = (id: Part, x: number, y: number, { part, tone }: ArtKit<Part>) => part(id, <circle cx={x} cy={y} r={5} fill={tone(id, "#1f2937")} stroke="#fff" strokeWidth={1.5} />);
  const label = (x: number, y: number, text: string, size = 8) => (
    <text x={x} y={y} fontSize={size} fontWeight={600} fill="#1f2937" textAnchor="middle" pointerEvents="none">
      {text}
    </text>
  );
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 300"
      maxWidth="max-w-[520px]"
      title={{ pl: "Ziemie polskie po III rozbiorze (1795)", ru: "Польские земли после третьего раздела (1795)" }}
      labelOrder={["pruski", "austriacki", "rosyjski", "warszawa", "krakow", "wilno", "poznan", "gdansk", "lwow"]}
      pinRadius={10}
      overlay={() => (
        <>
          {label(140, 112, pl ? "PRUSY" : "ПРУССИЯ", 10)}
          {label(300, 140, pl ? "ROSJA" : "РОССИЯ", 10)}
          {label(190, 254, pl ? "AUSTRIA — Galicja" : "АВСТРИЯ — Галиция", 10)}
          {label(186, 140, pl ? "Warszawa" : "Варшава")}
          {label(150, 220, pl ? "Kraków" : "Краков")}
          {label(290, 78, pl ? "Wilno" : "Вильно")}
          {label(262, 222, pl ? "Lwów" : "Львов")}
          {label(108, 124, pl ? "Poznań" : "Познань")}
          {label(132, 58, pl ? "Gdańsk" : "Гданьск")}
        </>
      )}
      art={(kit) => (
        <>
          <rect x={0} y={0} width={400} height={300} fill="#f5f5f4" />
          {/* the Baltic in the north-west corner */}
          <path d="M0 0 L190 0 L150 40 L96 70 L40 120 L0 130 Z" fill="#bfe0f2" />
          <text x={60} y={40} fontSize={9} fill="#1e40af" fontStyle="italic">
            {pl ? "Morze Bałtyckie" : "Балтийское море"}
          </text>
          <g stroke={LINE} strokeWidth={1.4} strokeLinejoin="round">
            {kit.part("pruski", <path d="M70 90 L120 50 L200 40 L215 60 L205 120 L195 185 L130 195 L80 200 L60 140 Z" fill={kit.tone("pruski", PRUSSIA)} />)}
            {kit.part("austriacki", <path d="M80 200 L130 195 L195 185 L240 200 L300 215 L290 270 L200 262 L120 250 Z" fill={kit.tone("austriacki", AUSTRIA)} />)}
            {kit.part("rosyjski", <path d="M200 40 L300 30 L380 60 L390 150 L350 220 L300 215 L240 200 L195 185 L205 120 L215 60 Z" fill={kit.tone("rosyjski", RUSSIA)} />)}
            {/* the border of the Commonwealth before the partitions */}
            <path d="M70 90 L120 50 L200 40 L300 30 L380 60 L390 150 L350 220 L300 215 L290 270 L200 262 L120 250 L80 200 L60 140 Z" fill="none" stroke="#7f1d1d" strokeWidth={2.5} strokeDasharray="6 4" />
          </g>
          {city("warszawa", 186, 148, kit)}
          {city("krakow", 150, 228, kit)}
          {city("wilno", 290, 86, kit)}
          {city("lwow", 262, 232, kit)}
          {city("poznan", 108, 132, kit)}
          {city("gdansk", 132, 66, kit)}
          {/* legend */}
          <g transform="translate(6 262)">
            <rect width={210} height={34} rx={4} fill="#fff" opacity={0.9} />
            <path d="M6 9 L22 9" stroke="#7f1d1d" strokeWidth={2.5} strokeDasharray="4 3" />
            <text x={26} y={11.5} fontSize={6.5} fill="#1f2937">
              {pl ? "granice Rzeczypospolitej przed 1772 r." : "границы Речи Посполитой до 1772 г."}
            </text>
            {[
              [PRUSSIA, pl ? "zabór pruski" : "прусская часть"],
              [AUSTRIA, pl ? "zabór austriacki" : "австрийская часть"],
              [RUSSIA, pl ? "zabór rosyjski" : "российская часть"],
            ].map(([c, t], i) => (
              <g key={c} transform={`translate(${6 + i * 68} 17)`}>
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
