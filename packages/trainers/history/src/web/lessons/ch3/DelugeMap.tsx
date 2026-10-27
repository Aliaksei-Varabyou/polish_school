// Block 1 of the Deluge lesson: a schematic map of the Commonwealth in 1655–1660 — where the Swedes
// came from, where the szlachta gave up, where the tide turned. Each place explains itself when
// tapped; in "label it" mode the student matches names to pins.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "pomorze" | "inflanty" | "ujscie" | "kiejdany" | "warszawa" | "krakow" | "jasna-gora" | "lwow" | "warka" | "rakoczy" | "prusy" | "oliwa";

const PARTS: Record<Part, MapPart> = {
  pomorze: {
    name: {
      pl: "Najazd z Pomorza Szwedzkiego",
      ru: "Вторжение из Шведской Померании",
    },
    text: {
      pl: "Latem 1655 roku główna armia Karola X Gustawa weszła do Wielkopolski z Pomorza Szwedzkiego i ruszyła przez Warszawę na Kraków. Szwedów sprowadził zdrajca Hieronim Radziejowski.",
      ru: "Летом 1655 года главная армия Карла X Густава вошла в Великую Польшу из Шведской Померании и двинулась через Варшаву на Краков. Шведов привёл изменник Иероним Радзеёвский.",
    },
  },
  inflanty: {
    name: { pl: "Najazd z Inflant", ru: "Вторжение из Ливонии" },
    text: {
      pl: "Druga armia szwedzka wkroczyła na Litwę z Inflant. Litwa, wyczerpana wojną z Rosją, nie miała sił, żeby ją zatrzymać.",
      ru: "Вторая шведская армия вошла в Литву из Ливонии. Литва, истощённая войной с Россией, не имела сил её остановить.",
    },
  },
  ujscie: {
    name: { pl: "Ujście", ru: "Уйсьце" },
    text: {
      pl: "25 lipca 1655 roku pospolite ruszenie Wielkopolski poddało się Szwedom bez walki. Szlachta uznała Karola Gustawa za swojego władcę.",
      ru: "25 июля 1655 года великопольское ополчение сдалось шведам без боя. Шляхта признала Карла Густава своим государем.",
    },
    pin: [60, 150],
    to: [92, 122],
  },
  kiejdany: {
    name: { pl: "Kiejdany", ru: "Кейданы" },
    text: {
      pl: "Hetman wielki litewski Janusz Radziwiłł podpisał tu układ, w którym oddał Litwę pod władzę króla Szwecji.",
      ru: "Великий гетман литовский Януш Радзивилл подписал здесь договор, по которому отдал Литву под власть короля Швеции.",
    },
    pin: [330, 90],
    to: [296, 82],
  },
  warszawa: {
    name: { pl: "Warszawa", ru: "Варшава" },
    text: {
      pl: "Stolica poddała się Szwedom we wrześniu 1655 roku. Zamek Królewski został ograbiony, a Jan Kazimierz uciekł na Śląsk.",
      ru: "Столица сдалась шведам в сентябре 1655 года. Королевский замок был разграблен, а Ян Казимир бежал в Силезию.",
    },
  },
  krakow: {
    name: { pl: "Kraków", ru: "Краков" },
    text: {
      pl: "Dawna stolica broniła się trzy tygodnie pod wodzą Stefana Czarnieckiego, ale w październiku 1655 roku skapitulowała.",
      ru: "Старая столица три недели оборонялась под началом Стефана Чарнецкого, но в октябре 1655 года капитулировала.",
    },
  },
  "jasna-gora": {
    name: { pl: "Jasna Góra", ru: "Ясная Гора" },
    text: {
      pl: "Klasztor paulinów w Częstochowie bronił się przez sześć tygodni (listopad–grudzień 1655). Obroną kierował przeor Augustyn Kordecki. Szwedzi odeszli, a kraj uwierzył, że można ich pokonać.",
      ru: "Монастырь паулинов в Ченстохове оборонялся шесть недель (ноябрь–декабрь 1655). Обороной руководил настоятель Августин Кордецкий. Шведы ушли, а страна поверила, что их можно победить.",
    },
    pin: [100, 262],
    to: [140, 212],
  },
  lwow: {
    name: { pl: "Lwów", ru: "Львов" },
    text: {
      pl: "1 kwietnia 1656 roku Jan Kazimierz złożył w katedrze lwowskiej śluby: ogłosił Matkę Boską Królową Polski i obiecał poprawić los chłopów.",
      ru: "1 апреля 1656 года Ян Казимир принёс во львовском соборе обеты: провозгласил Богоматерь Королевой Польши и обещал улучшить участь крестьян.",
    },
    pin: [355, 262],
    to: [318, 240],
  },
  warka: {
    name: { pl: "Warka", ru: "Варка" },
    text: {
      pl: "Wiosną 1656 roku Stefan Czarniecki pobił tu Szwedów w otwartej bitwie — pierwsze takie zwycięstwo w czasie potopu. Wcześniej prowadził wojnę szarpaną: nagłe napady małych oddziałów.",
      ru: "Весной 1656 года Стефан Чарнецкий разбил здесь шведов в открытом бою — первая такая победа во время потопа. До этого он вёл партизанскую войну: внезапные налёты малых отрядов.",
    },
    pin: [280, 185],
    to: [236, 170],
  },
  rakoczy: {
    name: { pl: "Najazd Rakoczego", ru: "Вторжение Ракоци" },
    text: {
      pl: "W 1657 roku z Siedmiogrodu wkroczył książę Jerzy II Rakoczy, sojusznik Szwedów. Zgodnie z traktatem w Radnot miał dostać część Polski. Został pobity i wrócił z niczym.",
      ru: "В 1657 году из Трансильвании вторгся князь Дьёрдь II Ракоци, союзник шведов. По Раднотскому договору он должен был получить часть Польши. Был разбит и вернулся ни с чем.",
    },
  },
  prusy: {
    name: { pl: "Prusy Książęce", ru: "Княжеская Пруссия" },
    text: {
      pl: "Lenno Polski rządzone przez elektora brandenburskiego. W traktatach welawsko-bydgoskich (1657) Polska zrzekła się zwierzchnictwa nad Prusami, by odciągnąć elektora od Szwedów.",
      ru: "Лен Польши под властью бранденбургского курфюрста. По Велявско-Быдгощским трактатам (1657) Польша отказалась от верховной власти над Пруссией, чтобы оторвать курфюрста от шведов.",
    },
    pin: [255, 28],
    to: [228, 52],
  },
  oliwa: {
    name: { pl: "Oliwa", ru: "Олива" },
    text: {
      pl: "W klasztorze pod Gdańskiem 3 maja 1660 roku podpisano pokój kończący potop. Jan Kazimierz zrzekł się praw do tronu Szwecji; granice nie zmieniły się.",
      ru: "В монастыре под Гданьском 3 мая 1660 года подписали мир, завершивший потоп. Ян Казимир отказался от прав на шведский трон; границы не изменились.",
    },
    pin: [120, 28],
    to: [160, 58],
  },
};

const LAND = "#e7dcb8";
const LAND_LINE = "#9c8a5a";
const SWEDE = "#dc2626";

export function DelugeMap({ lang }: { lang: ContentLang }) {
  const route = (d: string, color: string, marker: string, dash?: string) => <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} markerEnd={`url(#${marker})`} />;
  // labelled places show their name only while chosen, so "label it" mode does not give them away
  const city = (x: number, y: number, label: string, color = "#1f2937", dx = 6, dy = 4, show = true) => (
    <>
      <circle cx={x} cy={y} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />
      {show && (
        <text x={x + dx} y={y + dy} fontSize={9} fontWeight={600} fill="#1f2937">
          {label}
        </text>
      )}
    </>
  );
  const pl = lang === "pl";
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 300"
      maxWidth="max-w-[560px]"
      title={{ pl: "Mapa potopu szwedzkiego", ru: "Карта Шведского потопа" }}
      labelOrder={["ujscie", "kiejdany", "jasna-gora", "lwow", "warka", "prusy", "oliwa"]}
      pinRadius={11}
      art={({ part, tone, active }) => (
        <>
          <defs>
            <marker id="deluge-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 0 L 10 5 L 0 10 Z" fill={SWEDE} />
            </marker>
            <marker id="deluge-arrow-violet" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#7c3aed" />
            </marker>
          </defs>
          <rect x={0} y={0} width={400} height={300} fill="#bfe0f2" />
          {/* the Commonwealth and its neighbours, very schematically */}
          <g fill={LAND} stroke={LAND_LINE} strokeWidth={1.5} strokeLinejoin="round">
            <path d="M40 300 L40 110 L120 96 L160 62 L200 54 L240 66 L290 48 L340 40 L398 60 L398 300 Z" />
          </g>
          {/* Pomorze Szwedzkie, Inflanty and Siedmiogród: the three doors the enemy used */}
          <g fill="#f3c6c6" stroke="#b91c1c" strokeWidth={1}>
            <path d="M0 300 L0 70 L60 62 L110 60 L120 96 L40 110 L40 300 Z" />
            <path d="M300 0 L400 0 L400 60 L340 40 L300 28 Z" />
            <path d="M200 300 L220 272 L270 268 L300 300 Z" />
          </g>
          <text x={14} y={92} fontSize={8} fill="#7f1d1d" fontWeight={600}>
            {pl ? "Pomorze Szwedzkie" : "Шведская Померания"}
          </text>
          <text x={312} y={16} fontSize={8} fill="#7f1d1d" fontWeight={600}>
            {pl ? "Inflanty" : "Ливония"}
          </text>
          <text x={226} y={290} fontSize={8} fill="#7f1d1d" fontWeight={600}>
            {pl ? "Siedmiogród" : "Трансильвания"}
          </text>
          {active === "prusy" && (
            <text x={204} y={48} fontSize={7} fill="#4b3f1d" fontWeight={600}>
              {pl ? "Prusy Książęce" : "Княж. Пруссия"}
            </text>
          )}
          <text x={300} y={130} fontSize={9} fill="#6b5a2e" fontStyle="italic">
            {pl ? "Litwa" : "Литва"}
          </text>
          <text x={150} y={22} fontSize={9} fill="#0c4a6e" fontStyle="italic">
            {pl ? "Morze Bałtyckie" : "Балтийское море"}
          </text>
          {/* the Vistula */}
          <path d="M178 236 C 205 215, 230 190, 222 150 C 214 120, 180 100, 162 64" fill="none" stroke="#60a5fa" strokeWidth={2.5} />
          {/* Prusy Książęce */}
          {part("prusy", <path d="M200 54 L240 66 L262 60 L256 40 L222 38 Z" fill={tone("prusy", "#d6c48f")} stroke={LAND_LINE} strokeWidth={1.5} />)}
          {/* invasion routes */}
          {part("pomorze", route("M60 112 L 92 122 C 150 128, 190 140, 218 150 C 205 180, 192 210, 180 230", tone("pomorze", SWEDE), "deluge-arrow-red"))}
          {part("inflanty", route("M330 46 C 318 60, 306 72, 298 80", tone("inflanty", SWEDE), "deluge-arrow-red"))}
          {part("rakoczy", route("M250 270 C 225 262, 202 252, 186 242", tone("rakoczy", "#7c3aed"), "deluge-arrow-violet", "6 4"))}
          {/* cities */}
          {part("ujscie", city(92, 122, pl ? "Ujście" : "Уйсьце", tone("ujscie", "#b45309"), -34, -6, active === "ujscie"))}
          {part("warszawa", city(218, 150, pl ? "Warszawa" : "Варшава", tone("warszawa", "#1f2937"), 8, 2))}
          {part("krakow", city(178, 236, pl ? "Kraków" : "Краков", tone("krakow", "#1f2937"), 8, 11))}
          {part(
            "jasna-gora",
            <g>
              <circle cx={140} cy={212} r={6} fill={tone("jasna-gora", "#059669")} stroke="#fff" strokeWidth={2} />
              {active === "jasna-gora" && (
                <text x={92} y={204} fontSize={9} fontWeight={600} fill="#065f46">
                  {pl ? "Jasna Góra" : "Ясная Гора"}
                </text>
              )}
            </g>,
          )}
          {part("lwow", city(318, 240, pl ? "Lwów" : "Львов", tone("lwow", "#b45309"), 8, 4, active === "lwow"))}
          {part("warka", city(236, 170, pl ? "Warka" : "Варка", tone("warka", "#059669"), 8, 4, active === "warka"))}
          {part("kiejdany", city(296, 82, pl ? "Kiejdany" : "Кейданы", tone("kiejdany", "#b45309"), -42, 14, active === "kiejdany"))}
          {part("oliwa", city(160, 58, pl ? "Oliwa" : "Олива", tone("oliwa", "#2563eb"), 8, -2, active === "oliwa"))}
        </>
      )}
    />
  );
}
