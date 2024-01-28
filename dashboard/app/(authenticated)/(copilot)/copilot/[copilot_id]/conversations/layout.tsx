import React from "react";
import { ListConversations } from "./_parts/ListConverations";
import { HeaderShell } from "@/components/domain/HeaderShell";

type Props = {
  children: React.ReactNode;
  params: {
    copilot_id: string;
  };
};

export default function SettingsLayout({ children, params }: Props) {
  const copilotBase = `/copilot/${params.copilot_id}/conversations`;
  return (
    <div className="flex h-full flex-row overflow-hidden">
      <div className="flex h-full w-full max-w-xs shrink-0 flex-col items-start border-r bg-primary-foreground">
        <HeaderShell className="px-4">
          <h1 className="text-lg font-bold text-secondary-foreground">
            Conversations
          </h1>
        </HeaderShell>
        <ListConversations />
      </div>
      <div className="h-full flex-1 overflow-auto">{children}</div>
    </div>
  );
}
