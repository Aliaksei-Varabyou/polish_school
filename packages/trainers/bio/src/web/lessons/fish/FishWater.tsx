// Blocks 2 and 3 of the fish lesson: how water flows over the gills, and how the swim bladder sets
// the depth.
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import type { Txt } from "@portal/lessons";

const GILL_STEPS: Txt[] = [
  { pl: "Ryba otwiera pysk i nabiera wody.", ru: "Рыба открывает рот и набирает воду." },
  { pl: "Zamyka pysk i przepycha wodę przez skrzela. Krew w listkach skrzelowych pobiera z wody rozpuszczony tlen i oddaje dwutlenek węgla.", ru: "Закрывает рот и проталкивает воду через жабры. Кровь в жаберных лепестках забирает растворённый в воде кислород и отдаёт углекислый газ." },
  { pl: "Woda wypływa na zewnątrz spod uniesionych pokryw skrzelowych.", ru: "Вода выходит наружу из-под приподнятых жаберных крышек." },
];

const STYLE = `
.gf-flow{stroke-dasharray:6 10;animation:gfFlow 1.2s linear infinite}
.gf-o2{animation:gfO2 2.4s ease-in infinite}
@keyframes gfFlow{to{stroke-dashoffset:-32}}
@keyframes gfO2{0%{transform:translate(0,0);opacity:1}80%{opacity:1}100%{transform:translate(6px,10px);opacity:0}}
@media (prefers-reduced-motion: reduce){.gf-flow,.gf-o2{animation:none}}
`;

export function GillsFlow({ lang }: { lang: BioLang }) {
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 300 180" className="mx-auto w-full max-w-[380px]" role="img" aria-label={lang === "pl" ? "Przepływ wody przez skrzela" : "Ток воды через жабры"}>
        <style>{STYLE}</style>
        <rect width={300} height={180} rx={12} fill="#e0f2fe" />
        <path d="M60 90 C 90 30, 220 30, 290 70 L 290 110 C 220 150, 90 150, 60 90 Z" fill="#7dd3fc" stroke="#0369a1" strokeWidth={2} />
        <path d="M150 52 C 170 76, 170 106, 150 130" fill="none" stroke="#0369a1" strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${136 - i * 8} ${60 + i * 6} C ${152 - i * 6} 80, ${152 - i * 6} 102, ${136 - i * 8} ${122 - i * 6}`} fill="none" stroke="#dc2626" strokeWidth={6} />
        ))}
        <circle cx={92} cy={74} r={7} fill="white" stroke="#0369a1" />
        <circle cx={91} cy={74} r={4} fill="#0f172a" />
        <path className="gf-flow" d="M6 92 L 62 92 C 90 92, 110 92, 128 92 C 150 92, 160 120, 168 150 L 176 176" fill="none" stroke="#0284c7" strokeWidth={4} strokeLinecap="round" />
        <path d="M8 84 L 20 92 L 8 100" fill="none" stroke="#0284c7" strokeWidth={3} />
        {[
          [112, 86],
          [118, 98],
          [106, 94],
        ].map(([x, y], i) => (
          <g key={i} className="gf-o2" style={{ animationDelay: `${i * 0.7}s` }}>
            <circle cx={x} cy={y} r={5} fill="white" stroke="#0284c7" />
            <text x={x} y={y! + 2.5} textAnchor="middle" fontSize={5.5} fontWeight={700} fill="#0369a1">
              O₂
            </text>
          </g>
        ))}
        <text x={14} y={74} fontSize={11} fill="#0369a1">
          {lang === "pl" ? "woda" : "вода"}
        </text>
      </svg>
      <ol className="space-y-2">
        {GILL_STEPS.map((s, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">{i + 1}</span>
            {s[lang]}
          </li>
        ))}
      </ol>
    </div>
  );
}

const B = {
  gas: { pl: "Gaz w pęcherzu pławnym", ru: "Газ в плавательном пузыре" },
  low: {
    pl: "Mało gazu: ryba jest cięższa od wody i opada ku dnu.",
    ru: "Газа мало: рыба тяжелее воды и опускается ко дну.",
  },
  mid: {
    pl: "W sam raz: ryba „wisi” w wodzie na tej głębokości bez machania płetwami — oszczędza siły.",
    ru: "В самый раз: рыба «висит» в воде на этой глубине, не работая плавниками, — экономит силы.",
  },
  high: {
    pl: "Dużo gazu: ryba robi się lżejsza i unosi się ku powierzchni.",
    ru: "Газа много: рыба становится легче и всплывает к поверхности.",
  },
  shark: {
    pl: "Rekiny i płaszczki nie mają pęcherza pławnego — żeby nie opaść na dno, muszą cały czas pływać.",
    ru: "У акул и скатов плавательного пузыря нет — чтобы не опуститься на дно, им приходится всё время плыть.",
  },
} satisfies Record<string, Txt>;

export function Buoyancy({ lang }: { lang: BioLang }) {
  const [gas, setGas] = useState(50);
  // the fish's depth follows the gas: little gas → bottom, a lot → surface
  const y = 140 - gas * 1.1;
  const note = gas < 35 ? B.low : gas > 65 ? B.high : B.mid;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 300 190" className="mx-auto w-full max-w-[380px]" role="img" aria-label={`${B.gas[lang]}: ${gas}%`}>
        <defs>
          <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bae6fd" />
            <stop offset="1" stopColor="#0c4a6e" />
          </linearGradient>
        </defs>
        <rect width={300} height={190} rx={12} fill="url(#deep)" />
        <path d="M0 176 C 60 168, 120 182, 180 172 S 270 170, 300 178 L 300 190 L 0 190 Z" fill="#a16207" />
        <g style={{ transform: `translate(0px, ${y}px)`, transition: "transform .6s ease" }}>
          <path d="M100 30 C 120 6, 190 6, 220 24 L 238 34 L 220 44 C 190 60, 120 56, 100 30 Z" fill="#7dd3fc" stroke="#0369a1" strokeWidth={2} />
          <path d="M220 34 L 252 14 L 246 34 L 252 54 Z" fill="#38bdf8" stroke="#0369a1" strokeWidth={1.5} />
          <ellipse cx={170} cy={28} rx={18 + gas * 0.18} ry={4 + gas * 0.05} fill="#f1f5f9" stroke="#64748b" strokeWidth={1.5} />
          <circle cx={114} cy={26} r={4} fill="#0f172a" />
        </g>
      </svg>
      <div className="space-y-3">
        <label htmlFor="fish-gas" className="text-sm font-semibold text-slate-700">
          {B.gas[lang]}
        </label>
        <input id="fish-gas" type="range" min={0} max={100} value={gas} onChange={(e) => setGas(Number(e.target.value))} className="h-2 w-full cursor-pointer accent-sky-600" />
        <p className="rounded-xl bg-sky-50 px-4 py-3 text-[15px] leading-relaxed text-sky-950 ring-1 ring-sky-200" aria-live="polite">
          {note[lang]}
        </p>
        <p className="text-sm text-slate-500">🦈 {B.shark[lang]}</p>
      </div>
    </div>
  );
}
