import type { Lang, ProfileUpdate } from "@portal/core";
import { Button, Card, Segmented } from "@portal/ui";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { savePendingProfile, saveSignUpProfile, useAuth } from "../auth/AuthProvider.tsx";
import { authErrorCode } from "../auth/errors.ts";
import { googleEnabled } from "../auth/supabase.ts";
import { Field, INPUT, Notice } from "../components/Field.tsx";
import { AccountsUnavailable, Loading } from "../components/RequireAuth.tsx";
import { birthYears, needsParentalConsent, safeNext } from "../lib/account.ts";

type Mode = "signIn" | "signUp" | "magic";
const MIN_PASSWORD = 8;

export function LoginPage({ lang }: { lang: Lang }) {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));

  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signUp" : "signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!auth.enabled) return <AccountsUnavailable />;
  if (auth.loading) return <Loading />;
  // while an action is running (e.g. saving the profile after sign-up) stay on the page
  if (auth.user && !busy) return <Navigate to={next} replace />;

  const consentNeeded = birthYear !== "" && needsParentalConsent(birthYear);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await action();
    } catch (err) {
      setError(t(`auth.errors.${authErrorCode(err)}`));
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "signIn") return void run(() => auth.signIn(email.trim(), password));

    if (mode === "magic") {
      return void run(async () => {
        await auth.signInWithMagicLink(email.trim(), next);
        setInfo(t("auth.magicLinkSent", { email: email.trim() }));
      });
    }

    if (password.length < MIN_PASSWORD) return setError(t("auth.errors.weak_password"));
    if (birthYear === "") return setError(t("auth.errors.birthYearRequired"));
    if (consentNeeded && !consent) return setError(t("auth.errors.consentRequired"));

    void run(async () => {
      const { hasSession } = await auth.signUp({ email: email.trim(), password, displayName: displayName.trim(), uiLang: lang });
      const update: ProfileUpdate = { birthYear, uiLang: lang, ...(consentNeeded ? { parentalConsent: true } : {}) };
      if (hasSession) {
        await saveSignUpProfile(update);
        navigate(next, { replace: true });
      } else {
        // e-mail confirmation required: the profile is saved on the first sign-in
        savePendingProfile(update);
        setInfo(t("auth.confirmEmail", { email: email.trim() }));
      }
    });
  };

  const submitLabel = mode === "signIn" ? t("auth.submitSignIn") : mode === "signUp" ? t("auth.submitSignUp") : t("auth.magicLinkSend");

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Card className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("auth.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("auth.subtitle")}</p>
        </div>

        <Segmented<"signIn" | "signUp">
          value={mode === "signUp" ? "signUp" : "signIn"}
          onChange={switchMode}
          options={[
            { value: "signIn", label: t("auth.signIn") },
            { value: "signUp", label: t("auth.signUp") },
          ]}
        />

        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "signUp" && (
            <Field id="displayName" label={t("auth.displayName")} hint={t("auth.displayNameHint")}>
              <input
                id="displayName"
                className={INPUT}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={60}
                autoComplete="nickname"
              />
            </Field>
          )}

          <Field id="email" label={t("auth.email")}>
            <input
              id="email"
              type="email"
              className={INPUT}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Field>

          {mode !== "magic" && (
            <Field id="password" label={t("auth.password")} hint={mode === "signUp" ? t("auth.passwordHint") : undefined}>
              <input
                id="password"
                type="password"
                className={INPUT}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signUp" ? MIN_PASSWORD : undefined}
                autoComplete={mode === "signUp" ? "new-password" : "current-password"}
              />
            </Field>
          )}

          {mode === "signUp" && (
            <Field id="birthYear" label={t("auth.birthYear")}>
              <select
                id="birthYear"
                className={INPUT}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : "")}
                required
              >
                <option value="">{t("auth.birthYearPlaceholder")}</option>
                {birthYears().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {mode === "signUp" && consentNeeded && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-200">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
              />
              <span className="text-sm leading-snug text-slate-800">
                {t("auth.consent")}
                <span className="mt-0.5 block text-xs text-slate-600">{t("auth.consentWhy")}</span>
              </span>
            </label>
          )}

          {error && <Notice tone="error">{error}</Notice>}
          {info && <Notice tone="success">{info}</Notice>}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? t("loading") : submitLabel}
          </Button>
        </form>

        {mode !== "signUp" && (
          <div className="text-center">
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 hover:underline"
              onClick={() => switchMode(mode === "magic" ? "signIn" : "magic")}
            >
              {mode === "magic" ? t("auth.backToPassword") : t("auth.magicLink")}
            </button>
          </div>
        )}

        {googleEnabled && (
          <>
            <div className="flex items-center gap-3 text-xs text-slate-400" aria-hidden>
              <span className="h-px flex-1 bg-slate-200" />
              {t("auth.or")}
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <Button variant="secondary" className="w-full" disabled={busy} onClick={() => void run(() => auth.signInWithGoogle(next))}>
              {t("auth.google")}
            </Button>
          </>
        )}
      </Card>

      <p className="text-center text-sm">
        <Link to="/privacy" className="text-slate-500 underline hover:text-indigo-700">
          {t("auth.privacyLink")}
        </Link>
      </p>
    </div>
  );
}
