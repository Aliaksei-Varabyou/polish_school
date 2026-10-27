// What Mors says in biology, on top of his common lines (@portal/ui). He speaks the language of the
// lesson/session (pl or ru), not of the portal UI, so he never mixes languages with the content.
import { type MorsLines, morsLines } from "@portal/ui";
import type { BioLang } from "../lang.ts";

const BIO: Record<BioLang, MorsLines> = {
  ru: {
    right: ["Я это нюхом чуял!"],
    wrong: ["Даже у собак бывают промахи — главное, принюхаться снова"],
    almost: ["Последний раздел! Внизу ждёт тест", "Почти дочитали — финишная прямая!"],
    practice: ["Поиграем? Я принёс мячик — то есть тест 🎾", "Проверим, что запомнилось? Тест прямо здесь 👇"],
    pet: ["Я тоже млекопитающее, кстати", "У меня четырёхкамерное сердце, как у тебя. Только бьётся быстрее"],
    perfect: ["Чистая работа! У меня 300 миллионов обонятельных рецепторов, и все чуют отличника"],
  },
  pl: {
    right: ["Wywęszyłem to!"],
    wrong: ["Nawet psom zdarza się pudło — trzeba powęszyć jeszcze raz"],
    almost: ["Ostatnia część! Na dole czeka test", "Prawie koniec — ostatnia prosta!"],
    practice: ["Pobawimy się? Przyniosłem piłkę — to znaczy test 🎾", "Sprawdzimy, co zostało w głowie? Test jest tutaj 👇"],
    pet: ["Ja też jestem ssakiem, wiesz?", "Mam czterokomorowe serce jak ty. Tylko bije szybciej"],
    perfect: ["Czysta robota! Mam 300 milionów receptorów węchowych i wszystkie czują prymusa"],
  },
};

export const bioMorsLines = (lang: BioLang): MorsLines => morsLines(lang, BIO);

/** What Mors says on the results screen, by score band. */
export const MORS_RESULTS: Record<BioLang, Record<"great" | "good" | "ok" | "low", string>> = {
  ru: {
    great: "Гав-гав! Это уровень отличника 🦴",
    good: "Хорошо! Пара ошибок — разберём их ниже",
    ok: "Неплохо! Ещё один подход — и будет лучше",
    low: "Не грусти. Перечитай объяснение и попробуй снова — я подожду",
  },
  pl: {
    great: "Hau, hau! To poziom prymusa 🦴",
    good: "Dobrze! Kilka błędów — omówimy je niżej",
    ok: "Nieźle! Jeszcze jedno podejście i będzie lepiej",
    low: "Nie martw się. Przeczytaj wyjaśnienie i spróbuj jeszcze raz — poczekam",
  },
};

export const MORS_LOADING: Record<BioLang, string> = {
  ru: "Морс бежит за заданиями…",
  pl: "Mors biegnie po zadania…",
};
