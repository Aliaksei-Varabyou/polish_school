import { describe, expect, it } from "vitest";
import { PARAGRAPH_TASKS, paragraphsOf } from "../../index.ts";
import { migrateSettings } from "./migrate.ts";

describe("migrating saved biology settings", () => {
  it("turns a chosen chapter into its paragraphs that have tasks", () => {
    const out = migrateSettings({ settings: { topicIds: ["bio.lo3.motion"] }, seenTaskIds: ["old-id"] }, 0);
    const expected = paragraphsOf("bio.lo3.motion").filter((p) => PARAGRAPH_TASKS[p.id]).map((p) => p.id);
    expect(out.settings?.topicIds).toEqual(expected);
    expect(expected).toContain("bio.lo3.motion.skeleton");
    expect(expected).toEqual(paragraphsOf("bio.lo3.motion").map((p) => p.id)); // every paragraph has tasks now
    expect(out.seenTaskIds).toEqual([]); // every task id changed with the move
  });

  it("keeps the rest of the settings and leaves current versions alone", () => {
    const current = { settings: { topicIds: ["bio.lo3.motion.joints"], count: 15 }, seenTaskIds: ["x"] };
    expect(migrateSettings({ settings: { topicIds: [], count: 15, lang: "ru" } }, 0).settings).toMatchObject({ count: 15, lang: "ru" });
    expect(migrateSettings(current, 2)).toBe(current);
  });

  it("puts anyone with saved settings on LO3, the only class there was before class 6", () => {
    expect(migrateSettings({ settings: { topicIds: ["bio.lo3.motion.joints"] } }, 1).settings).toMatchObject({
      grade: "lo3",
      topicIds: ["bio.lo3.motion.joints"],
    });
    // an older save goes through both steps
    expect(migrateSettings({ settings: { topicIds: [] } }, 0).settings?.grade).toBe("lo3");
  });
});
