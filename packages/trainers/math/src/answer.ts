import { all, create, type MathNode } from "mathjs";
import type { AnswerType } from "@portal/core";

const math = create(all);
const evaluate = math.evaluate;
const parse = math.parse;

// Restrict mathjs: expressions come from users and from the LLM.
const blocked = () => {
  throw new Error("Function disabled");
};
math.import(
  {
    import: blocked,
    createUnit: blocked,
    evaluate: blocked,
    parse: blocked,
    simplify: blocked,
    derivative: blocked,
    resolve: blocked,
    reviver: blocked,
  },
  { override: true },
);

const TOLERANCE = 1e-9;

/** Converts human/LaTeX-ish notation into a mathjs expression. */
export function normalizeAnswer(raw: string): string {
  let s = raw.trim();
  s = s.replace(/\$/g, "");
  s = s.replace(/\\left|\\right/g, "");
  s = s.replace(/\\cdot|\\times|[×·]/g, "*");
  s = s.replace(/\\div|÷|:/g, "/");
  s = s.replace(/\\pi|π/g, "pi");
  s = s.replace(/\\dfrac|\\tfrac/g, "\\frac");
  // \frac{a}{b} -> (a)/(b) (repeat for nesting)
  for (let i = 0; i < 5 && /\\frac\{/.test(s); i++) {
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)");
  }
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)");
  s = s.replace(/[−–—]/g, "-");
  s = s.replace(/²/g, "^2").replace(/³/g, "^3");
  s = s.replace(/√\s*(\([^()]*\)|\d+(?:[.,]\d+)?|[a-z])/gi, "sqrt($1)");
  s = s.replace(/[{}]/g, (c) => (c === "{" ? "(" : ")"));
  // decimal comma: 0,75 -> 0.75
  s = s.replace(/(\d),(\d)/g, "$1.$2");
  // percent sign at the end is just a label
  s = s.replace(/%$/, "");
  s = s.replace(/\s+/g, "");
  s = s.toLowerCase();
  // "x=3" -> "3"
  s = s.replace(/^[a-z]=(?!=)/, "");
  // implicit multiplication by a single-letter variable: "b(a+1)" -> "b*(a+1)", ")(" -> ")*("
  s = s.replace(/(^|[^a-z])([a-z])\(/g, "$1$2*(").replace(/\)\(/g, ")*(");
  return s;
}

export function evaluateNumber(expr: string, scope: Record<string, number> = {}): number | null {
  try {
    const value = evaluate(expr, { ...scope });
    const n = typeof value === "number" ? value : Number(value?.valueOf?.());
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCE * Math.max(1, Math.abs(a), Math.abs(b));
}

function freeVariables(expr: string): string[] | null {
  let node: MathNode;
  try {
    node = parse(expr);
  } catch {
    return null;
  }
  const names = new Set<string>();
  node.traverse((n, _path, parent) => {
    if (n.type !== "SymbolNode") return;
    const name = (n as unknown as { name: string }).name;
    const isFnName = parent?.type === "FunctionNode" && (parent as unknown as { fn: MathNode }).fn === n;
    if (!isFnName && !(name in math)) names.add(name);
  });
  return [...names];
}

function expressionsEqual(a: string, b: string): boolean {
  const vars = freeVariables(b);
  const varsA = freeVariables(a);
  if (!vars || !varsA) return false;
  const allVars = [...new Set([...vars, ...varsA])];
  if (allVars.length === 0) {
    const x = evaluateNumber(a);
    const y = evaluateNumber(b);
    return x !== null && y !== null && nearlyEqual(x, y);
  }
  let compared = 0;
  for (let i = 0; i < 12 && compared < 6; i++) {
    const scope = Object.fromEntries(allVars.map((v) => [v, Math.round((Math.random() * 10 - 5) * 1000) / 1000 + 0.137]));
    const x = evaluateNumber(a, scope);
    const y = evaluateNumber(b, scope);
    if (y === null) continue; // outside the domain of the correct expression
    if (x === null || !nearlyEqual(x, y)) return false;
    compared++;
  }
  return compared > 0;
}

function singleEqual(user: string, correct: string, type: AnswerType): boolean {
  const u = normalizeAnswer(user);
  const c = normalizeAnswer(correct);
  if (!u) return false;
  if (u === c) return true;
  if (type === "expression") return expressionsEqual(u, c);
  const x = evaluateNumber(u);
  const y = evaluateNumber(c);
  return x !== null && y !== null && nearlyEqual(x, y);
}

const splitParts = (s: string) =>
  s
    .split(/;|\s+(?:и|and|oraz|i|lub|или|or)\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);

/** Checks a user's answer. Multiple answers separated by ";" are compared order-insensitively. */
export function isAnswerCorrect(user: string, correct: string, type: AnswerType): boolean {
  if (type === "choice") return user.trim().toUpperCase() === correct.trim().toUpperCase();
  const correctParts = splitParts(correct);
  const userParts = splitParts(user);
  if (correctParts.length <= 1) return userParts.length === 1 && singleEqual(userParts[0], correct, type);
  if (userParts.length !== correctParts.length) return false;
  const left = [...correctParts];
  for (const part of userParts) {
    const idx = left.findIndex((c) => singleEqual(part, c, type));
    if (idx === -1) return false;
    left.splice(idx, 1);
  }
  return true;
}

export { freeVariables };
