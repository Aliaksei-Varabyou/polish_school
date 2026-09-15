// Accounts, history and progress through the HTTP API against the local Supabase.
// Skipped automatically when Supabase is not configured or not running.
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { MockClient } from "@portal/ai";
import type { SessionDetail, Task } from "@portal/core";
import { dbConfigFromEnv, PortalDb } from "@portal/db";
import { TaskPool } from "@portal/task-pool";
import { topicsFor } from "@portal/trainer-math";
import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.ts";

try {
  process.loadEnvFile(resolve(import.meta.dirname, "../../../../.env"));
} catch {
  // no .env — rely on the environment
}

const config = dbConfigFromEnv();
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function reachable(): Promise<boolean> {
  if (!config || !anonKey) return false;
  try {
    const res = await fetch(`${config.url}/auth/v1/health`, { headers: { apikey: anonKey }, signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

const available = await reachable();
const topicIds = topicsFor("sp7").slice(0, 5).map((t) => t.id);
const generateBody = { lang: "ru", grade: "sp7", topicIds, count: 10, answerMode: "input" };

describe("accounts disabled", () => {
  it("returns 503 for account routes and still generates for guests", async () => {
    const app = await buildApp(new MockClient(), { logger: false, pool: new TaskPool(":memory:"), serveWeb: false });
    expect((await app.inject("/api/health")).json()).toMatchObject({ auth: false });
    expect((await app.inject("/api/me/profile")).json()).toMatchObject({ code: "AUTH_DISABLED" });
    const res = await app.inject({ method: "POST", url: "/api/trainers/math/generate", payload: generateBody });
    expect(res.statusCode).toBe(200);
    expect(res.json().sessionId).toBeUndefined();
    await app.close();
  });
});

describe.skipIf(!available)("accounts (local Supabase)", () => {
  let db: PortalDb;
  let app: Awaited<ReturnType<typeof buildApp>>;
  let userId = "";
  let token = "";
  const auth = () => ({ authorization: `Bearer ${token}` });

  beforeAll(async () => {
    db = new PortalDb(config!);
    app = await buildApp(new MockClient(), { logger: false, pool: new TaskPool(":memory:"), db, serveWeb: false });

    const email = `api-${randomUUID()}@example.com`;
    const password = `pw-${randomUUID()}`;
    const { data, error } = await db.admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: "Api" } });
    if (error) throw error;
    userId = data.user.id;
    const anon = createClient(config!.url, anonKey!, { auth: { persistSession: false } });
    const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    token = signIn.session!.access_token;
  });

  afterAll(async () => {
    await app?.close();
    if (userId) await db.admin.auth.admin.deleteUser(userId);
  });

  it("rejects missing and invalid tokens on account routes", async () => {
    expect((await app.inject("/api/health")).json()).toMatchObject({ auth: true });
    expect((await app.inject("/api/me/progress")).statusCode).toBe(401);
    expect((await app.inject({ url: "/api/me/progress", headers: { authorization: "Bearer nope" } })).statusCode).toBe(401);
    const guest = await app.inject({ method: "POST", url: "/api/trainers/math/generate", payload: generateBody });
    expect(guest.json().sessionId).toBeUndefined();
  });

  it("reads and updates the profile", async () => {
    expect((await app.inject({ url: "/api/me/profile", headers: auth() })).json()).toMatchObject({ id: userId, displayName: "Api" });
    const patched = await app.inject({
      method: "PATCH",
      url: "/api/me/profile",
      headers: auth(),
      payload: { displayName: "Ania", grade: "sp7", birthYear: 2013, parentalConsent: true },
    });
    expect(patched.json()).toMatchObject({ displayName: "Ania", grade: "sp7", birthYear: 2013 });
    expect(patched.json().parentalConsentAt).not.toBeNull();
    expect((await app.inject({ method: "PATCH", url: "/api/me/profile", headers: auth(), payload: { grade: "sp9" } })).statusCode).toBe(400);
  });

  it("stores a session: server-checked answers, finish, feedback, history, progress, no repeats", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/math/generate", headers: auth(), payload: generateBody });
    expect(res.statusCode).toBe(200);
    const { tasks, sessionId } = res.json() as { tasks: Task[]; sessionId: string };
    expect(sessionId).toMatch(/^[0-9a-f-]{36}$/);

    const answer = (position: number, value: string, usedHint = false) =>
      app.inject({ method: "POST", url: `/api/sessions/${sessionId}/answers`, headers: auth(), payload: { position, answer: value, usedHint } });

    expect((await answer(0, tasks[0].correctAnswer)).json()).toEqual({ correct: true });
    expect((await answer(0, tasks[0].correctAnswer)).statusCode).toBe(409);
    expect((await answer(1, "-12345", true)).json()).toEqual({ correct: false });
    expect((await answer(99, "1")).statusCode).toBe(404);

    const finish = await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/finish`, headers: auth() });
    expect(finish.json()).toMatchObject({ id: sessionId, correct: 1, total: 10, answered: 2 });
    expect(finish.json().tasks).toBeUndefined();

    const feedback = await app.inject({
      method: "POST",
      url: "/api/trainers/math/feedback",
      headers: auth(),
      payload: {
        lang: "ru",
        grade: "sp7",
        sessionId,
        results: [{ taskId: tasks[1].id, topicId: tasks[1].topicId, subtopic: "x", difficulty: 1, question: "q", correct: false, userAnswer: "-12345", correctAnswer: "1", usedHint: true }],
      },
    });
    expect(feedback.statusCode).toBe(200);

    const list = (await app.inject({ url: "/api/me/sessions", headers: auth() })).json();
    expect(list.sessions.map((s: { id: string }) => s.id)).toContain(sessionId);

    const detail = (await app.inject({ url: `/api/me/sessions/${sessionId}`, headers: auth() })).json() as SessionDetail;
    expect(detail.tasks).toHaveLength(10);
    expect(detail.tasks[1]).toMatchObject({ userAnswer: "-12345", correct: false, usedHint: true });
    expect(detail.feedback?.summary).toMatch(/^\[mock\]/);
    expect((await app.inject({ url: `/api/me/sessions/${randomUUID()}`, headers: auth() })).statusCode).toBe(404);
    expect((await app.inject({ url: "/api/me/sessions/not-a-uuid", headers: auth() })).statusCode).toBe(404);

    const progress = (await app.inject({ url: "/api/me/progress", headers: auth() })).json();
    expect(progress).toMatchObject({ tasksAnswered: 2, correct: 1 });

    // the pool now holds these tasks, but this student must not get them again
    const again = await app.inject({ method: "POST", url: "/api/trainers/math/generate", headers: auth(), payload: generateBody });
    const seen = new Set(tasks.map((t) => t.id));
    expect((again.json().tasks as Task[]).some((t) => seen.has(t.id))).toBe(false);
  });

  it("does not let another student answer or read the session", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/math/generate", headers: auth(), payload: { ...generateBody, count: 5 } });
    const { sessionId } = res.json() as { sessionId: string };

    const email = `intruder-${randomUUID()}@example.com`;
    const password = `pw-${randomUUID()}`;
    const { data } = await db.admin.auth.admin.createUser({ email, password, email_confirm: true });
    try {
      const anon = createClient(config!.url, anonKey!, { auth: { persistSession: false } });
      const { data: signIn } = await anon.auth.signInWithPassword({ email, password });
      const intruder = { authorization: `Bearer ${signIn.session!.access_token}` };
      const answer = await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/answers`, headers: intruder, payload: { position: 0, answer: "1" } });
      expect(answer.statusCode).toBe(404);
      expect((await app.inject({ url: `/api/me/sessions/${sessionId}`, headers: intruder })).statusCode).toBe(404);
    } finally {
      await db.admin.auth.admin.deleteUser(data.user!.id);
    }
  });
});
