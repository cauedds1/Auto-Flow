import { CheckCircle2, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "checked" | "attention" | "pending";

interface ChecklistItemStatusProps {
  status: Status;
  className?: string;
  size?: number;
}

export function ChecklistItemStatus({ status, className, size = 18 }: ChecklistItemStatusProps) {
  if (status === "checked") {
    return (
      <CheckCircle2
        className={cn("text-green-500", className)}
        size={size}
      />
    );
  }
  
  if (status === "attention") {
    return (
      <AlertTriangle
        className={cn("text-yellow-500", className)}
        size={size}
      />
    );
  }
  
  return (
    <Circle
      className={cn("text-red-500", className)}
      size={size}
    />
  );
}
