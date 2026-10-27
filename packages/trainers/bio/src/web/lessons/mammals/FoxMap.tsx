// Block 1 of the mammals lesson: a fox from the side, with the features only mammals have. The milk
// glands and the diaphragm are drawn over it when chosen.
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "@portal/lessons";

type FoxPart = "fur" | "ear" | "whiskers" | "teeth" | "legs" | "tail" | "milk" | "diaphragm";

const PARTS: Record<FoxPart, MapPart> = {
  fur: {
    name: { pl: "Sierść", ru: "Шерсть" },
    text: {
      pl: "Okrywa włosowa to cecha tylko ssaków. Między włosami zostaje powietrze, które zatrzymuje ciepło. W skórze są też gruczoły potowe (pot chłodzi ciało) i łojowe (łój natłuszcza sierść).",
      ru: "Волосяной покров есть только у млекопитающих. Между волосами задерживается воздух, сохраняющий тепло. В коже есть и потовые железы (пот охлаждает тело), и сальные (сало смазывает шерсть).",
    },
    pin: [226, 40],
    to: [220, 106],
  },
  ear: {
    name: { pl: "Małżowina uszna", ru: "Ушная раковина" },
    text: {
      pl: "Zewnętrzna część ucha, którą mają tylko ssaki. Jak lejek zbiera dźwięki i kieruje je do ucha. Lis potrafi obracać uszami w stronę szelestu myszy.",
      ru: "Наружная часть уха, которая есть только у млекопитающих. Как воронка собирает звуки и направляет их в ухо. Лиса умеет поворачивать уши на шорох мыши.",
    },
    pin: [140, 20],
    to: [112, 50],
  },
  whiskers: {
    name: { pl: "Wibrysy (wąsy czuciowe)", ru: "Вибриссы (осязательные усы)" },
    text: {
      pl: "Długie, sztywne włosy na pysku. Działają jak czułki: pomagają wyczuć przeszkody w ciemności.",
      ru: "Длинные жёсткие волосы на морде. Работают как щупы: помогают нащупать препятствия в темноте.",
    },
    pin: [28, 40],
    to: [44, 98],
  },
  teeth: {
    name: { pl: "Zróżnicowane zęby", ru: "Разные зубы" },
    text: {
      pl: "Ssaki mają zęby różnego kształtu: siekacze, kły, przedtrzonowce i trzonowce. Ich wygląd zdradza, czym zwierzę się żywi — zobacz trzeci blok.",
      ru: "У млекопитающих зубы разной формы: резцы, клыки, малые и большие коренные. По ним видно, чем питается животное, — посмотри третий блок.",
    },
    pin: [30, 168],
    to: [58, 120],
  },
  legs: {
    name: { pl: "Kończyny pod tułowiem", ru: "Конечности под туловищем" },
    text: {
      pl: "Nogi ssaka wyrastają pod ciałem, a nie po bokach jak u jaszczurki. Ciało jest uniesione nad ziemią, więc ssak może szybko i długo biegać.",
      ru: "Ноги млекопитающего расположены под телом, а не по бокам, как у ящерицы. Тело поднято над землёй, поэтому млекопитающее может бегать быстро и долго.",
    },
    pin: [116, 236],
    to: [144, 206],
  },
  tail: {
    name: { pl: "Ogon", ru: "Хвост" },
    text: {
      pl: "U lisa puszysty ogon pomaga utrzymać równowagę przy skokach, a zimą lis okrywa nim nos podczas snu.",
      ru: "Пушистый хвост помогает лисе держать равновесие в прыжке, а зимой во сне она укрывает им нос.",
    },
    pin: [378, 90],
    to: [342, 136],
  },
  milk: {
    name: { pl: "Gruczoły mlekowe", ru: "Молочные железы" },
    text: {
      pl: "Najważniejsza cecha ssaków — od niej pochodzi ich nazwa. Samica karmi młode mlekiem, które wytwarzają gruczoły mlekowe na brzuchu.",
      ru: "Главный признак млекопитающих — от него и их название. Самка кормит детёнышей молоком, которое вырабатывают молочные железы на брюхе.",
    },
  },
  diaphragm: {
    name: { pl: "Przepona", ru: "Диафрагма" },
    text: {
      pl: "Mięsień oddzielający klatkę piersiową (z płucami i sercem) od jamy brzusznej. Kurcząc się, pomaga nabierać powietrza. Serce ssaka ma cztery części, więc krew bogata w tlen nie miesza się z ubogą.",
      ru: "Мышца, отделяющая грудную полость (с лёгкими и сердцем) от брюшной. Сокращаясь, помогает вдыхать воздух. Сердце млекопитающего четырёхкамерное, поэтому богатая кислородом кровь не смешивается с бедной.",
    },
  },
};

const ORANGE = "#ea580c";

export function FoxMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<FoxPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 250"
      title={{ pl: "Cechy ssaka na przykładzie lisa", ru: "Признаки млекопитающего на примере лисы" }}
      labelOrder={["fur", "ear", "whiskers", "teeth", "legs", "tail"]}
      art={({ part, tone }) => (
        <>
          {part(
            "tail",
            <g>
              <path d="M286 126 C 330 120, 370 140, 384 170 C 360 176, 320 164, 286 148 Z" fill={tone("tail", ORANGE)} stroke="#9a3412" strokeWidth={2} />
              <path d="M372 160 C 378 164, 382 168, 384 170 C 374 172, 366 170, 360 168 Z" fill="white" />
            </g>,
          )}
          {part(
            "legs",
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              {[
                "M146 164 L 142 204 L 136 222",
                "M168 166 L 170 206 L 166 222",
                "M262 160 L 270 196 L 262 222",
                "M282 154 L 296 192 L 290 222",
              ].map((d) => (
                <g key={d}>
                  <path d={d} stroke={tone("legs", "#7c2d12")} strokeWidth={11} />
                  <path d={d} stroke="transparent" strokeWidth={20} />
                </g>
              ))}
            </g>,
          )}
          {part(
            "fur",
            <g>
              <ellipse cx={216} cy={136} rx={84} ry={36} fill={tone("fur", ORANGE)} stroke="#9a3412" strokeWidth={2} />
              <ellipse cx={206} cy={156} rx={60} ry={14} fill={tone("fur", "#fed7aa")} />
              <path d="M90 74 C 120 66, 150 86, 150 110 C 150 132, 120 140, 100 132 L 50 118 C 44 116, 44 106, 50 104 Z" fill={tone("fur", ORANGE)} stroke="#9a3412" strokeWidth={2} />
              <path d="M54 116 L 98 128 C 110 132, 124 128, 130 120" fill={tone("fur", "#fff7ed")} stroke="none" />
              <path d="M140 100 C 150 112, 156 126, 152 140 L 170 130 Z" fill={tone("fur", ORANGE)} />
            </g>,
          )}
          {part("ear", <path d="M98 76 L 112 36 L 128 80 Z" fill={tone("ear", "#c2410c")} stroke="#7c2d12" strokeWidth={2} />)}
          {part(
            "teeth",
            <g>
              <path d="M52 118 L 96 124" stroke="#7c2d12" strokeWidth={2} />
              {[58, 66, 74, 82].map((x, i) => (
                <path key={x} d={`M${x} ${119 + i} l 3 ${i === 0 ? 8 : 4} l 3 ${i === 0 ? -8 : -4} Z`} fill={tone("teeth", "white")} stroke="#a8a29e" strokeWidth={0.8} />
              ))}
              <rect x={50} y={110} width={50} height={20} fill="transparent" />
            </g>,
          )}
          {part(
            "whiskers",
            <g fill="none" strokeLinecap="round">
              <path d="M58 106 L 28 96 M58 108 L 26 108 M60 110 L 30 120" stroke={tone("whiskers", "#1c1917")} strokeWidth={1.5} />
              <path d="M58 106 L 28 96 M58 108 L 26 108 M60 110 L 30 120" stroke="transparent" strokeWidth={10} />
            </g>,
          )}
          <circle cx={46} cy={109} r={5} fill="#1c1917" pointerEvents="none" />
          <ellipse cx={100} cy={94} rx={5} ry={3.5} fill="#1c1917" pointerEvents="none" />
        </>
      )}
      overlay={(active) => (
        <g pointerEvents="none">
          {active === "milk" && (
            <g>
              {[180, 204, 228, 252].map((x) => (
                <circle key={x} cx={x} cy={166} r={4.5} fill="#f9a8d4" stroke="#db2777" strokeWidth={1.5} />
              ))}
            </g>
          )}
          {active === "diaphragm" && (
            <g>
              <ellipse cx={176} cy={126} rx={26} ry={16} fill="#f9a8d4" stroke="#db2777" strokeWidth={1.5} />
              <path d="M170 136 c -6 -8, 2 -14, 6 -8 c 4 -6, 12 0, 6 8 l -6 8 Z" fill="#dc2626" />
              <path d="M206 104 C 196 124, 196 150, 206 170" fill="none" stroke="#7c3aed" strokeWidth={4} />
              <ellipse cx={246} cy={138} rx={30} ry={18} fill="#fde68a" stroke="#ca8a04" strokeWidth={1.5} opacity={0.9} />
            </g>
          )}
        </g>
      )}
    />
  );
}
