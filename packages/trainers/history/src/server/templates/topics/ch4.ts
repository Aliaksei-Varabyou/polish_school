// Chapter IV tasks: for each paragraph a table of terms and people (two tasks per row) and a table
// of dates (two tasks per row). See data/ch4.ts for the content.
import { P } from "../../../curriculum/sp6.ts";
import { datesFromTable, DESCRIPTION, ENTRY, NAME_IT, pairFromTable, WHAT_OR_WHO, type Bi, type HistTemplate } from "../tableTemplate.ts";
import {
  ABSOLUTISM,
  ABSOLUTISM_DATES,
  ENGLAND,
  ENGLAND_DATES,
  ENLIGHTENMENT,
  ENLIGHTENMENT_DATES,
  POWERS,
  POWERS_DATES,
  REPUBLIC,
  REPUBLIC_DATES,
  REVOLUTION,
  REVOLUTION_DATES,
  USA,
  USA_DATES,
} from "../data/ch4.ts";
import type { DatedEvent, NamedEntry } from "../tableTemplate.ts";

const CHAPTER = "history.sp6.europe";

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
    paragraph: P.europe.absolutism,
    slug: "absolutism",
    rows: ABSOLUTISM,
    dates: ABSOLUTISM_DATES,
    subtopic: { pl: "absolutyzm we Francji", ru: "абсолютизм во Франции" },
    misconception: { pl: "inna postać albo pojęcie z czasów Ludwika XIV", ru: "другой деятель или понятие эпохи Людовика XIV" },
  },
  {
    paragraph: P.europe.england,
    slug: "england",
    rows: ENGLAND,
    dates: ENGLAND_DATES,
    subtopic: { pl: "monarchia parlamentarna w Anglii", ru: "парламентская монархия в Англии" },
    misconception: { pl: "inna postać albo pojęcie z dziejów Anglii XVII wieku", ru: "другой деятель или понятие из истории Англии XVII века" },
  },
  {
    paragraph: P.europe.enlightenment,
    slug: "enlightenment",
    rows: ENLIGHTENMENT,
    dates: ENLIGHTENMENT_DATES,
    subtopic: { pl: "oświecenie", ru: "Просвещение" },
    misconception: { pl: "inny myśliciel albo pojęcie oświecenia", ru: "другой мыслитель или понятие Просвещения" },
  },
  {
    paragraph: P.europe.powers,
    slug: "powers",
    rows: POWERS,
    dates: POWERS_DATES,
    subtopic: { pl: "Rosja, Prusy i Austria w XVIII wieku", ru: "Россия, Пруссия и Австрия в XVIII веке" },
    misconception: { pl: "inny władca albo pojęcie z dziejów nowych potęg", ru: "другой правитель или понятие из истории новых держав" },
  },
  {
    paragraph: P.europe.usa,
    slug: "usa",
    rows: USA,
    dates: USA_DATES,
    subtopic: { pl: "powstanie Stanów Zjednoczonych", ru: "возникновение Соединённых Штатов" },
    misconception: { pl: "inna postać albo pojęcie z wojny o niepodległość USA", ru: "другой деятель или понятие из войны за независимость США" },
  },
  {
    paragraph: P.europe.revolution,
    slug: "revolution",
    rows: REVOLUTION,
    dates: REVOLUTION_DATES,
    subtopic: { pl: "początek rewolucji francuskiej", ru: "начало Французской революции" },
    misconception: { pl: "inna postać albo pojęcie z 1789 roku", ru: "другой деятель или понятие 1789 года" },
  },
  {
    paragraph: P.europe.republic,
    slug: "republic",
    rows: REPUBLIC,
    dates: REPUBLIC_DATES,
    subtopic: { pl: "republika i terror we Francji", ru: "республика и террор во Франции" },
    misconception: { pl: "inna postać albo pojęcie z czasów republiki i terroru", ru: "другой деятель или понятие времён республики и террора" },
  },
];

export const ch4Templates: HistTemplate[] = TABLES.flatMap(({ paragraph, slug, rows, dates, subtopic, misconception }, i) => [
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
