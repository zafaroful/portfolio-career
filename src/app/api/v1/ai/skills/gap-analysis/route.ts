import { NextRequest } from "next/server";
import { generateAiObject } from "@/lib/ai/client";
import { buildPortfolioContext } from "@/lib/ai/context";
import { SKILLS_GAP_PROMPT } from "@/lib/ai/prompts";
import { runAiRoute } from "@/lib/ai/route-helpers";
import {
  skillsGapInputSchema,
  skillsGapOutputSchema,
} from "@/lib/validators/ai";

export async function POST(request: NextRequest) {
  return runAiRoute({
    request,
    schema: skillsGapInputSchema,
    feature: "skills-gap",
    handler: async (input, userId) => {
      const context = await buildPortfolioContext(userId);
      if (!context) throw new Error("User not found");

      const { object } = await generateAiObject({
        feature: "skills-gap",
        schema: skillsGapOutputSchema,
        systemPrompt: SKILLS_GAP_PROMPT,
        prompt: `Job posting:
${input.jobPosting}

Target role: ${input.targetRole ?? "Not specified"}

Portfolio data:
${JSON.stringify(context, null, 2)}`,
      });
      return object;
    },
  });
}
