"use client";
import React, { useState } from "react";
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
import useSwr, { mutate } from "swr";
import { getSwaggerByBotId } from "@/data/swagger";
import { Button } from "@/components/ui/button";
import { createWorkflowByBotId, deleteWorkflowById } from "@/data/flow";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import _ from "lodash";

function Header() {
  // editing => workflow_id // creating => undefined

  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const { id: copilotId, name: copilotName } = useCopilot();
  const { loadPaths, state, reset: resetFlowEditor } = useController();
  const workflow_id = searchParams.get("workflow_id");
  const isEditing = !!workflow_id;
  const [loading, setLoading] = useState(false);
  const { isLoading: isSwaggerLoading, mutate: mutateSwagger } = useSwr(
    copilotId + "swagger_file",
    async () => getSwaggerByBotId(copilotId),
    {
      onSuccess: (data) => {
        if (!data) return;
        loadPaths(transformPaths(data.data.paths));
      },
    },
  );
  const isLoading = isSwaggerLoading || loading;

  async function handleSave() {}
  async function handleDelete() {
    if (!isEditing || !workflow_id) return;
    setLoading(true);
    const { data } = await deleteWorkflowById(workflow_id);
    if (data) {
      toast({
        title: "Workflow deleted",
        description: "Your workflow has been deleted.",
        variant: "success",
      });
      replace(`/copilot/${copilotId}/flows`, {
        scroll: false,
      });
      mutate(copilotId + "/workflows");
      setLoading(false);
    }
  }
  async function handleCreate() {
    if (isEditing) return;
    setLoading(true);
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
      replace(`/copilot/${copilotId}/flows/?workflow_id=${data.workflow_id}`, {
        scroll: false,
      });
      mutate(copilotId + "/workflows");
      setLoading(false);
    }
  }
  return (
    <HeaderShell className="justify-between gap-2">
      <h1 className="text-lg font-bold text-accent-foreground">
        {copilotName}
      </h1>
      {isEditing ? (
        <div className="space-x-1">
          <Button onClick={handleSave} disabled={isLoading}>
            Save
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
          >
            Delete
          </Button>
        </div>
      ) : (
        <div className="space-x-1">
          <Button onClick={handleCreate} disabled={isLoading}>
            Create
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              confirm("Are you sure??") && resetFlowEditor();
              mutateSwagger();
            }}
          >
            Reset
          </Button>
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
