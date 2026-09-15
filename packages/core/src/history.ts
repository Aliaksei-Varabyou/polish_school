// API contract for profiles and practice history (signed-in users).
import { z } from "zod";
import { AnswerMode, FeedbackResponse, Grade, Lang, Level, Task } from "./schemas.ts";

export const SessionSettings = z.object({
  lang: Lang,
  grade: Grade,
  level: Level.optional(),
  topicIds: z.array(z.string()),
  count: z.number().int(),
  answerMode: AnswerMode,
});
export type SessionSettings = z.infer<typeof SessionSettings>;

export const SessionSummary = z.object({
  id: z.string().uuid(),
  trainerId: z.string(),
  settings: SessionSettings,
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  correct: z.number().int(),
  total: z.number().int(),
  answered: z.number().int(),
});
export type SessionSummary = z.infer<typeof SessionSummary>;

export const SessionTaskRecord = z.object({
  position: z.number().int(),
  task: Task,
  userAnswer: z.string().nullable(),
  correct: z.boolean().nullable(),
  usedHint: z.boolean(),
  answeredAt: z.string().nullable(),
});
export type SessionTaskRecord = z.infer<typeof SessionTaskRecord>;

export const SessionDetail = SessionSummary.extend({
  tasks: z.array(SessionTaskRecord),
  feedback: FeedbackResponse.nullable(),
});
export type SessionDetail = z.infer<typeof SessionDetail>;

/** POST /api/sessions/:id/answers — the server re-checks the answer. */
export const AnswerRequest = z.object({
  position: z.number().int().min(0),
  answer: z.string().max(500),
  usedHint: z.boolean().default(false),
});
export type AnswerRequest = z.infer<typeof AnswerRequest>;

export const AnswerResponse = z.object({ correct: z.boolean() });
export type AnswerResponse = z.infer<typeof AnswerResponse>;

export const TopicProgress = z.object({
  trainerId: z.string(),
  topicId: z.string(),
  attempts: z.number().int(),
  correct: z.number().int(),
  lastPracticedAt: z.string(),
});
export type TopicProgress = z.infer<typeof TopicProgress>;

/** GET /api/me/progress */
export const ProgressResponse = z.object({
  sessions: z.number().int(),
  tasksAnswered: z.number().int(),
  correct: z.number().int(),
  topics: z.array(TopicProgress),
});
export type ProgressResponse = z.infer<typeof ProgressResponse>;

/** POST /api/tasks/:taskId/report — "this task is wrong/unclear". */
export const TaskReportRequest = z.object({ reason: z.string().trim().max(500).optional() });
export type TaskReportRequest = z.infer<typeof TaskReportRequest>;

/** GET /api/me/profile */
export const Profile = z.object({
  id: z.string().uuid(),
  email: z.string().nullable(),
  displayName: z.string().nullable(),
  grade: Grade.nullable(),
  level: Level.nullable(),
  uiLang: Lang,
  birthYear: z.number().int().nullable(),
  parentalConsentAt: z.string().nullable(),
});
export type Profile = z.infer<typeof Profile>;

/** PATCH /api/me/profile — every field optional. */
export const ProfileUpdate = z
  .object({
    displayName: z.string().trim().min(1).max(60),
    grade: Grade.nullable(),
    level: Level.nullable(),
    uiLang: Lang,
    birthYear: z.number().int().min(1990).max(2030).nullable(),
    /** the student confirms a parent/guardian agreed (required under 16) */
    parentalConsent: z.boolean(),
  })
  .partial();
export type ProfileUpdate = z.infer<typeof ProfileUpdate>;
