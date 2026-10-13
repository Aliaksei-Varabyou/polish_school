// Compact row builders for the tables that fill the paragraphs the first content pass left empty.
// A row is written as one tuple per line, which keeps a ten-row bilingual table readable.
import type { Difficulty } from "@portal/core";
import type { Bi, NamedEntry } from "../tableTemplate.ts";

/** [id, name pl, name ru, description pl, description ru, tier, aliases pl, aliases ru] */
export type NamedRow = readonly [string, string, string, string, string, Difficulty, (readonly string[])?, (readonly string[])?];

/** A "name / description" table filed under one paragraph. */
export function namedTable(paragraph: string, rows: readonly NamedRow[]): NamedEntry[] {
  return rows.map(([id, namePl, nameRu, rolePl, roleRu, tier, aliasesPl = [], aliasesRu = []]) => ({
    id,
    paragraph,
    name: { pl: namePl, ru: nameRu },
    role: { pl: rolePl, ru: roleRu },
    aliases: { pl: [...aliasesPl], ru: [...aliasesRu] },
    tier,
  }));
}

/** The groups a disease is sorted into in the "which kind" question. */
export const KINDS = {
  bacterial: { pl: "choroba bakteryjna", ru: "бактериальная болезнь" },
  viral: { pl: "choroba wirusowa", ru: "вирусная болезнь" },
  parasitic: { pl: "choroba pasożytnicza", ru: "паразитарная болезнь" },
  autoimmune: { pl: "choroba autoimmunologiczna", ru: "аутоиммунная болезнь" },
  allergic: { pl: "choroba alergiczna", ru: "аллергическая болезнь" },
  hypersensitivity: { pl: "nadwrażliwość (reakcja alergiczna)", ru: "гиперчувствительность (аллергическая реакция)" },
  cancer: { pl: "nowotwór złośliwy", ru: "злокачественная опухоль" },
  genetic: { pl: "choroba genetyczna", ru: "генетическое заболевание" },
  lifestyle: { pl: "choroba cywilizacyjna", ru: "болезнь цивилизации" },
  degenerative: { pl: "choroba zwyrodnieniowa", ru: "дегенеративное заболевание" },
  deficiency: { pl: "choroba z niedoboru", ru: "болезнь, вызванная недостатком питательных веществ" },
  metabolic: { pl: "choroba metaboliczna", ru: "болезнь обмена веществ" },
  injury: { pl: "uraz mechaniczny", ru: "механическая травма" },
  posture: { pl: "wada postawy", ru: "нарушение осанки" },
  psychic: { pl: "zaburzenie psychiczne", ru: "психическое расстройство" },
  toxic: { pl: "uszkodzenie toksyczne", ru: "токсическое поражение" },
  environmental: { pl: "choroba zawodowa i środowiskowa", ru: "профессиональная и экологическая болезнь" },
  hormonal: { pl: "zaburzenie hormonalne", ru: "гормональное нарушение" },
  complication: { pl: "powikłanie innych chorób", ru: "осложнение других болезней" },
  brain: { pl: "napadowe zaburzenie czynności mózgu", ru: "пароксизмальное расстройство работы мозга" },
  acquiredImmunodeficiency: { pl: "nabyty niedobór odporności", ru: "приобретённый иммунодефицит" },
  congenitalImmunodeficiency: { pl: "wrodzony niedobór odporności", ru: "врождённый иммунодефицит" },
  rejection: { pl: "reakcja na obce antygeny tkankowe", ru: "реакция на чужие тканевые антигены" },
} satisfies Record<string, Bi>;

export type Kind = keyof typeof KINDS;

export interface Disorder {
  id: string;
  paragraph: string;
  name: Bi;
  kind: Kind;
  cause: Bi;
  sign: Bi;
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

/** [id, name pl, name ru, kind, cause pl, cause ru, signs pl, signs ru, tier, aliases pl, aliases ru] */
export type DisorderRow = readonly [
  string,
  string,
  string,
  Kind,
  string,
  string,
  string,
  string,
  Difficulty,
  (readonly string[])?,
  (readonly string[])?,
];

export function disorderTable(paragraph: string, rows: readonly DisorderRow[]): Disorder[] {
  return rows.map(([id, namePl, nameRu, kind, causePl, causeRu, signPl, signRu, tier, aliasesPl = [], aliasesRu = []]) => ({
    id,
    paragraph,
    name: { pl: namePl, ru: nameRu },
    kind,
    cause: { pl: causePl, ru: causeRu },
    sign: { pl: signPl, ru: signRu },
    aliases: { pl: [...aliasesPl], ru: [...aliasesRu] },
    tier,
  }));
}
