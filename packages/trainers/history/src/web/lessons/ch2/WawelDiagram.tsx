// Block 3 of the Polish Renaissance lesson: Wawel hill drawn schematically — the castle with its
// arcaded courtyard, the cathedral, the golden-domed Sigismund Chapel and a tapestry (arras).
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "zamek" | "dziedziniec" | "katedra" | "kaplica" | "arras" | "wisla";

const PARTS: Record<Part, MapPart> = {
  zamek: {
    name: { pl: "Zamek królewski", ru: "Королевский замок" },
    text: {
      pl: "Gotycki zamek przebudowany w latach 1507–1536 przez włoskich architektów Zygmunta Starego — Franciszka Florentczyka i Bartolomea Berrecciego — w stylu renesansowym.",
      ru: "Готический замок, перестроенный в 1507–1536 годах итальянскими архитекторами Сигизмунда Старого — Франческо Флорентийцем и Бартоломео Берреччи — в стиле Возрождения.",
    },
    pin: [340, 28],
    to: [320, 44],
  },
  dziedziniec: {
    name: { pl: "Dziedziniec arkadowy", ru: "Аркадный двор" },
    text: {
      pl: "Serce zamku: dziedziniec otoczony trzema piętrami krużganków (arkad). Tu odbywały się turnieje i uroczystości dworskie. Najpiękniejszy renesansowy dziedziniec na północ od Alp.",
      ru: "Сердце замка: двор, окружённый тремя ярусами галерей (аркад). Здесь проходили турниры и придворные торжества. Самый красивый ренессансный двор к северу от Альп.",
    },
    pin: [280, 150],
    to: [280, 100],
  },
  katedra: {
    name: { pl: "Katedra wawelska", ru: "Вавельский собор" },
    text: {
      pl: "Gotycka katedra, miejsce koronacji i pochówku królów Polski. Dzwon Zygmunt z 1520 roku zawieszono w jednej z jej wież.",
      ru: "Готический собор, место коронации и погребения королей Польши. Колокол «Сигизмунд» 1520 года подвесили в одной из его башен.",
    },
    pin: [60, 30],
    to: [95, 60],
  },
  kaplica: {
    name: { pl: "Kaplica Zygmuntowska", ru: "Сигизмундова капелла" },
    text: {
      pl: "Kaplica grobowa Jagiellonów przy katedrze, zbudowana w latach 1519–1533 przez Bartolomea Berrecciego. Złota kopuła to symbol polskiego renesansu — „perła renesansu na północ od Alp”.",
      ru: "Усыпальница Ягеллонов при соборе, построенная в 1519–1533 годах Бартоломео Берреччи. Золотой купол — символ польского Возрождения, «жемчужина Ренессанса к северу от Альп».",
    },
    pin: [150, 150],
    to: [166, 96],
  },
  arras: {
    name: { pl: "Arrasy wawelskie", ru: "Вавельские аррасы" },
    text: {
      pl: "Ogromne tkaniny ścienne ze scenami biblijnymi, zwierzętami i herbami, zamówione przez Zygmunta Augusta w Brukseli. Było ich ponad 350; zachowało się około 140.",
      ru: "Огромные настенные ткани с библейскими сценами, животными и гербами, заказанные Сигизмундом Августом в Брюсселе. Их было больше 350; сохранилось около 140.",
    },
    pin: [384, 150],
    to: [382, 100],
  },
  wisla: {
    name: { pl: "Wisła pod Wawelem", ru: "Висла под Вавелем" },
    text: {
      pl: "Wzgórze wawelskie wznosi się nad Wisłą. U jego stóp, według legendy, w Smoczej Jamie mieszkał smok.",
      ru: "Вавельский холм возвышается над Вислой. У его подножия, по легенде, в Драконьей пещере жил дракон.",
    },
    pin: [40, 222],
    to: [80, 222],
  },
};

export function WawelDiagram({ lang }: { lang: ContentLang }) {
  const t = (pl: string, ru: string) => (lang === "pl" ? pl : ru);
  const arches = (y: number, fill: string) =>
    [0, 1, 2, 3, 4, 5].map((i) => (
      <path key={`${y}-${i}`} d={`M${218 + i * 21} ${y + 17} V ${y + 7} A 8.5 8.5 0 0 1 ${235 + i * 21} ${y + 7} V ${y + 17} Z`} fill={fill} stroke="#78350f" strokeWidth={1} />
    ));
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 240"
      maxWidth="max-w-[520px]"
      title={{ pl: "Wzgórze wawelskie", ru: "Вавельский холм" }}
      labelOrder={["zamek", "dziedziniec", "katedra", "kaplica", "arras", "wisla"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={400} height={240} fill="#e0f2fe" />
          {/* the hill and the river */}
          <path d="M0 210 C 30 150, 60 118, 90 114 L 350 114 C 380 118, 395 160, 400 210 Z" fill="#86efac" stroke="#15803d" strokeWidth={1.5} />
          {part("wisla", <rect x={0} y={208} width={400} height={32} fill={tone("wisla", "#7dd3fc")} />)}
          <text x={340} y={228} fontSize={9} fill="#1e3a8a" fontStyle="italic">
            {t("Wisła", "Висла")}
          </text>
          {/* the cathedral: nave with two towers */}
          {part(
            "katedra",
            <g>
              <rect x={82} y={62} width={74} height={52} fill={tone("katedra", "#fecaca")} stroke="#7f1d1d" strokeWidth={1.5} />
              <path d="M78 62 L 119 44 L 160 62 Z" fill={tone("katedra", "#991b1b")} />
              <rect x={70} y={40} width={16} height={74} fill={tone("katedra", "#fca5a5")} stroke="#7f1d1d" strokeWidth={1.5} />
              <path d="M68 40 L 78 20 L 88 40 Z" fill="#7f1d1d" />
              <rect x={126} y={48} width={14} height={66} fill={tone("katedra", "#fca5a5")} stroke="#7f1d1d" strokeWidth={1.5} />
              <path d="M124 48 L 133 30 L 142 48 Z" fill="#7f1d1d" />
            </g>,
          )}
          <text x={96} y={130} fontSize={8} fill="#7f1d1d" fontWeight={600}>
            {t("katedra", "собор")}
          </text>
          {/* the Sigismund Chapel with the golden dome */}
          {part(
            "kaplica",
            <g>
              <rect x={150} y={86} width={32} height={28} fill={tone("kaplica", "#fef3c7")} stroke="#92400e" strokeWidth={1.5} />
              <path d="M150 86 A 16 16 0 0 1 182 86 Z" fill={tone("kaplica", "#facc15")} stroke="#92400e" strokeWidth={1.5} />
              <rect x={163} y={62} width={6} height={10} fill="#facc15" stroke="#92400e" strokeWidth={1} />
              <path d="M166 62 V 56 M163 59 H 169" stroke="#92400e" strokeWidth={1.2} />
            </g>,
          )}
          <text x={146} y={130} fontSize={7} fill="#92400e" fontWeight={600}>
            {t("Kaplica Zygm.", "капелла")}
          </text>
          {/* the castle with the arcaded courtyard */}
          {part(
            "zamek",
            <g>
              <rect x={200} y={44} width={160} height={70} fill={tone("zamek", "#fde68a")} stroke="#78350f" strokeWidth={1.5} />
              <path d="M196 44 L 280 26 L 364 44 Z" fill={tone("zamek", "#b45309")} />
              <rect x={196} y={30} width={12} height={84} fill={tone("zamek", "#fcd34d")} stroke="#78350f" strokeWidth={1.5} />
              <rect x={352} y={30} width={12} height={84} fill={tone("zamek", "#fcd34d")} stroke="#78350f" strokeWidth={1.5} />
            </g>,
          )}
          {part(
            "dziedziniec",
            <g>
              <rect x={214} y={54} width={132} height={60} fill={tone("dziedziniec", "#fff7ed")} stroke="#78350f" strokeWidth={1} />
              {arches(54, tone("dziedziniec", "#fdba74"))}
              {arches(73, tone("dziedziniec", "#fdba74"))}
              {arches(92, tone("dziedziniec", "#fdba74"))}
            </g>,
          )}
          <text x={280} y={20} fontSize={8} textAnchor="middle" fill="#78350f" fontWeight={600}>
            {t("zamek królewski", "королевский замок")}
          </text>
          <text x={236} y={130} fontSize={8} fill="#78350f" fontWeight={600}>
            {t("dziedziniec arkadowy", "аркадный двор")}
          </text>
          {/* a tapestry hanging beside the castle */}
          {part(
            "arras",
            <g>
              <rect x={370} y={60} width={26} height={44} fill={tone("arras", "#a7f3d0")} stroke="#065f46" strokeWidth={1.5} />
              <rect x={374} y={64} width={18} height={36} fill="none" stroke="#065f46" strokeWidth={0.8} />
              <circle cx={383} cy={82} r={5} fill="#065f46" />
              <path d="M370 104 L 372 109 L 376 104 L 380 109 L 384 104 L 388 109 L 392 104 L 396 109" fill="none" stroke="#065f46" strokeWidth={1} />
              <rect x={368} y={56} width={30} height={4} fill="#065f46" />
            </g>,
          )}
          <text x={362} y={130} fontSize={7} fill="#065f46" fontWeight={600}>
            {t("arras", "аррас")}
          </text>
        </>
      )}
    />
  );
}
