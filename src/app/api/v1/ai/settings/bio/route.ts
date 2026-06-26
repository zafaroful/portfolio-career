import { NextRequest } from "next/server";
import { generateAiObject } from "@/lib/ai/client";
import { buildPortfolioContext } from "@/lib/ai/context";
import { BIO_GENERATOR_PROMPT } from "@/lib/ai/prompts";
import { runAiRoute } from "@/lib/ai/route-helpers";
import {
  bioGeneratorInputSchema,
  bioGeneratorOutputSchema,
} from "@/lib/validators/ai";

export async function POST(request: NextRequest) {
  return runAiRoute({
    request,
    schema: bioGeneratorInputSchema,
    feature: "bio-generator",
    handler: async (input, userId) => {
      const context = await buildPortfolioContext(userId);
      if (!context) throw new Error("User not found");

      const { object } = await generateAiObject({
        feature: "bio-generator",
        schema: bioGeneratorOutputSchema,
        systemPrompt: BIO_GENERATOR_PROMPT,
        prompt: `Tone: ${input.tone}
Max length: ${input.maxLength} characters

Portfolio data:
${JSON.stringify(context, null, 2)}`,
      });
      return object;
    },
  });
}
