import React from "react";
import { ListConversations } from "./_parts/ListConverations";

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
        <div className="flex-center h-header shrink-0 justify-start w-full border-b px-6">
          <h1 className="text-lg font-bold text-secondary-foreground">
            Conversations
          </h1>
        </div>
        <ListConversations />
      </div>
      <div className="h-full flex-1 overflow-auto">{children}</div>
    </div>
  );
}
