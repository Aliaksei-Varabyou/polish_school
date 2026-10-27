// Cross-cutting themes — none yet for history. The mechanism stays (the start page hides the theme
// mode while the list is empty), so a theme such as "władcy" or "wojny" can be added later by
// tagging tasks and listing it here.
import type { Lang } from "@portal/core";
import { TAG_PARAGRAPHS } from "./coverage.generated.ts";

export interface Tag {
  id: string;
  name: Record<Lang, string>;
}

export const TAGS: Tag[] = [];

const byId = new Map(TAGS.map((t) => [t.id, t]));

export const getTag = (id: string): Tag | undefined => byId.get(id);

/** The paragraphs a chosen theme expands into: exactly those holding tasks with the tag. */
export function topicIdsForTags(tagIds: readonly string[]): string[] {
  return [...new Set(tagIds.flatMap((id) => TAG_PARAGRAPHS[id] ?? []))];
}
