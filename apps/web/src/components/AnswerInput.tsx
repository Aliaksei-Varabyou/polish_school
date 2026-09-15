import type { AnswerType } from "@portal/core";
import { Button } from "@portal/ui";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const KEYS_NUMBER = ["√", "^", "/", "π", "(", ")", ";"];
const KEYS_EXPRESSION = ["x", "^", "/", "√", "(", ")"];

export function AnswerInput({
  type,
  disabled,
  onSubmit,
}: {
  type: AnswerType;
  disabled: boolean;
  onSubmit: (answer: string) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  const insert = (key: string) => {
    const input = ref.current;
    const text = key === "√" ? "√(" : key;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    setValue(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + text.length, start + text.length);
    });
  };

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
          spellCheck={false}
          inputMode="text"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100"
        />
        {!disabled && (
          <Button type="submit" disabled={!value.trim()}>
            {t("trainer.check")}
          </Button>
        )}
      </form>
      {!disabled && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {(type === "expression" ? KEYS_EXPRESSION : KEYS_NUMBER).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => insert(k)}
                className="h-10 min-w-10 rounded-lg bg-slate-100 px-3 font-mono text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
              >
                {k}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {t(type === "expression" ? "trainer.helpExpression" : "trainer.helpNumber")}
          </p>
        </>
      )}
    </div>
  );
}
