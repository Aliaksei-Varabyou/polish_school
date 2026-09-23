import type { Task } from "@portal/core";
import { ANSWER_TYPES, MAX_REPORTS, type PoolContext, type PoolQuery, type TaskPoolStore, type TaskReport } from "@portal/task-pool";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Rows per page when listing ids; PostgREST's default max-rows is 1000. */
const ID_PAGE = 1000;
/** Ids per delete request. */
const REMOVE_BATCH = 100;

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

  async listIds(trainerId: string): Promise<string[]> {
    const ids: string[] = [];
    // PostgREST caps a response (1000 rows by default), so read in pages until one comes back short
    for (let from = 0; ; from += ID_PAGE) {
      const { data, error } = await this.admin
        .from("tasks")
        .select("id")
        .eq("trainer_id", trainerId)
        .order("id")
        .range(from, from + ID_PAGE - 1);
      if (error) throw new Error(`pool listIds: ${error.message}`);
      ids.push(...(data as { id: string }[]).map((r) => r.id));
      if (data.length < ID_PAGE) return ids;
    }
  }

  async remove(ids: readonly string[]): Promise<void> {
    // the ids travel in the query string (`id=in.(…)`), so batches keep the URL well under proxy limits
    for (let i = 0; i < ids.length; i += REMOVE_BATCH) {
      const { error } = await this.admin.from("tasks").delete().in("id", ids.slice(i, i + REMOVE_BATCH));
      if (error) throw new Error(`pool remove: ${error.message}`);
    }
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
