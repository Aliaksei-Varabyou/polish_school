// Builders for the shape most history content takes: a table of rows, one task per row.
import type { Difficulty } from "@portal/core";
import { choiceParam, type ChoiceParamSpec, type ParamSpec, type ParamsOf, type TaskTemplate } from "@portal/trainer-sdk/templates";
import type { HistLang } from "../../lang.ts";
import { normalizeTerm } from "../../answer.ts";
import { LABELS, pickDistractors, placeChoices } from "./choices.ts";

/** A piece of content written in both languages the trainer serves. */
export interface Bi {
  pl: string;
  ru: string;
}

export type RowParams = { i: ChoiceParamSpec<number> };
export type RowTemplate = TaskTemplate<RowParams, HistLang>;

/**
 * Any history template. Widened in `params`: every template has its own parameter shape, and the
 * code that iterates the registry (the render script, the tests) does not need per-template types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HistTemplate = TaskTemplate<any, HistLang>;

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

/**
 * The textbook paragraph a row belongs to, when a table spans several (bones and muscles sit in
 * different paragraphs of one chapter). Rows without one fall back to the spec's `paragraph`.
 */
export interface InParagraph {
  paragraph?: string;
}

const rowParagraph = (row: unknown): string | undefined => (row as InParagraph).paragraph;

interface CommonSpec<T> {
  id: string;
  /** the chapter — it names the templates; tasks are filed under a paragraph (see `paragraph`) */
  topicId: string;
  /** the paragraph for rows that do not name their own */
  paragraph?: string;
  rows: readonly T[];
  subtopic: Bi;
  /** cross-cutting themes (see curriculum/tags.ts) */
  tags?: string[];
  difficulty: (row: T) => Difficulty;
  question: (row: T, lang: HistLang) => string;
  hint?: (row: T, lang: HistLang) => string;
  solution: (row: T, lang: HistLang) => string;
}

export interface ChoiceSpec<T> extends CommonSpec<T> {
  /** text of the correct option, and the pool the distractors are taken from */
  optionText: (row: T, lang: HistLang) => string;
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
    // distractors still come from the whole table below: a paragraph with one or two rows could not
    // offer four options on its own, and neighbouring rows make the more plausible traps anyway
    topicOf: (p) => rowParagraph(spec.rows[p.i]) ?? spec.paragraph ?? spec.topicId,
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
  term: (row: T, lang: HistLang) => string;
  /** other spellings, abbreviations and the term in the other language */
  aliases: (row: T, lang: HistLang) => string[];
}

/** One free-text term-recall task per row. */
export function termFromTable<T>(spec: TermSpec<T>): RowTemplate {
  return {
    id: spec.id,
    topicId: spec.topicId,
    topicOf: (p) => rowParagraph(spec.rows[p.i]) ?? spec.paragraph ?? spec.topicId,
    answerType: "text",
    tags: spec.tags,
    params: { i: choiceParam(...spec.rows.map((_, i) => i)) },
    difficulty: (p) => spec.difficulty(spec.rows[p.i]),
    subtopic: spec.subtopic,
    question: (p, _d, lang) => spec.question(spec.rows[p.i], lang),
    correctAnswer: (p, _d, lang) => spec.term(spec.rows[p.i], lang),
    acceptedAnswers: (p, _d, lang) => {
      const row = spec.rows[p.i];
      // deduplicated on the *normalized* form, not the raw string: listing both "жёлчь" and "желчь"
      // is reasonable of an author, but the two fold together and the verifier rejects the collision
      const seen = new Set([normalizeTerm(spec.term(row, lang))]);
      const out: string[] = [];
      for (const alias of spec.aliases(row, lang)) {
        const key = normalizeTerm(alias);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(alias);
      }
      return out;
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
  paragraph?: string;
  subtopic: Bi;
  tags?: string[];
  difficulty: Difficulty;
  params: P;
  constraint?: (p: ParamsOf<P>) => boolean;
  /** decimal places in the shown answer; omitted means the result is a whole number */
  decimals?: number;
  /** overrides the default cap on how many tasks this calculation contributes */
  maxTasks?: number;
  /** the calculation written out as a mathjs expression, built from the parameters */
  formula: (p: ParamsOf<P>) => string;
  /** the same quantity computed independently in TypeScript — the verifier compares the two */
  value: (p: ParamsOf<P>) => number;
  question: (p: ParamsOf<P>, lang: HistLang) => string;
  hint?: (p: ParamsOf<P>, lang: HistLang) => string;
  solution: (p: ParamsOf<P>, answer: string, lang: HistLang) => string;
}

/**
 * A numeric physiology task. `formula` and `value` must be written independently of each other:
 * that is the whole point, and it is what gives history the same guarantee the math renderer has —
 * an answer nobody re-derived is an answer nobody checked.
 *
 * The formula carries the rounding too, so the cross-check compares like with like rather than
 * failing on the display precision.
 */
export function calcTemplate<P extends Record<string, ParamSpec>>(spec: CalcSpec<P>): TaskTemplate<P, HistLang> {
  const round = (n: number) => (spec.decimals === undefined ? Math.round(n) : Number(n.toFixed(spec.decimals)));
  // decimal comma in both of the trainer's languages
  const show = (n: number) => String(round(n)).replace(".", ",");
  return {
    id: spec.id,
    topicId: spec.paragraph ?? spec.topicId,
    answerType: "number",
    tags: spec.tags,
    // a numeric range yields far more substitutions than a hand-written table has rows, so without
    // a cap one calculation would crowd out every term question in its dział
    maxTasks: spec.maxTasks ?? 12,
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

/** A row of any "name / what it does" table — the shape most of the curriculum takes. */
export interface NamedEntry extends InParagraph {
  id: string;
  name: Bi;
  /** noun phrase, not a verb phrase: plural names must fit the same singular question frame */
  role: Bi;
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

/**
 * How the multiple-choice question names the thing asked about. The question's pronoun agrees with
 * it ("Tkanka: … Jaka jest jej rola?" but "Narząd: … Jaka jest jego rola?"), so a label that is
 * feminine says so — per language, since the two can differ ("wada wzroku" / "дефект зрения").
 */
export interface Label extends Bi {
  feminine?: readonly HistLang[];
}

export interface PairSpec {
  topicId: string;
  /** the paragraph for rows that do not name their own */
  paragraph?: string;
  /** used in the template ids: `<topicId>.<slug>-to-role` and `<topicId>.role-to-<slug>` */
  slug: string;
  rows: readonly NamedEntry[];
  subtopic: Bi;
  tags?: string[];
  /** rotates which letter holds the answer, so the position carries no information */
  shift?: number;
  misconception: Bi;
  /** how the multiple-choice question names the thing being asked about */
  label?: Label;
  /**
   * The multiple-choice question after the name, when "what is its role?" does not fit — for a
   * species it is "what sets it apart?". Written whole per language, pronoun included.
   */
  ask?: Bi;
  /** what the free-text question calls the description it gives; defaults to "Funkcja / Функция" */
  cue?: Bi;
  /** the free-text solution repeats the description next to the answer, so a miss teaches something */
  explain?: boolean;
  /** the instruction that ends the free-text question; defaults to "give the name in the nominative" */
  recall?: Bi;
}

/**
 * The pair of templates almost every dział needs: recognise what a structure does, and recall the
 * structure from what it does. One table, both directions, both languages.
 */
const RECALL: Bi = { pl: "Podaj nazwę w mianowniku.", ru: "Назови в именительном падеже." };

export function pairFromTable(spec: PairSpec): HistTemplate[] {
  const label: Label = spec.label ?? { pl: "Struktura", ru: "Структура", feminine: ["pl", "ru"] };
  const feminine = (lang: HistLang) => label.feminine?.includes(lang) ?? false;
  const ask = (lang: HistLang) =>
    spec.ask?.[lang] ??
    (lang === "pl" ? `Jaka jest ${feminine("pl") ? "jej" : "jego"} rola?` : `Какова ${feminine("ru") ? "её" : "его"} роль?`);
  const cue = spec.cue ?? { pl: "Funkcja", ru: "Функция" };
  return [
    choiceFromTable<NamedEntry>({
      id: `${spec.topicId}.${spec.slug}-to-role`,
      topicId: spec.topicId,
      paragraph: spec.paragraph,
      rows: spec.rows,
      subtopic: spec.subtopic,
      tags: spec.tags,
      difficulty: (r) => r.tier,
      shift: spec.shift ?? 0,
      question: (r, lang) => `${label[lang]}: ${r.name[lang]}. ${ask(lang)}`,
      optionText: (r, lang) => r.role[lang],
      misconception: spec.misconception,
      solution: (r, lang) => `${cap(r.name[lang])} — ${r.role[lang]}.`,
    }),
    termFromTable<NamedEntry>({
      id: `${spec.topicId}.role-to-${spec.slug}`,
      topicId: spec.topicId,
      paragraph: spec.paragraph,
      rows: spec.rows,
      subtopic: spec.subtopic,
      tags: spec.tags,
      difficulty: (r) => r.tier,
      question: (r, lang) => `${cue[lang]}: ${r.role[lang]}. ${(spec.recall ?? RECALL)[lang]}`,
      term: (r, lang) => r.name[lang],
      aliases: (r) => [r.name.pl, r.name.ru, ...r.aliases.pl, ...r.aliases.ru],
      solution: (r, lang) => {
        const answer = lang === "pl" ? `Odpowiedź: ${r.name.pl}` : `Ответ: ${r.name.ru}`;
        return spec.explain ? `${answer} — ${r.role[lang]}.` : `${answer}.`;
      },
    }),
  ];
}

// ---------- history: dates ----------

/** A row of a dates table: an event and the year it happened. */
export interface DatedEvent extends InParagraph {
  id: string;
  /** the event, as a noun phrase: "unia lubelska", "bitwa pod Kircholmem" */
  name: Bi;
  year: number;
  /** one sentence on what happened or why it matters; the solution shows it */
  note: Bi;
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

export interface DatesSpec {
  topicId: string;
  paragraph?: string;
  /** used in the template ids: `<topicId>.<slug>-year-to-event` and `<topicId>.<slug>-event-to-year` */
  slug: string;
  rows: readonly DatedEvent[];
  subtopic: Bi;
  tags?: string[];
  shift?: number;
}

/**
 * The pair of templates every history paragraph needs for its dates: recognise what happened in a
 * year, and recall the year of an event. The year is typed as a number and checked exactly.
 */
export function datesFromTable(spec: DatesSpec): HistTemplate[] {
  const year = (r: DatedEvent) => String(r.year);
  return [
    choiceFromTable<DatedEvent>({
      id: `${spec.topicId}.${spec.slug}-year-to-event`,
      topicId: spec.topicId,
      paragraph: spec.paragraph,
      rows: spec.rows,
      subtopic: spec.subtopic,
      tags: spec.tags,
      difficulty: (r) => r.tier,
      shift: spec.shift ?? 0,
      question: (r, lang) => (lang === "pl" ? `Rok ${r.year}. Co się wtedy wydarzyło?` : `${r.year} год. Что тогда произошло?`),
      optionText: (r, lang) => r.name[lang],
      misconception: { pl: "wydarzenie z innego roku tej samej epoki", ru: "событие другого года той же эпохи" },
      solution: (r, lang) => `${r.year} — ${r.name[lang]}. ${r.note[lang]}`,
    }),
    {
      id: `${spec.topicId}.${spec.slug}-event-to-year`,
      topicId: spec.topicId,
      topicOf: (p) => rowParagraph(spec.rows[p.i]) ?? spec.paragraph ?? spec.topicId,
      answerType: "number",
      tags: spec.tags,
      params: { i: choiceParam(...spec.rows.map((_, i) => i)) },
      difficulty: (p) => spec.rows[p.i].tier,
      subtopic: spec.subtopic,
      question: (p, _d, lang) =>
        lang === "pl" ? `Wydarzenie: ${spec.rows[p.i].name.pl}. W którym roku do niego doszło?` : `Событие: ${spec.rows[p.i].name.ru}. В каком году оно произошло?`,
      correctAnswer: (p) => year(spec.rows[p.i]),
      hint: {
        pl: (p) => spec.rows[p.i].note.pl,
        ru: (p) => spec.rows[p.i].note.ru,
      },
      solution: {
        pl: (p) => `Odpowiedź: ${spec.rows[p.i].year}. ${spec.rows[p.i].note.pl}`,
        ru: (p) => `Ответ: ${spec.rows[p.i].year}. ${spec.rows[p.i].note.ru}`,
      },
    } satisfies RowTemplate,
  ];
}

/** Labels and questions the history tables share. */
/** a mixed table of terms, people and places: the frame fits all three */
export const ENTRY: Label = { pl: "Hasło", ru: "Термин" };
export const WHAT_OR_WHO: Bi = { pl: "Co to jest albo kto to był?", ru: "Что это или кто это?" };
export const DESCRIPTION: Bi = { pl: "Opis", ru: "Описание" };
export const NAME_IT: Bi = { pl: "Podaj nazwę, imię albo nazwisko.", ru: "Назови (название, имя или фамилию)." };
/** a table of people only */
export const PERSON: Label = { pl: "Postać", ru: "Личность", feminine: ["pl", "ru"] };
export const WHO_WAS: Bi = { pl: "Kim była ta osoba i z czego słynie?", ru: "Кто это и чем известен?" };
/** a table of terms only */
export const TERM: Label = { pl: "Pojęcie", ru: "Понятие" };
export const WHAT_MEANS: Bi = { pl: "Co oznacza?", ru: "Что это означает?" };
