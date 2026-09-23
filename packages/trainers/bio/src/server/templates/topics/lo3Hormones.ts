// Dział 10: Układ hormonalny. Table-driven — a handful of templates over the ~24-row hormone table
// (plus disorders and regulation loops) yields dozens of tasks per language, so the work sits in
// data/hormones.ts rather than here.
import { cap, choiceFromTable, termFromTable, type RowTemplate } from "../tableTemplate.ts";
import { DISORDERS, HORMONES, LOOPS, type DisorderEntry, type HormoneEntry, type LoopEntry } from "../data/hormones.ts";
import { P } from "../../../curriculum/lo.ts";

const TOPIC = "bio.lo3.hormones";
const SUBTOPIC = { pl: "gruczoły dokrewne i hormony", ru: "железы внутренней секреции и гормоны" };
const REGULATION = { pl: "regulacja hormonalna i sprzężenie zwrotne", ru: "гормональная регуляция и обратная связь" };
const DISEASES = { pl: "nadczynność i niedoczynność gruczołów", ru: "гипер- и гипофункция желёз" };

const tier = <T extends { tier: HormoneEntry["tier"] }>(row: T) => row.tier;


const glandToHormone = choiceFromTable<HormoneEntry>({
  id: `${TOPIC}.gland-to-hormone`,
  topicId: TOPIC,
  rows: HORMONES,
  paragraph: P.hormones.structure,
  subtopic: SUBTOPIC,
  tags: ["regulacja-hormonalna"],
  difficulty: tier,
  shift: 0,
  question: (h, lang) =>
    lang === "pl"
      ? `Miejsce wydzielania: ${h.gland.pl}. O który hormon chodzi?`
      : `Место выделения: ${h.gland.ru}. О каком гормоне идёт речь?`,
  optionText: (h, lang) => h.name[lang],
  misconception: {
    pl: "hormon innego gruczołu — albo drugiego płata przysadki",
    ru: "гормон другой железы — или другой доли гипофиза",
  },
  hint: (h, lang) => (lang === "pl" ? `Jego działanie: ${h.action.pl}.` : `Его действие: ${h.action.ru}.`),
  solution: (h, lang) =>
    lang === "pl"
      ? `${cap(h.name.pl)}. Gruczoł: ${h.gland.pl}. Działanie: ${h.action.pl}.`
      : `${cap(h.name.ru)}. Железа: ${h.gland.ru}. Действие: ${h.action.ru}.`,
});

const hormoneToAction = choiceFromTable<HormoneEntry>({
  id: `${TOPIC}.hormone-to-action`,
  topicId: TOPIC,
  rows: HORMONES,
  paragraph: P.hormones.structure,
  subtopic: SUBTOPIC,
  tags: ["regulacja-hormonalna"],
  difficulty: tier,
  shift: 1,
  question: (h, lang) =>
    lang === "pl"
      ? `Hormon: ${h.name.pl}. Jakie jest jego główne działanie?`
      : `Гормон: ${h.name.ru}. Каково его основное действие?`,
  optionText: (h, lang) => h.action[lang],
  misconception: { pl: "działanie innego hormonu", ru: "действие другого гормона" },
  solution: (h, lang) =>
    lang === "pl"
      ? `${cap(h.name.pl)} (${h.gland.pl}) — ${h.action.pl}.`
      : `${cap(h.name.ru)} (${h.gland.ru}) — ${h.action.ru}.`,
});

const hormoneToGland = choiceFromTable<HormoneEntry>({
  id: `${TOPIC}.hormone-to-gland`,
  topicId: TOPIC,
  rows: HORMONES,
  paragraph: P.hormones.structure,
  subtopic: SUBTOPIC,
  tags: ["regulacja-hormonalna"],
  difficulty: tier,
  shift: 2,
  question: (h, lang) =>
    lang === "pl" ? `Hormon: ${h.name.pl}. W którym gruczole powstaje?` : `Гормон: ${h.name.ru}. В какой железе образуется?`,
  optionText: (h, lang) => h.gland[lang],
  misconception: { pl: "gruczoł wydzielający inny hormon", ru: "железа, выделяющая другой гормон" },
  solution: (h, lang) =>
    lang === "pl"
      ? `${cap(h.name.pl)} — miejsce powstawania: ${h.gland.pl}.`
      : `${cap(h.name.ru)} — место образования: ${h.gland.ru}.`,
});

const actionToHormone = termFromTable<HormoneEntry>({
  id: `${TOPIC}.action-to-hormone`,
  topicId: TOPIC,
  rows: HORMONES,
  paragraph: P.hormones.structure,
  subtopic: SUBTOPIC,
  tags: ["regulacja-hormonalna"],
  difficulty: tier,
  question: (h, lang) =>
    lang === "pl"
      ? `Podaj nazwę hormonu (w mianowniku), który ${h.action.pl}.`
      : `Назови гормон (в именительном падеже), который ${h.action.ru}.`,
  term: (h, lang) => h.name[lang],
  // the other language's name counts too: this is one concept, and a student moving between a Polish
  // textbook and a Russian-speaking parent should not be marked wrong for naming it in either
  aliases: (h) => [h.name.pl, h.name.ru, ...h.aliases.pl, ...h.aliases.ru],
  hint: (h, lang) => (lang === "pl" ? `Gruczoł: ${h.gland.pl}.` : `Железа: ${h.gland.ru}.`),
  solution: (h, lang) =>
    lang === "pl"
      ? `Odpowiedź: ${h.name.pl}. Gruczoł: ${h.gland.pl}.`
      : `Ответ: ${h.name.ru}. Железа: ${h.gland.ru}.`,
});

const disorderToDisease = choiceFromTable<DisorderEntry>({
  id: `${TOPIC}.disorder-to-disease`,
  topicId: TOPIC,
  rows: DISORDERS,
  paragraph: P.hormones.disorders,
  subtopic: DISEASES,
  tags: ["choroby", "regulacja-hormonalna"],
  difficulty: tier,
  shift: 0,
  question: (dz, lang) =>
    lang === "pl"
      ? `Do czego prowadzi ${dz.kind} wydzielania ${dz.hormone.pl}?`
      : `К чему приводит ${dz.kind === "nadczynność" ? "избыточная" : "недостаточная"} секреция ${dz.hormone.ru}?`,
  optionText: (dz, lang) => dz.disease[lang],
  misconception: {
    pl: "zaburzenie wywołane innym hormonem albo odwrotnym zaburzeniem tego samego",
    ru: "нарушение из-за другого гормона или обратного сдвига того же самого",
  },
  hint: (dz, lang) => (lang === "pl" ? `Objawy: ${dz.symptom.pl}.` : `Симптомы: ${dz.symptom.ru}.`),
  solution: (dz, lang) =>
    lang === "pl"
      ? `${dz.kind === "nadczynność" ? "Nadmiar" : "Niedobór"} ${dz.hormone.pl} → ${dz.disease.pl}. Objawy: ${dz.symptom.pl}.`
      : `${dz.kind === "nadczynność" ? "Избыток" : "Недостаток"} ${dz.hormone.ru} → ${dz.disease.ru}. Симптомы: ${dz.symptom.ru}.`,
});

const symptomToDisease = choiceFromTable<DisorderEntry>({
  id: `${TOPIC}.symptom-to-disease`,
  topicId: TOPIC,
  rows: DISORDERS,
  paragraph: P.hormones.disorders,
  subtopic: DISEASES,
  tags: ["choroby", "regulacja-hormonalna"],
  difficulty: tier,
  shift: 2,
  question: (dz, lang) =>
    lang === "pl" ? `Jaka choroba daje objawy: ${dz.symptom.pl}?` : `Какая болезнь даёт симптомы: ${dz.symptom.ru}?`,
  optionText: (dz, lang) => dz.disease[lang],
  misconception: { pl: "choroba o objawach przeciwnych", ru: "болезнь с противоположными симптомами" },
  solution: (dz, lang) =>
    lang === "pl"
      ? `Odpowiedź: ${dz.disease.pl} — ${dz.kind} wydzielania ${dz.hormone.pl}.`
      : `Ответ: ${dz.disease.ru} — ${dz.kind === "nadczynność" ? "избыточная" : "недостаточная"} секреция ${dz.hormone.ru}.`,
});

const feedbackLoop = choiceFromTable<LoopEntry>({
  id: `${TOPIC}.feedback-loop`,
  topicId: TOPIC,
  rows: LOOPS,
  subtopic: REGULATION,
  tags: ["homeostaza", "regulacja-hormonalna"],
  difficulty: tier,
  shift: 1,
  question: (l, lang) =>
    lang === "pl"
      ? `Sytuacja: ${l.stimulus.pl}. Który hormon zostanie wydzielony?`
      : `Ситуация: ${l.stimulus.ru}. Какой гормон будет выделен?`,
  optionText: (l, lang) => l.hormone[lang],
  misconception: {
    pl: "hormon o przeciwnym działaniu albo z innej pętli regulacyjnej",
    ru: "гормон с противоположным действием или из другой петли регуляции",
  },
  solution: (l, lang) =>
    lang === "pl"
      ? `Odpowiedź: ${l.hormone.pl}. Skutek: ${l.response.pl}. To ujemne sprzężenie zwrotne — skutek znosi bodziec, który go wywołał.`
      : `Ответ: ${l.hormone.ru}. Результат: ${l.response.ru}. Это отрицательная обратная связь — результат гасит вызвавший его стимул.`,
});

const loopToEffect = choiceFromTable<LoopEntry>({
  id: `${TOPIC}.loop-to-effect`,
  topicId: TOPIC,
  rows: LOOPS,
  subtopic: REGULATION,
  tags: ["homeostaza", "regulacja-hormonalna"],
  difficulty: tier,
  shift: 3,
  question: (l, lang) =>
    lang === "pl"
      ? `Hormon: ${l.hormone.pl}. Co dzieje się w organizmie, gdy ${l.stimulus.pl}?`
      : `Гормон: ${l.hormone.ru}. Что происходит в организме, когда ${l.stimulus.ru}?`,
  optionText: (l, lang) => l.response[lang],
  misconception: { pl: "skutek działania innego hormonu", ru: "результат действия другого гормона" },
  solution: (l, lang) =>
    lang === "pl" ? `${cap(l.hormone.pl)}: ${l.response.pl}.` : `${cap(l.hormone.ru)}: ${l.response.ru}.`,
});

export const lo3HormonesTemplates: RowTemplate[] = [
  glandToHormone,
  hormoneToAction,
  hormoneToGland,
  actionToHormone,
  disorderToDisease,
  symptomToDisease,
  feedbackLoop,
  loopToEffect,
];
