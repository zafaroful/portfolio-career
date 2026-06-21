import { NextRequest } from "next/server";
import {
  apiSuccess,
  apiError,
  handleApiError,
} from "@/lib/api";
import { getPortfolioData } from "@/lib/services/portfolio";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const portfolio = await getPortfolioData(slug);
    if (!portfolio) return apiError("Portfolio not found", 404);

    const { passwordHash: _passwordHash, ...publicUser } = portfolio;
    void _passwordHash;
    return apiSuccess(publicUser);
  } catch (error) {
    return handleApiError(error);
  }
}
