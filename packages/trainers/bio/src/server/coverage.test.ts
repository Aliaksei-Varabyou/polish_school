import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PARAGRAPHS, PARAGRAPH_TASKS } from "../curriculum/index.ts";
import { renderContent } from "./content.ts";
import { computeCoverage, coverageModule } from "./coverage.ts";

const content = renderContent();

describe("paragraph coverage", () => {
  it("is up to date with the templates", () => {
    // the start page greys out paragraphs and shows task counts from this file; a stale copy would
    // offer an empty paragraph or hide a filled one
    const file = readFileSync(resolve(import.meta.dirname, "../curriculum/coverage.generated.ts"), "utf8");
    expect(file, "content changed: run `npm run gen:coverage -w @portal/trainer-bio`").toBe(coverageModule(computeCoverage(content)));
  });

  it("counts the same in both languages, so one number describes a paragraph", () => {
    for (const p of PARAGRAPHS) {
      const count = (lang: string) => content.tasks.filter((t) => t.lang === lang && t.task.topicId === p.id).length;
      expect(count("ru"), p.number).toBe(count("pl"));
    }
  });

  it("accounts for every task", () => {
    const total = Object.values(PARAGRAPH_TASKS).reduce((a, b) => a + b, 0);
    expect(total * 2).toBe(content.tasks.length);
  });
});
