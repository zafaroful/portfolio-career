import {
  apiSuccess,
  apiError,
  requireAdmin,
  handleApiError,
} from "@/lib/api";
import { getDashboardStats } from "@/lib/services/portfolio";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const stats = await getDashboardStats(session.user.id);
    return apiSuccess(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
