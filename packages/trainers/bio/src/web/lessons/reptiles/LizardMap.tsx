// Block 1 of the reptiles lesson: a sand lizard from above. Choosing the tail shows autotomy — the
// tail snaps off — and choosing the tongue flicks it out.
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "@portal/lessons";

type LizardPart = "scales" | "eyes" | "ear" | "legs" | "tail" | "tongue" | "lungs";

const PARTS: Record<LizardPart, MapPart> = {
  scales: {
    name: { pl: "Łuski rogowe", ru: "Роговые чешуи" },
    text: {
      pl: "Skóra gada jest sucha, prawie bez gruczołów i pokryta zrogowaciałymi łuskami. Nie przepuszcza wody, więc chroni przed wysychaniem — dzięki temu gady mogą żyć nawet na pustyni. Rosnący gad linieje, zrzucając starą skórę.",
      ru: "Кожа пресмыкающегося сухая, почти без желёз и покрыта ороговевшими чешуями. Она не пропускает воду и защищает от высыхания — поэтому пресмыкающиеся живут даже в пустыне. Растущее животное линяет, сбрасывая старую кожу.",
    },
    pin: [180, 30],
    to: [176, 112],
  },
  eyes: {
    name: { pl: "Oczy z powiekami", ru: "Глаза с веками" },
    text: {
      pl: "Jaszczurki mają ruchome powieki, które zwilżają i chronią oko. Węże powiek nie mają — ich oko przykrywa przezroczysta łuska.",
      ru: "У ящериц есть подвижные веки, которые увлажняют и защищают глаз. У змей век нет — их глаз закрыт прозрачной чешуйкой.",
    },
    pin: [44, 50],
    to: [58, 112],
  },
  ear: {
    name: { pl: "Błona bębenkowa", ru: "Барабанная перепонка" },
    text: {
      pl: "Mały otwór ucha za okiem, zamknięty błoną bębenkową — jaszczurka słyszy dźwięki w powietrzu.",
      ru: "Маленькое ушное отверстие за глазом, затянутое барабанной перепонкой, — ящерица слышит звуки в воздухе.",
    },
    pin: [96, 36],
    to: [86, 116],
  },
  legs: {
    name: { pl: "Kończyny z pazurami", ru: "Конечности с когтями" },
    text: {
      pl: "Kończyny wyrastają po bokach ciała, więc jaszczurka „pełza” na ugiętych nogach, prawie dotykając brzuchem ziemi. Palce mają pazury, które pomagają wspinać się i kopać.",
      ru: "Конечности отходят по бокам тела, поэтому ящерица передвигается на согнутых ногах, почти касаясь брюхом земли. На пальцах когти, помогающие лазать и рыть.",
    },
    pin: [130, 232],
    to: [128, 182],
  },
  tail: {
    name: { pl: "Ogon (autotomia)", ru: "Хвост (автотомия)" },
    text: {
      pl: "Złapana za ogon jaszczurka potrafi go odrzucić — to autotomia. Odrzucony ogon jeszcze chwilę się wije i odwraca uwagę drapieżnika, a jaszczurka ucieka. Potem ogon częściowo odrasta.",
      ru: "Пойманная за хвост ящерица может его отбросить — это автотомия. Отброшенный хвост ещё какое-то время извивается и отвлекает хищника, а ящерица убегает. Потом хвост частично отрастает.",
    },
    pin: [330, 210],
    to: [318, 150],
  },
  tongue: {
    name: { pl: "Rozwidlony język", ru: "Раздвоенный язык" },
    text: {
      pl: "Wysuwając język, gad zbiera z powietrza cząsteczki zapachu i przenosi je do narządu węchu w pysku. Tak „wącha” otoczenie i tropi zdobycz — szczególnie węże.",
      ru: "Высовывая язык, пресмыкающееся собирает из воздуха частицы запаха и переносит их к органу обоняния во рту. Так оно «нюхает» окружающее и выслеживает добычу — особенно змеи.",
    },
  },
  lungs: {
    name: { pl: "Płuca", ru: "Лёгкие" },
    text: {
      pl: "Gady oddychają tylko płucami — przez suchą skórę nie da się oddychać. Ich płuca są bardziej pofałdowane niż u płazów, więc mają większą powierzchnię.",
      ru: "Пресмыкающиеся дышат только лёгкими — через сухую кожу дышать нельзя. Их лёгкие складчатее, чем у земноводных, поэтому их поверхность больше.",
    },
  },
};

const GREEN = "#84cc16";
const BROWN = "#a16207";

export function LizardMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<LizardPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 250"
      title={{ pl: "Budowa jaszczurki", ru: "Строение ящерицы" }}
      labelOrder={["scales", "eyes", "ear", "legs", "tail"]}
      art={({ part, tone, active }) => (
        <>
          <defs>
            <pattern id="lizard-scales" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="8" fill="none" stroke="#3f6212" strokeWidth={0.7} opacity={0.5} />
            </pattern>
          </defs>
          {part(
            "legs",
            <g fill="none" stroke={tone("legs", BROWN)} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
              <path d="M112 116 L 104 82 L 120 66" />
              <path d="M112 144 L 104 178 L 120 194" />
              <path d="M214 112 L 234 80 L 254 78" />
              <path d="M214 148 L 234 180 L 254 182" />
              <g stroke={tone("legs", "#713f12")} strokeWidth={2.5}>
                <path d="M120 66 l 8 -8 M120 66 l 10 -2 M120 66 l 2 -10 M120 194 l 8 8 M120 194 l 10 2 M120 194 l 2 10" />
                <path d="M254 78 l 8 -6 M254 78 l 10 1 M254 78 l 4 -9 M254 182 l 8 6 M254 182 l 10 -1 M254 182 l 4 9" />
              </g>
            </g>,
          )}
          {part(
            "tail",
            <g>
              <path
                d={active === "tail" ? "M262 122 C 290 124, 300 126, 304 128 L 304 136 C 296 138, 286 138, 262 138 Z" : "M248 120 C 300 122, 350 132, 392 142 C 350 146, 300 144, 248 140 Z"}
                fill={tone("tail", GREEN)}
                stroke="#3f6212"
                strokeWidth={2}
              />
              {active === "tail" && (
                <path d="M318 136 C 336 128, 352 146, 370 134 C 380 128, 388 140, 396 138 L 396 144 C 384 150, 370 144, 360 150 C 344 158, 330 142, 318 146 Z" fill={GREEN} stroke="#3f6212" strokeWidth={2} />
              )}
            </g>,
          )}
          {part(
            "scales",
            <g>
              <ellipse cx={176} cy={130} rx={86} ry={30} fill={tone("scales", GREEN)} stroke="#3f6212" strokeWidth={2} />
              <ellipse cx={176} cy={130} rx={86} ry={30} fill="url(#lizard-scales)" />
              <path d="M96 130 L 256 130" stroke="#3f6212" strokeWidth={6} opacity={0.25} strokeDasharray="10 6" />
              <ellipse cx={72} cy={130} rx={34} ry={21} fill={tone("scales", GREEN)} stroke="#3f6212" strokeWidth={2} />
            </g>,
          )}
          {part(
            "ear",
            <g>
              <circle cx={86} cy={118} r={6} fill={tone("ear", "#3f6212")} />
              <circle cx={86} cy={142} r={6} fill={tone("ear", "#3f6212")} />
            </g>,
          )}
          {part(
            "eyes",
            <g>
              {[116, 144].map((y) => (
                <g key={y}>
                  <ellipse cx={60} cy={y} rx={8} ry={6} fill={tone("eyes", "#fef08a")} stroke="#3f6212" strokeWidth={1.5} />
                  <circle cx={60} cy={y} r={3} fill="#0f172a" />
                </g>
              ))}
            </g>,
          )}
        </>
      )}
      overlay={(active) => (
        <g pointerEvents="none">
          {active === "tongue" && <path d="M40 130 L 14 130 L 4 122 M14 130 L 4 138" fill="none" stroke="#e11d48" strokeWidth={3} strokeLinecap="round" />}
          {active === "lungs" && (
            <g>
              {[118, 142].map((y) => (
                <ellipse key={y} cx={146} cy={y} rx={30} ry={9} fill="#f9a8d4" stroke="#db2777" strokeWidth={1.5} />
              ))}
              <path d="M96 130 L 116 130 L 120 118 M116 130 L 120 142" fill="none" stroke="#db2777" strokeWidth={2} />
            </g>
          )}
        </g>
      )}
    />
  );
}
