// Task templates: a template is authored once, then rendered offline into many concrete tasks by
// enumerating (or sampling) substitution values. See docs/template-feasibility-sp5-lo2.md and the
// plan "шаблонная генерация задач" for the design rationale.
import type { AnswerType, ChoiceLabel, Difficulty, Lang } from "@portal/core";

export type { ChoiceLabel } from "@portal/core";

export interface IntParam {
  kind: "int";
  min: number;
  max: number;
}

export interface ChoiceParamSpec<T extends string | number = string | number> {
  kind: "choice";
  options: readonly T[];
}

export type ParamSpec = IntParam | ChoiceParamSpec;

export const intRange = (min: number, max: number): IntParam => ({ kind: "int", min, max });
export const choiceParam = <T extends string | number>(...options: T[]): ChoiceParamSpec<T> => ({ kind: "choice", options });

type ValueOf<S extends ParamSpec> = S extends IntParam ? number : S extends ChoiceParamSpec<infer T> ? T : never;

/** Concrete substitution values for one rendered instance of a template. */
export type ParamsOf<P extends Record<string, ParamSpec>> = { [K in keyof P]: ValueOf<P[K]> };

/** Values computed from params (e.g. a derived answer, a formatted intermediate) — free-form. */
export type Derived = Record<string, number | string>;

/**
 * Text that depends grammatically on a count (Russian/Polish noun declension by number).
 * Selected via `Intl.PluralRules(lang).select(count)` — see `plural()` in render.ts.
 */
export interface PluralForms {
  one?: string;
  few?: string;
  many?: string;
  two?: string;
  zero?: string;
  other: string;
}

export interface TemplateChoice {
  label: ChoiceLabel;
  text: string;
  /** typical mistake that leads to this (wrong) option, shown to the student for feedback */
  misconception?: string;
}

/**
 * A parametrized task family. `params` with an empty object renders exactly one fixed task —
 * that's how hand-authored, non-parametrizable content (proofs, figure recognition, …) fits the
 * same pipeline without a separate mechanism.
 *
 * `L` is the set of languages the template is written in. It defaults to every portal language, so
 * math templates are unaffected; a subject whose content is authored in fewer languages narrows it
 * (biology uses `"ru" | "pl"`) and TypeScript then stops demanding the missing translations.
 */
export interface TaskTemplate<P extends Record<string, ParamSpec> = Record<string, ParamSpec>, L extends Lang = Lang> {
  /** stable id prefix; combined with the substitution values to form each rendered task's id */
  id: string;
  topicId: string;
  /** a function when difficulty varies per substitution (e.g. one row of a term table per item) */
  difficulty: Difficulty | ((p: ParamsOf<P>, d: Derived) => Difficulty);
  answerType: AnswerType;
  params: P;
  /** reject a substitution if it doesn't hold (e.g. keep answers integer, avoid degenerate cases) */
  constraint?: (p: ParamsOf<P>) => boolean;
  /** values computed once per substitution, available to every text/answer function below */
  derive?: (p: ParamsOf<P>) => Derived;
  subtopic: Record<L, string>;
  question: (p: ParamsOf<P>, d: Derived, lang: L) => string;
  /** cross-check string interpreted by the trainer's own verifier (mathjs syntax for math) */
  verifyExpression?: (p: ParamsOf<P>, d: Derived) => string;
  /** `lang` matters for term-recall subjects, where the canonical answer is itself a translated word */
  correctAnswer: (p: ParamsOf<P>, d: Derived, lang: L) => string;
  /** answerType "text": other spellings and inflections accepted alongside `correctAnswer` */
  acceptedAnswers?: (p: ParamsOf<P>, d: Derived, lang: L) => string[];
  solution: Record<L, (p: ParamsOf<P>, d: Derived) => string>;
  hint?: Record<L, (p: ParamsOf<P>, d: Derived) => string>;
  /** required (and only meaningful) for answerType "choice" */
  choices?: (p: ParamsOf<P>, d: Derived, lang: L) => TemplateChoice[];
  correctChoiceLabel?: (p: ParamsOf<P>, d: Derived) => ChoiceLabel;
}

/** Type-inferring constructor — lets `params`' shape drive every callback's parameter types. */
export function defineTemplate<P extends Record<string, ParamSpec>, L extends Lang = Lang>(
  template: TaskTemplate<P, L>,
): TaskTemplate<P, L> {
  return template;
}
