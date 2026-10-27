// Chapter III tasks: for each paragraph a table of terms, people and places (two tasks per row) and
// a table of dates (two tasks per row). See data/ch3.ts for the content.
import { P } from "../../../curriculum/sp6.ts";
import { datesFromTable, DESCRIPTION, ENTRY, NAME_IT, pairFromTable, WHAT_OR_WHO, type Bi, type HistTemplate } from "../tableTemplate.ts";
import { BAROQUE, BAROQUE_DATES, CRISIS, CRISIS_DATES, DELUGE, DELUGE_DATES, KHMELNYTSKY, KHMELNYTSKY_DATES, SWEDEN, SWEDEN_DATES, TURKEY, TURKEY_DATES, VIENNA, VIENNA_DATES } from "../data/ch3.ts";
import type { DatedEvent, NamedEntry } from "../tableTemplate.ts";

const CHAPTER = "history.sp6.wars";

interface Table {
  paragraph: string;
  slug: string;
  rows: readonly NamedEntry[];
  dates: readonly DatedEvent[];
  subtopic: Bi;
  misconception: Bi;
}

/**
 * Terms, people, places and treaties sit in one table so that a person's distractors can be other
 * people of the paragraph and a battle's other battles — the neighbours in the table are the likely
 * confusions.
 */
const TABLES: Table[] = [
  {
    paragraph: P.wars.sweden,
    slug: "sweden",
    rows: SWEDEN,
    dates: SWEDEN_DATES,
    subtopic: {
      pl: "wojny ze Szwecją i z Moskwą",
      ru: "войны со Швецией и с Москвой",
    },
    misconception: {
      pl: "inna postać, bitwa albo pojęcie z wojen ze Szwecją i z Moskwą",
      ru: "другое лицо, битва или понятие из войн со Швецией и с Москвой",
    },
  },
  {
    paragraph: P.wars.turkey,
    slug: "turkey",
    rows: TURKEY,
    dates: TURKEY_DATES,
    subtopic: {
      pl: "konflikty z Turcją i ze Szwecją",
      ru: "конфликты с Турцией и со Швецией",
    },
    misconception: {
      pl: "inna postać, bitwa albo układ z wojen z Turcją i ze Szwecją",
      ru: "другое лицо, битва или договор из войн с Турцией и со Швецией",
    },
  },
  {
    paragraph: P.wars.khmelnytsky,
    slug: "khmelnytsky",
    rows: KHMELNYTSKY,
    dates: KHMELNYTSKY_DATES,
    subtopic: { pl: "powstanie Chmielnickiego", ru: "восстание Хмельницкого" },
    misconception: {
      pl: "inna postać, bitwa albo ugoda z powstania Chmielnickiego",
      ru: "другое лицо, битва или соглашение из восстания Хмельницкого",
    },
  },
  {
    paragraph: P.wars.deluge,
    slug: "deluge",
    rows: DELUGE,
    dates: DELUGE_DATES,
    subtopic: { pl: "potop szwedzki", ru: "Шведский потоп" },
    misconception: {
      pl: "inna postać, bitwa albo układ z czasów potopu",
      ru: "другое лицо, битва или договор времён потопа",
    },
  },
  {
    paragraph: P.wars.crisis,
    slug: "crisis",
    rows: CRISIS,
    dates: CRISIS_DATES,
    subtopic: { pl: "kryzys Rzeczypospolitej", ru: "кризис Речи Посполитой" },
    misconception: {
      pl: "inne pojęcie albo postać z dziejów kryzysu Rzeczypospolitej",
      ru: "другое понятие или лицо из истории кризиса Речи Посполитой",
    },
  },
  {
    paragraph: P.wars.vienna,
    slug: "vienna",
    rows: VIENNA,
    dates: VIENNA_DATES,
    subtopic: {
      pl: "wojny z Turcją i odsiecz wiedeńska",
      ru: "войны с Турцией и Венская битва",
    },
    misconception: {
      pl: "inna postać, bitwa albo układ z wojen z Turcją",
      ru: "другое лицо, битва или договор из войн с Турцией",
    },
  },
  {
    paragraph: P.wars.baroque,
    slug: "baroque",
    rows: BAROQUE,
    dates: BAROQUE_DATES,
    subtopic: { pl: "barok i sarmatyzm", ru: "барокко и сарматизм" },
    misconception: {
      pl: "inne pojęcie, twórca albo zabytek baroku i sarmatyzmu",
      ru: "другое понятие, деятель или памятник барокко и сарматизма",
    },
  },
];

export const ch3Templates: HistTemplate[] = TABLES.flatMap(({ paragraph, slug, rows, dates, subtopic, misconception }, i) => [
  ...pairFromTable({
    topicId: CHAPTER,
    paragraph,
    slug,
    rows,
    subtopic,
    misconception,
    shift: i,
    label: ENTRY,
    ask: WHAT_OR_WHO,
    cue: DESCRIPTION,
    recall: NAME_IT,
    explain: true,
  }),
  ...datesFromTable({
    topicId: CHAPTER,
    paragraph,
    slug,
    rows: dates,
    subtopic,
    shift: i + 1,
  }),
]);
