// Block 2: from spawn to frog. A slider walks through six stages; a table of traits below marks
// what changed since the previous stage, so the switch from gills to lungs and from water to land
// is visible step by step.
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../lang.ts";
import { KIT, type Txt } from "@portal/lessons";

type Trait = "breath" | "limbs" | "tail" | "home" | "food";

interface Stage {
  name: Txt;
  text: Txt;
  art: ReactNode;
  traits: Record<Trait, Txt>;
}

const TRAITS: Record<Trait, Txt> = {
  breath: { pl: "Oddycha", ru: "Дышит" },
  limbs: { pl: "Kończyny", ru: "Конечности" },
  tail: { pl: "Ogon", ru: "Хвост" },
  home: { pl: "Żyje", ru: "Живёт" },
  food: { pl: "Je", ru: "Ест" },
};

const DASH: Txt = { pl: "—", ru: "—" };
const GILLS: Txt = { pl: "skrzelami", ru: "жабрами" };
const NONE: Txt = { pl: "brak", ru: "нет" };
const WATER: Txt = { pl: "w wodzie", ru: "в воде" };
const ALGAE: Txt = { pl: "glony", ru: "водоросли" };
const YES: Txt = { pl: "jest", ru: "есть" };

// ---------- drawings (viewBox 0 0 240 140) ----------

const WATER_BG = <rect x={0} y={0} width={240} height={140} rx={10} fill="#e0f2fe" />;

function tadpole({ extGills = false, hind = false, front = false, tail = 1 }: { extGills?: boolean; hind?: boolean; front?: boolean; tail?: number }) {
  const end = 124 + 86 * tail;
  return (
    <>
      {WATER_BG}
      {tail > 0 && <path d={`M122 62 C 150 54, 182 60, ${end} 70 C 182 80, 150 86, 122 78 Z`} fill="#57534e" opacity={0.85} />}
      {hind && <path d="M116 84 L 130 100 L 120 110 M120 110 l -8 2 M120 110 l -2 8" fill="none" stroke="#44403c" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />}
      {front && <path d="M86 86 L 82 102 L 74 106" fill="none" stroke="#44403c" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />}
      <ellipse cx={100} cy={70} rx={28} ry={21} fill="#3f3f46" />
      <circle cx={82} cy={62} r={4} fill="white" />
      <circle cx={81} cy={62} r={2} fill="#0f172a" />
      {extGills && <path d="M96 50 l -8 -12 M100 49 l -3 -14 M104 50 l 3 -13 M96 50 l -12 -6 M104 50 l 10 -9" stroke="#e11d48" strokeWidth={2.5} strokeLinecap="round" />}
    </>
  );
}

const SPAWN = (
  <>
    {WATER_BG}
    {[
      [70, 60], [88, 52], [106, 58], [124, 50], [142, 58], [160, 52], [80, 78], [98, 74], [116, 78], [134, 72], [152, 78], [170, 72], [92, 94], [110, 92], [128, 96], [146, 92],
    ].map(([x, y]) => (
      <g key={`${x}-${y}`}>
        <circle cx={x} cy={y} r={10} fill="white" opacity={0.75} stroke="#93c5fd" strokeWidth={1} />
        <circle cx={x} cy={y} r={3.5} fill="#1c1917" />
      </g>
    ))}
  </>
);

const FROGLET = (
  <>
    {WATER_BG}
    <path d="M110 140 L 110 112 C 150 102, 210 100, 240 104 L 240 130 C 240 136, 236 140, 230 140 Z" fill="#86efac" />
    <g transform="translate(96 40) scale(0.36)">
      <ellipse cx={226} cy={150} rx={88} ry={50} transform="rotate(-10 226 150)" fill="#65a30d" />
      <ellipse cx={128} cy={150} rx={50} ry={32} transform="rotate(8 128 150)" fill="#65a30d" />
      <ellipse cx={292} cy={184} rx={46} ry={24} transform="rotate(25 292 184)" fill="#4d7c0f" />
      <path d="M160 170 L 150 205 L 138 226" stroke="#4d7c0f" strokeWidth={13} strokeLinecap="round" fill="none" />
      <circle cx={130} cy={114} r={17} fill="#4d7c0f" />
      <circle cx={128} cy={112} r={11} fill="#fbbf24" />
      <ellipse cx={128} cy={112} rx={7} ry={4} fill="#1c1917" />
    </g>
    <g transform="translate(110 58)">
      <ellipse cx={0} cy={0} rx={5} ry={3} fill="#1c1917" />
      <ellipse cx={-2} cy={-4} rx={4} ry={2.5} fill="white" opacity={0.9} />
    </g>
  </>
);

const STAGES: Stage[] = [
  {
    name: { pl: "Skrzek", ru: "Икра" },
    text: {
      pl: "Wiosną samica składa w wodzie skrzek — jaja w galaretowatej osłonce — a samiec od razu polewa je nasieniem. To zapłodnienie zewnętrzne. Galareta chroni jaja, ale nie przed wyschnięciem: skrzek musi leżeć w wodzie.",
      ru: "Весной самка откладывает в воду икру — яйца в студенистой оболочке, — а самец сразу поливает их семенной жидкостью. Это наружное оплодотворение. Студень защищает яйца, но не от высыхания: икра должна лежать в воде.",
    },
    art: SPAWN,
    traits: { breath: DASH, limbs: DASH, tail: DASH, home: WATER, food: DASH },
  },
  {
    name: { pl: "Kijanka ze skrzelami zewnętrznymi", ru: "Головастик с наружными жабрами" },
    text: {
      pl: "Z jaja wylęga się kijanka. Ma ogon i pierzaste skrzela wystające z boków głowy. Nie ma kończyn. Zeskrobuje glony z roślin i kamieni.",
      ru: "Из яйца выходит головастик. У него есть хвост и перистые жабры, торчащие по бокам головы. Конечностей нет. Он соскребает водоросли с растений и камней.",
    },
    art: tadpole({ extGills: true }),
    traits: { breath: { pl: "skrzelami zewnętrznymi", ru: "наружными жабрами" }, limbs: NONE, tail: YES, home: WATER, food: ALGAE },
  },
  {
    name: { pl: "Kijanka", ru: "Головастик" },
    text: {
      pl: "Skrzela chowają się pod fałdem skóry. Kijanka pływa, machając ogonem, i ma linię boczną — zupełnie jak ryba. Dlatego mówi się, że płazy pochodzą od ryb.",
      ru: "Жабры прячутся под складкой кожи. Головастик плавает, работая хвостом, и у него есть боковая линия — совсем как у рыбы. Поэтому говорят, что земноводные произошли от рыб.",
    },
    art: tadpole({}),
    traits: { breath: GILLS, limbs: NONE, tail: YES, home: WATER, food: ALGAE },
  },
  {
    name: { pl: "Kijanka z kończynami tylnymi", ru: "Головастик с задними ногами" },
    text: {
      pl: "Najpierw wyrastają kończyny tylne. Kijanka nadal oddycha skrzelami i pływa dzięki ogonowi.",
      ru: "Сначала вырастают задние ноги. Головастик по-прежнему дышит жабрами и плавает с помощью хвоста.",
    },
    art: tadpole({ hind: true }),
    traits: { breath: GILLS, limbs: { pl: "tylne", ru: "задние" }, tail: YES, home: WATER, food: ALGAE },
  },
  {
    name: { pl: "Kijanka z czterema kończynami", ru: "Головастик с четырьмя ногами" },
    text: {
      pl: "Pojawiają się kończyny przednie i rozwijają się płuca — kijanka coraz częściej wypływa po powietrze. Przestaje jeść, a jej ogon się skraca: organizm czerpie z niego budulec.",
      ru: "Появляются передние ноги и развиваются лёгкие — головастик всё чаще всплывает за воздухом. Он перестаёт есть, а хвост укорачивается: организм использует его как запас строительного материала.",
    },
    art: tadpole({ hind: true, front: true, tail: 0.45 }),
    traits: {
      breath: { pl: "skrzelami i płucami", ru: "жабрами и лёгкими" },
      limbs: { pl: "cztery", ru: "четыре" },
      tail: { pl: "skraca się", ru: "укорачивается" },
      home: WATER,
      food: { pl: "nie je", ru: "не ест" },
    },
  },
  {
    name: { pl: "Młoda żaba", ru: "Молодая лягушка" },
    text: {
      pl: "Ogon zniknął. Młoda żaba oddycha płucami i skórą, wychodzi na ląd i poluje na drobne owady. Przeobrażenie zakończone — od skrzeku minęło około trzech miesięcy.",
      ru: "Хвост исчез. Молодая лягушка дышит лёгкими и кожей, выходит на сушу и охотится на мелких насекомых. Превращение закончено — с момента откладки икры прошло около трёх месяцев.",
    },
    art: FROGLET,
    traits: {
      breath: { pl: "płucami i skórą", ru: "лёгкими и кожей" },
      limbs: { pl: "cztery", ru: "четыре" },
      tail: NONE,
      home: { pl: "na lądzie i w wodzie", ru: "на суше и в воде" },
      food: { pl: "owady", ru: "насекомые" },
    },
  },
];

const T = {
  stage: { pl: "Etap", ru: "Этап" },
  prev: { pl: "Wstecz", ru: "Назад" },
  changed: { pl: "zmiana", ru: "изменилось" },
} satisfies Record<string, Txt>;

export function TadpoleGrowth({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const stage = STAGES[i]!;
  const before = i > 0 ? STAGES[i - 1] : undefined;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 240 140" className="w-full" role="img" aria-label={stage.name[lang]}>
          {stage.art}
        </svg>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            aria-label={T.prev[lang]}
            disabled={i === 0}
            onClick={() => setI(i - 1)}
            className="h-10 w-10 shrink-0 rounded-full bg-white text-lg ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-40"
          >
            ‹
          </button>
          <input
            type="range"
            min={0}
            max={STAGES.length - 1}
            step={1}
            value={i}
            onChange={(e) => setI(Number(e.target.value))}
            aria-label={T.stage[lang]}
            aria-valuetext={`${T.stage[lang]} ${i + 1}: ${stage.name[lang]}`}
            className="h-2 flex-1 cursor-pointer accent-emerald-600"
          />
          <button
            type="button"
            aria-label={KIT.next[lang]}
            disabled={i === STAGES.length - 1}
            onClick={() => setI(i + 1)}
            className="h-10 w-10 shrink-0 rounded-full bg-white text-lg ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-40"
          >
            ›
          </button>
        </div>
        <div className="mt-1 text-center text-xs font-medium text-slate-500">
          {T.stage[lang]} {i + 1} / {STAGES.length}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-900">{stage.name[lang]}</h3>
        <p className="mt-1 min-h-[6rem] text-[15px] leading-relaxed text-slate-600">{stage.text[lang]}</p>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {(Object.keys(TRAITS) as Trait[]).map((trait) => {
              const changed = before !== undefined && before.traits[trait].pl !== stage.traits[trait].pl;
              return (
                <tr key={trait} className="border-t border-slate-200">
                  <th scope="row" className="w-28 py-1.5 pr-2 text-left font-medium text-slate-500">
                    {TRAITS[trait][lang]}
                  </th>
                  <td className={`py-1.5 ${changed ? "font-semibold text-violet-700" : "text-slate-800"}`}>
                    {stage.traits[trait][lang]}
                    {changed && <span className="ml-2 rounded-full bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">{T.changed[lang]}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
