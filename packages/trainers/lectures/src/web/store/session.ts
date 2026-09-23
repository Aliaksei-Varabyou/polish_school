// The question bank is fixed, hand-authored content bundled with the trainer (not AI-generated), so
// unlike the math trainer this session runs fully client-side: no /generate round trip, no task pool.
// That also means lecture sessions aren't written to portal history yet — a follow-up once the shared
// generation pipeline (built for AI-generated, pooled tasks) grows a story for static content too.
import { Grade, type ChoiceLabel } from "@portal/core";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { booksForStage, DEFAULT_STAGE, getBook, isStageId, stageOf, type StageId } from "../../content/index.ts";
import type { LectureQuestion } from "../../content/types.ts";

// Questions are always in Polish regardless of the portal's interface language (see content/types.ts),
// so — unlike the math trainer — this session never needs to lock or track a generation language.
export interface Settings {
  stage: StageId;
  bookId: string | null;
  count: number;
}

export interface AnswerRecord {
  choice: ChoiceLabel;
  correct: boolean;
}

type Status = "idle" | "active" | "finished";

interface State {
  settings: Settings;
  status: Status;
  questions: LectureQuestion[];
  index: number;
  answers: Record<string, AnswerRecord>;

  setSettings: (patch: Partial<Settings>) => void;
  start: () => void;
  submitAnswer: (choice: ChoiceLabel) => void;
  next: () => void;
  quit: () => void;
}

const DEFAULT_SETTINGS: Settings = { stage: DEFAULT_STAGE, bookId: null, count: 10 };

const keepBook = (stage: StageId, bookId: unknown): string | null =>
  typeof bookId === "string" && booksForStage(stage).some((b) => b.id === bookId) ? bookId : null;

/** Stored state is untrusted: v0 kept a single `grade`, v1 keeps the school stage that grade belongs to. */
export function migrateSettings(persisted: unknown): { settings: Settings } {
  const old = (persisted as { settings?: Record<string, unknown> } | null)?.settings ?? {};
  const grade = Grade.safeParse(old.grade);
  const stage = isStageId(old.stage) ? old.stage : ((grade.success && stageOf(grade.data)) || DEFAULT_STAGE);
  const count = typeof old.count === "number" && old.count > 0 ? old.count : DEFAULT_SETTINGS.count;
  return { settings: { stage, bookId: keepBook(stage, old.bookId), count } };
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LABELS = ["A", "B", "C", "D"] as const;

/** Authored banks put the right answer first most of the time, so options are reshuffled per session. */
export function shuffleChoices(q: LectureQuestion): LectureQuestion {
  const order = shuffle(q.choices);
  const choices = order.map((c, i) => ({ label: LABELS[i], text: c.text })) as LectureQuestion["choices"];
  return { ...q, choices, correctChoice: LABELS[order.findIndex((c) => c.label === q.correctChoice)] };
}

export const useSession = create<State>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      status: "idle",
      questions: [],
      index: 0,
      answers: {},

      setSettings: (patch) =>
        set((s) => {
          const settings = { ...s.settings, ...patch };
          // switching stage may drop the previously selected book
          if (patch.stage) settings.bookId = keepBook(settings.stage, settings.bookId);
          return { settings };
        }),

      start: () => {
        const { bookId, count } = get().settings;
        const book = bookId ? getBook(bookId) : undefined;
        if (!book) return;
        set({
          status: "active",
          questions: shuffle(book.questions).slice(0, Math.min(count, book.questions.length)).map(shuffleChoices),
          index: 0,
          answers: {},
        });
      },

      submitAnswer: (choice) => {
        const { questions, index, answers } = get();
        const q = questions[index];
        if (!q || answers[q.id]) return;
        set({ answers: { ...answers, [q.id]: { choice, correct: choice === q.correctChoice } } });
      },

      next: () => {
        const { index, questions } = get();
        set(index + 1 >= questions.length ? { status: "finished" } : { index: index + 1 });
      },

      quit: () => set({ status: "idle", questions: [], answers: {}, index: 0 }),
    }),
    {
      name: "matema-lectures-settings",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ settings: s.settings }),
      migrate: (persisted) => migrateSettings(persisted),
    },
  ),
);
