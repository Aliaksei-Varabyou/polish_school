// Block 1 of the amphibians lesson: a frog seen from the side, every part explaining what it does on
// land or in water.
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "@portal/lessons";

type FrogPart = "skin" | "eyes" | "ear" | "tongue" | "forelimb" | "hindlimb" | "web" | "lungs";

const PARTS: Record<FrogPart, MapPart> = {
  skin: {
    name: { pl: "Naga, wilgotna skóra", ru: "Голая влажная кожа" },
    text: {
      pl: "Skóra płaza nie ma łusek i jest pełna gruczołów śluzowych. Płaz oddycha też przez skórę, ale tylko wtedy, gdy jest ona wilgotna — dlatego płazy trzymają się wody i wilgotnych miejsc. Gruczoły niektórych płazów, np. ropuchy, wydzielają jad.",
      ru: "Кожа земноводного без чешуи и полна слизистых желёз. Через неё земноводное тоже дышит, но только пока она влажная, — поэтому земноводные держатся воды и сырых мест. Железы некоторых земноводных, например жабы, выделяют яд.",
    },
    pin: [262, 50],
    to: [246, 118],
  },
  eyes: {
    name: { pl: "Oczy i nozdrza na szczycie głowy", ru: "Глаза и ноздри на макушке" },
    text: {
      pl: "Żaba może zanurzyć się prawie cała, a nad wodą zostają tylko oczy i nozdrza — widzi i oddycha, sama będąc niewidoczna. Oczy mają powieki, które na lądzie chronią je przed wyschnięciem.",
      ru: "Лягушка может почти целиком погрузиться в воду, а над водой остаются только глаза и ноздри: она видит и дышит, оставаясь незаметной. У глаз есть веки, которые на суше защищают их от высыхания.",
    },
    pin: [118, 40],
    to: [128, 104],
  },
  ear: {
    name: { pl: "Błona bębenkowa", ru: "Барабанная перепонка" },
    text: {
      pl: "Okrągła błona za okiem to część ucha. Odbiera dźwięki niesione przez powietrze, np. kumkanie innych żab. To przystosowanie do życia na lądzie.",
      ru: "Круглая перепонка за глазом — часть уха. Она улавливает звуки, идущие по воздуху, например кваканье других лягушек. Это приспособление к жизни на суше.",
    },
    pin: [196, 62],
    to: [168, 124],
  },
  tongue: {
    name: { pl: "Lepki język", ru: "Липкий язык" },
    text: {
      pl: "Język jest przyczepiony z przodu pyska. Żaba wyrzuca go błyskawicznie, owad przykleja się do lepkiego końca i trafia do pyska. Dorosłe płazy są drapieżnikami.",
      ru: "Язык прикреплён в передней части рта. Лягушка молниеносно выбрасывает его, насекомое прилипает к липкому кончику и отправляется в рот. Взрослые земноводные — хищники.",
    },
    pin: [34, 196],
    to: [96, 162],
  },
  forelimb: {
    name: { pl: "Kończyna przednia", ru: "Передняя конечность" },
    text: {
      pl: "Krótka kończyna przednia z czterema palcami. Podpiera ciało, gdy żaba siedzi, i amortyzuje lądowanie po skoku.",
      ru: "Короткая передняя конечность с четырьмя пальцами. Подпирает тело, когда лягушка сидит, и смягчает приземление после прыжка.",
    },
    pin: [70, 244],
    to: [134, 230],
  },
  hindlimb: {
    name: { pl: "Kończyna tylna", ru: "Задняя конечность" },
    text: {
      pl: "Długa i silna. Na lądzie wyrzuca żabę w skoku, w wodzie odpycha ją do przodu — tak samo, jak pływak płynący „żabką”.",
      ru: "Длинная и сильная. На суше она выбрасывает лягушку в прыжке, в воде отталкивает её вперёд — так же, как пловец, плывущий брассом.",
    },
    pin: [364, 118],
    to: [304, 176],
  },
  web: {
    name: { pl: "Błona pławna", ru: "Плавательная перепонка" },
    text: {
      pl: "Skóra rozpięta między palcami kończyn tylnych. Działa jak płetwa: zwiększa powierzchnię stopy i ułatwia pływanie.",
      ru: "Кожа, натянутая между пальцами задних конечностей. Работает как ласт: увеличивает площадь стопы и помогает плавать.",
    },
    pin: [196, 258],
    to: [214, 236],
  },
  lungs: {
    name: { pl: "Płuca", ru: "Лёгкие" },
    text: {
      pl: "Dorosła żaba ma proste, workowate płuca. Są małe, więc sporą część tlenu płaz pobiera przez skórę. Kijanka oddycha skrzelami, jak ryba.",
      ru: "У взрослой лягушки простые мешковидные лёгкие. Они маленькие, поэтому заметную часть кислорода земноводное получает через кожу. Головастик дышит жабрами, как рыба.",
    },
  },
};

const LABELS: FrogPart[] = ["skin", "eyes", "ear", "tongue", "forelimb", "hindlimb", "web"];

const GREEN = "#65a30d";
const DARK = "#3f6212";

export function FrogMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<FrogPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 275"
      title={{ pl: "Budowa żaby", ru: "Строение лягушки" }}
      labelOrder={LABELS}
      art={({ part, tone }) => (
        <>
          {part(
            "skin",
            <g stroke={DARK} strokeWidth={2.5}>
              <ellipse cx={226} cy={150} rx={88} ry={50} transform="rotate(-10 226 150)" fill={tone("skin", GREEN)} />
              <ellipse cx={128} cy={150} rx={50} ry={32} transform="rotate(8 128 150)" fill={tone("skin", GREEN)} />
              <g fill={DARK} stroke="none" opacity={0.6}>
                <ellipse cx={212} cy={118} rx={12} ry={6} />
                <ellipse cx={254} cy={124} rx={10} ry={5} />
                <ellipse cx={190} cy={142} rx={8} ry={5} />
                <ellipse cx={280} cy={146} rx={9} ry={5} />
              </g>
            </g>,
          )}
          {part(
            "hindlimb",
            <g stroke={DARK} strokeWidth={2.5}>
              <ellipse cx={292} cy={184} rx={46} ry={24} transform="rotate(25 292 184)" fill={tone("hindlimb", GREEN)} />
              <path d="M320 208 L 252 228" stroke={tone("hindlimb", GREEN)} strokeWidth={16} strokeLinecap="round" />
              <path d="M320 208 L 252 228" stroke={DARK} strokeWidth={1} fill="none" opacity={0.5} />
            </g>,
          )}
          {part(
            "web",
            <g>
              <path d="M254 226 L 190 220 L 186 232 L 196 236 L 184 246 L 254 238 Z" fill={tone("web", "#bef264")} stroke={DARK} strokeWidth={1.5} />
              <path d="M254 228 L 190 220 M254 231 L 186 233 M254 235 L 184 246" stroke={DARK} strokeWidth={3} strokeLinecap="round" />
            </g>,
          )}
          {part(
            "forelimb",
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M160 170 L 150 205 L 138 226" stroke={tone("forelimb", GREEN)} strokeWidth={13} />
              <path d="M138 226 L 116 230 M138 226 L 124 241 M138 226 L 143 243" stroke={tone("forelimb", DARK)} strokeWidth={4} />
              <path d="M160 170 L 150 205 L 138 226" stroke="transparent" strokeWidth={24} />
            </g>,
          )}
          {part(
            "tongue",
            <g>
              <path d="M82 156 Q 120 172 172 160" fill="none" stroke={tone("tongue", DARK)} strokeWidth={3} strokeLinecap="round" />
              <path d="M82 156 Q 120 172 172 160" fill="none" stroke="transparent" strokeWidth={18} />
            </g>,
          )}
          {part(
            "ear",
            <circle cx={168} cy={128} r={11} fill={tone("ear", "#4d7c0f")} stroke={DARK} strokeWidth={2} />,
          )}
          {part(
            "eyes",
            <g>
              <circle cx={130} cy={114} r={17} fill={tone("eyes", "#4d7c0f")} stroke={DARK} strokeWidth={2} />
              <circle cx={128} cy={112} r={11} fill="#fbbf24" />
              <ellipse cx={128} cy={112} rx={7} ry={4} fill="#1c1917" />
              <ellipse cx={90} cy={134} rx={6} ry={4} fill={tone("eyes", "#4d7c0f")} />
              <ellipse cx={90} cy={134} rx={2.5} ry={1.8} fill="#1c1917" />
            </g>,
          )}
        </>
      )}
      overlay={(active) => (
        <g pointerEvents="none">
          {active === "tongue" && (
            <g>
              <path d="M88 158 C 70 150, 46 136, 28 128" fill="none" stroke="#f472b6" strokeWidth={7} strokeLinecap="round" />
              <ellipse cx={24} cy={126} rx={9} ry={7} fill="#ec4899" />
              <g transform="translate(14 112)">
                <ellipse cx={0} cy={0} rx={5} ry={3} fill="#1c1917" />
                <ellipse cx={-2} cy={-4} rx={4} ry={2.5} fill="#e2e8f0" opacity={0.9} />
              </g>
            </g>
          )}
          {active === "lungs" && (
            <g>
              <path d="M150 152 C 170 150, 180 148, 192 146" stroke="#db2777" strokeWidth={3} fill="none" />
              <ellipse cx={224} cy={145} rx={36} ry={17} fill="#f9a8d4" stroke="#db2777" strokeWidth={2} opacity={0.92} />
              <path d="M200 145 Q 224 138 250 146 M204 152 Q 226 156 248 150" stroke="#db2777" strokeWidth={1} fill="none" />
            </g>
          )}
        </g>
      )}
    />
  );
}
