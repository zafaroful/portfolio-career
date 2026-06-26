import { NextRequest } from "next/server";
import { generateAiObject } from "@/lib/ai/client";
import { buildPortfolioContext } from "@/lib/ai/context";
import { RESUME_TAILOR_PROMPT } from "@/lib/ai/prompts";
import { runAiRoute } from "@/lib/ai/route-helpers";
import {
  resumeTailorInputSchema,
  resumeTailorOutputSchema,
} from "@/lib/validators/ai";

export async function POST(request: NextRequest) {
  return runAiRoute({
    request,
    schema: resumeTailorInputSchema,
    feature: "resume-tailor",
    handler: async (input, userId) => {
      const context = await buildPortfolioContext(userId);
      if (!context) throw new Error("User not found");

      const { object } = await generateAiObject({
        feature: "resume-tailor",
        schema: resumeTailorOutputSchema,
        systemPrompt: RESUME_TAILOR_PROMPT,
        prompt: `Job description:
${input.jobDescription}

Target role: ${input.targetRole ?? "Not specified"}
Template: ${input.templateId}

Portfolio data:
${JSON.stringify(context, null, 2)}`,
      });
      return object;
    },
  });
}
