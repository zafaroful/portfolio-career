import { Badge } from "@/components/ui/badge";
import { cn, getBadgeVariant, getProficiencyLevel } from "@/lib/utils";

type SkillBadgeProps = {
  name?: string;
  proficiency: string;
  showLevel?: boolean;
  className?: string;
};

const proficiencyLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export function SkillBadge({
  name,
  proficiency,
  showLevel = false,
  className,
}: SkillBadgeProps) {
  const level = getProficiencyLevel(proficiency);
  const label = proficiencyLabels[proficiency.toUpperCase()] ?? proficiency;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {name ? <span className="text-sm font-medium">{name}</span> : null}
      <Badge variant={getBadgeVariant(proficiency)}>{label}</Badge>
      {showLevel && level > 0 ? (
        <div className="flex gap-0.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-1.5 rounded-full",
                i < level ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
