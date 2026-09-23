// Cross-cutting themes. Homeostasis, for instance, is not a subtopic of one dział — it is taught
// through thermoregulation (2), regulation of breathing (5), ADH and aldosterone (7), the autonomic
// nervous system (8) and glucose/calcium control (10). A flat label set spans that; a second level
// under the topic tree could not.
import type { Lang } from "@portal/core";
import { TAG_PARAGRAPHS } from "./coverage.generated.ts";

export interface Tag {
  id: string;
  name: Record<Lang, string>;
}

export const TAGS: Tag[] = [
  {
    id: "homeostaza",
    name: { pl: "Homeostaza i sprzężenie zwrotne", ru: "Гомеостаз и обратная связь", en: "Homeostasis and feedback" },
  },
  {
    id: "regulacja-hormonalna",
    name: { pl: "Regulacja hormonalna", ru: "Гормональная регуляция", en: "Hormonal regulation" },
  },
  {
    id: "choroby",
    name: { pl: "Choroby i zaburzenia", ru: "Болезни и нарушения", en: "Diseases and disorders" },
  },
  {
    id: "obliczenia",
    name: { pl: "Zadania obliczeniowe", ru: "Расчётные задания", en: "Calculation tasks" },
  },
];

const byId = new Map(TAGS.map((t) => [t.id, t]));

export const getTag = (id: string): Tag | undefined => byId.get(id);

/**
 * The paragraphs a chosen theme expands into: exactly those holding tasks with the tag, read from
 * the rendered content rather than kept by hand. The client sends them as the topic list, so the
 * server's allow-list is unchanged and the tag itself narrows within each paragraph.
 */
export function topicIdsForTags(tagIds: readonly string[]): string[] {
  return [...new Set(tagIds.flatMap((id) => TAG_PARAGRAPHS[id] ?? []))];
}
