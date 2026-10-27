// Lesson for LO3 §11.5 "Higiena i choroby układu rozrodczego" (zakres rozszerzony). Diseases follow
// templates/data/disorders.ts (REPRODUCTIVE_DISORDERS; AIDS from IMMUNE_DISORDERS). The screening
// calendar gives general recommendations for Poland only; details are set by a doctor.
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { CompareTabs, MatchQuiz, TwoWaySort, type CompareCard, type QuizItem, type QuizOption, type SortItem } from "@portal/lessons";
import { Choice, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Choroby układu rozrodczego to głównie zakażenia przenoszone drogą płciową i nowotwory. Przed wieloma zakażeniami chronią szczepienia i odpowiedzialne zachowania, a nowotwory wykryte wcześnie — w badaniach profilaktycznych lub podczas samobadania — zwykle dają się skutecznie wyleczyć.",
    "Болезни половой системы — это в основном инфекции, передающиеся половым путём, и опухоли. От многих инфекций защищают прививки и ответственное поведение, а опухоли, выявленные рано — при профилактических обследованиях или самообследовании, — обычно удаётся успешно вылечить.",
  ),
  s1: r("Choroby przenoszone drogą płciową", "Болезни, передающиеся половым путём"),
  s1intro: r(
    "Wywołują je bakterie, wirusy i pierwotniaki. Od rodzaju patogenu zależy leczenie: antybiotyki działają tylko na bakterie.",
    "Их вызывают бактерии, вирусы и простейшие. От вида возбудителя зависит лечение: антибиотики действуют только на бактерии.",
  ),
  s2: r("Nowotwory narządów rozrodczych", "Опухоли половых органов"),
  s2intro: r("Porównaj najczęstsze nowotwory złośliwe układu rozrodczego i gruczołu sutkowego.", "Сравни самые частые злокачественные опухоли половой системы и молочной железы."),
  s3: r("Profilaktyka", "Профилактика"),
  s3intro: r(
    "Jedne działania chronią przed zachorowaniem, inne pozwalają wykryć chorobę na wczesnym etapie, gdy leczenie jest najskuteczniejsze.",
    "Одни меры защищают от заболевания, другие позволяют выявить болезнь на ранней стадии, когда лечение наиболее эффективно.",
  ),
  s4: r("Kalendarz badań profilaktycznych", "Календарь профилактических обследований"),
  s4intro: r(
    "Wybierz płeć i przesuń suwak wieku. To ogólne zalecenia obowiązujące w Polsce — szczegóły i częstotliwość badań zawsze ustala lekarz.",
    "Выбери пол и сдвигай ползунок возраста. Это общие рекомендации, действующие в Польше, — детали и частоту обследований всегда определяет врач.",
  ),
} satisfies Record<string, Txt>;

// ---------- STI quiz ----------

const PATHOGENS: QuizOption[] = [
  { id: "bacteria", label: r("bakteria", "бактерия") },
  { id: "virus", label: r("wirus", "вирус") },
  { id: "protist", label: r("pierwotniak", "простейшее") },
];

const STI: QuizItem[] = [
  {
    icon: "🔬",
    name: r("kiła", "сифилис"),
    answer: "bacteria",
    explain: r(
      "Wywołuje ją krętek blady. Najpierw pojawia się niebolesne owrzodzenie w miejscu zakażenia, później wysypka na skórze. Leczy się ją antybiotykami; nieleczona uszkadza wiele narządów i może przejść na płód.",
      "Вызывается бледной трепонемой. Сначала появляется безболезненная язва на месте заражения, позже сыпь на коже. Лечится антибиотиками; без лечения поражает многие органы и может передаться плоду.",
    ),
  },
  {
    icon: "🧬",
    name: r("zakażenie HPV", "папилломавирусная инфекция"),
    answer: "virus",
    explain: r(
      "Wirus brodawczaka ludzkiego wywołuje kłykciny kończyste, a niektóre jego typy mogą prowadzić do raka szyjki macicy. Istnieje skuteczna szczepionka.",
      "Вирус папилломы человека вызывает остроконечные кондиломы, а некоторые его типы могут привести к раку шейки матки. Существует эффективная вакцина.",
    ),
  },
  {
    icon: "🔬",
    name: r("rzeżączka", "гонорея"),
    answer: "bacteria",
    explain: r("Wywołują ją dwoinki rzeżączki. Objawy: ropna wydzielina i pieczenie przy oddawaniu moczu. Leczona antybiotykami.", "Вызывается гонококками. Признаки: гнойные выделения и жжение при мочеиспускании. Лечится антибиотиками."),
  },
  {
    icon: "🦠",
    name: r("rzęsistkowica", "трихомониаз"),
    answer: "protist",
    explain: r("Wywołuje ją pierwotniak — rzęsistek pochwowy. Objawy: pieniste upławy, swędzenie i pieczenie.", "Вызывается простейшим — влагалищной трихомонадой. Признаки: пенистые выделения, зуд и жжение."),
  },
  {
    icon: "🧬",
    name: r("AIDS", "СПИД"),
    answer: "virus",
    explain: r(
      "Wirus HIV niszczy limfocyty T pomocnicze. Zakazić się można drogą płciową, przez krew oraz od matki w czasie ciąży, porodu i karmienia piersią. Nie ma szczepionki, ale leki przeciwwirusowe hamują rozwój choroby.",
      "ВИЧ разрушает Т-хелперы. Заразиться можно половым путём, через кровь, а также от матери во время беременности, родов и кормления грудью. Вакцины нет, но противовирусные препараты сдерживают развитие болезни.",
    ),
  },
  {
    icon: "🔬",
    name: r("chlamydioza", "хламидиоз"),
    answer: "bacteria",
    explain: r(
      "Wywołują ją bakterie Chlamydia trachomatis. Często przebiega bez objawów, a nieleczona może prowadzić do niepłodności — dlatego warto się badać.",
      "Вызывается бактериями Chlamydia trachomatis. Часто протекает без симптомов, а без лечения может привести к бесплодию, — поэтому важно обследоваться.",
    ),
  },
  {
    icon: "🧬",
    name: r("opryszczka narządów płciowych", "генитальный герпес"),
    answer: "virus",
    explain: r(
      "Wywołuje ją wirus opryszczki pospolitej. Bolesne pęcherzyki nawracają, bo wirus pozostaje w organizmie; leki łagodzą objawy, ale nie usuwają wirusa.",
      "Вызывается вирусом простого герпеса. Болезненные пузырьки появляются снова и снова, потому что вирус остаётся в организме; лекарства облегчают симптомы, но не удаляют вирус.",
    ),
  },
  {
    icon: "🧬",
    name: r("wirusowe zapalenie wątroby typu B", "вирусный гепатит B"),
    answer: "virus",
    explain: r(
      "Wirus HBV uszkadza wątrobę; przenosi się drogą płciową i przez krew. W Polsce wszystkie niemowlęta są szczepione przeciw tej chorobie.",
      "Вирус HBV поражает печень; передаётся половым путём и через кровь. В Польше всех младенцев прививают от этой болезни.",
    ),
  },
];

// ---------- cancers ----------

const K = {
  who: r("Kogo dotyczy", "Кого касается"),
  risk: r("Czynniki ryzyka", "Факторы риска"),
  signs: r("Objawy", "Признаки"),
  detect: r("Wykrywanie i profilaktyka", "Выявление и профилактика"),
};

const CANCERS: CompareCard[] = [
  {
    id: "cervix",
    icon: "🎗️",
    name: r("Rak szyjki macicy", "Рак шейки матки"),
    rows: [
      { label: K.who, value: r("kobiety, najczęściej w średnim wieku", "женщин, чаще всего среднего возраста") },
      { label: K.risk, value: r("przewlekłe zakażenie onkogennymi typami HPV, palenie tytoniu, osłabiona odporność", "хроническая инфекция онкогенными типами ВПЧ, курение, ослабленный иммунитет") },
      { label: K.signs, value: r("długo bezobjawowy; później nieprawidłowe krwawienia", "долго протекает бессимптомно; позже нетипичные кровотечения") },
      { label: K.detect, value: r("cytologia wykrywa zmiany przedrakowe; szczepienie przeciw HPV zapobiega większości zachorowań", "цитологический мазок выявляет предраковые изменения; прививка от ВПЧ предотвращает большинство случаев") },
    ],
  },
  {
    id: "breast",
    icon: "🩷",
    name: r("Rak piersi", "Рак молочной железы"),
    rows: [
      { label: K.who, value: r("najczęstszy nowotwór złośliwy u kobiet; ryzyko rośnie z wiekiem", "самая частая злокачественная опухоль у женщин; риск растёт с возрастом") },
      { label: K.risk, value: r("wiek, predyspozycje dziedziczne (np. mutacje genów BRCA1 i BRCA2), otyłość, alkohol", "возраст, наследственная предрасположенность (например, мутации генов BRCA1 и BRCA2), ожирение, алкоголь") },
      { label: K.signs, value: r("wyczuwalny guzek w piersi, wciągnięcie brodawki lub zmiana skóry", "прощупываемое уплотнение в груди, втянутый сосок или изменение кожи") },
      { label: K.detect, value: r("samobadanie piersi, USG, mammografia", "самообследование груди, УЗИ, маммография") },
    ],
  },
  {
    id: "prostate",
    icon: "💙",
    name: r("Rak gruczołu krokowego", "Рак предстательной железы"),
    rows: [
      { label: K.who, value: r("mężczyźni, głównie po 50. roku życia", "мужчин, в основном после 50 лет") },
      { label: K.risk, value: r("wiek, zachorowania w rodzinie", "возраст, случаи болезни в семье") },
      { label: K.signs, value: r("trudności w oddawaniu moczu i częste parcie na pęcherz", "затруднённое мочеиспускание и частые позывы") },
      { label: K.detect, value: r("regularne badania urologiczne, oznaczenie PSA we krwi", "регулярные урологические обследования, анализ крови на ПСА") },
    ],
  },
  {
    id: "testis",
    icon: "🔵",
    name: r("Rak jądra", "Рак яичка"),
    rows: [
      { label: K.who, value: r("młodzi mężczyźni, najczęściej w wieku 15–40 lat", "молодых мужчин, чаще всего в возрасте 15–40 лет") },
      { label: K.risk, value: r("niezstąpienie jądra do moszny w dzieciństwie, zachorowania w rodzinie", "неопущение яичка в мошонку в детстве, случаи болезни в семье") },
      { label: K.signs, value: r("niebolesny guzek lub powiększenie jądra, uczucie ciężkości w mosznie", "безболезненное уплотнение или увеличение яичка, ощущение тяжести в мошонке") },
      { label: K.detect, value: r("samobadanie jąder raz w miesiącu", "самообследование яичек раз в месяц") },
    ],
    text: r("Wykryty wcześnie jest w zdecydowanej większości przypadków wyleczalny.", "Выявленный рано, в подавляющем большинстве случаев излечим."),
  },
];

// ---------- prevention sort ----------

const PROTECT = r("chroni przed zachorowaniem", "защищает от болезни");
const DETECT = r("wykrywa chorobę wcześnie", "выявляет болезнь рано");

const PREVENTION: SortItem[] = [
  { name: r("szczepienie przeciw HPV", "прививка от ВПЧ"), group: 0, why: r("Uczy układ odpornościowy rozpoznawać wirusa, zanim dojdzie do zakażenia.", "Учит иммунную систему распознавать вирус ещё до заражения.") },
  { name: r("cytologia", "цитологический мазок"), group: 1, why: r("Wykrywa zmienione komórki szyjki macicy, zanim rozwinie się rak.", "Выявляет изменённые клетки шейки матки до того, как разовьётся рак.") },
  { name: r("prezerwatywa", "презерватив"), group: 0, why: r("Bariera znacznie zmniejsza ryzyko zakażenia drogą płciową.", "Барьер значительно снижает риск заражения половым путём.") },
  { name: r("samobadanie jąder", "самообследование яичек"), group: 1, why: r("Pozwala samemu zauważyć guzek na wczesnym etapie.", "Позволяет самому заметить уплотнение на ранней стадии.") },
  { name: r("mammografia", "маммография"), group: 1, why: r("Zdjęcie rentgenowskie piersi pokazuje zmiany zbyt małe, by je wyczuć.", "Рентгеновский снимок груди показывает изменения, слишком маленькие, чтобы их прощупать.") },
  { name: r("szczepienie przeciw WZW typu B", "прививка от гепатита B"), group: 0, why: r("Chroni przed zakażeniem wirusem HBV.", "Защищает от заражения вирусом HBV.") },
  { name: r("samobadanie piersi", "самообследование груди"), group: 1, why: r("Regularne, comiesięczne badanie pozwala zauważyć zmiany w piersi.", "Регулярное ежемесячное обследование позволяет заметить изменения в груди.") },
  { name: r("unikanie ryzykownych zachowań seksualnych", "отказ от рискованного сексуального поведения"), group: 0, why: r("Zmniejsza prawdopodobieństwo kontaktu z patogenami.", "Снижает вероятность контакта с возбудителями.") },
  { name: r("test w kierunku HIV", "тест на ВИЧ"), group: 1, why: r("Wykrywa zakażenie, zanim pojawią się objawy — leczenie można rozpocząć wcześnie.", "Выявляет инфекцию до появления симптомов — лечение можно начать рано.") },
  { name: r("niepalenie tytoniu", "отказ от курения"), group: 0, why: r("Palenie zwiększa ryzyko wielu nowotworów, także raka szyjki macicy.", "Курение повышает риск многих опухолей, в том числе рака шейки матки.") },
];

// ---------- screening calendar ----------

type Sex = "f" | "m";

interface Check {
  id: string;
  sex: Sex | "all";
  from: number;
  to: number;
  name: Txt;
  how: Txt;
}

const MIN_AGE = 9;
const MAX_AGE = 75;

const CHECKS: Check[] = [
  {
    id: "hpv",
    sex: "all",
    from: 9,
    to: 14,
    name: r("Szczepienie przeciw HPV", "Прививка от ВПЧ"),
    how: r("Zalecane dla dziewcząt i chłopców, najlepiej w wieku 9–14 lat, przed rozpoczęciem współżycia. Można zaszczepić się także później.", "Рекомендуется девочкам и мальчикам, лучше всего в 9–14 лет, до начала половой жизни. Привиться можно и позже."),
  },
  {
    id: "testis",
    sex: "m",
    from: 15,
    to: MAX_AGE,
    name: r("Samobadanie jąder", "Самообследование яичек"),
    how: r("Raz w miesiącu, np. po ciepłym prysznicu. Szczególnie ważne w wieku 15–40 lat.", "Раз в месяц, например после тёплого душа. Особенно важно в 15–40 лет."),
  },
  {
    id: "hiv",
    sex: "all",
    from: 15,
    to: MAX_AGE,
    name: r("Test w kierunku HIV", "Тест на ВИЧ"),
    how: r("Każdy powinien wykonać go przynajmniej raz w życiu i zawsze po sytuacji ryzykownej. Można go zrobić bezpłatnie i anonimowo w punktach konsultacyjno-diagnostycznych.", "Каждому стоит сделать его хотя бы раз в жизни и всегда после рискованной ситуации. Его можно сдать бесплатно и анонимно в консультационно-диагностических пунктах."),
  },
  {
    id: "gyn",
    sex: "f",
    from: 16,
    to: MAX_AGE,
    name: r("Wizyta kontrolna u ginekologa", "Профилактический визит к гинекологу"),
    how: r("Pierwsza wizyta — w razie niepokojących objawów lub przed rozpoczęciem współżycia; potem regularnie, zwykle raz w roku.", "Первый визит — при тревожных симптомах или до начала половой жизни; затем регулярно, обычно раз в год."),
  },
  {
    id: "breast",
    sex: "f",
    from: 20,
    to: MAX_AGE,
    name: r("Samobadanie piersi", "Самообследование груди"),
    how: r("Raz w miesiącu, kilka dni po miesiączce (po menopauzie — w stałym dniu miesiąca).", "Раз в месяц, через несколько дней после менструации (после менопаузы — в один и тот же день месяца)."),
  },
  {
    id: "cyto",
    sex: "f",
    from: 25,
    to: 64,
    name: r("Cytologia", "Цитологический мазок"),
    how: r("W bezpłatnym programie profilaktyki raka szyjki macicy dla kobiet w wieku 25–64 lat — zwykle co 3 lata, częściej, jeśli zaleci lekarz.", "В бесплатной программе профилактики рака шейки матки для женщин 25–64 лет — обычно раз в 3 года, чаще, если назначит врач."),
  },
  {
    id: "mammo",
    sex: "f",
    from: 45,
    to: 74,
    name: r("Mammografia", "Маммография"),
    how: r("W bezpłatnym programie profilaktyki raka piersi dla kobiet w wieku 45–74 lat — co 2 lata. Młodszym kobietom lekarz może zalecić USG piersi.", "В бесплатной программе профилактики рака груди для женщин 45–74 лет — раз в 2 года. Женщинам моложе врач может назначить УЗИ груди."),
  },
  {
    id: "uro",
    sex: "m",
    from: 50,
    to: MAX_AGE,
    name: r("Badanie urologiczne (gruczoł krokowy)", "Урологическое обследование (предстательная железа)"),
    how: r("Po 50. roku życia regularnie, zwykle raz w roku; przy zachorowaniach w rodzinie — wcześniej.", "После 50 лет регулярно, обычно раз в год; при случаях болезни в семье — раньше."),
  },
];

function Screening({ lang }: { lang: BioLang }) {
  const [sex, setSex] = useState<Sex>("f");
  const [age, setAge] = useState(17);
  const list = CHECKS.filter((c) => c.sex === "all" || c.sex === sex);
  const now = list.filter((c) => age >= c.from && age <= c.to);
  const later = list.filter((c) => age < c.from);
  const xa = (a: number) => 12 + ((a - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 296;
  const rowH = 28;
  const h = list.length * rowH + 30;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex gap-2" role="radiogroup" aria-label={lang === "pl" ? "Płeć" : "Пол"}>
          {(["f", "m"] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={sex === s}
              onClick={() => setSex(s)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
                sex === s ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
              }`}
            >
              {s === "f" ? (lang === "pl" ? "♀ Kobieta" : "♀ Женщина") : lang === "pl" ? "♂ Mężczyzna" : "♂ Мужчина"}
            </button>
          ))}
        </div>
        <label className="min-w-[220px] flex-1 text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Wiek" : "Возраст"}: <span className="tabular-nums">{age}</span> {lang === "pl" ? "lat" : "лет"}
          <input
            type="range"
            min={MIN_AGE}
            max={MAX_AGE}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-emerald-600"
          />
        </label>
      </div>
      <svg viewBox={`0 0 320 ${h}`} className="w-full" role="img" aria-label={lang === "pl" ? "Oś wieku z zalecanymi badaniami" : "Шкала возраста с рекомендуемыми обследованиями"}>
        {list.map((c, k) => {
          const on = age >= c.from && age <= c.to;
          const y = k * rowH;
          // a rough text width: keep the label inside the chart, right-aligned to the bar when it would overflow
          const fits = xa(c.from) + c.name[lang].length * 5.6 < 316;
          return (
            <g key={c.id}>
              <text x={fits ? xa(c.from) : xa(c.to)} y={y + 12} fontSize={10} fill={on ? "#065f46" : "#64748b"} fontWeight={on ? 700 : 400} textAnchor={fits ? "start" : "end"}>
                {c.name[lang]}
              </text>
              <rect x={xa(c.from)} y={y + 16} width={Math.max(4, xa(c.to) - xa(c.from))} height={8} rx={4} fill={on ? "#10b981" : "#cbd5e1"} />
            </g>
          );
        })}
        <path d={`M${xa(MIN_AGE)} ${h - 22} L ${xa(MAX_AGE)} ${h - 22}`} stroke="#94a3b8" />
        {[10, 20, 30, 40, 50, 60, 70].map((a) => (
          <text key={a} x={xa(a)} y={h - 9} textAnchor="middle" fontSize={9} fill="#64748b">
            {a}
          </text>
        ))}
        <path d={`M${xa(age)} 0 L ${xa(age)} ${h - 22}`} stroke="#0f172a" strokeWidth={1.5} strokeDasharray="3 2" />
      </svg>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" aria-live="polite">
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <h3 className="text-base font-semibold text-emerald-900">✅ {lang === "pl" ? "Zalecane w tym wieku" : "Рекомендуется в этом возрасте"}</h3>
          {now.length ? (
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-emerald-950">
              {now.map((c) => (
                <li key={c.id}>
                  <b>{c.name[lang]}.</b> {c.how[lang]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-emerald-950">{lang === "pl" ? "W tym wieku nie ma badań z tej listy." : "В этом возрасте обследований из этого списка нет."}</p>
          )}
        </div>
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <h3 className="text-base font-semibold text-slate-800">⏭ {lang === "pl" ? "Później" : "Позже"}</h3>
          {later.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {later.map((c) => (
                <li key={c.id}>
                  <Choice onClick={() => setAge(c.from)}>
                    {c.name[lang]} · {lang === "pl" ? "od" : "с"} {c.from} {lang === "pl" ? "lat" : "лет"}
                  </Choice>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">{lang === "pl" ? "Wszystkie badania z listy już obowiązują." : "Все обследования из списка уже актуальны."}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Bakteryjne: kiła, rzeżączka, chlamydioza — leczone antybiotykami. Wirusowe: HPV, opryszczka, AIDS, WZW typu B. Pierwotniakowa: rzęsistkowica.", ru: "Бактериальные: сифилис, гонорея, хламидиоз — лечатся антибиотиками. Вирусные: ВПЧ, герпес, СПИД, гепатит B. Вызванная простейшими: трихомониаз." },
    { pl: "Wiele zakażeń przebiega bez objawów, a mimo to może prowadzić do niepłodności.", ru: "Многие инфекции протекают бессимптомно, но всё равно могут привести к бесплодию." },
  ],
  s2: [
    { pl: "Główną przyczyną raka szyjki macicy jest przewlekłe zakażenie onkogennymi typami HPV.", ru: "Главная причина рака шейки матки — хроническая инфекция онкогенными типами ВПЧ." },
    { pl: "Rak jądra dotyczy głównie młodych mężczyzn, rak gruczołu krokowego — starszych.", ru: "Рак яичка поражает в основном молодых мужчин, рак предстательной железы — пожилых." },
  ],
  s3: [
    { pl: "Szczepienia i prezerwatywa chronią przed zakażeniem; cytologia, mammografia i samobadanie wykrywają chorobę wcześnie.", ru: "Прививки и презерватив защищают от заражения; цитология, маммография и самообследование выявляют болезнь рано." },
  ],
  s4: [
    { pl: "Samobadanie piersi i jąder — raz w miesiącu; cytologia — regularnie od 25. roku życia; mammografia — co 2 lata w programie dla kobiet w wieku 45–74 lat.", ru: "Самообследование груди и яичек — раз в месяц; цитология — регулярно с 25 лет; маммография — раз в 2 года по программе для женщин 45–74 лет." },
  ],
};

export default function ReproductiveDisordersLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="repd" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="repd-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={r("Co wywołuje chorobę?", "Что вызывает болезнь?")}
          question={r("Jaki patogen wywołuje chorobę:", "Какой возбудитель вызывает болезнь:")}
          options={PATHOGENS}
          items={STI}
          wrongHint={r("Przypomnij sobie nazwę patogenu: krętki i dwoinki to bakterie, rzęsistek to pierwotniak.", "Вспомни название возбудителя: трепонемы и гонококки — бактерии, трихомонада — простейшее.")}
        />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="repd-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={CANCERS} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="repd-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={r("Zapobieganie czy wczesne wykrywanie?", "Предупреждение или раннее выявление?")} groups={[PROTECT, DETECT]} items={PREVENTION} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="repd-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Screening lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
