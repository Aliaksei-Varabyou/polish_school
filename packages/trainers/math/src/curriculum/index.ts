import type { Grade, Level } from "@portal/core";
import { lo } from "./lo.ts";
import { sp } from "./sp.ts";
import type { Topic } from "@portal/core";

export type { Topic } from "@portal/core";

export const TOPICS: Topic[] = [...sp, ...lo];

const byId = new Map(TOPICS.map((t) => [t.id, t]));

export const getTopic = (id: string): Topic | undefined => byId.get(id);

/** Topics for a class; on liceum "R" includes all "P" topics. */
export function topicsFor(grade: Grade, level?: Level): Topic[] {
  return TOPICS.filter((t) => t.grade === grade && (t.level !== "R" || level === "R"));
}
