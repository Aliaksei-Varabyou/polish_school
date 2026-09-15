import type { Difficulty, FeedbackRequest, Grade, Lang, Level, Topic } from "@matema/shared";

export type TaskKind = "input" | "choice";

/** One task to generate. A batch may mix topics. */
export interface TaskSlot {
  topic: Topic;
  difficulty: Difficulty;
  kind: TaskKind;
}

export interface TaskBatchInput {
  lang: Lang;
  grade: Grade;
  level?: Level;
  slots: TaskSlot[];
}

export interface LLMProvider {
  readonly name: string;
  /** Returns raw (unvalidated) task objects; each should carry the topicId it was generated for. */
  generateTasks(input: TaskBatchInput): Promise<unknown[]>;
  /** Returns raw (unvalidated) FeedbackResponse-like object. */
  generateFeedback(input: FeedbackRequest): Promise<unknown>;
}

/** Non-retryable error (bad key, unknown model, invalid request) — retrying won't help. */
export class FatalLLMError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "FatalLLMError";
  }
}

export class RateLimitError extends Error {
  constructor(
    message = "LLM rate limit exceeded",
    public retryAfterMs?: number,
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}
