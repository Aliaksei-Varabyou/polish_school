// Block 1 of the fish lesson: a fish from the side; gills and the swim bladder show through when chosen.
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "@portal/lessons";

type FishPart = "skin" | "tail" | "paired" | "unpaired" | "cover" | "lateral" | "gills" | "bladder";

const PARTS: Record<FishPart, MapPart> = {
  skin: {
    name: { pl: "Łuski i śluz", ru: "Чешуя и слизь" },
    text: {
      pl: "Ciało okrywają łuski ułożone dachówkowato, jak dachówki na dachu. Na nich jest śluz: zmniejsza tarcie o wodę i chroni przed drobnoustrojami. Ciało ma opływowy kształt — łatwo przecina wodę.",
      ru: "Тело покрыто чешуёй, уложенной черепицей, как на крыше. Поверх неё слизь: уменьшает трение о воду и защищает от микробов. Тело обтекаемое — легко рассекает воду.",
    },
    pin: [200, 210],
    to: [200, 150],
  },
  tail: {
    name: { pl: "Płetwa ogonowa", ru: "Хвостовой плавник" },
    text: {
      pl: "Główny „silnik” ryby. Ruchy ogona na boki odpychają wodę i pchają rybę do przodu.",
      ru: "Главный «мотор» рыбы. Движения хвоста из стороны в сторону отталкивают воду и толкают рыбу вперёд.",
    },
    pin: [376, 26],
    to: [356, 76],
  },
  paired: {
    name: { pl: "Płetwy parzyste", ru: "Парные плавники" },
    text: {
      pl: "Płetwy piersiowe i brzuszne — po jednej z każdej strony ciała. Służą do sterowania, skręcania i hamowania.",
      ru: "Грудные и брюшные плавники — по одному с каждой стороны тела. Служат для управления, поворотов и торможения.",
    },
    pin: [90, 206],
    to: [132, 160],
  },
  unpaired: {
    name: { pl: "Płetwy nieparzyste", ru: "Непарные плавники" },
    text: {
      pl: "Płetwa grzbietowa i odbytowa leżą w jednej linii ze środkiem ciała. Działają jak kil łodzi: nie pozwalają rybie przewracać się na bok.",
      ru: "Спинной и анальный плавники лежат по средней линии тела. Работают как киль лодки: не дают рыбе заваливаться на бок.",
    },
    pin: [272, 26],
    to: [218, 56],
  },
  cover: {
    name: { pl: "Pokrywa skrzelowa", ru: "Жаберная крышка" },
    text: {
      pl: "Kostna płytka po bokach głowy. Osłania delikatne skrzela, a jej ruchy pomagają przepompowywać przez nie wodę.",
      ru: "Костная пластинка по бокам головы. Прикрывает нежные жабры, а её движения помогают прокачивать через них воду.",
    },
    pin: [80, 34],
    to: [112, 88],
  },
  lateral: {
    name: { pl: "Linia boczna", ru: "Боковая линия" },
    text: {
      pl: "Narząd zmysłu biegnący wzdłuż boków ciała. Wyczuwa ruchy wody i zmiany ciśnienia — ryba „czuje” przeszkody i zbliżającego się drapieżnika nawet w mętnej wodzie i w ciemności.",
      ru: "Орган чувств, проходящий вдоль боков тела. Улавливает движения воды и изменения давления — рыба «чувствует» препятствия и приближение хищника даже в мутной воде и в темноте.",
    },
    pin: [312, 190],
    to: [270, 109],
  },
  gills: {
    name: { pl: "Skrzela", ru: "Жабры" },
    text: {
      pl: "Pod pokrywą leżą czerwone, silnie ukrwione listki skrzelowe. Woda wpływa pyskiem, opływa skrzela i wypływa spod pokryw — krew pobiera z niej rozpuszczony tlen.",
      ru: "Под крышкой лежат красные, густо пронизанные сосудами жаберные лепестки. Вода входит через рот, омывает жабры и выходит из-под крышек — кровь забирает из неё растворённый кислород.",
    },
  },
  bladder: {
    name: { pl: "Pęcherz pławny", ru: "Плавательный пузырь" },
    text: {
      pl: "Cienkościenny worek wypełniony gazem. Zmieniając ilość gazu, ryba unosi się na wybranej głębokości bez machania płetwami. Zobacz to w trzecim bloku.",
      ru: "Тонкостенный мешок с газом. Меняя количество газа, рыба держится на нужной глубине, не работая плавниками. Посмотри на это в третьем блоке.",
    },
  },
};

const BODY = "M48 112 C 80 56, 200 46, 300 98 L 330 112 L 300 126 C 200 178, 80 168, 48 112 Z";

export function FishMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<FishPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 225"
      title={{ pl: "Budowa ryby", ru: "Строение рыбы" }}
      labelOrder={["tail", "paired", "unpaired", "cover", "lateral", "skin"]}
      art={({ part, tone }) => (
        <>
          <defs>
            <pattern id="fish-scales" width="14" height="10" patternUnits="userSpaceOnUse">
              <path d="M0 10 Q 7 0 14 10" fill="none" stroke="#0369a1" strokeWidth={0.8} opacity={0.45} />
            </pattern>
          </defs>
          {part("tail", <path d="M300 112 L 372 54 L 356 112 L 372 170 Z" fill={tone("tail", "#38bdf8")} stroke="#0369a1" strokeWidth={2} />)}
          {part(
            "unpaired",
            <g fill={tone("unpaired", "#38bdf8")} stroke="#0369a1" strokeWidth={2}>
              <path d="M168 64 C 186 26, 232 30, 252 80 Z" />
              <path d="M236 146 L 254 182 L 272 138 Z" />
            </g>,
          )}
          {part(
            "skin",
            <g>
              <path d={BODY} fill={tone("skin", "#7dd3fc")} stroke="#0369a1" strokeWidth={2.5} />
              <path d={BODY} fill="url(#fish-scales)" />
              <path d="M70 90 C 140 60, 230 66, 296 100" fill="none" stroke="#0369a1" strokeWidth={10} opacity={0.12} />
            </g>,
          )}
          {part(
            "paired",
            <g fill={tone("paired", "#0ea5e9")} stroke="#0369a1" strokeWidth={1.8}>
              <path d="M118 128 C 140 138, 152 160, 136 174 C 128 160, 118 148, 110 132 Z" />
              <path d="M180 154 L 184 188 L 202 156 Z" />
            </g>,
          )}
          {part(
            "cover",
            <g fill="none" strokeLinecap="round">
              <path d="M100 74 C 126 96, 126 132, 100 152" stroke={tone("cover", "#0369a1")} strokeWidth={4} />
              <path d="M100 74 C 126 96, 126 132, 100 152" stroke="transparent" strokeWidth={18} />
            </g>,
          )}
          {part(
            "lateral",
            <g fill="none">
              <path d="M124 102 C 180 96, 240 100, 300 110" stroke={tone("lateral", "#0c4a6e")} strokeWidth={2.5} strokeDasharray="5 4" />
              <path d="M124 102 C 180 96, 240 100, 300 110" stroke="transparent" strokeWidth={14} />
            </g>,
          )}
          <circle cx={76} cy={100} r={9} fill="white" stroke="#0369a1" strokeWidth={1.5} pointerEvents="none" />
          <circle cx={74} cy={100} r={5} fill="#0f172a" pointerEvents="none" />
          <path d="M50 116 L 62 118" stroke="#0369a1" strokeWidth={2} strokeLinecap="round" pointerEvents="none" />
        </>
      )}
      overlay={(active) => (
        <g pointerEvents="none">
          {active === "gills" && (
            <g>
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M${100 - i * 5} ${86 + i * 4} C ${118 - i * 4} ${102}, ${118 - i * 4} ${122}, ${100 - i * 5} ${140 - i * 4}`} fill="none" stroke="#dc2626" strokeWidth={6} />
              ))}
              {[0, 1, 2, 3].map((i) => (
                <path key={`f${i}`} d={`M${100 - i * 5} ${86 + i * 4} C ${118 - i * 4} ${102}, ${118 - i * 4} ${122}, ${100 - i * 5} ${140 - i * 4}`} fill="none" stroke="#fecaca" strokeWidth={1.5} strokeDasharray="2 3" />
              ))}
            </g>
          )}
          {active === "bladder" && <ellipse cx={196} cy={100} rx={56} ry={15} fill="#e2e8f0" stroke="#64748b" strokeWidth={2} opacity={0.95} />}
        </g>
      )}
    />
  );
}
