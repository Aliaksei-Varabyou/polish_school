// Web entry of the lectures trainer: catalog metadata and translations load eagerly, the app lazily.
import type { TrainerWeb } from "@portal/trainer-sdk";
import { BOOKS, getTopic } from "../index.ts";
import pl from "./i18n/pl.json";
import ru from "./i18n/ru.json";

export const lectureTrainerWeb: TrainerWeb = {
  id: "lectures",
  icon: "📖",
  name: { ru: "Лектуры", en: "Lectures", pl: "Lektury" },
  description: {
    ru: "Проверочные вопросы по школьным лектурам польской программы — вопросы и ответы всегда на польском",
    en: "Comprehension questions for the Polish school reading list — questions and answers are always in Polish",
    pl: "Pytania sprawdzające znajomość lektur szkolnych z polskiej podstawy programowej",
  },
  grades: [...new Set(BOOKS.flatMap((b) => b.grades))],
  // EN is hidden from the portal's language switcher (see apps/web/src/App.tsx) and this trainer
  // authors no new English copy — pl covers the (currently unreachable) en slot too.
  translations: { ru, en: pl, pl },
  topicName: (topicId, lang) => getTopic(topicId)?.name[lang] ?? topicId,
  load: () => import("./App.tsx"),
  loadReview: () => import("./Review.tsx"),
};
