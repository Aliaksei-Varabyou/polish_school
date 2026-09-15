import type { Task } from "@portal/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/client.ts", () => ({
  ApiRequestError: class extends Error {},
  api: { generate: vi.fn(), feedback: vi.fn(), answer: vi.fn(), finish: vi.fn() },
}));

const { api } = await import("../api/client.ts");
const { useSession, historySynced } = await import("./session.ts");

const task = (id: string, answerType: Task["answerType"] = "number"): Task => ({
  id,
  topicId: "sp7-algebra",
  subtopic: "x",
  difficulty: 1,
  question: "1+1",
  answerType,
  correctAnswer: "2",
  solution: "2",
  ...(answerType === "choice"
    ? {
        correctChoice: "B" as const,
        choices: (["A", "B", "C", "D"] as const).map((label) => ({ label, text: label === "B" ? "2" : label })),
      }
    : {}),
});

const SESSION = "11111111-1111-4111-8111-111111111111";

async function start(sessionId?: string) {
  vi.mocked(api.generate).mockResolvedValue({ tasks: [task("t1"), task("t2", "choice")], sessionId });
  await useSession.getState().generate({ topicIds: ["sp7-algebra"], grade: "sp7", count: 5 });
}

describe("math session history sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.answer).mockResolvedValue({ correct: true });
    vi.mocked(api.finish).mockResolvedValue({} as never);
    useSession.getState().quit();
  });

  it("posts answers and finish in order for signed-in users", async () => {
    await start(SESSION);
    const s = useSession.getState();
    expect(s.sessionId).toBe(SESSION);

    s.revealHint();
    s.submitAnswer("4/2");
    expect(useSession.getState().answers.t1).toEqual({ answer: "4/2", correct: true, usedHint: true });
    s.next();
    useSession.getState().submitAnswer("C");
    useSession.getState().next();
    expect(useSession.getState().status).toBe("finished");

    await historySynced();
    expect(api.answer).toHaveBeenNthCalledWith(1, SESSION, { position: 0, answer: "4/2", usedHint: true });
    expect(api.answer).toHaveBeenNthCalledWith(2, SESSION, { position: 1, answer: "C", usedHint: false });
    expect(api.finish).toHaveBeenCalledWith(SESSION);
    expect(vi.mocked(api.finish).mock.invocationCallOrder[0]).toBeGreaterThan(
      vi.mocked(api.answer).mock.invocationCallOrder[1],
    );
  });

  it("a failed sync does not affect the session", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(api.answer).mockRejectedValue(new Error("offline"));
    await start(SESSION);
    useSession.getState().submitAnswer("3");
    expect(useSession.getState().answers.t1?.correct).toBe(false);
    await historySynced();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("guests never sync; quit resets the session id", async () => {
    await start(undefined);
    expect(useSession.getState().sessionId).toBeNull();
    useSession.getState().submitAnswer("2");
    useSession.getState().next();
    useSession.getState().submitAnswer("B");
    useSession.getState().next();
    await historySynced();
    expect(api.answer).not.toHaveBeenCalled();
    expect(api.finish).not.toHaveBeenCalled();

    await start(SESSION);
    useSession.getState().quit();
    expect(useSession.getState().sessionId).toBeNull();
  });

  it("feedback carries the session id", async () => {
    vi.mocked(api.feedback).mockResolvedValue({ summary: "", weakTopics: [], recommendations: [], suggestedTopicIds: [] });
    await start(SESSION);
    useSession.getState().submitAnswer("2");
    await useSession.getState().loadFeedback();
    expect(vi.mocked(api.feedback).mock.calls[0]![0].sessionId).toBe(SESSION);
  });
});
