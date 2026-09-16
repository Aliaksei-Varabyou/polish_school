import type { ParamSpec, ParamsOf } from "./types.ts";

const cardinality = (spec: ParamSpec): number => (spec.kind === "int" ? spec.max - spec.min + 1 : spec.options.length);

function randomValue(spec: ParamSpec): number | string {
  if (spec.kind === "int") return spec.min + Math.floor(Math.random() * (spec.max - spec.min + 1));
  return spec.options[Math.floor(Math.random() * spec.options.length)];
}

function* fullCartesian(entries: [string, ParamSpec][], index: number, acc: Record<string, number | string>): Generator<Record<string, number | string>> {
  if (index === entries.length) {
    yield { ...acc };
    return;
  }
  const [key, spec] = entries[index];
  const values = spec.kind === "int" ? Array.from({ length: spec.max - spec.min + 1 }, (_, i) => spec.min + i) : spec.options;
  for (const v of values) {
    acc[key] = v;
    yield* fullCartesian(entries, index + 1, acc);
  }
}

/**
 * Yields distinct raw substitutions for `params`: the full cartesian product when it's small enough
 * to fit `attemptBudget`, otherwise a random sample (without repeats) up to that budget. Templates
 * with an empty `params` yield exactly one (empty) combination.
 */
export function* enumerateParams<P extends Record<string, ParamSpec>>(params: P, attemptBudget: number): Generator<ParamsOf<P>> {
  const entries = Object.entries(params) as [string, ParamSpec][];
  if (entries.length === 0) {
    yield {} as ParamsOf<P>;
    return;
  }

  const total = entries.reduce((n, [, spec]) => n * cardinality(spec), 1);
  if (total <= attemptBudget) {
    yield* fullCartesian(entries, 0, {}) as Generator<ParamsOf<P>>;
    return;
  }

  const seen = new Set<string>();
  let tries = 0;
  const maxTries = attemptBudget * 20;
  while (seen.size < attemptBudget && tries < maxTries) {
    tries++;
    const combo: Record<string, number | string> = {};
    for (const [key, spec] of entries) combo[key] = randomValue(spec);
    const key = JSON.stringify(combo);
    if (seen.has(key)) continue;
    seen.add(key);
    yield combo as ParamsOf<P>;
  }
}
