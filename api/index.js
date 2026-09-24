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
var GRADES = ["sp1", "sp2", "sp3", "sp4", "sp5", "sp6", "sp7", "sp8", "lo1", "lo2", "lo3", "lo4"];
var Grade = z.enum(GRADES);
var Level = z.enum(["P", "R"]);
var AnswerMode = z.enum(["input", "choice", "mixed"]);
var TASK_COUNTS = [5, 10, 15, 20];
var isLyceum = (grade) => grade.startsWith("lo");
var GenerateRequest = z.object({
  lang: Lang,
  grade: Grade,
  level: Level.optional(),
  // room for a whole textbook: biology selects paragraphs, 54 of them in LO3
  topicIds: z.array(z.string().min(1)).min(1).max(64),
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
  async listIds(trainerId) {
    const rows = this.db.prepare("SELECT id FROM tasks WHERE trainer_id = ? ORDER BY id").all(trainerId);
    return rows.map((r) => r.id);
  }
  async remove(ids) {
    if (ids.length === 0) return;
    this.db.prepare("DELETE FROM tasks WHERE id IN (SELECT value FROM json_each(?))").run(JSON.stringify(ids));
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
var ID_PAGE = 1e3;
var REMOVE_BATCH = 100;
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
  async listIds(trainerId) {
    const ids = [];
    for (let from = 0; ; from += ID_PAGE) {
      const { data, error } = await this.admin.from("tasks").select("id").eq("trainer_id", trainerId).order("id").range(from, from + ID_PAGE - 1);
      if (error) throw new Error(`pool listIds: ${error.message}`);
      ids.push(...data.map((r) => r.id));
      if (data.length < ID_PAGE) return ids;
    }
  }
  async remove(ids) {
    for (let i = 0; i < ids.length; i += REMOVE_BATCH) {
      const { error } = await this.admin.from("tasks").delete().in("id", ids.slice(i, i + REMOVE_BATCH));
      if (error) throw new Error(`pool remove: ${error.message}`);
    }
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
  if (pool && trainer.ensureContent) {
    await trainer.ensureContent(pool, log).catch((err) => log.error({ err, trainer: trainer.id }, "ensureContent failed"));
  }
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
  const fillFromTopics = async (skip) => {
    let filled = 0;
    for (const topic2 of shuffle(topics)) {
      if (!pool || pending.length === 0) break;
      const taken = await pool.take({
        ...ctx,
        topicId: topic2.id,
        answerMode: req.answerMode,
        tags: req.tagIds,
        excludeIds: [...skip],
        limit: pending.length
      });
      for (const task of taken) {
        skip.add(task.id);
        exclude.add(task.id);
        fromPool.push(task);
      }
      pending = pending.slice(taken.length);
      filled += taken.length;
    }
    return filled;
  };
  if (pool && !usesLLM && pending.length > 0) await fillFromTopics(exclude);
  let repeated = 0;
  if (pool && !usesLLM && pending.length > 0) {
    repeated = await fillFromTopics(new Set([...fromPool, ...generated].map((t) => t.id)));
  }
  const stats = {
    requested: req.count,
    reused,
    poolTopUp: fromPool.length - reused,
    generated: generated.length,
    rejected,
    llmCalls,
    repeated
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
var BOOK = {
  organism: {
    number: 1,
    name: ["Organizm cz\u0142owieka jako funkcjonalna ca\u0142o\u015B\u0107", "\u041E\u0440\u0433\u0430\u043D\u0438\u0437\u043C \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430 \u043A\u0430\u043A \u0435\u0434\u0438\u043D\u043E\u0435 \u0446\u0435\u043B\u043E\u0435", "The human organism as a functional whole"],
    subtopics: ["poziomy organizacji organizmu", "tkanka nab\u0142onkowa", "tkanka \u0142\u0105czna", "tkanka mi\u0119\u015Bniowa", "tkanka nerwowa", "homeostaza", "ujemne sprz\u0119\u017Cenie zwrotne", "transport przez b\u0142ony biologiczne"],
    paragraphs: {
      classification: ["1.1", 6, "Miejsce cz\u0142owieka w systemie klasyfikacji organizm\xF3w", "\u041C\u0435\u0441\u0442\u043E \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 \u043A\u043B\u0430\u0441\u0441\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C\u043E\u0432"],
      hierarchy: ["1.2", 10, "Hierarchiczna budowa organizmu cz\u0142owieka", "\u0418\u0435\u0440\u0430\u0440\u0445\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C\u0430 \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430"],
      homeostasis: ["1.3", 15, "Homeostaza", "\u0413\u043E\u043C\u0435\u043E\u0441\u0442\u0430\u0437"]
    }
  },
  skin: {
    number: 2,
    name: ["Uk\u0142ad pow\u0142okowy", "\u041F\u043E\u043A\u0440\u043E\u0432\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The integumentary system"],
    subtopics: ["budowa nask\xF3rka", "sk\xF3ra w\u0142a\u015Bciwa", "tkanka podsk\xF3rna", "wytwory nask\xF3rka", "termoregulacja", "receptory sk\xF3ry", "choroby i higiena sk\xF3ry"],
    paragraphs: {
      animals: ["2.1", 32, "Uk\u0142ad pow\u0142okowy u zwierz\u0105t", "\u041F\u043E\u043A\u0440\u043E\u0432\u044B \u0443 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      structure: ["2.2", 38, "Budowa i funkcje sk\xF3ry", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u043A\u043E\u0436\u0438"],
      disorders: ["2.3", 47, "Higiena i choroby sk\xF3ry", "\u0413\u0438\u0433\u0438\u0435\u043D\u0430 \u0438 \u0431\u043E\u043B\u0435\u0437\u043D\u0438 \u043A\u043E\u0436\u0438"]
    }
  },
  motion: {
    number: 3,
    name: ["Uk\u0142ad ruchu", "\u041E\u043F\u043E\u0440\u043D\u043E-\u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The musculoskeletal system"],
    subtopics: ["budowa i sk\u0142ad chemiczny ko\u015Bci", "tkanka kostna", "szkielet osiowy", "szkielet ko\u0144czyn", "po\u0142\u0105czenia ko\u015Bci", "budowa stawu", "mi\u0119\u015Bnie szkieletowe", "mechanizm skurczu mi\u0119\u015Bnia", "antagonizm mi\u0119\u015Bni", "wady postawy"],
    paragraphs: {
      animals: ["3.1", 62, "Ruch u zwierz\u0105t", "\u0414\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0443 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      skeleton: ["3.2", 68, "Budowa i funkcje szkieletu", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0441\u043A\u0435\u043B\u0435\u0442\u0430"],
      joints: ["3.3", 72, "Rodzaje po\u0142\u0105cze\u0144 ko\u015Bci", "\u0422\u0438\u043F\u044B \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0439 \u043A\u043E\u0441\u0442\u0435\u0439"],
      bones: ["3.4", 76, "Elementy szkieletu", "\u042D\u043B\u0435\u043C\u0435\u043D\u0442\u044B \u0441\u043A\u0435\u043B\u0435\u0442\u0430"],
      muscles: ["3.5", 83, "Budowa i funkcjonowanie uk\u0142adu mi\u0119\u015Bniowego", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0440\u0430\u0431\u043E\u0442\u0430 \u043C\u044B\u0448\u0435\u0447\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"],
      disorders: ["3.6", 95, "Higiena i choroby uk\u0142adu ruchu", "\u0413\u0438\u0433\u0438\u0435\u043D\u0430 \u0438 \u0431\u043E\u043B\u0435\u0437\u043D\u0438 \u043E\u043F\u043E\u0440\u043D\u043E-\u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"]
    }
  },
  digestion: {
    number: 4,
    name: ["Uk\u0142ad pokarmowy", "\u041F\u0438\u0449\u0435\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The digestive system"],
    subtopics: ["budowa przewodu pokarmowego", "enzymy trawienne", "trawienie i wch\u0142anianie", "rola w\u0105troby", "rola trzustki", "sk\u0142adniki pokarmowe", "witaminy i sole mineralne", "warto\u015B\u0107 energetyczna pokarmu", "wska\u017Anik BMI"],
    paragraphs: {
      animals: ["4.1", 110, "Od\u017Cywianie si\u0119 zwierz\u0105t", "\u041F\u0438\u0442\u0430\u043D\u0438\u0435 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      organic: ["4.2", 116, "Organiczne sk\u0142adniki pokarmowe", "\u041E\u0440\u0433\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043F\u0438\u0442\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0430"],
      vitamins: ["4.3", 123, "Rola witamin. Nieorganiczne sk\u0142adniki pokarmowe", "\u0420\u043E\u043B\u044C \u0432\u0438\u0442\u0430\u043C\u0438\u043D\u043E\u0432. \u041D\u0435\u043E\u0440\u0433\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043F\u0438\u0442\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0430"],
      structure: ["4.4", 131, "Budowa i funkcje uk\u0142adu pokarmowego", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u043F\u0438\u0449\u0435\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"],
      processes: ["4.5", 139, "Procesy trawienia i wch\u0142aniania", "\u041F\u0440\u043E\u0446\u0435\u0441\u0441\u044B \u043F\u0438\u0449\u0435\u0432\u0430\u0440\u0435\u043D\u0438\u044F \u0438 \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u044F"],
      diet: ["4.6", 148, "Zasady racjonalnego od\u017Cywiania si\u0119", "\u041F\u0440\u0438\u043D\u0446\u0438\u043F\u044B \u0440\u0430\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043F\u0438\u0442\u0430\u043D\u0438\u044F"],
      disorders: ["4.7", 152, "Choroby uk\u0142adu pokarmowego", "\u0411\u043E\u043B\u0435\u0437\u043D\u0438 \u043F\u0438\u0449\u0435\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"]
    }
  },
  respiration: {
    number: 5,
    name: ["Uk\u0142ad oddechowy", "\u0414\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The respiratory system"],
    subtopics: ["drogi oddechowe", "p\u0119cherzyki p\u0142ucne", "wymiana gazowa", "transport tlenu i dwutlenku w\u0119gla", "mechanika oddychania", "obj\u0119to\u015Bci i pojemno\u015Bci p\u0142uc", "regulacja oddychania", "choroby uk\u0142adu oddechowego"],
    paragraphs: {
      animals: ["5.1", 170, "Uk\u0142ad oddechowy u zwierz\u0105t", "\u0414\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0443 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      structure: ["5.2", 180, "Budowa i funkcje uk\u0142adu oddechowego", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"],
      ventilation: ["5.3", 185, "Wentylacja p\u0142uc i wymiana gazowa", "\u0412\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u044F \u043B\u0451\u0433\u043A\u0438\u0445 \u0438 \u0433\u0430\u0437\u043E\u043E\u0431\u043C\u0435\u043D"],
      disorders: ["5.4", 198, "Zaburzenia funkcjonowania uk\u0142adu oddechowego", "\u041D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"]
    }
  },
  circulation: {
    number: 6,
    name: ["Uk\u0142ad kr\u0105\u017Cenia. Odporno\u015B\u0107", "\u041A\u0440\u043E\u0432\u043E\u043E\u0431\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0438 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442", "Circulation and immunity"],
    subtopics: ["budowa serca", "cykl pracy serca", "krwiobieg du\u017Cy i ma\u0142y", "naczynia krwiono\u015Bne", "sk\u0142ad i funkcje krwi", "grupy krwi", "konflikt serologiczny", "uk\u0142ad limfatyczny", "odporno\u015B\u0107 nieswoista", "odporno\u015B\u0107 swoista", "szczepionki i surowice"],
    paragraphs: {
      animals: ["6.1", 214, "Uk\u0142ad kr\u0105\u017Cenia u zwierz\u0105t", "\u041A\u0440\u043E\u0432\u0435\u043D\u043E\u0441\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0443 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      blood: ["6.2", 220, "Sk\u0142ad i funkcje krwi", "\u0421\u043E\u0441\u0442\u0430\u0432 \u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u043A\u0440\u043E\u0432\u0438"],
      structure: ["6.3", 228, "Budowa i funkcje uk\u0142adu krwiono\u015Bnego", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u043A\u0440\u043E\u0432\u0435\u043D\u043E\u0441\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"],
      function: ["6.4", 234, "Funkcjonowanie uk\u0142adu krwiono\u015Bnego", "\u0420\u0430\u0431\u043E\u0442\u0430 \u043A\u0440\u043E\u0432\u0435\u043D\u043E\u0441\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"],
      lymph: ["6.5", 244, "Uk\u0142ad limfatyczny", "\u041B\u0438\u043C\u0444\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430"],
      disorders: ["6.6", 248, "Choroby uk\u0142adu kr\u0105\u017Cenia", "\u0411\u043E\u043B\u0435\u0437\u043D\u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u044B \u043A\u0440\u043E\u0432\u043E\u043E\u0431\u0440\u0430\u0449\u0435\u043D\u0438\u044F"],
      immune: ["6.7", 258, "Budowa i funkcje uk\u0142adu odporno\u015Bciowego", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0438\u043C\u043C\u0443\u043D\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"],
      immunity: ["6.8", 265, "Rodzaje i mechanizmy odporno\u015Bci", "\u0412\u0438\u0434\u044B \u0438 \u043C\u0435\u0445\u0430\u043D\u0438\u0437\u043C\u044B \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442\u0430"],
      "immune-disorders": ["6.9", 274, "Zaburzenia funkcjonowania uk\u0142adu odporno\u015Bciowego", "\u041D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0438\u043C\u043C\u0443\u043D\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"]
    }
  },
  urinary: {
    number: 7,
    name: ["Uk\u0142ad moczowy", "\u041C\u043E\u0447\u0435\u0432\u044B\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The urinary system"],
    subtopics: ["budowa nerki", "budowa nefronu", "filtracja k\u0142\u0119buszkowa", "resorpcja zwrotna", "sekrecja kanalikowa", "powstawanie moczu", "osmoregulacja", "rola ADH", "rola aldosteronu"],
    paragraphs: {
      animals: ["7.1", 292, "Osmoregulacja i wydalanie u zwierz\u0105t", "\u041E\u0441\u043C\u043E\u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F \u0438 \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0443 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      structure: ["7.2", 298, "Budowa i funkcjonowanie uk\u0142adu moczowego", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0440\u0430\u0431\u043E\u0442\u0430 \u043C\u043E\u0447\u0435\u0432\u044B\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"],
      disorders: ["7.3", 307, "Choroby uk\u0142adu moczowego", "\u0411\u043E\u043B\u0435\u0437\u043D\u0438 \u043C\u043E\u0447\u0435\u0432\u044B\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"]
    }
  },
  nervous: {
    number: 8,
    name: ["Uk\u0142ad nerwowy", "\u041D\u0435\u0440\u0432\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The nervous system"],
    subtopics: ["budowa neuronu", "tkanka nerwowa", "potencja\u0142 spoczynkowy", "potencja\u0142 czynno\u015Bciowy", "budowa i dzia\u0142anie synapsy", "neuroprzeka\u017Aniki", "budowa m\xF3zgowia", "rdze\u0144 kr\u0119gowy", "\u0142uk odruchowy", "uk\u0142ad autonomiczny"],
    paragraphs: {
      animals: ["8.1", 318, "Uk\u0142ad nerwowy u zwierz\u0105t", "\u041D\u0435\u0440\u0432\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0443 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      structure: ["8.2", 323, "Budowa i dzia\u0142anie uk\u0142adu nerwowego", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0440\u0430\u0431\u043E\u0442\u0430 \u043D\u0435\u0440\u0432\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"],
      central: ["8.3", 334, "O\u015Brodkowy uk\u0142ad nerwowy", "\u0426\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043D\u0435\u0440\u0432\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430"],
      peripheral: ["8.4", 340, "Obwodowy uk\u0142ad nerwowy", "\u041F\u0435\u0440\u0438\u0444\u0435\u0440\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043D\u0435\u0440\u0432\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430"],
      autonomic: ["8.5", 350, "Autonomiczny uk\u0142ad nerwowy", "\u0412\u0435\u0433\u0435\u0442\u0430\u0442\u0438\u0432\u043D\u0430\u044F \u043D\u0435\u0440\u0432\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430"],
      disorders: ["8.6", 353, "Higiena i choroby uk\u0142adu nerwowego", "\u0413\u0438\u0433\u0438\u0435\u043D\u0430 \u0438 \u0431\u043E\u043B\u0435\u0437\u043D\u0438 \u043D\u0435\u0440\u0432\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"]
    }
  },
  senses: {
    number: 9,
    name: ["Narz\u0105dy zmys\u0142\xF3w", "\u041E\u0440\u0433\u0430\u043D\u044B \u0447\u0443\u0432\u0441\u0442\u0432", "The sense organs"],
    subtopics: ["budowa oka", "akomodacja", "wady wzroku", "budowa ucha", "narz\u0105d Cortiego", "narz\u0105d r\xF3wnowagi", "zmys\u0142 smaku", "zmys\u0142 w\u0119chu", "czucie sk\xF3rne"],
    paragraphs: {
      animals: ["9.1", 368, "Narz\u0105dy zmys\u0142\xF3w u zwierz\u0105t", "\u041E\u0440\u0433\u0430\u043D\u044B \u0447\u0443\u0432\u0441\u0442\u0432 \u0443 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      vision: ["9.2", 374, "Budowa i dzia\u0142anie narz\u0105du wzroku", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0440\u0430\u0431\u043E\u0442\u0430 \u043E\u0440\u0433\u0430\u043D\u0430 \u0437\u0440\u0435\u043D\u0438\u044F"],
      ear: ["9.3", 384, "Ucho \u2013 narz\u0105d s\u0142uchu i r\xF3wnowagi", "\u0423\u0445\u043E \u2014 \u043E\u0440\u0433\u0430\u043D \u0441\u043B\u0443\u0445\u0430 \u0438 \u0440\u0430\u0432\u043D\u043E\u0432\u0435\u0441\u0438\u044F"],
      "taste-smell": ["9.4", 392, "Narz\u0105dy smaku oraz w\u0119chu", "\u041E\u0440\u0433\u0430\u043D\u044B \u0432\u043A\u0443\u0441\u0430 \u0438 \u043E\u0431\u043E\u043D\u044F\u043D\u0438\u044F"]
    }
  },
  hormones: {
    number: 10,
    name: ["Uk\u0142ad hormonalny", "\u042D\u043D\u0434\u043E\u043A\u0440\u0438\u043D\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430", "The endocrine system"],
    subtopics: ["gruczo\u0142y dokrewne", "hormony i ich dzia\u0142anie", "o\u015B podwzg\xF3rze\u2013przysadka", "regulacja poziomu glukozy", "regulacja gospodarki wapniowej", "ujemne sprz\u0119\u017Cenie zwrotne", "nadczynno\u015B\u0107 i niedoczynno\u015B\u0107 gruczo\u0142\xF3w"],
    paragraphs: {
      animals: ["10.1", 402, "Uk\u0142ad hormonalny u zwierz\u0105t", "\u042D\u043D\u0434\u043E\u043A\u0440\u0438\u043D\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0443 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      structure: ["10.2", 404, "Budowa i rola uk\u0142adu hormonalnego", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0440\u043E\u043B\u044C \u044D\u043D\u0434\u043E\u043A\u0440\u0438\u043D\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"],
      regulation: ["10.3", 414, "Regulacja wydzielania hormon\xF3w", "\u0420\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u044F \u0433\u043E\u0440\u043C\u043E\u043D\u043E\u0432"],
      disorders: ["10.4", 419, "Nadczynno\u015B\u0107 i niedoczynno\u015B\u0107 gruczo\u0142\xF3w dokrewnych. Stres", "\u0413\u0438\u043F\u0435\u0440- \u0438 \u0433\u0438\u043F\u043E\u0444\u0443\u043D\u043A\u0446\u0438\u044F \u0436\u0435\u043B\u0451\u0437 \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0439 \u0441\u0435\u043A\u0440\u0435\u0446\u0438\u0438. \u0421\u0442\u0440\u0435\u0441\u0441"]
    }
  },
  reproduction: {
    number: 11,
    name: ["Rozmna\u017Canie i rozw\xF3j", "\u0420\u0430\u0437\u043C\u043D\u043E\u0436\u0435\u043D\u0438\u0435 \u0438 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435", "Reproduction and development"],
    subtopics: ["budowa uk\u0142adu rozrodczego", "gametogeneza", "cykl miesi\u0105czkowy", "zap\u0142odnienie", "rozw\xF3j zarodkowy", "listki zarodkowe", "ci\u0105\u017Ca i por\xF3d", "rozw\xF3j postnatalny"],
    paragraphs: {
      animals: ["11.1", 434, "Rozmna\u017Canie i rozw\xF3j u zwierz\u0105t", "\u0420\u0430\u0437\u043C\u043D\u043E\u0436\u0435\u043D\u0438\u0435 \u0438 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435 \u0443 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      male: ["11.2", 442, "Budowa i funkcje m\u0119skich narz\u0105d\xF3w rozrodczych", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u043C\u0443\u0436\u0441\u043A\u0438\u0445 \u043F\u043E\u043B\u043E\u0432\u044B\u0445 \u043E\u0440\u0433\u0430\u043D\u043E\u0432"],
      female: ["11.3", 447, "Budowa i funkcje \u017Ce\u0144skich narz\u0105d\xF3w rozrodczych", "\u0421\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0436\u0435\u043D\u0441\u043A\u0438\u0445 \u043F\u043E\u043B\u043E\u0432\u044B\u0445 \u043E\u0440\u0433\u0430\u043D\u043E\u0432"],
      development: ["11.4", 456, "Rozw\xF3j cz\u0142owieka. Metody antykoncepcji", "\u0420\u0430\u0437\u0432\u0438\u0442\u0438\u0435 \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430. \u041C\u0435\u0442\u043E\u0434\u044B \u043A\u043E\u043D\u0442\u0440\u0430\u0446\u0435\u043F\u0446\u0438\u0438"],
      disorders: ["11.5", 467, "Higiena i choroby uk\u0142adu rozrodczego", "\u0413\u0438\u0433\u0438\u0435\u043D\u0430 \u0438 \u0431\u043E\u043B\u0435\u0437\u043D\u0438 \u043F\u043E\u043B\u043E\u0432\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"]
    }
  }
};
var chapterKeys = Object.keys(BOOK);
var chapterId = (key) => `bio.lo3.${key}`;
var CHAPTERS = chapterKeys.map((key) => {
  const { number, name, subtopics } = BOOK[key];
  const [pl, ru, en] = name;
  return { id: chapterId(key), number, name: { pl, ru, en }, subtopics: [...subtopics] };
});
var PARAGRAPHS = chapterKeys.flatMap(
  (key) => Object.entries(BOOK[key].paragraphs).map(([slug, [number, page, pl, ru]]) => ({
    id: `${chapterId(key)}.${slug}`,
    grade: "lo3",
    level: "R",
    // EN is not offered for biology; the slot is filled so the portal-wide `Topic` shape still holds
    name: { pl, ru, en: pl },
    // curriculum terms live on the chapter; a paragraph's own terms come from the tasks in it
    subtopics: [],
    chapterId: chapterId(key),
    number,
    page
  }))
);
var P = Object.fromEntries(
  chapterKeys.map((key) => [key, Object.fromEntries(Object.keys(BOOK[key].paragraphs).map((slug) => [slug, `${chapterId(key)}.${slug}`]))])
);

// packages/trainers/bio/src/curriculum/tags.ts
var TAGS = [
  {
    id: "homeostaza",
    name: { pl: "Homeostaza i sprz\u0119\u017Cenie zwrotne", ru: "\u0413\u043E\u043C\u0435\u043E\u0441\u0442\u0430\u0437 \u0438 \u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C", en: "Homeostasis and feedback" }
  },
  {
    id: "regulacja-hormonalna",
    name: { pl: "Regulacja hormonalna", ru: "\u0413\u043E\u0440\u043C\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F", en: "Hormonal regulation" }
  },
  {
    id: "choroby",
    name: { pl: "Choroby i zaburzenia", ru: "\u0411\u043E\u043B\u0435\u0437\u043D\u0438 \u0438 \u043D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u044F", en: "Diseases and disorders" }
  },
  {
    id: "obliczenia",
    name: { pl: "Zadania obliczeniowe", ru: "\u0420\u0430\u0441\u0447\u0451\u0442\u043D\u044B\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u044F", en: "Calculation tasks" }
  }
];
var byId = new Map(TAGS.map((t) => [t.id, t]));

// packages/trainers/bio/src/curriculum/index.ts
var TOPICS = PARAGRAPHS;
var paragraphById = new Map(PARAGRAPHS.map((p) => [p.id, p]));
var chapterById = new Map(CHAPTERS.map((c) => [c.id, c]));
var getTopic = (id) => paragraphById.get(id);
var getParagraph = (id) => paragraphById.get(id);
var getChapter = (id) => chapterById.get(id);
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
    weak: (ok, total) => `poprawnie ${ok} z ${total}`,
    reviewSubtopics: (chapter, paragraphs, subtopics) => `Powt\xF3rz \u201E${chapter}\u201D${paragraphs.length ? ` (${paragraphs.join(", ")})` : ""}, zw\u0142aszcza: ${subtopics.join(", ")}.`,
    hintsUsed: (n) => `Skorzysta\u0142e\u015B z podpowiedzi ${n} razy \u2014 spr\xF3buj nast\u0119pnym razem najpierw odpowiedzie\u0107 bez nich.`,
    repeatWeak: "Powt\xF3rz sesj\u0119 z zaznaczonymi s\u0142abymi tematami.",
    keepGoing: "Utrzymaj tempo: kr\xF3tka sesja co kilka dni dzia\u0142a lepiej ni\u017C jedna d\u0142uga przed sprawdzianem."
  },
  ru: {
    great: "\u041E\u0442\u043B\u0438\u0447\u043D\u044B\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u2014 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u0443\u0441\u0432\u043E\u0435\u043D.",
    good: "\u0425\u043E\u0440\u043E\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442, \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u043F\u0430\u0440\u0443 \u043C\u0435\u0441\u0442.",
    ok: "\u0411\u0430\u0437\u0430 \u0435\u0441\u0442\u044C, \u043D\u043E \u0441\u0442\u043E\u0438\u0442 \u0435\u0449\u0451 \u043F\u043E\u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F.",
    low: "\u042D\u0442\u043E\u0442 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043D\u0443\u0436\u043D\u043E \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u2014 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E, \u044D\u0442\u043E \u0432\u043E\u043F\u0440\u043E\u0441 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438.",
    weak: (ok, total) => `\u0432\u0435\u0440\u043D\u043E ${ok} \u0438\u0437 ${total}`,
    reviewSubtopics: (chapter, paragraphs, subtopics) => `\u041F\u043E\u0432\u0442\u043E\u0440\u0438 \xAB${chapter}\xBB${paragraphs.length ? ` (${paragraphs.join(", ")})` : ""}, \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E: ${subtopics.join(", ")}.`,
    hintsUsed: (n) => `\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430\u043C\u0438 \u0442\u044B \u0432\u043E\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043B\u0441\u044F ${n} \u0440\u0430\u0437 \u2014 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0437 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u043E\u0442\u0432\u0435\u0442\u0438\u0442\u044C \u0431\u0435\u0437 \u043D\u0438\u0445.`,
    repeatWeak: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438 \u0441\u0435\u0441\u0441\u0438\u044E \u043F\u043E \u043E\u0442\u043C\u0435\u0447\u0435\u043D\u043D\u044B\u043C \u0441\u043B\u0430\u0431\u044B\u043C \u0442\u0435\u043C\u0430\u043C.",
    keepGoing: "\u0414\u0435\u0440\u0436\u0438 \u0442\u0435\u043C\u043F: \u043A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u0441\u0435\u0441\u0441\u0438\u044F \u0440\u0430\u0437 \u0432 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0434\u043D\u0435\u0439 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043B\u0443\u0447\u0448\u0435, \u0447\u0435\u043C \u043E\u0434\u043D\u0430 \u0434\u043B\u0438\u043D\u043D\u0430\u044F \u043F\u0435\u0440\u0435\u0434 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439."
  },
  en: {
    great: "Excellent \u2014 you know this material.",
    good: "Good result, a couple of things left to polish.",
    ok: "The basics are there, but more practice would help.",
    low: "This material needs a review \u2014 nothing a bit of practice won't fix.",
    weak: (ok, total) => `${ok} of ${total} correct`,
    reviewSubtopics: (chapter, paragraphs, subtopics) => `Review "${chapter}"${paragraphs.length ? ` (${paragraphs.join(", ")})` : ""}, especially: ${subtopics.join(", ")}.`,
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
  const weakTopics = weak.map((s) => ({ topicId: s.topicId, reason: p.weak(s.ok, s.total) }));
  const byChapter = /* @__PURE__ */ new Map();
  for (const s of weak) {
    const chapterId2 = getParagraph(s.topicId)?.chapterId ?? (getChapter(s.topicId) ? s.topicId : void 0);
    if (chapterId2) byChapter.set(chapterId2, [...byChapter.get(chapterId2) ?? [], s]);
  }
  const recommendations = [];
  for (const [chapterId2, group] of [...byChapter].slice(0, 3)) {
    const chapter = getChapter(chapterId2);
    const numbers = group.flatMap((s) => {
      const paragraph = getParagraph(s.topicId);
      return paragraph ? [`\xA7${paragraph.number}`] : [];
    });
    const missed = [...new Set(group.flatMap((s) => s.missedSubtopics))];
    const focus = (missed.length > 0 ? missed : chapter.subtopics).slice(0, 3);
    recommendations.push(p.reviewSubtopics(chapter.name[req.lang] ?? chapter.name.pl, numbers, focus));
  }
  const hints = req.results.filter((r) => r.usedHint).length;
  if (hints >= 3) recommendations.push(p.hintsUsed(hints));
  if (weak.length > 0) recommendations.push(p.repeatWeak);
  if (recommendations.length === 0) recommendations.push(p.keepGoing);
  return {
    summary,
    weakTopics,
    recommendations: recommendations.slice(0, 4),
    // paragraphs, so "practise these" builds a session from exactly what went wrong
    suggestedTopicIds: weak.map((s) => s.topicId).filter((id) => getParagraph(id)).slice(0, 8)
  };
}

// packages/trainers/bio/src/lang.ts
var BIO_LANGS = ["pl", "ru"];

// packages/trainer-sdk/src/templates/types.ts
var intRange = (min, max) => ({ kind: "int", min, max });
var choiceParam = (...options) => ({ kind: "choice", options });

// packages/trainer-sdk/src/templates/text.ts
var pluralRules = {
  ru: new Intl.PluralRules("ru"),
  pl: new Intl.PluralRules("pl"),
  en: new Intl.PluralRules("en")
};

// packages/trainer-sdk/src/templates/combinations.ts
var cardinality = (spec) => spec.kind === "int" ? spec.max - spec.min + 1 : spec.options.length;
function randomValue(spec) {
  if (spec.kind === "int") return spec.min + Math.floor(Math.random() * (spec.max - spec.min + 1));
  return spec.options[Math.floor(Math.random() * spec.options.length)];
}
function* fullCartesian(entries, index, acc) {
  if (index === entries.length) {
    yield { ...acc };
    return;
  }
  const [key, spec] = entries[index];
  const values = spec.kind === "int" ? Array.from({ length: spec.max - spec.min + 1 }, (_, i) => spec.min + i) : spec.options;
  for (const v of values) {
    acc[key] = v;
    yield* fullCartesian(entries, index + 1, acc);
  }
}
function* enumerateParams(params, attemptBudget) {
  const entries = Object.entries(params);
  if (entries.length === 0) {
    yield {};
    return;
  }
  const total = entries.reduce((n, [, spec]) => n * cardinality(spec), 1);
  if (total <= attemptBudget) {
    yield* fullCartesian(entries, 0, {});
    return;
  }
  const seen = /* @__PURE__ */ new Set();
  let tries = 0;
  const maxTries = attemptBudget * 20;
  while (seen.size < attemptBudget && tries < maxTries) {
    tries++;
    const combo = {};
    for (const [key2, spec] of entries) combo[key2] = randomValue(spec);
    const key = JSON.stringify(combo);
    if (seen.has(key)) continue;
    seen.add(key);
    yield combo;
  }
}

// packages/trainer-sdk/src/templates/render.ts
import { createHash as createHash2 } from "node:crypto";
var paramsHash = (params) => createHash2("sha1").update(JSON.stringify(params, Object.keys(params).sort())).digest("hex").slice(0, 10);
function buildRaw(template, p, d, lang, topicId) {
  const isChoice = template.answerType === "choice";
  const choices = isChoice ? template.choices?.(p, d, lang) : void 0;
  const correctChoice = isChoice ? template.correctChoiceLabel?.(p, d) : void 0;
  return {
    topicId,
    subtopic: template.subtopic[lang],
    difficulty: typeof template.difficulty === "function" ? template.difficulty(p, d) : template.difficulty,
    question: template.question(p, d, lang),
    answerType: template.answerType,
    correctAnswer: isChoice ? correctChoice ?? "" : template.correctAnswer(p, d, lang),
    acceptedAnswers: template.acceptedAnswers?.(p, d, lang),
    tags: template.tags,
    verifyExpression: template.verifyExpression?.(p, d),
    choices,
    correctChoice,
    hint: template.hint?.[lang]?.(p, d),
    solution: template.solution[lang](p, d)
  };
}
function renderTemplate(template, opts) {
  const targetCount = Math.min(opts.targetCount, template.maxTasks ?? Number.POSITIVE_INFINITY);
  const attemptBudget = opts.attemptBudget ?? opts.targetCount * 8;
  const answerMode = template.answerType === "choice" ? "choice" : "input";
  const tasks = [];
  let accepted = 0;
  let rejected = 0;
  const rejectionReasons = [];
  for (const p of enumerateParams(template.params, attemptBudget)) {
    if (accepted >= targetCount) break;
    if (template.constraint && !template.constraint(p)) {
      rejected++;
      continue;
    }
    const derived = template.derive?.(p) ?? {};
    const hash = paramsHash(p);
    const topicId = template.topicOf?.(p, derived) ?? template.topicId;
    const perLang = [];
    let failReason = null;
    for (const lang of opts.langs) {
      const raw = buildRaw(template, p, derived, lang, topicId);
      const id = `${template.id}:${lang}:${hash}`;
      const result = opts.verify(raw, { allowedTopicIds: [topicId], answerMode, id });
      if (!result.ok) {
        failReason = `[${lang}] ${result.reason}`;
        break;
      }
      perLang.push({ lang, task: result.task });
    }
    if (failReason) {
      rejected++;
      if (rejectionReasons.length < 20) rejectionReasons.push(failReason);
      continue;
    }
    tasks.push(...perLang);
    accepted++;
  }
  return { tasks, stats: { templateId: template.id, accepted, rejected, rejectionReasons } };
}

// packages/trainers/bio/src/server/templates/index.ts
import { createHash as createHash3 } from "node:crypto";

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

// packages/trainers/bio/src/server/templates/choices.ts
var LABELS = ["A", "B", "C", "D"];
function pickDistractors(pool, correctIndex, text, count = 3) {
  const taken = /* @__PURE__ */ new Set([normalizeTerm(text(pool[correctIndex]))]);
  const out = [];
  for (let step = 1; step < pool.length && out.length < count; step++) {
    const row = pool[(correctIndex + step) % pool.length];
    const key = normalizeTerm(text(row));
    if (taken.has(key)) continue;
    taken.add(key);
    out.push(row);
  }
  return out;
}
function placeChoices(correctLabel, correctText, distractors, misconception) {
  const rest = [...distractors];
  return LABELS.map(
    (label) => label === correctLabel ? { label, text: correctText } : { label, text: rest.shift() ?? "", misconception }
  );
}

// packages/trainers/bio/src/server/templates/tableTemplate.ts
var cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
var rowParagraph = (row) => row.paragraph;
function choiceFromTable(spec) {
  const shift = spec.shift ?? 0;
  const labelFor = (i) => LABELS[(i + shift) % LABELS.length];
  return {
    id: spec.id,
    topicId: spec.topicId,
    // distractors still come from the whole table below: a paragraph with one or two rows could not
    // offer four options on its own, and neighbouring rows make the more plausible traps anyway
    topicOf: (p) => rowParagraph(spec.rows[p.i]) ?? spec.paragraph ?? spec.topicId,
    answerType: "choice",
    tags: spec.tags,
    params: { i: choiceParam(...spec.rows.map((_, i) => i)) },
    difficulty: (p) => spec.difficulty(spec.rows[p.i]),
    subtopic: spec.subtopic,
    question: (p, _d, lang) => spec.question(spec.rows[p.i], lang),
    correctAnswer: (p) => labelFor(p.i),
    correctChoiceLabel: (p) => labelFor(p.i),
    choices: (p, _d, lang) => {
      const text = (row) => spec.optionText(row, lang);
      return placeChoices(
        labelFor(p.i),
        text(spec.rows[p.i]),
        pickDistractors(spec.rows, p.i, text).map(text),
        spec.misconception[lang]
      );
    },
    hint: spec.hint && {
      pl: (p) => spec.hint(spec.rows[p.i], "pl"),
      ru: (p) => spec.hint(spec.rows[p.i], "ru")
    },
    solution: {
      pl: (p) => spec.solution(spec.rows[p.i], "pl"),
      ru: (p) => spec.solution(spec.rows[p.i], "ru")
    }
  };
}
function termFromTable(spec) {
  return {
    id: spec.id,
    topicId: spec.topicId,
    topicOf: (p) => rowParagraph(spec.rows[p.i]) ?? spec.paragraph ?? spec.topicId,
    answerType: "text",
    tags: spec.tags,
    params: { i: choiceParam(...spec.rows.map((_, i) => i)) },
    difficulty: (p) => spec.difficulty(spec.rows[p.i]),
    subtopic: spec.subtopic,
    question: (p, _d, lang) => spec.question(spec.rows[p.i], lang),
    correctAnswer: (p, _d, lang) => spec.term(spec.rows[p.i], lang),
    acceptedAnswers: (p, _d, lang) => {
      const row = spec.rows[p.i];
      const seen = /* @__PURE__ */ new Set([normalizeTerm(spec.term(row, lang))]);
      const out = [];
      for (const alias of spec.aliases(row, lang)) {
        const key = normalizeTerm(alias);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(alias);
      }
      return out;
    },
    hint: spec.hint && {
      pl: (p) => spec.hint(spec.rows[p.i], "pl"),
      ru: (p) => spec.hint(spec.rows[p.i], "ru")
    },
    solution: {
      pl: (p) => spec.solution(spec.rows[p.i], "pl"),
      ru: (p) => spec.solution(spec.rows[p.i], "ru")
    }
  };
}
function calcTemplate(spec) {
  const round = (n) => spec.decimals === void 0 ? Math.round(n) : Number(n.toFixed(spec.decimals));
  const show = (n) => String(round(n)).replace(".", ",");
  return {
    id: spec.id,
    topicId: spec.paragraph ?? spec.topicId,
    answerType: "number",
    tags: spec.tags,
    // a numeric range yields far more substitutions than a hand-written table has rows, so without
    // a cap one calculation would crowd out every term question in its dział
    maxTasks: spec.maxTasks ?? 12,
    params: spec.params,
    constraint: spec.constraint,
    difficulty: spec.difficulty,
    subtopic: spec.subtopic,
    question: (p, _d, lang) => spec.question(p, lang),
    verifyExpression: (p) => spec.decimals === void 0 ? `round(${spec.formula(p)})` : `round(${spec.formula(p)}, ${spec.decimals})`,
    correctAnswer: (p) => show(spec.value(p)),
    hint: spec.hint && {
      pl: (p) => spec.hint(p, "pl"),
      ru: (p) => spec.hint(p, "ru")
    },
    solution: {
      pl: (p) => spec.solution(p, show(spec.value(p)), "pl"),
      ru: (p) => spec.solution(p, show(spec.value(p)), "ru")
    }
  };
}
function pairFromTable(spec) {
  const label = spec.label ?? { pl: "Struktura", ru: "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430", feminine: ["pl", "ru"] };
  const feminine = (lang) => label.feminine?.includes(lang) ?? false;
  const ask = (lang) => lang === "pl" ? `Jaka jest ${feminine("pl") ? "jej" : "jego"} rola?` : `\u041A\u0430\u043A\u043E\u0432\u0430 ${feminine("ru") ? "\u0435\u0451" : "\u0435\u0433\u043E"} \u0440\u043E\u043B\u044C?`;
  return [
    choiceFromTable({
      id: `${spec.topicId}.${spec.slug}-to-role`,
      topicId: spec.topicId,
      paragraph: spec.paragraph,
      rows: spec.rows,
      subtopic: spec.subtopic,
      tags: spec.tags,
      difficulty: (r) => r.tier,
      shift: spec.shift ?? 0,
      question: (r, lang) => `${label[lang]}: ${r.name[lang]}. ${ask(lang)}`,
      optionText: (r, lang) => r.role[lang],
      misconception: spec.misconception,
      solution: (r, lang) => `${cap(r.name[lang])} \u2014 ${r.role[lang]}.`
    }),
    termFromTable({
      id: `${spec.topicId}.role-to-${spec.slug}`,
      topicId: spec.topicId,
      paragraph: spec.paragraph,
      rows: spec.rows,
      subtopic: spec.subtopic,
      tags: spec.tags,
      difficulty: (r) => r.tier,
      question: (r, lang) => lang === "pl" ? `Funkcja: ${r.role.pl}. Podaj nazw\u0119 w mianowniku.` : `\u0424\u0443\u043D\u043A\u0446\u0438\u044F: ${r.role.ru}. \u041D\u0430\u0437\u043E\u0432\u0438 \u0432 \u0438\u043C\u0435\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C \u043F\u0430\u0434\u0435\u0436\u0435.`,
      term: (r, lang) => r.name[lang],
      aliases: (r) => [r.name.pl, r.name.ru, ...r.aliases.pl, ...r.aliases.ru],
      solution: (r, lang) => lang === "pl" ? `Odpowied\u017A: ${r.name.pl}.` : `\u041E\u0442\u0432\u0435\u0442: ${r.name.ru}.`
    })
  ];
}

// packages/trainers/bio/src/server/templates/data/homeostasis.ts
var HOMEOSTASIS = [
  {
    id: "homeostaza",
    name: { pl: "homeostaza", ru: "\u0433\u043E\u043C\u0435\u043E\u0441\u0442\u0430\u0437" },
    role: { pl: "utrzymywanie sta\u0142o\u015Bci \u015Brodowiska wewn\u0119trznego mimo zmian na zewn\u0105trz", ru: "\u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u0441\u0442\u0432\u0430 \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0439 \u0441\u0440\u0435\u0434\u044B \u043D\u0435\u0441\u043C\u043E\u0442\u0440\u044F \u043D\u0430 \u0432\u043D\u0435\u0448\u043D\u0438\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "sprzezenie-ujemne",
    name: { pl: "ujemne sprz\u0119\u017Cenie zwrotne", ru: "\u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C" },
    role: { pl: "wygaszanie odchylenia przez reakcj\u0119 dzia\u0142aj\u0105c\u0105 w przeciwnym kierunku", ru: "\u0433\u0430\u0448\u0435\u043D\u0438\u0435 \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u044F \u043E\u0442\u0432\u0435\u0442\u043E\u043C, \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u043C \u0432 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u043F\u043E\u043B\u043E\u0436\u043D\u0443\u044E \u0441\u0442\u043E\u0440\u043E\u043D\u0443" },
    aliases: { pl: ["sprz\u0119\u017Cenie zwrotne ujemne"], ru: ["\u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C"] },
    tier: 1
  },
  {
    id: "sprzezenie-dodatnie",
    name: { pl: "dodatnie sprz\u0119\u017Cenie zwrotne", ru: "\u043F\u043E\u043B\u043E\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C" },
    role: { pl: "wzmacnianie odchylenia a\u017C do zako\u0144czenia procesu, jak przy porodzie", ru: "\u0443\u0441\u0438\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u044F \u0434\u043E \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430, \u043A\u0430\u043A \u043F\u0440\u0438 \u0440\u043E\u0434\u0430\u0445" },
    aliases: { pl: ["sprz\u0119\u017Cenie zwrotne dodatnie"], ru: ["\u043F\u043E\u043B\u043E\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C"] },
    tier: 2
  },
  {
    id: "receptor",
    name: { pl: "receptor", ru: "\u0440\u0435\u0446\u0435\u043F\u0442\u043E\u0440" },
    role: { pl: "wykrywanie zmiany parametru \u015Brodowiska wewn\u0119trznego lub zewn\u0119trznego", ru: "\u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044F \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0439 \u0438\u043B\u0438 \u0432\u043D\u0435\u0448\u043D\u0435\u0439 \u0441\u0440\u0435\u0434\u044B" },
    aliases: { pl: ["receptory"], ru: ["\u0440\u0435\u0446\u0435\u043F\u0442\u043E\u0440\u044B"] },
    tier: 1
  },
  {
    id: "osrodek-integrujacy",
    name: { pl: "o\u015Brodek integruj\u0105cy", ru: "\u0438\u043D\u0442\u0435\u0433\u0440\u0438\u0440\u0443\u044E\u0449\u0438\u0439 \u0446\u0435\u043D\u0442\u0440" },
    role: { pl: "por\xF3wnanie sygna\u0142u z warto\u015Bci\u0105 prawid\u0142ow\u0105 i wys\u0142anie polecenia do efektora", ru: "\u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0441\u0438\u0433\u043D\u0430\u043B\u0430 \u0441 \u043D\u043E\u0440\u043C\u043E\u0439 \u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u043A\u043E\u043C\u0430\u043D\u0434\u044B \u044D\u0444\u0444\u0435\u043A\u0442\u043E\u0440\u0443" },
    aliases: { pl: ["o\u015Brodek regulacyjny", "o\u015Brodek steruj\u0105cy"], ru: ["\u0440\u0435\u0433\u0443\u043B\u044F\u0442\u043E\u0440\u043D\u044B\u0439 \u0446\u0435\u043D\u0442\u0440", "\u0443\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0449\u0438\u0439 \u0446\u0435\u043D\u0442\u0440"] },
    tier: 2
  },
  {
    id: "efektor",
    name: { pl: "efektor", ru: "\u044D\u0444\u0444\u0435\u043A\u0442\u043E\u0440" },
    role: { pl: "wykonanie reakcji przywracaj\u0105cej warto\u015B\u0107 prawid\u0142ow\u0105, np. przez mi\u0119sie\u0144 lub gruczo\u0142", ru: "\u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u043E\u0442\u0432\u0435\u0442\u0430, \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u044E\u0449\u0435\u0433\u043E \u043D\u043E\u0440\u043C\u0443, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u043C\u044B\u0448\u0446\u0435\u0439 \u0438\u043B\u0438 \u0436\u0435\u043B\u0435\u0437\u043E\u0439" },
    aliases: { pl: ["efektory"], ru: ["\u044D\u0444\u0444\u0435\u043A\u0442\u043E\u0440\u044B"] },
    tier: 1
  },
  {
    id: "termoregulacja",
    name: { pl: "termoregulacja", ru: "\u0442\u0435\u0440\u043C\u043E\u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F" },
    role: { pl: "utrzymywanie sta\u0142ej temperatury cia\u0142a przez regulacj\u0119 wytwarzania i oddawania ciep\u0142a", ru: "\u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u043E\u0439 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B \u0442\u0435\u043B\u0430 \u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u0435\u0439 \u0442\u0435\u043F\u043B\u043E\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0438 \u0442\u0435\u043F\u043B\u043E\u043E\u0442\u0434\u0430\u0447\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "stalocieplnosc",
    name: { pl: "sta\u0142ocieplno\u015B\u0107", ru: "\u0442\u0435\u043F\u043B\u043E\u043A\u0440\u043E\u0432\u043D\u043E\u0441\u0442\u044C" },
    role: { pl: "zdolno\u015B\u0107 do sta\u0142ej temperatury cia\u0142a niezale\u017Cnie od otoczenia dzi\u0119ki ciep\u0142u z metabolizmu (ptaki i ssaki)", ru: "\u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u044C \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u0443\u044E \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0443 \u0442\u0435\u043B\u0430 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u0441\u0440\u0435\u0434\u044B \u0437\u0430 \u0441\u0447\u0451\u0442 \u0442\u0435\u043F\u043B\u0430 \u043E\u0431\u043C\u0435\u043D\u0430 \u0432\u0435\u0449\u0435\u0441\u0442\u0432 (\u043F\u0442\u0438\u0446\u044B \u0438 \u043C\u043B\u0435\u043A\u043E\u043F\u0438\u0442\u0430\u044E\u0449\u0438\u0435)" },
    aliases: { pl: ["endotermia", "homeotermia"], ru: ["\u044D\u043D\u0434\u043E\u0442\u0435\u0440\u043C\u0438\u044F", "\u0433\u043E\u043C\u043E\u0439\u043E\u0442\u0435\u0440\u043C\u0438\u044F", "\u0433\u043E\u043C\u0435\u043E\u0442\u0435\u0440\u043C\u0438\u044F"] },
    tier: 2
  },
  {
    id: "zmiennocieplnosc",
    name: { pl: "zmiennocieplno\u015B\u0107", ru: "\u0445\u043E\u043B\u043E\u0434\u043D\u043E\u043A\u0440\u043E\u0432\u043D\u043E\u0441\u0442\u044C" },
    role: { pl: "zale\u017Cno\u015B\u0107 temperatury cia\u0142a od temperatury otoczenia (ryby, p\u0142azy, gady)", ru: "\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u044C \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B \u0442\u0435\u043B\u0430 \u043E\u0442 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B \u0441\u0440\u0435\u0434\u044B (\u0440\u044B\u0431\u044B, \u0437\u0435\u043C\u043D\u043E\u0432\u043E\u0434\u043D\u044B\u0435, \u043F\u0440\u0435\u0441\u043C\u044B\u043A\u0430\u044E\u0449\u0438\u0435\u0441\u044F)" },
    aliases: { pl: ["ektotermia", "poikilotermia"], ru: ["\u044D\u043A\u0442\u043E\u0442\u0435\u0440\u043C\u0438\u044F", "\u043F\u043E\u0439\u043A\u0438\u043B\u043E\u0442\u0435\u0440\u043C\u0438\u044F"] },
    tier: 2
  },
  {
    id: "osmoregulacja",
    name: { pl: "osmoregulacja", ru: "\u043E\u0441\u043C\u043E\u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F" },
    role: { pl: "utrzymywanie sta\u0142ego st\u0119\u017Cenia soli i ilo\u015Bci wody w p\u0142ynach ustrojowych", ru: "\u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u043E\u0439 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u0438 \u0441\u043E\u043B\u0435\u0439 \u0438 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u0432\u043E\u0434\u044B \u0432 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u044F\u0445 \u0442\u0435\u043B\u0430" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "goraczka",
    name: { pl: "gor\u0105czka", ru: "\u043B\u0438\u0445\u043E\u0440\u0430\u0434\u043A\u0430" },
    role: { pl: "przestawienie o\u015Brodka termoregulacji na wy\u017Csz\u0105 temperatur\u0119 w odpowiedzi na infekcj\u0119", ru: "\u043F\u0435\u0440\u0435\u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0446\u0435\u043D\u0442\u0440\u0430 \u0442\u0435\u0440\u043C\u043E\u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u0438 \u043D\u0430 \u0431\u043E\u043B\u0435\u0435 \u0432\u044B\u0441\u043E\u043A\u0443\u044E \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0443 \u0432 \u043E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0438\u043D\u0444\u0435\u043A\u0446\u0438\u044E" },
    aliases: { pl: ["podwy\u017Cszona temperatura"], ru: ["\u0436\u0430\u0440", "\u043F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u0430\u044F \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430"] },
    tier: 2
  },
  {
    id: "hipotermia",
    name: { pl: "hipotermia", ru: "\u0433\u0438\u043F\u043E\u0442\u0435\u0440\u043C\u0438\u044F" },
    role: { pl: "niebezpieczne obni\u017Cenie temperatury g\u0142\u0119bokiej cia\u0142a poni\u017Cej 35 \xB0C", ru: "\u043E\u043F\u0430\u0441\u043D\u043E\u0435 \u0441\u043D\u0438\u0436\u0435\u043D\u0438\u0435 \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0439 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B \u0442\u0435\u043B\u0430 \u043D\u0438\u0436\u0435 35 \xB0C" },
    aliases: { pl: ["wych\u0142odzenie"], ru: ["\u043F\u0435\u0440\u0435\u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u0435"] },
    tier: 2
  },
  {
    id: "odwodnienie",
    name: { pl: "odwodnienie", ru: "\u043E\u0431\u0435\u0437\u0432\u043E\u0436\u0438\u0432\u0430\u043D\u0438\u0435" },
    role: { pl: "zaburzenie homeostazy wywo\u0142ane utrat\u0105 wody wi\u0119ksz\u0105 ni\u017C jej pobieranie", ru: "\u043D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u0435 \u0433\u043E\u043C\u0435\u043E\u0441\u0442\u0430\u0437\u0430 \u0438\u0437-\u0437\u0430 \u043F\u043E\u0442\u0435\u0440\u0438 \u0432\u043E\u0434\u044B, \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u044E\u0449\u0435\u0439 \u0435\u0451 \u043F\u043E\u0441\u0442\u0443\u043F\u043B\u0435\u043D\u0438\u0435" },
    aliases: { pl: ["dehydratacja"], ru: ["\u0434\u0435\u0433\u0438\u0434\u0440\u0430\u0442\u0430\u0446\u0438\u044F"] },
    tier: 1
  }
];
var PARAMETERS = [
  {
    id: "temperatura",
    parameter: { pl: "temperatura wewn\u0119trzna cia\u0142a", ru: "\u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u044F\u044F \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0442\u0435\u043B\u0430" },
    norm: { pl: "oko\u0142o 36,6 \xB0C (36\u201337 \xB0C)", ru: "\u043E\u043A\u043E\u043B\u043E 36,6 \xB0C (36\u201337 \xB0C)" },
    aliases: { pl: ["temperatura cia\u0142a", "temperatura"], ru: ["\u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0442\u0435\u043B\u0430", "\u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430"] },
    tier: 1
  },
  {
    id: "ph-krwi",
    parameter: { pl: "pH krwi", ru: "pH \u043A\u0440\u043E\u0432\u0438" },
    norm: { pl: "7,35\u20137,45", ru: "7,35\u20137,45" },
    aliases: { pl: ["pH", "odczyn krwi"], ru: ["pH", "\u0440\u041D \u043A\u0440\u043E\u0432\u0438", "\u043A\u0438\u0441\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C \u043A\u0440\u043E\u0432\u0438"] },
    tier: 2
  },
  {
    id: "glukoza",
    parameter: { pl: "st\u0119\u017Cenie glukozy we krwi", ru: "\u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0432 \u043A\u0440\u043E\u0432\u0438" },
    norm: { pl: "70\u201399 mg/dl na czczo", ru: "70\u201399 \u043C\u0433/\u0434\u043B \u043D\u0430\u0442\u043E\u0449\u0430\u043A" },
    aliases: { pl: ["glukoza", "glikemia", "poziom glukozy"], ru: ["\u0433\u043B\u044E\u043A\u043E\u0437\u0430", "\u0441\u0430\u0445\u0430\u0440 \u043A\u0440\u043E\u0432\u0438", "\u0433\u043B\u0438\u043A\u0435\u043C\u0438\u044F"] },
    tier: 2
  },
  {
    id: "cisnienie",
    parameter: { pl: "ci\u015Bnienie t\u0119tnicze krwi", ru: "\u0430\u0440\u0442\u0435\u0440\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435" },
    norm: { pl: "oko\u0142o 120/80 mm Hg", ru: "\u043E\u043A\u043E\u043B\u043E 120/80 \u043C\u043C \u0440\u0442. \u0441\u0442." },
    aliases: { pl: ["ci\u015Bnienie krwi", "ci\u015Bnienie"], ru: ["\u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435", "\u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043A\u0440\u043E\u0432\u0438"] },
    tier: 1
  },
  {
    id: "tetno",
    parameter: { pl: "t\u0119tno", ru: "\u043F\u0443\u043B\u044C\u0441" },
    norm: { pl: "60\u201380 uderze\u0144 na minut\u0119 w spoczynku", ru: "60\u201380 \u0443\u0434\u0430\u0440\u043E\u0432 \u0432 \u043C\u0438\u043D\u0443\u0442\u0443 \u0432 \u043F\u043E\u043A\u043E\u0435" },
    aliases: { pl: ["puls", "cz\u0119sto\u015B\u0107 skurcz\xF3w serca"], ru: ["\u0447\u0430\u0441\u0442\u043E\u0442\u0430 \u0441\u0435\u0440\u0434\u0435\u0447\u043D\u044B\u0445 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u0439", "\u0427\u0421\u0421"] },
    tier: 1
  },
  {
    id: "oddechy",
    parameter: { pl: "cz\u0119sto\u015B\u0107 oddech\xF3w", ru: "\u0447\u0430\u0441\u0442\u043E\u0442\u0430 \u0434\u044B\u0445\u0430\u043D\u0438\u044F" },
    norm: { pl: "12\u201320 oddech\xF3w na minut\u0119 w spoczynku", ru: "12\u201320 \u0432\u0434\u043E\u0445\u043E\u0432 \u0432 \u043C\u0438\u043D\u0443\u0442\u0443 \u0432 \u043F\u043E\u043A\u043E\u0435" },
    aliases: { pl: ["liczba oddech\xF3w", "cz\u0119stotliwo\u015B\u0107 oddech\xF3w"], ru: ["\u0447\u0430\u0441\u0442\u043E\u0442\u0430 \u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0439", "\u0427\u0414\u0414"] },
    tier: 2
  }
];
var RESPONSES = [
  {
    id: "temperatura-wzrost",
    deviation: { pl: "wzrost temperatury cia\u0142a", ru: "\u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u0435 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B \u0442\u0435\u043B\u0430" },
    response: { pl: "rozszerzenie naczy\u0144 sk\xF3ry i wydzielanie potu", ru: "\u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u0441\u043E\u0441\u0443\u0434\u043E\u0432 \u043A\u043E\u0436\u0438 \u0438 \u043F\u043E\u0442\u043E\u043E\u0442\u0434\u0435\u043B\u0435\u043D\u0438\u0435" },
    feedback: "ujemne",
    tier: 1
  },
  {
    id: "temperatura-spadek",
    deviation: { pl: "spadek temperatury cia\u0142a", ru: "\u043F\u043E\u043D\u0438\u0436\u0435\u043D\u0438\u0435 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B \u0442\u0435\u043B\u0430" },
    response: { pl: "zw\u0119\u017Cenie naczy\u0144 sk\xF3ry i dr\u017Cenie mi\u0119\u015Bni", ru: "\u0441\u0443\u0436\u0435\u043D\u0438\u0435 \u0441\u043E\u0441\u0443\u0434\u043E\u0432 \u043A\u043E\u0436\u0438 \u0438 \u043C\u044B\u0448\u0435\u0447\u043D\u0430\u044F \u0434\u0440\u043E\u0436\u044C" },
    feedback: "ujemne",
    tier: 1
  },
  {
    id: "glukoza-wzrost",
    deviation: { pl: "wzrost st\u0119\u017Cenia glukozy we krwi", ru: "\u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u0435 \u0443\u0440\u043E\u0432\u043D\u044F \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0432 \u043A\u0440\u043E\u0432\u0438" },
    response: { pl: "wydzielanie insuliny i magazynowanie glukozy jako glikogenu", ru: "\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0438\u043D\u0441\u0443\u043B\u0438\u043D\u0430 \u0438 \u0437\u0430\u043F\u0430\u0441\u0430\u043D\u0438\u0435 \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0432 \u0432\u0438\u0434\u0435 \u0433\u043B\u0438\u043A\u043E\u0433\u0435\u043D\u0430" },
    feedback: "ujemne",
    tier: 1
  },
  {
    id: "glukoza-spadek",
    deviation: { pl: "spadek st\u0119\u017Cenia glukozy we krwi", ru: "\u043F\u043E\u043D\u0438\u0436\u0435\u043D\u0438\u0435 \u0443\u0440\u043E\u0432\u043D\u044F \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0432 \u043A\u0440\u043E\u0432\u0438" },
    response: { pl: "wydzielanie glukagonu i rozk\u0142ad glikogenu w w\u0105trobie", ru: "\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0433\u043B\u044E\u043A\u0430\u0433\u043E\u043D\u0430 \u0438 \u0440\u0430\u0441\u043F\u0430\u0434 \u0433\u043B\u0438\u043A\u043E\u0433\u0435\u043D\u0430 \u0432 \u043F\u0435\u0447\u0435\u043D\u0438" },
    feedback: "ujemne",
    tier: 2
  },
  {
    id: "woda-niedobor",
    deviation: { pl: "niedob\xF3r wody w organizmie", ru: "\u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u043A \u0432\u043E\u0434\u044B \u0432 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C\u0435" },
    response: { pl: "uczucie pragnienia i zag\u0119szczanie moczu pod wp\u0142ywem ADH", ru: "\u0447\u0443\u0432\u0441\u0442\u0432\u043E \u0436\u0430\u0436\u0434\u044B \u0438 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043C\u043E\u0447\u0438 \u043F\u043E\u0434 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u043C \u0410\u0414\u0413" },
    feedback: "ujemne",
    tier: 2
  },
  {
    id: "co2-wzrost",
    deviation: { pl: "wzrost st\u0119\u017Cenia CO\u2082 we krwi", ru: "\u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u0435 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u0438 CO\u2082 \u0432 \u043A\u0440\u043E\u0432\u0438" },
    response: { pl: "przyspieszenie i pog\u0142\u0119bienie oddech\xF3w", ru: "\u0443\u0447\u0430\u0449\u0435\u043D\u0438\u0435 \u0438 \u0443\u0433\u043B\u0443\u0431\u043B\u0435\u043D\u0438\u0435 \u0434\u044B\u0445\u0430\u043D\u0438\u044F" },
    feedback: "ujemne",
    tier: 2
  },
  {
    id: "cisnienie-spadek",
    deviation: { pl: "spadek ci\u015Bnienia t\u0119tniczego krwi", ru: "\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u0430\u0440\u0442\u0435\u0440\u0438\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u044F" },
    response: { pl: "przyspieszenie pracy serca i zw\u0119\u017Cenie naczy\u0144 krwiono\u015Bnych", ru: "\u0443\u0447\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u0430\u0431\u043E\u0442\u044B \u0441\u0435\u0440\u0434\u0446\u0430 \u0438 \u0441\u0443\u0436\u0435\u043D\u0438\u0435 \u043A\u0440\u043E\u0432\u0435\u043D\u043E\u0441\u043D\u044B\u0445 \u0441\u043E\u0441\u0443\u0434\u043E\u0432" },
    feedback: "ujemne",
    tier: 2
  },
  {
    id: "porod",
    deviation: { pl: "rozci\u0105ganie szyjki macicy podczas porodu", ru: "\u0440\u0430\u0441\u0442\u044F\u0436\u0435\u043D\u0438\u0435 \u0448\u0435\u0439\u043A\u0438 \u043C\u0430\u0442\u043A\u0438 \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0440\u043E\u0434\u043E\u0432" },
    response: { pl: "coraz silniejsze wydzielanie oksytocyny i skurcze macicy", ru: "\u0432\u0441\u0451 \u0431\u043E\u043B\u0435\u0435 \u0441\u0438\u043B\u044C\u043D\u043E\u0435 \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043E\u043A\u0441\u0438\u0442\u043E\u0446\u0438\u043D\u0430 \u0438 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u043C\u0430\u0442\u043A\u0438" },
    feedback: "dodatnie",
    tier: 2
  }
];

// packages/trainers/bio/src/server/templates/topics/lo3Homeostasis.ts
var TOPIC = "bio.lo3.organism";
var TAGS2 = ["homeostaza"];
var SUBTOPIC = { pl: "homeostaza i sprz\u0119\u017Cenie zwrotne", ru: "\u0433\u043E\u043C\u0435\u043E\u0441\u0442\u0430\u0437 \u0438 \u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C" };
var PARAMS = { pl: "parametry \u015Brodowiska wewn\u0119trznego", ru: "\u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u0438 \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0439 \u0441\u0440\u0435\u0434\u044B" };
var terms = pairFromTable({
  topicId: TOPIC,
  paragraph: P.organism.homeostasis,
  slug: "homeostasis",
  rows: HOMEOSTASIS,
  subtopic: SUBTOPIC,
  tags: TAGS2,
  shift: 2,
  label: { pl: "Poj\u0119cie", ru: "\u041F\u043E\u043D\u044F\u0442\u0438\u0435" },
  misconception: {
    pl: "pokrewne poj\u0119cie regulacji \u2014 \u0142atwo pomyli\u0107 rodzaje sprz\u0119\u017Cenia albo ogniwa p\u0119tli",
    ru: "\u0441\u043C\u0435\u0436\u043D\u043E\u0435 \u043F\u043E\u043D\u044F\u0442\u0438\u0435 \u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u0438 \u2014 \u043B\u0435\u0433\u043A\u043E \u0441\u043F\u0443\u0442\u0430\u0442\u044C \u0432\u0438\u0434\u044B \u043E\u0431\u0440\u0430\u0442\u043D\u043E\u0439 \u0441\u0432\u044F\u0437\u0438 \u0438\u043B\u0438 \u0437\u0432\u0435\u043D\u044C\u044F \u043A\u043E\u043D\u0442\u0443\u0440\u0430"
  }
});
var parameterToNorm = choiceFromTable({
  id: `${TOPIC}.parameter-to-norm`,
  topicId: TOPIC,
  paragraph: P.organism.homeostasis,
  rows: PARAMETERS,
  subtopic: PARAMS,
  tags: TAGS2,
  difficulty: (r) => r.tier,
  shift: 1,
  question: (r, lang) => lang === "pl" ? `Parametr: ${r.parameter.pl}. Jaka jest jego warto\u015B\u0107 prawid\u0142owa?` : `\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044C: ${r.parameter.ru}. \u041A\u0430\u043A\u043E\u0432\u0430 \u0435\u0433\u043E \u043D\u043E\u0440\u043C\u0430?`,
  optionText: (r, lang) => r.norm[lang],
  misconception: { pl: "norma innego parametru \u015Brodowiska wewn\u0119trznego", ru: "\u043D\u043E\u0440\u043C\u0430 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044F \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0439 \u0441\u0440\u0435\u0434\u044B" },
  // the parameter does not open the sentence: "pH" must not become "PH"
  solution: (r, lang) => lang === "pl" ? `Warto\u015B\u0107 prawid\u0142owa parametru \u201E${r.parameter.pl}\u201D: ${r.norm.pl}.` : `\u041D\u043E\u0440\u043C\u0430 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044F \xAB${r.parameter.ru}\xBB: ${r.norm.ru}.`
});
var normToParameter = termFromTable({
  id: `${TOPIC}.norm-to-parameter`,
  topicId: TOPIC,
  paragraph: P.organism.homeostasis,
  rows: PARAMETERS,
  subtopic: PARAMS,
  tags: TAGS2,
  difficulty: (r) => r.tier,
  question: (r, lang) => lang === "pl" ? `Warto\u015B\u0107 prawid\u0142owa: ${r.norm.pl}. Jakiego parametru dotyczy? Podaj nazw\u0119 w mianowniku.` : `\u041D\u043E\u0440\u043C\u0430: ${r.norm.ru}. \u041A \u043A\u0430\u043A\u043E\u043C\u0443 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044E \u043E\u043D\u0430 \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0441\u044F? \u041D\u0430\u0437\u043E\u0432\u0438 \u0432 \u0438\u043C\u0435\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C \u043F\u0430\u0434\u0435\u0436\u0435.`,
  term: (r, lang) => r.parameter[lang],
  aliases: (r) => [r.parameter.pl, r.parameter.ru, ...r.aliases.pl, ...r.aliases.ru],
  solution: (r, lang) => lang === "pl" ? `Odpowied\u017A: ${r.parameter.pl}.` : `\u041E\u0442\u0432\u0435\u0442: ${r.parameter.ru}.`
});
var deviationToResponse = choiceFromTable({
  id: `${TOPIC}.deviation-to-response`,
  topicId: TOPIC,
  paragraph: P.organism.homeostasis,
  rows: RESPONSES,
  subtopic: SUBTOPIC,
  tags: TAGS2,
  difficulty: (r) => r.tier,
  shift: 3,
  question: (r, lang) => lang === "pl" ? `Zmiana: ${r.deviation.pl}. Jak reaguje organizm?` : `\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435: ${r.deviation.ru}. \u041A\u0430\u043A \u0440\u0435\u0430\u0433\u0438\u0440\u0443\u0435\u0442 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C?`,
  optionText: (r, lang) => r.response[lang],
  misconception: {
    pl: "reakcja na inn\u0105 zmian\u0119 \u2014 cz\u0119sto na zmian\u0119 przeciwn\u0105",
    ru: "\u043E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0434\u0440\u0443\u0433\u043E\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u2014 \u0447\u0430\u0441\u0442\u043E \u043D\u0430 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u043F\u043E\u043B\u043E\u0436\u043D\u043E\u0435"
  },
  solution: (r, lang) => {
    if (lang === "pl") {
      const loop2 = r.feedback === "ujemne" ? "To ujemne sprz\u0119\u017Cenie zwrotne: reakcja znosi zmian\u0119 i przywraca stan prawid\u0142owy." : "To dodatnie sprz\u0119\u017Cenie zwrotne: reakcja nasila bodziec, a\u017C proces si\u0119 zako\u0144czy.";
      return `${cap(r.deviation.pl)} \u2192 ${r.response.pl}. ${loop2}`;
    }
    const loop = r.feedback === "ujemne" ? "\u042D\u0442\u043E \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C: \u043E\u0442\u0432\u0435\u0442 \u0443\u0441\u0442\u0440\u0430\u043D\u044F\u0435\u0442 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0438 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u043D\u043E\u0440\u043C\u0443." : "\u042D\u0442\u043E \u043F\u043E\u043B\u043E\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C: \u043E\u0442\u0432\u0435\u0442 \u0443\u0441\u0438\u043B\u0438\u0432\u0430\u0435\u0442 \u0441\u0442\u0438\u043C\u0443\u043B, \u043F\u043E\u043A\u0430 \u043F\u0440\u043E\u0446\u0435\u0441\u0441 \u043D\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0441\u044F.";
    return `${cap(r.deviation.ru)} \u2192 ${r.response.ru}. ${loop}`;
  }
});
var lo3HomeostasisTemplates = [...terms, parameterToNorm, normToParameter, deviationToResponse];

// packages/trainers/bio/src/server/templates/data/hormones.ts
var HORMONES = [
  {
    id: "somatotropina",
    gland: { pl: "przedni p\u0142at przysadki m\xF3zgowej", ru: "\u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0434\u043E\u043B\u044F \u0433\u0438\u043F\u043E\u0444\u0438\u0437\u0430" },
    name: { pl: "somatotropina", ru: "\u0441\u043E\u043C\u0430\u0442\u043E\u0442\u0440\u043E\u043F\u0438\u043D" },
    action: { pl: "pobudza wzrost ko\u015Bci d\u0142ugich i syntez\u0119 bia\u0142ek", ru: "\u0441\u0442\u0438\u043C\u0443\u043B\u0438\u0440\u0443\u0435\u0442 \u0440\u043E\u0441\u0442 \u0434\u043B\u0438\u043D\u043D\u044B\u0445 \u043A\u043E\u0441\u0442\u0435\u0439 \u0438 \u0441\u0438\u043D\u0442\u0435\u0437 \u0431\u0435\u043B\u043A\u0430" },
    aliases: { pl: ["hormon wzrostu", "GH", "STH"], ru: ["\u0433\u043E\u0440\u043C\u043E\u043D \u0440\u043E\u0441\u0442\u0430", "\u0421\u0422\u0413", "GH"] },
    tier: 1
  },
  {
    id: "tyreotropina",
    gland: { pl: "przedni p\u0142at przysadki m\xF3zgowej", ru: "\u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0434\u043E\u043B\u044F \u0433\u0438\u043F\u043E\u0444\u0438\u0437\u0430" },
    name: { pl: "tyreotropina", ru: "\u0442\u0438\u0440\u0435\u043E\u0442\u0440\u043E\u043F\u0438\u043D" },
    action: { pl: "pobudza tarczyc\u0119 do wydzielania tyroksyny", ru: "\u0441\u0442\u0438\u043C\u0443\u043B\u0438\u0440\u0443\u0435\u0442 \u0449\u0438\u0442\u043E\u0432\u0438\u0434\u043D\u0443\u044E \u0436\u0435\u043B\u0435\u0437\u0443 \u0432\u044B\u0434\u0435\u043B\u044F\u0442\u044C \u0442\u0438\u0440\u043E\u043A\u0441\u0438\u043D" },
    aliases: { pl: ["TSH", "hormon tyreotropowy"], ru: ["\u0422\u0422\u0413", "TSH", "\u0442\u0438\u0440\u0435\u043E\u0442\u0440\u043E\u043F\u043D\u044B\u0439 \u0433\u043E\u0440\u043C\u043E\u043D"] },
    tier: 2
  },
  {
    id: "kortykotropina",
    gland: { pl: "przedni p\u0142at przysadki m\xF3zgowej", ru: "\u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0434\u043E\u043B\u044F \u0433\u0438\u043F\u043E\u0444\u0438\u0437\u0430" },
    name: { pl: "kortykotropina", ru: "\u043A\u043E\u0440\u0442\u0438\u043A\u043E\u0442\u0440\u043E\u043F\u0438\u043D" },
    action: { pl: "pobudza kor\u0119 nadnerczy do wydzielania kortyzolu", ru: "\u0441\u0442\u0438\u043C\u0443\u043B\u0438\u0440\u0443\u0435\u0442 \u043A\u043E\u0440\u0443 \u043D\u0430\u0434\u043F\u043E\u0447\u0435\u0447\u043D\u0438\u043A\u043E\u0432 \u0432\u044B\u0434\u0435\u043B\u044F\u0442\u044C \u043A\u043E\u0440\u0442\u0438\u0437\u043E\u043B" },
    aliases: { pl: ["ACTH", "hormon adrenokortykotropowy"], ru: ["\u0410\u041A\u0422\u0413", "ACTH", "\u0430\u0434\u0440\u0435\u043D\u043E\u043A\u043E\u0440\u0442\u0438\u043A\u043E\u0442\u0440\u043E\u043F\u043D\u044B\u0439 \u0433\u043E\u0440\u043C\u043E\u043D"] },
    tier: 2
  },
  {
    id: "folikulotropina",
    gland: { pl: "przedni p\u0142at przysadki m\xF3zgowej", ru: "\u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0434\u043E\u043B\u044F \u0433\u0438\u043F\u043E\u0444\u0438\u0437\u0430" },
    name: { pl: "folikulotropina", ru: "\u0444\u043E\u043B\u043B\u0438\u043A\u0443\u043B\u043E\u0441\u0442\u0438\u043C\u0443\u043B\u0438\u0440\u0443\u044E\u0449\u0438\u0439 \u0433\u043E\u0440\u043C\u043E\u043D" },
    action: { pl: "pobudza dojrzewanie p\u0119cherzyk\xF3w jajnikowych i spermatogenez\u0119", ru: "\u0441\u0442\u0438\u043C\u0443\u043B\u0438\u0440\u0443\u0435\u0442 \u0441\u043E\u0437\u0440\u0435\u0432\u0430\u043D\u0438\u0435 \u0444\u043E\u043B\u043B\u0438\u043A\u0443\u043B\u043E\u0432 \u044F\u0438\u0447\u043D\u0438\u043A\u0430 \u0438 \u0441\u043F\u0435\u0440\u043C\u0430\u0442\u043E\u0433\u0435\u043D\u0435\u0437" },
    aliases: { pl: ["FSH", "hormon folikulotropowy"], ru: ["\u0424\u0421\u0413", "FSH"] },
    tier: 2
  },
  {
    id: "lutropina",
    gland: { pl: "przedni p\u0142at przysadki m\xF3zgowej", ru: "\u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0434\u043E\u043B\u044F \u0433\u0438\u043F\u043E\u0444\u0438\u0437\u0430" },
    name: { pl: "lutropina", ru: "\u043B\u044E\u0442\u0435\u0438\u043D\u0438\u0437\u0438\u0440\u0443\u044E\u0449\u0438\u0439 \u0433\u043E\u0440\u043C\u043E\u043D" },
    action: { pl: "wywo\u0142uje owulacj\u0119 i powstanie cia\u0142ka \u017C\xF3\u0142tego", ru: "\u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u043E\u0432\u0443\u043B\u044F\u0446\u0438\u044E \u0438 \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0436\u0451\u043B\u0442\u043E\u0433\u043E \u0442\u0435\u043B\u0430" },
    aliases: { pl: ["LH", "hormon luteinizuj\u0105cy"], ru: ["\u041B\u0413", "LH"] },
    tier: 2
  },
  {
    id: "prolaktyna",
    gland: { pl: "przedni p\u0142at przysadki m\xF3zgowej", ru: "\u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0434\u043E\u043B\u044F \u0433\u0438\u043F\u043E\u0444\u0438\u0437\u0430" },
    name: { pl: "prolaktyna", ru: "\u043F\u0440\u043E\u043B\u0430\u043A\u0442\u0438\u043D" },
    action: { pl: "pobudza gruczo\u0142y sutkowe do wytwarzania mleka", ru: "\u0441\u0442\u0438\u043C\u0443\u043B\u0438\u0440\u0443\u0435\u0442 \u0432\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0443 \u043C\u043E\u043B\u043E\u043A\u0430 \u043C\u043E\u043B\u043E\u0447\u043D\u044B\u043C\u0438 \u0436\u0435\u043B\u0435\u0437\u0430\u043C\u0438" },
    aliases: { pl: ["PRL"], ru: ["\u041F\u0420\u041B", "PRL"] },
    tier: 1
  },
  {
    id: "wazopresyna",
    gland: { pl: "tylny p\u0142at przysadki m\xF3zgowej", ru: "\u0437\u0430\u0434\u043D\u044F\u044F \u0434\u043E\u043B\u044F \u0433\u0438\u043F\u043E\u0444\u0438\u0437\u0430" },
    name: { pl: "wazopresyna", ru: "\u0432\u0430\u0437\u043E\u043F\u0440\u0435\u0441\u0441\u0438\u043D" },
    action: { pl: "zwi\u0119ksza resorpcj\u0119 zwrotn\u0105 wody w kanalikach nerkowych", ru: "\u0443\u0441\u0438\u043B\u0438\u0432\u0430\u0435\u0442 \u043E\u0431\u0440\u0430\u0442\u043D\u043E\u0435 \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u0435 \u0432\u043E\u0434\u044B \u0432 \u043F\u043E\u0447\u0435\u0447\u043D\u044B\u0445 \u043A\u0430\u043D\u0430\u043B\u044C\u0446\u0430\u0445" },
    aliases: { pl: ["ADH", "hormon antydiuretyczny"], ru: ["\u0410\u0414\u0413", "ADH", "\u0430\u043D\u0442\u0438\u0434\u0438\u0443\u0440\u0435\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0433\u043E\u0440\u043C\u043E\u043D"] },
    tier: 2
  },
  {
    id: "oksytocyna",
    gland: { pl: "tylny p\u0142at przysadki m\xF3zgowej", ru: "\u0437\u0430\u0434\u043D\u044F\u044F \u0434\u043E\u043B\u044F \u0433\u0438\u043F\u043E\u0444\u0438\u0437\u0430" },
    name: { pl: "oksytocyna", ru: "\u043E\u043A\u0441\u0438\u0442\u043E\u0446\u0438\u043D" },
    action: { pl: "wywo\u0142uje skurcze mi\u0119\u015Bni macicy podczas porodu", ru: "\u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u043C\u044B\u0448\u0446 \u043C\u0430\u0442\u043A\u0438 \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0440\u043E\u0434\u043E\u0432" },
    aliases: { pl: ["OXT"], ru: ["\u043E\u043A\u0441\u0438\u0442\u043E\u0446\u0438\u043D\u0430"] },
    tier: 1
  },
  {
    id: "tyroksyna",
    gland: { pl: "tarczyca", ru: "\u0449\u0438\u0442\u043E\u0432\u0438\u0434\u043D\u0430\u044F \u0436\u0435\u043B\u0435\u0437\u0430" },
    name: { pl: "tyroksyna", ru: "\u0442\u0438\u0440\u043E\u043A\u0441\u0438\u043D" },
    action: { pl: "zwi\u0119ksza tempo przemiany materii i wytwarzanie ciep\u0142a", ru: "\u043F\u043E\u0432\u044B\u0448\u0430\u0435\u0442 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043E\u0431\u043C\u0435\u043D\u0430 \u0432\u0435\u0449\u0435\u0441\u0442\u0432 \u0438 \u0442\u0435\u043F\u043B\u043E\u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044E" },
    aliases: { pl: ["T4", "tetrajodotyronina"], ru: ["\u04224", "T4", "\u0442\u0435\u0442\u0440\u0430\u0439\u043E\u0434\u0442\u0438\u0440\u043E\u043D\u0438\u043D"] },
    tier: 1
  },
  {
    id: "kalcytonina",
    gland: { pl: "tarczyca", ru: "\u0449\u0438\u0442\u043E\u0432\u0438\u0434\u043D\u0430\u044F \u0436\u0435\u043B\u0435\u0437\u0430" },
    name: { pl: "kalcytonina", ru: "\u043A\u0430\u043B\u044C\u0446\u0438\u0442\u043E\u043D\u0438\u043D" },
    action: { pl: "obni\u017Ca poziom wapnia we krwi, hamuj\u0105c resorpcj\u0119 ko\u015Bci", ru: "\u0441\u043D\u0438\u0436\u0430\u0435\u0442 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043A\u0430\u043B\u044C\u0446\u0438\u044F \u0432 \u043A\u0440\u043E\u0432\u0438, \u043F\u043E\u0434\u0430\u0432\u043B\u044F\u044F \u0440\u0435\u0437\u043E\u0440\u0431\u0446\u0438\u044E \u043A\u043E\u0441\u0442\u0438" },
    aliases: { pl: ["CT"], ru: ["\u043A\u0430\u043B\u044C\u0446\u0438\u0442\u043E\u043D\u0438\u043D\u0430"] },
    tier: 2
  },
  {
    id: "parathormon",
    gland: { pl: "przytarczyce", ru: "\u043F\u0430\u0440\u0430\u0449\u0438\u0442\u043E\u0432\u0438\u0434\u043D\u044B\u0435 \u0436\u0435\u043B\u0435\u0437\u044B" },
    name: { pl: "parathormon", ru: "\u043F\u0430\u0440\u0430\u0442\u0433\u043E\u0440\u043C\u043E\u043D" },
    action: { pl: "podwy\u017Csza poziom wapnia we krwi, uwalniaj\u0105c go z ko\u015Bci", ru: "\u043F\u043E\u0432\u044B\u0448\u0430\u0435\u0442 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043A\u0430\u043B\u044C\u0446\u0438\u044F \u0432 \u043A\u0440\u043E\u0432\u0438, \u0432\u044B\u0441\u0432\u043E\u0431\u043E\u0436\u0434\u0430\u044F \u0435\u0433\u043E \u0438\u0437 \u043A\u043E\u0441\u0442\u0435\u0439" },
    aliases: { pl: ["PTH", "hormon przytarczyc"], ru: ["\u041F\u0422\u0413", "PTH", "\u043F\u0430\u0440\u0430\u0442\u0438\u0440\u0435\u043E\u0438\u0434\u043D\u044B\u0439 \u0433\u043E\u0440\u043C\u043E\u043D"] },
    tier: 2
  },
  {
    id: "kortyzol",
    gland: { pl: "kora nadnerczy", ru: "\u043A\u043E\u0440\u0430 \u043D\u0430\u0434\u043F\u043E\u0447\u0435\u0447\u043D\u0438\u043A\u043E\u0432" },
    name: { pl: "kortyzol", ru: "\u043A\u043E\u0440\u0442\u0438\u0437\u043E\u043B" },
    action: { pl: "podwy\u017Csza poziom glukozy z rezerw bia\u0142ek i t\u0142uszcz\xF3w, hamuje odczyn zapalny", ru: "\u043F\u043E\u0432\u044B\u0448\u0430\u0435\u0442 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0437\u0430 \u0441\u0447\u0451\u0442 \u0431\u0435\u043B\u043A\u043E\u0432 \u0438 \u0436\u0438\u0440\u043E\u0432, \u043F\u043E\u0434\u0430\u0432\u043B\u044F\u0435\u0442 \u0432\u043E\u0441\u043F\u0430\u043B\u0435\u043D\u0438\u0435" },
    aliases: { pl: ["hydrokortyzon"], ru: ["\u0433\u0438\u0434\u0440\u043E\u043A\u043E\u0440\u0442\u0438\u0437\u043E\u043D"] },
    tier: 2
  },
  {
    id: "aldosteron",
    gland: { pl: "kora nadnerczy", ru: "\u043A\u043E\u0440\u0430 \u043D\u0430\u0434\u043F\u043E\u0447\u0435\u0447\u043D\u0438\u043A\u043E\u0432" },
    name: { pl: "aldosteron", ru: "\u0430\u043B\u044C\u0434\u043E\u0441\u0442\u0435\u0440\u043E\u043D" },
    action: { pl: "zwi\u0119ksza resorpcj\u0119 zwrotn\u0105 sodu i wydalanie potasu w nerkach", ru: "\u0443\u0441\u0438\u043B\u0438\u0432\u0430\u0435\u0442 \u043E\u0431\u0440\u0430\u0442\u043D\u043E\u0435 \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u0435 \u043D\u0430\u0442\u0440\u0438\u044F \u0438 \u0432\u044B\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043A\u0430\u043B\u0438\u044F \u0432 \u043F\u043E\u0447\u043A\u0430\u0445" },
    aliases: { pl: ["mineralokortykoid"], ru: ["\u043C\u0438\u043D\u0435\u0440\u0430\u043B\u043E\u043A\u043E\u0440\u0442\u0438\u043A\u043E\u0438\u0434"] },
    tier: 3
  },
  {
    id: "adrenalina",
    gland: { pl: "rdze\u0144 nadnerczy", ru: "\u043C\u043E\u0437\u0433\u043E\u0432\u043E\u0435 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u043E \u043D\u0430\u0434\u043F\u043E\u0447\u0435\u0447\u043D\u0438\u043A\u043E\u0432" },
    name: { pl: "adrenalina", ru: "\u0430\u0434\u0440\u0435\u043D\u0430\u043B\u0438\u043D" },
    action: { pl: "przyspiesza akcj\u0119 serca i rozszerza oskrzela w reakcji na stres", ru: "\u0443\u0441\u043A\u043E\u0440\u044F\u0435\u0442 \u0440\u0430\u0431\u043E\u0442\u0443 \u0441\u0435\u0440\u0434\u0446\u0430 \u0438 \u0440\u0430\u0441\u0448\u0438\u0440\u044F\u0435\u0442 \u0431\u0440\u043E\u043D\u0445\u0438 \u0432 \u043E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0441\u0442\u0440\u0435\u0441\u0441" },
    aliases: { pl: ["epinefryna"], ru: ["\u044D\u043F\u0438\u043D\u0435\u0444\u0440\u0438\u043D"] },
    tier: 1
  },
  {
    id: "noradrenalina",
    gland: { pl: "rdze\u0144 nadnerczy", ru: "\u043C\u043E\u0437\u0433\u043E\u0432\u043E\u0435 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u043E \u043D\u0430\u0434\u043F\u043E\u0447\u0435\u0447\u043D\u0438\u043A\u043E\u0432" },
    name: { pl: "noradrenalina", ru: "\u043D\u043E\u0440\u0430\u0434\u0440\u0435\u043D\u0430\u043B\u0438\u043D" },
    action: { pl: "obkurcza naczynia krwiono\u015Bne i podnosi ci\u015Bnienie t\u0119tnicze", ru: "\u0441\u0443\u0436\u0430\u0435\u0442 \u043A\u0440\u043E\u0432\u0435\u043D\u043E\u0441\u043D\u044B\u0435 \u0441\u043E\u0441\u0443\u0434\u044B \u0438 \u043F\u043E\u0432\u044B\u0448\u0430\u0435\u0442 \u0430\u0440\u0442\u0435\u0440\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435" },
    aliases: { pl: ["norepinefryna"], ru: ["\u043D\u043E\u0440\u044D\u043F\u0438\u043D\u0435\u0444\u0440\u0438\u043D"] },
    tier: 2
  },
  {
    id: "insulina",
    gland: { pl: "wyspy trzustkowe (kom\xF3rki beta)", ru: "\u043E\u0441\u0442\u0440\u043E\u0432\u043A\u0438 \u043F\u043E\u0434\u0436\u0435\u043B\u0443\u0434\u043E\u0447\u043D\u043E\u0439 \u0436\u0435\u043B\u0435\u0437\u044B (\u0431\u0435\u0442\u0430-\u043A\u043B\u0435\u0442\u043A\u0438)" },
    name: { pl: "insulina", ru: "\u0438\u043D\u0441\u0443\u043B\u0438\u043D" },
    action: { pl: "obni\u017Ca poziom glukozy we krwi, u\u0142atwiaj\u0105c jej wnikanie do kom\xF3rek", ru: "\u0441\u043D\u0438\u0436\u0430\u0435\u0442 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0432 \u043A\u0440\u043E\u0432\u0438, \u043E\u0431\u043B\u0435\u0433\u0447\u0430\u044F \u0435\u0451 \u0432\u0445\u043E\u0434 \u0432 \u043A\u043B\u0435\u0442\u043A\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "glukagon",
    gland: { pl: "wyspy trzustkowe (kom\xF3rki alfa)", ru: "\u043E\u0441\u0442\u0440\u043E\u0432\u043A\u0438 \u043F\u043E\u0434\u0436\u0435\u043B\u0443\u0434\u043E\u0447\u043D\u043E\u0439 \u0436\u0435\u043B\u0435\u0437\u044B (\u0430\u043B\u044C\u0444\u0430-\u043A\u043B\u0435\u0442\u043A\u0438)" },
    name: { pl: "glukagon", ru: "\u0433\u043B\u044E\u043A\u0430\u0433\u043E\u043D" },
    action: { pl: "podwy\u017Csza poziom glukozy we krwi, rozk\u0142adaj\u0105c glikogen w w\u0105trobie", ru: "\u043F\u043E\u0432\u044B\u0448\u0430\u0435\u0442 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0432 \u043A\u0440\u043E\u0432\u0438, \u0440\u0430\u0441\u0449\u0435\u043F\u043B\u044F\u044F \u0433\u043B\u0438\u043A\u043E\u0433\u0435\u043D \u0432 \u043F\u0435\u0447\u0435\u043D\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "testosteron",
    gland: { pl: "j\u0105dra", ru: "\u0441\u0435\u043C\u0435\u043D\u043D\u0438\u043A\u0438" },
    name: { pl: "testosteron", ru: "\u0442\u0435\u0441\u0442\u043E\u0441\u0442\u0435\u0440\u043E\u043D" },
    action: { pl: "warunkuje rozw\xF3j m\u0119skich cech p\u0142ciowych i spermatogenez\u0119", ru: "\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0435\u0442 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435 \u043C\u0443\u0436\u0441\u043A\u0438\u0445 \u043F\u043E\u043B\u043E\u0432\u044B\u0445 \u043F\u0440\u0438\u0437\u043D\u0430\u043A\u043E\u0432 \u0438 \u0441\u043F\u0435\u0440\u043C\u0430\u0442\u043E\u0433\u0435\u043D\u0435\u0437" },
    aliases: { pl: ["androgen"], ru: ["\u0430\u043D\u0434\u0440\u043E\u0433\u0435\u043D"] },
    tier: 1
  },
  {
    id: "estrogeny",
    gland: { pl: "jajniki", ru: "\u044F\u0438\u0447\u043D\u0438\u043A\u0438" },
    // singular on purpose: every `name` is a singular nominative so questions can be phrased once
    name: { pl: "estrogen", ru: "\u044D\u0441\u0442\u0440\u043E\u0433\u0435\u043D" },
    action: { pl: "warunkuje rozw\xF3j \u017Ce\u0144skich cech p\u0142ciowych i odbudow\u0119 b\u0142ony \u015Bluzowej macicy", ru: "\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0435\u0442 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435 \u0436\u0435\u043D\u0441\u043A\u0438\u0445 \u043F\u043E\u043B\u043E\u0432\u044B\u0445 \u043F\u0440\u0438\u0437\u043D\u0430\u043A\u043E\u0432 \u0438 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0441\u043B\u0438\u0437\u0438\u0441\u0442\u043E\u0439 \u043C\u0430\u0442\u043A\u0438" },
    aliases: { pl: ["estrogeny", "estradiol"], ru: ["\u044D\u0441\u0442\u0440\u043E\u0433\u0435\u043D\u044B", "\u044D\u0441\u0442\u0440\u0430\u0434\u0438\u043E\u043B"] },
    tier: 2
  },
  {
    id: "progesteron",
    gland: { pl: "cia\u0142ko \u017C\xF3\u0142te jajnika", ru: "\u0436\u0451\u043B\u0442\u043E\u0435 \u0442\u0435\u043B\u043E \u044F\u0438\u0447\u043D\u0438\u043A\u0430" },
    name: { pl: "progesteron", ru: "\u043F\u0440\u043E\u0433\u0435\u0441\u0442\u0435\u0440\u043E\u043D" },
    action: { pl: "przygotowuje b\u0142on\u0119 \u015Bluzow\u0105 macicy do zagnie\u017Cd\u017Cenia zarodka i podtrzymuje ci\u0105\u017C\u0119", ru: "\u0433\u043E\u0442\u043E\u0432\u0438\u0442 \u0441\u043B\u0438\u0437\u0438\u0441\u0442\u0443\u044E \u043C\u0430\u0442\u043A\u0438 \u043A \u0438\u043C\u043F\u043B\u0430\u043D\u0442\u0430\u0446\u0438\u0438 \u0437\u0430\u0440\u043E\u0434\u044B\u0448\u0430 \u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u0431\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0441\u0442\u044C" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "melatonina",
    gland: { pl: "szyszynka", ru: "\u044D\u043F\u0438\u0444\u0438\u0437" },
    name: { pl: "melatonina", ru: "\u043C\u0435\u043B\u0430\u0442\u043E\u043D\u0438\u043D" },
    action: { pl: "reguluje rytm dobowy i u\u0142atwia zasypianie", ru: "\u0440\u0435\u0433\u0443\u043B\u0438\u0440\u0443\u0435\u0442 \u0441\u0443\u0442\u043E\u0447\u043D\u044B\u0439 \u0440\u0438\u0442\u043C \u0438 \u043E\u0431\u043B\u0435\u0433\u0447\u0430\u0435\u0442 \u0437\u0430\u0441\u044B\u043F\u0430\u043D\u0438\u0435" },
    aliases: { pl: [], ru: ["\u043C\u0435\u043B\u0430\u0442\u043E\u043D\u0438\u043D\u0430"] },
    tier: 2
  },
  {
    id: "tymozyna",
    gland: { pl: "grasica", ru: "\u0442\u0438\u043C\u0443\u0441" },
    name: { pl: "tymozyna", ru: "\u0442\u0438\u043C\u043E\u0437\u0438\u043D" },
    action: { pl: "steruje dojrzewaniem limfocyt\xF3w T", ru: "\u0443\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0441\u043E\u0437\u0440\u0435\u0432\u0430\u043D\u0438\u0435\u043C \u0422-\u043B\u0438\u043C\u0444\u043E\u0446\u0438\u0442\u043E\u0432" },
    aliases: { pl: ["tymopoetyna"], ru: ["\u0442\u0438\u043C\u043E\u043F\u043E\u044D\u0442\u0438\u043D"] },
    tier: 3
  },
  {
    id: "erytropoetyna",
    gland: { pl: "nerki", ru: "\u043F\u043E\u0447\u043A\u0438" },
    name: { pl: "erytropoetyna", ru: "\u044D\u0440\u0438\u0442\u0440\u043E\u043F\u043E\u044D\u0442\u0438\u043D" },
    action: { pl: "pobudza szpik kostny do wytwarzania erytrocyt\xF3w", ru: "\u0441\u0442\u0438\u043C\u0443\u043B\u0438\u0440\u0443\u0435\u0442 \u043A\u043E\u0441\u0442\u043D\u044B\u0439 \u043C\u043E\u0437\u0433 \u043A \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044E \u044D\u0440\u0438\u0442\u0440\u043E\u0446\u0438\u0442\u043E\u0432" },
    aliases: { pl: ["EPO"], ru: ["\u042D\u041F\u041E", "EPO"] },
    tier: 3
  },
  {
    id: "gastryna",
    gland: { pl: "b\u0142ona \u015Bluzowa \u017Co\u0142\u0105dka", ru: "\u0441\u043B\u0438\u0437\u0438\u0441\u0442\u0430\u044F \u043E\u0431\u043E\u043B\u043E\u0447\u043A\u0430 \u0436\u0435\u043B\u0443\u0434\u043A\u0430" },
    name: { pl: "gastryna", ru: "\u0433\u0430\u0441\u0442\u0440\u0438\u043D" },
    action: { pl: "pobudza wydzielanie kwasu solnego w \u017Co\u0142\u0105dku", ru: "\u0441\u0442\u0438\u043C\u0443\u043B\u0438\u0440\u0443\u0435\u0442 \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0441\u043E\u043B\u044F\u043D\u043E\u0439 \u043A\u0438\u0441\u043B\u043E\u0442\u044B \u0432 \u0436\u0435\u043B\u0443\u0434\u043A\u0435" },
    aliases: { pl: [], ru: ["\u0433\u0430\u0441\u0442\u0440\u0438\u043D\u0430"] },
    tier: 3
  }
];
var DISORDERS = [
  {
    id: "gigantyzm",
    hormone: { pl: "somatotropiny", ru: "\u0441\u043E\u043C\u0430\u0442\u043E\u0442\u0440\u043E\u043F\u0438\u043D\u0430" },
    kind: "nadczynno\u015B\u0107",
    disease: { pl: "gigantyzm", ru: "\u0433\u0438\u0433\u0430\u043D\u0442\u0438\u0437\u043C" },
    symptom: { pl: "nadmierny wzrost ko\u015Bci d\u0142ugich przed zako\u0144czeniem dojrzewania", ru: "\u0447\u0440\u0435\u0437\u043C\u0435\u0440\u043D\u044B\u0439 \u0440\u043E\u0441\u0442 \u0434\u043B\u0438\u043D\u043D\u044B\u0445 \u043A\u043E\u0441\u0442\u0435\u0439 \u0434\u043E \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F \u043F\u043E\u043B\u043E\u0432\u043E\u0433\u043E \u0441\u043E\u0437\u0440\u0435\u0432\u0430\u043D\u0438\u044F" },
    tier: 1
  },
  {
    id: "karlowatosc",
    hormone: { pl: "somatotropiny", ru: "\u0441\u043E\u043C\u0430\u0442\u043E\u0442\u0440\u043E\u043F\u0438\u043D\u0430" },
    kind: "niedoczynno\u015B\u0107",
    disease: { pl: "kar\u0142owato\u015B\u0107 przysadkowa", ru: "\u0433\u0438\u043F\u043E\u0444\u0438\u0437\u0430\u0440\u043D\u0430\u044F \u043A\u0430\u0440\u043B\u0438\u043A\u043E\u0432\u043E\u0441\u0442\u044C" },
    symptom: { pl: "znacznie ni\u017Cszy wzrost przy zachowanych proporcjach cia\u0142a", ru: "\u0437\u043D\u0430\u0447\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0431\u043E\u043B\u0435\u0435 \u043D\u0438\u0437\u043A\u0438\u0439 \u0440\u043E\u0441\u0442 \u043F\u0440\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0445 \u043F\u0440\u043E\u043F\u043E\u0440\u0446\u0438\u044F\u0445 \u0442\u0435\u043B\u0430" },
    tier: 1
  },
  {
    id: "akromegalia",
    hormone: { pl: "somatotropiny", ru: "\u0441\u043E\u043C\u0430\u0442\u043E\u0442\u0440\u043E\u043F\u0438\u043D\u0430" },
    kind: "nadczynno\u015B\u0107",
    disease: { pl: "akromegalia", ru: "\u0430\u043A\u0440\u043E\u043C\u0435\u0433\u0430\u043B\u0438\u044F" },
    symptom: { pl: "powi\u0119kszenie d\u0142oni, st\xF3p i rys\xF3w twarzy u osoby doros\u0142ej", ru: "\u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u0438\u0435 \u043A\u0438\u0441\u0442\u0435\u0439, \u0441\u0442\u043E\u043F \u0438 \u0447\u0435\u0440\u0442 \u043B\u0438\u0446\u0430 \u0443 \u0432\u0437\u0440\u043E\u0441\u043B\u043E\u0433\u043E" },
    tier: 2
  },
  {
    id: "choroba-gravesa",
    hormone: { pl: "tyroksyny", ru: "\u0442\u0438\u0440\u043E\u043A\u0441\u0438\u043D\u0430" },
    kind: "nadczynno\u015B\u0107",
    disease: { pl: "choroba Gravesa-Basedowa", ru: "\u0431\u043E\u043B\u0435\u0437\u043D\u044C \u0413\u0440\u0435\u0439\u0432\u0441\u0430 \u2014 \u0411\u0430\u0437\u0435\u0434\u043E\u0432\u0430" },
    symptom: { pl: "przyspieszony metabolizm, chudni\u0119cie i wytrzeszcz oczu", ru: "\u0443\u0441\u043A\u043E\u0440\u0435\u043D\u043D\u044B\u0439 \u043E\u0431\u043C\u0435\u043D \u0432\u0435\u0449\u0435\u0441\u0442\u0432, \u043F\u043E\u0445\u0443\u0434\u0435\u043D\u0438\u0435 \u0438 \u043F\u0443\u0447\u0435\u0433\u043B\u0430\u0437\u0438\u0435" },
    tier: 2
  },
  {
    id: "obrzek-sluzowaty",
    hormone: { pl: "tyroksyny", ru: "\u0442\u0438\u0440\u043E\u043A\u0441\u0438\u043D\u0430" },
    kind: "niedoczynno\u015B\u0107",
    disease: { pl: "obrz\u0119k \u015Bluzowaty", ru: "\u043C\u0438\u043A\u0441\u0435\u0434\u0435\u043C\u0430" },
    symptom: { pl: "spowolnienie metabolizmu, senno\u015B\u0107 i obrz\u0119ki podsk\xF3rne", ru: "\u0437\u0430\u043C\u0435\u0434\u043B\u0435\u043D\u0438\u0435 \u043E\u0431\u043C\u0435\u043D\u0430 \u0432\u0435\u0449\u0435\u0441\u0442\u0432, \u0441\u043E\u043D\u043B\u0438\u0432\u043E\u0441\u0442\u044C \u0438 \u043F\u043E\u0434\u043A\u043E\u0436\u043D\u044B\u0435 \u043E\u0442\u0451\u043A\u0438" },
    tier: 2
  },
  {
    id: "tezyczka",
    hormone: { pl: "parathormonu", ru: "\u043F\u0430\u0440\u0430\u0442\u0433\u043E\u0440\u043C\u043E\u043D\u0430" },
    kind: "niedoczynno\u015B\u0107",
    disease: { pl: "t\u0119\u017Cyczka", ru: "\u0442\u0435\u0442\u0430\u043D\u0438\u044F" },
    symptom: { pl: "bolesne skurcze mi\u0119\u015Bni przy zbyt niskim poziomie wapnia", ru: "\u0431\u043E\u043B\u0435\u0437\u043D\u0435\u043D\u043D\u044B\u0435 \u043C\u044B\u0448\u0435\u0447\u043D\u044B\u0435 \u0441\u0443\u0434\u043E\u0440\u043E\u0433\u0438 \u043F\u0440\u0438 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u043D\u0438\u0437\u043A\u043E\u043C \u0443\u0440\u043E\u0432\u043D\u0435 \u043A\u0430\u043B\u044C\u0446\u0438\u044F" },
    tier: 3
  },
  {
    id: "cushing",
    hormone: { pl: "kortyzolu", ru: "\u043A\u043E\u0440\u0442\u0438\u0437\u043E\u043B\u0430" },
    kind: "nadczynno\u015B\u0107",
    disease: { pl: "zesp\xF3\u0142 Cushinga", ru: "\u0441\u0438\u043D\u0434\u0440\u043E\u043C \u041A\u0443\u0448\u0438\u043D\u0433\u0430" },
    symptom: { pl: "oty\u0142o\u015B\u0107 tu\u0142owiowa, nadci\u015Bnienie i os\u0142abienie mi\u0119\u015Bni", ru: "\u043E\u0436\u0438\u0440\u0435\u043D\u0438\u0435 \u0442\u0443\u043B\u043E\u0432\u0438\u0449\u0430, \u0433\u0438\u043F\u0435\u0440\u0442\u043E\u043D\u0438\u044F \u0438 \u043C\u044B\u0448\u0435\u0447\u043D\u0430\u044F \u0441\u043B\u0430\u0431\u043E\u0441\u0442\u044C" },
    tier: 2
  },
  {
    id: "addison",
    hormone: { pl: "kortyzolu", ru: "\u043A\u043E\u0440\u0442\u0438\u0437\u043E\u043B\u0430" },
    kind: "niedoczynno\u015B\u0107",
    disease: { pl: "choroba Addisona", ru: "\u0431\u043E\u043B\u0435\u0437\u043D\u044C \u0410\u0434\u0434\u0438\u0441\u043E\u043D\u0430" },
    symptom: { pl: "os\u0142abienie, spadek ci\u015Bnienia i br\u0105zowe przebarwienia sk\xF3ry", ru: "\u0441\u043B\u0430\u0431\u043E\u0441\u0442\u044C, \u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0438 \u0431\u0440\u043E\u043D\u0437\u043E\u0432\u0430\u044F \u043F\u0438\u0433\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u043A\u043E\u0436\u0438" },
    tier: 3
  },
  {
    id: "cukrzyca",
    hormone: { pl: "insuliny", ru: "\u0438\u043D\u0441\u0443\u043B\u0438\u043D\u0430" },
    kind: "niedoczynno\u015B\u0107",
    disease: { pl: "cukrzyca", ru: "\u0441\u0430\u0445\u0430\u0440\u043D\u044B\u0439 \u0434\u0438\u0430\u0431\u0435\u0442" },
    symptom: { pl: "podwy\u017Cszony poziom glukozy we krwi i cukier w moczu", ru: "\u043F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0432 \u043A\u0440\u043E\u0432\u0438 \u0438 \u0441\u0430\u0445\u0430\u0440 \u0432 \u043C\u043E\u0447\u0435" },
    tier: 1
  },
  {
    id: "moczowka",
    hormone: { pl: "wazopresyny", ru: "\u0432\u0430\u0437\u043E\u043F\u0440\u0435\u0441\u0441\u0438\u043D\u0430" },
    kind: "niedoczynno\u015B\u0107",
    disease: { pl: "mocz\xF3wka prosta", ru: "\u043D\u0435\u0441\u0430\u0445\u0430\u0440\u043D\u044B\u0439 \u0434\u0438\u0430\u0431\u0435\u0442" },
    symptom: { pl: "wydalanie ogromnych ilo\u015Bci rozcie\u0144czonego moczu i silne pragnienie", ru: "\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043E\u0433\u0440\u043E\u043C\u043D\u043E\u0433\u043E \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u0440\u0430\u0437\u0432\u0435\u0434\u0451\u043D\u043D\u043E\u0439 \u043C\u043E\u0447\u0438 \u0438 \u0441\u0438\u043B\u044C\u043D\u0430\u044F \u0436\u0430\u0436\u0434\u0430" },
    tier: 2
  }
];
var LOOPS = [
  {
    id: "glukoza-wzrost",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "poziom glukozy we krwi ro\u015Bnie po posi\u0142ku", ru: "\u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0432 \u043A\u0440\u043E\u0432\u0438 \u0440\u0430\u0441\u0442\u0451\u0442 \u043F\u043E\u0441\u043B\u0435 \u0435\u0434\u044B" },
    hormone: { pl: "insulina", ru: "\u0438\u043D\u0441\u0443\u043B\u0438\u043D" },
    response: { pl: "glukoza wnika do kom\xF3rek i jest magazynowana jako glikogen", ru: "\u0433\u043B\u044E\u043A\u043E\u0437\u0430 \u043F\u043E\u0441\u0442\u0443\u043F\u0430\u0435\u0442 \u0432 \u043A\u043B\u0435\u0442\u043A\u0438 \u0438 \u0437\u0430\u043F\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u0432 \u0432\u0438\u0434\u0435 \u0433\u043B\u0438\u043A\u043E\u0433\u0435\u043D\u0430" },
    tier: 1
  },
  {
    id: "glukoza-spadek",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "poziom glukozy we krwi spada mi\u0119dzy posi\u0142kami", ru: "\u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0432 \u043A\u0440\u043E\u0432\u0438 \u043F\u0430\u0434\u0430\u0435\u0442 \u043C\u0435\u0436\u0434\u0443 \u043F\u0440\u0438\u0451\u043C\u0430\u043C\u0438 \u043F\u0438\u0449\u0438" },
    hormone: { pl: "glukagon", ru: "\u0433\u043B\u044E\u043A\u0430\u0433\u043E\u043D" },
    response: { pl: "glikogen w\u0105troby jest rozk\u0142adany do glukozy", ru: "\u0433\u043B\u0438\u043A\u043E\u0433\u0435\u043D \u043F\u0435\u0447\u0435\u043D\u0438 \u0440\u0430\u0441\u0449\u0435\u043F\u043B\u044F\u0435\u0442\u0441\u044F \u0434\u043E \u0433\u043B\u044E\u043A\u043E\u0437\u044B" },
    tier: 1
  },
  {
    id: "wapn-spadek",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "poziom wapnia we krwi spada", ru: "\u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043A\u0430\u043B\u044C\u0446\u0438\u044F \u0432 \u043A\u0440\u043E\u0432\u0438 \u043F\u0430\u0434\u0430\u0435\u0442" },
    hormone: { pl: "parathormon", ru: "\u043F\u0430\u0440\u0430\u0442\u0433\u043E\u0440\u043C\u043E\u043D" },
    response: { pl: "wap\u0144 jest uwalniany z ko\u015Bci i silniej wch\u0142aniany w jelicie", ru: "\u043A\u0430\u043B\u044C\u0446\u0438\u0439 \u0432\u044B\u0441\u0432\u043E\u0431\u043E\u0436\u0434\u0430\u0435\u0442\u0441\u044F \u0438\u0437 \u043A\u043E\u0441\u0442\u0435\u0439 \u0438 \u0441\u0438\u043B\u044C\u043D\u0435\u0435 \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0432 \u043A\u0438\u0448\u0435\u0447\u043D\u0438\u043A\u0435" },
    tier: 2
  },
  {
    id: "wapn-wzrost",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "poziom wapnia we krwi ro\u015Bnie", ru: "\u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043A\u0430\u043B\u044C\u0446\u0438\u044F \u0432 \u043A\u0440\u043E\u0432\u0438 \u0440\u0430\u0441\u0442\u0451\u0442" },
    hormone: { pl: "kalcytonina", ru: "\u043A\u0430\u043B\u044C\u0446\u0438\u0442\u043E\u043D\u0438\u043D" },
    response: { pl: "wap\u0144 jest odk\u0142adany w ko\u015Bciach, a jego st\u0119\u017Cenie we krwi spada", ru: "\u043A\u0430\u043B\u044C\u0446\u0438\u0439 \u043E\u0442\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0432 \u043A\u043E\u0441\u0442\u044F\u0445, \u0438 \u0435\u0433\u043E \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F \u0432 \u043A\u0440\u043E\u0432\u0438 \u043F\u0430\u0434\u0430\u0435\u0442" },
    tier: 2
  },
  {
    id: "woda-spadek",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "organizm traci wod\u0119 i osmolarno\u015B\u0107 krwi ro\u015Bnie", ru: "\u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C \u0442\u0435\u0440\u044F\u0435\u0442 \u0432\u043E\u0434\u0443 \u0438 \u043E\u0441\u043C\u043E\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u044C \u043A\u0440\u043E\u0432\u0438 \u0440\u0430\u0441\u0442\u0451\u0442" },
    hormone: { pl: "wazopresyna", ru: "\u0432\u0430\u0437\u043E\u043F\u0440\u0435\u0441\u0441\u0438\u043D" },
    response: { pl: "nerki zag\u0119szczaj\u0105 mocz, oddaj\u0105c mniej wody", ru: "\u043F\u043E\u0447\u043A\u0438 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0438\u0440\u0443\u044E\u0442 \u043C\u043E\u0447\u0443, \u043E\u0442\u0434\u0430\u0432\u0430\u044F \u043C\u0435\u043D\u044C\u0448\u0435 \u0432\u043E\u0434\u044B" },
    tier: 2
  },
  {
    id: "sod-spadek",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "poziom sodu we krwi spada, a wraz z nim ci\u015Bnienie", ru: "\u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043D\u0430\u0442\u0440\u0438\u044F \u0432 \u043A\u0440\u043E\u0432\u0438 \u043F\u0430\u0434\u0430\u0435\u0442, \u0430 \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u043D\u0438\u043C \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435" },
    hormone: { pl: "aldosteron", ru: "\u0430\u043B\u044C\u0434\u043E\u0441\u0442\u0435\u0440\u043E\u043D" },
    response: { pl: "nerki zatrzymuj\u0105 s\xF3d, a za nim wod\u0119", ru: "\u043F\u043E\u0447\u043A\u0438 \u0437\u0430\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0442 \u043D\u0430\u0442\u0440\u0438\u0439, \u0430 \u0432\u0441\u043B\u0435\u0434 \u0437\u0430 \u043D\u0438\u043C \u0432\u043E\u0434\u0443" },
    tier: 3
  },
  {
    id: "stres",
    paragraph: P.hormones.disorders,
    stimulus: { pl: "organizm reaguje na nag\u0142e zagro\u017Cenie", ru: "\u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C \u0440\u0435\u0430\u0433\u0438\u0440\u0443\u0435\u0442 \u043D\u0430 \u0432\u043D\u0435\u0437\u0430\u043F\u043D\u0443\u044E \u0443\u0433\u0440\u043E\u0437\u0443" },
    hormone: { pl: "adrenalina", ru: "\u0430\u0434\u0440\u0435\u043D\u0430\u043B\u0438\u043D" },
    response: { pl: "serce bije szybciej, a do krwi trafia dodatkowa glukoza", ru: "\u0441\u0435\u0440\u0434\u0446\u0435 \u0431\u044C\u0451\u0442\u0441\u044F \u0447\u0430\u0449\u0435, \u0430 \u0432 \u043A\u0440\u043E\u0432\u044C \u043F\u043E\u0441\u0442\u0443\u043F\u0430\u0435\u0442 \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0433\u043B\u044E\u043A\u043E\u0437\u0430" },
    tier: 1
  },
  {
    id: "zimno",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "temperatura otoczenia spada i organizm si\u0119 wych\u0142adza", ru: "\u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0441\u0440\u0435\u0434\u044B \u043F\u0430\u0434\u0430\u0435\u0442 \u0438 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C \u043E\u0445\u043B\u0430\u0436\u0434\u0430\u0435\u0442\u0441\u044F" },
    hormone: { pl: "tyroksyna", ru: "\u0442\u0438\u0440\u043E\u043A\u0441\u0438\u043D" },
    response: { pl: "tempo przemiany materii ro\u015Bnie i wytwarza si\u0119 wi\u0119cej ciep\u0142a", ru: "\u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043E\u0431\u043C\u0435\u043D\u0430 \u0432\u0435\u0449\u0435\u0441\u0442\u0432 \u0440\u0430\u0441\u0442\u0451\u0442 \u0438 \u0432\u044B\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0431\u043E\u043B\u044C\u0448\u0435 \u0442\u0435\u043F\u043B\u0430" },
    tier: 2
  }
];

// packages/trainers/bio/src/server/templates/topics/lo3Hormones.ts
var TOPIC2 = "bio.lo3.hormones";
var SUBTOPIC2 = { pl: "gruczo\u0142y dokrewne i hormony", ru: "\u0436\u0435\u043B\u0435\u0437\u044B \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0439 \u0441\u0435\u043A\u0440\u0435\u0446\u0438\u0438 \u0438 \u0433\u043E\u0440\u043C\u043E\u043D\u044B" };
var REGULATION = { pl: "regulacja hormonalna i sprz\u0119\u017Cenie zwrotne", ru: "\u0433\u043E\u0440\u043C\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F \u0438 \u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C" };
var DISEASES = { pl: "nadczynno\u015B\u0107 i niedoczynno\u015B\u0107 gruczo\u0142\xF3w", ru: "\u0433\u0438\u043F\u0435\u0440- \u0438 \u0433\u0438\u043F\u043E\u0444\u0443\u043D\u043A\u0446\u0438\u044F \u0436\u0435\u043B\u0451\u0437" };
var tier = (row) => row.tier;
var glandToHormone = choiceFromTable({
  id: `${TOPIC2}.gland-to-hormone`,
  topicId: TOPIC2,
  rows: HORMONES,
  paragraph: P.hormones.structure,
  subtopic: SUBTOPIC2,
  tags: ["regulacja-hormonalna"],
  difficulty: tier,
  shift: 0,
  question: (h, lang) => lang === "pl" ? `Miejsce wydzielania: ${h.gland.pl}. O kt\xF3ry hormon chodzi?` : `\u041C\u0435\u0441\u0442\u043E \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u044F: ${h.gland.ru}. \u041E \u043A\u0430\u043A\u043E\u043C \u0433\u043E\u0440\u043C\u043E\u043D\u0435 \u0438\u0434\u0451\u0442 \u0440\u0435\u0447\u044C?`,
  optionText: (h, lang) => h.name[lang],
  misconception: {
    pl: "hormon innego gruczo\u0142u \u2014 albo drugiego p\u0142ata przysadki",
    ru: "\u0433\u043E\u0440\u043C\u043E\u043D \u0434\u0440\u0443\u0433\u043E\u0439 \u0436\u0435\u043B\u0435\u0437\u044B \u2014 \u0438\u043B\u0438 \u0434\u0440\u0443\u0433\u043E\u0439 \u0434\u043E\u043B\u0438 \u0433\u0438\u043F\u043E\u0444\u0438\u0437\u0430"
  },
  hint: (h, lang) => lang === "pl" ? `Jego dzia\u0142anie: ${h.action.pl}.` : `\u0415\u0433\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435: ${h.action.ru}.`,
  solution: (h, lang) => lang === "pl" ? `${cap(h.name.pl)}. Gruczo\u0142: ${h.gland.pl}. Dzia\u0142anie: ${h.action.pl}.` : `${cap(h.name.ru)}. \u0416\u0435\u043B\u0435\u0437\u0430: ${h.gland.ru}. \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435: ${h.action.ru}.`
});
var hormoneToAction = choiceFromTable({
  id: `${TOPIC2}.hormone-to-action`,
  topicId: TOPIC2,
  rows: HORMONES,
  paragraph: P.hormones.structure,
  subtopic: SUBTOPIC2,
  tags: ["regulacja-hormonalna"],
  difficulty: tier,
  shift: 1,
  question: (h, lang) => lang === "pl" ? `Hormon: ${h.name.pl}. Jakie jest jego g\u0142\xF3wne dzia\u0142anie?` : `\u0413\u043E\u0440\u043C\u043E\u043D: ${h.name.ru}. \u041A\u0430\u043A\u043E\u0432\u043E \u0435\u0433\u043E \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435?`,
  optionText: (h, lang) => h.action[lang],
  misconception: { pl: "dzia\u0142anie innego hormonu", ru: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0433\u043E\u0440\u043C\u043E\u043D\u0430" },
  solution: (h, lang) => lang === "pl" ? `${cap(h.name.pl)} (${h.gland.pl}) \u2014 ${h.action.pl}.` : `${cap(h.name.ru)} (${h.gland.ru}) \u2014 ${h.action.ru}.`
});
var hormoneToGland = choiceFromTable({
  id: `${TOPIC2}.hormone-to-gland`,
  topicId: TOPIC2,
  rows: HORMONES,
  paragraph: P.hormones.structure,
  subtopic: SUBTOPIC2,
  tags: ["regulacja-hormonalna"],
  difficulty: tier,
  shift: 2,
  question: (h, lang) => lang === "pl" ? `Hormon: ${h.name.pl}. W kt\xF3rym gruczole powstaje?` : `\u0413\u043E\u0440\u043C\u043E\u043D: ${h.name.ru}. \u0412 \u043A\u0430\u043A\u043E\u0439 \u0436\u0435\u043B\u0435\u0437\u0435 \u043E\u0431\u0440\u0430\u0437\u0443\u0435\u0442\u0441\u044F?`,
  optionText: (h, lang) => h.gland[lang],
  misconception: { pl: "gruczo\u0142 wydzielaj\u0105cy inny hormon", ru: "\u0436\u0435\u043B\u0435\u0437\u0430, \u0432\u044B\u0434\u0435\u043B\u044F\u044E\u0449\u0430\u044F \u0434\u0440\u0443\u0433\u043E\u0439 \u0433\u043E\u0440\u043C\u043E\u043D" },
  solution: (h, lang) => lang === "pl" ? `${cap(h.name.pl)} \u2014 miejsce powstawania: ${h.gland.pl}.` : `${cap(h.name.ru)} \u2014 \u043C\u0435\u0441\u0442\u043E \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F: ${h.gland.ru}.`
});
var actionToHormone = termFromTable({
  id: `${TOPIC2}.action-to-hormone`,
  topicId: TOPIC2,
  rows: HORMONES,
  paragraph: P.hormones.structure,
  subtopic: SUBTOPIC2,
  tags: ["regulacja-hormonalna"],
  difficulty: tier,
  question: (h, lang) => lang === "pl" ? `Podaj nazw\u0119 hormonu (w mianowniku), kt\xF3ry ${h.action.pl}.` : `\u041D\u0430\u0437\u043E\u0432\u0438 \u0433\u043E\u0440\u043C\u043E\u043D (\u0432 \u0438\u043C\u0435\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C \u043F\u0430\u0434\u0435\u0436\u0435), \u043A\u043E\u0442\u043E\u0440\u044B\u0439 ${h.action.ru}.`,
  term: (h, lang) => h.name[lang],
  // the other language's name counts too: this is one concept, and a student moving between a Polish
  // textbook and a Russian-speaking parent should not be marked wrong for naming it in either
  aliases: (h) => [h.name.pl, h.name.ru, ...h.aliases.pl, ...h.aliases.ru],
  hint: (h, lang) => lang === "pl" ? `Gruczo\u0142: ${h.gland.pl}.` : `\u0416\u0435\u043B\u0435\u0437\u0430: ${h.gland.ru}.`,
  solution: (h, lang) => lang === "pl" ? `Odpowied\u017A: ${h.name.pl}. Gruczo\u0142: ${h.gland.pl}.` : `\u041E\u0442\u0432\u0435\u0442: ${h.name.ru}. \u0416\u0435\u043B\u0435\u0437\u0430: ${h.gland.ru}.`
});
var disorderToDisease = choiceFromTable({
  id: `${TOPIC2}.disorder-to-disease`,
  topicId: TOPIC2,
  rows: DISORDERS,
  paragraph: P.hormones.disorders,
  subtopic: DISEASES,
  tags: ["choroby", "regulacja-hormonalna"],
  difficulty: tier,
  shift: 0,
  question: (dz, lang) => lang === "pl" ? `Do czego prowadzi ${dz.kind} wydzielania ${dz.hormone.pl}?` : `\u041A \u0447\u0435\u043C\u0443 \u043F\u0440\u0438\u0432\u043E\u0434\u0438\u0442 ${dz.kind === "nadczynno\u015B\u0107" ? "\u0438\u0437\u0431\u044B\u0442\u043E\u0447\u043D\u0430\u044F" : "\u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u0430\u044F"} \u0441\u0435\u043A\u0440\u0435\u0446\u0438\u044F ${dz.hormone.ru}?`,
  optionText: (dz, lang) => dz.disease[lang],
  misconception: {
    pl: "zaburzenie wywo\u0142ane innym hormonem albo odwrotnym zaburzeniem tego samego",
    ru: "\u043D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u0435 \u0438\u0437-\u0437\u0430 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0433\u043E\u0440\u043C\u043E\u043D\u0430 \u0438\u043B\u0438 \u043E\u0431\u0440\u0430\u0442\u043D\u043E\u0433\u043E \u0441\u0434\u0432\u0438\u0433\u0430 \u0442\u043E\u0433\u043E \u0436\u0435 \u0441\u0430\u043C\u043E\u0433\u043E"
  },
  hint: (dz, lang) => lang === "pl" ? `Objawy: ${dz.symptom.pl}.` : `\u0421\u0438\u043C\u043F\u0442\u043E\u043C\u044B: ${dz.symptom.ru}.`,
  solution: (dz, lang) => lang === "pl" ? `${dz.kind === "nadczynno\u015B\u0107" ? "Nadmiar" : "Niedob\xF3r"} ${dz.hormone.pl} \u2192 ${dz.disease.pl}. Objawy: ${dz.symptom.pl}.` : `${dz.kind === "nadczynno\u015B\u0107" ? "\u0418\u0437\u0431\u044B\u0442\u043E\u043A" : "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u043A"} ${dz.hormone.ru} \u2192 ${dz.disease.ru}. \u0421\u0438\u043C\u043F\u0442\u043E\u043C\u044B: ${dz.symptom.ru}.`
});
var symptomToDisease = choiceFromTable({
  id: `${TOPIC2}.symptom-to-disease`,
  topicId: TOPIC2,
  rows: DISORDERS,
  paragraph: P.hormones.disorders,
  subtopic: DISEASES,
  tags: ["choroby", "regulacja-hormonalna"],
  difficulty: tier,
  shift: 2,
  question: (dz, lang) => lang === "pl" ? `Jaka choroba daje objawy: ${dz.symptom.pl}?` : `\u041A\u0430\u043A\u0430\u044F \u0431\u043E\u043B\u0435\u0437\u043D\u044C \u0434\u0430\u0451\u0442 \u0441\u0438\u043C\u043F\u0442\u043E\u043C\u044B: ${dz.symptom.ru}?`,
  optionText: (dz, lang) => dz.disease[lang],
  misconception: { pl: "choroba o objawach przeciwnych", ru: "\u0431\u043E\u043B\u0435\u0437\u043D\u044C \u0441 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u043F\u043E\u043B\u043E\u0436\u043D\u044B\u043C\u0438 \u0441\u0438\u043C\u043F\u0442\u043E\u043C\u0430\u043C\u0438" },
  solution: (dz, lang) => lang === "pl" ? `Odpowied\u017A: ${dz.disease.pl} \u2014 ${dz.kind} wydzielania ${dz.hormone.pl}.` : `\u041E\u0442\u0432\u0435\u0442: ${dz.disease.ru} \u2014 ${dz.kind === "nadczynno\u015B\u0107" ? "\u0438\u0437\u0431\u044B\u0442\u043E\u0447\u043D\u0430\u044F" : "\u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u0430\u044F"} \u0441\u0435\u043A\u0440\u0435\u0446\u0438\u044F ${dz.hormone.ru}.`
});
var feedbackLoop = choiceFromTable({
  id: `${TOPIC2}.feedback-loop`,
  topicId: TOPIC2,
  rows: LOOPS,
  subtopic: REGULATION,
  tags: ["homeostaza", "regulacja-hormonalna"],
  difficulty: tier,
  shift: 1,
  question: (l, lang) => lang === "pl" ? `Sytuacja: ${l.stimulus.pl}. Kt\xF3ry hormon zostanie wydzielony?` : `\u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044F: ${l.stimulus.ru}. \u041A\u0430\u043A\u043E\u0439 \u0433\u043E\u0440\u043C\u043E\u043D \u0431\u0443\u0434\u0435\u0442 \u0432\u044B\u0434\u0435\u043B\u0435\u043D?`,
  optionText: (l, lang) => l.hormone[lang],
  misconception: {
    pl: "hormon o przeciwnym dzia\u0142aniu albo z innej p\u0119tli regulacyjnej",
    ru: "\u0433\u043E\u0440\u043C\u043E\u043D \u0441 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u043F\u043E\u043B\u043E\u0436\u043D\u044B\u043C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u043C \u0438\u043B\u0438 \u0438\u0437 \u0434\u0440\u0443\u0433\u043E\u0439 \u043F\u0435\u0442\u043B\u0438 \u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u0438"
  },
  solution: (l, lang) => lang === "pl" ? `Odpowied\u017A: ${l.hormone.pl}. Skutek: ${l.response.pl}. To ujemne sprz\u0119\u017Cenie zwrotne \u2014 skutek znosi bodziec, kt\xF3ry go wywo\u0142a\u0142.` : `\u041E\u0442\u0432\u0435\u0442: ${l.hormone.ru}. \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442: ${l.response.ru}. \u042D\u0442\u043E \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C \u2014 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0433\u0430\u0441\u0438\u0442 \u0432\u044B\u0437\u0432\u0430\u0432\u0448\u0438\u0439 \u0435\u0433\u043E \u0441\u0442\u0438\u043C\u0443\u043B.`
});
var loopToEffect = choiceFromTable({
  id: `${TOPIC2}.loop-to-effect`,
  topicId: TOPIC2,
  rows: LOOPS,
  subtopic: REGULATION,
  tags: ["homeostaza", "regulacja-hormonalna"],
  difficulty: tier,
  shift: 3,
  question: (l, lang) => lang === "pl" ? `Hormon: ${l.hormone.pl}. Co dzieje si\u0119 w organizmie, gdy ${l.stimulus.pl}?` : `\u0413\u043E\u0440\u043C\u043E\u043D: ${l.hormone.ru}. \u0427\u0442\u043E \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442 \u0432 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C\u0435, \u043A\u043E\u0433\u0434\u0430 ${l.stimulus.ru}?`,
  optionText: (l, lang) => l.response[lang],
  misconception: { pl: "skutek dzia\u0142ania innego hormonu", ru: "\u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0433\u043E\u0440\u043C\u043E\u043D\u0430" },
  solution: (l, lang) => lang === "pl" ? `${cap(l.hormone.pl)}: ${l.response.pl}.` : `${cap(l.hormone.ru)}: ${l.response.ru}.`
});
var lo3HormonesTemplates = [
  glandToHormone,
  hormoneToAction,
  hormoneToGland,
  actionToHormone,
  disorderToDisease,
  symptomToDisease,
  feedbackLoop,
  loopToEffect
];

// packages/trainers/bio/src/server/templates/data/circulation.ts
var HEART_AND_VESSELS = [
  {
    id: "przedsionek-prawy",
    paragraph: P.circulation.structure,
    name: { pl: "prawy przedsionek", ru: "\u043F\u0440\u0430\u0432\u043E\u0435 \u043F\u0440\u0435\u0434\u0441\u0435\u0440\u0434\u0438\u0435" },
    role: { pl: "przyjmowanie krwi odtlenowanej z \u017Cy\u0142 g\u0142\xF3wnych", ru: "\u043F\u0440\u0438\u0451\u043C \u0432\u0435\u043D\u043E\u0437\u043D\u043E\u0439 \u043A\u0440\u043E\u0432\u0438 \u0438\u0437 \u043F\u043E\u043B\u044B\u0445 \u0432\u0435\u043D" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "komora-prawa",
    paragraph: P.circulation.structure,
    name: { pl: "prawa komora", ru: "\u043F\u0440\u0430\u0432\u044B\u0439 \u0436\u0435\u043B\u0443\u0434\u043E\u0447\u0435\u043A" },
    role: { pl: "t\u0142oczenie krwi do pnia p\u0142ucnego, czyli do krwiobiegu ma\u0142ego", ru: "\u043D\u0430\u0433\u043D\u0435\u0442\u0430\u043D\u0438\u0435 \u043A\u0440\u043E\u0432\u0438 \u0432 \u043B\u0451\u0433\u043E\u0447\u043D\u044B\u0439 \u0441\u0442\u0432\u043E\u043B, \u0442\u043E \u0435\u0441\u0442\u044C \u0432 \u043C\u0430\u043B\u044B\u0439 \u043A\u0440\u0443\u0433" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "przedsionek-lewy",
    paragraph: P.circulation.structure,
    name: { pl: "lewy przedsionek", ru: "\u043B\u0435\u0432\u043E\u0435 \u043F\u0440\u0435\u0434\u0441\u0435\u0440\u0434\u0438\u0435" },
    role: { pl: "przyjmowanie krwi utlenowanej z \u017Cy\u0142 p\u0142ucnych", ru: "\u043F\u0440\u0438\u0451\u043C \u0430\u0440\u0442\u0435\u0440\u0438\u0430\u043B\u044C\u043D\u043E\u0439 \u043A\u0440\u043E\u0432\u0438 \u0438\u0437 \u043B\u0451\u0433\u043E\u0447\u043D\u044B\u0445 \u0432\u0435\u043D" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "komora-lewa",
    paragraph: P.circulation.structure,
    name: { pl: "lewa komora", ru: "\u043B\u0435\u0432\u044B\u0439 \u0436\u0435\u043B\u0443\u0434\u043E\u0447\u0435\u043A" },
    role: { pl: "t\u0142oczenie krwi do aorty pod najwy\u017Cszym ci\u015Bnieniem", ru: "\u043D\u0430\u0433\u043D\u0435\u0442\u0430\u043D\u0438\u0435 \u043A\u0440\u043E\u0432\u0438 \u0432 \u0430\u043E\u0440\u0442\u0443 \u043F\u043E\u0434 \u043D\u0430\u0438\u0431\u043E\u043B\u044C\u0448\u0438\u043C \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "zastawki-przedsionkowo-komorowe",
    paragraph: P.circulation.structure,
    name: { pl: "zastawki przedsionkowo-komorowe", ru: "\u043F\u0440\u0435\u0434\u0441\u0435\u0440\u0434\u043D\u043E-\u0436\u0435\u043B\u0443\u0434\u043E\u0447\u043A\u043E\u0432\u044B\u0435 \u043A\u043B\u0430\u043F\u0430\u043D\u044B" },
    role: { pl: "zapobieganie cofaniu si\u0119 krwi z kom\xF3r do przedsionk\xF3w", ru: "\u043F\u0440\u0435\u0434\u043E\u0442\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u043A\u0440\u043E\u0432\u0438 \u0438\u0437 \u0436\u0435\u043B\u0443\u0434\u043E\u0447\u043A\u043E\u0432 \u0432 \u043F\u0440\u0435\u0434\u0441\u0435\u0440\u0434\u0438\u044F" },
    aliases: { pl: ["zastawka dwudzielna", "zastawka tr\xF3jdzielna"], ru: ["\u043C\u0438\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043B\u0430\u043F\u0430\u043D", "\u0442\u0440\u0451\u0445\u0441\u0442\u0432\u043E\u0440\u0447\u0430\u0442\u044B\u0439 \u043A\u043B\u0430\u043F\u0430\u043D"] },
    tier: 2
  },
  {
    id: "wezel-zatokowo-przedsionkowy",
    paragraph: P.circulation.function,
    name: { pl: "w\u0119ze\u0142 zatokowo-przedsionkowy", ru: "\u0441\u0438\u043D\u0443\u0441\u043D\u043E-\u043F\u0440\u0435\u0434\u0441\u0435\u0440\u0434\u043D\u044B\u0439 \u0443\u0437\u0435\u043B" },
    role: { pl: "narzucanie rytmu skurcz\xF3w jako naturalny rozrusznik serca", ru: "\u0437\u0430\u0434\u0430\u043D\u0438\u0435 \u0440\u0438\u0442\u043C\u0430 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u0439 \u043A\u0430\u043A \u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u0440\u0438\u0442\u043C\u0430" },
    aliases: { pl: ["w\u0119ze\u0142 zatokowy", "rozrusznik serca"], ru: ["\u0441\u0438\u043D\u0443\u0441\u043E\u0432\u044B\u0439 \u0443\u0437\u0435\u043B", "\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u0440\u0438\u0442\u043C\u0430"] },
    tier: 2
  },
  {
    id: "tetnice",
    paragraph: P.circulation.structure,
    name: { pl: "t\u0119tnice", ru: "\u0430\u0440\u0442\u0435\u0440\u0438\u0438" },
    role: { pl: "prowadzenie krwi z serca, z grub\u0105 warstw\u0105 mi\u0119\u015Bniow\u0105 i bez zastawek", ru: "\u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043A\u0440\u043E\u0432\u0438 \u043E\u0442 \u0441\u0435\u0440\u0434\u0446\u0430, \u0441 \u0442\u043E\u043B\u0441\u0442\u044B\u043C \u043C\u044B\u0448\u0435\u0447\u043D\u044B\u043C \u0441\u043B\u043E\u0435\u043C \u0438 \u0431\u0435\u0437 \u043A\u043B\u0430\u043F\u0430\u043D\u043E\u0432" },
    aliases: { pl: ["t\u0119tnica"], ru: ["\u0430\u0440\u0442\u0435\u0440\u0438\u044F"] },
    tier: 1
  },
  {
    id: "zyly",
    paragraph: P.circulation.structure,
    name: { pl: "\u017Cy\u0142y", ru: "\u0432\u0435\u043D\u044B" },
    role: { pl: "prowadzenie krwi do serca, z zastawkami zapobiegaj\u0105cymi cofaniu", ru: "\u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043A\u0440\u043E\u0432\u0438 \u043A \u0441\u0435\u0440\u0434\u0446\u0443, \u0441 \u043A\u043B\u0430\u043F\u0430\u043D\u0430\u043C\u0438 \u043F\u0440\u043E\u0442\u0438\u0432 \u043E\u0431\u0440\u0430\u0442\u043D\u043E\u0433\u043E \u0442\u043E\u043A\u0430" },
    aliases: { pl: ["\u017Cy\u0142a"], ru: ["\u0432\u0435\u043D\u0430"] },
    tier: 1
  },
  {
    id: "naczynia-wlosowate",
    paragraph: P.circulation.structure,
    name: { pl: "naczynia w\u0142osowate", ru: "\u043A\u0430\u043F\u0438\u043B\u043B\u044F\u0440\u044B" },
    role: { pl: "wymiana gaz\xF3w i substancji mi\u0119dzy krwi\u0105 a tkankami przez jedn\u0105 warstw\u0119 kom\xF3rek", ru: "\u043E\u0431\u043C\u0435\u043D \u0433\u0430\u0437\u043E\u0432 \u0438 \u0432\u0435\u0449\u0435\u0441\u0442\u0432 \u043C\u0435\u0436\u0434\u0443 \u043A\u0440\u043E\u0432\u044C\u044E \u0438 \u0442\u043A\u0430\u043D\u044F\u043C\u0438 \u0447\u0435\u0440\u0435\u0437 \u043E\u0434\u0438\u043D \u0441\u043B\u043E\u0439 \u043A\u043B\u0435\u0442\u043E\u043A" },
    aliases: { pl: ["kapilary", "naczynie w\u0142osowate"], ru: ["\u043A\u0430\u043F\u0438\u043B\u043B\u044F\u0440"] },
    tier: 1
  },
  {
    id: "uklad-limfatyczny",
    paragraph: P.circulation.lymph,
    name: { pl: "naczynia limfatyczne", ru: "\u043B\u0438\u043C\u0444\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0441\u043E\u0441\u0443\u0434\u044B" },
    role: { pl: "odprowadzanie nadmiaru p\u0142ynu tkankowego z powrotem do krwiobiegu", ru: "\u043E\u0442\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u0438\u0437\u0431\u044B\u0442\u043A\u0430 \u0442\u043A\u0430\u043D\u0435\u0432\u043E\u0439 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0438 \u043E\u0431\u0440\u0430\u0442\u043D\u043E \u0432 \u043A\u0440\u043E\u0432\u043E\u0442\u043E\u043A" },
    aliases: { pl: ["uk\u0142ad limfatyczny"], ru: ["\u043B\u0438\u043C\u0444\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430"] },
    tier: 2
  }
];
var BLOOD_COMPONENTS = [
  {
    id: "erytrocyty",
    paragraph: P.circulation.blood,
    name: { pl: "erytrocyty", ru: "\u044D\u0440\u0438\u0442\u0440\u043E\u0446\u0438\u0442\u044B" },
    role: { pl: "transport tlenu dzi\u0119ki hemoglobinie, bez j\u0105dra kom\xF3rkowego", ru: "\u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442 \u043A\u0438\u0441\u043B\u043E\u0440\u043E\u0434\u0430 \u0431\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u044F \u0433\u0435\u043C\u043E\u0433\u043B\u043E\u0431\u0438\u043D\u0443, \u0431\u0435\u0437 \u043A\u043B\u0435\u0442\u043E\u0447\u043D\u043E\u0433\u043E \u044F\u0434\u0440\u0430" },
    aliases: { pl: ["krwinki czerwone", "erytrocyt"], ru: ["\u043A\u0440\u0430\u0441\u043D\u044B\u0435 \u043A\u0440\u043E\u0432\u044F\u043D\u044B\u0435 \u043A\u043B\u0435\u0442\u043A\u0438", "\u044D\u0440\u0438\u0442\u0440\u043E\u0446\u0438\u0442"] },
    tier: 1
  },
  {
    id: "leukocyty",
    paragraph: P.circulation.blood,
    name: { pl: "leukocyty", ru: "\u043B\u0435\u0439\u043A\u043E\u0446\u0438\u0442\u044B" },
    role: { pl: "obrona organizmu przed patogenami", ru: "\u0437\u0430\u0449\u0438\u0442\u0430 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C\u0430 \u043E\u0442 \u043F\u0430\u0442\u043E\u0433\u0435\u043D\u043E\u0432" },
    aliases: { pl: ["krwinki bia\u0142e", "leukocyt"], ru: ["\u0431\u0435\u043B\u044B\u0435 \u043A\u0440\u043E\u0432\u044F\u043D\u044B\u0435 \u043A\u043B\u0435\u0442\u043A\u0438", "\u043B\u0435\u0439\u043A\u043E\u0446\u0438\u0442"] },
    tier: 1
  },
  {
    id: "trombocyty",
    paragraph: P.circulation.blood,
    name: { pl: "trombocyty", ru: "\u0442\u0440\u043E\u043C\u0431\u043E\u0446\u0438\u0442\u044B" },
    role: { pl: "udzia\u0142 w krzepni\u0119ciu krwi jako fragmenty kom\xF3rek szpiku", ru: "\u0443\u0447\u0430\u0441\u0442\u0438\u0435 \u0432 \u0441\u0432\u0451\u0440\u0442\u044B\u0432\u0430\u043D\u0438\u0438 \u043A\u0440\u043E\u0432\u0438 \u043A\u0430\u043A \u0444\u0440\u0430\u0433\u043C\u0435\u043D\u0442\u044B \u043A\u043B\u0435\u0442\u043E\u043A \u043A\u043E\u0441\u0442\u043D\u043E\u0433\u043E \u043C\u043E\u0437\u0433\u0430" },
    aliases: { pl: ["p\u0142ytki krwi", "trombocyt"], ru: ["\u043A\u0440\u043E\u0432\u044F\u043D\u044B\u0435 \u043F\u043B\u0430\u0441\u0442\u0438\u043D\u043A\u0438", "\u0442\u0440\u043E\u043C\u0431\u043E\u0446\u0438\u0442"] },
    tier: 1
  },
  {
    id: "osocze",
    paragraph: P.circulation.blood,
    name: { pl: "osocze", ru: "\u043F\u043B\u0430\u0437\u043C\u0430 \u043A\u0440\u043E\u0432\u0438" },
    role: { pl: "p\u0142ynna cz\u0119\u015B\u0107 krwi, w ponad 90% z\u0142o\u017Cona z wody", ru: "\u0436\u0438\u0434\u043A\u0430\u044F \u0447\u0430\u0441\u0442\u044C \u043A\u0440\u043E\u0432\u0438, \u0431\u043E\u043B\u0435\u0435 \u0447\u0435\u043C \u043D\u0430 90% \u0441\u043E\u0441\u0442\u043E\u044F\u0449\u0430\u044F \u0438\u0437 \u0432\u043E\u0434\u044B" },
    aliases: { pl: [], ru: ["\u043F\u043B\u0430\u0437\u043C\u0430"] },
    tier: 1
  },
  {
    id: "fibrynogen",
    paragraph: P.circulation.blood,
    name: { pl: "fibrynogen", ru: "\u0444\u0438\u0431\u0440\u0438\u043D\u043E\u0433\u0435\u043D" },
    role: { pl: "bia\u0142ko osocza przekszta\u0142cane w fibryn\u0119 podczas krzepni\u0119cia", ru: "\u0431\u0435\u043B\u043E\u043A \u043F\u043B\u0430\u0437\u043C\u044B, \u043F\u0440\u0435\u0432\u0440\u0430\u0449\u0430\u044E\u0449\u0438\u0439\u0441\u044F \u0432 \u0444\u0438\u0431\u0440\u0438\u043D \u043F\u0440\u0438 \u0441\u0432\u0451\u0440\u0442\u044B\u0432\u0430\u043D\u0438\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "limfocyty-b",
    paragraph: P.circulation.immune,
    name: { pl: "limfocyty B", ru: "B-\u043B\u0438\u043C\u0444\u043E\u0446\u0438\u0442\u044B" },
    role: { pl: "wytwarzanie przeciwcia\u0142 po przekszta\u0142ceniu w kom\xF3rki plazmatyczne", ru: "\u0432\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0430\u043D\u0442\u0438\u0442\u0435\u043B \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u0435\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u0432 \u043F\u043B\u0430\u0437\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043A\u043B\u0435\u0442\u043A\u0438" },
    aliases: { pl: ["limfocyt B"], ru: ["B-\u043B\u0438\u043C\u0444\u043E\u0446\u0438\u0442"] },
    tier: 2
  },
  {
    id: "limfocyty-t",
    paragraph: P.circulation.immune,
    name: { pl: "limfocyty T", ru: "T-\u043B\u0438\u043C\u0444\u043E\u0446\u0438\u0442\u044B" },
    role: { pl: "niszczenie kom\xF3rek zaka\u017Conych i sterowanie odpowiedzi\u0105 odporno\u015Bciow\u0105", ru: "\u0443\u043D\u0438\u0447\u0442\u043E\u0436\u0435\u043D\u0438\u0435 \u0437\u0430\u0440\u0430\u0436\u0451\u043D\u043D\u044B\u0445 \u043A\u043B\u0435\u0442\u043E\u043A \u0438 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0438\u043C\u043C\u0443\u043D\u043D\u044B\u043C \u043E\u0442\u0432\u0435\u0442\u043E\u043C" },
    aliases: { pl: ["limfocyt T"], ru: ["T-\u043B\u0438\u043C\u0444\u043E\u0446\u0438\u0442"] },
    tier: 2
  },
  {
    id: "makrofagi",
    paragraph: P.circulation.immune,
    name: { pl: "makrofagi", ru: "\u043C\u0430\u043A\u0440\u043E\u0444\u0430\u0433\u0438" },
    role: { pl: "fagocytoza patogen\xF3w i prezentowanie ich antygen\xF3w", ru: "\u0444\u0430\u0433\u043E\u0446\u0438\u0442\u043E\u0437 \u043F\u0430\u0442\u043E\u0433\u0435\u043D\u043E\u0432 \u0438 \u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0438\u0445 \u0430\u043D\u0442\u0438\u0433\u0435\u043D\u043E\u0432" },
    aliases: { pl: ["makrofag"], ru: ["\u043C\u0430\u043A\u0440\u043E\u0444\u0430\u0433"] },
    tier: 2
  }
];
var IMMUNITY = [
  {
    id: "nieswoista",
    name: { pl: "odporno\u015B\u0107 nieswoista", ru: "\u043D\u0435\u0441\u043F\u0435\u0446\u0438\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442" },
    role: { pl: "wrodzone bariery i fagocytoza, dzia\u0142aj\u0105ce tak samo wobec ka\u017Cdego patogenu", ru: "\u0432\u0440\u043E\u0436\u0434\u0451\u043D\u043D\u044B\u0435 \u0431\u0430\u0440\u044C\u0435\u0440\u044B \u0438 \u0444\u0430\u0433\u043E\u0446\u0438\u0442\u043E\u0437, \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u043E \u043F\u0440\u043E\u0442\u0438\u0432 \u043B\u044E\u0431\u043E\u0433\u043E \u043F\u0430\u0442\u043E\u0433\u0435\u043D\u0430" },
    aliases: { pl: ["odporno\u015B\u0107 wrodzona"], ru: ["\u0432\u0440\u043E\u0436\u0434\u0451\u043D\u043D\u044B\u0439 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442"] },
    tier: 1
  },
  {
    id: "swoista",
    name: { pl: "odporno\u015B\u0107 swoista", ru: "\u0441\u043F\u0435\u0446\u0438\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442" },
    role: { pl: "rozpoznawanie konkretnego antygenu i pami\u0119\u0107 immunologiczna", ru: "\u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u043E\u0433\u043E \u0430\u043D\u0442\u0438\u0433\u0435\u043D\u0430 \u0438 \u0438\u043C\u043C\u0443\u043D\u043D\u0430\u044F \u043F\u0430\u043C\u044F\u0442\u044C" },
    aliases: { pl: ["odporno\u015B\u0107 nabyta"], ru: ["\u043F\u0440\u0438\u043E\u0431\u0440\u0435\u0442\u0451\u043D\u043D\u044B\u0439 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442"] },
    tier: 1
  },
  {
    id: "czynna-naturalna",
    name: { pl: "odporno\u015B\u0107 czynna naturalna", ru: "\u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442" },
    role: { pl: "w\u0142asne przeciwcia\u0142a wytworzone po przechorowaniu zaka\u017Cenia", ru: "\u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0430\u043D\u0442\u0438\u0442\u0435\u043B\u0430, \u0432\u044B\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0435\u043D\u0435\u0441\u0451\u043D\u043D\u043E\u0439 \u0438\u043D\u0444\u0435\u043A\u0446\u0438\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "czynna-sztuczna",
    name: { pl: "odporno\u015B\u0107 czynna sztuczna", ru: "\u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442" },
    role: { pl: "w\u0142asne przeciwcia\u0142a wytworzone po podaniu szczepionki", ru: "\u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0430\u043D\u0442\u0438\u0442\u0435\u043B\u0430, \u0432\u044B\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u0441\u043B\u0435 \u0432\u0432\u0435\u0434\u0435\u043D\u0438\u044F \u0432\u0430\u043A\u0446\u0438\u043D\u044B" },
    aliases: { pl: ["szczepienie"], ru: ["\u0432\u0430\u043A\u0446\u0438\u043D\u0430\u0446\u0438\u044F"] },
    tier: 2
  },
  {
    id: "bierna-naturalna",
    name: { pl: "odporno\u015B\u0107 bierna naturalna", ru: "\u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043F\u0430\u0441\u0441\u0438\u0432\u043D\u044B\u0439 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442" },
    role: { pl: "gotowe przeciwcia\u0142a otrzymane od matki przez \u0142o\u017Cysko lub z mlekiem", ru: "\u0433\u043E\u0442\u043E\u0432\u044B\u0435 \u0430\u043D\u0442\u0438\u0442\u0435\u043B\u0430, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043D\u044B\u0435 \u043E\u0442 \u043C\u0430\u0442\u0435\u0440\u0438 \u0447\u0435\u0440\u0435\u0437 \u043F\u043B\u0430\u0446\u0435\u043D\u0442\u0443 \u0438\u043B\u0438 \u0441 \u043C\u043E\u043B\u043E\u043A\u043E\u043C" },
    aliases: { pl: [], ru: [] },
    tier: 3
  },
  {
    id: "bierna-sztuczna",
    name: { pl: "odporno\u015B\u0107 bierna sztuczna", ru: "\u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043F\u0430\u0441\u0441\u0438\u0432\u043D\u044B\u0439 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442" },
    role: { pl: "gotowe przeciwcia\u0142a podane w surowicy, dzia\u0142aj\u0105ce natychmiast i kr\xF3tko", ru: "\u0433\u043E\u0442\u043E\u0432\u044B\u0435 \u0430\u043D\u0442\u0438\u0442\u0435\u043B\u0430, \u0432\u0432\u0435\u0434\u0451\u043D\u043D\u044B\u0435 \u0441 \u0441\u044B\u0432\u043E\u0440\u043E\u0442\u043A\u043E\u0439, \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u0441\u0440\u0430\u0437\u0443 \u0438 \u043D\u0435\u0434\u043E\u043B\u0433\u043E" },
    aliases: { pl: ["surowica"], ru: ["\u0441\u044B\u0432\u043E\u0440\u043E\u0442\u043A\u0430"] },
    tier: 2
  }
];
var BLOOD_GROUPS = [
  {
    id: "0-minus",
    group: { pl: "0 Rh\u2212", ru: "0 Rh\u2212" },
    receivesFrom: { pl: "tylko od grupy 0 Rh\u2212", ru: "\u0442\u043E\u043B\u044C\u043A\u043E \u043E\u0442 \u0433\u0440\u0443\u043F\u043F\u044B 0 Rh\u2212" },
    antigens: { pl: "brak antygen\xF3w A, B i D", ru: "\u043D\u0435\u0442 \u0430\u043D\u0442\u0438\u0433\u0435\u043D\u043E\u0432 A, B \u0438 D" },
    antibodies: { pl: "przeciwcia\u0142a anty-A i anty-B", ru: "\u0430\u043D\u0442\u0438\u0442\u0435\u043B\u0430 \u0430\u043D\u0442\u0438-A \u0438 \u0430\u043D\u0442\u0438-B" },
    tier: 2
  },
  {
    id: "0-plus",
    group: { pl: "0 Rh+", ru: "0 Rh+" },
    receivesFrom: { pl: "od grup 0 Rh\u2212 i 0 Rh+", ru: "\u043E\u0442 \u0433\u0440\u0443\u043F\u043F 0 Rh\u2212 \u0438 0 Rh+" },
    antigens: { pl: "tylko antygen D", ru: "\u0442\u043E\u043B\u044C\u043A\u043E \u0430\u043D\u0442\u0438\u0433\u0435\u043D D" },
    antibodies: { pl: "przeciwcia\u0142a anty-A i anty-B, bez anty-D", ru: "\u0430\u043D\u0442\u0438\u0442\u0435\u043B\u0430 \u0430\u043D\u0442\u0438-A \u0438 \u0430\u043D\u0442\u0438-B, \u0431\u0435\u0437 \u0430\u043D\u0442\u0438-D" },
    tier: 2
  },
  {
    id: "a-minus",
    group: { pl: "A Rh\u2212", ru: "A Rh\u2212" },
    receivesFrom: { pl: "od grup 0 Rh\u2212 i A Rh\u2212", ru: "\u043E\u0442 \u0433\u0440\u0443\u043F\u043F 0 Rh\u2212 \u0438 A Rh\u2212" },
    antigens: { pl: "tylko antygen A", ru: "\u0442\u043E\u043B\u044C\u043A\u043E \u0430\u043D\u0442\u0438\u0433\u0435\u043D A" },
    antibodies: { pl: "przeciwcia\u0142a anty-B", ru: "\u0430\u043D\u0442\u0438\u0442\u0435\u043B\u0430 \u0430\u043D\u0442\u0438-B" },
    tier: 2
  },
  {
    id: "b-minus",
    group: { pl: "B Rh\u2212", ru: "B Rh\u2212" },
    receivesFrom: { pl: "od grup 0 Rh\u2212 i B Rh\u2212", ru: "\u043E\u0442 \u0433\u0440\u0443\u043F\u043F 0 Rh\u2212 \u0438 B Rh\u2212" },
    antigens: { pl: "tylko antygen B", ru: "\u0442\u043E\u043B\u044C\u043A\u043E \u0430\u043D\u0442\u0438\u0433\u0435\u043D B" },
    antibodies: { pl: "przeciwcia\u0142a anty-A", ru: "\u0430\u043D\u0442\u0438\u0442\u0435\u043B\u0430 \u0430\u043D\u0442\u0438-A" },
    tier: 2
  },
  {
    id: "ab-plus",
    group: { pl: "AB Rh+", ru: "AB Rh+" },
    receivesFrom: { pl: "od ka\u017Cdej grupy \u2014 to uniwersalny biorca", ru: "\u043E\u0442 \u043B\u044E\u0431\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B \u2014 \u044D\u0442\u043E \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0446\u0438\u043F\u0438\u0435\u043D\u0442" },
    antigens: { pl: "antygeny A, B i D", ru: "\u0430\u043D\u0442\u0438\u0433\u0435\u043D\u044B A, B \u0438 D" },
    antibodies: { pl: "brak przeciwcia\u0142 anty-A i anty-B", ru: "\u043D\u0435\u0442 \u0430\u043D\u0442\u0438\u0442\u0435\u043B \u0430\u043D\u0442\u0438-A \u0438 \u0430\u043D\u0442\u0438-B" },
    tier: 1
  },
  {
    id: "ab-minus",
    group: { pl: "AB Rh\u2212", ru: "AB Rh\u2212" },
    receivesFrom: { pl: "od wszystkich grup Rh\u2212", ru: "\u043E\u0442 \u0432\u0441\u0435\u0445 \u0433\u0440\u0443\u043F\u043F Rh\u2212" },
    antigens: { pl: "antygeny A i B, bez D", ru: "\u0430\u043D\u0442\u0438\u0433\u0435\u043D\u044B A \u0438 B, \u0431\u0435\u0437 D" },
    antibodies: { pl: "brak przeciwcia\u0142 anty-A i anty-B, bez anty-D", ru: "\u043D\u0435\u0442 \u0430\u043D\u0442\u0438\u0442\u0435\u043B \u0430\u043D\u0442\u0438-A \u0438 \u0430\u043D\u0442\u0438-B, \u0431\u0435\u0437 \u0430\u043D\u0442\u0438-D" },
    tier: 3
  }
];

// packages/trainers/bio/src/server/templates/topics/lo3Circulation.ts
var TOPIC3 = "bio.lo3.circulation";
var HEART = { pl: "budowa i praca serca, naczynia krwiono\u015Bne", ru: "\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u0440\u0430\u0431\u043E\u0442\u0430 \u0441\u0435\u0440\u0434\u0446\u0430, \u043A\u0440\u043E\u0432\u0435\u043D\u043E\u0441\u043D\u044B\u0435 \u0441\u043E\u0441\u0443\u0434\u044B" };
var BLOOD = { pl: "sk\u0142ad i funkcje krwi", ru: "\u0441\u043E\u0441\u0442\u0430\u0432 \u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u043A\u0440\u043E\u0432\u0438" };
var GROUPS = { pl: "grupy krwi i transfuzje", ru: "\u0433\u0440\u0443\u043F\u043F\u044B \u043A\u0440\u043E\u0432\u0438 \u0438 \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0430\u043D\u0438\u0435" };
var DEFENCE = { pl: "odporno\u015B\u0107 nieswoista i swoista", ru: "\u043D\u0435\u0441\u043F\u0435\u0446\u0438\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0438 \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442" };
var tier2 = (row) => row.tier;
var heartTemplates = pairFromTable({
  topicId: TOPIC3,
  slug: "heart",
  rows: HEART_AND_VESSELS,
  subtopic: HEART,
  shift: 0,
  label: { pl: "Element", ru: "\u042D\u043B\u0435\u043C\u0435\u043D\u0442" },
  misconception: {
    pl: "rola s\u0105siedniej jamy serca albo innego rodzaju naczynia",
    ru: "\u0440\u043E\u043B\u044C \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0439 \u043A\u0430\u043C\u0435\u0440\u044B \u0441\u0435\u0440\u0434\u0446\u0430 \u0438\u043B\u0438 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0442\u0438\u043F\u0430 \u0441\u043E\u0441\u0443\u0434\u0430"
  }
});
var bloodTemplates = pairFromTable({
  topicId: TOPIC3,
  slug: "blood",
  rows: BLOOD_COMPONENTS,
  subtopic: BLOOD,
  shift: 1,
  label: { pl: "Sk\u0142adnik krwi", ru: "\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u043A\u0440\u043E\u0432\u0438" },
  misconception: { pl: "rola innego sk\u0142adnika krwi", ru: "\u0440\u043E\u043B\u044C \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u043A\u0440\u043E\u0432\u0438" }
});
var immunityTemplates = pairFromTable({
  topicId: TOPIC3,
  slug: "immunity",
  rows: IMMUNITY,
  paragraph: P.circulation.immunity,
  subtopic: DEFENCE,
  shift: 2,
  label: { pl: "Rodzaj odporno\u015Bci", ru: "\u0412\u0438\u0434 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442\u0430" },
  misconception: {
    pl: "inny rodzaj odporno\u015Bci \u2014 czynna zamiast biernej albo naturalna zamiast sztucznej",
    ru: "\u0434\u0440\u0443\u0433\u043E\u0439 \u0432\u0438\u0434 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442\u0430 \u2014 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0432\u043C\u0435\u0441\u0442\u043E \u043F\u0430\u0441\u0441\u0438\u0432\u043D\u043E\u0433\u043E \u0438\u043B\u0438 \u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0432\u043C\u0435\u0441\u0442\u043E \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E"
  }
});
var transfusion = choiceFromTable({
  id: `${TOPIC3}.transfusion`,
  topicId: TOPIC3,
  rows: BLOOD_GROUPS,
  paragraph: P.circulation.blood,
  subtopic: GROUPS,
  difficulty: tier2,
  shift: 0,
  question: (g, lang) => lang === "pl" ? `Biorca ma grup\u0119 krwi ${g.group.pl}. Od kogo mo\u017Ce przyj\u0105\u0107 krew?` : `\u0423 \u0440\u0435\u0446\u0438\u043F\u0438\u0435\u043D\u0442\u0430 \u0433\u0440\u0443\u043F\u043F\u0430 \u043A\u0440\u043E\u0432\u0438 ${g.group.ru}. \u041E\u0442 \u043A\u043E\u0433\u043E \u043E\u043D \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u0438\u043D\u044F\u0442\u044C \u043A\u0440\u043E\u0432\u044C?`,
  optionText: (g, lang) => g.receivesFrom[lang],
  misconception: {
    pl: "zgodno\u015B\u0107 innej grupy \u2014 najcz\u0119\u015Bciej pomini\u0119ty czynnik Rh",
    ru: "\u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C \u0434\u0440\u0443\u0433\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B \u2014 \u0447\u0430\u0449\u0435 \u0432\u0441\u0435\u0433\u043E \u0437\u0430\u0431\u044B\u0442 \u0440\u0435\u0437\u0443\u0441-\u0444\u0430\u043A\u0442\u043E\u0440"
  },
  hint: (g, lang) => lang === "pl" ? `Biorca ma ${g.antibodies.pl}.` : `\u0423 \u0440\u0435\u0446\u0438\u043F\u0438\u0435\u043D\u0442\u0430 ${g.antibodies.ru}.`,
  solution: (g, lang) => lang === "pl" ? `Grupa ${g.group.pl}: ${g.antigens.pl}, ${g.antibodies.pl}. Dlatego mo\u017Ce przyj\u0105\u0107 krew ${g.receivesFrom.pl}.` : `\u0413\u0440\u0443\u043F\u043F\u0430 ${g.group.ru}: ${g.antigens.ru}, ${g.antibodies.ru}. \u041F\u043E\u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u0438\u043D\u044F\u0442\u044C \u043A\u0440\u043E\u0432\u044C ${g.receivesFrom.ru}.`
});
var antigens = choiceFromTable({
  id: `${TOPIC3}.group-to-antigens`,
  topicId: TOPIC3,
  rows: BLOOD_GROUPS,
  paragraph: P.circulation.blood,
  subtopic: GROUPS,
  difficulty: tier2,
  shift: 2,
  question: (g, lang) => lang === "pl" ? `Grupa krwi: ${g.group.pl}. Jakie antygeny wyst\u0119puj\u0105 na erytrocytach?` : `\u0413\u0440\u0443\u043F\u043F\u0430 \u043A\u0440\u043E\u0432\u0438: ${g.group.ru}. \u041A\u0430\u043A\u0438\u0435 \u0430\u043D\u0442\u0438\u0433\u0435\u043D\u044B \u0435\u0441\u0442\u044C \u043D\u0430 \u044D\u0440\u0438\u0442\u0440\u043E\u0446\u0438\u0442\u0430\u0445?`,
  optionText: (g, lang) => g.antigens[lang],
  misconception: { pl: "antygeny innej grupy krwi", ru: "\u0430\u043D\u0442\u0438\u0433\u0435\u043D\u044B \u0434\u0440\u0443\u0433\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B \u043A\u0440\u043E\u0432\u0438" },
  solution: (g, lang) => lang === "pl" ? `Grupa ${g.group.pl}: ${g.antigens.pl}. W osoczu: ${g.antibodies.pl}.` : `\u0413\u0440\u0443\u043F\u043F\u0430 ${g.group.ru}: ${g.antigens.ru}. \u0412 \u043F\u043B\u0430\u0437\u043C\u0435: ${g.antibodies.ru}.`
});
var cardiacOutput = calcTemplate({
  id: `${TOPIC3}.cardiac-output`,
  topicId: TOPIC3,
  paragraph: P.circulation.function,
  subtopic: HEART,
  tags: ["obliczenia"],
  difficulty: 1,
  params: { sv: intRange(6, 9), hr: intRange(55, 90) },
  decimals: 2,
  formula: (p) => `(${p.sv * 10} * ${p.hr}) / 1000`,
  value: (p) => p.sv * 10 * p.hr / 1e3,
  question: (p, lang) => lang === "pl" ? `Obj\u0119to\u015B\u0107 wyrzutowa serca wynosi ${p.sv * 10} ml, a t\u0119tno ${p.hr} uderze\u0144 na minut\u0119. Oblicz pojemno\u015B\u0107 minutow\u0105 serca w litrach na minut\u0119.` : `\u0423\u0434\u0430\u0440\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0441\u0435\u0440\u0434\u0446\u0430 \u0440\u0430\u0432\u0435\u043D ${p.sv * 10} \u043C\u043B, \u043F\u0443\u043B\u044C\u0441 ${p.hr} \u0443\u0434\u0430\u0440\u043E\u0432 \u0432 \u043C\u0438\u043D\u0443\u0442\u0443. \u0412\u044B\u0447\u0438\u0441\u043B\u0438 \u043C\u0438\u043D\u0443\u0442\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0441\u0435\u0440\u0434\u0446\u0430 \u0432 \u043B\u0438\u0442\u0440\u0430\u0445 \u0432 \u043C\u0438\u043D\u0443\u0442\u0443.`,
  hint: (_p, lang) => lang === "pl" ? "Pojemno\u015B\u0107 minutowa = obj\u0119to\u015B\u0107 wyrzutowa \xD7 cz\u0119sto\u015B\u0107 skurcz\xF3w." : "\u041C\u0438\u043D\u0443\u0442\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C = \u0443\u0434\u0430\u0440\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \xD7 \u0447\u0430\u0441\u0442\u043E\u0442\u0430 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u0439.",
  solution: (p, answer, lang) => lang === "pl" ? `${p.sv * 10} ml \xD7 ${p.hr} = ${p.sv * 10 * p.hr} ml/min = ${answer} l/min.` : `${p.sv * 10} \u043C\u043B \xD7 ${p.hr} = ${p.sv * 10 * p.hr} \u043C\u043B/\u043C\u0438\u043D = ${answer} \u043B/\u043C\u0438\u043D.`
});
var strokeVolume = calcTemplate({
  id: `${TOPIC3}.stroke-volume`,
  topicId: TOPIC3,
  paragraph: P.circulation.function,
  subtopic: HEART,
  tags: ["obliczenia"],
  difficulty: 2,
  params: { edv: intRange(11, 14), esv: intRange(4, 6) },
  formula: (p) => `${p.edv * 10} - ${p.esv * 10}`,
  value: (p) => (p.edv - p.esv) * 10,
  question: (p, lang) => lang === "pl" ? `Obj\u0119to\u015B\u0107 ko\u0144coworozkurczowa lewej komory wynosi ${p.edv * 10} ml, a ko\u0144cowoskurczowa ${p.esv * 10} ml. Oblicz obj\u0119to\u015B\u0107 wyrzutow\u0105 w ml.` : `\u041A\u043E\u043D\u0435\u0447\u043D\u043E-\u0434\u0438\u0430\u0441\u0442\u043E\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043E\u0431\u044A\u0451\u043C \u043B\u0435\u0432\u043E\u0433\u043E \u0436\u0435\u043B\u0443\u0434\u043E\u0447\u043A\u0430 \u0440\u0430\u0432\u0435\u043D ${p.edv * 10} \u043C\u043B, \u043A\u043E\u043D\u0435\u0447\u043D\u043E-\u0441\u0438\u0441\u0442\u043E\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 ${p.esv * 10} \u043C\u043B. \u0412\u044B\u0447\u0438\u0441\u043B\u0438 \u0443\u0434\u0430\u0440\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0432 \u043C\u043B.`,
  hint: (_p, lang) => lang === "pl" ? "Obj\u0119to\u015B\u0107 wyrzutowa to ta cz\u0119\u015B\u0107 krwi, kt\xF3ra opuszcza komor\u0119 podczas skurczu." : "\u0423\u0434\u0430\u0440\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u2014 \u0442\u0430 \u0447\u0430\u0441\u0442\u044C \u043A\u0440\u043E\u0432\u0438, \u043A\u043E\u0442\u043E\u0440\u0430\u044F \u043F\u043E\u043A\u0438\u0434\u0430\u0435\u0442 \u0436\u0435\u043B\u0443\u0434\u043E\u0447\u0435\u043A \u043F\u0440\u0438 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u0438.",
  solution: (p, answer, lang) => lang === "pl" ? `${p.edv * 10} \u2212 ${p.esv * 10} = ${answer} ml.` : `${p.edv * 10} \u2212 ${p.esv * 10} = ${answer} \u043C\u043B.`
});
var ejectionFraction = calcTemplate({
  id: `${TOPIC3}.ejection-fraction`,
  topicId: TOPIC3,
  paragraph: P.circulation.function,
  subtopic: HEART,
  tags: ["obliczenia"],
  difficulty: 3,
  params: { edv: intRange(11, 14), esv: intRange(4, 6) },
  decimals: 1,
  formula: (p) => `((${p.edv * 10} - ${p.esv * 10}) / ${p.edv * 10}) * 100`,
  value: (p) => (p.edv - p.esv) / p.edv * 100,
  question: (p, lang) => lang === "pl" ? `Obj\u0119to\u015B\u0107 ko\u0144coworozkurczowa wynosi ${p.edv * 10} ml, a ko\u0144cowoskurczowa ${p.esv * 10} ml. Oblicz frakcj\u0119 wyrzutow\u0105 w procentach.` : `\u041A\u043E\u043D\u0435\u0447\u043D\u043E-\u0434\u0438\u0430\u0441\u0442\u043E\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043E\u0431\u044A\u0451\u043C \u0440\u0430\u0432\u0435\u043D ${p.edv * 10} \u043C\u043B, \u043A\u043E\u043D\u0435\u0447\u043D\u043E-\u0441\u0438\u0441\u0442\u043E\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 ${p.esv * 10} \u043C\u043B. \u0412\u044B\u0447\u0438\u0441\u043B\u0438 \u0444\u0440\u0430\u043A\u0446\u0438\u044E \u0432\u044B\u0431\u0440\u043E\u0441\u0430 \u0432 \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u0430\u0445.`,
  hint: (_p, lang) => lang === "pl" ? "Frakcja wyrzutowa to udzia\u0142 obj\u0119to\u015Bci wyrzutowej w obj\u0119to\u015Bci ko\u0144coworozkurczowej." : "\u0424\u0440\u0430\u043A\u0446\u0438\u044F \u0432\u044B\u0431\u0440\u043E\u0441\u0430 \u2014 \u0434\u043E\u043B\u044F \u0443\u0434\u0430\u0440\u043D\u043E\u0433\u043E \u043E\u0431\u044A\u0451\u043C\u0430 \u0432 \u043A\u043E\u043D\u0435\u0447\u043D\u043E-\u0434\u0438\u0430\u0441\u0442\u043E\u043B\u0438\u0447\u0435\u0441\u043A\u043E\u043C \u043E\u0431\u044A\u0451\u043C\u0435.",
  solution: (p, answer, lang) => lang === "pl" ? `(${p.edv * 10} \u2212 ${p.esv * 10}) / ${p.edv * 10} \xD7 100% = ${answer}%.` : `(${p.edv * 10} \u2212 ${p.esv * 10}) / ${p.edv * 10} \xD7 100% = ${answer}%.`
});
var lo3CirculationTemplates = [
  ...heartTemplates,
  ...bloodTemplates,
  ...immunityTemplates,
  transfusion,
  antigens,
  cardiacOutput,
  strokeVolume,
  ejectionFraction
];

// packages/trainers/bio/src/server/templates/data/organism.ts
var TISSUES = [
  {
    id: "nablonkowa",
    name: { pl: "tkanka nab\u0142onkowa", ru: "\u044D\u043F\u0438\u0442\u0435\u043B\u0438\u0430\u043B\u044C\u043D\u0430\u044F \u0442\u043A\u0430\u043D\u044C" },
    role: { pl: "pokrywanie powierzchni cia\u0142a i wy\u015Bcielanie narz\u0105d\xF3w, z kom\xF3rkami \u015Bci\u015Ble przylegaj\u0105cymi", ru: "\u043F\u043E\u043A\u0440\u044B\u0442\u0438\u0435 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0438 \u0442\u0435\u043B\u0430 \u0438 \u0432\u044B\u0441\u0442\u0438\u043B\u0430\u043D\u0438\u0435 \u043E\u0440\u0433\u0430\u043D\u043E\u0432, \u0441 \u043F\u043B\u043E\u0442\u043D\u043E \u043F\u0440\u0438\u043B\u0435\u0433\u0430\u044E\u0449\u0438\u043C\u0438 \u043A\u043B\u0435\u0442\u043A\u0430\u043C\u0438" },
    aliases: { pl: ["nab\u0142onek"], ru: ["\u044D\u043F\u0438\u0442\u0435\u043B\u0438\u0439"] },
    tier: 1
  },
  {
    id: "laczna-wlasciwa",
    name: { pl: "tkanka \u0142\u0105czna w\u0142a\u015Bciwa", ru: "\u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E \u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0442\u043A\u0430\u043D\u044C" },
    role: { pl: "\u0142\u0105czenie i podtrzymywanie innych tkanek dzi\u0119ki obfitej substancji mi\u0119dzykom\xF3rkowej", ru: "\u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0434\u0440\u0443\u0433\u0438\u0445 \u0442\u043A\u0430\u043D\u0435\u0439 \u0431\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u044F \u043E\u0431\u0438\u043B\u044C\u043D\u043E\u043C\u0443 \u043C\u0435\u0436\u043A\u043B\u0435\u0442\u043E\u0447\u043D\u043E\u043C\u0443 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0443" },
    aliases: { pl: ["tkanka \u0142\u0105czna"], ru: ["\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0442\u043A\u0430\u043D\u044C"] },
    tier: 1
  },
  {
    id: "kostna",
    name: { pl: "tkanka kostna", ru: "\u043A\u043E\u0441\u0442\u043D\u0430\u044F \u0442\u043A\u0430\u043D\u044C" },
    role: { pl: "tworzenie szkieletu dzi\u0119ki substancji mi\u0119dzykom\xF3rkowej wysyconej solami wapnia", ru: "\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u043A\u0435\u043B\u0435\u0442\u0430 \u0431\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u044F \u043C\u0435\u0436\u043A\u043B\u0435\u0442\u043E\u0447\u043D\u043E\u043C\u0443 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0443, \u043D\u0430\u0441\u044B\u0449\u0435\u043D\u043D\u043E\u043C\u0443 \u0441\u043E\u043B\u044F\u043C\u0438 \u043A\u0430\u043B\u044C\u0446\u0438\u044F" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "chrzestna",
    name: { pl: "tkanka chrz\u0119stna", ru: "\u0445\u0440\u044F\u0449\u0435\u0432\u0430\u044F \u0442\u043A\u0430\u043D\u044C" },
    role: { pl: "pokrywanie powierzchni stawowych spr\u0119\u017Cyst\u0105, bezunaczynion\u0105 warstw\u0105", ru: "\u043F\u043E\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u0443\u0441\u0442\u0430\u0432\u043D\u044B\u0445 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0435\u0439 \u0443\u043F\u0440\u0443\u0433\u0438\u043C, \u043B\u0438\u0448\u0451\u043D\u043D\u044B\u043C \u0441\u043E\u0441\u0443\u0434\u043E\u0432 \u0441\u043B\u043E\u0435\u043C" },
    aliases: { pl: ["chrz\u0105stka"], ru: ["\u0445\u0440\u044F\u0449"] },
    tier: 2
  },
  {
    id: "tluszczowa",
    name: { pl: "tkanka t\u0142uszczowa", ru: "\u0436\u0438\u0440\u043E\u0432\u0430\u044F \u0442\u043A\u0430\u043D\u044C" },
    role: { pl: "magazynowanie energii i ochrona termiczna narz\u0105d\xF3w", ru: "\u0437\u0430\u043F\u0430\u0441\u0430\u043D\u0438\u0435 \u044D\u043D\u0435\u0440\u0433\u0438\u0438 \u0438 \u0442\u0435\u043F\u043B\u043E\u0432\u0430\u044F \u0437\u0430\u0449\u0438\u0442\u0430 \u043E\u0440\u0433\u0430\u043D\u043E\u0432" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "krew",
    name: { pl: "krew", ru: "\u043A\u0440\u043E\u0432\u044C" },
    role: { pl: "tkanka \u0142\u0105czna o p\u0142ynnej substancji mi\u0119dzykom\xF3rkowej, transportuj\u0105ca gazy i substancje", ru: "\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0442\u043A\u0430\u043D\u044C \u0441 \u0436\u0438\u0434\u043A\u0438\u043C \u043C\u0435\u0436\u043A\u043B\u0435\u0442\u043E\u0447\u043D\u044B\u043C \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u043E\u043C, \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u044F\u0449\u0430\u044F \u0433\u0430\u0437\u044B \u0438 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0430" },
    aliases: { pl: ["tkanka \u0142\u0105czna p\u0142ynna"], ru: ["\u0436\u0438\u0434\u043A\u0430\u044F \u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0442\u043A\u0430\u043D\u044C"] },
    tier: 2
  },
  {
    id: "gladka",
    name: { pl: "tkanka mi\u0119\u015Bniowa g\u0142adka", ru: "\u0433\u043B\u0430\u0434\u043A\u0430\u044F \u043C\u044B\u0448\u0435\u0447\u043D\u0430\u044F \u0442\u043A\u0430\u043D\u044C" },
    role: { pl: "powolne, niezale\u017Cne od woli skurcze \u015Bcian narz\u0105d\xF3w wewn\u0119trznych", ru: "\u043C\u0435\u0434\u043B\u0435\u043D\u043D\u044B\u0435, \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u044B\u0435 \u043E\u0442 \u0432\u043E\u043B\u0438 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u0441\u0442\u0435\u043D\u043E\u043A \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0445 \u043E\u0440\u0433\u0430\u043D\u043E\u0432" },
    aliases: { pl: ["mi\u0119\u015Bnie g\u0142adkie"], ru: ["\u0433\u043B\u0430\u0434\u043A\u0438\u0435 \u043C\u044B\u0448\u0446\u044B"] },
    tier: 1
  },
  {
    id: "poprzecznie-prazkowana",
    name: { pl: "tkanka mi\u0119\u015Bniowa poprzecznie pr\u0105\u017Ckowana szkieletowa", ru: "\u043F\u043E\u043F\u0435\u0440\u0435\u0447\u043D\u043E\u043F\u043E\u043B\u043E\u0441\u0430\u0442\u0430\u044F \u0441\u043A\u0435\u043B\u0435\u0442\u043D\u0430\u044F \u043C\u044B\u0448\u0435\u0447\u043D\u0430\u044F \u0442\u043A\u0430\u043D\u044C" },
    role: { pl: "szybkie, zale\u017Cne od woli skurcze poruszaj\u0105ce ko\u015B\u0107mi", ru: "\u0431\u044B\u0441\u0442\u0440\u044B\u0435, \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u044F, \u043F\u0440\u0438\u0432\u043E\u0434\u044F\u0449\u0438\u0435 \u0432 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u043A\u043E\u0441\u0442\u0438" },
    aliases: { pl: ["mi\u0119\u015Bnie szkieletowe"], ru: ["\u0441\u043A\u0435\u043B\u0435\u0442\u043D\u044B\u0435 \u043C\u044B\u0448\u0446\u044B"] },
    tier: 1
  },
  {
    id: "sercowa",
    name: { pl: "tkanka mi\u0119\u015Bniowa sercowa", ru: "\u0441\u0435\u0440\u0434\u0435\u0447\u043D\u0430\u044F \u043C\u044B\u0448\u0435\u0447\u043D\u0430\u044F \u0442\u043A\u0430\u043D\u044C" },
    role: { pl: "rytmiczne, niezale\u017Cne od woli skurcze kom\xF3rek po\u0142\u0105czonych wstawkami", ru: "\u0440\u0438\u0442\u043C\u0438\u0447\u043D\u044B\u0435, \u043D\u0435\u043F\u0440\u043E\u0438\u0437\u0432\u043E\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u043A\u043B\u0435\u0442\u043E\u043A, \u0441\u043E\u0435\u0434\u0438\u043D\u0451\u043D\u043D\u044B\u0445 \u0432\u0441\u0442\u0430\u0432\u043E\u0447\u043D\u044B\u043C\u0438 \u0434\u0438\u0441\u043A\u0430\u043C\u0438" },
    aliases: { pl: ["mi\u0119sie\u0144 sercowy"], ru: ["\u0441\u0435\u0440\u0434\u0435\u0447\u043D\u0430\u044F \u043C\u044B\u0448\u0446\u0430"] },
    tier: 2
  },
  {
    id: "nerwowa",
    name: { pl: "tkanka nerwowa", ru: "\u043D\u0435\u0440\u0432\u043D\u0430\u044F \u0442\u043A\u0430\u043D\u044C" },
    role: { pl: "odbieranie, przewodzenie i przetwarzanie bod\u017Ac\xF3w", ru: "\u043F\u0440\u0438\u0451\u043C, \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u0438 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0440\u0430\u0437\u0434\u0440\u0430\u0436\u0438\u0442\u0435\u043B\u0435\u0439" },
    aliases: { pl: [], ru: [] },
    tier: 1
  }
];
var HIERARCHY_AND_TRANSPORT = [
  {
    id: "dyfuzja",
    name: { pl: "dyfuzja", ru: "\u0434\u0438\u0444\u0444\u0443\u0437\u0438\u044F" },
    role: { pl: "samorzutny ruch cz\u0105steczek zgodnie z gradientem st\u0119\u017Ce\u0144, bez nak\u0142adu energii", ru: "\u0441\u0430\u043C\u043E\u043F\u0440\u043E\u0438\u0437\u0432\u043E\u043B\u044C\u043D\u043E\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u043C\u043E\u043B\u0435\u043A\u0443\u043B \u043F\u043E \u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442\u0443 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u0438, \u0431\u0435\u0437 \u0437\u0430\u0442\u0440\u0430\u0442 \u044D\u043D\u0435\u0440\u0433\u0438\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "osmoza",
    name: { pl: "osmoza", ru: "\u043E\u0441\u043C\u043E\u0441" },
    role: { pl: "przenikanie wody przez b\u0142on\u0119 p\xF3\u0142przepuszczaln\u0105 do roztworu bardziej st\u0119\u017Conego", ru: "\u043F\u0435\u0440\u0435\u0445\u043E\u0434 \u0432\u043E\u0434\u044B \u0447\u0435\u0440\u0435\u0437 \u043F\u043E\u043B\u0443\u043F\u0440\u043E\u043D\u0438\u0446\u0430\u0435\u043C\u0443\u044E \u043C\u0435\u043C\u0431\u0440\u0430\u043D\u0443 \u0432 \u0431\u043E\u043B\u0435\u0435 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0440\u0430\u0441\u0442\u0432\u043E\u0440" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "transport-aktywny",
    name: { pl: "transport aktywny", ru: "\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442" },
    role: { pl: "przenoszenie substancji wbrew gradientowi st\u0119\u017Ce\u0144 kosztem ATP", ru: "\u043F\u0435\u0440\u0435\u043D\u043E\u0441 \u0432\u0435\u0449\u0435\u0441\u0442\u0432 \u043F\u0440\u043E\u0442\u0438\u0432 \u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442\u0430 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u0438 \u0437\u0430 \u0441\u0447\u0451\u0442 \u0410\u0422\u0424" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "endocytoza",
    name: { pl: "endocytoza", ru: "\u044D\u043D\u0434\u043E\u0446\u0438\u0442\u043E\u0437" },
    role: { pl: "pobieranie du\u017Cych cz\u0105stek przez wpuklenie b\u0142ony kom\xF3rkowej", ru: "\u043F\u043E\u0433\u043B\u043E\u0449\u0435\u043D\u0438\u0435 \u043A\u0440\u0443\u043F\u043D\u044B\u0445 \u0447\u0430\u0441\u0442\u0438\u0446 \u0447\u0435\u0440\u0435\u0437 \u0432\u043F\u044F\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u043A\u043B\u0435\u0442\u043E\u0447\u043D\u043E\u0439 \u043C\u0435\u043C\u0431\u0440\u0430\u043D\u044B" },
    aliases: { pl: ["fagocytoza"], ru: ["\u0444\u0430\u0433\u043E\u0446\u0438\u0442\u043E\u0437"] },
    tier: 2
  },
  {
    id: "narzad",
    name: { pl: "narz\u0105d", ru: "\u043E\u0440\u0433\u0430\u043D" },
    role: { pl: "zesp\xF3\u0142 r\xF3\u017Cnych tkanek pe\u0142ni\u0105cy wsp\xF3lnie okre\u015Blon\u0105 funkcj\u0119", ru: "\u0441\u043E\u0432\u043E\u043A\u0443\u043F\u043D\u043E\u0441\u0442\u044C \u0440\u0430\u0437\u043D\u044B\u0445 \u0442\u043A\u0430\u043D\u0435\u0439, \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u043D\u043E \u0432\u044B\u043F\u043E\u043B\u043D\u044F\u044E\u0449\u0438\u0445 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0451\u043D\u043D\u0443\u044E \u0444\u0443\u043D\u043A\u0446\u0438\u044E" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "uklad-narzadow",
    name: { pl: "uk\u0142ad narz\u0105d\xF3w", ru: "\u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u043E\u0440\u0433\u0430\u043D\u043E\u0432" },
    role: { pl: "zesp\xF3\u0142 narz\u0105d\xF3w wsp\xF3\u0142pracuj\u0105cych w jednym procesie \u017Cyciowym", ru: "\u0441\u043E\u0432\u043E\u043A\u0443\u043F\u043D\u043E\u0441\u0442\u044C \u043E\u0440\u0433\u0430\u043D\u043E\u0432, \u0440\u0430\u0431\u043E\u0442\u0430\u044E\u0449\u0438\u0445 \u0432\u043C\u0435\u0441\u0442\u0435 \u0432 \u043E\u0434\u043D\u043E\u043C \u0436\u0438\u0437\u043D\u0435\u043D\u043D\u043E\u043C \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435" },
    aliases: { pl: [], ru: [] },
    tier: 1
  }
];
var SKIN_PARTS = [
  {
    id: "naskorek",
    name: { pl: "nask\xF3rek", ru: "\u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441" },
    role: { pl: "zewn\u0119trzna warstwa sk\xF3ry zbudowana z nab\u0142onka wielowarstwowego p\u0142askiego", ru: "\u043D\u0430\u0440\u0443\u0436\u043D\u044B\u0439 \u0441\u043B\u043E\u0439 \u043A\u043E\u0436\u0438 \u0438\u0437 \u043C\u043D\u043E\u0433\u043E\u0441\u043B\u043E\u0439\u043D\u043E\u0433\u043E \u043F\u043B\u043E\u0441\u043A\u043E\u0433\u043E \u044D\u043F\u0438\u0442\u0435\u043B\u0438\u044F" },
    aliases: { pl: [], ru: ["\u043D\u0430\u0434\u043A\u043E\u0436\u0438\u0446\u0430"] },
    tier: 1
  },
  {
    id: "warstwa-rogowa",
    name: { pl: "warstwa rogowa", ru: "\u0440\u043E\u0433\u043E\u0432\u043E\u0439 \u0441\u043B\u043E\u0439" },
    role: { pl: "martwe, z\u0142uszczaj\u0105ce si\u0119 kom\xF3rki wype\u0142nione keratyn\u0105", ru: "\u043C\u0451\u0440\u0442\u0432\u044B\u0435, \u0441\u043B\u0443\u0449\u0438\u0432\u0430\u044E\u0449\u0438\u0435\u0441\u044F \u043A\u043B\u0435\u0442\u043A\u0438, \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u044B\u0435 \u043A\u0435\u0440\u0430\u0442\u0438\u043D\u043E\u043C" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "warstwa-rozrodcza",
    name: { pl: "warstwa rozrodcza nask\xF3rka", ru: "\u0440\u043E\u0441\u0442\u043A\u043E\u0432\u044B\u0439 \u0441\u043B\u043E\u0439 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441\u0430" },
    role: { pl: "ci\u0105g\u0142e dzielenie si\u0119 kom\xF3rek odbudowuj\u0105cych nask\xF3rek", ru: "\u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u043E\u0435 \u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043A\u043B\u0435\u0442\u043E\u043A, \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u044E\u0449\u0438\u0445 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441" },
    aliases: { pl: ["warstwa podstawna"], ru: ["\u0431\u0430\u0437\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u043B\u043E\u0439"] },
    tier: 2
  },
  {
    id: "melanocyty",
    name: { pl: "melanocyty", ru: "\u043C\u0435\u043B\u0430\u043D\u043E\u0446\u0438\u0442\u044B" },
    role: { pl: "wytwarzanie melaniny chroni\u0105cej przed promieniowaniem UV", ru: "\u0432\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u043C\u0435\u043B\u0430\u043D\u0438\u043D\u0430, \u0437\u0430\u0449\u0438\u0449\u0430\u044E\u0449\u0435\u0433\u043E \u043E\u0442 \u0423\u0424-\u0438\u0437\u043B\u0443\u0447\u0435\u043D\u0438\u044F" },
    aliases: { pl: ["melanocyt"], ru: ["\u043C\u0435\u043B\u0430\u043D\u043E\u0446\u0438\u0442"] },
    tier: 2
  },
  {
    id: "skora-wlasciwa",
    name: { pl: "sk\xF3ra w\u0142a\u015Bciwa", ru: "\u0434\u0435\u0440\u043C\u0430" },
    role: { pl: "warstwa z w\u0142\xF3knami kolagenowymi i spr\u0119\u017Cystymi, naczyniami i receptorami", ru: "\u0441\u043B\u043E\u0439 \u0441 \u043A\u043E\u043B\u043B\u0430\u0433\u0435\u043D\u043E\u0432\u044B\u043C\u0438 \u0438 \u044D\u043B\u0430\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u043C\u0438 \u0432\u043E\u043B\u043E\u043A\u043D\u0430\u043C\u0438, \u0441\u043E\u0441\u0443\u0434\u0430\u043C\u0438 \u0438 \u0440\u0435\u0446\u0435\u043F\u0442\u043E\u0440\u0430\u043C\u0438" },
    aliases: { pl: [], ru: ["\u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E \u043A\u043E\u0436\u0430"] },
    tier: 1
  },
  {
    id: "tkanka-podskorna",
    name: { pl: "tkanka podsk\xF3rna", ru: "\u043F\u043E\u0434\u043A\u043E\u0436\u043D\u0430\u044F \u043A\u043B\u0435\u0442\u0447\u0430\u0442\u043A\u0430" },
    role: { pl: "warstwa t\u0142uszczowa izoluj\u0105ca termicznie i amortyzuj\u0105ca urazy", ru: "\u0436\u0438\u0440\u043E\u0432\u043E\u0439 \u0441\u043B\u043E\u0439, \u0442\u0435\u043F\u043B\u043E\u0438\u0437\u043E\u043B\u0438\u0440\u0443\u044E\u0449\u0438\u0439 \u0438 \u0441\u043C\u044F\u0433\u0447\u0430\u044E\u0449\u0438\u0439 \u0443\u0434\u0430\u0440\u044B" },
    aliases: { pl: [], ru: ["\u0433\u0438\u043F\u043E\u0434\u0435\u0440\u043C\u0430"] },
    tier: 1
  },
  {
    id: "gruczoly-potowe",
    name: { pl: "gruczo\u0142y potowe", ru: "\u043F\u043E\u0442\u043E\u0432\u044B\u0435 \u0436\u0435\u043B\u0435\u0437\u044B" },
    role: { pl: "wydzielanie potu, kt\xF3rego parowanie ch\u0142odzi organizm", ru: "\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0442\u0430, \u0438\u0441\u043F\u0430\u0440\u0435\u043D\u0438\u0435 \u043A\u043E\u0442\u043E\u0440\u043E\u0433\u043E \u043E\u0445\u043B\u0430\u0436\u0434\u0430\u0435\u0442 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C" },
    aliases: { pl: ["gruczo\u0142 potowy"], ru: ["\u043F\u043E\u0442\u043E\u0432\u0430\u044F \u0436\u0435\u043B\u0435\u0437\u0430"] },
    tier: 1
  },
  {
    id: "gruczoly-lojowe",
    name: { pl: "gruczo\u0142y \u0142ojowe", ru: "\u0441\u0430\u043B\u044C\u043D\u044B\u0435 \u0436\u0435\u043B\u0435\u0437\u044B" },
    role: { pl: "nat\u0142uszczanie sk\xF3ry i w\u0142os\xF3w wydzielin\u0105 o odczynie kwa\u015Bnym", ru: "\u0441\u043C\u0430\u0437\u044B\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u0436\u0438 \u0438 \u0432\u043E\u043B\u043E\u0441 \u0441\u0435\u043A\u0440\u0435\u0442\u043E\u043C \u0441 \u043A\u0438\u0441\u043B\u043E\u0439 \u0440\u0435\u0430\u043A\u0446\u0438\u0435\u0439" },
    aliases: { pl: ["gruczo\u0142 \u0142ojowy"], ru: ["\u0441\u0430\u043B\u044C\u043D\u0430\u044F \u0436\u0435\u043B\u0435\u0437\u0430"] },
    tier: 1
  },
  {
    id: "wlos",
    name: { pl: "w\u0142os", ru: "\u0432\u043E\u043B\u043E\u0441" },
    role: { pl: "wytw\xF3r nask\xF3rka wyrastaj\u0105cy z mieszka, ograniczaj\u0105cy utrat\u0119 ciep\u0142a", ru: "\u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u043D\u043E\u0435 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441\u0430, \u0440\u0430\u0441\u0442\u0443\u0449\u0435\u0435 \u0438\u0437 \u0444\u043E\u043B\u043B\u0438\u043A\u0443\u043B\u0430, \u0441\u043D\u0438\u0436\u0430\u044E\u0449\u0435\u0435 \u043F\u043E\u0442\u0435\u0440\u044E \u0442\u0435\u043F\u043B\u0430" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "naczynia-skory",
    name: { pl: "naczynia krwiono\u015Bne sk\xF3ry", ru: "\u043A\u0440\u043E\u0432\u0435\u043D\u043E\u0441\u043D\u044B\u0435 \u0441\u043E\u0441\u0443\u0434\u044B \u043A\u043E\u0436\u0438" },
    role: { pl: "rozszerzanie si\u0119 przy przegrzaniu i kurczenie przy wych\u0142odzeniu", ru: "\u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u0433\u0440\u0435\u0432\u0435 \u0438 \u0441\u0443\u0436\u0435\u043D\u0438\u0435 \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "receptory-skory",
    name: { pl: "receptory sk\xF3ry", ru: "\u0440\u0435\u0446\u0435\u043F\u0442\u043E\u0440\u044B \u043A\u043E\u0436\u0438" },
    role: { pl: "odbieranie dotyku, ucisku, temperatury i b\xF3lu", ru: "\u043F\u0440\u0438\u0451\u043C \u043F\u0440\u0438\u043A\u043E\u0441\u043D\u043E\u0432\u0435\u043D\u0438\u044F, \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u044F, \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B \u0438 \u0431\u043E\u043B\u0438" },
    aliases: { pl: ["receptor sk\xF3ry"], ru: ["\u0440\u0435\u0446\u0435\u043F\u0442\u043E\u0440 \u043A\u043E\u0436\u0438"] },
    tier: 1
  },
  {
    id: "witamina-d",
    name: { pl: "witamina D", ru: "\u0432\u0438\u0442\u0430\u043C\u0438\u043D D" },
    role: { pl: "powstawanie w sk\xF3rze pod wp\u0142ywem promieniowania UV, potrzebne do wch\u0142aniania wapnia", ru: "\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0432 \u043A\u043E\u0436\u0435 \u043F\u043E\u0434 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u043C \u0423\u0424-\u0438\u0437\u043B\u0443\u0447\u0435\u043D\u0438\u044F, \u043D\u0443\u0436\u043D\u043E\u0435 \u0434\u043B\u044F \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u044F \u043A\u0430\u043B\u044C\u0446\u0438\u044F" },
    aliases: { pl: ["cholekalcyferol"], ru: ["\u0445\u043E\u043B\u0435\u043A\u0430\u043B\u044C\u0446\u0438\u0444\u0435\u0440\u043E\u043B"] },
    tier: 2
  }
];

// packages/trainers/bio/src/server/templates/data/systems.ts
var MOTION_PARTS = [
  {
    id: "okostna",
    paragraph: P.motion.skeleton,
    name: { pl: "okostna", ru: "\u043D\u0430\u0434\u043A\u043E\u0441\u0442\u043D\u0438\u0446\u0430" },
    role: { pl: "od\u017Cywianie ko\u015Bci i odtwarzanie jej po z\u0142amaniu", ru: "\u043F\u0438\u0442\u0430\u043D\u0438\u0435 \u043A\u043E\u0441\u0442\u0438 \u0438 \u0435\u0451 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0435\u043B\u043E\u043C\u0430" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "istota-zbita",
    paragraph: P.motion.skeleton,
    name: { pl: "istota zbita ko\u015Bci", ru: "\u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u043E\u0435 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u043E \u043A\u043E\u0441\u0442\u0438" },
    role: { pl: "przenoszenie obci\u0105\u017Ce\u0144 dzi\u0119ki g\u0119sto u\u0142o\u017Conym osteonom", ru: "\u0432\u043E\u0441\u043F\u0440\u0438\u044F\u0442\u0438\u0435 \u043D\u0430\u0433\u0440\u0443\u0437\u043E\u043A \u0431\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u044F \u043F\u043B\u043E\u0442\u043D\u043E \u0443\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u043C \u043E\u0441\u0442\u0435\u043E\u043D\u0430\u043C" },
    aliases: { pl: ["istota zbita"], ru: ["\u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u043E\u0435 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u043E"] },
    tier: 2
  },
  {
    id: "istota-gabczasta",
    paragraph: P.motion.skeleton,
    name: { pl: "istota g\u0105bczasta ko\u015Bci", ru: "\u0433\u0443\u0431\u0447\u0430\u0442\u043E\u0435 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u043E \u043A\u043E\u0441\u0442\u0438" },
    role: { pl: "zmniejszanie masy ko\u015Bci przy zachowaniu wytrzyma\u0142o\u015Bci, z beleczkami wzd\u0142u\u017C linii si\u0142", ru: "\u0441\u043D\u0438\u0436\u0435\u043D\u0438\u0435 \u043C\u0430\u0441\u0441\u044B \u043A\u043E\u0441\u0442\u0438 \u043F\u0440\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0438 \u043F\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u0438, \u0441 \u0431\u0430\u043B\u043A\u0430\u043C\u0438 \u0432\u0434\u043E\u043B\u044C \u043B\u0438\u043D\u0438\u0439 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0438" },
    aliases: { pl: ["istota g\u0105bczasta"], ru: ["\u0433\u0443\u0431\u0447\u0430\u0442\u043E\u0435 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u043E"] },
    tier: 2
  },
  {
    id: "szpik-czerwony",
    paragraph: P.motion.skeleton,
    name: { pl: "szpik kostny czerwony", ru: "\u043A\u0440\u0430\u0441\u043D\u044B\u0439 \u043A\u043E\u0441\u0442\u043D\u044B\u0439 \u043C\u043E\u0437\u0433" },
    role: { pl: "wytwarzanie kom\xF3rek krwi", ru: "\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u043A\u043B\u0435\u0442\u043E\u043A \u043A\u0440\u043E\u0432\u0438" },
    aliases: { pl: ["szpik czerwony"], ru: ["\u043A\u0440\u0430\u0441\u043D\u044B\u0439 \u043C\u043E\u0437\u0433"] },
    tier: 1
  },
  {
    id: "chrzastka-stawowa",
    paragraph: P.motion.joints,
    name: { pl: "chrz\u0105stka stawowa", ru: "\u0441\u0443\u0441\u0442\u0430\u0432\u043D\u043E\u0439 \u0445\u0440\u044F\u0449" },
    role: { pl: "zmniejszanie tarcia mi\u0119dzy ko\u015B\u0107mi w stawie", ru: "\u0441\u043D\u0438\u0436\u0435\u043D\u0438\u0435 \u0442\u0440\u0435\u043D\u0438\u044F \u043C\u0435\u0436\u0434\u0443 \u043A\u043E\u0441\u0442\u044F\u043C\u0438 \u0432 \u0441\u0443\u0441\u0442\u0430\u0432\u0435" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "maz-stawowa",
    paragraph: P.motion.joints,
    name: { pl: "ma\u017A stawowa", ru: "\u0441\u0438\u043D\u043E\u0432\u0438\u0430\u043B\u044C\u043D\u0430\u044F \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u044C" },
    role: { pl: "nawil\u017Canie i od\u017Cywianie chrz\u0105stki wewn\u0105trz jamy stawowej", ru: "\u0443\u0432\u043B\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u0438 \u043F\u0438\u0442\u0430\u043D\u0438\u0435 \u0445\u0440\u044F\u0449\u0430 \u0432\u043D\u0443\u0442\u0440\u0438 \u0441\u0443\u0441\u0442\u0430\u0432\u043D\u043E\u0439 \u043F\u043E\u043B\u043E\u0441\u0442\u0438" },
    aliases: { pl: ["p\u0142yn stawowy"], ru: ["\u0441\u0438\u043D\u043E\u0432\u0438\u044F"] },
    tier: 2
  },
  {
    id: "wiezadla",
    paragraph: P.motion.joints,
    name: { pl: "wi\u0119zad\u0142a", ru: "\u0441\u0432\u044F\u0437\u043A\u0438" },
    role: { pl: "wzmacnianie stawu przez po\u0142\u0105czenie ko\u015Bci ze sob\u0105", ru: "\u0443\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u0441\u0443\u0441\u0442\u0430\u0432\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435\u043C \u043A\u043E\u0441\u0442\u0435\u0439 \u043C\u0435\u0436\u0434\u0443 \u0441\u043E\u0431\u043E\u0439" },
    aliases: { pl: ["wi\u0119zad\u0142o"], ru: ["\u0441\u0432\u044F\u0437\u043A\u0430"] },
    tier: 1
  },
  {
    id: "sciegno",
    paragraph: P.motion.muscles,
    name: { pl: "\u015Bci\u0119gno", ru: "\u0441\u0443\u0445\u043E\u0436\u0438\u043B\u0438\u0435" },
    role: { pl: "przenoszenie si\u0142y skurczu mi\u0119\u015Bnia na ko\u015B\u0107", ru: "\u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430 \u0441\u0438\u043B\u044B \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u043C\u044B\u0448\u0446\u044B \u043D\u0430 \u043A\u043E\u0441\u0442\u044C" },
    aliases: { pl: ["\u015Bci\u0119gna"], ru: ["\u0441\u0443\u0445\u043E\u0436\u0438\u043B\u0438\u044F"] },
    tier: 1
  },
  {
    id: "sarkomer",
    paragraph: P.motion.muscles,
    name: { pl: "sarkomer", ru: "\u0441\u0430\u0440\u043A\u043E\u043C\u0435\u0440" },
    role: { pl: "podstawowa jednostka kurczliwa mi\u0119\u015Bnia mi\u0119dzy dwiema liniami Z", ru: "\u043E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u0441\u043E\u043A\u0440\u0430\u0442\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0435\u0434\u0438\u043D\u0438\u0446\u0430 \u043C\u044B\u0448\u0446\u044B \u043C\u0435\u0436\u0434\u0443 \u0434\u0432\u0443\u043C\u044F Z-\u043B\u0438\u043D\u0438\u044F\u043C\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 3
  },
  {
    id: "aktyna-miozyna",
    paragraph: P.motion.muscles,
    name: { pl: "aktyna i miozyna", ru: "\u0430\u043A\u0442\u0438\u043D \u0438 \u043C\u0438\u043E\u0437\u0438\u043D" },
    role: { pl: "wsuwanie si\u0119 filament\xF3w wzgl\u0119dem siebie, co skraca w\u0142\xF3kno mi\u0119\u015Bniowe", ru: "\u0441\u043A\u043E\u043B\u044C\u0436\u0435\u043D\u0438\u0435 \u0444\u0438\u043B\u0430\u043C\u0435\u043D\u0442\u043E\u0432 \u0434\u0440\u0443\u0433 \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0434\u0440\u0443\u0433\u0430, \u0443\u043A\u043E\u0440\u0430\u0447\u0438\u0432\u0430\u044E\u0449\u0435\u0435 \u043C\u044B\u0448\u0435\u0447\u043D\u043E\u0435 \u0432\u043E\u043B\u043E\u043A\u043D\u043E" },
    aliases: { pl: ["miofilamenty"], ru: ["\u043C\u0438\u043E\u0444\u0438\u043B\u0430\u043C\u0435\u043D\u0442\u044B"] },
    tier: 2
  },
  {
    id: "antagonisci",
    paragraph: P.motion.muscles,
    name: { pl: "mi\u0119\u015Bnie antagonistyczne", ru: "\u043C\u044B\u0448\u0446\u044B-\u0430\u043D\u0442\u0430\u0433\u043E\u043D\u0438\u0441\u0442\u044B" },
    role: { pl: "wykonywanie ruch\xF3w przeciwstawnych, jak zginanie i prostowanie", ru: "\u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u043F\u043E\u043B\u043E\u0436\u043D\u044B\u0445 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0439, \u0442\u0430\u043A\u0438\u0445 \u043A\u0430\u043A \u0441\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u0438 \u0440\u0430\u0437\u0433\u0438\u0431\u0430\u043D\u0438\u0435" },
    aliases: { pl: ["antagoni\u015Bci"], ru: ["\u0430\u043D\u0442\u0430\u0433\u043E\u043D\u0438\u0441\u0442\u044B"] },
    tier: 1
  },
  {
    id: "szkielet-osiowy",
    paragraph: P.motion.bones,
    name: { pl: "szkielet osiowy", ru: "\u043E\u0441\u0435\u0432\u043E\u0439 \u0441\u043A\u0435\u043B\u0435\u0442" },
    role: { pl: "czaszka, kr\u0119gos\u0142up i klatka piersiowa, os\u0142aniaj\u0105ce narz\u0105dy wewn\u0119trzne", ru: "\u0447\u0435\u0440\u0435\u043F, \u043F\u043E\u0437\u0432\u043E\u043D\u043E\u0447\u043D\u0438\u043A \u0438 \u0433\u0440\u0443\u0434\u043D\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430, \u0437\u0430\u0449\u0438\u0449\u0430\u044E\u0449\u0438\u0435 \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0435 \u043E\u0440\u0433\u0430\u043D\u044B" },
    aliases: { pl: [], ru: [] },
    tier: 1
  }
];
var DIGESTIVE_ORGANS = [
  {
    id: "slinianki",
    paragraph: P.digestion.structure,
    name: { pl: "\u015Blinianki", ru: "\u0441\u043B\u044E\u043D\u043D\u044B\u0435 \u0436\u0435\u043B\u0435\u0437\u044B" },
    role: { pl: "wydzielanie \u015Bliny z amylaz\u0105, rozpoczynaj\u0105c\u0105 trawienie skrobi", ru: "\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0441\u043B\u044E\u043D\u044B \u0441 \u0430\u043C\u0438\u043B\u0430\u0437\u043E\u0439, \u043D\u0430\u0447\u0438\u043D\u0430\u044E\u0449\u0435\u0439 \u043F\u0435\u0440\u0435\u0432\u0430\u0440\u0438\u0432\u0430\u043D\u0438\u0435 \u043A\u0440\u0430\u0445\u043C\u0430\u043B\u0430" },
    aliases: { pl: ["gruczo\u0142y \u015Blinowe"], ru: ["\u0441\u043B\u044E\u043D\u043D\u0430\u044F \u0436\u0435\u043B\u0435\u0437\u0430"] },
    tier: 1
  },
  {
    id: "przelyk",
    paragraph: P.digestion.structure,
    name: { pl: "prze\u0142yk", ru: "\u043F\u0438\u0449\u0435\u0432\u043E\u0434" },
    role: { pl: "przesuwanie k\u0119sa do \u017Co\u0142\u0105dka ruchami perystaltycznymi", ru: "\u043F\u0440\u043E\u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u043F\u0438\u0449\u0435\u0432\u043E\u0433\u043E \u043A\u043E\u043C\u043A\u0430 \u0432 \u0436\u0435\u043B\u0443\u0434\u043E\u043A \u043F\u0435\u0440\u0438\u0441\u0442\u0430\u043B\u044C\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u043C\u0438 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F\u043C\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "zoladek",
    paragraph: P.digestion.structure,
    name: { pl: "\u017Co\u0142\u0105dek", ru: "\u0436\u0435\u043B\u0443\u0434\u043E\u043A" },
    role: { pl: "trawienie bia\u0142ek w kwa\u015Bnym \u015Brodowisku kwasu solnego", ru: "\u043F\u0435\u0440\u0435\u0432\u0430\u0440\u0438\u0432\u0430\u043D\u0438\u0435 \u0431\u0435\u043B\u043A\u043E\u0432 \u0432 \u043A\u0438\u0441\u043B\u043E\u0439 \u0441\u0440\u0435\u0434\u0435 \u0441\u043E\u043B\u044F\u043D\u043E\u0439 \u043A\u0438\u0441\u043B\u043E\u0442\u044B" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "dwunastnica",
    paragraph: P.digestion.structure,
    name: { pl: "dwunastnica", ru: "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u0438\u043F\u0435\u0440\u0441\u0442\u043D\u0430\u044F \u043A\u0438\u0448\u043A\u0430" },
    role: { pl: "przyjmowanie soku trzustkowego i \u017C\xF3\u0142ci, gdzie zachodzi wi\u0119kszo\u015B\u0107 trawienia", ru: "\u043F\u0440\u0438\u0451\u043C \u043F\u0430\u043D\u043A\u0440\u0435\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0441\u043E\u043A\u0430 \u0438 \u0436\u0451\u043B\u0447\u0438, \u0433\u0434\u0435 \u0438\u0434\u0451\u0442 \u0431\u043E\u043B\u044C\u0448\u0430\u044F \u0447\u0430\u0441\u0442\u044C \u043F\u0435\u0440\u0435\u0432\u0430\u0440\u0438\u0432\u0430\u043D\u0438\u044F" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "jelito-cienkie",
    paragraph: P.digestion.structure,
    name: { pl: "jelito cienkie", ru: "\u0442\u043E\u043D\u043A\u0430\u044F \u043A\u0438\u0448\u043A\u0430" },
    role: { pl: "wch\u0142anianie strawionych sk\u0142adnik\xF3w przez kosmki jelitowe", ru: "\u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u0435 \u043F\u0435\u0440\u0435\u0432\u0430\u0440\u0435\u043D\u043D\u044B\u0445 \u0432\u0435\u0449\u0435\u0441\u0442\u0432 \u0447\u0435\u0440\u0435\u0437 \u043A\u0438\u0448\u0435\u0447\u043D\u044B\u0435 \u0432\u043E\u0440\u0441\u0438\u043D\u043A\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "kosmki",
    paragraph: P.digestion.structure,
    name: { pl: "kosmki jelitowe", ru: "\u043A\u0438\u0448\u0435\u0447\u043D\u044B\u0435 \u0432\u043E\u0440\u0441\u0438\u043D\u043A\u0438" },
    role: { pl: "wielokrotne zwi\u0119kszanie powierzchni wch\u0142aniania", ru: "\u043C\u043D\u043E\u0433\u043E\u043A\u0440\u0430\u0442\u043D\u043E\u0435 \u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u0438\u0435 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0438 \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u044F" },
    aliases: { pl: ["kosmek jelitowy"], ru: ["\u0432\u043E\u0440\u0441\u0438\u043D\u043A\u0430"] },
    tier: 1
  },
  {
    id: "jelito-grube",
    paragraph: P.digestion.structure,
    name: { pl: "jelito grube", ru: "\u0442\u043E\u043B\u0441\u0442\u0430\u044F \u043A\u0438\u0448\u043A\u0430" },
    role: { pl: "wch\u0142anianie wody i zag\u0119szczanie resztek pokarmowych", ru: "\u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u0435 \u0432\u043E\u0434\u044B \u0438 \u0441\u0433\u0443\u0449\u0435\u043D\u0438\u0435 \u043D\u0435\u043F\u0435\u0440\u0435\u0432\u0430\u0440\u0435\u043D\u043D\u044B\u0445 \u043E\u0441\u0442\u0430\u0442\u043A\u043E\u0432" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "watroba",
    paragraph: P.digestion.structure,
    name: { pl: "w\u0105troba", ru: "\u043F\u0435\u0447\u0435\u043D\u044C" },
    role: { pl: "wytwarzanie \u017C\xF3\u0142ci, odtruwanie i magazynowanie glikogenu", ru: "\u0432\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0436\u0451\u043B\u0447\u0438, \u043E\u0431\u0435\u0437\u0432\u0440\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u0438 \u0437\u0430\u043F\u0430\u0441\u0430\u043D\u0438\u0435 \u0433\u043B\u0438\u043A\u043E\u0433\u0435\u043D\u0430" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "zolc",
    paragraph: P.digestion.processes,
    name: { pl: "\u017C\xF3\u0142\u0107", ru: "\u0436\u0451\u043B\u0447\u044C" },
    role: { pl: "emulgowanie t\u0142uszcz\xF3w, bez udzia\u0142u w\u0142asnych enzym\xF3w", ru: "\u044D\u043C\u0443\u043B\u044C\u0433\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0436\u0438\u0440\u043E\u0432, \u0431\u0435\u0437 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0445 \u0444\u0435\u0440\u043C\u0435\u043D\u0442\u043E\u0432" },
    aliases: { pl: [], ru: ["\u0436\u0435\u043B\u0447\u044C"] },
    tier: 2
  },
  {
    id: "trzustka",
    paragraph: P.digestion.structure,
    name: { pl: "trzustka", ru: "\u043F\u043E\u0434\u0436\u0435\u043B\u0443\u0434\u043E\u0447\u043D\u0430\u044F \u0436\u0435\u043B\u0435\u0437\u0430" },
    role: { pl: "wydzielanie soku z enzymami trawi\u0105cymi wszystkie grupy sk\u0142adnik\xF3w pokarmowych", ru: "\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0441\u043E\u043A\u0430 \u0441 \u0444\u0435\u0440\u043C\u0435\u043D\u0442\u0430\u043C\u0438, \u043F\u0435\u0440\u0435\u0432\u0430\u0440\u0438\u0432\u0430\u044E\u0449\u0438\u043C\u0438 \u0432\u0441\u0435 \u0433\u0440\u0443\u043F\u043F\u044B \u043F\u0438\u0442\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0432\u0435\u0449\u0435\u0441\u0442\u0432" },
    aliases: { pl: [], ru: [] },
    tier: 1
  }
];
var ENZYMES = [
  {
    id: "amylaza",
    name: { pl: "amylaza", ru: "\u0430\u043C\u0438\u043B\u0430\u0437\u0430" },
    role: { pl: "rozk\u0142ad skrobi do dwucukr\xF3w, dzia\u0142aj\u0105cy w jamie ustnej i dwunastnicy", ru: "\u0440\u0430\u0441\u0449\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u043A\u0440\u0430\u0445\u043C\u0430\u043B\u0430 \u0434\u043E \u0434\u0438\u0441\u0430\u0445\u0430\u0440\u0438\u0434\u043E\u0432, \u0440\u0430\u0431\u043E\u0442\u0430\u044E\u0449\u0435\u0435 \u0432\u043E \u0440\u0442\u0443 \u0438 \u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u0438\u043F\u0435\u0440\u0441\u0442\u043D\u043E\u0439 \u043A\u0438\u0448\u043A\u0435" },
    aliases: { pl: ["ptialina"], ru: ["\u043F\u0442\u0438\u0430\u043B\u0438\u043D"] },
    tier: 1
  },
  {
    id: "pepsyna",
    name: { pl: "pepsyna", ru: "\u043F\u0435\u043F\u0441\u0438\u043D" },
    role: { pl: "rozk\u0142ad bia\u0142ek w kwa\u015Bnym soku \u017Co\u0142\u0105dkowym", ru: "\u0440\u0430\u0441\u0449\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u0431\u0435\u043B\u043A\u043E\u0432 \u0432 \u043A\u0438\u0441\u043B\u043E\u043C \u0436\u0435\u043B\u0443\u0434\u043E\u0447\u043D\u043E\u043C \u0441\u043E\u043A\u0435" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "trypsyna",
    name: { pl: "trypsyna", ru: "\u0442\u0440\u0438\u043F\u0441\u0438\u043D" },
    role: { pl: "rozk\u0142ad bia\u0142ek w zasadowym \u015Brodowisku jelita cienkiego", ru: "\u0440\u0430\u0441\u0449\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u0431\u0435\u043B\u043A\u043E\u0432 \u0432 \u0449\u0435\u043B\u043E\u0447\u043D\u043E\u0439 \u0441\u0440\u0435\u0434\u0435 \u0442\u043E\u043D\u043A\u043E\u0439 \u043A\u0438\u0448\u043A\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "lipaza",
    name: { pl: "lipaza", ru: "\u043B\u0438\u043F\u0430\u0437\u0430" },
    role: { pl: "rozk\u0142ad t\u0142uszcz\xF3w do kwas\xF3w t\u0142uszczowych i glicerolu", ru: "\u0440\u0430\u0441\u0449\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u0436\u0438\u0440\u043E\u0432 \u0434\u043E \u0436\u0438\u0440\u043D\u044B\u0445 \u043A\u0438\u0441\u043B\u043E\u0442 \u0438 \u0433\u043B\u0438\u0446\u0435\u0440\u0438\u043D\u0430" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "maltaza",
    name: { pl: "maltaza", ru: "\u043C\u0430\u043B\u044C\u0442\u0430\u0437\u0430" },
    role: { pl: "rozk\u0142ad maltozy do dw\xF3ch cz\u0105steczek glukozy", ru: "\u0440\u0430\u0441\u0449\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u043C\u0430\u043B\u044C\u0442\u043E\u0437\u044B \u0434\u043E \u0434\u0432\u0443\u0445 \u043C\u043E\u043B\u0435\u043A\u0443\u043B \u0433\u043B\u044E\u043A\u043E\u0437\u044B" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "laktaza",
    name: { pl: "laktaza", ru: "\u043B\u0430\u043A\u0442\u0430\u0437\u0430" },
    role: { pl: "rozk\u0142ad cukru mlecznego; jej brak powoduje nietolerancj\u0119 laktozy", ru: "\u0440\u0430\u0441\u0449\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u043C\u043E\u043B\u043E\u0447\u043D\u043E\u0433\u043E \u0441\u0430\u0445\u0430\u0440\u0430; \u0435\u0451 \u043D\u0435\u0445\u0432\u0430\u0442\u043A\u0430 \u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u043D\u0435\u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0438\u043C\u043E\u0441\u0442\u044C \u043B\u0430\u043A\u0442\u043E\u0437\u044B" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "nukleaza",
    name: { pl: "nukleazy", ru: "\u043D\u0443\u043A\u043B\u0435\u0430\u0437\u044B" },
    role: { pl: "rozk\u0142ad kwas\xF3w nukleinowych do nukleotyd\xF3w", ru: "\u0440\u0430\u0441\u0449\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u043D\u0443\u043A\u043B\u0435\u0438\u043D\u043E\u0432\u044B\u0445 \u043A\u0438\u0441\u043B\u043E\u0442 \u0434\u043E \u043D\u0443\u043A\u043B\u0435\u043E\u0442\u0438\u0434\u043E\u0432" },
    aliases: { pl: ["nukleaza"], ru: ["\u043D\u0443\u043A\u043B\u0435\u0430\u0437\u0430"] },
    tier: 3
  }
];
var NERVOUS_PARTS = [
  {
    id: "dendryt",
    paragraph: P.nervous.structure,
    name: { pl: "dendryt", ru: "\u0434\u0435\u043D\u0434\u0440\u0438\u0442" },
    role: { pl: "odbieranie sygna\u0142\xF3w i przewodzenie ich w stron\u0119 cia\u0142a kom\xF3rki", ru: "\u043F\u0440\u0438\u0451\u043C \u0441\u0438\u0433\u043D\u0430\u043B\u043E\u0432 \u0438 \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u0438\u0445 \u043A \u0442\u0435\u043B\u0443 \u043A\u043B\u0435\u0442\u043A\u0438" },
    aliases: { pl: ["dendryty"], ru: ["\u0434\u0435\u043D\u0434\u0440\u0438\u0442\u044B"] },
    tier: 1
  },
  {
    id: "akson",
    paragraph: P.nervous.structure,
    name: { pl: "akson", ru: "\u0430\u043A\u0441\u043E\u043D" },
    role: { pl: "przewodzenie impulsu od cia\u0142a kom\xF3rki do innych kom\xF3rek", ru: "\u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u0438\u043C\u043F\u0443\u043B\u044C\u0441\u0430 \u043E\u0442 \u0442\u0435\u043B\u0430 \u043A\u043B\u0435\u0442\u043A\u0438 \u043A \u0434\u0440\u0443\u0433\u0438\u043C \u043A\u043B\u0435\u0442\u043A\u0430\u043C" },
    aliases: { pl: ["neuryt"], ru: ["\u043D\u0435\u0439\u0440\u0438\u0442"] },
    tier: 1
  },
  {
    id: "oslonka-mielinowa",
    paragraph: P.nervous.structure,
    name: { pl: "os\u0142onka mielinowa", ru: "\u043C\u0438\u0435\u043B\u0438\u043D\u043E\u0432\u0430\u044F \u043E\u0431\u043E\u043B\u043E\u0447\u043A\u0430" },
    role: { pl: "przyspieszanie przewodzenia dzi\u0119ki przeskakiwaniu impulsu mi\u0119dzy przew\u0119\u017Ceniami", ru: "\u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u044F \u0437\u0430 \u0441\u0447\u0451\u0442 \u0441\u043A\u0430\u0447\u043A\u043E\u0432 \u0438\u043C\u043F\u0443\u043B\u044C\u0441\u0430 \u043C\u0435\u0436\u0434\u0443 \u043F\u0435\u0440\u0435\u0445\u0432\u0430\u0442\u0430\u043C\u0438" },
    aliases: { pl: ["mielina"], ru: ["\u043C\u0438\u0435\u043B\u0438\u043D"] },
    tier: 2
  },
  {
    id: "synapsa",
    paragraph: P.nervous.structure,
    name: { pl: "synapsa", ru: "\u0441\u0438\u043D\u0430\u043F\u0441" },
    role: { pl: "przekazywanie sygna\u0142u mi\u0119dzy kom\xF3rkami za pomoc\u0105 neuroprzeka\u017Anika", ru: "\u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430 \u0441\u0438\u0433\u043D\u0430\u043B\u0430 \u043C\u0435\u0436\u0434\u0443 \u043A\u043B\u0435\u0442\u043A\u0430\u043C\u0438 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u043D\u0435\u0439\u0440\u043E\u043C\u0435\u0434\u0438\u0430\u0442\u043E\u0440\u0430" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "potencjal-spoczynkowy",
    paragraph: P.nervous.structure,
    name: { pl: "potencja\u0142 spoczynkowy", ru: "\u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B \u043F\u043E\u043A\u043E\u044F" },
    role: { pl: "ujemny \u0142adunek wn\u0119trza kom\xF3rki utrzymywany przez pomp\u0119 sodowo-potasow\u0105", ru: "\u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0437\u0430\u0440\u044F\u0434 \u0432\u043D\u0443\u0442\u0440\u0438 \u043A\u043B\u0435\u0442\u043A\u0438, \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043C\u044B\u0439 \u043D\u0430\u0442\u0440\u0438\u0439-\u043A\u0430\u043B\u0438\u0435\u0432\u044B\u043C \u043D\u0430\u0441\u043E\u0441\u043E\u043C" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "potencjal-czynnosciowy",
    paragraph: P.nervous.structure,
    name: { pl: "potencja\u0142 czynno\u015Bciowy", ru: "\u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F" },
    role: { pl: "gwa\u0142towna zmiana \u0142adunku po przekroczeniu progu, zgodna z zasad\u0105 wszystko albo nic", ru: "\u0440\u0435\u0437\u043A\u043E\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0437\u0430\u0440\u044F\u0434\u0430 \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u0438\u044F \u043F\u043E\u0440\u043E\u0433\u0430, \u043F\u043E \u043F\u0440\u0438\u043D\u0446\u0438\u043F\u0443 \xAB\u0432\u0441\u0451 \u0438\u043B\u0438 \u043D\u0438\u0447\u0435\u0433\u043E\xBB" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "luk-odruchowy",
    paragraph: P.nervous.peripheral,
    name: { pl: "\u0142uk odruchowy", ru: "\u0440\u0435\u0444\u043B\u0435\u043A\u0442\u043E\u0440\u043D\u0430\u044F \u0434\u0443\u0433\u0430" },
    role: { pl: "droga od receptora przez neurony do efektora, pomijaj\u0105ca \u015Bwiadom\u0105 decyzj\u0119", ru: "\u043F\u0443\u0442\u044C \u043E\u0442 \u0440\u0435\u0446\u0435\u043F\u0442\u043E\u0440\u0430 \u0447\u0435\u0440\u0435\u0437 \u043D\u0435\u0439\u0440\u043E\u043D\u044B \u043A \u044D\u0444\u0444\u0435\u043A\u0442\u043E\u0440\u0443, \u043C\u0438\u043D\u0443\u044E\u0449\u0438\u0439 \u0441\u043E\u0437\u043D\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u0435" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "rdzen-kregowy",
    paragraph: P.nervous.central,
    name: { pl: "rdze\u0144 kr\u0119gowy", ru: "\u0441\u043F\u0438\u043D\u043D\u043E\u0439 \u043C\u043E\u0437\u0433" },
    role: { pl: "o\u015Brodek odruch\xF3w bezwarunkowych i droga mi\u0119dzy m\xF3zgowiem a reszt\u0105 cia\u0142a", ru: "\u0446\u0435\u043D\u0442\u0440 \u0431\u0435\u0437\u0443\u0441\u043B\u043E\u0432\u043D\u044B\u0445 \u0440\u0435\u0444\u043B\u0435\u043A\u0441\u043E\u0432 \u0438 \u043F\u0443\u0442\u044C \u043C\u0435\u0436\u0434\u0443 \u0433\u043E\u043B\u043E\u0432\u043D\u044B\u043C \u043C\u043E\u0437\u0433\u043E\u043C \u0438 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u043C \u0442\u0435\u043B\u043E\u043C" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "kora-mozgu",
    paragraph: P.nervous.central,
    name: { pl: "kora m\xF3zgu", ru: "\u043A\u043E\u0440\u0430 \u0431\u043E\u043B\u044C\u0448\u0438\u0445 \u043F\u043E\u043B\u0443\u0448\u0430\u0440\u0438\u0439" },
    role: { pl: "o\u015Brodki \u015Bwiadomych czynno\u015Bci, mowy i pami\u0119ci", ru: "\u0446\u0435\u043D\u0442\u0440\u044B \u0441\u043E\u0437\u043D\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439, \u0440\u0435\u0447\u0438 \u0438 \u043F\u0430\u043C\u044F\u0442\u0438" },
    aliases: { pl: ["kora m\xF3zgowa"], ru: ["\u043A\u043E\u0440\u0430 \u043C\u043E\u0437\u0433\u0430"] },
    tier: 1
  },
  {
    id: "mozdzek",
    paragraph: P.nervous.central,
    name: { pl: "m\xF3\u017Cd\u017Cek", ru: "\u043C\u043E\u0437\u0436\u0435\u0447\u043E\u043A" },
    role: { pl: "koordynacja ruch\xF3w, napi\u0119cie mi\u0119\u015Bni i utrzymanie r\xF3wnowagi", ru: "\u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0446\u0438\u044F \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0439, \u0442\u043E\u043D\u0443\u0441 \u043C\u044B\u0448\u0446 \u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u0440\u0430\u0432\u043D\u043E\u0432\u0435\u0441\u0438\u044F" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "rdzen-przedluzony",
    paragraph: P.nervous.central,
    name: { pl: "rdze\u0144 przed\u0142u\u017Cony", ru: "\u043F\u0440\u043E\u0434\u043E\u043B\u0433\u043E\u0432\u0430\u0442\u044B\u0439 \u043C\u043E\u0437\u0433" },
    role: { pl: "o\u015Brodki oddychania, pracy serca i odruch\xF3w kaszlu oraz kichania", ru: "\u0446\u0435\u043D\u0442\u0440\u044B \u0434\u044B\u0445\u0430\u043D\u0438\u044F, \u0440\u0430\u0431\u043E\u0442\u044B \u0441\u0435\u0440\u0434\u0446\u0430 \u0438 \u0440\u0435\u0444\u043B\u0435\u043A\u0441\u043E\u0432 \u043A\u0430\u0448\u043B\u044F \u0438 \u0447\u0438\u0445\u0430\u043D\u0438\u044F" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "podwzgorze",
    paragraph: P.nervous.central,
    name: { pl: "podwzg\xF3rze", ru: "\u0433\u0438\u043F\u043E\u0442\u0430\u043B\u0430\u043C\u0443\u0441" },
    role: { pl: "sterowanie temperatur\u0105, g\u0142odem, pragnieniem i przysadk\u0105", ru: "\u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u043E\u0439, \u0433\u043E\u043B\u043E\u0434\u043E\u043C, \u0436\u0430\u0436\u0434\u043E\u0439 \u0438 \u0433\u0438\u043F\u043E\u0444\u0438\u0437\u043E\u043C" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "wspolczulny",
    paragraph: P.nervous.autonomic,
    name: { pl: "uk\u0142ad wsp\xF3\u0142czulny", ru: "\u0441\u0438\u043C\u043F\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430" },
    role: { pl: "mobilizowanie organizmu do wysi\u0142ku: przyspieszenie serca, rozszerzenie \u017Arenic", ru: "\u043C\u043E\u0431\u0438\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C\u0430 \u043A \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0435: \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435 \u0441\u0435\u0440\u0434\u0446\u0430, \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u0437\u0440\u0430\u0447\u043A\u043E\u0432" },
    aliases: { pl: ["sympatyczny"], ru: ["\u0441\u0438\u043C\u043F\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043E\u0442\u0434\u0435\u043B"] },
    tier: 2
  },
  {
    id: "przywspolczulny",
    paragraph: P.nervous.autonomic,
    name: { pl: "uk\u0142ad przywsp\xF3\u0142czulny", ru: "\u043F\u0430\u0440\u0430\u0441\u0438\u043C\u043F\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430" },
    role: { pl: "sterowanie odpoczynkiem i trawieniem: zwolnienie serca, pobudzenie jelit", ru: "\u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u0434\u044B\u0445\u043E\u043C \u0438 \u043F\u0438\u0449\u0435\u0432\u0430\u0440\u0435\u043D\u0438\u0435\u043C: \u0437\u0430\u043C\u0435\u0434\u043B\u0435\u043D\u0438\u0435 \u0441\u0435\u0440\u0434\u0446\u0430, \u0443\u0441\u0438\u043B\u0435\u043D\u0438\u0435 \u0440\u0430\u0431\u043E\u0442\u044B \u043A\u0438\u0448\u0435\u0447\u043D\u0438\u043A\u0430" },
    aliases: { pl: ["parasympatyczny"], ru: ["\u043F\u0430\u0440\u0430\u0441\u0438\u043C\u043F\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043E\u0442\u0434\u0435\u043B"] },
    tier: 2
  }
];
var SENSE_PARTS = [
  {
    id: "rogowka",
    paragraph: P.senses.vision,
    name: { pl: "rog\xF3wka", ru: "\u0440\u043E\u0433\u043E\u0432\u0438\u0446\u0430" },
    role: { pl: "przezroczysta przednia cz\u0119\u015B\u0107 tward\xF3wki, najsilniej za\u0142amuj\u0105ca \u015Bwiat\u0142o", ru: "\u043F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u0430\u044F \u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0447\u0430\u0441\u0442\u044C \u0441\u043A\u043B\u0435\u0440\u044B, \u0441\u0438\u043B\u044C\u043D\u0435\u0435 \u0432\u0441\u0435\u0433\u043E \u043F\u0440\u0435\u043B\u043E\u043C\u043B\u044F\u044E\u0449\u0430\u044F \u0441\u0432\u0435\u0442" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "tecza",
    paragraph: P.senses.vision,
    name: { pl: "t\u0119cz\xF3wka", ru: "\u0440\u0430\u0434\u0443\u0436\u043A\u0430" },
    role: { pl: "regulowanie ilo\u015Bci wpadaj\u0105cego \u015Bwiat\u0142a zmian\u0105 wielko\u015Bci \u017Arenicy", ru: "\u0440\u0435\u0433\u0443\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u0432\u0445\u043E\u0434\u044F\u0449\u0435\u0433\u043E \u0441\u0432\u0435\u0442\u0430 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435\u043C \u0440\u0430\u0437\u043C\u0435\u0440\u0430 \u0437\u0440\u0430\u0447\u043A\u0430" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "soczewka",
    paragraph: P.senses.vision,
    name: { pl: "soczewka", ru: "\u0445\u0440\u0443\u0441\u0442\u0430\u043B\u0438\u043A" },
    role: { pl: "zmiana kszta\u0142tu podczas akomodacji, by ostro widzie\u0107 z r\xF3\u017Cnych odleg\u0142o\u015Bci", ru: "\u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0444\u043E\u0440\u043C\u044B \u043F\u0440\u0438 \u0430\u043A\u043A\u043E\u043C\u043E\u0434\u0430\u0446\u0438\u0438, \u0447\u0442\u043E\u0431\u044B \u0440\u0435\u0437\u043A\u043E \u0432\u0438\u0434\u0435\u0442\u044C \u0441 \u0440\u0430\u0437\u043D\u044B\u0445 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "siatkowka",
    paragraph: P.senses.vision,
    name: { pl: "siatk\xF3wka", ru: "\u0441\u0435\u0442\u0447\u0430\u0442\u043A\u0430" },
    role: { pl: "warstwa z czopkami i pr\u0119cikami, w kt\xF3rej powstaje obraz", ru: "\u0441\u043B\u043E\u0439 \u0441 \u043A\u043E\u043B\u0431\u043E\u0447\u043A\u0430\u043C\u0438 \u0438 \u043F\u0430\u043B\u043E\u0447\u043A\u0430\u043C\u0438, \u0432 \u043A\u043E\u0442\u043E\u0440\u043E\u043C \u0432\u043E\u0437\u043D\u0438\u043A\u0430\u0435\u0442 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "czopki",
    paragraph: P.senses.vision,
    name: { pl: "czopki", ru: "\u043A\u043E\u043B\u0431\u043E\u0447\u043A\u0438" },
    role: { pl: "widzenie barw przy dobrym o\u015Bwietleniu, skupione w plamce \u017C\xF3\u0142tej", ru: "\u0446\u0432\u0435\u0442\u043D\u043E\u0435 \u0437\u0440\u0435\u043D\u0438\u0435 \u043F\u0440\u0438 \u0445\u043E\u0440\u043E\u0448\u0435\u043C \u043E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0438, \u0441\u043E\u0441\u0440\u0435\u0434\u043E\u0442\u043E\u0447\u0435\u043D\u043D\u043E\u0435 \u0432 \u0436\u0451\u043B\u0442\u043E\u043C \u043F\u044F\u0442\u043D\u0435" },
    aliases: { pl: ["czopek"], ru: ["\u043A\u043E\u043B\u0431\u043E\u0447\u043A\u0430"] },
    tier: 1
  },
  {
    id: "preciki",
    paragraph: P.senses.vision,
    name: { pl: "pr\u0119ciki", ru: "\u043F\u0430\u043B\u043E\u0447\u043A\u0438" },
    role: { pl: "widzenie o zmierzchu, wra\u017Cliwe na nat\u0119\u017Cenie, ale nie na barw\u0119", ru: "\u0441\u0443\u043C\u0435\u0440\u0435\u0447\u043D\u043E\u0435 \u0437\u0440\u0435\u043D\u0438\u0435, \u0447\u0443\u0432\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u043A \u044F\u0440\u043A\u043E\u0441\u0442\u0438, \u043D\u043E \u043D\u0435 \u043A \u0446\u0432\u0435\u0442\u0443" },
    aliases: { pl: ["pr\u0119cik"], ru: ["\u043F\u0430\u043B\u043E\u0447\u043A\u0430"] },
    tier: 1
  },
  {
    id: "plamka-slepa",
    paragraph: P.senses.vision,
    name: { pl: "plamka \u015Blepa", ru: "\u0441\u043B\u0435\u043F\u043E\u0435 \u043F\u044F\u0442\u043D\u043E" },
    role: { pl: "miejsce wyj\u015Bcia nerwu wzrokowego, pozbawione fotoreceptor\xF3w", ru: "\u043C\u0435\u0441\u0442\u043E \u0432\u044B\u0445\u043E\u0434\u0430 \u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043D\u0435\u0440\u0432\u0430, \u043B\u0438\u0448\u0451\u043D\u043D\u043E\u0435 \u0444\u043E\u0442\u043E\u0440\u0435\u0446\u0435\u043F\u0442\u043E\u0440\u043E\u0432" },
    aliases: { pl: ["tarcza nerwu wzrokowego"], ru: ["\u0434\u0438\u0441\u043A \u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043D\u0435\u0440\u0432\u0430"] },
    tier: 2
  },
  {
    id: "kosteczki",
    paragraph: P.senses.ear,
    name: { pl: "kosteczki s\u0142uchowe", ru: "\u0441\u043B\u0443\u0445\u043E\u0432\u044B\u0435 \u043A\u043E\u0441\u0442\u043E\u0447\u043A\u0438" },
    role: { pl: "wzmacnianie drga\u0144 b\u0142ony b\u0119benkowej i przekazywanie ich do ucha wewn\u0119trznego", ru: "\u0443\u0441\u0438\u043B\u0435\u043D\u0438\u0435 \u043A\u043E\u043B\u0435\u0431\u0430\u043D\u0438\u0439 \u0431\u0430\u0440\u0430\u0431\u0430\u043D\u043D\u043E\u0439 \u043F\u0435\u0440\u0435\u043F\u043E\u043D\u043A\u0438 \u0438 \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430 \u0438\u0445 \u0432\u043E \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0435 \u0443\u0445\u043E" },
    aliases: { pl: ["m\u0142oteczek", "kowade\u0142ko", "strzemi\u0105czko"], ru: ["\u043C\u043E\u043B\u043E\u0442\u043E\u0447\u0435\u043A", "\u043D\u0430\u043A\u043E\u0432\u0430\u043B\u044C\u043D\u044F", "\u0441\u0442\u0440\u0435\u043C\u0435\u0447\u043A\u043E"] },
    tier: 1
  },
  {
    id: "slimak",
    paragraph: P.senses.ear,
    name: { pl: "\u015Blimak", ru: "\u0443\u043B\u0438\u0442\u043A\u0430" },
    role: { pl: "zamiana drga\u0144 p\u0142ynu na impulsy nerwowe w narz\u0105dzie Cortiego", ru: "\u043F\u0440\u0435\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u043A\u043E\u043B\u0435\u0431\u0430\u043D\u0438\u0439 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0438 \u0432 \u043D\u0435\u0440\u0432\u043D\u044B\u0435 \u0438\u043C\u043F\u0443\u043B\u044C\u0441\u044B \u0432 \u043A\u043E\u0440\u0442\u0438\u0435\u0432\u043E\u043C \u043E\u0440\u0433\u0430\u043D\u0435" },
    aliases: { pl: ["narz\u0105d Cortiego"], ru: ["\u043A\u043E\u0440\u0442\u0438\u0435\u0432 \u043E\u0440\u0433\u0430\u043D"] },
    tier: 2
  },
  {
    id: "kanaly-polkoliste",
    paragraph: P.senses.ear,
    name: { pl: "kana\u0142y p\xF3\u0142koliste", ru: "\u043F\u043E\u043B\u0443\u043A\u0440\u0443\u0436\u043D\u044B\u0435 \u043A\u0430\u043D\u0430\u043B\u044B" },
    role: { pl: "odbieranie ruch\xF3w obrotowych g\u0142owy jako narz\u0105d r\xF3wnowagi", ru: "\u0432\u043E\u0441\u043F\u0440\u0438\u044F\u0442\u0438\u0435 \u0432\u0440\u0430\u0449\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0439 \u0433\u043E\u043B\u043E\u0432\u044B \u043A\u0430\u043A \u043E\u0440\u0433\u0430\u043D \u0440\u0430\u0432\u043D\u043E\u0432\u0435\u0441\u0438\u044F" },
    aliases: { pl: ["narz\u0105d r\xF3wnowagi"], ru: ["\u0432\u0435\u0441\u0442\u0438\u0431\u0443\u043B\u044F\u0440\u043D\u044B\u0439 \u0430\u043F\u043F\u0430\u0440\u0430\u0442"] },
    tier: 2
  },
  {
    id: "traba-sluchowa",
    paragraph: P.senses.ear,
    name: { pl: "tr\u0105bka s\u0142uchowa", ru: "\u0441\u043B\u0443\u0445\u043E\u0432\u0430\u044F \u0442\u0440\u0443\u0431\u0430" },
    role: { pl: "wyr\xF3wnywanie ci\u015Bnienia po obu stronach b\u0142ony b\u0119benkowej", ru: "\u0432\u044B\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u043D\u0438\u0435 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u043E \u043E\u0431\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B \u0431\u0430\u0440\u0430\u0431\u0430\u043D\u043D\u043E\u0439 \u043F\u0435\u0440\u0435\u043F\u043E\u043D\u043A\u0438" },
    aliases: { pl: ["tr\u0105bka Eustachiusza"], ru: ["\u0435\u0432\u0441\u0442\u0430\u0445\u0438\u0435\u0432\u0430 \u0442\u0440\u0443\u0431\u0430"] },
    tier: 2
  },
  {
    id: "kubki-smakowe",
    paragraph: P.senses["taste-smell"],
    name: { pl: "kubki smakowe", ru: "\u0432\u043A\u0443\u0441\u043E\u0432\u044B\u0435 \u0441\u043E\u0441\u043E\u0447\u043A\u0438" },
    role: { pl: "odbieranie smaku substancji rozpuszczonych w \u015Blinie", ru: "\u0432\u043E\u0441\u043F\u0440\u0438\u044F\u0442\u0438\u0435 \u0432\u043A\u0443\u0441\u0430 \u0432\u0435\u0449\u0435\u0441\u0442\u0432, \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0451\u043D\u043D\u044B\u0445 \u0432 \u0441\u043B\u044E\u043D\u0435" },
    aliases: { pl: ["kubek smakowy"], ru: ["\u0432\u043A\u0443\u0441\u043E\u0432\u0430\u044F \u043F\u043E\u0447\u043A\u0430"] },
    tier: 1
  }
];
var VISION_DEFECTS = [
  {
    id: "krotkowzrocznosc",
    name: { pl: "kr\xF3tkowzroczno\u015B\u0107", ru: "\u0431\u043B\u0438\u0437\u043E\u0440\u0443\u043A\u043E\u0441\u0442\u044C" },
    role: { pl: "ostry obraz powstaje przed siatk\xF3wk\u0105; koryguje si\u0119 soczewk\u0105 rozpraszaj\u0105c\u0105", ru: "\u0440\u0435\u0437\u043A\u043E\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0432\u043E\u0437\u043D\u0438\u043A\u0430\u0435\u0442 \u043F\u0435\u0440\u0435\u0434 \u0441\u0435\u0442\u0447\u0430\u0442\u043A\u043E\u0439; \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u0440\u0430\u0441\u0441\u0435\u0438\u0432\u0430\u044E\u0449\u0435\u0439 \u043B\u0438\u043D\u0437\u043E\u0439" },
    aliases: { pl: ["miopia"], ru: ["\u043C\u0438\u043E\u043F\u0438\u044F"] },
    tier: 1
  },
  {
    id: "dalekowzrocznosc",
    name: { pl: "dalekowzroczno\u015B\u0107", ru: "\u0434\u0430\u043B\u044C\u043D\u043E\u0437\u043E\u0440\u043A\u043E\u0441\u0442\u044C" },
    role: { pl: "ostry obraz powstaje za siatk\xF3wk\u0105; koryguje si\u0119 soczewk\u0105 skupiaj\u0105c\u0105", ru: "\u0440\u0435\u0437\u043A\u043E\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0432\u043E\u0437\u043D\u0438\u043A\u0430\u0435\u0442 \u0437\u0430 \u0441\u0435\u0442\u0447\u0430\u0442\u043A\u043E\u0439; \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u0441\u043E\u0431\u0438\u0440\u0430\u044E\u0449\u0435\u0439 \u043B\u0438\u043D\u0437\u043E\u0439" },
    aliases: { pl: ["nadwzroczno\u015B\u0107"], ru: ["\u0433\u0438\u043F\u0435\u0440\u043C\u0435\u0442\u0440\u043E\u043F\u0438\u044F"] },
    tier: 1
  },
  {
    id: "astygmatyzm",
    name: { pl: "astygmatyzm", ru: "\u0430\u0441\u0442\u0438\u0433\u043C\u0430\u0442\u0438\u0437\u043C" },
    role: { pl: "nier\xF3wna krzywizna rog\xF3wki daje obraz zniekszta\u0142cony w jednym kierunku", ru: "\u043D\u0435\u0440\u043E\u0432\u043D\u0430\u044F \u043A\u0440\u0438\u0432\u0438\u0437\u043D\u0430 \u0440\u043E\u0433\u043E\u0432\u0438\u0446\u044B \u0434\u0430\u0451\u0442 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435, \u0438\u0441\u043A\u0430\u0436\u0451\u043D\u043D\u043E\u0435 \u0432 \u043E\u0434\u043D\u043E\u043C \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "starczowzrocznosc",
    name: { pl: "starczowzroczno\u015B\u0107", ru: "\u043F\u0440\u0435\u0441\u0431\u0438\u043E\u043F\u0438\u044F" },
    role: { pl: "utrata elastyczno\u015Bci soczewki z wiekiem, utrudniaj\u0105ca patrzenie z bliska", ru: "\u043F\u043E\u0442\u0435\u0440\u044F \u044D\u043B\u0430\u0441\u0442\u0438\u0447\u043D\u043E\u0441\u0442\u0438 \u0445\u0440\u0443\u0441\u0442\u0430\u043B\u0438\u043A\u0430 \u0441 \u0432\u043E\u0437\u0440\u0430\u0441\u0442\u043E\u043C, \u043C\u0435\u0448\u0430\u044E\u0449\u0430\u044F \u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0431\u043B\u0438\u0437\u0438" },
    aliases: { pl: ["prezbiopia"], ru: ["\u0441\u0442\u0430\u0440\u0447\u0435\u0441\u043A\u0430\u044F \u0434\u0430\u043B\u044C\u043D\u043E\u0437\u043E\u0440\u043A\u043E\u0441\u0442\u044C"] },
    tier: 2
  },
  {
    id: "daltonizm",
    name: { pl: "daltonizm", ru: "\u0434\u0430\u043B\u044C\u0442\u043E\u043D\u0438\u0437\u043C" },
    role: { pl: "wada czopk\xF3w sprz\u0119\u017Cona z p\u0142ci\u0105, utrudniaj\u0105ca rozr\xF3\u017Cnianie barw", ru: "\u0441\u0446\u0435\u043F\u043B\u0435\u043D\u043D\u044B\u0439 \u0441 \u043F\u043E\u043B\u043E\u043C \u0434\u0435\u0444\u0435\u043A\u0442 \u043A\u043E\u043B\u0431\u043E\u0447\u0435\u043A, \u043C\u0435\u0448\u0430\u044E\u0449\u0438\u0439 \u0440\u0430\u0437\u043B\u0438\u0447\u0430\u0442\u044C \u0446\u0432\u0435\u0442\u0430" },
    aliases: { pl: ["\u015Blepota barw"], ru: ["\u0446\u0432\u0435\u0442\u043E\u0432\u0430\u044F \u0441\u043B\u0435\u043F\u043E\u0442\u0430"] },
    tier: 2
  }
];
var REPRODUCTION_PARTS = [
  {
    id: "jadro",
    paragraph: P.reproduction.male,
    name: { pl: "j\u0105dro", ru: "\u0441\u0435\u043C\u0435\u043D\u043D\u0438\u043A" },
    role: { pl: "wytwarzanie plemnik\xF3w i testosteronu", ru: "\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u043F\u0435\u0440\u043C\u0430\u0442\u043E\u0437\u043E\u0438\u0434\u043E\u0432 \u0438 \u0442\u0435\u0441\u0442\u043E\u0441\u0442\u0435\u0440\u043E\u043D\u0430" },
    aliases: { pl: ["j\u0105dra"], ru: ["\u0441\u0435\u043C\u0435\u043D\u043D\u0438\u043A\u0438", "\u044F\u0438\u0447\u043A\u043E"] },
    tier: 1
  },
  {
    id: "najadrze",
    paragraph: P.reproduction.male,
    name: { pl: "naj\u0105drze", ru: "\u043F\u0440\u0438\u0434\u0430\u0442\u043E\u043A \u0441\u0435\u043C\u0435\u043D\u043D\u0438\u043A\u0430" },
    role: { pl: "dojrzewanie i magazynowanie plemnik\xF3w", ru: "\u0441\u043E\u0437\u0440\u0435\u0432\u0430\u043D\u0438\u0435 \u0438 \u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u0441\u043F\u0435\u0440\u043C\u0430\u0442\u043E\u0437\u043E\u0438\u0434\u043E\u0432" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "jajnik",
    paragraph: P.reproduction.female,
    name: { pl: "jajnik", ru: "\u044F\u0438\u0447\u043D\u0438\u043A" },
    role: { pl: "dojrzewanie kom\xF3rek jajowych i wydzielanie estrogen\xF3w", ru: "\u0441\u043E\u0437\u0440\u0435\u0432\u0430\u043D\u0438\u0435 \u044F\u0439\u0446\u0435\u043A\u043B\u0435\u0442\u043E\u043A \u0438 \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u044D\u0441\u0442\u0440\u043E\u0433\u0435\u043D\u043E\u0432" },
    aliases: { pl: ["jajniki"], ru: ["\u044F\u0438\u0447\u043D\u0438\u043A\u0438"] },
    tier: 1
  },
  {
    id: "jajowod",
    paragraph: P.reproduction.female,
    name: { pl: "jajow\xF3d", ru: "\u043C\u0430\u0442\u043E\u0447\u043D\u0430\u044F \u0442\u0440\u0443\u0431\u0430" },
    role: { pl: "miejsce zap\u0142odnienia i droga zarodka do macicy", ru: "\u043C\u0435\u0441\u0442\u043E \u043E\u043F\u043B\u043E\u0434\u043E\u0442\u0432\u043E\u0440\u0435\u043D\u0438\u044F \u0438 \u043F\u0443\u0442\u044C \u0437\u0430\u0440\u043E\u0434\u044B\u0448\u0430 \u043A \u043C\u0430\u0442\u043A\u0435" },
    aliases: { pl: [], ru: ["\u044F\u0439\u0446\u0435\u0432\u043E\u0434"] },
    tier: 1
  },
  {
    id: "macica",
    paragraph: P.reproduction.female,
    name: { pl: "macica", ru: "\u043C\u0430\u0442\u043A\u0430" },
    role: { pl: "zagnie\u017Cd\u017Cenie zarodka i rozw\xF3j p\u0142odu", ru: "\u0438\u043C\u043F\u043B\u0430\u043D\u0442\u0430\u0446\u0438\u044F \u0437\u0430\u0440\u043E\u0434\u044B\u0448\u0430 \u0438 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435 \u043F\u043B\u043E\u0434\u0430" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "lozysko",
    paragraph: P.reproduction.development,
    name: { pl: "\u0142o\u017Cysko", ru: "\u043F\u043B\u0430\u0446\u0435\u043D\u0442\u0430" },
    role: { pl: "wymiana gaz\xF3w i substancji mi\u0119dzy krwi\u0105 matki a krwi\u0105 p\u0142odu, bez ich mieszania", ru: "\u043E\u0431\u043C\u0435\u043D \u0433\u0430\u0437\u043E\u0432 \u0438 \u0432\u0435\u0449\u0435\u0441\u0442\u0432 \u043C\u0435\u0436\u0434\u0443 \u043A\u0440\u043E\u0432\u044C\u044E \u043C\u0430\u0442\u0435\u0440\u0438 \u0438 \u043F\u043B\u043E\u0434\u0430, \u0431\u0435\u0437 \u0438\u0445 \u0441\u043C\u0435\u0448\u0438\u0432\u0430\u043D\u0438\u044F" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "cialko-zolte",
    paragraph: P.reproduction.female,
    name: { pl: "cia\u0142ko \u017C\xF3\u0142te", ru: "\u0436\u0451\u043B\u0442\u043E\u0435 \u0442\u0435\u043B\u043E" },
    role: { pl: "wydzielanie progesteronu po owulacji", ru: "\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0433\u0435\u0441\u0442\u0435\u0440\u043E\u043D\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u0432\u0443\u043B\u044F\u0446\u0438\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "owulacja",
    paragraph: P.reproduction.female,
    name: { pl: "owulacja", ru: "\u043E\u0432\u0443\u043B\u044F\u0446\u0438\u044F" },
    role: { pl: "uwolnienie kom\xF3rki jajowej oko\u0142o 14 dni przed nast\u0119pn\u0105 miesi\u0105czk\u0105", ru: "\u0432\u044B\u0445\u043E\u0434 \u044F\u0439\u0446\u0435\u043A\u043B\u0435\u0442\u043A\u0438 \u043F\u0440\u0438\u043C\u0435\u0440\u043D\u043E \u0437\u0430 14 \u0434\u043D\u0435\u0439 \u0434\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043C\u0435\u043D\u0441\u0442\u0440\u0443\u0430\u0446\u0438\u0438" },
    aliases: { pl: ["jajeczkowanie"], ru: [] },
    tier: 1
  },
  {
    id: "ektoderma",
    paragraph: P.reproduction.development,
    name: { pl: "ektoderma", ru: "\u044D\u043A\u0442\u043E\u0434\u0435\u0440\u043C\u0430" },
    role: { pl: "listek zarodkowy daj\u0105cy nask\xF3rek i uk\u0142ad nerwowy", ru: "\u0437\u0430\u0440\u043E\u0434\u044B\u0448\u0435\u0432\u044B\u0439 \u043B\u0438\u0441\u0442\u043E\u043A, \u0434\u0430\u044E\u0449\u0438\u0439 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441 \u0438 \u043D\u0435\u0440\u0432\u043D\u0443\u044E \u0441\u0438\u0441\u0442\u0435\u043C\u0443" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "mezoderma",
    paragraph: P.reproduction.development,
    name: { pl: "mezoderma", ru: "\u043C\u0435\u0437\u043E\u0434\u0435\u0440\u043C\u0430" },
    role: { pl: "listek zarodkowy daj\u0105cy mi\u0119\u015Bnie, ko\u015Bci, krew i nerki", ru: "\u0437\u0430\u0440\u043E\u0434\u044B\u0448\u0435\u0432\u044B\u0439 \u043B\u0438\u0441\u0442\u043E\u043A, \u0434\u0430\u044E\u0449\u0438\u0439 \u043C\u044B\u0448\u0446\u044B, \u043A\u043E\u0441\u0442\u0438, \u043A\u0440\u043E\u0432\u044C \u0438 \u043F\u043E\u0447\u043A\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "endoderma",
    paragraph: P.reproduction.development,
    name: { pl: "endoderma", ru: "\u044D\u043D\u0442\u043E\u0434\u0435\u0440\u043C\u0430" },
    role: { pl: "listek zarodkowy daj\u0105cy nab\u0142onek przewodu pokarmowego i p\u0142uc", ru: "\u0437\u0430\u0440\u043E\u0434\u044B\u0448\u0435\u0432\u044B\u0439 \u043B\u0438\u0441\u0442\u043E\u043A, \u0434\u0430\u044E\u0449\u0438\u0439 \u044D\u043F\u0438\u0442\u0435\u043B\u0438\u0439 \u043F\u0438\u0449\u0435\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0442\u0440\u0430\u043A\u0442\u0430 \u0438 \u043B\u0451\u0433\u043A\u0438\u0445" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "zygota",
    paragraph: P.reproduction.development,
    name: { pl: "zygota", ru: "\u0437\u0438\u0433\u043E\u0442\u0430" },
    role: { pl: "pierwsza kom\xF3rka nowego organizmu, powsta\u0142a z po\u0142\u0105czenia gamet", ru: "\u043F\u0435\u0440\u0432\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430 \u043D\u043E\u0432\u043E\u0433\u043E \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C\u0430, \u0432\u043E\u0437\u043D\u0438\u043A\u0448\u0430\u044F \u043F\u0440\u0438 \u0441\u043B\u0438\u044F\u043D\u0438\u0438 \u0433\u0430\u043C\u0435\u0442" },
    aliases: { pl: [], ru: [] },
    tier: 1
  }
];

// packages/trainers/bio/src/server/templates/topics/lo3Remaining.ts
var organism = [
  ...pairFromTable({
    topicId: "bio.lo3.organism",
    slug: "tissue",
    rows: TISSUES,
    paragraph: P.organism.hierarchy,
    subtopic: { pl: "tkanki i poziomy organizacji", ru: "\u0442\u043A\u0430\u043D\u0438 \u0438 \u0443\u0440\u043E\u0432\u043D\u0438 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u0438" },
    shift: 0,
    label: { pl: "Tkanka", ru: "\u0422\u043A\u0430\u043D\u044C", feminine: ["pl", "ru"] },
    misconception: { pl: "rola innej tkanki, cz\u0119sto z tej samej grupy", ru: "\u0440\u043E\u043B\u044C \u0434\u0440\u0443\u0433\u043E\u0439 \u0442\u043A\u0430\u043D\u0438, \u0447\u0430\u0441\u0442\u043E \u0438\u0437 \u0442\u043E\u0439 \u0436\u0435 \u0433\u0440\u0443\u043F\u043F\u044B" }
  }),
  ...pairFromTable({
    topicId: "bio.lo3.organism",
    paragraph: P.organism.hierarchy,
    slug: "hierarchy",
    rows: HIERARCHY_AND_TRANSPORT,
    subtopic: { pl: "poziomy organizacji i transport przez b\u0142ony", ru: "\u0443\u0440\u043E\u0432\u043D\u0438 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u0438 \u0438 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442 \u0447\u0435\u0440\u0435\u0437 \u043C\u0435\u043C\u0431\u0440\u0430\u043D\u044B" },
    shift: 2,
    label: { pl: "Poj\u0119cie", ru: "\u041F\u043E\u043D\u044F\u0442\u0438\u0435" },
    misconception: {
      pl: "definicja pokrewnego poj\u0119cia \u2014 \u0142atwo pomyli\u0107 dyfuzj\u0119 z osmoz\u0105 albo narz\u0105d z uk\u0142adem narz\u0105d\xF3w",
      ru: "\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0441\u043C\u0435\u0436\u043D\u043E\u0433\u043E \u043F\u043E\u043D\u044F\u0442\u0438\u044F \u2014 \u043B\u0435\u0433\u043A\u043E \u0441\u043F\u0443\u0442\u0430\u0442\u044C \u0434\u0438\u0444\u0444\u0443\u0437\u0438\u044E \u0441 \u043E\u0441\u043C\u043E\u0441\u043E\u043C \u0438\u043B\u0438 \u043E\u0440\u0433\u0430\u043D \u0441 \u0441\u0438\u0441\u0442\u0435\u043C\u043E\u0439 \u043E\u0440\u0433\u0430\u043D\u043E\u0432"
    }
  })
];
var skin = pairFromTable({
  topicId: "bio.lo3.skin",
  slug: "skin",
  rows: SKIN_PARTS,
  paragraph: P.skin.structure,
  subtopic: { pl: "budowa sk\xF3ry i termoregulacja", ru: "\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u043A\u043E\u0436\u0438 \u0438 \u0442\u0435\u0440\u043C\u043E\u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F" },
  tags: ["homeostaza"],
  shift: 1,
  label: { pl: "Element sk\xF3ry", ru: "\u042D\u043B\u0435\u043C\u0435\u043D\u0442 \u043A\u043E\u0436\u0438" },
  misconception: { pl: "rola innej warstwy sk\xF3ry albo innego wytworu nask\xF3rka", ru: "\u0440\u043E\u043B\u044C \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0441\u043B\u043E\u044F \u043A\u043E\u0436\u0438 \u0438\u043B\u0438 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u043D\u043E\u0433\u043E \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441\u0430" }
});
var motion = pairFromTable({
  topicId: "bio.lo3.motion",
  slug: "motion",
  rows: MOTION_PARTS,
  subtopic: { pl: "ko\u015Bci, stawy i mi\u0119\u015Bnie", ru: "\u043A\u043E\u0441\u0442\u0438, \u0441\u0443\u0441\u0442\u0430\u0432\u044B \u0438 \u043C\u044B\u0448\u0446\u044B" },
  shift: 0,
  label: { pl: "Struktura", ru: "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430", feminine: ["pl", "ru"] },
  misconception: { pl: "rola s\u0105siedniej struktury ko\u015Bci, stawu albo mi\u0119\u015Bnia", ru: "\u0440\u043E\u043B\u044C \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0439 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u044B \u043A\u043E\u0441\u0442\u0438, \u0441\u0443\u0441\u0442\u0430\u0432\u0430 \u0438\u043B\u0438 \u043C\u044B\u0448\u0446\u044B" }
});
var digestion = [
  ...pairFromTable({
    topicId: "bio.lo3.digestion",
    slug: "organ",
    rows: DIGESTIVE_ORGANS,
    subtopic: { pl: "budowa przewodu pokarmowego", ru: "\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u043F\u0438\u0449\u0435\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0442\u0440\u0430\u043A\u0442\u0430" },
    shift: 0,
    label: { pl: "Narz\u0105d", ru: "\u041E\u0440\u0433\u0430\u043D" },
    misconception: { pl: "rola s\u0105siedniego odcinka przewodu pokarmowego", ru: "\u0440\u043E\u043B\u044C \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0433\u043E \u043E\u0442\u0434\u0435\u043B\u0430 \u043F\u0438\u0449\u0435\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0442\u0440\u0430\u043A\u0442\u0430" }
  }),
  ...pairFromTable({
    topicId: "bio.lo3.digestion",
    slug: "enzyme",
    rows: ENZYMES,
    paragraph: P.digestion.processes,
    subtopic: { pl: "enzymy trawienne", ru: "\u043F\u0438\u0449\u0435\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0444\u0435\u0440\u043C\u0435\u043D\u0442\u044B" },
    shift: 2,
    label: { pl: "Enzym", ru: "\u0424\u0435\u0440\u043C\u0435\u043D\u0442" },
    misconception: { pl: "dzia\u0142anie enzymu trawi\u0105cego inn\u0105 grup\u0119 sk\u0142adnik\xF3w", ru: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0444\u0435\u0440\u043C\u0435\u043D\u0442\u0430, \u043F\u0435\u0440\u0435\u0432\u0430\u0440\u0438\u0432\u0430\u044E\u0449\u0435\u0433\u043E \u0434\u0440\u0443\u0433\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443 \u0432\u0435\u0449\u0435\u0441\u0442\u0432" }
  })
];
var nervous = pairFromTable({
  topicId: "bio.lo3.nervous",
  slug: "nervous",
  rows: NERVOUS_PARTS,
  subtopic: { pl: "neuron, m\xF3zgowie i odruchy", ru: "\u043D\u0435\u0439\u0440\u043E\u043D, \u0433\u043E\u043B\u043E\u0432\u043D\u043E\u0439 \u043C\u043E\u0437\u0433 \u0438 \u0440\u0435\u0444\u043B\u0435\u043A\u0441\u044B" },
  shift: 1,
  label: { pl: "Poj\u0119cie", ru: "\u041F\u043E\u043D\u044F\u0442\u0438\u0435" },
  misconception: { pl: "rola s\u0105siedniej cz\u0119\u015Bci uk\u0142adu nerwowego", ru: "\u0440\u043E\u043B\u044C \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0439 \u0447\u0430\u0441\u0442\u0438 \u043D\u0435\u0440\u0432\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B" }
});
var senses = [
  ...pairFromTable({
    topicId: "bio.lo3.senses",
    slug: "sense",
    rows: SENSE_PARTS,
    subtopic: { pl: "budowa oka i ucha", ru: "\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0433\u043B\u0430\u0437\u0430 \u0438 \u0443\u0445\u0430" },
    shift: 0,
    label: { pl: "Struktura", ru: "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430", feminine: ["pl", "ru"] },
    misconception: { pl: "rola innej cz\u0119\u015Bci oka albo ucha", ru: "\u0440\u043E\u043B\u044C \u0434\u0440\u0443\u0433\u043E\u0439 \u0447\u0430\u0441\u0442\u0438 \u0433\u043B\u0430\u0437\u0430 \u0438\u043B\u0438 \u0443\u0445\u0430" }
  }),
  ...pairFromTable({
    topicId: "bio.lo3.senses",
    slug: "defect",
    rows: VISION_DEFECTS,
    paragraph: P.senses.vision,
    subtopic: { pl: "wady wzroku", ru: "\u0434\u0435\u0444\u0435\u043A\u0442\u044B \u0437\u0440\u0435\u043D\u0438\u044F" },
    tags: ["choroby"],
    shift: 3,
    label: { pl: "Wada wzroku", ru: "\u0414\u0435\u0444\u0435\u043A\u0442 \u0437\u0440\u0435\u043D\u0438\u044F", feminine: ["pl"] },
    misconception: { pl: "opis przeciwnej wady wzroku", ru: "\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u043F\u043E\u043B\u043E\u0436\u043D\u043E\u0433\u043E \u0434\u0435\u0444\u0435\u043A\u0442\u0430 \u0437\u0440\u0435\u043D\u0438\u044F" }
  })
];
var reproduction = pairFromTable({
  topicId: "bio.lo3.reproduction",
  slug: "reproduction",
  rows: REPRODUCTION_PARTS,
  subtopic: { pl: "uk\u0142ad rozrodczy i rozw\xF3j zarodkowy", ru: "\u043F\u043E\u043B\u043E\u0432\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0438 \u0437\u0430\u0440\u043E\u0434\u044B\u0448\u0435\u0432\u043E\u0435 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435" },
  shift: 2,
  label: { pl: "Poj\u0119cie", ru: "\u041F\u043E\u043D\u044F\u0442\u0438\u0435" },
  misconception: { pl: "rola innego narz\u0105du rozrodczego albo innego listka zarodkowego", ru: "\u0440\u043E\u043B\u044C \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u043E\u0440\u0433\u0430\u043D\u0430 \u0440\u0430\u0437\u043C\u043D\u043E\u0436\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0437\u0430\u0440\u043E\u0434\u044B\u0448\u0435\u0432\u043E\u0433\u043E \u043B\u0438\u0441\u0442\u043A\u0430" }
});
var lensPower = calcTemplate({
  id: "bio.lo3.senses.lens-power",
  topicId: "bio.lo3.senses",
  paragraph: P.senses.vision,
  subtopic: { pl: "wady wzroku", ru: "\u0434\u0435\u0444\u0435\u043A\u0442\u044B \u0437\u0440\u0435\u043D\u0438\u044F" },
  tags: ["obliczenia"],
  difficulty: 2,
  // focal lengths in tenths of a metre keep both the question and the answer in tidy numbers
  params: { f: intRange(2, 10), sign: intRange(0, 1) },
  decimals: 1,
  formula: (p) => `(${p.sign === 0 ? "-" : ""}1) / ${p.f / 10}`,
  value: (p) => (p.sign === 0 ? -1 : 1) / (p.f / 10),
  question: (p, lang) => {
    const f = (p.f / 10).toFixed(1).replace(".", ",");
    const defect = p.sign === 0 ? { pl: "rozpraszaj\u0105cej", ru: "\u0440\u0430\u0441\u0441\u0435\u0438\u0432\u0430\u044E\u0449\u0435\u0439" } : { pl: "skupiaj\u0105cej", ru: "\u0441\u043E\u0431\u0438\u0440\u0430\u044E\u0449\u0435\u0439" };
    return lang === "pl" ? `Okulista dobiera soczewk\u0119 ${defect.pl} o ogniskowej ${f} m. Oblicz jej zdolno\u015B\u0107 skupiaj\u0105c\u0105 w dioptriach.` : `\u041E\u043A\u0443\u043B\u0438\u0441\u0442 \u043F\u043E\u0434\u0431\u0438\u0440\u0430\u0435\u0442 ${defect.ru} \u043B\u0438\u043D\u0437\u0443 \u0441 \u0444\u043E\u043A\u0443\u0441\u043D\u044B\u043C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435\u043C ${f} \u043C. \u0412\u044B\u0447\u0438\u0441\u043B\u0438 \u0435\u0451 \u043E\u043F\u0442\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u0441\u0438\u043B\u0443 \u0432 \u0434\u0438\u043E\u043F\u0442\u0440\u0438\u044F\u0445.`;
  },
  hint: (_p, lang) => lang === "pl" ? "Zdolno\u015B\u0107 skupiaj\u0105ca to odwrotno\u015B\u0107 ogniskowej; soczewka rozpraszaj\u0105ca ma warto\u015B\u0107 ujemn\u0105." : "\u041E\u043F\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0441\u0438\u043B\u0430 \u2014 \u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0432\u0435\u043B\u0438\u0447\u0438\u043D\u0430 \u0444\u043E\u043A\u0443\u0441\u043D\u043E\u0433\u043E \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F; \u0443 \u0440\u0430\u0441\u0441\u0435\u0438\u0432\u0430\u044E\u0449\u0435\u0439 \u043B\u0438\u043D\u0437\u044B \u043E\u043D\u0430 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u0430.",
  solution: (p, answer, lang) => {
    const f = (p.f / 10).toFixed(1).replace(".", ",");
    const defect = p.sign === 0 ? { pl: "kr\xF3tkowzroczno\u015Bci", ru: "\u0431\u043B\u0438\u0437\u043E\u0440\u0443\u043A\u043E\u0441\u0442\u0438" } : { pl: "dalekowzroczno\u015Bci", ru: "\u0434\u0430\u043B\u044C\u043D\u043E\u0437\u043E\u0440\u043A\u043E\u0441\u0442\u0438" };
    return lang === "pl" ? `Z = ${p.sign === 0 ? "\u2212" : ""}1 / ${f} m = ${answer} D. Tak\u0105 soczewk\u0119 stosuje si\u0119 przy ${defect.pl}.` : `D = ${p.sign === 0 ? "\u2212" : ""}1 / ${f} \u043C = ${answer} \u0434\u043F\u0442\u0440. \u0422\u0430\u043A\u0443\u044E \u043B\u0438\u043D\u0437\u0443 \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u044E\u0442 \u043F\u0440\u0438 ${defect.ru}.`;
  }
});
var ovulationDay = calcTemplate({
  id: "bio.lo3.reproduction.ovulation-day",
  topicId: "bio.lo3.reproduction",
  paragraph: P.reproduction.female,
  subtopic: { pl: "cykl miesi\u0105czkowy", ru: "\u043C\u0435\u043D\u0441\u0442\u0440\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u0446\u0438\u043A\u043B" },
  tags: ["obliczenia"],
  difficulty: 2,
  params: { cycle: intRange(24, 34) },
  formula: (p) => `${p.cycle} - 14`,
  value: (p) => p.cycle - 14,
  question: (p, lang) => lang === "pl" ? `Cykl miesi\u0105czkowy trwa ${p.cycle} dni. W kt\xF3rym dniu cyklu nast\u0119puje owulacja?` : `\u041C\u0435\u043D\u0441\u0442\u0440\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u0446\u0438\u043A\u043B \u0434\u043B\u0438\u0442\u0441\u044F ${p.cycle} \u0434\u043D\u0435\u0439. \u041D\u0430 \u043A\u0430\u043A\u043E\u0439 \u0434\u0435\u043D\u044C \u0446\u0438\u043A\u043B\u0430 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442 \u043E\u0432\u0443\u043B\u044F\u0446\u0438\u044F?`,
  hint: (_p, lang) => lang === "pl" ? "Faza lutealna trwa sta\u0142e 14 dni, niezale\u017Cnie od d\u0142ugo\u015Bci cyklu \u2014 zmienia si\u0119 faza folikularna." : "\u041B\u044E\u0442\u0435\u0438\u043D\u043E\u0432\u0430\u044F \u0444\u0430\u0437\u0430 \u0434\u043B\u0438\u0442\u0441\u044F \u0440\u043E\u0432\u043D\u043E 14 \u0434\u043D\u0435\u0439 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u0434\u043B\u0438\u043D\u044B \u0446\u0438\u043A\u043B\u0430 \u2014 \u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F \u0444\u043E\u043B\u043B\u0438\u043A\u0443\u043B\u044F\u0440\u043D\u0430\u044F \u0444\u0430\u0437\u0430.",
  solution: (p, answer, lang) => lang === "pl" ? `${p.cycle} \u2212 14 = ${answer}. Owulacja wypada 14 dni przed nast\u0119pn\u0105 miesi\u0105czk\u0105, a nie w po\u0142owie cyklu \u2014 dlatego przy cyklu ${p.cycle}-dniowym to dzie\u0144 ${answer}.` : `${p.cycle} \u2212 14 = ${answer}. \u041E\u0432\u0443\u043B\u044F\u0446\u0438\u044F \u043F\u0440\u0438\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0437\u0430 14 \u0434\u043D\u0435\u0439 \u0434\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043C\u0435\u043D\u0441\u0442\u0440\u0443\u0430\u0446\u0438\u0438, \u0430 \u043D\u0435 \u043D\u0430 \u0441\u0435\u0440\u0435\u0434\u0438\u043D\u0443 \u0446\u0438\u043A\u043B\u0430 \u2014 \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043F\u0440\u0438 ${p.cycle}-\u0434\u043D\u0435\u0432\u043D\u043E\u043C \u0446\u0438\u043A\u043B\u0435 \u044D\u0442\u043E \u0434\u0435\u043D\u044C ${answer}.`
});
var lo3RemainingTemplates = [
  ...organism,
  ...skin,
  ...motion,
  ...digestion,
  ...nervous,
  ...senses,
  ...reproduction,
  lensPower,
  ovulationDay
];

// packages/trainers/bio/src/server/templates/data/respiration.ts
var AIRWAY_PARTS = [
  {
    id: "jama-nosowa",
    paragraph: P.respiration.structure,
    part: { pl: "jama nosowa", ru: "\u043D\u043E\u0441\u043E\u0432\u0430\u044F \u043F\u043E\u043B\u043E\u0441\u0442\u044C" },
    role: { pl: "ogrzewanie, nawil\u017Canie i oczyszczanie wdychanego powietrza", ru: "\u0441\u043E\u0433\u0440\u0435\u0432\u0430\u043D\u0438\u0435, \u0443\u0432\u043B\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u0438 \u043E\u0447\u0438\u0449\u0435\u043D\u0438\u0435 \u0432\u0434\u044B\u0445\u0430\u0435\u043C\u043E\u0433\u043E \u0432\u043E\u0437\u0434\u0443\u0445\u0430" },
    aliases: { pl: ["nos"], ru: ["\u043F\u043E\u043B\u043E\u0441\u0442\u044C \u043D\u043E\u0441\u0430", "\u043D\u043E\u0441"] },
    tier: 1
  },
  {
    id: "gardlo",
    paragraph: P.respiration.structure,
    part: { pl: "gard\u0142o", ru: "\u0433\u043B\u043E\u0442\u043A\u0430" },
    role: { pl: "wsp\xF3lny odcinek drogi oddechowej i pokarmowej", ru: "\u043E\u0431\u0449\u0438\u0439 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0438 \u043F\u0438\u0449\u0435\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043F\u0443\u0442\u0435\u0439" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "krtan",
    paragraph: P.respiration.structure,
    part: { pl: "krta\u0144", ru: "\u0433\u043E\u0440\u0442\u0430\u043D\u044C" },
    role: { pl: "wytwarzanie d\u017Awi\u0119k\xF3w mowy dzi\u0119ki strunom g\u0142osowym", ru: "\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0437\u0432\u0443\u043A\u043E\u0432 \u0440\u0435\u0447\u0438 \u0431\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u044F \u0433\u043E\u043B\u043E\u0441\u043E\u0432\u044B\u043C \u0441\u0432\u044F\u0437\u043A\u0430\u043C" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "nag\u0142o\u015Bnia",
    paragraph: P.respiration.structure,
    part: { pl: "nag\u0142o\u015Bnia", ru: "\u043D\u0430\u0434\u0433\u043E\u0440\u0442\u0430\u043D\u043D\u0438\u043A" },
    role: { pl: "zamykanie wej\u015Bcia do krtani podczas po\u0142ykania", ru: "\u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0435 \u0432\u0445\u043E\u0434\u0430 \u0432 \u0433\u043E\u0440\u0442\u0430\u043D\u044C \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0433\u043B\u043E\u0442\u0430\u043D\u0438\u044F" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "tchawica",
    paragraph: P.respiration.structure,
    part: { pl: "tchawica", ru: "\u0442\u0440\u0430\u0445\u0435\u044F" },
    role: { pl: "utrzymywanie dro\u017Cno\u015Bci drogi oddechowej przez chrz\u0119stne p\xF3\u0142pier\u015Bcienie", ru: "\u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0445\u043E\u0434\u0438\u043C\u043E\u0441\u0442\u0438 \u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043F\u0443\u0442\u0438 \u0445\u0440\u044F\u0449\u0435\u0432\u044B\u043C\u0438 \u043F\u043E\u043B\u0443\u043A\u043E\u043B\u044C\u0446\u0430\u043C\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "oskrzela",
    paragraph: P.respiration.structure,
    part: { pl: "oskrzela", ru: "\u0431\u0440\u043E\u043D\u0445\u0438" },
    role: { pl: "rozprowadzanie powietrza do obu p\u0142uc", ru: "\u0440\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0432\u043E\u0437\u0434\u0443\u0445\u0430 \u0432 \u043E\u0431\u0430 \u043B\u0451\u0433\u043A\u0438\u0445" },
    aliases: { pl: ["oskrzele"], ru: ["\u0431\u0440\u043E\u043D\u0445"] },
    tier: 1
  },
  {
    id: "oskrzeliki",
    paragraph: P.respiration.structure,
    part: { pl: "oskrzeliki", ru: "\u0431\u0440\u043E\u043D\u0445\u0438\u043E\u043B\u044B" },
    role: { pl: "regulacja przep\u0142ywu powietrza mi\u0119\u015Bniami g\u0142adkimi, bez chrz\u0105stek", ru: "\u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F \u043F\u043E\u0442\u043E\u043A\u0430 \u0432\u043E\u0437\u0434\u0443\u0445\u0430 \u0433\u043B\u0430\u0434\u043A\u0438\u043C\u0438 \u043C\u044B\u0448\u0446\u0430\u043C\u0438, \u0431\u0435\u0437 \u0445\u0440\u044F\u0449\u0435\u0439" },
    aliases: { pl: ["oskrzelik"], ru: ["\u0431\u0440\u043E\u043D\u0445\u0438\u043E\u043B\u0430"] },
    tier: 2
  },
  {
    id: "pecherzyki",
    paragraph: P.respiration.structure,
    part: { pl: "p\u0119cherzyki p\u0142ucne", ru: "\u043B\u0451\u0433\u043E\u0447\u043D\u044B\u0435 \u0430\u043B\u044C\u0432\u0435\u043E\u043B\u044B" },
    role: { pl: "wymiana gazowa mi\u0119dzy powietrzem a krwi\u0105", ru: "\u0433\u0430\u0437\u043E\u043E\u0431\u043C\u0435\u043D \u043C\u0435\u0436\u0434\u0443 \u0432\u043E\u0437\u0434\u0443\u0445\u043E\u043C \u0438 \u043A\u0440\u043E\u0432\u044C\u044E" },
    aliases: { pl: ["alweole", "p\u0119cherzyk p\u0142ucny"], ru: ["\u0430\u043B\u044C\u0432\u0435\u043E\u043B\u044B", "\u0430\u043B\u044C\u0432\u0435\u043E\u043B\u0430"] },
    tier: 1
  },
  {
    id: "surfaktant",
    paragraph: P.respiration.structure,
    part: { pl: "surfaktant", ru: "\u0441\u0443\u0440\u0444\u0430\u043A\u0442\u0430\u043D\u0442" },
    role: { pl: "obni\u017Canie napi\u0119cia powierzchniowego, zapobiegaj\u0105ce zapadaniu si\u0119 p\u0119cherzyk\xF3w", ru: "\u0441\u043D\u0438\u0436\u0435\u043D\u0438\u0435 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u043D\u043E\u0433\u043E \u043D\u0430\u0442\u044F\u0436\u0435\u043D\u0438\u044F, \u043F\u0440\u0435\u0434\u043E\u0442\u0432\u0440\u0430\u0449\u0430\u044E\u0449\u0435\u0435 \u0441\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u0430\u043B\u044C\u0432\u0435\u043E\u043B" },
    aliases: { pl: [], ru: [] },
    tier: 3
  },
  {
    id: "oplucna",
    paragraph: P.respiration.structure,
    part: { pl: "op\u0142ucna", ru: "\u043F\u043B\u0435\u0432\u0440\u0430" },
    role: { pl: "utrzymywanie podci\u015Bnienia w jamie op\u0142ucnej wok\xF3\u0142 p\u0142uca", ru: "\u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0432 \u043F\u043B\u0435\u0432\u0440\u0430\u043B\u044C\u043D\u043E\u0439 \u043F\u043E\u043B\u043E\u0441\u0442\u0438 \u0432\u043E\u043A\u0440\u0443\u0433 \u043B\u0451\u0433\u043A\u043E\u0433\u043E" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "przepona",
    paragraph: P.respiration.ventilation,
    part: { pl: "przepona", ru: "\u0434\u0438\u0430\u0444\u0440\u0430\u0433\u043C\u0430" },
    role: { pl: "powi\u0119kszanie obj\u0119to\u015Bci klatki piersiowej przez obni\u017Cenie si\u0119 przy skurczu", ru: "\u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u0438\u0435 \u043E\u0431\u044A\u0451\u043C\u0430 \u0433\u0440\u0443\u0434\u043D\u043E\u0439 \u043A\u043B\u0435\u0442\u043A\u0438 \u0437\u0430 \u0441\u0447\u0451\u0442 \u043E\u043F\u0443\u0441\u043A\u0430\u043D\u0438\u044F \u043F\u0440\u0438 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "miesnie-miedzyzebrowe",
    paragraph: P.respiration.ventilation,
    part: { pl: "mi\u0119\u015Bnie mi\u0119dzy\u017Cebrowe zewn\u0119trzne", ru: "\u043D\u0430\u0440\u0443\u0436\u043D\u044B\u0435 \u043C\u0435\u0436\u0440\u0451\u0431\u0435\u0440\u043D\u044B\u0435 \u043C\u044B\u0448\u0446\u044B" },
    role: { pl: "unoszenie \u017Ceber podczas wdechu", ru: "\u043F\u043E\u0434\u043D\u044F\u0442\u0438\u0435 \u0440\u0451\u0431\u0435\u0440 \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0432\u0434\u043E\u0445\u0430" },
    aliases: { pl: ["mi\u0119\u015Bnie mi\u0119dzy\u017Cebrowe"], ru: ["\u043C\u0435\u0436\u0440\u0451\u0431\u0435\u0440\u043D\u044B\u0435 \u043C\u044B\u0448\u0446\u044B"] },
    tier: 2
  },
  {
    id: "osrodek-oddechowy",
    paragraph: P.respiration.ventilation,
    part: { pl: "o\u015Brodek oddechowy", ru: "\u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0435\u043D\u0442\u0440" },
    role: { pl: "reagowanie na wzrost st\u0119\u017Cenia dwutlenku w\u0119gla w rdzeniu przed\u0142u\u017Conym", ru: "\u0440\u0435\u0430\u043A\u0446\u0438\u044F \u043D\u0430 \u0440\u043E\u0441\u0442 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u0438 \u0443\u0433\u043B\u0435\u043A\u0438\u0441\u043B\u043E\u0433\u043E \u0433\u0430\u0437\u0430 \u0432 \u043F\u0440\u043E\u0434\u043E\u043B\u0433\u043E\u0432\u0430\u0442\u043E\u043C \u043C\u043E\u0437\u0433\u0435" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "hemoglobina",
    paragraph: P.respiration.ventilation,
    part: { pl: "hemoglobina", ru: "\u0433\u0435\u043C\u043E\u0433\u043B\u043E\u0431\u0438\u043D" },
    role: { pl: "wi\u0105zanie tlenu w p\u0142ucach i oddawanie go w tkankach", ru: "\u0441\u0432\u044F\u0437\u044B\u0432\u0430\u043D\u0438\u0435 \u043A\u0438\u0441\u043B\u043E\u0440\u043E\u0434\u0430 \u0432 \u043B\u0451\u0433\u043A\u0438\u0445 \u0438 \u043E\u0442\u0434\u0430\u0447\u0430 \u0435\u0433\u043E \u0432 \u0442\u043A\u0430\u043D\u044F\u0445" },
    aliases: { pl: ["Hb"], ru: ["Hb"] },
    tier: 1
  },
  {
    id: "wodoroweglany",
    paragraph: P.respiration.ventilation,
    part: { pl: "jony wodorow\u0119glanowe", ru: "\u0433\u0438\u0434\u0440\u043E\u043A\u0430\u0440\u0431\u043E\u043D\u0430\u0442-\u0438\u043E\u043D\u044B" },
    role: { pl: "przenoszenie wi\u0119kszo\u015Bci dwutlenku w\u0119gla w osoczu krwi", ru: "\u043F\u0435\u0440\u0435\u043D\u043E\u0441 \u0431\u043E\u043B\u044C\u0448\u0435\u0439 \u0447\u0430\u0441\u0442\u0438 \u0443\u0433\u043B\u0435\u043A\u0438\u0441\u043B\u043E\u0433\u043E \u0433\u0430\u0437\u0430 \u0432 \u043F\u043B\u0430\u0437\u043C\u0435 \u043A\u0440\u043E\u0432\u0438" },
    aliases: { pl: ["wodorow\u0119glany", "HCO3-"], ru: ["\u0433\u0438\u0434\u0440\u043E\u043A\u0430\u0440\u0431\u043E\u043D\u0430\u0442\u044B", "HCO3-"] },
    tier: 3
  }
];
var LUNG_VOLUMES = [
  {
    id: "to",
    name: { pl: "obj\u0119to\u015B\u0107 oddechowa", ru: "\u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C" },
    definition: { pl: "obj\u0119to\u015B\u0107 powietrza wdychana i wydychana podczas spokojnego oddechu", ru: "\u043E\u0431\u044A\u0451\u043C \u0432\u043E\u0437\u0434\u0443\u0445\u0430, \u0432\u0434\u044B\u0445\u0430\u0435\u043C\u044B\u0439 \u0438 \u0432\u044B\u0434\u044B\u0445\u0430\u0435\u043C\u044B\u0439 \u043F\u0440\u0438 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u043C \u0434\u044B\u0445\u0430\u043D\u0438\u0438" },
    aliases: { pl: ["TV", "obj\u0119to\u015B\u0107 oddechowa (TV)"], ru: ["\u0414\u041E", "TV"] },
    tier: 1
  },
  {
    id: "zow",
    name: { pl: "zapasowa obj\u0119to\u015B\u0107 wdechowa", ru: "\u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0432\u0434\u043E\u0445\u0430" },
    definition: { pl: "obj\u0119to\u015B\u0107, kt\xF3r\u0105 mo\u017Cna jeszcze wci\u0105gn\u0105\u0107 po spokojnym wdechu", ru: "\u043E\u0431\u044A\u0451\u043C, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043C\u043E\u0436\u043D\u043E \u0432\u0434\u043E\u0445\u043D\u0443\u0442\u044C \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u043F\u043E\u0441\u043B\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u0433\u043E \u0432\u0434\u043E\u0445\u0430" },
    aliases: { pl: ["IRV"], ru: ["\u0420\u041E\u0432\u0434", "IRV"] },
    tier: 2
  },
  {
    id: "zowyd",
    name: { pl: "zapasowa obj\u0119to\u015B\u0107 wydechowa", ru: "\u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0432\u044B\u0434\u043E\u0445\u0430" },
    definition: { pl: "obj\u0119to\u015B\u0107, kt\xF3r\u0105 mo\u017Cna jeszcze wydmucha\u0107 po spokojnym wydechu", ru: "\u043E\u0431\u044A\u0451\u043C, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043C\u043E\u0436\u043D\u043E \u0432\u044B\u0434\u043E\u0445\u043D\u0443\u0442\u044C \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u043F\u043E\u0441\u043B\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u0433\u043E \u0432\u044B\u0434\u043E\u0445\u0430" },
    aliases: { pl: ["ERV"], ru: ["\u0420\u041E\u0432\u044B\u0434", "ERV"] },
    tier: 2
  },
  {
    id: "zalegajaca",
    name: { pl: "obj\u0119to\u015B\u0107 zalegaj\u0105ca", ru: "\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C" },
    definition: { pl: "obj\u0119to\u015B\u0107, kt\xF3ra zostaje w p\u0142ucach nawet po najg\u0142\u0119bszym wydechu", ru: "\u043E\u0431\u044A\u0451\u043C, \u043E\u0441\u0442\u0430\u044E\u0449\u0438\u0439\u0441\u044F \u0432 \u043B\u0451\u0433\u043A\u0438\u0445 \u0434\u0430\u0436\u0435 \u043F\u043E\u0441\u043B\u0435 \u0441\u0430\u043C\u043E\u0433\u043E \u0433\u043B\u0443\u0431\u043E\u043A\u043E\u0433\u043E \u0432\u044B\u0434\u043E\u0445\u0430" },
    aliases: { pl: ["RV"], ru: ["\u041E\u041E", "RV"] },
    tier: 2
  },
  {
    id: "pojemnosc-zyciowa",
    name: { pl: "pojemno\u015B\u0107 \u017Cyciowa p\u0142uc", ru: "\u0436\u0438\u0437\u043D\u0435\u043D\u043D\u0430\u044F \u0451\u043C\u043A\u043E\u0441\u0442\u044C \u043B\u0451\u0433\u043A\u0438\u0445" },
    definition: { pl: "najwi\u0119ksza obj\u0119to\u015B\u0107 wydychana po najg\u0142\u0119bszym wdechu", ru: "\u043D\u0430\u0438\u0431\u043E\u043B\u044C\u0448\u0438\u0439 \u043E\u0431\u044A\u0451\u043C \u0432\u044B\u0434\u043E\u0445\u0430 \u043F\u043E\u0441\u043B\u0435 \u0441\u0430\u043C\u043E\u0433\u043E \u0433\u043B\u0443\u0431\u043E\u043A\u043E\u0433\u043E \u0432\u0434\u043E\u0445\u0430" },
    aliases: { pl: ["VC", "pojemno\u015B\u0107 \u017Cyciowa"], ru: ["\u0416\u0401\u041B", "VC"] },
    tier: 1
  },
  {
    id: "calkowita",
    name: { pl: "ca\u0142kowita pojemno\u015B\u0107 p\u0142uc", ru: "\u043E\u0431\u0449\u0430\u044F \u0451\u043C\u043A\u043E\u0441\u0442\u044C \u043B\u0451\u0433\u043A\u0438\u0445" },
    definition: { pl: "pojemno\u015B\u0107 \u017Cyciowa powi\u0119kszona o obj\u0119to\u015B\u0107 zalegaj\u0105c\u0105", ru: "\u0436\u0438\u0437\u043D\u0435\u043D\u043D\u0430\u044F \u0451\u043C\u043A\u043E\u0441\u0442\u044C \u043F\u043B\u044E\u0441 \u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C" },
    aliases: { pl: ["TLC"], ru: ["\u041E\u0401\u041B", "TLC"] },
    tier: 2
  },
  {
    id: "martwa",
    name: { pl: "przestrze\u0144 martwa", ru: "\u043C\u0451\u0440\u0442\u0432\u043E\u0435 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E" },
    definition: { pl: "powietrze w drogach oddechowych, kt\xF3re nie bierze udzia\u0142u w wymianie gazowej", ru: "\u0432\u043E\u0437\u0434\u0443\u0445 \u0432 \u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u043F\u0443\u0442\u044F\u0445, \u043D\u0435 \u0443\u0447\u0430\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0439 \u0432 \u0433\u0430\u0437\u043E\u043E\u0431\u043C\u0435\u043D\u0435" },
    aliases: { pl: ["anatomiczna przestrze\u0144 martwa"], ru: ["\u0430\u043D\u0430\u0442\u043E\u043C\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043C\u0451\u0440\u0442\u0432\u043E\u0435 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E"] },
    tier: 2
  }
];

// packages/trainers/bio/src/server/templates/topics/lo3Respiration.ts
var TOPIC4 = "bio.lo3.respiration";
var ANATOMY = { pl: "drogi oddechowe i wymiana gazowa", ru: "\u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043F\u0443\u0442\u0438 \u0438 \u0433\u0430\u0437\u043E\u043E\u0431\u043C\u0435\u043D" };
var VOLUMES = { pl: "obj\u0119to\u015Bci i pojemno\u015Bci p\u0142uc", ru: "\u043E\u0431\u044A\u0451\u043C\u044B \u0438 \u0451\u043C\u043A\u043E\u0441\u0442\u0438 \u043B\u0451\u0433\u043A\u0438\u0445" };
var partTier = (row) => row.tier;
var partToRole = choiceFromTable({
  id: `${TOPIC4}.part-to-role`,
  topicId: TOPIC4,
  rows: AIRWAY_PARTS,
  subtopic: ANATOMY,
  difficulty: partTier,
  shift: 0,
  question: (r, lang) => lang === "pl" ? `Struktura: ${r.part.pl}. Jaka jest jej rola?` : `\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430: ${r.part.ru}. \u041A\u0430\u043A\u043E\u0432\u0430 \u0435\u0451 \u0440\u043E\u043B\u044C?`,
  optionText: (r, lang) => r.role[lang],
  misconception: { pl: "rola s\u0105siedniej struktury uk\u0142adu oddechowego", ru: "\u0440\u043E\u043B\u044C \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0439 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u044B \u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B" },
  solution: (r, lang) => lang === "pl" ? `${cap(r.part.pl)} \u2014 ${r.role.pl}.` : `${cap(r.part.ru)} \u2014 ${r.role.ru}.`
});
var roleToPart = termFromTable({
  id: `${TOPIC4}.role-to-part`,
  topicId: TOPIC4,
  rows: AIRWAY_PARTS,
  subtopic: ANATOMY,
  difficulty: partTier,
  question: (r, lang) => lang === "pl" ? `Funkcja: ${r.role.pl}. Podaj nazw\u0119 struktury w mianowniku.` : `\u0424\u0443\u043D\u043A\u0446\u0438\u044F: ${r.role.ru}. \u041D\u0430\u0437\u043E\u0432\u0438 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0443 \u0432 \u0438\u043C\u0435\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C \u043F\u0430\u0434\u0435\u0436\u0435.`,
  term: (r, lang) => r.part[lang],
  aliases: (r) => [r.part.pl, r.part.ru, ...r.aliases.pl, ...r.aliases.ru],
  solution: (r, lang) => lang === "pl" ? `Odpowied\u017A: ${r.part.pl}.` : `\u041E\u0442\u0432\u0435\u0442: ${r.part.ru}.`
});
var volumeToDefinition = choiceFromTable({
  id: `${TOPIC4}.volume-to-definition`,
  topicId: TOPIC4,
  rows: LUNG_VOLUMES,
  paragraph: P.respiration.ventilation,
  subtopic: VOLUMES,
  difficulty: partTier,
  shift: 1,
  question: (v, lang) => lang === "pl" ? `Co to jest ${v.name.pl}?` : `\u0427\u0442\u043E \u0442\u0430\u043A\u043E\u0435 ${v.name.ru}?`,
  optionText: (v, lang) => v.definition[lang],
  misconception: { pl: "definicja innej obj\u0119to\u015Bci lub pojemno\u015Bci p\u0142uc", ru: "\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u043E\u0431\u044A\u0451\u043C\u0430 \u0438\u043B\u0438 \u0451\u043C\u043A\u043E\u0441\u0442\u0438 \u043B\u0451\u0433\u043A\u0438\u0445" },
  solution: (v, lang) => lang === "pl" ? `${cap(v.name.pl)} \u2014 ${v.definition.pl}.` : `${cap(v.name.ru)} \u2014 ${v.definition.ru}.`
});
var definitionToVolume = termFromTable({
  id: `${TOPIC4}.definition-to-volume`,
  topicId: TOPIC4,
  rows: LUNG_VOLUMES,
  paragraph: P.respiration.ventilation,
  subtopic: VOLUMES,
  difficulty: partTier,
  question: (v, lang) => lang === "pl" ? `Jak nazywa si\u0119 ${v.definition.pl}? Podaj nazw\u0119 w mianowniku.` : `\u041A\u0430\u043A \u043D\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F ${v.definition.ru}? \u041D\u0430\u0437\u043E\u0432\u0438 \u0432 \u0438\u043C\u0435\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C \u043F\u0430\u0434\u0435\u0436\u0435.`,
  term: (v, lang) => v.name[lang],
  aliases: (v) => [v.name.pl, v.name.ru, ...v.aliases.pl, ...v.aliases.ru],
  solution: (v, lang) => lang === "pl" ? `Odpowied\u017A: ${v.name.pl}.` : `\u041E\u0442\u0432\u0435\u0442: ${v.name.ru}.`
});
var vitalCapacity = calcTemplate({
  id: `${TOPIC4}.vital-capacity`,
  topicId: TOPIC4,
  paragraph: P.respiration.ventilation,
  subtopic: VOLUMES,
  tags: ["obliczenia"],
  difficulty: 2,
  params: { tv: intRange(4, 6), irv: intRange(25, 32), erv: intRange(10, 15) },
  formula: (p) => `${p.tv * 100} + ${p.irv * 100} + ${p.erv * 100}`,
  value: (p) => 100 * (p.tv + p.irv + p.erv),
  question: (p, lang) => lang === "pl" ? `Obj\u0119to\u015B\u0107 oddechowa wynosi ${p.tv * 100} ml, zapasowa obj\u0119to\u015B\u0107 wdechowa ${p.irv * 100} ml, a zapasowa obj\u0119to\u015B\u0107 wydechowa ${p.erv * 100} ml. Oblicz pojemno\u015B\u0107 \u017Cyciow\u0105 p\u0142uc w ml.` : `\u0414\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0440\u0430\u0432\u0435\u043D ${p.tv * 100} \u043C\u043B, \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0432\u0434\u043E\u0445\u0430 ${p.irv * 100} \u043C\u043B, \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0432\u044B\u0434\u043E\u0445\u0430 ${p.erv * 100} \u043C\u043B. \u0412\u044B\u0447\u0438\u0441\u043B\u0438 \u0436\u0438\u0437\u043D\u0435\u043D\u043D\u0443\u044E \u0451\u043C\u043A\u043E\u0441\u0442\u044C \u043B\u0451\u0433\u043A\u0438\u0445 \u0432 \u043C\u043B.`,
  hint: (_p, lang) => lang === "pl" ? "VC = obj\u0119to\u015B\u0107 oddechowa + zapasowa wdechowa + zapasowa wydechowa." : "\u0416\u0401\u041B = \u0414\u041E + \u0420\u041E\u0432\u0434 + \u0420\u041E\u0432\u044B\u0434.",
  solution: (p, answer, lang) => lang === "pl" ? `VC = ${p.tv * 100} + ${p.irv * 100} + ${p.erv * 100} = ${answer} ml. Obj\u0119to\u015B\u0107 zalegaj\u0105ca nie wchodzi do pojemno\u015Bci \u017Cyciowej.` : `\u0416\u0401\u041B = ${p.tv * 100} + ${p.irv * 100} + ${p.erv * 100} = ${answer} \u043C\u043B. \u041E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0432 \u0436\u0438\u0437\u043D\u0435\u043D\u043D\u0443\u044E \u0451\u043C\u043A\u043E\u0441\u0442\u044C \u043D\u0435 \u0432\u0445\u043E\u0434\u0438\u0442.`
});
var minuteVentilation = calcTemplate({
  id: `${TOPIC4}.minute-ventilation`,
  topicId: TOPIC4,
  paragraph: P.respiration.ventilation,
  subtopic: VOLUMES,
  tags: ["obliczenia"],
  difficulty: 1,
  params: { tv: intRange(4, 6), f: intRange(12, 20) },
  decimals: 2,
  formula: (p) => `(${p.tv * 100} * ${p.f}) / 1000`,
  value: (p) => p.tv * 100 * p.f / 1e3,
  question: (p, lang) => lang === "pl" ? `Obj\u0119to\u015B\u0107 oddechowa wynosi ${p.tv * 100} ml, a cz\u0119sto\u015B\u0107 oddech\xF3w ${p.f} na minut\u0119. Oblicz wentylacj\u0119 minutow\u0105 p\u0142uc w litrach na minut\u0119.` : `\u0414\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0440\u0430\u0432\u0435\u043D ${p.tv * 100} \u043C\u043B, \u0447\u0430\u0441\u0442\u043E\u0442\u0430 \u0434\u044B\u0445\u0430\u043D\u0438\u044F ${p.f} \u0432 \u043C\u0438\u043D\u0443\u0442\u0443. \u0412\u044B\u0447\u0438\u0441\u043B\u0438 \u043C\u0438\u043D\u0443\u0442\u043D\u0443\u044E \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u044E \u043B\u0451\u0433\u043A\u0438\u0445 \u0432 \u043B\u0438\u0442\u0440\u0430\u0445 \u0432 \u043C\u0438\u043D\u0443\u0442\u0443.`,
  hint: (_p, lang) => lang === "pl" ? "Wentylacja minutowa = obj\u0119to\u015B\u0107 oddechowa \xD7 cz\u0119sto\u015B\u0107 oddech\xF3w." : "\u041C\u0438\u043D\u0443\u0442\u043D\u0430\u044F \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u044F = \u0414\u041E \xD7 \u0447\u0430\u0441\u0442\u043E\u0442\u0430 \u0434\u044B\u0445\u0430\u043D\u0438\u044F.",
  solution: (p, answer, lang) => lang === "pl" ? `${p.tv * 100} ml \xD7 ${p.f} = ${p.tv * 100 * p.f} ml/min = ${answer} l/min.` : `${p.tv * 100} \u043C\u043B \xD7 ${p.f} = ${p.tv * 100 * p.f} \u043C\u043B/\u043C\u0438\u043D = ${answer} \u043B/\u043C\u0438\u043D.`
});
var alveolarVentilation = calcTemplate({
  id: `${TOPIC4}.alveolar-ventilation`,
  topicId: TOPIC4,
  paragraph: P.respiration.ventilation,
  subtopic: VOLUMES,
  tags: ["obliczenia"],
  difficulty: 3,
  params: { tv: intRange(4, 6), f: intRange(12, 18), dead: intRange(13, 17) },
  decimals: 2,
  formula: (p) => `((${p.tv * 100} - ${p.dead * 10}) * ${p.f}) / 1000`,
  value: (p) => (p.tv * 100 - p.dead * 10) * p.f / 1e3,
  question: (p, lang) => lang === "pl" ? `Obj\u0119to\u015B\u0107 oddechowa wynosi ${p.tv * 100} ml, przestrze\u0144 martwa ${p.dead * 10} ml, a cz\u0119sto\u015B\u0107 oddech\xF3w ${p.f} na minut\u0119. Oblicz wentylacj\u0119 p\u0119cherzykow\u0105 w litrach na minut\u0119.` : `\u0414\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0440\u0430\u0432\u0435\u043D ${p.tv * 100} \u043C\u043B, \u043C\u0451\u0440\u0442\u0432\u043E\u0435 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E ${p.dead * 10} \u043C\u043B, \u0447\u0430\u0441\u0442\u043E\u0442\u0430 \u0434\u044B\u0445\u0430\u043D\u0438\u044F ${p.f} \u0432 \u043C\u0438\u043D\u0443\u0442\u0443. \u0412\u044B\u0447\u0438\u0441\u043B\u0438 \u0430\u043B\u044C\u0432\u0435\u043E\u043B\u044F\u0440\u043D\u0443\u044E \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u044E \u0432 \u043B\u0438\u0442\u0440\u0430\u0445 \u0432 \u043C\u0438\u043D\u0443\u0442\u0443.`,
  hint: (_p, lang) => lang === "pl" ? "Do p\u0119cherzyk\xF3w dociera tylko ta cz\u0119\u015B\u0107 obj\u0119to\u015Bci oddechowej, kt\xF3ra nie zostaje w przestrzeni martwej." : "\u0414\u043E \u0430\u043B\u044C\u0432\u0435\u043E\u043B \u0434\u043E\u0445\u043E\u0434\u0438\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u0430 \u0447\u0430\u0441\u0442\u044C \u0434\u044B\u0445\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043E\u0431\u044A\u0451\u043C\u0430, \u043A\u043E\u0442\u043E\u0440\u0430\u044F \u043D\u0435 \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F \u0432 \u043C\u0451\u0440\u0442\u0432\u043E\u043C \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0435.",
  solution: (p, answer, lang) => lang === "pl" ? `(${p.tv * 100} \u2212 ${p.dead * 10}) \xD7 ${p.f} = ${(p.tv * 100 - p.dead * 10) * p.f} ml/min = ${answer} l/min.` : `(${p.tv * 100} \u2212 ${p.dead * 10}) \xD7 ${p.f} = ${(p.tv * 100 - p.dead * 10) * p.f} \u043C\u043B/\u043C\u0438\u043D = ${answer} \u043B/\u043C\u0438\u043D.`
});
var lo3RespirationTemplates = [
  partToRole,
  roleToPart,
  volumeToDefinition,
  definitionToVolume,
  vitalCapacity,
  minuteVentilation,
  alveolarVentilation
];

// packages/trainers/bio/src/server/templates/data/skin.ts
var ANIMAL_INTEGUMENT = [
  {
    id: "kutykula",
    name: { pl: "kutykula", ru: "\u043A\u0443\u0442\u0438\u043A\u0443\u043B\u0430" },
    role: { pl: "niekom\xF3rkowa warstwa wydzielana przez nask\xF3rek bezkr\u0119gowc\xF3w, chroni\u0105ca przed wysychaniem", ru: "\u043D\u0435\u043A\u043B\u0435\u0442\u043E\u0447\u043D\u044B\u0439 \u0441\u043B\u043E\u0439, \u0432\u044B\u0434\u0435\u043B\u044F\u0435\u043C\u044B\u0439 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441\u043E\u043C \u0431\u0435\u0441\u043F\u043E\u0437\u0432\u043E\u043D\u043E\u0447\u043D\u044B\u0445 \u0438 \u0437\u0430\u0449\u0438\u0449\u0430\u044E\u0449\u0438\u0439 \u043E\u0442 \u0432\u044B\u0441\u044B\u0445\u0430\u043D\u0438\u044F" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "pancerz-chitynowy",
    name: { pl: "pancerz chitynowy", ru: "\u0445\u0438\u0442\u0438\u043D\u043E\u0432\u044B\u0439 \u043F\u0430\u043D\u0446\u0438\u0440\u044C" },
    role: { pl: "sztywny szkielet zewn\u0119trzny stawonog\xF3w: ochrona i miejsce przyczepu mi\u0119\u015Bni", ru: "\u0436\u0451\u0441\u0442\u043A\u0438\u0439 \u043D\u0430\u0440\u0443\u0436\u043D\u044B\u0439 \u0441\u043A\u0435\u043B\u0435\u0442 \u0447\u043B\u0435\u043D\u0438\u0441\u0442\u043E\u043D\u043E\u0433\u0438\u0445: \u0437\u0430\u0449\u0438\u0442\u0430 \u0438 \u043C\u0435\u0441\u0442\u043E \u043F\u0440\u0438\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u0438\u044F \u043C\u044B\u0448\u0446" },
    aliases: { pl: ["szkielet zewn\u0119trzny", "egzoszkielet"], ru: ["\u043D\u0430\u0440\u0443\u0436\u043D\u044B\u0439 \u0441\u043A\u0435\u043B\u0435\u0442", "\u044D\u043A\u0437\u043E\u0441\u043A\u0435\u043B\u0435\u0442"] },
    tier: 1
  },
  {
    id: "linienie",
    name: { pl: "linienie", ru: "\u043B\u0438\u043D\u044C\u043A\u0430" },
    role: { pl: "okresowe zrzucanie pancerza lub sk\xF3ry, kt\xF3re umo\u017Cliwia wzrost stawonog\xF3w i w\u0119\u017Cy", ru: "\u043F\u0435\u0440\u0438\u043E\u0434\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0441\u0431\u0440\u043E\u0441 \u043F\u0430\u043D\u0446\u0438\u0440\u044F \u0438\u043B\u0438 \u043A\u043E\u0436\u0438, \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u044E\u0449\u0438\u0439 \u0440\u0430\u0441\u0442\u0438 \u0447\u043B\u0435\u043D\u0438\u0441\u0442\u043E\u043D\u043E\u0433\u0438\u043C \u0438 \u0437\u043C\u0435\u044F\u043C" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "luski-kostne",
    name: { pl: "\u0142uski kostne ryb", ru: "\u043A\u043E\u0441\u0442\u043D\u0430\u044F \u0447\u0435\u0448\u0443\u044F \u0440\u044B\u0431" },
    role: { pl: "p\u0142ytki kostne wytwarzane przez sk\xF3r\u0119 w\u0142a\u015Bciw\u0105, chroni\u0105ce cia\u0142o ryby", ru: "\u043A\u043E\u0441\u0442\u043D\u044B\u0435 \u043F\u043B\u0430\u0441\u0442\u0438\u043D\u043A\u0438, \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0434\u0435\u0440\u043C\u043E\u0439 \u0438 \u0437\u0430\u0449\u0438\u0449\u0430\u044E\u0449\u0438\u0435 \u0442\u0435\u043B\u043E \u0440\u044B\u0431\u044B" },
    aliases: { pl: ["\u0142uski kostne"], ru: ["\u043A\u043E\u0441\u0442\u043D\u0430\u044F \u0447\u0435\u0448\u0443\u044F"] },
    tier: 2
  },
  {
    id: "luski-rogowe",
    name: { pl: "\u0142uski rogowe gad\xF3w", ru: "\u0440\u043E\u0433\u043E\u0432\u044B\u0435 \u0447\u0435\u0448\u0443\u0438 \u043F\u0440\u0435\u0441\u043C\u044B\u043A\u0430\u044E\u0449\u0438\u0445\u0441\u044F" },
    role: { pl: "zrogowacia\u0142y wytw\xF3r nask\xF3rka chroni\u0105cy gady przed utrat\u0105 wody", ru: "\u043E\u0440\u043E\u0433\u043E\u0432\u0435\u0432\u0448\u0435\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u043D\u043E\u0435 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441\u0430, \u0437\u0430\u0449\u0438\u0449\u0430\u044E\u0449\u0435\u0435 \u043F\u0440\u0435\u0441\u043C\u044B\u043A\u0430\u044E\u0449\u0438\u0445\u0441\u044F \u043E\u0442 \u043F\u043E\u0442\u0435\u0440\u0438 \u0432\u043E\u0434\u044B" },
    aliases: { pl: ["\u0142uski rogowe"], ru: ["\u0440\u043E\u0433\u043E\u0432\u0430\u044F \u0447\u0435\u0448\u0443\u044F", "\u0440\u043E\u0433\u043E\u0432\u044B\u0435 \u0447\u0435\u0448\u0443\u0438"] },
    tier: 2
  },
  {
    id: "piora",
    name: { pl: "pi\xF3ra", ru: "\u043F\u0435\u0440\u044C\u044F" },
    role: { pl: "rogowe wytwory nask\xF3rka ptak\xF3w: izolacja cieplna i powierzchnia no\u015Bna do lotu", ru: "\u0440\u043E\u0433\u043E\u0432\u044B\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u043D\u044B\u0435 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441\u0430 \u043F\u0442\u0438\u0446: \u0442\u0435\u043F\u043B\u043E\u0438\u0437\u043E\u043B\u044F\u0446\u0438\u044F \u0438 \u043D\u0435\u0441\u0443\u0449\u0430\u044F \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u044C \u0434\u043B\u044F \u043F\u043E\u043B\u0451\u0442\u0430" },
    aliases: { pl: ["pi\xF3ro"], ru: ["\u043F\u0435\u0440\u043E"] },
    tier: 1
  },
  {
    id: "siersc",
    name: { pl: "sier\u015B\u0107", ru: "\u0448\u0435\u0440\u0441\u0442\u044C" },
    role: { pl: "okrywa z w\u0142os\xF3w \u2014 rogowych wytwor\xF3w nask\xF3rka ssak\xF3w \u2014 chroni\u0105ca przed utrat\u0105 ciep\u0142a", ru: "\u043F\u043E\u043A\u0440\u043E\u0432 \u0438\u0437 \u0432\u043E\u043B\u043E\u0441 \u2014 \u0440\u043E\u0433\u043E\u0432\u044B\u0445 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u043D\u044B\u0445 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441\u0430 \u043C\u043B\u0435\u043A\u043E\u043F\u0438\u0442\u0430\u044E\u0449\u0438\u0445, \u2014 \u0437\u0430\u0449\u0438\u0449\u0430\u044E\u0449\u0438\u0439 \u043E\u0442 \u043F\u043E\u0442\u0435\u0440\u0438 \u0442\u0435\u043F\u043B\u0430" },
    aliases: { pl: ["w\u0142osy", "futro"], ru: ["\u0432\u043E\u043B\u043E\u0441\u044B", "\u043C\u0435\u0445"] },
    tier: 1
  },
  {
    id: "gruczol-kuprowy",
    name: { pl: "gruczo\u0142 kuprowy", ru: "\u043A\u043E\u043F\u0447\u0438\u043A\u043E\u0432\u0430\u044F \u0436\u0435\u043B\u0435\u0437\u0430" },
    role: { pl: "gruczo\u0142 ptak\xF3w wydzielaj\u0105cy t\u0142ust\u0105 wydzielin\u0119 do nat\u0142uszczania pi\xF3r", ru: "\u0436\u0435\u043B\u0435\u0437\u0430 \u043F\u0442\u0438\u0446, \u0432\u044B\u0434\u0435\u043B\u044F\u044E\u0449\u0430\u044F \u0436\u0438\u0440\u043E\u0432\u043E\u0439 \u0441\u0435\u043A\u0440\u0435\u0442 \u0434\u043B\u044F \u0441\u043C\u0430\u0437\u044B\u0432\u0430\u043D\u0438\u044F \u043F\u0435\u0440\u044C\u0435\u0432" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "gruczoly-sluzowe",
    name: { pl: "gruczo\u0142y \u015Bluzowe", ru: "\u0441\u043B\u0438\u0437\u0438\u0441\u0442\u044B\u0435 \u0436\u0435\u043B\u0435\u0437\u044B" },
    role: { pl: "gruczo\u0142y sk\xF3ry ryb i p\u0142az\xF3w wydzielaj\u0105ce \u015Bluz, kt\xF3ry nawil\u017Ca sk\xF3r\u0119 i u\u0142atwia ruch w wodzie", ru: "\u0436\u0435\u043B\u0435\u0437\u044B \u043A\u043E\u0436\u0438 \u0440\u044B\u0431 \u0438 \u0437\u0435\u043C\u043D\u043E\u0432\u043E\u0434\u043D\u044B\u0445, \u0432\u044B\u0434\u0435\u043B\u044F\u044E\u0449\u0438\u0435 \u0441\u043B\u0438\u0437\u044C, \u043A\u043E\u0442\u043E\u0440\u0430\u044F \u0443\u0432\u043B\u0430\u0436\u043D\u044F\u0435\u0442 \u043A\u043E\u0436\u0443 \u0438 \u043E\u0431\u043B\u0435\u0433\u0447\u0430\u0435\u0442 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0432 \u0432\u043E\u0434\u0435" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "gruczoly-jadowe",
    name: { pl: "gruczo\u0142y jadowe p\u0142az\xF3w", ru: "\u044F\u0434\u043E\u0432\u0438\u0442\u044B\u0435 \u0436\u0435\u043B\u0435\u0437\u044B \u0437\u0435\u043C\u043D\u043E\u0432\u043E\u0434\u043D\u044B\u0445" },
    role: { pl: "gruczo\u0142y sk\xF3ry p\u0142az\xF3w wydzielaj\u0105ce toksyny odstraszaj\u0105ce drapie\u017Cniki", ru: "\u0436\u0435\u043B\u0435\u0437\u044B \u043A\u043E\u0436\u0438 \u0437\u0435\u043C\u043D\u043E\u0432\u043E\u0434\u043D\u044B\u0445, \u0432\u044B\u0434\u0435\u043B\u044F\u044E\u0449\u0438\u0435 \u0442\u043E\u043A\u0441\u0438\u043D\u044B, \u043E\u0442\u043F\u0443\u0433\u0438\u0432\u0430\u044E\u0449\u0438\u0435 \u0445\u0438\u0449\u043D\u0438\u043A\u043E\u0432" },
    aliases: { pl: ["gruczo\u0142y jadowe"], ru: ["\u044F\u0434\u043E\u0432\u0438\u0442\u044B\u0435 \u0436\u0435\u043B\u0435\u0437\u044B"] },
    tier: 2
  },
  {
    id: "chromatofory",
    name: { pl: "chromatofory", ru: "\u0445\u0440\u043E\u043C\u0430\u0442\u043E\u0444\u043E\u0440\u044B" },
    role: { pl: "kom\xF3rki z barwnikiem umo\u017Cliwiaj\u0105ce zmian\u0119 ubarwienia, np. u kameleona i g\u0142owonog\xF3w", ru: "\u043A\u043B\u0435\u0442\u043A\u0438 \u0441 \u043F\u0438\u0433\u043C\u0435\u043D\u0442\u043E\u043C, \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u044E\u0449\u0438\u0435 \u043C\u0435\u043D\u044F\u0442\u044C \u043E\u043A\u0440\u0430\u0441\u043A\u0443, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u0443 \u0445\u0430\u043C\u0435\u043B\u0435\u043E\u043D\u0430 \u0438 \u0433\u043E\u043B\u043E\u0432\u043E\u043D\u043E\u0433\u0438\u0445" },
    aliases: { pl: ["chromatofor"], ru: ["\u0445\u0440\u043E\u043C\u0430\u0442\u043E\u0444\u043E\u0440"] },
    tier: 2
  },
  {
    id: "oddychanie-skorne",
    name: { pl: "oddychanie sk\xF3rne", ru: "\u043A\u043E\u0436\u043D\u043E\u0435 \u0434\u044B\u0445\u0430\u043D\u0438\u0435" },
    role: { pl: "wymiana gazowa przez cienk\u0105, wilgotn\u0105 i ukrwion\u0105 sk\xF3r\u0119, wa\u017Cna u p\u0142az\xF3w i d\u017Cd\u017Cownic", ru: "\u0433\u0430\u0437\u043E\u043E\u0431\u043C\u0435\u043D \u0447\u0435\u0440\u0435\u0437 \u0442\u043E\u043D\u043A\u0443\u044E, \u0432\u043B\u0430\u0436\u043D\u0443\u044E \u0438 \u0431\u043E\u0433\u0430\u0442\u0443\u044E \u0441\u043E\u0441\u0443\u0434\u0430\u043C\u0438 \u043A\u043E\u0436\u0443, \u0432\u0430\u0436\u043D\u044B\u0439 \u0443 \u0437\u0435\u043C\u043D\u043E\u0432\u043E\u0434\u043D\u044B\u0445 \u0438 \u0434\u043E\u0436\u0434\u0435\u0432\u044B\u0445 \u0447\u0435\u0440\u0432\u0435\u0439" },
    aliases: { pl: ["wymiana gazowa przez sk\xF3r\u0119"], ru: ["\u0434\u044B\u0445\u0430\u043D\u0438\u0435 \u043A\u043E\u0436\u0435\u0439"] },
    tier: 2
  }
];
var ANIMAL_GROUPS = [
  {
    id: "pierscienice",
    group: { pl: "pier\u015Bcienice", ru: "\u043A\u043E\u043B\u044C\u0447\u0430\u0442\u044B\u0435 \u0447\u0435\u0440\u0432\u0438" },
    cover: { pl: "cienka kutykula i wilgotny nab\u0142onek ze \u015Bluzem, przez kt\xF3ry zachodzi oddychanie", ru: "\u0442\u043E\u043D\u043A\u0430\u044F \u043A\u0443\u0442\u0438\u043A\u0443\u043B\u0430 \u0438 \u0432\u043B\u0430\u0436\u043D\u044B\u0439 \u044D\u043F\u0438\u0442\u0435\u043B\u0438\u0439 \u0441\u043E \u0441\u043B\u0438\u0437\u044C\u044E, \u0447\u0435\u0440\u0435\u0437 \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u0438\u0434\u0451\u0442 \u0434\u044B\u0445\u0430\u043D\u0438\u0435" },
    aliases: { pl: ["pier\u015Bcienica"], ru: ["\u043A\u043E\u043B\u044C\u0447\u0430\u0442\u044B\u0439 \u0447\u0435\u0440\u0432\u044C", "\u043A\u043E\u043B\u044C\u0447\u0435\u0446\u044B"] },
    tier: 2
  },
  {
    id: "stawonogi",
    group: { pl: "stawonogi", ru: "\u0447\u043B\u0435\u043D\u0438\u0441\u0442\u043E\u043D\u043E\u0433\u0438\u0435" },
    cover: { pl: "chitynowy szkielet zewn\u0119trzny, zrzucany podczas linienia", ru: "\u0445\u0438\u0442\u0438\u043D\u043E\u0432\u044B\u0439 \u043D\u0430\u0440\u0443\u0436\u043D\u044B\u0439 \u0441\u043A\u0435\u043B\u0435\u0442, \u0441\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0435\u043C\u044B\u0439 \u043F\u0440\u0438 \u043B\u0438\u043D\u044C\u043A\u0435" },
    aliases: { pl: ["stawon\xF3g"], ru: ["\u0447\u043B\u0435\u043D\u0438\u0441\u0442\u043E\u043D\u043E\u0433\u043E\u0435"] },
    tier: 1
  },
  {
    id: "ryby",
    group: { pl: "ryby", ru: "\u0440\u044B\u0431\u044B" },
    cover: { pl: "\u0142uski kostne pokryte sk\xF3r\u0105 z licznymi gruczo\u0142ami \u015Bluzowymi", ru: "\u043A\u043E\u0441\u0442\u043D\u0430\u044F \u0447\u0435\u0448\u0443\u044F, \u043F\u043E\u043A\u0440\u044B\u0442\u0430\u044F \u043A\u043E\u0436\u0435\u0439 \u0441 \u043C\u043D\u043E\u0433\u043E\u0447\u0438\u0441\u043B\u0435\u043D\u043D\u044B\u043C\u0438 \u0441\u043B\u0438\u0437\u0438\u0441\u0442\u044B\u043C\u0438 \u0436\u0435\u043B\u0435\u0437\u0430\u043C\u0438" },
    aliases: { pl: ["ryba"], ru: ["\u0440\u044B\u0431\u0430"] },
    tier: 1
  },
  {
    id: "plazy",
    group: { pl: "p\u0142azy", ru: "\u0437\u0435\u043C\u043D\u043E\u0432\u043E\u0434\u043D\u044B\u0435" },
    cover: { pl: "naga, cienka i wilgotna sk\xF3ra bogata w gruczo\u0142y, uczestnicz\u0105ca w oddychaniu", ru: "\u0433\u043E\u043B\u0430\u044F, \u0442\u043E\u043D\u043A\u0430\u044F \u0438 \u0432\u043B\u0430\u0436\u043D\u0430\u044F \u043A\u043E\u0436\u0430, \u0431\u043E\u0433\u0430\u0442\u0430\u044F \u0436\u0435\u043B\u0435\u0437\u0430\u043C\u0438 \u0438 \u0443\u0447\u0430\u0441\u0442\u0432\u0443\u044E\u0449\u0430\u044F \u0432 \u0434\u044B\u0445\u0430\u043D\u0438\u0438" },
    aliases: { pl: ["p\u0142az"], ru: ["\u0437\u0435\u043C\u043D\u043E\u0432\u043E\u0434\u043D\u043E\u0435", "\u0430\u043C\u0444\u0438\u0431\u0438\u0438"] },
    tier: 1
  },
  {
    id: "gady",
    group: { pl: "gady", ru: "\u043F\u0440\u0435\u0441\u043C\u044B\u043A\u0430\u044E\u0449\u0438\u0435\u0441\u044F" },
    cover: { pl: "sucha sk\xF3ra pokryta rogowymi \u0142uskami, prawie bez gruczo\u0142\xF3w", ru: "\u0441\u0443\u0445\u0430\u044F \u043A\u043E\u0436\u0430 \u0441 \u0440\u043E\u0433\u043E\u0432\u044B\u043C\u0438 \u0447\u0435\u0448\u0443\u044F\u043C\u0438, \u043F\u043E\u0447\u0442\u0438 \u0431\u0435\u0437 \u0436\u0435\u043B\u0451\u0437" },
    aliases: { pl: ["gad"], ru: ["\u043F\u0440\u0435\u0441\u043C\u044B\u043A\u0430\u044E\u0449\u0435\u0435\u0441\u044F", "\u0440\u0435\u043F\u0442\u0438\u043B\u0438\u0438"] },
    tier: 1
  },
  {
    id: "ptaki",
    group: { pl: "ptaki", ru: "\u043F\u0442\u0438\u0446\u044B" },
    cover: { pl: "pi\xF3ra i sucha sk\xF3ra z jednym gruczo\u0142em kuprowym", ru: "\u043F\u0435\u0440\u044C\u044F \u0438 \u0441\u0443\u0445\u0430\u044F \u043A\u043E\u0436\u0430 \u0441 \u0435\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0439 \u043A\u043E\u043F\u0447\u0438\u043A\u043E\u0432\u043E\u0439 \u0436\u0435\u043B\u0435\u0437\u043E\u0439" },
    aliases: { pl: ["ptak"], ru: ["\u043F\u0442\u0438\u0446\u0430"] },
    tier: 1
  },
  {
    id: "ssaki",
    group: { pl: "ssaki", ru: "\u043C\u043B\u0435\u043A\u043E\u043F\u0438\u0442\u0430\u044E\u0449\u0438\u0435" },
    cover: { pl: "w\u0142osy oraz sk\xF3ra z gruczo\u0142ami potowymi, \u0142ojowymi i mlekowymi", ru: "\u0432\u043E\u043B\u043E\u0441\u044B \u0438 \u043A\u043E\u0436\u0430 \u0441 \u043F\u043E\u0442\u043E\u0432\u044B\u043C\u0438, \u0441\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0438 \u043C\u043E\u043B\u043E\u0447\u043D\u044B\u043C\u0438 \u0436\u0435\u043B\u0435\u0437\u0430\u043C\u0438" },
    aliases: { pl: ["ssak"], ru: ["\u043C\u043B\u0435\u043A\u043E\u043F\u0438\u0442\u0430\u044E\u0449\u0435\u0435"] },
    tier: 1
  }
];
var DISEASE_KINDS = {
  bakteryjna: { pl: "choroba bakteryjna", ru: "\u0431\u0430\u043A\u0442\u0435\u0440\u0438\u0430\u043B\u044C\u043D\u0430\u044F \u0431\u043E\u043B\u0435\u0437\u043D\u044C" },
  wirusowa: { pl: "choroba wirusowa", ru: "\u0432\u0438\u0440\u0443\u0441\u043D\u0430\u044F \u0431\u043E\u043B\u0435\u0437\u043D\u044C" },
  grzybicza: { pl: "choroba grzybicza", ru: "\u0433\u0440\u0438\u0431\u043A\u043E\u0432\u0430\u044F \u0431\u043E\u043B\u0435\u0437\u043D\u044C" },
  pasozytnicza: { pl: "choroba paso\u017Cytnicza", ru: "\u043F\u0430\u0440\u0430\u0437\u0438\u0442\u0430\u0440\u043D\u0430\u044F \u0431\u043E\u043B\u0435\u0437\u043D\u044C" },
  autoimmunologiczna: { pl: "choroba autoimmunologiczna", ru: "\u0430\u0443\u0442\u043E\u0438\u043C\u043C\u0443\u043D\u043D\u0430\u044F \u0431\u043E\u043B\u0435\u0437\u043D\u044C" },
  alergiczna: { pl: "choroba alergiczna", ru: "\u0430\u043B\u043B\u0435\u0440\u0433\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0431\u043E\u043B\u0435\u0437\u043D\u044C" },
  nowotworowa: { pl: "nowotw\xF3r z\u0142o\u015Bliwy", ru: "\u0437\u043B\u043E\u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043E\u043F\u0443\u0445\u043E\u043B\u044C" },
  genetyczna: { pl: "choroba genetyczna", ru: "\u0433\u0435\u043D\u0435\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0437\u0430\u0431\u043E\u043B\u0435\u0432\u0430\u043D\u0438\u0435" },
  urazowa: { pl: "uraz (uszkodzenie sk\xF3ry)", ru: "\u0442\u0440\u0430\u0432\u043C\u0430 (\u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435 \u043A\u043E\u0436\u0438)" }
};
var SKIN_DISEASES = [
  {
    id: "tradzik",
    name: { pl: "tr\u0105dzik pospolity", ru: "\u043E\u0431\u044B\u043A\u043D\u043E\u0432\u0435\u043D\u043D\u044B\u0435 \u0443\u0433\u0440\u0438" },
    kind: "bakteryjna",
    cause: { pl: "zatkanie uj\u015B\u0107 gruczo\u0142\xF3w \u0142ojowych i zaka\u017Cenie bakteriami przy nadmiarze \u0142oju w okresie dojrzewania", ru: "\u0437\u0430\u043A\u0443\u043F\u043E\u0440\u043A\u0430 \u043F\u0440\u043E\u0442\u043E\u043A\u043E\u0432 \u0441\u0430\u043B\u044C\u043D\u044B\u0445 \u0436\u0435\u043B\u0451\u0437 \u0438 \u0437\u0430\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0431\u0430\u043A\u0442\u0435\u0440\u0438\u044F\u043C\u0438 \u043F\u0440\u0438 \u0438\u0437\u0431\u044B\u0442\u043A\u0435 \u043A\u043E\u0436\u043D\u043E\u0433\u043E \u0441\u0430\u043B\u0430 \u0432 \u043F\u0435\u0440\u0438\u043E\u0434 \u043F\u043E\u043B\u043E\u0432\u043E\u0433\u043E \u0441\u043E\u0437\u0440\u0435\u0432\u0430\u043D\u0438\u044F" },
    sign: { pl: "zask\xF3rniki, grudki i krostki na twarzy, plecach i dekolcie", ru: "\u043A\u043E\u043C\u0435\u0434\u043E\u043D\u044B, \u043F\u0430\u043F\u0443\u043B\u044B \u0438 \u0433\u043D\u043E\u0439\u043D\u0438\u0447\u043A\u0438 \u043D\u0430 \u043B\u0438\u0446\u0435, \u0441\u043F\u0438\u043D\u0435 \u0438 \u0433\u0440\u0443\u0434\u0438" },
    aliases: { pl: ["tr\u0105dzik"], ru: ["\u0430\u043A\u043D\u0435", "\u0443\u0433\u0440\u0438", "\u0443\u0433\u0440\u0435\u0432\u0430\u044F \u0441\u044B\u043F\u044C"] },
    tier: 1
  },
  {
    id: "grzybica-stop",
    name: { pl: "grzybica st\xF3p", ru: "\u043C\u0438\u043A\u043E\u0437 \u0441\u0442\u043E\u043F" },
    kind: "grzybicza",
    cause: { pl: "zaka\u017Cenie grzybami rozwijaj\u0105cymi si\u0119 w wilgotnym i ciep\u0142ym \u015Brodowisku", ru: "\u0437\u0430\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0433\u0440\u0438\u0431\u0430\u043C\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0440\u0430\u0437\u0432\u0438\u0432\u0430\u044E\u0442\u0441\u044F \u0432\u043E \u0432\u043B\u0430\u0436\u043D\u043E\u0439 \u0438 \u0442\u0451\u043F\u043B\u043E\u0439 \u0441\u0440\u0435\u0434\u0435" },
    sign: { pl: "sw\u0119dzenie, zaczerwienienie i \u0142uszczenie si\u0119 sk\xF3ry mi\u0119dzy palcami st\xF3p", ru: "\u0437\u0443\u0434, \u043F\u043E\u043A\u0440\u0430\u0441\u043D\u0435\u043D\u0438\u0435 \u0438 \u0448\u0435\u043B\u0443\u0448\u0435\u043D\u0438\u0435 \u043A\u043E\u0436\u0438 \u043C\u0435\u0436\u0434\u0443 \u043F\u0430\u043B\u044C\u0446\u0430\u043C\u0438 \u043D\u043E\u0433" },
    aliases: { pl: ["grzybica", "stopa atlety"], ru: ["\u0433\u0440\u0438\u0431\u043E\u043A \u0441\u0442\u043E\u043F\u044B", "\u0433\u0440\u0438\u0431\u043E\u043A", "\u043C\u0438\u043A\u043E\u0437"] },
    tier: 1
  },
  {
    id: "luszczyca",
    name: { pl: "\u0142uszczyca", ru: "\u043F\u0441\u043E\u0440\u0438\u0430\u0437" },
    kind: "autoimmunologiczna",
    cause: { pl: "reakcja uk\u0142adu odporno\u015Bciowego przyspieszaj\u0105ca podzia\u0142y kom\xF3rek nask\xF3rka", ru: "\u0440\u0435\u0430\u043A\u0446\u0438\u044F \u0438\u043C\u043C\u0443\u043D\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B, \u0443\u0441\u043A\u043E\u0440\u044F\u044E\u0449\u0430\u044F \u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043A\u043B\u0435\u0442\u043E\u043A \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441\u0430" },
    sign: { pl: "czerwone, wyra\u017Anie odgraniczone plamy pokryte srebrzystymi \u0142uskami", ru: "\u043A\u0440\u0430\u0441\u043D\u044B\u0435 \u0447\u0451\u0442\u043A\u043E \u043E\u0447\u0435\u0440\u0447\u0435\u043D\u043D\u044B\u0435 \u0431\u043B\u044F\u0448\u043A\u0438, \u043F\u043E\u043A\u0440\u044B\u0442\u044B\u0435 \u0441\u0435\u0440\u0435\u0431\u0440\u0438\u0441\u0442\u044B\u043C\u0438 \u0447\u0435\u0448\u0443\u0439\u043A\u0430\u043C\u0438" },
    aliases: { pl: [], ru: ["\u0447\u0435\u0448\u0443\u0439\u0447\u0430\u0442\u044B\u0439 \u043B\u0438\u0448\u0430\u0439"] },
    tier: 2
  },
  {
    id: "azs",
    name: { pl: "atopowe zapalenie sk\xF3ry", ru: "\u0430\u0442\u043E\u043F\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0434\u0435\u0440\u043C\u0430\u0442\u0438\u0442" },
    kind: "alergiczna",
    cause: { pl: "wrodzona sk\u0142onno\u015B\u0107 do alergii i uszkodzona bariera nask\xF3rka", ru: "\u0432\u0440\u043E\u0436\u0434\u0451\u043D\u043D\u0430\u044F \u0441\u043A\u043B\u043E\u043D\u043D\u043E\u0441\u0442\u044C \u043A \u0430\u043B\u043B\u0435\u0440\u0433\u0438\u0438 \u0438 \u043D\u0430\u0440\u0443\u0448\u0435\u043D\u043D\u044B\u0439 \u0431\u0430\u0440\u044C\u0435\u0440 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441\u0430" },
    sign: { pl: "sucha, silnie sw\u0119dz\u0105ca sk\xF3ra z nawracaj\u0105cymi wypryskami w zgi\u0119ciach \u0142okci i kolan", ru: "\u0441\u0443\u0445\u0430\u044F, \u0441\u0438\u043B\u044C\u043D\u043E \u0437\u0443\u0434\u044F\u0449\u0430\u044F \u043A\u043E\u0436\u0430 \u0441 \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u044E\u0449\u0435\u0439\u0441\u044F \u0441\u044B\u043F\u044C\u044E \u043D\u0430 \u0441\u0433\u0438\u0431\u0430\u0445 \u043B\u043E\u043A\u0442\u0435\u0439 \u0438 \u043A\u043E\u043B\u0435\u043D\u0435\u0439" },
    aliases: { pl: ["AZS", "egzema atopowa"], ru: ["\u0410\u0442\u0414", "\u0430\u0442\u043E\u043F\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u044D\u043A\u0437\u0435\u043C\u0430", "\u043D\u0435\u0439\u0440\u043E\u0434\u0435\u0440\u043C\u0438\u0442"] },
    tier: 2
  },
  {
    id: "pokrzywka",
    name: { pl: "pokrzywka", ru: "\u043A\u0440\u0430\u043F\u0438\u0432\u043D\u0438\u0446\u0430" },
    kind: "alergiczna",
    cause: { pl: "uwolnienie histaminy w sk\xF3rze po kontakcie z alergenem", ru: "\u0432\u044B\u0431\u0440\u043E\u0441 \u0433\u0438\u0441\u0442\u0430\u043C\u0438\u043D\u0430 \u0432 \u043A\u043E\u0436\u0435 \u043F\u043E\u0441\u043B\u0435 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0430 \u0441 \u0430\u043B\u043B\u0435\u0440\u0433\u0435\u043D\u043E\u043C" },
    sign: { pl: "sw\u0119dz\u0105ce b\u0105ble przypominaj\u0105ce oparzenie pokrzyw\u0105, szybko znikaj\u0105ce", ru: "\u0437\u0443\u0434\u044F\u0449\u0438\u0435 \u0432\u043E\u043B\u0434\u044B\u0440\u0438, \u043F\u043E\u0445\u043E\u0436\u0438\u0435 \u043D\u0430 \u043E\u0436\u043E\u0433 \u043A\u0440\u0430\u043F\u0438\u0432\u043E\u0439, \u0431\u044B\u0441\u0442\u0440\u043E \u0438\u0441\u0447\u0435\u0437\u0430\u044E\u0449\u0438\u0435" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "czerniak",
    name: { pl: "czerniak", ru: "\u043C\u0435\u043B\u0430\u043D\u043E\u043C\u0430" },
    kind: "nowotworowa",
    cause: { pl: "nowotworowe namna\u017Canie melanocyt\xF3w, kt\xF3remu sprzyja nadmiar promieniowania UV", ru: "\u043E\u043F\u0443\u0445\u043E\u043B\u0435\u0432\u043E\u0435 \u0440\u0430\u0437\u043C\u043D\u043E\u0436\u0435\u043D\u0438\u0435 \u043C\u0435\u043B\u0430\u043D\u043E\u0446\u0438\u0442\u043E\u0432, \u043A\u043E\u0442\u043E\u0440\u043E\u043C\u0443 \u0441\u043F\u043E\u0441\u043E\u0431\u0441\u0442\u0432\u0443\u0435\u0442 \u0438\u0437\u0431\u044B\u0442\u043E\u043A \u0443\u043B\u044C\u0442\u0440\u0430\u0444\u0438\u043E\u043B\u0435\u0442\u0430" },
    sign: { pl: "znami\u0119 o nieregularnym brzegu i niejednolitej barwie, kt\xF3re szybko si\u0119 powi\u0119ksza", ru: "\u0440\u043E\u0434\u0438\u043D\u043A\u0430 \u0441 \u043D\u0435\u0440\u043E\u0432\u043D\u044B\u043C \u043A\u0440\u0430\u0435\u043C \u0438 \u043D\u0435\u043E\u0434\u043D\u043E\u0440\u043E\u0434\u043D\u043E\u0439 \u043E\u043A\u0440\u0430\u0441\u043A\u043E\u0439, \u043A\u043E\u0442\u043E\u0440\u0430\u044F \u0431\u044B\u0441\u0442\u0440\u043E \u0440\u0430\u0441\u0442\u0451\u0442" },
    aliases: { pl: ["czerniak z\u0142o\u015Bliwy"], ru: ["\u0437\u043B\u043E\u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0435\u043B\u0430\u043D\u043E\u043C\u0430"] },
    tier: 2
  },
  {
    id: "brodawki",
    name: { pl: "brodawki", ru: "\u0431\u043E\u0440\u043E\u0434\u0430\u0432\u043A\u0438" },
    kind: "wirusowa",
    cause: { pl: "zaka\u017Cenie wirusem brodawczaka ludzkiego (HPV)", ru: "\u0437\u0430\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0432\u0438\u0440\u0443\u0441\u043E\u043C \u043F\u0430\u043F\u0438\u043B\u043B\u043E\u043C\u044B \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430 (\u0412\u041F\u0427)" },
    sign: { pl: "twarde, szorstkie grudki na d\u0142oniach lub podeszwach st\xF3p", ru: "\u0442\u0432\u0451\u0440\u0434\u044B\u0435 \u0448\u0435\u0440\u0448\u0430\u0432\u044B\u0435 \u0443\u0437\u0435\u043B\u043A\u0438 \u043D\u0430 \u043A\u0438\u0441\u0442\u044F\u0445 \u0438\u043B\u0438 \u043F\u043E\u0434\u043E\u0448\u0432\u0430\u0445" },
    aliases: { pl: ["kurzajki", "brodawka"], ru: ["\u0431\u043E\u0440\u043E\u0434\u0430\u0432\u043A\u0430"] },
    tier: 1
  },
  {
    id: "opryszczka",
    name: { pl: "opryszczka wargowa", ru: "\u0433\u0435\u0440\u043F\u0435\u0441 \u0433\u0443\u0431" },
    kind: "wirusowa",
    cause: { pl: "wirus opryszczki pozostaj\u0105cy w nerwach i uaktywniaj\u0105cy si\u0119 przy spadku odporno\u015Bci", ru: "\u0432\u0438\u0440\u0443\u0441 \u0433\u0435\u0440\u043F\u0435\u0441\u0430, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0449\u0438\u0439\u0441\u044F \u0432 \u043D\u0435\u0440\u0432\u0430\u0445 \u0438 \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u0443\u044E\u0449\u0438\u0439\u0441\u044F \u043F\u0440\u0438 \u0441\u043D\u0438\u0436\u0435\u043D\u0438\u0438 \u0438\u043C\u043C\u0443\u043D\u0438\u0442\u0435\u0442\u0430" },
    sign: { pl: "bolesne p\u0119cherzyki z p\u0142ynem na brzegu warg", ru: "\u0431\u043E\u043B\u0435\u0437\u043D\u0435\u043D\u043D\u044B\u0435 \u043F\u0443\u0437\u044B\u0440\u044C\u043A\u0438 \u0441 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u044C\u044E \u043D\u0430 \u043A\u0440\u0430\u044E \u0433\u0443\u0431" },
    aliases: { pl: ["opryszczka", "herpes"], ru: ["\u0433\u0435\u0440\u043F\u0435\u0441", "\u043F\u0440\u043E\u0441\u0442\u0443\u0434\u0430 \u043D\u0430 \u0433\u0443\u0431\u0430\u0445"] },
    tier: 1
  },
  {
    id: "swierzb",
    name: { pl: "\u015Bwierzb", ru: "\u0447\u0435\u0441\u043E\u0442\u043A\u0430" },
    kind: "pasozytnicza",
    cause: { pl: "\u015Bwierzbowiec dr\u0105\u017C\u0105cy korytarze w nask\xF3rku", ru: "\u0447\u0435\u0441\u043E\u0442\u043E\u0447\u043D\u044B\u0439 \u043A\u043B\u0435\u0449, \u043F\u0440\u043E\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u044E\u0449\u0438\u0439 \u0445\u043E\u0434\u044B \u0432 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441\u0435" },
    sign: { pl: "silny \u015Bwi\u0105d nasilaj\u0105cy si\u0119 w nocy, zw\u0142aszcza mi\u0119dzy palcami d\u0142oni", ru: "\u0441\u0438\u043B\u044C\u043D\u044B\u0439 \u0437\u0443\u0434, \u0443\u0441\u0438\u043B\u0438\u0432\u0430\u044E\u0449\u0438\u0439\u0441\u044F \u043D\u043E\u0447\u044C\u044E, \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E \u043C\u0435\u0436\u0434\u0443 \u043F\u0430\u043B\u044C\u0446\u0430\u043C\u0438 \u0440\u0443\u043A" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "wszawica",
    name: { pl: "wszawica", ru: "\u043F\u0435\u0434\u0438\u043A\u0443\u043B\u0451\u0437" },
    kind: "pasozytnicza",
    cause: { pl: "wszy \u017Cywi\u0105ce si\u0119 krwi\u0105 i sk\u0142adaj\u0105ce jaja (gnidy) na w\u0142osach", ru: "\u0432\u0448\u0438, \u043F\u0438\u0442\u0430\u044E\u0449\u0438\u0435\u0441\u044F \u043A\u0440\u043E\u0432\u044C\u044E \u0438 \u043E\u0442\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u044E\u0449\u0438\u0435 \u044F\u0439\u0446\u0430 (\u0433\u043D\u0438\u0434\u044B) \u043D\u0430 \u0432\u043E\u043B\u043E\u0441\u0430\u0445" },
    sign: { pl: "sw\u0119dzenie sk\xF3ry g\u0142owy i widoczne gnidy przyklejone do w\u0142os\xF3w", ru: "\u0437\u0443\u0434 \u043A\u043E\u0436\u0438 \u0433\u043E\u043B\u043E\u0432\u044B \u0438 \u0437\u0430\u043C\u0435\u0442\u043D\u044B\u0435 \u0433\u043D\u0438\u0434\u044B, \u043F\u0440\u0438\u043A\u043B\u0435\u0435\u043D\u043D\u044B\u0435 \u043A \u0432\u043E\u043B\u043E\u0441\u0430\u043C" },
    aliases: { pl: [], ru: ["\u0432\u0448\u0438\u0432\u043E\u0441\u0442\u044C"] },
    tier: 1
  },
  {
    id: "bielactwo",
    name: { pl: "bielactwo nabyte", ru: "\u0432\u0438\u0442\u0438\u043B\u0438\u0433\u043E" },
    kind: "autoimmunologiczna",
    cause: { pl: "niszczenie melanocyt\xF3w przez w\u0142asny uk\u0142ad odporno\u015Bciowy", ru: "\u0440\u0430\u0437\u0440\u0443\u0448\u0435\u043D\u0438\u0435 \u043C\u0435\u043B\u0430\u043D\u043E\u0446\u0438\u0442\u043E\u0432 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0439 \u0438\u043C\u043C\u0443\u043D\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u043E\u0439" },
    sign: { pl: "bia\u0142e, odbarwione plamy na sk\xF3rze pojawiaj\u0105ce si\u0119 w ci\u0105gu \u017Cycia", ru: "\u0431\u0435\u043B\u044B\u0435 \u043E\u0431\u0435\u0441\u0446\u0432\u0435\u0447\u0435\u043D\u043D\u044B\u0435 \u043F\u044F\u0442\u043D\u0430 \u043D\u0430 \u043A\u043E\u0436\u0435, \u043F\u043E\u044F\u0432\u043B\u044F\u044E\u0449\u0438\u0435\u0441\u044F \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u0436\u0438\u0437\u043D\u0438" },
    aliases: { pl: ["bielactwo", "vitiligo"], ru: ["\u043B\u0435\u0439\u043A\u043E\u0434\u0435\u0440\u043C\u0430"] },
    tier: 2
  },
  {
    id: "albinizm",
    name: { pl: "albinizm", ru: "\u0430\u043B\u044C\u0431\u0438\u043D\u0438\u0437\u043C" },
    kind: "genetyczna",
    cause: { pl: "wrodzony brak melaniny wynikaj\u0105cy z mutacji genu", ru: "\u0432\u0440\u043E\u0436\u0434\u0451\u043D\u043D\u043E\u0435 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435 \u043C\u0435\u043B\u0430\u043D\u0438\u043D\u0430 \u0438\u0437-\u0437\u0430 \u043C\u0443\u0442\u0430\u0446\u0438\u0438 \u0433\u0435\u043D\u0430" },
    sign: { pl: "bardzo jasna sk\xF3ra i w\u0142osy od urodzenia oraz nadwra\u017Cliwo\u015B\u0107 na s\u0142o\u0144ce", ru: "\u043E\u0447\u0435\u043D\u044C \u0441\u0432\u0435\u0442\u043B\u044B\u0435 \u043A\u043E\u0436\u0430 \u0438 \u0432\u043E\u043B\u043E\u0441\u044B \u0441 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u0438 \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u0430\u044F \u0447\u0443\u0432\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043A \u0441\u043E\u043B\u043D\u0446\u0443" },
    aliases: { pl: ["bielactwo wrodzone"], ru: [] },
    tier: 1
  },
  {
    id: "oparzenie-1",
    name: { pl: "oparzenie I stopnia", ru: "\u043E\u0436\u043E\u0433 I \u0441\u0442\u0435\u043F\u0435\u043D\u0438" },
    kind: "urazowa",
    cause: { pl: "kr\xF3tkie dzia\u0142anie wysokiej temperatury lub s\u0142o\u0144ca, uszkadzaj\u0105ce tylko nask\xF3rek", ru: "\u043A\u0440\u0430\u0442\u043A\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B \u0438\u043B\u0438 \u0441\u043E\u043B\u043D\u0446\u0430, \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0430\u044E\u0449\u0435\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441" },
    sign: { pl: "zaczerwienienie i b\xF3l sk\xF3ry bez p\u0119cherzy", ru: "\u043F\u043E\u043A\u0440\u0430\u0441\u043D\u0435\u043D\u0438\u0435 \u0438 \u0431\u043E\u043B\u044C \u043A\u043E\u0436\u0438 \u0431\u0435\u0437 \u043F\u0443\u0437\u044B\u0440\u0435\u0439" },
    aliases: { pl: ["oparzenie pierwszego stopnia", "oparzenie 1 stopnia"], ru: ["\u043E\u0436\u043E\u0433 \u043F\u0435\u0440\u0432\u043E\u0439 \u0441\u0442\u0435\u043F\u0435\u043D\u0438", "\u043E\u0436\u043E\u0433 1 \u0441\u0442\u0435\u043F\u0435\u043D\u0438"] },
    tier: 2
  },
  {
    id: "oparzenie-2",
    name: { pl: "oparzenie II stopnia", ru: "\u043E\u0436\u043E\u0433 II \u0441\u0442\u0435\u043F\u0435\u043D\u0438" },
    kind: "urazowa",
    cause: { pl: "dzia\u0142anie wysokiej temperatury uszkadzaj\u0105ce nask\xF3rek i cz\u0119\u015B\u0107 sk\xF3ry w\u0142a\u015Bciwej", ru: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B, \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0430\u044E\u0449\u0435\u0435 \u044D\u043F\u0438\u0434\u0435\u0440\u043C\u0438\u0441 \u0438 \u0447\u0430\u0441\u0442\u044C \u0434\u0435\u0440\u043C\u044B" },
    sign: { pl: "p\u0119cherze wype\u0142nione p\u0142ynem surowiczym i silny b\xF3l", ru: "\u043F\u0443\u0437\u044B\u0440\u0438 \u0441 \u0441\u0435\u0440\u043E\u0437\u043D\u043E\u0439 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u044C\u044E \u0438 \u0441\u0438\u043B\u044C\u043D\u0430\u044F \u0431\u043E\u043B\u044C" },
    aliases: { pl: ["oparzenie drugiego stopnia", "oparzenie 2 stopnia"], ru: ["\u043E\u0436\u043E\u0433 \u0432\u0442\u043E\u0440\u043E\u0439 \u0441\u0442\u0435\u043F\u0435\u043D\u0438", "\u043E\u0436\u043E\u0433 2 \u0441\u0442\u0435\u043F\u0435\u043D\u0438"] },
    tier: 2
  },
  {
    id: "odlezyny",
    name: { pl: "odle\u017Cyny", ru: "\u043F\u0440\u043E\u043B\u0435\u0436\u043D\u0438" },
    kind: "urazowa",
    cause: { pl: "d\u0142ugotrwa\u0142y ucisk sk\xF3ry u os\xF3b le\u017C\u0105cych, kt\xF3ry odcina dop\u0142yw krwi", ru: "\u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0441\u0434\u0430\u0432\u043B\u0438\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u0436\u0438 \u0443 \u043B\u0435\u0436\u0430\u0447\u0438\u0445 \u0431\u043E\u043B\u044C\u043D\u044B\u0445, \u043F\u0440\u0435\u043A\u0440\u0430\u0449\u0430\u044E\u0449\u0435\u0435 \u043F\u0440\u0438\u0442\u043E\u043A \u043A\u0440\u043E\u0432\u0438" },
    sign: { pl: "rany i martwica sk\xF3ry nad wystaj\u0105cymi ko\u015B\u0107mi, np. nad ko\u015Bci\u0105 krzy\u017Cow\u0105", ru: "\u0440\u0430\u043D\u044B \u0438 \u043E\u043C\u0435\u0440\u0442\u0432\u0435\u043D\u0438\u0435 \u043A\u043E\u0436\u0438 \u043D\u0430\u0434 \u0432\u044B\u0441\u0442\u0443\u043F\u0430\u044E\u0449\u0438\u043C\u0438 \u043A\u043E\u0441\u0442\u044F\u043C\u0438, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u043D\u0430\u0434 \u043A\u0440\u0435\u0441\u0442\u0446\u043E\u043C" },
    aliases: { pl: ["odle\u017Cyna"], ru: ["\u043F\u0440\u043E\u043B\u0435\u0436\u0435\u043D\u044C"] },
    tier: 2
  }
];
var SKIN_RISKS = [
  {
    id: "uv",
    risk: { pl: "oparzenie s\u0142oneczne i przedwczesne starzenie si\u0119 sk\xF3ry", ru: "\u0441\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0439 \u043E\u0436\u043E\u0433 \u0438 \u043F\u0440\u0435\u0436\u0434\u0435\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0435 \u0441\u0442\u0430\u0440\u0435\u043D\u0438\u0435 \u043A\u043E\u0436\u0438" },
    rule: { pl: "krem z filtrem UV i unikanie s\u0142o\u0144ca w po\u0142udnie", ru: "\u043A\u0440\u0435\u043C \u0441 \u0423\u0424-\u0444\u0438\u043B\u044C\u0442\u0440\u043E\u043C \u0438 \u0438\u0437\u0431\u0435\u0433\u0430\u043D\u0438\u0435 \u0441\u043E\u043B\u043D\u0446\u0430 \u0432 \u043F\u043E\u043B\u0434\u0435\u043D\u044C" },
    tier: 1
  },
  {
    id: "znamiona",
    risk: { pl: "p\xF3\u017Ane wykrycie czerniaka", ru: "\u043F\u043E\u0437\u0434\u043D\u0435\u0435 \u0432\u044B\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u043C\u0435\u043B\u0430\u043D\u043E\u043C\u044B" },
    rule: { pl: "regularne ogl\u0105danie znamion wed\u0142ug regu\u0142y ABCDE", ru: "\u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0439 \u043E\u0441\u043C\u043E\u0442\u0440 \u0440\u043E\u0434\u0438\u043D\u043E\u043A \u043F\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u0443 ABCDE" },
    tier: 2
  },
  {
    id: "grzybica",
    risk: { pl: "grzybica st\xF3p", ru: "\u043C\u0438\u043A\u043E\u0437 \u0441\u0442\u043E\u043F" },
    rule: { pl: "dok\u0142adne osuszanie st\xF3p i w\u0142asne klapki na basenie", ru: "\u0442\u0449\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0432\u044B\u0442\u0438\u0440\u0430\u0442\u044C \u0441\u0442\u043E\u043F\u044B \u0438 \u043D\u043E\u0441\u0438\u0442\u044C \u0441\u0432\u043E\u0438 \u0448\u043B\u0451\u043F\u0430\u043D\u0446\u044B \u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0435" },
    tier: 1
  },
  {
    id: "tradzik",
    risk: { pl: "nasilenie tr\u0105dziku i blizny", ru: "\u0443\u0441\u0438\u043B\u0435\u043D\u0438\u0435 \u0443\u0433\u0440\u0435\u0439 \u0438 \u0440\u0443\u0431\u0446\u044B" },
    rule: { pl: "mycie twarzy \u0142agodnym \u015Brodkiem i niewyciskanie zmian", ru: "\u0443\u043C\u044B\u0432\u0430\u043D\u0438\u0435 \u043C\u044F\u0433\u043A\u0438\u043C \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u043E\u043C \u0438 \u043E\u0442\u043A\u0430\u0437 \u043E\u0442 \u0432\u044B\u0434\u0430\u0432\u043B\u0438\u0432\u0430\u043D\u0438\u044F" },
    tier: 1
  },
  {
    id: "solarium",
    risk: { pl: "rak sk\xF3ry po sztucznym opalaniu", ru: "\u0440\u0430\u043A \u043A\u043E\u0436\u0438 \u043F\u043E\u0441\u043B\u0435 \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u0437\u0430\u0433\u0430\u0440\u0430" },
    rule: { pl: "rezygnacja z solarium, zw\u0142aszcza przed 18. rokiem \u017Cycia", ru: "\u043E\u0442\u043A\u0430\u0437 \u043E\u0442 \u0441\u043E\u043B\u044F\u0440\u0438\u044F, \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E \u0434\u043E 18 \u043B\u0435\u0442" },
    tier: 1
  },
  {
    id: "wszawica",
    risk: { pl: "wszawica", ru: "\u043F\u0435\u0434\u0438\u043A\u0443\u043B\u0451\u0437" },
    rule: { pl: "w\u0142asny grzebie\u0144, szczotka i nakrycie g\u0142owy", ru: "\u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0440\u0430\u0441\u0447\u0451\u0441\u043A\u0430, \u0449\u0451\u0442\u043A\u0430 \u0438 \u0433\u043E\u043B\u043E\u0432\u043D\u043E\u0439 \u0443\u0431\u043E\u0440" },
    tier: 1
  },
  {
    id: "odlezyny",
    risk: { pl: "odle\u017Cyny u osoby le\u017C\u0105cej", ru: "\u043F\u0440\u043E\u043B\u0435\u0436\u043D\u0438 \u0443 \u043B\u0435\u0436\u0430\u0447\u0435\u0433\u043E \u0431\u043E\u043B\u044C\u043D\u043E\u0433\u043E" },
    rule: { pl: "zmiana u\u0142o\u017Cenia chorego co 2 godziny", ru: "\u0441\u043C\u0435\u043D\u0430 \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u044F \u0431\u043E\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u0430\u0436\u0434\u044B\u0435 2 \u0447\u0430\u0441\u0430" },
    tier: 2
  }
];

// packages/trainers/bio/src/server/templates/topics/lo3Skin.ts
var TOPIC5 = "bio.lo3.skin";
var ANIMALS = { pl: "uk\u0142ad pow\u0142okowy zwierz\u0105t", ru: "\u043F\u043E\u043A\u0440\u043E\u0432\u044B \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445" };
var DISEASES2 = { pl: "choroby sk\xF3ry", ru: "\u0431\u043E\u043B\u0435\u0437\u043D\u0438 \u043A\u043E\u0436\u0438" };
var HYGIENE = { pl: "higiena sk\xF3ry", ru: "\u0433\u0438\u0433\u0438\u0435\u043D\u0430 \u043A\u043E\u0436\u0438" };
var integument = pairFromTable({
  topicId: TOPIC5,
  paragraph: P.skin.animals,
  slug: "integument",
  rows: ANIMAL_INTEGUMENT,
  subtopic: ANIMALS,
  shift: 1,
  label: { pl: "Poj\u0119cie", ru: "\u041F\u043E\u043D\u044F\u0442\u0438\u0435" },
  misconception: {
    pl: "wytw\xF3r lub cecha pow\u0142ok innej grupy zwierz\u0105t",
    ru: "\u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u043D\u043E\u0435 \u0438\u043B\u0438 \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u043F\u043E\u043A\u0440\u043E\u0432\u043E\u0432 \u0434\u0440\u0443\u0433\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"
  }
});
var groupToCover = choiceFromTable({
  id: `${TOPIC5}.group-to-cover`,
  topicId: TOPIC5,
  paragraph: P.skin.animals,
  rows: ANIMAL_GROUPS,
  subtopic: ANIMALS,
  difficulty: (r) => r.tier,
  shift: 3,
  question: (r, lang) => lang === "pl" ? `Grupa zwierz\u0105t: ${r.group.pl}. Jak wygl\u0105da ich pokrycie cia\u0142a?` : `\u0413\u0440\u0443\u043F\u043F\u0430 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445: ${r.group.ru}. \u041A\u0430\u043A\u043E\u0432\u044B \u0438\u0445 \u043F\u043E\u043A\u0440\u043E\u0432\u044B?`,
  optionText: (r, lang) => r.cover[lang],
  misconception: { pl: "pokrycie cia\u0142a s\u0105siedniej grupy zwierz\u0105t", ru: "\u043F\u043E\u043A\u0440\u043E\u0432\u044B \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u044B \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445" },
  solution: (r, lang) => lang === "pl" ? `${cap(r.group.pl)}: ${r.cover.pl}.` : `${cap(r.group.ru)}: ${r.cover.ru}.`
});
var coverToGroup = termFromTable({
  id: `${TOPIC5}.cover-to-group`,
  topicId: TOPIC5,
  paragraph: P.skin.animals,
  rows: ANIMAL_GROUPS,
  subtopic: ANIMALS,
  difficulty: (r) => r.tier,
  question: (r, lang) => lang === "pl" ? `Pokrycie cia\u0142a: ${r.cover.pl}. Jaka to grupa zwierz\u0105t? Podaj nazw\u0119 w liczbie mnogiej.` : `\u041F\u043E\u043A\u0440\u043E\u0432\u044B: ${r.cover.ru}. \u041A\u0430\u043A\u0430\u044F \u044D\u0442\u043E \u0433\u0440\u0443\u043F\u043F\u0430 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445? \u041D\u0430\u0437\u043E\u0432\u0438 \u0432\u043E \u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u043C \u0447\u0438\u0441\u043B\u0435.`,
  term: (r, lang) => r.group[lang],
  aliases: (r) => [r.group.pl, r.group.ru, ...r.aliases.pl, ...r.aliases.ru],
  solution: (r, lang) => lang === "pl" ? `Odpowied\u017A: ${r.group.pl}.` : `\u041E\u0442\u0432\u0435\u0442: ${r.group.ru}.`
});
var diseaseToCause = choiceFromTable({
  id: `${TOPIC5}.disease-to-cause`,
  topicId: TOPIC5,
  paragraph: P.skin.disorders,
  rows: SKIN_DISEASES,
  subtopic: DISEASES2,
  tags: ["choroby"],
  difficulty: (r) => r.tier,
  shift: 0,
  question: (r, lang) => lang === "pl" ? `Choroba: ${r.name.pl}. Co j\u0105 wywo\u0142uje?` : `\u0411\u043E\u043B\u0435\u0437\u043D\u044C: ${r.name.ru}. \u0427\u0442\u043E \u0435\u0451 \u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442?`,
  optionText: (r, lang) => r.cause[lang],
  misconception: { pl: "przyczyna innej choroby sk\xF3ry", ru: "\u043F\u0440\u0438\u0447\u0438\u043D\u0430 \u0434\u0440\u0443\u0433\u043E\u0439 \u0431\u043E\u043B\u0435\u0437\u043D\u0438 \u043A\u043E\u0436\u0438" },
  hint: (r, lang) => lang === "pl" ? `Rodzaj: ${DISEASE_KINDS[r.kind].pl}.` : `\u0412\u0438\u0434: ${DISEASE_KINDS[r.kind].ru}.`,
  solution: (r, lang) => lang === "pl" ? `${cap(r.name.pl)}: ${r.cause.pl}. Objawy: ${r.sign.pl}.` : `${cap(r.name.ru)}: ${r.cause.ru}. \u0421\u0438\u043C\u043F\u0442\u043E\u043C\u044B: ${r.sign.ru}.`
});
var signToDisease = termFromTable({
  id: `${TOPIC5}.sign-to-disease`,
  topicId: TOPIC5,
  paragraph: P.skin.disorders,
  rows: SKIN_DISEASES,
  subtopic: DISEASES2,
  tags: ["choroby"],
  difficulty: (r) => r.tier,
  question: (r, lang) => lang === "pl" ? `Objawy: ${r.sign.pl}. Podaj nazw\u0119 choroby.` : `\u0421\u0438\u043C\u043F\u0442\u043E\u043C\u044B: ${r.sign.ru}. \u041D\u0430\u0437\u043E\u0432\u0438 \u0431\u043E\u043B\u0435\u0437\u043D\u044C.`,
  term: (r, lang) => r.name[lang],
  aliases: (r) => [r.name.pl, r.name.ru, ...r.aliases.pl, ...r.aliases.ru],
  hint: (r, lang) => lang === "pl" ? `Rodzaj: ${DISEASE_KINDS[r.kind].pl}.` : `\u0412\u0438\u0434: ${DISEASE_KINDS[r.kind].ru}.`,
  solution: (r, lang) => lang === "pl" ? `Odpowied\u017A: ${r.name.pl}. Przyczyna: ${r.cause.pl}.` : `\u041E\u0442\u0432\u0435\u0442: ${r.name.ru}. \u041F\u0440\u0438\u0447\u0438\u043D\u0430: ${r.cause.ru}.`
});
var diseaseToKind = choiceFromTable({
  id: `${TOPIC5}.disease-to-kind`,
  topicId: TOPIC5,
  paragraph: P.skin.disorders,
  rows: SKIN_DISEASES,
  subtopic: DISEASES2,
  tags: ["choroby"],
  difficulty: (r) => r.tier,
  shift: 2,
  question: (r, lang) => lang === "pl" ? `Choroba: ${r.name.pl}. Do jakiej grupy chor\xF3b nale\u017Cy?` : `\u0411\u043E\u043B\u0435\u0437\u043D\u044C: ${r.name.ru}. \u041A \u043A\u0430\u043A\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u0435 \u0431\u043E\u043B\u0435\u0437\u043D\u0435\u0439 \u043E\u043D\u0430 \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0441\u044F?`,
  // rows of the same kind collide on this text; pickDistractors skips them, and nine kinds leave plenty
  optionText: (r, lang) => DISEASE_KINDS[r.kind][lang],
  misconception: { pl: "rodzaj innej choroby sk\xF3ry", ru: "\u0432\u0438\u0434 \u0434\u0440\u0443\u0433\u043E\u0439 \u0431\u043E\u043B\u0435\u0437\u043D\u0438 \u043A\u043E\u0436\u0438" },
  solution: (r, lang) => lang === "pl" ? `${cap(r.name.pl)} \u2014 ${DISEASE_KINDS[r.kind].pl}: ${r.cause.pl}.` : `${cap(r.name.ru)} \u2014 ${DISEASE_KINDS[r.kind].ru}: ${r.cause.ru}.`
});
var riskToRule = choiceFromTable({
  id: `${TOPIC5}.risk-to-rule`,
  topicId: TOPIC5,
  paragraph: P.skin.disorders,
  rows: SKIN_RISKS,
  subtopic: HYGIENE,
  tags: ["choroby"],
  difficulty: (r) => r.tier,
  shift: 1,
  question: (r, lang) => lang === "pl" ? `Zagro\u017Cenie: ${r.risk.pl}. Jaka zasada higieny przed nim chroni?` : `\u0423\u0433\u0440\u043E\u0437\u0430: ${r.risk.ru}. \u041A\u0430\u043A\u043E\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u043E \u0433\u0438\u0433\u0438\u0435\u043D\u044B \u0437\u0430\u0449\u0438\u0449\u0430\u0435\u0442 \u043E\u0442 \u043D\u0435\u0451?`,
  optionText: (r, lang) => r.rule[lang],
  misconception: { pl: "zasada chroni\u0105ca przed innym zagro\u017Ceniem", ru: "\u043F\u0440\u0430\u0432\u0438\u043B\u043E, \u0437\u0430\u0449\u0438\u0449\u0430\u044E\u0449\u0435\u0435 \u043E\u0442 \u0434\u0440\u0443\u0433\u043E\u0439 \u0443\u0433\u0440\u043E\u0437\u044B" },
  solution: (r, lang) => lang === "pl" ? `${cap(r.risk.pl)} \u2192 ${r.rule.pl}.` : `${cap(r.risk.ru)} \u2192 ${r.rule.ru}.`
});
var lo3SkinTemplates = [
  ...integument,
  groupToCover,
  coverToGroup,
  diseaseToCause,
  signToDisease,
  diseaseToKind,
  riskToRule
];

// packages/trainers/bio/src/server/templates/data/urinary.ts
var NEPHRON_PARTS = [
  {
    id: "klebuszek",
    name: { pl: "k\u0142\u0119buszek nerkowy", ru: "\u043F\u043E\u0447\u0435\u0447\u043D\u044B\u0439 \u043A\u043B\u0443\u0431\u043E\u0447\u0435\u043A" },
    role: { pl: "filtracja osocza pod wysokim ci\u015Bnieniem do torebki", ru: "\u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u043F\u043B\u0430\u0437\u043C\u044B \u043F\u043E\u0434 \u0432\u044B\u0441\u043E\u043A\u0438\u043C \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C \u0432 \u043A\u0430\u043F\u0441\u0443\u043B\u0443" },
    aliases: { pl: ["k\u0142\u0119buszek"], ru: ["\u043A\u043B\u0443\u0431\u043E\u0447\u0435\u043A"] },
    tier: 1
  },
  {
    id: "torebka",
    name: { pl: "torebka Bowmana", ru: "\u043A\u0430\u043F\u0441\u0443\u043B\u0430 \u0411\u043E\u0443\u043C\u0435\u043D\u0430" },
    role: { pl: "zbieranie przes\u0105czu opuszczaj\u0105cego k\u0142\u0119buszek", ru: "\u0441\u0431\u043E\u0440 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0442\u0430, \u043F\u043E\u043A\u0438\u0434\u0430\u044E\u0449\u0435\u0433\u043E \u043A\u043B\u0443\u0431\u043E\u0447\u0435\u043A" },
    aliases: { pl: ["torebka k\u0142\u0119buszka"], ru: ["\u043A\u0430\u043F\u0441\u0443\u043B\u0430 \u043A\u043B\u0443\u0431\u043E\u0447\u043A\u0430"] },
    tier: 1
  },
  {
    id: "kanalik-blizszy",
    name: { pl: "kanalik kr\u0119ty bli\u017Cszy", ru: "\u043F\u0440\u043E\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0438\u0437\u0432\u0438\u0442\u043E\u0439 \u043A\u0430\u043D\u0430\u043B\u0435\u0446" },
    role: { pl: "resorpcja zwrotna glukozy, aminokwas\xF3w i wi\u0119kszo\u015Bci jon\xF3w", ru: "\u043E\u0431\u0440\u0430\u0442\u043D\u043E\u0435 \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u0435 \u0433\u043B\u044E\u043A\u043E\u0437\u044B, \u0430\u043C\u0438\u043D\u043E\u043A\u0438\u0441\u043B\u043E\u0442 \u0438 \u0431\u043E\u043B\u044C\u0448\u0438\u043D\u0441\u0442\u0432\u0430 \u0438\u043E\u043D\u043E\u0432" },
    aliases: { pl: ["kanalik bli\u017Cszy", "kanalik proksymalny"], ru: ["\u043F\u0440\u043E\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043D\u0430\u043B\u0435\u0446"] },
    tier: 2
  },
  {
    id: "petla",
    name: { pl: "p\u0119tla nefronu", ru: "\u043F\u0435\u0442\u043B\u044F \u043D\u0435\u0444\u0440\u043E\u043D\u0430" },
    role: { pl: "zag\u0119szczanie moczu dzi\u0119ki r\xF3\u017Cnicy st\u0119\u017Ce\u0144 w rdzeniu nerki", ru: "\u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043C\u043E\u0447\u0438 \u0431\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u044F \u0440\u0430\u0437\u043D\u0438\u0446\u0435 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u0439 \u0432 \u043C\u043E\u0437\u0433\u043E\u0432\u043E\u043C \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0435 \u043F\u043E\u0447\u043A\u0438" },
    aliases: { pl: ["p\u0119tla Henlego"], ru: ["\u043F\u0435\u0442\u043B\u044F \u0413\u0435\u043D\u043B\u0435"] },
    tier: 2
  },
  {
    id: "kanalik-dalszy",
    name: { pl: "kanalik kr\u0119ty dalszy", ru: "\u0434\u0438\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u0438\u0437\u0432\u0438\u0442\u043E\u0439 \u043A\u0430\u043D\u0430\u043B\u0435\u0446" },
    role: { pl: "sekrecja kanalikowa jon\xF3w i regulacja pod wp\u0142ywem aldosteronu", ru: "\u043A\u0430\u043D\u0430\u043B\u044C\u0446\u0435\u0432\u0430\u044F \u0441\u0435\u043A\u0440\u0435\u0446\u0438\u044F \u0438\u043E\u043D\u043E\u0432 \u0438 \u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F \u043F\u043E\u0434 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u043C \u0430\u043B\u044C\u0434\u043E\u0441\u0442\u0435\u0440\u043E\u043D\u0430" },
    aliases: { pl: ["kanalik dalszy", "kanalik dystalny"], ru: ["\u0434\u0438\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043D\u0430\u043B\u0435\u0446"] },
    tier: 2
  },
  {
    id: "kanalik-zbiorczy",
    name: { pl: "kanalik zbiorczy", ru: "\u0441\u043E\u0431\u0438\u0440\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0442\u0440\u0443\u0431\u043E\u0447\u043A\u0430" },
    role: { pl: "odbieranie wody pod wp\u0142ywem wazopresyny i odprowadzanie moczu ostatecznego", ru: "\u043E\u0442\u0431\u043E\u0440 \u0432\u043E\u0434\u044B \u043F\u043E\u0434 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u043C \u0432\u0430\u0437\u043E\u043F\u0440\u0435\u0441\u0441\u0438\u043D\u0430 \u0438 \u043E\u0442\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043E\u043A\u043E\u043D\u0447\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u043C\u043E\u0447\u0438" },
    aliases: { pl: ["cewka zbiorcza"], ru: ["\u0441\u043E\u0431\u0438\u0440\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0442\u043E\u043A"] },
    tier: 2
  },
  {
    id: "kora",
    name: { pl: "kora nerki", ru: "\u043A\u043E\u0440\u043A\u043E\u0432\u043E\u0435 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u043E \u043F\u043E\u0447\u043A\u0438" },
    role: { pl: "warstwa zewn\u0119trzna zawieraj\u0105ca k\u0142\u0119buszki nerkowe", ru: "\u043D\u0430\u0440\u0443\u0436\u043D\u044B\u0439 \u0441\u043B\u043E\u0439, \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0449\u0438\u0439 \u043F\u043E\u0447\u0435\u0447\u043D\u044B\u0435 \u043A\u043B\u0443\u0431\u043E\u0447\u043A\u0438" },
    aliases: { pl: [], ru: ["\u043A\u043E\u0440\u0430 \u043F\u043E\u0447\u043A\u0438"] },
    tier: 1
  },
  {
    id: "rdzen",
    name: { pl: "rdze\u0144 nerki", ru: "\u043C\u043E\u0437\u0433\u043E\u0432\u043E\u0435 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u043E \u043F\u043E\u0447\u043A\u0438" },
    role: { pl: "warstwa wewn\u0119trzna z piramidami nerkowymi i p\u0119tlami nefron\xF3w", ru: "\u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u0441\u043B\u043E\u0439 \u0441 \u043F\u043E\u0447\u0435\u0447\u043D\u044B\u043C\u0438 \u043F\u0438\u0440\u0430\u043C\u0438\u0434\u0430\u043C\u0438 \u0438 \u043F\u0435\u0442\u043B\u044F\u043C\u0438 \u043D\u0435\u0444\u0440\u043E\u043D\u043E\u0432" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "miedniczka",
    name: { pl: "miedniczka nerkowa", ru: "\u043F\u043E\u0447\u0435\u0447\u043D\u0430\u044F \u043B\u043E\u0445\u0430\u043D\u043A\u0430" },
    role: { pl: "zbieranie moczu ostatecznego przed moczowodem", ru: "\u0441\u0431\u043E\u0440 \u043E\u043A\u043E\u043D\u0447\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u043C\u043E\u0447\u0438 \u043F\u0435\u0440\u0435\u0434 \u043C\u043E\u0447\u0435\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u043C" },
    aliases: { pl: [], ru: [] },
    tier: 1
  },
  {
    id: "moczowod",
    name: { pl: "moczow\xF3d", ru: "\u043C\u043E\u0447\u0435\u0442\u043E\u0447\u043D\u0438\u043A" },
    role: { pl: "przesuwanie moczu do p\u0119cherza ruchami perystaltycznymi", ru: "\u043F\u0440\u043E\u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u043C\u043E\u0447\u0438 \u0432 \u043C\u043E\u0447\u0435\u0432\u043E\u0439 \u043F\u0443\u0437\u044B\u0440\u044C \u043F\u0435\u0440\u0438\u0441\u0442\u0430\u043B\u044C\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u043C\u0438 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F\u043C\u0438" },
    aliases: { pl: [], ru: [] },
    tier: 1
  }
];
var URINE_PROCESSES = [
  {
    id: "filtracja",
    name: { pl: "filtracja k\u0142\u0119buszkowa", ru: "\u043A\u043B\u0443\u0431\u043E\u0447\u043A\u043E\u0432\u0430\u044F \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F" },
    description: { pl: "przechodzenie wody i drobnych cz\u0105steczek z krwi do torebki, bez bia\u0142ek i krwinek", ru: "\u043F\u0435\u0440\u0435\u0445\u043E\u0434 \u0432\u043E\u0434\u044B \u0438 \u043C\u0435\u043B\u043A\u0438\u0445 \u043C\u043E\u043B\u0435\u043A\u0443\u043B \u0438\u0437 \u043A\u0440\u043E\u0432\u0438 \u0432 \u043A\u0430\u043F\u0441\u0443\u043B\u0443, \u0431\u0435\u0437 \u0431\u0435\u043B\u043A\u043E\u0432 \u0438 \u043A\u043B\u0435\u0442\u043E\u043A \u043A\u0440\u043E\u0432\u0438" },
    aliases: { pl: ["filtracja"], ru: ["\u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F"] },
    tier: 1
  },
  {
    id: "resorpcja",
    name: { pl: "resorpcja zwrotna", ru: "\u043E\u0431\u0440\u0430\u0442\u043D\u043E\u0435 \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u0435" },
    description: { pl: "odzyskiwanie z przes\u0105czu glukozy, aminokwas\xF3w, jon\xF3w i wi\u0119kszo\u015Bci wody", ru: "\u0432\u043E\u0437\u0432\u0440\u0430\u0442 \u0438\u0437 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0442\u0430 \u0433\u043B\u044E\u043A\u043E\u0437\u044B, \u0430\u043C\u0438\u043D\u043E\u043A\u0438\u0441\u043B\u043E\u0442, \u0438\u043E\u043D\u043E\u0432 \u0438 \u0431\u043E\u043B\u044C\u0448\u0435\u0439 \u0447\u0430\u0441\u0442\u0438 \u0432\u043E\u0434\u044B" },
    aliases: { pl: ["reabsorpcja"], ru: ["\u0440\u0435\u0430\u0431\u0441\u043E\u0440\u0431\u0446\u0438\u044F"] },
    tier: 1
  },
  {
    id: "sekrecja",
    name: { pl: "sekrecja kanalikowa", ru: "\u043A\u0430\u043D\u0430\u043B\u044C\u0446\u0435\u0432\u0430\u044F \u0441\u0435\u043A\u0440\u0435\u0446\u0438\u044F" },
    description: { pl: "czynne wydzielanie do kanalika jon\xF3w wodorowych, potasu i lek\xF3w", ru: "\u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0435 \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0432 \u043A\u0430\u043D\u0430\u043B\u0435\u0446 \u0438\u043E\u043D\u043E\u0432 \u0432\u043E\u0434\u043E\u0440\u043E\u0434\u0430, \u043A\u0430\u043B\u0438\u044F \u0438 \u043B\u0435\u043A\u0430\u0440\u0441\u0442\u0432" },
    aliases: { pl: ["sekrecja"], ru: ["\u0441\u0435\u043A\u0440\u0435\u0446\u0438\u044F"] },
    tier: 2
  },
  {
    id: "zageszczanie",
    name: { pl: "zag\u0119szczanie moczu", ru: "\u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043C\u043E\u0447\u0438" },
    description: { pl: "odbieranie wody w kanaliku zbiorczym pod wp\u0142ywem wazopresyny", ru: "\u043E\u0442\u0431\u043E\u0440 \u0432\u043E\u0434\u044B \u0432 \u0441\u043E\u0431\u0438\u0440\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0442\u0440\u0443\u0431\u043E\u0447\u043A\u0435 \u043F\u043E\u0434 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u043C \u0432\u0430\u0437\u043E\u043F\u0440\u0435\u0441\u0441\u0438\u043D\u0430" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "osmoregulacja",
    name: { pl: "osmoregulacja", ru: "\u043E\u0441\u043C\u043E\u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F" },
    description: { pl: "utrzymywanie sta\u0142ego st\u0119\u017Cenia p\u0142yn\xF3w ustrojowych przez regulacj\u0119 ilo\u015Bci wody i soli", ru: "\u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u043E\u0439 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u0438 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0435\u0439 \u0442\u0435\u043B\u0430 \u0447\u0435\u0440\u0435\u0437 \u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044E \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u0432\u043E\u0434\u044B \u0438 \u0441\u043E\u043B\u0435\u0439" },
    aliases: { pl: [], ru: [] },
    tier: 2
  },
  {
    id: "aldosteron-sod",
    name: { pl: "dzia\u0142anie aldosteronu", ru: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0430\u043B\u044C\u0434\u043E\u0441\u0442\u0435\u0440\u043E\u043D\u0430" },
    description: { pl: "zatrzymywanie sodu, a wraz z nim wody, kosztem wydalania potasu", ru: "\u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u043D\u0430\u0442\u0440\u0438\u044F, \u0430 \u0441 \u043D\u0438\u043C \u0432\u043E\u0434\u044B, \u0446\u0435\u043D\u043E\u0439 \u0432\u044B\u0432\u0435\u0434\u0435\u043D\u0438\u044F \u043A\u0430\u043B\u0438\u044F" },
    aliases: { pl: [], ru: [] },
    tier: 3
  }
];

// packages/trainers/bio/src/server/templates/topics/lo3Urinary.ts
var TOPIC6 = "bio.lo3.urinary";
var ANATOMY2 = { pl: "budowa nerki i nefronu", ru: "\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u043F\u043E\u0447\u043A\u0438 \u0438 \u043D\u0435\u0444\u0440\u043E\u043D\u0430" };
var PROCESSES = { pl: "powstawanie moczu i osmoregulacja", ru: "\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u043C\u043E\u0447\u0438 \u0438 \u043E\u0441\u043C\u043E\u0440\u0435\u0433\u0443\u043B\u044F\u0446\u0438\u044F" };
var tier3 = (row) => row.tier;
var partToRole2 = choiceFromTable({
  id: `${TOPIC6}.part-to-role`,
  topicId: TOPIC6,
  rows: NEPHRON_PARTS,
  paragraph: P.urinary.structure,
  subtopic: ANATOMY2,
  difficulty: tier3,
  shift: 0,
  question: (r, lang) => lang === "pl" ? `Struktura: ${r.name.pl}. Jaka jest jej rola?` : `\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430: ${r.name.ru}. \u041A\u0430\u043A\u043E\u0432\u0430 \u0435\u0451 \u0440\u043E\u043B\u044C?`,
  optionText: (r, lang) => r.role[lang],
  misconception: { pl: "rola s\u0105siedniego odcinka nefronu", ru: "\u0440\u043E\u043B\u044C \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0433\u043E \u043E\u0442\u0434\u0435\u043B\u0430 \u043D\u0435\u0444\u0440\u043E\u043D\u0430" },
  solution: (r, lang) => lang === "pl" ? `${cap(r.name.pl)} \u2014 ${r.role.pl}.` : `${cap(r.name.ru)} \u2014 ${r.role.ru}.`
});
var roleToPart2 = termFromTable({
  id: `${TOPIC6}.role-to-part`,
  topicId: TOPIC6,
  rows: NEPHRON_PARTS,
  paragraph: P.urinary.structure,
  subtopic: ANATOMY2,
  difficulty: tier3,
  question: (r, lang) => lang === "pl" ? `Funkcja: ${r.role.pl}. Podaj nazw\u0119 struktury w mianowniku.` : `\u0424\u0443\u043D\u043A\u0446\u0438\u044F: ${r.role.ru}. \u041D\u0430\u0437\u043E\u0432\u0438 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0443 \u0432 \u0438\u043C\u0435\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C \u043F\u0430\u0434\u0435\u0436\u0435.`,
  term: (r, lang) => r.name[lang],
  aliases: (r) => [r.name.pl, r.name.ru, ...r.aliases.pl, ...r.aliases.ru],
  solution: (r, lang) => lang === "pl" ? `Odpowied\u017A: ${r.name.pl}.` : `\u041E\u0442\u0432\u0435\u0442: ${r.name.ru}.`
});
var processToDescription = choiceFromTable({
  id: `${TOPIC6}.process-to-description`,
  topicId: TOPIC6,
  rows: URINE_PROCESSES,
  paragraph: P.urinary.structure,
  subtopic: PROCESSES,
  tags: ["homeostaza"],
  difficulty: tier3,
  shift: 1,
  question: (p, lang) => lang === "pl" ? `Na czym polega ${p.name.pl}?` : `\u0412 \u0447\u0451\u043C \u0437\u0430\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F ${p.name.ru}?`,
  optionText: (p, lang) => p.description[lang],
  misconception: { pl: "opis innego etapu powstawania moczu", ru: "\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u044D\u0442\u0430\u043F\u0430 \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u043C\u043E\u0447\u0438" },
  solution: (p, lang) => lang === "pl" ? `${cap(p.name.pl)} \u2014 ${p.description.pl}.` : `${cap(p.name.ru)} \u2014 ${p.description.ru}.`
});
var descriptionToProcess = termFromTable({
  id: `${TOPIC6}.description-to-process`,
  topicId: TOPIC6,
  rows: URINE_PROCESSES,
  paragraph: P.urinary.structure,
  subtopic: PROCESSES,
  tags: ["homeostaza"],
  difficulty: tier3,
  question: (p, lang) => lang === "pl" ? `Proces: ${p.description.pl}. Podaj jego nazw\u0119 w mianowniku.` : `\u041F\u0440\u043E\u0446\u0435\u0441\u0441: ${p.description.ru}. \u041D\u0430\u0437\u043E\u0432\u0438 \u0435\u0433\u043E \u0432 \u0438\u043C\u0435\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C \u043F\u0430\u0434\u0435\u0436\u0435.`,
  term: (p, lang) => p.name[lang],
  aliases: (p) => [p.name.pl, p.name.ru, ...p.aliases.pl, ...p.aliases.ru],
  solution: (p, lang) => lang === "pl" ? `Odpowied\u017A: ${p.name.pl}.` : `\u041E\u0442\u0432\u0435\u0442: ${p.name.ru}.`
});
var filteredLoad = calcTemplate({
  id: `${TOPIC6}.filtered-load`,
  topicId: TOPIC6,
  paragraph: P.urinary.structure,
  subtopic: PROCESSES,
  tags: ["obliczenia"],
  difficulty: 2,
  params: { gfr: intRange(10, 13), conc: intRange(8, 12) },
  decimals: 1,
  // GFR in ml/min x concentration in mg/100 ml -> mg/min
  formula: (p) => `(${p.gfr * 10} * ${p.conc * 10}) / 100`,
  value: (p) => p.gfr * 10 * (p.conc * 10) / 100,
  question: (p, lang) => lang === "pl" ? `Przes\u0105czanie k\u0142\u0119buszkowe wynosi ${p.gfr * 10} ml/min, a st\u0119\u017Cenie glukozy w osoczu ${p.conc * 10} mg/100 ml. Ile miligram\xF3w glukozy jest przes\u0105czane w ci\u0105gu minuty?` : `\u041A\u043B\u0443\u0431\u043E\u0447\u043A\u043E\u0432\u0430\u044F \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u0440\u0430\u0432\u043D\u0430 ${p.gfr * 10} \u043C\u043B/\u043C\u0438\u043D, \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0432 \u043F\u043B\u0430\u0437\u043C\u0435 ${p.conc * 10} \u043C\u0433/100 \u043C\u043B. \u0421\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u0438\u043B\u043B\u0438\u0433\u0440\u0430\u043C\u043C\u043E\u0432 \u0433\u043B\u044E\u043A\u043E\u0437\u044B \u0444\u0438\u043B\u044C\u0442\u0440\u0443\u0435\u0442\u0441\u044F \u0437\u0430 \u043C\u0438\u043D\u0443\u0442\u0443?`,
  hint: (_p, lang) => lang === "pl" ? "\u0141adunek przes\u0105czany = obj\u0119to\u015B\u0107 przes\u0105czu \xD7 st\u0119\u017Cenie substancji w osoczu." : "\u0424\u0438\u043B\u044C\u0442\u0440\u0443\u0435\u043C\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E = \u043E\u0431\u044A\u0451\u043C \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0442\u0430 \xD7 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0430 \u0432 \u043F\u043B\u0430\u0437\u043C\u0435.",
  solution: (p, answer, lang) => lang === "pl" ? `${p.gfr * 10} ml/min \xD7 ${p.conc * 10} mg/100 ml = ${answer} mg/min. U zdrowej osoby ca\u0142a ta glukoza wraca przez resorpcj\u0119 zwrotn\u0105, wi\u0119c w moczu jej nie ma.` : `${p.gfr * 10} \u043C\u043B/\u043C\u0438\u043D \xD7 ${p.conc * 10} \u043C\u0433/100 \u043C\u043B = ${answer} \u043C\u0433/\u043C\u0438\u043D. \u0423 \u0437\u0434\u043E\u0440\u043E\u0432\u043E\u0433\u043E \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430 \u0432\u0441\u044F \u044D\u0442\u0430 \u0433\u043B\u044E\u043A\u043E\u0437\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442\u0441\u044F \u043E\u0431\u0440\u0430\u0442\u043D\u044B\u043C \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u0435\u043C, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0432 \u043C\u043E\u0447\u0435 \u0435\u0451 \u043D\u0435\u0442.`
});
var clearance = calcTemplate({
  id: `${TOPIC6}.clearance`,
  topicId: TOPIC6,
  paragraph: P.urinary.structure,
  subtopic: PROCESSES,
  tags: ["obliczenia"],
  difficulty: 3,
  params: { u: intRange(60, 80), v: intRange(1, 3), pl: intRange(1, 2) },
  decimals: 1,
  formula: (p) => `(${p.u} * ${p.v}) / ${p.pl}`,
  value: (p) => p.u * p.v / p.pl,
  question: (p, lang) => lang === "pl" ? `St\u0119\u017Cenie substancji w moczu wynosi ${p.u} mg/ml, obj\u0119to\u015B\u0107 moczu ${p.v} ml/min, a st\u0119\u017Cenie w osoczu ${p.pl} mg/ml. Oblicz klirens tej substancji w ml/min.` : `\u041A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0430 \u0432 \u043C\u043E\u0447\u0435 ${p.u} \u043C\u0433/\u043C\u043B, \u043E\u0431\u044A\u0451\u043C \u043C\u043E\u0447\u0438 ${p.v} \u043C\u043B/\u043C\u0438\u043D, \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F \u0432 \u043F\u043B\u0430\u0437\u043C\u0435 ${p.pl} \u043C\u0433/\u043C\u043B. \u0412\u044B\u0447\u0438\u0441\u043B\u0438 \u043A\u043B\u0438\u0440\u0435\u043D\u0441 \u044D\u0442\u043E\u0433\u043E \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0430 \u0432 \u043C\u043B/\u043C\u0438\u043D.`,
  hint: (_p, lang) => lang === "pl" ? "Klirens = (st\u0119\u017Cenie w moczu \xD7 obj\u0119to\u015B\u0107 moczu) / st\u0119\u017Cenie w osoczu." : "\u041A\u043B\u0438\u0440\u0435\u043D\u0441 = (\u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F \u0432 \u043C\u043E\u0447\u0435 \xD7 \u043E\u0431\u044A\u0451\u043C \u043C\u043E\u0447\u0438) / \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F \u0432 \u043F\u043B\u0430\u0437\u043C\u0435.",
  solution: (p, answer, lang) => lang === "pl" ? `(${p.u} \xD7 ${p.v}) / ${p.pl} = ${answer} ml/min \u2014 tyle osocza zostaje w ci\u0105gu minuty ca\u0142kowicie oczyszczone z tej substancji.` : `(${p.u} \xD7 ${p.v}) / ${p.pl} = ${answer} \u043C\u043B/\u043C\u0438\u043D \u2014 \u0441\u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043B\u0430\u0437\u043C\u044B \u0437\u0430 \u043C\u0438\u043D\u0443\u0442\u0443 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u043E\u0447\u0438\u0449\u0430\u0435\u0442\u0441\u044F \u043E\u0442 \u044D\u0442\u043E\u0433\u043E \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0430.`
});
var reabsorbedWater = calcTemplate({
  id: `${TOPIC6}.reabsorbed-water`,
  topicId: TOPIC6,
  paragraph: P.urinary.structure,
  subtopic: PROCESSES,
  tags: ["obliczenia", "homeostaza"],
  difficulty: 2,
  // kept small enough that the renderer enumerates the whole product instead of sampling it:
  // sampling would give different substitutions (and ids) on every run, and the pool ignores
  // duplicates by id, so re-rendering would pile up new rows rather than being a no-op
  params: { filtrate: intRange(15, 19), urine: intRange(10, 20) },
  decimals: 1,
  formula: (p) => `((${p.filtrate * 10} - ${p.urine / 10}) / ${p.filtrate * 10}) * 100`,
  value: (p) => (p.filtrate * 10 - p.urine / 10) / (p.filtrate * 10) * 100,
  question: (p, lang) => lang === "pl" ? `W ci\u0105gu doby powstaje ${p.filtrate * 10} litr\xF3w moczu pierwotnego i ${(p.urine / 10).toFixed(1).replace(".", ",")} litra moczu ostatecznego. Jaki procent wody zostaje wch\u0142oni\u0119ty z powrotem?` : `\u0417\u0430 \u0441\u0443\u0442\u043A\u0438 \u043E\u0431\u0440\u0430\u0437\u0443\u0435\u0442\u0441\u044F ${p.filtrate * 10} \u043B\u0438\u0442\u0440\u043E\u0432 \u043F\u0435\u0440\u0432\u0438\u0447\u043D\u043E\u0439 \u043C\u043E\u0447\u0438 \u0438 ${(p.urine / 10).toFixed(1).replace(".", ",")} \u043B\u0438\u0442\u0440\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u043C\u043E\u0447\u0438. \u041A\u0430\u043A\u043E\u0439 \u043F\u0440\u043E\u0446\u0435\u043D\u0442 \u0432\u043E\u0434\u044B \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u043E\u0431\u0440\u0430\u0442\u043D\u043E?`,
  hint: (_p, lang) => lang === "pl" ? "Odzyskana woda to r\xF3\u017Cnica mi\u0119dzy moczem pierwotnym a ostatecznym, odniesiona do moczu pierwotnego." : "\u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0451\u043D\u043D\u0430\u044F \u0432\u043E\u0434\u0430 \u2014 \u0440\u0430\u0437\u043D\u0438\u0446\u0430 \u043C\u0435\u0436\u0434\u0443 \u043F\u0435\u0440\u0432\u0438\u0447\u043D\u043E\u0439 \u0438 \u043E\u043A\u043E\u043D\u0447\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u043C\u043E\u0447\u043E\u0439, \u043E\u0442\u043D\u0435\u0441\u0451\u043D\u043D\u0430\u044F \u043A \u043F\u0435\u0440\u0432\u0438\u0447\u043D\u043E\u0439.",
  solution: (p, answer, lang) => lang === "pl" ? `(${p.filtrate * 10} \u2212 ${(p.urine / 10).toFixed(1).replace(".", ",")}) / ${p.filtrate * 10} \xD7 100% \u2248 ${answer}%. Niemal ca\u0142a woda wraca do krwi \u2014 inaczej odwodnienie nast\u0105pi\u0142oby w ci\u0105gu godzin.` : `(${p.filtrate * 10} \u2212 ${(p.urine / 10).toFixed(1).replace(".", ",")}) / ${p.filtrate * 10} \xD7 100% \u2248 ${answer}%. \u041F\u043E\u0447\u0442\u0438 \u0432\u0441\u044F \u0432\u043E\u0434\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442\u0441\u044F \u0432 \u043A\u0440\u043E\u0432\u044C \u2014 \u0438\u043D\u0430\u0447\u0435 \u043E\u0431\u0435\u0437\u0432\u043E\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u043D\u0430\u0441\u0442\u0443\u043F\u0438\u043B\u043E \u0431\u044B \u0437\u0430 \u0447\u0430\u0441\u044B.`
});
var lo3UrinaryTemplates = [
  partToRole2,
  roleToPart2,
  processToDescription,
  descriptionToProcess,
  filteredLoad,
  clearance,
  reabsorbedWater
];

// packages/trainers/bio/src/server/templates/index.ts
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== void 0);
    return `{${entries.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
function contentId(templateId, lang, task) {
  const { id: _id, ...content } = task;
  return `${templateId}:${lang}:${createHash3("sha1").update(canonical(content)).digest("hex").slice(0, 12)}`;
}
var withContentIds = (templateId, tasks) => tasks.map(({ lang, task }) => ({ lang, task: { ...task, id: contentId(templateId, lang, task) } }));
function renderTemplate2(template, opts) {
  const outcome = renderTemplate(template, { ...opts, verify: verifyTask });
  return { ...outcome, tasks: withContentIds(template.id, outcome.tasks) };
}
function renderTemplates(templates, opts) {
  const tasks = [];
  const perTemplate = [];
  for (const template of templates) {
    const outcome = renderTemplate2(template, opts);
    tasks.push(...outcome.tasks);
    perTemplate.push(outcome.stats);
  }
  return { tasks, perTemplate };
}
var ALL_TEMPLATES = [
  ...lo3HormonesTemplates,
  ...lo3RespirationTemplates,
  ...lo3CirculationTemplates,
  ...lo3UrinaryTemplates,
  ...lo3RemainingTemplates,
  ...lo3HomeostasisTemplates,
  ...lo3SkinTemplates
];

// packages/trainers/bio/src/server/content.ts
var TARGET = 40;
var GRADE = "lo3";
var LEVEL = "R";
function renderContent() {
  return renderTemplates(ALL_TEMPLATES, { langs: [...BIO_LANGS], targetCount: TARGET });
}

// packages/trainers/bio/src/server/seed.ts
var BATCH = 200;
async function syncContent(pool, log) {
  const { tasks } = renderContent();
  const wanted = new Set(tasks.map((t) => t.task.id));
  const stored = new Set(await pool.listIds("bio"));
  const missing = /* @__PURE__ */ new Map();
  for (const { lang, task } of tasks) {
    if (stored.has(task.id)) continue;
    missing.set(lang, [...missing.get(lang) ?? [], task]);
  }
  let added = 0;
  for (const [lang, group] of missing) {
    for (let i = 0; i < group.length; i += BATCH) {
      const batch = group.slice(i, i + BATCH);
      await pool.add(batch, { trainerId: "bio", lang, grade: GRADE, level: LEVEL });
      added += batch.length;
    }
  }
  const stale = [...stored].filter((id) => !wanted.has(id));
  await pool.remove(stale);
  const result = { added, removed: stale.length, total: wanted.size };
  if (added > 0 || stale.length > 0) log?.info({ trainer: "bio", ...result }, "synced the biology pool with its templates");
  return result;
}
var inFlight = /* @__PURE__ */ new WeakMap();
function ensureContent(pool, log) {
  const running = inFlight.get(pool);
  if (running) return running;
  const attempt = syncContent(pool, log).then(
    () => void 0,
    (err) => {
      inFlight.delete(pool);
      throw err;
    }
  );
  inFlight.set(pool, attempt);
  return attempt;
}

// packages/trainers/bio/src/server/index.ts
var bioTrainer = {
  id: "bio",
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
var lo = [
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
var TOPICS2 = [...sp, ...lo];
var byId2 = new Map(TOPICS2.map((t) => [t.id, t]));
var getTopic2 = (id) => byId2.get(id);
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
  serveWeb = true,
  rateLimit: limitRequests = process.env.DISABLE_RATE_LIMIT !== "1"
} = {}) {
  const app = Fastify({ logger, bodyLimit: 256 * 1024 });
  await app.register(cors, { origin: process.env.CORS_ORIGIN?.split(",") ?? true });
  if (limitRequests) await app.register(rateLimit, { global: true, max: 120, timeWindow: "1 minute" });
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
