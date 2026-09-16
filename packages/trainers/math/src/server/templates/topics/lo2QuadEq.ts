import { choiceParam, defineTemplate, intRange, type ChoiceLabel } from "../types.ts";

const TOPIC = "lo2.quadEq";
const LABELS = ["A", "B", "C", "D"] as const;

/** "3x² + 5x - 2 = 0" style rendering, x² term omitted when b/c coefficients are what varies. */
function quadraticText(b: number, c: number): string {
  const bTerm = b === 0 ? "" : b > 0 ? ` + ${b === 1 ? "" : b}x` : ` - ${b === -1 ? "" : -b}x`;
  const cTerm = c === 0 ? "" : c > 0 ? ` + ${c}` : ` - ${-c}`;
  return `x^2${bTerm}${cTerm} = 0`;
}

// two distinct integer roots -> a=1, b=-(x1+x2), c=x1*x2 — the discriminant is guaranteed a perfect
// square this way, instead of filtering random (a,b,c) triples for one (see feasibility doc, risk 2).
const twoRealRoots = defineTemplate({
  id: `${TOPIC}.two-roots`,
  topicId: TOPIC,
  difficulty: 2,
  answerType: "number",
  params: { x1: intRange(-9, 9), x2: intRange(-9, 9) },
  constraint: (p) => p.x1 < p.x2,
  derive: (p) => ({ b: -(p.x1 + p.x2), c: p.x1 * p.x2 }),
  subtopic: { ru: "Уравнение с двумя корнями (Δ>0)", pl: "Równanie z dwoma pierwiastkami (Δ>0)", en: "Equation with two roots (Δ>0)" },
  question: (_p, d, lang) => ({ ru: `Реши уравнение: $${quadraticText(d.b as number, d.c as number)}$`, pl: `Rozwiąż równanie: $${quadraticText(d.b as number, d.c as number)}$`, en: `Solve the equation: $${quadraticText(d.b as number, d.c as number)}$` })[lang],
  verifyExpression: (_p, d) => {
    const disc = `sqrt((${d.b})^2 - 4*(${d.c}))`;
    return `(-(${d.b}) + ${disc}) / 2; (-(${d.b}) - ${disc}) / 2`;
  },
  correctAnswer: (p) => `${p.x1}; ${p.x2}`,
  solution: {
    ru: (p, d) => `$\\Delta = ${d.b}^2 - 4 \\cdot ${d.c} = ${(d.b as number) ** 2 - 4 * (d.c as number)}$, $\\sqrt{\\Delta} = ${Math.abs(p.x2 - p.x1)}$. Корни: $x_1 = ${p.x1}$, $x_2 = ${p.x2}$.`,
    pl: (p, d) => `$\\Delta = ${d.b}^2 - 4 \\cdot ${d.c} = ${(d.b as number) ** 2 - 4 * (d.c as number)}$, $\\sqrt{\\Delta} = ${Math.abs(p.x2 - p.x1)}$. Pierwiastki: $x_1 = ${p.x1}$, $x_2 = ${p.x2}$.`,
    en: (p, d) => `$\\Delta = ${d.b}^2 - 4 \\cdot ${d.c} = ${(d.b as number) ** 2 - 4 * (d.c as number)}$, $\\sqrt{\\Delta} = ${Math.abs(p.x2 - p.x1)}$. Roots: $x_1 = ${p.x1}$, $x_2 = ${p.x2}$.`,
  },
  hint: {
    ru: () => "Вычисли дискриминант $\\Delta = b^2 - 4ac$.",
    pl: () => "Oblicz wyróżnik $\\Delta = b^2 - 4ac$.",
    en: () => "Compute the discriminant $\\Delta = b^2 - 4ac$.",
  },
});

const doubleRoot = defineTemplate({
  id: `${TOPIC}.double-root`,
  topicId: TOPIC,
  difficulty: 2,
  answerType: "number",
  params: { x0: intRange(-9, 9) },
  constraint: (p) => p.x0 !== 0,
  derive: (p) => ({ b: -2 * p.x0, c: p.x0 * p.x0 }),
  subtopic: { ru: "Уравнение с одним корнем (Δ=0)", pl: "Równanie z jednym pierwiastkiem (Δ=0)", en: "Equation with one root (Δ=0)" },
  question: (_p, d, lang) => ({ ru: `Реши уравнение: $${quadraticText(d.b as number, d.c as number)}$`, pl: `Rozwiąż równanie: $${quadraticText(d.b as number, d.c as number)}$`, en: `Solve the equation: $${quadraticText(d.b as number, d.c as number)}$` })[lang],
  verifyExpression: (_p, d) => `-(${d.b}) / 2`,
  correctAnswer: (p) => String(p.x0),
  solution: {
    ru: (p, d) => `$\\Delta = ${d.b}^2 - 4 \\cdot ${d.c} = 0$, значит один корень: $x_0 = -\\frac{${d.b}}{2} = ${p.x0}$.`,
    pl: (p, d) => `$\\Delta = ${d.b}^2 - 4 \\cdot ${d.c} = 0$, więc jeden pierwiastek: $x_0 = -\\frac{${d.b}}{2} = ${p.x0}$.`,
    en: (p, d) => `$\\Delta = ${d.b}^2 - 4 \\cdot ${d.c} = 0$, so one root: $x_0 = -\\frac{${d.b}}{2} = ${p.x0}$.`,
  },
});

const noRealRoots = defineTemplate({
  id: `${TOPIC}.no-real-roots`,
  topicId: TOPIC,
  difficulty: 3,
  answerType: "choice",
  params: { b: intRange(-8, 8), cOffset: intRange(1, 10), correctPos: choiceParam(...LABELS) },
  // c chosen large enough (relative to b) that Δ = b² - 4c < 0
  derive: (p) => ({ c: Math.ceil((p.b * p.b) / 4) + p.cOffset }),
  subtopic: { ru: "Число корней (Δ<0)", pl: "Liczba pierwiastków (Δ<0)", en: "Number of roots (Δ<0)" },
  question: (p, d, lang) => {
    const eq = quadraticText(p.b, d.c as number);
    return { ru: `Сколько действительных корней имеет уравнение $${eq}$?`, pl: `Ile pierwiastków rzeczywistych ma równanie $${eq}$?`, en: `How many real roots does the equation $${eq}$ have?` }[lang];
  },
  correctAnswer: (p) => p.correctPos,
  choices: (p, _d, lang) => {
    const infinitelyMany = { ru: "бесконечно много", pl: "nieskończenie wiele", en: "infinitely many" }[lang];
    const otherLabels = LABELS.filter((l) => l !== p.correctPos);
    const wrong: [ChoiceLabel, string][] = [
      [otherLabels[0], "1"],
      [otherLabels[1], "2"],
      [otherLabels[2], infinitelyMany],
    ];
    return [{ label: p.correctPos, text: "0" }, ...wrong.map(([label, text]) => ({ label, text, misconception: "неверно определено число корней по знаку дискриминанта" }))];
  },
  correctChoiceLabel: (p) => p.correctPos,
  solution: {
    ru: (_p, d) => `$\\Delta < 0$ (нет вещественных корней), потому что $c = ${d.c}$ подобрано больше $\\frac{b^2}{4}$.`,
    pl: (_p, d) => `$\\Delta < 0$ (brak pierwiastków rzeczywistych), ponieważ $c = ${d.c}$ jest większe niż $\\frac{b^2}{4}$.`,
    en: (_p, d) => `$\\Delta < 0$ (no real roots), because $c = ${d.c}$ is chosen larger than $\\frac{b^2}{4}$.`,
  },
});

export const lo2QuadEqTemplates = [twoRealRoots, doubleRoot, noRealRoots];
