import type { Grade } from "@portal/core";
import { hobbit } from "./books/hobbit.ts";
import type { Book, LectureQuestion } from "./types.ts";

export type { Book, LectureChoice, LectureQuestion } from "./types.ts";

/** New books are added here one at a time — no other change needed for them to show up. */
export const BOOKS: Book[] = [hobbit];

const byId = new Map(BOOKS.map((b) => [b.id, b]));

export const getBook = (id: string): Book | undefined => byId.get(id);

export const booksFor = (grade: Grade): Book[] => BOOKS.filter((b) => b.grades.includes(grade));

export function getQuestion(bookId: string, questionId: string): LectureQuestion | undefined {
  return getBook(bookId)?.questions.find((q) => q.id === questionId);
}
