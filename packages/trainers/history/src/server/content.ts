// Everything history serves, rendered in one place: the pool sync, the CLI and the coverage
// generator all read this, so they cannot disagree about what the content is.
import type { Grade, Level } from "@portal/core";
import { getParagraph } from "../curriculum/index.ts";
import { HIST_LANGS } from "../lang.ts";
import { ALL_TEMPLATES, renderTemplates, type RenderStats, type RenderedTask } from "./templates/index.ts";
import type { HistLang } from "../lang.ts";

/** Substitutions kept per template. Every row table is smaller, so in practice: all of it. */
export const TARGET = 40;

/**
 * The pool keys tasks by class and level, and both follow from the task's paragraph: the book it is
 * in decides the class (curriculum/books.ts). A task outside every paragraph is a content bug that
 * the render tests catch; it is filed nowhere rather than under a guessed class.
 */
export function poolPlace(topicId: string): { grade: Grade; level?: Level } | undefined {
  const paragraph = getParagraph(topicId);
  return paragraph && { grade: paragraph.grade, level: paragraph.level };
}

export interface Content {
  tasks: RenderedTask<HistLang>[];
  perTemplate: RenderStats[];
}

export function renderContent(): Content {
  return renderTemplates(ALL_TEMPLATES, { langs: [...HIST_LANGS], targetCount: TARGET });
}
