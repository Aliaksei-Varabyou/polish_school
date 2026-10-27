// What Mors says in the reading-list quizzes, on top of his common lines (@portal/ui). The questions
// are always Polish, but Mors is part of the interface and follows the portal language.
import type { Lang } from "@portal/core";
import { type MorsLines, morsLines } from "@portal/ui";

const LECTURES: Record<Lang, MorsLines> = {
  ru: {
    greet: ["Книжку прочитали? Я тоже — обнюхал каждую страницу", "Гав! Я люблю, когда мне читают вслух. Проверим, что запомнилось?"],
    right: ["Точно, так и было в книге!", "Помнишь сюжет лучше, чем я — где закопал косточку"],
    wrong: ["Хм, в книге было иначе. Перелистни в памяти", "Не тот герой! Или не та глава", "Перечитаем этот кусочек?"],
    streak: ["{n} подряд! Ты эту книгу знаешь наизусть", "{n} верных — ты читал внимательнее, чем я нюхаю"],
    perfect: ["Всё верно! Такую память только собачьей и назвать 🦴"],
    pet: ["Мой любимый герой — любой, у кого есть собака", "В книгах про собак всегда самое интересное — собака"],
  },
  pl: {
    greet: ["Lektura przeczytana? Ja też — obwąchałem każdą stronę", "Hau! Lubię, gdy ktoś mi czyta na głos. Sprawdzimy, co zostało w głowie?"],
    right: ["Dokładnie, tak było w książce!", "Pamiętasz fabułę lepiej niż ja — gdzie zakopałem kość"],
    wrong: ["Hmm, w książce było inaczej. Przekartkuj w pamięci", "Nie ten bohater! Albo nie ten rozdział", "Przeczytamy ten kawałek jeszcze raz?"],
    streak: ["{n} z rzędu! Znasz tę lekturę na pamięć", "{n} dobrych — czytałeś uważniej, niż ja węszę"],
    perfect: ["Wszystko dobrze! Taką pamięć można nazwać tylko psią 🦴"],
    pet: ["Mój ulubiony bohater to każdy, kto ma psa", "W książkach o psach najciekawszy jest zawsze pies"],
  },
  en: {
    greet: ["Finished the book? So did I — sniffed every page", "Woof! I love being read to. Let's see what stuck"],
    right: ["Exactly, that's how it went in the book!", "You remember the plot better than I remember where I buried the bone"],
    wrong: ["Hmm, the book had it differently. Flip back in your memory", "Wrong character! Or wrong chapter", "Shall we reread that bit?"],
    streak: ["{n} in a row! You know this book by heart", "{n} right — you read more carefully than I sniff"],
    perfect: ["All correct! That's what I call a dog's memory 🦴"],
    pet: ["My favourite character is anyone who has a dog", "In books about dogs, the dog is always the best part"],
  },
};

export const lecturesMorsLines = (lang: Lang): MorsLines => morsLines(lang, LECTURES);

export const MORS_RESULTS: Record<Lang, Record<"great" | "good" | "ok" | "low", string>> = {
  ru: {
    great: "Гав-гав! Книга прочитана по-настоящему 🦴",
    good: "Хорошо! Пару глав стоит освежить — они ниже",
    ok: "Неплохо! Полистай книгу ещё раз и возвращайся",
    low: "Не грусти. Перечитай главы из списка ниже — я подожду",
  },
  pl: {
    great: "Hau, hau! Lektura przeczytana naprawdę 🦴",
    good: "Dobrze! Kilka rozdziałów warto odświeżyć — są niżej",
    ok: "Nieźle! Przekartkuj książkę jeszcze raz i wracaj",
    low: "Nie martw się. Przeczytaj rozdziały z listy niżej — poczekam",
  },
  en: {
    great: "Woof woof! That book was really read 🦴",
    good: "Good! A couple of chapters are worth a refresh — they're below",
    ok: "Not bad! Leaf through the book once more and come back",
    low: "Don't be sad. Reread the chapters listed below — I'll wait",
  },
};
