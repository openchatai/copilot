"use client";
import React from "react";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { useCopilot } from "../../_context/CopilotProvider";
import _ from "lodash";
import { Controller, FlowArena, useController } from "@/components/domain/flows-editor";
import { Button } from "@/components/ui/button";
import { useIsEditing } from "./_parts/useIsEditing";
import { EmptyBlock } from "@/components/domain/EmptyBlock";

function SaveBtn() {
  const { state } = useController();
  const [isEditing, workflowId] = useIsEditing();
  return isEditing ? <Button onClick={() => console.log(state)}>Save</Button> : null
}

function Header() {
  const { name: copilotName } = useCopilot();
  return (
    <HeaderShell className="justify-between gap-2">
      <h1 className="text-lg font-bold text-accent-foreground">
        {copilotName}'s flows
      </h1>
      <div>
        <SaveBtn />
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