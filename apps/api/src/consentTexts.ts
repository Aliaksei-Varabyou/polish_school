import type { Lang } from "@portal/core";
import type { ConsentConfirmation } from "@portal/db";
import type { MailMessage } from "./mailer.ts";

/** Bump when the consent text changes; stored with every consent as evidence. */
export const CONSENT_TEXT_VERSION = "2026-09-15";

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

interface EmailText {
  subject: string;
  intro: (name: string) => string;
  points: string[];
  action: string;
  expiry: (days: number) => string;
  ignore: string;
}

const EMAIL: Record<Lang, EmailText> = {
  pl: {
    subject: "Prośba o zgodę rodzica — Matema",
    intro: (name) => `Twoje dziecko (nazwa w serwisie: „${name}”) chce założyć konto w Matema — trenażerze do nauki matematyki zgodnym z podstawą programową.`,
    points: [
      "Zapisujemy: nazwę wyświetlaną, klasę, rok urodzenia i historię ćwiczeń (zadania, odpowiedzi, wyniki).",
      "Treść zadań i błędne odpowiedzi mogą być przekazywane dostawcy sztucznej inteligencji bez imienia i adresu e-mail dziecka.",
      "Konto i wszystkie dane można w każdej chwili usunąć w ustawieniach profilu.",
    ],
    action: "Potwierdzam, że jestem rodzicem lub opiekunem i wyrażam zgodę",
    expiry: (days) => `Link jest ważny ${days} dni. Bez potwierdzenia konto zostanie usunięte.`,
    ignore: "Jeśli nie znasz tej prośby, zignoruj tę wiadomość.",
  },
  ru: {
    subject: "Запрос согласия родителя — Matema",
    intro: (name) => `Ваш ребёнок (имя в сервисе: «${name}») хочет создать аккаунт в Matema — тренажёре по математике по польской школьной программе.`,
    points: [
      "Мы храним: отображаемое имя, класс, год рождения и историю занятий (задания, ответы, результаты).",
      "Тексты заданий и неверные ответы могут передаваться поставщику искусственного интеллекта без имени и e-mail ребёнка.",
      "Аккаунт и все данные можно в любой момент удалить в настройках профиля.",
    ],
    action: "Подтверждаю, что я родитель или опекун, и даю согласие",
    expiry: (days) => `Ссылка действует ${days} дней. Без подтверждения аккаунт будет удалён.`,
    ignore: "Если вы не знаете об этом запросе, просто проигнорируйте письмо.",
  },
  en: {
    subject: "Parental consent request — Matema",
    intro: (name) => `Your child (display name: "${name}") wants to create an account in Matema, a math practice trainer following the Polish curriculum.`,
    points: [
      "We store: display name, class, year of birth and practice history (tasks, answers, scores).",
      "Task texts and wrong answers may be sent to an artificial intelligence provider without the child's name or e-mail.",
      "The account and all data can be deleted at any time in the profile settings.",
    ],
    action: "I confirm I am the parent or guardian and I give my consent",
    expiry: (days) => `The link is valid for ${days} days. Without confirmation the account will be deleted.`,
    ignore: "If you don't know about this request, just ignore this e-mail.",
  },
};

export function consentEmail(lang: Lang, { to, childName, link, days }: { to: string; childName: string; link: string; days: number }): MailMessage {
  const t = EMAIL[lang];
  const text = [t.intro(childName), "", ...t.points.map((p) => `- ${p}`), "", `${t.action}:`, link, "", t.expiry(days), t.ignore].join("\n");
  const html = `<p>${escapeHtml(t.intro(childName))}</p>
<ul>${t.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
<p><a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none">${escapeHtml(t.action)}</a></p>
<p style="color:#64748b">${escapeHtml(t.expiry(days))}<br>${escapeHtml(t.ignore)}</p>`;
  return { to, subject: t.subject, text, html };
}

const PAGE: Record<Lang, Record<ConsentConfirmation, string>> = {
  pl: {
    confirmed: "Dziękujemy! Zgoda została potwierdzona. Dziecko może korzystać z konta.",
    "already-confirmed": "Ta zgoda była już potwierdzona wcześniej.",
    expired: "Link wygasł. Poproś dziecko o ponowne wysłanie prośby z ustawień profilu.",
    invalid: "Link jest nieprawidłowy lub został już zastąpiony nowszym.",
  },
  ru: {
    confirmed: "Спасибо! Согласие подтверждено. Ребёнок может пользоваться аккаунтом.",
    "already-confirmed": "Это согласие уже было подтверждено раньше.",
    expired: "Срок действия ссылки истёк. Попросите ребёнка отправить запрос заново из настроек профиля.",
    invalid: "Ссылка недействительна или уже заменена более новой.",
  },
  en: {
    confirmed: "Thank you! Consent has been confirmed. Your child can now use the account.",
    "already-confirmed": "This consent was already confirmed.",
    expired: "The link has expired. Ask your child to send the request again from the profile settings.",
    invalid: "The link is invalid or has been replaced by a newer one.",
  },
};

export function consentResultPage(lang: Lang, result: ConsentConfirmation): string {
  const ok = result === "confirmed" || result === "already-confirmed";
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Matema</title></head>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px">
<main style="max-width:420px;background:#fff;border-radius:16px;padding:28px;box-shadow:0 1px 3px #0001;text-align:center">
<div style="font-size:40px">${ok ? "✅" : "⚠️"}</div><p style="font-size:18px;line-height:1.5">${escapeHtml(PAGE[lang][result])}</p>
</main></body></html>`;
}
