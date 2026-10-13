// The paragraphs the first content pass left empty or nearly empty: §1.1, the "… u zwierząt"
// opening of each dział, the nutrition paragraphs of dział 4, every "choroby" paragraph, and second
// tables for the thin paragraphs of działy 3, 6, 8, 9 and 11.
import { choiceParam } from "@portal/trainer-sdk/templates";
import { P } from "../../../curriculum/lo.ts";
import { calcTemplate, cap, choiceFromTable, pairFromTable, termFromTable, type Bi, type BioTemplate, type NamedEntry } from "../tableTemplate.ts";
import {
  ANIMAL_BREATHING,
  ANIMAL_CIRCULATION,
  ANIMAL_EXCRETION,
  ANIMAL_FEEDING,
  ANIMAL_HORMONES,
  ANIMAL_MOTION,
  ANIMAL_NERVES,
  ANIMAL_REPRODUCTION,
  ANIMAL_SENSES,
  CLASSIFICATION,
} from "../data/comparative.ts";
import {
  CIRCULATION_DISORDERS,
  DIGESTIVE_DISORDERS,
  IMMUNE_DISORDERS,
  MOTION_DISORDERS,
  NERVOUS_DISORDERS,
  REPRODUCTIVE_DISORDERS,
  RESPIRATORY_DISORDERS,
  URINARY_DISORDERS,
} from "../data/disorders.ts";
import { DIET_TERMS, ORGANIC_NUTRIENTS, VITAMINS_MINERALS } from "../data/nutrition.ts";
import { KINDS, type Disorder } from "../data/rows.ts";
import {
  AUTONOMIC_PARTS,
  BONE_TISSUE,
  BRAIN_PARTS,
  CHEMICAL_SENSES,
  DEVELOPMENT_STAGES,
  EAR_PARTS,
  IMMUNE_CELLS,
  IMMUNITY_MECHANISMS,
  JOINT_TYPES,
  LYMPH_PARTS,
  MALE_PARTS,
  MUSCLE_WORK,
  NEURON_WORK,
  PERIPHERAL_PARTS,
  SKELETON_PARTS,
} from "../data/systemsMore.ts";

// ---- "name / description" tables ----

interface ConceptSpec {
  chapter: string;
  slug: string;
  rows: readonly NamedEntry[];
  subtopic: Bi;
  shift: number;
  misconception: Bi;
  tags?: string[];
}

/**
 * The descriptions in these tables mix roles ("filtrowanie limfy") and definitions ("cząsteczka
 * rozpoznawana jako obca"), so the question asks which description fits rather than for a role.
 */
const concepts = ({ chapter, ...spec }: ConceptSpec): BioTemplate[] =>
  pairFromTable({
    topicId: `bio.lo3.${chapter}`,
    ...spec,
    label: { pl: "Pojęcie", ru: "Понятие" },
    ask: { pl: "Który opis do niego pasuje?", ru: "Какое описание к нему подходит?" },
    cue: { pl: "Opis", ru: "Описание" },
    explain: true,
  });

const NEIGHBOUR = {
  pl: "opis pokrewnego pojęcia z tego samego tematu",
  ru: "описание родственного понятия из той же темы",
};

const conceptTemplates: BioTemplate[] = [
  ...concepts({ chapter: "organism", slug: "taxon", rows: CLASSIFICATION, shift: 1, subtopic: { pl: "miejsce człowieka w systematyce", ru: "место человека в систематике" }, misconception: { pl: "cecha innego taksonu tej samej hierarchii", ru: "признак другого таксона той же иерархии" } }),
  ...concepts({ chapter: "motion", slug: "animal-motion", rows: ANIMAL_MOTION, shift: 2, subtopic: { pl: "ruch u zwierząt", ru: "движение у животных" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "motion", slug: "bone-tissue", rows: BONE_TISSUE, shift: 3, subtopic: { pl: "budowa i skład kości", ru: "строение и состав кости" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "motion", slug: "joint-type", rows: JOINT_TYPES, shift: 0, subtopic: { pl: "połączenia kości", ru: "соединения костей" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "motion", slug: "skeleton-part", rows: SKELETON_PARTS, shift: 1, subtopic: { pl: "elementy szkieletu", ru: "отделы скелета" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "motion", slug: "muscle-work", rows: MUSCLE_WORK, shift: 2, subtopic: { pl: "budowa i praca mięśni", ru: "строение и работа мышц" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "digestion", slug: "animal-feeding", rows: ANIMAL_FEEDING, shift: 3, subtopic: { pl: "odżywianie się zwierząt", ru: "питание животных" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "digestion", slug: "nutrient", rows: ORGANIC_NUTRIENTS, shift: 0, subtopic: { pl: "organiczne składniki pokarmowe", ru: "органические питательные вещества" }, misconception: { pl: "rola innego składnika pokarmowego", ru: "роль другого питательного вещества" } }),
  ...concepts({ chapter: "digestion", slug: "vitamin", rows: VITAMINS_MINERALS, shift: 1, subtopic: { pl: "witaminy i sole mineralne", ru: "витамины и минеральные вещества" }, misconception: { pl: "rola innej witaminy lub innego pierwiastka", ru: "роль другого витамина или элемента" } }),
  ...concepts({ chapter: "digestion", slug: "diet", rows: DIET_TERMS, shift: 2, subtopic: { pl: "zasady racjonalnego odżywiania się", ru: "принципы рационального питания" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "respiration", slug: "animal-breathing", rows: ANIMAL_BREATHING, shift: 3, subtopic: { pl: "wymiana gazowa u zwierząt", ru: "газообмен у животных" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "circulation", slug: "animal-circulation", rows: ANIMAL_CIRCULATION, shift: 0, subtopic: { pl: "układ krążenia u zwierząt", ru: "кровеносная система у животных" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "circulation", slug: "lymph", rows: LYMPH_PARTS, shift: 1, subtopic: { pl: "układ limfatyczny", ru: "лимфатическая система" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "circulation", slug: "immune-cell", rows: IMMUNE_CELLS, shift: 2, subtopic: { pl: "komórki i cząsteczki odporności", ru: "клетки и молекулы иммунитета" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "urinary", slug: "animal-excretion", rows: ANIMAL_EXCRETION, shift: 3, subtopic: { pl: "wydalanie i osmoregulacja u zwierząt", ru: "выделение и осморегуляция у животных" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "nervous", slug: "animal-nerves", rows: ANIMAL_NERVES, shift: 0, subtopic: { pl: "układ nerwowy u zwierząt", ru: "нервная система у животных" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "nervous", slug: "peripheral", rows: PERIPHERAL_PARTS, shift: 1, subtopic: { pl: "nerwy i odruchy", ru: "нервы и рефлексы" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "nervous", slug: "autonomic", rows: AUTONOMIC_PARTS, shift: 2, subtopic: { pl: "układ autonomiczny", ru: "вегетативная нервная система" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "senses", slug: "animal-senses", rows: ANIMAL_SENSES, shift: 3, subtopic: { pl: "zmysły zwierząt", ru: "органы чувств животных" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "senses", slug: "ear-part", rows: EAR_PARTS, shift: 0, subtopic: { pl: "narząd słuchu i równowagi", ru: "орган слуха и равновесия" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "senses", slug: "chemical-sense", rows: CHEMICAL_SENSES, shift: 1, subtopic: { pl: "smak i węch", ru: "вкус и обоняние" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "hormones", slug: "animal-hormones", rows: ANIMAL_HORMONES, shift: 2, subtopic: { pl: "hormony zwierząt", ru: "гормоны животных" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "reproduction", slug: "animal-reproduction", rows: ANIMAL_REPRODUCTION, shift: 3, subtopic: { pl: "rozmnażanie się zwierząt", ru: "размножение животных" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "circulation", slug: "immunity-mechanism", rows: IMMUNITY_MECHANISMS, shift: 3, subtopic: { pl: "mechanizmy odporności", ru: "механизмы иммунитета" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "nervous", slug: "neuron-work", rows: NEURON_WORK, shift: 3, subtopic: { pl: "działanie neuronu i synapsy", ru: "работа нейрона и синапса" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "nervous", slug: "brain-part", rows: BRAIN_PARTS, shift: 0, subtopic: { pl: "ośrodkowy układ nerwowy", ru: "центральная нервная система" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "reproduction", slug: "development-stage", rows: DEVELOPMENT_STAGES, shift: 1, subtopic: { pl: "rozwój człowieka i antykoncepcja", ru: "развитие человека и контрацепция" }, misconception: NEIGHBOUR }),
  ...concepts({ chapter: "reproduction", slug: "male-part", rows: MALE_PARTS, shift: 0, subtopic: { pl: "męski układ rozrodczy", ru: "мужская половая система" }, misconception: NEIGHBOUR }),
];

// ---- diseases ----

interface DisorderSpec {
  chapter: string;
  slug: string;
  rows: readonly Disorder[];
  subtopic: Bi;
  shift: number;
}

/**
 * Three questions per disease table: what causes it, which disease the symptoms describe, and what
 * kind of disease it is. "Schorzenie / заболевание" is neuter in both languages, so one pronoun
 * fits every row, whatever the disease's own gender.
 */
function disorders({ chapter, slug, rows, subtopic, shift }: DisorderSpec): BioTemplate[] {
  const topicId = `bio.lo3.${chapter}`;
  const tags = ["choroby"];
  const kind = (r: Disorder, lang: "pl" | "ru") => KINDS[r.kind][lang];
  return [
    choiceFromTable<Disorder>({
      id: `${topicId}.${slug}-to-cause`,
      topicId,
      rows,
      subtopic,
      tags,
      difficulty: (r) => r.tier,
      shift,
      question: (r, lang) =>
        lang === "pl" ? `Schorzenie: ${r.name.pl}. Co je wywołuje?` : `Заболевание: ${r.name.ru}. Что его вызывает?`,
      optionText: (r, lang) => r.cause[lang],
      misconception: { pl: "przyczyna innego schorzenia tego samego układu", ru: "причина другого заболевания той же системы" },
      hint: (r, lang) => (lang === "pl" ? `Rodzaj: ${kind(r, "pl")}.` : `Вид: ${kind(r, "ru")}.`),
      solution: (r, lang) =>
        lang === "pl"
          ? `${cap(r.name.pl)}: ${r.cause.pl}. Objawy: ${r.sign.pl}.`
          : `${cap(r.name.ru)}: ${r.cause.ru}. Симптомы: ${r.sign.ru}.`,
    }),
    termFromTable<Disorder>({
      id: `${topicId}.sign-to-${slug}`,
      topicId,
      rows,
      subtopic,
      tags,
      difficulty: (r) => r.tier,
      question: (r, lang) =>
        lang === "pl" ? `Objawy: ${r.sign.pl}. Podaj nazwę schorzenia.` : `Симптомы: ${r.sign.ru}. Назови заболевание.`,
      term: (r, lang) => r.name[lang],
      aliases: (r) => [r.name.pl, r.name.ru, ...r.aliases.pl, ...r.aliases.ru],
      hint: (r, lang) => (lang === "pl" ? `Rodzaj: ${kind(r, "pl")}.` : `Вид: ${kind(r, "ru")}.`),
      solution: (r, lang) =>
        lang === "pl" ? `Odpowiedź: ${r.name.pl}. Przyczyna: ${r.cause.pl}.` : `Ответ: ${r.name.ru}. Причина: ${r.cause.ru}.`,
    }),
    choiceFromTable<Disorder>({
      id: `${topicId}.${slug}-to-kind`,
      topicId,
      rows,
      subtopic,
      tags,
      difficulty: (r) => r.tier,
      shift: shift + 2,
      question: (r, lang) =>
        lang === "pl"
          ? `Schorzenie: ${r.name.pl}. Do jakiej grupy schorzeń należy?`
          : `Заболевание: ${r.name.ru}. К какой группе заболеваний оно относится?`,
      // rows of the same kind collide on this text; pickDistractors skips them
      optionText: (r, lang) => kind(r, lang),
      misconception: { pl: "rodzaj innego schorzenia tego samego układu", ru: "вид другого заболевания той же системы" },
      solution: (r, lang) =>
        lang === "pl"
          ? `${cap(r.name.pl)} — ${kind(r, "pl")}: ${r.cause.pl}.`
          : `${cap(r.name.ru)} — ${kind(r, "ru")}: ${r.cause.ru}.`,
    }),
  ];
}

const disorderTemplates: BioTemplate[] = [
  ...disorders({ chapter: "motion", slug: "motion-disorder", rows: MOTION_DISORDERS, shift: 0, subtopic: { pl: "choroby i urazy układu ruchu", ru: "болезни и травмы опорно-двигательной системы" } }),
  ...disorders({ chapter: "digestion", slug: "digestive-disorder", rows: DIGESTIVE_DISORDERS, shift: 1, subtopic: { pl: "choroby układu pokarmowego", ru: "болезни пищеварительной системы" } }),
  ...disorders({ chapter: "respiration", slug: "respiratory-disorder", rows: RESPIRATORY_DISORDERS, shift: 2, subtopic: { pl: "choroby układu oddechowego", ru: "болезни дыхательной системы" } }),
  ...disorders({ chapter: "circulation", slug: "circulation-disorder", rows: CIRCULATION_DISORDERS, shift: 3, subtopic: { pl: "choroby układu krążenia", ru: "болезни системы кровообращения" } }),
  ...disorders({ chapter: "circulation", slug: "immune-disorder", rows: IMMUNE_DISORDERS, shift: 0, subtopic: { pl: "zaburzenia odporności", ru: "нарушения иммунитета" } }),
  ...disorders({ chapter: "urinary", slug: "urinary-disorder", rows: URINARY_DISORDERS, shift: 1, subtopic: { pl: "choroby układu moczowego", ru: "болезни мочевыделительной системы" } }),
  ...disorders({ chapter: "nervous", slug: "nervous-disorder", rows: NERVOUS_DISORDERS, shift: 2, subtopic: { pl: "choroby układu nerwowego", ru: "болезни нервной системы" } }),
  ...disorders({ chapter: "reproduction", slug: "reproductive-disorder", rows: REPRODUCTIVE_DISORDERS, shift: 3, subtopic: { pl: "choroby układu rozrodczego", ru: "болезни половой системы" } }),
];

// ---- §4.6 calculations ----

const DIET = { pl: "zasady racjonalnego odżywiania się", ru: "принципы рационального питания" };

// hand-picked [mass kg, height cm] pairs: a numeric range would be walked in order, and the first
// dozen substitutions would all be one 45-kilogram person of slightly different heights
const BODIES: readonly (readonly [number, number])[] = [
  [52, 168], [70, 175], [95, 180], [49, 160], [82, 172], [64, 158],
  [110, 185], [58, 182], [75, 165], [68, 190], [88, 170], [45, 155],
];

const bmiClass = (bmi: number): Bi =>
  bmi < 18.5
    ? { pl: "niedowaga", ru: "недостаточная масса" }
    : bmi < 25
      ? { pl: "prawidłowa masa ciała", ru: "нормальная масса" }
      : bmi < 30
        ? { pl: "nadwaga", ru: "избыточная масса" }
        : { pl: "otyłość", ru: "ожирение" };

const bmi = calcTemplate({
  id: "bio.lo3.digestion.bmi",
  topicId: "bio.lo3.digestion",
  paragraph: P.digestion.diet,
  subtopic: DIET,
  tags: ["obliczenia"],
  difficulty: 1,
  params: { k: choiceParam(...BODIES.map((_, i) => i)) },
  decimals: 1,
  formula: (p) => `${BODIES[p.k][0]} / (${BODIES[p.k][1]} / 100)^2`,
  value: (p) => {
    const [m, h] = BODIES[p.k];
    const metres = h / 100;
    return m / (metres * metres);
  },
  question: (p, lang) => {
    const [m, h] = BODIES[p.k];
    return lang === "pl"
      ? `Osoba waży ${m} kg i ma ${h} cm wzrostu. Oblicz jej wskaźnik BMI z dokładnością do 0,1.`
      : `Человек весит ${m} кг при росте ${h} см. Вычисли его индекс массы тела с точностью до 0,1.`;
  },
  hint: (_p, lang) =>
    lang === "pl"
      ? "BMI = masa [kg] / (wzrost [m])². Wzrost zamień najpierw na metry."
      : "ИМТ = масса [кг] / (рост [м])². Сначала переведи рост в метры.",
  solution: (p, answer, lang) => {
    const [m, h] = BODIES[p.k];
    const metres = String(h / 100).replace(".", ",");
    const value = m / (h / 100) ** 2;
    const verdict = bmiClass(value)[lang];
    return lang === "pl"
      ? `BMI = ${m} / ${metres}² = ${answer}. Według WHO to ${verdict} (norma: 18,5–24,9).`
      : `ИМТ = ${m} / ${metres}² = ${answer}. По критериям ВОЗ это ${verdict} (норма: 18,5–24,9).`;
  },
});

// [label pl, label ru, protein g, fat g, carbohydrate g] per 100 g, rounded textbook-style values
const FOODS: readonly (readonly [string, string, number, number, number])[] = [
  ["chleb pszenny", "пшеничный хлеб", 8, 3, 50],
  ["ser żółty", "твёрдый сыр", 26, 28, 2],
  ["jogurt naturalny", "натуральный йогурт", 4, 3, 6],
  ["orzechy włoskie", "грецкие орехи", 15, 65, 14],
  ["makaron ugotowany", "варёные макароны", 5, 1, 30],
  ["pierś z kurczaka", "куриная грудка", 22, 2, 0],
  ["banan", "банан", 1, 0, 23],
  ["czekolada mleczna", "молочный шоколад", 8, 30, 58],
  ["jajko", "куриное яйцо", 13, 10, 1],
  ["fasola ugotowana", "варёная фасоль", 9, 1, 22],
];

const energy = calcTemplate({
  id: "bio.lo3.digestion.food-energy",
  topicId: "bio.lo3.digestion",
  paragraph: P.digestion.diet,
  subtopic: DIET,
  tags: ["obliczenia"],
  difficulty: 2,
  params: { k: choiceParam(...FOODS.map((_, i) => i)) },
  formula: (p) => `4 * ${FOODS[p.k][2]} + 9 * ${FOODS[p.k][3]} + 4 * ${FOODS[p.k][4]}`,
  value: (p) => {
    const [, , protein, fat, carbs] = FOODS[p.k];
    return (protein + carbs) * 4 + fat * 9;
  },
  question: (p, lang) => {
    const [pl, ru, protein, fat, carbs] = FOODS[p.k];
    return lang === "pl"
      ? `100 g produktu (${pl}) zawiera ${protein} g białek, ${fat} g tłuszczów i ${carbs} g węglowodanów. Oblicz jego wartość energetyczną w kilokaloriach.`
      : `100 г продукта (${ru}) содержат ${protein} г белков, ${fat} г жиров и ${carbs} г углеводов. Вычисли его энергетическую ценность в килокалориях.`;
  },
  hint: (_p, lang) =>
    lang === "pl"
      ? "1 g białek i 1 g węglowodanów dostarcza ok. 4 kcal, a 1 g tłuszczów — ok. 9 kcal."
      : "1 г белков и 1 г углеводов даёт около 4 ккал, а 1 г жиров — около 9 ккал.",
  solution: (p, answer, lang) => {
    const [, , protein, fat, carbs] = FOODS[p.k];
    return lang === "pl"
      ? `4 · ${protein} + 9 · ${fat} + 4 · ${carbs} = ${answer} kcal.`
      : `4 · ${protein} + 9 · ${fat} + 4 · ${carbs} = ${answer} ккал.`;
  },
});

export const lo3GapsTemplates: BioTemplate[] = [...conceptTemplates, ...disorderTemplates, bmi, energy];
