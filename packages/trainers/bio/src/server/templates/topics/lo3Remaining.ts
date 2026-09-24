// Działy 1, 2, 3, 4, 8, 9 and 11. All of them take the same shape — a table of structures and what
// they do, in both directions — so they are built from `pairFromTable` rather than written out one
// by one. The two exceptions with real arithmetic (corrective lens power, cycle day) are below.
import { intRange } from "@portal/trainer-sdk/templates";
import { calcTemplate, pairFromTable, type BioTemplate } from "../tableTemplate.ts";
import { HIERARCHY_AND_TRANSPORT, SKIN_PARTS, TISSUES } from "../data/organism.ts";
import {
  DIGESTIVE_ORGANS,
  ENZYMES,
  MOTION_PARTS,
  NERVOUS_PARTS,
  REPRODUCTION_PARTS,
  SENSE_PARTS,
  VISION_DEFECTS,
} from "../data/systems.ts";
import { P } from "../../../curriculum/lo.ts";

const organism = [
  ...pairFromTable({
    topicId: "bio.lo3.organism",
    slug: "tissue",
    rows: TISSUES,
    paragraph: P.organism.hierarchy,
    subtopic: { pl: "tkanki i poziomy organizacji", ru: "ткани и уровни организации" },
    shift: 0,
    label: { pl: "Tkanka", ru: "Ткань", feminine: ["pl", "ru"] },
    misconception: { pl: "rola innej tkanki, często z tej samej grupy", ru: "роль другой ткани, часто из той же группы" },
  }),
  ...pairFromTable({
    topicId: "bio.lo3.organism",
    paragraph: P.organism.hierarchy,
    slug: "hierarchy",
    rows: HIERARCHY_AND_TRANSPORT,
    subtopic: { pl: "poziomy organizacji i transport przez błony", ru: "уровни организации и транспорт через мембраны" },
    shift: 2,
    label: { pl: "Pojęcie", ru: "Понятие" },
    misconception: {
      pl: "definicja pokrewnego pojęcia — łatwo pomylić dyfuzję z osmozą albo narząd z układem narządów",
      ru: "определение смежного понятия — легко спутать диффузию с осмосом или орган с системой органов",
    },
  }),
];

const skin = pairFromTable({
  topicId: "bio.lo3.skin",
  slug: "skin",
  rows: SKIN_PARTS,
  paragraph: P.skin.structure,
  subtopic: { pl: "budowa skóry i termoregulacja", ru: "строение кожи и терморегуляция" },
  tags: ["homeostaza"],
  shift: 1,
  label: { pl: "Element skóry", ru: "Элемент кожи" },
  misconception: { pl: "rola innej warstwy skóry albo innego wytworu naskórka", ru: "роль другого слоя кожи или другого производного эпидермиса" },
});

const motion = pairFromTable({
  topicId: "bio.lo3.motion",
  slug: "motion",
  rows: MOTION_PARTS,
  subtopic: { pl: "kości, stawy i mięśnie", ru: "кости, суставы и мышцы" },
  shift: 0,
  label: { pl: "Struktura", ru: "Структура", feminine: ["pl", "ru"] },
  misconception: { pl: "rola sąsiedniej struktury kości, stawu albo mięśnia", ru: "роль соседней структуры кости, сустава или мышцы" },
});

const digestion = [
  ...pairFromTable({
    topicId: "bio.lo3.digestion",
    slug: "organ",
    rows: DIGESTIVE_ORGANS,
    subtopic: { pl: "budowa przewodu pokarmowego", ru: "строение пищеварительного тракта" },
    shift: 0,
    label: { pl: "Narząd", ru: "Орган" },
    misconception: { pl: "rola sąsiedniego odcinka przewodu pokarmowego", ru: "роль соседнего отдела пищеварительного тракта" },
  }),
  ...pairFromTable({
    topicId: "bio.lo3.digestion",
    slug: "enzyme",
    rows: ENZYMES,
    paragraph: P.digestion.processes,
    subtopic: { pl: "enzymy trawienne", ru: "пищеварительные ферменты" },
    shift: 2,
    label: { pl: "Enzym", ru: "Фермент" },
    misconception: { pl: "działanie enzymu trawiącego inną grupę składników", ru: "действие фермента, переваривающего другую группу веществ" },
  }),
];

const nervous = pairFromTable({
  topicId: "bio.lo3.nervous",
  slug: "nervous",
  rows: NERVOUS_PARTS,
  subtopic: { pl: "neuron, mózgowie i odruchy", ru: "нейрон, головной мозг и рефлексы" },
  shift: 1,
  label: { pl: "Pojęcie", ru: "Понятие" },
  misconception: { pl: "rola sąsiedniej części układu nerwowego", ru: "роль соседней части нервной системы" },
});

const senses = [
  ...pairFromTable({
    topicId: "bio.lo3.senses",
    slug: "sense",
    rows: SENSE_PARTS,
    subtopic: { pl: "budowa oka i ucha", ru: "строение глаза и уха" },
    shift: 0,
    label: { pl: "Struktura", ru: "Структура", feminine: ["pl", "ru"] },
    misconception: { pl: "rola innej części oka albo ucha", ru: "роль другой части глаза или уха" },
  }),
  ...pairFromTable({
    topicId: "bio.lo3.senses",
    slug: "defect",
    rows: VISION_DEFECTS,
    paragraph: P.senses.vision,
    subtopic: { pl: "wady wzroku", ru: "дефекты зрения" },
    tags: ["choroby"],
    shift: 3,
    label: { pl: "Wada wzroku", ru: "Дефект зрения", feminine: ["pl"] },
    misconception: { pl: "opis przeciwnej wady wzroku", ru: "описание противоположного дефекта зрения" },
  }),
];

const reproduction = pairFromTable({
  topicId: "bio.lo3.reproduction",
  slug: "reproduction",
  rows: REPRODUCTION_PARTS,
  subtopic: { pl: "układ rozrodczy i rozwój zarodkowy", ru: "половая система и зародышевое развитие" },
  shift: 2,
  label: { pl: "Pojęcie", ru: "Понятие" },
  misconception: { pl: "rola innego narządu rozrodczego albo innego listka zarodkowego", ru: "роль другого органа размножения или другого зародышевого листка" },
});

// ---- calculations ----

const lensPower = calcTemplate({
  id: "bio.lo3.senses.lens-power",
  topicId: "bio.lo3.senses",
  paragraph: P.senses.vision,
  subtopic: { pl: "wady wzroku", ru: "дефекты зрения" },
  tags: ["obliczenia"],
  difficulty: 2,
  // focal lengths in tenths of a metre keep both the question and the answer in tidy numbers
  params: { f: intRange(2, 10), sign: intRange(0, 1) },
  decimals: 1,
  formula: (p) => `(${p.sign === 0 ? "-" : ""}1) / ${p.f / 10}`,
  value: (p) => (p.sign === 0 ? -1 : 1) / (p.f / 10),
  question: (p, lang) => {
    const f = (p.f / 10).toFixed(1).replace(".", ",");
    const defect = p.sign === 0 ? { pl: "rozpraszającej", ru: "рассеивающей" } : { pl: "skupiającej", ru: "собирающей" };
    return lang === "pl"
      ? `Okulista dobiera soczewkę ${defect.pl} o ogniskowej ${f} m. Oblicz jej zdolność skupiającą w dioptriach.`
      : `Окулист подбирает ${defect.ru} линзу с фокусным расстоянием ${f} м. Вычисли её оптическую силу в диоптриях.`;
  },
  hint: (_p, lang) =>
    lang === "pl"
      ? "Zdolność skupiająca to odwrotność ogniskowej; soczewka rozpraszająca ma wartość ujemną."
      : "Оптическая сила — обратная величина фокусного расстояния; у рассеивающей линзы она отрицательна.",
  solution: (p, answer, lang) => {
    const f = (p.f / 10).toFixed(1).replace(".", ",");
    const defect = p.sign === 0 ? { pl: "krótkowzroczności", ru: "близорукости" } : { pl: "dalekowzroczności", ru: "дальнозоркости" };
    return lang === "pl"
      ? `Z = ${p.sign === 0 ? "−" : ""}1 / ${f} m = ${answer} D. Taką soczewkę stosuje się przy ${defect.pl}.`
      : `D = ${p.sign === 0 ? "−" : ""}1 / ${f} м = ${answer} дптр. Такую линзу применяют при ${defect.ru}.`;
  },
});

const ovulationDay = calcTemplate({
  id: "bio.lo3.reproduction.ovulation-day",
  topicId: "bio.lo3.reproduction",
  paragraph: P.reproduction.female,
  subtopic: { pl: "cykl miesiączkowy", ru: "менструальный цикл" },
  tags: ["obliczenia"],
  difficulty: 2,
  params: { cycle: intRange(24, 34) },
  formula: (p) => `${p.cycle} - 14`,
  value: (p) => p.cycle - 14,
  question: (p, lang) =>
    lang === "pl"
      ? `Cykl miesiączkowy trwa ${p.cycle} dni. W którym dniu cyklu następuje owulacja?`
      : `Менструальный цикл длится ${p.cycle} дней. На какой день цикла происходит овуляция?`,
  hint: (_p, lang) =>
    lang === "pl"
      ? "Faza lutealna trwa stałe 14 dni, niezależnie od długości cyklu — zmienia się faza folikularna."
      : "Лютеиновая фаза длится ровно 14 дней независимо от длины цикла — меняется фолликулярная фаза.",
  solution: (p, answer, lang) =>
    lang === "pl"
      ? `${p.cycle} − 14 = ${answer}. Owulacja wypada 14 dni przed następną miesiączką, a nie w połowie cyklu — dlatego przy cyklu ${p.cycle}-dniowym to dzień ${answer}.`
      : `${p.cycle} − 14 = ${answer}. Овуляция приходится за 14 дней до следующей менструации, а не на середину цикла — поэтому при ${p.cycle}-дневном цикле это день ${answer}.`,
});

export const lo3RemainingTemplates: BioTemplate[] = [
  ...organism,
  ...skin,
  ...motion,
  ...digestion,
  ...nervous,
  ...senses,
  ...reproduction,
  lensPower,
  ovulationDay,
];
