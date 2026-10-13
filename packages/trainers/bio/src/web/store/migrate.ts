// Upgrades what the browser kept from an earlier version of the biology trainer.
import { getChapter, PARAGRAPH_TASKS, paragraphsOf } from "../../index.ts";
import type { Settings } from "./session.ts";

export type Persisted = { settings?: Partial<Settings>; seenTaskIds?: string[] };

/**
 * v0 → v1: topics were whole chapters, now they are paragraphs. A chosen chapter becomes all of its
 * paragraphs that have tasks, so the student finds the same material ticked. Seen-task ids are
 * dropped: every task id changed with the move (ids hash the content, the topic included).
 */
function chaptersToParagraphs(persisted: Persisted): Persisted {
  const topicIds = (persisted.settings?.topicIds ?? []).flatMap((id) =>
    getChapter(id) ? paragraphsOf(id).filter((p) => PARAGRAPH_TASKS[p.id]).map((p) => p.id) : [id],
  );
  return { ...persisted, settings: { ...persisted.settings, topicIds }, seenTaskIds: [] };
}

/** v1 → v2: biology gained class 6 next to LO3. Anyone with saved settings was using LO3. */
function addGrade(persisted: Persisted): Persisted {
  return { ...persisted, settings: { ...persisted.settings, grade: "lo3" } };
}

export function migrateSettings(persisted: Persisted, version: number): Persisted {
  if (!persisted?.settings) return persisted;
  let out = persisted;
  if (version < 1) out = chaptersToParagraphs(out);
  if (version < 2) out = addGrade(out);
  return out;
}
