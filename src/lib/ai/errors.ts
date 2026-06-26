import { APICallError } from "@ai-sdk/provider";

type RetryErrorLike = Error & {
  lastError?: unknown;
  errors?: unknown[];
};

function parseOpenAiErrorBody(responseBody?: string): string | null {
  if (!responseBody) return null;
  try {
    const parsed = JSON.parse(responseBody) as {
      error?: { message?: string; code?: string; type?: string };
    };
    return parsed.error?.message ?? null;
  } catch {
    return null;
  }
}

function messageFromApiCallError(error: APICallError): string | null {
  const parsed = parseOpenAiErrorBody(error.responseBody);
  const message = (parsed ?? error.message).toLowerCase();

  if (message.includes("insufficient_quota") || message.includes("exceeded your current quota")) {
    return "OpenAI quota exceeded. Add billing or credits at platform.openai.com/account/billing.";
  }
  if (message.includes("invalid api key") || message.includes("incorrect api key")) {
    return "Invalid OpenAI API key. Check OPENAI_API_KEY in your .env file.";
  }
  if (message.includes("rate limit") || error.statusCode === 429) {
    return "OpenAI rate limit reached. Please try again shortly.";
  }

  return parsed ?? error.message;
}

export function getAiErrorResponse(error: unknown): { message: string; status: number } | null {
  const candidates: unknown[] = [error];
  const retryError = error as RetryErrorLike;
  if (retryError.lastError) candidates.push(retryError.lastError);
  if (Array.isArray(retryError.errors)) candidates.push(...retryError.errors);

  for (const candidate of candidates) {
    if (APICallError.isInstance(candidate)) {
      const message = messageFromApiCallError(candidate);
      if (!message) continue;

      const lower = message.toLowerCase();
      if (lower.includes("quota exceeded") || lower.includes("invalid openai api key")) {
        return { message, status: 503 };
      }
      if (lower.includes("rate limit")) {
        return { message, status: 429 };
      }
      return { message, status: candidate.statusCode ?? 502 };
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("insufficient_quota") || message.includes("exceeded your current quota")) {
      return {
        message:
          "OpenAI quota exceeded. Add billing or credits at platform.openai.com/account/billing.",
        status: 503,
      };
    }
  }

  return null;
}
