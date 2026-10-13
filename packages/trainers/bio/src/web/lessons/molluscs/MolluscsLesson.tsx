// Lesson for §3.5 "Mięczaki – zwierzęta, które mają muszlę" (Puls życia 6). Terms follow
// templates/data/sp6Invertebrates.ts (MOLLUSCS).
import { useState } from "react";
import type { BioLang } from "../../../lang.ts";
import { CompareTabs, MatchQuiz, PartMap, type CompareCard, type MapPart, type QuizItem, type QuizOption } from "../games.tsx";
import { Remember, Section, type LessonProps, type Txt } from "../kit.tsx";
import { LessonIntro } from "../LessonIntro.tsx";

const r = (pl: string, ru: string): Txt => ({ pl, ru });

const T = {
  lead: r(
    "Mięczaki mają miękkie, niepodzielone na segmenty ciało, okryte fałdem skóry — płaszczem. Płaszcz u większości wytwarza wapienną muszlę. Do mięczaków należą ślimaki, małże i głowonogi — od ślimaka w ogrodzie po olbrzymie kałamarnice.",
    "У моллюсков мягкое тело без сегментов, покрытое кожной складкой — мантией. У большинства мантия образует известковую раковину. К моллюскам относятся брюхоногие (улитки), двустворчатые и головоногие — от садовой улитки до гигантского кальмара.",
  ),
  s1: r("Jak zbudowany jest ślimak", "Как устроена улитка"),
  s1intro: r("Ślimak winniczek z boku. Przyciski „Płaszcz” i „Tarka” pokażą to, co ukryte.", "Виноградная улитка сбоку. Кнопки «Мантия» и «Тёрка» покажут то, что скрыто."),
  s2: r("Trzy grupy mięczaków", "Три группы моллюсков"),
  s2intro: r("Porównaj ślimaki, małże i głowonogi.", "Сравни брюхоногих, двустворчатых и головоногих."),
  s3: r("Jak powstaje perła", "Как образуется жемчужина"),
  s3intro: r("Przesuwaj suwak i obserwuj, co dzieje się w muszli małża.", "Двигай ползунок и следи, что происходит в раковине моллюска."),
  s4: r("Kto to?", "Кто это?"),
  s4intro: r("Rozpoznaj mięczaka po opisie.", "Узнай моллюска по описанию."),
} satisfies Record<string, Txt>;

// ---------- the snail ----------

type SnailPart = "shell" | "foot" | "eyes" | "lower" | "pore" | "mantle" | "radula";

const PARTS: Record<SnailPart, MapPart> = {
  shell: { name: r("Muszla", "Раковина"), text: r("Wapienna, skręcona spiralnie osłona, którą wytwarza płaszcz. W razie niebezpieczeństwa lub suszy ślimak chowa się w niej cały.", "Известковая спирально закрученная оболочка, которую образует мантия. При опасности или засухе улитка целиком прячется в неё."), pin: [300, 40], to: [250, 70] },
  foot: { name: r("Noga", "Нога"), text: r("Umięśniona, płaska spodnia część ciała. Ślimak pełznie na niej po warstwie śluzu, który sam wydziela.", "Мускулистая плоская нижняя часть тела. Улитка ползёт на ней по слою слизи, которую сама выделяет."), pin: [250, 210], to: [230, 170] },
  eyes: { name: r("Czułki z oczami", "Щупальца с глазами"), text: r("Dłuższa para czułków ma na końcach oczy. Ślimak może je wciągać do środka.", "На концах длинной пары щупалец — глаза. Улитка может втягивать их внутрь."), pin: [30, 30], to: [56, 70] },
  lower: { name: r("Krótsze czułki", "Короткие щупальца"), text: r("Krótsza para czułków służy do dotyku i węchu — ślimak „obmacuje” nimi drogę.", "Короткая пара щупалец служит для осязания и обоняния — ими улитка «ощупывает» путь."), pin: [24, 190], to: [34, 130] },
  pore: { name: r("Otwór oddechowy", "Дыхательное отверстие"), text: r("Prowadzi do jamy płaszczowej, która u ślimaków lądowych działa jak płuco.", "Ведёт в мантийную полость, которая у наземных улиток работает как лёгкое."), pin: [132, 30], to: [150, 120] },
  mantle: { name: r("Płaszcz", "Мантия"), text: r("Fałd skóry, który okrywa narządy wewnętrzne i wytwarza muszlę. Brzeg płaszcza widać przy otworze muszli.", "Кожная складка, которая покрывает внутренние органы и образует раковину. Край мантии виден у устья раковины."), },
  radula: { name: r("Tarka", "Тёрка (радула)"), text: r("Język pokryty tysiącami drobnych ząbków. Ślimak zeskrobuje nim kawałki liści jak tarką do warzyw.", "Язык, покрытый тысячами мелких зубчиков. Им улитка соскабливает кусочки листьев, как тёркой для овощей."), },
};

function SnailMap({ lang }: { lang: BioLang }) {
  return (
    <PartMap<SnailPart>
      lang={lang}
      parts={PARTS}
      viewBox="0 0 340 220"
      title={r("Budowa ślimaka", "Строение улитки")}
      labelOrder={["shell", "foot", "eyes", "lower", "pore"]}
      pinRadius={15}
      art={({ part, tone }) => (
        <>
          {part("foot", <path d="M30 156 C 30 128, 64 116, 104 120 L 290 150 C 318 156, 324 172, 302 176 L 50 180 C 36 180, 30 170, 30 156 Z" fill={tone("foot", "#d6d3d1")} stroke="#78716c" strokeWidth={2} />)}
          {part(
            "eyes",
            <g strokeLinecap="round">
              <path d="M60 126 L 50 74 M72 124 L 70 72" stroke={tone("eyes", "#a8a29e")} strokeWidth={5} />
              <circle cx={50} cy={72} r={5} fill="#1c1917" />
              <circle cx={70} cy={70} r={5} fill="#1c1917" />
              <path d="M60 126 L 50 74 M72 124 L 70 72" stroke="transparent" strokeWidth={16} />
            </g>,
          )}
          {part(
            "lower",
            <g strokeLinecap="round">
              <path d="M40 138 L 28 126 M44 144 L 30 140" stroke={tone("lower", "#a8a29e")} strokeWidth={4} />
              <path d="M40 138 L 28 126 M44 144 L 30 140" stroke="transparent" strokeWidth={14} />
            </g>,
          )}
          {part(
            "shell",
            <g>
              <circle cx={220} cy={96} r={66} fill={tone("shell", "#d97706")} stroke="#78350f" strokeWidth={2.5} />
              <path d="M220 96 m -8 0 a 8 8 0 1 1 16 0 a 16 16 0 1 1 -32 0 a 28 28 0 1 1 56 0 a 42 42 0 1 1 -84 0 a 56 56 0 1 1 112 6" fill="none" stroke="#78350f" strokeWidth={2.5} />
            </g>,
          )}
          {part("pore", <circle cx={152} cy={124} r={5} fill={tone("pore", "#44403c")} />)}
        </>
      )}
      overlay={(active) => (
        <g pointerEvents="none">
          {active === "mantle" && <path d="M150 140 C 152 120, 170 104, 196 104 C 214 104, 226 116, 228 136 C 214 146, 170 148, 150 140 Z" fill="#fbcfe8" stroke="#db2777" strokeWidth={2} opacity={0.9} />}
          {active === "radula" && (
            <g>
              <path d="M34 152 L 60 196" stroke="#64748b" strokeDasharray="3 3" />
              <rect x={40} y={186} width={110} height={30} rx={8} fill="#fef3c7" stroke="#a16207" strokeWidth={1.5} />
              {Array.from({ length: 3 }, (_, row) =>
                Array.from({ length: 12 }, (_, i) => <path key={`${row}-${i}`} d={`M${48 + i * 8} ${194 + row * 8} l 3 -5 l 3 5`} fill="#a16207" />),
              )}
            </g>
          )}
        </g>
      )}
    />
  );
}

// ---------- three groups ----------

const L = {
  shell: r("Muszla", "Раковина"),
  head: r("Głowa", "Голова"),
  foot: r("Noga", "Нога"),
  home: r("Gdzie żyją", "Где живут"),
  food: r("Jak się odżywiają", "Как питаются"),
  who: r("Przykłady", "Примеры"),
};

const SNAIL_ART = (
  <svg viewBox="0 0 120 80" className="mx-auto h-28 w-full" aria-hidden>
    <path d="M10 64 C 10 52, 26 48, 40 50 L 106 60 C 114 62, 114 70, 104 70 L 20 72 C 14 72, 10 70, 10 64 Z" fill="#d6d3d1" />
    <circle cx={74} cy={40} r={26} fill="#d97706" />
    <path d="M74 40 m -4 0 a 4 4 0 1 1 8 0 a 9 9 0 1 1 -18 0 a 15 15 0 1 1 30 0 a 22 22 0 1 1 -44 2" fill="none" stroke="#78350f" strokeWidth={1.5} />
    <path d="M18 52 L 12 30 M24 50 L 24 28" stroke="#a8a29e" strokeWidth={3} strokeLinecap="round" />
  </svg>
);
const CLAM_ART = (
  <svg viewBox="0 0 120 80" className="mx-auto h-28 w-full" aria-hidden>
    <path d="M14 46 C 20 14, 100 14, 106 46 Z" fill="#78716c" stroke="#44403c" strokeWidth={2} />
    <path d="M14 46 C 20 74, 100 74, 106 46 Z" fill="#a8a29e" stroke="#44403c" strokeWidth={2} />
    {[30, 46, 62, 78, 94].map((x) => (
      <path key={x} d={`M60 46 L ${x} ${x < 60 ? 24 : 26}`} stroke="#57534e" strokeWidth={1} />
    ))}
    <path d="M50 66 C 54 76, 66 76, 70 66" fill="#fde68a" stroke="#ca8a04" />
  </svg>
);
const OCTOPUS_ART = (
  <svg viewBox="0 0 120 80" className="mx-auto h-28 w-full" aria-hidden>
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <path key={i} d={`M${42 + i * 5} 40 C ${30 + i * 8} 60, ${14 + i * 13} 64, ${10 + i * 14} 74`} fill="none" stroke="#e11d48" strokeWidth={4} strokeLinecap="round" />
    ))}
    <ellipse cx={60} cy={28} rx={24} ry={22} fill="#f43f5e" />
    <circle cx={52} cy={30} r={4} fill="white" />
    <circle cx={68} cy={30} r={4} fill="white" />
    <circle cx={52} cy={31} r={2} fill="#0f172a" />
    <circle cx={68} cy={31} r={2} fill="#0f172a" />
  </svg>
);

const GROUPS: CompareCard[] = [
  {
    id: "snails",
    icon: "🐌",
    name: r("Ślimaki", "Брюхоногие"),
    art: SNAIL_ART,
    rows: [
      { label: L.shell, value: r("jedna, skręcona spiralnie (u niektórych brak)", "одна, спирально закрученная (у некоторых нет)") },
      { label: L.head, value: r("wyraźna, z czułkami", "хорошо заметна, с щупальцами") },
      { label: L.foot, value: r("płaska, do pełzania", "плоская, для ползания") },
      { label: L.home, value: r("ląd, wody słodkie, morza", "суша, пресные воды, моря") },
      { label: L.food, value: r("zeskrobują pokarm tarką", "соскабливают пищу тёркой") },
      { label: L.who, value: r("winniczek, błotniarka, pomrów", "виноградная улитка, прудовик, слизень") },
    ],
  },
  {
    id: "clams",
    icon: "🦪",
    name: r("Małże", "Двустворчатые"),
    art: CLAM_ART,
    rows: [
      { label: L.shell, value: r("z dwóch połówek (muszli)", "из двух створок") },
      { label: L.head, value: r("brak wyraźnej głowy", "выраженной головы нет") },
      { label: L.foot, value: r("w kształcie klina, do zakopywania się w dnie", "клиновидная, для закапывания в дно") },
      { label: L.home, value: r("tylko w wodzie", "только в воде") },
      { label: L.food, value: r("filtrują wodę i odcedzają drobny pokarm", "фильтруют воду и отцеживают мелкую пищу") },
      { label: L.who, value: r("szczeżuja, omułek, ostryga", "беззубка, мидия, устрица") },
    ],
    text: r("Filtrując wodę, małże ją oczyszczają — jedna szczeżuja przepuszcza przez siebie kilkadziesiąt litrów wody na dobę.", "Фильтруя воду, двустворчатые её очищают — одна беззубка пропускает через себя десятки литров воды в сутки."),
  },
  {
    id: "cephalopods",
    icon: "🐙",
    name: r("Głowonogi", "Головоногие"),
    art: OCTOPUS_ART,
    rows: [
      { label: L.shell, value: r("zwykle ukryta w ciele lub brak", "обычно скрыта в теле или её нет") },
      { label: L.head, value: r("duża, z dobrze widzącymi oczami", "крупная, с хорошо видящими глазами") },
      { label: L.foot, value: r("przekształcona w ramiona z przyssawkami", "превратилась в щупальца с присосками") },
      { label: L.home, value: r("tylko w morzach", "только в морях") },
      { label: L.food, value: r("drapieżniki — chwytają ofiary ramionami", "хищники — хватают добычу щупальцами") },
      { label: L.who, value: r("ośmiornica, kałamarnica, mątwa", "осьминог, кальмар, каракатица") },
    ],
    text: r("Głowonogi to najsprytniejsze bezkręgowce: zmieniają barwę i w razie zagrożenia wypuszczają chmurę atramentu.", "Головоногие — самые сообразительные беспозвоночные: меняют окраску и при опасности выпускают облако чернил."),
  },
];

// ---------- the pearl ----------

const PEARL: Txt[] = [
  r("Do wnętrza muszli dostaje się ziarenko piasku albo drobny pasożyt i drażni płaszcz.", "Внутрь раковины попадает песчинка или мелкий паразит и раздражает мантию."),
  r("Płaszcz otacza intruza i pokrywa go cienką warstwą masy perłowej — tej samej, która wyściela muszlę od środka.", "Мантия обволакивает чужака и покрывает его тонким слоем перламутра — того же, что выстилает раковину изнутри."),
  r("Warstwa za warstwą, przez kilka lat, powstaje gładka, lśniąca perła.", "Слой за слоем, несколько лет, образуется гладкая блестящая жемчужина."),
];

function Pearl({ lang }: { lang: BioLang }) {
  const [layers, setLayers] = useState(0);
  const stage = layers === 0 ? 0 : layers < 5 ? 1 : 2;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <svg viewBox="0 0 260 160" className="w-full" role="img" aria-label={lang === "pl" ? `Warstw: ${layers}` : `Слоёв: ${layers}`}>
          <rect width={260} height={160} rx={12} fill="#e0f2fe" />
          <path d="M20 90 C 40 20, 220 20, 240 90 Z" fill="#78716c" stroke="#44403c" strokeWidth={2} />
          <path d="M20 90 C 40 150, 220 150, 240 90 Z" fill="#e7e5e4" stroke="#44403c" strokeWidth={2} />
          <path d="M34 92 C 60 134, 200 134, 226 92 Z" fill="#fbcfe8" opacity={0.6} />
          {Array.from({ length: layers }, (_, i) => layers - i).map((k) => (
            <circle key={k} cx={130} cy={104} r={3 + k * 2.6} fill={k % 2 ? "#f8fafc" : "#e0e7ff"} stroke="#c7d2fe" strokeWidth={0.6} />
          ))}
          <circle cx={130} cy={104} r={3} fill="#a16207" />
          {layers >= 5 && <circle cx={124} cy={98} r={3 + layers * 0.5} fill="white" opacity={0.6} />}
        </svg>
        <label className="mt-3 block text-sm font-semibold text-slate-700">
          {lang === "pl" ? "Warstwy masy perłowej" : "Слои перламутра"}: {layers}
          <input type="range" min={0} max={9} value={layers} onChange={(e) => setLayers(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-pink-500" />
        </label>
      </div>
      <ol className="space-y-2" aria-live="polite">
        {PEARL.map((s, i) => (
          <li key={i} className={`flex gap-3 text-[15px] leading-relaxed ${i <= stage ? "text-slate-800" : "text-slate-400"}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${i <= stage ? "bg-pink-500" : "bg-slate-300"}`}>{i + 1}</span>
            {s[lang]}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------- the quiz ----------

const OPTIONS: QuizOption[] = [
  { id: "snail", label: r("ślimak winniczek", "виноградная улитка") },
  { id: "slug", label: r("pomrów (ślimak nagi)", "слизень") },
  { id: "mussel", label: r("szczeżuja", "беззубка") },
  { id: "octopus", label: r("ośmiornica", "осьминог") },
  { id: "squid", label: r("kałamarnica", "кальмар") },
];

const ITEMS: QuizItem[] = [
  { icon: "🌧", name: r("lądowy ślimak z dużą, spiralną muszlą", "наземная улитка с большой спиральной раковиной"), answer: "snail", explain: r("Winniczek — największy ślimak lądowy w Polsce.", "Виноградная улитка — крупнейшая наземная улитка Польши.") },
  { icon: "🥬", name: r("ślimak bez muszli, który zjada sałatę w ogrodzie", "улитка без раковины, которая ест салат в огороде"), answer: "slug", explain: r("Pomrów to ślimak nagi — szkodnik upraw.", "Слизень — голая улитка, вредитель огородов.") },
  { icon: "🏞", name: r("słodkowodny małż z dna jeziora, filtruje wodę", "пресноводный двустворчатый моллюск со дна озера, фильтрует воду"), answer: "mussel", explain: r("Szczeżuja oczyszcza wodę.", "Беззубка очищает воду.") },
  { icon: "🎨", name: r("ma osiem ramion, nie ma muszli i zmienia barwę", "у него восемь щупалец, нет раковины, и он меняет окраску"), answer: "octopus", explain: r("Ośmiornica potrafi też otwierać słoiki!", "Осьминог умеет даже открывать банки!") },
  { icon: "🚀", name: r("szybki morski drapieżnik z dziesięcioma ramionami, pływa odrzutem wody", "быстрый морской хищник с десятью щупальцами, плавает реактивно"), answer: "squid", explain: r("Kałamarnica wyrzuca wodę jak silnik odrzutowy.", "Кальмар выбрасывает воду, как реактивный двигатель.") },
];

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Ciało mięczaka jest miękkie, niesegmentowane, okryte płaszczem, który wytwarza muszlę.", ru: "Тело моллюска мягкое, без сегментов, покрыто мантией, которая образует раковину." },
    { pl: "Ślimak ma nogę do pełzania, czułki z oczami i tarkę.", ru: "У улитки есть нога для ползания, щупальца с глазами и тёрка." },
  ],
  s2: [{ pl: "Ślimaki — jedna skręcona muszla; małże — muszla z dwóch połówek, bez głowy; głowonogi — ramiona z przyssawkami.", ru: "Брюхоногие — одна закрученная раковина; двустворчатые — раковина из двух створок, без головы; головоногие — щупальца с присосками." }],
  s3: [{ pl: "Perła powstaje z warstw masy perłowej wokół ciała obcego w muszli małża.", ru: "Жемчужина образуется из слоёв перламутра вокруг инородного тела в раковине моллюска." }],
  s4: [{ pl: "Małże filtrują wodę i ją oczyszczają; głowonogi to drapieżniki morskie.", ru: "Двустворчатые фильтруют и очищают воду; головоногие — морские хищники." }],
};

export default function MolluscsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <LessonIntro lang={lang} lead={T.lead} prefix="molluscs" sections={[T.s1, T.s2, T.s3, T.s4]} />
      <Section id="molluscs-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <SnailMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>
      <Section id="molluscs-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <CompareTabs lang={lang} cards={GROUPS} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>
      <Section id="molluscs-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <Pearl lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>
      <Section id="molluscs-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <MatchQuiz lang={lang} title={r("🐚 Kto to?", "🐚 Кто это?")} question={r("Kto to:", "Кто это:")} options={OPTIONS} items={ITEMS} wrongHint={r("to inny mięczak.", "это другой моллюск.")} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
