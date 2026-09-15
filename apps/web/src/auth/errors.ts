/** Error thrown by the auth actions; `code` maps to the `auth.errors.*` translation keys. */
export class AuthActionError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
  }
}

export type AuthErrorCode =
  | "invalid_credentials"
  | "user_already_exists"
  | "weak_password"
  | "email_invalid"
  | "email_not_confirmed"
  | "no_account"
  | "rate_limit"
  | "network"
  | "disabled"
  | "generic";

/** Normalises Supabase auth errors (codes and legacy messages) to our codes. */
export function authErrorCode(err: unknown): AuthErrorCode {
  if (err instanceof AuthActionError) return err.code;
  const e = (err ?? {}) as { code?: string; message?: string; status?: number; name?: string };
  const code = e.code ?? "";
  const message = (e.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) return "invalid_credentials";
  if (code === "user_already_exists" || code === "email_exists" || message.includes("already registered")) {
    return "user_already_exists";
  }
  if (code === "weak_password" || message.includes("password should")) return "weak_password";
  if (code === "email_address_invalid" || code === "validation_failed" || message.includes("invalid format")) return "email_invalid";
  if (code === "email_not_confirmed") return "email_not_confirmed";
  // magic links never create accounts (sign-up collects birth year and consent)
  if (code === "otp_disabled" || code === "signup_disabled" || message.includes("signups not allowed")) return "no_account";
  if (code.startsWith("over_") || e.status === 429) return "rate_limit";
  if (e.name === "AuthRetryableFetchError" || message.includes("failed to fetch")) return "network";
  return "generic";
}
