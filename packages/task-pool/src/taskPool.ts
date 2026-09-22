import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { AnswerMode, Difficulty, Grade, Lang, Level, Task } from "@portal/core";

export interface PoolContext {
  trainerId: string;
  lang: Lang;
  grade: Grade;
  level?: Level;
}

export interface PoolQuery extends PoolContext {
  topicId: string;
  answerMode: AnswerMode;
  /** preferred difficulty; other difficulties are used when there are not enough */
  difficulty?: Difficulty;
  excludeIds: readonly string[];
  limit: number;
}

export interface TaskReport {
  userId?: string | null;
  reason?: string;
}

/** Storage for verified tasks: SQLite (single server, guests-only setups) or Postgres (Supabase). */
export interface TaskPoolStore {
  add(tasks: Task[], ctx: PoolContext): Promise<void>;
  /** Least-served unseen tasks, preferred difficulty first; marks them as served. */
  take(query: PoolQuery): Promise<Task[]>;
  count(trainerId?: string): Promise<number>;
  /** Returns false when the task is not in the pool. Tasks with too many reports are no longer served. */
  report(taskId: string, report: TaskReport): Promise<boolean>;
}

/** Tasks with this many reports are not served anymore. */
export const MAX_REPORTS = 2;

export const ANSWER_TYPES: Record<AnswerMode, string[]> = {
  input: ["number", "expression", "text"],
  choice: ["choice"],
  mixed: ["number", "expression", "choice", "text"],
};

export interface PooledTask {
  ctx: PoolContext;
  task: Task;
  reports: number;
}

/** SQLite pool (node:sqlite) for local development and deployments without Supabase. */
export class TaskPool implements TaskPoolStore {
  private db: DatabaseSync;

  constructor(path: string) {
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

  /** Older pools: no trainer column (they only contained math tasks), no reports column. */
  private migrate() {
    const columns = (this.db.prepare("PRAGMA table_info(tasks)").all() as { name: string }[]).map((c) => c.name);
    if (!columns.includes("trainer_id")) this.db.exec("ALTER TABLE tasks ADD COLUMN trainer_id TEXT NOT NULL DEFAULT 'math'");
    if (!columns.includes("reports")) this.db.exec("ALTER TABLE tasks ADD COLUMN reports INTEGER NOT NULL DEFAULT 0");
  }

  async add(tasks: Task[], ctx: PoolContext): Promise<void> {
    const insert = this.db.prepare(
      `INSERT OR IGNORE INTO tasks (id, trainer_id, lang, grade, level, topic_id, difficulty, answer_type, data, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const now = Date.now();
    this.db.exec("BEGIN");
    try {
      for (const t of tasks) {
        insert.run(t.id, ctx.trainerId, ctx.lang, ctx.grade, ctx.level ?? "", t.topicId, t.difficulty, t.answerType, JSON.stringify(t), now);
      }
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
  }

  async take(q: PoolQuery): Promise<Task[]> {
    if (q.limit <= 0) return [];
    const types = ANSWER_TYPES[q.answerMode];
    const rows = this.db
      .prepare(
        `SELECT id, data FROM tasks
         WHERE trainer_id = ? AND lang = ? AND grade = ? AND level = ? AND topic_id = ?
           AND answer_type IN (${types.map(() => "?").join(",")})
           AND id NOT IN (SELECT value FROM json_each(?))
           AND reports < ?
         ORDER BY (difficulty = ?) DESC, served ASC, random()
         LIMIT ?`,
      )
      .all(
        q.trainerId,
        q.lang,
        q.grade,
        q.level ?? "",
        q.topicId,
        ...types,
        JSON.stringify(q.excludeIds),
        MAX_REPORTS,
        q.difficulty ?? 0,
        q.limit,
      ) as { id: string; data: string }[];

    if (rows.length > 0) {
      const mark = this.db.prepare("UPDATE tasks SET served = served + 1 WHERE id = ?");
      for (const r of rows) mark.run(r.id);
    }
    return rows.map((r) => JSON.parse(r.data) as Task);
  }

  async count(trainerId?: string): Promise<number> {
    const row = trainerId
      ? this.db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE trainer_id = ?").get(trainerId)
      : this.db.prepare("SELECT COUNT(*) AS n FROM tasks").get();
    return (row as { n: number }).n;
  }

  async report(taskId: string, _report: TaskReport): Promise<boolean> {
    return this.db.prepare("UPDATE tasks SET reports = reports + 1 WHERE id = ?").run(taskId).changes > 0;
  }

  /** All stored tasks (used to copy a local pool into Postgres). */
  exportAll(): PooledTask[] {
    const rows = this.db.prepare("SELECT trainer_id, lang, grade, level, data, reports FROM tasks").all() as {
      trainer_id: string;
      lang: Lang;
      grade: Grade;
      level: string;
      data: string;
      reports: number;
    }[];
    return rows.map((r) => ({
      ctx: { trainerId: r.trainer_id, lang: r.lang, grade: r.grade, level: (r.level || undefined) as Level | undefined },
      task: JSON.parse(r.data) as Task,
      reports: r.reports,
    }));
  }

  close() {
    this.db.close();
  }
}
