// Pieces every trainer repeats around Mors: the reaction to an answer (with streaks) and the card on
// the results screen where he comments on the score and can be petted.
import { useEffect, useRef, useState } from "react";
import { emitMors } from "./bus.ts";
import { MORS_BASE_RESULTS, type MorsLang, type MorsScoreBand } from "./lines.ts";
import { Mors, type MorsMood } from "./Mors.tsx";

const STREAKS = [3, 5, 7, 10, 15, 20];

/**
 * Tells Mors about an answer the moment it lands. `id` is the current task, `correct` its record
 * (undefined until answered), `history` the correctness of every task up to and including this one
 * in order — the streak is counted from its end. A session reopened on an already-answered task
 * stays quiet.
 */
export function useMorsAnswer(id: string | undefined, correct: boolean | undefined, history: readonly (boolean | undefined)[]) {
  const seen = useRef(id !== undefined && correct !== undefined ? id : null);
  useEffect(() => {
    if (id === undefined || correct === undefined || seen.current === id) return;
    seen.current = id;
    if (!correct) return emitMors("wrong");
    let streak = 0;
    for (let i = history.length - 1; i >= 0 && history[i]; i--) streak++;
    if (STREAKS.includes(streak)) emitMors("streak", { n: streak });
    else emitMors("right");
  }, [id, correct, history]);
}

export function scoreBand(pct: number): MorsScoreBand {
  return pct >= 90 ? "great" : pct >= 70 ? "good" : pct >= 50 ? "ok" : "low";
}

const BAND_MOOD: Record<MorsScoreBand, MorsMood> = { great: "celebrate", good: "happy", ok: "idle", low: "wrong" };

/** Mors beside a speech bubble on the results screen: a spin for a top score, a head tilt for a weak one. */
export function MorsVerdict({ lang, band, say, petLabel }: { lang: MorsLang; band: MorsScoreBand; say?: string; petLabel?: string }) {
  const [mood, setMood] = useState<MorsMood>(BAND_MOOD[band]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const pet = () => {
    clearTimeout(timer.current);
    setMood("pet");
    timer.current = setTimeout(() => setMood(band === "great" ? "happy" : "idle"), 1900);
  };
  return (
    <div className="mb-3 flex items-end justify-center gap-2">
      <button
        type="button"
        onClick={pet}
        aria-label={petLabel ?? { ru: "Погладить Морса", pl: "Pogłaszcz Morsa", en: "Pet Mors" }[lang]}
        className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-indigo-500"
      >
        <Mors mood={mood} size={88} />
      </button>
      <div className="relative mb-8 max-w-[240px] rounded-2xl bg-slate-50 px-3.5 py-2 text-left text-sm font-medium text-slate-700 ring-1 ring-slate-200">
        {say ?? MORS_BASE_RESULTS[lang][band]}
      </div>
    </div>
  );
}
