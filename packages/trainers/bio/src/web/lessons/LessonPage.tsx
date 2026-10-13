// The frame around a lesson: a way back to the start page, the paragraph's title, the lesson itself
// and, at the bottom, a test on the same paragraph so the explanation flows straight into practice.
import { Button } from "@portal/ui";
import { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getParagraph, PARAGRAPH_TASKS } from "../../curriculum/index.ts";
import type { BioLang } from "../../lang.ts";
import { lessonFor } from "./index.ts";

interface Props {
  paragraphId: string;
  lang: BioLang;
  onClose: () => void;
  onPractice: () => void;
}

export function LessonPage({ paragraphId, lang, onClose, onPractice }: Props) {
  const { t } = useTranslation("bio");
  const paragraph = getParagraph(paragraphId);
  const Lesson = lessonFor(paragraphId);
  const tasks = PARAGRAPH_TASKS[paragraphId] ?? 0;

  useEffect(() => window.scrollTo({ top: 0 }), [paragraphId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" className="-ml-3 px-3 py-1.5 text-sm" onClick={onClose}>
          ← {t("lesson.back")}
        </Button>
        {tasks > 0 && (
          <Button variant="secondary" className="px-3.5 py-1.5 text-sm" onClick={onPractice}>
            {t("lesson.practiceShort")}
          </Button>
        )}
      </div>

      <header>
        <div className="text-sm font-medium text-emerald-700">
          {t("lesson.kicker")} · §{paragraph?.number}
        </div>
        <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{paragraph?.name[lang]}</h2>
      </header>

      {Lesson ? (
        <Suspense fallback={<p className="py-10 text-center text-slate-500">{t("lesson.loading")}</p>}>
          <Lesson lang={lang} />
        </Suspense>
      ) : (
        <p className="text-slate-500">{t("lesson.missing")}</p>
      )}

      {tasks > 0 && (
        <div className="rounded-2xl bg-indigo-50 p-5 ring-1 ring-indigo-200 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div>
            <div className="font-semibold text-indigo-950">{t("lesson.practiceTitle")}</div>
            <p className="mt-1 text-sm text-indigo-900/80">{t("lesson.practiceHint", { count: tasks })}</p>
          </div>
          <Button className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto" onClick={onPractice}>
            {t("lesson.practice")}
          </Button>
        </div>
      )}
    </div>
  );
}
