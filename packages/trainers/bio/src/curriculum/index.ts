import type { Grade, Lang, Level, Topic } from "@portal/core";
import { CHAPTERS, PARAGRAPHS, type Chapter, type Paragraph } from "./lo.ts";

export * from "./tags.ts";
export { CHAPTERS, P, PARAGRAPHS, type Chapter, type Paragraph } from "./lo.ts";
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

/**
 * Topics for a class. Every biology topic is level "R", so a request on level "P" returns none —
 * the start page pins the level to "R" rather than offering a choice that has no content.
 */
export function topicsFor(grade: Grade, level?: Level): Topic[] {
  return TOPICS.filter((t) => t.grade === grade && (t.level !== "R" || level === "R"));
}
