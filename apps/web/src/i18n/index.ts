import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import pl from "./pl.json";
import ru from "./ru.json";

void i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en }, pl: { translation: pl } },
  lng: "ru",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
