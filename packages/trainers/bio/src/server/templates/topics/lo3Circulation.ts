// Dział 6: Układ krążenia. Odporność. The largest dział of the year — heart and vessels, blood,
// blood groups and immunity — plus the cardiac-output calculations.
import { intRange } from "@portal/trainer-sdk/templates";
import { calcTemplate, choiceFromTable, pairFromTable, type BioTemplate } from "../tableTemplate.ts";
import { BLOOD_COMPONENTS, BLOOD_GROUPS, HEART_AND_VESSELS, IMMUNITY, type BloodGroupEntry } from "../data/circulation.ts";

const TOPIC = "bio.lo3.circulation";
const HEART = { pl: "budowa i praca serca, naczynia krwionośne", ru: "строение и работа сердца, кровеносные сосуды" };
const BLOOD = { pl: "skład i funkcje krwi", ru: "состав и функции крови" };
const GROUPS = { pl: "grupy krwi i transfuzje", ru: "группы крови и переливание" };
const DEFENCE = { pl: "odporność nieswoista i swoista", ru: "неспецифический и специфический иммунитет" };

const tier = (row: BloodGroupEntry) => row.tier;

const heartTemplates = pairFromTable({
  topicId: TOPIC,
  slug: "heart",
  rows: HEART_AND_VESSELS,
  subtopic: HEART,
  shift: 0,
  label: { pl: "Element", ru: "Элемент" },
  misconception: {
    pl: "rola sąsiedniej jamy serca albo innego rodzaju naczynia",
    ru: "роль соседней камеры сердца или другого типа сосуда",
  },
});

const bloodTemplates = pairFromTable({
  topicId: TOPIC,
  slug: "blood",
  rows: BLOOD_COMPONENTS,
  subtopic: BLOOD,
  shift: 1,
  label: { pl: "Składnik krwi", ru: "Компонент крови" },
  misconception: { pl: "rola innego składnika krwi", ru: "роль другого компонента крови" },
});

const immunityTemplates = pairFromTable({
  topicId: TOPIC,
  slug: "immunity",
  rows: IMMUNITY,
  subtopic: DEFENCE,
  shift: 2,
  label: { pl: "Rodzaj odporności", ru: "Вид иммунитета" },
  misconception: {
    pl: "inny rodzaj odporności — czynna zamiast biernej albo naturalna zamiast sztucznej",
    ru: "другой вид иммунитета — активный вместо пассивного или естественный вместо искусственного",
  },
});

const transfusion = choiceFromTable<BloodGroupEntry>({
  id: `${TOPIC}.transfusion`,
  topicId: TOPIC,
  rows: BLOOD_GROUPS,
  subtopic: GROUPS,
  difficulty: tier,
  shift: 0,
  question: (g, lang) =>
    lang === "pl"
      ? `Biorca ma grupę krwi ${g.group.pl}. Od kogo może przyjąć krew?`
      : `У реципиента группа крови ${g.group.ru}. От кого он может принять кровь?`,
  optionText: (g, lang) => g.receivesFrom[lang],
  misconception: {
    pl: "zgodność innej grupy — najczęściej pominięty czynnik Rh",
    ru: "совместимость другой группы — чаще всего забыт резус-фактор",
  },
  hint: (g, lang) => (lang === "pl" ? `Biorca ma ${g.antibodies.pl}.` : `У реципиента ${g.antibodies.ru}.`),
  solution: (g, lang) =>
    lang === "pl"
      ? `Grupa ${g.group.pl}: ${g.antigens.pl}, ${g.antibodies.pl}. Dlatego może przyjąć krew ${g.receivesFrom.pl}.`
      : `Группа ${g.group.ru}: ${g.antigens.ru}, ${g.antibodies.ru}. Поэтому может принять кровь ${g.receivesFrom.ru}.`,
});

const antigens = choiceFromTable<BloodGroupEntry>({
  id: `${TOPIC}.group-to-antigens`,
  topicId: TOPIC,
  rows: BLOOD_GROUPS,
  subtopic: GROUPS,
  difficulty: tier,
  shift: 2,
  question: (g, lang) =>
    lang === "pl"
      ? `Grupa krwi: ${g.group.pl}. Jakie antygeny występują na erytrocytach?`
      : `Группа крови: ${g.group.ru}. Какие антигены есть на эритроцитах?`,
  optionText: (g, lang) => g.antigens[lang],
  misconception: { pl: "antygeny innej grupy krwi", ru: "антигены другой группы крови" },
  solution: (g, lang) =>
    lang === "pl"
      ? `Grupa ${g.group.pl}: ${g.antigens.pl}. W osoczu: ${g.antibodies.pl}.`
      : `Группа ${g.group.ru}: ${g.antigens.ru}. В плазме: ${g.antibodies.ru}.`,
});

// ---- calculations ----

const cardiacOutput = calcTemplate({
  id: `${TOPIC}.cardiac-output`,
  topicId: TOPIC,
  subtopic: HEART,
  tags: ["obliczenia"],
  difficulty: 1,
  params: { sv: intRange(6, 9), hr: intRange(55, 90) },
  decimals: 2,
  formula: (p) => `(${p.sv * 10} * ${p.hr}) / 1000`,
  value: (p) => (p.sv * 10 * p.hr) / 1000,
  question: (p, lang) =>
    lang === "pl"
      ? `Objętość wyrzutowa serca wynosi ${p.sv * 10} ml, a tętno ${p.hr} uderzeń na minutę. Oblicz pojemność minutową serca w litrach na minutę.`
      : `Ударный объём сердца равен ${p.sv * 10} мл, пульс ${p.hr} ударов в минуту. Вычисли минутный объём сердца в литрах в минуту.`,
  hint: (_p, lang) =>
    lang === "pl" ? "Pojemność minutowa = objętość wyrzutowa × częstość skurczów." : "Минутный объём = ударный объём × частота сокращений.",
  solution: (p, answer, lang) =>
    lang === "pl"
      ? `${p.sv * 10} ml × ${p.hr} = ${p.sv * 10 * p.hr} ml/min = ${answer} l/min.`
      : `${p.sv * 10} мл × ${p.hr} = ${p.sv * 10 * p.hr} мл/мин = ${answer} л/мин.`,
});

const strokeVolume = calcTemplate({
  id: `${TOPIC}.stroke-volume`,
  topicId: TOPIC,
  subtopic: HEART,
  tags: ["obliczenia"],
  difficulty: 2,
  params: { edv: intRange(11, 14), esv: intRange(4, 6) },
  formula: (p) => `${p.edv * 10} - ${p.esv * 10}`,
  value: (p) => (p.edv - p.esv) * 10,
  question: (p, lang) =>
    lang === "pl"
      ? `Objętość końcoworozkurczowa lewej komory wynosi ${p.edv * 10} ml, a końcowoskurczowa ${p.esv * 10} ml. Oblicz objętość wyrzutową w ml.`
      : `Конечно-диастолический объём левого желудочка равен ${p.edv * 10} мл, конечно-систолический ${p.esv * 10} мл. Вычисли ударный объём в мл.`,
  hint: (_p, lang) =>
    lang === "pl"
      ? "Objętość wyrzutowa to ta część krwi, która opuszcza komorę podczas skurczu."
      : "Ударный объём — та часть крови, которая покидает желудочек при сокращении.",
  solution: (p, answer, lang) =>
    lang === "pl"
      ? `${p.edv * 10} − ${p.esv * 10} = ${answer} ml.`
      : `${p.edv * 10} − ${p.esv * 10} = ${answer} мл.`,
});

const ejectionFraction = calcTemplate({
  id: `${TOPIC}.ejection-fraction`,
  topicId: TOPIC,
  subtopic: HEART,
  tags: ["obliczenia"],
  difficulty: 3,
  params: { edv: intRange(11, 14), esv: intRange(4, 6) },
  decimals: 1,
  formula: (p) => `((${p.edv * 10} - ${p.esv * 10}) / ${p.edv * 10}) * 100`,
  value: (p) => ((p.edv - p.esv) / p.edv) * 100,
  question: (p, lang) =>
    lang === "pl"
      ? `Objętość końcoworozkurczowa wynosi ${p.edv * 10} ml, a końcowoskurczowa ${p.esv * 10} ml. Oblicz frakcję wyrzutową w procentach.`
      : `Конечно-диастолический объём равен ${p.edv * 10} мл, конечно-систолический ${p.esv * 10} мл. Вычисли фракцию выброса в процентах.`,
  hint: (_p, lang) =>
    lang === "pl"
      ? "Frakcja wyrzutowa to udział objętości wyrzutowej w objętości końcoworozkurczowej."
      : "Фракция выброса — доля ударного объёма в конечно-диастолическом объёме.",
  solution: (p, answer, lang) =>
    lang === "pl"
      ? `(${p.edv * 10} − ${p.esv * 10}) / ${p.edv * 10} × 100% = ${answer}%.`
      : `(${p.edv * 10} − ${p.esv * 10}) / ${p.edv * 10} × 100% = ${answer}%.`,
});

export const lo3CirculationTemplates: BioTemplate[] = [
  ...heartTemplates,
  ...bloodTemplates,
  ...immunityTemplates,
  transfusion,
  antigens,
  cardiacOutput,
  strokeVolume,
  ejectionFraction,
];
