// Independent re-computation of a numeric answer, for the verifier.
//
// The math trainer's strongest guarantee is that a rendered task's answer is computed twice, once in
// TypeScript and once by mathjs from `verifyExpression`, and the task is dropped if the two disagree.
// Biology's calculations (minute ventilation, cardiac output, GFR, lens power) deserve the same
// treatment: a template writes the formula out as a string from its parameters, while `correctAnswer`
// comes from separate TypeScript arithmetic, so a typo in either one is caught rather than shipped.
import { all, create } from "mathjs";

const math = create(all);
const evaluate = math.evaluate;

// Restrict mathjs. Templates are ours, but this module also sees anything a future generator
// produces, and the cost of locking it down is one call.
const blocked = () => {
  throw new Error("Function disabled");
};
math.import(
  { import: blocked, createUnit: blocked, evaluate: blocked, parse: blocked, simplify: blocked, derivative: blocked },
  { override: true },
);

/** Numeric value of a plain arithmetic expression, or null if it is not one. */
export function evaluateExpression(expression: string): number | null {
  try {
    const value = evaluate(expression) as unknown;
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}
