import { LANGS, type Lang } from "@portal/core";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { trainers } from "../trainers.ts";
import en from "./portal.en.json";
import pl from "./portal.pl.json";
import ru from "./portal.ru.json";

const STORAGE_KEY = "portal-lang";
const isLang = (value: string | null | undefined): value is Lang => !!value && (LANGS as readonly string[]).includes(value);

export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // storage unavailable
  }
  const browser = navigator.language.slice(0, 2);
  return isLang(browser) ? browser : "pl";
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // storage unavailable
  }
}

const portal = { ru, en, pl };

// namespace "portal" for the shell, one namespace per trainer (= trainer id)
const resources = Object.fromEntries(
  LANGS.map((lang) => [lang, { portal: portal[lang], ...Object.fromEntries(trainers.map((tr) => [tr.id, tr.translations[lang]])) }]),
);

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLang(),
  fallbackLng: "en",
  defaultNS: "portal",
  ns: ["portal", ...trainers.map((tr) => tr.id)],
  interpolation: { escapeValue: false },
});

export default i18n;
