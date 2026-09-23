import type { TrainerAppProps } from "@portal/trainer-sdk";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isBioLang } from "../lang.ts";
import { setTokenGetter } from "./api/client.ts";
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
  const setSettings = useSession((s) => s.setSettings);

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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          <span className="mr-2">🧬</span>
          {t("app.title")}
        </h1>
        {status === "idle" && <p className="mt-1 text-sm text-slate-500">{t("app.subtitle")}</p>}
      </div>
      {status === "idle" && <StartPage portalLang={lang} />}
      {status === "loading" && <LoadingScreen />}
      {status === "active" && <TrainerPage />}
      {status === "finished" && <ResultsPage />}
    </div>
  );
}
