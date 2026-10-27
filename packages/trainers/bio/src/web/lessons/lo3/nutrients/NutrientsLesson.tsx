// Lesson for LO3 §4.2 "Organiczne składniki pokarmowe" and §4.3 "Rola witamin. Nieorganiczne składniki
// pokarmowe" (Biologia na czasie 3, zakres rozszerzony) — one lesson for both paragraphs, since the
// nutrient groups are best compared together. Terms follow templates/data/nutrition.ts
// (ORGANIC_NUTRIENTS, VITAMINS_MINERALS).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, TwoWaySort, type CompareCard, type QuizItem, type QuizOption, type SortItem } from "@portal/lessons";
import { num, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Pokarm dostarcza energii i materiału do budowy ciała. Węglowodany, białka i tłuszcze to organiczne składniki pokarmowe — dają energię i budulec. Witaminy, sole mineralne i woda nie dostarczają energii, ale bez nich organizm nie może działać.",
    "Пища даёт энергию и материал для построения тела. Углеводы, белки и жиры — органические питательные вещества: они дают энергию и строительный материал. Витамины, минеральные соли и вода энергии не дают, но без них организм работать не может.",
  ),
  s1: r("Węglowodany, białka, tłuszcze", "Углеводы, белки, жиры"),
  s1intro: r("Każda grupa jest zbudowana z innych „cegiełek” i pełni w organizmie inną rolę.", "Каждая группа построена из своих «кирпичиков» и выполняет в организме свою роль."),
  s2: r("Ile energii daje posiłek?", "Сколько энергии даёт еда?"),
  s2intro: r(
    "Ustaw, ile gramów każdego składnika zawiera posiłek. Talerz pokazuje, jaką część energii daje każda grupa.",
    "Укажи, сколько граммов каждого вещества содержит еда. Тарелка показывает, какую долю энергии даёт каждая группа.",
  ),
  s3: r("Dwie grupy witamin", "Две группы витаминов"),
  s3intro: r(
    "Witaminy to związki organiczne potrzebne w bardzo małych ilościach — wiele z nich wchodzi w skład enzymów. Organizm człowieka większości z nich nie wytwarza.",
    "Витамины — органические вещества, нужные в очень малых количествах; многие из них входят в состав ферментов. Большинство из них организм человека не синтезирует.",
  ),
  s4: r("Skutki niedoborów", "Последствия недостатка"),
  s4intro: r("Niedobór witaminy to awitaminoza (lub hipowitaminoza) — każda ma swoje typowe objawy.", "Недостаток витамина — авитаминоз (или гиповитаминоз) — у каждого свои типичные признаки."),
  s5: r("Makroelementy i mikroelementy", "Макроэлементы и микроэлементы"),
  s5intro: r(
    "Makroelementów potrzebujemy powyżej 100 mg na dobę, mikroelementów — znacznie mniej. Ważne są jedne i drugie.",
    "Макроэлементов нам нужно больше 100 мг в сутки, микроэлементов — гораздо меньше. Важны и те и другие.",
  ),
} satisfies Record<string, Txt>;

// ---------- the three groups ----------

const hex = (cx: number, cy: number, s: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    return `${k ? "L" : "M"}${(cx + s * Math.cos(a)).toFixed(1)} ${(cy + s * Math.sin(a)).toFixed(1)}`;
  }).join(" ") + " Z";

function CarbArt({ lang }: { lang: BioLang }) {
  return (
    <svg viewBox="0 0 220 120" className="w-full" aria-hidden>
      <path d={hex(30, 30, 12)} fill="#fde68a" stroke="#b45309" strokeWidth={2} />
      <text x={50} y={34} fontSize={10} fill="#78350f">
        {lang === "pl" ? "glukoza" : "глюкоза"}
      </text>
      {Array.from({ length: 8 }, (_, k) => (
        <path key={k} d={hex(20 + k * 25, 80, 11)} fill="#fde68a" stroke="#b45309" strokeWidth={2} />
      ))}
      <text x={110} y={110} textAnchor="middle" fontSize={10} fill="#78350f">
        {lang === "pl" ? "skrobia / glikogen — łańcuch glukozy" : "крахмал / гликоген — цепь глюкозы"}
      </text>
    </svg>
  );
}

const AA_COLORS = ["#fda4af", "#a5b4fc", "#86efac", "#fcd34d", "#c4b5fd", "#67e8f9"];

function ProteinArt({ lang }: { lang: BioLang }) {
  const pts = Array.from({ length: 12 }, (_, k) => [18 + k * 17, 62 + (k % 2 ? -14 : 14)] as const);
  return (
    <svg viewBox="0 0 220 120" className="w-full" aria-hidden>
      <path d={pts.map(([x, y], k) => `${k ? "L" : "M"}${x} ${y}`).join(" ")} stroke="#64748b" strokeWidth={2} fill="none" />
      {pts.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={8} fill={AA_COLORS[(k * 5) % AA_COLORS.length]} stroke="#475569" />
      ))}
      <text x={110} y={22} textAnchor="middle" fontSize={10} fill="#334155">
        {lang === "pl" ? "aminokwasy połączone wiązaniami peptydowymi" : "аминокислоты, связанные пептидными связями"}
      </text>
      <text x={110} y={110} textAnchor="middle" fontSize={10} fill="#334155">
        {lang === "pl" ? "20 rodzajów aminokwasów" : "20 видов аминокислот"}
      </text>
    </svg>
  );
}

function FatArt({ lang }: { lang: BioLang }) {
  return (
    <svg viewBox="0 0 220 120" className="w-full" aria-hidden>
      <rect x={30} y={22} width={34} height={76} rx={6} fill="#bae6fd" stroke="#0369a1" strokeWidth={2} />
      <text x={47} y={64} textAnchor="middle" fontSize={9} fill="#0c4a6e" transform="rotate(-90 47 60)">
        {lang === "pl" ? "glicerol" : "глицерин"}
      </text>
      {[34, 60, 86].map((y, k) => (
        <path
          key={y}
          d={`M64 ${y} ${Array.from({ length: 10 }, (_, j) => `L ${76 + j * 13} ${y + (j % 2 ? -6 : 6)}`).join(" ")}`}
          fill="none"
          stroke={k === 1 ? "#ca8a04" : "#a16207"}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      ))}
      <text x={140} y={112} textAnchor="middle" fontSize={10} fill="#713f12">
        {lang === "pl" ? "3 kwasy tłuszczowe" : "3 жирные кислоты"}
      </text>
    </svg>
  );
}

const L = {
  units: r("Jednostki budulcowe", "Строительные единицы"),
  energy: r("Energia z 1 g", "Энергия из 1 г"),
  role: r("Główna rola", "Главная роль"),
  sources: r("Źródła", "Источники"),
  note: r("Warto wiedzieć", "Важно знать"),
};

const GROUPS = (lang: BioLang): CompareCard[] => [
  {
    id: "carbs",
    icon: "🍞",
    name: r("Węglowodany", "Углеводы"),
    art: <CarbArt lang={lang} />,
    rows: [
      { label: L.units, value: r("cukry proste, np. glukoza; skrobia i glikogen to długie łańcuchy glukozy", "простые сахара, например глюкоза; крахмал и гликоген — длинные цепи глюкозы") },
      { label: L.energy, value: r("ok. 4 kcal (17 kJ)", "около 4 ккал (17 кДж)") },
      { label: L.role, value: r("główne, szybko dostępne źródło energii; glukoza to podstawowe paliwo neuronów", "главный, быстро доступный источник энергии; глюкоза — основное топливо нейронов") },
      { label: L.sources, value: r("pieczywo, kasze, makaron, ziemniaki, owoce, miód", "хлеб, крупы, макароны, картофель, фрукты, мёд") },
      { label: L.note, value: r("błonnik też jest węglowodanem — człowiek go nie trawi, ale pobudza on perystaltykę jelit i daje uczucie sytości", "пищевые волокна тоже углеводы — человек их не переваривает, но они усиливают перистальтику кишечника и дают чувство сытости") },
    ],
  },
  {
    id: "proteins",
    icon: "🥚",
    name: r("Białka", "Белки"),
    art: <ProteinArt lang={lang} />,
    rows: [
      { label: L.units, value: r("aminokwasy połączone wiązaniami peptydowymi", "аминокислоты, соединённые пептидными связями") },
      { label: L.energy, value: r("ok. 4 kcal (17 kJ)", "около 4 ккал (17 кДж)") },
      { label: L.role, value: r("budulcowa (mięśnie, kolagen), enzymy, niektóre hormony, przeciwciała, transport (hemoglobina)", "строительная (мышцы, коллаген), ферменты, некоторые гормоны, антитела, транспорт (гемоглобин)") },
      { label: L.sources, value: r("mięso, ryby, jaja, mleko i sery, nasiona roślin strączkowych", "мясо, рыба, яйца, молоко и сыры, семена бобовых") },
      { label: L.note, value: r("aminokwasów egzogennych organizm nie wytwarza; białko pełnowartościowe (np. z jaj i mleka) zawiera je wszystkie", "незаменимые аминокислоты организм не синтезирует; полноценный белок (например, из яиц и молока) содержит их все") },
    ],
  },
  {
    id: "fats",
    icon: "🧈",
    name: r("Tłuszcze", "Жиры"),
    art: <FatArt lang={lang} />,
    rows: [
      { label: L.units, value: r("glicerol i kwasy tłuszczowe", "глицерин и жирные кислоты") },
      { label: L.energy, value: r("ok. 9 kcal (38 kJ) — ponad dwa razy więcej", "около 9 ккал (38 кДж) — более чем вдвое больше") },
      { label: L.role, value: r("materiał zapasowy, izolacja cieplna, ochrona narządów; lipidy budują błony komórkowe; tłuszcze rozpuszczają witaminy A, D, E, K", "запасной материал, теплоизоляция, защита органов; липиды входят в клеточные мембраны; жиры растворяют витамины A, D, E, K") },
      { label: L.sources, value: r("oleje roślinne, masło, orzechy, tłuste ryby", "растительные масла, сливочное масло, орехи, жирная рыба") },
      { label: L.note, value: r("nienasycone kwasy tłuszczowe (oleje, ryby) służą układowi krążenia; nadmiar tłuszczów nasyconych i cholesterolu sprzyja miażdżycy", "ненасыщенные жирные кислоты (масла, рыба) полезны для кровеносной системы; избыток насыщенных жиров и холестерина способствует атеросклерозу") },
    ],
  },
];

// ---------- energy plate ----------

interface Macro {
  id: "c" | "p" | "f";
  name: Txt;
  kcal: number;
  max: number;
  color: string;
  /** recommended share of the diet's energy, % */
  range: [number, number];
}

const MACROS: Macro[] = [
  { id: "c", name: r("Węglowodany", "Углеводы"), kcal: 4, max: 150, color: "#f59e0b", range: [45, 65] },
  { id: "p", name: r("Białka", "Белки"), kcal: 4, max: 80, color: "#e11d48", range: [10, 20] },
  { id: "f", name: r("Tłuszcze", "Жиры"), kcal: 9, max: 60, color: "#0ea5e9", range: [20, 35] },
];

function sector(a0: number, a1: number, R: number, cx: number, cy: number): string {
  const p = (a: number) => `${(cx + R * Math.cos(a)).toFixed(2)} ${(cy + R * Math.sin(a)).toFixed(2)}`;
  return `M${cx} ${cy} L ${p(a0)} A ${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)} Z`;
}

function EnergyPlate({ lang }: { lang: BioLang }) {
  const [grams, setGrams] = useState<Record<Macro["id"], number>>({ c: 70, p: 25, f: 20 });
  const parts = MACROS.map((m) => ({ ...m, energy: grams[m.id] * m.kcal }));
  const total = parts.reduce((s, m) => s + m.energy, 0);
  const g = lang === "pl" ? "g" : "г";
  const kcal = lang === "pl" ? "kcal" : "ккал";
  const kj = lang === "pl" ? "kJ" : "кДж";
  let a = -Math.PI / 2;
  const slices = parts.map((m) => {
    const share = total ? m.energy / total : 0;
    const a0 = a;
    a += share * Math.PI * 2;
    return { ...m, share, a0, a1: a };
  });
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        {MACROS.map((m) => (
          <label key={m.id} className="block text-sm font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: m.color }} aria-hidden />
              {m.name[lang]}: <span className="tabular-nums">{grams[m.id]} {g}</span>
              <span className="font-normal text-slate-500">
                (× {m.kcal} {kcal})
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={m.max}
              value={grams[m.id]}
              onChange={(e) => setGrams({ ...grams, [m.id]: Number(e.target.value) })}
              className="mt-2 h-2 w-full cursor-pointer accent-emerald-600"
              aria-valuetext={`${grams[m.id]} ${g}`}
            />
          </label>
        ))}
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          {lang === "pl" ? "Energia posiłku" : "Энергия еды"} = 4 × {grams.c} + 4 × {grams.p} + 9 × {grams.f} = <b className="tabular-nums">{total} {kcal}</b>{" "}
          <span className="text-slate-500">
            (≈ {Math.round(total * 4.184)} {kj})
          </span>
        </p>
      </div>
      <div className="space-y-3">
        <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-[220px]" role="img" aria-label={lang === "pl" ? "Udział składników w energii posiłku" : "Доля веществ в энергии еды"}>
          <circle cx={100} cy={100} r={96} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={2} />
          <circle cx={100} cy={100} r={82} fill="white" stroke="#e2e8f0" />
          {slices.map((s) =>
            s.share >= 0.999 ? (
              <circle key={s.id} cx={100} cy={100} r={74} fill={s.color} />
            ) : s.share > 0 ? (
              <path key={s.id} d={sector(s.a0, s.a1, 74, 100, 100)} fill={s.color} stroke="white" strokeWidth={2} style={{ transition: "d .3s" }} />
            ) : null,
          )}
          {total === 0 && (
            <text x={100} y={104} textAnchor="middle" fontSize={12} fill="#94a3b8">
              {lang === "pl" ? "pusty talerz" : "пустая тарелка"}
            </text>
          )}
        </svg>
        <ul className="space-y-2 text-sm" aria-live="polite">
          {slices.map((s) => {
            const pct = Math.round(s.share * 100);
            const ok = total > 0 && pct >= s.range[0] && pct <= s.range[1];
            return (
              <li key={s.id}>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">{s.name[lang]}</span>
                  <span className="tabular-nums text-slate-600">
                    {pct}% <span className={ok ? "text-emerald-700" : "text-amber-700"}>{ok ? "✓" : pct < s.range[0] ? "↓" : "↑"}</span>
                  </span>
                </div>
                <div className="relative mt-1 h-2.5 rounded-full bg-slate-200" aria-hidden>
                  <div className="absolute inset-y-0 rounded-full bg-emerald-200" style={{ left: `${s.range[0]}%`, width: `${s.range[1] - s.range[0]}%` }} />
                  <div className="absolute -top-0.5 h-3.5 w-1.5 -translate-x-1/2 rounded-full transition-all" style={{ left: `${pct}%`, background: s.color }} />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-slate-500">
          {lang === "pl"
            ? `Zielony pasek — zalecany udział w energii diety: węglowodany ${MACROS[0]!.range.join("–")}%, białka ${MACROS[1]!.range.join("–")}%, tłuszcze ${MACROS[2]!.range.join("–")}%.`
            : `Зелёная полоса — рекомендуемая доля в энергии рациона: углеводы ${MACROS[0]!.range.join("–")}%, белки ${MACROS[1]!.range.join("–")}%, жиры ${MACROS[2]!.range.join("–")}%.`}
        </p>
      </div>
    </div>
  );
}

// ---------- vitamins ----------

const VITAMINS: SortItem[] = [
  { name: r("witamina A (retinol)", "витамин A (ретинол)"), group: 0, why: r("Gromadzi się w wątrobie; jej nadmiar z suplementów może zaszkodzić.", "Накапливается в печени; её избыток из добавок может навредить.") },
  { name: r("witamina C (kwas askorbinowy)", "витамин C (аскорбиновая кислота)"), group: 1, why: r("Jej nadmiar jest wydalany z moczem, więc trzeba ją dostarczać codziennie.", "Её избыток выводится с мочой, поэтому её нужно получать ежедневно.") },
  { name: r("witamina D", "витамин D"), group: 0, why: r("Powstaje też w skórze pod wpływem promieni UV; reguluje gospodarkę wapniem i fosforem.", "Образуется и в коже под действием УФ-лучей; регулирует обмен кальция и фосфора.") },
  { name: r("witamina B1 (tiamina)", "витамин B1 (тиамин)"), group: 1, why: r("Potrzebna do przemian węglowodanów.", "Нужна для превращений углеводов.") },
  { name: r("witamina E (tokoferol)", "витамин E (токоферол)"), group: 0, why: r("Przeciwutleniacz chroniący błony komórkowe — sama jest rozpuszczona w ich lipidach.", "Антиоксидант, защищающий клеточные мембраны, — сам растворён в их липидах.") },
  { name: r("witamina B12 (kobalamina)", "витамин B12 (кобаламин)"), group: 1, why: r("Potrzebna do wytwarzania krwinek czerwonych; występuje głównie w produktach zwierzęcych.", "Нужен для образования эритроцитов; содержится в основном в продуктах животного происхождения.") },
  { name: r("witamina K", "витамин K"), group: 0, why: r("Potrzebna do krzepnięcia krwi; wytwarzają ją też bakterie jelita grubego.", "Нужен для свёртывания крови; его синтезируют и бактерии толстой кишки.") },
  { name: r("kwas foliowy (witamina B9)", "фолиевая кислота (витамин B9)"), group: 1, why: r("Bierze udział w podziałach komórek — szczególnie ważny w ciąży.", "Участвует в делении клеток — особенно важна при беременности.") },
];

// ---------- deficiencies ----------

const DEFICIENCY_OPTIONS: QuizOption[] = [
  { id: "A", label: r("witamina A", "витамин A") },
  { id: "B1", label: r("witamina B1", "витамин B1") },
  { id: "B12", label: r("witamina B12", "витамин B12") },
  { id: "C", label: r("witamina C", "витамин C") },
  { id: "D", label: r("witamina D", "витамин D") },
  { id: "K", label: r("witamina K", "витамин K") },
  { id: "B9", label: r("kwas foliowy", "фолиевая кислота") },
  { id: "Fe", label: r("żelazo", "железо") },
  { id: "I", label: r("jod", "йод") },
  { id: "Ca", label: r("wapń", "кальций") },
  { id: "F", label: r("fluor", "фтор") },
];

const DEFICIENCIES: QuizItem[] = [
  { icon: "🌙", name: r("kurzą ślepotę (słabe widzenie o zmierzchu)", "куриную слепоту (плохое зрение в сумерках)"), answer: "A", explain: r("Witamina A jest składnikiem rodopsyny — barwnika wzrokowego pręcików.", "Витамин A входит в состав родопсина — зрительного пигмента палочек.") },
  { icon: "🦴", name: r("krzywicę u dzieci", "рахит у детей"), answer: "D", explain: r("Bez witaminy D jelito słabo wchłania wapń, więc kości są miękkie i wyginają się.", "Без витамина D кишечник плохо всасывает кальций, поэтому кости мягкие и искривляются.") },
  { icon: "🦷", name: r("szkorbut (krwawienie dziąseł, wypadanie zębów)", "цингу (кровоточивость дёсен, выпадение зубов)"), answer: "C", explain: r("Witamina C jest potrzebna do wytwarzania kolagenu — białka tkanki łącznej, także ścian naczyń.", "Витамин C нужен для синтеза коллагена — белка соединительной ткани, в том числе стенок сосудов.") },
  { icon: "🩹", name: r("skłonność do krwawień i siniaków", "склонность к кровотечениям и синякам"), answer: "K", explain: r("Witamina K jest potrzebna do wytwarzania czynników krzepnięcia krwi.", "Витамин K нужен для образования факторов свёртывания крови.") },
  { icon: "🧠", name: r("chorobę beri-beri (osłabienie mięśni, zaburzenia nerwowe)", "бери-бери (слабость мышц, нарушения нервной системы)"), answer: "B1", explain: r("Tiamina uczestniczy w przemianach węglowodanów, z których energię czerpią neurony i mięśnie.", "Тиамин участвует в превращениях углеводов, из которых получают энергию нейроны и мышцы.") },
  { icon: "🩸", name: r("niedokrwistość złośliwą", "злокачественное малокровие"), answer: "B12", explain: r("Witamina B12 jest potrzebna do wytwarzania krwinek czerwonych w szpiku kostnym.", "Витамин B12 нужен для образования эритроцитов в костном мозге.") },
  { icon: "🤰", name: r("wady cewy nerwowej u płodu", "пороки нервной трубки у плода"), answer: "B9", explain: r("Kwas foliowy jest potrzebny do szybkich podziałów komórek zarodka — kobietom planującym ciążę zaleca się jego suplementację.", "Фолиевая кислота нужна для быстрого деления клеток зародыша — женщинам, планирующим беременность, рекомендуют её принимать.") },
  { icon: "🥱", name: r("anemię — bladość, szybkie męczenie się, mało hemoglobiny", "анемию — бледность, быструю утомляемость, мало гемоглобина"), answer: "Fe", explain: r("Żelazo wchodzi w skład hemoglobiny przenoszącej tlen.", "Железо входит в состав гемоглобина, переносящего кислород.") },
  { icon: "🦒", name: r("wole — powiększenie tarczycy", "зоб — увеличение щитовидной железы"), answer: "I", explain: r("Jod jest składnikiem hormonów tarczycy (tyroksyny); dlatego sól kuchenną się jodkuje.", "Йод входит в состав гормонов щитовидной железы (тироксина); поэтому поваренную соль йодируют.") },
  { icon: "🪥", name: r("większą podatność zębów na próchnicę", "большую подверженность зубов кариесу"), answer: "F", explain: r("Fluor wzmacnia szkliwo zębów.", "Фтор укрепляет зубную эмаль.") },
  { icon: "💪", name: r("bolesne skurcze mięśni (tężyczkę) i kruchość kości", "болезненные судороги мышц (тетанию) и хрупкость костей"), answer: "Ca", explain: r("Wapń buduje kości i zęby, jest też potrzebny do prawidłowej pracy mięśni i nerwów oraz krzepnięcia krwi.", "Кальций строит кости и зубы, а также нужен для нормальной работы мышц и нервов и для свёртывания крови.") },
];

// ---------- minerals ----------

const MINERALS: SortItem[] = [
  { name: r("wapń (Ca)", "кальций (Ca)"), group: 0, why: r("Budulec kości i zębów; potrzebny do skurczu mięśni i krzepnięcia krwi.", "Строит кости и зубы; нужен для сокращения мышц и свёртывания крови.") },
  { name: r("żelazo (Fe)", "железо (Fe)"), group: 1, why: r("Składnik hemoglobiny i mioglobiny.", "Компонент гемоглобина и миоглобина.") },
  { name: r("fosfor (P)", "фосфор (P)"), group: 0, why: r("Składnik kości, ATP i kwasów nukleinowych.", "Компонент костей, АТФ и нуклеиновых кислот.") },
  { name: r("jod (I)", "йод (I)"), group: 1, why: r("Składnik hormonów tarczycy.", "Компонент гормонов щитовидной железы.") },
  { name: r("sód (Na)", "натрий (Na)"), group: 0, why: r("Główny kation płynu pozakomórkowego, reguluje gospodarkę wodną; jego nadmiar sprzyja nadciśnieniu.", "Главный катион внеклеточной жидкости, регулирует водный обмен; его избыток способствует гипертонии.") },
  { name: r("fluor (F)", "фтор (F)"), group: 1, why: r("Wzmacnia szkliwo zębów.", "Укрепляет зубную эмаль.") },
  { name: r("potas (K)", "калий (K)"), group: 0, why: r("Główny kation wnętrza komórek; niezbędny do przewodzenia impulsów nerwowych i pracy serca.", "Главный катион внутри клеток; необходим для проведения нервных импульсов и работы сердца.") },
  { name: r("cynk (Zn)", "цинк (Zn)"), group: 1, why: r("Składnik wielu enzymów; ważny dla odporności i gojenia ran.", "Компонент многих ферментов; важен для иммунитета и заживления ран.") },
  { name: r("magnez (Mg)", "магний (Mg)"), group: 0, why: r("Potrzebny do pracy mięśni i nerwów, aktywuje wiele enzymów.", "Нужен для работы мышц и нервов, активирует многие ферменты.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Węglowodany → cukry proste, białka → aminokwasy, tłuszcze → glicerol i kwasy tłuszczowe.", ru: "Углеводы → простые сахара, белки → аминокислоты, жиры → глицерин и жирные кислоты." },
    { pl: "Węglowodany są głównie energetyczne, białka — budulcowe, tłuszcze — zapasowe.", ru: "Углеводы в основном энергетические, белки — строительные, жиры — запасные." },
  ],
  s2: [{ pl: "1 g węglowodanów lub białek ≈ 4 kcal, 1 g tłuszczu ≈ 9 kcal (1 kcal ≈ 4,2 kJ).", ru: "1 г углеводов или белков ≈ 4 ккал, 1 г жира ≈ 9 ккал (1 ккал ≈ 4,2 кДж)." }],
  s3: [
    { pl: "W tłuszczach rozpuszczają się witaminy A, D, E, K — mogą się gromadzić w organizmie (wątroba, tkanka tłuszczowa).", ru: "В жирах растворяются витамины A, D, E, K — они могут накапливаться в организме (печень, жировая ткань)." },
    { pl: "W wodzie rozpuszczają się witamina C i witaminy z grupy B.", ru: "В воде растворяются витамин C и витамины группы B." },
  ],
  s4: [{ pl: "A — kurza ślepota, D — krzywica, C — szkorbut, B1 — beri-beri, B12 — niedokrwistość złośliwa.", ru: "A — куриная слепота, D — рахит, C — цинга, B1 — бери-бери, B12 — злокачественное малокровие." }],
  s5: [
    { pl: "Makroelementy: Ca, P, Mg, Na, K (także Cl, S); mikroelementy: Fe, I, F, Zn (także Cu, Se).", ru: "Макроэлементы: Ca, P, Mg, Na, K (а также Cl, S); микроэлементы: Fe, I, F, Zn (а также Cu, Se)." },
    { pl: "Woda stanowi ok. 60% masy ciała dorosłego — jest rozpuszczalnikiem i środowiskiem reakcji.", ru: "Вода составляет около 60% массы тела взрослого — она растворитель и среда для реакций." },
  ],
};

export default function NutrientsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="nutr" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="nutr-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={GROUPS(lang)} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="nutr-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <EnergyPlate lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="nutr-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort
          lang={lang}
          title={r("Gdzie się rozpuszcza?", "В чём растворяется?")}
          hint={r("Witaminy rozpuszczalne w tłuszczach wchłaniają się razem z tłuszczami.", "Жирорастворимые витамины всасываются вместе с жирами.")}
          groups={[r("w tłuszczach", "в жирах"), r("w wodzie", "в воде")]}
          items={VITAMINS}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="nutr-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={T.s4}
          question={r("Niedobór czego powoduje", "Недостаток чего вызывает")}
          options={DEFICIENCY_OPTIONS}
          items={DEFICIENCIES}
          wrongHint={r("Pomyśl, w jakim procesie lub w budowie jakiej tkanki bierze udział ten składnik.", "Подумай, в каком процессе или в построении какой ткани участвует это вещество.")}
        />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="nutr-s5" n={5} title={T.s5[lang]} intro={<p>{T.s5intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s5} groups={[r("makroelement", "макроэлемент"), r("mikroelement", "микроэлемент")]} items={MINERALS} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
