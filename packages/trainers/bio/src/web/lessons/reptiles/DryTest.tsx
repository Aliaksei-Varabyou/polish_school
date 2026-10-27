// Block 3 of the reptiles lesson: why reptiles could leave the water. Frog spawn and a lizard's egg
// lie side by side on dry sand; the slider adds hours of sunshine.
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import type { Txt } from "@portal/lessons";

const T = {
  hours: { pl: "Godziny na słońcu", ru: "Часов на солнце" },
  spawn: { pl: "Skrzek żaby", ru: "Икра лягушки" },
  egg: { pl: "Jajo jaszczurki", ru: "Яйцо ящерицы" },
  start: {
    pl: "Oba zarodki są jeszcze bezpieczne. Przesuń suwak i zobacz, co zrobi z nimi słońce.",
    ru: "Оба зародыша пока в безопасности. Подвинь ползунок и посмотри, что с ними сделает солнце.",
  },
  drying: {
    pl: "Galareta skrzeku traci wodę i kurczy się. Jajo gada wygląda tak samo — skórzasta osłonka zatrzymuje wodę w środku.",
    ru: "Студень икры теряет воду и сжимается. Яйцо пресмыкающегося не изменилось — кожистая оболочка удерживает воду внутри.",
  },
  dry: {
    pl: "Skrzek wysechł — zarodki zginęły. Jajo gada przetrwało: osłonka chroni zarodek przed wyschnięciem. Dlatego gady mogą składać jaja na lądzie, a płazy muszą wracać do wody.",
    ru: "Икра высохла — зародыши погибли. Яйцо пресмыкающегося уцелело: оболочка защищает зародыш от высыхания. Поэтому пресмыкающиеся откладывают яйца на суше, а земноводным приходится возвращаться в воду.",
  },
} satisfies Record<string, Txt>;

export function DryTest({ lang }: { lang: BioLang }) {
  const [hours, setHours] = useState(0);
  const k = 1 - hours / 8; // how much water the spawn still holds
  const note = hours === 0 ? T.start : hours < 6 ? T.drying : T.dry;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 300 170" className="mx-auto w-full max-w-[380px]" role="img" aria-label={`${T.hours[lang]}: ${hours}`}>
        <rect width={300} height={170} rx={12} fill="#fef3c7" />
        <circle cx={262} cy={30} r={16 + hours} fill="#fbbf24" opacity={0.4 + hours / 16} />
        <rect y={110} width={300} height={60} fill="#fcd34d" />
        <g>
          {[
            [56, 96], [74, 92], [92, 98], [64, 108], [84, 110], [102, 106], [48, 110],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y! + (1 - k) * 8} r={Math.max(3.5, 10 * k)} fill="white" opacity={0.3 + 0.5 * k} stroke={k < 0.3 ? "#a16207" : "#93c5fd"} strokeWidth={1} />
              <circle cx={x} cy={y! + (1 - k) * 8} r={3.5} fill={k < 0.3 ? "#57534e" : "#1c1917"} />
            </g>
          ))}
          <text x={76} y={150} textAnchor="middle" fontSize={12} fill="#78350f">
            {T.spawn[lang]}
          </text>
        </g>
        <g>
          <ellipse cx={212} cy={98} rx={16} ry={22} fill="#fafaf9" stroke="#a8a29e" strokeWidth={2} />
          <path d="M202 90 q 10 -6 20 0" fill="none" stroke="#d6d3d1" strokeWidth={1.5} />
          <text x={212} y={150} textAnchor="middle" fontSize={12} fill="#78350f">
            {T.egg[lang]}
          </text>
        </g>
      </svg>
      <div className="space-y-3">
        <label htmlFor="dry-hours" className="text-sm font-semibold text-slate-700">
          {T.hours[lang]}: <span className="text-amber-700">{hours}</span>
        </label>
        <input id="dry-hours" type="range" min={0} max={8} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="h-2 w-full cursor-pointer accent-amber-600" />
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-amber-950 ring-1 ring-amber-200" aria-live="polite">
          {note[lang]}
        </p>
      </div>
    </div>
  );
}
