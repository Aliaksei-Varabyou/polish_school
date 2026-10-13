// Every class biology covers, youngest first. Each class is one textbook (see sp6.ts, lo.ts).
import type { Grade, Level } from "@portal/core";
import type { Chapter, Paragraph } from "./book.ts";
import { LO3_CHAPTERS, LO3_PARAGRAPHS } from "./lo.ts";
import { SP6_CHAPTERS, SP6_PARAGRAPHS } from "./sp6.ts";

export const BIO_GRADES = ["sp6", "lo3"] as const satisfies readonly Grade[];
export type BioGrade = (typeof BIO_GRADES)[number];

export const isBioGrade = (grade: string): grade is BioGrade => (BIO_GRADES as readonly string[]).includes(grade);

/**
 * The level a class is taught at. Liceum biology here is the extended track only, so its topics are
 * level "R" and a request must say so; primary school has no levels.
 */
export const levelFor = (grade: BioGrade): Level | undefined => (grade === "lo3" ? "R" : undefined);

export const CHAPTERS: Chapter[] = [...SP6_CHAPTERS, ...LO3_CHAPTERS];
export const PARAGRAPHS: Paragraph[] = [...SP6_PARAGRAPHS, ...LO3_PARAGRAPHS];
