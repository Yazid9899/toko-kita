import type { PropsWithChildren } from "react";
import { cx } from "../lib/utils";

type CardProps = PropsWithChildren<{ className?: string }>;

export default function Card({ className, children }: CardProps) {
  return <div className={cx("rounded-lg border border-slate-200 bg-white p-6", className)}>{children}</div>;
}
