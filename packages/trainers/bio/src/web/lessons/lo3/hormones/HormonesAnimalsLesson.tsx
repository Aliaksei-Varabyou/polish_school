// Lesson for LO3 §10.1 "Układ hormonalny u zwierząt" (zakres rozszerzony). Terms follow
// templates/data/comparative.ts (ANIMAL_HORMONES).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { SpeciesGallery, TwoWaySort, type SortItem, type Species } from "../../games.tsx";
import { Choice, KIT, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Już u bezkręgowców część neuronów — komórki neurosekrecyjne — wydziela hormony do płynów ciała. U owadów hormony sterują linieniem i przeobrażeniem, u płazów tyroksyna zamienia kijankę w żabę. Zwierzęta porozumiewają się też substancjami wydzielanymi na zewnątrz — feromonami.",
    "Уже у беспозвоночных часть нейронов — нейросекреторные клетки — выделяет гормоны в жидкости тела. У насекомых гормоны управляют линькой и превращением, у земноводных тироксин превращает головастика в лягушку. Животные общаются и с помощью веществ, выделяемых наружу, — феромонов.",
  ),
  s1: r("Hormon czy feromon?", "Гормон или феромон?"),
  s1intro: r(
    "Hormon działa wewnątrz organizmu, który go wydzielił; feromon — na inne osobniki tego samego gatunku.",
    "Гормон действует внутри организма, который его выделил; феромон — на других особей того же вида.",
  ),
  s2: r("Feromony w świecie zwierząt", "Феромоны в мире животных"),
  s3: r("Linienie i przeobrażenie owadów", "Линька и превращение насекомых"),
  s3intro: r(
    "Steruj gąsienicą motyla: ustaw poziom hormonu juwenilnego i wywołaj wyrzut ekdyzonu. Spróbuj odtworzyć naturalny rozwój: larwa → poczwarka → motyl.",
    "Управляй гусеницей бабочки: установи уровень ювенильного гормона и вызови выброс экдизона. Попробуй воспроизвести естественное развитие: личинка → куколка → бабочка.",
  ),
  s4: r("Tyroksyna i przeobrażenie płazów", "Тироксин и превращение земноводных"),
  s4intro: r("Powtórz klasyczne doświadczenie z kijankami żaby. Wybierz warunki i przesuwaj czas.", "Повтори классический опыт с головастиками лягушки. Выбери условия и двигай время."),
} satisfies Record<string, Txt>;

// ---------- hormone or pheromone ----------

const SORT_ITEMS: SortItem[] = [
  {
    name: r("ekdyzon wywołuje linienie gąsienicy", "экдизон вызывает линьку гусеницы"),
    group: 0,
    why: r("Wydzielają go gruczoły przedpiersiowe i działa w ciele tej samej gąsienicy.", "Его выделяют проторакальные железы, и действует он в теле той же гусеницы."),
  },
  {
    name: r("bombykol samicy jedwabnika wabi samca", "бомбикол самки шелкопряда привлекает самца"),
    group: 1,
    why: r("Wydzielany na zewnątrz, działa na innego osobnika — to feromon płciowy.", "Выделяется наружу и действует на другую особь — это половой феромон."),
  },
  {
    name: r("ślad zapachowy mrówek prowadzi do pokarmu", "пахучий след муравьёв ведёт к пище"),
    group: 1,
    why: r("Kieruje zachowaniem innych robotnic — to feromon śladowy.", "Управляет поведением других рабочих муравьёв — это следовой феромон."),
  },
  {
    name: r("tyroksyna wywołuje przeobrażenie kijanki", "тироксин вызывает превращение головастика"),
    group: 0,
    why: r("Hormon tarczycy krąży we krwi kijanki i zmienia jej własne tkanki.", "Гормон щитовидной железы циркулирует в крови головастика и меняет его собственные ткани."),
  },
  {
    name: r("substancja królowej hamuje rozwój jajników robotnic", "вещество матки подавляет развитие яичников рабочих пчёл"),
    group: 1,
    why: r("Królowa wydziela ją na zewnątrz, a działa na robotnice — to feromon.", "Матка выделяет его наружу, а действует оно на рабочих пчёл — это феромон."),
  },
  {
    name: r("hormon juwenilny utrzymuje cechy larwalne", "ювенильный гормон сохраняет личиночные черты"),
    group: 0,
    why: r("Wydzielany przez ciałka przyległe, działa w ciele larwy.", "Выделяется прилежащими телами и действует в теле личинки."),
  },
  {
    name: r("melatonina wyznacza okres godowy jelenia", "мелатонин определяет брачный период оленя"),
    group: 0,
    why: r("Hormon szyszynki; długość jego nocnego wydzielania informuje organizm o porze roku.", "Гормон эпифиза; длительность его ночного выделения сообщает организму о времени года."),
  },
  {
    name: r("zapach użądlenia pobudza inne pszczoły do ataku", "запах ужаления побуждает других пчёл к нападению"),
    group: 1,
    why: r("To feromon alarmowy — ostrzega i mobilizuje cały rój.", "Это феромон тревоги — он предупреждает и мобилизует весь рой."),
  },
];

// ---------- pheromones ----------

const PHEROMONES: Species[] = [
  {
    icon: "🐛",
    name: r("Jedwabnik morwowy", "Тутовый шелкопряд"),
    tag: r("feromon płciowy", "половой феромон"),
    text: r(
      "Samica wydziela bombykol — pierwszy poznany feromon. Samiec wyczuwa go czułkami nawet w bardzo małym stężeniu i leci do samicy.",
      "Самка выделяет бомбикол — первый открытый феромон. Самец улавливает его усиками даже в очень малой концентрации и летит к самке.",
    ),
  },
  {
    icon: "🐜",
    name: r("Mrówki", "Муравьи"),
    tag: r("feromon śladowy", "следовой феромон"),
    text: r(
      "Robotnica, która znalazła pokarm, wraca do mrowiska, znacząc drogę feromonem. Inne mrówki idą tym śladem i go wzmacniają — tak powstają mrówcze „ścieżki”.",
      "Рабочий муравей, нашедший пищу, возвращается в муравейник, отмечая путь феромоном. Другие муравьи идут по следу и усиливают его — так возникают муравьиные «тропы».",
    ),
  },
  {
    icon: "👑",
    name: r("Królowa pszczół", "Пчелиная матка"),
    tag: r("feromon królowej", "феромон матки"),
    text: r(
      "Substancja królowej hamuje rozwój jajników robotnic i powstrzymuje je przed wychowywaniem nowych królowych. Gdy królowa zginie, feromonu brakuje i robotnice zaczynają wychowywać nową.",
      "Вещество матки подавляет развитие яичников рабочих пчёл и удерживает их от выращивания новых маток. Если матка погибает, феромона не хватает, и пчёлы начинают выращивать новую.",
    ),
  },
  {
    icon: "🐝",
    name: r("Pszczoła miodna", "Медоносная пчела"),
    tag: r("feromon alarmowy", "феромон тревоги"),
    text: r(
      "Przy użądleniu uwalnia się substancja o zapachu przypominającym banany. Pobudza ona inne pszczoły do obrony gniazda i ataku.",
      "При ужалении выделяется вещество с запахом, напоминающим бананы. Оно побуждает других пчёл защищать гнездо и нападать.",
    ),
  },
  {
    icon: "🐕",
    name: r("Psy, koty, jelenie", "Собаки, кошки, олени"),
    tag: r("znakowanie terenu", "мечение территории"),
    text: r(
      "Znakują teren moczem lub wydzieliną gruczołów zapachowych. Zapach informuje inne osobniki o obecności właściciela terytorium, jego płci i gotowości do rozrodu.",
      "Метят территорию мочой или выделениями пахучих желёз. Запах сообщает другим особям о присутствии хозяина территории, его поле и готовности к размножению.",
    ),
  },
  {
    icon: "🪲",
    name: r("Kornik drukarz", "Короед-типограф"),
    tag: r("feromon agregacyjny", "агрегационный феромон"),
    text: r(
      "Chrząszcze, które zaatakowały świerk, wabią feromonem kolejne osobniki. Leśnicy wykorzystują ten feromon w pułapkach, by ograniczać liczebność szkodnika.",
      "Жуки, напавшие на ель, привлекают феромоном новых особей. Лесники используют этот феромон в ловушках, чтобы сокращать численность вредителя.",
    ),
  },
];

// ---------- insect metamorphosis ----------

type Stage = { kind: "larva"; instar: number } | { kind: "pupa" } | { kind: "adult" };
type Jh = "high" | "low" | "none";

const jhLevel = (v: number): Jh => (v >= 50 ? "high" : v >= 10 ? "low" : "none");

const JH_NAME: Record<Jh, Txt> = {
  high: r("wysoki", "высокий"),
  low: r("niski", "низкий"),
  none: r("brak", "нет"),
};

const stageName = (s: Stage, lang: BioLang) =>
  s.kind === "larva" ? (lang === "pl" ? `larwa (${s.instar}. stadium)` : `личинка (${s.instar}-й возраст)`) : s.kind === "pupa" ? (lang === "pl" ? "poczwarka" : "куколка") : lang === "pl" ? "motyl (imago)" : "бабочка (имаго)";

function molt(stage: Stage, jh: Jh): { next: Stage; text: Txt } {
  if (stage.kind === "adult")
    return {
      next: stage,
      text: r(
        "Owad dorosły już nie linieje — po przeobrażeniu gruczoły przedpiersiowe zanikają, a pancerz nie musi już rosnąć.",
        "Взрослое насекомое уже не линяет — после превращения проторакальные железы исчезают, и покрову больше не нужно расти.",
      ),
    };
  if (stage.kind === "pupa") {
    if (jh === "none")
      return {
        next: { kind: "adult" },
        text: r("Ekdyzon bez hormonu juwenilnego: z poczwarki wychodzi owad dorosły — motyl.", "Экдизон без ювенильного гормона: из куколки выходит взрослое насекомое — бабочка."),
      };
    return {
      next: stage,
      text: r(
        "Hormon juwenilny blokuje powstanie postaci dorosłej — poczwarka linieje w kolejną poczwarkę. W naturze w poczwarce tego hormonu już nie ma; obniż go do zera.",
        "Ювенильный гормон блокирует появление взрослой формы — куколка линяет в новую куколку. В природе в куколке этого гормона уже нет; снизь его до нуля.",
      ),
    };
  }
  if (jh === "high")
    return {
      next: { kind: "larva", instar: stage.instar + 1 },
      text:
        stage.instar >= 5
          ? r(
              "Dodatkowe linienie larwalne — powstaje olbrzymia larwa. Tak było w doświadczeniach, w których larwie przeszczepiano dodatkowe ciałka przyległe.",
              "Лишняя личиночная линька — получается гигантская личинка. Так было в опытах, где личинке пересаживали дополнительные прилежащие тела.",
            )
          : r("Ekdyzon + wysoki poziom hormonu juwenilnego: linienie larwalne — powstaje większa larwa.", "Экдизон + высокий уровень ювенильного гормона: личиночная линька — получается более крупная личинка."),
    };
  return {
    next: { kind: "pupa" },
    text:
      stage.instar < 4
        ? r(
            "Za mało hormonu juwenilnego zbyt wcześnie: przedwczesne przepoczwarczenie — powstanie mała poczwarka, a z niej miniaturowy motyl.",
            "Слишком мало ювенильного гормона слишком рано: преждевременное окукливание — получится маленькая куколка, а из неё миниатюрная бабочка.",
          )
        : r("Ekdyzon + niski poziom hormonu juwenilnego: larwa przepoczwarcza się.", "Экдизон + низкий уровень ювенильного гормона: личинка окукливается."),
  };
}

function InsectArt({ stage, small }: { stage: Stage; small: boolean }) {
  if (stage.kind === "larva") {
    const rr = 6 + Math.min(stage.instar, 9) * 1.7;
    const n = 7;
    const x0 = 130 - ((n - 1) * rr * 1.25) / 2;
    const cy = 120 - rr;
    return (
      <g>
        {Array.from({ length: n }, (_, k) => (
          <circle key={k} cx={x0 + k * rr * 1.25} cy={cy - (k % 2) * 2} r={rr} fill={k === n - 1 ? "#4d7c0f" : "#84cc16"} stroke="#3f6212" strokeWidth={1.5} />
        ))}
        <circle cx={x0 + (n - 1) * rr * 1.25 + rr * 0.3} cy={cy - rr * 0.3} r={rr * 0.18} fill="#1e293b" />
        {Array.from({ length: n - 1 }, (_, k) => (
          <path key={k} d={`M${x0 + k * rr * 1.25} ${cy + rr} l 0 ${rr * 0.2}`} stroke="#3f6212" strokeWidth={2} />
        ))}
      </g>
    );
  }
  const s = small ? 0.7 : 1;
  if (stage.kind === "pupa")
    return (
      <g transform={`translate(130 86) scale(${s})`}>
        <ellipse cx={0} cy={0} rx={22} ry={40} fill="#a16207" stroke="#713f12" strokeWidth={2} />
        {[-20, -8, 4, 16].map((y) => (
          <path key={y} d={`M${-18} ${y} Q 0 ${y + 6} 18 ${y}`} stroke="#713f12" fill="none" />
        ))}
        <path d="M0 -40 L 0 -54" stroke="#713f12" strokeWidth={2} />
      </g>
    );
  return (
    <g transform={`translate(130 86) scale(${s})`}>
      <ellipse cx={-30} cy={-16} rx={30} ry={22} fill="#f97316" stroke="#9a3412" strokeWidth={2} />
      <ellipse cx={30} cy={-16} rx={30} ry={22} fill="#f97316" stroke="#9a3412" strokeWidth={2} />
      <ellipse cx={-22} cy={18} rx={20} ry={16} fill="#fb923c" stroke="#9a3412" strokeWidth={2} />
      <ellipse cx={22} cy={18} rx={20} ry={16} fill="#fb923c" stroke="#9a3412" strokeWidth={2} />
      <circle cx={-30} cy={-18} r={6} fill="#1e293b" />
      <circle cx={30} cy={-18} r={6} fill="#1e293b" />
      <ellipse cx={0} cy={0} rx={5} ry={30} fill="#1e293b" />
      <path d="M-2 -28 Q -10 -46 -16 -50 M2 -28 Q 10 -46 16 -50" stroke="#1e293b" strokeWidth={2} fill="none" />
    </g>
  );
}

function Metamorphosis({ lang }: { lang: BioLang }) {
  const [jhValue, setJhValue] = useState(80);
  const [stage, setStage] = useState<Stage>({ kind: "larva", instar: 1 });
  const [history, setHistory] = useState<Stage[]>([{ kind: "larva", instar: 1 }]);
  const [message, setMessage] = useState<Txt | null>(null);
  const [small, setSmall] = useState(false);
  const [flash, setFlash] = useState(false);
  const jh = jhLevel(jhValue);

  const pulse = () => {
    const { next, text } = molt(stage, jh);
    if (stage.kind === "larva" && next.kind === "pupa" && stage.instar < 4) setSmall(true);
    setMessage(text);
    if (next !== stage) {
      setStage(next);
      setHistory([...history, next]);
    }
    setFlash(true);
    window.setTimeout(() => setFlash(false), 700);
  };
  const reset = () => {
    setStage({ kind: "larva", instar: 1 });
    setHistory([{ kind: "larva", instar: 1 }]);
    setMessage(null);
    setSmall(false);
    setJhValue(80);
  };
  const icon = (s: Stage) => (s.kind === "larva" ? `🐛${s.instar}` : s.kind === "pupa" ? "🟤" : "🦋");

  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 260 150" className="w-full rounded-xl bg-lime-50 ring-1 ring-lime-200" role="img" aria-label={stageName(stage, lang)}>
          <path d="M0 132 Q 130 120 260 132 L 260 150 L 0 150 Z" fill="#bbf7d0" />
          <InsectArt stage={stage} small={small} />
          <text x={130} y={146} textAnchor="middle" fontSize={11} fontWeight={600} fill="#1e293b">
            {stageName(stage, lang)}
          </text>
        </svg>
        <label className="mt-3 block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Hormon juwenilny (ciałka przyległe)" : "Ювенильный гормон (прилежащие тела)"}: <span className="text-indigo-700">{JH_NAME[jh][lang]}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={jhValue}
            onChange={(e) => setJhValue(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer accent-indigo-600"
            aria-valuetext={JH_NAME[jh][lang]}
          />
          <span className="mt-1 flex justify-between text-xs font-normal text-slate-500">
            <span>{JH_NAME.none[lang]}</span>
            <span>{JH_NAME.low[lang]}</span>
            <span>{JH_NAME.high[lang]}</span>
          </span>
        </label>
        <div className="mt-3 flex items-center gap-3">
          <Choice state="active" onClick={pulse}>
            ⚡ {lang === "pl" ? "Wyrzut ekdyzonu" : "Выброс экдизона"}
          </Choice>
          <span className="h-3 w-24 overflow-hidden rounded-full bg-slate-200" aria-hidden>
            <span className="block h-full bg-amber-500 transition-all duration-300" style={{ width: flash ? "100%" : "0%" }} />
          </span>
          <Choice onClick={reset}>↺ {KIT.again[lang]}</Choice>
        </div>
      </div>
      <div className="space-y-3">
        <ol className="flex flex-wrap items-center gap-1 text-sm" aria-label={lang === "pl" ? "przebieg rozwoju" : "ход развития"}>
          {history.map((s, k) => (
            <li key={k} className="flex items-center gap-1">
              {k > 0 && <span className="text-slate-400">→</span>}
              <span className="rounded-md bg-white px-1.5 py-0.5 ring-1 ring-slate-200">{icon(s)}</span>
            </li>
          ))}
        </ol>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          {message
            ? message[lang]
            : lang === "pl"
              ? "Bez ekdyzonu nie ma linienia — larwa tylko żeruje i rośnie, aż pancerz stanie się za ciasny. Naciśnij „Wyrzut ekdyzonu”."
              : "Без экдизона линьки нет — личинка только питается и растёт, пока покров не станет тесным. Нажми «Выброс экдизона»."}
        </p>
        <p className="rounded-xl bg-indigo-50 px-4 py-3 text-sm leading-relaxed text-indigo-950 ring-1 ring-indigo-200">
          {lang === "pl"
            ? "Komórki neurosekrecyjne mózgu wydzielają hormon pobudzający gruczoły przedpiersiowe → te wydzielają ekdyzon (hormon linienia). Ciałka przyległe wydzielają hormon juwenilny, który decyduje, czym zakończy się linienie."
            : "Нейросекреторные клетки мозга выделяют гормон, стимулирующий проторакальные железы → те выделяют экдизон (гормон линьки). Прилежащие тела выделяют ювенильный гормон, который решает, чем закончится линька."}
        </p>
      </div>
    </div>
  );
}

// ---------- tadpole and thyroxine ----------

type Setup = "control" | "thyroxine" | "noThyroid";

const SETUPS: Record<Setup, { name: Txt; progress: (w: number) => number; size: (w: number) => number; text: Txt }> = {
  control: {
    name: r("zwykła woda", "обычная вода"),
    progress: (w) => Math.min(1, Math.max(0, (w - 6) / 5)),
    size: (w) => 0.55 + 0.45 * Math.min(1, w / 8),
    text: r(
      "Kijanka rośnie, a gdy jej tarczyca zacznie wydzielać więcej tyroksyny, przechodzi przeobrażenie: wyrastają kończyny, zanikają skrzela i ogon.",
      "Головастик растёт, а когда его щитовидная железа начинает выделять больше тироксина, происходит превращение: вырастают конечности, исчезают жабры и хвост.",
    ),
  },
  thyroxine: {
    name: r("woda z tyroksyną", "вода с тироксином"),
    progress: (w) => Math.min(1, Math.max(0, (w - 1) / 3)),
    size: (w) => 0.55 + 0.1 * Math.min(1, w / 3),
    text: r(
      "Dodatek tyroksyny przyspiesza przeobrażenie — kijanka zmienia się w żabę, zanim zdąży urosnąć. Powstaje miniaturowa żabka.",
      "Добавка тироксина ускоряет превращение — головастик превращается в лягушку, не успев вырасти. Получается миниатюрный лягушонок.",
    ),
  },
  noThyroid: {
    name: r("usunięta tarczyca", "удалена щитовидная железа"),
    progress: () => 0,
    size: (w) => 0.55 + 0.75 * (w / 12),
    text: r(
      "Bez tarczycy nie ma tyroksyny i przeobrażenie nie następuje. Kijanka rośnie dalej — powstaje olbrzymia kijanka.",
      "Без щитовидной железы нет тироксина, и превращение не наступает. Головастик продолжает расти — получается гигантский головастик.",
    ),
  },
};

function Frog({ p, size }: { p: number; size: number }) {
  const tail = 62 * (1 - p);
  const hind = p < 0.15 ? 0 : Math.min(1, (p - 0.15) / 0.45);
  const fore = p < 0.6 ? 0 : Math.min(1, (p - 0.6) / 0.3);
  const body = { rx: 22 + 4 * p, ry: 16 + 2 * p };
  return (
    <g transform={`translate(${130 - 14 * (1 - p) * size} 78) scale(${size})`}>
      {tail > 1 && <path d={`M${-body.rx + 6} 0 Q ${-body.rx - tail * 0.5} ${-10} ${-body.rx - tail} 0 Q ${-body.rx - tail * 0.5} 10 ${-body.rx + 6} 0 Z`} fill="#4d7c0f" opacity={0.9} />}
      {hind > 0 && (
        <g stroke="#3f6212" strokeWidth={5} strokeLinecap="round" fill="none">
          <path d={`M-10 10 l ${-14 * hind} ${10 * hind} l ${14 * hind} ${6 * hind}`} />
          <path d={`M-4 12 l ${-10 * hind} ${12 * hind} l ${14 * hind} ${4 * hind}`} />
        </g>
      )}
      {fore > 0 && (
        <g stroke="#3f6212" strokeWidth={4} strokeLinecap="round" fill="none">
          <path d={`M12 10 l ${6 * fore} ${12 * fore}`} />
          <path d={`M16 8 l ${10 * fore} ${10 * fore}`} />
        </g>
      )}
      <ellipse cx={0} cy={0} rx={body.rx} ry={body.ry} fill={p > 0.6 ? "#65a30d" : "#57534e"} />
      {p < 0.5 && <path d={`M${body.rx - 16} 4 q 4 4 8 0`} stroke="#a8a29e" strokeWidth={1.5} fill="none" opacity={1 - p * 2} />}
      <circle cx={body.rx - 8} cy={-body.ry + 4 - 4 * p} r={3 + 3 * p} fill="#fef08a" stroke="#1e293b" strokeWidth={1} />
      <circle cx={body.rx - 7} cy={-body.ry + 4 - 4 * p} r={1.6 + p} fill="#1e293b" />
      {p > 0.7 && <path d={`M${body.rx - 2} 4 q -8 6 -16 2`} stroke="#1e293b" strokeWidth={1.5} fill="none" />}
    </g>
  );
}

function Tadpoles({ lang }: { lang: BioLang }) {
  const [setup, setSetup] = useState<Setup>("control");
  const [week, setWeek] = useState(0);
  const s = SETUPS[setup];
  const p = s.progress(week);
  const size = s.size(week);
  const state =
    p === 0
      ? r("kijanka: ogon, skrzela, brak kończyn", "головастик: хвост, жабры, конечностей нет")
      : p < 1
        ? r("przeobrażenie w toku: rosną kończyny, zanika ogon", "идёт превращение: растут конечности, исчезает хвост")
        : r("młoda żaba: płuca, cztery kończyny, brak ogona", "молодая лягушка: лёгкие, четыре конечности, хвоста нет");
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(SETUPS) as Setup[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={setup === k}
            onClick={() => setSetup(k)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              setup === k ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {SETUPS[k].name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 260 150" className="w-full rounded-xl ring-1 ring-sky-200" role="img" aria-label={state[lang]}>
            <rect width={260} height={150} fill="#e0f2fe" />
            <path d="M0 130 Q 130 120 260 130 L 260 150 L 0 150 Z" fill="#d6d3d1" />
            <Frog p={p} size={size} />
          </svg>
          <label className="mt-3 block text-sm font-semibold text-slate-700">
            {lang === "pl" ? "Czas" : "Время"}: <span className="tabular-nums">{week}</span> {lang === "pl" ? "tyg." : "нед."}
            <input type="range" min={0} max={12} value={week} onChange={(e) => setWeek(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-sky-600" />
          </label>
        </div>
        <div className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200" aria-live="polite">
          <p className="font-semibold text-slate-900">{state[lang]}</p>
          <p>{s.text[lang]}</p>
        </div>
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Hormony działają wewnątrz organizmu, feromony — na inne osobniki tego samego gatunku.", "Гормоны действуют внутри организма, феромоны — на других особей того же вида."),
    r(
      "Komórki neurosekrecyjne to neurony wydzielające hormony — u bezkręgowców i w podwzgórzu kręgowców.",
      "Нейросекреторные клетки — нейроны, выделяющие гормоны, — есть у беспозвоночных и в гипоталамусе позвоночных.",
    ),
  ],
  s2: [r("Feromony mogą być płciowe, śladowe, alarmowe lub znakować terytorium.", "Феромоны бывают половыми, следовыми, феромонами тревоги или метками территории.")],
  s3: [
    r(
      "Ekdyzon (z gruczołów przedpiersiowych) wywołuje linienie; hormon juwenilny (z ciałek przyległych) decyduje, czy powstanie larwa, poczwarka czy owad dorosły.",
      "Экдизон (из проторакальных желёз) вызывает линьку; ювенильный гормон (из прилежащих тел) решает, получится личинка, куколка или взрослое насекомое.",
    ),
    r(
      "Ekdyzon + dużo hormonu juwenilnego → larwa; ekdyzon + mało → poczwarka; ekdyzon bez hormonu juwenilnego → owad dorosły.",
      "Экдизон + много ювенильного гормона → личинка; экдизон + мало → куколка; экдизон без ювенильного гормона → взрослое насекомое.",
    ),
  ],
  s4: [
    r(
      "Tyroksyna (hormon tarczycy) wywołuje przeobrażenie kijanki: zanik ogona i skrzeli, rozwój kończyn i płuc.",
      "Тироксин (гормон щитовидной железы) вызывает превращение головастика: исчезают хвост и жабры, развиваются конечности и лёгкие.",
    ),
    r(
      "Aksolotl zwykle się nie przeobraża i rozmnaża się jako larwa (neotenia); podanie tyroksyny wywołuje u niego przeobrażenie.",
      "Аксолотль обычно не превращается и размножается в личиночной форме (неотения); введение тироксина вызывает у него превращение.",
    ),
  ],
};

export default function HormonesAnimalsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="hora" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="hora-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <TwoWaySort lang={lang} title={T.s1} groups={[r("hormon", "гормон"), r("feromon", "феромон")]} items={SORT_ITEMS} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="hora-s2" n={2} title={T.s2[lang]}>
        <SpeciesGallery lang={lang} items={PHEROMONES} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="hora-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Metamorphosis lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="hora-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Tadpoles lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
