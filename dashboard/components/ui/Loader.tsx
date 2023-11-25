import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Loader({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-full bg-white p-2", className)}>
      <Loader2 className="h-10 w-10 animate-spin text-accent-foreground" />
    </div>
  );
}
