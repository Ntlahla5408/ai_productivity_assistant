import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResponsibleAINotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground/80",
        className,
      )}
      role="note"
    >
      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-foreground/80" />
      <p>
        AI-generated content may contain inaccuracies. Please verify important information before
        making workplace decisions or sending professional communications.
      </p>
    </div>
  );
}
