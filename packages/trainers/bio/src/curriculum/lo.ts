// Biologia, liceum klasa 3, zakres rozszerzony — anatomia i fizjologia człowieka.
// The 11 działy follow the podstawa programowa (2024) as distributed by "Biologia na czasie 3 ZR"
// (Nowa Era). Every topic is level "R": on the extended track class 3 is human biology end to end,
// while genetics, evolution and ecology are taught in class 4.
import { topic, type Topic } from "@portal/core";

export const lo: Topic[] = [
  topic("bio.lo3.organism", "lo3", ["Organizm człowieka jako funkcjonalna całość", "Организм человека как единое целое", "The human organism as a functional whole"],
    ["poziomy organizacji organizmu", "tkanka nabłonkowa", "tkanka łączna", "tkanka mięśniowa", "tkanka nerwowa", "homeostaza", "ujemne sprzężenie zwrotne", "transport przez błony biologiczne"], "R"),
  topic("bio.lo3.skin", "lo3", ["Układ powłokowy", "Покровная система", "The integumentary system"],
    ["budowa naskórka", "skóra właściwa", "tkanka podskórna", "wytwory naskórka", "termoregulacja", "receptory skóry", "choroby i higiena skóry"], "R"),
  topic("bio.lo3.motion", "lo3", ["Układ ruchu", "Опорно-двигательная система", "The musculoskeletal system"],
    ["budowa i skład chemiczny kości", "tkanka kostna", "szkielet osiowy", "szkielet kończyn", "połączenia kości", "budowa stawu", "mięśnie szkieletowe", "mechanizm skurczu mięśnia", "antagonizm mięśni", "wady postawy"], "R"),
  topic("bio.lo3.digestion", "lo3", ["Układ pokarmowy", "Пищеварительная система", "The digestive system"],
    ["budowa przewodu pokarmowego", "enzymy trawienne", "trawienie i wchłanianie", "rola wątroby", "rola trzustki", "składniki pokarmowe", "witaminy i sole mineralne", "wartość energetyczna pokarmu", "wskaźnik BMI"], "R"),
  topic("bio.lo3.respiration", "lo3", ["Układ oddechowy", "Дыхательная система", "The respiratory system"],
    ["drogi oddechowe", "pęcherzyki płucne", "wymiana gazowa", "transport tlenu i dwutlenku węgla", "mechanika oddychania", "objętości i pojemności płuc", "regulacja oddychania", "choroby układu oddechowego"], "R"),
  topic("bio.lo3.circulation", "lo3", ["Układ krążenia. Odporność", "Кровообращение и иммунитет", "Circulation and immunity"],
    ["budowa serca", "cykl pracy serca", "krwiobieg duży i mały", "naczynia krwionośne", "skład i funkcje krwi", "grupy krwi", "konflikt serologiczny", "układ limfatyczny", "odporność nieswoista", "odporność swoista", "szczepionki i surowice"], "R"),
  topic("bio.lo3.urinary", "lo3", ["Układ moczowy", "Мочевыделительная система", "The urinary system"],
    ["budowa nerki", "budowa nefronu", "filtracja kłębuszkowa", "resorpcja zwrotna", "sekrecja kanalikowa", "powstawanie moczu", "osmoregulacja", "rola ADH", "rola aldosteronu"], "R"),
  topic("bio.lo3.nervous", "lo3", ["Układ nerwowy", "Нервная система", "The nervous system"],
    ["budowa neuronu", "tkanka nerwowa", "potencjał spoczynkowy", "potencjał czynnościowy", "budowa i działanie synapsy", "neuroprzekaźniki", "budowa mózgowia", "rdzeń kręgowy", "łuk odruchowy", "układ autonomiczny"], "R"),
  topic("bio.lo3.senses", "lo3", ["Narządy zmysłów", "Органы чувств", "The sense organs"],
    ["budowa oka", "akomodacja", "wady wzroku", "budowa ucha", "narząd Cortiego", "narząd równowagi", "zmysł smaku", "zmysł węchu", "czucie skórne"], "R"),
  topic("bio.lo3.hormones", "lo3", ["Układ hormonalny", "Эндокринная система", "The endocrine system"],
    ["gruczoły dokrewne", "hormony i ich działanie", "oś podwzgórze–przysadka", "regulacja poziomu glukozy", "regulacja gospodarki wapniowej", "ujemne sprzężenie zwrotne", "nadczynność i niedoczynność gruczołów"], "R"),
  topic("bio.lo3.reproduction", "lo3", ["Rozmnażanie i rozwój", "Размножение и развитие", "Reproduction and development"],
    ["budowa układu rozrodczego", "gametogeneza", "cykl miesiączkowy", "zapłodnienie", "rozwój zarodkowy", "listki zarodkowe", "ciąża i poród", "rozwój postnatalny"], "R"),
];
