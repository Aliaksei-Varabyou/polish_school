// Radial vs bilateral symmetry: turn a line through the animal and find the planes that split it into
// mirror halves. A hydra seen from above has many; a planarian has just one. Used by the cnidarian
// and the kingdom lessons.
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../lang.ts";
import type { Txt } from "../kit.tsx";

const T = {
  angle: { pl: "Obróć płaszczyznę", ru: "Поверни плоскость" },
  yes: { pl: "✓ To płaszczyzna symetrii — połówki są lustrzanym odbiciem.", ru: "✓ Это плоскость симметрии — половинки зеркально одинаковы." },
  no: { pl: "✗ Połówki nie są jednakowe.", ru: "✗ Половинки не одинаковы." },
  found: { pl: "Znalezione płaszczyzny:", ru: "Найдено плоскостей:" },
  hydra: { pl: "Stułbia z góry — symetria promienista", ru: "Гидра сверху — радиальная симметрия" },
  planarian: { pl: "Wypławek — symetria dwuboczna", ru: "Планария — двусторонняя симметрия" },
} satisfies Record<string, Txt>;

const HYDRA = (
  <g>
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <path key={a} d="M100 100 C 100 70, 104 50, 100 22" transform={`rotate(${a} 100 100)`} stroke="#84cc16" strokeWidth={8} strokeLinecap="round" fill="none" />
    ))}
    <circle cx={100} cy={100} r={26} fill="#a3e635" stroke="#4d7c0f" strokeWidth={2} />
    <circle cx={100} cy={100} r={6} fill="#365314" />
  </g>
);

const PLANARIAN = (
  <g>
    <path d="M100 22 C 128 22, 132 50, 124 60 C 136 90, 132 150, 100 182 C 68 150, 64 90, 76 60 C 68 50, 72 22, 100 22 Z" fill="#e7e5e4" stroke="#78716c" strokeWidth={2} />
    <path d="M78 34 L 66 26 M122 34 L 134 26" stroke="#78716c" strokeWidth={3} strokeLinecap="round" />
    <circle cx={90} cy={44} r={4} fill="#0f172a" />
    <circle cx={110} cy={44} r={4} fill="#0f172a" />
    <ellipse cx={100} cy={110} rx={6} ry={14} fill="#a8a29e" />
  </g>
);

function Panel({ lang, title, art, planes }: { lang: BioLang; title: Txt; art: ReactNode; planes: number[] }) {
  const [angle, setAngle] = useState(45);
  const [found, setFound] = useState<Set<number>>(new Set());
  const hit = planes.includes(angle % 180);
  const update = (a: number) => {
    setAngle(a);
    if (planes.includes(a % 180)) setFound(new Set(found).add(a % 180));
  };
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <h3 className="text-sm font-semibold text-slate-800">{title[lang]}</h3>
      <svg viewBox="0 0 200 200" className="mx-auto mt-2 w-full max-w-[200px]" role="img" aria-label={title[lang]}>
        {art}
        <path d="M100 -10 L 100 210" transform={`rotate(${angle} 100 100)`} stroke={hit ? "#059669" : "#e11d48"} strokeWidth={3} strokeDasharray="8 5" />
      </svg>
      <label className="mt-2 block text-xs font-medium text-slate-600">
        {T.angle[lang]}
        <input type="range" min={0} max={165} step={15} value={angle} onChange={(e) => update(Number(e.target.value))} className="mt-1 h-2 w-full cursor-pointer accent-emerald-600" />
      </label>
      <p className={`mt-2 text-sm ${hit ? "text-emerald-700" : "text-rose-700"}`} role="status">
        {hit ? T.yes[lang] : T.no[lang]}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {T.found[lang]} {found.size} / {planes.length}
      </p>
    </div>
  );
}

export function Symmetry({ lang }: { lang: BioLang }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* the drawn hydra has six tentacles, so it has six mirror planes; the real one, many */}
      <Panel lang={lang} title={T.hydra} art={HYDRA} planes={[0, 30, 60, 90, 120, 150]} />
      <Panel lang={lang} title={T.planarian} art={PLANARIAN} planes={[0]} />
    </div>
  );
}
