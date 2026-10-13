// Block 4: ectothermy. A month slider moves the air temperature through a Polish year; the frog's
// body follows it, the bird's does not. What the frog is doing changes with its temperature.
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import type { Txt } from "../kit.tsx";

const MONTHS: Txt[] = [
  { pl: "styczeń", ru: "январь" },
  { pl: "luty", ru: "февраль" },
  { pl: "marzec", ru: "март" },
  { pl: "kwiecień", ru: "апрель" },
  { pl: "maj", ru: "май" },
  { pl: "czerwiec", ru: "июнь" },
  { pl: "lipiec", ru: "июль" },
  { pl: "sierpień", ru: "август" },
  { pl: "wrzesień", ru: "сентябрь" },
  { pl: "październik", ru: "октябрь" },
  { pl: "listopad", ru: "ноябрь" },
  { pl: "grudzień", ru: "декабрь" },
];
/** typical mean day temperature in Poland, °C */
const AIR = [-2, -1, 3, 8, 13, 17, 19, 18, 14, 9, 4, 0];
const BIRD = 41;
/** under the ice the bottom of a pond stays at about 4 °C — that is where frogs winter */
const frogTemp = (air: number) => Math.max(air, 4);

const T = {
  month: { pl: "Miesiąc", ru: "Месяц" },
  air: { pl: "Powietrze", ru: "Воздух" },
  frog: { pl: "Żaba", ru: "Лягушка" },
  bird: { pl: "Sikora", ru: "Синица" },
  sleep: {
    pl: "Sen zimowy. Żaba zagrzebała się w mule na dnie stawu albo pod liśćmi. Prawie się nie rusza, serce bije bardzo wolno, a tlen pobiera przez skórę. Na dnie stawu pod lodem woda ma ok. 4 °C.",
    ru: "Зимняя спячка. Лягушка зарылась в ил на дне пруда или под листья. Она почти не двигается, сердце бьётся очень медленно, а кислород поступает через кожу. На дне пруда подо льдом вода около 4 °C.",
  },
  slow: {
    pl: "Chłodno. Żaba jest ospała i porusza się powoli — jej mięśnie pracują tym wolniej, im jest zimniej.",
    ru: "Прохладно. Лягушка вялая и двигается медленно — её мышцы работают тем медленнее, чем холоднее вокруг.",
  },
  spawn: {
    pl: "Gody. Żaby budzą się i wędrują do stawów, w których same się wylęgły, żeby złożyć skrzek.",
    ru: "Брачный период. Лягушки просыпаются и идут к прудам, где когда-то вылупились сами, чтобы отложить икру.",
  },
  active: {
    pl: "Ciepło. Żaba jest aktywna: poluje na owady, skacze i pływa.",
    ru: "Тепло. Лягушка активна: охотится на насекомых, прыгает и плавает.",
  },
  birdNote: {
    pl: "Ptak jest stałocieplny: przez cały rok ma ok. 40 °C. Zimą musi dużo jeść, żeby wytworzyć tyle ciepła — dlatego warto dokarmiać sikory.",
    ru: "Птица теплокровна: круглый год у неё около 40 °C. Зимой ей приходится много есть, чтобы вырабатывать столько тепла, — поэтому синиц полезно подкармливать.",
  },
} satisfies Record<string, Txt>;

const y = (t: number) => 186 - (t + 5) * 3.3;

export function ColdBlood({ lang }: { lang: BioLang }) {
  const [month, setMonth] = useState(0);
  const air = AIR[month]!;
  const frog = frogTemp(air);
  const note = air <= 5 ? T.sleep : month === 3 ? T.spawn : air < 12 ? T.slow : T.active;
  const columns = [
    { x: 50, t: air, label: T.air, color: "#38bdf8", icon: "🌡" },
    { x: 140, t: frog, label: T.frog, color: "#65a30d", icon: "🐸" },
    { x: 230, t: BIRD, label: T.bird, color: "#f97316", icon: "🐦" },
  ];
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <svg viewBox="0 0 280 240" className="mx-auto w-full max-w-[320px]" role="img" aria-label={`${T.air[lang]} ${air} °C, ${T.frog[lang]} ${frog} °C, ${T.bird[lang]} ${BIRD} °C`}>
        {[0, 20, 40].map((t) => (
          <g key={t}>
            <path d={`M20 ${y(t)} L 270 ${y(t)}`} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={4} y={y(t) + 4} fontSize={10} fill="#64748b">
              {t}°
            </text>
          </g>
        ))}
        {columns.map((c) => (
          <g key={c.x}>
            <rect x={c.x - 9} y={y(45)} width={18} height={y(-5) - y(45) + 8} rx={9} fill="white" stroke="#cbd5e1" strokeWidth={2} />
            <rect x={c.x - 5} y={y(c.t)} width={10} height={y(-5) - y(c.t) + 8} fill={c.color} style={{ transition: "y .4s, height .4s" }} />
            <circle cx={c.x} cy={y(-5) + 12} r={14} fill={c.color} stroke="#cbd5e1" strokeWidth={2} />
            <text x={c.x} y={y(-5) + 17} textAnchor="middle" fontSize={13}>
              {c.icon}
            </text>
            <text x={c.x} y={y(c.t) - 8} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0f172a">
              {c.t} °C
            </text>
            <text x={c.x} y={234} textAnchor="middle" fontSize={12} fill="#334155">
              {c.label[lang]}
            </text>
          </g>
        ))}
      </svg>

      <div className="space-y-3">
        <div>
          <label htmlFor="cold-month" className="text-sm font-semibold text-slate-700">
            {T.month[lang]}: <span className="text-emerald-700">{MONTHS[month]![lang]}</span>
          </label>
          <input
            id="cold-month"
            type="range"
            min={0}
            max={11}
            step={1}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-valuetext={MONTHS[month]![lang]}
            className="mt-2 h-2 w-full cursor-pointer accent-emerald-600"
          />
        </div>
        <p className="rounded-xl bg-lime-50 px-4 py-3 text-[15px] leading-relaxed text-lime-950 ring-1 ring-lime-200" aria-live="polite">
          🐸 {note[lang]}
        </p>
        <p className="rounded-xl bg-orange-50 px-4 py-3 text-[15px] leading-relaxed text-orange-950 ring-1 ring-orange-200">🐦 {T.birdNote[lang]}</p>
      </div>
    </div>
  );
}
