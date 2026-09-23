import type { AnswerMode, FeedbackResponse, Lang, Task, TaskResult } from "@portal/core";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { checkAnswer, topicIdsForTags } from "../../index.ts";
import { toBioLang, type BioLang } from "../../lang.ts";
import { api, ApiRequestError } from "../api/client.ts";
import { migrateSettings, type Persisted } from "./migrate.ts";

/**
 * Biology is a single-year course: class and level are not choices, they are what the trainer is.
 * Pinning them here (rather than offering a picker that has exactly one valid setting) also keeps
 * `topicsFor` happy — every biology topic is level "R", so a request on "P" would return none.
 */
export const GRADE = "lo3" as const;
export const LEVEL = "R" as const;

/** Pick tasks by dział, or by a theme that cuts across several of them (homeostaza, choroby, …). */
export type SelectionMode = "topics" | "tags";

export interface Settings {
  /** session language; only the languages biology has content in */
  lang: BioLang;
  mode: SelectionMode;
  topicIds: string[];
  tagIds: string[];
  count: number;
  answerMode: AnswerMode;
}

export interface AnswerRecord {
  answer: string;
  correct: boolean;
  usedHint: boolean;
}

type Status = "idle" | "loading" | "active" | "finished";

interface State {
  settings: Settings;
  status: Status;
  error: string | null;
  /** set when fewer tasks were served than requested (the pool ran dry for those topics) */
  partial: { got: number; count: number } | null;
  tasks: Task[];
  index: number;
  answers: Record<string, AnswerRecord>;
  hints: Record<string, boolean>;
  feedback: { status: "idle" | "loading" | "done" | "error"; data?: FeedbackResponse; error?: string };
  /** recently served task ids — sent to the server so pooled tasks don't repeat */
  seenTaskIds: string[];
  /** signed-in users: the session stored in history (answers and finish are synced in the background) */
  sessionId: string | null;

  setSettings: (patch: Partial<Settings>) => void;
  generate: (override?: Partial<Settings>) => Promise<void>;
  submitAnswer: (answer: string) => void;
  revealHint: () => void;
  next: () => void;
  quit: () => void;
  loadFeedback: () => Promise<void>;
}

// History sync runs in order (answers before finish) and never blocks or breaks the UI.
let syncQueue: Promise<void> = Promise.resolve();

function syncInBackground(what: string, request: () => Promise<unknown>) {
  syncQueue = syncQueue.then(request).then(
    () => undefined,
    (err: unknown) => console.warn(`[bio] history sync (${what}) failed`, err),
  );
}

/** resolves once all queued history requests have settled (used by tests) */
export const historySynced = () => syncQueue;

const browserLang = (): BioLang => toBioLang(navigator.language.slice(0, 2) as Lang);

export const useSession = create<State>()(
  persist(
    (set, get) => ({
      settings: { lang: browserLang(), mode: "topics", topicIds: [], tagIds: [], count: 10, answerMode: "mixed" },
      status: "idle",
      error: null,
      partial: null,
      tasks: [],
      index: 0,
      answers: {},
      hints: {},
      feedback: { status: "idle" },
      seenTaskIds: [],
      sessionId: null,

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      generate: async (override) => {
        const settings = { ...get().settings, ...override };
        set({ settings, status: "loading", error: null, partial: null, feedback: { status: "idle" }, sessionId: null });
        // a theme is expanded client-side into the topics that carry it: the server keeps receiving
        // an ordinary topic list, so its allow-list and verification are untouched
        const byTag = settings.mode === "tags" && settings.tagIds.length > 0;
        const topicIds = byTag ? topicIdsForTags(settings.tagIds) : settings.topicIds;
        try {
          const { tasks, sessionId } = await api.generate({
            lang: settings.lang,
            grade: GRADE,
            level: LEVEL,
            topicIds,
            ...(byTag ? { tagIds: settings.tagIds } : {}),
            count: settings.count,
            answerMode: settings.answerMode,
            excludeIds: get().seenTaskIds,
          });
          set({
            status: "active",
            sessionId: sessionId ?? null,
            tasks,
            index: 0,
            answers: {},
            hints: {},
            partial: tasks.length < settings.count ? { got: tasks.length, count: settings.count } : null,
            seenTaskIds: [...get().seenTaskIds, ...tasks.map((t) => t.id)].slice(-1000),
          });
        } catch (err) {
          set({ status: "idle", error: err instanceof ApiRequestError ? err.code : "generic" });
        }
      },

      submitAnswer: (answer) => {
        const { tasks, index, answers, hints, sessionId } = get();
        const task = tasks[index];
        if (!task || answers[task.id]) return;
        // instant client-side check; the server re-checks the synced answer for history
        const correct = checkAnswer(task, answer);
        const usedHint = !!hints[task.id];
        set({ answers: { ...answers, [task.id]: { answer, correct, usedHint } } });
        if (sessionId) syncInBackground("answer", () => api.answer(sessionId, { position: index, answer, usedHint }));
      },

      revealHint: () => {
        const task = get().tasks[get().index];
        if (task) set((s) => ({ hints: { ...s.hints, [task.id]: true } }));
      },

      next: () => {
        const { index, tasks, sessionId, status } = get();
        if (index + 1 >= tasks.length) {
          if (status === "active" && sessionId) syncInBackground("finish", () => api.finish(sessionId));
          set({ status: "finished" });
        } else set({ index: index + 1 });
      },

      quit: () => set({ status: "idle", tasks: [], answers: {}, hints: {}, index: 0, partial: null, sessionId: null }),

      loadFeedback: async () => {
        const { settings, feedback, sessionId } = get();
        if (feedback.status === "loading") return;
        set({ feedback: { status: "loading" } });
        try {
          const data = await api.feedback({
            lang: settings.lang,
            grade: GRADE,
            level: LEVEL,
            results: buildResults(get().tasks, get().answers),
            ...(sessionId ? { sessionId } : {}),
          });
          set({ feedback: { status: "done", data } });
        } catch (err) {
          set({ feedback: { status: "error", error: err instanceof ApiRequestError ? err.code : "generic" } });
        }
      },
    }),
    {
      name: "matema-bio-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ settings: s.settings, seenTaskIds: s.seenTaskIds }),
      version: 1,
      migrate: (persisted, version) => migrateSettings(persisted as Persisted, version),
    },
  ),
);

export function buildResults(tasks: Task[], answers: Record<string, AnswerRecord>): TaskResult[] {
  return tasks.map((t) => {
    const a = answers[t.id];
    const chosen = t.answerType === "choice" ? t.choices?.find((c) => c.label === a?.answer) : undefined;
    const correctChoice = t.choices?.find((c) => c.label === t.correctChoice);
    return {
      taskId: t.id,
      topicId: t.topicId,
      subtopic: t.subtopic,
      difficulty: t.difficulty,
      question: t.question,
      correct: a?.correct ?? false,
      userAnswer: chosen ? `${chosen.label}) ${chosen.text}` : (a?.answer ?? ""),
      correctAnswer: correctChoice ? `${correctChoice.label}) ${correctChoice.text}` : t.correctAnswer,
      usedHint: a?.usedHint ?? false,
      misconception: chosen?.misconception,
    };
  });
}
