import type { TrainerReviewProps } from "@portal/trainer-sdk";
import { useTranslation } from "react-i18next";

/**
 * Read-only review of a past lectures session (portal history page). Unreachable for now — lecture
 * sessions aren't written to history yet (see web/store/session.ts) — but implemented against the
 * same TrainerReviewProps contract every trainer uses, ready for when they are.
 */
export default function LecturesReview({ tasks }: TrainerReviewProps) {
  const { t } = useTranslation("lectures");

  return (
    <ol className="space-y-4">
      {tasks.map((record) => {
        const task = record.task;
        const chosen = task.choices?.find((c) => c.label === record.userAnswer);
        const correctChoice = task.choices?.find((c) => c.label === task.correctChoice);

        return (
          <li
            key={record.position}
            className={`rounded-xl p-4 ring-1 ${record.correct ? "bg-emerald-50/60 ring-emerald-200" : "bg-rose-50/60 ring-rose-200"}`}
          >
            <div className="mb-1 flex items-center justify-end text-xs text-slate-500">
              <span aria-hidden>{record.correct ? "✓" : record.userAnswer == null ? "—" : "✗"}</span>
            </div>
            <span className="block text-slate-900">{task.question}</span>
            <div className="mt-3 grid gap-1 text-sm">
              <div className={record.correct ? "text-emerald-700" : "text-rose-700"}>
                {t("results.yourAnswer")} {chosen ? `${chosen.label}) ${chosen.text}` : t("results.noAnswer")}
              </div>
              {!record.correct && correctChoice && (
                <div className="text-emerald-700">
                  {t("trainer.correctAnswer")} <span className="font-semibold">{`${correctChoice.label}) ${correctChoice.text}`}</span>
                </div>
              )}
            </div>
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer font-medium text-indigo-600">{t("trainer.showSolution")}</summary>
              <div className="mt-2 text-slate-700">{task.solution}</div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
