import type { Lang } from "@portal/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { trainers } from "../trainers.ts";

export function CatalogPage({ lang }: { lang: Lang }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("catalog.title")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("tagline")}</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {trainers.map((trainer) => (
          <li key={trainer.id}>
            <Link
              to={`/t/${trainer.id}`}
              className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-indigo-400 focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <span className="text-3xl" aria-hidden>
                {trainer.icon}
              </span>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{trainer.name[lang]}</h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{trainer.description[lang]}</p>
              <span className="mt-4 text-sm font-medium text-indigo-600">{t("catalog.open")} →</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm text-slate-500">{t("catalog.soon")}</p>
    </div>
  );
}
