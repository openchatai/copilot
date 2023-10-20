"use client";
import React from "react";
import {
  CodePreview,
  Controller,
  FlowArena,
  useController,
  transformPaths,
} from "@openchatai/copilot-flows-editor";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { useCopilot } from "../../_context/CopilotProvider";
import useSwr from "swr";
import { getSwaggerByBotId } from "@/data/swagger";
import { Button } from "@/components/ui/button";
import { getWorkflowsByBotId } from "@/data/flow";
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

function Header() {
  const { id: copilotId, name: copilotName } = useCopilot();
  const { loadPaths } = useController();
  useSwr(
    copilotId + "swagger",
    async () => await getSwaggerByBotId(copilotId),
    {
      onSuccess: (data) => {
        loadPaths(transformPaths(data.data.paths));
      },
    },
  );
  return (
    <HeaderShell className="justify-between gap-2 ">
      <h1 className="text-lg font-bold text-accent-foreground">
        {copilotName}
      </h1>
      <div>
        <Button>Save</Button>
      </div>
    </HeaderShell>
  );
}

export default function FlowsPage({
  params: { copilot_id },
}: {
  params: { copilot_id: string };
}) {
  const { data } = useSwr(copilot_id + "/workflows", async () => await getWorkflowsByBotId(copilot_id));
  console.log(data);
  return (
    <Controller
      initialState={{
        flows: [],
        paths: [],
      }}
    >
      <div className="flex h-full w-full flex-col">
        <Header />
        <div className="relative flex h-full w-full flex-1 items-start justify-between">
          <FlowArena />
          <CodePreview />
        </div>
      </div>
    </Controller>
  );
}
