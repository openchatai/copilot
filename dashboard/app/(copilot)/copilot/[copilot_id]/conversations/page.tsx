import { HeaderShell } from "@/components/domain/HeaderShell";
import React from "react";
import { ConversationAside } from "./_parts/ConversationAside";
import { ChatScreen } from "./_parts/ChatScreen";

export default function Conversations() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden [&_input]:font-semibold">
      <div className="flex flex-1 items-start overflow-auto bg-accent/25">
        <div className="flex h-full flex-1 flex-col overflow-hidden bg-white">
          <HeaderShell className="items-center justify-between">
            <h1 className="text-sm font-semibold text-secondary-foreground">
              Conversation
            </h1>
          </HeaderShell>
          <ChatScreen />
        </div>
        <ConversationAside />
      </div>
    </div>
  );
}
