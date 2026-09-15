import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui.tsx";

const SYMBOLS = ["+", "−", "×", "÷", "√", "π", "∑", "%", "x²", "∞"];

export function LoadingScreen() {
  const { t } = useTranslation();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % SYMBOLS.length), 600);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="flex flex-col items-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-4xl font-bold text-indigo-600 ring-4 ring-indigo-100">
        <span key={i} className="animate-pulse">
          {SYMBOLS[i]}
        </span>
      </div>
      <h2 className="text-xl font-semibold text-slate-800">{t("loading.title")}</h2>
      <p className="mt-2 text-sm text-slate-500">{t("loading.hint")}</p>
    </Card>
  );
}
