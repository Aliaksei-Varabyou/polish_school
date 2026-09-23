import type { Task } from "@portal/core";
import { ANSWER_TYPES, MAX_REPORTS, type PoolContext, type PoolQuery, type TaskPoolStore, type TaskReport } from "@portal/task-pool";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Task pool in Postgres (Supabase), shared by all API instances. Requires the service-role client. */
export class SupabaseTaskPool implements TaskPoolStore {
  constructor(private admin: SupabaseClient) {}

  async add(tasks: Task[], ctx: PoolContext): Promise<void> {
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
      tags: t.tags ?? [],
    }));
    const { error } = await this.admin.from("tasks").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw new Error(`pool add: ${error.message}`);
  }

  async take(q: PoolQuery): Promise<Task[]> {
    if (q.limit <= 0) return [];
    const { data, error } = await this.admin.rpc("take_pool_tasks", {
      p_trainer_id: q.trainerId,
      p_lang: q.lang,
      p_grade: q.grade,
      p_level: q.level ?? "",
      p_topic_id: q.topicId,
      p_answer_types: ANSWER_TYPES[q.answerMode],
      p_tags: [...(q.tags ?? [])],
      p_difficulty: q.difficulty ?? 0,
      p_exclude: [...q.excludeIds],
      p_limit: q.limit,
      p_max_reports: MAX_REPORTS,
    });
    if (error) throw new Error(`pool take: ${error.message}`);
    return (data ?? []) as Task[];
  }

  async count(trainerId?: string): Promise<number> {
    let query = this.admin.from("tasks").select("id", { count: "exact", head: true });
    if (trainerId) query = query.eq("trainer_id", trainerId);
    const { count, error } = await query;
    if (error) throw new Error(`pool count: ${error.message}`);
    return count ?? 0;
  }

  async report(taskId: string, report: TaskReport): Promise<boolean> {
    const { data, error } = await this.admin.rpc("report_task", {
      p_task_id: taskId,
      p_user_id: report.userId ?? null,
      p_reason: report.reason ?? null,
    });
    if (error) throw new Error(`pool report: ${error.message}`);
    return data === true;
  }
}
