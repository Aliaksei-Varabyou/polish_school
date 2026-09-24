// Content tables for §1.3 Homeostaza. Kept apart from the membrane-transport rows of §1.2 on purpose:
// wrong options are drawn from the same table, and "diffusion" is no trap for "homeostasis".
import type { Difficulty } from "@portal/core";
import type { NamedEntry } from "../tableTemplate.ts";
import type { Bi } from "./hormones.ts";

export const HOMEOSTASIS: readonly NamedEntry[] = [
  {
    id: "homeostaza",
    name: { pl: "homeostaza", ru: "гомеостаз" },
    role: { pl: "utrzymywanie stałości środowiska wewnętrznego mimo zmian na zewnątrz", ru: "поддержание постоянства внутренней среды несмотря на внешние изменения" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "sprzezenie-ujemne",
    name: { pl: "ujemne sprzężenie zwrotne", ru: "отрицательная обратная связь" },
    role: { pl: "wygaszanie odchylenia przez reakcję działającą w przeciwnym kierunku", ru: "гашение отклонения ответом, действующим в противоположную сторону" },
    aliases: { pl: ["sprzężenie zwrotne ujemne"], ru: ["отрицательная связь"] },
    tier: 1,
  },
  {
    id: "sprzezenie-dodatnie",
    name: { pl: "dodatnie sprzężenie zwrotne", ru: "положительная обратная связь" },
    role: { pl: "wzmacnianie odchylenia aż do zakończenia procesu, jak przy porodzie", ru: "усиление отклонения до завершения процесса, как при родах" },
    aliases: { pl: ["sprzężenie zwrotne dodatnie"], ru: ["положительная связь"] },
    tier: 2,
  },
  {
    id: "receptor",
    name: { pl: "receptor", ru: "рецептор" },
    role: { pl: "wykrywanie zmiany parametru środowiska wewnętrznego lub zewnętrznego", ru: "обнаружение изменения показателя внутренней или внешней среды" },
    aliases: { pl: ["receptory"], ru: ["рецепторы"] },
    tier: 1,
  },
  {
    id: "osrodek-integrujacy",
    name: { pl: "ośrodek integrujący", ru: "интегрирующий центр" },
    role: { pl: "porównanie sygnału z wartością prawidłową i wysłanie polecenia do efektora", ru: "сравнение сигнала с нормой и отправка команды эффектору" },
    aliases: { pl: ["ośrodek regulacyjny", "ośrodek sterujący"], ru: ["регуляторный центр", "управляющий центр"] },
    tier: 2,
  },
  {
    id: "efektor",
    name: { pl: "efektor", ru: "эффектор" },
    role: { pl: "wykonanie reakcji przywracającej wartość prawidłową, np. przez mięsień lub gruczoł", ru: "выполнение ответа, возвращающего норму, например мышцей или железой" },
    aliases: { pl: ["efektory"], ru: ["эффекторы"] },
    tier: 1,
  },
  {
    id: "termoregulacja",
    name: { pl: "termoregulacja", ru: "терморегуляция" },
    role: { pl: "utrzymywanie stałej temperatury ciała przez regulację wytwarzania i oddawania ciepła", ru: "поддержание постоянной температуры тела регуляцией теплообразования и теплоотдачи" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "stalocieplnosc",
    name: { pl: "stałocieplność", ru: "теплокровность" },
    role: { pl: "zdolność do stałej temperatury ciała niezależnie od otoczenia dzięki ciepłu z metabolizmu (ptaki i ssaki)", ru: "способность сохранять постоянную температуру тела независимо от среды за счёт тепла обмена веществ (птицы и млекопитающие)" },
    aliases: { pl: ["endotermia", "homeotermia"], ru: ["эндотермия", "гомойотермия", "гомеотермия"] },
    tier: 2,
  },
  {
    id: "zmiennocieplnosc",
    name: { pl: "zmiennocieplność", ru: "холоднокровность" },
    role: { pl: "zależność temperatury ciała od temperatury otoczenia (ryby, płazy, gady)", ru: "зависимость температуры тела от температуры среды (рыбы, земноводные, пресмыкающиеся)" },
    aliases: { pl: ["ektotermia", "poikilotermia"], ru: ["эктотермия", "пойкилотермия"] },
    tier: 2,
  },
  {
    id: "osmoregulacja",
    name: { pl: "osmoregulacja", ru: "осморегуляция" },
    role: { pl: "utrzymywanie stałego stężenia soli i ilości wody w płynach ustrojowych", ru: "поддержание постоянной концентрации солей и количества воды в жидкостях тела" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "goraczka",
    name: { pl: "gorączka", ru: "лихорадка" },
    role: { pl: "przestawienie ośrodka termoregulacji na wyższą temperaturę w odpowiedzi na infekcję", ru: "перенастройка центра терморегуляции на более высокую температуру в ответ на инфекцию" },
    aliases: { pl: ["podwyższona temperatura"], ru: ["жар", "повышенная температура"] },
    tier: 2,
  },
  {
    id: "hipotermia",
    name: { pl: "hipotermia", ru: "гипотермия" },
    role: { pl: "niebezpieczne obniżenie temperatury głębokiej ciała poniżej 35 °C", ru: "опасное снижение внутренней температуры тела ниже 35 °C" },
    aliases: { pl: ["wychłodzenie"], ru: ["переохлаждение"] },
    tier: 2,
  },
  {
    id: "odwodnienie",
    name: { pl: "odwodnienie", ru: "обезвоживание" },
    role: { pl: "zaburzenie homeostazy wywołane utratą wody większą niż jej pobieranie", ru: "нарушение гомеостаза из-за потери воды, превышающей её поступление" },
    aliases: { pl: ["dehydratacja"], ru: ["дегидратация"] },
    tier: 1,
  },
];

/** A physiological quantity the body holds steady, and its normal value. */
export interface ParameterEntry {
  id: string;
  parameter: Bi;
  norm: Bi;
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

export const PARAMETERS: readonly ParameterEntry[] = [
  {
    id: "temperatura",
    parameter: { pl: "temperatura wewnętrzna ciała", ru: "внутренняя температура тела" },
    norm: { pl: "około 36,6 °C (36–37 °C)", ru: "около 36,6 °C (36–37 °C)" },
    aliases: { pl: ["temperatura ciała", "temperatura"], ru: ["температура тела", "температура"] },
    tier: 1,
  },
  {
    id: "ph-krwi",
    parameter: { pl: "pH krwi", ru: "pH крови" },
    norm: { pl: "7,35–7,45", ru: "7,35–7,45" },
    aliases: { pl: ["pH", "odczyn krwi"], ru: ["pH", "рН крови", "кислотность крови"] },
    tier: 2,
  },
  {
    id: "glukoza",
    parameter: { pl: "stężenie glukozy we krwi", ru: "уровень глюкозы в крови" },
    norm: { pl: "70–99 mg/dl na czczo", ru: "70–99 мг/дл натощак" },
    aliases: { pl: ["glukoza", "glikemia", "poziom glukozy"], ru: ["глюкоза", "сахар крови", "гликемия"] },
    tier: 2,
  },
  {
    id: "cisnienie",
    parameter: { pl: "ciśnienie tętnicze krwi", ru: "артериальное давление" },
    norm: { pl: "około 120/80 mm Hg", ru: "около 120/80 мм рт. ст." },
    aliases: { pl: ["ciśnienie krwi", "ciśnienie"], ru: ["давление", "давление крови"] },
    tier: 1,
  },
  {
    id: "tetno",
    parameter: { pl: "tętno", ru: "пульс" },
    norm: { pl: "60–80 uderzeń na minutę w spoczynku", ru: "60–80 ударов в минуту в покое" },
    aliases: { pl: ["puls", "częstość skurczów serca"], ru: ["частота сердечных сокращений", "ЧСС"] },
    tier: 1,
  },
  {
    id: "oddechy",
    parameter: { pl: "częstość oddechów", ru: "частота дыхания" },
    norm: { pl: "12–20 oddechów na minutę w spoczynku", ru: "12–20 вдохов в минуту в покое" },
    aliases: { pl: ["liczba oddechów", "częstotliwość oddechów"], ru: ["частота дыхательных движений", "ЧДД"] },
    tier: 2,
  },
];

/** A disturbance of the internal environment and how the body answers it. */
export interface ResponseEntry {
  id: string;
  deviation: Bi;
  response: Bi;
  /** almost every loop damps the change; birth is the textbook's one that amplifies it */
  feedback: "ujemne" | "dodatnie";
  tier: Difficulty;
}

export const RESPONSES: readonly ResponseEntry[] = [
  {
    id: "temperatura-wzrost",
    deviation: { pl: "wzrost temperatury ciała", ru: "повышение температуры тела" },
    response: { pl: "rozszerzenie naczyń skóry i wydzielanie potu", ru: "расширение сосудов кожи и потоотделение" },
    feedback: "ujemne",
    tier: 1,
  },
  {
    id: "temperatura-spadek",
    deviation: { pl: "spadek temperatury ciała", ru: "понижение температуры тела" },
    response: { pl: "zwężenie naczyń skóry i drżenie mięśni", ru: "сужение сосудов кожи и мышечная дрожь" },
    feedback: "ujemne",
    tier: 1,
  },
  {
    id: "glukoza-wzrost",
    deviation: { pl: "wzrost stężenia glukozy we krwi", ru: "повышение уровня глюкозы в крови" },
    response: { pl: "wydzielanie insuliny i magazynowanie glukozy jako glikogenu", ru: "выделение инсулина и запасание глюкозы в виде гликогена" },
    feedback: "ujemne",
    tier: 1,
  },
  {
    id: "glukoza-spadek",
    deviation: { pl: "spadek stężenia glukozy we krwi", ru: "понижение уровня глюкозы в крови" },
    response: { pl: "wydzielanie glukagonu i rozkład glikogenu w wątrobie", ru: "выделение глюкагона и распад гликогена в печени" },
    feedback: "ujemne",
    tier: 2,
  },
  {
    id: "woda-niedobor",
    deviation: { pl: "niedobór wody w organizmie", ru: "недостаток воды в организме" },
    response: { pl: "uczucie pragnienia i zagęszczanie moczu pod wpływem ADH", ru: "чувство жажды и концентрирование мочи под действием АДГ" },
    feedback: "ujemne",
    tier: 2,
  },
  {
    id: "co2-wzrost",
    deviation: { pl: "wzrost stężenia CO₂ we krwi", ru: "повышение концентрации CO₂ в крови" },
    response: { pl: "przyspieszenie i pogłębienie oddechów", ru: "учащение и углубление дыхания" },
    feedback: "ujemne",
    tier: 2,
  },
  {
    id: "cisnienie-spadek",
    deviation: { pl: "spadek ciśnienia tętniczego krwi", ru: "падение артериального давления" },
    response: { pl: "przyspieszenie pracy serca i zwężenie naczyń krwionośnych", ru: "учащение работы сердца и сужение кровеносных сосудов" },
    feedback: "ujemne",
    tier: 2,
  },
  {
    id: "porod",
    deviation: { pl: "rozciąganie szyjki macicy podczas porodu", ru: "растяжение шейки матки во время родов" },
    response: { pl: "coraz silniejsze wydzielanie oksytocyny i skurcze macicy", ru: "всё более сильное выделение окситоцина и сокращения матки" },
    feedback: "dodatnie",
    tier: 2,
  },
];
