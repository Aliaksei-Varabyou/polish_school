// §1.3 Homeostaza: the terms of a regulation loop, the values the body holds steady, and how it
// answers a disturbance. Everything carries the "homeostaza" tag — this paragraph is the theme's core.
import { cap, choiceFromTable, pairFromTable, termFromTable, type BioTemplate } from "../tableTemplate.ts";
import { HOMEOSTASIS, PARAMETERS, RESPONSES, type ParameterEntry, type ResponseEntry } from "../data/homeostasis.ts";
import { P } from "../../../curriculum/lo.ts";

const TOPIC = "bio.lo3.organism";
const TAGS = ["homeostaza"];
const SUBTOPIC = { pl: "homeostaza i sprzężenie zwrotne", ru: "гомеостаз и обратная связь" };
const PARAMS = { pl: "parametry środowiska wewnętrznego", ru: "показатели внутренней среды" };

const terms = pairFromTable({
  topicId: TOPIC,
  paragraph: P.organism.homeostasis,
  slug: "homeostasis",
  rows: HOMEOSTASIS,
  subtopic: SUBTOPIC,
  tags: TAGS,
  shift: 2,
  label: { pl: "Pojęcie", ru: "Понятие" },
  misconception: {
    pl: "pokrewne pojęcie regulacji — łatwo pomylić rodzaje sprzężenia albo ogniwa pętli",
    ru: "смежное понятие регуляции — легко спутать виды обратной связи или звенья контура",
  },
});

const parameterToNorm = choiceFromTable<ParameterEntry>({
  id: `${TOPIC}.parameter-to-norm`,
  topicId: TOPIC,
  paragraph: P.organism.homeostasis,
  rows: PARAMETERS,
  subtopic: PARAMS,
  tags: TAGS,
  difficulty: (r) => r.tier,
  shift: 1,
  question: (r, lang) =>
    lang === "pl" ? `Parametr: ${r.parameter.pl}. Jaka jest jego wartość prawidłowa?` : `Показатель: ${r.parameter.ru}. Какова его норма?`,
  optionText: (r, lang) => r.norm[lang],
  misconception: { pl: "norma innego parametru środowiska wewnętrznego", ru: "норма другого показателя внутренней среды" },
  // the parameter does not open the sentence: "pH" must not become "PH"
  solution: (r, lang) =>
    lang === "pl" ? `Wartość prawidłowa parametru „${r.parameter.pl}”: ${r.norm.pl}.` : `Норма показателя «${r.parameter.ru}»: ${r.norm.ru}.`,
});

const normToParameter = termFromTable<ParameterEntry>({
  id: `${TOPIC}.norm-to-parameter`,
  topicId: TOPIC,
  paragraph: P.organism.homeostasis,
  rows: PARAMETERS,
  subtopic: PARAMS,
  tags: TAGS,
  difficulty: (r) => r.tier,
  question: (r, lang) =>
    lang === "pl"
      ? `Wartość prawidłowa: ${r.norm.pl}. Jakiego parametru dotyczy? Podaj nazwę w mianowniku.`
      : `Норма: ${r.norm.ru}. К какому показателю она относится? Назови в именительном падеже.`,
  term: (r, lang) => r.parameter[lang],
  aliases: (r) => [r.parameter.pl, r.parameter.ru, ...r.aliases.pl, ...r.aliases.ru],
  solution: (r, lang) => (lang === "pl" ? `Odpowiedź: ${r.parameter.pl}.` : `Ответ: ${r.parameter.ru}.`),
});

const deviationToResponse = choiceFromTable<ResponseEntry>({
  id: `${TOPIC}.deviation-to-response`,
  topicId: TOPIC,
  paragraph: P.organism.homeostasis,
  rows: RESPONSES,
  subtopic: SUBTOPIC,
  tags: TAGS,
  difficulty: (r) => r.tier,
  shift: 3,
  question: (r, lang) =>
    lang === "pl" ? `Zmiana: ${r.deviation.pl}. Jak reaguje organizm?` : `Изменение: ${r.deviation.ru}. Как реагирует организм?`,
  optionText: (r, lang) => r.response[lang],
  misconception: {
    pl: "reakcja na inną zmianę — często na zmianę przeciwną",
    ru: "ответ на другое изменение — часто на противоположное",
  },
  solution: (r, lang) => {
    if (lang === "pl") {
      const loop =
        r.feedback === "ujemne"
          ? "To ujemne sprzężenie zwrotne: reakcja znosi zmianę i przywraca stan prawidłowy."
          : "To dodatnie sprzężenie zwrotne: reakcja nasila bodziec, aż proces się zakończy.";
      return `${cap(r.deviation.pl)} → ${r.response.pl}. ${loop}`;
    }
    const loop =
      r.feedback === "ujemne"
        ? "Это отрицательная обратная связь: ответ устраняет изменение и возвращает норму."
        : "Это положительная обратная связь: ответ усиливает стимул, пока процесс не завершится.";
    return `${cap(r.deviation.ru)} → ${r.response.ru}. ${loop}`;
  },
});

export const lo3HomeostasisTemplates: BioTemplate[] = [...terms, parameterToNorm, normToParameter, deviationToResponse];
