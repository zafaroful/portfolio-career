import { NextRequest } from "next/server";
import {
  apiSuccess,
  apiError,
  requireAdmin,
  handleApiError,
} from "@/lib/api";
import { searchAll } from "@/lib/services/portfolio";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const query = request.nextUrl.searchParams.get("q") ?? "";
    const results = await searchAll(session.user.id, query);
    return apiSuccess(results);
  } catch (error) {
    return handleApiError(error);
  }
}
