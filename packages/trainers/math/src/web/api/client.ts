import type {
  AnswerRequest,
  AnswerResponse,
  FeedbackRequest,
  FeedbackResponse,
  GenerateRequest,
  GenerateResponse,
  SessionSummary,
} from "@portal/core";

export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

type TokenGetter = () => Promise<string | null>;

let getToken: TokenGetter = async () => null;

/** The portal passes `getAccessToken`; guests get `null` and send no Authorization header. */
export function setTokenGetter(fn: TokenGetter) {
  getToken = fn;
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    const token = await getToken().catch(() => null);
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (token) headers.authorization = `Bearer ${token}`;
    res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body ?? {}) });
  } catch {
    throw new ApiRequestError("NETWORK", "Network error");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = res.status === 429 ? "RATE_LIMIT" : (data.code ?? "generic");
    throw new ApiRequestError(code, data.error ?? res.statusText);
  }
  return data as T;
}

const session = (id: string) => `/api/sessions/${encodeURIComponent(id)}`;

export const api = {
  generate: (req: GenerateRequest) => post<GenerateResponse>("/api/trainers/math/generate", req),
  feedback: (req: FeedbackRequest) => post<FeedbackResponse>("/api/trainers/math/feedback", req),
  answer: (sessionId: string, body: AnswerRequest) => post<AnswerResponse>(`${session(sessionId)}/answers`, body),
  finish: (sessionId: string) => post<SessionSummary>(`${session(sessionId)}/finish`),
};
