import type { ChoiceLabel } from "@portal/core";
import { Button, Card, ProgressBar } from "@portal/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChoiceOptions } from "../components/ChoiceOptions.tsx";
import { useSession } from "../store/session.ts";

const DIFFICULTY_STYLE = {
  1: "bg-emerald-100 text-emerald-800",
  2: "bg-sky-100 text-sky-800",
  3: "bg-rose-100 text-rose-800",
} as const;

export function QuizPage() {
  const { t } = useTranslation("lectures");
  const { questions, index, answers } = useSession();
  const { submitAnswer, next, quit } = useSession.getState();
  const [solutionOpen, setSolutionOpen] = useState<string | null>(null);

  const question = questions[index];
  if (!question) return null;
  const record = answers[question.id];
  const answered = !!record;
  const showSolution = solutionOpen === question.id || (answered && !record.correct && solutionOpen !== `hide:${question.id}`);
  const isLast = index + 1 >= questions.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-600">{t("trainer.taskOf", { n: index + 1, total: questions.length })}</div>
        <Button variant="ghost" className="px-3 py-1.5 text-sm" onClick={() => window.confirm(t("trainer.quitConfirm")) && quit()}>
          {t("trainer.quit")}
        </Button>
      </div>
      <ProgressBar value={index + (answered ? 1 : 0)} total={questions.length} />

      <Card key={question.id} className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2.5 py-1 font-medium ${DIFFICULTY_STYLE[question.difficulty]}`}>
            {t(`trainer.difficulty${question.difficulty}`)}
          </span>
          {question.chapter && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{question.chapter}</span>}
        </div>

        <span className="block text-lg leading-relaxed text-slate-900 sm:text-xl">{question.question}</span>

        <ChoiceOptions question={question} selected={record?.choice} onSelect={(choice: ChoiceLabel) => submitAnswer(choice)} />

        {answered && (
          <div
            className={`rounded-xl px-4 py-3 ring-1 ${
              record.correct ? "bg-emerald-50 text-emerald-900 ring-emerald-200" : "bg-rose-50 text-rose-900 ring-rose-200"
            }`}
          >
            <div className="font-semibold">{record.correct ? `✓ ${t("trainer.correct")}` : `✗ ${t("trainer.wrong")}`}</div>
          </div>
        )}

        {answered && (
          <div>
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 hover:underline"
              onClick={() => setSolutionOpen(showSolution ? `hide:${question.id}` : question.id)}
            >
              {showSolution ? t("trainer.hideSolution") : t("trainer.showSolution")}
            </button>
            {showSolution && <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-slate-700 ring-1 ring-slate-200">{question.explanation}</div>}
          </div>
        )}

        {answered && (
          <div className="flex justify-end">
            <Button autoFocus onClick={next} className="w-full sm:w-auto">
              {isLast ? t("trainer.finish") : t("trainer.next")} →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
