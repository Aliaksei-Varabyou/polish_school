import { z } from "zod";

export const LANGS = ["ru", "en", "pl"] as const;
export const Lang = z.enum(LANGS);
export type Lang = z.infer<typeof Lang>;

export const GRADES = ["sp1", "sp2", "sp3", "sp4", "sp5", "sp6", "sp7", "sp8", "lo1", "lo2", "lo3", "lo4"] as const;
export const Grade = z.enum(GRADES);
export type Grade = z.infer<typeof Grade>;

/** P = poziom podstawowy, R = poziom rozszerzony (liceum only) */
export const Level = z.enum(["P", "R"]);
export type Level = z.infer<typeof Level>;

export const AnswerMode = z.enum(["input", "choice", "mixed"]);
export type AnswerMode = z.infer<typeof AnswerMode>;

export const TASK_COUNTS = [5, 10, 15, 20] as const;

export const isLyceum = (grade: Grade) => grade.startsWith("lo");

export const GenerateRequest = z
  .object({
    lang: Lang,
    grade: Grade,
    level: Level.optional(),
    // room for a whole textbook: biology selects paragraphs, 54 of them in LO3
    topicIds: z.array(z.string().min(1)).min(1).max(64),
    count: z.number().int().refine((n) => (TASK_COUNTS as readonly number[]).includes(n), {
      message: "count must be one of 5, 10, 15, 20",
    }),
    answerMode: AnswerMode,
    /**
     * Cross-cutting themes to narrow the selection to (homeostaza, obliczenia, …). Empty or absent
     * means the whole topic. `topicIds` stays required: the client expands a theme into the topics
     * that carry it, so the server's allow-list and verification are unchanged.
     */
    tagIds: z.array(z.string().min(1).max(64)).max(10).optional(),
    /** ids of tasks the student has already seen — not served again from the pool */
    excludeIds: z.array(z.string().max(64)).max(1000).optional(),
  })
  .refine((r) => !isLyceum(r.grade) || r.level !== undefined, {
    message: "level is required for liceum",
    path: ["level"],
  });
export type GenerateRequest = z.infer<typeof GenerateRequest>;

export const ChoiceLabel = z.enum(["A", "B", "C", "D"]);
export type ChoiceLabel = z.infer<typeof ChoiceLabel>;

export const Choice = z.object({
  label: ChoiceLabel,
  text: z.string().min(1),
  /** typical mistake that leads to this (wrong) option */
  misconception: z.string().optional(),
});
export type Choice = z.infer<typeof Choice>;

/**
 * number     — numeric answer (integers, decimals, fractions, roots: "3/4", "2*sqrt(3)")
 * expression — algebraic expression in variables ("2x+3")
 * choice     — pick one of four options A–D
 * text       — free-form term or name; correctAnswer holds the canonical form and
 *              acceptedAnswers lists synonyms and inflections (biology and other term-recall subjects)
 * Several answers (e.g. roots) are separated by ";" in correctAnswer.
 */
export const AnswerType = z.enum(["number", "expression", "choice", "text"]);
export type AnswerType = z.infer<typeof AnswerType>;

export const Difficulty = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type Difficulty = z.infer<typeof Difficulty>;

export const Task = z
  .object({
    id: z.string().min(1),
    topicId: z.string().min(1),
    subtopic: z.string(),
    difficulty: Difficulty,
    question: z.string().min(1),
    answerType: AnswerType,
    correctAnswer: z.string().min(1),
    /** answerType "text": other spellings/inflections accepted as correct, alongside correctAnswer */
    acceptedAnswers: z.array(z.string().min(1)).max(12).optional(),
    /** cross-cutting themes this task belongs to, independent of its topic (see GenerateRequest.tagIds) */
    tags: z.array(z.string().min(1).max(64)).max(8).optional(),
    verifyExpression: z.string().optional(),
    choices: z.array(Choice).length(4).optional(),
    correctChoice: ChoiceLabel.optional(),
    hint: z.string().optional(),
    solution: z.string().min(1),
  })
  .refine((t) => t.answerType !== "choice" || (t.choices && t.correctChoice), {
    message: "choice task needs choices and correctChoice",
  });
export type Task = z.infer<typeof Task>;

export const GenerateResponse = z.object({
  tasks: z.array(Task),
  /** present for signed-in users: the practice session stored in history */
  sessionId: z.string().uuid().optional(),
});
export type GenerateResponse = z.infer<typeof GenerateResponse>;

export const TaskResult = z.object({
  taskId: z.string(),
  topicId: z.string(),
  subtopic: z.string(),
  difficulty: Difficulty,
  question: z.string(),
  correct: z.boolean(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  usedHint: z.boolean(),
  misconception: z.string().optional(),
});
export type TaskResult = z.infer<typeof TaskResult>;

export const FeedbackRequest = z.object({
  lang: Lang,
  grade: Grade,
  level: Level.optional(),
  results: z.array(TaskResult).min(1).max(50),
  /** signed-in users: store the feedback with this session */
  sessionId: z.string().uuid().optional(),
});
export type FeedbackRequest = z.infer<typeof FeedbackRequest>;

export const FeedbackResponse = z.object({
  summary: z.string(),
  weakTopics: z.array(z.object({ topicId: z.string(), reason: z.string() })),
  recommendations: z.array(z.string()),
  suggestedTopicIds: z.array(z.string()),
});
export type FeedbackResponse = z.infer<typeof FeedbackResponse>;

export const ApiError = z.object({ error: z.string(), code: z.string().optional() });
export type ApiError = z.infer<typeof ApiError>;
