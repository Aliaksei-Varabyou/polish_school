import { Button, Card } from "@portal/ui";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.tsx";
import { AccountsUnavailable } from "./RequireAuth.tsx";

/** Error state for account pages (history, profile, dashboard). */
export function LoadError({ code, onRetry }: { code: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (code === "AUTH_DISABLED") return <AccountsUnavailable />;

  if (code === "UNAUTHORIZED") {
    const again = () =>
      void signOut().then(() => navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`));
    return (
      <Card className="text-center">
        <p className="text-slate-800">{t("errors.api.UNAUTHORIZED")}</p>
        <Button className="mt-4" onClick={again}>
          {t("errors.signInAgain")}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="text-center">
      <p role="alert" className="text-rose-700">
        {t(`errors.api.${code}`, { defaultValue: t("errors.api.generic") })}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          {t("errors.retry")}
        </Button>
      )}
    </Card>
  );
}
