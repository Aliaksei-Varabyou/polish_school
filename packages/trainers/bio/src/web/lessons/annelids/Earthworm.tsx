// Drawings and interactives of the annelids lesson: the earthworm's body, how it crawls, and what it
// does for the soil.
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "../games.tsx";
import { Choice, type Txt } from "../kit.tsx";

type WormPart = "skin" | "segments" | "clitellum" | "bristles" | "mouth" | "vessels" | "sac";

const PARTS: Record<WormPart, MapPart> = {
  skin: {
    name: { pl: "Wilgotna skóra", ru: "Влажная кожа" },
    text: {
      pl: "Dżdżownica nie ma płuc ani skrzeli — oddycha całą powierzchnią ciała. Tlen przenika tylko przez wilgotną skórę, dlatego dżdżownica unika słońca, a po deszczu wychodzi na powierzchnię, gdy w zalanej glebie brakuje powietrza.",
      ru: "У дождевого червя нет ни лёгких, ни жабр — он дышит всей поверхностью тела. Кислород проходит только через влажную кожу, поэтому червь избегает солнца, а после дождя выползает наружу, когда в залитой почве не хватает воздуха.",
    },
    pin: [250, 24],
    to: [250, 70],
  },
  segments: {
    name: { pl: "Segmenty", ru: "Сегменты" },
    text: {
      pl: "Ciało składa się z ponad stu podobnych pierścieni — segmentów. Stąd nazwa: pierścienice. W każdym segmencie powtarzają się te same narządy.",
      ru: "Тело состоит из более чем ста похожих колец — сегментов. Отсюда и название — кольчатые черви. В каждом сегменте повторяются одни и те же органы.",
    },
    pin: [330, 30],
    to: [320, 68],
  },
  clitellum: {
    name: { pl: "Siodełko", ru: "Поясок" },
    text: {
      pl: "Jaśniejsze zgrubienie bliżej przodu ciała. Wytwarza śluzowy kokon, do którego trafiają jaja. Dżdżownica jest obojnakiem, ale do rozmnażania potrzebuje partnera.",
      ru: "Светлое утолщение ближе к переднему концу. Образует слизистый кокон, в который попадают яйца. Дождевой червь — гермафродит, но для размножения ему нужен партнёр.",
    },
    pin: [124, 26],
    to: [124, 66],
  },
  bristles: {
    name: { pl: "Szczecinki", ru: "Щетинки" },
    text: {
      pl: "Na każdym segmencie są krótkie, sztywne szczecinki. Dżdżownica zapiera się nimi o ściany korytarza, żeby się nie cofać.",
      ru: "На каждом сегменте есть короткие жёсткие щетинки. Червь упирается ими в стенки хода, чтобы не соскальзывать назад.",
    },
    pin: [200, 150],
    to: [200, 104],
  },
  mouth: {
    name: { pl: "Przód ciała z otworem gębowym", ru: "Передний конец со ртом" },
    text: {
      pl: "Dżdżownica przepuszcza przez przewód pokarmowy ziemię z resztkami roślin i trawi to, co organiczne. Resztki wydala na zewnątrz — z nich powstaje żyzna próchnica.",
      ru: "Червь пропускает через кишечник землю с остатками растений и переваривает органику. Остатки выбрасывает наружу — из них получается плодородный гумус.",
    },
    pin: [30, 30],
    to: [26, 72],
  },
  vessels: {
    name: { pl: "Zamknięty układ krwionośny", ru: "Замкнутая кровеносная система" },
    text: {
      pl: "Krew płynie tylko w naczyniach: grzbietowym i brzusznym, połączonych w przedniej części ciała kilkoma pulsującymi naczyniami, które działają jak serca.",
      ru: "Кровь течёт только по сосудам: спинному и брюшному, соединённым в передней части тела несколькими пульсирующими сосудами, которые работают как сердца.",
    },
  },
  sac: {
    name: { pl: "Wór powłokowo-mięśniowy", ru: "Кожно-мускульный мешок" },
    text: {
      pl: "Pod skórą leżą dwie warstwy mięśni: okrężne i podłużne. Razem ze skórą tworzą wór powłokowo-mięśniowy, który porusza całym ciałem — zobacz drugi blok.",
      ru: "Под кожей лежат два слоя мышц: кольцевые и продольные. Вместе с кожей они образуют кожно-мускульный мешок, который двигает всё тело, — посмотри второй блок.",
    },
  },
};

const BODY = "M20 82 C 20 66, 40 64, 60 64 L 340 68 C 370 68, 384 76, 384 82 C 384 88, 370 96, 340 96 L 60 100 C 40 100, 20 98, 20 82 Z";
const RINGS = Array.from({ length: 36 }, (_, i) => 44 + i * 9.2);

export function EarthwormMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<WormPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 190"
      title={{ pl: "Budowa dżdżownicy", ru: "Строение дождевого червя" }}
      labelOrder={["skin", "segments", "clitellum", "bristles", "mouth"]}
      pinRadius={15}
      maxWidth="max-w-[480px]"
      art={({ part, tone }) => (
        <>
          {part(
            "bristles",
            <g>
              {RINGS.filter((_, i) => i % 2 === 0).map((x) => (
                <path key={x} d={`M${x} 99 l -3 6 M${x + 4} 99 l -3 6`} stroke={tone("bristles", "#9f1239")} strokeWidth={1.5} />
              ))}
              <rect x={40} y={98} width={330} height={12} fill="transparent" />
            </g>,
          )}
          {part("skin", <path d={BODY} fill={tone("skin", "#fda4af")} stroke="#be123c" strokeWidth={2} />)}
          {part(
            "segments",
            <g>
              {RINGS.map((x) => (
                <g key={x}>
                  <path d={`M${x} 66 Q ${x + 3} 82 ${x} 98`} fill="none" stroke={tone("segments", "#e11d48")} strokeWidth={1} opacity={0.7} />
                  <path d={`M${x} 66 Q ${x + 3} 82 ${x} 98`} fill="none" stroke="transparent" strokeWidth={5} />
                </g>
              ))}
            </g>,
          )}
          {part("clitellum", <rect x={104} y={64} width={40} height={36} rx={6} fill={tone("clitellum", "#fb7185")} stroke="#9f1239" strokeWidth={1.5} />)}
          {part("mouth", <circle cx={24} cy={82} r={5} fill={tone("mouth", "#881337")} />)}
        </>
      )}
      overlay={(active) => (
        <g pointerEvents="none">
          {active === "vessels" && (
            <g fill="none" stroke="#dc2626" strokeWidth={3}>
              <path d="M30 76 L 370 76" />
              <path d="M30 90 L 370 90" />
              {[56, 66, 76, 86, 96].map((x) => (
                <path key={x} d={`M${x} 76 C ${x - 6} 80, ${x - 6} 86, ${x} 90`} strokeWidth={2.5} />
              ))}
            </g>
          )}
          {active === "sac" && (
            <g>
              <path d="M300 96 L 312 124" stroke="#9f1239" strokeWidth={1.5} strokeDasharray="3 3" />
              <circle cx={330} cy={152} r={34} fill="#fda4af" stroke="#be123c" strokeWidth={3} />
              <circle cx={330} cy={152} r={29} fill="none" stroke="#dc2626" strokeWidth={6} />
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return <circle key={i} cx={330 + Math.cos(a) * 20} cy={152 + Math.sin(a) * 20} r={4} fill="#991b1b" />;
              })}
              <circle cx={330} cy={152} r={8} fill="#fde68a" stroke="#ca8a04" strokeWidth={1.5} />
            </g>
          )}
        </g>
      )}
    />
  );
}

// ---------- crawling ----------

const CRAWL = {
  play: { pl: "▶ Pełznij", ru: "▶ Ползи" },
  stop: { pl: "⏸ Stop", ru: "⏸ Стоп" },
  steps: [
    { pl: "Mięśnie okrężne przedniej części kurczą się — przód robi się cienki i długi i wysuwa się do przodu.", ru: "Кольцевые мышцы переднего конца сокращаются — он становится тонким и длинным и вытягивается вперёд." },
    { pl: "Szczecinki zapierają się o glebę, a mięśnie podłużne skracają ciało — robi się grube i krótkie.", ru: "Щетинки упираются в почву, а продольные мышцы укорачивают тело — оно становится толстым и коротким." },
    { pl: "Fala skurczów biegnie od przodu do tyłu i podciąga resztę ciała. Śluz ułatwia przesuwanie się w korytarzu.", ru: "Волна сокращений бежит от переднего конца к заднему и подтягивает остальное тело. Слизь облегчает скольжение по ходу." },
  ] satisfies Txt[],
};

const N = 14;
const STYLE = `
.cw-seg{transform-box:fill-box;transform-origin:center}
.cw.on .cw-seg{animation:cwWave 1.6s ease-in-out infinite}
.cw.on .cw-body{animation:cwMove 9s linear infinite}
@keyframes cwWave{0%,100%{transform:scale(1,1)}25%{transform:scale(1.35,.7)}60%{transform:scale(.8,1.25)}}
@keyframes cwMove{from{transform:translateX(0)}to{transform:translateX(-60px)}}
@media (prefers-reduced-motion: reduce){.cw.on .cw-seg,.cw.on .cw-body{animation:none}}
`;

export function Crawl({ lang }: { lang: BioLang }) {
  const [on, setOn] = useState(false);
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 320 120" className={`cw w-full ${on ? "on" : ""}`} role="img" aria-label={lang === "pl" ? "Pełzanie dżdżownicy" : "Как ползёт дождевой червь"}>
          <style>{STYLE}</style>
          <rect width={320} height={120} rx={12} fill="#a16207" />
          <rect x={0} y={40} width={320} height={44} fill="#713f12" />
          <g className="cw-body">
            {Array.from({ length: N }, (_, i) => (
              <ellipse key={i} className="cw-seg" style={{ animationDelay: `${i * 0.11}s` }} cx={70 + i * 14} cy={62} rx={9} ry={11} fill={i === 3 ? "#fb7185" : "#fda4af"} stroke="#be123c" strokeWidth={1} />
            ))}
          </g>
        </svg>
        <div className="mt-3">
          <Choice state="active" onClick={() => setOn(!on)}>
            {on ? CRAWL.stop[lang] : CRAWL.play[lang]}
          </Choice>
        </div>
      </div>
      <ol className="space-y-2">
        {CRAWL.steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">{i + 1}</span>
            {s[lang]}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------- soil with and without earthworms ----------

const SOIL = {
  without: { pl: "Bez dżdżownic", ru: "Без червей" },
  with: { pl: "Z dżdżownicami", ru: "С червями" },
  withoutText: {
    pl: "Gleba jest zbita, słabo przepuszcza wodę i powietrze. Opadłe liście długo leżą na powierzchni. Korzenie rosną z trudem.",
    ru: "Почва плотная, плохо пропускает воду и воздух. Опавшие листья долго лежат на поверхности. Корням трудно расти.",
  },
  withText: {
    pl: "Korytarze spulchniają i napowietrzają glebę, deszcz łatwo w nią wsiąka. Dżdżownice wciągają liście pod ziemię i zjadają je, a ich odchody tworzą żyzną próchnicę. Rośliny rosną lepiej — dlatego dżdżownice to sprzymierzeńcy ogrodników.",
    ru: "Ходы рыхлят и проветривают почву, дождь легко в неё впитывается. Черви затаскивают листья под землю и съедают их, а их выделения образуют плодородный гумус. Растения растут лучше — поэтому дождевые черви — друзья садоводов.",
  },
} satisfies Record<string, Txt>;

export function Soil({ lang }: { lang: BioLang }) {
  const [worms, setWorms] = useState(false);
  return (
    <div>
      <div className="mb-3 flex gap-2" role="radiogroup">
        {[false, true].map((w) => (
          <button
            key={String(w)}
            type="button"
            role="radio"
            aria-checked={worms === w}
            onClick={() => setWorms(w)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              worms === w ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {w ? SOIL.with[lang] : SOIL.without[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 300 200" className="w-full" role="img" aria-label={worms ? SOIL.with[lang] : SOIL.without[lang]}>
          <rect width={300} height={200} rx={12} fill="#e0f2fe" />
          <rect y={70} width={300} height={130} fill={worms ? "#78350f" : "#a8a29e"} />
          {worms && <rect y={70} width={300} height={24} fill="#451a03" />}
          {[60, 150, 240].map((x) => {
            const h = worms ? 54 : 26;
            return (
              <g key={x}>
                <path d={`M${x} 70 L ${x} ${70 - h}`} stroke="#15803d" strokeWidth={4} />
                <ellipse cx={x - 10} cy={70 - h * 0.6} rx={10} ry={5} fill="#22c55e" />
                <ellipse cx={x + 10} cy={70 - h * 0.85} rx={10} ry={5} fill="#22c55e" />
                <path d={`M${x} 70 L ${x - 12} ${70 + (worms ? 60 : 24)} M${x} 70 L ${x + 10} ${70 + (worms ? 70 : 20)} M${x} 70 L ${x} ${70 + (worms ? 80 : 30)}`} stroke="#fef3c7" strokeWidth={2} />
              </g>
            );
          })}
          {!worms &&
            [30, 110, 200, 270].map((x) => <ellipse key={x} cx={x} cy={66} rx={14} ry={4} fill="#b45309" />)}
          {worms && (
            <g>
              <path d="M30 70 C 40 110, 20 140, 50 180 M110 70 C 100 100, 130 130, 110 170 M200 70 C 220 110, 190 140, 220 190 M270 70 C 260 100, 280 120, 260 160" fill="none" stroke="#a16207" strokeWidth={8} strokeLinecap="round" />
              <path d="M44 160 C 50 170, 56 172, 52 182" fill="none" stroke="#fda4af" strokeWidth={6} strokeLinecap="round" />
              <path d="M212 170 C 218 178, 222 184, 220 192" fill="none" stroke="#fda4af" strokeWidth={6} strokeLinecap="round" />
              {[
                [110, 110], [260, 120],
              ].map(([x, y]) => (
                <ellipse key={`${x}`} cx={x} cy={y} rx={6} ry={3} fill="#b45309" />
              ))}
            </g>
          )}
        </svg>
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-amber-950 ring-1 ring-amber-200" aria-live="polite">
          {worms ? SOIL.withText[lang] : SOIL.withoutText[lang]}
        </p>
      </div>
    </div>
  );
}
