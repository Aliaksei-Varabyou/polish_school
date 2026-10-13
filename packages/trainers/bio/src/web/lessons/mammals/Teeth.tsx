// Block 2 of the mammals lesson: teeth tell what an animal eats. Four lower jaws side by side, each
// tooth coloured by its kind, with the reason for each shape.
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import type { Txt } from "../kit.tsx";

type Kind = "incisor" | "canine" | "premolar" | "molar";

const KINDS: Record<Kind, { name: Txt; color: string }> = {
  incisor: { name: { pl: "siekacze", ru: "резцы" }, color: "#38bdf8" },
  canine: { name: { pl: "kły", ru: "клыки" }, color: "#f43f5e" },
  premolar: { name: { pl: "przedtrzonowce", ru: "малые коренные" }, color: "#f59e0b" },
  molar: { name: { pl: "trzonowce", ru: "большие коренные" }, color: "#22c55e" },
};

/** one tooth standing on the jaw line at y=80: x is its left edge */
interface Tooth {
  kind: Kind;
  x: number;
  w: number;
  /** tooth outline above the gum, drawn from (x,80) */
  shape: "flat" | "point" | "blade" | "ridged" | "bumps" | "chisel";
  h: number;
}

function toothPath({ x, w, h, shape }: Tooth): string {
  const top = 80 - h;
  switch (shape) {
    case "point":
      return `M${x} 80 L ${x + w / 2} ${top} L ${x + w} 80 Z`;
    case "blade":
      return `M${x} 80 L ${x + w * 0.25} ${top + 6} L ${x + w * 0.5} ${top + 14} L ${x + w * 0.75} ${top} L ${x + w} 80 Z`;
    case "ridged":
      return `M${x} 80 L ${x} ${top} L ${x + w * 0.25} ${top + 4} L ${x + w * 0.5} ${top} L ${x + w * 0.75} ${top + 4} L ${x + w} ${top} L ${x + w} 80 Z`;
    case "bumps":
      return `M${x} 80 L ${x} ${top + 4} Q ${x + w * 0.25} ${top - 3} ${x + w * 0.5} ${top + 4} Q ${x + w * 0.75} ${top - 3} ${x + w} ${top + 4} L ${x + w} 80 Z`;
    case "chisel":
      return `M${x} 80 C ${x - 4} ${top + 20}, ${x - 2} ${top + 6}, ${x + 4} ${top} L ${x + w} ${top + 4} C ${x + w} ${top + 20}, ${x + w + 2} 70, ${x + w} 80 Z`;
    default:
      return `M${x} 80 L ${x} ${top + 2} Q ${x + w / 2} ${top - 2} ${x + w} ${top + 2} L ${x + w} 80 Z`;
  }
}

interface Animal {
  id: string;
  icon: string;
  name: Txt;
  diet: Txt;
  text: Txt;
  teeth: Tooth[];
}

const row = (kind: Kind, shape: Tooth["shape"], start: number, n: number, w: number, h: number, gap = 2): Tooth[] =>
  Array.from({ length: n }, (_, i) => ({ kind, shape, x: start + i * (w + gap), w, h }));

const ANIMALS: Animal[] = [
  {
    id: "wolf",
    icon: "🐺",
    name: { pl: "Wilk", ru: "Волк" },
    diet: { pl: "drapieżnik (mięsożerca)", ru: "хищник (плотоядное)" },
    text: {
      pl: "Duże, ostre kły chwytają i przytrzymują ofiarę. Przedtrzonowce i trzonowce mają ostre krawędzie — największe z nich, zęby łamacze, tną mięso i kruszą kości jak nożyce.",
      ru: "Большие острые клыки хватают и удерживают добычу. Малые и большие коренные с острыми краями — самые крупные из них, хищнические зубы, режут мясо и дробят кости, как ножницы.",
    },
    teeth: [...row("incisor", "flat", 20, 3, 7, 12), { kind: "canine", shape: "point", x: 48, w: 14, h: 34 }, ...row("premolar", "point", 70, 4, 14, 16, 4), ...row("molar", "blade", 142, 1, 30, 28), ...row("molar", "bumps", 176, 2, 16, 12, 3)],
  },
  {
    id: "cow",
    icon: "🐄",
    name: { pl: "Krowa", ru: "Корова" },
    diet: { pl: "roślinożerca (przeżuwacz)", ru: "растительноядное (жвачное)" },
    text: {
      pl: "Kłów nie ma, a w górnej szczęce nie ma nawet siekaczy: krowa przyciska trawę dolnymi siekaczami do twardej płytki dziąsła i odrywa ją. Za siekaczami jest przerwa, a dalej szerokie, płaskie trzonowce z listewkami — rozcierają trawę jak żarna.",
      ru: "Клыков нет, а в верхней челюсти нет даже резцов: корова прижимает траву нижними резцами к твёрдой пластинке десны и отрывает её. За резцами промежуток, а дальше широкие плоские коренные зубы с гребнями — перетирают траву, как жернова.",
    },
    teeth: [...row("incisor", "chisel", 14, 4, 8, 14), ...row("premolar", "ridged", 96, 3, 18, 12, 2), ...row("molar", "ridged", 158, 3, 22, 14, 2)],
  },
  {
    id: "beaver",
    icon: "🦫",
    name: { pl: "Bóbr", ru: "Бобр" },
    diet: { pl: "roślinożerca (gryzoń)", ru: "растительноядное (грызун)" },
    text: {
      pl: "Para ogromnych siekaczy rośnie przez całe życie. Z przodu pokrywa je twarde, pomarańczowe szkliwo, więc ścierając się, zostają ostre jak dłuto — bóbr ścina nimi drzewa. Kłów nie ma, a za długą przerwą są płaskie trzonowce.",
      ru: "Пара огромных резцов растёт всю жизнь. Спереди их покрывает твёрдая оранжевая эмаль, поэтому, стачиваясь, они остаются острыми, как долото, — ими бобр валит деревья. Клыков нет, а за длинным промежутком — плоские коренные зубы.",
    },
    teeth: [{ kind: "incisor", shape: "chisel", x: 18, w: 18, h: 40 }, ...row("premolar", "ridged", 110, 1, 18, 12), ...row("molar", "ridged", 130, 3, 18, 12, 2)],
  },
  {
    id: "human",
    icon: "🧒",
    name: { pl: "Człowiek", ru: "Человек" },
    diet: { pl: "wszystkożerca", ru: "всеядное" },
    text: {
      pl: "Mamy wszystkie rodzaje zębów, ale żaden nie jest bardzo wyspecjalizowany: siekacze odgryzają, niewielkie kły pomagają rozrywać, a guzkowate trzonowce rozcierają pokarm roślinny i zwierzęcy.",
      ru: "У нас есть зубы всех видов, но ни один не узкоспециализирован: резцы откусывают, небольшие клыки помогают разрывать, а бугорчатые коренные перетирают и растительную, и животную пищу.",
    },
    teeth: [...row("incisor", "flat", 22, 2, 9, 14), { kind: "canine", shape: "point", x: 46, w: 11, h: 16 }, ...row("premolar", "bumps", 60, 2, 13, 12), ...row("molar", "bumps", 92, 3, 18, 11)],
  },
];

const T = {
  diet: { pl: "Pokarm:", ru: "Питание:" },
  jaw: { pl: "Żuchwa", ru: "Нижняя челюсть" },
} satisfies Record<string, Txt>;

export function Teeth({ lang }: { lang: BioLang }) {
  const [id, setId] = useState("wolf");
  const animal = ANIMALS.find((a) => a.id === id)!;
  const kinds = new Set(animal.teeth.map((t) => t.kind));
  const jaw = (
    <svg viewBox="0 0 230 110" className="w-full" role="img" aria-label={`${T.jaw[lang]}: ${animal.name[lang]}`}>
      <rect width={230} height={110} rx={10} fill="#f8fafc" />
      {animal.teeth.map((t, i) => (
        <path key={i} d={toothPath(t)} fill={id === "beaver" && t.kind === "incisor" ? "#fb923c" : KINDS[t.kind].color} stroke="#334155" strokeWidth={1} strokeLinejoin="round" />
      ))}
      <path d="M8 80 L 222 80 L 222 92 C 180 104, 60 104, 14 96 C 8 94, 6 86, 8 80 Z" fill="#fecaca" stroke="#be123c" strokeWidth={1.2} />
      <text x={14} y={20} fontSize={9} fill="#64748b">
        ← {lang === "pl" ? "przód" : "перед"}
      </text>
    </svg>
  );
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup">
        {ANIMALS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={a.id === id}
            onClick={() => setId(a.id)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              a.id === id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
            }`}
          >
            {a.icon} {a.name[lang]}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          {jaw}
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {(Object.keys(KINDS) as Kind[]).map((k) => (
              <li key={k} className={`flex items-center gap-1.5 ${kinds.has(k) ? "text-slate-700" : "text-slate-400 line-through"}`}>
                <span className="h-3 w-3 rounded-sm" style={{ background: KINDS[k].color }} />
                {KINDS[k].name[lang]}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <h3 className="text-base font-semibold text-emerald-900">
            {animal.icon} {animal.name[lang]}
          </h3>
          <p className="mt-1 text-sm text-emerald-800">
            <span className="font-semibold">{T.diet[lang]}</span> {animal.diet[lang]}
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-950">{animal.text[lang]}</p>
        </div>
      </div>
    </div>
  );
}
