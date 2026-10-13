// Class 6 (Puls życia 6): one table per paragraph, each turned into a pair of tasks per row — pick
// the right description, and name the thing from its description. Tables of body features ask
// "what is it?"; the "Przegląd i znaczenie" tables list species and ask what sets each apart.
import { pairFromTable, type Bi, type BioTemplate, type Label, type NamedEntry } from "../tableTemplate.ts";
import {
  ANNELIDS,
  ARACHNIDS,
  ARTHROPOD_FEATURES,
  CNIDARIANS,
  CONNECTIVE,
  CRUSTACEANS,
  FLATWORMS,
  INSECTS,
  KINGDOM,
  MOLLUSCS,
  ROUNDWORMS,
  TISSUES6,
} from "../data/sp6Invertebrates.ts";
import {
  AMPHIBIAN_SPECIES,
  AMPHIBIANS,
  BIRD_SPECIES,
  BIRDS,
  FISH,
  FISH_SPECIES,
  MAMMAL_SPECIES,
  MAMMALS,
  REPTILE_SPECIES,
  REPTILES,
} from "../data/sp6Vertebrates.ts";
import { P6 } from "../../../curriculum/sp6.ts";

/**
 * Feature tables mix species, organs and ideas ("stułbia", "pióra", "cudzożywność"), and their rows
 * are descriptions rather than roles, so the question asks what the thing is, not what it does.
 */
const NAME: Label = { pl: "Nazwa", ru: "Название" };
const WHAT_IS_IT: Bi = { pl: "Co to jest?", ru: "Что это такое?" };
/** a free-text task gives a description rather than a function: "Opis: zwierzęta bez kręgosłupa…" */
const DESCRIPTION: Bi = { pl: "Opis", ru: "Описание" };
/** a species is not asked about its "role" but about what sets it apart */
const SETS_HIM_APART: Bi = { pl: "Co go wyróżnia?", ru: "Чем оно примечательно?" };

interface Table {
  paragraph: string;
  slug: string;
  rows: readonly NamedEntry[];
  subtopic: Bi;
  misconception: Bi;
  label?: Label;
  ask?: Bi;
}

const chapterOf = (paragraph: string) => paragraph.split(".").slice(0, 3).join(".");

const TABLES: Table[] = [
  // I. Świat zwierząt
  {
    paragraph: P6.animals.kingdom,
    slug: "kingdom",
    rows: KINGDOM,
    subtopic: { pl: "cechy i podział zwierząt", ru: "признаки и классификация животных" },
    misconception: { pl: "pokrewne pojęcie z tego samego tematu", ru: "смежное понятие из той же темы" },
  },
  {
    paragraph: P6.animals.tissues,
    slug: "tissues",
    rows: TISSUES6,
    subtopic: { pl: "tkanki zwierzęce", ru: "ткани животных" },
    misconception: { pl: "rola innej tkanki albo innej części neuronu", ru: "роль другой ткани или другой части нейрона" },
  },
  {
    paragraph: P6.animals.connective,
    slug: "connective",
    rows: CONNECTIVE,
    subtopic: { pl: "tkanka łączna", ru: "соединительная ткань" },
    misconception: { pl: "rola innego rodzaju tkanki łącznej albo innego składnika krwi", ru: "роль другого вида соединительной ткани или другого компонента крови" },
  },
  // II. Od parzydełkowców do pierścienic
  {
    paragraph: P6.worms.cnidarians,
    slug: "cnidarians",
    rows: CNIDARIANS,
    subtopic: { pl: "parzydełkowce", ru: "кишечнополостные" },
    misconception: { pl: "cecha innego parzydełkowca albo innej postaci tego samego", ru: "признак другого кишечнополостного или другой его формы" },
  },
  {
    paragraph: P6.worms.flatworms,
    slug: "flatworms",
    rows: FLATWORMS,
    subtopic: { pl: "płazińce i pasożyty", ru: "плоские черви и паразиты" },
    misconception: { pl: "cecha innego płazińca albo pomylenie żywicieli", ru: "признак другого плоского червя или путаница хозяев" },
  },
  {
    paragraph: P6.worms.roundworms,
    slug: "roundworms",
    rows: ROUNDWORMS,
    subtopic: { pl: "nicienie i profilaktyka", ru: "круглые черви и профилактика" },
    misconception: { pl: "cecha innego nicienia albo inna droga zarażenia", ru: "признак другого круглого червя или другой путь заражения" },
  },
  {
    paragraph: P6.worms.annelids,
    slug: "annelids",
    rows: ANNELIDS,
    subtopic: { pl: "pierścienice", ru: "кольчатые черви" },
    misconception: { pl: "cecha innej pierścienicy albo innej części ciała dżdżownicy", ru: "признак другого кольчатого червя или другой части тела дождевого червя" },
  },
  // III. Stawonogi i mięczaki
  {
    paragraph: P6.arthropods.features,
    slug: "arthropods",
    rows: ARTHROPOD_FEATURES,
    subtopic: { pl: "budowa stawonogów", ru: "строение членистоногих" },
    misconception: { pl: "cecha innej części ciała stawonoga", ru: "признак другой части тела членистоногого" },
  },
  {
    paragraph: P6.arthropods.crustaceans,
    slug: "crustaceans",
    rows: CRUSTACEANS,
    subtopic: { pl: "skorupiaki", ru: "ракообразные" },
    misconception: { pl: "cecha innego skorupiaka", ru: "признак другого ракообразного" },
  },
  {
    paragraph: P6.arthropods.insects,
    slug: "insects",
    rows: INSECTS,
    subtopic: { pl: "owady i ich rozwój", ru: "насекомые и их развитие" },
    misconception: { pl: "inny typ aparatu gębowego albo inny rodzaj przeobrażenia", ru: "другой тип ротового аппарата или другой тип превращения" },
  },
  {
    paragraph: P6.arthropods.arachnids,
    slug: "arachnids",
    rows: ARACHNIDS,
    subtopic: { pl: "pajęczaki", ru: "паукообразные" },
    misconception: { pl: "cecha innego pajęczaka", ru: "признак другого паукообразного" },
  },
  {
    paragraph: P6.arthropods.molluscs,
    slug: "molluscs",
    rows: MOLLUSCS,
    subtopic: { pl: "mięczaki", ru: "моллюски" },
    misconception: { pl: "cecha innego mięczaka albo innej części jego ciała", ru: "признак другого моллюска или другой части его тела" },
  },
  // IV. Kręgowce zmiennocieplne
  {
    paragraph: P6.ectotherms.fish,
    slug: "fish",
    rows: FISH,
    subtopic: { pl: "budowa i rozmnażanie ryb", ru: "строение и размножение рыб" },
    misconception: { pl: "funkcja innego narządu ryby", ru: "функция другого органа рыбы" },
  },
  {
    paragraph: P6.ectotherms["fish-diversity"],
    slug: "fish-species",
    rows: FISH_SPECIES,
    subtopic: { pl: "przegląd i znaczenie ryb", ru: "многообразие и значение рыб" },
    misconception: { pl: "cecha innej ryby", ru: "признак другой рыбы" },
    label: { pl: "Ryba", ru: "Рыба", feminine: ["pl", "ru"] },
    ask: { pl: "Co ją wyróżnia?", ru: "Чем она примечательна?" },
  },
  {
    paragraph: P6.ectotherms.amphibians,
    slug: "amphibians",
    rows: AMPHIBIANS,
    subtopic: { pl: "budowa i rozwój płazów", ru: "строение и развитие земноводных" },
    misconception: { pl: "inna cecha płazów albo cecha ryb", ru: "другой признак земноводных или признак рыб" },
  },
  {
    paragraph: P6.ectotherms["amphibian-diversity"],
    slug: "amphibian-species",
    rows: AMPHIBIAN_SPECIES,
    subtopic: { pl: "przegląd i znaczenie płazów", ru: "многообразие и значение земноводных" },
    misconception: { pl: "cecha innego płaza", ru: "признак другого земноводного" },
    label: { pl: "Płaz", ru: "Земноводное" },
    ask: SETS_HIM_APART,
  },
  {
    paragraph: P6.ectotherms.reptiles,
    slug: "reptiles",
    rows: REPTILES,
    subtopic: { pl: "przystosowania gadów do życia na lądzie", ru: "приспособления пресмыкающихся к жизни на суше" },
    misconception: { pl: "inna cecha gadów albo cecha płazów", ru: "другой признак пресмыкающихся или признак земноводных" },
  },
  {
    paragraph: P6.ectotherms["reptile-diversity"],
    slug: "reptile-species",
    rows: REPTILE_SPECIES,
    subtopic: { pl: "przegląd i znaczenie gadów", ru: "многообразие и значение пресмыкающихся" },
    misconception: { pl: "cecha innego gada", ru: "признак другого пресмыкающегося" },
    label: { pl: "Gad", ru: "Пресмыкающееся" },
    ask: SETS_HIM_APART,
  },
  // V. Kręgowce stałocieplne
  {
    paragraph: P6.endotherms.birds,
    slug: "birds",
    rows: BIRDS,
    subtopic: { pl: "przystosowania ptaków do lotu", ru: "приспособления птиц к полёту" },
    misconception: { pl: "funkcja innej części ciała ptaka", ru: "функция другой части тела птицы" },
  },
  {
    paragraph: P6.endotherms["bird-diversity"],
    slug: "bird-species",
    rows: BIRD_SPECIES,
    subtopic: { pl: "przegląd i znaczenie ptaków", ru: "многообразие и значение птиц" },
    misconception: { pl: "cecha innego ptaka", ru: "признак другой птицы" },
    label: { pl: "Ptak", ru: "Птица", feminine: ["ru"] },
    ask: { pl: "Co go wyróżnia?", ru: "Чем она примечательна?" },
  },
  {
    paragraph: P6.endotherms.mammals,
    slug: "mammals",
    rows: MAMMALS,
    subtopic: { pl: "cechy ssaków", ru: "признаки млекопитающих" },
    misconception: { pl: "funkcja innej części ciała ssaka", ru: "функция другой части тела млекопитающего" },
  },
  {
    paragraph: P6.endotherms["mammal-diversity"],
    slug: "mammal-species",
    rows: MAMMAL_SPECIES,
    subtopic: { pl: "przegląd i znaczenie ssaków", ru: "многообразие и значение млекопитающих" },
    misconception: { pl: "cecha innego ssaka", ru: "признак другого млекопитающего" },
    label: { pl: "Ssak", ru: "Млекопитающее" },
    ask: SETS_HIM_APART,
  },
];

export const sp6Templates: BioTemplate[] = TABLES.flatMap((table, i) =>
  pairFromTable({
    topicId: chapterOf(table.paragraph),
    paragraph: table.paragraph,
    slug: table.slug,
    rows: table.rows,
    subtopic: table.subtopic,
    misconception: table.misconception,
    label: table.label ?? NAME,
    ask: table.ask ?? WHAT_IS_IT,
    cue: DESCRIPTION,
    explain: true,
    // spread the right answer over the labels across tables, not just within one
    shift: i % 4,
  }),
);
