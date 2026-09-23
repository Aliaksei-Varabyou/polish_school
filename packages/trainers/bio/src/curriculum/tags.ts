// Cross-cutting themes. Homeostasis, for instance, is not a subtopic of one dział — it is taught
// through thermoregulation (2), regulation of breathing (5), ADH and aldosterone (7), the autonomic
// nervous system (8) and glucose/calcium control (10). A flat label set spans that; a second level
// under the topic tree could not.
import type { Lang } from "@portal/core";

export interface Tag {
  id: string;
  name: Record<Lang, string>;
  /**
   * Topics that carry this tag. The client expands a chosen theme into these, so the server keeps
   * receiving an ordinary topic list and its allow-list is unchanged. Kept in step with the
   * templates by a test, not by hand-checking.
   */
  topicIds: string[];
}

export const TAGS: Tag[] = [
  {
    id: "homeostaza",
    name: { pl: "Homeostaza i sprzężenie zwrotne", ru: "Гомеостаз и обратная связь", en: "Homeostasis and feedback" },
    topicIds: ["bio.lo3.hormones", "bio.lo3.urinary", "bio.lo3.organism", "bio.lo3.skin"],
  },
  {
    id: "regulacja-hormonalna",
    name: { pl: "Regulacja hormonalna", ru: "Гормональная регуляция", en: "Hormonal regulation" },
    topicIds: ["bio.lo3.hormones"],
  },
  {
    id: "choroby",
    name: { pl: "Choroby i zaburzenia", ru: "Болезни и нарушения", en: "Diseases and disorders" },
    topicIds: ["bio.lo3.hormones", "bio.lo3.senses"],
  },
  {
    id: "obliczenia",
    name: { pl: "Zadania obliczeniowe", ru: "Расчётные задания", en: "Calculation tasks" },
    topicIds: ["bio.lo3.respiration", "bio.lo3.circulation", "bio.lo3.urinary", "bio.lo3.senses", "bio.lo3.reproduction"],
  },
];

const byId = new Map(TAGS.map((t) => [t.id, t]));

export const getTag = (id: string): Tag | undefined => byId.get(id);

/** The topics a chosen theme expands into, restricted to topics that exist. */
export function topicIdsForTags(tagIds: readonly string[]): string[] {
  return [...new Set(tagIds.flatMap((id) => byId.get(id)?.topicIds ?? []))];
}
