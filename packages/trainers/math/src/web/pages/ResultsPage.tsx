import { getTopic } from "../../index.ts";
import { Button, Card } from "@portal/ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { correctAnswerText, prettyAnswer } from "../components/format.ts";
import { MathText } from "../components/MathText.tsx";
import { useSession } from "../store/session.ts";

export function ResultsPage() {
  const { t } = useTranslation("math");
  const { tasks, answers, settings, feedback } = useSession();
  const { generate, quit, loadFeedback } = useSession.getState();
  const lang = settings.lang;

  const correct = tasks.filter((task) => answers[task.id]?.correct).length;
  const pct = tasks.length ? Math.round((correct / tasks.length) * 100) : 0;
  const message = pct >= 90 ? "great" : pct >= 70 ? "good" : pct >= 50 ? "ok" : "low";

  const byTopic = useMemo(() => {
    const map = new Map<string, { ok: number; total: number }>();
    for (const task of tasks) {
      const s = map.get(task.topicId) ?? { ok: 0, total: 0 };
      s.total++;
      if (answers[task.id]?.correct) s.ok++;
      map.set(task.topicId, s);
    }
    return [...map].sort(([, a], [, b]) => a.ok / a.total - b.ok / b.total);
  }, [tasks, answers]);

  const mistakes = tasks.filter((task) => !answers[task.id]?.correct);
  const topicName = (id: string) => getTopic(id)?.name[lang] ?? id;

  const userAnswerText = (taskId: string) => {
    const task = tasks.find((x) => x.id === taskId)!;
    const a = answers[taskId];
    if (!a) return t("results.noAnswer");
    if (task.answerType === "choice") {
      const c = task.choices?.find((ch) => ch.label === a.answer);
      return c ? `${c.label}) ${c.text}` : a.answer;
    }
    return prettyAnswer(a.answer, lang);
  };

  return (
    <div className="space-y-5">
      <Card className="text-center">
        <div className="text-sm font-medium uppercase tracking-wide text-slate-500">{t("results.title")}</div>
        <div className={`mt-2 text-5xl font-bold ${pct >= 70 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600"}`}>
          {pct}%
        </div>
        <div className="mt-1 text-slate-600">{t("results.score", { correct, total: tasks.length })}</div>
        <p className="mt-3 text-lg text-slate-800">{t(`results.${message}`)}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => void generate()}>↻ {t("results.again")}</Button>
          <Button variant="secondary" onClick={quit}>
            {t("results.change")}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">{t("results.byTopic")}</h2>
        <ul className="space-y-3">
          {byTopic.map(([id, s]) => {
            const p = Math.round((s.ok / s.total) * 100);
            return (
              <li key={id}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="text-slate-700">{topicName(id)}</span>
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
        {feedback.status === "idle" && (
          <Button variant="secondary" className="w-full" onClick={() => void loadFeedback()}>
            🔍 {t("results.analyze")}
          </Button>
        )}
        {feedback.status === "loading" && <p className="animate-pulse text-center text-slate-500">{t("results.analyzing")}</p>}
        {feedback.status === "error" && (
          <div className="space-y-3 text-center">
            <p className="text-sm text-rose-700">{t(`errors.${feedback.error}`, { defaultValue: t("errors.generic") })}</p>
            <Button variant="secondary" onClick={() => void loadFeedback()}>
              {t("results.analyze")}
            </Button>
          </div>
        )}
        {feedback.status === "done" && feedback.data && (
          <div className="space-y-5">
            <p className="leading-relaxed text-slate-800">{feedback.data.summary}</p>
            {feedback.data.weakTopics.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold text-slate-800">{t("results.weakTopics")}</h3>
                <ul className="space-y-2">
                  {feedback.data.weakTopics.map((w) => (
                    <li key={w.topicId} className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm ring-1 ring-rose-100">
                      <div className="font-medium text-rose-900">{topicName(w.topicId)}</div>
                      <div className="text-rose-800">{w.reason}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.data.recommendations.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold text-slate-800">{t("results.recommendations")}</h3>
                <ul className="list-disc space-y-1 pl-5 text-slate-700">
                  {feedback.data.recommendations.map((r, i) => (
                    <li key={i}>
                      <MathText text={r} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.data.suggestedTopicIds.length > 0 && (
              <Button className="w-full" onClick={() => void generate({ topicIds: feedback.data!.suggestedTopicIds })}>
                🎯 {t("results.practiceWeak")}
              </Button>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">{t("results.mistakes")}</h2>
        {mistakes.length === 0 ? (
          <p className="text-slate-600">{t("results.noMistakes")}</p>
        ) : (
          <ol className="space-y-4">
            {mistakes.map((task) => (
              <li key={task.id} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="mb-1 text-xs text-slate-500">{topicName(task.topicId)}</div>
                <MathText text={task.question} className="block text-slate-900" />
                <div className="mt-3 grid gap-1 text-sm">
                  <div className="text-rose-700">
                    {t("results.yourAnswer")} <MathText text={userAnswerText(task.id)} />
                    {answers[task.id]?.usedHint && <span className="ml-2 text-xs text-amber-700">({t("results.hintUsed")})</span>}
                  </div>
                  <div className="text-emerald-700">
                    {t("trainer.correctAnswer")} <MathText text={correctAnswerText(task, lang)} className="font-semibold" />
                  </div>
                </div>
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer font-medium text-indigo-600">{t("trainer.showSolution")}</summary>
                  <div className="mt-2 text-slate-700">
                    <MathText text={task.solution} />
                  </div>
                </details>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
