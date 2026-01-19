import type { ButtonHTMLAttributes } from "react";
import { cx } from "../lib/utils";

const baseStyles =
  "inline-flex items-center justify-center rounded border border-slate-200 px-4 py-2 text-sm font-medium transition";

const variants = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  ghost: "bg-white text-slate-700 hover:bg-slate-100"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export default function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={cx(baseStyles, variants[variant], className)} {...props} />;
}
