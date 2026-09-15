import type { AnswerMode, Difficulty, FeedbackRequest, Grade, Lang, Level, Topic } from "@matema/shared";

export interface TaskBatchInput {
  lang: Lang;
  grade: Grade;
  level?: Level;
  topic: Topic;
  /** one entry per task to generate */
  difficulties: Difficulty[];
  answerMode: AnswerMode;
}

export interface LLMProvider {
  readonly name: string;
  /** Returns raw (unvalidated) task objects. */
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
  constructor(message = "LLM rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}
