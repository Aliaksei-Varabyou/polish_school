// Biologia, szkoła podstawowa klasa 6 — różnorodność zwierząt, from tissues and invertebrates to mammals.
// Chapters and paragraphs follow "Puls życia 6", Nowa Era (Edycja 2022–2024, MEN 844/2/2019; the
// paragraph list is the one of the 2019 edition under the same approval). Page numbers are left
// out until checked against the student's copy: a new edition may have moved them.
import { defineBook } from "./book.ts";

const BOOK = {
  animals: {
    number: 1,
    name: ["Świat zwierząt", "Мир животных", "The animal world"],
    subtopics: ["cechy zwierząt", "bezkręgowce i kręgowce", "symetria ciała", "tkanka nabłonkowa", "tkanka mięśniowa", "tkanka nerwowa", "tkanka łączna"],
    paragraphs: {
      kingdom: ["1.1", null, "W królestwie zwierząt", "В царстве животных"],
      tissues: ["1.2", null, "Tkanki: nabłonkowa, mięśniowa i nerwowa", "Ткани: эпителиальная, мышечная и нервная"],
      connective: ["1.3", null, "Tkanka łączna", "Соединительная ткань"],
    },
  },
  worms: {
    number: 2,
    name: ["Od parzydełkowców do pierścienic", "От кишечнополостных до кольчатых червей", "From cnidarians to annelids"],
    subtopics: ["parzydełkowce", "płazińce", "nicienie", "pierścienice", "pasożyty człowieka", "profilaktyka chorób pasożytniczych"],
    paragraphs: {
      cnidarians: ["2.1", null, "Parzydełkowce – najprostsze zwierzęta tkankowe", "Кишечнополостные — простейшие тканевые животные"],
      flatworms: ["2.2", null, "Płazińce – zwierzęta, które mają płaskie ciało", "Плоские черви — животные с плоским телом"],
      roundworms: ["2.3", null, "Nicienie – zwierzęta, które mają nitkowate ciało", "Круглые черви — животные с нитевидным телом"],
      annelids: ["2.4", null, "Pierścienice – zwierzęta, które mają segmentowane ciało", "Кольчатые черви — животные с сегментированным телом"],
    },
  },
  arthropods: {
    number: 3,
    name: ["Stawonogi i mięczaki", "Членистоногие и моллюски", "Arthropods and molluscs"],
    subtopics: ["szkielet zewnętrzny", "skorupiaki", "owady", "pajęczaki", "przeobrażenie", "mięczaki", "znaczenie stawonogów"],
    paragraphs: {
      features: ["3.1", null, "Cechy stawonogów", "Признаки членистоногих"],
      crustaceans: ["3.2", null, "Skorupiaki – stawonogi, które mają twardy pancerz", "Ракообразные — членистоногие с твёрдым панцирем"],
      insects: ["3.3", null, "Owady – stawonogi zdolne do lotu", "Насекомые — членистоногие, способные летать"],
      arachnids: ["3.4", null, "Pajęczaki – stawonogi, które mają cztery pary odnóży", "Паукообразные — членистоногие с четырьмя парами ног"],
      molluscs: ["3.5", null, "Mięczaki – zwierzęta, które mają muszlę", "Моллюски — животные с раковиной"],
    },
  },
  ectotherms: {
    number: 4,
    name: ["Kręgowce zmiennocieplne", "Холоднокровные позвоночные", "Ectothermic vertebrates"],
    subtopics: ["ryby", "płazy", "gady", "zmiennocieplność", "rozmnażanie i rozwój", "przegląd i znaczenie", "ochrona gatunkowa"],
    paragraphs: {
      fish: ["4.1", null, "Ryby – kręgowce środowisk wodnych", "Рыбы — позвоночные водной среды"],
      "fish-diversity": ["4.2", null, "Przegląd i znaczenie ryb", "Многообразие и значение рыб"],
      amphibians: ["4.3", null, "Płazy – kręgowce wodno-lądowe", "Земноводные — позвоночные воды и суши"],
      "amphibian-diversity": ["4.4", null, "Przegląd i znaczenie płazów", "Многообразие и значение земноводных"],
      reptiles: ["4.5", null, "Gady – kręgowce, które opanowały ląd", "Пресмыкающиеся — позвоночные, освоившие сушу"],
      "reptile-diversity": ["4.6", null, "Przegląd i znaczenie gadów", "Многообразие и значение пресмыкающихся"],
    },
  },
  endotherms: {
    number: 5,
    name: ["Kręgowce stałocieplne", "Теплокровные позвоночные", "Endothermic vertebrates"],
    subtopics: ["ptaki", "przystosowania do lotu", "ssaki", "stałocieplność", "rozmnażanie i rozwój", "przegląd i znaczenie", "ochrona gatunkowa"],
    paragraphs: {
      birds: ["5.1", null, "Ptaki – kręgowce zdolne do lotu", "Птицы — позвоночные, способные летать"],
      "bird-diversity": ["5.2", null, "Przegląd i znaczenie ptaków", "Многообразие и значение птиц"],
      mammals: ["5.3", null, "Ssaki – kręgowce, które karmią młode mlekiem", "Млекопитающие — позвоночные, выкармливающие детёнышей молоком"],
      "mammal-diversity": ["5.4", null, "Przegląd i znaczenie ssaków", "Многообразие и значение млекопитающих"],
    },
  },
} as const;

const book = defineBook("sp6", undefined, BOOK);

export const SP6_CHAPTERS = book.chapters;
export const SP6_PARAGRAPHS = book.paragraphs;
/** class 6 paragraph ids by chapter and slug: `P6.ectotherms.fish` */
export const P6 = book.P;
