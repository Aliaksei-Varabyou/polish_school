// Server-only part of the history trainer. There is no LLM on any code path here: tasks come from
// the pool (filled offline by scripts/renderTemplates.ts) and the session feedback is rule-based.
import type { LLMClient } from "@portal/ai";
import type { FeedbackRequest } from "@portal/core";
import type { TrainerServer } from "@portal/trainer-sdk";
import { checkAnswer } from "../answer.ts";
import { getTopic, topicsFor } from "../curriculum/index.ts";
import { buildFeedback } from "./feedback.ts";
import { ensureContent } from "./seed.ts";
import { verifyTask } from "./verifyTask.ts";

export { verifyTask, type VerifyContext, type VerifyResult } from "./verifyTask.ts";
export { buildFeedback } from "./feedback.ts";
export { ensureContent } from "./seed.ts";

export const historyTrainer: TrainerServer = {
  id: "history",
  usesLLM: false,
  // the pool is the only source of tasks, so drain it for the whole batch instead of half of it
  reuseRatio: 1,
  topicsFor,
  getTopic,
  // no LLM to fall back on, so an empty pool is filled from the templates on first use
  ensureContent,
  generateTaskBatch: async () => [],
  verifyTask,
  checkAnswer,
  generateFeedback: async (_client: LLMClient, input: FeedbackRequest) => buildFeedback(input),
};
