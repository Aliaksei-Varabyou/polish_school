// Web entry of the history trainer: catalog metadata and translations load eagerly, the app lazily.
import type { TrainerWeb } from "@portal/trainer-sdk";
import { HIST_GRADES, topicLabel } from "../curriculum/index.ts";
import { HIST_LANGS } from "../lang.ts";
import en from "./i18n/en.json";
import pl from "./i18n/pl.json";
import ru from "./i18n/ru.json";

export const historyTrainerWeb: TrainerWeb = {
  id: "history",
  icon: "🏰",
  name: { ru: "История", en: "History", pl: "Historia" },
  description: {
    ru: "6 класс: от великих географических открытий до Варшавского герцогства — уроки и тесты по учебнику GWO",
    en: "Grade 6: from the great discoveries to the Duchy of Warsaw — lessons and tests following the GWO textbook",
    pl: "Klasa 6: od wielkich odkryć geograficznych do Księstwa Warszawskiego — lekcje i testy według podręcznika GWO",
  },
  grades: [...HIST_GRADES],
  // the UI speaks all three portal languages; the tasks themselves exist only in these two
  contentLangs: [...HIST_LANGS],
  translations: { ru, en, pl },
  topicName: (topicId, lang) => topicLabel(topicId, lang),
  load: () => import("./App.tsx"),
  loadReview: () => import("./Review.tsx"),
};
