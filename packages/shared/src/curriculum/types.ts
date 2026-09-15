import type { Grade, Lang, Level } from "../schemas.ts";

export interface Topic {
  id: string;
  grade: Grade;
  /** Liceum only: "P" topics are available on both levels, "R" topics only on poziom rozszerzony. */
  level?: Level;
  name: Record<Lang, string>;
  /** Polish curriculum terms — used in LLM prompts. */
  subtopics: string[];
}

export function topic(
  id: string,
  grade: Grade,
  names: [pl: string, ru: string, en: string],
  subtopics: string[],
  level?: Level,
): Topic {
  const [pl, ru, en] = names;
  return { id, grade, level, name: { pl, ru, en }, subtopics };
}
