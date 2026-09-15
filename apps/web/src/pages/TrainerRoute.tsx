import type { Lang } from "@portal/core";
import type { TrainerAppProps } from "@portal/trainer-sdk";
import { Card } from "@portal/ui";
import { Component, lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { trainers } from "../trainers.ts";
import { NotFound } from "./NotFound.tsx";

// one lazy component per trainer, created once so it isn't reloaded on every render
const apps = new Map<string, ComponentType<TrainerAppProps>>(trainers.map((tr) => [tr.id, lazy(tr.load)]));

class LoadErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function TrainerRoute({ lang, setLanguageLocked }: { lang: Lang; setLanguageLocked: (locked: boolean) => void }) {
  const { t } = useTranslation();
  const { trainerId = "" } = useParams();
  const TrainerApp = apps.get(trainerId);

  if (!TrainerApp) return <NotFound message={t("errors.trainerNotFound")} />;

  return (
    <LoadErrorBoundary fallback={<Card className="text-rose-700">{t("errors.loadFailed")}</Card>}>
      <Suspense fallback={<p className="animate-pulse text-slate-500">{t("loading")}</p>}>
        <TrainerApp lang={lang} setLanguageLocked={setLanguageLocked} />
      </Suspense>
    </LoadErrorBoundary>
  );
}
