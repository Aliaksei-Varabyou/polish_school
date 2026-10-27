// Historia, szkoła podstawowa klasa 6 — od wielkich odkryć geograficznych do Księstwa Warszawskiego.
// Chapters, paragraphs and pages follow "Historia 6. Podręcznik", Gdańskie Wydawnictwo Oświatowe
// (the student's copy; pages checked against its table of contents). The book numbers paragraphs
// 1–34 straight through, so `number` is that figure rather than "chapter.paragraph".
import { defineBook } from "./book.ts";

const BOOK = {
  modern: {
    number: 1,
    name: ["Początki epoki nowożytnej", "Начало Нового времени", "The dawn of the modern era"],
    subtopics: ["wielkie odkrycia geograficzne", "Kolumb i Magellan", "skutki odkryć", "humanizm", "renesans", "reformacja", "Luter i Kalwin", "kontrreformacja", "sobór trydencki"],
    paragraphs: {
      discoveries: ["1", 6, "Wielkie odkrycia geograficzne", "Великие географические открытия"],
      renaissance: ["2", 14, "Renesans w Europie", "Возрождение в Европе"],
      reformation: ["3", 21, "Reformacja w Europie", "Реформация в Европе"],
      "catholic-reform": ["4", 28, "Reforma Kościoła katolickiego", "Реформа католической церкви"],
    },
  },
  golden: {
    number: 2,
    name: ["Złoty wiek", "Золотой век", "The Golden Age"],
    subtopics: ["Zygmunt Stary i Zygmunt August", "hołd pruski", "tolerancja religijna", "konfederacja warszawska", "folwark i pańszczyzna", "handel zbożem", "renesans w Polsce", "unia lubelska", "wolna elekcja", "artykuły henrykowskie", "Stefan Batory"],
    paragraphs: {
      sigismund: ["5", 36, "Czasy zygmuntowskie", "Эпоха Сигизмундов"],
      tolerance: ["6", 43, "Tolerancja religijna w Polsce", "Религиозная терпимость в Польше"],
      economy: ["7", 49, "Gospodarka dawnej Polski", "Хозяйство старой Польши"],
      renaissance: ["8", 56, "Renesans w Polsce", "Возрождение в Польше"],
      lublin: ["9", 64, "Unia lubelska", "Люблинская уния"],
      election: ["10", 70, "Bezkrólewie i wolna elekcja", "Бескоролевье и свободная элекция"],
      batory: ["11", 77, "Panowanie Stefana Batorego", "Правление Стефана Батория"],
    },
  },
  wars: {
    number: 3,
    name: ["Rzeczpospolita w XVII wieku", "Речь Посполитая в XVII веке", "The Commonwealth in the 17th century"],
    subtopics: ["wojny ze Szwecją", "dymitriady", "Kircholm i Kłuszyn", "Chocim", "powstanie Chmielnickiego", "potop szwedzki", "obrona Jasnej Góry", "liberum veto", "odsiecz wiedeńska", "barok", "sarmatyzm"],
    paragraphs: {
      sweden: ["12", 85, "Wojny ze Szwecją i z Moskwą", "Войны со Швецией и с Москвой"],
      turkey: ["13", 91, "Konflikty z Turcją i ze Szwecją", "Конфликты с Турцией и со Швецией"],
      khmelnytsky: ["14", 96, "Powstanie Chmielnickiego", "Восстание Хмельницкого"],
      deluge: ["15", 103, "Potop", "Потоп"],
      crisis: ["16", 110, "Kryzys Rzeczypospolitej", "Кризис Речи Посполитой"],
      vienna: ["17", 116, "Wojny z Turcją", "Войны с Турцией"],
      baroque: ["18", 123, "Barok i sarmatyzm", "Барокко и сарматизм"],
    },
  },
  europe: {
    number: 4,
    name: ["Europa i Ameryka w XVII i XVIII wieku", "Европа и Америка в XVII–XVIII веках", "Europe and America in the 17th and 18th centuries"],
    subtopics: ["absolutyzm", "Ludwik XIV", "monarchia parlamentarna", "oświecenie", "Rosja Piotra I", "Prusy", "Austria", "Stany Zjednoczone", "rewolucja francuska", "Deklaracja praw człowieka i obywatela", "republika i terror"],
    paragraphs: {
      absolutism: ["19", 130, "Absolutyzm we Francji", "Абсолютизм во Франции"],
      england: ["20", 137, "Monarchia parlamentarna w Anglii", "Парламентская монархия в Англии"],
      enlightenment: ["21", 144, "Oświecenie w Europie", "Просвещение в Европе"],
      powers: ["22", 151, "Nowe potęgi w Europie", "Новые державы в Европе"],
      usa: ["23", 159, "Powstanie Stanów Zjednoczonych", "Возникновение Соединённых Штатов"],
      revolution: ["24", 166, "Początek rewolucji francuskiej", "Начало Французской революции"],
      republic: ["25", 172, "Od monarchii konstytucyjnej do republiki", "От конституционной монархии к республике"],
    },
  },
  fall: {
    number: 5,
    name: ["Ostatnie stulecie I Rzeczpospolitej", "Последнее столетие I Речи Посполитой", "The last century of the Commonwealth"],
    subtopics: ["czasy saskie", "Stanisław August Poniatowski", "konfederacja barska", "I rozbiór", "Komisja Edukacji Narodowej", "Sejm Wielki", "Konstytucja 3 maja", "konfederacja targowicka", "II rozbiór", "insurekcja kościuszkowska", "III rozbiór"],
    paragraphs: {
      saxon: ["26", 181, "Czasy saskie", "Саксонские времена"],
      "last-king": ["27", 188, "Ostatni król Polski", "Последний король Польши"],
      stanislaus: ["28", 196, "Czasy stanisławowskie", "Эпоха Станислава Августа"],
      constitution: ["29", 204, "Konstytucja 3 maja", "Конституция 3 мая"],
      "second-partition": ["30", 211, "II rozbiór Polski", "Второй раздел Польши"],
      collapse: ["31", 218, "Upadek Rzeczypospolitej", "Падение Речи Посполитой"],
    },
  },
  napoleon: {
    number: 6,
    name: ["Okres napoleoński", "Наполеоновская эпоха", "The Napoleonic era"],
    subtopics: ["Napoleon Bonaparte", "wojny napoleońskie", "Legiony Polskie", "Mazurek Dąbrowskiego", "Księstwo Warszawskie", "Kodeks Napoleona", "wyprawa na Moskwę", "kongres wiedeński"],
    paragraphs: {
      conquests: ["32", 226, "Podboje Napoleona", "Завоевания Наполеона"],
      legions: ["33", 234, "Po III rozbiorze Polski", "После третьего раздела Польши"],
      duchy: ["34", 240, "Księstwo Warszawskie", "Варшавское герцогство"],
    },
  },
} as const;

const book = defineBook("sp6", undefined, BOOK);

export const SP6_CHAPTERS = book.chapters;
export const SP6_PARAGRAPHS = book.paragraphs;
/** class 6 paragraph ids by chapter and slug: `P.golden.lublin` */
export const P = book.P;
