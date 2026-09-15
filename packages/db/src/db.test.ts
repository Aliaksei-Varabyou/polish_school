// Integration tests against the local Supabase (npm run start -w @portal/db).
// Skipped automatically when Supabase is not configured or not running.
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type { SessionSettings, Task } from "@portal/core";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { dbConfigFromEnv, maskEmail, PortalDb } from "./index.ts";

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
const thisYear = new Date().getFullYear();

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

describe("maskEmail", () => {
  it("keeps the first letter and the domain", () => {
    expect(maskEmail("anna@example.com")).toBe("a***@example.com");
    expect(maskEmail("broken")).toBe("***");
  });
});

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
    for (const u of users) await db.admin.auth.admin.deleteUser(u.id).catch(() => undefined);
  });

  it("verifies access tokens and creates a profile on sign-up", async () => {
    const alice = await newUser("Alice");
    expect(await db.userFromToken(alice.token)).toEqual({ id: alice.id, email: alice.email });
    expect(await db.userFromToken("not-a-token")).toBeNull();

    const profile = await db.getProfile({ id: alice.id, email: alice.email });
    expect(profile).toMatchObject({ displayName: "Alice", uiLang: "ru", grade: null, parentalConsentAt: null, consentRequired: true });

    const adult = await db.updateProfile({ id: alice.id, email: alice.email }, { grade: "lo2", level: "R", birthYear: thisYear - 18 });
    expect(adult).toMatchObject({ grade: "lo2", level: "R", birthYear: thisYear - 18, consentRequired: false, consentPendingFor: null });
    expect(await db.canStoreHistory(alice.id)).toBe(true);
  });

  it("requires a parent's confirmation for students under 16 (double opt-in)", async () => {
    const kid = await newUser("Kid");
    const me = { id: kid.id, email: kid.email };
    await db.updateProfile(me, { birthYear: thisYear - 12 });
    expect(await db.canStoreHistory(kid.id)).toBe(false);

    const first = await db.requestParentalConsent(kid.id, "mama@example.com", "v1");
    const second = await db.requestParentalConsent(kid.id, "tata@example.com", "v1");
    expect((await db.getProfile(me))?.consentPendingFor).toBe("t***@example.com");

    // only the latest link works; tokens are stored as hashes
    expect(await db.confirmParentalConsent(first.token)).toBe("invalid");
    const { data: stored } = await db.admin.from("parental_consents").select("token_hash").eq("user_id", kid.id);
    expect(stored?.map((r) => r.token_hash)).not.toContain(second.token);

    expect(await db.confirmParentalConsent(second.token)).toBe("confirmed");
    expect(await db.confirmParentalConsent(second.token)).toBe("already-confirmed");
    expect(await db.confirmParentalConsent("")).toBe("invalid");
    expect(await db.canStoreHistory(kid.id)).toBe(true);
    expect(await db.getProfile(me)).toMatchObject({ consentRequired: false, consentPendingFor: null });
    expect((await db.getProfile(me))?.parentalConsentAt).not.toBeNull();

    // expired links are rejected
    const late = await newUser("Late");
    await db.updateProfile({ id: late.id, email: late.email }, { birthYear: thisYear - 11 });
    const { token } = await db.requestParentalConsent(late.id, "parent@example.com", "v1");
    await db.admin.from("parental_consents").update({ expires_at: new Date(Date.now() - 1000).toISOString() }).eq("user_id", late.id);
    expect(await db.confirmParentalConsent(token)).toBe("expired");
  });

  it("deletes unconfirmed minors after the grace period but keeps adults and confirmed students", async () => {
    const minor = await newUser("OldMinor");
    const adult = await newUser("OldAdult");
    const fresh = await newUser("FreshMinor");
    await db.updateProfile({ id: minor.id, email: minor.email }, { birthYear: thisYear - 13 });
    await db.updateProfile({ id: adult.id, email: adult.email }, { birthYear: thisYear - 20 });
    await db.updateProfile({ id: fresh.id, email: fresh.email }, { birthYear: thisYear - 13 });
    const old = new Date(Date.now() - 20 * 86_400_000).toISOString();
    await db.admin.from("profiles").update({ created_at: old }).in("id", [minor.id, adult.id]);

    expect(await db.deleteUnconfirmedMinors(14)).toBeGreaterThanOrEqual(1);
    const { data } = await db.admin.from("profiles").select("id").in("id", [minor.id, adult.id, fresh.id]);
    expect(data?.map((r) => r.id).sort()).toEqual([adult.id, fresh.id].sort());
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

    // RODO: export everything, then delete the account with all history
    const me = { id: bob.id, email: bob.email };
    await db.requestParentalConsent(bob.id, "parent@example.com", "v1");
    const exported = await db.exportData(me);
    expect(exported?.profile.id).toBe(bob.id);
    expect(exported?.sessions.map((s) => [s.id, s.tasks.length])).toEqual([[sessionId, 3]]);
    expect(exported?.parentalConsents).toMatchObject([{ parentEmail: "parent@example.com", confirmedAt: null, textVersion: "v1" }]);

    await db.deleteAccount(bob.id);
    expect(await db.userFromToken(bob.token)).toBeNull();
    const { data: left } = await db.admin.from("sessions").select("id").eq("id", sessionId);
    expect(left).toEqual([]);
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
    await db.requestParentalConsent(owner.id, "parent@example.com", "v1");

    const own = await owner.client.from("sessions").select("id");
    expect(own.data?.map((r) => r.id)).toEqual([sessionId]);
    expect((await owner.client.from("session_tasks").select("position")).data).toHaveLength(1);
    expect((await owner.client.from("parental_consents").select("parent_email")).data).toHaveLength(1);

    const foreign = await other.client.from("sessions").select("id");
    expect(foreign.data).toEqual([]);
    expect((await other.client.from("session_tasks").select("position")).data).toEqual([]);
    expect((await other.client.from("parental_consents").select("parent_email")).data).toEqual([]);
    expect((await other.client.from("profiles").select("id")).data?.map((r) => r.id)).toEqual([other.id]);

    const insert = await owner.client.from("sessions").insert({ user_id: owner.id, trainer_id: "math", settings, total: 1 });
    expect(insert.error).not.toBeNull();
    const cheat = await owner.client.from("session_tasks").update({ correct: true }).eq("session_id", sessionId).select();
    expect(cheat.data ?? []).toEqual([]);
    const selfConsent = await owner.client.from("parental_consents").update({ confirmed_at: new Date().toISOString() }).eq("user_id", owner.id).select();
    expect(selfConsent.data ?? []).toEqual([]);

    const rename = await owner.client.from("profiles").update({ display_name: "Renamed" }).eq("id", owner.id).select("display_name");
    expect(rename.data).toEqual([{ display_name: "Renamed" }]);
    const consent = await owner.client.from("profiles").update({ parental_consent_at: new Date().toISOString() }).eq("id", owner.id);
    expect(consent.error).not.toBeNull();

    const anon = createClient(config!.url, anonKey!, { auth: { persistSession: false } });
    expect((await anon.from("sessions").select("id")).data ?? []).toEqual([]);
    expect((await anon.from("tasks").select("id")).data ?? []).toEqual([]);
    expect((await anon.rpc("take_pool_tasks", {
      p_trainer_id: "math", p_lang: "pl", p_grade: "sp7", p_level: "", p_topic_id: "sp7.percent",
      p_answer_types: ["number"], p_difficulty: 1, p_exclude: [], p_limit: 1,
    })).error).not.toBeNull();
  });
});
