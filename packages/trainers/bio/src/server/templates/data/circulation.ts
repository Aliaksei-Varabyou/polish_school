// Content tables for dział 6, Układ krążenia. Odporność (LO3, zakres rozszerzony).
import type { Difficulty } from "@portal/core";
import type { Bi } from "./hormones.ts";

export interface StructureEntry {
  id: string;
  name: Bi;
  /** noun phrase, so plural names ("zastawki") still fit the singular question frame */
  role: Bi;
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

export const HEART_AND_VESSELS: readonly StructureEntry[] = [
  {
    id: "przedsionek-prawy",
    name: { pl: "prawy przedsionek", ru: "правое предсердие" },
    role: { pl: "przyjmowanie krwi odtlenowanej z żył głównych", ru: "приём венозной крови из полых вен" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "komora-prawa",
    name: { pl: "prawa komora", ru: "правый желудочек" },
    role: { pl: "tłoczenie krwi do pnia płucnego, czyli do krwiobiegu małego", ru: "нагнетание крови в лёгочный ствол, то есть в малый круг" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "przedsionek-lewy",
    name: { pl: "lewy przedsionek", ru: "левое предсердие" },
    role: { pl: "przyjmowanie krwi utlenowanej z żył płucnych", ru: "приём артериальной крови из лёгочных вен" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "komora-lewa",
    name: { pl: "lewa komora", ru: "левый желудочек" },
    role: { pl: "tłoczenie krwi do aorty pod najwyższym ciśnieniem", ru: "нагнетание крови в аорту под наибольшим давлением" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "zastawki-przedsionkowo-komorowe",
    name: { pl: "zastawki przedsionkowo-komorowe", ru: "предсердно-желудочковые клапаны" },
    role: { pl: "zapobieganie cofaniu się krwi z komór do przedsionków", ru: "предотвращение возврата крови из желудочков в предсердия" },
    aliases: { pl: ["zastawka dwudzielna", "zastawka trójdzielna"], ru: ["митральный клапан", "трёхстворчатый клапан"] },
    tier: 2,
  },
  {
    id: "wezel-zatokowo-przedsionkowy",
    name: { pl: "węzeł zatokowo-przedsionkowy", ru: "синусно-предсердный узел" },
    role: { pl: "narzucanie rytmu skurczów jako naturalny rozrusznik serca", ru: "задание ритма сокращений как естественный водитель ритма" },
    aliases: { pl: ["węzeł zatokowy", "rozrusznik serca"], ru: ["синусовый узел", "водитель ритма"] },
    tier: 2,
  },
  {
    id: "tetnice",
    name: { pl: "tętnice", ru: "артерии" },
    role: { pl: "prowadzenie krwi z serca, z grubą warstwą mięśniową i bez zastawek", ru: "проведение крови от сердца, с толстым мышечным слоем и без клапанов" },
    aliases: { pl: ["tętnica"], ru: ["артерия"] },
    tier: 1,
  },
  {
    id: "zyly",
    name: { pl: "żyły", ru: "вены" },
    role: { pl: "prowadzenie krwi do serca, z zastawkami zapobiegającymi cofaniu", ru: "проведение крови к сердцу, с клапанами против обратного тока" },
    aliases: { pl: ["żyła"], ru: ["вена"] },
    tier: 1,
  },
  {
    id: "naczynia-wlosowate",
    name: { pl: "naczynia włosowate", ru: "капилляры" },
    role: { pl: "wymiana gazów i substancji między krwią a tkankami przez jedną warstwę komórek", ru: "обмен газов и веществ между кровью и тканями через один слой клеток" },
    aliases: { pl: ["kapilary", "naczynie włosowate"], ru: ["капилляр"] },
    tier: 1,
  },
  {
    id: "uklad-limfatyczny",
    name: { pl: "naczynia limfatyczne", ru: "лимфатические сосуды" },
    role: { pl: "odprowadzanie nadmiaru płynu tkankowego z powrotem do krwiobiegu", ru: "отведение избытка тканевой жидкости обратно в кровоток" },
    aliases: { pl: ["układ limfatyczny"], ru: ["лимфатическая система"] },
    tier: 2,
  },
];

export const BLOOD_COMPONENTS: readonly StructureEntry[] = [
  {
    id: "erytrocyty",
    name: { pl: "erytrocyty", ru: "эритроциты" },
    role: { pl: "transport tlenu dzięki hemoglobinie, bez jądra komórkowego", ru: "транспорт кислорода благодаря гемоглобину, без клеточного ядра" },
    aliases: { pl: ["krwinki czerwone", "erytrocyt"], ru: ["красные кровяные клетки", "эритроцит"] },
    tier: 1,
  },
  {
    id: "leukocyty",
    name: { pl: "leukocyty", ru: "лейкоциты" },
    role: { pl: "obrona organizmu przed patogenami", ru: "защита организма от патогенов" },
    aliases: { pl: ["krwinki białe", "leukocyt"], ru: ["белые кровяные клетки", "лейкоцит"] },
    tier: 1,
  },
  {
    id: "trombocyty",
    name: { pl: "trombocyty", ru: "тромбоциты" },
    role: { pl: "udział w krzepnięciu krwi jako fragmenty komórek szpiku", ru: "участие в свёртывании крови как фрагменты клеток костного мозга" },
    aliases: { pl: ["płytki krwi", "trombocyt"], ru: ["кровяные пластинки", "тромбоцит"] },
    tier: 1,
  },
  {
    id: "osocze",
    name: { pl: "osocze", ru: "плазма крови" },
    role: { pl: "płynna część krwi, w ponad 90% złożona z wody", ru: "жидкая часть крови, более чем на 90% состоящая из воды" },
    aliases: { pl: [], ru: ["плазма"] },
    tier: 1,
  },
  {
    id: "fibrynogen",
    name: { pl: "fibrynogen", ru: "фибриноген" },
    role: { pl: "białko osocza przekształcane w fibrynę podczas krzepnięcia", ru: "белок плазмы, превращающийся в фибрин при свёртывании" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "limfocyty-b",
    name: { pl: "limfocyty B", ru: "B-лимфоциты" },
    role: { pl: "wytwarzanie przeciwciał po przekształceniu w komórki plazmatyczne", ru: "выработка антител после превращения в плазматические клетки" },
    aliases: { pl: ["limfocyt B"], ru: ["B-лимфоцит"] },
    tier: 2,
  },
  {
    id: "limfocyty-t",
    name: { pl: "limfocyty T", ru: "T-лимфоциты" },
    role: { pl: "niszczenie komórek zakażonych i sterowanie odpowiedzią odpornościową", ru: "уничтожение заражённых клеток и управление иммунным ответом" },
    aliases: { pl: ["limfocyt T"], ru: ["T-лимфоцит"] },
    tier: 2,
  },
  {
    id: "makrofagi",
    name: { pl: "makrofagi", ru: "макрофаги" },
    role: { pl: "fagocytoza patogenów i prezentowanie ich antygenów", ru: "фагоцитоз патогенов и представление их антигенов" },
    aliases: { pl: ["makrofag"], ru: ["макрофаг"] },
    tier: 2,
  },
];

export const IMMUNITY: readonly StructureEntry[] = [
  {
    id: "nieswoista",
    name: { pl: "odporność nieswoista", ru: "неспецифический иммунитет" },
    role: { pl: "wrodzone bariery i fagocytoza, działające tak samo wobec każdego patogenu", ru: "врождённые барьеры и фагоцитоз, действующие одинаково против любого патогена" },
    aliases: { pl: ["odporność wrodzona"], ru: ["врождённый иммунитет"] },
    tier: 1,
  },
  {
    id: "swoista",
    name: { pl: "odporność swoista", ru: "специфический иммунитет" },
    role: { pl: "rozpoznawanie konkretnego antygenu i pamięć immunologiczna", ru: "распознавание конкретного антигена и иммунная память" },
    aliases: { pl: ["odporność nabyta"], ru: ["приобретённый иммунитет"] },
    tier: 1,
  },
  {
    id: "czynna-naturalna",
    name: { pl: "odporność czynna naturalna", ru: "естественный активный иммунитет" },
    role: { pl: "własne przeciwciała wytworzone po przechorowaniu zakażenia", ru: "собственные антитела, выработанные после перенесённой инфекции" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "czynna-sztuczna",
    name: { pl: "odporność czynna sztuczna", ru: "искусственный активный иммунитет" },
    role: { pl: "własne przeciwciała wytworzone po podaniu szczepionki", ru: "собственные антитела, выработанные после введения вакцины" },
    aliases: { pl: ["szczepienie"], ru: ["вакцинация"] },
    tier: 2,
  },
  {
    id: "bierna-naturalna",
    name: { pl: "odporność bierna naturalna", ru: "естественный пассивный иммунитет" },
    role: { pl: "gotowe przeciwciała otrzymane od matki przez łożysko lub z mlekiem", ru: "готовые антитела, полученные от матери через плаценту или с молоком" },
    aliases: { pl: [], ru: [] },
    tier: 3,
  },
  {
    id: "bierna-sztuczna",
    name: { pl: "odporność bierna sztuczna", ru: "искусственный пассивный иммунитет" },
    role: { pl: "gotowe przeciwciała podane w surowicy, działające natychmiast i krótko", ru: "готовые антитела, введённые с сывороткой, действующие сразу и недолго" },
    aliases: { pl: ["surowica"], ru: ["сыворотка"] },
    tier: 2,
  },
];

export interface BloodGroupEntry {
  id: string;
  group: Bi;
  /** which groups this one may receive from — the distinguishing fact, phrased as a noun phrase */
  receivesFrom: Bi;
  antigens: Bi;
  antibodies: Bi;
  tier: Difficulty;
}

export const BLOOD_GROUPS: readonly BloodGroupEntry[] = [
  {
    id: "0-minus",
    group: { pl: "0 Rh−", ru: "0 Rh−" },
    receivesFrom: { pl: "tylko od grupy 0 Rh−", ru: "только от группы 0 Rh−" },
    antigens: { pl: "brak antygenów A, B i D", ru: "нет антигенов A, B и D" },
    antibodies: { pl: "przeciwciała anty-A i anty-B", ru: "антитела анти-A и анти-B" },
    tier: 2,
  },
  {
    id: "0-plus",
    group: { pl: "0 Rh+", ru: "0 Rh+" },
    receivesFrom: { pl: "od grup 0 Rh− i 0 Rh+", ru: "от групп 0 Rh− и 0 Rh+" },
    antigens: { pl: "tylko antygen D", ru: "только антиген D" },
    antibodies: { pl: "przeciwciała anty-A i anty-B, bez anty-D", ru: "антитела анти-A и анти-B, без анти-D" },
    tier: 2,
  },
  {
    id: "a-minus",
    group: { pl: "A Rh−", ru: "A Rh−" },
    receivesFrom: { pl: "od grup 0 Rh− i A Rh−", ru: "от групп 0 Rh− и A Rh−" },
    antigens: { pl: "tylko antygen A", ru: "только антиген A" },
    antibodies: { pl: "przeciwciała anty-B", ru: "антитела анти-B" },
    tier: 2,
  },
  {
    id: "b-minus",
    group: { pl: "B Rh−", ru: "B Rh−" },
    receivesFrom: { pl: "od grup 0 Rh− i B Rh−", ru: "от групп 0 Rh− и B Rh−" },
    antigens: { pl: "tylko antygen B", ru: "только антиген B" },
    antibodies: { pl: "przeciwciała anty-A", ru: "антитела анти-A" },
    tier: 2,
  },
  {
    id: "ab-plus",
    group: { pl: "AB Rh+", ru: "AB Rh+" },
    receivesFrom: { pl: "od każdej grupy — to uniwersalny biorca", ru: "от любой группы — это универсальный реципиент" },
    antigens: { pl: "antygeny A, B i D", ru: "антигены A, B и D" },
    antibodies: { pl: "brak przeciwciał anty-A i anty-B", ru: "нет антител анти-A и анти-B" },
    tier: 1,
  },
  {
    id: "ab-minus",
    group: { pl: "AB Rh−", ru: "AB Rh−" },
    receivesFrom: { pl: "od wszystkich grup Rh−", ru: "от всех групп Rh−" },
    antigens: { pl: "antygeny A i B, bez D", ru: "антигены A и B, без D" },
    antibodies: { pl: "brak przeciwciał anty-A i anty-B, bez anty-D", ru: "нет антител анти-A и анти-B, без анти-D" },
    tier: 3,
  },
];
