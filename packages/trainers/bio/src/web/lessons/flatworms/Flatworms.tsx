// Drawings and interactives of the flatworms lesson: the planarian, a tapeworm's head and chain.
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "@portal/lessons";
import type { Txt } from "@portal/lessons";

type PlanariaPart = "eyes" | "body" | "pharynx" | "gut" | "cilia";

const PARTS: Record<PlanariaPart, MapPart> = {
  eyes: {
    name: { pl: "Oczka", ru: "Глазки" },
    text: {
      pl: "Dwa proste oczka na przodzie ciała. Nie widzą obrazów, ale odróżniają światło od cienia — wypławek ucieka przed światłem pod kamienie.",
      ru: "Два простых глазка на переднем конце тела. Они не видят изображения, но отличают свет от тени — планария уползает от света под камни.",
    },
    pin: [60, 40],
    to: [138, 72],
  },
  body: {
    name: { pl: "Płaskie ciało", ru: "Плоское тело" },
    text: {
      pl: "Ciało jest spłaszczone grzbietowo-brzusznie, a jedna płaszczyzna dzieli je na dwie lustrzane połowy — to symetria dwuboczna. Ma wyraźny przód (z oczkami) i tył.",
      ru: "Тело сплющено в спинно-брюшном направлении, и одна плоскость делит его на две зеркальные половинки — это двусторонняя симметрия. Есть явный передний конец (с глазками) и задний.",
    },
    pin: [250, 230],
    to: [176, 200],
  },
  pharynx: {
    name: { pl: "Gardziel", ru: "Глотка" },
    text: {
      pl: "Otwór gębowy leży na środku brzusznej strony. Wypławek wysuwa przez niego gardziel jak rurkę i wsysa nią pokarm — drobne zwierzęta.",
      ru: "Рот находится посередине брюшной стороны. Через него планария выдвигает глотку, как трубочку, и всасывает ею пищу — мелких животных.",
    },
    pin: [250, 120],
    to: [158, 160],
  },
  gut: {
    name: { pl: "Rozgałęzione jelito", ru: "Ветвистый кишечник" },
    text: {
      pl: "Jelito rozgałęzia się po całym ciele i rozprowadza pokarm do wszystkich komórek. Ma tylko jeden otwór — ten sam, przez który wpada pokarm.",
      ru: "Кишечник ветвится по всему телу и разносит пищу ко всем клеткам. У него только одно отверстие — то же, через которое поступает пища.",
    },
  },
  cilia: {
    name: { pl: "Rzęski", ru: "Реснички" },
    text: {
      pl: "Spód ciała pokrywają drobne rzęski. Ich ruch i śluz pozwalają wypławkowi płynnie sunąć po kamieniach.",
      ru: "Нижнюю сторону тела покрывают крошечные реснички. Их движение и слизь позволяют планарии плавно скользить по камням.",
    },
    pin: [50, 200],
    to: [116, 196],
  },
};

const OUTLINE = "M150 40 C 182 40, 190 70, 178 84 C 194 120, 190 200, 150 262 C 110 200, 106 120, 122 84 C 110 70, 118 40, 150 40 Z";

export function PlanariaMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<PlanariaPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 300 280"
      title={{ pl: "Budowa wypławka", ru: "Строение планарии" }}
      labelOrder={["eyes", "body", "pharynx", "cilia"]}
      maxWidth="max-w-[340px]"
      art={({ part, tone }) => (
        <>
          {part(
            "cilia",
            <g>
              <path d={OUTLINE} fill="none" stroke={tone("cilia", "#a8a29e")} strokeWidth={10} strokeDasharray="1.5 3" />
            </g>,
          )}
          {part("body", <path d={OUTLINE} fill={tone("body", "#e7e5e4")} stroke="#78716c" strokeWidth={2} />)}
          {part(
            "pharynx",
            <g>
              <ellipse cx={150} cy={160} rx={9} ry={24} fill={tone("pharynx", "#d6d3d1")} stroke="#78716c" strokeWidth={1.5} />
              <circle cx={150} cy={170} r={3} fill="#57534e" />
            </g>,
          )}
          {part(
            "eyes",
            <g>
              <circle cx={140} cy={70} r={7} fill={tone("eyes", "white")} />
              <circle cx={160} cy={70} r={7} fill={tone("eyes", "white")} />
              <circle cx={141} cy={71} r={4} fill="#0f172a" />
              <circle cx={159} cy={71} r={4} fill="#0f172a" />
            </g>,
          )}
        </>
      )}
      overlay={(active) =>
        active === "gut" && (
          <g pointerEvents="none" fill="none" stroke="#ea580c" strokeWidth={4} strokeLinecap="round" opacity={0.85}>
            <path d="M150 140 L 150 96 M150 180 L 140 240 M150 180 L 160 240" />
            {[100, 116, 132, 196, 212, 228].map((y) => (
              <path key={y} d={`M150 ${y > 180 ? y - 30 : y} L ${126 + (y > 180 ? 4 : 0)} ${y} M150 ${y > 180 ? y - 30 : y} L ${174 - (y > 180 ? 4 : 0)} ${y}`} strokeWidth={2.5} />
            ))}
          </g>
        )
      }
    />
  );
}

// ---------- tapeworm: armed or unarmed ----------

const TW = {
  armed: { pl: "Tasiemiec uzbrojony", ru: "Свиной цепень" },
  unarmed: { pl: "Tasiemiec nieuzbrojony", ru: "Бычий цепень" },
  armedText: {
    pl: "Główka ma cztery przyssawki i wieniec haczyków — stąd „uzbrojony”. Zarażamy się nim, jedząc surową lub niedogotowaną wieprzowinę.",
    ru: "На головке четыре присоски и венчик крючьев — отсюда название «вооружённый». Им заражаются, съев сырую или недоваренную свинину.",
  },
  unarmedText: {
    pl: "Główka ma tylko cztery przyssawki, bez haczyków. Zarażamy się nim, jedząc surową lub niedogotowaną wołowinę, np. tatar.",
    ru: "На головке только четыре присоски, без крючьев. Им заражаются, съев сырую или недоваренную говядину, например тартар.",
  },
  parts: [
    { pl: "Główka — przytwierdza się do ściany jelita.", ru: "Головка — прикрепляется к стенке кишечника." },
    { pl: "Szyjka — stale wytwarza nowe człony, więc tasiemiec rośnie, nawet do kilku metrów.", ru: "Шейка — всё время образует новые членики, поэтому цепень растёт, даже до нескольких метров." },
    { pl: "Człony — każdy ma męskie i żeńskie narządy rozrodcze (obojnactwo). Ostatnie są pełne jaj i odrywają się.", ru: "Членики — в каждом есть мужские и женские половые органы (гермафродитизм). Последние заполнены яйцами и отрываются." },
  ] satisfies Txt[],
  noGut: {
    pl: "Tasiemiec nie ma przewodu pokarmowego: wchłania strawiony już pokarm całą powierzchnią ciała.",
    ru: "У цепня нет пищеварительной системы: он всасывает уже переваренную хозяином пищу всей поверхностью тела.",
  },
} satisfies Record<string, Txt | Txt[]>;

export function Tapeworm({ lang }: { lang: BioLang }) {
  const [armed, setArmed] = useState(true);
  return (
    <div>
      <div className="mb-3 flex gap-2" role="radiogroup">
        {[true, false].map((a) => (
          <button
            key={String(a)}
            type="button"
            role="radio"
            aria-checked={armed === a}
            onClick={() => setArmed(a)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              armed === a ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {a ? TW.armed[lang] : TW.unarmed[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 320 150" className="w-full" role="img" aria-label={armed ? TW.armed[lang] : TW.unarmed[lang]}>
          <rect width={320} height={150} rx={12} fill="#fff1f2" />
          <circle cx={40} cy={75} r={24} fill="#fef3c7" stroke="#a16207" strokeWidth={2} />
          {[
            [30, 62], [50, 62], [30, 88], [50, 88],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={7} fill="#fde68a" stroke="#a16207" strokeWidth={1.5} />
          ))}
          {armed &&
            Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <path key={i} d={`M${40 + Math.cos(a) * 5} ${75 + Math.sin(a) * 5} l ${Math.cos(a) * 9} ${Math.sin(a) * 9}`} stroke="#7c2d12" strokeWidth={2} strokeLinecap="round" />;
            })}
          <path d="M62 70 L 96 72 L 96 78 L 62 80 Z" fill="#fef3c7" stroke="#a16207" strokeWidth={1.5} />
          {Array.from({ length: 9 }, (_, i) => {
            const w = 8 + i * 2.6;
            const h = 6 + i * 2.2;
            const x = 96 + Array.from({ length: i }, (_, k) => 8 + k * 2.6 + 1).reduce((s, v) => s + v, 0);
            return (
              <g key={i}>
                <rect x={x} y={75 - h / 2} width={w} height={h} rx={2} fill="#fef3c7" stroke="#a16207" strokeWidth={1.2} />
                {i > 5 && Array.from({ length: 4 }, (_, k) => <circle key={k} cx={x + 4 + k * (w - 8) / 3} cy={75} r={1.6} fill="#a16207" />)}
              </g>
            );
          })}
          <text x={40} y={130} textAnchor="middle" fontSize={10} fill="#9f1239">
            {lang === "pl" ? "główka" : "головка"}
          </text>
          <text x={80} y={100} textAnchor="middle" fontSize={10} fill="#9f1239">
            {lang === "pl" ? "szyjka" : "шейка"}
          </text>
          <text x={230} y={130} textAnchor="middle" fontSize={10} fill="#9f1239">
            {lang === "pl" ? "człony z jajami →" : "членики с яйцами →"}
          </text>
        </svg>
        <div className="space-y-2 text-[15px] leading-relaxed text-slate-700">
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-rose-950 ring-1 ring-rose-200" aria-live="polite">
            {armed ? TW.armedText[lang] : TW.unarmedText[lang]}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {TW.parts.map((p) => (
              <li key={p.pl}>{p[lang]}</li>
            ))}
            <li>{TW.noGut[lang]}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
