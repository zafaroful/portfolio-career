import { NextRequest } from "next/server";
import { generateAiObject } from "@/lib/ai/client";
import { PROJECT_DESCRIPTION_PROMPT } from "@/lib/ai/prompts";
import { runAiRoute } from "@/lib/ai/route-helpers";
import {
  projectDescriptionInputSchema,
  projectDescriptionOutputSchema,
} from "@/lib/validators/ai";

export async function POST(request: NextRequest) {
  return runAiRoute({
    request,
    schema: projectDescriptionInputSchema,
    feature: "project-description",
    handler: async (input) => {
      const { object } = await generateAiObject({
        feature: "project-description",
        schema: projectDescriptionOutputSchema,
        systemPrompt: PROJECT_DESCRIPTION_PROMPT,
        prompt: `Project title: ${input.title}
Role: ${input.role ?? "Not specified"}
Tech stack: ${input.techStack?.join(", ") ?? "Not specified"}
Tone: ${input.tone}

Rough notes:
${input.roughNotes}`,
      });
      return object;
    },
  });
}
