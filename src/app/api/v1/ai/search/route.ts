import { NextRequest } from "next/server";
import { generateAiObject } from "@/lib/ai/client";
import { SMART_SEARCH_PROMPT } from "@/lib/ai/prompts";
import { runAiRoute } from "@/lib/ai/route-helpers";
import { smartSearch } from "@/lib/services/portfolio";
import {
  smartSearchInputSchema,
  smartSearchParseOutputSchema,
} from "@/lib/validators/ai";

export async function POST(request: NextRequest) {
  return runAiRoute({
    request,
    schema: smartSearchInputSchema,
    feature: "smart-search",
    handler: async (input, userId) => {
      const { object: parsed } = await generateAiObject({
        feature: "smart-search",
        schema: smartSearchParseOutputSchema,
        systemPrompt: SMART_SEARCH_PROMPT,
        prompt: `Today's date: ${new Date().toISOString().split("T")[0]}

Search query: ${input.query}`,
      });

      const results = await smartSearch(userId, parsed.filters, input.query);
      return {
        interpretation: parsed.interpretation,
        filters: parsed.filters,
        ...results,
      };
    },
  });
}
