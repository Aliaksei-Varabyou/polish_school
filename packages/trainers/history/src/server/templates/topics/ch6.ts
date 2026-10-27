// Chapter VI tasks: for each paragraph a table of terms and people (two tasks per row) and a table
// of dates (two tasks per row). See data/ch6.ts for the content.
import { P } from "../../../curriculum/sp6.ts";
import { datesFromTable, DESCRIPTION, ENTRY, NAME_IT, pairFromTable, WHAT_OR_WHO, type Bi, type HistTemplate } from "../tableTemplate.ts";
import { CONQUESTS, CONQUESTS_DATES, DUCHY, DUCHY_DATES, LEGIONS, LEGIONS_DATES } from "../data/ch6.ts";
import type { DatedEvent, NamedEntry } from "../tableTemplate.ts";

const CHAPTER = "history.sp6.napoleon";

interface Table {
  paragraph: string;
  slug: string;
  rows: readonly NamedEntry[];
  dates: readonly DatedEvent[];
  subtopic: Bi;
  misconception: Bi;
}

/**
 * Terms and people sit in one table so that a person's distractors can be other people of the
 * paragraph and a term's other terms — the neighbours in the table are the likely confusions.
 */
const TABLES: Table[] = [
  {
    paragraph: P.napoleon.conquests,
    slug: "conquests",
    rows: CONQUESTS,
    dates: CONQUESTS_DATES,
    subtopic: { pl: "Napoleon Bonaparte i wojny napoleońskie", ru: "Наполеон Бонапарт и наполеоновские войны" },
    misconception: { pl: "inna bitwa, postać albo pojęcie z czasów Napoleona", ru: "другая битва, личность или понятие эпохи Наполеона" },
  },
  {
    paragraph: P.napoleon.legions,
    slug: "legions",
    rows: LEGIONS,
    dates: LEGIONS_DATES,
    subtopic: { pl: "Legiony Polskie i Mazurek Dąbrowskiego", ru: "Польские легионы и Мазурка Домбровского" },
    misconception: { pl: "inna postać albo pojęcie z dziejów Legionów", ru: "другая личность или понятие из истории легионов" },
  },
  {
    paragraph: P.napoleon.duchy,
    slug: "duchy",
    rows: DUCHY,
    dates: DUCHY_DATES,
    subtopic: { pl: "Księstwo Warszawskie", ru: "Варшавское герцогство" },
    misconception: { pl: "inna postać, dokument albo pojęcie z dziejów Księstwa Warszawskiego", ru: "другая личность, документ или понятие из истории Варшавского герцогства" },
  },
];

export const ch6Templates: HistTemplate[] = TABLES.flatMap(({ paragraph, slug, rows, dates, subtopic, misconception }, i) => [
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
  ...datesFromTable({ topicId: CHAPTER, paragraph, slug, rows: dates, subtopic, shift: i + 1 }),
]);
