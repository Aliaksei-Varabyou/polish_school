import { isLyceum, TASK_COUNTS, type Grade, type Lang } from "@portal/core";
import { Button, Card, Label, Segmented } from "@portal/ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { booksFor } from "../../content/index.ts";
import { useSession } from "../store/session.ts";

const SP_GRADES: Grade[] = ["sp1", "sp2", "sp3", "sp4", "sp5", "sp6", "sp7", "sp8"];
const LO_GRADES: Grade[] = ["lo1", "lo2", "lo3", "lo4"];

export function StartPage() {
  const { t, i18n } = useTranslation("lectures");
  const lang = i18n.language as Lang;
  const settings = useSession((s) => s.settings);
  const setSettings = useSession((s) => s.setSettings);
  const start = useSession((s) => s.start);

  const lyceum = isLyceum(settings.grade);
  const books = useMemo(() => booksFor(settings.grade), [settings.grade]);

  const setGrade = (grade: Grade) => setSettings({ grade });

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      <Card className="space-y-5">
        <div>
          <Label>{t("start.school")}</Label>
          <Segmented
            value={lyceum ? "lo" : "sp"}
            onChange={(v) => setGrade(v === "lo" ? "lo1" : "sp6")}
            options={[
              { value: "sp", label: t("start.sp") },
              { value: "lo", label: t("start.lo") },
            ]}
          />
        </div>

        <div>
          <Label>{t("start.grade")}</Label>
          <Segmented
            value={settings.grade}
            onChange={setGrade}
            options={(lyceum ? LO_GRADES : SP_GRADES).map((g) => ({ value: g, label: t("start.gradeN", { n: g.slice(2) }) }))}
          />
        </div>
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
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left ring-1 transition-colors ${
                    settings.bookId === book.id
                      ? "bg-indigo-50 ring-2 ring-indigo-500"
                      : "bg-white ring-slate-300 hover:bg-indigo-50 hover:ring-indigo-400"
                  }`}
                >
                  <span>
                    <span className="block font-medium text-slate-900">{book.title[lang]}</span>
                    <span className="block text-sm text-slate-500">{book.author}</span>
                  </span>
                  <span className="shrink-0 text-sm text-slate-500">{t("start.questionCount", { count: book.questions.length })}</span>
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
