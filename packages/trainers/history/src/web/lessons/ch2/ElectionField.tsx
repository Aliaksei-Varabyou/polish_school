// Block 4 of the election lesson: the election field near Warsaw, schematically — the senators' shed,
// the knights' circle, the voivodeship camps around it, the primate, the candidates' envoys.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "szopa" | "kolo" | "wojewodztwa" | "prymas" | "poslowie" | "warszawa";

const PARTS: Record<Part, MapPart> = {
  szopa: {
    name: { pl: "Szopa senatorska", ru: "Сенаторский шалаш" },
    text: {
      pl: "Drewniana hala pośrodku pola, w której obradował senat: biskupi, wojewodowie i kasztelanowie. Tu przyjmowano posłów kandydatów.",
      ru: "Деревянный зал посреди поля, где заседал сенат: епископы, воеводы и каштеляны. Здесь принимали послов кандидатов.",
    },
    pin: [200, 20],
    to: [200, 100],
  },
  kolo: {
    name: { pl: "Koło rycerskie", ru: "Рыцарский круг" },
    text: {
      pl: "Wokół szopy stawała szlachta — pieszo i konno, według województw. Każdy szlachcic mógł głosować osobiście (elekcja viritim).",
      ru: "Вокруг шалаша становилась шляхта — пешком и верхом, по воеводствам. Каждый шляхтич мог голосовать лично (элекция viritim).",
    },
    pin: [200, 222],
    to: [200, 176],
  },
  wojewodztwa: {
    name: { pl: "Obozy województw", ru: "Лагеря воеводств" },
    text: {
      pl: "Szlachta każdego województwa obozowała pod własną chorągwią. Głosy zbierano województwami, a potem ogłaszano wspólny wynik.",
      ru: "Шляхта каждого воеводства стояла лагерем под собственной хоругвью. Голоса собирали по воеводствам, а затем объявляли общий результат.",
    },
    pin: [40, 24],
    to: [78, 60],
  },
  prymas: {
    name: { pl: "Prymas — interrex", ru: "Примас — интеррекс" },
    text: {
      pl: "Arcybiskup gnieźnieński kierował elekcją jako interrex. Po zebraniu głosów ogłaszał (nominował) nowego króla.",
      ru: "Архиепископ Гнезненский руководил элекцией как интеррекс. После сбора голосов он объявлял (номинировал) нового короля.",
    },
    pin: [120, 222],
    to: [252, 120],
  },
  poslowie: {
    name: { pl: "Posłowie kandydatów", ru: "Послы кандидатов" },
    text: {
      pl: "Kandydaci do tronu nie przyjeżdżali sami — przysyłali posłów z obietnicami. W 1573 roku o koronę zabiegali m.in. Henryk Walezy, Ernest Habsburg i car Iwan IV Groźny.",
      ru: "Кандидаты на трон не приезжали сами — они присылали послов с обещаниями. В 1573 году за корону боролись, среди прочих, Генрих Валуа, Эрнст Габсбург и царь Иван IV Грозный.",
    },
    pin: [360, 24],
    to: [330, 54],
  },
  warszawa: {
    name: { pl: "Warszawa i Wisła", ru: "Варшава и Висла" },
    text: {
      pl: "Pole elekcyjne leżało pod Warszawą — najpierw we wsi Kamień na prawym brzegu Wisły (1573), potem na Woli. Warszawa leżała w środku Rzeczypospolitej, między Krakowem a Wilnem.",
      ru: "Элекционное поле находилось под Варшавой — сначала в деревне Камень на правом берегу Вислы (1573), затем на Воле. Варшава лежала в центре Речи Посполитой, между Краковом и Вильно.",
    },
    pin: [360, 222],
    to: [372, 190],
  },
};

const CAMPS: [number, number][] = [
  [78, 60],
  [130, 40],
  [270, 40],
  [322, 60],
  [60, 120],
  [340, 120],
  [78, 180],
  [130, 200],
  [270, 200],
  [322, 180],
];

export function ElectionField({ lang }: { lang: ContentLang }) {
  const t = (pl: string, ru: string) => (lang === "pl" ? pl : ru);
  const camp = (x: number, y: number, fill: string) => (
    <g key={`${x}-${y}`}>
      <path d={`M${x} ${y - 14} V ${y + 6}`} stroke="#44403c" strokeWidth={1.2} />
      <path d={`M${x} ${y - 14} L ${x + 10} ${y - 10} L ${x} ${y - 6} Z`} fill={fill} />
      {[-7, 0, 7].map((dx) => (
        <circle key={dx} cx={x + dx} cy={y + 6} r={2.2} fill="#44403c" />
      ))}
    </g>
  );
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 400 240"
      maxWidth="max-w-[520px]"
      title={{
        pl: "Pole elekcyjne pod Warszawą",
        ru: "Элекционное поле под Варшавой",
      }}
      labelOrder={["szopa", "kolo", "wojewodztwa", "prymas", "poslowie", "warszawa"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={400} height={240} fill="#d9f99d" />
          {/* Warsaw and the river on the right */}
          {part(
            "warszawa",
            <g>
              <path d="M384 0 C 376 60, 392 120, 380 240 L 400 240 L 400 0 Z" fill={tone("warszawa", "#7dd3fc")} />
              <rect x={360} y={150} width={14} height={10} fill={tone("warszawa", "#fca5a5")} stroke="#7f1d1d" />
              <path d="M358 150 L 367 142 L 376 150 Z" fill="#7f1d1d" />
              <rect x={364} y={132} width={6} height={10} fill="#fca5a5" stroke="#7f1d1d" />
              <path d="M363 132 L 367 126 L 371 132 Z" fill="#7f1d1d" />
            </g>,
          )}
          <text x={344} y={174} fontSize={7} fill="#7f1d1d" fontWeight={600}>
            {t("Warszawa", "Варшава")}
          </text>
          {/* the knights' circle */}
          {part("kolo", <ellipse cx={200} cy={120} rx={120} ry={66} fill={tone("kolo", "#fef3c7")} stroke="#a16207" strokeWidth={2} strokeDasharray="6 4" />)}
          <text x={200} y={166} fontSize={7.5} textAnchor="middle" fill="#854d0e" fontWeight={600}>
            {t("koło rycerskie — szlachta według województw", "рыцарский круг — шляхта по воеводствам")}
          </text>
          {/* the senators' shed in the middle */}
          {part(
            "szopa",
            <g>
              <rect x={166} y={100} width={68} height={36} fill={tone("szopa", "#fde68a")} stroke="#78350f" strokeWidth={1.5} />
              <path d="M160 100 L 200 80 L 240 100 Z" fill={tone("szopa", "#b45309")} />
            </g>,
          )}
          <text x={200} y={122} fontSize={7} textAnchor="middle" fill="#78350f" fontWeight={700}>
            {t("szopa senatorska", "сенаторский шалаш")}
          </text>
          {/* the primate in front of the shed */}
          {part(
            "prymas",
            <g>
              <circle cx={252} cy={120} r={5} fill={tone("prymas", "#f3e8ff")} stroke="#6b21a8" strokeWidth={1.5} />
              <path d="M252 115 L 248 106 L 256 106 Z" fill="#6b21a8" />
              <path d="M252 125 V 142" stroke="#6b21a8" strokeWidth={2} />
            </g>,
          )}
          <text x={258} y={124} fontSize={7} fill="#6b21a8" fontWeight={600}>
            {t("prymas (interrex)", "примас (интеррекс)")}
          </text>
          {/* voivodeship camps around the circle */}
          {part("wojewodztwa", <g>{CAMPS.map(([x, y], i) => camp(x, y, tone("wojewodztwa", ["#dc2626", "#2563eb", "#16a34a", "#ca8a04", "#9333ea"][i % 5]!)))}</g>)}
          <text x={46} y={40} fontSize={7} fill="#44403c" fontWeight={600}>
            {t("obozy województw", "лагеря воеводств")}
          </text>
          {/* envoys of the candidates arriving from the top right */}
          {part(
            "poslowie",
            <g>
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <circle cx={300 + i * 14} cy={22} r={4} fill={tone("poslowie", "#fdba74")} stroke="#9a3412" strokeWidth={1.2} />
                  <path d={`M${300 + i * 14} 26 V 36`} stroke="#9a3412" strokeWidth={2} />
                </g>
              ))}
              <path d="M314 40 C 316 48, 324 52, 330 54" fill="none" stroke="#9a3412" strokeWidth={1.5} strokeDasharray="3 2" />
            </g>,
          )}
          <text x={286} y={14} fontSize={7} fill="#9a3412" fontWeight={600}>
            {t("posłowie kandydatów", "послы кандидатов")}
          </text>
        </>
      )}
    />
  );
}
