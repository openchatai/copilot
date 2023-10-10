"use client";
import React from "react";
import {
  CodePreview,
  Controller,
  FlowArena,
  useController,
  transformPaths,
  trasnformEndpointNodesData,
} from "@openchatai/copilot-flows-editor";
import "@openchatai/copilot-flows-editor/dist/style.css";
import { Button } from "@/ui/components/Button";
import { useBotData } from "@/ui/providers/BotDataProvider";
import { getSwaggerByBotId } from "api/swagger";
import useSWR from "swr";
import { createWorkflowByBotId } from "api/flows";
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
function Header({ bot_id }: { bot_id: string }) {
  const { bot } = useBotData();
  const {
    state: { flows, activeFlowId, paths },
    loadPaths,
  } = useController();
  const activeFlow = flows?.filter((flow) => flow.id === activeFlowId)?.[0];
  useSWR(
    bot_id + "/swagger",
    async () => {
      const { data } = await getSwaggerByBotId(bot_id);
      console.log(data.paths);
      return transformPaths(data.paths);
    },
    {
      onSuccess: (data) => {
        loadPaths(data);
      },
    }
  );
  async function handleSave() {
    const data = {
      opencopilot: "0.1",
      info: {
        title: "My OpenCopilot definition",
        version: "1.0.0",
      },
      flows: flows.map((flow) => ({
        ...flow,
        steps: trasnformEndpointNodesData(flow.steps),
      })),
    };
    const resp = await createWorkflowByBotId(bot_id, data);
    console.log(resp);
  }
  return (
    <div className="px-4 py-2 bg-white flex items-center justify-between w-full">
      <div className="flex items-center">
        <h1 className="text-lg font-bold">{bot?.name}</h1>
        {activeFlow && (
          <>
            <span className="mx-0.5 text-xl">/</span>
            <h2 className="text-sm text-gray-500 font-semibold">
              {activeFlow.name}
            </h2>
          </>
        )}
      </div>
      <Button variant={{ intent: "primary", size: "sm" }} onClick={handleSave}>
        Save
      </Button>
    </div>
  );
}

export default function FlowsPage({
  params: { bot_id },
}: {
  params: {
    bot_id: string;
  };
}) {
  return (
    <>
      <style jsx global>{`
        [data-container="bot-layout"] {
          padding: 0 !important;
        }
      `}</style>
      <Controller>
        <div className="h-full absolute inset-0 overflow-hidden flex flex-col items-start">
          <Header bot_id={bot_id} />
          <div className="w-full h-full flex items-start justify-between relative flex-1">
            <FlowArena />
            <CodePreview />
          </div>
        </div>
      </Controller>
    </>
  );
}
