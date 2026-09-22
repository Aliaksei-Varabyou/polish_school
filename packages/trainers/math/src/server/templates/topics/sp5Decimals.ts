import { defineTemplate, fmtNumber, intRange } from "@portal/trainer-sdk/templates";

const TOPIC = "sp5.decimals";

// nice denominators whose fraction has a short decimal expansion, per szkoła podstawowa expectations
const NICE_DENOMINATORS = [2, 4, 5, 10, 20, 25, 50] as const;

const fractionToDecimal = defineTemplate({
  id: `${TOPIC}.fraction-to-decimal`,
  topicId: TOPIC,
  difficulty: 1,
  answerType: "number",
  params: { numerator: intRange(1, 49), denomIdx: intRange(0, NICE_DENOMINATORS.length - 1) },
  derive: (p) => ({ denominator: NICE_DENOMINATORS[p.denomIdx] }),
  constraint: (p) => p.numerator < NICE_DENOMINATORS[p.denomIdx] * 3,
  subtopic: { ru: "Перевод дроби в десятичную", pl: "Zamiana ułamka na dziesiętny", en: "Fraction to decimal" },
  question: (p, d, lang) => ({ ru: `Запиши в виде десятичной дроби: $\\frac{${p.numerator}}{${d.denominator}}$`, pl: `Zapisz jako ułamek dziesiętny: $\\frac{${p.numerator}}{${d.denominator}}$`, en: `Write as a decimal: $\\frac{${p.numerator}}{${d.denominator}}$` })[lang],
  verifyExpression: (p, d) => `${p.numerator} / ${d.denominator}`,
  correctAnswer: (p, d) => String(p.numerator / (d.denominator as number)),
  solution: {
    ru: (p, d) => `$\\frac{${p.numerator}}{${d.denominator}} = ${fmtNumber(p.numerator / (d.denominator as number), "ru")}$.`,
    pl: (p, d) => `$\\frac{${p.numerator}}{${d.denominator}} = ${fmtNumber(p.numerator / (d.denominator as number), "pl")}$.`,
    en: (p, d) => `$\\frac{${p.numerator}}{${d.denominator}} = ${fmtNumber(p.numerator / (d.denominator as number), "en")}$.`,
  },
});

// 2024 curriculum limit (see docs/curriculum-review.md, §4a): written addition/subtraction of
// decimals only when the addends together have ≤6 non-zero digits.
function nonZeroDigits(n: number): number {
  return String(Math.round(n * 100)).replace(/[-.]/g, "").replace(/0/g, "").length;
}

const addDecimals = defineTemplate({
  id: `${TOPIC}.add`,
  topicId: TOPIC,
  difficulty: 2,
  answerType: "number",
  params: { aCents: intRange(105, 9999), bCents: intRange(105, 9999) },
  // constraint runs before derive, so it recomputes a/b from the raw cents directly
  constraint: (p) => nonZeroDigits(p.aCents / 100) + nonZeroDigits(p.bCents / 100) <= 6,
  derive: (p) => ({ a: p.aCents / 100, b: p.bCents / 100 }),
  subtopic: { ru: "Действия с десятичными дробями", pl: "Działania na ułamkach dziesiętnych", en: "Operations with decimals" },
  question: (_p, d, lang) => ({ ru: `Вычисли: $${fmtNumber(d.a as number, "ru")} + ${fmtNumber(d.b as number, "ru")}$`, pl: `Oblicz: $${fmtNumber(d.a as number, "pl")} + ${fmtNumber(d.b as number, "pl")}$`, en: `Calculate: $${fmtNumber(d.a as number, "en")} + ${fmtNumber(d.b as number, "en")}$` })[lang],
  verifyExpression: (_p, d) => `${d.a} + ${d.b}`,
  correctAnswer: (_p, d) => String(Math.round(((d.a as number) + (d.b as number)) * 100) / 100),
  solution: {
    ru: (_p, d) => `$${fmtNumber(d.a as number, "ru")} + ${fmtNumber(d.b as number, "ru")} = ${fmtNumber(Math.round(((d.a as number) + (d.b as number)) * 100) / 100, "ru")}$.`,
    pl: (_p, d) => `$${fmtNumber(d.a as number, "pl")} + ${fmtNumber(d.b as number, "pl")} = ${fmtNumber(Math.round(((d.a as number) + (d.b as number)) * 100) / 100, "pl")}$.`,
    en: (_p, d) => `$${fmtNumber(d.a as number, "en")} + ${fmtNumber(d.b as number, "en")} = ${fmtNumber(Math.round(((d.a as number) + (d.b as number)) * 100) / 100, "en")}$.`,
  },
});

const multiplyByInteger = defineTemplate({
  id: `${TOPIC}.multiply-int`,
  topicId: TOPIC,
  difficulty: 2,
  answerType: "number",
  params: { aCents: intRange(105, 999), k: intRange(2, 9) },
  derive: (p) => ({ a: p.aCents / 100 }),
  subtopic: { ru: "Умножение десятичной дроби на целое", pl: "Mnożenie ułamka dziesiętnego przez liczbę całkowitą", en: "Multiplying a decimal by an integer" },
  question: (p, d, lang) => ({ ru: `Вычисли: $${fmtNumber(d.a as number, "ru")} \\cdot ${p.k}$`, pl: `Oblicz: $${fmtNumber(d.a as number, "pl")} \\cdot ${p.k}$`, en: `Calculate: $${fmtNumber(d.a as number, "en")} \\cdot ${p.k}$` })[lang],
  verifyExpression: (p, d) => `${d.a} * ${p.k}`,
  correctAnswer: (p, d) => String(Math.round((d.a as number) * p.k * 100) / 100),
  solution: {
    ru: (p, d) => `$${fmtNumber(d.a as number, "ru")} \\cdot ${p.k} = ${fmtNumber(Math.round((d.a as number) * p.k * 100) / 100, "ru")}$.`,
    pl: (p, d) => `$${fmtNumber(d.a as number, "pl")} \\cdot ${p.k} = ${fmtNumber(Math.round((d.a as number) * p.k * 100) / 100, "pl")}$.`,
    en: (p, d) => `$${fmtNumber(d.a as number, "en")} \\cdot ${p.k} = ${fmtNumber(Math.round((d.a as number) * p.k * 100) / 100, "en")}$.`,
  },
});

const unitConversion = defineTemplate({
  id: `${TOPIC}.unit-conversion`,
  topicId: TOPIC,
  difficulty: 3,
  answerType: "number",
  params: { meters: intRange(1, 40), cm: intRange(1, 99) },
  subtopic: { ru: "Единицы длины и массы", pl: "Jednostki długości i masy", en: "Units of length and mass" },
  question: (p, _d, lang) =>
    ({
      ru: `Вырази в метрах: $${p.meters}$ м $${p.cm}$ см.`,
      pl: `Wyraź w metrach: $${p.meters}$ m $${p.cm}$ cm.`,
      en: `Express in metres: $${p.meters}$ m $${p.cm}$ cm.`,
    })[lang],
  verifyExpression: (p) => `${p.meters} + ${p.cm} / 100`,
  correctAnswer: (p) => String(p.meters + p.cm / 100),
  solution: {
    ru: (p) => `$${p.cm}$ см $= ${fmtNumber(p.cm / 100, "ru")}$ м, значит всего $${fmtNumber(p.meters + p.cm / 100, "ru")}$ м.`,
    pl: (p) => `$${p.cm}$ cm $= ${fmtNumber(p.cm / 100, "pl")}$ m, czyli razem $${fmtNumber(p.meters + p.cm / 100, "pl")}$ m.`,
    en: (p) => `$${p.cm}$ cm $= ${fmtNumber(p.cm / 100, "en")}$ m, so in total $${fmtNumber(p.meters + p.cm / 100, "en")}$ m.`,
  },
});

export const sp5DecimalsTemplates = [fractionToDecimal, addDecimals, multiplyByInteger, unitConversion];
