// Dział 5: Układ oddechowy. Lung volumes are the one part of this dział that is genuinely
// computational, so it carries the trainer's first numeric templates alongside the term tables.
import { intRange } from "@portal/trainer-sdk/templates";
import { cap, calcTemplate, choiceFromTable, termFromTable, type BioTemplate } from "../tableTemplate.ts";
import { AIRWAY_PARTS, LUNG_VOLUMES, type PartEntry, type VolumeEntry } from "../data/respiration.ts";
import { P } from "../../../curriculum/lo.ts";

const TOPIC = "bio.lo3.respiration";
const ANATOMY = { pl: "drogi oddechowe i wymiana gazowa", ru: "дыхательные пути и газообмен" };
const VOLUMES = { pl: "objętości i pojemności płuc", ru: "объёмы и ёмкости лёгких" };

const partTier = (row: PartEntry | VolumeEntry) => row.tier;

const partToRole = choiceFromTable<PartEntry>({
  id: `${TOPIC}.part-to-role`,
  topicId: TOPIC,
  rows: AIRWAY_PARTS,
  subtopic: ANATOMY,
  difficulty: partTier,
  shift: 0,
  question: (r, lang) =>
    lang === "pl" ? `Struktura: ${r.part.pl}. Jaka jest jej rola?` : `Структура: ${r.part.ru}. Какова её роль?`,
  optionText: (r, lang) => r.role[lang],
  misconception: { pl: "rola sąsiedniej struktury układu oddechowego", ru: "роль соседней структуры дыхательной системы" },
  solution: (r, lang) =>
    lang === "pl" ? `${cap(r.part.pl)} — ${r.role.pl}.` : `${cap(r.part.ru)} — ${r.role.ru}.`,
});

const roleToPart = termFromTable<PartEntry>({
  id: `${TOPIC}.role-to-part`,
  topicId: TOPIC,
  rows: AIRWAY_PARTS,
  subtopic: ANATOMY,
  difficulty: partTier,
  question: (r, lang) =>
    lang === "pl"
      ? `Funkcja: ${r.role.pl}. Podaj nazwę struktury w mianowniku.`
      : `Функция: ${r.role.ru}. Назови структуру в именительном падеже.`,
  term: (r, lang) => r.part[lang],
  aliases: (r) => [r.part.pl, r.part.ru, ...r.aliases.pl, ...r.aliases.ru],
  solution: (r, lang) => (lang === "pl" ? `Odpowiedź: ${r.part.pl}.` : `Ответ: ${r.part.ru}.`),
});

const volumeToDefinition = choiceFromTable<VolumeEntry>({
  id: `${TOPIC}.volume-to-definition`,
  topicId: TOPIC,
  rows: LUNG_VOLUMES,
  paragraph: P.respiration.ventilation,
  subtopic: VOLUMES,
  difficulty: partTier,
  shift: 1,
  question: (v, lang) => (lang === "pl" ? `Co to jest ${v.name.pl}?` : `Что такое ${v.name.ru}?`),
  optionText: (v, lang) => v.definition[lang],
  misconception: { pl: "definicja innej objętości lub pojemności płuc", ru: "определение другого объёма или ёмкости лёгких" },
  solution: (v, lang) =>
    lang === "pl" ? `${cap(v.name.pl)} — ${v.definition.pl}.` : `${cap(v.name.ru)} — ${v.definition.ru}.`,
});

const definitionToVolume = termFromTable<VolumeEntry>({
  id: `${TOPIC}.definition-to-volume`,
  topicId: TOPIC,
  rows: LUNG_VOLUMES,
  paragraph: P.respiration.ventilation,
  subtopic: VOLUMES,
  difficulty: partTier,
  question: (v, lang) =>
    lang === "pl"
      ? `Jak nazywa się ${v.definition.pl}? Podaj nazwę w mianowniku.`
      : `Как называется ${v.definition.ru}? Назови в именительном падеже.`,
  term: (v, lang) => v.name[lang],
  aliases: (v) => [v.name.pl, v.name.ru, ...v.aliases.pl, ...v.aliases.ru],
  solution: (v, lang) => (lang === "pl" ? `Odpowiedź: ${v.name.pl}.` : `Ответ: ${v.name.ru}.`),
});

// ---- calculations ----
// `formula` (a mathjs string) and `value` (TypeScript) are written separately on purpose: the
// verifier evaluates both and drops the task if they disagree.

const vitalCapacity = calcTemplate({
  id: `${TOPIC}.vital-capacity`,
  topicId: TOPIC,
  paragraph: P.respiration.ventilation,
  subtopic: VOLUMES,
  tags: ["obliczenia"],
  difficulty: 2,
  params: { tv: intRange(4, 6), irv: intRange(25, 32), erv: intRange(10, 15) },
  formula: (p) => `${p.tv * 100} + ${p.irv * 100} + ${p.erv * 100}`,
  value: (p) => 100 * (p.tv + p.irv + p.erv),
  question: (p, lang) =>
    lang === "pl"
      ? `Objętość oddechowa wynosi ${p.tv * 100} ml, zapasowa objętość wdechowa ${p.irv * 100} ml, a zapasowa objętość wydechowa ${p.erv * 100} ml. Oblicz pojemność życiową płuc w ml.`
      : `Дыхательный объём равен ${p.tv * 100} мл, резервный объём вдоха ${p.irv * 100} мл, резервный объём выдоха ${p.erv * 100} мл. Вычисли жизненную ёмкость лёгких в мл.`,
  hint: (_p, lang) =>
    lang === "pl" ? "VC = objętość oddechowa + zapasowa wdechowa + zapasowa wydechowa." : "ЖЁЛ = ДО + РОвд + РОвыд.",
  solution: (p, answer, lang) =>
    lang === "pl"
      ? `VC = ${p.tv * 100} + ${p.irv * 100} + ${p.erv * 100} = ${answer} ml. Objętość zalegająca nie wchodzi do pojemności życiowej.`
      : `ЖЁЛ = ${p.tv * 100} + ${p.irv * 100} + ${p.erv * 100} = ${answer} мл. Остаточный объём в жизненную ёмкость не входит.`,
});

const minuteVentilation = calcTemplate({
  id: `${TOPIC}.minute-ventilation`,
  topicId: TOPIC,
  paragraph: P.respiration.ventilation,
  subtopic: VOLUMES,
  tags: ["obliczenia"],
  difficulty: 1,
  params: { tv: intRange(4, 6), f: intRange(12, 20) },
  decimals: 2,
  formula: (p) => `(${p.tv * 100} * ${p.f}) / 1000`,
  value: (p) => (p.tv * 100 * p.f) / 1000,
  question: (p, lang) =>
    lang === "pl"
      ? `Objętość oddechowa wynosi ${p.tv * 100} ml, a częstość oddechów ${p.f} na minutę. Oblicz wentylację minutową płuc w litrach na minutę.`
      : `Дыхательный объём равен ${p.tv * 100} мл, частота дыхания ${p.f} в минуту. Вычисли минутную вентиляцию лёгких в литрах в минуту.`,
  hint: (_p, lang) =>
    lang === "pl" ? "Wentylacja minutowa = objętość oddechowa × częstość oddechów." : "Минутная вентиляция = ДО × частота дыхания.",
  solution: (p, answer, lang) =>
    lang === "pl"
      ? `${p.tv * 100} ml × ${p.f} = ${p.tv * 100 * p.f} ml/min = ${answer} l/min.`
      : `${p.tv * 100} мл × ${p.f} = ${p.tv * 100 * p.f} мл/мин = ${answer} л/мин.`,
});

const alveolarVentilation = calcTemplate({
  id: `${TOPIC}.alveolar-ventilation`,
  topicId: TOPIC,
  paragraph: P.respiration.ventilation,
  subtopic: VOLUMES,
  tags: ["obliczenia"],
  difficulty: 3,
  params: { tv: intRange(4, 6), f: intRange(12, 18), dead: intRange(13, 17) },
  decimals: 2,
  formula: (p) => `((${p.tv * 100} - ${p.dead * 10}) * ${p.f}) / 1000`,
  value: (p) => ((p.tv * 100 - p.dead * 10) * p.f) / 1000,
  question: (p, lang) =>
    lang === "pl"
      ? `Objętość oddechowa wynosi ${p.tv * 100} ml, przestrzeń martwa ${p.dead * 10} ml, a częstość oddechów ${p.f} na minutę. Oblicz wentylację pęcherzykową w litrach na minutę.`
      : `Дыхательный объём равен ${p.tv * 100} мл, мёртвое пространство ${p.dead * 10} мл, частота дыхания ${p.f} в минуту. Вычисли альвеолярную вентиляцию в литрах в минуту.`,
  hint: (_p, lang) =>
    lang === "pl"
      ? "Do pęcherzyków dociera tylko ta część objętości oddechowej, która nie zostaje w przestrzeni martwej."
      : "До альвеол доходит только та часть дыхательного объёма, которая не остаётся в мёртвом пространстве.",
  solution: (p, answer, lang) =>
    lang === "pl"
      ? `(${p.tv * 100} − ${p.dead * 10}) × ${p.f} = ${(p.tv * 100 - p.dead * 10) * p.f} ml/min = ${answer} l/min.`
      : `(${p.tv * 100} − ${p.dead * 10}) × ${p.f} = ${(p.tv * 100 - p.dead * 10) * p.f} мл/мин = ${answer} л/мин.`,
});

export const lo3RespirationTemplates: BioTemplate[] = [
  partToRole,
  roleToPart,
  volumeToDefinition,
  definitionToVolume,
  vitalCapacity,
  minuteVentilation,
  alveolarVentilation,
];
