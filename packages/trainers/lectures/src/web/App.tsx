import type { TrainerAppProps } from "@portal/trainer-sdk";
import { useTranslation } from "react-i18next";
import { ResultsPage } from "./pages/ResultsPage.tsx";
import { QuizPage } from "./pages/QuizPage.tsx";
import { StartPage } from "./pages/StartPage.tsx";
import { useSession } from "./store/session.ts";

/** Lectures trainer screens; loaded lazily by the portal at /t/lectures. */
export default function LecturesTrainerApp(_props: TrainerAppProps) {
  const { t } = useTranslation("lectures");
  const status = useSession((s) => s.status);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          <span className="mr-2">📖</span>
          {t("app.title")}
        </h1>
        {status === "idle" && <p className="mt-1 text-sm text-slate-500">{t("app.subtitle")}</p>}
      </div>
      {status === "idle" && <StartPage />}
      {status === "active" && <QuizPage />}
      {status === "finished" && <ResultsPage />}
    </div>
  );
}
