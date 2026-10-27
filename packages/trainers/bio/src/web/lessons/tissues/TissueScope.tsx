// Block 1 of the tissues lesson: a microscope. Each tissue gets its own "slide" drawn the way it
// looks under a school microscope, with what it is made of, where it is and what it does.
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../lang.ts";
import type { Txt } from "@portal/lessons";

type Group = "epithelial" | "muscle" | "nerve" | "connective";

interface Tissue {
  id: string;
  group: Group;
  name: Txt;
  where: Txt;
  does: Txt;
  slide: ReactNode;
}

export const GROUPS: Record<Group, Txt> = {
  epithelial: { pl: "nabłonkowa", ru: "эпителиальная" },
  muscle: { pl: "mięśniowa", ru: "мышечная" },
  nerve: { pl: "nerwowa", ru: "нервная" },
  connective: { pl: "łączna", ru: "соединительная" },
};

// ---------- slides (viewBox 0 0 200 200, clipped to the eyepiece) ----------

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const EPITHELIUM = (
  <g>
    <rect width={200} height={200} fill="#fce7f3" />
    {range(9).flatMap((r) =>
      range(8).map((c) => {
        const x = c * 28 + (r % 2 ? 14 : 0) - 6;
        const y = r * 24 - 4;
        return (
          <g key={`${r}-${c}`}>
            <path d={`M${x} ${y + 8} L ${x + 14} ${y} L ${x + 28} ${y + 8} L ${x + 28} ${y + 22} L ${x + 14} ${y + 30} L ${x} ${y + 22} Z`} fill="#fbcfe8" stroke="#be185d" strokeWidth={1.2} />
            <circle cx={x + 14} cy={y + 15} r={4.5} fill="#7e22ce" />
          </g>
        );
      }),
    )}
  </g>
);

const SMOOTH = (
  <g>
    <rect width={200} height={200} fill="#fee2e2" />
    {range(10).flatMap((r) =>
      range(4).map((c) => {
        const x = c * 60 + (r % 2 ? 30 : 0) - 20;
        const y = r * 20 + 4;
        return (
          <g key={`${r}-${c}`}>
            <path d={`M${x} ${y + 8} Q ${x + 30} ${y - 4} ${x + 60} ${y + 8} Q ${x + 30} ${y + 20} ${x} ${y + 8} Z`} fill="#fca5a5" stroke="#b91c1c" strokeWidth={1} />
            <ellipse cx={x + 30} cy={y + 8} rx={8} ry={2.6} fill="#7e22ce" />
          </g>
        );
      }),
    )}
  </g>
);

const SKELETAL = (
  <g>
    <rect width={200} height={200} fill="#fee2e2" />
    {range(5).map((r) => {
      const y = r * 40 + 6;
      return (
        <g key={r}>
          <rect x={-4} y={y} width={208} height={32} rx={6} fill="#f87171" stroke="#991b1b" strokeWidth={1.2} />
          {range(52).map((i) => (
            <path key={i} d={`M${i * 4} ${y + 2} L ${i * 4} ${y + 30}`} stroke="#991b1b" strokeWidth={i % 2 ? 0.6 : 1.4} opacity={0.6} />
          ))}
          {[30, 90, 150].map((x) => (
            <ellipse key={x} cx={x + r * 7} cy={y + 4} rx={7} ry={2.4} fill="#7e22ce" />
          ))}
        </g>
      );
    })}
  </g>
);

const CARDIAC = (
  <g>
    <rect width={200} height={200} fill="#fee2e2" />
    {range(5).map((r) => {
      const y = r * 40 + 10;
      return (
        <g key={r}>
          <path d={`M-4 ${y} L 204 ${y} L 204 ${y + 22} L -4 ${y + 22} Z`} fill="#f87171" stroke="#991b1b" strokeWidth={1} />
          {range(52).map((i) => (
            <path key={i} d={`M${i * 4} ${y + 1} L ${i * 4} ${y + 21}`} stroke="#991b1b" strokeWidth={0.8} opacity={0.5} />
          ))}
          {[44, 124].map((x) => (
            <path key={x} d={`M${x + r * 6} ${y + 22} L ${x + r * 6 + 14} ${y + 40}`} stroke="#f87171" strokeWidth={14} />
          ))}
          {[20, 80, 140].map((x) => (
            <g key={x}>
              <path d={`M${x + r * 9} ${y} L ${x + r * 9} ${y + 22}`} stroke="#450a0a" strokeWidth={2.5} />
              <ellipse cx={x + r * 9 + 26} cy={y + 11} rx={6} ry={3} fill="#7e22ce" />
            </g>
          ))}
        </g>
      );
    })}
  </g>
);

const NERVE = (
  <g>
    <rect width={200} height={200} fill="#ecfeff" />
    {[
      [30, 30], [170, 40], [160, 170], [40, 160], [100, 20], [20, 100],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill="#a5b4fc" />
    ))}
    <g stroke="#4338ca" strokeLinecap="round" fill="none">
      <path d="M78 92 L 40 60 L 26 40 M40 60 L 20 64 M74 104 L 30 112 L 14 104 M30 112 L 20 128 M86 82 L 76 40 L 60 20 M76 40 L 90 18 M96 84 L 116 46 L 132 30" strokeWidth={3} />
      <path d="M104 104 C 130 120, 150 140, 168 168 L 180 176 M168 168 L 170 186 M168 168 L 186 162" strokeWidth={4} />
    </g>
    <circle cx={90} cy={96} r={18} fill="#818cf8" stroke="#4338ca" strokeWidth={2} />
    <circle cx={90} cy={96} r={7} fill="#3730a3" />
  </g>
);

const BONE = (
  <g>
    <rect width={200} height={200} fill="#fef3c7" />
    {[
      [60, 64],
      [148, 92],
      [76, 158],
    ].map(([x, y]) => (
      <g key={`${x}-${y}`}>
        {[46, 36, 26, 16].map((r) => (
          <circle key={r} cx={x} cy={y} r={r} fill="none" stroke="#d97706" strokeWidth={1.4} />
        ))}
        <circle cx={x} cy={y} r={7} fill="#fecaca" stroke="#b45309" strokeWidth={1.5} />
        {range(10).map((i) => {
          const a = (i / 10) * Math.PI * 2;
          const r = i % 2 ? 31 : 21;
          return <ellipse key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r} rx={3} ry={1.6} fill="#78350f" transform={`rotate(${(a * 180) / Math.PI + 90} ${x + Math.cos(a) * r} ${y + Math.sin(a) * r})`} />;
        })}
      </g>
    ))}
  </g>
);

const CARTILAGE = (
  <g>
    <rect width={200} height={200} fill="#dbeafe" />
    {[
      [30, 30, 2], [90, 40, 1], [150, 28, 2], [56, 90, 1], [124, 96, 2], [180, 110, 1], [28, 150, 2], [92, 160, 1], [154, 168, 2], [110, 56, 1],
    ].map(([x, y, n]) => (
      <g key={`${x}-${y}`}>
        <ellipse cx={x} cy={y} rx={n === 2 ? 16 : 10} ry={10} fill="white" stroke="#93c5fd" strokeWidth={1.5} />
        {range(n!).map((i) => (
          <circle key={i} cx={x! + (n === 2 ? (i ? 6 : -6) : 0)} cy={y} r={5} fill="#a78bfa" stroke="#6d28d9" strokeWidth={1} />
        ))}
      </g>
    ))}
  </g>
);

const FAT = (
  <g>
    <rect width={200} height={200} fill="#fef9c3" />
    {range(5).flatMap((r) =>
      range(5).map((c) => {
        const x = c * 44 + (r % 2 ? 22 : 0) - 4;
        const y = r * 42 + 12;
        return (
          <g key={`${r}-${c}`}>
            <circle cx={x} cy={y} r={21} fill="#fefce8" stroke="#ca8a04" strokeWidth={1.4} />
            <ellipse cx={x - 16} cy={y + 8} rx={3} ry={5} fill="#7e22ce" transform={`rotate(30 ${x - 16} ${y + 8})`} />
          </g>
        );
      }),
    )}
  </g>
);

const FIBROUS = (
  <g>
    <rect width={200} height={200} fill="#fef2f2" />
    {range(14).map((i) => (
      <path key={i} d={`M-10 ${i * 15 + 4} C 40 ${i * 15 - 2}, 80 ${i * 15 + 10}, 120 ${i * 15 + 4} S 190 ${i * 15 - 2}, 210 ${i * 15 + 6}`} fill="none" stroke="#f9a8d4" strokeWidth={9} />
    ))}
    {[
      [40, 34], [130, 64], [70, 110], [160, 140], [30, 170], [110, 184],
    ].map(([x, y]) => (
      <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={9} ry={2.4} fill="#7e22ce" />
    ))}
  </g>
);

export const BLOOD_SLIDE = (
  <g>
    <rect width={200} height={200} fill="#fef3c7" />
    {[
      [24, 30], [62, 18], [104, 34], [150, 22], [184, 50], [30, 76], [72, 64], [128, 70], [170, 96], [20, 124], [60, 112], [104, 120], [146, 136], [184, 150], [36, 168], [80, 160], [120, 176], [162, 184], [96, 92], [48, 196],
    ].map(([x, y]) => (
      <g key={`${x}-${y}`}>
        <circle cx={x} cy={y} r={13} fill="#ef4444" />
        <circle cx={x} cy={y} r={5.5} fill="#fca5a5" />
      </g>
    ))}
    {[
      [150, 52],
      [56, 140],
    ].map(([x, y]) => (
      <g key={`${x}-${y}`}>
        <circle cx={x} cy={y} r={17} fill="#ede9fe" stroke="#a78bfa" strokeWidth={1.5} />
        <path d={`M${x - 9} ${y - 2} q 4 -8 9 -2 q 5 -7 9 2 q -2 8 -9 5 q -7 4 -9 -5 Z`} fill="#6d28d9" />
      </g>
    ))}
    {[
      [118, 150], [88, 40], [176, 122], [40, 100], [136, 102],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={2.6} fill="#a855f7" />
    ))}
  </g>
);

const TISSUES: Tissue[] = [
  {
    id: "epithelial",
    group: "epithelial",
    name: { pl: "Tkanka nabłonkowa", ru: "Эпителиальная ткань" },
    where: { pl: "naskórek, wyściółka jamy ustnej, żołądka, jelit, naczyń", ru: "кожа снаружи, выстилка рта, желудка, кишечника, сосудов" },
    does: {
      pl: "Komórki ściśle do siebie przylegają, prawie bez substancji między nimi. Okrywa ciało i wyściela narządy: chroni je przed uszkodzeniem i drobnoustrojami. Nabłonek gruczołowy wytwarza wydzieliny, np. pot, śluz czy enzymy.",
      ru: "Клетки плотно прилегают друг к другу, почти без вещества между ними. Покрывает тело и выстилает органы: защищает их от повреждений и микробов. Железистый эпителий выделяет секреты, например пот, слизь или ферменты.",
    },
    slide: EPITHELIUM,
  },
  {
    id: "smooth",
    group: "muscle",
    name: { pl: "Mięśniowa gładka", ru: "Гладкая мышечная" },
    where: { pl: "ściany żołądka, jelit, pęcherza moczowego, naczyń krwionośnych", ru: "стенки желудка, кишечника, мочевого пузыря, кровеносных сосудов" },
    does: {
      pl: "Wrzecionowate komórki z jednym jądrem. Kurczy się powoli i niezależnie od naszej woli — np. przesuwa pokarm w jelitach.",
      ru: "Веретеновидные клетки с одним ядром. Сокращается медленно и независимо от нашей воли — например, продвигает пищу по кишечнику.",
    },
    slide: SMOOTH,
  },
  {
    id: "skeletal",
    group: "muscle",
    name: { pl: "Mięśniowa szkieletowa", ru: "Скелетная мышечная" },
    where: { pl: "mięśnie przyczepione do kości", ru: "мышцы, прикреплённые к костям" },
    does: {
      pl: "Długie włókna z wieloma jądrami i poprzecznymi prążkami (dlatego „poprzecznie prążkowana”). Kurczy się szybko i zależnie od woli — porusza szkieletem. Szybko się męczy.",
      ru: "Длинные волокна со множеством ядер и поперечной исчерченностью (отсюда «поперечнополосатая»). Сокращается быстро и по нашей воле — двигает скелет. Быстро утомляется.",
    },
    slide: SKELETAL,
  },
  {
    id: "cardiac",
    group: "muscle",
    name: { pl: "Mięśniowa sercowa", ru: "Сердечная мышечная" },
    where: { pl: "tylko serce", ru: "только сердце" },
    does: {
      pl: "Też poprzecznie prążkowana, ale komórki rozgałęziają się i łączą w sieć. Kurczy się rytmicznie przez całe życie, niezależnie od woli i bez zmęczenia.",
      ru: "Тоже поперечнополосатая, но клетки ветвятся и соединяются в сеть. Сокращается ритмично всю жизнь, независимо от воли и без утомления.",
    },
    slide: CARDIAC,
  },
  {
    id: "nerve",
    group: "nerve",
    name: { pl: "Tkanka nerwowa", ru: "Нервная ткань" },
    where: { pl: "mózg, rdzeń kręgowy, nerwy", ru: "головной и спинной мозг, нервы" },
    does: {
      pl: "Zbudowana z neuronów — komórek z długimi wypustkami. Odbiera bodźce i przewodzi impulsy nerwowe, dzięki czemu narządy działają razem.",
      ru: "Состоит из нейронов — клеток с длинными отростками. Воспринимает раздражения и проводит нервные импульсы, благодаря чему органы работают согласованно.",
    },
    slide: NERVE,
  },
  {
    id: "bone",
    group: "connective",
    name: { pl: "Tkanka kostna", ru: "Костная ткань" },
    where: { pl: "kości szkieletu", ru: "кости скелета" },
    does: {
      pl: "Komórki leżą w twardej istocie międzykomórkowej z solami wapnia, ułożonej w koncentryczne pierścienie wokół kanałów z naczyniami. Jest twarda i wytrzymała — podpiera ciało.",
      ru: "Клетки лежат в твёрдом межклеточном веществе с солями кальция, уложенном кольцами вокруг каналов с сосудами. Твёрдая и прочная — служит опорой телу.",
    },
    slide: BONE,
  },
  {
    id: "cartilage",
    group: "connective",
    name: { pl: "Tkanka chrzęstna", ru: "Хрящевая ткань" },
    where: { pl: "małżowina uszna, nos, powierzchnie stawowe", ru: "ушная раковина, нос, суставные поверхности" },
    does: {
      pl: "Nieliczne komórki leżą w jamkach w gładkiej, sprężystej substancji. Chrząstka jest twarda, ale się ugina — zmniejsza tarcie w stawach.",
      ru: "Немногочисленные клетки лежат в полостях внутри гладкого упругого вещества. Хрящ твёрдый, но гнётся — уменьшает трение в суставах.",
    },
    slide: CARTILAGE,
  },
  {
    id: "fibrous",
    group: "connective",
    name: { pl: "Łączna włóknista", ru: "Волокнистая соединительная" },
    where: { pl: "ścięgna i więzadła", ru: "сухожилия и связки" },
    does: {
      pl: "Mocne, równoległe włókna i mało komórek. Łączy mięśnie z kośćmi (ścięgna) i kości ze sobą (więzadła).",
      ru: "Прочные параллельные волокна и мало клеток. Соединяет мышцы с костями (сухожилия) и кости между собой (связки).",
    },
    slide: FIBROUS,
  },
  {
    id: "fat",
    group: "connective",
    name: { pl: "Tkanka tłuszczowa", ru: "Жировая ткань" },
    where: { pl: "pod skórą i wokół narządów", ru: "под кожей и вокруг органов" },
    does: {
      pl: "Duże, okrągłe komórki wypełnione kroplą tłuszczu; jądro zepchnięte na brzeg. To magazyn energii, izolacja chroniąca przed zimnem i poduszka osłaniająca narządy.",
      ru: "Крупные круглые клетки, заполненные каплей жира; ядро оттеснено к краю. Это запас энергии, теплоизоляция и подушка, защищающая органы.",
    },
    slide: FAT,
  },
  {
    id: "blood",
    group: "connective",
    name: { pl: "Krew", ru: "Кровь" },
    where: { pl: "serce i naczynia krwionośne", ru: "сердце и кровеносные сосуды" },
    does: {
      pl: "Płynna tkanka łączna: komórki krwi pływają w osoczu. Transportuje tlen, pokarm i zbędne produkty przemiany materii, broni przed drobnoustrojami.",
      ru: "Жидкая соединительная ткань: клетки крови плавают в плазме. Переносит кислород, питательные вещества и продукты обмена, защищает от микробов.",
    },
    slide: BLOOD_SLIDE,
  },
];

const T = {
  where: { pl: "Gdzie występuje:", ru: "Где встречается:" },
  scope: { pl: "Obraz pod mikroskopem", ru: "Вид под микроскопом" },
  pick: { pl: "Wybierz tkankę, żeby położyć jej preparat pod mikroskop.", ru: "Выбери ткань, чтобы положить её препарат под микроскоп." },
} satisfies Record<string, Txt>;

export function TissueScope({ lang }: { lang: BioLang }) {
  const [id, setId] = useState(TISSUES[0]!.id);
  const tissue = TISSUES.find((t) => t.id === id)!;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div>
        <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-[300px]" role="img" aria-label={`${T.scope[lang]}: ${tissue.name[lang]}`}>
          <defs>
            <clipPath id="eyepiece">
              <circle cx={100} cy={100} r={96} />
            </clipPath>
          </defs>
          <circle cx={110} cy={110} r={108} fill="#1e293b" />
          <g transform="translate(10 10)">
            <g clipPath="url(#eyepiece)">{tissue.slide}</g>
            <circle cx={100} cy={100} r={96} fill="none" stroke="#0f172a" strokeWidth={4} />
          </g>
        </svg>
        <p className="mt-2 text-center text-xs text-slate-500">{T.pick[lang]}</p>
      </div>
      <div>
        <div className="space-y-2">
          {(Object.keys(GROUPS) as Group[]).map((g) => (
            <div key={g}>
              <div className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">{GROUPS[g][lang]}</div>
              <div className="flex flex-wrap gap-1.5">
              {TISSUES.filter((t) => t.group === g).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={t.id === id}
                  onClick={() => setId(t.id)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                    t.id === id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {t.name[lang]}
                </button>
              ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <h3 className="text-base font-semibold text-emerald-900">{tissue.name[lang]}</h3>
          <p className="mt-1 text-sm text-emerald-800">
            <span className="font-semibold">{T.where[lang]}</span> {tissue.where[lang]}
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{tissue.does[lang]}</p>
        </div>
      </div>
    </div>
  );
}
