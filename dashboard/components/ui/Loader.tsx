import React from "react";
import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="p-2 rounded-full bg-white">
      <Loader2 className="w-10 h-10 text-accent-foreground animate-spin" />
    </div>
  );
}
