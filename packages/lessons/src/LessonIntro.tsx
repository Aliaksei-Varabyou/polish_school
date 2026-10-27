// The opening card of a lesson: a short lead and the list of its sections, each a jump link.
import type { ContentLang } from "./lang.ts";
import type { Txt } from "./kit.tsx";

const CONTENTS: Txt = { pl: "W tej lekcji", ru: "В этом уроке" };

/** Sections are expected to carry the ids `${prefix}-s1`, `${prefix}-s2`, … */
export function LessonIntro({ lang, lead, prefix, sections }: { lang: ContentLang; lead: Txt; prefix: string; sections: Txt[] }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 p-5 ring-1 ring-emerald-200 sm:p-7">
      <p className="text-[15px] leading-relaxed text-slate-700 sm:text-base">{lead[lang]}</p>
      <nav className="mt-4" aria-label={CONTENTS[lang]}>
        <div className="mb-2 text-xs font-semibold tracking-wide text-emerald-800 uppercase">{CONTENTS[lang]}</div>
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {sections.map((title, i) => {
            const id = `${prefix}-s${i + 1}`;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  // scroll without touching the URL: the portal's router owns it
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-sm text-slate-700 ring-1 ring-emerald-100 hover:bg-white"
                >
                  <span className="font-semibold text-emerald-700">{i + 1}.</span> {title[lang]}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
