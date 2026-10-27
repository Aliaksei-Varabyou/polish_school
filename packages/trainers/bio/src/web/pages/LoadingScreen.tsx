import { Card, MorsRun } from "@portal/ui";
import { useTranslation } from "react-i18next";
import { MORS_LOADING } from "../mors.ts";
import { useSession } from "../store/session.ts";

export function LoadingScreen() {
  const { t } = useTranslation("bio");
  const lang = useSession((s) => s.settings.lang);

  return (
    <Card className="flex flex-col items-center py-14 text-center">
      <MorsRun size={220} className="mb-4 h-auto w-[180px] sm:w-[220px]" title={MORS_LOADING[lang]} />
      <h2 className="text-xl font-semibold text-slate-800">{t("loading.title")}</h2>
      <p className="mt-2 text-sm text-slate-500">{t("loading.hint")}</p>
    </Card>
  );
}
