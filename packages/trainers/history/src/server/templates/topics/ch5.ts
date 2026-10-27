// Chapter V tasks: for each paragraph a table of terms and people (two tasks per row) and a table
// of dates (two tasks per row). See data/ch5.ts for the content.
import { P } from "../../../curriculum/sp6.ts";
import { datesFromTable, DESCRIPTION, ENTRY, NAME_IT, pairFromTable, WHAT_OR_WHO, type Bi, type HistTemplate } from "../tableTemplate.ts";
import {
  COLLAPSE,
  COLLAPSE_DATES,
  CONSTITUTION,
  CONSTITUTION_DATES,
  LAST_KING,
  LAST_KING_DATES,
  SAXON,
  SAXON_DATES,
  SECOND_PARTITION,
  SECOND_PARTITION_DATES,
  STANISLAUS,
  STANISLAUS_DATES,
} from "../data/ch5.ts";
import type { DatedEvent, NamedEntry } from "../tableTemplate.ts";

const CHAPTER = "history.sp6.fall";

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
    paragraph: P.fall.saxon,
    slug: "saxon",
    rows: SAXON,
    dates: SAXON_DATES,
    subtopic: { pl: "czasy saskie", ru: "саксонские времена" },
    misconception: { pl: "inny władca, wydarzenie albo pojęcie z czasów saskich", ru: "другой правитель, событие или понятие саксонских времён" },
  },
  {
    paragraph: P.fall["last-king"],
    slug: "last-king",
    rows: LAST_KING,
    dates: LAST_KING_DATES,
    subtopic: { pl: "Stanisław August i I rozbiór", ru: "Станислав Август и первый раздел" },
    misconception: { pl: "inna postać albo pojęcie z początku panowania Stanisława Augusta", ru: "другой деятель или понятие начала правления Станислава Августа" },
  },
  {
    paragraph: P.fall.stanislaus,
    slug: "stanislaus",
    rows: STANISLAUS,
    dates: STANISLAUS_DATES,
    subtopic: { pl: "oświecenie w Polsce", ru: "Просвещение в Польше" },
    misconception: { pl: "inny twórca, instytucja albo pojęcie czasów stanisławowskich", ru: "другой деятель, учреждение или понятие эпохи Станислава Августа" },
  },
  {
    paragraph: P.fall.constitution,
    slug: "constitution",
    rows: CONSTITUTION,
    dates: CONSTITUTION_DATES,
    subtopic: { pl: "Sejm Wielki i Konstytucja 3 maja", ru: "Великий сейм и Конституция 3 мая" },
    misconception: { pl: "inna postać, stronnictwo albo reforma Sejmu Wielkiego", ru: "другой деятель, партия или реформа Великого сейма" },
  },
  {
    paragraph: P.fall["second-partition"],
    slug: "second-partition",
    rows: SECOND_PARTITION,
    dates: SECOND_PARTITION_DATES,
    subtopic: { pl: "Targowica i II rozbiór", ru: "Тарговица и второй раздел" },
    misconception: { pl: "inna postać, bitwa albo pojęcie z wojny 1792 roku", ru: "другой деятель, битва или понятие войны 1792 года" },
  },
  {
    paragraph: P.fall.collapse,
    slug: "collapse",
    rows: COLLAPSE,
    dates: COLLAPSE_DATES,
    subtopic: { pl: "insurekcja kościuszkowska i III rozbiór", ru: "восстание Костюшко и третий раздел" },
    misconception: { pl: "inna postać, bitwa albo pojęcie z powstania kościuszkowskiego", ru: "другой деятель, битва или понятие восстания Костюшко" },
  },
];

export const ch5Templates: HistTemplate[] = TABLES.flatMap(({ paragraph, slug, rows, dates, subtopic, misconception }, i) => [
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
