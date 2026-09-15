// Fetch helper for portal pages: JSON, Authorization header for signed-in users, typed errors.
import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "./auth/supabase.ts";

export class ApiError extends Error {
  constructor(
    /** server `code` (UNAUTHORIZED, AUTH_DISABLED, ALREADY_ANSWERED…), or NETWORK / NOT_FOUND / RATE_LIMIT / generic */
    public code: string,
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("content-type")) headers.set("content-type", "application/json");
  let res: Response;
  try {
    const token = await getAccessToken();
    if (token) headers.set("authorization", `Bearer ${token}`);
    res = await fetch(path, { ...init, headers });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("NETWORK", 0, "Network error");
  }
  const data = (await res.json().catch(() => ({}))) as { code?: string; error?: string };
  if (!res.ok) {
    const fallback = res.status === 404 ? "NOT_FOUND" : res.status === 429 ? "RATE_LIMIT" : "generic";
    throw new ApiError(data.code ?? fallback, res.status, data.error ?? res.statusText);
  }
  return data as T;
}

export const apiCode = (err: unknown) => (err instanceof ApiError ? err.code : "generic");

type DataState<T> = { status: "loading" } | { status: "done"; data: T } | { status: "error"; code: string };

/** Loads data once per `key` (e.g. path + user id); `reload` refetches. */
export function useApiData<T>(key: string | null, load: () => Promise<T>) {
  const [state, setState] = useState<DataState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    setState({ status: "loading" });
    load().then(
      (data) => !cancelled && setState({ status: "done", data }),
      (err) => !cancelled && setState({ status: "error", code: apiCode(err) }),
    );
    return () => {
      cancelled = true;
    };
    // `load` is recreated every render; `key` identifies the request
  }, [key, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, reload, setState };
}
