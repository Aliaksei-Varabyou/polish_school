// The textbook's table of contents as a picker: a chapter selects all of its paragraphs that have
// tasks, or open it and pick paragraphs one by one. Paragraphs without content are shown but not
// selectable — the tree mirrors the book, so the student can see what is not covered yet.
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { chaptersFor, PARAGRAPH_TASKS, paragraphsOf, type BioGrade, type Chapter } from "../../index.ts";
import type { BioLang } from "../../lang.ts";

/** A paragraph can be picked only when the pool has something to serve from it. */
export const hasTasks = (paragraphId: string): boolean => (PARAGRAPH_TASKS[paragraphId] ?? 0) > 0;

interface Props {
  grade: BioGrade;
  lang: BioLang;
  selected: readonly string[];
  onChange: (ids: string[]) => void;
}

export function ParagraphTree({ grade, lang, selected, onChange }: Props) {
  const picked = new Set(selected);
  return (
    <ul className="space-y-2">
      {chaptersFor(grade).map((chapter) => (
        <ChapterRow key={chapter.id} chapter={chapter} lang={lang} picked={picked} onChange={onChange} />
      ))}
    </ul>
  );
}

function ChapterRow({ chapter, lang, picked, onChange }: { chapter: Chapter; lang: BioLang; picked: Set<string>; onChange: (ids: string[]) => void }) {
  const { t } = useTranslation("bio");
  const paragraphs = paragraphsOf(chapter.id);
  const active = paragraphs.filter((p) => hasTasks(p.id));
  const count = active.filter((p) => picked.has(p.id)).length;
  const all = active.length > 0 && count === active.length;
  const some = count > 0 && !all;

  // a partly chosen chapter starts open, so what is chosen is visible; after that the student decides
  const [open, setOpen] = useState(some);

  const box = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (box.current) box.current.indeterminate = some;
  }, [some]);

  const toggleChapter = () => {
    const next = new Set(picked);
    for (const p of active) {
      if (all) next.delete(p.id);
      else next.add(p.id);
    }
    onChange([...next]);
  };
  const toggleParagraph = (id: string) => {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  const name = `${chapter.number}. ${chapter.name[lang]}`;
  return (
    <li className={`rounded-xl ring-1 transition-colors ${count > 0 ? "bg-emerald-50/60 ring-emerald-300" : "bg-white ring-slate-200"}`}>
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
          {/* the checkbox is its own activation target, so clicking it does not also fold the row */}
          <input
            ref={box}
            type="checkbox"
            aria-label={name}
            checked={all}
            disabled={active.length === 0}
            onChange={toggleChapter}
            className="h-4 w-4 shrink-0 accent-emerald-600"
          />
          <span className="flex-1 text-sm leading-snug font-medium text-slate-800">{name}</span>
          <span className="shrink-0 text-xs whitespace-nowrap text-slate-500">
            {t("start.chapterPicked", { count, total: active.length })}
          </span>
          <span aria-hidden className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}>
            ›
          </span>
        </summary>
        <ul className="space-y-1 px-2 pb-2">
          {paragraphs.map((p) => {
            const tasks = PARAGRAPH_TASKS[p.id] ?? 0;
            const checked = picked.has(p.id);
            return (
              <li key={p.id}>
                <label
                  className={`flex items-start gap-3 rounded-lg px-2 py-1.5 ${
                    tasks === 0 ? "cursor-not-allowed opacity-50" : checked ? "cursor-pointer bg-emerald-100/70" : "cursor-pointer hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={tasks === 0}
                    onChange={() => toggleParagraph(p.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
                  />
                  <span className="w-9 shrink-0 text-sm text-slate-500 tabular-nums">{p.number}</span>
                  <span className="flex-1 text-sm leading-snug text-slate-700">
                    {p.name[lang]}
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {p.page !== undefined && `${t("start.page", { page: p.page })} · `}
                      {tasks > 0 ? t("start.tasks", { count: tasks }) : t("start.noTasks")}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </details>
    </li>
  );
}
