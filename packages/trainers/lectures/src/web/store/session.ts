// The question bank is fixed, hand-authored content bundled with the trainer (not AI-generated), so
// unlike the math trainer this session runs fully client-side: no /generate round trip, no task pool.
// That also means lecture sessions aren't written to portal history yet — a follow-up once the shared
// generation pipeline (built for AI-generated, pooled tasks) grows a story for static content too.
import type { ChoiceLabel, Grade } from "@portal/core";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { booksFor, getBook } from "../../content/index.ts";
import type { LectureQuestion } from "../../content/types.ts";

// Questions are always in Polish regardless of the portal's interface language (see content/types.ts),
// so — unlike the math trainer — this session never needs to lock or track a generation language.
export interface Settings {
  grade: Grade;
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useSession = create<State>()(
  persist(
    (set, get) => ({
      settings: { grade: "sp6", bookId: null, count: 10 },
      status: "idle",
      questions: [],
      index: 0,
      answers: {},

      setSettings: (patch) =>
        set((s) => {
          const settings = { ...s.settings, ...patch };
          // switching grade may drop the previously selected book
          if (patch.grade && !booksFor(settings.grade).some((b) => b.id === settings.bookId)) settings.bookId = null;
          return { settings };
        }),

      start: () => {
        const { bookId, count } = get().settings;
        const book = bookId ? getBook(bookId) : undefined;
        if (!book) return;
        set({
          status: "active",
          questions: shuffle(book.questions).slice(0, Math.min(count, book.questions.length)),
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
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ settings: s.settings }),
    },
  ),
);
