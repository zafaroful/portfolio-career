import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("shadow-elevation-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {trend ? (
          <p
            className={cn(
              "mt-1 text-xs",
              trend.positive ? "text-success" : "text-muted-foreground",
            )}
          >
            {trend.value}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
