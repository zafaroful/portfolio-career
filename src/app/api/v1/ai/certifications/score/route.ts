import { NextRequest } from "next/server";
import { generateAiObject } from "@/lib/ai/client";
import { buildPortfolioContext } from "@/lib/ai/context";
import { CERT_RELEVANCE_PROMPT } from "@/lib/ai/prompts";
import { runAiRoute } from "@/lib/ai/route-helpers";
import { certRelevanceOutputSchema } from "@/lib/validators/ai";
import { z } from "zod";

export async function POST(request: NextRequest) {
  return runAiRoute({
    request,
    schema: z.object({}),
    feature: "cert-relevance",
    handler: async (_input, userId) => {
      const context = await buildPortfolioContext(userId);
      if (!context) throw new Error("User not found");

      const { object } = await generateAiObject({
        feature: "cert-relevance",
        schema: certRelevanceOutputSchema,
        systemPrompt: CERT_RELEVANCE_PROMPT,
        prompt: `Skills:
${JSON.stringify(context.skills, null, 2)}

Certifications:
${JSON.stringify(context.certifications, null, 2)}`,
      });
      return object;
    },
  });
}
