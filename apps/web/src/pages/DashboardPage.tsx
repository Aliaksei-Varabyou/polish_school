import type { Lang, Profile, ProgressResponse, SessionSummary } from "@portal/core";
import { Card } from "@portal/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { apiFetch, ApiError } from "../api.ts";
import { ConsentBanner } from "../components/ConsentBanner.tsx";
import { LoadError } from "../components/LoadError.tsx";
import { Loading } from "../components/RequireAuth.tsx";
import { SessionRow, TopicBar, trainerMeta } from "../components/SessionRow.tsx";
import { percent } from "../lib/account.ts";

const TOP_N = 5;

export function DashboardPage({ lang }: { lang: Lang }) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch<ProgressResponse>("/api/me/progress"),
      apiFetch<{ sessions: SessionSummary[] }>("/api/me/sessions?limit=5"),
      apiFetch<Profile>("/api/me/profile"),
    ]).then(
      ([p, s, prof]) => {
        if (cancelled) return;
        setProgress(p);
        setSessions(s.sessions);
        setProfile(prof);
      },
      (err) => !cancelled && setError(err instanceof ApiError ? err.code : "generic"),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <LoadError code={error} />;
  if (!progress || !sessions || !profile) return <Loading />;

  if (progress.sessions === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.title")}</h1>
        <ConsentBanner profile={profile} />
        <Card className="text-center">
          <p className="text-slate-600">{t("dashboard.empty")}</p>
          <Link to="/" className="mt-3 inline-block font-medium text-indigo-600 hover:underline">
            {t("catalog.title")} →
          </Link>
        </Card>
      </div>
    );
  }

  const pct = percent(progress.correct, progress.tasksAnswered);
  const weakest = progress.topics.slice(0, TOP_N);
  const strongest = [...progress.topics].reverse().slice(0, TOP_N);

  const topicLabel = (t: ProgressResponse["topics"][number]) => {
    const meta = trainerMeta(t.trainerId, lang);
    return { name: meta.topicName(t.topicId), icon: meta.icon };
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.title")}</h1>
      <ConsentBanner profile={profile} />

      <Card>
        <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">{progress.sessions}</div>
            <div className="text-xs text-slate-500">{t("dashboard.sessions")}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{progress.tasksAnswered}</div>
            <div className="text-xs text-slate-500">{t("dashboard.tasksAnswered")}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{pct}%</div>
            <div className="text-xs text-slate-500">{t("dashboard.correctPct")}</div>
          </div>
        </div>
      </Card>

      {weakest.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">{t("dashboard.weakTopics")}</h2>
          <ul className="space-y-3">
            {weakest.map((topic) => {
              const { name, icon } = topicLabel(topic);
              return <TopicBar key={`${topic.trainerId}:${topic.topicId}`} name={name} correct={topic.correct} attempts={topic.attempts} icon={icon} />;
            })}
          </ul>
        </Card>
      )}

      {strongest.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">{t("dashboard.strongTopics")}</h2>
          <ul className="space-y-3">
            {strongest.map((topic) => {
              const { name, icon } = topicLabel(topic);
              return <TopicBar key={`${topic.trainerId}:${topic.topicId}`} name={name} correct={topic.correct} attempts={topic.attempts} icon={icon} />;
            })}
          </ul>
        </Card>
      )}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">{t("dashboard.recentSessions")}</h2>
          <Link to="/history" className="text-sm font-medium text-indigo-600 hover:underline">
            {t("history.title")} →
          </Link>
        </div>
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} lang={lang} />
          ))}
        </div>
      </Card>

      <div className="text-center">
        <Link to="/" className="font-medium text-indigo-600 hover:underline">
          {t("catalog.title")} →
        </Link>
      </div>
    </div>
  );
}
