import { cn } from "@/lib/utils";
import React, { Component, ComponentPropsWithoutRef } from "react";

export function HeaderShell({
  className,
  ...props
}: ComponentPropsWithoutRef<"header">) {
  return (
    <header
      className={cn(
        "h-header w-full border-b shrink-0 border-border flex flex-row items-center px-8",
        className
      )}
      {...props}
    />
  );
}
