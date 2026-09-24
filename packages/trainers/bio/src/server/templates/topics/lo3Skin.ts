// §2.1 and §2.3: the integument across the animal kingdom, and the skin's diseases and hygiene.
// (§2.2, the structure of human skin, is one `pairFromTable` in lo3Remaining.ts.)
import { cap, choiceFromTable, pairFromTable, termFromTable, type BioTemplate } from "../tableTemplate.ts";
import {
  ANIMAL_GROUPS,
  ANIMAL_INTEGUMENT,
  DISEASE_KINDS,
  SKIN_DISEASES,
  SKIN_RISKS,
  type DiseaseEntry,
  type GroupEntry,
  type RiskEntry,
} from "../data/skin.ts";
import { P } from "../../../curriculum/lo.ts";

const TOPIC = "bio.lo3.skin";
const ANIMALS = { pl: "układ powłokowy zwierząt", ru: "покровы животных" };
const DISEASES = { pl: "choroby skóry", ru: "болезни кожи" };
const HYGIENE = { pl: "higiena skóry", ru: "гигиена кожи" };

// ---- §2.1 ----

const integument = pairFromTable({
  topicId: TOPIC,
  paragraph: P.skin.animals,
  slug: "integument",
  rows: ANIMAL_INTEGUMENT,
  subtopic: ANIMALS,
  shift: 1,
  label: { pl: "Pojęcie", ru: "Понятие" },
  misconception: {
    pl: "wytwór lub cecha powłok innej grupy zwierząt",
    ru: "производное или особенность покровов другой группы животных",
  },
});

const groupToCover = choiceFromTable<GroupEntry>({
  id: `${TOPIC}.group-to-cover`,
  topicId: TOPIC,
  paragraph: P.skin.animals,
  rows: ANIMAL_GROUPS,
  subtopic: ANIMALS,
  difficulty: (r) => r.tier,
  shift: 3,
  question: (r, lang) =>
    lang === "pl"
      ? `Grupa zwierząt: ${r.group.pl}. Jak wygląda ich pokrycie ciała?`
      : `Группа животных: ${r.group.ru}. Каковы их покровы?`,
  optionText: (r, lang) => r.cover[lang],
  misconception: { pl: "pokrycie ciała sąsiedniej grupy zwierząt", ru: "покровы соседней группы животных" },
  solution: (r, lang) => (lang === "pl" ? `${cap(r.group.pl)}: ${r.cover.pl}.` : `${cap(r.group.ru)}: ${r.cover.ru}.`),
});

const coverToGroup = termFromTable<GroupEntry>({
  id: `${TOPIC}.cover-to-group`,
  topicId: TOPIC,
  paragraph: P.skin.animals,
  rows: ANIMAL_GROUPS,
  subtopic: ANIMALS,
  difficulty: (r) => r.tier,
  question: (r, lang) =>
    lang === "pl"
      ? `Pokrycie ciała: ${r.cover.pl}. Jaka to grupa zwierząt? Podaj nazwę w liczbie mnogiej.`
      : `Покровы: ${r.cover.ru}. Какая это группа животных? Назови во множественном числе.`,
  term: (r, lang) => r.group[lang],
  aliases: (r) => [r.group.pl, r.group.ru, ...r.aliases.pl, ...r.aliases.ru],
  solution: (r, lang) => (lang === "pl" ? `Odpowiedź: ${r.group.pl}.` : `Ответ: ${r.group.ru}.`),
});

// ---- §2.3 ----

const diseaseToCause = choiceFromTable<DiseaseEntry>({
  id: `${TOPIC}.disease-to-cause`,
  topicId: TOPIC,
  paragraph: P.skin.disorders,
  rows: SKIN_DISEASES,
  subtopic: DISEASES,
  tags: ["choroby"],
  difficulty: (r) => r.tier,
  shift: 0,
  question: (r, lang) =>
    lang === "pl" ? `Choroba: ${r.name.pl}. Co ją wywołuje?` : `Болезнь: ${r.name.ru}. Что её вызывает?`,
  optionText: (r, lang) => r.cause[lang],
  misconception: { pl: "przyczyna innej choroby skóry", ru: "причина другой болезни кожи" },
  hint: (r, lang) => (lang === "pl" ? `Rodzaj: ${DISEASE_KINDS[r.kind].pl}.` : `Вид: ${DISEASE_KINDS[r.kind].ru}.`),
  solution: (r, lang) =>
    lang === "pl"
      ? `${cap(r.name.pl)}: ${r.cause.pl}. Objawy: ${r.sign.pl}.`
      : `${cap(r.name.ru)}: ${r.cause.ru}. Симптомы: ${r.sign.ru}.`,
});

const signToDisease = termFromTable<DiseaseEntry>({
  id: `${TOPIC}.sign-to-disease`,
  topicId: TOPIC,
  paragraph: P.skin.disorders,
  rows: SKIN_DISEASES,
  subtopic: DISEASES,
  tags: ["choroby"],
  difficulty: (r) => r.tier,
  question: (r, lang) =>
    lang === "pl" ? `Objawy: ${r.sign.pl}. Podaj nazwę choroby.` : `Симптомы: ${r.sign.ru}. Назови болезнь.`,
  term: (r, lang) => r.name[lang],
  aliases: (r) => [r.name.pl, r.name.ru, ...r.aliases.pl, ...r.aliases.ru],
  hint: (r, lang) => (lang === "pl" ? `Rodzaj: ${DISEASE_KINDS[r.kind].pl}.` : `Вид: ${DISEASE_KINDS[r.kind].ru}.`),
  solution: (r, lang) =>
    lang === "pl" ? `Odpowiedź: ${r.name.pl}. Przyczyna: ${r.cause.pl}.` : `Ответ: ${r.name.ru}. Причина: ${r.cause.ru}.`,
});

const diseaseToKind = choiceFromTable<DiseaseEntry>({
  id: `${TOPIC}.disease-to-kind`,
  topicId: TOPIC,
  paragraph: P.skin.disorders,
  rows: SKIN_DISEASES,
  subtopic: DISEASES,
  tags: ["choroby"],
  difficulty: (r) => r.tier,
  shift: 2,
  question: (r, lang) =>
    lang === "pl"
      ? `Choroba: ${r.name.pl}. Do jakiej grupy chorób należy?`
      : `Болезнь: ${r.name.ru}. К какой группе болезней она относится?`,
  // rows of the same kind collide on this text; pickDistractors skips them, and nine kinds leave plenty
  optionText: (r, lang) => DISEASE_KINDS[r.kind][lang],
  misconception: { pl: "rodzaj innej choroby skóry", ru: "вид другой болезни кожи" },
  solution: (r, lang) =>
    lang === "pl"
      ? `${cap(r.name.pl)} — ${DISEASE_KINDS[r.kind].pl}: ${r.cause.pl}.`
      : `${cap(r.name.ru)} — ${DISEASE_KINDS[r.kind].ru}: ${r.cause.ru}.`,
});

const riskToRule = choiceFromTable<RiskEntry>({
  id: `${TOPIC}.risk-to-rule`,
  topicId: TOPIC,
  paragraph: P.skin.disorders,
  rows: SKIN_RISKS,
  subtopic: HYGIENE,
  tags: ["choroby"],
  difficulty: (r) => r.tier,
  shift: 1,
  question: (r, lang) =>
    lang === "pl"
      ? `Zagrożenie: ${r.risk.pl}. Jaka zasada higieny przed nim chroni?`
      : `Угроза: ${r.risk.ru}. Какое правило гигиены защищает от неё?`,
  optionText: (r, lang) => r.rule[lang],
  misconception: { pl: "zasada chroniąca przed innym zagrożeniem", ru: "правило, защищающее от другой угрозы" },
  solution: (r, lang) => (lang === "pl" ? `${cap(r.risk.pl)} → ${r.rule.pl}.` : `${cap(r.risk.ru)} → ${r.rule.ru}.`),
});

export const lo3SkinTemplates: BioTemplate[] = [
  ...integument,
  groupToCover,
  coverToGroup,
  diseaseToCause,
  signToDisease,
  diseaseToKind,
  riskToRule,
];
