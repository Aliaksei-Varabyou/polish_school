// A textbook as the trainer sees it: chapters that group paragraphs, a paragraph being the unit a
// test is built from (it is the `Topic`). Each class's book is declared once with `defineBook`.
//
// Paragraph ids are slugs, not numbers: another edition may renumber the book, and history and
// progress are keyed by topic id, so the number is a display field that can change freely.
import type { Grade, Lang, Level, Topic } from "@portal/core";

export interface Chapter {
  /** `history.<grade>.<key>` */
  id: string;
  grade: Grade;
  number: number;
  name: Record<Lang, string>;
  /** Polish curriculum terms for the whole chapter (feedback falls back to these) */
  subtopics: string[];
}

export interface Paragraph extends Topic {
  chapterId: string;
  /** as printed in the book: "12" (GWO numbers paragraphs straight through) */
  number: string;
  /** first page in the book, when it has been checked against the student's copy */
  page?: number;
}

/** number as printed, first page (null until checked against the student's copy), pl and ru titles */
export type Entry = readonly [number: string, page: number | null, pl: string, ru: string];

export interface ChapterSpec {
  number: number;
  name: readonly [pl: string, ru: string, en: string];
  subtopics: readonly string[];
  paragraphs: Readonly<Record<string, Entry>>;
}

/** Paragraph ids by chapter and slug: `P.golden.lublin`. */
export type ParagraphIds<B extends Record<string, ChapterSpec>> = { [C in keyof B]: { [S in keyof B[C]["paragraphs"]]: string } };

export interface Book<B extends Record<string, ChapterSpec>> {
  chapters: Chapter[];
  paragraphs: Paragraph[];
  /**
   * Paragraph ids by chapter and slug — how content tables name the paragraph a row belongs to, so
   * a typo is a compile error rather than a task silently filed under no paragraph.
   */
  P: ParagraphIds<B>;
}

export function defineBook<const B extends Record<string, ChapterSpec>>(grade: Grade, level: Level | undefined, book: B): Book<B> {
  const keys = Object.keys(book);
  const chapterId = (key: string) => `history.${grade}.${key}`;

  const chapters = keys.map((key): Chapter => {
    const { number, name, subtopics } = book[key];
    const [pl, ru, en] = name;
    return { id: chapterId(key), grade, number, name: { pl, ru, en }, subtopics: [...subtopics] };
  });

  const paragraphs = keys.flatMap((key) =>
    Object.entries(book[key].paragraphs).map(
      ([slug, [number, page, pl, ru]]): Paragraph => ({
        id: `${chapterId(key)}.${slug}`,
        grade,
        ...(level ? { level } : {}),
        // EN is not offered for history; the slot is filled so the portal-wide `Topic` shape still holds
        name: { pl, ru, en: pl },
        // curriculum terms live on the chapter; a paragraph's own terms come from the tasks in it
        subtopics: [],
        chapterId: chapterId(key),
        number,
        ...(page !== null ? { page } : {}),
      }),
    ),
  );

  const P = Object.fromEntries(
    keys.map((key) => [key, Object.fromEntries(Object.keys(book[key].paragraphs).map((slug) => [slug, `${chapterId(key)}.${slug}`]))]),
  ) as ParagraphIds<B>;

  return { chapters, paragraphs, P };
}
