import { defineTemplate, intRange } from "@portal/trainer-sdk/templates";

const TOPIC = "lo2.polynomials";

/** One term's sign and magnitude text, e.g. coef=-1,power=1 -> {sign:"-", text:"x"}; coef=0 -> null. */
function term(coef: number, power: 0 | 1 | 2): { sign: "+" | "-"; text: string } | null {
  if (coef === 0) return null;
  const unit = power === 0 ? "" : power === 1 ? "x" : "x^2";
  const magnitude = Math.abs(coef) === 1 && power > 0 ? "" : String(Math.abs(coef));
  return { sign: coef < 0 ? "-" : "+", text: `${magnitude}${unit}` };
}

/** Joins terms as "3x^2 - 5x + 2" — consistent " + "/" - " between terms, no leading "+". */
function joinTerms(terms: (ReturnType<typeof term>)[]): string {
  const present = terms.filter((t): t is NonNullable<typeof t> => t !== null);
  if (present.length === 0) return "0";
  return present.map((t, i) => (i === 0 ? (t.sign === "-" ? `-${t.text}` : t.text) : ` ${t.sign} ${t.text}`)).join("");
}

function quadText(a: number, b: number, c: number): string {
  return joinTerms([term(a, 2), term(b, 1), term(c, 0)]);
}

function linearText(a: number, b: number): string {
  return joinTerms([term(a, 1), term(b, 0)]);
}

const addPolynomials = defineTemplate({
  id: `${TOPIC}.add`,
  topicId: TOPIC,
  difficulty: 1,
  answerType: "expression",
  params: { a1: intRange(-9, 9), b1: intRange(-9, 9), c1: intRange(-9, 9), a2: intRange(-9, 9), b2: intRange(-9, 9), c2: intRange(-9, 9) },
  constraint: (p) => p.a1 !== 0 && p.a2 !== 0 && p.a1 + p.a2 !== 0,
  derive: (p) => ({ a: p.a1 + p.a2, b: p.b1 + p.b2, c: p.c1 + p.c2 }),
  subtopic: { ru: "Сложение многочленов", pl: "Dodawanie wielomianów", en: "Adding polynomials" },
  question: (p, _d, lang) => {
    const w = `(${quadText(p.a1, p.b1, p.c1)}) + (${quadText(p.a2, p.b2, p.c2)})`;
    return { ru: `Выполни сложение и упрости: $${w}$`, pl: `Wykonaj dodawanie i uprość: $${w}$`, en: `Add and simplify: $${w}$` }[lang];
  },
  verifyExpression: (_p, d) => quadText(d.a as number, d.b as number, d.c as number),
  correctAnswer: (_p, d) => quadText(d.a as number, d.b as number, d.c as number),
  solution: {
    ru: (p, d) => `Складываем коэффициенты при одинаковых степенях: $x^2$: $${p.a1}+${p.a2}=${d.a}$, $x$: $${p.b1}+${p.b2}=${d.b}$, свободный член: $${p.c1}+${p.c2}=${d.c}$. Результат: $${quadText(d.a as number, d.b as number, d.c as number)}$.`,
    pl: (p, d) => `Dodajemy współczynniki przy tych samych potęgach: $x^2$: $${p.a1}+${p.a2}=${d.a}$, $x$: $${p.b1}+${p.b2}=${d.b}$, wyraz wolny: $${p.c1}+${p.c2}=${d.c}$. Wynik: $${quadText(d.a as number, d.b as number, d.c as number)}$.`,
    en: (p, d) => `Add coefficients of matching powers: $x^2$: $${p.a1}+${p.a2}=${d.a}$, $x$: $${p.b1}+${p.b2}=${d.b}$, constant: $${p.c1}+${p.c2}=${d.c}$. Result: $${quadText(d.a as number, d.b as number, d.c as number)}$.`,
  },
});

const multiplyMonomialByBinomial = defineTemplate({
  id: `${TOPIC}.multiply-monomial`,
  topicId: TOPIC,
  difficulty: 1,
  answerType: "expression",
  params: { k: intRange(-9, 9), a: intRange(-9, 9), b: intRange(-9, 9) },
  constraint: (p) => p.k !== 0 && p.a !== 0,
  derive: (p) => ({ ka: p.k * p.a, kb: p.k * p.b }),
  subtopic: { ru: "Умножение одночлена на двучлен", pl: "Mnożenie jednomianu przez dwumian", en: "Multiplying a monomial by a binomial" },
  question: (p, _d, lang) => {
    const w = `${p.k === -1 ? "-" : p.k === 1 ? "" : p.k}(${linearText(p.a, p.b)})`;
    return { ru: `Выполни умножение: $${w}$`, pl: `Wykonaj mnożenie: $${w}$`, en: `Multiply out: $${w}$` }[lang];
  },
  verifyExpression: (_p, d) => linearText(d.ka as number, d.kb as number),
  correctAnswer: (_p, d) => linearText(d.ka as number, d.kb as number),
  solution: {
    ru: (p, d) => `$${p.k} \\cdot ${p.a}x = ${d.ka}x$, $${p.k} \\cdot (${p.b}) = ${d.kb}$. Результат: $${linearText(d.ka as number, d.kb as number)}$.`,
    pl: (p, d) => `$${p.k} \\cdot ${p.a}x = ${d.ka}x$, $${p.k} \\cdot (${p.b}) = ${d.kb}$. Wynik: $${linearText(d.ka as number, d.kb as number)}$.`,
    en: (p, d) => `$${p.k} \\cdot ${p.a}x = ${d.ka}x$, $${p.k} \\cdot (${p.b}) = ${d.kb}$. Result: $${linearText(d.ka as number, d.kb as number)}$.`,
  },
});

const factorOutMonomial = defineTemplate({
  id: `${TOPIC}.factor`,
  topicId: TOPIC,
  difficulty: 2,
  answerType: "expression",
  params: { a: intRange(2, 9), x: intRange(1, 9), y: intRange(1, 9) },
  subtopic: { ru: "Вынесение одночлена за скобки", pl: "Wyłączanie jednomianu przed nawias", en: "Factoring out a common monomial" },
  question: (p, _d, lang) => {
    const w = `${p.a}x + ${p.a * p.y}`;
    return { ru: `Вынеси общий множитель за скобки: $${w}$`, pl: `Wyłącz wspólny czynnik przed nawias: $${w}$`, en: `Factor out the common factor: $${w}$` }[lang];
  },
  verifyExpression: (p) => `${p.a} * (x + ${p.y})`,
  correctAnswer: (p) => `${p.a}(x+${p.y})`,
  solution: {
    ru: (p) => `Оба слагаемых делятся на $${p.a}$: $${p.a}x + ${p.a}${p.y} = ${p.a}(x + ${p.y})$.`,
    pl: (p) => `Oba składniki dzielą się przez $${p.a}$: $${p.a}x + ${p.a}${p.y} = ${p.a}(x + ${p.y})$.`,
    en: (p) => `Both terms are divisible by $${p.a}$: $${p.a}x + ${p.a}${p.y} = ${p.a}(x + ${p.y})$.`,
  },
});

const factoredEquation = defineTemplate({
  id: `${TOPIC}.factored-equation`,
  topicId: TOPIC,
  difficulty: 3,
  answerType: "number",
  params: { r1: intRange(-9, 9), r2: intRange(-9, 9) },
  constraint: (p) => p.r1 < p.r2,
  subtopic: { ru: "Уравнение в разложенном виде", pl: "Równanie w postaci iloczynowej", en: "Equation in factored form" },
  question: (p, _d, lang) => {
    const s1 = p.r1 >= 0 ? `x - ${p.r1}` : `x + ${-p.r1}`;
    const s2 = p.r2 >= 0 ? `x - ${p.r2}` : `x + ${-p.r2}`;
    const w = `(${s1})(${s2}) = 0`;
    return { ru: `Реши уравнение: $${w}$`, pl: `Rozwiąż równanie: $${w}$`, en: `Solve the equation: $${w}$` }[lang];
  },
  verifyExpression: (p) => `${p.r1}; ${p.r2}`,
  correctAnswer: (p) => `${p.r1}; ${p.r2}`,
  solution: {
    ru: (p) => `Произведение равно нулю, когда один из множителей равен нулю: $x_1 = ${p.r1}$ или $x_2 = ${p.r2}$.`,
    pl: (p) => `Iloczyn jest zerem, gdy jeden z czynników jest zerem: $x_1 = ${p.r1}$ lub $x_2 = ${p.r2}$.`,
    en: (p) => `The product is zero when one factor is zero: $x_1 = ${p.r1}$ or $x_2 = ${p.r2}$.`,
  },
});

export const lo2PolynomialsTemplates = [addPolynomials, multiplyMonomialByBinomial, factorOutMonomial, factoredEquation];
