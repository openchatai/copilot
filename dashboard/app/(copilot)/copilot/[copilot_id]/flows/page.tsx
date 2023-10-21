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
import { HeaderShell } from "@/components/domain/HeaderShell";
import { useCopilot } from "../../_context/CopilotProvider";
import useSwr from "swr";
import { getSwaggerByBotId } from "@/data/swagger";
import { Button } from "@/components/ui/button";
import {
  createWorkflowByBotId,
  deleteWorkflowById,
  getWorkflowsByBotId,
} from "@/data/flow";
import { useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import _ from "lodash";

function Header() {
  const { id: copilotId, name: copilotName } = useCopilot();
  const { loadPaths, state } = useController();
  const saerchParams = useSearchParams();
  const workflow_id = saerchParams.get("workflow_id");
  // editing => workflow_id // creating => undefined
  const isEditing = !!workflow_id;

  useSwr(
    copilotId + "swagger",
    async () => await getSwaggerByBotId(copilotId),
    {
      onSuccess: (data) => {
        loadPaths(transformPaths(data.data.paths));
      },
    },
  );

  async function handleSave() {}
  async function handleDelete() {}

  async function handleCreate() {
    if (isEditing) return;
    const firstFlow = _.first(state.flows);
    const steps = trasnformEndpointNodesData(firstFlow?.steps || []);

    const { data } = await createWorkflowByBotId(copilotId, {
      opencopilot: "0.1",
      info: {
        title: "My OpenCopilot definition",
        version: "1.0.0",
      },
      flows: [
        {
          name: firstFlow?.name,
          description: firstFlow?.description,
          steps: steps.map((step) => ({
            operation: "call",
            stepId: step.id,
            open_api_operation_id: step.operationId,
          })),
          requires_confirmation: true,
          on_success: [{}],
          on_failure: [{}],
        },
      ],
    });
    if (data.workflow_id) {
      toast({
        title: "Workflow created",
        description: "Your workflow has been created.",
        variant: "success",
      });
    }
  }
  return (
    <HeaderShell className="justify-between gap-2 ">
      <h1 className="text-lg font-bold text-accent-foreground">
        {copilotName}
      </h1>
      {isEditing ? (
        <div className="space-x-1">
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={handleDelete} variant="destructive">
            Delete
          </Button>
        </div>
      ) : (
        <div className="space-x-1">
          <Button onClick={handleCreate}>Create</Button>
        </div>
      )}
    </HeaderShell>
  );
}

export default function FlowsPage({
  params: { copilot_id },
}: {
  params: { copilot_id: string };
}) {
  useSwr(
    copilot_id + "/workflows",
    async () => await getWorkflowsByBotId(copilot_id),
  );
  return (
    // @ts-ignore
    <Controller maxFlows={1}>
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
