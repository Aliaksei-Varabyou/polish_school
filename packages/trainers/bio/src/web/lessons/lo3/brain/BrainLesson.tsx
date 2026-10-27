// Lesson for LO3 §8.3 "Ośrodkowy układ nerwowy" and §8.4 "Obwodowy układ nerwowy" (zakres
// rozszerzony) — one lesson, since the reflex arc joins the spinal cord with the nerves. Terms follow
// templates/data/systems.ts (NERVOUS_PARTS) and templates/data/systemsMore.ts (BRAIN_PARTS, PERIPHERAL_PARTS).
import { useEffect, useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { OrderGame, PartMap, TwoWaySort, type MapPart, type SortItem } from "@portal/lessons";
import { Choice, Remember, Section, type LessonProps, type Txt } from "@portal/lessons";
import { LessonIntro } from "@portal/lessons";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Ośrodkowy układ nerwowy to mózgowie i rdzeń kręgowy, chronione przez kości czaszki i kręgosłupa, opony i płyn mózgowo-rdzeniowy. Obwodowy układ nerwowy tworzą nerwy i zwoje: 12 par nerwów czaszkowych i 31 par nerwów rdzeniowych łączy ośrodki z receptorami i narządami wykonawczymi.",
    "Центральная нервная система — это головной и спинной мозг, защищённые костями черепа и позвоночника, мозговыми оболочками и спинномозговой жидкостью. Периферическую нервную систему образуют нервы и ганглии: 12 пар черепных и 31 пара спинномозговых нервов связывают центры с рецепторами и рабочими органами.",
  ),
  s1: r("Kora mózgu i jej płaty", "Кора больших полушарий и её доли"),
  s1intro: r("Mózgowie widziane z lewej strony — przód głowy jest po lewej.", "Вид головного мозга слева: лоб обращён влево."),
  s2: r("Wnętrze mózgowia", "Внутреннее строение головного мозга"),
  s2intro: r("Przekrój przez środek mózgowia, między półkulami.", "Разрез посередине головного мозга, между полушариями."),
  s3: r("Rdzeń kręgowy i nerwy rdzeniowe", "Спинной мозг и спинномозговые нервы"),
  s3intro: r("Przekrój poprzeczny rdzenia kręgowego; strona grzbietowa jest u góry.", "Поперечный разрез спинного мозга; спинная сторона вверху."),
  s4: r("Łuk odruchowy", "Рефлекторная дуга"),
  s4intro: r("Uderz młotkiem pod kolano i prześledź drogę impulsu w odruchu kolanowym.", "Ударь молоточком под колено и проследи путь импульса в коленном рефлексе."),
  s5: r("Odruchy bezwarunkowe i warunkowe", "Безусловные и условные рефлексы"),
} satisfies Record<string, Txt>;

// ---------- side view ----------

const CEREBRUM =
  "M40 130 C 26 80, 70 26, 150 22 C 230 18, 300 50, 310 110 C 316 150, 290 178, 250 176 C 225 175, 205 182, 190 192 C 160 210, 110 205, 92 180 C 70 176, 50 160, 40 130 Z";

type Side = "frontal" | "parietal" | "temporal" | "occipital" | "cerebellum" | "stem" | "cord";

const SIDE: Record<Side, MapPart> = {
  frontal: {
    name: r("Płat czołowy", "Лобная доля"),
    text: r(
      "Planowanie, podejmowanie decyzji i kontrola zachowania. Przed bruzdą środkową leży kora ruchowa sterująca ruchami dowolnymi, a zwykle w lewej półkuli — ruchowy ośrodek mowy (ośrodek Broki).",
      "Планирование, принятие решений и контроль поведения. Перед центральной бороздой лежит двигательная кора, управляющая произвольными движениями, а обычно в левом полушарии — двигательный центр речи (центр Брока).",
    ),
    pin: [30, 30],
    to: [90, 70],
  },
  parietal: {
    name: r("Płat ciemieniowy", "Теменная доля"),
    text: r("Za bruzdą środkową leży kora czuciowa: odbiera dotyk, ucisk, ból i temperaturę z całego ciała. Płat pomaga też orientować się w przestrzeni.", "За центральной бороздой лежит чувствительная кора: она воспринимает прикосновение, давление, боль и температуру от всего тела. Доля помогает также ориентироваться в пространстве."),
    pin: [300, 24],
    to: [228, 62],
  },
  temporal: {
    name: r("Płat skroniowy", "Височная доля"),
    text: r("Ośrodek słuchu i czuciowy ośrodek mowy (ośrodek Wernickego) — odpowiada za rozumienie słów. Bierze udział w zapamiętywaniu.", "Центр слуха и сенсорный центр речи (центр Вернике) — отвечает за понимание слов. Участвует в запоминании."),
    pin: [118, 254],
    to: [150, 172],
  },
  occipital: {
    name: r("Płat potyliczny", "Затылочная доля"),
    text: r("Ośrodek wzroku: tu docierają impulsy z siatkówki przez nerwy wzrokowe i tu powstaje obraz.", "Центр зрения: сюда приходят импульсы от сетчатки по зрительным нервам, и здесь возникает изображение."),
    pin: [340, 124],
    to: [294, 120],
  },
  cerebellum: {
    name: r("Móżdżek", "Мозжечок"),
    text: r("Koordynuje ruchy, utrzymuje równowagę i napięcie mięśni. Alkohol zaburza jego pracę — stąd chwiejny chód.", "Координирует движения, поддерживает равновесие и тонус мышц. Алкоголь нарушает его работу — отсюда шаткая походка."),
    pin: [324, 250],
    to: [280, 212],
  },
  stem: {
    name: r("Pień mózgu", "Ствол мозга"),
    text: r(
      "Śródmózgowie, most i rdzeń przedłużony. W rdzeniu przedłużonym leżą ośrodki niezbędne do życia — oddechowy i krążenia — oraz ośrodki odruchów kaszlu, kichania i połykania.",
      "Средний мозг, мост и продолговатый мозг. В продолговатом мозге лежат жизненно важные центры — дыхательный и сердечно-сосудистый — и центры рефлексов кашля, чихания и глотания.",
    ),
    pin: [172, 254],
    to: [210, 218],
  },
  cord: {
    name: r("Rdzeń kręgowy", "Спинной мозг"),
    text: r("Ośrodek odruchów bezwarunkowych i droga przewodząca impulsy między mózgowiem a resztą ciała. Biegnie w kanale kręgowym.", "Центр безусловных рефлексов и путь, проводящий импульсы между головным мозгом и остальным телом. Лежит в позвоночном канале."),
    pin: [262, 278],
    to: [212, 276],
  },
};

function SideMap({ lang }: { lang: BioLang }) {
  const lobe = (id: Side, d: string, base: string, tone: (id: Side, base: string) => string) => <path d={d} fill={tone(id, base)} clipPath="url(#brain-cer)" stroke="none" />;
  return (
    <PartMap<Side>
      lang={lang}
      parts={SIDE}
      viewBox="0 0 360 290"
      title={r("Mózgowie z boku", "Головной мозг сбоку")}
      labelOrder={["frontal", "parietal", "temporal", "occipital", "cerebellum", "stem", "cord"]}
      pinRadius={13}
      maxWidth="max-w-[460px]"
      art={({ part, tone }) => (
        <>
          <defs>
            <clipPath id="brain-cer">
              <path d={CEREBRUM} />
            </clipPath>
          </defs>
          {part("cord", <path d="M206 248 L 216 248 L 215 290 L 207 290 Z" fill={tone("cord", "#cbd5e1")} stroke="#64748b" strokeWidth={1.5} />)}
          {part(
            "stem",
            <g fill={tone("stem", "#a5b4fc")} stroke="#4338ca" strokeWidth={1.5}>
              <path d="M200 206 L 224 206 L 217 250 L 205 250 Z" />
              <ellipse cx={212} cy={198} rx={17} ry={14} />
            </g>,
          )}
          {part(
            "cerebellum",
            <g>
              <ellipse cx={268} cy={204} rx={40} ry={23} fill={tone("cerebellum", "#f9a8d4")} stroke="#be185d" strokeWidth={1.5} />
              {[-12, -4, 4, 12].map((d) => (
                <path key={d} d={`M${238} ${204 + d} Q 268 ${198 + d * 1.2} 302 ${204 + d}`} stroke="#be185d" strokeWidth={1} fill="none" opacity={0.6} />
              ))}
            </g>,
          )}
          {part("frontal", lobe("frontal", "M0 0 L 182 0 L 145 135 L 78 150 L 70 290 L 0 290 Z", "#93c5fd", tone))}
          {part("parietal", lobe("parietal", "M182 0 L 275 0 L 250 118 L 215 120 L 145 135 Z", "#fde68a", tone))}
          {part("occipital", lobe("occipital", "M275 0 L 360 0 L 360 290 L 252 290 L 250 118 Z", "#fdba74", tone))}
          {part("temporal", lobe("temporal", "M78 150 L 145 135 L 215 120 L 250 118 L 252 290 L 70 290 Z", "#86efac", tone))}
          <g pointerEvents="none" fill="none" stroke="#475569">
            <path d={CEREBRUM} strokeWidth={2} />
            <path d="M178 22 L 145 135" strokeWidth={2.5} />
            <path d="M80 150 Q 150 132 250 118" strokeWidth={2.5} />
            <path d="M70 70 Q 100 60 120 80 M60 110 Q 90 100 120 116 M210 40 Q 230 70 214 96 M260 60 Q 280 90 270 110 M120 170 Q 160 160 200 160" strokeWidth={1} opacity={0.45} />
          </g>
        </>
      )}
    />
  );
}

// ---------- midsagittal section ----------

type Mid = "callosum" | "thalamus" | "hypothalamus" | "pituitary" | "pineal" | "midbrain" | "pons" | "medulla";

const MID: Record<Mid, MapPart> = {
  callosum: {
    name: r("Ciało modzelowate", "Мозолистое тело"),
    text: r("Pasmo milionów włókien nerwowych łączące lewą i prawą półkulę — dzięki niemu półkule wymieniają informacje.", "Пучок из миллионов нервных волокон, соединяющий левое и правое полушария, — благодаря ему полушария обмениваются информацией."),
    pin: [196, 44],
    to: [196, 80],
  },
  thalamus: {
    name: r("Wzgórze", "Таламус"),
    text: r("Część międzymózgowia. Stacja przekaźnikowa: kieruje do kory impulsy ze wszystkich zmysłów oprócz węchu.", "Часть промежуточного мозга. Переключательная станция: направляет в кору импульсы от всех органов чувств, кроме обоняния."),
    pin: [330, 70],
    to: [210, 118],
  },
  hypothalamus: {
    name: r("Podwzgórze", "Гипоталамус"),
    text: r(
      "Część międzymózgowia. Ośrodek termoregulacji, głodu, sytości i pragnienia; steruje przysadką i układem autonomicznym. Wytwarza wazopresynę i oksytocynę.",
      "Часть промежуточного мозга. Центр терморегуляции, голода, насыщения и жажды; управляет гипофизом и вегетативной нервной системой. Вырабатывает вазопрессин и окситоцин.",
    ),
    pin: [52, 124],
    to: [160, 144],
  },
  pituitary: {
    name: r("Przysadka", "Гипофиз"),
    text: r("Gruczoł dokrewny zawieszony pod podwzgórzem. Wydziela m.in. hormon wzrostu i hormony sterujące innymi gruczołami, np. tarczycą.", "Железа внутренней секреции, подвешенная под гипоталамусом. Выделяет, в частности, гормон роста и гормоны, управляющие другими железами, например щитовидной."),
    pin: [92, 216],
    to: [156, 178],
  },
  pineal: {
    name: r("Szyszynka", "Эпифиз (шишковидная железа)"),
    text: r("Wydziela melatoninę — hormon regulujący rytm dobowy, m.in. sen i czuwanie. Najwięcej wydziela jej w ciemności.", "Выделяет мелатонин — гормон, регулирующий суточный ритм, в том числе сон и бодрствование. Больше всего — в темноте."),
    pin: [336, 130],
    to: [226, 136],
  },
  midbrain: {
    name: r("Śródmózgowie", "Средний мозг"),
    text: r("Ośrodki odruchów wzrokowych i słuchowych, np. zwężania źrenicy w jasnym świetle czy odwracania głowy w stronę dźwięku.", "Центры зрительных и слуховых рефлексов, например сужения зрачка на ярком свету или поворота головы к звуку."),
    pin: [300, 170],
    to: [214, 162],
  },
  pons: {
    name: r("Most", "Мост"),
    text: r("Droga łącząca móżdżek z resztą mózgowia; współuczestniczy w regulacji oddychania.", "Путь, связывающий мозжечок с остальным головным мозгом; участвует в регуляции дыхания."),
    pin: [150, 238],
    to: [192, 190],
  },
  medulla: {
    name: r("Rdzeń przedłużony", "Продолговатый мозг"),
    text: r(
      "Przechodzi w rdzeń kręgowy. Zawiera ośrodki oddychania i pracy serca oraz odruchów kaszlu, kichania i połykania — jego uszkodzenie zagraża życiu.",
      "Переходит в спинной мозг. Содержит центры дыхания и работы сердца, а также рефлексов кашля, чихания и глотания — его повреждение угрожает жизни.",
    ),
    pin: [252, 268],
    to: [212, 232],
  },
};

function MidMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<Mid>
      lang={lang}
      parts={MID}
      viewBox="0 0 360 290"
      title={r("Przekrój pośrodkowy mózgowia", "Срединный разрез головного мозга")}
      labelOrder={["callosum", "thalamus", "hypothalamus", "pituitary", "pineal", "midbrain", "pons", "medulla"]}
      pinRadius={13}
      maxWidth="max-w-[460px]"
      art={({ part, tone }) => (
        <>
          <path d="M202 244 L 214 244 L 213 290 L 203 290 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth={1.5} />
          <g>
            <ellipse cx={266} cy={204} rx={40} ry={24} fill="#f9a8d4" stroke="#be185d" strokeWidth={1.5} />
            <path d="M232 206 L 262 204 M250 205 L 270 190 M250 205 L 272 220 M262 204 L 290 196 M262 204 L 292 212" stroke="#fdf2f8" strokeWidth={3} strokeLinecap="round" />
          </g>
          <path d={CEREBRUM} fill="#fce7f3" stroke="#475569" strokeWidth={2} />
          <path d="M70 70 Q 100 50 140 50 M60 104 Q 80 90 110 88 M230 46 Q 270 60 286 92 M280 130 Q 300 140 296 160" stroke="#be185d" strokeWidth={1} fill="none" opacity={0.35} />
          {part(
            "callosum",
            <path
              d="M112 112 C 110 86, 150 74, 196 74 C 236 74, 262 88, 258 110 C 256 122, 244 124, 240 114 C 238 98, 220 90, 196 90 C 160 90, 132 96, 128 112 C 126 124, 114 124, 112 112 Z"
              fill={tone("callosum", "#f1f5f9")}
              stroke="#64748b"
              strokeWidth={1.5}
            />,
          )}
          {part("medulla", <path d="M194 202 L 218 202 L 214 246 L 202 246 Z" fill={tone("medulla", "#93c5fd")} stroke="#1d4ed8" strokeWidth={1.5} />)}
          {part("pons", <ellipse cx={200} cy={188} rx={19} ry={15} fill={tone("pons", "#a5b4fc")} stroke="#4338ca" strokeWidth={1.5} />)}
          {part("midbrain", <ellipse cx={204} cy={160} rx={14} ry={13} fill={tone("midbrain", "#c4b5fd")} stroke="#6d28d9" strokeWidth={1.5} />)}
          {part("thalamus", <ellipse cx={194} cy={124} rx={25} ry={14} fill={tone("thalamus", "#fda4af")} stroke="#be123c" strokeWidth={1.5} />)}
          {part("hypothalamus", <ellipse cx={172} cy={144} rx={15} ry={9} fill={tone("hypothalamus", "#fdba74")} stroke="#c2410c" strokeWidth={1.5} />)}
          {part(
            "pituitary",
            <g fill={tone("pituitary", "#fcd34d")} stroke="#a16207" strokeWidth={1.5}>
              <path d="M166 152 L 162 166" fill="none" strokeWidth={3} />
              <ellipse cx={160} cy={173} rx={9} ry={7} />
            </g>,
          )}
          {part("pineal", <ellipse cx={224} cy={136} rx={7} ry={5} fill={tone("pineal", "#86efac")} stroke="#15803d" strokeWidth={1.5} />)}
        </>
      )}
    />
  );
}

// ---------- spinal cord ----------

const GRAY =
  "M180 104 L 156 70 Q 148 64 144 72 L 156 112 Q 136 120 132 146 Q 134 166 156 162 L 172 138 L 180 136 L 188 138 L 204 162 Q 226 166 228 146 Q 224 120 204 112 L 216 72 Q 212 64 204 70 Z";

type Cord = "gray" | "white" | "canal" | "dorsal" | "ganglion" | "ventral" | "nerve" | "meninges";

const CORD: Record<Cord, MapPart> = {
  gray: {
    name: r("Istota szara", "Серое вещество"),
    text: r(
      "Ciała neuronów ułożone w kształt motyla. W rogach tylnych (grzbietowych) kończą się włókna czuciowe, w rogach przednich (brzusznych) leżą ciała neuronów ruchowych. Tu mieszczą się ośrodki odruchów rdzeniowych.",
      "Тела нейронов, расположенные в форме бабочки. В задних (дорсальных) рогах заканчиваются чувствительные волокна, в передних (вентральных) лежат тела двигательных нейронов. Здесь находятся центры спинномозговых рефлексов.",
    ),
    pin: [180, 220],
    to: [180, 140],
  },
  white: {
    name: r("Istota biała", "Белое вещество"),
    text: r("Aksony w osłonkach mielinowych. Tworzą drogi wstępujące (czuciowe — do mózgowia) i zstępujące (ruchowe — z mózgowia).", "Аксоны в миелиновых оболочках. Образуют восходящие (чувствительные — к головному мозгу) и нисходящие (двигательные — от головного мозга) пути."),
    pin: [332, 168],
    to: [252, 142],
  },
  canal: {
    name: r("Kanał środkowy", "Центральный канал"),
    text: r("Wąski kanał wypełniony płynem mózgowo-rdzeniowym — pozostałość światła cewki nerwowej.", "Узкий канал, заполненный спинномозговой жидкостью, — остаток полости нервной трубки."),
    pin: [180, 26],
    to: [180, 116],
  },
  dorsal: {
    name: r("Korzeń grzbietowy", "Задний корешок"),
    text: r("Zawiera włókna czuciowe — nim impulsy z receptorów wchodzą do rdzenia.", "Содержит чувствительные волокна — по нему импульсы от рецепторов входят в спинной мозг."),
    pin: [126, 22],
    to: [124, 56],
  },
  ganglion: {
    name: r("Zwój rdzeniowy", "Спинномозговой узел"),
    text: r("Zgrubienie korzenia grzbietowego, w którym leżą ciała neuronów czuciowych.", "Утолщение заднего корешка, в котором лежат тела чувствительных нейронов."),
    pin: [44, 24],
    to: [88, 46],
  },
  ventral: {
    name: r("Korzeń brzuszny", "Передний корешок"),
    text: r("Zawiera włókna ruchowe — nimi wychodzą z rdzenia aksony neuronów ruchowych do mięśni.", "Содержит двигательные волокна — по нему из спинного мозга выходят аксоны двигательных нейронов к мышцам."),
    pin: [60, 176],
    to: [80, 111],
  },
  nerve: {
    name: r("Nerw rdzeniowy", "Спинномозговой нерв"),
    text: r("Powstaje z połączenia obu korzeni, więc jest nerwem mieszanym — ma włókna czuciowe i ruchowe. Człowiek ma 31 par nerwów rdzeniowych.", "Образуется при слиянии обоих корешков, поэтому это смешанный нерв — в нём есть чувствительные и двигательные волокна. У человека 31 пара спинномозговых нервов."),
    pin: [22, 150],
    to: [30, 106],
  },
  meninges: {
    name: r("Opony mózgowo-rdzeniowe", "Мозговые оболочки"),
    text: r("Trzy błony z tkanki łącznej otaczające rdzeń i mózgowie; przestrzeń między nimi wypełnia płyn mózgowo-rdzeniowy, który amortyzuje wstrząsy.", "Три соединительнотканные оболочки вокруг спинного и головного мозга; пространство между ними заполняет спинномозговая жидкость, смягчающая толчки."),
    pin: [282, 216],
    to: [240, 178],
  },
};

const ROOTS = {
  dorsal: "M152 74 C 130 58, 116 52, 104 52 M80 56 C 70 62, 66 74, 64 86",
  ventral: "M140 156 C 112 146, 80 116, 66 92",
  nerve: "M66 88 L 12 112",
};

function CordMap({ lang }: { lang: BioLang }) {
  const mirror = "translate(360 0) scale(-1 1)";
  return (
    <PartMap<Cord>
      lang={lang}
      parts={CORD}
      viewBox="0 0 360 240"
      title={r("Przekrój rdzenia kręgowego", "Разрез спинного мозга")}
      labelOrder={["gray", "white", "canal", "dorsal", "ganglion", "ventral", "nerve", "meninges"]}
      pinRadius={13}
      maxWidth="max-w-[460px]"
      art={({ part, tone }) => (
        <>
          <text x={356} y={14} textAnchor="end" fontSize={10} fill="#64748b">
            {lang === "pl" ? "strona grzbietowa ↑" : "спинная сторона ↑"}
          </text>
          <text x={356} y={236} textAnchor="end" fontSize={10} fill="#64748b">
            {lang === "pl" ? "strona brzuszna ↓" : "брюшная сторона ↓"}
          </text>
          {part(
            "nerve",
            <g stroke={tone("nerve", "#f59e0b")} strokeWidth={10} strokeLinecap="round" fill="none">
              <path d={ROOTS.nerve} />
              <path d={ROOTS.nerve} transform={mirror} />
            </g>,
          )}
          {part(
            "dorsal",
            <g stroke={tone("dorsal", "#0ea5e9")} strokeWidth={6} strokeLinecap="round" fill="none">
              <path d={ROOTS.dorsal} />
              <path d={ROOTS.dorsal} transform={mirror} />
            </g>,
          )}
          {part(
            "ventral",
            <g stroke={tone("ventral", "#e11d48")} strokeWidth={6} strokeLinecap="round" fill="none">
              <path d={ROOTS.ventral} />
              <path d={ROOTS.ventral} transform={mirror} />
            </g>,
          )}
          {part(
            "ganglion",
            <g fill={tone("ganglion", "#7dd3fc")} stroke="#0369a1" strokeWidth={1.5}>
              <ellipse cx={92} cy={52} rx={14} ry={10} />
              <ellipse cx={268} cy={52} rx={14} ry={10} />
            </g>,
          )}
          {part("meninges", <ellipse cx={180} cy={122} rx={92} ry={72} fill={tone("meninges", "#ccfbf1")} stroke="#0d9488" strokeWidth={3} />)}
          {part("white", <ellipse cx={180} cy={122} rx={80} ry={62} fill={tone("white", "#f8fafc")} stroke="#94a3b8" strokeWidth={1.5} />)}
          {part("gray", <path d={GRAY} fill={tone("gray", "#9ca3af")} stroke="#4b5563" strokeWidth={1.5} />)}
          {part("canal", <circle cx={180} cy={121} r={5} fill={tone("canal", "#e0f2fe")} stroke="#0369a1" strokeWidth={1.5} />)}
        </>
      )}
    />
  );
}

// ---------- knee reflex ----------

const KNEE_STEPS: Txt[] = [
  r(
    "Młotek uderza w więzadło rzepki. Mięsień czworogłowy uda zostaje nagle rozciągnięty i pobudzają się w nim receptory — wrzecionka nerwowo-mięśniowe.",
    "Молоточек ударяет по связке надколенника. Четырёхглавая мышца бедра резко растягивается, и в ней возбуждаются рецепторы — нервно-мышечные веретёна.",
  ),
  r("Neuron czuciowy przewodzi impuls przez korzeń grzbietowy do rdzenia kręgowego. Jego ciało leży w zwoju rdzeniowym.", "Чувствительный нейрон проводит импульс через задний корешок в спинной мозг. Его тело лежит в спинномозговом узле."),
  r("W istocie szarej rdzenia impuls przechodzi przez synapsę wprost na neuron ruchowy — to ośrodek odruchu. Mózg nie musi brać w tym udziału.", "В сером веществе спинного мозга импульс через синапс переходит прямо на двигательный нейрон — это центр рефлекса. Головной мозг может в этом не участвовать."),
  r("Neuron ruchowy przewodzi impuls przez korzeń brzuszny i nerw do mięśnia czworogłowego.", "Двигательный нейрон проводит импульс через передний корешок и нерв к четырёхглавой мышце."),
  r("Mięsień — efektor — kurczy się i podudzie wyskakuje do przodu. Całość trwa ułamek sekundy.", "Мышца — эффектор — сокращается, и голень выбрасывается вперёд. Всё длится доли секунды."),
];

function KneeReflex({ lang }: { lang: BioLang }) {
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto || stage >= KNEE_STEPS.length) return;
    const id = window.setTimeout(() => setStage(stage + 1), stage === 0 ? 50 : 1300);
    return () => window.clearTimeout(id);
  }, [auto, stage]);
  const hit = () => {
    setStage(0);
    setAuto(true);
  };
  const kick = stage >= 5;
  const draw = (on: boolean) => ({ strokeDasharray: 1, strokeDashoffset: on ? 0 : 1, transition: "stroke-dashoffset .9s ease-in-out" });
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 360 260" className="w-full" role="img" aria-label={stage ? KNEE_STEPS[stage - 1]![lang] : lang === "pl" ? "odruch kolanowy" : "коленный рефлекс"}>
        <rect width={360} height={260} rx={14} fill="#f8fafc" />
        {/* spinal cord */}
        <ellipse cx={296} cy={62} rx={40} ry={30} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.5} />
        <g transform="translate(296 62) scale(0.42) translate(-180 -121)">
          <path d={GRAY} fill={stage === 3 ? "#fbbf24" : "#9ca3af"} style={{ transition: "fill .3s" }} />
        </g>
        <text x={296} y={108} textAnchor="middle" fontSize={10} fill="#475569">
          {lang === "pl" ? "rdzeń kręgowy" : "спинной мозг"}
        </text>
        {/* thigh and muscle */}
        <rect x={20} y={104} width={180} height={36} rx={16} fill="#fde2c8" stroke="#c2410c" strokeWidth={1.5} />
        <ellipse cx={112} cy={106} rx={kick ? 62 : 72} ry={kick ? 16 : 12} fill={kick ? "#ef4444" : "#fca5a5"} stroke="#b91c1c" strokeWidth={1.5} style={{ transition: "all .3s" }} />
        <path d="M118 100 q 4 -6 8 0 q 4 6 8 0" stroke={stage >= 1 ? "#facc15" : "#7f1d1d"} strokeWidth={2.5} fill="none" />
        {/* shank */}
        <g style={{ transform: `rotate(${kick ? -40 : 0}deg)`, transformOrigin: "192px 126px", transition: "transform .3s ease-out" }}>
          <rect x={178} y={126} width={28} height={110} rx={12} fill="#fde2c8" stroke="#c2410c" strokeWidth={1.5} />
          <path d="M178 230 L 214 232 L 214 246 L 178 246 Z" fill="#fde2c8" stroke="#c2410c" strokeWidth={1.5} />
          <path d="M198 122 L 196 152" stroke="#e5e7eb" strokeWidth={5} />
        </g>
        <circle cx={198} cy={114} r={9} fill="#fef3c7" stroke="#a16207" strokeWidth={1.5} />
        {/* hammer */}
        <g style={{ transform: `rotate(${stage === 1 ? 0 : 20}deg)`, transformOrigin: "320px 236px", transition: "transform .2s" }}>
          <path d="M320 236 L 222 156" stroke="#78716c" strokeWidth={5} strokeLinecap="round" />
          <rect x={200} y={142} width={24} height={16} rx={4} fill="#e11d48" transform="rotate(39 212 150)" />
        </g>
        {/* sensory neuron */}
        <path d="M124 100 C 140 60, 200 36, 250 40 L 288 54" stroke="#cbd5e1" strokeWidth={3} fill="none" />
        <path d="M124 100 C 140 60, 200 36, 250 40 L 288 54" stroke="#0ea5e9" strokeWidth={4} fill="none" pathLength={1} style={draw(stage >= 2)} />
        <ellipse cx={250} cy={40} rx={9} ry={6} fill="#7dd3fc" stroke="#0369a1" />
        {/* motor neuron */}
        <path d="M292 74 C 272 92, 232 98, 200 98 C 172 98, 152 102, 142 108" stroke="#cbd5e1" strokeWidth={3} fill="none" />
        <path d="M292 74 C 272 92, 232 98, 200 98 C 172 98, 152 102, 142 108" stroke="#e11d48" strokeWidth={4} fill="none" pathLength={1} style={draw(stage >= 4)} />
        <circle cx={290} cy={64} r={4} fill={stage >= 3 ? "#f59e0b" : "#64748b"} />
      </svg>
      <div className="space-y-3">
        <Choice state="active" onClick={hit}>
          🔨 {lang === "pl" ? "Uderz młotkiem" : "Ударить молоточком"}
        </Choice>
        <ol className="space-y-1.5" aria-live="polite">
          {KNEE_STEPS.map((s, k) => (
            <li
              key={s.pl}
              className={`rounded-lg px-3 py-1.5 text-sm ring-1 transition-colors ${
                k + 1 === stage ? "bg-emerald-50 font-medium text-emerald-950 ring-emerald-300" : k + 1 < stage ? "bg-white text-slate-700 ring-slate-200" : "bg-white text-slate-400 ring-slate-100"
              }`}
            >
              {k + 1}. {s[lang]}
            </li>
          ))}
        </ol>
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-sky-600">━</span> {lang === "pl" ? "neuron czuciowy" : "чувствительный нейрон"} ·{" "}
          <span className="font-semibold text-rose-600">━</span> {lang === "pl" ? "neuron ruchowy" : "двигательный нейрон"}
        </p>
      </div>
    </div>
  );
}

const ARC: Txt[] = [
  r("receptor", "рецептор"),
  r("neuron czuciowy", "чувствительный нейрон"),
  r("ośrodek w rdzeniu kręgowym", "центр в спинном мозге"),
  r("neuron ruchowy", "двигательный нейрон"),
  r("efektor (mięsień)", "эффектор (мышца)"),
];

// ---------- reflexes ----------

const REFLEXES: SortItem[] = [
  { name: r("odruch kolanowy", "коленный рефлекс"), group: 0, why: r("Wrodzony, ośrodek w rdzeniu kręgowym.", "Врождённый, центр в спинном мозге.") },
  { name: r("cofnięcie ręki od gorącego garnka", "отдёргивание руки от горячей кастрюли"), group: 0, why: r("Wrodzony odruch obronny.", "Врождённый защитный рефлекс.") },
  { name: r("wydzielanie śliny, gdy pokarm jest w ustach", "выделение слюны, когда пища во рту"), group: 0, why: r("Wrodzony — pokarm drażni receptory jamy ustnej.", "Врождённый — пища раздражает рецепторы ротовой полости.") },
  { name: r("ślinienie się na widok cytryny", "слюноотделение при виде лимона"), group: 1, why: r("Nabyty — trzeba wcześniej poznać smak cytryny.", "Приобретённый — нужно заранее знать вкус лимона.") },
  { name: r("zwężenie źrenicy w jasnym świetle", "сужение зрачка на ярком свету"), group: 0, why: r("Wrodzony, ośrodek w śródmózgowiu.", "Врождённый, центр в среднем мозге.") },
  { name: r("odruch ssania u noworodka", "сосательный рефлекс у новорождённого"), group: 0, why: r("Wrodzony — noworodek nie musi się go uczyć.", "Врождённый — новорождённому не нужно ему учиться.") },
  { name: r("pies ślini się na dźwięk dzwonka (doświadczenie Pawłowa)", "собака выделяет слюну на звонок (опыт Павлова)"), group: 1, why: r("Powstał przez wielokrotne skojarzenie dzwonka z podaniem pokarmu.", "Возник при многократном сочетании звонка с кормлением.") },
  { name: r("kichanie", "чихание"), group: 0, why: r("Wrodzony odruch obronny, ośrodek w rdzeniu przedłużonym.", "Врождённый защитный рефлекс, центр в продолговатом мозге.") },
  { name: r("kierowca hamuje na widok czerwonego światła", "водитель тормозит на красный свет"), group: 1, why: r("Nabyty w ciągu życia, wymaga udziału kory mózgu.", "Приобретён в течение жизни, требует участия коры.") },
  { name: r("pies biegnie do drzwi na dźwięk smyczy", "собака бежит к двери на звук поводка"), group: 1, why: r("Skojarzenie dźwięku smyczy ze spacerem — nabyte.", "Связь звука поводка с прогулкой — приобретённая.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Kora mózgu to istota szara na powierzchni półkul; bruzdy i zakręty zwiększają jej powierzchnię.", ru: "Кора — серое вещество на поверхности полушарий; борозды и извилины увеличивают её площадь." },
    { pl: "Czołowy — ruch i decyzje, ciemieniowy — czucie, skroniowy — słuch, potyliczny — wzrok.", ru: "Лобная — движения и решения, теменная — чувствительность, височная — слух, затылочная — зрение." },
  ],
  s2: [
    { pl: "Międzymózgowie: wzgórze i podwzgórze (z przysadką i szyszynką).", ru: "Промежуточный мозг: таламус и гипоталамус (с гипофизом и эпифизом)." },
    { pl: "Pień mózgu: śródmózgowie, most i rdzeń przedłużony — z ośrodkami oddychania i krążenia.", ru: "Ствол мозга: средний мозг, мост и продолговатый мозг — с центрами дыхания и кровообращения." },
  ],
  s3: [
    { pl: "W rdzeniu istota szara jest w środku, a biała na zewnątrz — w mózgu odwrotnie.", ru: "В спинном мозге серое вещество внутри, а белое снаружи — в головном наоборот." },
    { pl: "Korzeń grzbietowy — czuciowy, brzuszny — ruchowy; nerw rdzeniowy jest mieszany.", ru: "Задний корешок — чувствительный, передний — двигательный; спинномозговой нерв смешанный." },
  ],
  s4: [{ pl: "Łuk odruchowy: receptor → neuron czuciowy → ośrodek → neuron ruchowy → efektor.", ru: "Рефлекторная дуга: рецептор → чувствительный нейрон → центр → двигательный нейрон → эффектор." }],
  s5: [
    { pl: "Odruchy bezwarunkowe są wrodzone i stałe; warunkowe — nabyte, wymagają kory mózgu i wygasają, gdy nie są wzmacniane.", ru: "Безусловные рефлексы врождённые и постоянные; условные — приобретённые, требуют участия коры и угасают без подкрепления." },
  ],
};

export default function BrainLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="brain" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="brain-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <SideMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="brain-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <MidMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="brain-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <CordMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="brain-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <KneeReflex lang={lang} />
        <div className="mt-5">
          <OrderGame
            lang={lang}
            title={r("Ułóż elementy łuku odruchowego", "Выстрой звенья рефлекторной дуги")}
            start={r("bodziec", "раздражитель")}
            steps={ARC}
          />
        </div>
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="brain-s5" n={5} title={T.s5[lang]}>
        <TwoWaySort lang={lang} title={T.s5} groups={[r("bezwarunkowy", "безусловный"), r("warunkowy", "условный")]} items={REFLEXES} />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
