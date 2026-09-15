import { GRADES, isLyceum, type Grade, type Lang, type Level, type Profile } from "@portal/core";
import { Button, Card, Label, Segmented } from "@portal/ui";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch, ApiError } from "../api.ts";
import { useAuth } from "../auth/AuthProvider.tsx";
import { Field, INPUT, Notice } from "../components/Field.tsx";
import { LoadError } from "../components/LoadError.tsx";
import { Loading } from "../components/RequireAuth.tsx";
import { birthYears, needsParentalConsent } from "../lib/account.ts";

const SP_GRADES = GRADES.filter((g) => g.startsWith("sp"));
const LO_GRADES = GRADES.filter((g) => g.startsWith("lo"));

export function ProfilePage({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState<Grade | "">("");
  const [level, setLevel] = useState<Level>("P");
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [parentEmail, setParentEmail] = useState("");
  const [consentBusy, setConsentBusy] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [consentSent, setConsentSent] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch<Profile>("/api/me/profile").then(
      (p) => {
        if (cancelled) return;
        setProfile(p);
        setDisplayName(p.displayName ?? "");
        setGrade(p.grade ?? "");
        setLevel(p.level ?? "P");
        setBirthYear(p.birthYear ?? "");
      },
      (err) => !cancelled && setLoadError(err instanceof ApiError ? err.code : "generic"),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (loadError) return <LoadError code={loadError} onRetry={() => (setLoadError(null), setAttempt((n) => n + 1))} />;
  if (!profile) return <Loading />;

  const lyceum = grade !== "" && isLyceum(grade);
  const consentNeeded = birthYear !== "" && needsParentalConsent(birthYear);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await apiFetch<Profile>("/api/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          grade: grade || null,
          level: lyceum ? level : null,
          uiLang: lang,
          birthYear: birthYear === "" ? null : birthYear,
        }),
      });
      setProfile(updated);
      setSaved(true);
    } catch (err) {
      setSaveError(t(`errors.api.${err instanceof ApiError ? err.code : "generic"}`, { defaultValue: t("errors.api.generic") }));
    } finally {
      setSaving(false);
    }
  }

  async function onRequestConsent(e: FormEvent) {
    e.preventDefault();
    setConsentBusy(true);
    setConsentError(null);
    try {
      const res = await apiFetch<{ sentTo: string }>("/api/me/parental-consent", {
        method: "POST",
        body: JSON.stringify({ parentEmail: parentEmail.trim(), lang }),
      });
      setConsentSent(res.sentTo);
      setParentEmail("");
      setAttempt((n) => n + 1);
    } catch (err) {
      setConsentError(t(`profile.consentErrors.${err instanceof ApiError ? err.code : "generic"}`, { defaultValue: t("errors.api.generic") }));
    } finally {
      setConsentBusy(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await apiFetch("/api/me", { method: "DELETE" });
      await signOut();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("profile.title")}</h1>

      {profile.consentRequired && (
        <Card className="space-y-3">
          <h2 className="font-semibold text-amber-800">{t("profile.consentTitle")}</h2>
          <p className="text-sm text-slate-600">{t("profile.consentText")}</p>
          {profile.consentPendingFor && <Notice tone="warning">{t("auth.consentPending", { email: profile.consentPendingFor })}</Notice>}
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onRequestConsent}>
            <input
              type="email"
              required
              placeholder={t("profile.parentEmailPlaceholder")}
              className={`${INPUT} flex-1`}
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
            />
            <Button type="submit" disabled={consentBusy} className="whitespace-nowrap">
              {consentBusy ? t("loading") : t("profile.sendConsentRequest")}
            </Button>
          </form>
          {consentError && <Notice tone="error">{consentError}</Notice>}
          {consentSent && <Notice tone="success">{t("profile.consentRequestSent", { email: consentSent })}</Notice>}
        </Card>
      )}

      <Card>
        <form className="space-y-5" onSubmit={onSave}>
          <Field id="email" label={t("auth.email")}>
            <input id="email" className={INPUT} value={user?.email ?? ""} disabled readOnly />
          </Field>

          <Field id="displayName" label={t("auth.displayName")}>
            <input
              id="displayName"
              className={INPUT}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              required
            />
          </Field>

          <div>
            <Label>{t("start.school")}</Label>
            <Segmented
              value={lyceum ? "lo" : "sp"}
              onChange={(v) => setGrade(v === "lo" ? "lo1" : "sp5")}
              options={[
                { value: "sp", label: t("start.sp") },
                { value: "lo", label: t("start.lo") },
              ]}
            />
          </div>
          <div>
            <Label>{t("start.grade")}</Label>
            <Segmented value={grade || (lyceum ? "lo1" : "sp5")} onChange={setGrade} options={(lyceum ? LO_GRADES : SP_GRADES).map((g) => ({ value: g, label: t("start.gradeN", { n: g.slice(2) }) }))} />
          </div>
          {lyceum && (
            <div>
              <Label>{t("start.level")}</Label>
              <Segmented<Level>
                value={level}
                onChange={setLevel}
                options={[
                  { value: "P", label: t("start.levelP") },
                  { value: "R", label: t("start.levelR") },
                ]}
              />
            </div>
          )}

          <div>
            <Label>{t("start.language")}</Label>
            <Segmented value={lang} onChange={setLang} options={["ru", "en", "pl"].map((l) => ({ value: l as Lang, label: l.toUpperCase() }))} />
          </div>

          <Field id="birthYear" label={t("auth.birthYear")}>
            <select id="birthYear" className={INPUT} value={birthYear} onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : "")}>
              <option value="">{t("auth.birthYearPlaceholder")}</option>
              {birthYears().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>

          {saveError && <Notice tone="error">{saveError}</Notice>}
          {saved && <Notice tone="success">{t("profile.saved")}</Notice>}

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? t("loading") : t("profile.save")}
          </Button>
        </form>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold text-slate-800">{t("profile.dataTitle")}</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              apiFetch<unknown>("/api/me/export").then((data) => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "matema-data.json";
                a.click();
                URL.revokeObjectURL(url);
              })
            }
          >
            {t("profile.exportData")}
          </Button>
          <Button variant="secondary" onClick={() => void signOut()}>
            {t("nav.signOut")}
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold text-rose-700">{t("profile.deleteTitle")}</h2>
        <p className="text-sm text-slate-600">{t("profile.deleteText")}</p>
        {!deleteConfirm ? (
          <Button variant="secondary" className="text-rose-700 ring-rose-300 hover:bg-rose-50" onClick={() => setDeleteConfirm(true)}>
            {t("profile.deleteButton")}
          </Button>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button className="bg-rose-600 hover:bg-rose-700" disabled={deleting} onClick={() => void onDelete()}>
              {deleting ? t("loading") : t("profile.deleteConfirm")}
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
              {t("profile.deleteCancel")}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
