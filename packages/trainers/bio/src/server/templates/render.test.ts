// The highest-value test in the package: it renders every template in both languages, so one run
// catches missing translations, colliding distractors, broken table lookups and empty questions.
import { describe, expect, it } from "vitest";
import { checkAnswer } from "../../answer.ts";
import { CHAPTERS, P, PARAGRAPHS, TAGS, getParagraph, paragraphsOf, topicIdsForTags } from "../../curriculum/index.ts";
import { BIO_LANGS } from "../../lang.ts";
import { ALL_TEMPLATES, contentId, renderTemplate } from "./index.ts";

const LANGS = [...BIO_LANGS];
/** big enough to walk every row of the largest table */
const TARGET = 60;

describe("biology templates", () => {
  it("renders the same task ids on every run, so re-rendering the pool is a no-op", () => {
    // a parameter space larger than the attempt budget makes the renderer sample at random, which
    // would produce new ids each run and quietly grow the pool instead of leaving it alone
    for (const template of ALL_TEMPLATES) {
      const opts = { langs: LANGS, targetCount: TARGET, attemptBudget: 500 } as const;
      const first = renderTemplate(template, opts).tasks.map((t) => t.task.id);
      const second = renderTemplate(template, opts).tasks.map((t) => t.task.id);
      expect(second, `${template.id} renders different tasks each run`).toEqual(first);
    }
  });

  it("has no duplicate template ids", () => {
    const ids = ALL_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("files every task under a textbook paragraph of its own chapter", () => {
    for (const template of ALL_TEMPLATES) {
      // template ids start with the chapter: bio.lo3.<chapter>.<name>
      const chapterId = template.id.split(".").slice(0, 3).join(".");
      const { tasks } = renderTemplate(template, { langs: ["pl"], targetCount: TARGET, attemptBudget: 500 });
      for (const { task } of tasks) {
        // a row with no paragraph falls back to the chapter id, which is not a paragraph — caught here
        const paragraph = getParagraph(task.topicId);
        expect(paragraph, `${task.id} is filed under "${task.topicId}", not a paragraph`).toBeDefined();
        expect(paragraph!.chapterId, `${task.id} wandered into another chapter`).toBe(chapterId);
      }
    }
  });

  it("gives every task of the whole content its own id", () => {
    const ids = ALL_TEMPLATES.flatMap((t) => renderTemplate(t, { langs: LANGS, targetCount: TARGET, attemptBudget: 500 }).tasks.map((r) => r.task.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("derives a task's id from its content, so any edit — including a move to another paragraph — changes it", () => {
    const [{ lang, task }] = renderTemplate(ALL_TEMPLATES[0], { langs: ["pl"], targetCount: 1 }).tasks;
    const template = ALL_TEMPLATES[0].id;
    expect(task.id).toBe(contentId(template, lang, task));
    expect(contentId(template, lang, { ...task, id: "whatever" })).toBe(task.id); // the id itself is not content
    expect(contentId(template, lang, { ...task, topicId: P.organism.homeostasis })).not.toBe(task.id);
    expect(contentId(template, lang, { ...task, question: `${task.question} ` })).not.toBe(task.id);
    // key order is not content either: the hash is over canonical JSON
    const reordered = Object.fromEntries(Object.entries(task).reverse()) as typeof task;
    expect(contentId(template, lang, reordered)).toBe(task.id);
  });

  it("renders every template in pl and ru with nothing rejected", () => {
    for (const template of ALL_TEMPLATES) {
      const { stats } = renderTemplate(template, { langs: LANGS, targetCount: TARGET, attemptBudget: 500 });
      expect(stats.rejected, `${template.id}: ${stats.rejectionReasons.join(" | ")}`).toBe(0);
      expect(stats.accepted, `${template.id} produced nothing`).toBeGreaterThan(0);
    }
  });

  it("produces tasks whose own correct answer passes the answer checker", () => {
    for (const template of ALL_TEMPLATES) {
      const { tasks } = renderTemplate(template, { langs: LANGS, targetCount: TARGET, attemptBudget: 500 });
      for (const { task } of tasks) {
        // catches the classic mismatch where the client marks an answer right and history marks it wrong
        expect(checkAnswer(task, task.correctAnswer), `${task.id}: ${task.correctAnswer}`).toBe(true);
      }
    }
  });

  it("writes real text in both languages — no leftovers from the other one", () => {
    const cyrillic = /[а-яё]/i;
    for (const template of ALL_TEMPLATES) {
      const { tasks } = renderTemplate(template, { langs: LANGS, targetCount: TARGET, attemptBudget: 500 });
      for (const { lang, task } of tasks) {
        expect(task.question.length, `${task.id} question`).toBeGreaterThan(10);
        expect(task.solution.length, `${task.id} solution`).toBeGreaterThan(10);
        expect(task.subtopic.length, `${task.id} subtopic`).toBeGreaterThan(0);
        if (lang === "ru") expect(cyrillic.test(task.question), `${task.id} is not Russian`).toBe(true);
        if (lang === "pl") expect(cyrillic.test(task.question), `${task.id} leaked Russian`).toBe(false);
      }
    }
  });

  it("gives choice tasks four distinct options with exactly one correct", () => {
    for (const template of ALL_TEMPLATES.filter((t) => t.answerType === "choice")) {
      const { tasks } = renderTemplate(template, { langs: LANGS, targetCount: TARGET, attemptBudget: 500 });
      for (const { task } of tasks) {
        expect(task.choices, task.id).toHaveLength(4);
        expect(new Set(task.choices!.map((c) => c.text)).size, `${task.id} duplicate options`).toBe(4);
        expect(task.choices!.some((c) => c.label === task.correctChoice), task.id).toBe(true);
      }
    }
  });

  it("spreads the correct option over all four labels rather than parking it on one", () => {
    const template = ALL_TEMPLATES.find((t) => t.id.endsWith("gland-to-hormone"))!;
    const { tasks } = renderTemplate(template, { langs: ["pl"], targetCount: TARGET, attemptBudget: 500 });
    expect(new Set(tasks.map((t) => t.task.correctChoice)).size).toBe(4);
  });

  it("covers the whole hormone table, not just its first rows", () => {
    const template = ALL_TEMPLATES.find((t) => t.id.endsWith("hormone-to-action"))!;
    const { tasks } = renderTemplate(template, { langs: ["pl"], targetCount: TARGET, attemptBudget: 500 });
    // "adrenalina" sits well past the point a four-way position parameter would have stopped at
    expect(tasks.some((t) => t.task.question.includes("adrenalina"))).toBe(true);
  });
});

describe("cross-cutting tags", () => {
  /** which paragraphs actually hold tasks for each tag, straight from the rendered templates */
  const actual = new Map<string, Set<string>>();
  for (const template of ALL_TEMPLATES) {
    for (const { task } of renderTemplate(template, { langs: ["pl"], targetCount: TARGET, attemptBudget: 500 }).tasks) {
      for (const tag of task.tags ?? []) actual.set(tag, (actual.get(tag) ?? new Set()).add(task.topicId));
    }
  }

  it("declares every tag the templates use", () => {
    for (const tag of actual.keys()) {
      expect(TAGS.map((t) => t.id), `template tag "${tag}" is missing from the catalog`).toContain(tag);
    }
  });

  it("expands a theme into exactly the paragraphs holding its tasks, across more than one chapter", () => {
    // what the start page sends for a theme; drifting from the content would either miss paragraphs
    // with tagged tasks or ask for paragraphs that have none
    for (const tag of TAGS) {
      expect([...topicIdsForTags([tag.id])].sort(), `tag "${tag.id}"`).toEqual([...(actual.get(tag.id) ?? [])].sort());
    }
    // the whole reason tags exist: a theme that lives in a single chapter would just be a subtopic
    const chapters = new Set(topicIdsForTags(["homeostaza"]).map((id) => getParagraph(id)!.chapterId));
    expect(chapters.size).toBeGreaterThan(1);
    expect(topicIdsForTags(["nie-ma-takiego"])).toEqual([]);
  });

  it("puts the tags on the rendered tasks, not just on the templates", () => {
    const template = ALL_TEMPLATES.find((t) => t.id.endsWith("feedback-loop"))!;
    const { tasks } = renderTemplate(template, { langs: ["pl"], targetCount: TARGET, attemptBudget: 500 });
    for (const { task } of tasks) expect(task.tags).toContain("homeostaza");
  });
});

describe("biology curriculum", () => {
  it("follows the book: 11 chapters, 54 paragraphs numbered chapter by chapter with rising pages", () => {
    expect(CHAPTERS).toHaveLength(11);
    expect(PARAGRAPHS).toHaveLength(54);
    let lastPage = 0;
    CHAPTERS.forEach((chapter, i) => {
      expect(chapter.number).toBe(i + 1);
      expect(chapter.subtopics.length).toBeGreaterThan(3);
      const paragraphs = paragraphsOf(chapter.id);
      expect(paragraphs.map((p) => p.number)).toEqual(paragraphs.map((_, j) => `${i + 1}.${j + 1}`));
      for (const p of paragraphs) {
        expect(p.page, `${p.number} page`).toBeGreaterThan(lastPage);
        lastPage = p.page;
      }
    });
  });

  it("makes every paragraph a level-R topic of LO3 with a name in both content languages", () => {
    expect(new Set(PARAGRAPHS.map((p) => p.id)).size).toBe(54);
    for (const p of PARAGRAPHS) {
      expect(p.grade).toBe("lo3");
      expect(p.level).toBe("R");
      expect(p.name.pl.length).toBeGreaterThan(3);
      expect(/[а-яё]/i.test(p.name.ru), `${p.number} has no Russian name`).toBe(true);
    }
  });

  it("names paragraphs by slug, and P resolves to the same ids", () => {
    expect(P.motion.skeleton).toBe("bio.lo3.motion.skeleton");
    expect(getParagraph(P.senses["taste-smell"])?.number).toBe("9.4");
    const fromP = Object.values(P).flatMap((chapter) => Object.values(chapter));
    expect([...fromP].sort()).toEqual(PARAGRAPHS.map((p) => p.id).sort());
  });
});
