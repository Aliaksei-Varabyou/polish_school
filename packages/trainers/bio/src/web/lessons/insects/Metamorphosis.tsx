// Block 4: development. One slider moves a butterfly (complete metamorphosis) and a grasshopper
// (incomplete) through their stages side by side, so the one step where they differ — the pupa —
// stands out. A short sorting game follows.
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../lang.ts";
import { Choice, KIT, Verdict, type Txt } from "../kit.tsx";

interface Stage {
  name: Txt;
  text: Txt;
  art: ReactNode;
}

// ---------- drawings (viewBox 0 0 120 90) ----------

const LEAF = <path d="M8 72 Q60 46 112 72 Q60 92 8 72 Z" fill="#86efac" stroke="#16a34a" strokeWidth={1.2} />;
const SOIL = <rect x={0} y={62} width={120} height={28} fill="#d6b48a" />;

const caterpillar = (
  <>
    {LEAF}
    {[30, 40, 50, 60, 70, 80].map((x) => (
      <g key={x}>
        <circle cx={x} cy={60} r={7} fill="#4ade80" stroke="#15803d" strokeWidth={1} />
        <path d={`M${x} 67 l 0 3`} stroke="#15803d" strokeWidth={2} strokeLinecap="round" />
      </g>
    ))}
    <circle cx={90} cy={57} r={8} fill="#166534" />
    <circle cx={93} cy={55} r={1.6} fill="white" />
  </>
);

const pupa = (
  <>
    <path d="M20 10 L 100 10" stroke="#92400e" strokeWidth={4} strokeLinecap="round" />
    <path d="M60 10 L 60 18" stroke="#78716c" strokeWidth={1.5} />
    <path d="M60 18 C 48 26, 46 52, 54 70 C 57 76, 63 76, 66 70 C 74 52, 72 26, 60 18 Z" fill="#a3e635" stroke="#4d7c0f" strokeWidth={1.5} />
    <path d="M52 38 Q60 42 68 38 M53 50 Q60 54 67 50 M55 61 Q60 64 65 61" fill="none" stroke="#4d7c0f" strokeWidth={1} />
  </>
);

const butterfly = (
  <>
    <path d="M58 40 C 44 12, 10 14, 12 36 C 14 52, 44 52, 58 46 Z" fill="#fef9c3" stroke="#a16207" strokeWidth={1.2} />
    <path d="M62 40 C 76 12, 110 14, 108 36 C 106 52, 76 52, 62 46 Z" fill="#fef9c3" stroke="#a16207" strokeWidth={1.2} />
    <path d="M58 48 C 40 52, 26 70, 36 78 C 46 84, 56 64, 59 54 Z" fill="#fefce8" stroke="#a16207" strokeWidth={1.2} />
    <path d="M62 48 C 80 52, 94 70, 84 78 C 74 84, 64 64, 61 54 Z" fill="#fefce8" stroke="#a16207" strokeWidth={1.2} />
    <circle cx={30} cy={30} r={4} fill="#292524" />
    <circle cx={90} cy={30} r={4} fill="#292524" />
    <ellipse cx={60} cy={50} rx={3} ry={20} fill="#44403c" />
    <path d="M59 31 C 54 20, 50 16, 46 14 M61 31 C 66 20, 70 16, 74 14" fill="none" stroke="#44403c" strokeWidth={1.2} />
  </>
);

const butterflyEggs = (
  <>
    {LEAF}
    {[44, 52, 60, 68, 76].map((x, i) => (
      <ellipse key={x} cx={x} cy={i % 2 ? 60 : 64} rx={3} ry={5} fill="#fde047" stroke="#ca8a04" strokeWidth={0.8} />
    ))}
  </>
);

const grasshopperEggs = (
  <>
    {SOIL}
    <path d="M40 66 C 36 74, 44 86, 60 86 C 76 86, 84 74, 80 66 Z" fill="#a16207" opacity={0.5} />
    {[48, 56, 64, 72, 52, 60, 68].map((x, i) => (
      <ellipse key={i} cx={x} cy={i < 4 ? 74 : 80} rx={3} ry={5} fill="#fef3c7" stroke="#b45309" strokeWidth={0.8} />
    ))}
  </>
);

/** side view of a grasshopper; `wings`: 0 none, 1 wing buds, 2 full wings */
function grasshopper(scale: number, wings: 0 | 1 | 2) {
  return (
    <>
      {SOIL}
      <g transform={`translate(60 62) scale(${scale}) translate(-60 -62)`}>
        <path d="M26 38 C 20 20, 40 12, 54 8" fill="none" stroke="#166534" strokeWidth={1.5} />
        <path d="M40 54 L 38 62 M48 55 L 50 62" stroke="#166534" strokeWidth={2.5} strokeLinecap="round" />
        <ellipse cx={62} cy={50} rx={30} ry={9} fill="#4ade80" stroke="#15803d" strokeWidth={1.2} />
        <ellipse cx={30} cy={46} rx={9} ry={10} fill="#22c55e" stroke="#15803d" strokeWidth={1.2} />
        <circle cx={27} cy={43} r={2} fill="#14532d" />
        {wings === 1 && <path d="M44 42 L 62 41 L 60 49 L 46 49 Z" fill="#16a34a" />}
        {wings === 2 && <path d="M42 43 L 100 44 L 95 51 L 44 51 Z" fill="#15803d" opacity={0.9} />}
        <path d="M68 52 L 84 34 L 98 60" fill="none" stroke="#15803d" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </>
  );
}

const COMPLETE: Stage[] = [
  {
    name: { pl: "Jajo", ru: "Яйцо" },
    text: { pl: "Samica składa jaja na roślinie, którą będzie jadła larwa.", ru: "Самка откладывает яйца на растение, которым будет питаться личинка." },
    art: butterflyEggs,
  },
  {
    name: { pl: "Larwa (gąsienica)", ru: "Личинка (гусеница)" },
    text: {
      pl: "Larwa zupełnie nie przypomina motyla: nie ma skrzydeł, ma gryzący aparat gębowy i cały czas je liście. Rośnie i kilka razy linieje.",
      ru: "Личинка совсем не похожа на бабочку: у неё нет крыльев, грызущий ротовой аппарат, и она всё время ест листья. Растёт и несколько раз линяет.",
    },
    art: caterpillar,
  },
  {
    name: { pl: "Poczwarka", ru: "Куколка" },
    text: {
      pl: "Poczwarka nie je i prawie się nie rusza, ale w jej wnętrzu całe ciało larwy zostaje przebudowane.",
      ru: "Куколка не ест и почти не двигается, но внутри неё всё тело личинки перестраивается.",
    },
    art: pupa,
  },
  {
    name: { pl: "Postać dorosła", ru: "Взрослая особь" },
    text: {
      pl: "Z poczwarki wychodzi dorosły motyl — ze skrzydłami i ssącą trąbką. Dorosły owad już nie rośnie.",
      ru: "Из куколки выходит взрослая бабочка — с крыльями и сосущим хоботком. Взрослое насекомое больше не растёт.",
    },
    art: butterfly,
  },
];

const INCOMPLETE: Stage[] = [
  {
    name: { pl: "Jajo", ru: "Яйцо" },
    text: { pl: "Samica składa jaja do gleby.", ru: "Самка откладывает яйца в почву." },
    art: grasshopperEggs,
  },
  {
    name: { pl: "Larwa", ru: "Личинка" },
    text: {
      pl: "Larwa jest podobna do dorosłego owada, tylko mniejsza i nie ma skrzydeł. Je to samo co rodzice.",
      ru: "Личинка похожа на взрослое насекомое, только меньше и без крыльев. Ест то же, что и родители.",
    },
    art: grasshopper(0.55, 0),
  },
  {
    name: { pl: "Larwa (starsza)", ru: "Личинка (постарше)" },
    text: {
      pl: "Larwa rośnie i linieje. Po każdym linieniu ma większe zawiązki skrzydeł. Stadium poczwarki nie ma!",
      ru: "Личинка растёт и линяет. После каждой линьки зачатки крыльев становятся больше. Стадии куколки нет!",
    },
    art: grasshopper(0.78, 1),
  },
  {
    name: { pl: "Postać dorosła", ru: "Взрослая особь" },
    text: {
      pl: "Po ostatnim linieniu powstaje dorosły konik polny z w pełni rozwiniętymi skrzydłami.",
      ru: "После последней линьки появляется взрослый кузнечик с полностью развитыми крыльями.",
    },
    art: grasshopper(1, 2),
  },
];

const TXT = {
  complete: { pl: "Przeobrażenie zupełne", ru: "Полное превращение" },
  incomplete: { pl: "Przeobrażenie niezupełne", ru: "Неполное превращение" },
  butterfly: { pl: "motyl", ru: "бабочка" },
  grasshopper: { pl: "konik polny", ru: "кузнечик" },
  stage: { pl: "Etap", ru: "Этап" },
  difference: { pl: "Tu jest różnica!", ru: "Вот в чём разница!" },
  prev: { pl: "Wstecz", ru: "Назад" },
  sortTitle: { pl: "Jakie przeobrażenie?", ru: "Какое превращение?" },
  sortHint: {
    pl: "Wskazówka: jeśli larwa wygląda zupełnie inaczej niż dorosły (gąsienica, czerw, „robak”), szukaj poczwarki.",
    ru: "Подсказка: если личинка совсем не похожа на взрослого (гусеница, «червячок»), ищи стадию куколки.",
  },
  completeShort: { pl: "zupełne", ru: "полное" },
  incompleteShort: { pl: "niezupełne", ru: "неполное" },
  sortDone: { pl: "Gotowe! Pomyłek:", ru: "Готово! Ошибок:" },
} satisfies Record<string, Txt>;

const SORT: { name: Txt; complete: boolean; why: Txt }[] = [
  { name: { pl: "pszczoła", ru: "пчела" }, complete: true, why: { pl: "larwa (czerw) → poczwarka → pszczoła", ru: "личинка → куколка → пчела" } },
  { name: { pl: "szarańcza", ru: "саранча" }, complete: false, why: { pl: "larwa podobna do dorosłej, bez poczwarki", ru: "личинка похожа на взрослую, куколки нет" } },
  { name: { pl: "biedronka", ru: "божья коровка" }, complete: true, why: { pl: "larwa → poczwarka → chrząszcz", ru: "личинка → куколка → жук" } },
  { name: { pl: "ważka", ru: "стрекоза" }, complete: false, why: { pl: "larwa żyje w wodzie, ale nie ma poczwarki", ru: "личинка живёт в воде, но куколки нет" } },
  { name: { pl: "mucha domowa", ru: "комнатная муха" }, complete: true, why: { pl: "larwa → poczwarka → mucha", ru: "личинка → куколка → муха" } },
  { name: { pl: "karaczan (karaluch)", ru: "таракан" }, complete: false, why: { pl: "larwy wyglądają jak małe karaczany", ru: "личинки выглядят как маленькие тараканы" } },
  { name: { pl: "komar", ru: "комар" }, complete: true, why: { pl: "larwa i poczwarka żyją w wodzie", ru: "личинка и куколка живут в воде" } },
  { name: { pl: "pluskwiak (np. kowal bezskrzydły)", ru: "клоп (напр. клоп-солдатик)" }, complete: false, why: { pl: "larwa podobna do dorosłego, bez poczwarki", ru: "личинка похожа на взрослого, куколки нет" } },
];

export function Metamorphosis({ lang }: { lang: BioLang }) {
  const [stage, setStage] = useState(0);
  return (
    <div className="space-y-6">
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Lane title={TXT.complete[lang]} who={TXT.butterfly[lang]} stages={COMPLETE} stage={stage} lang={lang} tone="amber" highlight={stage === 2} />
          <Lane title={TXT.incomplete[lang]} who={TXT.grasshopper[lang]} stages={INCOMPLETE} stage={stage} lang={lang} tone="green" highlight={stage === 2} />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            aria-label={TXT.prev[lang]}
            disabled={stage === 0}
            onClick={() => setStage(stage - 1)}
            className="h-10 w-10 shrink-0 rounded-full bg-white text-lg ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-40"
          >
            ‹
          </button>
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={stage}
            onChange={(e) => setStage(Number(e.target.value))}
            aria-label={TXT.stage[lang]}
            aria-valuetext={`${TXT.stage[lang]} ${stage + 1}: ${COMPLETE[stage]!.name[lang]} / ${INCOMPLETE[stage]!.name[lang]}`}
            className="h-2 flex-1 cursor-pointer accent-emerald-600"
          />
          <button
            type="button"
            aria-label={KIT.next[lang]}
            disabled={stage === 3}
            onClick={() => setStage(stage + 1)}
            className="h-10 w-10 shrink-0 rounded-full bg-white text-lg ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-40"
          >
            ›
          </button>
        </div>
        <div className="mt-1 text-center text-xs font-medium text-slate-500">
          {TXT.stage[lang]} {stage + 1} / 4
        </div>
        {stage === 2 && (
          <p className="mt-2 text-center text-sm font-semibold text-violet-700" role="status">
            ⚡ {TXT.difference[lang]}
          </p>
        )}
      </div>

      <SortGame lang={lang} />
    </div>
  );
}

function Lane({
  title,
  who,
  stages,
  stage,
  lang,
  tone,
  highlight,
}: {
  title: string;
  who: string;
  stages: Stage[];
  stage: number;
  lang: BioLang;
  tone: "amber" | "green";
  highlight: boolean;
}) {
  const current = stages[stage]!;
  const ring = highlight ? "ring-2 ring-violet-400" : "ring-1 ring-slate-200";
  return (
    <div className={`rounded-xl bg-white p-3 ${ring}`}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={`text-sm font-semibold ${tone === "amber" ? "text-amber-800" : "text-green-800"}`}>{title}</h3>
        <span className="text-xs text-slate-500">{who}</span>
      </div>
      <ol className="mt-2 flex gap-1">
        {stages.map((s, i) => (
          <li
            key={i}
            className={`flex flex-1 items-center justify-center rounded-md px-1 py-0.5 text-center text-[11px] leading-tight font-medium ${
              i === stage ? "bg-emerald-600 text-white" : i < stage ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
            }`}
            title={s.name[lang]}
          >
            {/* the chip keeps the bare stage name; the full one is under the picture */}
            {s.name[lang].replace(/ \(.*\)$/, "")}
          </li>
        ))}
      </ol>
      <svg viewBox="0 0 120 90" className="mx-auto mt-2 h-36 w-full" role="img" aria-label={current.name[lang]}>
        {current.art}
      </svg>
      <div className="text-sm font-semibold text-slate-800">{current.name[lang]}</div>
      <p className="mt-0.5 min-h-[4.5rem] text-sm leading-relaxed text-slate-600">{current.text[lang]}</p>
    </div>
  );
}

function SortGame({ lang }: { lang: BioLang }) {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [wrong, setWrong] = useState<Record<number, boolean>>({});
  const [mistakes, setMistakes] = useState(0);
  const done = Object.keys(answers).length === SORT.length;

  const pick = (i: number, complete: boolean) => {
    if (i in answers) return;
    if (SORT[i]!.complete === complete) {
      setAnswers({ ...answers, [i]: complete });
      setWrong({ ...wrong, [i]: false });
    } else {
      setWrong({ ...wrong, [i]: true });
      setMistakes(mistakes + 1);
    }
  };
  const restart = () => {
    setAnswers({});
    setWrong({});
    setMistakes(0);
  };

  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <h3 className="text-base font-semibold text-slate-800">🔀 {TXT.sortTitle[lang]}</h3>
      <p className="mt-1 text-sm text-slate-500">{TXT.sortHint[lang]}</p>
      <ul className="mt-3 divide-y divide-slate-200">
        {SORT.map((item, i) => {
          const solved = i in answers;
          return (
            <li key={item.name.pl} className="flex flex-col gap-1.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <div className="text-[15px] font-medium text-slate-800">{item.name[lang]}</div>
                {solved && <div className="text-xs text-emerald-700">✓ {item.why[lang]}</div>}
                {!solved && wrong[i] && <div className="text-xs text-rose-700">✗ {KIT.wrong[lang]}</div>}
              </div>
              <div className="flex gap-2">
                {[true, false].map((c) => (
                  <Choice
                    key={String(c)}
                    disabled={solved}
                    state={solved && answers[i] === c ? "right" : "idle"}
                    onClick={() => pick(i, c)}
                  >
                    {c ? TXT.completeShort[lang] : TXT.incompleteShort[lang]}
                  </Choice>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      {done && (
        <div className="mt-3 space-y-3">
          <Verdict ok={mistakes === 0} lang={lang}>
            {TXT.sortDone[lang]} {mistakes}.
          </Verdict>
          <Choice onClick={restart}>↺ {KIT.again[lang]}</Choice>
        </div>
      )}
    </div>
  );
}
