import React from "react";
import cn from "../utils/cn";

function EmptyState({
  children,
  label,
  description,
  className,
  size = "lg",
}: {
  children?: React.ReactNode;
  label?: string;
  description?: string;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <div className={cn("container max-w-2xl p-3", className)}>
      <div className="text-center">
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-gradient-to-t from-slate-200 to-slate-100",
            size === "sm" ? "w-12 h-12 mb-2" : "w-16 h-16 mb-4"
          )}
        >
          <svg className="w-5 h-6 fill-current" viewBox="0 0 20 24">
            <path
              className="text-slate-500 dark:text-slate-600"
              d="M10 10.562l9-5-8.514-4.73a1 1 0 00-.972 0L1 5.562l9 5z"
            />
            <path
              className="text-slate-300 dark:text-slate-400"
              d="M9 12.294l-9-5v10.412a1 1 0 00.514.874L9 23.294v-11z"
            />
            <path
              className="text-slate-400 dark:text-slate-500"
              d="M11 12.294v11l8.486-4.714a1 1 0 00.514-.874V7.295l-9 4.999z"
            />
          </svg>
        </div>
        <h2
          className={cn(
            "text-slate-800 font-bold mb-1 dark:text-slate-100",
            size === "sm" ? "text-lg" : "text-2xl"
          )}
        >
          {label}
        </h2>
        <div className={cn("mb-3", size === "sm" ? "text-sm" : "text-base")}>
          {description}
        </div>
        {children && (
          <div className="flex items-center justify-center gap-2 flex-nowrap">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
