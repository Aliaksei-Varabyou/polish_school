import type { Lang, SessionSettings, SessionSummary } from "@portal/core";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatDateTime, percent, splitGrade } from "../lib/account.ts";
import { getTrainer } from "../trainers.ts";

export const scoreColor = (pct: number) => (pct >= 70 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600");
export const barColor = (pct: number) => (pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500");

/** "7 класс · Szkoła podstawowa" / "2 класс · Liceum · расширенный уровень" */
export function gradeLabel(t: TFunction, settings: Pick<SessionSettings, "grade" | "level">): string {
  const { school, n } = splitGrade(settings.grade);
  const parts = [t("grade.n", { n }), t(`grade.${school}`)];
  if (school === "lo" && settings.level) parts.push(t(`grade.level${settings.level}`));
  return parts.join(" · ");
}

export function trainerMeta(trainerId: string, lang: Lang) {
  const trainer = getTrainer(trainerId);
  return {
    trainer,
    icon: trainer?.icon ?? "📘",
    name: trainer?.name[lang] ?? trainerId,
    topicName: (topicId: string) => trainer?.topicName(topicId, lang) ?? topicId,
  };
}

export function UnfinishedBadge() {
  const { t } = useTranslation();
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-amber-800">
      {t("history.unfinished")}
    </span>
  );
}

const MAX_TOPICS = 3;

export function SessionRow({ session, lang }: { session: SessionSummary; lang: Lang }) {
  const { t } = useTranslation();
  const meta = trainerMeta(session.trainerId, lang);
  const names = session.settings.topicIds.map(meta.topicName);
  const topics = names.slice(0, MAX_TOPICS).join(", ") + (names.length > MAX_TOPICS ? ` +${names.length - MAX_TOPICS}` : "");
  const pct = percent(session.correct, session.total);

  return (
    <Link
      to={`/history/${session.id}`}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-400 focus-visible:outline-2 focus-visible:outline-indigo-500"
    >
      <span className="text-2xl" aria-hidden>
        {meta.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-slate-900">{meta.name}</span>
          {!session.finishedAt && <UnfinishedBadge />}
        </div>
        <div className="text-xs text-slate-500">
          {formatDateTime(session.startedAt, lang)} · {gradeLabel(t, session.settings)}
        </div>
        {topics && <div className="mt-0.5 truncate text-sm text-slate-600">{topics}</div>}
      </div>
      <div className="shrink-0 text-right">
        <div className={`text-lg font-bold ${scoreColor(pct)}`}>
          {session.correct}/{session.total}
        </div>
        <div className="text-xs text-slate-500">{t("history.answered", { answered: session.answered, total: session.total })}</div>
      </div>
    </Link>
  );
}

export function TopicBar({ name, correct, attempts, icon }: { name: string; correct: number; attempts: number; icon?: string }) {
  const { t } = useTranslation();
  const pct = percent(correct, attempts);
  return (
    <li>
      <div className="mb-1 flex justify-between gap-3 text-sm">
        <span className="text-slate-700">
          {icon && (
            <span className="mr-1.5" aria-hidden>
              {icon}
            </span>
          )}
          {name}
        </span>
        <span className="shrink-0 font-medium text-slate-600">
          {t("dashboard.topicStat", { correct, attempts })} · {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="presentation">
        <div className={`h-full rounded-full ${barColor(pct)}`} style={{ width: `${Math.max(pct, 3)}%` }} />
      </div>
    </li>
  );
}
