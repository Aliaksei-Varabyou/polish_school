import type { Grade, Level, Topic } from "@portal/core";
import { lo } from "./lo.ts";

export * from "./tags.ts";

export type { Topic } from "@portal/core";

export const TOPICS: Topic[] = [...lo];

const byId = new Map(TOPICS.map((t) => [t.id, t]));

export const getTopic = (id: string): Topic | undefined => byId.get(id);

/**
 * Topics for a class. Every biology topic is level "R", so a request on level "P" returns none —
 * the start page pins the level to "R" rather than offering a choice that has no content.
 */
export function topicsFor(grade: Grade, level?: Level): Topic[] {
  return TOPICS.filter((t) => t.grade === grade && (t.level !== "R" || level === "R"));
}
