import React from "react";
import { WorkflowsList } from "./_parts/WorkflowsList";
import { AddFlowModal } from "./_parts/AddFlowModal";

type Props = {
  children: React.ReactNode;
  params: {
    copilot_id: string;
  };
};

export default function FlowsLayout({
  children,
  params: { copilot_id },
}: Props) {
  const flowsBase = `/copilot/${copilot_id}/flows`;

  return (
    <div className="flex h-full w-full">
      <aside className="flex h-full w-aside shrink-0 flex-col justify-between overflow-hidden border-r border-border bg-primary-foreground">
        <div className="flex-center h-header w-full justify-start border-b border-r border-border bg-primary-foreground px-4">
          <h2 className="text-lg font-bold">Flows</h2>
        </div>
        <div className="flex h-full w-full flex-1 flex-col items-center justify-between space-y-4 overflow-auto px-0 py-4">
          <div className="w-full flex-1">
            <WorkflowsList copilot_id={copilot_id} />
          </div>
          <footer className="w-full px-4">
            <AddFlowModal />
          </footer>
        </div>
      </aside>
      {children}
    </div>
  );
}
