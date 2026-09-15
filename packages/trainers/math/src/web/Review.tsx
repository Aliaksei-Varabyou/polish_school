import "katex/dist/katex.min.css";
import type { TrainerReviewProps } from "@portal/trainer-sdk";
import { useTranslation } from "react-i18next";
import { getTopic } from "../index.ts";
import { correctAnswerText, prettyAnswer } from "./components/format.ts";
import { MathText } from "./components/MathText.tsx";

/** Read-only review of a past math session (portal history page). */
export default function MathReview({ lang, tasks }: TrainerReviewProps) {
  const { t } = useTranslation("math");

  return (
    <ol className="space-y-4">
      {tasks.map((record) => {
        const task = record.task;
        const chosen = task.answerType === "choice" ? task.choices?.find((c) => c.label === record.userAnswer) : undefined;
        const userText =
          record.userAnswer == null
            ? t("results.noAnswer")
            : chosen
              ? `${chosen.label}) ${chosen.text}`
              : prettyAnswer(record.userAnswer, lang);

        return (
          <li
            key={record.position}
            className={`rounded-xl p-4 ring-1 ${record.correct ? "bg-emerald-50/60 ring-emerald-200" : "bg-rose-50/60 ring-rose-200"}`}
          >
            <div className="mb-1 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span>{getTopic(task.topicId)?.name[lang] ?? task.topicId}</span>
              <span aria-hidden>{record.correct ? "✓" : record.userAnswer == null ? "—" : "✗"}</span>
            </div>
            <MathText text={task.question} className="block text-slate-900" />
            <div className="mt-3 grid gap-1 text-sm">
              <div className={record.correct ? "text-emerald-700" : "text-rose-700"}>
                {t("results.yourAnswer")} <MathText text={userText} />
                {record.usedHint && <span className="ml-2 text-xs text-amber-700">({t("results.hintUsed")})</span>}
              </div>
              {!record.correct && (
                <div className="text-emerald-700">
                  {t("trainer.correctAnswer")} <MathText text={correctAnswerText(task, lang)} className="font-semibold" />
                </div>
              )}
            </div>
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer font-medium text-indigo-600">{t("trainer.showSolution")}</summary>
              <div className="mt-2 text-slate-700">
                <MathText text={task.solution} />
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
