import type { Lang } from "@portal/core";
import { Button, Card, MorsVerdict } from "@portal/ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MORS_RESULTS } from "../mors.ts";
import { useSession } from "../store/session.ts";

export function ResultsPage() {
  const { t, i18n } = useTranslation("lectures");
  const lang = i18n.language as Lang;
  const { questions, answers } = useSession();
  const { start, quit } = useSession.getState();

  const correct = questions.filter((q) => answers[q.id]?.correct).length;
  const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const message = pct >= 90 ? "great" : pct >= 70 ? "good" : pct >= 50 ? "ok" : "low";

  const byChapter = useMemo(() => {
    const map = new Map<string, { ok: number; total: number }>();
    for (const q of questions) {
      const key = q.chapter ?? t("results.noChapter");
      const s = map.get(key) ?? { ok: 0, total: 0 };
      s.total++;
      if (answers[q.id]?.correct) s.ok++;
      map.set(key, s);
    }
    return [...map];
  }, [questions, answers, t]);

  const mistakes = questions.filter((q) => !answers[q.id]?.correct);

  return (
    <div className="space-y-5">
      <Card className="text-center">
        <MorsVerdict lang={lang} band={message} say={(MORS_RESULTS[lang] ?? MORS_RESULTS.pl)[message]} />
        <div className="text-sm font-medium uppercase tracking-wide text-slate-500">{t("results.title")}</div>
        <div className={`mt-2 text-5xl font-bold ${pct >= 70 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600"}`}>
          {pct}%
        </div>
        <div className="mt-1 text-slate-600">{t("results.score", { correct, total: questions.length })}</div>
        <p className="mt-3 text-lg text-slate-800">{t(`results.${message}`)}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={start}>↻ {t("results.again")}</Button>
          <Button variant="secondary" onClick={quit}>
            {t("results.change")}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">{t("results.byChapter")}</h2>
        <ul className="space-y-3">
          {byChapter.map(([chapter, s]) => {
            const p = Math.round((s.ok / s.total) * 100);
            return (
              <li key={chapter}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="text-slate-700">{chapter}</span>
                  <span className="shrink-0 font-medium text-slate-600">
                    {s.ok}/{s.total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${p >= 70 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${Math.max(p, 3)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">{t("results.mistakes")}</h2>
        {mistakes.length === 0 ? (
          <p className="text-slate-600">{t("results.noMistakes")}</p>
        ) : (
          <ol className="space-y-4">
            {mistakes.map((q) => {
              const a = answers[q.id];
              const chosen = q.choices.find((c) => c.label === a?.choice);
              const correctChoice = q.choices.find((c) => c.label === q.correctChoice)!;
              return (
                <li key={q.id} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  {q.chapter && <div className="mb-1 text-xs text-slate-500">{q.chapter}</div>}
                  <span className="block text-slate-900">{q.question}</span>
                  <div className="mt-3 grid gap-1 text-sm">
                    <div className="text-rose-700">
                      {t("results.yourAnswer")} {chosen ? `${chosen.label}) ${chosen.text}` : t("results.noAnswer")}
                    </div>
                    <div className="text-emerald-700">
                      {t("trainer.correctAnswer")} <span className="font-semibold">{`${correctChoice.label}) ${correctChoice.text}`}</span>
                    </div>
                  </div>
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer font-medium text-indigo-600">{t("trainer.showSolution")}</summary>
                    <div className="mt-2 text-slate-700">{q.explanation}</div>
                  </details>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}
