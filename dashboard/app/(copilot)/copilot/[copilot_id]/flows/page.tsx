"use client";
import React, { useState } from "react";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { useCopilot } from "../../_context/CopilotProvider";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import {
  createWorkflowByBotId,
  deleteWorkflowById,
  updateWorkflowById,
} from "@/data/flow";
import { toast } from "@/components/ui/use-toast";
import _ from "lodash";
import {
  FlowArena,
  useController,
} from "@/components/domain/flows-editor";

function useSaveFlow(id?: string) {
  const { getData } = useController();
  const [loading, setLoading] = useState(false);
  async function handleSave() {
    if (!id) return;
    setLoading(true);
    const { data } = await updateWorkflowById(id, getData());
    if (data) {
      toast({
        title: "Workflow updated",
        description: "Your workflow has been updated.",
        variant: "success",
      });
      setLoading(false);
    }
  }

  return [handleSave, loading] as const
}
function useDeleteFlow(id: string) {
  const [loading, setLoading] = useState(false);
  const { id: copilotId } = useCopilot();
  async function handleDelete() {
    setLoading(true);
    const { data } = await deleteWorkflowById(id);
    if (data) {
      toast({
        title: "Workflow deleted",
        description: "Your workflow has been deleted.",
        variant: "success",
      });
      mutate('flows/' + copilotId);
      setLoading(false);
    }
  }
  return [handleDelete, loading] as const
}
function useCreateFlow() {
  const { getData } = useController();
  const [loading, setLoading] = useState(false);
  const { id: copilotId } = useCopilot();
  async function handleCreate() {
    const firstFlow = _.first(getData().flows);
    console.log("data", getData());
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
  return [handleCreate, loading] as const
}

function SaveFlow({ activeFlowId }: { activeFlowId?: string }) {
  const [save, loading] = useSaveFlow(activeFlowId);
  return <Button loading={loading} onClick={save}> Save </Button>
}
function DeleteFlow({ activeFlowId }: { activeFlowId: string }) {
  const [deleteFlow, loading] = useDeleteFlow(activeFlowId);
  return <Button variant='destructive' loading={loading} onClick={deleteFlow}> Delete </Button>
}
function CreateFlow() {
  const [createFlow, loading] = useCreateFlow();
  return <Button loading={loading} onClick={createFlow}> Create </Button>
}

function Header() {
  const { name: copilotName } = useCopilot();
  const { activeFlow, getData } = useController();
  console.log(getData());
  return (
    <HeaderShell className="justify-between gap-2">
      <h1 className="text-lg font-bold text-accent-foreground">
        {copilotName} {activeFlow?.name && ` - ${activeFlow.name}`}
      </h1>
      <div>
      </div>
    </HeaderShell>
  );
}
export default function FlowsPage() {
  return (
    <div className="flex h-full w-full flex-col">
      <Header />
      <div className="relative flex h-full w-full flex-1 items-start justify-between">
        <FlowArena />
      </div>
    </div>
  );
}