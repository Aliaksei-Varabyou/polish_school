// Block 1 of the revolution lesson: the three estates of France before 1789, drawn after the famous
// caricature — the third estate carries the other two on its back. Each figure explains itself when
// tapped; in "label it" mode the student names them.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "duchowienstwo" | "szlachta" | "stan-trzeci" | "ciezary";

const PARTS: Record<Part, MapPart> = {
  duchowienstwo: {
    name: { pl: "Stan pierwszy: duchowieństwo", ru: "Первое сословие: духовенство" },
    text: {
      pl: "Około 100 tysięcy osób — pół procenta Francuzów. Kościół posiadał dziesiątą część ziemi, pobierał od chłopów dziesięcinę i nie płacił podatków.",
      ru: "Около 100 тысяч человек — полпроцента французов. Церковь владела десятой частью земли, собирала с крестьян десятину и не платила налогов.",
    },
    pin: [205, 22],
    to: [205, 50],
  },
  szlachta: {
    name: { pl: "Stan drugi: szlachta", ru: "Второе сословие: дворянство" },
    text: {
      pl: "Około 400 tysięcy osób — półtora procenta. Szlachta miała najlepsze urzędy, stopnie oficerskie i dwór w Wersalu, a chłopi odrabiali dla niej powinności. Podatków nie płaciła.",
      ru: "Около 400 тысяч человек — полтора процента. Дворянство занимало лучшие должности, офицерские чины и двор в Версале, а крестьяне несли для него повинности. Налогов оно не платило.",
    },
    pin: [280, 22],
    to: [272, 50],
  },
  "stan-trzeci": {
    name: { pl: "Stan trzeci", ru: "Третье сословие" },
    text: {
      pl: "Wszyscy pozostali — 98 procent: chłopi, rzemieślnicy, kupcy, bankierzy, prawnicy. To oni płacili podatki królowi, dziesięcinę Kościołowi i czynsze panom. Bogata burżuazja chciała wreszcie mieć wpływ na rządy.",
      ru: "Все остальные — 98 процентов: крестьяне, ремесленники, купцы, банкиры, юристы. Именно они платили налоги королю, десятину церкви и оброк сеньорам. Богатая буржуазия хотела наконец влиять на управление.",
    },
    pin: [80, 200],
    to: [132, 182],
  },
  ciezary: {
    name: { pl: "Ciężary stanu trzeciego", ru: "Бремя третьего сословия" },
    text: {
      pl: "Podatki dla króla, dziesięcina dla Kościoła, powinności dla szlachty — a do tego drożyzna chleba po nieurodzaju 1788 roku. Skarb państwa był pusty, bo nie płacili ci, którzy mieli najwięcej.",
      ru: "Налоги королю, десятина церкви, повинности дворянству — и вдобавок дороговизна хлеба после неурожая 1788 года. Казна была пуста, потому что не платили те, у кого было больше всего.",
    },
    pin: [336, 122],
    to: [308, 122],
  },
};

export function EstatesDiagram({ lang }: { lang: ContentLang }) {
  const t = (pl: string, ru: string) => (lang === "pl" ? pl : ru);
  const standing = (x: number, color: string, hat: "mitre" | "tricorn") => (
    <g stroke="#1f2937" strokeWidth={2.5} strokeLinecap="round" fill="none">
      <circle cx={x} cy={56} r={8} fill="#fde68a" />
      {hat === "mitre" ? <path d={`M${x - 7} 50 L${x} 36 L${x + 7} 50 Z`} fill="#fef3c7" strokeWidth={1.5} /> : <path d={`M${x - 11} 50 L${x + 11} 50 L${x + 6} 42 L${x - 6} 42 Z`} fill="#1f2937" strokeWidth={1.5} />}
      <path d={`M${x} 64 L${x} 90`} stroke={color} strokeWidth={9} />
      <path d={`M${x} 70 L${x - 12} 82 M${x} 70 L${x + 12} 82`} />
      <path d={`M${x} 90 L${x - 7} 100 M${x} 90 L${x + 7} 100`} />
    </g>
  );
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 240"
      maxWidth="max-w-[520px]"
      title={{ pl: "Trzy stany we Francji przed rewolucją", ru: "Три сословия во Франции перед революцией" }}
      labelOrder={["duchowienstwo", "szlachta", "stan-trzeci", "ciezary"]}
      pinRadius={12}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={400} height={240} rx={12} fill="#f5f5f4" />
          <line x1={0} y1={222} x2={400} y2={222} stroke="#a8a29e" strokeWidth={2} />
          {/* the rock: taxes, tithe, dues */}
          {part(
            "ciezary",
            <>
              <rect x={166} y={100} width={140} height={44} rx={14} fill={tone("ciezary", "#78716c")} stroke="#44403c" strokeWidth={2} />
              <text x={236} y={119} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">
                {t("podatki · dziesięcina", "налоги · десятина")}
              </text>
              <text x={236} y={133} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">
                {t("powinności dla pana", "повинности сеньору")}
              </text>
            </>,
          )}
          {/* the third estate, bent under the rock */}
          {part(
            "stan-trzeci",
            <g stroke="#1f2937" strokeWidth={2.5} strokeLinecap="round" fill="none">
              <circle cx={138} cy={150} r={9} fill="#fde68a" />
              <path d="M146 158 C 170 150, 200 150, 236 150 L 262 150" stroke={tone("stan-trzeci", "#b45309")} strokeWidth={10} />
              <path d="M150 162 L 132 190 M 160 160 L 150 192" />
              <path d="M236 150 L 226 220 M 262 150 L 272 220" />
            </g>,
          )}
          {part("duchowienstwo", standing(205, tone("duchowienstwo", "#1e293b"), "mitre"))}
          {part("szlachta", standing(272, tone("szlachta", "#7c3aed"), "tricorn"))}
          <text x={30} y={60} fontSize={9} fill="#57534e">
            {t("ok. 2% ludności —", "ок. 2% населения —")}
          </text>
          <text x={30} y={72} fontSize={9} fill="#57534e">
            {t("nie płacą podatków", "не платят налогов")}
          </text>
          <text x={30} y={236} fontSize={9} fill="#57534e">
            {t("98% ludności — płacą wszystko", "98% населения — платят всё")}
          </text>
        </>
      )}
    />
  );
}
