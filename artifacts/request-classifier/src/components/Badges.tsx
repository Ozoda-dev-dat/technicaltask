import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Inbox, XCircle, AlertTriangle, AlertCircle, Info, Hash } from "lucide-react";

export const departmentVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      department: {
        hr: "bg-dept-hr/10 text-dept-hr",
        it: "bg-dept-it/10 text-dept-it",
        finance: "bg-dept-finance/10 text-dept-finance",
        legal: "bg-dept-legal/10 text-dept-legal",
        complaints: "bg-dept-complaints/10 text-dept-complaints",
        general: "bg-dept-general/10 text-dept-general",
      },
    },
    defaultVariants: {
      department: "general",
    },
  }
);

export function DepartmentBadge({ department, label, className }: { department: string; label?: string; className?: string }) {
  const variant = department as VariantProps<typeof departmentVariants>["department"];
  return (
    <span className={cn(departmentVariants({ department: variant }), className)}>
      <Hash size={12} />
      {label || department}
    </span>
  );
}

export const statusVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap border",
  {
    variants: {
      status: {
        new: "bg-status-new/10 text-status-new border-status-new/20",
        in_progress: "bg-status-progress/10 text-status-progress border-status-progress/20",
        resolved: "bg-status-resolved/10 text-status-resolved border-status-resolved/20",
        closed: "bg-status-closed/10 text-status-closed border-status-closed/20",
      },
    },
    defaultVariants: {
      status: "new",
    },
  }
);

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = status as VariantProps<typeof statusVariants>["status"];
  
  const labels: Record<string, string> = {
    new: "Yangi",
    in_progress: "Jarayonda",
    resolved: "Hal etilgan",
    closed: "Yopilgan",
  };

  const icons = {
    new: Inbox,
    in_progress: Clock,
    resolved: CheckCircle2,
    closed: XCircle,
  };

  const Icon = icons[status as keyof typeof icons] || Inbox;

  return (
    <span className={cn(statusVariants({ status: variant }), className)}>
      <Icon size={12} />
      {labels[status] || status}
    </span>
  );
}

export const priorityVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      priority: {
        high: "bg-priority-high/15 text-priority-high",
        medium: "bg-priority-medium/15 text-priority-medium",
        low: "bg-priority-low/15 text-priority-low",
      },
    },
    defaultVariants: {
      priority: "low",
    },
  }
);

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const variant = priority as VariantProps<typeof priorityVariants>["priority"];
  
  const labels: Record<string, string> = {
    high: "Yuqori",
    medium: "O'rta",
    low: "Past",
  };

  const icons = {
    high: AlertCircle,
    medium: AlertTriangle,
    low: Info,
  };

  const Icon = icons[priority as keyof typeof icons] || Info;

  return (
    <span className={cn(priorityVariants({ priority: variant }), className)}>
      <Icon size={12} />
      {labels[priority] || priority}
    </span>
  );
}

export function ConfidenceMeter({ score, className }: { score: number; className?: string }) {
  const percentage = Math.round(score * 100);
  
  let colorClass = "bg-status-resolved"; // green
  if (percentage < 60) colorClass = "bg-status-new"; // red/blue... wait, prompt says <60% red, 60-80% yellow, >80% green
  // Let's use destructive for red, progress for yellow, resolved for green
  if (percentage < 60) colorClass = "bg-destructive";
  else if (percentage < 80) colorClass = "bg-status-progress";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden flex-shrink-0">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", colorClass)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums text-muted-foreground">{percentage}%</span>
    </div>
  );
}
