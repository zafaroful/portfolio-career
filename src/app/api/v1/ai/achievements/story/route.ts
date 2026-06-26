import { NextRequest } from "next/server";
import { generateAiObject } from "@/lib/ai/client";
import { ACHIEVEMENT_STORY_PROMPT } from "@/lib/ai/prompts";
import { runAiRoute } from "@/lib/ai/route-helpers";
import {
  achievementStoryInputSchema,
  achievementStoryOutputSchema,
} from "@/lib/validators/ai";

export async function POST(request: NextRequest) {
  return runAiRoute({
    request,
    schema: achievementStoryInputSchema,
    feature: "achievement-story",
    handler: async (input) => {
      const { object } = await generateAiObject({
        feature: "achievement-story",
        schema: achievementStoryOutputSchema,
        systemPrompt: ACHIEVEMENT_STORY_PROMPT,
        prompt: `Achievement title: ${input.title}
Category: ${input.category ?? "Not specified"}

Rough notes:
${input.roughNotes}`,
      });
      return object;
    },
  });
}
