import { cn } from "@/lib/utils";
import React, { ComponentPropsWithoutRef } from "react";

export function HeaderShell({
  className,
  ...props
}: ComponentPropsWithoutRef<"header">) {
  return (
    <header
      className={cn(
        "flex h-header w-full shrink-0 flex-row items-center border-b border-border px-8 bg-white glass",
        className,
      )}
      {...props}
    />
  );
}
