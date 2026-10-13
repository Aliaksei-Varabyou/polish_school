// Biologia, liceum klasa 3, zakres rozszerzony — anatomia i fizjologia człowieka.
// Chapters and paragraphs follow "Biologia na czasie 3", Nowa Era, ZR — the table of contents of
// the copy the student actually uses, page numbers included. Class 3 on the extended track is human
// biology end to end; genetics, evolution and ecology are taught in class 4.
import { defineBook } from "./book.ts";

// the literal keys are what makes `P.motion.skeleton` typed
const BOOK = {
  organism: {
    number: 1,
    name: ["Organizm człowieka jako funkcjonalna całość", "Организм человека как единое целое", "The human organism as a functional whole"],
    subtopics: ["poziomy organizacji organizmu", "tkanka nabłonkowa", "tkanka łączna", "tkanka mięśniowa", "tkanka nerwowa", "homeostaza", "ujemne sprzężenie zwrotne", "transport przez błony biologiczne"],
    paragraphs: {
      classification: ["1.1", 6, "Miejsce człowieka w systemie klasyfikacji organizmów", "Место человека в системе классификации организмов"],
      hierarchy: ["1.2", 10, "Hierarchiczna budowa organizmu człowieka", "Иерархическое строение организма человека"],
      homeostasis: ["1.3", 15, "Homeostaza", "Гомеостаз"],
    },
  },
  skin: {
    number: 2,
    name: ["Układ powłokowy", "Покровная система", "The integumentary system"],
    subtopics: ["budowa naskórka", "skóra właściwa", "tkanka podskórna", "wytwory naskórka", "termoregulacja", "receptory skóry", "choroby i higiena skóry"],
    paragraphs: {
      animals: ["2.1", 32, "Układ powłokowy u zwierząt", "Покровы у животных"],
      structure: ["2.2", 38, "Budowa i funkcje skóry", "Строение и функции кожи"],
      disorders: ["2.3", 47, "Higiena i choroby skóry", "Гигиена и болезни кожи"],
    },
  },
  motion: {
    number: 3,
    name: ["Układ ruchu", "Опорно-двигательная система", "The musculoskeletal system"],
    subtopics: ["budowa i skład chemiczny kości", "tkanka kostna", "szkielet osiowy", "szkielet kończyn", "połączenia kości", "budowa stawu", "mięśnie szkieletowe", "mechanizm skurczu mięśnia", "antagonizm mięśni", "wady postawy"],
    paragraphs: {
      animals: ["3.1", 62, "Ruch u zwierząt", "Движение у животных"],
      skeleton: ["3.2", 68, "Budowa i funkcje szkieletu", "Строение и функции скелета"],
      joints: ["3.3", 72, "Rodzaje połączeń kości", "Типы соединений костей"],
      bones: ["3.4", 76, "Elementy szkieletu", "Элементы скелета"],
      muscles: ["3.5", 83, "Budowa i funkcjonowanie układu mięśniowego", "Строение и работа мышечной системы"],
      disorders: ["3.6", 95, "Higiena i choroby układu ruchu", "Гигиена и болезни опорно-двигательной системы"],
    },
  },
  digestion: {
    number: 4,
    name: ["Układ pokarmowy", "Пищеварительная система", "The digestive system"],
    subtopics: ["budowa przewodu pokarmowego", "enzymy trawienne", "trawienie i wchłanianie", "rola wątroby", "rola trzustki", "składniki pokarmowe", "witaminy i sole mineralne", "wartość energetyczna pokarmu", "wskaźnik BMI"],
    paragraphs: {
      animals: ["4.1", 110, "Odżywianie się zwierząt", "Питание животных"],
      organic: ["4.2", 116, "Organiczne składniki pokarmowe", "Органические питательные вещества"],
      vitamins: ["4.3", 123, "Rola witamin. Nieorganiczne składniki pokarmowe", "Роль витаминов. Неорганические питательные вещества"],
      structure: ["4.4", 131, "Budowa i funkcje układu pokarmowego", "Строение и функции пищеварительной системы"],
      processes: ["4.5", 139, "Procesy trawienia i wchłaniania", "Процессы пищеварения и всасывания"],
      diet: ["4.6", 148, "Zasady racjonalnego odżywiania się", "Принципы рационального питания"],
      disorders: ["4.7", 152, "Choroby układu pokarmowego", "Болезни пищеварительной системы"],
    },
  },
  respiration: {
    number: 5,
    name: ["Układ oddechowy", "Дыхательная система", "The respiratory system"],
    subtopics: ["drogi oddechowe", "pęcherzyki płucne", "wymiana gazowa", "transport tlenu i dwutlenku węgla", "mechanika oddychania", "objętości i pojemności płuc", "regulacja oddychania", "choroby układu oddechowego"],
    paragraphs: {
      animals: ["5.1", 170, "Układ oddechowy u zwierząt", "Дыхательная система у животных"],
      structure: ["5.2", 180, "Budowa i funkcje układu oddechowego", "Строение и функции дыхательной системы"],
      ventilation: ["5.3", 185, "Wentylacja płuc i wymiana gazowa", "Вентиляция лёгких и газообмен"],
      disorders: ["5.4", 198, "Zaburzenia funkcjonowania układu oddechowego", "Нарушения работы дыхательной системы"],
    },
  },
  circulation: {
    number: 6,
    name: ["Układ krążenia. Odporność", "Кровообращение и иммунитет", "Circulation and immunity"],
    subtopics: ["budowa serca", "cykl pracy serca", "krwiobieg duży i mały", "naczynia krwionośne", "skład i funkcje krwi", "grupy krwi", "konflikt serologiczny", "układ limfatyczny", "odporność nieswoista", "odporność swoista", "szczepionki i surowice"],
    paragraphs: {
      animals: ["6.1", 214, "Układ krążenia u zwierząt", "Кровеносная система у животных"],
      blood: ["6.2", 220, "Skład i funkcje krwi", "Состав и функции крови"],
      structure: ["6.3", 228, "Budowa i funkcje układu krwionośnego", "Строение и функции кровеносной системы"],
      function: ["6.4", 234, "Funkcjonowanie układu krwionośnego", "Работа кровеносной системы"],
      lymph: ["6.5", 244, "Układ limfatyczny", "Лимфатическая система"],
      disorders: ["6.6", 248, "Choroby układu krążenia", "Болезни системы кровообращения"],
      immune: ["6.7", 258, "Budowa i funkcje układu odpornościowego", "Строение и функции иммунной системы"],
      immunity: ["6.8", 265, "Rodzaje i mechanizmy odporności", "Виды и механизмы иммунитета"],
      "immune-disorders": ["6.9", 274, "Zaburzenia funkcjonowania układu odpornościowego", "Нарушения работы иммунной системы"],
    },
  },
  urinary: {
    number: 7,
    name: ["Układ moczowy", "Мочевыделительная система", "The urinary system"],
    subtopics: ["budowa nerki", "budowa nefronu", "filtracja kłębuszkowa", "resorpcja zwrotna", "sekrecja kanalikowa", "powstawanie moczu", "osmoregulacja", "rola ADH", "rola aldosteronu"],
    paragraphs: {
      animals: ["7.1", 292, "Osmoregulacja i wydalanie u zwierząt", "Осморегуляция и выделение у животных"],
      structure: ["7.2", 298, "Budowa i funkcjonowanie układu moczowego", "Строение и работа мочевыделительной системы"],
      disorders: ["7.3", 307, "Choroby układu moczowego", "Болезни мочевыделительной системы"],
    },
  },
  nervous: {
    number: 8,
    name: ["Układ nerwowy", "Нервная система", "The nervous system"],
    subtopics: ["budowa neuronu", "tkanka nerwowa", "potencjał spoczynkowy", "potencjał czynnościowy", "budowa i działanie synapsy", "neuroprzekaźniki", "budowa mózgowia", "rdzeń kręgowy", "łuk odruchowy", "układ autonomiczny"],
    paragraphs: {
      animals: ["8.1", 318, "Układ nerwowy u zwierząt", "Нервная система у животных"],
      structure: ["8.2", 323, "Budowa i działanie układu nerwowego", "Строение и работа нервной системы"],
      central: ["8.3", 334, "Ośrodkowy układ nerwowy", "Центральная нервная система"],
      peripheral: ["8.4", 340, "Obwodowy układ nerwowy", "Периферическая нервная система"],
      autonomic: ["8.5", 350, "Autonomiczny układ nerwowy", "Вегетативная нервная система"],
      disorders: ["8.6", 353, "Higiena i choroby układu nerwowego", "Гигиена и болезни нервной системы"],
    },
  },
  senses: {
    number: 9,
    name: ["Narządy zmysłów", "Органы чувств", "The sense organs"],
    subtopics: ["budowa oka", "akomodacja", "wady wzroku", "budowa ucha", "narząd Cortiego", "narząd równowagi", "zmysł smaku", "zmysł węchu", "czucie skórne"],
    paragraphs: {
      animals: ["9.1", 368, "Narządy zmysłów u zwierząt", "Органы чувств у животных"],
      vision: ["9.2", 374, "Budowa i działanie narządu wzroku", "Строение и работа органа зрения"],
      ear: ["9.3", 384, "Ucho – narząd słuchu i równowagi", "Ухо — орган слуха и равновесия"],
      "taste-smell": ["9.4", 392, "Narządy smaku oraz węchu", "Органы вкуса и обоняния"],
    },
  },
  hormones: {
    number: 10,
    name: ["Układ hormonalny", "Эндокринная система", "The endocrine system"],
    subtopics: ["gruczoły dokrewne", "hormony i ich działanie", "oś podwzgórze–przysadka", "regulacja poziomu glukozy", "regulacja gospodarki wapniowej", "ujemne sprzężenie zwrotne", "nadczynność i niedoczynność gruczołów"],
    paragraphs: {
      animals: ["10.1", 402, "Układ hormonalny u zwierząt", "Эндокринная система у животных"],
      structure: ["10.2", 404, "Budowa i rola układu hormonalnego", "Строение и роль эндокринной системы"],
      regulation: ["10.3", 414, "Regulacja wydzielania hormonów", "Регуляция выделения гормонов"],
      disorders: ["10.4", 419, "Nadczynność i niedoczynność gruczołów dokrewnych. Stres", "Гипер- и гипофункция желёз внутренней секреции. Стресс"],
    },
  },
  reproduction: {
    number: 11,
    name: ["Rozmnażanie i rozwój", "Размножение и развитие", "Reproduction and development"],
    subtopics: ["budowa układu rozrodczego", "gametogeneza", "cykl miesiączkowy", "zapłodnienie", "rozwój zarodkowy", "listki zarodkowe", "ciąża i poród", "rozwój postnatalny"],
    paragraphs: {
      animals: ["11.1", 434, "Rozmnażanie i rozwój u zwierząt", "Размножение и развитие у животных"],
      male: ["11.2", 442, "Budowa i funkcje męskich narządów rozrodczych", "Строение и функции мужских половых органов"],
      female: ["11.3", 447, "Budowa i funkcje żeńskich narządów rozrodczych", "Строение и функции женских половых органов"],
      development: ["11.4", 456, "Rozwój człowieka. Metody antykoncepcji", "Развитие человека. Методы контрацепции"],
      disorders: ["11.5", 467, "Higiena i choroby układu rozrodczego", "Гигиена и болезни половой системы"],
    },
  },
} as const;

const book = defineBook("lo3", "R", BOOK);

export const LO3_CHAPTERS = book.chapters;
export const LO3_PARAGRAPHS = book.paragraphs;
/** LO3 paragraph ids by chapter and slug: `P.motion.skeleton` */
export const P = book.P;
