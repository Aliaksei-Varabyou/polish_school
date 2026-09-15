import {
  isLyceum,
  type AnswerMode,
  type FeedbackResponse,
  type Grade,
  type Lang,
  type Level,
  type Task,
  type TaskResult,
} from "@portal/core";
import { isAnswerCorrect } from "@portal/trainer-math";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api, ApiRequestError } from "../api/client.ts";

export interface Settings {
  lang: Lang;
  grade: Grade;
  level: Level;
  topicIds: string[];
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
  /** set when fewer tasks were generated than requested */
  partial: { got: number; count: number } | null;
  tasks: Task[];
  index: number;
  answers: Record<string, AnswerRecord>;
  hints: Record<string, boolean>;
  feedback: { status: "idle" | "loading" | "done" | "error"; data?: FeedbackResponse; error?: string };
  /** recently served task ids — sent to the server so pooled tasks don't repeat */
  seenTaskIds: string[];

  setSettings: (patch: Partial<Settings>) => void;
  generate: (override?: Partial<Settings>) => Promise<void>;
  submitAnswer: (answer: string) => void;
  revealHint: () => void;
  next: () => void;
  quit: () => void;
  loadFeedback: () => Promise<void>;
}

const browserLang = (): Lang => {
  const l = navigator.language.slice(0, 2);
  return l === "pl" || l === "en" || l === "ru" ? l : "pl";
};

export const useSession = create<State>()(
  persist(
    (set, get) => ({
      settings: { lang: browserLang(), grade: "sp7", level: "P", topicIds: [], count: 10, answerMode: "mixed" },
      status: "idle",
      error: null,
      partial: null,
      tasks: [],
      index: 0,
      answers: {},
      hints: {},
      feedback: { status: "idle" },
      seenTaskIds: [],

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      generate: async (override) => {
        const settings = { ...get().settings, ...override };
        set({ settings, status: "loading", error: null, partial: null, feedback: { status: "idle" } });
        try {
          const { tasks } = await api.generate({
            lang: settings.lang,
            grade: settings.grade,
            level: isLyceum(settings.grade) ? settings.level : undefined,
            topicIds: settings.topicIds,
            count: settings.count,
            answerMode: settings.answerMode,
            excludeIds: get().seenTaskIds,
          });
          set({
            status: "active",
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
        const { tasks, index, answers, hints } = get();
        const task = tasks[index];
        if (!task || answers[task.id]) return;
        const correct = isAnswerCorrect(answer, task.correctAnswer, task.answerType);
        set({ answers: { ...answers, [task.id]: { answer, correct, usedHint: !!hints[task.id] } } });
      },

      revealHint: () => {
        const task = get().tasks[get().index];
        if (task) set((s) => ({ hints: { ...s.hints, [task.id]: true } }));
      },

      next: () => {
        const { index, tasks } = get();
        if (index + 1 >= tasks.length) set({ status: "finished" });
        else set({ index: index + 1 });
      },

      quit: () => set({ status: "idle", tasks: [], answers: {}, hints: {}, index: 0, partial: null }),

      loadFeedback: async () => {
        const { settings, feedback } = get();
        if (feedback.status === "loading") return;
        set({ feedback: { status: "loading" } });
        try {
          const data = await api.feedback({
            lang: settings.lang,
            grade: settings.grade,
            level: isLyceum(settings.grade) ? settings.level : undefined,
            results: buildResults(get().tasks, get().answers),
          });
          set({ feedback: { status: "done", data } });
        } catch (err) {
          set({ feedback: { status: "error", error: err instanceof ApiRequestError ? err.code : "generic" } });
        }
      },
    }),
    {
      name: "matema-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ settings: s.settings, seenTaskIds: s.seenTaskIds }),
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
