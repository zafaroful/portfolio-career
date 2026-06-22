import { Badge } from "@/components/ui/badge";
import { cn, getBadgeVariant } from "@/lib/utils";

type TimelineItem = {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  badge?: string;
};

type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative space-y-0", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
          <div className="flex flex-col items-center">
            <div className="size-2.5 rounded-full bg-primary ring-4 ring-primary/20" />
            {index < items.length - 1 ? (
              <div className="absolute top-3 left-[4.5px] h-full w-px bg-border" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 -mt-0.5 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{item.title}</p>
              {item.badge ? (
                <Badge variant={getBadgeVariant(item.badge)}>{item.badge}</Badge>
              ) : null}
            </div>
            {item.subtitle ? (
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            ) : null}
            {item.date ? (
              <p className="text-caption">{item.date}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
