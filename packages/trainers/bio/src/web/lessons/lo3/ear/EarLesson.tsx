// Lesson for LO3 §9.3 "Ucho – narząd słuchu i równowagi" (zakres rozszerzony). Parts follow
// templates/data/systems.ts (SENSE_PARTS, senses.ear) and systemsMore.ts (EAR_PARTS).
import { useEffect, useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { OrderGame, PartMap, type MapPart } from "../../games.tsx";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Ucho to dwa narządy w jednym: narząd słuchu i narząd równowagi. Ucho zewnętrzne i środkowe doprowadzają i wzmacniają dźwięk, a w uchu wewnętrznym komórki zmysłowe z rzęskami zamieniają ruch płynu na impulsy nerwowe — zarówno przy dźwięku, jak i przy ruchu głowy.",
    "Ухо — это два органа в одном: орган слуха и орган равновесия. Наружное и среднее ухо проводят и усиливают звук, а во внутреннем ухе волосковые клетки превращают движение жидкости в нервные импульсы — и при звуке, и при движении головы.",
  ),
  s1: r("Budowa ucha", "Строение уха"),
  s1intro: r("Przekrój przez ucho prawe widziane od przodu; po lewej stronie małżowina, po prawej wnętrze czaszki.", "Разрез правого уха, вид спереди: слева ушная раковина, справа — внутренность черепа."),
  s2: r("Droga dźwięku", "Путь звука"),
  s2intro: r("Ułóż drogę, którą przebywa dźwięk od powietrza do ośrodka słuchu w mózgu.", "Выстрой путь звука от воздуха до слухового центра в мозге."),
  s3: r("Ślimak rozpoznaje wysokość dźwięku", "Улитка различает высоту звука"),
  s3intro: r(
    "Ślimak tu „rozwinięto” w prostą rurkę. Zmieniaj częstotliwość dźwięku i patrz, które miejsce błony podstawnej drga najsilniej.",
    "Здесь улитку «развернули» в прямую трубку. Меняй частоту звука и смотри, какое место основной мембраны колеблется сильнее всего.",
  ),
  s4: r("Narząd równowagi", "Орган равновесия"),
  s4intro: r(
    "Przedsionek odbiera położenie głowy, a kanały półkoliste — obroty. Przechyl głowę i zakręć się na karuzeli.",
    "Преддверие воспринимает положение головы, а полукружные каналы — вращение. Наклони голову и прокатись на карусели.",
  ),
} satisfies Record<string, Txt>;

// ---------- ear map ----------

type EarPart = "pinna" | "canal" | "drum" | "malleus" | "incus" | "stapes" | "tube" | "oval" | "cochlea" | "canals" | "vestibule" | "nerve";

const PARTS: Record<EarPart, MapPart> = {
  pinna: {
    name: r("Małżowina uszna", "Ушная раковина"),
    text: r(
      "Zbudowana z chrząstki sprężystej pokrytej skórą. Zbiera fale dźwiękowe i kieruje je do przewodu słuchowego; pomaga też ocenić, skąd dochodzi dźwięk.",
      "Состоит из эластического хряща, покрытого кожей. Улавливает звуковые волны и направляет их в слуховой проход; помогает определить, откуда идёт звук.",
    ),
    pin: [22, 32],
    to: [30, 82],
  },
  canal: {
    name: r("Przewód słuchowy zewnętrzny", "Наружный слуховой проход"),
    text: r(
      "Doprowadza dźwięk do błony bębenkowej. Gruczoły w jego skórze wydzielają woskowinę, która zatrzymuje kurz i drobnoustroje.",
      "Проводит звук к барабанной перепонке. Железы в его коже выделяют ушную серу, которая задерживает пыль и микроорганизмы.",
    ),
    pin: [108, 66],
    to: [110, 128],
  },
  drum: {
    name: r("Błona bębenkowa", "Барабанная перепонка"),
    text: r(
      "Cienka błona na granicy ucha zewnętrznego i środkowego. Fale dźwiękowe wprawiają ją w drgania, które przejmuje przyrośnięty do niej młoteczek.",
      "Тонкая перепонка на границе наружного и среднего уха. Звуковые волны заставляют её колебаться, а колебания передаются приросшему к ней молоточку.",
    ),
    pin: [124, 206],
    to: [157, 146],
  },
  malleus: {
    name: r("Młoteczek", "Молоточек"),
    text: r("Pierwsza z trzech kosteczek słuchowych — jego rękojeść jest zrośnięta z błoną bębenkową.", "Первая из трёх слуховых косточек — её рукоятка сращена с барабанной перепонкой."),
    pin: [146, 44],
    to: [168, 100],
  },
  incus: {
    name: r("Kowadełko", "Наковальня"),
    text: r("Środkowa kosteczka słuchowa; przekazuje drgania z młoteczka na strzemiączko.", "Средняя слуховая косточка; передаёт колебания от молоточка к стремечку."),
    pin: [186, 34],
    to: [184, 98],
  },
  stapes: {
    name: r("Strzemiączko", "Стремечко"),
    text: r(
      "Najmniejsza kość człowieka. Jego podstawa tkwi w okienku owalnym i wprawia w drgania płyn ucha wewnętrznego.",
      "Самая маленькая кость человека. Её основание сидит в овальном окне и приводит в колебание жидкость внутреннего уха.",
    ),
    pin: [168, 222],
    to: [204, 130],
  },
  tube: {
    name: r("Trąbka słuchowa", "Слуховая труба"),
    text: r(
      "Łączy jamę ucha środkowego z gardłem i wyrównuje ciśnienie po obu stronach błony bębenkowej — dlatego w samolocie pomaga przełykanie albo ziewanie.",
      "Соединяет полость среднего уха с глоткой и выравнивает давление по обе стороны барабанной перепонки — поэтому в самолёте помогает глотание или зевание.",
    ),
    pin: [300, 248],
    to: [248, 246],
  },
  oval: {
    name: r("Okienko owalne", "Овальное окно"),
    text: r(
      "Otwór między uchem środkowym a wewnętrznym, zamknięty błoną i podstawą strzemiączka. Jest ok. 20 razy mniejsze od błony bębenkowej, więc ciśnienie drgań rośnie.",
      "Отверстие между средним и внутренним ухом, закрытое перепонкой и основанием стремечка. Оно примерно в 20 раз меньше барабанной перепонки, поэтому давление колебаний возрастает.",
    ),
    pin: [228, 214],
    to: [219, 138],
  },
  cochlea: {
    name: r("Ślimak", "Улитка"),
    text: r(
      "Spiralny kanał kostny wypełniony płynem (przychłonką i śródchłonką). Leży w nim narząd Cortiego z komórkami zmysłowymi słuchu.",
      "Спиральный костный канал, заполненный жидкостью (перилимфой и эндолимфой). В нём находится кортиев орган с рецепторными клетками слуха.",
    ),
    pin: [340, 222],
    to: [300, 196],
  },
  canals: {
    name: r("Kanały półkoliste", "Полукружные каналы"),
    text: r(
      "Trzy kanały ułożone w trzech prostopadłych płaszczyznach, wypełnione śródchłonką. Odbierają ruchy obrotowe głowy.",
      "Три канала, лежащие в трёх взаимно перпендикулярных плоскостях и заполненные эндолимфой. Воспринимают вращательные движения головы.",
    ),
    pin: [292, 30],
    to: [272, 62],
  },
  vestibule: {
    name: r("Przedsionek", "Преддверие"),
    text: r(
      "Zawiera woreczek i łagiewkę z otolitami. Odbiera położenie głowy względem siły ciężkości i ruchy prostoliniowe.",
      "Содержит мешочек и маточку с отолитами. Воспринимает положение головы относительно силы тяжести и прямолинейные движения.",
    ),
    pin: [336, 74],
    to: [258, 120],
  },
  nerve: {
    name: r("Nerw przedsionkowo-ślimakowy", "Преддверно-улитковый нерв"),
    text: r(
      "VIII nerw czaszkowy; przewodzi impulsy słuchowe i impulsy z narządu równowagi do mózgowia. Ośrodek słuchu leży w płacie skroniowym kory mózgu.",
      "VIII черепной нерв; проводит слуховые импульсы и импульсы от органа равновесия в головной мозг. Слуховой центр находится в височной доле коры.",
    ),
    pin: [376, 160],
    to: [370, 128],
  },
};

/** an Archimedean spiral for the cochlea, starting at its base on the left */
function spiral(cx: number, cy: number, r0: number, turns: number): string {
  const pts: string[] = [];
  const n = 80;
  for (let k = 0; k <= n; k++) {
    const th = (k / n) * turns * 2 * Math.PI;
    const rr = r0 * (1 - (0.8 * k) / n);
    pts.push(`${(cx - rr * Math.cos(th)).toFixed(1)} ${(cy - rr * Math.sin(th)).toFixed(1)}`);
  }
  return `M${pts.join(" L ")}`;
}
const COCHLEA = spiral(286, 194, 30, 2.4);

function EarMap({ lang }: { lang: BioLang }) {
  const zone = (x: number, pl: string, ru: string) => (
    <text x={x} y={12} textAnchor="middle" fontSize={10} fill="#64748b">
      {lang === "pl" ? pl : ru}
    </text>
  );
  return (
    <PartMap<EarPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 270"
      title={r("Przekrój ucha", "Разрез уха")}
      labelOrder={["pinna", "canal", "drum", "malleus", "incus", "stapes", "oval", "tube", "vestibule", "canals", "cochlea", "nerve"]}
      pinRadius={12}
      maxWidth="max-w-[560px]"
      art={({ part, tone }) => (
        <>
          <rect x={70} y={20} width={330} height={250} fill="#f5f5f4" />
          <path d="M157 20 L 157 262 M217 20 L 217 262" stroke="#cbd5e1" strokeDasharray="4 4" />
          {zone(84, "ucho zewnętrzne", "наружное ухо")}
          {zone(187, "środkowe", "среднее")}
          {zone(300, "wewnętrzne", "внутреннее")}
          {part(
            "pinna",
            <path
              d="M74 98 C 56 48, 6 54, 8 116 C 10 168, 32 206, 56 224 C 70 234, 82 218, 74 202 C 66 186, 60 172, 74 156 Z"
              fill={tone("pinna", "#fecdd3")}
              stroke="#e11d48"
              strokeWidth={1.5}
            />,
          )}
          <path d="M62 104 C 44 80, 24 92, 26 124 C 28 156, 42 178, 56 194" fill="none" stroke="#e11d48" strokeWidth={1.2} opacity={0.6} pointerEvents="none" />
          {part("canal", <path d="M70 114 L 155 110 L 155 148 L 70 144 Z" fill={tone("canal", "#fef3c7")} stroke="#f59e0b" strokeWidth={1.5} />)}
          <rect x={160} y={84} width={57} height={86} rx={10} fill="#e0f2fe" stroke="#7dd3fc" />
          {part(
            "tube",
            <g>
              <path d="M200 166 C 208 214, 226 240, 262 262" stroke={tone("tube", "#5eead4")} strokeWidth={12} fill="none" strokeLinecap="round" />
              <path d="M200 166 C 208 214, 226 240, 262 262" stroke="#ccfbf1" strokeWidth={4} fill="none" strokeLinecap="round" />
            </g>,
          )}
          {part(
            "drum",
            <g>
              <path d="M155 104 L 160 154" stroke="transparent" strokeWidth={12} />
              <path d="M155 104 L 160 154" stroke={tone("drum", "#475569")} strokeWidth={4} strokeLinecap="round" />
            </g>,
          )}
          {part(
            "malleus",
            <g fill={tone("malleus", "#fb923c")} stroke={tone("malleus", "#fb923c")}>
              <path d="M159 140 L 168 102" strokeWidth={5} strokeLinecap="round" />
              <circle cx={170} cy={98} r={7} stroke="none" />
            </g>,
          )}
          {part(
            "incus",
            <g fill={tone("incus", "#eab308")} stroke={tone("incus", "#eab308")}>
              <circle cx={183} cy={97} r={7} stroke="none" />
              <path d="M184 100 Q 194 108 191 128" strokeWidth={5} fill="none" strokeLinecap="round" />
            </g>,
          )}
          {part(
            "stapes",
            <g stroke={tone("stapes", "#65a30d")} fill="none" strokeLinecap="round">
              <path d="M190 129 L 200 129" strokeWidth={4} />
              <path d="M200 129 L 213 121 M200 129 L 213 137" strokeWidth={3} />
              <path d="M214 119 L 214 139" strokeWidth={4} />
            </g>,
          )}
          {part("oval", <ellipse cx={219} cy={129} rx={3.5} ry={12} fill={tone("oval", "#38bdf8")} stroke="#0284c7" strokeWidth={1} />)}
          {part(
            "nerve",
            <g stroke={tone("nerve", "#facc15")} fill="none" strokeLinecap="round" strokeWidth={8}>
              <path d="M262 118 C 300 114, 330 124, 396 122" />
              <path d="M296 186 C 320 164, 336 140, 352 124" strokeWidth={6} />
            </g>,
          )}
          {part(
            "canals",
            <g stroke={tone("canals", "#a78bfa")} fill="none" strokeWidth={6} strokeLinecap="round">
              <path d="M234 108 C 214 54, 270 36, 258 104" />
              <path d="M250 104 C 262 44, 318 62, 266 114" />
              <path d="M262 126 C 300 118, 316 146, 264 136" />
            </g>,
          )}
          {part(
            "cochlea",
            <g>
              <path d="M240 136 L 256 194" stroke={tone("cochlea", "#f472b6")} strokeWidth={10} strokeLinecap="round" />
              <path d={COCHLEA} stroke={tone("cochlea", "#f472b6")} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d={COCHLEA} stroke="#fce7f3" strokeWidth={3} fill="none" strokeLinecap="round" />
            </g>,
          )}
          {part("vestibule", <ellipse cx={244} cy={124} rx={20} ry={16} fill={tone("vestibule", "#ddd6fe")} stroke="#7c3aed" strokeWidth={1.5} />)}
          <text x={272} y={262} fontSize={10} fill="#0f766e">
            {lang === "pl" ? "→ gardło" : "→ глотка"}
          </text>
        </>
      )}
    />
  );
}

// ---------- the way of sound ----------

const SOUND_PATH: Txt[] = [
  r("małżowina uszna", "ушная раковина"),
  r("przewód słuchowy zewnętrzny", "наружный слуховой проход"),
  r("błona bębenkowa", "барабанная перепонка"),
  r("młoteczek", "молоточек"),
  r("kowadełko", "наковальня"),
  r("strzemiączko", "стремечко"),
  r("okienko owalne", "овальное окно"),
  r("płyn w ślimaku", "жидкость улитки"),
  r("komórki zmysłowe narządu Cortiego", "волосковые клетки кортиева органа"),
  r("nerw przedsionkowo-ślimakowy", "преддверно-улитковый нерв"),
  r("ośrodek słuchu w płacie skroniowym", "слуховой центр в височной доле"),
];

// ---------- cochlea and pitch ----------

const F_MIN = 20;
const F_MAX = 20000;
const freqOf = (u: number) => F_MIN * (F_MAX / F_MIN) ** u;
const uOf = (f: number) => Math.log(f / F_MIN) / Math.log(F_MAX / F_MIN);
/** Greenwood's map for the human cochlea: the place (0 = base, 1 = apex) that vibrates most at a frequency */
const placeOf = (f: number) => 1 - Math.log10(f / 165.4 + 0.88) / 2.1;

const X0 = 40;
const X1 = 320;
const PRESETS = [100, 440, 1000, 4000, 16000];

function usePhase(on: boolean) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!on) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    const tick = () => {
      setPhase((p) => (p + 0.18) % (Math.PI * 2));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [on]);
  return phase;
}

const fmtHz = (f: number, lang: BioLang) => {
  const hz = lang === "pl" ? "Hz" : "Гц";
  const khz = lang === "pl" ? "kHz" : "кГц";
  if (f < 1000) return `${Math.round(f)} ${hz}`;
  return `${num(f / 1000, f < 10000 ? 1 : 0)} ${khz}`;
};

function Cochlea({ lang }: { lang: BioLang }) {
  const [u, setU] = useState(uOf(440));
  const f = freqOf(u);
  const place = Math.min(0.98, Math.max(0.02, placeOf(f)));
  const xp = X0 + place * (X1 - X0);
  const phase = usePhase(true);
  // the travelling wave grows slowly from the base, peaks at its place and dies out quickly after it
  const pts: string[] = [];
  for (let x = X0; x <= X1; x += 2) {
    const s = x <= xp ? 70 : 10;
    const env = 20 * Math.exp(-(((x - xp) / s) ** 2));
    const y = 80 + env * Math.sin(0.22 * (x - X0) - phase);
    pts.push(`${x} ${y.toFixed(1)}`);
  }
  const width = (x: number) => 6 + ((x - X0) / (X1 - X0)) * 20;
  const band = `M${X0} ${80 - width(X0) / 2} L ${X1} ${80 - width(X1) / 2} L ${X1} ${80 + width(X1) / 2} L ${X0} ${80 + width(X0) / 2} Z`;
  const text =
    f < 600
      ? r(
          "Niskie dźwięki: fala biegnie aż w pobliże szczytu ślimaka, gdzie błona podstawna jest szeroka i wiotka.",
          "Низкие звуки: волна доходит почти до верхушки улитки, где основная мембрана широкая и податливая.",
        )
      : f < 4000
        ? r(
            "Średnie dźwięki — m.in. większość głosek mowy — pobudzają środkową część ślimaka.",
            "Средние звуки — в том числе большинство звуков речи — возбуждают среднюю часть улитки.",
          )
        : r(
            "Wysokie dźwięki pobudzają komórki przy podstawie ślimaka, gdzie błona jest wąska i sztywna. Te komórki najłatwiej ulegają uszkodzeniu — hałas i wiek odbierają nam najpierw wysokie tony.",
            "Высокие звуки возбуждают клетки у основания улитки, где мембрана узкая и жёсткая. Эти клетки повреждаются легче всего — шум и возраст сначала лишают нас высоких тонов.",
          );
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 340 150" className="w-full" role="img" aria-label={`${fmtHz(f, lang)}`}>
          <path d={`M${X0 - 14} 44 L ${X1 + 6} 50 L ${X1 + 6} 110 L ${X0 - 14} 116 Z`} fill="#fdf2f8" stroke="#f9a8d4" />
          <path d={band} fill="#fbcfe8" />
          <polyline points={pts.join(" ")} fill="none" stroke="#db2777" strokeWidth={2.5} strokeLinejoin="round" />
          <circle cx={xp} cy={80} r={5} fill="#16a34a" stroke="white" strokeWidth={1.5} />
          <ellipse cx={X0 - 14} cy={62} rx={3} ry={9} fill="#38bdf8" />
          <ellipse cx={X0 - 14} cy={98} rx={3} ry={7} fill="#94a3b8" />
          <text x={X0 - 8} y={36} fontSize={10} fill="#475569">
            {lang === "pl" ? "podstawa (okienko owalne)" : "основание (овальное окно)"}
          </text>
          <text x={X1 + 4} y={36} textAnchor="end" fontSize={10} fill="#475569">
            {lang === "pl" ? "szczyt ślimaka" : "верхушка улитки"}
          </text>
          <text x={X0 - 8} y={132} fontSize={9} fill="#64748b">
            {lang === "pl" ? "błona wąska i sztywna" : "мембрана узкая и жёсткая"}
          </text>
          <text x={X1 + 4} y={132} textAnchor="end" fontSize={9} fill="#64748b">
            {lang === "pl" ? "szeroka i wiotka" : "широкая и мягкая"}
          </text>
        </svg>
        <label className="mt-2 block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Częstotliwość dźwięku" : "Частота звука"}: <span className="tabular-nums">{fmtHz(f, lang)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.005}
            value={u}
            onChange={(e) => setU(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-pink-600"
            aria-valuetext={fmtHz(f, lang)}
          />
          <span className="mt-1 flex justify-between text-xs font-normal text-slate-500">
            <span>20 {lang === "pl" ? "Hz" : "Гц"}</span>
            <span>20 {lang === "pl" ? "kHz" : "кГц"}</span>
          </span>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Choice key={p} state={Math.abs(f - p) / p < 0.03 ? "active" : "idle"} onClick={() => setU(uOf(p))}>
              {fmtHz(p, lang)}
            </Choice>
          ))}
        </div>
      </div>
      <div className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
        <p>
          {lang === "pl" ? "Najsilniej drga miejsce odległe od podstawy o" : "Сильнее всего колеблется место на расстоянии от основания"}{" "}
          <b className="tabular-nums">{Math.round(place * 100)}%</b> {lang === "pl" ? "długości ślimaka." : "длины улитки."}
        </p>
        <p>{text[lang]}</p>
        <p className="text-sm text-slate-500">
          {lang === "pl"
            ? "Mózg rozpoznaje wysokość dźwięku po tym, które komórki zmysłowe zostały pobudzone, a głośność — po liczbie impulsów."
            : "Мозг определяет высоту звука по тому, какие рецепторные клетки возбуждены, а громкость — по количеству импульсов."}
        </p>
      </div>
    </div>
  );
}

// ---------- balance ----------

function Otoliths({ lang }: { lang: BioLang }) {
  const [tilt, setTilt] = useState(0);
  const shift = 16 * Math.sin((tilt * Math.PI) / 180);
  const cells = [150, 175, 200, 225, 250, 275];
  const level = Math.abs(tilt) < 4;
  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <h3 className="text-base font-semibold text-slate-800">{lang === "pl" ? "Przedsionek: otolity" : "Преддверие: отолиты"}</h3>
      <svg viewBox="0 0 300 150" className="mt-2 w-full" role="img" aria-label={lang === "pl" ? `przechylenie głowy ${tilt}°` : `наклон головы ${tilt}°`}>
        <g transform={`rotate(${tilt} 60 80)`}>
          <ellipse cx={60} cy={82} rx={30} ry={36} fill="#fde68a" stroke="#d97706" strokeWidth={2} />
          <path d="M31 70 C 30 38, 92 34, 90 76 C 84 60, 60 52, 31 70 Z" fill="#92400e" />
          <path d="M31 80 L 23 92 L 32 94" fill="#fde68a" stroke="#d97706" strokeWidth={2} strokeLinejoin="round" />
          <circle cx={42} cy={76} r={2.5} fill="#334155" />
          <path d="M37 106 Q 42 109 47 106" stroke="#b45309" strokeWidth={1.5} fill="none" />
          <ellipse cx={66} cy={84} rx={5} ry={8} fill="#f59e0b" />
        </g>
        <path d={`M66 80 L 132 40 M66 80 L 132 140`} stroke="#cbd5e1" strokeDasharray="3 3" />
        <rect x={132} y={30} width={160} height={116} rx={10} fill="white" stroke="#cbd5e1" />
        <g style={{ transition: "transform .3s" }} transform={`translate(${shift} 0)`}>
          <rect x={140} y={66} width={144} height={22} rx={4} fill="#e0e7ff" stroke="#818cf8" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
            <rect key={k} x={146 + k * 12.6} y={56 + (k % 2) * 3} width={8} height={8} rx={1.5} fill="#94a3b8" transform={`rotate(${k * 17} ${150 + k * 12.6} ${60 + (k % 2) * 3})`} />
          ))}
        </g>
        {cells.map((x) => (
          <g key={x}>
            <path d={`M${x} 110 Q ${x} 96 ${x + shift * 0.9} 80`} stroke="#e11d48" strokeWidth={2} fill="none" style={{ transition: "d .3s" }} />
            <rect x={x - 9} y={110} width={18} height={30} rx={5} fill="#fecdd3" stroke="#e11d48" />
          </g>
        ))}
        <g transform={`rotate(${-tilt} 280 46)`}>
          <path d="M280 36 L 280 56" stroke="#0f172a" strokeWidth={2} />
          <path d="M275 51 L 280 58 L 285 51" fill="none" stroke="#0f172a" strokeWidth={2} />
        </g>
        <text x={270} y={46} textAnchor="end" fontSize={9} fill="#0f172a">
          g
        </text>
      </svg>
      <label className="mt-2 block text-sm font-semibold text-slate-700">
        {lang === "pl" ? "Przechyl głowę" : "Наклони голову"}: <span className="tabular-nums">{num(tilt)}°</span>
        <input type="range" min={-40} max={40} value={tilt} onChange={(e) => setTilt(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-indigo-600" />
      </label>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700" aria-live="polite">
        {level
          ? lang === "pl"
            ? "Głowa prosto: otolity uciskają galaretowatą błonę równomiernie, rzęski komórek zmysłowych są wyprostowane."
            : "Голова прямо: отолиты давят на студенистую мембрану равномерно, волоски рецепторных клеток прямые."
          : lang === "pl"
            ? "Przechylenie: ciężkie otolity (kryształki węglanu wapnia) ściągają galaretowatą błonę w dół, rzęski komórek zmysłowych się wyginają i do mózgu płyną impulsy — mózg wie, że głowa jest przechylona."
            : "Наклон: тяжёлые отолиты (кристаллики карбоната кальция) смещают студенистую мембрану вниз, волоски рецепторных клеток изгибаются, и в мозг идут импульсы — мозг знает, что голова наклонена."}
      </p>
    </div>
  );
}

type Spin = "rest" | "start" | "steady" | "stop";

const SPIN_TEXT: Record<Spin, Txt> = {
  rest: r(
    "Głowa nieruchoma: śródchłonka stoi w miejscu, a osklepek — galaretowata „klapka”, w której tkwią rzęski komórek zmysłowych — jest wyprostowany.",
    "Голова неподвижна: эндолимфа стоит на месте, а купула — студенистая «заслонка», в которую погружены волоски рецепторных клеток, — прямая.",
  ),
  start: r(
    "Początek obrotu: kanał obraca się razem z głową, ale śródchłonka z bezwładności zostaje w tyle i odgina osklepek. Mózg odbiera sygnał: obracam się!",
    "Начало вращения: канал поворачивается вместе с головой, а эндолимфа по инерции отстаёт и отгибает купулу. Мозг получает сигнал: я вращаюсь!",
  ),
  steady: r(
    "Obrót ze stałą prędkością: po chwili śródchłonka porusza się razem z kanałem i osklepek się prostuje — przestajemy czuć obrót, choć ciągle się kręcimy.",
    "Вращение с постоянной скоростью: через некоторое время эндолимфа движется вместе с каналом, и купула выпрямляется — мы перестаём ощущать вращение, хотя всё ещё кружимся.",
  ),
  stop: r(
    "Nagłe zatrzymanie: kanał stoi, ale śródchłonka dalej płynie i odgina osklepek w przeciwną stronę. Mózg „sądzi”, że obracamy się w drugą stronę — stąd zawroty głowy po zejściu z karuzeli.",
    "Резкая остановка: канал стоит, а эндолимфа продолжает течь и отгибает купулу в другую сторону. Мозгу «кажется», что мы вращаемся в обратную сторону, — отсюда головокружение после карусели.",
  ),
};

function Canals({ lang }: { lang: BioLang }) {
  const [state, setState] = useState<Spin>("rest");
  useEffect(() => {
    if (state !== "start" && state !== "stop") return;
    const id = window.setTimeout(() => setState(state === "start" ? "steady" : "rest"), 3500);
    return () => window.clearTimeout(id);
  }, [state]);
  const spinning = state === "start" || state === "steady";
  // the canal turns clockwise; lagging fluid bends the cupula back, coasting fluid bends it forward
  const bend = state === "start" ? -28 : state === "stop" ? 28 : 0;
  const flow = state === "start" ? -1 : state === "stop" ? 1 : 0;
  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <h3 className="text-base font-semibold text-slate-800">{lang === "pl" ? "Kanał półkolisty: obrót" : "Полукружный канал: вращение"}</h3>
      <svg viewBox="0 0 300 150" className="mt-2 w-full" role="img" aria-label={SPIN_TEXT[state][lang]}>
        <g
          className={spinning ? "animate-spin" : undefined}
          style={{ transformBox: "view-box", transformOrigin: "90px 76px", animationDuration: "2.4s" }}
        >
          <circle cx={90} cy={76} r={52} fill="none" stroke="#ddd6fe" strokeWidth={16} />
          <circle cx={90} cy={76} r={52} fill="none" stroke="#7c3aed" strokeWidth={1} />
          <circle cx={90} cy={24} r={15} fill="#ddd6fe" stroke="#7c3aed" />
          <path d="M84 36 L 96 36" stroke="#e11d48" strokeWidth={4} strokeLinecap="round" />
          <path
            d="M90 36 C 87 28, 93 20, 90 12"
            stroke="#e11d48"
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
            style={{ transformBox: "fill-box", transformOrigin: "50% 100%", transform: `rotate(${bend}deg)`, transition: "transform .6s" }}
          />
        </g>
        {flow !== 0 && (
          <g fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round">
            <path d={flow > 0 ? "M150 70 A 60 60 0 0 1 120 125" : "M120 125 A 60 60 0 0 0 150 70"} />
            <path d={flow > 0 ? "M120 125 l 10 -1 M120 125 l 2 -10" : "M150 70 l -2 10 M150 70 l -9 5"} />
          </g>
        )}
        <text x={168} y={50} fontSize={10} fill="#475569">
          {lang === "pl" ? "bańka z osklepkiem" : "ампула с купулой"}
        </text>
        <path d="M166 47 L 108 26" stroke="#94a3b8" />
        <text x={168} y={100} fontSize={10} fill="#2563eb">
          {flow !== 0 ? (lang === "pl" ? "ruch śródchłonki" : "движение эндолимфы") : ""}
        </text>
        <text x={168} y={130} fontSize={10} fill="#475569">
          {spinning ? (lang === "pl" ? "↻ głowa się obraca" : "↻ голова вращается") : lang === "pl" ? "głowa nieruchoma" : "голова неподвижна"}
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-2">
        <Choice state={spinning ? "active" : "idle"} disabled={spinning} onClick={() => setState("start")}>
          🎠 {lang === "pl" ? "Zacznij się kręcić" : "Начать вращение"}
        </Choice>
        <Choice disabled={!spinning} onClick={() => setState("stop")}>
          ✋ {lang === "pl" ? "Stop" : "Стоп"}
        </Choice>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700" aria-live="polite">
        {SPIN_TEXT[state][lang]}
      </p>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r(
      "Ucho zewnętrzne: małżowina i przewód słuchowy; środkowe: jama bębenkowa z kosteczkami (młoteczek, kowadełko, strzemiączko) i trąbka słuchowa; wewnętrzne (błędnik): ślimak, przedsionek i kanały półkoliste.",
      "Наружное ухо: раковина и слуховой проход; среднее: барабанная полость с косточками (молоточек, наковальня, стремечко) и слуховая труба; внутреннее (лабиринт): улитка, преддверие и полукружные каналы.",
    ),
  ],
  s2: [
    r(
      "Kosteczki słuchowe i różnica powierzchni błony bębenkowej i okienka owalnego wzmacniają ciśnienie drgań ok. 20 razy.",
      "Слуховые косточки и разница площадей барабанной перепонки и овального окна усиливают давление колебаний примерно в 20 раз.",
    ),
    r("Receptory słuchu — komórki zmysłowe z rzęskami — leżą w narządzie Cortiego w ślimaku.", "Рецепторы слуха — волосковые клетки — находятся в кортиевом органе улитки."),
  ],
  s3: [
    r(
      "Człowiek słyszy dźwięki od ok. 16–20 Hz do ok. 20 kHz; wysokie tony odbiera podstawa ślimaka, niskie — jego szczyt.",
      "Человек слышит звуки примерно от 16–20 Гц до 20 кГц; высокие тоны воспринимает основание улитки, низкие — её верхушка.",
    ),
    r("Długotrwały hałas (powyżej ok. 85 dB) trwale uszkadza komórki zmysłowe ślimaka.", "Длительный шум (громче примерно 85 дБ) необратимо повреждает рецепторные клетки улитки."),
  ],
  s4: [
    r(
      "Przedsionek (woreczek i łagiewka z otolitami) odbiera położenie głowy i ruchy prostoliniowe, kanały półkoliste — ruchy obrotowe.",
      "Преддверие (мешочек и маточка с отолитами) воспринимает положение головы и прямолинейные движения, полукружные каналы — вращение.",
    ),
    r(
      "Mózg porównuje sygnały z narządu równowagi, oczu i proprioreceptorów; ich sprzeczność (np. czytanie w jadącym aucie) wywołuje chorobę lokomocyjną.",
      "Мозг сопоставляет сигналы от органа равновесия, глаз и проприорецепторов; их противоречие (например, чтение в едущей машине) вызывает укачивание.",
    ),
  ],
};

export default function EarLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="ear" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="ear-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <EarMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="ear-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <OrderGame lang={lang} title={T.s2} start={r("fala dźwiękowa", "звуковая волна")} steps={SOUND_PATH} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="ear-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Cochlea lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="ear-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Otoliths lang={lang} />
          <Canals lang={lang} />
        </div>
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
