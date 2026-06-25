export type OnboardingStepId =
  | "skill"
  | "certification"
  | "project"
  | "resume"
  | "portfolio";

export type OnboardingStep = {
  id: OnboardingStepId;
  label: string;
  description: string;
  href: string;
  completed: boolean;
};

export type OnboardingState = {
  steps: OnboardingStep[];
  completedCount: number;
  totalSteps: number;
  progressPercent: number;
  onboardingCompleted: boolean;
  onboardingStep: number;
  portfolioSlug: string | null;
};

type OnboardingInput = {
  counts: {
    skills: number;
    certifications: number;
    achievements: number;
    projects: number;
    resumes: number;
  };
  isPublic: boolean;
  portfolioSlug: string | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
};

export function computeOnboardingState(input: OnboardingInput): OnboardingState {
  const stepCompletion: Record<OnboardingStepId, boolean> = {
    skill: input.counts.skills >= 1,
    certification: input.counts.certifications >= 1,
    project: input.counts.projects >= 1,
    resume: input.counts.resumes >= 1,
    portfolio: input.isPublic,
  };

  const steps: OnboardingStep[] = [
    {
      id: "skill",
      label: "Add a skill",
      description: "Showcase your technical and professional abilities.",
      href: "/skills",
      completed: stepCompletion.skill,
    },
    {
      id: "certification",
      label: "Add a certification",
      description: "Document credentials and professional certifications.",
      href: "/certifications",
      completed: stepCompletion.certification,
    },
    {
      id: "project",
      label: "Add a project",
      description: "Highlight work you've built or contributed to.",
      href: "/projects",
      completed: stepCompletion.project,
    },
    {
      id: "resume",
      label: "Generate or upload a resume",
      description: "Create a PDF from your portfolio or upload an existing file.",
      href: "/resumes",
      completed: stepCompletion.resume,
    },
    {
      id: "portfolio",
      label: "Publish your portfolio",
      description: "Make your portfolio public so others can view it.",
      href: "/settings",
      completed: stepCompletion.portfolio,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const allComplete = completedCount === totalSteps;

  return {
    steps,
    completedCount,
    totalSteps,
    progressPercent: Math.round((completedCount / totalSteps) * 100),
    onboardingCompleted: input.onboardingCompleted || allComplete,
    onboardingStep: completedCount,
    portfolioSlug: input.portfolioSlug,
  };
}

export function formatActivityDescription(
  action: string,
  tableName: string,
  recordName?: string | null,
): string {
  const entityLabels: Record<string, string> = {
    skills: "skill",
    certifications: "certification",
    achievements: "achievement",
    projects: "project",
    resumes: "resume",
  };

  const entity = entityLabels[tableName] ?? tableName.replace(/s$/, "");
  const name = recordName ? `: ${recordName}` : "";

  switch (action) {
    case "CREATE":
      return `Added ${entity}${name}`;
    case "UPDATE":
      return `Updated ${entity}${name}`;
    case "DELETE":
      return `Deleted ${entity}${name}`;
    default:
      return `${action} ${entity}${name}`;
  }
}
