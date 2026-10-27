// Block 1 of the Baroque lesson: a Sarmatian nobleman in his dress, drawn schematically. Each piece
// of clothing explains itself when tapped; in "label it" mode the student names the pieces.
import { PartMap, type ContentLang, type MapPart } from "@portal/lessons";

type Part = "glowa" | "kolpak" | "kontusz" | "wyloty" | "zupan" | "pas" | "karabela" | "buty";

const PARTS: Record<Part, MapPart> = {
  glowa: {
    name: { pl: "Podgolona głowa i wąsy", ru: "Подбритая голова и усы" },
    text: {
      pl: "Sarmata golił głowę po bokach i z tyłu, zostawiając włosy na czubku, a wąsy nosił sute i długie. Tak wyglądali dziadowie — więc tak wyglądać należało.",
      ru: "Сармат брил голову с боков и сзади, оставляя волосы на макушке, а усы носил пышные и длинные. Так выглядели деды — значит, так и следовало выглядеть.",
    },
  },
  kolpak: {
    name: { pl: "Kołpak z piórem", ru: "Колпак с пером" },
    text: {
      pl: "Futrzana czapka, często z czaplim piórem spiętym klejnotem. Czapkę szlachcic zdejmował tylko w kościele i przed królem.",
      ru: "Меховая шапка, часто с пером цапли, скреплённым драгоценностью. Шапку шляхтич снимал только в костёле и перед королём.",
    },
    pin: [40, 40],
    to: [128, 36],
  },
  kontusz: {
    name: { pl: "Kontusz", ru: "Кунтуш" },
    text: {
      pl: "Wierzchnia szata noszona na żupanie, zwykle w innym, mocnym kolorze. Kontusz — razem z żupanem i pasem — stał się strojem narodowym szlachty.",
      ru: "Верхняя одежда поверх жупана, обычно другого, яркого цвета. Кунтуш — вместе с жупаном и поясом — стал национальным костюмом шляхты.",
    },
    pin: [255, 130],
    to: [196, 150],
  },
  wyloty: {
    name: { pl: "Wyloty", ru: "Вылеты" },
    text: {
      pl: "Rozcięte rękawy kontusza, zarzucane na plecy — ręce wychodziły przez rozcięcie, a puste rękawy zwisały z tyłu. To one odróżniają kontusz od innych szat.",
      ru: "Разрезные рукава кунтуша, закинутые за спину — руки выходили через разрез, а пустые рукава свисали сзади. Именно они отличают кунтуш от других одежд.",
    },
    pin: [255, 230],
    to: [208, 232],
  },
  zupan: {
    name: { pl: "Żupan", ru: "Жупан" },
    text: {
      pl: "Długa suknia spodnia zapinana na rząd guzików, noszona pod kontuszem. Latem, w domu, szlachcic chodził w samym żupanie.",
      ru: "Длинное нижнее платье на ряде пуговиц, носимое под кунтушем. Летом, дома, шляхтич ходил в одном жупане.",
    },
    pin: [40, 130],
    to: [150, 140],
  },
  pas: {
    name: { pl: "Pas kontuszowy", ru: "Кунтушовый пояс" },
    text: {
      pl: "Szeroki jedwabny pas tkany złotą nicią, owijany kilka razy wokół bioder. Najsłynniejsze tkano w Słucku — stąd „pasy słuckie”. Kosztował tyle, co dobry koń.",
      ru: "Широкий шёлковый пояс, тканный золотой нитью, обёрнутый несколько раз вокруг бёдер. Самые известные ткали в Слуцке — отсюда «слуцкие пояса». Стоил он как хороший конь.",
    },
    pin: [255, 190],
    to: [182, 192],
  },
  karabela: {
    name: { pl: "Karabela", ru: "Карабеля" },
    text: {
      pl: "Zakrzywiona szabla z rękojeścią w kształcie ptasiej głowy. Szlachcic nosił ją zawsze — na sejmiku, w kościele, w gościnie. Była znakiem, że jest wolnym człowiekiem i wojownikiem.",
      ru: "Изогнутая сабля с рукоятью в форме птичьей головы. Шляхтич носил её всегда — на сеймике, в костёле, в гостях. Она была знаком, что он свободный человек и воин.",
    },
    pin: [40, 290],
    to: [100, 272],
  },
  buty: {
    name: { pl: "Buty safianowe", ru: "Сафьяновые сапоги" },
    text: {
      pl: "Wysokie buty z miękkiej, barwionej skóry — żółte lub czerwone — przywożonej ze Wschodu. Cały strój sarmacki czerpał z mody tureckiej i perskiej, choć szlachta Turków zwalczała.",
      ru: "Высокие сапоги из мягкой крашеной кожи — жёлтые или красные — привезённой с Востока. Весь сарматский наряд заимствовал турецкую и персидскую моду, хотя шляхта воевала с турками.",
    },
    pin: [255, 360],
    to: [172, 366],
  },
};

const SKIN = "#f1c9a5";

export function SarmatianDress({ lang }: { lang: ContentLang }) {
  return (
    <PartMap<Part>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 300 400"
      maxWidth="max-w-[360px]"
      title={{ pl: "Strój szlachcica sarmaty", ru: "Наряд шляхтича-сармата" }}
      labelOrder={["kolpak", "kontusz", "wyloty", "zupan", "pas", "karabela", "buty"]}
      pinRadius={11}
      art={({ part, tone }) => (
        <>
          <rect x={0} y={0} width={300} height={400} fill="#f8f4e8" />
          <ellipse cx={150} cy={388} rx={70} ry={8} fill="#e7e0cc" />
          {/* the empty sleeves hanging behind the back */}
          {part(
            "wyloty",
            <g fill={tone("wyloty", "#7f1d1d")} stroke="#450a0a" strokeWidth={1.5}>
              <path d="M112 100 C 90 150, 84 210, 94 260 L 110 256 C 104 210, 112 150, 126 108 Z" />
              <path d="M188 100 C 210 150, 216 210, 206 260 L 190 256 C 196 210, 188 150, 174 108 Z" />
            </g>,
          )}
          {/* boots */}
          {part(
            "buty",
            <g fill={tone("buty", "#eab308")} stroke="#854d0e" strokeWidth={1.5}>
              <path d="M120 330 L 146 330 L 146 380 L 110 384 L 110 376 L 120 370 Z" />
              <path d="M154 330 L 180 330 L 180 370 L 190 376 L 190 384 L 154 380 Z" />
            </g>,
          )}
          {/* the żupan: inner gown, seen in the front opening and on the forearms */}
          {part(
            "zupan",
            <g fill={tone("zupan", "#bfdbfe")} stroke="#1e3a8a" strokeWidth={1.5}>
              <path d="M132 88 L 168 88 L 180 336 L 120 336 Z" />
              <circle cx={150} cy={104} r={2.2} fill="#1e3a8a" />
              <circle cx={150} cy={120} r={2.2} fill="#1e3a8a" />
              <circle cx={150} cy={136} r={2.2} fill="#1e3a8a" />
              <circle cx={150} cy={152} r={2.2} fill="#1e3a8a" />
              <circle cx={150} cy={168} r={2.2} fill="#1e3a8a" />
              <path d="M100 150 C 92 175, 90 200, 96 226 L 114 222 C 110 200, 112 178, 118 158 Z" />
              <path d="M200 150 C 208 175, 210 200, 204 226 L 186 222 C 190 200, 188 178, 182 158 Z" />
            </g>,
          )}
          {/* hands */}
          <circle cx={104} cy={234} r={9} fill={SKIN} stroke="#9a6b4a" strokeWidth={1.2} />
          <circle cx={196} cy={234} r={9} fill={SKIN} stroke="#9a6b4a" strokeWidth={1.2} />
          {/* the kontusz: two front panels and the shoulders */}
          {part(
            "kontusz",
            <g fill={tone("kontusz", "#dc2626")} stroke="#7f1d1d" strokeWidth={1.5}>
              <path d="M104 96 L 136 86 L 150 96 L 136 180 L 128 340 L 96 340 L 100 200 Z" />
              <path d="M196 96 L 164 86 L 150 96 L 164 180 L 172 340 L 204 340 L 200 200 Z" />
              <path d="M104 96 C 110 130, 108 140, 100 150 L 118 158 C 124 140, 126 120, 130 96 Z" />
              <path d="M196 96 C 190 130, 192 140, 200 150 L 182 158 C 176 140, 174 120, 170 96 Z" />
            </g>,
          )}
          {/* the sash */}
          {part(
            "pas",
            <g>
              <rect x={116} y={180} width={68} height={26} rx={4} fill={tone("pas", "#f59e0b")} stroke="#92400e" strokeWidth={1.5} />
              <path d="M116 189 L 184 189 M116 197 L 184 197" stroke="#7c2d12" strokeWidth={1.5} />
              <path d="M124 184 L 128 202 M140 184 L 144 202 M156 184 L 160 202 M172 184 L 176 202" stroke="#fde68a" strokeWidth={2} />
            </g>,
          )}
          {/* the sabre on the left hip */}
          {part(
            "karabela",
            <g>
              <path d="M118 202 C 108 240, 96 290, 70 330" fill="none" stroke={tone("karabela", "#475569")} strokeWidth={6} strokeLinecap="round" />
              <path d="M118 202 C 108 240, 96 290, 70 330" fill="none" stroke="#cbd5e1" strokeWidth={2} strokeLinecap="round" />
              <path d="M118 202 L 128 184 L 136 190 L 126 196" fill={tone("karabela", "#78350f")} stroke="#451a03" strokeWidth={1.5} />
            </g>,
          )}
          {/* head: shaved sides, a tuft on top, long moustache */}
          {part(
            "glowa",
            <g>
              <circle cx={150} cy={62} r={23} fill={tone("glowa", SKIN)} stroke="#9a6b4a" strokeWidth={1.5} />
              <path d="M136 48 C 142 40, 158 40, 164 48" fill="#3f2a14" />
              <circle cx={142} cy={60} r={2} fill="#1f2937" />
              <circle cx={158} cy={60} r={2} fill="#1f2937" />
              <path d="M128 72 C 140 66, 160 66, 172 72 C 164 72, 158 74, 150 71 C 142 74, 136 72, 128 72 Z" fill="#3f2a14" />
            </g>,
          )}
          {/* the fur cap with a heron feather */}
          {part(
            "kolpak",
            <g>
              <path d="M126 46 C 128 28, 172 28, 174 46 Z" fill={tone("kolpak", "#dc2626")} stroke="#7f1d1d" strokeWidth={1.5} />
              <rect x={122} y={40} width={56} height={10} rx={4} fill={tone("kolpak", "#57534e")} stroke="#292524" strokeWidth={1.5} />
              <path d="M164 40 C 176 24, 190 16, 206 12 C 192 20, 182 30, 172 42" fill={tone("kolpak", "#e5e7eb")} stroke="#6b7280" strokeWidth={1} />
              <circle cx={166} cy={44} r={3.5} fill="#fde047" stroke="#854d0e" strokeWidth={1} />
            </g>,
          )}
        </>
      )}
    />
  );
}
