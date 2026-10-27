// Block 2: "Is it an insect?" A short key leads the student through the features that tell the
// arthropod groups apart — jointed legs, the number of leg pairs, the antennae — one animal at a
// time. A wrong step is not skipped: the hint explains what to look at and the student tries again.
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../lang.ts";
import { Choice, KIT, Verdict, type Txt } from "@portal/lessons";

type Group = "insect" | "arachnid" | "crustacean" | "other";
type Pairs = 3 | 4 | 5;
type Antennae = 0 | 1 | 2;

interface Animal {
  id: string;
  name: Txt;
  art: ReactNode;
  jointed: boolean;
  pairs?: Pairs;
  antennae?: Antennae;
  group: Group;
  note: Txt;
}

const GROUPS: Record<Group, Txt> = {
  insect: { pl: "Owad", ru: "Насекомое" },
  arachnid: { pl: "Pajęczak", ru: "Паукообразное" },
  crustacean: { pl: "Skorupiak", ru: "Ракообразное" },
  other: { pl: "To nie stawonóg", ru: "Это не членистоногое" },
};

const TXT = {
  card: { pl: "Zwierzę", ru: "Животное" },
  of: { pl: "z", ru: "из" },
  q0: { pl: "Czy ma odnóża członowane?", ru: "Есть ли у него членистые ноги?" },
  q1: { pl: "Ile ma par odnóży krocznych?", ru: "Сколько у него пар ходильных ног?" },
  q2: { pl: "Ile ma par czułków?", ru: "Сколько у него пар усиков?" },
  yes: { pl: "Tak", ru: "Да" },
  no: { pl: "Nie", ru: "Нет" },
  pairs3: { pl: "3 pary", ru: "3 пары" },
  pairs4: { pl: "4 pary", ru: "4 пары" },
  pairs5: { pl: "więcej niż 4 pary", ru: "больше 4 пар" },
  ant0: { pl: "brak", ru: "нет" },
  ant1: { pl: "1 para", ru: "1 пара" },
  ant2: { pl: "2 pary", ru: "2 пары" },
  h0: {
    pl: "Przyjrzyj się rysunkowi: czy widać nogi zbudowane z ruchomych odcinków?",
    ru: "Посмотри на рисунок: видны ли ноги, состоящие из подвижных члеников?",
  },
  h1: {
    pl: "Policz odnóża po jednej stronie ciała — tyle jest par. Szczypce też są odnóżami!",
    ru: "Посчитай ноги на одной стороне тела — столько и пар. Клешни — тоже ноги!",
  },
  h2: {
    pl: "Spójrz na przód ciała. Czułki to długie, cienkie wyrostki na głowie — czasem jedna para jest bardzo krótka.",
    ru: "Посмотри на передний конец тела. Усики — длинные тонкие выросты на голове; иногда одна пара совсем короткая.",
  },
  result: { pl: "To jest:", ru: "Это:" },
  finish: { pl: "Zobacz podsumowanie", ru: "Посмотреть итог" },
  summary: { pl: "Bez pomyłek rozpoznano:", ru: "Без ошибок определено:" },
} satisfies Record<string, Txt>;

// ---------- drawings: simple top views, drawn so the legs can be counted ----------

const M = "matrix(-1 0 0 1 200 0)";
/** draws the left-side paths and their mirror image */
const both = (node: ReactNode) => (
  <>
    <g>{node}</g>
    <g transform={M}>{node}</g>
  </>
);
const legs = (paths: string[], color: string, width = 3.5) =>
  both(
    <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>,
  );

const ANT = (
  <>
    {legs(["M93 64 L 72 52 L 58 34", "M92 76 L 66 80 L 48 98", "M93 86 L 72 108 L 62 142"], "#3f2a1d")}
    {legs(["M95 34 L 86 18 L 68 10"], "#3f2a1d", 2.5)}
    <ellipse cx={100} cy={128} rx={20} ry={27} fill="#4a3426" />
    <circle cx={100} cy={97} r={4} fill="#4a3426" />
    <ellipse cx={100} cy={74} rx={9} ry={17} fill="#5b4031" />
    <ellipse cx={100} cy={42} rx={13} ry={12} fill="#4a3426" />
    {both(<path d="M95 31 L 92 24" stroke="#3f2a1d" strokeWidth={3} strokeLinecap="round" />)}
  </>
);

const SPIDER = (
  <>
    {legs(["M82 64 L 56 40 L 40 12", "M80 74 L 48 62 L 20 56", "M80 86 L 48 100 L 22 118", "M84 96 L 60 128 L 46 170"], "#44403c")}
    <ellipse cx={100} cy={142} rx={30} ry={36} fill="#78716c" />
    <path d="M100 116 L 100 168 M86 132 L 114 132 M90 150 L 110 150" stroke="#e7e5e4" strokeWidth={3} strokeLinecap="round" />
    <ellipse cx={100} cy={78} rx={22} ry={24} fill="#57534e" />
    {both(<ellipse cx={94} cy={54} rx={4} ry={6} fill="#292524" />)}
  </>
);

const CRAYFISH = (
  <>
    {legs(["M94 52 C 80 22, 60 10, 28 4", "M97 52 L 90 36 L 82 30"], "#78350f", 2)}
    {legs(
      ["M80 80 L 58 86 L 46 98", "M80 92 L 58 104 L 48 118", "M81 102 L 60 118 L 52 134", "M84 110 L 66 130 L 60 146", "M84 64 L 64 52 L 58 36"],
      "#92400e",
    )}
    {both(<path d="M58 38 C 40 32, 40 8, 54 2 C 60 10, 52 18, 62 26 C 66 18, 70 26, 64 38 Z" fill="#a16207" stroke="#78350f" strokeWidth={1.5} />)}
    {[124, 140, 156, 170, 183].map((y, i) => (
      <ellipse key={y} cx={100} cy={y} rx={17 - i * 1.6} ry={8} fill="#a16207" stroke="#78350f" strokeWidth={1.5} />
    ))}
    <path d="M100 190 L 80 210 L 92 214 L 100 206 L 108 214 L 120 210 Z" fill="#a16207" stroke="#78350f" strokeWidth={1.5} />
    <ellipse cx={100} cy={84} rx={22} ry={34} fill="#b45309" stroke="#78350f" strokeWidth={1.5} />
    {both(<circle cx={92} cy={50} r={3.5} fill="#1c1917" />)}
  </>
);

const TICK = (
  <>
    {legs(["M74 82 L 54 66 L 44 50", "M72 94 L 48 90 L 32 80", "M72 108 L 48 116 L 32 126", "M75 122 L 56 142 L 46 160"], "#450a0a", 4)}
    <ellipse cx={100} cy={112} rx={34} ry={44} fill="#991b1b" />
    <ellipse cx={100} cy={86} rx={22} ry={20} fill="#450a0a" />
    <path d="M92 66 L 100 50 L 108 66 Z" fill="#450a0a" />
  </>
);

const BUTTERFLY = (
  <>
    {both(
      <g stroke="#9a3412" strokeWidth={1.5}>
        <path d="M94 58 C 70 18, 18 22, 12 50 C 10 80, 60 86, 94 74 Z" fill="#fb923c" />
        <path d="M94 76 C 60 86, 26 110, 40 140 C 60 156, 84 122, 96 92 Z" fill="#fdba74" />
        <circle cx={40} cy={46} r={7} fill="#1c1917" stroke="none" />
      </g>,
    )}
    {legs(["M95 60 L 82 54 L 76 44", "M94 68 L 80 70 L 72 80", "M95 76 L 84 88 L 80 100"], "#1c1917", 2)}
    {both(
      <g>
        <path d="M97 38 C 90 22, 84 14, 78 8" fill="none" stroke="#1c1917" strokeWidth={1.8} />
        <circle cx={78} cy={8} r={3} fill="#1c1917" />
      </g>,
    )}
    <ellipse cx={100} cy={110} rx={6} ry={28} fill="#292524" />
    <ellipse cx={100} cy={66} rx={7} ry={14} fill="#292524" />
    <circle cx={100} cy={44} r={7} fill="#292524" />
  </>
);

const woodliceEdge = (y: number) => 100 - 36 * Math.sqrt(Math.max(0, 1 - ((y - 112) / 62) ** 2));
const WOODLOUSE = (
  <>
    {legs(
      [72, 85, 98, 111, 124, 137, 150].map((y) => {
        const x = woodliceEdge(y) + 4;
        return `M${x} ${y} L ${x - 14} ${y + 2} L ${x - 20} ${y + 9}`;
      }),
      "#334155",
      3,
    )}
    {legs(["M90 56 C 76 38, 64 28, 52 16", "M96 52 L 93 44"], "#334155", 2.5)}
    <ellipse cx={100} cy={112} rx={36} ry={62} fill="#64748b" />
    {[66, 80, 94, 108, 122, 136, 150, 160].map((y) => {
      const x = woodliceEdge(y);
      return <path key={y} d={`M${x} ${y} Q100 ${y + 6} ${200 - x} ${y}`} fill="none" stroke="#334155" strokeWidth={1.5} />;
    })}
  </>
);

const EARTHWORM = (
  <>
    <rect x={88} y={12} width={24} height={196} rx={12} fill="#f9a8d4" stroke="#be185d" strokeWidth={1.5} />
    <rect x={87} y={58} width={26} height={24} rx={6} fill="#ec4899" />
    {Array.from({ length: 26 }, (_, i) => 20 + i * 7.3).map((y) => (
      <path key={y} d={`M89 ${y} Q100 ${y + 3} 111 ${y}`} fill="none" stroke="#be185d" strokeWidth={0.9} opacity={0.7} />
    ))}
  </>
);

const MOSQUITO = (
  <>
    {both(<path d="M93 64 C 70 70, 40 110, 44 130 C 52 134, 80 100, 95 74 Z" fill="#e2e8f0" fillOpacity={0.8} stroke="#94a3b8" strokeWidth={1.2} />)}
    {legs(["M93 62 L 64 46 L 30 18", "M92 70 L 52 82 L 12 94", "M93 76 L 64 112 L 40 192"], "#44403c", 1.8)}
    {both(<path d="M96 44 L 84 28 M90 36 l -6 2 M88 33 l -4 -4 M86 30 l -6 0" stroke="#44403c" strokeWidth={1.5} strokeLinecap="round" />)}
    <path d="M100 41 L 100 12" stroke="#292524" strokeWidth={2} strokeLinecap="round" />
    <ellipse cx={100} cy={118} rx={6} ry={36} fill="#57534e" />
    <ellipse cx={100} cy={68} rx={10} ry={12} fill="#44403c" />
    <circle cx={100} cy={48} r={7} fill="#292524" />
  </>
);

const ANIMALS: Animal[] = [
  {
    id: "ant",
    name: { pl: "Mrówka", ru: "Муравей" },
    art: ANT,
    jointed: true,
    pairs: 3,
    antennae: 1,
    group: "insect",
    note: {
      pl: "Mrówka nie ma skrzydeł, a mimo to jest owadem: ma trzy pary odnóży, jedną parę czułków i ciało z głowy, tułowia i odwłoka. Skrzydła mają tylko królowe i samce.",
      ru: "У муравья нет крыльев, но он всё равно насекомое: три пары ног, одна пара усиков, тело из головы, груди и брюшка. Крылья бывают только у цариц и самцов.",
    },
  },
  {
    id: "spider",
    name: { pl: "Pająk krzyżak", ru: "Паук-крестовик" },
    art: SPIDER,
    jointed: true,
    pairs: 4,
    antennae: 0,
    group: "arachnid",
    note: {
      pl: "Pająk to nie owad! Ma cztery pary odnóży, nie ma czułków, a jego ciało dzieli się na głowotułów i odwłok.",
      ru: "Паук — не насекомое! У него четыре пары ног, нет усиков, а тело делится на головогрудь и брюшко.",
    },
  },
  {
    id: "crayfish",
    name: { pl: "Rak rzeczny", ru: "Речной рак" },
    art: CRAYFISH,
    jointed: true,
    pairs: 5,
    antennae: 2,
    group: "crustacean",
    note: {
      pl: "Rak ma pięć par odnóży krocznych (pierwsza to szczypce) i dwie pary czułków. Oddycha skrzelami.",
      ru: "У рака пять пар ходильных ног (первая — клешни) и две пары усиков. Дышит жабрами.",
    },
  },
  {
    id: "butterfly",
    name: { pl: "Motyl", ru: "Бабочка" },
    art: BUTTERFLY,
    jointed: true,
    pairs: 3,
    antennae: 1,
    group: "insect",
    note: {
      pl: "Motyl ma dwie pary skrzydeł, trzy pary odnóży i jedną parę czułków zakończonych buławką.",
      ru: "У бабочки две пары крыльев, три пары ног и одна пара булавовидных усиков.",
    },
  },
  {
    id: "tick",
    name: { pl: "Kleszcz", ru: "Клещ" },
    art: TICK,
    jointed: true,
    pairs: 4,
    antennae: 0,
    group: "arachnid",
    note: {
      pl: "Kleszcz, tak jak pająk, ma cztery pary odnóży i nie ma czułków — to pajęczak. Po powrocie z lasu obejrzyj skórę: kleszcze przenoszą boreliozę.",
      ru: "У клеща, как и у паука, четыре пары ног и нет усиков — это паукообразное. После леса осмотри кожу: клещи переносят боррелиоз.",
    },
  },
  {
    id: "woodlouse",
    name: { pl: "Prosionek (stonoga murowa)", ru: "Мокрица" },
    art: WOODLOUSE,
    jointed: true,
    pairs: 5,
    antennae: 2,
    group: "crustacean",
    note: {
      pl: "Niespodzianka: prosionek to skorupiak, który żyje na lądzie! Ma siedem par odnóży i dwie pary czułków (druga para jest malutka). Potrzebuje wilgoci, dlatego chowa się pod kamieniami.",
      ru: "Сюрприз: мокрица — ракообразное, живущее на суше! У неё семь пар ног и две пары усиков (вторая совсем маленькая). Ей нужна влага, поэтому она прячется под камнями.",
    },
  },
  {
    id: "earthworm",
    name: { pl: "Dżdżownica", ru: "Дождевой червь" },
    art: EARTHWORM,
    jointed: false,
    group: "other",
    note: {
      pl: "Dżdżownica nie ma odnóży — porusza się dzięki mięśniom i szczecinkom. Jej ciało też jest podzielone na segmenty, ale to pierścienica, a nie stawonóg.",
      ru: "У дождевого червя нет ног — он передвигается с помощью мышц и щетинок. Его тело тоже разделено на сегменты, но это кольчатый червь, а не членистоногое.",
    },
  },
  {
    id: "mosquito",
    name: { pl: "Komar", ru: "Комар" },
    art: MOSQUITO,
    jointed: true,
    pairs: 3,
    antennae: 1,
    group: "insect",
    note: {
      pl: "Komar ma tylko jedną parę skrzydeł (druga zmieniła się w malutkie przezmianki), ale trzy pary odnóży i para czułków od razu zdradzają owada.",
      ru: "У комара только одна пара крыльев (вторая превратилась в крошечные жужжальца), но три пары ног и пара усиков сразу выдают насекомое.",
    },
  },
];

type Step = 0 | 1 | 2 | 3;

export function Classifier({ lang }: { lang: BioLang }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  const animal = ANIMALS[index]!;
  const answer = (q: Step, value: string, right: boolean) => {
    if (!right) {
      setWrong(`${q}:${value}`);
      setMissed(new Set(missed).add(animal.id));
      return;
    }
    setWrong(null);
    // an animal without jointed legs ends the key right away
    setStep(q === 0 && !animal.jointed ? 3 : ((q + 1) as Step));
  };
  const next = () => {
    if (index + 1 >= ANIMALS.length) setFinished(true);
    else {
      setIndex(index + 1);
      setStep(0);
      setWrong(null);
    }
  };
  const restart = () => {
    setIndex(0);
    setStep(0);
    setWrong(null);
    setMissed(new Set());
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="space-y-4">
        <Verdict ok={missed.size === 0} lang={lang}>
          {TXT.summary[lang]} {ANIMALS.length - missed.size} {TXT.of[lang]} {ANIMALS.length}.
        </Verdict>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ANIMALS.map((a) => (
            <li key={a.id} className={`rounded-xl p-2 text-center ring-1 ${missed.has(a.id) ? "bg-rose-50 ring-rose-200" : "bg-emerald-50 ring-emerald-200"}`}>
              <svg viewBox="0 0 200 220" className="mx-auto h-20 w-20" aria-hidden>
                {a.art}
              </svg>
              <div className="text-sm font-medium text-slate-800">{a.name[lang]}</div>
              <div className="text-xs text-slate-600">{GROUPS[a.group][lang]}</div>
            </li>
          ))}
        </ul>
        <Choice onClick={restart}>↺ {KIT.again[lang]}</Choice>
      </div>
    );
  }

  const questions: { q: Step; title: Txt; hint: Txt; options: { value: string; label: Txt; right: boolean }[] }[] = [
    {
      q: 0,
      title: TXT.q0,
      hint: animal.jointed ? TXT.h0 : animal.note,
      options: [
        { value: "yes", label: TXT.yes, right: animal.jointed },
        { value: "no", label: TXT.no, right: !animal.jointed },
      ],
    },
    {
      q: 1,
      title: TXT.q1,
      hint: TXT.h1,
      options: ([3, 4, 5] as const).map((n) => ({ value: String(n), label: TXT[`pairs${n}`], right: animal.pairs === n })),
    },
    {
      q: 2,
      title: TXT.q2,
      hint: TXT.h2,
      options: ([0, 1, 2] as const).map((n) => ({ value: String(n), label: TXT[`ant${n}`], right: animal.antennae === n })),
    },
  ];
  const visible = questions.filter((q) => q.q <= step && (animal.jointed || q.q === 0));

  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <figure className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <span className="whitespace-nowrap">
            {TXT.card[lang]} {index + 1} {TXT.of[lang]} {ANIMALS.length}
          </span>
          <span className="flex gap-1" aria-hidden>
            {ANIMALS.map((a, i) => (
              <span key={a.id} className={`h-1.5 w-3 rounded-full ${i < index ? "bg-emerald-500" : i === index ? "bg-indigo-500" : "bg-slate-300"}`} />
            ))}
          </span>
        </div>
        <svg viewBox="0 0 200 220" className="mx-auto mt-2 w-full max-w-[240px]" role="img" aria-label={animal.name[lang]}>
          {animal.art}
        </svg>
        <figcaption className="mt-1 text-center text-base font-semibold text-slate-800">{animal.name[lang]}</figcaption>
      </figure>

      <div className="space-y-4">
        {visible.map(({ q, title, hint, options }) => {
          const done = step > q;
          return (
            <div key={q}>
              <div className="mb-2 text-sm font-semibold text-slate-700">{title[lang]}</div>
              <div className="flex flex-wrap gap-2">
                {options.map((o) => {
                  const state = done && o.right ? "right" : wrong === `${q}:${o.value}` ? "wrong" : "idle";
                  return (
                    <Choice key={o.value} state={state} disabled={done} onClick={() => answer(q, o.value, o.right)}>
                      {o.label[lang]}
                    </Choice>
                  );
                })}
              </div>
              {!done && wrong?.startsWith(`${q}:`) && (
                <div className="mt-2">
                  <Verdict ok={false} lang={lang}>
                    {hint[lang]}
                  </Verdict>
                </div>
              )}
            </div>
          );
        })}

        {step === 3 && (
          <div className="space-y-3">
            <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" role="status">
              <div className="text-sm text-emerald-800">{TXT.result[lang]}</div>
              <div className="text-lg font-bold text-emerald-900">{GROUPS[animal.group][lang]}</div>
              <p className="mt-1 text-[15px] leading-relaxed text-emerald-950">{animal.note[lang]}</p>
            </div>
            <Choice state="active" onClick={next}>
              {index + 1 >= ANIMALS.length ? TXT.finish[lang] : `${KIT.next[lang]} →`}
            </Choice>
          </div>
        )}
      </div>
    </div>
  );
}
