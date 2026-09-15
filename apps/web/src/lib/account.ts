import type { Grade, Lang, Level } from "@portal/core";

/** Minimum age to use the portal without a parent/guardian's consent. */
export const CONSENT_AGE = 16;

/**
 * Only the birth year is known, so be conservative: consent is required whenever the student
 * may still be under 16 this year (e.g. born 2010 → needed throughout 2026).
 */
export function needsParentalConsent(birthYear: number | null | undefined, now = new Date()): boolean {
  if (birthYear == null) return false;
  return now.getFullYear() - birthYear <= CONSENT_AGE;
}

/** Selectable birth years, newest first (API accepts 1990–2030). */
export function birthYears(now = new Date()): number[] {
  const newest = Math.min(now.getFullYear() - 5, 2030);
  const years: number[] = [];
  for (let y = newest; y >= 1990; y--) years.push(y);
  return years;
}

/** Only same-site paths are allowed in ?next= (no open redirects). */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

const LOCALES: Record<Lang, string> = { ru: "ru-RU", en: "en-GB", pl: "pl-PL" };

export function formatDateTime(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatDate(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: "medium" }).format(date);
}

export const percent = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

/** "sp7" → { school: "sp", n: "7" } */
export const splitGrade = (grade: Grade) => ({ school: grade.slice(0, 2) as "sp" | "lo", n: grade.slice(2) });

export type GradeLevel = { grade: Grade; level?: Level | null };
