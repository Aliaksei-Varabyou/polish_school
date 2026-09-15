// Server-side data access for profiles and practice history (Supabase, service role).
// Row-level security keeps students to their own rows; the API uses the service role and
// always filters by the verified user id.
import type {
  FeedbackResponse,
  Profile,
  ProfileUpdate,
  ProgressResponse,
  SessionDetail,
  SessionSettings,
  SessionSummary,
  SessionTaskRecord,
  Task,
  TopicProgress,
} from "@portal/core";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface DbConfig {
  url: string;
  serviceRoleKey: string;
}

export function dbConfigFromEnv(env: Record<string, string | undefined> = process.env): DbConfig | null {
  return env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? { url: env.SUPABASE_URL, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY }
    : null;
}

export { SupabaseTaskPool } from "./taskPool.ts";

export interface AuthUser {
  id: string;
  email: string | null;
}

const TOKEN_CACHE_MS = 60_000;
const TOKEN_CACHE_MAX = 1000;

type SessionRow = {
  id: string;
  trainer_id: string;
  settings: SessionSettings;
  started_at: string;
  finished_at: string | null;
  correct: number;
  total: number;
};

type SessionTaskRow = {
  position: number;
  task: Task;
  user_answer: string | null;
  correct: boolean | null;
  used_hint: boolean;
  answered_at: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  grade: Profile["grade"];
  level: Profile["level"];
  ui_lang: Profile["uiLang"];
  birth_year: number | null;
  parental_consent_at: string | null;
};

function fail(error: { message: string } | null, what: string): void {
  if (error) throw new Error(`${what}: ${error.message}`);
}

const toSummary = (row: SessionRow, answered: number): SessionSummary => ({
  id: row.id,
  trainerId: row.trainer_id,
  settings: row.settings,
  startedAt: row.started_at,
  finishedAt: row.finished_at,
  correct: row.correct,
  total: row.total,
  answered,
});

const toTaskRecord = (row: SessionTaskRow): SessionTaskRecord => ({
  position: row.position,
  task: row.task,
  userAnswer: row.user_answer,
  correct: row.correct,
  usedHint: row.used_hint,
  answeredAt: row.answered_at,
});

const toProfile = (row: ProfileRow, email: string | null): Profile => ({
  id: row.id,
  email,
  displayName: row.display_name,
  grade: row.grade,
  level: row.level,
  uiLang: row.ui_lang,
  birthYear: row.birth_year,
  parentalConsentAt: row.parental_consent_at,
});

export class PortalDb {
  readonly admin: SupabaseClient;
  private tokenCache = new Map<string, { user: AuthUser; expires: number }>();

  constructor(config: DbConfig) {
    this.admin = createClient(config.url, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // -------------------------------------------------------------------------
  // auth
  // -------------------------------------------------------------------------

  /** Verifies a Supabase access token (cached for a minute). Returns null for invalid/expired tokens. */
  async userFromToken(token: string): Promise<AuthUser | null> {
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

  // -------------------------------------------------------------------------
  // sessions
  // -------------------------------------------------------------------------

  async createSession(userId: string, trainerId: string, settings: SessionSettings, tasks: Task[]): Promise<string> {
    const { data, error } = await this.admin
      .from("sessions")
      .insert({ user_id: userId, trainer_id: trainerId, settings, total: tasks.length })
      .select("id")
      .single();
    fail(error, "create session");
    const sessionId = (data as { id: string }).id;

    const rows = tasks.map((task, position) => ({
      session_id: sessionId,
      position,
      task_id: task.id,
      topic_id: task.topicId,
      difficulty: task.difficulty,
      task,
    }));
    const { error: tasksError } = await this.admin.from("session_tasks").insert(rows);
    fail(tasksError, "create session tasks");
    return sessionId;
  }

  private async ownsSession(sessionId: string, userId: string): Promise<SessionRow | null> {
    const { data, error } = await this.admin
      .from("sessions")
      .select("id, trainer_id, settings, started_at, finished_at, correct, total")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    fail(error, "load session");
    return (data as SessionRow | null) ?? null;
  }

  /** The task at `position` of a session owned by the user (null if not found). */
  async getSessionTask(sessionId: string, userId: string, position: number): Promise<{ trainerId: string; task: Task; answered: boolean } | null> {
    const session = await this.ownsSession(sessionId, userId);
    if (!session) return null;
    const { data, error } = await this.admin
      .from("session_tasks")
      .select("task, answered_at")
      .eq("session_id", sessionId)
      .eq("position", position)
      .maybeSingle();
    fail(error, "load session task");
    if (!data) return null;
    const row = data as { task: Task; answered_at: string | null };
    return { trainerId: session.trainer_id, task: row.task, answered: row.answered_at !== null };
  }

  /** Stores the first answer to a task and updates the session score. Returns false if already answered. */
  async recordAnswer(
    sessionId: string,
    position: number,
    answer: { answer: string; correct: boolean; usedHint: boolean },
  ): Promise<boolean> {
    const { data, error } = await this.admin
      .from("session_tasks")
      .update({ user_answer: answer.answer, correct: answer.correct, used_hint: answer.usedHint, answered_at: new Date().toISOString() })
      .eq("session_id", sessionId)
      .eq("position", position)
      .is("answered_at", null)
      .select("position");
    fail(error, "record answer");
    if (!data || data.length === 0) return false;

    const { count, error: countError } = await this.admin
      .from("session_tasks")
      .select("position", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("correct", true);
    fail(countError, "count correct answers");
    const { error: updateError } = await this.admin.from("sessions").update({ correct: count ?? 0 }).eq("id", sessionId);
    fail(updateError, "update session score");
    return true;
  }

  async finishSession(sessionId: string, userId: string): Promise<SessionSummary | null> {
    const session = await this.ownsSession(sessionId, userId);
    if (!session) return null;
    if (!session.finished_at) {
      const { error } = await this.admin
        .from("sessions")
        .update({ finished_at: new Date().toISOString() })
        .eq("id", sessionId)
        .is("finished_at", null);
      fail(error, "finish session");
    }
    return (await this.getSessionDetail(sessionId, userId)) ?? null;
  }

  async saveFeedback(sessionId: string, userId: string, data: FeedbackResponse): Promise<boolean> {
    if (!(await this.ownsSession(sessionId, userId))) return false;
    const { error } = await this.admin.from("session_feedback").upsert({ session_id: sessionId, data });
    fail(error, "save feedback");
    return true;
  }

  async listSessions(userId: string, { limit = 20, before }: { limit?: number; before?: string } = {}): Promise<SessionSummary[]> {
    let query = this.admin
      .from("sessions")
      .select("id, trainer_id, settings, started_at, finished_at, correct, total, session_tasks(answered_at)")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 100));
    if (before) query = query.lt("started_at", before);
    const { data, error } = await query;
    fail(error, "list sessions");
    return ((data ?? []) as (SessionRow & { session_tasks: { answered_at: string | null }[] })[]).map((row) =>
      toSummary(row, row.session_tasks.filter((t) => t.answered_at !== null).length),
    );
  }

  async getSessionDetail(sessionId: string, userId: string): Promise<SessionDetail | null> {
    const { data, error } = await this.admin
      .from("sessions")
      .select(
        "id, trainer_id, settings, started_at, finished_at, correct, total, session_tasks(position, task, user_answer, correct, used_hint, answered_at), session_feedback(data)",
      )
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    fail(error, "load session detail");
    if (!data) return null;

    const row = data as SessionRow & {
      session_tasks: SessionTaskRow[];
      session_feedback: { data: FeedbackResponse } | { data: FeedbackResponse }[] | null;
    };
    const tasks = [...row.session_tasks].sort((a, b) => a.position - b.position).map(toTaskRecord);
    const feedbackRow = Array.isArray(row.session_feedback) ? row.session_feedback[0] : row.session_feedback;
    return {
      ...toSummary(row, tasks.filter((t) => t.answeredAt !== null).length),
      tasks,
      feedback: feedbackRow?.data ?? null,
    };
  }

  /** Ids of tasks the user has already been given in this trainer (so the pool doesn't repeat them). */
  async seenTaskIds(userId: string, trainerId: string, limit = 2000): Promise<string[]> {
    const { data, error } = await this.admin
      .from("session_tasks")
      .select("task_id, sessions!inner(user_id, trainer_id)")
      .eq("sessions.user_id", userId)
      .eq("sessions.trainer_id", trainerId)
      .limit(limit);
    fail(error, "load seen tasks");
    return [...new Set(((data ?? []) as { task_id: string }[]).map((r) => r.task_id))];
  }

  async progress(userId: string): Promise<ProgressResponse> {
    const { count: sessions, error: countError } = await this.admin
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    fail(countError, "count sessions");

    const { data, error } = await this.admin
      .from("session_tasks")
      .select("topic_id, correct, answered_at, sessions!inner(user_id, trainer_id)")
      .eq("sessions.user_id", userId)
      .not("answered_at", "is", null)
      .limit(10_000);
    fail(error, "load progress");

    const rows = (data ?? []) as unknown as {
      topic_id: string;
      correct: boolean | null;
      answered_at: string;
      sessions: { trainer_id: string } | { trainer_id: string }[];
    }[];
    const topics = new Map<string, TopicProgress>();
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
      topics: [...topics.values()].sort((a, b) => a.correct / a.attempts - b.correct / b.attempts),
    };
  }

  // -------------------------------------------------------------------------
  // profile
  // -------------------------------------------------------------------------

  async getProfile(user: AuthUser): Promise<Profile | null> {
    const { data, error } = await this.admin
      .from("profiles")
      .select("id, display_name, grade, level, ui_lang, birth_year, parental_consent_at")
      .eq("id", user.id)
      .maybeSingle();
    fail(error, "load profile");
    return data ? toProfile(data as ProfileRow, user.email) : null;
  }

  async updateProfile(user: AuthUser, update: ProfileUpdate): Promise<Profile | null> {
    const patch: Record<string, unknown> = {};
    if (update.displayName !== undefined) patch.display_name = update.displayName;
    if (update.grade !== undefined) patch.grade = update.grade;
    if (update.level !== undefined) patch.level = update.level;
    if (update.uiLang !== undefined) patch.ui_lang = update.uiLang;
    if (update.birthYear !== undefined) patch.birth_year = update.birthYear;
    if (update.parentalConsent !== undefined) patch.parental_consent_at = update.parentalConsent ? new Date().toISOString() : null;

    if (Object.keys(patch).length > 0) {
      const { error } = await this.admin.from("profiles").update(patch).eq("id", user.id);
      fail(error, "update profile");
    }
    return this.getProfile(user);
  }
}
