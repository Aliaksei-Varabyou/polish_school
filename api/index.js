import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);

// packages/ai/src/gemini.ts
import { ApiError, GoogleGenAI } from "@google/genai";

// packages/ai/src/provider.ts
var FatalLLMError = class extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "FatalLLMError";
  }
  status;
};
var RateLimitError = class extends Error {
  constructor(message = "LLM rate limit exceeded", retryAfterMs) {
    super(message);
    this.retryAfterMs = retryAfterMs;
    this.name = "RateLimitError";
  }
  retryAfterMs;
};

// packages/ai/src/gemini.ts
var TIMEOUT_MS = 9e4;
var RETRIES = 2;
var DEFAULT_COOLDOWN_MS = 6e4;
var LONG_COOLDOWN_MS = 60 * 6e4;
var MAX_COOLDOWN_WAIT_MS = 2e4;
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`LLM timeout after ${ms}ms`)), ms);
    })
  ]);
}
function cooldownFor429(err) {
  let details = [];
  try {
    details = JSON.parse(err.message)?.error?.details ?? [];
  } catch {
  }
  const daily = details.flatMap((d) => d.violations ?? []).some((v) => /PerDay/i.test(v.quotaId ?? ""));
  if (daily) return LONG_COOLDOWN_MS;
  const seconds = parseFloat(details.find((d) => d.retryDelay)?.retryDelay ?? "");
  return Number.isFinite(seconds) ? Math.ceil(seconds * 1e3) : DEFAULT_COOLDOWN_MS;
}
var GeminiClient = class {
  /** @param models primary model first, then fallbacks (each model has its own free quota) */
  constructor(apiKey, models) {
    this.models = models;
    if (models.length === 0) throw new Error("At least one Gemini model is required");
    this.ai = new GoogleGenAI({ apiKey });
  }
  models;
  name = "gemini";
  ai;
  cooldowns = /* @__PURE__ */ new Map();
  /** Model availability for /api/health. */
  status() {
    const now = Date.now();
    return this.models.map((model) => {
      const c = this.cooldowns.get(model);
      return c && c.until > now ? { model, available: false, reason: c.reason, retryInSec: Math.ceil((c.until - now) / 1e3) } : { model, available: true };
    });
  }
  cool(model, ms, reason) {
    this.cooldowns.set(model, { until: Date.now() + ms, reason });
    console.warn(`[gemini] ${model} ${reason}, skipping for ${Math.round(ms / 1e3)}s`);
  }
  /** Tries models in order, skipping ones that are cooling down after 429/404. */
  async generateJson({ system, prompt, schema, temperature }) {
    let lastError;
    for (let pass = 0; pass < 2; pass++) {
      for (const model of this.models) {
        if ((this.cooldowns.get(model)?.until ?? 0) > Date.now()) continue;
        for (let attempt = 0; attempt <= RETRIES; attempt++) {
          try {
            const response = await withTimeout(
              this.ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                  systemInstruction: system,
                  temperature,
                  responseMimeType: "application/json",
                  responseJsonSchema: schema
                }
              }),
              TIMEOUT_MS
            );
            const text = response.text;
            if (!text) throw new Error("Empty LLM response");
            return JSON.parse(text);
          } catch (err) {
            lastError = err;
            if (err instanceof ApiError && err.status === 429) {
              this.cool(model, cooldownFor429(err), "quota");
              break;
            }
            if (err instanceof ApiError && err.status === 404) {
              this.cool(model, LONG_COOLDOWN_MS, "unavailable");
              break;
            }
            if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
              throw new FatalLLMError(err.message, err.status);
            }
            if (attempt < RETRIES) await sleep(1e3 * 2 ** attempt);
          }
        }
      }
      const active = this.models.map((m) => this.cooldowns.get(m)).filter((c) => !!c && c.until > Date.now());
      if (active.length < this.models.length) break;
      const waitMs = Math.min(...active.map((c) => c.until)) - Date.now();
      if (pass === 0 && waitMs <= MAX_COOLDOWN_WAIT_MS) {
        await sleep(Math.max(waitMs, 0));
        continue;
      }
      if (active.every((c) => c.reason === "unavailable")) {
        throw new FatalLLMError("No configured Gemini model is available", 404);
      }
      throw new RateLimitError("All Gemini models are rate limited", waitMs);
    }
    throw lastError ?? new Error("LLM call failed");
  }
};

// packages/ai/src/limiter.ts
var LLMLimiter = class {
  constructor(opts) {
    this.opts = opts;
  }
  opts;
  active = 0;
  starts = [];
  waiters = /* @__PURE__ */ new Set();
  get stats() {
    return { active: this.active, queued: this.waiters.size, startedLastMinute: this.starts.length };
  }
  async run(fn) {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.active--;
      this.wakeAll();
    }
  }
  wakeAll() {
    const waiters = [...this.waiters];
    this.waiters.clear();
    for (const wake of waiters) wake();
  }
  async acquire() {
    const deadline = Date.now() + this.opts.maxWaitMs;
    for (; ; ) {
      const now = Date.now();
      this.starts = this.starts.filter((t) => now - t < 6e4);
      const rpmOk = !this.opts.rpm || this.starts.length < this.opts.rpm;
      if (this.active < this.opts.maxConcurrent && rpmOk) {
        this.active++;
        this.starts.push(now);
        return;
      }
      const remaining = deadline - now;
      if (remaining <= 0) throw new RateLimitError("LLM queue is full", rpmOk ? void 0 : this.starts[0] + 6e4 - now);
      const windowWait = rpmOk ? remaining : Math.max(this.starts[0] + 6e4 - now, 1);
      await new Promise((resolve2) => {
        const wake = () => {
          clearTimeout(timer);
          this.waiters.delete(wake);
          resolve2();
        };
        const timer = setTimeout(wake, Math.min(windowWait, remaining));
        this.waiters.add(wake);
      });
    }
  }
};
var LimitedClient = class {
  constructor(inner, limiter) {
    this.inner = inner;
    this.limiter = limiter;
  }
  inner;
  limiter;
  get name() {
    return this.inner.name;
  }
  generateJson(request) {
    return this.limiter.run(() => this.inner.generateJson(request));
  }
};

// packages/ai/src/mock.ts
var MockClient = class {
  name = "mock";
  calls = 0;
  async generateJson(request) {
    this.calls++;
    if (!request.mock) throw new Error("MockClient: request has no mock response");
    return request.mock();
  }
};

// packages/ai/src/index.ts
var DEFAULT_MODEL = "gemini-3.5-flash-lite";
var DEFAULT_FALLBACKS = "gemini-3.1-flash-lite,gemini-3.6-flash";
var num = (value, fallback) => {
  const n = Number(value);
  return value !== void 0 && value !== "" && Number.isFinite(n) ? n : fallback;
};
function createLLMClient(env = process.env) {
  const kind = env.LLM_PROVIDER ?? (env.GEMINI_API_KEY ? "gemini" : "mock");
  let inner;
  if (kind === "mock") {
    inner = new MockClient();
  } else if (kind === "gemini") {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set (or use LLM_PROVIDER=mock)");
    const models = [env.GEMINI_MODEL || DEFAULT_MODEL, ...(env.GEMINI_FALLBACK_MODEL ?? DEFAULT_FALLBACKS).split(",")].map((m) => m.trim()).filter((m, i, all3) => m && all3.indexOf(m) === i);
    inner = new GeminiClient(env.GEMINI_API_KEY, models);
  } else {
    throw new Error(`Unknown LLM_PROVIDER: ${kind}`);
  }
  const limiter = new LLMLimiter({
    maxConcurrent: num(env.LLM_MAX_CONCURRENT, 4),
    rpm: num(env.LLM_RPM, kind === "mock" ? 0 : 15),
    maxWaitMs: num(env.LLM_QUEUE_WAIT_MS, 45e3)
  });
  return new LimitedClient(inner, limiter);
}

// packages/db/src/index.ts
import { createHash, randomBytes } from "node:crypto";

// packages/core/src/schemas.ts
import { z } from "zod";
var LANGS = ["ru", "en", "pl"];
var Lang = z.enum(LANGS);
var GRADES = ["sp5", "sp6", "sp7", "sp8", "lo1", "lo2", "lo3", "lo4"];
var Grade = z.enum(GRADES);
var Level = z.enum(["P", "R"]);
var AnswerMode = z.enum(["input", "choice", "mixed"]);
var TASK_COUNTS = [5, 10, 15, 20];
var isLyceum = (grade) => grade.startsWith("lo");
var GenerateRequest = z.object({
  lang: Lang,
  grade: Grade,
  level: Level.optional(),
  topicIds: z.array(z.string().min(1)).min(1).max(30),
  count: z.number().int().refine((n) => TASK_COUNTS.includes(n), {
    message: "count must be one of 5, 10, 15, 20"
  }),
  answerMode: AnswerMode,
  /**
   * Cross-cutting themes to narrow the selection to (homeostaza, obliczenia, …). Empty or absent
   * means the whole topic. `topicIds` stays required: the client expands a theme into the topics
   * that carry it, so the server's allow-list and verification are unchanged.
   */
  tagIds: z.array(z.string().min(1).max(64)).max(10).optional(),
  /** ids of tasks the student has already seen — not served again from the pool */
  excludeIds: z.array(z.string().max(64)).max(1e3).optional()
}).refine((r) => !isLyceum(r.grade) || r.level !== void 0, {
  message: "level is required for liceum",
  path: ["level"]
});
var ChoiceLabel = z.enum(["A", "B", "C", "D"]);
var Choice = z.object({
  label: ChoiceLabel,
  text: z.string().min(1),
  /** typical mistake that leads to this (wrong) option */
  misconception: z.string().optional()
});
var AnswerType = z.enum(["number", "expression", "choice", "text"]);
var Difficulty = z.union([z.literal(1), z.literal(2), z.literal(3)]);
var Task = z.object({
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
  solution: z.string().min(1)
}).refine((t) => t.answerType !== "choice" || t.choices && t.correctChoice, {
  message: "choice task needs choices and correctChoice"
});
var GenerateResponse = z.object({
  tasks: z.array(Task),
  /** present for signed-in users: the practice session stored in history */
  sessionId: z.string().uuid().optional()
});
var TaskResult = z.object({
  taskId: z.string(),
  topicId: z.string(),
  subtopic: z.string(),
  difficulty: Difficulty,
  question: z.string(),
  correct: z.boolean(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  usedHint: z.boolean(),
  misconception: z.string().optional()
});
var FeedbackRequest = z.object({
  lang: Lang,
  grade: Grade,
  level: Level.optional(),
  results: z.array(TaskResult).min(1).max(50),
  /** signed-in users: store the feedback with this session */
  sessionId: z.string().uuid().optional()
});
var FeedbackResponse = z.object({
  summary: z.string(),
  weakTopics: z.array(z.object({ topicId: z.string(), reason: z.string() })),
  recommendations: z.array(z.string()),
  suggestedTopicIds: z.array(z.string())
});
var ApiError2 = z.object({ error: z.string(), code: z.string().optional() });

// packages/core/src/topic.ts
function topic(id, grade, names, subtopics, level) {
  const [pl, ru, en] = names;
  return { id, grade, level, name: { pl, ru, en }, subtopics };
}

// packages/core/src/history.ts
import { z as z2 } from "zod";
var SessionSettings = z2.object({
  lang: Lang,
  grade: Grade,
  level: Level.optional(),
  topicIds: z2.array(z2.string()),
  count: z2.number().int(),
  answerMode: AnswerMode
});
var SessionSummary = z2.object({
  id: z2.string().uuid(),
  trainerId: z2.string(),
  settings: SessionSettings,
  startedAt: z2.string(),
  finishedAt: z2.string().nullable(),
  correct: z2.number().int(),
  total: z2.number().int(),
  answered: z2.number().int()
});
var SessionTaskRecord = z2.object({
  position: z2.number().int(),
  task: Task,
  userAnswer: z2.string().nullable(),
  correct: z2.boolean().nullable(),
  usedHint: z2.boolean(),
  answeredAt: z2.string().nullable()
});
var SessionDetail = SessionSummary.extend({
  tasks: z2.array(SessionTaskRecord),
  feedback: FeedbackResponse.nullable()
});
var AnswerRequest = z2.object({
  position: z2.number().int().min(0),
  answer: z2.string().max(500),
  usedHint: z2.boolean().default(false)
});
var AnswerResponse = z2.object({ correct: z2.boolean() });
var TopicProgress = z2.object({
  trainerId: z2.string(),
  topicId: z2.string(),
  attempts: z2.number().int(),
  correct: z2.number().int(),
  lastPracticedAt: z2.string()
});
var ProgressResponse = z2.object({
  sessions: z2.number().int(),
  tasksAnswered: z2.number().int(),
  correct: z2.number().int(),
  topics: z2.array(TopicProgress)
});
var TaskReportRequest = z2.object({ reason: z2.string().trim().max(500).optional() });
var CONSENT_AGE = 16;
function needsParentalConsent(birthYear, now = /* @__PURE__ */ new Date()) {
  return birthYear === null || now.getFullYear() - birthYear <= CONSENT_AGE;
}
var Profile = z2.object({
  id: z2.string().uuid(),
  email: z2.string().nullable(),
  displayName: z2.string().nullable(),
  grade: Grade.nullable(),
  level: Level.nullable(),
  uiLang: Lang,
  birthYear: z2.number().int().nullable(),
  parentalConsentAt: z2.string().nullable(),
  /** birth year missing or under 16 without a confirmed parental consent: history is not stored */
  consentRequired: z2.boolean(),
  /** masked e-mail of the last pending consent request, e.g. "a***@example.com" */
  consentPendingFor: z2.string().nullable()
});
var ProfileUpdate = z2.object({
  displayName: z2.string().trim().min(1).max(60),
  grade: Grade.nullable(),
  level: Level.nullable(),
  uiLang: Lang,
  birthYear: z2.number().int().min(1990).max(2030).nullable()
}).partial();
var ParentalConsentRequest = z2.object({
  parentEmail: z2.string().trim().toLowerCase().email().max(254),
  lang: Lang
});
var DataExport = z2.object({
  exportedAt: z2.string(),
  profile: Profile,
  sessions: z2.array(SessionDetail),
  parentalConsents: z2.array(
    z2.object({ parentEmail: z2.string(), requestedAt: z2.string(), confirmedAt: z2.string().nullable(), textVersion: z2.string() })
  )
});

// packages/db/src/index.ts
import { createClient } from "@supabase/supabase-js";

// packages/task-pool/src/taskPool.ts
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
var MAX_REPORTS = 2;
var ANSWER_TYPES = {
  input: ["number", "expression", "text"],
  choice: ["choice"],
  mixed: ["number", "expression", "choice", "text"]
};
var TaskPool = class {
  db;
  constructor(path) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS tasks (
        id          TEXT PRIMARY KEY,
        trainer_id  TEXT NOT NULL DEFAULT 'math',
        lang        TEXT NOT NULL,
        grade       TEXT NOT NULL,
        level       TEXT NOT NULL DEFAULT '',
        topic_id    TEXT NOT NULL,
        difficulty  INTEGER NOT NULL,
        answer_type TEXT NOT NULL,
        data        TEXT NOT NULL,
        tags        TEXT NOT NULL DEFAULT '[]',
        created_at  INTEGER NOT NULL,
        served      INTEGER NOT NULL DEFAULT 0,
        reports     INTEGER NOT NULL DEFAULT 0
      );
    `);
    this.migrate();
    this.db.exec(`
      DROP INDEX IF EXISTS tasks_lookup;
      CREATE INDEX IF NOT EXISTS tasks_lookup_v2 ON tasks (trainer_id, lang, grade, level, topic_id, answer_type);
    `);
  }
  /** Older pools: no trainer column (they only contained math tasks), no reports, no tags. */
  migrate() {
    const columns = this.db.prepare("PRAGMA table_info(tasks)").all().map((c) => c.name);
    if (!columns.includes("trainer_id")) this.db.exec("ALTER TABLE tasks ADD COLUMN trainer_id TEXT NOT NULL DEFAULT 'math'");
    if (!columns.includes("reports")) this.db.exec("ALTER TABLE tasks ADD COLUMN reports INTEGER NOT NULL DEFAULT 0");
    if (!columns.includes("tags")) this.db.exec("ALTER TABLE tasks ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'");
  }
  async add(tasks, ctx) {
    const insert = this.db.prepare(
      `INSERT OR IGNORE INTO tasks (id, trainer_id, lang, grade, level, topic_id, difficulty, answer_type, data, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const now = Date.now();
    this.db.exec("BEGIN");
    try {
      for (const t of tasks) {
        insert.run(
          t.id,
          ctx.trainerId,
          ctx.lang,
          ctx.grade,
          ctx.level ?? "",
          t.topicId,
          t.difficulty,
          t.answerType,
          JSON.stringify(t),
          JSON.stringify(t.tags ?? []),
          now
        );
      }
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
  }
  async take(q) {
    if (q.limit <= 0) return [];
    const types = ANSWER_TYPES[q.answerMode];
    const tags = q.tags ?? [];
    const tagClause = tags.length > 0 ? "AND EXISTS (SELECT 1 FROM json_each(tasks.tags) WHERE value IN (SELECT value FROM json_each(?)))" : "";
    const rows = this.db.prepare(
      `SELECT id, data FROM tasks
         WHERE trainer_id = ? AND lang = ? AND grade = ? AND level = ? AND topic_id = ?
           AND answer_type IN (${types.map(() => "?").join(",")})
           AND id NOT IN (SELECT value FROM json_each(?))
           AND reports < ?
           ${tagClause}
         ORDER BY (difficulty = ?) DESC, served ASC, random()
         LIMIT ?`
    ).all(
      q.trainerId,
      q.lang,
      q.grade,
      q.level ?? "",
      q.topicId,
      ...types,
      JSON.stringify(q.excludeIds),
      MAX_REPORTS,
      ...tags.length > 0 ? [JSON.stringify(tags)] : [],
      q.difficulty ?? 0,
      q.limit
    );
    if (rows.length > 0) {
      const mark = this.db.prepare("UPDATE tasks SET served = served + 1 WHERE id = ?");
      for (const r of rows) mark.run(r.id);
    }
    return rows.map((r) => JSON.parse(r.data));
  }
  async count(trainerId) {
    const row = trainerId ? this.db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE trainer_id = ?").get(trainerId) : this.db.prepare("SELECT COUNT(*) AS n FROM tasks").get();
    return row.n;
  }
  async report(taskId, _report) {
    return this.db.prepare("UPDATE tasks SET reports = reports + 1 WHERE id = ?").run(taskId).changes > 0;
  }
  /** All stored tasks (used to copy a local pool into Postgres). */
  exportAll() {
    const rows = this.db.prepare("SELECT trainer_id, lang, grade, level, data, reports FROM tasks").all();
    return rows.map((r) => ({
      ctx: { trainerId: r.trainer_id, lang: r.lang, grade: r.grade, level: r.level || void 0 },
      task: JSON.parse(r.data),
      reports: r.reports
    }));
  }
  close() {
    this.db.close();
  }
};

// packages/db/src/taskPool.ts
var SupabaseTaskPool = class {
  constructor(admin) {
    this.admin = admin;
  }
  admin;
  async add(tasks, ctx) {
    if (tasks.length === 0) return;
    const rows = tasks.map((t) => ({
      id: t.id,
      trainer_id: ctx.trainerId,
      lang: ctx.lang,
      grade: ctx.grade,
      level: ctx.level ?? "",
      topic_id: t.topicId,
      difficulty: t.difficulty,
      answer_type: t.answerType,
      data: t,
      tags: t.tags ?? []
    }));
    const { error } = await this.admin.from("tasks").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw new Error(`pool add: ${error.message}`);
  }
  async take(q) {
    if (q.limit <= 0) return [];
    const { data, error } = await this.admin.rpc("take_pool_tasks", {
      p_trainer_id: q.trainerId,
      p_lang: q.lang,
      p_grade: q.grade,
      p_level: q.level ?? "",
      p_topic_id: q.topicId,
      p_answer_types: ANSWER_TYPES[q.answerMode],
      p_tags: [...q.tags ?? []],
      p_difficulty: q.difficulty ?? 0,
      p_exclude: [...q.excludeIds],
      p_limit: q.limit,
      p_max_reports: MAX_REPORTS
    });
    if (error) throw new Error(`pool take: ${error.message}`);
    return data ?? [];
  }
  async count(trainerId) {
    let query = this.admin.from("tasks").select("id", { count: "exact", head: true });
    if (trainerId) query = query.eq("trainer_id", trainerId);
    const { count, error } = await query;
    if (error) throw new Error(`pool count: ${error.message}`);
    return count ?? 0;
  }
  async report(taskId, report) {
    const { data, error } = await this.admin.rpc("report_task", {
      p_task_id: taskId,
      p_user_id: report.userId ?? null,
      p_reason: report.reason ?? null
    });
    if (error) throw new Error(`pool report: ${error.message}`);
    return data === true;
  }
};

// packages/db/src/index.ts
function dbConfigFromEnv(env = process.env) {
  return env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? { url: env.SUPABASE_URL, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY } : null;
}
var TOKEN_CACHE_MS = 6e4;
var TOKEN_CACHE_MAX = 1e3;
var CONSENT_LINK_DAYS = 14;
function fail(error, what) {
  if (error) throw new Error(`${what}: ${error.message}`);
}
var sha256 = (value) => createHash("sha256").update(value).digest("hex");
function maskEmail(email) {
  const [local, domain] = email.split("@");
  return domain ? `${local.slice(0, 1)}***@${domain}` : "***";
}
var toSummary = (row, answered) => ({
  id: row.id,
  trainerId: row.trainer_id,
  settings: row.settings,
  startedAt: row.started_at,
  finishedAt: row.finished_at,
  correct: row.correct,
  total: row.total,
  answered
});
var toTaskRecord = (row) => ({
  position: row.position,
  task: row.task,
  userAnswer: row.user_answer,
  correct: row.correct,
  usedHint: row.used_hint,
  answeredAt: row.answered_at
});
var PortalDb = class {
  admin;
  tokenCache = /* @__PURE__ */ new Map();
  constructor(config2) {
    this.admin = createClient(config2.url, config2.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  // -------------------------------------------------------------------------
  // auth
  // -------------------------------------------------------------------------
  /** Verifies a Supabase access token (cached for a minute). Returns null for invalid/expired tokens. */
  async userFromToken(token) {
    const cached = this.tokenCache.get(token);
    if (cached && cached.expires > Date.now()) return cached.user;
    const { data, error } = await this.admin.auth.getUser(token);
    if (error || !data.user) {
      this.tokenCache.delete(token);
      return null;
    }
    const user = { id: data.user.id, email: data.user.email ?? null };
    if (this.tokenCache.size >= TOKEN_CACHE_MAX) this.tokenCache.clear();
    this.tokenCache.set(token, { user, expires: Date.now() + TOKEN_CACHE_MS });
    return user;
  }
  /** Deletes the account; profile, history and consents are removed by ON DELETE CASCADE. */
  async deleteAccount(userId) {
    const { error } = await this.admin.auth.admin.deleteUser(userId);
    fail(error, "delete account");
    for (const [token, entry] of this.tokenCache) if (entry.user.id === userId) this.tokenCache.delete(token);
  }
  // -------------------------------------------------------------------------
  // sessions
  // -------------------------------------------------------------------------
  async createSession(userId, trainerId, settings, tasks) {
    const { data, error } = await this.admin.from("sessions").insert({ user_id: userId, trainer_id: trainerId, settings, total: tasks.length }).select("id").single();
    fail(error, "create session");
    const sessionId = data.id;
    const rows = tasks.map((task, position) => ({
      session_id: sessionId,
      position,
      task_id: task.id,
      topic_id: task.topicId,
      difficulty: task.difficulty,
      task
    }));
    const { error: tasksError } = await this.admin.from("session_tasks").insert(rows);
    fail(tasksError, "create session tasks");
    return sessionId;
  }
  async ownsSession(sessionId, userId) {
    const { data, error } = await this.admin.from("sessions").select("id, trainer_id, settings, started_at, finished_at, correct, total").eq("id", sessionId).eq("user_id", userId).maybeSingle();
    fail(error, "load session");
    return data ?? null;
  }
  /** The task at `position` of a session owned by the user (null if not found). */
  async getSessionTask(sessionId, userId, position) {
    const session = await this.ownsSession(sessionId, userId);
    if (!session) return null;
    const { data, error } = await this.admin.from("session_tasks").select("task, answered_at").eq("session_id", sessionId).eq("position", position).maybeSingle();
    fail(error, "load session task");
    if (!data) return null;
    const row = data;
    return { trainerId: session.trainer_id, task: row.task, answered: row.answered_at !== null };
  }
  /** Stores the first answer to a task and updates the session score. Returns false if already answered. */
  async recordAnswer(sessionId, position, answer) {
    const { data, error } = await this.admin.from("session_tasks").update({ user_answer: answer.answer, correct: answer.correct, used_hint: answer.usedHint, answered_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("session_id", sessionId).eq("position", position).is("answered_at", null).select("position");
    fail(error, "record answer");
    if (!data || data.length === 0) return false;
    const { count, error: countError } = await this.admin.from("session_tasks").select("position", { count: "exact", head: true }).eq("session_id", sessionId).eq("correct", true);
    fail(countError, "count correct answers");
    const { error: updateError } = await this.admin.from("sessions").update({ correct: count ?? 0 }).eq("id", sessionId);
    fail(updateError, "update session score");
    return true;
  }
  async finishSession(sessionId, userId) {
    const session = await this.ownsSession(sessionId, userId);
    if (!session) return null;
    if (!session.finished_at) {
      const { error } = await this.admin.from("sessions").update({ finished_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", sessionId).is("finished_at", null);
      fail(error, "finish session");
    }
    return await this.getSessionDetail(sessionId, userId) ?? null;
  }
  async saveFeedback(sessionId, userId, data) {
    if (!await this.ownsSession(sessionId, userId)) return false;
    const { error } = await this.admin.from("session_feedback").upsert({ session_id: sessionId, data });
    fail(error, "save feedback");
    return true;
  }
  async listSessions(userId, { limit = 20, before } = {}) {
    let query = this.admin.from("sessions").select("id, trainer_id, settings, started_at, finished_at, correct, total, session_tasks(answered_at)").eq("user_id", userId).order("started_at", { ascending: false }).limit(Math.min(Math.max(limit, 1), 100));
    if (before) query = query.lt("started_at", before);
    const { data, error } = await query;
    fail(error, "list sessions");
    return (data ?? []).map(
      (row) => toSummary(row, row.session_tasks.filter((t) => t.answered_at !== null).length)
    );
  }
  async getSessionDetail(sessionId, userId) {
    const { data, error } = await this.admin.from("sessions").select(
      "id, trainer_id, settings, started_at, finished_at, correct, total, session_tasks(position, task, user_answer, correct, used_hint, answered_at), session_feedback(data)"
    ).eq("id", sessionId).eq("user_id", userId).maybeSingle();
    fail(error, "load session detail");
    if (!data) return null;
    const row = data;
    const tasks = [...row.session_tasks].sort((a, b) => a.position - b.position).map(toTaskRecord);
    const feedbackRow = Array.isArray(row.session_feedback) ? row.session_feedback[0] : row.session_feedback;
    return {
      ...toSummary(row, tasks.filter((t) => t.answeredAt !== null).length),
      tasks,
      feedback: feedbackRow?.data ?? null
    };
  }
  /** Ids of tasks the user has already been given in this trainer (so the pool doesn't repeat them). */
  async seenTaskIds(userId, trainerId, limit = 2e3) {
    const { data, error } = await this.admin.from("session_tasks").select("task_id, sessions!inner(user_id, trainer_id)").eq("sessions.user_id", userId).eq("sessions.trainer_id", trainerId).limit(limit);
    fail(error, "load seen tasks");
    return [...new Set((data ?? []).map((r) => r.task_id))];
  }
  async progress(userId) {
    const { count: sessions, error: countError } = await this.admin.from("sessions").select("id", { count: "exact", head: true }).eq("user_id", userId);
    fail(countError, "count sessions");
    const { data, error } = await this.admin.from("session_tasks").select("topic_id, correct, answered_at, sessions!inner(user_id, trainer_id)").eq("sessions.user_id", userId).not("answered_at", "is", null).limit(1e4);
    fail(error, "load progress");
    const rows = data ?? [];
    const topics = /* @__PURE__ */ new Map();
    let correct = 0;
    for (const r of rows) {
      const trainerId = Array.isArray(r.sessions) ? r.sessions[0].trainer_id : r.sessions.trainer_id;
      const key = `${trainerId}:${r.topic_id}`;
      const t = topics.get(key) ?? { trainerId, topicId: r.topic_id, attempts: 0, correct: 0, lastPracticedAt: r.answered_at };
      t.attempts++;
      if (r.correct) {
        t.correct++;
        correct++;
      }
      if (r.answered_at > t.lastPracticedAt) t.lastPracticedAt = r.answered_at;
      topics.set(key, t);
    }
    return {
      sessions: sessions ?? 0,
      tasksAnswered: rows.length,
      correct,
      topics: [...topics.values()].sort((a, b) => a.correct / a.attempts - b.correct / b.attempts)
    };
  }
  // -------------------------------------------------------------------------
  // profile
  // -------------------------------------------------------------------------
  async profileRow(userId) {
    const { data, error } = await this.admin.from("profiles").select("id, display_name, grade, level, ui_lang, birth_year, parental_consent_at").eq("id", userId).maybeSingle();
    fail(error, "load profile");
    return data ?? null;
  }
  async getProfile(user) {
    const row = await this.profileRow(user.id);
    if (!row) return null;
    const consentRequired = needsParentalConsent(row.birth_year) && row.parental_consent_at === null;
    let consentPendingFor = null;
    if (consentRequired) {
      const { data, error } = await this.admin.from("parental_consents").select("parent_email").eq("user_id", user.id).is("confirmed_at", null).gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("requested_at", { ascending: false }).limit(1).maybeSingle();
      fail(error, "load pending consent");
      consentPendingFor = data ? maskEmail(data.parent_email) : null;
    }
    return {
      id: row.id,
      email: user.email,
      displayName: row.display_name,
      grade: row.grade,
      level: row.level,
      uiLang: row.ui_lang,
      birthYear: row.birth_year,
      parentalConsentAt: row.parental_consent_at,
      consentRequired,
      consentPendingFor
    };
  }
  async updateProfile(user, update) {
    const patch = {};
    if (update.displayName !== void 0) patch.display_name = update.displayName;
    if (update.grade !== void 0) patch.grade = update.grade;
    if (update.level !== void 0) patch.level = update.level;
    if (update.uiLang !== void 0) patch.ui_lang = update.uiLang;
    if (update.birthYear !== void 0) patch.birth_year = update.birthYear;
    if (Object.keys(patch).length > 0) {
      const { error } = await this.admin.from("profiles").update(patch).eq("id", user.id);
      fail(error, "update profile");
    }
    return this.getProfile(user);
  }
  /** History is stored only for students 16+ or with a parent's confirmed consent. */
  async canStoreHistory(userId) {
    const row = await this.profileRow(userId);
    return !!row && (!needsParentalConsent(row.birth_year) || row.parental_consent_at !== null);
  }
  // -------------------------------------------------------------------------
  // parental consent (double opt-in)
  // -------------------------------------------------------------------------
  /** Creates a one-time confirmation token (only its hash is stored); older pending requests are dropped. */
  async requestParentalConsent(userId, parentEmail, textVersion) {
    const { error: cleanupError } = await this.admin.from("parental_consents").delete().eq("user_id", userId).is("confirmed_at", null);
    fail(cleanupError, "drop pending consents");
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + CONSENT_LINK_DAYS * 864e5).toISOString();
    const { error } = await this.admin.from("parental_consents").insert({
      user_id: userId,
      parent_email: parentEmail,
      token_hash: sha256(token),
      text_version: textVersion,
      expires_at: expiresAt
    });
    fail(error, "create consent request");
    return { token, expiresAt };
  }
  async confirmParentalConsent(token) {
    if (!token) return "invalid";
    const { data, error } = await this.admin.from("parental_consents").select("user_id, parent_email, text_version, requested_at, expires_at, confirmed_at").eq("token_hash", sha256(token)).maybeSingle();
    fail(error, "load consent request");
    const row = data;
    if (!row) return "invalid";
    if (row.confirmed_at) return "already-confirmed";
    if (new Date(row.expires_at) < /* @__PURE__ */ new Date()) return "expired";
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { error: confirmError } = await this.admin.from("parental_consents").update({ confirmed_at: now }).eq("token_hash", sha256(token));
    fail(confirmError, "confirm consent");
    const { error: profileError } = await this.admin.from("profiles").update({ parental_consent_at: now }).eq("id", row.user_id);
    fail(profileError, "store consent in profile");
    return "confirmed";
  }
  /**
   * Deletes accounts of students who may be under 16 (or never gave a birth year) whose parent
   * has not confirmed consent within `days` days of registration. Returns the number of deleted accounts.
   */
  async deleteUnconfirmedMinors(days = CONSENT_LINK_DAYS) {
    const cutoff = new Date(Date.now() - days * 864e5).toISOString();
    const minBirthYear = (/* @__PURE__ */ new Date()).getFullYear() - CONSENT_AGE;
    const { data, error } = await this.admin.from("profiles").select("id").is("parental_consent_at", null).lt("created_at", cutoff).or(`birth_year.is.null,birth_year.gte.${minBirthYear}`).limit(500);
    fail(error, "find unconfirmed minors");
    const ids = (data ?? []).map((r) => r.id);
    for (const id of ids) await this.deleteAccount(id);
    return ids.length;
  }
  // -------------------------------------------------------------------------
  // data export (RODO art. 15, 20)
  // -------------------------------------------------------------------------
  async exportData(user) {
    const profile = await this.getProfile(user);
    if (!profile) return null;
    const sessions = [];
    let before;
    for (; ; ) {
      const page = await this.listSessions(user.id, { limit: 100, before });
      for (const s of page) {
        const detail = await this.getSessionDetail(s.id, user.id);
        if (detail) sessions.push(detail);
      }
      if (page.length < 100) break;
      before = page[page.length - 1].startedAt;
    }
    const { data, error } = await this.admin.from("parental_consents").select("parent_email, requested_at, confirmed_at, text_version").eq("user_id", user.id).order("requested_at", { ascending: true });
    fail(error, "load consents");
    return {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      profile,
      sessions,
      parentalConsents: (data ?? []).map((c) => ({
        parentEmail: c.parent_email,
        requestedAt: c.requested_at,
        confirmedAt: c.confirmed_at,
        textVersion: c.text_version
      }))
    };
  }
};

// apps/api/src/app.ts
import { existsSync } from "node:fs";
import { dirname as dirname2, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";

// apps/api/src/auth.ts
function registerAuth(app, db) {
  app.decorateRequest("user", null);
  app.addHook("preHandler", async (request, reply) => {
    request.user = null;
    const header = request.headers.authorization;
    if (!db || !header?.startsWith("Bearer ") || request.url === "/api/health") return;
    const user = await db.userFromToken(header.slice("Bearer ".length).trim());
    if (!user) return reply.code(401).send({ error: "Invalid or expired session", code: "UNAUTHORIZED" });
    request.user = user;
  });
}
function requireUser(request, reply, db) {
  if (!db) {
    reply.code(503).send({ error: "Accounts are not configured", code: "AUTH_DISABLED" });
    return null;
  }
  if (!request.user) {
    reply.code(401).send({ error: "Sign in required", code: "UNAUTHORIZED" });
    return null;
  }
  return { user: request.user, db };
}
var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var isUuid = (value) => UUID.test(value);

// apps/api/src/mailer.ts
import nodemailer from "nodemailer";
function createMailer(env = process.env, log = console) {
  if (!env.SMTP_HOST) {
    return {
      async send(message) {
        log.warn(`[mail] SMTP is not configured, not sending "${message.subject}" to ${message.to}:
${message.text}`);
      }
    };
  }
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT ?? 587),
    secure: env.SMTP_SECURE === "true",
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS ?? "" } : void 0
  });
  const from = env.MAIL_FROM ?? "Matema <no-reply@localhost>";
  return {
    async send(message) {
      await transport.sendMail({ from, ...message });
    }
  };
}

// apps/api/src/consentTexts.ts
var CONSENT_TEXT_VERSION = "2026-09-15";
var escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var EMAIL = {
  pl: {
    subject: "Pro\u015Bba o zgod\u0119 rodzica \u2014 Matema",
    intro: (name) => `Twoje dziecko (nazwa w serwisie: \u201E${name}\u201D) chce za\u0142o\u017Cy\u0107 konto w Matema \u2014 trena\u017Cerze do nauki matematyki zgodnym z podstaw\u0105 programow\u0105.`,
    points: [
      "Zapisujemy: nazw\u0119 wy\u015Bwietlan\u0105, klas\u0119, rok urodzenia i histori\u0119 \u0107wicze\u0144 (zadania, odpowiedzi, wyniki).",
      "Tre\u015B\u0107 zada\u0144 i b\u0142\u0119dne odpowiedzi mog\u0105 by\u0107 przekazywane dostawcy sztucznej inteligencji bez imienia i adresu e-mail dziecka.",
      "Konto i wszystkie dane mo\u017Cna w ka\u017Cdej chwili usun\u0105\u0107 w ustawieniach profilu."
    ],
    action: "Potwierdzam, \u017Ce jestem rodzicem lub opiekunem i wyra\u017Cam zgod\u0119",
    expiry: (days) => `Link jest wa\u017Cny ${days} dni. Bez potwierdzenia konto zostanie usuni\u0119te.`,
    ignore: "Je\u015Bli nie znasz tej pro\u015Bby, zignoruj t\u0119 wiadomo\u015B\u0107."
  },
  ru: {
    subject: "\u0417\u0430\u043F\u0440\u043E\u0441 \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u044F \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044F \u2014 Matema",
    intro: (name) => `\u0412\u0430\u0448 \u0440\u0435\u0431\u0451\u043D\u043E\u043A (\u0438\u043C\u044F \u0432 \u0441\u0435\u0440\u0432\u0438\u0441\u0435: \xAB${name}\xBB) \u0445\u043E\u0447\u0435\u0442 \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0432 Matema \u2014 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435 \u043F\u043E \u043C\u0430\u0442\u0435\u043C\u0430\u0442\u0438\u043A\u0435 \u043F\u043E \u043F\u043E\u043B\u044C\u0441\u043A\u043E\u0439 \u0448\u043A\u043E\u043B\u044C\u043D\u043E\u0439 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0435.`,
    points: [
      "\u041C\u044B \u0445\u0440\u0430\u043D\u0438\u043C: \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u043C\u043E\u0435 \u0438\u043C\u044F, \u043A\u043B\u0430\u0441\u0441, \u0433\u043E\u0434 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u0438 \u0438\u0441\u0442\u043E\u0440\u0438\u044E \u0437\u0430\u043D\u044F\u0442\u0438\u0439 (\u0437\u0430\u0434\u0430\u043D\u0438\u044F, \u043E\u0442\u0432\u0435\u0442\u044B, \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B).",
      "\u0422\u0435\u043A\u0441\u0442\u044B \u0437\u0430\u0434\u0430\u043D\u0438\u0439 \u0438 \u043D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u043E\u0442\u0432\u0435\u0442\u044B \u043C\u043E\u0433\u0443\u0442 \u043F\u0435\u0440\u0435\u0434\u0430\u0432\u0430\u0442\u044C\u0441\u044F \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0443 \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u0438\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u0430 \u0431\u0435\u0437 \u0438\u043C\u0435\u043D\u0438 \u0438 e-mail \u0440\u0435\u0431\u0451\u043D\u043A\u0430.",
      "\u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u0438 \u0432\u0441\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u043C\u043E\u0436\u043D\u043E \u0432 \u043B\u044E\u0431\u043E\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u043F\u0440\u043E\u0444\u0438\u043B\u044F."
    ],
    action: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u044E, \u0447\u0442\u043E \u044F \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u0438\u043B\u0438 \u043E\u043F\u0435\u043A\u0443\u043D, \u0438 \u0434\u0430\u044E \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u0435",
    expiry: (days) => `\u0421\u0441\u044B\u043B\u043A\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 ${days} \u0434\u043D\u0435\u0439. \u0411\u0435\u0437 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0431\u0443\u0434\u0435\u0442 \u0443\u0434\u0430\u043B\u0451\u043D.`,
    ignore: "\u0415\u0441\u043B\u0438 \u0432\u044B \u043D\u0435 \u0437\u043D\u0430\u0435\u0442\u0435 \u043E\u0431 \u044D\u0442\u043E\u043C \u0437\u0430\u043F\u0440\u043E\u0441\u0435, \u043F\u0440\u043E\u0441\u0442\u043E \u043F\u0440\u043E\u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0439\u0442\u0435 \u043F\u0438\u0441\u044C\u043C\u043E."
  },
  en: {
    subject: "Parental consent request \u2014 Matema",
    intro: (name) => `Your child (display name: "${name}") wants to create an account in Matema, a math practice trainer following the Polish curriculum.`,
    points: [
      "We store: display name, class, year of birth and practice history (tasks, answers, scores).",
      "Task texts and wrong answers may be sent to an artificial intelligence provider without the child's name or e-mail.",
      "The account and all data can be deleted at any time in the profile settings."
    ],
    action: "I confirm I am the parent or guardian and I give my consent",
    expiry: (days) => `The link is valid for ${days} days. Without confirmation the account will be deleted.`,
    ignore: "If you don't know about this request, just ignore this e-mail."
  }
};
function consentEmail(lang, { to, childName, link, days }) {
  const t = EMAIL[lang];
  const text = [t.intro(childName), "", ...t.points.map((p) => `- ${p}`), "", `${t.action}:`, link, "", t.expiry(days), t.ignore].join("\n");
  const html = `<p>${escapeHtml(t.intro(childName))}</p>
<ul>${t.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
<p><a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none">${escapeHtml(t.action)}</a></p>
<p style="color:#64748b">${escapeHtml(t.expiry(days))}<br>${escapeHtml(t.ignore)}</p>`;
  return { to, subject: t.subject, text, html };
}
var PAGE = {
  pl: {
    confirmed: "Dzi\u0119kujemy! Zgoda zosta\u0142a potwierdzona. Dziecko mo\u017Ce korzysta\u0107 z konta.",
    "already-confirmed": "Ta zgoda by\u0142a ju\u017C potwierdzona wcze\u015Bniej.",
    expired: "Link wygas\u0142. Popro\u015B dziecko o ponowne wys\u0142anie pro\u015Bby z ustawie\u0144 profilu.",
    invalid: "Link jest nieprawid\u0142owy lub zosta\u0142 ju\u017C zast\u0105piony nowszym."
  },
  ru: {
    confirmed: "\u0421\u043F\u0430\u0441\u0438\u0431\u043E! \u0421\u043E\u0433\u043B\u0430\u0441\u0438\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E. \u0420\u0435\u0431\u0451\u043D\u043E\u043A \u043C\u043E\u0436\u0435\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u043E\u043C.",
    "already-confirmed": "\u042D\u0442\u043E \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u0435 \u0443\u0436\u0435 \u0431\u044B\u043B\u043E \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E \u0440\u0430\u043D\u044C\u0448\u0435.",
    expired: "\u0421\u0440\u043E\u043A \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0441\u0441\u044B\u043B\u043A\u0438 \u0438\u0441\u0442\u0451\u043A. \u041F\u043E\u043F\u0440\u043E\u0441\u0438\u0442\u0435 \u0440\u0435\u0431\u0451\u043D\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043F\u0440\u043E\u0441 \u0437\u0430\u043D\u043E\u0432\u043E \u0438\u0437 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A \u043F\u0440\u043E\u0444\u0438\u043B\u044F.",
    invalid: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430 \u0438\u043B\u0438 \u0443\u0436\u0435 \u0437\u0430\u043C\u0435\u043D\u0435\u043D\u0430 \u0431\u043E\u043B\u0435\u0435 \u043D\u043E\u0432\u043E\u0439."
  },
  en: {
    confirmed: "Thank you! Consent has been confirmed. Your child can now use the account.",
    "already-confirmed": "This consent was already confirmed.",
    expired: "The link has expired. Ask your child to send the request again from the profile settings.",
    invalid: "The link is invalid or has been replaced by a newer one."
  }
};
function consentResultPage(lang, result) {
  const ok = result === "confirmed" || result === "already-confirmed";
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Matema</title></head>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px">
<main style="max-width:420px;background:#fff;border-radius:16px;padding:28px;box-shadow:0 1px 3px #0001;text-align:center">
<div style="font-size:40px">${ok ? "\u2705" : "\u26A0\uFE0F"}</div><p style="font-size:18px;line-height:1.5">${escapeHtml(PAGE[lang][result])}</p>
</main></body></html>`;
}

// apps/api/src/routes/consent.ts
function registerConsentRoutes(app, { db, mailer, publicUrl }) {
  app.post(
    "/api/me/parental-consent",
    { config: { rateLimit: { max: 5, timeWindow: "1 hour" } } },
    async (request, reply) => {
      const auth = requireUser(request, reply, db);
      if (!auth) return reply;
      const parsed = ParentalConsentRequest.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request", code: "BAD_REQUEST" });
      }
      const { parentEmail, lang } = parsed.data;
      if (auth.user.email && parentEmail === auth.user.email.toLowerCase()) {
        return reply.code(400).send({ error: "The parent's e-mail must differ from the student's", code: "PARENT_EMAIL_SAME" });
      }
      const profile = await auth.db.getProfile(auth.user);
      if (!profile) return reply.code(404).send({ error: "Profile not found", code: "NOT_FOUND" });
      if (!profile.consentRequired) return reply.code(409).send({ error: "Consent is not required", code: "CONSENT_NOT_REQUIRED" });
      const { token } = await auth.db.requestParentalConsent(auth.user.id, parentEmail, CONSENT_TEXT_VERSION);
      const link = `${publicUrl.replace(/\/$/, "")}/api/consent/confirm?token=${encodeURIComponent(token)}&lang=${lang}`;
      await mailer.send(consentEmail(lang, { to: parentEmail, childName: profile.displayName ?? "\u2014", link, days: CONSENT_LINK_DAYS }));
      return { ok: true, sentTo: maskEmail(parentEmail) };
    }
  );
  app.get(
    "/api/consent/confirm",
    { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const lang = Lang.safeParse(request.query.lang).data ?? "pl";
      if (!db) return reply.code(503).type("text/html").send(consentResultPage(lang, "invalid"));
      const result = await db.confirmParentalConsent(request.query.token ?? "");
      return reply.code(result === "confirmed" || result === "already-confirmed" ? 200 : 400).type("text/html; charset=utf-8").send(consentResultPage(lang, result));
    }
  );
}

// apps/api/src/routes/cron.ts
function registerCronRoutes(app, db) {
  app.get("/api/cron/cleanup-consents", async (request, reply) => {
    const secret = process.env.CRON_SECRET;
    if (secret && request.headers.authorization !== `Bearer ${secret}`) {
      return reply.code(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
    if (!db) return { deleted: 0, note: "accounts are not configured" };
    const deleted = await db.deleteUnconfirmedMinors();
    if (deleted > 0) request.log.info({ deleted }, "deleted accounts without parental consent");
    return { deleted };
  });
}

// apps/api/src/routes/me.ts
function registerMeRoutes(app, db) {
  app.get("/api/me/profile", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const profile = await auth.db.getProfile(auth.user);
    return profile ?? reply.code(404).send({ error: "Profile not found", code: "NOT_FOUND" });
  });
  app.patch("/api/me/profile", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const parsed = ProfileUpdate.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid profile", code: "BAD_REQUEST" });
    }
    const profile = await auth.db.updateProfile(auth.user, parsed.data);
    return profile ?? reply.code(404).send({ error: "Profile not found", code: "NOT_FOUND" });
  });
  app.get("/api/me/sessions", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const limit = Number(request.query.limit ?? 20);
    const before = request.query.before && !Number.isNaN(Date.parse(request.query.before)) ? request.query.before : void 0;
    const sessions = await auth.db.listSessions(auth.user.id, { limit: Number.isFinite(limit) ? limit : 20, before });
    return { sessions };
  });
  app.get("/api/me/sessions/:sessionId", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const detail = isUuid(request.params.sessionId) ? await auth.db.getSessionDetail(request.params.sessionId, auth.user.id) : null;
    return detail ?? reply.code(404).send({ error: "Session not found", code: "NOT_FOUND" });
  });
  app.get("/api/me/progress", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    return auth.db.progress(auth.user.id);
  });
  app.get("/api/me/export", { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } }, async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const data = await auth.db.exportData(auth.user);
    if (!data) return reply.code(404).send({ error: "Profile not found", code: "NOT_FOUND" });
    return reply.header("content-disposition", `attachment; filename="matema-data-${data.exportedAt.slice(0, 10)}.json"`).send(data);
  });
  app.delete("/api/me", { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } }, async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    await auth.db.deleteAccount(auth.user.id);
    return reply.code(204).send();
  });
}

// apps/api/src/routes/sessions.ts
function registerSessionRoutes(app, trainers2, db) {
  app.post("/api/sessions/:sessionId/answers", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const parsed = AnswerRequest.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid answer", code: "BAD_REQUEST" });
    }
    const { sessionId } = request.params;
    const { position, answer, usedHint } = parsed.data;
    const stored = isUuid(sessionId) ? await auth.db.getSessionTask(sessionId, auth.user.id, position) : null;
    if (!stored) return reply.code(404).send({ error: "Task not found", code: "NOT_FOUND" });
    if (stored.answered) return reply.code(409).send({ error: "Task already answered", code: "ALREADY_ANSWERED" });
    const trainer = trainers2.get(stored.trainerId);
    if (!trainer) return reply.code(500).send({ error: `Trainer ${stored.trainerId} is not available`, code: "UNKNOWN_TRAINER" });
    const correct = trainer.checkAnswer(stored.task, answer);
    const recorded = await auth.db.recordAnswer(sessionId, position, { answer, correct, usedHint });
    if (!recorded) return reply.code(409).send({ error: "Task already answered", code: "ALREADY_ANSWERED" });
    return { correct };
  });
  app.post("/api/sessions/:sessionId/finish", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const summary = isUuid(request.params.sessionId) ? await auth.db.finishSession(request.params.sessionId, auth.user.id) : null;
    if (!summary) return reply.code(404).send({ error: "Session not found", code: "NOT_FOUND" });
    const { tasks: _tasks, feedback: _feedback, ...rest } = summary;
    return rest;
  });
}

// apps/api/src/routes/tasks.ts
function registerTaskRoutes(app, pool) {
  app.post(
    "/api/tasks/:taskId/report",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const parsed = TaskReportRequest.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid report", code: "BAD_REQUEST" });
      }
      const reported = pool ? await pool.report(request.params.taskId, { userId: request.user?.id ?? null, reason: parsed.data.reason }) : false;
      if (!reported) return reply.code(404).send({ error: "Task not found", code: "NOT_FOUND" });
      return { ok: true };
    }
  );
}

// packages/trainer-sdk/src/server/index.ts
var MAX_BATCH = 5;
var MAX_ROUNDS = 3;
var CONCURRENCY = 3;
var silent = { info() {
}, warn() {
}, error() {
} };
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
function difficultyMix(count) {
  const hard = Math.round(count * 0.2);
  const easy = Math.round(count * 0.3);
  const medium = count - hard - easy;
  return shuffle([...Array(easy).fill(1), ...Array(medium).fill(2), ...Array(hard).fill(3)]);
}
function planSlots(topics, count, answerMode) {
  const chosen = topics.length > count ? shuffle(topics).slice(0, count) : shuffle(topics);
  const diffs = difficultyMix(count);
  const base = Math.floor(count / chosen.length);
  let extra = count % chosen.length;
  const slots = [];
  for (const topic2 of chosen) {
    const n = base + (extra-- > 0 ? 1 : 0);
    for (let i = 0; i < n; i++) slots.push({ topic: topic2, difficulty: diffs[slots.length], kind: "input" });
  }
  const kinds = shuffle(slots.map((_, i) => answerMode === "mixed" ? i % 2 ? "choice" : "input" : answerMode));
  slots.forEach((s, i) => s.kind = kinds[i]);
  return slots;
}
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}
function claimSlot(pending, task) {
  const kind = task.answerType === "choice" ? "choice" : "input";
  let idx = pending.findIndex((s) => s.topic.id === task.topicId && s.kind === kind);
  if (idx === -1) idx = pending.findIndex((s) => s.topic.id === task.topicId);
  if (idx === -1) return false;
  pending.splice(idx, 1);
  return true;
}
async function generateTasks(req, deps) {
  const { trainer, client, pool, log = silent } = deps;
  const reuseRatio = trainer.reuseRatio ?? deps.reuseRatio ?? 0.5;
  const usesLLM = trainer.usesLLM ?? true;
  const ctx = { trainerId: trainer.id, lang: req.lang, grade: req.grade, level: req.level };
  const allowed = new Map(trainer.topicsFor(req.grade, req.level).map((t) => [t.id, t]));
  const topics = req.topicIds.map((id) => allowed.get(id)).filter((t) => !!t);
  if (topics.length === 0) return { ok: false, code: "BAD_TOPICS" };
  let pending = planSlots(topics, req.count, req.answerMode);
  const exclude = new Set(req.excludeIds ?? []);
  const fromPool = [];
  const takeFromPool = async (slot, strictKind) => {
    if (!pool) return false;
    const [task] = await pool.take({
      ...ctx,
      topicId: slot.topic.id,
      answerMode: strictKind ? slot.kind : req.answerMode,
      tags: req.tagIds,
      difficulty: slot.difficulty,
      excludeIds: [...exclude],
      limit: 1
    });
    if (!task) return false;
    exclude.add(task.id);
    fromPool.push(task);
    return true;
  };
  const reuseTarget = pool ? Math.floor(req.count * reuseRatio) : 0;
  for (const slot of shuffle(pending)) {
    if (fromPool.length >= reuseTarget) break;
    if (await takeFromPool(slot, true)) pending = pending.filter((s) => s !== slot);
  }
  const generated = [];
  let lastError;
  let stop = false;
  let rejected = 0;
  let llmCalls = 0;
  for (let round = 0; usesLLM && round < MAX_ROUNDS && pending.length > 0 && !stop; round++) {
    await mapLimit(chunk(pending, MAX_BATCH), CONCURRENCY, async (slots) => {
      if (stop) return;
      try {
        llmCalls++;
        const raw = await trainer.generateTaskBatch(client, { lang: req.lang, grade: req.grade, level: req.level, slots });
        const allowedTopicIds = [...new Set(slots.map((s) => s.topic.id))];
        for (const item of raw) {
          const result = trainer.verifyTask(item, { allowedTopicIds, answerMode: req.answerMode });
          if (!result.ok) {
            const { reason } = result;
            rejected++;
            log.warn({ trainer: trainer.id, reason }, "task rejected");
          } else if (claimSlot(pending, result.task)) {
            generated.push(result.task);
          }
        }
      } catch (err) {
        lastError = err;
        log.error({ err, trainer: trainer.id }, "generation batch failed");
        if (err instanceof RateLimitError || err instanceof FatalLLMError) stop = true;
      }
    });
  }
  if (pool && generated.length > 0) {
    await pool.add(generated, ctx).catch((err) => log.error({ err, trainer: trainer.id }, "failed to store tasks in the pool"));
  }
  for (const t of generated) exclude.add(t.id);
  const reused = fromPool.length;
  for (const slot of [...pending]) {
    if (await takeFromPool(slot, false)) pending = pending.filter((s) => s !== slot);
  }
  const stats = {
    requested: req.count,
    reused,
    poolTopUp: fromPool.length - reused,
    generated: generated.length,
    rejected,
    llmCalls
  };
  log.info({ trainer: trainer.id, provider: client.name, ...stats }, "generate done");
  const tasks = [...fromPool, ...generated];
  if (tasks.length === 0) return { ok: false, code: lastError instanceof RateLimitError ? "RATE_LIMIT" : "LLM_ERROR", stats };
  return { ok: true, tasks: shuffle(tasks).sort((a, b) => a.difficulty - b.difficulty), stats };
}
async function generateFeedback(req, { trainer, client, log = silent }) {
  try {
    const parsed = FeedbackResponse.safeParse(await trainer.generateFeedback(client, req));
    if (!parsed.success) {
      log.warn({ trainer: trainer.id, issues: parsed.error.issues }, "invalid feedback from LLM");
      return { ok: false, code: "LLM_ERROR" };
    }
    const known = new Set(req.results.map((r) => r.topicId));
    const data = parsed.data;
    return {
      ok: true,
      data: {
        ...data,
        weakTopics: data.weakTopics.filter((w) => known.has(w.topicId)),
        suggestedTopicIds: [...new Set(data.suggestedTopicIds.filter((id) => known.has(id)))]
      }
    };
  } catch (err) {
    log.error({ err, trainer: trainer.id }, "feedback failed");
    return { ok: false, code: err instanceof RateLimitError ? "RATE_LIMIT" : "LLM_ERROR" };
  }
}

// apps/api/src/routes/trainers.ts
var STATUS = { BAD_TOPICS: 400, RATE_LIMIT: 429, LLM_ERROR: 502 };
var MESSAGES = {
  BAD_TOPICS: "No valid topics",
  RATE_LIMIT: "AI rate limit reached, try again later",
  LLM_ERROR: "AI request failed"
};
function registerTrainerRoutes(app, { client, trainers: trainers2, pool, reuseRatio, db }) {
  const findTrainer = (id, reply) => {
    const trainer = trainers2.get(id);
    if (!trainer) reply.code(404).send({ error: `Unknown trainer: ${id}`, code: "UNKNOWN_TRAINER" });
    return trainer;
  };
  app.get("/api/trainers", async () => ({ trainers: [...trainers2.keys()].map((id) => ({ id })) }));
  app.get(
    "/api/trainers/:trainerId/topics",
    async (request, reply) => {
      const trainer = findTrainer(request.params.trainerId, reply);
      if (!trainer) return reply;
      const grade = Grade.safeParse(request.query.grade);
      if (!grade.success) return reply.code(400).send({ error: "grade is required", code: "BAD_REQUEST" });
      const level = Level.safeParse(request.query.level);
      return { topics: trainer.topicsFor(grade.data, level.success ? level.data : void 0) };
    }
  );
  app.post(
    "/api/trainers/:trainerId/generate",
    { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const trainer = findTrainer(request.params.trainerId, reply);
      if (!trainer) return reply;
      const parsed = GenerateRequest.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request", code: "BAD_REQUEST" });
      }
      const req = parsed.data;
      const user = db ? request.user : null;
      if (user && db) {
        const seen = await db.seenTaskIds(user.id, trainer.id);
        req.excludeIds = [.../* @__PURE__ */ new Set([...req.excludeIds ?? [], ...seen])];
      }
      const outcome = await generateTasks(req, { trainer, client, pool, reuseRatio, log: request.log });
      if (!outcome.ok) {
        const { code } = outcome;
        return reply.code(STATUS[code]).send({ error: MESSAGES[code], code });
      }
      if (!user || !db) return { tasks: outcome.tasks };
      try {
        if (!await db.canStoreHistory(user.id)) return { tasks: outcome.tasks };
        const { lang, grade, level, topicIds, count, answerMode } = req;
        const sessionId = await db.createSession(user.id, trainer.id, { lang, grade, level, topicIds, count, answerMode }, outcome.tasks);
        return { tasks: outcome.tasks, sessionId };
      } catch (err) {
        request.log.error({ err }, "failed to store session");
        return { tasks: outcome.tasks };
      }
    }
  );
  app.post(
    "/api/trainers/:trainerId/feedback",
    { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const trainer = findTrainer(request.params.trainerId, reply);
      if (!trainer) return reply;
      const parsed = FeedbackRequest.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request", code: "BAD_REQUEST" });
      }
      const outcome = await generateFeedback(parsed.data, { trainer, client, log: request.log });
      if (!outcome.ok) {
        const { code } = outcome;
        return reply.code(STATUS[code]).send({ error: MESSAGES[code], code });
      }
      const { sessionId } = parsed.data;
      if (db && request.user && sessionId) {
        await db.saveFeedback(sessionId, request.user.id, outcome.data).catch((err) => request.log.error({ err }, "failed to store feedback"));
      }
      return outcome.data;
    }
  );
}

// packages/trainers/bio/src/answer.ts
var UNDECOMPOSABLE = { \u0142: "l", \u0111: "d", \u00F8: "o", \u00DF: "ss" };
function normalizeTerm(s) {
  return s.trim().toLowerCase().replace(/[łđøß]/g, (c) => UNDECOMPOSABLE[c]).normalize("NFD").replace(new RegExp("\\p{M}", "gu"), "").replace(/^[„“"'«»(\[]+|[„“"'«»)\].,;:!?]+$/g, "").replace(/^(the|a|an)\s+/, "").replace(/\s+/g, " ").trim();
}
function isTermCorrect(userAnswer, correctAnswer, acceptedAnswers) {
  const typed = normalizeTerm(userAnswer);
  if (!typed) return false;
  return [correctAnswer, ...acceptedAnswers ?? []].some((a) => normalizeTerm(a) === typed);
}
function parseQuantity(s) {
  const cleaned = s.trim().replace(/\s/g, "").replace(",", ".").replace(/^[^\d+-]*/, "").match(/^[+-]?\d*\.?\d+(?:[eE][+-]?\d+)?/);
  if (!cleaned) return null;
  const n = Number(cleaned[0]);
  return Number.isFinite(n) ? n : null;
}
function isNumberCorrect(userAnswer, correctAnswer) {
  const user = parseQuantity(userAnswer);
  const correct = parseQuantity(correctAnswer);
  if (user === null || correct === null) return false;
  return Math.abs(user - correct) <= Math.max(1e-9, Math.abs(correct) * 0.01);
}
function checkAnswer(task, answer) {
  switch (task.answerType) {
    case "choice":
      return answer.trim().toUpperCase() === (task.correctChoice ?? task.correctAnswer).toUpperCase();
    case "text":
      return isTermCorrect(answer, task.correctAnswer, task.acceptedAnswers);
    default:
      return isNumberCorrect(answer, task.correctAnswer);
  }
}

// packages/trainers/bio/src/curriculum/lo.ts
var lo = [
  topic(
    "bio.lo3.organism",
    "lo3",
    ["Organizm cz\u0142owieka jako funkcjonalna ca\u0142o\u015B\u0107", "\u041E\u0440\u0433\u0430\u043D\u0438\u0437\u043C \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430 \u043A\u0430\u043A \u0435\u0434\u0438\u043D\u043E\u0435 \u0446\u0435\u043B\u043E\u0435", "The human organism as a functional whole"],
    ["poziomy organizacji organizmu", "tkanka nab\u0142onkowa", "tkanka \u0142\u0105czna", "tkanka mi\u0119\u015Bniowa", "tkanka nerwowa", "homeostaza", "ujemne sprz\u0119\u017Cenie zwrotne", "transport przez b\u0142ony biologiczne"],
    "R"
  ),
  topic(
    "bio.lo3.skin",
    "lo3",
    ["Uk\u0142ad pow\u0142okowy", "\u041F\u043E\u043A\u0440\u043E\u0432\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The integumentary system"],
    ["budowa nask\xF3rka", "sk\xF3ra w\u0142a\u015Bciwa", "tkanka podsk\xF3rna", "wytwory nask\xF3rka", "termoregulacja", "receptory sk\xF3ry", "choroby i higiena sk\xF3ry"],
    "R"
  ),
  topic(
    "bio.lo3.motion",
    "lo3",
    ["Uk\u0142ad ruchu", "\u041E\u043F\u043E\u0440\u043D\u043E-\u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The musculoskeletal system"],
    ["budowa i sk\u0142ad chemiczny ko\u015Bci", "tkanka kostna", "szkielet osiowy", "szkielet ko\u0144czyn", "po\u0142\u0105czenia ko\u015Bci", "budowa stawu", "mi\u0119\u015Bnie szkieletowe", "mechanizm skurczu mi\u0119\u015Bnia", "antagonizm mi\u0119\u015Bni", "wady postawy"],
    "R"
  ),
  topic(
    "bio.lo3.digestion",
    "lo3",
    ["Uk\u0142ad pokarmowy", "\u041F\u0438\u0449\u0435\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The digestive system"],
    ["budowa przewodu pokarmowego", "enzymy trawienne", "trawienie i wch\u0142anianie", "rola w\u0105troby", "rola trzustki", "sk\u0142adniki pokarmowe", "witaminy i sole mineralne", "warto\u015B\u0107 energetyczna pokarmu", "wska\u017Anik BMI"],
    "R"
  ),
  topic(
    "bio.lo3.respiration",
    "lo3",
    ["Uk\u0142ad oddechowy", "\u0414\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The respiratory system"],
    ["drogi oddechowe", "p\u0119cherzyki p\u0142ucne", "wymiana gazowa", "transport tlenu i dwutlenku w\u0119gla", "mechanika oddychania", "obj\u0119to\u015Bci i pojemno\u015Bci p\u0142uc", "regulacja oddychania", "choroby uk\u0142adu oddechowego"],
    "R"
  ),
  topic(
    "bio.lo3.circulation",
    "lo3",
    ["Uk\u0142ad kr\u0105\u017Cenia. Odporno\u015B\u0107", "\u041A\u0440\u043E\u0432\u043E\u043E\u0431\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0438 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442", "Circulation and immunity"],
    ["budowa serca", "cykl pracy serca", "krwiobieg du\u017Cy i ma\u0142y", "naczynia krwiono\u015Bne", "sk\u0142ad i funkcje krwi", "grupy krwi", "konflikt serologiczny", "uk\u0142ad limfatyczny", "odporno\u015B\u0107 nieswoista", "odporno\u015B\u0107 swoista", "szczepionki i surowice"],
    "R"
  ),
  topic(
    "bio.lo3.urinary",
    "lo3",
    ["Uk\u0142ad moczowy", "\u041C\u043E\u0447\u0435\u0432\u044B\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The urinary system"],
    ["budowa nerki", "budowa nefronu", "filtracja k\u0142\u0119buszkowa", "resorpcja zwrotna", "sekrecja kanalikowa", "powstawanie moczu", "osmoregulacja", "rola ADH", "rola aldosteronu"],
    "R"
  ),
  topic(
    "bio.lo3.nervous",
    "lo3",
    ["Uk\u0142ad nerwowy", "\u041D\u0435\u0440\u0432\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The nervous system"],
    ["budowa neuronu", "tkanka nerwowa", "potencja\u0142 spoczynkowy", "potencja\u0142 czynno\u015Bciowy", "budowa i dzia\u0142anie synapsy", "neuroprzeka\u017Aniki", "budowa m\xF3zgowia", "rdze\u0144 kr\u0119gowy", "\u0142uk odruchowy", "uk\u0142ad autonomiczny"],
    "R"
  ),
  topic(
    "bio.lo3.senses",
    "lo3",
    ["Narz\u0105dy zmys\u0142\xF3w", "\u041E\u0440\u0433\u0430\u043D\u044B \u0447\u0443\u0432\u0441\u0442\u0432", "The sense organs"],
    ["budowa oka", "akomodacja", "wady wzroku", "budowa ucha", "narz\u0105d Cortiego", "narz\u0105d r\xF3wnowagi", "zmys\u0142 smaku", "zmys\u0142 w\u0119chu", "czucie sk\xF3rne"],
    "R"
  ),
  topic(
    "bio.lo3.hormones",
    "lo3",
    ["Uk\u0142ad hormonalny", "\u042D\u043D\u0434\u043E\u043A\u0440\u0438\u043D\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The endocrine system"],
    ["gruczo\u0142y dokrewne", "hormony i ich dzia\u0142anie", "o\u015B podwzg\xF3rze\u2013przysadka", "regulacja poziomu glukozy", "regulacja gospodarki wapniowej", "ujemne sprz\u0119\u017Cenie zwrotne", "nadczynno\u015B\u0107 i niedoczynno\u015B\u0107 gruczo\u0142\xF3w"],
    "R"
  ),
  topic(
    "bio.lo3.reproduction",
    "lo3",
    ["Rozmna\u017Canie i rozw\xF3j", "\u0420\u0430\u0437\u043C\u043D\u043E\u0436\u0435\u043D\u0438\u0435 \u0438 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435", "Reproduction and development"],
    ["budowa uk\u0142adu rozrodczego", "gametogeneza", "cykl miesi\u0105czkowy", "zap\u0142odnienie", "rozw\xF3j zarodkowy", "listki zarodkowe", "ci\u0105\u017Ca i por\xF3d", "rozw\xF3j postnatalny"],
    "R"
  )
];

// packages/trainers/bio/src/curriculum/tags.ts
var TAGS = [
  {
    id: "homeostaza",
    name: { pl: "Homeostaza i sprz\u0119\u017Cenie zwrotne", ru: "\u0413\u043E\u043C\u0435\u043E\u0441\u0442\u0430\u0437 \u0438 \u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C", en: "Homeostasis and feedback" },
    topicIds: ["bio.lo3.hormones", "bio.lo3.urinary"]
  },
  {
    id: "regulacja-hormonalna",
    name: { pl: "Regulacja hormonalna", ru: "\u0413\u043E\u0440\u043C\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F", en: "Hormonal regulation" },
    topicIds: ["bio.lo3.hormones"]
  },
  {
    id: "choroby",
    name: { pl: "Choroby i zaburzenia", ru: "\u0411\u043E\u043B\u0435\u0437\u043D\u0438 \u0438 \u043D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u044F", en: "Diseases and disorders" },
    topicIds: ["bio.lo3.hormones"]
  },
  {
    id: "obliczenia",
    name: { pl: "Zadania obliczeniowe", ru: "\u0420\u0430\u0441\u0447\u0451\u0442\u043D\u044B\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u044F", en: "Calculation tasks" },
    topicIds: ["bio.lo3.respiration", "bio.lo3.circulation", "bio.lo3.urinary"]
  }
];
var byId = new Map(TAGS.map((t) => [t.id, t]));

// packages/trainers/bio/src/curriculum/index.ts
var TOPICS = [...lo];
var byId2 = new Map(TOPICS.map((t) => [t.id, t]));
var getTopic = (id) => byId2.get(id);
function topicsFor(grade, level) {
  return TOPICS.filter((t) => t.grade === grade && (t.level !== "R" || level === "R"));
}

// packages/trainers/bio/src/server/feedback.ts
var WEAK_THRESHOLD = 0.6;
var STRONG_THRESHOLD = 0.9;
var PHRASES = {
  pl: {
    great: "\u015Awietny wynik \u2014 materia\u0142 masz opanowany.",
    good: "Dobry wynik, zosta\u0142o kilka rzeczy do dopracowania.",
    ok: "Podstawy s\u0105, ale warto jeszcze po\u0107wiczy\u0107.",
    low: "Ten materia\u0142 wymaga powt\xF3rki \u2014 spokojnie, to kwestia \u0107wicze\u0144.",
    weak: (pct) => `poprawnych odpowiedzi: ${pct}%`,
    reviewSubtopics: (topic2, subtopics) => `Powt\xF3rz temat \u201E${topic2}\u201D, zw\u0142aszcza: ${subtopics.join(", ")}.`,
    hintsUsed: (n) => `Skorzysta\u0142e\u015B z podpowiedzi ${n} razy \u2014 spr\xF3buj nast\u0119pnym razem najpierw odpowiedzie\u0107 bez nich.`,
    repeatWeak: "Powt\xF3rz sesj\u0119 z zaznaczonymi s\u0142abymi tematami.",
    keepGoing: "Utrzymaj tempo: kr\xF3tka sesja co kilka dni dzia\u0142a lepiej ni\u017C jedna d\u0142uga przed sprawdzianem."
  },
  ru: {
    great: "\u041E\u0442\u043B\u0438\u0447\u043D\u044B\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u2014 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u0443\u0441\u0432\u043E\u0435\u043D.",
    good: "\u0425\u043E\u0440\u043E\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442, \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u043F\u0430\u0440\u0443 \u043C\u0435\u0441\u0442.",
    ok: "\u0411\u0430\u0437\u0430 \u0435\u0441\u0442\u044C, \u043D\u043E \u0441\u0442\u043E\u0438\u0442 \u0435\u0449\u0451 \u043F\u043E\u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F.",
    low: "\u042D\u0442\u043E\u0442 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043D\u0443\u0436\u043D\u043E \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u2014 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E, \u044D\u0442\u043E \u0432\u043E\u043F\u0440\u043E\u0441 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438.",
    weak: (pct) => `\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0445 \u043E\u0442\u0432\u0435\u0442\u043E\u0432: ${pct}%`,
    reviewSubtopics: (topic2, subtopics) => `\u041F\u043E\u0432\u0442\u043E\u0440\u0438 \u0442\u0435\u043C\u0443 \xAB${topic2}\xBB, \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E: ${subtopics.join(", ")}.`,
    hintsUsed: (n) => `\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430\u043C\u0438 \u0442\u044B \u0432\u043E\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043B\u0441\u044F ${n} \u0440\u0430\u0437 \u2014 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0437 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u043E\u0442\u0432\u0435\u0442\u0438\u0442\u044C \u0431\u0435\u0437 \u043D\u0438\u0445.`,
    repeatWeak: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438 \u0441\u0435\u0441\u0441\u0438\u044E \u043F\u043E \u043E\u0442\u043C\u0435\u0447\u0435\u043D\u043D\u044B\u043C \u0441\u043B\u0430\u0431\u044B\u043C \u0442\u0435\u043C\u0430\u043C.",
    keepGoing: "\u0414\u0435\u0440\u0436\u0438 \u0442\u0435\u043C\u043F: \u043A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u0441\u0435\u0441\u0441\u0438\u044F \u0440\u0430\u0437 \u0432 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0434\u043D\u0435\u0439 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043B\u0443\u0447\u0448\u0435, \u0447\u0435\u043C \u043E\u0434\u043D\u0430 \u0434\u043B\u0438\u043D\u043D\u0430\u044F \u043F\u0435\u0440\u0435\u0434 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439."
  },
  en: {
    great: "Excellent \u2014 you know this material.",
    good: "Good result, a couple of things left to polish.",
    ok: "The basics are there, but more practice would help.",
    low: "This material needs a review \u2014 nothing a bit of practice won't fix.",
    weak: (pct) => `correct answers: ${pct}%`,
    reviewSubtopics: (topic2, subtopics) => `Review "${topic2}", especially: ${subtopics.join(", ")}.`,
    hintsUsed: (n) => `You used hints ${n} times \u2014 next time try answering without them first.`,
    repeatWeak: "Run another session on the topics marked weak.",
    keepGoing: "Keep the rhythm: a short session every few days beats one long one before the test."
  }
};
function scoreByTopic(results) {
  const map = /* @__PURE__ */ new Map();
  for (const r of results) {
    const s = map.get(r.topicId) ?? { topicId: r.topicId, ok: 0, total: 0, missedSubtopics: [] };
    s.total++;
    if (r.correct) s.ok++;
    else if (r.subtopic && !s.missedSubtopics.includes(r.subtopic)) s.missedSubtopics.push(r.subtopic);
    map.set(r.topicId, s);
  }
  return [...map.values()].sort((a, b) => a.ok / a.total - b.ok / b.total);
}
function buildFeedback(req) {
  const p = PHRASES[req.lang] ?? PHRASES.pl;
  const scores = scoreByTopic(req.results);
  const correct = req.results.filter((r) => r.correct).length;
  const ratio = req.results.length ? correct / req.results.length : 0;
  const summary = ratio >= STRONG_THRESHOLD ? p.great : ratio >= 0.7 ? p.good : ratio >= 0.5 ? p.ok : p.low;
  const weak = scores.filter((s) => s.ok / s.total < WEAK_THRESHOLD);
  const weakTopics = weak.map((s) => ({
    topicId: s.topicId,
    reason: p.weak(Math.round(s.ok / s.total * 100))
  }));
  const recommendations = [];
  for (const s of weak.slice(0, 3)) {
    const topic2 = getTopic(s.topicId);
    if (!topic2) continue;
    const focus = (s.missedSubtopics.length > 0 ? s.missedSubtopics : topic2.subtopics).slice(0, 3);
    recommendations.push(p.reviewSubtopics(topic2.name[req.lang] ?? topic2.name.pl, focus));
  }
  const hints = req.results.filter((r) => r.usedHint).length;
  if (hints >= 3) recommendations.push(p.hintsUsed(hints));
  if (weak.length > 0) recommendations.push(p.repeatWeak);
  if (recommendations.length === 0) recommendations.push(p.keepGoing);
  return {
    summary,
    weakTopics,
    recommendations: recommendations.slice(0, 4),
    suggestedTopicIds: weak.map((s) => s.topicId).slice(0, 5)
  };
}

// packages/trainers/bio/src/server/verifyTask.ts
import { randomUUID } from "node:crypto";

// packages/trainers/bio/src/server/crossCheck.ts
import { all, create } from "mathjs";
var math = create(all);
var evaluate = math.evaluate;
var blocked = () => {
  throw new Error("Function disabled");
};
math.import(
  { import: blocked, createUnit: blocked, evaluate: blocked, parse: blocked, simplify: blocked, derivative: blocked },
  { override: true }
);
function evaluateExpression(expression) {
  try {
    const value = evaluate(expression);
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

// packages/trainers/bio/src/server/verifyTask.ts
function verifyTask(raw, ctx) {
  if (!raw || typeof raw !== "object") return { ok: false, reason: "not an object" };
  const r = raw;
  for (const key of ["verifyExpression", "acceptedAnswers", "tags", "choices", "correctChoice", "hint"]) {
    if (r[key] === null || r[key] === "") delete r[key];
  }
  let topicId = typeof r.topicId === "string" ? r.topicId : void 0;
  if (!topicId && ctx.allowedTopicIds.length === 1) topicId = ctx.allowedTopicIds[0];
  if (!topicId || !ctx.allowedTopicIds.includes(topicId)) return { ok: false, reason: `unexpected topicId: ${topicId}` };
  const parsed = Task.safeParse({ ...r, id: ctx.id ?? randomUUID(), topicId });
  if (!parsed.success) return { ok: false, reason: `schema: ${parsed.error.issues[0]?.message}` };
  const task = parsed.data;
  if (ctx.answerMode === "choice" && task.answerType !== "choice") return { ok: false, reason: "expected choice task" };
  if (ctx.answerMode === "input" && task.answerType === "choice") return { ok: false, reason: "expected input task" };
  if (task.answerType === "expression") return { ok: false, reason: "biology has no algebraic answers" };
  if (task.answerType === "text") {
    if (normalizeTerm(task.correctAnswer) === "") return { ok: false, reason: "correctAnswer normalizes to nothing" };
    const forms = [task.correctAnswer, ...task.acceptedAnswers ?? []].map(normalizeTerm);
    if (new Set(forms).size !== forms.length) return { ok: false, reason: "duplicate accepted answers" };
    if (!isTermCorrect(task.correctAnswer, task.correctAnswer, task.acceptedAnswers)) {
      return { ok: false, reason: "correctAnswer does not match itself after normalization" };
    }
  }
  if (task.answerType === "number") {
    const answer = parseQuantity(task.correctAnswer);
    if (answer === null) return { ok: false, reason: "correctAnswer is not a number" };
    if (task.verifyExpression) {
      const computed = evaluateExpression(task.verifyExpression);
      if (computed === null) return { ok: false, reason: `verifyExpression does not evaluate: ${task.verifyExpression}` };
      if (Math.abs(computed - answer) > Math.max(1e-9, Math.abs(computed) * 1e-4)) {
        return { ok: false, reason: `verifyExpression (${computed}) != correctAnswer (${answer})` };
      }
    }
  }
  if (task.answerType === "choice") {
    const choices = task.choices;
    const labels = new Set(choices.map((c) => c.label));
    if (labels.size !== 4) return { ok: false, reason: "duplicate choice labels" };
    const texts = new Set(choices.map((c) => normalizeTerm(c.text)));
    if (texts.size !== 4) return { ok: false, reason: "duplicate choice texts" };
    const correct = choices.find((c) => c.label === task.correctChoice);
    if (!correct) return { ok: false, reason: "correctChoice is not one of the options" };
    task.correctAnswer = task.correctChoice;
  }
  return { ok: true, task };
}

// packages/trainers/bio/src/server/index.ts
var bioTrainer = {
  id: "bio",
  usesLLM: false,
  // the pool is the only source of tasks, so drain it for the whole batch instead of half of it
  reuseRatio: 1,
  topicsFor,
  getTopic,
  generateTaskBatch: async () => [],
  verifyTask,
  checkAnswer,
  generateFeedback: async (_client, input) => buildFeedback(input)
};

// packages/trainers/math/src/answer.ts
import { all as all2, create as create2 } from "mathjs";
var math2 = create2(all2);
var evaluate2 = math2.evaluate;
var parse = math2.parse;
var blocked2 = () => {
  throw new Error("Function disabled");
};
math2.import(
  {
    import: blocked2,
    createUnit: blocked2,
    evaluate: blocked2,
    parse: blocked2,
    simplify: blocked2,
    derivative: blocked2,
    resolve: blocked2,
    reviver: blocked2
  },
  { override: true }
);
var TOLERANCE = 1e-9;
function normalizeAnswer(raw) {
  let s = raw.trim();
  s = s.replace(/\$/g, "");
  s = s.replace(/\\left|\\right/g, "");
  s = s.replace(/\\cdot|\\times|[×·]/g, "*");
  s = s.replace(/\\div|÷|:/g, "/");
  s = s.replace(/\\pi|π/g, "pi");
  s = s.replace(/\\dfrac|\\tfrac/g, "\\frac");
  for (let i = 0; i < 5 && /\\frac\{/.test(s); i++) {
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)");
  }
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)");
  s = s.replace(/[−–—]/g, "-");
  s = s.replace(/²/g, "^2").replace(/³/g, "^3");
  s = s.replace(/√\s*(\([^()]*\)|\d+(?:[.,]\d+)?|[a-z])/gi, "sqrt($1)");
  s = s.replace(/[{}]/g, (c) => c === "{" ? "(" : ")");
  s = s.replace(/(\d),(\d)/g, "$1.$2");
  s = s.replace(/%$/, "");
  s = s.replace(/\s+/g, "");
  s = s.toLowerCase();
  s = s.replace(/^[a-z]=(?!=)/, "");
  s = s.replace(/(^|[^a-z])([a-z])\(/g, "$1$2*(").replace(/\)\(/g, ")*(");
  return s;
}
function evaluateNumber(expr, scope = {}) {
  try {
    const value = evaluate2(expr, { ...scope });
    const n = typeof value === "number" ? value : Number(value?.valueOf?.());
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
function nearlyEqual(a, b) {
  return Math.abs(a - b) <= TOLERANCE * Math.max(1, Math.abs(a), Math.abs(b));
}
function freeVariables(expr) {
  let node;
  try {
    node = parse(expr);
  } catch {
    return null;
  }
  const names = /* @__PURE__ */ new Set();
  node.traverse((n, _path, parent) => {
    if (n.type !== "SymbolNode") return;
    const name = n.name;
    const isFnName = parent?.type === "FunctionNode" && parent.fn === n;
    if (!isFnName && !(name in math2)) names.add(name);
  });
  return [...names];
}
function expressionsEqual(a, b) {
  const vars = freeVariables(b);
  const varsA = freeVariables(a);
  if (!vars || !varsA) return false;
  const allVars = [.../* @__PURE__ */ new Set([...vars, ...varsA])];
  if (allVars.length === 0) {
    const x = evaluateNumber(a);
    const y = evaluateNumber(b);
    return x !== null && y !== null && nearlyEqual(x, y);
  }
  let compared = 0;
  for (let i = 0; i < 12 && compared < 6; i++) {
    const scope = Object.fromEntries(allVars.map((v) => [v, Math.round((Math.random() * 10 - 5) * 1e3) / 1e3 + 0.137]));
    const x = evaluateNumber(a, scope);
    const y = evaluateNumber(b, scope);
    if (y === null) continue;
    if (x === null || !nearlyEqual(x, y)) return false;
    compared++;
  }
  return compared > 0;
}
function singleEqual(user, correct, type) {
  const u = normalizeAnswer(user);
  const c = normalizeAnswer(correct);
  if (!u) return false;
  if (u === c) return true;
  if (type === "expression") return expressionsEqual(u, c);
  const x = evaluateNumber(u);
  const y = evaluateNumber(c);
  return x !== null && y !== null && nearlyEqual(x, y);
}
var splitParts = (s) => s.split(/;|\s+(?:и|and|oraz|i|lub|или|or)\s+/i).map((p) => p.trim()).filter(Boolean);
function isAnswerCorrect(user, correct, type) {
  if (type === "choice") return user.trim().toUpperCase() === correct.trim().toUpperCase();
  const correctParts = splitParts(correct);
  const userParts = splitParts(user);
  if (correctParts.length <= 1) return userParts.length === 1 && singleEqual(userParts[0], correct, type);
  if (userParts.length !== correctParts.length) return false;
  const left = [...correctParts];
  for (const part of userParts) {
    const idx = left.findIndex((c) => singleEqual(part, c, type));
    if (idx === -1) return false;
    left.splice(idx, 1);
  }
  return true;
}

// packages/trainers/math/src/curriculum/lo.ts
var lo2 = [
  // ---- klasa 1 ----
  topic(
    "lo1.real",
    "lo1",
    ["Liczby rzeczywiste", "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0447\u0438\u0441\u043B\u0430", "Real numbers"],
    ["liczby wymierne i niewymierne", "przybli\u017Cenia i b\u0142\u0105d przybli\u017Cenia", "procenty i punkty procentowe", "notacja wyk\u0142adnicza"],
    "P"
  ),
  topic(
    "lo1.sets",
    "lo1",
    ["Zbiory i przedzia\u0142y", "\u041C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u0430 \u0438 \u043F\u0440\u043E\u043C\u0435\u0436\u0443\u0442\u043A\u0438", "Sets and intervals"],
    ["dzia\u0142ania na zbiorach", "przedzia\u0142y liczbowe", "warto\u015B\u0107 bezwzgl\u0119dna jako odleg\u0142o\u015B\u0107 na osi"],
    "P"
  ),
  topic(
    "lo1.powers",
    "lo1",
    ["Pot\u0119gi, pierwiastki i logarytmy", "\u0421\u0442\u0435\u043F\u0435\u043D\u0438, \u043A\u043E\u0440\u043D\u0438 \u0438 \u043B\u043E\u0433\u0430\u0440\u0438\u0444\u043C\u044B", "Powers, roots and logarithms"],
    ["pot\u0119gi o wyk\u0142adniku wymiernym", "dzia\u0142ania na pierwiastkach", "definicja logarytmu", "w\u0142asno\u015Bci logarytm\xF3w"],
    "P"
  ),
  topic(
    "lo1.expressions",
    "lo1",
    ["Wyra\u017Cenia algebraiczne", "\u0410\u043B\u0433\u0435\u0431\u0440\u0430\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u044F", "Algebraic expressions"],
    ["wzory skr\xF3conego mno\u017Cenia", "rozk\u0142ad na czynniki", "usuwanie niewymierno\u015Bci z mianownika"],
    "P"
  ),
  topic(
    "lo1.linearEq",
    "lo1",
    ["R\xF3wnania i nier\xF3wno\u015Bci liniowe", "\u041B\u0438\u043D\u0435\u0439\u043D\u044B\u0435 \u0443\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F \u0438 \u043D\u0435\u0440\u0430\u0432\u0435\u043D\u0441\u0442\u0432\u0430", "Linear equations and inequalities"],
    ["r\xF3wnania liniowe", "nier\xF3wno\u015Bci liniowe", "zadania tekstowe"],
    "P"
  ),
  topic(
    "lo1.systems",
    "lo1",
    ["Uk\u0142ady r\xF3wna\u0144 liniowych", "\u0421\u0438\u0441\u0442\u0435\u043C\u044B \u043B\u0438\u043D\u0435\u0439\u043D\u044B\u0445 \u0443\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0439", "Systems of linear equations"],
    ["metoda podstawiania", "metoda przeciwnych wsp\xF3\u0142czynnik\xF3w", "interpretacja geometryczna", "zadania tekstowe"],
    "P"
  ),
  topic(
    "lo1.functions",
    "lo1",
    ["Funkcje i ich w\u0142asno\u015Bci", "\u0424\u0443\u043D\u043A\u0446\u0438\u0438 \u0438 \u0438\u0445 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u0430", "Functions and their properties"],
    ["dziedzina i zbi\xF3r warto\u015Bci", "miejsca zerowe", "monotoniczno\u015B\u0107", "warto\u015B\u0107 funkcji dla argumentu"],
    "P"
  ),
  topic(
    "lo1.linearFn",
    "lo1",
    ["Funkcja liniowa", "\u041B\u0438\u043D\u0435\u0439\u043D\u0430\u044F \u0444\u0443\u043D\u043A\u0446\u0438\u044F", "Linear function"],
    ["wz\xF3r i wykres funkcji liniowej", "wsp\xF3\u0142czynnik kierunkowy", "proste r\xF3wnoleg\u0142e i prostopad\u0142e", "prosta przez dwa punkty"],
    "P"
  ),
  topic(
    "lo1.triangles",
    "lo1",
    ["Planimetria \u2013 tr\xF3jk\u0105ty", "\u041F\u043B\u0430\u043D\u0438\u043C\u0435\u0442\u0440\u0438\u044F \u2014 \u0442\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0438", "Geometry \u2013 triangles"],
    ["twierdzenie Pitagorasa", "podobie\u0144stwo tr\xF3jk\u0105t\xF3w", "twierdzenie Talesa", "k\u0105ty w tr\xF3jk\u0105cie"],
    "P"
  ),
  topic(
    "lo1.absR",
    "lo1",
    ["R\xF3wnania i nier\xF3wno\u015Bci z warto\u015Bci\u0105 bezwzgl\u0119dn\u0105", "\u0423\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F \u0438 \u043D\u0435\u0440\u0430\u0432\u0435\u043D\u0441\u0442\u0432\u0430 \u0441 \u043C\u043E\u0434\u0443\u043B\u0435\u043C", "Absolute value equations and inequalities"],
    ["r\xF3wnania z warto\u015Bci\u0105 bezwzgl\u0119dn\u0105", "nier\xF3wno\u015Bci z warto\u015Bci\u0105 bezwzgl\u0119dn\u0105", "warto\u015B\u0107 bezwzgl\u0119dna w wyra\u017Ceniach"],
    "R"
  ),
  topic(
    "lo1.paramR",
    "lo1",
    ["Uk\u0142ady r\xF3wna\u0144 z parametrem", "\u0421\u0438\u0441\u0442\u0435\u043C\u044B \u0443\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0439 \u0441 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u043C", "Systems of equations with a parameter"],
    ["liczba rozwi\u0105za\u0144 uk\u0142adu", "uk\u0142ady oznaczone, nieoznaczone i sprzeczne"],
    "R"
  ),
  topic(
    "lo1.logR",
    "lo1",
    ["Logarytmy \u2013 rozszerzenie", "\u041B\u043E\u0433\u0430\u0440\u0438\u0444\u043C\u044B (\u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C)", "Logarithms (extended)"],
    ["zmiana podstawy logarytmu", "wyra\u017Cenia z logarytmami", "proste r\xF3wnania logarytmiczne"],
    "R"
  ),
  // ---- klasa 2 ----
  topic(
    "lo2.transform",
    "lo2",
    ["Przekszta\u0142cenia wykres\xF3w funkcji", "\u041F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0433\u0440\u0430\u0444\u0438\u043A\u043E\u0432 \u0444\u0443\u043D\u043A\u0446\u0438\u0439", "Graph transformations"],
    ["przesuni\u0119cie o wektor", "symetria wzgl\u0119dem osi uk\u0142adu", "w\u0142asno\u015Bci funkcji po przekszta\u0142ceniu"],
    "P"
  ),
  topic(
    "lo2.quadratic",
    "lo2",
    ["Funkcja kwadratowa", "\u041A\u0432\u0430\u0434\u0440\u0430\u0442\u0438\u0447\u043D\u0430\u044F \u0444\u0443\u043D\u043A\u0446\u0438\u044F", "Quadratic function"],
    ["posta\u0107 og\xF3lna, kanoniczna i iloczynowa", "wierzcho\u0142ek paraboli", "najmniejsza i najwi\u0119ksza warto\u015B\u0107 w przedziale"],
    "P"
  ),
  topic(
    "lo2.quadEq",
    "lo2",
    ["R\xF3wnania i nier\xF3wno\u015Bci kwadratowe", "\u041A\u0432\u0430\u0434\u0440\u0430\u0442\u043D\u044B\u0435 \u0443\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F \u0438 \u043D\u0435\u0440\u0430\u0432\u0435\u043D\u0441\u0442\u0432\u0430", "Quadratic equations and inequalities"],
    ["wyr\xF3\u017Cnik i pierwiastki", "nier\xF3wno\u015Bci kwadratowe", "zadania tekstowe"],
    "P"
  ),
  // added per docs/curriculum-review.md §5 (LO2): polynomials at basic level belong in class 2,
  // not only as lo2.polynomialsR (extended) — the current podstawa (2024) covers this on level P too.
  topic(
    "lo2.polynomials",
    "lo2",
    ["Wielomiany", "\u041C\u043D\u043E\u0433\u043E\u0447\u043B\u0435\u043D\u044B", "Polynomials"],
    ["stopie\u0144 i wsp\xF3\u0142czynniki", "dodawanie, odejmowanie i mno\u017Cenie wielomian\xF3w", "wy\u0142\u0105czanie jednomianu przed nawias", "r\xF3wnania wielomianowe w postaci iloczynowej"],
    "P"
  ),
  topic(
    "lo2.quadrilaterals",
    "lo2",
    ["Planimetria \u2013 czworok\u0105ty i pola", "\u041F\u043B\u0430\u043D\u0438\u043C\u0435\u0442\u0440\u0438\u044F \u2014 \u0447\u0435\u0442\u044B\u0440\u0451\u0445\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0438 \u0438 \u043F\u043B\u043E\u0449\u0430\u0434\u0438", "Geometry \u2013 quadrilaterals and areas"],
    ["w\u0142asno\u015Bci czworok\u0105t\xF3w", "pola czworok\u0105t\xF3w", "pola figur podobnych"],
    "P"
  ),
  topic(
    "lo2.trigAcute",
    "lo2",
    ["Trygonometria k\u0105ta ostrego", "\u0422\u0440\u0438\u0433\u043E\u043D\u043E\u043C\u0435\u0442\u0440\u0438\u044F \u043E\u0441\u0442\u0440\u043E\u0433\u043E \u0443\u0433\u043B\u0430", "Trigonometry of acute angles"],
    ["definicje sinusa, cosinusa i tangensa", "warto\u015Bci dla 30\xB0, 45\xB0, 60\xB0", "podstawowe to\u017Csamo\u015Bci", "zastosowania w tr\xF3jk\u0105tach"],
    "P"
  ),
  topic(
    "lo2.quadParamR",
    "lo2",
    ["Funkcja kwadratowa z parametrem", "\u041A\u0432\u0430\u0434\u0440\u0430\u0442\u0438\u0447\u043D\u0430\u044F \u0444\u0443\u043D\u043A\u0446\u0438\u044F \u0441 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u043C", "Quadratics with a parameter"],
    ["wzory Vi\xE8te'a", "liczba rozwi\u0105za\u0144 w zale\u017Cno\u015Bci od parametru"],
    "R"
  ),
  topic(
    "lo2.polynomialsR",
    "lo2",
    ["Wielomiany", "\u041C\u043D\u043E\u0433\u043E\u0447\u043B\u0435\u043D\u044B", "Polynomials"],
    ["dzia\u0142ania na wielomianach", "dzielenie wielomian\xF3w", "twierdzenie B\xE9zouta", "r\xF3wnania wielomianowe"],
    "R"
  ),
  topic(
    "lo2.rationalR",
    "lo2",
    ["Funkcje wymierne", "\u0420\u0430\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0444\u0443\u043D\u043A\u0446\u0438\u0438", "Rational functions"],
    ["wyra\u017Cenia wymierne", "r\xF3wnania wymierne", "nier\xF3wno\u015Bci wymierne", "hiperbola"],
    "R"
  ),
  topic(
    "lo2.trigAnyR",
    "lo2",
    ["Trygonometria dowolnego k\u0105ta", "\u0422\u0440\u0438\u0433\u043E\u043D\u043E\u043C\u0435\u0442\u0440\u0438\u044F \u043B\u044E\u0431\u043E\u0433\u043E \u0443\u0433\u043B\u0430", "Trigonometry of any angle"],
    ["miara \u0142ukowa", "wzory redukcyjne", "wykresy funkcji trygonometrycznych", "wzory na sin 2x i cos 2x"],
    "R"
  ),
  topic(
    "lo2.circlesR",
    "lo2",
    ["Okr\u0119gi i ko\u0142a", "\u041E\u043A\u0440\u0443\u0436\u043D\u043E\u0441\u0442\u0438 \u0438 \u043A\u0440\u0443\u0433\u0438", "Circles"],
    ["k\u0105ty \u015Brodkowe i wpisane", "styczna do okr\u0119gu", "okr\u0105g wpisany i opisany", "twierdzenie sinus\xF3w i cosinus\xF3w"],
    "R"
  ),
  // ---- klasa 3 ----
  topic(
    "lo3.polynomials",
    "lo3",
    ["Wielomiany", "\u041C\u043D\u043E\u0433\u043E\u0447\u043B\u0435\u043D\u044B", "Polynomials"],
    ["dzia\u0142ania na wielomianach", "rozk\u0142ad na czynniki", "proste r\xF3wnania wielomianowe"],
    "P"
  ),
  topic(
    "lo3.rational",
    "lo3",
    ["Funkcje wymierne", "\u0420\u0430\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0444\u0443\u043D\u043A\u0446\u0438\u0438", "Rational functions"],
    ["proporcjonalno\u015B\u0107 odwrotna", "wyra\u017Cenia wymierne", "proste r\xF3wnania wymierne"],
    "P"
  ),
  topic(
    "lo3.sequences",
    "lo3",
    ["Ci\u0105gi", "\u041F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438", "Sequences"],
    ["ci\u0105g arytmetyczny", "ci\u0105g geometryczny", "suma n pocz\u0105tkowych wyraz\xF3w", "procent sk\u0142adany"],
    "P"
  ),
  topic(
    "lo3.analytic",
    "lo3",
    ["Geometria analityczna", "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0433\u0435\u043E\u043C\u0435\u0442\u0440\u0438\u044F", "Analytic geometry"],
    ["odleg\u0142o\u015B\u0107 punkt\xF3w", "\u015Brodek odcinka", "r\xF3wnanie prostej", "r\xF3wnanie okr\u0119gu"],
    "P"
  ),
  topic(
    "lo3.expLog",
    "lo3",
    ["Funkcja wyk\u0142adnicza i logarytmy", "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0444\u0443\u043D\u043A\u0446\u0438\u044F \u0438 \u043B\u043E\u0433\u0430\u0440\u0438\u0444\u043C\u044B", "Exponential function and logarithms"],
    ["w\u0142asno\u015Bci funkcji wyk\u0142adniczej", "obliczanie logarytm\xF3w", "zastosowania (wzrost i zanik)"],
    "P"
  ),
  topic(
    "lo3.trig",
    "lo3",
    ["Trygonometria", "\u0422\u0440\u0438\u0433\u043E\u043D\u043E\u043C\u0435\u0442\u0440\u0438\u044F", "Trigonometry"],
    ["funkcje trygonometryczne k\u0105ta rozwartego", "pole tr\xF3jk\u0105ta ze wzoru z sinusem", "twierdzenie cosinus\xF3w"],
    "P"
  ),
  topic(
    "lo3.limitsR",
    "lo3",
    ["Granice ci\u0105g\xF3w", "\u041F\u0440\u0435\u0434\u0435\u043B\u044B \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0435\u0439", "Limits of sequences"],
    ["granica ci\u0105gu", "szereg geometryczny zbie\u017Cny"],
    "R"
  ),
  topic(
    "lo3.trigEqR",
    "lo3",
    ["R\xF3wnania trygonometryczne", "\u0422\u0440\u0438\u0433\u043E\u043D\u043E\u043C\u0435\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0443\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F", "Trigonometric equations"],
    ["r\xF3wnania trygonometryczne", "nier\xF3wno\u015Bci trygonometryczne", "to\u017Csamo\u015Bci trygonometryczne"],
    "R"
  ),
  topic(
    "lo3.analyticR",
    "lo3",
    ["Geometria analityczna \u2013 rozszerzenie", "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0433\u0435\u043E\u043C\u0435\u0442\u0440\u0438\u044F (\u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u043D\u044B\u0439)", "Analytic geometry (extended)"],
    ["odleg\u0142o\u015B\u0107 punktu od prostej", "wzajemne po\u0142o\u017Cenie prostej i okr\u0119gu", "wzajemne po\u0142o\u017Cenie okr\u0119g\xF3w"],
    "R"
  ),
  topic(
    "lo3.derivativesR",
    "lo3",
    ["Pochodna funkcji", "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u043D\u0430\u044F \u0444\u0443\u043D\u043A\u0446\u0438\u0438", "Derivatives"],
    ["granica funkcji", "pochodna funkcji", "styczna do wykresu", "monotoniczno\u015B\u0107 i ekstrema"],
    "R"
  ),
  // ---- klasa 4 ----
  topic(
    "lo4.stereometry",
    "lo4",
    ["Stereometria", "\u0421\u0442\u0435\u0440\u0435\u043E\u043C\u0435\u0442\u0440\u0438\u044F", "Solid geometry"],
    ["graniastos\u0142upy i ostros\u0142upy", "walec, sto\u017Cek i kula", "k\u0105ty w bry\u0142ach", "pole powierzchni i obj\u0119to\u015B\u0107"],
    "P"
  ),
  topic(
    "lo4.combinatorics",
    "lo4",
    ["Kombinatoryka", "\u041A\u043E\u043C\u0431\u0438\u043D\u0430\u0442\u043E\u0440\u0438\u043A\u0430", "Combinatorics"],
    ["regu\u0142a mno\u017Cenia i dodawania", "permutacje", "zliczanie mo\u017Cliwo\u015Bci"],
    "P"
  ),
  topic(
    "lo4.probability",
    "lo4",
    ["Rachunek prawdopodobie\u0144stwa", "\u0422\u0435\u043E\u0440\u0438\u044F \u0432\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u0435\u0439", "Probability"],
    ["klasyczna definicja prawdopodobie\u0144stwa", "zdarzenie przeciwne", "do\u015Bwiadczenia wieloetapowe"],
    "P"
  ),
  topic(
    "lo4.statistics",
    "lo4",
    ["Statystyka", "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430", "Statistics"],
    ["\u015Brednia arytmetyczna i wa\u017Cona", "mediana i dominanta", "odchylenie standardowe"],
    "P"
  ),
  topic(
    "lo4.review",
    "lo4",
    ["Powt\xF3rka maturalna", "\u041F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u0438\u0435 \u043A \u043C\u0430\u0442\u0443\u0440\u0435", "Matura review"],
    ["zadania zamkni\u0119te typu maturalnego z r\xF3\u017Cnych dzia\u0142\xF3w"],
    "P"
  ),
  topic(
    "lo4.combinatoricsR",
    "lo4",
    ["Kombinatoryka \u2013 rozszerzenie", "\u041A\u043E\u043C\u0431\u0438\u043D\u0430\u0442\u043E\u0440\u0438\u043A\u0430 (\u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u043D\u044B\u0439)", "Combinatorics (extended)"],
    ["symbol Newtona", "kombinacje i wariacje", "dwumian Newtona"],
    "R"
  ),
  topic(
    "lo4.conditionalR",
    "lo4",
    ["Prawdopodobie\u0144stwo warunkowe i ca\u0142kowite", "\u0423\u0441\u043B\u043E\u0432\u043D\u0430\u044F \u0438 \u043F\u043E\u043B\u043D\u0430\u044F \u0432\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C", "Conditional and total probability"],
    ["prawdopodobie\u0144stwo warunkowe", "wz\xF3r na prawdopodobie\u0144stwo ca\u0142kowite"],
    "R"
  ),
  topic(
    "lo4.bernoulliR",
    "lo4",
    ["Schemat Bernoulliego", "\u0421\u0445\u0435\u043C\u0430 \u0411\u0435\u0440\u043D\u0443\u043B\u043B\u0438", "Bernoulli trials"],
    ["prawdopodobie\u0144stwo k sukces\xF3w w n pr\xF3bach"],
    "R"
  ),
  topic(
    "lo4.optimizationR",
    "lo4",
    ["Optymalizacja", "\u0417\u0430\u0434\u0430\u0447\u0438 \u043D\u0430 \u043E\u043F\u0442\u0438\u043C\u0438\u0437\u0430\u0446\u0438\u044E", "Optimization problems"],
    ["zadania optymalizacyjne z pochodn\u0105", "najwi\u0119ksza i najmniejsza warto\u015B\u0107 funkcji"],
    "R"
  )
];

// packages/trainers/math/src/curriculum/sp.ts
var sp = [
  // ---- klasa 5 ----
  topic(
    "sp5.natural",
    "sp5",
    ["Dzia\u0142ania na liczbach naturalnych", "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0441 \u043D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0447\u0438\u0441\u043B\u0430\u043C\u0438", "Operations on natural numbers"],
    ["dzia\u0142ania pisemne", "kolejno\u015B\u0107 wykonywania dzia\u0142a\u0144", "pot\u0119gi o wyk\u0142adniku naturalnym", "zadania tekstowe"]
  ),
  topic(
    "sp5.divisibility",
    "sp5",
    ["W\u0142asno\u015Bci liczb naturalnych", "\u0414\u0435\u043B\u0438\u043C\u043E\u0441\u0442\u044C \u043D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u044B\u0445 \u0447\u0438\u0441\u0435\u043B", "Divisibility of natural numbers"],
    ["cechy podzielno\u015Bci", "liczby pierwsze i z\u0142o\u017Cone", "rozk\u0142ad na czynniki pierwsze", "NWD i NWW"]
  ),
  topic(
    "sp5.fractions",
    "sp5",
    ["U\u0142amki zwyk\u0142e", "\u041E\u0431\u044B\u043A\u043D\u043E\u0432\u0435\u043D\u043D\u044B\u0435 \u0434\u0440\u043E\u0431\u0438", "Common fractions"],
    ["skracanie i rozszerzanie u\u0142amk\xF3w", "por\xF3wnywanie u\u0142amk\xF3w", "liczby mieszane", "dodawanie i odejmowanie", "mno\u017Cenie i dzielenie"]
  ),
  topic(
    "sp5.decimals",
    "sp5",
    ["U\u0142amki dziesi\u0119tne", "\u0414\u0435\u0441\u044F\u0442\u0438\u0447\u043D\u044B\u0435 \u0434\u0440\u043E\u0431\u0438", "Decimals"],
    ["zamiana u\u0142amk\xF3w zwyk\u0142ych na dziesi\u0119tne", "por\xF3wnywanie", "dzia\u0142ania na u\u0142amkach dziesi\u0119tnych", "jednostki d\u0142ugo\u015Bci i masy"]
  ),
  topic(
    "sp5.integers",
    "sp5",
    ["Liczby ca\u0142kowite", "\u0426\u0435\u043B\u044B\u0435 \u0447\u0438\u0441\u043B\u0430", "Integers"],
    ["liczby ca\u0142kowite na osi liczbowej", "por\xF3wnywanie", "dodawanie i odejmowanie liczb ca\u0142kowitych"]
  ),
  topic(
    "sp5.angles",
    "sp5",
    ["Proste, odcinki i k\u0105ty", "\u041F\u0440\u044F\u043C\u044B\u0435, \u043E\u0442\u0440\u0435\u0437\u043A\u0438 \u0438 \u0443\u0433\u043B\u044B", "Lines, segments and angles"],
    ["rodzaje k\u0105t\xF3w", "k\u0105ty przyleg\u0142e i wierzcho\u0142kowe", "proste prostopad\u0142e i r\xF3wnoleg\u0142e"]
  ),
  topic(
    "sp5.polygons",
    "sp5",
    ["Tr\xF3jk\u0105ty i czworok\u0105ty", "\u0422\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0438 \u0438 \u0447\u0435\u0442\u044B\u0440\u0451\u0445\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0438", "Triangles and quadrilaterals"],
    ["suma k\u0105t\xF3w w tr\xF3jk\u0105cie", "rodzaje tr\xF3jk\u0105t\xF3w", "w\u0142asno\u015Bci czworok\u0105t\xF3w", "obwody wielok\u0105t\xF3w"]
  ),
  topic(
    "sp5.area",
    "sp5",
    ["Pola wielok\u0105t\xF3w", "\u041F\u043B\u043E\u0449\u0430\u0434\u0438 \u043C\u043D\u043E\u0433\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u043E\u0432", "Areas of polygons"],
    ["pole prostok\u0105ta i kwadratu", "pole r\xF3wnoleg\u0142oboku i rombu", "pole tr\xF3jk\u0105ta", "pole trapezu", "jednostki pola"]
  ),
  topic(
    "sp5.cuboids",
    "sp5",
    ["Prostopad\u0142o\u015Bciany i sze\u015Bciany", "\u041F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043B\u043B\u0435\u043B\u0435\u043F\u0438\u043F\u0435\u0434\u044B \u0438 \u043A\u0443\u0431\u044B", "Cuboids and cubes"],
    ["siatki bry\u0142", "pole powierzchni", "obj\u0119to\u015B\u0107", "jednostki obj\u0119to\u015Bci"]
  ),
  // ---- klasa 6 ----
  topic(
    "sp6.fractionOps",
    "sp6",
    ["Dzia\u0142ania na u\u0142amkach", "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0441 \u0434\u0440\u043E\u0431\u044F\u043C\u0438", "Operations with fractions"],
    ["u\u0142amki zwyk\u0142e i dziesi\u0119tne w jednym wyra\u017Ceniu", "kolejno\u015B\u0107 dzia\u0142a\u0144", "u\u0142amek danej liczby", "zaokr\u0105glanie"]
  ),
  topic(
    "sp6.rational",
    "sp6",
    ["Liczby dodatnie i ujemne", "\u041F\u043E\u043B\u043E\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0438 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0447\u0438\u0441\u043B\u0430", "Positive and negative numbers"],
    ["liczby wymierne na osi", "warto\u015B\u0107 bezwzgl\u0119dna", "cztery dzia\u0142ania na liczbach wymiernych", "pot\u0119gi liczb ujemnych"]
  ),
  topic(
    "sp6.algebra",
    "sp6",
    ["Wyra\u017Cenia algebraiczne i r\xF3wnania", "\u0411\u0443\u043A\u0432\u0435\u043D\u043D\u044B\u0435 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0438 \u0443\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F", "Algebraic expressions and equations"],
    ["zapisywanie wyra\u017Ce\u0144 algebraicznych", "warto\u015B\u0107 liczbowa wyra\u017Cenia", "redukcja wyraz\xF3w podobnych", "proste r\xF3wnania"]
  ),
  topic(
    "sp6.plane",
    "sp6",
    ["Figury na p\u0142aszczy\u017Anie", "\u0424\u0438\u0433\u0443\u0440\u044B \u043D\u0430 \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u0438", "Plane figures"],
    ["k\u0105ty w wielok\u0105tach", "okr\u0105g i ko\u0142o", "w\u0142asno\u015Bci tr\xF3jk\u0105t\xF3w", "w\u0142asno\u015Bci czworok\u0105t\xF3w"]
  ),
  topic(
    "sp6.area",
    "sp6",
    ["Pola i obwody wielok\u0105t\xF3w", "\u041F\u043B\u043E\u0449\u0430\u0434\u0438 \u0438 \u043F\u0435\u0440\u0438\u043C\u0435\u0442\u0440\u044B", "Area and perimeter"],
    ["pola wielok\u0105t\xF3w", "zamiana jednostek pola", "zadania tekstowe z polem"]
  ),
  topic(
    "sp6.solids",
    "sp6",
    ["Graniastos\u0142upy i ostros\u0142upy", "\u041F\u0440\u0438\u0437\u043C\u044B \u0438 \u043F\u0438\u0440\u0430\u043C\u0438\u0434\u044B", "Prisms and pyramids"],
    ["rodzaje bry\u0142", "siatki", "pole powierzchni graniastos\u0142upa", "obj\u0119to\u015B\u0107 graniastos\u0142upa"]
  ),
  topic(
    "sp6.word",
    "sp6",
    ["Zadania tekstowe", "\u0422\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0435 \u0437\u0430\u0434\u0430\u0447\u0438", "Word problems"],
    ["pr\u0119dko\u015B\u0107, droga, czas", "zakupy i ceny", "skala i plan", "obliczenia zegarowe i kalendarzowe"]
  ),
  // ---- klasa 7 ----
  topic(
    "sp7.numbers",
    "sp7",
    ["Liczby i dzia\u0142ania", "\u0427\u0438\u0441\u043B\u0430 \u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F", "Numbers and operations"],
    ["liczby wymierne", "zaokr\u0105glanie i szacowanie", "kolejno\u015B\u0107 dzia\u0142a\u0144", "rozwini\u0119cia dziesi\u0119tne"]
  ),
  topic(
    "sp7.percent",
    "sp7",
    ["Procenty", "\u041F\u0440\u043E\u0446\u0435\u043D\u0442\u044B", "Percentages"],
    ["procent danej liczby", "liczba z danego procentu", "jakim procentem jednej liczby jest druga", "podwy\u017Cki i obni\u017Cki"]
  ),
  topic(
    "sp7.powers",
    "sp7",
    ["Pot\u0119gi", "\u0421\u0442\u0435\u043F\u0435\u043D\u0438", "Powers"],
    ["iloczyn i iloraz pot\u0119g", "pot\u0119ga pot\u0119gi", "pot\u0119ga o wyk\u0142adniku ca\u0142kowitym ujemnym", "notacja wyk\u0142adnicza"]
  ),
  topic(
    "sp7.roots",
    "sp7",
    ["Pierwiastki", "\u041A\u043E\u0440\u043D\u0438", "Roots"],
    ["pierwiastek kwadratowy i sze\u015Bcienny", "wy\u0142\u0105czanie czynnika przed znak pierwiastka", "dzia\u0142ania na pierwiastkach", "szacowanie pierwiastk\xF3w"]
  ),
  topic(
    "sp7.expressions",
    "sp7",
    ["Wyra\u017Cenia algebraiczne", "\u0410\u043B\u0433\u0435\u0431\u0440\u0430\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u044F", "Algebraic expressions"],
    ["redukcja wyraz\xF3w podobnych", "mno\u017Cenie sum algebraicznych", "warto\u015B\u0107 liczbowa wyra\u017Cenia", "przekszta\u0142canie wzor\xF3w"]
  ),
  topic(
    "sp7.equations",
    "sp7",
    ["R\xF3wnania", "\u0423\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F", "Equations"],
    ["r\xF3wnania liniowe", "r\xF3wnania z nawiasami i u\u0142amkami", "proporcje", "zadania tekstowe prowadz\u0105ce do r\xF3wna\u0144"]
  ),
  topic(
    "sp7.proportion",
    "sp7",
    ["Proporcjonalno\u015B\u0107 prosta", "\u041F\u0440\u044F\u043C\u0430\u044F \u043F\u0440\u043E\u043F\u043E\u0440\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C", "Direct proportion"],
    ["wielko\u015Bci wprost proporcjonalne", "wsp\xF3\u0142czynnik proporcjonalno\u015Bci", "zadania tekstowe"]
  ),
  topic(
    "sp7.prisms",
    "sp7",
    ["Graniastos\u0142upy", "\u041F\u0440\u0438\u0437\u043C\u044B", "Prisms"],
    ["graniastos\u0142upy proste", "pole powierzchni", "obj\u0119to\u015B\u0107", "zamiana jednostek obj\u0119to\u015Bci"]
  ),
  topic(
    "sp7.statistics",
    "sp7",
    ["Statystyka", "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430", "Statistics"],
    ["\u015Brednia arytmetyczna", "odczytywanie danych z tabel i diagram\xF3w"]
  ),
  // ---- klasa 8 ----
  topic(
    "sp8.powersRoots",
    "sp8",
    ["Pot\u0119gi i pierwiastki", "\u0421\u0442\u0435\u043F\u0435\u043D\u0438 \u0438 \u043A\u043E\u0440\u043D\u0438", "Powers and roots"],
    ["dzia\u0142ania na pot\u0119gach", "dzia\u0142ania na pierwiastkach", "notacja wyk\u0142adnicza", "usuwanie niewymierno\u015Bci z mianownika"]
  ),
  topic(
    "sp8.algebra",
    "sp8",
    ["Wyra\u017Cenia algebraiczne i r\xF3wnania", "\u0410\u043B\u0433\u0435\u0431\u0440\u0430\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0438 \u0443\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F", "Algebraic expressions and equations"],
    ["przekszta\u0142canie wyra\u017Ce\u0144", "r\xF3wnania liniowe", "przekszta\u0142canie wzor\xF3w", "r\xF3wnania z proporcjami"]
  ),
  topic(
    "sp8.word",
    "sp8",
    ["Zadania tekstowe", "\u0422\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0435 \u0437\u0430\u0434\u0430\u0447\u0438", "Word problems"],
    ["zadania z procentami", "pr\u0119dko\u015B\u0107, droga, czas", "zadania o wieku i liczbach", "zadania prowadz\u0105ce do r\xF3wna\u0144"]
  ),
  topic(
    "sp8.pythagoras",
    "sp8",
    ["Twierdzenie Pitagorasa", "\u0422\u0435\u043E\u0440\u0435\u043C\u0430 \u041F\u0438\u0444\u0430\u0433\u043E\u0440\u0430", "Pythagorean theorem"],
    ["obliczanie d\u0142ugo\u015Bci bok\xF3w", "przek\u0105tna kwadratu i prostok\u0105ta", "wysoko\u015B\u0107 tr\xF3jk\u0105ta r\xF3wnobocznego", "tr\xF3jk\u0105ty 45-45-90 i 30-60-90"]
  ),
  topic(
    "sp8.plane",
    "sp8",
    ["W\u0142asno\u015Bci figur p\u0142askich", "\u0421\u0432\u043E\u0439\u0441\u0442\u0432\u0430 \u043F\u043B\u043E\u0441\u043A\u0438\u0445 \u0444\u0438\u0433\u0443\u0440", "Properties of plane figures"],
    ["k\u0105ty w tr\xF3jk\u0105tach i czworok\u0105tach", "pola wielok\u0105t\xF3w", "przystawanie tr\xF3jk\u0105t\xF3w"]
  ),
  topic(
    "sp8.symmetry",
    "sp8",
    ["Symetrie", "\u0421\u0438\u043C\u043C\u0435\u0442\u0440\u0438\u044F", "Symmetry"],
    ["symetria osiowa", "symetria \u015Brodkowa", "osie i \u015Brodki symetrii figur", "symetria w uk\u0142adzie wsp\xF3\u0142rz\u0119dnych"]
  ),
  topic(
    "sp8.circle",
    "sp8",
    ["Okr\u0105g i ko\u0142o", "\u041E\u043A\u0440\u0443\u0436\u043D\u043E\u0441\u0442\u044C \u0438 \u043A\u0440\u0443\u0433", "Circle"],
    ["d\u0142ugo\u015B\u0107 okr\u0119gu", "pole ko\u0142a", "d\u0142ugo\u015B\u0107 \u0142uku i pole wycinka"]
  ),
  topic(
    "sp8.solids",
    "sp8",
    ["Ostros\u0142upy i graniastos\u0142upy", "\u041F\u0438\u0440\u0430\u043C\u0438\u0434\u044B \u0438 \u043F\u0440\u0438\u0437\u043C\u044B", "Pyramids and prisms"],
    ["pole powierzchni ostros\u0142upa", "obj\u0119to\u015B\u0107 ostros\u0142upa", "twierdzenie Pitagorasa w bry\u0142ach"]
  ),
  topic(
    "sp8.coordinates",
    "sp8",
    ["Uk\u0142ad wsp\xF3\u0142rz\u0119dnych", "\u041A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u043D\u0430\u044F \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u044C", "Coordinate plane"],
    ["wsp\xF3\u0142rz\u0119dne punkt\xF3w", "\u015Brodek odcinka", "d\u0142ugo\u015B\u0107 odcinka", "pola figur w uk\u0142adzie wsp\xF3\u0142rz\u0119dnych"]
  ),
  topic(
    "sp8.probability",
    "sp8",
    ["Kombinatoryka i prawdopodobie\u0144stwo", "\u041A\u043E\u043C\u0431\u0438\u043D\u0430\u0442\u043E\u0440\u0438\u043A\u0430 \u0438 \u0432\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C", "Counting and probability"],
    ["regu\u0142a mno\u017Cenia", "zliczanie mo\u017Cliwo\u015Bci", "prawdopodobie\u0144stwo zdarze\u0144", "\u015Brednia arytmetyczna i diagramy"]
  )
];

// packages/trainers/math/src/curriculum/index.ts
var TOPICS2 = [...sp, ...lo2];
var byId3 = new Map(TOPICS2.map((t) => [t.id, t]));
var getTopic2 = (id) => byId3.get(id);
function topicsFor2(grade, level) {
  return TOPICS2.filter((t) => t.grade === grade && (t.level !== "R" || level === "R"));
}

// packages/trainers/math/src/server/mock.ts
var TEXT = {
  ru: { calc: "\u0412\u044B\u0447\u0438\u0441\u043B\u0438", hint: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u044B\u043F\u043E\u043B\u043D\u0438 \u0443\u043C\u043D\u043E\u0436\u0435\u043D\u0438\u0435.", order: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043F\u043E\u0440\u044F\u0434\u043E\u043A \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439", left: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0441\u043B\u0435\u0432\u0430 \u043D\u0430\u043F\u0440\u0430\u0432\u043E \u0431\u0435\u0437 \u043F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442\u0430" },
  en: { calc: "Calculate", hint: "Do the multiplication first.", order: "Wrong order of operations", left: "Left to right without precedence" },
  pl: { calc: "Oblicz", hint: "Najpierw wykonaj mno\u017Cenie.", order: "Z\u0142a kolejno\u015B\u0107 dzia\u0142a\u0144", left: "Dzia\u0142ania od lewej bez kolejno\u015Bci" }
};
var rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
function makeTask(lang, topicId, difficulty, asChoice) {
  const t = TEXT[lang];
  const scale = difficulty * 5;
  const a = rnd(2, scale + 5);
  const b = rnd(2, scale);
  const c = rnd(2, scale);
  const answer = a + b * c;
  const base = {
    topicId,
    subtopic: "kolejno\u015B\u0107 wykonywania dzia\u0142a\u0144",
    difficulty,
    question: `${t.calc}: $${a} + ${b} \\cdot ${c}$`,
    verifyExpression: `${a} + ${b} * ${c}`,
    hint: t.hint,
    solution: `$${b} \\cdot ${c} = ${b * c}$, $${a} + ${b * c} = ${answer}$`
  };
  if (!asChoice) return { ...base, answerType: "number", correctAnswer: String(answer) };
  const candidates = [(a + b) * c, a + b + c, a * b + c, answer + 1, answer - 1, answer + 10, answer - 10];
  const wrong = [...new Set(candidates.filter((v) => v !== answer))].slice(0, 3);
  const options = [
    { text: String(answer) },
    { text: String(wrong[0]), misconception: t.order },
    { text: String(wrong[1]), misconception: t.left },
    { text: String(wrong[2]), misconception: t.left }
  ].sort(() => Math.random() - 0.5);
  const labels = ["A", "B", "C", "D"];
  const choices = options.map((o, i) => ({ label: labels[i], ...o }));
  return {
    ...base,
    answerType: "choice",
    correctAnswer: String(answer),
    choices,
    correctChoice: choices.find((ch) => ch.text === String(answer)).label
  };
}
function mockTasks(input) {
  return input.slots.map((s) => makeTask(input.lang, s.topic.id, s.difficulty, s.kind === "choice"));
}
function mockFeedback(input) {
  const stats = /* @__PURE__ */ new Map();
  for (const r of input.results) {
    const s = stats.get(r.topicId) ?? { ok: 0, total: 0 };
    s.total++;
    if (r.correct) s.ok++;
    stats.set(r.topicId, s);
  }
  const weak = [...stats].filter(([, s]) => s.ok / s.total < 0.7);
  const correct = input.results.filter((r) => r.correct).length;
  const name = (id) => getTopic2(id)?.name[input.lang] ?? id;
  return {
    summary: `[mock] ${correct}/${input.results.length}`,
    weakTopics: weak.map(([id, s]) => ({ topicId: id, reason: `${name(id)}: ${s.ok}/${s.total}` })),
    recommendations: weak.map(([id]) => `[mock] ${name(id)}`),
    suggestedTopicIds: weak.map(([id]) => id)
  };
}

// packages/trainers/math/src/server/prompts/generateTasks.ts
var LANG_NAMES = { ru: "Russian", en: "English", pl: "Polish" };
var GRADE_NAMES = {
  sp5: "szko\u0142a podstawowa, klasa 5 (age ~11)",
  sp6: "szko\u0142a podstawowa, klasa 6 (age ~12)",
  sp7: "szko\u0142a podstawowa, klasa 7 (age ~13)",
  sp8: "szko\u0142a podstawowa, klasa 8 (age ~14, egzamin \xF3smoklasisty year)",
  lo1: "liceum og\xF3lnokszta\u0142c\u0105ce, klasa 1 (age ~15)",
  lo2: "liceum og\xF3lnokszta\u0142c\u0105ce, klasa 2 (age ~16)",
  lo3: "liceum og\xF3lnokszta\u0142c\u0105ce, klasa 3 (age ~17)",
  lo4: "liceum og\xF3lnokszta\u0142c\u0105ce, klasa 4 (age ~18, matura year)"
};
var DIFFICULTY_NAMES = { 1: "easy", 2: "medium", 3: "hard" };
var TASKS_SYSTEM_PROMPT = `You are an experienced Polish mathematics teacher who writes practice tasks
for school tests (sprawdziany, kartk\xF3wki) strictly following the Polish core curriculum (podstawa programowa).
You are precise: every answer you give is double-checked. You output only JSON matching the schema.`;
function buildTasksPrompt(input) {
  const { lang, grade, level, slots } = input;
  const langName = LANG_NAMES[lang];
  const levelText = level ? `, poziom ${level === "R" ? "rozszerzony (extended)" : "podstawowy (basic)"}` : "";
  const cke = grade === "sp8" || grade.startsWith("lo");
  const topics = [...new Map(slots.map((s) => [s.topic.id, s.topic])).values()];
  const topicLines = topics.map((t) => `- topicId "${t.id}": "${t.name.pl}". Subtopics (vary them): ${t.subtopics.map((s) => `"${s}"`).join(", ")}.`).join("\n");
  const taskLines = slots.map(
    (s, i) => `${i + 1}. topicId "${s.topic.id}", difficulty ${s.difficulty} (${DIFFICULTY_NAMES[s.difficulty]}), ` + (s.kind === "choice" ? `answerType "choice"` : `open answer: answerType "number" (preferred) or "expression"`)
  ).join("\n");
  return `Create exactly ${slots.length} math tasks, in this order:
${taskLines}

Student: ${GRADE_NAMES[grade]}${levelText}.
Topics (Polish curriculum):
${topicLines}
Difficulty 3 is hard but still within the curriculum for this grade.
${cke ? "Style: similar to CKE exam tasks (egzamin \xF3smoklasisty / matura)." : "Style: typical school test (sprawdzian) tasks."}

LANGUAGE: write question, choices text, misconception, hint, solution and subtopic ONLY in ${langName}.
${lang === "en" ? "Use a decimal point in text." : "Use a decimal comma in text (e.g. 2,5) and the terminology used in schools."}

RULES:
- topicId: copy it from the task list above.
- Tasks must be solvable without a picture. Describe any figure fully in words. No proofs, no "show that" tasks.
- Each task has one unambiguous answer. Tasks must differ from each other.
- question: plain text; math in inline LaTeX between single dollar signs, e.g. "Oblicz $\\frac{3}{4} + \\frac{1}{2}$".
- subtopic: short name of the subtopic in ${langName}.
- answerType "number": the answer is a number. correctAnswer uses mathjs syntax with a DOT decimal separator and
  no units or words: "18", "-2.5", "3/4", "2*sqrt(3)", "5*pi". Several values (e.g. roots) are separated by "; ".
- answerType "expression": the answer is an algebraic expression in mathjs syntax, e.g. "2*x+6", "(a-b)^2".
- If an open task's answer would be an interval, a set, a sentence or otherwise not a number/expression,
  change the task so that the answer is a number.
- verifyExpression: REQUIRED for "number" tasks and for "choice" tasks with a numeric answer. A mathjs expression that
  computes the answer directly from the data in the question (not copied from correctAnswer), e.g. "1200*0.15",
  "(-1+sqrt(25))/2; (-1-sqrt(25))/2", "sqrt(6^2+8^2)". Degrees in trigonometry: "sin(30 deg)".
- answerType "choice": exactly 4 choices labelled A, B, C, D with exactly one correct (correctChoice). The three wrong
  options must result from typical student mistakes; describe each mistake in "misconception" (in ${langName}).
  Omit misconception for the correct option. correctAnswer = text of the correct option. Randomize the correct label.
- hint: one sentence that helps start without revealing the answer.
- solution: short step-by-step solution (2\u20135 steps) ending with the answer.`;
}
function tasksJsonSchema(topicIds) {
  return {
    type: "object",
    properties: {
      tasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            topicId: { type: "string", enum: topicIds },
            subtopic: { type: "string" },
            difficulty: { type: "integer", minimum: 1, maximum: 3 },
            question: { type: "string" },
            answerType: { type: "string", enum: ["number", "expression", "choice"] },
            correctAnswer: { type: "string" },
            verifyExpression: { type: "string" },
            choices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string", enum: ["A", "B", "C", "D"] },
                  text: { type: "string" },
                  misconception: { type: "string" }
                },
                required: ["label", "text"]
              }
            },
            correctChoice: { type: "string", enum: ["A", "B", "C", "D"] },
            hint: { type: "string" },
            solution: { type: "string" }
          },
          required: ["topicId", "subtopic", "difficulty", "question", "answerType", "correctAnswer", "hint", "solution"]
        }
      }
    },
    required: ["tasks"]
  };
}

// packages/trainers/math/src/server/prompts/feedback.ts
var FEEDBACK_SYSTEM_PROMPT = `You are a kind but honest Polish mathematics tutor. You analyse a student's practice test
results and explain what to work on. You output only JSON matching the schema.`;
function buildFeedbackPrompt(input) {
  const { lang, grade, level, results } = input;
  const stats = /* @__PURE__ */ new Map();
  for (const r of results) {
    const s = stats.get(r.topicId) ?? { ok: 0, total: 0, hints: 0 };
    s.total++;
    if (r.correct) s.ok++;
    if (r.usedHint) s.hints++;
    stats.set(r.topicId, s);
  }
  const topicLines = [...stats].map(([id, s]) => `- ${id} ("${getTopic2(id)?.name[lang] ?? id}"): ${s.ok}/${s.total} correct, hints used: ${s.hints}`).join("\n");
  const mistakes = results.filter((r) => !r.correct).map(
    (r, i) => `${i + 1}. [${r.topicId} / ${r.subtopic} / difficulty ${r.difficulty}] ${r.question}
   student answer: "${r.userAnswer || "(no answer)"}", correct: "${r.correctAnswer}"` + (r.misconception ? `, chosen option's typical mistake: ${r.misconception}` : "")
  ).join("\n");
  return `Student: grade ${grade}${level ? `, level ${level}` : ""} (Polish school system).

Results by topic:
${topicLines}

Mistakes:
${mistakes || "(none)"}

Write in ${LANG_NAMES[lang]} only, addressing the student directly ("you"), 2nd person, encouraging tone.
- summary: 2\u20134 sentences: overall result, strengths, the main problem.
- weakTopics: topics that need work (topicId from the list above) with a concrete reason based on the mistakes
  (what kind of error, e.g. sign errors, order of operations), not just the score. Empty if everything is fine.
- recommendations: 3\u20135 concrete, actionable tips (what to revise, which rules/formulas, what kind of exercises).
- suggestedTopicIds: topicIds (only from the list above) worth practising next, weakest first.`;
}
var FEEDBACK_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    weakTopics: {
      type: "array",
      items: {
        type: "object",
        properties: { topicId: { type: "string" }, reason: { type: "string" } },
        required: ["topicId", "reason"]
      }
    },
    recommendations: { type: "array", items: { type: "string" } },
    suggestedTopicIds: { type: "array", items: { type: "string" } }
  },
  required: ["summary", "weakTopics", "recommendations", "suggestedTopicIds"]
};

// packages/trainers/math/src/server/verifyTask.ts
import { randomUUID as randomUUID2 } from "node:crypto";
var numericParts = (s) => s.split(";").map((p) => evaluateNumber(normalizeAnswer(p)));
var isNumeric = (s) => numericParts(s).every((n) => n !== null);
function sameValue(a, b) {
  if (isNumeric(a) && isNumeric(b)) return isAnswerCorrect(a, b, "number");
  return normalizeAnswer(a) === normalizeAnswer(b);
}
function verifyTask2(raw, ctx) {
  if (!raw || typeof raw !== "object") return { ok: false, reason: "not an object" };
  const r = raw;
  for (const key of ["verifyExpression", "choices", "correctChoice", "hint"]) {
    if (r[key] === null || r[key] === "") delete r[key];
  }
  let topicId = typeof r.topicId === "string" ? r.topicId : void 0;
  if (!topicId && ctx.allowedTopicIds.length === 1) topicId = ctx.allowedTopicIds[0];
  if (!topicId || !ctx.allowedTopicIds.includes(topicId)) return { ok: false, reason: `unexpected topicId: ${topicId}` };
  const parsed = Task.safeParse({ ...r, id: ctx.id ?? randomUUID2(), topicId });
  if (!parsed.success) return { ok: false, reason: `schema: ${parsed.error.issues[0]?.message}` };
  const task = parsed.data;
  if (ctx.answerMode === "choice" && task.answerType !== "choice") return { ok: false, reason: "expected choice task" };
  if (ctx.answerMode === "input" && task.answerType === "choice") return { ok: false, reason: "expected input task" };
  if (task.answerType === "number") {
    if (!isNumeric(task.correctAnswer)) return { ok: false, reason: "correctAnswer is not numeric" };
    if (!task.verifyExpression) return { ok: false, reason: "missing verifyExpression" };
    if (!isAnswerCorrect(task.verifyExpression, task.correctAnswer, "number")) {
      return { ok: false, reason: `verifyExpression (${task.verifyExpression}) != correctAnswer (${task.correctAnswer})` };
    }
  }
  if (task.answerType === "expression") {
    if (!isAnswerCorrect(task.correctAnswer, task.correctAnswer, "expression")) {
      return { ok: false, reason: "correctAnswer is not a valid expression" };
    }
    if (task.verifyExpression && !isAnswerCorrect(task.verifyExpression, task.correctAnswer, "expression")) {
      return { ok: false, reason: "verifyExpression != correctAnswer" };
    }
  }
  if (task.answerType === "choice") {
    const choices = task.choices;
    const labels = new Set(choices.map((c) => c.label));
    if (labels.size !== 4) return { ok: false, reason: "duplicate choice labels" };
    const texts = new Set(choices.map((c) => normalizeAnswer(c.text)));
    if (texts.size !== 4) return { ok: false, reason: "duplicate choice texts" };
    const correct = choices.find((c) => c.label === task.correctChoice);
    if (task.verifyExpression && isNumeric(correct.text) && !isAnswerCorrect(task.verifyExpression, correct.text, "number")) {
      return { ok: false, reason: `verifyExpression (${task.verifyExpression}) != correct choice (${correct.text})` };
    }
    const alsoCorrect = choices.filter((c) => c.label !== task.correctChoice && sameValue(c.text, correct.text));
    if (alsoCorrect.length > 0) return { ok: false, reason: "more than one correct choice" };
    task.correctAnswer = task.correctChoice;
  }
  return { ok: true, task };
}

// packages/trainers/math/src/server/index.ts
async function generateTaskBatch(client, input) {
  const topicIds = [...new Set(input.slots.map((s) => s.topic.id))];
  const json = await client.generateJson({
    system: TASKS_SYSTEM_PROMPT,
    prompt: buildTasksPrompt(input),
    schema: tasksJsonSchema(topicIds),
    temperature: 0.9,
    mock: () => ({ tasks: mockTasks(input) })
  });
  const tasks = json.tasks;
  return Array.isArray(tasks) ? tasks : [];
}
function generateFeedback2(client, input) {
  return client.generateJson({
    system: FEEDBACK_SYSTEM_PROMPT,
    prompt: buildFeedbackPrompt(input),
    schema: FEEDBACK_JSON_SCHEMA,
    temperature: 0.5,
    mock: () => mockFeedback(input)
  });
}
var mathTrainer = {
  id: "math",
  topicsFor: topicsFor2,
  getTopic: getTopic2,
  generateTaskBatch,
  verifyTask: verifyTask2,
  checkAnswer: (task, answer) => isAnswerCorrect(answer, task.correctAnswer, task.answerType),
  generateFeedback: generateFeedback2
};

// apps/api/src/trainers.ts
var trainers = /* @__PURE__ */ new Map([
  [mathTrainer.id, mathTrainer],
  [bioTrainer.id, bioTrainer]
]);

// apps/api/src/app.ts
var WEB_DIST = resolve(dirname2(fileURLToPath(import.meta.url)), "../../web/dist");
async function buildApp(client, {
  logger = true,
  pool,
  reuseRatio,
  trainers: trainers2 = trainers,
  db,
  mailer = createMailer(),
  publicUrl = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 8787}`,
  serveWeb = true
} = {}) {
  const app = Fastify({ logger, bodyLimit: 256 * 1024 });
  await app.register(cors, { origin: process.env.CORS_ORIGIN?.split(",") ?? true });
  await app.register(rateLimit, { global: true, max: 120, timeWindow: "1 minute" });
  registerAuth(app, db);
  app.get("/api/health", async () => {
    const inner = client instanceof LimitedClient ? client.inner : client;
    const models = inner.status?.();
    const poolSize = pool ? await pool.count().catch(() => null) : void 0;
    return {
      ok: true,
      provider: client.name,
      trainers: [...trainers2.keys()],
      auth: !!db,
      ...models ? { models } : {},
      ...client instanceof LimitedClient ? { queue: client.limiter.stats } : {},
      ...poolSize !== void 0 ? { poolSize } : {}
    };
  });
  registerTrainerRoutes(app, { client, trainers: trainers2, pool, reuseRatio, db });
  registerSessionRoutes(app, trainers2, db);
  registerTaskRoutes(app, pool);
  registerMeRoutes(app, db);
  registerConsentRoutes(app, { db, mailer, publicUrl });
  registerCronRoutes(app, db);
  if (serveWeb && existsSync(WEB_DIST)) {
    await app.register(fastifyStatic, { root: WEB_DIST });
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api/")) return reply.code(404).send({ error: "Not found" });
      return reply.sendFile("index.html");
    });
  }
  return app;
}

// apps/api/src/serverless.ts
var appPromise = null;
function getServerlessApp() {
  appPromise ??= build();
  return appPromise;
}
async function build() {
  const client = createLLMClient();
  const dbConfig = dbConfigFromEnv();
  const db = dbConfig ? new PortalDb(dbConfig) : void 0;
  const pool = db ? new SupabaseTaskPool(db.admin) : new TaskPool(process.env.TASK_DB_PATH || "/tmp/tasks.db");
  const reuseRatio = Math.min(Math.max(Number(process.env.POOL_REUSE_RATIO ?? 0.5), 0), 1);
  const app = await buildApp(client, { pool, reuseRatio, db, serveWeb: false });
  await app.ready();
  return app;
}

// apps/api/src/vercelHandler.ts
var config = { maxDuration: 60 };
async function handler(req, res) {
  const app = await getServerlessApp();
  app.server.emit("request", req, res);
}
export {
  config,
  handler as default
};
