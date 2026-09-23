// Builders for the shape most biology content takes: a table of rows, one task per row.
import type { Difficulty } from "@portal/core";
import { choiceParam, type ChoiceParamSpec, type ParamSpec, type ParamsOf, type TaskTemplate } from "@portal/trainer-sdk/templates";
import type { BioLang } from "../../lang.ts";
import { LABELS, pickDistractors, placeChoices } from "./choices.ts";

/** A piece of content written in both languages the trainer serves. */
export interface Bi {
  pl: string;
  ru: string;
}

export type RowParams = { i: ChoiceParamSpec<number> };
export type RowTemplate = TaskTemplate<RowParams, BioLang>;

/**
 * Any biology template. Widened in `params`: every template has its own parameter shape, and the
 * code that iterates the registry (the render script, the tests) does not need per-template types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BioTemplate = TaskTemplate<any, BioLang>;

/**
 * Sentences are assembled from table fields, so a field that starts a sentence needs its first
 * letter raised.
 *
 * Question wording uses "Label: value" rather than prepositions on purpose. Polish and Russian would
 * otherwise need a declined form of every term, and the anatomical names mix singulars and plurals
 * ("tarczyca" vs "wyspy trzustkowe"), which breaks verb agreement too. A label takes the nominative
 * the table already stores, and reads like a matura task rather than a broken sentence.
 */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface CommonSpec<T> {
  id: string;
  topicId: string;
  rows: readonly T[];
  subtopic: Bi;
  /** cross-cutting themes (see curriculum/tags.ts) */
  tags?: string[];
  difficulty: (row: T) => Difficulty;
  question: (row: T, lang: BioLang) => string;
  hint?: (row: T, lang: BioLang) => string;
  solution: (row: T, lang: BioLang) => string;
}

export interface ChoiceSpec<T> extends CommonSpec<T> {
  /** text of the correct option, and the pool the distractors are taken from */
  optionText: (row: T, lang: BioLang) => string;
  misconception: Bi;
  /**
   * Rotates which letter holds the answer. Without it every template would put row `i`'s answer
   * under the same label, and a student could learn the position instead of the content.
   */
  shift?: number;
}

/**
 * One multiple-choice task per row. The answer's position is derived from the row index rather than
 * being its own parameter: as a parameter it would multiply the substitution space by four, and the
 * renderer — which walks the cartesian product in order and stops at `targetCount` — would cover
 * only the first quarter of the table.
 */
export function choiceFromTable<T>(spec: ChoiceSpec<T>): RowTemplate {
  const shift = spec.shift ?? 0;
  const labelFor = (i: number) => LABELS[(i + shift) % LABELS.length];
  return {
    id: spec.id,
    topicId: spec.topicId,
    answerType: "choice",
    tags: spec.tags,
    params: { i: choiceParam(...spec.rows.map((_, i) => i)) },
    difficulty: (p) => spec.difficulty(spec.rows[p.i]),
    subtopic: spec.subtopic,
    question: (p, _d, lang) => spec.question(spec.rows[p.i], lang),
    correctAnswer: (p) => labelFor(p.i),
    correctChoiceLabel: (p) => labelFor(p.i),
    choices: (p, _d, lang) => {
      const text = (row: T) => spec.optionText(row, lang);
      return placeChoices(
        labelFor(p.i),
        text(spec.rows[p.i]),
        pickDistractors(spec.rows, p.i, text).map(text),
        spec.misconception[lang],
      );
    },
    hint: spec.hint && {
      pl: (p) => spec.hint!(spec.rows[p.i], "pl"),
      ru: (p) => spec.hint!(spec.rows[p.i], "ru"),
    },
    solution: {
      pl: (p) => spec.solution(spec.rows[p.i], "pl"),
      ru: (p) => spec.solution(spec.rows[p.i], "ru"),
    },
  };
}

export interface TermSpec<T> extends CommonSpec<T> {
  /** the canonical term, in the language of the task */
  term: (row: T, lang: BioLang) => string;
  /** other spellings, abbreviations and the term in the other language */
  aliases: (row: T, lang: BioLang) => string[];
}

/** One free-text term-recall task per row. */
export function termFromTable<T>(spec: TermSpec<T>): RowTemplate {
  return {
    id: spec.id,
    topicId: spec.topicId,
    answerType: "text",
    tags: spec.tags,
    params: { i: choiceParam(...spec.rows.map((_, i) => i)) },
    difficulty: (p) => spec.difficulty(spec.rows[p.i]),
    subtopic: spec.subtopic,
    question: (p, _d, lang) => spec.question(spec.rows[p.i], lang),
    correctAnswer: (p, _d, lang) => spec.term(spec.rows[p.i], lang),
    acceptedAnswers: (p, _d, lang) => {
      const row = spec.rows[p.i];
      const canonical = spec.term(row, lang);
      return [...new Set(spec.aliases(row, lang))].filter((a) => a && a !== canonical);
    },
    hint: spec.hint && {
      pl: (p) => spec.hint!(spec.rows[p.i], "pl"),
      ru: (p) => spec.hint!(spec.rows[p.i], "ru"),
    },
    solution: {
      pl: (p) => spec.solution(spec.rows[p.i], "pl"),
      ru: (p) => spec.solution(spec.rows[p.i], "ru"),
    },
  };
}

export interface CalcSpec<P extends Record<string, ParamSpec>> {
  id: string;
  topicId: string;
  subtopic: Bi;
  tags?: string[];
  difficulty: Difficulty;
  params: P;
  constraint?: (p: ParamsOf<P>) => boolean;
  /** decimal places in the shown answer; omitted means the result is a whole number */
  decimals?: number;
  /** the calculation written out as a mathjs expression, built from the parameters */
  formula: (p: ParamsOf<P>) => string;
  /** the same quantity computed independently in TypeScript — the verifier compares the two */
  value: (p: ParamsOf<P>) => number;
  question: (p: ParamsOf<P>, lang: BioLang) => string;
  hint?: (p: ParamsOf<P>, lang: BioLang) => string;
  solution: (p: ParamsOf<P>, answer: string, lang: BioLang) => string;
}

/**
 * A numeric physiology task. `formula` and `value` must be written independently of each other:
 * that is the whole point, and it is what gives biology the same guarantee the math renderer has —
 * an answer nobody re-derived is an answer nobody checked.
 *
 * The formula carries the rounding too, so the cross-check compares like with like rather than
 * failing on the display precision.
 */
export function calcTemplate<P extends Record<string, ParamSpec>>(spec: CalcSpec<P>): TaskTemplate<P, BioLang> {
  const round = (n: number) => (spec.decimals === undefined ? Math.round(n) : Number(n.toFixed(spec.decimals)));
  // decimal comma in both of the trainer's languages
  const show = (n: number) => String(round(n)).replace(".", ",");
  return {
    id: spec.id,
    topicId: spec.topicId,
    answerType: "number",
    tags: spec.tags,
    params: spec.params,
    constraint: spec.constraint,
    difficulty: spec.difficulty,
    subtopic: spec.subtopic,
    question: (p, _d, lang) => spec.question(p, lang),
    verifyExpression: (p) =>
      spec.decimals === undefined ? `round(${spec.formula(p)})` : `round(${spec.formula(p)}, ${spec.decimals})`,
    correctAnswer: (p) => show(spec.value(p)),
    hint: spec.hint && {
      pl: (p) => spec.hint!(p, "pl"),
      ru: (p) => spec.hint!(p, "ru"),
    },
    solution: {
      pl: (p) => spec.solution(p, show(spec.value(p)), "pl"),
      ru: (p) => spec.solution(p, show(spec.value(p)), "ru"),
    },
  };
}
