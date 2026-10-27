// Row builders shared by every chapter's tables. Descriptions are written for 11–12-year-olds: one
// idea each, in the textbook's own vocabulary; names in the nominative so the question frames fit.
import type { Difficulty } from "@portal/core";
import type { DatedEvent, NamedEntry } from "../tableTemplate.ts";

type Pair = readonly [pl: string, ru: string];

/** One row: id, name, what it is or who it was, difficulty, then other accepted names in each language. */
export const named = (id: string, name: Pair, role: Pair, tier: Difficulty, aliasesPl: string[] = [], aliasesRu: string[] = []): NamedEntry => ({
  id,
  name: { pl: name[0], ru: name[1] },
  role: { pl: role[0], ru: role[1] },
  aliases: { pl: aliasesPl, ru: aliasesRu },
  tier,
});

/** One dated row: id, the event, its year, one sentence of context, difficulty, other names of the event. */
export const dated = (id: string, name: Pair, year: number, note: Pair, tier: Difficulty, aliasesPl: string[] = [], aliasesRu: string[] = []): DatedEvent => ({
  id,
  name: { pl: name[0], ru: name[1] },
  year,
  note: { pl: note[0], ru: note[1] },
  aliases: { pl: aliasesPl, ru: aliasesRu },
  tier,
});
