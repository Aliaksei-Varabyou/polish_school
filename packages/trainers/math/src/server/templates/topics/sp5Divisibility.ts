import { choiceParam, defineTemplate, intRange, type ChoiceLabel } from "@portal/trainer-sdk/templates";

const TOPIC = "sp5.divisibility";
const LABELS = ["A", "B", "C", "D"] as const;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Builds 4 choices with the correct value at `correctPos` — a template *parameter*, not something
 * decided by Math.random() inside the render step. That keeps `choices()` and `correctChoiceLabel()`
 * trivially consistent (both just read the same param) and varies which letter is correct across
 * substitutions, instead of the answer always sitting in the same slot.
 */
function placeChoices(correct: string, wrong: string[], correctPos: ChoiceLabel): { label: ChoiceLabel; text: string; misconception?: string }[] {
  const otherLabels = LABELS.filter((l) => l !== correctPos);
  return LABELS.map((label) =>
    label === correctPos
      ? { label, text: correct }
      : { label, text: wrong[otherLabels.indexOf(label)], misconception: "неверный вариант" },
  );
}

const divisibilityRule = defineTemplate({
  id: `${TOPIC}.rule-choice`,
  topicId: TOPIC,
  difficulty: 1,
  answerType: "choice",
  params: { base: intRange(20, 80), d: choiceParam(2, 3, 5, 9), correctPos: choiceParam(...LABELS) },
  constraint: (p) => p.base % p.d !== 0,
  derive: (p) => {
    const good = p.base - (p.base % p.d);
    const wrong = new Set<number>();
    for (let delta = 1; wrong.size < 3 && delta < 20; delta++) {
      const candidate = good + delta;
      if (candidate > 0 && candidate % p.d !== 0) wrong.add(candidate);
    }
    return { good, wrong: [...wrong].join(",") };
  },
  subtopic: { ru: "Признаки делимости", pl: "Cechy podzielności", en: "Divisibility rules" },
  question: (p, _d, lang) =>
    ({
      ru: `Какое из чисел делится на ${p.d} без остатка?`,
      pl: `Która z liczb dzieli się przez ${p.d} bez reszty?`,
      en: `Which of the numbers is divisible by ${p.d} with no remainder?`,
    })[lang],
  correctAnswer: (_p, d) => String(d.good),
  choices: (p, d) => placeChoices(String(d.good), String(d.wrong).split(","), p.correctPos),
  correctChoiceLabel: (p) => p.correctPos,
  solution: {
    ru: (p, d) => `Число ${d.good} делится на ${p.d} без остатка.`,
    pl: (p, d) => `Liczba ${d.good} dzieli się przez ${p.d} bez reszty.`,
    en: (p, d) => `The number ${d.good} is divisible by ${p.d} with no remainder.`,
  },
});

const primeOrComposite = defineTemplate({
  id: `${TOPIC}.prime-or-composite`,
  topicId: TOPIC,
  difficulty: 1,
  answerType: "choice",
  params: { n: intRange(2, 97), correctPos: choiceParam(...LABELS) },
  derive: (p) => {
    let isPrime = p.n > 1;
    for (let i = 2; i * i <= p.n; i++) if (p.n % i === 0) isPrime = false;
    return { isPrime: isPrime ? "prime" : "composite" };
  },
  subtopic: { ru: "Простые и составные числа", pl: "Liczby pierwsze i złożone", en: "Prime and composite numbers" },
  question: (p, _d, lang) => ({ ru: `Число ${p.n} — простое или составное?`, pl: `Liczba ${p.n} jest pierwsza czy złożona?`, en: `Is ${p.n} a prime or a composite number?` })[lang],
  correctAnswer: (p) => p.correctPos,
  choices: (p, d, lang) => {
    const primeText = { ru: "простое", pl: "pierwsza", en: "prime" }[lang];
    const compositeText = { ru: "составное", pl: "złożona", en: "composite" }[lang];
    const correctText = d.isPrime === "prime" ? primeText : compositeText;
    const wrongTexts = [
      d.isPrime === "prime" ? compositeText : primeText,
      { ru: "ни то, ни другое", pl: "ani jedno, ani drugie", en: "neither" }[lang],
      { ru: "и то, и другое", pl: "i jedno, i drugie", en: "both" }[lang],
    ];
    return placeChoices(correctText, wrongTexts, p.correctPos);
  },
  correctChoiceLabel: (p) => p.correctPos,
  solution: {
    ru: (p, d) => (d.isPrime === "prime" ? `${p.n} делится только на 1 и на себя — простое число.` : `У ${p.n} есть делители, кроме 1 и себя — составное число.`),
    pl: (p, d) => (d.isPrime === "prime" ? `${p.n} dzieli się tylko przez 1 i przez siebie — liczba pierwsza.` : `${p.n} ma dzielniki inne niż 1 i ona sama — liczba złożona.`),
    en: (p, d) => (d.isPrime === "prime" ? `${p.n} is only divisible by 1 and itself — prime.` : `${p.n} has divisors other than 1 and itself — composite.`),
  },
});

const gcdTemplate = defineTemplate({
  id: `${TOPIC}.gcd`,
  topicId: TOPIC,
  difficulty: 2,
  answerType: "number",
  params: { a: intRange(10, 200), b: intRange(10, 200) },
  constraint: (p) => gcd(p.a, p.b) > 1 && p.a !== p.b,
  subtopic: { ru: "НОД", pl: "NWD", en: "GCD" },
  question: (p, _d, lang) => ({ ru: `Найди НОД чисел ${p.a} и ${p.b}.`, pl: `Znajdź NWD liczb ${p.a} i ${p.b}.`, en: `Find the GCD of ${p.a} and ${p.b}.` })[lang],
  verifyExpression: (p) => `gcd(${p.a}, ${p.b})`,
  correctAnswer: (p) => String(gcd(p.a, p.b)),
  solution: {
    ru: (p) => `НОД(${p.a}, ${p.b}) = ${gcd(p.a, p.b)} (по алгоритму Евклида).`,
    pl: (p) => `NWD(${p.a}, ${p.b}) = ${gcd(p.a, p.b)} (algorytm Euklidesa).`,
    en: (p) => `GCD(${p.a}, ${p.b}) = ${gcd(p.a, p.b)} (Euclidean algorithm).`,
  },
});

const lcmTemplate = defineTemplate({
  id: `${TOPIC}.lcm`,
  topicId: TOPIC,
  difficulty: 2,
  answerType: "number",
  params: { a: intRange(2, 30), b: intRange(2, 30) },
  constraint: (p) => p.a !== p.b && (p.a * p.b) / gcd(p.a, p.b) <= 400,
  subtopic: { ru: "НОК", pl: "NWW", en: "LCM" },
  question: (p, _d, lang) => ({ ru: `Найди НОК чисел ${p.a} и ${p.b}.`, pl: `Znajdź NWW liczb ${p.a} i ${p.b}.`, en: `Find the LCM of ${p.a} and ${p.b}.` })[lang],
  verifyExpression: (p) => `${p.a} * ${p.b} / gcd(${p.a}, ${p.b})`,
  correctAnswer: (p) => String((p.a * p.b) / gcd(p.a, p.b)),
  solution: {
    ru: (p) => `НОК(${p.a}, ${p.b}) = ${p.a} · ${p.b} / НОД(${p.a}, ${p.b}) = ${(p.a * p.b) / gcd(p.a, p.b)}.`,
    pl: (p) => `NWW(${p.a}, ${p.b}) = ${p.a} · ${p.b} / NWD(${p.a}, ${p.b}) = ${(p.a * p.b) / gcd(p.a, p.b)}.`,
    en: (p) => `LCM(${p.a}, ${p.b}) = ${p.a} · ${p.b} / GCD(${p.a}, ${p.b}) = ${(p.a * p.b) / gcd(p.a, p.b)}.`,
  },
});

export const sp5DivisibilityTemplates = [divisibilityRule, primeOrComposite, gcdTemplate, lcmTemplate];
