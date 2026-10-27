// Chapter I tasks: for each paragraph a table of terms and people (two tasks per row) and a table
// of dates (two tasks per row). See data/ch1.ts for the content.
import { P } from "../../../curriculum/sp6.ts";
import { datesFromTable, DESCRIPTION, ENTRY, NAME_IT, pairFromTable, WHAT_OR_WHO, type Bi, type HistTemplate } from "../tableTemplate.ts";
import {
  CATHOLIC_REFORM,
  CATHOLIC_REFORM_DATES,
  DISCOVERIES,
  DISCOVERIES_DATES,
  REFORMATION,
  REFORMATION_DATES,
  RENAISSANCE,
  RENAISSANCE_DATES,
} from "../data/ch1.ts";
import type { DatedEvent, NamedEntry } from "../tableTemplate.ts";

const CHAPTER = "history.sp6.modern";

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
    paragraph: P.modern.discoveries,
    slug: "discoveries",
    rows: DISCOVERIES,
    dates: DISCOVERIES_DATES,
    subtopic: { pl: "wielkie odkrycia geograficzne", ru: "великие географические открытия" },
    misconception: { pl: "inny żeglarz, lud albo pojęcie z tego samego tematu", ru: "другой мореплаватель, народ или понятие из той же темы" },
  },
  {
    paragraph: P.modern.renaissance,
    slug: "renaissance",
    rows: RENAISSANCE,
    dates: RENAISSANCE_DATES,
    subtopic: { pl: "renesans i humanizm", ru: "Возрождение и гуманизм" },
    misconception: { pl: "inny twórca albo pojęcie renesansu", ru: "другой деятель или понятие Возрождения" },
  },
  {
    paragraph: P.modern.reformation,
    slug: "reformation",
    rows: REFORMATION,
    dates: REFORMATION_DATES,
    subtopic: { pl: "reformacja", ru: "Реформация" },
    misconception: { pl: "inny reformator albo pojęcie reformacji", ru: "другой реформатор или понятие Реформации" },
  },
  {
    paragraph: P.modern["catholic-reform"],
    slug: "catholic-reform",
    rows: CATHOLIC_REFORM,
    dates: CATHOLIC_REFORM_DATES,
    subtopic: { pl: "reforma Kościoła katolickiego", ru: "реформа католической церкви" },
    misconception: { pl: "inne pojęcie z dziejów kontrreformacji", ru: "другое понятие из истории Контрреформации" },
  },
];

export const ch1Templates: HistTemplate[] = TABLES.flatMap(({ paragraph, slug, rows, dates, subtopic, misconception }, i) => [
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
