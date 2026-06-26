import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { auth } from "./auth";
import { getAiErrorResponse } from "./ai/errors";

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, meta });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: true, message }, { status });
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session) return null;
  if (session.user.role !== "ADMIN") return null;
  return session;
}

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  return schema.parse(body);
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError(error.issues.map((e) => e.message).join(", "), 400);
  }
  if (error instanceof Error && error.message.includes("File storage is not configured")) {
    return apiError(error.message, 503);
  }
  if (error instanceof Error && error.message.includes("AI is not configured")) {
    return apiError(error.message, 503);
  }
  const aiError = getAiErrorResponse(error);
  if (aiError) {
    return apiError(aiError.message, aiError.status);
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("invalid x-api-key") ||
      message.includes("authentication") ||
      message.includes("incorrect api key") ||
      message.includes("invalid api key")
    ) {
      return apiError(
        "Invalid OpenAI API key. Check OPENAI_API_KEY in your .env file.",
        503,
      );
    }
    if (message.includes("rate limit") || message.includes("overloaded")) {
      return apiError("AI service is temporarily busy. Please try again shortly.", 429);
    }
    if (error.message.includes("Entity not found")) {
      return apiError(error.message, 404);
    }
    if (error.message.includes("User not found")) {
      return apiError(error.message, 404);
    }
  }
  if (error instanceof Error && error.message.includes("File")) {
    return apiError(error.message, 400);
  }
  console.error(error);
  return apiError("Internal server error", 500);
}
