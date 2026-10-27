// Block 2 of the Batory lesson: the three campaigns against Muscovy (1579 Połock, 1580 Wielkie Łuki,
// 1581–1582 Psków) and the truce of Jam Zapolski, on a schematic map of Livonia and the border.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "wilno" | "polock" | "luki" | "pskow" | "jam" | "inflanty" | "moskwa";

const PARTS: Record<Part, MapPart> = {
  wilno: {
    name: { pl: "Wilno — punkt wyjścia", ru: "Вильно — исходная точка" },
    text: {
      pl: "Stolica Litwy. Stąd Batory ruszał na kolejne wyprawy z wojskiem polsko-litewskim, piechotą wybraniecką i husarią.",
      ru: "Столица Литвы. Отсюда Баторий выступал в очередные походы с польско-литовским войском, выбранецкой пехотой и гусарией.",
    },
    pin: [60, 226],
    to: [110, 190],
  },
  polock: {
    name: { pl: "Połock — 1579", ru: "Полоцк — 1579" },
    text: {
      pl: "Pierwsza wyprawa. Twierdza nad Dźwiną, zajęta przez Iwana Groźnego w 1563 roku. Batory zdobył ją po trzech tygodniach oblężenia i odciął Moskwę od Inflant.",
      ru: "Первый поход. Крепость на Двине, занятая Иваном Грозным в 1563 году. Баторий взял её после трёх недель осады и отрезал Москву от Ливонии.",
    },
    pin: [236, 160],
    to: [200, 136],
  },
  luki: {
    name: { pl: "Wielkie Łuki — 1580", ru: "Великие Луки — 1580" },
    text: {
      pl: "Druga wyprawa. Batory nie poszedł do Inflant, lecz uderzył na twierdzę w głębi państwa moskiewskiego, na drodze do Moskwy.",
      ru: "Второй поход. Баторий не пошёл в Ливонию, а ударил по крепости в глубине московского государства, на пути к Москве.",
    },
    pin: [330, 130],
    to: [286, 108],
  },
  pskow: {
    name: { pl: "Psków — 1581–1582", ru: "Псков — 1581–1582" },
    text: {
      pl: "Trzecia wyprawa. Potężna twierdza z grubymi murami i silną załogą. Oblężenie przez całą zimę nie przyniosło zdobycia, ale zmusiło cara do rokowań.",
      ru: "Третий поход. Мощная крепость с толстыми стенами и сильным гарнизоном. Осада всю зиму не принесла взятия, но вынудила царя к переговорам.",
    },
    pin: [300, 24],
    to: [258, 48],
  },
  jam: {
    name: {
      pl: "Jam Zapolski — rozejm 1582",
      ru: "Ям-Запольский — перемирие 1582",
    },
    text: {
      pl: "W styczniu 1582 roku, przy pośrednictwie posła papieskiego, zawarto rozejm: Iwan Groźny oddał Inflanty i ziemię połocką. Wojna skończyła się zwycięstwem Batorego.",
      ru: "В январе 1582 года при посредничестве папского посла заключили перемирие: Иван Грозный отдал Ливонию и Полоцкую землю. Война закончилась победой Батория.",
    },
    pin: [170, 24],
    to: [226, 70],
  },
  inflanty: {
    name: { pl: "Inflanty", ru: "Ливония" },
    text: {
      pl: "Kraj nad Bałtykiem, o który toczyła się wojna. Iwan Groźny zajął jego dużą część w 1577 roku; po rozejmie wrócił do Rzeczypospolitej.",
      ru: "Страна на Балтике, за которую шла война. Иван Грозный занял большую её часть в 1577 году; после перемирия она вернулась к Речи Посполитой.",
    },
    pin: [40, 80],
    to: [100, 100],
  },
  moskwa: {
    name: {
      pl: "Państwo moskiewskie — Iwan IV Groźny",
      ru: "Московское государство — Иван IV Грозный",
    },
    text: {
      pl: "Car Iwan IV Groźny chciał zdobyć dostęp do Bałtyku przez Inflanty. Po trzech przegranych kampaniach musiał z nich zrezygnować.",
      ru: "Царь Иван IV Грозный хотел получить выход к Балтике через Ливонию. После трёх проигранных кампаний ему пришлось от неё отказаться.",
    },
    pin: [372, 226],
    to: [350, 196],
  },
};

const LINE = "#6b5a3a";

export function LivoniaMap({ lang }: { lang: ContentLang }) {
  const t = (pl: string, ru: string) => (lang === "pl" ? pl : ru);
  const city = (x: number, y: number, label: string, dx = 7, dy = 4, fort = false) => (
    <g>
      {fort ? <rect x={x - 5} y={y - 5} width={10} height={10} fill="#1f2937" stroke="#fff" strokeWidth={1.2} /> : <circle cx={x} cy={y} r={3.5} fill="#1f2937" stroke="#fff" strokeWidth={1.2} />}
      <text x={x + dx} y={y + dy} fontSize={9} fill="#1f2937" fontWeight={600}>
        {label}
      </text>
    </g>
  );
  const arrow = (d: string, color: string) => (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
    </g>
  );
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 260"
      maxWidth="max-w-[520px]"
      title={{
        pl: "Wyprawy Batorego na Moskwę",
        ru: "Походы Батория на Москву",
      }}
      labelOrder={["wilno", "polock", "luki", "pskow", "jam", "inflanty", "moskwa"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={400} height={260} fill="#f1f5f9" />
          {/* the Baltic in the top-left corner */}
          <path d="M0 0 H 150 C 120 40, 90 70, 60 130 L 0 150 Z" fill="#bfe0f2" />
          <text x={14} y={40} fontSize={9} fill="#1e3a8a" fontStyle="italic">
            {t("Bałtyk", "Балтика")}
          </text>
          <g stroke={LINE} strokeWidth={1.5} strokeLinejoin="round">
            {/* the Commonwealth: Lithuania and the Crown's north-east */}
            <path d="M0 150 L 60 130 L 150 110 L 190 150 L 170 200 L 180 260 L 0 260 Z" fill="#bbf7d0" />
            {/* Livonia */}
            {part("inflanty", <path d="M150 0 L 230 0 L 220 60 L 190 110 L 150 110 C 120 70, 135 30, 150 0 Z" fill={tone("inflanty", "#a5b4fc")} />)}
            {/* Muscovy */}
            {part("moskwa", <path d="M230 0 L 400 0 L 400 260 L 180 260 L 170 200 L 190 150 L 190 110 L 220 60 Z" fill={tone("moskwa", "#fecaca")} />)}
          </g>
          <text x={24} y={246} fontSize={10} fill="#14532d" fontWeight={700}>
            {t("LITWA", "ЛИТВА")}
          </text>
          <text x={150} y={50} fontSize={9} fill="#312e81" fontWeight={700}>
            {t("INFLANTY", "ЛИВОНИЯ")}
          </text>
          <text x={200} y={250} fontSize={9} fill="#7f1d1d" fontWeight={700}>
            {t("PAŃSTWO MOSKIEWSKIE", "МОСКОВСКОЕ ГОСУДАРСТВО")}
          </text>
          {/* the Dźwina */}
          <path d="M100 100 C 140 110, 180 130, 200 136 C 230 142, 260 150, 290 170" fill="none" stroke="#7dd3fc" strokeWidth={3} />
          {/* the three campaigns */}
          <text x={166} y={142} fontSize={7.5} fill="#991b1b" fontWeight={700}>
            1579
          </text>
          <text x={244} y={128} fontSize={7.5} fill="#9a3412" fontWeight={700}>
            1580
          </text>
          <text x={186} y={96} fontSize={7.5} fill="#5b21b6" fontWeight={700}>
            1581
          </text>
          {/* cities and fortresses */}
          {part("wilno", city(110, 190, t("Wilno", "Вильно"), -36, 12))}
          {city(100, 100, t("Ryga", "Рига"), 6, -4)}
          {part(
            "polock",
            <g>
              {arrow("M110 190 C 140 170, 170 150, 192 142", tone("polock", "#dc2626"))}
              {city(200, 136, t("Połock", "Полоцк"), 6, 12, true)}
            </g>,
          )}
          {part(
            "luki",
            <g>
              {arrow("M110 190 C 170 180, 230 140, 278 112", tone("luki", "#ea580c"))}
              {city(286, 108, t("Wielkie Łuki", "Великие Луки"), 8, 4, true)}
            </g>,
          )}
          {part(
            "pskow",
            <g>
              {arrow("M110 190 C 150 150, 200 90, 250 56", tone("pskow", "#7c3aed"))}
              {city(258, 48, t("Psków", "Псков"), 8, 4, true)}
            </g>,
          )}
          {part("jam", city(226, 70, t("Jam Zapolski", "Ям-Запольский"), -60, 12))}
          {city(360, 196, t("Moskwa", "Москва"), -42, 12)}
          {/* legend */}
          <g fontSize={7} fill="#334155">
            <rect x={300} y={10} width={9} height={9} fill="#1f2937" />
            <text x={312} y={17.5}>
              {t("twierdza moskiewska", "московская крепость")}
            </text>
            <path d="M300 28 H 309" stroke="#dc2626" strokeWidth={3} />
            <text x={312} y={31}>
              {t("wyprawa Batorego", "поход Батория")}
            </text>
          </g>
        </>
      )}
    />
  );
}
