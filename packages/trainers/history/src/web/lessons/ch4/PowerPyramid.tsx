// Block 1 of the absolutism lesson: how absolute power is organised. The king sits on top; every
// box below answers to him and only to him. Each box explains itself when tapped.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "krol" | "ministrowie" | "dwor" | "armia" | "intendenci" | "gospodarka" | "kosciol" | "poddani";

const PARTS: Record<Part, MapPart> = {
  krol: {
    name: { pl: "Król", ru: "Король" },
    text: {
      pl: "Ludwik XIV sam podejmuje wszystkie decyzje: stanowi prawa, nakłada podatki, wypowiada wojny, jest najwyższym sędzią. Nikt nie może mu się sprzeciwić — „Państwo to ja”.",
      ru: "Людовик XIV сам принимает все решения: издаёт законы, вводит налоги, объявляет войны, он высший судья. Никто не может ему возразить — «Государство — это я».",
    },
  },
  ministrowie: {
    name: { pl: "Ministrowie", ru: "Министры" },
    text: {
      pl: "Król wybiera ich sam, najczęściej spośród mieszczan, a nie arystokratów — bo zawdzięczają wszystko jemu. Najsłynniejszy to Colbert, minister finansów.",
      ru: "Король выбирает их сам, чаще всего из горожан, а не из аристократов — ведь они всем обязаны ему. Самый известный — Кольбер, министр финансов.",
    },
  },
  dwor: {
    name: { pl: "Dwór w Wersalu", ru: "Двор в Версале" },
    text: {
      pl: "Arystokraci muszą mieszkać przy królu w Wersalu. Zajęci ceremoniałem i walką o jego łaski, nie mają czasu ani siły, by spiskować w swoich prowincjach.",
      ru: "Аристократы должны жить при короле в Версале. Занятые церемониалом и борьбой за его милости, они не имеют ни времени, ни сил на заговоры в своих провинциях.",
    },
  },
  armia: {
    name: { pl: "Armia stała", ru: "Постоянная армия" },
    text: {
      pl: "Kilkaset tysięcy żołnierzy opłacanych ze skarbu króla także w czasie pokoju. Król nie potrzebuje już wojska szlachty — może prowadzić wojny i tłumić bunty.",
      ru: "Несколько сотен тысяч солдат, которых казна короля оплачивает и в мирное время. Королю больше не нужно войско дворян — он может вести войны и подавлять бунты.",
    },
  },
  intendenci: {
    name: { pl: "Intendenci w prowincjach", ru: "Интенданты в провинциях" },
    text: {
      pl: "Urzędnicy wysłani przez króla do każdej prowincji: zbierają podatki, pilnują sądów i wykonania rozkazów z Wersalu. Lokalni panowie tracą władzę.",
      ru: "Чиновники, посланные королём в каждую провинцию: собирают налоги, следят за судами и исполнением приказов из Версаля. Местные сеньоры теряют власть.",
    },
  },
  gospodarka: {
    name: { pl: "Manufaktury i handel", ru: "Мануфактуры и торговля" },
    text: {
      pl: "Colbert zakłada królewskie manufaktury, buduje flotę, nakłada cła na obce towary — żeby złoto zostawało we Francji. To merkantylizm.",
      ru: "Кольбер основывает королевские мануфактуры, строит флот, вводит пошлины на чужие товары — чтобы золото оставалось во Франции. Это меркантилизм.",
    },
  },
  kosciol: {
    name: { pl: "Jedna wiara", ru: "Одна вера" },
    text: {
      pl: "„Jeden król, jedno prawo, jedna wiara”: w 1685 roku król odwołał edykt nantejski. Hugenoci musieli przejść na katolicyzm albo uciekać z kraju.",
      ru: "«Один король, один закон, одна вера»: в 1685 году король отменил Нантский эдикт. Гугеноты должны были перейти в католичество или бежать из страны.",
    },
  },
  poddani: {
    name: { pl: "Poddani", ru: "Подданные" },
    text: {
      pl: "Chłopi i mieszczanie płacą podatki, z których utrzymuje się Wersal, armia i wojny króla. Nie mają żadnego wpływu na rządy.",
      ru: "Крестьяне и горожане платят налоги, на которые содержатся Версаль, армия и войны короля. Они не имеют никакого влияния на правление.",
    },
  },
};

const BOX = "#fef3c7";
const BOX_LINE = "#b45309";

export function PowerPyramid({ lang }: { lang: ContentLang }) {
  const t = (pl: string, ru: string) => (lang === "pl" ? pl : ru);
  const box = (x: number, y: number, w: number, h: number, fill: string, lines: string[], icon?: string) => (
    <>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={fill} stroke={BOX_LINE} strokeWidth={1.5} />
      {icon && (
        <text x={x + w / 2} y={y + 17} textAnchor="middle" fontSize={14}>
          {icon}
        </text>
      )}
      {lines.map((line, i) => (
        <text key={line} x={x + w / 2} y={y + (icon ? 32 : 19) + i * 11} textAnchor="middle" fontSize={9} fontWeight={600} fill="#1f2937">
          {line}
        </text>
      ))}
    </>
  );
  const arrow = (x1: number, y1: number, x2: number, y2: number) => <path d={`M${x1} ${y1} L ${x2} ${y2}`} stroke="#92400e" strokeWidth={2} markerEnd="url(#pp-arrow)" />;
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 300"
      maxWidth="max-w-[520px]"
      title={{ pl: "Schemat władzy absolutnej", ru: "Схема абсолютной власти" }}
      art={({ part, tone }) => (
        <>
          <defs>
            <marker id="pp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#92400e" />
            </marker>
          </defs>
          <rect x={0} y={0} width={400} height={300} rx={12} fill="#fffbeb" />
          {/* rays of the Sun King */}
          <g stroke="#fcd34d" strokeWidth={2}>
            {[-60, -40, -20, 0, 20, 40, 60].map((a) => (
              <line key={a} x1={200} y1={38} x2={200 + 70 * Math.sin((a * Math.PI) / 180)} y2={38 - 70 * Math.cos((a * Math.PI) / 180)} opacity={0.6} />
            ))}
          </g>
          {/* everything hangs from the king: one spine, branches to every box */}
          {arrow(200, 62, 200, 258)}
          <g stroke="#92400e" strokeWidth={2}>
            <line x1={71} y1={129} x2={329} y2={129} />
            <line x1={56} y1={219} x2={288} y2={219} />
            <line x1={71} y1={129} x2={71} y2={196} />
            <line x1={329} y1={129} x2={288} y2={196} />
          </g>
          {part("krol", box(150, 14, 100, 48, tone("krol", "#fde68a"), [t("Ludwik XIV", "Людовик XIV")], "👑"))}
          {part("ministrowie", box(16, 106, 110, 46, tone("ministrowie", BOX), [t("ministrowie", "министры"), "(Colbert)"], "📜"))}
          {part("dwor", box(145, 106, 110, 46, tone("dwor", BOX), [t("dwór w Wersalu", "двор в Версале")], "🏰"))}
          {part("armia", box(274, 106, 110, 46, tone("armia", BOX), [t("armia stała", "постоянная армия")], "⚔️"))}
          {part("intendenci", box(8, 196, 96, 46, tone("intendenci", BOX), [t("intendenci", "интенданты"), t("w prowincjach", "в провинциях")], "🧾"))}
          {part("gospodarka", box(116, 196, 112, 46, tone("gospodarka", BOX), [t("manufaktury", "мануфактуры"), t("i handel", "и торговля")], "🏭"))}
          {part("kosciol", box(240, 196, 96, 46, tone("kosciol", BOX), [t("jedna wiara", "одна вера"), t("(katolicka)", "(католическая)")], "⛪"))}
          {part("poddani", box(40, 260, 320, 32, tone("poddani", "#e7e5e4"), [t("poddani: chłopi i mieszczanie — płacą podatki", "подданные: крестьяне и горожане — платят налоги")]))}
        </>
      )}
    />
  );
}
