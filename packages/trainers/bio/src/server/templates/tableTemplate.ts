// Builders for the shape most biology content takes: a table of rows, one task per row.
import type { Difficulty } from "@portal/core";
import { choiceParam, type ChoiceParamSpec, type TaskTemplate } from "@portal/trainer-sdk/templates";
import type { BioLang } from "../../lang.ts";
import { LABELS, pickDistractors, placeChoices } from "./choices.ts";

/** A piece of content written in both languages the trainer serves. */
export interface Bi {
  pl: string;
  ru: string;
}

export type RowParams = { i: ChoiceParamSpec<number> };
export type RowTemplate = TaskTemplate<RowParams, BioLang>;

interface CommonSpec<T> {
  id: string;
  topicId: string;
  rows: readonly T[];
  subtopic: Bi;
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
