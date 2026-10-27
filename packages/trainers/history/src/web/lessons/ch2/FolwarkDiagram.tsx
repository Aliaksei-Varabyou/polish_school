// Block 1 of the economy lesson: a schematic drawing of a manor (folwark) with its three fields, the
// peasant village, the serf's walk to the lord's field and the granary on the river.
import { PartMap, type ArtKit, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "dwor" | "ozime" | "jare" | "ugor" | "wies" | "lany" | "panszczyzna" | "spichlerz" | "wisla";

const PARTS: Record<Part, MapPart> = {
  dwor: {
    name: { pl: "Dwór szlachcica", ru: "Усадьба шляхтича" },
    text: {
      pl: "Tu mieszka właściciel folwarku. Szlachcic nie pracuje w polu — zarządza, sądzi chłopów i sprzedaje zboże.",
      ru: "Здесь живёт владелец фольварка. Шляхтич не работает в поле — он управляет, судит крестьян и продаёт зерно.",
    },
    pin: [52, 22],
    to: [52, 48],
  },
  ozime: {
    name: { pl: "Pole ozime", ru: "Озимое поле" },
    text: {
      pl: "Żyto i pszenica zasiane jesienią, zbierane latem. Pierwsza część trójpolówki.",
      ru: "Рожь и пшеница, посеянные осенью и убранные летом. Первая часть трёхполья.",
    },
    pin: [165, 20],
    to: [165, 55],
  },
  jare: {
    name: { pl: "Pole jare", ru: "Яровое поле" },
    text: {
      pl: "Owies i jęczmień siane wiosną. Druga część trójpolówki — co roku zboża zmieniają pole.",
      ru: "Овёс и ячмень, посеянные весной. Вторая часть трёхполья — каждый год злаки меняют поле.",
    },
    pin: [235, 20],
    to: [235, 55],
  },
  ugor: {
    name: { pl: "Ugór", ru: "Пар" },
    text: {
      pl: "Pole, które przez rok odpoczywa i służy za pastwisko. Dzięki temu ziemia nie wyjaławia się. Trzecia część trójpolówki.",
      ru: "Поле, которое год отдыхает и служит пастбищем. Благодаря этому земля не истощается. Третья часть трёхполья.",
    },
    pin: [305, 20],
    to: [305, 55],
  },
  wies: {
    name: { pl: "Wieś chłopska", ru: "Крестьянская деревня" },
    text: {
      pl: "Chaty poddanych szlachcica. Chłop nie może bez zgody pana opuścić wsi (poddaństwo).",
      ru: "Избы подданных шляхтича. Крестьянин не может без согласия пана покинуть деревню (крепостная зависимость).",
    },
    pin: [40, 228],
    to: [60, 196],
  },
  lany: {
    name: { pl: "Łany chłopskie", ru: "Крестьянские ланы" },
    text: {
      pl: "Paski ziemi, które chłopi uprawiają dla siebie. Z każdego łanu (ok. 17 ha) trzeba odrobić pańszczyznę.",
      ru: "Полосы земли, которые крестьяне обрабатывают для себя. С каждого лана (ок. 17 га) нужно отработать барщину.",
    },
    pin: [250, 228],
    to: [250, 180],
  },
  panszczyzna: {
    name: { pl: "Pańszczyzna", ru: "Барщина" },
    text: {
      pl: "Darmowa praca chłopa na polu pana: od 1520 roku co najmniej jeden dzień w tygodniu z łanu, z czasem kilka dni.",
      ru: "Бесплатная работа крестьянина на поле пана: с 1520 года не менее одного дня в неделю с лана, со временем — несколько дней.",
    },
    pin: [120, 150],
    to: [120, 128],
  },
  spichlerz: {
    name: { pl: "Spichlerz", ru: "Амбар" },
    text: {
      pl: "Magazyn na zboże. Wiosną worki ładuje się na szkuty i spławia do Gdańska.",
      ru: "Склад для зерна. Весной мешки грузят на шкуты и сплавляют в Гданьск.",
    },
    pin: [344, 136],
    to: [344, 136],
  },
  wisla: {
    name: { pl: "Wisła i szkuta", ru: "Висла и шкута" },
    text: {
      pl: "Rzeka to najtańsza droga. Flisacy płyną szkutami z prądem aż do Gdańska.",
      ru: "Река — самая дешёвая дорога. Плотогоны плывут на шкутах по течению до самого Гданьска.",
    },
    pin: [392, 200],
    to: [380, 180],
  },
};

const FIELD = "#8a7a52";

export function FolwarkDiagram({ lang }: { lang: ContentLang }) {
  const t = (pl: string, ru: string) => (lang === "pl" ? pl : ru);
  const field = (id: Part, x: number, fill: string, label: string, { part, tone }: ArtKit<Part>) =>
    part(
      id,
      <g>
        <rect x={x} y={40} width={64} height={60} fill={tone(id, fill)} stroke={FIELD} strokeWidth={1.5} />
        <text x={x + 32} y={74} fontSize={8} textAnchor="middle" fill="#1f2937" fontWeight={600}>
          {label}
        </text>
      </g>,
    );
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 240"
      maxWidth="max-w-[520px]"
      title={{ pl: "Folwark szlachecki", ru: "Шляхетский фольварк" }}
      labelOrder={["dwor", "ozime", "jare", "ugor", "wies", "lany", "panszczyzna", "spichlerz", "wisla"]}
      pinRadius={11}
      art={(kit) => {
        const { part, tone } = kit;
        return (
          <>
            <rect x={0} y={0} width={400} height={240} fill="#ecfccb" />
            {/* the river on the right */}
            {part("wisla", <path d="M372 0 C 360 60, 390 120, 370 240 L 400 240 L 400 0 Z" fill={tone("wisla", "#7dd3fc")} />)}
            <text x={376} y={60} fontSize={8} fill="#1e3a8a" fontStyle="italic" transform="rotate(80 376 60)">
              {t("Wisła", "Висла")}
            </text>
            {/* the boat */}
            <path d="M366 176 L 394 176 L 388 186 L 372 186 Z" fill="#78350f" />
            <rect x={373} y={168} width={14} height={8} fill="#fde68a" stroke="#78350f" />
            {/* the manor */}
            {part(
              "dwor",
              <g>
                <rect x={28} y={56} width={48} height={30} fill={tone("dwor", "#fef3c7")} stroke="#92400e" strokeWidth={1.5} />
                <path d="M22 56 L 52 36 L 82 56 Z" fill={tone("dwor", "#b45309")} />
                <rect x={46} y={70} width={10} height={16} fill="#92400e" />
              </g>,
            )}
            <text x={52} y={98} fontSize={8} textAnchor="middle" fill="#78350f" fontWeight={600}>
              {t("dwór", "усадьба")}
            </text>
            {/* the lord's three fields */}
            <text x={200} y={32} fontSize={8} textAnchor="middle" fill="#365314" fontWeight={700}>
              {t("POLA FOLWARCZNE (trójpolówka)", "ПОЛЯ ФОЛЬВАРКА (трёхполье)")}
            </text>
            {field("ozime", 133, "#86efac", t("ozime", "озимые"), kit)}
            {field("jare", 203, "#fde047", t("jare", "яровые"), kit)}
            {field("ugor", 273, "#d6d3d1", t("ugór", "пар"), kit)}
            {/* the granary */}
            {part(
              "spichlerz",
              <g>
                <rect x={326} y={124} width={36} height={26} fill={tone("spichlerz", "#fdba74")} stroke="#9a3412" strokeWidth={1.5} />
                <path d="M322 124 L 344 108 L 366 124 Z" fill={tone("spichlerz", "#9a3412")} />
              </g>,
            )}
            <text x={344} y={160} fontSize={7.5} textAnchor="middle" fill="#7c2d12" fontWeight={600}>
              {t("spichlerz", "амбар")}
            </text>
            {/* the serf's walk */}
            {part(
              "panszczyzna",
              <g>
                <path d="M70 186 C 90 160, 110 130, 150 104" fill="none" stroke={tone("panszczyzna", "#dc2626")} strokeWidth={3} strokeDasharray="6 4" />
                <path d="M150 104 L 140 106 L 146 114 Z" fill={tone("panszczyzna", "#dc2626")} />
                <text x={64} y={142} fontSize={8} fill="#991b1b" fontWeight={700}>
                  {t("pańszczyzna", "барщина")}
                </text>
              </g>,
            )}
            {/* the village */}
            {part(
              "wies",
              <g>
                {[20, 52, 84].map((x) => (
                  <g key={x}>
                    <rect x={x} y={190} width={24} height={16} fill={tone("wies", "#e7e5e4")} stroke="#57534e" />
                    <path d={`M${x - 3} 190 L ${x + 12} 178 L ${x + 27} 190 Z`} fill={tone("wies", "#a8a29e")} />
                  </g>
                ))}
              </g>,
            )}
            <text x={64} y={218} fontSize={8} textAnchor="middle" fill="#44403c" fontWeight={600}>
              {t("wieś", "деревня")}
            </text>
            {/* peasant strips */}
            {part(
              "lany",
              <g>
                {[150, 180, 210, 240, 270, 300].map((x) => (
                  <rect key={x} x={x} y={150} width={26} height={60} fill={tone("lany", x % 60 === 0 ? "#bef264" : "#a3e635")} stroke={FIELD} />
                ))}
              </g>,
            )}
            <text x={238} y={222} fontSize={8} textAnchor="middle" fill="#365314" fontWeight={600}>
              {t("łany chłopskie", "крестьянские ланы")}
            </text>
          </>
        );
      }}
    />
  );
}
