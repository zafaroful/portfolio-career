import { createAuditLog } from "@/lib/audit";
import {
  apiError,
  apiSuccess,
  handleApiError,
  requireAdmin,
  validateBody,
} from "@/lib/api";
import { checkAiRateLimit } from "@/lib/ai/rate-limit";
import { assertAiConfigured } from "@/lib/ai/client";
import type { ZodSchema } from "zod";

export async function runAiRoute<TInput, TOutput>({
  request,
  schema,
  feature,
  handler,
}: {
  request: Request;
  schema: ZodSchema<TInput>;
  feature: string;
  handler: (input: TInput, userId: string) => Promise<TOutput>;
}) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    assertAiConfigured();

    const rateLimitResponse = await checkAiRateLimit(session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const rawBody =
      request.headers.get("content-length") === "0"
        ? {}
        : await request.json().catch(() => ({}));
    const body = validateBody(schema, rawBody);
    const result = await handler(body, session.user.id);

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      tableName: "ai",
      recordId: feature,
      metadata: { feature },
    });

    return apiSuccess(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("AI is not configured")) {
      return apiError(error.message, 503);
    }
    return handleApiError(error);
  }
}
