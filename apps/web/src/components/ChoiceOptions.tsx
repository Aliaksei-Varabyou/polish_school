import type { Task } from "@matema/shared";
import { MathText } from "./MathText.tsx";

export function ChoiceOptions({
  task,
  selected,
  onSelect,
}: {
  task: Task;
  /** selected label once answered */
  selected?: string;
  onSelect: (label: string) => void;
}) {
  const answered = selected !== undefined;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {task.choices?.map((c) => {
        const isCorrect = c.label === task.correctChoice;
        const isSelected = c.label === selected;
        let style = "bg-white ring-slate-300 hover:bg-indigo-50 hover:ring-indigo-400";
        if (answered) {
          if (isCorrect) style = "bg-emerald-50 ring-emerald-500 ring-2";
          else if (isSelected) style = "bg-rose-50 ring-rose-500 ring-2";
          else style = "bg-white ring-slate-200 opacity-60";
        }
        return (
          <button
            key={c.label}
            type="button"
            disabled={answered}
            onClick={() => onSelect(c.label)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left ring-1 transition-colors disabled:cursor-default ${style}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
              {c.label}
            </span>
            <MathText text={c.text} className="text-lg" />
          </button>
        );
      })}
    </div>
  );
}
