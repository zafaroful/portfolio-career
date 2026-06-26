import { NextRequest } from "next/server";
import { generateAiObject } from "@/lib/ai/client";
import { buildPortfolioContext } from "@/lib/ai/context";
import { SEO_OPTIMIZER_PROMPT } from "@/lib/ai/prompts";
import { runAiRoute } from "@/lib/ai/route-helpers";
import { seoOptimizerOutputSchema } from "@/lib/validators/ai";
import { z } from "zod";

export async function POST(request: NextRequest) {
  return runAiRoute({
    request,
    schema: z.object({}),
    feature: "seo-optimizer",
    handler: async (_input, userId) => {
      const context = await buildPortfolioContext(userId);
      if (!context) throw new Error("User not found");

      const { object } = await generateAiObject({
        feature: "seo-optimizer",
        schema: seoOptimizerOutputSchema,
        systemPrompt: SEO_OPTIMIZER_PROMPT,
        prompt: `Portfolio data:
${JSON.stringify(context, null, 2)}`,
      });
      return object;
    },
  });
}
