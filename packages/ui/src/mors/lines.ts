// What Mors says everywhere, in the portal's three languages. A trainer adds its own lines on top
// (fractions in math, books in lectures); `morsLines` merges them so the subject's lines join the
// common ones instead of replacing them. "{n}" in a line is replaced by the event's number.
import type { MorsBuddyLabels, MorsLines } from "./MorsBuddy.tsx";

export type MorsLang = "ru" | "pl" | "en";

export const MORS_BASE_LINES: Record<MorsLang, MorsLines> = {
  ru: {
    greet: ["Привет! Я Морс 🐾 Я буду болеть за тебя", "Гав! Начнём? Я рядом, если что"],
    right: ["Гав! Верно!", "Так держать!", "Точно в цель!", "Хвост-морковка сам виляет!"],
    wrong: ["Не страшно, попробуй ещё раз", "Хм… давай подумаем ещё", "Ошибки — тоже часть учёбы", "Почти! Присмотрись повнимательнее"],
    done: ["Готово! А без ошибок слабо? 😉", "Прошли! Можно повторить и закрепить"],
    perfect: ["Ни одной ошибки! Это заслуживает косточку 🦴", "Идеально! Гав-гав!", "Вот это да! Чисто!"],
    streak: ["{n} подряд! 🔥", "{n} верных подряд — ты в ударе!"],
    pet: ["Ррр… приятно!", "Ещё! Почеши за ухом", "Гав! 💛"],
    petMany: ["Всё, я самый счастливый терьер на свете!"],
  },
  pl: {
    greet: ["Cześć! Jestem Mors 🐾 Będę ci kibicować", "Hau! Zaczynamy? Jestem obok"],
    right: ["Hau! Dobrze!", "Tak trzymać!", "W dziesiątkę!", "Mój ogon-marchewka sam merda!"],
    wrong: ["Nic się nie stało, spróbuj jeszcze raz", "Hmm… pomyślmy jeszcze", "Błędy też uczą", "Prawie! Przyjrzyj się uważniej"],
    done: ["Gotowe! A bez błędów dasz radę? 😉", "Zaliczone! Można powtórzyć dla utrwalenia"],
    perfect: ["Ani jednego błędu! Należy ci się kostka 🦴", "Perfekcyjnie! Hau, hau!", "No proszę! Czysto!"],
    streak: ["{n} z rzędu! 🔥", "{n} dobrych odpowiedzi z rzędu — idzie ci świetnie!"],
    pet: ["Mmm… miło!", "Jeszcze! Podrap za uchem", "Hau! 💛"],
    petMany: ["Jestem najszczęśliwszym terierem na świecie!"],
  },
  en: {
    greet: ["Hi! I'm Mors 🐾 I'll be cheering for you", "Woof! Shall we start? I'm right here"],
    right: ["Woof! Correct!", "Keep it up!", "Bullseye!", "My carrot tail is wagging by itself!"],
    wrong: ["No worries, try again", "Hmm… let's think once more", "Mistakes are part of learning", "Almost! Look a little closer"],
    done: ["Done! Now try it with no mistakes 😉", "Finished! One more round makes it stick"],
    perfect: ["Not a single mistake! That deserves a bone 🦴", "Perfect! Woof woof!", "Look at that! Spotless!"],
    streak: ["{n} in a row! 🔥", "{n} right in a row — you're on fire!"],
    pet: ["Mmm… nice!", "More! Behind the ear, please", "Woof! 💛"],
    petMany: ["I'm the happiest terrier in the world!"],
  },
};

export const MORS_LABELS: Record<MorsLang, MorsBuddyLabels> = {
  ru: { pet: "Погладить Морса", hide: "Спрятать Морса", show: "Позвать Морса" },
  pl: { pet: "Pogłaszcz Morsa", hide: "Schowaj Morsa", show: "Zawołaj Morsa" },
  en: { pet: "Pet Mors", hide: "Hide Mors", show: "Call Mors" },
};

export type MorsScoreBand = "great" | "good" | "ok" | "low";

/** What Mors says on a results screen, by score band. */
export const MORS_BASE_RESULTS: Record<MorsLang, Record<MorsScoreBand, string>> = {
  ru: {
    great: "Гав-гав! Это уровень отличника 🦴",
    good: "Хорошо! Пара ошибок — разберём их ниже",
    ok: "Неплохо! Ещё один подход — и будет лучше",
    low: "Не грусти. Попробуй снова — я подожду",
  },
  pl: {
    great: "Hau, hau! To poziom prymusa 🦴",
    good: "Dobrze! Kilka błędów — omówimy je niżej",
    ok: "Nieźle! Jeszcze jedno podejście i będzie lepiej",
    low: "Nie martw się. Spróbuj jeszcze raz — poczekam",
  },
  en: {
    great: "Woof woof! That's top-of-the-class 🦴",
    good: "Good! A couple of slips — we'll go through them below",
    ok: "Not bad! One more go and it'll be better",
    low: "Don't be sad. Try again — I'll wait",
  },
};

/** The common lines plus a subject's own, per language; the subject's lines come first in the pick. */
export function morsLines(lang: MorsLang, extra?: Partial<Record<MorsLang, MorsLines>>): MorsLines {
  const base = MORS_BASE_LINES[lang];
  const own = extra?.[lang];
  if (!own) return base;
  const merged: MorsLines = { ...base };
  for (const key of Object.keys(own) as (keyof MorsLines)[]) {
    merged[key] = [...(own[key] ?? []), ...(base[key] ?? [])];
  }
  return merged;
}
