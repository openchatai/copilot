"use client";
import React from "react";
import {
  CodePreview,
  Controller,
  FlowArena,
} from "@openchatai/copilot-flows-editor";
import { HeaderShell } from "@/components/domain/HeaderShell";
const def = {
  opencopilot: "0.1",
  info: {
    title: "My OpenCopilot definition",
    version: "1.0.0",
  },
  flows: [
    {
      name: "New Flow",
      description: "A flow that does something",
      requires_confirmation: true,
      steps: [
        {
          operation: "call",
          stepId: "lnjcay9d8z4qln8l0i2",
          open_api_operation_id: "findPetsByStatus",
          parameters: [
            {
              description:
                "Status values that need to be considered for filter",
              explode: true,
              in: "query",
              name: "status",
              required: false,
              schema: {
                default: "available",
                enum: ["available", "pending", "sold"],
                type: "string",
              },
            },
          ],
        },
        {
          operation: "call",
          stepId: "lnjcazxlp8epjzhngie",
          open_api_operation_id: "updatePet",
        },
      ],
    },
  ],
};

export default function FlowsPage({
  params: { bot_id },
}: {
  params: {
    bot_id: string;
  };
}) {
  return (
    <Controller>
      <div className="flex h-full w-full flex-col">
        <HeaderShell>
          <h1 className="text-lg font-bold text-accent-foreground">
            Copilot134
          </h1>
        </HeaderShell>
        <div className="relative flex h-full w-full flex-1 items-start justify-between">
          <FlowArena />
          <CodePreview />
        </div>
      </div>
    </Controller>
  );
}
