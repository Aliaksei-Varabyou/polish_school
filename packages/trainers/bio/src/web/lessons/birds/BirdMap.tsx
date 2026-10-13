// Block 1 of the birds lesson: a bird from the side. Outer parts are drawn; the inner ones — hollow
// bones, the keel with its muscles, the air sacs — appear over the drawing when chosen.
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "../games.tsx";

type BirdPart = "feathers" | "beak" | "wing" | "tail" | "legs" | "gland" | "bones" | "keel" | "airsacs";

const PARTS: Record<BirdPart, MapPart> = {
  feathers: {
    name: { pl: "Pióra", ru: "Перья" },
    text: {
      pl: "Pióra to rogowe wytwory skóry, tak jak łuski gadów. Pióra okrywowe nadają ciału gładki, opływowy kształt, a puch pod nimi zatrzymuje ciepło. Ptaki są stałocieplne: temperatura ich ciała to ok. 40 °C.",
      ru: "Перья — роговые образования кожи, как чешуя у пресмыкающихся. Контурные перья придают телу гладкую обтекаемую форму, а пух под ними сохраняет тепло. Птицы теплокровны: температура их тела около 40 °C.",
    },
    pin: [120, 214],
    to: [168, 172],
  },
  beak: {
    name: { pl: "Dziób", ru: "Клюв" },
    text: {
      pl: "Rogowa pochwa na szczękach — bez zębów. Lekki dziób zamiast ciężkich szczęk z zębami odciąża głowę. Kształt dzioba zależy od pokarmu: zobaczysz to w bloku o dziobach.",
      ru: "Роговой чехол на челюстях — без зубов. Лёгкий клюв вместо тяжёлых челюстей с зубами облегчает голову. Форма клюва зависит от пищи: это ты увидишь в блоке про клювы.",
    },
    pin: [44, 58],
    to: [82, 110],
  },
  wing: {
    name: { pl: "Skrzydło", ru: "Крыло" },
    text: {
      pl: "Skrzydło to przekształcona kończyna przednia. Długie lotki tworzą jego powierzchnię nośną. Machając skrzydłami, ptak odpycha powietrze i unosi się.",
      ru: "Крыло — видоизменённая передняя конечность. Длинные маховые перья образуют его несущую поверхность. Взмахивая крыльями, птица отталкивается от воздуха и поднимается.",
    },
    pin: [226, 52],
    to: [222, 124],
  },
  tail: {
    name: { pl: "Ogon", ru: "Хвост" },
    text: {
      pl: "Ogon tworzą pióra sterowe (sterówki). Ptak skręca nim i hamuje — jak sterem samolotu.",
      ru: "Хвост образуют рулевые перья. Птица поворачивает и тормозит им — как рулём самолёта.",
    },
    pin: [368, 88],
    to: [348, 140],
  },
  legs: {
    name: { pl: "Nogi", ru: "Ноги" },
    text: {
      pl: "Nogi pokryte rogowymi łuskami — jak u gadów — i zakończone palcami z pazurami. Ptak chodzi na nich, siada na gałęziach, a ptaki drapieżne chwytają nimi zdobycz.",
      ru: "Ноги покрыты роговыми чешуйками — как у пресмыкающихся — и заканчиваются пальцами с когтями. На них птица ходит, сидит на ветках, а хищные птицы ловят ими добычу.",
    },
    pin: [272, 268],
    to: [222, 238],
  },
  gland: {
    name: { pl: "Gruczoł kuprowy", ru: "Копчиковая железа" },
    text: {
      pl: "Gruczoł u nasady ogona wydziela tłuszcz. Ptak rozprowadza go dziobem po piórach, które dzięki temu nie nasiąkają wodą. Szczególnie duży jest u ptaków wodnych, np. kaczek.",
      ru: "Железа у основания хвоста выделяет жир. Птица распределяет его клювом по перьям, и они не намокают. Особенно большая она у водоплавающих птиц, например уток.",
    },
    pin: [332, 216],
    to: [290, 146],
  },
  bones: {
    name: { pl: "Kości pneumatyczne", ru: "Пневматические кости" },
    text: {
      pl: "Wiele kości ptaka jest pustych w środku i wypełnionych powietrzem. Od środka wzmacniają je cienkie beleczki, więc są lekkie, a jednocześnie wytrzymałe.",
      ru: "Многие кости птицы полые внутри и заполнены воздухом. Изнутри их укрепляют тонкие перекладинки, поэтому кости лёгкие и при этом прочные.",
    },
  },
  keel: {
    name: { pl: "Grzebień mostka", ru: "Киль" },
    text: {
      pl: "Mostek ptaka ma wysoki grzebień. Przyczepiają się do niego potężne mięśnie piersiowe, które poruszają skrzydłami. Ptaki nielotne, np. struś, grzebienia nie mają.",
      ru: "У грудины птицы есть высокий вырост — киль. К нему крепятся мощные грудные мышцы, которые двигают крыльями. У нелетающих птиц, например страуса, киля нет.",
    },
  },
  airsacs: {
    name: { pl: "Worki powietrzne", ru: "Воздушные мешки" },
    text: {
      pl: "Płuca ptaka łączą się z workami powietrznymi. Dzięki nim świeże powietrze przepływa przez płuca i przy wdechu, i przy wydechu — mięśnie dostają mnóstwo tlenu potrzebnego do lotu. Worki zmniejszają też ciężar ciała.",
      ru: "Лёгкие птицы связаны с воздушными мешками. Благодаря им свежий воздух проходит через лёгкие и при вдохе, и при выдохе — мышцы получают много кислорода, нужного для полёта. Мешки к тому же облегчают тело.",
    },
  },
};

const LABELS: BirdPart[] = ["beak", "wing", "tail", "legs", "feathers", "gland"];
const BLUE = "#60a5fa";

export function BirdMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<BirdPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 290"
      title={{ pl: "Budowa ptaka", ru: "Строение птицы" }}
      labelOrder={LABELS}
      art={({ part, tone }) => (
        <>
          {part(
            "tail",
            <g>
              <path d="M276 148 L 372 126 L 382 150 L 372 174 L 276 164 Z" fill={tone("tail", "#475569")} stroke="#1e293b" strokeWidth={2} />
              <path d="M282 154 L 374 134 M282 156 L 380 150 M282 158 L 374 166" stroke="#94a3b8" strokeWidth={1.2} />
            </g>,
          )}
          {part(
            "legs",
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              {[0, 18].map((dx) => (
                <g key={dx} transform={`translate(${dx} 0)`}>
                  <path d="M204 190 L 202 236 L 198 252" stroke={tone("legs", "#f59e0b")} strokeWidth={5} />
                  <path d="M198 252 L 178 256 M198 252 L 188 263 M198 252 L 210 260" stroke={tone("legs", "#d97706")} strokeWidth={3} />
                  <path d="M199 212 l 6 0 M199 222 l 6 0 M199 232 l 6 0" stroke="#b45309" strokeWidth={1} />
                  <path d="M204 190 L 202 236 L 198 252" stroke="transparent" strokeWidth={16} />
                </g>
              ))}
            </g>,
          )}
          {part(
            "feathers",
            <g>
              <ellipse cx={205} cy={150} rx={82} ry={48} fill={tone("feathers", BLUE)} stroke="#1e40af" strokeWidth={2} />
              <ellipse cx={186} cy={172} rx={56} ry={22} fill={tone("feathers", "#bfdbfe")} />
              <circle cx={132} cy={108} r={32} fill={tone("feathers", BLUE)} stroke="#1e40af" strokeWidth={2} />
            </g>,
          )}
          {part(
            "gland",
            <ellipse cx={290} cy={146} rx={8} ry={6} fill={tone("gland", "#fb923c")} stroke="#c2410c" strokeWidth={1.5} />,
          )}
          {part(
            "wing",
            <g>
              <path
                d="M160 128 C 195 108, 238 108, 272 126 L 280 134 L 270 135 L 276 144 L 264 145 L 268 155 L 254 154 C 226 164, 192 164, 166 152 Z"
                fill={tone("wing", "#2563eb")}
                stroke="#1e3a8a"
                strokeWidth={2}
              />
              <path d="M190 140 L 262 142 M196 150 L 256 152 M206 126 L 268 132" stroke="#93c5fd" strokeWidth={1.2} />
            </g>,
          )}
          {part(
            "beak",
            <g>
              <path d="M104 98 L 66 111 L 104 120 Z" fill={tone("beak", "#f59e0b")} stroke="#b45309" strokeWidth={1.5} />
              <path d="M68 111 L 104 110" stroke="#b45309" strokeWidth={1.2} />
            </g>,
          )}
          <circle cx={124} cy={100} r={6} fill="#0f172a" pointerEvents="none" />
          <circle cx={122} cy={98} r={2} fill="white" pointerEvents="none" />
        </>
      )}
      overlay={(active) => (
        <g pointerEvents="none">
          {active === "bones" && (
            <g>
              <path d="M88 228 L 200 140" stroke="#a16207" strokeWidth={1.5} strokeDasharray="4 3" />
              <path d="M178 136 L 236 134" stroke="#fef3c7" strokeWidth={8} strokeLinecap="round" />
              <path d="M178 136 L 236 134" stroke="#a16207" strokeWidth={1.5} strokeLinecap="round" fill="none" />
              <circle cx={60} cy={240} r={38} fill="#f8fafc" stroke="#a16207" strokeWidth={7} />
              <path d="M30 222 L 86 252 M36 262 L 82 214 M24 240 L 96 240 M60 206 L 56 274" stroke="#d6b48a" strokeWidth={2.5} />
            </g>
          )}
          {active === "keel" && (
            <g>
              <ellipse cx={168} cy={158} rx={36} ry={26} fill="#f87171" opacity={0.85} />
              <path d="M168 158 L 210 128" stroke="#b91c1c" strokeWidth={2} />
              <path d="M138 172 Q 166 208 214 198 L 210 184 Q 174 188 150 168 Z" fill="#fef3c7" stroke="#a16207" strokeWidth={2} />
            </g>
          )}
          {active === "airsacs" && (
            <g>
              {[
                [150, 148, 15, 11],
                [184, 132, 22, 13],
                [226, 140, 26, 16],
                [258, 152, 18, 12],
                [198, 166, 22, 11],
              ].map(([cx, cy, rx, ry]) => (
                <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="#bae6fd" stroke="#0284c7" strokeWidth={1.5} opacity={0.9} />
              ))}
              <ellipse cx={204} cy={126} rx={20} ry={8} fill="#f9a8d4" stroke="#db2777" strokeWidth={1.5} />
              <path d="M136 112 C 160 120, 178 124, 186 126" stroke="#0284c7" strokeWidth={2.5} fill="none" />
            </g>
          )}
        </g>
      )}
    />
  );
}
