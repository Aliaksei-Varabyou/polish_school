import type { AnswerMode, FeedbackResponse, Lang, Task, TaskResult } from "@portal/core";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { checkAnswer, isInGrade, levelFor, PARAGRAPH_TASKS, topicIdsForTags, type HistGrade } from "../../index.ts";
import { toHistLang, type HistLang } from "../../lang.ts";
import { api, ApiRequestError } from "../api/client.ts";
import { countRepeats, rememberSeen } from "./seen.ts";

/** Pick tasks by dział, or by a theme that cuts across several of them (homeostaza, choroby, …). */
export type SelectionMode = "topics" | "tags";

export interface Settings {
  /** the class, i.e. which textbook the tree shows; the level follows from it (see levelFor) */
  grade: HistGrade;
  /** session language; only the languages history has content in */
  lang: HistLang;
  mode: SelectionMode;
  /** paragraphs of every class: switching class keeps the other class's choice for when they return */
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
  /** tasks served again because the chosen paragraphs had nothing new left */
  repeated: number;
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
    (err: unknown) => console.warn(`[history] history sync (${what}) failed`, err),
  );
}

/** resolves once all queued history requests have settled (used by tests) */
export const historySynced = () => syncQueue;

const browserLang = (): HistLang => toHistLang(navigator.language.slice(0, 2) as Lang);

export const useSession = create<State>()(
  persist(
    (set, get) => ({
      settings: { grade: "sp6", lang: browserLang(), mode: "topics", topicIds: [], tagIds: [], count: 10, answerMode: "mixed" },
      status: "idle",
      error: null,
      partial: null,
      repeated: 0,
      tasks: [],
      index: 0,
      answers: {},
      hints: {},
      feedback: { status: "idle" },
      seenTaskIds: [],
      sessionId: null,

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      generate: async (override) => {
        const current = get().settings;
        const settings = { ...current, ...override };
        // a topic list passed in (the start button, "practise the weak ones") replaces the choice of
        // this class only; what the student picked for the other class stays for when they return
        if (override?.topicIds) {
          settings.topicIds = [...current.topicIds.filter((id) => !isInGrade(id, settings.grade)), ...override.topicIds];
        }
        set({ settings, status: "loading", error: null, partial: null, feedback: { status: "idle" }, sessionId: null });
        // a theme is expanded client-side into the topics that carry it: the server keeps receiving
        // an ordinary topic list, so its allow-list and verification are untouched
        const byTag = settings.mode === "tags" && settings.tagIds.length > 0;
        const topicIds = (byTag ? topicIdsForTags(settings.tagIds) : selectedParagraphs(settings)).filter((id) =>
          isInGrade(id, settings.grade),
        );
        try {
          const { tasks, sessionId } = await api.generate({
            lang: settings.lang,
            grade: settings.grade,
            level: levelFor(settings.grade),
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
            repeated: countRepeats(get().seenTaskIds, tasks.map((t) => t.id)),
            seenTaskIds: rememberSeen(get().seenTaskIds, tasks.map((t) => t.id)),
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
            grade: settings.grade,
            level: levelFor(settings.grade),
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
      name: "matema-history-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ settings: s.settings, seenTaskIds: s.seenTaskIds }),
      version: 1,
    },
  ),
);

/** The chosen paragraphs of the current class that have something to serve. */
export const selectedParagraphs = (settings: Settings): string[] =>
  settings.topicIds.filter((id) => isInGrade(id, settings.grade) && (PARAGRAPH_TASKS[id] ?? 0) > 0);

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
