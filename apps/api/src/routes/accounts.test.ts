// Accounts, consent, history and progress through the HTTP API against the local Supabase.
// Skipped automatically when Supabase is not configured or not running.
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { MockClient } from "@portal/ai";
import type { DataExport, SessionDetail, Task } from "@portal/core";
import { dbConfigFromEnv, PortalDb } from "@portal/db";
import { TaskPool } from "@portal/task-pool";
import { topicsFor } from "@portal/trainer-math";
import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.ts";
import type { MailMessage } from "../mailer.ts";

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
const thisYear = new Date().getFullYear();
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
  const mail: MailMessage[] = [];
  const createdUsers: string[] = [];

  async function signUp(birthYear: number | null) {
    const email = `api-${randomUUID()}@example.com`;
    const password = `pw-${randomUUID()}`;
    const { data, error } = await db.admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: "Api" } });
    if (error) throw error;
    createdUsers.push(data.user.id);
    if (birthYear !== null) await db.updateProfile({ id: data.user.id, email }, { birthYear });
    const anon = createClient(config!.url, anonKey!, { auth: { persistSession: false } });
    const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    return { id: data.user.id, email, headers: { authorization: `Bearer ${signIn.session!.access_token}` } };
  }

  const generate = (headers: Record<string, string>, body: object = generateBody) =>
    app.inject({ method: "POST", url: "/api/trainers/math/generate", headers, payload: body });

  beforeAll(async () => {
    db = new PortalDb(config!);
    app = await buildApp(new MockClient(), {
      logger: false,
      pool: new TaskPool(":memory:"),
      db,
      serveWeb: false,
      publicUrl: "https://matema.test",
      mailer: { send: async (m) => void mail.push(m) },
    });
  });

  afterAll(async () => {
    await app?.close();
    for (const id of createdUsers) await db.admin.auth.admin.deleteUser(id).catch(() => undefined);
  });

  it("rejects missing and invalid tokens on account routes", async () => {
    expect((await app.inject("/api/health")).json()).toMatchObject({ auth: true });
    expect((await app.inject("/api/me/progress")).statusCode).toBe(401);
    expect((await app.inject({ url: "/api/me/progress", headers: { authorization: "Bearer nope" } })).statusCode).toBe(401);
    expect((await generate({})).json().sessionId).toBeUndefined();
  });

  it("reads and updates the profile", async () => {
    const user = await signUp(thisYear - 20);
    expect((await app.inject({ url: "/api/me/profile", headers: user.headers })).json()).toMatchObject({ id: user.id, displayName: "Api", consentRequired: false });
    const patched = await app.inject({ method: "PATCH", url: "/api/me/profile", headers: user.headers, payload: { displayName: "Ania", grade: "sp7" } });
    expect(patched.json()).toMatchObject({ displayName: "Ania", grade: "sp7" });
    expect((await app.inject({ method: "PATCH", url: "/api/me/profile", headers: user.headers, payload: { grade: "sp9" } })).statusCode).toBe(400);
  });

  it("stores no history for a student under 16 until a parent confirms the e-mail link", async () => {
    const kid = await signUp(thisYear - 12);
    expect((await app.inject({ url: "/api/me/profile", headers: kid.headers })).json()).toMatchObject({ consentRequired: true, consentPendingFor: null });
    expect((await generate(kid.headers)).json().sessionId).toBeUndefined();

    const same = await app.inject({ method: "POST", url: "/api/me/parental-consent", headers: kid.headers, payload: { parentEmail: kid.email, lang: "pl" } });
    expect(same.json()).toMatchObject({ code: "PARENT_EMAIL_SAME" });

    const request = await app.inject({ method: "POST", url: "/api/me/parental-consent", headers: kid.headers, payload: { parentEmail: "Mama@Example.com", lang: "pl" } });
    expect(request.json()).toEqual({ ok: true, sentTo: "m***@example.com" });
    const message = mail.at(-1)!;
    expect(message).toMatchObject({ to: "mama@example.com", subject: expect.stringContaining("zgod") });
    const link = message.text.match(/https:\/\/matema\.test\/api\/consent\/confirm\?\S+/)![0];
    expect((await app.inject({ url: "/api/me/profile", headers: kid.headers })).json()).toMatchObject({ consentPendingFor: "m***@example.com" });

    const confirm = await app.inject({ url: link.replace("https://matema.test", "") });
    expect(confirm.statusCode).toBe(200);
    expect(confirm.headers["content-type"]).toContain("text/html");
    expect(confirm.body).toContain("Dziękujemy");
    expect((await app.inject({ url: "/api/consent/confirm?token=nope&lang=ru" })).statusCode).toBe(400);

    expect((await app.inject({ url: "/api/me/profile", headers: kid.headers })).json()).toMatchObject({ consentRequired: false });
    expect((await generate(kid.headers)).json().sessionId).toMatch(/^[0-9a-f-]{36}$/);
    const again = await app.inject({ method: "POST", url: "/api/me/parental-consent", headers: kid.headers, payload: { parentEmail: "tata@example.com", lang: "pl" } });
    expect(again.json()).toMatchObject({ code: "CONSENT_NOT_REQUIRED" });
  });

  it("stores a session: server-checked answers, finish, feedback, history, progress, no repeats, export, delete", async () => {
    const user = await signUp(thisYear - 17);
    const res = await generate(user.headers);
    expect(res.statusCode).toBe(200);
    const { tasks, sessionId } = res.json() as { tasks: Task[]; sessionId: string };
    expect(sessionId).toMatch(/^[0-9a-f-]{36}$/);

    const answer = (position: number, value: string, usedHint = false) =>
      app.inject({ method: "POST", url: `/api/sessions/${sessionId}/answers`, headers: user.headers, payload: { position, answer: value, usedHint } });

    expect((await answer(0, tasks[0].correctAnswer)).json()).toEqual({ correct: true });
    expect((await answer(0, tasks[0].correctAnswer)).statusCode).toBe(409);
    expect((await answer(1, "-12345", true)).json()).toEqual({ correct: false });
    expect((await answer(99, "1")).statusCode).toBe(404);

    const finish = await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/finish`, headers: user.headers });
    expect(finish.json()).toMatchObject({ id: sessionId, correct: 1, total: 10, answered: 2 });
    expect(finish.json().tasks).toBeUndefined();

    const feedback = await app.inject({
      method: "POST",
      url: "/api/trainers/math/feedback",
      headers: user.headers,
      payload: {
        lang: "ru",
        grade: "sp7",
        sessionId,
        results: [{ taskId: tasks[1].id, topicId: tasks[1].topicId, subtopic: "x", difficulty: 1, question: "q", correct: false, userAnswer: "-12345", correctAnswer: "1", usedHint: true }],
      },
    });
    expect(feedback.statusCode).toBe(200);

    const list = (await app.inject({ url: "/api/me/sessions", headers: user.headers })).json();
    expect(list.sessions.map((s: { id: string }) => s.id)).toContain(sessionId);

    const detail = (await app.inject({ url: `/api/me/sessions/${sessionId}`, headers: user.headers })).json() as SessionDetail;
    expect(detail.tasks).toHaveLength(10);
    expect(detail.tasks[1]).toMatchObject({ userAnswer: "-12345", correct: false, usedHint: true });
    expect(detail.feedback?.summary).toMatch(/^\[mock\]/);
    expect((await app.inject({ url: `/api/me/sessions/${randomUUID()}`, headers: user.headers })).statusCode).toBe(404);
    expect((await app.inject({ url: "/api/me/sessions/not-a-uuid", headers: user.headers })).statusCode).toBe(404);

    expect((await app.inject({ url: "/api/me/progress", headers: user.headers })).json()).toMatchObject({ tasksAnswered: 2, correct: 1 });

    // the pool now holds these tasks, but this student must not get them again
    const again = await generate(user.headers);
    const seen = new Set(tasks.map((t) => t.id));
    expect((again.json().tasks as Task[]).some((t) => seen.has(t.id))).toBe(false);

    const exported = await app.inject({ url: "/api/me/export", headers: user.headers });
    expect(exported.headers["content-disposition"]).toContain("attachment");
    const data = exported.json() as DataExport;
    expect(data.profile.id).toBe(user.id);
    expect(data.sessions.map((s) => s.id)).toContain(sessionId);

    expect((await app.inject({ method: "DELETE", url: "/api/me", headers: user.headers })).statusCode).toBe(204);
    expect((await app.inject({ url: "/api/me/profile", headers: user.headers })).statusCode).toBe(401);
  });

  it("does not let another student answer or read the session", async () => {
    const owner = await signUp(thisYear - 18);
    const { sessionId } = (await generate(owner.headers, { ...generateBody, count: 5 })).json() as { sessionId: string };
    const intruder = await signUp(thisYear - 18);

    const answer = await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/answers`, headers: intruder.headers, payload: { position: 0, answer: "1" } });
    expect(answer.statusCode).toBe(404);
    expect((await app.inject({ url: `/api/me/sessions/${sessionId}`, headers: intruder.headers })).statusCode).toBe(404);
  });
});
