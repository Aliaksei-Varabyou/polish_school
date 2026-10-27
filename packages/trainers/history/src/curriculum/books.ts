// Every class history covers, youngest first. Each class is one textbook (see sp6.ts).
import type { Grade, Level } from "@portal/core";
import type { Chapter, Paragraph } from "./book.ts";
import { SP6_CHAPTERS, SP6_PARAGRAPHS } from "./sp6.ts";

export const HIST_GRADES = ["sp6"] as const satisfies readonly Grade[];
export type HistGrade = (typeof HIST_GRADES)[number];

export const isHistGrade = (grade: string): grade is HistGrade => (HIST_GRADES as readonly string[]).includes(grade);

/** Primary school has no levels; the hook stays so a liceum book can declare one later. */
export const levelFor = (_grade: HistGrade): Level | undefined => undefined;

export const CHAPTERS: Chapter[] = [...SP6_CHAPTERS];
export const PARAGRAPHS: Paragraph[] = [...SP6_PARAGRAPHS];
