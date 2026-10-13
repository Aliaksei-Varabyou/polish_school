// Lesson for LO3 §3.2 "Budowa i funkcje szkieletu" and §3.4 "Elementy szkieletu" (Biologia na czasie 3,
// zakres rozszerzony) — one lesson for both: the bone as a tissue and an organ, then the skeleton it
// builds. Terms follow templates/data/systemsMore.ts (BONE_TISSUE, SKELETON_PARTS) and systems.ts
// (MOTION_PARTS).
import { useState } from "react";
import type { BioLang } from "../../../../lang.ts";
import { PartMap, TwoWaySort, type MapPart, type SortItem } from "../../games.tsx";
import { Choice, num, Remember, Section, type LessonProps, type Txt } from "../../kit.tsx";
import { LessonIntro } from "../../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Szkielet dorosłego człowieka to ok. 206 kości. Jest biernym narządem ruchu — dźwignią dla mięśni — a do tego podporą ciała, osłoną narządów, miejscem wytwarzania krwinek (szpik czerwony) i magazynem wapnia i fosforu.",
    "Скелет взрослого человека — это около 206 костей. Он пассивная часть опорно-двигательной системы — рычаги для мышц, — а также опора тела, защита органов, место образования клеток крови (красный костный мозг) и депо кальция и фосфора.",
  ),
  s1: r("Budowa kości długiej", "Строение длинной кости"),
  s1intro: r("Kość udowa przecięta wzdłuż. Kość to żywy narząd: ma naczynia, nerwy i komórki, które stale ją przebudowują.", "Бедренная кость в продольном разрезе. Кость — живой орган: в ней есть сосуды, нервы и клетки, которые постоянно её перестраивают."),
  s2: r("Skład chemiczny kości — doświadczenie", "Химический состав кости — опыт"),
  s2intro: r("Wybierz kość i zwiększaj siłę nacisku. Sprawdź, co daje kości twardość, a co — sprężystość.", "Выбери кость и увеличивай силу нажима. Проверь, что придаёт кости твёрдость, а что — упругость."),
  s3: r("Szkielet człowieka", "Скелет человека"),
  s3intro: r(
    "Szkielet osiowy to czaszka, kręgosłup i klatka piersiowa. Szkielet kończyn to kości kończyn wraz z obręczami, które łączą je z osią ciała.",
    "Осевой скелет — это череп, позвоночник и грудная клетка. Скелет конечностей — кости конечностей вместе с поясами, которые соединяют их с осью тела.",
  ),
  s4: r("Kręgosłup i jego krzywizny", "Позвоночник и его изгибы"),
  s4intro: r("Kręgosłup widziany z boku (przód po prawej). Wybierz odcinek, żeby go poznać.", "Позвоночник сбоку (перед справа). Выбери отдел, чтобы узнать о нём."),
  s5: r("Szkielet osiowy czy szkielet kończyn?", "Осевой скелет или скелет конечностей?"),
} satisfies Record<string, Txt>;

const BONE = "#f5efe0";
const BONE_EDGE = "#a8a29e";

// ---------- long bone ----------

type LongPart = "cartilage" | "spongy" | "plate" | "shaft" | "compact" | "cavity" | "periosteum" | "epiphysis" | "osteon";

const LONG: Record<LongPart, MapPart> = {
  cartilage: {
    name: r("Chrząstka stawowa", "Суставной хрящ"),
    text: r("Gładka chrząstka szklista pokrywająca powierzchnie stawowe nasad; zmniejsza tarcie w stawie.", "Гладкий гиалиновый хрящ, покрывающий суставные поверхности эпифизов; уменьшает трение в суставе."),
    pin: [232, 20],
    to: [182, 22],
  },
  spongy: {
    name: r("Istota gąbczasta", "Губчатое вещество"),
    text: r(
      "Wypełnia nasady. Beleczki kostne ułożone są wzdłuż linii działania sił, więc kość jest lekka, a wytrzymała. Między beleczkami leży szpik kostny czerwony, który wytwarza krwinki.",
      "Заполняет эпифизы. Костные перекладины расположены вдоль линий действия сил, поэтому кость лёгкая, но прочная. Между перекладинами находится красный костный мозг, образующий клетки крови.",
    ),
    pin: [232, 60],
    to: [168, 62],
  },
  plate: {
    name: r("Chrząstka nasadowa", "Эпифизарная пластинка"),
    text: r(
      "Warstwa chrząstki między nasadą a trzonem. Jej komórki dzielą się i są zastępowane kością — tak kość rośnie na długość. Po zakończeniu wzrostu chrząstka kostnieje.",
      "Слой хряща между эпифизом и диафизом. Его клетки делятся и замещаются костью — так кость растёт в длину. После окончания роста хрящ окостеневает.",
    ),
    pin: [72, 100],
    to: [112, 100],
  },
  shaft: {
    name: r("Trzon", "Диафиз"),
    text: r("Środkowa, rurowata część kości długiej. Rura jest lekka, a odporna na zginanie.", "Средняя трубчатая часть длинной кости. Трубка лёгкая, но устойчива к изгибу."),
    pin: [72, 175],
    to: [108, 175],
  },
  compact: {
    name: r("Istota zbita", "Компактное вещество"),
    text: r("Gruba ściana trzonu z gęsto ułożonych osteonów. Przenosi największe obciążenia.", "Толстая стенка диафиза из плотно уложенных остеонов. Выдерживает наибольшие нагрузки."),
    pin: [232, 150],
    to: [168, 150],
  },
  cavity: {
    name: r("Jama szpikowa", "Костномозговая полость"),
    text: r("Kanał wewnątrz trzonu. U dzieci wypełnia go szpik czerwony, u dorosłych — szpik żółty, czyli tkanka tłuszczowa.", "Канал внутри диафиза. У детей его заполняет красный костный мозг, у взрослых — жёлтый, то есть жировая ткань."),
    pin: [72, 250],
    to: [150, 250],
  },
  periosteum: {
    name: r("Okostna", "Надкостница"),
    text: r(
      "Błona z tkanki łącznej pokrywająca kość (poza powierzchniami stawowymi). Ma naczynia krwionośne i nerwy, odżywia kość; jej osteoblasty sprawiają, że kość rośnie na grubość i zrasta się po złamaniu.",
      "Соединительнотканная оболочка кости (кроме суставных поверхностей). В ней сосуды и нервы, она питает кость; её остеобласты обеспечивают рост кости в толщину и срастание после перелома.",
    ),
    pin: [232, 300],
    to: [177, 290],
  },
  epiphysis: {
    name: r("Nasada", "Эпифиз"),
    text: r("Zgrubiały koniec kości długiej, zbudowany z istoty gąbczastej i pokryty chrząstką stawową; tworzy staw z sąsiednią kością.", "Утолщённый конец длинной кости из губчатого вещества, покрытый суставным хрящом; образует сустав с соседней костью."),
    pin: [72, 345],
    to: [86, 345],
  },
  osteon: {
    name: r("Osteon", "Остеон"),
    text: r(
      "Osteon (system Haversa) to jednostka budowy istoty zbitej: blaszki kostne ułożone koncentrycznie wokół kanału z naczyniami krwionośnymi i nerwem. W jamkach między blaszkami leżą osteocyty — dojrzałe komórki kostne.",
      "Остеон (гаверсова система) — структурная единица компактного вещества: костные пластинки концентрически расположены вокруг канала с кровеносными сосудами и нервом. В полостях между пластинками лежат остеоциты — зрелые костные клетки.",
    ),
    pin: [300, 296],
    to: [300, 266],
  },
};

function LongBoneMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<LongPart>
      lang={lang}
      parts={LONG}
      viewBox="0 0 360 400"
      title={r("Przekrój podłużny kości długiej", "Продольный разрез длинной кости")}
      labelOrder={["cartilage", "spongy", "plate", "shaft", "compact", "cavity", "periosteum", "epiphysis", "osteon"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <defs>
            <pattern id="skel-spongy" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#fecdd3" />
              <path d="M0 6 L 6 0 M6 12 L 12 6 M0 0 L 12 12" stroke="#e7dcc4" strokeWidth={2.5} />
            </pattern>
          </defs>
          {part(
            "spongy",
            <g>
              <path d="M100 70 C 96 30, 120 14, 150 14 C 180 14, 204 30, 200 70 C 198 96, 180 108, 174 118 L 126 118 C 120 108, 102 96, 100 70 Z" fill={tone("spongy", "url(#skel-spongy)")} stroke={BONE_EDGE} strokeWidth={2} />
            </g>,
          )}
          {part(
            "epiphysis",
            <g>
              <path d="M126 300 C 120 310, 102 320, 102 350 C 102 378, 124 388, 150 388 C 176 388, 198 378, 198 350 C 198 320, 180 310, 174 300 Z" fill={tone("epiphysis", "url(#skel-spongy)")} stroke={BONE_EDGE} strokeWidth={2} />
              <path d="M100 304 Q 92 304 92 312 L 92 338 Q 92 345 86 345 Q 92 345 92 352 L 92 378 Q 92 386 100 386" fill="none" strokeLinecap="round" stroke={tone("epiphysis", "#64748b")} strokeWidth={2.5} />
            </g>,
          )}
          {part("cavity", <rect x={138} y={118} width={24} height={182} fill={tone("cavity", "#fde047")} />)}
          {part(
            "compact",
            <g fill={tone("compact", BONE)} stroke={BONE_EDGE} strokeWidth={1.5}>
              <rect x={126} y={118} width={12} height={182} />
              <rect x={162} y={118} width={12} height={182} />
            </g>,
          )}
          {part(
            "periosteum",
            <g stroke={tone("periosteum", "#a855f7")} strokeLinecap="round">
              <path d="M123 120 L 123 298 M177 120 L 177 298" strokeWidth={3} />
              <path d="M123 120 L 123 298 M177 120 L 177 298" strokeWidth={12} stroke="transparent" />
            </g>,
          )}
          {part(
            "plate",
            <g>
              <path d="M112 100 Q 150 92 188 100" fill="none" stroke={tone("plate", "#38bdf8")} strokeWidth={5} strokeLinecap="round" />
              <path d="M112 100 Q 150 92 188 100" fill="none" stroke="transparent" strokeWidth={12} />
            </g>,
          )}
          {part(
            "cartilage",
            <g fill="none" stroke={tone("cartilage", "#7dd3fc")} strokeWidth={7} strokeLinecap="round">
              <path d="M104 50 C 110 26, 128 17, 150 17 C 172 17, 190 26, 196 50" />
              <path d="M106 362 C 112 380, 130 385, 150 385 C 170 385, 188 380, 194 362" />
            </g>,
          )}
          {part(
            "shaft",
            <g fill="none" strokeLinecap="round">
              <path d="M116 120 Q 108 120 108 128 L 108 200 Q 108 209 102 209 Q 108 209 108 218 L 108 290 Q 108 298 116 298" stroke={tone("shaft", "#64748b")} strokeWidth={2.5} />
              <path d="M108 124 L 108 296" stroke="transparent" strokeWidth={14} />
            </g>,
          )}
          <path d="M174 196 L 258 186 M174 234 L 258 244" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" pointerEvents="none" />
          {part(
            "osteon",
            <g>
              <circle cx={300} cy={215} r={50} fill={tone("osteon", BONE)} stroke={BONE_EDGE} strokeWidth={2} />
              {[42, 34, 26, 18].map((rr) => (
                <circle key={rr} cx={300} cy={215} r={rr} fill="none" stroke="#d6c7a1" strokeWidth={2} />
              ))}
              <circle cx={300} cy={215} r={8} fill="#fecaca" stroke="#b91c1c" strokeWidth={1.5} />
              <circle cx={298} cy={213} r={2} fill="#dc2626" />
              <circle cx={303} cy={217} r={2} fill="#2563eb" />
              {[0, 50, 100, 150, 200, 250, 300].map((a, k) => {
                const rr = k % 2 ? 30 : 22;
                const rad = (a * Math.PI) / 180;
                return <ellipse key={a} cx={300 + rr * Math.cos(rad)} cy={215 + rr * Math.sin(rad)} rx={3.2} ry={1.8} fill="#57534e" transform={`rotate(${a + 90} ${300 + rr * Math.cos(rad)} ${215 + rr * Math.sin(rad)})`} />;
              })}
            </g>,
          )}
        </>
      )}
    />
  );
}

// ---------- the bone experiment ----------

type BoneKind = "fresh" | "burnt" | "acid";

const EXP: Record<BoneKind, { name: Txt; text: Txt; minerals: number; flex: number; breakAt: number | null; color: string }> = {
  fresh: {
    name: r("Kość świeża", "Свежая кость"),
    text: r(
      "Kość świeża jest jednocześnie twarda i sprężysta: sole mineralne nadają jej twardość, a osseina — sprężystość. Ugina się tylko trochę i pęka dopiero pod dużym obciążeniem.",
      "Свежая кость одновременно твёрдая и упругая: минеральные соли придают ей твёрдость, а оссеин — упругость. Она прогибается совсем немного и ломается только под большой нагрузкой.",
    ),
    minerals: 2 / 3,
    flex: 0.1,
    breakAt: 88,
    color: BONE,
  },
  burnt: {
    name: r("Kość wyprażona", "Прокалённая кость"),
    text: r(
      "Prażenie w płomieniu spala substancje organiczne, w tym osseinę. Zostają same sole wapnia i fosforu — kość zachowuje kształt i twardość, ale jest krucha i kruszy się przy niewielkim nacisku.",
      "Прокаливание в пламени сжигает органические вещества, в том числе оссеин. Остаются только соли кальция и фосфора — кость сохраняет форму и твёрдость, но становится хрупкой и крошится при небольшом нажиме.",
    ),
    minerals: 1,
    flex: 0.02,
    breakAt: 25,
    color: "#e7e5e4",
  },
  acid: {
    name: r("Kość odwapniona", "Декальцинированная кость"),
    text: r(
      "Kilkudniowe moczenie w kwasie solnym rozpuszcza sole wapnia. Zostaje osseina — kość jest tak giętka, że można ją zgiąć, a cienką kość nawet zawiązać na supeł.",
      "Несколько дней в соляной кислоте растворяют соли кальция. Остаётся оссеин — кость становится такой гибкой, что её можно согнуть, а тонкую кость даже завязать узлом.",
    ),
    minerals: 0,
    flex: 0.8,
    breakAt: null,
    color: "#fef3c7",
  },
};

const EXP_T = {
  force: r("Siła nacisku", "Сила нажима"),
  minerals: r("sole mineralne", "минеральные соли"),
  organic: r("osseina (białko)", "оссеин (белок)"),
  broken: r("Kość pękła!", "Кость сломалась!"),
  crumbled: r("Kość rozkruszyła się!", "Кость раскрошилась!"),
  composition: r("Skład (bez wody)", "Состав (без воды)"),
  age: r(
    "U dzieci kości mają więcej osseiny — są sprężyste i często łamią się jak „zielona gałązka”. U osób starszych przeważają sole mineralne, więc kości są kruche.",
    "У детей в костях больше оссеина — они упругие и часто ломаются по типу «зелёной веточки». У пожилых преобладают минеральные соли, поэтому кости хрупкие.",
  ),
};

function BoneExperiment({ lang }: { lang: BioLang }) {
  const [kind, setKind] = useState<BoneKind>("fresh");
  const [force, setForce] = useState(0);
  const e = EXP[kind];
  const broken = e.breakAt !== null && force >= e.breakAt;
  const deg = Math.min(75, force * e.flex);
  const th = (deg * Math.PI) / 180;
  const L = 200;
  const x0 = 60;
  const y0 = 70;
  // the bone bends as a circular arc whose end turns by θ
  const end = th < 1e-3 ? [x0 + L, y0] : [x0 + (L / th) * Math.sin(th), y0 + (L / th) * (1 - Math.cos(th))];
  const path = th < 1e-3 ? `M${x0} ${y0} L ${end[0]} ${end[1]}` : `M${x0} ${y0} A ${L / th} ${L / th} 0 0 1 ${end[0]} ${end[1]}`;
  const choose = (k: BoneKind) => {
    setKind(k);
    setForce(0);
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {(Object.keys(EXP) as BoneKind[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => choose(k)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              kind === k ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {EXP[k].name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <svg viewBox="0 0 320 200" className="w-full" role="img" aria-label={`${e.name[lang]}: ${broken ? (kind === "burnt" ? EXP_T.crumbled[lang] : EXP_T.broken[lang]) : ""}`}>
            <rect width={320} height={200} rx={12} fill="#f8fafc" />
            <rect x={20} y={48} width={44} height={44} rx={4} fill="#64748b" />
            <rect x={20} y={60} width={44} height={20} fill="#475569" />
            {!broken ? (
              <g>
                <path d={path} fill="none" stroke={BONE_EDGE} strokeWidth={20} strokeLinecap="round" />
                <path d={path} fill="none" stroke={e.color} strokeWidth={16} strokeLinecap="round" />
                <path d={`M${end[0]! - 10} ${end[1]! - 32} L ${end[0]! - 10} ${end[1]! - 14}`} stroke="#e11d48" strokeWidth={3 + force / 20} markerEnd="url(#skel-push)" opacity={force ? 1 : 0.3} />
              </g>
            ) : kind === "burnt" ? (
              <g>
                <path d={`M${x0} ${y0} L ${x0 + 70} ${y0 + 2}`} stroke={BONE_EDGE} strokeWidth={20} strokeLinecap="round" />
                <path d={`M${x0} ${y0} L ${x0 + 70} ${y0 + 2}`} stroke={e.color} strokeWidth={16} strokeLinecap="round" />
                {[
                  [150, 170, 20],
                  [190, 176, -15],
                  [228, 168, 40],
                  [262, 178, 5],
                  [120, 180, -30],
                ].map(([x, y, a], k) => (
                  <rect key={k} x={x! - 14} y={y! - 7} width={28 - k * 2} height={14} rx={3} fill={e.color} stroke={BONE_EDGE} strokeWidth={2} transform={`rotate(${a} ${x} ${y})`} />
                ))}
              </g>
            ) : (
              <g>
                <path d={`M${x0} ${y0} L ${x0 + 120} ${y0 + 6}`} fill="none" stroke={BONE_EDGE} strokeWidth={20} strokeLinecap="round" />
                <path d={`M${x0} ${y0} L ${x0 + 120} ${y0 + 6}`} fill="none" stroke={e.color} strokeWidth={16} strokeLinecap="round" />
                <path d="M200 150 L 300 178" stroke={BONE_EDGE} strokeWidth={20} strokeLinecap="round" />
                <path d="M200 150 L 300 178" stroke={e.color} strokeWidth={16} strokeLinecap="round" />
                <path d="M174 60 l 6 10 l -6 6 l 8 8" stroke="#dc2626" strokeWidth={2.5} fill="none" />
              </g>
            )}
            <defs>
              <marker id="skel-push" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0 0 L 10 5 L 0 10 Z" fill="#e11d48" />
              </marker>
            </defs>
          </svg>
          <label className="mt-2 block text-sm font-semibold text-slate-700">
            {EXP_T.force[lang]}
            <input
              type="range"
              min={0}
              max={100}
              value={force}
              onChange={(ev) => setForce(Number(ev.target.value))}
              className="mt-2 h-2 w-full cursor-pointer accent-rose-600"
              aria-valuetext={`${force}%`}
            />
          </label>
          {broken && (
            <div className="mt-2">
              <Choice onClick={() => setForce(0)}>↺ {lang === "pl" ? "Nowa kość" : "Новая кость"}</Choice>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">{EXP_T.composition[lang]}</div>
            <div className="flex h-7 overflow-hidden rounded-full text-[11px] font-semibold ring-1 ring-slate-300">
              {e.minerals > 0 && (
                <span className="flex items-center justify-center bg-slate-400 text-white transition-all" style={{ width: `${e.minerals * 100}%` }}>
                  {num(e.minerals * 100)}%
                </span>
              )}
              {e.minerals < 1 && (
                <span className="flex items-center justify-center bg-amber-300 text-amber-950 transition-all" style={{ width: `${(1 - e.minerals) * 100}%` }}>
                  {num((1 - e.minerals) * 100)}%
                </span>
              )}
            </div>
            <div className="mt-1 flex gap-4 text-xs text-slate-600">
              <span>
                <span className="mr-1 inline-block h-2 w-3 rounded-sm bg-slate-400 align-middle" /> {EXP_T.minerals[lang]}
              </span>
              <span>
                <span className="mr-1 inline-block h-2 w-3 rounded-sm bg-amber-300 align-middle" /> {EXP_T.organic[lang]}
              </span>
            </div>
          </div>
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-[15px] leading-relaxed text-emerald-950 ring-1 ring-emerald-200" aria-live="polite">
            {broken && <b>{kind === "burnt" ? EXP_T.crumbled[lang] : EXP_T.broken[lang]} </b>}
            {e.text[lang]}
          </p>
          <p className="text-sm leading-relaxed text-slate-600">{EXP_T.age[lang]}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- the whole skeleton ----------

type SkelPart = "skull" | "spine" | "chest" | "shoulder" | "humerus" | "forearm" | "hand" | "pelvis" | "femur" | "patella" | "shin" | "foot";

const SKEL: Record<SkelPart, MapPart> = {
  skull: {
    name: r("Czaszka", "Череп"),
    text: r(
      "Mózgoczaszka tworzy puszkę chroniącą mózgowie, trzewioczaszka — szkielet twarzy. Kości czaszki łączą się szwami; jedyną ruchomą kością jest żuchwa.",
      "Мозговой отдел черепа образует коробку, защищающую головной мозг, лицевой — скелет лица. Кости черепа соединены швами; единственная подвижная кость — нижняя челюсть.",
    ),
    pin: [68, 30],
    to: [152, 40],
  },
  spine: {
    name: r("Kręgosłup", "Позвоночник"),
    text: r("Oś ciała z 33–34 kręgów. W kanale kręgowym chroni rdzeń kręgowy; podtrzymuje głowę i tułów.", "Ось тела из 33–34 позвонков. В позвоночном канале защищает спинной мозг; поддерживает голову и туловище."),
    pin: [300, 250],
    to: [186, 262],
  },
  chest: {
    name: r("Klatka piersiowa", "Грудная клетка"),
    text: r(
      "12 par żeber, mostek i 12 kręgów piersiowych. Chroni serce i płuca, bierze udział w oddychaniu. 7 par żeber prawdziwych łączy się z mostkiem bezpośrednio, 3 pary rzekomych — przez chrząstkę żebra wyżej, 2 pary wolnych kończą się swobodnie.",
      "12 пар рёбер, грудина и 12 грудных позвонков. Защищает сердце и лёгкие, участвует в дыхании. 7 пар истинных рёбер соединяются с грудиной напрямую, 3 пары ложных — через хрящ вышележащего ребра, 2 пары колеблющихся заканчиваются свободно.",
    ),
    pin: [300, 160],
    to: [226, 162],
  },
  shoulder: {
    name: r("Obręcz barkowa", "Плечевой пояс"),
    text: r("Obojczyki i łopatki łączą kończyny górne ze szkieletem osiowym. Obręcz jest bardzo ruchoma, dzięki czemu ręka ma duży zakres ruchów.", "Ключицы и лопатки соединяют верхние конечности с осевым скелетом. Пояс очень подвижен, поэтому рука имеет большой размах движений."),
    pin: [68, 96],
    to: [150, 108],
  },
  humerus: {
    name: r("Kość ramienna", "Плечевая кость"),
    text: r("Kość długa ramienia. Łączy się z łopatką w stawie ramiennym, a z kośćmi przedramienia w stawie łokciowym.", "Длинная кость плеча. Соединяется с лопаткой в плечевом суставе, а с костями предплечья — в локтевом."),
    pin: [68, 170],
    to: [120, 170],
  },
  forearm: {
    name: r("Kości przedramienia", "Кости предплечья"),
    text: r(
      "Kość łokciowa (od strony małego palca) i kość promieniowa (od strony kciuka). Kość promieniowa obraca się wokół łokciowej — dzięki temu możemy obracać dłoń.",
      "Локтевая кость (со стороны мизинца) и лучевая (со стороны большого пальца). Лучевая кость вращается вокруг локтевой — благодаря этому мы можем поворачивать кисть.",
    ),
    pin: [68, 250],
    to: [111, 262],
  },
  hand: {
    name: r("Kości ręki", "Кости кисти"),
    text: r("Kości nadgarstka (8), śródręcza (5) i paliczki palców (14). Przeciwstawny kciuk umożliwia chwytanie.", "Кости запястья (8), пясти (5) и фаланги пальцев (14). Противопоставленный большой палец позволяет хватать предметы."),
    pin: [68, 336],
    to: [100, 330],
  },
  pelvis: {
    name: r("Obręcz miedniczna", "Тазовый пояс"),
    text: r(
      "Dwie kości miedniczne — każda powstała ze zrośnięcia kości biodrowej, kulszowej i łonowej — połączone z kością krzyżową. Przenosi ciężar ciała na kończyny dolne i podpiera narządy jamy brzusznej.",
      "Две тазовые кости — каждая образовалась при срастании подвздошной, седалищной и лобковой костей — соединены с крестцом. Передаёт вес тела на нижние конечности и поддерживает органы брюшной полости.",
    ),
    pin: [300, 316],
    to: [226, 316],
  },
  femur: {
    name: r("Kość udowa", "Бедренная кость"),
    text: r("Najdłuższa i najmocniejsza kość ciała. Jej głowa tworzy z panewką kości miednicznej staw biodrowy.", "Самая длинная и прочная кость тела. Её головка образует с вертлужной впадиной тазовой кости тазобедренный сустав."),
    pin: [68, 410],
    to: [152, 400],
  },
  patella: {
    name: r("Rzepka", "Надколенник"),
    text: r("Kość trzeszczkowa leżąca w ścięgnie mięśnia czworogłowego uda; osłania staw kolanowy od przodu.", "Сесамовидная кость в сухожилии четырёхглавой мышцы бедра; защищает коленный сустав спереди."),
    pin: [300, 436],
    to: [202, 458],
  },
  shin: {
    name: r("Kości podudzia", "Кости голени"),
    text: r("Kość piszczelowa (grubsza, od strony przyśrodkowej) i strzałkowa (cienka, od strony bocznej). Piszczel przenosi ciężar ciała na stopę.", "Большеберцовая кость (толще, с внутренней стороны) и малоберцовая (тонкая, с наружной стороны). Большеберцовая передаёт вес тела на стопу."),
    pin: [68, 488],
    to: [156, 492],
  },
  foot: {
    name: r("Kości stopy", "Кости стопы"),
    text: r("Kości stępu (7), śródstopia (5) i paliczki (14). Tworzą łuki — wysklepienie stopy, które amortyzuje wstrząsy podczas chodzenia.", "Кости предплюсны (7), плюсны (5) и фаланги (14). Образуют своды стопы, смягчающие толчки при ходьбе."),
    pin: [300, 520],
    to: [214, 528],
  },
};

/** a limb bone drawn as a two-tone stroke */
function Rod({ d, w, fill }: { d: string; w: number; fill: string }) {
  return (
    <>
      <path d={d} fill="none" stroke={BONE_EDGE} strokeWidth={w + 2.5} strokeLinecap="round" />
      <path d={d} fill="none" stroke={fill} strokeWidth={w} strokeLinecap="round" />
    </>
  );
}

/** the same path on both sides of the body */
const both = (d: string) => [d, d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x: string, y: string) => `${360 - Number(x)} ${y}`)];

function SkeletonMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<SkelPart>
      lang={lang}
      parts={SKEL}
      viewBox="0 0 360 545"
      title={r("Szkielet człowieka — widok z przodu", "Скелет человека — вид спереди")}
      labelOrder={["skull", "spine", "chest", "shoulder", "humerus", "forearm", "hand", "pelvis", "femur", "patella", "shin", "foot"]}
      pinRadius={12}
      maxWidth="max-w-[380px]"
      art={({ part, tone }) => (
        <>
          {part(
            "spine",
            <g fill={tone("spine", BONE)} stroke={BONE_EDGE} strokeWidth={1.2}>
              {Array.from({ length: 25 }, (_, k) => (
                <rect key={k} x={174 - (k > 18 ? 2 : 0)} y={92 + k * 8.6} width={12 + (k > 18 ? 4 : 0)} height={7} rx={2} />
              ))}
              <path d="M168 302 L 192 302 L 180 342 Z" />
            </g>,
          )}
          {part(
            "pelvis",
            <g>
              <path
                d="M172 300 C 160 296, 132 290, 128 312 C 126 330, 140 350, 160 354 L 172 348 L 180 352 L 188 348 L 200 354 C 220 350, 234 330, 232 312 C 228 290, 200 296, 188 300 L 180 336 Z"
                fill={tone("pelvis", BONE)}
                stroke={BONE_EDGE}
                strokeWidth={2}
              />
              <ellipse cx={160} cy={338} rx={7} ry={5} fill="#f1f5f9" />
              <ellipse cx={200} cy={338} rx={7} ry={5} fill="#f1f5f9" />
            </g>,
          )}
          {part(
            "chest",
            <g>
              {Array.from({ length: 10 }, (_, i) => {
                const y = 120 + i * 9.5;
                const w = 34 + i * 3.4;
                return both(`M176 ${y} Q ${180 - w - 8} ${y + 1} ${186 - w} ${y + 26}`).map((d, s) => <Rod key={`${i}${s}`} d={d} w={3.2} fill={tone("chest", BONE)} />);
              })}
              <rect x={175} y={114} width={10} height={74} rx={4} fill={tone("chest", BONE)} stroke={BONE_EDGE} strokeWidth={1.5} />
            </g>,
          )}
          {part(
            "skull",
            <g>
              <ellipse cx={180} cy={46} rx={30} ry={34} fill={tone("skull", BONE)} stroke={BONE_EDGE} strokeWidth={2} />
              <path d="M160 64 Q 162 92 180 96 Q 198 92 200 64 Z" fill={tone("skull", BONE)} stroke={BONE_EDGE} strokeWidth={2} />
              <ellipse cx={169} cy={50} rx={7} ry={6} fill="#57534e" />
              <ellipse cx={191} cy={50} rx={7} ry={6} fill="#57534e" />
              <path d="M180 58 L 176 68 L 184 68 Z" fill="#57534e" />
              <path d="M168 82 L 192 82" stroke="#a8a29e" strokeWidth={2} />
            </g>,
          )}
          {part(
            "shoulder",
            <g>
              {both("M140 114 L 150 120 L 144 160 Z").map((d) => (
                <path key={d} d={d} fill={tone("shoulder", "#ece4d0")} stroke={BONE_EDGE} strokeWidth={1.5} />
              ))}
              {both("M174 110 L 134 106").map((d) => (
                <Rod key={d} d={d} w={5} fill={tone("shoulder", BONE)} />
              ))}
            </g>,
          )}
          {part(
            "humerus",
            <g>
              {both("M128 118 L 114 220").map((d) => (
                <Rod key={d} d={d} w={8} fill={tone("humerus", BONE)} />
              ))}
              {both("M130 116 L 130 116").map((d) => (
                <Rod key={d} d={d} w={14} fill={tone("humerus", BONE)} />
              ))}
            </g>,
          )}
          {part(
            "forearm",
            <g>
              {both("M110 228 L 100 304").map((d) => (
                <Rod key={d} d={d} w={4.5} fill={tone("forearm", BONE)} />
              ))}
              {both("M120 228 L 112 304").map((d) => (
                <Rod key={d} d={d} w={5.5} fill={tone("forearm", BONE)} />
              ))}
            </g>,
          )}
          {part(
            "hand",
            <g>
              {both("M106 312 L 106 312").map((d) => (
                <Rod key={d} d={d} w={16} fill={tone("hand", BONE)} />
              ))}
              {[0, 1, 2, 3, 4].map((i) =>
                both(`M${99 + i * 3.5} 322 L ${90 + i * 6} ${i === 0 || i === 4 ? 344 : 352}`).map((d) => <Rod key={`${i}${d}`} d={d} w={2.5} fill={tone("hand", BONE)} />),
              )}
            </g>,
          )}
          {part(
            "femur",
            <g>
              {both("M144 338 L 164 450").map((d) => (
                <Rod key={d} d={d} w={10} fill={tone("femur", BONE)} />
              ))}
              {both("M144 336 L 154 328").map((d) => (
                <Rod key={d} d={d} w={9} fill={tone("femur", BONE)} />
              ))}
            </g>,
          )}
          {part(
            "patella",
            <g>
              {both("M164 458 L 164 458").map((d) => (
                <Rod key={d} d={d} w={11} fill={tone("patella", "#ece4d0")} />
              ))}
            </g>,
          )}
          {part(
            "shin",
            <g>
              {both("M162 470 L 160 518").map((d) => (
                <Rod key={d} d={d} w={8} fill={tone("shin", BONE)} />
              ))}
              {both("M150 472 L 151 516").map((d) => (
                <Rod key={d} d={d} w={3.5} fill={tone("shin", BONE)} />
              ))}
            </g>,
          )}
          {part(
            "foot",
            <g>
              {both("M146 526 L 166 526").map((d) => (
                <Rod key={d} d={d} w={10} fill={tone("foot", BONE)} />
              ))}
              {both("M138 534 L 168 534").map((d) => (
                <Rod key={d} d={d} w={6} fill={tone("foot", BONE)} />
              ))}
            </g>,
          )}
          <text x={180} y={8} fontSize={9} fill="#94a3b8" textAnchor="middle" pointerEvents="none">
            {lang === "pl" ? "← strona prawa · strona lewa →" : "← правая сторона · левая сторона →"}
          </text>
        </>
      )}
    />
  );
}

// ---------- spine ----------

type Region = "cervical" | "thoracic" | "lumbar" | "sacral" | "coccygeal";

const REGIONS: { id: Region; name: Txt; n: number; from: number; to: number; width: [number, number]; color: string; curve: Txt; text: Txt; fused?: boolean }[] = [
  {
    id: "cervical",
    name: r("Odcinek szyjny", "Шейный отдел"),
    n: 7,
    from: 0,
    to: 0.18,
    width: [15, 17],
    color: "#38bdf8",
    curve: r("lordoza szyjna", "шейный лордоз"),
    text: r(
      "7 kręgów. Pierwszy — kręg szczytowy — dźwiga czaszkę i pozwala kiwać głową; drugi — kręg obrotowy — pozwala obracać głową. Lordoza szyjna kształtuje się, gdy niemowlę zaczyna unosić głowę.",
      "7 позвонков. Первый — атлант — несёт череп и позволяет кивать головой; второй — осевой позвонок — позволяет поворачивать голову. Шейный лордоз формируется, когда младенец начинает держать голову.",
    ),
  },
  {
    id: "thoracic",
    name: r("Odcinek piersiowy", "Грудной отдел"),
    n: 12,
    from: 0.18,
    to: 0.56,
    width: [18, 22],
    color: "#a78bfa",
    curve: r("kifoza piersiowa", "грудной кифоз"),
    text: r("12 kręgów, do których przyczepiają się żebra. Razem z nimi i mostkiem tworzą klatkę piersiową; to najmniej ruchomy odcinek.", "12 позвонков, к которым прикрепляются рёбра. Вместе с рёбрами и грудиной образуют грудную клетку; это наименее подвижный отдел."),
  },
  {
    id: "lumbar",
    name: r("Odcinek lędźwiowy", "Поясничный отдел"),
    n: 5,
    from: 0.56,
    to: 0.76,
    width: [24, 27],
    color: "#34d399",
    curve: r("lordoza lędźwiowa", "поясничный лордоз"),
    text: r(
      "5 największych kręgów — dźwigają największy ciężar, dlatego najczęściej bolą. Lordoza lędźwiowa kształtuje się, gdy dziecko zaczyna stać i chodzić.",
      "5 самых крупных позвонков — несут наибольшую нагрузку, поэтому чаще всего болят. Поясничный лордоз формируется, когда ребёнок начинает стоять и ходить.",
    ),
  },
  {
    id: "sacral",
    name: r("Odcinek krzyżowy", "Крестцовый отдел"),
    n: 5,
    from: 0.76,
    to: 0.93,
    width: [24, 12],
    color: "#fbbf24",
    curve: r("kifoza krzyżowa", "крестцовый кифоз"),
    text: r("5 kręgów zrośniętych w kość krzyżową (kościozrost). Łączy się z kośćmi miednicznymi i przenosi na nie ciężar tułowia.", "5 позвонков, сросшихся в крестец (синостоз). Соединяется с тазовыми костями и передаёт на них вес туловища."),
    fused: true,
  },
  {
    id: "coccygeal",
    name: r("Odcinek guziczny", "Копчиковый отдел"),
    n: 4,
    from: 0.93,
    to: 1,
    width: [9, 6],
    color: "#fb7185",
    curve: r("—", "—"),
    text: r("4–5 szczątkowych kręgów zrośniętych w kość guziczną — pozostałość ogona.", "4–5 рудиментарных позвонков, сросшихся в копчик, — остаток хвоста."),
    fused: true,
  },
];

const SPINE_CTRL: [number, number][] = [
  [104, 52],
  [114, 82],
  [108, 112],
  [90, 160],
  [94, 200],
  [112, 238],
  [112, 262],
  [100, 292],
  [90, 318],
  [94, 336],
];

/** a Catmull–Rom curve through the control points, resampled evenly by arc length */
function sampleSpine(count: number): { x: number; y: number; a: number }[] {
  const dense: [number, number][] = [];
  for (let i = 0; i < SPINE_CTRL.length - 1; i++) {
    const p0 = SPINE_CTRL[Math.max(0, i - 1)]!;
    const p1 = SPINE_CTRL[i]!;
    const p2 = SPINE_CTRL[i + 1]!;
    const p3 = SPINE_CTRL[Math.min(SPINE_CTRL.length - 1, i + 2)]!;
    for (let k = 0; k < 20; k++) {
      const t = k / 20;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  dense.push(SPINE_CTRL[SPINE_CTRL.length - 1]!);
  const lens = [0];
  for (let i = 1; i < dense.length; i++) lens.push(lens[i - 1]! + Math.hypot(dense[i]![0] - dense[i - 1]![0], dense[i]![1] - dense[i - 1]![1]));
  const total = lens[lens.length - 1]!;
  return Array.from({ length: count }, (_, k) => {
    const target = (k / (count - 1)) * total;
    let i = lens.findIndex((l) => l >= target);
    if (i <= 0) i = 1;
    const p = dense[i]!;
    const q = dense[i - 1]!;
    return { x: p[0], y: p[1], a: (Math.atan2(p[1] - q[1], p[0] - q[0]) * 180) / Math.PI };
  });
}

const SPINE_PTS = sampleSpine(201);

function Spine({ lang }: { lang: BioLang }) {
  const [sel, setSel] = useState<Region>("lumbar");
  const [curves, setCurves] = useState(true);
  const region = REGIONS.find((g) => g.id === sel)!;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 240 350" className="mx-auto w-full max-w-[300px] select-none" role="img" aria-label={T.s4[lang]}>
        <rect width={240} height={350} rx={12} fill="#f8fafc" />
        <circle cx={118} cy={26} r={24} fill="#e2e8f0" />
        <text x={226} y={20} textAnchor="end" fontSize={10} fill="#64748b">
          {lang === "pl" ? "przód →" : "перед →"}
        </text>
        {REGIONS.map((g) => {
          const on = g.id === sel;
          const pick = () => setSel(g.id);
          return (
            <g
              key={g.id}
              role="button"
              tabIndex={0}
              aria-label={g.name[lang]}
              aria-pressed={on}
              onClick={pick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pick();
                }
              }}
              className="cursor-pointer outline-none"
            >
              {Array.from({ length: g.n }, (_, k) => {
                const f = g.from + ((k + 0.5) / g.n) * (g.to - g.from);
                const p = SPINE_PTS[Math.round(f * 200)]!;
                const w = g.width[0] + ((g.width[1] - g.width[0]) * k) / Math.max(1, g.n - 1);
                const h = ((g.to - g.from) * 290) / g.n - (g.fused ? 0 : 2.2);
                return (
                  <rect
                    key={k}
                    x={p.x - w / 2}
                    y={p.y - h / 2}
                    width={w}
                    height={h}
                    rx={g.fused ? 1 : 2.5}
                    fill={on ? g.color : "#f5efe0"}
                    stroke={on ? "#0f172a" : BONE_EDGE}
                    strokeWidth={on ? 1.2 : 1}
                    transform={`rotate(${p.a - 90} ${p.x} ${p.y})`}
                  />
                );
              })}
            </g>
          );
        })}
        {curves &&
          REGIONS.filter((g) => g.id !== "coccygeal").map((g) => {
            const p = SPINE_PTS[Math.round(((g.from + g.to) / 2) * 200)]!;
            const lordosis = g.id === "cervical" || g.id === "lumbar";
            return (
              <text key={g.id} x={140} y={p.y + 3} fontSize={9.5} fontWeight={600} fill={lordosis ? "#0369a1" : "#7c3aed"} pointerEvents="none">
                {g.curve[lang]}
              </text>
            );
          })}
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((g) => (
            <Choice key={g.id} state={g.id === sel ? "active" : "idle"} onClick={() => setSel(g.id)}>
              {g.name[lang]}
            </Choice>
          ))}
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <h3 className="text-base font-semibold text-emerald-900">
            {region.name[lang]} · {region.id === "coccygeal" ? "4–5" : region.n}
          </h3>
          {region.id !== "coccygeal" && <p className="mt-1 text-sm font-medium text-emerald-800">{region.curve[lang]}</p>}
          <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{region.text[lang]}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={curves} onChange={(e) => setCurves(e.target.checked)} className="h-4 w-4 accent-sky-600" />
          {lang === "pl" ? "Pokaż nazwy krzywizn" : "Показать названия изгибов"}
        </label>
        <p className="text-sm leading-relaxed text-slate-600">
          {lang === "pl"
            ? "Lordoza — wygięcie ku przodowi, kifoza — ku tyłowi. Dzięki krzywiznom kręgosłup działa jak sprężyna i amortyzuje wstrząsy przy chodzeniu i skakaniu."
            : "Лордоз — изгиб вперёд, кифоз — назад. Благодаря изгибам позвоночник работает как пружина и смягчает толчки при ходьбе и прыжках."}
        </p>
      </div>
    </div>
  );
}

// ---------- axial or limb ----------

const AXIAL_OR_LIMB: SortItem[] = [
  { name: r("żuchwa", "нижняя челюсть"), group: 0, why: r("należy do trzewioczaszki", "относится к лицевому отделу черепа") },
  { name: r("łopatka", "лопатка"), group: 1, why: r("część obręczy barkowej", "часть плечевого пояса") },
  { name: r("mostek", "грудина"), group: 0, why: r("część klatki piersiowej", "часть грудной клетки") },
  { name: r("kość miedniczna", "тазовая кость"), group: 1, why: r("tworzy obręcz miedniczną", "образует тазовый пояс") },
  { name: r("kość krzyżowa", "крестец"), group: 0, why: r("to zrośnięte kręgi — część kręgosłupa", "это сросшиеся позвонки — часть позвоночника") },
  { name: r("obojczyk", "ключица"), group: 1, why: r("część obręczy barkowej", "часть плечевого пояса") },
  { name: r("żebra", "рёбра"), group: 0, why: r("część klatki piersiowej", "часть грудной клетки") },
  { name: r("rzepka", "надколенник"), group: 1, why: r("kość kończyny dolnej, w ścięgnie przy kolanie", "кость нижней конечности, в сухожилии у колена") },
  { name: r("kręg szczytowy", "атлант"), group: 0, why: r("pierwszy kręg szyjny", "первый шейный позвонок") },
  { name: r("kości nadgarstka", "кости запястья"), group: 1, why: r("część szkieletu ręki", "часть скелета кисти") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4" | "s5", Txt[]> = {
  s1: [
    { pl: "Kość długa: nasady z istotą gąbczastą (szpik czerwony) i trzon z istoty zbitej z jamą szpikową (u dorosłych szpik żółty).", ru: "Длинная кость: эпифизы из губчатого вещества (красный костный мозг) и диафиз из компактного вещества с костномозговой полостью (у взрослых жёлтый мозг)." },
    { pl: "Na długość kość rośnie dzięki chrząstce nasadowej, na grubość — dzięki okostnej.", ru: "В длину кость растёт за счёт эпифизарной пластинки, в толщину — за счёт надкостницы." },
    { pl: "Osteoblasty budują kość, osteoklasty ją niszczą, osteocyty to dojrzałe komórki kostne — kość stale się przebudowuje.", ru: "Остеобласты строят кость, остеокласты её разрушают, остеоциты — зрелые костные клетки; кость постоянно перестраивается." },
  ],
  s2: [
    { pl: "Sole wapnia i fosforu (ok. 2/3 suchej masy) dają kości twardość, osseina (ok. 1/3) — sprężystość.", ru: "Соли кальция и фосфора (около 2/3 сухой массы) придают кости твёрдость, оссеин (около 1/3) — упругость." },
    { pl: "Kość wyprażona traci osseinę i jest krucha; kość odwapniona traci sole i jest giętka.", ru: "Прокалённая кость теряет оссеин и становится хрупкой; декальцинированная теряет соли и становится гибкой." },
  ],
  s3: [
    { pl: "Szkielet osiowy: czaszka, kręgosłup, klatka piersiowa. Szkielet kończyn: kończyny z obręczą barkową i miedniczną.", ru: "Осевой скелет: череп, позвоночник, грудная клетка. Скелет конечностей: конечности с плечевым и тазовым поясами." },
    { pl: "Kość udowa to najdłuższa i najmocniejsza kość człowieka.", ru: "Бедренная кость — самая длинная и прочная кость человека." },
  ],
  s4: [
    { pl: "Kręgosłup: 7 szyjnych, 12 piersiowych, 5 lędźwiowych, 5 krzyżowych (kość krzyżowa), 4–5 guzicznych — razem 33–34 kręgi.", ru: "Позвоночник: 7 шейных, 12 грудных, 5 поясничных, 5 крестцовых (крестец), 4–5 копчиковых — всего 33–34 позвонка." },
    { pl: "Lordozy (szyjna, lędźwiowa) i kifozy (piersiowa, krzyżowa) amortyzują wstrząsy.", ru: "Лордозы (шейный, поясничный) и кифозы (грудной, крестцовый) смягчают толчки." },
  ],
  s5: [{ pl: "Obręcze należą do szkieletu kończyn, choć łączą kończyny ze szkieletem osiowym.", ru: "Пояса относятся к скелету конечностей, хотя соединяют конечности с осевым скелетом." }],
};

export default function SkeletonLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="skel" sections={[T.s1, T.s2, T.s3, T.s4, T.s5]} />
      <Section id="skel-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <LongBoneMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="skel-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <BoneExperiment lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="skel-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <SkeletonMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="skel-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Spine lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
      <Section id="skel-s5" n={5} title={T.s5[lang]}>
        <TwoWaySort
          lang={lang}
          title={T.s5}
          hint={r("Do której części szkieletu należy ta kość?", "К какой части скелета относится эта кость?")}
          groups={[r("szkielet osiowy", "осевой скелет"), r("szkielet kończyn", "скелет конечностей")]}
          items={AXIAL_OR_LIMB}
        />
        <Remember lang={lang} items={REMEMBER.s5} />
      </Section>
    </div>
  );
}
