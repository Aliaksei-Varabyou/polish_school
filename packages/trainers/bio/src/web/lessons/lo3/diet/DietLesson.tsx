// Lesson for LO3 §4.6 "Zasady racjonalnego odżywiania się" and §4.7 "Choroby układu pokarmowego"
// (Biologia na czasie 3, zakres rozszerzony) — one lesson for both paragraphs: most diseases of the
// digestive system follow from diet and hygiene. Terms follow templates/data/nutrition.ts (DIET_TERMS)
// and templates/data/disorders.ts (DIGESTIVE_DISORDERS).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { MatchQuiz, TwoWaySort, type QuizItem, type QuizOption, type SortItem } from "@portal/lessons";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Racjonalna dieta dostarcza tyle energii, ile zużywamy, i wszystkich składników w odpowiednich proporcjach. Nadmiar energii odkłada się jako tkanka tłuszczowa, a niedobór składników prowadzi do chorób niedoborowych. Wielu chorobom układu pokarmowego można zapobiec dietą i higieną.",
    "Рациональное питание даёт столько энергии, сколько мы тратим, и все вещества в нужных пропорциях. Избыток энергии откладывается в виде жировой ткани, а недостаток веществ ведёт к болезням недостаточности. Многие болезни пищеварительной системы можно предупредить правильным питанием и гигиеной.",
  ),
  s1: r("Piramida zdrowego żywienia", "Пирамида здорового питания"),
  s1intro: r(
    "Piramida Instytutu Żywności i Żywienia pokazuje proporcje grup produktów: im niżej, tym więcej. U jej podstawy jest ruch. Dotknij poziomu.",
    "Пирамида польского Института питания показывает пропорции групп продуктов: чем ниже, тем больше. В её основании — движение. Нажми на уровень.",
  ),
  s2: r("Bilans energetyczny", "Энергетический баланс"),
  s2intro: r(
    "Podstawowa przemiana materii (PPM) to energia potrzebna w spoczynku — w przybliżeniu 1 kcal na każdy kilogram masy ciała na godzinę. Całkowita przemiana materii (CPM) uwzględnia też aktywność.",
    "Основной обмен — энергия, нужная в покое, — примерно 1 ккал на каждый килограмм массы тела в час. Общий обмен учитывает ещё и активность.",
  ),
  s3: r("Wskaźnik masy ciała (BMI)", "Индекс массы тела (ИМТ)"),
  s3intro: r(
    "BMI = masa ciała [kg] : (wzrost [m])². Ocena według WHO dotyczy dorosłych; u dzieci i młodzieży wynik porównuje się z siatkami centylowymi dla wieku i płci.",
    "ИМТ = масса тела [кг] : (рост [м])². Оценка ВОЗ относится к взрослым; у детей и подростков результат сравнивают с центильными таблицами для возраста и пола.",
  ),
  s4: r("Nawyki zdrowe i szkodliwe", "Полезные и вредные привычки"),
  s4intro: r("Które zachowania chronią układ pokarmowy, a które mu szkodzą?", "Какие привычки защищают пищеварительную систему, а какие ей вредят?"),
  s5: r("Choroby układu pokarmowego", "Болезни пищеварительной системы"),
  s5intro: r(
    "Choroby układu pokarmowego mają różne przyczyny: drobnoustroje, pasożyty, zaburzenia przemiany materii, alkohol, a nawet zaburzenia psychiczne.",
    "У болезней пищеварительной системы разные причины: микроорганизмы, паразиты, нарушения обмена веществ, алкоголь и даже психические расстройства.",
  ),
} satisfies Record<string, Txt>;

// ---------- food pyramid ----------

interface Level {
  id: string;
  icon: string;
  short: Txt;
  name: Txt;
  text: Txt;
  fill: string;
}

const LEVELS: Level[] = [
  {
    id: "activity",
    icon: "🏃",
    short: r("aktywność", "активность"),
    name: r("Aktywność fizyczna", "Физическая активность"),
    text: r(
      "Podstawa piramidy. Ruch zwiększa zużycie energii, wzmacnia mięśnie, kości i serce. Młodzieży zaleca się co najmniej 60 minut aktywności dziennie.",
      "Основание пирамиды. Движение увеличивает расход энергии, укрепляет мышцы, кости и сердце. Подросткам рекомендуют не менее 60 минут активности в день.",
    ),
    fill: "#bae6fd",
  },
  {
    id: "veg",
    icon: "🥦",
    short: r("warzywa i owoce", "овощи и фрукты"),
    name: r("Warzywa i owoce", "Овощи и фрукты"),
    text: r(
      "Jedz je jak najczęściej — powinny stanowić co najmniej połowę tego, co jesz, w proporcji ok. ¾ warzyw i ¼ owoców. Dostarczają witamin, soli mineralnych i błonnika.",
      "Ешь их как можно чаще — они должны составлять не меньше половины того, что ты ешь, примерно ¾ овощей и ¼ фруктов. Дают витамины, минеральные соли и пищевые волокна.",
    ),
    fill: "#bbf7d0",
  },
  {
    id: "grains",
    icon: "🌾",
    short: r("zboża", "зерновые"),
    name: r("Produkty zbożowe", "Зерновые продукты"),
    text: r(
      "Najlepiej pełnoziarniste: pieczywo razowe, kasze, płatki owsiane, brązowy ryż. Są źródłem węglowodanów złożonych, błonnika i witamin z grupy B.",
      "Лучше цельнозерновые: хлеб из муки грубого помола, крупы, овсяные хлопья, бурый рис. Это источник сложных углеводов, пищевых волокон и витаминов группы B.",
    ),
    fill: "#fde68a",
  },
  {
    id: "dairy",
    icon: "🥛",
    short: r("nabiał", "молочные"),
    name: r("Mleko i przetwory mleczne", "Молоко и молочные продукты"),
    text: r(
      "Co najmniej 2 duże szklanki mleka dziennie — można je zastąpić jogurtem, kefirem i częściowo serem. To główne źródło wapnia i białka pełnowartościowego.",
      "Не меньше 2 больших стаканов молока в день — его можно заменить йогуртом, кефиром и отчасти сыром. Главный источник кальция и полноценного белка.",
    ),
    fill: "#e0e7ff",
  },
  {
    id: "protein",
    icon: "🐟",
    short: r("białko", "белок"),
    name: r("Ryby, nasiona roślin strączkowych, jaja, mięso", "Рыба, семена бобовых, яйца, мясо"),
    text: r(
      "Jedz ryby, nasiona roślin strączkowych i jaja. Ograniczaj mięso, zwłaszcza czerwone i przetworzone — do ok. 0,5 kg tygodniowo.",
      "Ешь рыбу, семена бобовых и яйца. Ограничивай мясо, особенно красное и переработанное, — примерно до 0,5 кг в неделю.",
    ),
    fill: "#fecdd3",
  },
  {
    id: "fats",
    icon: "🥜",
    short: r("tłuszcze", "жиры"),
    name: r("Tłuszcze i orzechy", "Жиры и орехи"),
    text: r(
      "Szczyt piramidy — najmniej. Ograniczaj tłuszcze zwierzęce i zastępuj je olejami roślinnymi; garść orzechów dostarcza nienasyconych kwasów tłuszczowych.",
      "Вершина пирамиды — меньше всего. Ограничивай животные жиры и заменяй их растительными маслами; горсть орехов даёт ненасыщенные жирные кислоты.",
    ),
    fill: "#fef08a",
  },
];

const EXTRAS: Level[] = [
  { id: "water", icon: "💧", short: r("woda", "вода"), name: r("Woda", "Вода"), text: r("Pij co najmniej 1,5 litra wody dziennie, więcej w upał i przy wysiłku.", "Пей не меньше 1,5 литра воды в день, больше — в жару и при нагрузке."), fill: "" },
  { id: "sugar", icon: "🍬", short: r("cukier", "сахар"), name: r("Cukier i słodycze", "Сахар и сладости"), text: r("Unikaj cukru, słodyczy i słodzonych napojów — to „puste kalorie” sprzyjające otyłości i próchnicy.", "Избегай сахара, сладостей и сладких напитков — это «пустые калории», способствующие ожирению и кариесу."), fill: "" },
  { id: "salt", icon: "🧂", short: r("sól", "соль"), name: r("Sól", "Соль"), text: r("Nie dosalaj potraw; zamiast soli używaj ziół. Nadmiar sodu sprzyja nadciśnieniu.", "Не досаливай еду; вместо соли используй травы. Избыток натрия способствует гипертонии."), fill: "" },
  { id: "alcohol", icon: "🚫", short: r("alkohol", "алкоголь"), name: r("Alkohol", "Алкоголь"), text: r("Nie spożywaj alkoholu — uszkadza wątrobę (prowadzi do jej marskości) i błonę śluzową żołądka.", "Не употребляй алкоголь — он повреждает печень (ведёт к циррозу) и слизистую оболочку желудка."), fill: "" },
];

const APEX = 10;
const BASE = 232;
const LH = (BASE - APEX) / LEVELS.length;
const hw = (y: number) => (140 * (y - APEX)) / (BASE - APEX);

function Pyramid({ lang }: { lang: BioLang }) {
  const [id, setId] = useState("activity");
  const item = [...LEVELS, ...EXTRAS].find((l) => l.id === id)!;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 300 240" className="mx-auto w-full max-w-[400px] select-none" role="img" aria-label={T.s1[lang]}>
          {LEVELS.map((l, i) => {
            const yb = BASE - i * LH;
            const yt = yb - LH;
            const on = l.id === id;
            const mid = (yb + yt) / 2;
            const wide = hw(mid) > 30;
            return (
              <g
                key={l.id}
                role="button"
                tabIndex={0}
                aria-label={l.name[lang]}
                aria-pressed={on}
                onClick={() => setId(l.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setId(l.id);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <path
                  d={`M${150 - hw(yb)} ${yb} L ${150 + hw(yb)} ${yb} L ${150 + hw(yt)} ${yt} L ${150 - hw(yt)} ${yt} Z`}
                  fill={on ? "#6ee7b7" : l.fill}
                  stroke={on ? "#047857" : "white"}
                  strokeWidth={on ? 3 : 2}
                  strokeLinejoin="round"
                />
                <text x={150} y={wide ? mid - 1 : mid + 6} textAnchor="middle" fontSize={wide ? 14 : 12}>
                  {l.icon}
                </text>
                {wide && (
                  <text x={150} y={mid + 13} textAnchor="middle" fontSize={9} fontWeight={600} fill="#334155">
                    {l.short[lang]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="mt-3">
          <div className="mb-1.5 text-xs font-semibold text-slate-500">{lang === "pl" ? "Poza piramidą:" : "Вне пирамиды:"}</div>
          <div className="flex flex-wrap gap-2">
            {EXTRAS.map((x) => (
              <Choice key={x.id} state={x.id === id ? "active" : "idle"} onClick={() => setId(x.id)}>
                {x.icon} {x.short[lang]}
              </Choice>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
        <h3 className="text-base font-semibold text-emerald-900">
          {item.icon} {item.name[lang]}
        </h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{item.text[lang]}</p>
      </div>
    </div>
  );
}

// ---------- energy balance ----------

const PAL: { value: number; name: Txt }[] = [
  { value: 1.4, name: r("mała", "низкая") },
  { value: 1.6, name: r("umiarkowana", "умеренная") },
  { value: 1.8, name: r("duża", "высокая") },
  { value: 2.0, name: r("bardzo duża", "очень высокая") },
];

function Balance({ lang }: { lang: BioLang }) {
  const [mass, setMass] = useState(60);
  const [pal, setPal] = useState(1.6);
  const [intake, setIntake] = useState(2200);
  const ppm = 24 * mass;
  const cpm = Math.round(ppm * pal);
  const diff = intake - cpm;
  const month = (diff * 30) / 7000;
  const deg = Math.max(-14, Math.min(14, -diff / 40));
  const a = (deg * Math.PI) / 180;
  const L = { x: 130 - 90 * Math.cos(a), y: 62 - 90 * Math.sin(a) };
  const R = { x: 130 + 90 * Math.cos(a), y: 62 + 90 * Math.sin(a) };
  const kcal = lang === "pl" ? "kcal" : "ккал";
  const state =
    Math.abs(diff) < 100
      ? r("Bilans zrównoważony — masa ciała pozostaje mniej więcej stała.", "Баланс уравновешен — масса тела остаётся примерно постоянной.")
      : diff > 0
        ? r("Dodatni bilans energetyczny: nadmiar energii organizm magazynuje głównie jako tłuszcz — masa ciała rośnie.", "Положительный энергетический баланс: избыток энергии организм запасает в основном в виде жира — масса тела растёт.")
        : r("Ujemny bilans energetyczny: organizm sięga do zapasów (glikogenu, tłuszczu) — masa ciała spada.", "Отрицательный энергетический баланс: организм расходует запасы (гликоген, жир) — масса тела снижается.");
  const pan = (p: { x: number; y: number }, label: string, value: number, color: string) => (
    <g style={{ transition: "transform .4s" }}>
      <path d={`M${p.x} ${p.y} L ${p.x - 28} ${p.y + 30} M${p.x} ${p.y} L ${p.x + 28} ${p.y + 30}`} stroke="#94a3b8" strokeWidth={1.5} />
      <path d={`M${p.x - 36} ${p.y + 30} Q ${p.x} ${p.y + 56} ${p.x + 36} ${p.y + 30} Z`} fill={color} stroke="#475569" strokeWidth={1.5} />
      <text x={p.x} y={p.y + 43} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">
        {value}
      </text>
      <text x={p.x} y={p.y + 70} textAnchor="middle" fontSize={9} fill="#475569">
        {label}
      </text>
    </g>
  );
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Masa ciała" : "Масса тела"}: <span className="tabular-nums">{mass} {lang === "pl" ? "kg" : "кг"}</span>
          <input type="range" min={40} max={120} value={mass} onChange={(e) => setMass(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-emerald-600" />
        </label>
        <div>
          <div className="text-sm font-semibold text-slate-700">{lang === "pl" ? "Aktywność fizyczna" : "Физическая активность"}</div>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
            {PAL.map((p) => (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={pal === p.value}
                onClick={() => setPal(p.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors ${
                  pal === p.value ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
                }`}
              >
                {p.name[lang]} (× {num(p.value, 1)})
              </button>
            ))}
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Energia z pożywienia" : "Энергия из пищи"}: <span className="tabular-nums">{intake} {kcal} / {lang === "pl" ? "dobę" : "сутки"}</span>
          <input type="range" min={1000} max={4500} step={50} value={intake} onChange={(e) => setIntake(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-amber-500" />
        </label>
      </div>
      <div className="space-y-3">
        <svg viewBox="0 0 260 170" className="w-full" role="img" aria-label={state[lang]}>
          <rect width={260} height={170} rx={12} fill="#f8fafc" />
          <path d="M130 62 L 112 160 L 148 160 Z" fill="#cbd5e1" />
          <path d={`M${L.x} ${L.y} L ${R.x} ${R.y}`} stroke="#334155" strokeWidth={5} strokeLinecap="round" />
          <circle cx={130} cy={62} r={5} fill="#334155" />
          {pan(L, lang === "pl" ? "pobrana" : "получено", intake, "#fde68a")}
          {pan(R, lang === "pl" ? "zużyta (CPM)" : "потрачено", cpm, "#bae6fd")}
        </svg>
        <div className="space-y-1 rounded-xl bg-slate-50 px-4 py-3 text-[15px] text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          <p>
            {lang === "pl" ? "PPM" : "Основной обмен"} ≈ 1 × {mass} × 24 = <b className="tabular-nums">{ppm} {kcal}</b>
          </p>
          <p>
            {lang === "pl" ? "CPM" : "Общий обмен"} ≈ {ppm} × {num(pal, 1)} = <b className="tabular-nums">{cpm} {kcal}</b>
          </p>
          <p>
            {lang === "pl" ? "Bilans" : "Баланс"}: <b className="tabular-nums">{diff > 0 ? "+" : ""}{num(diff)} {kcal}</b> / {lang === "pl" ? "dobę" : "сутки"} →{" "}
            <b className="tabular-nums">
              {month > 0 ? "+" : ""}
              {num(month, 1)} {lang === "pl" ? "kg na miesiąc" : "кг в месяц"}
            </b>
          </p>
          <p className="text-sm">{state[lang]}</p>
          <p className="text-xs text-slate-500">
            {lang === "pl"
              ? "Przyjęto, że 1 kg tkanki tłuszczowej to ok. 7000 kcal. To model uproszczony — organizm częściowo dostosowuje przemianę materii."
              : "Принято, что 1 кг жировой ткани ≈ 7000 ккал. Модель упрощённая — организм частично подстраивает обмен веществ."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- BMI ----------

const BMI_CATS: { from: number; to: number; name: Txt; color: string; text: Txt }[] = [
  { from: 15, to: 18.5, name: r("niedowaga", "недостаточная масса"), color: "#7dd3fc", text: r("Ryzyko niedoborów pokarmowych, osłabienia odporności i osteoporozy.", "Риск дефицита питательных веществ, ослабления иммунитета и остеопороза.") },
  { from: 18.5, to: 25, name: r("masa prawidłowa", "нормальная масса"), color: "#6ee7b7", text: r("Masa ciała odpowiednia do wzrostu.", "Масса тела соответствует росту.") },
  { from: 25, to: 30, name: r("nadwaga", "избыточная масса"), color: "#fcd34d", text: r("Rośnie ryzyko chorób układu krążenia i cukrzycy typu 2.", "Растёт риск болезней сердца и сосудов и диабета 2 типа.") },
  { from: 30, to: 40, name: r("otyłość", "ожирение"), color: "#fda4af", text: r("Wysokie ryzyko nadciśnienia, miażdżycy, cukrzycy typu 2 i chorób stawów.", "Высокий риск гипертонии, атеросклероза, диабета 2 типа и болезней суставов.") },
];

function Bmi({ lang }: { lang: BioLang }) {
  const [mass, setMass] = useState(65);
  const [height, setHeight] = useState(172);
  const h = height / 100;
  const bmi = mass / (h * h);
  const cat = BMI_CATS.find((c) => bmi < c.to) ?? BMI_CATS[BMI_CATS.length - 1]!;
  const pos = ((Math.max(15, Math.min(40, bmi)) - 15) / 25) * 100;
  const kg = lang === "pl" ? "kg" : "кг";
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Masa ciała" : "Масса тела"}: <span className="tabular-nums">{mass} {kg}</span>
          <input type="range" min={35} max={150} value={mass} onChange={(e) => setMass(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-emerald-600" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Wzrost" : "Рост"}: <span className="tabular-nums">{height} {lang === "pl" ? "cm" : "см"}</span>
          <input type="range" min={140} max={210} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-sky-600" />
        </label>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] text-slate-700 ring-1 ring-slate-200">
          {lang === "pl" ? "BMI" : "ИМТ"} = {mass} : ({num(h, 2)})² = <b className="tabular-nums">{num(bmi, 1)}</b>
        </p>
      </div>
      <div className="space-y-3" aria-live="polite">
        <div>
          <div className="relative flex h-5 overflow-hidden rounded-full ring-1 ring-slate-300" aria-hidden>
            {BMI_CATS.map((c) => (
              <div key={c.from} style={{ width: `${((c.to - c.from) / 25) * 100}%`, background: c.color }} />
            ))}
          </div>
          <div className="relative h-4" aria-hidden>
            <div className="absolute top-0 -translate-x-1/2 text-sm leading-none text-slate-900 transition-all" style={{ left: `${pos}%` }}>
              ▲
            </div>
          </div>
          <div className="relative h-4 text-[11px] text-slate-500" aria-hidden>
            {[18.5, 25, 30].map((v) => (
              <span key={v} className="absolute -translate-x-1/2" style={{ left: `${((v - 15) / 25) * 100}%` }}>
                {num(v, v % 1 ? 1 : 0)}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4 ring-1 ring-slate-200" style={{ background: `${cat.color}33` }}>
          <h3 className="text-base font-semibold text-slate-900">
            {lang === "pl" ? "BMI" : "ИМТ"} {num(bmi, 1)} — {cat.name[lang]}
          </h3>
          <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{cat.text[lang]}</p>
          <p className="mt-2 text-sm text-slate-600">
            {lang === "pl" ? "Prawidłowa masa dla tego wzrostu (dorosły)" : "Нормальная масса при таком росте (взрослый)"}:{" "}
            <b className="tabular-nums">
              {Math.round(18.5 * h * h)}–{Math.round(24.9 * h * h)} {kg}
            </b>
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- habits ----------

const HABITS: SortItem[] = [
  { name: r("4–5 posiłków dziennie o stałych porach", "4–5 приёмов пищи в день в одно и то же время"), group: 0, why: r("Regularne posiłki zapobiegają napadom głodu i podjadaniu.", "Регулярное питание предупреждает приступы голода и перекусы.") },
  { name: r("Pomijanie śniadania i jeden duży posiłek wieczorem", "Пропуск завтрака и одна большая еда вечером"), group: 1, why: r("Sprzyja przejadaniu się i odkładaniu tłuszczu.", "Способствует перееданию и отложению жира.") },
  { name: r("Woda zamiast słodzonych napojów", "Вода вместо сладких напитков"), group: 0, why: r("Bez „pustych kalorii” i cukru szkodzącego zębom.", "Без «пустых калорий» и сахара, вредного для зубов.") },
  { name: r("Dosalanie potraw", "Досаливание еды"), group: 1, why: r("Nadmiar soli sprzyja nadciśnieniu.", "Избыток соли способствует гипертонии.") },
  { name: r("Pieczywo razowe zamiast białego", "Хлеб грубого помола вместо белого"), group: 0, why: r("Więcej błonnika, witamin z grupy B i soli mineralnych.", "Больше пищевых волокон, витаминов группы B и минеральных солей.") },
  { name: r("Częste jedzenie fast foodów", "Частая еда фастфуда"), group: 1, why: r("Dużo energii, tłuszczów nasyconych i soli, mało błonnika i witamin.", "Много энергии, насыщенных жиров и соли, мало пищевых волокон и витаминов.") },
  { name: r("Mycie rąk przed jedzeniem i mycie warzyw", "Мытьё рук перед едой и мытьё овощей"), group: 0, why: r("Chroni przed glistnicą, WZW typu A i zatruciami.", "Защищает от аскаридоза, гепатита A и отравлений.") },
  { name: r("Jedzenie surowych jaj i niedopieczonego drobiu", "Употребление сырых яиц и недожаренной птицы"), group: 1, why: r("Ryzyko zakażenia salmonellą.", "Риск заражения сальмонеллами.") },
  { name: r("Mycie zębów po posiłkach", "Чистка зубов после еды"), group: 0, why: r("Usuwa płytkę nazębną — chroni przed próchnicą.", "Удаляет зубной налёт — защищает от кариеса.") },
  { name: r("Podjadanie słodyczy między posiłkami", "Перекусы сладостями между едой"), group: 1, why: r("Bakterie płytki nazębnej wytwarzają z cukrów kwasy niszczące szkliwo.", "Бактерии зубного налёта образуют из сахаров кислоты, разрушающие эмаль.") },
  { name: r("Ryby 1–2 razy w tygodniu", "Рыба 1–2 раза в неделю"), group: 0, why: r("Źródło białka i nienasyconych kwasów tłuszczowych omega-3.", "Источник белка и ненасыщенных жирных кислот омега-3.") },
  { name: r("Picie alkoholu", "Употребление алкоголя"), group: 1, why: r("Uszkadza wątrobę i błonę śluzową żołądka.", "Повреждает печень и слизистую оболочку желудка.") },
];

// ---------- diseases ----------

const CAUSES: QuizOption[] = [
  { id: "bacterial", label: r("bakterie", "бактерии") },
  { id: "viral", label: r("wirus", "вирус") },
  { id: "parasitic", label: r("pasożyt", "паразит") },
  { id: "metabolic", label: r("zaburzenie przemiany materii", "нарушение обмена веществ") },
  { id: "autoimmune", label: r("reakcja autoimmunologiczna", "аутоиммунная реакция") },
  { id: "cancer", label: r("nowotwór", "опухоль") },
  { id: "toxic", label: r("substancja toksyczna (alkohol)", "токсичное вещество (алкоголь)") },
  { id: "psychic", label: r("zaburzenie psychiczne", "психическое расстройство") },
];

const DISEASES: QuizItem[] = [
  {
    icon: "🦷",
    name: r("próchnicy zębów", "кариеса"),
    answer: "bacterial",
    explain: r("Kwasy wytwarzane z cukrów przez bakterie płytki nazębnej niszczą szkliwo i zębinę. Chroni mycie zębów, fluor i mniej słodyczy.", "Кислоты, которые бактерии зубного налёта образуют из сахаров, разрушают эмаль и дентин. Защищают чистка зубов, фтор и меньшее количество сладкого."),
  },
  {
    icon: "🔥",
    name: r("choroby wrzodowej żołądka i dwunastnicy", "язвенной болезни желудка и двенадцатиперстной кишки"),
    answer: "bacterial",
    explain: r("Bakteria Helicobacter pylori i nadmiar kwasu solnego uszkadzają błonę śluzową. Objawy: ból w nadbrzuszu, często na czczo lub w nocy, i zgaga.", "Бактерия Helicobacter pylori и избыток соляной кислоты повреждают слизистую оболочку. Признаки: боль в верхней части живота, часто натощак или ночью, и изжога."),
  },
  {
    icon: "🟡",
    name: r("wirusowego zapalenia wątroby typu A", "гепатита A"),
    answer: "viral",
    explain: r("Wirus przenosi się drogą pokarmową — przez brudne ręce i skażoną wodę. Objawy: zażółcenie skóry i białkówek oczu, ciemny mocz. Chronią higiena i szczepienie.", "Вирус передаётся через пищу — грязные руки и заражённую воду. Признаки: пожелтение кожи и белков глаз, тёмная моча. Защищают гигиена и прививка."),
  },
  {
    icon: "🥚",
    name: r("salmonellozy", "сальмонеллёза"),
    answer: "bacterial",
    explain: r("Bakterie z zakażonych jaj, drobiu i niedogotowanego mięsa. Gorączka, biegunka i wymioty pojawiają się 12–36 godzin po posiłku.", "Бактерии из заражённых яиц, птицы и недоваренного мяса. Температура, понос и рвота появляются через 12–36 часов после еды."),
  },
  {
    icon: "🪱",
    name: r("glistnicy", "аскаридоза"),
    answer: "parasitic",
    explain: r("Jaja glisty ludzkiej połykamy z nieumytymi warzywami lub brudnymi rękami. Objawy: bóle brzucha, nudności, osłabienie.", "Яйца человеческой аскариды проглатывают с немытыми овощами или грязными руками. Признаки: боли в животе, тошнота, слабость."),
  },
  {
    icon: "🪨",
    name: r("kamicy żółciowej", "желчнокаменной болезни"),
    answer: "metabolic",
    explain: r("Z żółci przesyconej cholesterolem wytrącają się złogi. Typowy jest napadowy ból pod prawym łukiem żebrowym po tłustym posiłku.", "Из жёлчи, перенасыщенной холестерином, выпадают камни. Типичен приступ боли под правым рёберным краем после жирной еды."),
  },
  {
    icon: "🌾",
    name: r("celiakii", "целиакии"),
    answer: "autoimmune",
    explain: r("Reakcja odpornościowa na gluten niszczy kosmki jelitowe, więc wchłanianie słabnie. Leczenie: dieta bezglutenowa przez całe życie.", "Иммунная реакция на глютен разрушает кишечные ворсинки, и всасывание ослабевает. Лечение — пожизненная безглютеновая диета."),
  },
  {
    icon: "🎗️",
    name: r("raka jelita grubego", "рака толстой кишки"),
    answer: "cancer",
    explain: r("Niekontrolowane podziały komórek nabłonka jelita; sprzyja mu dieta uboga w błonnik. Niepokojące objawy: krew w stolcu, zmiana rytmu wypróżnień, chudnięcie.", "Неконтролируемое деление клеток эпителия кишки; ему способствует бедная клетчаткой диета. Тревожные признаки: кровь в кале, изменение ритма опорожнения, похудение."),
  },
  {
    icon: "🍷",
    name: r("marskości wątroby", "цирроза печени"),
    answer: "toxic",
    explain: r("Komórki wątroby są zastępowane tkanką łączną, najczęściej wskutek nadużywania alkoholu. Objawy: żółtaczka, wodobrzusze, zaburzenia krzepnięcia krwi.", "Клетки печени замещаются соединительной тканью, чаще всего из-за злоупотребления алкоголем. Признаки: желтуха, скопление жидкости в животе, нарушение свёртывания крови."),
  },
  {
    icon: "🪞",
    name: r("jadłowstrętu psychicznego (anoreksji)", "нервной анорексии"),
    answer: "psychic",
    explain: r("Lęk przed przytyciem i zaburzony obraz własnego ciała prowadzą do skrajnego ograniczania jedzenia i wyniszczenia organizmu.", "Страх набрать вес и искажённое восприятие своего тела ведут к крайнему ограничению еды и истощению организма."),
  },
  {
    icon: "🍩",
    name: r("żarłoczności psychicznej (bulimii)", "нервной булимии"),
    answer: "psychic",
    explain: r("Napady objadania się, po których chory z poczucia winy prowokuje wymioty. Wymaga leczenia psychologicznego.", "Приступы обжорства, после которых больной из чувства вины вызывает рвоту. Требует психологического лечения."),
  },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "U podstawy piramidy: aktywność fizyczna, potem warzywa i owoce (¾ warzyw, ¼ owoców).", ru: "В основании пирамиды — физическая активность, затем овощи и фрукты (¾ овощей, ¼ фруктов)." },
    { pl: "Ogranicz cukier, sól, tłuszcze zwierzęce oraz mięso czerwone i przetworzone.", ru: "Ограничивай сахар, соль, животные жиры, красное и переработанное мясо." },
  ],
  s2: [
    { pl: "CPM = PPM + energia na aktywność fizyczną i trawienie.", ru: "Общий обмен = основной обмен + энергия на физическую активность и пищеварение." },
    { pl: "Dodatni bilans energetyczny → przyrost masy ciała; ujemny → spadek.", ru: "Положительный энергетический баланс → рост массы тела; отрицательный → снижение." },
  ],
  s3: [{ pl: "BMI 18,5–24,9 — masa prawidłowa; 25–29,9 — nadwaga; 30 i więcej — otyłość.", ru: "ИМТ 18,5–24,9 — нормальная масса; 25–29,9 — избыточная; 30 и больше — ожирение." }],
  s4: [{ pl: "Higiena rąk i żywności chroni przed chorobami przenoszonymi drogą pokarmową.", ru: "Гигиена рук и продуктов защищает от болезней, передающихся через пищу." }],
  s5: [
    { pl: "Wrzody żołądka wywołuje głównie bakteria Helicobacter pylori; WZW A — wirus przenoszony drogą pokarmową.", ru: "Язву желудка вызывает в основном бактерия Helicobacter pylori; гепатит A — вирус, передающийся через пищу." },
    { pl: "Celiakia to reakcja autoimmunologiczna na gluten niszcząca kosmki jelitowe.", ru: "Целиакия — аутоиммунная реакция на глютен, разрушающая кишечные ворсинки." },
  ],
};

export default function DietLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="diet" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="diet-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <Pyramid lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="diet-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Balance lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="diet-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Bmi lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="diet-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s4} groups={[r("sprzyja zdrowiu", "полезно"), r("szkodzi zdrowiu", "вредно")]} items={HABITS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="diet-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s5}
          question={r("Co jest przyczyną", "Какова причина")}
          options={CAUSES}
          items={DISEASES}
          wrongHint={r("Pomyśl, jak można się tą chorobą „zarazić” — czy w ogóle można.", "Подумай, можно ли этой болезнью «заразиться» и как.")}
        />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
