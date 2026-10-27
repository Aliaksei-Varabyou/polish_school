// Block 2 of the cnidarians lesson: one stinging cell in close-up. Touching its trigger fires the
// coiled thread into a water flea.
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import { Choice, KIT, type Txt } from "@portal/lessons";

const T = {
  touch: { pl: "👆 Dotknij włoska czuciowego", ru: "👆 Задеть чувствительный волосок" },
  steps: [
    { pl: "W komórce parzydełkowej leży pęcherzyk z jadem i zwiniętą nicią.", ru: "В стрекательной клетке лежит капсула с ядом и свёрнутой нитью." },
    { pl: "Ofiara dotyka włoska czuciowego — to sygnał do strzału.", ru: "Добыча касается чувствительного волоска — это сигнал к выстрелу." },
    { pl: "Nić wystrzeliwuje w ułamku sekundy, przebija ciało ofiary i wstrzykuje jad. Ofiara zostaje sparaliżowana, a czułki wciągają ją do otworu gębowego.", ru: "Нить вылетает за доли секунды, пробивает тело добычи и впрыскивает яд. Добыча парализована, а щупальца втягивают её в рот." },
    { pl: "Każda komórka strzela tylko raz — potem na jej miejsce wyrasta nowa.", ru: "Каждая клетка стреляет только один раз — потом на её месте вырастает новая." },
  ] satisfies Txt[],
};

const STYLE = `
.st-thread{stroke-dasharray:240;stroke-dashoffset:240}
.st.fired .st-thread{animation:stShoot .35s ease-out forwards}
.st.fired .st-coil{opacity:0;transition:opacity .1s}
.st.fired .st-flea{animation:stHit 1.2s .35s forwards}
@keyframes stShoot{to{stroke-dashoffset:0}}
@keyframes stHit{0%{transform:rotate(0)}30%{transform:rotate(-8deg)}100%{transform:rotate(-20deg) translate(0,6px);opacity:.55}}
.st-flea{transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion: reduce){.st.fired .st-thread,.st.fired .st-flea{animation:none;stroke-dashoffset:0}}
`;

export function Stinger({ lang }: { lang: BioLang }) {
  const [fired, setFired] = useState(0);
  const step = fired === 0 ? 1 : 3;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg key={fired} viewBox="0 0 320 170" className={`st w-full ${fired ? "fired" : ""}`} role="img" aria-label={lang === "pl" ? "Komórka parzydełkowa" : "Стрекательная клетка"}>
          <style>{STYLE}</style>
          <rect width={320} height={170} rx={12} fill="#ecfeff" />
          <ellipse cx={70} cy={92} rx={50} ry={40} fill="#fef9c3" stroke="#ca8a04" strokeWidth={2} />
          <ellipse cx={74} cy={90} rx={26} ry={18} fill="#fde68a" stroke="#a16207" strokeWidth={2} />
          <path className="st-coil" d="M62 90 c 4 -10, 18 -10, 20 0 c 2 8, -12 10, -12 2 c 0 -6, 8 -6, 8 0" fill="none" stroke="#7c2d12" strokeWidth={2} />
          <path d="M100 82 L 118 62" stroke="#a16207" strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={46} cy={112} r={7} fill="#a78bfa" />
          <path className="st-thread" d="M100 90 C 150 86, 190 94, 248 92" fill="none" stroke="#7c2d12" strokeWidth={2.5} strokeLinecap="round" />
          <g className="st-flea">
            <ellipse cx={262} cy={92} rx={20} ry={14} fill="#bae6fd" stroke="#0369a1" strokeWidth={1.5} />
            <circle cx={250} cy={86} r={3} fill="#0f172a" />
            <path d="M246 80 L 236 64 M246 80 L 230 72 M276 100 L 290 110" stroke="#0369a1" strokeWidth={2} strokeLinecap="round" />
          </g>
          <text x={118} y={56} fontSize={10} fill="#a16207">
            {lang === "pl" ? "włosek czuciowy" : "чувствительный волосок"}
          </text>
        </svg>
        <div className="mt-3 flex gap-2">
          <Choice state="active" onClick={() => setFired(fired + 1)}>
            {T.touch[lang]}
          </Choice>
          {fired > 0 && <Choice onClick={() => setFired(0)}>↺ {KIT.again[lang]}</Choice>}
        </div>
      </div>
      <ol className="space-y-2" aria-live="polite">
        {T.steps.map((s, i) => (
          <li key={i} className={`flex gap-3 text-[15px] leading-relaxed transition-colors ${i <= step ? "text-slate-800" : "text-slate-400"}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${i <= step ? "bg-emerald-600" : "bg-slate-300"}`}>{i + 1}</span>
            {s[lang]}
          </li>
        ))}
      </ol>
    </div>
  );
}
