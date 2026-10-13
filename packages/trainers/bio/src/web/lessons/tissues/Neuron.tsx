// Block 2: the neuron. Its parts explain themselves; "send an impulse" runs a spark from a dendrite
// through the cell body and down the axon on the same drawing, showing the direction impulses travel.
import { useState, type ReactNode } from "react";
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "../games.tsx";
import { Choice, type Txt } from "../kit.tsx";

type NeuronPart = "dendrites" | "body" | "nucleus" | "axon" | "terminals";

const PARTS: Record<NeuronPart, MapPart> = {
  dendrites: {
    name: { pl: "Dendryty", ru: "Дендриты" },
    text: {
      pl: "Krótkie, rozgałęzione wypustki. Odbierają sygnały od innych komórek i doprowadzają impulsy do ciała neuronu.",
      ru: "Короткие ветвящиеся отростки. Принимают сигналы от других клеток и проводят импульсы к телу нейрона.",
    },
    pin: [28, 30],
    to: [52, 62],
  },
  body: {
    name: { pl: "Ciało komórki", ru: "Тело клетки" },
    text: {
      pl: "Najszersza część neuronu. Zbiera impulsy z dendrytów i kieruje je do aksonu.",
      ru: "Самая широкая часть нейрона. Собирает импульсы от дендритов и направляет их в аксон.",
    },
    pin: [120, 168],
    to: [118, 124],
  },
  nucleus: {
    name: { pl: "Jądro komórkowe", ru: "Ядро" },
    text: {
      pl: "Jak w każdej komórce, kieruje jej życiem. Leży w ciele neuronu.",
      ru: "Как и в любой клетке, управляет её жизнью. Находится в теле нейрона.",
    },
    pin: [150, 30],
    to: [112, 98],
  },
  axon: {
    name: { pl: "Akson", ru: "Аксон" },
    text: {
      pl: "Jedna długa wypustka, która odprowadza impuls z ciała neuronu — czasem nawet na odległość ponad metra, np. z rdzenia kręgowego do palców stopy.",
      ru: "Один длинный отросток, отводящий импульс от тела нейрона — иногда больше чем на метр, например от спинного мозга к пальцам ноги.",
    },
    pin: [236, 150],
    to: [236, 104],
  },
  terminals: {
    name: { pl: "Zakończenia aksonu", ru: "Окончания аксона" },
    text: {
      pl: "Rozgałęzienia na końcu aksonu. Przekazują impuls dalej — następnemu neuronowi albo komórkom mięśnia, który się wtedy kurczy.",
      ru: "Разветвления на конце аксона. Передают импульс дальше — следующему нейрону или клеткам мышцы, которая тогда сокращается.",
    },
    pin: [372, 24],
    to: [368, 72],
  },
};

const DENDRITES = "M96 84 L 60 60 L 40 34 M60 60 L 30 62 M92 108 L 56 126 L 30 132 M56 126 L 44 154 M104 74 L 92 40 L 74 20 M92 40 L 108 18 M88 96 L 46 96 L 18 88";
const AXON = "M142 100 C 190 96, 250 108, 336 100";
const TERMINALS = "M336 100 L 366 74 M336 100 L 374 100 M336 100 L 366 126";
/** the impulse's route: dendrite tip → body → axon → terminal */
const ROUTE = "M30 62 L 60 60 L 96 84 L 118 100 L 142 100 C 190 96, 250 108, 336 100 L 374 100";

function neuronArt(tone: (id: NeuronPart, base: string) => string, part: (id: NeuronPart, node: ReactNode) => ReactNode) {
  return (
    <>
      {part(
        "dendrites",
        <g fill="none" strokeLinecap="round">
          <path d={DENDRITES} stroke={tone("dendrites", "#6366f1")} strokeWidth={5} />
          <path d={DENDRITES} stroke="transparent" strokeWidth={16} />
        </g>,
      )}
      {part(
        "axon",
        <g fill="none" strokeLinecap="round">
          <path d={AXON} stroke={tone("axon", "#6366f1")} strokeWidth={7} />
          <path d={AXON} stroke="transparent" strokeWidth={22} />
        </g>,
      )}
      {part(
        "terminals",
        <g strokeLinecap="round">
          <path d={TERMINALS} stroke={tone("terminals", "#6366f1")} strokeWidth={4} fill="none" />
          {[
            [366, 74],
            [374, 100],
            [366, 126],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill={tone("terminals", "#818cf8")} />
          ))}
          <path d={TERMINALS} stroke="transparent" strokeWidth={18} fill="none" />
        </g>,
      )}
      {part("body", <circle cx={114} cy={100} r={30} fill={tone("body", "#a5b4fc")} stroke="#4338ca" strokeWidth={2.5} />)}
      {part("nucleus", <circle cx={112} cy={98} r={11} fill={tone("nucleus", "#3730a3")} />)}
    </>
  );
}

const T = {
  send: { pl: "⚡ Wyślij impuls", ru: "⚡ Отправить импульс" },
  route: {
    pl: "Impuls zawsze biegnie w jedną stronę: dendryty → ciało komórki → akson → zakończenia aksonu.",
    ru: "Импульс всегда идёт в одну сторону: дендриты → тело клетки → аксон → окончания аксона.",
  },
} satisfies Record<string, Txt>;

export function Neuron({ lang }: { lang: BioLang }) {
  const [shot, setShot] = useState(0);
  return (
    <div className="space-y-5">
      <PartMap<NeuronPart>
        lang={lang}
        parts={PARTS}
        viewBox="0 0 400 190"
        title={{ pl: "Budowa neuronu", ru: "Строение нейрона" }}
        labelOrder={["dendrites", "body", "nucleus", "axon", "terminals"]}
        pinRadius={15}
        maxWidth="max-w-[460px]"
        art={({ part, tone }) => neuronArt(tone, part)}
        overlay={() =>
          shot > 0 && (
            <circle key={shot} r={9} fill="#facc15" stroke="#ca8a04" strokeWidth={2} pointerEvents="none">
              <animateMotion dur="2.2s" path={ROUTE} fill="freeze" />
            </circle>
          )
        }
      />
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-indigo-50 p-4 ring-1 ring-indigo-200">
        <Choice state="active" onClick={() => setShot(shot + 1)}>
          {T.send[lang]}
        </Choice>
        <p className="text-sm text-indigo-950">{T.route[lang]}</p>
      </div>
    </div>
  );
}
