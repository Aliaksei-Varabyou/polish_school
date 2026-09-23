import type { Lang } from "@portal/core";

/**
 * Biology content is authored in Polish and Russian only. The portal UI still offers English, but
 * there are no English tasks in the pool, so the trainer declares `contentLangs` and its start page
 * asks which of these two to run the session in.
 */
export const BIO_LANGS = ["pl", "ru"] as const;
export type BioLang = (typeof BIO_LANGS)[number];

export const isBioLang = (lang: Lang): lang is BioLang => (BIO_LANGS as readonly string[]).includes(lang);

/** Falls back to Polish, the language of the curriculum itself. */
export const toBioLang = (lang: Lang): BioLang => (isBioLang(lang) ? lang : "pl");
