import { Card } from "@portal/ui";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.tsx";

export function Loading() {
  const { t } = useTranslation();
  return <p className="animate-pulse text-slate-500">{t("loading")}</p>;
}

/** Shown when the portal runs without accounts (guest mode) or the server has them switched off. */
export function AccountsUnavailable() {
  const { t } = useTranslation();
  return (
    <Card className="text-center">
      <p className="text-lg font-semibold text-slate-800">{t("auth.unavailable.title")}</p>
      <p className="mt-1 text-sm text-slate-600">{t("auth.unavailable.text")}</p>
      <Link to="/" className="mt-4 inline-block font-medium text-indigo-600 hover:underline">
        ← {t("nav.home")}
      </Link>
    </Card>
  );
}

/** Protected page: signed-out users go to /login?next=…; without accounts show a short notice. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { enabled, loading, user } = useAuth();
  const location = useLocation();

  if (!enabled) return <AccountsUnavailable />;
  if (loading) return <Loading />;
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}
