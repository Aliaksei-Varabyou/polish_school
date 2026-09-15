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

/** Students younger than this need a parent's confirmed consent (RODO art. 8, Poland). */
export const CONSENT_AGE = 16;

/**
 * True when the student may be younger than CONSENT_AGE (only the birth year is stored, so the check is
 * conservative) or the birth year is unknown.
 */
export function needsParentalConsent(birthYear: number | null, now = new Date()): boolean {
  return birthYear === null || now.getFullYear() - birthYear <= CONSENT_AGE;
}

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
  /** birth year missing or under 16 without a confirmed parental consent: history is not stored */
  consentRequired: z.boolean(),
  /** masked e-mail of the last pending consent request, e.g. "a***@example.com" */
  consentPendingFor: z.string().nullable(),
});
export type Profile = z.infer<typeof Profile>;

/** PATCH /api/me/profile — every field optional. Consent is granted only by the parent's confirmation link. */
export const ProfileUpdate = z
  .object({
    displayName: z.string().trim().min(1).max(60),
    grade: Grade.nullable(),
    level: Level.nullable(),
    uiLang: Lang,
    birthYear: z.number().int().min(1990).max(2030).nullable(),
  })
  .partial();
export type ProfileUpdate = z.infer<typeof ProfileUpdate>;

/** POST /api/me/parental-consent — sends a confirmation e-mail to the parent. */
export const ParentalConsentRequest = z.object({
  parentEmail: z.string().trim().toLowerCase().email().max(254),
  lang: Lang,
});
export type ParentalConsentRequest = z.infer<typeof ParentalConsentRequest>;

/** GET /api/me/export — everything stored about the student (RODO art. 15, 20). */
export const DataExport = z.object({
  exportedAt: z.string(),
  profile: Profile,
  sessions: z.array(SessionDetail),
  parentalConsents: z.array(
    z.object({ parentEmail: z.string(), requestedAt: z.string(), confirmedAt: z.string().nullable(), textVersion: z.string() }),
  ),
});
export type DataExport = z.infer<typeof DataExport>;
