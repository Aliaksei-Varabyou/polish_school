// What Mors says in history, on top of his common lines (@portal/ui). He speaks the language of the
// lesson/session (pl or ru), not of the portal UI, so he never mixes languages with the content.
// A Westie is a Scottish dog, and he knows it.
import { type MorsLines, morsLines } from "@portal/ui";
import type { HistLang } from "../lang.ts";

const HISTORY: Record<HistLang, MorsLines> = {
  ru: {
    greet: ["Я из Шотландии, как Мария Стюарт. Но история Польши мне нравится больше", "История? Гав! Я помню всё — кроме того, где закопал косточку в 1569-м"],
    right: ["Так и записано в хрониках!", "Точно, как по летописи!", "Сигизмунд бы одобрил"],
    wrong: ["Хм, тогда было иначе. Перелистни в памяти", "Не тот король! Их было много, я понимаю", "Даты — коварная штука. Попробуй ещё"],
    streak: ["{n} подряд! Ты уже как королевский летописец", "{n} верных — сейм принял бы тебя единогласно"],
    perfect: ["Без единой ошибки! Это тянет на гетманскую булаву 🦴"],
    pet: ["Мои предки — шотландские терьеры. Мы помним Стюартов", "Вести ловили крыс в замках. История у нас в крови"],
    almost: ["Последний раздел! Внизу ждёт тест", "Почти дочитали — финишная прямая, как под Веной!"],
    practice: ["Проверим, что запомнилось? Тест прямо здесь 👇", "Сейм собрался! То есть тест 🎾"],
  },
  pl: {
    greet: ["Jestem ze Szkocji jak Maria Stuart. Ale historia Polski podoba mi się bardziej", "Historia? Hau! Pamiętam wszystko — oprócz tego, gdzie zakopałem kość w 1569"],
    right: ["Tak zapisały kroniki!", "Dokładnie jak w kronice!", "Zygmunt by to pochwalił"],
    wrong: ["Hmm, wtedy było inaczej. Przekartkuj w pamięci", "Nie ten król! Było ich wielu, rozumiem", "Daty to podstępna rzecz. Spróbuj jeszcze"],
    streak: ["{n} z rzędu! Jesteś jak królewski kronikarz", "{n} dobrych — sejm przyjąłby cię jednogłośnie"],
    perfect: ["Bez jednego błędu! To zasługuje na buławę hetmańską 🦴"],
    pet: ["Moi przodkowie to szkockie teriery. Pamiętamy Stuartów", "Westie łapały szczury w zamkach. Historia jest w naszej krwi"],
    almost: ["Ostatnia część! Na dole czeka test", "Prawie koniec — ostatnia prosta, jak pod Wiedniem!"],
    practice: ["Sprawdzimy, co zostało w głowie? Test jest tutaj 👇", "Sejm się zebrał! To znaczy test 🎾"],
  },
};

export const historyMorsLines = (lang: HistLang): MorsLines => morsLines(lang, HISTORY);

/** What Mors says on the results screen, by score band. */
export const MORS_RESULTS: Record<HistLang, Record<"great" | "good" | "ok" | "low", string>> = {
  ru: {
    great: "Гав-гав! Хоть в королевские хронисты 🦴",
    good: "Хорошо! Пару дат разберём ниже",
    ok: "Неплохо! Ещё один подход — и будет лучше",
    low: "Не грусти. Перечитай объяснение и попробуй снова — я подожду",
  },
  pl: {
    great: "Hau, hau! Choćby na królewskiego kronikarza 🦴",
    good: "Dobrze! Kilka dat omówimy niżej",
    ok: "Nieźle! Jeszcze jedno podejście i będzie lepiej",
    low: "Nie martw się. Przeczytaj wyjaśnienie i spróbuj jeszcze raz — poczekam",
  },
};

export const MORS_LOADING: Record<HistLang, string> = {
  ru: "Морс бежит за заданиями…",
  pl: "Mors biegnie po zadania…",
};
