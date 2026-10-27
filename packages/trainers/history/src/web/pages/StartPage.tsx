import { TASK_COUNTS, type AnswerMode } from "@portal/core";
import { Button, Card, Label, Segmented } from "@portal/ui";
import { useTranslation } from "react-i18next";
import { HIST_GRADES, chaptersFor, paragraphsFor, tagsFor, type HistGrade } from "../../index.ts";
import { HIST_LANGS, isHistLang, type HistLang } from "../../lang.ts";
import { hasTasks, ParagraphTree } from "../components/ParagraphTree.tsx";
import { hasLesson } from "../lessons/index.ts";
import { selectedParagraphs, useSession, type SelectionMode } from "../store/session.ts";

export function StartPage({ portalLang, onOpenLesson }: { portalLang: string; onOpenLesson: (paragraphId: string) => void }) {
  const { t } = useTranslation("history");
  const settings = useSession((s) => s.settings);
  const error = useSession((s) => s.error);
  const setSettings = useSession((s) => s.setSettings);
  const generate = useSession((s) => s.generate);

  // one textbook per class; the level follows from the class, so there is no level picker.
  // Only this class's paragraphs with tasks count as chosen — the other class's choice is kept aside.
  const grade = settings.grade;
  const selected = selectedParagraphs(settings);
  const otherGrades = settings.topicIds.filter((id) => !selected.includes(id));
  const tags = tagsFor(grade);
  const lessons = paragraphsFor(grade).filter((p) => hasLesson(p.id));

  // a class whose content carries no cross-cutting theme gets no theme mode at all
  const byTag = settings.mode === "tags" && tags.length > 0;
  const selectedTags = settings.tagIds.filter((id) => tags.some((tag) => tag.id === id));
  const toggleTag = (id: string) =>
    setSettings({ tagIds: selectedTags.includes(id) ? selectedTags.filter((x) => x !== id) : [...selectedTags, id] });
  const ready = byTag ? selectedTags.length > 0 : selected.length > 0;

  // the portal offers English, history's content does not — so ask instead of serving an empty session
  const needsLangChoice = !isHistLang(portalLang as HistLang);

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      {needsLangChoice && (
        <Card className="space-y-3">
          <div>
            <Label>{t("start.contentLang")}</Label>
            <Segmented<HistLang>
              value={settings.lang}
              onChange={(lang) => setSettings({ lang })}
              options={HIST_LANGS.map((l) => ({ value: l, label: t(`start.lang_${l}`) }))}
            />
          </div>
          <p className="text-sm text-slate-500">{t("start.contentLangHint")}</p>
        </Card>
      )}

      {/* one class so far: the class picker and the theme mode only appear once there is a choice */}
      {(HIST_GRADES.length > 1 || tags.length > 0) && (
      <Card className="space-y-4">
        {HIST_GRADES.length > 1 && (
        <div>
          <Label>{t("start.grade")}</Label>
          <Segmented<HistGrade>
            value={grade}
            onChange={(next) => setSettings({ grade: next })}
            options={HIST_GRADES.map((g) => ({ value: g, label: t(`start.grade_${g}`) }))}
          />
        </div>
        )}
        {tags.length > 0 && (
          <div>
            <Label>{t("start.mode")}</Label>
            <Segmented<SelectionMode>
              value={byTag ? "tags" : "topics"}
              onChange={(mode) => setSettings({ mode })}
              options={[
                { value: "topics", label: t("start.modeTopics") },
                { value: "tags", label: t("start.modeTags") },
              ]}
            />
          </div>
        )}
      </Card>
      )}

      {lessons.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-800">📖 {t("lesson.listTitle")}</h2>
          <p className="mt-1 mb-3 text-sm text-slate-500">{t("lesson.listHint")}</p>
          {/* folded by chapter: with a lesson for every paragraph a flat list would push the test settings far down */}
          <ul className="space-y-2">
            {chaptersFor(grade).map((chapter) => {
              const inChapter = lessons.filter((p) => p.chapterId === chapter.id);
              if (inChapter.length === 0) return null;
              return (
                <li key={chapter.id}>
                  <details className="group rounded-xl bg-amber-50/60 ring-1 ring-amber-200">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                      <span className="flex-1 text-sm leading-snug font-medium text-slate-800">
                        {chapter.number}. {chapter.name[settings.lang]}
                      </span>
                      <span className="shrink-0 text-xs whitespace-nowrap text-amber-700">{t("lesson.chapterCount", { count: inChapter.length })}</span>
                      <span aria-hidden className="shrink-0 text-slate-400 transition-transform group-open:rotate-90">
                        ›
                      </span>
                    </summary>
                    <ul className="grid gap-1.5 px-2 pb-2 sm:grid-cols-2">
                      {inChapter.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => onOpenLesson(p.id)}
                            className="flex w-full items-start gap-3 rounded-lg bg-white px-3 py-2 text-left ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
                          >
                            <span className="w-9 shrink-0 text-sm text-amber-700 tabular-nums">{p.number}</span>
                            <span className="flex-1 text-sm leading-snug text-slate-800">{p.name[settings.lang]}</span>
                            <span aria-hidden className="text-amber-600">→</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {byTag ? (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-slate-800">{t("start.themes")}</h2>
          <p className="mb-3 text-sm text-slate-500">{t("start.themesHint")}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {tags.map((tag) => {
              const checked = selectedTags.includes(tag.id);
              return (
                <li key={tag.id}>
                  <label
                    className={`flex h-full cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 ring-1 transition-colors ${
                      checked ? "bg-amber-50 ring-amber-400" : "bg-white ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTag(tag.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
                    />
                    <span className="text-sm leading-snug text-slate-700">{tag.name[settings.lang]}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
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
              onClick={() => setSettings({ topicIds: [...otherGrades, ...paragraphsFor(grade).map((p) => p.id).filter(hasTasks)] })}
            >
              {t("start.selectAll")}
            </Button>
            <Button variant="ghost" className="px-2 py-1.5 text-sm whitespace-nowrap" onClick={() => setSettings({ topicIds: otherGrades })}>
              {t("start.clearAll")}
            </Button>
          </div>
        </div>
        <ParagraphTree
          grade={grade}
          lang={settings.lang}
          selected={selected}
          onChange={(ids) => setSettings({ topicIds: [...otherGrades, ...ids] })}
          onOpenLesson={onOpenLesson}
        />
      </Card>
      )}

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
        <Button className="w-full py-3.5 text-lg" disabled={!ready} onClick={() => void generate({ topicIds: selected })}>
          {ready ? t("start.generate") : t(byTag ? "start.pickTheme" : "start.pickTopic")}
        </Button>
      </div>
    </div>
  );
}
