import { LANGS, type Lang } from "@portal/core";
import { Card, Segmented } from "@portal/ui";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AccountMenu } from "./components/AccountMenu.tsx";
import { LoadErrorBoundary } from "./components/LoadErrorBoundary.tsx";
import { Loading, RequireAuth } from "./components/RequireAuth.tsx";
import { initialLang, saveLang } from "./i18n/index.ts";
import { CatalogPage } from "./pages/CatalogPage.tsx";
import { NotFound } from "./pages/NotFound.tsx";
import { TrainerRoute } from "./pages/TrainerRoute.tsx";

// account pages load on demand
const LoginPage = lazy(() => import("./pages/LoginPage.tsx").then((m) => ({ default: m.LoginPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage.tsx").then((m) => ({ default: m.PrivacyPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage.tsx").then((m) => ({ default: m.ProfilePage })));
const HistoryPage = lazy(() => import("./pages/HistoryPage.tsx").then((m) => ({ default: m.HistoryPage })));
const SessionPage = lazy(() => import("./pages/SessionPage.tsx").then((m) => ({ default: m.SessionPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage.tsx").then((m) => ({ default: m.DashboardPage })));

export function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [languageLocked, setLanguageLocked] = useState(false);

  // `t` changes after changeLanguage, so keep it out of this effect to avoid a render loop
  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    saveLang(lang);
  }, [lang, i18n]);

  useEffect(() => {
    document.title = t("name");
  }, [t]);

  const page = (element: ReactNode) => (
    <LoadErrorBoundary key={location.pathname} fallback={<Card className="text-rose-700">{t("errors.loadFailed")}</Card>}>
      <Suspense fallback={<Loading />}>{element}</Suspense>
    </LoadErrorBoundary>
  );
  const protectedPage = (element: ReactNode) => page(<RequireAuth>{element}</RequireAuth>);

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900 hover:text-indigo-700">
          <span className="mr-2">📚</span>
          {t("name")}
        </Link>
        <div className="flex items-center gap-2">
          {!languageLocked && (
            <Segmented value={lang} onChange={setLang} options={LANGS.map((l) => ({ value: l, label: l.toUpperCase() }))} />
          )}
          <AccountMenu />
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<CatalogPage lang={lang} />} />
          <Route path="/t/:trainerId/*" element={<TrainerRoute lang={lang} setLanguageLocked={setLanguageLocked} />} />
          <Route path="/login" element={page(<LoginPage lang={lang} />)} />
          <Route path="/privacy" element={page(<PrivacyPage />)} />
          <Route path="/profile" element={protectedPage(<ProfilePage lang={lang} setLang={setLang} />)} />
          <Route path="/history" element={protectedPage(<HistoryPage lang={lang} />)} />
          <Route path="/history/:sessionId" element={protectedPage(<SessionPage lang={lang} />)} />
          <Route path="/dashboard" element={protectedPage(<DashboardPage lang={lang} />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
