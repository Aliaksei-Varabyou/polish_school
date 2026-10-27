import type { Lang } from "@portal/core";

/**
 * History content is authored in Polish and Russian only. The portal UI still offers English, but
 * there are no English tasks in the pool, so the trainer declares `contentLangs` and its start page
 * asks which of these two to run the session in.
 */
export const HIST_LANGS = ["pl", "ru"] as const;
export type HistLang = (typeof HIST_LANGS)[number];

export const isHistLang = (lang: Lang): lang is HistLang => (HIST_LANGS as readonly string[]).includes(lang);

/** Falls back to Polish, the language of the curriculum itself. */
export const toHistLang = (lang: Lang): HistLang => (isHistLang(lang) ? lang : "pl");
