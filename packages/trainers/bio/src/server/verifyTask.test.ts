import { describe, expect, it } from "vitest";
import { verifyTask, type VerifyContext } from "./verifyTask.ts";

const ctx: VerifyContext = { allowedTopicIds: ["bio.lo3.hormones"], answerMode: "mixed" };

const raw = (overrides: Record<string, unknown> = {}) => ({
  topicId: "bio.lo3.hormones",
  subtopic: "gruczoły dokrewne i hormony",
  difficulty: 1,
  question: "Podaj nazwę hormonu, który obniża poziom glukozy we krwi.",
  answerType: "text",
  correctAnswer: "insulina",
  acceptedAnswers: ["инсулин"],
  solution: "Odpowiedź: insulina.",
  ...overrides,
});

const choiceRaw = (overrides: Record<string, unknown> = {}) => ({
  topicId: "bio.lo3.hormones",
  subtopic: "gruczoły dokrewne i hormony",
  difficulty: 2,
  question: "Który hormon wydziela tarczyca?",
  answerType: "choice",
  correctAnswer: "B",
  correctChoice: "B",
  choices: [
    { label: "A", text: "insulina" },
    { label: "B", text: "tyroksyna" },
    { label: "C", text: "glukagon" },
    { label: "D", text: "adrenalina" },
  ],
  solution: "Tarczyca wydziela tyroksynę.",
  ...overrides,
});

describe("verifyTask", () => {
  it("accepts a well-formed text task and uses the deterministic id when given one", () => {
    const result = verifyTask(raw(), { ...ctx, id: "bio.lo3.hormones.x:pl:abc" });
    expect(result).toMatchObject({ ok: true });
    if (result.ok) expect(result.task.id).toBe("bio.lo3.hormones.x:pl:abc");
  });

  it("rejects a topic outside the requested batch", () => {
    expect(verifyTask(raw({ topicId: "bio.lo3.nervous" }), ctx)).toMatchObject({ ok: false });
  });

  it("strips nulls that a generator may send for optional fields", () => {
    expect(verifyTask(raw({ hint: null, acceptedAnswers: null, verifyExpression: "" }), ctx)).toMatchObject({ ok: true });
  });

  it("rejects an alias that collapses onto the canonical answer", () => {
    const result = verifyTask(raw({ acceptedAnswers: ["Insulina."] }), ctx);
    expect(result).toMatchObject({ ok: false, reason: "duplicate accepted answers" });
  });

  it("rejects a term that normalizes to nothing", () => {
    expect(verifyTask(raw({ correctAnswer: "." }), ctx)).toMatchObject({ ok: false });
  });

  it("rejects algebraic answers — biology has none", () => {
    expect(verifyTask(raw({ answerType: "expression", correctAnswer: "2x+3" }), ctx)).toMatchObject({ ok: false });
  });

  it("rejects a number task whose answer is not a number", () => {
    expect(verifyTask(raw({ answerType: "number", correctAnswer: "dużo" }), ctx)).toMatchObject({ ok: false });
  });

  it("accepts a number task with a unit in the answer", () => {
    expect(verifyTask(raw({ answerType: "number", correctAnswer: "5,25 l/min" }), ctx)).toMatchObject({ ok: true });
  });

  it("accepts a well-formed choice task and mirrors the label into correctAnswer", () => {
    const result = verifyTask(choiceRaw(), ctx);
    expect(result).toMatchObject({ ok: true });
    if (result.ok) expect(result.task.correctAnswer).toBe("B");
  });

  it("rejects choice options that collide after normalization", () => {
    const choices = [
      { label: "A", text: "Tyroksyna" },
      { label: "B", text: "tyroksyna" },
      { label: "C", text: "glukagon" },
      { label: "D", text: "adrenalina" },
    ];
    expect(verifyTask(choiceRaw({ choices }), ctx)).toMatchObject({ ok: false, reason: "duplicate choice texts" });
  });

  it("rejects a correctChoice that is not among the options", () => {
    expect(verifyTask(choiceRaw({ correctChoice: "E" }), ctx)).toMatchObject({ ok: false });
  });

  it("enforces the requested answer mode", () => {
    expect(verifyTask(choiceRaw(), { ...ctx, answerMode: "input" })).toMatchObject({ ok: false });
    expect(verifyTask(raw(), { ...ctx, answerMode: "choice" })).toMatchObject({ ok: false });
  });
});
