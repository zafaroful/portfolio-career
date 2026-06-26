import { NextRequest } from "next/server";
import { generateAiObject } from "@/lib/ai/client";
import { buildPortfolioContext } from "@/lib/ai/context";
import { INTERVIEW_QUESTIONS_PROMPT } from "@/lib/ai/prompts";
import { runAiRoute } from "@/lib/ai/route-helpers";
import {
  interviewQuestionsInputSchema,
  interviewQuestionsOutputSchema,
} from "@/lib/validators/ai";

export async function POST(request: NextRequest) {
  return runAiRoute({
    request,
    schema: interviewQuestionsInputSchema,
    feature: "interview-questions",
    handler: async (input, userId) => {
      const context = await buildPortfolioContext(userId);
      if (!context) throw new Error("User not found");

      let entityData: unknown = null;
      switch (input.entityType) {
        case "project":
          entityData = context.projects.find((p) => p.id === input.entityId);
          break;
        case "skill":
          entityData = context.skills.find((s) => s.id === input.entityId);
          break;
        case "certification":
          entityData = context.certifications.find((c) => c.id === input.entityId);
          break;
        case "achievement":
          entityData = context.achievements.find((a) => a.id === input.entityId);
          break;
      }

      if (!entityData) throw new Error("Entity not found");

      const { object } = await generateAiObject({
        feature: "interview-questions",
        schema: interviewQuestionsOutputSchema,
        systemPrompt: INTERVIEW_QUESTIONS_PROMPT,
        prompt: `Entity type: ${input.entityType}

Entity data:
${JSON.stringify(entityData, null, 2)}

Related portfolio context:
${JSON.stringify(
  {
    skills: context.skills.slice(0, 10),
    projects: context.projects.slice(0, 5),
  },
  null,
  2,
)}`,
      });
      return object;
    },
  });
}
