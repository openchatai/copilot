import { cn } from "@/lib/utils"
import React from "react"

function Skeleton({
  className,
  isLoading,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { isLoading?: boolean }) {
  if (!isLoading) {
    return <>{children}</>
  }
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
