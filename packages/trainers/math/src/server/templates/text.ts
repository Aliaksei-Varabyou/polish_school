import type { Lang } from "@portal/core";
import type { PluralForms } from "./types.ts";

const pluralRules: Record<Lang, Intl.PluralRules> = {
  ru: new Intl.PluralRules("ru"),
  pl: new Intl.PluralRules("pl"),
  en: new Intl.PluralRules("en"),
};

/**
 * Grammatically correct noun form for a count, per language — solves the RU/PL declension problem
 * flagged in docs/template-feasibility-sp5-lo2.md without hand-writing per-language logic per template.
 * Example: plural("ru", 5, { one: "ученик", few: "ученика", many: "учеников", other: "ученика" }).
 */
export function plural(lang: Lang, count: number, forms: PluralForms): string {
  const rule = pluralRules[lang].select(count);
  return forms[rule] ?? forms.other;
}

/** "2.5" -> "2,5" for ru/pl; unchanged for en. Only touches plain decimal numbers, not expressions. */
export function fmtNumber(n: number, lang: Lang): string {
  const s = Number.isInteger(n) ? String(n) : n.toString();
  return lang === "en" ? s : s.replace(".", ",");
}
