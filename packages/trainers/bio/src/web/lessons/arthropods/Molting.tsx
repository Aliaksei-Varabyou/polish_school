// Block 1 of the arthropod features lesson: a hard exoskeleton does not grow. The student feeds the
// animal until it is cramped, then lets it molt; the chart of its size turns into a staircase.
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import { Choice, KIT, type Txt } from "@portal/lessons";

const T = {
  eat: { pl: "🍃 Jedz i rośnij", ru: "🍃 Ешь и расти" },
  molt: { pl: "🐚 Linienie", ru: "🐚 Линька" },
  size: { pl: "Rozmiar", ru: "Размер" },
  time: { pl: "czas", ru: "время" },
  start: {
    pl: "Ciało stawonoga okrywa twardy pancerz z chityny — szkielet zewnętrzny. Chroni i podpiera, ale… nie rośnie. Nakarm zwierzę.",
    ru: "Тело членистоногого покрыто твёрдым хитиновым панцирем — наружным скелетом. Он защищает и служит опорой, но… не растёт. Покорми животное.",
  },
  growing: { pl: "Ciało rośnie w środku pancerza.", ru: "Тело растёт внутри панциря." },
  tight: {
    pl: "Ciasno! Pancerz nie może się rozciągnąć — zwierzę przestało rosnąć. Czas na linienie.",
    ru: "Тесно! Панцирь не растягивается — животное перестало расти. Пора линять.",
  },
  soft: {
    pl: "Stary pancerz pękł i został zrzucony (to wylinka). Nowy jest jeszcze miękki — zwierzę szybko się powiększa, ale jest teraz bezbronne i chowa się. Za chwilę pancerz stwardnieje.",
    ru: "Старый панцирь лопнул и сброшен (это шкурка-экзувий). Новый пока мягкий — животное быстро увеличивается, но сейчас беззащитно и прячется. Скоро панцирь затвердеет.",
  },
  chart: {
    pl: "Wykres rośnie schodkami: stawonóg rośnie tylko tuż po linieniu.",
    ru: "График растёт ступеньками: членистоногое растёт только сразу после линьки.",
  },
} satisfies Record<string, Txt>;

export function Molting({ lang }: { lang: BioLang }) {
  const [shell, setShell] = useState(1);
  const [body, setBody] = useState(0.7);
  const [soft, setSoft] = useState(0);
  const [history, setHistory] = useState<number[]>([1]);
  const [shed, setShed] = useState(0);
  const tight = body >= shell - 0.01;

  const eat = () => {
    if (soft > 0) setSoft(soft - 1);
    const next = Math.min(shell, body + 0.15);
    setBody(next);
    setHistory([...history, shell].slice(-24));
  };
  const molt = () => {
    setShed(shell);
    const bigger = shell + 0.35;
    setShell(bigger);
    setSoft(2);
    setHistory([...history, bigger].slice(-24));
  };
  const reset = () => {
    setShell(1);
    setBody(0.7);
    setSoft(0);
    setHistory([1]);
    setShed(0);
  };
  const note = soft > 0 ? T.soft : tight ? T.tight : history.length > 1 ? T.growing : T.start;
  const s = 34 * shell;
  /** chart height of a size */
  const y = (v: number) => 92 - (v - 0.6) * 45;
  const b = 34 * body;

  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 300 150" className="w-full" role="img" aria-label={`${T.size[lang]}: ${shell.toFixed(1)}`}>
          <rect width={300} height={150} rx={12} fill="#f0fdf4" />
          {shed > 0 && (
            <g opacity={0.45}>
              <ellipse cx={58} cy={110} rx={34 * shed * 0.9} ry={34 * shed * 0.45} fill="none" stroke="#a16207" strokeWidth={2} strokeDasharray="5 3" />
              <text x={58} y={140} textAnchor="middle" fontSize={9} fill="#a16207">
                {lang === "pl" ? "wylinka" : "старый панцирь"}
              </text>
            </g>
          )}
          <g transform="translate(190 80)">
            <ellipse rx={s * 1.1} ry={s * 0.6} fill={soft > 0 ? "#fef9c3" : "#d97706"} stroke="#78350f" strokeWidth={3} style={{ transition: "all .4s" }} />
            <ellipse rx={b * 1.0} ry={b * 0.52} fill="#fcd34d" opacity={0.55} style={{ transition: "all .4s" }} />
            {[-0.5, 0, 0.5].map((k) => (
              <path key={k} d={`M${k * s} ${-s * 0.58} L ${k * s} ${s * 0.58}`} stroke="#78350f" strokeWidth={1.5} opacity={0.5} />
            ))}
            <circle cx={-s * 0.85} cy={-s * 0.15} r={4} fill="#1c1917" />
            {[-0.6, 0, 0.6].map((k) => (
              <path key={`l${k}`} d={`M${k * s} ${s * 0.55} l ${-6} ${14} M${k * s} ${-s * 0.55} l ${-6} ${-14}`} stroke="#78350f" strokeWidth={3} strokeLinecap="round" />
            ))}
          </g>
        </svg>
        <div className="mt-3 flex flex-wrap gap-2">
          <Choice state="active" disabled={tight && soft === 0} onClick={eat}>
            {T.eat[lang]}
          </Choice>
          <Choice disabled={!tight || soft > 0 || shell > 2.3} onClick={molt}>
            {T.molt[lang]}
          </Choice>
          <Choice onClick={reset}>↺ {KIT.again[lang]}</Choice>
        </div>
      </div>
      <div className="space-y-3">
        <p className={`rounded-xl px-4 py-3 text-[15px] leading-relaxed ring-1 ${tight && soft === 0 ? "bg-rose-50 text-rose-950 ring-rose-200" : "bg-amber-50 text-amber-950 ring-amber-200"}`} aria-live="polite">
          {note[lang]}
        </p>
        <svg viewBox="0 0 240 110" className="w-full" aria-label={T.chart[lang]} role="img">
          <rect width={240} height={110} rx={8} fill="#f8fafc" />
          <path d="M24 92 L 230 92 M24 92 L 24 10" stroke="#94a3b8" strokeWidth={1.5} />
          <text x={6} y={14} fontSize={9} fill="#64748b">
            {T.size[lang]}
          </text>
          <text x={226} y={104} textAnchor="end" fontSize={9} fill="#64748b">
            {T.time[lang]} →
          </text>
          <path
            d={history.map((v, i) => (i === 0 ? `M24 ${y(v)}` : `L ${24 + i * 8.5} ${y(history[i - 1]!)} L ${24 + i * 8.5} ${y(v)}`)).join(" ")}
            fill="none"
            stroke="#d97706"
            strokeWidth={2.5}
          />
        </svg>
        {history.some((v, i) => i > 0 && v !== history[i - 1]) && <p className="text-sm text-slate-600">{T.chart[lang]}</p>}
      </div>
    </div>
  );
}
