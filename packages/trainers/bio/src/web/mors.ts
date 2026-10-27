// What Mors says in biology. He speaks the language of the lesson/session (pl or ru), not of the
// portal UI, so he never mixes languages with the content next to him. "{n}" is replaced by a number.
import type { MorsBuddyLabels, MorsLines } from "@portal/ui";
import type { BioLang } from "../lang.ts";

export const MORS_LINES: Record<BioLang, MorsLines> = {
  ru: {
    greet: ["Привет! Я Морс 🐾 Нажимай на рисунки и кнопки — я буду болеть за тебя", "Гав! Начнём? Я рядом, если что"],
    right: ["Гав! Верно!", "Так держать!", "Точно в цель!", "Хвост-морковка сам виляет!"],
    wrong: ["Не страшно, попробуй ещё раз", "Хм… давай подумаем ещё", "Ошибки — тоже часть учёбы", "Почти! Присмотрись повнимательнее"],
    done: ["Готово! А без ошибок слабо? 😉", "Прошли! Можно повторить и закрепить"],
    perfect: ["Ни одной ошибки! Это заслуживает косточку 🦴", "Идеально! Гав-гав!", "Вот это да! Чисто!"],
    streak: ["{n} подряд! 🔥", "{n} верных подряд — ты в ударе!"],
    almost: ["Последний раздел! Внизу ждёт тест", "Почти дочитали — финишная прямая!"],
    practice: ["Поиграем? Я принёс мячик — то есть тест 🎾", "Проверим, что запомнилось? Тест прямо здесь 👇"],
    pet: ["Ррр… приятно!", "Ещё! Почеши за ухом", "Гав! 💛", "Я тоже млекопитающее, кстати"],
    petMany: ["Всё, я самый счастливый терьер на свете!"],
  },
  pl: {
    greet: ["Cześć! Jestem Mors 🐾 Klikaj w rysunki i przyciski — będę ci kibicować", "Hau! Zaczynamy? Jestem obok"],
    right: ["Hau! Dobrze!", "Tak trzymać!", "W dziesiątkę!", "Mój ogon-marchewka sam merda!"],
    wrong: ["Nic się nie stało, spróbuj jeszcze raz", "Hmm… pomyślmy jeszcze", "Błędy też uczą", "Prawie! Przyjrzyj się uważniej"],
    done: ["Gotowe! A bez błędów dasz radę? 😉", "Zaliczone! Można powtórzyć dla utrwalenia"],
    perfect: ["Ani jednego błędu! Należy ci się kostka 🦴", "Perfekcyjnie! Hau, hau!", "No proszę! Czysto!"],
    streak: ["{n} z rzędu! 🔥", "{n} dobrych odpowiedzi z rzędu — idzie ci świetnie!"],
    almost: ["Ostatnia część! Na dole czeka test", "Prawie koniec — ostatnia prosta!"],
    practice: ["Pobawimy się? Przyniosłem piłkę — to znaczy test 🎾", "Sprawdzimy, co zostało w głowie? Test jest tutaj 👇"],
    pet: ["Mmm… miło!", "Jeszcze! Podrap za uchem", "Hau! 💛", "Ja też jestem ssakiem, wiesz?"],
    petMany: ["Jestem najszczęśliwszym terierem na świecie!"],
  },
};

export const MORS_LABELS: Record<BioLang, MorsBuddyLabels> = {
  ru: { pet: "Погладить Морса", hide: "Спрятать Морса", show: "Позвать Морса" },
  pl: { pet: "Pogłaszcz Morsa", hide: "Schowaj Morsa", show: "Zawołaj Morsa" },
};

/** What Mors says on the results screen, by score band. */
export const MORS_RESULTS: Record<BioLang, Record<"great" | "good" | "ok" | "low" | "pet", string>> = {
  ru: {
    pet: "Погладить Морса",
    great: "Гав-гав! Это уровень отличника 🦴",
    good: "Хорошо! Пара ошибок — разберём их ниже",
    ok: "Неплохо! Ещё один подход — и будет лучше",
    low: "Не грусти. Перечитай объяснение и попробуй снова — я подожду",
  },
  pl: {
    pet: "Pogłaszcz Morsa",
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
