import type { TrainerAppProps } from "@portal/trainer-sdk";
import { useEffect, useState } from "react";
import { MORS_LABELS, MorsBuddy } from "@portal/ui";
import { useTranslation } from "react-i18next";
import { isBioLang } from "../lang.ts";
import { setTokenGetter } from "./api/client.ts";
import { LessonPage } from "./lessons/LessonPage.tsx";
import { bioMorsLines } from "./mors.ts";
import { LoadingScreen } from "./pages/LoadingScreen.tsx";
import { ResultsPage } from "./pages/ResultsPage.tsx";
import { StartPage } from "./pages/StartPage.tsx";
import { TrainerPage } from "./pages/TrainerPage.tsx";
import { useSession } from "./store/session.ts";

/** Biology trainer screens; loaded lazily by the portal at /t/bio. */
export default function BioTrainerApp({ lang, setLanguageLocked, getAccessToken }: TrainerAppProps) {
  const { t } = useTranslation("bio");

  // API calls send the signed-in user's token (guests: none)
  useEffect(() => setTokenGetter(getAccessToken), [getAccessToken]);
  const status = useSession((s) => s.status);
  const storeLang = useSession((s) => s.settings.lang);
  const grade = useSession((s) => s.settings.grade);
  const setSettings = useSession((s) => s.setSettings);
  const generate = useSession((s) => s.generate);
  // the explanation open on top of the start page; kept out of the session store on purpose —
  // a lesson is not a test and leaves the session untouched until the student starts one
  const [lessonId, setLessonId] = useState<string | null>(null);
  const showLesson = status === "idle" && lessonId !== null;
  // Mors keeps company while the student learns: in a lesson and during a test. The results and
  // loading screens draw him inline instead, and the start page is left calm.
  const withMors = showLesson || status === "active";

  // Tasks follow the portal language — but only where biology has content. On English the store
  // keeps its own choice and the start page asks for one instead of requesting an empty session.
  useEffect(() => {
    if (isBioLang(lang) && storeLang !== lang) setSettings({ lang });
  }, [lang, storeLang, setSettings]);

  // changing the language mid-session would mix languages
  useEffect(() => {
    setLanguageLocked(status !== "idle");
    return () => setLanguageLocked(false);
  }, [status, setLanguageLocked]);

  return (
    <div className={withMors ? "pb-24 xl:pb-0" : undefined}>
      {withMors && <MorsBuddy lines={bioMorsLines(storeLang)} labels={MORS_LABELS[storeLang]} />}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          <span className="mr-2">🧬</span>
          {t("app.title")}
        </h1>
        {status === "idle" && !showLesson && <p className="mt-1 text-sm text-slate-500">{t(`app.subtitle_${grade}`)}</p>}
      </div>
      {showLesson && (
        <LessonPage
          paragraphId={lessonId}
          lang={storeLang}
          onClose={() => setLessonId(null)}
          onPractice={() => {
            setLessonId(null);
            void generate({ mode: "topics", topicIds: [lessonId] });
          }}
        />
      )}
      {status === "idle" && !showLesson && <StartPage portalLang={lang} onOpenLesson={setLessonId} />}
      {status === "loading" && <LoadingScreen />}
      {status === "active" && <TrainerPage />}
      {status === "finished" && <ResultsPage />}
    </div>
  );
}
