import { Lang, ParentalConsentRequest } from "@portal/core";
import { CONSENT_LINK_DAYS, maskEmail, type PortalDb } from "@portal/db";
import type { FastifyInstance } from "fastify";
import { requireUser } from "../auth.ts";
import { CONSENT_TEXT_VERSION, consentEmail, consentResultPage } from "../consentTexts.ts";
import type { Mailer } from "../mailer.ts";

export interface ConsentRoutesOptions {
  db?: PortalDb;
  mailer: Mailer;
  /** public base URL of the API, used in the confirmation link */
  publicUrl: string;
}

/** Double opt-in parental consent for students under 16. */
export function registerConsentRoutes(app: FastifyInstance, { db, mailer, publicUrl }: ConsentRoutesOptions) {
  app.post(
    "/api/me/parental-consent",
    { config: { rateLimit: { max: 5, timeWindow: "1 hour" } } },
    async (request, reply) => {
      const auth = requireUser(request, reply, db);
      if (!auth) return reply;
      const parsed = ParentalConsentRequest.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request", code: "BAD_REQUEST" });
      }
      const { parentEmail, lang } = parsed.data;
      if (auth.user.email && parentEmail === auth.user.email.toLowerCase()) {
        return reply.code(400).send({ error: "The parent's e-mail must differ from the student's", code: "PARENT_EMAIL_SAME" });
      }

      const profile = await auth.db.getProfile(auth.user);
      if (!profile) return reply.code(404).send({ error: "Profile not found", code: "NOT_FOUND" });
      if (!profile.consentRequired) return reply.code(409).send({ error: "Consent is not required", code: "CONSENT_NOT_REQUIRED" });

      const { token } = await auth.db.requestParentalConsent(auth.user.id, parentEmail, CONSENT_TEXT_VERSION);
      const link = `${publicUrl.replace(/\/$/, "")}/api/consent/confirm?token=${encodeURIComponent(token)}&lang=${lang}`;
      await mailer.send(consentEmail(lang, { to: parentEmail, childName: profile.displayName ?? "—", link, days: CONSENT_LINK_DAYS }));
      return { ok: true, sentTo: maskEmail(parentEmail) };
    },
  );

  app.get<{ Querystring: { token?: string; lang?: string } }>(
    "/api/consent/confirm",
    { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const lang = Lang.safeParse(request.query.lang).data ?? "pl";
      if (!db) return reply.code(503).type("text/html").send(consentResultPage(lang, "invalid"));
      const result = await db.confirmParentalConsent(request.query.token ?? "");
      return reply
        .code(result === "confirmed" || result === "already-confirmed" ? 200 : 400)
        .type("text/html; charset=utf-8")
        .send(consentResultPage(lang, result));
    },
  );
}
