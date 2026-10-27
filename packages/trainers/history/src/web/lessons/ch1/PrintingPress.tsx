// Block 3 of the Renaissance lesson: how Gutenberg's press works and why it changed books. Four
// steps light up the parts of the workshop; in the last one the student prints pages and watches
// the stack grow against the lone scribe.
import { Choice, KIT, type ContentLang, type Txt } from "@portal/lessons";
import { useState } from "react";

interface Step {
  name: Txt;
  text: Txt;
}

const STEPS: Step[] = [
  {
    name: { pl: "Odlewanie czcionek", ru: "Отливка литер" },
    text: {
      pl: "Każdą literę odlewano z metalu osobno — to ruchoma czcionka. Z jednego zestawu liter można złożyć dowolny tekst, a potem rozsypać go i użyć znowu.",
      ru: "Каждую букву отливали из металла отдельно — это подвижная литера. Из одного набора букв можно составить любой текст, а потом рассыпать его и использовать снова.",
    },
  },
  {
    name: { pl: "Składanie tekstu", ru: "Набор текста" },
    text: {
      pl: "Zecer układał czcionki w wiersze — w lustrzanym odbiciu, bo na papierze litery odwrócą się. Złożona strona to forma drukarska.",
      ru: "Наборщик укладывал литеры в строки — в зеркальном отражении, потому что на бумаге буквы перевернутся. Набранная страница — печатная форма.",
    },
  },
  {
    name: { pl: "Farba i prasa", ru: "Краска и пресс" },
    text: {
      pl: "Formę pokrywano farbą, kładziono na niej arkusz papieru i dociskano śrubową prasą — taką, jakiej używano do wyciskania wina.",
      ru: "Форму покрывали краской, клали на неё лист бумаги и прижимали винтовым прессом — таким, каким выжимали вино.",
    },
  },
  {
    name: { pl: "Odbijanie — wiele razy", ru: "Печать — много раз" },
    text: {
      pl: "Jedna forma dawała setki jednakowych stron. Skryba przepisywał jedną Biblię około roku; Gutenberg wydrukował około 180 egzemplarzy w trzy lata. Książki staniały i trafiły do tysięcy ludzi.",
      ru: "Одна форма давала сотни одинаковых страниц. Переписчик копировал одну Библию около года; Гутенберг напечатал около 180 экземпляров за три года. Книги подешевели и попали к тысячам людей.",
    },
  },
];

const T = {
  title: { pl: "Prasa drukarska Gutenberga", ru: "Печатный станок Гутенберга" },
  step: { pl: "Krok", ru: "Шаг" },
  prev: { pl: "Wstecz", ru: "Назад" },
  print: { pl: "Odbij stronę", ru: "Отпечатать страницу" },
  printed: { pl: "Odbite strony", ru: "Отпечатанные страницы" },
  scribe: { pl: "Skryba w tym czasie: wciąż pierwsza strona", ru: "Переписчик за это время: всё ещё первая страница" },
  full: { pl: "Stos pełny — a forma wciąż gotowa do pracy!", ru: "Стопка полна — а форма всё ещё готова к работе!" },
  caseLabel: { pl: "kaszta z czcionkami", ru: "касса с литерами" },
  formLabel: { pl: "forma (lustrzana)", ru: "форма (зеркальная)" },
  pressLabel: { pl: "prasa", ru: "пресс" },
  paperLabel: { pl: "odbitka", ru: "оттиск" },
} satisfies Record<string, Txt>;

const LETTERS = "ABCDEFGHIJKLMNOPQRST".split("");
const WORD = "LIBER";
const MAX_PAGES = 12;

export function PrintingPress({ lang }: { lang: ContentLang }) {
  const [step, setStep] = useState(0);
  const [pages, setPages] = useState(0);
  const lit = (i: number) => step === i;
  const dim = (i: number) => (lit(i) ? 1 : 0.45);
  const current = STEPS[step]!;
  const go = (k: number) => setStep(Math.min(STEPS.length - 1, Math.max(0, k)));

  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
      <svg viewBox="0 0 320 210" className="mx-auto w-full max-w-[460px] select-none" role="img" aria-label={T.title[lang]}>
        <rect x={0} y={0} width={320} height={210} rx={12} fill="#fdf6e3" />
        {/* 1. type case */}
        <g opacity={dim(0)}>
          <rect x={12} y={20} width={86} height={70} rx={4} fill="#b08968" stroke="#7f5539" strokeWidth={1.5} />
          {LETTERS.map((ch, i) => (
            <g key={ch}>
              <rect x={16 + (i % 5) * 16} y={24 + Math.floor(i / 5) * 16} width={14} height={14} fill="#e6ccb2" stroke="#7f5539" strokeWidth={0.6} />
              <text x={23 + (i % 5) * 16} y={35 + Math.floor(i / 5) * 16} textAnchor="middle" fontSize={8} fontWeight={700} fill="#3f2a14">
                {ch}
              </text>
            </g>
          ))}
          <text x={55} y={104} textAnchor="middle" fontSize={8} fill="#5b4a2e">
            {T.caseLabel[lang]}
          </text>
        </g>
        {/* 2. the form: a mirrored line of type */}
        <g opacity={dim(1)}>
          <rect x={118} y={40} width={84} height={30} rx={3} fill="#4b5563" stroke="#1f2937" strokeWidth={1.5} />
          {WORD.split("")
            .reverse()
            .map((ch, i) => (
              <g key={i} transform={`translate(${137 + i * 15} 46) scale(-1 1)`}>
                <rect x={0} y={0} width={13} height={18} fill="#9ca3af" stroke="#1f2937" strokeWidth={0.6} />
                <text x={6.5} y={13} textAnchor="middle" fontSize={11} fontWeight={700} fill="#111827">
                  {ch}
                </text>
              </g>
            ))}
          <text x={160} y={84} textAnchor="middle" fontSize={8} fill="#5b4a2e">
            {T.formLabel[lang]}
          </text>
        </g>
        <path d="M100 55 L 114 55" stroke="#9a8c6b" strokeWidth={2} markerEnd="url(#pp-arrow)" />
        <path d="M204 55 L 218 55" stroke="#9a8c6b" strokeWidth={2} markerEnd="url(#pp-arrow)" />
        <defs>
          <marker id="pp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L 10 5 L 0 10 Z" fill="#9a8c6b" />
          </marker>
        </defs>
        {/* 3. the press */}
        <g opacity={dim(2)}>
          <rect x={232} y={14} width={10} height={44} fill="#7f5539" />
          <rect x={270} y={14} width={10} height={44} fill="#7f5539" />
          <rect x={226} y={10} width={60} height={8} rx={2} fill="#5c3d1e" />
          <rect x={252} y={18} width={8} height={22} fill="#374151" />
          <path d="M240 24 L 272 24 M240 30 L 272 30" stroke="#374151" strokeWidth={1.5} />
          <rect x={236} y={40} width={40} height={8} fill="#6b7280" stroke="#1f2937" strokeWidth={1} />
          <rect x={222} y={58} width={68} height={10} rx={2} fill="#5c3d1e" />
          <rect x={236} y={50} width={40} height={8} fill="#fff" stroke="#9ca3af" strokeWidth={1} />
          <text x={256} y={84} textAnchor="middle" fontSize={8} fill="#5b4a2e">
            {T.pressLabel[lang]}
          </text>
        </g>
        {/* 4. the printed pages, stacked */}
        <g opacity={dim(3)}>
          {Array.from({ length: pages }, (_, i) => (
            <g key={i} transform={`translate(${196 + (i % 3) * 2} ${144 - i * 4})`}>
              <rect x={0} y={0} width={70} height={46} fill="#fff" stroke="#9ca3af" strokeWidth={1} />
              <text x={35} y={30} textAnchor="middle" fontSize={16} fontWeight={700} fill="#111827" fontFamily="serif">
                {WORD}
              </text>
            </g>
          ))}
          {pages === 0 && <rect x={196} y={144} width={70} height={46} fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="4 3" />}
          <text x={231} y={204} textAnchor="middle" fontSize={8} fill="#5b4a2e">
            {T.paperLabel[lang]}
          </text>
        </g>
        {/* the scribe, for comparison */}
        <g opacity={dim(3)}>
          <circle cx={40} cy={138} r={9} fill="#f5d0a9" stroke="#7f5539" strokeWidth={1} />
          <path d="M26 176 C 26 156, 54 156, 54 176 Z" fill="#6b4c2a" />
          <rect x={60} y={150} width={60} height={34} fill="#fff" stroke="#9ca3af" strokeWidth={1} />
          <path d="M66 160 L 100 160 M66 168 L 92 168 M66 176 L 80 176" stroke="#9ca3af" strokeWidth={1.5} />
          <path d="M54 164 L 70 152" stroke="#374151" strokeWidth={2} strokeLinecap="round" />
          <text x={75} y={198} textAnchor="middle" fontSize={8} fill="#5b4a2e">
            {lang === "pl" ? "skryba: 1 strona" : "переписчик: 1 страница"}
          </text>
        </g>
      </svg>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5" role="radiogroup">
          {STEPS.map((s, i) => (
            <button
              key={s.name.pl}
              type="button"
              role="radio"
              aria-checked={step === i}
              onClick={() => go(i)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors ${
                step === i ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
              }`}
            >
              {i + 1}. {s.name[lang]}
            </button>
          ))}
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <h3 className="text-base font-semibold text-emerald-900">
            {T.step[lang]} {step + 1}: {current.name[lang]}
          </h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{current.text[lang]}</p>
        </div>
        {step === STEPS.length - 1 ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Choice state="active" disabled={pages >= MAX_PAGES} onClick={() => setPages(Math.min(MAX_PAGES, pages + 1))}>
                🖨️ {T.print[lang]}
              </Choice>
              <span className="text-sm text-slate-700">
                {T.printed[lang]}: <b className="tabular-nums">{pages}</b>
              </span>
              {pages > 0 && <Choice onClick={() => setPages(0)}>↺ {KIT.again[lang]}</Choice>}
            </div>
            <p className="text-sm text-slate-500" role="status">
              {pages >= MAX_PAGES ? T.full[lang] : pages > 0 ? T.scribe[lang] : ""}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Choice onClick={() => go(step - 1)}>‹ {T.prev[lang]}</Choice>
            <Choice state="active" onClick={() => go(step + 1)}>
              {KIT.next[lang]} ›
            </Choice>
          </div>
        )}
      </div>
    </div>
  );
}
