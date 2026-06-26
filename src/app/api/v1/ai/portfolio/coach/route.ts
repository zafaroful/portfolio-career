import { NextRequest } from "next/server";
import { generateAiObject } from "@/lib/ai/client";
import { buildPortfolioContext, computePortfolioStats } from "@/lib/ai/context";
import { PORTFOLIO_COACH_PROMPT } from "@/lib/ai/prompts";
import { runAiRoute } from "@/lib/ai/route-helpers";
import { portfolioCoachOutputSchema } from "@/lib/validators/ai";
import { z } from "zod";

export async function POST(request: NextRequest) {
  return runAiRoute({
    request,
    schema: z.object({}),
    feature: "portfolio-coach",
    handler: async (_input, userId) => {
      const context = await buildPortfolioContext(userId);
      if (!context) throw new Error("User not found");

      const stats = computePortfolioStats(context);

      const { object } = await generateAiObject({
        feature: "portfolio-coach",
        schema: portfolioCoachOutputSchema,
        systemPrompt: PORTFOLIO_COACH_PROMPT,
        prompt: `Portfolio stats:
${JSON.stringify(stats, null, 2)}

Portfolio data:
${JSON.stringify(context, null, 2)}`,
      });
      return object;
    },
  });
}
