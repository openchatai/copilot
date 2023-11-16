import { EmptyBlock } from "@/components/domain/EmptyBlock";
import React from "react";

export function CopilotNotFound() {
  return (
    <div className="flex-center h-full w-full">
      <EmptyBlock Imagesize={100}>
        <h2 className="text-center text-xl font-semibold">Copilot not found</h2>
      </EmptyBlock>
    </div>
  );
}
