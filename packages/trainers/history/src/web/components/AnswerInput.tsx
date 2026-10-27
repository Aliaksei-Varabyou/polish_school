import type { AnswerType } from "@portal/core";
import { Button } from "@portal/ui";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Plain text field — no maths keypad, no KaTeX. Browser autocorrect is switched off on purpose:
 * on a phone it happily rewrites "oskrzeliki" or "нефрон" into something else mid-answer.
 */
export function AnswerInput({
  type,
  disabled,
  onSubmit,
}: {
  type: AnswerType;
  disabled: boolean;
  onSubmit: (answer: string) => void;
}) {
  const { t } = useTranslation("history");
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  const submit = () => {
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <div>
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          ref={ref}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("trainer.placeholder")}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode={type === "number" ? "decimal" : "text"}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100"
        />
        {!disabled && (
          <Button type="submit" disabled={!value.trim()}>
            {t("trainer.check")}
          </Button>
        )}
      </form>
      {!disabled && (
        <p className="mt-2 text-xs text-slate-500">{t(type === "number" ? "trainer.helpNumber" : "trainer.helpTerm")}</p>
      )}
    </div>
  );
}
