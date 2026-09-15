import { TaskReportRequest } from "@portal/core";
import type { TaskPoolStore } from "@portal/task-pool";
import type { FastifyInstance } from "fastify";

/** "Report a problem with this task": tasks reported twice are no longer served from the pool. */
export function registerTaskRoutes(app: FastifyInstance, pool?: TaskPoolStore) {
  app.post<{ Params: { taskId: string } }>(
    "/api/tasks/:taskId/report",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const parsed = TaskReportRequest.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid report", code: "BAD_REQUEST" });
      }
      const reported = pool
        ? await pool.report(request.params.taskId, { userId: request.user?.id ?? null, reason: parsed.data.reason })
        : false;
      if (!reported) return reply.code(404).send({ error: "Task not found", code: "NOT_FOUND" });
      return { ok: true };
    },
  );
}
