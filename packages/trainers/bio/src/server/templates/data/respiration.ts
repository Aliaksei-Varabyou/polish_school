// Content tables for dział 5, Układ oddechowy (LO3, zakres rozszerzony).
import type { Difficulty } from "@portal/core";
import type { Bi } from "./hormones.ts";
import { P } from "../../../curriculum/lo.ts";
import type { InParagraph } from "../tableTemplate.ts";

export interface PartEntry extends InParagraph {
  id: string;
  /** anatomical structure, singular nominative so questions can be phrased once */
  part: Bi;
  /**
   * What it does, as a noun phrase rather than a verb phrase: some structures are plural
   * ("oskrzela") and a verb would not agree with the singular frame the questions use.
   * Every entry's wording must be distinct — distractors are drawn from this column.
   */
  role: Bi;
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

export const AIRWAY_PARTS: readonly PartEntry[] = [
  {
    id: "jama-nosowa",
    paragraph: P.respiration.structure,
    part: { pl: "jama nosowa", ru: "носовая полость" },
    role: { pl: "ogrzewanie, nawilżanie i oczyszczanie wdychanego powietrza", ru: "согревание, увлажнение и очищение вдыхаемого воздуха" },
    aliases: { pl: ["nos"], ru: ["полость носа", "нос"] },
    tier: 1,
  },
  {
    id: "gardlo",
    paragraph: P.respiration.structure,
    part: { pl: "gardło", ru: "глотка" },
    role: { pl: "wspólny odcinek drogi oddechowej i pokarmowej", ru: "общий участок дыхательного и пищеварительного путей" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "krtan",
    paragraph: P.respiration.structure,
    part: { pl: "krtań", ru: "гортань" },
    role: { pl: "wytwarzanie dźwięków mowy dzięki strunom głosowym", ru: "образование звуков речи благодаря голосовым связкам" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "nagłośnia",
    paragraph: P.respiration.structure,
    part: { pl: "nagłośnia", ru: "надгортанник" },
    role: { pl: "zamykanie wejścia do krtani podczas połykania", ru: "закрытие входа в гортань во время глотания" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "tchawica",
    paragraph: P.respiration.structure,
    part: { pl: "tchawica", ru: "трахея" },
    role: { pl: "utrzymywanie drożności drogi oddechowej przez chrzęstne półpierścienie", ru: "поддержание проходимости дыхательного пути хрящевыми полукольцами" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "oskrzela",
    paragraph: P.respiration.structure,
    part: { pl: "oskrzela", ru: "бронхи" },
    role: { pl: "rozprowadzanie powietrza do obu płuc", ru: "распределение воздуха в оба лёгких" },
    aliases: { pl: ["oskrzele"], ru: ["бронх"] },
    tier: 1,
  },
  {
    id: "oskrzeliki",
    paragraph: P.respiration.structure,
    part: { pl: "oskrzeliki", ru: "бронхиолы" },
    role: { pl: "regulacja przepływu powietrza mięśniami gładkimi, bez chrząstek", ru: "регуляция потока воздуха гладкими мышцами, без хрящей" },
    aliases: { pl: ["oskrzelik"], ru: ["бронхиола"] },
    tier: 2,
  },
  {
    id: "pecherzyki",
    paragraph: P.respiration.structure,
    part: { pl: "pęcherzyki płucne", ru: "лёгочные альвеолы" },
    role: { pl: "wymiana gazowa między powietrzem a krwią", ru: "газообмен между воздухом и кровью" },
    aliases: { pl: ["alweole", "pęcherzyk płucny"], ru: ["альвеолы", "альвеола"] },
    tier: 1,
  },
  {
    id: "surfaktant",
    paragraph: P.respiration.structure,
    part: { pl: "surfaktant", ru: "сурфактант" },
    role: { pl: "obniżanie napięcia powierzchniowego, zapobiegające zapadaniu się pęcherzyków", ru: "снижение поверхностного натяжения, предотвращающее спадение альвеол" },
    aliases: { pl: [], ru: [] },
    tier: 3,
  },
  {
    id: "oplucna",
    paragraph: P.respiration.structure,
    part: { pl: "opłucna", ru: "плевра" },
    role: { pl: "utrzymywanie podciśnienia w jamie opłucnej wokół płuca", ru: "поддержание отрицательного давления в плевральной полости вокруг лёгкого" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "przepona",
    paragraph: P.respiration.ventilation,
    part: { pl: "przepona", ru: "диафрагма" },
    role: { pl: "powiększanie objętości klatki piersiowej przez obniżenie się przy skurczu", ru: "увеличение объёма грудной клетки за счёт опускания при сокращении" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "miesnie-miedzyzebrowe",
    paragraph: P.respiration.ventilation,
    part: { pl: "mięśnie międzyżebrowe zewnętrzne", ru: "наружные межрёберные мышцы" },
    role: { pl: "unoszenie żeber podczas wdechu", ru: "поднятие рёбер во время вдоха" },
    aliases: { pl: ["mięśnie międzyżebrowe"], ru: ["межрёберные мышцы"] },
    tier: 2,
  },
  {
    id: "osrodek-oddechowy",
    paragraph: P.respiration.ventilation,
    part: { pl: "ośrodek oddechowy", ru: "дыхательный центр" },
    role: { pl: "reagowanie na wzrost stężenia dwutlenku węgla w rdzeniu przedłużonym", ru: "реакция на рост концентрации углекислого газа в продолговатом мозге" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "hemoglobina",
    paragraph: P.respiration.ventilation,
    part: { pl: "hemoglobina", ru: "гемоглобин" },
    role: { pl: "wiązanie tlenu w płucach i oddawanie go w tkankach", ru: "связывание кислорода в лёгких и отдача его в тканях" },
    aliases: { pl: ["Hb"], ru: ["Hb"] },
    tier: 1,
  },
  {
    id: "wodoroweglany",
    paragraph: P.respiration.ventilation,
    part: { pl: "jony wodorowęglanowe", ru: "гидрокарбонат-ионы" },
    role: { pl: "przenoszenie większości dwutlenku węgla w osoczu krwi", ru: "перенос большей части углекислого газа в плазме крови" },
    aliases: { pl: ["wodorowęglany", "HCO3-"], ru: ["гидрокарбонаты", "HCO3-"] },
    tier: 3,
  },
];

export interface VolumeEntry {
  id: string;
  name: Bi;
  definition: Bi;
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

export const LUNG_VOLUMES: readonly VolumeEntry[] = [
  {
    id: "to",
    name: { pl: "objętość oddechowa", ru: "дыхательный объём" },
    definition: { pl: "objętość powietrza wdychana i wydychana podczas spokojnego oddechu", ru: "объём воздуха, вдыхаемый и выдыхаемый при спокойном дыхании" },
    aliases: { pl: ["TV", "objętość oddechowa (TV)"], ru: ["ДО", "TV"] },
    tier: 1,
  },
  {
    id: "zow",
    name: { pl: "zapasowa objętość wdechowa", ru: "резервный объём вдоха" },
    definition: { pl: "objętość, którą można jeszcze wciągnąć po spokojnym wdechu", ru: "объём, который можно вдохнуть дополнительно после спокойного вдоха" },
    aliases: { pl: ["IRV"], ru: ["РОвд", "IRV"] },
    tier: 2,
  },
  {
    id: "zowyd",
    name: { pl: "zapasowa objętość wydechowa", ru: "резервный объём выдоха" },
    definition: { pl: "objętość, którą można jeszcze wydmuchać po spokojnym wydechu", ru: "объём, который можно выдохнуть дополнительно после спокойного выдоха" },
    aliases: { pl: ["ERV"], ru: ["РОвыд", "ERV"] },
    tier: 2,
  },
  {
    id: "zalegajaca",
    name: { pl: "objętość zalegająca", ru: "остаточный объём" },
    definition: { pl: "objętość, która zostaje w płucach nawet po najgłębszym wydechu", ru: "объём, остающийся в лёгких даже после самого глубокого выдоха" },
    aliases: { pl: ["RV"], ru: ["ОО", "RV"] },
    tier: 2,
  },
  {
    id: "pojemnosc-zyciowa",
    name: { pl: "pojemność życiowa płuc", ru: "жизненная ёмкость лёгких" },
    definition: { pl: "największa objętość wydychana po najgłębszym wdechu", ru: "наибольший объём выдоха после самого глубокого вдоха" },
    aliases: { pl: ["VC", "pojemność życiowa"], ru: ["ЖЁЛ", "VC"] },
    tier: 1,
  },
  {
    id: "calkowita",
    name: { pl: "całkowita pojemność płuc", ru: "общая ёмкость лёгких" },
    definition: { pl: "pojemność życiowa powiększona o objętość zalegającą", ru: "жизненная ёмкость плюс остаточный объём" },
    aliases: { pl: ["TLC"], ru: ["ОЁЛ", "TLC"] },
    tier: 2,
  },
  {
    id: "martwa",
    name: { pl: "przestrzeń martwa", ru: "мёртвое пространство" },
    definition: { pl: "powietrze w drogach oddechowych, które nie bierze udziału w wymianie gazowej", ru: "воздух в дыхательных путях, не участвующий в газообмене" },
    aliases: { pl: ["anatomiczna przestrzeń martwa"], ru: ["анатомическое мёртвое пространство"] },
    tier: 2,
  },
];
