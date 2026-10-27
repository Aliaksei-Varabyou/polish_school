// Block 3 of the mammals lesson: keeping 37 °C. The air temperature changes with the slider; the
// body temperature does not — the panel lists what the body does to hold it.
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import type { Txt } from "@portal/lessons";

const T = {
  air: { pl: "Temperatura powietrza", ru: "Температура воздуха" },
  body: { pl: "Temperatura ciała", ru: "Температура тела" },
  cold: { pl: "Zimno — ciało oszczędza i wytwarza ciepło", ru: "Холодно — тело бережёт и вырабатывает тепло" },
  ok: { pl: "W sam raz", ru: "В самый раз" },
  hot: { pl: "Gorąco — ciało się chłodzi", ru: "Жарко — тело охлаждается" },
} satisfies Record<string, Txt>;

const COLD: Txt[] = [
  { pl: "Sierść się stroszy — między włosami jest więcej powietrza, które izoluje (u człowieka zostaje po tym „gęsia skórka”).", ru: "Шерсть встаёт дыбом — между волосами больше воздуха, который удерживает тепло (у человека от этого остаётся «гусиная кожа»)." },
  { pl: "Mięśnie drżą i przy tym wytwarzają ciepło.", ru: "Мышцы дрожат и при этом вырабатывают тепло." },
  { pl: "Naczynia krwionośne w skórze się zwężają, więc mniej ciepła ucieka przez skórę.", ru: "Сосуды кожи сужаются, поэтому через кожу уходит меньше тепла." },
  { pl: "Zwierzę zwija się w kłębek, a gruba warstwa tłuszczu chroni przed zimnem.", ru: "Животное сворачивается клубком, а толстый слой жира защищает от холода." },
];
const OK: Txt[] = [{ pl: "Ciało nie musi się ani ogrzewać, ani chłodzić — utrzymuje ok. 37 °C bez wysiłku.", ru: "Телу не нужно ни греться, ни охлаждаться — оно держит около 37 °C без усилий." }];
const HOT: Txt[] = [
  { pl: "Człowiek i koń się pocą — parujący pot chłodzi skórę.", ru: "Человек и лошадь потеют — испаряясь, пот охлаждает кожу." },
  { pl: "Pies prawie nie ma gruczołów potowych, więc ziaja: chłodzi się, odparowując wodę z języka.", ru: "У собаки почти нет потовых желёз, поэтому она часто дышит с открытой пастью: охлаждается, испаряя воду с языка." },
  { pl: "Naczynia w skórze się rozszerzają i oddają ciepło na zewnątrz.", ru: "Сосуды кожи расширяются и отдают тепло наружу." },
  { pl: "Zwierzęta szukają cienia, a słoń wachluje się wielkimi uszami.", ru: "Животные ищут тень, а слон обмахивается огромными ушами." },
];

export function KeepWarm({ lang }: { lang: BioLang }) {
  const [air, setAir] = useState(-10);
  const state = air < 10 ? "cold" : air > 26 ? "hot" : "ok";
  const items = state === "cold" ? COLD : state === "hot" ? HOT : OK;
  const look = { cold: "bg-sky-50 ring-sky-200 text-sky-950", ok: "bg-emerald-50 ring-emerald-200 text-emerald-950", hot: "bg-orange-50 ring-orange-200 text-orange-950" }[state];
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="space-y-4">
        <div>
          <label htmlFor="keep-air" className="text-sm font-semibold text-slate-700">
            {T.air[lang]}: <span className="tabular-nums">{air} °C</span>
          </label>
          <input id="keep-air" type="range" min={-20} max={36} value={air} onChange={(e) => setAir(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-emerald-600" />
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <span className="text-4xl" aria-hidden>
            {state === "cold" ? "🥶" : state === "hot" ? "🥵" : "🙂"}
          </span>
          <div>
            <div className="text-sm text-slate-500">{T.body[lang]}</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">37 °C</div>
          </div>
        </div>
      </div>
      <div className={`rounded-xl p-4 ring-1 ${look}`} aria-live="polite">
        <h3 className="text-base font-semibold">{T[state][lang]}</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed">
          {items.map((i) => (
            <li key={i.pl}>{i[lang]}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
