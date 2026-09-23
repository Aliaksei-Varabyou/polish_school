import { describe, expect, it } from "vitest";
import { countRepeats, rememberSeen, SEEN_LIMIT } from "./seen.ts";

describe("remembering seen tasks", () => {
  it("appends new ids and moves a repeated one to the end instead of duplicating it", () => {
    expect(rememberSeen(["a", "b", "c"], ["d", "a"])).toEqual(["b", "c", "d", "a"]);
  });

  it("keeps only the most recent ids", () => {
    const seen = Array.from({ length: SEEN_LIMIT }, (_, i) => `old${i}`);
    const out = rememberSeen(seen, ["new"]);
    expect(out).toHaveLength(SEEN_LIMIT);
    expect(out.at(-1)).toBe("new");
    expect(out[0]).toBe("old1");
  });

  it("counts how many of a session's tasks were seen before", () => {
    expect(countRepeats(["a", "b"], ["a", "c", "b"])).toBe(2);
    expect(countRepeats([], ["a"])).toBe(0);
  });
});
