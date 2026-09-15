import { LANGS } from "@matema/shared";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Segmented } from "./components/ui.tsx";
import { LoadingScreen } from "./pages/LoadingScreen.tsx";
import { ResultsPage } from "./pages/ResultsPage.tsx";
import { StartPage } from "./pages/StartPage.tsx";
import { TrainerPage } from "./pages/TrainerPage.tsx";
import { useSession } from "./store/session.ts";

export function App() {
  const { t, i18n } = useTranslation();
  const status = useSession((s) => s.status);
  const lang = useSession((s) => s.settings.lang);
  const setSettings = useSession((s) => s.setSettings);

  // `t` changes after changeLanguage, so keep it out of this effect to avoid a render loop
  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  useEffect(() => {
    document.title = t("app.title");
  }, [t]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            <span className="mr-2">➗</span>
            {t("app.title")}
          </h1>
          {status === "idle" && <p className="mt-1 text-sm text-slate-500">{t("app.subtitle")}</p>}
        </div>
        {status === "idle" && (
          <Segmented
            value={lang}
            onChange={(l) => setSettings({ lang: l })}
            options={LANGS.map((l) => ({ value: l, label: l.toUpperCase() }))}
          />
        )}
      </header>
      <main className="flex-1">
        {status === "idle" && <StartPage />}
        {status === "loading" && <LoadingScreen />}
        {status === "active" && <TrainerPage />}
        {status === "finished" && <ResultsPage />}
      </main>
    </div>
  );
}
