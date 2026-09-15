import type { Lang, Profile, ProfileUpdate } from "@portal/core";
import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, apiFetch } from "../api.ts";
import { AuthActionError } from "./errors.ts";
import { authEnabled, getAccessToken, getSupabase } from "./supabase.ts";

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
  uiLang: Lang;
}

export interface AuthContextValue {
  /** accounts are configured (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) */
  enabled: boolean;
  user: User | null;
  session: Session | null;
  /** true until the stored session has been restored */
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  /** `hasSession: false` when the project requires e-mail confirmation first */
  signUp(input: SignUpInput): Promise<{ hasSession: boolean }>;
  /** existing accounts only; `next` is the path to return to */
  signInWithMagicLink(email: string, next?: string): Promise<void>;
  signInWithGoogle(next?: string): Promise<void>;
  signOut(): Promise<void>;
  getAccessToken(): Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function client() {
  const supabase = await getSupabase();
  if (!supabase) throw new AuthActionError("disabled");
  return supabase;
}

const redirectTo = (next = "/dashboard") => `${window.location.origin}${next}`;

// Profile fields chosen at sign-up (birth year, consent) are saved via the API once a session exists.
const PENDING_KEY = "portal-pending-profile";

export function savePendingProfile(update: ProfileUpdate) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(update));
  } catch {
    // storage unavailable
  }
}

/** PATCH the profile; on a transient failure keep it for the next sign-in. */
export async function saveSignUpProfile(update: ProfileUpdate): Promise<void> {
  try {
    await apiFetch<Profile>("/api/me/profile", { method: "PATCH", body: JSON.stringify(update) });
    localStorage.removeItem(PENDING_KEY);
  } catch (err) {
    const transient = !(err instanceof ApiError) || err.code === "NETWORK" || err.status === 401 || err.status >= 500;
    if (transient) savePendingProfile(update);
    else localStorage.removeItem(PENDING_KEY);
    console.warn("[auth] saving the profile failed", err);
  }
}

async function applyPendingProfile() {
  let update: ProfileUpdate | null = null;
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    update = raw ? (JSON.parse(raw) as ProfileUpdate) : null;
  } catch {
    return;
  }
  if (update) await saveSignUpProfile(update);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(authEnabled);

  useEffect(() => {
    if (!authEnabled) return;
    let unsubscribe = () => {};
    let cancelled = false;
    void getSupabase().then(async (supabase) => {
      if (!supabase || cancelled) return;
      const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
      unsubscribe = () => data.subscription.unsubscribe();
      const { data: current } = await supabase.auth.getSession();
      if (!cancelled) {
        setSession(current.session);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (userId) void applyPendingProfile();
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await (await client()).auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async ({ email, password, displayName, uiLang }: SignUpInput) => {
    const { data, error } = await (await client()).auth.signUp({
      email,
      password,
      // the DB trigger creates the profile from this metadata
      options: { data: { display_name: displayName, ui_lang: uiLang }, emailRedirectTo: redirectTo() },
    });
    if (error) throw error;
    // with e-mail confirmation on, an existing address comes back as a user without identities
    if (!data.session && data.user && data.user.identities?.length === 0) throw new AuthActionError("user_already_exists");
    return { hasSession: Boolean(data.session) };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string, next?: string) => {
    const { error } = await (await client()).auth.signInWithOtp({
      email,
      // accounts are created only through sign-up, which asks for birth year and consent
      options: { shouldCreateUser: false, emailRedirectTo: redirectTo(next) },
    });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async (next?: string) => {
    const { error } = await (await client()).auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo(next) } });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = await getSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    // the local session is cleared even when the server call fails
    if (error) console.warn("[auth] sign-out failed", error);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      enabled: authEnabled,
      user: session?.user ?? null,
      session,
      loading,
      signIn,
      signUp,
      signInWithMagicLink,
      signInWithGoogle,
      signOut,
      getAccessToken,
    }),
    [session, loading, signIn, signUp, signInWithMagicLink, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Display name for the header: profile metadata, else the e-mail's local part. */
export function userLabel(user: User): string {
  const name = user.user_metadata?.display_name;
  return typeof name === "string" && name.trim() ? name.trim() : (user.email?.split("@")[0] ?? "");
}
