import { describe, expect, it } from "vitest";
import { migrateSettings, shuffleChoices } from "../web/store/session.ts";
import { BOOKS, booksForStage, STAGES } from "./index.ts";

describe("shuffleChoices", () => {
  const q = BOOKS[0].questions[0];
  const correctText = (x: typeof q) => x.choices.find((c) => c.label === x.correctChoice)?.text;

  it("keeps the right answer and relabels A–D", () => {
    for (let i = 0; i < 50; i++) {
      const s = shuffleChoices(q);
      expect(s.choices.map((c) => c.label)).toEqual(["A", "B", "C", "D"]);
      expect(correctText(s)).toBe(correctText(q));
      expect(new Set(s.choices.map((c) => c.text))).toEqual(new Set(q.choices.map((c) => c.text)));
    }
  });

  it("moves the right answer around", () => {
    const labels = new Set(Array.from({ length: 200 }, () => shuffleChoices(q).correctChoice));
    expect(labels.size).toBe(4);
  });
});

describe("question banks", () => {
  it.each(BOOKS.map((b) => [b.id, b] as const))("%s: unique ids, answers among A–D, typical grade listed", (_, book) => {
    const ids = book.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of book.questions) {
      expect(q.choices.map((c) => c.label)).toEqual(["A", "B", "C", "D"]);
      expect(q.choices.some((c) => c.label === q.correctChoice)).toBe(true);
      expect(new Set(q.choices.map((c) => c.text)).size).toBe(4);
      expect(q.explanation.length).toBeGreaterThan(0);
    }
    if (book.typicalGrade) expect(book.grades).toContain(book.typicalGrade);
  });

  it("every book belongs to some stage", () => {
    const listed = new Set(STAGES.flatMap((s) => booksForStage(s.id).map((b) => b.id)));
    expect(BOOKS.every((b) => listed.has(b.id))).toBe(true);
  });

  it("stage lists put obligatory books first, each group sorted by typical grade", () => {
    const keys = booksForStage("sp4-6").map((b) => `${b.supplementary ? 1 : 0}-${b.typicalGrade ?? "zz"}`);
    expect(keys).toEqual([...keys].sort());
  });
});

describe("migrateSettings", () => {
  it("maps a v0 grade to its stage and keeps a book listed there", () => {
    expect(migrateSettings({ settings: { grade: "sp6", bookId: "hobbit", count: 15 } })).toEqual({
      settings: { stage: "sp4-6", bookId: "hobbit", count: 15 },
    });
  });

  it("drops a book that isn't listed for the migrated stage", () => {
    expect(migrateSettings({ settings: { grade: "lo2", bookId: "hobbit", count: 10 } }).settings).toMatchObject({
      stage: "lo",
      bookId: null,
    });
  });

  it("falls back to defaults on garbage", () => {
    expect(migrateSettings("nope").settings).toEqual({ stage: "sp4-6", bookId: null, count: 10 });
    expect(migrateSettings({ settings: { grade: "xx", bookId: 5, count: -1 } }).settings).toEqual({
      stage: "sp4-6",
      bookId: null,
      count: 10,
    });
  });
});
