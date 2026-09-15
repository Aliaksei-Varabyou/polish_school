import { getTopic } from "@portal/trainer-math";
import { Button, Card, ProgressBar } from "@portal/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnswerInput } from "../components/AnswerInput.tsx";
import { ChoiceOptions } from "../components/ChoiceOptions.tsx";
import { correctAnswerText } from "../components/format.ts";
import { MathText } from "../components/MathText.tsx";
import { useSession } from "../store/session.ts";

const DIFFICULTY_STYLE = {
  1: "bg-emerald-100 text-emerald-800",
  2: "bg-sky-100 text-sky-800",
  3: "bg-rose-100 text-rose-800",
} as const;

export function TrainerPage() {
  const { t } = useTranslation();
  const { tasks, index, answers, hints, partial, settings } = useSession();
  const { submitAnswer, revealHint, next, quit } = useSession.getState();
  const [solutionOpen, setSolutionOpen] = useState<string | null>(null);

  const task = tasks[index];
  if (!task) return null;
  const record = answers[task.id];
  const answered = !!record;
  const showSolution = solutionOpen === task.id || (answered && !record.correct && solutionOpen !== `hide:${task.id}`);
  const isLast = index + 1 >= tasks.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-600">{t("trainer.taskOf", { n: index + 1, total: tasks.length })}</div>
        <Button
          variant="ghost"
          className="px-3 py-1.5 text-sm"
          onClick={() => window.confirm(t("trainer.quitConfirm")) && quit()}
        >
          {t("trainer.quit")}
        </Button>
      </div>
      <ProgressBar value={index + (answered ? 1 : 0)} total={tasks.length} />

      {partial && index === 0 && !answered && (
        <div className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
          {t("errors.partial", partial)}
        </div>
      )}

      <Card key={task.id} className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2.5 py-1 font-medium ${DIFFICULTY_STYLE[task.difficulty]}`}>
            {t(`trainer.difficulty${task.difficulty}`)}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            {getTopic(task.topicId)?.name[settings.lang] ?? task.topicId}
          </span>
        </div>

        <MathText text={task.question} className="block text-lg leading-relaxed text-slate-900 sm:text-xl" />

        {task.hint && !answered && (
          <div>
            {hints[task.id] ? (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                💡 <MathText text={task.hint} />
              </div>
            ) : (
              <Button variant="ghost" className="px-3 py-1.5 text-sm text-amber-700" onClick={revealHint}>
                💡 {t("trainer.hint")}
              </Button>
            )}
          </div>
        )}

        {task.answerType === "choice" ? (
          <ChoiceOptions task={task} selected={record?.answer} onSelect={submitAnswer} />
        ) : (
          <AnswerInput key={task.id} type={task.answerType} disabled={answered} onSubmit={submitAnswer} />
        )}

        {answered && (
          <div
            className={`rounded-xl px-4 py-3 ring-1 ${
              record.correct ? "bg-emerald-50 text-emerald-900 ring-emerald-200" : "bg-rose-50 text-rose-900 ring-rose-200"
            }`}
          >
            <div className="font-semibold">{record.correct ? `✓ ${t("trainer.correct")}` : `✗ ${t("trainer.wrong")}`}</div>
            {!record.correct && (
              <div className="mt-1">
                {t("trainer.correctAnswer")} <MathText text={correctAnswerText(task, settings.lang)} className="font-semibold" />
              </div>
            )}
          </div>
        )}

        {answered && (
          <div>
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 hover:underline"
              onClick={() => setSolutionOpen(showSolution ? `hide:${task.id}` : task.id)}
            >
              {showSolution ? t("trainer.hideSolution") : t("trainer.showSolution")}
            </button>
            {showSolution && (
              <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-slate-700 ring-1 ring-slate-200">
                <MathText text={task.solution} />
              </div>
            )}
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
