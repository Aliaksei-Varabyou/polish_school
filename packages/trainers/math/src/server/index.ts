// Server-only part of the math trainer: prompts, AI calls and task verification.
import type { LLMClient } from "@portal/ai";
import type { FeedbackRequest, TaskBatchInput } from "@portal/core";
import { mockFeedback, mockTasks } from "./mock.ts";
import { buildFeedbackPrompt, FEEDBACK_JSON_SCHEMA, FEEDBACK_SYSTEM_PROMPT } from "./prompts/feedback.ts";
import { buildTasksPrompt, tasksJsonSchema, TASKS_SYSTEM_PROMPT } from "./prompts/generateTasks.ts";

export { verifyTask, type VerifyContext, type VerifyResult } from "./verifyTask.ts";
export { mockFeedback, mockTasks } from "./mock.ts";
export { buildFeedbackPrompt, buildTasksPrompt };

/** Generates one batch of raw (not yet verified) tasks; topics may be mixed within the batch. */
export async function generateTaskBatch(client: LLMClient, input: TaskBatchInput): Promise<unknown[]> {
  const topicIds = [...new Set(input.slots.map((s) => s.topic.id))];
  const json = await client.generateJson({
    system: TASKS_SYSTEM_PROMPT,
    prompt: buildTasksPrompt(input),
    schema: tasksJsonSchema(topicIds),
    temperature: 0.9,
    mock: () => ({ tasks: mockTasks(input) }),
  });
  const tasks = (json as { tasks?: unknown }).tasks;
  return Array.isArray(tasks) ? tasks : [];
}

/** Returns a raw FeedbackResponse-like object (validated by the caller). */
export function generateFeedback(client: LLMClient, input: FeedbackRequest): Promise<unknown> {
  return client.generateJson({
    system: FEEDBACK_SYSTEM_PROMPT,
    prompt: buildFeedbackPrompt(input),
    schema: FEEDBACK_JSON_SCHEMA,
    temperature: 0.5,
    mock: () => mockFeedback(input),
  });
}
