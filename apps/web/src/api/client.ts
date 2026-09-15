import type { FeedbackRequest, FeedbackResponse, GenerateRequest, GenerateResponse } from "@portal/core";

export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
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

export const api = {
  generate: (req: GenerateRequest) => post<GenerateResponse>("/api/generate", req),
  feedback: (req: FeedbackRequest) => post<FeedbackResponse>("/api/feedback", req),
};
