// Building blocks shared by the lessons: bilingual text, section cards, the "remember" box and the
// small feedback line every interactive uses. Lesson content follows the session language (pl/ru),
// so the words inside a lesson are part of its content, not of the UI translations.
import { emitMors } from "@portal/ui";
import { useEffect, type ReactNode } from "react";
import type { BioLang } from "../../lang.ts";

/** A piece of lesson text in both content languages. */
export type Txt = Readonly<Record<BioLang, string>>;

export interface LessonProps {
  lang: BioLang;
}

/** Words the lesson kit itself prints. */
/** a number the Polish and Russian way: decimal comma, real minus sign */
export const num = (x: number, digits = 0): string => x.toFixed(digits).replace(".", ",").replace("-", "−");

export const KIT = {
  remember: { pl: "Zapamiętaj", ru: "Запомни" },
  correct: { pl: "Dobrze!", ru: "Верно!" },
  wrong: { pl: "Jeszcze nie", ru: "Пока нет" },
  again: { pl: "Od nowa", ru: "Заново" },
  next: { pl: "Dalej", ru: "Дальше" },
} satisfies Record<string, Txt>;

export function Section({ id, n, title, intro, children }: { id: string; n: number; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
      <h2 id={`${id}-title`} className="flex items-baseline gap-3 text-lg font-semibold text-slate-900 sm:text-xl">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{n}</span>
        {title}
      </h2>
      {intro && <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-slate-600">{intro}</div>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Remember({ lang, items }: { lang: BioLang; items: readonly Txt[] }) {
  return (
    <aside className="mt-6 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
      <div className="mb-1.5 text-sm font-semibold text-amber-800">💡 {KIT.remember[lang]}</div>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-amber-950">
        {items.map((item) => (
          <li key={item.pl}>{item[lang]}</li>
        ))}
      </ul>
    </aside>
  );
}

/** One line of feedback after an answer: green when right, rose with an explanation when not. */
export function Verdict({ ok, lang, children }: { ok: boolean; lang: BioLang; children?: ReactNode }) {
  // lessons with their own widgets get Mors's reaction for free; the shared games announce their
  // steps themselves, and the bus drops this echo of the same moment
  useEffect(() => emitMors(ok ? "right" : "wrong"), [ok]);
  return (
    <div
      role="status"
      className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ring-1 ${
        ok ? "bg-emerald-50 text-emerald-900 ring-emerald-200" : "bg-rose-50 text-rose-900 ring-rose-200"
      }`}
    >
      <span className="font-semibold">{ok ? `✓ ${KIT.correct[lang]}` : `✗ ${KIT.wrong[lang]}`}</span>
      {children && <span> {children}</span>}
    </div>
  );
}

/** A pill-shaped choice button used by the lesson games. */
export function Choice({
  children,
  onClick,
  state = "idle",
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  state?: "idle" | "right" | "wrong" | "active";
  disabled?: boolean;
}) {
  const look = {
    idle: "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50",
    active: "bg-indigo-600 text-white ring-indigo-600",
    right: "bg-emerald-600 text-white ring-emerald-600",
    wrong: "bg-rose-100 text-rose-800 ring-rose-300",
  }[state];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-3.5 py-2 text-sm font-medium ring-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-default ${look}`}
    >
      {children}
    </button>
  );
}
