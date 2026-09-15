import type { Lang, Profile, SessionSummary } from "@portal/core";
import { Button, Card } from "@portal/ui";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { apiFetch, ApiError } from "../api.ts";
import { ConsentBanner } from "../components/ConsentBanner.tsx";
import { LoadError } from "../components/LoadError.tsx";
import { Loading } from "../components/RequireAuth.tsx";
import { SessionRow } from "../components/SessionRow.tsx";

const PAGE_SIZE = 20;

export function HistoryPage({ lang }: { lang: Lang }) {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((before?: string) => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (before) params.set("before", before);
    return apiFetch<{ sessions: SessionSummary[] }>(`/api/me/sessions?${params}`);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([load(), apiFetch<Profile>("/api/me/profile")]).then(
      ([page, p]) => {
        if (cancelled) return;
        setSessions(page.sessions);
        setHasMore(page.sessions.length === PAGE_SIZE);
        setProfile(p);
      },
      (err) => !cancelled && setError(err instanceof ApiError ? err.code : "generic"),
    );
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (error) return <LoadError code={error} />;
  if (!sessions) return <Loading />;

  const loadMore = () => {
    const last = sessions.at(-1);
    if (!last) return;
    setLoadingMore(true);
    load(last.startedAt).then(
      (page) => {
        setSessions((prev) => [...(prev ?? []), ...page.sessions]);
        setHasMore(page.sessions.length === PAGE_SIZE);
        setLoadingMore(false);
      },
      () => setLoadingMore(false),
    );
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("history.title")}</h1>
      {profile && <ConsentBanner profile={profile} />}

      {sessions.length === 0 ? (
        <Card className="text-center">
          <p className="text-slate-600">{t("history.empty")}</p>
          <Link to="/" className="mt-3 inline-block font-medium text-indigo-600 hover:underline">
            {t("catalog.title")} →
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} lang={lang} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center">
          <Button variant="secondary" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? t("loading") : t("history.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
