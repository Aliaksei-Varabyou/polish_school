import type { Grade, Lang, Level, Topic } from "@portal/core";
import type { Chapter, Paragraph } from "./book.ts";
import { CHAPTERS, PARAGRAPHS, type HistGrade } from "./books.ts";
import { TAGS, topicIdsForTags, type Tag } from "./tags.ts";

export * from "./tags.ts";
export type { Chapter, Paragraph } from "./book.ts";
export { HIST_GRADES, CHAPTERS, isHistGrade, levelFor, PARAGRAPHS, type HistGrade } from "./books.ts";
export { P } from "./sp6.ts";
export { PARAGRAPH_TASKS } from "./coverage.generated.ts";

export type { Topic } from "@portal/core";

/** The topics a test is built from are the textbook's paragraphs. */
export const TOPICS: Topic[] = PARAGRAPHS;

const paragraphById = new Map(PARAGRAPHS.map((p) => [p.id, p]));
const chapterById = new Map(CHAPTERS.map((c) => [c.id, c]));

export const getTopic = (id: string): Topic | undefined => paragraphById.get(id);
export const getParagraph = (id: string): Paragraph | undefined => paragraphById.get(id);
export const getChapter = (id: string): Chapter | undefined => chapterById.get(id);

export const paragraphsOf = (chapterId: string): Paragraph[] => PARAGRAPHS.filter((p) => p.chapterId === chapterId);
export const chaptersFor = (grade: HistGrade): Chapter[] => CHAPTERS.filter((c) => c.grade === grade);
export const isInGrade = (topicId: string, grade: HistGrade): boolean => paragraphById.get(topicId)?.grade === grade;

/** The themes that reach at least one paragraph of the class — the others would select nothing. */
export const tagsFor = (grade: HistGrade): Tag[] => TAGS.filter((t) => topicIdsForTags([t.id]).some((id) => isInGrade(id, grade)));
export const paragraphsFor = (grade: HistGrade): Paragraph[] => PARAGRAPHS.filter((p) => p.grade === grade);

/**
 * How a topic id reads anywhere a student sees it: "3.2 Budowa i funkcje szkieletu". Older sessions
 * were built from whole chapters, so a chapter id still resolves — to the chapter's name — instead
 * of showing up in history as a raw id.
 */
export function topicLabel(id: string, lang: Lang): string {
  const paragraph = paragraphById.get(id);
  if (paragraph) return `${paragraph.number} ${paragraph.name[lang] ?? paragraph.name.pl}`;
  const chapter = chapterById.get(id);
  if (chapter) return chapter.name[lang] ?? chapter.name.pl;
  return id;
}

/** Topics for a class. Primary-school history has no levels, so `level` only matters for a future liceum book. */
export function topicsFor(grade: Grade, level?: Level): Topic[] {
  return TOPICS.filter((t) => t.grade === grade && (t.level !== "R" || level === "R"));
}
