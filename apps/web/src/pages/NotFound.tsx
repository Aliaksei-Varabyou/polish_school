import { Card } from "@portal/ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function NotFound({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <Card className="text-center">
      <p className="text-lg text-slate-800">{message ?? t("errors.notFound")}</p>
      <Link to="/" className="mt-4 inline-block font-medium text-indigo-600 hover:underline">
        ← {t("nav.home")}
      </Link>
    </Card>
  );
}
