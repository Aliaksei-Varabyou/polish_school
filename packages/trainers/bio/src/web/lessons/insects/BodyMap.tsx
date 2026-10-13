// Block 1: the insect's body. "Explore" lets the student tap any part of the drawing and read what it
// is for; "Label it" turns the same drawing into an exercise — pick a label, then the pin it belongs to.
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../lang.ts";
import { Choice, KIT, Verdict, type Txt } from "../kit.tsx";

type PartId = "antennae" | "eyes" | "mouth" | "head" | "thorax" | "legs" | "wings" | "abdomen" | "spiracles";

interface Part {
  name: Txt;
  text: Txt;
  /** where the pin sits in "Label it" mode; parts without a pin are explore-only */
  pin?: [number, number];
  /** a pin set off the part points at it with a leader line */
  to?: [number, number];
}

const PARTS: Record<PartId, Part> = {
  head: {
    name: { pl: "Głowa", ru: "Голова" },
    text: {
      pl: "Pierwsza część ciała. Na głowie są narządy zmysłów — czułki i oczy — oraz aparat gębowy. To „centrum dowodzenia” owada.",
      ru: "Первый отдел тела. На голове находятся органы чувств — усики и глаза — и ротовой аппарат. Это «командный пункт» насекомого.",
    },
    pin: [96, 112], to: [180, 106],
  },
  antennae: {
    name: { pl: "Czułki", ru: "Усики" },
    text: {
      pl: "Jedna para czułków to narządy dotyku i węchu. Owad wyczuwa nimi zapach kwiatów, pokarmu czy partnera. Skorupiaki mają dwie pary czułków, a pajęczaki — wcale.",
      ru: "Одна пара усиков — органы осязания и обоняния. Ими насекомое чувствует запах цветов, пищи или партнёра. У ракообразных две пары усиков, а у паукообразных их нет вовсе.",
    },
    pin: [104, 40], to: [152, 30],
  },
  eyes: {
    name: { pl: "Oczy złożone", ru: "Фасеточные глаза" },
    text: {
      pl: "Każde oko złożone składa się z setek, a nawet tysięcy drobnych oczek. Owad widzi obraz mozaikowy — jak ułożony z kafelków — ale świetnie zauważa ruch.",
      ru: "Каждый фасеточный глаз состоит из сотен и даже тысяч крошечных глазков. Насекомое видит мозаичное изображение — как будто из плиточек, — зато отлично замечает движение.",
    },
    pin: [304, 84], to: [232, 90],
  },
  mouth: {
    name: { pl: "Aparat gębowy", ru: "Ротовой аппарат" },
    text: {
      pl: "Narządy do pobierania pokarmu. Ich budowa zależy od tego, co owad je: inne są u konika polnego, inne u motyla czy komara. Zobaczysz to w laboratorium poniżej.",
      ru: "Органы для захвата и поедания пищи. Их строение зависит от того, чем питается насекомое: у кузнечика они одни, у бабочки и комара — совсем другие. Это ты увидишь в лаборатории ниже.",
    },
    pin: [254, 26], to: [204, 60],
  },
  thorax: {
    name: { pl: "Tułów", ru: "Грудь" },
    text: {
      pl: "Środkowa część ciała, zbudowana z trzech segmentów. Do każdego segmentu przyczepiona jest jedna para odnóży, a do drugiego i trzeciego — zwykle po parze skrzydeł. Tułów to „silnik” owada.",
      ru: "Средний отдел тела, состоит из трёх сегментов. К каждому сегменту прикреплена одна пара ног, а ко второму и третьему — обычно по паре крыльев. Грудь — «двигатель» насекомого.",
    },
    pin: [318, 182], to: [228, 168],
  },
  legs: {
    name: { pl: "Odnóża", ru: "Ноги" },
    text: {
      pl: "Owad ma trzy pary odnóży członowanych — po jednej parze na każdym segmencie tułowia. Sześć nóg to najważniejsza cecha, po której rozpoznasz owada.",
      ru: "У насекомого три пары членистых ног — по одной паре на каждом сегменте груди. Шесть ног — главный признак, по которому узнают насекомое.",
    },
    pin: [86, 236], to: [96, 204],
  },
  wings: {
    name: { pl: "Skrzydła", ru: "Крылья" },
    text: {
      pl: "Większość owadów ma dwie pary skrzydeł. To wyrostki powłoki ciała na tułowiu, a nie przekształcone odnóża. Owady to jedyne bezkręgowce, które potrafią latać.",
      ru: "У большинства насекомых две пары крыльев. Это выросты покровов на груди, а не видоизменённые ноги. Насекомые — единственные беспозвоночные, способные летать.",
    },
    pin: [52, 134],
  },
  abdomen: {
    name: { pl: "Odwłok", ru: "Брюшко" },
    text: {
      pl: "Tylna, najdłuższa część ciała, zbudowana z wielu segmentów i pozbawiona odnóży. Mieści większość narządów wewnętrznych: przewód pokarmowy i narządy rozrodcze.",
      ru: "Задний, самый длинный отдел тела. Состоит из многих сегментов и не имеет ног. В нём находится большая часть внутренних органов: пищеварительная трубка и половые органы.",
    },
    pin: [200, 300],
  },
  spiracles: {
    name: { pl: "Przetchlinki i tchawki", ru: "Дыхальца и трахеи" },
    text: {
      pl: "Na bokach ciała są małe otworki — przetchlinki. Prowadzą do tchawek: rozgałęzionych rurek, które dostarczają powietrze prosto do wszystkich narządów. Owad nie ma płuc i nie oddycha przez usta.",
      ru: "По бокам тела есть маленькие отверстия — дыхальца. Они ведут в трахеи — ветвящиеся трубочки, которые доставляют воздух прямо ко всем органам. Лёгких у насекомого нет, и ртом оно не дышит.",
    },
  },
};

const LABEL_ORDER: PartId[] = ["thorax", "antennae", "abdomen", "mouth", "legs", "eyes", "wings", "head"];

const TXT = {
  explore: { pl: "Poznaj", ru: "Изучи" },
  label: { pl: "Podpisz sam", ru: "Подпиши сам" },
  tapHint: {
    pl: "Dotknij dowolnej części owada, żeby dowiedzieć się, do czego służy.",
    ru: "Нажми на любую часть насекомого, чтобы узнать, для чего она нужна.",
  },
  labelHint: {
    pl: "Wybierz podpis, a potem dotknij właściwej pinezki na rysunku.",
    ru: "Выбери подпись, а потом нажми на нужную метку на рисунке.",
  },
  pickFirst: { pl: "Najpierw wybierz podpis z listy.", ru: "Сначала выбери подпись из списка." },
  wrongPin: { pl: "ta pinezka wskazuje inną część. Spróbuj jeszcze raz.", ru: "эта метка указывает на другую часть. Попробуй ещё раз." },
  done: { pl: "Wszystko podpisane! Pomyłek:", ru: "Всё подписано! Ошибок:" },
  tracheae: { pl: "Na rysunku widać sieć tchawek (niebieskie).", ru: "На рисунке видна сеть трахей (синие)." },
} satisfies Record<string, Txt>;

export function BodyMap({ lang }: { lang: BioLang }) {
  const [mode, setMode] = useState<"explore" | "label">("explore");
  return (
    <div>
      <div className="mb-4 flex gap-2" role="radiogroup">
        {(["explore", "label"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              mode === m ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {TXT[m][lang]}
          </button>
        ))}
      </div>
      {mode === "explore" ? <Explore lang={lang} /> : <LabelGame lang={lang} />}
    </div>
  );
}

function Explore({ lang }: { lang: BioLang }) {
  const [picked, setPicked] = useState<PartId | null>(null);
  const part = picked ? PARTS[picked] : null;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Insect lang={lang} active={picked} onPick={setPicked} showTracheae={picked === "spiracles"} />
      <div className="sm:sticky sm:top-4" aria-live="polite">
        {part ? (
          <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
            <h3 className="text-base font-semibold text-emerald-900">{part.name[lang]}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{part.text[lang]}</p>
            {picked === "spiracles" && <p className="mt-2 text-sm text-sky-700">{TXT.tracheae[lang]}</p>}
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-[15px] text-slate-600 ring-1 ring-slate-200">👆 {TXT.tapHint[lang]}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(Object.keys(PARTS) as PartId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPicked(id)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                picked === id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
              }`}
            >
              {PARTS[id].name[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LabelGame({ lang }: { lang: BioLang }) {
  const [chosen, setChosen] = useState<PartId | null>(null);
  const [placed, setPlaced] = useState<PartId[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const done = placed.length === LABEL_ORDER.length;

  const tryPin = (target: PartId) => {
    if (placed.includes(target)) return;
    if (!chosen) {
      setMessage({ ok: false, text: TXT.pickFirst[lang] });
      return;
    }
    if (chosen === target) {
      setPlaced([...placed, target]);
      setMessage({ ok: true, text: PARTS[target].name[lang] });
      setChosen(null);
    } else {
      setMistakes(mistakes + 1);
      setMessage({ ok: false, text: `${PARTS[chosen].name[lang]} — ${TXT.wrongPin[lang]}` });
    }
  };
  const reset = () => {
    setChosen(null);
    setPlaced([]);
    setMistakes(0);
    setMessage(null);
  };

  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Insect
        lang={lang}
        active={null}
        pins={LABEL_ORDER.map((id) => ({ id, at: PARTS[id].pin!, to: PARTS[id].to, label: placed.includes(id) ? PARTS[id].name[lang] : null }))}
        onPin={tryPin}
      />
      <div className="space-y-3">
        <p className="text-[15px] text-slate-600">{TXT.labelHint[lang]}</p>
        <div className="flex flex-wrap gap-2">
          {LABEL_ORDER.filter((id) => !placed.includes(id)).map((id) => (
            <Choice key={id} state={chosen === id ? "active" : "idle"} onClick={() => setChosen(id)}>
              {PARTS[id].name[lang]}
            </Choice>
          ))}
        </div>
        {done ? (
          <div className="space-y-3">
            <Verdict ok lang={lang}>
              {TXT.done[lang]} {mistakes}.
            </Verdict>
            <Choice onClick={reset}>↺ {KIT.again[lang]}</Choice>
          </div>
        ) : (
          message && (
            <Verdict ok={message.ok} lang={lang}>
              {message.text}
            </Verdict>
          )
        )}
      </div>
    </div>
  );
}

// ---------- the drawing ----------

interface Pin {
  id: PartId;
  at: [number, number];
  to?: [number, number];
  label: string | null;
}

const MIRROR = "matrix(-1 0 0 1 400 0)";

/** half-width of the abdomen ellipse at height y */
const abdomenHalf = (y: number) => 42 * Math.sqrt(Math.max(0, 1 - ((y - 300) / 86) ** 2));
const SEGMENTS = [232, 256, 280, 304, 328, 352, 372];

function Insect({
  lang,
  active,
  onPick,
  pins,
  onPin,
  showTracheae = false,
}: {
  lang: BioLang;
  active: PartId | null;
  onPick?: (id: PartId) => void;
  pins?: Pin[];
  onPin?: (id: PartId) => void;
  showTracheae?: boolean;
}) {
  // in explore mode every part is a button; in label mode only the pins are
  const part = (id: PartId, children: ReactNode) => {
    const on = active === id;
    if (!onPick) return <g data-part={id}>{children}</g>;
    return (
      <g
        data-part={id}
        role="button"
        tabIndex={0}
        aria-label={PARTS[id].name[lang]}
        aria-pressed={on}
        onClick={() => onPick(id)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(id))}
        className="cursor-pointer outline-none [&:focus-visible>*]:stroke-indigo-500"
        style={on ? { filter: "drop-shadow(0 0 4px #10b981)" } : undefined}
      >
        {children}
      </g>
    );
  };
  const tone = (id: PartId, base: string) => (active === id ? "#6ee7b7" : base);

  return (
    <svg viewBox="0 0 400 460" className="mx-auto w-full max-w-[380px] select-none" role="img" aria-label={lang === "pl" ? "Budowa owada" : "Строение насекомого"}>
      <defs>
        <pattern id="facets" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.7" fill="#0f172a" opacity="0.55" />
        </pattern>
      </defs>

      {part(
        "wings",
        <>
          {[undefined, MIRROR].map((tr, i) => (
            <g key={i} transform={tr} fill={tone("wings", "#e0f2fe")} fillOpacity={0.75} stroke="#7dd3fc" strokeWidth={2}>
              <path d="M176 156 C 120 118, 52 100, 24 124 C 14 148, 70 178, 174 172 Z" />
              <path d="M176 190 C 122 196, 52 222, 40 254 C 56 276, 130 238, 176 202 Z" />
              <path d="M170 160 C 120 140, 70 128, 34 128 M170 166 C 120 160, 80 156, 44 150 M170 196 C 120 212, 80 232, 52 252" fill="none" strokeWidth={1.2} />
            </g>
          ))}
        </>,
      )}

      {part(
        "legs",
        <>
          {[undefined, MIRROR].map((tr, i) => (
            <g key={i} transform={tr} fill="none" stroke={tone("legs", "#57534e")} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M182 138 L 140 120 L 118 86 L 108 76" />
              <path d="M172 168 L 118 160 L 92 200 L 84 216" />
              <path d="M174 200 L 128 236 L 112 300 L 108 320" />
              {/* a wide invisible stroke makes thin legs easy to tap */}
              <path d="M182 138 L 140 120 L 118 86 M172 168 L 118 160 L 92 200 M174 200 L 128 236 L 112 300" stroke="transparent" strokeWidth={18} />
            </g>
          ))}
        </>,
      )}

      {part(
        "abdomen",
        <>
          <ellipse cx={200} cy={300} rx={42} ry={86} fill={tone("abdomen", "#a3a3a3")} stroke="#44403c" strokeWidth={2.5} />
          {SEGMENTS.map((y) => {
            const w = abdomenHalf(y);
            return <path key={y} d={`M${200 - w} ${y} Q200 ${y + 9} ${200 + w} ${y}`} fill="none" stroke="#57534e" strokeWidth={1.5} />;
          })}
        </>,
      )}

      {part(
        "thorax",
        <g stroke="#44403c" strokeWidth={2.5}>
          <ellipse cx={200} cy={198} rx={30} ry={15} fill={tone("thorax", "#78716c")} />
          <ellipse cx={200} cy={167} rx={32} ry={18} fill={tone("thorax", "#78716c")} />
          <ellipse cx={200} cy={137} rx={22} ry={13} fill={tone("thorax", "#78716c")} />
        </g>,
      )}

      {part("head", <ellipse cx={200} cy={98} rx={30} ry={25} fill={tone("head", "#57534e")} stroke="#292524" strokeWidth={2.5} />)}

      {part(
        "eyes",
        <>
          {[177, 223].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={92} rx={11} ry={14} fill={tone("eyes", "#b45309")} stroke="#292524" strokeWidth={2} />
              <ellipse cx={cx} cy={92} rx={11} ry={14} fill="url(#facets)" pointerEvents="none" />
            </g>
          ))}
        </>,
      )}

      {part(
        "mouth",
        <>
          {[undefined, MIRROR].map((tr, i) => (
            <path key={i} transform={tr} d="M194 76 C 184 68, 184 58, 193 52 L 197 57 C 192 61, 193 67, 199 73 Z" fill={tone("mouth", "#292524")} stroke="#292524" strokeWidth={1.5} />
          ))}
        </>,
      )}

      {part(
        "antennae",
        <>
          {[undefined, MIRROR].map((tr, i) => (
            <g key={i} transform={tr} fill="none" strokeLinecap="round">
              <path d="M188 78 C 178 52, 162 32, 140 14" stroke={tone("antennae", "#292524")} strokeWidth={3.5} strokeDasharray="7 2" />
              <path d="M188 78 C 178 52, 162 32, 140 14" stroke="transparent" strokeWidth={18} />
            </g>
          ))}
        </>,
      )}

      {part(
        "spiracles",
        <>
          {[...SEGMENTS.slice(0, 6).map((y) => [y - 11, abdomenHalf(y - 11) - 7] as const), [167, 26] as const].map(([y, dx]) =>
            [-1, 1].map((s) => (
              <circle key={`${y}${s}`} cx={200 + s * dx} cy={y} r={active === "spiracles" ? 4.5 : 3.2} fill={active === "spiracles" ? "#0284c7" : "#1c1917"} stroke="#fafaf9" strokeWidth={1} />
            )),
          )}
        </>,
      )}

      {showTracheae && <Tracheae />}

      {pins?.map(
        (p) =>
          p.to && (
            <g key={`${p.id}-leader`} pointerEvents="none">
              <path d={`M${p.at[0]} ${p.at[1]} L ${p.to[0]} ${p.to[1]}`} stroke={p.label ? "#059669" : "#4f46e5"} strokeWidth={2} />
              <circle cx={p.to[0]} cy={p.to[1]} r={3.5} fill={p.label ? "#059669" : "#4f46e5"} stroke="white" strokeWidth={1.5} />
            </g>
          ),
      )}
      {pins?.map((p) => (
        <g
          key={p.id}
          role="button"
          tabIndex={0}
          aria-label={p.label ?? `${lang === "pl" ? "Pinezka" : "Метка"} ${LABEL_ORDER.indexOf(p.id) + 1}`}
          onClick={() => onPin?.(p.id)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPin?.(p.id))}
          className="cursor-pointer outline-none"
        >
          {p.label ? (
            <>
              <rect x={p.at[0] - p.label.length * 4.4 - 8} y={p.at[1] - 13} width={p.label.length * 8.8 + 16} height={26} rx={13} fill="#059669" />
              <text x={p.at[0]} y={p.at[1] + 5} textAnchor="middle" fontSize={15} fontWeight={600} fill="white">
                {p.label}
              </text>
            </>
          ) : (
            <>
              <circle cx={p.at[0]} cy={p.at[1]} r={18} fill="#4f46e5" stroke="white" strokeWidth={3} />
              <text x={p.at[0]} y={p.at[1] + 6} textAnchor="middle" fontSize={17} fontWeight={700} fill="white">
                {LABEL_ORDER.indexOf(p.id) + 1}
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

/** the air tubes, drawn over the body when the spiracles are chosen */
function Tracheae() {
  const branches = [...SEGMENTS.slice(0, 6).map((y) => [y - 11, abdomenHalf(y - 11) - 7] as const), [167, 26] as const];
  return (
    <g pointerEvents="none" fill="none" stroke="#0ea5e9" strokeWidth={2.5} strokeLinecap="round" opacity={0.9}>
      <path d="M188 112 C 186 160, 184 250, 190 368 M212 112 C 214 160, 216 250, 210 368" />
      {branches.map(([y, dx]) =>
        [-1, 1].map((s) => (
          <g key={`${y}${s}`}>
            <path d={`M${200 + s * dx} ${y} L ${200 + s * 12} ${y + 2}`} />
            <path d={`M${200 + s * (dx - 6)} ${y} l ${s * -4} 10 M${200 + s * 14} ${y + 2} l ${s * 6} 12`} strokeWidth={1.4} />
          </g>
        )),
      )}
      <path d="M190 112 C 180 104, 176 100, 172 96 M210 112 C 220 104, 224 100, 228 96" strokeWidth={1.6} />
    </g>
  );
}
