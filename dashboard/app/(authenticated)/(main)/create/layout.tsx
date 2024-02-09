import React from "react";
import { CreateCopilotProvider } from "./CreateCopilotProvider";
import { HeaderShell } from "@/components/domain/HeaderShell";

export default function CreateNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CreateCopilotProvider>
      <div className="flex size-full flex-col bg-accent">
        <HeaderShell>
          <h2 className="text-lg font-bold">Create New</h2>
        </HeaderShell>
        <div className="w-full flex-1">{children}</div>
      </div>
    </CreateCopilotProvider>
  );
}
