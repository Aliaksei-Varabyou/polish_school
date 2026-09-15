import type { Lang } from "@portal/core";
import type { TrainerAppProps } from "@portal/trainer-sdk";
import { Card } from "@portal/ui";
import { lazy, Suspense, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.tsx";
import { LoadErrorBoundary } from "../components/LoadErrorBoundary.tsx";
import { trainers } from "../trainers.ts";
import { NotFound } from "./NotFound.tsx";

// one lazy component per trainer, created once so it isn't reloaded on every render
const apps = new Map<string, ComponentType<TrainerAppProps>>(trainers.map((tr) => [tr.id, lazy(tr.load)]));

export function TrainerRoute({ lang, setLanguageLocked }: { lang: Lang; setLanguageLocked: (locked: boolean) => void }) {
  const { t } = useTranslation();
  const { getAccessToken } = useAuth();
  const { trainerId = "" } = useParams();
  const TrainerApp = apps.get(trainerId);

  if (!TrainerApp) return <NotFound message={t("errors.trainerNotFound")} />;

  return (
    <LoadErrorBoundary fallback={<Card className="text-rose-700">{t("errors.loadFailed")}</Card>}>
      <Suspense fallback={<p className="animate-pulse text-slate-500">{t("loading")}</p>}>
        <TrainerApp lang={lang} setLanguageLocked={setLanguageLocked} getAccessToken={getAccessToken} />
      </Suspense>
    </LoadErrorBoundary>
  );
}
