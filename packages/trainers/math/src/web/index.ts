// Web entry of the math trainer: catalog metadata and translations load eagerly, the app lazily.
import { GRADES } from "@portal/core";
import type { TrainerWeb } from "@portal/trainer-sdk";
import { getTopic } from "../curriculum/index.ts";
import en from "./i18n/en.json";
import pl from "./i18n/pl.json";
import ru from "./i18n/ru.json";

export const mathTrainerWeb: TrainerWeb = {
  id: "math",
  icon: "➗",
  name: { ru: "Математика", en: "Mathematics", pl: "Matematyka" },
  description: {
    ru: "Szkoła podstawowa 5–8 и liceum 1–4: задачи по темам с проверкой ответов, решениями и разбором слабых мест",
    en: "Primary school grades 5–8 and liceum 1–4: topic-based tasks with answer checking, solutions and weak-spot analysis",
    pl: "Szkoła podstawowa 5–8 i liceum 1–4: zadania z wybranych tematów ze sprawdzaniem, rozwiązaniami i analizą słabych stron",
  },
  grades: [...GRADES],
  translations: { ru, en, pl },
  topicName: (topicId, lang) => getTopic(topicId)?.name[lang] ?? topicId,
  load: () => import("./App.tsx"),
  loadReview: () => import("./Review.tsx"),
};
