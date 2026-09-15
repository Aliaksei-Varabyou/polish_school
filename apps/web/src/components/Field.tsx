import type { ReactNode } from "react";

export const INPUT =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100 disabled:text-slate-500";

export function Field({ id, label, hint, children }: { id: string; label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-600">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const TONES = {
  error: "bg-rose-50 text-rose-700 ring-rose-200",
  warning: "bg-amber-50 text-amber-900 ring-amber-200",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
} as const;

export function Notice({ tone, children, className = "" }: { tone: keyof typeof TONES; children: ReactNode; className?: string }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ring-1 ${TONES[tone]} ${className}`}>
      {children}
    </div>
  );
}
