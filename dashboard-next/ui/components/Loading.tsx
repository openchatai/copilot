import React from "react";
import cn from "../utils/cn";
import { CgSpinner } from "react-icons/cg";

export function Loading({
  size = 30,
  wrapperClassName,
  className,
}: {
  size?: number;
  wrapperClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("w-full p-5 flex-center", wrapperClassName)}>
      <CgSpinner
        style={{
          animationDuration: "2s",
        }}
        className={cn(
          "animate-spin transition-transform text-indigo-600 dark:text-white",
          className
        )}
        size={size}
      />
    </div>
  );
}
