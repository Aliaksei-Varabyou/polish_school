// Block 4, part 1: a bird's egg cut lengthwise, every layer explaining what it gives the embryo.
import type { BioLang } from "../../../lang.ts";
import { PartMap, type MapPart } from "@portal/lessons";

type EggPart = "shell" | "membranes" | "aircell" | "albumen" | "chalazae" | "yolk" | "disc";

const PARTS: Record<EggPart, MapPart> = {
  shell: {
    name: { pl: "Skorupka", ru: "Скорлупа" },
    text: {
      pl: "Twarda skorupka z węglanu wapnia chroni zarodek przed uszkodzeniem i wysychaniem. Ma tysiące drobnych porów, przez które przenika powietrze — zarodek oddycha.",
      ru: "Твёрдая известковая скорлупа защищает зародыш от повреждений и высыхания. В ней тысячи крошечных пор, через которые проходит воздух, — зародыш дышит.",
    },
    pin: [44, 18],
    to: [80, 38],
  },
  membranes: {
    name: { pl: "Błony pod skorupką", ru: "Подскорлуповые оболочки" },
    text: {
      pl: "Dwie cienkie błony leżą tuż pod skorupką. Zatrzymują bakterie, a na tępym końcu jaja rozchodzą się, tworząc komorę powietrzną.",
      ru: "Две тонкие оболочки лежат прямо под скорлупой. Они задерживают бактерии, а на тупом конце яйца расходятся и образуют воздушную камеру.",
    },
  },
  aircell: {
    name: { pl: "Komora powietrzna", ru: "Воздушная камера" },
    text: {
      pl: "Zapas powietrza na tępym końcu jaja. Tuż przed wykluciem pisklę przebija ją dziobem i bierze pierwszy oddech.",
      ru: "Запас воздуха на тупом конце яйца. Незадолго до вылупления птенец прокалывает её клювом и делает первый вдох.",
    },
    pin: [22, 208],
    to: [40, 150],
  },
  albumen: {
    name: { pl: "Białko", ru: "Белок" },
    text: {
      pl: "Zapas wody i budulca dla zarodka. Chroni też żółtko przed wstrząsami jak poduszka.",
      ru: "Запас воды и строительного материала для зародыша. Ещё он, как подушка, защищает желток от толчков.",
    },
    pin: [268, 212],
    to: [236, 168],
  },
  chalazae: {
    name: { pl: "Chalazy", ru: "Халазы" },
    text: {
      pl: "Skręcone sznury z gęstego białka. Utrzymują żółtko na środku jaja, żeby nie uderzało o skorupkę.",
      ru: "Скрученные жгутики из плотного белка. Удерживают желток в центре яйца, чтобы он не ударялся о скорлупу.",
    },
    pin: [300, 52],
    to: [244, 112],
  },
  yolk: {
    name: { pl: "Żółtko", ru: "Желток" },
    text: {
      pl: "Główny zapas pokarmu dla rozwijającego się zarodka — tłuszcze i białka na całe wysiadywanie.",
      ru: "Главный запас питания для развивающегося зародыша — жиры и белки на всё время насиживания.",
    },
    pin: [216, 22],
    to: [186, 96],
  },
  disc: {
    name: { pl: "Tarczka zarodkowa", ru: "Зародышевый диск" },
    text: {
      pl: "Mała jasna plamka na żółtku. W jaju zapłodnionym właśnie z niej rozwija się zarodek, gdy ptak wysiaduje jajo i ogrzewa je ciepłem swojego ciała.",
      ru: "Маленькое светлое пятнышко на желтке. В оплодотворённом яйце именно из него развивается зародыш, когда птица насиживает яйцо и греет его теплом своего тела.",
    },
    pin: [132, 22],
    to: [160, 74],
  },
};

const LABELS: EggPart[] = ["shell", "aircell", "albumen", "yolk", "disc", "chalazae"];

export function EggMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<EggPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 320 230"
      title={{ pl: "Budowa jaja ptaka", ru: "Строение птичьего яйца" }}
      labelOrder={LABELS}
      pinRadius={15}
      art={({ part, tone }) => (
        <>
          {part("shell", <ellipse cx={160} cy={115} rx={132} ry={92} fill={tone("shell", "#fde7c8")} stroke="#d6b48a" strokeWidth={10} />)}
          {part("albumen", <ellipse cx={160} cy={115} rx={120} ry={82} fill={tone("albumen", "#f1f5f9")} />)}
          {part(
            "membranes",
            <g fill="none">
              <ellipse cx={160} cy={115} rx={124} ry={85} stroke={tone("membranes", "#a8a29e")} strokeWidth={2} />
              <ellipse cx={160} cy={115} rx={124} ry={85} stroke="transparent" strokeWidth={8} />
            </g>,
          )}
          {part("aircell", <path d="M38 74 C 30 96, 30 134, 38 156 C 54 142, 56 90, 38 74 Z" fill={tone("aircell", "#dbeafe")} stroke="#a8a29e" strokeWidth={1.5} />)}
          {part(
            "chalazae",
            <g fill="none" strokeLinecap="round">
              <path d="M116 115 C 104 106, 96 124, 84 114 C 76 108, 70 120, 62 114" stroke={tone("chalazae", "#e7e5e4")} strokeWidth={6} />
              <path d="M204 115 C 216 106, 224 124, 236 114 C 244 108, 250 120, 258 114" stroke={tone("chalazae", "#e7e5e4")} strokeWidth={6} />
              <path d="M116 115 C 104 106, 96 124, 84 114 C 76 108, 70 120, 62 114 M204 115 C 216 106, 224 124, 236 114 C 244 108, 250 120, 258 114" stroke="#a8a29e" strokeWidth={1} />
            </g>,
          )}
          {part("yolk", <circle cx={160} cy={115} r={46} fill={tone("yolk", "#fbbf24")} stroke="#d97706" strokeWidth={2} />)}
          {part("disc", <circle cx={160} cy={76} r={8} fill={tone("disc", "#fef9c3")} stroke="#ca8a04" strokeWidth={1.5} />)}
        </>
      )}
    />
  );
}
