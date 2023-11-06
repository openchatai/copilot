"use client";
import React, { useState } from "react";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { useCopilot } from "../../_context/CopilotProvider";
import useSwr, { mutate } from "swr";
import { getSwaggerByBotId } from "@/data/swagger";
import { Button } from "@/components/ui/button";
import {
  createWorkflowByBotId,
  deleteWorkflowById,
  getWorkflowById,
} from "@/data/flow";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import _ from "lodash";
import { useIsEditing } from "./_parts/useIsEditing";
import {
  Controller,
  FlowArena,
  transformPaths,
  useController,
} from "@/components/domain/flows-editor";

function Header() {
  // editing => workflow_id // creating => undefined
  const [isEditing, workflow_id] = useIsEditing();
  const { replace } = useRouter();
  const { id: copilotId, name: copilotName } = useCopilot();
  const {
    loadPaths,
    reset: resetFlowEditor,
    getData,
    loadFlows,
    state,
  } = useController();
  useSwr(workflow_id, getWorkflowById, {
    onSuccess: (data) => {
      const first = _.first(data.data.flows);
      if (first) {
        console.log(first);
        // @ts-ignore
        loadFlows([first]);
      }
    },
  });
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
  console.log(state);
  const [loading, setLoading] = useState(false);
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
    const firstFlow = _.first(getData().flows);
    if (firstFlow) {
      setLoading(true);
      try {
        const { data } = await createWorkflowByBotId(copilotId, getData());
        if (data.workflow_id) {
          toast({
            title: "Workflow created",
            description: "Your workflow has been created.",
            variant: "success",
          });
          replace(
            `/copilot/${copilotId}/flows/?workflow_id=${data.workflow_id}`,
            {
              scroll: false,
            },
          );
          mutate(copilotId + "/workflows");
        }
      } catch (error) {
        toast({
          title: "Workflow not created",
          description: "Something went wrong.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: "Workflow not created",
        description: "You need at least one flow to create a workflow.",
        variant: "destructive",
      });
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
export default function FlowsPage() {
  return (
    // @ts-ignore
    <Controller maxFlows={1}>
      <div className="flex h-full w-full flex-col">
        <Header />
        <div className="relative flex h-full w-full flex-1 items-start justify-between">
          <FlowArena />
        </div>
      </div>
    </Controller>
  );
}
