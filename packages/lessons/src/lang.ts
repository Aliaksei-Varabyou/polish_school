/** The languages interactive lessons are written in — the same two every content trainer serves. */
export const CONTENT_LANGS = ["pl", "ru"] as const;
export type ContentLang = (typeof CONTENT_LANGS)[number];
