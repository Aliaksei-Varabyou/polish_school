import { isLyceum, TASK_COUNTS, type AnswerMode, type Grade, type Level } from "@portal/core";
import { topicsFor } from "../../index.ts";
import { Button, Card, Label, Segmented } from "@portal/ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../store/session.ts";

const SP_GRADES: Grade[] = ["sp5", "sp6", "sp7", "sp8"];
const LO_GRADES: Grade[] = ["lo1", "lo2", "lo3", "lo4"];

export function StartPage() {
  const { t } = useTranslation("math");
  const settings = useSession((s) => s.settings);
  const error = useSession((s) => s.error);
  const setSettings = useSession((s) => s.setSettings);
  const generate = useSession((s) => s.generate);

  const lyceum = isLyceum(settings.grade);
  const topics = useMemo(() => topicsFor(settings.grade, settings.level), [settings.grade, settings.level]);
  const selected = settings.topicIds.filter((id) => topics.some((tp) => tp.id === id));

  const toggle = (id: string) =>
    setSettings({ topicIds: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] });

  const setGrade = (grade: Grade) => setSettings({ grade, topicIds: [] });

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      <Card className="space-y-5">
        <div>
          <Label>{t("start.school")}</Label>
          <Segmented
            value={lyceum ? "lo" : "sp"}
            onChange={(v) => setGrade(v === "lo" ? "lo1" : "sp7")}
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

        {lyceum && (
          <div>
            <Label>{t("start.level")}</Label>
            <Segmented<Level>
              value={settings.level}
              onChange={(level) => setSettings({ level })}
              options={[
                { value: "P", label: t("start.levelP") },
                { value: "R", label: t("start.levelR") },
              ]}
            />
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 className="text-lg font-semibold text-slate-800">
            {t("start.topics")}
            <span className="ml-2 text-sm font-normal whitespace-nowrap text-slate-500">
              {t("start.selected", { count: selected.length })}
            </span>
          </h2>
          <div className="-mx-2 flex items-center">
            <Button
              variant="ghost"
              className="px-2 py-1.5 text-sm whitespace-nowrap text-indigo-600"
              onClick={() => setSettings({ topicIds: topics.map((tp) => tp.id) })}
            >
              {t("start.selectAll")}
            </Button>
            <Button variant="ghost" className="px-2 py-1.5 text-sm whitespace-nowrap" onClick={() => setSettings({ topicIds: [] })}>
              {t("start.clearAll")}
            </Button>
          </div>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {topics.map((tp) => {
            const checked = selected.includes(tp.id);
            return (
              <li key={tp.id}>
                <label
                  className={`flex h-full cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 ring-1 transition-colors ${
                    checked ? "bg-indigo-50 ring-indigo-400" : "bg-white ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(tp.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                  />
                  <span className="text-sm leading-snug text-slate-700">
                    {tp.name[settings.lang]}
                    {tp.level === "R" && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                        {t("start.extended")}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="grid gap-5 sm:grid-cols-[auto_1fr]">
        <div>
          <Label>{t("start.count")}</Label>
          <select
            value={settings.count}
            onChange={(e) => setSettings({ count: Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-indigo-500 sm:w-32"
          >
            {TASK_COUNTS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>{t("start.answerMode")}</Label>
          <Segmented<AnswerMode>
            value={settings.answerMode}
            onChange={(answerMode) => setSettings({ answerMode })}
            options={[
              { value: "input", label: t("start.modeInput") },
              { value: "choice", label: t("start.modeChoice") },
              { value: "mixed", label: t("start.modeMixed") },
            ]}
          />
        </div>
      </Card>

      {error && (
        <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {t(`errors.${error}`, { defaultValue: t("errors.generic") })}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
        <Button
          className="w-full py-3.5 text-lg"
          disabled={selected.length === 0}
          onClick={() => void generate({ topicIds: selected })}
        >
          {selected.length === 0 ? t("start.pickTopic") : t("start.generate")}
        </Button>
      </div>
    </div>
  );
}
