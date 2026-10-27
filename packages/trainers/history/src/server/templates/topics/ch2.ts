// Chapter II tasks: for each paragraph a table of terms, people and places (two tasks per row) and a
// table of dates (two tasks per row). See data/ch2.ts for the content.
import { P } from "../../../curriculum/sp6.ts";
import { datesFromTable, DESCRIPTION, ENTRY, NAME_IT, pairFromTable, WHAT_OR_WHO, type Bi, type HistTemplate } from "../tableTemplate.ts";
import {
  BATORY,
  BATORY_DATES,
  ECONOMY,
  ECONOMY_DATES,
  ELECTION,
  ELECTION_DATES,
  LUBLIN,
  LUBLIN_DATES,
  POLISH_RENAISSANCE,
  POLISH_RENAISSANCE_DATES,
  SIGISMUND,
  SIGISMUND_DATES,
  TOLERANCE,
  TOLERANCE_DATES,
} from "../data/ch2.ts";
import type { DatedEvent, NamedEntry } from "../tableTemplate.ts";

const CHAPTER = "history.sp6.golden";

interface Table {
  paragraph: string;
  slug: string;
  rows: readonly NamedEntry[];
  dates: readonly DatedEvent[];
  subtopic: Bi;
  misconception: Bi;
}

/**
 * Terms, people and places sit in one table so that a person's distractors can be other people of
 * the paragraph and a term's other terms — the neighbours in the table are the likely confusions.
 */
const TABLES: Table[] = [
  {
    paragraph: P.golden.sigismund,
    slug: "sigismund",
    rows: SIGISMUND,
    dates: SIGISMUND_DATES,
    subtopic: {
      pl: "Zygmunt Stary i Zygmunt August",
      ru: "Сигизмунд Старый и Сигизмунд Август",
    },
    misconception: {
      pl: "inna postać, ziemia albo pojęcie z czasów zygmuntowskich",
      ru: "другая личность, земля или понятие эпохи Сигизмундов",
    },
  },
  {
    paragraph: P.golden.tolerance,
    slug: "tolerance",
    rows: TOLERANCE,
    dates: TOLERANCE_DATES,
    subtopic: { pl: "tolerancja religijna", ru: "религиозная терпимость" },
    misconception: {
      pl: "inne wyznanie albo pojęcie z dziejów tolerancji w Polsce",
      ru: "другое исповедание или понятие из истории веротерпимости в Польше",
    },
  },
  {
    paragraph: P.golden.economy,
    slug: "economy",
    rows: ECONOMY,
    dates: ECONOMY_DATES,
    subtopic: { pl: "folwark i pańszczyzna", ru: "фольварк и барщина" },
    misconception: {
      pl: "inne pojęcie z gospodarki dawnej Polski",
      ru: "другое понятие из хозяйства старой Польши",
    },
  },
  {
    paragraph: P.golden.renaissance,
    slug: "renaissance",
    rows: POLISH_RENAISSANCE,
    dates: POLISH_RENAISSANCE_DATES,
    subtopic: { pl: "renesans w Polsce", ru: "Возрождение в Польше" },
    misconception: {
      pl: "inny twórca, dzieło albo budowla polskiego renesansu",
      ru: "другой деятель, произведение или постройка польского Возрождения",
    },
  },
  {
    paragraph: P.golden.lublin,
    slug: "lublin",
    rows: LUBLIN,
    dates: LUBLIN_DATES,
    subtopic: { pl: "unia lubelska", ru: "Люблинская уния" },
    misconception: {
      pl: "inna ziemia, postać albo pojęcie związane z unią",
      ru: "другая земля, личность или понятие, связанное с унией",
    },
  },
  {
    paragraph: P.golden.election,
    slug: "election",
    rows: ELECTION,
    dates: ELECTION_DATES,
    subtopic: { pl: "wolna elekcja", ru: "свободная элекция" },
    misconception: {
      pl: "inne pojęcie albo postać z dziejów wolnej elekcji",
      ru: "другое понятие или личность из истории свободной элекции",
    },
  },
  {
    paragraph: P.golden.batory,
    slug: "batory",
    rows: BATORY,
    dates: BATORY_DATES,
    subtopic: { pl: "Stefan Batory", ru: "Стефан Баторий" },
    misconception: {
      pl: "inna postać, twierdza albo pojęcie z czasów Batorego",
      ru: "другая личность, крепость или понятие времён Батория",
    },
  },
];

export const ch2Templates: HistTemplate[] = TABLES.flatMap(({ paragraph, slug, rows, dates, subtopic, misconception }, i) => [
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
