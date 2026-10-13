// Lesson for §3.3 "Owady – stawonogi zdolne do lotu" (Puls życia 6). The terms match the task bank
// of the same paragraph (templates/data/sp6Invertebrates.ts), so the explanation and the test use
// the same words.
import type { LessonProps, Txt } from "../kit.tsx";
import { Remember, Section } from "../kit.tsx";
import { BodyMap } from "./BodyMap.tsx";
import { Classifier } from "./Classifier.tsx";
import { Metamorphosis } from "./Metamorphosis.tsx";
import { MouthLab } from "./MouthLab.tsx";

const T = {
  lead: {
    pl: "Owady to najliczniejsza grupa zwierząt na Ziemi — opisano ich ponad milion gatunków, więcej niż wszystkich pozostałych zwierząt razem. Żyją prawie wszędzie: na lądzie, w wodach słodkich i w powietrzu. Są stawonogami, więc mają odnóża członowane i twardy pancerz z chityny, z którego wyrastają, linieją.",
    ru: "Насекомые — самая многочисленная группа животных на Земле: описано больше миллиона видов, больше, чем всех остальных животных вместе взятых. Они живут почти везде — на суше, в пресных водах и в воздухе. Это членистоногие, поэтому у них членистые ноги и твёрдый хитиновый панцирь, из которого они вырастают, линяя.",
  },
  contents: { pl: "W tej lekcji", ru: "В этом уроке" },
  s1: { pl: "Jak zbudowany jest owad", ru: "Как устроено насекомое" },
  s1intro: {
    pl: "Ciało owada dzieli się na trzy części: głowę, tułów i odwłok. Przyjrzyj się każdej z nich.",
    ru: "Тело насекомого делится на три отдела: голову, грудь и брюшко. Рассмотри каждый из них.",
  },
  s2: { pl: "Czy to owad?", ru: "Это насекомое?" },
  s2intro: {
    pl: "Nie każdy „robaczek” jest owadem. Pająk, rak i kleszcz też są stawonogami, ale należą do innych grup. Rozpoznaj zwierzę, odpowiadając na pytania klucza.",
    ru: "Не всякая «букашка» — насекомое. Паук, рак и клещ тоже членистоногие, но относятся к другим группам. Определи животное, отвечая на вопросы ключа.",
  },
  s3: { pl: "Laboratorium aparatów gębowych", ru: "Лаборатория ротовых аппаратов" },
  s3intro: {
    pl: "Owady jedzą bardzo różne rzeczy: liście, nektar, krew, sok roślin. Do każdego pokarmu pasuje inny aparat gębowy.",
    ru: "Насекомые едят очень разное: листья, нектар, кровь, сок растений. К каждой пище подходит свой ротовой аппарат.",
  },
  s4: { pl: "Jak rozwijają się owady", ru: "Как развиваются насекомые" },
  s4intro: {
    pl: "Owady rozmnażają się płciowo, a z jaj wylęgają się larwy. Dalej rozwój przebiega na dwa sposoby. Przesuwaj suwak i porównaj motyla z konikiem polnym.",
    ru: "Насекомые размножаются половым путём, из яиц выходят личинки. Дальше развитие идёт двумя путями. Двигай ползунок и сравни бабочку с кузнечиком.",
  },
} satisfies Record<string, Txt>;

const REMEMBER: Record<"s1" | "s2" | "s3" | "s4", Txt[]> = {
  s1: [
    { pl: "Ciało owada: głowa, tułów i odwłok.", ru: "Тело насекомого: голова, грудь и брюшко." },
    { pl: "Na głowie: jedna para czułków, oczy złożone, aparat gębowy.", ru: "На голове: одна пара усиков, фасеточные глаза, ротовой аппарат." },
    { pl: "Na tułowiu: trzy pary odnóży i zwykle dwie pary skrzydeł.", ru: "На груди: три пары ног и обычно две пары крыльев." },
    { pl: "Owady oddychają tchawkami, które otwierają się przetchlinkami.", ru: "Насекомые дышат трахеями, которые открываются дыхальцами." },
  ],
  s2: [
    { pl: "Owad: 3 pary odnóży, 1 para czułków.", ru: "Насекомое: 3 пары ног, 1 пара усиков." },
    { pl: "Pajęczak: 4 pary odnóży, brak czułków.", ru: "Паукообразное: 4 пары ног, усиков нет." },
    { pl: "Skorupiak: 5 i więcej par odnóży, 2 pary czułków.", ru: "Ракообразное: 5 и больше пар ног, 2 пары усиков." },
  ],
  s3: [
    { pl: "Gryzący — pokarm stały (konik polny, chrabąszcz).", ru: "Грызущий — твёрдая пища (кузнечик, майский жук)." },
    { pl: "Kłująco-ssący — krew lub sok roślin (komar, mszyca).", ru: "Колюще-сосущий — кровь или сок растений (комар, тля)." },
    { pl: "Ssący — nektar (motyl). Liżący — płynny pokarm (mucha domowa).", ru: "Сосущий — нектар (бабочка). Лижущий — жидкая пища (комнатная муха)." },
  ],
  s4: [
    { pl: "Przeobrażenie zupełne: jajo → larwa → poczwarka → postać dorosła.", ru: "Полное превращение: яйцо → личинка → куколка → взрослая особь." },
    { pl: "Przeobrażenie niezupełne: jajo → larwa → postać dorosła (bez poczwarki).", ru: "Неполное превращение: яйцо → личинка → взрослая особь (без куколки)." },
    { pl: "Larwa rośnie, linieje kilka razy; dorosły owad już nie rośnie.", ru: "Личинка растёт и несколько раз линяет; взрослое насекомое больше не растёт." },
  ],
};

const SECTIONS = ["s1", "s2", "s3", "s4"] as const;

export default function InsectsLesson({ lang }: LessonProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 p-5 ring-1 ring-emerald-200 sm:p-7">
        <p className="text-[15px] leading-relaxed text-slate-700 sm:text-base">{T.lead[lang]}</p>
        <nav className="mt-4" aria-label={T.contents[lang]}>
          <div className="mb-2 text-xs font-semibold tracking-wide text-emerald-800 uppercase">{T.contents[lang]}</div>
          <ol className="grid gap-1.5 sm:grid-cols-2">
            {SECTIONS.map((s, i) => (
              <li key={s}>
                <a
                  href={`#insects-${s}`}
                  // scroll without touching the URL: the portal's router owns it
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`insects-${s}`)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-sm text-slate-700 ring-1 ring-emerald-100 hover:bg-white">
                  <span className="font-semibold text-emerald-700">{i + 1}.</span> {T[s][lang]}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <Section id="insects-s1" n={1} title={T.s1[lang]} intro={<p>{T.s1intro[lang]}</p>}>
        <BodyMap lang={lang} />
        <Remember lang={lang} items={REMEMBER.s1} />
      </Section>

      <Section id="insects-s2" n={2} title={T.s2[lang]} intro={<p>{T.s2intro[lang]}</p>}>
        <Classifier lang={lang} />
        <Remember lang={lang} items={REMEMBER.s2} />
      </Section>

      <Section id="insects-s3" n={3} title={T.s3[lang]} intro={<p>{T.s3intro[lang]}</p>}>
        <MouthLab lang={lang} />
        <Remember lang={lang} items={REMEMBER.s3} />
      </Section>

      <Section id="insects-s4" n={4} title={T.s4[lang]} intro={<p>{T.s4intro[lang]}</p>}>
        <Metamorphosis lang={lang} />
        <Remember lang={lang} items={REMEMBER.s4} />
      </Section>
    </div>
  );
}
