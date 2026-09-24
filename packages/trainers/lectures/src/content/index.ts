import { GRADES, type Grade } from "@portal/core";
import { akademiaPanaKleksa } from "./books/akademiaPanaKleksa.ts";
import { chlopcyZPlacuBroni } from "./books/chlopcyZPlacuBroni.ts";
import { hobbit } from "./books/hobbit.ts";
import { kajkoIKokosz } from "./books/kajkoIKokosz.ts";
import { narnia } from "./books/narnia.ts";
import { noelka } from "./books/noelka.ts";
import { przygodyTomkaSawyera } from "./books/przygodyTomkaSawyera.ts";
import { rzeka } from "./books/rzeka.ts";
import { tajemniczyOgrod } from "./books/tajemniczyOgrod.ts";
import { stageGrades, type StageId } from "./stages.ts";
import type { Book, LectureQuestion } from "./types.ts";

export type { Book, LectureChoice, LectureQuestion } from "./types.ts";
export * from "./stages.ts";

/** New books are added here one at a time — no other change needed for them to show up. */
export const BOOKS: Book[] = [akademiaPanaKleksa, kajkoIKokosz, narnia, chlopcyZPlacuBroni, hobbit, przygodyTomkaSawyera, tajemniczyOgrod, noelka, rzeka];

const byId = new Map(BOOKS.map((b) => [b.id, b]));

export const getBook = (id: string): Book | undefined => byId.get(id);

export const booksFor = (grade: Grade): Book[] => BOOKS.filter((b) => b.grades.includes(grade));

const gradeRank = (book: Book) => (book.typicalGrade ? GRADES.indexOf(book.typicalGrade) : GRADES.length);

/** Books listed for any grade of the stage: obligatory first, each group in the order schools usually read them. */
export function booksForStage(stage: StageId): Book[] {
  const grades = stageGrades(stage);
  return BOOKS.filter((b) => b.grades.some((g) => grades.includes(g))).sort(
    (a, b) =>
      Number(!!a.supplementary) - Number(!!b.supplementary) ||
      gradeRank(a) - gradeRank(b) ||
      a.title.pl.localeCompare(b.title.pl, "pl"),
  );
}

export function getQuestion(bookId: string, questionId: string): LectureQuestion | undefined {
  return getBook(bookId)?.questions.find((q) => q.id === questionId);
}
