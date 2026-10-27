// Lesson for LO3 §8.2 "Budowa i działanie układu nerwowego" (zakres rozszerzony). Terms follow
// templates/data/systems.ts (NERVOUS_PARTS) and templates/data/systemsMore.ts (NEURON_WORK).
import { useEffect, useRef, useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { PartMap, type MapPart } from "@portal/lessons";
import { Choice, KIT, num, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Neuron to komórka wyspecjalizowana w przewodzeniu sygnałów. Impuls nerwowy to wędrująca wzdłuż błony zmiana ładunku elektrycznego — potencjał czynnościowy. Między neuronami sygnał przenoszą już cząsteczki chemiczne: neuroprzekaźniki w synapsach.",
    "Нейрон — клетка, специализированная на проведении сигналов. Нервный импульс — это бегущее по мембране изменение электрического заряда, потенциал действия. Между нейронами сигнал передают уже химические молекулы — нейромедиаторы в синапсах.",
  ),
  s1: r("Budowa neuronu", "Строение нейрона"),
  s1intro: r("Impuls płynie od dendrytów przez ciało komórki i akson do zakończeń aksonu.", "Импульс идёт от дендритов через тело клетки и аксон к окончаниям аксона."),
  s2: r("Potencjał spoczynkowy i czynnościowy", "Потенциал покоя и потенциал действия"),
  s2intro: r(
    "Przejdź krok po kroku przez impuls: wykres pokazuje napięcie na błonie, a rysunek obok — co robią kanały jonowe.",
    "Пройди импульс шаг за шагом: график показывает напряжение на мембране, а рисунок рядом — что делают ионные каналы.",
  ),
  s3: r("Zasada „wszystko albo nic”", "Закон «всё или ничего»"),
  s3intro: r("Zmieniaj siłę bodźca i obserwuj, co dzieje się z impulsami.", "Меняй силу раздражителя и наблюдай, что происходит с импульсами."),
  s4: r("Przewodzenie skokowe", "Сальтаторное проведение"),
  s4intro: r("Wyścig dwóch aksonów: bez osłonki mielinowej i z osłonką.", "Гонка двух аксонов: без миелиновой оболочки и с ней."),
  s5: r("Synapsa", "Синапс"),
  s5intro: r("Jak sygnał przechodzi z jednego neuronu na drugi? Prześledź po kolei.", "Как сигнал переходит с одного нейрона на другой? Проследи по шагам."),
} satisfies Record<string, Txt>;

// ---------- neuron map ----------

type NPart = "dendrites" | "body" | "nucleus" | "axon" | "myelin" | "ranvier" | "terminals";

const PARTS: Record<NPart, MapPart> = {
  dendrites: {
    name: r("Dendryty", "Дендриты"),
    text: r("Krótkie, rozgałęzione wypustki. Odbierają sygnały od innych neuronów lub receptorów i przewodzą je w stronę ciała komórki.", "Короткие ветвящиеся отростки. Принимают сигналы от других нейронов или рецепторов и проводят их к телу клетки."),
    pin: [30, 20],
    to: [38, 58],
  },
  body: {
    name: r("Ciało komórki", "Тело клетки"),
    text: r("Zawiera jądro i większość organelli; tu powstają białka i neuroprzekaźniki. Sumuje sygnały docierające z dendrytów.", "Содержит ядро и большинство органоидов; здесь образуются белки и нейромедиаторы. Суммирует сигналы, приходящие от дендритов."),
    pin: [130, 34],
    to: [94, 94],
  },
  nucleus: {
    name: r("Jądro komórkowe", "Ядро"),
    text: r("Kieruje życiem komórki. Dojrzałe neurony zwykle już się nie dzielą — dlatego uszkodzenia mózgu tak trudno się goją.", "Управляет жизнью клетки. Зрелые нейроны обычно уже не делятся — поэтому повреждения мозга так плохо восстанавливаются."),
    pin: [128, 196],
    to: [80, 114],
  },
  axon: {
    name: r("Akson (neuryt)", "Аксон (нейрит)"),
    text: r("Jedna długa wypustka przewodząca impuls od ciała komórki do kolejnych komórek. Może mieć ponad metr długości, np. od rdzenia kręgowego do stopy.", "Один длинный отросток, проводящий импульс от тела клетки к следующим клеткам. Может быть длиннее метра, например от спинного мозга до стопы."),
    pin: [118, 156],
    to: [116, 110],
  },
  myelin: {
    name: r("Osłonka mielinowa", "Миелиновая оболочка"),
    text: r("Tłuszczowa „izolacja” aksonu, utworzona przez komórki glejowe (w nerwach obwodowych — komórki Schwanna). Przyspiesza przewodzenie impulsu.", "Жировая «изоляция» аксона, образованная глиальными клетками (в периферических нервах — шванновскими клетками). Ускоряет проведение импульса."),
    pin: [190, 58],
    to: [190, 100],
  },
  ranvier: {
    name: r("Przewężenia Ranviera", "Перехваты Ранвье"),
    text: r("Krótkie odcinki aksonu bez osłonki mielinowej. Tylko tu błona może się depolaryzować, więc impuls przeskakuje od przewężenia do przewężenia.", "Короткие участки аксона без миелиновой оболочки. Только здесь мембрана может деполяризоваться, поэтому импульс перескакивает от перехвата к перехвату."),
    pin: [232, 168],
    to: [208, 116],
  },
  terminals: {
    name: r("Zakończenia aksonu", "Окончания аксона"),
    text: r("Rozgałęzienia zakończone kolbkami synaptycznymi z pęcherzykami neuroprzekaźnika. Tworzą synapsy z innym neuronem, mięśniem lub gruczołem.", "Разветвления с синаптическими бляшками, в которых пузырьки с нейромедиатором. Образуют синапсы с другим нейроном, мышцей или железой."),
    pin: [320, 196],
    to: [340, 146],
  },
};

const MYELIN_X = [128, 170, 212, 254];

function NeuronMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<NPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 360 220"
      title={r("Neuron", "Нейрон")}
      labelOrder={["dendrites", "body", "nucleus", "axon", "myelin", "ranvier", "terminals"]}
      pinRadius={13}
      maxWidth="max-w-[460px]"
      art={({ part, tone }) => (
        <>
          {part(
            "dendrites",
            <g stroke={tone("dendrites", "#a78bfa")} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M62 94 L 38 60 L 20 50 M38 60 L 32 34" />
              <path d="M58 122 L 30 142 L 12 138 M30 142 L 26 168" />
              <path d="M76 86 L 72 50 L 56 28 M72 50 L 88 26" />
              <path d="M82 134 L 84 172 L 70 196 M84 172 L 100 192" />
              <path d="M54 108 L 12 100" />
            </g>,
          )}
          {part("axon", <path d="M100 110 L 312 110" stroke={tone("axon", "#f59e0b")} strokeWidth={7} strokeLinecap="round" />)}
          {part(
            "myelin",
            <g fill={tone("myelin", "#fef3c7")} stroke="#d97706" strokeWidth={1.5}>
              {MYELIN_X.map((x) => (
                <rect key={x} x={x} y={99} width={34} height={22} rx={10} />
              ))}
            </g>,
          )}
          {part(
            "ranvier",
            <g fill="none" stroke={tone("ranvier", "#0ea5e9")} strokeWidth={3}>
              {MYELIN_X.slice(1).map((x) => (
                <circle key={x} cx={x - 4} cy={110} r={6} />
              ))}
            </g>,
          )}
          {part(
            "terminals",
            <g>
              <path d="M310 110 L 338 80 M310 110 L 348 110 M310 110 L 338 140" stroke={tone("terminals", "#fb7185")} strokeWidth={4} strokeLinecap="round" />
              {[
                [338, 80],
                [348, 110],
                [338, 140],
              ].map(([x, y]) => (
                <circle key={y} cx={x} cy={y} r={7} fill={tone("terminals", "#fb7185")} stroke="#be123c" strokeWidth={1.5} />
              ))}
            </g>,
          )}
          {part("body", <path d="M78 82 C 98 82, 108 96, 104 112 C 102 130, 90 138, 76 136 C 60 136, 52 124, 52 110 C 52 94, 62 82, 78 82 Z" fill={tone("body", "#c4b5fd")} stroke="#6d28d9" strokeWidth={2} />)}
          {part(
            "nucleus",
            <g>
              <circle cx={78} cy={110} r={11} fill={tone("nucleus", "#7c3aed")} />
              <circle cx={81} cy={107} r={3} fill="#4c1d95" />
            </g>,
          )}
        </>
      )}
    />
  );
}

// ---------- action potential ----------

/** one action potential: [time in ms, membrane potential in mV] */
const AP: [number, number][] = [
  [0, -70],
  [0.9, -70],
  [1.0, -68],
  [1.15, -62],
  [1.25, -55],
  [1.35, -40],
  [1.45, -15],
  [1.55, 10],
  [1.65, 25],
  [1.75, 30],
  [1.85, 25],
  [2.0, 5],
  [2.2, -25],
  [2.4, -55],
  [2.6, -75],
  [2.8, -82],
  [3.1, -80],
  [3.5, -75],
  [4.0, -71],
  [4.6, -70],
  [5, -70],
];

const ap = (t: number): number => {
  if (t <= 0) return -70;
  for (let k = 1; k < AP.length; k++) {
    const [t1, v1] = AP[k]!;
    const [t0, v0] = AP[k - 1]!;
    if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
  }
  return -70;
};

const MV = { pl: "mV", ru: "мВ" };
const MS = { pl: "ms", ru: "мс" };

interface Phase {
  name: Txt;
  t0: number;
  t1: number;
  dot: number;
  na: boolean;
  k: boolean;
  pump: boolean;
  reversed: boolean;
  text: Txt;
}

const PHASES: Phase[] = [
  {
    name: r("Spoczynek", "Покой"),
    t0: 0,
    t1: 0.9,
    dot: 0.5,
    na: false,
    k: false,
    pump: true,
    reversed: false,
    text: r(
      "Potencjał spoczynkowy ok. −70 mV: wnętrze neuronu jest ujemne względem otoczenia. Pompa sodowo-potasowa wypompowuje 3 Na⁺ i wprowadza 2 K⁺ (zużywa ATP), więc na zewnątrz jest dużo Na⁺, a wewnątrz dużo K⁺. Błona przepuszcza w spoczynku trochę K⁺, który wycieka na zewnątrz.",
      "Потенциал покоя около −70 мВ: внутренняя сторона нейрона заряжена отрицательно относительно внешней. Натрий-калиевый насос выкачивает 3 Na⁺ и закачивает 2 K⁺ (тратит АТФ), поэтому снаружи много Na⁺, а внутри много K⁺. В покое мембрана немного пропускает K⁺, который утекает наружу.",
    ),
  },
  {
    name: r("Bodziec i próg", "Раздражение и порог"),
    t0: 0.9,
    t1: 1.25,
    dot: 1.25,
    na: true,
    k: false,
    pump: false,
    reversed: false,
    text: r(
      "Bodziec otwiera część kanałów sodowych, Na⁺ wnika do komórki i potencjał rośnie. Gdy osiągnie próg pobudliwości (ok. −55 mV), lawinowo otwierają się kolejne kanały sodowe bramkowane napięciem.",
      "Раздражитель открывает часть натриевых каналов, Na⁺ входит в клетку, и потенциал растёт. Когда он достигает порога возбудимости (около −55 мВ), лавинообразно открываются остальные потенциалзависимые натриевые каналы.",
    ),
  },
  {
    name: r("Depolaryzacja", "Деполяризация"),
    t0: 1.25,
    t1: 1.75,
    dot: 1.75,
    na: true,
    k: false,
    pump: false,
    reversed: true,
    text: r(
      "Na⁺ gwałtownie napływa do neuronu. Wnętrze staje się dodatnie — do ok. +30 mV. Ładunki po obu stronach błony zamieniają się miejscami.",
      "Na⁺ стремительно входит в нейрон. Внутренняя сторона становится положительной — до +30 мВ. Заряды по обе стороны мембраны меняются местами.",
    ),
  },
  {
    name: r("Repolaryzacja", "Реполяризация"),
    t0: 1.75,
    t1: 2.5,
    dot: 2.2,
    na: false,
    k: true,
    pump: false,
    reversed: false,
    text: r(
      "Kanały sodowe zamykają się, a otwierają kanały potasowe. K⁺ wypływa z komórki i potencjał wraca do wartości ujemnych. W tym czasie neuron nie reaguje na kolejny bodziec — to okres refrakcji.",
      "Натриевые каналы закрываются, а калиевые открываются. K⁺ выходит из клетки, и потенциал возвращается к отрицательным значениям. В это время нейрон не отвечает на новое раздражение — это рефрактерный период.",
    ),
  },
  {
    name: r("Hiperpolaryzacja", "Гиперполяризация"),
    t0: 2.5,
    t1: 3.5,
    dot: 2.8,
    na: false,
    k: true,
    pump: false,
    reversed: false,
    text: r(
      "Kanały potasowe zamykają się powoli, więc K⁺ wypływa trochę za długo — potencjał spada poniżej spoczynkowego, do ok. −80 mV.",
      "Калиевые каналы закрываются медленно, поэтому K⁺ выходит чуть дольше нужного — потенциал опускается ниже уровня покоя, примерно до −80 мВ.",
    ),
  },
  {
    name: r("Powrót do spoczynku", "Возврат к покою"),
    t0: 3.5,
    t1: 5,
    dot: 4.6,
    na: false,
    k: false,
    pump: true,
    reversed: false,
    text: r(
      "Kanały potasowe są zamknięte, potencjał wraca do −70 mV. Pompa sodowo-potasowa stale utrzymuje różnicę stężeń jonów, dzięki czemu neuron może przewodzić kolejne impulsy.",
      "Калиевые каналы закрыты, потенциал возвращается к −70 мВ. Натрий-калиевый насос постоянно поддерживает разницу концентраций ионов, благодаря чему нейрон может проводить новые импульсы.",
    ),
  },
];

const gx = (t: number) => 44 + t * 62;
const gy = (v: number) => 16 + (40 - v) * 1.3;

const curve = (from: number, to: number, f: (t: number) => number, x: (t: number) => number, y: (v: number) => number, dt = 0.02) => {
  const pts: string[] = [];
  for (let t = from; t <= to + 1e-9; t += dt) pts.push(`${x(t).toFixed(1)} ${y(f(t)).toFixed(1)}`);
  return `M${pts.join(" L ")}`;
};

function ActionPotential({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const p = PHASES[i]!;
  const sign = (out: boolean) => ((out ? !p.reversed : p.reversed) ? "+" : "−");
  return (
    <div className="space-y-4">
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 360 210" className="w-full" role="img" aria-label={`${p.name[lang]}: ${num(ap(p.dot))} ${MV[lang]}`}>
          <rect width={360} height={210} rx={12} fill="#f8fafc" />
          <path d={`M44 ${gy(0)} L 354 ${gy(0)}`} stroke="#cbd5e1" strokeDasharray="4 4" />
          <path d={`M44 ${gy(-55)} L 354 ${gy(-55)}`} stroke="#f43f5e" strokeDasharray="5 4" />
          <path d="M44 10 L 44 196 L 354 196" stroke="#94a3b8" fill="none" />
          {[30, 0, -55, -70].map((v) => (
            <text key={v} x={40} y={gy(v) + 4} textAnchor="end" fontSize={10} fill={v === -55 ? "#e11d48" : "#475569"}>
              {num(v)}
            </text>
          ))}
          <text x={350} y={gy(-55) - 4} textAnchor="end" fontSize={10} fill="#e11d48">
            {lang === "pl" ? "próg" : "порог"}
          </text>
          <text x={8} y={12} fontSize={10} fill="#475569">
            {MV[lang]}
          </text>
          <text x={350} y={208} textAnchor="end" fontSize={10} fill="#475569">
            t, {MS[lang]}
          </text>
          <path d={curve(0, 5, ap, gx, gy)} stroke="#94a3b8" strokeWidth={2.5} fill="none" />
          <path d={curve(p.t0, p.t1, ap, gx, gy)} stroke="#059669" strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={gx(p.dot)} cy={gy(ap(p.dot))} r={6} fill="#059669" stroke="white" strokeWidth={2} />
        </svg>
        <svg viewBox="0 0 300 170" className="w-full" role="img" aria-label={lang === "pl" ? "błona neuronu i kanały jonowe" : "мембрана нейрона и ионные каналы"}>
          <defs>
            {[
              ["neur-a-na", "#0284c7"],
              ["neur-a-k", "#d97706"],
            ].map(([id, c]) => (
              <marker key={id} id={id} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M0 0 L 10 5 L 0 10 Z" fill={c} />
              </marker>
            ))}
          </defs>
          <rect width={300} height={62} fill="#e0f2fe" />
          <rect y={92} width={300} height={78} fill="#fef3c7" />
          <rect y={62} width={300} height={30} fill="#fde68a" />
          <path d="M0 64 L 300 64 M0 90 L 300 90" stroke="#ca8a04" strokeWidth={3} strokeDasharray="2 3" />
          <text x={6} y={14} fontSize={11} fill="#0369a1">
            {lang === "pl" ? "zewnątrz" : "снаружи"}: Na⁺ Na⁺ Na⁺
          </text>
          <text x={6} y={164} fontSize={11} fill="#92400e">
            {lang === "pl" ? "wnętrze" : "внутри"}: K⁺ K⁺ K⁺
          </text>
          {/* charges along the membrane */}
          {[20, 50, 133, 262, 290].map((x) => (
            <g key={x} fontSize={14} fontWeight={700} textAnchor="middle">
              <text x={x} y={56} fill={sign(true) === "+" ? "#dc2626" : "#2563eb"}>
                {sign(true)}
              </text>
              <text x={x} y={108} fill={sign(false) === "+" ? "#dc2626" : "#2563eb"}>
                {sign(false)}
              </text>
            </g>
          ))}
          {/* Na⁺ channel */}
          <Channel x={96} open={p.na} colour="#0284c7" label="Na⁺" />
          {p.na && <path d="M96 30 L 96 126" stroke="#0284c7" strokeWidth={3} markerEnd="url(#neur-a-na)" />}
          {/* K⁺ channel */}
          <Channel x={170} open={p.k} colour="#d97706" label="K⁺" />
          {p.k && <path d="M170 128 L 170 30" stroke="#d97706" strokeWidth={3} markerEnd="url(#neur-a-k)" />}
          {/* pump */}
          {p.pump && (
            <g>
              <rect x={204} y={58} width={34} height={38} rx={8} fill="#a855f7" />
              <text x={221} y={81} textAnchor="middle" fontSize={9} fill="white" fontWeight={700}>
                {lang === "pl" ? "ATP" : "АТФ"}
              </text>
              <path d="M214 100 L 214 126" stroke="#0284c7" strokeWidth={2} />
              <path d="M214 56 L 214 34" stroke="#0284c7" strokeWidth={2} markerEnd="url(#neur-a-na)" />
              <path d="M230 34 L 230 54" stroke="#d97706" strokeWidth={2} />
              <path d="M230 100 L 230 124" stroke="#d97706" strokeWidth={2} markerEnd="url(#neur-a-k)" />
              <text x={200} y={30} fontSize={9} fill="#0369a1" textAnchor="end">
                3 Na⁺
              </text>
              <text x={244} y={136} fontSize={9} fill="#92400e">
                2 K⁺
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="flex flex-wrap gap-2">
        {PHASES.map((ph, k) => (
          <Choice key={ph.name.pl} state={k === i ? "active" : "idle"} onClick={() => setI(k)}>
            {k + 1}. {ph.name[lang]}
          </Choice>
        ))}
      </div>
      <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
        <h3 className="text-base font-semibold text-emerald-900">
          {p.name[lang]} · <span className="tabular-nums">{num(ap(p.dot))} {MV[lang]}</span>
        </h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{p.text[lang]}</p>
      </div>
      <div className="flex gap-2">
        <Choice onClick={() => setI((i + PHASES.length - 1) % PHASES.length)}>‹ {lang === "pl" ? "Wstecz" : "Назад"}</Choice>
        <Choice state="active" onClick={() => setI((i + 1) % PHASES.length)}>
          {KIT.next[lang]} ›
        </Choice>
      </div>
    </div>
  );
}

function Channel({ x, open, colour, label }: { x: number; open: boolean; colour: string; label: string }) {
  const gap = open ? 7 : 0;
  return (
    <g>
      <rect x={x - 14 - gap} y={58} width={14} height={38} rx={4} fill={colour} style={{ transition: "x .3s" }} />
      <rect x={x + gap} y={58} width={14} height={38} rx={4} fill={colour} style={{ transition: "x .3s" }} />
      <text x={x - 24} y={52} textAnchor="middle" fontSize={10} fontWeight={700} fill={colour}>
        {label}
      </text>
    </g>
  );
}

// ---------- all or nothing ----------

const THRESHOLD = 30;

function AllOrNothing({ lang }: { lang: BioLang }) {
  const [s, setS] = useState(20);
  const n = s < THRESHOLD ? 0 : s < 50 ? 1 : s < 70 ? 2 : s < 90 ? 3 : 4;
  const onsets = Array.from({ length: n }, (_, k) => 0.6 + (k * 10.8) / n);
  const v = (t: number) => {
    if (n === 0) {
      const tau = t - 0.6;
      return tau <= 0 ? -70 : -70 + (s / THRESHOLD) * 13 * tau * Math.exp(1 - tau);
    }
    const last = [...onsets].reverse().find((o) => o <= t);
    return last === undefined ? -70 : ap(t - last + 0.9);
  };
  const x = (t: number) => 34 + t * 26.5;
  const y = (mv: number) => 12 + (40 - mv) * 1.1;
  const text =
    s === 0
      ? r("Brak bodźca — błona ma potencjał spoczynkowy.", "Раздражителя нет — на мембране потенциал покоя.")
      : n === 0
        ? r("Bodziec podprogowy: niewielka depolaryzacja wygasa, nie przekraczając progu. Impuls nie powstaje.", "Подпороговый раздражитель: небольшая деполяризация затухает, не достигнув порога. Импульс не возникает.")
        : r(
            `Bodziec progowy lub silniejszy: powstaje impuls, zawsze tej samej wysokości (ok. +30 mV). Silniejszy bodziec nie daje „większego” impulsu, tylko częstsze impulsy — teraz ${n} w ciągu 12 ms.`,
            `Пороговый или более сильный раздражитель: возникает импульс, всегда одной высоты (около +30 мВ). Более сильный раздражитель даёт не «больший» импульс, а более частые — сейчас ${n} за 12 мс.`,
          );
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 360 200" className="w-full" role="img" aria-label={text[lang]}>
        <rect width={360} height={200} rx={12} fill="#f8fafc" />
        <path d={`M34 ${y(-55)} L 352 ${y(-55)}`} stroke="#f43f5e" strokeDasharray="5 4" />
        <path d="M34 8 L 34 166 L 352 166" stroke="#94a3b8" fill="none" />
        {[30, -55, -70].map((mv) => (
          <text key={mv} x={30} y={y(mv) + 4} textAnchor="end" fontSize={10} fill={mv === -55 ? "#e11d48" : "#475569"}>
            {num(mv)}
          </text>
        ))}
        <path d={curve(0, 12, v, x, y, 0.03)} stroke="#4f46e5" strokeWidth={2.5} fill="none" strokeLinejoin="round" />
        {/* stimulus trace */}
        <rect x={x(0.5)} y={194 - s * 0.22} width={x(11.6) - x(0.5)} height={s * 0.22} fill="#fbbf24" opacity={0.7} />
        <text x={x(0.5) + 4} y={190} fontSize={9} fill="#92400e">
          {lang === "pl" ? "bodziec" : "раздражитель"}
        </text>
      </svg>
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Siła bodźca" : "Сила раздражителя"}
          <input
            type="range"
            min={0}
            max={100}
            value={s}
            onChange={(e) => setS(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-amber-500"
            aria-valuetext={n === 0 ? (lang === "pl" ? "podprogowy" : "подпороговый") : `${n}`}
          />
          <span className="mt-1 flex justify-between text-xs font-normal text-slate-500">
            <span>{lang === "pl" ? "słaby" : "слабый"}</span>
            <span>{lang === "pl" ? "silny" : "сильный"}</span>
          </span>
        </label>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          {text[lang]}
        </p>
      </div>
    </div>
  );
}

// ---------- saltatory conduction ----------

const NODES = [30, 80, 130, 180, 230, 280, 330];
const SLOW = 4000;
const FAST = 600;

function Saltatory({ lang }: { lang: BioLang }) {
  const [t, setT] = useState<number | null>(null);
  const frame = useRef(0);
  const start = () => {
    cancelAnimationFrame(frame.current);
    const t0 = performance.now();
    const tick = (now: number) => {
      const e = now - t0;
      setT(e);
      if (e < SLOW + 200) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const slowX = t === null ? null : 30 + 300 * Math.min(1, t / SLOW);
  const node = t === null ? null : Math.min(NODES.length - 1, Math.floor((t / FAST) * (NODES.length - 1)));
  const fastDone = t !== null && t >= FAST;
  const slowDone = t !== null && t >= SLOW;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <svg viewBox="0 0 360 180" className="w-full" role="img" aria-label={lang === "pl" ? "przewodzenie impulsu w dwóch aksonach" : "проведение импульса в двух аксонах"}>
        <rect width={360} height={180} rx={12} fill="#f8fafc" />
        <text x={14} y={26} fontSize={11} fontWeight={600} fill="#475569">
          {lang === "pl" ? "bez osłonki mielinowej · ok. 1 m/s" : "без миелиновой оболочки · около 1 м/с"}
        </text>
        <path d="M30 50 L 330 50" stroke="#f59e0b" strokeWidth={5} strokeLinecap="round" />
        {slowX !== null && (
          <>
            <path d={`M30 50 L ${slowX} 50`} stroke="#e11d48" strokeWidth={5} strokeLinecap="round" opacity={0.35} />
            <circle cx={slowX} cy={50} r={9} fill="#e11d48" opacity={0.85} />
          </>
        )}
        <text x={14} y={104} fontSize={11} fontWeight={600} fill="#475569">
          {lang === "pl" ? "z osłonką mielinową · nawet ok. 100 m/s" : "с миелиновой оболочкой · до 100 м/с"}
        </text>
        <path d="M30 130 L 330 130" stroke="#f59e0b" strokeWidth={5} />
        {NODES.slice(0, -1).map((x) => (
          <rect key={x} x={x + 5} y={119} width={40} height={22} rx={10} fill="#fef3c7" stroke="#d97706" strokeWidth={1.5} />
        ))}
        {node !== null &&
          NODES.slice(1, node + 1).map((x, k) => (
            <path key={x} d={`M${NODES[k]} 120 Q ${x - 25} 92 ${x} 120`} stroke="#e11d48" strokeWidth={2} fill="none" strokeDasharray="4 3" />
          ))}
        {NODES.map((x, k) => (
          <circle key={x} cx={x} cy={130} r={node === k ? 9 : 4} fill={node !== null && k <= node ? "#e11d48" : "#0ea5e9"} style={{ transition: "r .1s" }} />
        ))}
        {fastDone && (
          <text x={340} y={134} fontSize={14}>
            🏁
          </text>
        )}
        {slowDone && (
          <text x={340} y={54} fontSize={14}>
            🏁
          </text>
        )}
      </svg>
      <div className="space-y-3">
        <Choice state="active" onClick={start}>
          ⚡ {lang === "pl" ? "Wyślij impulsy" : "Отправить импульсы"}
        </Choice>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          {lang === "pl"
            ? "Mielina izoluje akson, więc błona depolaryzuje się tylko w przewężeniach Ranviera — impuls przeskakuje z jednego na następne. W aksonie bez osłonki depolaryzacja musi objąć kolejno każdy fragment błony, dlatego jest znacznie wolniejsza. Animacja jest spowolniona."
            : "Миелин изолирует аксон, поэтому мембрана деполяризуется только в перехватах Ранвье — импульс перескакивает от одного к другому. В аксоне без оболочки деполяризация должна охватить по очереди каждый участок мембраны, поэтому она гораздо медленнее. Анимация замедлена."}
        </p>
      </div>
    </div>
  );
}

// ---------- synapse ----------

const SYN_STEPS: Txt[] = [
  r("Impuls nerwowy dociera do zakończenia aksonu — kolbki synaptycznej.", "Нервный импульс доходит до окончания аксона — синаптической бляшки."),
  r("Depolaryzacja błony otwiera kanały wapniowe — jony Ca²⁺ wnikają do kolbki.", "Деполяризация мембраны открывает кальциевые каналы — ионы Ca²⁺ входят в бляшку."),
  r("Ca²⁺ sprawia, że pęcherzyki synaptyczne łączą się z błoną presynaptyczną i wylewają neuroprzekaźnik do szczeliny (egzocytoza).", "Ca²⁺ заставляет синаптические пузырьки слиться с пресинаптической мембраной и выбросить нейромедиатор в щель (экзоцитоз)."),
  r("Neuroprzekaźnik, np. acetylocholina, dyfunduje przez szczelinę synaptyczną.", "Нейромедиатор, например ацетилхолин, диффундирует через синаптическую щель."),
  r("Neuroprzekaźnik łączy się z receptorami błony postsynaptycznej — otwierają się kanały i Na⁺ wnika do komórki.", "Нейромедиатор связывается с рецепторами постсинаптической мембраны — открываются каналы, и Na⁺ входит в клетку."),
  r("Błona postsynaptyczna depolaryzuje się; gdy przekroczy próg, powstaje w niej nowy impuls.", "Постсинаптическая мембрана деполяризуется; если она достигает порога, в ней возникает новый импульс."),
  r(
    "Neuroprzekaźnik jest szybko usuwany: rozkłada go enzym (acetylocholinę — acetylocholinoesteraza) albo wraca do kolbki (wychwyt zwrotny). Dzięki temu synapsa jest gotowa na następny sygnał.",
    "Нейромедиатор быстро удаляется: его расщепляет фермент (ацетилхолин — ацетилхолинэстераза) или он возвращается в бляшку (обратный захват). Благодаря этому синапс готов к следующему сигналу.",
  ),
];

const VESICLES: [number, number][] = [
  [110, 82],
  [150, 70],
  [190, 82],
  [128, 106],
  [172, 106],
];
const RECEPTORS = [110, 150, 190];

function Synapse({ lang }: { lang: BioLang }) {
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!play) return;
    const id = window.setTimeout(() => setI((i + 1) % SYN_STEPS.length), 2600);
    return () => window.clearTimeout(id);
  }, [play, i]);
  const step = i + 1;
  const fused = step >= 3;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 300 260" className="mx-auto w-full max-w-[380px]" role="img" aria-label={SYN_STEPS[i]![lang]}>
        <defs>
          {[
            ["neur-s-ca", "#16a34a"],
            ["neur-s-na", "#0284c7"],
            ["neur-s-nt", "#7c3aed"],
          ].map(([id, c]) => (
            <marker key={id} id={id} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L 10 5 L 0 10 Z" fill={c} />
            </marker>
          ))}
        </defs>
        {/* presynaptic terminal */}
        <path d="M130 0 L 130 34 C 80 46, 62 88, 70 130 L 230 130 C 238 88, 220 46, 170 34 L 170 0 Z" fill="#fef3c7" stroke="#d97706" strokeWidth={2.5} />
        {step === 1 && <path d="M150 4 L 140 22 L 156 22 L 146 44" stroke="#eab308" strokeWidth={4} fill="none" strokeLinejoin="round" />}
        {/* Ca²⁺ channels on the sides */}
        {[
          [72, 100],
          [228, 100],
        ].map(([x, y]) => (
          <rect key={x} x={x! - 5} y={y! - 9} width={10} height={18} rx={3} fill={step >= 2 ? "#16a34a" : "#64748b"} />
        ))}
        {step === 2 &&
          [
            [56, 96, 92, 100],
            [244, 96, 208, 100],
          ].map(([x1, y1, x2, y2]) => <path key={x1} d={`M${x1} ${y1} L ${x2} ${y2}`} stroke="#16a34a" strokeWidth={2.5} markerEnd="url(#neur-s-ca)" />)}
        {step >= 2 && step <= 3 && (
          <text x={88} y={122} fontSize={10} fill="#15803d" fontWeight={700}>
            Ca²⁺
          </text>
        )}
        {/* vesicles */}
        {VESICLES.map(([x, y], k) => {
          const atMembrane = fused && k < 3;
          const cy = atMembrane ? 122 : y;
          return (
            <g key={k} style={{ transition: "transform .5s" }}>
              {atMembrane ? (
                <path d={`M${x - 11} 130 A 11 11 0 0 1 ${x + 11} 130`} fill="#fde68a" stroke="#b45309" strokeWidth={1.5} />
              ) : (
                <circle cx={x} cy={cy} r={11} fill="#fde68a" stroke="#b45309" strokeWidth={1.5} />
              )}
              {!atMembrane && [-4, 0, 4].map((d) => <circle key={d} cx={x + d} cy={cy + (d === 0 ? -3 : 2)} r={1.8} fill="#7c3aed" />)}
            </g>
          );
        })}
        {/* cleft label */}
        <text x={262} y={144} fontSize={9} fill="#64748b" textAnchor="end">
          {lang === "pl" ? "szczelina" : "щель"}
        </text>
        {/* postsynaptic cell */}
        <path d="M40 150 L 260 150 L 260 260 L 40 260 Z" fill={step >= 6 ? "#c4b5fd" : "#ede9fe"} stroke="#7c3aed" strokeWidth={2.5} style={{ transition: "fill .4s" }} />
        {RECEPTORS.map((x) => (
          <path key={x} d={`M${x - 8} 150 L ${x - 8} 158 Q ${x} 164 ${x + 8} 158 L ${x + 8} 150`} fill="#a78bfa" stroke="#5b21b6" strokeWidth={1.5} />
        ))}
        {/* neurotransmitter */}
        {step >= 3 &&
          step <= 6 &&
          RECEPTORS.flatMap((x) =>
            [-5, 5].map((d) => {
              const cy = step === 3 ? 134 : step === 4 ? 142 : 152;
              return <circle key={`${x}${d}`} cx={x + d * (step >= 5 ? 0.6 : 1.4)} cy={cy} r={2.4} fill="#7c3aed" />;
            }),
          )}
        {step === 5 &&
          RECEPTORS.map((x) => <path key={x} d={`M${x + 18} 136 L ${x + 18} 180`} stroke="#0284c7" strokeWidth={2.5} markerEnd="url(#neur-s-na)" />)}
        {step === 5 && (
          <text x={214} y={198} fontSize={10} fill="#0369a1" fontWeight={700}>
            Na⁺
          </text>
        )}
        {step === 6 && <path d="M150 180 L 140 202 L 158 202 L 148 238" stroke="#eab308" strokeWidth={4} fill="none" strokeLinejoin="round" />}
        {step === 7 && (
          <>
            {RECEPTORS.map((x) => (
              <g key={x}>
                <path d={`M${x - 4} 140 L ${x + 4} 136 L ${x + 4} 144 Z`} fill="#16a34a" />
                <circle cx={x - 9} cy={140} r={1.6} fill="#7c3aed" />
                <circle cx={x + 10} cy={136} r={1.6} fill="#7c3aed" />
              </g>
            ))}
            <path d="M210 140 C 222 132, 222 120, 214 112" stroke="#7c3aed" strokeWidth={2} fill="none" markerEnd="url(#neur-s-nt)" />
          </>
        )}
        <text x={150} y={250} textAnchor="middle" fontSize={10} fill="#5b21b6">
          {lang === "pl" ? "neuron postsynaptyczny" : "постсинаптический нейрон"}
        </text>
      </svg>
      <div className="space-y-3">
        <ol className="space-y-1.5">
          {SYN_STEPS.map((s, k) => (
            <li key={s.pl}>
              <button
                type="button"
                onClick={() => setI(k)}
                aria-current={k === i ? "step" : undefined}
                className={`w-full rounded-lg px-3 py-1.5 text-left text-sm ring-1 transition-colors ${
                  k === i ? "bg-emerald-50 font-medium text-emerald-950 ring-emerald-300" : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {k + 1}. {s[lang]}
              </button>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          <Choice state="active" onClick={() => setI((i + 1) % SYN_STEPS.length)}>
            {KIT.next[lang]} ›
          </Choice>
          <Choice onClick={() => setPlay(!play)}>{play ? (lang === "pl" ? "⏸ Pauza" : "⏸ Пауза") : lang === "pl" ? "▶ Odtwarzaj" : "▶ Запустить"}</Choice>
        </div>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Dendryty przewodzą impuls do ciała komórki, akson — od ciała komórki.", ru: "Дендриты проводят импульс к телу клетки, аксон — от тела клетки." },
    { pl: "Komórki glejowe odżywiają, chronią i izolują neurony, tworzą też osłonkę mielinową.", ru: "Глиальные клетки питают, защищают и изолируют нейроны, а также образуют миелиновую оболочку." },
  ],
  s2: [
    { pl: "Spoczynek ok. −70 mV; depolaryzacja — napływ Na⁺; repolaryzacja — wypływ K⁺.", ru: "Покой около −70 мВ; деполяризация — вход Na⁺; реполяризация — выход K⁺." },
    { pl: "Pompa sodowo-potasowa (3 Na⁺ na zewnątrz, 2 K⁺ do środka) zużywa ATP.", ru: "Натрий-калиевый насос (3 Na⁺ наружу, 2 K⁺ внутрь) тратит АТФ." },
  ],
  s3: [{ pl: "Impuls powstaje dopiero po przekroczeniu progu i ma zawsze tę samą amplitudę; siłę bodźca koduje częstotliwość impulsów.", ru: "Импульс возникает только после превышения порога и всегда одной амплитуды; силу раздражителя кодирует частота импульсов." }],
  s4: [{ pl: "W aksonach z osłonką mielinową impuls przeskakuje między przewężeniami Ranviera — to przewodzenie skokowe.", ru: "В аксонах с миелиновой оболочкой импульс перескакивает между перехватами Ранвье — это сальтаторное проведение." }],
  s5: [
    { pl: "W synapsie chemicznej sygnał biegnie tylko w jedną stronę: z błony presynaptycznej na postsynaptyczną.", ru: "В химическом синапсе сигнал идёт только в одну сторону: с пресинаптической мембраны на постсинаптическую." },
    { pl: "Impuls → Ca²⁺ → egzocytoza neuroprzekaźnika → receptory → nowy impuls → rozkład neuroprzekaźnika.", ru: "Импульс → Ca²⁺ → экзоцитоз медиатора → рецепторы → новый импульс → расщепление медиатора." },
  ],
};

export default function NeuronLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="neur" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="neur-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <NeuronMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="neur-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <ActionPotential lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="neur-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <AllOrNothing lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="neur-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Saltatory lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="neur-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <Synapse lang={lang} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
