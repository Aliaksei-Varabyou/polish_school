import type { Profile } from "@portal/core";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Notice } from "./Field.tsx";

/** Shown wherever history matters (dashboard, history list) while a parent's consent is pending. */
export function ConsentBanner({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  if (!profile.consentRequired) return null;

  return (
    <Notice tone="warning">
      {profile.consentPendingFor ? t("auth.consentPending", { email: profile.consentPendingFor }) : t("auth.consentBanner")}{" "}
      <Link to="/profile" className="font-medium underline">
        {t("auth.consentBannerLink")}
      </Link>
    </Notice>
  );
}
