// Dział 7: Układ moczowy. Nephron anatomy and urine formation, plus the filtration/clearance
// arithmetic that matura questions on this dział are built from.
import { intRange } from "@portal/trainer-sdk/templates";
import { calcTemplate, cap, choiceFromTable, termFromTable, type BioTemplate } from "../tableTemplate.ts";
import type { StructureEntry } from "../data/circulation.ts";
import { NEPHRON_PARTS, URINE_PROCESSES, type ProcessEntry } from "../data/urinary.ts";

const TOPIC = "bio.lo3.urinary";
const ANATOMY = { pl: "budowa nerki i nefronu", ru: "строение почки и нефрона" };
const PROCESSES = { pl: "powstawanie moczu i osmoregulacja", ru: "образование мочи и осморегуляция" };

const tier = (row: { tier: StructureEntry["tier"] }) => row.tier;

const partToRole = choiceFromTable<StructureEntry>({
  id: `${TOPIC}.part-to-role`,
  topicId: TOPIC,
  rows: NEPHRON_PARTS,
  subtopic: ANATOMY,
  difficulty: tier,
  shift: 0,
  question: (r, lang) =>
    lang === "pl" ? `Struktura: ${r.name.pl}. Jaka jest jej rola?` : `Структура: ${r.name.ru}. Какова её роль?`,
  optionText: (r, lang) => r.role[lang],
  misconception: { pl: "rola sąsiedniego odcinka nefronu", ru: "роль соседнего отдела нефрона" },
  solution: (r, lang) => (lang === "pl" ? `${cap(r.name.pl)} — ${r.role.pl}.` : `${cap(r.name.ru)} — ${r.role.ru}.`),
});

const roleToPart = termFromTable<StructureEntry>({
  id: `${TOPIC}.role-to-part`,
  topicId: TOPIC,
  rows: NEPHRON_PARTS,
  subtopic: ANATOMY,
  difficulty: tier,
  question: (r, lang) =>
    lang === "pl"
      ? `Funkcja: ${r.role.pl}. Podaj nazwę struktury w mianowniku.`
      : `Функция: ${r.role.ru}. Назови структуру в именительном падеже.`,
  term: (r, lang) => r.name[lang],
  aliases: (r) => [r.name.pl, r.name.ru, ...r.aliases.pl, ...r.aliases.ru],
  solution: (r, lang) => (lang === "pl" ? `Odpowiedź: ${r.name.pl}.` : `Ответ: ${r.name.ru}.`),
});

const processToDescription = choiceFromTable<ProcessEntry>({
  id: `${TOPIC}.process-to-description`,
  topicId: TOPIC,
  rows: URINE_PROCESSES,
  subtopic: PROCESSES,
  tags: ["homeostaza"],
  difficulty: tier,
  shift: 1,
  question: (p, lang) => (lang === "pl" ? `Na czym polega ${p.name.pl}?` : `В чём заключается ${p.name.ru}?`),
  optionText: (p, lang) => p.description[lang],
  misconception: { pl: "opis innego etapu powstawania moczu", ru: "описание другого этапа образования мочи" },
  solution: (p, lang) =>
    lang === "pl" ? `${cap(p.name.pl)} — ${p.description.pl}.` : `${cap(p.name.ru)} — ${p.description.ru}.`,
});

const descriptionToProcess = termFromTable<ProcessEntry>({
  id: `${TOPIC}.description-to-process`,
  topicId: TOPIC,
  rows: URINE_PROCESSES,
  subtopic: PROCESSES,
  tags: ["homeostaza"],
  difficulty: tier,
  question: (p, lang) =>
    lang === "pl"
      ? `Proces: ${p.description.pl}. Podaj jego nazwę w mianowniku.`
      : `Процесс: ${p.description.ru}. Назови его в именительном падеже.`,
  term: (p, lang) => p.name[lang],
  aliases: (p) => [p.name.pl, p.name.ru, ...p.aliases.pl, ...p.aliases.ru],
  solution: (p, lang) => (lang === "pl" ? `Odpowiedź: ${p.name.pl}.` : `Ответ: ${p.name.ru}.`),
});

// ---- calculations ----

const filteredLoad = calcTemplate({
  id: `${TOPIC}.filtered-load`,
  topicId: TOPIC,
  subtopic: PROCESSES,
  tags: ["obliczenia"],
  difficulty: 2,
  params: { gfr: intRange(10, 13), conc: intRange(8, 12) },
  decimals: 1,
  // GFR in ml/min x concentration in mg/100 ml -> mg/min
  formula: (p) => `(${p.gfr * 10} * ${p.conc * 10}) / 100`,
  value: (p) => (p.gfr * 10 * (p.conc * 10)) / 100,
  question: (p, lang) =>
    lang === "pl"
      ? `Przesączanie kłębuszkowe wynosi ${p.gfr * 10} ml/min, a stężenie glukozy w osoczu ${p.conc * 10} mg/100 ml. Ile miligramów glukozy jest przesączane w ciągu minuty?`
      : `Клубочковая фильтрация равна ${p.gfr * 10} мл/мин, концентрация глюкозы в плазме ${p.conc * 10} мг/100 мл. Сколько миллиграммов глюкозы фильтруется за минуту?`,
  hint: (_p, lang) =>
    lang === "pl"
      ? "Ładunek przesączany = objętość przesączu × stężenie substancji w osoczu."
      : "Фильтруемое количество = объём фильтрата × концентрация вещества в плазме.",
  solution: (p, answer, lang) =>
    lang === "pl"
      ? `${p.gfr * 10} ml/min × ${p.conc * 10} mg/100 ml = ${answer} mg/min. U zdrowej osoby cała ta glukoza wraca przez resorpcję zwrotną, więc w moczu jej nie ma.`
      : `${p.gfr * 10} мл/мин × ${p.conc * 10} мг/100 мл = ${answer} мг/мин. У здорового человека вся эта глюкоза возвращается обратным всасыванием, поэтому в моче её нет.`,
});

const clearance = calcTemplate({
  id: `${TOPIC}.clearance`,
  topicId: TOPIC,
  subtopic: PROCESSES,
  tags: ["obliczenia"],
  difficulty: 3,
  params: { u: intRange(60, 80), v: intRange(1, 3), pl: intRange(1, 2) },
  decimals: 1,
  formula: (p) => `(${p.u} * ${p.v}) / ${p.pl}`,
  value: (p) => (p.u * p.v) / p.pl,
  question: (p, lang) =>
    lang === "pl"
      ? `Stężenie substancji w moczu wynosi ${p.u} mg/ml, objętość moczu ${p.v} ml/min, a stężenie w osoczu ${p.pl} mg/ml. Oblicz klirens tej substancji w ml/min.`
      : `Концентрация вещества в моче ${p.u} мг/мл, объём мочи ${p.v} мл/мин, концентрация в плазме ${p.pl} мг/мл. Вычисли клиренс этого вещества в мл/мин.`,
  hint: (_p, lang) =>
    lang === "pl"
      ? "Klirens = (stężenie w moczu × objętość moczu) / stężenie w osoczu."
      : "Клиренс = (концентрация в моче × объём мочи) / концентрация в плазме.",
  solution: (p, answer, lang) =>
    lang === "pl"
      ? `(${p.u} × ${p.v}) / ${p.pl} = ${answer} ml/min — tyle osocza zostaje w ciągu minuty całkowicie oczyszczone z tej substancji.`
      : `(${p.u} × ${p.v}) / ${p.pl} = ${answer} мл/мин — столько плазмы за минуту полностью очищается от этого вещества.`,
});

const reabsorbedWater = calcTemplate({
  id: `${TOPIC}.reabsorbed-water`,
  topicId: TOPIC,
  subtopic: PROCESSES,
  tags: ["obliczenia", "homeostaza"],
  difficulty: 2,
  // kept small enough that the renderer enumerates the whole product instead of sampling it:
  // sampling would give different substitutions (and ids) on every run, and the pool ignores
  // duplicates by id, so re-rendering would pile up new rows rather than being a no-op
  params: { filtrate: intRange(15, 19), urine: intRange(10, 20) },
  decimals: 1,
  formula: (p) => `((${p.filtrate * 10} - ${p.urine / 10}) / ${p.filtrate * 10}) * 100`,
  value: (p) => ((p.filtrate * 10 - p.urine / 10) / (p.filtrate * 10)) * 100,
  question: (p, lang) =>
    lang === "pl"
      ? `W ciągu doby powstaje ${p.filtrate * 10} litrów moczu pierwotnego i ${(p.urine / 10).toFixed(1).replace(".", ",")} litra moczu ostatecznego. Jaki procent wody zostaje wchłonięty z powrotem?`
      : `За сутки образуется ${p.filtrate * 10} литров первичной мочи и ${(p.urine / 10).toFixed(1).replace(".", ",")} литра окончательной мочи. Какой процент воды всасывается обратно?`,
  hint: (_p, lang) =>
    lang === "pl"
      ? "Odzyskana woda to różnica między moczem pierwotnym a ostatecznym, odniesiona do moczu pierwotnego."
      : "Возвращённая вода — разница между первичной и окончательной мочой, отнесённая к первичной.",
  solution: (p, answer, lang) =>
    lang === "pl"
      ? `(${p.filtrate * 10} − ${(p.urine / 10).toFixed(1).replace(".", ",")}) / ${p.filtrate * 10} × 100% ≈ ${answer}%. Niemal cała woda wraca do krwi — inaczej odwodnienie nastąpiłoby w ciągu godzin.`
      : `(${p.filtrate * 10} − ${(p.urine / 10).toFixed(1).replace(".", ",")}) / ${p.filtrate * 10} × 100% ≈ ${answer}%. Почти вся вода возвращается в кровь — иначе обезвоживание наступило бы за часы.`,
});

export const lo3UrinaryTemplates: BioTemplate[] = [
  partToRole,
  roleToPart,
  processToDescription,
  descriptionToProcess,
  filteredLoad,
  clearance,
  reabsorbedWater,
];
