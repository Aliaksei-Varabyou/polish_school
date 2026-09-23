import { TASK_COUNTS, type Lang } from "@portal/core";
import { Button, Card, Label, Segmented } from "@portal/ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { booksForStage, STAGES, type StageId } from "../../content/index.ts";
import { useSession } from "../store/session.ts";

export function StartPage() {
  const { t, i18n } = useTranslation("lectures");
  const lang = i18n.language as Lang;
  const settings = useSession((s) => s.settings);
  const setSettings = useSession((s) => s.setSettings);
  const start = useSession((s) => s.start);

  const books = useMemo(() => booksForStage(settings.stage), [settings.stage]);

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      <Card>
        <Label>{t("start.stage")}</Label>
        <Segmented<StageId>
          value={settings.stage}
          onChange={(stage) => setSettings({ stage })}
          options={STAGES.map((s) => ({ value: s.id, label: t(`start.stage_${s.id}`) }))}
        />
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">{t("start.books")}</h2>
        {books.length === 0 ? (
          <p className="text-sm text-slate-500">{t("start.noBooks")}</p>
        ) : (
          <ul className="space-y-2">
            {books.map((book) => (
              <li key={book.id}>
                <button
                  type="button"
                  onClick={() => setSettings({ bookId: book.id })}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left ring-1 transition-colors ${
                    settings.bookId === book.id
                      ? "bg-indigo-50 ring-2 ring-indigo-500"
                      : "bg-white ring-slate-300 hover:bg-indigo-50 hover:ring-indigo-400"
                  }`}
                >
                  <span>
                    <span className="block font-medium text-slate-900">{book.title[lang]}</span>
                    <span className="block text-sm text-slate-500">{book.author}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1 text-sm text-slate-500">
                    {book.supplementary && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-800 ring-1 ring-amber-200">
                        {t("start.supplementary")}
                      </span>
                    )}
                    {book.typicalGrade && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                        {t("start.typicalGrade", { n: book.typicalGrade.slice(2) })}
                      </span>
                    )}
                    <span>{t("start.questionCount", { count: book.questions.length })}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {settings.bookId && (
        <Card className="space-y-4">
          <div>
            <Label>{t("start.count")}</Label>
            <Segmented value={settings.count} onChange={(count) => setSettings({ count })} options={TASK_COUNTS.map((n) => ({ value: n, label: String(n) }))} />
          </div>
          <Button className="w-full" onClick={start}>
            {t("start.generate")}
          </Button>
        </Card>
      )}
    </div>
  );
}
