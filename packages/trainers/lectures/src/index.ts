// Isomorphic part of the lectures trainer: used by both the web app and the API.
// A book is exposed as one `Topic` per grade it is assigned to (id = "<bookId>.<grade>"), mirroring
// how the math trainer models one topic per grade — this lets the shared /api/trainers/:id/topics
// endpoint and TrainerServer.topicsFor(grade) work unchanged.
import type { Grade, Topic } from "@portal/core";
import { BOOKS, booksFor, getBook } from "./content/index.ts";
import type { Book } from "./content/types.ts";

export * from "./content/index.ts";

const topicId = (bookId: string, grade: Grade) => `${bookId}.${grade}`;

function toTopic(book: Book, grade: Grade): Topic {
  return {
    id: topicId(book.id, grade),
    grade,
    name: book.title,
    subtopics: [...new Set(book.questions.map((q) => q.chapter).filter((c): c is string => !!c))],
  };
}

export const TOPICS: Topic[] = BOOKS.flatMap((book) => book.grades.map((grade) => toTopic(book, grade)));

const topicsById = new Map(TOPICS.map((t) => [t.id, t]));

export const getTopic = (id: string): Topic | undefined => topicsById.get(id);

export function topicsFor(grade: Grade): Topic[] {
  return booksFor(grade).map((book) => toTopic(book, grade));
}

/** Extracts the book id back out of a topic id ("hobbit.sp6" -> "hobbit"). */
export function bookIdFromTopic(topicId: string): string {
  return topicId.slice(0, topicId.lastIndexOf("."));
}

export function bookForTopic(topicId: string): Book | undefined {
  return getBook(bookIdFromTopic(topicId));
}

/** Choice answers only: a case-insensitive label match, same rule the choice branch of the math trainer uses. */
export function isAnswerCorrect(answer: string, correctChoice: string): boolean {
  return answer.trim().toUpperCase() === correctChoice.trim().toUpperCase();
}
