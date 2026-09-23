// Content schema for the lectures trainer: fixed comprehension questions about one book, hand-authored
// (not parametrized/generated). Questions and answers are always in Polish — the curriculum's language —
// regardless of the portal's interface language.
import type { ChoiceLabel, Difficulty, Grade, Lang } from "@portal/core";

export interface LectureChoice {
  label: ChoiceLabel;
  text: string;
}

export interface LectureQuestion {
  id: string;
  /** optional chapter/section this question relates to, shown as a tag */
  chapter?: string;
  difficulty: Difficulty;
  /** po polsku, zawsze */
  question: string;
  choices: [LectureChoice, LectureChoice, LectureChoice, LectureChoice];
  correctChoice: ChoiceLabel;
  /** krótkie uzasadnienie po polsku, pokazywane jako rozwiązanie */
  explanation: string;
}

export interface Book {
  id: string;
  /** UI metadata (book title), localized like the rest of the portal chrome — not the questions themselves */
  title: Record<Lang, string>;
  author: string;
  /** every grade the curriculum lists the book for — MEN defines lektury per range (e.g. klasy 4–6), not per year */
  grades: Grade[];
  /** the grade schools most often read it in; only a hint for sorting and a badge, since each school decides */
  typicalGrade?: Grade;
  questions: LectureQuestion[];
}
