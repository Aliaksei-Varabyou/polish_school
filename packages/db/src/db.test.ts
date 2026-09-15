// Integration tests against the local Supabase (npm run start -w @portal/db).
// Skipped automatically when Supabase is not configured or not running.
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type { SessionSettings, Task } from "@portal/core";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { dbConfigFromEnv, PortalDb } from "./index.ts";

try {
  process.loadEnvFile(resolve(import.meta.dirname, "../../../.env"));
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

const task = (n: number, topicId: string, overrides: Partial<Task> = {}): Task => ({
  id: randomUUID(),
  topicId,
  subtopic: "x",
  difficulty: 2,
  question: `Q${n}`,
  answerType: "number",
  correctAnswer: String(n),
  verifyExpression: String(n),
  solution: "s",
  ...overrides,
});

const settings: SessionSettings = { lang: "pl", grade: "sp7", topicIds: ["sp7.percent", "sp7.powers"], count: 5, answerMode: "input" };

describe.skipIf(!available)("PortalDb + RLS (local Supabase)", () => {
  let db: PortalDb;
  const users: { id: string; email: string; password: string; client: SupabaseClient; token: string }[] = [];

  async function newUser(displayName: string) {
    const email = `test-${randomUUID()}@example.com`;
    const password = `pw-${randomUUID()}`;
    const { data, error } = await db.admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName, ui_lang: "ru" },
    });
    if (error) throw error;
    const client = createClient(config!.url, anonKey!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: signIn, error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    const user = { id: data.user.id, email, password, client, token: signIn.session!.access_token };
    users.push(user);
    return user;
  }

  beforeAll(async () => {
    db = new PortalDb(config!);
  });

  afterAll(async () => {
    for (const u of users) await db.admin.auth.admin.deleteUser(u.id);
  });

  it("verifies access tokens and creates a profile on sign-up", async () => {
    const alice = await newUser("Alice");
    expect(await db.userFromToken(alice.token)).toEqual({ id: alice.id, email: alice.email });
    expect(await db.userFromToken("not-a-token")).toBeNull();

    const profile = await db.getProfile({ id: alice.id, email: alice.email });
    expect(profile).toMatchObject({ displayName: "Alice", uiLang: "ru", grade: null, parentalConsentAt: null });

    const updated = await db.updateProfile({ id: alice.id, email: alice.email }, { grade: "lo2", level: "R", birthYear: 2010, parentalConsent: true });
    expect(updated).toMatchObject({ grade: "lo2", level: "R", birthYear: 2010 });
    expect(updated?.parentalConsentAt).not.toBeNull();
  });

  it("stores a session, the first answer only, feedback, history and progress", async () => {
    const bob = await newUser("Bob");
    const tasks = [task(1, "sp7.percent"), task(2, "sp7.percent"), task(3, "sp7.powers")];
    const sessionId = await db.createSession(bob.id, "math", settings, tasks);

    expect(await db.getSessionTask(sessionId, bob.id, 0)).toMatchObject({ trainerId: "math", task: { id: tasks[0].id }, answered: false });
    expect(await db.recordAnswer(sessionId, 0, { answer: "1", correct: true, usedHint: false })).toBe(true);
    expect(await db.recordAnswer(sessionId, 0, { answer: "999", correct: false, usedHint: false })).toBe(false);
    expect(await db.recordAnswer(sessionId, 2, { answer: "7", correct: false, usedHint: true })).toBe(true);

    const finished = await db.finishSession(sessionId, bob.id);
    expect(finished).toMatchObject({ correct: 1, total: 3, answered: 2 });
    expect(finished?.finishedAt).not.toBeNull();

    const feedback = { summary: "ok", weakTopics: [], recommendations: ["r"], suggestedTopicIds: [] };
    expect(await db.saveFeedback(sessionId, bob.id, feedback)).toBe(true);

    const detail = await db.getSessionDetail(sessionId, bob.id);
    expect(detail?.tasks.map((t) => [t.position, t.userAnswer, t.correct])).toEqual([
      [0, "1", true],
      [1, null, null],
      [2, "7", false],
    ]);
    expect(detail?.feedback).toEqual(feedback);

    expect((await db.listSessions(bob.id)).map((s) => s.id)).toEqual([sessionId]);
    expect((await db.seenTaskIds(bob.id, "math")).sort()).toEqual(tasks.map((t) => t.id).sort());
    expect(await db.seenTaskIds(bob.id, "other")).toEqual([]);

    const progress = await db.progress(bob.id);
    expect(progress).toMatchObject({ sessions: 1, tasksAnswered: 2, correct: 1 });
    expect(progress.topics.map((t) => [t.topicId, t.attempts, t.correct])).toEqual([
      ["sp7.powers", 1, 0],
      ["sp7.percent", 1, 1],
    ]);
  });

  it("does not expose or modify other users' sessions", async () => {
    const owner = await newUser("Owner");
    const other = await newUser("Other");
    const sessionId = await db.createSession(owner.id, "math", settings, [task(1, "sp7.percent")]);

    expect(await db.getSessionTask(sessionId, other.id, 0)).toBeNull();
    expect(await db.getSessionDetail(sessionId, other.id)).toBeNull();
    expect(await db.finishSession(sessionId, other.id)).toBeNull();
    expect(await db.saveFeedback(sessionId, other.id, { summary: "x", weakTopics: [], recommendations: [], suggestedTopicIds: [] })).toBe(false);
  });

  it("RLS: students read only their own rows and cannot write history or consent", async () => {
    const owner = await newUser("RlsOwner");
    const other = await newUser("RlsOther");
    const sessionId = await db.createSession(owner.id, "math", settings, [task(1, "sp7.percent")]);

    const own = await owner.client.from("sessions").select("id");
    expect(own.data?.map((r) => r.id)).toEqual([sessionId]);
    expect((await owner.client.from("session_tasks").select("position")).data).toHaveLength(1);

    const foreign = await other.client.from("sessions").select("id");
    expect(foreign.data).toEqual([]);
    expect((await other.client.from("session_tasks").select("position")).data).toEqual([]);
    expect((await other.client.from("profiles").select("id")).data?.map((r) => r.id)).toEqual([other.id]);

    const insert = await owner.client.from("sessions").insert({ user_id: owner.id, trainer_id: "math", settings, total: 1 });
    expect(insert.error).not.toBeNull();
    const cheat = await owner.client.from("session_tasks").update({ correct: true }).eq("session_id", sessionId).select();
    expect(cheat.data ?? []).toEqual([]);

    const rename = await owner.client.from("profiles").update({ display_name: "Renamed" }).eq("id", owner.id).select("display_name");
    expect(rename.data).toEqual([{ display_name: "Renamed" }]);
    const consent = await owner.client.from("profiles").update({ parental_consent_at: new Date().toISOString() }).eq("id", owner.id);
    expect(consent.error).not.toBeNull();

    const anon = createClient(config!.url, anonKey!, { auth: { persistSession: false } });
    expect((await anon.from("sessions").select("id")).data ?? []).toEqual([]);
  });
});
