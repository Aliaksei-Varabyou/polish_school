import { LANGS, type Lang } from "@portal/core";
import { Segmented } from "@portal/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Route, Routes } from "react-router-dom";
import { initialLang, saveLang } from "./i18n/index.ts";
import { CatalogPage } from "./pages/CatalogPage.tsx";
import { NotFound } from "./pages/NotFound.tsx";
import { TrainerRoute } from "./pages/TrainerRoute.tsx";

export function App() {
  const { t, i18n } = useTranslation();
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

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900 hover:text-indigo-700">
          <span className="mr-2">📚</span>
          {t("name")}
        </Link>
        {!languageLocked && (
          <Segmented value={lang} onChange={setLang} options={LANGS.map((l) => ({ value: l, label: l.toUpperCase() }))} />
        )}
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<CatalogPage lang={lang} />} />
          <Route path="/t/:trainerId/*" element={<TrainerRoute lang={lang} setLanguageLocked={setLanguageLocked} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
