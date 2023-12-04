"use client";
import React, { useState } from "react";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { useCopilot } from "../../_context/CopilotProvider";
import _ from "lodash";
import { Controller, FlowArena, useController } from "@/components/domain/flows-editor";
import { Button } from "@/components/ui/button";
import { useIsEditing } from "./_parts/useIsEditing";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { mutateFlows } from "./_parts/WorkflowsList";
import useSWR, { mutate } from "swr";
import { deleteWorkflowById, getWorkflowById, updateWorkflowById } from "@/data/flow";
import { toast } from "@/components/ui/use-toast";

function SaveBtn() {
  const { state } = useController();
  const [isEditing, workflowId] = useIsEditing();
  const [loading, setLoading] = useState(false)
  async function handleSave() {
    if (!workflowId || !state.name || !state.description) return;
    try {
      setLoading(true)
      const { data } = await updateWorkflowById(workflowId, {
        ...state,
        name: state.name,
        description: state.description,
        steps: state.steps,
        info: {
          version: "0.0.1"
        },
        requires_confirmation: true,
      })
      if (data) {
        mutate(data._id)
        toast({
          title: "Saved successfully",
          variant: "success"
        })
      }
    } catch (error) {
      setLoading(false)
    }
  }
  return isEditing ? <Button loading={loading} onClick={handleSave}>Save</Button> : null
}
function DeleteBtn() {
  const [isEditing, workflowId, reset] = useIsEditing();
  const { id: copilotId } = useCopilot();
  const [loading, setLoading] = useState(false)
  async function handleDelete() {
    const confirm = window.confirm("Are you sure you want to delete this workflow?");
    if (!confirm || !workflowId) return;
    try {
      setLoading(true)
      const resp = await deleteWorkflowById(workflowId);
      if (resp.status === 200) {
        mutateFlows(copilotId)
        reset()
      }
    } catch (error) {
      setLoading(false)
    }
    setLoading(false)
  }

  return isEditing ? <Button loading={loading} variant='destructive' onClick={handleDelete}>Delete</Button> : null

}

function Header() {
  const { name: copilotName } = useCopilot();
  const [, workflowId] = useIsEditing();
  const { setData } = useController();
  useSWR(workflowId, getWorkflowById, {
    onSuccess: ({ data }) => {
      setData({
        name: data.name,
        description: data.description,
        steps: data.steps,
      });
    }
  })
  return (
    <HeaderShell className="justify-between gap-2">
      <h1 className="text-lg font-bold text-accent-foreground">
        {copilotName}'s flows
      </h1>
      <div className="space-x-2">
        <SaveBtn />
        <DeleteBtn />
      </div>
    </HeaderShell>
  );
}
export default function FlowsPage({
  searchParams: { workflow_id },
}: {
  searchParams: {
    workflow_id?: string;
  };
}) {
  console.log("workflow_id", workflow_id);
  return (
    <Controller>
      <div className="flex h-full w-full flex-col">
        <Header />
        <div className="relative flex h-full w-full flex-1 justify-center">
          {
            workflow_id ? <FlowArena /> :
              <EmptyBlock Imagesize={150}>
                <h2>Select or create workflow to start editing</h2>
              </EmptyBlock>
          }

        </div>
      </div>
    </Controller>
  );
}