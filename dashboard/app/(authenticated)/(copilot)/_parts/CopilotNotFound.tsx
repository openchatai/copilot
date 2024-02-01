import { EmptyBlock } from "@/components/domain/EmptyBlock";
import React from "react";

export function CopilotNotFound() {
  return (
    <div className="flex-center h-full w-full">
      <div className="bg-white py-5 px-10 border rounded-lg">
        <EmptyBlock Imagesize={100}>
          <h2 className="text-center text-2xl font-bold">Copilot not found</h2>
        </EmptyBlock>
      </div>
    </div>
  );
}
