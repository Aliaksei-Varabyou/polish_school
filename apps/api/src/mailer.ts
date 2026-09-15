import nodemailer from "nodemailer";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

/**
 * SMTP mailer from env (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM).
 * Without SMTP_HOST messages are only logged — enough for local development.
 */
export function createMailer(env: Record<string, string | undefined> = process.env, log: Pick<Console, "warn"> = console): Mailer {
  if (!env.SMTP_HOST) {
    return {
      async send(message) {
        log.warn(`[mail] SMTP is not configured, not sending "${message.subject}" to ${message.to}:\n${message.text}`);
      },
    };
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT ?? 587),
    secure: env.SMTP_SECURE === "true",
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS ?? "" } : undefined,
  });
  const from = env.MAIL_FROM ?? "Matema <no-reply@localhost>";

  return {
    async send(message) {
      await transport.sendMail({ from, ...message });
    },
  };
}
