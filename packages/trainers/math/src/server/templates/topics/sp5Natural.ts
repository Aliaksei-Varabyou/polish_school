import { defineTemplate, intRange, plural } from "@portal/trainer-sdk/templates";

const TOPIC = "sp5.natural";

const orderOfOps = defineTemplate({
  id: `${TOPIC}.order-of-ops`,
  topicId: TOPIC,
  difficulty: 1,
  answerType: "number",
  params: { a: intRange(2, 40), b: intRange(2, 12), c: intRange(2, 9) },
  subtopic: { ru: "Порядок выполнения действий", pl: "Kolejność wykonywania działań", en: "Order of operations" },
  question: (p, _d, lang) => ({ ru: `Вычисли: $${p.a} + ${p.b} \\cdot ${p.c}$`, pl: `Oblicz: $${p.a} + ${p.b} \\cdot ${p.c}$`, en: `Calculate: $${p.a} + ${p.b} \\cdot ${p.c}$` })[lang],
  verifyExpression: (p) => `${p.a} + ${p.b} * ${p.c}`,
  correctAnswer: (p) => String(p.a + p.b * p.c),
  solution: {
    ru: (p) => `Сначала умножение: $${p.b} \\cdot ${p.c} = ${p.b * p.c}$. Затем сложение: $${p.a} + ${p.b * p.c} = ${p.a + p.b * p.c}$.`,
    pl: (p) => `Najpierw mnożenie: $${p.b} \\cdot ${p.c} = ${p.b * p.c}$. Potem dodawanie: $${p.a} + ${p.b * p.c} = ${p.a + p.b * p.c}$.`,
    en: (p) => `Multiply first: $${p.b} \\cdot ${p.c} = ${p.b * p.c}$. Then add: $${p.a} + ${p.b * p.c} = ${p.a + p.b * p.c}$.`,
  },
  hint: {
    ru: () => "Умножение выполняется раньше сложения.",
    pl: () => "Mnożenie wykonuje się przed dodawaniem.",
    en: () => "Do the multiplication before the addition.",
  },
});

const orderOfOpsParens = defineTemplate({
  id: `${TOPIC}.order-of-ops-parens`,
  topicId: TOPIC,
  difficulty: 2,
  answerType: "number",
  params: { a: intRange(2, 20), b: intRange(2, 15), c: intRange(2, 9), d: intRange(1, 30) },
  constraint: (p) => (p.a + p.b) * p.c - p.d > 0,
  subtopic: { ru: "Порядок действий со скобками", pl: "Kolejność działań z nawiasami", en: "Order of operations with parentheses" },
  question: (p, _d, lang) => ({ ru: `Вычисли: $(${p.a} + ${p.b}) \\cdot ${p.c} - ${p.d}$`, pl: `Oblicz: $(${p.a} + ${p.b}) \\cdot ${p.c} - ${p.d}$`, en: `Calculate: $(${p.a} + ${p.b}) \\cdot ${p.c} - ${p.d}$` })[lang],
  verifyExpression: (p) => `(${p.a} + ${p.b}) * ${p.c} - ${p.d}`,
  correctAnswer: (p) => String((p.a + p.b) * p.c - p.d),
  solution: {
    ru: (p) => `В скобках: $${p.a} + ${p.b} = ${p.a + p.b}$. Умножаем: $${(p.a + p.b) * p.c}$. Вычитаем: $${(p.a + p.b) * p.c} - ${p.d} = ${(p.a + p.b) * p.c - p.d}$.`,
    pl: (p) => `W nawiasie: $${p.a} + ${p.b} = ${p.a + p.b}$. Mnożymy: $${(p.a + p.b) * p.c}$. Odejmujemy: $${(p.a + p.b) * p.c} - ${p.d} = ${(p.a + p.b) * p.c - p.d}$.`,
    en: (p) => `Inside the parentheses: $${p.a} + ${p.b} = ${p.a + p.b}$. Multiply: $${(p.a + p.b) * p.c}$. Subtract: $${(p.a + p.b) * p.c} - ${p.d} = ${(p.a + p.b) * p.c - p.d}$.`,
  },
  hint: {
    ru: () => "Сначала вычисли значение в скобках.",
    pl: () => "Najpierw oblicz wartość w nawiasie.",
    en: () => "Compute the parentheses first.",
  },
});

const squareOrCube = defineTemplate({
  id: `${TOPIC}.square-cube`,
  topicId: TOPIC,
  difficulty: 1,
  answerType: "number",
  params: { n: intRange(2, 20), power: intRange(2, 3) },
  subtopic: { ru: "Квадраты и кубы чисел", pl: "Kwadraty i sześciany liczb", en: "Squares and cubes of numbers" },
  question: (p, _d, lang) => ({ ru: `Вычисли: $${p.n}^${p.power}$`, pl: `Oblicz: $${p.n}^${p.power}$`, en: `Calculate: $${p.n}^${p.power}$` })[lang],
  verifyExpression: (p) => `${p.n}^${p.power}`,
  correctAnswer: (p) => String(p.n ** p.power),
  solution: {
    ru: (p) => (p.power === 2 ? `$${p.n}^2 = ${p.n} \\cdot ${p.n} = ${p.n ** 2}$.` : `$${p.n}^3 = ${p.n} \\cdot ${p.n} \\cdot ${p.n} = ${p.n ** 3}$.`),
    pl: (p) => (p.power === 2 ? `$${p.n}^2 = ${p.n} \\cdot ${p.n} = ${p.n ** 2}$.` : `$${p.n}^3 = ${p.n} \\cdot ${p.n} \\cdot ${p.n} = ${p.n ** 3}$.`),
    en: (p) => (p.power === 2 ? `$${p.n}^2 = ${p.n} \\cdot ${p.n} = ${p.n ** 2}$.` : `$${p.n}^3 = ${p.n} \\cdot ${p.n} \\cdot ${p.n} = ${p.n ** 3}$.`),
  },
});

const divisionWithRemainder = defineTemplate({
  id: `${TOPIC}.division-remainder`,
  topicId: TOPIC,
  difficulty: 2,
  answerType: "number",
  params: { dividend: intRange(20, 300), divisor: intRange(2, 9) },
  constraint: (p) => p.dividend % p.divisor !== 0,
  derive: (p) => ({ quotient: Math.floor(p.dividend / p.divisor), remainder: p.dividend % p.divisor }),
  subtopic: { ru: "Деление с остатком", pl: "Dzielenie z resztą", en: "Division with a remainder" },
  question: (p, _d, lang) =>
    ({
      ru: `Раздели $${p.dividend}$ на $${p.divisor}$ с остатком. Запиши ответ как «частное; остаток».`,
      pl: `Podziel $${p.dividend}$ przez $${p.divisor}$ z resztą. Zapisz odpowiedź jako „iloraz; reszta”.`,
      en: `Divide $${p.dividend}$ by $${p.divisor}$ with a remainder. Write the answer as "quotient; remainder".`,
    })[lang],
  verifyExpression: (p) => `floor(${p.dividend} / ${p.divisor}); ${p.dividend} - floor(${p.dividend} / ${p.divisor}) * ${p.divisor}`,
  correctAnswer: (_p, d) => `${d.quotient}; ${d.remainder}`,
  solution: {
    ru: (p, d) => `$${p.dividend} = ${p.divisor} \\cdot ${d.quotient} + ${d.remainder}$. Частное — ${d.quotient}, остаток — ${d.remainder}.`,
    pl: (p, d) => `$${p.dividend} = ${p.divisor} \\cdot ${d.quotient} + ${d.remainder}$. Iloraz to ${d.quotient}, reszta to ${d.remainder}.`,
    en: (p, d) => `$${p.dividend} = ${p.divisor} \\cdot ${d.quotient} + ${d.remainder}$. The quotient is ${d.quotient}, the remainder is ${d.remainder}.`,
  },
});

const shoppingWordProblem = defineTemplate({
  id: `${TOPIC}.shopping`,
  topicId: TOPIC,
  difficulty: 3,
  answerType: "number",
  params: { price: intRange(2, 15), count: intRange(2, 9), paid: intRange(50, 100) },
  constraint: (p) => p.paid > p.price * p.count,
  subtopic: { ru: "Текстовые задачи", pl: "Zadania tekstowe", en: "Word problems" },
  question: (p, _d, lang) => {
    const item = {
      ru: plural("ru", p.count, { one: "тетрадь", few: "тетради", many: "тетрадей", other: "тетради" }),
      pl: plural("pl", p.count, { one: "zeszyt", few: "zeszyty", many: "zeszytów", other: "zeszytu" }),
      en: "notebooks",
    }[lang];
    return {
      ru: `Мама купила ${p.count} ${item} по ${p.price} зл. за штуку и дала продавцу ${p.paid} зл. Сколько злотых сдачи она получила?`,
      pl: `Mama kupiła ${p.count} ${item} po ${p.price} zł za sztukę i dała sprzedawcy ${p.paid} zł. Ile złotych reszty otrzymała?`,
      en: `Mum bought ${p.count} notebooks at ${p.price} zł each and gave the seller ${p.paid} zł. How many złoty of change did she get?`,
    }[lang];
  },
  verifyExpression: (p) => `${p.paid} - ${p.price} * ${p.count}`,
  correctAnswer: (p) => String(p.paid - p.price * p.count),
  solution: {
    ru: (p) => `Стоимость покупки: $${p.price} \\cdot ${p.count} = ${p.price * p.count}$ зл. Сдача: $${p.paid} - ${p.price * p.count} = ${p.paid - p.price * p.count}$ зл.`,
    pl: (p) => `Koszt zakupu: $${p.price} \\cdot ${p.count} = ${p.price * p.count}$ zł. Reszta: $${p.paid} - ${p.price * p.count} = ${p.paid - p.price * p.count}$ zł.`,
    en: (p) => `Cost: $${p.price} \\cdot ${p.count} = ${p.price * p.count}$ zł. Change: $${p.paid} - ${p.price * p.count} = ${p.paid - p.price * p.count}$ zł.`,
  },
});

export const sp5NaturalTemplates = [orderOfOps, orderOfOpsParens, squareOrCube, divisionWithRemainder, shoppingWordProblem];
