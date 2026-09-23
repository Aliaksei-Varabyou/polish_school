// Everything biology serves, rendered in one place: the pool sync, the CLI and the coverage
// generator all read this, so they cannot disagree about what the content is.
import type { Grade, Level } from "@portal/core";
import { BIO_LANGS } from "../lang.ts";
import { ALL_TEMPLATES, renderTemplates, type RenderStats, type RenderedTask } from "./templates/index.ts";
import type { BioLang } from "../lang.ts";

/** Substitutions kept per template. Every row table is smaller, so in practice: all of it. */
export const TARGET = 40;

/** The whole trainer is one year of one track — see curriculum/lo.ts. */
export const GRADE: Grade = "lo3";
export const LEVEL: Level = "R";

export interface Content {
  tasks: RenderedTask<BioLang>[];
  perTemplate: RenderStats[];
}

export function renderContent(): Content {
  return renderTemplates(ALL_TEMPLATES, { langs: [...BIO_LANGS], targetCount: TARGET });
}
