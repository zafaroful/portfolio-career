import { z } from "zod";

export const aiToneSchema = z.enum(["professional", "technical", "leadership"]);

export const projectDescriptionInputSchema = z.object({
  title: z.string().min(1).max(200),
  role: z.string().max(200).optional(),
  techStack: z.array(z.string()).optional(),
  roughNotes: z.string().min(1).max(2000),
  tone: aiToneSchema.default("professional"),
});

export const projectDescriptionOutputSchema = z.object({
  description: z.string(),
  suggestedMetrics: z.array(z.string()).optional(),
});

export const resumeTailorInputSchema = z.object({
  jobDescription: z.string().min(10).max(8000),
  targetRole: z.string().max(200).optional(),
  templateId: z.enum(["modern", "classic", "minimal"]).default("modern"),
});

export const resumeTailorOutputSchema = z.object({
  highlightedProjectIds: z.array(z.string()),
  highlightedSkillIds: z.array(z.string()),
  rewrittenProjectBullets: z.array(
    z.object({
      projectId: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  summaryLine: z.string(),
  suggestedVersionName: z.string(),
});

export const tailoringHintsSchema = z.object({
  highlightedProjectIds: z.array(z.string()).default([]),
  highlightedSkillIds: z.array(z.string()).default([]),
  rewrittenProjectBullets: z
    .array(
      z.object({
        projectId: z.string(),
        bullets: z.array(z.string()),
      }),
    )
    .default([]),
  summaryLine: z.string().optional(),
});

export const resumeGenerateWithTailoringSchema = z.object({
  versionName: z.string().min(1).max(100),
  templateId: z.enum(["modern", "classic", "minimal"]),
  jobDescription: z.string().max(8000).optional(),
  tailoringHints: tailoringHintsSchema.optional(),
});

export const skillsGapInputSchema = z.object({
  jobPosting: z.string().min(10).max(8000),
  targetRole: z.string().max(200).optional(),
});

export const skillsGapOutputSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(
    z.object({
      skill: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      suggestion: z.string(),
    }),
  ),
  relevantProjects: z.array(
    z.object({
      projectId: z.string(),
      reason: z.string(),
    }),
  ),
  certSuggestions: z.array(z.string()),
});

export const portfolioCoachOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  categories: z.array(
    z.object({
      name: z.string(),
      score: z.number().min(0).max(100),
      status: z.enum(["good", "needs_work", "missing"]),
      feedback: z.string(),
      actionUrl: z.string(),
    }),
  ),
  topActions: z.array(
    z.object({
      priority: z.number(),
      message: z.string(),
      href: z.string(),
    }),
  ),
});

export const smartSearchInputSchema = z.object({
  query: z.string().min(2).max(500),
});

export const smartSearchFiltersSchema = z.object({
  entityTypes: z
    .array(z.enum(["skills", "certifications", "achievements", "projects"]))
    .optional(),
  dateRange: z
    .object({
      field: z.enum(["startDate", "endDate", "issueDate", "expiryDate", "date"]),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  keywords: z.array(z.string()).optional(),
  status: z.string().optional(),
  expiringWithinDays: z.number().optional(),
});

export type SmartSearchFilters = z.infer<typeof smartSearchFiltersSchema>;

export const smartSearchParseOutputSchema = z.object({
  interpretation: z.string(),
  filters: smartSearchFiltersSchema,
});

export const achievementStoryInputSchema = z.object({
  title: z.string().min(1).max(200),
  roughNotes: z.string().min(1).max(2000),
  category: z.string().max(100).optional(),
});

export const achievementStoryOutputSchema = z.object({
  description: z.string(),
  starFormat: z.object({
    situation: z.string(),
    task: z.string(),
    action: z.string(),
    result: z.string(),
  }),
});

export const bioGeneratorInputSchema = z.object({
  tone: aiToneSchema.default("professional"),
  maxLength: z.number().min(50).max(500).default(300),
});

export const bioGeneratorOutputSchema = z.object({
  bio: z.string(),
});

export const seoOptimizerOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
});

export const certRelevanceOutputSchema = z.object({
  scores: z.array(
    z.object({
      certificationId: z.string(),
      score: z.number().min(0).max(100),
      relevance: z.enum(["high", "medium", "low", "outdated"]),
      feedback: z.string(),
    }),
  ),
});

export const interviewQuestionsInputSchema = z.object({
  entityType: z.enum(["project", "skill", "certification", "achievement"]),
  entityId: z.string(),
});

export const interviewQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      tip: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
    }),
  ),
});
