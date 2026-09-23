// Web entry of the biology trainer: catalog metadata and translations load eagerly, the app lazily.
import type { TrainerWeb } from "@portal/trainer-sdk";
import { topicLabel } from "../curriculum/index.ts";
import { BIO_LANGS } from "../lang.ts";
import en from "./i18n/en.json";
import pl from "./i18n/pl.json";
import ru from "./i18n/ru.json";

export const bioTrainerWeb: TrainerWeb = {
  id: "bio",
  icon: "🧬",
  name: { ru: "Биология", en: "Biology", pl: "Biologia" },
  description: {
    ru: "Лицей, 3 класс, zakres rozszerzony: анатомия и физиология человека — термины, схемы регуляции и расчёты",
    en: "Liceum class 3, extended level: human anatomy and physiology — terms, regulation loops and calculations",
    pl: "Liceum klasa 3, zakres rozszerzony: anatomia i fizjologia człowieka — terminy, regulacja i obliczenia",
  },
  grades: ["lo3"],
  // the UI speaks all three portal languages; the tasks themselves exist only in these two
  contentLangs: [...BIO_LANGS],
  translations: { ru, en, pl },
  topicName: (topicId, lang) => topicLabel(topicId, lang),
  load: () => import("./App.tsx"),
  loadReview: () => import("./Review.tsx"),
};
