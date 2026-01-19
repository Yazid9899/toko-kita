import type { InputHTMLAttributes } from "react";
import { cx } from "../lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="text-slate-700">{label}</span>
      <input
        id={inputId}
        className={cx(
          "rounded border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none",
          className
        )}
        {...props}
      />
    </label>
  );
}
