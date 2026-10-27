// Lesson for LO3 §2.2 "Budowa i funkcje skóry" (zakres rozszerzony). Parts follow
// templates/data/organism.ts (SKIN_PARTS).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { MatchQuiz, PartMap, type MapPart, type QuizItem, type QuizOption } from "@portal/lessons";
import { Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Skóra to największy narząd człowieka — u dorosłego ma powierzchnię ok. 2 m². Składa się z naskórka i skóry właściwej, pod którymi leży tkanka podskórna. Chroni, odbiera bodźce, uczestniczy w termoregulacji i wydalaniu, a pod wpływem słońca wytwarza witaminę D.",
    "Кожа — самый большой орган человека: у взрослого её площадь около 2 м². Она состоит из эпидермиса и дермы, под которыми лежит подкожная клетчатка. Кожа защищает, воспринимает раздражители, участвует в терморегуляции и выделении, а под действием солнца образует витамин D.",
  ),
  s1: r("Przekrój skóry", "Разрез кожи"),
  s1intro: r(
    "Dotknij warstwy lub struktury, żeby poznać jej budowę i rolę. W trybie „Podpisz sam” sprawdź, czy rozpoznajesz wszystkie elementy.",
    "Нажми на слой или структуру, чтобы узнать её строение и роль. В режиме «Подпиши сам» проверь, узнаёшь ли ты все элементы.",
  ),
  s2: r("Skóra w termoregulacji", "Кожа в терморегуляции"),
  s2intro: r("Przełącz warunki i zobacz, jak zmieniają się naczynia, gruczoły potowe i włosy.", "Переключай условия и смотри, как меняются сосуды, потовые железы и волосы."),
  s3: r("Receptory skóry", "Рецепторы кожи"),
  s3intro: r(
    "W skórze leżą różne receptory — każdy wyspecjalizowany w innym bodźcu. Najwięcej jest ich w opuszkach palców, na wargach i języku.",
    "В коже находятся разные рецепторы — каждый специализирован на своём раздражителе. Больше всего их на кончиках пальцев, губах и языке.",
  ),
  s4: r("Funkcje skóry", "Функции кожи"),
  s4intro: r("Dotknij karty, żeby zobaczyć, która część skóry odpowiada za daną funkcję.", "Нажми на карточку, чтобы увидеть, какая часть кожи отвечает за эту функцию."),
} satisfies Record<string, Txt>;

// ---------- skin cross-section ----------

type SPart = "horny" | "basal" | "dermis" | "hypodermis" | "hair" | "sebaceous" | "arrector" | "sweat" | "vessels" | "receptors";

const PARTS: Record<SPart, MapPart> = {
  horny: {
    name: r("Warstwa rogowa", "Роговой слой"),
    text: r(
      "Zewnętrzna warstwa naskórka z martwych, spłaszczonych komórek wypełnionych keratyną. Stale się złuszcza; chroni przed urazami, drobnoustrojami i utratą wody.",
      "Наружный слой эпидермиса из мёртвых уплощённых клеток, заполненных кератином. Постоянно слущивается; защищает от травм, микробов и потери воды.",
    ),
    pin: [330, 12],
    to: [300, 27],
  },
  basal: {
    name: r("Warstwa rozrodcza naskórka", "Ростковый слой эпидермиса"),
    text: r(
      "Najgłębsza warstwa naskórka. Jej komórki stale się dzielą i przesuwają ku powierzchni, rogowaciejąc po drodze. Leżą tu melanocyty, które wytwarzają melaninę chroniącą przed promieniowaniem UV.",
      "Самый глубокий слой эпидермиса. Его клетки постоянно делятся и продвигаются к поверхности, ороговевая по пути. Здесь лежат меланоциты, вырабатывающие меланин, который защищает от УФ-излучения.",
    ),
    pin: [22, 100],
    to: [60, 63],
  },
  dermis: {
    name: r("Skóra właściwa", "Дерма"),
    text: r(
      "Tkanka łączna z włóknami kolagenowymi i sprężystymi — nadaje skórze wytrzymałość i elastyczność. Są w niej naczynia krwionośne, nerwy, receptory, gruczoły i mieszki włosowe.",
      "Соединительная ткань с коллагеновыми и эластическими волокнами — придаёт коже прочность и упругость. В ней находятся кровеносные сосуды, нервы, рецепторы, железы и волосяные фолликулы.",
    ),
    pin: [22, 156],
    to: [64, 140],
  },
  hypodermis: {
    name: r("Tkanka podskórna", "Подкожная клетчатка"),
    text: r("Warstwa tkanki tłuszczowej: izoluje cieplnie, amortyzuje urazy i magazynuje energię.", "Слой жировой ткани: теплоизолирует, смягчает удары и запасает энергию."),
    pin: [180, 286],
    to: [150, 262],
  },
  hair: {
    name: r("Włos z mieszkiem włosowym", "Волос и волосяной фолликул"),
    text: r(
      "Włos to rogowy wytwór naskórka. Rośnie z cebulki włosa na dnie mieszka włosowego, który sięga w głąb skóry właściwej.",
      "Волос — роговое производное эпидермиса. Он растёт из волосяной луковицы на дне волосяного фолликула, уходящего вглубь дермы.",
    ),
    pin: [44, 14],
    to: [104, 8],
  },
  sebaceous: {
    name: r("Gruczoł łojowy", "Сальная железа"),
    text: r(
      "Uchodzi do mieszka włosowego. Wydziela łój, który natłuszcza skórę i włosy, chroni je przed wysychaniem, a dzięki kwaśnemu odczynowi — przed drobnoustrojami.",
      "Открывается в волосяной фолликул. Выделяет кожное сало, которое смазывает кожу и волосы, защищает их от высыхания, а благодаря кислой реакции — от микробов.",
    ),
    pin: [194, 104],
    to: [146, 96],
  },
  arrector: {
    name: r("Mięsień przywłosowy", "Мышца, поднимающая волос"),
    text: r(
      "Pęczek mięśni gładkich przyczepiony do mieszka włosowego. Gdy jest zimno albo czujemy strach, kurczy się i stawia włos — powstaje „gęsia skórka”.",
      "Пучок гладких мышц, прикреплённый к волосяному фолликулу. На холоде или при испуге сокращается и поднимает волос — появляется «гусиная кожа».",
    ),
    pin: [214, 150],
    to: [170, 120],
  },
  sweat: {
    name: r("Gruczoł potowy", "Потовая железа"),
    text: r(
      "Kłębek leżący głęboko w skórze; przewodem wydziela pot na powierzchnię. Pot to głównie woda z solami i niewielką ilością mocznika — jego parowanie chłodzi ciało.",
      "Клубочек, лежащий глубоко в коже; по протоку выделяет пот на поверхность. Пот — в основном вода с солями и небольшим количеством мочевины; его испарение охлаждает тело.",
    ),
    pin: [338, 262],
    to: [284, 226],
  },
  vessels: {
    name: r("Naczynia krwionośne", "Кровеносные сосуды"),
    text: r(
      "Odżywiają skórę — naskórek nie ma własnych naczyń i zaopatruje go skóra właściwa. Rozszerzają się, gdy jest gorąco, i zwężają, gdy jest zimno.",
      "Питают кожу — в эпидермисе своих сосудов нет, его снабжает дерма. Расширяются в жару и сужаются в холод.",
    ),
    pin: [338, 160],
    to: [306, 186],
  },
  receptors: {
    name: r("Receptory skóry", "Рецепторы кожи"),
    text: r(
      "Ciałka dotykowe tuż pod naskórkiem odbierają dotyk, ciałka blaszkowate w głębi — ucisk i wibracje, a wolne zakończenia nerwowe — m.in. ból i temperaturę.",
      "Осязательные тельца прямо под эпидермисом воспринимают прикосновение, пластинчатые тельца в глубине — давление и вибрацию, а свободные нервные окончания — в том числе боль и температуру.",
    ),
    pin: [22, 222],
    to: [52, 248],
  },
};

/** the wavy border between epidermis and dermis: papillae poke up every 60 units */
function papillae(top: number, bottom: number) {
  let d = `M0 ${bottom}`;
  for (let k = 0; k < 6; k++) {
    const x = k * 60;
    d += ` C ${x + 15} ${bottom}, ${x + 18} ${top}, ${x + 30} ${top} C ${x + 42} ${top}, ${x + 45} ${bottom}, ${x + 60} ${bottom}`;
  }
  return d;
}

const BORDER = papillae(50, 66);

function SkinMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<SPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 360 300"
      title={r("Przekrój skóry", "Разрез кожи")}
      labelOrder={["horny", "basal", "dermis", "hypodermis", "hair", "sebaceous", "arrector", "sweat", "vessels", "receptors"]}
      pinRadius={12}
      maxWidth="max-w-[460px]"
      art={({ part, tone }) => (
        <>
          <rect width={360} height={20} fill="#f0f9ff" />
          <rect y={34} width={360} height={34} fill="#fde68a" />
          {part(
            "hypodermis",
            <g>
              <rect y={198} width={360} height={102} fill={tone("hypodermis", "#fef9c3")} />
              {Array.from({ length: 21 }, (_, k) => (
                <circle key={k} cx={k < 11 ? 14 + k * 33 : 30 + (k - 11) * 33} cy={k < 11 ? 226 : 272} r={14} fill="none" stroke="#ca8a04" strokeWidth={1.2} />
              ))}
            </g>,
          )}
          {part(
            "dermis",
            <g>
              <path d={`${BORDER} L 360 198 L 0 198 Z`} fill={tone("dermis", "#fecdd3")} />
              {[100, 130, 160].map((y) => (
                <path key={y} d={`M0 ${y} C 60 ${y - 8}, 120 ${y + 8}, 180 ${y} S 300 ${y - 8}, 360 ${y}`} stroke="#fda4af" strokeWidth={1.5} fill="none" />
              ))}
            </g>,
          )}
          {part(
            "basal",
            <g>
              <path d={BORDER} stroke={tone("basal", "#a16207")} strokeWidth={6} fill="none" />
              {[48, 168, 288].map((x) => (
                <circle key={x} cx={x + 8} cy={58} r={3} fill="#451a03" />
              ))}
            </g>,
          )}
          {part(
            "horny",
            <g>
              <rect y={20} width={360} height={14} fill={tone("horny", "#e7e5e4")} />
              {[24, 28, 32].map((y) => (
                <path key={y} d={`M0 ${y} L 360 ${y}`} stroke="#a8a29e" strokeWidth={0.8} />
              ))}
            </g>,
          )}
          {part(
            "vessels",
            <g fill="none" strokeLinecap="round">
              <path d="M0 184 L 360 184" stroke={tone("vessels", "#dc2626")} strokeWidth={6} />
              <path d="M0 194 L 360 194" stroke={tone("vessels", "#2563eb")} strokeWidth={6} />
              {[30, 210, 330].map((x) => (
                <path key={x} d={`M${x - 6} 184 L ${x - 4} 64 Q ${x} 54 ${x + 4} 64 L ${x + 6} 194`} stroke={tone("vessels", "#e11d48")} strokeWidth={2.5} />
              ))}
            </g>,
          )}
          {part(
            "hair",
            <g>
              <rect x={104} y={30} width={20} height={150} rx={10} fill={tone("hair", "#fef3c7")} stroke="#a16207" strokeWidth={1.5} />
              <ellipse cx={114} cy={178} rx={13} ry={10} fill="#92400e" />
              <path d="M114 176 L 114 22 L 100 0" stroke="#44403c" strokeWidth={4} fill="none" strokeLinecap="round" />
            </g>,
          )}
          {part(
            "sebaceous",
            <g fill={tone("sebaceous", "#fcd34d")} stroke="#a16207" strokeWidth={1.2}>
              <path d="M124 90 L 132 92" />
              <ellipse cx={140} cy={88} rx={11} ry={8} />
              <ellipse cx={142} cy={103} rx={10} ry={7} />
            </g>,
          )}
          {part("arrector", <path d="M124 150 C 150 140, 176 100, 188 62" stroke={tone("arrector", "#e11d48")} strokeWidth={7} fill="none" strokeLinecap="round" />)}
          {part(
            "sweat",
            <g fill="none" stroke={tone("sweat", "#0284c7")} strokeWidth={3.5} strokeLinecap="round">
              <path d="M262 20 C 256 30, 268 38, 262 48 C 256 58, 268 66, 264 80 L 270 214" />
              <path d="M270 214 c 14 -6 24 4 14 12 c -10 8 -26 0 -18 -10 c 6 -8 26 -4 22 8 c -4 10 -22 10 -24 0" />
            </g>,
          )}
          {part(
            "receptors",
            <g>
              <path d="M52 256 L 52 290 M210 64 L 216 196 M300 40 L 304 196" stroke="#eab308" strokeWidth={2} fill="none" />
              <path d="M300 40 l -6 -8 M300 40 l 6 -8 M300 40 l 0 -10" stroke="#eab308" strokeWidth={1.5} />
              <ellipse cx={210} cy={60} rx={4.5} ry={7} fill={tone("receptors", "#fde047")} stroke="#a16207" />
              {[15, 11, 7].map((rr) => (
                <ellipse key={rr} cx={52} cy={248} rx={rr * 0.7} ry={rr} fill={rr === 15 ? tone("receptors", "#fef08a") : "none"} stroke="#a16207" strokeWidth={1.2} />
              ))}
            </g>,
          )}
        </>
      )}
    />
  );
}

// ---------- thermoregulation in the skin ----------

type Weather = "cold" | "ok" | "hot";

const WEATHER: { id: Weather; name: Txt }[] = [
  { id: "cold", name: r("❄️ Zimno", "❄️ Холодно") },
  { id: "ok", name: r("🙂 Komfort", "🙂 Комфорт") },
  { id: "hot", name: r("☀️ Gorąco", "☀️ Жарко") },
];

const TH = {
  vessels: r("Naczynia skóry", "Сосуды кожи"),
  sweat: r("Gruczoły potowe", "Потовые железы"),
  hair: r("Mięśnie przywłosowe", "Мышцы, поднимающие волосы"),
  heat: r("Oddawanie ciepła", "Теплоотдача"),
  rows: {
    cold: [
      r("zwężone — mniej ciepłej krwi płynie przy powierzchni, skóra blednie", "сужены — у поверхности течёт меньше тёплой крови, кожа бледнеет"),
      r("nie wydzielają potu", "не выделяют пот"),
      r("kurczą się — włosy stają, „gęsia skórka”", "сокращаются — волосы встают, «гусиная кожа»"),
      r("zmniejszone", "уменьшена"),
    ],
    ok: [r("średnio szerokie", "средней ширины"), r("wydzielają niewiele potu", "выделяют немного пота"), r("rozluźnione", "расслаблены"), r("umiarkowane", "умеренная")],
    hot: [
      r("rozszerzone — dużo krwi oddaje ciepło przez skórę, skóra się czerwieni", "расширены — много крови отдаёт тепло через кожу, кожа краснеет"),
      r("wydzielają dużo potu — parowanie odbiera ciepło", "выделяют много пота — испарение отнимает тепло"),
      r("rozluźnione — włosy leżą", "расслаблены — волосы лежат"),
      r("zwiększone", "увеличена"),
    ],
  } satisfies Record<Weather, Txt[]>,
  note: r(
    "U człowieka „gęsia skórka” prawie nie ogrzewa — to pozostałość po przodkach z gęstym owłosieniem, u których postawiona sierść zatrzymywała warstwę ciepłego powietrza.",
    "У человека «гусиная кожа» почти не согревает — это наследие предков с густой шерстью, у которых поднятая шерсть удерживала слой тёплого воздуха.",
  ),
};

function SkinThermo({ lang }: { lang: BioLang }) {
  const [w, setW] = useState<Weather>("ok");
  const vessel = w === "hot" ? 7 : w === "cold" ? 2 : 4;
  const skinTop = w === "hot" ? "#fecaca" : w === "cold" ? "#e0e7ff" : "#fde68a";
  const hairAngle = w === "cold" ? 0 : -55;
  const heatArrows = w === "hot" ? 4 : w === "ok" ? 2 : 0;
  const rows = TH.rows[w];
  const labels = [TH.vessels, TH.sweat, TH.hair, TH.heat];
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label={lang === "pl" ? "Warunki" : "Условия"}>
        {WEATHER.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={w === o.id}
            onClick={() => setW(o.id)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              w === o.id ? "bg-indigo-600 text-white ring-indigo-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {o.name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 280 200" className="w-full" role="img" aria-label={WEATHER.find((o) => o.id === w)!.name[lang]}>
          <defs>
            <marker id="skin-heat" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L 10 5 L 0 10 Z" fill="#ef4444" />
            </marker>
          </defs>
          <rect width={280} height={60} fill={w === "hot" ? "#fff7ed" : w === "cold" ? "#eff6ff" : "#f8fafc"} />
          <rect y={60} width={280} height={24} fill={skinTop} style={{ transition: "fill .3s" }} />
          <rect y={84} width={280} height={116} fill="#fecdd3" />
          {/* vessel loop under the epidermis */}
          <path d="M20 170 L 20 96 Q 20 88 30 88 L 250 88 Q 260 88 260 96 L 260 170" stroke="#dc2626" strokeWidth={vessel} fill="none" style={{ transition: "stroke-width .4s" }} />
          {/* hair: lying flat or raised by the arrector muscle */}
          <rect x={70} y={74} width={16} height={100} rx={8} fill="#fef3c7" stroke="#a16207" />
          <g style={{ transform: `rotate(${hairAngle}deg)`, transformOrigin: "78px 62px", transition: "transform .5s" }}>
            <path d="M78 62 L 78 14" stroke="#44403c" strokeWidth={4} strokeLinecap="round" />
          </g>
          <path d="M86 150 C 100 130, 110 100, 116 84" stroke="#e11d48" strokeWidth={w === "cold" ? 8 : 5} fill="none" strokeLinecap="round" style={{ transition: "stroke-width .4s" }} />
          {w === "cold" && <path d="M66 60 Q 78 48 90 60" fill="#e0e7ff" stroke="#6366f1" strokeWidth={1.5} />}
          {/* sweat gland and drops */}
          <path d="M200 60 L 204 160 c 12 -4 20 6 10 12 c -10 6 -22 -2 -14 -10" stroke="#0284c7" strokeWidth={3} fill="none" />
          {w !== "cold" &&
            (w === "hot" ? [190, 204, 218] : [204]).map((x, k) => (
              <path key={x} d={`M${x} ${52 - k * 6} q 5 8 0 11 q -5 -3 0 -11 Z`} fill="#38bdf8" stroke="#0369a1" strokeWidth={0.8} />
            ))}
          {Array.from({ length: heatArrows }, (_, k) => (
            <path key={k} d={`M${130 + k * 34} 58 q -6 -10 0 -18 q 6 -8 0 -18`} stroke="#ef4444" strokeWidth={2} fill="none" markerEnd="url(#skin-heat)" />
          ))}
        </svg>
        <div aria-live="polite">
          <table className="w-full text-sm">
            <tbody>
              {labels.map((label, k) => (
                <tr key={label.pl} className="border-b border-slate-200 last:border-0">
                  <th scope="row" className="w-36 py-2 pr-3 text-left align-top font-medium text-slate-500">
                    {label[lang]}
                  </th>
                  <td className="py-2 text-slate-800">{rows[k]![lang]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {w === "cold" && <p className="mt-3 text-sm text-slate-600">{TH.note[lang]}</p>}
        </div>
      </div>
    </div>
  );
}

// ---------- receptors ----------

const RECEPTORS: QuizOption[] = [
  { id: "touch", label: r("ciałka dotykowe (Meissnera)", "осязательные тельца (Мейсснера)") },
  { id: "pressure", label: r("ciałka blaszkowate (Paciniego)", "пластинчатые тельца (Пачини)") },
  { id: "thermo", label: r("termoreceptory", "терморецепторы") },
  { id: "pain", label: r("receptory bólu (nocyceptory)", "болевые рецепторы (ноцицепторы)") },
];

const STIMULI: QuizItem[] = [
  { icon: "🪶", name: r("lekkie muśnięcie piórkiem", "лёгкое касание пёрышком"), answer: "touch", explain: r("Ciałka dotykowe leżą płytko, w brodawkach skóry właściwej tuż pod naskórkiem.", "Осязательные тельца лежат неглубоко, в сосочках дермы прямо под эпидермисом.") },
  { icon: "📳", name: r("wibracje telefonu w kieszeni", "вибрация телефона в кармане"), answer: "pressure", explain: r("Ciałka blaszkowate mają budowę cebulowatą i reagują na ucisk i drgania.", "Пластинчатые тельца имеют луковичное строение и реагируют на давление и вибрацию.") },
  { icon: "🧊", name: r("chłód kostki lodu na dłoni", "холод кубика льда на ладони"), answer: "thermo", explain: r("Termoreceptory zimna i ciepła informują o temperaturze otoczenia — także ośrodek termoregulacji.", "Терморецепторы холода и тепла сообщают о температуре среды — в том числе центру терморегуляции.") },
  { icon: "💉", name: r("ukłucie igłą", "укол иглой"), answer: "pain", explain: r("Nocyceptory to wolne zakończenia nerwowe; ból ostrzega przed uszkodzeniem tkanek.", "Ноцицепторы — свободные нервные окончания; боль предупреждает о повреждении тканей.") },
  { icon: "🖐️", name: r("silny nacisk dłonią na ramię", "сильное надавливание ладонью на плечо"), answer: "pressure", explain: r("Ucisk odbierają ciałka blaszkowate leżące głęboko w skórze i tkance podskórnej.", "Давление воспринимают пластинчатые тельца, лежащие глубоко в коже и подкожной клетчатке.") },
  { icon: "🛁", name: r("ciepła woda w wannie", "тёплая вода в ванне"), answer: "thermo", explain: r("To bodziec dla termoreceptorów ciepła.", "Это раздражитель для терморецепторов тепла.") },
  { icon: "⠿", name: r("czytanie pisma Braille'a opuszkami palców", "чтение шрифта Брайля подушечками пальцев"), answer: "touch", explain: r("Opuszki palców mają bardzo gęsto rozmieszczone ciałka dotykowe — dlatego tak dokładnie rozróżniają kształty.", "В подушечках пальцев очень густо расположены осязательные тельца — поэтому они так точно различают формы.") },
  { icon: "🔥", name: r("oparzenie palca o gorący garnek", "ожог пальца о горячую кастрюлю"), answer: "pain", explain: r("Bodziec uszkadzający tkanki pobudza nocyceptory i wywołuje odruch cofnięcia ręki.", "Повреждающий раздражитель возбуждает ноцицепторы и вызывает рефлекс отдёргивания руки.") },
];

// ---------- functions ----------

interface SkinFunction {
  icon: string;
  name: Txt;
  text: Txt;
  /** the part of the skin that does the job */
  tag: Txt;
}

const FUNCTIONS: SkinFunction[] = [
  {
    icon: "🛡️",
    name: r("Ochronna", "Защитная"),
    text: r(
      "Warstwa rogowa i kwaśny łój chronią przed urazami, drobnoustrojami i utratą wody, a melanina — przed promieniowaniem UV.",
      "Роговой слой и кислое кожное сало защищают от травм, микробов и потери воды, а меланин — от УФ-излучения.",
    ),
    tag: r("naskórek", "эпидермис"),
  },
  {
    icon: "🌡️",
    name: r("Termoregulacyjna", "Терморегуляционная"),
    text: r("Rozszerzanie i zwężanie naczyń oraz wydzielanie potu regulują oddawanie ciepła; tkanka podskórna izoluje.", "Расширение и сужение сосудов, а также потоотделение регулируют теплоотдачу; подкожная клетчатка теплоизолирует."),
    tag: r("skóra właściwa", "дерма"),
  },
  {
    icon: "💦",
    name: r("Wydalnicza", "Выделительная"),
    text: r("Z potem organizm usuwa wodę, sole mineralne i niewielkie ilości mocznika.", "С потом организм выводит воду, минеральные соли и небольшое количество мочевины."),
    tag: r("gruczoły potowe", "потовые железы"),
  },
  {
    icon: "✋",
    name: r("Zmysłowa", "Чувствительная"),
    text: r("Receptory skóry odbierają dotyk, ucisk, temperaturę i ból.", "Рецепторы кожи воспринимают прикосновение, давление, температуру и боль."),
    tag: r("receptory", "рецепторы"),
  },
  {
    icon: "☀️",
    name: r("Wytwarzanie witaminy D", "Образование витамина D"),
    text: r(
      "Pod wpływem promieniowania UV w skórze powstaje witamina D, potrzebna do wchłaniania wapnia w jelicie i budowy kości.",
      "Под действием УФ-излучения в коже образуется витамин D, необходимый для всасывания кальция в кишечнике и построения костей.",
    ),
    tag: r("naskórek", "эпидермис"),
  },
  {
    icon: "🔋",
    name: r("Magazynująca", "Запасающая"),
    text: r("Tłuszcz tkanki podskórnej to zapas energii.", "Жир подкожной клетчатки — запас энергии."),
    tag: r("tkanka podskórna", "подкожная клетчатка"),
  },
];

function FunctionCards({ lang }: { lang: BioLang }) {
  const [open, setOpen] = useState<number | null>(null);
  const item = open === null ? null : FUNCTIONS[open];
  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FUNCTIONS.map((f, i) => (
          <li key={f.name.pl}>
            <button
              type="button"
              aria-pressed={open === i}
              onClick={() => setOpen(open === i ? null : i)}
              className={`flex h-full w-full flex-col items-center gap-1 rounded-xl p-3 text-center ring-1 transition-colors ${
                open === i ? "bg-emerald-50 ring-emerald-400" : "bg-white ring-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {f.icon}
              </span>
              <span className="text-sm leading-tight font-medium text-slate-800">{f.name[lang]}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3" aria-live="polite">
        {item ? (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
            <p className="text-[15px] leading-relaxed text-emerald-950">
              <span className="font-semibold">
                {item.icon} {item.name[lang]}.
              </span>{" "}
              {item.text[lang]}
            </p>
            <p className="mt-2 text-sm text-emerald-800">
              {lang === "pl" ? "Odpowiada za nią" : "За неё отвечает"}: <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">{item.tag[lang]}</span>
            </p>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">👆 {lang === "pl" ? "Dotknij karty, żeby poznać funkcję skóry." : "Нажми на карточку, чтобы узнать о функции кожи."}</p>
        )}
      </div>
    </div>
  );
}

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    r("Skóra = naskórek (nabłonek wielowarstwowy płaski) + skóra właściwa (tkanka łączna); pod nią leży tkanka podskórna.", "Кожа = эпидермис (многослойный плоский эпителий) + дерма (соединительная ткань); под ней лежит подкожная клетчатка."),
    r("Naskórek nie ma naczyń krwionośnych; odnawia go warstwa rozrodcza.", "В эпидермисе нет кровеносных сосудов; его обновляет ростковый слой."),
  ],
  s2: [r("Gorąco: naczynia skóry się rozszerzają i wydziela się pot. Zimno: naczynia się zwężają, a mięśnie przywłosowe kurczą.", "Жарко: сосуды кожи расширяются и выделяется пот. Холодно: сосуды сужаются, а мышцы, поднимающие волосы, сокращаются.")],
  s3: [r("Dotyk — ciałka dotykowe, ucisk i wibracje — ciałka blaszkowate, ból — nocyceptory (wolne zakończenia nerwowe).", "Прикосновение — осязательные тельца, давление и вибрация — пластинчатые тельца, боль — ноцицепторы (свободные нервные окончания).")],
  s4: [r("Funkcje skóry: ochronna, termoregulacyjna, wydalnicza, zmysłowa, wytwarzanie witaminy D, magazynowanie tłuszczu.", "Функции кожи: защитная, терморегуляционная, выделительная, чувствительная, образование витамина D, запасание жира.")],
};

export default function SkinLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="skin" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="skin-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <SkinMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="skin-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <SkinThermo lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="skin-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MatchQuiz
          lang={lang}
          title={r("Bodziec i receptor", "Раздражитель и рецептор")}
          question={r("Który receptor odbiera bodziec:", "Какой рецептор воспринимает раздражитель:")}
          options={RECEPTORS}
          items={STIMULI}
          wrongHint={r("Pomyśl, czy to dotyk, ucisk, temperatura czy uszkodzenie tkanek.", "Подумай: это прикосновение, давление, температура или повреждение тканей?")}
        />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="skin-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <FunctionCards lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
