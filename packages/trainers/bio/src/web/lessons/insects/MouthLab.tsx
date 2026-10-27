// Block 3: the mouthparts lab. Four animated tiles show how each type of mouthparts works; below,
// "Feed the insect" asks which type fits a given food and names the insect that eats it.
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../lang.ts";
import { Choice, KIT, Verdict, type Txt } from "@portal/lessons";

type Mouth = "chewing" | "piercing" | "siphoning" | "sponging";

const TYPES: Record<Mouth, { name: Txt; who: Txt; text: Txt }> = {
  chewing: {
    name: { pl: "gryzący", ru: "грызущий" },
    who: { pl: "konik polny, chrabąszcz, mrówka", ru: "кузнечик, майский жук, муравей" },
    text: {
      pl: "Para twardych żuwaczek działa jak nożyce: odgryza i rozdrabnia stały pokarm — liście, drewno, inne owady.",
      ru: "Пара твёрдых жвал работает как ножницы: откусывает и измельчает твёрдую пищу — листья, древесину, других насекомых.",
    },
  },
  piercing: {
    name: { pl: "kłująco-ssący", ru: "колюще-сосущий" },
    who: { pl: "komar, mszyca, pluskwa", ru: "комар, тля, клоп" },
    text: {
      pl: "Cienkie, ostre sztylety przebijają skórę zwierzęcia albo łodygę rośliny, a rurką owad wysysa płyn — krew lub sok.",
      ru: "Тонкие острые стилеты прокалывают кожу животного или стебель растения, а по трубочке насекомое высасывает жидкость — кровь или сок.",
    },
  },
  siphoning: {
    name: { pl: "ssący", ru: "сосущий" },
    who: { pl: "motyle", ru: "бабочки" },
    text: {
      pl: "Długa trąbka, w spoczynku zwinięta w spiralę. Motyl rozwija ją i jak słomką pije nektar z głębi kwiatu.",
      ru: "Длинный хоботок, в покое свёрнутый в спираль. Бабочка разворачивает его и, как через соломинку, пьёт нектар из глубины цветка.",
    },
  },
  sponging: {
    name: { pl: "liżący", ru: "лижущий" },
    who: { pl: "mucha domowa", ru: "комнатная муха" },
    text: {
      pl: "Trąbka zakończona miękką, gąbczastą poduszeczką. Mucha zlizuje nią płynny pokarm, a stały najpierw rozpuszcza śliną.",
      ru: "Хоботок с мягкой губчатой подушечкой на конце. Ею муха слизывает жидкую пищу, а твёрдую сначала растворяет слюной.",
    },
  },
};
const ORDER: Mouth[] = ["chewing", "piercing", "siphoning", "sponging"];

interface Food {
  icon: string;
  name: Txt;
  answer: Mouth;
  eater: Txt;
}
const FOODS: Food[] = [
  { icon: "🥬", name: { pl: "liść kapusty", ru: "лист капусты" }, answer: "chewing", eater: { pl: "Tak jedzą np. szarańcza i konik polny.", ru: "Так едят, например, саранча и кузнечик." } },
  { icon: "🌸", name: { pl: "nektar ukryty głęboko w kwiecie", ru: "нектар глубоко в цветке" }, answer: "siphoning", eater: { pl: "Tak pije motyl — trąbka sięga na dno kwiatu.", ru: "Так пьёт бабочка — хоботок достаёт до дна цветка." } },
  { icon: "🩸", name: { pl: "krew człowieka", ru: "кровь человека" }, answer: "piercing", eater: { pl: "Tak żywi się samica komara.", ru: "Так питается самка комара." } },
  { icon: "🌹", name: { pl: "sok z łodygi róży", ru: "сок из стебля розы" }, answer: "piercing", eater: { pl: "Tak żeruje mszyca — i dlatego szkodzi roślinom.", ru: "Так питается тля — поэтому она и вредит растениям." } },
  { icon: "🍯", name: { pl: "rozlany na stole syrop", ru: "пролитый на стол сироп" }, answer: "sponging", eater: { pl: "Tak je mucha domowa.", ru: "Так ест комнатная муха." } },
  { icon: "🪵", name: { pl: "drewno", ru: "древесина" }, answer: "chewing", eater: { pl: "Drewno gryzą np. larwy chrząszczy, takich jak kornik.", ru: "Древесину грызут, например, личинки жуков, таких как короед." } },
];

const TXT = {
  tapTile: { pl: "Dotknij kafelka, żeby zobaczyć, jak działa aparat.", ru: "Нажми на плитку, чтобы увидеть, как работает аппарат." },
  game: { pl: "Nakarm owada", ru: "Накорми насекомое" },
  question: { pl: "Jaki aparat gębowy jest potrzebny, żeby zjeść:", ru: "Какой ротовой аппарат нужен, чтобы съесть:" },
  wrongFood: { pl: "ten aparat tu nie pasuje. Pomyśl, czy pokarm jest stały czy płynny i czy trzeba coś przebić.", ru: "этот аппарат здесь не подходит. Подумай: пища твёрдая или жидкая и нужно ли что-то прокалывать." },
  done: { pl: "Wszystkie owady nakarmione! Pomyłek:", ru: "Все насекомые накормлены! Ошибок:" },
  examples: { pl: "Np.:", ru: "Напр.:" },
} satisfies Record<string, Txt>;

export function MouthLab({ lang }: { lang: BioLang }) {
  const [shown, setShown] = useState<Mouth | null>(null);
  const [food, setFood] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<Mouth | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const current = FOODS[food];
  const pick = (m: Mouth) => {
    if (!current || solved) return;
    if (m === current.answer) {
      setSolved(true);
      setWrong(null);
      setShown(m);
    } else {
      setWrong(m);
      setMistakes(mistakes + 1);
    }
  };
  const nextFood = () => {
    setFood(food + 1);
    setSolved(false);
    setWrong(null);
  };
  const restart = () => {
    setFood(0);
    setSolved(false);
    setWrong(null);
    setMistakes(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm text-slate-500">{TXT.tapTile[lang]}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ORDER.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={shown === m}
              onClick={() => setShown(shown === m ? null : m)}
              className={`rounded-xl p-2 text-left ring-1 transition-colors ${shown === m ? "bg-emerald-50 ring-emerald-400" : "bg-white ring-slate-200 hover:bg-slate-50"}`}
            >
              <MouthArt type={m} playing={shown === m} />
              <div className="mt-1 text-sm font-semibold text-slate-800">{TYPES[m].name[lang]}</div>
              <div className="text-xs leading-snug text-slate-500">
                {TXT.examples[lang]} {TYPES[m].who[lang]}
              </div>
            </button>
          ))}
        </div>
        {shown && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-[15px] leading-relaxed text-emerald-950 ring-1 ring-emerald-200" aria-live="polite">
            <span className="font-semibold">
              {lang === "pl" ? "Aparat" : "Аппарат"} {TYPES[shown].name[lang]}:
            </span>{" "}
            {TYPES[shown].text[lang]}
          </p>
        )}
      </div>

      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <h3 className="flex items-center justify-between text-base font-semibold text-slate-800">
          🍽 {TXT.game[lang]}
          <span className="text-xs font-medium text-slate-500">
            {Math.min(food + 1, FOODS.length)} / {FOODS.length}
          </span>
        </h3>
        {current ? (
          <div className="mt-3 space-y-3">
            <p className="text-[15px] text-slate-700">
              {TXT.question[lang]}{" "}
              <span className="font-semibold whitespace-nowrap text-slate-900">
                {current.icon} {current.name[lang]}
              </span>
              ?
            </p>
            <div className="flex flex-wrap gap-2">
              {ORDER.map((m) => (
                <Choice key={m} disabled={solved} state={solved && m === current.answer ? "right" : wrong === m ? "wrong" : "idle"} onClick={() => pick(m)}>
                  {TYPES[m].name[lang]}
                </Choice>
              ))}
            </div>
            {solved && (
              <>
                <Verdict ok lang={lang}>
                  {current.eater[lang]}
                </Verdict>
                <Choice state="active" onClick={nextFood}>
                  {KIT.next[lang]} →
                </Choice>
              </>
            )}
            {!solved && wrong && (
              <Verdict ok={false} lang={lang}>
                {TYPES[wrong].name[lang]} — {TXT.wrongFood[lang]}
              </Verdict>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <Verdict ok={mistakes === 0} lang={lang}>
              {TXT.done[lang]} {mistakes}.
            </Verdict>
            <Choice onClick={restart}>↺ {KIT.again[lang]}</Choice>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- animated drawings ----------

const STYLE = `
.ml [data-a]{transform-box:view-box}
.ml.on [data-a=jawL]{animation:mlJawL 1s ease-in-out infinite;transform-origin:50px 38px}
.ml.on [data-a=jawR]{animation:mlJawR 1s ease-in-out infinite;transform-origin:70px 38px}
.ml.on [data-a=bite]{animation:mlBite 2s steps(1) infinite}
.ml.on [data-a=stab]{animation:mlStab 2.4s ease-in-out infinite}
.ml.on [data-a=blood]{animation:mlBlood 2.4s ease-in-out infinite}
.ml.on [data-a=coil]{animation:mlFade 3s ease-in-out infinite}
.ml.on [data-a=tube]{animation:mlGrow 3s ease-in-out infinite;transform-origin:60px 40px}
.ml.on [data-a=pad]{animation:mlPad 2.4s ease-in-out infinite}
.ml.on [data-a=drop]{animation:mlDrop 2.4s ease-in-out infinite;transform-origin:60px 96px}
[data-a=tube]{transform:scaleY(0)}
[data-a=blood]{stroke-dashoffset:40}
@keyframes mlJawL{0%,100%{transform:rotate(-16deg)}50%{transform:rotate(6deg)}}
@keyframes mlJawR{0%,100%{transform:rotate(16deg)}50%{transform:rotate(-6deg)}}
@keyframes mlBite{0%{opacity:0}50%{opacity:1}}
@keyframes mlStab{0%,15%{transform:translateY(0)}40%,75%{transform:translateY(16px)}100%{transform:translateY(0)}}
@keyframes mlBlood{0%,40%{stroke-dashoffset:40}75%{stroke-dashoffset:0}100%{stroke-dashoffset:0}}
@keyframes mlFade{0%,10%{opacity:1}30%,80%{opacity:0}100%{opacity:1}}
@keyframes mlGrow{0%,10%{transform:scaleY(0)}35%,80%{transform:scaleY(1)}100%{transform:scaleY(0)}}
@keyframes mlPad{0%,15%{transform:translateY(0)}40%,70%{transform:translateY(16px)}100%{transform:translateY(0)}}
@keyframes mlDrop{0%,40%{transform:scale(1)}70%{transform:scale(.35)}100%{transform:scale(1)}}
@media (prefers-reduced-motion: reduce){.ml.on [data-a]{animation:none}.ml.on [data-a=tube]{transform:scaleY(1)}.ml.on [data-a=coil]{opacity:0}}
`;

function MouthArt({ type, playing }: { type: Mouth; playing: boolean }) {
  const head = <ellipse cx={60} cy={22} rx={24} ry={18} fill="#57534e" />;
  const art: Record<Mouth, ReactNode> = {
    chewing: (
      <>
        <path d="M18 98 Q60 66 102 98 Q60 120 18 98 Z" fill="#4ade80" stroke="#15803d" strokeWidth={1.5} />
        <path d="M60 80 L 60 112" stroke="#15803d" strokeWidth={1.2} />
        <circle data-a="bite" cx={60} cy={80} r={9} fill="white" opacity={0} />
        {head}
        <path data-a="jawL" d="M50 38 C 40 50, 44 62, 57 66 L 57 59 C 50 57, 49 48, 54 42 Z" fill="#292524" />
        <path data-a="jawR" d="M70 38 C 80 50, 76 62, 63 66 L 63 59 C 70 57, 71 48, 66 42 Z" fill="#292524" />
      </>
    ),
    piercing: (
      <>
        <rect x={6} y={82} width={108} height={34} rx={4} fill="#fecaca" />
        <path d="M6 82 L114 82" stroke="#f87171" strokeWidth={2} />
        {head}
        <g data-a="stab">
          <path d="M60 36 L 60 76" stroke="#292524" strokeWidth={4} strokeLinecap="round" />
          <path d="M60 78 L 60 36" data-a="blood" stroke="#dc2626" strokeWidth={2} strokeDasharray="40" />
        </g>
      </>
    ),
    siphoning: (
      <>
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx={60} cy={92} rx={9} ry={20} transform={`rotate(${r} 60 100)`} fill="#f9a8d4" stroke="#db2777" strokeWidth={1} />
        ))}
        <circle cx={60} cy={100} r={8} fill="#fde047" />
        {head}
        <path data-a="coil" d="M60 40 c 0 10, 14 12, 15 3 c 1 -8, -10 -10, -11 -3 c -1 5, 6 6, 6 2" fill="none" stroke="#292524" strokeWidth={2.5} strokeLinecap="round" />
        <path data-a="tube" d="M60 40 L 60 96" stroke="#292524" strokeWidth={2.5} strokeLinecap="round" />
      </>
    ),
    sponging: (
      <>
        <ellipse data-a="drop" cx={60} cy={96} rx={22} ry={7} fill="#fbbf24" opacity={0.85} />
        {head}
        <g data-a="pad">
          <rect x={56} y={36} width={8} height={30} rx={3} fill="#44403c" />
          <ellipse cx={60} cy={70} rx={14} ry={6} fill="#78716c" stroke="#44403c" strokeWidth={1.5} />
        </g>
      </>
    ),
  };
  return (
    <svg viewBox="0 0 120 120" className={`ml mx-auto w-full max-w-[140px] ${playing ? "on" : ""}`} aria-hidden>
      <style>{STYLE}</style>
      {art[type]}
    </svg>
  );
}
