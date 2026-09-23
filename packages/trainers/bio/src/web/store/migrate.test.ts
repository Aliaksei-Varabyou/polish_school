import { describe, expect, it } from "vitest";
import { PARAGRAPH_TASKS, paragraphsOf } from "../../index.ts";
import { migrateSettings } from "./migrate.ts";

describe("migrating saved biology settings", () => {
  it("turns a chosen chapter into its paragraphs that have tasks", () => {
    const out = migrateSettings({ settings: { topicIds: ["bio.lo3.motion"] }, seenTaskIds: ["old-id"] }, 0);
    const expected = paragraphsOf("bio.lo3.motion").filter((p) => PARAGRAPH_TASKS[p.id]).map((p) => p.id);
    expect(out.settings?.topicIds).toEqual(expected);
    expect(expected).toContain("bio.lo3.motion.skeleton");
    expect(expected).not.toContain("bio.lo3.motion.animals"); // no tasks yet
    expect(out.seenTaskIds).toEqual([]); // every task id changed with the move
  });

  it("keeps the rest of the settings and leaves current versions alone", () => {
    const current = { settings: { topicIds: ["bio.lo3.motion.joints"], count: 15 }, seenTaskIds: ["x"] };
    expect(migrateSettings({ settings: { topicIds: [], count: 15, lang: "ru" } }, 0).settings).toMatchObject({ count: 15, lang: "ru" });
    expect(migrateSettings(current, 1)).toBe(current);
  });
});
