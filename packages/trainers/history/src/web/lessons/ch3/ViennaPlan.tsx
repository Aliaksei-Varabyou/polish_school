// Block 2 of the Vienna lesson: a schematic plan of the battle of 12 September 1683 — the besieged
// city, the Turkish camp, the allied army coming down from the Kahlenberg and the charge of the
// hussars. Each part explains itself when tapped; in "label it" mode the student places the names.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "wieden" | "dunaj" | "kahlenberg" | "cesarscy" | "niemcy" | "polacy" | "turcy" | "szarza" | "namiot";

const PARTS: Record<Part, MapPart> = {
  wieden: {
    name: { pl: "Wiedeń", ru: "Вена" },
    text: {
      pl: "Stolica cesarza Leopolda I, oblegana przez Turków od lipca 1683 roku. Obroną dowodził hrabia Starhemberg; w połowie września mury były już podkopane i miasto mogło paść lada dzień.",
      ru: "Столица императора Леопольда I, осаждённая турками с июля 1683 года. Обороной командовал граф Штаремберг; к середине сентября стены были уже подкопаны, и город мог пасть со дня на день.",
    },
    pin: [330, 262],
    to: [312, 222],
  },
  dunaj: {
    name: { pl: "Dunaj", ru: "Дунай" },
    text: {
      pl: "Wielka rzeka, nad którą leży Wiedeń. Armia odsieczy przeprawiła się przez nią powyżej miasta, poza zasięgiem Turków.",
      ru: "Большая река, на которой стоит Вена. Армия помощи переправилась через неё выше города, вне досягаемости турок.",
    },
  },
  kahlenberg: {
    name: { pl: "Kahlenberg", ru: "Каленберг" },
    text: {
      pl: "Wzgórze w Lesie Wiedeńskim na północ od miasta. Rankiem 12 września Sobieski wysłuchał tu mszy, a potem armia sprzymierzonych ruszyła ze wzgórz w dół, ku obozowi tureckiemu.",
      ru: "Холм в Венском лесу к северу от города. Утром 12 сентября Собеский выслушал здесь мессу, а затем союзная армия двинулась с холмов вниз, к турецкому лагерю.",
    },
    pin: [60, 30],
    to: [96, 52],
  },
  cesarscy: {
    name: {
      pl: "Lewe skrzydło — wojska cesarskie",
      ru: "Левое крыло — императорские войска",
    },
    text: {
      pl: "Nad Dunajem, najbliżej miasta, nacierali Austriacy pod wodzą księcia Karola Lotaryńskiego. Oni pierwsi związali walką Turków.",
      ru: "Вдоль Дуная, ближе всего к городу, наступали австрийцы под командованием герцога Карла Лотарингского. Они первыми связали турок боем.",
    },
    pin: [250, 30],
    to: [236, 68],
  },
  niemcy: {
    name: {
      pl: "Środek — Sasi, Bawarczycy, Frankończycy",
      ru: "Центр — саксонцы, баварцы, франконцы",
    },
    text: {
      pl: "W środku szyku szły wojska księstw niemieckich, które cesarz zebrał z całej Rzeszy.",
      ru: "В центре строя шли войска немецких княжеств, которые император собрал со всей империи.",
    },
  },
  polacy: {
    name: {
      pl: "Prawe skrzydło — Polacy Sobieskiego",
      ru: "Правое крыло — поляки Собеского",
    },
    text: {
      pl: "Najdalej od rzeki, po trudnym terenie wzgórz, schodziło prawe skrzydło: husaria i wojska polskie. Jan III Sobieski dowodził całą armią sprzymierzonych — około 70 tysięcy ludzi.",
      ru: "Дальше всех от реки, по трудной холмистой местности, спускалось правое крыло: гусария и польские войска. Ян III Собеский командовал всей союзной армией — около 70 тысяч человек.",
    },
    pin: [40, 180],
    to: [78, 150],
  },
  turcy: {
    name: { pl: "Obóz turecki", ru: "Турецкий лагерь" },
    text: {
      pl: "Olbrzymie miasto namiotów armii Kara Mustafy — ponad 100 tysięcy ludzi — otaczało Wiedeń od zachodu i południa. Po bitwie zwycięzcy znaleźli w nim skarby, wielbłądy i worki kawy.",
      ru: "Огромный город из шатров армии Кара-Мустафы — более 100 тысяч человек — окружал Вену с запада и юга. После битвы победители нашли в нём сокровища, верблюдов и мешки кофе.",
    },
    pin: [330, 130],
    to: [286, 150],
  },
  szarza: {
    name: { pl: "Szarża husarii", ru: "Атака гусарии" },
    text: {
      pl: "Około godziny 17 Sobieski rzucił do ataku całą jazdę — największą szarżę kawalerii w dziejach. Husaria przełamała szyki tureckie i wpadła do obozu; armia wezyra uciekła.",
      ru: "Около 17 часов Собеский бросил в атаку всю конницу — крупнейшую кавалерийскую атаку в истории. Гусария прорвала турецкий строй и ворвалась в лагерь; армия визиря бежала.",
    },
    pin: [120, 262],
    to: [170, 206],
  },
  namiot: {
    name: { pl: "Namiot Kara Mustafy", ru: "Шатёр Кара-Мустафы" },
    text: {
      pl: "Wielki wezyr dowodził z namiotu w środku obozu; uciekł w ostatniej chwili, zostawiając nawet zieloną chorągiew Proroka. Sułtan kazał go potem udusić.",
      ru: "Великий визирь командовал из шатра посреди лагеря; он бежал в последний момент, бросив даже зелёное знамя Пророка. Султан потом приказал его задушить.",
    },
    pin: [250, 262],
    to: [240, 216],
  },
};

export function ViennaPlan({ lang }: { lang: ContentLang }) {
  const pl = lang === "pl";
  const tent = (x: number, y: number, color: string) => <path key={`${x}-${y}`} d={`M${x - 6} ${y + 5} L${x} ${y - 5} L${x + 6} ${y + 5} Z`} fill={color} stroke="#7f1d1d" strokeWidth={0.8} />;
  const tents: [number, number][] = [
    [200, 150],
    [222, 150],
    [244, 150],
    [266, 150],
    [288, 150],
    [190, 172],
    [212, 172],
    [234, 172],
    [256, 172],
    [278, 172],
    [300, 172],
    [202, 194],
    [224, 194],
    [268, 194],
    [290, 194],
    [214, 236],
    [236, 236],
    [258, 236],
    [280, 236],
    [226, 256],
    [248, 256],
    [270, 256],
  ];
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 300"
      maxWidth="max-w-[560px]"
      title={{
        pl: "Plan bitwy pod Wiedniem, 12 września 1683",
        ru: "План Венской битвы, 12 сентября 1683",
      }}
      labelOrder={["wieden", "kahlenberg", "cesarscy", "polacy", "turcy", "szarza", "namiot"]}
      pinRadius={11}
      art={({ part, tone, active }) => (
        <>
          <defs>
            <marker id="vienna-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#b91c1c" />
            </marker>
            <marker id="vienna-arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#1d4ed8" />
            </marker>
          </defs>
          <rect x={0} y={0} width={400} height={300} fill="#eef3e2" />
          {/* the Vienna Woods and the Kahlenberg */}
          <path d="M0 0 L 200 0 L 180 40 C 150 70, 110 100, 60 120 L 0 130 Z" fill="#cfe3b8" />
          {part(
            "kahlenberg",
            <g>
              <ellipse cx={96} cy={52} rx={40} ry={22} fill={tone("kahlenberg", "#9fcf8a")} stroke="#4d7c0f" strokeWidth={1.5} />
              <ellipse cx={150} cy={30} rx={30} ry={16} fill={tone("kahlenberg", "#b4d99e")} stroke="#4d7c0f" strokeWidth={1} />
            </g>,
          )}
          {active === "kahlenberg" && (
            <text x={66} y={56} fontSize={9} fontWeight={700} fill="#365314">
              Kahlenberg
            </text>
          )}
          {/* the Danube */}
          {part("dunaj", <path d="M300 0 C 340 60, 360 120, 352 200 C 346 250, 370 280, 400 300 L 400 0 Z" fill={tone("dunaj", "#9cc9ea")} stroke="#3b82f6" strokeWidth={1.5} />)}
          <text x={362} y={60} fontSize={9} fontStyle="italic" fill="#1e3a8a">
            {pl ? "Dunaj" : "Дунай"}
          </text>
          {/* Vienna behind its walls */}
          {part(
            "wieden",
            <g>
              <polygon points="286,196 326,190 342,214 334,248 300,254 282,230" fill={tone("wieden", "#e2b07a")} stroke="#78350f" strokeWidth={2.5} />
              <rect x={304} y={210} width={12} height={22} fill="#78350f" />
              <path d="M304 210 L310 198 L316 210 Z" fill="#78350f" />
            </g>,
          )}
          {active === "wieden" && (
            <text x={290} y={272} fontSize={9} fontWeight={700} fill="#78350f">
              {pl ? "Wiedeń" : "Вена"}
            </text>
          )}
          {/* the Turkish camp */}
          {part("turcy", <g>{tents.map(([x, y]) => tent(x, y, tone("turcy", "#f87171")))}</g>)}
          {part(
            "namiot",
            <g>
              <path d="M226 220 L240 200 L254 220 Z" fill={tone("namiot", "#facc15")} stroke="#7f1d1d" strokeWidth={1.2} />
              <path d="M240 200 L240 190 L250 193 L240 196" fill="#15803d" stroke="#15803d" strokeWidth={1} />
            </g>,
          )}
          {/* the allied lines coming down */}
          {part(
            "cesarscy",
            <g>
              <rect x={200} y={60} width={72} height={14} rx={3} fill={tone("cesarscy", "#fde68a")} stroke="#92400e" strokeWidth={1.5} />
              <path d="M236 76 L 236 120" stroke="#92400e" strokeWidth={2.5} markerEnd="url(#vienna-arrow)" />
            </g>,
          )}
          {part(
            "niemcy",
            <g>
              <rect x={120} y={92} width={72} height={14} rx={3} fill={tone("niemcy", "#fed7aa")} stroke="#9a3412" strokeWidth={1.5} />
              <path d="M160 108 L 190 140" stroke="#9a3412" strokeWidth={2.5} markerEnd="url(#vienna-arrow)" />
            </g>,
          )}
          {part(
            "polacy",
            <g>
              <rect x={42} y={140} width={72} height={14} rx={3} fill={tone("polacy", "#bfdbfe")} stroke="#1e40af" strokeWidth={1.5} />
              {active === "polacy" && (
                <text x={48} y={151} fontSize={8} fontWeight={700} fill="#1e3a8a">
                  {pl ? "Sobieski" : "Собеский"}
                </text>
              )}
            </g>,
          )}
          {part("szarza", <path d="M90 162 C 120 180, 150 196, 196 210" fill="none" stroke={tone("szarza", "#1d4ed8")} strokeWidth={6} strokeLinecap="round" markerEnd="url(#vienna-arrow-blue)" />)}
          <text x={12} y={290} fontSize={8} fill="#475569">
            {pl ? "12 IX 1683 · sprzymierzeni ok. 70 tys., Turcy ponad 100 tys." : "12 IX 1683 · союзники ок. 70 тыс., турки более 100 тыс."}
          </text>
        </>
      )}
    />
  );
}
