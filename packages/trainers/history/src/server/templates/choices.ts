// Helpers for building multiple-choice options out of a content table.
import type { ChoiceLabel, TemplateChoice } from "@portal/trainer-sdk/templates";
import { normalizeTerm } from "../../answer.ts";

export const LABELS: readonly ChoiceLabel[] = ["A", "B", "C", "D"];

/**
 * Picks `count` wrong options for row `correctIndex`, walking outwards from it.
 *
 * Walking the neighbours is deliberate: the tables are grouped by gland/system, so the first
 * candidates are the entries a student actually confuses with the right one. Rows whose text
 * collides with an already-chosen one are skipped — the verifier requires four distinct options,
 * and a collision would silently drop the whole substitution.
 */
export function pickDistractors<T>(pool: readonly T[], correctIndex: number, text: (row: T) => string, count = 3): T[] {
  const taken = new Set([normalizeTerm(text(pool[correctIndex]))]);
  const out: T[] = [];
  for (let step = 1; step < pool.length && out.length < count; step++) {
    const row = pool[(correctIndex + step) % pool.length];
    const key = normalizeTerm(text(row));
    if (taken.has(key)) continue;
    taken.add(key);
    out.push(row);
  }
  return out;
}

/** Puts `correctText` at `correctLabel` and spreads the distractors over the remaining labels. */
export function placeChoices(
  correctLabel: ChoiceLabel,
  correctText: string,
  distractors: string[],
  misconception?: string,
): TemplateChoice[] {
  const rest = [...distractors];
  return LABELS.map((label) =>
    label === correctLabel ? { label, text: correctText } : { label, text: rest.shift() ?? "", misconception },
  );
}
