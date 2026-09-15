import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth, userLabel } from "../auth/AuthProvider.tsx";

const ITEM = "block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none";

/** Header account area: "Sign in" link, or a compact menu (progress, history, profile, sign out). */
export function AccountMenu() {
  const { t } = useTranslation();
  const { enabled, loading, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // close on navigation, outside click and Escape
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current?.contains(e.target as Node) || setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!enabled || loading) return null;

  if (!user) {
    if (location.pathname === "/login") return null;
    const next = encodeURIComponent(location.pathname + location.search);
    return (
      <Link
        to={location.pathname === "/" ? "/login" : `/login?next=${next}`}
        className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50"
      >
        {t("nav.signIn")}
      </Link>
    );
  }

  const label = userLabel(user);
  const items = [
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/history", label: t("nav.history") },
    { to: "/profile", label: t("nav.profile") },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("nav.account")}
        onClick={() => setOpen((o) => !o)}
        className="flex max-w-[11rem] items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white" aria-hidden>
          {label.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden truncate sm:inline">{label}</span>
        <span aria-hidden className="text-xs text-slate-400">
          ▾
        </span>
      </button>
      {open && (
        <div id={menuId} className="absolute right-0 z-20 mt-2 w-56 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200">
          <div className="truncate px-3 pt-1.5 pb-2 text-xs text-slate-500">{user.email}</div>
          <nav className="grid">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${ITEM} ${isActive ? "font-semibold text-indigo-700" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            className={ITEM}
            onClick={() => {
              setOpen(false);
              void signOut().then(() => navigate("/"));
            }}
          >
            {t("nav.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
