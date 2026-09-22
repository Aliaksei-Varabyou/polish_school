// Trainer contract shared by the portal (web), the API and every subject trainer.
import type { LLMClient } from "@portal/ai";
import type { FeedbackRequest, Grade, Lang, Level, SessionTaskRecord, Task, TaskBatchInput, Topic } from "@portal/core";
import type { ComponentType } from "react";

export interface VerifyContext {
  /** topics requested in the batch; the task's topicId must be one of them */
  allowedTopicIds: string[];
  answerMode: "input" | "choice" | "mixed";
}

export type VerifyResult = { ok: true; task: Task } | { ok: false; reason: string };

/** Server side of a trainer: curriculum, AI prompts and task verification. */
export interface TrainerServer {
  id: string;
  /**
   * false for trainers whose content is rendered offline from templates: the generation pipeline
   * then skips the LLM rounds entirely instead of burning three empty ones. Default true.
   */
  usesLLM?: boolean;
  /** default share of tasks taken from the pool; offline trainers set 1. Overridden by GenerateDeps. */
  reuseRatio?: number;
  topicsFor(grade: Grade, level?: Level): Topic[];
  getTopic(id: string): Topic | undefined;
  /** Generates one batch of raw (not yet verified) tasks. */
  generateTaskBatch(client: LLMClient, input: TaskBatchInput): Promise<unknown[]>;
  /** Validates shape and re-checks the math/content of a generated task. */
  verifyTask(raw: unknown, ctx: VerifyContext): VerifyResult;
  checkAnswer(task: Task, answer: string): boolean;
  /** Returns a raw FeedbackResponse-like object (validated by the caller). */
  generateFeedback(client: LLMClient, input: FeedbackRequest): Promise<unknown>;
}

export interface TrainerAppProps {
  lang: Lang;
  /** hide the portal language switch while a session is running (tasks are generated in one language) */
  setLanguageLocked(locked: boolean): void;
  /** Supabase access token of the signed-in user, or null for guests; send as `Authorization: Bearer`. */
  getAccessToken(): Promise<string | null>;
}

/** Read-only review of a past session (history page). */
export interface TrainerReviewProps {
  lang: Lang;
  tasks: SessionTaskRecord[];
}

/** Web side of a trainer: catalog entry + lazily loaded app. */
export interface TrainerWeb {
  id: string;
  icon: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  grades: Grade[];
  /** i18next resources registered under the namespace = trainer id */
  translations: Record<Lang, Record<string, unknown>>;
  /** topic names for history and progress pages */
  topicName(topicId: string, lang: Lang): string;
  load(): Promise<{ default: ComponentType<TrainerAppProps> }>;
  loadReview(): Promise<{ default: ComponentType<TrainerReviewProps> }>;
}
