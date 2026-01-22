import { cn } from "@/lib/utils";

type StatusType = 
  | "NOT_PAID" | "DOWN_PAYMENT" | "PAID"
  | "NOT_READY" | "PACKING" | "PACKED"
  | "TO_BUY" | "ORDERED" | "ARRIVED";

interface StatusBadgeProps {
  status: StatusType | string;
  type?: "payment" | "packing" | "procurement";
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  let styles = "bg-gray-100 text-gray-700 border-gray-200";
  let label = status.replace(/_/g, " ");

  // Logic to determine color based on status
  // PAYMENT
  if (status === "PAID") styles = "bg-green-100 text-green-700 border-green-200";
  else if (status === "DOWN_PAYMENT") styles = "bg-amber-100 text-amber-700 border-amber-200";
  else if (status === "NOT_PAID") styles = "bg-red-50 text-red-700 border-red-200";
  
  // PACKING
  else if (status === "PACKED") styles = "bg-blue-100 text-blue-700 border-blue-200";
  else if (status === "PACKING") styles = "bg-indigo-100 text-indigo-700 border-indigo-200";
  else if (status === "NOT_READY") styles = "bg-slate-100 text-slate-600 border-slate-200";

  // PROCUREMENT
  else if (status === "ARRIVED") styles = "bg-teal-100 text-teal-700 border-teal-200";
  else if (status === "ORDERED") styles = "bg-purple-100 text-purple-700 border-purple-200";
  else if (status === "TO_BUY") styles = "bg-orange-100 text-orange-700 border-orange-200";

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wide",
      styles,
      className
    )}>
      {label}
    </span>
  );
}
