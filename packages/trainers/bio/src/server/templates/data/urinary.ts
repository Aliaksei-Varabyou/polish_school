// Content tables for dział 7, Układ moczowy (LO3, zakres rozszerzony).
import type { Difficulty } from "@portal/core";
import type { Bi } from "./hormones.ts";
import type { StructureEntry } from "./circulation.ts";

export const NEPHRON_PARTS: readonly StructureEntry[] = [
  {
    id: "klebuszek",
    name: { pl: "kłębuszek nerkowy", ru: "почечный клубочек" },
    role: { pl: "filtracja osocza pod wysokim ciśnieniem do torebki", ru: "фильтрация плазмы под высоким давлением в капсулу" },
    aliases: { pl: ["kłębuszek"], ru: ["клубочек"] },
    tier: 1,
  },
  {
    id: "torebka",
    name: { pl: "torebka Bowmana", ru: "капсула Боумена" },
    role: { pl: "zbieranie przesączu opuszczającego kłębuszek", ru: "сбор фильтрата, покидающего клубочек" },
    aliases: { pl: ["torebka kłębuszka"], ru: ["капсула клубочка"] },
    tier: 1,
  },
  {
    id: "kanalik-blizszy",
    name: { pl: "kanalik kręty bliższy", ru: "проксимальный извитой каналец" },
    role: { pl: "resorpcja zwrotna glukozy, aminokwasów i większości jonów", ru: "обратное всасывание глюкозы, аминокислот и большинства ионов" },
    aliases: { pl: ["kanalik bliższy", "kanalik proksymalny"], ru: ["проксимальный каналец"] },
    tier: 2,
  },
  {
    id: "petla",
    name: { pl: "pętla nefronu", ru: "петля нефрона" },
    role: { pl: "zagęszczanie moczu dzięki różnicy stężeń w rdzeniu nerki", ru: "концентрирование мочи благодаря разнице концентраций в мозговом веществе почки" },
    aliases: { pl: ["pętla Henlego"], ru: ["петля Генле"] },
    tier: 2,
  },
  {
    id: "kanalik-dalszy",
    name: { pl: "kanalik kręty dalszy", ru: "дистальный извитой каналец" },
    role: { pl: "sekrecja kanalikowa jonów i regulacja pod wpływem aldosteronu", ru: "канальцевая секреция ионов и регуляция под действием альдостерона" },
    aliases: { pl: ["kanalik dalszy", "kanalik dystalny"], ru: ["дистальный каналец"] },
    tier: 2,
  },
  {
    id: "kanalik-zbiorczy",
    name: { pl: "kanalik zbiorczy", ru: "собирательная трубочка" },
    role: { pl: "odbieranie wody pod wpływem wazopresyny i odprowadzanie moczu ostatecznego", ru: "отбор воды под действием вазопрессина и отведение окончательной мочи" },
    aliases: { pl: ["cewka zbiorcza"], ru: ["собирательный проток"] },
    tier: 2,
  },
  {
    id: "kora",
    name: { pl: "kora nerki", ru: "корковое вещество почки" },
    role: { pl: "warstwa zewnętrzna zawierająca kłębuszki nerkowe", ru: "наружный слой, содержащий почечные клубочки" },
    aliases: { pl: [], ru: ["кора почки"] },
    tier: 1,
  },
  {
    id: "rdzen",
    name: { pl: "rdzeń nerki", ru: "мозговое вещество почки" },
    role: { pl: "warstwa wewnętrzna z piramidami nerkowymi i pętlami nefronów", ru: "внутренний слой с почечными пирамидами и петлями нефронов" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "miedniczka",
    name: { pl: "miedniczka nerkowa", ru: "почечная лоханка" },
    role: { pl: "zbieranie moczu ostatecznego przed moczowodem", ru: "сбор окончательной мочи перед мочеточником" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "moczowod",
    name: { pl: "moczowód", ru: "мочеточник" },
    role: { pl: "przesuwanie moczu do pęcherza ruchami perystaltycznymi", ru: "продвижение мочи в мочевой пузырь перистальтическими движениями" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
];

export interface ProcessEntry {
  id: string;
  name: Bi;
  description: Bi;
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

export const URINE_PROCESSES: readonly ProcessEntry[] = [
  {
    id: "filtracja",
    name: { pl: "filtracja kłębuszkowa", ru: "клубочковая фильтрация" },
    description: { pl: "przechodzenie wody i drobnych cząsteczek z krwi do torebki, bez białek i krwinek", ru: "переход воды и мелких молекул из крови в капсулу, без белков и клеток крови" },
    aliases: { pl: ["filtracja"], ru: ["фильтрация"] },
    tier: 1,
  },
  {
    id: "resorpcja",
    name: { pl: "resorpcja zwrotna", ru: "обратное всасывание" },
    description: { pl: "odzyskiwanie z przesączu glukozy, aminokwasów, jonów i większości wody", ru: "возврат из фильтрата глюкозы, аминокислот, ионов и большей части воды" },
    aliases: { pl: ["reabsorpcja"], ru: ["реабсорбция"] },
    tier: 1,
  },
  {
    id: "sekrecja",
    name: { pl: "sekrecja kanalikowa", ru: "канальцевая секреция" },
    description: { pl: "czynne wydzielanie do kanalika jonów wodorowych, potasu i leków", ru: "активное выделение в каналец ионов водорода, калия и лекарств" },
    aliases: { pl: ["sekrecja"], ru: ["секреция"] },
    tier: 2,
  },
  {
    id: "zageszczanie",
    name: { pl: "zagęszczanie moczu", ru: "концентрирование мочи" },
    description: { pl: "odbieranie wody w kanaliku zbiorczym pod wpływem wazopresyny", ru: "отбор воды в собирательной трубочке под действием вазопрессина" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "osmoregulacja",
    name: { pl: "osmoregulacja", ru: "осморегуляция" },
    description: { pl: "utrzymywanie stałego stężenia płynów ustrojowych przez regulację ilości wody i soli", ru: "поддержание постоянной концентрации жидкостей тела через регуляцию количества воды и солей" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "aldosteron-sod",
    name: { pl: "działanie aldosteronu", ru: "действие альдостерона" },
    description: { pl: "zatrzymywanie sodu, a wraz z nim wody, kosztem wydalania potasu", ru: "задержка натрия, а с ним воды, ценой выведения калия" },
    aliases: { pl: [], ru: [] },
    tier: 3,
  },
];
