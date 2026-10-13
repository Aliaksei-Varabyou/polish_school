// Web entry of the biology trainer: catalog metadata and translations load eagerly, the app lazily.
import type { TrainerWeb } from "@portal/trainer-sdk";
import { BIO_GRADES, topicLabel } from "../curriculum/index.ts";
import { BIO_LANGS } from "../lang.ts";
import en from "./i18n/en.json";
import pl from "./i18n/pl.json";
import ru from "./i18n/ru.json";

export const bioTrainerWeb: TrainerWeb = {
  id: "bio",
  icon: "🧬",
  name: { ru: "Биология", en: "Biology", pl: "Biologia" },
  description: {
    ru: "6 класс: многообразие животных. Лицей, 3 класс (zakres rozszerzony): анатомия и физиология человека",
    en: "Grade 6: animal diversity. Liceum grade 3 (extended level): human anatomy and physiology",
    pl: "Klasa 6: różnorodność zwierząt. Liceum klasa 3 (zakres rozszerzony): anatomia i fizjologia człowieka",
  },
  grades: [...BIO_GRADES],
  // the UI speaks all three portal languages; the tasks themselves exist only in these two
  contentLangs: [...BIO_LANGS],
  translations: { ru, en, pl },
  topicName: (topicId, lang) => topicLabel(topicId, lang),
  load: () => import("./App.tsx"),
  loadReview: () => import("./Review.tsx"),
};
