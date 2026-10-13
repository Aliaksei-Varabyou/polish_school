// Block 3: beaks. Six heads with six beak shapes; for each food the student picks the beak that
// can get it, and learns which bird it is.
import type { BioLang } from "../../../lang.ts";
import { MatchQuiz, type QuizItem, type QuizOption } from "../games.tsx";

function head(beak: string, color = "#f59e0b", extra?: string) {
  return (
    <svg viewBox="0 0 100 70" className="mx-auto h-16 w-24" aria-hidden>
      <circle cx={62} cy={38} r={22} fill="#94a3b8" />
      <path d={beak} fill={color} stroke="#78350f" strokeWidth={1.2} strokeLinejoin="round" />
      {extra && <path d={extra} fill="none" stroke="#78350f" strokeWidth={1} />}
      <circle cx={56} cy={32} r={3.5} fill="#0f172a" />
    </svg>
  );
}

const OPTIONS: QuizOption[] = [
  { id: "hook", label: { pl: "hakowaty", ru: "крючковатый" }, art: head("M44 32 L 18 34 C 8 37, 8 48, 14 53 C 15 46, 20 44, 44 45 Z", "#475569") },
  { id: "cone", label: { pl: "stożkowaty", ru: "конусовидный" }, art: head("M44 30 L 22 39 L 44 48 Z", "#fbbf24") },
  { id: "chisel", label: { pl: "dłutowaty", ru: "долотовидный" }, art: head("M44 34 L 8 39 L 8 41 L 44 45 Z", "#57534e") },
  { id: "flat", label: { pl: "płaski z blaszkami", ru: "плоский с пластинками" }, art: head("M44 33 C 30 31, 12 33, 10 40 C 12 47, 30 47, 44 46 Z", "#facc15", "M14 41 L 42 41 M18 38 l 0 3 M24 38 l 0 3 M30 38 l 0 3 M36 38 l 0 3") },
  { id: "spear", label: { pl: "długi i ostry", ru: "длинный и острый" }, art: head("M44 35 L 0 40 L 44 44 Z", "#ef4444") },
  { id: "gape", label: { pl: "krótki, szeroko otwierany", ru: "короткий, широко раскрывающийся" }, art: head("M44 33 L 32 26 L 40 37 Z M44 45 L 32 52 L 40 42 Z", "#1f2937") },
];

const ITEMS: QuizItem[] = [
  {
    icon: "🐭",
    name: { pl: "mysz", ru: "мышь" },
    answer: "hook",
    explain: {
      pl: "Haczykowaty dziób ptaka drapieżnego rozrywa mięso, a zdobycz chwytają szpony — tak poluje myszołów, orzeł czy sowa.",
      ru: "Крючковатый клюв хищной птицы разрывает мясо, а добычу хватают когти — так охотятся канюк, орёл и сова.",
    },
  },
  {
    icon: "🌻",
    name: { pl: "nasiona", ru: "семена" },
    answer: "cone",
    explain: {
      pl: "Krótki, gruby, stożkowaty dziób łupie twarde nasiona — tak je wróbel, dzwoniec i grubodziób.",
      ru: "Короткий толстый конусовидный клюв раскалывает твёрдые семена — так едят воробей, зеленушка и дубонос.",
    },
  },
  {
    icon: "🪵",
    name: { pl: "larwy owadów ukryte pod korą", ru: "личинки насекомых под корой" },
    answer: "chisel",
    explain: {
      pl: "Dzięcioł kuje drewno mocnym, dłutowatym dziobem, a larwy wyciąga długim, lepkim językiem.",
      ru: "Дятел долбит древесину крепким долотовидным клювом, а личинок достаёт длинным липким языком.",
    },
  },
  {
    icon: "🦐",
    name: { pl: "drobne roślinki i zwierzęta w mulistej wodzie", ru: "мелкие растения и животные в илистой воде" },
    answer: "flat",
    explain: {
      pl: "Kaczka krzyżówka przecedza wodę przez blaszki na brzegach płaskiego dzioba, a jedzenie zostaje w środku.",
      ru: "Кряква процеживает воду через пластинки по краям плоского клюва, а еда остаётся внутри.",
    },
  },
  {
    icon: "🐸",
    name: { pl: "żaby i ryby na płyciźnie", ru: "лягушки и рыба на мелководье" },
    answer: "spear",
    explain: {
      pl: "Długi, ostry dziób działa jak szczypce albo harpun — tak polują bocian i czapla, brodząc w płytkiej wodzie.",
      ru: "Длинный острый клюв работает как щипцы или гарпун — так охотятся аист и цапля, бродя по мелководью.",
    },
  },
  {
    icon: "🦟",
    name: { pl: "owady latające w powietrzu", ru: "насекомые, летающие в воздухе" },
    answer: "gape",
    explain: {
      pl: "Jaskółka ma krótki dziób, ale bardzo szeroko otwiera paszczę i łapie owady w locie — jak siatką.",
      ru: "У ласточки короткий клюв, но она очень широко раскрывает рот и ловит насекомых на лету — как сачком.",
    },
  },
];

export function Beaks({ lang }: { lang: BioLang }) {
  return (
    <MatchQuiz
      lang={lang}
      title={{ pl: "🍽 Jaki dziób?", ru: "🍽 Какой клюв?" }}
      question={{ pl: "Który dziób pomoże zdobyć i zjeść:", ru: "Какой клюв поможет добыть и съесть:" }}
      options={OPTIONS}
      items={ITEMS}
      wrongHint={{
        pl: "tym dziobem trudno byłoby to zjeść. Pomyśl: trzeba rozrywać, łupać, kuć, cedzić, chwytać czy łapać w locie?",
        ru: "таким клювом это трудно съесть. Подумай: нужно рвать, раскалывать, долбить, процеживать, хватать или ловить на лету?",
      }}
    />
  );
}
