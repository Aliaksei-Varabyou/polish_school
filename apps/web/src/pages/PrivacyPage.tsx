import { Card } from "@portal/ui";
import { useTranslation } from "react-i18next";

interface Section {
  title: string;
  text: string;
}

/** DRAFT privacy notice — to be replaced by the real policy. */
export function PrivacyPage() {
  const { t } = useTranslation();
  const sections = t("privacy.sections", { returnObjects: true }) as Section[];

  return (
    <Card className="space-y-5">
      <div>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-amber-800 uppercase">
          {t("privacy.draft")}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{t("privacy.title")}</h1>
        <p className="mt-2 text-slate-600">{t("privacy.intro")}</p>
      </div>
      {Array.isArray(sections) &&
        sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-semibold text-slate-800">{s.title}</h2>
            <p className="mt-1 leading-relaxed text-slate-700">{s.text}</p>
          </section>
        ))}
    </Card>
  );
}
