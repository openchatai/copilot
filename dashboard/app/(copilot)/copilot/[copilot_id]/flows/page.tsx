"use client";
import React from "react";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { useCopilot } from "../../_context/CopilotProvider";
import _ from "lodash";
import { Controller, FlowArena, useController } from "@/components/domain/flows-editor";
import { Button } from "@/components/ui/button";
import { useIsEditing } from "./_parts/useIsEditing";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { mutateFlows } from "./_parts/WorkflowsList";

function SaveBtn() {
  const { state } = useController();
  const [isEditing, workflowId] = useIsEditing();
  return isEditing ? <Button onClick={() => console.log(state)}>Save</Button> : null
}
function DeleteBtn() {
  const [isEditing, workflowId] = useIsEditing();
  const { id: copilotId } = useCopilot();
  async function handleDelete() {
    const confirm = window.confirm("Are you sure you want to delete this workflow?");
    if (!confirm) return;
    console.log("delete");
    mutateFlows(copilotId);
  }

  return isEditing ? <Button variant='destructive' onClick={handleDelete}>Delete</Button> : null

}

function Header() {
  const { name: copilotName } = useCopilot();
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