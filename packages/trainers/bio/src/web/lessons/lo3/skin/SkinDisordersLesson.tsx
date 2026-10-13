// Lesson for LO3 §2.3 "Higiena i choroby skóry" (zakres rozszerzony). Diseases, their kinds and the
// hygiene rules follow templates/data/skin.ts (SKIN_DISEASES, DISEASE_KINDS, SKIN_RISKS).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { MatchQuiz, TwoWaySort, type QuizItem, type QuizOption, type SortItem } from "../../games.tsx";
import { num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Skóra to pierwsza linia obrony organizmu, ale i ona choruje: atakują ją bakterie, wirusy, grzyby i pasożyty, szkodzi jej nadmiar słońca, a niektóre choroby skóry mają podłoże alergiczne, autoimmunologiczne lub genetyczne. Wielu z nich zapobiegają proste zasady higieny.",
    "Кожа — первая линия обороны организма, но и она болеет: на неё нападают бактерии, вирусы, грибы и паразиты, ей вредит избыток солнца, а у некоторых болезней кожи аллергическая, аутоиммунная или генетическая природа. Многие из них предотвращают простые правила гигиены.",
  ),
  s1: r("Rodzaje chorób skóry", "Виды болезней кожи"),
  s1intro: r("Przy każdej chorobie zastanów się, co jest jej przyczyną.", "Для каждой болезни подумай, что её вызывает."),
  s2: r("Promieniowanie UV i ochrona przed słońcem", "УФ-излучение и защита от солнца"),
  s2intro: r(
    "Ustaw indeks UV i wybierz krem z filtrem. Zobacz, jak głęboko wnikają promienie UVA i UVB i ile z nich zatrzymuje filtr.",
    "Установи УФ-индекс и выбери солнцезащитный крем. Посмотри, как глубоко проникают лучи UVA и UVB и сколько их задерживает фильтр.",
  ),
  s3: r("Reguła ABCDE — obserwuj znamiona", "Правило ABCDE — следи за родинками"),
  s3intro: r(
    "Czerniak to złośliwy nowotwór melanocytów. Zaznacz cechy znamienia i zobacz, jak zmienia się jego wygląd.",
    "Меланома — злокачественная опухоль из меланоцитов. Отмечай признаки родинки и смотри, как меняется её вид.",
  ),
  s4: r("Higiena skóry", "Гигиена кожи"),
  s4intro: r("Który nawyk chroni skórę, a który jej szkodzi?", "Какая привычка защищает кожу, а какая ей вредит?"),
} satisfies Record<string, Txt>;

// ---------- kinds of skin diseases ----------

const KINDS: QuizOption[] = [
  { id: "bakteryjna", label: r("bakteryjna", "бактериальная") },
  { id: "wirusowa", label: r("wirusowa", "вирусная") },
  { id: "grzybicza", label: r("grzybicza", "грибковая") },
  { id: "pasozytnicza", label: r("pasożytnicza", "паразитарная") },
  { id: "autoimmunologiczna", label: r("autoimmunologiczna", "аутоиммунная") },
  { id: "alergiczna", label: r("alergiczna", "аллергическая") },
  { id: "nowotworowa", label: r("nowotwór złośliwy", "злокачественная опухоль") },
  { id: "genetyczna", label: r("genetyczna", "генетическая") },
  { id: "urazowa", label: r("uraz skóry", "травма кожи") },
];

const DISEASES: QuizItem[] = [
  { icon: "🔴", name: r("trądzik pospolity", "обыкновенные угри"), answer: "bakteryjna", explain: r("Ujścia gruczołów łojowych zatyka nadmiar łoju w okresie dojrzewania, a zaczopowane ujścia zakażają bakterie. Objawy: zaskórniki, grudki i krostki.", "Протоки сальных желёз закупоривает избыток кожного сала в период полового созревания, а закупоренные протоки заселяют бактерии. Признаки: комедоны, папулы и гнойнички.") },
  { icon: "🦶", name: r("grzybica stóp", "микоз стоп"), answer: "grzybicza", explain: r("Grzyby rozwijają się w ciepłym i wilgotnym środowisku. Objawy: swędzenie, zaczerwienienie i łuszczenie się skóry między palcami.", "Грибы развиваются в тёплой и влажной среде. Признаки: зуд, покраснение и шелушение кожи между пальцами.") },
  { icon: "✋", name: r("brodawki (kurzajki)", "бородавки"), answer: "wirusowa", explain: r("Wywołuje je wirus brodawczaka ludzkiego (HPV). Objawy: twarde, szorstkie grudki na dłoniach lub stopach.", "Их вызывает вирус папилломы человека (ВПЧ). Признаки: твёрдые шершавые узелки на кистях или стопах.") },
  { icon: "👄", name: r("opryszczka wargowa", "герпес губ"), answer: "wirusowa", explain: r("Wirus opryszczki pozostaje w nerwach i uaktywnia się przy spadku odporności. Objawy: bolesne pęcherzyki na brzegu warg.", "Вирус герпеса сохраняется в нервах и активируется при снижении иммунитета. Признаки: болезненные пузырьки на краю губ.") },
  { icon: "🕷️", name: r("świerzb", "чесотка"), answer: "pasozytnicza", explain: r("Świerzbowiec drąży korytarze w naskórku. Objaw: silny świąd nasilający się w nocy.", "Чесоточный клещ прокладывает ходы в эпидермисе. Признак: сильный зуд, усиливающийся ночью.") },
  { icon: "🪮", name: r("wszawica", "педикулёз"), answer: "pasozytnicza", explain: r("Wszy żywią się krwią i przyklejają jaja (gnidy) do włosów.", "Вши питаются кровью и приклеивают яйца (гниды) к волосам.") },
  { icon: "🩹", name: r("łuszczyca", "псориаз"), answer: "autoimmunologiczna", explain: r("Układ odpornościowy przyspiesza podziały komórek naskórka. Objawy: czerwone plamy pokryte srebrzystymi łuskami. Nie jest zaraźliwa.", "Иммунная система ускоряет деление клеток эпидермиса. Признаки: красные бляшки с серебристыми чешуйками. Не заразен.") },
  { icon: "🌿", name: r("pokrzywka", "крапивница"), answer: "alergiczna", explain: r("Po kontakcie z alergenem w skórze uwalnia się histamina. Objawy: swędzące bąble, które szybko znikają.", "После контакта с аллергеном в коже выделяется гистамин. Признаки: зудящие волдыри, которые быстро исчезают.") },
  { icon: "⚫", name: r("czerniak", "меланома"), answer: "nowotworowa", explain: r("Nowotworowe namnażanie się melanocytów, któremu sprzyja nadmiar promieniowania UV. Szybko daje przerzuty, dlatego tak ważne jest wczesne wykrycie.", "Опухолевое размножение меланоцитов, которому способствует избыток УФ-излучения. Быстро даёт метастазы, поэтому так важно раннее выявление.") },
  { icon: "🧬", name: r("albinizm", "альбинизм"), answer: "genetyczna", explain: r("Mutacja genu powoduje wrodzony brak melaniny — skóra jest bardzo wrażliwa na słońce.", "Мутация гена вызывает врождённое отсутствие меланина — кожа очень чувствительна к солнцу.") },
  { icon: "🫧", name: r("oparzenie II stopnia", "ожог II степени"), answer: "urazowa", explain: r("Wysoka temperatura uszkadza naskórek i część skóry właściwej. Objawy: pęcherze z płynem i silny ból.", "Высокая температура повреждает эпидермис и часть дермы. Признаки: пузыри с жидкостью и сильная боль.") },
];

// ---------- UV and sunscreen ----------

const SPF: { id: string; name: string; block: number }[] = [
  { id: "none", name: "—", block: 0 },
  { id: "15", name: "SPF 15", block: 0.93 },
  { id: "30", name: "SPF 30", block: 0.97 },
  { id: "50", name: "SPF 50", block: 0.98 },
];

const UV_LEVELS: { max: number; name: Txt; color: string; advice: Txt }[] = [
  { max: 2, name: r("niski", "низкий"), color: "#16a34a", advice: r("Ochrona zwykle nie jest potrzebna; w jasny dzień przydadzą się okulary przeciwsłoneczne.", "Защита обычно не нужна; в яркий день пригодятся солнцезащитные очки.") },
  { max: 5, name: r("umiarkowany", "умеренный"), color: "#ca8a04", advice: r("W południe szukaj cienia; nakrycie głowy, okulary i krem z filtrem SPF 30.", "В полдень ищи тень; головной убор, очки и крем SPF 30.") },
  { max: 7, name: r("wysoki", "высокий"), color: "#ea580c", advice: r("Ogranicz przebywanie na słońcu w godz. 11–15; koszulka, kapelusz, okulary, krem SPF 30–50 ponawiany co 2 godziny.", "Ограничь пребывание на солнце с 11 до 15 часов; футболка, шляпа, очки, крем SPF 30–50, который обновляют каждые 2 часа.") },
  { max: 10, name: r("bardzo wysoki", "очень высокий"), color: "#dc2626", advice: r("Unikaj słońca w południe; ochrona ubraniem, kapeluszem, okularami i kremem SPF 50 jest konieczna.", "Избегай солнца в полдень; защита одеждой, шляпой, очками и кремом SPF 50 обязательна.") },
  { max: 99, name: r("ekstremalny", "экстремальный"), color: "#7c3aed", advice: r("Skóra może się poparzyć w kilkanaście minut — w południe zostań w cieniu lub w pomieszczeniu.", "Кожа может обгореть за десяток-другой минут — в полдень оставайся в тени или в помещении.") },
];

const UV = {
  index: r("Indeks UV", "УФ-индекс"),
  cream: r("Krem z filtrem", "Солнцезащитный крем"),
  uvb: r(
    "UVB dociera do naskórka: wywołuje oparzenia słoneczne, ale jest też potrzebny do wytwarzania witaminy D.",
    "UVB достигает эпидермиса: вызывает солнечные ожоги, но нужен и для образования витамина D.",
  ),
  uva: r("UVA wnika głębiej, do skóry właściwej: niszczy włókna kolagenowe i przyspiesza starzenie się skóry.", "UVA проникает глубже, в дерму: разрушает коллагеновые волокна и ускоряет старение кожи."),
  dna: r(
    "Oba rodzaje uszkadzają DNA komórek skóry i zwiększają ryzyko nowotworów, w tym czerniaka. Opalenizna to obrona: melanocyty wytwarzają więcej melaniny.",
    "Оба вида повреждают ДНК клеток кожи и повышают риск опухолей, в том числе меланомы. Загар — это защита: меланоциты вырабатывают больше меланина.",
  ),
  spfNote: r("Liczba SPF dotyczy głównie UVB; ochronę przed UVA oznacza się na opakowaniu osobno.", "Число SPF относится в основном к UVB; защиту от UVA обозначают на упаковке отдельно."),
  reach: r("UVB docierające do skóry", "UVB, доходящий до кожи"),
  blocked: r("zatrzymuje", "задерживает"),
};

function SunWidget({ lang }: { lang: BioLang }) {
  const [index, setIndex] = useState(6);
  const [spf, setSpf] = useState("none");
  const level = UV_LEVELS.find((l) => index <= l.max)!;
  const block = SPF.find((s) => s.id === spf)!.block;
  const rays = Math.max(1, Math.min(6, Math.ceil(index / 2)));
  const pass = 1 - block;
  // the dose the skin gets, against an unprotected skin at index 11
  const dose = (index / 11) * pass;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <svg viewBox="0 0 300 220" className="w-full" role="img" aria-label={`${UV.index[lang]} ${index}: ${level.name[lang]}`}>
          <defs>
            <marker id="skind-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#7c3aed" />
            </marker>
            <marker id="skind-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#db2777" />
            </marker>
          </defs>
          <rect width={300} height={90} fill="#e0f2fe" />
          <circle cx={36} cy={30} r={16 + index} fill="#fde047" stroke="#f59e0b" strokeWidth={2} style={{ transition: "r .3s" }} />
          {/* skin: epidermis, dermis, hypodermis */}
          <rect y={90} width={300} height={34} fill="#fde68a" />
          <path d="M0 124 L 300 124" stroke="#a16207" strokeWidth={3} />
          <rect y={126} width={300} height={64} fill="#fecdd3" />
          <rect y={190} width={300} height={30} fill="#fef9c3" />
          {block > 0 && <rect y={84} width={300} height={6} fill="#f8fafc" stroke="#94a3b8" strokeDasharray="3 2" />}
          {Array.from({ length: rays }, (_, k) => {
            const x = 80 + k * 36;
            return (
              <g key={k}>
                <path d={`M${x} 6 L ${x + 6} 80`} stroke="#7c3aed" strokeWidth={2.5} markerEnd="url(#skind-b)" />
                <path d={`M${x + 6} 92 L ${x + 9} 118`} stroke="#7c3aed" strokeWidth={2.5} opacity={Math.max(0.12, pass)} markerEnd="url(#skind-b)" />
                <path d={`M${x + 14} 6 L ${x + 20} 80`} stroke="#db2777" strokeWidth={2} strokeDasharray="5 3" />
                <path d={`M${x + 20} 92 L ${x + 26} 170`} stroke="#db2777" strokeWidth={2} strokeDasharray="5 3" opacity={0.85} markerEnd="url(#skind-a)" />
              </g>
            );
          })}
          <g fontSize={9} fontWeight={600}>
            <text x={292} y={108} textAnchor="end" fill="#92400e">
              {lang === "pl" ? "naskórek" : "эпидермис"}
            </text>
            <text x={292} y={160} textAnchor="end" fill="#9f1239">
              {lang === "pl" ? "skóra właściwa" : "дерма"}
            </text>
            <text x={292} y={210} textAnchor="end" fill="#854d0e">
              {lang === "pl" ? "tkanka podskórna" : "подкожная клетчатка"}
            </text>
          </g>
          <g fontSize={10} fontWeight={700}>
            <rect x={196} y={8} width={96} height={34} rx={6} fill="white" opacity={0.85} />
            <path d="M202 18 L 216 18" stroke="#7c3aed" strokeWidth={2.5} />
            <text x={220} y={21} fill="#5b21b6">
              UVB
            </text>
            <path d="M202 34 L 216 34" stroke="#db2777" strokeWidth={2} strokeDasharray="5 3" />
            <text x={220} y={37} fill="#9d174d">
              UVA
            </text>
          </g>
        </svg>
        <label className="block text-sm font-semibold text-slate-700">
          {UV.index[lang]}: <span className="tabular-nums">{index >= 11 ? "11+" : index}</span>
          <input
            type="range"
            min={0}
            max={11}
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-violet-600"
            aria-valuetext={`${index}: ${level.name[lang]}`}
          />
        </label>
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">{UV.cream[lang]}</div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={UV.cream[lang]}>
            {SPF.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={spf === s.id}
                onClick={() => setSpf(s.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors ${
                  spf === s.id ? "bg-indigo-600 text-white ring-indigo-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
                }`}
              >
                {s.id === "none" ? (lang === "pl" ? "bez kremu" : "без крема") : s.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3" aria-live="polite">
        <div className="rounded-xl p-4 text-white" style={{ background: level.color }}>
          <div className="text-sm font-medium opacity-90">{UV.index[lang]}</div>
          <div className="text-2xl font-bold">
            {index >= 11 ? "11+" : index} · {level.name[lang]}
          </div>
          <p className="mt-1 text-[15px] leading-relaxed">{level.advice[lang]}</p>
        </div>
        <div className="text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-44 shrink-0">{UV.reach[lang]}</span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200" aria-hidden>
              <span className="block h-full bg-violet-600 transition-all" style={{ width: `${Math.round(dose * 100)}%` }} />
            </span>
          </div>
          {block > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              {SPF.find((s) => s.id === spf)!.name} {UV.blocked[lang]} ≈ {num(block * 100)}% UVB
            </p>
          )}
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
          <li>{UV.uvb[lang]}</li>
          <li>{UV.uva[lang]}</li>
          <li>{UV.dna[lang]}</li>
          {block > 0 && <li>{UV.spfNote[lang]}</li>}
        </ul>
      </div>
    </div>
  );
}

// ---------- ABCDE ----------

type Sign = "A" | "B" | "C" | "D" | "E";

const SIGNS: { id: Sign; name: Txt; text: Txt }[] = [
  { id: "A", name: r("Asymetria", "Асимметрия"), text: r("jedna połowa znamienia nie przypomina drugiej", "одна половина родинки не похожа на другую") },
  { id: "B", name: r("Brzegi", "Границы"), text: r("brzeg nieregularny, postrzępiony, zatarty", "край неровный, зубчатый, размытый") },
  { id: "C", name: r("Kolor", "Цвет"), text: r("barwa niejednolita — kilka odcieni brązu, czerń, czerwień", "окраска неоднородная — несколько оттенков коричневого, чёрный, красный") },
  { id: "D", name: r("Średnica", "Диаметр"), text: r("średnica powyżej 6 mm", "диаметр больше 6 мм") },
  { id: "E", name: r("Ewolucja", "Эволюция"), text: r("znamię zmienia się: rośnie, zmienia kształt lub barwę, swędzi, krwawi", "родинка меняется: растёт, меняет форму или цвет, чешется, кровоточит") },
];

const PX_PER_MM = 6;

function molePath(on: Record<Sign, boolean>, scale = 1) {
  const R = (on.D ? 4.5 : 2.4) * PX_PER_MM * scale;
  const pts: string[] = [];
  for (let k = 0; k < 72; k++) {
    const a = (k / 72) * Math.PI * 2;
    let rr = R * (1 + 0.03 * Math.sin(3 * a));
    if (on.A) rr *= 1 + 0.38 * Math.max(0, Math.cos(a - 0.5)) ** 2 - 0.12 * Math.max(0, Math.cos(a + 2.4));
    if (on.B) rr *= 1 + 0.09 * Math.sin(9 * a) + 0.06 * Math.sin(17 * a + 1);
    pts.push(`${k ? "L" : "M"}${(120 + rr * Math.cos(a)).toFixed(1)} ${(80 + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `${pts.join(" ")} Z`;
}

function Abcde({ lang }: { lang: BioLang }) {
  const [on, setOn] = useState<Record<Sign, boolean>>({ A: false, B: false, C: false, D: false, E: false });
  const count = SIGNS.filter((s) => on[s.id]).length;
  const d = molePath(on);
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 240 170" className="mx-auto w-full max-w-[380px]" role="img" aria-label={lang === "pl" ? "Znamię barwnikowe" : "Пигментная родинка"}>
          <defs>
            <clipPath id="skind-mole">
              <path d={d} />
            </clipPath>
          </defs>
          <rect width={240} height={170} rx={12} fill="#fde7d4" />
          {on.E && (
            <g>
              <path d={molePath({ ...on, A: false, B: false, D: false }, 0.9)} fill="none" stroke="#a16207" strokeWidth={1.5} strokeDasharray="4 3" />
              <text x={120} y={18} textAnchor="middle" fontSize={9} fill="#92400e">
                {lang === "pl" ? "przerywana linia — znamię 3 miesiące temu" : "пунктир — родинка 3 месяца назад"}
              </text>
            </g>
          )}
          <path d={d} fill="#7c4a1e" opacity={on.E ? 0.92 : 1} style={{ transition: "d .3s" }} />
          {on.C && (
            <g clipPath="url(#skind-mole)">
              <circle cx={136} cy={70} r={14} fill="#1c1917" />
              <circle cx={104} cy={92} r={12} fill="#b91c1c" opacity={0.75} />
              <circle cx={120} cy={60} r={9} fill="#d6a77a" />
            </g>
          )}
          {/* a ruler under the mole, 1 mm per tick */}
          <g>
            <path d={`M${120 - 3 * PX_PER_MM} 150 L ${120 + 3 * PX_PER_MM} 150`} stroke="#334155" strokeWidth={2} />
            {Array.from({ length: 7 }, (_, k) => (
              <path key={k} d={`M${120 + (k - 3) * PX_PER_MM} ${k % 3 === 0 ? 144 : 147} L ${120 + (k - 3) * PX_PER_MM} 150`} stroke="#334155" strokeWidth={1.2} />
            ))}
            <text x={120} y={164} textAnchor="middle" fontSize={9} fill="#334155">
              6 {lang === "pl" ? "mm" : "мм"}
            </text>
          </g>
        </svg>
      </div>
      <div className="space-y-3">
        <ul className="space-y-2">
          {SIGNS.map((s) => (
            <li key={s.id}>
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 ring-1 transition-colors ${on[s.id] ? "bg-rose-50 ring-rose-300" : "bg-white ring-slate-200 hover:bg-slate-50"}`}>
                <input type="checkbox" checked={on[s.id]} onChange={(e) => setOn({ ...on, [s.id]: e.target.checked })} className="mt-1 h-4 w-4 accent-rose-600" />
                <span className="text-sm leading-snug text-slate-700">
                  <b className="text-slate-900">
                    {s.id} — {s.name[lang]}:
                  </b>{" "}
                  {s.text[lang]}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p
          className={`rounded-xl px-4 py-3 text-[15px] leading-relaxed ring-1 ${count ? "bg-rose-50 text-rose-950 ring-rose-200" : "bg-emerald-50 text-emerald-950 ring-emerald-200"}`}
          aria-live="polite"
        >
          {count === 0
            ? lang === "pl"
              ? "Znamię wygląda typowo: małe, symetryczne, o równym brzegu i jednolitej barwie. Mimo to warto je regularnie oglądać."
              : "Родинка выглядит обычно: маленькая, симметричная, с ровным краем и однородной окраской. И всё же её стоит регулярно осматривать."
            : lang === "pl"
              ? `Niepokojących cech: ${count} z 5. Takie znamię trzeba pokazać dermatologowi — wcześnie wykryty czerniak można skutecznie usunąć chirurgicznie.`
              : `Тревожных признаков: ${count} из 5. Такую родинку нужно показать дерматологу — меланому, выявленную рано, можно успешно удалить хирургически.`}
        </p>
      </div>
    </div>
  );
}

// ---------- hygiene habits ----------

const HABITS: SortItem[] = [
  { name: r("krem z filtrem UV i unikanie słońca w południe", "крем с УФ-фильтром и избегание солнца в полдень"), group: 0, why: r("Chroni przed oparzeniem słonecznym, przedwczesnym starzeniem się skóry i nowotworami.", "Защищает от солнечного ожога, преждевременного старения кожи и опухолей.") },
  { name: r("opalanie się w solarium przed wakacjami", "загар в солярии перед отпуском"), group: 1, why: r("Sztuczne promieniowanie UV zwiększa ryzyko raka skóry, zwłaszcza przed 18. rokiem życia.", "Искусственный ультрафиолет повышает риск рака кожи, особенно до 18 лет.") },
  { name: r("regularne oglądanie znamion według reguły ABCDE", "регулярный осмотр родинок по правилу ABCDE"), group: 0, why: r("Pozwala wcześnie wykryć czerniaka.", "Позволяет рано выявить меланому.") },
  { name: r("chodzenie boso pod prysznicem na basenie", "ходить босиком в душе бассейна"), group: 1, why: r("Na mokrej podłodze łatwo zarazić się grzybicą stóp — lepiej nosić własne klapki.", "На мокром полу легко заразиться микозом стоп — лучше носить свои шлёпанцы.") },
  { name: r("dokładne osuszanie stóp, także między palcami", "тщательно вытирать стопы, в том числе между пальцами"), group: 0, why: r("Grzyby potrzebują wilgoci — suche stopy to dla nich złe warunki.", "Грибам нужна влага — сухие стопы для них плохая среда.") },
  { name: r("wyciskanie pryszczy", "выдавливание прыщей"), group: 1, why: r("Wtłacza bakterie głębiej i może zostawić blizny.", "Загоняет бактерии глубже и может оставить рубцы.") },
  { name: r("mycie twarzy łagodnym środkiem", "умывание мягким средством"), group: 0, why: r("Usuwa nadmiar łoju bez niszczenia bariery naskórka.", "Удаляет избыток кожного сала, не разрушая барьер эпидермиса.") },
  { name: r("pożyczanie grzebienia i czapki od kolegi", "брать у друга расчёску и шапку"), group: 1, why: r("Tak przenoszą się wszy — każdy powinien mieć własny grzebień i nakrycie głowy.", "Так передаются вши — у каждого должны быть свои расчёска и головной убор.") },
  { name: r("zmiana ułożenia osoby leżącej co 2 godziny", "смена положения лежачего больного каждые 2 часа"), group: 0, why: r("Zapobiega odleżynom — długi ucisk odcina skórze dopływ krwi.", "Предотвращает пролежни — долгое сдавливание прекращает приток крови к коже.") },
  { name: r("noszenie ciasnych butów z nieprzewiewnego materiału", "ношение тесной обуви из непродуваемого материала"), group: 1, why: r("Stopy się pocą, a ciepło i wilgoć sprzyjają grzybicy.", "Стопы потеют, а тепло и влага способствуют микозу.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Choroby zakaźne skóry wywołują bakterie (trądzik), wirusy (brodawki, opryszczka), grzyby (grzybica) i pasożyty (świerzb, wszawica).", "Инфекционные болезни кожи вызывают бактерии (угри), вирусы (бородавки, герпес), грибы (микоз) и паразиты (чесотка, педикулёз)."),
    r("Łuszczyca jest autoimmunologiczna, pokrzywka i AZS — alergiczne, albinizm — genetyczny; nie zaraża się nimi.", "Псориаз — аутоиммунный, крапивница и атопический дерматит — аллергические, альбинизм — генетический; ими не заражаются."),
  ],
  s2: [
    r("UVB powoduje oparzenia i wytwarzanie witaminy D, UVA wnika do skóry właściwej i przyspiesza jej starzenie; oba zwiększają ryzyko nowotworów.", "UVB вызывает ожоги и образование витамина D, UVA проникает в дерму и ускоряет её старение; оба повышают риск опухолей."),
  ],
  s3: [r("ABCDE: asymetria, brzegi, kolor, średnica powyżej 6 mm, ewolucja — każda z tych cech to sygnał, by pokazać znamię lekarzowi.", "ABCDE: асимметрия, границы, цвет, диаметр больше 6 мм, эволюция — каждый из этих признаков — повод показать родинку врачу.")],
  s4: [r("Własne klapki, grzebień i ręcznik, suche stopy, ochrona przed słońcem i rezygnacja z solarium to podstawy higieny skóry.", "Свои шлёпанцы, расчёска и полотенце, сухие стопы, защита от солнца и отказ от солярия — основы гигиены кожи.")],
};

export default function SkinDisordersLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="skind" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="skind-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s1}
          question={r("Do jakiej grupy chorób należy", "К какой группе болезней относится")}
          options={KINDS}
          items={DISEASES}
          wrongHint={r("Zastanów się, czy chorobę wywołuje drobnoustrój, pasożyt, własny organizm czy czynnik zewnętrzny.", "Подумай, вызывает ли болезнь микроб, паразит, собственный организм или внешний фактор.")}
        />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="skind-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <SunWidget lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="skind-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Abcde lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="skind-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={r("Dobry czy zły nawyk?", "Хорошая или плохая привычка?")} groups={[r("chroni skórę", "защищает кожу"), r("szkodzi skórze", "вредит коже")]} items={HABITS} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
