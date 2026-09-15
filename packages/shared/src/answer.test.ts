import { describe, expect, it } from "vitest";
import { evaluateNumber, isAnswerCorrect, normalizeAnswer } from "./answer.ts";

describe("normalizeAnswer", () => {
  it("handles decimal comma, unicode minus and x=", () => {
    expect(normalizeAnswer(" x = −2,5 ")).toBe("-2.5");
  });
  it("converts LaTeX fractions and roots", () => {
    expect(normalizeAnswer("\\frac{3}{4}")).toBe("(3)/(4)");
    expect(normalizeAnswer("2\\sqrt{3}")).toBe("2sqrt(3)");
    expect(normalizeAnswer("2√3")).toBe("2sqrt(3)");
  });
});

describe("isAnswerCorrect: numbers", () => {
  it.each([
    ["0,5", "1/2"],
    [".5", "0.5"],
    ["3/4", "0.75"],
    ["2√3", "2*sqrt(3)"],
    ["x=4", "4"],
    ["25%", "25"],
    ["\\frac{6}{8}", "3/4"],
  ])("%s equals %s", (user, correct) => {
    expect(isAnswerCorrect(user, correct, "number")).toBe(true);
  });

  it.each([
    ["0,6", "1/2"],
    ["", "1"],
    ["abc", "1"],
    ["3", "-3"],
  ])("%s does not equal %s", (user, correct) => {
    expect(isAnswerCorrect(user, correct, "number")).toBe(false);
  });

  it("compares several roots order-insensitively", () => {
    expect(isAnswerCorrect("-3; 2", "2; -3", "number")).toBe(true);
    expect(isAnswerCorrect("2", "2; -3", "number")).toBe(false);
    expect(isAnswerCorrect("2; 2", "2; -3", "number")).toBe(false);
  });
});

describe("isAnswerCorrect: expressions", () => {
  it("accepts equivalent forms", () => {
    expect(isAnswerCorrect("2(x+3)", "2x+6", "expression")).toBe(true);
    expect(isAnswerCorrect("x^2+2x+1", "(x+1)^2", "expression")).toBe(true);
    expect(isAnswerCorrect("a*b+b", "b(a+1)", "expression")).toBe(true);
  });
  it("rejects different expressions", () => {
    expect(isAnswerCorrect("2x+5", "2x+6", "expression")).toBe(false);
    expect(isAnswerCorrect("x^2+1", "(x+1)^2", "expression")).toBe(false);
  });
});

describe("isAnswerCorrect: choice", () => {
  it("compares labels", () => {
    expect(isAnswerCorrect("b", "B", "choice")).toBe(true);
    expect(isAnswerCorrect("A", "B", "choice")).toBe(false);
  });
});

describe("sandbox", () => {
  it("blocks dangerous functions", () => {
    expect(evaluateNumber('import({}, {})')).toBeNull();
    expect(evaluateNumber('evaluate("1+1")')).toBeNull();
    expect(evaluateNumber("createUnit('foo')")).toBeNull();
  });
});
