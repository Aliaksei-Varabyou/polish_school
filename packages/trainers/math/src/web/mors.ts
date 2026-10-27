// What Mors says in math, on top of his common lines (@portal/ui). He speaks the session language,
// which here is the portal language, so English gets its own set.
import type { Lang } from "@portal/core";
import { type MorsLines, morsLines } from "@portal/ui";

const MATH: Record<Lang, MorsLines> = {
  ru: {
    greet: ["Я умею считать до четырёх — по лапам. Дальше рассчитываю на тебя", "Математика? Гав! Я буду подсказывать хвостом: виляет — значит верно"],
    right: ["Сошлось! Как косточка с миской", "Ответ сходится — хвост сходит с ума"],
    wrong: ["Пересчитай — у меня тоже не всегда четыре лапы сходятся", "Проверь знак. Минус коварнее кошки", "Где-то потерялась единичка. Поищем?"],
    streak: ["{n} подряд! Это уже не везение, это метод", "{n} верных подряд — ты щёлкаешь их как косточки"],
    perfect: ["Всё верно! Дроби побеждены, косточку делить не придётся 🦴"],
    pet: ["Дроби — это когда одну косточку делят на двоих. Я против", "Моя любимая фигура — круг. Потому что миска"],
  },
  pl: {
    greet: ["Umiem liczyć do czterech — na łapach. Dalej liczę na ciebie", "Matematyka? Hau! Będę podpowiadał ogonem: merda — znaczy dobrze"],
    right: ["Zgadza się! Jak kostka z miską", "Wynik się zgadza — ogon szaleje"],
    wrong: ["Policz jeszcze raz — mnie też nie zawsze wychodzą cztery łapy", "Sprawdź znak. Minus jest podstępniejszy niż kot", "Gdzieś zgubiła się jedynka. Poszukamy?"],
    streak: ["{n} z rzędu! To już nie szczęście, to metoda", "{n} dobrych z rzędu — łamiesz je jak kostki"],
    perfect: ["Wszystko dobrze! Ułamki pokonane, kostki dzielić nie trzeba 🦴"],
    pet: ["Ułamki to gdy jedną kostkę dzieli się na dwa psy. Jestem przeciw", "Moja ulubiona figura to koło. Bo miska"],
  },
  en: {
    greet: ["I can count to four — on my paws. Beyond that I'm counting on you", "Math? Woof! I'll hint with my tail: wagging means right"],
    right: ["It adds up! Like a bone and a bowl", "The answer checks out — tail going wild"],
    wrong: ["Count again — my four paws don't always add up either", "Check the sign. A minus is sneakier than a cat", "A one got lost somewhere. Shall we look?"],
    streak: ["{n} in a row! That's not luck, that's method", "{n} right in a row — you crack them like bones"],
    perfect: ["All correct! Fractions defeated, no bone needs splitting 🦴"],
    pet: ["Fractions are one bone shared by two dogs. I'm against it", "My favourite shape is the circle. Because bowl"],
  },
};

export const mathMorsLines = (lang: Lang): MorsLines => morsLines(lang, MATH);

export const MORS_RESULTS: Record<Lang, Record<"great" | "good" | "ok" | "low", string>> = {
  ru: {
    great: "Гав-гав! Всё сошлось до последней цифры 🦴",
    good: "Хорошо! Пару примеров разберём ниже",
    ok: "Неплохо! Ещё один подход — и сойдётся",
    low: "Не грусти. Посмотри решения внизу и попробуй снова — я подожду",
  },
  pl: {
    great: "Hau, hau! Zgadza się co do cyfry 🦴",
    good: "Dobrze! Kilka zadań omówimy niżej",
    ok: "Nieźle! Jeszcze jedno podejście i się zgodzi",
    low: "Nie martw się. Zobacz rozwiązania niżej i spróbuj jeszcze raz — poczekam",
  },
  en: {
    great: "Woof woof! Right down to the last digit 🦴",
    good: "Good! We'll go through a couple of tasks below",
    ok: "Not bad! One more go and it'll add up",
    low: "Don't be sad. Look at the solutions below and try again — I'll wait",
  },
};

export const MORS_LOADING: Record<Lang, string> = {
  ru: "Морс бежит за задачами…",
  pl: "Mors biegnie po zadania…",
  en: "Mors is fetching the tasks…",
};
