// Block 2: "Build a flyer". Each adaptation is a switch with its reason; the gauge fills as they are
// switched on, and with all of them the bird takes off.
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import { Choice, KIT, type Txt } from "../kit.tsx";

interface Adaptation {
  id: string;
  name: Txt;
  tag: Txt;
  text: Txt;
}

const ADAPTATIONS: Adaptation[] = [
  {
    id: "bones",
    name: { pl: "Kości pneumatyczne", ru: "Пневматические кости" },
    tag: { pl: "lekkość", ru: "лёгкость" },
    text: { pl: "Puste w środku kości ważą mało, a beleczki w ich wnętrzu sprawiają, że są mocne.", ru: "Полые кости весят мало, а перекладинки внутри делают их прочными." },
  },
  {
    id: "beak",
    name: { pl: "Dziób zamiast zębów", ru: "Клюв вместо зубов" },
    tag: { pl: "lekkość", ru: "лёгкость" },
    text: {
      pl: "Lekki dziób zastępuje ciężkie szczęki z zębami. Pokarm rozciera żołądek mięśniowy, ukryty w środku ciała.",
      ru: "Лёгкий клюв заменяет тяжёлые челюсти с зубами. Пищу перетирает мускульный желудок, спрятанный в середине тела.",
    },
  },
  {
    id: "feathers",
    name: { pl: "Pióra i opływowy kształt", ru: "Перья и обтекаемая форма" },
    tag: { pl: "kształt", ru: "форма" },
    text: {
      pl: "Pióra okrywowe wygładzają ciało, więc powietrze łatwo je opływa, a lotki tworzą powierzchnię skrzydeł.",
      ru: "Контурные перья сглаживают тело, и воздух легко его обтекает, а маховые перья образуют поверхность крыльев.",
    },
  },
  {
    id: "keel",
    name: { pl: "Grzebień mostka i silne mięśnie", ru: "Киль и сильные мышцы" },
    tag: { pl: "napęd", ru: "двигатель" },
    text: { pl: "Do grzebienia mostka przyczepiają się wielkie mięśnie piersiowe, które machają skrzydłami.", ru: "К килю крепятся большие грудные мышцы, которые машут крыльями." },
  },
  {
    id: "airsacs",
    name: { pl: "Worki powietrzne", ru: "Воздушные мешки" },
    tag: { pl: "tlen", ru: "кислород" },
    text: {
      pl: "Powietrze przepływa przez płuca przy wdechu i przy wydechu, więc pracujące mięśnie dostają dużo tlenu.",
      ru: "Воздух проходит через лёгкие и при вдохе, и при выдохе, поэтому работающие мышцы получают много кислорода.",
    },
  },
  {
    id: "warm",
    name: { pl: "Stałocieplność", ru: "Теплокровность" },
    tag: { pl: "energia", ru: "энергия" },
    text: {
      pl: "Stała temperatura ok. 40 °C sprawia, że mięśnie są zawsze rozgrzane i gotowe do pracy — także zimą.",
      ru: "Постоянная температура около 40 °C делает мышцы всегда разогретыми и готовыми к работе — даже зимой.",
    },
  },
];

const T = {
  hint: { pl: "Włącz kolejne przystosowania i patrz, jak rośnie gotowość do lotu.", ru: "Включай приспособления одно за другим и смотри, как растёт готовность к полёту." },
  ready: { pl: "Gotowość do lotu", ru: "Готовность к полёту" },
  flying: { pl: "Wszystko gotowe — ptak wzbija się w powietrze!", ru: "Всё готово — птица взлетает!" },
  bird: { pl: "Ptak", ru: "Птица" },
} satisfies Record<string, Txt>;

const STYLE = `
.fb-wing{transform-box:fill-box;transform-origin:20% 80%}
.fb.fly .fb-body{animation:fbUp 2.4s ease-in-out infinite}
.fb.fly .fb-wing{animation:fbFlap .35s ease-in-out infinite}
@keyframes fbFlap{0%,100%{transform:rotate(0)}50%{transform:rotate(-38deg)}}
@keyframes fbUp{0%{transform:translate(0,40px)}50%{transform:translate(20px,-6px)}100%{transform:translate(0,40px)}}
@media (prefers-reduced-motion: reduce){.fb.fly .fb-body,.fb.fly .fb-wing{animation:none}}
`;

export function FlightBuilder({ lang }: { lang: BioLang }) {
  const [on, setOn] = useState<Set<string>>(new Set());
  const ready = on.size === ADAPTATIONS.length;
  const toggle = (id: string) => {
    const next = new Set(on);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOn(next);
  };

  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div>
        <svg viewBox="0 0 240 170" className={`fb w-full ${ready ? "fly" : ""}`} role="img" aria-label={T.bird[lang]}>
          <style>{STYLE}</style>
          <rect x={0} y={0} width={240} height={170} rx={12} fill="#e0f2fe" />
          <path d="M0 150 L 240 150 L 240 158 C 240 164, 236 170, 230 170 L 10 170 C 4 170, 0 164, 0 158 Z" fill="#86efac" />
          <g className="fb-body" style={ready ? undefined : { transform: "translate(0, 40px)" }}>
            <path d="M150 88 L 196 76 L 200 88 L 196 100 L 150 96 Z" fill="#475569" />
            <ellipse cx={120} cy={90} rx={40} ry={22} fill="#60a5fa" />
            <circle cx={84} cy={72} r={16} fill="#60a5fa" />
            <path d="M70 68 L 54 74 L 70 78 Z" fill="#f59e0b" />
            <circle cx={80} cy={69} r={3} fill="#0f172a" />
            <path className="fb-wing" d="M100 84 C 118 70, 140 70, 160 82 L 156 90 C 140 92, 118 94, 104 92 Z" fill="#2563eb" />
          </g>
        </svg>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
            <span>{T.ready[lang]}</span>
            <span>
              {on.size} / {ADAPTATIONS.length}
            </span>
          </div>
          <div className="flex gap-1" role="meter" aria-label={T.ready[lang]} aria-valuemin={0} aria-valuemax={ADAPTATIONS.length} aria-valuenow={on.size}>
            {ADAPTATIONS.map((a, i) => (
              <span key={a.id} className={`h-2.5 flex-1 rounded-full transition-colors ${i < on.size ? "bg-emerald-500" : "bg-slate-200"}`} />
            ))}
          </div>
          {ready && (
            <p className="mt-3 text-center text-sm font-semibold text-emerald-700" role="status">
              🕊 {T.flying[lang]}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm text-slate-500">{T.hint[lang]}</p>
        <ul className="space-y-2">
          {ADAPTATIONS.map((a) => {
            const active = on.has(a.id);
            return (
              <li key={a.id}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  onClick={() => toggle(a.id)}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ring-1 transition-colors ${
                    active ? "bg-emerald-50 ring-emerald-300" : "bg-white ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${active ? "bg-emerald-500" : "bg-slate-300"}`}>
                    <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : ""}`} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-semibold text-slate-800">{a.name[lang]}</span>
                      <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">{a.tag[lang]}</span>
                    </span>
                    {active && <span className="mt-0.5 block text-sm leading-snug text-slate-600">{a.text[lang]}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {on.size > 0 && (
          <div className="mt-3">
            <Choice onClick={() => setOn(new Set())}>↺ {KIT.again[lang]}</Choice>
          </div>
        )}
      </div>
    </div>
  );
}
