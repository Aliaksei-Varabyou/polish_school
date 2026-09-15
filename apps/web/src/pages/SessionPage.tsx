import type { Lang, SessionDetail } from "@portal/core";
import type { TrainerReviewProps } from "@portal/trainer-sdk";
import { Card } from "@portal/ui";
import { lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { apiFetch, ApiError } from "../api.ts";
import { LoadError } from "../components/LoadError.tsx";
import { LoadErrorBoundary } from "../components/LoadErrorBoundary.tsx";
import { Loading } from "../components/RequireAuth.tsx";
import { formatDateTime, percent, splitGrade } from "../lib/account.ts";
import { gradeLabel, scoreColor, trainerMeta, UnfinishedBadge } from "../components/SessionRow.tsx";
import { getTrainer } from "../trainers.ts";

// one lazy review component per trainer, created once
const reviews = new Map<string, ComponentType<TrainerReviewProps>>();
function reviewFor(trainerId: string): ComponentType<TrainerReviewProps> | undefined {
  if (!reviews.has(trainerId)) {
    const trainer = getTrainer(trainerId);
    if (!trainer) return undefined;
    reviews.set(trainerId, lazy(trainer.loadReview));
  }
  return reviews.get(trainerId);
}

export function SessionPage({ lang }: { lang: Lang }) {
  const { t } = useTranslation();
  const { sessionId = "" } = useParams();
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setError(null);
    apiFetch<SessionDetail>(`/api/me/sessions/${sessionId}`).then(
      (d) => !cancelled && setDetail(d),
      (err) => !cancelled && setError(err instanceof ApiError ? err.code : "generic"),
    );
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (error) return <LoadError code={error} />;
  if (!detail) return <Loading />;

  const meta = trainerMeta(detail.trainerId, lang);
  const Review = reviewFor(detail.trainerId);
  const pct = percent(detail.correct, detail.total);
  splitGrade(detail.settings.grade); // validates the grade shape early (throws on garbled data)

  return (
    <div className="space-y-5">
      <Link to="/history" className="text-sm font-medium text-indigo-600 hover:underline">
        ← {t("history.title")}
      </Link>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {meta.icon}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-lg font-semibold text-slate-900">{meta.name}</span>
              {!detail.finishedAt && <UnfinishedBadge />}
            </div>
            <div className="text-sm text-slate-500">
              {formatDateTime(detail.startedAt, lang)} · {gradeLabel(t, detail.settings)}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${scoreColor(pct)}`}>
              {detail.correct}/{detail.total}
            </div>
            <div className="text-xs text-slate-500">{t("history.answered", { answered: detail.answered, total: detail.total })}</div>
          </div>
        </div>
      </Card>

      {detail.feedback && (
        <Card className="space-y-4">
          <p className="leading-relaxed text-slate-800">{detail.feedback.summary}</p>
          {detail.feedback.weakTopics.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold text-slate-800">{t("results.weakTopics")}</h3>
              <ul className="space-y-2">
                {detail.feedback.weakTopics.map((w) => (
                  <li key={w.topicId} className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm ring-1 ring-rose-100">
                    <div className="font-medium text-rose-900">{meta.topicName(w.topicId)}</div>
                    <div className="text-rose-800">{w.reason}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {detail.feedback.recommendations.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold text-slate-800">{t("results.recommendations")}</h3>
              <ul className="list-disc space-y-1 pl-5 text-slate-700">
                {detail.feedback.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <Card>
        {Review ? (
          <LoadErrorBoundary fallback={<p className="text-rose-700">{t("errors.loadFailed")}</p>}>
            <Suspense fallback={<Loading />}>
              <Review lang={lang} tasks={detail.tasks} />
            </Suspense>
          </LoadErrorBoundary>
        ) : (
          <p className="text-slate-500">{t("errors.trainerNotFound")}</p>
        )}
      </Card>
    </div>
  );
}
