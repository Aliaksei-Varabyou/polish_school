// Block 2 of the Enlightenment lesson: Montesquieu's separation of powers. Three pillars, each
// explained when tapped; in "label it" mode the boxes show only what each power does and the
// student matches the names.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "ustawodawcza" | "wykonawcza" | "sadownicza" | "kontrola" | "narod";

const PARTS: Record<Part, MapPart> = {
  ustawodawcza: {
    name: { pl: "Władza ustawodawcza", ru: "Законодательная власть" },
    text: {
      pl: "Uchwala prawa i podatki. Według Monteskiusza powinna należeć do parlamentu wybieranego przez obywateli, a nie do króla.",
      ru: "Принимает законы и налоги. По Монтескьё, она должна принадлежать парламенту, избираемому гражданами, а не королю.",
    },
    pin: [70, 84],
  },
  wykonawcza: {
    name: { pl: "Władza wykonawcza", ru: "Исполнительная власть" },
    text: {
      pl: "Wykonuje prawa: rządzi państwem na co dzień, kieruje urzędami i wojskiem. Sprawuje ją król albo rząd — ale tylko w granicach uchwalonych praw.",
      ru: "Исполняет законы: управляет государством изо дня в день, руководит ведомствами и войском. Её осуществляет король или правительство — но лишь в рамках принятых законов.",
    },
    pin: [200, 84],
  },
  sadownicza: {
    name: { pl: "Władza sądownicza", ru: "Судебная власть" },
    text: {
      pl: "Rozstrzyga spory i karze za łamanie prawa. Niezależne sądy — ani król, ani parlament nie mogą wpływać na wyrok.",
      ru: "Разрешает споры и наказывает за нарушение закона. Независимые суды — ни король, ни парламент не могут влиять на приговор.",
    },
    pin: [330, 84],
  },
  kontrola: {
    name: { pl: "Wzajemna kontrola", ru: "Взаимный контроль" },
    text: {
      pl: "Każda władza ogranicza pozostałe: parlament może odmówić pieniędzy rządowi, sąd może uznać, że urzędnik złamał prawo. Dzięki temu nikt nie zostaje tyranem.",
      ru: "Каждая власть ограничивает остальные: парламент может отказать правительству в деньгах, суд может признать, что чиновник нарушил закон. Благодаря этому никто не становится тираном.",
    },
    pin: [200, 204],
  },
  narod: {
    name: { pl: "Naród — źródło władzy", ru: "Народ — источник власти" },
    text: {
      pl: "Oświecenie odwróciło porządek: władza nie pochodzi od Boga i nie należy do króla. Pochodzi od ludu (Rousseau) i ma służyć ochronie jego praw (Locke).",
      ru: "Просвещение перевернуло порядок: власть исходит не от Бога и не принадлежит королю. Она исходит от народа (Руссо) и должна служить защите его прав (Локк).",
    },
  },
};

export function PowersDiagram({ lang }: { lang: ContentLang }) {
  const t = (pl: string, ru: string) => (lang === "pl" ? pl : ru);
  const pillar = (x: number, fill: string, icon: string, lines: string[]) => (
    <>
      <rect x={x - 58} y={60} width={116} height={100} rx={10} fill={fill} stroke="#4338ca" strokeWidth={1.5} />
      <text x={x} y={118} textAnchor="middle" fontSize={26}>
        {icon}
      </text>
      {lines.map((line, i) => (
        <text key={line} x={x} y={138 + i * 11} textAnchor="middle" fontSize={9} fontWeight={600} fill="#1e1b4b">
          {line}
        </text>
      ))}
    </>
  );
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 240"
      maxWidth="max-w-[520px]"
      title={{ pl: "Trójpodział władzy według Monteskiusza", ru: "Разделение властей по Монтескьё" }}
      labelOrder={["ustawodawcza", "wykonawcza", "sadownicza", "kontrola"]}
      pinRadius={12}
      art={({ part, tone }) => (
        <>
          <defs>
            <marker id="pd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#4338ca" />
            </marker>
          </defs>
          <rect x={0} y={0} width={400} height={240} rx={12} fill="#eef2ff" />
          {part(
            "narod",
            <>
              <rect x={60} y={8} width={280} height={34} rx={17} fill={tone("narod", "#c7d2fe")} stroke="#4338ca" strokeWidth={1.5} />
              <text x={200} y={30} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1e1b4b">
                👥 {t("naród — źródło władzy", "народ — источник власти")}
              </text>
            </>,
          )}
          <g stroke="#4338ca" strokeWidth={1.5} fill="none">
            <path d="M200 42 L200 50 L70 50 L70 60" markerEnd="url(#pd-arrow)" />
            <path d="M200 50 L200 60" markerEnd="url(#pd-arrow)" />
            <path d="M200 50 L330 50 L330 60" markerEnd="url(#pd-arrow)" />
          </g>
          {part("ustawodawcza", pillar(70, tone("ustawodawcza", "#e0e7ff"), "📜", [t("uchwala prawa", "принимает законы"), t("i podatki", "и налоги")]))}
          {part("wykonawcza", pillar(200, tone("wykonawcza", "#e0e7ff"), "👑", [t("wykonuje prawa,", "исполняет законы,"), t("rządzi państwem", "управляет государством")]))}
          {part("sadownicza", pillar(330, tone("sadownicza", "#e0e7ff"), "⚖️", [t("sądzi tych,", "судит тех,"), t("którzy łamią prawo", "кто нарушает закон")]))}
          {part(
            "kontrola",
            <>
              <path d="M70 160 L70 204 L330 204 L330 160" fill="none" stroke={tone("kontrola", "#6366f1")} strokeWidth={2.5} strokeDasharray="6 4" markerStart="url(#pd-arrow)" markerEnd="url(#pd-arrow)" />
              <path d="M200 160 L200 204" fill="none" stroke={tone("kontrola", "#6366f1")} strokeWidth={2.5} strokeDasharray="6 4" markerStart="url(#pd-arrow)" />
              <circle cx={200} cy={204} r={9} fill={tone("kontrola", "#6366f1")} stroke="white" strokeWidth={2} />
              <text x={200} y={208} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">
                ⇄
              </text>
            </>,
          )}
        </>
      )}
    />
  );
}
