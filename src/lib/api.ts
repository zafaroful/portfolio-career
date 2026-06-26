import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { auth } from "./auth";

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
  if (error instanceof Error && error.message.includes("File")) {
    return apiError(error.message, 400);
  }
  console.error(error);
  return apiError("Internal server error", 500);
}
