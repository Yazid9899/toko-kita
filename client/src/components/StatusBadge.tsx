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

export const baseStatusBadgeClasses =
  "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap";

export const formatStatusLabel = (status: string) => status.replace(/_/g, " ");

export const getStatusBadgeStyles = (status: string) => {
  let styles = "bg-slate-100 text-slate-600";

  // PAYMENT
  if (status === "PAID") styles = "bg-emerald-100 text-emerald-700";
  else if (status === "DOWN_PAYMENT") styles = "bg-amber-100 text-amber-700";
  else if (status === "NOT_PAID") styles = "bg-red-100 text-red-700";

  // PACKING
  else if (status === "PACKED") styles = "bg-blue-100 text-blue-700";
  else if (status === "PACKING") styles = "bg-[#5C6AC4]/10 text-[#5C6AC4]";
  else if (status === "NOT_READY") styles = "bg-slate-100 text-slate-500";

  // PROCUREMENT
  else if (status === "ARRIVED") styles = "bg-emerald-100 text-emerald-700";
  else if (status === "ORDERED") styles = "bg-amber-100 text-amber-700";
  else if (status === "TO_BUY") styles = "bg-[#00848E]/10 text-[#00848E]";

  return styles;
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const styles = getStatusBadgeStyles(status);
  const label = formatStatusLabel(status);

  return (
    <span className={cn(
      baseStatusBadgeClasses,
      styles,
      className
    )} data-testid={`badge-status-${status.toLowerCase()}`}>
      {label}
    </span>
  );
}
