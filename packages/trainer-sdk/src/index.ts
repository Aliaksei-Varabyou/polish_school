// Trainer contract shared by the portal (web), the API and every subject trainer.
import type { LLMClient } from "@portal/ai";
import type { FeedbackRequest, Grade, Lang, Level, SessionTaskRecord, Task, TaskBatchInput, Topic } from "@portal/core";
import type { TaskPoolStore } from "@portal/task-pool";
import type { ComponentType } from "react";

export interface VerifyContext {
  /** topics requested in the batch; the task's topicId must be one of them */
  allowedTopicIds: string[];
  answerMode: "input" | "choice" | "mixed";
  /** deterministic id to use instead of a random one (offline template rendering) */
  id?: string;
}

export type VerifyResult = { ok: true; task: Task } | { ok: false; reason: string };

/** Minimal logging surface, so trainers don't depend on the server's logger type. */
export interface Logger {
  info(obj: object, msg: string): void;
  warn(obj: object, msg: string): void;
  error(obj: object, msg: string): void;
}

/** Server side of a trainer: curriculum, AI prompts and task verification. */
export interface TrainerServer {
  id: string;
  /**
   * false for trainers whose content is rendered offline from templates: the generation pipeline
   * then skips the LLM rounds entirely instead of burning three empty ones. Default true.
   */
  usesLLM?: boolean;
  /**
   * Share of tasks taken from the pool (0..1). Set by trainers that have a hard requirement —
   * an offline trainer sets 1 — and it takes precedence over the deployment-wide default, which
   * only makes sense for trainers that can fall back to generating.
   */
  reuseRatio?: number;
  topicsFor(grade: Grade, level?: Level): Topic[];
  getTopic(id: string): Topic | undefined;
  /**
   * Gives the trainer a chance to fill an empty pool before a session is assembled — for a trainer
   * whose content is rendered rather than generated, this is what makes a deploy self-sufficient.
   * Called at most once per request, and a failure only costs tasks, never the session.
   */
  ensureContent?(pool: TaskPoolStore, log?: Logger): Promise<void>;
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
  /**
   * Languages this trainer actually has tasks in. Omitted means every portal language; a trainer
   * whose content is authored in fewer (biology: pl and ru) lists them, and its start page asks
   * which one to run the session in when the portal is set to another.
   */
  contentLangs?: Lang[];
  /** i18next resources registered under the namespace = trainer id */
  translations: Record<Lang, Record<string, unknown>>;
  /** topic names for history and progress pages */
  topicName(topicId: string, lang: Lang): string;
  load(): Promise<{ default: ComponentType<TrainerAppProps> }>;
  loadReview(): Promise<{ default: ComponentType<TrainerReviewProps> }>;
}
