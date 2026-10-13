// Interactives shared by the lessons, so a new lesson is mostly content and drawings:
// - PartMap: a drawing whose parts explain themselves when tapped, with an optional "label it" mode
// - TwoWaySort: sort items into two groups
// - MatchQuiz: one question at a time, pick the fitting option
// - CycleDiagram: a life cycle as a ring of stages, with where to break it
// - CompareTabs: groups side by side, the same features in every tab
// - SpeciesGallery: species cards that open a description
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../lang.ts";
import { Choice, KIT, Verdict, type Txt } from "./kit.tsx";

const T = {
  explore: { pl: "Poznaj", ru: "Изучи" },
  label: { pl: "Podpisz sam", ru: "Подпиши сам" },
  tapHint: {
    pl: "Dotknij dowolnej części rysunku albo nazwy poniżej.",
    ru: "Нажми на любую часть рисунка или на название ниже.",
  },
  labelHint: {
    pl: "Wybierz podpis, a potem dotknij właściwej pinezki na rysunku.",
    ru: "Выбери подпись, а потом нажми на нужную метку на рисунке.",
  },
  pickFirst: { pl: "Najpierw wybierz podpis z listy.", ru: "Сначала выбери подпись из списка." },
  wrongPin: { pl: "ta pinezka wskazuje inną część. Spróbuj jeszcze raz.", ru: "эта метка указывает на другую часть. Попробуй ещё раз." },
  done: { pl: "Wszystko gotowe! Pomyłek:", ru: "Всё готово! Ошибок:" },
  pin: { pl: "Pinezka", ru: "Метка" },
} satisfies Record<string, Txt>;

// ---------- PartMap ----------

export interface MapPart {
  name: Txt;
  text: Txt;
  /** pin position in "label it" mode */
  pin?: [number, number];
  /** a pin set off the part points at it with a leader line */
  to?: [number, number];
}

export interface ArtKit<Id extends string> {
  /** wraps a drawn part: a button in explore mode, plain shapes in label mode */
  part: (id: Id, node: ReactNode) => ReactNode;
  /** the highlight colour when the part is chosen, its own colour otherwise */
  tone: (id: Id, base: string) => string;
  active: Id | null;
}

interface PartMapProps<Id extends string> {
  lang: BioLang;
  parts: Record<Id, MapPart>;
  viewBox: string;
  title: Txt;
  art: (kit: ArtKit<Id>) => ReactNode;
  /** drawn above the art; used for inner organs shown only while their part is chosen */
  overlay?: (active: Id | null) => ReactNode;
  /** the parts to label, in pin-number order; without it there is no "label it" mode */
  labelOrder?: Id[];
  pinRadius?: number;
  maxWidth?: string;
}

const HIGHLIGHT = "#6ee7b7";

export function PartMap<Id extends string>(props: PartMapProps<Id>) {
  const { lang, labelOrder } = props;
  const [mode, setMode] = useState<"explore" | "label">("explore");
  return (
    <div>
      {labelOrder && (
        <div className="mb-4 flex gap-2" role="radiogroup">
          {(["explore", "label"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
                mode === m ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
              }`}
            >
              {T[m][lang]}
            </button>
          ))}
        </div>
      )}
      {mode === "label" && labelOrder ? <LabelMode {...props} labelOrder={labelOrder} /> : <ExploreMode {...props} />}
    </div>
  );
}

function ExploreMode<Id extends string>({ lang, parts, viewBox, title, art, overlay, maxWidth }: PartMapProps<Id>) {
  const [picked, setPicked] = useState<Id | null>(null);
  const ids = Object.keys(parts) as Id[];
  const kit: ArtKit<Id> = {
    active: picked,
    tone: (id, base) => (picked === id ? HIGHLIGHT : base),
    part: (id, node) => (
      <g
        key={id}
        data-part={id}
        role="button"
        tabIndex={0}
        aria-label={parts[id].name[lang]}
        aria-pressed={picked === id}
        onClick={() => setPicked(id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPicked(id);
          }
        }}
        className="cursor-pointer outline-none"
        style={picked === id ? { filter: "drop-shadow(0 0 4px #10b981)" } : undefined}
      >
        {node}
      </g>
    ),
  };
  const part = picked ? parts[picked] : null;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox={viewBox} className={`mx-auto w-full select-none ${maxWidth ?? "max-w-[420px]"}`} role="img" aria-label={title[lang]}>
        {art(kit)}
        {overlay?.(picked)}
      </svg>
      <div aria-live="polite">
        {part ? (
          <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
            <h3 className="text-base font-semibold text-emerald-900">{part.name[lang]}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{part.text[lang]}</p>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-[15px] text-slate-600 ring-1 ring-slate-200">👆 {T.tapHint[lang]}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ids.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPicked(id)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                picked === id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
              }`}
            >
              {parts[id].name[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LabelMode<Id extends string>({ lang, parts, viewBox, title, art, labelOrder, pinRadius = 18, maxWidth }: PartMapProps<Id> & { labelOrder: Id[] }) {
  const [chosen, setChosen] = useState<Id | null>(null);
  const [placed, setPlaced] = useState<Id[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const done = placed.length === labelOrder.length;
  const kit: ArtKit<Id> = { active: null, tone: (_id, base) => base, part: (id, node) => <g key={id}>{node}</g> };

  const tryPin = (target: Id) => {
    if (placed.includes(target)) return;
    if (!chosen) return setMessage({ ok: false, text: T.pickFirst[lang] });
    if (chosen === target) {
      setPlaced([...placed, target]);
      setMessage({ ok: true, text: parts[target].name[lang] });
      setChosen(null);
    } else {
      setMistakes(mistakes + 1);
      setMessage({ ok: false, text: `${parts[chosen].name[lang]} — ${T.wrongPin[lang]}` });
    }
  };
  const reset = () => {
    setChosen(null);
    setPlaced([]);
    setMistakes(0);
    setMessage(null);
  };
  const fontSize = pinRadius * 0.9;

  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox={viewBox} className={`mx-auto w-full select-none ${maxWidth ?? "max-w-[420px]"}`} role="img" aria-label={title[lang]}>
        {art(kit)}
        {labelOrder.map((id) => {
          const { pin, to } = parts[id];
          if (!pin || !to) return null;
          const color = placed.includes(id) ? "#059669" : "#4f46e5";
          return (
            <g key={`${id}-leader`} pointerEvents="none">
              <path d={`M${pin[0]} ${pin[1]} L ${to[0]} ${to[1]}`} stroke={color} strokeWidth={2} />
              <circle cx={to[0]} cy={to[1]} r={3.5} fill={color} stroke="white" strokeWidth={1.5} />
            </g>
          );
        })}
        {labelOrder.map((id, i) => {
          const pin = parts[id].pin;
          if (!pin) return null;
          const label = placed.includes(id) ? parts[id].name[lang] : null;
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-label={label ?? `${T.pin[lang]} ${i + 1}`}
              onClick={() => tryPin(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  tryPin(id);
                }
              }}
              className="cursor-pointer outline-none"
            >
              {label ? (
                <>
                  <rect
                    x={pin[0] - label.length * fontSize * 0.29 - 8}
                    y={pin[1] - fontSize * 0.85}
                    width={label.length * fontSize * 0.58 + 16}
                    height={fontSize * 1.7}
                    rx={fontSize * 0.85}
                    fill="#059669"
                  />
                  <text x={pin[0]} y={pin[1] + fontSize * 0.33} textAnchor="middle" fontSize={fontSize} fontWeight={600} fill="white">
                    {label}
                  </text>
                </>
              ) : (
                <>
                  <circle cx={pin[0]} cy={pin[1]} r={pinRadius} fill="#4f46e5" stroke="white" strokeWidth={3} />
                  <text x={pin[0]} y={pin[1] + fontSize * 0.36} textAnchor="middle" fontSize={fontSize} fontWeight={700} fill="white">
                    {i + 1}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      <div className="space-y-3">
        <p className="text-[15px] text-slate-600">{T.labelHint[lang]}</p>
        <div className="flex flex-wrap gap-2">
          {[...labelOrder]
            .sort((a, b) => parts[a].name[lang].localeCompare(parts[b].name[lang], lang))
            .filter((id) => !placed.includes(id))
            .map((id) => (
              <Choice key={id} state={chosen === id ? "active" : "idle"} onClick={() => setChosen(id)}>
                {parts[id].name[lang]}
              </Choice>
            ))}
        </div>
        {done ? (
          <div className="space-y-3">
            <Verdict ok lang={lang}>
              {T.done[lang]} {mistakes}.
            </Verdict>
            <Choice onClick={reset}>↺ {KIT.again[lang]}</Choice>
          </div>
        ) : (
          message && (
            <Verdict ok={message.ok} lang={lang}>
              {message.text}
            </Verdict>
          )
        )}
      </div>
    </div>
  );
}

// ---------- TwoWaySort ----------

export interface SortItem {
  name: Txt;
  /** index of the right group in `groups` */
  group: 0 | 1;
  why: Txt;
}

export function TwoWaySort({ lang, title, hint, groups, items }: { lang: BioLang; title: Txt; hint?: Txt; groups: [Txt, Txt]; items: SortItem[] }) {
  const [solved, setSolved] = useState<Record<number, boolean>>({});
  const [wrong, setWrong] = useState<Record<number, boolean>>({});
  const [mistakes, setMistakes] = useState(0);
  const done = Object.keys(solved).length === items.length;

  const pick = (i: number, group: 0 | 1) => {
    if (solved[i]) return;
    if (items[i]!.group === group) {
      setSolved({ ...solved, [i]: true });
      setWrong({ ...wrong, [i]: false });
    } else {
      setWrong({ ...wrong, [i]: true });
      setMistakes(mistakes + 1);
    }
  };
  const restart = () => {
    setSolved({});
    setWrong({});
    setMistakes(0);
  };

  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <h3 className="text-base font-semibold text-slate-800">🔀 {title[lang]}</h3>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint[lang]}</p>}
      <ul className="mt-3 divide-y divide-slate-200">
        {items.map((item, i) => (
          <li key={item.name.pl} className="flex flex-col gap-1.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <div className="text-[15px] font-medium text-slate-800">{item.name[lang]}</div>
              {solved[i] && <div className="text-xs text-emerald-700">✓ {item.why[lang]}</div>}
              {!solved[i] && wrong[i] && <div className="text-xs text-rose-700">✗ {KIT.wrong[lang]}</div>}
            </div>
            <div className="flex shrink-0 gap-2">
              {([0, 1] as const).map((g) => (
                <Choice key={g} disabled={solved[i]} state={solved[i] && item.group === g ? "right" : "idle"} onClick={() => pick(i, g)}>
                  {groups[g][lang]}
                </Choice>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {done && (
        <div className="mt-3 space-y-3">
          <Verdict ok={mistakes === 0} lang={lang}>
            {T.done[lang]} {mistakes}.
          </Verdict>
          <Choice onClick={restart}>↺ {KIT.again[lang]}</Choice>
        </div>
      )}
    </div>
  );
}

// ---------- MatchQuiz ----------

export interface QuizOption {
  id: string;
  label: Txt;
  art?: ReactNode;
}
export interface QuizItem {
  icon?: string;
  name: Txt;
  answer: string;
  explain: Txt;
}

export function MatchQuiz({
  lang,
  title,
  question,
  options,
  items,
  wrongHint,
}: {
  lang: BioLang;
  title: Txt;
  question: Txt;
  options: QuizOption[];
  items: QuizItem[];
  wrongHint: Txt;
}) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const item = items[index];

  const pick = (id: string) => {
    if (!item || solved) return;
    if (id === item.answer) {
      setSolved(true);
      setWrong(null);
    } else {
      setWrong(id);
      setMistakes(mistakes + 1);
    }
  };
  const next = () => {
    setIndex(index + 1);
    setSolved(false);
    setWrong(null);
  };
  const restart = () => {
    setIndex(0);
    setSolved(false);
    setWrong(null);
    setMistakes(0);
  };
  const label = (id: string) => options.find((o) => o.id === id)?.label[lang] ?? id;
  const withArt = options.some((o) => o.art);

  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <h3 className="flex items-center justify-between text-base font-semibold text-slate-800">
        {title[lang]}
        <span className="text-xs font-medium text-slate-500">
          {Math.min(index + 1, items.length)} / {items.length}
        </span>
      </h3>
      {item ? (
        <div className="mt-3 space-y-3">
          <p className="text-[15px] text-slate-700">
            {question[lang]}{" "}
            <span className="font-semibold text-slate-900">
              {item.icon} {item.name[lang]}
            </span>
            ?
          </p>
          <div className={withArt ? "grid grid-cols-2 gap-2 sm:grid-cols-3" : "flex flex-wrap gap-2"}>
            {options.map((o) => {
              const state = solved && o.id === item.answer ? "right" : wrong === o.id ? "wrong" : "idle";
              if (!o.art) {
                return (
                  <Choice key={o.id} disabled={solved} state={state} onClick={() => pick(o.id)}>
                    {o.label[lang]}
                  </Choice>
                );
              }
              const look = {
                idle: "bg-white ring-slate-200 hover:bg-slate-50",
                active: "bg-white ring-indigo-500",
                right: "bg-emerald-50 ring-2 ring-emerald-500",
                wrong: "bg-rose-50 ring-rose-300",
              }[state];
              return (
                <button key={o.id} type="button" disabled={solved} onClick={() => pick(o.id)} className={`rounded-xl p-2 text-center ring-1 transition-colors ${look}`}>
                  {o.art}
                  <div className="mt-1 text-sm font-medium text-slate-800">{o.label[lang]}</div>
                </button>
              );
            })}
          </div>
          {solved && (
            <>
              <Verdict ok lang={lang}>
                {item.explain[lang]}
              </Verdict>
              <Choice state="active" onClick={next}>
                {KIT.next[lang]} →
              </Choice>
            </>
          )}
          {!solved && wrong && (
            <Verdict ok={false} lang={lang}>
              {label(wrong)} — {wrongHint[lang]}
            </Verdict>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <Verdict ok={mistakes === 0} lang={lang}>
            {T.done[lang]} {mistakes}.
          </Verdict>
          <Choice onClick={restart}>↺ {KIT.again[lang]}</Choice>
        </div>
      )}
    </div>
  );
}

// ---------- CycleDiagram ----------

export interface CycleStage {
  icon: string;
  name: Txt;
  text: Txt;
  /** what a person can do at this step to break the cycle */
  prevent?: Txt;
}

const C = {
  prev: { pl: "Wstecz", ru: "Назад" },
  shield: { pl: "🛡 Pokaż, gdzie można przerwać cykl", ru: "🛡 Показать, где можно разорвать цикл" },
  breakHere: { pl: "Tu przerwiesz cykl:", ru: "Здесь цикл можно разорвать:" },
  step: { pl: "Etap", ru: "Этап" },
} satisfies Record<string, Txt>;

/** A life cycle drawn as a ring of stages; step through it, and optionally see where to break it. */
export function CycleDiagram({ lang, title, stages }: { lang: BioLang; title: Txt; stages: CycleStage[] }) {
  const [i, setI] = useState(0);
  const [shield, setShield] = useState(false);
  const n = stages.length;
  const stage = stages[i]!;
  const R = 92;
  const at = (k: number) => {
    const a = -Math.PI / 2 + (k / n) * Math.PI * 2;
    return [130 + R * Math.cos(a), 125 + R * Math.sin(a)] as const;
  };
  const go = (k: number) => setI((k + n) % n);
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 260 250" className="mx-auto w-full max-w-[360px] select-none" role="img" aria-label={title[lang]}>
        <defs>
          <marker id="cycle-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L 10 5 L 0 10 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <circle cx={130} cy={125} r={R} fill="none" stroke="#e2e8f0" strokeWidth={10} />
        {stages.map((_, k) => {
          const a0 = -Math.PI / 2 + ((k + 0.28) / n) * Math.PI * 2;
          const a1 = -Math.PI / 2 + ((k + 0.72) / n) * Math.PI * 2;
          return (
            <path
              key={`arc${k}`}
              d={`M${130 + R * Math.cos(a0)} ${125 + R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${130 + R * Math.cos(a1)} ${125 + R * Math.sin(a1)}`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={2.5}
              markerEnd="url(#cycle-arrow)"
            />
          );
        })}
        {stages.map((s, k) => {
          const [x, y] = at(k);
          const on = k === i;
          return (
            <g
              key={k}
              role="button"
              tabIndex={0}
              aria-label={`${C.step[lang]} ${k + 1}: ${s.name[lang]}`}
              aria-pressed={on}
              onClick={() => go(k)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  go(k);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <circle cx={x} cy={y} r={on ? 25 : 21} fill={on ? "#d1fae5" : "white"} stroke={on ? "#059669" : "#cbd5e1"} strokeWidth={on ? 3 : 2} />
              <text x={x} y={y + 7} textAnchor="middle" fontSize={on ? 22 : 19}>
                {s.icon}
              </text>
              {shield && s.prevent && (
                <g>
                  <circle cx={x + 17} cy={y - 17} r={9} fill="#f59e0b" stroke="white" strokeWidth={2} />
                  <text x={x + 17} y={y - 13} textAnchor="middle" fontSize={10}>
                    ✋
                  </text>
                </g>
              )}
            </g>
          );
        })}
        <text x={130} y={122} textAnchor="middle" fontSize={11} fill="#64748b">
          {C.step[lang]}
        </text>
        <text x={130} y={140} textAnchor="middle" fontSize={18} fontWeight={700} fill="#0f172a">
          {i + 1} / {n}
        </text>
      </svg>
      <div className="space-y-3">
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <h3 className="text-base font-semibold text-emerald-900">
            {stage.icon} {stage.name[lang]}
          </h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{stage.text[lang]}</p>
          {shield && stage.prevent && (
            <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-950">
              <span className="font-semibold">✋ {C.breakHere[lang]}</span> {stage.prevent[lang]}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Choice onClick={() => go(i - 1)}>‹ {C.prev[lang]}</Choice>
          <Choice state="active" onClick={() => go(i + 1)}>
            {KIT.next[lang]} ›
          </Choice>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={shield} onChange={(e) => setShield(e.target.checked)} className="h-4 w-4 accent-amber-500" />
          {C.shield[lang]}
        </label>
      </div>
    </div>
  );
}

// ---------- CompareTabs ----------

export interface CompareCard {
  id: string;
  icon: string;
  name: Txt;
  art?: ReactNode;
  /** the same row labels, in the same order, on every card, so switching tabs compares them */
  rows: { label: Txt; value: Txt }[];
  text?: Txt;
}

/** Groups side by side: one tab per group, each with a drawing and a table of the same features. */
export function CompareTabs({ lang, cards }: { lang: BioLang; cards: CompareCard[] }) {
  const [id, setId] = useState(cards[0]!.id);
  const card = cards.find((c) => c.id === id)!;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup">
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === id}
            onClick={() => setId(c.id)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              c.id === id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {c.icon} {c.name[lang]}
          </button>
        ))}
      </div>
      <div className={card.art ? "grid items-start gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}>
        {card.art && <div className="rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">{card.art}</div>}
        <div aria-live="polite">
          <table className="w-full text-sm">
            <tbody>
              {card.rows.map((r) => (
                <tr key={r.label.pl} className="border-b border-slate-200 last:border-0">
                  <th scope="row" className="w-36 py-2 pr-3 text-left align-top font-medium text-slate-500">
                    {r.label[lang]}
                  </th>
                  <td className="py-2 text-slate-800">{r.value[lang]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {card.text && <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-[15px] leading-relaxed text-emerald-950 ring-1 ring-emerald-200">{card.text[lang]}</p>}
        </div>
      </div>
    </div>
  );
}

// ---------- SpeciesGallery ----------

export interface Species {
  icon: string;
  name: Txt;
  text: Txt;
  /** a short badge, e.g. "protected" or "migratory" */
  tag?: Txt;
}

/** A grid of species cards; tapping one opens its description. */
export function SpeciesGallery({ lang, items }: { lang: BioLang; items: Species[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const item = open === null ? null : items[open];
  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((s, i) => (
          <li key={s.name.pl}>
            <button
              type="button"
              aria-pressed={open === i}
              onClick={() => setOpen(open === i ? null : i)}
              className={`flex h-full w-full flex-col items-center gap-1 rounded-xl p-3 text-center ring-1 transition-colors ${
                open === i ? "bg-emerald-50 ring-emerald-400" : "bg-white ring-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {s.icon}
              </span>
              <span className="text-sm leading-tight font-medium text-slate-800">{s.name[lang]}</span>
              {s.tag && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{s.tag[lang]}</span>}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3" aria-live="polite">
        {item ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-[15px] leading-relaxed text-emerald-950 ring-1 ring-emerald-200">
            <span className="font-semibold">
              {item.icon} {item.name[lang]}.
            </span>{" "}
            {item.text[lang]}
          </p>
        ) : (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            👆 {lang === "pl" ? "Dotknij karty, żeby poznać gatunek." : "Нажми на карточку, чтобы узнать о виде."}
          </p>
        )}
      </div>
    </div>
  );
}
