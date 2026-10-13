import { TASK_COUNTS, type AnswerMode } from "@portal/core";
import { Button, Card, Label, Segmented } from "@portal/ui";
import { useTranslation } from "react-i18next";
import { BIO_GRADES, paragraphsFor, tagsFor, type BioGrade } from "../../index.ts";
import { BIO_LANGS, isBioLang, type BioLang } from "../../lang.ts";
import { hasTasks, ParagraphTree } from "../components/ParagraphTree.tsx";
import { selectedParagraphs, useSession, type SelectionMode } from "../store/session.ts";

export function StartPage({ portalLang }: { portalLang: string }) {
  const { t } = useTranslation("bio");
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

  // a class whose content carries no cross-cutting theme gets no theme mode at all
  const byTag = settings.mode === "tags" && tags.length > 0;
  const selectedTags = settings.tagIds.filter((id) => tags.some((tag) => tag.id === id));
  const toggleTag = (id: string) =>
    setSettings({ tagIds: selectedTags.includes(id) ? selectedTags.filter((x) => x !== id) : [...selectedTags, id] });
  const ready = byTag ? selectedTags.length > 0 : selected.length > 0;

  // the portal offers English, biology's content does not — so ask instead of serving an empty session
  const needsLangChoice = !isBioLang(portalLang as BioLang);

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      {needsLangChoice && (
        <Card className="space-y-3">
          <div>
            <Label>{t("start.contentLang")}</Label>
            <Segmented<BioLang>
              value={settings.lang}
              onChange={(lang) => setSettings({ lang })}
              options={BIO_LANGS.map((l) => ({ value: l, label: t(`start.lang_${l}`) }))}
            />
          </div>
          <p className="text-sm text-slate-500">{t("start.contentLangHint")}</p>
        </Card>
      )}

      <Card className="space-y-4">
        <div>
          <Label>{t("start.grade")}</Label>
          <Segmented<BioGrade>
            value={grade}
            onChange={(next) => setSettings({ grade: next })}
            options={BIO_GRADES.map((g) => ({ value: g, label: t(`start.grade_${g}`) }))}
          />
        </div>
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
                      checked ? "bg-emerald-50 ring-emerald-400" : "bg-white ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTag(tag.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
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
