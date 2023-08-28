import cn from "@/ui/utils/cn";
import { ComponentPropsWithoutRef, useId } from "react";

export default function CheckBoxInput({
  label,
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<"input">, "type"> & { label?: string }) {
  const id = useId();
  return (
    <div className="flex items-center justify-start w-full gap-2">
      <input
        {...props}
        type="checkbox"
        className={cn(
          "form-checkbox bg-white peer dark:[&:not(:checked)]:bg-slate-900/30 checked:bg-indigo-500 disabled:cursor-not-allowed disabled:dark:border-slate-700 disabled:border-slate-200 disabled:dark:bg-slate-700/20 disabled:bg-slate-100 focus:ring-0 focus:ring-offset-0 dark:disabled:bg-slate-700/30 dark:disabled:border-slate-700 dark:disabled:hover:border-slate-700 rounded dark:hover:[&:not(:checked)]:bg-transparent dark:checked:border-transparent border border-slate-300 focus:border-indigo-300 dark:border-slate-700 dark:focus:border-indigo-500/50",
          className
        )}
        id={id}
      />
      {label && (
        <label
          className="text-sm text-slate-600 dark:text-slate-300 font-medium peer-disabled:cursor-not-allowed"
          htmlFor={id}
        >
          {label}
        </label>
      )}
    </div>
  );
}
