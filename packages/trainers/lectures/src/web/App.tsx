import type { TrainerAppProps } from "@portal/trainer-sdk";
import { MORS_LABELS, MorsBuddy } from "@portal/ui";
import { useTranslation } from "react-i18next";
import { lecturesMorsLines } from "./mors.ts";
import { ResultsPage } from "./pages/ResultsPage.tsx";
import { QuizPage } from "./pages/QuizPage.tsx";
import { StartPage } from "./pages/StartPage.tsx";
import { useSession } from "./store/session.ts";

/** Lectures trainer screens; loaded lazily by the portal at /t/lectures. */
export default function LecturesTrainerApp({ lang }: TrainerAppProps) {
  const { t } = useTranslation("lectures");
  const status = useSession((s) => s.status);
  // Mors keeps company during a quiz; the results screen draws him inline instead
  const withMors = status === "active";

  return (
    <div className={withMors ? "pb-24 xl:pb-0" : undefined}>
      {withMors && <MorsBuddy lines={lecturesMorsLines(lang)} labels={MORS_LABELS[lang] ?? MORS_LABELS.pl} />}
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
